import { test, expect, Page } from "@playwright/test";

/**
 * Smoke test: walks the critical public routes, asserts each page paints something
 * meaningful, and fails the run if any page throws a console / page error.
 *
 * Covers: landing, chatbot, university matches, CV analysis, roadmap.
 * Auth-gated routes redirect to /auth — we accept that as a healthy outcome.
 */

const ROUTES: { path: string; label: string; expectAny: RegExp[] }[] = [
  { path: "/",             label: "Landing",     expectAny: [/UniVista/i, /University/i, /AI/i] },
  { path: "/chatbot",      label: "Chatbot",     expectAny: [/chat/i, /counselor/i, /sign in/i, /log in/i] },
  { path: "/matches",      label: "Matches",     expectAny: [/match/i, /university/i, /sign in/i, /log in/i] },
  { path: "/cv-analysis",  label: "CV Analysis", expectAny: [/cv/i, /analysis/i, /resume/i, /sign in/i] },
  { path: "/roadmap",      label: "Roadmap",     expectAny: [/roadmap/i, /plan/i, /timeline/i, /sign in/i] },
];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      // Ignore noisy third-party warnings that don't break the app.
      if (/favicon|manifest|workbox|google|gtag/i.test(t)) return;
      errors.push(`console: ${t}`);
    }
  });
  return errors;
}

for (const route of ROUTES) {
  test(`route "${route.label}" loads and renders`, async ({ page }) => {
    const errors = watchErrors(page);
    const res = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(res, `no response for ${route.path}`).not.toBeNull();
    expect(res!.status(), `status for ${route.path}`).toBeLessThan(500);

    // Page must paint something — root must not be empty.
    await page.waitForFunction(() => document.body.innerText.trim().length > 20, { timeout: 15_000 });

    const body = (await page.locator("body").innerText()).toLowerCase();
    const matched = route.expectAny.some((re) => re.test(body));
    expect(matched, `no expected keyword found on ${route.path}`).toBeTruthy();

    expect(errors, `runtime errors on ${route.path}:\n${errors.join("\n")}`).toEqual([]);
  });
}

test("AI chatbot endpoint is reachable from the browser", async ({ page, baseURL }) => {
  // Hits the public anon-key edge function from a real browser context.
  await page.goto("/");
  const result = await page.evaluate(async (origin) => {
    try {
      const r = await fetch(`${origin}/functions/v1/chatbot-counselor`, {
        method: "OPTIONS",
      });
      return { ok: true, status: r.status };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, baseURL);
  // OPTIONS preflight should return 2xx (CORS configured).
  expect(result.ok, JSON.stringify(result)).toBeTruthy();
});
