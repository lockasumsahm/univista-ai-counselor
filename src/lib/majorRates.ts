/**
 * majorRates.ts — Pass 3 runtime wrapper (live DB fetch + cache).
 * Pure math lives in `majorRatesCore.ts`.
 *
 * AI fallback: when no row exists for (university, major), fire a single
 * call to the `estimate-major-rate` edge function (per session, per pair)
 * which uses Lovable AI to estimate and persists the result back to the
 * `major_admit_rates` table flagged data_source='ai_estimated'. The next
 * profile run then gets a cheap DB hit.
 */
import { supabase } from "@/integrations/supabase/client";
import { computeMajorAdjustment, type MajorRate, type MajorAdjustment } from "@/lib/majorRatesCore";
import { normalizeMajor } from "@/lib/calibrationCore";

export { computeMajorAdjustment } from "@/lib/majorRatesCore";
export type { MajorRate, MajorAdjustment } from "@/lib/majorRatesCore";

const CACHE_TTL_MS = 10 * 60_000;
const ESTIMATE_TIMEOUT_MS = 4000;

let cache: { rows: MajorRate[]; loadedAt: number } | null = null;
let inflight: Promise<MajorRate[]> | null = null;
const estimateInflight = new Map<string, Promise<MajorRate | null>>();

async function loadRates(force = false): Promise<MajorRate[]> {
  if (!force && cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) return cache.rows;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase
        .from("major_admit_rates" as any)
        .select("university_name,major_normalized,admit_rate,overall_admit_rate,data_year,source_url");
      if (error) throw error;
      cache = { rows: (data ?? []) as any as MajorRate[], loadedAt: Date.now() };
      return cache.rows;
    } catch (e) {
      console.warn("[majorRates] load failed; falling back", e);
      cache = { rows: [], loadedAt: Date.now() };
      return [];
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function hasRow(rows: MajorRate[], uniName: string, major: string): boolean {
  const t = uniName.toLowerCase().trim();
  return rows.some((r) => r.major_normalized === major && r.university_name.toLowerCase().trim() === t);
}

async function estimateOne(
  university: string,
  major: string,
  overallRatePct: number,
): Promise<MajorRate | null> {
  const key = `${university.toLowerCase()}|${major}`;
  if (estimateInflight.has(key)) return estimateInflight.get(key)!;
  const p = (async (): Promise<MajorRate | null> => {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), ESTIMATE_TIMEOUT_MS);
      const { data, error } = await supabase.functions.invoke("estimate-major-rate", {
        body: { university_name: university, major, overall_admit_rate: overallRatePct },
      });
      clearTimeout(timer);
      if (error || !data?.success) return null;
      const rate = Number(data.admit_rate);
      if (!Number.isFinite(rate)) return null;
      return {
        university_name: university,
        major_normalized: major,
        admit_rate: rate,
        overall_admit_rate: data.overall_admit_rate ?? overallRatePct / 100,
        data_year: new Date().getFullYear(),
        source_url: null,
      };
    } catch {
      return null;
    } finally {
      // Allow re-attempts in a later session if it failed
      setTimeout(() => estimateInflight.delete(key), 30_000);
    }
  })();
  estimateInflight.set(key, p);
  return p;
}

export async function applyMajorAdjustments<T extends {
  universityName: string;
  acceptanceRate: number;
  score: number;
  range: { min: number; max: number };
}>(
  results: T[],
  majorRaw: string | null | undefined,
): Promise<Array<T & { majorAdjustment: MajorAdjustment }>> {
  let rows = await loadRates();
  const major = normalizeMajor(majorRaw);

  // AI fallback: estimate missing (uni, major) pairs in parallel.
  if (major) {
    const missing = results.filter((r) => !hasRow(rows, r.universityName, major));
    if (missing.length > 0) {
      const estimates = await Promise.all(
        missing.map((r) => estimateOne(r.universityName, major, r.acceptanceRate)),
      );
      const fresh = estimates.filter((x): x is MajorRate => x !== null);
      if (fresh.length > 0) {
        rows = [...rows, ...fresh];
        if (cache) cache = { rows, loadedAt: cache.loadedAt };
      }
    }
  }

  return results.map((r) => {
    const adj = computeMajorAdjustment(r.score, r.universityName, majorRaw, r.acceptanceRate, rows);
    if (!adj.applied) return { ...r, majorAdjustment: adj };
    const spread = Math.max(1, r.range.max - r.score);
    return {
      ...r,
      score: adj.adjustedScore,
      range: {
        min: Math.max(0, adj.adjustedScore - spread),
        max: Math.min(100, adj.adjustedScore + spread),
      },
      majorAdjustment: adj,
    };
  });
}

export function clearMajorRatesCache() {
  cache = null;
}
