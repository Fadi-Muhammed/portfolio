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

| Role      | Hex       | Use                                                                           |
| --------- | --------- | ----------------------------------------------------------------------------- |
| `bg`      | `#EFF2F5` | Page ground. Cool blue-grey, the colour of an instrument panel — never cream. |
| `surface` | `#FAFBFC` | Raised planes: cards, the palette sheet, form fields.                         |
| `ink`     | `#0F151B` | All body and display text. A blue-black, not a true black.                    |
| `muted`   | `#5B6672` | Secondary text, labels, node labels, disabled states.                         |
| `accent`  | `#A34A00` | Interactive: links, focus ring, filled buttons, active states.                |
| `signal`  | `#C06400` | Live things only: status LEDs, the packet, the active rail node.              |
| `line`    | `#CFD6DD` | Hairlines. Structural only, never decorative.                                 |
| `danger`  | `#B3261E` | Errors only: invalid fields, failed submissions, destructive confirmations.   |

| Pair                                  | Ratio   | Meets         |
| ------------------------------------- | ------- | ------------- |
| `ink` on `bg`                         | 16.35:1 | AA body       |
| `ink` on `surface`                    | 17.73:1 | AA body       |
| `muted` on `bg`                       | 5.21:1  | AA body       |
| `muted` on `surface`                  | 5.65:1  | AA body       |
| `accent` on `bg`                      | 5.28:1  | AA body       |
| `accent` on `surface`                 | 5.73:1  | AA body       |
| `signal` on `bg`                      | 3.69:1  | AA large / UI |
| `signal` on `surface`                 | 4.00:1  | AA large / UI |
| `danger` on `bg`                      | 5.82:1  | AA body       |
| `danger` on `surface`                 | 6.31:1  | AA body       |
| `#FFFFFF` on `accent` (filled button) | 5.94:1  | AA body       |

### Dark

| Role      | Hex       | Use                                                                                 |
| --------- | --------- | ----------------------------------------------------------------------------------- |
| `bg`      | `#0E1419` | Deep blue-slate. Explicitly not near-black: an instrument at night, not a terminal. |
| `surface` | `#161D24` | Raised planes.                                                                      |
| `ink`     | `#E4E9EE` | Body and display text.                                                              |
| `muted`   | `#94A0AC` | Secondary text and labels.                                                          |
| `accent`  | `#F0A94A` | Interactive.                                                                        |
| `signal`  | `#FFB84D` | Live things only.                                                                   |
| `line`    | `#28323C` | Hairlines.                                                                          |
| `danger`  | `#FF9A8F` | Errors only.                                                                        |

| Pair                             | Ratio   | Meets   |
| -------------------------------- | ------- | ------- |
| `ink` on `bg`                    | 15.17:1 | AA body |
| `ink` on `surface`               | 13.91:1 | AA body |
| `muted` on `bg`                  | 6.96:1  | AA body |
| `muted` on `surface`             | 6.38:1  | AA body |
| `accent` on `bg`                 | 9.25:1  | AA body |
| `accent` on `surface`            | 8.48:1  | AA body |
| `signal` on `bg`                 | 10.78:1 | AA body |
| `signal` on `surface`            | 9.89:1  | AA body |
| `danger` on `bg`                 | 9.07:1  | AA body |
| `danger` on `surface`            | 8.31:1  | AA body |
| `bg` on `accent` (filled button) | 9.25:1  | AA body |

**Rule on `signal`.** It is reserved for things that are genuinely live: a product's status LED, the
packet in the rail and the topology, the active node, a form's success state. If it is used for
decoration it stops meaning anything, and the one warm colour on a cool page is the site's whole
tonal idea. `accent` handles ordinary interactivity.

---

## 3. Type

Three roles, two families. Both are open-licence (SIL OFL 1.1), free, and loaded through
`next/font/google`, which self-hosts and subsets them at build time — no runtime request to Google,
no layout shift, nothing to pay for.

| Role           | Face                                                 | Why                                                                                                                                               |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display        | **Archivo Expanded** (Archivo variable, `wdth` axis) | An engineered grotesque that gets wider rather than louder. Set heavy and tight it reads like instrument labelling.                               |
| Body           | **Archivo** (normal width)                           | The same voice at normal bandwidth: hierarchy carried by the width axis, not by an unrelated second family.                                       |
| Mono / utility | **IBM Plex Mono**                                    | Drawn for an engineering company. Carries data, units, hop numbers, eyebrows and captions — the places where this site's vocabulary is technical. |

The display/body decision is deliberate and is the most debatable call in this plan: one superfamily
split across its width axis, rather than two contrasting families. The reason is that width _is_ the
subject's own metaphor — the same signal at greater bandwidth — and the third voice (mono) supplies
the real contrast. It is defended again in section 9.

### Scale

Sizes are `clamp()` between 390 px and 1440 px. Tracking is in em.

| Token     | Face / weight        | Size             | Line-height | Tracking           |
| --------- | -------------------- | ---------------- | ----------- | ------------------ |
| `display` | Archivo Expanded 700 | 2.5 to 4.5 rem   | 0.98        | -0.03em            |
| `h1`      | Archivo Expanded 600 | 2.25 to 3 rem    | 1.05        | -0.02em            |
| `h2`      | Archivo Expanded 600 | 1.75 to 2.25 rem | 1.10        | -0.015em           |
| `h3`      | Archivo 600          | 1.25 to 1.5 rem  | 1.20        | -0.01em            |
| `body`    | Archivo 400          | 1 to 1.0625 rem  | 1.60        | 0                  |
| `small`   | Archivo 400          | 0.875 rem        | 1.50        | 0                  |
| `data`    | IBM Plex Mono 500    | 0.75 rem         | 1.40        | +0.06em, uppercase |

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
even this is loud only in _structure_, never in contrast.

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
  coverage of the topology is under 3% of its box. It draws the eye by _movement_, which the tagline
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

| Token        | ms  | Use                                                           |
| ------------ | --- | ------------------------------------------------------------- |
| `--dur-fast` | 200 | Hover, focus, tag toggle, button press                        |
| `--dur`      | 280 | Default transition, card lift, field focus                    |
| `--dur-hop`  | 360 | Section hop, entrance of the new section                      |
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

---

## 10. Amendments after approval

Changes made to this document after Fadi approved it on 28 August 2026. Each one is a value the plan
turned out to be missing, not a change of direction.

**28 August 2026 — added the `danger` role.** The approved palette had six roles and no error colour,
but B10 requires designed error states and Part 2 step 3 requires an `Input`/`Textarea` with one.
Using `accent` for errors was rejected: `accent` means _interactive_ everywhere else on the site, and
overloading it would make an invalid field look like a link. `signal` was rejected for the same
reason — it means _live_. Added `#B3261E` on light (5.82:1 on `bg`, 6.31:1 on `surface`) and
`#FF9A8F` on dark (9.07:1 and 8.31:1), both clearing AA for body text. It is reserved for errors and
destructive actions; it never appears decoratively.

