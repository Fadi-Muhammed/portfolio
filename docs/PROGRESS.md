# Progress

A running log of what exists, how to check it, and what is not done yet. Updated at the end of every
part, before the report to the user. Newest part at the top.

Definition of done for any part is `docs/BUILD_PLAN.md` B14. UI parts also record the B13
"not vibe-coded" checklist outcome here, including what the "remove one accessory" pass removed.

## Standing item for Part 17, not before

**The hero ships with no proof line, and B1 says it should have one.** B1 requires that the
tagline never stand alone in a viewport without proof, and the A2 eyebrow is positioning rather
than proof. Fadi decided this deliberately on 29 August 2026 and asked to be reminded **once, at
the end of the build — and not in any part report before then**. Do not raise it in the reports
for Parts 8 to 16. Raise it at Part 17 alongside the other launch blocker recorded there, the
out-of-date CV at `documents/cv.pdf`. The material already exists in the database: Web Summit
Qatar 2026 (speaker), DMZ Basecamp 2025, 12th National Cyber Drill 2025.

---

## Part 8 — Products section and case-study pages · 29 August 2026

Status: done.

### What exists

- `src/lib/status/ping.ts` — the measuring, apart from the route: a HEAD request with a
  3 second timeout, and a one-minute per-instance memory of each answer. The clock and
  `fetch` are both injected, so the tests never touch the network.
- `src/app/api/status/route.ts` — `GET /api/status?slug=…`. Takes a slug, never a URL.
- `src/lib/content/media.ts` — storage paths to public URLs, and the narrowing for
  `gallery` and `metrics`, which are `jsonb` and therefore guaranteed nothing by the schema.
- `src/lib/content/markdown.tsx` — a small renderer for case-study bodies.
- `src/components/products/product-card.tsx`, `live-status.tsx`, `products-section.tsx`,
  `copy-link.tsx`.
- `src/app/products/page.tsx` and `src/app/products/[slug]/page.tsx`.
- Products, card, detail and prose styles in `globals.css`; `next.config.ts` now allows
  images from this project's Supabase host and nowhere else.
- Tests: 147 unit (23 new) and 48 Playwright (10 new).

### How to test

```
npm run dev
```

Hop to Products. The LED settles to a real measurement — it is pinging the actual demo, so
the number changes between reloads and would say "Endpoint unreachable" if Vercel were
down. Click the card: the cover animates into the case study where the browser supports
View Transitions, and cross-fades where it does not. "Copy link" becomes "Link copied" and
then goes back to its own name.

On a phone, swipe the card strip sideways — the deck must not move. Swipe vertically and
the deck moves as normal.

```
npm test && npx playwright test
npm run screens -- "#products"
SCREENS_FULL_PAGE=1 node scripts/screens.mts products/rubric
```

`/products/does-not-exist` returns a real 404.

### B13 "not vibe-coded" checklist

Reviewed at 390, 768 and 1440 in both themes.

- **Tokens only.** No new colours, radii or type sizes. The prose scale is rhythm applied
  to values section 3 already defines.
- **Structure encodes something true.** The metrics block's heading is its basis —
  "Projected" — so a figure never appears without its standing. The live reading is a real
  measurement taken now, not a badge.
- **Copy is real** and comes from the database, with one deliberate exception noted below.
- **Interaction**: one target per card, focus visible, hover never carries meaning alone.
- **Accessibility**: zero serious or critical axe violations on the section and the case
  study.

**Four faults, all found by looking at screenshots rather than by reasoning:**

1. **A single card filled half a 1440 viewport.** `1fr` grid columns stretched one product
   into a 900 px card carrying a 500 px screenshot — a billboard, with the rest of the
   section empty beside it. Tracks are now capped at 20rem, so a card is card-sized whether
   there is one or four.
2. **The section intro repeated the section header almost word for word.** The header
   already says "Products — what I've built and shipped"; the intro opened by saying it
   again. It now only does the part the header cannot: say what opening a case study gets
   you.
3. **The card ran under the hop rail at 390**, printing the live reading over the rail's
   dots. The same collision the hero had. The filmstrip now bleeds to the glass on the left
   and stops at `--rail-gutter` on the right.
4. **The gallery sat inside the reading column**, so the screenshots came out half the
   width of the cover directly above them — which read as a mistake and made the dense
   interface in them unreadable. It is now full width with captions.

**Remove one accessory.** Hovering a card dimmed its screenshot _and_ coloured its title:
two signals for one state. The dim is gone. The title alone says it, the way every other
link on the site does.

### Decided without asking

- **Every list fetcher now answers with nothing when Supabase is unconfigured.** Part 7
  needed this for `getSiteSettings` and CI found it the hard way; Parts 9 and 10 would have
  found it again.

  **This was got wrong once more before it was got right, and the way it went wrong is
  worth keeping.** The script that added the guards failed halfway, so only five of seven
  fetchers were changed — and `grep -c` still returned a plausible number, which was read
  as success without checking _which_. The local verification build then passed, because
  `.next` still held the previous build's output and Turbopack reused it. Two false
  confirmations in a row, and CI caught it anyway. So: the check is
  `rm -rf .next` before building with `.env.local` moved aside, and
  `src/lib/content/queries.unconfigured.test.ts` now asserts the behaviour of every
  exported fetcher by name, including one test that fails if a new fetcher is added and
  not covered. A count is not a verification.

- **The markdown renderer emits React elements, never an HTML string.** No
  `dangerouslySetInnerHTML`, so nothing typed into a table editor can become markup, and
  there is no sanitiser to misconfigure. It supports only what the bodies use, and shows
  unrecognised syntax as text rather than dropping it. No dependency added.
- **The status route takes a slug and looks the URL up itself.** Accepting a URL parameter
  would have made the site an open proxy anyone could point at an internal address.
- **`ok` follows the status code**, unlike the palette's ping easter egg, which counts any
  reply as reachability. A 500 is a reply and the product is not up; on a card that claims
  a product is live, that distinction is the whole point.
- **Four cards in the deck before "All products →".** A section is one viewport and four is
  what fits at 1440 without the grid becoming a contact sheet. The link only appears when
  there are more, so it is never a link to where you already are.
- **`/products` exists even with one product**, because it is a URL people can reasonably
  guess and Part 15's sitemap will want it.
- **No previous/next on the case study** while there is one product. Nothing to point at.
- **The empty state is a sentence, not a designed void.** "Nothing here yet. The products
  are being written up." — B10 asks every empty state to offer a way on, so it points at
  the engineering section and at search.

### Known gaps

- **Rubric has no "what I learned" section.** B2 asks a case study for one. The pitch deck
  does not cover it and Fadi chose to leave it rather than have it invented. One field, one
  re-seed, whenever he writes it.
- **The stack is one tag.** Only TypeScript is verified, from the repository's language
  stats. The deck does not name the rest.
- **The Products stop is mostly empty ground at 1440** with a single card. That is a
  content fact rather than a layout one, and it resolves itself the moment a second product
  exists.
- **The View Transition is not covered by a test.** Playwright cannot meaningfully assert a
  cross-document transition, and the fallback is a cross-fade, so the failure mode is
  cosmetic.
- **Not tested on a real device.** The filmstrip against the vertical deck is the thing to
  check: the automated test proves the deck's scroll position does not change, which is not
  the same as it feeling right under a thumb.
