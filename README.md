# Mason: Your Chief of Staff

**Give your AI a reliable place to pick up where you left off—and a clear way to carry work forward.**

Mason is a provider-independent framework for a personal AI chief of staff.
It connects context, capture, decisions, tasks, and review around records you own.
The aim is less copying between apps and less remembering what happens next.

**This repository contains the public framework, templates, and optional modules.**
It is not the Mason app, an app-source release, a hosted service, or a ready-made
cross-device sync service. Setup and connected tools are required.

Previously called **ContextOS**, this framework keeps its existing repository URL
and companion names so links and installations continue to work.

## Start small

Ask a file-capable AI assistant:

> Read BOOTSTRAP.md and help me set up the Mason framework in a separate private
> workspace. Start with context, daily notes, and one task list. Show me the plan
> before creating anything or enabling automations.

The [setup protocol](BOOTSTRAP.md) checks your platform, asks what you need,
and gets your approval before building your private workspace. Browsing this
repository does not install anything. Claude Code, Codex, and other file-capable
assistants can follow the protocol; web/mobile access needs a separately configured
connector. A local Git workspace is enough to start; remote hosting is optional.

Try the [synthetic walkthrough](docs/first-session.md) before connecting real data.

## The everyday experience we are working toward

**Capture → understand → confirm → follow through → review**

- **Capture:** keep the original input and its date, not just an AI summary.
- **Understand:** connect transcripts, summaries, and custom prompt results to their sources.
- **Confirm:** distinguish an idea from a commitment. Let the user confirm changes.
- **Follow through:** update the existing task or decision record, not a second tracking system.
- **Review:** show what changed, what is waiting, and what failed or needs attention.

These are design requirements, not a claim that this repository ships every step.
See [availability and roadmap](ROADMAP.md) for the boundary between templates,
optional integrations, and work still needed.

## What you can use now

| Component | In this repository |
|---|---|
| Shared behavior and permissions | [SOUL template](templates/SOUL.template.md) and environment-specific entry points |
| User-owned continuity | [Memory rules](docs/memory-layer.md), notes, and decision records |
| One task list | [Task tracker template](templates/trackers/TASKS.template.md) |
| Visible routines | [Automation registry template](templates/AUTOMATIONS.template.md) |
| Reusable AI actions | [Skill templates](modules/skills/README.md) for capture, decisions, reviews, and planning |
| Optional extensions | [Modules](modules/) and independently installed companions below |

A template describes behavior; it is not a running service. The installer must
verify each chosen integration and name what is unavailable.

## The principles

1. **Your records come first.** Current user instructions and original records outrank
   older AI interpretations. Search indexes and memory connectors are replaceable.
2. **AI choice stays open.** Keep notes and relationships portable. Every assistant
   still needs explicitly configured access; a subscription alone does not grant it.
3. **Useful context stays connected.** Preserve source links, dates, corrections,
   decisions, and task outcomes.
4. **Approval stays human.** Drafting is not sending. Suggested work is not a commitment.
   External actions and meaningful data changes follow the user's approval rules.
5. **Reliability must be observable.** A saved capture, a processed note, and a synced
   note are different states. Report only the steps that actually succeeded.

Read the [architecture](ARCHITECTURE.md), [governance](docs/governance.md),
and [operational lessons](GOTCHAS.md) before enabling unattended work.

## Optional companions

The existing ContextOS names are compatibility names. These projects have separate
installation and validation instructions; listing them here does not install them.

| Project | Purpose |
|---|---|
| [ContextOS-Decisions](https://github.com/LemieuxStrategicSolutions/ContextOS-Decisions) | Decision records and precedent |
| [ContextOS-AgentRelay](https://github.com/LemieuxStrategicSolutions/ContextOS-AgentRelay) | Scoped AI-to-AI handoffs |
| [ContextOS-ContextCheck](https://github.com/LemieuxStrategicSolutions/ContextOS-ContextCheck) | Context freshness and drift checks |
| [ContextOS-DailyLoop](https://github.com/LemieuxStrategicSolutions/ContextOS-DailyLoop) | Capture processing |
| [ContextOS-RoutineLedger](https://github.com/LemieuxStrategicSolutions/ContextOS-RoutineLedger) | Routine inventory and health |
| [ContextOS-RelationshipOS](https://github.com/LemieuxStrategicSolutions/ContextOS-RelationshipOS) | Relationship follow-through |

## Mason and Reflect Open

This framework defines the context and operating rules. The separately developed
Mason app is an interaction layer built on Reflect Open. Neither that app's source
nor its distribution is included here. This is not an official Reflect Open release
or a claim of endorsement. Contributions to upstream projects follow their own
review and licensing processes.

## Privacy and costs

Keep personal notes in a **separate private workspace**. Never put recordings,
credentials, private histories, or real customer examples in this public repository.
Private storage alone does not prevent disclosure to an AI provider: configure
explicit access and processing boundaries. Private or excluded content must not be
sent through a connector merely because it can read the workspace.

The framework has no subscription requirement of its own. AI usage, storage,
hosting, and automation can incur separate charges. Start with manual operation;
enable only the services you need, with budgets and failure alerts.

## Documentation and contributions

- [Setup](BOOTSTRAP.md) · [Architecture](ARCHITECTURE.md) · [Sync options](docs/sync-options.md)
- [Roadmap and availability](ROADMAP.md) · [Changelog](CHANGELOG.md)
- [Contributing safely](CONTRIBUTING.md)

Small, documented improvements with synthetic examples are welcome. No claims of
universal reliability or transcription quality: those require evidence from the
actual integration and the user's own use.

## License

MIT. See [LICENSE](LICENSE); existing copyright notices are retained.
