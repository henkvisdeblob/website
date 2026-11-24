import "server-only";

/**
 * Small in-memory sliding-window rate limiter. Best effort: on serverless hosting each instance
 * has its own memory, so this slows down abuse but is not a hard guarantee.
 */
export function createRateLimiter(options: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  return function check(key: string, now = Date.now()): boolean {
    const windowStart = now - options.windowMs;
    const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);
    if (recent.length >= options.limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.every((t) => t <= windowStart)) hits.delete(k);
    }
    return true;
  };
}
