# BOOTSTRAP.md — installer protocol

**You, the AI reading this, are the installer.** Your user pointed you at this repo because they want the system it describes — a private, version-controlled context repo that every one of their AI sessions reads first, plus optional automation modules. Your job is to interview them, design their instance, and build it.

Ground rules before anything else:

1. **This public repo is read-only reference.** Never write the user's personal data into it, never fork it into their personal version. You will create a **separate, new, PRIVATE repo** for them.
2. **Never invent facts about the user.** Everything personal comes from the interview. If something wasn't answered, write `{{TODO: ask about X}}` into the generated file rather than guessing.
3. **Adapt, don't assume.** The worked examples here use macOS + iCloud + Claude Code. Those are *examples*. Windows + Dropbox + another assistant is an equally valid target — `docs/sync-options.md` has the decision tables.
4. **Degrade honestly.** If a capability is missing (no always-on machine, no memory MCP connector, no filesystem access), install the documented degraded mode and say so. Never pretend a component exists.
5. **Get approval at the gate.** Do not generate anything until the user approves the system map (Phase 2). Do not enable any automation until it's registered in their `AUTOMATIONS.md`.

Read `ARCHITECTURE.md` next if you haven't — you need the concepts (identity hub-and-spoke, three-layer memory, automation registry) to run this protocol well. Read `GOTCHAS.md` before wiring any automation.

---

## Phase 0 — Platform survey

Establish your own capabilities and the user's environment **before** asking interview questions. Determine (detect what you can, ask what you can't):

| Question | Why it matters |
|---|---|
| Do I (the installer AI) have filesystem + shell access right now? | Gates whether you build files directly or hand the user copy-paste blocks. |
| Which assistants will the user run day-to-day? (Claude Code / Codex / web chat / mobile / multiple) | Determines which context "spokes" to generate (`CLAUDE.md`, `AGENTS.md`, `USER.md`). |
| Can the user create a private GitHub (or equivalent) repo? | The canonical home. Non-negotiable for the full system; a local git repo is the fallback. |
| What OS + cloud file sync exists? (iCloud / Dropbox / OneDrive / none) | Picks the sync topology and symlink strategy — `docs/sync-options.md`. |
| Is there an always-on machine? (desktop that never sleeps, home server, mini PC) | Gates the daily capture loop's scheduler and any recurring automation. |
| Is a persistent-memory MCP connector available? (any "capture/search thoughts" style tool) | Gates memory layer 2 — `docs/memory-layer.md` has the degraded repo-only mode. |
| Can the user deploy a Cloudflare Worker (free tier) or similar? | Gates the mobile daily-note page and the phone widget modules. |
| iPhone with Shortcuts + Scriptable, Android, or neither? | Gates the capture entry point and the widget client. |

Produce a short **capability matrix** from the answers. Every module in `modules/` lists its prerequisites; offer only the modules whose prerequisites are met, and mention the rest as "available later if you add X."

## Phase 1 — Interview

Full question bank with answer→file mappings: `docs/interview-guide.md`. Ask in **batches of 5–7** (never one-at-a-time drip), in this order:

1. **Identity basics** — name / how they want to be addressed; timezone; what they'd like to *name* their AI persona (offer to propose names; default `Assistant` is fine).
2. **Life domains** — the 3–6 areas their work and life actually divide into (job, business, side project, family, health…). These become tracker sections and priority categories. Use *their* words.
3. **Operating style** — how much autonomy the AI gets (the hard-approval list in `docs/governance.md` is the starting point — read it to them, let them edit); pushback appetite; tone preferences; whether they'll ever read the tracker files themselves or interact purely conversationally.
4. **Task model appetite** — full GTD×Scrum (sprint + effort scores + WSJF backlog, see `templates/trackers/TASKS.template.md`) or a simple flat list to start. Recommend starting simple unless they're already systems people.
5. **Key people** — 5–15 names with role/relationship (colleagues, family, clients). Seeds the people tracker; more get added organically.
6. **Module selection** — walk the capability-gated module menu with a one-line pitch each. Get explicit yes/no per module.
7. **Memory + review rhythm** — if a memory MCP exists, confirm capture-by-default is acceptable; pick a weekly-review day.

## Phase 2 — System map approval (hard gate)

Present one screen, no more:

