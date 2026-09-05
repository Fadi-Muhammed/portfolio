import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import type { EngineeringProject, Product, SiteSettings } from "@/lib/content/queries";

/**
 * Structured data (B12): `Person`, `WebSite`, and `CreativeWork` on the detail pages.
 *
 * Written from the same rows the page renders, never typed twice. A JSON-LD block that
 * disagrees with the page it describes is worse than none — it is what a search engine
 * reads when it decides whether to trust the rest.
 *
 * `dangerouslySetInnerHTML` is how a script tag carries a body in React, and the same
 * shape `theme-script.tsx` uses. The content is JSON produced by `JSON.stringify`, and
 * the one character that could close the tag early is escaped below.
 */

/**
 * `</script>` inside a JSON string would end the block and put the rest of the payload
 * into the document as markup. Escaping the slash keeps the JSON valid and the tag shut.
 */
function serialise(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function Script({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialise(data) }} />;
}

function socialUrls(settings: SiteSettings | null): string[] {
  const socials = settings?.socials;
  if (!socials || typeof socials !== "object" || Array.isArray(socials)) return [];
  return Object.values(socials).filter((value): value is string => typeof value === "string");
}

/**
 * The home page: who this is, and what the site is.
 *
 * `sameAs` is the claim that ties this Person to the LinkedIn and GitHub profiles, which
 * is the whole reason a search engine can show them together. It comes from
 * `site_settings.socials`, so adding a profile in Studio adds it here.
 */
export function HomeJsonLd({ settings }: { settings: SiteSettings | null }) {
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: SITE_NAME,
    url: SITE_URL,
    description: settings?.eyebrow ?? SITE_DESCRIPTION,
    jobTitle: "Telecommunications and network engineer",
    knowsAbout: [
      "Telecommunications engineering",
      "Computer networks",
      "Product engineering",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Doha for Science and Technology",
    },
    sameAs: socialUrls(settings),
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en-GB",
    publisher: { "@id": `${SITE_URL}/#person` },
  };

  return <Script data={{ "@context": "https://schema.org", "@graph": [person, website] }} />;
}

/**
 * A case study or a project page.
 *
 * `CreativeWork` rather than `Article`: these describe a thing that was built, not a piece
 * of writing about it. `SoftwareApplication` was the other candidate for the products and
 * was not taken — it is the more specific claim, but its rich results want `offers` and
 * `aggregateRating`, which this site has no honest values for. One accurate type beats a
 * more flattering one with holes in it.
 */
export function WorkJsonLd({ work, path }: { work: Product | EngineeringProject; path: string }) {
  const url = absoluteUrl(path);

  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: work.title,
        description: work.summary ?? undefined,
        url,
        author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: SITE_NAME },
        dateCreated: work.created_at ?? undefined,
        dateModified: work.updated_at ?? undefined,
        isPartOf: { "@id": `${SITE_URL}/#website` },
      }}
    />
  );
}
