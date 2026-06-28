/**
 * calibration.ts — Pass 1 outcome-driven calibration LAYER (runtime wrapper).
 *
 * The pure math lives in `calibrationCore.ts` so it can be unit-tested
 * without the supabase client. This file adds the live-data plumbing:
 *  - load the active version via RPC
 *  - cache for 5 minutes
 *  - safe fallback to base scoring on any failure
 */

import { supabase } from "@/integrations/supabase/client";
import type { AlignmentResult } from "@/lib/matchEngine";
import {
  applyCalibrationSync,
  type CalibrationWeight,
  type CalibratedAlignment,
} from "@/lib/calibrationCore";

export {
  applyCalibrationSync,
  tierFromUni,
  regionFromCountry,
  normalizeMajor,
  MIN_SAMPLE,
  MAX_ABS_SHIFT_PTS,
} from "@/lib/calibrationCore";
export type {
  CalibrationWeight,
  CalibrationMeta,
  CalibratedAlignment,
} from "@/lib/calibrationCore";

const CACHE_TTL_MS = 5 * 60_000;

interface CalibrationCache {
  weights: CalibrationWeight[];
  version: number | null;
  loadedAt: number;
}

let cache: CalibrationCache | null = null;
let inflight: Promise<CalibrationCache> | null = null;

async function loadActiveCalibration(): Promise<CalibrationCache> {
  if (cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const { data, error } = await supabase.rpc("get_active_calibration" as any);
      if (error) throw error;
      const rows = (data ?? []) as CalibrationWeight[];
      const version = rows.length > 0 ? rows[0].version : null;
      cache = { weights: rows, version, loadedAt: Date.now() };
      return cache;
    } catch (e) {
      console.warn("[calibration] load failed; falling back to base scoring", e);
      cache = { weights: [], version: null, loadedAt: Date.now() };
      return cache;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function clearCalibrationCache() {
  cache = null;
}

export async function calibrateResults(
  results: AlignmentResult[],
  intendedMajor: string | null,
): Promise<CalibratedAlignment[]> {
  const c = await loadActiveCalibration();
  return results.map((r) => applyCalibrationSync(r, c.weights, c.version, intendedMajor));
}

export async function getActiveCalibrationVersion(): Promise<number | null> {
  const c = await loadActiveCalibration();
  return c.version;
}
