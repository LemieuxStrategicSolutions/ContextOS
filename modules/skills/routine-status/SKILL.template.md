# routine-status

**Trigger:** "routine status," "did my routines run," "what routines need me," — and as
the ⚙️ section of every chief-of-staff briefing.

**Why this exists:** scheduler UIs show *when* a routine runs; they rarely show which
runs were **missed** (laptop closed, machine asleep) or which sessions are **waiting on
human input**. This skill is the consolidated view that closes that gap.

**Procedure:**
1. Read `AUTOMATIONS.md` (the registry — expected schedules) and the live scheduler
   state (scheduled-task list, run logs, `daily-loop/processor-log.md` if installed).
2. For each ✅ automation, compute expected-vs-actual runs since the last check.
   Cron math must be **deterministic** — compute expected fire times from the cron
   expression and compare against actual run timestamps; don't eyeball logs. (Worth a
   small helper script the first time this gets fiddly.)
3. Classify: **ran** · **ran late** (fired on wake after a missed window) · **MISSED**
   (window fully skipped) · **waiting on input** (session stalled on a question) ·
   **unregistered** (running but not in `AUTOMATIONS.md` — flag loudly).
4. Output one compact block:

   ```
   ⚙️ Routine status (since <last check>)
   ✅ ran: daily-inbox-processor (96/96), weekly-review
   ⏰ late: morning-brief (fired 09:40, scheduled 07:00 — laptop was closed)
   ❌ MISSED: <task> — [offer: run it now?]
   👤 waiting on you: <task> — <what it needs>
   ```

5. Offer to re-run misses on the spot. Record anything systemic (a task that misses
   every weekend) as a proposed registry change.
