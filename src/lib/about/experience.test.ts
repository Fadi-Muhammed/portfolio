import { describe, expect, it } from "vitest";
import type { Experience } from "@/lib/content/queries";
import { isOngoing, sortExperience } from "./experience";
import { formatMonth, formatSpan } from "./dates";

const TODAY = new Date("2026-08-30T00:00:00Z");

function entry(overrides: Partial<Experience> & { slug: string }): Experience {
  return {
    id: overrides.slug,
    org: "An org",
    role: "A role",
    type: "job",
    start_date: null,
    end_date: null,
    location: null,
    summary: null,
    highlights: [],
    logo_path: null,
    published: true,
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("isOngoing", () => {
  it("counts a row with no end date", () => {
    expect(isOngoing(entry({ slug: "now", start_date: "2025-03-01" }), TODAY)).toBe(true);
  });

  it("counts a row whose end date has not arrived — a degree, expected 2027", () => {
    expect(
      isOngoing(entry({ slug: "degree", start_date: "2024-01-01", end_date: "2027-05-01" }), TODAY),
    ).toBe(true);
  });

  it("does not count a row that has finished", () => {
    expect(
      isOngoing(entry({ slug: "past", start_date: "2025-09-01", end_date: "2025-12-31" }), TODAY),
    ).toBe(false);
  });
});

describe("sortExperience", () => {
  const rows = [
    entry({ slug: "finished-recent", start_date: "2025-09-01", end_date: "2025-12-31" }),
    entry({ slug: "degree", start_date: "2024-01-01", end_date: "2027-05-01" }),
    entry({ slug: "finished-older", start_date: "2024-06-01", end_date: "2025-09-30" }),
    entry({ slug: "current-job", start_date: "2025-03-01" }),
  ];

  it("puts what is still running first, however long ago it started", () => {
    // The degree began before two of the finished roles and still outranks them.
    expect(sortExperience(rows, TODAY).map((e) => e.slug)).toEqual([
      "current-job",
      "degree",
      "finished-recent",
      "finished-older",
    ]);
  });

  it("does not mutate what it is given", () => {
    const before = rows.map((e) => e.slug);
    sortExperience(rows, TODAY);
    expect(rows.map((e) => e.slug)).toEqual(before);
  });

  it("sorts an entry with no start date last rather than dropping it", () => {
    const sorted = sortExperience(
      [entry({ slug: "undated", end_date: "2020-01-01" }), ...rows],
      TODAY,
    );
    expect(sorted.at(-1)?.slug).toBe("undated");
  });
});

describe("formatMonth", () => {
  it("prints month and year, never a day", () => {
    expect(formatMonth("2024-01-01")).toBe("Jan 2024");
    expect(formatMonth(null)).toBeNull();
    expect(formatMonth("January 2024")).toBeNull();
  });
});

describe("formatSpan", () => {
  it("marks a future end date as expected rather than as finished", () => {
    expect(formatSpan("2024-01-01", "2027-05-01", TODAY)).toBe("Jan 2024 — May 2027 (expected)");
  });

  it("reads an open row as present", () => {
    expect(formatSpan("2025-03-01", null, TODAY)).toBe("Mar 2025 — present");
  });

  it("prints a finished span plainly", () => {
    expect(formatSpan("2025-09-01", "2025-12-31", TODAY)).toBe("Sep 2025 — Dec 2025");
  });

  it("survives a row with no dates at all", () => {
    expect(formatSpan(null, null, TODAY)).toBe("");
  });
});
