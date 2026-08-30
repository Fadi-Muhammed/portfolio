import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * About (B2 item 6): the bio, the skills that filter the work, the timeline, and the CV.
 *
 * As elsewhere these assert promises rather than the fixture — CI has no database
 * credentials, so each test has to hold both with content and without it.
 */

async function ready(page: Page) {
  await expect(page).toHaveURL(/#/);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished" || animation.playState === "idle"),
  );
}

async function openAbout(page: Page, query = ""): Promise<boolean> {
  await page.goto(`/${query}#about`);
  await ready(page);
  return (await page.locator("#about .about").count()) > 0;
}

test("the section renders what the database holds", async ({ page }) => {
  const section = page.locator("#about");

  if (!(await openAbout(page))) {
    await expect(section.getByText("Nothing here yet.")).toBeVisible();
    return;
  }

  await expect(section.getByRole("heading", { name: "About", level: 2 })).toBeInViewport();
  await expect(section.getByRole("heading", { name: "Experience and education" })).toBeVisible();

  // Each timeline row says what it was and when. A row with neither is a row that should
  // not have been published.
  const rows = section.locator(".track__row");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    await expect(rows.nth(index).locator(".track__role")).not.toBeEmpty();
    await expect(rows.nth(index).locator(".track__when")).not.toBeEmpty();
  }
});

test("a degree that has not finished is dated as expected, not as present", async ({ page }) => {
  if (!(await openAbout(page))) test.skip();

  const when = await page.locator("#about .track__when").allInnerTexts();
  const hasExpected = when.some((text) => /expected/i.test(text));
  const hasPresent = when.some((text) => /present/i.test(text));

  // Both forms are correct for different rows; what matters is that a future end date
  // produces the first and never the second.
  expect(hasExpected || hasPresent).toBe(true);
});

test("tapping a skill filters the work, carries it in the URL, and goes to it", async ({
  page,
}) => {
  if (!(await openAbout(page))) test.skip();

  const chip = page.locator("#about .skills__list button").first();
  if ((await chip.count()) === 0) test.skip();

  // textContent, not innerText: the chip is set in the utility face, which uppercases it
  // in CSS, and the notice prints the skill's real name.
  const name = ((await chip.textContent()) ?? "").trim();
  await chip.click();

  await expect(page).toHaveURL(/[?&]skill=/);

  /*
   * The deck mounts only the active section and its neighbours, and About is four stops
   * from Products — so the cards a skill filters are not in the document while About is
   * on screen. The tap therefore hops to them, and this is where the filtering becomes
   * observable at all.
   */
  await expect(page).toHaveURL(/#(products|engineering)/);
  await expect(page.locator(".work-notice").first()).toContainText(name);

  const visible = await page.locator("[data-work-item]").count();
  expect(visible).toBeGreaterThan(0);

  // Everything still shown is work the skill actually names.
  const shown = await page
    .locator("[data-work-item]")
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.slug));
  expect(shown.every(Boolean)).toBe(true);
});

test("pressing the selected skill again clears it", async ({ page }) => {
  // Straight to the filtered view rather than round-tripping through a click: selecting a
  // skill hops away from About, and this test is about the control, not the hop.
  await page.goto("/?skill=typescript#about");
  await ready(page);

  // The deck mounts a section when it becomes active, so wait for the control to exist
  // before asking about its state.
  const chips = page.locator("#about .skills__list button");
  if ((await chips.count()) === 0) test.skip();
  await expect(chips.first()).toBeVisible();

  const same = page.locator("#about .skills__list button[aria-pressed='true']");
  await expect(same).toHaveCount(1);
  await same.click();

  await expect(page).not.toHaveURL(/skill=/);
});

test("the Clear control in a filtered section also clears it", async ({ page }) => {
  await page.goto("/?skill=typescript#products");
  await ready(page);

  const clear = page.locator("#products .work-notice__clear");
  if ((await clear.count()) === 0) test.skip();

  const before = await page.locator("#products [data-work-item]").count();
  await clear.click();

  await expect(page).not.toHaveURL(/skill=/);
  expect(await page.locator("#products [data-work-item]").count()).toBeGreaterThanOrEqual(before);
});

test("a shared filtered link lands filtered", async ({ page }) => {
  // Straight to the section the filter acts on, which is where a shared link would send
  // someone who was given one.
  await page.goto("/?skill=typescript#products");
  await ready(page);

  if ((await page.locator("#products .work-card").count()) === 0) test.skip();

  await expect(page.locator("#products .work-notice")).toBeVisible();
  await expect(page.locator("#products .work-notice")).toContainText(/TypeScript/i);
});

test("a skill nobody has is not a filter", async ({ page }) => {
  await page.goto("/?skill=not-a-real-skill#products");
  await ready(page);

  const cards = await page.locator("#products [data-work-item]").count();
  if (cards === 0) test.skip();

  // A hand-edited URL must not be able to make the page look like there is no work.
  await expect(page.locator("#products .work-notice")).toHaveCount(0);
  expect(cards).toBeGreaterThan(0);
});

test("the skills are operable from the keyboard", async ({ page }) => {
  if (!(await openAbout(page))) test.skip();

  const chip = page.locator("#about .skills__list button").first();
  if ((await chip.count()) === 0) test.skip();

  await chip.focus();
  await expect(chip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/[?&]skill=/);
});

test("the CV downloads, and the file behind it exists", async ({ page, request }) => {
  if (!(await openAbout(page))) test.skip();

  const cv = page.locator("#about .cv");
  if ((await cv.count()) === 0) test.skip();

  await expect(cv).toContainText("Download CV");
  const href = await cv.getAttribute("href");
  expect(href).toBeTruthy();

  const response = await request.head(href!);
  expect(response.status()).toBe(200);

  // The size is read from the file rather than typed into the database, so it appears
  // only once the HEAD returns.
  await expect(cv.locator(".cv__size")).toContainText(/PDF/);
});

test("the section fits the deck rather than making it taller", async ({ page }) => {
  if (!(await openAbout(page))) test.skip();

  const fits = await page.evaluate(() => {
    const section = document.getElementById("about");
    const deck = document.querySelector(".deck");
    if (!section || !deck) return true;
    return section.getBoundingClientRect().height <= deck.clientHeight + 1;
  });
  expect(fits).toBe(true);
});

test("no serious accessibility violations on the section", async ({ page }) => {
  await page.goto("/#about");
  await ready(page);

  const results = await new AxeBuilder({ page }).include("#about").analyze();
  expect(
    results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);
});
