import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Part 16's sweeps: accessibility across every route in both themes, and the print
 * stylesheet.
 *
 * The per-section specs already run axe where they live. This is the pass that catches
 * what only shows up route-wide or theme-wide — a contrast pair that only fails on dark,
 * a landmark that only breaks on a page nobody wrote a spec for.
 */

const ROUTES = [
  "/",
  "/products",
  "/products/rubric",
  "/engineering",
  "/engineering/intelligent-street-light-system",
  "/this-does-not-exist",
  "/maintenance",
  "/design",
] as const;

const THEMES = ["light", "dark"] as const;

async function serious(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  return results.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.nodes.length}): ${v.help}`);
}

test.describe("accessibility, every route and both themes", () => {
  for (const route of ROUTES) {
    for (const theme of THEMES) {
      test(`${route} on ${theme}`, async ({ page }) => {
        await page.addInitScript(
          (value) => document.documentElement.setAttribute("data-theme", value),
          theme,
        );
        const response = await page.goto(route);
        if (response && response.status() >= 500) {
          test.skip(true, `${route} did not render in this environment.`);
        }
        await page.waitForLoadState("domcontentloaded");

        expect(await serious(page), `${route} on ${theme}`).toEqual([]);
      });
    }
  }
});

test.describe("zoom", () => {
  /*
   * 200% browser zoom, which B12 asks for, is the same thing as halving the CSS pixels
   * available: a 1440x1200 window at 200% gives the page 720x600 to lay out in. That is
   * what this emulates. It is not identical to real zoom — text scaling and pinch zoom
   * behave differently — but it catches what zoom usually breaks, which is a layout that
   * assumed it would always have room.
   */
  test.use({ viewport: { width: 720, height: 600 } });

  test("nothing overflows sideways at 200%", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const { documentWidth, viewport } = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(documentWidth).toBeLessThanOrEqual(viewport + 1);
  });

  test("a case study still reads at 200%", async ({ page }) => {
    const response = await page.goto("/products/rubric");
    if (response?.status() === 404) test.skip(true, "No products seeded in this environment.");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const { documentWidth, viewport } = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(documentWidth).toBeLessThanOrEqual(viewport + 1);
  });

  test("no serious accessibility violations at 200%", async ({ page }) => {
    await page.goto("/");
    expect(await serious(page)).toEqual([]);
  });
});

test.describe("print", () => {
  test("the deck prints every section, not the two it happens to be showing", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ media: "print" });
    /*
     * Emulating the media changes what CSS applies; it does not make the page think a
     * print has started. A real print — Ctrl+P, or Save as PDF — fires beforeprint, and
     * that is the signal the provider mounts on, so the test fires what the browser
     * fires. Every engine this site supports dispatches it.
     */
    await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));

    await expect
      .poll(async () =>
        page.evaluate(
          () =>
            [...document.querySelectorAll(".deck-section")].filter(
              (s) => (s.querySelector(".deck-section-body")?.children.length ?? 0) > 0,
            ).length,
        ),
      )
      .toBe(7);
  });

  test("the screen-only chrome is not on the paper", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ media: "print" });

    for (const selector of [".rail", ".skip-link"]) {
      const element = page.locator(selector).first();
      if ((await element.count()) === 0) continue;
      await expect(element).toBeHidden();
    }
  });

  test("the deck stops being a scroll container", async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ media: "print" });

    const deck = page.locator(".deck");
    await expect(deck).toHaveCSS("overflow-y", "visible");
    // A snapping container on paper would do nothing but constrain the layout.
    await expect(deck).toHaveCSS("scroll-snap-type", "none");
  });

  test("a link says where it goes, since paper cannot be clicked", async ({ page }) => {
    await page.goto("/products/rubric");
    await page.emulateMedia({ media: "print" });

    const shown = await page.evaluate(() => {
      const link = [...document.querySelectorAll('a[href^="http"]')][0];
      if (!link) return null;
      return getComputedStyle(link, "::after").content;
    });

    if (shown === null) test.skip(true, "No external links on this page in this environment.");
    expect(shown).toContain("http");
  });

  test("a case study prints without the site's chrome", async ({ page }) => {
    await page.goto("/products/rubric");
    await page.emulateMedia({ media: "print" });

    await expect(page.locator("main.detail")).toBeVisible();
    const nav = page.locator("header").first();
    if ((await nav.count()) > 0) await expect(nav).toBeHidden();
  });
});
