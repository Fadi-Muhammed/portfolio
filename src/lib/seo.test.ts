import { afterEach, describe, expect, it, vi } from "vitest";
import { SITE_DESCRIPTION, absoluteUrl, pageMetadata } from "./seo";

/**
 * What the site says about itself to a machine.
 *
 * The indexing flag gets the most attention here because it is the one value whose
 * failure is silent and expensive: a site that indexes early cannot be un-indexed on
 * request, and nothing on the page would look wrong.
 */

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("absoluteUrl", () => {
  it("makes a path absolute", () => {
    expect(absoluteUrl("/products")).toMatch(/^https?:\/\/.+\/products$/);
  });

  it("tolerates a path with no leading slash", () => {
    expect(absoluteUrl("products")).toBe(absoluteUrl("/products"));
  });

  it("writes the root one way, so the canonical tag and the sitemap agree", () => {
    expect(absoluteUrl()).toBe(absoluteUrl("/"));
    expect(absoluteUrl()).toMatch(/\/$/);
  });
});

describe("the indexing flag", () => {
  it("is off when the variable is missing, which is every environment but launch", async () => {
    vi.stubEnv("NEXT_PUBLIC_INDEXABLE", undefined);
    vi.resetModules();
    const { isIndexable, robotsRules } = await import("./seo");

    expect(isIndexable).toBe(false);
    expect(robotsRules).toMatchObject({ index: false, follow: false });
  });

  it.each(["false", "1", "yes", "TRUE", "True", ""])(
    "is off for %j, which only looks like true",
    async (value) => {
      vi.stubEnv("NEXT_PUBLIC_INDEXABLE", value);
      vi.resetModules();
      const { isIndexable } = await import("./seo");
      expect(isIndexable).toBe(false);
    },
  );

  it("is on only for the exact string true", async () => {
    vi.stubEnv("NEXT_PUBLIC_INDEXABLE", "true");
    vi.resetModules();
    const { isIndexable, robotsRules } = await import("./seo");

    expect(isIndexable).toBe(true);
    expect(robotsRules).toMatchObject({ index: true, follow: true });
  });
});

describe("pageMetadata", () => {
  const meta = pageMetadata({
    title: "Rubric",
    description: "A study companion.",
    path: "/products/rubric",
    type: "article",
  });

  it("gives the page its own canonical URL", () => {
    expect(meta.alternates?.canonical).toBe(absoluteUrl("/products/rubric"));
  });

  it("leaves the site name to the title template", () => {
    expect(meta.title).toBe("Rubric");
  });

  it("writes the name into the share tags, which have no template", () => {
    expect(meta.openGraph?.title).toBe("Rubric — Fadi Muhammed");
    expect(meta.twitter?.title).toBe("Rubric — Fadi Muhammed");
  });

  it("points Open Graph at the same URL as the canonical tag", () => {
    expect(meta.openGraph).toMatchObject({ url: absoluteUrl("/products/rubric") });
  });

  it("falls back to the site description rather than shipping an empty one", () => {
    const empty = pageMetadata({ title: "Products", description: "   ", path: "/products" });
    expect(empty.description).toBe(SITE_DESCRIPTION);
  });

  it("never names an image, which Next writes from the opengraph-image route", () => {
    // Two copies of that URL is two things to keep in step, and one of them would drift.
    expect(meta.openGraph).not.toHaveProperty("images");
    expect(meta.twitter).not.toHaveProperty("images");
  });
});
