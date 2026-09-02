import { afterEach, describe, expect, it } from "vitest";
import QRCode from "qrcode";
import { buildBrandedSvg, loadSymbol, productionProfileUrl, qrAssetStem, validateGeometry, validateSvg } from "../scripts/generate-piricard-qrs";

const originalOrigin = process.env.NEXT_PUBLIC_SITE_URL;
afterEach(() => {
  if (originalOrigin === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = originalOrigin;
});

describe("official print QR safety", () => {
  it("uses the requested permanent PiriLight QR asset names", () => {
    expect(qrAssetStem("pirilight")).toBe("pirilight-qr");
    expect(qrAssetStem("boi-na-brasa")).toBe("boi-na-brasa");
  });
  it.each(["http://localhost:3000", "https://preview.example.test", "invalid"])(
    "never prints development or preview origins: %s", (origin) => {
      process.env.NEXT_PUBLIC_SITE_URL = origin;
      expect(productionProfileUrl("future-business")).toBe("https://card.pirilight.pt/future-business");
    },
  );

  it.each(["../admin", "a/b", "", "OFT Racing", "foo?tracking=1"])(
    "rejects unsafe slugs before writing files: %s", (slug) => {
      expect(() => productionProfileUrl(slug)).toThrow("Unsafe business slug");
    },
  );

  it("decodes an unseen business with the actual vector symbol, and rejects a wrong payload", async () => {
    const url = productionProfileUrl("new-business");
    const result = buildBrandedSvg(url, await loadSymbol());
    await validateGeometry(result);
    expect(await validateSvg(result.svg, url, result.extent)).toHaveLength(8);
    await expect(validateSvg(result.svg, productionProfileUrl("other-business"), result.extent)).rejects.toThrow("expected");
  });

  it("detects damaged quiet zones in the final rendered SVG", async () => {
    const result = buildBrandedSvg(productionProfileUrl("new-business"), await loadSymbol());
    result.svg = result.svg.replace(/<rect ([^>]+)fill="#ffffff"\/>/, '<rect $1fill="#000000"/>');
    await expect(validateGeometry(result)).rejects.toThrow("Quiet zone or QR structure modified");
  });

  it("avoids central alignment patterns for longer future URLs and still decodes", async () => {
    const symbol = await loadSymbol();
    const url = productionProfileUrl("long-future-business-profile-with-a-longer-name-than-current-profiles");
    const minimum = QRCode.create(url, { errorCorrectionLevel: "H" });
    // This payload needs a version with a central alignment pattern. The
    // generator must safely select another version without changing the URL.
    expect(minimum.modules.isReserved((minimum.modules.size - 1) / 2, (minimum.modules.size - 1) / 2)).toBeTruthy();
    const result = buildBrandedSvg(url, symbol);
    expect(result.qr.version).toBeGreaterThan(minimum.version);
    await validateGeometry(result);
    expect(await validateSvg(result.svg, url, result.extent)).toHaveLength(8);
  }, 15000);

  it("rejects raster content even if its surrounding QR could be decoded", async () => {
    const result = buildBrandedSvg(productionProfileUrl("new-business"), await loadSymbol());
    await expect(validateSvg(result.svg.replace("</svg>", '<image href="data:image/png;base64,AAAA"/></svg>'), "", result.extent))
      .rejects.toThrow("raster");
  });
});
