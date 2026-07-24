# NJJoe casebook — revised content and page architecture

## Decision

Use three real pages with one shared project strip:

1. `Building-NJJoe.dc.html` — overview and case-study routes
2. `Building-NJJoe-Microsite.dc.html` — listing microsite case study
3. `Building-NJJoe-APA.dc.html` — Annual Property Analysis campaign case study

Use separate URLs, not an in-page tab widget. The case studies need independent narrative depth, screenshots, claim boundaries, and future updates. Real pages preserve deep links, browser history, accessibility, and mobile reading flow while matching the chapter model already used by the Fred Agent section.

The earlier one-page mockup remains at `Building-NJJoe-one-page.mockup.html` as a design-history artifact. It should not become the production architecture.

## Why the first mockup was too shallow

The first version started at the implementation layer:

- scattered inputs;
- agent assembly;
- human approval;
- verified result.

That pattern is true, but it omits the consulting story that makes the work meaningful:

- What did Joe believe the problem was?
- What did field discovery show instead?
- How did the old buyer or homeowner experience actually feel?
- Which use case was impossible or impractical before?
- Why was this intervention chosen over a generic redesign or campaign product?
- What changed for the audience, the operator, and the business?

The revised casebook starts with those questions.

## Naming contract

“Customer” is too ambiguous for this casebook because it can refer to Joe, a home buyer, or someone in Joe's relationship database. Public copy uses the specific role instead:

- **Joe**, **the broker**, or **the collaborator** for the person commissioning and operating the work;
- **buyer** for someone evaluating a listed property;
- **homeowner** or **recipient** for someone eligible for APA outreach;
- **client base**, **client records**, or **relationship data** only when describing Joe's existing business data.

The only exception is Joe's attributed review, which preserves his original wording.

## Motion contract

- Keep the shared site header and NJJoe casebook strip visually static.
- Let the changing `<main>` content rise once when a casebook page opens.
- Reveal evidence units—cards, workflow steps, the static property capture, and Joe's review—as they enter the viewport.
- Stagger related units just enough to clarify their reading order; do not animate headings and prose for decoration.
- Use hover motion only on card-like surfaces where the response helps the surface feel inspectable.
- Under reduced-motion preferences, show every unit immediately and remove page-entry and hover motion.

## Component contract

Use the same component hierarchy as the deeper Building pages:

- **Signature cards** for the two case-study routes, fragmented listing surfaces, and outcome statements: tactile paper, a quiet wash-tape accent, slight resting rotation, and a soft alpha-following shadow.
- **Label cards** for dense supporting evidence such as facts, implementation details, and claim asides: a rounded paper shell with one colored left rule and an in-place hover response.
- **Connected flows** for the shared operating pattern, listing workflow, and APA funnel: one rounded outer shell, internal dividers, and explicit directional handoffs.
- **Framed artifacts** for the scrollable property capture and APA email draft: the same rounded ink edge and restrained paper shadow used by Building's system maps and feature surfaces.
- Keep the existing About-style review card as the testimonial exception; its role is collaborator evidence rather than a project-system card.

## Engagement-level narrative

### Driving question

What useful buyer or homeowner experience was hiding between tools that each worked correctly on its own?

### Overview title

**The problem lived between the tools.**

### Overview deck

Joe already had photographers, virtual tours, client records, email software, and years of relationships. What he did not have was the connective tissue that could turn those pieces into coherent experiences for buyers and homeowners.

### Shared pattern

Fragmented systems → agent assembly and verification → human judgment → one buyer- or homeowner-facing experience

The shared human point remains:

> The agent handles the seams. The human keeps the decision.

## Page 1 — Casebook overview

### Page job

Route visitors directly into the two delivery case studies. The relationship origin and the initial public-site hook are private context for shaping the work, not public-page content.

### Sections

#### Hero

- NJJoe casebook and engagement metadata
- “The problem lived between the tools.”
- Margin note: “Every tool did its part. Joe still had to assemble the delivery.”

#### 00 — Two field studies

Two substantial route panels:

1. **One house, four interfaces.**
   - Before: buyers and agents carried unrelated links.
   - Unlocked: one shareable property page assembled by a reusable agent skill.
2. **The campaign Joe could not run by calling harder.**
   - Before: one offer depended on one personal call per homeowner.
   - Unlocked: validated client profiles can become reviewed, personalized drafts.

#### 01 — Common pattern

Show the shared operating model and the human approval boundary.

#### 02 — Joe's perspective

Publish Joe's review as an attributed collaborator quotation:

