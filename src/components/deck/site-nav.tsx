"use client";

import { Search } from "lucide-react";
import { useDeck } from "@/components/deck/deck-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";

/**
 * The nav (B4): the mark and name on the left, the way in on the right.
 *
 * "Work" and "Contact" go through hopTo like everything else. They are buttons, not
 * links, because they move you within this page rather than navigating anywhere — and
 * calling them links would promise a page load that never happens.
 *
 * On a phone only the name, search and theme survive. The two section links are dropped
 * rather than shrunk: the rail and the peek strip already reach every section, so
 * repeating them would spend scarce width on the third-best route to the same place.
 */
export function SiteNav() {
  const { hopTo } = useDeck();

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 sm:px-10 lg:px-16">
      <a
        href="#hero"
        onClick={(event) => {
          event.preventDefault();
          hopTo("hero");
        }}
        className="flex items-center gap-2"
      >
        {/* The mark: the packet square that recurs in the rail and the topology. */}
        <span aria-hidden="true" className="size-2 bg-signal" />
        <span className="text-small font-medium text-ink">Fadi Muhammed</span>
      </a>

      <nav aria-label="Primary" className="flex items-center gap-1">
        <Button
          variant="quiet"
          aria-label="Search the site"
          // Part 6 replaces this with the command palette.
          disabled
          className="px-3"
        >
          <Search size={20} strokeWidth={1.5} aria-hidden="true" />
          <span className="text-data hidden sm:inline">Search</span>
        </Button>

        {/* Wrapped rather than given `hidden` directly: the Button base sets a display
            utility, and two display utilities on one element is a coin toss decided by
            stylesheet order. On a phone these are dropped, not shrunk — the rail and the
            peek strip already reach every section. */}
        <span className="hidden items-center gap-1 sm:flex">
          <Button variant="quiet" onClick={() => hopTo("products")} className="px-3">
            <span className="text-data">Work</span>
          </Button>
          <Button variant="quiet" onClick={() => hopTo("contact")} className="px-3">
            <span className="text-data">Contact</span>
          </Button>
        </span>

        <ThemeToggle className="px-3" />
      </nav>
    </header>
  );
}
