# Building handoff: round 1 → the port

Last updated 2026-09-29. Read this first after a context compaction or in a new session. It records what Fred chose for the Building section and what is still open. The boards in this folder are the source of truth for *how* each idea looks and moves; this file is the source of truth for *what Fred chose*. The port is planned in `PORT-PLAN.md`.

## 1. Status in one paragraph

Round 1 (`README.md`, the board index at `index.html`) audited the Building board's preview and the Fred Agent and NJJoe sub-sites, then built three complete candidates from board to project: A the back of the card, B go in close, C the dossier. On 2026-09-29 Fred picked **C 档案, the dossier**, and answered the WIP question: no WIP anywhere on the live site (#20 has since removed the treatment). Round 2 drew Demos in C with three focus treatments. An adversarial review of the port plan (`PLAN-REVIEW.md`) found 1 blocking, 11 significant and 6 minor problems; `PORT-PLAN.md` now answers each one and splits the port into eight PRs. Fred answered all nine questions after trying them live on the round-3 board (§4); only Q3's amended Demos board waits for his final look. Nothing is ported yet. The branch `design/building` is rebased onto `cca4134`, where #20, #21 and #22 have merged.

## 2. How to look

```sh
python3 -m http.server 4173 --bind 127.0.0.1   # from the repo root, on design/building
```

- Board index: <http://127.0.0.1:4173/design/2026-09-building/>. The C frames are the third section.
- Live C: `01-board.html?c=c` (take Fred Agent down, then a tab), `02-overview.html?c=c`, `03-principles.html?c=c`, `04-system.html?c=c`, `05-njjoe.html?c=c`. The switcher in each page's lower-left corner keeps C for the session; "now ↗" opens the same page on the live site.
- Round 2: `r2-02-demos-board.html`, and `r2-02-demos.html?f=1|2|3`.
- Round 3: `r3-decisions.html`, every open question of §4 with its options live (`?q2=a&q3=c…`, shareable). The r3 pages (`r3-board.html`, `r3-overview.html`, `r3-system.html`, `r3-principles.html`, `r3-components.html`, `r3-njjoe.html`) are round 1's C with the r3 options; each has a corner bar for its own questions.
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

## 4. The port's questions: answered 2026-09-29

Fred tried every option on `r3-decisions.html` and answered all nine. `PORT-PLAN.md` carries each answer; the one thing still to see is the round-3 Demos board (Q3).

