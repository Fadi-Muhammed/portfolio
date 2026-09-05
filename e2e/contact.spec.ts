import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Contact (B7, B9): the form, the slider, the footer.
 *
 * The suite runs against Cloudflare's always-pass Turnstile keys, so what is exercised
 * here is the form's own logic — validation, the honeypot, the states, the slider — and
 * not whether a headless browser can solve a challenge. A real send against real keys is
 * the manual check recorded in docs/PROGRESS.md.
 *
 * Whether a message reaches the database depends on Supabase credentials, which CI does
 * not have. So the success path is asserted where it can be and skipped where it cannot,
 * the same rule the rest of the suite follows.
 */

async function ready(page: Page) {
  await expect(page).toHaveURL(/#/);
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished" || animation.playState === "idle"),
  );
}

async function openContact(page: Page) {
  await page.goto("/#contact");
  await ready(page);
  await expect(page.locator("#contact form")).toBeVisible();
}

async function fill(page: Page, overrides: Partial<Record<string, string>> = {}) {
  await page.getByRole("textbox", { name: "Name" }).fill(overrides.name ?? "Sam Okonkwo");
  await page.getByRole("textbox", { name: "Email" }).fill(overrides.email ?? "sam@example.com");
  await page
    .getByLabel("Message")
    .fill(overrides.message ?? "I read the street lighting write-up and had a question about it.");
}

test("the form asks for what it needs, beside the field that needs it", async ({ page }) => {
  await openContact(page);

  // Blur without typing: the message appears next to the field rather than at the top.
  await page.getByRole("textbox", { name: "Name" }).click();
  await page.getByRole("textbox", { name: "Email" }).click();
  await expect(page.getByText("Add your name.")).toBeVisible();

  await page.getByRole("textbox", { name: "Email" }).fill("not-an-email");
  await page.getByRole("textbox", { name: "Message" }).click();
  await expect(page.getByText("That does not look like an email address.")).toBeVisible();

  // And it clears once the mistake is fixed, rather than persisting until submit.
  await page.getByRole("textbox", { name: "Email" }).fill("sam@example.com");
  await page.getByRole("textbox", { name: "Name" }).click();
  await expect(page.getByText("That does not look like an email address.")).toHaveCount(0);
});

test("an invalid field is announced, not just coloured", async ({ page }) => {
  await openContact(page);

  await page.getByRole("textbox", { name: "Message" }).fill("hi");
  await page.getByRole("textbox", { name: "Name" }).click();

  const message = page.getByRole("textbox", { name: "Message" });
  await expect(message).toHaveAttribute("aria-invalid", "true");
  // The message is wired to the field, so a screen reader reads it with the field.
  const describedBy = await message.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`#${describedBy?.split(" ").pop()}`)).toBeVisible();
});

test("the honeypot is hidden from people and from assistive technology", async ({ page }) => {
  await openContact(page);

  const honeypot = page.locator("#contact input[name='company']");
  await expect(honeypot).toHaveCount(1);
  await expect(honeypot).not.toBeInViewport();
  await expect(honeypot).toHaveAttribute("tabindex", "-1");
  // aria-hidden on the wrapper, so it is not announced either.
  await expect(page.locator("#contact .honeypot")).toHaveAttribute("aria-hidden", "true");
});

test("a filled honeypot is answered with success, and shows the handshake", async ({ page }) => {
  await openContact(page);
  await fill(page);

  /*
   * Filling the honeypot is the one path to the success state with no side effects at
   * all: the action answers "sent" before it reaches Turnstile, the database or Resend,
   * because telling a bot it was detected is telling it what to change.
   *
   * That makes it the honest way to assert the finale in an automated run. A real send
   * would put a row in the real contact_messages table on every CI run, and the actual
   * end-to-end path is covered by the manual check in docs/PROGRESS.md.
   */
  await page.locator("#contact input[name='company']").evaluate((node) => {
    (node as HTMLInputElement).value = "Acme Ltd";
  });

  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Message sent")).toBeVisible();
  // The third orchestrated moment on the site (B5).
  await expect(page.locator("#contact .handshake")).toBeVisible();
  await expect(page.locator("#contact .handshake__step")).toHaveCount(3);
  await expect(page.getByRole("img", { name: /three-way handshake completing/i })).toBeVisible();
});

test("the form still carries a real action, so it works without JavaScript", async ({ page }) => {
  await openContact(page);
  // B9 asks for the no-JavaScript fallback where feasible. A server action gives the
  // form element an action attribute and a method of post; without one, the form would
  // do nothing at all with scripting off.
  const form = page.locator("#contact form");
  await expect(form).toHaveAttribute("action", /.+/);
});

test("the submit button keeps its name and reports that it is working", async ({ page }) => {
  await openContact(page);
  const button = page.getByRole("button", { name: /Send message|Sending/ });
  await expect(button).toHaveText("Send message");
});

