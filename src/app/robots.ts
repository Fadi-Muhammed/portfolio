import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl, isIndexable } from "@/lib/seo";

/**
 * robots.txt (B12).
 *
 * Until launch this disallows everything, and it says so in the one place a crawler
 * actually reads. The `noindex` in the page metadata is the other half: robots.txt stops
 * the crawl, `noindex` stops a page that was reached some other way from being listed.
 * Neither is sufficient alone — a page linked from elsewhere can be indexed without ever
 * being crawled, which is exactly the case robots.txt cannot cover.
 *
 * The two are driven by the same flag, so they cannot disagree.
 *
 * The tools stay disallowed after launch. `/design` is a token playground, `/debug` is a
 * working tool that does not exist in production anyway, and `/maintenance` is reached by
 * a rewrite rather than by a link.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      // Still pointed at, so that turning indexing on is one variable rather than two.
      sitemap: absoluteUrl("/sitemap.xml"),
    };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/design", "/debug/", "/maintenance"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
