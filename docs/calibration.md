# Pass 1 — Outcome-Driven Calibration: Operations Runbook

## What it is
A versioned **calibration layer** that sits on top of the deterministic match
engine. It does **not** modify base scoring. It applies a clipped, per-bucket
correction factor (tier × region × major) learned from real admissions
outcomes saved by users via `OutcomeCapture`.

## Safety properties (designed-in)
| Guard | Where | Effect |
| --- | --- | --- |
| `N >= 30` per bucket | edge job | Bucket below threshold → `applied=false`, ignored |
| Total outcomes `N >= 30` | edge job | Below threshold → version logged but **not activated** |
| Correction factor clipped `[0.7, 1.3]` | edge job | Server-side ±30% cap on factor |
| Per-score clip `±8 pts` | client (`MAX_ABS_SHIFT_PTS`) | UI never shows a swing > 8 pts |
| Avg shift safety guard (10 pts) | edge job | Run logged but **not activated** unless `force=true` |
| Versioning | DB | Every run = new version; old rows retained |
| Atomic activation | edge job | Active pointer flipped **after** all weights inserted |
| Hard fallback on RPC failure | `calibration.ts` | Empty weights → base scoring everywhere |

## Files
- `supabase/functions/recalibrate-weights/index.ts` — nightly job
- `src/lib/calibrationCore.ts` — pure math (unit-tested)
- `src/lib/calibration.ts` — runtime wrapper (RPC + cache)
- `src/lib/__tests__/calibration.test.ts` — 13 deterministic tests (passing)
- Migrations: `calibration_runs`, `calibration_weights`, `calibration_active`,
  extra columns on `match_outcomes`, RPCs `get_active_calibration`,
  `rollback_calibration`.

## Schedule
- pg_cron `recalibrate-weights-nightly` runs 03:17 UTC daily.
- Manual trigger (admin): `POST /functions/v1/recalibrate-weights` with `{}`.
- Force-activate even when safety guard trips: body `{ "force": true }`.

## Inspect a run
```sql
SELECT version, status, total_outcomes, buckets_applied,
       avg_shift_pts, max_shift_pts, capped_count, notes, finished_at
FROM public.calibration_runs
ORDER BY started_at DESC
LIMIT 10;
```

## Before/after comparison for a candidate version
```sql
-- Pick a candidate version (e.g. most recent successful run)
WITH v AS (SELECT version FROM public.calibration_runs
           WHERE status='success' ORDER BY started_at DESC LIMIT 1)
SELECT w.tier, w.region, w.major, w.sample_size,
       w.observed_admit_rate, w.expected_admit_rate,
       w.correction_factor, w.applied
FROM public.calibration_weights w, v
WHERE w.version = v.version
ORDER BY w.applied DESC, w.sample_size DESC;
```

## Rollback
Instant — any admin user can call:
```sql
SELECT public.rollback_calibration(<previous_version>::bigint);
-- or to disable calibration entirely (return to pure base scoring):
SELECT public.rollback_calibration(NULL);
```
The next page load picks up the new active pointer (cache TTL = 5 min, or
call `clearCalibrationCache()` from the console).

## Current state (initial deployment)
- `match_outcomes` has 0 rows with `status IN (accepted|rejected|...)` →
  every recalibration run will log `insufficient_data` and the engine will
  stay on **base scoring only**. This is the intended zero-regression state.
- As users record outcomes, buckets cross the N>=30 threshold and calibration
  begins to apply for those buckets only.
- The "Calibrated · N outcomes" badge appears in `TopPickCard` / `ShowMath`
  only when an active version is in use for that university's bucket.

## Test
```bash
bunx vitest run src/lib/__tests__/calibration.test.ts
```
All 13 tests must pass before any code that touches `calibrationCore.ts`,
`calibration.ts`, or `recalibrate-weights/index.ts` is merged.
