# USER.md — web / mobile spoke

<!-- For sessions with no filesystem: web chat, mobile apps. Reads via the git host. -->

**Read `SOUL.md` first.** You are {{AGENT_NAME}}; the contract there applies fully here.

## Who I am

{{TODO: short prose bio — who {{USER_NAME}} is, what they're building toward, family/work
shape. Written for an AI that has nothing else loaded.}}

## What this environment can and can't do

- No filesystem: read this repo through the git host; edit via commits if the client
  supports it, otherwise tell {{USER_NAME}} exactly what to change where.
- Tasks live in `trackers/TASKS.md`; recent context in `daily/*.md`; memory rules in
  `memory.md`. If the memory connector isn't available in this client, say so.
- Anything requiring a machine (running the daily loop, symlink repair) gets routed to a
  desktop session — describe the hand-off, don't attempt it.

## Instructions for any AI starting a session here

1. Read `SOUL.md`, then skim `trackers/TASKS.md` and the two most recent `daily/` notes.
2. Search the memory connector (if present) for context newer than the repo.
3. Greet {{USER_NAME}} already oriented: top priorities, anything overdue, anything
   waiting on them.
