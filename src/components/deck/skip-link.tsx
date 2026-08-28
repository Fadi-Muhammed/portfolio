"use client";

import { useDeck } from "@/components/deck/deck-provider";

/**
 * The first thing in the tab order (B3). Invisible until focused, then it lands at the
 * top-left where a keyboard visitor expects it.
 *
 * It goes to Contact rather than to "main content", because on a deck the content is
 * where you already are — what a keyboard visitor cannot reach cheaply is the end.
 */
export function SkipLink() {
  const { hopTo } = useDeck();

  return (
    <a
      href="#contact"
      onClick={(event) => {
        event.preventDefault();
        hopTo("contact");
      }}
      className="skip-link text-small"
    >
      Skip to contact
    </a>
  );
}
