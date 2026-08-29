"use client";

import { useDeck } from "@/components/deck/deck-provider";

/**
 * The one outward action this section has (Part 10 step 3).
 *
 * It hops rather than links, through the deck's own `hopTo`, so arriving at Contact from
 * here is the same movement as arriving from the rail, the palette or the hero — one
 * function, one behaviour, per B3.
 */
export function InviteToSpeak() {
  const { hopTo } = useDeck();

  return (
    <p className="section-more">
      <button type="button" className="hop-invite text-small" onClick={() => hopTo("contact")}>
        Invite me to speak <span aria-hidden="true">→</span>
      </button>
    </p>
  );
}
