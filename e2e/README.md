# UniVista.AI — End-to-End Test Suite

Two complementary layers validate the full app before every release.

## 1. Edge-function smoke tests (fast — seconds)

Hits the live deployed AI functions with minimal-but-valid payloads and asserts
each one either succeeds or degrades gracefully (never a 500).

Coverage: `chatbot-counselor`, `verified-admits-match`, `analyze-document` (CV),
`university-counselor` (roadmap).

```
deno test --allow-net --allow-env supabase/functions/_shared/e2e_smoke_test.ts
```

Credentials are loaded from the project `.env` (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`).

## 2. Playwright UI E2E (full browser flow)

Walks the critical public routes (Landing, Chatbot, Matches, CV Analysis,
Roadmap), confirms each one paints, and fails the run on any console/page
error. Also probes CORS on the chatbot edge function from a real browser.

```
npx playwright install --with-deps   # one-time
npx playwright test                   # against https://univista.lovable.app
# or point at any deploy:
PLAYWRIGHT_BASE_URL=https://univista.inkspirehq.live npx playwright test
```

Reports land in `playwright-report/`. Open with `npx playwright show-report`.

## Recommended pre-release ritual

1. Deploy edge functions.
2. Run the Deno smoke tests — fail fast on broken AI paths.
3. Run Playwright against the preview URL — fail on broken UI paths.
4. Only then publish.
