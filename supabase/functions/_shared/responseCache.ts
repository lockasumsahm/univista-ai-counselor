// Profile-hash + task keyed response cache to avoid recomputing identical AI requests.
import { serviceClient } from "./embeddings.ts";

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function makeCacheKey(parts: Record<string, unknown>): Promise<string> {
  const norm = JSON.stringify(parts, Object.keys(parts).sort());
  return await sha256(norm);
}

export async function getCached<T = any>(key: string): Promise<T | null> {
  try {
    const supa = serviceClient();
    const { data } = await supa
      .from("ai_response_cache")
      .select("payload, expires_at")
      .eq("cache_key", key)
      .maybeSingle();
    if (!data) return null;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
    // bump hit_count async
    void supa.rpc("noop" as any).then(() => {/* no-op */});
    void supa.from("ai_response_cache").update({ hit_count: 1 }).eq("cache_key", key);
    return data.payload as T;
  } catch (e) {
    console.error("cache read failed:", e);
    return null;
  }
}

export async function setCached(
  key: string,
  payload: unknown,
  opts: { task: string; userId?: string | null; profileHash?: string | null; model?: string; ttlSec?: number },
) {
  try {
    const supa = serviceClient();
    const expires_at = opts.ttlSec
      ? new Date(Date.now() + opts.ttlSec * 1000).toISOString()
      : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    await supa.from("ai_response_cache").upsert(
      {
        cache_key: key,
        task: opts.task,
        user_id: opts.userId ?? null,
        profile_hash: opts.profileHash ?? null,
        payload,
        model: opts.model ?? null,
        expires_at,
      },
      { onConflict: "cache_key" },
    );
  } catch (e) {
    console.error("cache write failed:", e);
  }
}
