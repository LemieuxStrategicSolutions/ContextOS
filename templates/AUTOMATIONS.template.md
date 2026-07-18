# AUTOMATIONS — the registry

**The rule: no silent automations.** Every automated routine, loop, cron, or scheduled
task — on ANY system — is listed here, or it doesn't run. Any AI that creates, edits,
pauses, reschedules, or retires an automation updates this file **in the same action**
(and mirrors the change to the memory connector, if one exists).

Why this file exists: schedulers are machine-local (an agent's scheduled-tasks folder on
one laptop, a cloud routine in one vendor account) and invisible to every other session.
This registry is the one cross-system index — and the kill-switch inventory when
something misbehaves.

**State legend:** ✅ enabled · ⏸ paused · ▶︎ manual-trigger only · 🧪 training mode (new,
watched, not yet trusted)

**Location legend:** ☁️ portable (runs anywhere — hosted runner or any machine) · 🏠
intentionally local (deliberately pinned to one machine — records the reason + kill switch
so the reconciliation pass never flags it as drift). Location is a first-class status: a
routine pinned to one machine *on purpose* is not the same as a routine that only happens
to run there. See `ARCHITECTURE.md` idea #4.

## System 1 — {{TODO: e.g. desktop agent scheduled tasks, per machine}}

| Task | Schedule | State | What it does |
|------|----------|-------|--------------|
| daily-inbox-processor | `*/15 * * * *` ({{ALWAYS_ON_HOST}}) | 🧪 | Processes capture inbox → daily note → task/memory sync. <!-- example row — delete if module not installed --> |
| weekly-review | {{TODO: day}} morning | 🧪 | Sweeps completed tasks, refreshes SOUL Top-3, chases stale waiting-ons, reconciles this registry vs live state. |

## System 2 — cloud routines ({{TODO: vendor}})

| Task | Schedule | State | What it does |
|------|----------|-------|--------------|
| *(none yet)* | | | |

## System 3 — OS-level (launchd / Task Scheduler / cron)

| Automation | System | Cadence | What it does |
|------------|--------|---------|--------------|
| *(none yet — remember GOTCHAS #1 before adding launchd jobs that touch synced folders)* | | | |

## Intentionally-local ledger (🏠)

Routines deliberately pinned to one machine — because their job needs that machine's
filesystem, a local model, a desktop app, or an authenticated session — with the reason
and the kill switch. Listing them here is what keeps the reconciliation pass from flagging
them as drift, and stops "should this be cloud-native?" from being re-litigated every week.

| Routine | Pinned to | Why local (not portable) | Kill switch |
|---------|-----------|--------------------------|-------------|
| *(none yet — e.g. a local-LLM drafting worker: needs the local model endpoint; kill = stop the launch agent)* | | | |

## Maintenance

- Update this file in the same action as any automation change. No exceptions.
- New automations start 🧪 (watched, output reviewed) and graduate to ✅ after a clean
  week.
- Weekly review reconciles registry ↔ live state both directions: unregistered live
  tasks get registered or killed; registered-but-dead rows get fixed or retired.
- Rows keep a short dated history inline when something notable happens (created,
  incident, cadence change) — this file doubles as the audit log.
