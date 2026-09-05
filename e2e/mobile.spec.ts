import { expect, test, type Page } from "@playwright/test";

/**
 * The things that are only true on a phone (B12).
 *
 * Run against emulated Mobile Chrome and Mobile Safari, which is a weaker claim than a
 * real device and a much stronger one than nothing: emulation catches layout, hit targets
 * and overflow, and cannot catch an address bar moving under a scroll-snap container.
 * That one is in docs/QA.md as a manual check, because it is the bug Part 5 actually hit.
 *
 * These assert what a phone breaks, not what every browser does — the rest of the suite
 * already covers behaviour, and running all of it three times would buy repetition rather
 * than coverage.
 */

async function ready(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page
    .waitForFunction(
      () =>
        document.getAnimations().every((a) => a.playState === "finished" || a.playState === "idle"),
      undefined,
      { timeout: 5_000 },
    )
    .catch(() => {});
}

test("nothing overflows the viewport sideways", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  const overflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));

  // A horizontal scrollbar on a phone is the single most obvious sign of a layout that
  // was designed at desktop width and shrunk.
  expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewport + 1);
});

test("a section fits the small viewport, so the address bar cannot resize it", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  const heights = await page.evaluate(() => {
    const section = document.querySelector(".deck-section");
    return {
      section: section ? Math.round(section.getBoundingClientRect().height) : 0,
      inner: window.innerHeight,
    };
  });

  /*
   * 100svh, not 100dvh. The dynamic unit changes as the URL bar hides, which moves every
   * snap point mid-scroll — Part 5 found a fast flick skipping a section because of it.
   * The small unit never changes, so a section is never taller than the viewport at its
   * smallest.
   */
  expect(heights.section).toBeLessThanOrEqual(heights.inner + 1);
});

test("every control a thumb has to hit is at least 44px", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  const tooSmall = await page.evaluate(() => {
    const bad: string[] = [];
    for (const el of document.querySelectorAll("a, button, [role='button'], input, select")) {
      const rect = el.getBoundingClientRect();
      // Skip anything not currently rendered: hidden controls have no hit target to miss.
      if (rect.width === 0 || rect.height === 0) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      if (rect.height < 44 || rect.width < 24) {
        bad.push(
          `${el.tagName.toLowerCase()}.${el.className.toString().split(" ")[0]} ${Math.round(rect.width)}x${Math.round(rect.height)}`,
        );
      }
    }
    return bad;
  });

  expect(tooSmall).toEqual([]);
});

test("the deck settles on a section after a real scroll", async ({ page, browserName }) => {
  /*
   * Emulated mobile WebKit cannot synthesise a wheel — Playwright says so outright — and
   * a hand-dispatched touch sequence produces no momentum, which is the part of the
   * gesture that snapping actually resolves. So this is asserted on Chromium and left to
   * a real iPhone in docs/QA.md, which is where Part 5's snapping bug was found and where
   * the fix for it still has to be confirmed.
   */
  test.skip(browserName === "webkit", "Mobile WebKit has no wheel; see docs/QA.md.");

  await page.goto("/");
  await ready(page);

  const deck = page.locator(".deck");
  const before = await deck.evaluate((el) => el.scrollTop);

  /*
   * A wheel gesture, not an assignment to scrollTop.
   *
   * Scroll snapping responds to scrolling; setting scrollTop directly is a jump, and the
   * first version of this test asserted that a jump would snap, which is a claim about
   * the browser rather than about the deck. A wheel event is what a trackpad and a flick
   * both produce.
   */
  await page.mouse.move(200, 400);
  await page.mouse.wheel(0, 1200);
  await page.waitForTimeout(900);

  const settled = await deck.evaluate((el) => {
    /*
     * A snapped section rests at its top minus the deck's scroll-padding, which is the
     * nav's height — that is what stops a section landing behind the fixed nav. Ignoring
     * it made this test fail by exactly 56px on a phone, which is exactly --nav-h, and
     * the number is what gave it away.
     */
    const padding = parseFloat(getComputedStyle(el).scrollPaddingTop) || 0;
    const stops = [...el.querySelectorAll(".deck-section")].map(
      (s) => (s as HTMLElement).offsetTop - padding,
    );
    return {
      top: el.scrollTop,
      gap: Math.min(...stops.map((t) => Math.abs(t - el.scrollTop))),
    };
  });

  expect(settled.top).toBeGreaterThan(before);
  // It comes to rest on a section, never between two.
  expect(settled.gap).toBeLessThan(4);
});

test("the nav drops the section links rather than shrinking them", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  // B4: on a phone only the name, search and theme survive — the rail and the peek strip
  // already reach every section, so repeating them would spend scarce width badly.
  // Scoped to the nav, and exact: the hero's "Work with me" is also a button whose name
  // contains "Work", which made the first version of this ambiguous rather than failing.
  const nav = page.getByRole("banner");
  await expect(nav.getByRole("button", { name: "Work", exact: true })).toBeHidden();
  await expect(nav.getByRole("button", { name: "Search the site" })).toBeVisible();
});
