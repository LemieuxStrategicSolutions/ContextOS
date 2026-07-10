# {{REPO_NAME}} — read me first (desktop agent spoke)

<!-- The environment spoke for a desktop AI agent with filesystem access (e.g. Claude
     Code). Facts + plumbing only; behavior lives in SOUL.md. -->

This is {{USER_NAME}}'s **private, durable context system**. It is **canonical**. Every
AI session reads this layer first, then acts on {{USER_NAME}}'s behalf.

**Private forever.** Never public. Never commit keys or secrets.

## Read order

1. `SOUL.md` — who you are, priorities, autonomy contract, task framework.
2. This file — environment plumbing, glossary, people, projects.
3. `memory.md` — the three memory layers and their rules.
4. Recent `daily/*.md` — what's happened lately.

## Where the real files live

- **Canonical home:** the private repo `{{GITHUB_USER}}/{{REPO_NAME}}`, cloned at
  `{{SYNC_ROOT}}/{{REPO_NAME}}`.
- Identity layer at repo root; operational trackers in `trackers/` (daily churn, commit
  freely); daily notes in `daily/`.
- <!-- Keep only if using flat-path symlinks: --> Legacy flat paths under
  `{{SYNC_ROOT}}/` are symlinks into this repo — same file, no copy. If one looks
  broken, the repo copy is canonical; re-link per `SETUP.md`.
- Web/mobile sessions read these files directly from the git host.

## Sync rules

- **The git host is canonical.** A desynced clone gets re-cloned, not trusted.
- `git pull` before editing, `git push` after.
- **Never `git push --force`.** Never silently clobber another session's work.
- Edit identity files at the repo path (or via tools that preserve symlinks) — a desktop
  app's atomic-save replaces a symlink with a divergent copy (see `SETUP.md`).
- Before deleting/overwriting any file: read it, summarize the change, get
  {{USER_NAME}}'s OK.

## Automation registry rule

**No silent automations.** Every scheduled task, cron, or loop on ANY system must be
listed in `AUTOMATIONS.md`. Creating, editing, pausing, or retiring one updates that
file **in the same action**. If it isn't in `AUTOMATIONS.md`, it shouldn't be running.

## Me

{{TODO: 2–3 lines — who {{USER_NAME}} is, what they do, where life happens}}

## Key people

| Who | Role / context |
|-----|----------------|
| {{TODO: name}} | {{TODO: role}} |
| {{TODO: name}} | {{TODO: role}} |
| {{TODO: name}} | {{TODO: role}} |

## Terms

| Term | Meaning |
|------|---------|
| **{{AGENT_NAME}}** | The AI persona defined by SOUL.md; every session operates as it. |
| **{{BUILDER_AGENT_1}}** | Named builder identity for this environment (see SOUL.md → Delegation). |
| **Memory connector** | The persistent-memory MCP connector — layer 2 of `memory.md`. |
| **Daily loop** | Capture → inbox → processed daily note pipeline (`daily-loop/` if installed). |
| {{TODO: the user's own jargon, one row each}} | |

## Active projects

| Project | Status | Notes |
|---------|--------|-------|
| {{TODO}} | | |

## Preferences & rules

- {{TODO: standing rules from the interview — domain hard rules, tools to avoid, etc.}}

## Tooling plumbing

- **Memory MCP:** interactive sessions may see `mcp__<id>__capture_thought` /
  `__search_thoughts`; headless CLI calls see `mcp__{{MEMORY_MCP_NAME}}__…` — these
  differ; see the repo's `GOTCHAS` notes before scheduling anything. <!-- prune if no memory connector -->
- **Skills:** custom skills live machine-local at `.claude/skills/<name>/SKILL.md`
  under `{{SYNC_ROOT}}` (synced to all machines, never in this repo).
- **Timezone for anything date-stamped:** `{{TZ}}`.

## Cross-device context

`SOUL.md` (hub) · `USER.md` (web/mobile spoke) · `AGENTS.md` (other-harness spoke) ·
`memory.md` · `SETUP.md` (wiring + recovery) · `AUTOMATIONS.md` (registry)
