# Phone dashboard widget

A glanceable home-screen widget showing what needs your attention, parsed **live** from
`trackers/TASKS.md` + the Top 3 in `SOUL.md`. Tapping it opens a swipeable scrum board
(Backlog / This Sprint / Waiting / Done) built from the same file.

```
┌──────────────────────────────┐
│ MY OS               ↻ 6:41am │
│ 🚨 Fires (2)         41 open │
│ • Renew the thing — due Fri  │
│ • Client X — proposal reply  │
│ 12 Work      9 Side project  │
│  7 Family    5 Health        │
└──────────────────────────────┘
```

## How it works

```
 phone (Scriptable widget)            Cloudflare Worker              git host (private)
 ─────────────────────────           ──────────────────            ──────────────────
 GET /dashboard?key=SECRET  ───────▶  verify key                    trackers/TASKS.md
 renders fires/counts/Top3  ◀───────  fetch + parse (token) ◀─────  SOUL.md
```

- The repo stays **private**. The GitHub token lives only as a Worker secret — never on
  the phone, never committed anywhere.
- The endpoint is gated by a shared `WIDGET_KEY`. No key → 401.
- Worker edge-caches 5 min; tapping sends `&fresh=1` to bypass.
- The parser understands the TASKS.md conventions from
  `templates/trackers/TASKS.template.md`: 🔴 leading-marker fires (with waiting-item and
  excluded-section rules), `[N]`/`[EvV]` scores, the sprint H3 lanes, and the SOUL Top-3
  block with its "Last refreshed" staleness flag. If you customize the tracker format,
  update the regexes at the top of `worker/src/index.js`.

> **Refresh reality:** iOS decides when widgets reload (~15–60 min). Not a live ticker;
> tapping always pulls fresh.

## Prerequisites

GitHub-hosted private repo · Cloudflare account (free tier) · iPhone with Scriptable
(Android: any widget app that can render JSON from a URL can replace the client — the
Worker API is just JSON).

## Setup (~10 min)

1. **GitHub token:** fine-grained PAT — resource = your account, repository access =
   *only* your private context repo, permissions = **Contents: Read-only**.
2. **Deploy the Worker:**

   ```bash
   cd widget/worker
   npm install
   npx wrangler login
   # edit wrangler.toml [vars] first (GITHUB_REPO etc.), then:
   npx wrangler deploy
   npx wrangler secret put GITHUB_TOKEN   # the PAT from step 1
   npx wrangler secret put WIDGET_KEY     # e.g.: openssl rand -hex 24
   ```

3. **Install the client:** paste `scriptable/os-widget.js` into Scriptable, fill in the
   three constants at the top, add a Medium or Large widget pointing at it.
4. Sanity-check in a browser: `https://<worker>/dashboard?key=<WIDGET_KEY>` returns
   JSON; `/board/view?key=…` renders the board.

## Keeping fires honest

The widget is only as truthful as the 🔴 markers. Pair it with a periodic "fire curator"
automation (registered in `AUTOMATIONS.md`) that demotes anything marked 🔴 that isn't
truly time-critical + high-stakes — otherwise everything creeps to red and the widget
stops meaning anything.
