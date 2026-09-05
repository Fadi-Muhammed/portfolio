"use client";

import Link from "next/link";
import { StatePage } from "@/components/states/state-page";

/**
 * 500 — "Packet dropped." (B10).
 *
 * The route is up and this request died on it, which is the distinction the drawing
 * makes: every node answers, the line runs end to end, and the packet has fallen out of
 * it. B10 asks that the copy say the fault is on this side, and it does, without
 * apologising for it.
 *
 * Mostly static, as the prompt asks. The only script on the page is the retry button —
 * a page that appears when the application has already failed is the wrong place to
 * depend on much of anything.
 *
 * `retry` rather than `reset`: Next 16 renamed it and the two now mean different things.
 * `retry()` re-fetches and re-renders the boundary's children, which is what "Try again"
 * promises; `reset()` only clears the error state and re-renders what is already in hand,
 * so it would recover from a transient failure by showing the same failure again.
 *
 * The digest is Next's own hash of the error, printed quietly so a visitor who says "it
 * broke" can be matched to a line in the server log. It is absent in development, where
 * the real message is on the page already.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <StatePage
      variant="dropped"
      title="Packet dropped."
      actions={
        <>
          <button type="button" onClick={() => retry()} className="state__action text-small">
            Try again
          </button>
          <Link href="/" className="state__action text-small">
            Home
          </Link>
        </>
      }
    >
      The request reached this end and did not come back. The fault is here, not with your
      connection or the address you asked for. One request failed rather than the whole site, so
      trying again usually gets through.
      {error.digest ? (
        <>
          {" "}
          <span className="text-data text-muted">Reference {error.digest}</span>
        </>
      ) : null}
    </StatePage>
  );
}
