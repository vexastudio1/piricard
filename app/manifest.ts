import type { MetadataRoute } from "next";

// Web app manifest — name/short_name both "PiriCard" to match the
// apple-mobile-web-app-title set in app/layout.tsx, and icons reuse the
// same supplied /iphone-app.png (180x180) rather than generating a
// separate PWA icon set. Same ?v=1 cache-buster as the apple-touch-icon in
// app/layout.tsx — keep both in sync if the icon asset is ever replaced.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PiriCard",
    short_name: "PiriCard",
    description: "Diretório de negócios com contactos, localização e informações essenciais.",
    start_url: "/",
    display: "standalone",
    background_color: "#05060a",
    theme_color: "#05060a",
    icons: [
      {
        src: "/iphone-app.png?v=1",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
