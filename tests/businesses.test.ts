import { describe, expect, it } from "vitest";
import { getBusinessBySlug, getBusinessSlugs, getPublishedBusinesses, isValidSlug } from "@/lib/businesses";

describe("business lookup", () => {
  it("resolves a known slug", () => expect(getBusinessBySlug("autoformigal")?.name).toBe("Auto Formigal"));
  it("resolves the Boi na Brasa profile", () => {
    const business = getBusinessBySlug("boi-na-brasa");
    expect(business?.name).toBe("Boi na Brasa");
    expect(business?.layoutVariant).toBe("restaurant");
  });
  it("rejects malformed and unknown slugs", () => {
    expect(isValidSlug("Auto Formigal")).toBe(false);
    expect(getBusinessBySlug("../autoformigal")).toBeUndefined();
    expect(getBusinessBySlug("unknown")).toBeUndefined();
  });
  it("keeps slugs unique", () => {
    const slugs = getBusinessSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it("exposes only published businesses in the directory", () => {
    expect(getPublishedBusinesses().every((business) => business.published)).toBe(true);
    expect(getPublishedBusinesses().map((business) => business.slug)).toEqual(["autoformigal", "boi-na-brasa"]);
  });
  it("keeps unconfirmed fields optional", () => {
    const business = getBusinessBySlug("autoformigal");
    expect(business?.contact.whatsapp).toBeUndefined();
    expect(business?.reviewUrl).toBeUndefined();
  });
});
