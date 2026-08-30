import { describe, expect, it } from "vitest";
import { getBusinessBySlug, getBusinessSlugs, getPublishedBusinesses, isValidSlug } from "@/lib/businesses";

describe("business lookup", () => {
  it("resolves a known slug", () => expect(getBusinessBySlug("autoformigal")?.name).toBe("Auto Formigal"));
  it("resolves the Boi na Brasa profile", () => {
    const business = getBusinessBySlug("boi-na-brasa");
    expect(business?.name).toBe("Boi na Brasa");
    expect(business?.layoutVariant).toBe("restaurant");
  });
  it("resolves the OFT Racing profile", () => {
    const business = getBusinessBySlug("oft-racing");
    expect(business?.name).toBe("OFT Racing Shop");
    expect(business?.layoutVariant).toBe("racing");
    expect(business?.contact.phone).toBe("+351913321091");
  });
  it("resolves the Beauty Connection 360 profile", () => {
    const business = getBusinessBySlug("beauty-connection-360");
    expect(business?.name).toBe("Beauty Connection 360");
    expect(business?.layoutVariant).toBe("beauty");
    // Phone/WhatsApp were explicitly confirmed by the site owner (see the
    // contact note in lib/businesses.ts); email now matches the same
    // website source as the confirmed phone, not the Instagram-highlight
    // alternate (geral.connectionbeauty@gmail.com).
    expect(business?.contact.phone).toBe("+351916754795");
    expect(business?.contact.whatsapp).toBe("+351916754795");
    expect(business?.contact.email).toBe("geral@beautyconnection360.com");
    expect(business?.location?.streetAddress).toBe("Rua Serpa Pinto 9A");
    expect(business?.reviewUrl).toBeUndefined();
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
    expect(getPublishedBusinesses().map((business) => business.slug)).toEqual(["autoformigal", "beauty-connection-360", "boi-na-brasa", "oft-racing"]);
  });
  it("keeps unconfirmed fields optional", () => {
    const business = getBusinessBySlug("autoformigal");
    expect(business?.contact.whatsapp).toBeUndefined();
    expect(business?.reviewUrl).toBeUndefined();
  });
});
