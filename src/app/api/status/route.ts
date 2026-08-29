import { NextResponse } from "next/server";
import { getProduct } from "@/lib/content/queries";
import { CACHE_TTL_MS, createPingCache, ping } from "@/lib/status/ping";

/**
 * GET /api/status?slug=… — is this product's live URL answering, and how fast?
 *
 * The slug is the only input, and the URL to ping is looked up from the database. That
 * is the whole security design: the endpoint will only ever reach a URL that is already
 * published on this site. Accepting a URL parameter would turn the site into an open
 * proxy that anyone could point at an internal address.
 *
 * Answers are held for a minute per server instance, so a card that is scrolled past
 * repeatedly does not put a request on someone else's server each time (B5: live pings
 * once, not continuously).
 */

export const dynamic = "force-dynamic";

const cache = createPingCache();

export type StatusResponse = {
  ok: boolean;
  ms: number | null;
};

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "A slug is required." }, { status: 400 });
  }

  const product = await getProduct(slug);
  if (!product) {
    return NextResponse.json({ error: "No such product." }, { status: 404 });
  }
  if (!product.status_check_url) {
    // Not an error: most products will never have one. The card shows nothing rather
    // than an unreachable state, because there is nothing to reach.
    return NextResponse.json({ error: "No status URL for this product." }, { status: 404 });
  }

  const now = Date.now();
  const cached = cache.read(product.status_check_url, now);
  if (cached) {
    return NextResponse.json<StatusResponse>(cached, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const result = await ping(product.status_check_url);
  cache.write(product.status_check_url, result, now);

  return NextResponse.json<StatusResponse>(result, {
    // The browser must not hold this longer than the server does, or a card would show
    // a reading from an hour ago as though it were current.
    headers: { "Cache-Control": `public, max-age=${Math.floor(CACHE_TTL_MS / 1000)}` },
  });
}
