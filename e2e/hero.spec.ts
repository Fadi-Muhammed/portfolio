import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The hero (B4, docs/DESIGN.md 11).
 *
 * What matters here is not that pixels are in place but that the promises hold: the
 * drawing is on screen before any JavaScript runs, every node is a real control by
 * mouse and by keyboard, the tagline is readable on a phone without scrolling, and
 * someone who asked for less motion gets a still page that still works.
 */

/** The topology has two layers; the live one replaces the static one once it loads. */
const live = '[data-topology="live"]';
const staticLayer = '[data-topology="static"]';

async function ready(page: Page) {
  await expect(page).toHaveURL(/#/);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished" || animation.playState === "idle"),
  );
}

test("draws the topology on the server, before any JavaScript runs", async ({ browser }) => {
  // The point of the static layer is the visitor who has not got the module yet — or
  // will never get it. With scripting off there is still a drawing, and its nodes are
  // still links that go somewhere.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");

  await expect(page.locator(`${staticLayer} svg`)).toBeVisible();
  await expect(page.locator(`${staticLayer} a`)).toHaveCount(6);
  await expect(page.locator(`${staticLayer} a[href="#contact"]`)).toHaveAttribute(
    "aria-label",
    "Route to Contact",
  );

  // The copy is server-rendered too: no blank hero while the database is fetched.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("but not lost");
  await context.close();
});

test("hands over to the live layer without leaving two copies of every link", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await expect(page.locator(live)).toBeVisible();
  // The static layer stays in the DOM but must be gone from the accessibility tree and
  // the tab order — otherwise every destination is announced and tabbed to twice.
  await expect(page.locator(staticLayer)).toBeHidden();
  await expect(page.getByRole("link", { name: "Route to Products" })).toHaveCount(1);
});

test("clicking a node routes the deck to that section", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.getByRole("link", { name: "Route to Achievements" }).click();

  // The packet travels before the deck hops (11.7), so this waits rather than asserting
  // immediately — and the hash is what proves the same hopTo everything else calls ran.
  await expect(page).toHaveURL(/#achievements$/);
  await expect(page.getByRole("heading", { name: "Achievements", level: 2 })).toBeInViewport();
});

test("a node can be reached and fired from the keyboard alone", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  const node = page.getByRole("link", { name: "Route to Contact" });
  await node.focus();
  await expect(node).toBeFocused();
  // Its label is hidden until hover or focus; focus alone has to reveal it.
  await expect(page.locator(`${live} a[href="#contact"] text`)).toHaveCSS("opacity", "1");

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contact$/);
});

test("under reduced motion the topology is still and the hop is immediate", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/#/);

  // Wait for the live layer before asserting anything about it. Without this the test
  // raced the lazy import: it clicked the hidden static layer instead, and its
  // no-packets assertion passed for the worst possible reason — there was no live layer
  // yet for a packet to be missing from.
  await expect(page.locator(live)).toBeVisible();
  await expect(page.locator(staticLayer)).toBeHidden();

  // No packets: the loop never starts rather than running at zero duration.
  await expect(page.locator(`${live} .hero-topology__packet`)).toHaveCount(0);

  // Still fully operable, and without the 480 ms packet in the way.
  await page.getByRole("link", { name: "Route to About" }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator(`${live} .hero-topology__packet`)).toHaveCount(0);
  await context.close();
});

test("shows the whole tagline above the fold on a phone", async ({ page }) => {
  // Part 7's hard mobile requirement. Measured rather than eyeballed: the last line of
  // the tagline has to sit inside a 390x844 viewport with nothing scrolled.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await ready(page);

  const tagline = page.getByRole("heading", { level: 1 });
  await expect(tagline).toBeInViewport({ ratio: 1 });

  const box = await tagline.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThan(844);
});

test("every node clears the 44 px hit target on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await ready(page);

  // B12. The glyph is drawn at about 13 px here; what a finger has to hit is the
  // invisible circle around it, which is a different number and the one that counts.
  for (const name of [
    "Products",
    "Engineering",
    "Achievements",
    "Featured in",
    "About",
    "Contact",
  ]) {
    const hit = page.locator(`${live} a`).filter({ has: page.getByText(name, { exact: true }) });
    const box = await hit.locator(".hero-topology__hit").first().boundingBox();
    expect(box, `hit target for ${name}`).not.toBeNull();
    expect(box!.width, `hit target width for ${name}`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `hit target height for ${name}`).toBeGreaterThanOrEqual(44);
  }
});

test("has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(serious.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
});
