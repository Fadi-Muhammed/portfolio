import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type TagProps = {
  children: ReactNode;
  className?: string;
};

/** A static label: a stack entry, a concept applied, a category. Not interactive. */
export function Tag({ children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-line px-2 py-1",
        "text-data text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  children: ReactNode;
};

/**
 * A filter control — the skill tags in About, the type filters in Achievements.
 * `aria-pressed` carries the state, so it is never colour alone; the hit target is
 * kept at 44px because these are used on phones.
 */
export function Chip({ selected = false, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 items-center rounded-sm border px-3",
        "text-data",
        "transition-colors [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease)]",
        selected
          ? "border-accent bg-accent text-on-accent"
          : "border-line text-muted hover:bg-ghost-hover hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
