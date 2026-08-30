"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A filter that lives in the URL rather than in state.
 *
 * Written for Achievements in Part 10 and pulled up here in Part 12, when About's skill
 * filter needed exactly the same thing. Two copies of this would have been the parallel
 * convention CLAUDE.md forbids, and the second copy is always the one that drifts.
 *
 * The query *is* the state — not state mirrored into the query afterwards. Both parts
 * ask for a filtered view to be shareable, and the cheapest way to guarantee the link and
 * the list can never disagree is to have only one of them. A deep link then needs no
 * special case: it is simply the store's first value.
 *
 * `replaceState`, not `push`: the deck already writes the hash with `replaceState` on
 * every section change, and pushing here would interleave filter states with those writes
 * and fill the back button with them. It also means `popstate` never fires for our own
 * writes, which is why subscribers are notified by hand.
 *
 * Read from `window.location` rather than `useSearchParams`, which would opt the
 * statically prerendered home page into dynamic rendering for a value only one component
 * needs.
 */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/** Announce a write we made ourselves, which popstate does not cover. */
function announce() {
  for (const listener of listeners) listener();
}

export function readParam(key: string): string {
  return new URL(window.location.href).searchParams.get(key) ?? "";
}

export function writeParam(key: string, value: string | null) {
  const url = new URL(window.location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  window.history.replaceState(null, "", url);
  announce();
}

/**
 * The current value of one query parameter, and a setter for it.
 *
 * The server has no URL to read, so its snapshot is always empty — which is the unfiltered
 * default, and therefore what the prerendered HTML should say.
 */
export function useQueryFilter(key: string): [string, (value: string | null) => void] {
  const read = useCallback(() => readParam(key), [key]);
  const value = useSyncExternalStore(subscribe, read, () => "");
  const set = useCallback((next: string | null) => writeParam(key, next), [key]);
  return [value, set];
}
