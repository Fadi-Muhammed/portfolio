import { GlyphDefs, GLYPH_IDS } from "./glyphs";
import {
  EDGES,
  HIT_RADIUS,
  NODES,
  labelOffset,
  node,
  type NodeId,
  type Point,
} from "@/lib/hero/topology";

/**
 * The drawing. One component, two callers.
 *
 * The server renders it with no offsets and no packets — that is the static SVG that
 * arrives in the HTML, works with JavaScript off, and means first paint is never blank.
 * The live module renders the same markup with pointer displacement and packets in
 * flight. Because it is literally the same component, the moment the live layer takes
 * over there is nothing to flash: the geometry is identical and only the motion is new.
 *
 * It takes no decisions of its own. Where a node sits, where a packet is and which
 * route it takes are all computed in `@/lib/hero/topology`, which is pure and tested.
 */

export type PacketAt = { id: string; at: Point };

type Props = {
  /** Pointer displacement per node. Absent means every node is at rest. */
  offsets?: ReadonlyMap<NodeId, Point>;
  packets?: readonly PacketAt[];
  /** The node a click is currently routing to. Fills in `signal` until the deck hops. */
  target?: NodeId | null;
  onNodeActivate?: (id: NodeId) => void;
};

const ZERO: Point = { x: 0, y: 0 };

export function TopologyGraph({ offsets, packets = [], target = null, onNodeActivate }: Props) {
  const at = (id: NodeId): Point => {
    const base = node(id);
    const offset = offsets?.get(id) ?? ZERO;
    return { x: base.x + offset.x, y: base.y + offset.y };
  };

  return (
    <svg
      className="hero-topology__svg"
      viewBox="0 0 640 420"
      preserveAspectRatio="xMaxYMid slice"
      // The drawing is decoration for a screen reader: every destination in it is also
      // a link in the nav, the rail and the palette. The nodes inside it keep their own
      // accessible names so a keyboard visitor who tabs into one still knows what it is.
      role="presentation"
    >
      <GlyphDefs />

      <g className="hero-topology__edges">
        {EDGES.map((edge) => {
          const from = at(edge.from);
          const to = at(edge.to);
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              className={
                edge.kind === "cross"
                  ? "hero-topology__edge hero-topology__edge--cross"
                  : "hero-topology__edge"
              }
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
            />
          );
        })}
      </g>

      {NODES.map((entry) => {
        const point = at(entry.id);
        const offset = labelOffset(entry);

        const contents = (
          <>
            {/* An invisible target sized independently of the glyph, so a 20 px drawing
                still clears 44 px of tappable area at every viewport. */}
            <circle className="hero-topology__hit" cx={0} cy={0} r={HIT_RADIUS} />
            <use href={`#${GLYPH_IDS[entry.glyph]}`} />
            {/* Only destinations are named. The "you" node carries the packet square on
                its screen, which already says where you are; a hover label repeating it
                in words was the same fact told twice, on the one node that is not a
                control. */}
            {entry.section ? (
              <text className="hero-topology__label" y={offset} textAnchor="middle">
                {entry.label}
              </text>
            ) : null}
          </>
        );

        const transform = `translate(${point.x} ${point.y})`;
        const className = [
          "hero-topology__node",
          entry.id === "you" ? "hero-topology__node--you" : "",
          target === entry.id ? "hero-topology__node--target" : "",
        ]
          .filter(Boolean)
          .join(" ");

        // "You" is where the visitor already is, so it is a mark rather than a control.
        if (!entry.section) {
          return (
            <g key={entry.id} className={className} transform={transform} aria-hidden="true">
              {contents}
            </g>
          );
        }

        // The transform lives on a wrapping <g>: an SVG <a> is typed as an HTML anchor
        // in React, which has no transform attribute.
        return (
          <g key={entry.id} transform={transform}>
            <a
              className={className}
              href={`#${entry.section}`}
              aria-label={`Route to ${entry.label}`}
              onClick={
                onNodeActivate
                  ? (event) => {
                      // Let a modified click do what the visitor asked — open in a new
                      // tab, copy the link — instead of animating a packet they will
                      // never see.
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                      event.preventDefault();
                      onNodeActivate(entry.id);
                    }
                  : undefined
              }
            >
              {contents}
            </a>
          </g>
        );
      })}

      {packets.map((packet) => (
        <rect
          key={packet.id}
          className="hero-topology__packet"
          x={packet.at.x - 1.75}
          y={packet.at.y - 1.75}
          width={3.5}
          height={3.5}
        />
      ))}
    </svg>
  );
}
