import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The fetchers are tested against a fake client rather than the real database, because
 * what matters here is not that Supabase works but that every read asks the right
 * question: published rows only, ordered deliberately, and failing loudly with the
 * table named rather than returning an empty list that looks like "no work yet".
 */

// unstable_cache wraps each fetcher at module load. Unwrapped here so the tests call
// the function rather than a cache shell.
vi.mock("next/cache", () => ({
  unstable_cache: <T>(fn: T) => fn,
}));

const createPublicClient = vi.fn();
vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => createPublicClient(),
  isSupabaseConfigured: true,
}));

type Result = { data: unknown; error: { message: string } | null };

type Recorded = {
  table: string | null;
  filters: Array<[string, unknown]>;
  orders: Array<[string, unknown]>;
};

/**
 * A chainable stand-in for the query builder. It is thenable, so `await` on the chain
 * resolves to the given result exactly as the real client does.
 */
function fakeClient(result: Result) {
  const recorded: Recorded = { table: null, filters: [], orders: [] };

  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      recorded.filters.push([column, value]);
      return builder;
    },
    order: (column: string, options: unknown) => {
      recorded.orders.push([column, options]);
      return builder;
    },
    maybeSingle: () => Promise.resolve(result),
    then: <T>(resolve: (value: Result) => T) => Promise.resolve(result).then(resolve),
  };

  const client = {
    from: (table: string) => {
      recorded.table = table;
      return builder;
    },
  };

  createPublicClient.mockReturnValue(client);
  return recorded;
}

const { getAchievements, getExperience, getProduct, getProducts, getSiteSettings } =
  await import("./queries");

beforeEach(() => {
  createPublicClient.mockReset();
});

describe("getProducts", () => {
  it("asks for published rows in the site's manual order", async () => {
    const recorded = fakeClient({ data: [], error: null });
    await getProducts();

    expect(recorded.table).toBe("products");
    expect(recorded.filters).toContainEqual(["published", true]);
    expect(recorded.orders).toContainEqual(["sort_order", { ascending: true }]);
  });

  it("returns an empty array rather than null when there is nothing", async () => {
    fakeClient({ data: null, error: null });
    await expect(getProducts()).resolves.toEqual([]);
  });

  it("throws with the table named instead of rendering as empty", async () => {
    fakeClient({ data: null, error: { message: "permission denied" } });
    await expect(getProducts()).rejects.toThrow(/products.*permission denied/);
  });
});

describe("getProduct", () => {
  it("finds by slug", async () => {
    fakeClient({ data: [{ slug: "rubric", title: "Rubric" }], error: null });
    await expect(getProduct("rubric")).resolves.toMatchObject({ title: "Rubric" });
  });

  it("returns null for a slug that does not exist, rather than undefined", async () => {
    fakeClient({ data: [{ slug: "rubric" }], error: null });
    await expect(getProduct("nope")).resolves.toBeNull();
  });
});

describe("getAchievements", () => {
  const rows = [
    { slug: "a", type: "talk" },
    { slug: "b", type: "competition" },
    { slug: "c", type: "talk" },
  ];

  it("reads newest first and keeps undated entries last", async () => {
    const recorded = fakeClient({ data: rows, error: null });
    await getAchievements();

    expect(recorded.orders).toContainEqual(["date", { ascending: false, nullsFirst: false }]);
  });

  it("returns everything when no filter is given", async () => {
    fakeClient({ data: rows, error: null });
    await expect(getAchievements()).resolves.toHaveLength(3);
  });

  it("filters by type", async () => {
    fakeClient({ data: rows, error: null });
    const talks = await getAchievements("talk");
    expect(talks.map((entry) => entry.slug)).toEqual(["a", "c"]);
  });
});

describe("getExperience", () => {
  it("reads most recent first", async () => {
    const recorded = fakeClient({ data: [], error: null });
    await getExperience();

    expect(recorded.table).toBe("experience");
    expect(recorded.orders).toContainEqual(["start_date", { ascending: false, nullsFirst: false }]);
  });
});

describe("getSiteSettings", () => {
  it("returns null before the row has been seeded", async () => {
    fakeClient({ data: null, error: null });
    await expect(getSiteSettings()).resolves.toBeNull();
  });

  it("does not filter on published, because the row has no such column", async () => {
    const recorded = fakeClient({ data: { tagline: "x" }, error: null });
    await getSiteSettings();

    expect(recorded.filters).toEqual([]);
  });
});
