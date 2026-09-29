# Building handoff: round 1 → the port

Last updated 2026-09-29. Read this first after a context compaction or in a new session. It records what Fred chose for the Building section and what is still open. The boards in this folder are the source of truth for *how* each idea looks and moves; this file is the source of truth for *what Fred chose*. The port is planned in `PORT-PLAN.md`.

## 1. Status in one paragraph

Round 1 (`README.md`, the board index at `index.html`) audited the Building board's preview and the Fred Agent and NJJoe sub-sites, then built three complete candidates from board to project: A the back of the card, B go in close, C the dossier. On 2026-09-29 Fred picked **C 档案, the dossier**, and answered the WIP question: no WIP anywhere on the live site. One smaller question is still open (whether a click on a card unpins it or goes straight in); the plan uses a default and marks it. Nothing is ported yet. The branch `design/building` carries the boards, this file and the plan, rebased onto `b085f70` (the shared runtime in `lib/shared/`).

## 2. How to look

```sh
python3 -m http.server 4173 --bind 127.0.0.1   # from the repo root, on design/building
```

- Board index: <http://127.0.0.1:4173/design/2026-09-building/>. The C frames are the third section.
- Live C: `01-board.html?c=c` (take Fred Agent down, then a tab), `02-overview.html?c=c`, `03-principles.html?c=c`, `04-system.html?c=c`, `05-njjoe.html?c=c`. The switcher in each page's lower-left corner keeps C for the session; "now ↗" opens the same page on the live site.
- `python -m http.server` sends no cache headers. If a board looks stale, hard-reload.

## 3. Decisions (Fred's calls)

### Round 1: C 档案, the dossier

Everything C shows in the boards is settled, as built:

- **The preview.** A project with pages keeps a dossier pinned behind its card. At rest only its index tabs show, peeking past the card's right edge, one per chapter (five for Fred Agent, three for NJJoe). Unpin is unchanged: the pin pops, the card comes to your hand on its spring. In your hand the dossier slides out from behind the card, with one small overshoot, and opens at its contents sheet: each chapter's own title and a line, the one figure, status and dates, the repository, and the index tabs down its fore-edge. A slip without pages gets one sheet and one tab, to its repository.
- **The way in.** A tab is the way in: the tabs travel from the dossier's fore-edge to the project page's fore-edge on springs, a relay 26 ms apart, and the paper swaps under them.
- **The way back.** The page's tabs fly back and tuck behind the card, then the board pins it: the pin is pushed in on its held frames, with the impact ticks and the ripple through the cork. The board is where you left it.
- **The pages.** The project page is the open dossier: one long sheet with a kraft edge, a typed file label ("FIELD NOTES · FRED AGENT · 01 / 05"), the facts as stamped outlines, the board's own card clipped to the corner, and the index tabs down the fore-edge. The tabs stay put while you read, and the current one is pulled out and banded in wheat. On a phone the tabs are a strip above the sheet, as Writing's side index is.
- **The principles TOC** is Reading's pencil margin, in its own vocabulary: the graphite line, a tick and mono number per principle, the pen's wheat loop on the current one, the preview slip, and the phone strip with its counter.
- **The system map is drawn by the pen.** The columns read left to right: handles → protocols → outcomes. Hovering draws the path's lines in the pen's coral, one confident pass that retracts faster; locking a module cools them into the wheat band's edge, where they stay.
- **The chapter move replaces the in-place swap.** A fore-edge tab is a cross-document move: the tabs settle on a spring, and the sheet in front is pulled aside to the left, or put back from the left for an earlier chapter. fred-agent.js's fetch-and-swap router goes.
- **The rules every candidate met** carry into the port: static pages, the site's header, tokens, self-hosted fonts and pen states; no gradient, gloss, glass blur, fade-and-rise or ambient loop; every view-transition animation moves only transform or opacity; one element per name; no transition under reduced motion.

A and B were not chosen. Their boards stay as lineage.

### WIP: none on the live site

Fred, 2026-09-29: "There shouldn't be any WIP sticker in the live website, if there are just remove that section; if the WIP sticker itself (including the template) is causing any problem, remove it."

