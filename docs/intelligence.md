# UniVista — Production Calibration Stack (Passes 1-5)

Updated: 2026-06-20

## Layered scoring architecture

```
Raw profile
    │
    ▼
[Engine] selectCandidates()      ← src/lib/matchEngine.ts (deterministic, never mutated)
    │   base score 0..100
    ▼
[Pass 3] Major-rate adjustment   ← src/lib/majorRatesCore.ts (±6 pts max)
    │   ratio of per-major admit rate vs overall, clipped [0.6, 1.4], 60% weight
    ▼
[Pass 1] Outcome calibration     ← src/lib/calibrationCore.ts (±8 pts max)
    │   tier·region·major bucket, N≥30 minimum, clipped [0.7, 1.3]
    ▼
Final score + range
    │
    ▼
[Pass 4] ScoreJourney explainer  ← src/components/match/ScoreJourney.tsx
    │   shows each layer's contribution + safety caps
    ▼
UI (TopPickCard, ShowMath, OutcomeCapture)
```

### Hard safety properties
| Layer | Multiplier clip | Per-score guard | Falls back when |
| --- | :---: | :---: | --- |
| Major-rate (Pass 3) | [0.6, 1.4] | ±6 pts absolute | no row in `major_admit_rates` for (uni, major) |
| Calibration (Pass 1) | [0.7, 1.3] | ±8 pts absolute | no active version OR no bucket with N≥30 |

Worst-case combined shift: **±14 pts**. Engine output is otherwise returned unchanged.

## Semantic similarity (Pass 2)

`verified_admits` rows carry a 1536-dim embedding (Lovable AI `openai/text-embedding-3-small`). `match_verified_admits` RPC does pgvector cosine search. `verified-admits-match` edge function tries semantic first, falls back to legacy keyword scoring when embeddings aren't available.

Admin manual trigger to backfill embeddings on new rows:
```
POST /functions/v1/embed-verified-admits  { "limit": 200 }
```

## Tests (vitest)

```
bunx vitest run src/lib/__tests__/
```
- `calibration.test.ts` — 13 tests: classifiers, fallback, bucket specificity, ±8 guard, [0,100] clamp, monotonicity, determinism, range preservation.
- `majorRates.test.ts` — 7 tests: no-op fallback, penalty for impacted majors, clip bounds, ±6 guard, [0,100] clamp, determinism.

**Total: 20/20 passing.**

## Observability
- Every recalibration run logged to `calibration_runs` (avg_shift, max_shift, capped_count, buckets_applied).
- Edge functions log warnings (never errors) when AI gateway is rate-limited or out of credits, so the UI can degrade gracefully via existing `AIStatusNotice`.

## Rollback
```sql
SELECT public.rollback_calibration(<version>::bigint);   -- previous version
SELECT public.rollback_calibration(NULL);                -- disable calibration entirely
```

## Trust badges in UI
- **TopPickCard** — "Calibrated · N outcomes" badge when active.
- **ShowMath** — full base→adjusted callout with bucket and version.
- **ScoreJourney** — collapsible "How this score was built" showing every layer.

## Files added (Passes 1-5)
- `src/lib/calibrationCore.ts` · `src/lib/calibration.ts`
- `src/lib/majorRatesCore.ts` · `src/lib/majorRates.ts`
- `src/components/match/ScoreJourney.tsx`
- `supabase/functions/recalibrate-weights/index.ts`
- `supabase/functions/embed-verified-admits/index.ts`
- `src/lib/__tests__/calibration.test.ts` · `src/lib/__tests__/majorRates.test.ts`
- `docs/calibration.md` · `docs/intelligence.md`

## Files modified
- `src/hooks/useUniversityMatch.ts` — wires Major → Calibration layers in order.
- `src/components/match/{TopPickCard,ShowMath,OutcomeCapture}.tsx` — trust badges + denormalized writes.
- `supabase/functions/verified-admits-match/index.ts` — semantic-first lookup.
- `src/components/DarkModeToggle.tsx` — aria-label.
