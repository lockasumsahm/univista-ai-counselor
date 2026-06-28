/**
 * calibrationCore.ts — Pure, side-effect-free calibration math.
 *
 * Split out from `calibration.ts` so unit tests can import these helpers
 * without pulling the supabase client (and the browser globals it needs).
 *
 * NEVER add imports here that touch the network, supabase, or browser APIs.
 */

import type { AlignmentResult } from "@/lib/matchEngine";

export const MIN_SAMPLE = 30;
export const MAX_ABS_SHIFT_PTS = 8;

export interface CalibrationWeight {
  version: number;
  tier: string | null;
  region: string | null;
  major: string | null;
  sample_size: number;
  correction_factor: number;
}

export interface CalibrationMeta {
  applied: boolean;
  version: number | null;
  sampleSize: number;
  bucket: { tier: string | null; region: string | null; major: string | null } | null;
  baseScore: number;
  adjustedScore: number;
  deltaPts: number;
  cappedByGuard: boolean;
}

export interface CalibratedAlignment extends AlignmentResult {
  calibration: CalibrationMeta;
}

export function tierFromUni(uni: { acceptanceRate: number }): string {
  const r = uni.acceptanceRate;
  if (r < 10) return "elite";
  if (r < 25) return "highly_selective";
  if (r < 50) return "selective";
  return "accessible";
}

export function regionFromCountry(country: string): string {
  const c = country.toLowerCase();
  if (c.includes("usa") || c.includes("united states")) return "us";
  if (c.includes("uk") || c.includes("united kingdom") || c.includes("england") || c.includes("scotland")) return "uk";
  if (c.includes("canada")) return "canada";
  if (c.includes("germany") || c.includes("france") || c.includes("netherlands") || c.includes("switzerland") || c.includes("ireland")) return "eu";
  if (c.includes("singapore") || c.includes("hong kong") || c.includes("japan") || c.includes("china") || c.includes("korea")) return "asia";
  if (c.includes("australia") || c.includes("new zealand")) return "oceania";
  return "other";
}

export function normalizeMajor(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  if (!s) return null;
  if (/comput|software|cs\b|coding|ai|machine learning/.test(s)) return "computer_science";
  if (/engineer/.test(s)) return "engineering";
  if (/business|finance|econ/.test(s)) return "business";
  if (/biology|pre-?med|medicine|health/.test(s)) return "biology";
  if (/physics|math|chemistry/.test(s)) return "stem_pure";
  if (/art|design|music|architecture/.test(s)) return "arts";
  if (/law|polic|government|polit/.test(s)) return "social_science";
  if (/humanit|history|english|literature/.test(s)) return "humanities";
  return "other";
}

export function findBucket(
  weights: CalibrationWeight[],
  tier: string,
  region: string,
  major: string | null,
): CalibrationWeight | null {
  const tries: Array<[string | null, string | null, string | null]> = [
    [tier, region, major],
    [tier, region, null],
    [tier, null, null],
    [null, region, null],
    [null, null, null],
  ];
  for (const [t, r, m] of tries) {
    const hit = weights.find(
      (w) =>
        (w.tier ?? null) === t &&
        (w.region ?? null) === r &&
        (w.major ?? null) === m &&
        w.sample_size >= MIN_SAMPLE,
    );
    if (hit) return hit;
  }
  return null;
}

export function applyCalibrationSync(
  result: AlignmentResult,
  weights: CalibrationWeight[],
  version: number | null,
  intendedMajor: string | null,
): CalibratedAlignment {
  const tier = tierFromUni({ acceptanceRate: result.acceptanceRate });
  const region = regionFromCountry(result.country);
  const major = normalizeMajor(intendedMajor);
  const bucket = findBucket(weights, tier, region, major);
  const baseScore = result.score;

  if (!bucket || version == null) {
    return {
      ...result,
      calibration: {
        applied: false, version, sampleSize: 0, bucket: null,
        baseScore, adjustedScore: baseScore, deltaPts: 0, cappedByGuard: false,
      },
    };
  }

  const target = baseScore * bucket.correction_factor;
  let adjusted = Math.round(target);
  let cappedByGuard = false;
  const rawDelta = adjusted - baseScore;
  if (Math.abs(rawDelta) > MAX_ABS_SHIFT_PTS) {
    adjusted = baseScore + Math.sign(rawDelta) * MAX_ABS_SHIFT_PTS;
    cappedByGuard = true;
  }
  adjusted = Math.max(0, Math.min(100, adjusted));

  const spread = Math.max(1, result.range.max - result.score);
  const newRange = {
    min: Math.max(0, adjusted - spread),
    max: Math.min(100, adjusted + spread),
  };

  return {
    ...result,
    score: adjusted,
    range: newRange,
    calibration: {
      applied: true,
      version: bucket.version,
      sampleSize: bucket.sample_size,
      bucket: { tier: bucket.tier, region: bucket.region, major: bucket.major },
      baseScore,
      adjustedScore: adjusted,
      deltaPts: adjusted - baseScore,
      cappedByGuard,
    },
  };
}
