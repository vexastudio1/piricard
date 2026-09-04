"use client";

import { MessageCircle, Navigation, Phone } from "lucide-react";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface AutoformigalStickyBarProps {
  className: string;
  whatsappClassName: string;
  businessName: string;
  phoneHref?: string;
  mapsHref?: string;
  whatsappHref?: string;
}

// Same structure as OFTStickyBar/BeautyStickyBar: a two-item bottom bar
// (Ligar + Como chegar, per the Autoformigal spec) plus an optional floating
// WhatsApp button, sharing one scroll-reveal state (useScrollReveal, same
// 64px threshold) so everything appears and disappears together. Autoformigal
// has no confirmed WhatsApp number yet, so whatsappHref is normally
// undefined and the fab simply never renders — this stays ready for the day
// one is confirmed, without inventing one now.
const REVEAL_AT = 64;

export function AutoformigalStickyBar({ className, whatsappClassName, businessName, phoneHref, mapsHref, whatsappHref }: AutoformigalStickyBarProps) {
  const visible = useScrollReveal(REVEAL_AT);

  if (!visible) return null;

  const showBar = Boolean(phoneHref || mapsHref);
  const showWhatsApp = Boolean(whatsappHref);
  if (!showBar && !showWhatsApp) return null;

  return (
    <>
      {showWhatsApp ? (
        <a className={`profile-floating-action ${whatsappClassName}`} href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label={`Contactar ${businessName} por WhatsApp`}>
          <MessageCircle aria-hidden="true" />
        </a>
      ) : null}
      {showBar ? (
        <nav className={`profile-action-bar ${className}`} aria-label="Ações persistentes">
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
