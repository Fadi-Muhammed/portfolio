"use client";

import { useEffect, useState } from "react";

/**
 * True when the visitor has asked for reduced motion.
 *
 * Declarative CSS transitions are already neutralised globally in globals.css. This
 * is for the scripted cases — the hero topology, the packet, the slider nudge — where
 * the right answer is not "animate faster" but "render the designed static state and
 * never start the loop at all".
 *
 * Starts false so server and client render the same markup, then corrects on mount.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
