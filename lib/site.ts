const productionFallback = "https://card.pirilight.pt";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidate = configured || productionFallback;

  try {
    const url = new URL(candidate);
    return url.origin;
  } catch {
    return productionFallback;
  }
}

export function getCanonicalProfileUrl(slug: string): string {
  return new URL(`/${encodeURIComponent(slug)}`, `${getSiteUrl()}/`).toString();
}