> Fred was an incredible help when we were struggling to create a property listing website for a home we were selling. He also helped us find a way to automate our emails to promote our new Annual Property Analysis (APA) program.
>
> Fred jumped right in, spent his own personal time guiding us through the process, and showed us how to design everything effectively. Thanks to his excellent techniques and supportive manner, we now have a beautiful website for our prospective clients, and our APA program is successfully launching. I am incredibly pleased with everything Fred did!

— Joe Costello, NJJoe Group

Preserve Joe's wording. In particular, keep “our APA program is successfully launching” inside the attributed quotation rather than converting it into a measured project-outcome claim.

Render the review with the field-card construction established on `About.dc.html`: solid rounded edge, inset paper highlight, drop-shadow, and a utility metadata row. Use the site's Fraunces editorial face for the quotation body and a deterministic SVG quotation mark in the metadata row; the review should read as evidence, not a second display headline.

## Page 2 — Listing microsite case study

### Driving question

Why did a listing with good photography, a working 3D tour, correct facts, and detailed floorplans still produce a bad buyer experience?

### Title

**One house, four interfaces.**

### Hero deck

The photos were good. The 3D tour worked. The floorplans existed. The listing details were known. The buyer experience was still broken, because seeing one property meant visiting several products.

### 00 — Discovery

**Heading:** The buyer was not missing content. The buyer was missing the whole.

Show the old surfaces as four separate artifacts:

1. Photographer gallery — static images on the vendor's site
2. 3D virtual tour — separate Matterport-hosted walkthrough and URL
3. Internal communication — facts, changes, schedules, and notes
4. Broker surface — contact, branding, disclaimers, and next step

The precise number of surfaces may vary by listing. “Four interfaces” is the representative experience, not a universal vendor count.

### 01 — Pain point

**Heading:** Every vendor finished its part. The buyer inherited the seams.

Buyer pain:

- open several links to understand one house;
- reconstruct which facts belong to which media;
- search again for contact and next action;
- receive an asset bundle rather than one authoritative experience.

Realtor pain:

- locate and reconcile assets for every launch;
- repeatedly arrange the same inputs for different channels;
- verify links and presentation by hand;
- manage several shareable objects instead of one.

### 02 — Intervention

**Heading:** Turn the listing into structured input. Give the property one URL.

Workflow:

1. Gather address, facts, photos, plans, tour, map, schedule, contact, brand, and disclaimers.
2. Normalize required fields, approved copy, media, and link health.
3. Generate the complete static microsite from the agreed presentation.
4. Produce a real preview for human approval.
5. Publish to the listing subdomain and verify the public page.

### 03 — Delivery

**Heading:** A reusable skill, demonstrated by one live property.

Verified evidence:

- one live 346 Roosevelt Ave microsite;
- 27 listing photos;
- three floorplans;
- one Matterport experience;
- property facts, map, contact, and buyer actions on the same URL;
- desktop/mobile and public-asset verification;
- preview-before-publish boundary;
- durable agent playbook for future listings.

### 04 — Outcome

#### Buyer outcome

One coherent property experience instead of a set of vendor products.

#### Distribution outcome

One URL can travel through email, messages, social posts, listing platforms, and direct conversations without reconstructing the asset bundle for every channel.

#### Operating outcome

The realtor manages listing inputs once; the skill handles repeated composition, checking, packaging, and verification.

### Claim boundary

Safe now:

- one public microsite exists;
- the unified experience did not exist before;
- the workflow removes repeated manual assembly steps;
- the separate photographer-hosted microsite subscription is no longer required for this pilot.

Directional but not yet quantified:

- substantial assembly-time reduction;
- lower marginal effort for future listings.

Do not yet claim:

- an exact number of hours saved;
- an exact dollar saving;
- a portfolio of automatically generated live sites;
- conversion, traffic, revenue, or adoption improvements.

## Page 3 — APA campaign case study

### Driving question

How can a realtor reach an existing client base personally when the offer previously depended on one uncomfortable, inefficient call at a time?

### Title

**The campaign Joe could not run by calling harder.**

### Hero deck

The offer had already produced interest. The client base already existed. The missing piece was a way to reach homeowners personally without requiring Joe to make one cold business-development call after another.

### 00 — Discovery

**Heading:** The marketing problem was not a lack of homeowner interest.

Discovery evidence:

- 239 HomeBot contacts were observed during the strategy work;
- Joe described that as roughly three years of coverage and about 80 percent of the relevant base;
- weekly HomeBot email opens exceeded 80 percent;
- roughly 30 percent of recipients took deeper link actions;
- the prior APA campaign completed 37 visits in about six weeks;
- homeowners often remained interested in follow-up or later visits.

Diagnosis:

- seller opportunities inside existing relationships were strategically important;
- homeowner interest was present;
- Joe disliked personally making cold business-development calls;
- the call-bound outreach motion was the bottleneck.

The production export later yielded 240 unique profiles. Keep the discovery snapshot of 239 distinct from the later validated production data of 240.

### 01 — Pain point

**Heading:** The channel stopped where Joe's attention stopped.

The old workflow:

- choose likely homeowners;
- call one person;
- explain the offer;
- manage a response;
- repeat.

Generic email software could not safely replace this because the message depended on:

- recipient identity;
- associated property;
- Homebot state;
- a private recipient-specific report URL;
- relationship context;
- suppression and delivery state;
- Joe's judgment about whether the message should leave.

### 02 — Opportunity

**Heading:** Create a personalized outreach channel that had not been practical before.

The new use case is mass-personalized outreach:

- not a generic email blast;
- not one manually composed email per person;
- not unattended automated sending.

It prepares a relationship-specific decision for every eligible recipient at low marginal assembly effort, while preserving Joe as the sender and decision maker.

This is the strongest place to explain “agent-era economics.” The point is not that language generation became cheap. The point is that private data validation, conditional personalization, legacy-mailbox integration, and per-message review can now be composed into one operating workflow.

### 03 — Implementation

**Heading:** A mass-personalized campaign with no automatic Send path.

Workflow:

1. Validate the export and preserve suppression, invalid-email, no-home, and multi-home cases.
2. Join approved client/property context and the private Homebot report URL.
3. Render the personalized HTML message and conditional copy.
4. Create the message in SherWeb Exchange with `MessageDisposition=SaveOnly`.
5. Verify the expected draft through a separate read-only lookup.
6. Let Joe review, edit, send, or delete.

### 04 — Verified boundary

**Heading:** What the workflow can already prove.

Keep the ordinary verified-evidence grid in place but dampen it visually. One oversized diagonal WIP sticker crosses the grid, making the unfinished state a single visual layer rather than a stack of explanatory caveats. Its short status copy reads “collecting campaign results.”

The sticker uses a pinned, locally vendored build of [CatsJuice/sticker-forge](https://github.com/CatsJuice/sticker-forge) so visitors can grab the die-cut edge and peel it to reveal the satin back and depth-aware shadow. It resets when released and keeps sound disabled. A matching CSS sticker remains underneath as the loading, reduced-capability, and no-JavaScript fallback.

Verified evidence:

- 240 unique client profiles;
- 237 client/property relationships;
- 200 active, 27 suppressed, six invalid-email, and seven no-home records preserved;
- four multi-home client records retained for review;
- a live synthetic HTML draft accepted through EWS with HTTP 200 and `Success/NoError`;
- exactly one expected subject found through an independent read-only lookup;
- Joe visually confirmed the message in Drafts;
- no automatic send code path.

Business implication:

Before this work, safe personalized APA outreach across the client base was operationally impractical. The bridge from private relationship data to Joe's real Drafts folder now exists.

### Claim boundary

Safe now:

- a previously unavailable personalized-draft capability exists;
- the client data and mailbox path are technically validated;
- the workflow structurally replaces repeated message assembly;
- Joe retains control of every send.

Directional but not yet quantified:

- the workflow can support outreach at a fraction of the marginal manual effort;
- the comparable manual campaign can take about a month, based on an operator estimate.

Do not yet claim:

- the 240-profile batch has been generated or sent;
- campaign conversion, response, revenue, or scheduling outcomes;
- a measured time or cost reduction;
- a completed adoption result.

## Visual system

Keep the current Fred site shell and use a shared NJJoe project strip:

- Overview
- Listing microsite
- APA campaign

The three pages share:

- warm paper field;
- Fraunces editorial type;
- IBM Plex Mono evidence labels;
- serial figure/status voice;
- one coral mark for the central tension;
- calm, stable shell;
- only main content animates in a future production version.

Page-specific evidence:

- Overview: before/after route panels and the shared workflow line
- Microsite: four deliberately separated vendor artifacts, then responsive desktop/mobile full-page captures of the Roosevelt property page inside a scrollable static frame
- APA: discovery funnel, conceptual draft in Exchange, and a faded verified-evidence grid crossed by one tactile WIP sticker

The visual structure should behave like a casebook:

- discovery and pain occupy real space;
- implementation does not arrive before the audience and operator problems are understood;
- outcomes distinguish verified change, directional value, and pending evidence;
- placeholders remain visibly provisional rather than resembling finished endorsements.

The Roosevelt evidence is a pure static image archive with no embedded scripts or interactive dependencies. Desktop and mobile captures preserve the full page while replacing the live Google Maps and Matterport frames with honest labels for those external experiences.
