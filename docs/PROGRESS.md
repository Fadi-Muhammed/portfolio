# Progress

A running log of what exists, how to check it, and what is not done yet. Updated at the end of every
part, before the report to the user. Newest part at the top.

Definition of done for any part is `docs/BUILD_PLAN.md` B14. UI parts also record the B13
"not vibe-coded" checklist outcome here, including what the "remove one accessory" pass removed.

---

## Part 1 — Scaffold, tooling, CI and preview deployments · 28 August 2026

Status: steps 1–6 and 8 done and green. Step 7 (Vercel) is waiting on the account holder — see
"Known gaps". Not tagged `part01-done` yet, because the preview URL is part of the part's
definition of done.

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

- **Vercel (step 7) not done.** No preview URL yet. It needs the account holder in the dashboard —
  it cannot be done from here.
- `NEXT_PUBLIC_SITE_URL` is validated but nothing imports `env.ts` yet, so a missing value does not
  fail the build. The first consumer arrives with real metadata in Part 15.
- No `/design` route yet; that is Part 2 step 4.

### Next

Finish step 7 (Vercel), note the preview URL here, then tag `part01-done`. After that, Part 2 —
design tokens and foundations, which opens with a question batch and an approval gate on
`docs/DESIGN.md` before any code.

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
