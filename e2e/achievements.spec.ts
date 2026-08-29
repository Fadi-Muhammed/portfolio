import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Achievements (B2 item 4): the traceroute timeline, the filters, and the URL that
 * carries them.
 *
 * As with Products and Engineering these assert promises rather than the fixture — CI has
 * no database credentials, so each test has to hold both with content and without it.
 */

async function ready(page: Page) {
  await expect(page).toHaveURL(/#/);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished" || animation.playState === "idle"),
  );
}

/** Opens the deck on Achievements, or reports that this environment has no entries. */
async function openTimeline(page: Page, query = ""): Promise<boolean> {
  await page.goto(`/${query}#achievements`);
  await ready(page);
  return (await page.locator("#achievements .hop").count()) > 0;
}

test("the route renders as numbered hops, newest first", async ({ page }) => {
  const section = page.locator("#achievements");

  if (!(await openTimeline(page))) {
    await expect(section.getByText("Nothing here yet.")).toBeVisible();
    return;
  }

  await expect(section.getByRole("heading", { name: "Achievements", level: 2 })).toBeInViewport();

  // Numbering is positional and starts at the top of the route.
  await expect(section.locator(".hop").first().locator(".hop__number")).toHaveText(/01$/);

  // Every hop is a real entry: an event name and a reading beside it.
  const first = section.locator(".hop").first();
  await expect(first.getByRole("heading", { level: 3 })).toBeVisible();
  await expect(first.locator(".hop__meta")).toBeVisible();

  // Newest first: the years down the column never increase.
  const years = await section.locator(".hop__meta p:first-child").allTextContents();
  const parsed = years.map((text) => Number(text.replace(/\D+/g, "").slice(-4))).filter(Boolean);
  expect(parsed).toEqual([...parsed].sort((a, b) => b - a));
});

test("a filter changes the route, renumbers it, and is carried by the URL", async ({ page }) => {
  if (!(await openTimeline(page))) test.skip();

  const section = page.locator("#achievements");
  const before = await section.locator(".hop").count();

  await section.getByRole("button", { name: "Talk", exact: true }).click();

  // The URL is the filter, so this view can be shared.
  await expect(page).toHaveURL(/[?&]hop=talk/);
  await expect(section.getByRole("button", { name: "Talk", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  const after = await section.locator(".hop").count();
  expect(after).toBeLessThanOrEqual(before);
  expect(after).toBeGreaterThan(0);

  // A filtered view is a different route, so it is numbered from its own first hop.
  await expect(section.locator(".hop").first().locator(".hop__number")).toHaveText(/01$/);
  await expect(section.locator(".hop__meta")).toContainText(/Talk/i);

  // And clearing it puts the whole route back.
  await section.getByRole("button", { name: "All", exact: true }).click();
  await expect(page).not.toHaveURL(/hop=/);
  expect(await section.locator(".hop").count()).toBe(before);
});

test("a shared filtered link lands filtered", async ({ page }) => {
  if (!(await openTimeline(page, "?hop=award"))) test.skip();

  const section = page.locator("#achievements");
  await expect(section.getByRole("button", { name: "Award", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(section.locator(".hop__meta")).toContainText(/Award/i);
});

test("a filter nobody typed correctly is not a filter", async ({ page }) => {
  // An unknown value falls back to the whole route rather than to an empty one.
  if (!(await openTimeline(page, "?hop=nonsense"))) test.skip();

  const section = page.locator("#achievements");
  await expect(section.getByRole("button", { name: "All", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the chips are operable from the keyboard", async ({ page }) => {
  if (!(await openTimeline(page))) test.skip();

  const section = page.locator("#achievements");
  const chip = section.getByRole("button", { name: "Competition", exact: true });
  await chip.focus();
  await expect(chip).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/[?&]hop=competition/);
  await expect(chip).toHaveAttribute("aria-pressed", "true");
});

test("a hop's evidence opens on request, and only on request", async ({ page }) => {
  if (!(await openTimeline(page))) test.skip();

  const toggle = page.locator("#achievements .hop__toggle").first();
  if ((await toggle.count()) === 0) test.skip();

  const panel = page.locator(`#${await toggle.getAttribute("aria-controls")}`);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toBeVisible();

  await toggle.click();
  await expect(panel).toBeHidden();
});

test("opening a hop near the bottom brings it into view, without moving the deck", async ({
  page,
}) => {
  if (!(await openTimeline(page))) test.skip();

  const toggles = await page.locator("#achievements .hop__toggle").all();
  const toggle = toggles.at(-1);
  if (!toggle) {
    test.skip();
    return;
  }

  const deckBefore = await page.evaluate(() => document.querySelector(".deck")?.scrollTop ?? 0);
  await toggle.click();

  const panel = page.locator(`#${await toggle.getAttribute("aria-controls")}`);
  await expect(panel).toBeInViewport();

  // Only the list's own scroll moved. Scrolling the deck here would fight its snap.
  const deckAfter = await page.evaluate(() => document.querySelector(".deck")?.scrollTop ?? 0);
  expect(deckAfter).toBe(deckBefore);
});

test("a hop's links say where they go and open outward safely", async ({ page }) => {
  if (!(await openTimeline(page))) test.skip();

  for (const toggle of await page.locator("#achievements .hop__toggle").all()) {
    await toggle.click();
  }

  for (const link of await page.locator("#achievements .hop__links a").all()) {
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    // Outward links open in a new tab and say so; internal ones stay in this one.
    if (href?.startsWith("http")) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("rel", /noreferrer/);
    }
  }
});

test("the invite line hops to contact rather than leaving the deck", async ({ page }) => {
  if (!(await openTimeline(page))) test.skip();

  const invite = page.getByRole("button", { name: /Invite me to speak/ });
  if ((await invite.count()) === 0) test.skip();

  await invite.click();
  await expect(page).toHaveURL(/#contact/);
});

test("the route scrolls inside the section rather than making it taller", async ({ page }) => {
  if (!(await openTimeline(page))) test.skip();

  // B3: content that does not fit is handled by an inner scroll region, never by a
  // section taller than the viewport, which would break the deck's snap.
  const list = page.locator("#achievements .hop-list");
  expect(await list.getAttribute("data-inner-scroll")).not.toBeNull();

  // And the marker does its job: with focus inside the list, the deck's own keyboard
  // paging leaves the arrow keys to the list rather than hopping to the next section.
  const inside = page.locator("#achievements .hop__toggle").first();
  if ((await inside.count()) > 0) {
    await inside.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page).toHaveURL(/#achievements/);
  }

  const fits = await page.evaluate(() => {
    const section = document.getElementById("achievements");
    const deck = document.querySelector(".deck");
    if (!section || !deck) return true;
    return section.getBoundingClientRect().height <= deck.clientHeight + 1;
  });
  expect(fits).toBe(true);
});

test("nothing prints under reduced motion, and nothing is left invisible", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();

  if (!(await openTimeline(page))) {
    await context.close();
    test.skip();
  }

  // The print sequence is never armed, so no hop can be caught mid-animation or,
  // worse, left at the opacity the sequence starts from.
  await expect(page.locator("#achievements .hop-list")).not.toHaveAttribute("data-printing", "");
  const opacities = await page
    .locator("#achievements .hop__print")
    .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).opacity));
  expect(opacities.every((value) => value === "1")).toBe(true);

  await context.close();
});

test("no serious accessibility violations on the section", async ({ page }) => {
  await page.goto("/#achievements");
  await ready(page);

  const results = await new AxeBuilder({ page }).include("#achievements").analyze();
  expect(
    results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);
});
