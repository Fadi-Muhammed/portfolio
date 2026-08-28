import { expect, test } from "@playwright/test";

/**
 * /api/health has to hold its contract in two different worlds: locally, where
 * .env.local gives it a real database, and in CI, where there are no Supabase
 * credentials at all. Asserting only "returns ok" would fail in CI; asserting only
 * "returns something" would test nothing. So the shape is checked always, and the
 * outcome is checked against whichever world the run is in.
 */

const KNOWN_STATUSES = ["ok", "degraded", "unconfigured"];

test("reports a known status and never leaks credentials", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = await response.json();

  expect(KNOWN_STATUSES).toContain(body.status);

  // The contract that matters most: a public endpoint must not echo configuration.
  // No key material, no project URL, no driver error text.
  const serialised = JSON.stringify(body);
  expect(serialised).not.toMatch(/supabase\.co/);
  expect(serialised).not.toMatch(/eyJ/); // the leading characters of a JWT key
  expect(serialised).not.toMatch(/sb_(secret|publishable)_/);
  expect(Object.keys(body).sort()).toEqual(["database", "status"]);
});

test("agrees with itself about status and HTTP code", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = await response.json();

  if (body.status === "ok") {
    // Configured run: the anon key reached the database through RLS and the grants.
    expect(response.status()).toBe(200);
    expect(body.database).toBe("reachable");
  } else {
    // Unconfigured or degraded must never answer 200 — a green health check that
    // cannot reach its database is worse than no health check.
    expect(response.status()).toBe(503);
    expect(body.database).not.toBe("reachable");
  }
});

test("is never cached", async ({ request }) => {
  // A cached health check reports the past. Only the ok path sets the header, so this
  // asserts it where it applies rather than demanding it unconditionally.
  const response = await request.get("/api/health");
  const body = await response.json();

  if (body.status === "ok") {
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
});
