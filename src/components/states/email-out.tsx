"use client";

import { useState } from "react";

/**
 * The one way to reach anyone while the site is down.
 *
 * The address is assembled in the browser from two halves rather than written into the
 * HTML, which is B9's rule and was worth keeping here: the maintenance page is served to
 * every request that arrives during a window, crawlers included, and it would be a poor
 * trade to close the leak in Contact and open a wider one here.
 *
 * A reveal rather than a plain mailto for the same reason. The button says what it does,
 * and what it does is put the address on the screen.
 */
export function EmailOut({ user, domain }: { user: string; domain: string }) {
  const [shown, setShown] = useState(false);
  const address = `${user}@${domain}`;

  if (!shown) {
    return (
      <button type="button" onClick={() => setShown(true)} className="state__action text-small">
        Show email address
      </button>
    );
  }

  return (
    <a href={`mailto:${address}`} className="state__action text-small">
      {address}
    </a>
  );
}
