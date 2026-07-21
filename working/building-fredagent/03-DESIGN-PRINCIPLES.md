# Fred Agent Design Principles — Content Draft

Provisional route: `Building-FredAgent-Principles.dc.html`
Reader question: Why is it designed this way?
Source: adaptation of the existing base post, not a separate argument

# A Life With Handles

Today's agents can solve problems that once looked impossibly difficult. Yet place the same agent in ordinary life and it is strangely handicapped: it cannot arrive at the right moment, use the interfaces people already depend on, or carry work into the physical world without someone rebuilding the bridge each time.

That creates the paradox behind Fred Agent: **the capability already exists; the opportunity does not.**

I have therefore become less interested in building another agent and more interested in giving capable agents somewhere to act: time, communication, shared state, personal context, operating rules, and a graceful way to involve a human.

That surrounding layer is Fred Agent.

It is not an agent in the sense of a new model, personality, or orchestration loop. It is an environment built around replaceable general-purpose agents: a phone they can use, a scheduler that decides when they should become present, a shared workspace they can update, a channel that can receive messy context, a set of rules for using personal information, and a failure path for the hours when nobody is watching.

The project is an attempt to make parts of a life agent-operable.

## 1. The agent should be portable

Today the agent may be Codex. Tomorrow it may be Claude Code. Later it may be something else with a terminal, a filesystem, tools, and a long-running loop.

I do not want one company’s private memory system or one chat surface’s internal state to become the operating system for my life. A useful session can end. The durable environment should not end with it.

That means the important material lives outside the agent: commands, schedules, local artifacts, Git history, Notion records, Discord channels, schemas, and operating rules another capable runtime can read. The agent arrives into an environment that already knows where things belong and what must not be disturbed.

Portability is not an abstract hedge against vendor lock-in. It changes how every component is designed. A scheduler fires a shell command, not a proprietary agent object. A workflow preserves its cursor in durable state, not in one conversation’s recollection. A writing guide exists as a readable artifact, not as a feeling I hope the next model infers from five old prompts.

The agent can change. The handles remain.

## 2. The enablement floor matters more than the intelligence ceiling

There is a strange capability overhang in everyday life.

Current agents are overqualified for many household and administrative tasks. They can understand the instruction. They can reason about the tradeoff. They can produce a reasonable plan. Then they hit the actual world, where the useful interface is a phone number, the important update is trapped in a Discord attachment, the house state is visible only through a camera, the human record lives in Notion, and the action should happen on Thursday thirty minutes before sunset rather than whenever I remember to reopen the chat.

The failure is not always that the model cannot think. The world has not been made easy for it to act in.

This is the enablement floor: stable handles into time, communication, state, media, permissions, and human attention. The agent already preserves the fundamental ability to act; enablement gives that ability an opportunity. Raising this floor often creates more useful behavior than replacing the model with a slightly more capable one.

The model still matters. But intelligence that cannot arrive, inherit, act, and stop is mostly trapped potential.

## 3. Capture should not become homework

Most knowledge systems ask the human to become organized at the exact moment the human has the least energy for organization.

Choose a database. Add a tag. Rewrite the thought. Decide whether it is a task, note, project, memory, bookmark, draft, or vague future guilt. By the time the taxonomy is complete, the thought has usually left the building.

My intake surface is a Discord channel. I can drop text, an image, an audio note, a video, a file, or a half-formed instruction from my phone. A scheduled agent handles the ceremony later: stage the messages, download attachments before links expire, understand the media when needed, write a result artifact, perform the requested action, update the durable destination, and advance the cursor only after the side effects succeed.

This is not a perfect second brain. It is a pipe with enough discipline that the things I throw into it do not evaporate.

The human supplies messy context. The system earns the right to organize it.

## 4. The primitive is not the product

A phone call is an atomic capability. It is not a workflow.

The command can dial a number and speak with a person. The useful experience needs much more: who should be contacted, what the objective is, what happened on the previous attempt, whether another attempt is appropriate, where the result should be written, when ambiguity deserves a human, and which follow-up should happen after the call ends.

The same distinction appears everywhere in the system.

Sundial can wake a command around sunset. Trash Patrol combines that timing with a camera, local collection rules, a bounded visual judgment, a short Discord verdict, and cleanup. Outreach can post to Discord. Discord Intake combines channel history, attachment staging, media understanding, durable output, cursor discipline, and retry behavior. Notion Gateway can update a page. A publishing workflow combines it with source recovery, editorial judgment, human review, and a clear destination.

Capabilities should stay small enough to reuse. Protocols should own the state and policy that make a capability useful in one class of situations. The final use case should disappear into a human-scale result.

A skill is not the experience.

## 5. Human attention is a budget

Most agent demonstrations quietly assume the human is sitting nearby, waiting to approve the next step. A personal operating system cannot make that assumption.

I may be away from the computer. I may be with my family. I may be asleep. More importantly, a system that constantly asks for attention has not automated much; it has simply moved the control panel into another notification stream.

Fred Agent uses a deliberately uneven escalation ladder.

If the agent can resolve an obvious local problem safely, it should try. If the issue can wait, it should preserve the evidence and leave a concise digest. If the next step truly depends on me and the answer is time-sensitive, it can call. The phone call is not a dramatic symbol of autonomy. It is a scarce interrupt reserved for a blocking decision.

