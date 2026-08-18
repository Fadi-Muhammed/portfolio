# Portfolio website — build plan and Claude Code prompts

Version 1.0 · 18 August 2026 · Output of the planning phase. Nothing in this file has been built yet.

This file has three jobs: it is the specification of the site (Section B), the working rules Claude Code must follow (Section C), and the ordered, copy-paste prompts that build the site part by part (Section D), each with a test checklist. Once Part 0 runs, this file lives in the repo at `docs/BUILD_PLAN.md` and Claude Code is required to re-read the relevant sections before every part.

---

## How to use this file

1. Section A (Decisions) is already filled in from the planning conversation on 18 August 2026. Re-read it and change anything before you start; anything marked "to be provided later" is asked for by the part that needs it.
2. Create an empty folder on your machine for the project (this will become the repo). Put this file inside it, named exactly `BUILD_PLAN.md`. Put your frontend-design skill file inside it as `frontend-design/SKILL.md` (that is: a folder called `frontend-design` containing the file `SKILL.md`). Prompt 0 moves both to their final locations.
3. Make sure these are installed and working before you start: Git; Node 20 LTS or newer (open a terminal and run `node --version` — if it says command not found or shows a version below 20, install the current LTS from nodejs.org); the GitHub CLI (`gh`) logged in to your account (`gh auth login` — you do this yourself, not Claude Code). A Supabase account is needed only from Part 3 on, and Prompt 3 walks you through creating the project.
4. Open Claude Code in that folder. Paste Prompt 0 (Part 0). Then run the parts in order — do not skip; later parts assume earlier ones exist.
5. After each part: run that part's "How to test" checklist yourself. If everything passes, paste the next prompt. If something fails, use the fix-loop prompt (Section E) rather than moving on.
6. Every time you open a new Claude Code session, start with the resume prompt (Section E) so it reloads context from the repo instead of guessing.
7. Every prompt already tells Claude Code to use the frontend-design skill, to never assume, to ask when in doubt, to refer to the repo, and to commit and push. If it ever drifts from those rules, paste the "reset" line from Section E.

A note on the approval gates: Part 2 (design tokens) and the design plan inside Part 7 (hero) deliberately stop and wait for your approval before code is written. Take those seriously — the "not vibe-coded" outcome is decided there, not in the later parts.

---

## Section A — Decisions (fill in before starting)

Filled in on 18 August 2026 from the planning conversation. Claude Code reads this table in Part 0, copies it into `docs/DECISIONS.md`, and asks you about every row that is blank, says "TBD" or "to be provided later" when the part that needs it arrives.

