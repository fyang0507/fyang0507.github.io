# Building handoff: round 1 → the port

Last updated 2026-09-29. Read this first after a context compaction or in a new session. It records what Fred chose for the Building section and what is still open. The boards in this folder are the source of truth for *how* each idea looks and moves; this file is the source of truth for *what Fred chose*. The port is planned in `PORT-PLAN.md`.

## 1. Status in one paragraph

Round 1 (`README.md`, the board index at `index.html`) audited the Building board's preview and the Fred Agent and NJJoe sub-sites, then built three complete candidates from board to project: A the back of the card, B go in close, C the dossier. On 2026-09-29 Fred picked **C 档案, the dossier**, and answered the WIP question: no WIP anywhere on the live site (#20 has since removed the treatment). Round 2 drew Demos in C with three focus treatments. An adversarial review of the port plan (`PLAN-REVIEW.md`) found 1 blocking, 11 significant and 6 minor problems; `PORT-PLAN.md` now answers each one and splits the port into seven PRs. Three of them (1a, R, E) can start now; the rest wait on the nine questions in §4. Nothing is ported yet. The branch `design/building` is rebased onto `cca4134`, where #20, #21 and #22 have merged.

## 2. How to look

```sh
python3 -m http.server 4173 --bind 127.0.0.1   # from the repo root, on design/building
```

- Board index: <http://127.0.0.1:4173/design/2026-09-building/>. The C frames are the third section.
- Live C: `01-board.html?c=c` (take Fred Agent down, then a tab), `02-overview.html?c=c`, `03-principles.html?c=c`, `04-system.html?c=c`, `05-njjoe.html?c=c`. The switcher in each page's lower-left corner keeps C for the session; "now ↗" opens the same page on the live site.
- Round 2: `r2-02-demos-board.html`, and `r2-02-demos.html?f=1|2|3`.
- `python -m http.server` sends no cache headers. If a board looks stale, hard-reload.

## 3. Decisions (Fred's calls)

### Round 1: C 档案, the dossier

Everything C shows in the boards is settled, as built:

- **The preview.** A project with pages keeps a dossier pinned behind its card. At rest only its index tabs show, peeking past the card's right edge, one per chapter (five for Fred Agent, three for NJJoe). Unpin is unchanged: the pin pops, the card comes to your hand on its spring. In your hand the dossier slides out from behind the card, with one small overshoot, and opens at its contents sheet: each chapter's own title and a line, the one figure, status and dates, the repository, and the index tabs down its fore-edge. A slip without pages gets one sheet and one tab, to its repository.
- **The way in.** A tab is the way in: the tabs travel from the dossier's fore-edge to the project page's fore-edge on springs, a relay 26 ms apart, and the paper swaps under them.
- **The way back.** The page's tabs fly back and tuck behind the card, then the board pins it: the pin is pushed in on its held frames, with the impact ticks and the ripple through the cork. The board is where you left it. (The mock couldn't keep that promise; the port's default and the question are Q2.)
- **The pages.** The project page is the open dossier: one long sheet with a kraft edge, a typed file label ("FIELD NOTES · FRED AGENT · 01 / 05"), the facts as stamped outlines, the board's own card clipped to the corner, and the index tabs down the fore-edge. The tabs stay put while you read, and the current one is pulled out and banded in wheat (the band can't be seen on kraft, hence Q6). On a phone the tabs are a strip above the sheet, as Writing's side index is.
- **The principles TOC** is Reading's pencil margin, in its own vocabulary: the graphite line, a tick and mono number per principle, the pen's wheat loop on the current one, the preview slip, and the phone strip with its counter.
- **The system map is drawn by the pen.** The columns read left to right: handles → protocols → outcomes. Hovering draws the path's lines in the pen's coral, one confident pass that retracts faster; locking a module cools them into the wheat band's edge, where they stay.
- **The chapter move replaces the in-place swap.** A fore-edge tab is a cross-document move: the tabs settle on a spring, and the sheet in front is pulled aside to the left, or put back from the left for an earlier chapter. fred-agent.js's fetch-and-swap router goes.
- **The rules every candidate met** carry into the port: static pages, the site's header, tokens, self-hosted fonts and pen states; no gradient, gloss, glass blur, fade-and-rise or ambient loop; every view-transition animation moves only transform or opacity; one element per name; no transition under reduced motion.

