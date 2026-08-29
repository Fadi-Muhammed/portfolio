/**
 * The hero topology as data and arithmetic.
 *
 * Everything here is pure: the node table, the edge list, the shortest route between
 * two nodes, and where a packet sits at a given moment. No DOM, no React, no SVG. The
 * drawing is a separate concern and reads these numbers; the numbers are what gets
 * unit-tested, which is the only way to assert that a packet travels along a link that
 * actually exists rather than across empty space.
 *
 * Coordinates live in the `viewBox="0 0 640 420"` space fixed by docs/DESIGN.md section
 * 6 and measured in section 11.3. Desktop and mobile use the same numbers and differ
 * only in the window onto them (11.4), so there is one geometry and one set of tests.
 */

import type { SectionId } from "@/lib/deck/sections";

/** Which glyph a node is drawn as. Assigned per docs/DESIGN.md 11.3, never decorative. */
export type GlyphId = "terminal" | "server" | "antenna" | "dish" | "cloud" | "switch" | "router";

/**
 * The "you" node is not a section. It is where the visitor is standing, which on the
 * hero is the hero itself — so it occupies the slot a "Home" node would have taken
 * rather than sitting next to a control that does nothing (11.3).
 */
export const YOU = "you" as const;
export type NodeId = typeof YOU | Exclude<SectionId, "hero">;

export type TopologyNode = {
  id: NodeId;
  x: number;
  y: number;
  glyph: GlyphId;
  /** The section this routes to. Absent on "you", which is already here. */
  section?: Exclude<SectionId, "hero">;
  /** Accessible name for the control, per Part 7 step 3. */
  label: string;
};

/**
 * Where the nodes sit.
 *
 * x increases with deck order, so the drawing reads left to right as the sequence a
 * visitor actually walks. y was chosen by search rather than by eye, against three
 * measured constraints: edges cross as little as possible, no node sits closer than
 * 30 units to an edge it is not connected to, and no two nodes come within 120. The
 * first layout was drawn by hand and had six edge crossings; on screen it read as a
 * tangle rather than a map, which is the failure mode a node-link diagram has to avoid
 * to be worth drawing at all. This one has two. The invariants are asserted in the
 * tests so the next edit cannot quietly undo it.
 */
export const NODES: readonly TopologyNode[] = [
  { id: "you", x: 86, y: 222, glyph: "terminal", label: "You are here" },
  { id: "products", x: 156, y: 104, glyph: "server", section: "products", label: "Products" },
  {
    id: "engineering",
    x: 248,
    y: 200,
    glyph: "antenna",
    section: "engineering",
    label: "Engineering",
  },
  {
    id: "achievements",
    x: 328,
    y: 312,
    glyph: "dish",
    section: "achievements",
    label: "Achievements",
  },
  {
    id: "featured-in",
    x: 398,
    y: 208,
    glyph: "cloud",
    section: "featured-in",
    label: "Featured in",
  },
  { id: "about", x: 478, y: 116, glyph: "switch", section: "about", label: "About" },
  { id: "contact", x: 548, y: 310, glyph: "router", section: "contact", label: "Contact" },
];

export type Edge = {
  from: NodeId;
  to: NodeId;
  /**
   * Deck-order edges are the sequence a visitor walks and are drawn solid. Cross-links
   * are drawn dashed and each one is a route the site genuinely offers — they are not
   * there to balance the picture (11.3).
   */
  kind: "deck" | "cross";
};

export const EDGES: readonly Edge[] = [
  { from: "you", to: "products", kind: "deck" },
  { from: "products", to: "engineering", kind: "deck" },
  { from: "engineering", to: "achievements", kind: "deck" },
  { from: "achievements", to: "featured-in", kind: "deck" },
  { from: "featured-in", to: "about", kind: "deck" },
  { from: "about", to: "contact", kind: "deck" },
  // "Work with me" and the nav's Contact link both route straight there.
  { from: "you", to: "contact", kind: "cross" },
  // About's skill tags filter both bodies of work (B2 item 6). Two real links, and the
  // reason the About node is drawn as a switch.
  { from: "products", to: "about", kind: "cross" },
  { from: "engineering", to: "about", kind: "cross" },
];

/** The window onto the geometry. One graph, two crops (11.4). */
export const VIEWBOX = {
  wide: { x: 0, y: 0, width: 640, height: 420 },
  narrow: { x: 0, y: 64, width: 640, height: 292 },
} as const;

/**
 * Hit target radius in viewBox units, independent of how large the glyph is drawn.
 *
 * Sized from the *smallest* scale the drawing is ever rendered at, not the largest. The
 * narrowest box is a 390 px phone, where 640 units are drawn across roughly 342 px — a
 * scale of 0.534. B12 requires 44 px, so the radius has to be at least 41 units for the
 * target to clear that on the device where it matters most. At 22 units, which is what
 * this was first set to, a node measured 40 px on a desktop and 23 px on a phone.
 *
 * The circle is invisible and far larger than the 24-unit glyph inside it. That is the
 * point: what a finger has to hit is not what the eye has to read.
 */
export const HIT_RADIUS = 42;

/** How far a node may be pulled toward the pointer, and how far away it stops caring. */
export const POINTER_PULL = 6;
export const POINTER_RADIUS = 120;

const byId = new Map(NODES.map((node) => [node.id, node]));

export function node(id: NodeId): TopologyNode {
  const found = byId.get(id);
  if (!found) throw new Error(`Unknown topology node: ${id}`);
  return found;
}

export function nodeForSection(section: Exclude<SectionId, "hero">): TopologyNode {
  const found = NODES.find((candidate) => candidate.section === section);
  if (!found) throw new Error(`No topology node routes to: ${section}`);
  return found;
}

