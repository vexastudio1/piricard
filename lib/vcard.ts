import type { Business } from "@/lib/businesses";

interface VCardOptions {
  profileUrl?: string;
  logoUrl?: string;
}

export function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

export function normalizeVCardPhone(value: string): string {
  const normalized = value.trim().replace(/[^+\d]/g, "").replace(/(?!^)\+/g, "");
  return /^\+?\d{6,15}$/.test(normalized) ? normalized : value.trim();
}

export function foldVCardLine(line: string): string[] {
  const encoder = new TextEncoder();
  const folded: string[] = [];
  let current = "";

  for (const character of line) {
    if (encoder.encode(current + character).length > 75) {
      folded.push(current);
      current = ` ${character}`;
    } else {
      current += character;
    }
  }

  folded.push(current);
  return folded;
}

export function createVCard(business: Business, options: VCardOptions = {}): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCardValue(business.name)}`,
    `N:;${escapeVCardValue(business.name)};;;`,
    `ORG:${escapeVCardValue(business.organization)}`,
    `TITLE:${escapeVCardValue(business.category)}`,
  ];

  if (business.contact.phone) lines.push(`TEL;TYPE=WORK,VOICE:${escapeVCardValue(normalizeVCardPhone(business.contact.phone))}`);
  if (business.contact.whatsapp && business.contact.whatsapp !== business.contact.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(normalizeVCardPhone(business.contact.whatsapp))}`);
  }
  if (business.contact.email) lines.push(`EMAIL;TYPE=WORK:${escapeVCardValue(business.contact.email)}`);
  if (business.contact.website) lines.push(`URL;TYPE=WORK:${escapeVCardValue(business.contact.website)}`);
  if (business.location?.address) {
    const street = business.location.streetAddress ?? business.location.address;
    lines.push(`ADR;TYPE=WORK:;;${escapeVCardValue(street)};${escapeVCardValue(business.location.city ?? "")};;;${escapeVCardValue(business.location.country ?? "")}`);
  }
  if (business.profileDescription) lines.push(`NOTE:${escapeVCardValue(business.profileDescription)}`);
  if (options.profileUrl) lines.push(`URL;TYPE=PREF:${escapeVCardValue(options.profileUrl)}`);
  if (options.logoUrl) lines.push(`PHOTO;VALUE=URI:${escapeVCardValue(options.logoUrl)}`);
  lines.push("END:VCARD");
  return `${lines.flatMap(foldVCardLine).join("\r\n")}\r\n`;
}

export function getVCardFilename(business: Business): string {
  const safeName = business.slug.replace(/[^a-z0-9-]/g, "");
  return `${safeName || "contacto"}.vcf`;
}
