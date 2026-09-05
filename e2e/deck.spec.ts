import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The deck is the site's navigation, so these test the promises B3 makes: one section at
 * a time, every route to a section behaving identically, and the URL always saying where
 * you are.
 */

/**
 * Waits for the deck to settle on a section rather than guessing at a timeout.
 *
 * The URL alone proves nothing after a deep link: `goto("/#engineering")` makes it true
 * before a line of JavaScript has run, so this passed while the deck was still on the
 * hero. `data-active` is the deck's own answer to "where am I", so that is what is asked.
 */
async function expectOn(page: Page, id: string) {
  await expect(page).toHaveURL(new RegExp(`#${id}$`));
  await expect(page.locator(`#${id}[data-active]`)).toHaveCount(1);
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

/**
 * Wait until the deck has actually arrived, not just decided to.
 *
 * A deep link sets the active section immediately — the provider does that on purpose, so
 * a click feels answered — and the scroll follows. Measuring an element's position in
 * between gives its box three viewports down the page, which is how the first version of
 * the wheel tests below ended up aiming at nothing.
 */
async function settledOn(page: Page, id: string) {
  await expectOn(page, id);
  await expect
    .poll(async () =>
      page.evaluate((section) => {
        const deck = document.querySelector(".deck") as HTMLElement;
        const element = document.getElementById(section) as HTMLElement;
        if (!deck || !element) return Number.MAX_SAFE_INTEGER;
        const padding = parseFloat(getComputedStyle(deck).scrollPaddingTop) || 0;
        return Math.abs(element.offsetTop - padding - deck.scrollTop);
      }, id),
    )
    .toBeLessThan(4);
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

  /*
   * Located by what it visibly says. It used to be found by aria-label "Hop to Products",
   * which Part 16 removed: the accessible name has to contain the visible text, and the
   * link visibly reads "Products" and its teaser. Matching on the heading inside it is
   * both the durable locator and the one a voice-control user would speak.
   */
  await page
    .getByRole("link", { name: /^Products/ })
    .first()
    .click();

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
  // The provider writes the hash on mount, so this proves the keyboard listener exists.
  // Without it the keypress raced hydration — invisible while the sections were empty
  // placeholders, and a flake the moment Part 8 gave one of them an image to load.
  await expect(page).toHaveURL(/#/);

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

test("an inner scroller lets go of the wheel once it reaches its end", async ({ page }) => {
  await page.goto("/#about");
  await settledOn(page, "about");

  const region = page.locator("#about [data-inner-scroll]").first();
  const scrollable = await region.evaluate((el) => el.scrollHeight > el.clientHeight + 4);
  if (!scrollable) test.skip(true, "About does not overflow at this size in this environment.");

  // Put it at its own bottom, which is where the trap used to be: the wheel died there
  // and the only way on was to aim at whatever strip of the section was not a scroller.
  await region.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(200);

  const box = await region.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, 600);

  // The next gesture carries into the deck rather than stopping dead.
  await expectOn(page, "contact");
});

test("an inner scroller keeps the wheel while it still has somewhere to go", async ({ page }) => {
  await page.goto("/#about");
  await settledOn(page, "about");

  const region = page.locator("#about [data-inner-scroll]").first();
  const scrollable = await region.evaluate((el) => el.scrollHeight > el.clientHeight + 4);
  if (!scrollable) test.skip(true, "About does not overflow at this size in this environment.");

  await region.evaluate((el) => {
    el.scrollTop = 0;
  });

  const box = await region.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(300);

  // Still reading About: a small scroll inside the region must not jump the deck.
  expect(await region.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await expectOn(page, "about");
});

test("the keyboard leaves an inner scroller at its end, and not before", async ({ page }) => {
  await page.goto("/#about");
  await settledOn(page, "about");

  const region = page.locator("#about [data-inner-scroll]").first();
  const scrollable = await region.evaluate((el) => el.scrollHeight > el.clientHeight + 4);
  if (!scrollable) test.skip(true, "About does not overflow at this size in this environment.");

  // Mid-scroll, ArrowDown belongs to the region.
  await region.evaluate((el) => {
    el.scrollTop = 0;
    el.focus();
  });
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(200);
  await expectOn(page, "about");

  // At its end, the same key hops.
  await region.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    el.focus();
  });
  await page.keyboard.press("ArrowDown");
  await expectOn(page, "contact");
});
