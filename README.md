# context-os

**Build your own AI operating system: a private, version-controlled home base that any AI assistant reads first — durable memory, task trackers, automations, and a daily capture loop, all owned by you.**

This is not an app. It's a *pattern*, packaged so an AI can install it for you. You don't follow the instructions — your AI does.

## The one instruction

Clone this repo (or just paste its URL), then tell your AI assistant:

> **"Read `BOOTSTRAP.md` in this repo and set this system up for me."**

Your AI will survey your platform, interview you, show you a system map for approval, and then build **your own private context repo** — adapted to your operating system, your cloud sync, your assistants, and your life. This public repo stays generic; everything personal lands in the private repo your AI creates.

Works with Claude Code, Codex, and any assistant that can read files and follow a protocol. If you open this repo *in* Claude Code or Codex, the root `CLAUDE.md` / `AGENTS.md` shims turn the session into the installer automatically.

## What you end up with

```
                        ┌────────────────────────────┐
                        │   YOUR PRIVATE CONTEXT REPO │  ← canonical, version-controlled
                        │  (GitHub, always private)   │
                        ├────────────────────────────┤
      identity layer →  │  SOUL.md      (behavior)    │  one persona, every environment
                        │  CLAUDE.md / AGENTS.md /    │  per-environment context "spokes"
                        │  USER.md                    │
                        │  memory.md    (memory map)  │
                        │  AUTOMATIONS.md (registry)  │  every loop/cron listed — no silent automations
      operational  →    │  trackers/TASKS.md          │  GTD×Scrum task system (AI-maintained)
                        │  trackers/PEOPLE.md         │  tiered relationship CRM (AI-maintained)
                        │  daily/YYYY-MM-DD.md        │  daily notes from the capture loop
                        └──────────┬─────────────────┘
                                   │ read first by every AI session, on every device
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
  desktop AI sessions       web / mobile AI            optional modules:
  (filesystem access,       (read via GitHub)          • daily capture loop (phone → inbox →
  symlinked into your                                    processed note → auto-synced tasks)
  cloud-drive folder)                                  • phone dashboard widget
                                                       • persistent-memory MCP connector
                                                       • local-LLM drafting worker
                                                       • auto-merge CI for tracker edits
```

Three ideas hold it together:

1. **One durable home.** A private git repo is the canonical identity + memory layer. Every AI session — any vendor, any device — reads it first, so you never re-explain yourself. Full architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md).
2. **The AI owns the paperwork.** Task lists, relationship trackers, and daily notes are surfaces the *AI* reads and writes. You talk; it files. See the tracker templates in [`templates/`](templates/).
3. **No silent automations.** Every scheduled loop on every machine is listed in one registry file, or it doesn't run. See [`templates/AUTOMATIONS.template.md`](templates/AUTOMATIONS.template.md).

## What's in this repo

| Path | What it is |
|---|---|
| [`BOOTSTRAP.md`](BOOTSTRAP.md) | **Start here (or rather: your AI starts here).** The installer protocol. |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | The system design: identity hub-and-spoke, three-layer memory, sync topology, governance. |
| [`GOTCHAS.md`](GOTCHAS.md) | Hard-won operational lessons (read before running anything unattended). |
| [`docs/`](docs/) | Interview question bank, sync-layer options, memory-layer guide, agent governance. |
| [`templates/`](templates/) | `{{PLACEHOLDER}}` skeletons for every file in your private repo. |
| [`modules/`](modules/) | Optional working components: daily capture loop, phone widget, CI, skills, local-LLM worker. |

## Open Knowledge Format (OKF)

The AI-maintained trackers emit [Open Knowledge Format](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) frontmatter, so the private repo your AI builds is a valid OKF bundle out of the box — any OKF-aware tool can read your trackers without a bespoke parser. Each tracker template opens with a small YAML block whose one required field is `type`:

```yaml
---
type: TaskTracker
title: Tasks
description: Canonical AI-maintained task list.
tags: [tasks, gtd, scrum, operational]
timestamp: 2026-01-01T00:00:00Z
---
```

context-os adopts the slice of OKF that pays off at single-operator scale — a machine-readable `type` on the files an agent parses most — and deliberately skips the rest. See [`ARCHITECTURE.md`](ARCHITECTURE.md#interoperability-open-knowledge-format-okf) for exactly where it conforms and where it doesn't, and why.

## Requirements

Bare minimum: a GitHub account and an AI assistant that can read this repo. Everything else — cloud file sync, an always-on machine, a memory MCP connector, Cloudflare Workers — is optional and module-gated. The installer detects what you have and only offers what fits. Non-Mac, non-Claude setups are first-class: see [`docs/sync-options.md`](docs/sync-options.md).

## Privacy model

- **This repo:** generic forever. No personal data, ever.
- **Your repo:** private forever. Your AI is instructed to create it private and keep secrets out of git entirely (tokens live in platform secret stores, never in files).

## License

MIT — see [`LICENSE`](LICENSE).
