// Pass 1 — Outcome-Driven Calibration nightly recalibration job.
//
// Pulls match_outcomes (admit/reject/waitlist/deferred), groups by
// (tier × region × major) buckets (with wildcard fallbacks), and computes
// a clipped correction factor = observed_admit_rate / expected_admit_rate.
//
// Safety properties:
//   • New version row written per run — old versions kept for rollback.
//   • Correction factor clipped to [0.7, 1.3] so calibration can never
//     swing a probability by more than ±30%.
//   • Only buckets with sample_size >= MIN_SAMPLE_PER_BUCKET are marked
//     `applied = true`. Everything else falls back to base scoring.
//   • If total usable outcomes < MIN_TOTAL_OUTCOMES the run is logged as
//     `success` but no version is activated — the engine stays on base scoring.
//   • The active pointer is only flipped at the very end, after all rows
//     are inserted, so the UI never sees a half-written calibration.
//   • Every run logs avg/max shift + capped count so we can detect anomalies.
//
// Manual trigger (admin): POST /functions/v1/recalibrate-weights {"force": true}
// Nightly trigger: pg_cron → pg_net → this function.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MIN_SAMPLE_PER_BUCKET = 30;
const MIN_TOTAL_OUTCOMES = 30;
const CLIP_MIN = 0.7;
const CLIP_MAX = 1.3;

interface OutcomeRow {
  status: string;
  uni_tier: string | null;
  uni_region: string | null;
  intended_major: string | null;
  predicted_score: number | null;
  alignment_score: number | null;
}

// Maps a raw score (0-100) to an expected admit probability (0-1).
// Calibrated from public CDS data: linear floor + sigmoid-like top end.
function expectedAdmitRate(score: number): number {
  const s = Math.max(0, Math.min(100, score));
  if (s >= 70) return Math.min(0.55, 0.25 + (s - 70) * 0.01);
  if (s >= 50) return 0.10 + (s - 50) * 0.0075;       // 0.10 → 0.25
  if (s >= 30) return 0.04 + (s - 30) * 0.003;         // 0.04 → 0.10
  return Math.max(0.01, s * 0.0013);                    // 0.00 → 0.04
}

const ADMIT_STATUSES = new Set(["accepted"]);
const SCORED_STATUSES = new Set(["accepted", "rejected", "waitlisted", "deferred"]);