1. **A click on a card: (a).** It unpins, the card comes to your hand, and the dossier slides out with its chapter tabs: C as picked. 1b builds it.
2. **Coming back to the board: (a).** The board brings the card you came back from into view, worked out from the page you left, with no storage. Fred found one bug in the mock: the returning tabs were drawn over the card for the whole move, then snapped under it as it ended ("the order of layer should be correct at the first place"). Fixed in round 3: the card in play is its own view-transition group above the tabs, so whatever sits under the card at rest is under it in every frame. `r3-layers.mjs` checks it pose by pose, and PR 3 carries the rule and the check.
3. **Demos: (c) F3, amended.** The enlargement is overlaid on the capture itself, in its frame, instead of sliding out below it, with ← → stepping through the regions and much bigger, unmissable markers. Agent demos-r3 is drawing it as `r3-demos*` on `design/demos-r3`, to be cherry-picked here. **Awaiting Fred's final look at that board.** The two draft captions (Fig. 02, Fig. 04) are settled with it.
4. **Components and the margin rail: (b).** "Let it be consistent": Components gets the rail, five landmarks, one per component, like Principles.
5. **The board's typeface: (b).** Fraunces first on the board. It becomes its own small PR, T, after the self-hosted fonts land, so the Fraunces subset can be preloaded; LCP no worse.
6. **The current chapter tab: (b).** Kraft with the wheat band, as the boards drew it, chosen with the 1.11:1 number in view. The concept stays; the band's own darker wheat edge carries the state on kraft (3.56:1, `PORT-PLAN.md` §7).
7. **Tabs on a phone: (a).** Every tab shows: numbers only, the current one named, the reading counter on the line below. The phone board's cards narrow so the peeking tabs sit inside the cork.
8. **The card's direct link: (a).** The tabs peeking behind the card fly to the page's fore-edge, and they start under the card (Q2's layering rule).
9. **The email demo's images: (a).** "Keep everything into our own and with no NJJoe dependency": `buyer.html`'s four images become copies in the repo, archived and derived like the evidence. The evidence-ladder PR (E, `building/evidence-ladder`) takes them on.

Decided for Fred and not objected to: Building becomes a static page; NJJoe's chapters number 00–02; the unmocked pages are designed in C's language and shown as before/after screenshots in their PRs; the fixes in §5.

## 5. What the boards got wrong (fixed in the port)

- **Kraft inks.** The tabs' `#6E5A3A` reads 3.80:1 on kraft, under 4.5; tab text is `--ink` (7.57:1). The pen's coral multiplied by kraft reads 2.86:1, under 3; on kraft the pen is `--mark-deep` (3.45:1). The wheat band on kraft reads 1.11:1; Fred kept it (Q6), so its darker wheat edge carries the state on kraft.
- **Phones.** The dossier's tabs read as buttons; they sit on its top edge as tabs. The project strip cut tabs off and put the counter on a tab (Q7). The peeking tabs were clipped by the cork at 390, and the way back ended by popping from five tabs to slivers; the cards narrow so they fit.
- **The way back returned the board to its start.** `fy-vt` lasts one hop, so the mock's board lost its position and tucked tabs behind an off-screen card; the port brings the card into view (Q2).
- **The way back drew the tabs over the card**, then snapped them under it at the end, because every named group paints above the page's snapshot; the card in play is its own group above the tabs (Q2, round 3).
- The paperclip on the card is CSS borders; it is drawn as one pen line.
- On short phones, the hand's layer has to scroll for the dossier to fit.
- The boards load the shared runtime through `00-live.css` and `00-live.js`; production pages load it directly, in the documented head order.
- The type stack puts Noto Serif SC before Fraunces; Fraunces goes first in PR T (Q5).

## 6. Files

- `README.md`: the audit, all three candidates, their records and costs, and the round-1 question.
- `PORT-PLAN.md`: C's port as eight PRs, Fred's answers carried in, and the review's findings answered in §12.
- `PLAN-REVIEW.md`: the adversarial review of the first plan.
- `index.html`, `01-*`–`05-*`: the boards (C's code is `01-dossier.js`, `02-c.css`, and the `c` branches of `00-vt.js`, `01-board.*`, `04-map.*`).
- `shots/`: the audit (`now-*`) and every candidate's frames (`c-*` for the pick).
- Round 2: `r2-02-demos-board.html` (the board and the question), `r2-02-demos.html` with `r2-02-demos.css`, `r2-02-demos.js` and `r2-kit.js` (`?f=1|2|3`), and `shots/r2-*`.
- Round 3: `r3-decisions.html` with `r3-decisions.js` (the switches); `r3-kit.js` (the picks, in sessionStorage `fy-r3`), `r3-vt.js` (C's moves and Q8's cut), `r3-board.js` (Q2's two returns, Q8's naming), `r3.css` (the kraft inks, the phone peek, Q5–Q7), `r3-components.*` (the Components mock and Q4), `r3-layers.mjs` (the layering check for the moves); the r3 pages are copies of round 1's markup with those loaded.

## 7. Next actions

1. Fred looks at the round-3 Demos board (`r3-demos*`, from `design/demos-r3`) and confirms it, with the Fig. 02 and Fig. 04 captions.
2. Without waiting: 1a (Building static), R (the rail extracted), E (the evidence ladder, in progress, now with `buyer.html`'s images) and 1b (the dossier).
3. Then, as `PORT-PLAN.md` §1 orders them: 1b; T after the fonts branch; PR 2 after the identity port, the fonts branch and the Demos board; PR 3; PR 4.
