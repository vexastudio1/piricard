import { openSync, type Font } from "fontkit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Business } from "../businesses";
import { ART, CARD, LOGO_CONTENT_SIZE, QR_RECT, assertSafe, ptToMm, type Rect } from "./geometry";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const REGULAR = openSync(path.join(ROOT, "assets/fonts/Manrope-Regular.ttf")) as Font;
const BOLD = openSync(path.join(ROOT, "assets/fonts/Manrope-Bold.ttf")) as Font;
const WHITE = "#f4f4f5";
const MUTED = "#c6c9cf";
export const DEFAULT_ACCENT = "#4f8ffb"; // existing --platform-accent-strong
export const escapeXml = (s: string) => s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

export interface PrintAssets {
  logo: { svg?: string; dataUri?: string; width: number; height: number; source: string; effectiveDpi?: number };
  officialQr: string;
  symbol: string;
}
export interface ContentBox extends Rect { label: string; fontPt?: number }
export interface CardArtwork { svg: string; body: string; boxes: ContentBox[]; accent: string }

export function accentFor(business: Business): string {
  return /^#[0-9a-f]{6}$/i.test(business.theme.accent ?? "") ? business.theme.accent : DEFAULT_ACCENT;
}

/** Changes only the outer viewport; inner vector QR/logo geometry is untouched. */
export function placeSvg(source: string, rect: Rect): string {
  const svg = source.match(/<svg\b[\s\S]*<\/svg>/)?.[0];
  if (!svg || /<(?:script|foreignObject)\b|\bon\w+\s*=/i.test(svg)) throw new Error("Invalid SVG asset");
  return svg.replace(/<svg\b[^>]*>/, (tag) => tag
    .replace(/\s(?:width|height|x|y)="[^"]*"/g, "")
    .replace(/>$/, ` x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" preserveAspectRatio="xMidYMid meet">`));
}

function textWidth(text: string, pt: number, bold: boolean) {
  const font = bold ? BOLD : REGULAR;
  return font.layout(text).positions.reduce((sum, p) => sum + p.xAdvance, 0) * ptToMm(pt) / font.unitsPerEm;
}

function tint(hex: string, white: number): string {
  return "#" + [1, 3, 5].map((offset) => Math.round(parseInt(hex.slice(offset, offset + 2), 16) * (1 - white) + 255 * white).toString(16).padStart(2, "0")).join("");
}

/** Font outlines make both SVG and PDF independent of installed fonts. */
export function outlinedText(text: string, x: number, baseline: number, pt: number, color = WHITE, bold = false, centered = true) {
  const font = bold ? BOLD : REGULAR;
  const run = font.layout(text);
  const scale = ptToMm(pt) / font.unitsPerEm;
  const width = textWidth(text, pt, bold);
  const left = centered ? x - width / 2 : x;
  let penX = 0;
  let penY = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const paths = run.glyphs.map((glyph, i) => {
    if (glyph.id === 0) throw new Error(`Missing font glyph in: ${text}`);
    const p = run.positions[i];
    const gx = penX + p.xOffset, gy = penY + p.yOffset;
    const box = glyph.bbox;
    minX = Math.min(minX, gx + box.minX); maxX = Math.max(maxX, gx + box.maxX);
    minY = Math.min(minY, gy + box.minY); maxY = Math.max(maxY, gy + box.maxY);
    penX += p.xAdvance; penY += p.yAdvance;
    const d = glyph.path.toSVG();
    return d ? `<path transform="translate(${gx} ${gy})" d="${d}"/>` : "";
  });
  return {
    svg: `<g aria-label="${escapeXml(text)}" fill="${color}" transform="translate(${left} ${baseline}) scale(${scale} ${-scale})">${paths.join("")}</g>`,
    box: { x: left + minX * scale, y: baseline - maxY * scale, width: (maxX - minX) * scale, height: (maxY - minY) * scale, label: text, fontPt: pt },
  };
}

