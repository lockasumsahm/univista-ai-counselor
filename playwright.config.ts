import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for UniVista.AI end-to-end UI tests.
 * Run locally:
 *   npx playwright install --with-deps
 *   PLAYWRIGHT_BASE_URL=https://univista.lovable.app npx playwright test
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "https://univista.lovable.app",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile",   use: { ...devices["iPhone 13"] } },
  ],
});
