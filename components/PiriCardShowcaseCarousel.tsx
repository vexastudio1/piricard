"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PiriCardShowcaseItem } from "@/lib/piricard-cards";
import styles from "./PiriCardShowcaseCarousel.module.css";

interface PiriCardShowcaseCarouselProps {
  cards: PiriCardShowcaseItem[];
}

// Two entirely different geometry models, not one shared formula:
//
// - Desktop keeps the existing 3D arc (rotateY + translateZ via perspective)
//   — unchanged from before this task, since desktop was never reported broken.
// - Mobile uses a flat "peek" model (translateX + scale + opacity only, no
//   rotation/depth). The previous mobile version reused the arc formula, and
//   the rotateY it applied to a card as wide as ~80% of the stage is exactly
//   what let neighbouring cards' own interior content (labels, icons) show at
//   an angle beside the active card instead of a clean, flat sliver — the
//   reported "leaking" bug. Flat + `overflow: hidden` on the stage (below)
//   fixes it: neighbours can only ever show a hard-clipped, front-on strip of
//   their own surface.
//
// MOBILE_BREAKPOINT_PX mirrors the CSS module's own
// `@media (min-width: 640px)` cutoff, so geometry and layout switch tiers together.
const MOBILE_BREAKPOINT_PX = 640;

const DESKTOP_GEOMETRY = {
  angleStepDeg: 30, // rotateY step per whole card of distance from center
  arcRadiusXRatio: 0.46, // horizontal spread, as a fraction of stage width
  arcRadiusZRatio: 0.78, // depth recession, as a fraction of stage width
  minScale: 0.72,
  scaleFalloff: 0.16, // scale lost per whole card of distance
  opacityFalloff: 0.34,
  opacityFalloffSq: 0.05,
};
const MOBILE_GEOMETRY = {
  xStepRatio: 0.52, // translateX per whole card of distance, as a fraction of stage width
  minScale: 0.88, // within the spec's ~0.86-0.93 range for prev/next
  scaleFalloff: 0.12,
  opacityFalloff: 0.5, // linear: opacity 1 at rel 0, ~0.5 at rel 1, 0 by rel 2 — matches "far cards fully hidden"
};

const MAX_ANGLE_DEG = 78; // clamp so far cards never rotate past near-edge-on
const DRAG_SENSITIVITY = 0.62; // fraction of stage width = one full card step
const SETTLE_MS = 420;
const SETTLE_MS_REDUCED = 1;
const TAP_MOVE_THRESHOLD = 6; // px — below this, a release counts as a tap, not a drag
const FLICK_VELOCITY_THRESHOLD = 0.55; // px/ms — fast release nudges one extra step

