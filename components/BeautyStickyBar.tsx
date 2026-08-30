"use client";

import { MessageCircle, Navigation, Phone } from "lucide-react";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface BeautyStickyBarProps {
  className: string;
  whatsappClassName: string;
  phoneClassName: string;
  mapsClassName: string;
  phoneHref?: string;
  mapsHref?: string;
  whatsappHref?: string;
}

// Same structure as OFTStickyBar: a two-item bottom bar plus a separate
// floating WhatsApp button positioned above it, sharing one scroll-reveal
// state (useScrollReveal, same 64px threshold) so everything appears and
// disappears together. Only the content/labels and Beauty's own visual
// system differ from OFT's version.
//
// Ligar + Como chegar (not "Marcar consulta") — the sticky bar is for the
// two highest-frequency, lowest-friction actions once someone has scrolled
// past the main CTA grid; "Marcar consulta" stays there, at the top, as the
// primary conversion action.
const REVEAL_AT = 64;

export function BeautyStickyBar({ className, whatsappClassName, phoneClassName, mapsClassName, phoneHref, mapsHref, whatsappHref }: BeautyStickyBarProps) {
  const visible = useScrollReveal(REVEAL_AT);

  if (!visible) return null;

  const showBar = Boolean(phoneHref || mapsHref);
  const showWhatsApp = Boolean(whatsappHref);
  if (!showBar && !showWhatsApp) return null;

  return (
    <>
      {showWhatsApp ? (
        <a className={`profile-floating-action ${whatsappClassName}`} href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Contactar Beauty Connection 360 por WhatsApp">
          <MessageCircle aria-hidden="true" />
        </a>
      ) : null}
      {showBar ? (
        <nav className={`profile-action-bar ${className}`} aria-label="Ações persistentes">
          <div>
            {phoneHref ? (
              <a className={phoneClassName} href={phoneHref}>
                <Phone aria-hidden="true" />
                <span>Ligar</span>
              </a>
            ) : null}
            {mapsHref ? (
              <a className={mapsClassName} href={mapsHref} target="_blank" rel="noopener noreferrer">
                <Navigation aria-hidden="true" />
                <span>Como chegar</span>
              </a>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
