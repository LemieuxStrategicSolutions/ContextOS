# decision-memo

**Trigger:** {{USER_NAME}} says "I need to solidify a decision," asks for a decision
memo/log, wants to reconstruct a past decision, or asks you to justify a meaningful
recommendation you just made. Rule of thumb: **no memo, no decision** — anything with
real stakes gets archived.

**Procedure:**
1. Write `decisions/YYYY-MM-DD-<slug>.md`:
   - **Decision** (one sentence, present tense: "We are doing X.")
   - **Context** — what forced the choice, by when.
   - **Options considered** — 2-4, each with the one strongest argument for it.
   - **Rationale** — why the winner won.
   - **Accepted risk** — what could go wrong that we're knowingly living with.
   - **Revisit trigger** — the concrete signal that reopens this.
2. Add a one-line entry to `decisions/DECISIONS.md` (date · decision · link).
3. Capture decision + rationale + accepted risk to the memory connector (if present).
4. If the decision creates work, add the task(s) to `trackers/TASKS.md` in the same turn.

**Reconstruction mode:** when asked "why did we decide X?", read the memo first, then
memory — answer from the record, not from vibes.
