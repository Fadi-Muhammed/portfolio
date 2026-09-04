import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

// /debug/content only exists outside production, so checking it needs a dev server
// alongside the production build the rest of the suite runs against.
const DEV_PORT = Number(process.env.DEV_PORT ?? 3001);
export const devBaseURL = `http://localhost:${DEV_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  // In CI, the GitHub reporter annotates the run and the HTML reporter leaves a
  // report to download when something fails. Without the second one the upload
  // step has nothing to collect.
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // Chromium only for now. Section F requires Firefox and Safari, but on real devices
  // before launch (Part 16) — running three engines on every push buys nothing yet.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // CI builds in its own step, so it only needs to start. Locally, build first so
      // `npm run test:e2e` on a clean checkout can never test a stale or missing build.
      command: isCI ? "npm run start" : "npm run build && npm run start",
      env: {
        // The /design route is flag-gated and inlined at build time, so the suite that
        // tests it has to be built with the flag on.
        NEXT_PUBLIC_ENABLE_DESIGN_ROUTE: "true",
        /*
         * Cloudflare's published always-pass Turnstile keys, used even on a machine that
         * has real ones. The suite should exercise the form's own logic — validation, the
         * honeypot, the throttle, the states — not whether a challenge in a headless
         * browser can be solved. Real keys are covered by the manual end-to-end send.
         */
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
        TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
      },
      url: baseURL,
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
    {
      command: `npm run dev -- --port ${DEV_PORT}`,
      url: devBaseURL,
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
  ],
});
