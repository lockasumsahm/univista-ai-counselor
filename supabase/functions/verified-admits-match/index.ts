// Returns the closest verified admit profiles for a given student snapshot.
// Pass 2 — semantic similarity grounding. When the verified_admits table has
// embeddings, this function builds a query embedding from the student's
// snapshot and uses pgvector cosine search via the `match_verified_admits`
// RPC. Falls back to the legacy keyword/numeric scoring path when (a) the
// embedding gateway fails or (b) no rows in the table have embeddings yet.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { embedText } from "../_shared/embeddings.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  university_name?: string;
  country?: string;
  intended_major?: string;
  student_country?: string;
  gpa_unweighted?: number | null;
  sat_total?: number | null;
  act_composite?: number | null;
  limit?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    // Require an authenticated caller — this endpoint reads verified_admits
    // (gated to authenticated users by RLS) and can trigger paid AI synthesis.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const supaAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authErr } = await supaAuth.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // ── Pass 2: Try semantic search first ────────────────────────
    const queryText = [
      body.university_name ? `Target: ${body.university_name}` : "",
      body.country ? `Country: ${body.country}` : "",
      body.intended_major ? `Major: ${body.intended_major}` : "",
      body.student_country ? `From: ${body.student_country}` : "",
      body.gpa_unweighted ? `GPA ${body.gpa_unweighted}` : "",
      body.sat_total ? `SAT ${body.sat_total}` : "",
      body.act_composite ? `ACT ${body.act_composite}` : "",
    ].filter(Boolean).join(". ");

    let scored: any[] = [];
    let usedSemantic = false;
    if (queryText.length > 0) {
      try {
        const [vec] = await embedText(queryText);
        const { data: rpcRows, error: rpcErr } = await supa.rpc(
          "match_verified_admits" as any,
          {
            query_embedding: vec as any,
            match_count: body.limit ?? 8,
            f_university: body.university_name ?? null,
            f_country: body.country ?? null,
            f_tier: null,
            f_region: null,
          },
        );
        if (!rpcErr && Array.isArray(rpcRows) && rpcRows.length > 0) {
          usedSemantic = true;
          scored = rpcRows.map((r: any) => ({
            ...r,
            similarity: Math.round((r.similarity ?? 0) * 100),
          }));
        }
      } catch (e) {
        console.warn("semantic search unavailable, falling back", e);
      }
    }

    // ── Fallback: legacy keyword + numeric scoring ───────────────
    if (scored.length === 0) {
      let q = supa.from("verified_admits").select("*").eq("decision", "admit");
      if (body.university_name) q = q.ilike("university_name", `%${body.university_name}%`);
      if (body.country) q = q.eq("country", body.country);
      if (body.intended_major) q = q.ilike("intended_major", `%${body.intended_major}%`);
      const { data, error } = await q.limit(200);
      if (error) throw error;
      scored = (data ?? [])
        .map((row: any) => ({ row, score: score(row, body) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, body.limit ?? 8)
        .map(({ row, score }) => ({
          university_name: row.university_name,
          country: row.country,
          admit_year: row.admit_year,
          round: row.round,
          student_country: row.student_country,
          intended_major: row.intended_major,
          gpa_unweighted: row.gpa_unweighted,
          sat_total: row.sat_total,
          act_composite: row.act_composite,
          spike: row.spike,
          awards: row.awards,
          leadership_summary: row.leadership_summary,
          essay_themes: row.essay_themes,
          recommendations_strength: row.recommendations_strength,
          first_generation: row.first_generation,
          source: row.source,
          verified: row.verified,
          similarity: Math.round(score * 100),
        }));
    }

    // AI fallback: if no verified data exists for this country/major/university combo,
    // synthesize plausible representative admit profiles via the Lovable AI Gateway so
    // the student always sees a useful response instead of an empty list.
    if (scored.length === 0) {
      const synthesized = await synthesizeAdmits(body);
      return new Response(
        JSON.stringify({
          success: true,
          matches: synthesized,
          total_candidates: 0,
          source: "ai_synthesized",
          disclaimer: "No verified admits in our database for this combination yet. The profiles below are AI-generated representative examples based on publicly known admissions trends — treat as directional guidance, not verified data.",
        }),
        { headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        matches: scored,
        total_candidates: scored.length,
        source: usedSemantic ? "verified_semantic" : "verified",
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("verified-admits-match error", e);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});

function score(row: any, q: Body): number {
  let s = 0.5; // base
  if (q.intended_major && row.intended_major &&
      row.intended_major.toLowerCase().includes(q.intended_major.toLowerCase())) s += 0.15;
  if (q.student_country && row.student_country === q.student_country) s += 0.1;
  if (q.gpa_unweighted && row.gpa_unweighted) {
    const d = Math.abs(Number(row.gpa_unweighted) - q.gpa_unweighted);
    s += Math.max(0, 0.2 - d * 0.4);
  }
  if (q.sat_total && row.sat_total) {
    const d = Math.abs(row.sat_total - q.sat_total);
    s += Math.max(0, 0.2 - (d / 800));
  }
  if (q.act_composite && row.act_composite) {
    const d = Math.abs(row.act_composite - q.act_composite);
    s += Math.max(0, 0.15 - d * 0.02);
  }
  return Math.max(0, Math.min(1, s));
}

// AI synthesis fallback with multi-model waterfall. Returns 5 representative
// admit profiles in the same shape as DB rows, flagged as ai-synthesized.
async function synthesizeAdmits(q: Body): Promise<any[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return [];

  const prompt = `Generate 5 realistic representative admit profiles for a student researching admissions.
Context:
- Target university: ${q.university_name || "any top university"}
- Target country: ${q.country || "any"}
- Intended major: ${q.intended_major || "undeclared"}
- Student's home country: ${q.student_country || "international"}
- Student's GPA (unweighted /4.0): ${q.gpa_unweighted ?? "unknown"}
- Student's SAT: ${q.sat_total ?? "unknown"}
- Student's ACT: ${q.act_composite ?? "unknown"}

Base each profile on publicly-known admissions trends for similar schools/majors. Vary the spike, awards, GPAs and test scores realistically.

Return ONLY a JSON object with key "profiles" (no prose, no markdown) of this exact shape:
{"profiles":[{"university_name":"","country":"","admit_year":2024,"round":"RD","student_country":"","intended_major":"","gpa_unweighted":3.9,"sat_total":1520,"act_composite":34,"spike":"","awards":["",""],"leadership_summary":"","essay_themes":["",""],"recommendations_strength":"strong","first_generation":false}]}`;

  const MODEL_CHAIN = [
    "google/gemini-2.5-flash",
    "openai/gpt-5-mini",
    "google/gemini-2.5-pro",
    "openai/gpt-5",
  ];

  for (const model of MODEL_CHAIN) {
    try {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are an admissions data analyst. Output ONLY valid JSON. No markdown, no commentary." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (!r.ok) {
        console.warn(`synthesizeAdmits ${model} failed [${r.status}]`);
        continue;
      }
      const data = await r.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) continue;
      const parsed = JSON.parse(match[0]);
      const profiles = Array.isArray(parsed.profiles) ? parsed.profiles : [];
      return profiles.map((p: any) => ({
        ...p,
        source: "ai_synthesized",
        verified: false,
        similarity: 70,
      }));
    } catch (err) {
      console.warn(`synthesizeAdmits ${model} error`, err);
    }
  }
  return [];
}
