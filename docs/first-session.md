# Your first Mason session

This example is entirely synthetic. It demonstrates the framework using a
file-capable assistant; it does not require the Mason app or a memory connector.

## 1. Approve a small private workspace

Follow [BOOTSTRAP.md](../BOOTSTRAP.md). Start with behavior and memory rules,
daily notes, and one task tracker. Leave automations disabled.

Confirm where files will live, who can access them, your timezone, and which AI
provider may process them. Never enter personal data in the public template repo.

## 2. Capture something

Say:

> Add this to my daily note for 2026-01-12: I might run a community workshop.
> I decided to use a beginner-friendly format. I will draft the outline on Friday.
> Keep the workshop idea separate from that commitment.

The assistant should preserve your words in the dated note and report the actual
save result. For audio, this framework needs a separate recording/transcription
integration; do not pretend a pasted transcript includes a preserved recording.

## 3. Make it useful

Ask:

> Organize that capture into an idea, a decision, and a commitment. Link the result
> to the original note. Show me the proposed task before adding it.

Expected result:

- Idea: a possible community workshop, not a new task.
- Decision: use a beginner-friendly format, linked to the source.
- Proposed task: draft the outline on Friday. Confirm the intended calendar date
  before assigning a due date.

Then confirm the task. It belongs in the existing task tracker, with its source
link—not in a second task list hidden inside memory.

## 4. Prove continuity

Start another session with authorized access to the same private workspace:

> What did I decide about the workshop, and what happens next? Cite the source.

The response should use the original note and task record. A session without
access should say so; it must not claim it retrieved the context.

## 5. Check failure and correction

- Correct the decision. The original source remains traceable and the current
  decision is distinguishable from the old one.
- Retry the capture. The system should identify a duplicate rather than silently
  creating another task.
- Disconnect the optional memory connector. Owned records should still be usable.
- Withhold save access. The assistant must report “not saved,” not “done.”

These are manual acceptance checks, not automated test results. Passing them in one
environment does not establish mobile audio quality or cross-device reliability.
