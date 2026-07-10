# SETUP — wiring, new machine, recovery

How this system is physically wired, and how to rebuild any part of it.

## The wiring

- **Canonical:** `{{GITHUB_USER}}/{{REPO_NAME}}` (private), cloned at
  `{{SYNC_ROOT}}/{{REPO_NAME}}`.
- Identity layer at repo root; trackers in `trackers/`; daily notes in `daily/`.
- <!-- keep only if using flat-path links --> Flat paths under `{{SYNC_ROOT}}/` are
  symlinks (or junctions) into the repo — same file, no copy.
- Web/mobile sessions read directly from the git host.

## New machine

```sh
cd "{{SYNC_ROOT}}"
git clone git@github.com:{{GITHUB_USER}}/{{REPO_NAME}}.git   # or via the host's CLI

# Flat-path links (skip if not using them; Windows: use mklink — see the template
# repo's docs/sync-options.md)
for f in SOUL.md CLAUDE.md USER.md AGENTS.md AUTOMATIONS.md; do
  [ -e "$f" ] && [ ! -L "$f" ] && mv "$f" "$f.pre-symlink.bak"
  ln -sf "{{REPO_NAME}}/$f" "$f"
done
for f in TASKS.md PEOPLE.md; do
  [ -e "$f" ] && [ ! -L "$f" ] && mv "$f" "$f.pre-symlink.bak"
  ln -sf "{{REPO_NAME}}/trackers/$f" "$f"
done
```

Then per installed module: see `daily-loop/README.md`, `widget/README.md` in this repo
for their machine-side steps (scheduler entries, secrets).

## If a symlink looks broken

A desktop app's atomic-save can replace a link with a divergent real file.

1. Detect: `ls -la {{SYNC_ROOT}}/SOUL.md` → should show `-> {{REPO_NAME}}/SOUL.md`.
2. If it's a real file: diff against the repo copy, fold wanted edits **into the repo**,
   commit.
3. Re-run the link loop above.

## If the clone desyncs

Don't trust it — re-clone. The git host is canonical. Move the broken clone aside first
(`mv {{REPO_NAME}} {{REPO_NAME}}.broken`), re-clone, then diff for anything unpushed.

## Recovery drill (worth running once)

- [ ] Fresh clone on a spare machine/folder → a new AI session reads it cold and
      correctly states priorities and open tasks.
- [ ] Kill and re-create one symlink.
- [ ] Restore one tracker file from `git log` history.
