# Progress

A running log of what exists, how to check it, and what is not done yet. Updated at the end of every
part, before the report to the user. Newest part at the top.

Definition of done for any part is `docs/BUILD_PLAN.md` B14. UI parts also record the B13
"not vibe-coded" checklist outcome here, including what the "remove one accessory" pass removed.

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

- **No CV.** `site_settings.cv_path` is null; the About and Contact download has nothing
  to point at. Drop the PDF at `content/assets/documents/cv.pdf`.
- **No images anywhere.** No product cover, no project photo, no talk photo. Parts 8, 9
  and 10 will render card layouts with empty media wells.
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
- **Rubric has no case-study body, no metrics and no outcome.** The product card will
  render; the case-study page will be thin.
- **Rubric's repo is private**, so `repo_url` is null rather than a link to a 404.
- **No summaries or highlights on any experience row.**
- **Work placement missing.** The curriculum shows a 9-credit, 40-hour-a-week placement
  in semester 9. If it has been done, it is a strong row that is absent.

**Open questions raised and not yet answered**

- Rubric's full stack. Only TypeScript is verified, from the repo's own language stats.
- Whether Quitifi is a shipped product. Fadi is Founder & CEO since March 2025 and there
  is a Supabase project named Quitifiv2; if it ships, it belongs in Products.
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