- **`@supabase/ssr` is still installed and unused**, carried since Part 3.

### Next

Part 9 — engineering projects, instruments and detail pages. It reuses the card, the detail
layout and the prose scale built here, and adds the interactive instruments, which is the
first time a section needs something built per project rather than per section.

---

## Part 7 — Hero: routing topology, tagline, quote · 29 August 2026

Status: done.

### What exists

- `src/lib/hero/topology.ts` — the topology as data and arithmetic: the node table, the edge
  list, shortest-route finding weighted by drawn length, packet interpolation, pointer
  displacement. Pure, so every claim about it is testable without a browser.
- `src/components/hero/glyphs.tsx` — the seven network glyphs, drawn once into `<defs>`.
- `src/components/hero/topology-graph.tsx` — the drawing. One component, rendered by the server
  for the static layer and by the live module for the moving one.
- `src/components/hero/topology.tsx` — a server component holding both layers.
- `src/components/hero/topology-loader.tsx` — the client shim that lazy-loads the live layer and
  deliberately imports nothing else.
- `src/components/hero/topology-live.tsx` — the clock: rAF loop, pointer spring, ambient packets,
  click-to-route, and the pauses for reduced motion, hidden tabs and off-screen.
- `src/components/hero/hero.tsx` and `hero-actions.tsx` — the composition, every string from
  `site_settings`, both buttons calling the same `hopTo` as everything else.
- Hero and topology styles in `globals.css`; `--section-pad` and `--rail-gutter` added as tokens;
  the deck's three repeated padding literals now point at `--section-pad`.
- `HeroPlaceholder` deleted from `section-placeholder.tsx`.
- Tests: 123 unit (26 new on the topology) and 38 Playwright (8 new on the hero).

### How to test

```
npm run dev
```

The hero is the first stop. Hover near a node and the mesh flexes toward the pointer while
"you" stays put. Click any node: a packet leaves "you", travels the real links to that node, and
then the deck hops. Tab into the drawing and press Enter — same thing.

```
npm run screens
npm test && npx playwright test
```

To see the static layer as a visitor with no JavaScript gets it, disable scripting in devtools
and reload: the drawing is still there and every node is still a working link.

### Measurements against B12's budget

- **Home page JavaScript: 141.3 KB gzipped**, against a budget of about 200 KB. Measured from
  real transfer sizes on a production build, not estimated.
- **The topology module is 3.6 KB gzipped** and arrives at 188 ms, after first contentful paint
  at 128 ms. It was 1.6 KB at first, which looked better and was worse: the drawing code was
  being imported by an eager client component and so shipped in the bundle that blocks the hero.
  Splitting the loader from the drawing moved it.

### B13 "not vibe-coded" checklist

Reviewed at 390, 768 and 1440 in both themes.

- **Tokens only.** Two new ones, `--section-pad` and `--rail-gutter`, both added because several
  rules already depended on a number agreeing — the same reason `--nav-h` exists.
- **Structure encodes something true.** Every node is a named destination that routes somewhere;
  every edge is a relationship that exists in the product; the glyph on each node is chosen for
  what that section is. About is drawn as a switch _because_ two links land on it.
- **Motion**: one easing, durations from the scale, 40 ms stagger, no bounce, the whole sequence
  resolved inside 1.1 s.
- **Copy is real** and comes from the database.
- **Interaction**: focus visible on every node, hit targets measured at 44 px or more on a phone,
  hover never carries meaning alone.
- **Accessibility**: zero serious or critical axe violations.

**The first design was rejected, and it deserved to be.** The design pass specified the nodes as
5 px circles, said in its own critique that "a constellation of dots and lines is close to an AI
default", gave three reasons that was acceptable, and shipped the dots. Fadi rejected them and
asked for something from the subject's own world. Naming a risk is not the same as removing it.
The nodes are now topology glyphs — terminal, server, antenna, dish, cloud, switch, router — the
drawing language of the field, and the strongest thing about them is that the switch makes a
structural fact visible instead of leaving it to prose.

**Seven faults found while building, six of them by measuring rather than by looking:**

1. **The About node sat inside the rail's "hop 1 of 7 · home" label.** The topology ran under the
   hop rail Part 5 put at the right edge. B4 asks the topology to bleed off that edge; the rail
   now owns it. `--rail-gutter` reserves the strip and the drawing stops flush against it.
2. **Hit targets were 40 px on a desktop and 23 px on a phone**, against B12's 44 px floor. The
   radius had been sized from how the drawing looks at its largest, when what governs is the
   smallest scale it is ever rendered at. Now 42 viewBox units, which measures 51 px at 390.
3. **A fixed topology height cut the top and bottom nodes off at 768.** `slice` crops against the
   box's aspect ratio, so a height that cropped correctly at 390 was wrong everywhere else. The
   height now follows the width.
4. **The hand-drawn layout had six edge crossings** and read as a tangle. Positions were re-chosen
   by search against three measured constraints. Two crossings now, and the constraints are
   unit-tested.
5. **The primary button was a full-width orange slab on a phone**, roughly the area of the tagline
   and louder than it. Buttons now take the width of their labels at every size.
6. **The antenna glyph was a capital A.** An isosceles triangle bisected by a crossbar, which is
   exactly what the letter is. Redrawn as a lattice mast with two near-vertical legs.
7. **Three ambient packets bunched onto one edge**, leaving the rest of the network looking dead.
   They now avoid links another packet is on.

**And one fault in the review tooling itself, which mattered more than any of them.** The 390
screenshot showed the whole hero washed out to about a third opacity while the section below it
was full contrast. It looked exactly like a contrast bug and I nearly reviewed it as one. It was
the entrance animation caught mid-flight: `npm run screens` waited for `networkidle`, which says
the bytes have arrived, not that the page has settled. `scripts/screens.mts` now waits for every
animation to finish before the shutter opens. Part 5 had already learned this lesson for
Playwright and written a `ready()` helper for it; the screenshot script never got the same
treatment. A review tool that photographs a frame on the way to the design is worse than no
review tool, because its output looks like evidence.

**Remove one accessory.** The "you" node had a hover label reading "You are here". The terminal
glyph already carries the packet square on its screen, which says the same thing without words,
and it was the one node in the drawing that is not a control. The label is gone; only
destinations are named. A second rule went with it as dead weight rather than as the accessory:
the routing packet was scaled to 1.15, which turns a 3.5 px square into a 4 px square and is not
visible to anyone.

**An eighth fault, and only CI could find it.** `npm run build` fails where Supabase is not
configured, because the home page is statically prerendered and `getSiteSettings()` threw
rather than returning null. Every local build has `.env.local`, so this path never runs on
this machine; CI has no credentials, so it is the only place it does. The palette had
guarded itself with `isSupabaseConfigured` since Part 6 — the hero called the fetcher
directly and walked past the guard. `getSiteSettings()` now answers null when there is no
database, which is the same answer it already gave for an unseeded row, so callers have
one case to handle rather than two. Verified locally by moving `.env.local` aside and
building the way CI does, and covered by `src/lib/content/queries.unconfigured.test.ts`.
The list fetchers still throw in that state; Parts 8 and 9 will need the same guard when
their sections start reading at build time.

