import { Archivo, IBM_Plex_Mono } from "next/font/google";

/**
 * Typefaces, per docs/DESIGN.md section 3. Both are SIL OFL 1.1.
 *
 * next/font downloads, subsets and self-hosts these at build time, so there is no
 * runtime request to Google and no layout shift from a late-arriving face.
 *
 * Archivo is loaded as a variable font including its width axis: display type is the
 * same family at a wider setting rather than a second family. That is the design's
 * central type decision, not a shortcut — see DESIGN.md section 3 and section 9.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});
