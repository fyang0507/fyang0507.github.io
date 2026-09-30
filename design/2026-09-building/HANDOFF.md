# Building handoff: round 1 → the port

Last updated 2026-09-30. Read this first after a context compaction or in a new session. It records what Fred chose for the Building section, what shipped, and what is still open. The boards in this folder are the source of truth for *how* each idea looks and moves; this file is the source of truth for *what Fred chose*. The port was planned in `PORT-PLAN.md` and shipped as §8 records.

## 1. Status in one paragraph

Round 1 (`README.md`, the board index at `index.html`) audited the Building board's preview and the Fred Agent and NJJoe sub-sites, then built three complete candidates from board to project: A the back of the card, B go in close, C the dossier. On 2026-09-29 Fred picked **C 档案, the dossier**, and answered the WIP question: no WIP anywhere on the live site (#20 has since removed the treatment). Round 2 drew Demos in C with three focus treatments. An adversarial review of the port plan (`PLAN-REVIEW.md`) found 1 blocking, 11 significant and 6 minor problems; `PORT-PLAN.md` now answers each one and splits the port into eight PRs. Fred answered all nine questions after trying them live on the round-3 board (§4). Demos took two more rounds of its own (`r3-demos-board.html`, `r4-demos-board.html`); Fred approved round 4 with his fine-tunes. The port shipped on 2026-09-30 as eight PRs (#23, #24, #26, #28, #32–#35), and Demos' viewer follows as its own PR (§8). §9 lists what is left for Fred's eye.

## 2. How to look

```sh
python3 -m http.server 4173 --bind 127.0.0.1   # from the repo root
```

