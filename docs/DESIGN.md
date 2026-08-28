# Design plan

The written plan for the site's visual identity, produced in Part 2 before any code, following the
method in `.claude/skills/frontend-design/SKILL.md`.

Status: **approved by Fadi on 28 August 2026.** Implementation follows this document exactly.

Every value here is a token. `docs/BUILD_PLAN.md` B13 forbids any colour, spacing, radius or type
value that is not in this document.

---

## 1. Subject grounding

The subject is Fadi Muhammed: a fourth-year telecommunications and network engineering student who
also ships tech products, speaks at Web Summit, and wins competitions. One story, not two people —
he understands systems end to end, from RF and protocols up to the product. The audience is
recruiters and employers on one side, collaborators and clients on the other (A5), and the page has
a single job: show the work, and make hiring or collaborating the obvious next move (A6).

The visual language comes from the subject's own world, but deliberately **not** from its most
obvious corner. A network engineer's portfolio wants to be a green-on-black terminal; that is the
first thing anyone would reach for, it is what B13 names as the trap for this project, and it says
"I have used a CLI" rather than "I understand systems." The reference instead is the **instrument**:
the calibrated face of a spectrum analyser, a link-budget worksheet, a technical drawing sheet. Cool
neutral ground, hairline structure, data set in a utility face, and exactly one warm signal colour
that only ever marks something live. Instruments are quiet everywhere except where a reading
matters. That is the whole design in one sentence.

The brief also asks for "smoother than Apple, but not boring." Smoothness here is bought with
precision rather than polish: optically aligned type, a strict spacing scale, one easing curve, and
motion that always resolves. Interest is bought with the signature (section 6) and the width axis in
the display face (section 3) — not with decoration.

---

## 2. Palette

Six roles plus a hairline, two themes. Light is the designed-first theme and the default when a
visitor expresses no preference; dark is a full counterpart, not an inversion.

### Light

| Role | Hex | Use |
|---|---|---|
| `bg` | `#EFF2F5` | Page ground. Cool blue-grey, the colour of an instrument panel — never cream. |
| `surface` | `#FAFBFC` | Raised planes: cards, the palette sheet, form fields. |
| `ink` | `#0F151B` | All body and display text. A blue-black, not a true black. |
| `muted` | `#5B6672` | Secondary text, labels, node labels, disabled states. |
| `accent` | `#A34A00` | Interactive: links, focus ring, filled buttons, active states. |
| `signal` | `#C06400` | Live things only: status LEDs, the packet, the active rail node. |
| `line` | `#CFD6DD` | Hairlines. Structural only, never decorative. |

| Pair | Ratio | Meets |
|---|---|---|
| `ink` on `bg` | 16.35:1 | AA body |
| `ink` on `surface` | 17.73:1 | AA body |
| `muted` on `bg` | 5.21:1 | AA body |
| `muted` on `surface` | 5.65:1 | AA body |
| `accent` on `bg` | 5.28:1 | AA body |
| `accent` on `surface` | 5.73:1 | AA body |
| `signal` on `bg` | 3.69:1 | AA large / UI |
| `signal` on `surface` | 4.00:1 | AA large / UI |
| `#FFFFFF` on `accent` (filled button) | 5.94:1 | AA body |

### Dark

| Role | Hex | Use |
|---|---|---|
| `bg` | `#0E1419` | Deep blue-slate. Explicitly not near-black: an instrument at night, not a terminal. |
| `surface` | `#161D24` | Raised planes. |
| `ink` | `#E4E9EE` | Body and display text. |
| `muted` | `#94A0AC` | Secondary text and labels. |
| `accent` | `#F0A94A` | Interactive. |
| `signal` | `#FFB84D` | Live things only. |
| `line` | `#28323C` | Hairlines. |

| Pair | Ratio | Meets |
|---|---|---|
| `ink` on `bg` | 15.17:1 | AA body |
| `ink` on `surface` | 13.91:1 | AA body |
| `muted` on `bg` | 6.96:1 | AA body |
| `muted` on `surface` | 6.38:1 | AA body |
| `accent` on `bg` | 9.25:1 | AA body |
| `accent` on `surface` | 8.48:1 | AA body |
| `signal` on `bg` | 10.78:1 | AA body |
| `signal` on `surface` | 9.89:1 | AA body |
| `bg` on `accent` (filled button) | 9.25:1 | AA body |

