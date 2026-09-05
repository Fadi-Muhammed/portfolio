import path from "node:path";
import type { NextConfig } from "next";

/**
 * Where images are allowed to come from.
 *
 * Only this project's own Supabase Storage host, derived from the same environment
 * variable everything else reads, so there is one place the project reference lives. A
 * wildcard would let any URL in the database become an optimised image served from this
 * domain, which is an open image proxy.
 *
 * When the variable is absent — CI, a clean checkout — the list is empty. Nothing
 * renders a remote image in that state anyway, because the queries answer with nothing.
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

/**
 * Security headers (B12).
 *
 * The Content-Security-Policy is written from what the site actually loads, not from a
 * template: Cloudflare for the Turnstile challenge, Umami for analytics, and this
 * project's own Supabase host for images and queries. Everything else is refused.
 *
 * `'unsafe-inline'` on script-src is a real compromise and is here deliberately. The
 * honest alternative is a nonce, which has to be generated per request in the proxy —
 * and a nonce forces every page to render dynamically, which would trade the static
 * prerendering the whole site is built on for a header. On a site with no user accounts,
 * no sessions and one form that is validated server-side, that is the wrong trade. The
 * theme script that runs before first paint would need it regardless.
 *
 * `frame-ancestors 'none'` rather than X-Frame-Options: it is the header that supersedes
 * it and it is the one modern browsers honour.
 */
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";

const TURNSTILE = "https://challenges.cloudflare.com";
const UMAMI = "https://cloud.umami.is";

/*
 * Only meaningful, and only safe, over HTTPS.
 *
 * upgrade-insecure-requests rewrites http subresource requests to https. On the real
 * domain that is exactly right. Served over plain http — a local production build, or
 * CI — it upgrades the stylesheet to an https URL that nothing is listening on, and the
 * page renders with no CSS at all.
 *
 * That is not hypothetical: it silently broke every WebKit test in this suite. Chromium
 * tolerated it, Safari did not, and the failure looked like fifteen hit targets being too
 * small rather than like a missing stylesheet. Derived from the site URL so the directive
 * is present exactly where it applies.
 */
const servesHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${TURNSTILE} ${UMAMI}`,
  // Tailwind's generated stylesheet is a file, but inline style attributes are used for
  // view-transition names and the topology's transforms.
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${UMAMI} ${TURNSTILE}`.replace(/\s+/g, " ").trim(),
  // The Turnstile widget is an iframe. Nothing else is embedded today; a talk video would
  // be added here when one lands, and B5 requires it be click-to-load rather than autoplay.
  `frame-src ${TURNSTILE}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(servesHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          /*
           * Nothing here needs a camera, a microphone or a location, so all three are
           * refused outright rather than left to a default that may change.
           */
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Only meaningful over HTTPS; Vercel serves the real domain over it.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  // Pin the workspace root. Without this, Turbopack walks up the tree, finds an
  // unrelated package-lock.json outside the repo and infers the wrong root.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
