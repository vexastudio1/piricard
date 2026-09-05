import { getPublishedDirectoryBusinesses, type DirectoryBusiness } from "@/lib/businesses";

export interface PiriCardShowcaseItem extends DirectoryBusiness {
  /** Public path to the business's real, already-generated PiriCard front render. */
  frontImage: string;
}

/**
 * Maps a published business slug to the one real front-card PNG that exists
 * on disk today. This does NOT duplicate business data (name/category/city
 * still come from lib/businesses.ts via getPublishedDirectoryBusinesses) —
 * it only fills the one thing that data model doesn't carry: where the
 * generator (scripts/generate-piricard-cards.ts) physically wrote each
 * business's rendered front face.
 *
 * A small static map is used instead of a formula because the generator's
 * output layout is not fully uniform yet: a full run writes
 * `public/piricard-print/<slug>/<slug>-front.png`, but a card produced via
 * `--business=<slug>` (as PiriLight's was) lands under
 * `public/piricard-print/jobs/<slug>/<slug>/<slug>-front.png` instead — the
 * same path InteractivePiriCard.tsx already hardcodes for that one card.
 * This module is read-only: it never calls, imports, or changes the
 * generator itself.
 */
const FRONT_IMAGE_BY_SLUG: Record<string, string> = {
  autoformigal: "/piricard-print/autoformigal/autoformigal-front.png",
  "beauty-connection-360": "/piricard-print/beauty-connection-360/beauty-connection-360-front.png",
  "boi-na-brasa": "/piricard-print/boi-na-brasa/boi-na-brasa-front.png",
  "oft-racing": "/piricard-print/oft-racing/oft-racing-front.png",
  pirilight: "/piricard-print/jobs/pirilight/pirilight/pirilight-front.png",
};

/** Every published business that has a real, generated PiriCard front render available. */
export function getPiriCardShowcaseCards(): PiriCardShowcaseItem[] {
  return getPublishedDirectoryBusinesses()
    .filter((business) => FRONT_IMAGE_BY_SLUG[business.slug])
    .map((business) => ({ ...business, frontImage: FRONT_IMAGE_BY_SLUG[business.slug] }));
}
