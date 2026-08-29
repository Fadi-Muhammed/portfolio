/**
 * Is a product's live URL actually answering, and how fast?
 *
 * The measuring is here, apart from the route, so timeouts and caching can be tested
 * against a fake clock and a fake fetch rather than against the internet.
 *
 * "Live" here means something different from the palette's ping easter egg, and the
 * difference is deliberate. That one measures whether a packet came back at all, so any
 * HTTP response counts as a reply. This one is a claim on a portfolio that a product is
 * up — a 500 is a reply, and it is not up. So `ok` follows the status code.
 */

export type PingResult = {
  ok: boolean;
  /** Round trip in milliseconds. Null when nothing came back. */
  ms: number | null;
};

export type PingOptions = {
  timeoutMs?: number;
  /** Injected so tests never touch the network. */
  fetchImpl?: typeof fetch;
  now?: () => number;
};

export const DEFAULT_TIMEOUT_MS = 3_000;
export const CACHE_TTL_MS = 60_000;

export async function ping(url: string, options: PingOptions = {}): Promise<PingResult> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch, now = Date.now } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = now();

  try {
    // HEAD, because the body is never read and a product's home page can be large.
    // Redirects are followed: a site that answers on its canonical host is up.
    const response = await fetchImpl(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    return { ok: response.ok, ms: Math.round(now() - started) };
  } catch {
    // A timeout and a refused connection are the same answer to the only question being
    // asked: nothing came back. The distinction would give the visitor nothing to do.
    return { ok: false, ms: null };
  } finally {
    clearTimeout(timer);
  }
}

type Entry = { result: PingResult; at: number };

/**
 * A short memory of what each endpoint last said.
 *
 * B5 requires the live check to happen once, not continuously, and a card that pinged
 * on every render would put a request on someone else's server every time a visitor
 * scrolled past. The cache is per server instance and deliberately not shared: it is a
 * courtesy throttle, not a source of truth, and a stale reading is worth less than a
 * simple one.
 */
export function createPingCache(ttlMs: number = CACHE_TTL_MS) {
  const entries = new Map<string, Entry>();

  return {
    read(url: string, now: number): PingResult | null {
      const entry = entries.get(url);
      if (!entry) return null;
      if (now - entry.at >= ttlMs) {
        entries.delete(url);
        return null;
      }
      return entry.result;
    },
    write(url: string, result: PingResult, now: number): void {
      entries.set(url, { result, at: now });
    },
    get size(): number {
      return entries.size;
    },
  };
}
