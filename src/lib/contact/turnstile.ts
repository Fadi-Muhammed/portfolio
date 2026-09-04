import "server-only";

/**
 * Verifying a Turnstile token with Cloudflare.
 *
 * The widget in the browser produces a token; it proves nothing until this exchanges it
 * for a verdict server-side. A token is single-use and short-lived, so a replayed one is
 * rejected by Cloudflare rather than by us.
 *
 * `fetch` is taken as an argument so the tests can drive it without a network or a real
 * key. That is the whole reason this is a function rather than three lines inline in the
 * action: the interesting cases here are the failures.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Cloudflare's shape. Only the two fields worth acting on are named. */
type SiteVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export type TurnstileVerdict =
  | { ok: true }
  | { ok: false; reason: "missing-token" | "rejected" | "unreachable"; codes?: string[] };

export async function verifyTurnstile(
  token: string | null | undefined,
  secret: string,
  options: { remoteIp?: string | null; fetchImpl?: typeof fetch } = {},
): Promise<TurnstileVerdict> {
  // No token at all means the widget never ran — an old page, a script blocked, or a
  // POST that never went near the form. Not worth a round trip.
  if (!token) return { ok: false, reason: "missing-token" };

  const body = new URLSearchParams({ secret, response: token });
  // Cloudflare uses the IP to spot a token minted for one client and used by another.
  if (options.remoteIp) body.set("remoteip", options.remoteIp);

  const doFetch = options.fetchImpl ?? fetch;

  let payload: SiteVerifyResponse;
  try {
    const response = await doFetch(VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      // Cloudflare being slow must not hold a visitor's form open indefinitely.
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { ok: false, reason: "unreachable" };
    payload = (await response.json()) as SiteVerifyResponse;
  } catch {
    /*
     * Unreachable is deliberately its own reason rather than being folded into
     * "rejected". They are different events with different answers: a rejected token is
     * a visitor who should try again, and an unreachable Cloudflare is our outage, which
     * the caller may decide to survive rather than punish someone for.
     */
    return { ok: false, reason: "unreachable" };
  }

  if (payload.success === true) return { ok: true };
  return { ok: false, reason: "rejected", codes: payload["error-codes"] ?? [] };
}
