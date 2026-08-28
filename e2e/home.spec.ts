import { expect, test } from "@playwright/test";

test("home renders the holding line with no console errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Building. Back soon.");

  expect(consoleErrors, "console errors on /").toEqual([]);
  expect(pageErrors, "uncaught page errors on /").toEqual([]);
});
