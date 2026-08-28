"use client";

import type { MouseEvent, ReactNode } from "react";
import { useDeck } from "@/components/deck/deck-provider";
import { sectionIndex, type DeckSection as Section } from "@/lib/deck/sections";
import { shouldMount } from "@/lib/deck/state";
import { cn } from "@/lib/cn";

/** The scroll container. Snapping is CSS; nothing here drives the wheel. */
export function Deck({ children }: { children: ReactNode }) {
  const { deckRef } = useDeck();

  return (
    <div ref={deckRef} className="deck" data-deck>
      {children}
    </div>
  );
}

type DeckSectionProps = {
  section: Section;
  /**
   * The hero has nothing above it, so it needs no header bar — a strip reading "Home"
   * under the nav would be a label for something already obvious.
   */
  showHeader?: boolean;
  children: ReactNode;
};

export function DeckSection({ section, showHeader = true, children }: DeckSectionProps) {
  const { active, activeIndex, hopTo, nearEnd } = useDeck();

  const isActive = active === section.id;
  const index = sectionIndex(section.id);
  const isNext = index === activeIndex + 1;
  const mounted = shouldMount(section.id, active);

  const onHeaderClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Everything goes through hopTo, so the hash, the title and the reduced-motion
    // behaviour are identical however the visitor got here.
    event.preventDefault();
    hopTo(section.id);
  };

  return (
    <section
      id={section.id}
      aria-labelledby={showHeader ? `${section.id}-name` : undefined}
      aria-label={showHeader ? undefined : section.name}
      data-active={isActive || undefined}
      className="deck-section"
    >
      {showHeader ? (
        <a
          href={`#${section.id}`}
          onClick={onHeaderClick}
          className="deck-section-header"
          data-lift={isNext && nearEnd ? "" : undefined}
          // Not a heading link when it is the peek: it is announced as the way into the
          // next section, which is what it does from there.
          aria-label={isActive ? undefined : `Hop to ${section.name}`}
        >
          <h2 id={`${section.id}-name`} className="deck-section-name text-h3 text-ink">
            {section.name}
          </h2>
          <span className="deck-section-teaser text-small text-muted">{section.teaser}</span>
        </a>
      ) : null}

      <div
        className={cn("deck-section-body", showHeader ? "" : "deck-section-body--full")}
        // The body is made inert rather than the whole section, so the header stays
        // clickable while it is serving as the next section's peek strip.
        inert={!isActive}
      >
        {mounted ? children : null}
      </div>
    </section>
  );
}
