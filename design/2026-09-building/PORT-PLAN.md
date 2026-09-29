# Building · C to production: the port plan

The plan for taking Fred's pick, C 档案 the dossier (`HANDOFF.md` §3), to production as a stack of four PRs, each shippable and verifiable on its own. Nothing here is implemented yet. It assumes `chore/remove-wip` has removed the WIP treatment (no WIP anywhere, per Fred) and uses one default that awaits Fred's confirmation: unpinning stays (§7 lists what changes if it doesn't).

## 0. Ground rules for every PR

- AGENTS.md as it stands after `b085f70`: static header outside any template, the documented head order, shared tokens only in `lib/shared/site-tokens.css`, subset fonts only, the pen's states through `Tier.wire`, no gradients, gloss, glass blur, fade-and-rise entrances, parallax or ambient loops, runtime code in `lib/`, no `?v=`, relative URLs, code files under 500 lines.
- Transitions: every view-transition animation changes only transform and opacity (a clip may be set but holds still); every name is assigned in `lib/shared/transitions.css`, one rendered element per name per document; no transition under reduced motion; engines without cross-document view transitions keep a hard cut.
- Each PR ships with its checks in `scripts/verify/` and passes the existing suites it touches. None regresses LCP (§9).
- No WIP. The NJJoe pages show only finished sections, as today.

## 1. The stack at a glance

| PR | What ships | Depends on | Size | Fred's eyes first |
|---|---|---|---|---|
| 1 · The board | Building as a static page; the dossier on every card (peeking tabs at rest, the dossier in your hand) | the fonts branch, the identity port, the FY.mount WebKit fix (all touch the same files) | M | no (the unpin default aside) |
| 2 · Fred Agent | the five chapters on the site's architecture, in the dossier's look; the rail on principles (and components); the pen-drawn map; derived evidence images | PR 1, the identity port, the fonts branch, the Writing CN/EN branch (rail.js), a round-2 board for Demos | L | Demos (a round-2 board) |
| 3 · The moves | the way in, the way back and the chapter move, as cross-document transitions; transitions.js learns `building/<id>/` pages | PR 1, PR 2 | M | no |
| 4 · NJJoe | the casebook's three pages and the email demo on the site's architecture, in the dossier's look, finished sections only | PR 2, `chore/remove-wip` | M | no |

Two differences from the obvious split, on purpose:

- **NJJoe's move onto the site's architecture travels with its restyle (PR 4), not with Fred Agent's (PR 2).** The restyle *is* the port: moving the old look onto the new architecture first would build CSS only to delete it a PR later.
- **PR 2 deletes fred-agent.js's in-place swap, and PR 3 adds the chapter move.** The router is written against the old markup (`#dc-root .fa-page`, the template). Porting it to the new pages, only to delete it in PR 3, buys a transition for one release window; instead chapters hard-cut in that window.

PR 4 can merge before or after PR 3: its pages carry the tab names either way, and without PR 3's code transitions.js simply doesn't recognise them (a hard cut, as today). PR 2 is the one to split for review if it runs large (§3, "Review split"), but it merges as one: a Fred Agent with chapters in two looks shouldn't deploy.

## 2. PR 1 · The board: a static page, and the dossier on every card

**What ships.** Building.dc.html becomes a static page like index.html: nothing on it is templated, so `support.js` and `<x-dc>` go, and the board is built before first paint (which PR 3 needs: a card can only fly back into a slot that exists when the page is captured). Every project with pages gets its dossier: the index tabs peeking past the card's edge at rest, and in your hand the dossier sliding out with its contents sheet and fore-edge tabs. Slips without pages get their one sheet. Tabs and contents link to the sub-sites' current pages; the URLs don't change in PR 2.

**Files.**

- `Building.dc.html`: drop `support.js` and `<x-dc>`; the intro, board host, `<noscript>` list and `fig.02` become static markup; `lib/building/board.js` becomes `type="module" blocking="render"`; keep the `expect` link and the modulepreloads.
- `lib/building/board.js`: build the board at module evaluation (not in a deferred mount); wire physics, unpin, flower and pen after first paint, as today.
- `lib/building/cards.js`: the peeking tabs (numbers only) behind cards that have chapters.
- `lib/building/unpin.js`: the hand step opens the dossier instead of the field note (the note's code is deleted, not kept beside it); in-hand scales for slips; the layer scrolls on short screens.
- `lib/building/dossier.js` (new, ~110 lines): the contents sheet, its tabs, the slide out and back.
- `lib/building/dossier.css` (new): the dossier and its tabs, shared with the project pages in PR 2. `lib/building/building.css`: the kraft tokens (page-only), the peeking tabs.
- `content/building-projects.js`: per project with pages, `chapters` (number, name, the chapter's own title, one line, href, state), `figure` (caption, steps, optional exit), `status`, `source`; per slip, `figure` and `lines` where it has them. Every line is taken from the project's pages, as in `01-previews.js`, minus the WIP field.
- `lib/shared/site-tokens.css`, `lib/shared/pen.css`: `--pen-kraft` and `[data-paper="kraft"]`, the pen's coral multiplied by kraft (as cork and wheat have), so hover and focus reach 3:1 on the tabs.
- `scripts/verify/building-board.mjs`, `building-motion.mjs`: the dialog is now the dossier. New `building-dossier.mjs`.
- `AGENTS.md`: Building is static like index.html; the dossier and its content fields.

**Design details.** All follow from C; none needs Fred's eyes:

- The tabs' ink darkens to reach 4.5:1 on kraft (the boards' `#6E5A3A` reads about 3.8:1).
- On a phone the dossier's tabs sit on its top edge and read as tabs, with an open bottom edge, not buttons.
- NJJoe's APA row reads "active pilot · 248 drafts verified · Sep 5, 2026" with no sticker.
- Instant Bookmark, Wavelength and Tsugi get their note, dates and one repository tab. Audio Processing CLI and Publish CLI also get their figure.
- The board's type stack puts Fraunces ahead of Noto Serif SC for English text (the latent full-width punctuation in the audit). Check it against a before/after screenshot.

**Constraints and risks.**

- The settled mechanics don't change: drag, the one-point pins, the swing, the unpin flight, the re-pin ripple, the 小红花. building-board and building-motion keep passing apart from the dialog's content.
- First paint changes: today the board appears when React arrives from unpkg; now it paints with the page. Hold CLS at 0; the board's footprint no longer needs its placeholder.
- The FY.mount WebKit fix makes mounts wait for the page's stylesheets. The board must still exist at `pagereveal` (for PR 3), so build it at module evaluation (a render-blocking module runs after the head's sheets have loaded) and confirm it under WebKit.
- The Building tab move ("the laptop prints it") must still answer on the static page.
- Keyboard: Enter unpins the card in view; the dossier's tabs and contents join the dialog's Tab loop; Esc re-pins and returns focus. Reduced motion shows the dossier at once, with no slide.
- Phones: no horizontal overflow anywhere. A phone viewport that changes between a transition's two captures aborts it; round 1 hit this.

**Verification.**

- `building-board.mjs` and `building-motion.mjs`, updated.
- `building-dossier.mjs` (new), at 1440, 390 and 360: each card with pages peeks with one tab per chapter; its dossier lists every chapter with a line and the figure; every link returns 200; slips get their sheet; no coral at rest; every link reaches coral 「 」 by keyboard; reduced motion; the dossier's chapters match the pages' own navs (a guard against the two lists drifting).
- `pen-spacing.mjs` with the dossier added; `vt-moves.mjs` (Building's tab answer), `vt-nav.mjs`, `vt-webkit.mjs`, `vt-lcp.mjs`.

**Performance.** Building's LCP element is the lead card's note (`p.highlighted-note`), today 940 ms at 1440 and 1032 ms at 390 (§9). Budget: no slower. It should be faster, since the page no longer waits for React. The dossier data adds about 2 KB.

## 3. PR 2 · Fred Agent on the site's architecture, in the dossier

**What ships.** The five chapters as static pages with the site's header, tokens, fonts and pen, in C's look: the sheet with its kraft edge, the typed file label, stamped facts, the board's card clipped on (built by `cards.js`), and the fore-edge tabs as the chapter nav (sticky; a strip on phones). Principles gets Reading's margin rail; so does Components, whose index becomes the same kind of TOC. The system map is drawn by the pen. The evidence images are derived. The in-place chapter swap is deleted, so until PR 3 chapters are plain page loads with a hard cut.

**`<base href="../../">` does not survive.**

- It is what broke every bare fragment (#18 had to name the page in 24 links).
- It would send the rail's generated `href="#id"` labels to the home page.
- It forced the folder-URL rename that #18 added to both scripts.

Without it, pages use plain relative paths (`../../lib/shared/…`, `../../assets/…`, `./system.html`), fragments are plain `#id`, and the folder URL `building/fred-agent/` resolves every relative path exactly as `index.html` does. So #18's `history.replaceState` rename and its popstate guard go with the router. The cost is a mechanical rewrite of every `href` and `src` in the five pages, and the suite fails on any request that isn't 200.

**A section link opened fresh lands on its section (#18's follow-up).**

- Sections get `scroll-margin-top` equal to whatever sticks at the top plus 28 px, as Reading's landmarks do. On desktop nothing sticks at the top (the fore-edge tabs are on the side); on phones the tab strip does.
- The browser's own fragment scroll does the rest. No script scrolls on load, and the rail's layout never moves the scroll.
- One risk: a late font swap can push the heading off after the browser has scrolled. Mitigation: if the page loaded with a fragment and the user hasn't scrolled, re-align once on `document.fonts.ready`. Tested on a cold load at 1440 and 390, the heading's top landing between the strip's edge and 40 px below it.

**Files.**

- `building/fred-agent/{index,system,principles,components,demos}.html`: rewritten. The static header copied from a gateway page after the identity port; the documented head order without `support.js`, like index.html; no `<base>`, `<helmet>`, `?v=` or Google Noto. Their text is unchanged.
- `lib/building/dossier.css` (extended with the page's parts: sheet, kraft edge, file label, stamps, fore-edge tabs and phone strip), `lib/building/cover.js` (the clipped card), `lib/building/project-rail.js` (the adapter that gives Reading's rail its landmarks and its strip on a project page). These are shared by both sub-sites.
- `lib/fred-agent/fred-agent.css` (the chapters' content: sections, ruled entries, code slips, the demos' exhibits), `lib/fred-agent/map.js` (fred-agent.js's path rule and explainer, drawn by the pen), `lib/fred-agent/evidence.js` (the loupes and focus mode, with no blur), `lib/fred-agent/main.js` (mounts).
- `lib/reading/rail.js`: take the strip and counter hosts from its context instead of querying `.rnav`. No behaviour change on Reading.
- Delete `assets/fred-agent/fred-agent.css` (599 lines) and `fred-agent.js` (452).
- Evidence images: the 12 MB of PNGs in `assets/fred-agent/demo/` become archived originals (never served), with derived ladders from `scripts/generate-derivatives.py` (a new evidence ladder). `demos.html` serves `srcset`s of the derived files, lazy below the fold. The 25 MB video stays `preload="metadata"` behind its poster.
- `scripts/generate-fonts.py`: add `building/**/*.html` to `PAGES` (today it doesn't scan the sub-sites at all) and drop `assets/fred-agent/fred-agent.css`; regenerate the subsets.
- `scripts/verify/`: new `project-pages.mjs`, `project-rail.mjs`, `project-map.mjs` (below). `pen-spacing.mjs` and `vt-nav.mjs` extended to the chapters; vt-nav's "fred-agent font 404 is pre-existing" exception deleted.
- `AGENTS.md`: the sub-sites follow the static-page architecture with no `<base>`, where their code lives, and the rail on project pages.

**Design details.**

These follow directly from C:

- Overview, System and Principles, as the boards show them.
- **Components:** five dossier entries. Each has its kind and name typed at the side in plain ink (no gradient), the three contract notes as ruled entries, the CLI example as a typed code slip (mono on paper2, as Reading sets `pre`), and its source link pen-wired. The page's "Component index" tiles become the margin rail, with five landmarks.
- The page navs and footers; the clipped card, drawn as one pen line instead of CSS borders.

These need Fred's eyes, in a round-2 board (`r2-02-demos`) before this PR's Demos page is built:

- **Demos:** the five demos as exhibits (a stamped exhibit number and the evidence label: "Recorded run", "Controlled comparison").
- The Trash Patrol canvas with its loupes and focus mode. Today focus mode blurs and darkens the image (`blur(4px) brightness(.56)`); blur is out, so the question is how the loupes and the dimmed canvas look in C.
- The video's frame; the pelican taste comparison (today an animated grid on reveal, which goes); the settei sheets.
- Two or three treatments to compare.

A visible legibility fix to show Fred, not to ask:

- If the wheat band stays faint on kraft, the current fore-edge tab becomes paper (pulled out, banded) while the others stay kraft.

**Constraints and risks.**

- Between PR 2 and PR 3 chapters hard-cut (no router, no transition yet). That is acceptable and shippable.
- Real URLs per chapter; back and forward are the browser's own.
- The fore-edge tabs and the phone strip are `position: sticky`: no ancestor may clip overflow. The phone strip is also the rail's host.
- **Fonts:** Noto comes from the `-ui` subsets. Fraunces, Caveat and IBM Plex Mono come from wherever the fonts branch puts them once it lands. If PR 2 were ready first it would keep the Google link for those three, as the gateway pages do today, but the sequence in §8 avoids that.
- The rail change touches `lib/reading/rail.js`, which the Writing CN/EN branch also edits. Land after it, keep the diff small, and `reading-rail.mjs` must still pass.
- **Accessibility:** the fore-edge tabs are the chapter `<nav>`, with the current tab `aria-current="page"`; the map's modules are buttons with `aria-pressed` and `aria-expanded`; the loupes stay keyboard-reachable.
- The map carries no coral at rest: lines are drawn only while noticed and cool to the wheat edge when locked.
- **WebKit:** sticky layout and the rail in Safari; `reading-webkit.mjs` is the model for a `project-webkit` pass.
- **Review split:** if review load demands it, open 2a (the shared page system, Overview, System, Principles) and 2b (Components, Demos) as a stacked pair and merge them together.

**Verification.**

- `project-pages.mjs` (new), every chapter at 1440, 390 and 360:
  - 0 console errors, and every request 200;
  - no Google Noto, no font masters, no `<base>`;
  - the header identical to a gateway page's;
  - a computed-style scan finding no text gradients, no `backdrop-filter` and no entrance animation;
  - no coral at rest;
  - every link reaching coral 「 」 by keyboard, and the current tab banded;
  - no horizontal overflow;
  - every fore-edge href returning 200 and matching the board's dossier.
- `project-rail.mjs` (new): reading-rail's criteria on Principles and Components (every landmark on the rail, End reaching the end tick, overscroll un-drawing nothing, the strip and counter at 390), plus every fragment opened fresh landing on its section.
- `project-map.mjs` (new): hover draws the path's lines, a lock cools them, Esc clears, keyboard focus traces, reduced motion lands at once, no coral at rest.
- `pen-spacing.mjs`, `vt-nav.mjs` and `reading-rail.mjs` pass; `vt-lcp.mjs` with the five chapters added to `VT_PAGES`.

**Performance.** Today the chapters' LCP is 952–1224 ms at 1440 and 1036–1280 ms at 390 (§9), with `h1.fa-title` or `p.fa-deck` as the element, and each page waits for React from unpkg. Budget: each chapter no slower. Demos transfers 14.3 MB today; target under 1.5 MB before the reader scrolls, which derived, lazy evidence makes possible.

## 4. PR 3 · The way in, the way back, and the chapter move

**What ships.** C's moves, as cross-document view transitions:

- **In:** the tabs you touched (the dossier's in your hand, or, from the card's direct link, the ones peeking behind it) travel to the page's fore-edge, on springs 26 ms apart, and the paper swaps under them.
- **Back:** the page's tabs tuck behind the card; after the landing the pin is pushed in, with the ticks and the ripple; the board is where you left it.
- **Chapter:** the tabs settle on a spring; the sheet in front is pulled aside (to a later chapter) or put back from the left (to an earlier one).
- **Other moves:** from a project page, the other nav tabs get the tab move from the building tab ("the laptop prints it"); home ↔ project gets the desk move.

**Files.**

- `lib/shared/transitions.js`: pages are resolved against the site root (the home link's directory) instead of the page's own directory, which today makes every `building/<id>/` page unknown. `building/<id>/<file>` becomes kind `project`, with its id and chapter number; `TAB` maps projects to `building`. `move()` returns `in` for board → project, `out` for project → board, and `chapter` for project → project with the same id.
- `lib/shared/transitions-project.js` (new, ~120 lines, loaded like transitions-tab.js): the tabs' relay (each group scaled from its old box, never sized), the paper swap, the chapter pull.
- `lib/shared/transitions.css`: `pj-tab-1` … `pj-tab-5` on `.fy-vt-tabs > :nth-child(n)` (the board's dossier in play, or one card's peeking tabs) and on `.pj-tabs > a:nth-child(n)` (project pages); their groups' z-order; the images stretch to their group.
- `lib/building/board.js`:
  - at `pageswap`, name the tabs in play and write the card and the board's position into `fy-vt`;
  - arriving from a project, restore the position, hide that card's pin and name its peeking tabs before the capture;
  - after the landing, re-pin.
- `lib/building/unpin.js`: expose the pin press for the return.
- The project pages' heads: `transitions-project.js`, `defer blocking="render"`, beside transitions-tab.js.
- `scripts/verify/vt-project.mjs` (new); `vt-moves.mjs`, `vt-nav.mjs` and `vt-webkit.mjs` extended; `AGENTS.md` (the moves, the names, the `fy-vt` fields).

**Design details.** These follow from C:

- The direct link's way in is the same tab flight, starting behind the card. It is the return's mechanism, run forward.
- From a scrolled page the header rides down with the move, as the tab moves' does.

**Constraints and risks.**

- **Compositor only:** `transitions-project.js` follows transitions-tab.js. Each group is scaled, never sized; a clip is constant; nothing is drawn per frame. `vt-project` applies vt-moves' rule to every custom animation.
- **One element per name:** on the board only one dossier's (or one card's) tabs carry names at a time. Pages name at most five; NJJoe names three. A duplicate name aborts the transition, so `vt-project` asserts that `ready` resolves.
- **Reduced motion:** no transition, and the pin is never left out.
- **bfcache:** a board restored from the back/forward cache with a dossier open closes it and re-pins.
- **Phones:** nothing may widen a page; round 1 saw a zoomed-out phone viewport abort a transition.
- **WebKit:** Safari runs cross-document view transitions. Playwright's WebKit screenshots come out blank during them, so verify from video.
- **Firefox:** a hard cut.

**Verification.**

- `vt-project.mjs` (new), at 1440 and 390 plus a mobile context:
  - in from the dossier and from the direct link; out; chapter moves later and earlier;
  - every custom animation moves only transform or opacity;
  - the tabs land within 1 px of the page's own;
  - the re-pin after out, and the board's position restored;
  - reduced motion gets none;
  - `fy-vt` is consumed every time;
  - the bfcache case.
- `vt-moves.mjs` (a project page's tab answer), `vt-webkit.mjs` (video), `building-motion.mjs` (the re-pin), `vt-lcp.mjs`.

**Performance.** About 4 KB of deferred, render-blocking script. Budget: LCP no slower than after PR 2.

## 5. PR 4 · NJJoe in the dossier

**What ships.** The casebook's index, listing microsite and APA campaign, and the email demo, as static pages in the dossier's look, with finished sections only, as today. There is no campaign-results section; Case 02 keeps its factual state, "active pilot". NJJoe joins the moves: its three fore-edge tabs are named, and the board's NJJoe dossier and peeking tabs travel.

**Files.**

- `building/njjoe/{index,microsite,apa}.html`: rewritten as in PR 2 (static header, head order, no `<base>`, relative paths, plain fragments).
- `building/njjoe/email-demo/buyer.html`: stays the email artifact (its inline styles are the email). Checked to request nothing external.
- `lib/njjoe/njjoe.css`: the cases and their before/after, the common pattern, Joe's words, the APA funnel and batch table, the archive capture as an exhibit. No page script: casebook.js's reveals are out, its folder rename goes with `<base>`, and its WIP code is gone already.
- Delete `assets/njjoe/casebook.css`, `casebook.js` and `apa-demo.css` (what `chore/remove-wip` leaves of them).
- The microsite's captures (5.9 MB and 4.6 MB PNGs) become archived originals with derived ladders, lazy (PR 2's evidence ladder).
- `scripts/verify/`: `project-pages.mjs`, `vt-project.mjs` and `pen-spacing.mjs` extended to NJJoe. `AGENTS.md`.

**Design details.** All follow from C:

- The index as the board shows it, minus the campaign-results section.
- APA typed as a dossier: the funnel's figures stamped, the batch table typed, the email preview as an exhibit, the evidence notes as typed notes.
- The microsite: the four surfaces as ruled entries, the intervention's four steps, the archive capture as a clipped print that scrolls inside.
- The one hand note ("automation does not remove the handoff…") stays a rationed hand aside, in pencil, not coral.

None needs Fred's eyes first; the PR carries before/after screenshots.

**Performance.** Today at 1440, the index is 752 ms, the microsite 840 ms and APA 744 ms (§9). CLS at 1440 is 0.063–0.076 today, from the fade-ups and the font swap; target under 0.01. The microsite transfers 8 MB today; the derived capture brings that far down. Budget: each page no slower.

## 6. Pages the boards didn't mock

| Page | In C's language | Needs Fred's eyes? |
|---|---|---|
| Components (Fred Agent) | five dossier entries, contract notes as ruled entries, CLI examples as typed slips, the margin rail as its index | no, follows from C |
| Demos (Fred Agent) | five exhibits; the evidence canvas, loupes and focus mode without blur; the video frame; the taste comparison and settei sheets | **yes: a round-2 board before PR 2's Demos page** |
| Listing microsite (NJJoe) | ruled entries for the four surfaces, the four steps, the archive capture as a clipped print | no, shown in PR 4's screenshots |
| APA campaign (NJJoe) | stamped funnel figures, the typed batch table, the email preview as an exhibit | no |
| `email-demo/buyer.html` | unchanged: it is the email, shown as evidence | no |

## 7. If a click goes straight in (the unpin question)

The plan's default keeps unpinning: a click lifts the card into your hand, the dossier slides out, and a tab goes in, while the card's direct link goes straight in. If Fred wants a click to go straight into the project instead:

- **PR 1 changes most.** Cards with pages lose the hand step, so the dossier has nowhere to open. Either it becomes a hover/focus peek on the board (the dossier slides a little way out from behind the card), or the peeking tabs alone carry the preview (labelled, and each one a link). Unpin stays only for slips without pages (their one sheet), or goes too if slips link straight to their repository. The board's dialog checks change with it, and Enter on the board opens the project.
- **PR 3 changes at its ends.** The way in starts from the card at rest (the peeking tabs travel), and the way back ends with the card still pinned: there is no pin press or ripple on return, because nothing was unpinned.
- **PR 2 and PR 4 don't change.**

## 8. Sequencing against the work in flight

| In flight | What it touches that the port also touches | So |
|---|---|---|
| `chore/remove-wip` | `assets/njjoe/casebook.*`, the sticker-forge bundle, `assets/wip-pusher-mask.png`, the set-section-wip skill, AGENTS.md, NOTICE.md | PR 4 starts from what it leaves; nothing else depends on it |
| Identity lockup (B, the seals) | the header identity markup on every page including `building/`, `lib/shared/site-nav.css`, one line of `lib/shared/site.js` | PR 1 rebases onto it; PR 2 and PR 4 copy their header from a gateway page after it lands, rather than hand-merging its edits into pages they rewrite |
| Self-hosted Fraunces, Caveat, IBM Plex Mono | gateway pages' heads, including Building.dc.html's; where the `@font-face` rules live (probably `lib/shared/site-tokens.css`, which PR 1 also edits for `--pen-kraft`) | PR 1 after it. PR 2 and PR 4 bring the sub-sites onto the same self-hosted faces, since the fonts branch leaves `building/` out |
| FY.mount waits for stylesheets (WebKit) | `lib/shared/site.js`; how and when Building's board is built | PR 1 after it, building the board at module evaluation; confirmed under WebKit that the board exists at `pagereveal` |
| Writing CN/EN | `lib/writing`, `lib/reading`, AGENTS.md | PR 2's `rail.js` change after it |

The order:

1. **Now:** build PR 1 on a branch, and draw the round-2 Demos board (`design/2026-09-building/r2-02-demos.html`) for Fred in parallel.
2. **Merge PR 1** once the fonts branch, the identity port and the WebKit fix have landed (rebase onto each).
3. **PR 2** after PR 1, the identity port, the fonts branch, Writing CN/EN, and Fred's Demos pick.
4. **PR 3** after PR 2. It touches only `lib/shared/transitions*`, `lib/building/board.js`, `unpin.js` and the project pages' heads, so nothing in flight collides except AGENTS.md.
5. **PR 4** after PR 2 and `chore/remove-wip`, before or after PR 3.

AGENTS.md is edited by every PR and by most of the work in flight. Each PR rebases and edits only its own sections.

## 9. Performance budget

Today, on `b085f70`, measured the way `scripts/verify/vt-lcp.mjs` measures (a fresh context, Fast 4G at 9 Mbps and 165 ms RTT; 390 adds 4× CPU; median of 3). Each PR runs `vt-lcp.mjs` against main with its pages in `VT_PAGES`. A page passes when it is no slower than main by more than the harness's noise (the larger of 5% and 40 ms). CLS may not rise either.

| Page | LCP 1440 (ms) | LCP 390 (ms) | LCP element | CLS 1440 / 390 | Transferred 1440 / 390 |
|---|---|---|---|---|---|
| Building.dc.html | 940 | 1032 | `p.highlighted-note` | 0.001 / 0.000 | 1.09 MB |
| fred-agent/index.html | 984 | 1088 | `h1.fa-title` | 0.001 / 0.002 | 0.99 MB |
| fred-agent/system.html | 1224 | 1280 | `h1.fa-title` | 0.000 / 0.000 | 1.00 MB |
| fred-agent/principles.html | 952 | 1036 | `p.fa-deck` | 0.002 / 0.000 | 1.00 MB |
| fred-agent/components.html | 972 | 1092 | `h1.fa-title` / `p.fa-deck` | 0.000 / 0.000 | 1.00 MB |
| fred-agent/demos.html | 1124 | 1180 | `h1.fa-title` | 0.001 / 0.000 | 14.3 / 14.8 MB |
| njjoe/index.html | 752 | 856 | `h1` | 0.063 / 0.006 | 0.53 MB |
| njjoe/microsite.html | 840 | 936 | `h1` | 0.065 / 0.004 | 8.1 / 6.7 MB |
| njjoe/apa.html | 744 | 936 | `h1` | 0.076 / 0.007 | 0.54 MB |

What should move the numbers: no React on any of these pages (none is templated); self-hosted Noto subsets instead of Google's; derived, lazy evidence images; no fade-ups (the NJJoe CLS). What could cost: render-blocking transition scripts (small, deferred), and the dossier data (a few KB).

## 10. Risks across the stack

- **Two chapter lists.** The board's dossier (`content/building-projects.js`) and each page's fore-edge nav must stay in step; `building-dossier.mjs` compares them.
- **External links.** The folder URLs (`building/fred-agent/`, `building/njjoe/`) keep working without #18's rename, because nothing depends on the base any more; `project-pages.mjs` loads both.
- **New CJK strings** (章节, 回到板上, 读到哪儿 and the like) need `generate-fonts.py` over `building/**` as well, or they fall back to system faces; the font audit names any missing character.
- **Reduced motion** is one media query (`Motion.reduced()`) everywhere. `transitions.css` already switches view transitions off; the dossier and the map land at once.
- **Real devices.** Headless Chromium and WebKit are the checks; Fred tests on phones after deploy (his usual pass). Firefox keeps a hard cut.
