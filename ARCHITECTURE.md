# ARCHITECTURE — how the system is designed

Five load-bearing ideas. Everything in `templates/` and `modules/` implements one of them.

## 1. One durable home: the private context repo

A private git repo is the **canonical, version-controlled context layer**. Not any one
session's memory, not a vendor's account storage — a repo you own, with history.

- Every AI session, on every device, from any vendor, **reads it first** and then acts.
- Desktop sessions with filesystem access read a local clone; web/mobile sessions read
  the repo through the git host.
- Changes happen deliberately, via commits. `git log` is the audit trail of who (which
  session) changed what and why.

The repo splits into two churn rates:

- **Identity layer** (changes rarely, reviewed like code): `SOUL.md`, per-environment
  context files, `memory.md`, `SETUP.md`, `AUTOMATIONS.md`.
- **Operational trackers** (change daily, committed freely): `trackers/`, `daily/`.

This split matters operationally — see the CI module (`modules/ci/`), which auto-merges
tracker-only changes while leaving identity changes for human review.

## 2. Identity hub-and-spoke

One universal behavior file, plus one thin context file per environment:

```
                     SOUL.md  (the hub)
        persona · priorities · autonomy contract ·
        decision guardrails · delegation · task framework
           ▲               ▲                ▲
           │               │                │
      CLAUDE.md        AGENTS.md         USER.md
   (desktop agent    (other agent      (web/mobile,
    w/ filesystem)    harnesses)        no filesystem)
      each spoke: environment plumbing + facts only
```

- **`SOUL.md`** defines *who the agent is and how it behaves* — everywhere. Persona,
  current top-3 priorities, how the user works with the AI, autonomy hard lines,
  decision guardrails, delegation rules, and the task-management framework.
- **Each spoke** carries only what's environment-specific: tool wiring, sync rules,
  glossary, key-people table, project list. Every spoke's first line is "Read `SOUL.md`
  first."

Why not one big file? Because environments genuinely differ (a filesystem agent needs
symlink rules; a mobile chat needs none), and because **duplicated content drifts** — the
single worst failure mode of multi-environment context. Keep shared facts in the hub or
in exactly one spoke, and let the others point to it.

## 3. Three-layer memory

Full guide: `docs/memory-layer.md`. The short version:

| Layer | What | Changes | Wins conflicts? |
|---|---|---|---|
| 1. Context repo | Durable, organized, versioned context | Deliberately, via commits | Canonical for identity/structure |
| 2. Memory MCP connector | Living cross-session memory: capture thoughts, search by meaning | Continuously, automatically | Canonical for recent strategy/decisions |
| 3. Daily action surface | Today's note: tasks for the day, schedule, captures | Every capture | Never — it's an execution surface, not a store |

Standing rules the generated `memory.md` encodes: **search memory before asking the user
to re-explain**; **capture significant decisions by default**; **mirror major updates
both ways** (repo ↔ memory); **verify recalled facts still hold before acting on them**.
No memory connector? Run repo-only mode: the trackers and daily notes carry more weight,
and the AI says "I don't have persistent memory here" instead of guessing.

## 4. No silent automations

The rule: **every automated routine on every machine is listed in one registry file
(`AUTOMATIONS.md`) or it doesn't run.**

Scheduled tasks tend to live machine-local (a scheduler directory on one laptop, a cloud
routine in one vendor account) — invisible to every other session. The registry is the
cross-system index: any AI that creates, edits, pauses, reschedules, or retires an
automation updates the registry **in the same action**. A weekly reconciliation pass
compares the registry against live state and flags drift both ways.

This is the difference between "a helpful set of loops" and "an unauditable swarm."
It's also your kill switch inventory when something misbehaves at 3am.

## 5. Governed delegation

Full guide: `docs/governance.md`. One governing persona (`{{AGENT_NAME}}`) owns judgment,
memory, and synthesis. Optional named builder identities (per environment, or a cheap
local-LLM drafting worker) do scoped work under it. The non-negotiable clause, verbatim
in every identity file:

