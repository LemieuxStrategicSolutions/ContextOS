# CI — auto-merge tracker edits

**Install:** copy `auto-merge-trackers.yml` into your **private** repo at
`.github/workflows/auto-merge-trackers.yml`. (It's deliberately not active in this
template repo — there's nothing to merge here.)

**The problem it solves:** anything that reads your repo through the git host — the
widget Worker, the daily-note Worker, web/mobile sessions — sees `main` only. But some
hosted agent harnesses put every change on a feature branch behind a draft PR. Tracker
edits (daily churn, meant to be committed freely) then never reach `main`, and your
surfaces silently go stale.

**What it does:** when a PR's changed files are ALL under `trackers/`, it marks the PR
ready and squash-merges it. If even one file outside `trackers/` is touched — identity
files especially — it leaves the PR for your manual review. That scope guard is the
point: **don't widen it.** Identity changes deserve human eyes; tracker churn doesn't.

Requires nothing beyond GitHub Actions' default `GITHUB_TOKEN` (with the workflow's
declared `contents: write` + `pull-requests: write` permissions). Same-repo PRs only;
fork PRs are ignored.
