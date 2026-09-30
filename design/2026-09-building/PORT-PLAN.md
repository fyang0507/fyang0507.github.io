# Building · C to production: the port plan

The plan for taking Fred's pick, C 档案 the dossier (`HANDOFF.md` §3), to production as a stack of seven PRs, each shippable and verifiable on its own. Nothing here is implemented yet.

Revised 2026-09-29 to answer `PLAN-REVIEW.md`. Every finding is resolved in the plan or deferred with a reason. `(R n)` cites finding n where it is answered, and §11 lists all eighteen. The questions only Fred can answer are numbered Q1–Q9 in `HANDOFF.md` §4; each PR says which ones it waits on, and where a default is built in the meantime.

The branch is rebased onto `cca4134`: #20 (no WIP anywhere), #21 (`FY.mount` waits for the stylesheets) and #22 (Writing's CN/EN switch) have merged, and the dossier data says `2025—now` (R16).

## 0. Ground rules for every PR

- AGENTS.md as it stands on main: static header outside any template, the documented head order, shared tokens only in `lib/shared/site-tokens.css`, subset fonts only, the pen's states through `Tier.wire`, no gradients, gloss, glass blur, fade-and-rise entrances, parallax or ambient loops, runtime code in `lib/`, no `?v=`, relative URLs, code files under 500 lines.
- Transitions: every view-transition animation changes only transform and opacity (a clip may be set but holds still); every name is assigned in `lib/shared/transitions.css`, one rendered element per name per document; no transition under reduced motion; engines without cross-document view transitions keep a hard cut.
- **Contrast is asserted, not eyeballed (R2).** Small text reaches 4.5:1 against its computed background; the pen's hover line and focus 「 」 reach 3:1 against their surface. Each PR's suite computes both.
- **Gates (R12).** Each PR runs `vt-lcp.mjs` against main with its pages in `VT_PAGES`. LCP: no slower than main by more than the noise (the larger of 5% and 40 ms). CLS, gated from 1a on: a page fails when its CLS exceeds the larger of main's and 0.01. Transferred bytes, where a PR sets a target: measured before any scroll, as `home-net.mjs` measures them.
- No WIP. Every page shows only finished sections.
- Each PR leaves main working: nothing half-built deploys between PRs.

## 1. The stack, in dependency order

| # | PR | What ships | Lands after | Waits on Fred | Size |
|---|---|---|---|---|---|
| 1 | **1a · Static board** | Building.dc.html with no `support.js` or `<x-dc>`; the board built before first paint; screenshot-identical | #21 (merged) | nothing | S |
| 2 | **R · Rail extraction** | `lib/reading/rail.css`; `rail.js` takes its strip and counter hosts from its context; Reading unchanged | #22 (merged) | nothing | S |
| 3 | **E · Evidence ladder** | derived evidence images with intrinsic sizes and a zoom tier, served by today's Demos and microsite pages | nothing | nothing | S–M |
| 4 | **1b · The dossier** | peeking tabs, the dossier in your hand, kraft inks that pass; `card.css` split out | 1a | Q1 | M |
| 5 | **2 · Fred Agent** | the five chapters on the site's architecture, in C's look; the rail on Principles; the pen-drawn map | 1b's base, R, E, the identity port, the fonts branch | Q3, Q4, Q6, Q7 | L |
| 6 | **3 · The moves** | in, back and chapter as cross-document transitions | 2 | Q8 (Q2 has a built-in default) | M |
| 7 | **4 · NJJoe** | the casebook's three pages and the email demo, in C's look | 2, E | Q9 | M |

Why this shape:

- **1a, R and E can start today, in parallel, and none waits on Fred.** 1a needed only #21, R needed #22 (both edit the rail's context in `bus.js`), and E needs nothing.
- **PR 1 is split (R11).** 1a is the part no answer changes; 1b is the part Q1 changes most. The fonts branch and the identity port overlap 1a and 1b only in text: the fonts branch replaces Building's three Google Fonts lines and adds `@font-face` rules to `site-tokens.css`, and 1b adds nothing to `site-tokens.css` (its kraft pen goes in `pen.css`). The identity port rewrites header markup that neither touches. Whichever lands second rebases.
- **R and E come out of PR 2 (R7, R11, R15).** Each is useful alone (R makes the rail portable; E cuts Demos from 14.3 MB), and PR 2 stops being the one L change that does everything.
- **1b's base.** `card.css`, `dossier.css` (the kraft tokens, the inks, the tab styles) and the chapter data in `content/building-projects.js` don't depend on Q1. If Q1 is still open when PR 2 is ready to start, the base moves to the front of PR 2 and 1b rebases onto it.
- **NJJoe's move onto the site's architecture travels with its restyle (PR 4).** Moving the old look onto the new architecture first would build CSS only to delete it a PR later.
- **PR 2 deletes fred-agent.js's in-place swap; PR 3 adds the chapter move.** The router is written against the old markup (`#dc-root .fa-page`); porting it only to delete it buys one release window of transitions. Chapters hard-cut in that window.
- **PR 4 merges before or after PR 3.** Its pages carry the tab names either way; without PR 3's code, transitions.js doesn't recognise them and cuts, as today.

