/**
 * Pass 3 — Major-specific admit rates layer tests.
 * Run with: bunx vitest run src/lib/__tests__/majorRates.test.ts
 */
import { describe, it, expect } from "vitest";
import { computeMajorAdjustment, type MajorRate } from "@/lib/majorRatesCore";

const row = (uni: string, major: string, admit: number, overall: number): MajorRate => ({
  university_name: uni,
  major_normalized: major,
  admit_rate: admit,
  overall_admit_rate: overall,
  data_year: 2024,
  source_url: "https://example.edu",
});

describe("majorRates: no-op fallback", () => {
  it("returns base score unchanged when no major declared", () => {
    const out = computeMajorAdjustment(70, "Stanford University", null, 4, [
      row("Stanford University", "computer_science", 0.03, 0.04),
    ]);
    expect(out.applied).toBe(false);
    expect(out.adjustedScore).toBe(70);
  });

  it("returns base score unchanged when no row for (uni, major)", () => {
    const out = computeMajorAdjustment(70, "Stanford University", "Computer Science", 4, []);
    expect(out.applied).toBe(false);
    expect(out.adjustedScore).toBe(70);
  });
});

describe("majorRates: penalty when major harder than overall", () => {
  it("drops the score for an impacted major (Berkeley EECS)", () => {
    // Berkeley overall 11.5%, EECS 4.5% → mult ~0.39 → clipped to 0.6 → weight 0.6 → score ~70 * (1 + (0.6-1)*0.6) = 70 * 0.76 = 53; guard caps at -6 → 64
    const out = computeMajorAdjustment(70, "University of California, Berkeley", "Computer Science", 11.5, [
      row("University of California, Berkeley", "computer_science", 0.045, 0.115),
    ]);
    expect(out.applied).toBe(true);
    expect(out.deltaPts).toBeLessThan(0);
    expect(out.adjustedScore).toBeGreaterThanOrEqual(64); // ±6 guard
  });
});

describe("majorRates: clipping & guards", () => {
  it("clips the per-major multiplier at 0.6 and 1.4", () => {
    // extreme ratio 0.1 → clipped to 0.6
    const hard = computeMajorAdjustment(80, "U", "computer_science", 50, [row("U", "computer_science", 0.005, 0.50)]);
    expect(hard.multiplier).toBe(0.6);
    // extreme ratio 5.0 → clipped to 1.4
    const easy = computeMajorAdjustment(40, "U", "computer_science", 5, [row("U", "computer_science", 0.25, 0.05)]);
    expect(easy.multiplier).toBe(1.4);
  });

  it("never moves a score by more than ±6 pts", () => {
    const out = computeMajorAdjustment(80, "U", "computer_science", 50, [row("U", "computer_science", 0.005, 0.50)]);
    expect(Math.abs(out.deltaPts)).toBeLessThanOrEqual(6);
    expect(out.cappedByGuard).toBe(true);
  });

  it("keeps score in [0,100]", () => {
    const hi = computeMajorAdjustment(99, "U", "computer_science", 5, [row("U", "computer_science", 0.25, 0.05)]);
    expect(hi.adjustedScore).toBeLessThanOrEqual(100);
    const lo = computeMajorAdjustment(3, "U", "computer_science", 50, [row("U", "computer_science", 0.001, 0.50)]);
    expect(lo.adjustedScore).toBeGreaterThanOrEqual(0);
  });
});

describe("majorRates: determinism", () => {
  it("same inputs → same output", () => {
    const rows = [row("U", "computer_science", 0.05, 0.10)];
    const a = computeMajorAdjustment(60, "U", "Computer Science", 10, rows);
    const b = computeMajorAdjustment(60, "U", "Computer Science", 10, rows);
    expect(a).toEqual(b);
  });
});
