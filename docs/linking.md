# Linking — wikilinks, backlinks, and the derived index

How a file-first context repo becomes a traversable knowledge graph without a graph
database, and without the maintenance failure that kills most linking schemes.

## The one rule

**You only ever write forward links. The reverse side is generated, never hand-edited.**

A *wikilink* is the forward link you write: `[[Jane Rivera]]`, `[[project-alpha]]`,
`[[2026-05-01-vendor-selection]]`. A *backlink* is the derived reverse view — "everything
that points at Jane." They are one feature, two directions. The moment anyone
hand-maintains a "linked from" list, you inherit the classic failure: **half-maintained
links are worse than none** — agents trust a reverse link that was never updated. So the
reverse side is never stored; a deterministic indexer regenerates it.

## Why this dissolves the "truth migration"

Teams that add backlinks to a markdown system usually conclude the links "need structured,
queryable data" and migrate truth into a database — the highest-risk step in any file-first
architecture. The derived index sidesteps it: **markdown stays truth; the index is a
disposable artifact** that can be deleted and rebuilt at any time. Nothing reads it as a
source of record. The only thing that would ever genuinely force a store is interactive
link *editing* in a UI — rendering, search, and traversal never do.

## How to write links

| Form | Means |
|---|---|
| `[[Jane Rivera]]` | untyped link (default `related-to`) |
| `[[Jane]]` | alias — resolves via the alias file |
| `supersedes:: [[2026-05-01-vendor-selection]]` | typed edge (decision records, mainly) |

Suggested types — use one only when the relationship is real: `caused-by` · `blocked-by` ·
`supersedes` · `depends-on` · `related-to` · `references`. Plain `[[links]]` are the norm;
types earn their keep in decision precedent chains.

**The discipline (belongs in `CLAUDE.md`/`AGENTS.md` so every agent inherits it):** wrap
known entities in `[[...]]` at write time in decision records, task trackers, people
trackers, and session summaries. Don't force it — one link per entity per paragraph is
plenty. Skills/routines that write those surfaces carry the rule in their own instructions.

## The registry is derived too

The set of linkable entities (people, projects, terms, decision slugs, memory slugs) is
extracted from the trackers on every index run — the trackers stay the single source of
truth for *who exists*. Exactly **one hand-maintained file** is allowed: an alias map
(canonical name → alternate surface forms, e.g. `Jane Rivera ← Jane`), plus a stoplist for
observed noise. Caution on aliases: a recurring *transcription error* is not an alias —
resolve it upstream where the error is corrected and flagged, or the index will quietly
launder bad data into good-looking edges.

## Mentions: the archive is covered without retro-editing

The indexer also records plain-text occurrences of registry entities as **weak edges**
("mentions"). This is the load-bearing trick for history: years of notes written before
the linking discipline existed become traversable with **zero retro-editing** — important
where surfaces have single-writer contracts that forbid mass edits (see
`docs/governance.md`). Guard against noise: single-token common names (Jim, Jen) are
excluded from mention scanning unless explicitly promoted; multi-word names are always safe.

Frozen corpora (an export from a retired tool, an old archive) get indexed **once** into a
static layer and merged at read time — no need to re-scan what can never change.

## Integrity: typos surface, they don't rot

- Every `[[target]]` that resolves to nothing lands in an `UNRESOLVED` report. An
  unresolved link is either a typo, a missing registry entry, or a deliberate
  not-yet-created marker — all three are worth seeing.
- A nightly invariant (see the CI module) escalates **only new** unresolved targets and a
  stale index. Success is silent; the report never nags about known markers.
- The indexer is deterministic, stdlib-only, no LLM — same discipline as every other
  invariant check: escalation is a dated report, not a vibe.

## Reference implementation

This pattern runs in production in the private reference instance: a ~230-entity registry
derived from live trackers, explicit links + ~17K mention edges across the repo, a memory-
connector export indexed nightly, and a 5,500-note frozen export from a retired notes app
(including its original `[[link]]` graph) as a one-time static layer. Indexing the full
history took one local run; nothing was retro-edited.
