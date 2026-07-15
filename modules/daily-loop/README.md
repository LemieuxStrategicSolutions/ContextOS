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

Run the installer. It's idempotent, non-interactive, never clobbers a config or prompt
you've tuned, and **schedules nothing** — see `--dry-run` first if you like.

```sh
bin/install.sh --repo ~/path/to/your-context-repo \
               --sync-root ~/path/to/your/synced-folder \
               --owner Sam --tz America/New_York \
               --memory-mcp mcp__claude_ai_Memory \
               --calendar-mcp mcp__claude_ai_Google_Calendar
```

It creates the directories, installs the processor and prompts, writes
`daily-loop/daily-loop.conf`, drops in the sample captures, and then **preflights**: it runs
the module's test suite and a stubbed dry run against *your* paths, and refuses to claim
success if either fails. `--help` lists every flag; `--memory-mcp ""` declares you have no
memory connector.

Then, in order: verify your connectors resolve in a **headless** call
(`DAILY_LOOP_DRY_RUN=1 bash daily-loop/bin/daily-inbox-processor.sh` — this is GOTCHAS #2
and the single most common silent failure), register the job in `AUTOMATIONS.md`, and only
then schedule it every ~15 min as your AI agent's own scheduled task.

### Configuration

Everything lives in one file, `daily-loop/daily-loop.conf` (annotated reference:
`daily-loop.conf.example`). Precedence is **environment > config file > built-in default**,
so a one-off run overrides anything without editing the file. Setting the env directly in
your scheduler still works exactly as before.

### Adapters

The loop talks to three things you might do differently: a **task list** (a Markdown file it
edits), a **memory connector**, and a **calendar connector**. Both connectors are addressed
by name *and by verb* —

```sh
: "${DAILY_LOOP_MEMORY_MCP:=mcp__mem0}"
: "${DAILY_LOOP_MEMORY_CAPTURE_TOOL:=add_memory}"     # yours may not say "capture_thought"
: "${DAILY_LOOP_MEMORY_SEARCH_TOOL:=search_memory}"
```

— because naming the connector while hardcoding its vocabulary is what makes a loop portable
in theory and broken in practice. Set a connector to `""` and its tools drop out of the
allow-list entirely rather than being passed as dangling names that match nothing.

### Scheduling

Once the preflight passes and the job is registered in `AUTOMATIONS.md` (in the same action
— no silent automations), schedule the processor every ~15 minutes **as your AI agent's own
scheduled task**. On macOS do **not** use launchd for this: its children hang forever on
cloud-synced reads (`GOTCHAS.md` #1). Start it in state 🧪.

### Capture and the optional extras

- **Phone capture:** an iOS Shortcut that dictates or accepts text and saves it to
  `Inbox/YYYY-MM-DD-HHMM-<label>.md`. The date prefix is load-bearing — it sets processing
  order and decides which day's note the capture lands in. Android or anything else: any
  automation that drops a text file there works.
- **Second machine (optional):** schedule `bin/daily-inbox-fallback.sh` hourly on a laptop.
  It only acts when the primary has clearly missed ≥2 cycles.
- **Phone page (optional):** `cd worker && npx wrangler deploy`, set the two secrets named in
  `wrangler.toml`'s comments, then bookmark `https://<worker>/daily?key=<DAILY_KEY>` to your
  home screen.

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
| `bin/install.sh` | The installer. Idempotent, preflights, schedules nothing. |
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
