"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Navigation, Phone } from "lucide-react";

interface StickyProfileActionsProps {
  businessName: string;
  phone?: string;
  whatsapp?: string;
  maps?: string;
}

export function StickyProfileActions({ businessName, phone, whatsapp, maps }: StickyProfileActionsProps) {
  const [mainActionsPassed, setMainActionsPassed] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const mainActions = document.getElementById("profile-main-actions");
    const blockers = [document.querySelector(".card-actions"), document.querySelector(".profile-footer")].filter(Boolean) as Element[];
    if (!mainActions || typeof IntersectionObserver === "undefined") return;

    const mainObserver = new IntersectionObserver(([entry]) => {
      setMainActionsPassed(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    }, { threshold: 0 });

    const visibleBlockers = new Set<Element>();
    const blockerObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleBlockers.add(entry.target);
        else visibleBlockers.delete(entry.target);
      }
      setBlocked(visibleBlockers.size > 0);
    }, { rootMargin: "-75% 0px 0px 0px", threshold: 0 });

    mainObserver.observe(mainActions);
    blockers.forEach((element) => blockerObserver.observe(element));

    return () => {
      mainObserver.disconnect();
      blockerObserver.disconnect();
    };
  }, []);

  const secondaryHref = whatsapp ?? maps;
  if (!phone || !secondaryHref || !mainActionsPassed || blocked) return null;

  const SecondaryIcon = whatsapp ? MessageCircle : Navigation;
  const secondaryLabel = whatsapp ? "WhatsApp" : "Como chegar";

  return (
    <nav className="profile-sticky-dock" aria-label="Ações rápidas">
      <a className="is-primary" href={phone} aria-label={`Ligar para ${businessName}`}>
        <Phone aria-hidden="true" size={19} />
        <span>Ligar</span>
      </a>
      <a href={secondaryHref} target="_blank" rel="noopener noreferrer">
        <SecondaryIcon aria-hidden="true" size={19} />
        <span>{secondaryLabel}</span>
      </a>
    </nav>
  );
}
