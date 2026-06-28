/**
 * matchEngine.ts — DETERMINISTIC, PURE-MATH university alignment engine.
 *
 * Single source of truth for all match scoring. No AI involvement.
 * Same input ALWAYS produces the same output.
 *
 * Philosophy:
 *   - Math = deterministic engine (this file)
 *   - AI   = explanation only (edge function)
 *   - Data = verified only (universityData.ts)
 *   - No predictions, only data-driven comparisons.
 *
 * v2 — adds origin-country awareness, intl-rate selection, and top-3
 * leverage-point extraction for the AI counselor brief.
 */

import type { UniversityStats } from "./universityData";
import { getPriorities, type UniversityPriorities } from "./universityPriorities";

// ──────────────────────────────────────────────────────────────────
// CONSTANTS — Single source of truth (read by MethodologyPage too)
// ──────────────────────────────────────────────────────────────────

/** Weight of each factor in the alignment score. Total = 100. */
export const WEIGHTS = {
  academics: 42,        // GPA vs median admit GPA
  testing: 18,          // SAT/ACT vs median admit, respecting test policy
  rigor: 14,            // Course rigor (AP/IB/A-Level/honors)
  extracurriculars: 12, // Depth & impact
  selectivity: 6,       // Inverse of selectivity = baseline competitiveness
  international: 8,     // Origin-country context (only when applicable)
} as const;

export const CATEGORY_THRESHOLDS = {
  safe: 70,
  match: 50,
  reach: 30,
} as const;

export const RANGE_SPREAD = 5;

export const PERCENTILE_THRESHOLD = 0.30;
export const MAX_INCLUDED = 15;
export const MIN_INCLUDED = 5;

// ──────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────

export type AlignmentCategory = "Safe" | "Match" | "Reach" | "Hard Reach";

export interface FactorBreakdown {
  factor: string;
  studentValue: string;
  universityValue: string;
  factorScore: number;     // 0-100 score for this factor
  weight: number;          // % weight
  contribution: number;    // factorScore * weight / 100
}

export interface TraceStep {
  label: string;
  detail: string;
  value?: string;
}

/** A ranked leverage point — what the student should focus on for THIS uni. */
export interface LeveragePoint {
  factor: string;
  /** 0-100 — weighted gap (large = most leverage). */
  leverageScore: number;
  /** Plain-English description. */
  description: string;
}

export interface InternationalContext {
  applies: boolean;                          // student country ≠ uni country
  studentCountry: string | null;
  uniCountry: string;
  overallRate: number;
  intlRate: number | null;                   // null when uni doesn't publish
  isEstimate: boolean;                       // true when intl rate fell back to overall × adjustment
  effectiveRate: number;                     // the rate actually used in messaging
  needBlindIntl: boolean;
}

export interface AlignmentResult {
  universityName: string;
  country: string;
  acceptanceRate: number;                    // overall (for legacy fields)
  effectiveAcceptanceRate: number;           // intl rate when applicable
  internationalContext: InternationalContext;
  score: number;
  range: { min: number; max: number };
  category: AlignmentCategory;
  oneLiner: string;
  simpleExplanation: string[];               // 3 plain-English lines
  factorBreakdown: FactorBreakdown[];
  traceLog: TraceStep[];
  narrativeAngle: NarrativeAngle;
  /** Top 3 leverage points (engine-ranked, fed to AI). */
  leveragePoints: LeveragePoint[];
  /** Per-uni institutional priorities (fed to AI for differentiation). */
  priorities: UniversityPriorities;
  dataSourceUrl: string;
  dataYear: number;
}

export type NarrativeAngle =
  | "academic"
  | "holistic"
  | "technical"
  | "creative"
  | "accessibility";

export interface SelectionResult {
  included: AlignmentResult[];
  notIncluded: { name: string; reason: string }[];
  /** Single highest-scoring university across the eligible pool. Always populated when any school scored. */
  topPick: AlignmentResult | null;
  /** Highest-scoring university per target country (key = country name as supplied). */
  topPickByCountry: Record<string, AlignmentResult>;
}

// ──────────────────────────────────────────────────────────────────
// PARSING HELPERS
// ──────────────────────────────────────────────────────────────────

const parseGPA = (raw: string | null | undefined): number | null => {
  if (!raw) return null;
  const m = String(raw).match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  let v = parseFloat(m[1]);
  if (isNaN(v)) return null;
  if (v > 4.5 && v <= 100) v = v / 25;
  return Math.max(0, Math.min(4.0, v));
};

