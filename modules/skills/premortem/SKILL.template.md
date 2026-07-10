# premortem

**Trigger:** "premortem this," or any significant plan/launch/commitment about to start.

**Procedure:**
1. State the plan in one sentence and the date by which success/failure is visible.
2. **Assume it is that date and the plan failed.** Write the 5-8 most plausible causes
   of death, each one specific ("the always-on machine was asleep for a week and nobody
   noticed"), not generic ("poor execution").
3. Rank by (likelihood × damage). For the top 3, propose the cheapest mitigation that
   meaningfully reduces the risk — prefer detection ("add an alert when X") over process.
4. End with a one-line verdict: proceed / proceed-with-mitigations / rethink.
5. If mitigations create tasks, add them to `trackers/TASKS.md` in the same turn.

Keep the whole output under a screen. A premortem that's too long to read is a risk
nobody mitigated.
