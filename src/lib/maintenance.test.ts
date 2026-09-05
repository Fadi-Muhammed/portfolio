import { describe, expect, it } from "vitest";
import { isBypass, readMaintenance, secretEquals } from "./maintenance";

/**
 * The flag that takes the site down and the key that gets Fadi back in.
 *
 * Worth testing where it cannot be seen: a bypass that silently stopped matching would
 * leave him locked out of his own site with no way to tell why, and the flag reading true
 * when it should not is the failure that takes the site down for everybody.
 */

describe("readMaintenance", () => {
  it("is off when nothing is set, which is every normal environment", () => {
    expect(readMaintenance({})).toEqual({ enabled: false, key: null });
  });

  it("is on for exactly the string true", () => {
    expect(readMaintenance({ MAINTENANCE_MODE: "true" }).enabled).toBe(true);
  });

  it.each(["1", "yes", "TRUE", "True", " true", "on", ""])(
    "is off for %j, which only looks like true",
    (value) => {
      expect(readMaintenance({ MAINTENANCE_MODE: value }).enabled).toBe(false);
    },
  );

  it("trims the key, because a copied line brings its whitespace", () => {
    expect(readMaintenance({ MAINTENANCE_BYPASS_KEY: "  s3cret  " }).key).toBe("s3cret");
  });

  it("treats a blank key as no key rather than as a key nobody can type", () => {
    expect(readMaintenance({ MAINTENANCE_BYPASS_KEY: "   " }).key).toBeNull();
  });
});

describe("secretEquals", () => {
  it("matches identical strings", () => {
    expect(secretEquals("abc123", "abc123")).toBe(true);
  });

  it("rejects a different string of the same length", () => {
    expect(secretEquals("abc123", "abc124")).toBe(false);
  });

  it("rejects a prefix, which is the case a short-circuit would leak", () => {
    expect(secretEquals("abc", "abc123")).toBe(false);
  });

  it("rejects the empty string against a real key", () => {
    expect(secretEquals("", "abc123")).toBe(false);
  });
});

describe("isBypass", () => {
  it("lets the right key through", () => {
    expect(isBypass("s3cret", "s3cret")).toBe(true);
  });

  it("refuses the wrong key", () => {
    expect(isBypass("guess", "s3cret")).toBe(false);
  });

  it("refuses everything when no key is configured, including an empty offer", () => {
    expect(isBypass("anything", null)).toBe(false);
    expect(isBypass("", null)).toBe(false);
    expect(isBypass(null, null)).toBe(false);
  });

  it("refuses a missing offer against a real key", () => {
    expect(isBypass(null, "s3cret")).toBe(false);
    expect(isBypass(undefined, "s3cret")).toBe(false);
  });
});