const parseSAT = (raw: string | null | undefined): number | null => {
  if (!raw) return null;
  const matches = String(raw).match(/\b(\d{3,4})\b/g);
  if (!matches) return null;
  for (const m of matches) {
    const n = parseInt(m, 10);
    if (n >= 400 && n <= 1600) return n;
  }
  return null;
};

const parseACT = (raw: string | null | undefined): number | null => {
  if (!raw) return null;
  const m = String(raw).match(/\bACT\s*[:=]?\s*(\d{1,2})\b/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 36) return n;
  }
  return null;
};

const countECs = (raw: string | null | undefined): number => {
  if (!raw) return 0;
  const items = String(raw)
    .split(/[\n,;•\-]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3);
  return items.length;
};

const rigorScore = (profile: any): number => {
  const rigor = String(profile?.course_rigor || profile?.courseRigor || "").toLowerCase();
  const aLevel = String(profile?.a_level_grades || profile?.aLevelGrades || "");
  const baccalaureate = String(profile?.baccalaureate_score || profile?.baccalaureateScore || "");

  if (/ib\s*diploma|full ib/.test(rigor) || baccalaureate) return 90;
  if (/10\+|many ap|10 ap|11 ap|12 ap/.test(rigor)) return 88;
  if (/a[*]|a\*|a-level/.test(rigor) || aLevel) return 85;
  if (/6-9|6 ap|7 ap|8 ap|9 ap|several ap/.test(rigor)) return 75;
  if (/3-5|3 ap|4 ap|5 ap|few ap/.test(rigor)) return 60;
  if (/honors/.test(rigor)) return 50;
  if (/standard|regular/.test(rigor)) return 35;
  return 50;
};

const getStudentCountry = (profile: any): string | null => {
  const raw =
    profile?.country ||
    profile?.geographicLocation ||
    profile?.geographic_location ||
    null;
  if (!raw) return null;
  return String(raw).trim() || null;
};

const sameCountry = (studentCountry: string | null, uniCountry: string): boolean => {
  if (!studentCountry) return false;
  const a = studentCountry.toLowerCase();
  const b = uniCountry.toLowerCase();
  return a === b || a.includes(b) || b.includes(a);
};

// ──────────────────────────────────────────────────────────────────
// FACTOR SCORERS
// ──────────────────────────────────────────────────────────────────

function scoreAcademics(studentGPA: number | null, uniMedianGPA: number) {
  if (studentGPA == null) return { score: 0, studentValue: "—", uniValue: uniMedianGPA.toFixed(2), missing: true };
  const diff = studentGPA - uniMedianGPA;
  const score = Math.max(0, Math.min(100, Math.round(75 + diff * 62.5)));
  return { score, studentValue: studentGPA.toFixed(2), uniValue: uniMedianGPA.toFixed(2), missing: false };
}

function scoreTesting(
  sat: number | null,
  act: number | null,
  uniSAT: number,
  uniACT: number,
  testPolicy: string,
) {
  if (testPolicy === "blind") {
    return { score: 70, studentValue: "Test-blind school", uniValue: "Not used", missing: false };
  }
  if (sat == null && act == null) {
    if (testPolicy === "optional" || testPolicy === "flexible") {
      return { score: 65, studentValue: "Not submitted", uniValue: `~${uniSAT} SAT median`, missing: false };
    }
    return { score: 0, studentValue: "—", uniValue: `${uniSAT} SAT`, missing: true };
  }
  if (sat != null) {
    const diff = sat - uniSAT;
    const score = Math.max(0, Math.min(100, Math.round(75 + diff / 4)));
    return { score, studentValue: `SAT ${sat}`, uniValue: `SAT ~${uniSAT}`, missing: false };
  }
  const diff = (act as number) - uniACT;
  const score = Math.max(0, Math.min(100, Math.round(75 + diff * 6)));
  return { score, studentValue: `ACT ${act}`, uniValue: `ACT ~${uniACT}`, missing: false };
}

function scoreRigor(profile: any) {
  const s = rigorScore(profile);
  const rigor = String(profile?.course_rigor || profile?.courseRigor || "Standard");
  return { score: s, studentValue: rigor.slice(0, 60), uniValue: "High rigor preferred" };
}

