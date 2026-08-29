"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDeck } from "@/components/deck/deck-provider";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import {
  EDGES,
  NODES,
  YOU,
  distance,
  node,
  nodeForSection,
  pointAlong,
  pointerOffset,
  route,
  type NodeId,
  type Point,
} from "@/lib/hero/topology";
import { TopologyGraph, type PacketAt } from "./topology-graph";

/**
 * The topology, moving.
 *
 * Loaded after first paint (see `topology.tsx`), so none of this is in the bundle that
 * blocks the hero. Everything it draws comes from the pure module: this file owns the
 * clock, the pointer and the click, and nothing else.
 *
 * Three things stop it running: reduced motion, the tab being hidden, and the hero
 * being scrolled out of the deck. A phone quietly burning a frame budget on a section
 * nobody is looking at is the sort of thing that never shows up in a screenshot.
 */

/** Ambient drift, in viewBox units per second (docs/DESIGN.md section 6). */
const AMBIENT_SPEED = 60;
/** A click routes in a fixed time regardless of distance (11.7). */
const ROUTE_MS = 480;
/** Pointer spring. Stiff enough to feel attached, loose enough to settle in ~400 ms. */
const SPRING = 0.18;
const DAMPING = 0.72;

type Ambient = { id: string; from: NodeId; to: NodeId; progress: number };

const edgeKey = (from: NodeId, to: NodeId) => [from, to].sort().join("~");

/**
 * The next link for a packet to travel.
 *
 * Two rules beyond picking at random. It continues from the node it just arrived at,
 * because a packet that jumps somewhere else is not a packet. And it avoids a link
 * another packet is already on: with three packets choosing freely they bunched onto
 * one edge often enough to be the first thing visible in a screenshot, which left the
 * rest of the network looking dead.
 */
function nextEdge(
  from: NodeId | undefined,
  taken: ReadonlySet<string>,
): { from: NodeId; to: NodeId } {
  const incident = from ? EDGES.filter((edge) => edge.from === from || edge.to === from) : EDGES;
  const free = incident.filter((edge) => !taken.has(edgeKey(edge.from, edge.to)));
  const options = free.length > 0 ? free : incident;
  const edge = options[Math.floor(Math.random() * options.length)];
  return from
    ? { from, to: edge.from === from ? edge.to : edge.from }
    : { from: edge.from, to: edge.to };
}

/**
 * Three packets on a desktop, one on a phone (B4). Read at mount rather than passed
 * down, because the answer is a property of the viewport and not of the page.
 */
function ambientCountForViewport(): number {
  if (typeof window === "undefined") return 3;
  return window.matchMedia("(min-width: 768px)").matches ? 3 : 1;
}

