import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enforceLimits } from "../_shared/rateLimit.ts";
import { callAI, extractJSON, aiErrorResponse } from "../_shared/aiGateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  action: "analyze" | "rewrite" | "export-report";
  essay: string;
  essayType?: string;
  customPrompt?: string;
  paragraph?: string;
  paragraphIndex?: number;
  rewriteStyle?: string;
  targetUniversity?: string;
  previousScore?: number;
}

const ANALYSIS_PROMPT = `You are an elite college admissions essay coach with 20+ years of experience at top-tier universities. Analyze the following essay with extreme precision and depth.

Return your response as a JSON object with this EXACT structure:
{
  "overallScore": <number 0-100>,
  "clarity": <number 0-100>,
  "authenticity": <number 0-100>,
  "structure": <number 0-100>,
  "impact": <number 0-100>,
  "hookStrength": <number 0-100>,
  "thesisClarity": <number 0-100>,
  "emotionalDepth": <number 0-100>,
  "storytelling": <number 0-100>,
  "hookAnalysis": "<2-3 sentence analysis of the opening hook>",
  "thesisAnalysis": "<2-3 sentence analysis of the thesis/central message>",
  "emotionalSuggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "storytellingSuggestions": ["<suggestion 1>", "<suggestion 2>"],
  "inlineFeedback": [
    {"sentenceFragment": "<first 8-10 words of the sentence>", "feedback": "<specific improvement>", "type": "strength|improvement|suggestion"},
    ...up to 6 items
  ],
  "feedback": [
    {"type": "strength", "category": "<category>", "message": "<specific feedback>"},
    {"type": "improvement", "category": "<category>", "message": "<specific feedback>"},
    {"type": "suggestion", "category": "<category>", "message": "<actionable tip>"}
  ],
  "universityFit": "<optional: how this essay fits the target university's values>"
}

Provide 3-4 strengths, 3-4 areas for improvement, and 3-4 specific suggestions. Be encouraging but brutally honest about what needs work. Focus on what admissions officers actually look for.`;

const REWRITE_PROMPT = `You are an elite college admissions essay writing coach. A student wants help rewriting a specific paragraph.

Return your response as a JSON object with this EXACT structure:
{
  "rewrites": [
    {
      "style": "<style name>",
      "text": "<rewritten paragraph>",
      "explanation": "<why this version is stronger>",
      "estimatedScoreChange": <number -20 to +20>
    }
  ]
}

Provide exactly 3 rewrites with different approaches. Each rewrite should:
- Maintain the student's authentic voice
- Be roughly the same length as the original
- Focus on the specified style/approach`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit (per-IP 60/min, per-user 20/min)
  {
    const _ip = (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown");
    let _uid: string | null = null;
    const _auth = req.headers.get("Authorization") || "";
    const _tok = _auth.startsWith("Bearer ") ? _auth.slice(7) : "";
    if (_tok) {
      try { const p = JSON.parse(atob(_tok.split(".")[1] || "")); _uid = p?.sub ?? null; } catch {}
    }
    const _rl = enforceLimits(req, "essay-coach", _uid, 20, 60);
    if (_rl) return _rl;
  }

  // Validate JWT using two-client RLS pattern (works with signing keys)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    console.error('Auth error:', authError?.message);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const body: RequestBody = await req.json();
    const { action, essay, essayType, customPrompt, paragraph, rewriteStyle, targetUniversity, previousScore } = body;

    if (!essay && action !== "export-report") {
      return new Response(JSON.stringify({ error: "Essay text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userPrompt = "";
    let systemPrompt = "";

    if (action === "analyze") {
      systemPrompt = ANALYSIS_PROMPT;
      userPrompt = `Essay Type: ${essayType || "Common App Personal Statement"}
${customPrompt ? `Custom Prompt: ${customPrompt}` : ""}
${targetUniversity ? `Target University: ${targetUniversity}` : ""}

Essay:
${essay}`;
    } else if (action === "rewrite") {
      systemPrompt = REWRITE_PROMPT;
      userPrompt = `Rewrite Style Focus: ${rewriteStyle || "General improvement"}
Essay Type: ${essayType || "Common App Personal Statement"}
${previousScore ? `Current essay score: ${previousScore}/100` : ""}

Original paragraph to rewrite:
${paragraph}

Full essay context:
${essay}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await callAI({
      task: "essay",
      userId: user.id,
      expectJSON: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const parsed = extractJSON(ai.content);

    return new Response(JSON.stringify({
      success: true,
      result: parsed,
      meta: { model: ai.model, latencyMs: ai.latencyMs, requestId: ai.requestId, attempts: ai.attempts, usedFallback: ai.usedFallback },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Essay coach error:", error);
    return aiErrorResponse(error, corsHeaders);
  }
});
