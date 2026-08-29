import { describe, expect, it } from "vitest";
import { SECTIONS } from "@/lib/deck/sections";
import type { NodeId, TopologyNode } from "./topology";
import {
  EDGES,
  HIT_RADIUS,
  NODES,
  POINTER_PULL,
  VIEWBOX,
  distance,
  node,
  nodeForSection,
  pointAlong,
  pointerOffset,
  route,
  routeLength,
} from "./topology";

describe("the node table", () => {
  it("has a node for every section except the hero, which is where you are standing", () => {
    const routable = SECTIONS.map((section) => section.id).filter(
      (id): id is Exclude<typeof id, "hero"> => id !== "hero",
    );
    for (const section of routable) {
      expect(nodeForSection(section).section).toBe(section);
    }
    expect(NODES).toHaveLength(routable.length + 1);
    expect(node("you").section).toBeUndefined();
  });

  it("gives every node a distinct glyph, so no two destinations look alike", () => {
    const glyphs = NODES.map((entry) => entry.glyph);
    expect(new Set(glyphs).size).toBe(NODES.length);
  });

  it("keeps every node clear of the right edge, so nothing clickable bleeds off screen", () => {
    // docs/DESIGN.md 11.3: what runs past the viewport at 1440 is edge tails and quiet
    // ground. A destination the visitor cannot click is not a bleed, it is a bug.
    for (const entry of NODES) {
      expect(entry.x).toBeLessThanOrEqual(556);
    }
  });

  it("keeps every node inside both windows onto the geometry", () => {
    for (const window of [VIEWBOX.wide, VIEWBOX.narrow]) {
      for (const entry of NODES) {
        expect(entry.y).toBeGreaterThanOrEqual(window.y);
        expect(entry.y).toBeLessThanOrEqual(window.y + window.height);
      }
    }
  });

  it("keeps every node clear of edges it is not connected to", () => {
    // The invariant behind the layout. The first, hand-drawn version read as a tangle
    // on screen; this is what stops a later edit reintroducing one without noticing.
    const distanceToSegment = (p: TopologyNode, a: TopologyNode, b: TopologyNode) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lengthSquared = dx * dx + dy * dy;
      const t =
        lengthSquared === 0
          ? 0
          : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
      return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
    };

    for (const entry of NODES) {
      for (const edge of EDGES) {
        if (edge.from === entry.id || edge.to === entry.id) continue;
        expect(distanceToSegment(entry, node(edge.from), node(edge.to))).toBeGreaterThan(30);
      }
    }
  });

  it("keeps edge crossings down, so the drawing reads as a map", () => {
    const side = (p: TopologyNode, q: TopologyNode, r: TopologyNode) =>
      Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));

    let crossings = 0;
    for (const [index, a] of EDGES.entries()) {
      for (const b of EDGES.slice(index + 1)) {
        if (new Set([a.from, a.to, b.from, b.to]).size < 4) continue;
        const [p, q, r, s] = [node(a.from), node(a.to), node(b.from), node(b.to)];
        if (side(p, q, r) !== side(p, q, s) && side(r, s, p) !== side(r, s, q)) crossings += 1;
      }
    }
    // Two. The hand-drawn first layout had six and looked like a scribble.
    expect(crossings).toBeLessThanOrEqual(2);
  });

  it("spaces nodes so their hit targets never overlap", () => {
    for (const a of NODES) {
      for (const b of NODES) {
        if (a.id === b.id) continue;
        expect(distance(a.id, b.id)).toBeGreaterThan(HIT_RADIUS * 2);
      }
    }
  });

  it("refuses an unknown node rather than drawing nothing", () => {
    // @ts-expect-error — the point of the test is the runtime guard behind the type.
    expect(() => node("switchboard")).toThrow();
  });
});