| # | Decision | Your answer | Recommendation / notes |
|---|----------|-------------|------------------------|
| A1 | Your name as it should appear on the site | Fadi Muhammed. Mark: an “FM” monogram is proposed for the favicon and a small nav mark — Claude Code designs it and shows it for approval in Part 2; the full name is used as the nav text. | Also decide whether a short mark/monogram is used in the nav. |
| A2 | Role line (the eyebrow above the tagline) | Telecommunications & network engineer · Tech builder · Freelancer | Carries proof, e.g. "4th-year telecom & network engineer · Web Summit speaker · builds products". Adjust to what is true. |
| A3 | Hero tagline (exact text) | Unemployed & jobless, but not lost. | Draft: "Unemployed & jobless, but not lost." Alternatives from planning: "Unemployed, jobless, and shipping anyway." / "Currently unemployed. Rarely idle." / "No job yet. Strong signal." / "Jobless, not directionless." Stored in the database so it can be changed without a deploy. |
| A4 | Famous quote + attribution (verified) | “Big things have small beginnings.” — David, Prometheus (2012). Note: the line originates in Lawrence of Arabia (1962), spoken by Mr Dryden, and is quoted by David in Prometheus. Display attribution as “Prometheus (2012)” or “Lawrence of Arabia (1962), via Prometheus” — confirm the exact wording in Part 7. | Candidates: Shannon on information as the resolution of uncertainty (a widely used paraphrase of his theory — verify the exact wording before using it as a quote); John Gilmore, "The Net interprets censorship as damage and routes around it." (1993; fits the routing hero); Feynman, "What I cannot create, I do not understand."; Torvalds, "Talk is cheap. Show me the code."; Alan Kay, "The best way to predict the future is to invent it." Avoid quotes with shaky attribution. |
| A5 | Primary visitor | Recruiters/employers and collaborators/clients (both). | One of: recruiters/employers, event organisers, collaborators/clients. Decides section order and hero button wording. |
| A6 | The single job of the site | A mix of “look at what I built” and “hire me / work with me”. Proposed hero buttons: “See my work” (hops to Products) and “Work with me” (hops to Contact); confirm in Part 7. | One of: "hire me", "invite me to speak", "look at what I built". |
| A7 | Section order on the home deck | Default. | Default: Hero → Products → Engineering projects → Achievements & talks → Featured in → About (skills, certifications, experience, education, CV) → Contact. Write "default" or your own order. |
| A8 | Include the About block (skills, certifications, experience, education, CV)? | Yes (as recommended). | Recommended yes. These were suggested during planning, not explicitly confirmed. |
| A9 | Footer "route you took" recap (mini topology lit with the visited path, "Destination reached")? | Yes (as recommended). | Recommended yes; was proposed but not confirmed. |
| A10 | Domain name | fadimuhammed.work (owned). | Buy it before launch (ideally before announcing anything). Write "not yet" if you don't have one. |
| A11 | GitHub username and repo name | GitHub user Fadi-Muhammed (https://github.com/Fadi-Muhammed); repo name `portfolio` (private). | Repo will be private. Suggested name: `portfolio`. |
| A12 | Frontend stack | As recommended: Next.js (App Router) + TypeScript + Tailwind CSS + Motion + cmdk. | Recommended: Next.js (App Router) + TypeScript + Tailwind CSS + Motion (formerly Framer Motion) + cmdk. Alternative: Astro with React islands. Write "as recommended" or your choice. |
| A13 | Hosting | As recommended: Vercel. | Recommended: Vercel (previews per push, easy custom domain). |
| A14 | Supabase project | Not created yet. Create it right before Part 3 — Prompt 3 walks you through it (project name, the region closest to your visitors, and exactly which values to copy into .env.local). | Create it at supabase.com yourself. You will need: project ref, project URL, anon/publishable key, service-role/secret key. You keep the keys; they go in `.env.local` and Vercel, never in the repo or in chat. |
| A15 | Contact email + where form messages should be forwarded | work.fmuhammed@gmail.com for both (public contact address and forwarding address). | |
| A16 | Transactional email provider for form notifications | As recommended: Resend. Never used before — Part 13 walks you through creating the account, the API key and the sender, step by step. | Recommended: Resend (free tier is enough). |
| A17 | Bot protection on the contact form | As recommended: Cloudflare Turnstile + honeypot. Never used before — Part 13 walks you through creating the Turnstile site and keys. | Recommended: Cloudflare Turnstile (free, no puzzles for most users) + a honeypot field. |
| A18 | Analytics | Umami (free tier, privacy-friendly, no cookie banner) — chosen because you had no preference; Part 15 walks you through creating the account and site. Alternative if it is simpler at the time: Vercel Web Analytics. | Recommended: Plausible or Umami (privacy-friendly, no cookie banner needed). "None" is acceptable. |
| A19 | Social links | LinkedIn: https://www.linkedin.com/in/fadi-muhammed-524b75310 · GitHub: https://github.com/Fadi-Muhammed · Others: none for now (add later in site_settings). | LinkedIn URL, X/Instagram DM URL, GitHub, YouTube (if talks are there), anything else. |
| A20 | Slider targets ("Slide into my LinkedIn / DMs") | LinkedIn only → a single slider (“Slide into my LinkedIn →”). A DM slider can be added later. | LinkedIn + which DM channel (X, Instagram, Telegram…). |
| A21 | Featured-in logos | To be provided later — Part 11 asks for the list, the SVGs and the coverage URLs before building. | How many, list of names, whether you have SVG logos and the URL of each piece of coverage. |
| A22 | Content inventory | To be provided later — needed at Part 4 (start collecting rough lists now: products, engineering projects, achievements, talks, certifications, experience, education). | Even rough lists: products, engineering projects (labs, capstones), achievements (hackathons, competitions, basecamps, awards), talks (video/slide links), certifications, experience, education. Claude Code will turn these into structured seed files in Part 4. |
| A23 | Aesthetic constraints | Let the design skill decide; Claude Code asks only if something specific is needed. | Colours you love/hate, fonts you like or own licences for, 2–3 reference sites you admire, whether the default theme is light or dark. Leave blank to let the design skill decide — but say so. |
| A24 | Icon set | As recommended: Lucide. | Recommended: Lucide (single, consistent stroke set). Never mix sets, never use emoji as icons. |
| A25 | Optional extras (blog/notes, testimonials, photo gallery, map of event cities) | Ask one by one when Part 18 comes. | Yes/no for each. They are Part 18 and can be added later. |
| A26 | Languages | English only. | Default: English only. |
| A27 | Availability line for the hero/contact | Open to freelance work and collaborations. (Alternatives: “Open to work, collaborations and freelance projects.” / “Open to collaborations, freelance and full-time work.”) | e.g. "Open to internships from June 2027" or "Open to full-time roles". Stored in the database so it never goes stale. |
| A28 | Your time zone (for the "local time" line in Contact) | Asia/Qatar | IANA name, e.g. `Asia/Dubai`. |
| A29 | Booking link (Calendly/Cal.com) | None for now (skip). | Optional. |
| A30 | Node version installed | Unknown — Claude Code checks with `node --version` in Part 0 step 1; if it is missing or below 20, install the current LTS from nodejs.org and re-run Prompt 0. | Must be 20 or newer. |

---

## Section B — The specification (source of truth)

Claude Code must read this whole section before every part. Where a part's prompt and this section disagree, ask; do not pick one silently.

### B1. Purpose, audience, voice

- A personal portfolio for a fourth-year telecommunications and network engineering student who also builds and ships tech products, speaks at events (including Web Summit), and wins competitions.
- One story, not two people: "I understand systems end to end — from RF and protocols up to the product." Every section should reinforce that.
- Primary visitor and single job of the site: see A5 and A6. Hero button wording, section order and the final section of the deck all follow from these.
- Voice: confident, dry, specific. Sentence case everywhere. Plain verbs. No filler ("Welcome to my portfolio", "passionate developer"), no emoji. The site's vocabulary borrows lightly from networking — hop, node, packet, route, destination, signal — and uses each term consistently (see B12 glossary). The joke in the tagline reads as confidence only because proof sits next to it (the eyebrow and the work); never let the tagline stand alone in a viewport without proof.

### B2. Sections, in deck order (default; see A7)

Each section is one "stop" on the home deck (`/`). Some have detail pages.

1. **Hero** — nav; eyebrow with proof; tagline; two buttons; famous quote; availability line; the interactive routing topology (mid-top-right on desktop). No featured-in strip in the hero (the marquee idea was rejected; featured-in is its own section).
2. **Products** — the tech products built. Cards in the deck (a horizontal filmstrip on mobile, a small grid on desktop, plus "All products →" if there are more than fit). Each has a case-study page at `/products/[slug]`: problem, what was built, role, stack, outcome/metrics, what was learned, images/video, live link, repo. Cards show a real live-status line ("live · 84 ms") from an actual ping.
3. **Engineering projects** — lab projects, capstones, course work. Same card/detail pattern at `/engineering/[slug]`, plus a "concepts applied" line (e.g. OFDM, OSPF, link budget) and tools used, report/PDF link, schematics/diagrams that draw themselves in, and where the content supports it, small interactive instruments (an SNR slider redrawing a BER curve, a clickable topology revealing configs, an expandable packet capture, a mini link-budget calculator). Only build an instrument for a project that actually exists — ask.
4. **Achievements & talks** — competitions, hackathons, basecamps/programs, talks (Web Summit and others), awards. A traceroute-styled timeline: each entry is a hop with number, year, event, city, role and result, links (coverage, video, slides). Filter chips: hackathon / competition / talk / award / program. Talk entries embed video (click-to-load facade, never autoplay) and slides.
5. **Featured in** — logos only. No captions, no headlines, no marquee. Monochrome logos that go full colour on hover/tap, each linking to the actual coverage. At most one quiet motion: on first entry the connecting links draw in once from a small "you" node (the routing motif); if it looks like decoration, cut it.
6. **About** (if A8 = yes) — short bio and story; a "currently" line; skills split into two groups (software/product; telecom/network) shown as tags — tapping a tag filters the projects and they re-layout live, so every skill is backed by work; certifications (CCNA and similar carry weight in this field); experience and education timeline (internships, TA/club roles, degree with expected graduation); CV download (PDF from Supabase Storage). No percentage bars, no radar charts.
7. **Contact** — heading and one line of copy; the form; the handshake success animation; copy-email; local time and availability; socials; optional booking link; the "Slide into my LinkedIn / DMs" slider(s) as the final call to action; footer (route recap if A9 = yes; colophon; privacy note; © line).

Detail pages, error pages, `/design` (token playground, noindex), and optional extras (Part 18) are separate routes outside the deck.

### B3. The deck — one section at a time, with a peek

- The home page is a vertical deck: each section fills the viewport (use `100dvh`, not `100vh`, for mobile browsers). Exactly one section is active at a time.
- Peek strip: the top of the next section is visible at the bottom of the screen (about 72 px on mobile, 96 px on desktop). It contains the next section's name and a one-line teaser ("Next: 12 engineering projects", "Next: talks at Web Summit and beyond"). Tapping/clicking it hops to that section. As the visitor nears the bottom of the current section the teaser text draws slightly upward and the packet in the rail pulses once (a keepalive).
- Snapping guides, never traps. Use CSS scroll-snap on the deck's scroll container plus an IntersectionObserver to detect the active section; never hijack the wheel with JavaScript-driven scrolling. Snap type is a property of the container, not of individual sections, so decide it once: the recommended setup is a `100dvh` scroll container with `scroll-snap-type: y mandatory`, every section exactly `calc(100dvh - var(--peek))` tall with `scroll-snap-align: start` and `scroll-snap-stop: always` (so a fast flick cannot skip one) — which is precisely what makes the top `--peek` pixels of the next section visible below the active one; the peek strip is simply the next section's own header bar (name + teaser), which becomes that section's heading once it is active; the last section may be full height. Any content that does not fit inside a section is handled by an inner scroll region or a horizontal filmstrip — never by making the section taller. If that proves unworkable on real devices, the fallback is `proximity` for the whole deck. Test on a real phone.
- A hop (active section change) does four things: entrance animation for the new section, the packet moves along the rail, the URL hash updates without a jump (`/#engineering`), and the document title suffix updates. Deep links (`/#contact`) land directly on that section.
- Rail: desktop — a slim fixed vertical rail with one node per section and the packet; a small label such as "hop 3 of 7 · engineering". Mobile — a compact tappable dot rail or a thin indicator. Both are keyboard-focusable.
- Keyboard: PageDown/PageUp/arrow keys move one section; a visible "Skip to contact" link at the top; Tab order stays sane inside the active section only (inactive sections are `inert`).
- Reduced motion (`prefers-reduced-motion: reduce`): no smooth scrolling, no entrance animations, instant hops; snap may remain (it is not motion), but must not fight the user.
- Every other way of navigating (command palette, hero topology nodes, hero buttons, rail, peek strip, footer) calls the same `hopTo(sectionId)` function so behaviour is identical everywhere.
- Performance: only the active section and its neighbours mount heavy content; the rest render light placeholders.

### B4. The hero — routing signature

Desktop composition (~1440 wide, roughly):

```
 name · mark                                     ⌘K   work   contact
 ────────────────────────────────────────────────────────────────────
 eyebrow: 4th-year telecom &          ┌───────────────────────────┐
 network engineer who ships           │  interactive routing      │
                                      │  topology — no card, no   │
 UNEMPLOYED & JOBLESS,                │  border, bleeds off the   │
 BUT NOT LOST.                        │  right edge, tucks under  │
                                      │  the nav                  │
 [See my work]  [Work with me]        └───────────────────────────┘

 “quote…” — attribution (small, mono/utility face)   status: open to…
 ────────────────────────────────────────────────────────────────────
                     next: products  ▲   (peek strip)
```

- (Capitals in the wireframe only mean "display size"; the real tagline is set in sentence case.)
- Reading order: topology catches the eye; the tagline is the big second read; the buttons are the action; the quote is the quiet last thing. The topology must be lower-contrast than the tagline (thin strokes, muted colour) so it draws the eye without stealing the read.
- The topology: nodes are the sections (plus a small "you" node); edges connect them in the deck order and a few cross-links; two or three packets travel continuously; the pointer's proximity displaces nodes gently with a spring; hovering a node shows the section label; clicking/tapping a node sends a packet from "you" to that node (≤ 600 ms) and then hops there. Built with SVG (or a small canvas) and `requestAnimationFrame`; no physics library; the module stays small and lazy-loads after first paint. A static SVG of the same topology is server-rendered as the placeholder so first paint is never blank.
- Mobile stacking order: nav (name + search button) → eyebrow → tagline → buttons → topology at reduced height (static layout, tappable nodes, one packet, paused when off-screen or when the tab is hidden) → quote. The topology must never push the tagline below the fold on a phone. Tablets: topology full width under the tagline.
- Reduced motion: static SVG, still tappable.
- Copy: hero buttons say exactly what they do and keep that name everywhere ("See my work" hops to Products; "Work with me" hops to Contact — per A6, confirm the labels in Part 7). Tagline, eyebrow, quote, attribution, availability and the button labels come from `site_settings` in the database.

### B5. Motion system

- Boldness is spent once, in the hero. Everything else inherits the routing idea quietly. Only three moments are orchestrated: the hero load sequence, the engineering diagrams drawing themselves in, and the contact finale (handshake + slider + route recap).
- The connective device is the packet: it lives in the rail and hops when the section changes; the command palette triggers the same hop with a small "routing to contact…" line so shortcuts feel like the same system.
- Per section: Products — a status LED settles to "live", request line on hover/tap, shared-element transition into the case study (View Transitions API where supported, fade fallback). Engineering — SVG stroke draw-in of diagrams, an oscilloscope-sweep divider, instruments move only when the user moves them. Achievements — timeline entries "print" as they enter (number, then year, then event, then result), filters re-layout with FLIP, video play button pulses once. Featured in — hover/tap mono→colour, one-time link draw-in at most. About — quietest section: clean entrance; tapping a skill filters projects live. Contact — the finale.
- Rules: one easing curve everywhere; durations 200–500 ms; staggers ≤ 60 ms; no bounce except the physical spring-back of the slider; content readable within ~300 ms of arriving; hover effects always duplicated as taps; transform/opacity-only animations; shorter durations on mobile; live pings once, not continuously; everything respects reduced motion with a still-designed static fallback.

### B6. Command palette

- `Ctrl/⌘ + K` on desktop; a visible "Search" button (icon + label) in the nav on all sizes; also reachable via `/` if it doesn't conflict with typing.
- Groups: Sections; Products; Engineering; Achievements & talks; Links (LinkedIn, GitHub, X, email, CV); Actions (Toggle theme, Copy email, "ping" easter egg that prints a mock ping reply inside the palette).
- Fuzzy search, full keyboard control, screen-reader announcements, closes on select, returns focus. Selecting a section hops (same `hopTo`); selecting a project routes to its page. Item lists are built from the database at build/revalidate time so they stay current.
- Recommended library: cmdk. Style it from the tokens; it must not look like a stock shadcn palette.

### B7. "Slide into my LinkedIn / DMs" slider

- A pill-shaped track with a round handle at the left and the label inside ("Slide into my LinkedIn →"). Dragging pulls the handle; the label fades/wipes as it goes; past ~85 % it snaps to the end, the handle turns into a check, the label flips to "Opening LinkedIn…", and the profile opens in a new tab (`rel="noopener noreferrer"`). Released early → spring back (the only bounce allowed on the site). Success state resets after ~2 s.
- Targets per A20: currently LinkedIn only, so one slider. If a DM target is added later, use either two stacked sliders or one track with a switch between LinkedIn and DMs.
- Touch-first (`touch-action: none` on the track, pointer events), works with mouse; a small "drag" hint on hover on desktop; a one-time nudge of the handle on first view per session (skipped under reduced motion).
- Accessible: focusable, `role="button"`, an accurate label, Enter/Space triggers the action, hit target ≥ 44 px.
- Placement: the last call to action in Contact, before the footer.

### B8. Featured in — logos only

- A clean grid (or a gentle constellation around a small "you" node) of monochrome logos, each an SVG normalised to the same visual height, each linked to the real coverage in a new tab. Full colour on hover/tap. Header: "Featured in" (or "As seen at"). No captions, no quotes, no counts, no marquee.
- Optional single motion: connecting links draw in once from the "you" node on first entry. Under reduced motion, nothing moves.
- Logos live in Supabase Storage (`logos` bucket) with a row per logo in `featured_in` (name, logo path, url, sort order, published). If there are more than about a dozen, group by type (press / stages / programs).

### B9. Contact

- Form: name, email, message; honeypot field; Turnstile (A17). Submit button "Send message" → in flight "Sending…" → success "Message sent" with the three-way-handshake animation (SYN → SYN-ACK → ACK drawn as three small labelled arrows between two nodes) and a thank-you line → failure "Message didn't send. Check your connection and try again." with a `mailto:` fallback link. Validation is inline and specific.
- Server side: validate (zod), verify Turnstile, throttle (e.g. count of recent messages from the same hashed IP in the last 10 minutes), insert into `contact_messages` using the server-only key, send a notification email via Resend (A16), return a typed result. Works with JavaScript disabled via a normal form post fallback where feasible.
- Also in the section: "Copy email" → "Copied" toast; your local time ("It's 14:32 for me", from A28) and the availability line; social links; optional booking embed/link (A29); CV download; the slider(s) (B7).
- Footer: route recap if A9 = yes (a small copy of the hero topology with the sections the visitor actually visited lit up, caption "Destination reached."); a colophon line ("Built with Next.js and Supabase. Source viewable." or similar — no jokes about coffee); privacy note (what analytics runs, no cookies if that's true); © line; email link that is revealed on click rather than plain in the HTML.

### B10. Error, empty, loading, offline and maintenance states

All in the routing voice, all styled from the same tokens, all full-height and mobile-friendly, all with a way out (home, search, email), all light enough to render when everything else has failed. Errors explain what happened and what to do; they never apologise or stay vague.

- 404 — "Route not found." A small broken topology (packet stopped at a dead node, dashed link beyond). Buttons: "Back to home", "Search the site" (opens the palette). Optionally the last few visited pages as suggested routes.
- 500 / render error — "Packet dropped." The fault is on our side; copy says so; "Try again" and "Home". Must be a lightweight, mostly static page (`error.tsx` and `global-error.tsx` in Next.js).
- Offline — "No signal." Shown when the browser loses connectivity (`navigator.onLine` + `online`/`offline` events); retries automatically; confirms "Signal restored" before returning.
- Rate-limited or form failure — inline in the form, not a page.
- Maintenance — "Down for maintenance, back at 14:00 GMT" behind an environment flag (`MAINTENANCE_MODE=true`) with a bypass for you (secret cookie or query key).
- Empty states — a filter with no matches: "No hops match. Clear filters."; a project whose live status can't be reached: "Endpoint unreachable — demo video below."; an empty content table in dev: an invitation to seed.
- Loading — designed placeholders (skeletons in the token colours; the static SVG topology for the hero), never a blank screen or a spinner in the middle of nothing.

### B11. Content and backend (Supabase)

- Postgres tables (all with `id uuid primary key default gen_random_uuid()`, `created_at`, `updated_at`; content tables also have `slug text unique`, `sort_order int`, `published boolean default false`):
  - `products`: title, summary, body (markdown), stack text[], tags text[], cover_image_path, gallery jsonb, live_url, repo_url, demo_video_url, status_check_url, outcome, metrics jsonb.
  - `engineering_projects`: title, summary, body, type (lab | capstone | course | personal), concepts text[], tools text[], cover_image_path, gallery jsonb, report_path, repo_url, interactive_widget text (identifier of an instrument to render, nullable), data jsonb (widget data).
  - `achievements`: title, type (hackathon | competition | talk | award | program), event_name, role, result, date, city, country, summary, links jsonb (coverage, video_url, slides_url, repo), media jsonb, featured boolean.
  - `featured_in`: name, logo_path, url, category (press | stage | program), sort_order, published.
  - `skills`: name, category (software | telecom), linked_slugs text[], sort_order.
  - `certifications`: name, issuer, issued_on, credential_url, logo_path.
  - `experience`: org, role, type (internship | job | volunteer | leadership | education), start_date, end_date, location, summary, highlights text[].
  - `site_settings` (single row): tagline, eyebrow, quote, quote_author, availability, email, socials jsonb, cv_path, hero_primary_label, hero_secondary_label, timezone, maintenance_message.
  - `contact_messages`: name, email, message, ip_hash, user_agent, source, handled boolean default false.
  - `testimonials` (optional, Part 18): quote, author, role, org, published.
- Storage buckets: `media` (public: covers, gallery, photos), `logos` (public), `documents` (public: CV, reports).
- Row Level Security enabled on every table. Anonymous role: `select` on content tables only where `published = true` (and on `site_settings`); no insert/update/delete anywhere; no policies at all on `contact_messages` for anon — the server inserts with the service-role/secret key. The service-role/secret key exists only in server-side environment variables, never in client code, never in the repo, never pasted into chat.
- Editing workflow: you edit content in Supabase Studio (table editor + Storage upload). Initial content is loaded from `content/seed/*.json` by an idempotent seed script (upsert by slug) that runs locally with the service key. Schema changes are always migrations in `supabase/migrations`, pushed with the Supabase CLI, followed by regenerating TypeScript types.
- Freshness: pages use ISR (revalidate about 300 s) plus an on-demand revalidation route protected by a secret that a Supabase Database Webhook calls on insert/update/delete of content tables.
- Live status for products: a server route pings `status_check_url` with a short timeout, caches for ~60 s, and returns `{ ok, ms }`.

### B12. Cross-cutting requirements

- Mobile-first: design every component at 390 px first, then 768, then 1440. Hover never carries meaning alone; hit targets ≥ 44 px; `100dvh`; test iOS Safari and Android Chrome on real devices for scroll-snap and viewport quirks.
- Accessibility: WCAG 2.2 AA colour contrast (≥ 4.5:1 body text, ≥ 3:1 large text and UI); visible focus rings; full keyboard operation of deck, rail, palette, slider, filters, forms; correct names/roles for the topology nodes, rail, slider and palette; `inert` inactive sections; reduced motion respected everywhere; zero serious axe violations.
- Performance budget: LCP < 2.0 s on a throttled 4G mobile profile; CLS < 0.05; home page JavaScript ≤ ~200 KB gzipped including the framework runtime; hero module lazy-loaded; `next/font` with subsetting; `next/image`; Lighthouse mobile ≥ 90 in Performance, Accessibility, Best Practices, SEO.
- SEO and sharing: per-page metadata, canonical URLs, Open Graph/Twitter images generated per page (home + every detail page) with `next/og`, `sitemap.xml`, `robots.txt`, JSON-LD (`Person`, `WebSite`), a favicon set and web manifest, "Copy link" on detail pages. LinkedIn is the main sharing channel, so OG previews are checked with LinkedIn's Post Inspector before launch.
- Analytics: A18, loaded only in production; a one-line privacy note in the footer.
- Security: RLS on everything; secrets only in env; `.env.example` lists variable names; basic security headers (CSP, frame-ancestors, referrer-policy) without breaking embeds; Turnstile + honeypot + throttle on the form; dependency updates via Dependabot or Renovate.
- Print: a print stylesheet that lays the deck out linearly (all sections, no interactive chrome) so "Save as PDF" produces something readable.
- Copy glossary (use consistently): hop = moving between sections; node = a section or destination; packet = the moving indicator; route = the visitor's path; destination reached = the footer/contact end state; signal = connectivity/status. Buttons keep the same name through a flow ("Send message" → "Message sent"). Sentence case; no exclamation marks in UI copy; no emoji.
- Small proofs of craft (Part 15): `humans.txt`, a colophon, a console easter egg for developers who inspect the page, a "view source" hint.

### B13. The "not vibe-coded" checklist

Claude Code runs this on every UI part before declaring it done, and records the result in `docs/PROGRESS.md`.

- Every colour, spacing, radius and type value comes from the token system in `docs/DESIGN.md`. No ad-hoc hex values; no Tailwind default palette classes (`bg-blue-500`, `text-gray-400`); no default gradients (`from-purple-500 to-pink-500`), glassmorphism blur cards, glow borders or drop-shadow-on-everything unless the token system defines them.
- Typography is a chosen display + body (+ mono/utility) pairing loaded with `next/font`, with a real type scale and deliberate letter-spacing and line-height. Not Inter-for-everything by default; not the AI defaults the design skill names (cream + serif + terracotta; near-black + acid-green/vermilion; broadsheet hairlines). The routing theme leans toward the near-black + neon-green terminal look — that is the trap for this project; the palette must be a deliberate alternative.
- Layout has an intentional grid; not everything centred in one `max-w-4xl` column; no card-in-card; a small, consistent radius scale; no `rounded-2xl shadow-lg` on everything; structural devices (numbering, eyebrows, dividers) encode something true — hop numbers are allowed because the deck is a real sequence; decorative "01/02/03" elsewhere is not.
- Copy is real: no lorem ipsum, no placeholder names, no "Welcome to my portfolio", no "passionate", no emoji bullets; sentence case; error and empty states written; button names consistent.
- Motion follows B5: one easing, 200–500 ms, staggers ≤ 60 ms, no bounce (except the slider), no fade-up on every element, no floating blobs/particles/gradient meshes, reduced motion respected.
- Icons: one set (A24), consistent stroke; custom SVG where the set lacks something; no emoji.
- Images: real screenshots and photos, sized and compressed; no placeholder gradients or stock photos.
- Interaction: visible focus; touch equivalents for hover; nothing depends on hover; hit targets ≥ 44 px.
- Code: strict TypeScript, no `any`; no console errors or warnings; no unused dependencies; env validated at boot; components small and named for what they are.
- Screenshots at 390, 768 and 1440 px (both themes) reviewed against the design skill; the "remove one accessory" pass done and what was removed noted.

### B14. Definition of done for any part

- Every sub-step committed with a conventional commit message (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `style:`, `perf:`); pushed; tagged `partNN-done`.
- `npm run lint && npm run typecheck && npm test && npm run build` pass; the part's Playwright tests pass; for UI parts, `npm run screens` was run and the screenshots reviewed.
- B13 checklist run for UI parts.
- `docs/PROGRESS.md` updated (what's done, how to test it, known gaps, decisions made, what's next); `docs/DECISIONS.md` updated with anything decided in chat.
- A short report to the user: what was built, exactly how to test it, open questions.

---

## Section C — Working rules for Claude Code (this becomes `CLAUDE.md`)

Prompt 0 tells Claude Code to create `CLAUDE.md` at the repo root containing exactly this section (adjusting only paths that differ).

```markdown
# CLAUDE.md — working rules for this repository

This is a personal portfolio website. The full specification and build plan is docs/BUILD_PLAN.md
(Section B = spec, Section D = parts). Decisions made so far are in docs/DECISIONS.md. Progress and
how-to-test notes are in docs/PROGRESS.md. Design tokens and rationale live in docs/DESIGN.md
(after Part 2). Read these before starting any work.

## Never assume — ask
- If anything is unclear, missing, contradictory, or would require guessing content, copy, brand,
  structure, external services, or spending money, stop and ask. Ask in one batch at the start of a
  part; then proceed. Record every answer in docs/DECISIONS.md with the date.
- Do not invent content: no lorem ipsum, no placeholder projects, no made-up metrics or quotes.
  Use the real content from content/seed and the database, or ask for it.
- Implementation details that are fully determined by the spec and the existing code, you may decide
  yourself; say what you decided in the report.

## Always refer to the repo
- Before writing code, look at what already exists: components, tokens, utilities, tests, naming.
  Reuse and extend; do not create parallel conventions.
- Follow docs/DESIGN.md exactly for every visual decision. Do not introduce colours, fonts, spacing or
  radii that are not tokens.

## Use the frontend-design skill for all UI work
- The skill is at .claude/skills/frontend-design/SKILL.md (invocable as /frontend-design). Apply it to
  every component, page, state (empty, loading, error) and piece of UI copy. Its "not the AI default"
  calibration, "hero is a thesis", "spend boldness once", "structure is information", "restraint and
  self-critique", and "writing in design" sections are binding.
- After building any UI, run npm run screens (390/768/1440, both themes), look at the screenshots,
  critique them against the skill and docs/BUILD_PLAN.md B13, and fix before reporting.

## Git discipline
- Work on main unless told otherwise. Commit after every meaningful sub-step with a conventional
  commit message. Push at the end of every part and tag partNN-done. Never leave work uncommitted
  at the end of a session.
- Never commit secrets. .env.local is gitignored; the user adds keys there and in Vercel. Tell the
  user which variables you need and keep .env.example current. Never print or paste keys.
- Never force-push, rewrite history, or delete branches/tags without explicit instruction.

## Quality floor
- Mobile-first, keyboard-operable, WCAG 2.2 AA contrast, prefers-reduced-motion respected everywhere,
  100dvh not 100vh, hit targets >= 44px, hover always has a touch equivalent.
- Strict TypeScript, no any, no console errors, no unused deps, tests for behaviour that matters.
- Definition of done is docs/BUILD_PLAN.md B14. Do not report a part as done until it is met.

## Voice
- Sentence case. Plain verbs. Buttons say what they do and keep the same name through a flow.
  Errors explain what happened and what to do; they do not apologise. No emoji, no exclamation
  marks, no filler. Networking vocabulary (hop, node, packet, route, destination, signal) used
  consistently per docs/BUILD_PLAN.md B12.

## The site must not look vibe-coded
- Run the docs/BUILD_PLAN.md B13 checklist on every UI part and record the outcome in
  docs/PROGRESS.md, including what you removed in the "remove one accessory" pass.

## Reporting
- End every part with: what was built, exactly how the user can test it (commands and clicks),
  known gaps, open questions. Update docs/PROGRESS.md first, then report.
```

---

## Section D — The parts: prompts and tests

Every prompt below is meant to be pasted into Claude Code as-is. Each one restates the non-negotiables (skill, no assumptions, repo as context, commits) on purpose — repetition is what keeps them alive across sessions. Run the parts in order. The "How to test" checklist is for you; do not move on until it passes.

### Part 0 — Private repo, rules, plan and skill in place

Goal: a private GitHub repo containing the plan, the working rules, the design skill, and nothing else yet.

Prompt 0:

```text
We are starting a new project: my personal portfolio website. Before anything else, read the two files already in this folder: BUILD_PLAN.md (the full plan, spec and rules for the whole project) and frontend-design/SKILL.md (a design skill you must use for all UI work later in this project).

Rules for this whole project, starting right now:
- Never assume. If anything is unclear, or a decision in BUILD_PLAN.md Section A is blank or "TBD", stop and ask me before doing anything that depends on it. Ask your questions in one batch.
- Always refer to the repo (BUILD_PLAN.md, and later CLAUDE.md, docs/, the existing code) for context before deciding anything.
- Commit after every meaningful sub-step with a conventional commit message, and push at the end of every part.
- Never write secrets into the repo or into chat. I will add keys to .env.local myself; you tell me which variables you need.
- Later, every piece of UI must be built with the frontend-design skill; in this part you only put it in place.

Do the following, in order:
1. Check tooling: run `git --version`, `node --version` (must be 20 or newer), `gh --version`, and `gh auth status`. If gh is not installed or I am not logged in, stop and tell me exactly what to run myself — you must not run `gh auth login` for me.
2. Run `git init -b main`. Move BUILD_PLAN.md to docs/BUILD_PLAN.md and move frontend-design/SKILL.md to .claude/skills/frontend-design/SKILL.md (the file name must stay exactly SKILL.md). Confirm the skill is discoverable (it should be available as /frontend-design); if it is not, tell me — a newly created skills directory can require restarting Claude Code before it is watched, in which case I will restart and re-run the resume prompt.
3. Create CLAUDE.md at the repo root containing exactly Section C of docs/BUILD_PLAN.md (the fenced block), adapting only paths if any differ.
4. Create docs/PROGRESS.md (a running log with: done so far, how to test it, known gaps, next part) and docs/DECISIONS.md (every decision I make in chat is appended here with the date). Seed DECISIONS.md with the answers from BUILD_PLAN.md Section A. Then list every row in Section A that is blank or "TBD" and ask me about them now. A11 (repo name) must be answered before step 7; A12, A13 and A30 must be answered before Part 1 starts; the rest can wait for the part that needs them.
5. Add a .gitignore (Node, Next.js, .env*, .vercel, supabase/.temp, .screens, OS files, editor files), an .editorconfig, and a short README.md that says what the project is and points to docs/.
6. Commit: "chore: initialise repo with plan, rules and design skill".
7. Create a PRIVATE GitHub repo named as decided in A11 with `gh repo create <name> --private --source=. --remote=origin --push`. Then confirm it is private with `gh repo view --json isPrivate`.
8. Tag part00-done and push the tag. Report back: the repo URL, the file tree, and any open questions.

Do not scaffold the app or install any dependencies in this part.
```

How to test Part 0:
- On GitHub, the repo exists, is marked Private, and contains `docs/BUILD_PLAN.md`, `.claude/skills/frontend-design/SKILL.md`, `CLAUDE.md`, `docs/PROGRESS.md`, `docs/DECISIONS.md`, `.gitignore`, `.editorconfig`, `README.md`.
- `git log --oneline` shows the initialisation commit; `git tag` shows `part00-done`.
- `CLAUDE.md` matches Section C.
- In Claude Code, typing `/frontend-design` shows the skill.

### Part 1 — Scaffold, tooling, CI and preview deployments

Goal: an empty-but-real app that builds, lints, type-checks, tests, deploys previews on every push, and can take screenshots of itself for design review.

Prompt 1:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B fully, and Part 1 in Section D), docs/DECISIONS.md and docs/PROGRESS.md before doing anything. Confirm the tag part00-done exists. This is Part 1: scaffold, tooling, CI and preview deployments. Do not assume anything not in those files — list your open questions first, in one batch, and wait for my answers. Refer to the repo for context. Commit after each sub-step, push at the end, tag part01-done. The frontend-design skill (.claude/skills/frontend-design/SKILL.md, /frontend-design) applies to any UI you touch, including the temporary placeholder page.

1. Confirm the stack from A12/A13 (recommended: Next.js App Router + TypeScript + Tailwind CSS + Motion + cmdk, hosted on Vercel). If A12 or A13 is not "as recommended" or an explicit choice, ask.
2. Scaffold in a temporary sibling directory (for example `npx create-next-app@latest ../_scaffold --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm` — check `npx create-next-app@latest --help` first, flags change between versions), then move the scaffold's contents into this repo root WITHOUT overwriting CLAUDE.md, README.md, docs/, .claude/, .editorconfig or .gitignore (merge .gitignore entries). Reason: create-next-app refuses non-empty folders that contain files it doesn't recognise. Delete the temporary directory afterwards.
3. Remove all template boilerplate (default page content, Vercel/Next logos, sample CSS). The root page should render a single deliberately styled placeholder line ("Building. Back soon.") — designed with the skill, using a neutral temporary style; real tokens arrive in Part 2.
4. Install and configure: `motion`, `cmdk`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, the icon set from A24 (`lucide-react` if recommended); Prettier with an ESLint-compatible config; Vitest + @testing-library/react + jsdom for unit tests; Playwright + @axe-core/playwright for e2e and accessibility; a zod-validated `src/lib/env.ts` for environment variables (server and public separated); a `.env.example` listing every variable you introduce (values blank). Do not install anything else without asking.
5. Add npm scripts: dev, build, start, lint, typecheck (tsc --noEmit), format, test (vitest run), test:e2e (playwright test), screens (a Playwright script that captures /, and any routes passed as args, at 390, 768 and 1440 px in light and dark themes into ./.screens/, gitignored, so you can view them and critique against the design skill).
6. GitHub Actions workflow on push and pull_request: install, lint, typecheck, test, build (with dummy public env values), and Playwright e2e against the built app. Cache dependencies. It must pass before Part 1 is done.
7. Vercel: guide me step by step to import the repo in the Vercel dashboard and add the env vars from .env.example — you must not log in as me or add secrets yourself. Then confirm a preview deployment exists for the current commit and note the URL in docs/PROGRESS.md.
8. Add a first Playwright test (home renders, no console errors) and a first Vitest test (env parsing).
9. Update docs/PROGRESS.md and docs/DECISIONS.md, commit, push, tag part01-done, and report: how to run everything locally, the CI status, the preview URL, open questions.
```

How to test Part 1:
- `npm install && npm run dev` starts; `http://localhost:3000` shows the placeholder line, no template junk, no console errors.
- `npm run lint && npm run typecheck && npm test && npm run build` all pass locally.
- `npm run test:e2e` passes; `npm run screens` produces images in `.screens/`.
- The GitHub Actions run for the latest push is green.
- A Vercel preview URL opens the same placeholder.
- `.env.example` exists; `.env.local` is not tracked (`git status` clean, `git check-ignore .env.local` prints the path).

### Part 2 — Design tokens and foundations (approval gate)

Goal: the visual identity, decided on paper first, then implemented as tokens and primitives — with your approval in between. This is where "not vibe-coded" is won or lost.

Prompt 2:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B fully — especially B1, B4, B5, B12, B13 — and Part 2 in Section D), docs/DECISIONS.md and docs/PROGRESS.md. Confirm part01-done exists. This is Part 2: design tokens and foundations. Use the frontend-design skill (/frontend-design) as the method for this entire part; its planning pass is the deliverable of step 2. Do not assume — ask first, in one batch (start with A23 aesthetic constraints, A1 name/mark, A24 icons, light/dark default). Refer to the repo. Commit after each sub-step, push at the end, tag part02-done.

