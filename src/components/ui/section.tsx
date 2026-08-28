import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PeekProps = {
  /** Section id to hop to, e.g. "engineering". */
  href: string;
  name: string;
  teaser: string;
};

/**
 * The bottom strip that shows the top of the next section (B3). It is the next
 * section's own header bar, which is why it carries that section's name and teaser
 * rather than a generic "scroll down".
 *
 * Height is the --peek token: 72px on mobile, 96px from 768 up, which is what makes
 * the next section visible below the active one.
 */
export function PeekStrip({ href, name, teaser }: PeekProps) {
  return (
    <a
      href={`#${href}`}
      className={cn(
        "flex h-(--peek) w-full items-center justify-between gap-4 border-t border-line px-6 lg:px-16",
        "transition-colors [transition-duration:var(--dur)] [transition-timing-function:var(--ease)]",
        "hover:bg-ghost-hover",
      )}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-data text-muted">Next · {name}</span>
        <span className="truncate text-small text-ink">{teaser}</span>
      </span>
      <span aria-hidden="true" className="text-data text-muted">
        ↑
      </span>
    </a>
  );
}

type SectionProps = {
  id: string;
  /** Position in the deck. Real information, which is why it is allowed to be shown. */
  hop: number;
  hopTotal: number;
  name: string;
  heading: string;
  teaser?: string;
  peek?: PeekProps;
  children: ReactNode;
  className?: string;
};

/**
 * One stop on the deck. Exactly `100dvh - --peek` tall so the next section's header
 * shows below it; content that does not fit goes in an inner scroll region or a
 * filmstrip, never by making the section taller (B3).
 *
 * The hop number is shown because the deck is a genuine sequence — B13 allows
 * numbering only when the order carries information the reader needs.
 */
export function Section({
  id,
  hop,
  hopTotal,
  name,
  heading,
  teaser,
  peek,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("flex min-h-[calc(100dvh-var(--peek))] flex-col", className)}
    >
      <div className="flex flex-1 flex-col gap-6 px-6 py-6 sm:px-10 sm:py-10 lg:px-16 lg:py-16">
        <header className="flex flex-col gap-3">
          <p className="text-data text-muted">
            Hop {hop} of {hopTotal} · {name}
          </p>
          <h2 id={`${id}-heading`} className="text-h2 text-ink">
            {heading}
          </h2>
          {teaser ? <p className="measure text-body text-muted">{teaser}</p> : null}
        </header>

        <div className="flex-1">{children}</div>
      </div>

      {peek ? <PeekStrip {...peek} /> : null}
    </section>
  );
}
