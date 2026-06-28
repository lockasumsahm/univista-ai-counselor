// In-memory sliding-window rate limiter for Edge Functions.
// Per-instance only (acceptable first line of defense; resets on cold start).
// Returns 429 when exceeded.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Bucket = number[]; // request timestamps (ms)
const store = new Map<string, Bucket>();


export interface RateLimitConfig {
  key: string;          // unique id (ip + userId + route)
  windowMs: number;     // e.g. 60_000
  max: number;          // requests allowed in window
}

export function checkLimit({ key, windowMs, max }: RateLimitConfig): {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
} {
  const now = Date.now();
  const bucket = store.get(key) ?? [];
  const fresh = bucket.filter((t) => now - t < windowMs);
  if (fresh.length >= max) {
    const retryAfter = Math.ceil((windowMs - (now - fresh[0])) / 1000);
    store.set(key, fresh);
    return { allowed: false, remaining: 0, retryAfter };
  }
  fresh.push(now);
  store.set(key, fresh);
  // Light periodic cleanup
  if (store.size > 5000) {
    for (const [k, v] of store) {
      if (!v.some((t) => now - t < windowMs)) store.delete(k);
    }
  }
  return { allowed: true, remaining: max - fresh.length, retryAfter: 0 };
}

export function rateLimitResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please slow down and try again shortly.",
      retry_after_seconds: retryAfter,
    }),
    {
      status: 429,
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    },
  );
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

/** Combined per-IP + per-user gate. Call at top of edge function. */
export function enforceLimits(
  req: Request,
  route: string,
  userId: string | null,
  perUserPerMin = 20,
  perIpPerMin = 60,
): Response | null {
  const ip = clientIp(req);
  const ipCheck = checkLimit({
    key: `ip:${route}:${ip}`,
    windowMs: 60_000,
    max: perIpPerMin,
  });
  if (!ipCheck.allowed) return rateLimitResponse(ipCheck.retryAfter);

  if (userId) {
    const userCheck = checkLimit({
      key: `user:${route}:${userId}`,
      windowMs: 60_000,
      max: perUserPerMin,
    });
    if (!userCheck.allowed) return rateLimitResponse(userCheck.retryAfter);
  }
  return null;
}