Errors do not rely on colour alone: an invalid field gets the `danger` border, a text message naming
what is wrong, and `aria-invalid` with the message wired through `aria-describedby`.

---

## 11. Hero — the Part 7 specification

Written before any code, per Part 7 step 2. It extends section 4 (composition) and section 6 (the
signature) with the exact geometry, choreography and behaviour needed to build the hero, and it
does not change either. Section 6 remains the approved description of what the topology _is_; this
section is what it _measures_.

Copy comes from `site_settings` in every case. Nothing here is hard-coded text.

### 11.1 Composition at 1440

The deck gives the hero `calc(100svh - var(--peek) - var(--nav-h))` — at a 900 px viewport, 740 px.
Grid is the 12-column one from section 4, 24 px gutter, 64 px page padding.

```text
+---------------------------------------------------------------------+
| # Fadi Muhammed                       [K] Search   Work   Contact    |  nav, 64px
+---------------------------------------------------------------------+
|  cols 1-6                             |  cols 7-12, bleeding right   |
|                                       |                              |
|  TELECOMMUNICATIONS & NETWORK         |          o Achievements      |
|  ENGINEER . TECH BUILDER . FREELANCER |     o Products          o    |
|                                       |      \      .          About |
|  Unemployed & jobless,                |   (#) --- \   . o           \|
|  but not lost.                        |   you      \    Featured  o  |
|                                       |             o             Con|
|  [ See my work ]  [ Work with me ]    |        Engineering           |
|                                       |                              |
|  "Big things have small beginnings."     OPEN TO WORK, COLLABORATIONS |
|  -- PROMETHEUS                           AND FREELANCE PROJECTS       |
+---------------------------------------------------------------------+
| NEXT . PRODUCTS -- what I've built and shipped                   ^   |  peek, 96px
+---------------------------------------------------------------------+
```

Left column, top to bottom, with the gap above each:

| Element     | Token                            | Colour  | Gap above |
| ----------- | -------------------------------- | ------- | --------- |
| eyebrow     | `data`                           | `muted` | —         |
| tagline     | `display` (Archivo Expanded 700) | `ink`   | 1.5rem    |
| buttons     | —                                | below   | 2rem      |
| quote       | `small` (Archivo 400)            | `ink`   | 3rem      |
| attribution | `data`                           | `muted` | 0.5rem    |

The quote is **not** set in `data`. Section 3 states that `data` is never used for prose, and a
quote is prose; uppercasing it at +0.06em would make the one human sentence on the page the least
readable thing in it. B4 asks for "small (mono/utility face)", and the part of the construction
that is genuinely a label — the attribution — is what carries the mono voice. That matches the
390 wireframe in section 4, which already shows the quote in sentence case and `-- PROMETHEUS`
below it in caps.

The quote is set with typographic quotation marks and the attribution is preceded by an em dash,
both from CSS (`quotes` with `open-quote`/`close-quote`, and a `::before` on the caption) rather
than stored in `site_settings`. The database holds the sentence and nothing else: punctuation that
belongs to the presentation would otherwise have to be typed correctly into the row, and would
come back out anywhere else the quote is read — the palette, page metadata, an OG image. The
opening mark hangs into the margin so the sentence keeps the same left edge as the eyebrow, the
tagline and the buttons.

Buttons: "See my work" is the filled `accent` button, "Work with me" the hairline one. Both are
existing `Button` variants from Part 2; no new variant is introduced.

The availability line sits on the same baseline as the quote, in the right half, `data` in `muted`.
It is the last thing read and it is deliberately not marked with a `signal` dot — see 11.8.

Vertical rhythm: the eyebrow and the topology's top edge align; the tagline is the optical centre;
the quote and availability share a baseline near the bottom. No hairline divides them. Section 8
requires a hairline to encode structure, and there is no structural boundary inside a hero — the
peek strip already rules off the bottom.

### 11.2 Stacking at 390

Per B4, and matching the approved 390 wireframe in section 4:

nav → eyebrow → tagline → buttons (stacked, full width, 44 px each) → topology → quote and
attribution.

**The availability line is not shown in the hero on mobile.** The approved wireframe omits it and
B4's mobile stacking order omits it. It is not lost: it appears in Contact (section 4, Contact at
390), which is where someone who has read the whole deck acts on it.

Measured in the browser at 390x844, not estimated: the deck gives the hero 716 px and it uses
577, leaving 139 px of slack. The tagline's last line sits **255 px** below the top of the
viewport, so the whole of it is above the fold with room to spare — Part 7's hard mobile
requirement, asserted in `e2e/hero.spec.ts` rather than trusted.

The two buttons sit side by side and take only the width of their labels, at every size
including 390. Stacked full-width they made the filled one a block of `accent` roughly the area
of the tagline, and it won the page; B4 puts the tagline first and the buttons second, and a
slab that large reverses the reading order the whole composition is built on.

### 11.3 The graph

One node table and one edge list, in the `viewBox="0 0 640 420"` space fixed by section 6. Desktop
and mobile use the same numbers; only the window onto them changes (11.4). This is the layout math
Part 7 step 6 unit-tests.

| Node         | x   | y   | Glyph    |
| ------------ | --- | --- | -------- |
| you          | 86  | 222 | terminal |
| products     | 156 | 104 | server   |
| engineering  | 248 | 200 | antenna  |
| achievements | 328 | 312 | dish     |
| featured-in  | 398 | 208 | cloud    |
| about        | 478 | 116 | switch   |
| contact      | 548 | 310 | router   |

x increases with deck order, so the drawing reads left to right as the sequence a visitor
walks. y was chosen by search against measured constraints, not by eye: minimise edge
crossings, keep every node at least 30 units from an edge it is not connected to, and keep
any two nodes at least 120 apart. The first version of this table was drawn by hand, and on
screen it read as a tangle — six edge crossings, which is what a node-link diagram must not
look like to be worth drawing. This has two. All three constraints are asserted in
`src/lib/hero/topology.test.ts`, so the next edit cannot quietly undo it.

**Nodes are drawn as network topology glyphs, not as circles.** This replaces the 5 px circles
described in section 6, which are superseded; nothing else in section 6 changes. The first version
of this section specified circles, correctly identified in its own critique that a constellation of
dots is close to an AI default, and then shipped the dots anyway with three reasons why it was
acceptable. Naming a risk is not the same as removing it. The skill is explicit that the subject's
own materials, instruments, artifacts and vernacular are where distinctive choices come from, and
the topology diagram is the drawing language of the subject's field — the one Fadi has been working
in for four years. Circles are the absence of a choice; these are the choice.

