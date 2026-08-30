"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

interface BoiNaBrasaStickyBarProps {
  className: string;
  phoneHref: string;
  mapsHref: string;
}

// Same pattern as OFTStickyBar/BeautyStickyBar: hidden at the very top of the
// page, reveals once the user scrolls past REVEAL_AT, hides again on
// returning to the top — extracted into its own client component (rather
// than making the whole profile a client component) purely so useScrollReveal
// has somewhere to live. Only Ligar + Como chegar — "Pedir" (Glovo) stays in
// the main quick-actions grid and the menu section, not duplicated here.
const REVEAL_AT = 64;

export function BoiNaBrasaStickyBar({ className, phoneHref, mapsHref }: BoiNaBrasaStickyBarProps) {
  const visible = useScrollReveal(REVEAL_AT);

  if (!visible) return null;

  return (
    <nav className={`profile-action-bar ${className}`} aria-label="Ações persistentes">
      <div>
        <a href={phoneHref}>Ligar</a>
        <a href={mapsHref} target="_blank" rel="noopener noreferrer" aria-label="Obter direções para o Boi na Brasa">Como chegar</a>
      </div>
    </nav>
  );
}
