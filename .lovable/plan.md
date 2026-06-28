## Goal
Make the AI layer bulletproof and faster, standardize config, add admin diagnostics, and grow the university dataset by 500+ (with 100 from the US).

## 1. Unified AI Request Layer (`supabase/functions/_shared/aiClient.ts`)
A single helper used by `university-counselor`, `university-checker`, `analyze-document`, `essay-coach`, `chatbot-counselor`.

- `callAI({ task, messages, schema?, signal? })` returns `{ content, model, latencyMs, requestId, attempts }`.
- **Task presets** (centralized temp / max_tokens / model order):
  - `profile_score` → primary `openai/gpt-5`, fallback `google/gemini-2.5-pro`, max 12k
  - `uni_matches` → primary `openai/gpt-5`, fallback `google/gemini-2.5-pro`
  - `uni_checker` → primary `openai/gpt-5`, fallback `google/gemini-2.5-pro`
  - `fit_matrix` → primary `openai/gpt-5-mini`, fallback `google/gemini-2.5-flash`
  - `chatbot` → primary `google/gemini-3-flash-preview`, fallback `openai/gpt-5-mini`
  - `essay` → primary `google/gemini-2.5-flash`, fallback `openai/gpt-5-mini`
  - `document` → primary `openai/gpt-5`, fallback `google/gemini-2.5-pro`
- **Automatic fallback** triggers on: 5xx, 402, 429 (after 1 backoff), empty `content`, JSON parse failure when `schema` provided, truncated JSON.
- **Retry** with exponential backoff (250 / 750 / 1500 ms), max 2 attempts per model, then switch model.
- **Logs** each attempt to new `ai_diagnostics` table (request_id, user_id, task, model, latency_ms, status, error, payload_valid, attempt_no).
- Standard JSON-extraction + truncation-recovery util (already partially in counselor — extracted here).

## 2. Edge functions migration
Refactor each function to:
- Build messages.
- Call `callAI({ task, messages, schema })`.
- Return `{ success, result, meta:{ model, latencyMs, requestId } }` so the client can show "Retried via Gemini" indicator.

## 3. Client error/retry UX
- New `<AIErrorState/>` component used by Profile Score, Uni Matches, FitMatrix, Uni Checker:
  - Shows: friendly message, "Try again" (re-run same request), "Request new run" (cache-bust hash), "Report issue" (dumps requestId).
  - Distinguishes `credits` (402), `rateLimit` (429), `timeout`, `validation`, `network`.
- `useUniversityMatch`, `useEssayCoach`, profile analysis hook → expose `requestId`, `modelUsed`, `attempts` and a `retry(force?)` action.
- Toasts include the request ID for support.

## 4. Admin Diagnostics Panel (`/admin/ai-diagnostics`)
- New tab in `AdminPage` (gated by `useIsAdmin`).
- Table from `ai_diagnostics` (last 200, filter by task / model / status / user).
- Columns: time, user, task, model, attempts, latency, status, payload_valid, error.
- Aggregate header: success rate / avg latency / fallback rate per task (24h).
- RLS: admin-only SELECT.

## 5. Database
Migration:
```sql
create table public.ai_diagnostics (
  id uuid primary key default gen_random_uuid(),
  request_id text not null,
  user_id uuid,
  task text not null,
  model text not null,
  attempt_no int not null default 1,
  status text not null,         -- ok | error | fallback | empty | invalid_json | rate_limit | credits
  http_status int,
  latency_ms int,
  payload_valid boolean,
  error text,
  created_at timestamptz default now()
);
alter table public.ai_diagnostics enable row level security;
create policy "admin read diagnostics" on public.ai_diagnostics
  for select using (public.is_admin(auth.uid()));
create index on public.ai_diagnostics (created_at desc);
create index on public.ai_diagnostics (task, status);
```

## 6. University dataset expansion (+500, incl. 100 US)
- Extend `src/lib/universityData.ts` with 500 new entries spanning:
  - **USA: 100** (top privates, top publics R1, strong LACs, regional flagships)
  - **UK: 50**, **Canada: 40**, **Australia: 30**, **Germany: 35**, **Netherlands: 20**, **France: 25**, **Ireland: 10**, **Switzerland: 10**, **Sweden/Denmark/Norway/Finland: 25**, **Italy/Spain/Portugal: 25**, **Singapore/HK/Japan/Korea: 35**, **UAE/Saudi: 10**, **India: 25**, **China: 25**, **LatAm: 20**, **Africa: 15**.
- Each entry keeps the existing schema (priorities, weights, regional context, narrative angle).
- Generated via a one-time script using the AI layer for narrative angles, hand-curated for ranks/admit rates.
- Update `buildCandidatePool` filters; ensure no duplicates with existing list.

## 7. Speed improvements
- Parallel fetch of fallback model when primary > 4s (hedged request) for `profile_score` and `uni_matches`.
- Persist last successful model per task in `localStorage` and try it first next time.
- Cache key includes profile hash + task version so identical requests hit DB cache instantly.

## Out of scope
- No changes to billing, auth, or RLS on existing tables.
- Pricing tiers remain decorative.

## Technical notes
- All edge funcs continue to validate JWT (existing two-client pattern).
- `ai_diagnostics` insert uses the service role from inside the edge function (fire-and-forget, never blocks user response).
- Fallback chain configurable via constant map in `_shared/aiClient.ts` so future model swaps are one-line edits.
- Banned-words sanitizer stays in `useUniversityMatch` (presentation concern).

## Deliverables
1. `_shared/aiClient.ts` + task config map
2. Refactored 5 edge functions
3. Migration for `ai_diagnostics`
4. `<AIErrorState/>` + hook updates
5. Admin diagnostics tab
6. +500 universities in `universityData.ts`
7. Hedged-request speedup for top 2 flows
