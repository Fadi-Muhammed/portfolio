import { RouteRecap } from "./route-recap";

/**
 * The footer (B9). The route you took, what the site is made of, what it records, and
 * whose it is — in that order, which is most interesting to least.
 *
 * The colophon says no jokes, as B9 asks. "Built with Next.js and Supabase. Source
 * viewable." is the whole of it.
 *
 * The privacy note states what is true today rather than what will be true. A18 chose
 * Umami, but Part 15 installs it — writing that sentence now would be a claim about
 * software that is not running. Part 15 changes the line when it changes the fact.
 */

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <RouteRecap />

      <div className="site-footer__lines">
        <p className="text-small text-muted">Built with Next.js and Supabase. Source viewable.</p>
        <p className="text-small text-muted">No analytics, no cookies.</p>
        <p className="text-small text-muted">© {YEAR} Fadi Muhammed</p>
      </div>
    </footer>
  );
}