A and B were not chosen. Their boards stay as lineage.

### WIP: none on the live site

Fred, 2026-09-29: "There shouldn't be any WIP sticker in the live website, if there are just remove that section; if the WIP sticker itself (including the template) is causing any problem, remove it."

- No WIP appears anywhere in the port. The boards' Case 02 "campaign results" section with its sticker, and the sticker's static face in NJJoe's dossier row, are dropped.
- The NJJoe restyle shows only finished sections, as the live site does today. Case 02 keeps its factual state, "active pilot".
- #20 (merged) removed the whole treatment: the WIP code in `assets/njjoe/casebook.js` and `casebook.css`, the vendored sticker-forge bundle, `assets/wip-pusher-mask.png`, the set-section-wip skill, the AGENTS.md rule and the NOTICE.md entries.

### Content, resolved on main by Fred

- `1e157d1`: Fred Agent is `2025—now` everywhere, the card included. The dossier data and the mocks' text agree; the round-1 screenshots predate the fix.
- `583969b`: the overview's "Watch it operate" card reads "Five outcome-first scenarios, each with the evidence behind it." The port carries this sentence, not the promise of placeholders that `02-overview.html` still shows.

## 4. Awaiting Fred

Every question has a recommendation, so "all recommended" is a complete answer; otherwise answer by number and letter ("1a, 3c, 4b…"). 1a, R and E (`PORT-PLAN.md` §1) wait on none of these.

1. **A click on a card.** (a) It unpins: the card comes to your hand and the dossier slides out with its chapter tabs. *Recommended: it is C as you picked it.* (b) It goes straight into the project, and the dossier becomes a peek on the board. (c) Split by card: cards with pages go straight in, and slips without pages still unpin to their one sheet.
   Blocks 1b and the two ends of PR 3. R, E, PR 2 and PR 4 go ahead.
2. **Coming back to the board.** (a) The board brings the card you came back from into view, pinned in its place. *Recommended: it's worked out from the page you left, so nothing new is remembered.* (b) The board exactly where you left it, remembered for the session.
   Blocks only PR 3, which builds (a) unless you say (b).
3. **Demos' evidence viewers** (`r2-02-demos-board.html`). (a) F1, the pen's loop on the region. (b) F2, tracing paper with windows cut out. (c) F3, an enlargement pulled out from under the capture. *Recommended: F3, the only one that makes a capture readable on a phone.* The magnifiers go, so two captions change. Approve them as written or edit them here:
   - Fig. 02: "The numbers on the capture are the notes below it. Choose one to look closer; Esc puts it back."
   - Fig. 04: "The numbers mark the auto-investigation rule and the task → error → fixed loop; the second report shows the same recovery pattern again."

   They're written for F3; with F1 or F2, "look closer" changes. Blocks PR 2's Demos page; everything else goes ahead.
4. **Components and the margin rail.** (a) No rail: its "Component index" stays the page's index, typed as a contents list. *Recommended: your brief for Fred Agent was "restyle, keep structure", and the boards showed the rail only on Principles.* (b) The index becomes the margin rail, with five landmarks.
   Blocks PR 2's Components page only.
5. **The board's typeface.** (a) No change: the cards' English stays in Noto Serif SC's Latin letters, as today. *Recommended: the content is plain ASCII, so the full-width punctuation the audit found can't show, and a switch would restyle every card and risk a slower first paint.* (b) Fraunces first, as its own small PR, with before/after shots and a speed run.
   Blocks nothing.