function scoreECs(profile: any) {
  const ecCount = countECs(profile?.extracurriculars);
  const honors = String(profile?.honors_awards || profile?.honorsAwards || "").trim();
  const research = String(profile?.research_experience || profile?.researchExperience || "").trim();
  const work = String(profile?.work_experience || profile?.workExperience || "").trim();
  const volunteer = String(profile?.volunteer_hours || profile?.volunteerHours || "").trim();

  let score = 0;
  if (ecCount >= 6) score += 50;
  else if (ecCount >= 4) score += 40;
  else if (ecCount >= 2) score += 28;
  else if (ecCount >= 1) score += 15;

  if (honors) score += 15;
  if (research) score += 15;
  if (work) score += 10;
  if (volunteer) score += 10;
  score = Math.min(100, score);

  const summary = `${ecCount} activities${honors ? " + honors" : ""}${research ? " + research" : ""}`;
  return { score, studentValue: summary, uniValue: "Depth & impact valued" };
}

function scoreSelectivity(rate: number) {
  if (rate < 5) return 30;
  if (rate < 15) return 50;
  if (rate < 30) return 65;
  if (rate < 50) return 75;
  return 88;
}

/**
 * International context scorer.
 *  - Same-country applicant → neutral 75 (no factor effect)
 *  - Cross-border to need-blind-intl school → 70 (mild penalty)
 *  - Cross-border to need-aware-intl school → 50 (real penalty)
 *  - Cross-border generally → 60
 */
function scoreInternational(
  ctx: InternationalContext,
  uni: UniversityStats,
): { score: number; studentValue: string; uniValue: string } {
  if (!ctx.applies) {
    return {
      score: 75,
      studentValue: ctx.studentCountry || "Domestic",
      uniValue: `${uni.country} (domestic context)`,
    };
  }

  const explicitNeedAware = uni.admitProfile?.includes("need-aware-intl");
  if (ctx.needBlindIntl) {
    return {
      score: 70,
      studentValue: `Applying from ${ctx.studentCountry || "abroad"}`,
      uniValue: `${uni.country} school — need-blind for internationals`,
    };
  }
  if (explicitNeedAware) {
    return {
      score: 45,
      studentValue: `Applying from ${ctx.studentCountry || "abroad"}`,
      uniValue: `${uni.country} school — need-aware for internationals`,
    };
  }
  // Generic cross-border
  return {
    score: 58,
    studentValue: `Applying from ${ctx.studentCountry || "abroad"}`,
    uniValue: `${uni.country} school — international applicant pool`,
  };
}

// ──────────────────────────────────────────────────────────────────
// CORE: computeAlignment
// ──────────────────────────────────────────────────────────────────

