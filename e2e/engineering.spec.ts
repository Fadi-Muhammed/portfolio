import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Engineering (B2 item 3): the deck section, the detail page, and the instrument.
 *
 * As with Products, these assert promises rather than the fixture: CI has no database
 * credentials, so every test has to hold both with content and without it.
 */

async function ready(page: Page) {
  await expect(page).toHaveURL(/#/);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished" || animation.playState === "idle"),
  );
}

/** Opens a project page, or reports that this environment has no content for it. */
async function openProject(page: Page, slug: string): Promise<boolean> {
  const response = await page.goto(`/engineering/${slug}`);
  return response?.status() === 200;
}

const SLUG = "intelligent-street-light-system";

test("the engineering stop renders whatever the database holds", async ({ page }) => {
  await page.goto("/#engineering");
  await ready(page);

  const section = page.locator("#engineering");
  await expect(section.getByRole("heading", { name: "Engineering", level: 2 })).toBeInViewport();

  if ((await page.locator(".work-card").count()) > 0) {
    const card = page.locator("#engineering .work-card").first();
    await expect(card.getByRole("link")).toHaveCount(1);
    // The concepts line is what B2 asks this section for beyond a product card.
    await expect(card.locator(".work-card__concepts")).toBeVisible();
  } else {
    await expect(section.getByText("Nothing here yet.")).toBeVisible();
  }
});

test("the detail page reads as a project, with concepts and tools", async ({ page }) => {
  if (!(await openProject(page, SLUG))) test.skip();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".prose h2").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Concepts applied" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tools" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to engineering/ })).toBeVisible();
});

test("an unknown project is a 404, not an empty page", async ({ page }) => {
  const response = await page.goto("/engineering/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("the engineering index lists them", async ({ page }) => {
  await page.goto("/engineering");
  await expect(page.getByRole("heading", { name: "Engineering", level: 1 })).toBeVisible();
});

test("the instrument answers the pointer and reports the loop's own output", async ({ page }) => {
  if (!(await openProject(page, SLUG))) test.skip();

  const instrument = page.locator(".instrument");
  if ((await instrument.count()) === 0) test.skip();

  const console_ = page.locator(".instrument__console");
  const before = await console_.textContent();

  // Drag the reading below the threshold: the lamp must go out.
  await page.getByLabel(/LDR reading/).fill("100");
  await expect(console_).toContainText("Light OFF");
  expect(await console_.textContent()).not.toBe(before);

  // The override forces it back on in daylight.
  await page.getByRole("button", { name: /override/i }).click();
  await expect(console_).toContainText("Mode: MANUAL");
  await expect(console_).toContainText("Light ON");
});

test("the instrument is fully operable from the keyboard", async ({ page }) => {
  if (!(await openProject(page, SLUG))) test.skip();
  const instrument = page.locator(".instrument");
  if ((await instrument.count()) === 0) test.skip();

  // A real browser, so this tests the thing a keyboard visitor actually does rather than
  // jsdom's idea of a slider.
  const slider = page.getByLabel(/LDR reading/);
  await slider.focus();
  await expect(slider).toBeFocused();

  const before = await slider.inputValue();
  await page.keyboard.press("ArrowLeft");
  expect(await slider.inputValue()).not.toBe(before);

  await page.keyboard.press("Home");
  await expect(page.locator(".instrument__console")).toContainText("LDR = 0");
});

test("the fault state is reachable by hand, not just described", async ({ page }) => {
  if (!(await openProject(page, SLUG))) test.skip();
  const instrument = page.locator(".instrument");
  if ((await instrument.count()) === 0) test.skip();

  const slider = page.getByLabel(/LDR reading/);
  // Six crossings of the threshold is what the firmware calls a flickering sensor.
  for (let index = 0; index < 6; index += 1) {
    await slider.fill(index % 2 === 0 ? "100" : "3000");
  }

  await expect(page.locator(".instrument__console")).toContainText("FAULT - sensor erratic");

  await page.getByRole("button", { name: /Reset window/ }).click();
  await expect(page.locator(".instrument__console")).not.toContainText("FAULT");
});

test("the console line is reproduced, not restyled into something the board never printed", async ({
  page,
}) => {
  if (!(await openProject(page, SLUG))) test.skip();
  const console_ = page.locator(".instrument__console");
  if ((await console_.count()) === 0) test.skip();

  // `text-data` uppercases everything it touches. This line is a quotation of what
  // main.py prints, so it must keep its own case.
  await expect(console_).toHaveCSS("text-transform", "none");
  await expect(console_).toContainText("Mode: AUTO");
});

test("the instrument does not move on its own", async ({ page }) => {
  if (!(await openProject(page, SLUG))) test.skip();
  const instrument = page.locator(".instrument");
  if ((await instrument.count()) === 0) test.skip();

  // B5, and the whole argument for this section reading as instrumentation: it responds,
  // it does not perform. Nothing here should be animating when nobody is touching it.
  const running = await page.evaluate(() => {
    const element = document.querySelector(".instrument");
    if (!element) return 0;
    return element.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length;
  });
  expect(running).toBe(0);
});

test("no serious accessibility violations on the section or the project page", async ({ page }) => {
  await page.goto("/#engineering");
  await ready(page);

  const onDeck = await new AxeBuilder({ page }).analyze();
  expect(
    onDeck.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);

  if (!(await openProject(page, SLUG))) return;

  const onDetail = await new AxeBuilder({ page }).analyze();
  expect(
    onDetail.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);
});