6. **The current chapter tab.** (a) Paper, pulled out and banded in wheat, while the other tabs stay kraft. *Recommended: the wheat band on kraft measures 1.11:1, too faint to see.* (b) Kraft with the wheat band, as the boards drew it.
   Blocks PR 2's fore-edge tabs.
7. **Tabs on a phone.** (a) Every tab shows: numbers only, the current tab with its name, and the reading counter ("05 / 11") on the line under the tabs. *Recommended: in the mock at 390, tabs 04–05 were cut off and the counter sat on tab 03.* (b) Names on every tab, in a strip that scrolls sideways with some tabs off-screen.
   Either way, the phone board's cards narrow by 22 px so the peeking tabs sit inside the cork, not clipped to slivers. Blocks PR 2's phone strip only.
8. **The card's direct link** ("Enter the field notes →", "Open field studies →"). (a) The tabs peeking behind the card fly to the page's fore-edge, as a dossier tab's do. *Recommended: it's the way back run forward, so nothing new to build, though the boards never showed it.* (b) No flight: a plain cut into the page.
   Blocks PR 3 only.
9. **The email demo's images.** `building/njjoe/email-demo/buyer.html` loads four images (1.29 MB) from Joe's server, `apa.njjoegroup.com`. (a) Copy them into the repo as derived images, so the evidence can't change or break when his site does. *Recommended, if Joe is fine with copies in your public repo.* (b) Keep loading them from his server, and exempt that one host from the checks.
   Blocks PR 4 only.

Decided for you, unless you object: Building becomes a static page, so a card can fly back into its slot; NJJoe's chapters number 00–02, after its "Case 01 / Case 02"; the unmocked pages (Components, the microsite, APA) are designed in C's language and shown as before/after screenshots in their PRs; the fixes in §5.

## 5. What the boards got wrong (fixed in the port)

- **Kraft inks.** The tabs' `#6E5A3A` reads 3.80:1 on kraft, under 4.5; tab text is `--ink` (7.57:1). The pen's coral multiplied by kraft reads 2.86:1, under 3; on kraft the pen is `--mark-deep` (3.45:1). The wheat band on kraft reads 1.11:1, hence Q6.
- **Phones.** The dossier's tabs read as buttons; they sit on its top edge as tabs. The project strip cut tabs off and put the counter on a tab (Q7). The peeking tabs were clipped by the cork at 390, and the way back ended by popping from five tabs to slivers; the cards narrow so they fit.
- **The way back returned the board to its start.** `fy-vt` lasts one hop, so the mock's board lost its position and tucked tabs behind an off-screen card; the port brings the card into view (Q2).
- The paperclip on the card is CSS borders; it is drawn as one pen line.
- On short phones, the hand's layer has to scroll for the dossier to fit.
- The boards load the shared runtime through `00-live.css` and `00-live.js`; production pages load it directly, in the documented head order.
- The type stack's Noto-before-Fraunces order is kept for now (Q5).

## 6. Files

- `README.md`: the audit, all three candidates, their records and costs, and the round-1 question.
- `PORT-PLAN.md`: C's port as seven PRs, with the review's findings answered in §11.
- `PLAN-REVIEW.md`: the adversarial review of the first plan.
- `index.html`, `01-*`–`05-*`: the boards (C's code is `01-dossier.js`, `02-c.css`, and the `c` branches of `00-vt.js`, `01-board.*`, `04-map.*`).
- `shots/`: the audit (`now-*`) and every candidate's frames (`c-*` for the pick).
- Round 2: `r2-02-demos-board.html` (the board and the question), `r2-02-demos.html` with `r2-02-demos.css`, `r2-02-demos.js` and `r2-kit.js` (`?f=1|2|3`), and `shots/r2-*`.

## 7. Next actions

1. Fred answers §4, in one message.
2. Without waiting: 1a (Building static), R (the rail extracted) and E (the evidence ladder), in parallel.
3. Then, as `PORT-PLAN.md` §1 orders them: 1b after Q1; PR 2 after Q3, Q4, Q6, Q7, the identity port and the fonts branch; PR 3; PR 4 after Q9.
