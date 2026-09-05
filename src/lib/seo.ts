import type { Metadata } from "next";

/**
 * Everything the site says about itself to a machine (B12).
 *
 * One module, because a canonical URL, a share card and a sitemap entry are three
 * statements about the same page and they have to agree. They disagreed on plenty of
 * sites before this rule existed.
 *
 * Read as direct literals rather than through the zod parse in `env.ts`, for the reason
 * `flags.ts` gives: that parse throws when any variable in it is missing, and a missing
 * site URL should not be able to take down a route that does not need one. Here the
 * fallback is the real domain, which is also the correct answer — A10 records it as owned
 * and it is where the site will live.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fadimuhammed.work").replace(
  /\/+$/,
  "",
);

export const SITE_NAME = "Fadi Muhammed";

/** A2, and the one-line description every page falls back to. */
export const SITE_DESCRIPTION =
  "Telecommunications and network engineer who ships products. Case studies, lab work, talks and competitions.";

/**
 * Whether search engines may index the site.
 *
 * Off unless explicitly turned on, and off is the answer until launch day: the CV is out
 * of date and the Featured in links are not in yet, and an early index of that is harder
 * to correct than to avoid. Part 17 sets this to true in Vercel, which makes launching a
 * configuration change rather than a deploy of new code.
 *
 * Defaulting to false rather than true is deliberate. A variable that is missing or
 * misspelled should fail towards being invisible, never towards being indexed.
 */
export const isIndexable = process.env.NEXT_PUBLIC_INDEXABLE === "true";

/**
 * An absolute URL for a path. Canonical tags, OG tags and the sitemap all need one.
 *
 * The root comes back as `https://…/` with the slash, and every caller uses this rather
 * than SITE_URL directly, so the home page's canonical tag and its sitemap entry are the
 * same string. They were not, briefly: the layout used the bare origin and the sitemap
 * used this, which are the same page written two ways.
 */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The robots rules, as one object every page shares.
 *
 * `googleBot` is stated separately because Google honours `max-image-preview` and the
 * others only through it, and a large image preview is the difference between a search
 * result that shows the share card and one that shows a thumbnail.
 */
export const robotsRules: Metadata["robots"] = isIndexable
  ? {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    }
  : { index: false, follow: false, googleBot: { index: false, follow: false } };

/**
 * Metadata for a page: canonical URL, Open Graph and Twitter, all from one call.
 *
 * The share image is deliberately not passed here. Next resolves `opengraph-image.tsx`
 * per route segment and writes the tags itself, and a URL typed into this object as well
 * would be a second copy of the same fact — free to drift, and the sort of drift nobody
 * notices until a link is already posted.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  /** Without the site name; the title template adds it. */
  title: string;
  description?: string | null;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const summary = description?.trim() || SITE_DESCRIPTION;

  return {
    title,
    description: summary,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title: `${title} — ${SITE_NAME}`,
      description: summary,
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${SITE_NAME}`,
      description: summary,
    },
  };
}
