/** Static, self-contained print masters. No network calls or runtime QR service. */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import QRCode from "qrcode";
import sharp from "sharp";
import jsQR from "jsqr";
import { getBusinessSlugs, getPublishedBusinesses, isValidSlug } from "../lib/businesses";
import { getCanonicalProfileUrl } from "../lib/site";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
export const OUTPUT_DIR = path.join(ROOT, "public/piricard-qrs");
const SYMBOL_PATH = path.join(ROOT, "public/brand/piricard-symbol.svg");
// Deliberately pinned: local/preview environment settings must never enter print masters.
const PRODUCTION_ORIGIN = "https://card.pirilight.pt";
const QUIET_ZONE = 4;
const MANIFEST = "piricard-qrs.json";
const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

export function productionProfileUrl(slug: string): string {
  if (!isValidSlug(slug)) throw new Error(`Unsafe business slug: ${slug}`);
  const canonical = new URL(getCanonicalProfileUrl(slug));
  return new URL(canonical.pathname, PRODUCTION_ORIGIN).href;
}

export async function loadSymbol(): Promise<string> {
  const source = (await readFile(SYMBOL_PATH, "utf8")).replace(/\r\n/g, "\n");
  // Preserve every path and transform from the official vector source. Only its
  // white ink becomes black, as the site's currentColor icon also permits.
  if (/<(?:image|text|script|foreignObject)\b|\b(?:href|xlink:href)\s*=|url\(|<!ENTITY/i.test(source)) {
    throw new Error("The official symbol must remain self-contained vector geometry.");
  }
  const root = source.match(/<svg\b[\s\S]*?<\/svg>/)?.[0];
  if (!root || !root.includes('viewBox="0 0 1159.4398 1106.7207"')) {
    throw new Error("Official symbol viewBox changed; review its bounds before printing.");
  }
  return root.replaceAll("#ffffff", "#000000");
}

export function buildBrandedSvg(url: string, symbol: string, areaModules = 7) {
  if (![5, 7].includes(areaModules)) throw new Error("Logo area must be 5 or 7 modules.");
  const minimum = QRCode.create(url, { errorCorrectionLevel: "H" }).version;
  // Higher QR versions can have an alignment pattern in the exact center.
  // Find a version with an unobstructed center instead of covering that pattern.
  for (let version = minimum; version <= 40; version++) {
    const qr = QRCode.create(url, { errorCorrectionLevel: "H", version });
    const size = qr.modules.size;
    const start = (size - areaModules) / 2;
    const end = start + areaModules;
    let obstructed = false;
    for (let row = start; row < end; row++) {
      for (let col = start; col < end; col++) {
        if (qr.modules.isReserved(row, col)) obstructed = true;
      }
    }
    if (obstructed || areaModules / size > 0.2) continue;

    const extent = size + 2 * QUIET_ZONE;
    const paths: string[] = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (row >= start && row < end && col >= start && col < end) continue;
        if (qr.modules.get(row, col)) {
          paths.push(`M${col + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`);
        }
      }
    }
    // A full module of white padding on every side of the symbol.
    const logoSize = areaModules - 2;
    const logoStart = QUIET_ZONE + start + 1;
    const embeddedSymbol = symbol.replace(/<svg\b[\s\S]*?>/, (tag) => tag
      .replace(/\s(?:width|height|x|y)="[^"]*"/g, "")
      .replace(/>$/, ` x="${logoStart}" y="${logoStart}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet">`));
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${extent * 16}" height="${extent * 16}" viewBox="0 0 ${extent} ${extent}">
<rect width="${extent}" height="${extent}" fill="#ffffff"/>
<path fill="#000000" shape-rendering="crispEdges" d="${paths.join("")}"/>
${embeddedSymbol}
</svg>
`;
    return { svg, qr, extent, areaModules, start, end };
  }
  throw new Error(`No safe centered logo area for ${url}`);
}

export async function validateSvg(svg: string, expected: string, extent: number) {
  if (/<(?:image|text|script|foreignObject)\b|\b(?:href|xlink:href)\s*=|data:|url\(/i.test(svg)) {
    throw new Error("QR master contains raster, text, active content or external dependencies.");
  }
  const scenarios = [
    { name: "4px-per-module", width: extent * 4, rotation: 0 },
    { name: "8px-per-module", width: extent * 8, rotation: 0 },
    { name: "16px-per-module", width: extent * 16, rotation: 0 },
    { name: "300px-noninteger-scale", width: 300, rotation: 0 },
    { name: "rotate-90", width: extent * 4, rotation: 90 },
    { name: "rotate-180", width: extent * 4, rotation: 180 },
    { name: "rotate-270", width: extent * 4, rotation: 270 },
    { name: "mild-blur", width: extent * 4, rotation: 0, blur: 0.5 },
  ];
  const checks: string[] = [];
  for (const scenario of scenarios) {
    let render = sharp(Buffer.from(svg)).resize(scenario.width, scenario.width).rotate(scenario.rotation);
    if (scenario.blur) render = render.blur(scenario.blur);
    const { data, info } = await render.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height, { inversionAttempts: "dontInvert" });
    if (decoded?.data !== expected) {
      throw new Error(`${scenario.name}: expected ${expected}, decoded ${decoded?.data ?? "NOTHING"}`);
    }
    checks.push(scenario.name);
  }
  return checks;
}

/** Check the actual rendered master, not just the pre-logo library matrix. */
export async function validateGeometry(result: ReturnType<typeof buildBrandedSvg>) {
  const { data, info } = await sharp(Buffer.from(result.svg))
    .resize(result.extent * 8, result.extent * 8).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let row = 0; row < result.extent; row++) {
    for (let col = 0; col < result.extent; col++) {
      const r = row - QUIET_ZONE;
      const c = col - QUIET_ZONE;
      if (r >= result.start && r < result.end && c >= result.start && c < result.end) continue;
      const inside = r >= 0 && c >= 0 && r < result.qr.modules.size && c < result.qr.modules.size;
      const expected = inside && result.qr.modules.get(r, c) ? 0 : 255;
      const offset = ((row * 8 + 4) * info.width + col * 8 + 4) * info.channels;
      if (data[offset] !== expected || data[offset + 1] !== expected || data[offset + 2] !== expected) {
        throw new Error(`Quiet zone or QR structure modified at ${row},${col}`);
      }
    }
  }
}

export async function generate(verify = false) {
  const businesses = getPublishedBusinesses();
  const routeSlugs = getBusinessSlugs();
  if (!businesses.length || new Set(routeSlugs).size !== businesses.length) {
    throw new Error("Missing businesses or duplicate slugs.");
  }
  const symbol = await loadSymbol();
  const files = new Map<string, string | Buffer>();
  const manifest = [];
  // Validate the WHOLE batch in memory before touching official exports.
  for (const business of businesses) {
    const url = productionProfileUrl(business.slug);
    let accepted;
    const failures: string[] = [];
    for (const area of [7, 5]) {
      try {
        const result = buildBrandedSvg(url, symbol, area);
        await validateGeometry(result);
        const checks = await validateSvg(result.svg, url, result.extent);
        accepted = { ...result, checks };
        break;
      } catch (error) {
        failures.push(String(error));
      }
    }
    if (!accepted) throw new Error(`${business.slug}: ${failures.join("; ")}`);
    const filename = `${business.slug}.svg`;
    const pngFilename = `${business.slug}.png`;
    const png = await sharp(Buffer.from(accepted.svg)).png().toBuffer();
    files.set(filename, accepted.svg);
    files.set(pngFilename, png);
    manifest.push({
      business: business.name, slug: business.slug, url, qr: filename, png: pngFilename,
      validated: true, decoded: url, errorCorrectionLevel: "H",
      version: accepted.qr.version, modules: accepted.qr.modules.size,
      quietZoneModules: QUIET_ZONE, logoAreaModules: accepted.areaModules,
      symbol: "/brand/piricard-symbol.svg", symbolSha256: hash(symbol),
      svgSha256: hash(accepted.svg), validationChecks: accepted.checks,
    });
  }
  const existing = await readdir(OUTPUT_DIR).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const extras = existing.filter((file) => /\.(svg|png)$/i.test(file) && !files.has(file));
  if (extras.length) throw new Error(`Review obsolete/unrelated exports before regenerating: ${extras.join(", ")}`);
  files.set(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  if (!verify) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    for (const [filename, content] of files) await writeFile(path.join(OUTPUT_DIR, filename), content);
  }
  // Re-read the on-disk masters, verify the inventory, then decode their renders.
  // --verify never repairs a tampered/stale file: it fails instead.
  for (const [filename, expected] of files) {
    const actual = await readFile(path.join(OUTPUT_DIR, filename));
    if (!actual.equals(Buffer.from(expected))) throw new Error(`Stale or modified export: ${filename}`);
  }
  for (const item of manifest) {
    const svg = await readFile(path.join(OUTPUT_DIR, item.qr), "utf8");
    await validateSvg(svg, item.url, item.modules + 2 * QUIET_ZONE);
    const { data, info } = await sharp(path.join(OUTPUT_DIR, item.png)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (jsQR(new Uint8ClampedArray(data), info.width, info.height)?.data !== item.url) {
      throw new Error(`PNG failed decoding: ${item.png}`);
    }
    console.log(`PASS ${item.business} | ${item.qr} | decoded: ${item.url} | ${item.validationChecks.length} SVG checks + PNG`);
  }
  console.log(`${verify ? "Verified" : "Generated and verified"} ${manifest.length} official QR codes in ${OUTPUT_DIR}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--verify")) {
    console.error("Usage: npm run generate:qrs OR npm run verify:qrs");
    process.exitCode = 1;
  } else {
    generate(args.includes("--verify")).catch((error) => {
      console.error("Official QR validation failed:", error);
      process.exitCode = 1;
    });
  }
}
