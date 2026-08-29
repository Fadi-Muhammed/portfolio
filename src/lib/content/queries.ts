import { unstable_cache } from "next/cache";
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/types";
import { REVALIDATE_SECONDS } from "./tags";

/**
 * The typed read layer. Every page reads content through here and nowhere else.
 *
 * Four rules hold across all of it:
 *
 *   - Public client only. RLS already hides drafts from the anon key; nothing here
 *     reaches for the service client, so a page cannot accidentally render unpublished
 *     content.
 *   - The published filter is stated anyway, so the intent is readable at the call site.
 *   - Ordering is always explicit. Postgres guarantees nothing without it, so "the order
 *     I set in Studio" has to be asked for every time.
 *   - Errors throw, naming the table. A section that cannot load its content should fail
 *     into the error boundary rather than render empty and look like no work exists.
 *
 * Each read is wrapped in unstable_cache with a tag equal to its table and a 300 second
 * revalidate. The tag is what /api/revalidate invalidates when a Supabase webhook fires,
 * so an edit in Studio appears immediately rather than up to five minutes later.
 */

type Tables = Database["public"]["Tables"];
export type Row<T extends keyof Tables> = Tables[T]["Row"];

export type Product = Row<"products">;
export type EngineeringProject = Row<"engineering_projects">;
export type Achievement = Row<"achievements">;
export type FeaturedIn = Row<"featured_in">;
export type Skill = Row<"skills">;
export type Certification = Row<"certifications">;
export type Experience = Row<"experience">;
export type SiteSettings = Row<"site_settings">;

export type AchievementType = Achievement["type"];

function cached<T>(fn: () => Promise<T>, key: string, tag: string) {
  return unstable_cache(fn, [key], { tags: [tag], revalidate: REVALIDATE_SECONDS });
}

// ---------------------------------------------------------------------------
// site_settings
// ---------------------------------------------------------------------------

/**
 * The one row of site-wide copy, or null.
 *
 * Null covers both ways there can be no settings: the row has not been seeded yet, and
 * Supabase is not configured at all — a clean checkout, or CI, which has no credentials.
 * The second case used to throw, which was survivable while only the palette read this
 * (it guards with `isSupabaseConfigured` itself) and stopped being survivable the moment
 * the hero did, because the home page is statically prerendered at build time and the
 * throw took the whole build down. Caught by CI, which is the only place that path runs.
 *
 * Callers already have to handle null, so this makes the unconfigured case the same
 * shape as the unseeded one rather than a second thing to remember.
 */
export const getSiteSettings = cached(
  async (): Promise<SiteSettings | null> => {
    if (!isSupabaseConfigured) return null;
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
    if (error) throw new Error(`Could not read site settings: ${error.message}`);
    return data;
  },
  "site_settings",
  "site_settings",
);

// ---------------------------------------------------------------------------
// products
// ---------------------------------------------------------------------------

export const getProducts = cached(
  async (): Promise<Product[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`Could not read products: ${error.message}`);
    return data ?? [];
  },
  "products",
  "products",
);

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// engineering_projects
// ---------------------------------------------------------------------------

export const getEngineeringProjects = cached(
  async (): Promise<EngineeringProject[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("engineering_projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`Could not read engineering projects: ${error.message}`);
    return data ?? [];
  },
  "engineering_projects",
  "engineering_projects",
);

export async function getEngineeringProject(slug: string): Promise<EngineeringProject | null> {
  const projects = await getEngineeringProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// achievements
// ---------------------------------------------------------------------------

const getAllAchievements = cached(
  async (): Promise<Achievement[]> => {
    const supabase = createPublicClient();
    // Newest first, because a traceroute timeline reads from the most recent hop.
    // Entries without a date sort last rather than being dropped.
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("published", true)
      .order("date", { ascending: false, nullsFirst: false })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`Could not read achievements: ${error.message}`);
    return data ?? [];
  },
  "achievements",
  "achievements",
);

/**
 * Filtering happens in memory rather than in a second query: the whole set is small,
 * already cached, and the filter chips need to re-layout instantly without a round trip.
 */
export async function getAchievements(type?: AchievementType): Promise<Achievement[]> {
  const achievements = await getAllAchievements();
  return type ? achievements.filter((entry) => entry.type === type) : achievements;
}

// ---------------------------------------------------------------------------
// featured_in
// ---------------------------------------------------------------------------

export const getFeaturedIn = cached(
  async (): Promise<FeaturedIn[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("featured_in")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`Could not read featured in: ${error.message}`);
    return data ?? [];
  },
  "featured_in",
  "featured_in",
);

// ---------------------------------------------------------------------------
// skills
// ---------------------------------------------------------------------------

export const getSkills = cached(
  async (): Promise<Skill[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`Could not read skills: ${error.message}`);
    return data ?? [];
  },
  "skills",
  "skills",
);

// ---------------------------------------------------------------------------
// certifications
// ---------------------------------------------------------------------------

export const getCertifications = cached(
  async (): Promise<Certification[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`Could not read certifications: ${error.message}`);
    return data ?? [];
  },
  "certifications",
  "certifications",
);

// ---------------------------------------------------------------------------
// experience
// ---------------------------------------------------------------------------

export const getExperience = cached(
  async (): Promise<Experience[]> => {
    const supabase = createPublicClient();
    // Most recent first: a timeline is read from now backwards.
    const { data, error } = await supabase
      .from("experience")
      .select("*")
      .eq("published", true)
      .order("start_date", { ascending: false, nullsFirst: false })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`Could not read experience: ${error.message}`);
    return data ?? [];
  },
  "experience",
  "experience",
);
