import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Products (B2 item 2): the deck section, the live reading, and the case study.
 *
 * These assert the promises rather than the fixture. CI has no database credentials, so
 * every test here has to hold both when there is content and when there is none — the
 * lesson Parts 6 and 7 each learned the hard way.
 */

async function ready(page: Page) {
  await expect(page).toHaveURL(/#/);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished" || animation.playState === "idle"),
  );
}

/** True when the database is reachable, so content-dependent checks can be skipped. */
async function hasProducts(page: Page) {
  return (await page.locator(".work-card").count()) > 0;
}

/**
 * Opens a case study, or reports that this environment has no content for it.
 *
 * Keyed on the HTTP status, not on whether an `h1` is present. With no database the page
 * is a genuine 404 — and the 404 page has an `h1` of its own, so the earlier check saw a
 * heading, decided there was content, and then waited thirty seconds for a button that
 * was never going to exist.
 */
async function openCaseStudy(page: Page, slug: string): Promise<boolean> {
  const response = await page.goto(`/products/${slug}`);
  return response?.status() === 200;
}

test("the products stop renders whatever the database holds", async ({ page }) => {
  await page.goto("/#products");
  await ready(page);

  const section = page.locator("#products");
  await expect(section.getByRole("heading", { name: "Products", level: 2 })).toBeInViewport();

  if (await hasProducts(page)) {
    // Every card is one link to its case study, and only one.
    const card = page.locator(".work-card").first();
    await expect(card.getByRole("link")).toHaveCount(1);
    await expect(card.getByRole("heading", { level: 3 })).toBeVisible();
  } else {
    await expect(section.getByText("Nothing here yet.")).toBeVisible();
  }
});

test("the status endpoint answers with a reading, or says why not", async ({ request }) => {
  const missing = await request.get("/api/status");
  expect(missing.status()).toBe(400);

  const unknown = await request.get("/api/status?slug=does-not-exist");
  expect(unknown.status()).toBe(404);

  const known = await request.get("/api/status?slug=rubric");
  if (known.status() === 404) return; // No database in this environment.

  expect(known.status()).toBe(200);
  const body = (await known.json()) as { ok: boolean; ms: number | null };
  expect(typeof body.ok).toBe("boolean");
  expect(body.ms === null || typeof body.ms === "number").toBe(true);
});

test("the live reading settles rather than staying on 'checking'", async ({ page }) => {
  await page.goto("/#products");
  await ready(page);
  if (!(await hasProducts(page))) test.skip();

  const status = page.locator(".live-status").first();
  await expect(status).toBeVisible();
  // Either answer is correct — what must not happen is a card stuck mid-request.
  await expect(status).toHaveAttribute("data-state", /up|down/, { timeout: 15_000 });
});

test("the filmstrip scrolls sideways without moving the deck", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#products");
  await ready(page);
  if (!(await hasProducts(page))) test.skip();

  // Scoped: Engineering uses the same strip, so an unscoped selector matches two.
  const strip = page.locator("#products .work-strip");
  const deckScroll = await page.locator(".deck").evaluate((element) => element.scrollTop);

  await strip.evaluate((element) => {
    element.scrollLeft = 200;
  });

  // The deck must not have moved. The two scrollers are on different axes and different
  // elements, and this is the assertion that they stay that way.
  expect(await page.locator(".deck").evaluate((element) => element.scrollTop)).toBe(deckScroll);
  await expect(page).toHaveURL(/#products$/);
});

test("a card opens its case study, and the page reads as one", async ({ page }) => {
  await page.goto("/#products");
  await ready(page);
  if (!(await hasProducts(page))) test.skip();

  await page.locator(".work-card").first().getByRole("link").click();
  await expect(page).toHaveURL(/\/products\/[a-z0-9-]+$/);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // A case study, not a card dump: the body has real sections.
  await expect(page.locator(".prose h2").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to products/ })).toBeVisible();
});

test("Copy link reports what it did, keeping its own name", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  if (!(await openCaseStudy(page, "rubric"))) test.skip();

  const button = page.getByRole("button", { name: "Copy link" });
  await button.click();
  await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("/products/rubric");

  // It goes back to its own name rather than staying stuck reporting.
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible({ timeout: 5_000 });
});

test("a projected figure is never shown without saying so", async ({ page }) => {
  if (!(await openCaseStudy(page, "rubric"))) test.skip();

  const metrics = page.locator(".detail__metrics");
  if ((await metrics.count()) === 0) test.skip();

  // The qualifier is a heading above the numbers, not a footnote that a layout could
  // drop. Rubric's figures are projections and must never read as measurements.
  // Scoped to the aside: the body has its own "Projected impact" heading, and matching
  // either would let the label beside the numbers disappear without failing anything.
  await expect(
    page.locator(".detail__aside").getByRole("heading", { name: /^(Projected|Measured)$/ }),
  ).toBeVisible();
});

test("an unknown product is a 404, not an empty page", async ({ page }) => {
  const response = await page.goto("/products/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("the products index lists them", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Products", level: 1 })).toBeVisible();
});

test("no serious accessibility violations on the section or the case study", async ({ page }) => {
  await page.goto("/#products");
  await ready(page);

  const onDeck = await new AxeBuilder({ page }).analyze();
  expect(
    onDeck.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);

  if (!(await openCaseStudy(page, "rubric"))) return;

  const onDetail = await new AxeBuilder({ page }).analyze();
  expect(
    onDetail.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);
});
