"use client";

import { Phone } from "lucide-react";
import { PiriCardQrAction } from "@/components/PiriCardQrAction";
import { WhatsAppMark } from "@/components/icons/WhatsAppMark";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface BoiNaBrasaStickyBarProps {
  className: string;
  whatsappClassName: string;
  qrClassName: string;
  phoneClassName: string;
  businessName: string;
  phoneHref: string;
  whatsappHref?: string;
  qrCodeSrc?: string;
}

// Same pattern as OFTStickyBar/BeautyStickyBar: hidden at the very top of the
// page, reveals once the user scrolls past REVEAL_AT, hides again on
// returning to the top — extracted into its own client component (rather
// than making the whole profile a client component) purely so useScrollReveal
// has somewhere to live. QR + Ligar form the lower action pair; WhatsApp uses
// the established floating-action pattern shared by the other bespoke cards.
const REVEAL_AT = 64;

export function BoiNaBrasaStickyBar({ className, whatsappClassName, qrClassName, phoneClassName, businessName, phoneHref, whatsappHref, qrCodeSrc }: BoiNaBrasaStickyBarProps) {
  const visible = useScrollReveal(REVEAL_AT);

  if (!visible) return null;

  return (
    <>
      {whatsappHref ? (
        <a className={`profile-floating-action ${whatsappClassName}`} href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label={`Contactar ${businessName} por WhatsApp`}>
          <WhatsAppMark aria-hidden="true" />
        </a>
      ) : null}
      <nav className={`profile-action-bar ${className}`} aria-label="Ações persistentes">
        <div>
          {qrCodeSrc ? <PiriCardQrAction qrSrc={qrCodeSrc} businessName={businessName} triggerClassName={qrClassName} /> : null}
          <a className={phoneClassName} href={phoneHref}>
            <Phone aria-hidden="true" />
            <span>Ligar</span>
          </a>
        </div>
      </nav>
    </>
  );
}
