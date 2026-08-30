import type { CSSProperties } from "react";
import { storageUrl } from "@/lib/content/media";
import type { Experience } from "@/lib/content/queries";
import { spanParts } from "@/lib/about/dates";
import { sortExperience } from "@/lib/about/experience";

/**
 * Experience and education, as one compact timeline.
 *
 * One list, not two. B2 asks for "experience and education timeline" as a single thing,
 * and splitting four rows into two lists of two would spend two headings on a distinction
 * the dates already make. The type is printed on the row instead.
 *
 * A row's logo is optional. Three of the four carry UDST's mark, because three of the four
 * happened at UDST — the degree, the job in one of its colleges, and the club. Quitifi is
 * Fadi's own company and has no mark, so its column is simply empty: a dot standing in for
 * a logo is a placeholder, and a placeholder where a mark should be is worse than a gap.
 *
 * The type of each row — work, leadership, education — is not printed. It was, and it made
 * the date column read "JAN 2024 - MAY 2027 (EXPECTED) . EDUCATION", which squeezed the
 * role beside it into five wrapped lines. The role and the organisation already say which
 * kind of thing a row is; the label was repeating them in capitals.
 */

export function Timeline({ entries }: { entries: Experience[] }) {
  const sorted = sortExperience(entries);

  return (
    <section className="about__block" aria-labelledby="about-timeline">
      <h3 id="about-timeline" className="text-data text-muted">
        Experience and education
      </h3>

      <ol className="track">
        {sorted.map((entry) => {
          const logo = storageUrl("logos", entry.logo_path);
          const { range, note } = spanParts(entry.start_date, entry.end_date);

          return (
            <li key={entry.slug} className="track__row">
              <div className="track__mark" aria-hidden="true">
                {logo ? (
                  // Masked, not greyscaled — the same treatment Featured in uses, and for
                  // the same reason: greyscale preserves luminance, so UDST's near-black
                  // mark stayed near-black and disappeared on the dark theme.
                  <span
                    className="track__logo"
                    style={{ "--logo": `url("${logo}")` } as CSSProperties}
                  />
                ) : null}
              </div>

              <div className="track__body">
                <p className="track__role text-body text-ink">{entry.role ?? entry.org}</p>
                {entry.role ? (
                  <p className="track__org text-small text-muted">{entry.org}</p>
                ) : null}
                {entry.summary ? (
                  <p className="track__summary text-small text-muted">{entry.summary}</p>
                ) : null}
              </div>

              {/* The qualifier sits on its own line rather than inside the range.
                  Inline, "(expected)" made the date column ten characters wider than any
                  other row needed, and the degree's title wrapped to four lines beside it. */}
              <p className="track__when text-data text-muted">
                {range}
                {note ? <span className="track__note">{note}</span> : null}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
