import { analyticsEnabled } from "@/lib/analytics";
import { RouteRecap } from "./route-recap";

/**
 * The footer (B9). The route you took, what the site is made of, what it records, and
 * whose it is — in that order, which is most interesting to least.
 *
 * The colophon says no jokes, as B9 asks. "Built with Next.js and Supabase. Source
 * viewable." is the whole of it.
 *
 * The privacy note is read from the same module that decides whether the script loads,
 * rather than typed here. It said "No analytics, no cookies." from Part 13, which was true
 * when it was written and would have quietly become a false statement the moment Part 15
 * shipped Umami. A sentence about what a site records should not be able to drift from
 * what it records.
 *
 * It names the tool rather than saying "privacy-friendly analytics", which is a claim
 * about intent. Naming it lets a visitor go and check what Umami collects.
 */

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <RouteRecap />

      <div className="site-footer__lines">
        <p className="text-small text-muted">Built with Next.js and Supabase. Source viewable.</p>
        <p className="text-small text-muted">
          {analyticsEnabled
            ? "Visits are counted with Umami. No cookies, no personal data."
            : "No analytics, no cookies."}
        </p>
        <p className="text-small text-muted">© {YEAR} Fadi Muhammed</p>
      </div>
    </footer>
  );
}
