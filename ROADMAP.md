# Mason framework — availability and roadmap

This is a public framework release, not an app release. Status describes what is
present in this repository, not a certification of any private deployment.

## Available here

- An AI-assisted setup protocol with a plan-and-approval step.
- Templates for shared behavior, environment entry points, owned memory, tasks,
  relationships, and an automation registry.
- Skill templates for capture, decision memos, reviews, and planning.
- Optional widget, CI, and local-model modules, plus companion project pointers.
- Architecture and operational guidance.

Modules need configuration, credentials where applicable, and integration testing.
Their presence does not mean they are enabled or always running.

## Design requirements, not bundled end-to-end features

| Area | Required experience | Evidence needed before claiming completion |
|---|---|---|
| Audio capture | Preserve originals independently of transcription; show saving and failure | Device interruptions, offline capture, restart, replay |
| Transcription | Corrections survive retries; source remains connected | Representative recordings and user quality judgment |
| Prompt actions | Apply saved or built-in prompts without moving text between apps | Source-linked results and repeatable prompt use |
| Follow-through | Confirm proposals into the existing task and decision records | No duplicate tasks; approval and provenance checks |
| Sync | Recover without silently losing or overwriting edits | Multi-device conflicts, offline changes, failed uploads |
| Portability | Export sources, outputs, prompts, and relationships | Restore and provider-switch drills |

The public repository does not currently bundle the audio app, a transcription
service, or the complete integrated experience above.

## Next framework priorities

1. Make a first-session setup understandable and verifiable without a full automation fleet.
2. Extend portable source and output contracts with synthetic fixtures.
3. Make companion compatibility and failure recovery testable.
4. Add evidence-backed integration guides without copying private deployment configuration.

These are priorities, not dated delivery promises. App distribution and app-source
publication require separate decisions.

## Compatibility

The GitHub repository remains `LemieuxStrategicSolutions/ContextOS`.
Existing companion URLs, template placeholders, and module installation paths stay
unchanged. Existing private installations do not update automatically.

When adopting these changes into an existing installation, review the memory and
approval rules as a diff. Do not overwrite personalized instructions or regenerate
a user's workspace.
