import { afterEach, describe, expect, it } from "vitest";
import { getCanonicalProfileUrl, getSiteUrl } from "@/lib/site";

const original = process.env.NEXT_PUBLIC_SITE_URL;
afterEach(() => { process.env.NEXT_PUBLIC_SITE_URL = original; });

describe("site URLs", () => {
  it("normalizes the configured origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://card.pirilight.pt/base";
    expect(getSiteUrl()).toBe("https://card.pirilight.pt");
    expect(getCanonicalProfileUrl("autoformigal")).toBe("https://card.pirilight.pt/autoformigal");
  });
  it("falls back safely when the configuration is invalid", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "not a URL";
    expect(getSiteUrl()).toBe("https://card.pirilight.pt");
  });
});