1. Ask me the batch of questions. Wait.
2. DESIGN PLAN, ON PAPER FIRST — DO NOT WRITE CODE YET. Following the skill's process (brainstorm, explore, plan, critique), produce docs/DESIGN.md containing:
   - Subject grounding: one paragraph naming the subject (a telecom/network engineer who ships products), the audience (A5) and the page's single job (A6), and where the visual language comes from (RF instruments, network diagrams, signal, protocols — the subject's own world).
   - Palette: 4–6 named hex values with roles (background, surface, ink, muted, accent, signal/status), for both light and dark themes, with contrast ratios stated for every text/background pair (>= 4.5:1 body, >= 3:1 large/UI).
   - Type: display face, body face, mono/utility face, each with a one-line reason; a type scale (sizes, weights, line-heights, letter-spacing) for display, h1–h3, body, small, caption/data; how they are loaded (next/font, self-hosted, licence noted).
   - Layout concept in one sentence plus ASCII wireframes for the hero, one deck section, one detail page, and the contact section, at 390 px and 1440 px.
   - Signature: the routing topology in the hero (B4), described precisely: stroke weights, node sizes, packet look, colours from the palette, how it stays quieter than the tagline.
   - Motion tokens: the one easing curve, duration scale, stagger, reduced-motion behaviour (B5).
   - Spacing scale, radius scale (small), border/hairline rules, focus ring style, shadow policy (default: none), icon set and stroke width.
   - Self-critique: explicitly check the plan against the skill's three AI-default looks and against B13, and against the trap for this project (near-black + acid-green terminal). State what you changed after the critique and why.
   Present the plan to me in chat, ask for approval, and STOP. Do not proceed to step 3 until I approve or request changes.
