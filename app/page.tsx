import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BusinessDirectory } from "@/components/BusinessDirectory";
import { PiriCardSymbol } from "@/components/icons/PiriCardSymbol";
import { getPublishedDirectoryBusinesses } from "@/lib/businesses";

export const metadata: Metadata = {
  title: { absolute: "PiriCard — Negócios a um toque" },
};

export default function HomePage() {
  const businesses = getPublishedDirectoryBusinesses();
  return (
    <main className="directory-page">
      <header className="platform-header">
        <Link className="platform-wordmark" href="/" aria-label="PiriCard — página inicial">
          <PiriCardSymbol />
          <span>Piri<span>Card</span></span>
        </Link>
        <a href="https://pirilight.pt" target="_blank" rel="noopener noreferrer">PiriLight Studio</a>
      </header>
      <BusinessDirectory businesses={businesses} />
      <footer className="platform-footer">
        <a href="https://pirilight.pt" target="_blank" rel="noopener noreferrer">
          <Image src="/brand/pirilight-symbol.png" alt="" width={42} height={42} unoptimized />
          <span>Piri<span>Light</span> Studio</span>
        </a>
        <p>© 2026 PiriLight Studio. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
