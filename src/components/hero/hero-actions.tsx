"use client";

import { useDeck } from "@/components/deck/deck-provider";
import { Button } from "@/components/ui/button";

/**
 * The two hero buttons.
 *
 * They call the same `hopTo` the rail, the peek strip, the palette and the topology
 * nodes call, so "See my work" behaves identically whether it is pressed here, picked
 * from the palette or clicked as a node on the map (B3).
 *
 * Labels come from `site_settings` (`hero_primary_label`, `hero_secondary_label`) and
 * are confirmed as "See my work" and "Work with me". The defaults below are what the
 * buttons say if the database is unreachable — the same words, so the site never shows
 * a button whose name nobody chose.
 */
/*
 * Two labels, not the whole settings row.
 *
 * This is a client component, so every prop it takes is serialised into the page. Handing
 * it the row put `site_settings.email` into the served HTML — which quietly undid the
 * trouble the contact section goes to in keeping the address out of it, two stops away and
 * for no benefit at all. A client component should be given what it renders.
 */
export function HeroActions({
  primaryLabel,
  secondaryLabel,
}: {
  primaryLabel: string | null;
  secondaryLabel: string | null;
}) {
  const { hopTo } = useDeck();

  return (
    <div className="hero__actions">
      <Button onClick={() => hopTo("products")}>{primaryLabel ?? "See my work"}</Button>
      <Button variant="secondary" onClick={() => hopTo("contact")}>
        {secondaryLabel ?? "Work with me"}
      </Button>
    </div>
  );
}
