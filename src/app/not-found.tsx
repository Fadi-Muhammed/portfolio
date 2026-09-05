import Link from "next/link";
import { OpenPalette } from "@/components/palette/open-palette";
import { StatePage } from "@/components/states/state-page";

/**
 * 404 — "Route not found." (B10).
 *
 * Shipped ahead of Part 14 during the design audit, because until it existed an unknown
 * URL landed on the framework's own white page in a system font. Part 14 moved it onto
 * the shared scaffold with the other three states; the drawing and the words are the ones
 * that were reviewed and did not change.
 *
 * Two ways out, which is what B10 asks for: back to the start, or search. Nothing here
 * apologises, and nothing is vague about what happened.
 */
export default function NotFound() {
  return (
    <StatePage
      variant="not-found"
      title="Route not found."
      actions={
        <>
          <Link href="/" className="state__action text-small">
            Back to home
          </Link>
          <OpenPalette className="state__action text-small">Search the site</OpenPalette>
        </>
      }
    >
      That address does not lead anywhere on this site. It may have been a typo, or a link to
      something that has since moved.
    </StatePage>
  );
}
