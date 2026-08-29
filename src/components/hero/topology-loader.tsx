"use client";

import dynamic from "next/dynamic";

/**
 * Loads the moving topology after first paint.
 *
 * All this exists for is that `ssr: false` has to be asked for from a client component.
 * It holds no state, imports nothing but the loader itself, and deliberately does not
 * reference `TopologyGraph` — anything this file touches ends up in the bundle that
 * blocks the hero, which is exactly what the split is meant to avoid.
 */
const TopologyLive = dynamic(() => import("./topology-live"), { ssr: false });

export function TopologyLiveLoader() {
  return <TopologyLive />;
}