function easeOutCubic(t: number): number {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

/** Shortest signed distance from `position` to card `index` on a circular track of `count` cards. */
function circularRelative(index: number, position: number, count: number): number {
  let rel = (index - position) % count;
  if (rel > count / 2) rel -= count;
  if (rel < -count / 2) rel += count;
  return rel;
}

function normalizeIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

export function PiriCardShowcaseCarousel({ cards }: PiriCardShowcaseCarouselProps) {
  const router = useRouter();
  const count = cards.length;

  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stageWidthRef = useRef(0);

  // Continuous, non-React-rendered drag state. Mutated every frame during a
  // drag/settle; only ever read back into React state (`activeIndex`) once a
  // gesture actually settles on a new card, so this component re-renders a
  // handful of times per interaction, not once per pointermove.
  const positionRef = useRef(0);
  const pointerRef = useRef<{ id: number; startX: number; startY: number; startPosition: number; lastX: number; lastT: number; velocity: number; moved: boolean } | null>(null);
  const rafRef = useRef<number | null>(null);
  const settleRef = useRef<{ from: number; to: number; start: number; duration: number } | null>(null);
  const reducedMotionRef = useRef(false);
  // Set the instant a drag gesture ends; read (and cleared) by the click that
  // the browser fires right after pointerup, so a drag-release never also
  // triggers that card's onClick navigation.
  const suppressClickRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);

  const activeCard = cards[activeIndex];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;
    const onChange = () => { reducedMotionRef.current = media.matches; };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Measured on mount/resize only — never inside the drag/animation loop, so
  // there is no getBoundingClientRect() call on the hot path. Layout effect
  // (not a regular effect) so the width is known before the browser paints —
  // otherwise the very first frame would briefly show every card stacked,
  // untransformed, at the top-left corner of the stage.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      stageWidthRef.current = stage.getBoundingClientRect().width;
      // The stage's CSS height is only an estimate (real card height depends
      // on the card's own width % + its fixed aspect-ratio). Read the actual
      // card box — `offsetHeight` reports its laid-out size ignoring our
      // `scale()` transform — and grow the stage to fit it exactly, so the
      // card (always vertically centered in the stage) never visually spills
      // past the stage box into the caption/hint text below it.
      const cardHeight = cardRefs.current[0]?.offsetHeight;
      if (cardHeight) {
        const target = `${cardHeight + 12}px`;
        if (stage.style.height !== target) stage.style.height = target; // avoid a no-op write re-triggering this same ResizeObserver
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const renderFrame = useCallback((position: number) => {
    const width = stageWidthRef.current || 1;
    // Tier is decided by the *viewport*, matching the CSS module's own
    // `@media (min-width: 640px)` breakpoint — not the stage's own pixel
    // width, which stays well under 640px even on desktop (it's only one
    // column of the two-column .piricard-explainer grid, never the full
    // viewport). window.innerWidth is a cached property, not a layout read,
    // so this stays safe to call every animation frame.
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT_PX;
    const radiusX = width * DESKTOP_GEOMETRY.arcRadiusXRatio;
    const radiusZ = width * DESKTOP_GEOMETRY.arcRadiusZRatio;

    for (let i = 0; i < count; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const rel = circularRelative(i, position, count);
      const absRel = Math.abs(rel);

      let x: number, z: number, rotateY: number, scale: number, opacity: number;
      if (isMobile) {
        // Flat peek: pure translateX + scale + opacity, no rotation/depth —
        // see the tuning-constants comment above for why.
        x = rel * width * MOBILE_GEOMETRY.xStepRatio;
        z = 0;
        rotateY = 0;
        scale = Math.max(MOBILE_GEOMETRY.minScale, 1 - absRel * MOBILE_GEOMETRY.scaleFalloff);
        opacity = Math.max(0, 1 - absRel * MOBILE_GEOMETRY.opacityFalloff);
      } else {
        const angleDeg = Math.max(-MAX_ANGLE_DEG, Math.min(MAX_ANGLE_DEG, rel * DESKTOP_GEOMETRY.angleStepDeg));
        const angleRad = (angleDeg * Math.PI) / 180;
        x = Math.sin(angleRad) * radiusX;
        z = -(1 - Math.cos(angleRad)) * radiusZ;
        rotateY = -angleDeg;
        scale = Math.max(DESKTOP_GEOMETRY.minScale, 1 - absRel * DESKTOP_GEOMETRY.scaleFalloff);
        opacity = Math.max(0, Math.min(1, 1 - absRel * DESKTOP_GEOMETRY.opacityFalloff - absRel * absRel * DESKTOP_GEOMETRY.opacityFalloffSq));
      }

      const isNear = absRel < 0.5;
      const isVisible = opacity > 0.02;

      el.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${rotateY}deg) scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.zIndex = String(Math.round(1000 - absRel * 10));
      el.style.pointerEvents = isVisible ? "auto" : "none";
      el.classList.toggle(styles.isActive, isNear);
      el.setAttribute("aria-hidden", isVisible ? "false" : "true");
      el.tabIndex = isNear ? 0 : -1;
    }
  }, [count]);

  // Initial paint + repaint on resize (stage width changed) without moving the track.
  useLayoutEffect(() => {
    renderFrame(positionRef.current);
  }, [renderFrame]);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => renderFrame(positionRef.current));
    observer.observe(stage);
    return () => observer.disconnect();
  }, [renderFrame]);

  const stopAnimation = () => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    settleRef.current = null;
  };

  const settleTo = useCallback((targetIndex: number) => {
    const target = normalizeIndex(Math.round(targetIndex), count);
    stopAnimation();
    const from = positionRef.current;
    // Settle along the shortest circular path, e.g. from 4.8 to 0 goes to 5 (=0), not back down to 0 the long way.
    const to = from + circularRelative(target, from, count);
    const duration = reducedMotionRef.current ? SETTLE_MS_REDUCED : SETTLE_MS;
    settleRef.current = { from, to, start: performance.now(), duration };

    const step = (now: number) => {
      const settle = settleRef.current;
      if (!settle) return;
      const t = Math.min(1, (now - settle.start) / settle.duration);
      const eased = easeOutCubic(t);
      positionRef.current = settle.from + (settle.to - settle.from) * eased;
      renderFrame(positionRef.current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        positionRef.current = normalizeIndex(settle.to, count);
        settleRef.current = null;
        rafRef.current = null;
        setActiveIndex(target);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [count, renderFrame]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    stopAnimation();
    pointerRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: positionRef.current,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = pointerRef.current;
    if (!active || active.id !== event.pointerId) return;

    const deltaX = event.clientX - active.startX;

    if (!active.moved) {
      const deltaY = event.clientY - active.startY;
      const travelled = Math.hypot(deltaX, deltaY);
      if (travelled < TAP_MOVE_THRESHOLD) return; // too small to tell intent yet
      if (Math.abs(deltaY) >= Math.abs(deltaX) * 0.9) { pointerRef.current = null; return; } // vertical gesture — let the page scroll, matching InteractivePiriCard's own axis lock
      active.moved = true;
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* not all pointer sessions support capture — the drag still works fine without it */ }
      setDragging(true);
    }

    event.preventDefault();
    const now = performance.now();
    const dt = now - active.lastT;
    if (dt > 0) active.velocity = (event.clientX - active.lastX) / dt;
    active.lastX = event.clientX;
    active.lastT = now;

    const stepPx = (stageWidthRef.current || 1) * DRAG_SENSITIVITY;
    positionRef.current = active.startPosition - deltaX / stepPx;
    renderFrame(positionRef.current);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = pointerRef.current;
    if (!active || active.id !== event.pointerId) return;
    pointerRef.current = null;
    suppressClickRef.current = active.moved;

    if (!active.moved) return; // clean tap — handled by each card's own onClick
    setDragging(false);

    let target = Math.round(positionRef.current);
    if (Math.abs(active.velocity) > FLICK_VELOCITY_THRESHOLD) {
      target += active.velocity > 0 ? -1 : 1;
    }
    settleTo(target);
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = pointerRef.current;
    if (active && active.id === event.pointerId) {
      pointerRef.current = null;
      setDragging(false);
      settleTo(Math.round(positionRef.current));
    }
  };

  const handleCardActivate = (index: number) => {
    if (suppressClickRef.current) { suppressClickRef.current = false; return; } // a drag just ended — ignore the synthetic click it produces
    if (index === activeIndex) {
      router.push(`/${cards[index].slug}`);
    } else {
      settleTo(index);
    }
  };

  const onKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") { event.preventDefault(); settleTo(activeIndex + 1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); settleTo(activeIndex - 1); }
  };

  const captionMeta = useMemo(() => [activeCard?.category, activeCard?.city].filter(Boolean).join(" · "), [activeCard]);

  if (count === 0) return null;

  return (
    <div className={styles.root}>
      <div
        ref={stageRef}
        className={`${styles.stage}${dragging ? ` ${styles.isDragging}` : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={onPointerCancel}
        onKeyDownCapture={onKeyDownCapture}
        role="group"
        aria-roledescription="carrossel"
        aria-label="PiriCards reais dos negócios do diretório"
      >
        <div className={styles.track}>
          {cards.map((card, index) => (
            <button
              key={card.slug}
              type="button"
              ref={(el) => { cardRefs.current[index] = el; }}
              className={styles.card}
              aria-label={`Ver perfil de ${card.name}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => handleCardActivate(index)}
            >
              <Image
                className={styles.cardImage}
                src={card.frontImage}
                alt={`Frente do PiriCard de ${card.name}`}
                fill
                draggable={false}
                // All 5 cards sit stacked in the same above-the-fold region from the
                // first paint (only their 3D transform differs), so — unlike a real
                // horizontally-scrolling list — none of them is actually offscreen
                // for the browser's lazy-load heuristic. `priority` on every one
                // avoids Next flagging whichever isn't index 0 as an un-eager LCP
                // candidate; five small optimized crops is a non-issue for weight.
                priority
                sizes="(max-width: 639px) 66vw, (max-width: 1099px) 38vw, 13.5rem"
              />
            </button>
          ))}
        </div>

        {count > 1 && (
          <>
            <button type="button" className={`${styles.arrow} ${styles.arrowPrev}`} aria-label="PiriCard anterior" onClick={() => settleTo(activeIndex - 1)}>
              <ChevronLeft aria-hidden="true" size={18} />
            </button>
            <button type="button" className={`${styles.arrow} ${styles.arrowNext}`} aria-label="PiriCard seguinte" onClick={() => settleTo(activeIndex + 1)}>
              <ChevronRight aria-hidden="true" size={18} />
            </button>
          </>
        )}
      </div>

      <div className={styles.caption} aria-live="polite">
        <p className={styles.captionName}>{activeCard?.name}</p>
        {captionMeta && <p className={styles.captionMeta}>{captionMeta}</p>}
      </div>

      {count > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Escolher PiriCard">
          {cards.map((card, index) => (
            <button
              key={card.slug}
              type="button"
              className={`${styles.dot}${index === activeIndex ? ` ${styles.dotActive}` : ""}`}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Ver PiriCard de ${card.name}`}
              onClick={() => settleTo(index)}
            />
          ))}
        </div>
      )}

      <p className={styles.hint} aria-hidden="true">
        <span className={styles.hintArrow}>←</span> Arrasta para explorar <span className={styles.hintArrow}>→</span>
      </p>
    </div>
  );
}
