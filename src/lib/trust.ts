/**
 * Trust Engine — single source of truth for evidence labeling and confidence math.
 * Every recommendation/score surface should use these helpers so users see a
 * consistent "Verified vs Estimated" signal and matching confidence numbers.
 */

export type EvidenceLevel = "verified" | "estimated" | "inferred" | "unknown";

export interface EvidenceSource {
  /** Human-readable source name (e.g. "Common Data Set 2024", "Gemini 2.5"). */
  label: string;
  /** Optional canonical URL backing the claim. */
  url?: string;
  /** ISO year or freshness label (e.g. "2024", "live"). */
  year?: string | number;
}

export interface EvidenceDescriptor {
  level: EvidenceLevel;
  sources: EvidenceSource[];
  /** Short reason for the level (e.g. "Calibrated against 142 admits"). */
  reason?: string;
  /** Optional sample size when the evidence is statistical. */
  sampleSize?: number;
}

/**
 * Confidence in 0..100 derived from sample size using a smooth logistic curve.
 * 0 admits → 0, 30 admits → ~70, 100+ admits → ~90, 300+ → ~96.
 */
export function confidenceFromSampleSize(n: number | null | undefined): number {
  const k = Math.max(0, n ?? 0);
  if (k === 0) return 0;
  // Logistic: 100 * k / (k + 30)
  return Math.round((100 * k) / (k + 30));
}

/**
 * Confidence from a count of independent corroborating evidence pieces.
 * 1 source → 35, 2 → 55, 3 → 70, 4 → 80, 5+ → 88+.
 */
export function confidenceFromEvidenceCount(count: number): number {
  const c = Math.max(0, count);
  if (c === 0) return 0;
  return Math.min(95, Math.round(100 * (1 - Math.pow(0.65, c))));
}

/** Combine multiple confidence signals using complement-of-product. */
export function combineConfidence(...values: number[]): number {
  const vals = values.filter((v) => Number.isFinite(v) && v > 0);
  if (!vals.length) return 0;
  const product = vals.reduce((acc, v) => acc * (1 - v / 100), 1);
  return Math.round((1 - product) * 100);
}

export type ConfidenceTier = "low" | "medium" | "high";

export function tierFromConfidence(c: number): ConfidenceTier {
  if (c >= 75) return "high";
  if (c >= 45) return "medium";
  return "low";
}

export const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  verified: "Verified",
  estimated: "Estimated",
  inferred: "Inferred",
  unknown: "Unknown",
};

export const EVIDENCE_DESCRIPTION: Record<EvidenceLevel, string> = {
  verified: "Backed by a published, primary source.",
  estimated: "Computed from real outcomes with a meaningful sample.",
  inferred: "AI-derived from related signals — directional only.",
  unknown: "No supporting data available yet.",
};
