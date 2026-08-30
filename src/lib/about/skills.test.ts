import { describe, expect, it } from "vitest";
import type { Skill } from "@/lib/content/queries";
import { evidenceCount, evidenceFor, groupSkills, matchesSkill, resolveSkill } from "./skills";

function skill(overrides: Partial<Skill> & { slug: string }): Skill {
  return {
    id: overrides.slug,
    name: "A skill",
    category: "software",
    linked_slugs: [],
    published: true,
    sort_order: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const skills = [
  skill({ slug: "typescript", category: "software", linked_slugs: ["rubric"] }),
  skill({
    slug: "embedded-systems",
    category: "telecom",
    linked_slugs: ["intelligent-street-light-system"],
  }),
  skill({ slug: "both", category: "telecom", linked_slugs: ["rubric", "eshrahli"] }),
];

describe("groupSkills", () => {
  it("puts telecom first, because it is the half the rest of the page has not shown", () => {
    expect(groupSkills(skills).map((group) => group.category)).toEqual(["telecom", "software"]);
  });

  it("drops a group with nothing in it rather than printing an empty heading", () => {
    const softwareOnly = groupSkills([skill({ slug: "only", category: "software" })]);
    expect(softwareOnly).toHaveLength(1);
    expect(softwareOnly[0].category).toBe("software");
  });
});

describe("matchesSkill", () => {
  it("shows everything when no skill is selected", () => {
    expect(matchesSkill(skills, null, "rubric")).toBe(true);
    expect(matchesSkill(skills, null, "anything")).toBe(true);
  });

  it("shows only the work a selected skill names", () => {
    expect(matchesSkill(skills, "typescript", "rubric")).toBe(true);
    expect(matchesSkill(skills, "typescript", "eshrahli")).toBe(false);
    expect(matchesSkill(skills, "typescript", "intelligent-street-light-system")).toBe(false);
  });

  it("handles a skill that names more than one", () => {
    expect(matchesSkill(skills, "both", "rubric")).toBe(true);
    expect(matchesSkill(skills, "both", "eshrahli")).toBe(true);
    expect(matchesSkill(skills, "both", "intelligent-street-light-system")).toBe(false);
  });

  it("treats a skill nobody has as no filter, not as an empty result", () => {
    // A hand-edited URL should not be able to make the page look like there is no work.
    expect(matchesSkill(skills, "not-a-skill", "rubric")).toBe(true);
    expect(matchesSkill(skills, "not-a-skill", "eshrahli")).toBe(true);
  });
});

describe("evidenceFor", () => {
  it("answers null when nothing is selected, which is not the same as an empty list", () => {
    expect(evidenceFor(skills, null)).toBeNull();
    expect(evidenceFor(skills, "typescript")).toEqual(["rubric"]);
  });

  it("does not hand back the row's own array", () => {
    const evidence = evidenceFor(skills, "typescript");
    evidence?.push("tampered");
    expect(skills[0].linked_slugs).toEqual(["rubric"]);
  });
});

describe("resolveSkill", () => {
  it("finds a published skill by slug and refuses anything else", () => {
    expect(resolveSkill(skills, "typescript")?.slug).toBe("typescript");
    expect(resolveSkill(skills, "")).toBeNull();
    expect(resolveSkill(skills, "nope")).toBeNull();
  });
});

describe("evidenceCount", () => {
  it("counts what a skill can actually show", () => {
    expect(evidenceCount(skills[0])).toBe(1);
    expect(evidenceCount(skills[2])).toBe(2);
    expect(evidenceCount(skill({ slug: "bare" }))).toBe(0);
  });
});
