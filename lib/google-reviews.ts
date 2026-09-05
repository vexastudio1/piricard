import { getPublishedBusinessBySlug, type Business } from "@/lib/businesses";

/**
 * Live Google rating + review count, via the official Google Places API
 * (Place Details — https://developers.google.com/maps/documentation/places/web-service/details),
 * requesting only the `rating` and `user_ratings_total` fields.
 *
 * Server-only: reads GOOGLE_PLACES_API_KEY (never NEXT_PUBLIC_-prefixed, so it
 * is never sent to the browser) and is only ever called from Server
 * Components/route handlers, never from client code.
 *
 * This intentionally does NOT scrape Google search/Maps pages — that would be
 * brittle and against Google's terms. It also does not fetch the per-star
 * review breakdown or review text: the public Places API doesn't expose that
 * (it's only visible in Google's own Business Profile dashboard), so
 * BoiNaBrasaProfile/OFTRacingProfile keep their existing, separately-recorded
 * `ratingDistribution` arrays as-is rather than inventing a live equivalent.
 */

export interface GoogleReviewSnapshot {
  rating: number;
  count: number;
  source: "Google";
  asOf: string;
}

const PLACE_DETAILS_ENDPOINT = "https://maps.googleapis.com/maps/api/place/details/json";

// How long Next.js may serve a cached response before refetching in the
// background (its `fetch` Data Cache + ISR-style revalidation — no separate
// cache system introduced). 6h keeps this well within the Places API's free
// monthly quota for a handful of businesses while staying reasonably fresh.
const REVALIDATE_SECONDS = 60 * 60 * 6;

function todayAsOf(): string {
  return new Date().toLocaleDateString("pt-PT");
}

/**
 * Fetches one business's live snapshot. Returns null on ANY failure —
 * missing/invalid API key, network error, non-OK Google `status`, quota
 * exceeded, or a response missing the expected fields — so callers can fall
 * back gracefully instead of the page crashing or showing a broken state.
 */
async function fetchGoogleReviewSnapshot(placeId: string): Promise<GoogleReviewSnapshot | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    const url = new URL(PLACE_DETAILS_ENDPOINT);
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "rating,user_ratings_total");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      status?: string;
      result?: { rating?: number; user_ratings_total?: number };
    };
    if (data.status !== "OK") return null;

    const rating = data.result?.rating;
    const count = data.result?.user_ratings_total;
    if (typeof rating !== "number" || typeof count !== "number") return null;

    return { rating, count, source: "Google", asOf: todayAsOf() };
  } catch {
    // Network failure, timeout, malformed JSON, etc. — fail closed, never throw.
    return null;
  }
}

/**
 * Returns the business for `slug` with its `reviewSnapshot` replaced by a
 * live Google value when possible. Falls back, in order:
 *   1. live Google Places data (if googlePlaceId is configured and the fetch succeeds)
 *   2. the business's existing static reviewSnapshot, if any
 *   3. undefined (profile components already render a graceful
 *      "no verified rating yet" state for this case)
 * Never fabricates a value for step 2/3 — only ever passes through data
 * that's already in lib/businesses.ts or came back from Google itself.
 */
export async function getBusinessWithLiveReviews(slug: string): Promise<Business | undefined> {
  const business = getPublishedBusinessBySlug(slug);
  if (!business?.googlePlaceId) return business;

  const live = await fetchGoogleReviewSnapshot(business.googlePlaceId);
  if (!live) return business;

  return { ...business, reviewSnapshot: live };
}
