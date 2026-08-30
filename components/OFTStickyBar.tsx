"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Navigation, Phone } from "lucide-react";

interface OFTStickyBarProps {
  className: string;
  whatsappClassName: string;
  businessName: string;
  phoneHref?: string;
  mapsHref?: string;
  whatsappHref?: string;
}

// OFT Racing-only floating action system: the bottom Ligar/Chegar bar and the
// WhatsApp fab share this single scroll state, so they always appear and
// disappear together. Hidden on initial load and only reveals once the user
// scrolls down meaningfully, so it doesn't duplicate the same actions already
// visible in the hero's quick-actions grid.
const REVEAL_AT = 64;

export function OFTStickyBar({ className, whatsappClassName, businessName, phoneHref, mapsHref, whatsappHref }: OFTStickyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > REVEAL_AT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const showBar = Boolean(phoneHref || mapsHref);
  const showWhatsApp = Boolean(whatsappHref);
  if (!showBar && !showWhatsApp) return null;

  return (
    <>
      {showWhatsApp ? (
        <a className={whatsappClassName} href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Contactar OFT Racing por WhatsApp">
          <MessageCircle aria-hidden="true" />
        </a>
      ) : null}
      {showBar ? (
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
      ) : null}
    </>
  );
}