export function computeAlignment(profile: any, uni: UniversityStats): AlignmentResult {
  const studentGPA = parseGPA(profile?.gpa);
  const studentSAT = parseSAT(profile?.test_scores || profile?.testScores);
  const studentACT = parseACT(profile?.test_scores || profile?.testScores);

  const studentCountry = getStudentCountry(profile);
  const isCrossBorder = !!studentCountry && !sameCountry(studentCountry, uni.country);

  // Build international context
  const intlCtx: InternationalContext = {
    applies: isCrossBorder,
    studentCountry,
    uniCountry: uni.country,
    overallRate: uni.acceptanceRate,
    intlRate: uni.intlAcceptanceRate ?? null,
    isEstimate:
      isCrossBorder && (uni.intlAcceptanceRate == null || uni.intlAcceptanceRate <= 0),
    effectiveRate:
      isCrossBorder && uni.intlAcceptanceRate != null && uni.intlAcceptanceRate > 0
        ? uni.intlAcceptanceRate
        : isCrossBorder
        ? Math.max(0.5, uni.acceptanceRate * 0.75) // documented adjustment when intl rate unknown
        : uni.acceptanceRate,
    needBlindIntl: !!uni.financialAid?.needBlindIntl,
  };

  const trace: TraceStep[] = [];

  const academics = scoreAcademics(studentGPA, uni.medianGPA);
  trace.push({
    label: "Academics",
    detail: `Your GPA ${academics.studentValue} vs ${uni.name} median admit ${academics.uniValue}`,
    value: `${academics.score}/100 × ${WEIGHTS.academics}% = ${((academics.score * WEIGHTS.academics) / 100).toFixed(1)} pts`,
  });

  const testing = scoreTesting(
    studentSAT,
    studentACT,
    uni.medianSAT,
    uni.medianACT,
    uni.applicationRequirements.testPolicy,
  );
  trace.push({
    label: "Testing",
    detail: `${testing.studentValue} vs ${testing.uniValue} (policy: ${uni.applicationRequirements.testPolicy})`,
    value: `${testing.score}/100 × ${WEIGHTS.testing}% = ${((testing.score * WEIGHTS.testing) / 100).toFixed(1)} pts`,
  });

  const rigor = scoreRigor(profile);
  trace.push({
    label: "Course Rigor",
    detail: `Your: ${rigor.studentValue} — ${uni.name} expectations: ${rigor.uniValue}`,
    value: `${rigor.score}/100 × ${WEIGHTS.rigor}% = ${((rigor.score * WEIGHTS.rigor) / 100).toFixed(1)} pts`,
  });

  const ecs = scoreECs(profile);
  trace.push({
    label: "Extracurriculars",
    detail: `${ecs.studentValue} — ${ecs.uniValue}`,
    value: `${ecs.score}/100 × ${WEIGHTS.extracurriculars}% = ${((ecs.score * WEIGHTS.extracurriculars) / 100).toFixed(1)} pts`,
  });

  const selectivityScore = scoreSelectivity(intlCtx.effectiveRate);
  trace.push({
    label: "Selectivity baseline",
    detail: isCrossBorder
      ? `${uni.name} admits ~${intlCtx.effectiveRate.toFixed(1)}% of international applicants${intlCtx.isEstimate ? " (estimated)" : ""} vs ${uni.acceptanceRate}% overall`
      : `${uni.name} accepts ${uni.acceptanceRate}% of applicants`,
    value: `${selectivityScore}/100 × ${WEIGHTS.selectivity}% = ${((selectivityScore * WEIGHTS.selectivity) / 100).toFixed(1)} pts`,
  });

  const intl = scoreInternational(intlCtx, uni);
  trace.push({
    label: "International context",
    detail: `${intl.studentValue} vs ${intl.uniValue}`,
    value: `${intl.score}/100 × ${WEIGHTS.international}% = ${((intl.score * WEIGHTS.international) / 100).toFixed(1)} pts`,
  });

  const rawScore =
    (academics.score * WEIGHTS.academics +
      testing.score * WEIGHTS.testing +
      rigor.score * WEIGHTS.rigor +
      ecs.score * WEIGHTS.extracurriculars +
      selectivityScore * WEIGHTS.selectivity +
      intl.score * WEIGHTS.international) /
    100;

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));
  trace.push({
    label: "Final alignment",
    detail: "Sum of weighted contributions",
    value: `${score}/100`,
  });

  const range = {
    min: Math.max(0, score - RANGE_SPREAD),
    max: Math.min(100, score + RANGE_SPREAD),
  };

  const category: AlignmentCategory =
    score >= CATEGORY_THRESHOLDS.safe
      ? "Safe"
      : score >= CATEGORY_THRESHOLDS.match
      ? "Match"
      : score >= CATEGORY_THRESHOLDS.reach
      ? "Reach"
      : "Hard Reach";

  const factorBreakdown: FactorBreakdown[] = [
    {
      factor: "Academics",
      studentValue: academics.studentValue,
      universityValue: academics.uniValue,
      factorScore: academics.score,
      weight: WEIGHTS.academics,
      contribution: +((academics.score * WEIGHTS.academics) / 100).toFixed(1),
    },
    {
      factor: "Testing",
      studentValue: testing.studentValue,
      universityValue: testing.uniValue,
      factorScore: testing.score,
      weight: WEIGHTS.testing,
      contribution: +((testing.score * WEIGHTS.testing) / 100).toFixed(1),
    },
    {
      factor: "Course Rigor",
      studentValue: rigor.studentValue,
      universityValue: rigor.uniValue,
      factorScore: rigor.score,
      weight: WEIGHTS.rigor,
      contribution: +((rigor.score * WEIGHTS.rigor) / 100).toFixed(1),
    },
    {
      factor: "Extracurriculars",
      studentValue: ecs.studentValue,
      universityValue: ecs.uniValue,
      factorScore: ecs.score,
      weight: WEIGHTS.extracurriculars,
      contribution: +((ecs.score * WEIGHTS.extracurriculars) / 100).toFixed(1),
    },
    {
      factor: "Selectivity baseline",
      studentValue: "—",
      universityValue: isCrossBorder
        ? `${intlCtx.effectiveRate.toFixed(1)}% intl admit${intlCtx.isEstimate ? " (est.)" : ""} (${uni.acceptanceRate}% overall)`
        : `${uni.acceptanceRate}% admit rate`,
      factorScore: selectivityScore,
      weight: WEIGHTS.selectivity,
      contribution: +((selectivityScore * WEIGHTS.selectivity) / 100).toFixed(1),
    },
    {
      factor: "International context",
      studentValue: intl.studentValue,
      universityValue: intl.uniValue,
      factorScore: intl.score,
      weight: WEIGHTS.international,
      contribution: +((intl.score * WEIGHTS.international) / 100).toFixed(1),
    },
  ];

  // ── Per-uni priorities & ranked leverage points ──────────────────
  const priorities = getPriorities(uni.name);

  // Weight each factor's "gap" by uni-specific emphasis to find true leverage.
  const priorityWeight: Record<string, number> = {
    Academics: 1 + priorities.researchEmphasis * 0.3,
    Testing: 0.6 + priorities.testEmphasis * 0.8,
    "Course Rigor": 0.8 + priorities.researchEmphasis * 0.4,
    Extracurriculars: 0.6 + priorities.holisticEmphasis * 0.8,
    "Selectivity baseline": 0.4,
    "International context": isCrossBorder ? 0.7 : 0.0,
  };

  const leveragePoints: LeveragePoint[] = factorBreakdown
    .map((f) => {
      const gap = 100 - f.factorScore;                       // distance from perfect
      const weighted = gap * (priorityWeight[f.factor] || 0.5) * (f.weight / 100);
      return {
        factor: f.factor,
        leverageScore: Math.round(weighted * 10) / 10,
        description: `Your ${f.factor.toLowerCase()} (${f.studentValue}) vs ${uni.name} (${f.universityValue}).`,
      };
    })
    .filter((l) => l.factor !== "Selectivity baseline") // can't change selectivity
    .sort((a, b) => b.leverageScore - a.leverageScore)
    .slice(0, 3);

  // Simple 3-line explanation (default view)
  const simpleExplanation: string[] = [
    studentGPA != null
      ? `Academically, your ${studentGPA.toFixed(2)} GPA is ${studentGPA >= uni.medianGPA ? "at or above" : "below"} ${uni.name}'s median admit (${uni.medianGPA.toFixed(2)}).`
      : `Academic comparison limited — add your GPA to refine this estimate.`,
    `You match best on ${pickBestFactor(factorBreakdown).factor.toLowerCase()}; biggest leverage is ${leveragePoints[0]?.factor.toLowerCase() || "your activities"}.`,
    isCrossBorder
      ? `As an applicant from ${studentCountry}, the international admit rate (~${intlCtx.effectiveRate.toFixed(1)}%${intlCtx.isEstimate ? ", estimated" : ""}) places this in the ${category} band.`
      : `${uni.name} admits ${uni.acceptanceRate}% overall, placing this in the ${category} band.`,
  ];

  const oneLiner = buildOneLiner(category, factorBreakdown, uni, intlCtx);
  const narrativeAngle = inferAngle(uni);

  return {
    universityName: uni.name,
    country: uni.country,
    acceptanceRate: uni.acceptanceRate,
    effectiveAcceptanceRate: intlCtx.effectiveRate,
    internationalContext: intlCtx,
    score,
    range,
    category,
    oneLiner,
    simpleExplanation,
    factorBreakdown,
    traceLog: trace,
    narrativeAngle,
    leveragePoints,
    priorities,
    dataSourceUrl: uni.dataSourceUrl,
    dataYear: uni.dataYear,
  };
}

