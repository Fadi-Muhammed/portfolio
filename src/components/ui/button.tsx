import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "quiet";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /**
   * Marks the action as in flight: the button is disabled, `aria-busy` is set, and a
   * packet indicator appears. The label is the caller's job — B12 requires a button to
   * keep its name through a flow, so "Send message" becomes "Sending…", not a spinner
   * with the text removed.
   */
  loading?: boolean;
  children: ReactNode;
};

const base = cn(
  "inline-flex min-h-11 items-center justify-center gap-2 px-4",
  "rounded-md text-small font-medium",
  "transition-colors [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease)]",
  "disabled:cursor-not-allowed disabled:text-muted",
);

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover disabled:bg-line disabled:text-muted",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-hover disabled:bg-bg",
  quiet: "text-ink hover:bg-ghost-hover",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
      {loading ? <PacketIndicator /> : null}
    </button>
  );
}

/**
 * Three packets in flight. Static under reduced motion rather than animated fast —
 * a frozen fade would read as "dimmed", which is the wrong signal for "working".
 */
function PacketIndicator() {
  return (
    <span aria-hidden="true" className="ml-1 inline-flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1 bg-current motion-safe:[animation:packet_1s_var(--ease)_infinite]"
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </span>
  );
}
