import type { Achievement, AchievementType } from "@/lib/content/queries";

/**
 * The traceroute, as data.
 *
 * Ordering, filtering and numbering live here rather than in the component for one
 * reason: they are the only things about this section that can be wrong in a way a
 * screenshot would not show. A hop numbered from the wrong end, or a date sorted as a
 * string, looks perfectly fine and is false.
 *
 * Nothing here reads the database or the DOM, so every rule below is asserted directly
 * in timeline.test.ts.
 */

/**
 * The five types, in chip order, from the schema rather than from the data.
 *
 * Deriving the chips from what happens to be in the table would make the control set
 * reshuffle as content is added, and would hide a type rather than show it as empty.
 * Every one of the five currently has an entry behind it, so no chip is a control that
 * can only do nothing — which is the objection that removed Engineering's chips in Part 9.
 */
export const ACHIEVEMENT_TYPES: readonly AchievementType[] = [
  "hackathon",
  "competition",
  "talk",
  "award",
  "program",
] as const;

/**
 * How each type is written on the page.
 *
 * "Programme", not the schema's "program": the deck header for this section already says
 * "Stages, competitions and programmes", and B12 asks for one vocabulary. The enum is a
 * database value, not a label.
 */
export const TYPE_LABELS: Record<AchievementType, string> = {
  hackathon: "Hackathon",
  competition: "Competition",
  talk: "Talk",
  award: "Award",
  program: "Programme",
};

export function isAchievementType(value: unknown): value is AchievementType {
  return typeof value === "string" && (ACHIEVEMENT_TYPES as string[]).includes(value);
}

/** One numbered stop on the route. The number is positional, never an identity. */
export type Hop = {
  entry: Achievement;
  /** 1-based position in the route as currently filtered. */
  number: number;
};

/**
 * Newest first (decided 29 August 2026): hop 1 is the most recent, so the route reads
 * outward from now the way a traceroute reads outward from the origin.
 *
 * Sorted here rather than trusted from the query, because the same list is re-numbered on
 * every filter change and correctness should not depend on which caller fetched it.
 * Entries with no date sort last: an undated entry is not the newest thing, it is an
 * entry whose place on the route is not yet known.
 */
export function sortNewestFirst(entries: readonly Achievement[]): Achievement[] {
  return [...entries].sort((a, b) => {
    if (a.date === b.date) return a.sort_order - b.sort_order;
    if (!a.date) return 1;
    if (!b.date) return -1;
    // ISO dates compare correctly as strings, and only as strings — Date parsing here
    // would introduce a timezone that the content does not have.
    return a.date < b.date ? 1 : -1;
  });
}

/**
 * The route: sorted, filtered, then numbered — in that order.
 *
 * Numbering last is the whole point. A filtered view is a different route, and a real
 * traceroute numbers the hops of the route it actually took, so filtering to talks gives
 * hop 1, not hop 3.
 */
export function toHops(entries: readonly Achievement[], type: AchievementType | null): Hop[] {
  const sorted = sortNewestFirst(entries);
  const filtered = type ? sorted.filter((entry) => entry.type === type) : sorted;
  return filtered.map((entry, index) => ({ entry, number: index + 1 }));
}

/** Two digits, so the numbers form a column rather than a ragged edge. */
export function hopNumber(number: number): string {
  return String(number).padStart(2, "0");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "Aug 2026". Month and year only, never a day.
 *
 * Part 4 stores month-precision dates as the first of the month, so rendering the day
 * would print a precision the content does not have — the first of August is not when
 * the hackathon was.
 */
export function formatWhen(date: string | null): string | null {
  if (!date) return null;
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(date);
  if (!match) return null;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : match[1];
}

/** "Doha, Qatar", or just the half that exists. */
export function formatPlace(city: string | null, country: string | null): string | null {
  return [city, country].filter(Boolean).join(", ") || null;
}

/**
 * Whether the title line says anything the event name has not already said.
 *
 * Two of the five entries carry a title that restates the event — "DMZ Basecamp 2025"
 * against the event "DMZ Basecamp" — because `title` is required by the schema and an
 * entry whose name is its event has nothing else to put there. Rendering both prints the
 * same words twice under each other, which reads as a mistake rather than as a heading
 * and a subtitle.
 */
export function showsTitle(title: string, eventName: string | null): boolean {
  if (!eventName) return true;
  const a = title.toLowerCase().trim();
  const b = eventName.toLowerCase().trim();
  return !a.includes(b) && !b.includes(a);
}

export type HopLink = { key: string; label: string; href: string; external: boolean };

/**
 * The links B2 gives a hop, in a fixed order, labelled by what they lead to.
 *
 * Every key B2 names is handled, including `video` — not because the click-to-load facade
 * exists (there is no recording yet, so it is not built) but so that the day a URL is
 * added it appears as a link rather than being silently dropped by a renderer that only
 * knew about the keys the content happened to have.
 */
const LINK_LABELS: Array<{ key: string; label: string }> = [
  { key: "product", label: "See the product" },
  { key: "coverage", label: "Read the coverage" },
  { key: "video", label: "Watch the talk" },
  { key: "slides", label: "See the slides" },
  { key: "repo", label: "See the code" },
];

export function hopLinks(value: unknown): HopLink[] {
  if (typeof value !== "object" || value === null) return [];
  const record = value as Record<string, unknown>;

  return LINK_LABELS.flatMap(({ key, label }) => {
    const href = record[key];
    if (typeof href !== "string" || href.length === 0) return [];
    return [{ key, label, href, external: !href.startsWith("/") }];
  });
}
