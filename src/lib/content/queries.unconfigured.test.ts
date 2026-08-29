import { describe, expect, it, vi } from "vitest";

/**
 * What the data layer does with no database configured.
 *
 * Its own file because `isSupabaseConfigured` is decided when the module loads, so the
 * two states cannot be exercised from one mock. This is the state CI and a clean
 * checkout are always in, and it is the one a developer with a working `.env.local`
 * never sees — which is exactly how the hero shipped a build that CI could not complete.
 */

vi.mock("next/cache", () => ({
  unstable_cache: <T>(fn: T) => fn,
}));

vi.mock("@/lib/supabase/public", () => ({
  isSupabaseConfigured: false,
  createPublicClient: () => {
    throw new Error("Supabase is not configured.");
  },
}));

const queries = await import("./queries");

describe("with no database configured", () => {
  it("answers null for the site settings rather than throwing", async () => {
    // The home page is statically prerendered, so a throw here does not degrade one
    // section — it fails the build. Null is a state every caller already handles,
    // because the row can also simply not be seeded yet.
    await expect(queries.getSiteSettings()).resolves.toBeNull();
  });

  /**
   * Every fetcher, by name, rather than a list someone has to remember to extend.
   *
   * Part 8 added the guard to five fetchers and missed two, because the script that
   * wrote them failed halfway and the count still looked right. CI found it. This is
   * what makes the next omission fail in a second rather than in a build log.
   */
  const listFetchers = [
    "getProducts",
    "getEngineeringProjects",
    "getFeaturedIn",
    "getSkills",
    "getCertifications",
    "getExperience",
  ] as const;

  it.each(listFetchers)("answers with an empty list from %s", async (name) => {
    const fetcher = queries[name] as () => Promise<unknown[]>;
    await expect(fetcher()).resolves.toEqual([]);
  });

  it("answers with an empty list for achievements, which filters in memory", async () => {
    await expect(queries.getAchievements()).resolves.toEqual([]);
  });

  it("answers null for a single product rather than throwing", async () => {
    await expect(queries.getProduct("rubric")).resolves.toBeNull();
  });

  it("covers every exported fetcher, so a new one cannot be forgotten", () => {
    const exported = Object.keys(queries).filter(
      (key) => key.startsWith("get") && typeof queries[key as keyof typeof queries] === "function",
    );
    const covered = [
      ...listFetchers,
      "getSiteSettings",
      "getAchievements",
      "getProduct",
      "getEngineeringProject",
    ];
    expect(exported.filter((name) => !covered.includes(name))).toEqual([]);
  });
});
