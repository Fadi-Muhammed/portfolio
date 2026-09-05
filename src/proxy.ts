import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  BYPASS_COOKIE,
  BYPASS_MAX_AGE,
  BYPASS_PARAM,
  isBypass,
  readMaintenance,
} from "@/lib/maintenance";

/**
 * Maintenance mode (B10).
 *
 * `proxy.ts`, not `middleware.ts`. The Part 14 prompt says middleware and this is it:
 * Next 16 deprecated that file convention and renamed it, with the same signature and the
 * same behaviour, and warns on the old name. The spec's word for the mechanism has not
 * changed; the framework's word for the file has.
 *
 * Off by default. With MAINTENANCE_MODE unset — which is every environment today — this
 * returns immediately and costs a function call per request.
 *
 * The bypass is a query key that becomes a cookie: visit any URL with ?key=… once and the
 * rest of the session goes through. The alternative, a key on every request, means
 * appending it to every link followed while checking the site, which is the opposite of
 * checking the site. The cookie is httpOnly so no script can read the key back out of it,
 * and the key is redirected out of the URL immediately so it does not survive in history,
 * in a screenshot, or in whatever the visitor pastes to somebody else.
 */
export function proxy(request: NextRequest) {
  // Named explicitly rather than passing process.env, which is the same discipline
  // env.ts uses: the variables a file depends on should be readable in the file.
  const { enabled, key } = readMaintenance({
    MAINTENANCE_MODE: process.env.MAINTENANCE_MODE,
    MAINTENANCE_BYPASS_KEY: process.env.MAINTENANCE_BYPASS_KEY,
  });
  if (!enabled) return NextResponse.next();

  const url = request.nextUrl;

  // The key, offered in the query. Trade it for the cookie and get it out of the URL.
  if (isBypass(url.searchParams.get(BYPASS_PARAM), key) && key) {
    const clean = new URL(url);
    clean.searchParams.delete(BYPASS_PARAM);
    const response = NextResponse.redirect(clean);
    response.cookies.set(BYPASS_COOKIE, key, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: BYPASS_MAX_AGE,
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  }

  if (isBypass(request.cookies.get(BYPASS_COOKIE)?.value, key)) return NextResponse.next();

  // The page itself, or it would rewrite to itself forever.
  if (url.pathname === "/maintenance") return NextResponse.next();

  return NextResponse.rewrite(new URL("/maintenance", request.url), { status: 503 });
}

export const config = {
  /*
   * Everything except Next's own plumbing and anything with a file extension.
   *
   * The maintenance page needs its stylesheet and its fonts to look like this site rather
   * than like a browser default, so the assets it is built from cannot be rewritten to
   * the page that needs them.
   *
   * /api is deliberately inside the net. During maintenance the contact form should not
   * accept a message it may not be able to store, and an endpoint that keeps answering
   * while the site says it is down is not down.
   */
  matcher: ["/((?!_next/static|_next/image|.*\\.[^/]+$).*)"],
};
