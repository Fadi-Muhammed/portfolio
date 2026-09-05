import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SECTIONS } from "@/lib/deck/sections";
import type { SectionId } from "@/lib/deck/sections";

/**
 * The share card (B12), drawn once and used by every `opengraph-image` route.
 *
 * Rendered by Satori, which is not a browser: it supports a subset of flexbox, no CSS
 * variables, no cascade, and every element needs an explicit `display`. That is why the
 * palette below is a transcription rather than an import — there is no way to read
 * `tokens.css` from here, and B13's rule about ad-hoc values is kept by having exactly one
 * copy of them, named after the tokens they come from. If a token changes, this changes.
 *
 * Dark ground on purpose. These are seen in a feed of overwhelmingly white cards, the
 * routing drawing and the one warm packet carry further on it, and it is a theme this site
 * genuinely has rather than a costume for the occasion.
 */

/** Transcribed from src/styles/tokens.css, dark theme. Keep in step by hand. */
const TOKEN = {
  bg: "#0e1419",
  ink: "#e4e9ee",
  muted: "#94a0ac",
  signal: "#ffb84d",
  line: "#28323c",
} as const;

export const CARD_SIZE = { width: 1200, height: 630 };
export const CARD_CONTENT_TYPE = "image/png";

/*
 * Read once per process rather than per request. These are static instances of the site's
 * own faces — see assets/fonts/README.md for why Satori cannot use the variable ones.
 */
const fontDir = join(process.cwd(), "assets", "fonts");
const [display, body, mono] = await Promise.all([
  readFile(join(fontDir, "archivo-display.ttf")),
  readFile(join(fontDir, "archivo-body.ttf")),
  readFile(join(fontDir, "plex-mono.ttf")),
]);

/**
 * Satori has no line clamp, so a summary is cut before it is laid out.
 *
 * Cut at the last word boundary inside the limit, never mid-word. "a potentiometer
 * settin…" reads as a rendering fault; "a potentiometer…" reads as a sentence that
 * continues on the page the card links to.
 */
function trim(text: string | null | undefined, limit: number): string | null {
  const value = text?.trim();
  if (!value) return null;
  if (value.length <= limit) return value;

  const cut = value.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  const words = lastSpace > limit * 0.5 ? cut.slice(0, lastSpace) : cut;
  return `${words.replace(/[\s,.;:—-]+$/, "")}…`;
}

/**
 * The deck, drawn as a route with one node per stop and the packet parked on the one this
 * page is.
 *
 * The same four marks Part 14 established: a line traffic passes along, a filled node that
 * answers, a hollow node beyond, and the packet as a square in `signal`. It is real
 * information — a case study genuinely is the second stop — rather than a graphic that
 * happens to look like the site.
 */
function Route({ at }: { at: SectionId }) {
  const index = Math.max(
    0,
    SECTIONS.findIndex((section) => section.id === at),
  );

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", height: 24 }}>
      {SECTIONS.map((section, position) => (
        <div
          key={section.id}
          style={{
            display: "flex",
            alignItems: "center",
            // Every stop but the first carries the link that reaches it, and the links
            // share whatever width is left. The route then spans the card rather than
            // stopping halfway across it, which read as unfinished rather than deliberate.
            flexGrow: position > 0 ? 1 : 0,
          }}
        >
          {position > 0 ? (
            <div style={{ display: "flex", flexGrow: 1, height: 1, backgroundColor: TOKEN.line }} />
          ) : null}
          {position === index ? (
            <div
              style={{ display: "flex", width: 14, height: 14, backgroundColor: TOKEN.signal }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                width: 10,
                height: 10,
                borderRadius: 999,
                backgroundColor: position < index ? TOKEN.muted : "transparent",
                border: position < index ? "none" : `1px solid ${TOKEN.muted}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * One card, three slots: what kind of thing this is, what it is called, and what it is.
 *
 * The eyebrow is set in the mono face because it is a label rather than a sentence, which
 * is what `text-data` means everywhere else on this site.
 */
export function renderCard({
  eyebrow,
  title,
  summary,
  at,
}: {
  eyebrow: string;
  title: string;
  summary?: string | null;
  /** Which stop on the deck this page is. The packet sits on it. */
  at: SectionId;
}): ImageResponse {
  const line = trim(summary, 118);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        backgroundColor: TOKEN.bg,
        padding: "56px 64px",
        fontFamily: "Archivo",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* The mark: the packet square that is the tittle of the "i" in the logotype. */}
          <div style={{ display: "flex", width: 12, height: 12, backgroundColor: TOKEN.signal }} />
          <div
            style={{
              display: "flex",
              marginLeft: 12,
              fontSize: 24,
              color: TOKEN.ink,
              letterSpacing: "0.01em",
            }}
          >
            Fadi Muhammed
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Plex Mono",
            fontSize: 20,
            color: TOKEN.muted,
            letterSpacing: "0.08em",
          }}
        >
          fadimuhammed.work
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Plex Mono",
            fontSize: 22,
            color: TOKEN.muted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontFamily: "Archivo Display",
            fontSize: title.length > 30 ? 72 : 88,
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            color: TOKEN.ink,
          }}
        >
          {title}
        </div>

        {line ? (
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 30,
              lineHeight: 1.4,
              color: TOKEN.muted,
              maxWidth: 900,
            }}
          >
            {line}
          </div>
        ) : null}
      </div>

      <Route at={at} />
    </div>,
    {
      ...CARD_SIZE,
      fonts: [
        { name: "Archivo Display", data: display, style: "normal", weight: 600 },
        { name: "Archivo", data: body, style: "normal", weight: 400 },
        { name: "Plex Mono", data: mono, style: "normal", weight: 500 },
      ],
    },
  );
}
