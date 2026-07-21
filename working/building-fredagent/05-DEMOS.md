# Fred Agent Demos — Content Draft

Provisional route: `Building-FredAgent-Demos.dc.html`
Reader question: Does it actually operate?
Content mode: outcome-first evidence gallery

# The System in Motion

An architecture diagram explains what can connect. A demonstration should show whether the connection survives contact with time, other people, physical-world state, imperfect interfaces, and failure.

These are not benchmark videos. They are short records of the system operating in the places it was built for.

## Demo-page rule

Every demo should reveal information in this order:

1. The human task
2. The outcome
3. The handoffs between surfaces
4. The capabilities and protocol underneath
5. The current limitation

Do not lead with a terminal recording. The command is evidence only after the visitor understands why the command mattered.

---

## Featured demo: one task across several surfaces

Working title: **Meet Me Wherever I Am**

### The task

Begin a task in a general-purpose agent, continue it through a phone call and message, understand a linked video, ask for a lightweight human approval, and preserve the result in Notion.

### Draft reader-facing copy

The agent calls me. During the conversation I say I will send a YouTube link. The task leaves the phone call, waits for the message, understands the video, asks me for a tapback, and writes the approved artifact into my technical-reading system.

No single interface contains the whole interaction. The workflow does.

The point is not that an agent can call five APIs. The point is that the task survives each handoff without asking the human to reconstruct its context.

### Recipe

```text
general-purpose agent
→ voice call
→ message handoff
→ video understanding
→ human approval
→ Notion record
```

### What to notice

- The live conversation remains fast and bounded.
- A slower outer agent can monitor and steer without controlling every spoken turn.
- The task waits across channels rather than pretending the interaction is continuous.
- Human approval is lightweight but explicit.
- Caller ID reflects the agent's role: **Fred Agent** when it calls me, and **Fred** when it calls on my behalf. Spoken disclosure still remains explicit when another person is involved.
- The final state is durable and human-readable.

### Current limitation

This is a composed demonstration of the operating model, not a universal cross-channel workflow engine. Each handoff is deliberately bounded and tested.

### Media needed

- One 60–90 second edited walkthrough
- One 15-second cut showing call → message → Notion
- Phone-call audio excerpt with captions
- Message/tapback screenshot or recording
- Paired caller-ID captures showing **Fred Agent** and **Fred**
- Final Notion record screenshot with private data removed
- One simplified handoff diagram

---

## Demo: Trash Patrol

Working title: **The House Has a Small, Boring Problem**

### The task

Around the time municipal collection rules matter, inspect what the doorbell camera can actually see near the curb and decide whether the bins need attention.

### Draft reader-facing copy

A reminder can tell me that tomorrow is collection day. Trash Patrol asks a different question: given the current time, the local collection rule, and the visible state near the curb, is there anything I should do now?

Sundial wakes the workflow relative to sunset. The camera supplies the scene. The protocol makes a bounded judgment, posts a short verdict to the smart-home channel, and deletes the temporary capture after the result is delivered.

When the camera path failed, the failure was traced through the real scheduled route rather than replaced with a hand-waved screenshot. The repaired path captured a usable frame and completed an end-to-end scheduled delivery.

### Recipe

```text
solar trigger
→ doorbell capture
→ local rule + visual judgment
→ short Discord verdict
→ cleanup
```

### What to notice

- The trigger follows the human obligation rather than a generic morning schedule.
- The system reports uncertainty instead of guessing when the scene is unclear.
- The final message is smaller than the reasoning that produced it.
- Capture cleanup is part of the workflow, not a later housekeeping task.

### Current limitation

This is a bounded household workflow. It is not evidence of generalized visual understanding of the home.

### Media needed

- Sanitized doorbell frame with the relevant area visible
- Discord result screenshot
- Short recording of the scheduled test firing
- Optional failure/recovery before-and-after timeline
- No house number, precise address, credentials, or private camera URLs

---

## Demo: Discord Intake

Working title: **Drop the Messy Input**

### The task

Send text, images, audio, video, or files from a phone and let a scheduled agent process them later without turning capture into filing work.

### Draft reader-facing copy

I put unfinished material into one Discord channel: a thought, a photograph, an audio note, a file, or an instruction that is still missing half its nouns.

The intake workflow stages new messages, downloads attachments before their links expire, understands the media when needed, writes a local result artifact, performs the requested action, and advances its cursor only after the side effects succeed.

