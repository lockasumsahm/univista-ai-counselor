import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enforceLimits } from "../_shared/rateLimit.ts";
import { callAI, extractJSON, aiErrorResponse } from "../_shared/aiGateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Rate limit (per-IP 60/min, per-user 20/min)
  {
    let _uid: string | null = null;
    const _auth = req.headers.get("Authorization") || "";
    const _tok = _auth.startsWith("Bearer ") ? _auth.slice(7) : "";
    if (_tok) { try { const _p = JSON.parse(atob(_tok.split(".")[1] || "")); _uid = _p?.sub ?? null; } catch {} }
    const _rl = enforceLimits(req, "university-checker", _uid, 20, 60);
    if (_rl) return _rl;
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { university, cvText } = await req.json();
    if (!university || !cvText) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing university name or CV text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const prompt = `You are the world's top professional university counselor.

Student wants to apply to: **${university}**

Here is their CV/profile:
${cvText}

TASK:
1. Estimate chance of admission (0–100%).
2. Give 5–7 strong and personalized improvement steps.
3. Describe how competitive the university is.
4. Mention important requirements the student must focus on.

Return ONLY valid JSON in this exact format:
{
  "university": "${university}",
  "chance": <number>,
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "insights": "detailed insights about the university and student's competitiveness"
}`;

    const ai = await callAI({
      task: "uni_checker",
      userId: user.id,
      expectJSON: true,
      hedge: true,
      messages: [{ role: "user", content: prompt }],
    });

    const result = extractJSON(ai.content);

    return new Response(
      JSON.stringify({
        success: true,
        result,
        meta: { model: ai.model, latencyMs: ai.latencyMs, requestId: ai.requestId, attempts: ai.attempts, usedFallback: ai.usedFallback },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("university-checker error:", e);
    return aiErrorResponse(e, corsHeaders);
  }
});
