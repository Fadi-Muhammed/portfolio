import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { isContentTable } from "@/lib/content/tags";

/**
 * POST /api/revalidate — drops the cached read for one content table.
 *
 * Called by a Supabase database webhook on insert, update and delete, so an edit made
 * in Studio appears on the site immediately instead of waiting out the 300 second ISR
 * window. docs/BACKEND.md has the dashboard steps for creating the webhook.
 *
 * Authenticated by a shared secret in a header. The comparison is constant-time: a
 * plain === leaks the secret one character at a time to anyone willing to measure, and
 * this endpoint is public and unrate-limited by design.
 */

export const dynamic = "force-dynamic";

function secretMatches(provided: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, which would itself be a timing signal.
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!process.env.REVALIDATE_SECRET) {
    // Refuse rather than revalidate freely: an unset secret is a misconfiguration, and
    // treating it as "no auth needed" would be the worst possible default.
    return NextResponse.json({ error: "Revalidation is not configured." }, { status: 503 });
  }

  if (!secretMatches(request.headers.get("x-revalidate-secret"))) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  let table: unknown;
  try {
    // Supabase webhooks post { type, table, record, old_record, schema }. A manual call
    // can send the same shape with just the table.
    const body = (await request.json()) as { table?: unknown };
    table = body.table;
  } catch {
    return NextResponse.json({ error: "Body must be JSON." }, { status: 400 });
  }

  if (!isContentTable(table)) {
    // Named explicitly rather than echoed back: this is a public endpoint, and echoing
    // input invites using it as a reflector.
    return NextResponse.json({ error: "Unknown table." }, { status: 400 });
  }

  // Next 16 takes a cache-life profile as the second argument. { expire: 0 } means
  // expire now, which is the point of a webhook: the edit is already made, and waiting
  // out any window would defeat the call. updateTag would be the alternative, but it is
  // only callable from a Server Action, not a route handler.
  revalidateTag(table, { expire: 0 });

  return NextResponse.json({ revalidated: table }, { status: 200 });
}
