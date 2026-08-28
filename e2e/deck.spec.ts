import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The deck is the site's navigation, so these test the promises B3 makes: one section at
 * a time, every route to a section behaving identically, and the URL always saying where
 * you are.
 */

/** Waits for the deck to settle on a section rather than guessing at a timeout. */
async function expectOn(page: Page, id: string) {
  await expect(page).toHaveURL(new RegExp(`#${id}$`));
}

/**
 * Waits until the deck is actually ready to be driven or judged.
 *
 * Two things have to be true, and CI is slow enough to catch both when a fast machine
 * does not. The provider writes the hash on mount, so a hash proves hydration has run and
 * the keyboard listener exists. And the entrance animation fades a section in, so until
 * it finishes the text is genuinely mid-fade — measuring contrast there reports a colour
 * that exists for 360ms and is not the design.
 */
async function ready(page: Page) {
  await expect(page).toHaveURL(/#/);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished" || animation.playState === "idle"),
  );
}

test("lands on the section named in the URL", async ({ page }) => {
  await page.goto("/#engineering");

  await expectOn(page, "engineering");
  await expect(page).toHaveTitle("Fadi Muhammed — Engineering");
  await expect(page.getByRole("heading", { name: "Engineering", level: 2 })).toBeInViewport();
});

test("the hero is the default landing, with no suffix in the title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Fadi Muhammed");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("the rail hops, and the URL follows", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.getByRole("button", { name: "Hop to Achievements" }).click();

  await expectOn(page, "achievements");
  await expect(page).toHaveTitle("Fadi Muhammed — Achievements");
});

test("the peek strip hops to the section it names", async ({ page }) => {
  await page.goto("/");

  // From the hero, the visible peek is Products.
  await page.getByRole("link", { name: "Hop to Products" }).click();

  await expectOn(page, "products");
});

test("keyboard paging moves one section at a time", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("PageDown");
  await expectOn(page, "products");

  await page.keyboard.press("PageDown");
  await expectOn(page, "engineering");

  await page.keyboard.press("PageUp");
  await expectOn(page, "products");

  await page.keyboard.press("End");
  await expectOn(page, "contact");

  await page.keyboard.press("Home");
  await expectOn(page, "hero");
});

test("the wheel snaps from one section to the next", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.mouse.move(400, 400);
  // A realistic flick: a few wheel ticks, not most of a viewport. Snapping decides where
  // it lands, so the assertion is that it lands on exactly one section further on.
  await page.mouse.wheel(0, 300);

  await expectOn(page, "products");
});

test("the skip link is the first stop and goes to contact", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to contact" });
  await expect(skip).toBeFocused();

  await skip.press("Enter");
  await expectOn(page, "contact");
});

test("inactive sections are inert, so tabbing stays in the active one", async ({ page }) => {
  await page.goto("/");

  const heroBody = page.locator("#hero .deck-section-body");
  const productsBody = page.locator("#products .deck-section-body");

  await expect(heroBody).not.toHaveAttribute("inert", /.*/);
  await expect(productsBody).toHaveAttribute("inert", /.*/);
});

test("under reduced motion the hop is instant and nothing smooth-scrolls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const deck = page.locator(".deck");
  await expect(deck).toHaveCSS("scroll-behavior", "auto");

  await page.keyboard.press("PageDown");
  await expectOn(page, "products");
});

test("no serious accessibility violations on the deck", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  const serious = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  expect(serious, serious.map((v) => `${v.id}: ${v.help}`).join("; ")).toEqual([]);
});
