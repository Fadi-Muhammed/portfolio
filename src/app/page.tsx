import { AchievementsSection } from "@/components/achievements/achievements-section";
import { Deck, DeckSection } from "@/components/deck/deck";
import { DeckProvider } from "@/components/deck/deck-provider";
import { Rail } from "@/components/deck/rail";
import { SectionPlaceholder } from "@/components/deck/section-placeholder";
import { SiteNav } from "@/components/deck/site-nav";
import { SkipLink } from "@/components/deck/skip-link";
import { EngineeringSection } from "@/components/engineering/engineering-section";
import { FeaturedSection } from "@/components/featured/featured-section";
import { Hero } from "@/components/hero/hero";
import { ProductsSection } from "@/components/products/products-section";
import { PaletteProvider } from "@/components/palette/palette-provider";
import {
  getAchievements,
  getEngineeringProjects,
  getFeaturedIn,
  getProducts,
  getSiteSettings,
} from "@/lib/content/queries";
import { SECTIONS } from "@/lib/deck/sections";
import { getPaletteContent } from "@/lib/palette/content";

export default async function Home() {
  // Fetched on the server so the palette's list is current without the client querying
  // the database, and so nothing is fetched for a palette that is never opened.
  const [paletteContent, settings, products, engineering, achievements, featured] =
    await Promise.all([
      getPaletteContent(),
      getSiteSettings(),
      getProducts(),
      getEngineeringProjects(),
      getAchievements(),
      getFeaturedIn(),
    ]);

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
                <Hero settings={settings} />
              ) : section.id === "products" ? (
                <ProductsSection products={products} />
              ) : section.id === "engineering" ? (
                <EngineeringSection projects={engineering} />
              ) : section.id === "achievements" ? (
                <AchievementsSection achievements={achievements} />
              ) : section.id === "featured-in" ? (
                <FeaturedSection entries={featured} />
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
