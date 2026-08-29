import type { FeaturedIn } from "@/lib/content/queries";
import { FeaturedLogo } from "./featured-logo";

/**
 * The Featured in stop on the deck (B2 item 5, B8).
 *
 * Logos and nothing else. No captions, no quotes, no counts, no marquee — the section's
 * whole argument is that these marks are recognisable, and anything added to them says
 * they are not. B13 names this as the easiest section on the site to over-decorate, so
 * the test applied to every element here was whether removing it loses information.
 *
 * The header is the deck's own: the section is already called "Featured in" in the rail,
 * the peek strip, the palette and the document title, so a second heading inside the
 * section would be the same words twice.
 *
 * No grouping by category. B8 asks for it only above about a dozen logos; at nine, groups
 * would be three short rows with headings that say less than the marks do.
 */
export function FeaturedSection({ entries }: { entries: FeaturedIn[] }) {
  if (entries.length === 0) {
    return (
      <div className="section-body">
        <p className="text-body text-ink measure">
          Nothing here yet. Coverage and stages are added as they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="section-body">
      <ul className="featured">
        {entries.map((entry) => (
          <FeaturedLogo key={entry.slug} entry={entry} />
        ))}
      </ul>
    </div>
  );
}
