import { describe, expect, it } from "vitest";
import { SECTIONS } from "./sections";
import {
  documentTitle,
  intentForKey,
  mostVisible,
  nextSection,
  previousSection,
  railLabel,
  resolveIntent,
  shouldMount,
} from "./state";

describe("moving through the deck", () => {
  it("walks forward and back", () => {
    expect(nextSection("hero")).toBe("products");
    expect(previousSection("products")).toBe("hero");
  });

  it("does not wrap, because a deck has an end", () => {
    expect(previousSection("hero")).toBeNull();
    expect(nextSection("contact")).toBeNull();
  });

  it("resolves Home and End, and reports nothing to do when already there", () => {
    expect(resolveIntent("achievements", "first")).toBe("hero");
    expect(resolveIntent("achievements", "last")).toBe("contact");
    expect(resolveIntent("hero", "first")).toBeNull();
    expect(resolveIntent("contact", "last")).toBeNull();
  });
});

describe("keys", () => {
  it.each([
    ["PageDown", "next"],
    ["PageUp", "previous"],
    ["ArrowDown", "next"],
    ["ArrowUp", "previous"],
    ["Home", "first"],
    ["End", "last"],
  ])("%s means %s", (key, intent) => {
    expect(intentForKey(key)).toBe(intent);
  });

  it("ignores keys that are not paging", () => {
    for (const key of ["a", "Enter", "Tab", "Escape", " "]) {
      expect(intentForKey(key)).toBeNull();
    }
  });
});

describe("choosing the active section", () => {
  it("picks whichever is most visible", () => {
    const ratios = new Map([
      ["hero", 0.3],
      ["products", 0.7],
    ] as const);
    expect(mostVisible(ratios)).toBe("products");
  });

  it("breaks a tie toward the earlier section, so a hop does not flicker", () => {
    const ratios = new Map([
      ["products", 0.5],
      ["engineering", 0.5],
    ] as const);
    expect(mostVisible(ratios)).toBe("products");
  });

  it("returns null when nothing is on screen at all", () => {
    expect(mostVisible(new Map())).toBeNull();
  });
});

describe("lazy mounting", () => {
  it("mounts the active section and its immediate neighbours", () => {
    expect(shouldMount("products", "engineering")).toBe(true);
    expect(shouldMount("engineering", "engineering")).toBe(true);
    expect(shouldMount("achievements", "engineering")).toBe(true);
  });

  it("leaves anything further away unmounted", () => {
    expect(shouldMount("hero", "engineering")).toBe(false);
    expect(shouldMount("contact", "engineering")).toBe(false);
  });
});

describe("labels", () => {
  it("suffixes the title with the section", () => {
    expect(documentTitle("products")).toBe("Fadi Muhammed — Products");
  });

  it("leaves the hero unsuffixed, because 'Home' says nothing", () => {
    expect(documentTitle("hero")).toBe("Fadi Muhammed");
  });

  it("reads the rail in the site's data voice", () => {
    expect(railLabel("engineering")).toBe(`hop 3 of ${SECTIONS.length} · engineering`);
    expect(railLabel("hero")).toBe(`hop 1 of ${SECTIONS.length} · home`);
  });
});
