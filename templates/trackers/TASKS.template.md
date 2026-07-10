# TASKS — canonical task list

<!-- AI-maintained surface. {{USER_NAME}} may never open this file — external surfaces
     (widget, daily note) and sessions parse it, so the conventions below are LOAD-BEARING.
     Installer: if the user chose the SIMPLE model, keep only the Fire convention +
     domain sections + Waiting On/Someday, and delete the sprint/scoring machinery. -->

## Conventions (the file documents itself)

- **Task line format:** `- [ ] **[score] Task title** — context/details. *(Opened M/D/YY)*`
- **Completing:** flip to `- [x]`, ~~strike the title~~, append `*(Completed M/D/YY)*`.
  Never delete history; the weekly review sweeps completed items to `TASKS-ARCHIVE.md`.
- **🔴 Fire convention:** a leading 🔴 on a task means a true fire — time-critical AND
  high-stakes. Fires light up external surfaces (widget turns red), so the bar is high;
  the weekly review demotes anything that's merely important.
- **Effort scores (sprint model):** every sprint task carries either a real date or a
  Fibonacci effort score `[N]` — 1 ≈ 15 min, 2 ≈ 30 min, 3 ≈ an hour, 5 ≈ half a day,
  8 ≈ a full day, 13 = too big, split it.
- **Backlog scoring (sprint model):** an open item in a domain section becomes
  board-ready backlog by carrying `[EvV]` — effort and value, e.g. `[3v8]` = one hour of
  work, high value. Pull highest value-per-effort first. (The widget board reads scored
  items from domain sections; Someday is excluded from all surfaces.)

## 🏃 Sprint <!-- sprint model only -->

### Committed this week
- [ ] **[2] {{TODO: example task from the interview}}** — {{TODO: context}}. *(Opened {{TODO}})*

### {{AGENT_NAME}}'s own tasks
<!-- work the AI owes, so it's visible and auditable -->
- [ ] **[1] Weekly review — sweep, refresh Top 3, reconcile AUTOMATIONS.md** *(recurring, {{TODO: day}})*

### First to drop if the week compresses
- *(move committed items here rather than silently dropping them)*

## {{DOMAIN_1}}
- [ ] **{{TODO: starter task}}** *(Opened {{TODO}})*
- [ ] **[3v8] {{TODO: example scored backlog item}}** — shows up on the widget board ranked by value÷effort. *(Opened {{TODO}})*

## {{DOMAIN_2}}
- *(empty)*

## {{DOMAIN_3}}
- *(empty)*

## ⏳ Waiting on
<!-- name + what + since-when; the AI chases stale rows -->
- *(empty)*

## 💤 Someday
<!-- unscored parking lot; excluded from the widget and daily surfaces -->
- [ ] **{{TODO: example someday item}}**
