import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";
import { BYPASS_COOKIE } from "@/lib/maintenance";
import { proxy } from "./proxy";

/**
 * The maintenance rewrite, tested against real NextRequest and NextResponse objects.
 *
 * This is where the end-to-end behaviour is asserted rather than in Playwright, and the
 * reason is worth writing down. Whether the site is down is read from the environment of
 * the running server, so a browser test would need a third server started with the flag
 * on — and Playwright starts its web servers in parallel, so on a cold checkout that
 * server would race the build the other two are waiting for. Here the same function that
 * runs in production is called with the same request objects, which tests the decision,
 * the status, the redirect and the cookie's flags more precisely than a page ever could.
 *
 * The environment is set per test and restored, because these are the only tests on the
 * site that depend on it.
 */

const KEY = "part14-bypass-key";

function on(key: string | null = KEY) {
  process.env.MAINTENANCE_MODE = "true";
  if (key === null) delete process.env.MAINTENANCE_BYPASS_KEY;
  else process.env.MAINTENANCE_BYPASS_KEY = key;
}

function request(path: string, init?: { cookie?: string }) {
  return new NextRequest(new URL(path, "https://fadimuhammed.work"), {
    headers: init?.cookie ? { cookie: init.cookie } : undefined,
  });
}

afterEach(() => {
  delete process.env.MAINTENANCE_MODE;
  delete process.env.MAINTENANCE_BYPASS_KEY;
});

describe("with the flag off", () => {
  it("does nothing at all, which is every deployment today", () => {
    const response = proxy(request("/"));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.status).toBe(200);
  });

  it("does nothing even when a bypass key is configured", () => {
    process.env.MAINTENANCE_BYPASS_KEY = KEY;
    expect(proxy(request("/")).headers.get("x-middleware-rewrite")).toBeNull();
  });
});

describe("with the flag on", () => {
  it("sends a normal visitor to the maintenance page", () => {
    on();
    const response = proxy(request("/"));
    expect(response.headers.get("x-middleware-rewrite")).toContain("/maintenance");
  });

  it("answers 503, so a crawler is told this is temporary", () => {
    on();
    expect(proxy(request("/")).status).toBe(503);
  });

  it("rewrites a deep route as readily as the home page", () => {
    on();
    expect(proxy(request("/products/rubric")).headers.get("x-middleware-rewrite")).toContain(
      "/maintenance",
    );
  });

  it("lets the maintenance page itself through, or it would rewrite to itself forever", () => {
    on();
    expect(proxy(request("/maintenance")).headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("locks everyone out when no key is set, including whoever set the flag", () => {
    on(null);
    const response = proxy(request(`/?key=${KEY}`));
    expect(response.headers.get("x-middleware-rewrite")).toContain("/maintenance");
  });
});

describe("the bypass", () => {
  it("trades the key in the query for a cookie, and redirects to the clean URL", () => {
    on();
    const response = proxy(request(`/?key=${KEY}`));

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toBe("https://fadimuhammed.work/");
    expect(location).not.toContain(KEY);
  });

  it("keeps the rest of the query when it strips the key", () => {
    on();
    const response = proxy(request(`/?key=${KEY}&filter=talk`));
    expect(response.headers.get("location")).toBe("https://fadimuhammed.work/?filter=talk");
  });

  it("sets the cookie so no script can read the key back out", () => {
    on();
    const cookie = proxy(request(`/?key=${KEY}`)).cookies.get(BYPASS_COOKIE);

    expect(cookie?.value).toBe(KEY);
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.path).toBe("/");
    // https in, secure out. A cookie marked secure over http would simply be dropped,
    // and localhost is how this gets tested.
    expect(cookie?.secure).toBe(true);
  });

  it("lets a request carrying the cookie through untouched", () => {
    on();
    const response = proxy(request("/products", { cookie: `${BYPASS_COOKIE}=${KEY}` }));
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.status).toBe(200);
  });

  it("refuses a forged cookie", () => {
    on();
    const response = proxy(request("/", { cookie: `${BYPASS_COOKIE}=not-the-key` }));
    expect(response.headers.get("x-middleware-rewrite")).toContain("/maintenance");
  });

  it("refuses a wrong key in the query without setting anything", () => {
    on();
    const response = proxy(request("/?key=wrong"));
    expect(response.headers.get("x-middleware-rewrite")).toContain("/maintenance");
    expect(response.cookies.get(BYPASS_COOKIE)).toBeUndefined();
  });
});
