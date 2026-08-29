"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

interface OFTWhatsAppFabProps {
  href: string;
  className: string;
}

// OFT Racing-only floating WhatsApp action. Reveals automatically ~3s after the page
// loads — independent of scroll position, sections or IntersectionObservers — and
// then stays visible regardless of further scrolling.
const REVEAL_DELAY_MS = 3000;

export function OFTWhatsAppFab({ href, className }: OFTWhatsAppFabProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label="Contactar OFT Racing por WhatsApp">
      <MessageCircle aria-hidden="true" />
    </a>
  );
}