**Rule on `signal`.** It is reserved for things that are genuinely live: a product's status LED, the
packet in the rail and the topology, the active node, a form's success state. If it is used for
decoration it stops meaning anything, and the one warm colour on a cool page is the site's whole
tonal idea. `accent` handles ordinary interactivity.

---

## 3. Type

Three roles, two families. Both are open-licence (SIL OFL 1.1), free, and loaded through
`next/font/google`, which self-hosts and subsets them at build time — no runtime request to Google,
no layout shift, nothing to pay for.

| Role | Face | Why |
|---|---|---|
| Display | **Archivo Expanded** (Archivo variable, `wdth` axis) | An engineered grotesque that gets wider rather than louder. Set heavy and tight it reads like instrument labelling. |
| Body | **Archivo** (normal width) | The same voice at normal bandwidth: hierarchy carried by the width axis, not by an unrelated second family. |
| Mono / utility | **IBM Plex Mono** | Drawn for an engineering company. Carries data, units, hop numbers, eyebrows and captions — the places where this site's vocabulary is technical. |

The display/body decision is deliberate and is the most debatable call in this plan: one superfamily
split across its width axis, rather than two contrasting families. The reason is that width *is* the
subject's own metaphor — the same signal at greater bandwidth — and the third voice (mono) supplies
the real contrast. It is defended again in section 9.

### Scale

Sizes are `clamp()` between 390 px and 1440 px. Tracking is in em.

| Token | Face / weight | Size | Line-height | Tracking |
|---|---|---|---|---|
| `display` | Archivo Expanded 700 | 2.5 to 4.5 rem | 0.98 | -0.03em |
| `h1` | Archivo Expanded 600 | 2.25 to 3 rem | 1.05 | -0.02em |
| `h2` | Archivo Expanded 600 | 1.75 to 2.25 rem | 1.10 | -0.015em |
| `h3` | Archivo 600 | 1.25 to 1.5 rem | 1.20 | -0.01em |
| `body` | Archivo 400 | 1 to 1.0625 rem | 1.60 | 0 |
| `small` | Archivo 400 | 0.875 rem | 1.50 | 0 |
| `data` | IBM Plex Mono 500 | 0.75 rem | 1.40 | +0.06em, uppercase |

`data` is the eyebrow, the hop label ("hop 3 of 7 · engineering"), the live reading ("live · 84 ms"),
the date and city on a timeline hop, and the caption under a diagram. It is never used for prose.

---

## 4. Layout

**One sentence:** a calibrated instrument face — content pinned to a hairline grid with generous
quiet ground, aligned to a strong left column rather than centred, with the right-hand field left
open for the signature.

Grid: 4 columns at 390, 8 at 768, 12 at 1440. Gutter 16 / 24 / 24 px. Prose measure capped at 68ch.
The page is never one centred `max-w-4xl` stack.

### Hero at 1440

```text
+--------------------------------------------------------------------+
| # Fadi Muhammed                          [K] search   work  contact |
+--------------------------------------------------------------------+
|                                                                     |
| TELECOM & NETWORK ENGINEER . SHIPS PRODUCTS   . - - - - - - - - -    |
|                                               |   o------o          |
| Unemployed & jobless,                         |  /       / \    o   |
| but not lost.                                 | o    o--o    \ /   -|
|                                               |  \  /  #      o     |
| +--------------+  +---------------+           |   o-----------o     |
| |  See my work |  | Work with me  |            - - - - - - - - -    |
| +--------------+  +---------------+                                 |
|                                                                     |
| "Big things have small beginnings."           OPEN TO FREELANCE     |
| -- Prometheus (2012)                          WORK & COLLABORATION  |
+--------------------------------------------------------------------+
| NEXT . PRODUCTS -- four things I built and shipped              ^   |
+--------------------------------------------------------------------+
```

The topology bleeds off the right edge and tucks under the nav. It is never boxed.

