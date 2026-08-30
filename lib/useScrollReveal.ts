"use client";

import { useEffect, useState } from "react";

/**
 * Shared floating-action-bar visibility behavior: hidden at the very top of
 * the page, appears after a small deliberate scroll past `threshold`, and
 * disappears again on returning to the top. Extracted from OFTStickyBar (the
 * first PiriCard to use this pattern) so every bespoke profile's sticky bar
 * shares one scroll listener instead of each reimplementing its own.
 */
export function useScrollReveal(threshold = 64): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return visible;
}
