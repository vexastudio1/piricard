import type { Metadata } from "next";
import Link from "next/link";
import { BusinessDirectory } from "@/components/BusinessDirectory";
import { PiriCardBrandMark } from "@/components/PiriCardBrandMark";
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
          <PiriCardBrandMark wordmark={<span>Piri<span>Card</span></span>} />
        </Link>
        <a href="https://pirilight.pt" target="_blank" rel="noopener noreferrer">PiriLight Studio</a>
      </header>
      <BusinessDirectory businesses={businesses} />
      <footer className="platform-footer">
        <a href="https://pirilight.pt" target="_blank" rel="noopener noreferrer">
          <PiriCardBrandMark wordmark={<span>Piri<span>Light</span> Studio</span>} />
        </a>
        <p>© 2026 PiriLight Studio. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
