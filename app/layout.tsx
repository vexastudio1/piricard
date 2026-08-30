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
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#05060a" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
