import { createHash } from "node:crypto";
import { copyFile, lstat, mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { getPublishedBusinesses, isValidSlug, type Business } from "../lib/businesses";
import { OUTPUT_DIR as QR_DIR, productionProfileUrl, qrAssetStem, validateSvg } from "./generate-piricard-qrs";
import { ART, CARD, A4, COMPACT, LOGO_CONTENT_SIZE, QR_RECT, compactPosition, compactQrRect, mmToPx, sheetPosition } from "../lib/print/geometry";
import { PiriCardPrintTemplate, ROOT, roundedPreview, placeSvg, outlinedText, type PrintAssets, type CardArtwork } from "../lib/print/PiriCardPrintTemplate";
import { checkPrintTools, compactSheetSvg, decodeImage, hashableSvg, qrPixelRegion, renderPdf, sheetSvg, validateComposedSvg, verifyCompactSheetRaster, verifyPdfAppearance, verifyPdfBoxes, verifyPlacedQr, writeVectorPdf } from "../lib/print/export";

const OUTPUT = path.join(ROOT, "public/piricard-print");
const sha = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
interface QrEntry { slug: string; business: string; url: string; qr: string; validated: boolean; svgSha256: string; errorCorrectionLevel: string; modules: number; quietZoneModules: number }
export interface CardOptions { business?: string; proof?: string[]; sheet?: string[]; copies: number }

export function parseOptions(args: string[]): CardOptions {
  const options: CardOptions = { copies: 1 };
  const seen = new Set<string>();
  for (const arg of args) {
    const [key, value, extra] = arg.split("=");
    if (seen.has(key) || extra !== undefined) throw new Error(`Invalid or duplicate option: ${arg}`);
    seen.add(key);
    if (key === "--business" && value && isValidSlug(value)) options.business = value;
    else if (key === "--proof" && value) {
      const slugs = value.split(",").map((slug) => slug.trim());
      if (slugs.length !== 3 || new Set(slugs).size !== 3 || !slugs.every(isValidSlug)) throw new Error("--proof requires exactly three distinct business slugs");
      options.proof = slugs;
    }
    else if (key === "--sheet" && value) {
      const slugs = value.split(",").map((slug) => slug.trim());
      if (slugs.length < 1 || slugs.length > COMPACT.rows || !slugs.every(isValidSlug)) throw new Error("--sheet requires 1..4 valid business slugs");
      options.sheet = slugs;
    }
    else if (key === "--copies" && /^\d+$/.test(value ?? "") && Number(value) >= 1 && Number(value) <= 100) options.copies = Number(value);
    else throw new Error(`Unknown option: ${arg}. Use --business=slug, --copies=1..100, --proof=slug1,slug2,slug3 or --sheet=slug1,...,slug4`);
  }
  if (options.proof && (options.business || options.copies !== 1)) throw new Error("--proof cannot be combined with --business or multiple copies");
  if (options.sheet && (options.proof || options.business || options.copies !== 1)) throw new Error("--sheet cannot be combined with --proof, --business or multiple copies");
  return options;
}

export function selectBusinesses(options: CardOptions, published = getPublishedBusinesses()): Business[] {
  const requested = options.sheet ?? options.proof ?? (options.business ? [options.business] : published.map((business) => business.slug));
  const slugs = [...new Set(requested)];
  return slugs.map((slug) => {
    const business = published.find((candidate) => candidate.slug === slug);
    if (!business) throw new Error(`Unknown/unpublished business: ${slug}`);
    return business;
  });
}

export async function loadPrintAssets(business: Business, manifest: QrEntry[]): Promise<PrintAssets & { qr: QrEntry }> {
  const entries = manifest.filter((entry) => entry.slug === business.slug);
  if (entries.length !== 1) throw new Error(`Run npm run generate:qrs first: missing/duplicate QR for ${business.slug}`);
  const qr = entries[0];
  if (!qr.validated || qr.errorCorrectionLevel !== "H" || qr.quietZoneModules !== 4 || qr.qr !== `${qrAssetStem(business.slug)}.svg` || qr.url !== productionProfileUrl(business.slug)) throw new Error(`Invalid official QR manifest entry: ${business.slug}`);
  const officialQr = hashableSvg(await readFile(path.join(QR_DIR, qr.qr), "utf8"));
  if (sha(officialQr) !== qr.svgSha256) throw new Error(`Modified official QR: ${business.slug}. Run npm run verify:qrs.`);
  await validateSvg(officialQr, qr.url, qr.modules + 8);

  const symbol = hashableSvg(await readFile(path.join(ROOT, "public/brand/piricard-symbol.svg"), "utf8"));
  const logoSource = business.assets.printLogo ?? business.assets.logo;
  if (!logoSource) throw new Error(`Business has no approved logo: ${business.slug}`);
  const publicDir = path.join(ROOT, "public");
  const filename = path.resolve(publicDir, logoSource.replace(/^\//, ""));
  if (!filename.startsWith(publicDir + path.sep)) throw new Error("Unsafe logo path");
  const bytes = await readFile(filename);
  const meta = await sharp(bytes).metadata();
  if (!meta.width || !meta.height) throw new Error(`Unknown logo dimensions: ${filename}`);
  const logo: PrintAssets["logo"] = { width: meta.width, height: meta.height, source: logoSource };
  if (meta.format === "svg") {
    logo.svg = hashableSvg(bytes.toString("utf8"));
    if (/<image\b|(?:href|xlink:href)=|url\(/i.test(logo.svg)) throw new Error("Business SVG must be self-contained vector geometry");
    if (business.assets.printLogoColor) {
      if (!/^#[0-9a-f]{6}$/i.test(business.assets.printLogoColor)) throw new Error(`Invalid print logo color: ${business.slug}`);
      // Match the header's currentColor behavior without changing any path,
      // transform, proportions or the canonical vector source file.
      logo.svg = logo.svg.replace(/#ffffff/gi, business.assets.printLogoColor);
    }
  } else {
    // Existing WebP/JPEG/PNG logos remain raster. Convert losslessly to PNG for
    // PDF compatibility; do not fake a vector tracing or alter their appearance.
    const png = await sharp(bytes).toColourspace("srgb").png().toBuffer();
    logo.dataUri = `data:image/png;base64,${png.toString("base64")}`;
    const mmPerPixel = Math.min(LOGO_CONTENT_SIZE / meta.width, LOGO_CONTENT_SIZE / meta.height);
    logo.effectiveDpi = Math.round(25.4 / mmPerPixel);
    if (logo.effectiveDpi < 300) throw new Error(`Logo resolution below 300 dpi: ${business.slug} (${logo.effectiveDpi})`);
  }
  return { logo, symbol, officialQr, qr };
}

function previewPair(front: CardArtwork, back: CardArtwork, name: string) {
  const width = CARD.width * 2 + 18, height = CARD.height + 20;
  const label = outlinedText(name, 6, 7, 9, "#f4f4f5", true, false).svg;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#252932"/>${label}${placeSvg(roundedPreview(front, "front-cut"), { x: 6, y: 12, width: CARD.width, height: CARD.height })}${placeSvg(roundedPreview(back, "back-cut"), { x: 12 + CARD.width, y: 12, width: CARD.width, height: CARD.height })}</svg>`;
}

async function copyTree(source: string, destination: string) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error("Unexpected symlink in generated output");
    if (entry.isDirectory()) await copyTree(path.join(source, entry.name), path.join(destination, entry.name));
    else await copyFile(path.join(source, entry.name), path.join(destination, entry.name));
  }
}

/** Retire only previously generated, unchanged files; preserve manual edits.
 * A recoverable copy stays in this run's cache, outside public print downloads. */
async function retireSuperseded(output: string, current: Record<string, string>, archive: string) {
  let previous: { sha256?: Record<string, string> };
  try { previous = JSON.parse(await readFile(path.join(output, "piricard-print.json"), "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return; throw error; }
  for (const [relative, hash] of Object.entries(previous.sha256 ?? {})) {
    if (current[relative]) continue;
    const filename = path.resolve(output, relative);
    if (!filename.startsWith(path.resolve(output) + path.sep)) throw new Error("Unsafe previous print manifest path");
    try {
      if (!(await lstat(filename)).isFile() || sha(await readFile(filename)) !== hash) continue;
    } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") continue; throw error; }
    const saved = path.join(archive, relative);
    await mkdir(path.dirname(saved), { recursive: true });
    await copyFile(filename, saved);
    await unlink(filename);
  }
}

export async function generateCards(options: CardOptions) {
  await checkPrintTools();
  const published = getPublishedBusinesses();
  if (!published.length || new Set(published.map((b) => b.slug)).size !== published.length) throw new Error("No businesses or duplicate slugs");
  const businesses = selectBusinesses(options, published);
  if (!businesses.length) throw new Error(`Unknown/unpublished business: ${options.business}`);
  const qrManifest = JSON.parse(await readFile(path.join(QR_DIR, "piricard-qrs.json"), "utf8")) as QrEntry[];
  // Single-business runs are isolated jobs; they cannot replace the all-business sheets/manifest.
  const output = options.sheet ? path.join(OUTPUT, "jobs", "final-a4") : options.proof ? path.join(OUTPUT, "proof") : options.business ? path.join(OUTPUT, "jobs", options.business) : OUTPUT;
  const sheetPrefix = options.proof ? "piricard-a4-proof" : "piricard-a4";
  const slotOffset = options.proof ? 3 : 0; // three centered slots on the A4 proof
  const stage = path.join(ROOT, ".cache/piricard-print", String(Date.now()));
  const qa = path.join(stage, "qa");
  const deliver = path.join(stage, "deliver");
  await mkdir(qa, { recursive: true }); await mkdir(deliver, { recursive: true });
  const records = [];
  const artworks = new Map<string, { front: CardArtwork; back: CardArtwork }>();
  const officialQrs = new Map<string, PrintAssets & { qr: QrEntry }>();
  const previewBuffers: Buffer[] = [];

  for (const business of businesses) {
    const assets = await loadPrintAssets(business, qrManifest);
    officialQrs.set(business.slug, assets);
    const front = PiriCardPrintTemplate(business, assets, "front");
    const back = PiriCardPrintTemplate(business, assets, "back");
    artworks.set(business.slug, { front, back });
    const dir = path.join(deliver, business.slug);
    await mkdir(dir, { recursive: true });
    const files: Record<string, string> = {};
    for (const side of ["front", "back"] as const) {
      const artwork = side === "front" ? front : back;
      for (const ext of ["svg", "png"]) files[`${side}${ext.toUpperCase()}`] = `${business.slug}/${business.slug}-${side}.${ext}`;
      if (!options.sheet) files[`${side}PDF`] = `${business.slug}/${business.slug}-${side}.pdf`;
      await writeFile(path.join(deliver, files[`${side}SVG`]), artwork.svg);
      const sidePdf = options.sheet ? path.join(qa, `${business.slug}-${side}.pdf`) : path.join(deliver, files[`${side}PDF`]);
      await writeVectorPdf([artwork.svg], sidePdf);
      await verifyPdfBoxes(sidePdf);
      await sharp(Buffer.from(roundedPreview(artwork))).resize(mmToPx(CARD.width), mmToPx(CARD.height)).withMetadata({ density: 300 }).png().toFile(path.join(deliver, files[`${side}PNG`]));
    }
    const checks = await validateComposedSvg(back.svg, assets.qr.url);
    const frontPdfSource = options.sheet ? path.join(qa, `${business.slug}-front.pdf`) : path.join(deliver, files.frontPDF);
    const backPdfSource = options.sheet ? path.join(qa, `${business.slug}-back.pdf`) : path.join(deliver, files.backPDF);
    const frontPdf = await renderPdf(frontPdfSource, path.join(qa, `${business.slug}-front-pdf`));
    const frontRenderError = await verifyPdfAppearance(front.svg, frontPdf);
    const backPdf = await renderPdf(backPdfSource, path.join(qa, `${business.slug}-back-pdf`));
    await decodeImage(backPdf, assets.qr.url, "PDF back full card 300 dpi");
    await decodeImage(backPdf, assets.qr.url, "PDF back composed QR region 300 dpi", qrPixelRegion());
    await verifyPlacedQr(backPdf, assets.officialQr, assets.qr.modules, { x: CARD.bleed + QR_RECT.x, y: CARD.bleed + QR_RECT.y });
    const backRenderError = await verifyPdfAppearance(back.svg, backPdf);
    await decodeImage(await readFile(path.join(deliver, files.backPNG)), assets.qr.url, "Rounded back preview");
    checks.push("pdf-back-full-card-300dpi", "pdf-back-qr-region-300dpi", `pdf-${CARD.qr}mm-module-grid`, "svg-pdf-front-back-appearance", "rounded-back-preview-300dpi");
    const pair = Buffer.from(previewPair(front, back, business.name));
    files.preview = `${business.slug}/${business.slug}-preview.png`;
    const preview = await sharp(pair).resize(mmToPx(CARD.width * 2 + 18), mmToPx(CARD.height + 20)).withMetadata({ density: 300 }).png().toBuffer();
    await writeFile(path.join(deliver, files.preview), preview); previewBuffers.push(preview);
    records.push({
      business: business.name, slug: business.slug, url: assets.qr.url, accent: front.accent,
      cardSize: { widthMm: CARD.width, heightMm: CARD.height }, cornerRadiusMm: CARD.radius,
      bleedMm: CARD.bleed, safeAreaMm: CARD.safe, artworkSizeMm: ART, qrSizeMm: CARD.qr, qrPositionMm: QR_RECT,
      logo: assets.logo.source, logoEffectiveDpi: assets.logo.effectiveDpi ?? "vector",
      qr: `/piricard-qrs/${assets.qr.qr}`, qrSha256: assets.qr.svgSha256,
      qrSide: "back", qrValidated: true, cardQrValidated: true, decoded: assets.qr.url, validationChecks: checks,
      svgPdfMeanChannelError: { front: frontRenderError, back: backRenderError },
      files, frontContentBoundsMm: front.boxes, backContentBoundsMm: back.boxes,
    });
    console.log(`PASS ${business.name} | SVG + PDF + rounded preview | ${assets.qr.url}`);
  }

  const instances = options.sheet ?? businesses.flatMap((business) => Array.from({ length: options.copies }, () => business.slug));
  const compactPrefix = options.sheet ? "PiriCards-A4-Print-Final" : options.proof ? "piricard-print-a4-proof" : "piricard-print-a4-final";
  const compactPages: string[] = [];
  const compactPlacements = [];
  for (let start = 0; start < instances.length; start += COMPACT.rows) {
    const slugs = instances.slice(start, start + COMPACT.rows);
    compactPages.push(compactSheetSvg(slugs.map((slug) => artworks.get(slug)!)));
    compactPlacements.push(slugs.map((slug, row) => ({ slug, row: row + 1,
      front: compactPosition(row, "front"), back: compactPosition(row, "back"), qr: compactQrRect(row) })));
  }
  const compactFilename = path.join(deliver, `${compactPrefix}.pdf`);
  await writeVectorPdf(compactPages, compactFilename, true);
  await verifyPdfBoxes(compactFilename, true, compactPages.length);
  const blankAreas = [];
  for (let page = 0; page < compactPages.length; page++) {
    const suffix = compactPages.length === 1 ? "" : `-${page + 1}`;
    await writeFile(path.join(deliver, `${compactPrefix}${suffix}.svg`), compactPages[page]);
    const rendered = await renderPdf(compactFilename, path.join(qa, `compact-a4-${page + 1}`), page + 1);
    await verifyPdfAppearance(compactPages[page], rendered);
    blankAreas.push(await verifyCompactSheetRaster(rendered, compactPlacements[page].length));
    for (const item of compactPlacements[page]) {
      const official = officialQrs.get(item.slug)!;
      const region = { x: mmToPx(item.qr.x - 1), y: mmToPx(item.qr.y - 1), width: mmToPx(CARD.qr + 2), height: mmToPx(CARD.qr + 2) };
      await decodeImage(rendered, official.qr.url, `Compact A4 page ${page + 1}, row ${item.row}, rotated QR`, region);
      await verifyPlacedQr(rendered, official.officialQr, official.qr.modules, item.qr, 90);
      const record = records.find((r) => r.slug === item.slug)!;
      if (!record.validationChecks.includes("compact-a4-90deg-qr-grid-300dpi")) record.validationChecks.push("compact-a4-90deg-qr-grid-300dpi");
    }
    // Preview comes from the final PDF itself, never from a screenshot/mockup.
    await sharp(rendered).withMetadata({ density: 300 }).png().toFile(path.join(deliver, `${compactPrefix}${suffix}-preview.png`));
  }

  // Keep the former three-business duplex command as an explicit alternate job.
  // Normal/single-business runs now produce the compact single-sided layout.
  const sheetPages = [];
  const fronts: string[] = [], backs: string[] = [];
  if (options.proof) {
  for (let start = 0; start < instances.length; start += 9) {
    const slugs = instances.slice(start, start + 9);
    fronts.push(sheetSvg(slugs.map((slug) => artworks.get(slug)!.front), false, slotOffset));
    backs.push(sheetSvg(slugs.map((slug) => artworks.get(slug)!.back), true, slotOffset));
    sheetPages.push(slugs.map((slug, index) => {
      const slot = index + slotOffset;
      return { slug, slot, front: sheetPosition(slot), back: sheetPosition(slot, true) };
    }));
  }
  for (const side of ["front", "back"] as const) {
    const pages = side === "front" ? fronts : backs;
    const filename = path.join(deliver, `${sheetPrefix}-${side}.pdf`);
    await writeVectorPdf(pages, filename, true);
    await verifyPdfBoxes(filename, true, pages.length);
    for (let page = 0; page < pages.length; page++) {
      await writeFile(path.join(deliver, `${sheetPrefix}-${side}-${page + 1}.svg`), pages[page]);
      const rendered = await renderPdf(filename, path.join(qa, `a4-${side}-${page + 1}`), page + 1);
      if (side === "back") for (const item of sheetPages[page]) {
        const record = records.find((r) => r.slug === item.slug)!;
        await decodeImage(rendered, record.url, `A4 back page ${page + 1} slot ${item.slot}`, qrPixelRegion(item.slot, true));
        const official = officialQrs.get(item.slug)!;
        await verifyPlacedQr(rendered, official.officialQr, official.qr.modules, { x: item.back.x + CARD.bleed + QR_RECT.x, y: item.back.y + CARD.bleed + QR_RECT.y });
        if (!record.validationChecks.includes("a4-pdf-qr-region-300dpi")) record.validationChecks.push("a4-pdf-qr-region-300dpi");
      }
      await verifyPdfAppearance(pages[page], rendered);
    }
  }
  // Ready-to-print duplex document: F1, B1, F2, B2... avoids accidental
  // page pairing when a job spans several sheets. Separate files remain available.
  const duplexFilename = path.join(deliver, `${sheetPrefix}-duplex.pdf`);
  await writeVectorPdf(fronts.flatMap((front, i) => [front, backs[i]]), duplexFilename, true);
  await verifyPdfBoxes(duplexFilename, true, fronts.length * 2);
  for (let page = 0; page < fronts.length; page++) {
    const frontRender = await renderPdf(duplexFilename, path.join(qa, `duplex-front-${page + 1}`), page * 2 + 1);
    await verifyPdfAppearance(fronts[page], frontRender);
    const rendered = await renderPdf(duplexFilename, path.join(qa, `duplex-back-${page + 1}`), page * 2 + 2);
    for (const item of sheetPages[page]) {
      const record = records.find((r) => r.slug === item.slug)!;
      await decodeImage(rendered, record.url, `Duplex back page ${page * 2 + 2} slot ${item.slot}`, qrPixelRegion(item.slot, true));
      if (!record.validationChecks.includes("duplex-pdf-qr-region-300dpi")) record.validationChecks.push("duplex-pdf-qr-region-300dpi");
    }
    await verifyPdfAppearance(backs[page], rendered);
  }
  if (options.proof) {
    // Also provide literally six artworks on ONE A4 for single-sided vinyl:
    // three fronts on row 1, their three backs in the same order on row 2.
    const sixUp = sheetSvg([...businesses.map((b) => artworks.get(b.slug)!.front), ...businesses.map((b) => artworks.get(b.slug)!.back)], false);
    const filename = path.join(deliver, `${sheetPrefix}-six-up.pdf`);
    await writeVectorPdf([sixUp], filename, true);
    await verifyPdfBoxes(filename, true);
    await writeFile(path.join(deliver, `${sheetPrefix}-six-up.svg`), sixUp);
    const rendered = await renderPdf(filename, path.join(qa, "proof-six-up"));
    await verifyPdfAppearance(sixUp, rendered);
    for (let i = 0; i < businesses.length; i++) {
      const record = records.find((r) => r.slug === businesses[i].slug)!;
      await decodeImage(rendered, record.url, `Six-up back ${i}`, qrPixelRegion(i + 3));
      record.validationChecks.push("proof-six-up-qr-region-300dpi");
    }
  }
  }
  // Separate vector cutting reference: never merge this line into the print artwork.
  const cut = `<svg xmlns="http://www.w3.org/2000/svg" width="${ART.width}mm" height="${ART.height}mm" viewBox="-3 -3 ${ART.width} ${ART.height}"><rect width="${CARD.width}" height="${CARD.height}" rx="${CARD.radius}" fill="none" stroke="#ff00ff" stroke-width="0.1"/></svg>`;
  await writeFile(path.join(deliver, "piricard-cr80-cut-guide.svg"), cut);
  const metas = await Promise.all(previewBuffers.map((p) => sharp(p).metadata()));
  const pairWidth = metas[0].width!, pairHeight = metas[0].height!;
  await sharp({ create: { width: pairWidth * businesses.length, height: pairHeight, channels: 3, background: "#252932" } })
    .composite(previewBuffers.map((input, i) => ({ input, left: i * pairWidth, top: 0 })))
    .withMetadata({ density: 300 }).png().toFile(path.join(deliver, "piricard-collection-preview.png"));

  const hashes: Record<string, string> = {};
  async function indexFiles(dir: string) {
    for (const file of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, file.name);
      if (file.isDirectory()) await indexFiles(full);
      else hashes[path.relative(deliver, full).split(path.sep).join("/")] = sha(await readFile(full));
    }
  }
  await indexFiles(deliver);
  const manifest = {
    schemaVersion: 3, designVersion: "final-nfc-reference-v3", generatedAt: new Date().toISOString(), scope: options.sheet ? "custom-single-sided-sheet" : options.proof ? "three-business-proof" : options.business ?? "all-published", copiesPerBusiness: options.copies,
    sheet: options.sheet ? { businesses: options.sheet } : undefined,
    proof: options.proof ? { businesses: options.proof, frontCount: 3, backCount: 3, totalArtworks: 6, finishedDuplexCards: 3, sixUp: `${sheetPrefix}-six-up.pdf` } : undefined,
    colorSpace: "RGB (DeviceRGB PDF; sRGB raster logos). No CMYK conversion, ICC output intent or PDF/X claim.",
    text: "Outlined from local Manrope Regular/Bold. No font substitution. Minimum 7.5 pt.",
    compactSheet: { pdf: `${compactPrefix}.pdf`, paperMm: { width: A4.width, height: A4.height }, columns: 2, rowsPerPage: 4,
      pieces: instances.length * 2, pageCount: compactPages.length, rotationDegrees: 90, printSides: "single-sided",
      scale: "100% / actual size; disable fit/shrink", cutSizeMm: { width: CARD.height, height: CARD.width },
      bleedMm: COMPACT.bleed, cutGapMm: COMPACT.gap, cornerRadiusMm: CARD.radius, blankAreas, pages: compactPlacements, validated: true },
    duplex: options.proof ? { paperMm: A4, flip: "long-edge", scale: "100% / actual size", backPlacement: "xBack = 210 - xFront - artworkWidth; yBack = yFront; artwork remains upright", pages: sheetPages } : undefined,
    sheets: { primary: `${compactPrefix}.pdf`, front: options.proof ? `${sheetPrefix}-front.pdf` : undefined,
      back: options.proof ? `${sheetPrefix}-back.pdf` : undefined, duplex: options.proof ? `${sheetPrefix}-duplex.pdf` : undefined, validated: true },
    businesses: records, sha256: hashes,
  };
  await writeFile(path.join(deliver, "piricard-print.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  // No official print export is published until every composed QR/PDF has passed.
  await retireSuperseded(output, hashes, path.join(stage, "superseded"));
  await copyTree(deliver, output);
  for (const [relative, expected] of Object.entries(hashes)) {
    if (sha(await readFile(path.join(output, relative))) !== expected) throw new Error(`Export copy mismatch: ${relative}`);
  }
  console.log(`Generated ${records.length} business card sets; ${compactPages.length} compact A4 page(s), ${instances.length * 2} pieces.\nPrint: ${compactFilename}\nOutput: ${output}\nPDF visual QA renders: ${qa}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  Promise.resolve().then(() => generateCards(parseOptions(process.argv.slice(2)))).catch((error) => {
    console.error("PiriCard print generation failed:", error); process.exitCode = 1;
  });
}
