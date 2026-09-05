import { AboutSection } from "@/components/about/about-section";
import { AchievementsSection } from "@/components/achievements/achievements-section";
import { ContactSection } from "@/components/contact/contact-section";
import { Deck, DeckSection } from "@/components/deck/deck";
import { Rail } from "@/components/deck/rail";
import { EngineeringSection } from "@/components/engineering/engineering-section";
import { FeaturedSection } from "@/components/featured/featured-section";
import { Hero } from "@/components/hero/hero";
import { ProductsSection } from "@/components/products/products-section";
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

export default async function Home() {
  // Fetched on the server, in one round, so a section that mounts later is not waiting on
  // a query of its own. The palette's list is fetched in the layout, where the palette is.
  const [
    settings,
    products,
    engineering,
    achievements,
    featured,
    skills,
    certifications,
    experience,
  ] = await Promise.all([
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
    /*
      Above the deck rather than inside a section: About's skill filter re-lays out the
      Products and Engineering cards, which are two and three stops away, so the state has
      to sit above all three. The skip link, the nav, the deck provider and the palette are
      in the root layout, because a case study needs them too.
    */
    <WorkFilterProvider skills={skills} workSections={workSections}>
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
            ) : section.id === "contact" ? (
              <ContactSection settings={settings} />
            ) : (
              // The last of the seven, and the only id left: TypeScript narrows to
              // "about" here, so the chain is exhaustive without a fallback branch.
              <AboutSection
                settings={settings}
                skills={skills}
                certifications={certifications}
                experience={experience}
              />
            )}
          </DeckSection>
        ))}
      </Deck>
    </WorkFilterProvider>
  );
}
