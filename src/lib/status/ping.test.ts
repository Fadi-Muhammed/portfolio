import { describe, expect, it, vi } from "vitest";
import { CACHE_TTL_MS, createPingCache, ping } from "./ping";

/**
 * The clock and the network are both injected, so these run in microseconds and never
 * depend on anything outside the process. A test that actually reached the internet
 * would be measuring GitHub's uptime, not this code.
 */

function fakeFetch(response: Partial<Response> | Error, delayMs = 0, clock?: { t: number }) {
  return vi.fn(async () => {
    if (clock) clock.t += delayMs;
    if (response instanceof Error) throw response;
    return response as Response;
  }) as unknown as typeof fetch;
}

describe("pinging an endpoint", () => {
  it("reports a round trip when the endpoint answers", async () => {
    const clock = { t: 1_000 };
    const result = await ping("https://example.test", {
      fetchImpl: fakeFetch({ ok: true, status: 200 }, 84, clock),
      now: () => clock.t,
    });
    expect(result).toEqual({ ok: true, ms: 84 });
  });

  it("is not ok when the endpoint answers with a failure", async () => {
    // A 500 is a reply, and it is not "live". This is where product status parts company
    // with the palette's ping, which counts any reply as reachability.
    const clock = { t: 0 };
    const result = await ping("https://example.test", {
      fetchImpl: fakeFetch({ ok: false, status: 500 }, 12, clock),
      now: () => clock.t,
    });
    expect(result).toEqual({ ok: false, ms: 12 });
  });

  it("reports nothing came back when the request fails", async () => {
    const result = await ping("https://example.test", {
      fetchImpl: fakeFetch(new Error("ECONNREFUSED")),
    });
    expect(result).toEqual({ ok: false, ms: null });
  });

  it("gives up rather than hanging, and says nothing came back", async () => {
    // The real abort is driven by AbortController; what matters to a caller is that a
    // request that never resolves still produces an answer, and that the answer is the
    // same shape as a refused connection.
    const aborted = Object.assign(new Error("The operation was aborted."), {
      name: "AbortError",
    });
    const result = await ping("https://example.test", {
      timeoutMs: 5,
      fetchImpl: fakeFetch(aborted),
    });
    expect(result).toEqual({ ok: false, ms: null });
  });

  it("asks for headers only, follows redirects, and carries an abort signal", async () => {
    const spy = vi.fn(async () => ({ ok: true, status: 200 }) as Response);
    await ping("https://example.test", { fetchImpl: spy as unknown as typeof fetch });

    const [url, init] = spy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://example.test");
    expect(init.method).toBe("HEAD");
    expect(init.redirect).toBe("follow");
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("stops its timer when the request resolves", async () => {
    // Left running, every ping would hold the process open for the timeout duration.
    const clear = vi.spyOn(globalThis, "clearTimeout");
    await ping("https://example.test", {
      fetchImpl: fakeFetch({ ok: true, status: 200 }),
    });
    expect(clear).toHaveBeenCalled();
    clear.mockRestore();
  });
});

describe("remembering the answer", () => {
  it("returns a reading again within the window", () => {
    const cache = createPingCache(60_000);
    cache.write("https://example.test", { ok: true, ms: 84 }, 1_000);
    expect(cache.read("https://example.test", 30_000)).toEqual({ ok: true, ms: 84 });
  });

  it("forgets it once the window has passed", () => {
    const cache = createPingCache(60_000);
    cache.write("https://example.test", { ok: true, ms: 84 }, 1_000);
    expect(cache.read("https://example.test", 61_000)).toBeNull();
    // Dropped rather than left to accumulate: this map lives for the life of the server.
    expect(cache.size).toBe(0);
  });

  it("knows nothing about an endpoint it has not seen", () => {
    const cache = createPingCache();
    expect(cache.read("https://example.test", 0)).toBeNull();
  });

  it("keeps endpoints apart", () => {
    const cache = createPingCache();
    cache.write("https://a.test", { ok: true, ms: 10 }, 0);
    cache.write("https://b.test", { ok: false, ms: null }, 0);
    expect(cache.read("https://a.test", 1)).toEqual({ ok: true, ms: 10 });
    expect(cache.read("https://b.test", 1)).toEqual({ ok: false, ms: null });
  });

  it("holds a reading for a minute by default", () => {
    expect(CACHE_TTL_MS).toBe(60_000);
  });
});
