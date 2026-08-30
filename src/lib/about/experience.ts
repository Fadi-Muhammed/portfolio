import type { Experience } from "@/lib/content/queries";

/**
 * The order of the About timeline.
 *
 * Not simply newest-started-first, which is what the query does and what buried the
 * degree: it began in January 2024, before two of the roles beside it, and it is the
 * longest-running and most current thing on the list. Sorting on when something *started*
 * treats a four-year degree as older than a job that began last year and ended.
 *
 * So: everything still running comes first, then everything finished, and each block reads
 * most recent first. "Still running" means no end date at all, or an end date in the
 * future — which is how a degree with an expected graduation is stored.
 *
 * `today` is a parameter so the boundary is testable rather than something that only
 * starts behaving differently in 2027.
 */
export function isOngoing(entry: Experience, today: Date = new Date()): boolean {
  if (!entry.end_date) return true;
  return entry.end_date > today.toISOString().slice(0, 10);
}

export function sortExperience(
  entries: readonly Experience[],
  today: Date = new Date(),
): Experience[] {
  return [...entries].sort((a, b) => {
    const aOngoing = isOngoing(a, today);
    const bOngoing = isOngoing(b, today);
    if (aOngoing !== bOngoing) return aOngoing ? -1 : 1;

    // Within a block, most recently started first. ISO dates compare as strings, and only
    // as strings — parsing them into Dates would introduce a timezone the content has not
    // got. An entry with no start date sorts last rather than being dropped.
    if (a.start_date === b.start_date) return a.sort_order - b.sort_order;
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return a.start_date < b.start_date ? 1 : -1;
  });
}
