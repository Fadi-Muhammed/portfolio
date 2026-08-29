import type { GlyphId } from "@/lib/hero/topology";

/**
 * The seven network glyphs, drawn once into `<defs>` and referenced by `<use>`.
 *
 * These are the nodes of the topology (docs/DESIGN.md 11.3). Each one is assigned
 * because it is true of its section, not because it looks technical: a terminal is an
 * endpoint, a server is a thing that runs, an antenna is the RF work, a dish points at
 * a stage, a cloud is the outside world, a switch is a hub with many ports, and a
 * router is the way out of one network into another.
 *
 * What keeps seven glyphs a set rather than an icon collection: one stroke weight, one
 * colour, no fill except the packet square inside the terminal, round caps and joins,
 * and every glyph fitted to the same optical size inside a 24-unit box centred on the
 * origin. `vector-effect: non-scaling-stroke` holds the hairline at exactly 1 px at
 * every viewport, which is what stops the topology thickening up on a phone and
 * starting to compete with the tagline.
 */

export const GLYPH_IDS = {
  terminal: "hero-glyph-terminal",
  server: "hero-glyph-server",
  antenna: "hero-glyph-antenna",
  dish: "hero-glyph-dish",
  cloud: "hero-glyph-cloud",
  switch: "hero-glyph-switch",
  router: "hero-glyph-router",
} as const satisfies Record<GlyphId, string>;

export function GlyphDefs() {
  return (
    <defs>
      {/* Terminal — you. The packet square sits on its screen, which is the same mark
          as the tittle of the "i" in the Fadi logotype, so the site's own mark appears
          inside its signature. */}
      <g id={GLYPH_IDS.terminal} className="hero-topology__glyph">
        <rect x="-10" y="-9" width="20" height="14" rx="1" />
        <path d="M0 5v4M-5 9h10" />
        <rect className="hero-topology__here" x="-2" y="-4" width="4" height="4" />
      </g>

      {/* Server — products. Three units in a stack, each with its own indicator. */}
      <g id={GLYPH_IDS.server} className="hero-topology__glyph">
        <rect x="-7" y="-11" width="14" height="22" rx="1" />
        <path d="M-7-4h14M-7 3h14" />
        <path d="M-4-7.5h0M-4-0.5h0M-4 6.5h0" strokeLinecap="round" strokeWidth="2" />
      </g>

      {/*
        Antenna — engineering. A lattice mast in elevation, radiating from the top.

        Drawn as two near-vertical legs with rungs rather than as a triangle with a
        crossbar: the first version was an isosceles triangle bisected by a bar, which
        at 13 px on a phone read unmistakably as a capital A.
      */}
      <g id={GLYPH_IDS.antenna} className="hero-topology__glyph">
        <path d="M-4.6 11L-1.4-9M4.6 11L1.4-9" />
        <path d="M-3.4 4h6.8M-2.4-2h4.8" />
        <path d="M0-9v-2.5" />
        <path d="M2.4-11.6a5 5 0 0 1 3.4 3.6" />
        <path d="M3-14.6a8.5 8.5 0 0 1 5.8 6" />
      </g>

      {/* Dish — achievements and talks, pointed outward at a stage. */}
      <g id={GLYPH_IDS.dish} className="hero-topology__glyph">
        <path d="M-10-2A11 11 0 0 1 4-11" />
        <path d="M-10-2A11 11 0 0 0 3 5" />
        <path d="M-3.5-3l6-3.5" />
        <circle cx="3.5" cy="-7.2" r="1.6" />
        <path d="M-2 2l3 8M-3 10h8" />
      </g>

      {/* Cloud — featured in. The outside world, where coverage lives. */}
      <g id={GLYPH_IDS.cloud} className="hero-topology__glyph">
        <path d="M-11 5a4.6 4.6 0 0 1 .6-9.1a6.6 6.6 0 0 1 12.3-1.6a5.2 5.2 0 0 1 7.4 5.6a3.4 3.4 0 0 1-1.3 5.1z" />
      </g>

      {/* Switch — about. Ports along the bottom edge: the hub where the skill tags fan
          out to both bodies of work, which is why two edges land here. */}
      <g id={GLYPH_IDS.switch} className="hero-topology__glyph">
        <rect x="-12" y="-6" width="24" height="11" rx="1" />
        <path d="M-7 5v4M-2.3 5v4M2.3 5v4M7 5v4" />
        <path d="M-6-.5h5M1-3h5" />
      </g>

      {/* Router — contact. The gateway out of this network to a person. */}
      <g id={GLYPH_IDS.router} className="hero-topology__glyph">
        <path d="M-11-5a11 4 0 0 1 22 0v9a11 4 0 0 1-22 0z" />
        <ellipse cx="0" cy="-5" rx="11" ry="4" />
        <path d="M-5.5-5.5h9M.5-8l3 2.5-3 2.5" />
      </g>
    </defs>
  );
}