The interface is deliberately undisciplined for the human. The discipline lives behind it.

### Recipe

```text
phone capture
→ Discord staging
→ media understanding
→ requested action
→ local artifact or Notion
→ cursor advance
```

### What to notice

- The human is not asked to choose the final destination during capture.
- Attachments are staged before temporary URLs expire.
- A failed destination write does not silently consume the message.
- The result can become a durable project artifact rather than another chat response.

### Current limitation

Ambiguous input still requires judgment. The workflow can organize and route context; it should not invent the human’s missing intent.

### Media needed

- A clean sample intake containing at least two media types
- Processing-state screenshot or short recording
- Resulting local or Notion artifact
- A sanitized cursor/retry-state example
- A deliberately non-private test scenario prepared for public capture

---

## Demo: unattended recovery

Working title: **Failure Should Leave a Forwarding Address**

### The task

When a scheduled workflow fails with no human present, preserve the work, report the operational status, investigate safely, and close the loop.

### Draft reader-facing copy

An unattended failure is not useful merely because it produced a log.

The workflow first preserves retry state. It records a short local evidence note and posts a concise bug-report digest. When the failure needs diagnosis, a separate investigation agent inspects the evidence under a recursion guard and returns with a final status: fixed, issue submitted, needs human, unknown, or monitoring.

The detailed evidence remains local. The human receives enough information to understand what did not happen and what comes next.

### Recipe

```text
failure
→ preserve retry state
→ save evidence
→ concise human digest
→ guarded investigation
→ final status
```

### What to notice

- The cursor or completion state does not advance after a failed side effect.
- Routine no-op states are not treated as incidents.
- A clear temporary rate limit does not automatically launch another agent.
- The investigator cannot recursively investigate itself.
- The final message closes the human-visible loop even when the cause remains unresolved.

### Current limitation

The protocol makes failure legible and recoverable. It cannot make every external provider or brittle interface reliable.

### Media needed

- Synthetic or sanitized failure scenario
- Initial concise Discord digest
- Investigation artifact excerpt
- Final-status follow-up
- Timeline showing preserved cursor/state
- No secrets, raw environment dumps, signed URLs, or private logs

---

## Demo: co-authored publishing

Working title: **Continuity Is More Than a Prompt**

### The task

Move from source material through drafting, editing, visual direction, human review, and durable publication without rediscovering the voice and workflow every session.

### Draft reader-facing copy

The Article Style Guide does not merely say how Fred sounds. It records how a piece should be sourced, drafted, revised, translated, reconciled, and preserved. The Visual Design Guide does not hand every surface the same template. It supplies a visual language and routes each medium to the implementation and verification process it needs.

The result is not that the agent can imitate a style on command. The result is that a future session can inherit the editorial world around the artifact: source, judgment, boundaries, state, and review history.

### Recipe

```text
source material
→ canonical base draft
→ article guide
→ human revision
→ visual direction
→ destination-specific build
→ verified publication
```

### What to notice

- The source remains distinct from platform adaptations.
- Human-authored decisions are preserved rather than averaged away.
- Visual direction and website implementation remain separate responsibilities.
- Publication includes real rendering and verification, not only file generation.

### Current limitation

Creative continuity does not remove the need for human authorship. The system should preserve decisions and reduce re-explanation, not close aesthetic questions by itself.

### Media needed

- Source → draft → revision sequence
- One short before-and-after writing example
- One visual artifact with its deterministic layout stage
- Browser-verified published result
- Optional Notion project record showing human/agent shared state

---

## Proposed demo ordering

For the first release:

1. Omni-Presence — broadest system reveal
2. Trash Patrol — most memorable ordinary-life example
3. Discord Intake — clearest shared-context workflow
4. Unattended Recovery — strongest reliability proof

Keep Co-authored Publishing below the four primary demos until its media is sufficiently public and concise.

## Closing copy

Fred Agent is not finished. Some demos will be replaced by quieter workflows; some capabilities will disappear after their policy moves into a better layer; some agent runtime names will age badly.

The evidence is not that the system has stopped changing.

The evidence is that the task can survive the change.

## Content notes for review

- Demo names are editorial working titles, not feature names.
- The page should clearly label a recreated demonstration versus a historical real run.
- Final media selection may change the ordering and landing-page featured demo.
- Do not publish third-party identities, voices, addresses, phone numbers, private Discord content, Notion records, or home-camera details without explicit sanitization and permission.
