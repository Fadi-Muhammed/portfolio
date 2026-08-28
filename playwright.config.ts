import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

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
  webServer: {
    // CI builds in its own step, so it only needs to start. Locally, build first so
    // `npm run test:e2e` on a clean checkout can never test a stale or missing build.
    command: isCI ? "npm run start" : "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
