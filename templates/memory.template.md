# memory.md — how the three memory layers cooperate

{{USER_NAME}}'s context lives in three layers. Use them together.

1. **This repo — durable, organized, versioned.** Identity + structure + strategy as
   organized. Read first. Changes deliberately, via commits.

2. **The memory connector ({{MEMORY_MCP_NAME}}) — living memory.** <!-- prune this whole
   layer if none exists; see the template repo's docs/memory-layer.md degraded mode -->
   Primary persistent memory across sessions and vendors; this repo is its organized
   mirror. When they disagree, **memory + {{USER_NAME}} win** — reconcile, don't
   overwrite.
   - **Search before asking** {{USER_NAME}} to re-explain anything.
   - **Capture by default:** decisions, research, status changes, the non-obvious "why."
     Search first to avoid duplicates; skip ephemera with no future value.
   - **Mirror both ways:** material repo change → capture a note; newer canonical
     strategy in memory → reconcile into the repo via a commit.
   - Connector not enabled in this session? **Say so — never guess at memory.**

3. **The daily note (`daily/YYYY-MM-DD.md`) — today's action surface.** Execution
   surface, not a store. Durable content gets synced out to TASKS.md and memory
   (automatically by the daily loop's sync step, if installed; otherwise by you, in the
   same turn you notice it).

**Verify before relying:** recalled memories reflect what was true when written. If a
memory names a file, flag, or status — confirm it still holds before acting on it.
