/**
 * Design-review screenshots.
 *
 *   npm run screens                 # captures /
 *   npm run screens -- design       # captures / and /design
 *   npm run screens -- "#products"  # captures the deck parked on a section
 *   SCREENS_PALETTE=1 npm run screens   # captures with the command palette open
 *
 * Every route is captured at 390, 768 and 1440 px in both themes, into ./.screens
 * (gitignored). These exist to be looked at and critiqued against the frontend-design
 * skill and BUILD_PLAN B13 — not to be diffed by a machine.
 *
 * Themes are driven two ways at once: the emulated prefers-color-scheme, and a
 * data-theme attribute set before first paint. Today only the media query does
 * anything; from Part 2 the attribute is what the theme provider uses, and this
 * script keeps working unchanged.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, ".screens");
const NEXT_BIN = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");
const PORT = Number(process.env.SCREENS_PORT ?? 4321);
const BASE_URL = `http://localhost:${PORT}`;

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const;

const THEMES = ["light", "dark"] as const;

/**
 * Routes are given without a leading slash. Git Bash rewrites a leading "/" into a
 * filesystem path before Node ever sees it, which used to surface as an unreadable
 * "cannot navigate to invalid URL" — so a mangled argument is caught and explained.
 */
function toRoute(argument: string): string {
  // "#products" captures the deck deep-linked to a section rather than a separate page.
  if (argument.startsWith("#")) return `/${argument}`;

  if (/^[A-Za-z]:[\/]/.test(argument)) {
    throw new Error(
      `"${argument}" is a filesystem path, not a route. Git Bash rewrites a leading "/". ` +
        `Pass routes without it (npm run screens -- design), or prefix the command with ` +
        `MSYS_NO_PATHCONV=1.`,
    );
  }
  const trimmed = argument.replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed === "" ? "/" : `/${trimmed}`;
}

// "/" is always captured; arguments add to it rather than replacing it.
const routes = [...new Set(["/", ...process.argv.slice(2).map(toRoute)])];

/**
 * Viewport-only by default, because the deck is designed one viewport at a time and a
 * full-page shot of it would be meaningless. Set SCREENS_FULL_PAGE=1 to capture whole
 * documents instead, which is what a long page like /design needs to be reviewed.
 */
const fullPage = process.env.SCREENS_FULL_PAGE === "1";

/** Opens the command palette before capturing, for reviewing it at every size. */
const openPalette = process.env.SCREENS_PALETTE === "1";

function slugOf(route: string): string {
  const [pathAndQuery, hash] = route.split("#");
  const [pathname, query] = pathAndQuery.split("?");
  const cleaned = pathname.replace(/^\/+|\/+$/g, "");
  const base = hash ? `deck-${hash}` : cleaned === "" ? "home" : cleaned.replace(/\//g, "-");

  /*
   * A deck route can carry state that is part of what is being photographed — the
   * Achievements filter, "/?hop=talk#achievements". It belongs in the file name, and
   * "?" and "=" are not legal in a Windows one.
   */
  return query ? `${base}-${query.replace(/[^a-zA-Z0-9]+/g, "-")}` : base;
}

function run(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [NEXT_BIN, ...args], {
      cwd: ROOT,
      stdio: "inherit",
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`next ${args.join(" ")} exited with ${code}`)),
    );
    child.on("error", reject);
  });
}

async function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {
      // Server not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Server did not come up at ${url} within ${timeoutMs}ms`);
}

async function main(): Promise<void> {
  /*
   * Always rebuild. The previous version built only when .next was missing, which meant
   * it silently photographed stale code after every edit — a screenshot that looks like
   * evidence and is not. SCREENS_SKIP_BUILD=1 opts out when nothing has changed.
   */
  if (process.env.SCREENS_SKIP_BUILD === "1") {
    if (!existsSync(path.join(ROOT, ".next", "BUILD_ID"))) {
      throw new Error("SCREENS_SKIP_BUILD is set but there is no build to screenshot.");
    }
  } else {
    await run(["build"]);
  }

  // Wiped every run, so a stale image can never be mistaken for the current design.
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  // Spawned as a direct node process rather than through npm: on Windows, killing an
  // npm wrapper leaves the real server orphaned and holding the port.
  const server: ChildProcess = spawn(
    process.execPath,
    [NEXT_BIN, "start", "--port", String(PORT)],
    {
      cwd: ROOT,
      stdio: "ignore",
    },
  );

  let captured = 0;
  try {
    await waitForServer(BASE_URL);
    const browser = await chromium.launch();

    try {
      for (const route of routes) {
        for (const viewport of VIEWPORTS) {
          for (const theme of THEMES) {
            const context = await browser.newContext({
              viewport,
              colorScheme: theme,
              deviceScaleFactor: 2,
              reducedMotion: "no-preference",
            });
            await context.addInitScript(`document.documentElement.dataset.theme = "${theme}";`);

            const page = await context.newPage();
            /*
             * `load`, not `networkidle`.
             *
             * networkidle waits for two seconds of no requests, which never arrives on a
             * page carrying a third-party widget: Turnstile's script keeps talking to
             * Cloudflare, so /#contact timed out rather than being photographed. Part 15
             * adds analytics, which would have broken it again.
             *
             * Nothing is lost by the change, because the wait that actually matters is
             * the one below — every animation finished, which is what separates the
             * designed state from a frame on the way to it.
             */
            const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: "load" });
            if (!response || !response.ok()) {
              throw new Error(`${route} returned ${response?.status() ?? "no response"}`);
            }

            // A hash route lands via a client-side scroll, so give the deck a moment to
            // settle on the section before capturing it mid-hop.
            if (route.includes("#")) await page.waitForTimeout(700);

            /*
             * Wait for every running animation to finish before the shutter opens.
             *
             * `networkidle` says the bytes have arrived, not that the page has settled.
             * The hero's entrance runs after hydration, and at 390 it was reliably still
             * in flight at capture time — producing a screenshot of a half-faded hero
             * that looked exactly like a contrast bug and was reviewed as one. A design
             * review photographs the designed state, never a frame on the way to it.
             */
            await page
              .waitForFunction(
                () =>
                  document.getAnimations().every(
                    (animation) =>
                      animation.playState === "finished" ||
                      animation.playState === "idle" ||
                      // The topology's packets never stop, and never will.
                      (animation as CSSAnimation).animationName === undefined,
                  ),
                undefined,
                { timeout: 5_000 },
              )
              .catch(() => {
                // An animation that genuinely never ends must not fail the capture.
              });
            await page.waitForTimeout(150);

            if (openPalette) {
              await page.keyboard.press("Control+k");
              // The palette is loaded on first open, so wait for it rather than guessing.
              await page.waitForSelector("[cmdk-input]", { timeout: 15_000 });
              await page.waitForTimeout(300);
            }

            const suffix = openPalette ? "-palette" : "";
            const file = path.join(
              OUT_DIR,
              `${slugOf(route)}${suffix}__${viewport.width}__${theme}.png`,
            );
            await page.screenshot({ path: file, fullPage });
            await context.close();
            captured += 1;
            console.log(`  ${path.relative(ROOT, file)}`);
          }
        }
      }
    } finally {
      await browser.close();
    }
  } finally {
    server.kill();
  }

  console.log(`\n${captured} screenshots in .screens/ — open them and look before reporting done.`);
}

await main();
