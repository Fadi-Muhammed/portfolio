import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * The privileged client. Server only, always.
 *
 * The service-role key bypasses every Row Level Security policy in the database. It
 * can read drafts, read contact_messages, and write anywhere. Leaking it into a
 * client bundle would hand a visitor the entire database.
 *
 * Two things prevent that. The key has no NEXT_PUBLIC_ prefix, so Next never inlines
 * it. And the `server-only` import above makes the build fail — loudly, at compile
 * time — if any client component ever imports this file, however indirectly. That is
 * the guard that matters, because the prefix rule depends on someone remembering it.
 *
 * Use this only where the anon client genuinely cannot do the job: inserting a contact
 * message, reading unpublished content in a preview, seeding.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createServiceClient() {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase service client is not configured. NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY must be set on the server.",
    );
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
