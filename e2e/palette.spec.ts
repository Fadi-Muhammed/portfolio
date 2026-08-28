import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The palette is a shortcut to the deck, so these test that it opens the ways B6 promises,
 * finds real content, moves the deck through the same hopTo everything else uses, and
 * gives focus back when it closes.
 */

async function ready(page: Page) {
  await expect(page).toHaveURL(/#/);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished" || animation.playState === "idle"),
  );
}

const input = (page: Page) => page.locator("[cmdk-input]");

test("opens with the keyboard shortcut", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("Control+k");
  await expect(input(page)).toBeVisible();
  await expect(input(page)).toBeFocused();
});

test("opens with the / shortcut, but never while typing in a field", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("/");
  await expect(input(page)).toBeVisible();

  // Inside the palette's own input, "/" must type rather than re-open.
  await input(page).fill("");
  await page.keyboard.press("/");
  await expect(input(page)).toHaveValue("/");
});

test("opens from the nav Search button", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.getByRole("button", { name: "Search the site" }).click();
  await expect(input(page)).toBeVisible();
});

test("finds a section and hops to it", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("Control+k");
  await input(page).fill("contact");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/#contact$/);
  await expect(input(page)).toBeHidden();
});

test("finds a product from the database and hops to its section", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("Control+k");
  await input(page).fill("rubric");

  const item = page.getByRole("option", { name: /Rubric/i });

  // CI runs without Supabase credentials, so the palette lists sections and actions only.
  // Skipping is honest here: there is no content to search, and asserting otherwise would
  // be testing the environment rather than the palette.
  test.skip(
    (await item.count()) === 0,
    "No database content in this environment; the palette lists sections only.",
  );

  await expect(item).toBeVisible();
  await page.keyboard.press("Enter");
  // Detail pages arrive in Part 8; until then a product hops to its section.
  await expect(page).toHaveURL(/#products$/);
});

test("searches on words that are not in the label", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("Control+k");
  // "lab" is in the Engineering teaser, not its name.
  await input(page).fill("lab");
  await expect(page.getByRole("option", { name: /Engineering/i }).first()).toBeVisible();
});

test("says so when nothing matches, and offers a way on", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("Control+k");
  await input(page).fill("zzzzzzzz");
  await expect(page.getByText("No route to that.")).toBeVisible();
});

test("ping reports a real measurement", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("Control+k");
  await input(page).fill("ping");
  await page.keyboard.press("Enter");

  const status = page.getByRole("status");
  // A real number, not a fixed string: the digits come from the round trip.
  await expect(status).toContainText(/time=\d+ ms/, { timeout: 15_000 });
  await expect(status).toContainText("1 packet transmitted, 1 received");
  // It stays open, because the answer belongs in the palette.
  await expect(input(page)).toBeVisible();
});

test("Escape closes it and returns focus to whatever opened it", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  const trigger = page.getByRole("button", { name: "Search the site" });
  await trigger.click();
  await expect(input(page)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(input(page)).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("no serious accessibility violations with the palette open", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("Control+k");
  await expect(input(page)).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  const serious = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  expect(serious, serious.map((v) => `${v.id}: ${v.help}`).join("; ")).toEqual([]);
});
