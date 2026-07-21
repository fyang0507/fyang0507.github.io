# Fred Agent Component Field Guide — Content Draft

Provisional route: `Building-FredAgent-Components.dc.html`
Reader question: What does each part do?
Content mode: anchorable technical field guide

# The Parts and Their Boundaries

Fred Agent is not held together by one orchestration framework. It is held together by components with narrow contracts.

Some components let the agent act. Some preserve shared or personal context. One exists because unattended systems eventually fail, usually in a more boring way than the architecture diagram predicted.

The important question is not only what each component can do. It is what each component refuses to own.

## How to read the field guide

Each entry answers five questions:

1. Why does it exist?
2. What contract does it expose?
3. What does it deliberately refuse to own?
4. Which larger workflows compose it?
5. Where does its state live?

The categories below describe roles in Fred Agent. They are not permanent labels attached to the repositories.

---

## Time and presence

## Sundial

One-line description:

> A command-agnostic scheduler that decides when an agent should become present.

### Why it exists

Cron covers recurring wall-clock time. Human obligations also happen relative to sunrise or sunset, once at a future moment, or when an external condition becomes true. A personal agent needs that larger timing vocabulary without waking an expensive model just to discover that nothing happened.

### Contract

Sundial fires shell commands through four trigger types:

- `cron`: recurring wall-clock schedules
- `solar`: offsets from local sunrise or sunset
- `poll`: a cheap command checks the condition; the main command fires only on success
- `at`: one-time future execution

It records execution state and exit codes. It can gate runs on preconditions, cap execution time, respect active hours, and resume obligations after restart through reconciliation.

### Boundary

Sundial does not understand the business meaning of a task. It does not decide whether a trash bin needs attention, how an email should be answered, or when a human should be called. It schedules a command. The workflow owns the policy.

### Composed by

- Discord Intake
- Trash Patrol
- Morning Brief
- Scheduled technical-reading and publishing work
- One-off end-to-end verification runs

### State

Desired schedule definitions are Git-tracked. Runtime fields such as next fire, exit status, fire count, and deferred backoff remain machine-local and are queried through the daemon.

