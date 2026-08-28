import { describe, expect, it } from "vitest";
import { EnvError, parsePublicEnv, parseServerEnv } from "./env";

/** A complete, valid public environment. Individual tests break one field at a time. */
const validPublic = {
  NEXT_PUBLIC_SITE_URL: "https://fadimuhammed.work",
  NEXT_PUBLIC_SUPABASE_URL: "https://hulswrqpouaokbrbrflk.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "a".repeat(40),
};

describe("parsePublicEnv", () => {
  it("accepts a full origin", () => {
    expect(parsePublicEnv(validPublic)).toEqual({
      ...validPublic,
      NEXT_PUBLIC_ENABLE_DESIGN_ROUTE: false,
    });
  });

  it("accepts localhost for local development", () => {
    const local = { ...validPublic, NEXT_PUBLIC_SITE_URL: "http://localhost:3000" };
    expect(parsePublicEnv(local)).toEqual({ ...local, NEXT_PUBLIC_ENABLE_DESIGN_ROUTE: false });
  });

  it("rejects a missing variable and names it", () => {
    expect(() => parsePublicEnv({})).toThrow(EnvError);
    expect(() => parsePublicEnv({})).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects a bare hostname, which is the easy mistake to make", () => {
    expect(() =>
      parsePublicEnv({ ...validPublic, NEXT_PUBLIC_SITE_URL: "fadimuhammed.work" }),
    ).toThrow(EnvError);
  });

  it("points at .env.example so the failure is actionable", () => {
    expect(() => parsePublicEnv({})).toThrow(/\.env\.example/);
  });
});

describe("the /design flag", () => {
  it("defaults to off when unset", () => {
    expect(parsePublicEnv(validPublic).NEXT_PUBLIC_ENABLE_DESIGN_ROUTE).toBe(false);
  });

  it('is on only for the exact string "true"', () => {
    const on = parsePublicEnv({ ...validPublic, NEXT_PUBLIC_ENABLE_DESIGN_ROUTE: "true" });
    expect(on.NEXT_PUBLIC_ENABLE_DESIGN_ROUTE).toBe(true);
  });

  it("rejects a value that is neither true nor false rather than guessing", () => {
    // Asserted on the message, not just the type: with a valid rest-of-environment
    // this can only fail for the reason under test.
    expect(() =>
      parsePublicEnv({ ...validPublic, NEXT_PUBLIC_ENABLE_DESIGN_ROUTE: "yes" }),
    ).toThrow(/NEXT_PUBLIC_ENABLE_DESIGN_ROUTE/);
  });
});

describe("parseServerEnv", () => {
  const validServer = {
    SUPABASE_SERVICE_ROLE_KEY: "b".repeat(40),
    REVALIDATE_SECRET: "c".repeat(64),
  };

  it("defaults NODE_ENV to development when unset", () => {
    expect(parseServerEnv(validServer)).toEqual({
      ...validServer,
      NODE_ENV: "development",
    });
  });

  it("accepts the three known environments", () => {
    for (const NODE_ENV of ["development", "test", "production"] as const) {
      expect(parseServerEnv({ ...validServer, NODE_ENV })).toEqual({ ...validServer, NODE_ENV });
    }
  });

  it("rejects an unknown environment", () => {
    expect(() => parseServerEnv({ ...validServer, NODE_ENV: "staging" })).toThrow(EnvError);
  });

  it("requires the service-role key and names it", () => {
    expect(() => parseServerEnv({})).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("requires a revalidation secret long enough to be worth checking", () => {
    expect(() => parseServerEnv({ ...validServer, REVALIDATE_SECRET: "short" })).toThrow(
      /REVALIDATE_SECRET/,
    );
  });
});
