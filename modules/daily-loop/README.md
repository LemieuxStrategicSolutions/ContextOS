# Daily Loop — capture → daily note → synced tasks & memory

The daily heartbeat: anything you say or jot on your phone becomes, within ~15 minutes,
a summarized entry in today's note, reconciled task list changes, and banked memory —
with the day's note readable on your phone.

```
phone capture (Shortcut / any tool that writes a text file)
   → <SYNC_ROOT>/Inbox/2026-07-10-0930-memo.md
   → [always-on machine] daily-inbox-processor.sh (every 15 min):
        dedup → route by "#prompt:" → summarize (headless agent call)
        → append to <repo>/daily/YYYY-MM-DD.md
        → SYNC: reconcile trackers/TASKS.md + bank context to the memory connector
        → git commit (path-scoped) + push
   → (optional) Cloudflare Worker renders today's note as a private mobile page
```

## Prerequisites

- A private context repo (built by BOOTSTRAP) with `trackers/TASKS.md` and `daily/`.
- An **always-on machine** with: bash, git (push credentials configured), python3
  (stdlib only), and a headless-capable agent CLI (default: `claude`; any CLI that does
  stdin→text with tool allow-lists can be swapped in via `DAILY_LOOP_CLAUDE`).
- A synced folder the phone can write into (`Inbox/`) — or any other way to land text
  files there (email-to-file, a notes-app export, scp).
- Optional: a memory MCP connector and a calendar MCP connector for the sync step and
  the morning skeleton; both degrade gracefully if absent (set
  `DAILY_LOOP_SYNC_DISABLED=1` / `DAILY_LOOP_SKELETON_DISABLED=1` while testing or if
  you don't have them).

## Install

1. Copy `bin/` into your private repo at `daily-loop/bin/`, and `prompts/*.md` to
   `<SYNC_ROOT>/Prompts/`. Create `<SYNC_ROOT>/Inbox/`.
2. Copy `daily-loop.conf.example` to `<your-repo>/daily-loop/daily-loop.conf` and edit it.
   One file, every setting, all optional — precedence is **environment > config file >
   built-in default**, so a one-off run can override anything without editing the file.

   ```sh
   : "${DAILY_LOOP_ALLOWED_HOST:=my-always-on-box}"   # hostname -s of the primary machine
   : "${DAILY_LOOP_TZ:=America/New_York}"             # daily rollover follows THIS, not the host
   : "${DAILY_LOOP_OWNER:=Sam}"                       # how engine prompts refer to you
   : "${DAILY_LOOP_MEMORY_MCP:=mcp__claude_ai_Memory}"   # headless display name — see GOTCHAS #2!
   ```

   (Setting the env directly in your scheduler still works exactly as before.)

3. **Test before scheduling** (three stages, in order):

   ```sh
   # 1. the module's own suite — idempotency, recovery, routing, guards. No agent, no git:
   bash daily-loop/tests/run-tests.sh
   # 2. your plumbing — no agent calls, no git:
   DAILY_LOOP_DRY_RUN=1 DAILY_LOOP_ENGINE_STUB=1 bash daily-loop/bin/daily-inbox-processor.sh
   # 3. real engine, still no git — verifies headless MCP names + permissions (GOTCHAS #2):
   DAILY_LOOP_DRY_RUN=1 bash daily-loop/bin/daily-inbox-processor.sh
   ```

   Sample captures for stage 2 live in `examples/inbox/` — they cover all three routing
   paths without waiting for a real capture.

4. Schedule it every 15 minutes **as your AI agent's scheduled task** — on macOS do NOT
   use launchd for this (children hang on synced-folder reads; `GOTCHAS.md` #1). Register
   it in `AUTOMATIONS.md` in the same action, state 🧪.
5. Phone capture: an iOS Shortcut that dictates/accepts text and saves it to
   `Inbox/YYYY-MM-DD-HHMM-<label>.md` (date-prefixed names keep processing order and
   date attribution). Android/other: any automation that drops a text file there.
6. Optional second machine: schedule `bin/daily-inbox-fallback.sh` hourly on a laptop —
   it only acts when the primary has clearly missed ≥2 cycles.
7. Optional phone page: `cd worker && npx wrangler deploy`, set the two secrets in
   `wrangler.toml`'s comments, then bookmark `https://<worker>/daily?key=<DAILY_KEY>`
   to the home screen.

## Behavior worth knowing (all deliberate)

- **A capture is never lost:** engine failure/timeout leaves the source file in place
  for the next tick; only success moves it to `Inbox/processed/` (which doubles as the
  raw-text archive) + records the ledger.
- **Raw transcripts never land in the daily note** — summaries only; the raw text lives
  in `processed/`.
- **Model split:** mechanical steps (summarize, skeleton) run on a cheaper model
  (`DAILY_LOOP_ENGINE_MODEL`); the judgment-heavy TASKS.md sync stays on your default.
- **Self-healing:** single-instance lock with stale self-heal; bash-native timeout on
  every agent call; stuck-rebase detection/repair around every git pull; a per-tick
  host health line with a rate-limited self-alert **capture** (the loop reports its own
  host's trouble into the daily note).
- **Path-scoped commits** (`daily/`, TASKS.md, ledger, log) — never `git add -A`.
- The `strip_daily_header.py` / `ledger.py` helpers are args-only files, never stdin
  heredocs (GOTCHAS #8).

## Files

| File | Role |
|---|---|
| `bin/daily-inbox-processor.sh` | The processor (heavily commented — read it). |
| `bin/daily-inbox-fallback.sh` | Second-machine fallback runner. |
| `bin/ledger.py` · `bin/strip_daily_header.py` | Args-only helpers (dedup ledger; skeleton merge). |
| `daily-loop.conf.example` | Every setting in one file. Copy, edit, done. |
| `prompts/` | `#prompt:` routing convention + three starter prompts. |
| `examples/inbox/` | Sample captures covering all three routing paths. |
| `tests/run-tests.sh` | The suite. Pure bash — no framework, agent, network, or git. |
| `worker/` | Optional Cloudflare Worker: today's note as a private mobile page. |

## Tests

```sh
bash tests/run-tests.sh
```

Each test runs the **real processor** against a throwaway sandbox with `DAILY_LOOP_DRY_RUN=1`
and either the built-in engine stub or a fake agent binary, so the plumbing under test is
the real thing rather than a mock of it. What's covered is what an unattended loop lives or
dies on:

- **A capture is never lost** — engine failure *and* empty engine output both leave the
  source file in the inbox, unledgered, for the next tick.
- **Idempotency** — a re-dropped capture doesn't double-post; an empty tick leaves the daily
  note byte-identical.
- **Recovery** — a capture stranded by a failed tick is processed on the next one; a stale
  lock from a crashed run self-heals (and says so in the log) instead of wedging the loop
  forever.
- **Guards** — a live lock makes the tick a no-op, the host guard keeps other machines out,
  housekeeping files are ignored.
- **Routing** — an explicit `#prompt:` is honored; an unknown one falls back to default
  handling and logs that it did.
- **Config precedence** — the config file is read, and the environment still beats it.
