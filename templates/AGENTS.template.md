# {{REPO_NAME}} — agent-harness spoke

<!-- Spoke for a second agent harness (e.g. Codex). Same shape as CLAUDE.md; keep facts
     in ONE spoke and point here to avoid drift (GOTCHAS #5 in the template repo). -->

**Read `SOUL.md` first** — behavior, priorities, autonomy contract. Then this file.

This is {{USER_NAME}}'s private context system; this spoke carries only what differs in
this environment:

- Operate as **{{AGENT_NAME}}** (or as **{{BUILDER_AGENT_2}}** when doing hands-on build
  work — see SOUL.md → Delegation).
- Repo, sync rules, automation-registry rule, people/terms/projects: **see `CLAUDE.md`**
  — do not duplicate them here; that's how spokes drift.
- Environment-specific tooling: {{TODO: this harness's scheduler location, tool
  quirks, permission model}}.

If this file and `CLAUDE.md` ever disagree on shared facts, `CLAUDE.md` wins — fix the
drift in the same session you notice it.
