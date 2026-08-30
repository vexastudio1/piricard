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

/**
 * Filename of a business's offline PiriCard PDF sheet, e.g. "piricard-boi-na-brasa.pdf".
 * Single source of truth shared by scripts/generate-pdfs.tsx (what it writes
 * to public/pdfs/) and every "Guardar contacto" call site (what it fetches
 * and offers as the download name) — keeps the two from drifting apart.
 */
export function getPiriCardPdfFilename(slug: string): string {
  return `piricard-${slug}.pdf`;
}

/** Public path to a business's offline PiriCard PDF, e.g. "/pdfs/piricard-boi-na-brasa.pdf". */
export function getPiriCardPdfPath(slug: string): string {
  return `/pdfs/${getPiriCardPdfFilename(slug)}`;
}
