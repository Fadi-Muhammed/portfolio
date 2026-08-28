/**
 * Cache tags, one per content table.
 *
 * These are the contract between three things: the fetchers that tag their cached
 * reads, the /api/revalidate route that invalidates by tag, and the Supabase database
 * webhook that calls it with a table name. Keeping the tag equal to the table name is
 * deliberate — the webhook sends `table`, and a mapping layer would be one more place
 * for the two to drift apart.
 */

export const CONTENT_TABLES = [
  "products",
  "engineering_projects",
  "achievements",
  "featured_in",
  "skills",
  "certifications",
  "experience",
  "site_settings",
] as const;

export type ContentTable = (typeof CONTENT_TABLES)[number];

/** How long a cached read survives without anyone invalidating it (B11: about 300s). */
export const REVALIDATE_SECONDS = 300;

export function isContentTable(value: unknown): value is ContentTable {
  return typeof value === "string" && (CONTENT_TABLES as readonly string[]).includes(value);
}
