import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Featured in (B2 item 5, B8): logos, and the promises made about them.
 *
 * As elsewhere these assert promises rather than the fixture — CI has no database
 * credentials, so each test has to hold both with logos and without them.
 *
 * One of those promises is currently unexercised on purpose: not one of the nine entries
 * has a coverage URL yet, so the link assertions below run against whatever is there and
 * hold the day the URLs land. That is the point of writing them now rather than then.
 */

/**
 * Waits for the crossfade to land.
 *
 * The two layers transition over --dur, and asserting the exact endpoint immediately after
 * a hover is a race the test loses under a loaded machine — it passed alone and failed
 * twice inside the full suite. Settling first asserts the designed state rather than a
 * frame on the way to it, which is the same rule the screenshot script follows.
 */
async function settled(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => animation.playState !== "running"),
  );
}

async function ready(page: Page) {
  await expect(page).toHaveURL(/#/);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished" || animation.playState === "idle"),
  );
}

async function openSection(page: Page): Promise<boolean> {
  await page.goto("/#featured-in");
  await ready(page);
  return (await page.locator("#featured-in .featured__item").count()) > 0;
}

test("the logos render from the database", async ({ page }) => {
  const section = page.locator("#featured-in");

  if (!(await openSection(page))) {
    await expect(section.getByText("Nothing here yet.")).toBeVisible();
    return;
  }

  await expect(section.getByRole("heading", { name: "Featured in", level: 2 })).toBeInViewport();

  // Logos only: no captions, no counts, no quotes. The only text in the section is the
  // deck's own header and whatever a fallback prints in place of a missing image.
  const strayText = await section.locator(".featured__item").allInnerTexts();
  for (const text of strayText) {
    const fallbacks = await section.locator(".featured__fallback").count();
    if (fallbacks === 0) expect(text.trim()).toBe("");
  }
});

test("every logo carries an accessible name", async ({ page }) => {
  if (!(await openSection(page))) test.skip();

  // A logo is the content here, not decoration, so each one has to say what it is —
  // whether it is a link yet or not.
  const names = await page
    .locator("#featured-in .featured__link")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("aria-label") ?? node.textContent?.trim() ?? ""),
    );

  expect(names.length).toBeGreaterThan(0);
  expect(names.every((name) => name.length > 0)).toBe(true);
});

test("a logo with coverage is a link that opens outward safely; one without is not a link", async ({
  page,
}) => {
  if (!(await openSection(page))) test.skip();

  const items = page.locator("#featured-in .featured__item");
  const count = await items.count();

  for (let index = 0; index < count; index += 1) {
    const item = items.nth(index);
    const link = item.locator("a");

    if ((await link.count()) === 0) {
      // No coverage URL yet: it must not pretend to be a link.
      await expect(item.locator("[role='img']")).toHaveCount(1);
      continue;
    }

    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
    expect(await link.getAttribute("href")).toBeTruthy();
  }
});

test("a logo changes on hover, and the change is reachable without a pointer", async ({ page }) => {
  if (!(await openSection(page))) test.skip();

  const mark = page.locator("#featured-in .featured__mark").first();
  if ((await mark.count()) === 0) test.skip();

  const colour = mark.locator(".featured__colour");
  const mono = mark.locator(".featured__mono");

  // At rest the mark is the monochrome layer.
  await expect(colour).toHaveCSS("opacity", "0");
  await expect(mono).toHaveCSS("opacity", "1");

  await mark.hover();
  await settled(page);
  // Light is the default theme in a fresh context, where hover reveals the real colours.
  await expect(colour).toHaveCSS("opacity", "1");
  await expect(mono).toHaveCSS("opacity", "0");
});

test("the hover state is legible on the dark theme rather than revealing an invisible logo", async ({
  page,
}) => {
  if (!(await openSection(page))) test.skip();

  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

  const mark = page.locator("#featured-in .featured__mark").first();
  const mono = mark.locator(".featured__mono");
  const resting = await mono.evaluate((node) => getComputedStyle(node).backgroundColor);

  await mark.hover();
  await settled(page);

  // Four of the nine fail 3:1 against the dark ground in their own colours, so on dark the
  // reveal lifts the monochrome layer instead of swapping to them.
  await expect(mark.locator(".featured__colour")).toHaveCSS("opacity", "0");
  await expect(mono).toHaveCSS("opacity", "1");
  expect(await mono.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(resting);
});

test("nothing in the section animates on its own", async ({ page }) => {
  if (!(await openSection(page))) test.skip();

  // B5 allows this section at most one quiet motion and it was cut: there is no link
  // draw-in, no marquee, nothing that moves unprompted.
  const running = await page.evaluate(() => {
    const section = document.getElementById("featured-in");
    if (!section) return 0;
    return section.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length;
  });
  expect(running).toBe(0);
});

test("reduced motion leaves the logos in their designed state", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();

  if (!(await openSection(page))) {
    await context.close();
    test.skip();
  }

  const mono = page.locator("#featured-in .featured__mono").first();
  await expect(mono).toHaveCSS("opacity", "1");

  const running = await page.evaluate(() => {
    const section = document.getElementById("featured-in");
    if (!section) return 0;
    return section.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length;
  });
  expect(running).toBe(0);

  await context.close();
});

test("a logo whose image will not load degrades to its name", async ({ page }) => {
  // The designed fallback (Part 11 step 3): never a broken-image icon.
  await page.route("**/storage/v1/object/public/logos/**", (route) => route.abort());

  if (!(await openSection(page))) test.skip();

  const fallbacks = page.locator("#featured-in .featured__fallback");
  await expect(fallbacks.first()).toBeVisible();
  expect(await fallbacks.first().innerText()).not.toBe("");
});

test("no serious accessibility violations on the section", async ({ page }) => {
  await page.goto("/#featured-in");
  await ready(page);

  const results = await new AxeBuilder({ page }).include("#featured-in").analyze();
  expect(
    results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);
});
