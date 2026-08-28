import { NextResponse } from "next/server";
import { createPublicClient, isSupabaseConfigured } from "@/lib/supabase/public";

/**
 * GET /api/health — is the site up, and can it reach its database?
 *
 * Deliberately uses the anonymous client. A health check should exercise the same
 * path a visitor takes; checking with the service key would report "healthy" even if
 * RLS or the grants were broken for everyone else.
 *
 * It reports status and nothing else. No URL, no key, no Postgres error text — a
 * health endpoint is public by nature, and driver errors leak schema details. The
 * reason is one of a fixed set of strings chosen here, never echoed from the driver.
 */

// Never prerendered: this must answer for the state of the system now, not the state
// at build time. It also keeps the build working where Supabase env is absent, as in CI.
export const dynamic = "force-dynamic";

type Health = {
  status: "ok" | "degraded" | "unconfigured";
  database: "reachable" | "unreachable" | "not configured";
};

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json<Health>(
      { status: "unconfigured", database: "not configured" },
      { status: 503 },
    );
  }

  try {
    const supabase = createPublicClient();

    // The cheapest possible round trip that still proves grants, RLS and the network
    // all work: a head-only count against a table the anon role is allowed to read.
    const { error } = await supabase
      .from("site_settings")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json<Health>(
        { status: "degraded", database: "unreachable" },
        {
          status: 503,
        },
      );
    }

    return NextResponse.json<Health>(
      { status: "ok", database: "reachable" },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json<Health>(
      { status: "degraded", database: "unreachable" },
      { status: 503 },
    );
  }
}
