import path from "node:path";
import { Font } from "@react-pdf/renderer";

// Local static font files (extracted once from @fontsource, see
// assets/fonts/README.md) — never fetched over the network at generation
// time, so PDF generation stays reproducible in CI with no network access.
const FONTS_DIR = path.join(process.cwd(), "assets", "fonts");
const f = (file: string) => path.join(FONTS_DIR, file);

let registered = false;

/**
 * Registers every font family used across the PiriCard offline PDF system.
 * Idempotent — safe to call once per business PDF render without
 * re-registering (react-pdf's Font.register would otherwise warn/duplicate).
 *
 * Each business's PDF only USES the 1-2 families that match its own live
 * profile typography (see lib/pdf/brandTokens.ts) — everything is
 * registered once up front purely so the generation script doesn't need to
 * know in advance which businesses need which fonts.
 */
export function registerPdfFonts(): void {
  if (registered) return;
  registered = true;

  // Beauty Connection 360 — same pairing as BeautyConnection360Profile.tsx
  // (next/font Cormorant_Garamond + Manrope).
  Font.register({
    family: "Cormorant Garamond",
    fonts: [
      { src: f("CormorantGaramond-Medium.ttf"), fontWeight: 500 },
      { src: f("CormorantGaramond-SemiBold.ttf"), fontWeight: 600 },
      { src: f("CormorantGaramond-SemiBoldItalic.ttf"), fontWeight: 600, fontStyle: "italic" },
      { src: f("CormorantGaramond-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Manrope",
    fonts: [
      { src: f("Manrope-Regular.ttf"), fontWeight: 400 },
      { src: f("Manrope-SemiBold.ttf"), fontWeight: 600 },
      { src: f("Manrope-Bold.ttf"), fontWeight: 700 },
    ],
  });

  // OFT Racing — same pairing as OFTRacingProfile.module.css (next/font
  // Barlow_Condensed + Barlow + IBM_Plex_Mono).
  Font.register({
    family: "Barlow Condensed",
    fonts: [
      { src: f("BarlowCondensed-SemiBold.ttf"), fontWeight: 600 },
      { src: f("BarlowCondensed-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Barlow",
    fonts: [
      { src: f("Barlow-Regular.ttf"), fontWeight: 400 },
      { src: f("Barlow-SemiBold.ttf"), fontWeight: 600 },
      { src: f("Barlow-Bold.ttf"), fontWeight: 700 },
    ],
  });
  // IBM Plex Mono intentionally not registered — see the comment on
  // FONT_SETS["oft-racing"] in lib/pdf/brandTokens.ts (fontkit glyph-metrics
  // bug in the currently distributed TTF). OFT Racing's PDF falls back to
  // Barlow for its mono-style labels instead.

  // Boi na Brasa — Archivo, same family BoiNaBrasaProfile.module.css uses
  // for both display and body text.
  Font.register({
    family: "Archivo",
    fonts: [
      { src: f("Archivo-Regular.ttf"), fontWeight: 400 },
      { src: f("Archivo-Bold.ttf"), fontWeight: 700 },
      { src: f("Archivo-ExtraBold.ttf"), fontWeight: 800 },
    ],
  });

  // Auto Formigal / generic BusinessProfile layout — Inter, the site-wide
  // default body font (app/globals.css) that the generic profile inherits.
  Font.register({
    family: "Inter",
    fonts: [
      { src: f("Inter-Regular.ttf"), fontWeight: 400 },
      { src: f("Inter-SemiBold.ttf"), fontWeight: 600 },
      { src: f("Inter-Bold.ttf"), fontWeight: 700 },
    ],
  });

  // react-pdf's default hyphenation callback aggressively breaks words at
  // any wrap point — wrong for Portuguese business names/addresses. Treat
  // every word as a single unbreakable unit; layout still wraps on spaces.
  Font.registerHyphenationCallback((word) => [word]);
}
