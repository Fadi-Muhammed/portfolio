/**
 * Build-time flags.
 *
 * Read as a direct literal reference so Next can inline it, and deliberately kept out
 * of the zod parse in env.ts: that parse throws when NEXT_PUBLIC_SITE_URL is missing,
 * and a missing site URL should not be able to take down a route that does not use it.
 */
export const designRouteEnabled = process.env.NEXT_PUBLIC_ENABLE_DESIGN_ROUTE === "true";