- Private repo name + host + visibility (**private**)
- Sync topology chosen (e.g. "GitHub canonical → Dropbox clone → junctions" or "GitHub only, web sessions read via GitHub")
- Files to be generated (the exact list)
- Modules selected / deferred
- The autonomy contract in three bullets (what the AI may do alone, what always needs approval)
- What will NOT exist yet (degraded modes chosen)

Get an explicit "yes, build it." Then build.

## Phase 3 — Generate the private repo

1. Create the new **private** repo. Confirm visibility before the first push — this repo will hold personal data.
2. Generate every selected file from `templates/`, filling placeholders from interview answers. The full placeholder table is below; prune sections for modules the user declined rather than leaving dead references. **A generated file must never contain a dangling reference to a file you didn't generate.**
3. Copy selected `modules/` code into the repo (e.g. `daily-loop/`, `widget/`, `.github/workflows/` for the CI module — the CI file activates in *their* repo, deliberately not in this one).
4. Adapt all paths to the chosen sync topology (tables in `docs/sync-options.md`): the repo clone location, symlink/junction creation commands in their `SETUP.md`, script env vars.
5. Seed the trackers: domains as sections, the interviewed people into `PEOPLE.md` tiers, 2–3 real starter tasks from the interview into `TASKS.md` — formatted per the file's own conventions.
6. Commit with clean messages. Nothing secret goes in any file: tokens and keys live in platform secret stores (e.g. `wrangler secret put`), never in git.

### Placeholder reference

Every `{{...}}` token used across `templates/` and `modules/`:

| Placeholder | Meaning | Source |
|---|---|---|
| `{{USER_NAME}}` | How the user is addressed | Interview 1 |
| `{{AGENT_NAME}}` | The governing AI persona's name | Interview 1 |
| `{{BUILDER_AGENT_1}}`, `{{BUILDER_AGENT_2}}` | Optional named builder identities per environment | Interview 1 / `docs/governance.md` |
| `{{TZ}}` | IANA timezone (e.g. `America/New_York`) | Interview 1 |
| `{{DOMAIN_1}}` … `{{DOMAIN_N}}` | The user's life/work domains | Interview 2 |
| `{{GITHUB_USER}}` / `{{REPO_NAME}}` | Owner and name of the user's private repo | Phase 2/3 |
| `{{SYNC_ROOT}}` | Absolute path of the cloud-synced folder holding the clone | Phase 0 + `docs/sync-options.md` |
| `{{ALWAYS_ON_HOST}}` | Short hostname of the always-on machine (scheduler guard) | Phase 0 |
| `{{MEMORY_MCP_NAME}}` | The memory connector's tool-name stem | Phase 0 |
| `{{CALENDAR_MCP_NAME}}` | Calendar connector's tool-name stem (daily-loop skeleton) | Phase 0 |
| `{{WORKER_URL}}` / `{{WIDGET_KEY}}` | Deployed Worker URL + its access key | Phase 4 (widget/daily-loop modules) |
| `{{TODO: ...}}` | Anything unanswered — left visibly unresolved, never guessed | — |

## Phase 4 — Wire and verify

Per selected module, follow its `modules/<name>/README.md` install steps. Order: identity repo first, then trackers in use for a few days, then automations. For each automation: **register it in `AUTOMATIONS.md` in the same action that enables it** — the registry rule is the system's spine.

Then run the verification checklist:

- [ ] A fresh AI session pointed at the new repo reads `SOUL.md` → its environment spoke, and can state the user's domains, autonomy contract, and where tasks live — without being told.
- [ ] Every generated file parses (markdown renders, scripts pass `bash -n` / `node --check` / `python3 -m py_compile`).
- [ ] No `{{...}}` placeholder remains except deliberate `{{TODO: ...}}` items, which are listed for the user.
- [ ] `git log` shows clean history; `git grep -iE 'token|api[_-]?key|secret'` in the new repo returns nothing sensitive.
- [ ] Every enabled automation appears in `AUTOMATIONS.md`; every `AUTOMATIONS.md` row corresponds to something real.
- [ ] The user knows the one-line daily entry point ("just talk to your AI; capture things to your inbox") and the recovery doc (`SETUP.md`) exists.

Close by telling the user what got built, what was deferred, and the first thing to try tomorrow morning.
