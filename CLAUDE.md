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
