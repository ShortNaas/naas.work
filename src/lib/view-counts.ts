import { unstable_cache } from "next/cache";

/**
 * Page view counts sourced from GoatCounter's JSON API, used only to power the
 * blog list's "popular" sort. Counts are not stored by this site.
 *
 * Requires GOATCOUNTER_API_TOKEN (a read-only API token from
 * https://YOURCODE.goatcounter.com/settings/api) and either
 * NEXT_PUBLIC_GOATCOUNTER_CODE or GOATCOUNTER_URL for the instance host.
 *
 * Everything here is best-effort: if the token is missing, the instance is
 * unreachable, or the response is not what we expect, the blog list silently
 * falls back to sorting by date.
 */

export type ViewCounts = Record<string, number>;

const CACHE_SECONDS = 3600;

function instanceBase(): string | null {
  const selfHosted = process.env.GOATCOUNTER_URL;
  if (selfHosted) return selfHosted.replace(/\/$/, "");
  const code = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;
  return code ? `https://${code}.goatcounter.com` : null;
}

const fetchCounts = async (): Promise<ViewCounts> => {
  const token = process.env.GOATCOUNTER_API_TOKEN;
  const base = instanceBase();
  if (!token || !base) return {};

  try {
    const res = await fetch(
      // `limit` keeps the response bounded; anything past it just sorts lower.
      `${base}/api/v0/stats/hits?limit=200&exclude_entries=true`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return {};

    const json: unknown = await res.json();
    const hits = (json as { hits?: unknown }).hits;
    if (!Array.isArray(hits)) return {};

    const counts: ViewCounts = {};
    for (const hit of hits) {
      const path = (hit as { path?: unknown }).path;
      const count = (hit as { count?: unknown }).count;
      if (typeof path === "string" && typeof count === "number") {
        counts[path] = count;
      }
    }
    return counts;
  } catch {
    // Network failure, timeout, or malformed JSON: fall back to date order.
    return {};
  }
};

/**
 * Cached so a blog page render never waits on GoatCounter, and so we stay well
 * inside the API's rate limits.
 */
export const getViewCounts = unstable_cache(
  fetchCounts,
  ["goatcounter-view-counts"],
  { revalidate: CACHE_SECONDS }
);
