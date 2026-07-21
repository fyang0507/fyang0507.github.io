# Building Page Guide: Fred Agent

Status: approved information architecture; first annotated revision applied
Scope: Fred Agent landing and its editorial subpages
Implementation gate: do not design or implement production pages until Fred approves this annotated revision

## 1. The job of this section

The Fred Agent section should explain one project at several depths without turning into a product website, a GitHub README, or a resume-equivalent case study.

The central message is:

> Fred Agent is not another custom agent. It is an operating environment that gives swappable general-purpose agents usable handles into time, communication, shared state, personal context, creative continuity, and unattended recovery.

The human point is simpler:

> An agent can be a session. It can also become part of the environment.

The pages should let a visitor begin with ordinary-life outcomes and progressively expose the protocols, capabilities, and infrastructure beneath them.

## 2. Reader architecture

```text
Building.dc.html
└── Building-FredAgent.dc.html        teaser and reader gateway
    ├── Fred Agent: System            architecture and composition recipes
    ├── Fred Agent: Principles        canonical long-form argument
    ├── Fred Agent: Components        field guide to contracts and boundaries
    └── Fred Agent: Demos             evidence gallery
```

Tentative flat-file routes:

- `Building-FredAgent.dc.html`
- `Building-FredAgent-System.dc.html`
- `Building-FredAgent-Principles.dc.html`
- `Building-FredAgent-Components.dc.html`
- `Building-FredAgent-Demos.dc.html`

The filenames are provisional until implementation. The content responsibilities are not.

## 3. Page contracts

| Page | Reader question | Content it owns | Content it must not absorb |
|---|---|---|---|
| Landing | Why should I care? | Thesis, three lived outcomes, short system reveal, routes, featured demo | Full architecture, component reference, long essay |
| System | How does it connect? | Layer model, high-level tasks, composition recipes, cross-cutting infrastructure | Component histories, long philosophical argument |
| Principles | Why is it designed this way? | Canonical argument derived from the base post | Exhaustive tool catalog, demo gallery |
| Components | What does each part do? | Purpose, contract, boundary, composition, source | Retelling the whole system for each component |
| Demos | Does it operate? | Real workflows, media, outcomes, evidence, current limitations | Product-marketing claims or terminal-heavy explanations |

## 4. System vocabulary

Do not force every skill into an identical box. Fred Agent contains several different kinds of building material.

### Capability interfaces

Stable, relatively atomic handles through which an agent can act.

- Outreach: calls, messages, email, Discord, and channel history
- Sundial: cron, solar, condition-gated poll, and one-time triggers
- Notion Gateway: safe read/write access to shared durable state
- Calendar, media understanding, and smart-home adapters

### Knowledge and policy modules

Portable context or judgment that shapes an action without acting as the transport itself.

- Whoami: privacy-aware personal context routing
- Fred Article Style Guide: writing voice and publishing workflow
- Fred Visual Design Guide: cross-media art-direction language

### Composite workflow protocols

Repeatable behavior composed from capabilities, state, timing, failure rules, and human handoff.

- Discord Intake
- Contact Operator
- Smart Home Trash Patrol
- Technical Reading Bookmark

### Cross-cutting reliability

Rules that make every unattended workflow less likely to rot silently.

- Headless Error Report
- Cursor discipline and idempotence
- Dry runs and fail-closed writes
- Logs, execution receipts, and evidence preservation
- Retry state and guarded investigation

## 5. Message progression

Every page should preserve this order of explanation:

1. A human task or irritation
2. The resulting experience
3. The workflow protocol
4. The capabilities it composes
5. The supporting infrastructure and boundaries

Do not begin with a wall of component names. Names become meaningful after the visitor understands the experience they enable.

## 6. Claim and tone boundaries

