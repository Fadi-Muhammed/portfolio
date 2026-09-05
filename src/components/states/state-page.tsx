import type { ReactNode } from "react";
import { StateFigure, type StateVariant } from "./state-figure";

/**
 * The scaffold every full-page state uses: the 404, the render error, and maintenance.
 *
 * One component rather than three layouts, because B10's whole demand is that these look
 * unmistakably like the same site as each other and as everything else — and three
 * separately written pages drift the moment one of them is edited.
 *
 * The shape is fixed and small: a drawing, what happened, what to do about it, and the
 * ways out. Anything a state cannot say in that shape probably should not be on the page.
 *
 * Offline is deliberately not built on this. It is an overlay over whatever the visitor
 * was reading, not a page they navigated to — see `signal-watch.tsx`.
 *
 * `actions` is a slot rather than a list of links because the three callers cannot share
 * one: the 404 opens the command palette, which needs a client component and the
 * provider; global-error runs with no providers at all and can only offer a plain anchor.
 */
export function StatePage({
  variant,
  title,
  children,
  actions,
}: {
  variant: StateVariant;
  /** The state, said in three words or fewer. "Route not found." */
  title: string;
  /** What happened and what it means. One short paragraph. */
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <main className="state">
      <StateFigure variant={variant} />
      <h1 className="text-h1 text-ink">{title}</h1>
      <p className="text-body text-muted measure">{children}</p>
      {actions ? <div className="state__actions">{actions}</div> : null}
    </main>
  );
}
