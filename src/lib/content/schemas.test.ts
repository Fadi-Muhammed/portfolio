import { describe, expect, it } from "vitest";
import {
  achievementSchema,
  engineeringProjectSchema,
  experienceSchema,
  productSchema,
  siteSettingsSchema,
  skillSchema,
} from "./schemas";

/**
 * These schemas exist to stop bad content reaching Postgres with a legible message, so
 * the tests are about the mistakes a person actually makes when hand-editing JSON:
 * a wrong enum, a human-readable date, a capitalised slug, an absent field written as
 * missing rather than null.
 */

const validProduct = {
  slug: "rubric",
  sort_order: 10,
  published: true,
  title: "Rubric",
  summary: "One shared pool of applicants.",
  body: null,
  stack: ["TypeScript"],
  tags: [],
  cover_image_path: null,
  gallery: [],
  live_url: "https://rubric-gamma.vercel.app",
  repo_url: null,
  demo_video_url: null,
  status_check_url: "https://rubric-gamma.vercel.app",
  outcome: null,
  metrics: {},
};

describe("slugs", () => {
  it("accepts lowercase hyphenated words", () => {
    expect(productSchema.safeParse(validProduct).success).toBe(true);
  });

  it.each([
    ["Rubric", "capitals"],
    ["rubric project", "spaces"],
    ["rubric--project", "doubled hyphens"],
    ["-rubric", "a leading hyphen"],
    ["rubric_project", "underscores"],
  ])("rejects %s (%s)", (slug) => {
    expect(productSchema.safeParse({ ...validProduct, slug }).success).toBe(false);
  });
});

describe("nulls versus missing", () => {
  it("accepts an explicit null for a known gap", () => {
    expect(productSchema.safeParse({ ...validProduct, summary: null }).success).toBe(true);
  });

  it("rejects an absent key, so a typo cannot pass as a gap", () => {
    const withoutSummary: Record<string, unknown> = { ...validProduct };
    delete withoutSummary.summary;
    expect(productSchema.safeParse(withoutSummary).success).toBe(false);
  });

  it("rejects an empty string, which is neither a value nor a gap", () => {
    expect(productSchema.safeParse({ ...validProduct, summary: "" }).success).toBe(false);
  });
});

describe("urls", () => {
  it("rejects a bare hostname", () => {
    expect(productSchema.safeParse({ ...validProduct, live_url: "rubric.app" }).success).toBe(
      false,
    );
  });
});

describe("enums", () => {
  it("accepts a known engineering project type", () => {
    const project = {
      slug: "street-light",
      sort_order: 10,
      published: true,
      title: "Street light",
      summary: null,
      body: null,
      type: "lab",
      concepts: [],
      tools: [],
      cover_image_path: null,
      gallery: [],
      report_path: null,
      repo_url: null,
      interactive_widget: null,
      data: {},
    };
    expect(engineeringProjectSchema.safeParse(project).success).toBe(true);
    expect(engineeringProjectSchema.safeParse({ ...project, type: "labratory" }).success).toBe(
      false,
    );
  });

  it("rejects an unknown achievement type rather than storing it", () => {
    const achievement = {
      slug: "some-talk",
      sort_order: 10,
      published: true,
      title: "A talk",
      type: "keynote",
      event_name: null,
      role: null,
      result: null,
      date: null,
      city: null,
      country: null,
      summary: null,
      links: {},
      media: {},
      featured: false,
    };
    expect(achievementSchema.safeParse(achievement).success).toBe(false);
    expect(achievementSchema.safeParse({ ...achievement, type: "talk" }).success).toBe(true);
  });
});

describe("dates", () => {
  const base = {
    slug: "role",
    sort_order: 10,
    published: true,
    org: "Somewhere",
    role: null,
    type: "job" as const,
    start_date: "2025-03-01",
    end_date: null,
    location: null,
    summary: null,
    highlights: [],
  };

  it("accepts an ISO date and a null end date meaning present", () => {
    expect(experienceSchema.safeParse(base).success).toBe(true);
  });

  it.each(["Mar 2025", "2025-3-1", "01/03/2025", "2025"])("rejects %s", (start_date) => {
    expect(experienceSchema.safeParse({ ...base, start_date }).success).toBe(false);
  });
});

describe("skills", () => {
  const base = {
    slug: "embedded-systems",
    sort_order: 10,
    published: true,
    name: "Embedded systems",
    category: "telecom" as const,
    linked_slugs: ["intelligent-street-light-system"],
  };

  it("accepts slugs in linked_slugs", () => {
    expect(skillSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a linked slug that is not slug-shaped, since it must match a real row", () => {
    expect(skillSchema.safeParse({ ...base, linked_slugs: ["Street Light"] }).success).toBe(false);
  });
});

describe("site settings", () => {
  it("requires a timezone, because the contact section prints a local time", () => {
    const settings = {
      tagline: "Unemployed & jobless, but not lost.",
      eyebrow: null,
      quote: null,
      quote_author: null,
      availability: null,
      email: null,
      socials: {},
      cv_path: null,
      hero_primary_label: null,
      hero_secondary_label: null,
      timezone: "Asia/Qatar",
      maintenance_message: null,
    };
    expect(siteSettingsSchema.safeParse(settings).success).toBe(true);
    expect(siteSettingsSchema.safeParse({ ...settings, timezone: "" }).success).toBe(false);
  });
});
