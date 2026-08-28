import "server-only";

import {
  getAchievements,
  getEngineeringProjects,
  getProducts,
  getSiteSettings,
} from "@/lib/content/queries";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import { EMPTY_CONTENT, type PaletteContent } from "./items";

/**
 * Assembles what the palette lists, on the server.
 *
 * Only the fields the palette actually shows are returned. The whole object crosses to
 * the client, so sending a full row for each item would put the case-study bodies in the
 * page payload for no reason.
 *
 * When Supabase is not configured — CI, or a clean checkout without .env.local — this
 * returns empty lists rather than throwing. The palette still opens and still reaches
 * every section, which is the part that never depends on content.
 */
export async function getPaletteContent(): Promise<PaletteContent> {
  if (!isSupabaseConfigured) return EMPTY_CONTENT;

  const [products, engineering, achievements, settings] = await Promise.all([
    getProducts(),
    getEngineeringProjects(),
    getAchievements(),
    getSiteSettings(),
  ]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cvUrl =
    settings?.cv_path && supabaseUrl
      ? `${supabaseUrl}/storage/v1/object/public/documents/${settings.cv_path}`
      : null;

  return {
    products: products.map(({ slug, title, summary }) => ({ slug, title, summary })),
    engineering: engineering.map(({ slug, title, type, summary }) => ({
      slug,
      title,
      type,
      summary,
    })),
    achievements: achievements.map(({ slug, title, type, event_name }) => ({
      slug,
      title,
      type,
      event_name,
    })),
    email: settings?.email ?? null,
    socials: (settings?.socials as Record<string, string> | null) ?? {},
    cvUrl,
  };
}