- This is a personal system with real operating evidence, not evidence of mass adoption.
- Describe what the system did, what was verified, and what remains limited.
- Do not turn the pages into career positioning or interview narratives.
- Do not imply handwritten implementation. When authorship matters, use: “I designed and shipped the system through an agent-mediated engineering workflow.”
- Prefer concrete behavior over generic adjectives such as powerful, seamless, revolutionary, or autonomous.
- Keep model brands secondary. The durable subject is the environment around a swappable runtime.
- Let ordinary-life material carry the argument: a phone call, a trash bin, a dropped voice note, a Notion record, a failure message.
- Use **A Life With Handles** as the human-facing proposition. The handles are stable interfaces used by agents; calling the handles themselves “agentic” weakens both the grammar and the system model.

## 7. Content-source discipline

- The Principles page is the web adaptation of the existing base post; it is not a second independent essay.
- The Component page should be checked against each live repository and `SKILL.md` before publication.
- Demo copy must be checked against actual media and execution evidence after Fred selects the final demos.
- One-liners may appear elsewhere, but detailed explanations have one canonical page.

## 8. Navigation and scalability

The Fred Agent landing should expose four stable chapter destinations. Future material can grow inside those destinations before creating more top-level routes.

Create a new Fred Agent subpage only when the material answers a new reader question. Do not create a page merely because a component gained more features.

Individual component pages remain optional. A component earns one only when it has enough independent history, diagrams, tradeoffs, and demonstrations to sustain a real narrative.

## 9. Already-approved Building-board decisions

These decisions belong to the parent Building gateway and are recorded here only so the Fred Agent delivery stays compatible:

- Project prominence is `highlighted`, `supporting`, or `ordinary`; prominence is separate from lifecycle.
- Fred Agent is the current highlighted project.
- Substantial projects may receive `Building-<Project>.dc.html` pages without sharing a universal project template.
- Ordinary projects expand in place to reveal a one-line explanation and GitHub link.
- The plus-to-menu morph is the reference interaction for those ordinary-project disclosures.
- Highlighted-project gradient text is a restrained emphasis device, not a site-wide decoration.

Detailed acceptance criteria live in [GitHub issue #5](https://github.com/fyang0507/fyang0507.github.io/issues/5).

## 10. Applied content-review decisions

- English is the first-release language.
- The landing opens on the paradox between olympiad-level abstract capability and helplessness in ordinary life.
- The System Overview foregrounds Discord Intake, Contact Operator, and Trash Patrol. Unattended Recovery remains a cross-cutting fourth path.
- The system visual reads from atomic handles through workflow protocols to ordinary-life outcomes. Fred Agent is the enclosing enablement environment, not one peer node.
- Co-authored Publishing remains a supporting demo but is not a canonical system recipe.
- Local-Service Outreach is removed from the Demos page.
- The first Component Field Guide covers Sundial, Outreach, Notion Gateway, Whoami, and Headless Error Report. Composite workflows and the creative guides do not receive entries yet.
- “Capture should not become homework” moves into the first three Design Principles.
- The first demo order is Omni-Presence, Trash Patrol, Discord Intake, and Unattended Recovery.

## 11. Deferred until revised-content approval

- Page composition and responsive layout
- Final typography and gradient treatment
- Illustration or diagram style
- Motion choreography
- Production HTML/CSS/JavaScript
- Asset generation
- Publication, commit, or deployment

Semantic diagrams in this working set describe information relationships only. They are not visual-design commitments.

## 12. Content approval checklist

Before visual design begins, confirm:

- The landing states the project accurately in under one minute.
- The system map distinguishes outcomes, protocols, capabilities, policy modules, and reliability.
- The Principles page carries the full argument without duplicating the component guide.
- Every component entry states both its contract and what it refuses to own.
- The selected demos collectively prove timing, communication, durable state, physical-world interaction, creative continuity, and recovery.
- No page reads like a resume or generic AI product launch.
- The canonical language strategy is decided: English-first, Chinese-first, or bilingual.
