import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/**
 * The web manifest (B12).
 *
 * Modest on purpose: this is a website, not an app pretending to be one. No display
 * "standalone", because a portfolio installed to a home screen with the browser chrome
 * hidden loses the address bar and the back button and gains nothing.
 *
 * `background_color` and `theme_color` are the dark theme's, matching the icon, which
 * carries its own dark ground so it reads on any tab strip. The per-theme theme-color
 * meta tags are separate and live in the root layout's viewport export — a manifest only
 * takes one value.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — telecommunications and network engineer`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "browser",
    background_color: "#0e1419",
    theme_color: "#0e1419",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
