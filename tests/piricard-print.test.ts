import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { getPublishedBusinesses, type Business } from "../lib/businesses";
import { A4, ART, CARD, COMPACT, QR_RECT, assertSafe, compactCropMarks, compactPosition, compactQrRect, mmToPt, mmToPx, sheetPosition, cropMarks } from "../lib/print/geometry";
import { PiriCardPrintTemplate, ROOT, accentFor } from "../lib/print/PiriCardPrintTemplate";
import { compactSheetSvg, decodeImage, rasterizePrintSvg, verifyCompactSheetRaster, verifyPdfAppearance, verifyPlacedQr } from "../lib/print/export";
import { loadPrintAssets, parseOptions, selectBusinesses } from "../scripts/generate-piricard-cards";

describe("CR80 production geometry", () => {
  it("keeps exact portrait trim, bleed and a practical QR", () => {
    expect([CARD.width, CARD.height, CARD.radius]).toEqual([53.98, 85.6, 3.18]);
    expect([ART.width, ART.height]).toEqual([59.98, 91.6]);
    expect(mmToPt(CARD.width) * 25.4 / 72).toBeCloseTo(53.98, 10);
    expect(QR_RECT.width).toBe(34);
    expect(() => assertSafe(QR_RECT, "QR")).not.toThrow();
  });

  it("mirrors all nine duplex slots for long-edge flip, including the asymmetric last row", () => {
    for (let slot = 0; slot < 9; slot++) {
      const front = sheetPosition(slot), back = sheetPosition(slot, true);
      expect(A4.width - back.x - back.width).toBeCloseTo(front.x, 10);
      expect(back.y).toBe(front.y);
      expect(back.width).toBe(ART.width);
      expect(back.height).toBe(ART.height);
      expect(front.x - 1.8).toBeGreaterThan(5);
      expect(front.y - 1.8).toBeGreaterThan(5);
      expect(front.x + front.width + 1.8).toBeLessThan(205);
      expect(front.y + front.height + 1.8).toBeLessThan(292);
      const mirroredSlot = Math.floor(slot / 3) * 3 + 2 - slot % 3;
      expect(back.x).toBeCloseTo(sheetPosition(mirroredSlot).x, 10);
    }
    expect(sheetPosition(3, true).x).toBeCloseTo(sheetPosition(5).x, 10);
  });

  it("keeps bleeds and crop marks apart without reducing the cards", () => {
    const first = sheetPosition(0), next = sheetPosition(1);
    expect(next.x - first.x - first.width).toBeCloseTo(4, 10);
    expect(next.x - 1.8).toBeGreaterThan(first.x + first.width + 1.8);
    expect(cropMarks(first).match(/<path/g)).toHaveLength(8);
    expect(cropMarks(first)).toContain(`M${first.x + 3} ${first.y - 1.8}`);
  });

  it.each([{ x: 4, y: 5, width: 10, height: 10 }, { x: 5, y: 5, width: 50, height: 5 }, { x: NaN, y: 5, width: 5, height: 5 }])("fails unsafe content bounds", (rect) => {
    expect(() => assertSafe(rect, "test")).toThrow("Unsafe/clipped");
  });
});

