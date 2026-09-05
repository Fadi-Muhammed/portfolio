"use client";

import { usePathname } from "next/navigation";
import { useDeck } from "@/components/deck/deck-provider";

/**
 * The first thing in the tab order (B3). Invisible until focused, then it lands at the
 * top-left where a keyboard visitor expects it.
 *
 * It goes to Contact rather than to "main content", because on a deck the content is
 * where you already are — what a keyboard visitor cannot reach cheaply is the end.
 *
 * Absent on /maintenance, which has no contact section to skip to and, while the flag is
 * on, no route that would reach one.
 */
export function SkipLink() {
  const { hopTo } = useDeck();
  const pathname = usePathname();

  if (pathname === "/maintenance") return null;

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
