"use client";

import { usePathname } from "next/navigation";
import { useDeck } from "@/components/deck/deck-provider";

/**
 * The first thing in the tab order (B3). Invisible until focused, then it lands at the
 * top-left where a keyboard visitor expects it.
 *
 * On the deck it goes to Contact rather than to "main content", because there the content
 * is where you already are — what a keyboard visitor cannot reach cheaply is the end.
 *
 * Everywhere else it goes to that page's own main landmark. It used to say "Skip to
 * contact" on every route, which on a case study pointed at a #contact that is not there:
 * the link moved focus nowhere, and Lighthouse's skip-link audit failed on both detail
 * types. Another consequence of the chrome moving into the root layout during the audit —
 * the skip link came with it and kept assuming the deck underneath it.
 *
 * Absent on /maintenance, which has nothing to skip past.
 */
export function SkipLink() {
  const { hopTo } = useDeck();
  const pathname = usePathname();

  if (pathname === "/maintenance") return null;

  // The deck is only ever at the root. Anywhere else, the page's own main landmark is
  // both the honest destination and one that exists.
  if (pathname !== "/") {
    return (
      <a href="#main" className="skip-link text-small">
        Skip to content
      </a>
    );
  }

  return (
    <a
      href="#contact"
      onClick={(event) => {
        event.preventDefault();
        hopTo("contact");
      }}
      className="skip-link text-small"
    >
      Skip to contact
    </a>
  );
}
