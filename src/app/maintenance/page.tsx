import type { Metadata } from "next";
import { EmailOut } from "@/components/states/email-out";
import { StatePage } from "@/components/states/state-page";
import { getSiteSettings } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Down for maintenance — Fadi Muhammed",
  robots: { index: false, follow: false },
};

/**
 * The maintenance page (B10). Reached by a rewrite from the proxy, never by a link.
 *
 * `force-dynamic` because the whole point is to reflect the flag as it is now. A
 * prerendered maintenance page would be built once and then be wrong in one direction or
 * the other for as long as it was cached.
 *
 * The message comes from site_settings, and the same words are in this file as a
 * fallback. That is not belt and braces: the database is one of the things that can be
 * under maintenance, and a page that renders empty when Supabase is unreachable would
 * fail exactly when it is most needed. Editing the line in Studio changes what visitors
 * see; the copy here is what they see if Studio is what is down.
 *
 * A node taken out of service on purpose, drawn with a ring — the difference between this
 * and the 404's dead node is that somebody put the ring there and will take it away.
 */
export const dynamic = "force-dynamic";

const FALLBACK_MESSAGE = "This node is down for scheduled maintenance. Back shortly.";

export default async function MaintenancePage() {
  let message = FALLBACK_MESSAGE;
  let email: string | null = null;

  try {
    const settings = await getSiteSettings();
    message = settings?.maintenance_message?.trim() || FALLBACK_MESSAGE;
    email = settings?.email ?? null;
  } catch {
    // Unreachable settings are the case this page exists for. Say the standard line.
  }

  const [user, domain] = email ? email.split("@") : [null, null];

  return (
    <StatePage
      variant="maintenance"
      title="Down for maintenance."
      actions={user && domain ? <EmailOut user={user} domain={domain} /> : null}
    >
      {message}
    </StatePage>
  );
}