> A subordinate identity may develop personality, taste, and working style — but may
> **not** self-expand its authority, tools, credentials, memory/task-system access,
> external access, or irreversible-action rights. Expansion requires the user.

Plus a short **hard-approval list** (publish, purchase, contact someone, delete,
credentials) that no automation or persona may cross without the user.

---

## Sync topology (the worked example)

The pattern, instantiated here with macOS + iCloud (other stacks: `docs/sync-options.md`):

```
GitHub (canonical, private)
   │  git clone
   ▼
~/CloudDrive/AI/your-context-repo        ← the working clone, inside the synced folder
   │  symlinks (or junctions on Windows)
   ▼
~/CloudDrive/AI/SOUL.md → your-context-repo/SOUL.md    ← legacy/flat paths some desktop
~/CloudDrive/AI/TASKS.md → your-context-repo/trackers/TASKS.md   apps read; same file, no copy
```

Rules that keep it sane (encoded in the generated `SETUP.md` and spokes):

- **The git host is canonical.** A clone that desyncs gets re-cloned, not trusted.
- Desktop sessions: `git pull` before editing, `git push` after. Web/mobile: edit via
  commits through the host.
- **Never `git push --force`.** Never silently clobber another session's work.
- Edit identity files at the repo path or via tools that preserve symlinks. Desktop apps
  that "atomic-save" replace a symlink with a divergent real file — the #1 sync failure
  (detection and repair in `GOTCHAS.md`).

## The daily loop (optional module, but the daily heartbeat)

```
phone / any capture tool
   → drops a text file in  <synced>/Inbox/
   → always-on machine runs the processor every ~15 min:
        route by "#prompt:" tag → summarize (headless AI call)
        → append to  daily/YYYY-MM-DD.md
        → sync step: reconcile against trackers/TASKS.md + bank context to memory
        → git commit + push
   → (optional) Cloudflare Worker renders today's note as a private, key-gated mobile page
```

The capture inbox lives *outside* the repo (where phone tools can write); the published
daily notes live *inside* it (so web sessions and Workers can read them). Working code
and hardening details: `modules/daily-loop/`.

## Trust boundaries and secrets

- The private repo holds personal context — **never** credentials. Tokens live in
  platform secret stores (Worker secrets, OS keychains). `.gitignore` blocks the common
  accidents.
- Web-facing surfaces (daily page, widget) authenticate with a shared key over HTTPS and
  read the repo via a **read-only, single-repo** fine-grained token stored as a Worker
  secret.
- Unattended AI calls run with **explicitly enumerated tools only** (details and traps in
  `GOTCHAS.md`).

## Interoperability: Open Knowledge Format (OKF)

[OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) is
Google Cloud's vendor-neutral spec (v0.1) for handing curated context to AI agents: a
directory of markdown files, each with a YAML frontmatter block whose one required field
is `type`. context-os predates OKF but lands on the same shape — a versioned directory of
markdown that both humans and agents read — so conforming is nearly free, and it lets any
OKF-aware tool consume a generated repo without a custom parser.

**Where it conforms.** The three AI-maintained trackers (`TASKS`, `PEOPLE`, `TEAM`) carry
OKF frontmatter (`type` + `title`/`description`/`tags`/`timestamp`) — these are the files
an agent parses programmatically most often, so a machine-readable `type` has real payoff.
The daily notes (`daily/YYYY-MM-DD.md`) already behave like OKF's chronological log; the
cross-links between identity files already form OKF's navigable concept graph.

**Where it deliberately doesn't.** OKF prefers one small concept file per idea. The
identity layer stays **monolithic and read-first** instead — `SOUL.md` and each spoke are
read whole at the top of every session, and fragmenting them into one-concept-per-file
would trade the thing that makes a read-first chief-of-staff agent reliable for interop
this system doesn't need (it's private-forever and single-operator). OKF's reserved
filenames (`index.md`, `log.md`) and bundle-publishing conventions are likewise skipped.
The governing rule: **adopt the slice of any external standard that improves reliability
or interop at your actual scale; ignore the rest.**
