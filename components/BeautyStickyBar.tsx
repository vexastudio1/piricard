"use client";

import { Calendar, MessageCircle, Phone } from "lucide-react";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface BeautyStickyBarProps {
  className: string;
  whatsappClassName: string;
  bookClassName: string;
  phoneClassName: string;
  bookHref?: string;
  phoneHref?: string;
  whatsappHref?: string;
}

// Same structure as OFTStickyBar: a two-item bottom bar plus a separate
// floating WhatsApp button positioned above it, sharing one scroll-reveal
// state (useScrollReveal, same 64px threshold) so everything appears and
// disappears together. Only the content/labels and Beauty's own visual
// system differ from OFT's version.
const REVEAL_AT = 64;

export function BeautyStickyBar({ className, whatsappClassName, bookClassName, phoneClassName, bookHref, phoneHref, whatsappHref }: BeautyStickyBarProps) {
  const visible = useScrollReveal(REVEAL_AT);

  if (!visible) return null;

  const showBar = Boolean(bookHref || phoneHref);
  const showWhatsApp = Boolean(whatsappHref);
  if (!showBar && !showWhatsApp) return null;

  return (
    <>
      {showWhatsApp ? (
        <a className={whatsappClassName} href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Contactar Beauty Connection 360 por WhatsApp">
          <MessageCircle aria-hidden="true" />
        </a>
      ) : null}
      {showBar ? (
        <nav className={className} aria-label="Ações persistentes">
          <div>
            {bookHref ? (
              <a className={bookClassName} href={bookHref} target="_blank" rel="noopener noreferrer">
                <Calendar aria-hidden="true" />
                <span>Marcar consulta</span>
              </a>
            ) : null}
            {phoneHref ? (
              <a className={phoneClassName} href={phoneHref}>
                <Phone aria-hidden="true" />
                <span>Ligar</span>
              </a>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