3. Implement the approved plan: src/styles/tokens.css (CSS custom properties for both themes, applied via a data-theme attribute), Tailwind configured (config file or CSS-first @theme, depending on the installed version) so utilities reference ONLY those tokens and none of the default palette, fonts via next/font, global base styles, type-scale utilities, a theme provider with toggle (system default, persisted, no flash on load), a useReducedMotion hook and a CSS utility that disables animation under prefers-reduced-motion, focus-ring styles, and shared primitives: Button (primary/secondary/quiet), Link, Input/Textarea with error state, Card, Tag/Chip, Toast, Section shell (heading + teaser + peek-strip header slot), Skeleton, VisuallyHidden.
4. Create the /design route (noindex; only in non-production or behind a flag — ask which) that renders every token, the type scale, every primitive in every state (default, hover, focus, active, disabled, error, loading, empty), in both themes.
5. Run npm run screens for /design at 390/768/1440 in both themes, view the images, critique against the skill and B13, fix, and record the critique in docs/PROGRESS.md.
6. Add unit tests for the theme provider and a Playwright + axe check of /design (zero serious violations, both themes).
7. Update docs, commit, push, tag part02-done, report — including a request for me to look at /design on my phone and desktop before I approve moving on.
```

How to test Part 2:
- You approved the written plan in `docs/DESIGN.md` before any code was written.
- `/design` renders in both themes with no flash of wrong theme on reload; every primitive shows every state; focus rings visible with keyboard Tab.
- Contrast: spot-check three text/background pairs with a contrast checker; all ≥ 4.5:1.
- The palette is not near-black + neon green, not cream + terracotta serif, not broadsheet hairlines (unless you asked for one of these).
- `.screens/` images look like a designed page on 390 px too.
- CI green; `npm test` and `npm run test:e2e` pass.

### Part 3 — Supabase backend

Goal: the database, storage, security policies and typed client, with the schema from B11, all as migrations.

Prompt 3:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B11 and B12 security — and Part 3 in Section D), docs/DECISIONS.md, docs/PROGRESS.md. Confirm part02-done exists. This is Part 3: Supabase backend. Do not assume — ask first in one batch. Refer to the repo. Commit after each sub-step, push at the end, tag part03-done. Never ask me to paste keys into chat; tell me the variable names and I will put them in .env.local and Vercel myself. The frontend-design skill applies to any UI you touch (there should be almost none in this part).

1. The Supabase project does not exist yet (A14): first walk me through creating it at supabase.com step by step (organisation, project name, database password — which I keep, region closest to my visitors) and show me exactly where to find the project ref, URL, anon/publishable key and service-role/secret key, and where to put them (.env.local now, Vercel later). Then ask me: whether the project exists and its region; whether I have put NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (or the publishable key), SUPABASE_SERVICE_ROLE_KEY (or the secret key) and SUPABASE_PROJECT_REF into .env.local; and whether I am logged in to the Supabase CLI (`npx supabase login` — I run login myself). Wait.
2. Install the CLI as a dev dependency if it is not present (`npm i -D supabase`), then `npx supabase init`, then `npx supabase link --project-ref <ref from env>`. Never commit supabase/.temp.
3. Write migrations in supabase/migrations for the full schema in B11: all tables, enums for the typed columns, updated_at triggers, indexes on slug/published/sort_order/date, the site_settings single-row constraint, and the storage buckets (media, logos, documents; public read) with the minimal storage policies needed. Enable RLS on every table and write exactly the policies described in B11 (anon select where published = true; anon select on site_settings; nothing else for anon; no anon policies on contact_messages). Add a SQL comment on every table describing what it is for.
4. `npx supabase db push`, then generate types with `npx supabase gen types --lang=typescript --linked > src/lib/supabase/types.ts` (check `npx supabase gen types --help` for the exact syntax of the installed CLI) and add that as the npm script db:types; add db:push and db:new (migration new) scripts too.
5. Create the clients: a browser/anon client for public reads (src/lib/supabase/public.ts), a server-only client using the service key (src/lib/supabase/server.ts, marked server-only so it can never be bundled to the client), and a small typed query helper layer stub that Part 4 will fill.
6. Add a health check route (GET /api/health) that reports database reachability without exposing anything sensitive; add a Vitest test for the env validation of the new variables and a Playwright test that /api/health returns ok when env is present.
7. Write docs/BACKEND.md: how to create a migration, push it, regenerate types, how RLS is set up, what each bucket is for, and how you (the user) edit content in Supabase Studio. Update .env.example.
8. Verify with me: in Supabase Studio, tables exist and RLS shows enabled on all of them. Then update docs, commit, push, tag part03-done, report.
```

