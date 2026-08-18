# portfolio

The personal site of Fadi Muhammed — telecommunications and network engineer, tech builder,
freelancer. One story from RF and protocols up to the product.

Private repository. Built part by part against a written plan rather than improvised.

## Where things are

| Path | What it is |
|------|------------|
| [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) | The whole thing: decisions (A), specification (B), working rules (C), the ordered parts and their tests (D), utility prompts (E), launch checklist (F). |
| [`CLAUDE.md`](CLAUDE.md) | Working rules for Claude Code. A copy of Section C of the plan. |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Every decision, dated. Nothing is guessed; missing answers stop the work. |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | What exists, how to test it, known gaps, what is next. |
| `docs/DESIGN.md` | Design tokens and the reasoning behind them. Arrives in Part 2. |
| [`.claude/skills/frontend-design/SKILL.md`](.claude/skills/frontend-design/SKILL.md) | The design skill applied to all UI work. |

## Status

Part 0 of 18 is done: repo, rules, plan and skill in place. No application code yet — the scaffold is
Part 1. See [`docs/PROGRESS.md`](docs/PROGRESS.md).

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Motion and cmdk on the front; Supabase for content and
storage; Vercel for hosting. Chosen in Section A, not by habit.

## Secrets

No keys live in this repository. `.env*` is ignored except `.env.example`, which lists variable names
only. Real values go in `.env.local` and in Vercel.
