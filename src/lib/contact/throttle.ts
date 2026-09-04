import { createHash } from "node:crypto";

/**
 * Rate limiting the contact form, and the hashing that makes it possible without
 * keeping anyone's address.
 *
 * B11 gives `contact_messages.ip_hash`, not `ip`. The difference is the point: counting
 * recent messages from one sender needs a stable identifier, not a real one. A salted
 * SHA-256 is stable for as long as the salt is, cannot be reversed into an address, and
 * is useless to anyone who reads the table.
 *
 * The salt is the revalidation secret rather than a new variable. It is already required,
 * already long, and already server-only; adding a second secret to configure would be one
 * more thing to get wrong for no gain in strength.
 */

export const WINDOW_MINUTES = 10;
export const MAX_IN_WINDOW = 3;

export function hashIp(ip: string | null | undefined, salt: string): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * The client's address, from the proxy headers Vercel sets.
 *
 * `x-forwarded-for` is a list appended to by each hop, and only the first entry is the
 * original client — the rest can be forged by that client, so taking the last would let
 * anyone choose their own identity here and defeat the count.
 */
export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip");
}

/** The instant the counting window opens, as an ISO string Postgres can compare. */
export function windowStart(now: Date = new Date()): string {
  return new Date(now.getTime() - WINDOW_MINUTES * 60_000).toISOString();
}

/**
 * Whether this sender has already had their turn.
 *
 * Deliberately generous. This is a portfolio contact form: the cost of one person
 * sending four messages in ten minutes is nothing, and the cost of turning away someone
 * with a follow-up thought is a lost conversation. It stops a script, not a person.
 */
export function isThrottled(recentCount: number): boolean {
  return recentCount >= MAX_IN_WINDOW;
}

export const THROTTLE_MESSAGE =
  "That's a few messages in a short time. Give it ten minutes, or email me directly.";
