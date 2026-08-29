"use client";

import dynamic from "next/dynamic";
import { TopologyGraph } from "./topology-graph";

/**
 * The signature (B4, docs/DESIGN.md section 6 and 11).
 *
 * Two layers, one drawing. The static layer is server-rendered from the same component
 * the live one uses, so the finished topology is in the HTML at first paint — not a
 * skeleton, not a blur, the real drawing minus the motion — and every node is a working
 * link before any JavaScript has run and with JavaScript off entirely.
 *
 * The live layer arrives after first paint and takes over. Because both render
 * `TopologyGraph` from the same node table, the handover has nothing to flash: the
 * geometry is identical and only the movement is new.
 *
 * This wrapper is a client component solely because `ssr: false` has to be requested
 * from one. It holds no state and ships almost nothing; the weight is all behind the
 * dynamic import.
 */

const TopologyLive = dynamic(() => import("./topology-live"), { ssr: false });

export function Topology() {
  return (
    <div className="hero-topology">
      {/*
        Hidden by CSS the moment the live layer exists. It has to be a real removal
        rather than a visual one: two copies of the same seven links would put every
        destination in the tab order twice and read it out twice.
      */}
      <div className="hero-topology__layer" data-topology="static">
        <TopologyGraph />
      </div>
      <TopologyLive />
    </div>
  );
}
