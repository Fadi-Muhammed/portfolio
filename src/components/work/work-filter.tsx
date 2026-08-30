"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useDeck } from "@/components/deck/deck-provider";
import type { Skill } from "@/lib/content/queries";
import { matchesSkill, resolveSkill } from "@/lib/about/skills";
import { SECTIONS, type SectionId } from "@/lib/deck/sections";
import { useFlip } from "@/lib/hooks/use-flip";
import { useQueryFilter } from "@/lib/hooks/use-query-filter";

/**
 * The skill filter, shared between About and the two sections it filters.
 *
 * B2 item 6 asks that tapping a skill in About re-lay out the Products and Engineering
 * cards live. Those live two and three stops up the deck, so the filter cannot belong to
 * any of the three sections — it belongs above all of them, which is the page.
 *
 * The cards themselves stay server components. Only these wrappers are client code: they
 * take an already-rendered card as `children` and decide whether it appears. That keeps
 * the case study bodies, the images and the card markup out of the JavaScript bundle,
 * which is what B12's budget cares about.
 *
 * Selecting a skill also hops to the work it names. That is not decoration: the deck
 * mounts only the active section and its neighbours (B3, for the performance reason), and
 * About is four stops from Products — so a tap there re-lays out cards that are not in the
 * document. Without the hop the control appears to do nothing, which is the one thing a
 * control proving a claim must not do. Clearing does not hop: you are already looking at
 * what you wanted to see.
 */

const QUERY_KEY = "skill";

type WorkFilterValue = {
  /** The selected skill, or null. Resolved against published skills, never trusted raw. */
  skill: Skill | null;
  matches: (workSlug: string) => boolean;
  select: (slug: string | null) => void;
};

const WorkFilterContext = createContext<WorkFilterValue | null>(null);

export function WorkFilterProvider({
  skills,
  workSections,
  children,
}: {
  skills: Skill[];
  /** Which deck stop each piece of work lives on, so a skill can lead to its evidence. */
  workSections: Record<string, SectionId>;
  children: ReactNode;
}) {
  const [raw, setFilter] = useQueryFilter(QUERY_KEY);
  const { hopTo } = useDeck();
  const skill = useMemo(() => resolveSkill(skills, raw), [skills, raw]);

  // One FLIP across the whole document: a skill change moves cards in two different deck
  // sections at once, so there is no single container to measure.
  const measure = useFlip({ itemSelector: "[data-slug][data-work-item]", key: skill?.slug ?? "" });

  const select = useCallback(
    (slug: string | null) => {
      measure();

      // Tapping the selected skill again clears it, so the control is its own undo.
      const next = slug === skill?.slug ? null : slug;
      setFilter(next);
      if (!next) return;

      // Then go where the evidence is: the earliest stop on the deck that has any of it.
      const evidence = skills.find((entry) => entry.slug === next)?.linked_slugs ?? [];
      const destinations = new Set(
        evidence.map((workSlug) => workSections[workSlug]).filter(Boolean),
      );
      const destination = SECTIONS.find((section) => destinations.has(section.id));
      if (destination) hopTo(destination.id);
    },
    [measure, setFilter, skill, skills, workSections, hopTo],
  );

  const value = useMemo<WorkFilterValue>(
    () => ({
      skill,
      matches: (workSlug: string) => matchesSkill(skills, skill?.slug ?? null, workSlug),
      select,
    }),
    [skill, skills, select],
  );

  return <WorkFilterContext.Provider value={value}>{children}</WorkFilterContext.Provider>;
}

export function useWorkFilter(): WorkFilterValue {
  const context = useContext(WorkFilterContext);
  if (!context) throw new Error("useWorkFilter must be used inside <WorkFilterProvider>");
  return context;
}

/**
 * A list whose items can be filtered out, with the empty state that follows.
 *
 * `slugs` is the full set rather than what is rendered, so the list can tell the
 * difference between "this section has no content" — which is the section's own business —
 * and "the filter hid all of it", which needs saying and needs a way back.
 */
export function FilteredWorkList({
  slugs,
  className,
  children,
  ...rest
}: {
  slugs: string[];
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLUListElement>) {
  const { skill, matches, select } = useWorkFilter();
  const anyVisible = slugs.some((slug) => matches(slug));

  if (!anyVisible && skill) {
    return (
      <p className="work-empty text-body text-ink">
        Nothing here uses {skill.name}.{" "}
        <button type="button" className="work-empty__clear" onClick={() => select(null)}>
          Clear the filter
        </button>
        .
      </p>
    );
  }

  return (
    <ul className={className} {...rest}>
      {children}
    </ul>
  );
}

/** One item. Renders the card it was given, or nothing when the filter excludes it. */
export function FilteredWorkItem({
  slug,
  className,
  children,
}: {
  slug: string;
  className?: string;
  children: ReactNode;
}) {
  const { matches } = useWorkFilter();
  if (!matches(slug)) return null;

  return (
    <li className={className} data-slug={slug} data-work-item="">
      {children}
    </li>
  );
}

/**
 * The line that says a filter is on, shown in the sections it affects.
 *
 * Without it, arriving at Products from a shared link and seeing one card of four looks
 * like the site lost something. It names the skill and offers the way out.
 */
export function WorkFilterNotice() {
  const { skill, select } = useWorkFilter();
  if (!skill) return null;

  return (
    <p className="work-notice">
      {/* The label is a label and takes the utility face; the skill is a name and keeps
          the case it was written in. Setting the whole line in `text-data` printed
          "EMBEDDED SYSTEMS", which is not what anyone called it. */}
      <span className="text-data text-muted">Filtered by</span>{" "}
      <span className="text-small text-ink">{skill.name}</span>{" "}
      <button type="button" className="work-notice__clear text-small" onClick={() => select(null)}>
        Clear
      </button>
    </p>
  );
}