function clip(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

interface BucketAgg {
  tier: string | null;
  region: string | null;
  major: string | null;
  n: number;
  admits: number;
  expectedAdmitsSum: number;
  shiftSumPts: number;
  shiftMaxPts: number;
  capped: number;
}

function bucketKey(t: string | null, r: string | null, m: string | null) {
  return `${t ?? "*"}|${r ?? "*"}|${m ?? "*"}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Admin gate — this endpoint can rewrite calibration for all users.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const supaAuth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: u } = await supaAuth.auth.getUser();
  if (!u?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: isAdmin } = await supaAuth.rpc("is_admin" as any, { _user_id: u.user.id });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Admin only" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // Create a new version stamp & log row.
  const version = Date.now();
  const { data: runRow, error: runErr } = await supabase
    .from("calibration_runs")
    .insert({ version, status: "running" })
    .select("id")
    .single();

  if (runErr || !runRow) {
    return new Response(
      JSON.stringify({ error: "Could not create run log", detail: runErr?.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const runId = runRow.id;

  const finishRun = async (patch: Record<string, unknown>) => {
    await supabase
      .from("calibration_runs")
      .update({ ...patch, finished_at: new Date().toISOString() })
      .eq("id", runId);
  };

  try {
    // Pull all eligible outcomes (one DB call, capped at 50k for safety).
    const { data: outcomes, error: oErr } = await supabase
      .from("match_outcomes")
      .select("status,uni_tier,uni_region,intended_major,predicted_score,alignment_score")
      .in("status", Array.from(SCORED_STATUSES))
      .limit(50000);

    if (oErr) throw oErr;
    const rows = (outcomes ?? []) as OutcomeRow[];

    if (rows.length < MIN_TOTAL_OUTCOMES) {
      await finishRun({
        status: "success",
        total_outcomes: rows.length,
        buckets_evaluated: 0,
        buckets_applied: 0,
        avg_shift_pts: 0,
        max_shift_pts: 0,
        capped_count: 0,
        notes: `insufficient_data: ${rows.length} < ${MIN_TOTAL_OUTCOMES} — engine stays on base scoring`,
      });
      return new Response(
        JSON.stringify({
          version,
          activated: false,
          reason: "insufficient_data",
          total_outcomes: rows.length,
          min_required: MIN_TOTAL_OUTCOMES,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Aggregate at multiple bucket granularities so we always have a fallback:
    //   1. (tier, region, major) — most specific
    //   2. (tier, region, *)
    //   3. (tier, *, *)
    //   4. (*, region, *)
    //   5. (*, *, *) — global fallback
    const buckets = new Map<string, BucketAgg>();
    const bump = (t: string | null, r: string | null, m: string | null, row: OutcomeRow) => {
      const key = bucketKey(t, r, m);
      let agg = buckets.get(key);
      if (!agg) {
        agg = {
          tier: t, region: r, major: m,
          n: 0, admits: 0, expectedAdmitsSum: 0,
          shiftSumPts: 0, shiftMaxPts: 0, capped: 0,
        };
        buckets.set(key, agg);
      }
      const score = row.predicted_score ?? row.alignment_score ?? 50;
      const exp = expectedAdmitRate(score);
      agg.n += 1;
      agg.expectedAdmitsSum += exp;
      if (ADMIT_STATUSES.has(row.status)) agg.admits += 1;
    };

    for (const row of rows) {
      bump(row.uni_tier, row.uni_region, row.intended_major, row);
      bump(row.uni_tier, row.uni_region, null, row);
      bump(row.uni_tier, null, null, row);
      bump(null, row.uni_region, null, row);
      bump(null, null, null, row);
    }

    // Compute correction factors and shift stats.
    const writes: Record<string, unknown>[] = [];
    let totalShiftPts = 0;
    let totalAppliedShifts = 0;
    let maxShiftPts = 0;
    let cappedCount = 0;
    let appliedBuckets = 0;

    for (const agg of buckets.values()) {
      const observedRate = agg.n > 0 ? agg.admits / agg.n : 0;
      const expectedRate = agg.n > 0 ? agg.expectedAdmitsSum / agg.n : 0;
      const rawFactor = expectedRate > 0.005 ? observedRate / expectedRate : 1.0;
      const clipped = clip(rawFactor, CLIP_MIN, CLIP_MAX);
      const wasCapped = clipped !== rawFactor;
      if (wasCapped) cappedCount += 1;

      const applied = agg.n >= MIN_SAMPLE_PER_BUCKET;
      if (applied) {
        appliedBuckets += 1;
        // Shift = how many percentage points the correction moves the
        // *expected admit rate* — proxy for UI impact.
        const shift = Math.abs((clipped - 1) * expectedRate * 100);
        totalShiftPts += shift;
        totalAppliedShifts += 1;
        if (shift > maxShiftPts) maxShiftPts = shift;
      }

      writes.push({
        version,
        tier: agg.tier,
        region: agg.region,
        major: agg.major,
        sample_size: agg.n,
        observed_admit_rate: Number(observedRate.toFixed(4)),
        expected_admit_rate: Number(expectedRate.toFixed(4)),
        correction_factor: Number(clipped.toFixed(3)),
        applied,
      });
    }

    // Safety guard: refuse to activate if average shift is extreme (>10pts)
    // — this would indicate a data anomaly. Run is logged, version is kept
    // for inspection, but active pointer is NOT flipped.
    const avgShift = totalAppliedShifts > 0 ? totalShiftPts / totalAppliedShifts : 0;
    const SAFETY_AVG_SHIFT_PTS = 10;

    // Write all weights for this version.
    if (writes.length > 0) {
      const { error: wErr } = await supabase.from("calibration_weights").insert(writes);
      if (wErr) throw wErr;
    }

    let activated = false;
    let activationNote = "";
    const force = await req.json().then((b) => !!b?.force).catch(() => false);

    if (appliedBuckets === 0) {
      activationNote = "no_bucket_met_min_sample";
    } else if (avgShift > SAFETY_AVG_SHIFT_PTS && !force) {
      activationNote = `safety_guard_tripped: avg_shift=${avgShift.toFixed(2)}pts > ${SAFETY_AVG_SHIFT_PTS}pts (use force=true to override)`;
    } else {
      const { error: aErr } = await supabase
        .from("calibration_active")
        .update({
          active_version: version,
          activated_at: new Date().toISOString(),
          note: force ? "force-activated" : "auto-activated",
        })
        .eq("id", true);
      if (aErr) throw aErr;
      activated = true;
      activationNote = force ? "force-activated" : "auto-activated";
    }

    await finishRun({
      status: "success",
      total_outcomes: rows.length,
      buckets_evaluated: buckets.size,
      buckets_applied: appliedBuckets,
      avg_shift_pts: Number(avgShift.toFixed(3)),
      max_shift_pts: Number(maxShiftPts.toFixed(3)),
      capped_count: cappedCount,
      notes: activationNote,
    });

    return new Response(
      JSON.stringify({
        version,
        activated,
        note: activationNote,
        total_outcomes: rows.length,
        buckets_evaluated: buckets.size,
        buckets_applied: appliedBuckets,
        avg_shift_pts: Number(avgShift.toFixed(3)),
        max_shift_pts: Number(maxShiftPts.toFixed(3)),
        capped_count: cappedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[recalibrate-weights] error:", msg);
    await finishRun({ status: "failed", error: msg });
    return new Response(
      JSON.stringify({ error: "recalibration_failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