describe("reusable print inputs", () => {
  it("does not maintain a second client palette", () => {
    for (const business of getPublishedBusinesses()) expect(accentFor(business)).toBe(business.theme.accent);
    const future = structuredClone(getPublishedBusinesses()[0]);
    future.theme.accent = "";
    expect(accentFor(future)).toBe("#4f8ffb");
  });

  it("supports a single business and copies without guessing a business", () => {
    expect(parseOptions([])).toEqual({ copies: 1 });
    expect(parseOptions(["--business=oft-racing", "--copies=10"])).toEqual({ business: "oft-racing", copies: 10 });
  });
  it("supports an ordered compact sheet with intentional duplicates", () => {
    const options = parseOptions(["--sheet=boi-na-brasa,boi-na-brasa,oft-racing,pirilight"]);
    expect(options.sheet).toEqual(["boi-na-brasa", "boi-na-brasa", "oft-racing", "pirilight"]);
    expect(selectBusinesses(options).map((business) => business.slug)).toEqual(["boi-na-brasa", "oft-racing", "pirilight"]);
  });
  it.each(["--business=../admin", "--copies=0", "--copies=1.5", "--copies=101", "--unknown=1"])("rejects invalid CLI options: %s", (arg) => {
    expect(() => parseOptions([arg])).toThrow();
  });
  it.each(["--sheet=", "--sheet=a,b,c,d,e", "--sheet=a,../b", "--sheet=a --copies=2"])("rejects invalid sheet options: %s", (input) => {
    expect(() => parseOptions(input.split(" "))).toThrow();
  });

  it("uses actual approved assets and checks every business's physical text bounds", async () => {
    const qrManifest = JSON.parse(await readFile(path.join(ROOT, "public/piricard-qrs/piricard-qrs.json"), "utf8"));
    for (const business of getPublishedBusinesses()) {
      const assets = await loadPrintAssets(business, qrManifest);
      const front = PiriCardPrintTemplate(business, assets, "front");
      const back = PiriCardPrintTemplate(business, assets, "back");
      expect(front.svg).toContain('viewBox="-3 -3 59.98 91.6"');
      expect(front.svg).not.toContain("<text");
      expect(back.boxes.filter((box) => box.label.startsWith("Official QR"))).toHaveLength(1);
      expect(front.boxes.some((box) => box.label.startsWith("Official QR"))).toBe(false);
      expect(back.boxes.filter((box) => box.fontPt).map((box) => box.label)).toEqual(["Lê o QR", "ou encosta o teu", "telemóvel com NFC"]);
      expect(front.boxes.some((box) => box.label === "NFC phone and contactless waves")).toBe(true);
      expect(front.boxes.filter((box) => box.label === "PiriCard symbol")).toHaveLength(1);
      expect(back.boxes.some((box) => box.label === "PiriCard symbol")).toBe(false);
      for (const removed of ["O teu negócio", "num toque.", "Uma ligação.", "card.pirilight.pt"]) {
        expect(front.boxes.some((box) => box.label.includes(removed))).toBe(false);
      }
      expect(front.boxes.find((box) => box.label === business.name)?.fontPt).toBe(9);
      expect(front.svg).not.toContain("reference.png");
      expect(front.svg.match(/<image\b/g)?.length ?? 0).toBe(assets.logo.dataUri ? 1 : 0);
      if (assets.logo.dataUri) expect(front.svg).toContain(`href="${assets.logo.dataUri}"`);
      if (business.slug === "pirilight") {
        expect(assets.logo.source).toBe("/brand/piricard-symbol.svg");
        expect(assets.logo.svg).toContain("#4f8ffb");
        expect(front.svg).toContain('viewBox="0 0 1159.4398 1106.7207"');
      }
      expect(back.svg).not.toContain("<image");
      for (const box of [...front.boxes, ...back.boxes]) {
        expect(() => assertSafe(box, box.label)).not.toThrow();
        if (box.fontPt) expect(box.fontPt).toBeGreaterThanOrEqual(7.5);
      }
    }
  }, 15000);

  it("fails on a missing official QR rather than generating a replacement", async () => {
    await expect(loadPrintAssets(getPublishedBusinesses()[0], [])).rejects.toThrow("generate:qrs");
  });

  it("compares A4 artwork without changing its viewport ratio", async () => {
    // An asymmetric calibration graphic exposes SVG letterboxing without
    // repeatedly rendering large customer logos in this focused regression.
    const sheet = '<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297"><rect width="210" height="297" fill="#101217"/><path d="M10 10H190V100H10Z" fill="#ffffff"/></svg>';
    const reference = await rasterizePrintSvg(sheet);
    const metadata = await sharp(reference).metadata();
    expect([metadata.width, metadata.height]).toEqual([2480, 3508]);
    expect(await verifyPdfAppearance(sheet, reference)).toBe(0);
  }, 15000);

  it("catches physical placement errors even when the QR itself remains decodable", async () => {
    const business = getPublishedBusinesses()[0];
    const qrManifest = JSON.parse(await readFile(path.join(ROOT, "public/piricard-qrs/piricard-qrs.json"), "utf8"));
    const assets = await loadPrintAssets(business, qrManifest);
    const back = PiriCardPrintTemplate(business, assets, "back");
    const image = await sharp(Buffer.from(back.svg)).resize(mmToPx(ART.width), mmToPx(ART.height)).png().toBuffer();
    const origin = { x: CARD.bleed + QR_RECT.x, y: CARD.bleed + QR_RECT.y };
    await verifyPlacedQr(image, assets.officialQr, assets.qr.modules, origin);
    await expect(verifyPlacedQr(image, assets.officialQr, assets.qr.modules, { ...origin, x: origin.x + 2 })).rejects.toThrow("size/placement");
    const longName = { ...business, name: "x".repeat(120) } as Business;
    expect(() => PiriCardPrintTemplate(longName, assets, "front")).toThrow("Unsafe/clipped");
  }, 10000);
});

