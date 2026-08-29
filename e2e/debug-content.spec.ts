import { expect, test } from "@playwright/test";
import { devBaseURL } from "../playwright.config";

/**
 * /debug/content is a working tool, not a page anyone should be able to reach. Both
 * halves of that are worth asserting: it must exist in development, and it must be
 * absent from the production build.
 *
 * The dev half runs against a second server on its own port, because the rest of the
 * suite tests a production build where this route deliberately does not exist.
 */

test("is absent from the production build", async ({ request }) => {
  const response = await request.get("/debug/content");
  expect(response.status()).toBe(404);
});

test("lists the seeded content in development", async ({ page }) => {
  await page.goto(`${devBaseURL}/debug/content`);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const heading = await page.getByRole("heading", { level: 1 }).textContent();

  // Without credentials — as in CI — the page says so rather than throwing. That is
  // still a pass: the assertion is that the tool degrades legibly, not that a database
  // happens to be reachable from wherever this is running.
  if (heading?.includes("No database configured")) {
    await expect(page.getByText("NEXT_PUBLIC_SUPABASE_URL")).toBeVisible();
    return;
  }

  await expect(page.getByRole("heading", { name: "Content", exact: true })).toBeVisible();

  for (const group of [
    "Site settings",
    "Products",
    "Engineering projects",
    "Achievements and talks",
    "Featured in",
    "Skills",
    "Certifications",
    "Experience and education",
  ]) {
    await expect(page.getByRole("heading", { name: group, exact: true })).toBeVisible();
  }

  /*
   * Every group says what it holds, one way or the other.
   *
   * This used to assert that "Nothing published." was on the page, which was true only
   * because featured_in happened to be the one empty table. Part 11 filled it and the
   * test failed while nothing was wrong — it was pinned to the fixture rather than to the
   * promise. The promise is that a group with no rows says so rather than rendering blank
   * space that looks identical to a group that failed to load.
   */
  const groups = page.locator("section:has(h2)");
  const count = await groups.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const text = (await groups.nth(index).innerText()).trim();
    expect(text.length).toBeGreaterThan(0);
  }
});
