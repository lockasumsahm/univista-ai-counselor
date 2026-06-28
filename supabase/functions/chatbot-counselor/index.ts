import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enforceLimits } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = (profile: any) => `You are a world-class university admissions counselor with 20+ years of experience helping students get into top universities worldwide.

**STYLE**
- Clear, warm, simple language. Use bullets and bold for scannability.
- Always give a concrete next step + timeline.
- Validate feelings, celebrate strengths, frame weaknesses as opportunities.

**EXPERTISE**
Applications strategy • Essays • Scholarships • SAT/ACT/AP prep • Extracurricular planning • Major selection • International/visa • Rankings & fit.

**STUDENT PROFILE**
${
  profile
    ? `Name: ${profile.name || "Not provided"}
GPA: ${profile.gpa || "Not provided"}
Test Score: ${profile.testScore || profile.testScores || "Not provided"}
Intended Major: ${profile.major || profile.intendedMajor || "Not provided"}
Extracurriculars: ${profile.extracurriculars || "Not provided"}
Target Countries: ${(profile.preferredCountries || []).join(", ") || "Not specified"}`
    : "No profile yet — ask one question to learn their background before giving deep advice."
}

**FORMAT**
- Lead with the most important point.
- Max 3–4 short paragraphs unless asked for depth.
- End with a follow-up question or clear CTA.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Rate limit (per-IP 60/min, per-user 20/min)
  {
    let _uid: string | null = null;
    const _auth = req.headers.get("Authorization") || "";
    const _tok = _auth.startsWith("Bearer ") ? _auth.slice(7) : "";
    if (_tok) { try { const _p = JSON.parse(atob(_tok.split(".")[1] || "")); _uid = _p?.sub ?? null; } catch {} }
    const _rl = enforceLimits(req, "chatbot-counselor", _uid, 20, 60);
    if (_rl) return _rl;
  }

  // Health ping
  try {
    const peek = await req.clone().json().catch(() => ({}));
    if (peek?.ping === true) {
      return new Response(JSON.stringify({ ok: true, fn: "chatbot-counselor" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch { /* ignore */ }

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { question, profile, conversationHistory, stream } = await req.json();
    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Question is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT(profile) },
      ...((conversationHistory || []) as Array<{ role: string; content: string }>).slice(-20),
      { role: "user", content: question },
    ];

    // Multi-model waterfall: try primary then fall back on 402/429/5xx so the
    // chatbot keeps working even if one provider is rate-limited or down.
    const MODEL_CHAIN = [
      "google/gemini-3-flash-preview",
      "google/gemini-2.5-flash",
      "openai/gpt-5-mini",
      "openai/gpt-5",
    ];
    let aiResp: Response | null = null;
    let lastStatus = 0;
    let lastBody = "";
    for (const model of MODEL_CHAIN) {
      const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, stream: stream !== false }),
      });
      if (r.ok) { aiResp = r; break; }
      lastStatus = r.status;
      lastBody = await r.text().catch(() => "");
      console.warn(`chatbot model ${model} failed [${r.status}], trying next`);
      // 4xx other than 402/429 is a request problem — no point trying other models.
      if (r.status >= 400 && r.status < 500 && r.status !== 402 && r.status !== 429) break;
    }

    if (!aiResp) {
      const msg = lastStatus === 429
        ? "All AI models are rate-limited right now. Please try again in a moment."
        : lastStatus === 402
        ? "AI credits exhausted across all models. Please add credits in Workspace settings."
        : "AI is temporarily unavailable. Please try again shortly.";
      console.error("All chatbot models failed", lastStatus, lastBody);
      return new Response(JSON.stringify({ error: msg }), {
        status: lastStatus || 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Streaming path — pass SSE through to the client.
    if (stream !== false) {
      return new Response(aiResp.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    // Non-streaming fallback (kept for legacy callers).
    const json = await aiResp.json();
    const answer = json?.choices?.[0]?.message?.content ?? "";
    return new Response(
      JSON.stringify({ success: true, result: { answer }, meta: { model: json?.model } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Chatbot error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
