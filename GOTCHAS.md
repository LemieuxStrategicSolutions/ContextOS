# GOTCHAS — operational lessons, learned the hard way

Read this before wiring anything unattended. Every item below cost real debugging time
in a production instance of this system. Installer AIs: several of these change *how*
you install, not just how you troubleshoot.

## 1. macOS: launchd + cloud-synced folders = silent hangs

macOS grants Full Disk Access **per binary**. A launchd job running `bash` may have FDA,
but its children (`git`, `python3`, the AI CLI) do not — and when they touch an
iCloud-synced path they don't error, they **hang forever**.

**Fix:** on macOS, run recurring loops as the AI agent's own scheduled tasks (children
inherit its disk access) instead of launchd. Keep launchd only for plain system services
that never touch synced folders (e.g. a local LLM server, a process watchdog that logs
to a non-synced path).

## 2. Headless agent calls: tool naming and permissions differ from interactive sessions

Two traps that silently block every unattended tool call:

- Interactive desktop sessions may expose an MCP connector as `mcp__<uuid>__toolname`;
  the same connector in a **headless CLI call** is named by *display name*, e.g.
  `mcp__claude_ai_<ConnectorName>__toolname`. Allow-listing the UUID form in a cron job
  allows nothing.
- Tool allow-lists are **comma-separated, not space-separated** in some CLIs. A
  space-separated list fails without an error message.

**Fix:** test the exact headless invocation by hand once, with a stub prompt, before
scheduling it. Log tool-permission denials somewhere you'll see them.

## 3. Stuck permission prompts → process pileup → machine death

An unattended AI session that hits an unanswerable permission prompt doesn't crash — it
**waits forever**, holding memory. Schedule it every 15 minutes and you accumulate
dozens of zombie sessions until swap exhausts and the machine goes dark.

**Fixes, layered:**
- Launch unattended runs with an explicit permission mode and a complete tool allow-list
  so no prompt can occur.
- Wrap every headless AI call in a **timeout watchdog** (the shipped processor has a
  bash-native one — macOS lacks GNU `timeout`).
- Run an hourly **process watchdog** that kills agent processes older than N minutes
  (generous N on machines that also run interactive sessions, so it never kills a human's
  live session).

## 4. Desktop editors clobber symlinks ("atomic save")

Many editors save by writing a temp file and renaming it over the target. If the target
was a **symlink** into your repo, the rename replaces the link with a divergent real
file. The repo copy and the "same" file now silently disagree.

**Detect:** `ls -la <path>` should show `-> your-repo/...`. A regular file there means a
clobber happened.
**Repair:** diff, reconcile wanted edits into the repo copy, re-create the link.
**Prevent:** edit at the repo path, or via agents/tools that write through symlinks. The
generated `SETUP.md` includes the re-link script.

## 5. Multi-environment context files drift

If two per-environment context files each carry a copy of the same facts (people,
projects, glossary), they **will** diverge — one gets updated, the other doesn't, and six
weeks later an AI acts on stale reality.

**Fix:** keep shared behavior in the hub (`SOUL.md`); keep each fact in exactly one place
and point at it. Where duplication is unavoidable, add a standing weekly-review item to
reconcile spokes.

## 6. Remote/cloud agent sessions strand changes on branches

Some hosted agent harnesses force every change onto a feature branch behind a draft PR.
Daily-churn tracker edits then never reach `main` — and anything that reads `main` (a
Worker, a widget, other sessions) sees stale data indefinitely.

**Fix:** the CI module (`modules/ci/auto-merge-trackers.yml`) auto-squash-merges PRs
that touch **only** tracker paths. Identity-file changes still wait for human review.
The scope guard is the point — don't widen it.

## 7. Locks, timeouts, and self-healing for unattended git

Unattended loops sharing a working tree with humans hit: overlapping runs, stale locks
after crashes, and stuck rebases from conflicting pushes. The shipped processor shows the
pattern set:

- **Single-instance lock** via atomic `mkdir` (works on stock macOS where `flock` is
  absent), with stale-lock self-heal after a deadline.
- **`git pull --rebase` wrapped in a self-healer** that finalizes clean-but-unfinished
  rebases and aborts conflicted ones (an unattended job must never sit in a half-rebase).
- **Path-scoped `git add`** — commit only the files the loop owns, never `git add -A`,
  so a concurrent human session's work-in-progress is never swept into a robot commit.

