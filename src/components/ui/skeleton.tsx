import { cn } from "@/lib/cn";

type SkeletonProps = {
  className?: string;
  /**
   * What is loading, for screen readers. Defaults to a generic but honest label.
   *
   * `null` makes the block decorative instead. A page-shaped placeholder is a dozen of
   * these standing in for one thing that is loading, and a dozen live regions all saying
   * "Loading" is worse for a screen reader than the blank it replaced — so the page says
   * it once and its blocks say nothing.
   */
  label?: string | null;
};

/**
 * A designed placeholder in the token colours, never a spinner in the middle of
 * nothing (B10). It should occupy the same box as the content it stands in for, so
 * arrival does not shift the layout.
 */
export function Skeleton({ className, label = "Loading" }: SkeletonProps) {
  const announced = label !== null;
  return (
    <div
      {...(announced ? { role: "status", "aria-label": label } : { "aria-hidden": true })}
      className={cn(
        "rounded-sm bg-line",
        "motion-safe:[animation:packet_1.6s_var(--ease)_infinite]",
        className,
      )}
    />
  );
}
