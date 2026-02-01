import { Redis } from "@upstash/redis";

const VIEW_KEY_PREFIX = "view:";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Get view counts for all paths. Returns empty object if Redis is not configured. */
export async function getViewCounts(): Promise<Record<string, number>> {
  const redis = getRedis();
  if (!redis) return {};

  try {
    const keys = await redis.keys(`${VIEW_KEY_PREFIX}*`);
    if (keys.length === 0) return {};

    const counts: Record<string, number> = {};
    for (const key of keys) {
      const path = key.startsWith(VIEW_KEY_PREFIX)
        ? key.slice(VIEW_KEY_PREFIX.length)
        : key;
      const value = await redis.get(key);
      counts[path] =
        typeof value === "number" ? value : Number(value) || 0;
    }
    return counts;
  } catch {
    return {};
  }
}

/** Increment view count for a path. No-op if Redis is not configured. */
export async function incrementView(path: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const key = `${VIEW_KEY_PREFIX}${path}`;
  await redis.incr(key);
}
