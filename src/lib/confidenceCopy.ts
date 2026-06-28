/**
 * confidenceCopy.ts — Outcome-framed copy generator.
 *
 * Pure helpers that turn deterministic engine numbers into belief-building
 * sentences. NO new metrics, NO invented numbers, NO false reassurance.
 *
 * Honesty rules:
 *  - If the user has 0 viable matches, surface the truthful "let's build a
 *    realistic list" framing — never fake optimism.
 *  - Aggregate claims (e.g. "faster than X% of similar profiles") require
 *    n ≥ 3 data points; otherwise we omit the claim.
 *  - For Hard Reach categories, do NOT say "you're within range".
 */

export type AlignmentCategoryLite = "Safe" | "Match" | "Reach" | "Hard Reach";

export interface MatchLite {
  name: string;
  category: AlignmentCategoryLite;
  /** 0–100 alignment score from the engine */
  score: number;
}

const REALISTIC_CATEGORIES: AlignmentCategoryLite[] = ["Safe", "Match", "Reach"];

/** How many universities currently sit in a "realistic" tier. */
export function realisticAdmitCount(matches: MatchLite[] | undefined | null): number {
  if (!matches?.length) return 0;
  return matches.filter((m) => REALISTIC_CATEGORIES.includes(m.category)).length;
}

/** Top-1-Move CTA subtitle. Returns null if we can't honestly promise an unlock. */
export function topMoveSubtitle(
  potentialUnlocks: number,
  fallback = "Doing this strengthens your strongest application.",
): string {
  if (potentialUnlocks > 0) {
    return `Doing this unlocks ${potentialUnlocks} more realistic admit${potentialUnlocks === 1 ? "" : "s"}.`;
  }
  return fallback;
}

/** Action Center header. */
export function actionCenterHeader(stepsCount: number): string {
  if (stepsCount <= 0) return "You're all caught up — keep your application sharp.";
  return `${stepsCount} step${stepsCount === 1 ? "" : "s"} to your strongest application.`;
}

/** Match-card "within range" badge — only honest for non-Hard-Reach schools. */
export function withinRangeBadge(category: AlignmentCategoryLite): string | null {
  if (category === "Hard Reach") return null;
  if (category === "Safe") return "You're a strong fit for this school.";
  if (category === "Match") return "You're within range for this school.";
  return "You're competitive — push your profile to close the gap.";
}

/** Dashboard "you're now competitive for N more universities" line. */
export function dashboardCompetitiveLine(
  prevRealistic: number,
  nowRealistic: number,
): string | null {
  const delta = nowRealistic - prevRealistic;
  if (delta <= 0) return null;
  return `You're now competitive for ${delta} more universit${delta === 1 ? "y" : "ies"}.`;
}

/** Country pathway: how many verified options the student qualifies for. */
export function countryPathwayQualifiedLine(qualifiedCount: number): string {
  if (qualifiedCount <= 0) return "Build your profile to unlock verified options here.";
  return `You qualify for ${qualifiedCount} verified option${qualifiedCount === 1 ? "" : "s"} here.`;
}

/**
 * Progress sparkline aggregate claim. Requires n ≥ 3 historical points,
 * otherwise returns null and the UI shows nothing extra.
 */
export function progressVsPeersLine(
  improvedFasterThanPercent: number | null | undefined,
  historyPoints: number,
): string | null {
  if (historyPoints < 3) return null;
  if (improvedFasterThanPercent == null || improvedFasterThanPercent <= 0) return null;
  const pct = Math.min(99, Math.max(1, Math.round(improvedFasterThanPercent)));
  return `You're improving faster than ${pct}% of similar profiles.`;
}

/**
 * Honest fallback when there are no realistic admits yet.
 * Used in the dashboard hero so we never lie.
 */
export function honestNoMatchesLine(): string {
  return "Let's build a realistic shortlist together — start by completing your profile.";
}
