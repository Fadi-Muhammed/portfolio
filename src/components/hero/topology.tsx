import { TopologyGraph } from "./topology-graph";
import { TopologyLiveLoader } from "./topology-loader";

/**
 * The signature (B4, docs/DESIGN.md section 6 and 11).
 *
 * Two layers, one drawing. This is a server component, so the static layer is real HTML
 * from the same component the live one uses: the finished topology is on screen at first
 * paint — not a skeleton, not a blur, the real drawing minus the motion — and every node
 * is a working link before any JavaScript has run and with JavaScript off entirely.
 *
 * Nothing here reaches the client. `TopologyGraph` is imported by this server component
 * and by the live module behind the dynamic import, and by neither of the eager client
 * ones, which is what keeps the drawing code out of the bundle that blocks first paint.
 * Importing it from the loader instead cost 1.6 KB of lazy chunk and put the rest of it
 * in the entry bundle, which is the opposite of the point.
 */
export function Topology() {
  return (
    <div className="hero-topology">
      {/*
        Hidden by CSS the moment the live layer exists. It has to be a real removal
        rather than a visual one: two copies of the same six links would put every
        destination in the tab order twice and read it out twice.
      */}
      <div className="hero-topology__layer" data-topology="static">
        <TopologyGraph />
      </div>
      <TopologyLiveLoader />
    </div>
  );
}