## 8. Capture pipelines need a dedup ledger AND a physical move

If the inbox processor crashes mid-run, are captures reprocessed (duplicates) or lost?
Do both: **move** each processed file to `processed/` (the hard guard — also your raw
archive) and record it in a **JSON ledger** (the audit trail). On any failure, leave the
source file in place — a capture must never be lost to a timeout.

Related: in some schedulers, `python3 - <<HEREDOC` (reading a script from stdin) hangs.
Ship helper scripts as real files taking **arguments only** — never stdin.

## 9. Timezones in anything date-stamped

An always-on machine may run in UTC while the user lives elsewhere; a "daily" note that
rolls over at midnight UTC splits the user's evening across two files. Pin the loop's
timezone explicitly (`{{TZ}}`, IANA name) — never trust the host default.

## 10. Cost control for scheduled AI fleets

Scheduled AI runs multiply quietly: N tasks × M runs/day adds up. Lessons from a real
usage audit:

- Route **mechanical** steps (summarize, reformat) to a cheaper model tier explicitly;
  reserve the default/expensive tier for judgment steps (the shipped processor does this
  split).
- Replace "an AI call that always does the same thing" with plain bash — a fixed daily
  checkbox needs zero tokens.
- Review the automation registry quarterly and cut what you don't read. A registry row
  that says "▶︎ manual" is cheaper than a ✅ nobody benefits from.
- A **local LLM worker** (see `modules/local-llm/`) is good for interactive raw-material
  drafting, but a *poor* fit for scheduled fleets — those tend to need live tools,
  accuracy, or touch sensitive data.

## 11. Keep the public/private line absolute

The context repo is private and holds personal data; keep it that way — check visibility
before the first push, and never let a public artifact (like a template repo you share)
be generated *from* private files by copy-editing. Write public docs fresh; grep-sweep
for names, emails, phones, UUIDs, and secret-shaped strings before any public push.

## 12. A side-effect log is not a heartbeat

If a machine's only evidence of life is a log written by some *other* job (a capture
processor, a sync loop), retiring or moving that job silently blinds you to the machine.
Worse: a dead machine cannot report that it is dead — liveness must be *checked from
somewhere else*, and the beat must be independent of every workload it vouches for. In
practice this failure looks like two sessions confidently disagreeing about whether an
always-on box is even awake, with no way to settle it.

**Fix:** give each always-on machine a dumb, dedicated beat — no LLM, no git: a tiny
`launchd`/cron job that snapshots which services are up (`launchctl list`, a loopback
curl) and POSTs one line to an endpoint you already authenticate to (a capture worker
with a shared key works well — no new credentials, and it dodges gotcha #1 because the
beat never touches a synced path). Then have a *cloud-side* check escalate when a beat
goes stale.

## 13. Append-only surfaces drift from their ledger

When a daily surface (board, dashboard, note) is authored once and then *appended to* by
every later event, corrections pile up next to the lines they supersede — the operator
reads a stale line and a fresh contradiction side by side while the underlying tracker
file is perfectly correct. No writer is wrong; the architecture is: nothing is
authoritative at read time. The companion failure: if the surface is read-only, item
*closure* is unobservable, so you cannot distinguish "done" from "dropped" — and
"nothing falls through" becomes unprovable rather than false.

**Fix:** pick one file as the item ledger, give items stable IDs, and make the surface a
**deterministic render** of the ledger — re-derived on every change, never appended to. A
correction then *replaces* its stale line structurally. Close the loop by making the
surface writable (a tap posts `done:<id>` back to the ledger); once closure is recorded,
"fell through" becomes a measurable defect a nightly check can escalate, instead of a
feeling. Keep both the renderer and the checks plain code — zero tokens, any AI or none.

## 14. Prove single-writer before a shadow→live cutover

Running a cloud twin in shadow mode next to a live local task is the right migration
pattern — but the cutover moment ("flip the twin live, disable the local task in the
same change") silently assumes you know about *every* live writer. A forgotten second
machine running the same task fleet means the flip creates a double-writer instead of
retiring one.

**Fix:** before flipping, check the *output's* history, not the task registries: if two
writers were ever live on the same file, the file's git log shows duplicate same-day
commits. No duplicates across the full history = provably one writer. Cheap, and it
catches writers no registry knows about. (And keep the flip atomic: enable cloud +
disable local in one change, never two.)