Each glyph is assigned because it is true of that section, never because it looks technical:

| Glyph        | Section      | Why that one                                                                                                                                                                                 |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **terminal** | you          | The visitor is an endpoint. The packet square sits on its screen — the same mark as the tittle of the `i` in the Fadi logotype (section 5), so the site's mark appears inside its signature. |
| **server**   | products     | Things that run. The site literally pings them for the live status line (B11).                                                                                                               |
| **antenna**  | engineering  | The RF and lab work: link budgets, the street light system, the telecom half.                                                                                                                |
| **dish**     | achievements | Talks and stages, pointed outward.                                                                                                                                                           |
| **cloud**    | featured-in  | The outside world, where coverage lives.                                                                                                                                                     |
| **switch**   | about        | The hub where the skill tags fan out to both bodies of work — which is also why two edges land on it. The glyph makes that structure visible instead of something the prose has to justify.  |
| **router**   | contact      | The gateway out of this network to a person.                                                                                                                                                 |

Drawing rules, so seven glyphs stay a set rather than becoming clip art: one stroke weight (1 px,
`vector-effect: non-scaling-stroke`), one colour (`muted`), no fill anywhere except the packet
square inside the terminal, round caps and joins, and every glyph fitted to the same optical size
inside a 24-unit box. No glyph exists that does not name a destination.

The hit target is a transparent circle of radius 22 units centred on each node, independent of the
glyph's drawn size, so every node clears 44 px at 1440 and stays tappable at 390.

**Six destinations and "you" — not seven destinations plus "you".** B4 says the nodes are the
sections plus a small "you" node, which would put a Home node in the map. The visitor reading this
is standing on Home, so a Home node is a control that does nothing, and the "you" node is already
sitting in exactly the place Home would occupy. Collapsing them makes the map honest: it shows
where you are and everywhere you can go from here. This is a deliberate departure from a literal
reading of B4 and needs approval.

Edges, deck order, solid, 1 px `line`:

`you-products`, `products-engineering`, `engineering-achievements`, `achievements-featured-in`,
`featured-in-about`, `about-contact`.

Cross-links, dashed `2 3`, 1 px `line` — three, each one a route the site actually offers:

| Cross-link          | What makes it true                                                             |
| ------------------- | ------------------------------------------------------------------------------ |
| `you-contact`       | "Work with me" and the nav's Contact link both route straight there.           |
| `products-about`    | About's skill tags filter the products (B2 item 6). The link is real and used. |
| `engineering-about` | The same filter, on the telecom half of the skills.                            |

Two edges landing on About is not an accident to be tidied away: About is where the skills live,
and the skills are what point at both bodies of work. The map says so.

Nodes are kept inside `x <= 556` so that what bleeds off the right edge at 1440 is edge tails and
quiet ground, never a control. A destination the visitor cannot click is not a bleed, it is a bug —
and Contact, the site's whole conversion path, is the node furthest right.

**Measured ink coverage: 0.69 %** of the topology's box — 1 480 px² of stroke, 342 px² of node,
37 px² of packet, against 268 800 px². Section 6 asserts under 3 %; this is the number. Nothing in
the topology uses `ink`; the tagline is `ink` at 700 weight. The topology draws the eye by movement,
which the tagline does not compete for, and loses on contrast, which the tagline wins outright.

### 11.4 Two windows onto one graph

One `viewBox="0 0 640 420"` and one `preserveAspectRatio="xMaxYMid slice"`, per section 6. The
window is changed by the shape of the box, not by a second set of coordinates:

- **1024 and up.** The box takes `aspect-ratio: 640 / 420`, the viewBox's own, so `slice` has
  nothing to crop and the whole map is visible at every window width.
- **Below 1024.** The box takes `aspect-ratio: 640 / 292`, and `slice` crops to the narrow band
  the design asks for — at 390 that is a 156 px block across the column showing y 65 to 355.

The height has to follow the width; it cannot be a fixed number. `slice` crops against the box's
aspect, so a fixed height cropped correctly at 390 and cut the top and bottom nodes clean off at 768. Found by measuring the rendered geometry at three widths, not by looking at one.

**On the bleed.** B4 asks for a topology that bleeds off the right edge, and section 6 chose
`xMax` alignment for it. That was written before Part 5 put the hop rail and its "hop 1 of 7 ·
home" reading at exactly that edge. Measured on screen, the About node landed inside the rail's
label. Two hairline systems overlapping is clutter, not a bleed. So the rail owns a reserved strip
— `--rail-gutter`, 3rem below 1024 and 10rem above it — and the topology runs flush to it with no
card, no border and no padding, which is the part of B4's intent that was load-bearing. It still
bleeds past the section's own padding on the left.

### 11.5 Load sequence

Total **1 080 ms**, inside Part 7's ~1.2 s budget. One easing (`--ease`), durations from the
section 7 table, staggers 40 ms, transform and opacity only.

| t (ms) | What                                  | Duration           |
| ------ | ------------------------------------- | ------------------ |
| 0      | eyebrow, y +8 → 0                     | 280 (`--dur`)      |
| 40     | tagline, y +8 → 0                     | 480 (`--dur-slow`) |
| 80     | buttons                               | 280                |
| 120    | quote and attribution                 | 280                |
| 160    | availability (desktop only)           | 280                |
| 200    | topology, as one unit                 | 480                |
| ~680   | one packet departs "you" for Products | 480                |
| —      | ambient packets, already running      | —                  |

One travel distance, 8 px, for every element rather than two: the tagline moving further than
its neighbours was a distinction nobody would see and one more number to keep in agreement.

The five text elements are driven by `animation-delay` in CSS, not by script. The hero mounts
exactly once, so the sequence plays on arrival and never again — hopping back to the hero later
does not replay it, which would turn a first impression into a tic. The packet's departure is
timed from the live module's mount rather than from navigation start, so ~680 ms is where it
lands rather than a guarantee; what matters is that it follows the topology's entrance, and it
does.

**The edges do not draw themselves in**, and that is the main thing decided here. Stroke draw-in is
the obvious hero move and it is wrong twice over: the server already rendered the finished topology,
so the edges would have to be hidden and redrawn, which is a visible flash on a fast connection; and
B5 assigns the draw-in device to the engineering diagrams, where a diagram assembling itself explains
something. Spending it here would spend it twice.

What the topology does instead is arrive whole and then **send one packet from "you" to Products** —
the same journey the primary button makes. The entrance demonstrates the control rather than
decorating it, it reuses the one device the site already has instead of inventing a second, and it
resolves. That single packet is the hero's orchestrated moment.

