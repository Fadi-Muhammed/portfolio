/**
 * The four states, drawn in one vocabulary (B10, docs/DESIGN.md section 19).
 *
 * The 404 arrived with a small drawing of its own during the design audit, and it turned
 * out to have invented a language rather than a picture: a line is a route, solid where
 * traffic passes and dashed where it does not; a filled circle is a node that answers and
 * a hollow one is a node that does not; a square in `signal` is the packet. Four words.
 *
 * The other three states are three more sentences in it, and each says a different thing
 * about the network, because they are different failures:
 *
 *   not-found     the destination does not exist. The packet got most of the way and
 *                 stopped at a node that never answered; beyond it the route is drawn but
 *                 not travelled.
 *   dropped       the route is fine and this packet is not. Every node answers, the line
 *                 runs end to end, and the packet has fallen out of it at the hop that
 *                 lost it. That is what a 500 is: the site is up, this request died.
 *   no-signal     nothing is reachable. The break is at the first hop, immediately after
 *                 "you", and there is no packet anywhere — with no signal nothing is in
 *                 flight, and the absence is the drawing.
 *   maintenance   a node taken out of service on purpose. Hollow like a dead one, but
 *                 ringed, which is the difference between "not answering" and "answering
 *                 later". No packet: nothing is being lost, it is simply not being sent.
 *
 * Where the packet sits, and whether there is one at all, is the whole distinction between
 * the four. Nothing here is decoration — remove the packet from the 404 and it stops being
 * a 404.
 *
 * A server component with no state and no script. The error pages need to render when the
 * application has already failed, so the illustration cannot depend on it.
 */

export type StateVariant = "not-found" | "dropped" | "no-signal" | "maintenance";

/** What a screen reader is told. Each says the network condition, not the shapes. */
const LABEL: Record<StateVariant, string> = {
  "not-found": "A packet stopped at an unreachable node.",
  dropped: "A packet dropped out of an intact route.",
  "no-signal": "A route with no link beyond the first node.",
  maintenance: "A node taken out of service, with the route dashed either side.",
};

export function StateFigure({ variant }: { variant: StateVariant }) {
  return (
    <figure className="state__figure">
      <svg viewBox="0 0 240 60" role="img" aria-label={LABEL[variant]}>
        {variant === "not-found" ? <NotFound /> : null}
        {variant === "dropped" ? <Dropped /> : null}
        {variant === "no-signal" ? <NoSignal /> : null}
        {variant === "maintenance" ? <Maintenance /> : null}
      </svg>
    </figure>
  );
}

/** The route resolves as far as a node that does not answer. Beyond it, nothing travels. */
function NotFound() {
  return (
    <>
      <line className="state__edge" x1="10" y1="30" x2="150" y2="30" />
      <line className="state__edge" data-dead="" x1="150" y1="30" x2="230" y2="30" />

      <circle className="state__node" cx="10" cy="30" r="4" />
      <circle className="state__node" cx="80" cy="30" r="4" />
      <circle className="state__node" data-dead="" cx="150" cy="30" r="4" />

      <rect className="state__packet" x="112" y="26" width="7" height="7" />
    </>
  );
}

/**
 * Every node answers and the line runs the whole way: the route is not the problem.
 * The packet has left it at the middle hop, which is where a drop actually happens —
 * at a node, not between them.
 */
function Dropped() {
  return (
    <>
      <line className="state__edge" x1="10" y1="30" x2="230" y2="30" />

      <circle className="state__node" cx="10" cy="30" r="4" />
      <circle className="state__node" cx="120" cy="30" r="4" />
      <circle className="state__node" cx="230" cy="30" r="4" />

      {/* Where it went, drawn as a path not travelled — the same dash as an unusable route. */}
      <line className="state__edge" data-dead="" x1="120" y1="36" x2="120" y2="44" />
      <rect className="state__packet" x="116" y="46" width="7" height="7" />
    </>
  );
}

/**
 * The break is at the first hop. Your own interface is up — the stub out of "you" is
 * solid — and nothing past it can be reached. No packet: nothing is in flight.
 */
function NoSignal() {
  return (
    <>
      <line className="state__edge" x1="10" y1="30" x2="45" y2="30" />
      <line className="state__edge" data-dead="" x1="75" y1="30" x2="230" y2="30" />

      <circle className="state__node" cx="10" cy="30" r="4" />
      <circle className="state__node" data-dead="" cx="130" cy="30" r="4" />
      <circle className="state__node" data-dead="" cx="230" cy="30" r="4" />
    </>
  );
}

/**
 * Out of service on purpose. The ring is what separates this from the 404's dead node:
 * someone put it there, and someone will take it away.
 */
function Maintenance() {
  return (
    <>
      <line className="state__edge" x1="10" y1="30" x2="108" y2="30" />
      <line className="state__edge" data-dead="" x1="132" y1="30" x2="230" y2="30" />

      <circle className="state__node" cx="10" cy="30" r="4" />
      <circle className="state__node" data-dead="" cx="120" cy="30" r="4" />
      <circle className="state__ring" cx="120" cy="30" r="9" />
      <circle className="state__node" cx="230" cy="30" r="4" />
    </>
  );
}