function pickBestFactor(fb: FactorBreakdown[]) {
  return [...fb].sort((a, b) => b.factorScore - a.factorScore)[0];
}

function selectivityLabel(rate: number) {
  if (rate < 5) return "extremely selective";
  if (rate < 15) return "highly selective";
  if (rate < 30) return "selective";
  if (rate < 50) return "moderately selective";
  return "broadly accessible";
}

function buildOneLiner(
  cat: AlignmentCategory,
  fb: FactorBreakdown[],
  uni: UniversityStats,
  ctx: InternationalContext,
) {
  const best = pickBestFactor(fb);
  const intlNote = ctx.applies
    ? ` (intl admit ~${ctx.effectiveRate.toFixed(1)}%${ctx.isEstimate ? ", estimated" : ""})`
    : "";
  switch (cat) {
    case "Safe":
      return `Your ${best.factor.toLowerCase()} aligns strongly with ${uni.name}'s admit data${intlNote}.`;
    case "Match":
      return `A solid alignment — your ${best.factor.toLowerCase()} maps well to ${uni.name}${intlNote}.`;
    case "Reach":
      return `A stretch — your ${best.factor.toLowerCase()} is competitive but other gaps remain${intlNote}.`;
    case "Hard Reach":
      return `Significant data gap vs ${uni.name}'s typical admit profile${intlNote}.`;
  }
}

