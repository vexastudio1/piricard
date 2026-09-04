"use client";

import { MessageCircle, Phone } from "lucide-react";
import { PiriCardQrAction } from "@/components/PiriCardQrAction";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface AutoformigalStickyBarProps {
  className: string;
  whatsappClassName: string;
  qrClassName: string;
  phoneClassName: string;
  businessName: string;
  phoneHref?: string;
  whatsappHref?: string;
  qrCodeSrc?: string;
}

// Same pattern as BoiNaBrasaStickyBar (the reference implementation): QR Code
// on the left (PiriCardQrAction — the same shared QR modal every profile
// already uses, pointed at Auto Formigal's own QR asset) + Ligar on the
// right, plus an optional floating WhatsApp button, all sharing one
// scroll-reveal state (useScrollReveal, same 64px threshold) so everything
// appears/disappears together. Auto Formigal has no confirmed WhatsApp
// number yet, so whatsappHref is normally undefined and the fab simply never
// renders — this stays ready for the day one is confirmed, without
// inventing one now.
const REVEAL_AT = 64;

export function AutoformigalStickyBar({ className, whatsappClassName, qrClassName, phoneClassName, businessName, phoneHref, whatsappHref, qrCodeSrc }: AutoformigalStickyBarProps) {
  const visible = useScrollReveal(REVEAL_AT);

  if (!visible) return null;

  const showBar = Boolean(phoneHref || qrCodeSrc);
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
            {qrCodeSrc ? <PiriCardQrAction qrSrc={qrCodeSrc} businessName={businessName} triggerClassName={qrClassName} /> : null}
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
