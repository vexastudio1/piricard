import { describe, expect, it } from "vitest";
import type { Business } from "@/lib/businesses";
import { createVCard, escapeVCardValue, foldVCardLine, normalizeVCardPhone } from "@/lib/vcard";

const business: Business = {
  slug: "teste",
  name: "Oficina, São João",
  organization: "Empresa; Lda.",
  category: "Oficina",
  published: true,
  featured: false,
  indexable: false,
  directoryDescription: "Linha um",
  profileDescription: "Linha um\nLinha dois",
  contact: { website: "https://example.com" },
  assets: {},
  theme: { primary: "#ffffff", secondary: "#000000", accent: "#00ff00", background: "#000000", surface: "#111111", text: "#ffffff", mutedText: "#aaaaaa", border: "#333333", appearance: "dark", fontFamily: "modern" },
  layoutVariant: "editorial",
};

describe("vCard generation", () => {
  it("escapes reserved characters and new lines", () => expect(escapeVCardValue("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne"));
  it("normalizes phone numbers without changing invalid values", () => {
    expect(normalizeVCardPhone("+351 261 858 239")).toBe("+351261858239");
    expect(normalizeVCardPhone("extension 12")).toBe("extension 12");
  });
  it("folds long lines on UTF-8 byte boundaries", () => {
    const folded = foldVCardLine(`NOTE:${"Reparação automóvel ".repeat(8)}`);
    expect(folded.length).toBeGreaterThan(1);
    expect(folded.slice(1).every((line) => line.startsWith(" "))).toBe(true);
    expect(folded.every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
  });
  it("uses CRLF and omits missing properties", () => {
    const card = createVCard(business, { profileUrl: "https://card.pirilight.pt/teste", logoUrl: "https://card.pirilight.pt/logo.png" });
    const unfolded = card.replace(/\r\n /g, "");
    expect(unfolded).toContain("FN:Oficina\\, São João\r\n");
    expect(unfolded).toContain("N:;Oficina\\, São João;;;\r\n");
    expect(unfolded).toContain("ORG:Empresa\\; Lda.\r\n");
    expect(unfolded).toContain("TITLE:Oficina\r\n");
    expect(unfolded).toContain("URL;TYPE=PREF:https://card.pirilight.pt/teste\r\n");
    expect(unfolded).toContain("PHOTO;VALUE=URI:https://card.pirilight.pt/logo.png\r\n");
    expect(unfolded).not.toContain("TEL;");
    expect(unfolded).not.toContain("EMAIL;");
    expect(card.endsWith("END:VCARD\r\n")).toBe(true);
  });
});