function inferAngle(uni: UniversityStats): NarrativeAngle {
  const majors = uni.popularMajors.join(" ").toLowerCase();
  if (/computer|engineering|mathematics|physics|technical/.test(majors)) return "technical";
  if (/art|design|music|architecture/.test(majors)) return "creative";
  if (/economics|government|law|history|policy/.test(majors)) return "holistic";
  if (uni.acceptanceRate >= 50) return "accessibility";
  return "academic";
}

// ──────────────────────────────────────────────────────────────────
// SELECTION: percentile-based, transparent exclusions
// ──────────────────────────────────────────────────────────────────

export interface CandidatePool {
  eligible: UniversityStats[];
  ineligible: { name: string; reason: string }[];
}

export function selectCandidates(
  profile: any,
  pool: CandidatePool,
): SelectionResult {
  const scored = pool.eligible
    .map((u) => computeAlignment(profile, u))
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { included: [], notIncluded: pool.ineligible, topPick: null, topPickByCountry: {} };
  }

  // STRICT MATCH: only surface schools whose alignment is at least Reach-tier.
  // Anything below the Reach threshold is filtered out so we never show
  // a random low-fit university.
  const minScore = CATEGORY_THRESHOLDS.reach;
  const qualified = scored.filter((s) => s.score >= minScore);

  let included = qualified.slice(0, MAX_INCLUDED);
  if (included.length < MIN_INCLUDED) {
    // If too few qualify, top up with the next-best schools so the user still
    // sees the closest matches — but never below 20/100 (truly random).
    const topUp = scored.filter((s) => s.score >= 20 && !qualified.includes(s));
    included = [...qualified, ...topUp].slice(0, MIN_INCLUDED);
  }

  const includedSet = new Set(included.map((i) => i.universityName));
  const notIncluded = [
    ...pool.ineligible,
    ...scored
      .filter((s) => !includedSet.has(s.universityName))
      .map((s) => ({
        name: s.universityName,
        reason:
          s.score < minScore
            ? `Profile fit is below your Reach threshold (scored ${s.score}/100) — filtered to avoid random matches.`
            : `Below your top-tier alignment band (scored ${s.score}/100)`,
      })),
  ];

  // Top pick = highest scorer in eligible pool (even if filtered above is empty,
  // scored[0] is still the closest fit to the profile).
  const topPick: AlignmentResult = scored[0];

  const topPickByCountry: Record<string, AlignmentResult> = {};
  for (const s of scored) {
    const key = s.country;
    if (!topPickByCountry[key] || topPickByCountry[key].score < s.score) {
      topPickByCountry[key] = s;
    }
  }

  return { included, notIncluded, topPick, topPickByCountry };
}

// ──────────────────────────────────────────────────────────────────
// PROFILE HASHING — used to cache AI explanations
// ──────────────────────────────────────────────────────────────────

export function profileHash(profile: any): string {
  const fields = [
    profile?.gpa,
    profile?.test_scores || profile?.testScores,
    profile?.course_rigor || profile?.courseRigor,
    profile?.extracurriculars,
    profile?.honors_awards || profile?.honorsAwards,
    profile?.research_experience || profile?.researchExperience,
    profile?.volunteer_hours || profile?.volunteerHours,
    profile?.work_experience || profile?.workExperience,
    profile?.intended_major || profile?.intendedMajor,
    profile?.country || profile?.geographicLocation || "",
    Array.isArray(profile?.target_countries || profile?.preferredCountries)
      ? (profile?.target_countries || profile?.preferredCountries).join(",")
      : "",
  ];
  const s = fields.join("|");
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8);
}
