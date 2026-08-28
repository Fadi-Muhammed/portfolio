import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * The public, anonymous client. Safe anywhere — server components, route handlers,
 * the browser.
 *
 * It carries the anon key, which is designed to be public and ships in the client
 * bundle. What stops that being a problem is not secrecy but Row Level Security: this
 * key can read published rows and nothing else. It cannot see a draft, cannot read
 * contact_messages, and cannot write anywhere. That is enforced by the database, not
 * by the code here, and it was verified against the live database in Part 3.
 *
 * Session persistence is off: the site has no accounts, so there is nothing to
 * persist, and leaving it on would write storage keys in visitors' browsers for no
 * reason.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export function createPublicClient() {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. Copy .env.example to .env.local.",
    );
  }

  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
