import type { ReactNode } from "react";

/**
 * Hidden visually, still read aloud. Used for the accessible name of an icon-only
 * control and for context a sighted reader gets from layout.
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
