// AI fallback for major-specific admit rates when we don't have verified CDS data.
// Estimates a plausible major-level admit_rate via Lovable AI, then caches the
// result in public.major_admit_rates flagged as data_source='ai_estimated' so
// the next request is a cheap DB lookup.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  university_name?: string;
  major?: string;
  overall_admit_rate?: number | null;
}

const MODEL_CHAIN = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash",
  "openai/gpt-5-mini",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
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
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const uni = (body.university_name || "").trim();
    const major = (body.major || "").trim();
    if (!uni || !major) {
      return new Response(JSON.stringify({ error: "university_name and major required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Re-check cache (race-safe)
    const { data: existing } = await supa
      .from("major_admit_rates")
      .select("admit_rate, overall_admit_rate, data_source, confidence, source_url")
      .ilike("university_name", uni)
      .ilike("major_normalized", major)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ success: true, cached: true, ...existing }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI unavailable" }), {
        status: 503, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const prompt = `Estimate the major-specific undergraduate admit rate for the program below.

University: ${uni}
Major / program: ${major}
${body.overall_admit_rate != null ? `Known overall undergraduate admit rate: ${body.overall_admit_rate}%` : ""}

Use publicly known admissions trends:
- Highly selective majors (CS, EECS, business at top schools, nursing, animation) admit at a LOWER rate than the school overall.
- Less competitive majors admit closer to (or above) the overall rate.
- If the school doesn't admit by major, return the overall rate.

Return ONLY this JSON, no prose:
{"admit_rate_percent": <0-100 number>, "confidence": <0-1 number>, "reasoning": "<one short sentence>"}`;

    let estimated: { admit_rate_percent: number; confidence: number; reasoning: string } | null = null;
    for (const model of MODEL_CHAIN) {
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "You are an admissions data analyst. Output ONLY valid JSON." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (r.status === 429 || r.status === 402) {
          return new Response(JSON.stringify({ error: r.status === 429 ? "rate_limit" : "credits" }), {
            status: r.status, headers: { ...cors, "Content-Type": "application/json" },
          });
        }
        if (!r.ok) continue;
        const data = await r.json();
        const content = data?.choices?.[0]?.message?.content ?? "";
        const m = content.match(/\{[\s\S]*\}/);
        if (!m) continue;
        const parsed = JSON.parse(m[0]);
        const rate = Number(parsed.admit_rate_percent);
        if (!Number.isFinite(rate) || rate < 0 || rate > 100) continue;
        estimated = {
          admit_rate_percent: Math.round(rate * 10) / 10,
          confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
          reasoning: String(parsed.reasoning || ""),
        };
        break;
      } catch (e) {
        console.warn(`estimate-major-rate ${model} failed`, e);
      }
    }

    if (!estimated) {
      return new Response(JSON.stringify({ error: "estimation_failed" }), {
        status: 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Persist for next time. Best-effort; ignore conflict races.
    await supa.from("major_admit_rates").insert({
      university_name: uni,
      major_normalized: major,
      admit_rate: estimated.admit_rate_percent,
      overall_admit_rate: body.overall_admit_rate ?? null,
      data_source: "ai_estimated",
      confidence: estimated.confidence,
      notes: estimated.reasoning,
      data_year: new Date().getFullYear(),
    });

    return new Response(JSON.stringify({
      success: true,
      cached: false,
      admit_rate: estimated.admit_rate_percent,
      overall_admit_rate: body.overall_admit_rate ?? null,
      data_source: "ai_estimated",
      confidence: estimated.confidence,
      reasoning: estimated.reasoning,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("estimate-major-rate error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