- No WIP appears anywhere in the port. The boards' Case 02 "campaign results" section with its sticker, and the sticker's static face in NJJoe's dossier row, are dropped.
- The NJJoe restyle shows only finished sections, as the live site does today. There is no campaign-results section; Case 02 keeps its factual state, "active pilot".
- The pusher question is moot.
- A separate PR, #20 (`chore/remove-wip`), removes the whole treatment: the WIP code in `assets/njjoe/casebook.js` and `casebook.css`, the vendored sticker-forge bundle, `assets/wip-pusher-mask.png`, the set-section-wip skill, the AGENTS.md rule and the NOTICE.md entries. The port assumes none of it exists.

## 4. Awaiting Fred's confirmation (the plan's defaults)

- **Unpinning stays (default).** A click lifts the card into your hand, the dossier slides out, and a chapter tab goes in. The card's direct link ("Enter the field notes →" on Fred Agent, "Open field studies →" on NJJoe) still goes straight in; its way in is the same tab flight, starting from the tabs peeking behind the card. If Fred wants a click to go straight into the project instead, `PORT-PLAN.md` § "If a click goes straight in" lists what changes. The orchestrator has given Fred three options and recommended keeping unpin plus the dossier; no answer yet.
- **The Demos focus treatment (round 2).** `r2-02-demos-board.html` shows Demos in C with the real content and three blur-free focus treatments for the evidence viewers: F1 the pen's loop, F2 tracing paper, F3 an enlargement pulled out from under the capture (recommended; the only one that makes captures readable on a phone). The board ends with the question for Fred. Its known gaps are listed on the board.

Decided on Fred's behalf in round 1, and carried into the port unless he says otherwise:

- The board is a static page, with no `support.js`, so that a card can fly back into its slot.
- Chapter numbers follow the live nav: Fred Agent 01–05; NJJoe 00–02, following its "Case 01 / Case 02".
- The chapters the boards didn't mock (Components, Demos, NJJoe's microsite and APA pages, the email demo) are designed in C's language in the port. `PORT-PLAN.md` says which of them need Fred's eyes first.

Content mismatches the audit found, both resolved on main by Fred:

- **Resolved (`1e157d1`):** Fred Agent is `2025—now` everywhere. The Building card now reads `2025—now`, matching the field notes.
- **Resolved (`583969b`):** the overview's "Watch it operate" card now reads "Five outcome-first scenarios, each with the evidence behind it.", wording Fred approved. The port carries this sentence, not the old promise of placeholders that the boards still show.

## 5. What the boards got wrong (fix in the port)

- The kraft tabs' ink (`#6E5A3A` on `#D8C29A`) reads about 3.8:1, under the 4.5:1 small text needs; darken it.
- The wheat band is faint on kraft. The pen's coral also needs a per-paper value on kraft, as pen.css gives cork and wheat.
- On a phone the dossier's tabs read as buttons, not tabs.
- The paperclip on the card is CSS borders; draw it as one pen line.
- On short phones, the hand's layer has to scroll for the dossier to fit (the boards set that).
- The board's type stack puts Noto Serif SC ahead of Fraunces, so curly quotes and dashes in English card text would render full-width. The content is ASCII today.
- The boards load the shared runtime through `00-live.css` and `00-live.js`; production pages load it directly in the documented head order.

## 6. Files

- `README.md`: the audit, all three candidates, their records and costs, and the round-1 question.
- `PORT-PLAN.md`: C's port, as a stack of PRs.
- `index.html`, `01-*`–`05-*`: the boards (C's code is `01-dossier.js`, `02-c.css`, and the `c` branches of `00-vt.js`, `01-board.*`, `04-map.*`).
- `shots/`: the audit (`now-*`) and every candidate's frames (`c-*` for the pick).
- Round 2: `r2-02-demos-board.html` (the board and Fred's question), `r2-02-demos.html` with `r2-02-demos.css`, `r2-02-demos.js` and `r2-kit.js` (`?f=1|2|3`), and `shots/r2-*`.

## 7. Next actions

1. Fred: confirm or change the unpin default (§4), and look at the round-2 board for the Demos evidence viewers (`PORT-PLAN.md` § 6) before its PR.
2. The port, in the order `PORT-PLAN.md` sequences it against the work in flight.
