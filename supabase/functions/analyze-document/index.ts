import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { enforceLimits } from "../_shared/rateLimit.ts";
import { callAI, extractJSON, aiErrorResponse } from "../_shared/aiGateway.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const _rl = enforceLimits(req, "analyze-document", _uid, 20, 60);
    if (_rl) return _rl;
  }

  // Health-check ping — no auth, no Gemini call. Used by AppHealthCheck.
  try {
    const cloned = req.clone();
    const peek = await cloned.json().catch(() => ({}));
    if (peek?.ping === true) {
      return new Response(JSON.stringify({ ok: true, fn: "analyze-document" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch { /* not JSON — fall through */ }

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
    const { documentType, textContent, imageBase64, fileName, profile } = await req.json();

    if (!documentType) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing document type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!textContent && !imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: "No content provided. Please upload a file or paste text." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompts: Record<string, string> = {
      recommendation: `You are an elite university admissions expert. Analyze this recommendation letter.

Extract and evaluate:
1. **Strength rating** (1-10): How strong is this recommendation?
2. **Key qualities mentioned**: List specific qualities the recommender highlights
3. **Specific examples**: Any concrete examples or anecdotes mentioned
4. **Recommender enthusiasm level**: (Generic, Supportive, Strong, Exceptional)
5. **Red flags**: Any concerns or weak points
6. **Comparison language**: Does the recommender compare the student to peers? How favorably?
7. **Impact on application**: How much does this help admission chances?

${profile ? `Student profile context: GPA: ${profile.gpa || 'N/A'}, Activities: ${profile.extracurriculars || 'N/A'}` : ''}

Return ONLY valid JSON:
{
  "strengthRating": <number 1-10>,
  "enthusiasmLevel": "<Generic|Supportive|Strong|Exceptional>",
  "keyQualities": ["quality1", "quality2", ...],
  "specificExamples": ["example1", "example2", ...],
  "redFlags": ["flag1", ...] or [],
  "comparisonLanguage": "description of how student is compared to peers",
  "impactScore": <number 1-100>,
  "summary": "2-3 sentence summary of the recommendation's strength",
  "suggestions": ["suggestion to improve application based on this rec", ...]
}`,

      transcript: `You are an elite university admissions expert. Analyze this academic transcript.

Extract and evaluate:
1. **GPA/Grades**: Overall academic performance
2. **Course rigor**: AP, IB, Honors, or advanced courses taken
3. **Grade trends**: Improving, declining, or consistent
4. **Strongest subjects**: Top performing areas
5. **Weakest subjects**: Areas needing improvement
6. **Course load**: How challenging is the overall course selection
7. **Academic standing**: Class rank if mentioned

${profile ? `Student profile context: Stated GPA: ${profile.gpa || 'N/A'}` : ''}

Return ONLY valid JSON:
{
  "extractedGPA": "<GPA if found or 'Not visible'>",
  "courseRigor": "<Low|Medium|High|Very High>",
  "gradeTrend": "<Improving|Consistent|Declining>",
  "strongSubjects": ["subject1", "subject2"],
  "weakSubjects": ["subject1", "subject2"],
  "apIbCourses": ["course1", "course2"],
  "overallRating": <number 1-10>,
  "academicStrengthScore": <number 1-100>,
  "summary": "2-3 sentence summary",
  "suggestions": ["suggestion1", "suggestion2"]
}`,

      awards: `You are an elite university admissions expert. Analyze these awards/certificates.

Evaluate:
1. **Award level**: Local, State/Regional, National, International
2. **Prestige**: How impressive is this to admissions committees
3. **Relevance**: How relevant to the student's application narrative
4. **Category**: Academic, Athletic, Arts, Community, Leadership, STEM, etc.
5. **Rarity**: How common or uncommon this achievement is

${profile ? `Student profile context: Activities: ${profile.extracurriculars || 'N/A'}` : ''}

Return ONLY valid JSON:
{
  "awards": [
    {
      "name": "award name",
      "level": "<Local|Regional|State|National|International>",
      "category": "category",
      "prestigeScore": <number 1-10>,
      "description": "brief description of significance"
    }
  ],
  "overallImpactScore": <number 1-100>,
  "summary": "2-3 sentence summary of achievement strength",
  "suggestions": ["how to leverage these awards", ...]
}`,

      portfolio: `You are an elite university admissions expert. Analyze this portfolio sample.

Evaluate:
1. **Quality**: Technical skill and execution
2. **Creativity**: Originality and creative vision
3. **Presentation**: How well is the work presented
4. **Portfolio type**: Art, Research, Engineering, Music, Writing, etc.
5. **University relevance**: How this strengthens an application

${profile ? `Student profile context: Special talents: ${profile.artsPortfolio || profile.special_talents || 'N/A'}` : ''}

Return ONLY valid JSON:
{
  "quality": <number 1-10>,
  "creativity": <number 1-10>,
  "presentation": <number 1-10>,
  "portfolioType": "type",
  "overallImpactScore": <number 1-100>,
  "summary": "2-3 sentence evaluation",
  "strengths": ["strength1", "strength2"],
  "suggestions": ["improvement suggestion1", ...]
}`
    };

    const systemPrompt = prompts[documentType] || prompts.recommendation;

    // Build messages array
    const messages: any[] = [
      { role: "system", content: "You are an expert university admissions counselor. Always return valid JSON only." }
    ];

    if (imageBase64) {
      // Use multimodal - send image for analysis
      messages.push({
        role: "user",
        content: [
          { type: "text", text: systemPrompt + (textContent ? `\n\nAdditional text content:\n${textContent}` : '') },
          {
            type: "image_url",
            image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` }
          }
        ]
      });
    } else {
      messages.push({
        role: "user",
        content: systemPrompt + `\n\nDocument content:\n${textContent}`
      });
    }

    console.log(`Analyzing ${documentType} document${imageBase64 ? ' (with image)' : ' (text only)'}...`);

    const ai = await callAI({
      task: "document",
      userId: user.id,
      expectJSON: true,
      messages,
    });

    const result = extractJSON(ai.content);

    return new Response(
      JSON.stringify({
        success: true, result, documentType,
        meta: { model: ai.model, latencyMs: ai.latencyMs, requestId: ai.requestId, attempts: ai.attempts, usedFallback: ai.usedFallback },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-document:", error);
    return aiErrorResponse(error, corsHeaders);
  }
});
