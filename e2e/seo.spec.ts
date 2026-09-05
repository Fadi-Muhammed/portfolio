import { expect, test, type Page } from "@playwright/test";
import { devBaseURL } from "../playwright.config";

/**
 * What the site tells a machine (B12).
 *
 * None of this is visible, which is exactly why it is tested: a canonical tag pointing at
 * the wrong URL, a sitemap listing a 404, or a share card that fails to render are all
 * invisible until someone posts a link and it comes out wrong.
 */

const content = (page: Page, selector: string) =>
  page.locator(selector).first().getAttribute("content");

test.describe("metadata", () => {
  test("the home page names itself, and points at itself", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Fadi Muhammed/);
    expect(await content(page, 'meta[name="description"]')).toBeTruthy();

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https?:\/\//);

    // Open Graph and the canonical tag must agree, or a shared link and a crawled one
    // are two different pages as far as anything reading them is concerned.
    expect(await content(page, 'meta[property="og:url"]')).toBe(canonical);
    expect(await content(page, 'meta[property="og:title"]')).toContain("Fadi Muhammed");
    expect(await content(page, 'meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  test("a case study carries its own title, description and canonical", async ({ page }) => {
    const response = await page.goto("/products/rubric");
    if (response?.status() === 404) test.skip(true, "No products seeded in this environment.");

    await expect(page).toHaveTitle(/— Fadi Muhammed$/);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/products/rubric");
    expect(await content(page, 'meta[property="og:type"]')).toBe("article");
  });

  test("a case study keeps its own title and address after hydration", async ({ page }) => {
    const response = await page.goto("/products/rubric");
    if (response?.status() === 404) test.skip(true, "No products seeded in this environment.");

    // The deck provider lives in the root layout, so it runs here too. It must not treat
    // a page with no sections as the deck parked on the hero: that replaced the title
    // with the bare site name and pushed #hero into the address bar of every case study.
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle("Rubric — Fadi Muhammed");
    expect(page.url()).not.toContain("#");
  });

  test("nothing is indexable before launch", async ({ page }) => {
    await page.goto("/");
    // The flag is off in every environment but launch day, so this is the state that
    // ships. If it ever passes with index, someone set NEXT_PUBLIC_INDEXABLE by accident.
    expect(await content(page, 'meta[name="robots"]')).toContain("noindex");
  });

  test("the theme colour is stated for both themes", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
  });
});

test.describe("the share cards", () => {
  test("the home card renders as a PNG", async ({ request }) => {
    const response = await request.get("/opengraph-image");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
    // A card that renders but is empty would still be a PNG. 5 KB is far below a real
    // one and far above a blank.
    expect((await response.body()).byteLength).toBeGreaterThan(5_000);
  });

  test("a case study has its own card", async ({ request }) => {
    const response = await request.get("/products/rubric/opengraph-image");
    if (response.status() === 404) test.skip(true, "No products seeded in this environment.");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });

  test("the page points at the card", async ({ page }) => {
    await page.goto("/");
    expect(await content(page, 'meta[property="og:image"]')).toContain("opengraph-image");
  });
});

test.describe("robots and the sitemap", () => {
  test("robots.txt disallows everything until launch, and names the sitemap", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("Disallow: /");
    expect(body).toContain("sitemap.xml");
  });

  test("the sitemap lists the real pages and none of the tools", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/products");

    // A sitemap is a claim that a page is worth indexing. These are not.
    expect(body).not.toContain("/design");
    expect(body).not.toContain("/debug");
    expect(body).not.toContain("/maintenance");
    // Sections are fragments of one page, not pages.
    expect(body).not.toContain("#");
  });

  test("every route in the sitemap answers 200", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    const paths = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) =>
        // Fetched by path against this run's base URL rather than by the absolute URL in
        // the file, which is whatever NEXT_PUBLIC_SITE_URL says — in CI a placeholder, and
        // on a developer's machine possibly the live domain. A test must never leave the
        // server it is testing.
        new URL(match[1]).pathname,
    );

    expect(paths.length).toBeGreaterThan(0);

    for (const path of paths) {
      const response = await request.get(path);
      expect(response.status(), `${path} should answer 200`).toBe(200);
    }
  });
});

test.describe("structured data", () => {
  test("the home page describes a Person and a WebSite, and both parse", async ({ page }) => {
    await page.goto("/");

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.length).toBeGreaterThan(0);

    const graph = blocks.flatMap((block) => {
      const parsed: unknown = JSON.parse(block);
      const record = parsed as { "@graph"?: unknown[] };
      return Array.isArray(record["@graph"]) ? record["@graph"] : [parsed];
    });

    const types = graph.map((node) => (node as { "@type"?: string })["@type"]);
    expect(types).toContain("Person");
    expect(types).toContain("WebSite");
  });

  test("a case study describes the work", async ({ page }) => {
    const response = await page.goto("/products/rubric");
    if (response?.status() === 404) test.skip(true, "No products seeded in this environment.");

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = blocks.map((block) => JSON.parse(block) as { "@type"?: string });
    expect(parsed.some((node) => node["@type"] === "CreativeWork")).toBe(true);
  });
});

test.describe("the small things", () => {
  test("humans.txt is served", async ({ request }) => {
    const response = await request.get("/humans.txt");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Fadi Muhammed");
  });

  test("the manifest and the icons are served", async ({ request }) => {
    for (const path of ["/manifest.webmanifest", "/icon.svg", "/apple-icon"]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });

  test("the console says one thing, and nothing is wrong in it", async ({ page }) => {
    const notes: string[] = [];
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" || message.type() === "warning") problems.push(message.text());
      if (message.type() === "info") notes.push(message.text());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(notes.join("\n")).toContain("link up");
    expect(problems).toEqual([]);
  });

  test("no analytics script in development", async ({ page }) => {
    await page.goto(devBaseURL);
    await expect(page.locator('script[src*="umami"]')).toHaveCount(0);
  });
});