**Reduced motion.** Every element is at its final state on first paint. No entrance, no arrival
packet, no ambient packets, static topology, still fully operable.

This needed one thing the global reduced-motion rule did not do. It zeroes every animation's
_duration_, but a staggered entrance with `animation-fill-mode: both` also holds each element in
its starting state for the length of its _delay_ — so the hero would have sat empty for a second
and then snapped in. `animation-delay: 0ms !important` was added alongside it, which protects
every future stagger on the site, not just this one.

### 11.6 Pointer proximity

Nodes displace toward the pointer, up to 6 px, on a spring settling in about 400 ms, per section 6.
Influence radius 120 viewBox units, falling off smoothly to zero at the edge. Edges follow their
endpoints, so the whole mesh flexes rather than the dots sliding under fixed lines.

**The "you" node does not move.** Everything else in the network flexes around the visitor and the
visitor stays put. It is one line of code and it is the difference between a map with a fixed
reference point and a field of drifting dots — which is the failure mode B13 names.

Disabled entirely on touch (no pointer), under reduced motion, when the section is off-screen, and
when the tab is hidden.

### 11.7 Routing, labels and the placeholder

**Nodes are anchors, not buttons.** Each node is `<a href="#products">` with the accessible name
"Route to Products". Part 7 step 3 and B4 both say "real buttons"; an anchor satisfies what that
requirement is protecting — a real focusable control with a real name, not a decorative circle —
and it does one thing a button cannot: it works with JavaScript off, and it works in the
server-rendered placeholder before the module has loaded. A node that is dead for the first 400 ms
of every visit is worse than one that is a link. This is a deliberate departure and needs approval.

**On activate** (click, tap, Enter or Space): the target node fills `signal`, its label appears, and
a packet leaves "you" and travels **along the graph** — the real shortest path over the edges above,
never a straight line through empty space, because a packet crossing where there is no link is a lie
about a network. Fixed duration **480 ms** (`--dur-slow`) for every route regardless of length, so
the interaction feels the same everywhere and the longest route (Featured in, 533 px over four hops)
still lands inside B4's 600 ms ceiling. Then `hopTo(section)` — the same function the rail, the peek
strip, the palette and the hero buttons already call. Under reduced motion the hop is immediate and
no packet is drawn. This path-finding and its interpolation are the second thing Part 7 step 6
unit-tests.

**Labels** appear on hover and on keyboard focus only, in `data` at `muted`, offset from the node so
they never sit on an edge, fading in over 200 ms (`--dur-fast`).

**The server-rendered placeholder** is the same SVG from the same node table: all seven nodes, all
nine edges, real anchors, no labels, no packets. It is not a skeleton and not a blurred stand-in —
it is the finished drawing, minus the motion. First paint is never blank, and the difference between
placeholder and hydrated module is that one of them moves.

### 11.8 Critique

Checked against `.claude/skills/frontend-design/SKILL.md` and B13.

**The honest risk: a node-link diagram is the obvious answer.** A network engineer's portfolio with
a constellation of dots and lines is close to a default, and B13 explicitly bans floating particles.
Three things separate this from that, and if they ever stop being true the element should be cut:
every node is a named destination that routes somewhere; every edge is a relationship that exists in
the product; and the packets mark position rather than drifting. It is a map of the site, drawn in
the subject's own vocabulary, and it is operable. A constellation is none of those.

**Structure encodes something true.** The graph is the deck's real order. The cross-links are the
site's real shortcuts. Two edges into About is a fact about the content, not a balancing act.

**Boldness is spent once.** The topology is the only bold element in the hero and its boldness is
structural: 0.69 % ink coverage, nothing in `ink`, no fill, no glow, no shadow. Everything around it
is left-aligned type on quiet ground.

**Against the three AI defaults.** Palette and type were argued in section 9 and are unchanged here.
The hero adds no gradient, no glass, no shadow, no card around the topology, and no centred stack.

**Copy.** Every string is real and comes from the database. Sentence case. No exclamation marks, no
emoji, no filler.

**The `signal` dot on the availability line was cut** before it was ever drawn. "Open to work" is
arguably a live status and the dot would have been defensible, but the packets are already spending
the site's one warm colour in this viewport, and a second `signal` element competing with them would
weaken the rule that makes `signal` mean anything. The line is `data` in `muted` and says what it
says. The formal "remove one accessory" pass happens against real screenshots at Part 7 step 8.

**Known departure, recorded rather than hidden.** B1 requires that the tagline never stand alone in a
viewport without proof. The A2 eyebrow is positioning, not proof, and Fadi decided on 29 August 2026
to ship the hero without a proof line. The composition above has room for one on the line below the
buttons if that is revisited.

### 11.9 Decisions, resolved

Presented to Fadi on 29 August 2026. He rejected the circles — "can u not make it something more
than just nodes? like a router or cell tower antenna" — which was the right call and is the reason
11.3 now specifies glyphs. Three directions were drawn and compared: topology glyphs, a single
repeated mast at varying heights, and the original dots. He then delegated the choice. Decided:

1. **Direction A, the topology glyphs** (11.3). B was more disciplined but said nothing about the
   half of the subject that ships products, and its varying mast heights encoded nothing true.
2. **Six destinations and "you", not seven destinations plus "you"** (11.3).
3. **Nodes are anchors rather than buttons** (11.7).
4. **The topology arrives whole and sends one packet, rather than drawing its edges in** (11.5).

Two things to watch on real screenshots at step 8, both named before building rather than
discovered after: seven distinct glyphs can tip into clip art, and the cloud is the most generic
shape in the set — it is the first candidate for the "remove one accessory" pass. At 390 the glyphs
render about 13 px, which is enough to tell mast from dish from box by silhouette but not enough to
read a router from a switch. That is the accepted cost of the direction.

---

## 12. Products — cards, the live reading, and the prose scale

Written during Part 8. Everything here derives from sections 2, 3 and 8; nothing new is
introduced except the prose rhythm, which the case-study bodies need and which section 3 does
not cover.

### 12.1 The card

A cover at 16:9, the title at `h3`, a summary clamped to three lines, up to three stack tags,
and the live reading. Card and Tag are the Part 2 primitives, unchanged.

**One target.** The whole card is a single link to the case study. A card with a link inside a
link is invalid markup and ambiguous to a keyboard, so the demo and repository links live on
the case-study page, where there is room to label them properly.

**Tracks are capped, not stretched.** The grid is `repeat(auto-fill, minmax(0, 20rem))`. With
`1fr` columns a single product filled half a 1440 viewport — a 900 px card carrying a 500 px
screenshot, which read as a billboard rather than a card and left the rest of the section
empty. Capping the track means a card is card-sized whether there is one or four, and the grid
simply uses fewer columns.

