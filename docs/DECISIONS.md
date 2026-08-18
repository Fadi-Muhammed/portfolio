# Decisions

Every decision that shapes this site, with the date it was made. Decisions taken in chat are appended
to the log at the bottom; the table below is the state of `docs/BUILD_PLAN.md` Section A.

Rule: nothing gets guessed. If a decision is missing, the part that needs it stops and asks, and the
answer is recorded here before the work continues.

## Section A — decisions made in planning (18 August 2026)

| # | Decision | Your answer |
|---|----------|-------------|
| A1 | Your name as it should appear on the site | Fadi Muhammed. Mark: an “FM” monogram is proposed for the favicon and a small nav mark — Claude Code designs it and shows it for approval in Part 2; the full name is used as the nav text. |
| A2 | Role line (the eyebrow above the tagline) | Telecommunications & network engineer · Tech builder · Freelancer |
| A3 | Hero tagline (exact text) | Unemployed & jobless, but not lost. |
| A4 | Famous quote + attribution (verified) | “Big things have small beginnings.” — David, Prometheus (2012). Note: the line originates in Lawrence of Arabia (1962), spoken by Mr Dryden, and is quoted by David in Prometheus. Display attribution as “Prometheus (2012)” or “Lawrence of Arabia (1962), via Prometheus” — confirm the exact wording in Part 7. |
| A5 | Primary visitor | Recruiters/employers and collaborators/clients (both). |
| A6 | The single job of the site | A mix of “look at what I built” and “hire me / work with me”. Proposed hero buttons: “See my work” (hops to Products) and “Work with me” (hops to Contact); confirm in Part 7. |
| A7 | Section order on the home deck | Default. |
| A8 | Include the About block (skills, certifications, experience, education, CV)? | Yes (as recommended). |
| A9 | Footer "route you took" recap (mini topology lit with the visited path, "Destination reached")? | Yes (as recommended). |
| A10 | Domain name | fadimuhammed.work (owned). |
| A11 | GitHub username and repo name | GitHub user Fadi-Muhammed (https://github.com/Fadi-Muhammed); repo name `portfolio` (private). |
| A12 | Frontend stack | As recommended: Next.js (App Router) + TypeScript + Tailwind CSS + Motion + cmdk. |
| A13 | Hosting | As recommended: Vercel. |
| A14 | Supabase project | Not created yet. Create it right before Part 3 — Prompt 3 walks you through it (project name, the region closest to your visitors, and exactly which values to copy into .env.local). |
| A15 | Contact email + where form messages should be forwarded | work.fmuhammed@gmail.com for both (public contact address and forwarding address). |
| A16 | Transactional email provider for form notifications | As recommended: Resend. Never used before — Part 13 walks you through creating the account, the API key and the sender, step by step. |
| A17 | Bot protection on the contact form | As recommended: Cloudflare Turnstile + honeypot. Never used before — Part 13 walks you through creating the Turnstile site and keys. |
| A18 | Analytics | Umami (free tier, privacy-friendly, no cookie banner) — chosen because you had no preference; Part 15 walks you through creating the account and site. Alternative if it is simpler at the time: Vercel Web Analytics. |
| A19 | Social links | LinkedIn: https://www.linkedin.com/in/fadi-muhammed-524b75310 · GitHub: https://github.com/Fadi-Muhammed · Others: none for now (add later in site_settings). |
| A20 | Slider targets ("Slide into my LinkedIn / DMs") | LinkedIn only → a single slider (“Slide into my LinkedIn →”). A DM slider can be added later. |
| A21 | Featured-in logos | To be provided later — Part 11 asks for the list, the SVGs and the coverage URLs before building. |
| A22 | Content inventory | To be provided later — needed at Part 4 (start collecting rough lists now: products, engineering projects, achievements, talks, certifications, experience, education). |
| A23 | Aesthetic constraints | Let the design skill decide; Claude Code asks only if something specific is needed. |
| A24 | Icon set | As recommended: Lucide. |
| A25 | Optional extras (blog/notes, testimonials, photo gallery, map of event cities) | Ask one by one when Part 18 comes. |
| A26 | Languages | English only. |
| A27 | Availability line for the hero/contact | Open to freelance work and collaborations. (Alternatives: “Open to work, collaborations and freelance projects.” / “Open to collaborations, freelance and full-time work.”) |
| A28 | Your time zone (for the "local time" line in Contact) | Asia/Qatar |
| A29 | Booking link (Calendly/Cal.com) | None for now (skip). |
| A30 | Node version installed | Unknown — Claude Code checks with `node --version` in Part 0 step 1; if it is missing or below 20, install the current LTS from nodejs.org and re-run Prompt 0. |

The "Recommendation / notes" column of the original table is not reproduced here; it stays in
`docs/BUILD_PLAN.md` Section A.

## Deliberately deferred

These are unanswered on purpose. The part that needs each one asks for it before building.

| # | Decision | Needed at |
|---|----------|-----------|
| A14 | Supabase project (ref, URL, keys) | Part 3 — Prompt 3 walks through creating it |
| A21 | Featured-in logo list, SVGs, coverage URLs | Part 11 |
| A22 | Content inventory (products, engineering projects, achievements, talks, certifications, experience, education) | Part 4 — worth collecting now |
| A23 | Specific aesthetic wishes | Part 2, only if something specific is needed |
| A25 | Optional extras (blog/notes, testimonials, photo gallery, map of event cities) | Part 18, asked one by one |

To confirm in their own parts: the FM monogram (Part 2); the hero button labels and the quote's
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
