import { VisuallyHidden } from "@/components/ui/visually-hidden";

/**
 * The three-way handshake (B5, B9): SYN, SYN-ACK, ACK, drawn between two nodes.
 *
 * The third orchestrated moment on the site, after the hero's load and the engineering
 * diagrams. It earns that by being literally true rather than decorative: the visitor has
 * just opened a connection, and this is what opening a connection looks like. The arrows
 * are labelled with the real flag names because a network engineer's contact form should
 * not have to explain the joke.
 *
 * Drawn as one SVG rather than three elements: the two nodes and the three arrows share a
 * coordinate space, and animating them apart would mean keeping three positions in step
 * by hand.
 *
 * Under reduced motion the whole sequence is simply present — every arrow drawn, every
 * label visible. That is the designed end state rather than a degradation, which is why
 * there is no separate static version to maintain.
 */

export function Handshake() {
  return (
    <figure className="handshake">
      <svg
        className="handshake__svg"
        viewBox="0 0 260 96"
        role="img"
        aria-label="A three-way handshake completing: SYN, SYN-ACK, ACK."
        focusable="false"
      >
        {/* The two endpoints. Left is the visitor, right is the site. */}
        <circle className="handshake__node" cx="18" cy="48" r="4" />
        <circle className="handshake__node" cx="242" cy="48" r="4" />
        <line className="handshake__spine" x1="18" y1="48" x2="242" y2="48" />

        {/* SYN — out. */}
        <g className="handshake__step" data-step="1">
          <line className="handshake__arrow" x1="26" y1="24" x2="234" y2="24" />
          <polyline className="handshake__head" points="226,19 234,24 226,29" />
          <text className="handshake__label" x="130" y="16">
            SYN
          </text>
        </g>

        {/* SYN-ACK — back. */}
        <g className="handshake__step" data-step="2">
          <line className="handshake__arrow" x1="234" y1="48" x2="26" y2="48" />
          <polyline className="handshake__head" points="34,43 26,48 34,53" />
          <text className="handshake__label" x="130" y="40">
            SYN-ACK
          </text>
        </g>

        {/* ACK — out, and the connection is open. */}
        <g className="handshake__step" data-step="3">
          <line className="handshake__arrow" x1="26" y1="72" x2="234" y2="72" />
          <polyline className="handshake__head" points="226,67 234,72 226,77" />
          <text className="handshake__label" x="130" y="64">
            ACK
          </text>
        </g>
      </svg>

      <VisuallyHidden>
        <p>Connection established.</p>
      </VisuallyHidden>
    </figure>
  );
}
