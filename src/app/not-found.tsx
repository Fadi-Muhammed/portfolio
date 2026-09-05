import Link from "next/link";
import { OpenPalette } from "@/components/palette/open-palette";

/**
 * 404 — "Route not found." (B10).
 *
 * The rest of B10's states — the render error, offline, maintenance — belong to Part 14.
 * This one is here early because without it Next serves its own unstyled page, and an
 * unknown URL was landing on white with a system font: a harder break from the design than
 * any missing feature.
 *
 * A packet stopped at a dead node, with the link beyond it dashed. It is the same drawing
 * vocabulary as the hero's topology and the footer's recap, so a wrong turn still looks
 * like this site rather than like the framework's default.
 *
 * Two ways out, which is what B10 asks for: back to the start, or search. Nothing here
 * apologises, and nothing is vague about what happened.
 */
export default function NotFound() {
  return (
    <main className="notfound">
      <figure className="notfound__figure">
        <svg viewBox="0 0 240 60" role="img" aria-label="A packet stopped at an unreachable node.">
          <line className="notfound__link" x1="10" y1="30" x2="150" y2="30" />
          {/* Beyond the last reachable node the route is dashed: the path exists, the
              destination does not answer. */}
          <line className="notfound__link" data-dead="" x1="150" y1="30" x2="230" y2="30" />

          <circle className="notfound__node" cx="10" cy="30" r="4" />
          <circle className="notfound__node" cx="80" cy="30" r="4" />
          <circle className="notfound__node" data-dead="" cx="150" cy="30" r="4" />

          {/* The packet, stopped short. */}
          <rect className="notfound__packet" x="112" y="26" width="7" height="7" />
        </svg>
      </figure>

      <h1 className="text-h1 text-ink">Route not found.</h1>
      <p className="text-body text-muted measure">
        That address does not lead anywhere on this site. It may have been a typo, or a link to
        something that has since moved.
      </p>

      <div className="notfound__actions">
        <Link href="/" className="notfound__home text-small">
          Back to home
        </Link>
        <OpenPalette className="notfound__search text-small">Search the site</OpenPalette>
      </div>
    </main>
  );
}
