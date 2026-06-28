// Embeddings + AI memory helpers for edge functions.
// Uses Lovable AI Gateway (OpenAI 3-small @ 1536 dims to match ai_memory column).
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const EMBED_URL = "https://ai.gateway.lovable.dev/v1/embeddings";
const EMBED_MODEL = "openai/text-embedding-3-small";
const EMBED_DIMS = 1536;

export async function embedText(input: string | string[]): Promise<number[][]> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(EMBED_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input, dimensions: EMBED_DIMS }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Embedding failed ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  return (json.data ?? []).map((d: any) => d.embedding as number[]);
}

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

/** Upsert a memory snippet (chunks long content). Fire-and-forget safe. */
export async function rememberSnippet(
  userId: string,
  kind: "profile" | "essay" | "chat" | "resume" | "note",
  content: string,
  metadata: Record<string, unknown> = {},
) {
  if (!content?.trim()) return;
  const chunks = chunkText(content, 1200, 150);
  try {
    const vectors = await embedText(chunks);
    const supa = serviceClient();
    const rows = chunks.map((c, i) => ({
      user_id: userId,
      kind,
      content: c,
      embedding: vectors[i],
      metadata: { ...metadata, chunk: i, total: chunks.length },
    }));
    const { error } = await supa.from("ai_memory").insert(rows);
    if (error) console.error("rememberSnippet insert:", error.message);
  } catch (e) {
    console.error("rememberSnippet failed:", e);
  }
}

/** Retrieve top-k semantically similar memory snippets for a user. */
export async function recallMemory(
  userId: string,
  query: string,
  k = 6,
  kinds?: string[],
): Promise<Array<{ content: string; kind: string; similarity: number }>> {
  try {
    const [vec] = await embedText(query);
    const supa = serviceClient();
    // Service role bypasses RLS, so filter explicitly by user_id here.
    const { data, error } = await supa.rpc("match_ai_memory" as any, {
      query_embedding: vec as any,
      match_count: k,
      match_kinds: kinds ?? null,
    });
    if (error) {
      // RPC requires the caller user; with service role, fall back to manual SQL.
      const { data: rows } = await supa
        .from("ai_memory")
        .select("content, kind, embedding")
        .eq("user_id", userId)
        .limit(50);
      return rankClientSide(rows ?? [], vec, k);
    }
    return (data ?? []) as any;
  } catch (e) {
    console.error("recallMemory failed:", e);
    return [];
  }
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= size) return [clean];
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    out.push(clean.slice(i, i + size));
    i += size - overlap;
  }
  return out;
}

function rankClientSide(rows: any[], q: number[], k: number) {
  const scored = rows
    .filter((r) => Array.isArray(r.embedding) || typeof r.embedding === "string")
    .map((r) => {
      const v = Array.isArray(r.embedding) ? r.embedding : JSON.parse(r.embedding);
      return { content: r.content, kind: r.kind, similarity: cosine(q, v) };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, k);
  return scored;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}
