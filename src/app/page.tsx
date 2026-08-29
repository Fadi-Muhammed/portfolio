import { Deck, DeckSection } from "@/components/deck/deck";
import { DeckProvider } from "@/components/deck/deck-provider";
import { Rail } from "@/components/deck/rail";
import { SectionPlaceholder } from "@/components/deck/section-placeholder";
import { SiteNav } from "@/components/deck/site-nav";
import { SkipLink } from "@/components/deck/skip-link";
import { EngineeringSection } from "@/components/engineering/engineering-section";
import { Hero } from "@/components/hero/hero";
import { ProductsSection } from "@/components/products/products-section";
import { PaletteProvider } from "@/components/palette/palette-provider";
import { getEngineeringProjects, getProducts, getSiteSettings } from "@/lib/content/queries";
import { SECTIONS } from "@/lib/deck/sections";
import { getPaletteContent } from "@/lib/palette/content";

export default async function Home() {
  // Fetched on the server so the palette's list is current without the client querying
  // the database, and so nothing is fetched for a palette that is never opened.
  const [paletteContent, settings, products, engineering] = await Promise.all([
    getPaletteContent(),
    getSiteSettings(),
    getProducts(),
    getEngineeringProjects(),
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
