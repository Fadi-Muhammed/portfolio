/**
 * Umami (A18), and the one fact the footer's privacy note depends on.
 *
 * The website ID is public by design — it is an attribute on a script tag that every
 * visitor can read — so it is a NEXT_PUBLIC_ variable rather than a secret. What it
 * identifies is a bucket of counts, not an account.
 *
 * Read as a direct literal so Next can inline it, and kept out of the zod parse in
 * `env.ts` for the same reason the other flags are: a site with no analytics is a working
 * site, so a missing value must never be an error.
 */

const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

/** Umami Cloud. Self-hosting would change this one line. */
export const UMAMI_SCRIPT = "https://cloud.umami.is/script.js";

/**
 * Only counted on the real domain.
 *
 * `data-domains` is what keeps localhost and every `*.vercel.app` preview out of the
 * numbers. Without it the first week's traffic is mostly Fadi refreshing his own site,
 * which makes the figure useless in exactly the way that matters — it stops telling him
 * whether anyone else came.
 */
export const UMAMI_DOMAINS = "fadimuhammed.work";

export const ANALYTICS_WEBSITE_ID = websiteId && websiteId.trim() ? websiteId.trim() : null;

/**
 * Whether anything is actually being counted.
 *
 * The footer's privacy note reads this too, so the sentence a visitor is shown cannot
 * drift from what the site does. That is not a hypothetical: the note said "No analytics,
 * no cookies." from Part 13, which was true when it was written and would have become a
 * false statement the moment this shipped.
 */
export const analyticsEnabled = ANALYTICS_WEBSITE_ID !== null;
