"use client";

import { useEffect, useState } from "react";
import { Navigation, Phone } from "lucide-react";

interface OFTStickyBarProps {
  className: string;
  businessName: string;
  phoneHref?: string;
  mapsHref?: string;
}

// OFT Racing-only sticky Ligar/Chegar bar. Hidden on initial load and only reveals
// once the user scrolls down meaningfully, so it doesn't duplicate the same actions
// already visible in the hero's quick-actions grid.
const REVEAL_AT = 64;

export function OFTStickyBar({ className, businessName, phoneHref, mapsHref }: OFTStickyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > REVEAL_AT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible || (!phoneHref && !mapsHref)) return null;

  return (
    <nav className={className} aria-label="Ações persistentes">
      <div>
        {phoneHref ? (
          <a href={phoneHref}>
            <Phone aria-hidden="true" />
            <span>Ligar</span>
          </a>
        ) : null}
        {mapsHref ? (
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" aria-label={`Obter direções para ${businessName}`}>
            <Navigation aria-hidden="true" />
            <span>Chegar</span>
          </a>
        ) : null}
      </div>
    </nav>
  );
}
