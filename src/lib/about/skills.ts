import type { Skill } from "@/lib/content/queries";

/**
 * The skill filter, as data.
 *
 * B2 item 6 asks for skills in two groups, where tapping one filters the Products and
 * Engineering cards live — "so every skill is backed by work". That promise is the whole
 * reason this is more than a tag cloud, and it is also the constraint: a skill with no
 * project behind it cannot be tapped, because tapping it could only ever empty the deck.
 *
 * Which is why only the skills that name a project are published today. The rest are in
 * the table, unpublished, waiting for work to point at.
 */

export type SkillGroup = { category: Skill["category"]; label: string; skills: Skill[] };

/**
 * Telecom first.
 *
 * The site's argument (B1) is one engineer who understands systems from RF up to the
 * product, and the reader arrives at About having just seen two shipped products and a
 * hackathon win. Leading with software here would restate what they already believe;
 * leading with telecom is the half the rest of the page has not yet shown.
 */
const GROUP_LABELS: Array<{ category: Skill["category"]; label: string }> = [
  { category: "telecom", label: "Telecom and networks" },
  { category: "software", label: "Software and product" },
];

/** The two groups, in order, with empty ones dropped rather than shown as empty headings. */
export function groupSkills(skills: readonly Skill[]): SkillGroup[] {
  return GROUP_LABELS.map(({ category, label }) => ({
    category,
    label,
    skills: skills.filter((skill) => skill.category === category),
  })).filter((group) => group.skills.length > 0);
}

/** The slugs a skill claims as evidence. `linked_slugs` is text[], so it is never null. */
export function evidenceFor(skills: readonly Skill[], slug: string | null): string[] | null {
  if (!slug) return null;
  const skill = skills.find((entry) => entry.slug === slug);
  return skill ? [...skill.linked_slugs] : null;
}

/**
 * Whether a piece of work survives the active skill filter.
 *
 * No filter means everything shows. A filter naming a skill nobody has is treated as no
 * filter rather than as an empty result: a hand-edited URL should not be able to make the
 * page look like there is no work.
 */
export function matchesSkill(
  skills: readonly Skill[],
  activeSlug: string | null,
  workSlug: string,
): boolean {
  const evidence = evidenceFor(skills, activeSlug);
  if (evidence === null) return true;
  return evidence.includes(workSlug);
}

/** The skill the query names, or null when it names nothing we publish. */
export function resolveSkill(skills: readonly Skill[], raw: string): Skill | null {
  if (!raw) return null;
  return skills.find((skill) => skill.slug === raw) ?? null;
}

/**
 * How many pieces of work a skill points at.
 *
 * Used to decide whether a tag is a control at all. A published skill always has at least
 * one, but the count is read from the data rather than assumed, so an editor unpublishing
 * the last project a skill names degrades to a plain tag instead of a dead button.
 */
export function evidenceCount(skill: Skill): number {
  return skill.linked_slugs.length;
}
