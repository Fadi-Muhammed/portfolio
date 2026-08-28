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
