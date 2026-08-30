"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Chip } from "@/components/ui/tag";
import type { Achievement, AchievementType } from "@/lib/content/queries";
import { useFlip } from "@/lib/hooks/use-flip";
import { useQueryFilter } from "@/lib/hooks/use-query-filter";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import {
  ACHIEVEMENT_TYPES,
  isAchievementType,
  toHops,
  TYPE_LABELS,
} from "@/lib/achievements/timeline";
import { Hop } from "./hop";

/**
 * The route, and the two things that can change it: the filter chips and the URL.
 *
 * The filter is held in the query rather than in state — see use-query-filter — and the
 * whole set is already on the page, so a chip never waits for a round trip.
 */

const QUERY_KEY = "hop";

export function Timeline({ achievements }: { achievements: Achievement[] }) {
  const [raw, setFilter] = useQueryFilter(QUERY_KEY);
  // An unknown value in the query is not a filter, so it falls back to the whole route
  // rather than to an empty one.
  const type = isAchievementType(raw) ? raw : null;
  const listRef = useRef<HTMLUListElement | null>(null);
  const printed = useRef<Set<string>>(new Set());
  const reducedMotion = useReducedMotion();

  const hops = useMemo(() => toHops(achievements, type), [achievements, type]);
  const measure = useFlip({ containerRef: listRef, itemSelector: ".hop", key: hops });

  /** Measure before the list changes, so the FLIP has a "first" to invert from. */
  const select = useCallback(
    (next: AchievementType | null) => {
      measure();
      setFilter(next);
    },
    [measure, setFilter],
  );

  /**
   * Entries print as they enter the viewport (B5), once each. Re-printing on every pass
   * would make scrolling back up the list an event, which it is not.
   *
   * The observer's root is the list's own scroll container, because the list scrolls
   * inside the deck rather than with it.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!list || reducedMotion) return;

    list.dataset.printing = "";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLLIElement;
          printed.current.add(element.dataset.slug ?? "");
          element.dataset.printed = "";
          observer.unobserve(element);
        }
      },
      { root: list, threshold: 0.15 },
    );

    for (const element of list.querySelectorAll<HTMLLIElement>(".hop")) {
      // Anything already printed stays printed across a filter change.
      if (printed.current.has(element.dataset.slug ?? "")) element.dataset.printed = "";
      else observer.observe(element);
    }

    return () => observer.disconnect();
  }, [hops, reducedMotion]);

  return (
    <>
      <div className="hop-filters" role="group" aria-label="Filter by type">
        <Chip selected={type === null} onClick={() => select(null)}>
          All
        </Chip>
        {ACHIEVEMENT_TYPES.map((value) => (
          <Chip key={value} selected={type === value} onClick={() => select(value)}>
            {TYPE_LABELS[value]}
          </Chip>
        ))}
      </div>

      {hops.length === 0 ? (
        <p className="hop-empty text-body text-ink">
          No hops match.{" "}
          <button type="button" className="hop-empty__clear" onClick={() => select(null)}>
            Clear filters
          </button>
          .
        </p>
      ) : null}

      <ul
        ref={listRef}
        className="hop-list"
        data-inner-scroll
        aria-label={type ? `${TYPE_LABELS[type]} entries` : "All entries"}
      >
        {hops.map((hop) => (
          <Hop key={hop.entry.slug} hop={hop} />
        ))}
      </ul>
    </>
  );
}
