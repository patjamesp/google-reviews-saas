/**
 * Google does not expose an API to post reviews on a business's behalf —
 * by design, only the reviewer can submit through their own Google account.
 * What we CAN do is generate the direct "write a review" deep link, which
 * pre-opens the review composer for a given Place ID.
 */
export function googleReviewLink(placeId: string): string {
  const params = new URLSearchParams({ placeid: placeId });
  return `https://search.google.com/local/writereview?${params.toString()}`;
}

/**
 * One-time lookup during business onboarding: resolve a business's
 * Google Place ID from its name + address via the Places API
 * (Text Search or Find Place From Text). Stubbed here — wire up
 * GOOGLE_PLACES_API_KEY and call this from the onboarding flow.
 */
export async function resolvePlaceId(query: string): Promise<string | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");

  const url = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json");
  url.searchParams.set("input", query);
  url.searchParams.set("inputtype", "textquery");
  url.searchParams.set("fields", "place_id");
  url.searchParams.set("key", key);

  const res = await fetch(url.toString());
  const data = await res.json();
  return data?.candidates?.[0]?.place_id ?? null;
}