/**
 * Where a node's label sits, relative to the node.
 *
 * Below by default. Above for the two lowest nodes, whose labels would otherwise fall
 * outside the narrow window the phone crops to (11.4) and be clipped mid-word.
 */
export function labelOffset(target: TopologyNode): number {
  return target.y > 280 ? -20 : 26;
}

export function distance(a: NodeId, b: NodeId): number {
  const from = node(a);
  const to = node(b);
  return Math.hypot(to.x - from.x, to.y - from.y);
}

const neighbours = new Map<NodeId, NodeId[]>();
for (const edge of EDGES) {
  if (!neighbours.has(edge.from)) neighbours.set(edge.from, []);
  if (!neighbours.has(edge.to)) neighbours.set(edge.to, []);
  neighbours.get(edge.from)!.push(edge.to);
  neighbours.get(edge.to)!.push(edge.from);
}

/**
 * The shortest route from one node to another, over links that exist.
 *
 * Weighted by drawn length rather than by hop count. In the current edge list the two
 * happen to agree everywhere, so the weighting is defensive rather than load-bearing —
 * but a packet that visibly took the longer of two lines would undo the one thing this
 * drawing is for. A packet has to travel the way a packet would, because a packet
 * crossing where there is no link is a lie about a network.
 *
 * Returns the nodes in order including both ends, or an empty array if there is no
 * route (there always is in this graph; the check is here so a future edge list that
 * strands a node fails a test rather than rendering a packet into nowhere).
 */
export function route(from: NodeId, to: NodeId): NodeId[] {
  if (from === to) return [from];

  const best = new Map<NodeId, number>([[from, 0]]);
  const previous = new Map<NodeId, NodeId>();
  const unvisited = new Set<NodeId>(NODES.map((candidate) => candidate.id));

  while (unvisited.size > 0) {
    let current: NodeId | null = null;
    let currentCost = Infinity;
    for (const candidate of unvisited) {
      const cost = best.get(candidate) ?? Infinity;
      if (cost < currentCost) {
        current = candidate;
        currentCost = cost;
      }
    }
    if (current === null || currentCost === Infinity) break;
    if (current === to) break;

    unvisited.delete(current);
    for (const next of neighbours.get(current) ?? []) {
      if (!unvisited.has(next)) continue;
      const cost = currentCost + distance(current, next);
      if (cost < (best.get(next) ?? Infinity)) {
        best.set(next, cost);
        previous.set(next, current);
      }
    }
  }

  if (!best.has(to)) return [];

  const path: NodeId[] = [to];
  let step = to;
  while (step !== from) {
    const back = previous.get(step);
    if (!back) return [];
    path.unshift(back);
    step = back;
  }
  return path;
}

export type Point = { x: number; y: number };

/**
 * Where a packet sits along a route, given progress from 0 to 1 over the whole journey.
 *
 * Progress is measured in drawn length rather than in hops, so the packet moves at a
 * constant speed and does not lurch when it crosses a short link. Out-of-range values
 * are clamped: a frame can arrive late, and a packet parked slightly past its
 * destination looks like a bug.
 */
export function pointAlong(path: readonly NodeId[], progress: number): Point {
  if (path.length === 0) throw new Error("Cannot interpolate along an empty route");
  const first = node(path[0]);
  if (path.length === 1) return { x: first.x, y: first.y };

  const clamped = Math.min(1, Math.max(0, progress));
  // Land exactly on the ends. Accumulating leg lengths puts the last point a floating
  // hair past its node, which is invisible on screen but means a packet never quite
  // arrives — and makes every assertion about arrival approximate.
  if (clamped === 1) {
    const last = node(path[path.length - 1]);
    return { x: last.x, y: last.y };
  }
  const legs = path.slice(0, -1).map((from, index) => distance(from, path[index + 1]));
  const total = legs.reduce((sum, leg) => sum + leg, 0);
  if (total === 0) return { x: first.x, y: first.y };

  let travelled = clamped * total;
  for (const [index, leg] of legs.entries()) {
    if (travelled <= leg || index === legs.length - 1) {
      const from = node(path[index]);
      const to = node(path[index + 1]);
      const fraction = leg === 0 ? 1 : Math.min(1, travelled / leg);
      return {
        x: from.x + (to.x - from.x) * fraction,
        y: from.y + (to.y - from.y) * fraction,
      };
    }
    travelled -= leg;
  }

  const last = node(path[path.length - 1]);
  return { x: last.x, y: last.y };
}

export function routeLength(path: readonly NodeId[]): number {
  return path.slice(0, -1).reduce((sum, from, index) => sum + distance(from, path[index + 1]), 0);
}

/**
 * How far a node is displaced by the pointer.
 *
 * "you" never moves. The network flexes around the visitor and the visitor stays put,
 * which is what separates a map with a fixed reference point from a field of drifting
 * dots (11.6). Falloff is cosine rather than linear so a node eases out of the
 * pointer's influence instead of stopping dead at the radius.
 */
export function pointerOffset(target: TopologyNode, pointer: Point | null): Point {
  if (!pointer || target.id === YOU) return { x: 0, y: 0 };

  const dx = pointer.x - target.x;
  const dy = pointer.y - target.y;
  const away = Math.hypot(dx, dy);
  if (away === 0 || away > POINTER_RADIUS) return { x: 0, y: 0 };

  const falloff = (Math.cos((away / POINTER_RADIUS) * Math.PI) + 1) / 2;
  const pull = POINTER_PULL * falloff;
  return { x: (dx / away) * pull, y: (dy / away) * pull };
}
