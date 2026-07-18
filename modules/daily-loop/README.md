# Daily Loop — moved

The daily capture loop now lives in its own repository:

**→ [github.com/LemieuxStrategicSolutions/ContextOS-DailyLoop](https://github.com/LemieuxStrategicSolutions/ContextOS-DailyLoop)**

It graduated out of this module once it could stand on its own: one config file, no
personal paths, pluggable task/memory/calendar adapters, a preflighting installer, sample
data, and 49 idempotency/recovery assertions.

The code is **not duplicated here on purpose**. Two copies of the same thing drift — one
gets fixed, the other doesn't, and months later something unattended runs the stale one.
That's `GOTCHAS.md` #5, and it's the failure this pointer exists to avoid.

## Install it

```sh
git clone https://github.com/LemieuxStrategicSolutions/ContextOS-DailyLoop.git
cd ContextOS-DailyLoop
bin/install.sh --repo <your-context-repo> --sync-root <your-synced-folder> \
               --owner <you> --tz <your/IANA-zone>
```

The installer is idempotent, preflights against your real paths, and schedules nothing —
scheduling stays a deliberate act you take after registering the job in `AUTOMATIONS.md`.

## What it does

```text
phone capture → Inbox/ → [always-on machine, every ~15 min]
   dedup → route by "#prompt:" → summarize → append to daily/YYYY-MM-DD.md
   → reconcile trackers/TASKS.md + bank context to memory → path-scoped commit + push
   → (optional) a Worker renders today's note as a private mobile page
```

The `[always-on machine, every ~15 min]` step is the default, but it's not the only
shape. Where the loop must survive every machine sleeping, capture can be **event-driven**
instead — a small Worker writes the capture straight into the repo, and the push triggers
a hosted CI run in seconds, with no local machine awake. That's the cloud-native tier;
see [`ARCHITECTURE.md`](../../ARCHITECTURE.md#when-you-outgrow-the-always-on-machine-cloud-native-execution).

See [`ARCHITECTURE.md`](../../ARCHITECTURE.md#the-daily-loop-optional-module-but-the-daily-heartbeat)
for where it sits in the system, and `GOTCHAS.md` #1, #2, #3, #8 and #9 before you schedule
anything unattended.
