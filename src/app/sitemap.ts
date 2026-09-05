import type { MetadataRoute } from "next";
import { getEngineeringProjects, getProducts } from "@/lib/content/queries";
import { absoluteUrl } from "@/lib/seo";

/**
 * sitemap.xml, built from the data layer rather than from a list kept by hand (B12).
 *
 * Everything here is a real, indexable page. The deck's sections are deliberately absent:
 * they are fragments of `/`, not URLs of their own, and listing `/#contact` would ask a
 * crawler to treat one page as seven.
 *
 * Also absent: `/design` and `/debug/*`, which are tools; `/maintenance`, which is
 * reached by a rewrite and answers 503; and the error routes, which have no URL. A
 * sitemap is a claim that these pages are worth indexing, so it should not list a page
 * this site would rather nobody found.
 *
 * `lastModified` comes from the row's own `updated_at`, so editing a case study in Studio
 * moves its date without a deploy.
 */

/*
 * 300, written as a literal rather than imported from REVALIDATE_SECONDS, which is where
 * every other revalidate on this site comes from. Next reads segment configuration by
 * static analysis before any module is evaluated, so an imported constant is not a value
 * it can see — it fails the build with "Invalid segment configuration export". Keep this
 * in step with src/lib/content/tags.ts by hand; there is no way to share it.
 */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, engineering] = await Promise.all([getProducts(), getEngineeringProjects()]);

  const newest = (dates: (string | null)[]): Date => {
    const times = dates
      .filter((value): value is string => typeof value === "string")
      .map((value) => new Date(value).getTime())
      .filter((time) => Number.isFinite(time));
    return times.length > 0 ? new Date(Math.max(...times)) : new Date();
  };

  return [
    {
      url: absoluteUrl("/"),
      // The home page changes whenever any section's content does.
      lastModified: newest([
        ...products.map((product) => product.updated_at),
        ...engineering.map((project) => project.updated_at),
      ]),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/products"),
      lastModified: newest(products.map((product) => product.updated_at)),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/engineering"),
      lastModified: newest(engineering.map((project) => project.updated_at)),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: newest([product.updated_at]),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...engineering.map((project) => ({
      url: absoluteUrl(`/engineering/${project.slug}`),
      lastModified: newest([project.updated_at]),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
