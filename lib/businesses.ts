export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "youtube" | "tiktok";

export interface BusinessHoursEntry {
  label: string;
  days: number[];
  periods: Array<{ open: string; close: string }>;
}

export interface BusinessTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  appearance: "light" | "dark";
  fontFamily: "editorial" | "modern";
}

export interface BusinessGalleryImage {
  src?: string;
  alt: string;
  aspectRatio?: "wide" | "landscape" | "square";
  placeholderLabel?: string;
}

export interface Business {
  slug: string;
  name: string;
  organization: string;
  category: string;
  published: boolean;
  featured: boolean;
  indexable: boolean;
  directoryDescription: string;
  profileDescription?: string;
  positioning?: string;
  contact: { phone?: string; whatsapp?: string; email?: string; website?: string };
  location?: { city?: string; address?: string; streetAddress?: string; country?: string; mapsUrl?: string };
  reviewUrl?: string;
  reviewWriteUrl?: string;
  externalLinks?: {
    tripAdvisor?: string;
    delivery?: string;
    collection?: string;
  };
  reviewSnapshot?: { rating: number; count: number; source: string; asOf: string };
  // Official Google Place ID for this business's own listing — the stable
  // identifier the Google Places API (Place Details) needs to fetch a live
  // rating + review count. See lib/google-reviews.ts. Only set this from a
  // verified source (e.g. the placeid already embedded in this business's own
  // reviewWriteUrl below, or Google's own Place ID Finder) — never guessed.
  googlePlaceId?: string;
  socialLinks?: Array<{ platform: SocialPlatform; url: string; label: string }>;
  services?: string[];
  hours?: BusinessHoursEntry[];
  assets: { logo?: string; printLogo?: string; printLogoColor?: string; logoOnLight?: boolean; cover?: string; coverAlt?: string; socialImage?: string; qrCode?: string };
  gallery?: BusinessGalleryImage[];
  digitalCard?: { path: string; format: "PNG" | "PDF" };
  theme: BusinessTheme;
  layoutVariant: "editorial" | "compact" | "restaurant" | "racing" | "beauty" | "workshop";
}

export type DirectoryBusiness = Pick<Business, "slug" | "name" | "category" | "directoryDescription"> & {
  city?: string;
  logo?: string;
  // True when the logo asset itself has no light background baked in (e.g. a
  // transparent mark) and needs an explicit light plate to read clearly in the
  // directory, matching how the other businesses' logos already render there.
  logoOnLight?: boolean;
};

