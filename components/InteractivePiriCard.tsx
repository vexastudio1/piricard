"use client";

import Image from "next/image";
import { RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

const PIRILIGHT_CARD_ASSET = "/piricard-print/jobs/pirilight/pirilight/pirilight";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface PointerState {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  interacting: boolean;
  rect: DOMRect;
}

export function InteractivePiriCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const setRestingPosition = () => {
    if (cardRef.current) {
      cardRef.current.style.cssText = "--card-tilt-x:-3deg;--card-tilt-y:7deg;--card-light-x:38%;--card-light-y:28%";
    }
  };

  const release = (pointerId: number, cancelled = false) => {
    const active = pointer.current;
    if (!active || active.id !== pointerId) return;

    if (!cancelled && active.interacting && Math.abs(active.currentX - active.startX) > 110) {
      setFlipped((current) => !current);
    }

    pointer.current = null;
    setDragging(false);
    setRestingPosition();
  };

  return (
    <div className="piricard-demo">
      <div className="piricard-demo-float">
        <div
          className={`piricard-demo-scene${dragging ? " is-dragging" : ""}${flipped ? " is-flipped" : ""}`}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            pointer.current = {
              id: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              currentX: event.clientX,
              interacting: false,
              rect: event.currentTarget.getBoundingClientRect(),
            };
          }}
          onPointerMove={(event) => {
            const active = pointer.current;
            if (!active || active.id !== event.pointerId) return;

            const deltaX = event.clientX - active.startX;
            const deltaY = event.clientY - active.startY;
            active.currentX = event.clientX;

            if (!active.interacting) {
              const travelled = Math.hypot(deltaX, deltaY);
              if (travelled < 8) return;
              if (event.pointerType === "touch" && Math.abs(deltaY) >= Math.abs(deltaX) * 0.9) {
                pointer.current = null;
                return;
              }
              active.interacting = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragging(true);
            }

            event.preventDefault();
            const { rect } = active;
            if (cardRef.current) {
              cardRef.current.style.cssText = [
                `--card-tilt-x:${clamp(-deltaY / 14, -12, 12)}deg`,
                `--card-tilt-y:${clamp(deltaX / 12, -18, 18)}deg`,
                `--card-light-x:${clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100)}%`,
                `--card-light-y:${clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100)}%`,
              ].join(";");
            }
          }}
          onPointerUp={(event) => release(event.pointerId)}
          onPointerCancel={(event) => release(event.pointerId, true)}
          aria-label={`PiriCard real da PiriLight, ${flipped ? "verso" : "frente"} visível`}
        >
          <div className="piricard-demo-card" ref={cardRef}>
            <div className="piricard-demo-face piricard-demo-front">
              <Image
                src={`${PIRILIGHT_CARD_ASSET}-front.png`}
                alt="Frente do PiriCard real da PiriLight"
                fill
                sizes="(max-width: 640px) 15.5rem, 20rem"
                draggable={false}
              />
            </div>

            <div className="piricard-demo-face piricard-demo-back">
              <Image
                src={`${PIRILIGHT_CARD_ASSET}-back.png`}
                alt="Verso do PiriCard real da PiriLight com QR Code"
                fill
                sizes="(max-width: 640px) 15.5rem, 20rem"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="piricard-demo-controls">
        <span>Arrasta para explorar</span>
        <button type="button" onClick={() => setFlipped((current) => !current)} aria-pressed={flipped}>
          <RotateCcw aria-hidden="true" size={16} />
          {flipped ? "Ver frente" : "Ver verso"}
        </button>
      </div>
    </div>
  );
}
