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

const nextConfig: NextConfig = {
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
