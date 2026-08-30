import type { MetadataRoute } from "next";

// Web app manifest — name/short_name both "PiriCard" to match the
// apple-mobile-web-app-title set in app/layout.tsx, and icons reuse the
// same supplied /iphone-app.png (180x180) rather than generating a
// separate PWA icon set.
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
        src: "/iphone-app.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
