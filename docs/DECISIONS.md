# Decisions

Every decision that shapes this site, with the date it was made. Decisions taken in chat are appended
to the log at the bottom; the table below is the state of `docs/BUILD_PLAN.md` Section A.

Rule: nothing gets guessed. If a decision is missing, the part that needs it stops and asks, and the
answer is recorded here before the work continues.

## Section A — decisions made in planning (18 August 2026)

| #   | Decision                                                                                        | Your answer                                                                                                                                                                                                                                                                                                         |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Your name as it should appear on the site                                                       | Fadi Muhammed. Mark: a “Fadi” mark is proposed for the favicon and a small nav mark — Claude Code designs it and shows it for approval in Part 2; the full name is used as the nav text.                                                                                                                            |
| A2  | Role line (the eyebrow above the tagline)                                                       | Telecommunications & network engineer · Tech builder · Freelancer                                                                                                                                                                                                                                                   |
| A3  | Hero tagline (exact text)                                                                       | Unemployed & jobless, but not lost.                                                                                                                                                                                                                                                                                 |
| A4  | Famous quote + attribution (verified)                                                           | “Big things have small beginnings.” — David, Prometheus (2012). Note: the line originates in Lawrence of Arabia (1962), spoken by Mr Dryden, and is quoted by David in Prometheus. Display attribution as “Prometheus (2012)” or “Lawrence of Arabia (1962), via Prometheus” — confirm the exact wording in Part 7. |
| A5  | Primary visitor                                                                                 | Recruiters/employers and collaborators/clients (both).                                                                                                                                                                                                                                                              |
| A6  | The single job of the site                                                                      | A mix of “look at what I built” and “hire me / work with me”. Proposed hero buttons: “See my work” (hops to Products) and “Work with me” (hops to Contact); confirm in Part 7.                                                                                                                                      |
| A7  | Section order on the home deck                                                                  | Default.                                                                                                                                                                                                                                                                                                            |
| A8  | Include the About block (skills, certifications, experience, education, CV)?                    | Yes (as recommended).                                                                                                                                                                                                                                                                                               |
| A9  | Footer "route you took" recap (mini topology lit with the visited path, "Destination reached")? | Yes (as recommended).                                                                                                                                                                                                                                                                                               |
| A10 | Domain name                                                                                     | fadimuhammed.work (owned).                                                                                                                                                                                                                                                                                          |
| A11 | GitHub username and repo name                                                                   | GitHub user Fadi-Muhammed (https://github.com/Fadi-Muhammed); repo name `portfolio` (private).                                                                                                                                                                                                                      |
| A12 | Frontend stack                                                                                  | As recommended: Next.js (App Router) + TypeScript + Tailwind CSS + Motion + cmdk.                                                                                                                                                                                                                                   |
| A13 | Hosting                                                                                         | As recommended: Vercel.                                                                                                                                                                                                                                                                                             |
| A14 | Supabase project                                                                                | Not created yet. Create it right before Part 3 — Prompt 3 walks you through it (project name, the region closest to your visitors, and exactly which values to copy into .env.local).                                                                                                                               |
| A15 | Contact email + where form messages should be forwarded                                         | work.fmuhammed@gmail.com for both (public contact address and forwarding address).                                                                                                                                                                                                                                  |
| A16 | Transactional email provider for form notifications                                             | As recommended: Resend. Never used before — Part 13 walks you through creating the account, the API key and the sender, step by step.                                                                                                                                                                               |
| A17 | Bot protection on the contact form                                                              | As recommended: Cloudflare Turnstile + honeypot. Never used before — Part 13 walks you through creating the Turnstile site and keys.                                                                                                                                                                                |
| A18 | Analytics                                                                                       | Umami (free tier, privacy-friendly, no cookie banner) — chosen because you had no preference; Part 15 walks you through creating the account and site. Alternative if it is simpler at the time: Vercel Web Analytics.                                                                                              |
| A19 | Social links                                                                                    | LinkedIn: https://www.linkedin.com/in/fadi-muhammed-524b75310 · GitHub: https://github.com/Fadi-Muhammed · Others: none for now (add later in site_settings).                                                                                                                                                       |
| A20 | Slider targets ("Slide into my LinkedIn / DMs")                                                 | LinkedIn only → a single slider (“Slide into my LinkedIn →”). A DM slider can be added later.                                                                                                                                                                                                                       |
| A21 | Featured-in logos                                                                               | To be provided later — Part 11 asks for the list, the SVGs and the coverage URLs before building.                                                                                                                                                                                                                   |
| A22 | Content inventory                                                                               | To be provided later — needed at Part 4 (start collecting rough lists now: products, engineering projects, achievements, talks, certifications, experience, education).                                                                                                                                             |
| A23 | Aesthetic constraints                                                                           | Let the design skill decide; Claude Code asks only if something specific is needed.                                                                                                                                                                                                                                 |
| A24 | Icon set                                                                                        | As recommended: Lucide.                                                                                                                                                                                                                                                                                             |
| A25 | Optional extras (blog/notes, testimonials, photo gallery, map of event cities)                  | Ask one by one when Part 18 comes.                                                                                                                                                                                                                                                                                  |
| A26 | Languages                                                                                       | English only.                                                                                                                                                                                                                                                                                                       |
| A27 | Availability line for the hero/contact                                                          | Open to freelance work and collaborations. (Alternatives: “Open to work, collaborations and freelance projects.” / “Open to collaborations, freelance and full-time work.”)                                                                                                                                         |
| A28 | Your time zone (for the "local time" line in Contact)                                           | Asia/Qatar                                                                                                                                                                                                                                                                                                          |
| A29 | Booking link (Calendly/Cal.com)                                                                 | None for now (skip).                                                                                                                                                                                                                                                                                                |
| A30 | Node version installed                                                                          | Unknown — Claude Code checks with `node --version` in Part 0 step 1; if it is missing or below 20, install the current LTS from nodejs.org and re-run Prompt 0.                                                                                                                                                     |

The "Recommendation / notes" column of the original table is not reproduced here; it stays in
`docs/BUILD_PLAN.md` Section A.

## Deliberately deferred

These are unanswered on purpose. The part that needs each one asks for it before building.

| #   | Decision                                                                                                       | Needed at                                    |
| --- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| A14 | Supabase project (ref, URL, keys)                                                                              | Part 3 — Prompt 3 walks through creating it  |
| A21 | Featured-in logo list, SVGs, coverage URLs                                                                     | Part 11                                      |
| A22 | Content inventory (products, engineering projects, achievements, talks, certifications, experience, education) | Part 4 — worth collecting now                |
| A23 | Specific aesthetic wishes                                                                                      | Part 2, only if something specific is needed |
| A25 | Optional extras (blog/notes, testimonials, photo gallery, map of event cities)                                 | Part 18, asked one by one                    |

To confirm in their own parts: the “Fadi” mark (Part 2); the hero button labels and the quote's
displayed attribution (Part 7).

## Log

### 18 August 2026 — Part 0

- **A30 resolved.** Node v22.18.0 is installed, above the required 20. git 2.53.0, npm 10.9.3,
  gh 2.89.0 authenticated as `Fadi-Muhammed` with `repo` and `workflow` scopes. No tooling action
  needed from the user.
- **Part 0 run in full, including the GitHub step.** Confirmed in chat: create the private repo and
  push as part of this part, rather than stopping after the local commit.
- **Repo name and visibility (A11) applied as decided:** `Fadi-Muhammed/portfolio`, private.
- **CLAUDE.md is a verbatim copy of Section C** of `docs/BUILD_PLAN.md`. No path adaptation was
  needed — the paths Section C names (`docs/BUILD_PLAN.md`, `.claude/skills/frontend-design/SKILL.md`,
  `docs/DECISIONS.md`, `docs/PROGRESS.md`, `docs/DESIGN.md`) are the paths this repo uses.

- **The design skill is the file in this repo, not the built-in one with the same name.** Confirmed in
  chat. `.claude/skills/frontend-design/SKILL.md` is the user's own uploaded file, moved unchanged from
  `frontend-design/SKILL.md` in Part 0 step 2. Claude Code also ships a built-in skill called
  `frontend-design`, so the name is ambiguous when invoked as a slash command. To remove the ambiguity,
  every UI part reads `.claude/skills/frontend-design/SKILL.md` from the repo path directly and follows
  that text. If the two ever disagree, the repo file wins.

### 28 August 2026 — before Part 1

- **CI runs on every push and every pull request.** Confirmed in chat after asking whether to narrow
  the GitHub Actions workflow to `main` only to conserve free-tier minutes on the private repo. The
  answer was to keep the full trigger — the minutes are affordable. So Part 1 step 6 is built as
  specced: install, lint, typecheck, test, build and Playwright/axe on `push` and `pull_request`,
  with dependency caching.
- **The design skill is discoverable.** The Part 0 known gap is closed. In this session the project
  skill at `.claude/skills/frontend-design/SKILL.md` is listed as `frontend-design`, next to the
  built-in one, which is listed under a plugin prefix. Their `description:` frontmatter is identical,
  so the listing alone does not disambiguate them; the standing rule above still holds — every UI part
  reads the repo file directly and the repo file wins.
- **A1 amended: the mark is “Fadi”, not “FM”.** Changed in chat. The row in the Section A table above
  and the matching lines in `docs/BUILD_PLAN.md` (A1 and Section G) were updated so the two files do
  not disagree. The full name “Fadi Muhammed” is still the nav text; only the short mark used for the
  favicon and the small nav mark changes. It is still designed and shown for approval in Part 2.

### 28 August 2026 — Part 1

Decisions taken without asking, because they are fully determined by the spec, the prompt and the
installed tooling (`CLAUDE.md`, "Never assume — ask", final bullet). Anything that would have shaped
the site's look or content was not decided here — that is Part 2.

**Scaffold**

- The sibling directory could not be called `_scaffold` as the Part 1 prompt suggests: npm rejects a
  package name starting with an underscore, and `create-next-app` derives the name from the
  directory. Used `portfolio-scaffold-tmp`, then deleted it. `package.json` name set to `portfolio`.
- Scaffolded with `--empty` (no demo boilerplate to delete), `--disable-git` (this repo already
  exists) and `--no-agents-md`. `AGENTS.md` was declined deliberately: `CLAUDE.md` is this repo's
  instruction file per Part 0, and two instruction files drift apart.
- **Tailwind v4**, which is what `create-next-app` 16.3.3 ships. Part 2 step 3 allows either a config
  file or CSS-first `@theme`; v4 makes that decision for us.
- `turbopack.root` is pinned in `next.config.ts`. Turbopack walks up the tree looking for a lockfile
  and was finding an unrelated `package-lock.json` in `C:\Users\Work`, outside the repo.
- The root layout types its own props instead of using Next's generated `LayoutProps<"/">`. Those
  types are emitted into `.next/types` by a build, so `npm run typecheck` failed on a clean
  checkout — which is exactly the order CI runs in.

**Holding page**

- **No `next/font`, no palette, no identity.** The typeface pairing and tokens are Part 2 step 3 and
  sit behind an approval gate; choosing a face here would have pre-empted it. A system stack is the
  honest neutral for a page that exists to be replaced.
- Two temporary neutral custom properties in `globals.css`, exposed via `@theme inline` and switched
  by `prefers-color-scheme` with a `data-theme` override. The values are disposable; the mechanism is
  deliberately the one Part 2 extends, so tokens are a substitution rather than a rewrite.
- `robots: { index: false }` until launch, so "Building. Back soon." is never what gets indexed
  against the name. Part 15 sets real metadata; Part 17 removes the flag.

**Tooling**

- `src/lib/env.ts` declares only `NEXT_PUBLIC_SITE_URL`. Step 4 asks for ".env.example listing every
  variable you introduce", and Supabase, Resend and Turnstile are introduced in Parts 3 and 13.
  Declaring them now as optional would mean a validator that validates nothing, against B13's
  "env validated at boot".
- Three packages beyond the prompt's list, each required to make the specced tools run rather than
  adding capability: `eslint-config-prettier` (this is the "ESLint-compatible config" step 4 asks
  for), `@vitejs/plugin-react` (Vitest cannot render components without it), `@testing-library/jest-dom`
  (the matchers). Two that were floated were **not** installed and will be added by the part that
  first needs them: `@testing-library/user-event` and `prettier-plugin-tailwindcss`. `vite-tsconfig-paths`
  was avoided by hand-writing the one alias.
- `scripts/screens.mts` runs as TypeScript under Node 22's native type stripping, so no test runner
  or `tsx` dependency was needed. It spawns the server as a direct node process, because on Windows
  killing an npm wrapper orphans the real server and leaves the port held.
- `vitest.config.mts`, not `.ts`: Vite loads a `.ts` config as CommonJS and warned on every run.
- **Chromium only in CI.** Section F requires Firefox and Safari, but on real devices before launch
  (Part 16); three engines per push buys nothing yet.
- CI `push` is filtered to `main` with `pull_request` covering everything else. This still matches the
  decision recorded above — it prevents a same-repo pull request running the identical commit twice,
  rather than narrowing coverage.
- GitHub Actions pinned to `checkout@v5`, `setup-node@v5`, `upload-artifact@v7`. The v4 line targets
  the deprecated Node 20 runtime and annotated every run.

### 28 August 2026 — Part 2 question batch

- **A23 aesthetic constraints, answered.** "Smoother than Apple", not boring, and not looking
  vibe-coded. No colours or references named as wanted or banned. Recorded as a direction, not a
  style: smoothness is bought with precision (optical alignment, one easing curve, a strict spacing
  scale), not by copying Apple's actual look, which would be its own template.
- **A1 mark, form chosen.** Option (a): a "Fadi" wordmark for the nav plus a separate simplified
  favicon, because four letters at 16 px is illegible. Nav shows both the mark glyph and the full
  name "Fadi Muhammed", per the B4 wireframe. A logotype was also requested for future use — the
  proposal is in `docs/DESIGN.md` section 5: "Fadi" with the tittle of the i replaced by the packet
  square, so the brand mark contains the site's signature element. Favicon has two candidates and is
  still to be picked.
- **A24 icons, confirmed.** Lucide, already installed. Stroke width 1.5 set in the design plan.
- **Theme default: follow the system setting; light when there is no preference.** Fadi's own
  preference is light and asked for a recommendation. Agreed and taken further: light is the theme
  designed _first_, with dark as a full counterpart rather than an inversion. The structural reason
  is that B13 names near-black-plus-acid-green as this project's trap, and designing dark-first is
  what makes that trap hard to escape.
- **Typefaces: open licence only.** No money spent. Archivo (variable, with its width axis) and
  IBM Plex Mono, both SIL OFL 1.1, loaded and self-hosted by `next/font/google`.
- **`/design` route: behind an environment flag,** not restricted to non-production. Chosen because
  Part 2 step 7 asks Fadi to review `/design` on his phone; a flag means opening the deployed URL
  rather than running a dev server over the local network. It stays `noindex` either way.
- **Design plan approved, 28 August 2026.** `docs/DESIGN.md` approved as written, without changes.
  Two follow-ups were delegated rather than decided in chat: the favicon is candidate (a), the
  "F + packet" reduction, chosen because legibility in a crowded tab strip is the favicon's whole
  job; the abstract packet-on-a-link glyph is kept for the social avatar. The one-superfamily type
  call stands, and is judged at Part 2 step 5 against the screenshots rather than in prose — if it
  reads as timid there, the display face is the first thing to change.

### 28 August 2026 — Part 2 implementation

- **A `danger` palette role was added after approval.** Recorded in full in `docs/DESIGN.md`
  section 10. The approved palette had no error colour and B10 requires designed error states.
- **Hover states are derived, not new colours.** `--accent-hover`, `--surface-hover` and
  `--ghost-hover` are `color-mix` of an existing role toward the ink, so they cannot drift from the
  palette and stay correct in both themes without a second set of values.
- **Tailwind's default palette is removed, not avoided.** `--color-*: initial` in the `@theme inline`
  block deletes it; only the token roles are added back. Verified by probe: `bg-blue-500` and
  `text-gray-400` emit zero CSS rules.
- **The theme is modelled as an external store.** `useSyncExternalStore` over localStorage and the
  `prefers-color-scheme` media query, rather than `setState` inside an effect. The Next lint rule
  flagged the original and was right — the theme lives outside React, and copying it into component
  state means keeping the copy in sync forever.
- **`npm run screens` takes routes without a leading slash.** Git Bash rewrites a leading `/` into a
  filesystem path before Node sees it, which surfaced as an unreadable navigation error. `/` is now
  always captured and extra routes are added to it; a mangled argument fails with an explanation.
  `SCREENS_FULL_PAGE=1` captures whole documents, which a long page like `/design` needs.
- **The `/design` flag is set in CI.** The route is inlined at build time, so the e2e suite that
  covers it must be built with the flag on. Production leaves it unset and the route is absent there.

### 28 August 2026 — Part 3

- **A14 resolved.** Supabase project **Portfolio**, ref `hulswrqpouaokbrbrflk`, region
  `ap-northeast-1` (Tokyo). The region was queried before building: Tokyo is far from both the
  Gulf and Europe, and it is permanent. Sized honestly it barely matters here — ISR means most
  page views never touch the database, and the latency that counts is Vercel's function to
  Supabase, which is a function-region setting we can change for free. Decision in chat: keep
  Tokyo, and set the Vercel function region to match when we get there.
- **CLI authentication is a personal access token, not `supabase login`.** `SUPABASE_ACCESS_TOKEN`
  in `.env.local`. The interactive login could not be run; the token is equivalent, and keeps the
  credential in the same gitignored file as everything else.
- **`SUPABASE_DB_PASSWORD` is in `.env.local` too.** `supabase db push` connects directly to
  Postgres and cannot work without it. Local tooling only — it is not needed in Vercel.
- **"Automatically expose new tables" was switched off at project creation**, on Supabase's own
  recommendation. Consequence: every table must be granted by name in a migration. Accepted
  deliberately — it means a table added later is invisible until granted, so a mistake surfaces
  as a page that cannot load rather than as a table readable by the public.
- **"Enable automatic RLS" was switched on.** The migrations enable RLS explicitly anyway; this is
  the safety net for any table created later, including from Studio.
- **`server-only` was installed.** Part 3 step 5 requires the service client to be marked so it
  can never be bundled to the client, and that package is the mechanism: it fails the build at
  compile time if a client component imports it, however indirectly.
- **`testimonials` was deliberately not created.** Optional in B11 and decided in Part 18.

### 28 August 2026 — Part 4

- **A22 answered partially, by choice.** Fadi supplied one item per category and will add
  the rest once the site is live, using Section E's add-content prompt or Studio. Rough
  final counts were requested to keep layouts honest at their real sizes; they were not
  given, so Parts 8 to 12 should design for a range rather than for n=1.
- **Copy was written from Fadi's own description, not invented.** The street light summary
  was drafted from the components and behaviour he described, with no em dashes as asked,
  and shown for approval before seeding.
- **Concepts were derived conservatively.** Hysteresis was deliberately left off the street
  light project: it is the obvious next concept for a light-threshold circuit, but he did
  not say it was implemented, and a concept on the site is an invitation to be questioned.
- **Certificates of attendance were remodelled as achievements.** DMZ Basecamp as a
  `program`, the National Cyber Drill as a `competition`. Recommended and applied; the
  underlying events are stronger than the certificates that evidence them.
- **DMZ Basecamp is seeded in two tables**, with the experience row unpublished, because
  Fadi supplied it as a certificate and then as an experience entry without choosing.
  One checkbox in Studio flips it either way.
- **Skills were derived from the degree curriculum Fadi supplied**, which is verifiable
  rather than claimed. Only the five backed by supplied work are published.
- **Rubric's `repo_url` is null.** The repository is private, and a "source" link that
  gives a recruiter a GitHub 404 is worse than no link. Reversible if it is made public.
- **Rubric's stack is `["TypeScript"]` only** — verified from the repository's language
  statistics. Next.js and Supabase were suspected but not confirmed, so not recorded.

### 28 August 2026 — Part 5

- **A7 confirmed as the default order**, A8 confirmed: Hero, Products, Engineering,
  Achievements, Featured in, About, Contact. Seven hops.
- **Peek teasers describe rather than count.** B3's examples count ("12 engineering
  projects"), but with one product that would read "Next: 1 product", and a count needs
  maintaining forever. Agreed in chat, revisitable later.
- **Featured in stays in the deck despite having no rows.** In Part 5 every section is a
  placeholder, so it is no emptier than the others. Whether it hides itself when empty is
  a real decision, deferred to Part 11 where it becomes real.
- **`--nav-h` added to the tokens.** The fixed nav's height is depended on by the deck's
  scroll padding, the section height and the first section's offset. Three rules agreeing
  on one number means it is a token, not a literal.

### 28 August 2026 — Part 5, after real-device testing

- **The deck uses `100svh`, not `100dvh`. This is a deliberate deviation from B3's literal
  wording**, driven by evidence from Fadi's phone: going back up the deck felt glitchy when
  the URL bar reappeared, and a fast flick sometimes skipped a section.

  Both are the same cause. `dvh` is the _dynamic_ viewport height and changes as the mobile
  URL bar hides and reappears. Inside a snap container that is corrosive: every section's
  height changes mid-scroll, so every snap point moves underneath the visitor, and a fling
  aimed at one target finds it has moved.

  `svh` is the _small_ viewport height — the value with the URL bar showing — and never
  changes, so the snap points hold still. B3's instruction was "use 100dvh, not 100vh",
  and its intent was to avoid `vh`'s mobile breakage; `svh` serves that intent better than
  `dvh` does here. `100vh` is kept as the preceding declaration purely as a fallback for
  browsers without the newer units.

  The cost: when the URL bar hides, each section is slightly shorter than the glass and a
  little more of the next section peeks through. That is the site's own motif rather than
  a defect. Revisit if Fadi reports the peek looking too tall.

### 29 August 2026 — Part 6

- **The ping easter egg measures a real round trip.** B6 specified a mock reply. Proposed
  and approved in chat: the palette times an actual request to `/api/health` and prints
  the measured milliseconds. A fake reply is a joke about being a network engineer; a real
  one is the thing itself, and it cannot quietly become an invented number the way a fixed
  string could.
- **Palette items for products and engineering projects hop to their section.** Detail
  pages arrive in Parts 8 and 9; until they exist, navigating would send visitors to a 404.
  Recommended and accepted. Those parts change the `action` in `src/lib/palette/items.ts`.
- **No X entry in the Links group.** B6 lists LinkedIn, GitHub, X, email and CV; A19
  records no X account, so it is omitted rather than listed dead.
- **`/` is a second shortcut for the palette**, guarded so it never steals a keystroke
  meant for a field.
- **A `--scrim` token was added, stated per theme rather than derived from `--ink`.** The
  first version mixed ink into the overlay, which lightened the page on the dark theme
  because ink is a light colour there. A scrim must always darken, so it cannot be
  derived from a role that inverts between themes.
- **cmdk's default match scoring was replaced.** Its fuzzy subsequence scoring ranked
  "Achievements" above "ping" for the query "ping". `scoreItem` in
  `src/lib/palette/items.ts` scores the label decisively above keywords and exact matches
  above fuzzy ones, and is unit tested against that case.
- **Focus restoration is handled by the provider, not the dialog library.** Closing left
  focus on `<body>`, which fails B6. The provider records whatever had focus when the
  palette opened and restores it on close.

### 29 August 2026 — Part 7

Answers given in chat before the design pass. Every hero string lives in `site_settings`; all
thirteen fields were read back from the live database rather than trusted from the seed file.

- **A2 eyebrow: the full line stays.** `Telecommunications & network engineer · Tech builder ·
Freelancer`, verbatim. The wireframe in section 4 of `docs/DESIGN.md` shortens it; the wireframe
  is wrong and the database is right.
- **A3 tagline confirmed unchanged**: `Unemployed & jobless, but not lost.`
- **A4 attribution is `Prometheus`, with no year.** Changed from `Prometheus (2012)` in
  `content/seed/site_settings.json` and re-seeded. The quote's origin in _Lawrence of Arabia_
  (1962) is not displayed — it is a footnote about the line, not part of the design.
- **A27 availability is `Open to work, collaborations and freelance projects.`** Changed from
  `Open to freelance work and collaborations.` and re-seeded. Chosen over the other two A27
  candidates because it leads with "open to work", which is the phrase a recruiter scans for,
  and A6 makes hiring half the site's job.
- **Hero button labels confirmed**: `See my work` (hops to Products) and `Work with me` (hops
  to Contact).
- **No proof line in the hero, for now.** B1 requires that the tagline never stand alone in a
  viewport without proof, and the A2 eyebrow is positioning rather than proof, so the hero as
  built departs from B1 on this point. Decided deliberately in chat. **Fadi asked to be reminded
  once, at the end of the build, and not in any part report before then** — see the note in
  `docs/PROGRESS.md`. The material is already in the database if he wants it: Web Summit Qatar
  2026 (speaker), DMZ Basecamp 2025, 12th National Cyber Drill 2025.
- **The Web Summit year discrepancy is resolved, and both years are real.** Fadi attended
  **Web Summit 2025 as an attendee** and **spoke at Web Summit Qatar 2026**. The CV and the chat
  notes were describing two different events, not contradicting each other. The `achievements`
  row `Students turning challenges into solutions` / `Web Summit Qatar 2026` / role `Speaker` is
  therefore correct as seeded. The 2025 attendance is not a row; whether it should be one is a
  question for Part 10, not an omission.
- **`part06-done` was moved** from `990c579` to `edd30f0` on Fadi's explicit instruction, so the
  tag marks the finished state of Part 6 rather than a point three commits before the palette
  test fix and the ping-semantics fix. `CLAUDE.md` forbids moving a tag without that instruction.
  Same situation, and same remedy, as `part05-done`.

### 29 August 2026 — Rubric's content, before Part 8

Answers given in chat, and content taken from the pitch deck Fadi supplied
(`Pantheon - Pitch Deck.pdf`, eight slides). Nothing in the case study was invented: every
claim in it appears in that deck, and everything the deck does not cover is left empty.

- **Fadi's role was group leader of Team Pantheon** — three people, 48 hours. Stated plainly in
  the case study rather than implied, because the deck names two other people and a portfolio
  that leaves a team project ambiguous is claiming the whole of it.
- **The impact figures are projections, not measurements, and are labelled as such wherever they
  appear.** Confirmed in chat. Four hours for 900 applications across six roles, and zero
  double-booked candidates, are modelled from the challenge brief during the build; Rubric has
  never been run against a real intake. `CLAUDE.md` forbids invented metrics, and a projection
  presented as a result is exactly that. The case study says so in its own heading, the `outcome`
  field repeats it, and `metrics.basis` is `"projected"` so no future component can render the
  numbers without the qualifier.
- **The setting was a 48-hour QSTP hackathon**, and "Challenge 2 — CV matching bottleneck" was
  one of three problems set there. Recorded in the case study as context.
- **Quitifi is still under development**, so it is not a product on this site. This closes the
  open question carried since Part 4. Products has one card. Revisit if it ships.
- **The product cover is the allocation-board screenshot, not the deck's title slide.** Fadi
  offered the title slide. It is cream with a serif display face — the exact AI-default look
  `docs/DESIGN.md` section 9 rejects by name — and would have sat as a warm serif card in a cool
  blue-grey palette, worst on the dark theme. A screenshot of the product doing the thing is also
  stronger evidence than a title card, which B13 asks for directly. Recommended and accepted.
- **Three screenshots were extracted from the deck** rather than asked for separately: the
  allocation board, the match pool and hidden gems, all real UI at about 1900 px. They use
  invented candidate names, so there is nothing to redact.
- **`metrics` was given a shape here rather than in Part 8**: `basis`, `note`, and `items` of
  `value` and `label`. Part 8 designs how metrics render and may reshape it; the point of
  choosing now is that the projection qualifier travels with the numbers instead of living only
  in prose that a card layout would drop.
- **`repo_url` stays null.** The repository is private, and a link to a 404 is worse than no link.

### 29 August 2026 — Part 8

- **Every list fetcher answers with nothing when Supabase is unconfigured**, matching the guard
  `getSiteSettings` got in Part 7. CI is the only environment where that path runs, so it is the
  only place the failure appears; building with `.env.local` moved aside is now the check to run
  before pushing anything that reads content at build time.
- **The markdown renderer emits React elements, never an HTML string.** React escapes text, so
  a body edited in Supabase Studio cannot become markup on the page and there is no sanitiser to
  misconfigure. It supports only the subset the bodies use and shows unrecognised syntax as
  plain text rather than dropping it. No dependency was added for this.
- **`/api/status` takes a slug, not a URL.** The endpoint looks up `status_check_url` itself, so
  it can only ever reach a URL this site already publishes. A URL parameter would have made the
  site an open proxy.
- **A product's `ok` follows the HTTP status code**, unlike the palette's ping easter egg, which
  counts any reply as reachability. A 500 is a reply and the product is not up.
- **Four cards in the deck before "All products →"**, and the link only appears when there are
  more than that.
- **`/products` exists even with one product** — a guessable URL should not 404, and Part 15's
  sitemap will want it.
- **A metrics figure is never rendered without its basis.** `metrics.basis` becomes the heading
  above the numbers. A block with no stated basis is not rendered at all. This is what keeps
  Rubric's projections from reading as measurements after a future layout change.

### 29 August 2026 — Part 9

- **The card is shared between Products and Engineering** (`WorkCard`), not duplicated. The
  CSS moved with it: `.product-card` and `.product-strip` are now `.work-card` and
  `.work-strip`.
- **No filter chips in Engineering.** B2 asks for them by type; with one project and one type
  a filter is a control that can only ever do nothing.
- **The instrument models the firmware, not the physics.** The obvious instrument — the LDR's
  response against illuminance — was built and then discarded once the report arrived: it
  records no photometry, so every point on that curve would have been invented. The bench is
  `main.py`'s loop instead, asserted against the one measured console line the report
  contains.
- **No diagram draw-in and no oscilloscope divider were built.** B2 and Part 9 both ask for
  them. There is no schematic in the database to animate, and a sweep divider on a page with
  no diagram is decoration — which is the one thing this section must not be. Both arrive
  with the first project that has a schematic.
- **The project's `type` changed from `lab` to `course`** and its title now follows the
  report ("Smart street lighting system"). The slug is unchanged.
- **Credited to two people.** The report names Fadi and Adam.
- **No `@testing-library/user-event` dependency.** Component tests use `fireEvent`; the real
  keyboard test lives in Playwright, where a browser actually processes the keys.
- **An error in the source report, reported to Fadi.** The wiring table says the LDR is the
  top leg of the divider, which would make the reading rise with light. Both documents state
  the opposite behaviour and say it was verified on the rig, and `main.py` depends on it. The
  table almost certainly has the legs swapped; the site models the observed behaviour.

### 29 August 2026 — achievements content, before Part 10

Answers given in chat, with photographs supplied.

- **Dates.** The Web Summit Qatar talk was **February 2026**; the QSTP 48-hour hackathon was
  **August 2026**; the National Cyber Drill CTF was **November 2025**. Stored as the first of
  the month, following the convention set in Part 4 for month-precision dates. Two of the
  three had no date at all, which would have sorted the strongest entry — the talk — to the
  bottom of the timeline with no year against it.
- **No result on two of them, and that is the honest answer.** Fadi placed in neither the
  hackathon nor the CTF. `result` stays null rather than being padded with "Completed" or
  "Participated"; the timeline shows the role instead, which is true. Proposed in chat and
  not objected to.
- **The QSTP hackathon is now an achievements row.** It was missing entirely, flagged twice
  since Part 8. It is the only `hackathon` in the table, so it is also what makes B2's filter
  chips able to do anything — before it there were three types for five chips. It links to
  `/products/rubric`, which is the same event seen from the other side.
- **Two photographs were used with explicit permission**, having been found in Downloads
  rather than handed over in the message: `websummit talk.jpeg` (Fadi speaking, badge
  visible) and `ncsa.jpeg` (Fadi holding the CTF certificate of attendance). Both are
  photographs of a real person going onto a public site, so neither was assumed.
- **Five more Cyber Drill photographs** were supplied and staged as that entry's gallery.
  The one showing a laptop was checked before use: the Immersive Labs sign-in fields are
  empty, so there is nothing to redact.

### 29 August 2026 — Eshrahli and the Scale AI sprint, before Part 10

- **Eshrahli is a product, not only an achievement.** It is a deployed MVP with real beta
  users and Fadi is co-founder and CEO, so it belongs in Products; the win belongs in
  Achievements; the two cross-reference. Written from the sprint deck and the four
  deliverables. Earlier names Bridge AI and Jesr AI appear nowhere — the settled name is
  Eshrahli.
- **Its metrics are `measured`, unlike Rubric's `projected`.** Ten to fifteen beta testers
  and 100+ slides ingested came from an actual qualitative beta with UDST students. This is
  the first time the `basis` field earns its keep by distinguishing two products rather than
  qualifying one.
- **"100 % of answers cited to a page" was not seeded as a metric.** It is an architectural
  guarantee — retrieval gate, refusal on low confidence, page-level citations — not
  something the beta measured. It is described in the body instead.
- **The security work is in the case study.** Two layers against prompt injection (a
  defensive block in the system prompt and a post-generation validator) and per-user scoping
  on every retrieval. It is the strongest engineering content in the deliverables and reads
  as someone who implemented controls rather than documented risks.
- **Khaled Mhirsi is credited as co-founder and CTO**, as the deck names him.
- **The Scale AI sprint is dated April 2026**, given in chat. It is the only `award` in the
  table, which is what finally gives B2's award filter chip something behind it. The
  timeline now carries five entries across five types — hackathon, award, talk, competition,
  program — all dated.
- **Stacks, as given in chat.** Rubric: TypeScript, Next.js, Tailwind CSS, shadcn/ui,
  Supabase, Vercel. Eshrahli: JavaScript, Supabase, Vercel.

### 29 August 2026 — Part 10 question batch

Asked before any work, answered in chat.

- **The list is complete for now.** Five entries, one of each type. Fadi will add more
  after the site is complete, with their dates, and the timeline sorts them into place on
  its own — nothing about the section assumes five.
- **DMZ Basecamp was in Toronto, Ontario, Canada**, and ran two months, July to August 2025. The row had no city, no country and no summary; it was the only entry missing all
  three. `date` stays `2025-07-01` — the table has one date column, not a range — and the
  duration is stated in the summary instead, which is where a range can be read.
- **The Web Summit talk has no recording and no slides.** So **the click-to-load video
  facade is not built.** Part 10 asks for one; there is no URL to put behind it, and a
  facade with nothing behind it is a play button that lies. The talk entry leads with the
  photograph instead. The facade arrives with the first recording.
- **One photograph per hop, on expansion**, not all six of the Cyber Drill's. Four of
  those six are venue, signage and a registration desk, which is evidence of attendance,
  not of the work. Each entry shows its cover — the certificate, the trophy ceremony, the
  talk itself — and the rest stay in the database for a gallery that has a reason to
  exist.
- **No map of event cities (A25).** Four events in Doha and one in Toronto is two pins.
  The city is already printed on every hop, which is the information a map would carry.
  Answered "what do you think"; this is the answer, and it can be revisited at Part 18.
- **Newest first.** Also answered "what do you think". A traceroute numbers hops outward
  from the origin, so hop 1 being the most recent — the one nearest to now — is the
  metaphor read correctly, and it puts the QSTP hackathon and the Scale AI win at the top
  instead of under a 2025 programme.

### 29 August 2026 — Part 10, decided without asking

- **Hop numbers renumber when the list is filtered.** A filtered view is a different
  route, and a real traceroute numbers the hops of the route it actually took. Numbers are
  positional, never an identity.
- **The filter writes `?hop=talk` and uses `replaceState`.** Part 10 asks the URL to carry
  the filter so a filtered view can be shared. `replaceState` matches what the deck
  already does with the hash; pushing would fill the back button with filter states and
  fight the deck's own history writes.
- **The five chips are the five types from the schema, not a summary of the data.** All
  five currently have an entry behind them, so no chip is a control that can do nothing —
  the objection that removed Engineering's chips in Part 9. Keeping the set fixed also
  means the controls do not reshuffle as content is added.
- **The palette does not deep-link into a filtered view, against what was proposed in the
  question batch.** Selecting "Web Summit Qatar 2026" and landing on a filter for _all_
  talks answers a question nobody asked; with more talks it would be plainly wrong. It
  would also have needed the palette to announce a URL change to this section across the
  page, which is machinery for a gain that is not there. Palette entries hop to the
  section, as before. Worth revisiting if an achievement ever gets its own page.
- **No `/achievements` index page.** Products and Engineering have one because their cards
  are a preview of a longer list. The timeline shows everything it has, the section scrolls
  internally, and the command palette already reaches every entry by name.
- **FLIP is written by hand rather than with `motion`.** Five list items and one
  transition do not justify pulling in layout animations, and B12's JavaScript budget is
  the reason. `motion` stays unused — see the Part 10 report.

### 29 August 2026 — Part 11 deferred, and the logo files

- **There is not one coverage URL for any of the nine logos**, and B8's whole premise is
  "logos only, each linking to the actual coverage". Fadi asked to be asked for them after
  the rest of the site is finished, and said not to add the logos in the meantime. **Part 11
  is therefore skipped in the sequence**, not built with placeholder links: a logo linking
  nowhere is the padding B13 names this section as most at risk of. The Featured in stop
  keeps its placeholder and the question is put once, before Part 17. Recorded as a standing
  item at the top of `docs/PROGRESS.md`.
- **Two logos were added to the staging directory**: Vodafone and Qatar Television, bringing
  the set to nine. What either represents is not yet known — a television interview is
  coverage, but an employer or a sponsor is not, and that goes in About's timeline instead.
  Asked with the URLs.
- **The Vodafone file had no transparency at all.** Its checkerboard was painted into the
  pixels as white and light-grey squares, with no alpha channel and no `tRNS` chunk, so it
  would have rendered as a literal tile on the page. Repaired rather than sent back: every
  background pixel is neutral and the mark is red-only, so `alpha = (R - G) / chroma`
  recovers true coverage on the anti-aliased edges independently of which square a pixel sat
  on. Keying on "is this white-ish" instead would have left a halo on every edge.
- **The logos are PNG and that is accepted for now**, with SVGs to be swapped in later. The
  swap costs nothing structural — same paths, same bucket — beyond deleting the dark-theme
  invert rule that a PNG needs and an SVG taking `currentColor` would not.
- **Three problems with the set are recorded now so they are not rediscovered**: height
  normalisation breaks a set that mixes wordmarks with a vertical lockup and a square seal;
  UC Berkeley's seal becomes a solid white disc under the dark silhouette treatment; Web
  Summit Qatar and Al Fikra are near-black, so full colour on hover barely registers on dark.
  The first of these will need a deviation from B8's literal "same visual height", which is
  Fadi's call when the part is built.

### 29 August 2026 — Part 11 is built and shipped, links to follow

Reversing the deferral recorded above, on Fadi's instruction the same day: **build and ship
everything except the URLs.** The section is built in sequence and the logos are published;
a row whose `url` is null renders as a logo rather than as a link, which the schema already
allows. Part 11 is complete on every count except the links, and the URLs are asked for once
after the rest of the site is finished.

The reasoning for the earlier deferral was that a logo linking nowhere is padding. That still
holds for a logo that will never have a link — but these will, and the alternative was
rediscovering the whole design problem cold in a few weeks. Building now and adding the hrefs
later costs one seed edit.

### 30 August 2026 — Part 11

Question batch answered in chat, plus the calls made while building.

- **Header stays "Featured in."** The deck already names the section, so there is no second
  heading inside it. "As seen at" would have been a rename across the rail, the palette,
  the peek strip and the document title.
- **Both Qatar University and UC Berkeley are coverage**, so both stay. That is what makes
  the area-based normalisation necessary: a square seal and a vertical lockup in the same
  row as five wordmarks.
- **A collage was proposed and declined.** Varying logo sizes claims a ranking that nothing
  supports, and it reads as a marketing logo wall — the failure mode B13 names for this
  section. Two arrangements were rendered from the real files and compared before deciding.
- **No map, no constellation, no link draw-in.** The hero owns the routing topology; a
  second one here competes with it. The draw-in B8 permits belongs to the constellation
  that was declined.
- **The hover reveal is light-theme only.** A measured deviation from B8, with the contrast
  table in `docs/DESIGN.md` 15.4: four of the nine fail WCAG 3:1 against the dark ground in
  their own colours, so revealing them there hides the logo at the moment the visitor
  points at it. On dark the monochrome mask lifts from `muted` to `ink` instead.
- **Categories are provisional for six of the nine.** The schema requires one and only
  three are known from the database. Recorded as guesses, corrected when Fadi says what
  each logo represents.
- **`sharp` added as a devDependency.** It was already installed as a transitive dependency
  of Next, and a script in `scripts/` should not rely on that holding.
- **The nav is opaque everywhere except the hero.** Not a Part 11 decision by intent — the
  deck snaps a section below the nav, so the nav's strip shows the tail of the section
  above it, and the nav had no background at all. Invisible until Part 10 put "Invite me to
  speak" at the bottom of its section, where it printed over the nav from the Featured in
  stop. The hero keeps a transparent nav because B4 asks for the topology to tuck under it.

### 30 August 2026 — Part 12

Question batch answered in chat, plus the calls made while building.

- **The bio and "currently" line are placeholders written by Claude**, at Fadi's
  instruction, to be replaced with his own once the site is done. Written only from facts
  already in the database — the degree, the street-light firmware, Eshrahli's retrieval
  layer, the Scale AI win, Web Summit — so nothing in them is invented, only assembled.
- **Two new columns on `site_settings` (bio, currently) and one on `experience`
  (logo_path)**, by migration, because B11 specified none of them.
- **Five skills published, seventeen held back**, on the condition that the links are
  maintained as work is added. Recorded as a standing item at the top of `docs/PROGRESS.md`
  rather than left as a promise in a report: it is now part of adding any new product or
  project.
- **Certifications ship as they stand** — name and issuer, no date, no credential link, no
  logo. Fadi supplies the rest with the other details after the build.
- **"College of Engineering & Technology" is one of UDST's colleges**, so the row now names
  UDST as the organisation and keeps the college in the role. The timeline was reading as
  two institutions.
- **UDST's mark appears on three rows, not one.** All three happened at UDST — the degree,
  the job in one of its colleges, and the club — so the column carries information rather
  than decorating a single row. Quitifi has no mark and its column is empty.
- **Selecting a skill hops to the work it names.** A deviation from B2's "re-lay out live",
  forced by the deck mounting only the active section and its neighbours: About is four
  stops from Products, so a tap there changes cards that are not in the document. The hop
  is what makes the control do anything at all. Clearing does not hop.
- **`useQueryFilter` and `useFlip` were extracted from the Achievements timeline** and it
  now uses them. Two copies of a URL-backed filter store would have been the parallel
  convention CLAUDE.md forbids, and the second copy is always the one that drifts.

### 30 August 2026 — the deep-link bug, found during Part 12

Not a Part 12 decision, but the fix landed in it. `e2e/deck.spec.ts` "lands on the section
named in the URL" had failed once in Part 10, once in Part 11 and once more here, and had
been recorded twice as flake. It was not.

- **`active` was left to the observer.** The deep-link effect scrolled to the section and
  nothing more, so `active` stayed on the hero until an IntersectionObserver callback
  happened to arrive. The title, the mounted section and the rail all follow `active`. The
  URL is now authoritative, exactly as a click is: set the destination, mute the observer
  until it agrees, then scroll.
- **Next overwrote the title.** The layout's static metadata is applied during hydration,
  after the effect that sets the section title — and because `active` never changes again
  on a landing, nothing put it back. Rendering a `<title>` was tried and is worse (React
  hoists it beside Next's and the browser takes the first of three); re-applying on the
  next frame passed on an idle machine and still lost under six parallel workers. The value
  is now asserted through a bounded MutationObserver on the title element.
- **The test was complicit.** It asserted the URL, which `goto("/#engineering")` makes true
  before any JavaScript has run, so it passed while the deck sat on the hero. It asserts
  `data-active` now — the deck's own answer to "where am I".

The lesson worth keeping: a test that fails under load and passes alone is reporting the
conditions of the bug, not the absence of one.
