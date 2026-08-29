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

const { getSiteSettings } = await import("./queries");

describe("with no database configured", () => {
  it("answers null for the site settings rather than throwing", async () => {
    // The home page is statically prerendered, so a throw here does not degrade one
    // section — it fails the build. Null is a state every caller already handles,
    // because the row can also simply not be seeded yet.
    await expect(getSiteSettings()).resolves.toBeNull();
  });
});
