import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import sharp from "sharp";
import jsQR from "jsqr";
import { A4, ART, CARD, COMPACT, QR_RECT, compactCropMarks, compactPosition, cropMarks, mmToPt, mmToPx, sheetPosition, type Rect } from "./geometry";
import { placeSvg, type CardArtwork } from "./PiriCardPrintTemplate";

const exec = promisify(execFile);
const poppler = (tool: "pdfinfo" | "pdftoppm") => process.env[`PIRICARD_${tool.toUpperCase()}`] || tool;
export const hashableSvg = (value: string) => value.replace(/\r\n/g, "\n");

/** Resolve physical SVG units exactly once. On this Windows librsvg build,
 * density applied to mm viewports can be compounded, producing 1250 dpi
 * from a requested 300 dpi. Explicit pixel dimensions avoid that ambiguity. */
export async function rasterizePrintSvg(svg: string, dpi = 300): Promise<Buffer> {
  const root = svg.match(/<svg\b[^>]*>/)?.[0];
  const width = Number(root?.match(/\bwidth="([\d.]+)mm"/)?.[1]);
  const height = Number(root?.match(/\bheight="([\d.]+)mm"/)?.[1]);
  if (!(width > 0 && height > 0)) throw new Error("Print SVG requires explicit millimetre dimensions");
  const pixelSvg = svg.replace(root!, root!
    .replace(/\bwidth="[^"]*"/, `width="${mmToPx(width, dpi)}"`)
    .replace(/\bheight="[^"]*"/, `height="${mmToPx(height, dpi)}"`));
  return sharp(Buffer.from(pixelSvg), { density: 72 }).png().toBuffer();
}

export async function checkPrintTools() {
  for (const tool of ["pdfinfo", "pdftoppm"] as const) {
    try { await exec(poppler(tool), ["-v"], { windowsHide: true }); }
    catch { throw new Error(`Install Poppler (${tool}) on PATH or set PIRICARD_${tool.toUpperCase()}. PDF validation is mandatory.`); }
  }
}

export async function writeVectorPdf(svgs: string[], filename: string, sheet = false) {
  const width = sheet ? A4.width : ART.width;
  const height = sheet ? A4.height : ART.height;
  const doc = new PDFDocument({ autoFirstPage: false, compress: true, info: { Title: "PiriCard - CR80 print artwork", Author: "PiriCard", Subject: "RGB vector artwork. Print at 100%." } });
  const catalog = (doc as unknown as { _root: { data: Record<string, unknown> } })._root;
  catalog.data.ViewerPreferences = doc.ref({ PrintScaling: "None" });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  for (const svg of svgs) {
    doc.addPage({ size: [mmToPt(width), mmToPt(height)], margin: 0 });
    // PDF boxes use bottom-left coordinates; symmetric bleed makes both axes equal.
    const page = doc.page as typeof doc.page & { dictionary: { data: Record<string, unknown> } };
    page.dictionary.data.BleedBox = [0, 0, mmToPt(width), mmToPt(height)];
    page.dictionary.data.TrimBox = sheet ? [0, 0, mmToPt(width), mmToPt(height)] :
      [mmToPt(CARD.bleed), mmToPt(CARD.bleed), mmToPt(CARD.bleed + CARD.width), mmToPt(CARD.bleed + CARD.height)];
    // Set the outer PDF viewport explicitly in points. svg-to-pdfkit's mm
    // parsing otherwise combines 96-dpi CSS units with assumePt and scales
    // physical artwork by 4/3, despite a dimensionally correct MediaBox.
    const pdfSvg = svg.replace(/<svg\b[^>]*>/, (tag) => tag
      .replace(/\s(?:width|height)="[^"]*"/g, "")
      .replace(/>$/, ` width="${mmToPt(width)}" height="${mmToPt(height)}">`));
    SVGtoPDF(doc as unknown as Parameters<typeof SVGtoPDF>[0], pdfSvg, 0, 0, {
      width: mmToPt(width), height: mmToPt(height), assumePt: true, precision: 5,
      warningCallback: (warning) => { throw new Error(`Vector PDF conversion warning: ${warning}`); },
    });
  }
  doc.end();
  await writeFile(filename, await done);
}

export function sheetSvg(cards: CardArtwork[], back: boolean, slotOffset = 0): string {
  const body = cards.map((card, slot) => {
    const rect = sheetPosition(slot + slotOffset, back);
    return placeSvg(card.svg, rect) + cropMarks(rect);
  }).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297"><rect width="210" height="297" fill="#ffffff"/>${body}</svg>`;
}

/** No perspective, scaling or presentation backdrop: just eight flat pieces.
 * Rotate the complete portrait artwork, then clip only the sheet bleed. */
export function compactSheetSvg(pairs: { front: CardArtwork; back: CardArtwork }[]): string {
  if (!pairs.length || pairs.length > COMPACT.rows) throw new Error("Compact A4 requires 1..4 business pairs");
  const body = pairs.flatMap((pair, row) => (["front", "back"] as const).map((side) => {
    const rect = compactPosition(row, side);
    const id = `compact-clip-${row}-${side}`;
    return `<g data-row="${row + 1}" data-side="${side}" transform="translate(${rect.x + CARD.height} ${rect.y}) rotate(90)"><defs><clipPath id="${id}"><rect x="${-COMPACT.bleed}" y="${-COMPACT.bleed}" width="${CARD.width + 2 * COMPACT.bleed}" height="${CARD.height + 2 * COMPACT.bleed}" rx="${CARD.radius + COMPACT.bleed}"/></clipPath></defs><g clip-path="url(#${id})">${pair[side].body}</g></g>${compactCropMarks(rect)}`;
  })).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297"><title>PiriCard - compact A4 - actual size - single sided</title><rect width="210" height="297" fill="#ffffff"/>${body}</svg>`;
}

/** Check physical card edges and the entirely white reusable strip in the PDF,
 * independently of SVG/PDF visual similarity and QR decoding. */
export async function verifyCompactSheetRaster(image: Buffer, rows: number) {
  const { data, info } = await sharp(image).flatten({ background: "#ffffff" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const sample = (x: number, y: number) => {
    const offset = (Math.floor(y * 300 / 25.4) * info.width + Math.floor(x * 300 / 25.4)) * info.channels;
    return Array.from(data.subarray(offset, offset + 3));
  };
  for (let row = 0; row < rows; row++) for (const side of ["front", "back"] as const) {
    const rect = compactPosition(row, side);
    for (const edge of [0, 1]) {
      const x = rect.x + edge * rect.width;
      const y = rect.y + edge * rect.height;
      const direction = edge ? 1 : -1;
      if (sample(x, rect.y + rect.height / 2).some((v) => v > 100) || sample(rect.x + rect.width / 2, y).some((v) => v > 100)) throw new Error("Compact card edge missing at physical cut dimension");
      if (sample(x + direction * (COMPACT.bleed + 0.2), rect.y + rect.height / 2).some((v) => v < 250) || sample(rect.x + rect.width / 2, y + direction * (COMPACT.bleed + 0.2)).some((v) => v < 250)) throw new Error("Compact artwork extends beyond specified bleed");
    }
  }
  const blankFromMm = compactPosition(rows - 1, "back").y + CARD.width + COMPACT.markEnd + 0.2;
  const firstRow = Math.ceil(blankFromMm * 300 / 25.4);
  for (let offset = firstRow * info.width * info.channels; offset < data.length; offset++) {
    if (data[offset] < 250) throw new Error("Reusable bottom strip is not clean white");
  }
  return { blankFromMm, blankHeightMm: A4.height - blankFromMm };
}

export async function decodeImage(image: Buffer, expected: string, label: string, region?: Rect) {
  let source = sharp(image);
  if (region) source = source.extract({ left: Math.round(region.x), top: Math.round(region.y), width: Math.round(region.width), height: Math.round(region.height) });
  const { data, info } = await source.flatten({ background: "#ffffff" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const decoded = jsQR(new Uint8ClampedArray(data), info.width, info.height, { inversionAttempts: "dontInvert" });
  if (decoded?.data !== expected) throw new Error(`${label}: expected ${expected}, decoded ${decoded?.data ?? "NOTHING"}`);
  return decoded.data;
}

export async function validateComposedSvg(svg: string, url: string) {
  const results: string[] = [];
  for (const dpi of [300, 150]) {
    const png = await rasterizePrintSvg(svg, dpi);
    await decodeImage(png, url, `Composed SVG ${dpi} dpi`);
    results.push(`svg-full-card-${dpi}dpi`);
  }
  return results;
}

/** Assert placement/scale against the official module grid at known print mm.
 * A QR that merely decodes at the wrong physical size must not pass. */
export async function verifyPlacedQr(image: Buffer, officialSvg: string, modules: number, origin: { x: number; y: number }, rotation: 0 | 90 = 0) {
  const extent = modules + 8;
  const reference = await sharp(Buffer.from(officialSvg)).resize(extent * 8, extent * 8).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const final = await sharp(image).flatten({ background: "#ffffff" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const center = (extent - 1) / 2;
  for (let row = 0; row < extent; row++) for (let col = 0; col < extent; col++) {
    // The original center symbol has fine non-module artwork; test the
    // complete QR grid and quiet zone around that unchanged official area.
    if (Math.abs(row - center) <= 3 && Math.abs(col - center) <= 3) continue;
    const refOffset = ((row * 8 + 4) * reference.info.width + col * 8 + 4) * reference.info.channels;
    const expected = reference.data[refOffset] < 128;
    const u = (col + 0.5) * CARD.qr / extent, v = (row + 0.5) * CARD.qr / extent;
    const px = Math.floor((origin.x + (rotation === 90 ? CARD.qr - v : u)) * 300 / 25.4);
    const py = Math.floor((origin.y + (rotation === 90 ? u : v)) * 300 / 25.4);
    const offset = (py * final.info.width + px) * final.info.channels;
    if ((final.data[offset] < 128) !== expected) throw new Error(`Printed QR size/placement/quiet-zone mismatch at module ${row},${col}`);
  }
}

/** Independent renderers must agree on the composed artwork, including backs. */
export async function verifyPdfAppearance(svg: string, pdfRender: Buffer) {
  // Materialize at 300 dpi first. Resizing SVG directly to a different ratio
  // changes its viewport/preserveAspectRatio; resizing a PNG does not.
  const referencePng = await rasterizePrintSvg(svg);
  const target = await sharp(referencePng).resize(360, 550, { fit: "fill" }).flatten({ background: "#ffffff" }).removeAlpha().raw().toBuffer();
  const actual = await sharp(pdfRender).resize(360, 550, { fit: "fill" }).flatten({ background: "#ffffff" }).removeAlpha().raw().toBuffer();
  let difference = 0;
  for (let i = 0; i < target.length; i++) difference += Math.abs(target[i] - actual[i]);
  const meanError = difference / target.length;
  if (meanError > 5) throw new Error(`SVG/PDF appearance differs (mean channel error ${meanError.toFixed(2)}/255)`);
  return Number(meanError.toFixed(3));
}

export async function verifyPdfBoxes(filename: string, sheet = false, pages = 1) {
  const { stdout } = await exec(poppler("pdfinfo"), ["-f", "1", "-l", String(pages), "-box", filename], { windowsHide: true });
  const pageCount = Number(stdout.match(/Pages:\s+(\d+)/)?.[1]);
  if (pageCount !== pages) throw new Error(`Unexpected PDF page count: ${filename}`);
  const expected = sheet ? [0, 0, mmToPt(A4.width), mmToPt(A4.height)] : [0, 0, mmToPt(ART.width), mmToPt(ART.height)];
  const expectedTrim = sheet ? expected : [mmToPt(3), mmToPt(3), mmToPt(CARD.width + 3), mmToPt(CARD.height + 3)];
  for (const [box, values] of [["MediaBox", expected], ["BleedBox", expected], ["TrimBox", expectedTrim]] as const) {
    const matches = [...stdout.matchAll(new RegExp(`${box}:\\s+([\\d.-]+)\\s+([\\d.-]+)\\s+([\\d.-]+)\\s+([\\d.-]+)`, "g"))];
    // pdfinfo rounds to two decimals; 0.011 pt < 0.004 mm.
    if (matches.length !== pages || matches.some((match) => match.slice(1).map(Number).some((v, i) => Math.abs(v - values[i]) > 0.011))) throw new Error(`Incorrect ${box}: ${filename}`);
  }
  return { pages: pageCount, mediaMm: sheet ? [A4.width, A4.height] : [ART.width, ART.height], trimMm: sheet ? [A4.width, A4.height] : [CARD.width, CARD.height] };
}

export async function renderPdf(filename: string, outputPrefix: string, page = 1, dpi = 300): Promise<Buffer> {
  await exec(poppler("pdftoppm"), ["-f", String(page), "-l", String(page), "-singlefile", "-r", String(dpi), "-png", filename, outputPrefix], { windowsHide: true, maxBuffer: 1024 * 1024 * 4 });
  return readFile(`${outputPrefix}.png`);
}

export function qrPixelRegion(sheetSlot?: number, back = false): Rect {
  const placement = sheetSlot === undefined ? { x: 0, y: 0 } : sheetPosition(sheetSlot, back);
  // Extra 1 mm comes from the FINAL card around the original QR, never from a replacement QR render.
  return {
    x: mmToPx(placement.x + CARD.bleed + QR_RECT.x - 1),
    y: mmToPx(placement.y + CARD.bleed + QR_RECT.y - 1),
    width: mmToPx(CARD.qr + 2), height: mmToPx(CARD.qr + 2),
  };
}
