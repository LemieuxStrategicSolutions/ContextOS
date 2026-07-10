# Memory layer — the three layers and how they cooperate

The system runs on three memory layers with different half-lives. The generated
`memory.md` in the user's repo encodes these rules for every session to follow.

## Layer 1 — the context repo (durable, versioned)

Identity, structure, strategy-as-organized. Changes deliberately via commits. This is
what makes the system portable across vendors: it's just files in a repo you own.

## Layer 2 — a persistent-memory MCP connector (living, cross-session)

Any MCP tool that offers roughly: **capture** a thought, **search** thoughts by meaning,
**list** recent. Several products and self-hosted options exist (a notes-API bridge, a
vector store with an MCP front end, purpose-built "second brain" connectors — pick one;
the pattern doesn't care). This layer is the *primary* memory for recent decisions and
strategy; the repo is its organized mirror.

Rules (verbatim into the generated `memory.md`):

- **Search before asking.** At the start of meaningful work, search memory rather than
  making the user re-explain.
- **Capture by default.** Bank significant decisions, research, and the non-obvious
  "why" behind changes — without asking permission each time (the user opted into this
  at install).
- **Search before capturing** to avoid duplicate thoughts; don't capture ephemera that
  has no future value.
- **Mirror both ways.** Material repo change → capture a note. Newer canonical strategy
  in memory → reconcile into the repo via a commit. On conflict, **memory + the user
  win** — reconcile, don't overwrite.
- **Verify before relying.** A recalled memory reflects when it was written; confirm a
  named file/status still holds before acting on it.
- **Connector missing in this session?** Say so. Never guess at memory.

Note for automations: the connector's tool names can differ between interactive and
headless sessions — see `GOTCHAS.md` #2.

## Layer 3 — the daily action surface (today only)

`daily/YYYY-MM-DD.md`: today's curated tasks, schedule, and captures, optionally rendered
to the user's phone. An **execution surface, not a store** — anything durable gets synced
out of it into TASKS.md (layer 1) and memory (layer 2) by the daily-loop sync step.
It never wins a conflict; it's downstream of everything.

## Degraded mode: no memory connector

Run repo-only. What changes:

- The trackers and `daily/` notes carry the full memory load; the AI leans on
  `git log` and tracker history for "what happened."
- Add a `decisions/` folder + index to the repo (the decision-memo skill in
  `modules/skills/` writes it) as the durable decision record.
- Sessions state plainly: "no persistent memory here — anything important goes in the
  repo." Honest and workable; upgrade later by adding a connector and turning on the
  capture rules above.
