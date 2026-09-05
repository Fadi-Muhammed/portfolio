/**
 * Maintenance mode: the flag, the bypass, and the comparison that guards it.
 *
 * Pure, and separate from the proxy that uses it, for two reasons. The proxy runs before
 * every request and is the wrong place to work anything out, and a bypass that silently
 * stopped matching would hand Fadi a site he cannot get into — so the matching is here,
 * where it can be tested.
 *
 * Deliberately not part of the zod parse in env.ts. That schema throws when any variable
 * in it is missing, and both of these are optional by design: a site with no
 * MAINTENANCE_MODE is a site that is up, which is the normal case and must never be an
 * error. It is the same reasoning that keeps the design-route flag out of it.
 */

/** The query parameter that grants the bypass: /?key=… */
export const BYPASS_PARAM = "key";

/** Where the grant is kept afterwards, so the key is typed once rather than appended to
 *  every link followed for the rest of the session. */
export const BYPASS_COOKIE = "maintenance_bypass";

/** A fortnight. Long enough to cover a maintenance window, short enough to expire. */
export const BYPASS_MAX_AGE = 60 * 60 * 24 * 14;

export type MaintenanceEnv = {
  MAINTENANCE_MODE?: string;
  MAINTENANCE_BYPASS_KEY?: string;
};

export type MaintenanceConfig = {
  enabled: boolean;
  /** Null when unset, which means nobody can bypass — including Fadi. */
  key: string | null;
};

/**
 * Only the exact string "true" turns this on.
 *
 * Anything else is off, including "1", "yes" and "TRUE". A flag that takes a site down
 * should be hard to switch by accident, and a loose reading of what counts as true is
 * how an unrelated variable named MAINTENANCE_MODE=false ends up serving the page.
 */
export function readMaintenance(env: MaintenanceEnv): MaintenanceConfig {
  const key = env.MAINTENANCE_BYPASS_KEY?.trim();
  return {
    enabled: env.MAINTENANCE_MODE === "true",
    key: key ? key : null,
  };
}

/**
 * Compare in time that does not depend on how much of the string matched.
 *
 * A `===` on a secret leaks its prefix: the comparison stops at the first wrong
 * character, and the difference is measurable across enough attempts. The cost of not
 * leaking it is this function, so there is no reason to leak it.
 */
export function secretEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return difference === 0;
}

/** Whether an offered value — from the query or from the cookie — is the bypass key. */
export function isBypass(offered: string | null | undefined, key: string | null): boolean {
  if (!key || !offered) return false;
  return secretEquals(offered, key);
}