**The filmstrip.** Below 768 the cards are a horizontal scroller that snaps on its own axis. It
does not fight the deck because the two scrollers are on different axes and different elements:
the deck owns the page's vertical scroll, the strip owns its own horizontal one, and the
browser decides which gesture belongs to which. It bleeds to the glass on the left so a
half-visible next card says there is more that way, and stops at `--rail-gutter` on the right —
bled to both edges, the live reading printed straight over the rail's dots.

### 12.2 The live reading

`signal`, because this is exactly what section 2 reserves it for: something genuinely live,
measured now. Three designed states — checking, a reading, and unreachable.

Amended by 18.4: `signal` is on the LED, not on the words. It does not carry 12px text at
AA on the light theme, and the dot says the same thing.

Unreachable is `muted`, never `danger`. A product being down is not the visitor's mistake and
not this site's fault, and painting it red would say something untrue about both. `danger` stays
reserved for errors the visitor can act on.

It is measured once, when the card mounts, and never again. B5 is explicit that live pings
happen once rather than continuously, and a card that polled would put traffic on someone
else's server for as long as the tab stayed open.

### 12.3 Case-study layout

A reading column and a narrow apparatus column at 16rem. The aside is deliberately narrow: it
holds labels and figures, and a wide column of them would compete with the prose.

The cover spans the full content width. **So does the gallery** — the first version placed it
inside the reading column, where the screenshots came out half the width of the cover directly
above them, which read as a mistake and made the interface in them illegible. Each gallery image
carries a visible caption and an empty `alt`, so the description is read once rather than twice.

**A figure is never shown without its basis.** `metrics.basis` is rendered as the heading above
the numbers — "Projected" or "Measured" — not as a footnote. Rubric's figures are projections
from a 48-hour build, and a qualifier that lives only in prose is one a future layout can drop.
A metrics block with no stated basis is not rendered at all.

### 12.4 The prose scale

Markdown bodies only. Every value comes from the existing type and spacing scales; this adds
rhythm, not sizes.

| Element     | Treatment                                                      |
| ----------- | -------------------------------------------------------------- |
| measure     | `--measure` (68ch), as section 4 already sets for prose        |
| `h2`        | `h2` from section 3, 2.5rem above                              |
| `h3`        | `h3` from section 3, 2rem above                                |
| paragraph   | `body`, line-height 1.6, 1rem above                            |
| list        | disc, 1.25rem indent, 0.5rem between items                     |
| `strong`    | weight 600 — the body face's own semibold, not a second family |
| inline code | mono at 0.9em on `surface` with a hairline and `--radius-sm`   |
| link        | `accent`, as every other link on the site                      |

The first child never takes a top margin, so a body starting with a heading does not push
itself away from what introduced it.

**The renderer emits React elements, never an HTML string.** That is the whole safety argument:
React escapes text, so nothing typed into a table editor can become markup on the page, and
there is no sanitiser to misconfigure. It supports only what the bodies use, and renders
anything it does not recognise as plain text rather than dropping it, so a writer can see their
syntax and fix it.

---

## 13. Engineering — the bench

Written during Part 9. It reuses section 12 entirely — the same card, the same detail
layout, the same prose scale — and adds only what an instrument needs.

### 13.1 The card

`WorkCard`, shared with Products. Two slots differ: the tag row holds tools rather than a
stack, and the meta slot holds the concepts applied.

The concepts line takes its own full-width row rather than sitting beside the tags. Concept
names are phrases — "analogue-to-digital conversion" — and the meta slot is sized for a
reading like "live · 84 ms". It is one line, truncated by CSS rather than by a hard slice,
so a wider card shows more of it. `min-width: 0` on every flex ancestor is what makes that
truncation work at all; without it the line pushes the card wider than its column and the
summary above gets clipped mid-word.

### 13.2 The instrument

**Colour.** Hairlines in `line`, readings in `ink`, the threshold in `accent` because it is
the one thing the visitor sets, and `signal` on the reading marker only when it is on the
night side — the single live mark, which is what section 2 reserves the colour for. The
fault state is the one place `danger` appears outside a form, and it appears because the
firmware genuinely reports a fault.

**Motion: none.** No clock, no autoplay, no transition on the readouts. An instrument that
drifts on its own is a decoration, and this is the section that has to read as
instrumentation. It follows that there is no reduced-motion branch — there is nothing to
reduce, which is a stronger guarantee than a branch would be.

**Controls** are native range inputs and native buttons, so keyboard and touch both work
without a line of code for either, and the focus ring is the site's own.

**A quotation is reproduced, never restyled.** The console line and any identifier from the
source are set in the mono face _without_ `text-data`'s uppercase. "MODE: AUTO | LIGHT ON"
is not what the board prints and `IS_NIGHT` is not the name of the variable.

**An instrument with no data is not drawn.** A project naming an instrument whose `data`
does not parse gets a stated empty state. Invented numbers produce a drawing of nothing
that looks exactly like a drawing of something, which is the worst thing an engineering
portfolio can contain.

---

## 14. Achievements — the route

Written during Part 10. It introduces no colour, type or radius; the only new value is a
width cap, and that is derived from `--rail-gutter`.

### 14.1 Why a traceroute and not cards

Products and Engineering are lists of comparable objects, so they are grids of cards.
Achievements is not a list — it is a sequence, and the sequence is time. A card grid
throws that away. So this section is the one place where the site's borrowed vocabulary
is literally true: a numbered route, a node per stop, a hairline between them, and a
column of readings where a traceroute prints its times.

Hop numbers are allowed here for the reason B13 names: the content really is ordered, and
the number is position rather than decoration. **They renumber when the list is filtered**,
because a filtered view is a different route and a real traceroute numbers the hops of the
route it actually took.

### 14.2 The row

At 390 the number and the reading share the top line — `01 · AUG 2026 · DOHA, QATAR ·
HACKATHON` — with the event, what it was, the role and the disclosure stacked under it.
The reading has to come first: stacked below the disclosure it read as a footnote to the
entry rather than part of it.

From 768 the row becomes four columns — number, node, what happened, readings — which is
the shape of a traceroute line. The separators between readings disappear there, because
each is on its own line and a separator would be marking a boundary the layout already
shows.

**Capped at 48rem.** Left to fill the width, the row put 440 px of nothing between the
event name and its readings, and the two stopped reading as one row. The cap is
`min(100% - (var(--rail-gutter) + 4rem), 48rem)`: the rail's gutter reserves its dots,
which every earlier section found sufficient because their content packs to the left, and
this is the first section with a column aligned to the right — where the rail's reading,
"hop 4 of 7 · achievements", reaches a step further in than the dots do.