## 2. PR 1a · Building becomes a static page

**What ships.** Building.dc.html becomes a static page like index.html: `support.js` and `<x-dc>` go, the intro, board host, `<noscript>` list and `fig.02` become static markup, and the board is built before first paint. Nothing looks different at rest: the settled page at 1440, 390 and 360 matches main pixel for pixel. Only when it paints changes, since it no longer waits for React. PR 3 needs this, because a card can only fly back into a slot that exists when the page is captured.

**Files.**

- `Building.dc.html`: drop `support.js` and `<x-dc>`; head order as index.html's; `lib/building/board.js` becomes `type="module" blocking="render"`; keep the `expect` link and the modulepreloads. The Google Fonts lines are left to the fonts branch.
- `lib/building/board.js` (R4): `build(host, projects)` and the count line run at module evaluation. `build()` measures nothing, so it is safe before the sheets apply, which WebKit doesn't wait for (#21). `wire()` (physics, unpin, flower, pen) stays behind `FY.mount`'s stylesheet gate, because physics measures.
- `scripts/verify/vt-webkit-mount.mjs` (R4): Building's entry no longer waits for React, which is gone. It holds every stylesheet until `.slot` exists, then releases them, and checks that wire's mount ran on a styled page and that both loads lay out within 24 px, as for the other pages.
- `scripts/verify/building-board.mjs` gains the pagereveal check (R4): an init-script `pagereveal` listener records the `.slot` count, which must equal the project count, in Chromium and in WebKit. No screenshots are needed, so WebKit's blank view-transition shots don't matter.
- `scripts/verify/vt-lcp.mjs` (R12): the CLS gate from §0. It logs CLS today but never fails on it.
- `AGENTS.md`: Building is static like index.html (the page-architecture section lists it beside index.html).

**Constraints.** The settled mechanics don't change: drag, the one-point pins, the swing, the unpin flight, the re-pin ripple, the 小红花. The Building tab move ("the laptop prints it") must still answer. The board's placeholder footprint is no longer needed; CLS may not rise (now gated).

**Verification.** `building-board.mjs` and `building-motion.mjs` pass unchanged apart from the new check; `vt-webkit-mount.mjs` (updated), `vt-moves.mjs`, `vt-nav.mjs`, `vt-webkit.mjs`; a pixel diff of the settled page against main at 1440, 390 and 360; `vt-lcp.mjs` with its CLS gate.

**Performance.** Today 940 ms at 1440 and 1032 ms at 390 (§9). No slower; it should be faster without React.

## 3. PR R · The rail, extracted from Reading (R7)

**What ships.** Nothing visible. Reading's pencil margin gets its own stylesheet and takes its hosts from its context, so a project page can carry it without Reading's page CSS.

**Why it can't be reused as it is.** Its CSS lives in `lib/reading/reading.css` (`:160–194`), the file that declares Noto Serif SC → `NotoSerifSC-text.woff2` (`:5`). Loading that file on a project page would declare the 1,087 KB face under the family name, which AGENTS.md's font split exists to prevent. The rules also read Reading's page tokens (`--n1`, `--text-cn`, `--card-shadow`) and `.rnav` selectors, and `rail.js` finds its strip and counter by querying `.rnav`.

**Files.**

- `lib/reading/rail.css` (new): the rail rules, moved from `reading.css` and nothing else (no `@font-face`). It reads `--n1`, `--text-cn` and `--card-shadow`, which each page that loads it declares as page tokens: Reading keeps its own in `reading.css`, and project pages declare theirs in `dossier.css`. The `.rnav` selectors (`:188`, `:193`) are rewritten against the strip host's own class.
- `lib/reading/rail.js`: `ctx.strip` (where the phone strip is appended) and `ctx.count` (where the counter goes) replace `document.querySelector('.rnav')` and its `.right`. No behaviour change.
- `lib/reading/bus.js`: passes `.rnav` and `.rnav .right` as the two hosts.
- `Reading.dc.html`: links `rail.css` after `reading.css`.

**The contract PR 2's adapter must meet.** `rail.js` reads `root`, `g` (`n1`, `sL`, `vh`, `vw`, `rm`), `body()`, `marks()` (id, label, kind, title or peek per landmark), `top(el)`, `post` (`id`, `readingMin`), `lang()`, `kind()`, `y()`, `max()`, `jump(el, y)`, `scrollTo(y)`, `onLand(fn)`, `onLayout(fn)`, `onScroll(fn)`, and now `strip` and `count`. The labels' 「 」 comes from Reading's `states.js` (`:26`), not `rail.js`, so `project-rail.js` wires the same `FocusMark` itself.

**Verification.** `reading-rail.mjs` unchanged and passing; `reading-matrix.mjs`, `reading-webkit.mjs`; Reading pixel-identical to main at 1440 and 390, at three scroll positions and in both languages.

## 4. PR E · The evidence ladder (R9, R15)

