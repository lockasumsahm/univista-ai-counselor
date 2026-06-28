/**
 * Missing-Data Engine — Step 3 of Trust Engine.
 *
 * Detects which empty/weak profile fields would most lift the
 * recommendation's confidence if filled, and ranks them so the UI can
 * surface the highest-leverage prompts first.
 *
 * Pure function. No I/O, no React. Easy to unit-test.
 */

import {
  computeCompleteness,
  getFieldLabel,
  type FieldKey,
} from "./profileCompleteness";

/** Estimated confidence lift (0..100) for filling each missing field. */
const FIELD_LIFT: Record<FieldKey, number> = {
  gpa: 28,
  extracurriculars: 22,
  testScores: 18,
  courseRigor: 14,
  intendedMajor: 12,
  honorsAwards: 10,
  researchExperience: 9,
  preferredCountries: 8,
  workExperience: 6,
  volunteerHours: 5,
  personalContext: 5,
};

const FIELD_REASON: Record<FieldKey, string> = {
  gpa: "GPA is the single biggest signal in admit data — without it, every match is a guess.",
  extracurriculars: "Activities drive 12–25% of the score at holistic schools.",
  testScores: "Even at test-optional schools, a strong score lifts your range.",
  courseRigor: "Rigor (AP/IB/A-Levels) is how schools normalize GPA across schools.",
  intendedMajor: "Major-specific admit rates can differ 3–5× from overall rates.",
  honorsAwards: "National/international awards are a top differentiator at elite schools.",
  researchExperience: "Research shifts you toward 'academic spike' narratives.",
  preferredCountries: "Without targets we can't tailor international vs domestic context.",
  workExperience: "Paid work tells a different story than typical extracurriculars.",
  volunteerHours: "Sustained service strengthens character signal at most schools.",
  personalContext: "Context (first-gen, hardship, language) materially adjusts the model.",
};

/** Deep-link target for each field — used by UI to jump straight to the form. */
const FIELD_ROUTE: Record<FieldKey, string> = {
  gpa: "/dashboard/profile#gpa",
  extracurriculars: "/dashboard/profile#extracurriculars",
  testScores: "/dashboard/profile#testScores",
  courseRigor: "/dashboard/profile#courseRigor",
  intendedMajor: "/dashboard/profile#intendedMajor",
  honorsAwards: "/dashboard/profile#honorsAwards",
  researchExperience: "/dashboard/profile#researchExperience",
  preferredCountries: "/dashboard/profile#preferredCountries",
  workExperience: "/dashboard/profile#workExperience",
  volunteerHours: "/dashboard/profile#volunteerHours",
  personalContext: "/dashboard/profile#personalContext",
};

export interface MissingDataItem {
  key: FieldKey;
  label: string;
  reason: string;
  /** 0..100 — estimated confidence lift if filled. */
  estimatedLift: number;
  /** "required" = blocks scoring; "recommended" = improves it. */
  severity: "required" | "recommended";
  /** Anchor to jump to the field. */
  route: string;
}

export interface MissingDataReport {
  /** Ranked highest-lift first. */
  items: MissingDataItem[];
  /** Sum of estimated lifts across all gaps (capped at 100). */
  totalPotentialLift: number;
  /** Current completeness 0..100, mirrors profileCompleteness for convenience. */
  completeness: number;
  /** True when nothing is missing. */
  isComplete: boolean;
}

export function detectMissingData(profile: any): MissingDataReport {
  const completeness = computeCompleteness(profile);
  const missing: MissingDataItem[] = [];

  for (const key of completeness.missingRequired) {
    missing.push({
      key,
      label: getFieldLabel(key),
      reason: FIELD_REASON[key],
      estimatedLift: FIELD_LIFT[key] ?? 5,
      severity: "required",
      route: FIELD_ROUTE[key],
    });
  }
  for (const key of completeness.missingRecommended) {
    missing.push({
      key,
      label: getFieldLabel(key),
      reason: FIELD_REASON[key],
      estimatedLift: FIELD_LIFT[key] ?? 5,
      severity: "recommended",
      route: FIELD_ROUTE[key],
    });
  }

  missing.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "required" ? -1 : 1;
    return b.estimatedLift - a.estimatedLift;
  });

  const totalPotentialLift = Math.min(
    100,
    missing.reduce((acc, m) => acc + m.estimatedLift, 0),
  );

  return {
    items: missing,
    totalPotentialLift,
    completeness: completeness.percent,
    isComplete: missing.length === 0,
  };
}
