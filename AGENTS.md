# AGENTS.md

## Repository overview

This is a dependency-free static personal website exported as standalone `.dc.html` pages. There is no package manager, build step, or framework source in this repository.

- Entry page: `index.html` (static markup; no `<x-dc>` and no `support.js`)
- Shared code: `lib/shared/`
  - Browser runtime: `support.js` (renders each templated `.dc.html` page's `<x-dc>` template)
  - Tokens and first-paint base: `site-tokens.css` (the one `:root`, the shared `@font-face` rules, the `.site-top` header frame)
  - Header and object-tab nav: `site-nav.css` (the `building/` sub-sites load it too)
  - Motion and pen modules: `motion.js` (`window.Motion`: the two clocks, springs, sleeping loops, reduced motion), `pen.js` (`window.Pen`: seeded hand strokes and the point arrow), `pen-tier.js` (`TierMark`, `FocusMark`, `Tier.wire`: the pen's states), `pen.css`
  - Page glue: `site.js` (`FY.mount`, `FY.styled`, the nav's pen marks)
  - Cross-document view transitions: `transitions.js` (home ↔ page, and the shared plumbing), `transitions-tab.js` (page → page: tab to tab, and the Building board ↔ a project's pages and its chapters), `transitions.css`
- Page code: `lib/<page>/` (`home`, `writing`, `building`, `gallery`, `about`, `reading`, and `fred-agent` and `njjoe` for Building's two sub-sites), each with its own `<page>.css`
- Local fonts: `fonts/`
- Illustrations and decorative images: `assets/`
- Imported essays and gallery metadata: `content/`
- Imported photography, covers, and profile images: `images/`
- Dependency-free content manifest generator: `scripts/generate-content.py` (with `scripts/content_markdown.py` and `scripts/landmarks.py`)
- Web-sized image generator: `scripts/generate-derivatives.py`
- Desk sprite generator: `scripts/generate-sprites.py`
- Font subset generator: `scripts/generate-fonts.py`
- Headless checks: `scripts/verify/`
- Design lineage (never served): `design/`
- Full-resolution originals (archive, never served): `images/gallery/`, `images/blog/covers/`, `images/evidence/<project>/` (the Building sub-sites' captures, plates and email images)
- Complete font masters (archive, never served): `fonts/*.woff2`
- Generated assets that pages actually load: `images/derived/`, `fonts/derived/`, `assets/derived/`

Serve the repository over HTTP; do not rely on `file://` URLs:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`.

## Page map

The home illustration and its navigation labels share these destinations:

- Laptop / “building” → `Building.dc.html`
- Book / “writing” → `Writing.dc.html`
- Portrait / “about” → `About.dc.html`
- Camera / “shooting” → `Gallery.dc.html`
- `Reading.dc.html` is a standalone reading-page design and is not linked from the home page.

When changing a home destination, keep all of these in sync in `index.html`: the desktop annotation (`.navnote`), the object hotspot (`.hot-*`), the phone overview door (`.ov-hot`), and the phone shot panel's links (`.win`, `.lbl`). Also update `transitions.js`'s `OBJ` map, which pairs each page with the desk object that flies into its nav tab.

## Page architecture

- Every templated `.dc.html` page (all but `Building.dc.html`) has three layers:
  - a static header before `<x-dc>`: `<div class="site-top"><header class="site-shell-header" id="site-nav">`;
  - the `<x-dc>` template, which holds only static template text;
  - interactive surfaces from `lib/<page>/*.js`, which mount into an empty template host through `FY.mount('[data-mount=<name>]', fn)`.
- The header must stay static, outside `<x-dc>`. support.js hides `<x-dc>` and renders it only after React arrives from unpkg, but a view transition snapshots the new page at `pagereveal`, before first paint. `<link rel="expect" href="#site-nav" blocking="render">` holds first paint until the header is parsed.
  - Keep the header's class names.
  - `.site-rule` and `.site-tabmark` stay the last two children of `.site-index`.
  - Put no inline styles, animation classes or `view-transition-name` on header parts.
- Head order on every templated `.dc.html` page (the shared files are in `lib/shared/`):
  1. `support.js`, first, so React's fetch from unpkg starts before the stylesheets claim the connections (the page's largest paint waits for React). Don't preload React: arriving before parsing ends makes support.js wait for DOMContentLoaded.
  2. `site-tokens.css`, `site-nav.css`, `pen.css`, the view-transition opt-in, `transitions.css`, `lib/<page>/<page>.css`. The opt-in (`@view-transition{navigation:auto}`, `none` under reduced motion) is an inline `<style>` on every page that has transitions, never in a stylesheet: Chrome decides whether the page you land on takes the move from the opt-in it read when `<body>` went in, unless something restyles the page before its first frame, and a linked sheet is never in by then. From `transitions.css` the moves ran only because `site.js` happened to measure the nav first; a render-blocking file a little late, and Chrome cut the move and reported its skipped transition as an uncaught error (`vt-project-load.mjs`). Chrome still cuts a move whose page holds its first frame more than 4 s after its HTML arrives, and reports that as an uncaught "Transition was skipped" before any script of ours has run: leave it, and add no `unhandledrejection` filter, which would also hide our own unhandled skips.
  3. the `expect` link
  4. `motion.js`, `transitions-tab.js` and `transitions.js` as `defer blocking="render"`: they don't block the parser, but first render waits for them, so `pagereveal` is still heard
  5. deferred: `pen.js`, `pen-tier.js`, `site.js`, `content/*`, then the page's modules
- Page CSS lives in the head, never in `<helmet>`, so it applies at first paint.
- `index.html` differs:
  - it has no `support.js`, because nothing on it is templated;
  - its `expect` target is `#desk`;
  - a small inline script before `motion.js` decides whether the opener plays;
  - the desk, the opener stage and the phone shots are static markup driven by `lib/home/`.
- `Building.dc.html` works like `index.html`: nothing on it is templated, so it has no `support.js`, `<x-dc>` or `<helmet>`.
  - The intro, the board host (`.board-host`), the `<noscript>` list and `fig.02` are static markup after the static header.
  - Its head keeps the order above without `support.js`, and its `expect` target stays `#site-nav`. Its CSS is `lib/building/card.css` (the card), `dossier.css` (the kraft dossier behind it) and `building.css` (the page and the board), in that order.
  - One change to the order: `content/building-projects.js` and `board.js` come before `pen.js`, `pen-tier.js` and `site.js`. A module runs only after every deferred script before it, and first render waits for `board.js`, so this keeps first render from waiting on the pen's downloads, which nothing needs until the board is wired.
  - `lib/building/board.js` loads as `type="module" blocking="render"` and builds the board as it evaluates, so every card exists at first render and at `pagereveal`, where a view transition captures the page.
  - Building the markup measures nothing. What measures (the physics, unpin, the flower, the pen) waits for `FY.styled`, because WebKit runs deferred scripts and modules before the head's stylesheets apply. `board.js` asks for it at `DOMContentLoaded`, once `site.js` has run.
  - The board's side of the moves to and from a project's pages is `board.js`'s. At `pageswap` it names the tabs in play (`.fy-vt-tabs`): the dossier's in your hand, with the card and the dossier's sheet above them (`.fy-vt-card`, `.fy-vt-sheet`), or, from a card's own link, the tabs peeking behind it, with the card, pin and all. At `pagereveal`, where every engine has applied the sheets, it brings the card of the project you came from into view (from `navigation.activation.from`, else a fresh load's `document.referrer`; no storage), and the physics starts from there. While the way back plays (`html[data-vt=out]`) the card and its peek are named and its pin is out, pushed in once the move has landed (the lead card's flower pressed with it, as on a re-pin); without a view transition the card is simply pinned. A board back from the back/forward cache with its dossier out pins that card back at once first.
- The Building sub-sites' chapters (Fred Agent's five, `building/fred-agent/*.html`, and NJJoe's three, `building/njjoe/*.html`) are static pages too, each one open dossier (design/2026-09-building, candidate C). NJJoe's email demo (`building/njjoe/email-demo/buyer.html`) is not a chapter: it is the email itself, with its own inline styles, shown in the APA chapter's frame.
  - The header is a gateway page's static header, copied with its paths made relative (`../../`). No `<base>`: every `href` and `src` is a plain relative path, and a fragment is a plain `#id`.
  - The head keeps the order above without `support.js`. The CSS is `site-tokens.css`, `site-nav.css`, `pen.css`, `transitions.css`, `lib/building/dossier.css`, `lib/reading/rail.css` where the chapter carries the rail, the sub-site's own `lib/fred-agent/fred-agent.css` (and `lib/fred-agent/demos.css` on Demos) or `lib/njjoe/njjoe.css`. Then the preloads (`Fraunces-latin`, IBM Plex Mono `Regular-latin` and `Medium-latin`; on Demos, from 1001 px, the recording's poster, the first screen's largest paint there; not DingTalk JinBuTi, which nothing on a chapter sets since the seal), the `expect` link on `#site-nav`, the three render-blocking scripts, and deferred `pen.js`, `pen-tier.js`, `site.js`, `content/building-projects.js` and the modules: `lib/building/project.js` on every chapter, then the chapter's own (Fred Agent's `map.js`, `project-rail.js`, `evidence.js`, which imports `corners.js`; NJJoe has none).
  - Nothing measures before `FY.styled`. The board's card is clipped to the sheet after first paint (`lib/building/cover.js`), into a box `dossier.css` holds for it, so it never moves the page. The card brings its stylesheet: `cover.js` inserts `lib/building/card.css` as it evaluates (script-inserted, so never render-blocking) and builds the card once it applies. Nothing else on a chapter needs it, so it stays out of the head, and first render waits for one stylesheet fewer (on python's six-connection server, a round trip: about 80 ms of LCP).
  - A chapter change is a cross-document move (`FYProject` in `transitions-tab.js`): the tabs settle on a spring, and the sheet in front is pulled aside to a later chapter or put back from the left for an earlier one. From the board, the tabs you touched travel to the fore-edge; back to it, the page's tabs tuck behind the card.
- support.js takes the page template from the first literal `<x-dc>` in the raw page text. Never write that string anywhere before the real element: not in a head comment, a script or the static header.
- Keep mount hosts out of any `sc-if` that can flip. A re-render replaces the host, and the module mounts again from scratch.
- `transitions.css` assigns every view-transition name. Set `view-transition-name` nowhere else, and render one element per name per document:
  - `identity` → `.site-identity`
  - `site-head` → `.site-shell-header`, the header strip, so its labels, status line and home link travel with the named parts in it
  - `obj-laptop|book|frame|camera` → `.site-nav-*` in the nav, `.desk-*` on home
  - `site-rule` and `tabmark`
  - home's old/new-only groups: `desk-table` (`.desk-plate`), `desk-edge`, `desk-mug`, `desk-plant`, `desk-bird`, `desk-notes`
  - `rule-live`, the transient line transitions.js draws
  - `tab-edge`, `tab-caret`, `tab-flash`, `tab-kacha`: the marks a page answers a tab move with (`.fy-tab-*`, added by transitions-tab.js for that one move and removed when it ends)
  - `pj-tab-1` … `pj-tab-5`: the index tabs in play between the board and a project's pages, or between its chapters (`.fy-vt-tabs`: a project page's fore-edge, the dossier's tabs or one card's peek on the board); `pj-card` and `pj-sheet`: on the board, the card they belong to and the dossier's sheet in your hand (`.fy-vt-card`, `.fy-vt-sheet`), their groups above the tabs', so what sits over a tab at rest sits over it in every frame. Each is named only for the move it travels in; a page back from the back/forward cache takes stale ones off at `pagereveal`.
- Pages resolve against the site root (the home link's directory); a page under `building/<id>/` is a project's, and counts as the building tab for every other move.
- These moves get no view transition: same-tab moves (Writing ↔ Reading), other pages, and reduced motion. Engines without cross-document view transitions keep a hard cut.

## Motion, pen and colour

- **Two clocks.** Drawings move on the hand's clock: held poses and per-keyframe stepped timing (`Motion.held`). Paper and chrome move on the physics clock: springs with one small overshoot, then settle.
  - Every motion has a cause, and loops sleep when nothing moves (`Motion.Loop`).
  - Do not add ambient loops, gradients, gloss, shimmer, glass blur, parallax or fade-and-rise entrances.
  - The home opener is the one sanctioned register break.
- **Transitions run on the compositor.** A view-transition animation changes only transform and opacity; a clip may be set but holds still. The new page mounts while its move plays, and anything on the main thread (a changing clip-path, width or height, `composite: 'add'`, SVG redrawn per frame) stops for as long as the page is busy. `vt-moves.mjs` checks every tab move, and `vt-project.mjs` every move between the Building board and a project's pages from Chrome's own trace; see `design/2026-09-tab-moves/`.
- **Reduced motion** goes through `Motion.reduced()` / `Motion.onReduced()`. Turning it on finishes running tweens, and the head's inline opt-in switches view transitions off.
- **The pen is the only highlighter.** Wire states with `Tier.wire`:
  - hover: a coral underline hung from the text's baseline (baseline + max(3 px, 0.18 em)), level, with a blunt end;
  - keyboard focus: coral 「 」;
  - chosen or current: the wheat band (`--hl` with its `--hl-ink` edge), with no coral at rest;
  - point: one short coral arrow per view, spent for the session (`Pen.pointOnce` / `Pen.spend`).
- **Pen spacing.** Whatever follows an underline sits at least 10 px below it and at least twice its drop (`scripts/verify/pen-spacing.mjs`).
- **Seeds.** Strokes are seeded by their text, or by `data-pen-seed`, so the same word always gets the same stroke.
- **Coral at rest** is only the point arrow and fixed identity, and one exception Fred made: Demos' enlargement marks its current region's four corners in the pen's coral, the same as a noticed region's on the capture ("even in zoomed-in still use the orange color to preserve consistency"), on a thin paper halo (`lib/fred-agent/corners.js`); `project-demos.mjs` allows exactly those four strokes while it's open. Never set small text in coral; use `--pencil` (4.5:1 on paper and paper2; on plank, board or wheat use `--soft`; on kraft use `--ink`). On tinted paper, mark the surface `data-paper="cork"` (or `wheat`, `cream`), so `--pen` becomes the coral multiplied by that paper. Kraft (`data-paper="kraft"`, Building's dossier tabs) is the one paper where the multiplied coral fails 3:1, so its pen is `--mark-deep`. The wheat band's wash can't be seen on kraft: on the board nothing is current, so nothing on kraft is banded there, and where a band does land on kraft, a project page's current chapter tab, its darker edge carries the state: `--hl-ink-kraft` at 2.6 px, 3.56:1 against kraft (`pen.css`).
- **Tokens.** Shared tokens live only in `site-tokens.css`. Page-only tokens live in the page's own CSS; do not redeclare shared ones there. The one exception is Reading's `html.dark` palette in `lib/reading/reading.css`.
- **Storage.** The site keeps session memory only. sessionStorage keys:
  - `fy-opener`: the full opener plays once per session;
  - `fy-vt`: the transition hand-off between pages, one hop long (a project page adds `pj`: its project and chapter, and where you are going);
  - `fy-point-<key>`: a spent point arrow;
  - `fy-flower-<id>`: Building's flower has been applied;
  - `fy-gallery-dev`: developed prints;
  - `fy-about-flipped`, `fy-about-putback`: retire About's hand note.
  - localStorage holds only `fy-lang` (the CN/EN switch Writing and Reading share) and Reading's `fy-theme`. Add no other per-visitor memory across visits.

## Editing conventions

- Edit static template text in the page's `.dc.html`, page CSS in `lib/<page>/<page>.css`, and page behaviour in `lib/<page>/*.js`. When a module replaces old page logic, delete the old logic instead of keeping both.
- The files at the root are only pages and site metadata (`favicon.png`, `robots.txt`, `llms.txt`, `LICENSE`, `NOTICE.md`, `README.md`, `AGENTS.md`, `CLAUDE.md`). Code shared across pages lives in `lib/shared/`, and one page's code in `lib/<page>/`. `.github/workflows/deploy-pages.yml` deletes `scripts/`, `design/`, `.agents/` and `.claude/` before deploying, so nothing a page loads may live there. `scripts/verify/` holds headless checks only.
- Edit imported essay bodies in `content/posts/*.md` and gallery metadata in `content/photos-source.ts`, then regenerate in this order and commit every generated file:

  ```sh
  python3 scripts/generate-derivatives.py   # only when media changed
  uv run scripts/generate-sprites.py        # only when the desk art changed
  python3 scripts/generate-content.py
  uv run scripts/generate-fonts.py          # only when Chinese text or the Latin sources and faces changed
  ```

  Generated outputs:
  - `content/posts-index.js` (the essay list without bodies: Writing, and Reading's prev/next)
  - `content/bodies/<id>.js` (one per essay: both bodies, landmarks, subtitle and excerpt; Reading loads only the essay it shows, and the generator prunes stale files here)
  - `content/home.js` (home's counts and latest post and photo)
  - `content/photos.js`, `content/image-dimensions.json`, `content/font-subsets.json`
  - `images/derived/`, `fonts/derived/`, and `assets/derived/` (desk layers, sprite strips, opener cut-outs, `desk-geo.js`)

  The order matters: content reads image dimensions, and fonts read the rendered post HTML plus the whole text of every page (the Building sub-sites' `building/**/*.html` included), shared module and `lib/` file.
- Reading's margin rail comes from build-time landmarks. `scripts/landmarks.py` runs inside `generate-content.py` and marks up every body:
  - section markers at the start of a paragraph (`1.0`, `（一）`, `(IV)`, `IV.`, `（序）` / `(Prologue)`, a bold `V — Title`, a lone `前言` / `Preface`), whole-line bold titles and real headings become `<h2 class="lm lm-sec|lm-head" id="…">` with `.lm-no` / `.lm-t`;
  - structureless essays get minute ticks as `<span class="lm-anchor">`;
  - each body file carries `landmarksZh` / `landmarksEn`.
  Write section markers in the Markdown, the same way in both languages, and never hand-write the `lm` markup. `python3 scripts/landmarks.py --check` fails when an essay's English and Chinese structure disagree without an explanation.
- Pages load only subset fonts from `fonts/derived/`, never the masters in `fonts/`. The local masters are complete ~6,900-glyph typefaces; the site renders a few hundred of those glyphs. Shipping them made the font the slowest thing on the site — `Gallery.dc.html`'s LCP element is its `<h1 class="display">`, and because `font-display: swap` repaints that heading when the real face arrives, the 985 KB download *became* the LCP at ~2.9 s on Fast 4G. Adding Chinese to a heading, footnote, reference, image caption, page, shared module or `lib/` file changes the required glyph set, so rerun `generate-fonts.py`; the audit fails and names the missing characters if you forget.
- Noto Serif SC and Noto Sans SC are self-hosted subsets too, not Google Fonts requests. Noto Serif SC ships in two sizes and **the split is the one thing to keep straight**: `lib/reading/reading.css` references `NotoSerifSC-text.woff2` (every essay body, ~1,087 KB; one subset shared by all essays even though Reading loads one body file at a time) and every other page's CSS references `NotoSerifSC-ui.woff2` (interface Chinese only, ~148 KB). A new page should use the `-ui` tier unless it renders essay bodies. Collapsing to one file would put 1,196 KB on every gateway page, a 3× regression against the ~391 KB they used to fetch from Google.
- Fraunces, Caveat and IBM Plex Mono are self-hosted as well: `generate-fonts.py` cuts them from Google's masters, pinned to one google/fonts commit and checked by sha256, the way Google Fonts serves them, in its `latin` / `latin-ext` split, so a page fetches latin-ext only when it renders one of those letters. Their ranges are fixed rather than read from the content, so new English text needs no rerun. Rerun it when Chinese text changes or when `LATIN_SOURCES`, `LATIN_FACES` or `LATIN_RANGES` change (with `--force` if you change how `subset_latin` builds them), and keep the `@font-face` rules in `site-tokens.css`, `lib/home/home.css`, `lib/reading/reading.css`, `lib/building/dossier.css` and `404.html` in step. Fraunces italic is declared per page (Reading 400–500, home 500 only, the Building sub-sites' chapters 400 in `dossier.css`), so a page that sets it declares it too. Home also preloads its italic: the opener's words are its largest paint, and over HTTP/2 the preload brings that paint ~300 ms earlier. Inside the files IBM Plex Mono is named “FY Mono”, because “Plex” is a Reserved Font Name (see `NOTICE.md`); stylesheets still call the family `IBM Plex Mono`. The sub-sites' chapters preload `Fraunces-latin.woff2` (their display title is their largest paint, and its swap re-wrapped the title) and both IBM Plex Mono latin weights (the chapter tabs). Building preloads `Fraunces-latin.woff2` too: the board sets its text in `--text` (Fraunces, then Noto Serif SC for Chinese), and the lead card's note is its largest paint. It preloads no Noto Serif SC, because nothing on the board renders in it; `dossier.css` declares the `-ui` tier (for the board and the project pages, which load `card.css` only with their card), so Chinese on a card falls through to it. No page loads a font from Google.
- Add photos and covers at full resolution and never hand-resize them. Pages load only `images/derived/`; serving the originals cost 51 MB and a 54-second load on the gallery before this split existed. Size ladders live in `scripts/generate-content.py`; changing one requires `generate-derivatives.py --force --prune`. Because the deploy deletes `scripts/`, derivatives and sprites are built locally and committed, never in CI.
- Each cover also gets `images/derived/boards/<stem>-<w>.jpg`, the copy Writing's book in your hand shows: pre-cropped to its 16:25 front board at 240, 480 and 640 px, stopping at the widest board the original holds (`board_ladder`, read from `content/image-dimensions.json`), so `boardSrcset` claims no size that isn't there. Only a pulled book fetches one.
- The sub-sites' evidence images follow the same rule. Add a capture at full resolution to `images/evidence/<project>/` and run `generate-derivatives.py`: it writes `images/derived/evidence/<project>/<stem>-<w>.jpg` at 640, 960, 1280 and 1760 px, capped at the original's width, at quality 86 (the photos' 74 blurs small UI text), plus `<stem>-zoom.jpg` at full width and quality 90 for each capture in `EVIDENCE_ZOOM`, which only an opened Demos enlargement fetches.
  - On Demos each capture is a `.print` in a `.viewer` (`lib/fred-agent/evidence.js`, `corners.js`, `demos.css`). A region is a `.rg` whose box is inline percentages of its print (`--x`, `--y` its centre, `--w`, `--h`), with its token and a legend entry (`.ex-note`, the control) of the same `data-n`. The print's `data-text` is its body text's height in image px, from which the enlargement takes its zoom; its `<img>`'s `data-zoom-src` is the zoom tier.
  - Every evidence `<img>` carries `srcset` and `sizes` fitted to its box, and `width` and `height` from `content/image-dimensions.json`, so nothing above a section moves when it loads. The email demo keeps its display size in `width` and `height`, as email clients read them.
  - In a `support.js` template, write `loading="lazy"` before `src`: React sets attributes in order, and an image whose `src` is set first loads at once.
  - Where the email demo's originals came from is in `NOTICE.md`; no page requests anything from `apa.njjoegroup.com`.
- Load generated manifests, stylesheets and modules unversioned (`./content/posts-index.js`, `./lib/shared/site-nav.css`). Do not add a `?v=` cache-buster: GitHub Pages already serves everything with `max-age=600` and an ETag, so a manual stamp buys nothing and goes stale when someone forgets to bump it.
- Do not hand-edit `support.js`; it is generated runtime code.
- Preserve relative URLs so the site works from a simple local server and static hosting.
- Gateway pages present Chinese and English together where both are available; English-only interface text is acceptable, but Chinese-only interface text is not.
- `Writing.dc.html` and `Reading.dc.html` have a CN/EN switch. On load both resolve the language as `?lang=`, else `fy-lang` in `localStorage`, else `zh`; a switch writes `fy-lang` and rewrites the page's own `?lang=` in place (`history.replaceState`, keeping every other parameter and the hash).
  - Reading's switch swaps its `.en` / `.zh` variants and sets `?lang=`, so a reload, a shared link and a Reading history entry keep the language that essay was last shown in.
  - Writing's switch deletes `?lang=`, so Writing's history entries carry no language: a reload of Writing, a way back to it and every fresh load without `?lang=` (the nav, Reading's back link and its previous / next links) follow `fy-lang`, the choice made last on either page. A `?lang=` link to Writing shows that language until the reader switches.
  - Writing (`lib/writing/lang.js`) titles its spines in the chosen language, each fitted to its spine and never set under 8.2 px (a title that still doesn't fit is cut, as on main; none is today); a book's size and place never depend on the language. The book in your hand shows both titles, the chosen one first, and every book link carries `&lang=`.
- Treat newlines in `content/posts/*.md` literally: one source newline becomes one rendered line break and repeated newlines remain repeated line breaks. Do not use Markdown trailing spaces as a separate hard-break convention.
- Gateway pages are light-only. `Reading.dc.html` is the only page with dark mode, which drops its hero's halftone, and it may use paired light/dark navigation artwork; do not add theme switching or dark artwork to other pages.
- Keep interactive illustration hotspots as semantic anchors with an `href` and an accessible `aria-label`. Their position is controlled by inline percentage geometry.
- Keep `index.html` as the root entry point. If that convention changes, update every inbound home link in the same change.
- Building's corkboard cards are pinned by one point, the pin's tip.
  - Each card is a `.slot` holding a rotating `.swing` (the paper) and a `.board-pin` sibling. The pin is never inside the paper.
  - The paper rotates about `var(--pin-left) 14px`, the pin's tip (`top:-24px` plus 90% of its 42px height), and the pin rotates about its own tip.
  - Everything else uses the same point: the cork patch behind the card (`.ghost`), the pin hole (`top:13.8px`), and the physics (`pinPoint`, the unpin's `P.y = 14`).
  - Changing the pin artwork, its `top` or `--pin-left` means updating all of them together. Otherwise the pin slides across the cork whenever the paper swings. See the comment at the top of `lib/building/card.css`.
- A Building card with pages keeps its dossier behind it (`lib/building/dossier.js`; its rules and the kraft tokens are in `lib/building/dossier.css`).
  - At rest its index tabs peek past the card's right edge, one per chapter, numbers only. They sit inside the `.swing`, so they hang from the same pin. On a phone the card narrows by the peek (`--peek-room`), so the tabs stay inside the cork.
  - A click unpins the card into your hand, and the dossier slides out from under it: its contents sheet, and the tabs down its fore-edge (on its top edge where the window has no room beside it), each a plain link to its chapter. The card's own link still goes straight in. A slip without pages gets one sheet and one tab, to its repository.
  - A project's own pages are the dossier opened (`lib/building/dossier.css`: the `.pj-*` frame, and what every project writes on its sheet, its sections, ruled entries, line, page nav and foot; `lib/building/project.js`: the pen on its links and tabs, and the card). One sheet (`main.pj-sheet`) with the folder's kraft back above it, a typed file label, the facts stamped, and the board's card clipped to its corner. The index tabs down its fore-edge (`nav.pj-tabs`, `.dos-tab` on kraft) are the chapter nav: sticky, the current one `aria-current="page"`, pulled out and banded. Up to 1000 px they are a strip on the sheet's top edge, sticky at the top of the window; on a phone every tab shows its number and the current one its name too. Whatever sticks at the top is `--pj-stick`, and every `[id]` on the sheet lands 28 px under it (`scroll-margin-top`), so a section link opened fresh lands on its section with no script. The fore-edge is cut `--pj-tabs-w` wide (150 px; NJJoe's 170 px, for its longest tab). The card's held box is the lead card's or, with `.pj-cover--featured`, the featured card's, and anything else clipped to the sheet (`[data-clip]`, NJJoe's prints) gets the card's pen-drawn paperclip.
  - A long chapter's table of contents is Reading's pencil margin (`lib/reading/rail.js`, `rail.css`) through one adapter, `lib/fred-agent/project-rail.js`: its landmarks are the chapter's `section.fa-pr[id]`, each with its `.pr-no` and `.pr-t`, and on phones its strip and counter live on the `.pj-count` line under the tabs, which the page carries as static markup so the strip has its height at first paint. The text column (`.fa-read`) keeps 190 px for the rail on its left beside the fore-edge, and none where the tabs are a strip, so `rail.js`'s own test (the article 180 px into the window) picks the margin exactly when the tabs are on the fore-edge.
  - Its content lives with the project in `content/building-projects.js`: `contents` (the sheet's label), `chapters` (`n`, `tab`, the chapter's own `title`, one `line`, `href`), `figure` (`caption`, `steps`, `exit`), `status` and `source`. A slip may carry a `figure` and `lines`, shown instead of its note. Take every line from the project's own pages, and keep the chapters in step with the project's own chapter nav: the same pages, in the same order (`project-pages.mjs` compares them).
- Design iterations live in `design/YYYY-MM-topic/` with an index in `design/README.md`. Keep them, and never edit an earlier iteration; a new round of design work adds a sibling folder. The deploy strips `design/`, and production must request nothing from it.

## Verification

After a change:

1. Serve the repository locally.
2. Load the home page and check the browser console for errors.
3. Verify the edited page at desktop and mobile widths when layout or navigation changed.
4. For home navigation changes, hover and click the laptop, book, portrait, and camera, and at phone width tap the overview doors and the panel links, confirming all four destination URLs.
5. Confirm edited asset and page requests return HTTP 200.
6. Run the headless suites in `scripts/verify/` that cover the change:
   - `vt-*` for transitions and the nav (`vt-project.mjs` for the Building board ↔ a project's pages and its chapters, with the back/forward cache on; `vt-project-load.mjs` for the same moves under load: CPU slowed, the HTTP cache off and one render-blocking file of the page you land on late);
   - `pen-*` for pen states and spacing, on `pen-harness.html`;
   - `home-*` for home, plus `flash-audit.py` and `home-diff.py`;
   - `writing-*`, `building-*`, `gallery-*`, `about-*` and `reading-*` for their pages.
   - `site-404.mjs` for `404.html`, which GitHub Pages serves at any missing URL, at any depth;
   - `evidence.mjs` for the Building sub-sites' evidence images and their bytes;
   - `project-*` for the sub-sites' chapters (Fred Agent's five, NJJoe's three): `project-pages.mjs` (the shell, contrast, the pen, the tabs, CLS and bytes, nothing off the site's origin, no WIP, and nothing out of its column at 1440, 390, 360 and a tablet's 768, 820, 1024 and 1180), `project-rail.mjs` (the rail and every section link opened fresh), `project-map.mjs` (System's map), `project-demos.mjs` (Demos' play control and evidence viewer at 1440, 1024, 820, 390 and 360) and `project-webkit.mjs`.

   Each script's header lists what it checks and its environment variables. They run in the isolated Chromium runner from `design/2026-09-motion/tools/shot-runner.mjs`:

   ```sh
   mkdir -p /tmp/fyshot && cd /tmp/fyshot && npm init -y >/dev/null && npm i playwright-core
   cp <repo>/design/2026-09-motion/tools/shot-runner.mjs /tmp/fyshot/run.mjs
   node /tmp/fyshot/run.mjs scripts/verify/vt-nav.mjs
   ```

7. After a content change, run `python3 .agents/skills/add-website-content/scripts/audit_content.py`.
