"use client";

import { useDeck } from "@/components/deck/deck-provider";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/lib/content/queries";

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
export function HeroActions({ settings }: { settings: SiteSettings | null }) {
  const { hopTo } = useDeck();

  return (
    <div className="hero__actions">
      <Button onClick={() => hopTo("products")}>
        {settings?.hero_primary_label ?? "See my work"}
      </Button>
      <Button variant="secondary" onClick={() => hopTo("contact")}>
        {settings?.hero_secondary_label ?? "Work with me"}
      </Button>
    </div>
  );
}