export function PiriCardPrintTemplate(business: Business, assets: PrintAssets, side: "front" | "back"): CardArtwork {
  const accent = accentFor(business);
  const boxes: ContentBox[] = [];
  const parts: string[] = [];
  const content = (rect: Rect, label: string, svg: string) => { assertSafe(rect, label); boxes.push({ ...rect, label }); parts.push(svg); };
  const text = (value: string, baseline: number, pt: number, color = WHITE, bold = false, x = CARD.width / 2, centered = true) => {
    const rendered = outlinedText(value, x, baseline, pt, color, bold, centered);
    assertSafe(rendered.box, value); boxes.push(rendered.box); parts.push(rendered.svg);
  };
  // Final August references: A004...jpeg (front), 61F6...jpeg (back).
  // Reference photographs are never loaded by the generator. The matte base,
  // fine linework and restrained light are native vectors/PDF shadings.
  const id = `${business.slug}-${side}`;
  parts.push(`<defs>
    <linearGradient id="base-${id}" x1="0" y1="0" x2="0.65" y2="1"><stop stop-color="#1c1d1c"/><stop offset="0.48" stop-color="#101211"/><stop offset="1" stop-color="#090b0b"/></linearGradient>
    <radialGradient id="glow-${id}"><stop stop-color="${accent}" stop-opacity="0.24"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="rule-${id}"><stop stop-color="${accent}" stop-opacity="0"/><stop offset="0.40" stop-color="${accent}"/><stop offset="0.5" stop-color="${tint(accent, 0.8)}"/><stop offset="0.60" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
    <linearGradient id="nfc-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${tint(accent, 0.55)}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
  </defs>`);
  parts.push(`<rect x="-3" y="-3" width="${ART.width}" height="${ART.height}" fill="url(#base-${id})"/>`);
  parts.push(`<ellipse cx="1" cy="37" rx="10" ry="18" fill="url(#glow-${id})"/>`);
  for (let i = 0; i < 8; i++) {
    parts.push(`<path d="M${-12 + i * 1.35} 17C${10 + i * 0.7} 32 ${6 - i * 0.35} 35 2.5 42S${9 + i * 0.8} 58 ${5 + i * 0.25} 66S2 77 ${8 + i * 0.8} 88" fill="none" stroke="${accent}" stroke-width="0.085" opacity="${0.11 + i * 0.045}"/>`);
    parts.push(`<path d="M${40 + i * 2} 20L${64 + i * 2} -4M${60 + i * 1.5} 39C${39 + i * 1.4} 52 ${36 + i * 1.5} 59 ${62 + i * 1.5} 76" fill="none" stroke="${accent}" stroke-width="0.075" opacity="${0.10 + i * 0.022}"/>`);
  }

  if (side === "front") {
    // Same square logo plate as the reference; fit real artwork without stretching.
    const plate = { x: (CARD.width - 25) / 2, y: 9.3, width: 25, height: 25 };
    const scale = Math.min(LOGO_CONTENT_SIZE / assets.logo.width, LOGO_CONTENT_SIZE / assets.logo.height);
    const w = assets.logo.width * scale, h = assets.logo.height * scale;
    const logoRect = { x: (CARD.width - w) / 2, y: plate.y + (plate.height - h) / 2, width: w, height: h };
    parts.push(`<rect x="${plate.x}" y="${plate.y}" width="25" height="25" rx="3.4" fill="#ffffff"/>`);
    content(logoRect, "Business logo", assets.logo.svg ? placeSvg(assets.logo.svg, logoRect) :
      `<image x="${logoRect.x}" y="${logoRect.y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" href="${assets.logo.dataUri}"/>`);
    const namePt = 9;
    if (textWidth(business.name, namePt, false) <= CARD.width - 10) text(business.name, 42.7, namePt);
    else {
      const words = business.name.split(/\s+/);
      let line1 = "";
      while (words.length && textWidth(`${line1} ${words[0]}`.trim(), namePt, false) <= CARD.width - 10) line1 = `${line1} ${words.shift()}`.trim();
      if (!line1) throw new Error(`Unsafe/clipped business name: ${business.name}`);
      text(line1, 40.5, namePt); text(words.join(" "), 44.5, namePt);
    }
    // Smartphone outline + three outward contactless waves, as in the reference.
    const nfc = `<g fill="none" stroke="url(#nfc-${id})" stroke-width="0.42" stroke-linecap="round" stroke-linejoin="round"><rect x="20.9" y="48.5" width="4.9" height="9.7" rx="0.7"/><path d="M22.4 49.3h1.9M28.3 51.5Q29.6 53.35 28.3 55.2M29.8 50.3Q32 53.35 29.8 56.4M31.3 49.1Q34.4 53.35 31.3 57.6"/><circle cx="23.35" cy="57.1" r="0.24" fill="${tint(accent, 0.4)}"/></g>`;
    content({ x: 20.65, y: 48.25, width: 12.45, height: 10.2 }, "NFC phone and contactless waves", nfc);
    text("Encosta o teu telemóvel", 63.7, 7.9);
    text("para abrir a ficha", 67.6, 7.5, MUTED);
    const brandPt = 9.5, symbolSize = 5.8, brandGap = 1.8;
    const brandLeft = (CARD.width - symbolSize - brandGap - textWidth("PiriCard", brandPt, false)) / 2;
    const symbolRect = { x: brandLeft, y: 74.6, width: symbolSize, height: symbolSize };
    content(symbolRect, "PiriCard symbol", placeSvg(assets.symbol, symbolRect));
    text("PiriCard", 79.1, brandPt, WHITE, false, brandLeft + symbolSize + brandGap, false);
  } else {
    parts.push(`<ellipse cx="26.99" cy="6.1" rx="10" ry="2.8" fill="url(#glow-${id})"/>`);
    parts.push(`<rect x="18.99" y="6.1" width="16" height="0.16" fill="url(#rule-${id})"/>`);
    // The rounded white plate is OUTSIDE the complete square official SVG.
    // No QR modules or quiet zone are clipped/rounded/recolored.
    parts.push(`<rect x="${QR_RECT.x - 1}" y="${QR_RECT.y - 1}" width="${CARD.qr + 2}" height="${CARD.qr + 2}" rx="2.5" fill="#ffffff"/>`);
    content(QR_RECT, "Official QR (including quiet zone)", placeSvg(assets.officialQr, QR_RECT));
    text("Lê o QR", 63, 11.5, WHITE, true);
    text("ou encosta o teu", 68.7, 7.8);
    text("telemóvel com NFC", 72.9, 7.8);
    parts.push(`<rect x="24.24" y="79.8" width="5.5" height="0.18" fill="${accent}"/>`);
  }
  // Checking actual font bounding boxes catches overflow without relying on a browser.
  for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
    const x = boxes[a], y = boxes[b];
    if (x.x < y.x + y.width && x.x + x.width > y.x && x.y < y.y + y.height && x.y + x.height > y.y) {
      throw new Error(`Overlapping critical content: ${x.label} / ${y.label}`);
    }
  }
  const body = parts.join("\n");
  return { body, boxes, accent, svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${ART.width}mm" height="${ART.height}mm" viewBox="-3 -3 ${ART.width} ${ART.height}"><title>${escapeXml(business.name)} - ${side} - CR80</title>${body}</svg>` };
}

export function roundedPreview(art: CardArtwork, id = "trim"): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}mm" height="${CARD.height}mm" viewBox="0 0 ${CARD.width} ${CARD.height}"><defs><clipPath id="${id}"><rect width="${CARD.width}" height="${CARD.height}" rx="${CARD.radius}"/></clipPath></defs><g clip-path="url(#${id})">${art.body}</g></svg>`;
}
