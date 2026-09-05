import { CARD_CONTENT_TYPE, CARD_SIZE, renderCard } from "@/lib/og/card";
import { getSiteSettings } from "@/lib/content/queries";

/**
 * The home page's share card — the one that gets posted to LinkedIn, which A10 records as
 * the main sharing channel.
 *
 * It leads with the tagline, because that is what the hero leads with and a card that
 * opened with something else would be a different promise from the page it links to.
 */

export const alt = "Fadi Muhammed — telecommunications and network engineer who ships.";
export const size = CARD_SIZE;
export const contentType = CARD_CONTENT_TYPE;

export default async function Image() {
  // Never throws: getSiteSettings returns null where Supabase is unconfigured, and a
  // share card that fails to render costs every link its preview.
  const settings = await getSiteSettings().catch(() => null);

  return renderCard({
    eyebrow: settings?.eyebrow ?? "Telecommunications & network engineer",
    title: settings?.tagline ?? "Unemployed & jobless, but not lost.",
    summary: settings?.availability ?? null,
    at: "hero",
  });
}