### Hero at 390

```text
+--------------------------+
| # Fadi Muhammed       Q  |
+--------------------------+
| TELECOM & NETWORK        |
| ENGINEER . SHIPS         |
| PRODUCTS                 |
|                          |
| Unemployed &             |
| jobless, but             |
| not lost.                |
|                          |
| +----------------------+ |
| | See my work          | |
| +----------------------+ |
| +----------------------+ |
| | Work with me         | |
| +----------------------+ |
|                          |
|   o----o      o          |
|  /  #   \    /           |
| o--------o--o            |
|                          |
| "Big things have small   |
| beginnings."             |
| -- PROMETHEUS (2012)     |
+--------------------------+
| NEXT . PRODUCTS       ^  |
+--------------------------+
```

The tagline sits fully above the fold before the topology; the topology never pushes it down.

### Deck section at 1440

```text
+--------------------------------------------------------------------+
| HOP 2 OF 7 . PRODUCTS                                               |
| Products                                                            |
| Four things I built, shipped, and still maintain.                   |
| ------------------------------------------------------------        |
|  +-------------+  +-------------+  +-------------+                  |
|  |             |  |             |  |             |    # rail        |
|  |   cover     |  |   cover     |  |   cover     |    |             |
|  +-------------+  +-------------+  +-------------+    #             |
|  | Name        |  | Name        |  | Name        |    |             |
|  | one line    |  | one line    |  | one line    |    o             |
|  | * LIVE 84MS |  | * LIVE 120MS|  | o OFFLINE   |    |             |
|  +-------------+  +-------------+  +-------------+    o             |
+--------------------------------------------------------------------+
| NEXT . ENGINEERING -- 12 lab and capstone projects              ^   |
+--------------------------------------------------------------------+
```

At 390 the cards become a horizontal filmstrip; the rail becomes a dot row under the peek strip.

### Detail page at 1440

```text
+--------------------------------------------------------------------+
| # Fadi Muhammed                          [K] search   work  contact |
+--------------------------------------------------------------------+
| <- ALL PRODUCTS                                                     |
|                                                                     |
| Project name                          | ROLE     Solo build         |
| One line on what it is.               | STACK    Next, Postgres     |
|                                       | STATUS   * live . 84 ms     |
| +-----------------------------------+ | LIVE     -> open            |
| |            cover image            | | REPO     -> github          |
| +-----------------------------------+ |                             |
|                                       |  (sticky sidebar, hairline  |
| ## Problem                            |   left border)              |
| prose at 68ch measure ...             |                             |
+--------------------------------------------------------------------+
```

At 390 the sidebar becomes a definition list directly under the title, above the cover.

### Contact at 1440 and 390

```text
 1440                                     390
+----------------------------------+     +--------------------+
| HOP 7 OF 7 . CONTACT             |     | HOP 7 OF 7 CONTACT |
| Let us talk                      |     | Let us talk        |
| ------------------------------   |     | ----------------   |
| +-----------+  ITS 14:32 FOR ME  |     | +----------------+ |
| | Name      |  OPEN TO FREELANCE |     | | Name           | |
| +-----------+                    |     | +----------------+ |
| | Email     |  # Copy email      |     | | Email          | |
| +-----------+  -> LinkedIn       |     | +----------------+ |
| | Message   |  -> GitHub         |     | | Message        | |
| |           |  v  CV (PDF)       |     | |                | |
| +-----------+                    |     | +----------------+ |
| [ Send message ]                 |     | [ Send message ]   |
|                                  |     |                    |
| ( *--------- Slide to LinkedIn ->|     | ( *---- Slide  ->  |
| ------------------------------   |     | ----------------   |
| #--#--#--#--#--#--#              |     | #-#-#-#-#-#-#      |
| DESTINATION REACHED.             |     | DESTINATION REACHED|
+----------------------------------+     +--------------------+
```

---

## 5. The mark

A1 was amended on 28 August 2026 from "FM" to "Fadi". Three assets, one idea.

