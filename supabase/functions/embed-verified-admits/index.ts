// Pass 2 — Embed all verified_admits rows that don't yet have an embedding.
// Admin-only manual trigger. Idempotent. Processes in batches of 50.
//
// POST /functions/v1/embed-verified-admits { "limit": 200 }
// Returns: { embedded, skipped, errors }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { embedText, serviceClient } from "../_shared/embeddings.ts";

function regionFromCountry(country: string): string {
  const c = (country || "").toLowerCase();
  if (c.includes("usa") || c.includes("united states")) return "us";
  if (c.includes("uk") || c.includes("united kingdom")) return "uk";
  if (c.includes("canada")) return "canada";
  if (c.includes("germany") || c.includes("france") || c.includes("netherlands") || c.includes("switzerland") || c.includes("ireland")) return "eu";
  if (c.includes("singapore") || c.includes("hong kong") || c.includes("japan") || c.includes("china") || c.includes("korea")) return "asia";
  if (c.includes("australia") || c.includes("new zealand")) return "oceania";
  return "other";
}

// Best-effort tier — we don't have per-uni acceptance rate here, so leave null
// when not derivable. The recalibration job uses the same logic.
function summariseAdmit(r: any): string {
  return [
    `${r.university_name} — ${r.intended_major || "undeclared"} (${r.admit_year || "?"})`,
    r.student_country ? `From: ${r.student_country}` : "",
    r.gpa_unweighted ? `GPA ${r.gpa_unweighted}` : "",
    r.sat_total ? `SAT ${r.sat_total}` : "",
    r.act_composite ? `ACT ${r.act_composite}` : "",
    r.spike ? `Spike: ${r.spike}` : "",
    r.awards?.length ? `Awards: ${r.awards.slice(0, 3).join(", ")}` : "",
    r.leadership_summary ? `Leadership: ${r.leadership_summary}` : "",
    r.essay_themes?.length ? `Essay themes: ${r.essay_themes.slice(0, 3).join(", ")}` : "",
    r.first_generation ? "First-generation applicant" : "",
  ].filter(Boolean).join(". ");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Admin gate.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supaAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: u } = await supaAuth.auth.getUser();
  if (!u?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: isAdmin } = await supaAuth.rpc("is_admin" as any, { _user_id: u.user.id });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Admin only" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const limit = Math.min(500, body?.limit ?? 200);

  const supa = serviceClient();
  const { data: rows, error } = await supa
    .from("verified_admits")
    .select("*")
    .is("embedding", null)
    .eq("decision", "admit")
    .limit(limit);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let embedded = 0, skipped = 0, errors = 0;
  const BATCH = 16;
  for (let i = 0; i < (rows ?? []).length; i += BATCH) {
    const chunk = rows!.slice(i, i + BATCH);
    const texts = chunk.map(summariseAdmit);
    try {
      const vectors = await embedText(texts);
      for (let j = 0; j < chunk.length; j++) {
        const r = chunk[j];
        const summary = texts[j];
        const region = regionFromCountry(r.country);
        const { error: uErr } = await supa
          .from("verified_admits")
          .update({
            embedding: vectors[j] as any,
            summary_text: summary,
            region,
            embedded_at: new Date().toISOString(),
          })
          .eq("id", r.id);
        if (uErr) { errors += 1; console.error("update failed", uErr); }
        else embedded += 1;
      }
    } catch (e) {
      errors += chunk.length;
      console.error("batch embed failed", e);
    }
  }

  skipped = (rows?.length ?? 0) - embedded - errors;
  return new Response(
    JSON.stringify({ embedded, skipped, errors, considered: rows?.length ?? 0 }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
