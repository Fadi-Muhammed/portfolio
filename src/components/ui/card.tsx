import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Adds hover and focus-within response. Only for cards that are actually a target. */
  interactive?: boolean;
  children: ReactNode;
};

/**
 * A raised plane: surface against the page ground, with a hairline. Elevation is never
 * expressed with a shadow — DESIGN.md section 8 bans them outright, so depth here comes
 * from the surface/bg pair and the line, which is what an instrument panel does too.
 */
export function Card({ interactive = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-surface p-4",
        "transition-colors [transition-duration:var(--dur)] [transition-timing-function:var(--ease)]",
        interactive && "hover:bg-surface-hover focus-within:border-accent",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
