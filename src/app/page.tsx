import { Deck, DeckSection } from "@/components/deck/deck";
import { DeckProvider } from "@/components/deck/deck-provider";
import { Rail } from "@/components/deck/rail";
import { HeroPlaceholder, SectionPlaceholder } from "@/components/deck/section-placeholder";
import { SiteNav } from "@/components/deck/site-nav";
import { SkipLink } from "@/components/deck/skip-link";
import { SECTIONS } from "@/lib/deck/sections";

export default function Home() {
  return (
    <DeckProvider>
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
    </DeckProvider>
  );
}
