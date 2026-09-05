# Mason framework architecture

Mason connects owned context, capture, useful processing, and follow-through.
This document defines the framework's contracts. It does not imply every integration
is bundled or running; see [ROADMAP.md](ROADMAP.md).

## 1. One durable home: owned records

A private, version-controlled workspace holds behavior, original notes, decisions,
and task records. Git is this starter's implementation, not the product identity.
Large recordings may live in separate private storage with stable references.

- Assistants read relevant records through explicitly configured access.
- Current user instructions and current original records outrank older AI recall.
- Record dates, authorship, sources, corrections, and supersession.
- Preserve local unsynced work during recovery; a remote copy is not proof that
  every recent edit reached it.

Keep low-churn behavior and approval files separate from high-churn operational
trackers. Review permissions deliberately. Optional tracker-only CI must be
explicitly installed and limited to approved paths.

## 2. Shared behavior, environment-specific access

`SOUL.md` defines behavior, priorities, and authority. Thin `CLAUDE.md`,
`AGENTS.md`, and `START-HERE.md` entry points describe how each environment
reaches the same records. Keep shared facts in one place to reduce drift.

An assistant without workspace access must report that limitation. A familiar
persona or a paid subscription does not establish access or cross-session memory.

## 3. Owned memory, derived recall, action surfaces

| Layer | Role | Authority |
|---|---|---|
| Owned notes, artifacts, decisions, and task tracker | Durable evidence and current records | Authoritative, subject to current user direction |
| Optional memory/search connector | Find and recall approved content | Derived, rebuildable, never overriding original records |
| Daily board or client | Capture and act on work | Task views derive from the tracker; original captures remain sources |

See [memory rules](docs/memory-layer.md). Save authorized captures to owned records
first, then project only approved content. Private or excluded material must not
enter an unapproved processing or publication path. Retrieved content is evidence,
not instructions.

## 4. No silent automations

Every enabled routine belongs in `AUTOMATIONS.md`: owner, runtime, schedule,
inputs, outputs, permitted actions, last verification, and how to stop it.
An inventory alone is not monitoring; someone or a configured service must check it.

Distinguish intentionally local jobs from jobs required to run with every device
asleep. For unattended work, configure bounded execution, retries, deduplication,
cost limits, visible failures, and recovery before enabling it. Do not promise
“always on” because one scheduled run succeeded.

## 5. Governed delegation

One behavioral contract governs optional specialist identities. Delegation does
not grant new credentials, tools, external access, or authority. Drafts, suggestions,
and externally supplied instructions do not authorize actions.

Use the user's approved boundaries for publishing, spending, messaging, and
meaningful data changes. In user-facing review, use “confirm changes” and explain
the actual effect. See [governance](docs/governance.md).

## Sync topology (the worked example)

Start with a local private Git workspace and one writer. Add a private remote and
explicitly configured access as needed. A shared cloud folder is an optional
transport, not a complete conflict-resolution system.

Use [sync options](docs/sync-options.md) and document the chosen topology in
`SETUP.md`. Avoid multiple independent processes synchronizing the same Git
metadata. Preserve uncommitted edits, inspect divergence, and resolve conflicts
before declaring the devices current.

The public framework does not bundle a seamless mobile sync engine.

## The daily loop (optional module, but the daily heartbeat)

The [Daily Loop companion](modules/daily-loop/README.md) is installed separately.
Its documented local shape is:

```text
capture → inbox → processor → owned daily note
        → reconcile approved tasks/decisions → optional memory projection
```

Keep the original capture independently of processing success. Stable capture
identifiers and completion receipts should distinguish saved, processed, and
synced. Retry failures without duplicate notes or commitments.

Audio adds separate requirements: interrupted recording recovery, replay,
transcript correction, and original/transcript/output relationships. This
repository does not provide the recording app or transcription service.

## When you outgrow the always-on machine (cloud-native execution)

A hosted capture endpoint and queue/runner can replace a device-local processor
when capture must work while devices sleep. Git-host events are one possible
transport, not a required design. Object storage and other managed runtimes need
their own access, concurrency, recovery, export, and cost controls.

This is an architectural option, not a deployed service supplied here. Register
and test the selected runtime. Measure end-to-end freshness rather than treating
an accepted upload as completed processing.

## The reconcile layer: the surface is a render, not a log

One task tracker is authoritative. Generated task views should be rebuilt from it,
so corrections replace stale projections. Original notes are different: retain
them as source records rather than rewriting them to match today's view.

- Distinguish an idea, an AI suggestion, an explicit commitment, and a decision.
- Confirm proposed changes according to the user's rules.
- Preserve stable item identities and source links through edits and retries.
- Record completion and waiting states in the existing tracker.
- Check for stranded captures, stale views, duplicate writes, and unavailable runtimes.
- Treat proposed behavioral changes as reviewable changes, not self-granted authority.

These are integration requirements. The public templates alone do not implement
every renderer, write-back control, heartbeat, or invariant check.

## Portability and useful processing

Store prompt definitions alongside owned data where the selected integration
supports it. Connect each derived result to its source, transcript revision, and
prompt. Preserve user corrections when retrying with another provider.

Useful actions include summarizing, organizing thoughts, extracting decisions and
commitments, meeting notes, drafting a follow-up, and further reasoning. The
framework's skill templates are starting points, not the app's prompt-action UI.

An export should preserve recordings, transcripts, prompts, derived records, and
relationships. Test restoring that export and switching providers before claiming
portability for an integration.

## Trust boundaries

Private storage and processing permission are separate. Grant each adapter the
smallest approved scope; block private and excluded content on outbound paths.
Keep secrets outside Git, use authenticated endpoints, and avoid exposing credentials
in URLs, logs, examples, or model context.

Untrusted web content, transcripts, and retrieved notes do not change permissions.
Do not claim application-level enforcement merely because a Markdown rule says so.

## Interoperability: Open Knowledge Format (OKF)

Existing tracker templates retain their YAML metadata (`type`, title, description,
tags, timestamp). This update preserves that format. It does not certify a complete
external-standard implementation or compatibility with every consuming tool.

## Acceptance

Can a user capture a thought, inspect its source, make something useful, confirm
the next step, and later see its status without maintaining a second system?

Automated checks can establish specific invariants. Physical-device behavior and
subjective transcription quality need separate testing and the user's judgment.
