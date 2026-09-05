import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { devBaseURL } from "../playwright.config";

/**
 * B10's states: the ones a visitor reaches by accident, and the one Fadi turns on.
 *
 * Maintenance is asserted in src/proxy.test.ts rather than here — whether the site is
 * down is read from the environment of the running server, and a third server started
 * with the flag on would race the build the other two share. What is testable in a
 * browser is the page that rewrite lands on, and that is what this file does.
 */

async function noSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);
}

test.describe("404", () => {
  test("an unknown address is answered with a 404 and the site's own page", async ({ page }) => {
    const response = await page.goto("/this-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Route not found." })).toBeVisible();
    await expect(page.getByRole("img", { name: /packet stopped/i })).toBeVisible();
  });

  test("Back to home goes home", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/\/(#.*)?$/);
  });

  test("Search the site opens the palette", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await page.getByRole("button", { name: "Search the site" }).first().click();
    await expect(page.locator("[cmdk-input]")).toBeVisible();
  });

  test("no serious accessibility violations", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await noSeriousViolations(page);
  });
});

test.describe("the render error", () => {
  // The throwing route is development-only, like /debug/content, so this half runs
  // against the dev server the suite already starts.
  test("a route that throws is answered with Packet dropped.", async ({ page }) => {
    await page.goto(`${devBaseURL}/debug/throw`);

    await expect(page.getByRole("heading", { name: "Packet dropped." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  });

  test("is absent from the production build", async ({ request }) => {
    const response = await request.get("/debug/throw");
    expect(response.status()).toBe(404);
  });
});

test.describe("no signal", () => {
  test("says so when the connection goes, and confirms when it comes back", async ({
    page,
    context,
  }) => {
    await page.goto("/");

    await context.setOffline(true);
    await expect(page.getByText("No signal.")).toBeVisible();
    await expect(page.getByText(/Checking every few seconds/)).toBeVisible();

    await context.setOffline(false);
    // Confirmed, not assumed: the panel only says this once a real request has answered.
    await expect(page.getByText("Signal restored.")).toBeVisible();

    // And then it removes itself rather than sitting there.
    await expect(page.getByText("Signal restored.")).toBeHidden({ timeout: 6_000 });
  });

  test("is absent while the connection is fine", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("No signal.")).toBeHidden();
  });

  test("no serious accessibility violations with the panel up", async ({ page, context }) => {
    await page.goto("/");
    await context.setOffline(true);
    await expect(page.getByText("No signal.")).toBeVisible();

    await noSeriousViolations(page);
    await context.setOffline(false);
  });
});

test.describe("maintenance", () => {
  test("the page says what is happening and offers a way to reach him", async ({ page }) => {
    await page.goto("/maintenance");

    await expect(page.getByRole("heading", { name: "Out of service." })).toBeVisible();
    await expect(page.getByRole("img", { name: /out of service/i })).toBeVisible();
  });

  test("the address is not in the HTML until it is asked for", async ({ page }) => {
    const response = await page.goto("/maintenance");
    const html = (await response?.text()) ?? "";

    // Without credentials — as in CI — there is no settings row and so no control at all.
    const reveal = page.getByRole("button", { name: "Show email address" });
    if ((await reveal.count()) === 0) {
      test.skip(true, "No site_settings row, so there is no address to withhold.");
      return;
    }

    expect(html).not.toContain("@gmail.com");
    await reveal.click();
    await expect(page.getByRole("link", { name: /@/ })).toBeVisible();
  });

  test("offers no navigation it cannot honour", async ({ page }) => {
    await page.goto("/maintenance");

    // While the flag is on, every one of these would land back on this page.
    await expect(page.getByRole("button", { name: "Search the site" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Work" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Contact" })).toBeHidden();
    await expect(page.getByRole("link", { name: "Skip to contact" })).toBeHidden();

    // The keystroke goes with the button, or the promise is only hidden from the mouse.
    await page.keyboard.press("Control+k");
    await expect(page.locator("[cmdk-input]")).toBeHidden();

    // The name and the theme stay: one is identity, the other still works.
    await expect(page.getByText("Fadi Muhammed")).toBeVisible();
    await expect(page.getByRole("button", { name: /theme/i })).toBeVisible();
  });

  test("is not indexed", async ({ page }) => {
    await page.goto("/maintenance");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("no serious accessibility violations", async ({ page }) => {
    await page.goto("/maintenance");
    await noSeriousViolations(page);
  });
});
