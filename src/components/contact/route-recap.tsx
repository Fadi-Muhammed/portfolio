"use client";

import { useDeck } from "@/components/deck/deck-provider";
import { SECTIONS } from "@/lib/deck/sections";

/**
 * The route you actually took (A9, B9).
 *
 * A small copy of the hero's topology with the sections you visited lit up. It is the
 * site's one closing flourish, and it earns its place by being about the visitor rather
 * than about the site: the same seven nodes for everyone, a different path for each.
 *
 * The deck already knows where you have been — the provider tracks the active section, and
 * this records each one as it becomes active. Nothing is stored anywhere; refresh and the
 * route starts again, which is the honest behaviour for something describing a single
 * visit.
 *
 * Reduced motion needs no branch: nothing here animates. A node is lit or it is not.
 */

export function RouteRecap() {
  const { visited } = useDeck();

  const y = 20;
  const step = 100 / (SECTIONS.length - 1);

  return (
    <figure className="recap">
      <svg
        className="recap__svg"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Your route: ${SECTIONS.filter((section) => visited.has(section.id))
          .map((section) => section.name)
          .join(", ")}.`}
        focusable="false"
      >
        <line
          className="recap__line"
          x1="0"
          y1={y}
          x2="100"
          y2={y}
          vectorEffect="non-scaling-stroke"
        />
        {SECTIONS.map((section, index) => (
          <circle
            key={section.id}
            className="recap__node"
            cx={index * step}
            cy={y}
            r="2.5"
            data-visited={visited.has(section.id) ? "" : undefined}
          />
        ))}
      </svg>
      <figcaption className="recap__caption text-data text-muted">Destination reached.</figcaption>
    </figure>
  );
}
