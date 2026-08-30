import type { Business } from "@/lib/businesses";

export interface PdfFontSet {
  /** Registered react-pdf family name used for the business name / section headings. */
  display: string;
  /** Weight to request from the display family for the business-name headline. */
  displayWeight: number;
  /** Registered react-pdf family name used for body copy and values. */
  body: string;
  /** Optional registered family for small uppercase mono-style labels (falls back to `body`). */
  mono?: string;
}

export interface PdfColorTokens {
  /** Header band background — same role as this business's own dark surface (nav bar / hero identity panel). */
  header: string;
  /** Text sitting on the header band. */
  headerText: string;
  /** Page background outside the cards. */
  background: string;
  /** Card/surface background. */
  surface: string;
  /** Card border/hairline. */
  border: string;
  /** Primary body text. */
  text: string;
  /** Secondary/caption text. */
  mutedText: string;
  /** Brand accent — section tick marks, bullets, the "FICHA DIGITAL" pill, the digital-access URL. */
  accent: string;
  /** Text color used on top of an accent-colored surface (matches how each profile already treats its own gold/accent CTAs). */
  onAccent: string;
  /** Subtle tinted background for the "Acesso à ficha digital" panel. */
  tint: string;
}

export interface PdfBrandTokens {
  colors: PdfColorTokens;
  fonts: PdfFontSet;
}

// Font pairing per business, matching each one's real live profile
// typography (see lib/pdf/fonts.ts for where each family is registered and
// which profile file it was sourced from). Keyed by slug rather than
// layoutVariant so a future business can get its own pairing even if it
// initially reuses an existing layoutVariant.
const FONT_SETS: Record<string, PdfFontSet> = {
  "beauty-connection-360": { display: "Cormorant Garamond", displayWeight: 600, body: "Manrope" },
  // IBM Plex Mono matches the live OFT Racing profile's mono accents, but the
  // Google Fonts TTF currently distributed for this family trips a fontkit
  // glyph-metrics bug during PDF embedding (upstream fontkit issue, not a
  // download/corruption problem — reproduced directly against fontkit).
  // Falling back to Barlow for the PDF's small uppercase labels keeps the
  // skeleton and brand palette intact; only this one mono-accent detail
  // differs from the live site until fontkit resolves it.
  "oft-racing": { display: "Barlow Condensed", displayWeight: 700, body: "Barlow" },
  "boi-na-brasa": { display: "Archivo", displayWeight: 800, body: "Archivo" },
  autoformigal: { display: "Inter", displayWeight: 700, body: "Inter" },
};

const DEFAULT_FONTS: PdfFontSet = { display: "Inter", displayWeight: 700, body: "Inter" };

/**
 * Derives this PDF's color/typography identity directly from the business's
 * own `theme` object (lib/businesses.ts) — the same brand tokens that already
 * drive the generic BusinessProfile layout's CSS custom properties — plus a
 * per-slug font pairing matched to each business's actual live profile
 * typography. No colors or fonts are invented here; everything traces back
 * to data already stored for the business.
 */
export function getPdfBrandTokens(business: Business): PdfBrandTokens {
  const { theme } = business;
  return {
    colors: {
      header: theme.primary,
      headerText: "#fdfbf7",
      background: theme.background,
      surface: theme.surface,
      border: theme.border,
      text: theme.text,
      mutedText: theme.mutedText,
      accent: theme.accent,
      // Same convention every bespoke profile already uses for its own gold/
      // accent CTA buttons: dark ink text on top of the accent color, not a
      // hardcoded white — keeps the PDF consistent with the live site.
      onAccent: theme.text,
      tint: theme.background,
    },
    fonts: FONT_SETS[business.slug] ?? DEFAULT_FONTS,
  };
}
