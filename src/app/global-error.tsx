"use client";

import { StatePage } from "@/components/states/state-page";
import { archivo, plexMono } from "@/lib/fonts";
import "./globals.css";

/**
 * The same "Packet dropped." for the case where the root layout itself threw (B10).
 *
 * This file replaces the root layout when it renders, so everything the layout normally
 * provides has to be brought back by hand: the document, the fonts, the stylesheet. There
 * is no nav, no palette and no theme toggle here, and that is correct — the layout that
 * renders them is the thing that failed.
 *
 * No theme script either, and none is needed. `data-theme` is what the toggle writes, and
 * with no attribute on the document `tokens.css` falls through to its
 * `prefers-color-scheme` block, so this page follows the operating system in both
 * directions on its own. The visitor's chosen theme is the one thing that cannot survive
 * here, and a page that matches the OS is a far smaller break than a page with no colours
 * at all.
 *
 * `<title>` as an element rather than a metadata export: error boundaries are client
 * components, and client components cannot export metadata.
 *
 * The words are the ones `error.tsx` uses. A visitor cannot tell which boundary caught
 * their request and has no reason to care, and B12 says a name stays the same through a
 * flow.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body>
        <title>Packet dropped. — Fadi Muhammed</title>
        <StatePage
          variant="dropped"
          title="Packet dropped."
          {...(error.digest ? { note: `Reference ${error.digest}` } : {})}
          actions={
            <>
              <button type="button" onClick={() => retry()} className="state__action text-small">
                Try again
              </button>
              {/*
                A plain anchor, and the rule that wants next/link here is wrong for this
                one page. Link does a client-side navigation, which means keeping the
                React tree that has just failed at its root; an anchor throws the document
                away and asks the server for a new one, which is the only thing that can
                be relied on once the root layout is what broke.
              */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="state__action text-small">
                Home
              </a>
            </>
          }
        >
          The request reached this end and did not come back. The fault is here, not with your
          connection or the address you asked for. One request failed rather than the whole site,
          so trying again usually gets through.
        </StatePage>
      </body>
    </html>
  );
}
