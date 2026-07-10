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
2. Set the env (wherever your scheduler sets env for the task):

   ```sh
   DAILY_LOOP_ALLOWED_HOST=<always-on-hostname>   # hostname -s of the primary machine
   DAILY_LOOP_TZ=<your IANA timezone>
   DAILY_LOOP_OWNER="<your first name>"           # how engine prompts refer to you
   DAILY_LOOP_MEMORY_MCP=mcp__claude_ai_<YourMemoryConnector>    # see GOTCHAS #2!
   DAILY_LOOP_CALENDAR_MCP=mcp__claude_ai_<YourCalendarConnector>
   # every path is also overridable: DAILY_LOOP_INBOX/_PROMPTS/_DAILY/_TASKS/_LEDGER/_LOG/...
   ```

3. **Test before scheduling** (both stages, in order):

   ```sh
   # plumbing only — no agent calls, no git:
   DAILY_LOOP_DRY_RUN=1 DAILY_LOOP_ENGINE_STUB=1 bash daily-loop/bin/daily-inbox-processor.sh
   # real engine, still no git — verifies headless MCP names + permissions (GOTCHAS #2):
   DAILY_LOOP_DRY_RUN=1 bash daily-loop/bin/daily-inbox-processor.sh
   ```

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
| `prompts/` | `#prompt:` routing convention + three starter prompts. |
| `worker/` | Optional Cloudflare Worker: today's note as a private mobile page. |
