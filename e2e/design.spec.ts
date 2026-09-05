import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The design system has to be accessible in both themes, not just the one that happens
 * to be default — the palette is the thing under test, and it is different per theme.
 */
async function setTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((value) => window.localStorage.setItem("theme", value), theme);
}

for (const theme of ["light", "dark"] as const) {
  test(`/design has no serious accessibility violations in ${theme}`, async ({ page }) => {
    await setTheme(page, theme);
    await page.goto("/design");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Design system");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const serious = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(
      serious,
      `serious/critical violations in ${theme}: ${serious.map((v) => v.id).join(", ")}`,
    ).toEqual([]);
  });
}

test("the theme toggle switches the theme and says what it will do", async ({ page }) => {
  await setTheme(page, "light");
  await page.goto("/design");

  // Scoped to the nav. /design shows a toggle of its own as a specimen, and since the nav
  // moved into the root layout the page carries both — the one being tested is the one a
  // visitor uses.
  const nav = page.getByRole("navigation", { name: "Primary" });
  const toggle = nav.getByRole("button", { name: "Switch to dark theme" });
  await expect(toggle).toBeVisible();
  await toggle.click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(nav.getByRole("button", { name: "Switch to light theme" })).toBeVisible();
});

test("the invalid field names the fault and is wired to it", async ({ page }) => {
  await page.goto("/design");

  const invalid = page.locator('input[aria-invalid="true"]').first();
  await expect(invalid).toBeVisible();

  const describedBy = await invalid.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`#${describedBy}`)).toHaveText(
    "Enter a full email address, like you@example.com.",
  );
});