**Logotype.** The word `Fadi` set in Archivo Expanded 600, tracking -0.02em, with the tittle of the
`i` replaced by a filled square in `signal` — the same square that is the packet in the rail and in
the topology. The brand mark literally contains the site's signature element, and the one warm dot
is the only colour in it.

```text
   F a d #
        ---   the tittle is the packet
```

**Nav.** The mark glyph followed by the full name, per B4: `# Fadi Muhammed`, with the name set in
Archivo 500 at `small`. The standalone `Fadi` logotype is not repeated in the nav — that would say
the name twice.

**Favicon.** `Fadi` is four letters and turns to mush at 16 px, so the favicon is a reduction, not
the logotype. Two candidates, to choose at implementation:

```text
  (a) letter        (b) link
  +--------+        +--------+
  | FF     |        |        |
  | FFF  # |        |  --#-- |
  | F      |        |        |
  +--------+        +--------+
  F + packet        packet on a link
```

(a) keeps the name legible in a crowded tab strip. (b) is more distinctive and matches the rail
exactly, but says nothing about who it is. **Recommendation: (a)**, with (b) kept for the social
avatar, where the name is already written next to it.

---

## 6. Signature — the hero routing topology

The one memorable element (B4). Everything else on the site stays quiet so this can be loud — and
even this is loud only in *structure*, never in contrast.

- **Canvas.** Inline SVG, `viewBox="0 0 640 420"`, `preserveAspectRatio="xMaxYMid slice"` so it
  bleeds off the right edge. Server-rendered static first, hydrated by a lazy module after first
  paint.
- **Edges.** 1 px stroke in `line`. Deck-order edges solid; the two or three cross-links dashed
  `2 3`. Never `ink`.
- **Nodes.** Section nodes are 5 px radius circles, 1 px stroke in `muted`, unfilled. The "you" node
  is 7 px, filled `muted`. The node for the section you are on is filled `signal`.
- **Packets.** 3.5 px squares in `signal`, two or three travelling continuously along edges at about
  60 px per second. On click, one packet fires from "you" to the target node in 600 ms or less, then
  the deck hops.
- **Labels.** Section name in `data` (mono, uppercase, `muted`), shown on hover or keyboard focus
  only. Nodes are real buttons with accessible names.
- **Pointer.** Nodes displace up to 6 px toward the cursor on a spring, settling in about 400 ms. No
  physics library; `requestAnimationFrame` and a small module.
- **How it stays quieter than the tagline.** Nothing in it uses `ink`. Its heaviest value is `muted`
  at 1 px; the tagline is `ink` at 700 weight and roughly forty times the stroke area. Total ink
  coverage of the topology is under 3% of its box. It draws the eye by *movement*, which the tagline
  does not compete for, rather than by contrast, which the tagline wins outright.
- **Mobile.** Reduced height, static layout, one packet, tappable nodes, paused when off-screen or
  when the tab is hidden.
- **Reduced motion.** The server-rendered static SVG, still tappable. No packets.

---

## 7. Motion

One curve. `--ease: cubic-bezier(0.2, 0, 0, 1)` — leaves immediately, settles slowly. This is the
"smoother than Apple" request expressed as a number: the long tail is what reads as smooth, and
using a single curve everywhere is what makes the site feel like one object rather than a set of
components that each animate their own way.

| Token | ms | Use |
|---|---|---|
| `--dur-fast` | 200 | Hover, focus, tag toggle, button press |
| `--dur` | 280 | Default transition, card lift, field focus |
| `--dur-hop` | 360 | Section hop, entrance of the new section |
| `--dur-slow` | 480 | Orchestrated only: hero load, diagram draw-in, contact finale |

Stagger 40 ms, never more than 60. No bounce anywhere except the slider's spring-back (B7), which is
the single exception and is physical rather than decorative.

**Reduced motion.** `prefers-reduced-motion: reduce` sets every duration to 0.01 ms, removes
transforms and scroll smoothing, freezes the topology to its static SVG, and stops the packet. Snap
remains — it is position, not motion. Every animated state has a designed static end state; nothing
is legible only mid-animation.

---

## 8. Everything else