export default function TopologyLive() {
  const [ambientCount] = useState(ambientCountForViewport);
  const { hopTo } = useDeck();
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const [offsets, setOffsets] = useState<ReadonlyMap<NodeId, Point>>(new Map());
  const [packets, setPackets] = useState<readonly PacketAt[]>([]);
  const [target, setTarget] = useState<NodeId | null>(null);

  // Mutable animation state. Kept in refs so a frame never queues a render it does not
  // need, and so the loop reads the current value rather than one closed over at setup.
  const pointer = useRef<Point | null>(null);
  const positions = useRef(new Map<NodeId, Point>());
  const velocities = useRef(new Map<NodeId, Point>());
  const ambients = useRef<Ambient[]>([]);
  /**
   * The packet a click (or the load sequence) put in flight. `hop` is what separates
   * the two: a click routes and then moves the deck, the arrival gesture only draws.
   */
  const routing = useRef<{ path: NodeId[]; started: number; to: NodeId; hop: boolean } | null>(
    null,
  );
  const [visible, setVisible] = useState(true);

  const activate = useCallback(
    (id: NodeId) => {
      const section = node(id).section;
      if (!section) return;

      if (reduced) {
        hopTo(section);
        return;
      }

      setTarget(id);
      routing.current = { path: route(YOU, id), started: performance.now(), to: id, hop: true };
    },
    [hopTo, reduced],
  );

  // Pause when the hero is off-screen or the tab is hidden.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(element);

    const onVisibility = () => setVisible(!document.hidden && !!containerRef.current);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Pointer position, in viewBox units so the spring maths never has to know about
  // CSS pixels or how far the drawing bleeds off the edge.
  useEffect(() => {
    if (reduced) return;
    const element = containerRef.current;
    if (!element) return;

    const svg = element.querySelector("svg");
    if (!svg) return;

    const toViewBox = (event: PointerEvent): Point | null => {
      if (event.pointerType === "touch") return null;
      const box = svg.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return null;
      // The drawing uses `slice`, so it is scaled to cover and cropped on the long axis.
      const scale = Math.max(box.width / 640, box.height / 420);
      return {
        x: (event.clientX - box.right) / scale + 640,
        y: (event.clientY - (box.top + box.height / 2)) / scale + 210,
      };
    };

    const onMove = (event: PointerEvent) => {
      pointer.current = toViewBox(event);
    };
    const onLeave = () => {
      pointer.current = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  useEffect(() => {
    if (reduced || !visible) return;

    if (ambients.current.length === 0) {
      const claimed = new Set<string>();
      ambients.current = Array.from({ length: ambientCount }, (_, index) => {
        const edge = nextEdge(undefined, claimed);
        claimed.add(edgeKey(edge.from, edge.to));
        return {
          id: `ambient-${index}`,
          ...edge,
          // Staggered, so they do not set off in convoy.
          progress: index / ambientCount,
        };
      });
    }

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;

      // Nodes ease toward wherever the pointer is pulling them.
      const nextOffsets = new Map<NodeId, Point>();
      for (const entry of NODES) {
        const goal = pointerOffset(entry, pointer.current);
        const current = positions.current.get(entry.id) ?? { x: 0, y: 0 };
        const velocity = velocities.current.get(entry.id) ?? { x: 0, y: 0 };

        velocity.x = (velocity.x + (goal.x - current.x) * SPRING) * DAMPING;
        velocity.y = (velocity.y + (goal.y - current.y) * SPRING) * DAMPING;
        current.x += velocity.x;
        current.y += velocity.y;

        positions.current.set(entry.id, current);
        velocities.current.set(entry.id, velocity);
        if (Math.abs(current.x) > 0.01 || Math.abs(current.y) > 0.01) {
          nextOffsets.set(entry.id, { x: current.x, y: current.y });
        }
      }
      setOffsets(nextOffsets);

      const drawn: PacketAt[] = [];

      for (const ambient of ambients.current) {
        const length = distance(ambient.from, ambient.to);
        ambient.progress += (AMBIENT_SPEED * dt) / length;
        if (ambient.progress >= 1) {
          const busy = new Set(
            ambients.current
              .filter((other) => other.id !== ambient.id)
              .map((other) => edgeKey(other.from, other.to)),
          );
          const next = nextEdge(ambient.to, busy);
          ambient.from = next.from;
          ambient.to = next.to;
          ambient.progress = 0;
        }
        drawn.push({
          id: ambient.id,
          at: pointAlong([ambient.from, ambient.to], ambient.progress),
        });
      }

      const inFlight = routing.current;
      if (inFlight) {
        const progress = (now - inFlight.started) / ROUTE_MS;
        if (progress >= 1) {
          routing.current = null;
          setTarget(null);
          const section = node(inFlight.to).section;
          if (inFlight.hop && section) hopTo(section);
        } else {
          drawn.push({ id: "routing", at: pointAlong(inFlight.path, progress) });
        }
      }

      setPackets(drawn);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [ambientCount, hopTo, reduced, visible]);

  // The load sequence's one gesture: a packet leaves "you" for Products, the same
  // journey the primary button makes (11.5). Ambient drift is already running behind it.
  useEffect(() => {
    if (reduced) return;
    const products = nodeForSection("products");
    const timer = window.setTimeout(() => {
      if (routing.current) return;
      routing.current = {
        path: route(YOU, products.id),
        started: performance.now(),
        to: products.id,
        // An arrival gesture, not a navigation. It draws the journey the primary button
        // makes and stops there; it must never move the deck out from under someone
        // who has just arrived and is still reading the tagline.
        hop: false,
      };
    }, 480);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  return (
    <div ref={containerRef} className="hero-topology__layer" data-topology="live">
      <TopologyGraph
        offsets={offsets}
        packets={packets}
        target={target}
        onNodeActivate={activate}
      />
    </div>
  );
}
