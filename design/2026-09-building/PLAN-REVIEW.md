# Adversarial review of PORT-PLAN.md

An independent agent reviewed `PORT-PLAN.md` against the code on 2026-09-29, just before the work paused. It found 1 blocking, 11 significant and 6 minor findings. Removing `<base>`, the static Building page and the states between PRs all check out. Section numbers refer to `PORT-PLAN.md`. Resolve the blocking and significant findings, and take the open questions to Fred, before PR 1 starts.

Answered 2026-09-29: `PORT-PLAN.md` was revised against this review (its §11 lists every finding's resolution), and the open questions below are Q1–Q9 in `HANDOFF.md` §4. Section numbers here refer to the first plan.

## Blocking

### 1. §4 PR 3: "the board is where you left it" can't travel in `fy-vt`

`fy-vt` lasts one hop. The project page's `take()` deletes it at pagereveal (`transitions.js:172–176`), and every later pageswap rewrites it as `{from, to, t}` (`:463`). By the time someone clicks "← Building board", the board's position is gone. The mocks have the same flaw: `01-board.js` reads `back.x`, but the project mock's swap writes only the id (`02-project.js:106`).

Evidence (mock C, headless Chromium): at 1440 I stepped the board to −750 px, unpinned NJJoe, took a dossier tab to 05-njjoe, then clicked back. The track came back at 0, with NJJoe's slot at x=1583 in a 1440 viewport. At 390 it went from −1001 to 0, with NJJoe at x=1032. The tabs would tuck behind an off-screen card. Only Fred Agent, the first card, is in view at x=0.

Change: pick one and specify it.
- (a) The simplest: on arrival from `building/<id>/`, bring that card into view. The card comes from the "from" URL, so no storage is needed.
- (b) A session key such as `fy-board {id, x}`, added to AGENTS.md's list of sessionStorage keys.

Either way, do it in the pagereveal handler (see 4). Test NJJoe after scrolling the board, after two chapter hops, and after more than 10 s (FRESH).

## Significant

### 2. §2 and HANDOFF §5: the kraft colours miss the plan's own targets

Coral multiplied by kraft (#D9695A × #D8C29A = #B85036) is 2.86:1 on kraft, below the 3:1 the plan promises for hover and focus. pen.css's multiply works on cork and wheat (3.17 and 3.07) but not here. `--mark-deep` (#A5453A) gives 3.45:1. `--soft` (3.31:1) and `--pencil` (3.07:1) also fail on kraft, so tab text needs its own ink: the boards' #6E5A3A is 3.80:1, and `--ink` is 7.57:1. The wheat band is 1.11:1 against kraft (1.5:1 multiplied). §3's "if the wheat band stays faint" is not an if: make the paper current tab the spec and show Fred. Add contrast assertions to building-dossier and project-pages, and add the new coral to `building-board.mjs:12`'s hard-coded CORAL list, or its "no coral at rest" check will miss it.

### 3. §2: "Fraunces ahead of Noto Serif SC" restyles the board, yet it's filed under "none needs Fred's eyes"

`CSS.getPlatformFontsForNode` on today's Building shows `p.highlighted-note`, the LCP element, drawing 145 glyphs from Noto Serif SC and 18 from Fraunces; the featured note draws 96 and 12. The `-ui` subset carries all printable ASCII, so the board's English is set in Noto Serif SC's Latin today (`building.css:24`, `:46`). Flipping the order changes every card's body face. It also moves the LCP element onto Fraunces, which isn't preloaded (Noto `-ui` is), the swap-repaint LCP trap AGENTS.md describes.

Change: drop it from PR 1, since the content is ASCII and the audit calls the problem latent. Or take it to Fred with before/after shots and an LCP run.

### 4. §2 and §8, WebKit: the plan's premise is wrong, and dropping FY.mount loses coverage

The plan says "a render-blocking module runs after the head's sheets have loaded". In WebKit that's false: #21 found WebKit runs deferred scripts, which modules are, before the head's sheets apply. `build()` measures nothing, so building at module evaluation is fine. Anything that measures before first render is not: `wire()`, and PR 3's restore if it measures slots. #21's `vt-webkit-mount.mjs` checks Building as `'[data-mount=board] .slot'` by wrapping FY.mount and holding React back. After PR 1 neither exists, so the check breaks or passes vacuously.

Change:
- Build at evaluation, but keep `wire()` behind FY.mount's stylesheet gate.
- Run PR 3's pre-capture restore in the pagereveal handler, where every engine has applied the sheets.
- Update vt-webkit-mount's Building entry.
- Add a WebKit check that `.slot` exists at pagereveal. An init-script listener does it; no screenshots needed.

Measured in Chromium at pagereveal: the mock board has 7 slots, today's Building has 0. Playwright's WebKit 26.6 has `blocking=render`, pagereveal, pageswap and `navigation.activation`, but no `view-transition-group`.

### 5. §4 Files: Building.dc.html needs transitions-project.js too

The way back lands on the board, so the board's pagereveal must replace the browser's animations for `pj-tab-*`. The plan adds the script only to the project pages. Left to the browser, those groups animate width and height, which runs on the main thread. That breaks the compositor rule, and it isn't the designed tuck either.

Change: load the script on Building and update AGENTS.md's head order. When the module is missing, `transitions.js` should skip the move rather than leave the browser's default animations running. Also in `transitions-tab.js`: `prepare()` keeps its own tab map, which needs the project kind, and ride, frame and spring should be exposed through `V` for `transitions-project.js` rather than copied (the plan says the header rides down "as the tab moves' does").

### 6. §4: transitions.js will pass the 500-line rule

It's 484 lines. Site-root resolution, a project kind with id and chapter, three new moves and a dispatch will push it past 500.

Change: put the project parsing and the in/out/chapter choice in `transitions-project.js`, through `V`, and keep `transitions.js` to the root resolution plus a hook. Don't hard-code chapter numbers in `transitions.js`; that would be a third copy of the chapter list. The old page writes its `aria-current` index into `fy-vt` at pageswap, and the new page reads its own `.pj-tabs`.

### 7. §3: the rail reuse is under-scoped, and its stated dependency is wrong

- **The CSS drags in Reading's body font.** `rail.js`'s CSS is in `lib/reading/reading.css` (`:160–194`), the same file that declares Noto Serif SC → `NotoSerifSC-text.woff2` (`:5`). Loading it on a project page declares the 1,087 KB face under the same family name, which is exactly what AGENTS.md's font split exists to prevent.
- **It depends on Reading's page tokens.** The rail CSS also needs `--n1`, `--text-cn` and `--card-shadow` (`:9–19`) and the `.rnav` selectors (`:188`, `:193`).
- **Its context comes from Reading's bus.** `ctx.g.b0/n1/sL/vh/vw/rm`, `onLand`, `jump`, `post`, `kind` and `lang`. The labels' 「 」 comes from `states.js:26`, not `rail.js`.

Change: a small PR before PR 2 that extracts `lib/reading/rail.css` and takes the strip and counter hosts from the context, with `reading-rail.mjs` unchanged. List what `project-rail.js` really has to do.

The Writing CN/EN branch (#22) doesn't touch `rail.js`. It touches only `bus.js:102–127`, which builds the rail's context, so don't make PR 2 wait for it.

### 8. §3: the clipped card pulls the whole board stylesheet into every chapter

The C mocks `@import` production `building.css` (`02-project.css:5`). That brings a global `*{margin:0;padding:0}` reset, the board's body font stack and the grain overlay, and the mock then overrides the body font. The plan lists no stylesheet for the card.

Change:
- Split the card's rules (slot, swing, paper, pin, tape, label) into `lib/building/card.css`.
- Put the kraft tokens in `dossier.css`, which both surfaces load, not in `building.css`.
- Say whether `cover.js` blocks rendering. It adds `building-projects.js`, `cards.js` and `flower.js` to every chapter's first render. In C the card doesn't travel, so build it after first paint in a reserved box.
- Strip the cover card's links. Its href is `"./building/fred-agent/"`, which resolves to `building/fred-agent/building/fred-agent/` on a project page.

### 9. §3: "a section link opened fresh lands on its section" won't hold on Demos

No Demos evidence image has a width or height (`demos.html:133, 223, 316, 338, 371`), and `.fa-evidence-shot-wrap` is `width:max-content` with no reserved height (`fred-agent.css:399`). Lazy images above a section load after the fragment scroll and push the section down. The `fonts.ready` re-align doesn't cover images, and it is the load-time scroll the section says it avoids.

Change: give every evidence image its intrinsic width and height, taken from the derivative generator, and drop the re-align. Extend the fresh-fragment test to Demos (`#trash-patrol`, `#unattended-recovery` and the rest), the microsite and APA, on a cold cache.

### 10. Phones: the tab strips don't fit, and the moves pop

- **The chapter strip:** in the mock's phone strip at 390 (`c-03-principles-390.jpg`), "05 / 11" sits on tab 03's label and tabs 04–05 are cut off. `02-c.css:42` makes the strip `overflow-x:auto` with the scrollbar hidden. PR 2 doesn't design this.
- **The board's peeking tabs:** at 390 the cork clips them to slivers at rest.
- **The way back:** a transition's snapshots ignore ancestor clips. With the way back frozen at its end (mock, 390), the `pj-tab` images draw 40 px wide out to x≈383 while the cork clips at 373. The move ends by popping from five readable tabs to slivers.

Change:
- In PR 1, make the peeking tabs fit inside the cork on phones.
- In PR 2, design a phone strip that shows every tab (e.g. numbers only, except the current tab), with the counter off the tab row.
- Check at 360 and 390 that no tab is clipped or overlapped, and that each move's last frame matches the settled page within 1 px.

### 11. §8: PR 1 waits on two unfinished streams, and starts before the question that changes it most

PR 1 waits on the identity port and the fonts branch, but both overlap it only in text. The fonts branch deletes Building's three Google Fonts lines and adds `@font-face` rules above `:root`, while PR 1 adds a token inside `:root`. The identity port rewrites header markup that PR 1 doesn't touch. Meanwhile §8 says to build PR 1 now, though §7 says the unpin answer changes PR 1 the most.

Change: split PR 1.
- **1a:** Building goes static (no `support.js` or `<x-dc>`, board built at module evaluation), screenshot-identical, after #21 only.
- **1b:** the dossier, after Fred answers.

Let the fonts and identity branches rebase onto whichever lands first. Taking the rail extraction (7) and the evidence ladder out as standalone PRs also shrinks PR 2, the L one.

### 12. §9: the budgets aren't gated as planned

- **CLS:** `vt-lcp.mjs` checks only LCP. It logs CLS but never checks it, so "hold CLS at 0", "under 0.01" and "CLS may not rise" have no gate.
- **Bytes:** only `home-net.mjs` measures bytes, so Demos' "under 1.5 MB before the reader scrolls" is unmeasured.
- **bfcache:** Playwright launches Chromium with `--disable-back-forward-cache`, and `shot-runner.mjs` doesn't undo it. My Back test on the mock got `pageshow persisted=false`, so vt-project's bfcache case needs `ignoreDefaultArgs: ['--disable-back-forward-cache']`. It matters because on iOS, Back usually restores from bfcache. That path must clear the `.fy-vt-tabs` names the board set at pageswap before naming the peek tabs, or the duplicate names abort the move.

Change: add CLS and transferred-bytes checks to vt-lcp or project-pages, launch vt-project's browser with bfcache on, and test a board restored with its dossier open.

## Minor

13. **§5 says `buyer.html` was "checked to request nothing external". That's false.** It loads four images from `apa.njjoegroup.com` (1.29 MB, all returning 200 today), so project-pages' "every request 200" would depend on a client's server. Vendor derived copies or exempt them; that's Fred's call.
14. **Fonts.**
    - After the fonts branch, Fraunces italic is declared per page (Reading and home only). C uses italic (`.pj-note` at `02-project.css:36`, `.pj-pull` at `03-rail.css:13`; the boards load italic 400 from Google), so the project CSS must declare it or get a faux italic.
    - Preload Plex Mono latin on the project pages too, so the fore-edge tabs aren't captured in a fallback face.
    - CJK is a non-issue: `building/**/*.html` adds one glyph (🤞) to the 313 already in `-ui`.
15. **The evidence ladder.** `generate-derivatives.py` only writes JPEG, via sips at q74 for display sizes, which blurs the small text in UI screenshots. The loupes zoom into the same image (`fred-agent.js:42–52`), so the ladder needs a zoom tier. Specify format, quality and the loupe tier, and give the archived originals a path in AGENTS.md.
16. **design/building is two commits behind main.** 1e157d1 (2025—now) and 583969b (the placeholders line) already fixed the two content mismatches HANDOFF §4 lists. Rebase before PR 1 so the dossier data says 2025—now.
17. **PR 3 hand-off.**
    - `transitions.js`'s pageswap overwrites `fy-vt` (`:463`), so board.js's fields need a merge hook like the mocks' `BD_PAGE.swap`.
    - Without a view transition (Firefox, a skipped move), don't hide the returning card's pin. The mock re-presses the pin after a hard cut, a pin press with no cause.
18. **Pre-existing, out of scope:** when GitHub Pages serves `404.html` under `/building/<id>/`, its relative asset paths and its home link break.

## Checked and sound

- **Removing `<base>`.**
  - Relative paths resolve the same from `building/fred-agent/` and `building/fred-agent/index.html`, and bare fragments stay on the page. #18's rename and popstate guard can go with the router.
  - `apa.html:86`'s iframe src and the skip links are part of the mechanical rewrite.
  - `llms.txt` and `building-projects.js` link the folder URLs, which keep working. `robots.txt` disallows nothing.
- **Static Building.** Nothing in `lib/building` depends on `support.js` (no `x-dc` or `#dc-root` selectors), and `index.html` is the precedent. A render-blocking module builds the board before pagereveal in Chromium.
- **Between PRs.**
  - Until PR 3, `transitions.js` resolves pages against their own directory (`:155–161`), so it doesn't recognise building/ pages. Both sides skip the transition and it's a hard cut, with no regression.
  - PR 2 retires the sub-sites' rule-breaking same-document fade-and-rise.
  - PR 4 works merged before or after PR 3.
- **Naming the tabs.** Naming them with a class at pageswap works: the mock's way in resolved ready with `pj-tab-1…5` each named once. Compositor-only relays are feasible the way `transitions-tab.js` does them.
- **Fonts for the sub-sites.** The `-ui` subset tier is right for them, and adding `building/**/*.html` to PAGES is right.

## Open questions for Fred that the plan decides quietly

1. A click unpins the card, or goes straight in? Still unanswered; gate PR 1b on it.
2. "The board where you left it", or "the card you came back to brought into view"? (Finding 1.)
3. The board's body typeface. (Finding 3.)
4. The current fore-edge tab as paper instead of wheat-banded kraft. (Finding 2.)
5. Components gets the margin rail too. The boards showed it only on Principles, and Fred's brief for Fred Agent was "restyle, keep structure".
6. The phone strip layout. (Finding 10.)
7. The direct link's tab flight: new motion the boards never showed.
8. The email demo depending on `apa.njjoegroup.com`. (Finding 13.)

## Not verified

Headless WebKit never reached the local server: every goto timed out and the server logged no WebKit request, so WebKit behaviour is unverified beyond which APIs exist.
