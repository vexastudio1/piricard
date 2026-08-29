"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

interface OFTWhatsAppFabProps {
  href: string;
  className: string;
}

// OFT Racing-only floating WhatsApp action. Stays hidden until the top quick-actions
// grid (#oft-quick-actions) has scrolled out of view, so it never overlaps Ligar /
// Como chegar / Deixar avaliação / Guardar contacto on short mobile viewports —
// same IntersectionObserver approach as StickyProfileActions.tsx.
export function OFTWhatsAppFab({ href, className }: OFTWhatsAppFabProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById("oft-quick-actions");
    if (!anchor || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0),
      { threshold: 0 },
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label="Contactar OFT Racing por WhatsApp">
      <MessageCircle aria-hidden="true" />
    </a>
  );
}
