import { describe, expect, it } from "vitest";
import type { Achievement } from "@/lib/content/queries";
import {
  ACHIEVEMENT_TYPES,
  formatPlace,
  formatWhen,
  hopLinks,
  hopNumber,
  isAchievementType,
  showsTitle,
  sortNewestFirst,
  toHops,
} from "./timeline";

/**
 * The parts of the timeline that can be wrong invisibly: the order of the route, where
 * the numbering starts, and how a date with only a month behind it is printed.
 */

function entry(overrides: Partial<Achievement> & { slug: string }): Achievement {
  return {
    id: overrides.slug,
    slug: overrides.slug,
    title: "An entry",
    type: "hackathon",
    event_name: "An event",
    role: null,
    result: null,
    date: null,
    city: null,
    country: null,
    summary: null,
    links: {},
    media: {},
    featured: false,
    published: true,
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("sortNewestFirst", () => {
  it("puts the most recent hop first", () => {
    const sorted = sortNewestFirst([
      entry({ slug: "old", date: "2025-07-01" }),
      entry({ slug: "new", date: "2026-08-01" }),
      entry({ slug: "middle", date: "2026-02-01" }),
    ]);
    expect(sorted.map((e) => e.slug)).toEqual(["new", "middle", "old"]);
  });

  it("sorts undated entries last rather than dropping them", () => {
    const sorted = sortNewestFirst([
      entry({ slug: "undated" }),
      entry({ slug: "dated", date: "2020-01-01" }),
    ]);
    expect(sorted.map((e) => e.slug)).toEqual(["dated", "undated"]);
  });

  it("falls back to sort_order when two entries share a date", () => {
    const sorted = sortNewestFirst([
      entry({ slug: "second", date: "2026-02-01", sort_order: 20 }),
      entry({ slug: "first", date: "2026-02-01", sort_order: 10 }),
    ]);
    expect(sorted.map((e) => e.slug)).toEqual(["first", "second"]);
  });

  it("does not mutate what it is given", () => {
    const input = [
      entry({ slug: "a", date: "2020-01-01" }),
      entry({ slug: "b", date: "2026-01-01" }),
    ];
    sortNewestFirst(input);
    expect(input.map((e) => e.slug)).toEqual(["a", "b"]);
  });
});

describe("toHops", () => {
  const route = [
    entry({ slug: "hack", type: "hackathon", date: "2026-08-01" }),
    entry({ slug: "award", type: "award", date: "2026-04-01" }),
    entry({ slug: "talk", type: "talk", date: "2026-02-01" }),
  ];

  it("numbers the whole route from the most recent hop", () => {
    expect(toHops(route, null).map((hop) => [hop.number, hop.entry.slug])).toEqual([
      [1, "hack"],
      [2, "award"],
      [3, "talk"],
    ]);
  });

  it("renumbers a filtered route, because a filtered view is a different route", () => {
    const talks = toHops(route, "talk");
    expect(talks).toHaveLength(1);
    // Third overall, but the first hop of the route actually taken.
    expect(talks[0].number).toBe(1);
  });

  it("answers with nothing for a type that has no entries", () => {
    expect(toHops(route, "program")).toEqual([]);
  });
});

describe("hopNumber", () => {
  it("pads to two digits so the numbers form a column", () => {
    expect(hopNumber(1)).toBe("01");
    expect(hopNumber(12)).toBe("12");
  });
});

describe("formatWhen", () => {
  it("prints the month and year, never the day", () => {
    // Part 4 stores month-precision dates as the first of the month, so a day here
    // would be a precision the content does not have.
    expect(formatWhen("2026-08-01")).toBe("Aug 2026");
    expect(formatWhen("2025-11-01")).toBe("Nov 2025");
  });

  it("answers null for a missing or unparseable date", () => {
    expect(formatWhen(null)).toBeNull();
    expect(formatWhen("August 2026")).toBeNull();
  });
});

describe("formatPlace", () => {
  it("joins the city and country", () => {
    expect(formatPlace("Doha", "Qatar")).toBe("Doha, Qatar");
  });

  it("prints whichever half exists, and nothing when neither does", () => {
    expect(formatPlace("Toronto", null)).toBe("Toronto");
    expect(formatPlace(null, "Canada")).toBe("Canada");
    expect(formatPlace(null, null)).toBeNull();
  });
});

describe("showsTitle", () => {
  it("hides a title that only restates the event", () => {
    expect(showsTitle("DMZ Basecamp 2025", "DMZ Basecamp")).toBe(false);
  });

  it("keeps a title that says something else", () => {
    expect(showsTitle("Capture the flag, second edition", "12th National Cyber Drill 2025")).toBe(
      true,
    );
  });

  it("keeps the title when there is no event to compare it with", () => {
    expect(showsTitle("A talk", null)).toBe(true);
  });
});

describe("hopLinks", () => {
  it("labels each link by what it leads to, in a fixed order", () => {
    expect(hopLinks({ repo: "https://example.com/repo", product: "/products/rubric" })).toEqual([
      { key: "product", label: "See the product", href: "/products/rubric", external: false },
      { key: "repo", label: "See the code", href: "https://example.com/repo", external: true },
    ]);
  });

  it("marks a site-relative link as internal", () => {
    expect(hopLinks({ product: "/products/eshrahli" })[0].external).toBe(false);
  });

  it("survives anything the jsonb column might hold", () => {
    expect(hopLinks(null)).toEqual([]);
    expect(hopLinks({})).toEqual([]);
    expect(hopLinks("not an object")).toEqual([]);
    expect(hopLinks({ coverage: "" })).toEqual([]);
    expect(hopLinks({ unknown_key: "https://example.com" })).toEqual([]);
  });
});

describe("the chip set", () => {
  it("is the five types the schema allows", () => {
    expect(ACHIEVEMENT_TYPES).toHaveLength(5);
    expect(ACHIEVEMENT_TYPES.every(isAchievementType)).toBe(true);
  });

  it("rejects anything else, so a hand-typed query cannot filter to nothing", () => {
    expect(isAchievementType("talks")).toBe(false);
    expect(isAchievementType(null)).toBe(false);
  });
});