How to test Part 3:
- Supabase Studio → Table Editor shows every table from B11; Authentication → Policies shows RLS enabled with the described policies; Storage shows `media`, `logos`, `documents`.
- Using the SQL editor as the `anon` role (or the REST API with the anon key), you can select from `site_settings` and from `products where published = true`, and an insert into any table fails.
- `npm run db:types` regenerates `src/lib/supabase/types.ts` without diffs; `curl http://localhost:3000/api/health` returns ok.
- `git grep -n "sb_secret\|eyJhbGci" -- ':!package-lock.json'` returns nothing (no Supabase keys in the repo — `eyJhbGci` is the start of every legacy JWT-style key), and `git check-ignore .env.local` prints the path.
- CI green.

### Part 4 — Data layer and content seeding

Goal: typed content fetchers with caching and revalidation, and your real content loaded into the database.

Prompt 4:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B2 and B11 — and Part 4 in Section D), docs/DECISIONS.md, docs/PROGRESS.md, docs/BACKEND.md. Confirm part03-done exists. This is Part 4: data layer and content seeding. Do not assume — ask first in one batch. Refer to the repo. Commit after each sub-step, push at the end, tag part04-done. The frontend-design skill applies to any UI you touch (the dev-only content page in step 5).

1. Ask me for the content inventory (A22) in whatever form I have it — rough lists are fine — plus site_settings values (A2, A3, A4, A27, A28, socials, email) and the featured-in list (A21). Wait. Do not invent any content; if a field is unknown, leave it null and list it as a gap.
2. Create content/seed/*.json (one file per table) that follow the schema exactly, with zod schemas in src/lib/content/schemas.ts that validate them; structure my rough content into these files and show me anything you had to interpret. Real images/logos/PDFs: create content/assets/ with the expected paths and tell me exactly which files to drop where; write scripts/upload-assets.ts to push them to the right Storage buckets (idempotent, skips unchanged files).
3. Write scripts/seed.ts: idempotent upsert by slug (or by singleton for site_settings) using the server key from .env.local, never bundled; npm script db:seed. Run it and confirm row counts.
4. Write the typed data layer in src/lib/content/*.ts: getSiteSettings, getProducts/getProduct(slug), getEngineeringProjects/getEngineeringProject(slug), getAchievements(filter?), getFeaturedIn, getSkills, getCertifications, getExperience — public reads only, published-only, sorted, using Next.js caching with tags and ISR (~300 s). Add a POST /api/revalidate route protected by a REVALIDATE_SECRET that revalidates by tag, and document how to create the Supabase Database Webhook that calls it (I will click it in the dashboard).
5. Add a dev-only /debug/content page (blocked in production) that lists everything from the data layer so we can eyeball the seeded content; style it with the tokens (skill applies).
6. Tests: unit tests for the schemas and the fetchers (mocked client); a Playwright check of /debug/content in dev.
7. Update docs (BACKEND.md gets the seeding and webhook steps; PROGRESS.md gets the content gaps list), commit, push, tag part04-done, report.
```

How to test Part 4:
- `npm run db:seed` runs twice without creating duplicates; row counts in Studio match your inventory.
- `/debug/content` in dev shows your real products, projects, achievements, logos, settings; nothing invented.
- Change a title in Studio, call the revalidate route (or wait ~5 min), and the change appears.
- Uploaded assets are visible in the Storage buckets and load via their public URLs.
- CI green.

### Part 5 — Deck engine, navigation and hop rail

Goal: the one-section-at-a-time home deck with the peek strip, the rail with the packet, and `hopTo()` — with real section shells and real teasers, before any section's content is built.

Prompt 5:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B2, B3, B5, B12 — and Part 5 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part04-done exists. This is Part 5: the deck engine, navigation and hop rail. Use the frontend-design skill (/frontend-design) for every visual and copy decision. Do not assume — ask first in one batch (confirm A7 section order and the peek-strip teaser lines). Refer to the repo and reuse the primitives from Part 2. Commit after each sub-step, push at the end, tag part05-done.

1. Ask, wait.
2. Build the deck exactly per B3: a scroll container with CSS scroll-snap (recommended: a 100dvh container with `scroll-snap-type: y mandatory`; every section `calc(100dvh - var(--peek))` tall with `scroll-snap-align: start` and `scroll-snap-stop: always`, so the next section's header bar shows as the peek; inner scroll regions or filmstrips where content overflows; `proximity` on the whole deck only as a last resort — snap type is a container property, do not try to mix it per section), IntersectionObserver-driven active section, 100dvh, peek strip (72 px mobile / 96 px desktop) with name + teaser that is clickable and draws upward near the bottom of the current section, hash sync without jumps, deep-link landing, document title suffix, inert inactive sections, keyboard paging (PageUp/PageDown/arrows), a "Skip to contact" link, and lazy mounting (active + neighbours only). Expose one hopTo(sectionId) function and a small useDeck() hook; every navigation in the site must go through hopTo.
3. Build the rail per B3/B5: desktop vertical rail with nodes and the packet that moves on hop, label "hop N of M · name"; mobile compact tappable rail; focusable and labelled for screen readers; a one-time keepalive pulse near the bottom of a section.
4. Build the nav: name/mark left; right side: a Search button (placeholder that will open the palette in Part 6), "Work" (hopTo products) and "Contact" (hopTo contact) links, theme toggle. Mobile: name + search button only, plus theme toggle in the palette later.
5. Create the section shells for all sections in the confirmed order (Hero, Products, Engineering projects, Achievements & talks, Featured in, About if A8, Contact) with real headings and real teasers, using the Section primitive; each shell's content area is a clearly marked placeholder for the later parts (no lorem ipsum — a single line like "Products arrive in Part 8").
6. Motion per B5: entrance animation on hop (transform/opacity, one easing, within duration scale), packet movement, all disabled under reduced motion; no smooth scroll under reduced motion.
7. Tests: Playwright — snapping from section to section by wheel/touch emulation, hash updates, deep link lands correctly, keyboard paging, rail click, peek click, reduced-motion mode has instant hops, axe zero serious. Vitest — the deck state logic.
8. Run npm run screens for / at each section (add a way to screenshot a given section) at 390/768/1440 in both themes, view them, critique against the skill and B13, fix, and record in PROGRESS.md.
9. Update docs, commit, push, tag part05-done, report — and ask me to test the deck on a real phone (iOS Safari and/or Android Chrome) and report what I feel.
```

How to test Part 5:
- On desktop: scrolling moves one section at a time; the next section peeks at the bottom with its name and teaser; clicking the peek strip or a rail node hops; the URL hash updates; reloading `/#contact` lands on Contact; PageDown/PageUp work; Tab never lands in an inactive section.
- On a real phone: swipe moves one section at a time and never traps you; the peek is visible; nothing overflows horizontally; the tagline area isn't cut by browser chrome.
- With reduced motion enabled in OS settings: hops are instant, no entrance animations.
- Theme toggle works and persists.
- Screenshots reviewed; CI green.

### Part 6 — Command palette

Goal: `Ctrl/⌘K` and the Search button open a palette that can jump anywhere and run actions.

Prompt 6:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B6, B5, B12 — and Part 6 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part05-done exists. This is Part 6: the command palette. Use the frontend-design skill (/frontend-design) — the palette must be styled from the tokens and must not look like a stock component library palette. Do not assume — ask first in one batch (confirm the groups, the "ping" easter egg wording, and whether "/" should also open it). Refer to the repo: navigation must go through hopTo from Part 5. Commit after each sub-step, push at the end, tag part06-done.

1. Ask, wait.
2. Implement the palette with cmdk per B6: shortcut Ctrl/⌘K (and "/" if agreed, never while typing in a field), the nav Search button on all sizes, groups (Sections; Products; Engineering; Achievements & talks; Links; Actions), fuzzy search, keyboard control, focus trap and return, screen-reader announcements, close on select, "routing to <section>…" micro-line when a section is selected, hopTo for sections and router navigation for detail pages, Copy email with a "Copied" toast, Toggle theme, Download CV, and the "ping" easter egg (prints a mock ping reply inside the palette; keep it small).
3. Item lists come from the data layer (Part 4) so they update with content; keep the client bundle small — load the palette lazily on first open or on shortcut.
4. Mobile: full-height sheet, large hit targets, the software keyboard must not hide results.
5. Tests: Playwright — opens with the shortcut and the button, search finds a product and a section, selecting a section hops (hash changes), selecting a product navigates, Escape closes and returns focus, axe zero serious. Vitest — the item-building logic.
6. npm run screens with the palette open (add a way to open it in the screenshot script) at 390/768/1440 both themes; view, critique, fix, record.
7. Update docs, commit, push, tag part06-done, report.
```

How to test Part 6:
- Press Ctrl/⌘K anywhere → palette opens; type "eng" → Engineering projects appears; Enter → the deck hops there and the hash changes; Escape returns focus to where you were.
- Tap the Search button on your phone → full-height sheet; results stay visible above the keyboard.
- "Copy email" copies and shows "Copied"; "Toggle theme" works; "ping" prints its reply.
- The palette uses your fonts and colours; nothing looks like a stock library popup.
- CI green.

### Part 7 — Hero: the routing topology, tagline, quote (approval gate inside)

Goal: the one bold thing on the site, done precisely, plus the hero copy and composition — desktop and mobile.

Prompt 7:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B1, B4, B5, B12, B13 — and Part 7 in Section D), docs/DESIGN.md (the signature description), docs/DECISIONS.md, docs/PROGRESS.md. Confirm part06-done exists. This is Part 7: the hero — routing topology, tagline, quote, buttons. Use the frontend-design skill (/frontend-design) throughout; the skill's "hero is a thesis" and "spend boldness once" sections are the brief. Do not assume — ask first in one batch (confirm A2 eyebrow, A3 tagline, A4 quote + attribution, A27 availability, hero button labels; the exact values live in site_settings — confirm they are seeded). Refer to the repo: reuse tokens, primitives, hopTo, the deck's Hero shell. Commit after each sub-step, push at the end, tag part07-done.

1. Ask, wait.
2. DESIGN PASS FIRST, NO CODE: in docs/DESIGN.md add a "Hero" subsection: the exact desktop composition (per B4's wireframe, adapted to the tokens), the mobile stacking order, the topology's visual spec (node/edge geometry, stroke weights, packet appearance, colours, contrast relative to the tagline), the load sequence choreography (what appears in what order, total under ~1.2 s, respecting reduced motion), pointer-proximity behaviour, click-to-route behaviour, and the SSR static placeholder. Critique it against the skill and B13. Present it to me and STOP until I approve.
3. Build the topology module (SVG or small canvas + requestAnimationFrame; no physics library; lazy-loaded after first paint; SSR static SVG placeholder of the same layout): nodes = sections + "you", edges in deck order plus a few cross-links, two or three continuous packets, gentle spring displacement on pointer proximity, hover label, click/tap → packet travels from "you" to the node (<= 600 ms) then hopTo(section). Pause when off-screen or the tab is hidden. Mobile: reduced height, static layout, one packet. Reduced motion: static SVG, still tappable. Nodes are real buttons with accessible names ("Route to Products").
4. Build the hero content from site_settings: nav (already exists), eyebrow with proof, tagline in the display face (sentence case), the two buttons via hopTo, the quote with attribution in the mono/utility face, the availability line. Enforce the reading order and the "topology quieter than tagline" rule. On mobile the tagline must be fully visible above the fold on a 390x844 viewport.
5. Load sequence per the approved design pass; everything under reduced motion appears instantly.
6. Tests: Playwright — hero renders SSR placeholder before hydration (no blank), clicking a topology node hops, keyboard activation of a node hops, reduced-motion renders static, mobile viewport shows the full tagline above the fold, axe zero serious. Vitest — the topology layout math (node positions, edge list) and the packet path interpolation.
7. Measure: report the gzipped size of the topology module and the home page JS total against B12's budget; if over, reduce.
8. npm run screens for the hero at 390/768/1440 both themes (and once mid-load if you can), view, critique against the skill and B13, run the "remove one accessory" pass, record what you removed.
9. Update docs, commit, push, tag part07-done, report — and ask me to look at it on my phone.
```

How to test Part 7:
- Desktop: the topology sits mid-top-right, bleeds off the right edge, has no card border; it moves gently near the pointer; clicking a node visibly sends a packet and then hops; the tagline is the loudest element; the quote is small with a real attribution.
- Mobile: order is nav → eyebrow → tagline → buttons → topology → quote; the whole tagline is visible without scrolling; tapping a node hops; the page doesn't get hot or janky.
- Reduced motion: static topology, still clickable; no load animation.
- Reload with cache disabled: something designed is visible immediately (no blank hero).
- The tagline text and quote come from `site_settings` (change them in Studio, revalidate, they change).
- CI green.

### Part 8 — Products section and case-study pages

Prompt 8:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B2 item 2, B5, B10, B11, B12 — and Part 8 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part07-done exists. This is Part 8: Products section and case-study pages. Use the frontend-design skill (/frontend-design) for the cards, the detail page layout and every state. Do not assume — ask first in one batch (which products have live URLs to ping, which have videos, how many cards to show in the deck before "All products →"). Refer to the repo: reuse Section shell, Card, Tag, tokens, hopTo, data layer. Commit after each sub-step, push at the end, tag part08-done.

1. Ask, wait.
2. Deck section: intro line; product cards from getProducts (cover, title, one-line summary, stack tags, live-status line, links); desktop small grid, mobile horizontal snap filmstrip inside the section (must not fight the vertical deck — test it); "All products →" to /products if needed. Empty state per B10.
3. Live status: GET /api/status?slug=… pings status_check_url with a ~3 s timeout, cached ~60 s, returns { ok, ms }; the card shows an LED that settles to "live · 84 ms" or the "Endpoint unreachable" empty state; pinged once per view, not continuously.
4. Case-study page /products/[slug]: problem, what I built, role, stack, outcome/metrics, what I learned, gallery/video (click-to-load), live link, repo, "Copy link", previous/next product; static generation from the data layer with ISR; notFound() for unknown slugs; a shared-element transition from card to page (View Transitions API where supported, fade fallback). Markdown body rendered with a small, safe renderer, styled from tokens (a prose scale in DESIGN.md).
5. /products index page: all products, same cards.
6. Tests: Playwright — cards render from real data, filmstrip scrolls on mobile without breaking the deck, status endpoint returns the right shape, detail page renders and Copy link works, unknown slug 404s, axe zero serious. Vitest — status route logic (timeouts, caching) with mocks.
7. npm run screens for the section and one detail page at 390/768/1440 both themes; view; critique against the skill and B13; "remove one accessory"; record.
8. Update docs, commit, push, tag part08-done, report.
```

How to test Part 8:
- The Products stop shows your real products; the LED settles to "live · N ms" for products with a live URL; a product with a bad URL shows the unreachable state without breaking the layout.
- Mobile: the filmstrip swipes horizontally; swiping vertically still moves the deck.
- Opening a product animates into the case-study page (or fades in browsers without View Transitions); the page reads as a case study, not a card dump; back button returns to the deck at Products.
- `/products/does-not-exist` shows the temporary 404 (the custom one arrives in Part 14).
- CI green; screenshots reviewed.

### Part 9 — Engineering projects, instruments and detail pages

Prompt 9:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B2 item 3, B5, B10, B11, B12 — and Part 9 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part08-done exists. This is Part 9: engineering projects, interactive instruments and detail pages. Use the frontend-design skill (/frontend-design); this section should feel like precise instrumentation, not decoration. Do not assume — ask first in one batch: which projects exist, which have diagrams (SVG or to be redrawn from images), which have data suitable for an instrument (BER-vs-SNR data or a modulation to model, a topology with configs, a packet capture exported to JSON, a link budget), which have reports/PDFs. Only build instruments for real projects. Refer to the repo: reuse everything from Part 8 (cards, detail layout, prose scale). Commit after each sub-step, push at the end, tag part09-done.

1. Ask, wait.
2. Deck section: same card pattern as Products, plus the "concepts applied" line and tools; filter chip by type (lab | capstone | course | personal) if there are enough projects; mobile filmstrip.
3. Detail page /engineering/[slug]: overview, concepts applied, tools, method, results, diagrams that draw themselves in on entry (SVG stroke animation, pre-drawn under reduced motion), an oscilloscope-sweep divider (single, subtle), report/PDF link, repo, gallery, prev/next, Copy link.
4. Instrument registry: a component map keyed by engineering_projects.interactive_widget, each reading its data from engineering_projects.data. Build only the ones agreed in step 1, from this menu: (a) BER vs SNR — slider changes Eb/N0, curve redraws live from the project's data or the closed-form model agreed with me (e.g. BPSK: BER = 0.5 * erfc(sqrt(Eb/N0)) in linear Eb/N0), axes labelled, log scale on BER; (b) clickable topology — nodes reveal their config/notes; (c) packet capture viewer — expandable rows from the JSON, protocol layers expandable; (d) link-budget calculator — inputs with units, result updates live, sensible ranges. Every instrument: keyboard-operable, labelled, moves only when the user moves it, works with touch, has a static reduced-motion state and a designed empty state.
5. Tests: Playwright — section renders, detail page renders, each built instrument responds to input and is keyboard operable, diagrams present under reduced motion, axe zero serious. Vitest — the instrument math (BER model, link budget) with known values.
6. npm run screens for the section, a detail page and each instrument at 390/768/1440 both themes; view; critique against the skill and B13; "remove one accessory"; record.
7. Update docs, commit, push, tag part09-done, report.
```

How to test Part 9:
- Your real engineering projects show with concepts and tools; the detail page reads like a lab write-up; the diagram draws in once (and is simply present under reduced motion).
- Each built instrument responds instantly to the slider/clicks/inputs, on touch too, and the numbers match what you expect from your coursework (spot-check one value).
- Report links open the PDF from Storage.
- CI green; screenshots reviewed.

### Part 10 — Achievements and talks

Prompt 10:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B2 item 4, B5, B10, B11, B12 — and Part 10 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part09-done exists. This is Part 10: achievements and talks. Use the frontend-design skill (/frontend-design). Do not assume — ask first in one batch: the full list with dates/cities/results, which talks have video (URLs) and slides, whether the optional map of event cities (A25) is wanted, and whether the timeline defaults to newest first. Refer to the repo. Commit after each sub-step, push at the end, tag part10-done.

1. Ask, wait.
2. Deck section: the traceroute-styled timeline per B2/B5 — each entry is a hop with number, year, event, city, role, result, links; entries "print" as they enter the viewport (number → year → event → result), instant under reduced motion; filter chips (hackathon / competition / talk / award / program) with FLIP re-layout and the empty state "No hops match. Clear filters."; the section scrolls internally if it exceeds the viewport (must not fight the deck); newest first unless told otherwise.
3. Talks: entries with video use a click-to-load facade (thumbnail, play button that pulses once, then the embed loads on tap; never autoplay), plus slides link and an "invite me to speak" line that hops to Contact.
4. Optional map of event cities if agreed (static, lightweight; no heavy map library without asking).
5. Tests: Playwright — timeline renders real data, filters work and update the URL query (so a filtered view can be shared), empty state appears, video facade loads the embed only on click, keyboard operation of chips and entries, axe zero serious. Vitest — filter and sort logic.
6. npm run screens for the section (unfiltered and filtered) at 390/768/1440 both themes; view; critique against the skill and B13; "remove one accessory"; record.
7. Update docs, commit, push, tag part10-done, report.
```

How to test Part 10:
- All your achievements appear as hops with correct dates, cities and results; filtering to "talk" leaves only talks and updates the URL; clearing works; the empty state appears for a filter with nothing.
- A talk's video loads only when tapped; slides link works; "invite me to speak" hops to Contact.
- Long lists scroll inside the section on a phone without breaking the deck.
- CI green; screenshots reviewed.

### Part 11 — Featured in (logos only)

Prompt 11:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B8, B5, B12 — and Part 11 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part10-done exists. This is Part 11: Featured in — logos only. Use the frontend-design skill (/frontend-design). Do not assume — ask first in one batch: confirm the logo list (A21), that SVGs are uploaded to the logos bucket, the coverage URL for each, the header wording, and whether to keep the one-time link draw-in or have no motion at all. Refer to the repo. Commit after each sub-step, push at the end, tag part11-done.

1. Ask, wait.
2. Build per B8: a grid (or gentle constellation around a small "you" node) of monochrome SVG logos normalised to one visual height, full colour on hover/tap, each linking to its coverage in a new tab with rel="noopener noreferrer"; header only; no captions, no quotes, no counts, no marquee. If agreed, the single one-time link draw-in on first entry; nothing under reduced motion. Group by category only if there are more than about a dozen.
3. Logos come from getFeaturedIn; missing or broken images degrade to the name in the utility face (a designed fallback, never a broken-image icon).
4. Tests: Playwright — logos render from data, every link has target and rel, hover/tap colour change, reduced motion has no animation, axe zero serious (accessible names on each link).
5. npm run screens at 390/768/1440 both themes; view; critique against the skill and B13 (this section is the easiest to over-decorate — cut anything that isn't the logos); record.
6. Update docs, commit, push, tag part11-done, report.
```

How to test Part 11:
- The section shows only logos and a header; hovering/tapping colours a logo; clicking opens the coverage in a new tab; nothing scrolls sideways on its own; nothing moves under reduced motion.
- Logos are the same visual height and evenly spaced on 390 px too.
- CI green; screenshots reviewed.

### Part 12 — About: skills, certifications, experience, education, CV (if A8 = yes)

Prompt 12:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B2 item 6, B5, B11, B12 — and Part 12 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part11-done exists. This is Part 12: the About section (bio, currently, skills, certifications, experience/education, CV). Use the frontend-design skill (/frontend-design); this is deliberately the quietest section. Do not assume — ask first in one batch: bio and "currently" text, which sub-blocks to include, the skills lists (software/product; telecom/network) and which project slugs each skill links to, certifications, experience/education entries, whether the CV PDF is uploaded to the documents bucket. Refer to the repo. Commit after each sub-step, push at the end, tag part12-done.

1. Ask, wait.
2. Build per B2 item 6: short bio; "currently" line; skills as tags in two groups — tapping a tag filters the Products and Engineering cards live (FLIP re-layout, URL query so it's shareable, clear button, empty state) — no bars, no radar; certifications with issuer, date, credential link, logo; experience and education as a compact timeline; CV download button (Storage URL; button says "Download CV" and shows the file size).
3. Motion: clean entrance only; the only interaction motion is the filter re-layout; instant under reduced motion.
4. Tests: Playwright — content renders from data, tapping a skill filters projects and updates the URL, clear works, CV link resolves (HEAD 200), keyboard operable, axe zero serious. Vitest — the skill→project filter logic.
5. npm run screens at 390/768/1440 both themes; view; critique against the skill and B13; "remove one accessory"; record.
6. Update docs, commit, push, tag part12-done, report.
```

How to test Part 12:
- Bio, currently, skills, certifications, experience/education and CV appear with your real content; tapping a skill leaves only the projects it links to and updates the URL; the CV downloads.
- The section feels calm next to the others; nothing decorative.
- CI green; screenshots reviewed.

### Part 13 — Contact: form, handshake, slider, footer and route recap

Prompt 13:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B7, B9, B10, B11, B12 — and Part 13 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part12-done exists. This is Part 13: Contact — form, handshake animation, the "Slide into my LinkedIn / DMs" slider, footer and (if A9) the route recap. Use the frontend-design skill (/frontend-design); this is the finale and the third orchestrated moment. Do not assume — ask first in one batch: A15 email and forwarding address, A16 Resend (API key in .env.local as RESEND_API_KEY, sender/receiver addresses, whether the sending domain is verified or the onboarding sender is used for now), A17 Turnstile keys (NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY in .env.local), A20 slider targets, A28 time zone, A29 booking link, A9 route recap, the contact copy line, footer colophon wording, and A18 for the privacy note. Refer to the repo. Commit after each sub-step, push at the end, tag part13-done. Never ask me to paste keys into chat. I have never used Resend or Turnstile: before asking for any keys, walk me through creating the Resend account, API key and sender, and the Cloudflare Turnstile site (with my domain and localhost for development) and its keys, step by step, one screen at a time; then I put the values in .env.local and Vercel myself.

1. Ask, wait.
2. Form per B9: name, email, message; honeypot; Turnstile widget (themed from tokens); inline validation; "Send message" → "Sending…" → "Message sent" with the SYN / SYN-ACK / ACK handshake animation (three labelled arrows between two nodes, one easing, ~1 s total, instant under reduced motion) and thank-you line; failure copy exactly per B9 with a mailto fallback. Server action or route handler: zod validation, Turnstile verification, throttle by hashed IP (count in contact_messages over the last 10 minutes), insert with the server-only client, Resend notification email, typed result. Progressive enhancement: the form still posts without JavaScript where feasible.
3. Also: "Copy email" → "Copied" toast; local time line from A28 and the availability line from site_settings; social links; booking link if any; CV download; email revealed on click, not in plain HTML.
4. Slider per B7 exactly (drag threshold, snap, spring back, success flip "Opening LinkedIn…", new tab with rel, targets per A20 — currently LinkedIn only, touch-action none, keyboard Enter/Space, role button, 44 px targets, one-time nudge per session, no nudge under reduced motion).
5. Footer: route recap if A9 (small copy of the hero topology, visited sections lit, "Destination reached."), colophon (no jokes), privacy note, © line.
6. Tests: Vitest — server validation, throttle logic, Turnstile verification (mocked fetch), email payload; Playwright — validation messages, honeypot rejection, success state with Turnstile in test mode or mocked, failure state, Copy email, slider drag past threshold opens the target (intercept the new tab), early release springs back, keyboard activation, route recap lights visited sections, axe zero serious. Then one manual end-to-end send against the real Supabase project and Resend, and confirm the row appears in contact_messages and the email arrives.
7. npm run screens for the section, the success state, and the footer at 390/768/1440 both themes; view; critique against the skill and B13; "remove one accessory"; record.
8. Update docs (.env.example, BACKEND.md for the contact flow), commit, push, tag part13-done, report.
```

How to test Part 13:
- Submit with an invalid email → specific inline error; submit a real message → "Sending…" then the handshake plays and "Message sent" shows; the row is in `contact_messages` in Studio; the notification email arrives at the forwarding address.
- Submit rapidly several times → throttled with a clear inline message.
- Drag the slider most of the way → it snaps, flips to "Opening LinkedIn…", and your profile opens in a new tab; release early → it springs back; keyboard Enter on the focused slider opens the target.
- On your phone: the drag is smooth and the page doesn't scroll while dragging the track.
- Copy email → "Copied"; the local time is right for your zone; the footer recap lights the sections you visited (if A9); the privacy note matches your analytics choice.
- CI green; screenshots reviewed.

### Part 14 — Error, empty, loading, offline and maintenance states

Prompt 14:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B10, B12, B13 — and Part 14 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part13-done exists. This is Part 14: the error, empty, loading, offline and maintenance states. Use the frontend-design skill (/frontend-design); these pages must be unmistakably the same site. Do not assume — ask first in one batch: the maintenance message and bypass method (secret cookie or query key), whether to show recently visited pages on the 404, and any copy changes to B10. Refer to the repo: reuse the hero topology module (static variants) for the broken-topology illustrations. Commit after each sub-step, push at the end, tag part14-done.

1. Ask, wait.
2. Custom 404 (src/app/not-found.tsx): "Route not found." with the small broken topology (packet stopped at a dead node, dashed link beyond), "Back to home", "Search the site" (opens the palette), optional recent pages. Custom 500 (src/app/error.tsx and src/app/global-error.tsx): "Packet dropped." — mostly static, minimal JavaScript, "Try again" (reset) and "Home". Both full-height, mobile-friendly, tokens only, no apologies, a way out always visible.
3. Offline: a listener on online/offline events shows the "No signal." state (as an overlay or page, per the skill), retries automatically, confirms "Signal restored" before returning; a minimal service worker only if needed to serve the offline page (ask before adding one).
4. Maintenance mode: MAINTENANCE_MODE env flag handled in middleware, rewriting to /maintenance for everyone except the bypass; the message from site_settings.maintenance_message; a designed page.
5. Empty and loading states everywhere per B10: audit every list, filter, form and async block built so far and give each a designed empty state and a token-coloured skeleton or the static topology placeholder; no spinners in the middle of nothing.
6. Tests: Playwright — visit an unknown URL → custom 404 with working buttons; a dev-only route that throws → custom error page with working Try again; simulate offline (context.setOffline) → No signal appears and clears; MAINTENANCE_MODE on → maintenance page for a normal visitor and bypass works; filters' empty states; axe zero serious on all of them.
7. npm run screens for 404, error, offline, maintenance at 390/768/1440 both themes; view; critique against the skill and B13; record.
8. Update docs (.env.example gets MAINTENANCE_MODE and the bypass variable), commit, push, tag part14-done, report.
```

How to test Part 14:
- Visit `/this-does-not-exist` → "Route not found." page in your fonts and colours; both buttons work; the palette opens from it.
- Trigger the dev error route → "Packet dropped."; Try again recovers.
- Turn off Wi-Fi while on the site → "No signal."; turn it on → "Signal restored" then the site returns.
- Set `MAINTENANCE_MODE=true` locally → the maintenance page shows; your bypass gets you in.
- Filter to nothing in Achievements → "No hops match. Clear filters."
- CI green; screenshots reviewed.

### Part 15 — SEO, sharing images, analytics, colophon, easter eggs

Prompt 15:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B12 — and Part 15 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part14-done exists. This is Part 15: SEO, Open Graph images, sitemap/robots, structured data, analytics, favicon/manifest, colophon and easter eggs. Use the frontend-design skill (/frontend-design) for the OG image templates and any visible UI (they must look like the site, not a generic card). Do not assume — ask first in one batch: A10 domain for canonical URLs (or a placeholder until launch), A18 analytics choice and its site ID (put it in env), the console easter egg wording, and whether the site should be indexable before launch (usually noindex until launch day). Refer to the repo. Commit after each sub-step, push at the end, tag part15-done.

1. Ask, wait. For A18 (Umami): I have not used it before — walk me through creating the account and adding the site, step by step, and tell me which value to put in .env.local; if Umami's free tier is not available at that time, propose the simplest privacy-friendly alternative and wait for my choice.
2. Metadata: per-page titles and descriptions from content, canonical URLs, robots rules (noindex until launch if agreed), Open Graph and Twitter tags. Generate OG images with next/og for the home page and every product/engineering detail page (opengraph-image.tsx per route), designed from the tokens with the routing motif; check they render text correctly with the chosen fonts.
3. sitemap.xml and robots.txt from the data layer; JSON-LD Person and WebSite (and CreativeWork on detail pages if it fits) validated with a structured-data testing tool.
4. Favicon set and web manifest from the mark (A1); theme-color per theme.
5. Analytics per A18, loaded only in production, no cookies if that's true, and the footer privacy note kept accurate. If A18 is "none", skip and remove the note.
6. Small proofs of craft per B12: humans.txt, the colophon (already in the footer — verify it), a console easter egg (a short styled console message for developers, in the site's voice, no more), a "view source" hint if it fits, "Copy link" verified on all detail pages.
7. Tests: Playwright — metadata present on home and detail pages, OG image routes return image/png, sitemap and robots respond, JSON-LD parses, analytics script absent in dev; a script that fetches every route in the sitemap and checks for 200.
8. Update docs, commit, push, tag part15-done, report — including instructions for me to run LinkedIn's Post Inspector against a preview URL once the site is public.
```

How to test Part 15:
- View source on the home page and a project page: title, description, canonical, OG/Twitter tags, JSON-LD present; `/opengraph-image` returns a designed image; `/sitemap.xml` and `/robots.txt` load.
- Paste a preview link into LinkedIn's Post Inspector (once indexable/public): the card shows your OG image and title.
- Open the console: the easter egg message appears once, nothing else (no errors).
- Analytics dashboard shows visits from production only.
- CI green.

### Part 16 — Performance, accessibility, print and cross-device QA

Prompt 16:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section B — especially B12, B13 — and Part 16 in Section D), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. Confirm part15-done exists. This is Part 16: performance, accessibility, print stylesheet and cross-device QA. Use the frontend-design skill (/frontend-design) for any visual fix. Do not assume — ask first in one batch: which real devices I can test on, and whether any budget in B12 should change. Refer to the repo. Commit after each sub-step, push at the end, tag part16-done.

1. Ask, wait.
2. Performance: run Lighthouse (mobile, throttled) on /, a product page, an engineering page, 404; run a bundle analysis; fix until B12 budgets are met (LCP < 2.0 s, CLS < 0.05, home JS <= ~200 KB gz, Lighthouse >= 90 in all four categories). Typical work: lazy-load the topology and instruments, subset fonts, next/image sizes, defer the palette, trim dependencies. Add a Lighthouse CI job to GitHub Actions with these budgets as assertions.
3. Accessibility: run axe on every route in both themes; do a full keyboard-only walk-through of the deck, rail, palette, hero nodes, filters, instruments, form and slider; check screen-reader names on everything interactive; verify contrast in both themes; verify reduced motion across the whole site; fix everything serious and record known minor items.
4. Print stylesheet: the deck prints linearly — all sections, no rail, no palette, no slider, links visible as text; a product page prints as a clean case study. Verify with "Save as PDF".
5. Cross-device QA matrix (record results in docs/QA.md): iOS Safari (100dvh, scroll-snap, rubber-banding, address-bar changes), Android Chrome, desktop Chrome/Firefox/Safari, a 13-inch laptop at 100 % zoom, and 200 % browser zoom. Fix regressions; add Playwright projects for mobile Safari/Chrome emulation to CI.
6. Security headers (CSP that still allows Turnstile, analytics and video embeds; frame-ancestors; referrer-policy; permissions-policy) — verify with a headers checker.
7. Update docs, commit, push, tag part16-done, report with the before/after numbers.
```

How to test Part 16:
- Lighthouse mobile on `/` and one detail page: ≥ 90 in Performance, Accessibility, Best Practices, SEO; the CI Lighthouse job passes.
- Keyboard-only: you can reach and operate everything without a mouse; focus is always visible.
- Reduced motion on: nothing animates anywhere.
- Print preview of `/`: all sections readable in order.
- On your real phone(s): no jank in the hero, the deck snaps cleanly, address-bar show/hide doesn't break section heights, the slider drags smoothly.
- CI green.

### Part 17 — Launch

Prompt 17:

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Section F launch checklist, Section B, and Part 17 in Section D), docs/DECISIONS.md, docs/PROGRESS.md, docs/QA.md. Confirm part16-done exists. This is Part 17: launch. Do not assume — ask first in one batch: A10 domain and registrar, confirmation that all real content is in, that the tagline/availability are current, that A18/A16/A17 production keys are set in Vercel by me, and the launch date. Refer to the repo. Commit after each sub-step, push at the end, tag v1.0.0. You must not log in to my Vercel, registrar or Supabase — guide me and verify results. The frontend-design skill (/frontend-design) applies to any visual fix made during verification.

1. Ask, wait.
2. Guide me through: adding the domain in Vercel and the DNS records at my registrar; setting production env vars (list them from .env.example); switching robots/metadata from noindex to indexable and setting the canonical domain; turning MAINTENANCE_MODE off (or on until the moment of launch, my choice).
3. Production verification after deploy: run the Section F checklist end to end against the live domain (forms, slider, palette, deck on a phone, error pages, OG previews via LinkedIn Post Inspector, sitemap submitted in Google Search Console, analytics receiving, HTTPS and headers). Fix anything found; redeploy.
4. Write docs/RUNBOOK.md: how to add or edit content in Supabase Studio, upload assets, change the tagline/availability, add a new project or achievement (seed JSON + script or Studio), regenerate types after a schema change, rotate keys, roll back a deploy, toggle maintenance mode, and where analytics/logs live.
5. Tag v1.0.0, push, and report — then suggest a soft-launch plan: share with a few friends first, collect feedback for a few days, fix, then announce.
```

How to test Part 17: run Section F below against the live domain, on desktop and on your phone.

### Part 18 — Optional extras (each is its own prompt, only if A25 says yes)

Use the new-part template in Section E with one of these briefs; each must follow the same rules and the same design tokens.

- Blog/notes at `/notes`: MDX or markdown from Supabase, technical write-ups of labs and hackathon retrospectives, RSS feed, per-post OG image, code blocks styled from tokens; listed in the palette; "Notes" stop added to the deck only if you want it there.
- Testimonials: `testimonials` table, short quotes from professors, judges, mentors; shown in About or Achievements; no carousels that autoplay.
- Photo gallery / journey: images from the `media` bucket, lazy-loaded, lightbox with keyboard support, captions optional.
- Map of event cities: static, lightweight rendering of the achievements' cities, no heavy map library.
- Booking embed: Cal.com/Calendly in Contact if A29 was deferred.

---

## Section E — Utility prompts

Resume prompt (start of every new session):

```text
New session. Read CLAUDE.md, docs/BUILD_PLAN.md (Sections B and C, and the current part in Section D), docs/DECISIONS.md, docs/PROGRESS.md and docs/DESIGN.md if it exists. Check `git status`, `git log --oneline -15` and `git tag`. Tell me exactly where we are: the last completed part, anything uncommitted, known gaps, and what the next step is. Do not start any work until I confirm. Remember: use the frontend-design skill for all UI work, never assume — ask, refer to the repo for context, commit and push every step, no secrets in the repo, and the site must not look vibe-coded.
```

Fix-loop prompt (when a "How to test" item fails):

```text
Part NN test failure. What I did: <steps>. What I expected: <expected>. What happened: <actual, with device/browser and any console or terminal output>. Reproduce it first (write a failing test if it is testable), find the root cause — do not patch symptoms — fix it, make the test pass, re-run lint/typecheck/test/build and the part's Playwright tests, re-run npm run screens if UI changed and check against the frontend-design skill and B13, then commit ("fix: …"), push, and tell me what the cause was. If the fix needs a decision from me, ask before changing behaviour. Never assume; refer to the repo.
```

Anti-vibe design review prompt (run after Part 13 and again before launch):

```text
Full design audit. Read the frontend-design skill (/frontend-design), docs/DESIGN.md and docs/BUILD_PLAN.md B13. Run npm run screens for every section of the deck, every detail page type, the palette open, the 404/error/offline/maintenance pages, at 390/768/1440 in both themes. Look at every screenshot and audit against the skill: hero-as-thesis, one signature and quiet everything else, typography as personality, structure that encodes information, motion that means something, copy as design material, and the three AI-default looks plus the terminal-green trap. List every finding by severity with a proposed change. Do NOT change anything yet — present the list, wait for my decisions, then apply the approved changes, run the "remove one accessory" pass on the whole site, record what was removed in docs/PROGRESS.md, commit and push. Never assume; refer to the repo.
```

Add-content prompt (after launch):

```text
New content to add: <paste details — a product, engineering project, achievement, talk, certification, experience entry, or logo>. Read CLAUDE.md, docs/RUNBOOK.md and docs/BACKEND.md. Structure it into the seed JSON following the schema (ask me for any missing field, do not invent or assume), tell me which asset files to drop where, run the upload and seed scripts, trigger revalidation, and confirm it appears on the site. If the schema needs to change, stop and propose a migration first. If any UI has to change to fit the new content, use the frontend-design skill (/frontend-design) and refer to docs/DESIGN.md. Commit and push.
```

New-part template (for Part 18 extras or anything new):

```text
Read CLAUDE.md, docs/BUILD_PLAN.md (Sections B and C), docs/DESIGN.md, docs/DECISIONS.md, docs/PROGRESS.md. This is a new part: <name>. Brief: <what it should do, where it lives, what it must not do>. Use the frontend-design skill (/frontend-design) for all UI. Do not assume — ask first in one batch. Refer to the repo and reuse existing tokens, primitives, hopTo and data layer. Plan the sub-steps first and show me before coding. Then build, test (Vitest + Playwright + axe), npm run screens and critique against B13, update docs, commit after each sub-step, push, tag <name>-done, report.
```

Reset line (if Claude Code drifts from the rules):

```text
Stop. Re-read CLAUDE.md and docs/BUILD_PLAN.md Section C. You assumed instead of asking / did not use the frontend-design skill / left work uncommitted / introduced non-token styles. Undo or fix that first, then continue only after confirming with me.
```

---

## Section F — Launch checklist and testing matrix

Run against the production domain, on desktop and on a real phone.

Content and copy
- All products, engineering projects, achievements, talks, logos, skills, certifications, experience and the CV are real, current and correctly linked; no placeholder text anywhere (search the built site for "TBD", "lorem", "placeholder").
- Tagline, eyebrow, quote (with attribution), availability and time zone are correct and come from `site_settings`.
- Every external link opens the right place; every internal link resolves; every image has meaningful alt text.

Deck and interactions
- One section at a time; peek strip visible and clickable; hash deep links land correctly; keyboard paging works; skip link works.
- Hero topology: interactive on desktop, static-but-tappable on mobile, static under reduced motion; tagline fully visible above the fold on a phone.
- Command palette: shortcut and button open it; search finds sections and projects; actions work; mobile sheet usable with the keyboard open.
- Products: live status shows; case-study pages render; shared-element transition or fade works; Copy link works.
- Engineering: diagrams draw in (or are present under reduced motion); every instrument responds to input and keyboard.
- Achievements: filters work and update the URL; video loads only on tap; "invite me to speak" hops to Contact.
- Featured in: logos only, colour on hover/tap, links open coverage.
- About: skill tags filter projects; CV downloads.
- Contact: form validates, sends, shows the handshake and "Message sent"; the row appears in `contact_messages`; the notification email arrives; throttle works; slider opens LinkedIn (and any other A20 target) and springs back on early release; Copy email works; footer recap lights the visited path (if enabled).

States
- Custom 404, error, offline and maintenance pages verified live; empty states verified.

Quality
- Lighthouse mobile ≥ 90 across the four categories on `/` and one detail page; CI Lighthouse job green.
- Zero serious axe violations; keyboard-only walk-through passes; contrast verified in both themes; reduced motion verified.
- No console errors or warnings on any page.
- iOS Safari and Android Chrome checked on real devices; desktop Chrome, Firefox and Safari checked; 200 % zoom usable.
- Print preview of `/` and one project page readable.

Backend and security
- RLS enabled on every table (re-check in Studio); anon cannot write anywhere; service key only in Vercel server env; `git grep` finds no keys; `.env.example` complete.
- Turnstile live keys in production; honeypot present; throttle active.
- Security headers present; HTTPS enforced; canonical domain redirects (www ↔ apex as chosen).

SEO and sharing
- robots allows indexing; sitemap submitted in Google Search Console; canonical URLs correct; OG images render in LinkedIn's Post Inspector for the home page and a project page; JSON-LD validates.
- Analytics receiving production traffic; privacy note accurate.

Repository and docs
- `main` is green in CI; tag `v1.0.0` exists; `docs/PROGRESS.md`, `docs/DECISIONS.md`, `docs/DESIGN.md`, `docs/BACKEND.md`, `docs/QA.md`, `docs/RUNBOOK.md` are current.

---

## Section G — Where planning ended (open items to answer in Section A)

Answered during planning: the four core sections; contact; mobile-first; featured-in as logos only (not a marquee, no captions); command palette; the desktop hero composition (interactive element mid-top-right, tagline, famous quote); the routing topology as the hero signature; the "slide into my LinkedIn / DMs" slider; sections as one-at-a-time stops with a peek of the next; custom 404 and custom pages for all other errors; Supabase as the backend; a private repo with every step committed; Claude Code never assuming and always asking; the site must not look vibe-coded; the frontend-design skill for all UI.

Section A was answered on 18 August 2026 (see the table). Deliberately deferred, to be supplied when the part that needs them arrives: the content inventory (A22, needed at Part 4 — start collecting now), the featured-in logo list with SVGs and coverage URLs (A21, Part 11), the optional extras (A25, Part 18), and any specific aesthetic wishes (A23, asked in Part 2 if needed). To confirm in their parts: the FM monogram (Part 2), the hero button labels and the quote's displayed attribution (Part 7).
