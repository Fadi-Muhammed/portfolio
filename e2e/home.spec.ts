import { expect, test } from "@playwright/test";

test("the deck renders with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  // The hero is the first stop, and it carries the page's only h1.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Every section exists in the document from the start; only their content is lazy.
  for (const id of [
    "hero",
    "products",
    "engineering",
    "achievements",
    "featured-in",
    "about",
    "contact",
  ]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  expect(consoleErrors, "console errors on /").toEqual([]);
  expect(pageErrors, "uncaught page errors on /").toEqual([]);
});