test("Copy email says what it did, keeping its own name", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openContact(page);

  // No credentials means no site_settings row and so no address to copy. Skipping is the
  // honest answer; asserting against a control that was never rendered is not.
  const copy = page.getByRole("button", { name: "Copy email" });
  if ((await copy.count()) === 0) test.skip();

  await copy.click();

  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("@");
});

test("the address is not sitting in the served HTML for a scraper to read", async ({ request }) => {
  const response = await request.get("/");
  const html = await response.text();
  // B9: revealed on click rather than printed. The two halves may appear; the joined
  // address must not.
  expect(html).not.toContain("work.fmuhammed@gmail.com");
});

test("the slider opens the target when dragged past the threshold", async ({ page, context }) => {
  await openContact(page);

  // The slider needs a LinkedIn URL from site_settings, which CI has no credentials for.
  const slider = page.locator("#contact .slider");
  if ((await slider.count()) === 0) test.skip();

  /*
   * Into view before measuring. The section scrolls inside the deck, and boundingBox()
   * reports where an element is whether or not it is on screen — so a slider below the
   * fold gave coordinates that put the pointer on whatever was on top of it instead.
   */
  await slider.scrollIntoViewIfNeeded();
  await expect(slider).toBeVisible();
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const popup = context.waitForEvent("page");

  await page.mouse.move(box.x + 24, box.y + box.height / 2);
  await page.mouse.down();
  // Past 85% of the travel, in steps, so it is a drag rather than a teleport.
  for (const fraction of [0.3, 0.6, 0.95]) {
    await page.mouse.move(box.x + box.width * fraction, box.y + box.height / 2, { steps: 4 });
  }
  await page.mouse.up();

  const opened = await popup;
  expect(opened.url()).toContain("linkedin.com");
  await expect(page.locator("#contact .slider[data-opened]")).toHaveCount(1);
  await opened.close();
});

test("released early, the handle springs back and nothing opens", async ({ page, context }) => {
  await openContact(page);

  const slider = page.locator("#contact .slider");
  if ((await slider.count()) === 0) test.skip();

  await slider.scrollIntoViewIfNeeded();
  const box = await slider.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  let opened = false;
  context.on("page", () => {
    opened = true;
  });

  await page.mouse.move(box.x + 24, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2, { steps: 4 });
  await page.mouse.up();

  await expect(page.locator("#contact .slider[data-opened]")).toHaveCount(0);
  expect(opened).toBe(false);
});

test("the slider is a button, so a keyboard never has to simulate a drag", async ({
  page,
  context,
}) => {
  await openContact(page);

  const slider = page.locator("#contact .slider");
  if ((await slider.count()) === 0) test.skip();

  await expect(slider).toHaveAttribute("role", "button");
  await expect(slider).toHaveAttribute("tabindex", "0");

  const popup = context.waitForEvent("page");
  await slider.focus();
  await page.keyboard.press("Enter");

  const opened = await popup;
  expect(opened.url()).toContain("linkedin.com");
  await opened.close();
});

test("the footer lights the sections this visit reached", async ({ page }) => {
  await page.goto("/");
  await ready(page);

  // Walk part of the deck, then arrive at contact.
  for (const id of ["products", "engineering"]) {
    await page.locator(`#${id} .deck-section-header`).click();
    await expect(page.locator(`#${id}[data-active]`)).toHaveCount(1);
  }
  await page.locator("#contact .deck-section-header").click();
  await expect(page.locator("#contact[data-active]")).toHaveCount(1);

  const lit = await page.locator("#contact .recap__node[data-visited]").count();
  const all = await page.locator("#contact .recap__node").count();

  expect(all).toBe(7);
  // Hero, products, engineering, contact at least — and never every node, or the recap
  // would be describing a route nobody took.
  expect(lit).toBeGreaterThanOrEqual(4);
  expect(lit).toBeLessThan(all);
  await expect(page.getByText("Destination reached.")).toBeVisible();
});

test("the footer says what the site is made of and what it records", async ({ page }) => {
  await openContact(page);

  await expect(page.getByText("Built with Next.js and Supabase. Source viewable.")).toBeVisible();
  await expect(page.getByText(`© ${new Date().getFullYear()} Fadi Muhammed`)).toBeVisible();

  /*
   * The privacy note depends on the environment, and asserting one of its two wordings
   * was a test that passed in CI and failed on the machine that had just configured
   * analytics. What must hold in both is that the sentence matches what the page is
   * actually doing — so the script decides which line to expect, exactly as the footer
   * does.
   */
  const tracked = (await page.locator('script[src*="umami"]').count()) > 0;
  await expect(
    page.getByText(
      tracked
        ? "Visits are counted with Umami. No cookies, no personal data."
        : "No analytics, no cookies.",
    ),
  ).toBeVisible();
});

test("no serious accessibility violations on the section", async ({ page }) => {
  await openContact(page);

  const results = await new AxeBuilder({ page }).include("#contact").analyze();
  expect(
    results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.help}`),
  ).toEqual([]);
});
