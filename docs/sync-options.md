# Sync options — where the clone lives and how devices reach it

The invariant: **the git host is canonical.** Everything else is a working copy. Pick the
topology below that matches the user's platform; the generated `SETUP.md` encodes the
choice.

## Decision table

| You have | Topology | `{{SYNC_ROOT}}` example | Flat-path links |
|---|---|---|---|
| macOS + iCloud Drive | GitHub → clone inside iCloud → symlinks for flat paths | `~/Library/Mobile Documents/com~apple~CloudDocs/AI` | `ln -sf` (relative) |
| macOS/Linux, no cloud drive | GitHub → plain clone in home dir | `~/ai-context` | usually unneeded |
| Windows + OneDrive/Dropbox | GitHub → clone inside the synced folder → junctions | `%USERPROFILE%\Dropbox\AI` | `mklink /J` (dirs) or `mklink` (files; needs admin/dev-mode) |
| Dropbox on macOS | GitHub → clone inside `~/Dropbox/AI` → symlinks | `~/Dropbox/AI` | `ln -sf` |
| Web/mobile assistants only | GitHub only — sessions read via the host's API/UI | n/a | n/a |
| No GitHub at all | Local bare repo + clones (degraded: no web/mobile access, no Workers) | `~/ai-context` | optional |

## Why a cloud-synced clone at all?

Two reasons, both optional:

1. **Capture:** phone tools (shortcuts, share sheets) can drop files into a synced folder
   — that's the daily-loop inbox. No cloud drive → use email-to-file, a synced notes
   app export, or a tiny upload endpoint instead.
2. **Legacy flat paths:** some desktop AI apps read a fixed folder. Symlinks/junctions
   let those apps and the repo share one physical file.

If neither applies, a plain clone is simpler and strictly safer (no symlink clobber
risk — `GOTCHAS.md` #4).

## Rules that hold for every topology

- `git pull` before editing, `git push` after (desktop). Web/mobile sessions edit via
  commits through the host.
- **Never `git push --force`.**
- A desynced clone gets re-cloned, not trusted.
- Two machines editing the same tracker concurrently is normal — small, path-scoped
  commits + rebase pulls keep it painless (the daily-loop processor shows the pattern).

## Symlink setup (macOS/Linux example — parameterize into SETUP.md)

```sh
cd "{{SYNC_ROOT}}"
# flat paths some desktop apps read → repo files, same inode, no copy
for f in SOUL.md CLAUDE.md START-HERE.md AGENTS.md AUTOMATIONS.md; do
  [ -e "$f" ] && [ ! -L "$f" ] && mv "$f" "$f.pre-symlink.bak"   # preserve any real file
  ln -sf "{{REPO_NAME}}/$f" "$f"
done
for f in TASKS.md PEOPLE.md; do
  [ -e "$f" ] && [ ! -L "$f" ] && mv "$f" "$f.pre-symlink.bak"
  ln -sf "{{REPO_NAME}}/trackers/$f" "$f"
done
```

Windows equivalent: `mklink "%CD%\SOUL.md" "%CD%\{{REPO_NAME}}\SOUL.md"` per file (cmd,
admin or developer mode), or junction the whole folder and skip per-file links.

## Known failure modes

- **Atomic-save clobber** (symlink replaced by a real file): `GOTCHAS.md` #4 — detect
  with `ls -la`, reconcile into the repo, re-link.
- **Cloud drive "online-only" placeholders**: iCloud/OneDrive may evict file contents;
  a script then reads a stub. Mark the repo folder "always keep on this device."
- **Sync conflict copies** (`file (Conflicted copy).md`): the git repo is the referee —
  diff against HEAD, fold in what's wanted, delete the copy.
