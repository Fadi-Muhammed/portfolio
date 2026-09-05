"use client";

import type { ReactNode } from "react";
import { usePalette } from "@/components/palette/palette-provider";
import { cn } from "@/lib/cn";

/**
 * A button that opens the command palette.
 *
 * Exists so a page outside the deck — the 404, and whatever Part 14 adds — can offer
 * "Search the site" without importing the palette's internals or duplicating the nav's
 * own button.
 */
export function OpenPalette({ className, children }: { className?: string; children: ReactNode }) {
  const { open } = usePalette();
  return (
    <button type="button" onClick={open} className={cn(className)}>
      {children}
    </button>
  );
}
