// ============================================================================
// UniVista — Global Profile Schema (Single Source of Truth)
// ----------------------------------------------------------------------------
// All AI / scoring / matching modules must consume a UnifiedProfile, never the
// raw legacy ProfileData shape. The adapter `toUnifiedProfile(legacy)` maps
// legacy flat fields into this schema with safe fallbacks so missing inputs
// never crash downstream consumers.
// ============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const ActivityCategoryEnum = z.enum([
  "Leadership",
  "Research",
  "Sports",
  "NGO",
  "Creative",
  "Work",
  "Other",
]);

export const ActivityLevelEnum = z.enum(["Local", "National", "International"]);
export const AchievementLevelEnum = z.enum(["School", "National", "International"]);

export const TestScoresSchema = z.object({
  sat: z.number().nullable(),
  act: z.number().nullable(),
  ielts: z.number().nullable(),
  toefl: z.number().nullable(),
});

export const AcademicCoreSchema = z.object({
  gpa: z.number().nullable(),
  course_rigor: z.string(),
  test_scores: TestScoresSchema,
  national_exam: z.string().nullable(),
});

export const ActivitySchema = z.object({
  title: z.string(),
  category: ActivityCategoryEnum,
  duration_months: z.number(),
  level: ActivityLevelEnum,
  impact_score: z.number().min(1).max(5),
});

export const AchievementSchema = z.object({
  name: z.string(),
  level: AchievementLevelEnum,
  proof_url: z.string().nullable(),
});

export const UnifiedProfileSchema = z.object({
  academic_core: AcademicCoreSchema,
  activities: z.array(ActivitySchema),
  achievements: z.array(AchievementSchema),
  personal_context: z.string().nullable(),
});

export type UnifiedProfile = z.infer<typeof UnifiedProfileSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Achievement = z.infer<typeof AchievementSchema>;

// ---------------------------------------------------------------------------
// Safe defaults — non-negotiable fallback system
// ---------------------------------------------------------------------------

export const EMPTY_TEST_SCORES = { sat: null, act: null, ielts: null, toefl: null };

export const EMPTY_ACADEMIC_CORE = {
  gpa: null,
  course_rigor: "",
  test_scores: { ...EMPTY_TEST_SCORES },
  national_exam: null,
};

export const EMPTY_UNIFIED_PROFILE: UnifiedProfile = {
  academic_core: { ...EMPTY_ACADEMIC_CORE, test_scores: { ...EMPTY_TEST_SCORES } },
  activities: [],
  achievements: [],
  personal_context: null,
};

// ---------------------------------------------------------------------------
// Internal parsing helpers (legacy text → structured arrays)
// ---------------------------------------------------------------------------

const splitLines = (s?: string | null): string[] =>
  String(s ?? "")
    .split(/[\n;•·]+|(?:^|\s)[-*]\s+/)
    .map(l => l.trim())
    .filter(Boolean);

const detectCategory = (text: string): z.infer<typeof ActivityCategoryEnum> => {
  const t = text.toLowerCase();
  if (/lead|president|captain|founder|chair|head/.test(t)) return "Leadership";
  if (/research|lab|paper|publication|professor/.test(t)) return "Research";
  if (/sport|team|athlet|football|basketball|tennis|swim|track/.test(t)) return "Sports";
  if (/volunteer|ngo|charity|community|outreach|service/.test(t)) return "NGO";
  if (/art|music|design|theatre|film|writing|photo|paint|dance/.test(t)) return "Creative";
  if (/intern|work|job|employ/.test(t)) return "Work";
  return "Other";
};

const detectLevel = (text: string): z.infer<typeof ActivityLevelEnum> => {
  const t = text.toLowerCase();
  if (/international|world|global|olympi|imo|ipho|iso/.test(t)) return "International";
  if (/national|country|state-wide|nationwide/.test(t)) return "National";
  return "Local";
};

const detectAchievementLevel = (text: string): z.infer<typeof AchievementLevelEnum> => {
  const t = text.toLowerCase();
  if (/international|world|global|olympi/.test(t)) return "International";
  if (/national|country|state/.test(t)) return "National";
  return "School";
};

