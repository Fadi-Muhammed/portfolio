"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * True when the visitor has asked for reduced motion.
 *
 * Declarative CSS transitions are already neutralised globally in globals.css. This is
 * for the scripted cases — the hero topology, the packet, the slider nudge — where the
 * right answer is not "animate faster" but "render the designed static state and never
 * start the loop at all".
 *
 * The server renders the motion-allowed branch, matching the CSS default; visitors who
 * asked for reduced motion get it from the media query before this ever resolves.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
