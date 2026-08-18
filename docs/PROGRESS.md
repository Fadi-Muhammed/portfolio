# Progress

A running log of what exists, how to check it, and what is not done yet. Updated at the end of every
part, before the report to the user. Newest part at the top.

Definition of done for any part is `docs/BUILD_PLAN.md` B14. UI parts also record the B13
"not vibe-coded" checklist outcome here, including what the "remove one accessory" pass removed.

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
