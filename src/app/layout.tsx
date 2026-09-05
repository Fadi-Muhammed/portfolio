import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DeckProvider } from "@/components/deck/deck-provider";
import { SiteNav } from "@/components/deck/site-nav";
import { SkipLink } from "@/components/deck/skip-link";
import { PaletteProvider } from "@/components/palette/palette-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { archivo, plexMono } from "@/lib/fonts";
import { getPaletteContent } from "@/lib/palette/content";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fadi Muhammed",
  // The site is a holding page until launch. Part 15 sets the real metadata and
  // Part 17 removes this, so "Building. Back soon." is never what gets indexed.
  robots: { index: false, follow: false },
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
            </PaletteProvider>
          </DeckProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
