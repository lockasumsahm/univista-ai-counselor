/**
 * majorRatesCore.ts — pure math for the major-rate adjustment layer.
 * Split out so unit tests can import it without the supabase client.
 */
import { normalizeMajor } from "@/lib/calibrationCore";

export interface MajorRate {
  university_name: string;
  major_normalized: string;
  admit_rate: number;
  overall_admit_rate: number | null;
  data_year: number;
  source_url: string | null;
}

export interface MajorAdjustment {
  applied: boolean;
  multiplier: number;
  uniRate: number | null;
  overallRate: number | null;
  source: string | null;
  year: number | null;
  baseScore: number;
  adjustedScore: number;
  deltaPts: number;
  cappedByGuard: boolean;
}

export const MAJOR_MAX_ABS_SHIFT_PTS = 6;
export const MAJOR_WEIGHT = 0.6;
export const MAJOR_CLIP_MIN = 0.6;
export const MAJOR_CLIP_MAX = 1.4;

function findRate(rows: MajorRate[], uniName: string, major: string): MajorRate | null {
  const target = uniName.toLowerCase().trim();
  return rows.find(
    (r) =>
      r.major_normalized === major &&
      r.university_name.toLowerCase().trim() === target,
  ) ?? null;
}

export function computeMajorAdjustment(
  baseScore: number,
  uniName: string,
  majorRaw: string | null | undefined,
  uniOverallRate: number,
  rows: MajorRate[],
): MajorAdjustment {
  const major = normalizeMajor(majorRaw);
  if (!major) return blank(baseScore);
  const hit = findRate(rows, uniName, major);
  if (!hit) return blank(baseScore);

  const overall = hit.overall_admit_rate ?? (uniOverallRate / 100);
  if (!overall || overall <= 0) return blank(baseScore);

  const rawMult = hit.admit_rate / overall;
  const clipped = Math.max(MAJOR_CLIP_MIN, Math.min(MAJOR_CLIP_MAX, rawMult));

  let adjusted = Math.round(baseScore * (1 + (clipped - 1) * MAJOR_WEIGHT));
  let cappedByGuard = false;
  const rawDelta = adjusted - baseScore;
  if (Math.abs(rawDelta) > MAJOR_MAX_ABS_SHIFT_PTS) {
    adjusted = baseScore + Math.sign(rawDelta) * MAJOR_MAX_ABS_SHIFT_PTS;
    cappedByGuard = true;
  }
  adjusted = Math.max(0, Math.min(100, adjusted));

  return {
    applied: true,
    multiplier: Number(clipped.toFixed(3)),
    uniRate: hit.admit_rate,
    overallRate: overall,
    source: hit.source_url,
    year: hit.data_year,
    baseScore,
    adjustedScore: adjusted,
    deltaPts: adjusted - baseScore,
    cappedByGuard,
  };
}

function blank(baseScore: number): MajorAdjustment {
  return {
    applied: false, multiplier: 1, uniRate: null, overallRate: null,
    source: null, year: null, baseScore, adjustedScore: baseScore,
    deltaPts: 0, cappedByGuard: false,
  };
}
