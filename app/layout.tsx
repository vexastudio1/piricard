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
  icons: { apple: "/iphone-app.png" },
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
