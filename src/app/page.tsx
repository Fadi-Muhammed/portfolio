import { Deck, DeckSection } from "@/components/deck/deck";
import { DeckProvider } from "@/components/deck/deck-provider";
import { Rail } from "@/components/deck/rail";
import { HeroPlaceholder, SectionPlaceholder } from "@/components/deck/section-placeholder";
import { SiteNav } from "@/components/deck/site-nav";
import { SkipLink } from "@/components/deck/skip-link";
import { PaletteProvider } from "@/components/palette/palette-provider";
import { SECTIONS } from "@/lib/deck/sections";
import { getPaletteContent } from "@/lib/palette/content";

export default async function Home() {
  // Fetched on the server so the palette's list is current without the client querying
  // the database, and so nothing is fetched for a palette that is never opened.
  const paletteContent = await getPaletteContent();

  return (
    <DeckProvider>
      <PaletteProvider content={paletteContent}>
        <SkipLink />
        <SiteNav />
        <Rail />

        <Deck>
          {SECTIONS.map((section, index) => (
            <DeckSection
              key={section.id}
              section={section}
              // The hero has nothing above it, so it needs no peek header of its own.
              showHeader={index > 0}
            >
              {section.id === "hero" ? (
                <HeroPlaceholder section={section} />
              ) : (
                <SectionPlaceholder section={section} />
              )}
            </DeckSection>
          ))}
        </Deck>
      </PaletteProvider>
    </DeckProvider>
  );
}