const estimateImpact = (text: string): number => {
  const t = text.toLowerCase();
  if (/founder|president|captain|first place|gold|winner|award/.test(t)) return 5;
  if (/lead|head|chair|second place|silver|finalist/.test(t)) return 4;
  if (/officer|coordinator|bronze|honorable/.test(t)) return 3;
  if (/member|participant/.test(t)) return 2;
  return 3;
};

const estimateDurationMonths = (text: string): number => {
  const yrs = text.match(/(\d+(?:\.\d+)?)\s*(?:yr|year)/i);
  if (yrs) return Math.round(parseFloat(yrs[1]) * 12);
  const mos = text.match(/(\d+)\s*(?:mo|month)/i);
  if (mos) return parseInt(mos[1], 10);
  return 12; // sensible default
};

const extractProofUrl = (text: string): string | null => {
  const m = text.match(/https?:\/\/\S+/i);
  return m ? m[0] : null;
};

const safeNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
};

const parseTestScores = (raw?: string | null): UnifiedProfile["academic_core"]["test_scores"] => {
  const s = String(raw ?? "");
  const sat = s.match(/sat[^\d]*(\d{3,4})/i);
  const act = s.match(/act[^\d]*(\d{1,2})/i);
  const ielts = s.match(/ielts[^\d]*(\d(?:\.\d)?)/i);
  const toefl = s.match(/toefl[^\d]*(\d{2,3})/i);
  return {
    sat: sat ? safeNumber(sat[1]) : null,
    act: act ? safeNumber(act[1]) : null,
    ielts: ielts ? safeNumber(ielts[1]) : null,
    toefl: toefl ? safeNumber(toefl[1]) : null,
  };
};

const mapBuilderActivity = (a: any): Activity | null => {
  const title = String(a?.title ?? a?.name ?? a?.subtype ?? "").trim();
  if (!title) return null;
  // Builder format → unified
  if (a?.subtype || Array.isArray(a?.roles) || Array.isArray(a?.achievements)) {
    const blob = `${title} ${(a.roles ?? []).join(" ")} ${(a.achievements ?? []).join(" ")}`;
    const cat = ActivityCategoryEnum.options.includes(a?.category) ? a.category : detectCategory(blob);
    const scope = String(a?.scope ?? "").toLowerCase();
    const level: z.infer<typeof ActivityLevelEnum> =
      scope.includes("intern") ? "International" :
      scope.includes("nation") ? "National" :
      scope.includes("city") || scope.includes("school") ? "Local" :
      detectLevel(blob);
    const months = (safeNumber(a?.years) ?? 1) * 12;
    const impact = Math.min(5, Math.max(1, Math.round(estimateImpact(blob) + ((a?.achievements?.length ?? 0) > 2 ? 0.5 : 0))));
    return { title: title.slice(0, 240), category: cat, duration_months: months, level, impact_score: impact };
  }
  return null;
};

const buildActivities = (legacy: any): Activity[] => {
  // Already structured? trust it after light validation.
  if (Array.isArray(legacy?.activities)) {
    return legacy.activities
      .map((a: any) => {
        const parsed = ActivitySchema.safeParse(a);
        if (parsed.success) return parsed.data;
        const title = String(a?.title ?? a?.name ?? "").trim();
        if (!title) return null;
        return {
          title,
          category: ActivityCategoryEnum.options.includes(a?.category) ? a.category : detectCategory(title),
          duration_months: safeNumber(a?.duration_months) ?? estimateDurationMonths(title),
          level: ActivityLevelEnum.options.includes(a?.level) ? a.level : detectLevel(title),
          impact_score: Math.min(5, Math.max(1, safeNumber(a?.impact_score) ?? estimateImpact(title))),
        } as Activity;
      })
      .filter(Boolean) as Activity[];
  }

  const text =
    legacy?.activities_text ??
    legacy?.extracurriculars ??
    legacy?.extracurriculars_text ??
    "";

  // Try JSON-stringified BuilderActivity[] first (new ActivityBuilder format)
  if (typeof text === "string" && text.trim().startsWith("[")) {
    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) {
        const mapped = arr.map(mapBuilderActivity).filter(Boolean) as Activity[];
        if (mapped.length) return mapped;
      }
    } catch {
      // fall through to text parsing
    }
  }

  return splitLines(text).map(line => ({
    title: line.slice(0, 240),
    category: detectCategory(line),
    duration_months: estimateDurationMonths(line),
    level: detectLevel(line),
    impact_score: estimateImpact(line),
  }));
};

