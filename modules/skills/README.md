# Skills — reusable procedures your AI triggers by name

A **skill** is a markdown file teaching your AI a repeatable procedure with defined
triggers ("when the user says X, do Y with this exact format"). In Claude Code, skills
live at `.claude/skills/<name>/SKILL.md`; other harnesses have equivalents (custom
instructions, slash commands). The concepts here port to any of them.

**Where they live — deliberately NOT in the context repo:** put `.claude/` inside your
cloud-synced folder (`{{SYNC_ROOT}}/.claude/skills/...`) so every machine loads the same
skills, while the repo stays a pure content layer. (You *can* keep them in the repo and
symlink — just pick one home and note it in your CLAUDE.md.)

Each `SKILL.template.md` here is a starting point: the installer copies the selected
ones, fills placeholders, and the user's AI refines them with use.

| Skill | Triggers on | Does |
|---|---|---|
| `decision-memo` | "I need to solidify a decision", "write a decision memo", justifying a big recommendation | No memo, no decision: a dated memo in `decisions/` + an index — options, rationale, accepted risk. |
| `premortem` | "premortem this", any big plan about to start | Assume the plan failed; enumerate the most plausible causes; harden the plan against the top ones. |
| `chief-of-staff` | Session start / "brief me" | The startup briefing: priorities, calendar, overdue items, waiting-ons, what broke overnight — including a routine-status section. |
| `routine-status` | "did my routines run", "what's waiting on me"; also part of the briefing | Reconciles scheduled-task state vs `AUTOMATIONS.md`: what ran, what was MISSED (machine asleep), what's waiting on human input — with inline re-run offers. |
| `memory-capture` | "capture this", "remember this", a `MEM:` prefix | Quick-capture to the memory connector with dedup search first (degrades to a repo note if no connector). |