// Single source of truth for directory cards, profiles, metadata and vCards.
const businesses = {
  autoformigal: {
    slug: "autoformigal",
    name: "Auto Formigal",
    organization: "Auto Formigal",
    category: "Oficina automóvel",
    published: true,
    featured: true,
    indexable: true,
    directoryDescription: "Oficina multimarca com mais de duas décadas de experiência em reparação e diagnóstico automóvel.",
    profileDescription: "Reparação, diagnóstico e manutenção automóvel multimarca.",
    positioning: "25 anos de confiança na reparação automóvel.",
    contact: {
      phone: "+351261858239",
      email: "geral@autoformigal.pt",
      website: "https://autoformigal.vercel.app",
      // TODO: Add a confirmed WhatsApp number in international format.
    },
    location: {
      city: "São Pedro da Cadeira",
      address: "Rua do Aranha 19, São Pedro da Cadeira",
      streetAddress: "Rua do Aranha 19",
      country: "Portugal",
      // A Maps search URL is derived from the confirmed address when needed.
      // NOTE (checked 04.09.2026): a third-party directory (Guia do Oeste) lists
      // "Rua do Aranha, 27" and an additional mobile number (917 600 598) for this
      // business. Neither is confirmed against this project's own source, so this
      // address/phone are kept as-is rather than silently overwritten — re-verify
      // directly with the business if this is ever in question.
    },
    // Rating + review count confirmed by the client directly from Auto Formigal's
    // own Google Business listing (screenshots reviewed 04.09.2026). No per-star
    // breakdown or specific review quotes were supplied/verifiable alongside
    // this, so the distribution graph and "Mais elogiado" tags are intentionally
    // left out rather than invented — see AutoformigalProfile.tsx.
    // TODO: Add a confirmed direct Google Reviews URL (still falls back to a
    // Maps address search for "Deixar avaliação" / "Ler avaliações" until one
    // is provided).
    reviewSnapshot: { rating: 4.9, count: 77, source: "Google", asOf: "04.09.2026" },
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/auto_formigal/" },
      { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/autoformigal" },
    ],
    services: ["Reparação multimarca", "Diagnóstico avançado", "Manutenção automóvel"],
    // Expanded to one row per weekday (same shape as Boi na Brasa/OFT Racing)
    // rather than the grouped "Segunda a sexta" range — the underlying hours
    // are unchanged (still 09:00–18:00 weekdays, 09:00–13:00 Saturday);
    // Sunday closed per explicit confirmation (an automotive workshop with no
    // documented Sunday hours), not previously assumed by this project.
    hours: [
      { label: "Segunda", days: [1], periods: [{ open: "09:00", close: "18:00" }] },
      { label: "Terça", days: [2], periods: [{ open: "09:00", close: "18:00" }] },
      { label: "Quarta", days: [3], periods: [{ open: "09:00", close: "18:00" }] },
      { label: "Quinta", days: [4], periods: [{ open: "09:00", close: "18:00" }] },
      { label: "Sexta", days: [5], periods: [{ open: "09:00", close: "18:00" }] },
      { label: "Sábado", days: [6], periods: [{ open: "09:00", close: "13:00" }] },
      { label: "Domingo", days: [0], periods: [] },
    ],
    assets: {
      logo: "/clients/autoformigal/logo/autoformigal-approved.jpg",
      cover: "/clients/autoformigal/cover/exterior-2026.png",
      coverAlt: "Exterior da oficina Auto Formigal em São Pedro da Cadeira",
      socialImage: "/clients/autoformigal/cover/exterior-2026.png",
      // Auto Formigal's own official print-master QR (public/piricard-qrs/,
      // generated by scripts/generate-piricard-qrs.ts) — never another
      // business's QR code.
      qrCode: "/piricard-qrs/autoformigal.png",
    },
    // Galeria Auto Formigal: para publicar uma fotografia, basta adicionar o ficheiro
    // em public/clients/autoformigal/gallery e preencher `src` neste array.
    gallery: [
      {
        src: "/clients/autoformigal/cover/exterior-2026.png",
        alt: "Exterior da oficina Auto Formigal em São Pedro da Cadeira",
        aspectRatio: "wide",
      },
      {
        src: "/clients/autoformigal/gallery/interior-recepcao.png",
        alt: "Interior da oficina Auto Formigal",
        aspectRatio: "square",
        placeholderLabel: "Interior",
      },
      {
        src: "/clients/autoformigal/gallery/diagnostico-oficina.png",
        alt: "Área de diagnóstico automóvel da Auto Formigal",
        aspectRatio: "square",
        placeholderLabel: "Diagnóstico",
      },
      {
        src: "/clients/autoformigal/gallery/manutencao-autoformigal.png",
        alt: "Zona de manutenção automóvel da Auto Formigal",
        aspectRatio: "square",
        placeholderLabel: "Manutenção",
      },
      {
        src: "/clients/autoformigal/gallery/equipa-autoformigal.png",
        alt: "Equipa da oficina Auto Formigal",
        aspectRatio: "landscape",
        placeholderLabel: "Equipa",
      },
    ],
    digitalCard: undefined,
    theme: {
      primary: "#223196",
      secondary: "#1b2a80",
      accent: "#31b009",
      background: "#eef1f8",
      surface: "#ffffff",
      text: "#141f52",
      mutedText: "#525c80",
      border: "#dce3f2",
      appearance: "light",
      fontFamily: "modern",
    },
    layoutVariant: "workshop",
  },
  "beauty-connection-360": {
    slug: "beauty-connection-360",
    name: "Beauty Connection 360",
    organization: "Beauty Connection 360",
    category: "Estética • Beleza • Bem-estar",
    published: true,
    featured: false,
    indexable: true,
    directoryDescription: "Estética, beleza e bem-estar personalizados, unindo tratamentos, tecnologia e cosmética premium.",
    profileDescription: "Conexão Total com a Beleza — tratamentos personalizados de estética, corpo e bem-estar.",
    positioning: "Elevando a sua beleza com exclusividade.",
    // Phone and email disagreed between the website (916 754 795 /
    // geral@beautyconnection360.com) and an Instagram highlight (933 556 646 /
    // geral.connectionbeauty@gmail.com) — per design-reference/PiriCard for
    // Beauty Connection 360/uploads/beauticonnection360/
    // BEAUTY-CONNECTION-360-HANDOFF-PIRICARD-WEBSITE.md, neither had been
    // confirmed as current. The website's number was explicitly chosen (by
    // the site owner, in-session) to power Ligar/WhatsApp — not independently
    // re-verified beyond that instruction. Re-confirm if it ever bounces.
    contact: {
      phone: "+351916754795",
      whatsapp: "+351916754795",
      // The website variant (matching the phone above) per the same
      // handoff-doc comment — not the Instagram-highlight alternate
      // (geral.connectionbeauty@gmail.com).
      email: "geral@beautyconnection360.com",
      website: "https://www.beautyconnection360.com/",
    },
    location: {
      city: "Torres Vedras",
      streetAddress: "Rua Serpa Pinto 9A",
      address: "Rua Serpa Pinto 9A, 2560-288 Torres Vedras",
      country: "Portugal",
    },
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/beauty_connection360" },
      { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/groups/736440344810780/user/61570809329586/?locale=pt_PT" },
    ],
    // No opening hours or Google Business profile are confirmed — omitted
    // rather than guessed (see contact note above for phone/WhatsApp).
    assets: {
      logo: "/clients/beauty-connection-360/logo.webp",
      cover: "/clients/beauty-connection-360/fachada.webp",
      coverAlt: "Fachada da Beauty Connection 360 em Torres Vedras",
      socialImage: "/clients/beauty-connection-360/fachada.webp",
      // Beauty Connection 360's own official print-master QR (public/piricard-qrs/,
      // generated by scripts/generate-piricard-qrs.ts) — never another
      // business's QR code.
      qrCode: "/piricard-qrs/beauty-connection-360.png",
    },
    digitalCard: undefined,
    theme: {
      primary: "#1c1815",
      secondary: "#0f0c0a",
      accent: "#b3873f",
      background: "#e9e4d9",
      surface: "#f8f4ec",
      text: "#211c17",
      mutedText: "#6b6259",
      border: "rgba(28,24,21,0.12)",
      appearance: "light",
      fontFamily: "editorial",
    },
    layoutVariant: "beauty",
  },
  "boi-na-brasa": {
    slug: "boi-na-brasa",
    name: "Boi na Brasa",
    organization: "Restaurante Boi na Brasa",
    category: "Restaurante & Café",
    published: true,
    featured: false,
    indexable: true,
    directoryDescription: "Grelhados, pratos reconfortantes e sabores luso-brasileiros no centro de Torres Vedras.",
    profileDescription: "Picanha, maminha, bitoque e petiscos, com esplanada, takeaway e pedidos online.",
    positioning: "Carne na brasa e comida reconfortante, sem formalidades.",
    contact: {
      phone: "+351261063480",
      whatsapp: "+351962874230",
    },
    location: {
      city: "Torres Vedras",
      address: "Rua 1.º de Dezembro 5, 2560-300 Torres Vedras",
      streetAddress: "Rua 1.º de Dezembro 5",
      country: "Portugal",
      mapsUrl: "https://www.google.com/maps/place/Restaurante+boi+na+brasa/@39.0916177,-9.2583152,17z/data=!3m1!4b1!4m6!3m5!1s0xd1f2d060f0093ef:0xa22973c1920f5dcd!8m2!3d39.0916177!4d-9.2583152!16s%2Fg%2F11vwxw92vx",
    },
    reviewUrl: "https://www.google.com/maps/place/Restaurante+boi+na+brasa/@39.0916177,-9.2583152,17z/data=!3m1!4b1!4m6!3m5!1s0xd1f2d060f0093ef:0xa22973c1920f5dcd!8m2!3d39.0916177!4d-9.2583152!16s%2Fg%2F11vwxw92vx",
    // Direct Google "write a review" deep link (client-provided, 04.09.2026),
    // same pattern as OFT Racing's reviewWriteUrl below — opens straight to
    // the 1–5 star composer instead of the Maps listing. reviewUrl above stays
    // the "read existing reviews" destination.
    reviewWriteUrl: "https://search.google.com/local/writereview?placeid=ChIJ75MADwYtHw0RzV0PksFzKaI",
    // Same verified place id as reviewWriteUrl above, promoted to an explicit
    // field so lib/google-reviews.ts can fetch a live rating/count for it.
    googlePlaceId: "ChIJ75MADwYtHw0RzV0PksFzKaI",
    // Manually recorded snapshot — the safe fallback shown if the live Google
    // fetch isn't configured/available yet (see lib/google-reviews.ts). Once
    // GOOGLE_PLACES_API_KEY is set, the live value supersedes this.
    reviewSnapshot: { rating: 4.7, count: 95, source: "Google", asOf: "24.08.2026" },
    externalLinks: {
      delivery: "https://glovoapp.com/pt/pt/torres-vedras/stores/boi-na-brasa-trv",
      collection: "https://www.toogoodtogo.com/pt/find/torresvedras/restauranteboinabrasa/cookedmeal/refeicao-253056996762700480",
      tripAdvisor: "https://www.tripadvisor.pt/UserReviewEdit-g656858-d34606735-Restaurante_Boi_na_Brasa-Torres_Vedras_Lisbon_District_Central_Portugal.html",
    },
    services: [
      "Comer no local",
      "Takeaway",
      "Entrega e recolha",
      "Esplanada",
      "Aceita reservas",
      "Adequado a grupos",
      "Indicado para crianças",
      "Wi-Fi gratuito",
      "Pequeno-almoço",
      "WC",
    ],
    hours: [
      { label: "Segunda", days: [1], periods: [{ open: "09:30", close: "22:00" }] },
      { label: "Terça", days: [2], periods: [{ open: "09:30", close: "22:00" }] },
      { label: "Quarta", days: [3], periods: [{ open: "09:30", close: "22:00" }] },
      { label: "Quinta", days: [4], periods: [{ open: "09:30", close: "22:00" }] },
      { label: "Sexta", days: [5], periods: [{ open: "09:30", close: "16:30" }] },
      { label: "Sábado", days: [6], periods: [{ open: "09:30", close: "22:00" }] },
      { label: "Domingo", days: [0], periods: [] },
    ],
    assets: {
      logo: "/clients/boi-na-brasa/logo.jpg",
      cover: "/clients/boi-na-brasa/boi-na-brasa-header.webp",
      coverAlt: "Fachada do Boi na Brasa na Rua 1.º de Dezembro, em Torres Vedras, com esplanada",
      socialImage: "/clients/boi-na-brasa/fachada.jpg",
      qrCode: "/piricard-qrs/boi-na-brasa.png",
    },
    theme: {
      primary: "#191411",
      secondary: "#0f0c0a",
      accent: "#c2501f",
      background: "#ded4c4",
      surface: "#f4ede1",
      text: "#191411",
      mutedText: "#7a6a5c",
      border: "#ded4c4",
      appearance: "light",
      fontFamily: "modern",
    },
    layoutVariant: "restaurant",
  },
  "oft-racing": {
    slug: "oft-racing",
    name: "OFT Racing Shop",
    organization: "OFT Racing Shop",
    category: "Loja de motos",
    published: true,
    featured: false,
    indexable: true,
    directoryDescription: "Loja de motos em São Pedro da Cadeira, representante oficial de KTM, Husqvarna, CFMOTO e GASGAS.",
    profileDescription: "Loja de motos em São Pedro da Cadeira, representante oficial de KTM, Husqvarna, CFMOTO e GASGAS.",
    contact: {
      // Updated 29.08.2026 per explicit client instruction ("current verified business
      // number/email"). NOTE: as of this update, OFT's own live Google Business listing
      // and official Facebook page ("Informações de contacto") still publicly show the
      // previous phone (919 678 052) and email (tiagomes153@hotmail.com) — the business
      // should update those external listings too if this number/email is now correct.
      phone: "+351913321091",
      email: "oftracingshop.geral@gmail.com",
      // Verified as WhatsApp-capable: OFT's own Instagram recruitment post explicitly
      // labels this same number "WhatsApp: +351 913 321 091".
      whatsapp: "+351913321091",
    },
    location: {
      city: "São Pedro da Cadeira",
      address: "R. Gonçalo Velho Cabral 2, São Pedro da Cadeira, Portugal",
      streetAddress: "R. Gonçalo Velho Cabral 2",
      country: "Portugal",
      mapsUrl: "https://www.google.com/maps/place/Oft+Racing+Shop/@39.0739556,-9.3821492,17z/data=!3m1!4b1!4m6!3m5!1s0xd1f25711195cad1:0x2a9d02e1163b0a05!8m2!3d39.0739556!4d-9.3821492!16s%2Fg%2F11hhzfgsvn",
    },
    reviewUrl: "https://www.google.com/maps/place/Oft+Racing+Shop/@39.0739556,-9.3821492,17z/data=!3m1!4b1!4m6!3m5!1s0xd1f25711195cad1:0x2a9d02e1163b0a05!8m2!3d39.0739556!4d-9.3821492!16s%2Fg%2F11hhzfgsvn",
    // Direct Google "write a review" deep link for this exact verified listing
    // (place id ChIJ0cqVEXElHw0RBQo7FuECnSo — same business confirmed via Waze/Maps).
    reviewWriteUrl: "https://search.google.com/local/writereview?placeid=ChIJ0cqVEXElHw0RBQo7FuECnSo",
    // Same verified place id as reviewWriteUrl above, promoted to an explicit
    // field so lib/google-reviews.ts can fetch a live rating/count for it.
    googlePlaceId: "ChIJ0cqVEXElHw0RBQo7FuECnSo",
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/oftracing153/" },
      { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/p/OFT-Racing-100057400693321/" },
    ],
    hours: [
      { label: "Segunda", days: [1], periods: [] },
      { label: "Terça", days: [2], periods: [{ open: "10:00", close: "19:00" }] },
      { label: "Quarta", days: [3], periods: [{ open: "10:00", close: "19:00" }] },
      { label: "Quinta", days: [4], periods: [{ open: "10:00", close: "19:00" }] },
      { label: "Sexta", days: [5], periods: [{ open: "10:00", close: "19:00" }] },
      { label: "Sábado", days: [6], periods: [{ open: "10:00", close: "13:00" }] },
      { label: "Domingo", days: [0], periods: [] },
    ],
    reviewSnapshot: {
      rating: 4.8,
      count: 35,
      source: "Google",
      asOf: "29.08.2026",
    },
    assets: {
      logo: "/clients/oft-racing/logo.png",
      // Transparent PNG mark (no baked-in white background), unlike the other
      // businesses' logo files — needs a light plate in the directory to match.
      logoOnLight: true,
      cover: "/clients/oft-racing/fachada.webp",
      coverAlt: "Fachada da OFT Racing Shop em São Pedro da Cadeira",
      socialImage: "/clients/oft-racing/fachada.webp",
      // OFT Racing's own official print-master QR (public/piricard-qrs/,
      // generated by scripts/generate-piricard-qrs.ts) — never another
      // business's QR code.
      qrCode: "/piricard-qrs/oft-racing.png",
    },
    theme: {
      primary: "#0c0c0d",
      secondary: "#08080a",
      accent: "#c2301a",
      background: "#dedbd5",
      surface: "#f4f2ee",
      text: "#0c0c0d",
      mutedText: "#5e5c56",
      border: "#d8d4cc",
      appearance: "dark",
      fontFamily: "modern",
    },
    layoutVariant: "racing",
  },
  pirilight: {
    slug: "pirilight",
    name: "PiriLight",
    organization: "PiriLight",
    // Existing repository wording; the profile intentionally remains minimal
    // until confirmed business content is supplied.
    category: "PiriLight Studio",
    published: true,
    featured: false,
    indexable: false,
    directoryDescription: "Perfil PiriCard da PiriLight.",
    contact: {},
    assets: {
      logo: "/brand/pirilight-symbol.png",
      // Print-only: exact vector geometry used by PiriCardSymbol in the
      // menu/header. The public PiriLight profile keeps its existing logo.
      printLogo: "/brand/piricard-symbol.svg",
      printLogoColor: "#4f8ffb",
      logoOnLight: true,
    },
    theme: {
      primary: "#4f8ffb",
      secondary: "#05060a",
      accent: "#8fe0ff",
      background: "#05060a",
      surface: "#0b111d",
      text: "#f4f4f5",
      mutedText: "#a4adbc",
      border: "rgba(218, 232, 255, .16)",
      appearance: "dark",
      fontFamily: "modern",
    },
    layoutVariant: "compact",
  },
} as const satisfies Record<string, Business>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return slugPattern.test(slug);
}

export function getBusinessBySlug(slug: string): Business | undefined {
  if (!isValidSlug(slug)) return undefined;
  return businesses[slug as keyof typeof businesses];
}

export function getPublishedBusinessBySlug(slug: string): Business | undefined {
  const business = getBusinessBySlug(slug);
  return business?.published ? business : undefined;
}

export function getPublishedBusinesses(): Business[] {
  return Object.values(businesses)
    .filter((business) => business.published)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, "pt"));
}

export function getPublishedDirectoryBusinesses(): DirectoryBusiness[] {
  return getPublishedBusinesses().map((business) => ({
    slug: business.slug,
    name: business.name,
    category: business.category,
    directoryDescription: business.directoryDescription,
    city: business.location?.city,
    logo: business.assets.logo,
    logoOnLight: business.assets.logoOnLight,
  }));
}

export function getBusinessSlugs(): string[] {
  const slugs = getPublishedBusinesses().map((business) => business.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("Business slugs must be unique.");
  return slugs;
}