describe("the edge list", () => {
  it("connects the sections in deck order", () => {
    const order = SECTIONS.map((section) => section.id);
    const deckEdges = EDGES.filter((edge) => edge.kind === "deck");
    expect(deckEdges).toHaveLength(order.length - 1);

    deckEdges.forEach((edge, index) => {
      const from = index === 0 ? "you" : order[index];
      expect(edge.from).toBe(from);
      expect(edge.to).toBe(order[index + 1]);
    });
  });

  it("reaches every node, so no destination is stranded", () => {
    for (const entry of NODES) {
      expect(route("you", entry.id).length).toBeGreaterThan(0);
    }
  });

  it("names both ends of every edge as real nodes", () => {
    for (const edge of EDGES) {
      expect(() => node(edge.from)).not.toThrow();
      expect(() => node(edge.to)).not.toThrow();
    }
  });

  it("has no duplicate or self edges", () => {
    const seen = new Set<string>();
    for (const edge of EDGES) {
      expect(edge.from).not.toBe(edge.to);
      const key = [edge.from, edge.to].sort().join("~");
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
});

describe("routing a packet", () => {
  it("takes the direct cross-link to contact rather than walking the whole deck", () => {
    // "Work with me" is one hop. If this ever becomes six, the cross-link is gone and
    // the topology has stopped agreeing with what the buttons do.
    expect(route("you", "contact")).toEqual(["you", "contact"]);
  });

  it("reaches about through products, which is shorter than going the long way", () => {
    expect(route("you", "about")).toEqual(["you", "products", "about"]);
  });

  it("finds the genuinely shortest route, checked against every alternative", () => {
    // Brute force over all simple paths. Seven nodes makes that cheap, and it asserts
    // the property rather than a hand-computed answer — the first version of this test
    // asserted a path I had worked out on paper with one cross-link forgotten, and the
    // arithmetic, not the code, was wrong.
    const all = (from: NodeId, to: NodeId, seen: NodeId[] = []): NodeId[][] => {
      if (from === to) return [[from]];
      const paths: NodeId[][] = [];
      for (const edge of EDGES) {
        const next = edge.from === from ? edge.to : edge.to === from ? edge.from : null;
        if (!next || seen.includes(next)) continue;
        for (const rest of all(next, to, [...seen, from])) paths.push([from, ...rest]);
      }
      return paths;
    };

    for (const entry of NODES) {
      const shortest = Math.min(...all("you", entry.id).map(routeLength));
      expect(routeLength(route("you", entry.id))).toBeCloseTo(shortest, 6);
    }
  });

  it("takes the longest route on the map inside the 600 ms ceiling", () => {
    // Featured in, 533 units over four hops, is the furthest anything travels. The
    // packet is given a fixed 480 ms regardless of length (11.7), so this is the number
    // that has to stay comfortable rather than a duration to compute.
    const longest = Math.max(...NODES.map((entry) => routeLength(route("you", entry.id))));
    expect(Math.round(longest)).toBe(533);
    expect(route("you", "featured-in")).toEqual([
      "you",
      "products",
      "engineering",
      "achievements",
      "featured-in",
    ]);
  });

  it("only ever steps along links that exist", () => {
    const linked = new Set(
      EDGES.flatMap((edge) => [`${edge.from}~${edge.to}`, `${edge.to}~${edge.from}`]),
    );
    for (const entry of NODES) {
      const path = route("you", entry.id);
      for (let index = 0; index < path.length - 1; index += 1) {
        expect(linked.has(`${path[index]}~${path[index + 1]}`)).toBe(true);
      }
    }
  });

  it("stays put when it is already there", () => {
    expect(route("about", "about")).toEqual(["about"]);
  });

  it("is symmetric, because the links are", () => {
    expect(route("contact", "you")).toEqual([...route("you", "contact")].reverse());
  });
});

describe("where the packet is", () => {
  it("starts on the first node and ends on the last", () => {
    const path = route("you", "featured-in");
    expect(pointAlong(path, 0)).toEqual({ x: node("you").x, y: node("you").y });
    expect(pointAlong(path, 1)).toEqual({
      x: node("featured-in").x,
      y: node("featured-in").y,
    });
  });

  it("moves at a constant speed, so it does not lurch across a short link", () => {
    const path = route("you", "featured-in");
    const total = routeLength(path);
    const step = 0.02;
    let previous = pointAlong(path, 0);
    const lengths: number[] = [];
    for (let progress = step; progress <= 1.0001; progress += step) {
      const current = pointAlong(path, progress);
      lengths.push(Math.hypot(current.x - previous.x, current.y - previous.y));
      previous = current;
    }
    // Every step covers the same ground, give or take the corners where the route turns.
    const expected = total * step;
    for (const length of lengths) {
      expect(length).toBeLessThan(expected * 1.5);
    }
  });

  it("never leaves the route, even given progress outside 0 to 1", () => {
    const path = route("you", "contact");
    expect(pointAlong(path, -3)).toEqual({ x: node("you").x, y: node("you").y });
    expect(pointAlong(path, 42)).toEqual({ x: node("contact").x, y: node("contact").y });
  });

  it("handles a route of one node", () => {
    expect(pointAlong(["about"], 0.5)).toEqual({ x: node("about").x, y: node("about").y });
  });

  it("refuses an empty route rather than returning a point that means nothing", () => {
    expect(() => pointAlong([], 0.5)).toThrow();
  });
});

describe("the pointer", () => {
  it("pulls a node toward the cursor, never further than the cap", () => {
    const products = node("products");
    const offset = pointerOffset(products, { x: products.x + 30, y: products.y });
    expect(offset.x).toBeGreaterThan(0);
    expect(Math.hypot(offset.x, offset.y)).toBeLessThanOrEqual(POINTER_PULL + 0.001);
  });

  it("leaves you where you are", () => {
    // The network flexes around the visitor; the visitor does not drift.
    const you = node("you");
    expect(pointerOffset(you, { x: you.x + 10, y: you.y + 10 })).toEqual({ x: 0, y: 0 });
  });

  it("ignores a pointer that is far away, and a pointer that is absent", () => {
    const about = node("about");
    expect(pointerOffset(about, { x: about.x + 400, y: about.y })).toEqual({ x: 0, y: 0 });
    expect(pointerOffset(about, null)).toEqual({ x: 0, y: 0 });
  });

  it("eases out of range rather than stopping dead at the edge", () => {
    const about = node("about");
    const near = pointerOffset(about, { x: about.x + 20, y: about.y });
    const far = pointerOffset(about, { x: about.x + 110, y: about.y });
    expect(near.x).toBeGreaterThan(far.x);
    expect(far.x).toBeGreaterThan(0);
    expect(far.x).toBeLessThan(0.5);
  });
});