Source: [github.com/fyang0507/sundial](https://github.com/fyang0507/sundial)

---

## Communication and reach

## Outreach

One-line description:

> A utility interface for calls, messages, email, Discord, and per-channel history.

### Why it exists

Ordinary life still uses phone numbers, text messages, email threads, and informal channels. An agent that can reason but cannot enter those interfaces remains trapped behind the places where the work actually happens.

### Contract

Outreach provides explicit operations for:

- placing, monitoring, steering, and ending voice calls
- sending SMS or iMessage and retrieving message history
- sending, replying to, searching, and retrieving Gmail
- posting to Discord and reading channel history

Commands accept an explicit recipient and objective. Outputs are machine-readable. Voice calls expose a fast conversational layer that can be monitored or sparsely steered by a slower outer agent.

### Boundary

Outreach is intentionally not a campaign manager. It does not own contacts, automatic follow-up, reply-watching policy, cross-channel orchestration, or the decision to interrupt a human. Those responsibilities belong to the calling workflow.

This boundary was learned by subtraction. A transport primitive became more reusable after campaign and orchestration policy were removed from it.

### Composed by

- Contact Operator
- Discord Intake
- Local-service sourcing workflows
- Headless operational reporting
- Omni-Presence demonstrations

### State

Channel providers retain their native communication history. Outreach supplies retrieval and normalized command output; workflow state lives outside the transport.

Source: [github.com/fyang0507/outreach-cli](https://github.com/fyang0507/outreach-cli)

---

## Shared durable state

## Notion Gateway

One-line description:

> A schema-aware bridge between a human Notion workspace and agent-readable commands.

### Why it exists

Humans and agents need different interfaces to the same state. A human wants pages, properties, statuses, and a workspace that can be checked from a phone. An agent wants stable identifiers, schemas, Markdown, structured output, explicit write boundaries, and dry runs.

### Contract

Notion Gateway provides:

- a compact registry of approved databases and pages
- schema inspection before property-bearing writes
- page creation and property updates
- Markdown-native page reads, appends, and carefully gated replacements
- dry runs for ambiguous or broad changes
- terse receipts by default and scoped readback for verification

The Gateway page is the knowledge map. Individual databases and pages remain the durable human workspace.

### Boundary

Notion Gateway does not invent destinations, silently create schema, or treat every API response as useful context. Unknown properties and unapproved writes fail closed. It also does not make Notion the private memory of one agent runtime; the workspace remains human-readable and independently editable.

### Composed by

- Discord Intake
- Technical Reading Bookmark
- Morning Brief and planning workflows
- Writing and publishing workflows
- Project and issue maintenance

### State

The canonical project state lives in Notion. Skills describe how to operate it safely. Local artifacts hold detailed execution evidence when a Notion page would be the wrong place for machine logs.

Source: [github.com/fyang0507/ntn-gateway](https://github.com/fyang0507/ntn-gateway)

---

## Personal context and privacy

## Whoami

One-line description:

> A privacy-aware router that reveals only the category of personal context needed for the task.

### Why it exists

A personal agent becomes useful because it can know who it is acting for. Loading every personal fact into every session would be the laziest possible implementation of that idea.

### Contract

Whoami routes requests to narrow reference files for:

- basic identity
- contact information
- home information
- family context
- major education and career events

A task reads the smallest relevant reference rather than one consolidated personal dossier.

### Boundary

Whoami does not authorize an action merely because it can reveal the relevant fact. Knowing a phone number is not permission to call it. Knowing a home address is not permission to publish it. Action authority remains with the user request and the workflow’s operating policy.

### Composed by

- Personalized outreach
- Calendar and planning work
- Forms and documents requiring identity details
- Context-sensitive writing or project maintenance

### State

The references remain local and separated by sensitivity and purpose.

Source: `fyang0507/fred-agent/.agents/skills/whoami`

---

## Unattended reliability

## Headless Error Report

One-line description:

> A failure protocol that preserves retry state, reports concise human status, and dispatches guarded investigation.

### Why it exists

Unattended systems do not fail in front of a patient operator. They fail while nobody is looking, and the most damaging behavior is often not the initial error but the lost cursor, false completion stamp, missing evidence, or silent absence of future work.

### Contract

On failure, the protocol requires the workflow to:

1. preserve retry state before advancing anything durable
2. capture a short local failure note and evidence path
3. classify obvious transient rate limits
4. post a concise operational digest to the human channel
5. dispatch a separate investigation agent when diagnosis or repair is needed
6. require a final status from the investigation

A recursion guard prevents an investigation agent from launching another investigator for the same incident.

### Boundary

Headless Error Report does not dump raw logs or secrets into Discord. It does not mark work complete when the intended side effect failed. It does not launch a diagnosis for routine no-op states, and it does not convert every rate limit into an expensive investigation.

### Composed by

Every scheduled or unattended workflow that can fail after the interactive session has ended.

### State

Detailed evidence remains in local investigation artifacts. Discord receives the short human digest and the final status. The original workflow retains its retryable durable state.

Source: `fyang0507/fred-agent/.agents/skills/headless-error-report`

---

## The field guide is not the system

The entries above are useful because they remain incomplete.

Sundial does not know what the house needs. Outreach does not know who deserves a follow-up. Notion Gateway does not decide which project is worth preserving. Whoami does not turn personal knowledge into authority. Headless Error Report does not make a fragile workflow reliable by itself.

The system appears in the composition.

Continue to: **System Overview** for the recipes, or **Demos** for the behavior.

## Content notes for review

- The first release covers five components: Sundial, Outreach, Notion Gateway, Whoami, and Headless Error Report.
- Composite protocols remain in System Overview and Demos for now. Do not add protocol entries to the first field-guide release.
- The article and visual guides remain part of the operating environment but do not receive first-release field-guide entries.
- Command syntax is intentionally excluded. Repository documentation remains the operational reference.
- Before publication, verify every public repository link and decide whether skill-only components should link to a public source file, the Fred Agent repository root, or no external destination.
