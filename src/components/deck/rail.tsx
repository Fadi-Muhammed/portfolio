"use client";

import { useDeck } from "@/components/deck/deck-provider";
import { SECTIONS } from "@/lib/deck/sections";
import { railLabel } from "@/lib/deck/state";

/**
 * The hop rail (B3, B5).
 *
 * One node per section and a packet that moves to the active one. It is the site's
 * connective device: the same packet idea as the hero topology and the contact finale,
 * so the deck reads as one system rather than a set of pages.
 *
 * Vertical at every size — on a phone the nodes shrink and the label drops, which is
 * B3's "compact tappable dot rail". Making it horizontal on mobile would put it in
 * competition with the peek strip for the bottom of the screen.
 *
 * Every node is a real button with an accessible name, and each has a 44px target
 * regardless of how small the dot looks.
 */
export function Rail() {
  const { active, activeIndex, hopTo, nearEnd } = useDeck();

  return (
    <nav
      aria-label="Section navigation"
      className="fixed top-1/2 right-1 z-20 -translate-y-1/2 sm:right-3"
    >
      <ol className="relative flex flex-col items-center gap-0">
        <span aria-hidden="true" className="rail-line" />

        {/* The reading, in the site's data voice, level with the active node. Desktop
            only: on a phone it would cost more width than it earns. */}
        <li
          aria-live="polite"
          className="text-data rail-label hidden text-muted lg:flex"
          style={{ transform: `translateY(${activeIndex * 44}px)` }}
        >
          {railLabel(active)}
        </li>

        {/* The packet. Positioned by index rather than by measuring the DOM, so it
            cannot drift out of step with the node it is meant to be on. */}
        <span
          aria-hidden="true"
          data-pulse={nearEnd ? "" : undefined}
          className="rail-packet"
          style={{ transform: `translateY(${activeIndex * 44}px)` }}
        />

        {SECTIONS.map((section) => {
          const isActive = section.id === active;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => hopTo(section.id)}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Hop to ${section.name}`}
                className="group flex size-11 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  data-active={isActive || undefined}
                  className="rail-node"
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
