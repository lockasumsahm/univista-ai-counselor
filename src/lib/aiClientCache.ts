// Browser-side AI response cache, keyed by profile hash + task + extra inputs.
// Backed by sessionStorage for instant warm-loads within a session and
// localStorage for medium-term caching across reloads (7 days).
const LS_PREFIX = "ai_cache::";
const MAX_BYTES = 4 * 1024 * 1024; // ~4MB cap to stay well under quota

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function profileHash(profile: Record<string, unknown> | null | undefined): Promise<string> {
  if (!profile) return "anon";
  const norm = JSON.stringify(profile, Object.keys(profile).sort());
  return (await sha256(norm)).slice(0, 16);
}

export async function cacheKey(task: string, profile: any, extra: Record<string, unknown> = {}): Promise<string> {
  const h = await profileHash(profile);
  const e = await sha256(JSON.stringify(extra, Object.keys(extra).sort()));
  return `${task}::${h}::${e.slice(0, 12)}`;
}

interface Entry<T> { v: T; t: number; ttl: number }

export function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() - entry.t > entry.ttl) {
      localStorage.removeItem(LS_PREFIX + key);
      return null;
    }
    return entry.v;
  } catch { return null; }
}

export function setCache<T>(key: string, value: T, ttlMs = 7 * 24 * 3600 * 1000) {
  try {
    const payload = JSON.stringify({ v: value, t: Date.now(), ttl: ttlMs } satisfies Entry<T>);
    if (payload.length > MAX_BYTES) return;
    localStorage.setItem(LS_PREFIX + key, payload);
  } catch (e) {
    // quota exceeded — best-effort prune
    if ((e as any)?.name === "QuotaExceededError") {
      pruneOldest();
      try { localStorage.setItem(LS_PREFIX + key, JSON.stringify({ v: value, t: Date.now(), ttl: ttlMs })); }
      catch { /* give up */ }
    }
  }
}

export function invalidateProfileCache(profile: any) {
  void profileHash(profile).then((h) => {
    const prefix = LS_PREFIX;
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(prefix) && k.includes(`::${h}::`)) localStorage.removeItem(k);
    });
  });
}

function pruneOldest() {
  const entries: Array<{ k: string; t: number }> = [];
  Object.keys(localStorage).forEach((k) => {
    if (!k.startsWith(LS_PREFIX)) return;
    try { entries.push({ k, t: JSON.parse(localStorage.getItem(k)!).t ?? 0 }); }
    catch { localStorage.removeItem(k); }
  });
  entries.sort((a, b) => a.t - b.t).slice(0, Math.ceil(entries.length / 2))
    .forEach((e) => localStorage.removeItem(e.k));
}
