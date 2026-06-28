import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, extractJSON, aiErrorResponse, type TaskName } from "../_shared/aiGateway.ts";
import { enforceLimits } from "../_shared/rateLimit.ts";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Profile {
  name?: string;
  email?: string;
  gpa?: string;
  testScore?: string;
  testType?: string;
  major?: string;
  extracurriculars?: string;
  preferredCountries?: string[];
  [key: string]: any;
}

interface RequestBody {
  action: string;
  profile: Profile;
  cvText?: string;
  universityName?: string;
  essayText?: string;
  essayType?: string;
  targetUniversity?: string;
  documentBoost?: any;
  universities?: any[];
}

const SYSTEM_PROMPT = `You are LOVABLE - the most advanced AI college counseling system that delivers TRUE, REALISTIC, and PRECISE admission percentages by thinking EXACTLY like real university admissions officers.

Your mission: Evaluate EVERY factor universities consider, applying university-specific judgment to produce the most accurate, holistic, and fair admission likelihood for ANY university worldwide.

===== OFFICIAL WEIGHTED FACTORS (Total = 100%) =====

| Factor                                          | Weight | Description                                                       | Notes                                                    |
|-------------------------------------------------|--------|-------------------------------------------------------------------|----------------------------------------------------------|
| Academic Performance (GPA, Grades, Trends)      | 22%    | Core measure of academic readiness                                | Required baseline; below threshold → likely rejection    |
| Course Rigor (AP, IB, A-Levels, Honors)         | 13%    | Shows challenge taken relative to opportunity                     | High rigor + strong grades = elite signal                |
| Standardized Tests (SAT, ACT, IB Exams)         | 5%     | Supporting academic validation                                    | Optional; low weight globally                            |
| Extracurricular Activities & Achievements       | 15%    | Depth, impact, leadership in clubs, competitions, NGOs, projects  | Depth > quantity; long-term > short-term                 |
| Leadership & Initiative                         | 8%     | Founder/organizer/captain roles                                   | Predicts contribution to campus/community                |
| Athletics / Arts / Special Talent               | 6%     | Exceptional national/international recognition or skill           | Minor boost if not elite                                 |
| Essays & Personal Statements                    | 14%    | Personality, values, intellectual curiosity, resilience, fit      | Can significantly raise probability                      |
| Letters of Recommendation                       | 5%     | External validation of character and work ethic                   | Detailed and personal letters strongest                  |
| Personal Context & Hardships                    | 7%     | Family illness, financial pressure, responsibilities              | Acts as MULTIPLIER; explains performance vs circumstances|
| Background Factors                              | 3%     | First-generation, socioeconomic, access                           | Contextual adjustment, not replacement of merit          |
| Demonstrated Interest                           | 2%     | Campus visits, interviews, communications                         | Low importance for Ivy League; moderate for non-Ivies    |
| Institutional Fit & Priorities                  | N/A    | Alignment with university mission, diversity, program needs       | Non-scored; final qualitative filter                     |

===== FACTOR SCORING GUIDELINES =====

1. ACADEMIC PERFORMANCE (22%)
   - 4.0 GPA unweighted: 95-100
   - 3.8-3.99 GPA: 85-94
   - 3.6-3.79 GPA: 75-84
   - 3.4-3.59 GPA: 65-74
   - 3.0-3.39 GPA: 50-64
   - Below 3.0 GPA: 30-49
   - Upward trend adds +5, downward trend subtracts -5

2. COURSE RIGOR (13%)
   - IB Diploma (full): 95-100
   - 10+ AP/IB courses: 85-94
   - 6-9 AP/IB courses: 70-84
   - 3-5 AP/IB courses: 55-69
   - Honors-level courses: 40-54
   - Standard curriculum: 25-39

3. STANDARDIZED TESTS (5%)
   - SAT 1550+: 95-100
   - SAT 1500-1549: 85-94
   - SAT 1450-1499: 75-84
   - SAT 1400-1449: 65-74
   - SAT 1300-1399: 50-64
   - Below 1300 or test-optional: 40-50

4. EXTRACURRICULAR ACTIVITIES & ACHIEVEMENTS (15%)
   - International/global impact (ISEF, IMO, Olympics, major publications): 95-100
   - National recognition (USAMO finalist, national champion, national media): 85-94
   - Regional/state recognition (state champion, regional awards): 70-84
   - Strong school-level involvement with leadership: 55-69
   - Active participation without distinction: 40-54
   - Minimal involvement: 25-39

5. LEADERSHIP & INITIATIVE (8%)
   - Founded organization with national/global impact: 95-100
   - President/Captain of major organization: 80-94
   - Officer roles in multiple clubs: 65-79
   - Team captain or single club officer: 50-64
   - Some leadership experience: 35-49
   - No formal leadership: 20-34

6. ATHLETICS / ARTS / SPECIAL TALENT (6%)
   - D1 recruited athlete (revenue sports) or national arts recognition: 95-100
   - D1 recruited (Olympic sports) or regional arts recognition: 85-94
   - D3/NAIA recruited or strong local arts portfolio: 70-84
   - Varsity captain/All-State or developing talent: 55-69
   - Varsity athlete or recreational arts: 40-54
   - No athletics/arts focus: 0 (neutral, not penalized)

7. ESSAYS & PERSONAL STATEMENTS (14%)
   - Exceptional: unique voice, profound insight, memorable: 90-100
   - Strong: compelling narrative, authentic, well-crafted: 75-89
   - Good: solid story, clear writing, some depth: 60-74
   - Average: generic, competent but forgettable: 45-59
   - Weak: unfocused, clichéd: 25-44

8. LETTERS OF RECOMMENDATION (5%)
   - "Best student in my career" with specific anecdotes: 90-100
   - Detailed praise, genuine enthusiasm: 75-89
   - Positive, professional, supportive: 60-74
   - Generic, template-like: 45-59
   - Lukewarm or concerning: 25-44

9. PERSONAL CONTEXT & HARDSHIPS (7%) - ACTS AS MULTIPLIER
   - This factor is SPECIAL - it acts as a MULTIPLIER, not just an additive score
   - Significant hardship with demonstrated resilience: Context Factor = 0.10-0.15
   - Moderate hardship with growth shown: Context Factor = 0.05-0.10
   - Minor challenges overcome: Context Factor = 0.02-0.05
   - No hardship mentioned: Context Factor = 0
   - IMPORTANT: Simply stating hardship without context = no effect
   - Must show resilience, responsibility, and continued excellence

10. BACKGROUND FACTORS (3%)
    - First-generation + low-income + underrepresented: 90-100
    - First-generation college student: 75-89
    - Low-income background: 65-79
    - Underrepresented geographic region: 55-69
    - Not first-gen, standard background: 50 (neutral)

11. DEMONSTRATED INTEREST (2%)
    - Campus visit + interview + early application + consistent contact: 90-100
    - Interview + campus visit: 75-89
    - Virtual events + email engagement: 60-74
    - Basic application interest: 45-59
    - No demonstrated interest: 30-44
    - NOTE: Top Ivies/Stanford/MIT ignore this completely; other schools weigh it more

===== ACCEPTANCE PROBABILITY FORMULA =====

STEP 1: Calculate Base Score
Base Score = Σ(Factor Score × Factor Weight)
Where each factor is scored 0-100 and weights total 100%

STEP 2: Apply Context Multiplier (if personal hardships present)
Adjusted Score = Base Score × (1 + Context Factor)
- Context Factor = 0.05-0.15 depending on severity & resilience shown
- Example: Base 78% × 1.10 = 85.8%

STEP 3: Apply Institutional Fit Adjustment (final gate)
Final Score = Adjusted Score + Fit Adjustment
- Strong fit with mission/diversity/program: +5 to +15%
- Poor fit or misalignment: -5 to -15%
- This is a qualitative assessment based on university priorities

STEP 4: Apply University Difficulty Multiplier
Final Probability = Final Score × Difficulty Multiplier

===== DIFFICULTY MULTIPLIERS =====

US Universities:
- Harvard, Stanford, MIT, Caltech: 0.25
- Yale, Princeton, Columbia, Penn, Brown, Dartmouth, Cornell, Duke, Northwestern, UChicago: 0.32
- Johns Hopkins, Vanderbilt, Rice, Notre Dame, WashU: 0.42
- UCLA, Berkeley, USC, Georgetown, CMU, NYU, Michigan, UVA: 0.52
- Top 30-50: 0.65
- Top 50-100: 0.80
- Other: 0.92

UK Universities:
- Oxford, Cambridge: 0.30
- Imperial, LSE: 0.48
- UCL, Edinburgh, KCL: 0.60
- Russell Group: 0.75

Canadian Universities:
- Waterloo CS/Eng, UofT Eng: 0.55
- UofT, UBC, McGill: 0.68
- Queen's, Western, McMaster: 0.80

Asian Universities:
- Tsinghua, Peking: 0.40
- NUS, NTU Singapore: 0.50
- HKU, HKUST, Seoul National: 0.58

European Universities:
- ETH Zurich: 0.45
- EPFL: 0.50
- TU Munich, TU Delft: 0.60

===== SCORE TO PROBABILITY MAPPING =====

| Score Range | Chance of Admission | Category   |
|-------------|---------------------|------------|
| 85-100%     | Very High           | Safe       |
| 70-84%      | High                | Match      |
| 55-69%      | Moderate            | Reach      |
| <55%        | Low                 | Hard Reach |

===== VALIDATION RULES =====

CRITICAL: Before providing ANY score:
1. GPA (Grade Point Average) - REQUIRED
2. At least 1 extracurricular activity - REQUIRED

If requirements missing:
- Return: {"error": "Insufficient information", "missing": [...]}

===== DEEP-REASONING PROTOCOL (MANDATORY, INTERNAL) =====

Before producing the final JSON, think through these steps INTERNALLY (do not include the chain-of-thought in output):
A. Re-read the entire student dossier line by line. List concrete evidence for each of the 11 factors.
B. Cross-check evidence against the rubric ranges. Penalize unverified claims; reward verified document evidence.
C. Compute each factor score with a 1-line justification tied to a specific dossier line.
D. Sum weighted contributions. Show the arithmetic in a "calculation" field where the schema asks for it.
E. Apply context multiplier ONLY if hardship is concrete and shows resilience.
F. Apply institutional fit using the named university's actual published priorities.
G. Apply the difficulty multiplier from the table for that exact university.
H. Sanity-check the final percentage against published acceptance rates (a 3.4 GPA student should NOT get 80% at Harvard).
I. If two universities have similar profiles, their percentages must differ based on selectivity — never give identical numbers across very different schools.

===== MANDATORY BEHAVIOR =====

1. VALIDATE profile has GPA and at least 1 extracurricular FIRST
2. SCORE each of the 11 weighted factors (0-100) with evidence-anchored justification
3. CALCULATE Base Score using exact weights provided — show the math
4. APPLY Context Multiplier for hardship (if applicable)
5. APPLY Institutional Fit adjustment using THAT school's real priorities
6. APPLY Difficulty Multiplier for the specific university
7. SHOW complete breakdown of factor scores and contributions
8. PROVIDE 5+ specific, actionable, PERSONALIZED recommendations (reference the student by their actual data)
9. BE BRUTALLY HONEST but SOLUTION-FOCUSED — never inflate to be encouraging
10. NEVER give generic advice — every recommendation must cite a specific gap from this student's dossier
11. PERCENTAGES MUST BE REALISTIC — calibrated to real-world acceptance rates, not optimistic guesses

===== OUTPUT RULES =====
- Return ONLY valid JSON. No markdown, no code blocks.
- Always include factor breakdown with scores and weights
- Include "overallAssessment": "Very High/High/Moderate/Low"
- Include "category": "Safe/Match/Reach/Hard Reach"`;


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit (per-IP 60/min, per-user 20/min)
  {
    let _uid: string | null = null;
    const _auth = req.headers.get("Authorization") || "";
    const _tok = _auth.startsWith("Bearer ") ? _auth.slice(7) : "";
    if (_tok) { try { const _p = JSON.parse(atob(_tok.split(".")[1] || "")); _uid = _p?.sub ?? null; } catch {} }
    const _rl = enforceLimits(req, "university-counselor", _uid, 20, 60);
    if (_rl) return _rl;
  }


  // Health-check ping — no auth, no Gemini call. Used by AppHealthCheck.
  try {
    const cloned = req.clone();
    const peek = await cloned.json().catch(() => ({}));
    if (peek?.ping === true) {
      return new Response(JSON.stringify({ ok: true, fn: "university-counselor" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
    const { action, profile, cvText, universityName, essayText, essayType, targetUniversity, documentBoost, universities }: RequestBody = await req.json();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip validation for actions that don't need full profile
    if (action !== "visaQA" && action !== "matchExplanations") {
      // Validate minimum required fields for accurate evaluation
      const missingFields: string[] = [];
      
      if (!profile.gpa || profile.gpa.trim() === '') {
        missingFields.push('GPA');
      }
      
      const hasExtracurriculars = profile.extracurriculars && profile.extracurriculars.trim() !== '';
      
      if (!hasExtracurriculars) {
        missingFields.push('At least 1 extracurricular activity');
      }
      
      if (missingFields.length > 0) {
        console.log('Insufficient profile data. Missing:', missingFields);
        return new Response(
          JSON.stringify({ 
            error: 'Insufficient information to provide an accurate evaluation',
            missing: missingFields,
            message: `Please provide the following to receive an accurate assessment: ${missingFields.join(', ')}`
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt based on action
    let userPrompt = "";
    
    if (action === "analyzeCV") {
      userPrompt = `THIS IS A GENERAL PROFILE STRENGTH ANALYSIS - NOT a university-specific evaluation.
Do NOT return an error about missing university or other fields. Evaluate what the student HAS provided.

Apply the official 11-factor weighted scoring formula from the SYSTEM PROMPT to produce an HONEST, ACCURATE overall profile score (0-100). The score MUST reflect every section provided in the dossier — Research, Volunteer, Work Experience, Athletics, Arts, Personal Context, Essays, Recommendations, Demonstrated Interest, and any AI-verified document evidence.

===== COMPLETE STUDENT DOSSIER =====
${cvText || "(no comprehensive CV provided)"}

===== RAW PROFILE JSON (for any field not in dossier above) =====
${JSON.stringify(profile, null, 2)}

===== AI-VERIFIED DOCUMENT EVIDENCE =====
${documentBoost ? JSON.stringify(documentBoost, null, 2) : "No verified documents uploaded yet."}

YOUR TASK: Evaluate this student's profile holistically for competitive university admissions.
Score each area based on what IS provided. Do not penalize for optional fields.

SCORING FRAMEWORK:
- Academic Performance: GPA strength, course rigor (if mentioned)
- Extracurricular Impact: Leadership, depth, achievements
- Overall Competitiveness: How this profile compares to typical applicants at selective universities

**WRITING GUIDELINES**:
- Write like you're talking to a smart high school student
- Every strength should explain WHY it matters for admissions
- Every weakness should include exactly HOW to fix it
- Recommendations must be specific actions, not vague advice
- Use encouraging but honest language
- Provide at least 4-6 strengths based on what they have
- Provide 3-5 areas for improvement
- Provide 5-7 actionable recommendations

CRITICAL FORMATTING RULES:
1. All arrays (strengths, weaknesses, recommendations) MUST contain ONLY strings, not objects
2. The main score field MUST be named "score" (not "overallScore")
3. Return ONLY valid JSON, no markdown

EXAMPLE of correct format:
{
  "profileSummary": "This is a strong applicant with solid academics and meaningful extracurricular involvement...",
  "strengths": ["Your 3.8 GPA shows strong academic performance that meets requirements at most selective universities", "Leadership as Student Council President demonstrates initiative and responsibility", "..."],
  "weaknesses": ["Consider taking more AP/IB courses to show academic rigor - aim for 2-3 more by senior year", "..."],
  "score": 72,
  "breakdown": { 
    "academicsScore": 78,
    "extracurricularsScore": 70,
    "leadershipScore": 75,
    "overallCompetitiveness": 72
  },
  "recommendations": ["Join or start a club related to your intended major to show 'spike' in one area", "..."],
  "dangerPoints": ["Any critical issues to address immediately"],
  "improvementPlan": { 
    "sevenDay": ["Quick wins to start this week"],
    "thirtyDay": ["Focus areas for this month"],
    "sixMonth": ["Long-term improvements"]
  },
  "finalGuidance": "Personalized closing advice based on their specific profile"
}

Return ONLY the JSON object above. Do NOT return errors about missing information.`;

    } else if (action === "universityMatch") {
      userPrompt = `You are simulating a real admissions committee. Recommend EXACTLY 25 best-fit universities for this student and produce TRULY ACCURATE matchPercentages by applying the official 11-factor weighted formula in the SYSTEM PROMPT to EVERY university individually.

===== COMPLETE STUDENT DOSSIER =====
${cvText || "(no comprehensive CV provided)"}

===== RAW PROFILE JSON (for any field not in dossier above) =====
${JSON.stringify(profile, null, 2)}

===== AI-VERIFIED DOCUMENT EVIDENCE =====
${documentBoost ? JSON.stringify(documentBoost, null, 2) : "No verified documents uploaded yet."}

===== PREFERRED COUNTRIES =====
${profile.preferredCountries?.join(", ") || "Open to any country"}

===== MANDATORY EVALUATION PROTOCOL =====
For EACH of the 25 universities you must:
1. Score ALL 11 factors (Academic, Course Rigor, Tests, Extracurriculars, Leadership, Athletics/Arts, Essays, Recommendations, Personal Context, Background, Demonstrated Interest) using EVERY relevant field from the dossier — including Research Experience, Volunteer Hours, Work Experience, Athletics level, Arts portfolio, Legacy status, First-Gen status, Personal Context, Essay strength, Recommendation strength, and any AI-verified document ratings.
2. Apply the Context Multiplier from Personal Context / hardship if present.
3. Apply the Institutional Fit adjustment based on the student's intended major, geographic background, and the university's mission/program strengths.
4. Apply the university-specific Difficulty Multiplier from the SYSTEM PROMPT table.
5. Use REAL acceptance rates, REAL median GPA, REAL median test scores. NEVER inflate. A 3.5 GPA student MUST NOT score 70%+ at Harvard, Stanford, MIT, Oxford, or Cambridge.
6. If the student has country-specific qualifications (A-Level, Gaokao, Baccalaureate, JEE), weight them appropriately and prioritize universities in those regions.
7. If AI-verified document ratings (transcriptRating, awardsImpact, recommendationStrength, portfolioImpact) are provided, use them to REPLACE the corresponding self-reported value with HIGHER confidence.

===== DISTRIBUTION RULES (Strictly enforced) =====
- 6-8 Safe schools (matchPercentage 70-95)
- 10-12 Match schools (matchPercentage 40-69)
- 6-8 Reach / Hard Reach schools (matchPercentage 5-39)
- Include at least 3 universities from each preferred country if multiple are listed.

===== OUTPUT JSON STRUCTURE =====
Return ONLY valid JSON, no markdown:
{
  "profileSummary": "3-4 sentences capturing this student's unique strengths, context, and competitive position — must reference specific data points from the dossier.",
  "globalFactorBreakdown": {
    "academicScore": 0-100,
    "courseRigorScore": 0-100,
    "testScore": 0-100,
    "extracurricularScore": 0-100,
    "leadershipScore": 0-100,
    "talentScore": 0-100,
    "essayScore": 0-100,
    "recommendationScore": 0-100,
    "contextMultiplier": 0.00-0.15,
    "backgroundScore": 0-100,
    "demonstratedInterestScore": 0-100,
    "baseScore": 0-100,
    "adjustedScore": 0-100,
    "factorsUsed": ["List EVERY profile field that influenced these scores, e.g. 'Research Experience: 2yr lab', 'Volunteer: 200hr', 'Personal Context: family caregiver'"]
  },
  "universities": [
    {
      "name": "University Name",
      "country": "Country",
      "matchPercentage": 75,
      "category": "Safe/Match/Reach/Hard Reach",
      "acceptanceRate": "Real acceptance rate (e.g., '3.4%')",
      "medianGPA": "Real median admitted GPA (e.g., '3.9-4.0')",
      "medianTestScore": "Real median test score (e.g., 'SAT 1500-1560')",
      "difficultyMultiplier": 0.25,
      "fitAdjustment": "+5 to +15 or -5 to -15 with one-line reason",
      "whyThisStudent": "1-2 sentences citing SPECIFIC student attributes (research, hardship, awards, major fit) — NO generic statements.",
      "recommendations": ["Tip 1 as string", "Tip 2 as string", "Tip 3 as string"]
    }
  ]
}

CRITICAL: Every "whyThisStudent" must reference at least ONE non-academic field (research, volunteer, work, context, talent, legacy, first-gen, or document evidence). Generic statements are forbidden.
You MUST return exactly 25 universities.`;


    } else if (action === "universityChecker" && universityName) {
      userPrompt = `You are the world's most experienced admissions officer at ${universityName}. Produce a TRULY ACCURATE, brutally honest, and personalized admission probability for THIS specific student. Return ONLY valid JSON.

===== COMPLETE STUDENT DOSSIER =====
${cvText || "(no comprehensive CV provided)"}

===== RAW PROFILE JSON (for any field not in dossier above) =====
${JSON.stringify(profile, null, 2)}

===== AI-VERIFIED DOCUMENT EVIDENCE =====
${documentBoost ? JSON.stringify(documentBoost, null, 2) : "No verified documents uploaded yet."}

===== TARGET UNIVERSITY =====
${universityName}

===== MANDATORY EVALUATION PROTOCOL =====
1. Score ALL 11 weighted factors from the SYSTEM PROMPT (0-100) using EVERY relevant field — including Research, Volunteer, Work Experience, Athletics, Arts, Legacy, First-Gen, Personal Context, Essays, Recommendations, and any verified document ratings.
2. Compute Base Score = Σ(Factor Score × Weight).
3. Apply Context Multiplier (0.00-0.15) for personal hardship/resilience.
4. Apply Institutional Fit (+/- 5-15) based on student's major/background vs ${universityName}'s mission.
5. Apply ${universityName}-specific Difficulty Multiplier from the SYSTEM PROMPT table.
6. Cross-check the result against ${universityName}'s REAL acceptance rate, REAL median admitted GPA, and REAL median test scores. NEVER inflate.
7. If the student has country-specific qualifications (A-Level, Gaokao, Baccalaureate, JEE), weight them heavily.


YOUR TASK: Provide an EXHAUSTIVE analysis covering:
1. Realistic admission chance based on actual acceptance rates & student profile
2. What the admissions committee at ${universityName} SPECIFICALLY looks for
3. How this student's profile compares to admitted students
4. A step-by-step action plan to MAXIMIZE their chances
5. Key deadlines, requirements, and insider knowledge about the university
6. Financial information (tuition, aid availability, scholarships)

CRITICAL: recommendations array MUST contain ONLY strings, not objects.

Required JSON structure:
{
  "university": "${universityName}",
  "country": "string",
  "matchPercentage": 65,
  "category": "Safe/Match/Reach/Hard Reach",
  "profileSummary": "Detailed 3-4 sentence assessment of how strong this student is for THIS university",
  "recommendations": ["Specific actionable recommendation 1", "Recommendation 2", "Recommendation 3", "Recommendation 4", "Recommendation 5", "Recommendation 6", "Recommendation 7"],
  "medianAdmissionStats": { "gpa": 3.9, "testScore": 1500, "acceptanceRate": 5 },
  "whatUniversityLooksFor": [
    "Specific trait or quality ${universityName} values most",
    "Second most important factor",
    "Third factor",
    "Fourth factor",
    "Fifth factor"
  ],
  "studentStrengths": [
    "How THIS student's specific quality aligns with what ${universityName} wants",
    "Another strength relative to ${universityName}'s criteria",
    "Third strength"
  ],
  "studentWeaknesses": [
    "Gap between student profile and ${universityName}'s expectations with HOW to fix it",
    "Another weakness with specific remedy",
    "Third weakness with fix"
  ],
  "applicationStrategy": {
    "earlyOrRegular": "Whether to apply Early Decision/Action or Regular and WHY",
    "essayAngle": "Specific essay topic/angle that would resonate with ${universityName}'s values",
    "interviewTips": "What to emphasize if ${universityName} offers interviews",
    "demonstratedInterest": "How to show genuine interest in ${universityName} specifically"
  },
  "universityInsights": {
    "culture": "What campus life and student culture is like",
    "academicFocus": "What ${universityName} is best known for academically",
    "acceptanceRateTrend": "How competitive it has become recently",
    "uniquePrograms": "Any standout programs, research opportunities, or unique offerings",
    "location": "City/setting and what that means for students",
    "alumniNetwork": "Strength and relevance of alumni connections"
  },
  "financialInfo": {
    "estimatedTuition": "Annual tuition estimate",
    "financialAidAvailability": "How generous their aid is and what % of students receive it",
    "relevantScholarships": ["Scholarship name + amount + eligibility this student may qualify for"],
    "needBlind": "Whether admissions is need-blind"
  },
  "keyDeadlines": [
    { "deadline": "Date", "type": "Early Decision/Regular/Financial Aid", "note": "Important detail" }
  ],
  "actionPlan": [
    { "timeframe": "This Week", "actions": ["Specific action 1", "Action 2"] },
    { "timeframe": "This Month", "actions": ["Action 1", "Action 2"] },
    { "timeframe": "3 Months", "actions": ["Action 1", "Action 2"] },
    { "timeframe": "6 Months", "actions": ["Action 1", "Action 2"] }
  ],
  "factorScores": [
    { "factor": "Academic Performance", "score": 85, "weight": 22, "contribution": 18.7, "status": "strength" },
    { "factor": "Course Rigor", "score": 70, "weight": 13, "contribution": 9.1, "status": "neutral" },
    { "factor": "Standardized Tests", "score": 80, "weight": 5, "contribution": 4.0, "status": "strength" },
    { "factor": "Extracurriculars & Achievements", "score": 60, "weight": 15, "contribution": 9.0, "status": "neutral" },
    { "factor": "Leadership & Initiative", "score": 55, "weight": 8, "contribution": 4.4, "status": "neutral" },
    { "factor": "Athletics / Arts / Talent", "score": 0, "weight": 6, "contribution": 0, "status": "weakness" },
    { "factor": "Essays & Personal Statements", "score": 70, "weight": 14, "contribution": 9.8, "status": "neutral" },
    { "factor": "Recommendations", "score": 65, "weight": 5, "contribution": 3.25, "status": "neutral" },
    { "factor": "Personal Context", "score": 50, "weight": 7, "contribution": 3.5, "status": "neutral" },
    { "factor": "Background Factors", "score": 50, "weight": 3, "contribution": 1.5, "status": "neutral" },
    { "factor": "Demonstrated Interest", "score": 60, "weight": 2, "contribution": 1.2, "status": "neutral" }
  ]
}`;

    } else if (action === "roadmap") {
      userPrompt = `Create a 6-phase application roadmap for this student. Be concise and practical.

Profile: ${JSON.stringify(profile)}

Return ONLY this JSON (keep each task under 15 words):
{
  "profileSummary": "One sentence assessment",
  "roadmap": [
    { "month": "Phase 1: Research (Month 1-2)", "actions": ["task1", "task2", "task3"] },
    { "month": "Phase 2: Preparation (Month 3-4)", "actions": ["task1", "task2", "task3"] },
    { "month": "Phase 3: Testing (Month 5-6)", "actions": ["task1", "task2"] },
    { "month": "Phase 4: Applications (Month 7-8)", "actions": ["task1", "task2", "task3"] },
    { "month": "Phase 5: Essays & Interviews (Month 9-10)", "actions": ["task1", "task2"] },
    { "month": "Phase 6: Final Steps (Month 11-12)", "actions": ["task1", "task2"] }
  ],
  "milestones": ["milestone1", "milestone2", "milestone3", "milestone4"],
  "finalGuidance": "Brief personalized closing advice"
}

IMPORTANT: "actions" must be flat string arrays. Keep response under 800 tokens.`;

    } else if (action === "essayScholarship") {
      userPrompt = `Generate essay topics and scholarship matches for this student. Make essay ideas INSPIRING and scholarship info ACTIONABLE.

Profile: ${JSON.stringify(profile)}
CV Text: ${cvText || "No CV text provided"}

**WRITING GUIDELINES**:
- Essay topics should be unique to THIS student's experiences
- Include a hook or angle that makes each topic stand out
- Explain WHY each topic would resonate with admissions officers
- Scholarship descriptions should include specific action steps

Required JSON structure:
{
  "profileSummary": "What unique stories does this student have to tell?",
  "essayTopics": [{ 
    "title": "Catchy, specific title",
    "description": "2-3 sentences: What's the story? Why would this resonate?",
    "type": "personal/academic/creative"
  }],
  "scholarships": [{ 
    "name": "Scholarship Name",
    "amount": "$X,XXX - $XX,XXX",
    "probability": 70,
    "deadline": "Month Year",
    "requirements": ["Specific requirement they meet"]
  }],
  "improvementPlan": { 
    "sevenDay": ["Essay-related quick wins"],
    "thirtyDay": ["Scholarship applications to start"],
    "sixMonth": ["Long-term writing goals"]
  },
  "finalGuidance": "Personalized advice on crafting their narrative"
}`;

    } else if (action === "analyzeEssay") {
      
      userPrompt = `Analyze this essay for college admissions. Return ONLY valid JSON.

Essay Text: ${essayText}
Essay Type: ${essayType || "Personal Statement"}
Target University: ${targetUniversity || "General"}
Student Profile: ${JSON.stringify(profile)}

Evaluate the essay on 5 dimensions (0-100 each):
1. Structure - Organization, flow, introduction/conclusion strength
2. Clarity - Writing quality, conciseness, readability
3. Authenticity - Genuine voice, personal insight, unique perspective
4. Depth - Reflection, growth shown, meaningful content
5. Impact - Memorable moments, emotional resonance, lasting impression

Also analyze how different university REGIONS would interpret this essay differently.

Required JSON structure:
{
  "overallScore": 75,
  "structure": 80,
  "clarity": 75,
  "authenticity": 70,
  "depth": 72,
  "impact": 68,
  "feedback": ["Feedback 1", "Feedback 2", "Feedback 3", "Feedback 4", "Feedback 5"],
  "universityInterpretations": [
    {
      "region": "Ivy League",
      "score": 72,
      "interpretation": "How Ivy admissions would view this essay",
      "weight": "Essays count for ~15% at Ivies"
    },
    {
      "region": "UK Universities",
      "score": 70,
      "interpretation": "How Oxford/Cambridge would view it",
      "weight": "Personal statement ~10-15% weight"
    },
    {
      "region": "Canadian Universities",
      "score": 75,
      "interpretation": "How UofT/McGill would view it",
      "weight": "Supplementary essays ~12% weight"
    },
    {
      "region": "European Universities",
      "score": 68,
      "interpretation": "How ETH/TU Munich would view it",
      "weight": "Motivation letter ~8% weight"
    },
    {
      "region": "Asian Universities",
      "score": 70,
      "interpretation": "How NUS/HKU would view it",
      "weight": "Essays ~8% weight"
    }
  ]
}`;

    } else if (action === "fitMatrix") {
      const fitAnswers = cvText || "";
      userPrompt = `You are the world's best university fit advisor. A student has completed the FitMatrix™ quiz AND you have their academic profile.

STUDENT PROFILE: ${JSON.stringify(profile)}
FIT PREFERENCES (from quiz): ${fitAnswers}

YOUR TASK: Based on BOTH the student's academic profile AND their lifestyle/personality preferences, recommend exactly 3 universities where this student would truly BELONG — not just get admitted, but thrive.

For each university, explain:
1. Why this university is a great FIT (culture, size, location, vibe match)
2. Why the student has a realistic chance of admission based on their academics
3. What makes this school special for THIS student specifically

Return ONLY valid JSON:
{
  "picks": [
    {
      "name": "University Name",
      "country": "Country",
      "matchScore": 85,
      "whyYouBelong": "2-3 sentences explaining why this student would thrive here, connecting their personality/lifestyle preferences to the university's culture",
      "highlights": ["Perfect size match", "Strong in their major", "Great post-grad opportunities", "Matches campus vibe"]
    }
  ]
}

CRITICAL: Only 3 universities. Make them DIFFERENT from each other (different countries/types ideally). Be realistic about matchScore based on actual admission stats.`;

    } else if (action === "compareVerdict") {
      const unis = universityName || "";
      // Parse "Uni A vs Uni B" so we can echo back exact names
      const parts = unis.split(/\s+vs\s+/i).map(s => s.trim()).filter(Boolean);
      const uniAName = parts[0] || "University A";
      const uniBName = parts[1] || "University B";

      userPrompt = `Compare these two universities for THIS specific student and decide which one is BETTER for them and WHY. You MUST pick a clear winner — do not say "both are equal".

Student Profile: ${JSON.stringify(profile)}

University A: "${uniAName}"
University B: "${uniBName}"

Evaluate across these 6 categories (score each 0-100):
1. Academic Fit — GPA match, program strength in intended major
2. Admission Probability — based on real acceptance rates vs student stats
3. Financial Fit — tuition vs student's budget, scholarships
4. Location & Lifestyle — climate, culture, campus environment
5. Career Outcomes — alumni network, employment, salary outcomes
6. Overall Value — ROI, prestige vs cost

Pick the winner of EACH category (must be "A" or "B", never "tie"). Then pick the OVERALL winner.

Return ONLY valid JSON in this EXACT shape (no markdown, no commentary):
{
  "winner": "A" or "B",
  "verdict": "${uniAName}" or "${uniBName}" (the actual name of the winner),
  "verdictReason": "2-3 sentence summary explaining why this university is better FOR THIS STUDENT, referencing their profile.",
  "comparison": [
    { "category": "Academic Fit",        "uniA": { "score": 85, "note": "..." }, "uniB": { "score": 78, "note": "..." }, "winner": "A" },
    { "category": "Admission Probability","uniA": { "score": 70, "note": "..." }, "uniB": { "score": 60, "note": "..." }, "winner": "A" },
    { "category": "Financial Fit",       "uniA": { "score": 60, "note": "..." }, "uniB": { "score": 80, "note": "..." }, "winner": "B" },
    { "category": "Location & Lifestyle","uniA": { "score": 75, "note": "..." }, "uniB": { "score": 70, "note": "..." }, "winner": "A" },
    { "category": "Career Outcomes",     "uniA": { "score": 90, "note": "..." }, "uniB": { "score": 85, "note": "..." }, "winner": "A" },
    { "category": "Overall Value",       "uniA": { "score": 80, "note": "..." }, "uniB": { "score": 75, "note": "..." }, "winner": "A" }
  ],
  "finalAdvice": "Personalized 2-3 sentence advice for the student."
}`;

    } else if (action === "visaQA") {
      const question = cvText || "";
      userPrompt = `You are an expert immigration and visa counselor for international students. Answer this student's visa/immigration question clearly and helpfully.

Student Profile: ${JSON.stringify(profile)}
Question: ${question}

GUIDELINES:
- Be specific and practical
- If you don't know exact current rules, say so and suggest where to verify
- Include step-by-step guidance where appropriate
- Mention any common mistakes or pitfalls
- Be encouraging but honest about challenges

Return a clear, helpful answer as plain text (NOT JSON). Use markdown formatting for readability.`;

    } else if (action === "matchExplanations") {
      const unis = Array.isArray(universities) ? universities : [];
      const studentCountry = (profile as any)?.country || (profile as any)?.geographicLocation || null;

      userPrompt = `You are a top-tier admissions counselor writing a PRIORITIZED, NON-REPETITIVE brief for EACH university below. Output STRICT JSON only.

═══════════ ABSOLUTE RULES ═══════════
1. NEVER include numbers, scores, percentages, or statistics in your prose.
2. NEVER recalculate or second-guess the alignment score — the engine already did the math.
3. Tone: direct, neutral, counselor-grade. NOT emotional. NOT exaggerated. NOT cheerleading.
4. BANNED words/phrases: amazing, incredible, concerning, perfect, terrible, guarantee, predict, chance, probability, strong profile, stand out, showcase your passion, unleash your potential, dream school, world-class.
5. Each university's brief MUST feel DIFFERENT — name that school's specific priorities (provided in priorities.distinctivePriorities) verbatim or in close paraphrase.
6. NEVER reuse a sentence structure or framing across universities. Vary openings.
7. Address ONLY the top-3 leveragePoints provided per uni — in that exact order. Do not invent gaps the engine didn't surface.

═══════════ STUDENT ORIGIN ═══════════
Student country: ${studentCountry || "(not specified)"}
For the "honestTakeForOrigin" block, write context-aware advice for this applicant's nationality. If origin is unknown, write a brief note about preparing the application package.

═══════════ FOR EACH UNIVERSITY, RETURN ═══════════
- bottomLine          (1 sentence, max 25 words, direct verdict — uses uni-specific priority phrase)
- leveragePoints      (array of EXACTLY 3 items in the engine's ranked order)
    each: { factor, why (max 30 words: why THIS gap matters at THIS school, referencing distinctivePriorities), action (max 30 words: ONE concrete 30-day action) }
- whatThisSchoolWeighs (max 50 words: directly paraphrase the school's distinctivePriorities into student-facing language. Mention 1-2 knownDealbreakers.)
- honestTakeForOrigin  (max 50 words: realistic context for this nationality applying here. Mention need-blind/need-aware status if cross-border.)

STUDENT PROFILE: ${JSON.stringify(profile)}

UNIVERSITIES (engine output, priorities, leveragePoints all provided): ${JSON.stringify(unis)}

Return EXACTLY:
{
  "explanations": {
    "<University Name>": {
      "bottomLine": "...",
      "leveragePoints": [
        { "factor": "...", "why": "...", "action": "..." },
        { "factor": "...", "why": "...", "action": "..." },
        { "factor": "...", "why": "...", "action": "..." }
      ],
      "whatThisSchoolWeighs": "...",
      "honestTakeForOrigin": "..."
    }
  }
}`;

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action or missing data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${action} request`);

    // Map action -> task preset (centralized model + token + temp config)
    const ACTION_TASK: Record<string, TaskName> = {
      analyzeCV: "profile_score",
      universityMatch: "uni_matches",
      compareVerdict: "uni_matches",
      universityChecker: "uni_checker",
      fitMatrix: "fit_matrix",
      matchExplanations: "match_explanations",
      visaQA: "visa_qa",
    };
    const task: TaskName = ACTION_TASK[action] || "generic";

    let ai;
    try {
      ai = await callAI({
        task,
        userId: user.id,
        expectJSON: action !== "visaQA",
        hedge: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });
    } catch (e) {
      // Truncation recovery: ask the model to be concise and try once more
      console.error("Primary callAI failed, retrying concise:", e);
      const concisePrompt = userPrompt + "\n\nIMPORTANT: Keep response concise. If matching universities, limit to 15 universities. Be brief but accurate.";
      ai = await callAI({
        task,
        userId: user.id,
        expectJSON: action !== "visaQA",
        hedge: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + "\n\nBe concise. Quality over quantity." },
          { role: "user", content: concisePrompt },
        ],
      });
    }

    // For visaQA, return raw text (not JSON)
    if (action === "visaQA") {
      return new Response(
        JSON.stringify({
          success: true,
          result: { answer: ai.content },
          meta: { model: ai.model, latencyMs: ai.latencyMs, requestId: ai.requestId, attempts: ai.attempts, usedFallback: ai.usedFallback },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let result;
    try {
      result = extractJSON(ai.content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Last 200 chars:", ai.content.slice(-200));
      return new Response(
        JSON.stringify({ error: "Failed to process AI response", requestId: ai.requestId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        result,
        meta: { model: ai.model, latencyMs: ai.latencyMs, requestId: ai.requestId, attempts: ai.attempts, usedFallback: ai.usedFallback },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );

  } catch (error) {
    console.error("Edge function error:", error);
    return aiErrorResponse(error, corsHeaders);
  }
});
