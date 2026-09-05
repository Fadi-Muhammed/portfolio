/**
 * The deck, in order (A7: default, A8: About included).
 *
 * One list, used by everything: the sections themselves, the rail, the nav, the command
 * palette in Part 6, and the footer route recap in Part 13. Order is meaningful here —
 * it is the sequence a visitor walks, which is what makes the hop numbers real
 * information rather than decoration.
 *
 * `teaser` appears twice: as the peek strip under the previous section, and as this
 * section's own subheading once it is active. It reads as a promise on the way in and as
 * a description on arrival, so it has to work as both.
 *
 * Teasers deliberately describe rather than count. B3's examples count ("12 engineering
 * projects"), but a count has to be maintained forever and reads badly while a section
 * is still filling up.
 */

export type SectionId =
  "hero" | "products" | "engineering" | "achievements" | "featured-in" | "about" | "contact";

export type DeckSection = {
  id: SectionId;
  /** Short name for the rail, the peek strip and the document title. */
  name: string;
  /** One line. Shown as the peek and as the section's subheading. */
  teaser: string;
};

export const SECTIONS: readonly DeckSection[] = [
  {
    id: "hero",
    name: "Home",
    teaser: "Telecommunications and network engineer who ships products.",
  },
  {
    id: "products",
    name: "Products",
    teaser: "What I've built and shipped.",
  },
  {
    id: "engineering",
    name: "Engineering",
    teaser: "Hardware and network work from the lab.",
  },
  {
    id: "achievements",
    name: "Achievements",
    teaser: "Stages, competitions and programmes.",
  },
  {
    id: "featured-in",
    name: "Featured in",
    teaser: "Where the work has shown up.",
  },
  {
    id: "about",
    name: "About",
    teaser: "Skills, certifications and the timeline.",
  },
  {
    id: "contact",
    name: "Contact",
    teaser: "Open to freelance work and collaborations.",
  },
] as const;

export const SECTION_IDS = SECTIONS.map((section) => section.id);

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === "string" && (SECTION_IDS as string[]).includes(value);
}

export function sectionIndex(id: SectionId): number {
  return SECTIONS.findIndex((section) => section.id === id);
}

/** The section a hash points at, or null. Accepts "#products" and "products". */
export function sectionFromHash(hash: string): SectionId | null {
  const id = hash.replace(/^#/, "");
  return isSectionId(id) ? id : null;
}