**A ninth, immediately behind it, and the same blind spot twice.** With the build fixed, the
SSR test failed in CI because it asserted the heading contains "but not lost" — the seeded
tagline. With no credentials the hero falls back to the name, so the test was asserting the
fixture rather than the promise, which is "the heading is not blank before hydration". It
now asserts the heading is not empty. Part 6 recorded the identical lesson ("do not assume
the palette has database content") and it did not carry over on its own. Both fixes were
verified locally the way CI runs them, by moving `.env.local` aside — which is now the
thing to do before pushing anything that reads content at build time.

### Decided without asking

- **Six destinations and "you", not seven plus "you".** B4 reads as one node per section plus a
  "you" node, which puts a Home node on the map — a control that does nothing, since the visitor
  reading it is standing on Home. Merged, so the map shows where you are and everywhere you can
  go from there. Approved in the design pass.
- **Nodes are anchors, not buttons.** Part 7 and B4 both say "real buttons". An anchor to
  `#products` satisfies what that protects — a real focusable control with a real name — and
  works before the module loads and with JavaScript off. Approved in the design pass.
- **The topology arrives whole and fires one packet, rather than drawing its edges in.** Stroke
  draw-in would have meant hiding and redrawing a drawing the server had already sent, and B5
  assigns that device to the engineering diagrams. Approved in the design pass.
- **The quote is set in the body face; only its attribution is mono.** B4 asks for the quote in
  the mono/utility face, but section 3 states `data` is never used for prose, and uppercasing at
  +0.06em would make the one human sentence on the page the hardest thing on it to read.
- **The availability line is not in the hero on a phone.** B4's mobile stacking order and the
  approved 390 wireframe both omit it. It appears in Contact.
- **Route finding is weighted by drawn length rather than hop count.** In the current edge list
  the two agree everywhere, so this is defensive rather than load-bearing.

### Known gaps

- ~~Not tested on a real device.~~ **Checked by Fadi on a phone on 29 August 2026: fine.** No
  faults reported — unlike Part 5, where the real-device pass found two. The tap targets, the
  glyphs at roughly 13 px and the scrolling all held up on real hardware.
- **Glyphs are about 13 px at 390.** Mast, dish, box and cloud are distinguishable by silhouette;
  a router is not distinguishable from a switch. Accepted cost of the direction, and the label
  names it on tap.
- **The cloud is the most generic glyph in the set** and the closest to a stock icon. It survived
  the accessory pass; it is the first thing to reconsider if the set ever starts to look like
  clip art.
- **The dashed cross-links are very faint on the dark theme.** They are `line`, which is correct
  for a hairline, but they are close to invisible against `bg`.
- **The pointer spring is not covered by a test.** Its arithmetic is, but nothing asserts that a
  real pointer moves a real node.
- **`@supabase/ssr` is still installed and unused**, carried since Part 3.

### Next

Part 8 — the Products section and case-study pages. It is the first section with cards, the first
to ping a live endpoint for a real status line, and the first with detail pages at
`/products/[slug]`, which is also when the palette's product items stop hopping to a section and
start navigating.

---

## Part 6 — Command palette · 29 August 2026

Status: done.

### What exists

- `src/lib/palette/items.ts` — what the palette offers, as data: the item list, the
  grouping, and the match scorer. Pure, so the decisions are testable without a UI.
- `src/lib/palette/content.ts` — server-side assembly of what the palette lists, sending
  only the fields it shows rather than whole rows.
- `src/components/palette/palette-provider.tsx` — open state, both shortcuts, lazy
  loading, and focus restoration.
- `src/components/palette/palette.tsx` — the palette itself, built on cmdk.
- Palette styles in `globals.css`; a `--scrim` token added.
- The nav Search button is live at every size and shows `⌘K` from 1024 up.
- Tests: 95 unit (26 new) and 30 Playwright (10 new).

### How to test

```
npm run dev
```

Then `Ctrl/⌘ K` or `/` or the Search button. Try: `contact` (hops), `rubric` (hops to
Products), `lab` (finds Engineering, though "lab" is not in its name), `ping`, `zzzz`
(the empty state).

```
SCREENS_PALETTE=1 npm run screens   # captures with the palette open
```

### B13 "not vibe-coded" checklist

Reviewed at 390, 768 and 1440 in both themes.

- **Not a stock palette.** Three things do that work: the selected row is marked by the
  packet square rather than a highlight bar, so the object that moves in the rail marks
  your place here too; group headings are set in the data voice; and there is no shadow,
  so it sits on the page as a plane instead of floating above it.
- **Tokens only.** One new token, `--scrim`, added for a reason given below.
- **Copy is real**: the empty state says "No route to that." and suggests what to try,
  in the site's routing vocabulary.
- **Interaction**: 44 px rows, full keyboard control, Escape closes and returns focus,
  the mobile sheet is full height.
- **Accessibility**: zero serious or critical axe violations with the palette open.

**Five faults, two from looking and three from tests:**

1. **The scrim lightened the page on the dark theme.** It was mixed from `--ink`, which is
   a light colour there, so the dialog washed the page out instead of dimming it. A scrim
   must always darken, so `--scrim` is now stated per theme rather than derived.
2. **Section teasers shown as hints were noise** — full sentences, uppercased, truncated
   mid-word, competing with the label they were meant to support. Dropped from view, kept
   searchable. On phones all hints are dropped, because keeping them truncated the label
   to make room for a truncated hint.
3. **Typing "ping" ranked the ping command third**, behind Achievements and Rubric. cmdk's
   default scoring is a fuzzy subsequence over the whole searchable string, and the letters
   p, i, n, g all appear in "competitions and programmes". A palette where typing a
   command's exact name does not find it is broken. Replaced with a scorer that puts the
   label decisively above keywords, unit tested against that exact case.
4. **Closing the palette left focus on `<body>`**, stranding a keyboard visitor at the top
   of the document and failing B6's focus-return requirement. The dialog library is
   supposed to handle this and measurably did not, so the provider remembers the opener
   itself.

5. **A fifth, from CI, and it was a design flaw rather than a test problem.** Where there
   are no Supabase credentials `/api/health` answers 503, and the ping reported "no reply,
   100% loss". That is wrong: the packet came back, and the reply merely said the database
   is not configured. The status code describes the database; ping describes the network
   hop. Any HTTP response now counts as a reply; only a network failure counts as loss.

**Remove one accessory.** "Opens in a new tab" as a visible hint on LinkedIn and GitHub
took half a row to say what an arrow says in one character. Now a `↗` glyph, with the
words kept for screen readers.

### Decided without asking

- **The ping easter egg is real.** B6 asked for a mock reply; it measures the actual round
  trip to `/api/health` and prints it. Approved in chat. A fake ping is a joke about being
  a network engineer; a real one is the thing itself, and it cannot drift into being an
  invented number.
- **Products and engineering projects hop to their section rather than navigating.**
  `/products/[slug]` arrives in Part 8 and `/engineering/[slug]` in Part 9. Sending people
  to a 404 would be worse than taking them to the right section. Those parts change the
  `action` in `items.ts` and nothing else.
- **No X entry in the Links group.** B6 lists one; A19 records no X account, so it is
  absent rather than present and dead.
- **`/` opens the palette**, ignored whenever focus is in a field — the same guard the
  deck's arrow keys use.
- **Answers stay in the palette; departures close it.** Copy, theme and ping print below
  the input and leave it open, because that is where the answer belongs. B6 mentions a
  toast for Copy email; an inline line is the same information without building a toast
  system that nothing else needs yet.
- **The palette is loaded on first open.** cmdk and a dialog are real weight for something
  most visitors never open, and B12's budget is tight.

### Known gaps

- **The "routing to…" line is brief.** The hop happens immediately and the palette closes
  220 ms later, so the line is glimpsed rather than read. Deliberate: delaying navigation
  to make a label readable would be the wrong trade.
- **`Command.Dialog` renders its own focus trap**, so the deck's keyboard paging is
  inactive while the palette is open. That is correct, but it means PageDown does nothing
  there — worth confirming it feels right on a real device.
- **Achievements have no detail pages** by design, so those items always hop.

### Next

Part 7 — the hero: the routing topology, tagline and quote. It is the first section with
real content, it needs the Supabase environment variables in Vercel to render on the
deployed site, and it is where the design's single signature gets built.

---

## Part 5 — Deck engine, navigation and hop rail · 28 August 2026

Status: done. Needs a real-device check before Part 6 — see "What Fadi needs to test".

### What exists

- `src/lib/deck/sections.ts` — the seven sections in order, each with a name, a teaser and
  the part that builds it. One list, used by the deck, the rail, the nav, and later the
  palette and the footer recap.
- `src/lib/deck/state.ts` — the deck's decisions as pure functions: next/previous, key
  intents, which section is active from intersection ratios, what to mount, the title and
  rail labels. No DOM, so it is directly testable.
- `src/components/deck/deck-provider.tsx` — `hopTo`, `useDeck`, the IntersectionObserver,
  hash sync, document title, keyboard paging and the keepalive.
- `src/components/deck/deck.tsx` — the scroll container and the section shell.
- `src/components/deck/rail.tsx` — nodes, the packet, and the reading level with the
  active node.
- `src/components/deck/site-nav.tsx`, `skip-link.tsx`, `section-placeholder.tsx`.
- Deck and rail styles in `globals.css`; `--nav-h` added to the tokens.
- Tests: 71 unit (18 new on deck state) and 20 Playwright (10 new on the deck).
- `part05-done` points at the finished state. It was first tagged three commits early, before the axe, rapid-paging and svh fixes; moved with Fadi's explicit approval, since CLAUDE.md forbids deleting a tag without it.

### How to test

```
npm run dev                     # then use PageDown/PageUp, the rail, the peek strip
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e
npm run screens -- "#products"  # captures the deck parked on a section
```

Deep links work: `/#engineering` lands on that section with the title
"Fadi Muhammed — Engineering".

### B13 "not vibe-coded" checklist

Reviewed at 390, 768 and 1440 in both themes, across every section.

- **Tokens**: every value from `tokens.css`. `--nav-h` was added as a token rather than a
  magic number, because three separate rules depend on the nav's height agreeing.
- **Typography**: section names use the display face at `h3`, teasers at `small`, the rail
  reading in mono. No new sizes introduced.
- **Layout**: an intentional sequence — the deck is a real order, so hop numbers encode
  something true rather than decorating. Content is left-aligned to one column, not
  centred in a box.
- **Copy**: real. Placeholders name the part that builds the section and nothing else. An
  earlier draft read "Products arrives here", which does not agree in number; replaced
  with "This section is built in Part 8", which is correct for every section name.
- **Motion**: one easing, `--dur-hop` for the entrance and the packet, no bounce. Under
  reduced motion the deck's `scroll-behavior` is `auto` and hops are instant — asserted in
  Playwright rather than assumed.
- **Interaction**: focus visible, 44 px targets on every rail node, the skip link first in
  the tab order, inactive section bodies `inert`.
- **Accessibility**: zero serious or critical axe violations on the deck.

**Three faults found, none of them by reasoning:**

1. **The fixed nav overlapped every snapped section's header.** At 390 the words sat
   literally on top of each other. Found by looking at the first mobile screenshot. Fixed
   with `--nav-h`, `scroll-padding-top`, and a section height accounting for both.
2. **"Work" and "Contact" stayed visible on mobile.** `hidden` and the Button base's
   `inline-flex` are both display utilities, so which wins is decided by stylesheet order,
   not by their order in the class string. This is exactly the conflict `cn()` declines to
   resolve, and the fix is structural: wrap the pair in a container that carries the
   responsive display.
3. **The rail's decorative line intercepted clicks on the node buttons.** Found by a
   Playwright test timing out, not by eye — a real visitor would have met a dead rail
   wherever the line crossed a node. Fixed with `pointer-events: none`.

**Remove one accessory.** The active rail node was filled _and_ had the packet beside it:
two markers for one state, reading as a smudge rather than an indicator. The fill is gone.
The packet alone marks position, which also gives the packet a job — it is the thing that
moves, which is the whole connective idea in B5.

**A fourth fault, found only by CI.** The axe check passed locally and failed on the
runner with a colour-contrast violation: foreground `#6c7681` at 4.11:1, which is not a
token. It is `--muted` rendered mid-fade — CI is slow enough that axe measured a section
while its entrance animation was still running. Not an accessibility defect, since the
colour exists for 360 ms and is not the design, but the test was wrong to judge an
unsettled page. Both the axe check and the interactive tests now wait for hydration (the
provider writes the hash on mount) and for `document.getAnimations()` to finish. The same
slowness exposed a hydration race in the keyboard test, where a keypress landed before the
listener was attached.

**A fifth fault, also from CI: rapid keyboard paging got stuck.** Pressing PageDown twice
quickly landed on section 2 instead of 3. `hopTo` sets the active section immediately so a
keypress feels answered, but a smooth scroll takes time, and during it the observer still
reported the section being left as most visible — dragging `active` backwards. A second
press inside that window then computed "next" from the old section and hopped to where it
already was. While a hop is in flight the observer may now confirm the destination but not
contradict it, with a timeout so it can never stay muted. This is a real defect for anyone
paging quickly, not only for the test.

**A tooling fault worth recording.** `npm run screens` only built when `.next` was
missing, so after an edit it silently photographed stale code. It produced a screenshot
that looked like proof a fix had worked when the fix had never been compiled. It now
always rebuilds, with `SCREENS_SKIP_BUILD=1` to opt out.

### Decided without asking

- **The hero has no header bar.** Every other section's header doubles as the peek for the
  one before it; nothing precedes the hero, so a strip reading "Home" under the nav would
  label something already obvious.
- **The body is `inert`, not the whole section.** Making the section inert would kill the
  peek strip, which must stay clickable while it is the next section's way in.
- **Arrow keys page the deck, but not inside form fields or anything marked
  `data-inner-scroll`.** Taking ArrowDown away from a textarea would be worse than not
  binding it at all.
- **The rail is vertical at every size.** B3 allows a horizontal mobile rail; a horizontal
  one would compete with the peek strip for the bottom of a phone screen.
- **The Part 2 `Section`/`PeekStrip` primitive was deleted.** The deck shell replaces it,
  and two shells for one job is the parallel convention CLAUDE.md forbids. `/design` now
  shows the real markup instead.

### Known gaps

- **The Search button is disabled.** Part 6 wires it to the command palette.
- **Every section is a placeholder.** Parts 7 to 13 fill them.
- **Lazy mounting is in place but invisible**, because placeholders are cheap. It starts
  mattering in Part 7, when the topology and images arrive.
- **`scroll-snap-stop: always` is not directly tested.** Proving a fast flick cannot skip a
  section needs touch-gesture emulation; the wheel test asserts that a realistic scroll
  lands exactly one section on. Worth checking by hand on a real phone.
- **Not tested on a real device yet.**

### Real-device findings, and the fix

Tested by Fadi on a phone. One section per screen: yes. Peek strip and rail taps: yes.
Two problems, which turned out to be the same problem:

- Going back up the deck felt glitchy when the URL bar reappeared.
- A fast flick **sometimes skipped a section**.

Both are `100dvh`. It is the _dynamic_ viewport height and changes as the URL bar hides
and reappears, so inside a snap container every section's height changes mid-scroll and
every snap point moves underneath the visitor. `scroll-snap-stop: always` cannot help when
the thing it is stopping at has moved.

Now `100svh`, the _small_ viewport height, which never changes — see `docs/DECISIONS.md`
for why this is a deliberate deviation from B3's wording. **Needs re-testing on the phone**
to confirm both symptoms are gone.

Reduced motion was not tested by hand; it is asserted in Playwright instead — the deck's
`scroll-behavior` computes to `auto` and a hop completes with no smooth scroll.

### What Fadi needs to test

On a real phone, iOS Safari and Android Chrome if possible:

1. Does one section fill the screen, with the top of the next one showing below it?
2. Flick fast. Does it ever skip a section?
3. Does the URL bar hiding and reappearing break the section heights? This is what
   `100dvh` is meant to solve and is the single most likely thing to be wrong.
4. Tap the peek strip and the rail dots. Do they respond, and are they big enough?
5. Turn on Reduce Motion in system settings. Hops should be instant, with no sliding.

### Next

Part 6 — the command palette. It reuses `hopTo` and the section list, and replaces the
disabled Search button in the nav.

---

## Part 4 — Data layer and content seeding · 28 August 2026

Status: done, with a deliberately partial content set. Fadi supplied one item per
category and will add the rest once the site is live, which the plan supports through
Section E's add-content prompt and Studio editing.

### What exists

- `src/lib/content/schemas.ts` — zod mirrors of the database schema, validating the seed
  files before anything reaches Postgres.
- `content/seed/*.json` — one file per table, holding only real supplied content.
- `scripts/seed.mts` (`npm run db:seed`) — idempotent upsert by slug, singleton for
  `site_settings`. Verified: a second run produced identical counts.
- `scripts/upload-assets.mts` (`npm run assets:upload`) — pushes `content/assets/**` to
  the matching buckets, skipping files already there at the same size.
- `src/lib/content/queries.ts` — the typed read layer, every fetcher cached with a tag
  per table and a 300 second revalidate.
- `src/app/api/revalidate/route.ts` — POST, constant-time secret check, revalidates one tag.
- `src/app/debug/content/page.tsx` — development-only view of everything the data layer
  returns.
- Tests: 53 unit (30 new: schemas and fetchers) and 12 Playwright.

### What is actually in the database

| Table                | Seeded | Published |
| -------------------- | ------ | --------- |
| products             | 1      | 1         |
| engineering_projects | 1      | 1         |
| achievements         | 3      | 3         |
| featured_in          | 0      | 0         |
| skills               | 22     | 5         |
| certifications       | 1      | 1         |
| experience           | 4      | 3         |
| site_settings        | 1      | —         |

### How to test

```
npm run db:seed          # idempotent; run it twice, counts do not change
npm run dev              # then open /debug/content
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e
```

`/debug/content` shows every field the data layer returns, with gaps rendered as a red
`null` so a missing field cannot be mistaken for an empty one.

### Content gaps

Everything below is null in the database and will render as missing until supplied.
None of it was invented.

**Blocking a section from looking finished**

- **The CV is outdated and carries personal contact details.** Uploaded to
  `documents/cv.pdf` and wired to `site_settings.cv_path` on 28 August 2026 so the palette
  and About downloads are real. The personal mobile and student email have been removed from the file at Fadi's
  request: both the drawing operators in the content stream and the Tagged PDF structure
  tree entries, which screen readers and extractors read and which a visual redaction
  would have left behind. Verified by scanning the raw and decompressed bytes of the file
  served from the bucket. It is still out of date in content. **Part 17 must not launch with this file.** Replacing it is
  one command: drop the new PDF at the same path and run `npm run assets:upload`.
- **The CV contains content that is not in the database.** Read once before publishing, as
  a privacy check. It supplies the missing degree row (BSc Electrical Engineering:
  Telecommunications and Network Engineering, UDST, Jan 2024 to May 2027), five
  achievements that carry actual results, confirmation that Quitifi is a shipped product,
  and the context behind the UC Berkeley and ALFEKRA logos. It also disagrees with what was
  supplied in chat on three points: Web Summit 2025 versus 2026, the 3D printing end date,
  and that role's title. None of it has been seeded — it needs Fadi's confirmation first.
- **No images except Rubric's.** Three screenshots now exist at `media/rubric/`
  (allocation board, match pool, hidden gems), the first being the product cover. There is still
  no engineering-project photo and no talk photo, so Parts 9 and 10 will render empty media
  wells.
- **Featured in: seven logos uploaded, zero rows.** The files are in the `logos` bucket
  (`alfekra`, `dmz`, `qatar-innovation`, `qatar-university`, `uc-berkeley`, `uhub`,
  `web-summit-qatar`) but `featured_in` is still empty, because B8 makes each logo a link
  to real coverage and no links or categories have been supplied. Logos without links are
  decoration. Two further problems found by inspecting the pixels: `alfekra.png` and
  `dmz.png` are solid black on transparent and will be **invisible on the dark theme**
  (fix: source an SVG or a reversed version, or add a per-row invert flag in Part 11), and
  `alfekra.png` is a stacked vertical lockup at 1:2.7 that cannot sit in a row normalised
  to a common height — a horizontal variant is needed.
- **No degree row.** Fadi is a fourth-year telecom and network engineering student and
  the experience timeline has no education entry. This is the spine of the positioning
  and B2 explicitly asks for the degree with expected graduation.

**Weakening an entry that exists**

- **Web Summit talk has no date.** It is the strongest credibility item supplied and it
  sorts below DMZ Basecamp because undated entries fall last on the timeline.
- **National Cyber Drill CTF has no date, city or result.**
- **Career Essentials certification has no issue date and no credential URL.** A
  certification without a verification link is a claim.
- ~~Rubric has no case-study body, no metrics and no outcome.~~ **Filled on 29 August 2026**
  from the pitch deck Fadi supplied (`Pantheon - Pitch Deck.pdf`, 8 slides). The body covers the
  problem, what was built, his role and where it stands; three real product screenshots were
  extracted from the deck and uploaded to `media/rubric/`. Still missing: what he learned, which
  the deck does not cover, and the rest of the stack.
- **Rubric's repo is private**, so `repo_url` is null rather than a link to a 404.
- **No summaries or highlights on any experience row.**
- **Work placement missing.** The curriculum shows a 9-credit, 40-hour-a-week placement
  in semester 9. If it has been done, it is a strong row that is absent.

**Open questions raised and not yet answered**

- Rubric's full stack. Only TypeScript is verified, from the repo's own language stats. The
  pitch deck does not name the stack either.
- ~~Whether Quitifi is a shipped product.~~ **Answered 29 August 2026: it is still under
  development,** so it does not belong in Products. Revisit if it ships.
- Whether DMZ Basecamp should be an achievement, an experience row, or both. It is
  currently seeded as both, with the experience row **unpublished** so only one shows.
  Flipping it is one checkbox in Studio.
- Whether Web Summit should also appear in `featured_in` as a stage.
- Which of the 17 unpublished skills Fadi would defend in an interview.

### Decided without asking

- **Only 5 of 22 skills are published.** B2 makes skill tags filter the projects, so a
  tag with no linked work filters to an empty list and turns the section into a course
  list wearing a costume. The rest are seeded unpublished, ready to switch on as
  projects land.
- **Certificates of attendance were modelled as achievements, not certifications.** DMZ
  Basecamp is a `program` and the National Cyber Drill is a `competition`. Listing
  "certificate of attendance" beside a Microsoft credential undersells both events.
- **Month-precision dates were stored as the first of the month**, and end dates as the
  last. Supplied as "Jul 2025 - Aug 2025" and similar.
- **`src/lib/supabase/queries.ts` was deleted.** It and `src/lib/content/queries.ts`
  would have been two query layers doing one job.
- **`/debug/content` is gated on `NODE_ENV`, not a flag** — no switch to turn on by
  accident — and degrades to a legible message when no database is configured, so CI can
  exercise it.
- **`getAchievements` filters in memory.** The set is small and already cached, and the
  filter chips need to re-layout without a round trip.
- **The e2e suite now runs a second dev server** on port 3001, because `/debug/content`
  does not exist in a production build and testing it needs one.

### Known gaps in the tooling

- **`npm run screens` cannot capture `/debug/content`.** A `SCREENS_DEV` mode was written
  and reverted: the dev server serves the route correctly through three other paths but
  returns 404 through the screens script on its port, and the cause was not found.
  Shipping a half-working flag is worse than not having it. The page was reviewed by
  driving Playwright against a dev server directly, and the e2e test covers it.
- The review found and fixed a real bug: JSON values rendered through `text-data` were
  uppercased, so socials displayed as `HTTPS://GITHUB.COM/...`. URL paths are
  case-sensitive, so that was wrong rather than merely ugly.
- **Ordering questions for later parts.** Experience sorts by `start_date` descending, so
  a finished job can sit above a current one. Part 12 should decide whether current roles
  lead.
- **The revalidation webhook is not created yet.** It needs `REVALIDATE_SECRET` in Vercel
  and one webhook per table in the dashboard; steps are in `docs/BACKEND.md`.

### Next

Part 5 — the deck engine, navigation and hop rail. It is the first part that renders real
content, and the first where the missing images and dates will be visible.

---

## Part 3 — Supabase backend · 28 August 2026

Status: done.

### What exists

- Supabase project **Portfolio**, ref `hulswrqpouaokbrbrflk`, region `ap-northeast-1` (Tokyo),
  linked to this repo. CLI installed as a dev dependency.
- `supabase/migrations` — four migrations, all applied:
  - `..._helpers_and_enums.sql` — the `updated_at` trigger function and five enums.
  - `..._content_tables.sql` — nine tables with a SQL `COMMENT` on every one, `updated_at`
    triggers, and indexes on `published`/`sort_order`, `date`, `type` and `ip_hash`.
  - `..._row_level_security.sql` — RLS on all nine, grants, and the read policies.
  - `..._storage_buckets.sql` — `media`, `logos`, `documents`, public read.
- `src/lib/supabase/` — `types.ts` (generated, 670 lines), `public.ts` (anon), `server.ts`
  (service key, `server-only`), `queries.ts` (the typed read layer Part 4 fills out).
- `src/app/api/health/route.ts` — `GET /api/health`.
- `docs/BACKEND.md` — migrations, security model, buckets, editing content in Studio.
- Tests: 21 unit, 8 Playwright.

### How to test

```
npm run db:push        # applies any pending migrations
npm run db:types       # regenerates src/lib/supabase/types.ts
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e
```

With `.env.local` present, `npm run build && npm run start` then
`curl http://localhost:3000/api/health` returns `{"status":"ok","database":"reachable"}`.

In Supabase Studio: Table Editor shows all nine tables; each shows **RLS enabled**;
Storage shows the three buckets.

### Security verified against the live database

Not inferred from the SQL — run against the running project:

| Check                          | Result        |
| ------------------------------ | ------------- |
| Anon read, eight public tables | 200           |
| Anon read `contact_messages`   | **401**       |
| Anon insert / update / delete  | **401**       |
| Unpublished row, read as anon  | **invisible** |
| Same row after publishing      | visible       |
| `updated_at` trigger           | fires         |

The probe row was deleted afterwards; the database is empty.

### Decided without asking

- **`testimonials` was not created.** B11 marks it optional and Part 18 decides whether the
  site has testimonials at all. A table nobody has agreed to is schema debt.
- **The health check uses the anon client, not the service key.** Checking with a key that
  bypasses RLS would report healthy even with the grants broken for every real visitor.
- **`/api/health` is `force-dynamic`** and reports status only — no URL, no key, no driver
  error text. It is a public endpoint and driver errors leak schema details.
- **The e2e health test asserts the contract in both worlds** — `ok`/200 locally where
  `.env.local` supplies a database, `unconfigured`/503 in CI where there are no credentials.
  CI therefore needs no Supabase secrets.
- **`slug`, `sort_order` and `published` were applied to all seven content tables**, including
  `skills`, `certifications` and `experience`, per B11's "content tables also have" line.
- **The query layer is per-table rather than generic.** A generic `list(table)` cannot resolve
  to a concrete row type through supabase-js; the result is a helper too loose to be useful.
- **The CLI wrapper runs the package's JS entry with `node`** rather than going through
  `node_modules/.bin`, which needs a shell — and on Windows a shell splits this project's path
  at the space in "Portfolio site".

### Known gaps

- **`@supabase/ssr` is installed but unused.** Part 1 installed it per the plan; with no auth
  on this site, the plain client is the right tool. B13 forbids unused dependencies, so it
  should either be used when auth arrives or removed. Flagged rather than removed unilaterally,
  because the plan named it.
- **The database is empty.** Content arrives in Part 4; `site_settings` has no row yet, which is
  why `getSiteSettings()` returns null rather than throwing.
- **Supabase env is not set in Vercel yet.** The deployed site has no database until
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
  are added there. Nothing deployed reads them yet, so this is not urgent until Part 4.
- **CI does not exercise the configured health path**, only the unconfigured one. Adding the
  anon key as a GitHub secret would close that, at the cost of another credential to manage.
- **`interactive_widget` is a free text column.** Which instruments exist is not known until
  Part 9, so an enum would have been invented rather than derived.

### Next

Part 4 — data layer and content seeding. It opens by asking for the content inventory (A22),
which is still the one input that cannot be derived or invented, plus the `site_settings`
values (A2, A3, A4, A27, A28, socials, email) and the featured-in list (A21).

---

## Part 2 — Design tokens and foundations · 28 August 2026

Status: done. The written plan was approved before any code was written.

### What exists

- `docs/DESIGN.md` — the approved design plan. Palette with a measured contrast ratio for every
  text/background pair, type scale, layout concept with ASCII wireframes at 390 and 1440, the hero
  topology spec, motion tokens, and the self-critique against the three AI-default looks.
- `src/styles/tokens.css` — every visual value on the site, both themes, switched by `data-theme`
  with a `prefers-color-scheme` fallback.
- `src/app/globals.css` — Tailwind bound to the tokens. The default palette is removed with
  `--color-*: initial` and only the token roles are added back.
- `src/lib/fonts.ts` — Archivo (variable, including its width axis) and IBM Plex Mono via
  `next/font/google`. Both SIL OFL 1.1, self-hosted at build, nothing paid for.
- `src/components/theme/` — the store, provider, no-flash inline script and toggle.
- `src/lib/hooks/use-reduced-motion.ts`.
- `src/components/ui/` — Button (primary/secondary/quiet), Link, Input, Textarea, Card, Tag, Chip,
  Toast, Section with PeekStrip, Skeleton, VisuallyHidden.
- `/design` — the token playground, gated behind `NEXT_PUBLIC_ENABLE_DESIGN_ROUTE`, `noindex`.
- Tests: 20 unit (8 on the theme provider, 12 on env) and 5 Playwright, including axe over `/design`
  in both themes.

### How to test

```
npm install
NEXT_PUBLIC_ENABLE_DESIGN_ROUTE=true npm run dev     # then open /design
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e
SCREENS_FULL_PAGE=1 npm run screens -- design        # 12 images in .screens/
```

On Windows, note that `npm run screens` takes routes **without** a leading slash — Git Bash rewrites
`/design` into a filesystem path before Node sees it. `/` is always captured.

To check `/design` on a phone, set `NEXT_PUBLIC_ENABLE_DESIGN_ROUTE=true` in the Vercel dashboard and
redeploy; unset it afterwards so the route is absent from production.

### B13 "not vibe-coded" checklist

Run against `/design` at 390/768/1440 in both themes, full-page.

- **Tokens**: every colour, space, radius and type value resolves to `tokens.css`. Verified by
  building a probe component using `bg-blue-500` and `text-gray-400`: **zero** CSS rules were
  emitted for either, and no `oklch()` values from Tailwind's default palette appear in the built
  stylesheet. The default palette does not exist in this project rather than merely being
  discouraged.
- **Typography**: Archivo Expanded display against Archivo body against IBM Plex Mono for data. Not
  Inter-for-everything. The one-superfamily decision was flagged in the plan as the riskiest call and
  was to be judged on screen — at display size it reads as engineered and confident, not timid, so it
  stands.
- **Layout**: left-aligned to a strong column, hairline dividers, no centred `max-w-4xl` stack, no
  card-in-card. Radius tops out at 8 px.
- **Copy**: real throughout. The samples use the actual tagline and real section names; error
  messages say what is wrong and what to do.
- **Motion**: one curve, four durations inside B5's 200–500 ms band, no bounce, reduced motion
  neutralises everything declaratively and the packet indicators hold still rather than fading — a
  frozen fade reads as "dimmed", which is the wrong signal for "working".
- **Icons**: Lucide only, 1.5 stroke.
- **Interaction**: focus ring 2 px accent at 2 px offset, never removed; 5.28:1 on light and 9.25:1
  on dark against the ground. Hit targets 44 px. Zero serious or critical axe violations in both
  themes.
- **Not the three defaults**: cool blue-grey ground rather than cream, no serif anywhere; the dark
  theme is a blue-slate (`#0E1419`) rather than near-black and the accent is amber rather than acid
  green — and light is the default and the theme designed first, which is the structural defence
  against the terminal trap.
- **Verified on a real phone.** Fadi opened `/design` on the deployed site (flag on, then removed)
  and reloaded repeatedly: no flash of the wrong theme. That is the one Part 2 test item screenshots
  cannot prove — localhost resolves too fast for the bug to show — so the blocking inline script in
  `ThemeScript` is confirmed working under real network latency.

**What the critique changed.** Three faults were found by looking at the screenshots, not by
reasoning:

1. The theme toggle was stranded mid-air at 1440 and orphaned onto its own line at 390. Moved into
   its own top bar above the title.
2. Viewport-only screenshots cannot review a long spec page — only the top was visible. Added
   `SCREENS_FULL_PAGE=1`.
3. The spacing swatch labels crowded together at the small end. Given fixed-width columns.

Earlier, during the plan itself, measuring caught what the eye did not: the first signal amber was
2.39:1 on light, under the 3:1 floor, which would have made a status LED indiscernible for many
people.

**Remove one accessory.** Cut the `↑` arrow from the peek strip. It encoded nothing the label "Next ·
Engineering" did not already carry, and it pointed the wrong way — the next section is below, not
above. Decoration that is also wrong is an easy cut.

### Decided without asking

- **A `danger` role was added to the approved palette.** The plan had six roles and no error colour,
  but B10 requires designed error states. Reusing `accent` (which means interactive) or `signal`
  (which means live) would have made an invalid field look like a link. Measured, added, and recorded
  as an amendment in `docs/DESIGN.md` section 10.
- Hover states are derived from the roles with `color-mix` rather than being new hues, so they stay
  correct in both themes automatically.
- The theme store and reduced-motion hook use `useSyncExternalStore`, not `setState` in an effect —
  the lint rule flagged the latter and it was right: the theme genuinely lives outside React.
- The root layout types its own props; `LayoutProps<"/">` only exists after a build.

### Known gaps

- The favicon is decided in principle ("F" plus the packet square) but not drawn. It arrives with the
  real metadata in Part 15.
- `Toast` is presentational only. The viewport, queue and dismissal behaviour belong to Part 13, where
  there is a real message to show.
- `Section` is the shell only. Scroll-snap, `inert` on inactive sections, the rail and `hopTo` are
  Part 5.
- The `--spacing` base allows off-scale steps such as `p-5`. Discipline, not enforcement.
- `/design` is off in production. Turn the flag on in Vercel when reviewing, then off again.

### Next

Part 3 — the Supabase backend. It needs the Supabase project created first (A14), and Prompt 3 walks
through it. Part 4 then needs the content inventory (A22), which is still the one input that cannot
be derived or invented.

---

## Part 1 — Scaffold, tooling, CI and preview deployments · 28 August 2026

Status: done.

### What exists

- Next.js 16.3.3 (App Router, Turbopack), React 19.2.8, TypeScript strict, Tailwind CSS v4.
- `src/app/page.tsx` — the holding page: one line, "Building. Back soon.", lower-left against a
  margin that scales with the viewport. `noindex` until launch.
- `src/app/globals.css` — a temporary two-value palette (`--bg`, `--ink`) exposed through Tailwind's
  `@theme inline`, switched by `prefers-color-scheme` with a `data-theme` override. Part 2 replaces
  this file wholesale; the mechanism is the one Part 2 extends.
- `src/lib/env.ts` — zod validation, public and server schemas kept separate so a secret can never be
  added to the client-inlined set. Both parsers take their source as an argument, so they are
  testable without touching `process.env`.
- `.env.example` — `NEXT_PUBLIC_SITE_URL` only. Supabase, Resend and Turnstile variables arrive in
  Parts 3 and 13.
- `scripts/screens.mts` — design screenshots at 390/768/1440 in both themes.
- `.github/workflows/ci.yml` — lint, typecheck, unit tests, build, Playwright + axe. Green, no
  annotations.
- Tests: `src/lib/env.test.ts` (8 cases) and `e2e/home.spec.ts` (renders, 200, no console errors).
- **Deployed on Vercel**, connected to the GitHub repo so every push to `main` deploys automatically:
  <https://portfolio-jade-nu-54.vercel.app/>. `NEXT_PUBLIC_SITE_URL` is set in the Vercel dashboard
  for all three environments. The custom domain is deliberately NOT connected — that is Part 17.
  Note the plan's step 7 says "preview deployment": because we work directly on `main`, pushes
  produce Production deployments. Previews will appear once a branch or pull request exists.

### How to test

```
npm install
npm run dev            # http://localhost:3000 — one line, no template junk, no console errors
npm run lint && npm run typecheck && npm test && npm run build
npm run test:e2e       # builds first, then runs; ~35 s from cold
npm run screens        # writes 6 images to .screens/ — open them and look
npm run screens -- / /design    # any routes can be passed as arguments
```

- `git check-ignore .env.local` prints the path; `git status` stays clean without it.
- CI: `gh run list --limit 1` shows the latest push green.
- Live: <https://portfolio-jade-nu-54.vercel.app/> returns 200 and serves the line in the HTML source
  (prerendered, not painted by client JavaScript). Verified against commit `5451451` with
  `gh api repos/Fadi-Muhammed/portfolio/deployments`.

### B13 "not vibe-coded" checklist — holding page

Run at 390/768/1440 in both themes. The page is one line, so most rows are trivially satisfied; the
rows that carried weight:

- **Colour**: no ad-hoc hex in markup and no Tailwind default palette classes. The two neutral values
  live in `globals.css` as custom properties. They are explicitly temporary and decide no identity —
  Part 2 is the approval gate, so a characterful holding page would have pre-empted it.
- **Typography**: system stack on purpose. `next/font` and the real pairing are Part 2 step 3;
  loading a face now would have quietly made that choice.
- **Layout**: lower-left against a generous margin, not centred in a `max-w-4xl` column.
- **First critique found a real fault.** At 1440 the line was 36 px in a 1440×900 field and read as
  unfinished rather than deliberately quiet. Type and margin now scale with the viewport
  (`text-3xl → 4xl → 5xl`, `px-6 → 10 → 16`). Re-shot and re-checked.
- **Remove one accessory**: dropped the redundant `bg-bg` / `text-ink` utility classes from the
  markup. `body` already sets both from the custom properties, so the utilities were decoration
  restating the cascade.
- Not near-black + acid green, not cream + serif + terracotta, not broadsheet hairlines. No motion,
  no icons, no images yet.

### Decided without asking

Recorded in full in `docs/DECISIONS.md` under 28 August 2026. The ones that change the repo's shape:

- `--empty`, `--disable-git` and no `AGENTS.md` when scaffolding; the sibling directory could not be
  called `_scaffold` because npm rejects a leading underscore.
- Tailwind v4, which is what `create-next-app` now ships; Part 2 explicitly allows `@theme`.
- Root layout is typed by hand rather than with Next's generated `LayoutProps<"/">`, which only
  exists after a build and so broke `npm run typecheck` on a clean checkout — exactly what CI does.
- `turbopack.root` pinned; Turbopack was otherwise finding an unrelated lockfile above the repo.
- Chromium only in CI. Firefox and Safari are Section F, on real devices, at Part 16.

### Known gaps

- `.env.local` does not exist locally. Nothing reads `env.ts` yet so nothing breaks, but Part 3 will
  need the file when the Supabase keys arrive: `cp .env.example .env.local`, then set
  `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
- `NEXT_PUBLIC_SITE_URL` is validated but nothing imports `env.ts` yet, so a missing value does not
  fail the build. The first consumer arrives with real metadata in Part 15.
- No `/design` route yet; that is Part 2 step 4.

### Next

Part 2 — design tokens and foundations. It opens with a question batch (A23 aesthetic constraints,
A1 now a “Fadi” mark, A24 icons, light/dark default) and then stops at an approval gate: the written
plan in `docs/DESIGN.md` must be approved before any code is written. This is the part that decides
whether the site looks designed or generated.

---

## Part 0 — Private repo, rules, plan and skill in place · 18 August 2026

Status: done.

### What exists

- Git repository on `main`, pushed to the private GitHub repo `Fadi-Muhammed/portfolio`.
- `docs/BUILD_PLAN.md` — the plan, spec and part prompts (moved here from the repo root).
- `.claude/skills/frontend-design/SKILL.md` — the design skill, at the path Claude Code watches.
- `CLAUDE.md` — the working rules, a verbatim copy of Section C of the plan.
- `docs/DECISIONS.md` — Section A decisions plus a dated log of decisions taken in chat.
- `docs/PROGRESS.md` — this file.
- `.gitignore`, `.editorconfig`, `.gitattributes`, `README.md`.

No application code, no dependencies, no `package.json`. That is correct for Part 0 — the scaffold is
Part 1.

### Tooling checked

git 2.53.0 · Node v22.18.0 · npm 10.9.3 · gh 2.89.0, authenticated as `Fadi-Muhammed`.
Node is above the required 20, so A30 is resolved.

### How to test

- `git log --oneline` shows the initialisation commits; `git tag` shows `part00-done`.
- `gh repo view --json isPrivate,url` reports `"isPrivate": true`.
- On GitHub the repo shows `docs/BUILD_PLAN.md`, `.claude/skills/frontend-design/SKILL.md`,
  `CLAUDE.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`, `.gitignore`, `.editorconfig`, `README.md`.
- `CLAUDE.md` matches Section C of `docs/BUILD_PLAN.md` line for line.
- In Claude Code, typing `/frontend-design` lists the skill. A newly created skills directory can
  need a restart of Claude Code before it is picked up; if it does not appear, restart and use the
  resume prompt from Section E.

### Decided without asking

- Added `.gitattributes` (`* text=auto eol=lf`) on top of the file list in the Part 0 prompt. Git on
  Windows was converting the working copy to CRLF while `.editorconfig` declares LF; left alone, that
  would fight Prettier and ESLint from Part 1 on. Determined by the spec, so decided rather than asked.
- Part 0 step 6 asks for one commit; the line-ending fix is a second, separate commit so the reason is
  recoverable from the history.

### Known gaps

- The `/frontend-design` skill was placed but not confirmed as discoverable in this session — the
  skills directory was created during the session. Verify after the next restart.
- Deferred decisions are listed in `docs/DECISIONS.md`: A14 (Part 3), A21 (Part 11), A22 (Part 4),
  A23 (Part 2), A25 (Part 18).

### Next

Part 1 — scaffold, tooling, CI and preview deployments. A12, A13 and A30 are all answered, so it is
not blocked. Part 1 needs a Vercel account connected to the GitHub repo.
