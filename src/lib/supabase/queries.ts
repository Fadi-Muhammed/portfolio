import { createPublicClient } from "./public";
import type { Database } from "./types";

/**
 * The typed read layer. Part 4 fills this in with the rest of the fetchers
 * (engineering projects, achievements, featured_in, skills, certifications,
 * experience) plus Next caching tags and ISR revalidation.
 *
 * The two below set the pattern the rest follow:
 *
 *   - Public client only. Nothing here reaches for the service client; if a page needs
 *     privileged data that is an explicit decision, not something a helper does quietly.
 *   - The published filter is stated even though RLS already enforces it, so the intent
 *     is readable at the call site and the query still behaves under a privileged client.
 *   - Ordering is always explicit. Postgres gives no guarantees without it, so "the
 *     order I set in Studio" has to be asked for.
 *   - Errors throw with the table named. A page that cannot load its content should
 *     fail loudly into the error boundary, not render as empty and look like no work.
 *
 * These are written per table rather than generically on purpose: a generic
 * `list(table)` cannot resolve to a concrete row type through supabase-js, and the
 * result is a helper that returns something too loose to be worth having.
 */

export type Tables = Database["public"]["Tables"];
export type Row<T extends keyof Tables> = Tables[T]["Row"];

export async function getProducts(): Promise<Row<"products">[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Could not read products: ${error.message}`);
  return data ?? [];
}

export async function getProduct(slug: string): Promise<Row<"products"> | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(`Could not read product "${slug}": ${error.message}`);
  return data;
}

/** The single site_settings row, or null when it has not been seeded yet. */
export async function getSiteSettings(): Promise<Row<"site_settings"> | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();

  if (error) throw new Error(`Could not read site settings: ${error.message}`);
  return data;
}
