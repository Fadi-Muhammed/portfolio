import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DeckProvider } from "@/components/deck/deck-provider";
import { SiteNav } from "@/components/deck/site-nav";
import { SkipLink } from "@/components/deck/skip-link";
import { PaletteProvider } from "@/components/palette/palette-provider";
import { SignalWatch } from "@/components/states/signal-watch";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { archivo, plexMono } from "@/lib/fonts";
import { getPaletteContent } from "@/lib/palette/content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, robotsRules } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  /*
   * Resolves every relative URL in the metadata below, and every share card Next
   * generates from an opengraph-image route. Without it those come out relative, which
   * no crawler can follow.
   */
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — telecommunications and network engineer`,
    /* Every other page gives its own short title and this adds the name. */
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  alternates: { canonical: SITE_URL },
  /*
   * Off until launch day, and off by default: NEXT_PUBLIC_INDEXABLE has to be set to
   * "true" for anything here to be indexed. Part 17 sets it in Vercel, so launching is a
   * configuration change rather than a deploy. See src/lib/seo.ts.
   */
  robots: robotsRules,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — telecommunications and network engineer`,
    description: SITE_DESCRIPTION,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image" },
};

/*
 * The nav belongs to the site, not to the deck.
 *
 * It used to be rendered inside the home page, which meant a case study had no name, no
 * search, no way to Work or Contact, and — worst of the four — no theme toggle. Someone
 * following a link straight to /products/rubric got a page with no way back and no way to
 * change anything about it.
 *
 * Both providers move up with it. The deck one degrades on a page with no sections: its
 * observer finds nothing to watch, and `hopTo` navigates to /#section instead of scrolling
 * to an element that is not there.
 *
 * The skip link comes with them, and it has to come first: B3 makes it the first stop in
 * the tab order, and once the nav moved up here the nav's own controls were reached before
 * it. It is the first element in the body for the same reason a case study now has one at
 * all — the chrome is the site's, so the way past the chrome is the site's too.
 *
 * Typed explicitly rather than with Next's generated LayoutProps<"/">: those types are
 * emitted into .next/types by a build, so `npm run typecheck` — which CI runs before the
 * build — would fail on a clean checkout.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const paletteContent = await getPaletteContent();

  return (
    // suppressHydrationWarning: ThemeScript writes data-theme before React hydrates,
    // so the server and client markup differ on that attribute by design.
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <DeckProvider>
            <PaletteProvider content={paletteContent}>
              <SkipLink />
              <SiteNav />
              {children}
              {/* Every route, because connectivity is not a property of one of them. */}
              <SignalWatch />
            </PaletteProvider>
          </DeckProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
