# Interview guide — question bank and answer→file mapping

For the installer AI running `BOOTSTRAP.md` Phase 1. Ask in batches of 5–7. Skip
questions whose answers you already detected in Phase 0. Use the user's own words in
generated files — especially domain names and people descriptions.

## Batch 1 — Identity and platform

| # | Question | Fills | Where |
|---|---|---|---|
| 1 | What should your AI call you? | `{{USER_NAME}}` | All identity files |
| 2 | What timezone are you in? | `{{TZ}}` | `CLAUDE.template.md`, daily-loop env |
| 3 | Want to name your AI persona? (I can suggest names, or `Assistant` works.) | `{{AGENT_NAME}}` | `SOUL.template.md` and everywhere |
| 4 | Which AI tools will you actually use day-to-day? (desktop coding agent / web chat / mobile / several) | spoke selection | Determines which of `CLAUDE/AGENTS/USER` templates to generate |
| 5 | GitHub account (or preferred git host) for your private repo? | `{{GITHUB_USER}}`, `{{REPO_NAME}}` | `SETUP.template.md`, worker configs |

## Batch 2 — Life domains and priorities

| # | Question | Fills | Where |
|---|---|---|---|
| 6 | What are the 3–6 areas your work and life actually divide into? (e.g. "day job, my business, family, health") | `{{DOMAIN_1..N}}` | `TASKS.template.md` sections, `SOUL.template.md` priorities |
| 7 | Of those, what are the top 3 priorities *right now*? | Top 3 block | `SOUL.template.md` |
| 8 | Any hard rules about a domain? ("never mix A and B", "X stays anonymous") | Preferences & Rules | `CLAUDE.template.md` |

## Batch 3 — Operating style and autonomy

| # | Question | Fills | Where |
|---|---|---|---|
| 9 | Read them the default hard-approval list from `docs/governance.md` (publish, purchase, message someone, delete, credentials). Anything to add or relax? | Autonomy contract | `SOUL.template.md` → Autonomy |
| 10 | How much pushback do you want? (challenge me hard / flag concerns politely / just execute) | Stance/Pushback | `SOUL.template.md` |
| 11 | Will you ever open the tracker files yourself, or do you work purely by talking? | Operating-interface contract | `SOUL.template.md`, `CLAUDE.template.md` |
| 12 | Formal or casual tone? Different for outward-facing drafts? | Tone | `SOUL.template.md` |

## Batch 4 — Task model

| # | Question | Fills | Where |
|---|---|---|---|
| 13 | Simple task list, or the full sprint model (effort scores, weekly sprint, scored backlog)? Recommend simple to start — the full model is an upgrade path, not a requirement. | Task framework depth | `TASKS.template.md` (prune sprint machinery if simple) |
| 14 | What day should the weekly review land? | Weekly review automation | `AUTOMATIONS.template.md` example row |

## Batch 5 — People

| # | Question | Fills | Where |
|---|---|---|---|
| 15 | Name 5–15 people who matter day-to-day (colleagues, family, clients) with a phrase each on who they are. | Key People table, people tracker tiers | `CLAUDE.template.md`, `PEOPLE.template.md` |
| 16 | Anyone you want a nudge to stay in touch with, and roughly how often? | Cadence assignments | `PEOPLE.template.md` |

## Batch 6 — Modules and memory

| # | Question | Fills | Where |
|---|---|---|---|
| 17 | Walk the capability-gated module menu (daily capture loop, phone widget, CI auto-merge, skills, local-LLM worker) with a one-line pitch each. Yes/no per module. | Module selection | Which `modules/` get copied |
| 18 | If a memory MCP connector exists: OK with capture-by-default (the AI banks decisions/context without asking each time)? | Memory rules | `memory.template.md` |
| 19 | If daily-loop selected: where will captures come from? (phone shortcut, email-to-file, any tool that drops text files in a synced folder) | Capture entry point | `modules/daily-loop/README.md` adaptation |

## Mapping notes

- Interview answers **never** get pasted into this public repo — they only ever land in
  the user's private repo.
- Every unanswered placeholder becomes `{{TODO: ...}}` in the generated file, and the
  Phase 4 checklist surfaces the full TODO list to the user.
- If the user declines a module, remove its references from generated files entirely —
  no dangling pointers.
