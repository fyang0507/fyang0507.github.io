# Port plan — lead decisions (read first)

These override the plan below where they differ. The plan was written by the port-planner agent on 2026-09-28; the lead locked its open questions as follows.

1. **`design/` ships in this PR** (Fred's call: keep the boards as lineage). The deploy strips it. Production must request nothing from `/design/`. Don't copy board chrome into production.
2. **Opener only on a direct landing.** The OP plays when home is the first page of the session and the visitor did not arrive by an internal navigation. Arriving on home from inside the site plays the gravity-return transition instead. `fy-opener` is set either way (plan §4.1 default).
3. **`index.html` drops `<x-dc>` and `support.js`** (plan §4.2 default).
4. **Reading dark mode uses the papered, no-halftone path** (plan §4.3 default).
5. **Writing's EN toggle and its `fy-lang` write are removed** (gateway pages show both languages together).
6. Every other §4 default stands.
7. **Ownership changes vs the plan:**
   - All `site-nav.css` edits, including P0 item 5 (label legibility), belong to **P1-nav**.
   - P0 does **not** create the shared-module stubs; the lead already created them (`motion.js pen.js pen-tier.js pen.css site.js transitions.js transitions.css`). P0 creates `site-tokens.css` only.
   - The plan missed that `building/njjoe/*.html` and `building/fred-agent/*.html` load `site-nav.css` (and fred-agent loads `support.js`). **P1-nav owns their header markup** and must keep every one of them rendering correctly at 1440 and 390 after the nav changes. They get no view transitions unless it's trivial.
8. **Git:** agents never run state-changing git commands (no add, commit, stash, checkout, reset, restore). The lead commits each package when it's done, staging only its owned paths.
9. **Servers:** http://127.0.0.1:4173/ serves this working tree (the branch). http://127.0.0.1:4174/ serves `origin/main` read-only as the "before" site; never edit that tree. Don't start or stop servers.
10. **Runner:** `node /tmp/fyshot/run.mjs <steps.mjs>` (HANDOFF §9). Screenshots go to `/tmp/fyshot/<pkg>-*`. Never use the MCP browser tools.
11. **Report back** when done: files created or edited (with line counts), each success criterion with its result, deviations from the plan and why, and known limitations. Report only after your final run has finished, and don't leave background shells running.
12. **As built (supersedes §1–§4 where they differ):**
   - Landmark data is `{kind, marks:[…]}`; reference and footnote ids are prefixed per language at build time (`zh-ref-1`, `en-fn-x`) and each `.mn` has `data-ref`; English and Chinese landmarks are checked for equivalence by `landmarks.py --check` (board parity retired).
   - `frame-rest` is its own desk layer; every strip rung is lossy and strictly lighter than the next size up.
   - `content/posts.js` is gone: Reading loads `posts-index.js` plus one `content/bodies/<id>.js`.
   - Head order: `support.js` first; `motion.js` and `transitions.js` load `defer blocking="render"` (not parser-blocking).
   - `FY.mount` ignores support.js's unrendered `<x-dc>` template and keeps watching for the rendered host.

---

# Production port plan: motion redesign (branch `redesign/motion-revamp`, one PR)

## 0. Findings that change the brief

1. **Nothing inside `<x-dc>` exists at first paint or at `pagereveal`.**
   - `support.js:1677` hides `x-dc`. React UMD then loads async from unpkg (`:1073`, `:1686`), and boot swaps `<x-dc>` for `#dc-root` (`:165–168`).
   - `<helmet>` children are hoisted only at render (`:1340–1410`). That means every page's `:root` tokens, `@font-face` rules and body background arrive after React.
   - Markup outside `<x-dc>` is left alone; Building's trailing plain `<script>` (`Building.dc.html:293`) already works this way.
   - Consequence: cross-document View Transitions (VT) need the **header (identity + nav + rule) as static HTML outside `<x-dc>`**, styled only by head `<link>`s. The home desk and the opener stage also need to be static.
   - The `pageswap`/`pagereveal` listeners must sit in a **parser-blocking head script**. A deferred or helmet script misses `pagereveal`.
2. **Board 01 uses no VT API at all.** It is one document driven by a rAF loop. The production recipe exists only as prose (`r2-01-transitions.html:27`), so the keyframe sampler has to be written, not ported.
3. **No production view uses a solved point arrow.**
   - Writing's "load more" is gone (it became the bookcase) and Building's arrow was cut.
   - Only About's cue uses the arrow, and only `ArrowFit.glyph()` at a fixed pose (`r7-07-about-rig.js:56`).
   - So `ArrowFit.solve/collect` and `PointMark` are not ported.
4. **The opener's new glyphs are 点按跳** (in 「点按跳过」). 载 and 已 were round 2 only.
5. **Gallery loads neither `image-slot.js` nor any EXIF data.**
6. **`generate-fonts.py` only scans the `PAGES` list (`:76–80`).** Strings in new JS files never reach the subsets unless the list grows. Its `fred-agent.css` entry is also stale (the file is at `assets/fred-agent/`).
7. **`scripts/generate-content.py` is already 615 lines**, over the 500-line limit.
8. **The deploy workflow deletes `scripts/`**, so no runtime code can live there. Verification code can.
9. **The multi-key citation `[1, 2]` crashes 08b's `FN.prepare`** on `2025-12-06_the-stories-we-live-05`. The generator emits one `<sup>` followed by two `.mn`; the second `.mn` takes the first as its "sup" and `querySelector` throws on an external URL.
10. The working tree already strips `design` in `deploy-pages.yml` (uncommitted).

## 1. Architecture

**Layout**
- Shared modules sit at the repo root, beside `support.js` and `site-nav.css`.
- Page code lives in `lib/<page>/`. There is no `building/` clash (that directory holds sub-sites), and nothing goes under `scripts/`.
- Generated sprites go to `assets/derived/`.

| File (root) | Contents | Consolidated from |
|---|---|---|
| `site-tokens.css` (~80) | One `:root`; `html,body` paper/ink; `@font-face` for JinBuTi, Muyao and Noto Sans SC-ui (Noto Serif SC stays per page because of the -ui/-text tier split) | `shared/mock.css:6–21`, page `:root` blocks, `r3-02-pen.css:4–5`, `r4-02-pen.css:8–12` |
| `motion.js` (~220, **blocking**) | `window.Motion` | see contract below |
| `pen.js` (~260) | `window.Pen` | `shared/pen.js`, `r3-02-arrow.js:57–85` (glyph only), baseline probe from `r4-02-tier.js:27–45` |
| `pen-tier.js` (~280) | `TierMark`, `FocusMark`, `Tier.wire` | `r4-02-tier.js`, `r3-02-point.js` FocusMark, tier rule `r4-02-slices.js:32–86` |
| `pen.css` (~40) | `.tm/.tm-h/.tm-band/.tm-line/.tm-hot/.fm-c/.pt-s`, per-paper `--pen` via `[data-paper]` | `r3-02-pen.css`, `r3-02-build.css:3`, `r4-02-pen.css` |
| `site.js` (~90) | Nav marks (hover tier on labels, coral 「 」 on tabs), pen folder tab on the current tab, `FY.mount(sel, fn)` | `r2-01-a.js:51–64` (tab path), Building's MutationObserver pattern (`Building.dc.html:590–596`) |
| `transitions.js` (~300, **blocking**) | pageswap/pagereveal, `Chan`/`Body`/arc sampler, edge→rule live SVG, tab hops | `r2-01-physics.js:34–147`, `r2-01-a.js`, `r2-01-render.js`, `r2-01-desk.js:32–40` (NAV ink boxes, MASS) |
| `transitions.css` (~120) | `@view-transition`, names, keyframes for old-only groups, reduced motion | `r2-01-transitions.css:78–84` + the html:27 spec |

**Contracts** (frozen so the page packages can code against them before the system package lands):
- **Motion:**
  - `reduced()`, `onReduced(fn)` (matchMedia change listener; replaces `html.rm`).
  - `clamp, lerp, smooth, cubic, EASE`.
  - `Spring({k,c}|{f,zeta})` with `.step/.rest/.snap/.setK`, 4 substeps.
  - `Loop(tick)` (sleeping rAF, dt cap .05) and `Loop.visible(el, loop)`.
  - `tween(obj,key,to,dur,delay,ease,done)`.
  - `springEase(k,c,m)` returning a `linear()` string.
  - `play(el,kf,opts)` (WAAPI + commitStyles).
  - `held(frames)` (per-keyframe `steps(1,end)`, the r4-05 fix).
  - `Velocity(ms)` (80 ms About, 100 ms Building: parameterised), `pendulum(state,dt,opts)`.
  - Sources: `r2-04-kit.js:46–94`, `r4-07-about-kit.js:135–146`, `r2-06-viewer.js:17–21`, `r2-06-line.js:32–45`, `r2-02-anim.js`, `r2-05-physics.js:116–124,209–212`.
- **Pen:**
  - Kept from the old pen: `rng, hash, smooth, loop, underline, bracket, tick, strike, path, draw, erase, annotate, dashes, hiddenAt`. `annotate(...,'underline')` now hangs from the baseline (baseline + max(3px, .18em), untransformed frame). `tick` stays for illustration use (sleeve checklist), never for states.
  - New: `glyph(tip,deg,L,seed)`, `pointOnce(key)`/`spend(key)` (sessionStorage `fy-point-<key>`).
  - `scribble` and the old `arrow` are removed.
  - `Pen.reduced` delegates to `Motion.reduced`.
- **TierMark / FocusMark:**
  - `TierMark(host,target,{over,seed})` with `.to(0|1|2,how)` and `.destroy()`. No global `all` list that grows forever.
  - `FocusMark(host,target,{gap,gl,gy,big})` with `.set(on,instant)` and `.destroy()`. It is measured in the untransformed frame, which fixes r3's rotated-box bug.
  - `Tier.wire(host,{target,chosen,onChange})`: the tier rule every consumer repeats (hover only for non-touch, focus-visible for 「 」, a press holds tier 2 until the gesture lands).
  - Seeds come from text, with a `data-pen-seed` override.
  - Strokes: coral 2.2 px `var(--pen)` for hover and focus; chosen = wheat band `--hl` .86 with `--hl-ink` 2 px edge; the return stroke absorbs the coral.
- **VT names:**
  - `identity` = `.site-identity`.
  - `obj-laptop|book|frame|camera` = `.site-nav-*` on subpages and `.desk-laptop|book|frame|camera` on home.
  - `site-rule` = `.site-rule`; `tabmark` = `.site-tabmark`.
  - Home old/new-only groups: `desk-table` (`.desk-plate`), `desk-edge`, `desk-mug`, `desk-plant`, `desk-bird`, `desk-notes`.
  - `rule-live` is a transient SVG created in `pagereveal`, named so that it stacks above the root group.
  - Only one rendered element per name per document (home's desktop and phone layouts share one desk DOM).

**Subpage head order**

```
site-tokens.css, site-nav.css, pen.css, transitions.css, lib/<page>/<page>.css,
<link rel=expect href="#site-nav" blocking=render>,
motion.js, transitions.js (blocking), support.js,
defer: pen.js, pen-tier.js, site.js, content/*, lib/<page>/*.js
```

- Drop every `?v=` on stylesheet links (GitHub Pages already serves max-age=600 + ETag, same rationale AGENTS.md gives for manifests).

**x-dc integration rule**
- `<x-dc>` stays on the five `.dc.html` pages for their static template text.
- Interactive surfaces mount into an empty template host through `FY.mount('[data-mount=x]', fn)`. Hosts are never under an `sc-if` that can flip, and any remaining DCLogic never calls `setState` after mount.
- Page CSS moves from helmet into `lib/<page>/<page>.css` in the head, so it applies at first paint.
- Page logic replaced by modules is deleted, not kept alongside.
- **index.html drops `<x-dc>` and `support.js` completely.** The desk and opener must paint before React, and nothing templated remains there (it also removes React from the entry page).

## 2. Work packages, ownership and phases

Phases:
- **P0** runs alone.
- **P1** is three packages in parallel.
- **P2** is six packages in parallel. They can start right after P0, code to the contracts, and wire the pen when P1-pen lands.
- **P4** runs alone.

Ground rules:
- Nobody edits a file they don't own.
- API change requests go to the owner by message.
- `site-tokens.css` is frozen after P0; page-specific tokens live in the page's own CSS. A genuinely global token request goes to P4.
- Generators: only P1-gen runs `generate-content.py` and `generate-sprites.py`; only P4 runs `generate-fonts.py`. During P2, missing CJK glyphs render in fallback; that is expected.
- Packages don't commit. P4 commits per package, in phase order, staging only owned paths (`git add -- <paths>`, never `-A`), and never `design/` or `.playwright-mcp/`.
- No board chrome ships: `grep -rE "mock:rm|mock-top|html\.rm|replay|__r[0-9]|R4state|R7A" lib/ *.js` must return nothing.

| Pkg | Owns | Ports / does | Depends on | Est. lines |
|---|---|---|---|---|
| **P0 · L0 hygiene + scaffold** | Creates `site-tokens.css` and empty stubs of every shared module in §1. Edits `Building/Writing/Gallery/About/Reading.dc.html` (listed edits only) and `site-nav.css`. | Items listed below the table | — | ~350 |
| **P1-pen · L1 pen + motion** | `motion.js pen.js pen-tier.js pen.css`, `scripts/verify/pen-*.{mjs,html}` | The contracts above; port `r4-02-check.js` as `scripts/verify/pen-spacing.mjs` | P0 | ~800 + 150 tests |
| **P1-nav · L1 transitions + nav** | `transitions.js transitions.css site.js`; `site-nav.css` (after P0); `scripts/verify/vt-*.mjs` | Items listed below the table | P0; home DOM contract (P3) for home↔page tests | ~600 + 120 |
| **P1-gen · prerequisites** | `scripts/generate-content.py` (+ split into `scripts/content_markdown.py`), new `scripts/landmarks.py` and `scripts/generate-sprites.py`, `scripts/generate-fonts.py`, `.agents/skills/add-website-content/scripts/audit_content.py`; generated `content/posts.js`, `content/posts-index.js`, `content/home.js`, `assets/derived/**` | See §3 | P0 | ~850 |
| **P2-writing** | `Writing.dc.html`, `lib/writing/*` | Details below | P1-pen, P1-gen (posts-index) | ~1,850 |
| **P2-building** | `Building.dc.html`, `lib/building/*` | Details below | P1-pen | ~1,400 |
| **P2-gallery** | `Gallery.dc.html`, `lib/gallery/*` | Details below | P1-pen | ~1,150 |
| **P2-about** | `About.dc.html`, `lib/about/*` | Details below | P1-pen | ~1,100 |
| **P2-reading** | `Reading.dc.html`, `lib/reading/*`, `scripts/verify/reading-*.mjs` | Details below | P1-pen, P1-gen (landmarks) | ~1,400 + 120 |
| **P3-home · L3** | `index.html`, `lib/home/*`, `scripts/verify/home-*.mjs`, `scripts/verify/flash-audit.py` | Details below | P1-gen (sprites, home.js), P1-nav contract | ~1,700 |
| **P4 · integrate** | `fonts/derived/*`, `content/font-subsets.json`, `AGENTS.md`, `.agents/skills/fred-visual-design-guide/references/*.md`, `.github/workflows/deploy-pages.yml`, `scripts/verify/color-lint.mjs` | Items listed below the table | all | ~300 + generated |

**P0 items**
1. `site-tokens.css`:
   - Values: `--pencil #7A7063` (4.5:1 on paper), `--hl #DCCF98`, `--hl-ink #AD9650`, `--pen #D9695A` (cream default), board/wash/plank tokens (`--page`, `--slip`, `--plank`, `--lip`; reconcile `--board` #EEE4CE vs #EFE3CC and the wheat wash to the r2-05 values the corkboard ships with).
   - Per-paper `--pen`: cork #CB5E49, wheat #C85E47 (applied via `[data-paper]` in pen.css).
   - Font stacks with CJK fallback: disp = `"Fraunces","DingTalk JinBuTi"`; text = `"Fraunces","Noto Serif SC"`; util = `"IBM Plex Mono","Noto Sans SC"`; hand = `"Caveat","MuyaoPleased"`.
   - Easings `--ease-out/-pen/-settle`, timings `--t-micro/-move`.
   - Link it on every page and delete the duplicated `:root` blocks. Reading keeps its `html.dark` overrides.
2. Remove the gradient on `Building.dc.html:140–143` and its uses at `:223,226` (flat ink wordmark, board 05 W2).
3. Remove About's glare (`:25,53–54,171,174,322,375–376,392–393`) and shimmer (`:107–112,177,205`).
4. Writing: `#fff` at `:46,51,180` becomes a token.
5. `site-nav.css`: labels at 8.5px/.62 go to 10.5px (≥9.5px on phones) at opacity 1 in `--soft`; the identity tag and title number go to ≥10.5px.
6. `lang="en"` on Writing, Gallery and About, keeping `lang="zh"` spans; a visually hidden (sr-only) `h1` on About.
7. Figure labels: Writing fig.03 → fig.01, add fig.02 to Building, Gallery fig.02 → fig.03, About stays fig.04. (Home fig.00 is P3.)
8. Delete the `wRise/gRise/bRise/aRise` entrance animations.
9. Move the header out of `<x-dc>` into static markup with `id="site-nav"` and a real `<div class="site-rule">` on Building, Writing, Gallery and About; move the x-dc root's top padding onto the static header wrapper. The rule is only markup here; P1-nav switches the CSS. (Reading's header move is P2-reading; index is P3.)
10. Add the §1 head block on the five subpages, pointing at the empty stubs so every page's `<head>` is final after P0.

**P1-nav items**
- `.site-index::after` becomes `.site-rule` with the gap under the current tab.
- The pen tab replaces `aria-current`'s border and dot (`site-nav.css:47–48`).
- Labels move 12px up for underline air (r4-02).
- `pageswap` writes `fy-vt {from,to,kind}` to sessionStorage (works where the Navigation API is missing).
- `pagereveal`:
  - awaits `viewTransition.ready`;
  - reads the UA group keyframes (`document.getAnimations()` where `effect.pseudoElement` is `::view-transition-group(obj-*)`) to get old and new rects, so no rect handoff is needed;
  - replaces them with arc and spring samples from `Body.carry`/`throwTo`, integrated at 1/240s (MASS table, ripple 0/20/36/52 ms, apex = lerp(x, .62), lift ×0.45 on phones ×1.3 for the clicked object);
  - corrects the ink-box offset (`r2-01-desk.js:14,32`);
  - aligns the old/new opacity crossfade to `smooth(.48,.64)` of the scale progress;
  - draws the edge→rule sag as the live `rule-live` SVG (a snapshot can't sag).
- Props fall (g 7000, 3600 on phones; bird/mug/plant 20/50/70 ms) and the table folds (scaleY about the edge, 250 ms ease-in) via CSS keyframes on the old-only groups.
- Page→home: new-only table unfolds, objects throw down with restitution e from MASS, the laptop thuds the table.
- Tab→tab: `tabmark` moves on a `springEase` `linear()`, and hops are `steps()` keyframes chosen by from/to.
- Same-tab navigations (Writing↔Reading, Reading↔Reading) and 404 call `skipTransition()`.
- Reduced motion sets `@view-transition{navigation:none}`.
- The P3 home DOM must expose the named classes, with each element box equal to the art bbox from `FY_DESK`.

**P2-writing details**
- **JS files:**
  - `case.js`: kit (post mapping + helpers from `r2-04-kit.js`, without `SET18`, `pick`, `fix`, `?slow`), `r4-03-fill.js` `place` (rule a) and `r4-03-case.js`, without flat books, stacks or synthetic marks.
  - `reflow.js`: `r4-03-reflow.js` without the flat-book branch.
  - `pull.js`: `r4-03-pull.js` plus `r2-04-cover.js` band mode and `r4-03-bird.js` (split `bird.js` out if the file passes 450).
  - `index.js`: `r2-03-filter.js` list mode plus `r3-03-readout.js`, `r3-03-tabs.js`, `r3-03-tally.js`.
  - `ledger.js`: `r3-03-ledger.js` without `glide`.
  - `app.js`: `r4-03-app.js` minus lines 10–13, 28, 39, 67–68, 103, 117 and 135–182.
- **CSS:** `writing.css` from `r2-04-book.css:1–50`, `r3-03-case.css`, `r3-03-index.css`, `r4-03-index.css`, `r4-03-case.css:6,18–19,26,29–30`, `r4-03-board.css:20,36–52`; the `#FFFDF8` literal becomes a token.
- **Dropped:** `r4-03-data.js` (synthetic 拟 essays) and `r2-04-read.js` (in-page imitation of Reading).
- **Page changes:**
  - Removed: chips, preview panel, card deck, EN toggle, `fy-lang` write, `birdLoop`.
  - The header year range (and meta description) is derived from data instead of the stale "2015–2025".
  - A click plays the open, then goes to `Reading.dc.html?post=<id>`. `pageshow.persisted` resets the book.
  - No ancestor of the sticky index may use `overflow:hidden` (use `overflow:clip`).

**P2-building details**
- **JS files:**
  - `board.js`: `r2-05-cards.js` build/geometry (fix the `siteHref` `../../` prefix) plus `r4-05-board.js` `board()`.
  - `physics.js`: `r2-05-physics.js` without the `mock:rm` listener.
  - `unpin.js`: `r4-05-unpin.js` without the local host or `probe`.
  - `flower.js`: `r3-05-icons.js` flower/`shadowOf`/`svg` only (F2/F3/F4 and `rounded()` dropped), plus `r4-05-sticker.js` and `r4-05-cues.js` (with `COOL=1400`, without the log).
- **CSS:** `building.css` from `r2-05-cards.css`, `r2-05-board.css:2,27–37,40–71`, `r3-05-board.css:5–8`, `r4-05-board.css:5,8–12`.
- **Pen:** `r4-05-pen.js` is replaced by shared TierMark/FocusMark with `data-paper=cork|wheat` (baseline-hung, 2.2 px, per-paper coral).
- **Preserved:** header, `data-project-count` ("on the board · N 件"), intro 在造, noscript list, forced-colors block, all links and repos from `building-projects.js`, CTA navigation.
- **Changed:** the Tsugi pin goes to ink; label dot to ink; meta slash and CTA underline to pencil. No arrow on this page.

**P2-gallery details**
- **JS files:**
  - `rope.js`: `r2-06-line.js` without `fix`.
  - `viewer.js`: `r2-06-viewer.js` without phone-frame bounds and clip rounding.
  - `develop.js`: `r2-06-develop.js` without `reset`, plus `r2-06-flick.js`.
  - `lines.js`: `r2-06-desk.js` and `r2-06-phone.js` merged, without the slow toggle, `MAX=6`, demo, readouts or the `.m-screen` branch.
- **CSS:** `gallery.css` from `r2-06-gallery.css:44–121`.
- **Kept:** the category/year chips, now as tiers, with `restring(filtered)` re-pegging prints onto the same ropes; captions (`loc` in the hand font, then `YYYY·MM · Cat`); counts.
- **Removed:** racks, garland, lightbox, Load more, bird bob, tremble.
- **Session key:** one key `fy-gallery-dev` (JSON array of developed ids) replaces the board's two.

**P2-about details**
- **JS files:**
  - `rig.js`: `r7-07-about-rig.js` without `.mock-top` (use the real header offset), `setHint`/`.hs-hint`, `rearm/reset` or the `R7A` global.
  - `hands.js`: `r7-07-about-hands.js:1–97`.
  - `card.js`: `r4-07-about-kit.js` faces, radar and social row. Its Spring/Loop become Motion, its marks become the shared pen-tier, and `Band` is dropped.
  - `sleeve.js`: `r6-07-about-sleeve.js`.
- **CSS:** `about.css` from `r3-07-about-card.css` plus `r7-07-about.css:19–121,125–147`.
- **Cue:** uses `Pen.glyph` with `pointOnce('about')`; retired for the session by the first pull.
- **Session keys:** `fy-about-pulled`, `fy-about-flipped`, `fy-about-putback` (hold-note retirement).
- **Removed:** `birdFly/cardBump`, the drop-shadow filter, inset highlights, the coral glow, the coral special block, and the old DCLogic.
- **Preserved:** header, "field guide · vol. 01", kicker, all copy, images and alt text, radar `role=img` title/desc, fig.04, statement, the five contacts and the QR `aria-expanded`/`aria-controls`.
- Asset paths rewritten from `../../assets/` to `./assets/`.

**P2-reading details**
- **JS files:**
  - `bus.js`: the `RP` bus from `r3-08a-render.js:76–123` (clamped y; the `template()` becomes DC markup).
  - `hero.js`: `r3-08a-hero.js`.
  - `rail.js`: `r2-08a-rail.js`, reading `landmarksZh/En` (no JS splitting).
  - `notes.js`: `r2-08b-notes.js` prepare/row/phrase/hover/first/seen (drop `lineEnd/fields/parse`), plus the multi-citation fix (walk back over `.mn` siblings to the `sup`).
  - `pen-note.js`: `r3-08b-note.js`.
  - `slip.js`: `r3-08b-slip.js`.
- **CSS:** `reading.css` (from `r2-08a-page/hero/rail.css`) and `notes.css` (from `r2-08b-base.css:67–79`, `r2-08b-slip.css`, `r2-08b-a.css`, `r3-08b-note.css` minus `.fs-card`/`.ta-thread`), with hover/focus switched to coral. `.rd-stage.is-en` becomes `html.lang-en`.
- **Page changes:**
  - A static header, and a fixed nav plus spacer replace the transparent sticky `.rnav`.
  - Delete the scroll `setState` (`:214–219`). Language and theme toggles become `<html>` class flips with no re-render.
  - In dark mode the hero uses the papered/no-halftone path.
  - Keep previous + next links (the board had only previous).
  - The nav keeps the VT names (`obj-*`, `identity`, `site-rule`).

**P3-home details**
- **`index.html`** becomes static:
  - no `x-dc` or `support.js`;
  - sr-only `h1`, `lang="en"` with `lang="zh"` spans, fig.00;
  - no fyRise and no `fy-lang` (bilingual labels together);
  - desk as layers from `assets/derived/desk/*` positioned with `FY_DESK`;
  - hotspots stay semantic anchors with `href`, `aria-label` and inline % geometry (AGENTS rule);
  - inline `<style>` moves to `lib/home/home.css`.
- **JS files:**
  - `desk.js`: the old DCLogic behaviours (typing on hover, frame expressions, book flip, camera flash, bird hop, steam).
  - `opener.js`: `r3-10-load.js` plus `r3-10-seq.js`, without `:31–39,179–193,202–215`. `OPX` exists only when `?opx=1`. Key `fy-opener`; ep.NN comes from `FY_HOME.essays`. The head decision script (first vs returning) runs before first paint.
  - `opener-op.js`: `r2-10-op-art.js` (drop `birdMark`), `r3-10-name.js`, `r2-10-op-shots.js`.
  - `fall-stage.js`: `r2-10-gag-phys.js` (drop rope) plus `r2-10-gag-stage.js` (drop loading line/halves/label), with `premask` replaced by pre-cut sprites.
  - `fall.js`: `r2-10-gag-fx.js` (drop `ping`) plus `r3-10-fall.js`, rewired from `HomeDesk` to `desk.js`.
  - `mobile.js`: `09-home-mobile.js` (without `replayD`/`goShot`/parent sync). It wraps the same desk DOM at ≤760px, and the opener lands in shot-0 framing.
- **CSS:** `opener.css` (`r2-10-op.css`, `r2-10-cd.css` minus `.ctl/.op-lbl/.op-svg .ln`, `r3-10-page.css`), `home.css`, `mobile.css`.
- **Data:** loads `content/home.js` and `content/building-projects.js` (3.7 KB).
- **Reduced motion:** paint the static desk at once (the board's `showStatic` waited for every asset).

**P4 items**
1. `uv run scripts/generate-fonts.py`, then run the content audit.
2. Update AGENTS.md:
   - `lib/` layout and shared modules, and that no runtime code goes in `scripts/`.
   - The header must stay static outside `<x-dc>` (VT); VT name contract.
   - Generated outputs `content/home.js`, `content/posts-index.js`, `assets/derived/`; regenerate order gains `uv run scripts/generate-sprites.py` (only when desk art changes).
   - The font scan includes `lib/`.
   - sessionStorage keys; coral rule and pen states; light-only wording.
   - Home destinations: annotation, hotspot, 09 D overview door, panel link and VT name stay in sync.
   - Replace the obsolete `.project-card`/`.card-slot` pin-pivot bullet with the new corkboard's invariant (P2-building reports it).
   - No `?v=` on stylesheets.
3. Update the design guide (coral budget, pen states, light-only wording).
4. Run the colour lint on `lib/` and the shared modules (no hex literals outside `site-tokens.css`, documented exceptions only).
5. Run the full §5 matrix and a code review.
6. Commit in order: L0 → L1 → L2 → L3 → generated files.

### Success criteria per package (headless-verifiable)

**P0**
- With unpkg.com blocked, every subpage still renders identity, nav and rule at first paint, on a paper background.
- The header region differs ≤1% from before at 1440 and 390.
- Every stub returns 200.
- Nav labels are ≥10px with contrast ≥4.5:1, and no label overflows (`scrollWidth≤clientWidth`).
- No `fyRise`-family animations remain on subpages.

**P1-pen**
- On `scripts/verify/pen-harness.html`:
  - Hover draws a coral 2.2px line in `var(--pen)`; choose leaves a wheat band with no coral stroke at rest; un-choosing under the pointer warms the line back.
  - `:focus-visible` shows coral 「 」.
  - `data-paper=cork|wheat` resolves `--pen` to #CB5E49 / #C85E47.
- On a host rotated 3°, the underline's local y = baseline + max(3, .18em) ± .5px.
- `pen-spacing.mjs` reports 0 violations (whatever follows an underline is ≥10px below it and ≥2× its drop).
- The same text gives an identical path `d`.
- Toggling emulated reduced motion finishes in-flight tweens.
- `Loop` runs 0 rAF callbacks over 2s when idle.
- `CSS.supports('animation-timing-function', springEase(...))` is true.
- No globals beyond `Motion`, `Pen`, `TierMark`, `FocusMark`, `Tier`.

**P1-nav (Chromium)**
- Home→Writing via the book:
  - four `::view-transition-group(obj-*)` exist with ≥10 custom keyframes;
  - the book's mid-flight y is above the chord;
  - it settles ≤1.0s, with the header readable by 0.75s.
- Page→home ends lower than it starts (gravity) and settles ≤1.1s.
- Writing→Gallery moves `tabmark` and hops the obj groups.
- Under reduced motion there is no `viewTransition` in `pagereveal`.
- Same-tab navigation and 404 get no transition.
- Direct load and reload: no transition; `fy-vt` is cleared.
- WebKit (the Playwright build): no console errors either way.
- No `.site-index::after` remains in the CSS; the rule gap under the current tab matches today's geometry ±1px.
- The current tab shows the pen tab, not the CSS border and dot.

**P1-gen**: see §3.

**P2-writing**
- `posts-index.js` loads, never `posts.js`.
- Planks: 2 at 1440, 3 at 1024; a single strip at 390.
- Real pointer paths on 4 books: after hover, `elementFromPoint(pointer)` is the held book, and the click reaches `Reading.dc.html?post=<that id>`. The phone's tap-tap does the same.
- A filter reflows the books, and `aria-live` reads "N / 27". A ledger drag selects a span; Esc clears.
- The shelf is one tab stop with arrow and Enter access; tabs are a radiogroup; the ledger is a multiselect listbox.
- A chosen tab shows wheat with no coral at rest.
- bfcache Back leaves no book held.
- Reduced motion: a filter change leaves no running animations after 50ms.

**P2-building**
- F1 flower on the lead card; the lead pin's fill resolves to `--ink`.
- The press fires on each of these causes: first view (once, `fy-flower-<id>`), mouse entry, focus-visible from outside, return into view, re-pin. Any two presses are ≥1.4s apart.
- The press keyframes carry per-keyframe `steps(1,end)`, and three samples show ≥2 distinct frames.
- There is no arrow element.
- A 6px horizontal touch drags the board; a vertical touch scrolls the page.
- A tap unpins; Esc re-pins and returns focus; the dialog traps Tab.
- 0 rAF callbacks when idle.
- `data-project-count` shows the project count.

**P2-gallery**
- Each print develops once per session (`fy-gallery-dev`), and a reload shows none undeveloped.
- 0 rAF callbacks at idle; the rope moves only with a cause.
- The viewer is `role=dialog aria-modal` and contains the peg. ←/→ changes photo; Esc returns focus to the print; the viewer shows the `-2560` file.
- The sentinel adds lines until all 107 photos are reachable, with no Load more.
- At 390 each line is `scroll-snap-type:x mandatory` and vertical scroll still works.
- A chip restrings to the filtered count; the chosen chip is wheat.
- Develop brightness keyframes are monotonic (flash-safe).

**P2-about**
- Drag or Enter/Space/→ on the grip pulls the card.
- During a 260px drag and after release, the card's untransformed centre moves 0.0px, and the flip completes where it is.
- Release: pointer in the sleeve zone puts the card back, anywhere else flips it; a tap flips; `pointercancel` does nothing.
- Esc puts back, and the put-back control is visible only on focus.
- The cue is coral on first view. After the first pull `fy-point-about` is spent, a reload shows no cue, and a new context shows it again.
- At 390/360 the sleeve steps to the left strip, and a vertical swipe scrolls.
- Reduced motion: the card is presented out of the sleeve; no drag turn; flip instant.
- No infinite animations.

**P2-reading**
- **Halftone:** in a fresh context, after fonts, the image and 2 rAF, depth is 0 and every canvas pixel with alpha>0 is paper ±6, at 1440 and 390. Scrolling 1px gives depth >0; back at 0 is clean. Under reduced motion there are never dots.
- **Nav:** `.landed` is set at y≥sL, and the nav is opaque at every scroll position (sample the pixel behind it).
- **Rail:** every landmark is present; End reaches the last landmark and the end tick; overscroll does not un-draw it.
- **Citations:** `.mn` computes to the serif face, unrotated.
- **Footnotes:** a ref gesture and its slip stroke in coral; the multi-citation post has 0 errors and opens both notes.
- **Phone:** `.mn` hidden ≤1080px with the slot slip on tap; the rail becomes a strip when the article's left edge is under 180px.
- **Toggles:** switching language or theme removes no hero nodes (checked with a MutationObserver). Dark mode has no halftone and no errors.

**P3-home**
- **Network:** no `posts.js`, `photos.js`, `support.js` or unpkg; images come only from `assets/derived`; image bytes ≤1.2 MB at 1440 (about 3.9 MB today).
- **Opener:**
  - First visit: OP (弗/雷/德/FRED) → fall → card text `日常 · ep.<FY_HOME.essays>` → desk, done in ≤3.4s warm; `fy-opener=1`.
  - Reload in the same session: no OP frame; fall only, ≤0.8s.
  - Slow 4G: 「tap to skip · 点按跳过」 appears at 1.5s; the opener is gone by 6.5s; any key or tap fades it in 250ms.
  - Reduced motion: no opener, and the plate is visible at DOMContentLoaded.
  - Flash audit ≤2.5/s at 1440 and ≤2.0/s at 390.
- **Navigation:**
  - Desktop: hovering and clicking the laptop, book, portrait and camera (hotspot and label) reach Building, Writing, About and Gallery.
  - 390: the overview doors, panel links, swipe and arrow keys give the same mapping.
- **Desk at rest:** differs ≤0.5% from today's desk at 1440 with animations paused.

## 3. Prerequisites (P1-gen unless noted)

**Home manifest**
- `generate-content.py` writes `content/home.js`:

  ```
  window.FY_HOME={essays, photos, post:{id,date,title,titleZh}, photo:{id,loc,date}}
  ```

- It also writes `content/posts-index.js` (`FY_POST_INDEX`: posts without `htmlEn/htmlZh/source`, ≤60 KB) for Writing.
- The latest project comes from `building-projects.js`, which home loads directly (it is hand-authored, 3.7 KB).
- `audit_manifests` in `audit_content.py` gains both new files.
- Loaded unversioned (`./content/home.js`), per AGENTS.md.

**Heading split at build time: needed**
- Port `r2-08a-landmarks.js` `build(html, readingMin, pre)` to `scripts/landmarks.py` as a post-pass over the rendered `htmlZh/htmlEn`.
- It emits `<h2 class="lm lm-sec|lm-head" id="zh-lmN">` with `.lm-no/.lm-t`, and `<span class="lm-anchor">` for minute ticks.
- It adds `landmarksZh/En: [{id,kind,label,title,peek,minute}]` to posts.
- **Parity check:** the output is identical to the board JS run in node over the pre-change `posts.js`, for all 54 bodies.
- **08b:** `.mn` carries the full reference text instead of the 132-character excerpt (`generate-content.py:262–265`).
- **Size:** move `inline_markdown`/`markdown_to_html` (about lines 154–520) into `scripts/content_markdown.py` so the generator drops below 500 lines.
- **Import risk:** add `sys.path.insert(0, str(Path(__file__).parent))` before the sibling imports. Otherwise the audit's importlib load (`audit_content.py:32`) breaks.

**Font subsets**
- **Scan list** (edited by P1-gen, regenerated by P4): `PAGES` gains a glob over `lib/**/*.{js,css}`, `pen*.js`, `site*.{js,css}` and `transitions.*`, and the `fred-agent.css` path is fixed. Whole-file text reaches every face.
- **New glyphs, by face:**

| Face | New glyphs and their source |
|---|---|
| Noto Sans SC-ui | 点按跳 (opener), 钉 (钉回去), 抽请勿折叠代码履历 (About), 夹点根绳儿拉往 (Gallery), 标本节句收起 (Reading peeks and slip), 桌镜 (09), 所 (Writing) |
| Muyao | 书脊段杯 (Writing), 卡拖抽 (About), Gallery's hand notes (往下走，再拉一根绳 / 到这儿再拉一根绳 / 全部晾好了) |
| JinBuTi | 标本 (标本卡), plus the ~55 essay-heading characters, which arrive automatically through `element_text(h2)` once the split emits `<h2>` |
| Noto Serif SC-ui | 桌四样东西是门点或绕圈镜 (09 intro) |

- **FACES edits:**
  - Sans-ui adds `html_elements:["h2"]` for rail labels (17 missing characters: 序后三四五七八九十广州惯圳东莞留白).
  - Muyao drops `html_classes:["mn"]`, since citations are now serif. Also check whether excerpts still render in a hand face anywhere; if not, drop them from Muyao and expect it to shrink.
- The skill audit (`audit_content.py`) reuses the generator's `charset_for`, so it covers `lib/` automatically once `PAGES` grows.

**Desk sprites: `uv run scripts/generate-sprites.py`**
- A PEP 723 script (pillow, numpy, scipy) consolidating `tools/10d-cut.py`, `tools/r2-01-cut.py` and `tools/10c-cut.py`.
- **Inputs:** the masters `assets/desk-scene2-light.png`, `frame-exp3-light.png`, `book-flip2-light.png`, `bird-strip6-light.png`, `bird-strip-light.png`, `camera-light.png`.
- **Outputs to `assets/derived/`:**
  - An exact alpha partition of the desk as lossless WebP (10d's method: seed-picked components, back edge cut and restored): `plate`, `edge` (front-edge rows about 909–915), `laptop`, `camera`, `mug`, `plant`, `leaf`, and contact-dot layers per object (check `r3-10-fall.js` `land()` for whether the fall needs them individually).
  - A pre-masked frame strip, with `frame-rest` merged into the plate.
  - Strip derivatives at cell widths {master, ½, ¼}, which fixes the aliasing in HANDOFF §4.
  - OP heroes (`op-me/laptop/camera/book.webp`).
  - `desk-geo.js` (`window.FY_DESK`: W/H, per-object box/ink/foot, edge points, leaf pivot), replacing the hard-coded `r2-10-gag-stage.js:8–19` and `r2-01-desk.js:12–27`.
- **Checks:**
  - Recomposition equals the master exactly, or the script fails.
  - Two runs are byte-identical.
  - Outputs are committed, because the deploy deletes `scripts/`.
  - The 01 and 10 box drift (up to 19px) resolves to 10d's partition.
  - Stale output paths in the tools (`working/redesign/assets-gen`, `/tmp/fy10d`) are not carried over.

## 4. Risks and open questions (default proposed for each)

1. **First visit vs gravity return.** Visitors who arrive on home by an internal navigation (a VT, or a same-origin referrer) get the transition, not the opener, and `fy-opener` is set. *Ask Fred:* whoever lands deep will never see the OP.
2. **Dropping `support.js` on index.** Default is yes. If Fred edits home in the DC tool, this breaks that.
3. **Reading dark mode.** The halftone is light-only; dark mode uses the papered no-halftone path. Needs a Fred call.
4. **Coral rule at port.** The rail's current-landmark loop goes from coral to wheat, and 08b hover/focus goes to coral. The 08b arrowhead is not unified with the pen glyph (the accepted visual stays).
5. **Language and storage.**
   - Writing's EN toggle and its `fy-lang` write are removed (AGENTS: gateways show both languages together).
   - Reading keeps `fy-lang`/`fy-theme`, which AGENTS sanctions.
   - Session keys: `fy-opener`, `fy-vt`, `fy-point-*`, `fy-flower-*`, `fy-gallery-dev`, `fy-about-*`.
6. **Writing.** "Before 2020" becomes the full ledger (2020 empty). There's no shared-element VT into Reading. The decade jump is deferred.
7. **Gallery.** Keep the chips and restring on change; breakpoint 760px (board) instead of 860; `Math.random` shuffle; date shown as YYYY·MM; the 6-line cap is dropped.
8. **Building.** Tapping the card body unpins and the CTA navigates (board behaviour). The native scrollbar is lost; keyboard and drag replace it.
9. **Opener on phone.** Lands in 09 D shot-0 framing. The 0.4s eyecatch card is kept.
10. **Motion feel parity.** Ports keep each board's integrator numerics. Only duplicate Loop/Spring/reduced copies with identical schemes switch to Motion; don't retune the cork, rope or reflow integrators.
11. **Test hooks.** No globals; state is exposed through `data-*` attributes on hosts. The only exception is `OPX` behind `?opx=1`, for the flash audit.
12. **Cross-document limits.** Clicking mid-transition skips the running one to its end; Back plays the gravity return; there's no programmatic focus after navigation. VT aborts after 4s and falls back to a hard cut. Firefox and other engines without cross-document VT keep today's hard cut.
13. **Not yet tested:** real phones, real Safari, Firefox. Fred should run a device check before merge.
14. **PR size.** About 12k lines touched. One PR as decided, with one commit per package in layer order so review can follow L0→L3.
15. **`design/`.** Keep it out of this PR (HANDOFF §10), but keep the workflow's `design` strip as a safeguard. Production must request nothing from `/design/`.
16. **Browser baseline.** `linear()` easing and `preserve-3d` need Chrome 113, Safari 17.2, Firefox 112. Default: no fallback work.
17. **Point solver.** Not ported (no consumer). If a future view needs a solved arrow, port `r3-02-arrow.js` `solve/collect` and `PointMark` then.

## 5. Verification plan

**Runner and harness**
- Use HANDOFF §9's `/tmp/fyshot/run.mjs`, with steps in `scripts/verify/*.mjs` (committed, never deployed). The server is on :4173.
- **Pages:** index, Writing, Building, Gallery, About, and Reading with one cover post plus the multi-citation post.
- **Viewports:** 1440×900 and 390×844 (About and home also at 360).

**Every page, both widths**
- 0 console errors, and every request returns 200.
- No overflow: `scrollWidth ≤ innerWidth`.
- No requests to `/design/`, `posts.js` requested only on Reading, and no font masters.
- Keyboard: each interactive element reaches a coral 「 」 on focus-visible.
- Reduced motion: no infinite or running animations 100ms after settle, and no VT.
- Touch (CDP): the swipe and tap flows listed in each package's criteria.
- `pen-spacing.mjs` reports 0 violations, including the nav.
- No coral stroke at rest outside identity and the About cue.
- Idle: 0 rAF callbacks.

**Home navigation** (AGENTS step 4)
- Desktop hotspot and label for each of the four objects to its URL.
- Phone: the overview doors and panel links.

**Weight and LCP**
- Gateway pages load only `-ui` tiers; Reading alone loads `NotoSerifSC-text`.
- Budgets after regeneration:

| Face | Now | Budget |
|---|---|---|
| JinBuTi | 53.5 KB | ≤70 KB |
| Sans-ui | 111 KB | ≤140 KB |
| Serif-ui | 151 KB | ≤175 KB |
| Muyao | 223 KB | ≤223 KB (should shrink) |
| Serif-text | 1,132 KB | ±5% of today |

- Home image bytes ≤1.2 MB.
- Gallery's LCP stays the `h1` and doesn't regress against main in a Lighthouse run.

**Named invariants**
- No halftone at scroll 0 (Reading).
- The card's place stays fixed through a flip (About).
- The cue arrow appears once per session (About).
- Flower cooldown and held frames (Building).
- Pulled book under the pointer, and a click opens it (Writing).
- Develop once per session (Gallery).
- Opener timing, flash audit and reduced-motion static desk (home).
- VT arc and gravity return, no VT under reduced motion.
- Desk recomposition is exact.
- The header survives with unpkg blocked.

**Also:** WebKit smoke pass on all pages; the content audit (`audit_content.py`); a code-review pass.

## 6. Size estimate (500-line check)

| File | Now → after |
|---|---|
| `Building.dc.html` | **600** → ~230 (CSS and renderers move to `lib/building/`: board 200, physics 280, unpin 245, flower 220, css 190) |
| `Writing.dc.html` | **530** → ~160 (`lib/writing/`: case 305, reflow 180, pull 370, index 320, ledger 180, app 110, css 275) |
| `Gallery.dc.html` | 294 → ~200 (rope 300, viewer 285, develop 125, lines 200, css 110) |
| `About.dc.html` | 416 → ~170 (rig ~390, the one to watch: split layout/render at >450; card 170, sleeve 120, hands 90, css 190) |
| `Reading.dc.html` | 326 → ~300 (bus 80, hero 245, rail 190, notes 130, pen-note 165, slip 105, css 230 + 85) |
| `index.html` | 439 → ~200 (desk 200, opener 210, opener-op 230, fall-stage 175, fall 310, mobile 120, css 190 + 120 + 70) |
| Shared | motion 220, pen 260, pen-tier 280, site 90, transitions 300, transitions.css 120, tokens 80, site-nav.css 109 → ~130 |
| `scripts/generate-content.py` | **615** → ~420 (+ content_markdown ~360, landmarks ~190); generate-sprites ~330; generate-fonts 384 → ~400 |

Every file lands under 500. The ones to watch are About `rig.js`, Writing `pull.js` (split out `bird.js` if it passes 450) and `transitions.js`. The three files already over the limit (Building, Writing, generate-content) each get split by responsibility in the package that owns them.
