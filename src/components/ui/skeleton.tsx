import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
  /** What is loading, for screen readers. Defaults to a generic but honest label. */
  label?: string;
};

/**
 * A designed placeholder in the token colours, never a spinner in the middle of
 * nothing (B10). It should occupy the same box as the content it stands in for, so
 * arrival does not shift the layout.
 */
export function Skeleton({ className, label = "Loading" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "rounded-sm bg-line",
        "motion-safe:[animation:packet_1.6s_var(--ease)_infinite]",
        className,
      )}
    />
  );
}
