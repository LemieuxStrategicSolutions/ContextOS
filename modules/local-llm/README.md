# Local-LLM drafting worker

A small local model (via [Ollama](https://ollama.com)) as the cheapest tier of your
delegation stack: raw-material drafting that costs zero tokens and never leaves the
machine.

## The routing policy (the part that matters)

**Good fit — route here first:** drafts, variants, hooks, names, subject lines,
objections, premortem raw material, outlines, checklists, second opinions. Low-stakes
text where you want *quantity to react to*.

**Never route here:** sensitive personal/client data, final judgment, final public
voice, anything needing live tools or web access, memory/tracker writes, external
actions, credentials.

**The curation rule (non-negotiable):** raw local-model output is **never surfaced as
final.** Your main AI persona curates it — picks, cuts, rewrites into the user's voice —
before anyone sees it. The local model produces clay, not pottery.

Honest scoping from production use: the payoff is **interactive** drafting. Scheduled
automation fleets are a *poor* fit (they tend to need live tools, accuracy, or touch
sensitive data). Don't build your loops on this.

## Setup

```sh
# 1. Install Ollama, pull a small instruct model (any ~8B works):
ollama pull llama3.1:8b
# 2. Keep it served (macOS: a launchd KeepAlive job running `ollama serve` is fine
#    HERE — it never touches cloud-synced folders, so GOTCHAS #1 doesn't apply.
#    Linux: a systemd service.)
# 3. Test the wrapper:
bin/local-draft.sh "10 subject lines for a newsletter about backyard beekeeping"
```

Give the worker an identity: name it in `SOUL.md` → Delegation with the most restricted
charter (see `docs/governance.md`), so every session knows what it may and may not be
handed. Register the keep-alive service in `AUTOMATIONS.md`.

If your assistant supports skills, wrap the routing policy + reachability check +
mandatory curation pass into a skill (e.g. `local-draft`) so "draft me 10 hooks" routes
correctly by habit.
