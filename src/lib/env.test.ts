import { describe, expect, it } from "vitest";
import { EnvError, parsePublicEnv, parseServerEnv } from "./env";

describe("parsePublicEnv", () => {
  it("accepts a full origin", () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_SITE_URL: "https://fadimuhammed.work" })).toEqual({
      NEXT_PUBLIC_SITE_URL: "https://fadimuhammed.work",
    });
  });

  it("accepts localhost for local development", () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" })).toEqual({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
  });

  it("rejects a missing variable and names it", () => {
    expect(() => parsePublicEnv({})).toThrow(EnvError);
    expect(() => parsePublicEnv({})).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  it("rejects a bare hostname, which is the easy mistake to make", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_SITE_URL: "fadimuhammed.work" })).toThrow(EnvError);
  });

  it("points at .env.example so the failure is actionable", () => {
    expect(() => parsePublicEnv({})).toThrow(/\.env\.example/);
  });
});

describe("parseServerEnv", () => {
  it("defaults NODE_ENV to development when unset", () => {
    expect(parseServerEnv({})).toEqual({ NODE_ENV: "development" });
  });

  it("accepts the three known environments", () => {
    for (const NODE_ENV of ["development", "test", "production"] as const) {
      expect(parseServerEnv({ NODE_ENV })).toEqual({ NODE_ENV });
    }
  });

  it("rejects an unknown environment", () => {
    expect(() => parseServerEnv({ NODE_ENV: "staging" })).toThrow(EnvError);
  });
});
