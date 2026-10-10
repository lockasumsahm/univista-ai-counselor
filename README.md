# UniVista
### Explainable university recommendations and application planning

A student-facing platform exploring how deterministic matching, bounded score adjustments, and AI assistance can make university planning easier to understand.

[Website](https://univista.inkspirehq.live) · [Scoring architecture](docs/intelligence.md) · [Calibration runbook](docs/calibration.md) · [Evaluation code](src/lib/__tests__/)

## The problem

University choices involve academic fit, finances, program preferences, and uncertain admissions outcomes. UniVista brings profile analysis, matching, essay support, and application planning into one interface, with technical work focused on making recommendations inspectable.

## Technical focus

| Component | Approach | Inspect |
| :--- | :--- | :--- |
| Base matching | Deterministic candidate selection and scoring | [Match engine](src/lib/matchEngine.ts) |
| Major adjustment | Bounded adjustment for program-specific admissions context | [Adjustment core](src/lib/majorRatesCore.ts) |
| Outcome calibration | Versioned corrections with sample-size gates and capped shifts | [Calibration core](src/lib/calibrationCore.ts) |
| Similar-profile retrieval | Semantic lookup with a keyword fallback | [Retrieval function](supabase/functions/verified-admits-match/index.ts) |
| Explanation | Display how each scoring layer contributes | [Score journey](src/components/match/ScoreJourney.tsx) |

The [architecture notes](docs/intelligence.md) document the scoring order, caps, fallbacks, and rollback approach. The [calibration runbook](docs/calibration.md) explains when corrections can activate.

**Scores are decision-support estimates. They are not guarantees or independently validated probabilities of admission.** A calibration implementation does not establish that enough outcome data exists to activate it.

## Application areas

- Student profiles and university comparisons.
- AI counseling, document analysis, and essay feedback.
- Scholarship exploration and application planning.
- Admissions outcome capture and recommendation explanations.

These areas are represented in the source; deployed behavior depends on the configured database, edge functions, and external services.

## Stack

**React · TypeScript · Vite · Tailwind CSS · shadcn/ui**  
Supabase authentication, PostgreSQL, and edge functions; pgvector-related retrieval.

## Local development

```bash
git clone https://github.com/lockasumsahm/univista-ai-counselor.git
cd univista-ai-counselor
npm install
```

Create `.env.local` using your own Supabase project's public configuration:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

```bash
npm run dev
```

The frontend alone does not provision the backend. Review [database migrations](supabase/migrations/), [edge functions](supabase/functions/), and [function configuration](supabase/config.toml) before setting up a separate deployment. Configure private AI and service credentials on the backend; Vite-prefixed variables are exposed to the browser.

## Validation

```bash
npm run lint
npm run build
npx vitest run src/lib/__tests__/
```

The existing tests cover calibration and major-rate behavior, including bounded adjustments and fallback logic. Historical results are documented in the architecture notes; this documentation update does not claim a fresh application test run.

## Repository guide

| Path | Purpose |
| :--- | :--- |
| `src/pages/` | Application routes and student workflows |
| `src/components/` | Interface components and scoring explanations |
| `src/lib/` | Matching, calibration, and supporting logic |
| `supabase/functions/` | Server-side integrations |
| `supabase/migrations/` | Database schema changes |
| `docs/` | Architecture and operational notes |

## Ownership

**Abdullah Amir** · [GitHub](https://github.com/lockasumsahm)  
Copyright © 2026 Abdullah Amir. All rights reserved.
