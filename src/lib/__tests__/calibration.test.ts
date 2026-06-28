/**
 * Pass 1 — Calibration layer determinism, monotonicity, and safety tests.
 * Run with: bunx vitest run src/lib/__tests__/calibration.test.ts
 *
 * Imports from `calibrationCore` (pure module) so this suite has no
 * dependency on the supabase client or browser globals.
 */
import { describe, it, expect } from "vitest";
import {
  applyCalibrationSync,
  tierFromUni,
  regionFromCountry,
  normalizeMajor,
  type CalibrationWeight,
} from "@/lib/calibrationCore";
import type { AlignmentResult } from "@/lib/matchEngine";

const fakeResult = (score: number, country = "USA", rate = 4): AlignmentResult => ({
  universityName: "Test U",
  country,
  acceptanceRate: rate,
  effectiveAcceptanceRate: rate,
  internationalContext: {
    applies: false, studentCountry: null, uniCountry: country,
    overallRate: rate, intlRate: null, isEstimate: false,
    effectiveRate: rate, needBlindIntl: false,
  },
  score,
  range: { min: Math.max(0, score - 5), max: Math.min(100, score + 5) },
  category: "Match",
  oneLiner: "",
  simpleExplanation: [],
  factorBreakdown: [],
  traceLog: [],
  narrativeAngle: "academic",
  leveragePoints: [],
  priorities: {} as any,
  dataSourceUrl: "",
  dataYear: 2024,
});

const w = (
  tier: string | null, region: string | null, major: string | null,
  factor: number, n: number,
): CalibrationWeight => ({ version: 1, tier, region, major, sample_size: n, correction_factor: factor });

describe("calibration: classifiers", () => {
  it("tiers by acceptance rate", () => {
    expect(tierFromUni({ acceptanceRate: 4 })).toBe("elite");
    expect(tierFromUni({ acceptanceRate: 18 })).toBe("highly_selective");
    expect(tierFromUni({ acceptanceRate: 35 })).toBe("selective");
    expect(tierFromUni({ acceptanceRate: 75 })).toBe("accessible");
  });
  it("regionizes countries", () => {
    expect(regionFromCountry("USA")).toBe("us");
    expect(regionFromCountry("United Kingdom")).toBe("uk");
    expect(regionFromCountry("Canada")).toBe("canada");
    expect(regionFromCountry("Mars")).toBe("other");
  });
  it("normalizes majors", () => {
    expect(normalizeMajor("Computer Science")).toBe("computer_science");
    expect(normalizeMajor("mechanical engineering")).toBe("engineering");
    expect(normalizeMajor(null)).toBe(null);
    expect(normalizeMajor("")).toBe(null);
  });
});

describe("calibration: fallback (no active version)", () => {
  it("returns base score unchanged when version is null", () => {
    const r = fakeResult(72);
    const out = applyCalibrationSync(r, [], null, null);
    expect(out.score).toBe(72);
    expect(out.calibration.applied).toBe(false);
    expect(out.calibration.deltaPts).toBe(0);
  });
  it("returns base score unchanged when no bucket matches", () => {
    const r = fakeResult(72);
    // sample_size below threshold → must not be applied
    const out = applyCalibrationSync(r, [w("elite", "us", null, 1.2, 5)], 1, null);
    expect(out.calibration.applied).toBe(false);
    expect(out.score).toBe(72);
  });
});

describe("calibration: bucket lookup specificity", () => {
  it("prefers most-specific bucket", () => {
    const r = fakeResult(60, "USA", 4);
    const weights = [
      w("elite", "us", "computer_science", 1.20, 50),
      w("elite", "us", null, 0.80, 100),
      w(null, null, null, 1.10, 1000),
    ];
    const out = applyCalibrationSync(r, weights, 1, "Computer Science");
    expect(out.calibration.applied).toBe(true);
    expect(out.calibration.bucket?.major).toBe("computer_science");
    // 60 * 1.20 = 72 (+12pts) — guard caps at +8 → 68
    expect(out.score).toBe(68);
    expect(out.calibration.cappedByGuard).toBe(true);
  });
  it("falls back to wildcard when specific bucket has too few samples", () => {
    const r = fakeResult(60, "USA", 4);
    const weights = [
      w("elite", "us", "computer_science", 1.20, 5),     // not applied
      w("elite", "us", null, 0.90, 50),                  // applied — used
      w(null, null, null, 1.30, 1000),
    ];
    const out = applyCalibrationSync(r, weights, 1, "Computer Science");
    expect(out.calibration.applied).toBe(true);
    expect(out.calibration.bucket?.major).toBe(null);
    // 60 * 0.90 = 54
    expect(out.score).toBe(54);
  });
});

describe("calibration: stability guards", () => {
  it("clips shift at ±8 absolute points (high boost)", () => {
    const r = fakeResult(50);
    // factor would imply 50*1.30=65 (+15pts) — must cap at +8 → 58
    const out = applyCalibrationSync(r, [w(null, null, null, 1.30, 100)], 1, null);
    expect(out.score).toBe(58);
    expect(out.calibration.cappedByGuard).toBe(true);
    expect(out.calibration.deltaPts).toBe(8);
  });
  it("clips shift at ±8 absolute points (penalty)", () => {
    const r = fakeResult(80);
    // factor 0.70 → 56 (-24pts) — must cap at -8 → 72
    const out = applyCalibrationSync(r, [w(null, null, null, 0.70, 100)], 1, null);
    expect(out.score).toBe(72);
    expect(out.calibration.cappedByGuard).toBe(true);
    expect(out.calibration.deltaPts).toBe(-8);
  });
  it("keeps score in [0, 100]", () => {
    const r1 = applyCalibrationSync(fakeResult(98), [w(null, null, null, 1.30, 100)], 1, null);
    expect(r1.score).toBeLessThanOrEqual(100);
    const r2 = applyCalibrationSync(fakeResult(2), [w(null, null, null, 0.70, 100)], 1, null);
    expect(r2.score).toBeGreaterThanOrEqual(0);
  });
  it("is monotonic in base score (higher in → higher out, same bucket)", () => {
    const weights = [w(null, null, null, 1.10, 100)];
    const lo = applyCalibrationSync(fakeResult(40), weights, 1, null);
    const hi = applyCalibrationSync(fakeResult(80), weights, 1, null);
    expect(hi.score).toBeGreaterThanOrEqual(lo.score);
  });
  it("is deterministic (same inputs → same output)", () => {
    const w1 = [w(null, null, null, 1.05, 100)];
    const a = applyCalibrationSync(fakeResult(65), w1, 1, null);
    const b = applyCalibrationSync(fakeResult(65), w1, 1, null);
    expect(a.score).toBe(b.score);
    expect(a.calibration).toEqual(b.calibration);
  });
});

describe("calibration: range preservation", () => {
  it("keeps the same spread around the calibrated score", () => {
    const r = fakeResult(60);                 // base range = 55..65 (spread 5)
    const out = applyCalibrationSync(r, [w(null, null, null, 1.10, 100)], 1, null);
    expect(out.score).toBe(66);
    expect(out.range.max - out.range.min).toBe(10);
    expect(out.range.min).toBe(61);
    expect(out.range.max).toBe(71);
  });
});
