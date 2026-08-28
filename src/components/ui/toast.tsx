import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ToastTone = "neutral" | "success" | "error";

type ToastProps = {
  tone?: ToastTone;
  children: ReactNode;
  /** Rendered at the end — "Undo", "Try again". Optional. */
  action?: ReactNode;
  className?: string;
};

/**
 * A brief confirmation: "Copied", "Message sent", "Message didn't send".
 *
 * role=status with aria-live=polite so a screen reader hears it without being
 * interrupted. The tone is carried by a marker plus the wording, never by colour on
 * its own — an error still says what happened when the colour is not perceivable.
 */
export function Toast({ tone = "neutral", children, action, className }: ToastProps) {
  const marker: Record<ToastTone, string> = {
    neutral: "bg-muted",
    success: "bg-signal",
    error: "bg-danger",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3",
        "text-small text-ink",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-2 shrink-0", marker[tone])} />
      <span>{children}</span>
      {action ? <span className="ml-2">{action}</span> : null}
    </div>
  );
}
