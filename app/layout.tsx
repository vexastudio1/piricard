import type { Metadata, Viewport } from "next";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";
import "./profile.css";
import "./profile-layout.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "PiriCard — Negócios a um toque", template: "%s | PiriCard" },
  description: "Diretório de negócios com contactos, localização e informações essenciais.",
  applicationName: "PiriCard",
  // Explicit apple-touch-icon pointing at the final supplied icon. This is
  // the only source for it — the old app/apple-icon.png file-convention
  // icon was removed so Next doesn't also auto-generate a second, competing
  // <link rel="apple-touch-icon"> tag from that stale image.
  // The ?v=1 query string is a deliberate cache-buster: iOS caches the
  // touch icon it finds at a given URL very aggressively (independent of
  // HTTP cache headers), including a bare "no icon found" fallback from a
  // visit before this URL existed. Bumping this version string forces iOS
  // to treat it as a new, never-seen-before icon URL on the next "Add to
  // Home Screen" — bump it again if the icon asset itself ever changes.
  icons: { apple: "/iphone-app.png?v=1" },
  // apple-mobile-web-app-title: controls the label under the icon after
  // "Add to Home Screen" on iOS — independent of the <title> tag, which is
  // why a long page title was showing truncated there before.
  appleWebApp: { capable: true, title: "PiriCard" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#05060a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