### 14.3 Colour, and the result

Everything in the readings column is `muted` except the result, which is `ink` and
semibold, because it is the answer to the question the entry raises. `signal` appears
nowhere in this section: nothing here is live. A first place from April is a fact, not a
measurement being taken now, and spending the site's one warm colour on it would empty
the colour of its meaning.

**There is no `*` for an entry with no result.** It was drafted — it is the traceroute's
own token for "no reply", and it is honest about the two competitions Fadi did not place
in. It was cut because the third entry with no result is a talk, and a talk does not
place: printing "no reply" against it would state a failure that never applied.

### 14.4 Motion

Entries print as they enter the list, once each: number, then the reading, then the event,
then the role, at one `--stagger` apart, 400 ms end to end. Printing again on every pass
would make scrolling back up an event, which it is not.

The filter re-lays out with FLIP, written by hand and reading its duration and easing from
the tokens rather than carrying its own numbers. Under reduced motion neither is armed at
all — the hidden starting state is never applied, so nothing can be left invisible if the
observer never fires.

### 14.5 The disclosure

A hop shows what it is; it opens to show the evidence. Only hops with something behind
them — a summary, a photograph, a link — get the control, because a control that opens an
empty panel is worse than no control.

**One photograph, not a gallery.** Of the Cyber Drill's six, four are venue, signage and a
registration desk: evidence of attendance, not of the work. Each hop shows its cover — the
certificate, the trophy, the talk itself — and the rest stay in the database until there is
a gallery with a reason to exist.

Opening a hop nudges the list's own `scrollTop` so the panel is visible. Not
`scrollIntoView`, which scrolls every scrollable ancestor: that would move the deck and
fight its snap, which B3 forbids outright.

---

## 15. Featured in — the logo wall

Written during Part 11. It introduces no colour, type, radius or spacing value. The only
new idea is how a set of logos with nothing in common is made to look like a set.

Amended by 18.3: the wall is sized by the section it sits in, not by the files.

### 15.1 Not a constellation, and not a collage

B8 offers a grid or a gentle constellation around a small "you" node. The constellation
was declined: the hero already owns the routing topology and B5 spends the site's boldness
there, so a second topology two stops later competes with the first rather than echoing it.

A collage was proposed in chat and declined for a different reason. Varying the sizes of
logos says one of them matters more than another, and there is nothing behind that
ranking. It also reads as a marketing logo wall, which is the failure mode B13 names for
exactly this section.

### 15.2 Equal ink, not equal height

B8 asks for logos "normalised to the same visual height". That works for a row of
horizontal wordmarks and falls apart here: at 44 px tall, Al Fikra's vertical lockup is
16 px wide and DMZ's is 136 px. Both are nominally normalised; they carry completely
different weight.

What has to match is ink — how much of the mark reaches the page. `scripts/normalise-logos.mts`
measures each mark's alpha mass, whose square root is its optical side length, scales every
logo to a common side, and centres all nine on one canvas derived from the results rather
than chosen in advance. Nine files with identical dimensions is what lets the component
render one cell nine times with no per-logo knowledge at all.

**Three columns, stated rather than inferred.** `auto-fit` put seven marks on the first row
and two on the second, which reads as an accident: the count came from the viewport rather
than the content. Nine divides by three at every width.

### 15.3 A mask, not a filter

The resting state is a flat fill in `muted`, masked by the logo — not `filter: grayscale()`.

Greyscale preserves luminance, and this set fails at both ends of it. Qatar Television's
mark is pale enough to vanish on the light ground (1.94:1 against `bg`); Al Fikra and DMZ
are pure black and vanish on the dark one. A mask discards the artwork's own tones and
keeps only its shape, so every mark lands at exactly the token colour and every mark weighs
the same.

**The seal is the exception the mask cannot handle on its own.** UC Berkeley's artwork is a
filled disc, so its alpha is a circle and masking it draws a circle. The normalise script
detects that case — mostly opaque _and_ genuinely two-toned, which separates a seal from a
bold wordmark like DMZ, whose fill is uniform and would be erased by the same treatment —
and rebuilds the alpha from the artwork's own luminance, so what silhouettes is the
engraving rather than the outline.

### 15.4 The hover state, and where it deviates from B8

On the light theme, hover and focus reveal the logo in its own colours, as B8 asks.

**On the dark theme they do not.** Measured against `bg`, four of the nine fail WCAG's 3:1
in their own colours:

| Logo             | Ink       | On light | On dark  |
| ---------------- | --------- | -------- | -------- |
| Al Fikra         | `#000000` | 18.69    | **1.13** |
| DMZ              | `#000000` | 18.69    | **1.13** |
| Web Summit Qatar | `#4f1c47` | 11.76    | **1.40** |
| Qatar University | `#8b1538` | 8.26     | **2.00** |
| Qatar Television | `#a2b2be` | **1.94** | 8.52     |

Revealing those on dark makes the logo disappear at the moment the visitor points at it,
which is the opposite of what a hover state is for. So on dark the reveal lifts the mask
from `muted` to `ink` instead: the same mark, brighter, still legible, still a clear
response to the pointer.

The alternative was generating a lightened variant of each failing logo, which means
altering four organisations' marks automatically and shipping two files per logo. Adapting
the treatment is honest; adapting the brand is not.

### 15.5 What is not here

No captions, no counts, no quotes, no marquee, and no header inside the section — the deck
already names it. The one-time link draw-in B8 permits was not built: it belongs to the
constellation that was declined, and drawing links between logos that are not connected to
anything would be decoration.

The section has one state change and one only. Nothing moves unprompted, so there is no
reduced-motion branch to get wrong.

---

## 16. About — the quietest section

Written during Part 12. It introduces no colour, type, radius or spacing value.

### 16.1 Two columns, and what goes in each

The reading on the left, the record on the right. The bio is prose and wants a measure;
the timeline, the certifications and the CV are facts and want to be scanned. At 390 they
stack, which puts the prose first — the order it should be read in anyway.

The CV button sits in the reading column rather than under the record. Beneath the timeline
it fell below the fold of the section's own scroll, and a download nobody can see is not a
call to action.

### 16.2 The skill filter, and why it hops

B2 item 6 asks that tapping a skill re-lay out the Products and Engineering cards live, so
that every skill is backed by work. Two things about this site make that literal reading
impossible, and the second is the interesting one.

**The cards are two and three stops away.** The deck mounts only the active section and its
neighbours (B3, for the performance reason), and About is hop 6 while Products is hop 2. A
tap in About re-lays out cards that are not in the document, so nothing visibly happens —
which is the one thing a control that exists to prove a claim must not do.