- Board index: <http://127.0.0.1:4173/design/2026-09-building/>. The C frames are the third section.
- Live C: `01-board.html?c=c` (take Fred Agent down, then a tab), `02-overview.html?c=c`, `03-principles.html?c=c`, `04-system.html?c=c`, `05-njjoe.html?c=c`. The switcher in each page's lower-left corner keeps C for the session; "now ↗" opens the same page on the live site.
- Round 2: `r2-02-demos-board.html`, and `r2-02-demos.html?f=1|2|3`.
- Round 3: `r3-decisions.html`, every open question of §4 with its options live (`?q2=a&q3=c…`, shareable). The r3 pages (`r3-board.html`, `r3-overview.html`, `r3-system.html`, `r3-principles.html`, `r3-components.html`, `r3-njjoe.html`) are round 1's C with the r3 options; each has a corner bar for its own questions.
- Demos, rounds 3 and 4: `r3-demos-board.html` with `r3-demos.html`, then `r4-demos-board.html` with `r4-demos.html?h=a|b|c` (how the pen points at a region; Fred picked A).
- `python -m http.server` sends no cache headers. If a board looks stale, hard-reload.
- **The boards as drawn.** Boards load production files through `../../` (`design/README.md`, Conventions), and main has since deleted or moved some of them: the WIP sticker's files (#20), the Demos captures, now in `images/evidence/` (#26), the lockup's sticker images (#31, the seals) and NJJoe's `casebook.js` (#34). Served from main, 17 of the 19 board pages request at least one missing file; only `index.html` and `r2-02-demos-board.html` load clean. Their headers and "current site" frames also show the site as it is now, not as it was. To see the boards as they were drawn, serve this folder over `b085f70`, the main that round 1 was drawn on. All 19 load there with no failed request and no console error:

  ```sh
  git worktree add ../fy-building b085f70
  git -C ../fy-building checkout origin/main -- design/2026-09-building
  cd ../fy-building && python3 -m http.server 4173 --bind 127.0.0.1
  ```

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
3. **Demos: (c) F3, amended.** The enlargement is overlaid on the capture itself, in its frame, instead of sliding out below it, with ← → stepping through the regions and much bigger, unmissable markers. Agent demos-r3 is drawing it as `r3-demos*` on `design/demos-r3`, to be cherry-picked here. **Awaiting Fred's final look at that board.** The two draft captions (Fig. 02, Fig. 04) are settled with it. *Since then:* his notes on round 3 led to round 4 (`r4-demos-board.html`), which he approved with the captions and his fine-tunes (§8).
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
- Demos, round 3 (drawn on `design/demos-r3`, cherry-picked here): `r3-demos-board.html`, `r3-demos.html` with `r3-demos.css`, `r3-demos.js` and `r3-demos-kit.js`, and `shots/r3-demos-*`.
- Demos, round 4: `r4-demos-board.html` (Fred's notes on round 3, and the three ways the pen points), `r4-demos.html` with `r4-demos.css`, `r4-demos.js`, `r4-demos-kit.js` and `r4-demos-hl.js` (`?h=a|b|c`), and `shots/r4-*`.

## 7. Next actions

1. Fred's calls on §9, and his pass on real phones after the deploy.

## 8. Shipped

Every PR in `PORT-PLAN.md` §1 merged on 2026-09-30. Two landed out of the plan's order: T after PR 2, and PR 4 before PR 3, so NJJoe's pages already carried the tab names when the moves arrived. The two branches the plan waited on merged in between: #29, the fonts branch (Fraunces, Caveat and IBM Plex Mono self-hosted), and #31, the identity port (the seals).

| Plan | PR | Title | Merged |
|---|---|---|---|
| 1a · Static board | #23 | Building: a static page, with the board there at first render | 1st |
| R · Rail extraction | #24 | Reading: the margin rail's styles in their own file, its hosts from the context | 2nd |
| E · Evidence ladder | #26 | Building sub-sites: evidence images from a derived ladder, and no request to Joe's server | 3rd |
| 1b · The dossier | #28 | Building: every card gets its dossier | 4th |
| T · Board typeface | #33 | Building: the board's English in Fraunces | 6th |
| 2 · Fred Agent | #32 | Fred Agent: the five chapters on the site's architecture, in the dossier | 5th |
| 3 · The moves | #35 | Building: the way in, the way back and the chapter move | 8th |
| 4 · NJJoe | #34 | NJJoe: the casebook on the site's architecture, in the dossier | 7th |
| Demos, PR 2's deferred viewer | #37 | Fred Agent: Demos' evidence viewer, round 4 with Fred's fine-tunes | 9th |

What each review found, and what changed because of it:

- **1a · #23.** No separate review is recorded. Its two new checks (every card on the board at `pagereveal`) fail on main with 0 of 7 cards and pass; at rest the page is pixel-identical to main; LCP went from 932 to 868 ms at 1440 and from 1044 to 936 at 390, and nothing loads from unpkg.
- **R · #24.** No separate review is recorded. Reading matched main over 206 shots and the computed styles of 25 rail selectors; `rail.css` declares no font face, so no page but Reading fetches `NotoSerifSC-text`.
- **E · #26.** No separate review is recorded. It found `loading="lazy"` broken on main (React set `src` first, so all ten Demos images loaded at once) and fixed it; Demos went from 14.0 to 1.10 MB before scroll, and nothing is requested from `apa.njjoegroup.com`.
- **1b · #28.** The review found no functional bugs. Fixed from it: its merge blocker, AGENTS.md's wording on bands on kraft; a phone dossier sized from the narrowed card (305 px, now the mock's 327); the slide's overshoot opening a gap under the card on a tall sheet (the tuck now reads the spring's real peak); the peek tucking on an ease-out, now a spring. Three details went to Fred (§9).
- **T · #33.** No separate review is recorded. LCP is 32 ms faster at both widths, and the NotoSerifSC-ui preload went: nothing on the board renders in it, and keeping it cost 72 ms at 1440.
- **2 · #32.** The review found two bugs, the phone strip's ink measured from the hidden rail and System's map tabbing against its visual order, and six small items: the map's fades under reduced motion, print and forced colours, the skip link's scroll margin, "05 / 5", `lang` on the rail's Chinese, and a hard-coded test path. All were fixed, with checks. Demos kept main's viewer until its own round.
- **3 · #35.** Fixed from the review, with checks: NJJoe's "Transition was skipped" (by merging PR 4 first), stray swings on a back/forward-cache way back after a pan, a stale referrer on those restores, the flower's re-pin on the way back, and a duplicated site-root parser. Q2's layering holds: with the card unnamed, the way back drew the tabs over it in 11 of 17 poses; now in none.
- **4 · #34.** Fixed from the review, with checks: the APA code string overflowing at 761–900 px, cramped tab strips at tablet widths, an invented "another link ↗", and a missing space in "01 URL".
- **Demos.** Round 4 as Fred approved it, with his fine-tunes: the pen's corners (A) thicker, coral in the enlargement, the put-back reworked, and no underline on the viewer's buttons. It deletes #32's loupes, focus mode and sideways canvases, and `project-demos.mjs` checks it. Fixed from the review, with checks: a swipe at the phone window's edge landed on the next region out of view, carried on by the swipe's momentum (a swipe into the edge no longer scrolls the window); Chrome's synthetic pointer events, fired when the page scrolls under a still mouse, cleared the corners keyboard focus had drawn (mouse and keyboard now mark their own regions); selecting the note's text past the enlargement's edge put it back; a failed zoom load showed the broken-image glyph; entries were named by their whole note; the old corners lingered on a step to another print.
- **#36**, a batch of small fixes, also moved each chapter's "← Building board" after its sheet (`</main>`), so the keyboard reaches it after the chapter, not between the tabs and the sheet. It is placed by grid-area, so nothing moves.

## 9. Open for Fred

Details that shipped differently from C's mock or need his call:

- **The dossier's rows are about 20% taller than the mock's.** The pen-spacing rule (whatever follows an underline sits at least 10 px below it and at least twice its drop) opened each chapter's row. (#28)
- **On a phone, the dossier's tabs show numbers only.** Where the window has no room beside the sheet, the tabs stand on its top edge as numbers, with their names kept for screen readers; the mock named every tab there, on two rows. (#28)
- **Pin-back waits 260 ms, against the mock's 150.** The card leaves your hand once its sheet has slid home behind it (240 ms, plus 20); the mock sent it off 150 ms into that slide. (`lib/building/unpin.js`, `dossier.js`)
- **The chapter pages' tabs become the top strip at ≤1000 px**, where the mock switched at 760, so iPad portrait gets the strip instead of the fore-edge. (#32)
- **Fred Agent's repository link is private.** The card and its dossier link `github.com/fyang0507/fred-agent`, which a visitor gets as a 404; in the dossier's foot, "repository ↗" sits right after "source · private working repository". `llms.txt` lists it too. (#28)