describe("compact A4 vinyl sheet", () => {
  it("packs eight full-size pieces in business pairs, with exterior crop marks and a clean bottom strip", () => {
    for (let row = 0; row < 4; row++) {
      const front = compactPosition(row, "front"), back = compactPosition(row, "back");
      expect([front.width, front.height]).toEqual([85.6, 53.98]);
      expect(back.y).toBe(front.y);
      expect(back.x - front.x - front.width).toBeCloseTo(4, 10);
      expect(front.x - COMPACT.markEnd).toBeGreaterThan(5);
      expect(front.y - COMPACT.markEnd).toBeGreaterThan(5);
      expect(back.x + back.width + COMPACT.markEnd).toBeLessThan(205);
      if (row) expect(front.y - compactPosition(row - 1, "front").y - front.height).toBeCloseTo(4, 10);
      expect(compactCropMarks(front).match(/<path/g)).toHaveLength(8);
      expect(COMPACT.markStart).toBeGreaterThan(COMPACT.bleed);
      expect(COMPACT.markEnd * 2).toBeLessThan(COMPACT.gap);
    }
    const last = compactPosition(3, "back");
    expect(297 - last.y - last.height - COMPACT.markEnd).toBeGreaterThan(57);
    expect(() => compactPosition(4, "front")).toThrow();
  });

  it("keeps each rotated QR at its true physical size and detects the wrong rotation", async () => {
    const manifest = JSON.parse(await readFile(path.join(ROOT, "public/piricard-qrs/piricard-qrs.json"), "utf8"));
    const business = getPublishedBusinesses()[0];
    const assets = await loadPrintAssets(business, manifest);
    const front = PiriCardPrintTemplate(business, assets, "front"), back = PiriCardPrintTemplate(business, assets, "back");
    const svg = compactSheetSvg([{ front, back }]);
    expect(svg).toContain('width="210mm" height="297mm"');
    expect(svg.match(/rotate\(90\)/g)).toHaveLength(2);
    const png = await rasterizePrintSvg(svg);
    const qr = compactQrRect(0);
    await decodeImage(png, assets.qr.url, "Rotated A4", { x: mmToPx(qr.x - 1), y: mmToPx(qr.y - 1), width: mmToPx(CARD.qr + 2), height: mmToPx(CARD.qr + 2) });
    await verifyPlacedQr(png, assets.officialQr, assets.qr.modules, qr, 90);
    await expect(verifyPlacedQr(png, assets.officialQr, assets.qr.modules, qr)).rejects.toThrow("size/placement");
    expect((await verifyCompactSheetRaster(png, 1)).blankHeightMm).toBeGreaterThan(230);
  }, 60000);
});

describe("three-business print proof", () => {
  it("preserves the selected order and never silently adds the fourth business", () => {
    const published = getPublishedBusinesses();
    const slugs = [published[2].slug, published[0].slug, published[1].slug];
    const options = parseOptions([`--proof=${slugs.join(",")}`]);
    expect(options.copies).toBe(1);
    expect(selectBusinesses(options).map((b) => b.slug)).toEqual(slugs);
    expect(selectBusinesses(options)).toHaveLength(3);
    for (const slot of [3, 4, 5]) {
      const front = sheetPosition(slot), back = sheetPosition(slot, true);
      expect(front.y).toBeCloseTo((297 - ART.height) / 2);
      expect(210 - back.x - back.width).toBeCloseTo(front.x, 10);
    }
  });
  it.each([
    ["--proof=a,b"], ["--proof=a,b,c,d"], ["--proof=a,a,c"],
    ["--proof=a,b,../c"], ["--proof=a,b,c", "--copies=2"],
    ["--proof=a,b,c", "--business=a"],
  ])("rejects a proof that is not exactly three distinct businesses: %j", (...args) => {
    expect(() => parseOptions(args)).toThrow();
  });
  it("fails on unknown or unpublished selections instead of silently dropping them", () => {
    expect(() => selectBusinesses(parseOptions(["--proof=unknown-a,unknown-b,unknown-c"]))).toThrow("Unknown/unpublished");
  });
});