So selecting a skill **hops to the work it names**, through the deck's own `hopTo`, and the
filtered view is what you arrive at. Clearing does not hop: you are already looking at what
you came to see. The chip's accessible name says which it will do.

**The filter lives in the URL** rather than in state, through the same store the
Achievements chips use. One source of truth means the link and the list cannot disagree,
and a shared `?skill=typescript` link needs no special case.

**The cards stay server components.** Only the list and the item wrappers are client code:
they take an already-rendered card as `children` and decide whether it appears. The case
study bodies, the images and the card markup never enter the bundle, which is what B12's
budget cares about.

### 16.3 Only the skills that can prove themselves

Five of twenty-two skills are published. The other seventeen — routing, RF, antennas,
microwave, signals — name no project, because only three projects exist to name.

That is the section's own rule applied honestly rather than around: a tag that filters to
nothing is a control that can only disappoint, and B2's promise is that the tag leads to
the work. The seventeen stay in the table, unpublished, and are published as work arrives
to back them. The component already renders an unbacked skill as a plain tag rather than a
control, so the degenerate case is designed rather than merely avoided.

The cost is real and worth stating: the telecom half of a telecommunications portfolio is
currently the quieter one.

### 16.4 Dates that have not happened yet

A row still running is "present". A row with an end date in the future is "Jan 2024 — May
2027" with "expected" beneath it — B2 asks for the degree's expected graduation by name,
and printing it as "present" would throw away the more useful half.

The qualifier sits on its own line rather than inside the range. Inline, "(expected)" made
the date column ten characters wider than any other row needed, and the degree's title
wrapped to four lines beside it.

**The timeline sorts by whether something is still running, then by when it started** — not
by start date alone, which is what the query does and what buried the degree beneath two
jobs that began later and already finished.

### 16.5 One mark, three times

Three of the four rows carry UDST's mark, because three of the four happened at UDST: the
degree, the job in one of its colleges, and the club. It is the same monochrome treatment
Featured in uses, so the two places a logo appears on this site agree with each other.

The fourth row's column is empty. A dot standing in for a missing logo is a placeholder,
and a placeholder where a mark should be is worse than a gap — which is the rule section 15
already set for a logo that will not load.

---

## 17. Contact — the finale

Written during Part 13. It introduces no colour, type, radius or spacing value. Three
things move in this section and nothing else does.

### 17.1 The handshake

B5 spends the site's third and last orchestrated moment here, and it earns that by being
literally true rather than decorative: the visitor has just opened a connection, and this
is what opening a connection looks like. SYN, then SYN-ACK, then ACK, drawn as three
labelled arrows between two nodes — with the real flag names, because a network engineer's
contact form does not have to explain the joke.

Three steps at 300 ms apart is a shade under a second end to end, which is B5's ceiling.
One SVG rather than three elements, because the nodes and the arrows share a coordinate
space and animating them apart would mean keeping three positions in step by hand.

Under reduced motion the global rule zeroes the duration and the delay, so every arrow is
simply present. That is the designed end state rather than a degradation, which is why
there is no separate static version to maintain.

### 17.2 The slider

Amended by 18.6: the label carries no arrow. The handle is one.

The one bounce on the site. B5 makes it the single exception because a spring back is
physical rather than decorative: the handle was dragged and let go, and things that are
let go return. Nothing else on the site is allowed it.

It is a real drag — pointer events, so one code path covers a finger, a mouse and a
stylus, and `touch-action: none` on the track so a drag along it does not scroll the deck
instead. And it is a real button underneath: `role="button"`, focusable, Enter and Space
open the profile. Someone on a keyboard never has to simulate a drag, which is the failure
mode of every slider that treats dragging as the only way in.

The handle's travel is written as `100cqw - 100%` against the track's own container, so it
never leaves the track whatever the track measures. A one-time nudge per session hints
that it is draggable instead of a caption saying so, and is skipped entirely under reduced
motion — a control that moves on its own is exactly what that setting asks not to happen.

### 17.3 The route recap

A small copy of the hero's topology with the sections this visit reached lit up. It closes
the site by being about the visitor rather than about the site: the same seven nodes for
everyone, a different path for each.

Nothing is stored. Refresh and the route starts again, which is the honest behaviour for
something describing a single visit. Nothing animates either — a node is lit or it is not
— so there is no reduced-motion branch to get wrong.

### 17.4 What the section refuses to say

The colophon carries no joke, as B9 asks: "Built with Next.js and Supabase. Source
viewable." is the whole of it.

The privacy note states what is true today rather than what will be true. A18 chose Umami,
but Part 15 installs it — writing that sentence now would be a claim about software that is
not running. Part 15 changes the line when it changes the fact.

The address is assembled in the browser from two halves, so the served HTML never carries
it. That turned out to require fixing two places it leaked from that had nothing to do with
this section: the command palette shipped the whole `site_settings` row, and so did the
hero's buttons. A client component should be handed what it renders, not the row it came
from.

### 17.5 The failure states are not the visitor's fault

Three different failures, three different answers.

- **A rejected challenge** is answered with "That didn't look like a human", because
  something did answer it wrongly.
- **Cloudflare being unreachable** is answered by accepting the message. It is our outage,
  not theirs, and the honeypot, the validation and the throttle are all still standing.
  Failing people because a third party is down would take the form offline with it.
- **A stored message whose notification did not send** is answered with success, because it
  is true. The message is in the database; a Resend outage costs a prompt reply, not the
  message, and telling someone it failed would invite them to send it twice.

The throttle is deliberately generous — three in ten minutes. It stops a script, not a
person with a follow-up thought.

## 18. The audit after Part 13

A full pass over the built site against the frontend-design skill, this document and B13,
at 390, 768 and 1440 in both themes, plus the detail pages and the routes that had never
been looked at. Everything below is a change to what sections 1 to 17 describe; where the
two disagree, this section is the later decision.

Two findings from the audit are recorded here as **withdrawn**, because they did not
survive measurement and it would be dishonest to file them as fixes. Reading scaled
screenshots is not measuring:

- **"The hero has dead space below the quote."** It has none. `contentEndsAt` equals
  `bodyHeight` at both 1440 and 390 — the section ends where the content ends. The
  availability line being absent under 64rem is 11.2, decided and written down.
- **"The palette's rows are cramped and the panel does not separate from the page."**
  The rows are 44px, which is the touch-target floor, not a squeeze; the list does not
  scroll at any size the palette is used at; and the panel, its border and the scrim are
  three distinct values.

### 18.1 The chrome belongs to the site, not to the home page

The nav, the palette, the theme toggle and the skip link were rendered inside the deck.
Anyone who followed a link straight to `/products/rubric` got a page with no name, no
search, no way to Work or Contact, and no way to change the theme. All four moved to the
root layout.

