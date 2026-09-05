"use client";

import { useEffect, useRef } from "react";

/**
 * The console easter egg (B12), for whoever opens devtools.
 *
 * A link-up line, which is what a real interface logs when a cable comes good — the exact
 * inverse of the "No signal." state Part 14 built, and the console's own idiom rather than
 * a joke told in it. The palette already answers `ping` with a mock reply, so repeating
 * that here would be the same trick twice.
 *
 * `console.info`, never `console.error` or `console.warn`: B13 asks for a console with
 * nothing wrong in it, and an easter egg that colours itself like a fault would be a
 * strange thing to greet a developer with.
 *
 * Once per page load. A ref rather than a module-level flag, so React's development
 * double-invoke is handled without also silencing it for the rest of the session.
 */

const STYLE_SIGNAL = "color:#c06400;font-weight:600";
const STYLE_MUTED = "color:#5b6672";

export function ConsoleNote() {
  const printed = useRef(false);

  useEffect(() => {
    if (printed.current) return;
    printed.current = true;

    console.info(
      `%clink up%c · 1000 Mb/s · full duplex\n%cFadi Muhammed — telecommunications and network engineer who ships.`,
      STYLE_SIGNAL,
      STYLE_MUTED,
      STYLE_MUTED,
    );
  }, []);

  return null;
}