This changes the central question. I care less about whether an agent can complete every task with no human and more about whether it can spend human attention responsibly.

Silence is part of the interface.

## 6. Shared state needs two interfaces

Humans and agents should not be forced through the same interface.

I use Notion because I can open it on a phone, read a project, change a status, add a note, and understand the shape of the work without entering a development environment. It is an ordinary human workspace. That ordinariness is useful.

An agent needs something else. It needs stable identifiers, schemas, JSON, dry runs, explicit failure modes, and a way to update a record without pretending to use a browser like a patient intern. Notion Gateway supplies that second face.

The same workspace therefore looks different from each side. I see pages, databases, properties, and notes. The agent sees approved destinations, page IDs, writable fields, Markdown round trips, and commands that fail closed when the requested write does not match the live schema.

Neither interface is the real one. The shared state is the real one.

This is also why small pieces of metadata matter. A compact Agent Notes field can tell a future session what happened last, what rule must be preserved, and which part of the page it should not casually rewrite. The human does not need a wall of machine state. The agent does not need to reread an entire project history before taking one safe step.

The correct interface supplies the minimum evidence necessary for the current decision.

## 7. Scheduling is presence

Cron can run something at nine every morning. Human obligations have a larger vocabulary.

Some happen relative to sunrise or sunset. Some should happen once. Some depend on a cheap external condition becoming true. Some should wait until the network is available. Some should stay inside waking hours. Some should refuse to begin because the previous run is still active. Some should check every few minutes without waking an expensive agent to announce that nothing happened.

Sundial models four trigger shapes: cron, solar, poll, and at. The important idea is not the number four. It is that the scheduler is command-agnostic. Anything that can be expressed as a shell command can become a future obligation, including a fresh or resumed headless agent session.

This turns scheduling into something more than automation plumbing. It determines when the agent should become present.

Without that layer, I remain the scheduler. I have to remember the task, reopen the interface, restate the context, and ask the system to continue. That is a funny burden to retain after announcing an autonomous future.

The agent should wake because work exists.

## 8. Personal context needs a boundary

A personal agent becomes useful partly because it can inherit personal facts. The same capability makes casual context loading dangerous.

Whoami is deliberately not one enormous biography poured into every session. It is a router. A task that needs a name reads basic identity. A task that needs a phone number reads contact information. A task that touches the home or family loads only the reference it actually needs.

This is a small privacy pattern with a larger implication: context should be granted by purpose, not accumulated because the agent might find it useful later.

The best memory is not always the largest memory. Sometimes it is the correct refusal to look.

## 9. Creative continuity is infrastructure too

Writing and visual work are easy to mistake for prompt problems. Ask for the right tone, attach a few references, and hope the next output feels related to the previous one.

That approach produces a lot of competent amnesia.

The Article Style Guide records more than surface voice. It preserves the workflow around source material, drafting, revision, translation, and durable publication. The Visual Design Guide is not a universal template. It records an art-direction language—line, texture, temperature, type roles, human attention—while leaving each destination medium to solve its own implementation problem.

These guides sit beside the action interfaces because continuity is part of the operating environment. A future agent should not merely know how to create a file. It should inherit why the work feels the way it does, which parts are adaptable, and which boundaries are canonical.

Without that, every session begins by rediscovering taste from its debris.

## 10. Failure has to become shared state

Unattended workflows fail in boring ways.

Authentication expires. A provider returns a rate limit. A wrapper has a quoting bug. A camera negotiates the wrong codec. An attachment link expires. A cursor advances before the destination write finishes. The model is rarely the most cinematic part of the failure.

A headless system has to treat failure as part of the interface.

When something goes wrong, the workflow should preserve retry state before anything else. It should leave enough evidence to reconstruct the failure, try a narrow safe fix when the cause is obvious, and post a concise human digest. If the problem requires diagnosis, it should dispatch a separate investigation agent with a recursion guard, then return with a final status: fixed, issue submitted, needs human, unknown, or monitoring.

The detailed evidence belongs in local artifacts. The human-facing message should stay short. A cursor should not advance merely because the program reached the end of a function.

An automation pile says something broke.

A collaborative system says what broke, what did not happen, what state was preserved, where the evidence lives, and what comes next.

## 11. Ordinary life is the benchmark

The most convincing parts of Fred Agent are not the most glamorous.

It called local pest-control providers because that market still runs on phone numbers. It checked trash bins because owning a house contains recurring obligations that never become interesting and never disappear. It turned dropped voice notes and files into durable work because I do not want to become the database between agent sessions. It updated Notion because a shared workspace should remain legible to the human. It reported unattended failures because silent automation rot is still rot.

None of these tasks require a new theory of intelligence. They require the existing intelligence to arrive at the right time, see the right state, touch the right interface, and stop before it spends attention badly.

That is the actual project.

Not a better chatbot. A life with handles.

## Source and adaptation note

This page is the proposed web adaptation of `I Am Not Building An Agent. I Am Building A Life That Agents Can Operate.` The base post remains the source of record during review. After approval, there should be one canonical body rather than two independently edited essays.

## Content notes for review

- The draft is shorter and more principle-driven than the base post; specific workflows move to the System and Demos pages.
- The “Personal context” and “Creative continuity” principles make Whoami and the two guide skills conceptually necessary rather than miscellaneous component entries.
- The English voice is deliberately direct and technical. A Chinese edition should be authored as its own essay, not produced as a literal mirror.