const buildAchievements = (legacy: any): Achievement[] => {
  if (Array.isArray(legacy?.achievements)) {
    return legacy.achievements
      .map((a: any) => {
        const parsed = AchievementSchema.safeParse(a);
        if (parsed.success) return parsed.data;
        const name = String(a?.name ?? a?.title ?? "").trim();
        if (!name) return null;
        return {
          name,
          level: AchievementLevelEnum.options.includes(a?.level) ? a.level : detectAchievementLevel(name),
          proof_url: typeof a?.proof_url === "string" && a.proof_url ? a.proof_url : null,
        } as Achievement;
      })
      .filter(Boolean) as Achievement[];
  }

  const text =
    legacy?.achievements_text ??
    legacy?.honors_awards ??
    legacy?.apIbCourses ??
    "";
  return splitLines(text).map(line => ({
    name: line.slice(0, 240),
    level: detectAchievementLevel(line),
    proof_url: extractProofUrl(line),
  }));
};

// ---------------------------------------------------------------------------
// Adapter — legacy ProfileData → UnifiedProfile (with safe fallbacks)
// ---------------------------------------------------------------------------

export function toUnifiedProfile(legacy: any): UnifiedProfile {
  if (!legacy || typeof legacy !== "object") return EMPTY_UNIFIED_PROFILE;

  // If caller already passed a unified-shaped object, validate & return.
  const direct = UnifiedProfileSchema.safeParse(legacy);
  if (direct.success) return direct.data;

  const academic_core = {
    gpa: safeNumber(legacy.gpa ?? legacy.academic_core?.gpa),
    course_rigor: String(legacy.course_rigor ?? legacy.courseRigor ?? legacy.academic_core?.course_rigor ?? ""),
    test_scores: legacy.academic_core?.test_scores
      ? {
          sat: safeNumber(legacy.academic_core.test_scores.sat),
          act: safeNumber(legacy.academic_core.test_scores.act),
          ielts: safeNumber(legacy.academic_core.test_scores.ielts),
          toefl: safeNumber(legacy.academic_core.test_scores.toefl),
        }
      : parseTestScores(legacy.test_scores ?? legacy.testScores),
    national_exam:
      legacy.academic_core?.national_exam ??
      (legacy.national_exam_type
        ? `${legacy.national_exam_type}: ${legacy.national_exam_score ?? ""}`.trim()
        : legacy.a_level_grades ||
          legacy.aLevelGrades ||
          legacy.gaokao_score ||
          legacy.gaokaoScore ||
          legacy.baccalaureate_score ||
          legacy.baccalaureateScore ||
          null),
  };

  const personal_context =
    legacy.personal_context ??
    legacy.personalContext ??
    legacy.hardship_context ??
    null;

  const unified: UnifiedProfile = {
    academic_core,
    activities: buildActivities(legacy),
    achievements: buildAchievements(legacy),
    personal_context: personal_context ? String(personal_context) : null,
  };

  // Final validation pass — schema ensures shape; on failure return safe empty.
  const out = UnifiedProfileSchema.safeParse(unified);
  return out.success ? out.data : EMPTY_UNIFIED_PROFILE;
}

/**
 * Validate an existing unified profile. Returns { ok, profile, errors }.
 * Used by the edge-function adapter before any AI call.
 */
export function validateUnifiedProfile(input: unknown): {
  ok: boolean;
  profile: UnifiedProfile;
  errors?: z.ZodIssue[];
} {
  const parsed = UnifiedProfileSchema.safeParse(input);
  if (parsed.success) return { ok: true, profile: parsed.data };
  // Best-effort recovery via adapter.
  const recovered = toUnifiedProfile(input);
  return { ok: false, profile: recovered, errors: parsed.error.issues };
}
