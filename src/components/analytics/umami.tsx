import Script from "next/script";
import { ANALYTICS_WEBSITE_ID, UMAMI_DOMAINS, UMAMI_SCRIPT } from "@/lib/analytics";

/**
 * Umami, loaded in production only (B12).
 *
 * Two guards, and they cover different failures. `NODE_ENV` keeps the request out of
 * development, where every save would otherwise be a page view. `data-domains` keeps the
 * counts clean on Vercel previews, which are built as production and would otherwise
 * report `*.vercel.app` traffic into the same bucket as the real site.
 *
 * No cookies and no personal data, which is why the footer needs no consent banner — and
 * why the privacy note reads from the same module this does, so it cannot claim one thing
 * while the page does another.
 *
 * `next/script` with the default `afterInteractive` rather than an injected tag. The
 * lesson from Part 13's Turnstile widget was about a component that mounts late, long
 * after the window load event; this one is in the root layout and is there from the first
 * render, which is the case `next/script` is for.
 */
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;
  if (!ANALYTICS_WEBSITE_ID) return null;

  return (
    <Script
      src={UMAMI_SCRIPT}
      data-website-id={ANALYTICS_WEBSITE_ID}
      data-domains={UMAMI_DOMAINS}
      strategy="afterInteractive"
    />
  );
}
