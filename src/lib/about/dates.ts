/**
 * Dates on the About timeline.
 *
 * Month precision only, following the convention Part 4 set: month-precision dates are
 * stored as the first of the month, so printing a day would claim a precision the content
 * does not have.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatMonth(date: string | null): string | null {
  if (!date) return null;
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(date);
  if (!match) return null;
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : match[1];
}

/**
 * "Jan 2024 — May 2027 (expected)", "Mar 2025 — present", or a single month.
 *
 * Two different absences, printed differently. A null end date means the row is current,
 * which the schema states outright. An end date in the future means it is current *and*
 * has a date attached — a degree with an expected graduation, which B2 asks for by name —
 * and printing that as "present" would throw away the more useful half.
 *
 * `today` is a parameter so the expected/finished boundary is testable rather than
 * something that only starts behaving differently in 2027.
 */
export type Span = { range: string; note: string | null };

export function spanParts(
  start: string | null,
  end: string | null,
  today: Date = new Date(),
): Span {
  const from = formatMonth(start);
  const to = formatMonth(end);

  if (!from && !to) return { range: "", note: null };
  if (!from) return { range: to ?? "", note: null };
  if (!end) return { range: `${from} — present`, note: null };
  if (!to) return { range: from, note: null };

  const isFuture = end > today.toISOString().slice(0, 10);
  return { range: `${from} — ${to}`, note: isFuture ? "expected" : null };
}

/** The whole span as one string. Kept for anywhere that wants it on a single line. */
export function formatSpan(
  start: string | null,
  end: string | null,
  today: Date = new Date(),
): string {
  const { range, note } = spanParts(start, end, today);
  return note ? `${range} (${note})` : range;
}
