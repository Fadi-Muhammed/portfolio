"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { Chip } from "@/components/ui/tag";
import type { Achievement, AchievementType } from "@/lib/content/queries";
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
 * The filter is held here rather than fetched, because the whole set is already on the
 * page — five entries, already cached — and a chip that waited for a round trip would be
 * a control with latency for no reason.
 */

const QUERY_KEY = "hop";
/**
 * The URL is the filter.
 *
 * Not a piece of state that is mirrored into the query afterwards — the query itself,
 * read through `useSyncExternalStore`. Part 10 asks that a filtered view be shareable,
 * and the cheapest way to guarantee the link and the list can never disagree is to have
 * only one of them. A deep link then needs no special case: it is simply the store's
 * first value.
 *
 * `replaceState`, not `push`: the deck already writes the hash with `replaceState` on
 * every section change, and pushing here would interleave filter states with those
 * writes and fill the back button with them. It also means `popstate` never fires for
 * our own writes, which is why subscribers are notified by hand.
 *
 * Read from `window.location` rather than `useSearchParams`, which would opt the
 * statically prerendered home page into dynamic rendering for a value only this
 * component needs.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function readQuery(): string {
  return new URL(window.location.href).searchParams.get(QUERY_KEY) ?? "";
}

/** The server has no URL to read, so it renders the whole route — which is the default. */
function serverQuery(): string {
  return "";
}

function writeQuery(type: AchievementType | null) {
  const url = new URL(window.location.href);
  if (type) url.searchParams.set(QUERY_KEY, type);
  else url.searchParams.delete(QUERY_KEY);
  window.history.replaceState(null, "", url);
  for (const listener of listeners) listener();
}

/**
 * The one easing and the one duration, read from the tokens rather than repeated here.
 * A hand-written animation carrying its own numbers is how a site ends up with two
 * motion systems, which is what DESIGN.md section 7 exists to prevent.
 */
function motionTokens(): { duration: number; easing: string } {
  const styles = getComputedStyle(document.documentElement);
  const ms = Number.parseFloat(styles.getPropertyValue("--dur"));
  return {
    duration: Number.isFinite(ms) ? ms : 280,
    easing: styles.getPropertyValue("--ease").trim() || "ease",
  };
}

export function Timeline({ achievements }: { achievements: Achievement[] }) {
  const raw = useSyncExternalStore(subscribe, readQuery, serverQuery);
  // An unknown value in the query is not a filter, so it falls back to the whole route
  // rather than to an empty one.
  const type = isAchievementType(raw) ? raw : null;
  const listRef = useRef<HTMLUListElement | null>(null);
  const positions = useRef<Map<string, DOMRect>>(new Map());
  const printed = useRef<Set<string>>(new Set());
  const reducedMotion = useReducedMotion();

  const hops = useMemo(() => toHops(achievements, type), [achievements, type]);

  /** Measure before the list changes, so the FLIP below has a "first" to invert from. */
  const select = useCallback(
    (next: AchievementType | null) => {
      if (!reducedMotion && listRef.current) {
        positions.current = new Map(
          Array.from(listRef.current.querySelectorAll<HTMLLIElement>(".hop")).map((element) => [
            element.dataset.slug ?? "",
            element.getBoundingClientRect(),
          ]),
        );
      }
      writeQuery(next);
    },
    [reducedMotion],
  );

  /**
   * FLIP. The survivors of a filter change move from where they were to where they now
   * are, instead of jumping; entries arriving for the first time fade in.
   *
   * Written by hand rather than with a layout-animation library: five items and one
   * transition do not justify the bundle, and B12's JavaScript budget is the reason.
   */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || reducedMotion) return;

    const first = positions.current;
    if (first.size === 0) return;
    positions.current = new Map();

    const { duration, easing } = motionTokens();

    for (const element of list.querySelectorAll<HTMLLIElement>(".hop")) {
      const slug = element.dataset.slug ?? "";
      const before = first.get(slug);
      const after = element.getBoundingClientRect();

      if (!before) {
        element.animate({ opacity: [0, 1] }, { duration, easing, fill: "none" });
        continue;
      }

      const dy = before.top - after.top;
      if (Math.abs(dy) < 1) continue;

      element.animate(
        { transform: [`translateY(${dy}px)`, "translateY(0)"] },
        { duration, easing, fill: "none" },
      );
    }
  }, [hops, reducedMotion]);

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
