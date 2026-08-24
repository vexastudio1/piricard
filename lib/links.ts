export function getSafeExternalUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function getPhoneHref(value?: string): string | undefined {
  const phone = value?.replace(/[^+\d]/g, "");
  return phone && /^\+?\d{6,15}$/.test(phone) ? `tel:${phone}` : undefined;
}

export function getWhatsAppHref(value?: string): string | undefined {
  const phone = value?.replace(/\D/g, "");
  return phone && /^\d{6,15}$/.test(phone) ? `https://wa.me/${phone}` : undefined;
}

export function getEmailHref(value?: string): string | undefined {
  const email = value?.trim();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : undefined;
}

export function getMapsHref(mapsUrl?: string, address?: string): string | undefined {
  const direct = getSafeExternalUrl(mapsUrl);
  if (direct) return direct;
  const query = address?.trim();
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : undefined;
}
