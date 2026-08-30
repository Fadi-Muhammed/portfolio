import { AboutSection } from "@/components/about/about-section";
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
import { WorkFilterProvider } from "@/components/work/work-filter";
import {
  getAchievements,
  getCertifications,
  getEngineeringProjects,
  getExperience,
  getFeaturedIn,
  getProducts,
  getSiteSettings,
  getSkills,
} from "@/lib/content/queries";
import { SECTIONS, type SectionId } from "@/lib/deck/sections";
import { getPaletteContent } from "@/lib/palette/content";

export default async function Home() {
  // Fetched on the server so the palette's list is current without the client querying
  // the database, and so nothing is fetched for a palette that is never opened.
  const [
    paletteContent,
    settings,
    products,
    engineering,
    achievements,
    featured,
    skills,
    certifications,
    experience,
  ] = await Promise.all([
    getPaletteContent(),
    getSiteSettings(),
    getProducts(),
    getEngineeringProjects(),
    getAchievements(),
    getFeaturedIn(),
    getSkills(),
    getCertifications(),
    getExperience(),
  ]);

  // Which stop each piece of work sits on, so a skill tapped in About can hop to it.
  const workSections: Record<string, SectionId> = {
    ...Object.fromEntries(products.map((product) => [product.slug, "products" as const])),
    ...Object.fromEntries(engineering.map((project) => [project.slug, "engineering" as const])),
  };

  return (
    <DeckProvider>
      {/*
        Above the deck rather than inside a section: About's skill filter re-lays out the
        Products and Engineering cards, which are two and three stops away, so the state
        has to sit above all three.
      */}
      <WorkFilterProvider skills={skills} workSections={workSections}>
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
                ) : section.id === "about" ? (
                  <AboutSection
                    settings={settings}
                    skills={skills}
                    certifications={certifications}
                    experience={experience}
                  />
                ) : (
                  <SectionPlaceholder section={section} />
                )}
              </DeckSection>
            ))}
          </Deck>
        </PaletteProvider>
      </WorkFilterProvider>
    </DeckProvider>
  );
}
