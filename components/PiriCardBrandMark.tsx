import type { ReactNode } from "react";
import { PiriCardSymbol } from "@/components/icons/PiriCardSymbol";

interface PiriCardBrandMarkProps {
  /** The wordmark markup, e.g. <span>Piri<span>Card</span></span> or <strong>Piri<em>Card</em></strong>. */
  wordmark: ReactNode;
  className?: string;
}

/**
 * Shared icon+wordmark lockup for every "PiriCard" (and PiriLight) brand
 * appearance across the site — profile topbars, the directory header, and
 * the directory footer.
 *
 * The icon is sized in `em`, so it scales with whatever font-size the
 * surrounding wordmark uses (see `.piricard-mark-icon` in globals.css),
 * keeping icon-to-text proportion and spacing consistent everywhere without
 * per-page overrides. Its color comes from `--brand-mark-color` (set by the
 * host context to its theme accent) and falls back to `currentColor`, so a
 * page with a low-contrast accent can just... not set it, and the mark
 * matches the surrounding text color instead.
 */
export function PiriCardBrandMark({ wordmark, className }: PiriCardBrandMarkProps) {
  return (
    <span className={["piricard-mark", className].filter(Boolean).join(" ")}>
      <PiriCardSymbol className="piricard-mark-icon" />
      {wordmark}
    </span>
  );
}