**What ships.** Every evidence image on today's Fred Agent Demos and NJJoe microsite pages is served from derived files with intrinsic sizes; the PNGs become an archive. Today's loupes keep working, zooming into the zoom tier. It ships against today's pages, so Demos stops sending 14.3 MB before the restyle lands.

**The spec.**

- **Originals** move to `images/evidence/fred-agent/` and `images/evidence/njjoe/` (archive, never served, like `images/gallery/`): the ten captures and plates in `assets/fred-agent/demo/`, and `roosevelt-full-page.png` and `-mobile.png` from `assets/njjoe/`. The hand-resized `trash-patrol-h760.png` and `-h880.png` are deleted; the ladder replaces them. The video and its 32 KB WebP poster stay where they are.
- **Format:** JPEG through `sips`, the pipeline's one encoder. `sips` can't write WebP, which the round-2 board assumed.
- **Display ladder:** 640, 960, 1280 and 1760 px wide, capped at the original's width, JPEG quality 86. The photo ladders' 74 blurs the small text in UI captures. Trash Patrol at 1280 is 272 KB, against a 776 KB original.
- **Zoom tier:** one file per capture at the original's full width, quality 90, fetched only by a loupe or an enlargement: today's loupes, and F3's enlargement if Fred picks it (Q3). If he picks F1 or F2, PR 2 deletes the tier with the loupes.
- **Sizes:** `content/image-dimensions.json` gains every evidence image, and every `<img>` carries its `width` and `height`, so nothing above a section moves after a fragment scroll.
- **Where the ladder lives:** `EVIDENCE_WIDTHS` and the zoom tier in `scripts/generate-content.py` beside the other ladders; `generate-derivatives.py` builds `images/derived/evidence/<project>/<stem>-<w>.jpg`.
- Considered and not taken: AVIF, which `sips` writes on Fred's macOS. At quality 70 it is about a third of the JPEG's size with the same legibility in a 1:1 crop (Trash Patrol at 1280: 86 KB). It would add a second format and a `<picture>` fallback to every image. Revisit only if PR 2's Demos byte gate fails with JPEG.

