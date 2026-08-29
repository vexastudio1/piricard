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
  reviewSnapshot?: { rating: number; count: number; source: string; asOf: string };
  socialLinks?: Array<{ platform: SocialPlatform; url: string; label: string }>;
  services?: string[];
  hours?: BusinessHoursEntry[];
  assets: { logo?: string; cover?: string; coverAlt?: string; socialImage?: string };
  gallery?: BusinessGalleryImage[];
  digitalCard?: { path: string; format: "PNG" | "PDF" };
  theme: BusinessTheme;
  layoutVariant: "editorial" | "compact" | "restaurant" | "racing";
}

export type DirectoryBusiness = Pick<Business, "slug" | "name" | "category" | "directoryDescription"> & {
  city?: string;
  logo?: string;
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
    },
    // TODO: Add a confirmed direct Google Reviews URL.
    socialLinks: [
      { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/auto_formigal/" },
      { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/autoformigal" },
    ],
    services: ["Reparação multimarca", "Diagnóstico avançado", "Manutenção automóvel"],
    hours: [
      { label: "Segunda a sexta", days: [1, 2, 3, 4, 5], periods: [{ open: "09:00", close: "18:00" }] },
      { label: "Sábado", days: [6], periods: [{ open: "09:00", close: "13:00" }] },
    ],
    assets: {
      logo: "/clients/autoformigal/logo/autoformigal-approved.jpg",
      cover: "/clients/autoformigal/cover/exterior-2026.png",
      coverAlt: "Exterior da oficina Auto Formigal em São Pedro da Cadeira",
      socialImage: "/clients/autoformigal/cover/exterior-2026.png",
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
        alt: "Interior da oficina Auto Formigal",
        aspectRatio: "square",
        placeholderLabel: "Interior",
      },
      {
        alt: "Área de diagnóstico automóvel da Auto Formigal",
        aspectRatio: "square",
        placeholderLabel: "Diagnóstico",
      },
      {
        alt: "Zona de manutenção automóvel da Auto Formigal",
        aspectRatio: "square",
        placeholderLabel: "Manutenção",
      },
      {
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
    layoutVariant: "compact",
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
    profileDescription: "Picanha, maminha, bitoque, petiscos e pizzas, com esplanada, takeaway e pedidos online.",
    positioning: "Carne na brasa e comida reconfortante, sem formalidades.",
    contact: {
      phone: "+351261063480",
    },
    location: {
      city: "Torres Vedras",
      address: "Rua 1.º de Dezembro 5, 2560-300 Torres Vedras",
      streetAddress: "Rua 1.º de Dezembro 5",
      country: "Portugal",
      mapsUrl: "https://www.google.com/maps/place/Restaurante+boi+na+brasa/@39.0916177,-9.2583152,17z/data=!3m1!4b1!4m6!3m5!1s0xd1f2d060f0093ef:0xa22973c1920f5dcd!8m2!3d39.0916177!4d-9.2583152!16s%2Fg%2F11vwxw92vx",
    },
    reviewUrl: "https://www.google.com/maps/place/Restaurante+boi+na+brasa/@39.0916177,-9.2583152,17z/data=!3m1!4b1!4m6!3m5!1s0xd1f2d060f0093ef:0xa22973c1920f5dcd!8m2!3d39.0916177!4d-9.2583152!16s%2Fg%2F11vwxw92vx",
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
    directoryDescription: "Loja de motos em São Pedro da Cadeira.",
    profileDescription: "Loja de motos em São Pedro da Cadeira.",
    contact: {
      phone: "+351919678052",
    },
    location: {
      city: "São Pedro da Cadeira",
      address: "R. Gonçalo Velho Cabral 2, São Pedro da Cadeira, Portugal",
      streetAddress: "R. Gonçalo Velho Cabral 2",
      country: "Portugal",
    },
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
      asOf: "28.08.2026",
    },
    assets: {
      logo: "/clients/oft-racing/logo.png",
      cover: "/clients/oft-racing/fachada.webp",
      coverAlt: "Fachada da OFT Racing Shop em São Pedro da Cadeira",
      socialImage: "/clients/oft-racing/fachada.webp",
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
  }));
}

export function getBusinessSlugs(): string[] {
  const slugs = getPublishedBusinesses().map((business) => business.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("Business slugs must be unique.");
  return slugs;
}