**Spacing.** 4 px base: `0.25 0.5 0.75 1 1.5 2 3 4 6 8 12` rem. Section padding 24 / 40 / 64 px at
390 / 768 / 1440. Nothing off-scale.

**Radius.** Deliberately small: `0` (hairline rules, table cells), `2px` (tags, inputs, small
controls), `4px` (buttons, cards), `8px` (modal, command palette, toast). Nothing larger. No
`rounded-2xl`.

**Borders.** 1 px in `line`. Hairlines are structural only — a section boundary, a table rule, the
detail-page sidebar edge. A hairline that encodes nothing gets deleted (see section 9, default 3).

**Focus ring.** 2 px solid `accent`, 2 px offset, radius matching the component. Never removed, never
`outline: none` without a replacement. 5.28:1 against light `bg` and 9.25:1 against dark `bg`, so it
clears the 3:1 UI minimum in both themes against both grounds.

**Shadows.** None. Elevation is expressed by `surface` against `bg` plus a hairline. This is a rule,
not a default: no `shadow-lg`, no glow, no glassmorphism blur.

**Icons.** Lucide (A24), 1.5 px stroke, 20 px default, 24 px where the icon is the whole target.
Touch targets stay at 44 px or more regardless of icon size. Custom SVG only where Lucide has no
equivalent — the packet, the topology, the handshake arrows.

**Theme.** Default follows the system setting; when there is no preference, light. Persisted per
visitor and applied via `data-theme` on `<html>` before first paint, so there is no flash.

---

## 9. Self-critique

Checked against the three AI-default looks the skill names, against B13, and against this project's
specific trap.

**Default 1 — cream ground, high-contrast serif, terracotta accent.** Avoided. The ground is a cool
blue-grey (`#EFF2F5`), not cream (`#F4F1EA`); there is no serif anywhere in the plan; and although
the accent is warm, it sits on a cool field and is paired with a grotesque rather than a
Playfair-style display. The live risk is that `#A34A00` reads as terracotta in isolation. It is kept
honest by the cool ground and by the rule that `signal` marks only live things.

**Default 2 — near-black with a bright acid accent.** This is the named trap for a networking
portfolio, so it got the hardest look. The dark theme is `#0E1419`, a blue-slate that is measurably
not near-black; the accent is amber rather than acid green or vermilion; and — the structural
defence — **light is the default theme and the one designed first**. A dark-first build would have
made this trap close to unavoidable.

**Default 3 — broadsheet hairlines, zero radius, dense columns.** Partially in play, and the closest
call. The plan does use hairlines and a mono utility face. It diverges on the two things that make
the broadsheet look: radius is not zero (2 / 4 / 8 px), and the grid is generous rather than dense —
there are no multi-column justified text blocks anywhere.

**Against B13.** Every colour, space, radius and type value is in this document. No Tailwind default
palette. No gradients, glass, glow or shadows — shadows are banned outright. Structure encodes
information: hop numbers are real because the deck is a real sequence, and `data`-styled readings are
real measurements. One icon set, one easing curve, one accent, one signature.

### What changed after the critique

1. **`signal` was `#E08A00` and failed.** 2.39:1 on light `bg` — under the 3:1 UI floor, which would
   have made a status LED indiscernible for a lot of people. Darkened to `#C06400` (3.69:1). Caught
   by measuring rather than by eye, which is the argument for stating every ratio in this document.
2. **A second, cool accent was cut.** The first pass had a blue for interactivity alongside amber for
   status. Two accents meant `signal` no longer meant anything on sight, and it spent the design's
   boldness in two places. `accent` and `signal` are now two values of one warm hue with a strict
   division of labour.
3. **Hairlines were capped.** The first pass ruled off every block, which walked straight into
   default 3. Hairlines now have to encode structure or they get deleted.
4. **The type pairing was re-argued and kept.** One superfamily across a width axis is the plan's
   most debatable choice — the safe read is "they used one font." It survives because the alternative
   (reaching for a contrasting display family) is the move that would be identical on any other
   brief, the width axis is the subject's own metaphor, and IBM Plex Mono supplies genuine contrast
   for every technical reading on the site. If it looks timid on screen at step 5, the display face
   is the first thing to change.