**Files.** The two generators; `building/fred-agent/demos.html` (`srcset`, `sizes`, `width`, `height`, lazy below the fold); `assets/fred-agent/fred-agent.css` (the loupes' `background-image` points at the zoom tier); `building/njjoe/microsite.html`; `AGENTS.md` (the archive path and the ladder); new `scripts/verify/evidence.mjs`.

**Verification.** `evidence.mjs`: every evidence `<img>` has a `width` and `height` that match `image-dimensions.json`; no request reaches `images/evidence/` or a PNG in `assets/fred-agent/demo/`; every request returns 200; the loupes still frame their targets at 1440 and 390. Demos' transferred bytes before scroll must fall to a quarter of main's or less. The PR carries a 1:1 crop of the smallest text in each capture from each tier, for Fred's eyes, not as a gate.

## 5. PR 1b · The dossier on every card

**What ships.** Every project with pages gets its dossier: at rest its index tabs peek past the card's right edge; in your hand the dossier slides out with its contents sheet and fore-edge tabs. Slips without pages get their one sheet. Tabs and contents link to the sub-sites' current pages. This section assumes Q1 (a), unpin plus dossier; "If a click goes straight in" below lists what (b) or (c) changes.

**Files.**

- `Building.dc.html`: loads `lib/building/card.css` and `lib/building/dossier.css` before `building.css`.
- `lib/building/card.css` (new, R8): the card's own rules (slot, swing, paper, pin, tape, label), split out of `building.css`, so a project page can clip the card on without the board's global reset, body font and grain. Building renders the same.
- `lib/building/dossier.css` (new, R8): the dossier and its tabs, and the kraft tokens as page tokens (`--kraft: #D8C29A` and its edge). Both surfaces load it, and PR 2 extends it with the page's parts.
- `lib/building/cards.js`: the peeking tabs (numbers only) behind cards that have chapters.
- `lib/building/unpin.js`: the hand step opens the dossier instead of the field note, whose code is deleted; in-hand scales for slips; the layer scrolls on short screens.
- `lib/building/dossier.js` (new, about 110 lines): the contents sheet, its tabs, the slide out and back.
- `lib/shared/pen.css` (R2): `[data-paper="kraft"]{--pen:var(--mark-deep)}`. Kraft is the one paper where the coral multiplied by the paper fails (`#B85036`, 2.86:1), so it takes `--mark-deep` (3.45:1). The file's comment says so.
- `content/building-projects.js`: per project with pages, `chapters` (number, name, the chapter's own title, one line, href), `figure`, `status` and `source`; per slip, `figure` and `lines` where it has them. Every line comes from the project's pages, as in `01-previews.js`.
- `scripts/verify/building-board.mjs` and `building-motion.mjs`: the dialog is now the dossier; `CORAL` (`:12`) gains `rgb(165, 69, 58)`, or "no coral at rest" would miss the kraft pen (R2). New `building-dossier.mjs`.
- `AGENTS.md`: the dossier, its content fields, and kraft among the papers.

**Inks on kraft (R2).** Measured against `#D8C29A`:

| On kraft | Ink | Ratio | Verdict |
|---|---|---|---|
| Tab text, numbers and names | `--ink` `#33302B` | 7.57:1 | the spec |
| | the boards' `#6E5A3A` | 3.80:1 | fails 4.5 |
| | `--soft` / `--pencil` | 3.31 / 3.07:1 | fail 4.5 |
| Pen: hover line, focus 「 」 | `--mark-deep` `#A5453A` | 3.45:1 | the spec |
| | coral × kraft `#B85036` | 2.86:1 | fails 3 |
| Wheat band | `--hl` (× kraft) | 1.11:1 (1.50:1) | not used on kraft |

Every small text on kraft is `--ink`. Nothing on the board is ever "current" (board.js: a card in your hand is a dialog, not a state), so the wheat band doesn't appear here; on the project pages the current tab is paper (Q6).

**Design details.**

- **Typeface unchanged (R3).** The board keeps its type stack, so the cards' English stays in Noto Serif SC's Latin as today. The content is ASCII, so full-width punctuation stays latent, and moving the LCP element onto an unpreloaded Fraunces would invite the swap-repaint trap AGENTS.md describes. Q5 asks Fred; a change would be its own PR.
- **Phones (R10).** Whatever Fred answers to Q7, at 640 px and below the cards narrow by the peek (22 px: two mono digits and their padding) and the track's end padding includes it, so every tab's number sits inside the cork at rest. The peek stays on the right edge, as at 1440. In your hand, the dossier's tabs sit on its top edge and read as tabs (an open bottom edge, not buttons).
- NJJoe's APA row reads "active pilot · 248 drafts verified · Sep 5, 2026", with no sticker.
- Instant Bookmark, Wavelength and Tsugi get their note, dates and one repository tab. Audio Processing CLI and Publish CLI also get their figure.

**Constraints.** The settled mechanics don't change. Keyboard: Enter unpins the card in view; the dossier's tabs and contents join the dialog's Tab loop; Esc re-pins and returns focus. Reduced motion shows the dossier at once. No horizontal overflow at any width.

**Verification.**

- `building-dossier.mjs` (new), at 1440, 390 and 360:
  - each card with pages peeks with one tab per chapter;
  - no tab is clipped by the cork or overlapped (R10);
  - its dossier lists every chapter with a line and the figure, and every link returns 200;
  - slips get their sheet;
  - contrast: tab text ≥ 4.5:1 and the pen ≥ 3:1 against the computed kraft (R2);
  - no coral at rest, and every link reaches 「 」 by keyboard;
  - reduced motion.
- `building-board.mjs`, `building-motion.mjs`, `pen-spacing.mjs` with the dossier added, `vt-moves.mjs`, `vt-nav.mjs`, `vt-webkit-mount.mjs`, `vt-lcp.mjs`. The dossier data adds about 2 KB.

**If a click goes straight in (Q1 b or c).**

- **1b changes most.** Cards with pages lose the hand step, so the dossier has nowhere to open. Either it becomes a hover or focus peek (the dossier slides a little way out from behind the card), or the peeking tabs alone carry the preview, labelled, each a link. Under (b), unpin stays only for slips without pages, or goes too if slips link straight to their repository; under (c) slips keep it. The dialog checks change with it, and Enter on the board opens the project.
- **PR 3 changes at its ends.** The way in starts from the card at rest (the peeking tabs travel), and the way back ends with the card still pinned: no pin press and no ripple, because nothing was unpinned.
- **1b's base, PR 2 and PR 4 don't change.**

## 6. PR 2 · Fred Agent on the site's architecture, in the dossier

**What ships.** The five chapters as static pages with the site's header, tokens, fonts and pen, in C's look: the sheet with its kraft edge, the typed file label, stamped facts, the board's card clipped on, and the fore-edge tabs as the chapter nav (sticky; a strip on phones). Principles gets the rail; the system map is drawn by the pen; Demos serves E's evidence. The in-place chapter swap is deleted, so until PR 3 chapters hard-cut.

**`<base href="../../">` goes.** It broke every bare fragment (#18 named the page in 24 links), it would send the rail's `href="#id"` labels to the home page, and it forced #18's folder-URL rename. Without it, pages use plain relative paths (`../../lib/shared/…`, `./system.html`), fragments are plain `#id`, and `building/fred-agent/` resolves every relative path exactly as `index.html` does, so #18's `replaceState` rename and popstate guard go with the router. The cost is a mechanical rewrite of every `href` and `src` (skip links included); the suite fails on any request that isn't 200. The review checked all of this and found it sound.

**A section link opened fresh lands on its section (R9).** Sections get `scroll-margin-top` equal to whatever sticks at the top plus 28 px: nothing on desktop (the tabs are on the side), the strip on phones. The browser's own fragment scroll does the rest: no script scrolls on load, and the `fonts.ready` re-align the first plan had is dropped. What makes it hold is that nothing above a section changes height after the scroll: every evidence image has its intrinsic size (E), and the rail's layout never moves the scroll. If a font swap still moves a heading, the fix is preloading that face, not a scroll.

**Files.**

- `building/fred-agent/{index,system,principles,components,demos}.html`: rewritten, text unchanged. The static header copied from a gateway page after the identity port; the documented head order without `support.js`; no `<base>`, `<helmet>`, `?v=` or Google Noto.
- `lib/building/dossier.css`, extended with the page's parts: sheet, kraft edge, file label, stamps, fore-edge tabs and phone strip; the page tokens `rail.css` reads; Fraunces italic 400, declared from the fonts branch's `Fraunces-Italic-latin` files, because after that branch only Reading and home declare italic and C sets `.pj-note` and `.pj-pull` in it (R14).
- `lib/building/cover.js` (R8): the clipped card, built by `cards.js` with its links stripped (its href, `./building/fred-agent/`, would resolve to `building/fred-agent/building/fred-agent/` here). Not render-blocking: the card doesn't travel in C, so it is built after first paint in a box reserved by `card.css`.
- `lib/building/project-rail.js`: the adapter that meets R's contract on a project page: landmarks from the section headings, the strip and counter hosts, `onLand` firing at once (there is no landing nav), and the labels' 「 」.
- `lib/fred-agent/fred-agent.css` (the chapters' content), `map.js` (the path rule and explainer, drawn by the pen), `evidence.js` (the viewers, per Q3), `main.js` (mounts). Delete `assets/fred-agent/fred-agent.css` (599 lines) and `fred-agent.js` (452).
- The project pages' heads preload IBM Plex Mono latin, so the tabs aren't captured in a fallback face (R14).
- `scripts/generate-fonts.py`: add `building/**/*.html` to `PAGES` and drop `assets/fred-agent/fred-agent.css`. This adds one glyph (🤞) to the `-ui` subset (R14).
- `scripts/verify/`: new `project-pages.mjs`, `project-rail.mjs`, `project-map.mjs`, `project-webkit.mjs`; `pen-spacing.mjs` and `vt-nav.mjs` extended to the chapters, and vt-nav's "fred-agent font 404 is pre-existing" exception deleted.
- `AGENTS.md`: the sub-sites follow the static-page architecture with no `<base>`; where their code lives; the rail on project pages.

**Design details.**

- **The current tab (R2, Q6).** It is paper, pulled out and banded in wheat, while the others stay kraft. On paper the band reads as it does in the site's nav, and its text is `--ink` on `--hl` at 8.40:1; on kraft the band is 1.11:1.
- **The phone strip (R10, Q7).** Every tab shows. The others are numbers only, the current one has its name beside its number, and the row fits at 360 (five tabs for Fred Agent, three for NJJoe). The rail's counter ("05 / 11") leaves the tab row for the hairline under it. The strip is `position: sticky`, so no ancestor clips overflow; it is also the rail's strip host.
- **Components (Q4).** The default is no rail: its "Component index" stays the page's index, typed as a contents list, and its five entries become dossier entries (kind and name typed at the side, contract notes as ruled entries, the CLI example as a typed slip in mono on paper2, the source link pen-wired). If Fred wants the rail (Q4 b), the index becomes five landmarks and `project-rail.mjs` covers the page.
- **Demos (Q3).** Five exhibits with the evidence viewers Fred picks; the round-2 board is the spec. Built in from the board's known gaps: choosing a legend entry keeps it where it was when the enlargement opens (F3); on phones the enlargement's counter and key stack. The recording is a print of its poster with `preload="none"`, so none of the 25.8 MB loads before play. Fig. 02 and Fig. 04 get the captions Fred approves in Q3.
- Overview, System and Principles as the boards show them; the page navs and footers; the clipped card's paperclip drawn as one pen line, not CSS borders.

**Constraints.**

- Real URLs per chapter; back and forward are the browser's own.
- Accessibility: the fore-edge tabs are the chapter `<nav>`, the current tab `aria-current="page"`; the map's modules are buttons with `aria-pressed` and `aria-expanded`; the evidence legend entries are the viewers' controls.
- The map carries no coral at rest: lines are drawn only while noticed and cool to the wheat edge when locked.
- If review load demands it, open 2a (the page system, Overview, System, Principles) and 2b (Components, Demos) as a stacked pair and merge them together: a Fred Agent with chapters in two looks shouldn't deploy.

**Verification.**

- `project-pages.mjs` (new), every chapter at 1440, 390 and 360:
  - 0 console errors, and every request 200;
  - no Google Noto, no font masters, no `<base>`;
  - the header identical to a gateway page's;
  - a computed-style scan finding no text gradients, no `backdrop-filter` and no entrance animation;
  - contrast: every text node ≥ 4.5:1 and the pen ≥ 3:1 against its computed background, kraft and paper (R2);
  - no coral at rest; every link reaches 「 」 by keyboard; the current tab is paper and banded;
  - no horizontal overflow, and no strip tab clipped or overlapped at 360 and 390 (R10);
  - every fore-edge href returns 200 and matches the board's dossier;
  - CLS under 0.01, and Demos under 1.5 MB transferred before scroll, at 1440 and 390 (R12).
- `project-rail.mjs` (new): reading-rail's criteria on Principles (every landmark on the rail, End reaching the end tick, overscroll un-drawing nothing, the strip and counter at 390), plus every fragment on every chapter opened fresh on a cold cache, including Demos' `#trash-patrol` and `#unattended-recovery`, landing between the strip's edge and 40 px below it (R9).
- `project-map.mjs` (new): hover draws the path's lines, a lock cools them, Esc clears, keyboard focus traces, reduced motion lands at once, no coral at rest.
- `project-webkit.mjs` (new, modelled on `reading-webkit.mjs`): sticky tabs and the rail in WebKit.
- `pen-spacing.mjs`, `vt-nav.mjs`, `reading-rail.mjs`; `vt-lcp.mjs` with the five chapters in `VT_PAGES`.

**Performance.** Today 952–1224 ms at 1440 and 1036–1280 ms at 390, each page waiting for React (§9). Each chapter no slower.

## 7. PR 3 · The way in, the way back, and the chapter move

**What ships.** C's moves, as cross-document view transitions:

- **In:** the tabs you touched (the dossier's in your hand, or, from the card's direct link, the ones peeking behind it, per Q8) travel to the page's fore-edge on springs 26 ms apart, and the paper swaps under them.
- **Back:** the board brings the card you came back from into view (Q2 a, the default); the page's tabs tuck behind it; after the landing the pin is pushed in, with the ticks and the ripple.
- **Chapter:** the tabs settle on a spring; the sheet in front is pulled aside (to a later chapter) or put back from the left (to an earlier one).
- **Other moves:** from a project page, the other nav tabs get the building tab's answer ("the laptop prints it"); home ↔ project gets the desk move.

**The way back finds its card without storage (R1).** `fy-vt` lasts one hop: the project page's `take()` deletes it at pagereveal, and every later pageswap rewrites it, so the board's position can't travel in it. The board instead reads where you came from: `navigation.activation.from.url` (on a fresh load in an engine without it, `document.referrer`). If that is `building/<id>/…` and `<id>` is on the board, the card is brought into view: the track's offset is set so its slot is inside the cork, clamped to the track's ends. No new session key. Physics adopts that offset when it wires, instead of starting at 0.

It runs in the board's pagereveal handler, registered at module evaluation (R4). There every engine has applied the sheets, which a measurement before first render can't rely on in WebKit, and the change is still in the new page's capture. If Fred picks Q2 (b), the board where you left it, the handler reads a new sessionStorage key, `fy-board {id, x}`, added to AGENTS.md's list, instead.

**Files.**

- `lib/shared/transitions.js`, which stays under 500 lines (R6). It is 484; the change adds at most 12:
  - pages resolve against the site root (the home link's directory) instead of the page's own directory, which today makes every `building/<id>/` page unknown;
  - anything under `building/` is handed to `FYProject.kind(url)`, and pairs involving a project to `FYProject.move(from, to)`;
  - `TAB` gains `project: 'building'`;
  - pageswap calls `FYProject.swap(rec)` before writing `fy-vt`, a merge hook like the mocks' `BD_PAGE.swap` (R17);
  - a project move with no `FYProject` loaded is skipped, a hard cut, rather than left to the browser's default animations (R5);
  - `V` gains `ride`, `frame` and `spring` from `FYTab` (R5).
  No chapter numbers live here (R6).
- `lib/shared/transitions-tab.js` (R5): `ride` comes out of `run()` and is published with `frame` and `spring`; `prepare()` takes the tab from transitions.js's `TAB` instead of keeping its own map, so it knows the project kind.
- `lib/shared/transitions-project.js` (new, about 150 lines, R5, R6): the project parsing (id from the path; the chapter order from the pages themselves: the old page writes its `aria-current` index into `fy-vt` through the swap hook, the new page reads its own `.pj-tabs`); the choice of `in`, `out` and `chapter`; the tabs' relay (each group scaled from its old box, never sized); the paper swap; the chapter pull; the header's ride from a scrolled page through `V.ride`.
- `lib/shared/transitions.css`: `pj-tab-1` … `pj-tab-5` on `.fy-vt-tabs > :nth-child(n)` (the board's dossier in play, or one card's peeking tabs) and on `.pj-tabs > a:nth-child(n)`; their groups' z-order; the images fill their group.
- `lib/building/board.js`:
  - at pageswap, put `.fy-vt-tabs` on the tabs in play;
  - at pagereveal from a project: on a bfcache restore, first close any open dossier at once and clear the `.fy-vt-tabs` it set at pageswap (R12); then bring the card into view (R1), and name its peeking tabs;
  - hide the card's pin only when a view transition is running, and press it after the landing. Without one (Firefox, reduced motion, a skipped move) the card is simply pinned: no hidden pin and no press without a cause (R17).
- `lib/building/unpin.js`: expose the pin press and an instant close. `lib/building/physics.js`: a start offset.
- Heads: `transitions-project.js`, `defer blocking="render"`, between `transitions-tab.js` and `transitions.js`, on the project pages **and on Building.dc.html**. The way back lands on the board, whose pagereveal must replace the browser's width-and-height animations for `pj-tab-*` (R5). AGENTS.md's head order says which pages load it.
- `scripts/verify/vt-lib.mjs`: a Chromium launcher with the back/forward cache on (`ignoreDefaultArgs: ['--disable-back-forward-cache']`), which Playwright disables by default and `shot-runner.mjs` doesn't undo (R12).
- `scripts/verify/vt-project.mjs` (new); `vt-moves.mjs`, `vt-nav.mjs` and `vt-webkit.mjs` extended; `AGENTS.md` (the moves, the names, the swap hook's `fy-vt` field).

**Constraints.**

- Compositor only: each group is scaled, never sized; a clip is constant; nothing is drawn per frame.
- One element per name: on the board only one dossier's (or one card's) tabs carry names at a time; a page names at most five, NJJoe three. A duplicate name aborts the transition, so `vt-project` asserts that `ready` resolves.
- Phones (R10): a transition's snapshots ignore ancestor clips, so a move ends exactly where the settled page is. With 1b's peek inside the cork, the way back's last frame is the board at rest, with no pop from five tabs to slivers. Nothing may widen a page: a zoomed-out phone viewport aborts a transition.
- WebKit runs cross-document view transitions, but Playwright's WebKit shoots blank frames during them, so it is verified from video. Firefox gets a hard cut.

**Verification.**

- `vt-project.mjs` (new), at 1440 and 390 plus a mobile context:
  - in from the dossier and from the direct link; out; chapter moves later and earlier;
  - every custom animation moves only transform or opacity, and `ready` resolves;
  - the tabs land within 1 px of the page's own, and each move's last frame matches the settled page within 1 px at 360 and 390 (R10);
  - the card comes back into view (R1): NJJoe after scrolling the board to its end, after two chapter hops, and after more than 10 s (past `fy-vt`'s FRESH), at 1440 and 390; the re-pin after it lands;
  - reduced motion and Firefox get no move, and no pin is hidden or pressed (R17);
  - `fy-vt` is consumed every time;
  - bfcache, with the cache on (R12): Back to a board left with its dossier open restores it `persisted`, closes the dossier, and the move's `ready` resolves.
- `vt-moves.mjs` (a project page's tab answer), `vt-webkit.mjs` (video), `building-motion.mjs` (the re-pin), `vt-lcp.mjs`.

**Performance.** About 5 KB of deferred, render-blocking script. LCP no slower than after PR 2.

## 8. PR 4 · NJJoe in the dossier

**What ships.** The casebook's index, listing microsite and APA campaign, and the email demo, as static pages in the dossier's look, with finished sections only. There is no campaign-results section; Case 02 keeps its factual state, "active pilot". NJJoe joins the moves: its three fore-edge tabs are named, and the board's NJJoe dossier and peeking tabs travel.

**Files.**

- `building/njjoe/{index,microsite,apa}.html`: rewritten as in PR 2 (static header, head order, no `<base>`, relative paths, plain fragments; `apa.html:86`'s iframe src included).
- `building/njjoe/email-demo/buyer.html`: stays the email artifact, its inline styles being the email. It loads four images (1.29 MB) from `apa.njjoegroup.com` (R13); Q9 decides whether they're vendored as derived copies or stay external. Until then `project-pages.mjs` names that host as its one exemption from "every request 200".
- `lib/njjoe/njjoe.css`: the cases and their before/after, the common pattern, Joe's words, the APA funnel and batch table, the archive capture as an exhibit. No page script: casebook.js's reveals are out, its folder rename goes with `<base>`, and #20 removed its WIP code.
- Delete `assets/njjoe/casebook.css`, `casebook.js` and `apa-demo.css`.
- Fonts: `casebook.css` line 1 points `@font-face` "MuyaoPleased" at the full `fonts/MuyaoSuixin.woff2` master. Whatever NJJoe face the port keeps comes from its `fonts/derived/` subset.
- The microsite's captures come from E.
- `scripts/verify/`: `project-pages.mjs`, `project-rail.mjs` (fresh fragments on the microsite and APA, R9), `vt-project.mjs` and `pen-spacing.mjs` extended to NJJoe. `AGENTS.md`.

**Design details.** The index as the board shows it, minus the campaign-results section. APA typed as a dossier: the funnel's figures stamped, the batch table typed, the email preview as an exhibit, the evidence notes as typed notes. The microsite: the four surfaces as ruled entries, the intervention's four steps, the archive capture as a clipped print that scrolls inside. The one hand note ("automation does not remove the handoff…") stays a rationed hand aside, in pencil, not coral. None needs Fred's eyes first; the PR carries before/after screenshots.

**Performance.** Today at 1440: index 752 ms, microsite 840 ms, APA 744 ms (§9). CLS at 1440 is 0.063–0.076 today, from the fade-ups and the font swap; the target is under 0.01, gated in `project-pages.mjs` (R12). Each page no slower.

## 9. Performance: today's numbers

On `b085f70`, measured the way `vt-lcp.mjs` measures (a fresh context, Fast 4G at 9 Mbps and 165 ms RTT; 390 adds 4× CPU; median of 3). Each PR re-measures against main at the time.

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

What should move the numbers: no React on any of these pages; self-hosted subsets instead of Google's; derived, sized, lazy evidence; no fade-ups. What could cost: render-blocking transition scripts (small, deferred) and the dossier data (a few KB).

## 10. Risks across the stack

- **Two chapter lists.** The board's dossier (`content/building-projects.js`) and each page's fore-edge nav must stay in step; `project-pages.mjs` compares them.
- **External links.** The folder URLs (`building/fred-agent/`, `building/njjoe/`) keep working without #18's rename, because nothing depends on the base any more; `project-pages.mjs` loads both.
- **New CJK strings** (章节, 回到板上, 放回 and the like) need `generate-fonts.py` over `building/**`; the font audit names any missing character.
- **AGENTS.md** is edited by every PR. Each rebases and edits only its own sections.
- **Real devices.** Headless Chromium and WebKit are the checks; Fred tests on phones after deploy. Firefox keeps a hard cut.
- **Deferred (R18).** When GitHub Pages serves `404.html` under `/building/<id>/`, its relative asset paths and home link break. It is pre-existing, and `404.html` is a root page no PR here touches, so it gets its own small fix.

## 11. The review, finding by finding

| # | Finding | Resolution | Where |
|---|---|---|---|
| 1 | The board's position can't travel in `fy-vt` | **Resolved:** the card you came back from is brought into view, derived from the from URL in the pagereveal handler; no storage. Tested after a scroll, two hops and 10 s. Q2 (b) would add `fy-board` | §7 |
| 2 | Kraft colours miss their targets | **Resolved:** tab text `--ink` 7.57:1, the pen `--mark-deep` 3.45:1, no wheat on kraft, the current tab is paper (Q6); contrast assertions in `building-dossier` and `project-pages`; `CORAL` updated | §0, §5, §6 |
| 3 | Fraunces-first restyles the board | **Resolved:** dropped from 1a and 1b; asked as Q5 (recommended: no change) | §5 |
| 4 | WebKit premise wrong; FY.mount coverage lost | **Resolved:** build at evaluation, `wire()` behind the gate, restore in pagereveal, vt-webkit-mount's Building entry updated, a `.slot`-at-pagereveal check in both engines | §2, §7 |
| 5 | Building needs transitions-project.js | **Resolved:** loaded on Building too; a missing module skips the move; `prepare()` uses `TAB`; `ride`, `frame` and `spring` through `V` | §7 |
| 6 | transitions.js would pass 500 lines | **Resolved:** the parsing and the move choice live in transitions-project.js; transitions.js adds at most 12 lines; chapter order comes from the pages | §7 |
| 7 | Rail reuse under-scoped | **Resolved:** PR R extracts `rail.css` without the Noto face and takes its hosts from the context; the adapter's contract is listed. It lands after #22, which also edits the rail's context in `bus.js` (merged) | §3 |
| 8 | The card pulls in the whole board stylesheet | **Resolved:** `card.css` split out; kraft tokens in `dossier.css`; the cover card built after first paint in a reserved box, links stripped | §5, §6 |
| 9 | Fresh fragments won't hold on Demos | **Resolved:** every evidence image sized (E); the re-align dropped; the fresh-fragment test covers Demos, the microsite and APA on a cold cache | §4, §6, §8 |
| 10 | Phone tabs don't fit; the moves pop | **Resolved:** peek inside the cork (1b), every tab in the phone strip with the counter off the row (PR 2), last-frame checks at 360 and 390 (PR 3); asked as Q7 | §5, §6, §7 |
| 11 | PR 1 waits on unfinished streams and on Q1 | **Resolved:** split into 1a (after #21 only) and 1b (after Q1); fonts and identity rebase onto whichever lands first; R and E split out of PR 2 | §1 |
| 12 | Budgets aren't gated | **Resolved:** a CLS gate in `vt-lcp`; transferred bytes in `evidence` and `project-pages`; bfcache on for `vt-project`, with the stale-names case | §0, §4, §6, §7 |
| 13 | buyer.html loads four external images | **Asked as Q9;** until answered, `project-pages` names the host as its one exemption | §8 |
| 14 | Fonts: italic, Plex preload, CJK | **Resolved:** Fraunces italic 400 declared in `dossier.css`; Plex Mono latin preloaded on project pages; CJK adds only 🤞 | §6 |
| 15 | The evidence ladder is unspecified | **Resolved:** JPEG through `sips`, q86 display ladder 640–1760, q90 zoom tier at full width, originals archived under `images/evidence/` | §4 |
| 16 | Branch behind main | **Resolved:** rebased onto `cca4134`; the dossier data and the mocks say `2025—now` | intro |
| 17 | PR 3 hand-off | **Resolved:** a swap merge hook in transitions.js; no hidden or pressed pin without a view transition | §7 |
| 18 | `404.html` under `/building/<id>/` breaks | **Deferred:** pre-existing on main, and `404.html` is a root page no PR here touches. It gets its own small fix, since it concerns every sub-path, not only Building | §10 |
