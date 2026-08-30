/**
 * Generates one offline PiriCard PDF sheet per published business.
 *
 *   BUSINESS DATA (lib/businesses.ts)
 *         ↓
 *   BRAND TOKENS (lib/pdf/brandTokens.ts — derived from business.theme)
 *         ↓
 *   MASTER TEMPLATE (lib/pdf/PiriCardSheet.tsx — the fixed skeleton)
 *         ↓
 *   public/pdfs/piricard-{slug}.pdf
 *
 * Run with: npm run generate:pdfs
 *
 * Adding a future business requires no changes here — this script iterates
 * every *published* business already returned by getPublishedBusinesses(),
 * so a new business automatically gets its own branded PDF the next time
 * this script runs (see package.json's "prebuild" hook).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { renderToFile } from "@react-pdf/renderer";
import { getPublishedBusinesses } from "../lib/businesses";
import { getCanonicalProfileUrl, getPiriCardPdfFilename } from "../lib/site";
import { getPdfBrandTokens } from "../lib/pdf/brandTokens";
import { registerPdfFonts } from "../lib/pdf/fonts";
import { PiriCardSheet } from "../lib/pdf/PiriCardSheet";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "pdfs");
// Converted logos are cached here (not committed) so re-runs don't
// reconvert unchanged WebP source images every time.
const LOGO_CACHE_DIR = path.join(process.cwd(), ".cache", "pdf-logos");

function todayDDMMYYYY(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
}

/**
 * react-pdf's <Image> can only decode PNG/JPEG/SVG — several business logos
 * are WebP. Converts to PNG once (cached) so the template component never
 * has to know or care about the source format. Returns undefined (never a
 * broken path) if the business has no logo or the file can't be found.
 *
 * Returns a `file://` URL rather than a raw filesystem path: on Windows a
 * bare "C:\..." path is misparsed by @react-pdf/image's URL check (the
 * drive letter reads as a URL scheme), which silently falls through to a
 * *remote* fetch() of the path string instead of reading it from disk —
 * producing a blank logo box with no error (the "fetch failed" console
 * noise during generation was exactly this). A proper file:// URL parses
 * correctly on every OS.
 */
async function resolveLogoSrc(logoPath: string | undefined): Promise<string | undefined> {
  if (!logoPath) return undefined;
  const absoluteSource = path.join(PUBLIC_DIR, logoPath);
  if (!fs.existsSync(absoluteSource)) {
    console.warn(`  ! logo not found on disk, omitting from PDF: ${logoPath}`);
    return undefined;
  }

  const ext = path.extname(absoluteSource).toLowerCase();
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") return pathToFileURL(absoluteSource).href;

  fs.mkdirSync(LOGO_CACHE_DIR, { recursive: true });
  // Cache key derived from the full relative logo path (not just the
  // basename) — multiple businesses commonly share a filename like
  // "logo.webp", and basename-only keys would collide, silently serving one
  // business's converted logo to another.
  const cacheKey = logoPath.replace(/^\/+/, "").replace(/[\\/]/g, "_");
  const cachedPath = path.join(LOGO_CACHE_DIR, `${path.basename(cacheKey, ext)}.png`);
  if (!fs.existsSync(cachedPath) || fs.statSync(absoluteSource).mtimeMs > fs.statSync(cachedPath).mtimeMs) {
    await sharp(absoluteSource).png().toFile(cachedPath);
  }
  return pathToFileURL(cachedPath).href;
}

async function main() {
  registerPdfFonts();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const businesses = getPublishedBusinesses();
  const generatedOn = todayDDMMYYYY();

  console.log(`Generating ${businesses.length} PiriCard offline PDF(s)…\n`);

  for (const business of businesses) {
    const tokens = getPdfBrandTokens(business);
    const profileUrl = getCanonicalProfileUrl(business.slug);
    const logoSrc = await resolveLogoSrc(business.assets.logo);
    const outputPath = path.join(OUTPUT_DIR, getPiriCardPdfFilename(business.slug));

    await renderToFile(
      <PiriCardSheet business={business} tokens={tokens} profileUrl={profileUrl} logoSrc={logoSrc} generatedOn={generatedOn} />,
      outputPath,
    );

    const { size } = fs.statSync(outputPath);
    console.log(`  ✓ ${business.slug.padEnd(24)} → public/pdfs/${getPiriCardPdfFilename(business.slug)} (${(size / 1024).toFixed(1)} KB)`);
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error("PDF generation failed:", error);
  process.exitCode = 1;
});