Two consequences worth stating. The deck provider moved up with them and now degrades:
with no sections on the page its observer finds nothing to watch and `hopTo` navigates to
`/#section` instead of scrolling to an element that is not there. And the skip link is
first in the body — B3 makes it the first stop in the tab order, and putting the nav above
it would have quietly cost that.

### 18.2 A section never paints over the one below it

`.section-body` scrolls its own overflow. B3 already said content that does not fit gets an
inner scroll region; it was being applied per section, and the one section that had not
remembered it — Products, at exactly 768 — printed its cards over the Engineering header.
It is the default now, with `data-inner-scroll` keeping the deck's arrow keys out.

The two-column card grid at 768 is stated rather than inferred. `auto-fill` with a 20rem
track fitted one column in the 640px that is left at that width, so both cards stacked and
the section overflowed. `auto-fill` starts at 64rem, where it has room to mean something.

### 18.3 The logo wall is sized by the section, not by the files

Section 15 sized each mark from the files' own 600x421 and let the rows follow. On a
1280x720 laptop that made a 459px wall inside a 336px section: it scrolled, and a logo wall
you have to scroll is not a wall.

The wall is now three rows that share a height, capped at what the marks want at full size
— `3 × (mark + the link's padding) + 2 × the row gap`, derived from the same two values
each breakpoint already set. Above the cap it stays a block instead of stretching into
three separate bands on a tall phone; below it, the marks shrink into the space. The mark
box is the cell rather than the artwork, and both layers were already letterboxing with
`contain`, so the proportions still belong to the files.

### 18.4 `signal` is spent on the LED, not on the words

Section 12.2 said the live reading is `signal`. Section 2 says `signal` on light `bg` is
3.69:1 — enough for a graphic, not for 12px text. "Live · 710 ms" was set in it and failed
AA in the light theme. The dot keeps `signal` and carries the state; the reading is `muted`
like the other two states. Saying it twice was what made it fail.

### 18.5 404

B10's "Route not found." shipped early, ahead of the rest of Part 14, because without it an
unknown URL landed on the framework's own white page in a system font — a harder break from
the design than any missing feature. A packet stopped at a dead node, the link beyond it
dashed: the same drawing vocabulary as the hero and the footer. Two ways out, back or
search, and nothing on it apologises.

### 18.6 Remove one accessory

The arrow after "Slide into my LinkedIn". The handle is an arrow, it is the thing that
moves, and it sat 40px away in the same 22rem control. Two arrows said one thing twice.
The flex `gap` that existed only to put a space in front of it went too.

---

## 19. The states — Part 14

B10's five states, built as one thing. The rule they are all held to is that a visitor who
lands on any of them can tell it is still this site.

### 19.1 One drawing vocabulary, four sentences

The 404 shipped during the audit with a small drawing that turned out to be a language
rather than a picture. It has four words:

| Mark                      | Means                                 |
| ------------------------- | ------------------------------------- |
| Solid line                | a route traffic passes along          |
| Dashed line               | a route drawn but not travelled       |
| Filled circle             | a node that answers                   |
| Hollow circle             | a node that does not                  |
| Square in `signal`        | the packet                            |
| Dashed ring around a node | out of service on purpose, not broken |

The four states are four sentences in it, and the differences carry the meaning:

- **Route not found.** The packet stops at a hollow node, and the route beyond it is
  dashed. The destination does not exist.
- **Packet dropped.** Every node answers and the line runs end to end — the route is not
  the problem. The packet has fallen out of it at the middle hop, which is where a drop
  actually happens: at a node, not between them.
- **No signal.** The break is at the first hop, immediately after "you". There is no
  packet anywhere, because with no signal nothing is in flight. The absence is the drawing.
- **Out of service.** A hollow node with a dashed ring, the route dashed either side. The
  ring is the whole difference from the 404's dead node: somebody put it there and will
  take it away.

Remove the packet from the 404 and it stops being a 404. That is the test for whether a
mark in these drawings is doing a job.

### 19.2 The shape they share

`StatePage`: drawing, what happened, what it means, the ways out — and optionally one line
of machine detail. Three of the four are built on it (`not-found.tsx`, `error.tsx` and
`global-error.tsx`, `maintenance/page.tsx`). One component rather than three layouts,
because three separately written pages drift the moment one is edited.

The error digest is that optional line, and it is a line rather than a clause. Set inline
at the end of the paragraph it read as a typo in the sentence: uppercase mono running
straight on from "gets through." A reference number is not part of what the page is saying.

### 19.3 Offline is an overlay, not a page

Losing connectivity does not undo what the visitor is reading. The section they are on is
already in the document and stays readable, and replacing it to announce the loss would
cost them their place to tell them something a corner can tell them. So the panel sits
bottom-left over the site at z-index 55 — above the page and the nav, below the palette's
scrim at 60, because a status must not cover a dialog somebody opened on purpose.

It carries no drawing. The no-signal figure was in it and was removed: at the width a
corner panel can spare, a stub, a gap and two hollow nodes read as a dotted line. A drawing
that cannot be decoded is decoration. The full-page states have the room to draw; this one
has the words.

### 19.4 The maintenance page offers no navigation

While the flag is on, every route is rewritten to it. The nav's Search, Work and Contact
would all land back on the same page, the palette would list seven sections and two
projects that all lead to it, and the skip link points at a contact section that is not
there. All of them are gone on `/maintenance`, and so is the palette's keyboard shortcut —
removing the button and keeping the keystroke hides a broken promise from whoever uses a
mouse rather than fixing it.

What stays is the mark and the name, which is identity rather than navigation, and the
theme toggle, which still does exactly what it says.

The heading is "Out of service." rather than "Down for maintenance.", which is what it said
first and which restated the sentence underneath it almost word for word. The heading names
the state and matches the ring; the line from `site_settings` says it is scheduled and that
it will be back, which is the part a visitor does not already know.

### 19.5 What has no loading state, and why

Every content route on this site is prerendered or revalidated, so the only route-level
loading boundary a visitor would ever see is on a detail page — and that is exactly the
one that cannot have it. `loading.tsx` is a Suspense boundary for its segment and all its
children, so the response commits its headers before the page can call `notFound()`:
adding one turned `/products/does-not-exist` from a 404 into a 200 serving 404 content.
The index route's own file does it too, because it covers its children.

A correct status is worth more than a placeholder on a rare miss. The loading states that
are real here are the client-side ones, and they already exist: "Checking…" on a live
reading, "Sending…" on the contact form. B10's actual requirement — no blank screens, no
spinner in the middle of nothing — holds either way.

### 19.6 Remove one accessory

The no-signal drawing, out of the offline panel — 19.3.
