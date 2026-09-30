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
  - Cross-document view transitions: `transitions.js` (home ↔ page, and the shared plumbing), `transitions-tab.js` (page → page), `transitions.css`
- Page code: `lib/<page>/` (`home`, `writing`, `building`, `gallery`, `about`, `reading`), each with its own `<page>.css`
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
  2. `site-tokens.css`, `site-nav.css`, `pen.css`, `transitions.css`, `lib/<page>/<page>.css`
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
- These moves get no view transition: same-tab moves (Writing ↔ Reading), other pages, and reduced motion. Engines without cross-document view transitions keep a hard cut.

## Motion, pen and colour

- **Two clocks.** Drawings move on the hand's clock: held poses and per-keyframe stepped timing (`Motion.held`). Paper and chrome move on the physics clock: springs with one small overshoot, then settle.
  - Every motion has a cause, and loops sleep when nothing moves (`Motion.Loop`).
  - Do not add ambient loops, gradients, gloss, shimmer, glass blur, parallax or fade-and-rise entrances.
  - The home opener is the one sanctioned register break.
- **Transitions run on the compositor.** A view-transition animation changes only transform and opacity; a clip may be set but holds still. The new page mounts while its move plays, and anything on the main thread (a changing clip-path, width or height, `composite: 'add'`, SVG redrawn per frame) stops for as long as the page is busy. `vt-moves.mjs` checks every tab move; see `design/2026-09-tab-moves/`.
- **Reduced motion** goes through `Motion.reduced()` / `Motion.onReduced()`. Turning it on finishes running tweens, and `transitions.css` switches view transitions off.
- **The pen is the only highlighter.** Wire states with `Tier.wire`:
  - hover: a coral underline hung from the text's baseline (baseline + max(3 px, 0.18 em)), level, with a blunt end;
  - keyboard focus: coral 「 」;
  - chosen or current: the wheat band (`--hl` with its `--hl-ink` edge), with no coral at rest;
  - point: one short coral arrow per view, spent for the session (`Pen.pointOnce` / `Pen.spend`).
- **Pen spacing.** Whatever follows an underline sits at least 10 px below it and at least twice its drop (`scripts/verify/pen-spacing.mjs`).
- **Seeds.** Strokes are seeded by their text, or by `data-pen-seed`, so the same word always gets the same stroke.
- **Coral at rest** is only the point arrow and fixed identity. Never set small text in coral; use `--pencil` (4.5:1 on paper and paper2; on plank, board or wheat use `--soft`; on kraft use `--ink`). On tinted paper, mark the surface `data-paper="cork"` (or `wheat`, `cream`), so `--pen` becomes the coral multiplied by that paper. Kraft (`data-paper="kraft"`, Building's dossier tabs) is the one paper where the multiplied coral fails 3:1, so its pen is `--mark-deep`. The wheat band's wash can't be seen on kraft: on the board nothing is current, so nothing on kraft is banded there, and where a band does land on kraft (the project pages' current tab, PR 2) its darker edge carries the state.
- **Tokens.** Shared tokens live only in `site-tokens.css`. Page-only tokens live in the page's own CSS; do not redeclare shared ones there. The one exception is Reading's `html.dark` palette in `lib/reading/reading.css`.
- **Storage.** The site keeps session memory only. sessionStorage keys:
  - `fy-opener`: the full opener plays once per session;
  - `fy-vt`: the transition hand-off between pages;
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

  The order matters: content reads image dimensions, and fonts read the rendered post HTML plus the whole text of every page, shared module and `lib/` file.
- Reading's margin rail comes from build-time landmarks. `scripts/landmarks.py` runs inside `generate-content.py` and marks up every body:
  - section markers at the start of a paragraph (`1.0`, `（一）`, `(IV)`, `IV.`, `（序）` / `(Prologue)`, a bold `V — Title`, a lone `前言` / `Preface`), whole-line bold titles and real headings become `<h2 class="lm lm-sec|lm-head" id="…">` with `.lm-no` / `.lm-t`;
  - structureless essays get minute ticks as `<span class="lm-anchor">`;
  - each body file carries `landmarksZh` / `landmarksEn`.
  Write section markers in the Markdown, the same way in both languages, and never hand-write the `lm` markup. `python3 scripts/landmarks.py --check` fails when an essay's English and Chinese structure disagree without an explanation.
- Pages load only subset fonts from `fonts/derived/`, never the masters in `fonts/`. The local masters are complete ~6,900-glyph typefaces; the site renders a few hundred of those glyphs. Shipping them made the font the slowest thing on the site — `Gallery.dc.html`'s LCP element is its `<h1 class="display">`, and because `font-display: swap` repaints that heading when the real face arrives, the 985 KB download *became* the LCP at ~2.9 s on Fast 4G. Adding Chinese to a heading, footnote, reference, image caption, page, shared module or `lib/` file changes the required glyph set, so rerun `generate-fonts.py`; the audit fails and names the missing characters if you forget.
- Noto Serif SC and Noto Sans SC are self-hosted subsets too, not Google Fonts requests. Noto Serif SC ships in two sizes and **the split is the one thing to keep straight**: `lib/reading/reading.css` references `NotoSerifSC-text.woff2` (every essay body, ~1,087 KB; one subset shared by all essays even though Reading loads one body file at a time) and every other page's CSS references `NotoSerifSC-ui.woff2` (interface Chinese only, ~148 KB). A new page should use the `-ui` tier unless it renders essay bodies. Collapsing to one file would put 1,196 KB on every gateway page, a 3× regression against the ~391 KB they used to fetch from Google.
- Fraunces, Caveat and IBM Plex Mono are self-hosted as well: `generate-fonts.py` cuts them from Google's masters, pinned to one google/fonts commit and checked by sha256, the way Google Fonts serves them, in its `latin` / `latin-ext` split, so a page fetches latin-ext only when it renders one of those letters. Their ranges are fixed rather than read from the content, so new English text needs no rerun. Rerun it when Chinese text changes or when `LATIN_SOURCES`, `LATIN_FACES` or `LATIN_RANGES` change (with `--force` if you change how `subset_latin` builds them), and keep the `@font-face` rules in `site-tokens.css`, `lib/home/home.css`, `lib/reading/reading.css` and `404.html` in step. Fraunces italic is declared per page (Reading 400–500, home 500 only), so a page that sets it declares it too. Home also preloads its italic: the opener's words are its largest paint, and over HTTP/2 the preload brings that paint ~300 ms earlier. Inside the files IBM Plex Mono is named “FY Mono”, because “Plex” is a Reserved Font Name (see `NOTICE.md`); stylesheets still call the family `IBM Plex Mono`. The `building/` sub-sites are the exception: they keep loading these three from Google Fonts until their redesign.
- Add photos and covers at full resolution and never hand-resize them. Pages load only `images/derived/`; serving the originals cost 51 MB and a 54-second load on the gallery before this split existed. Size ladders live in `scripts/generate-content.py`; changing one requires `generate-derivatives.py --force --prune`. Because the deploy deletes `scripts/`, derivatives and sprites are built locally and committed, never in CI.
- Each cover also gets `images/derived/boards/<stem>-<w>.jpg`, the copy Writing's book in your hand shows: pre-cropped to its 16:25 front board at 240, 480 and 640 px, stopping at the widest board the original holds (`board_ladder`, read from `content/image-dimensions.json`), so `boardSrcset` claims no size that isn't there. Only a pulled book fetches one.
- The sub-sites' evidence images follow the same rule. Add a capture at full resolution to `images/evidence/<project>/` and run `generate-derivatives.py`: it writes `images/derived/evidence/<project>/<stem>-<w>.jpg` at 640, 960, 1280 and 1760 px, capped at the original's width, at quality 86 (the photos' 74 blurs small UI text), plus `<stem>-zoom.jpg` at full width and quality 90 for each capture in `EVIDENCE_ZOOM`, which only an opened Demos loupe fetches.
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
  - Its content lives with the project in `content/building-projects.js`: `contents` (the sheet's label), `chapters` (`n`, `tab`, the chapter's own `title`, one `line`, `href`), `figure` (`caption`, `steps`, `exit`), `status` and `source`. A slip may carry a `figure` and `lines`, shown instead of its note. Take every line from the project's own pages, and keep the chapters in step with the project's own chapter nav: the same pages, in the same order.
- Design iterations live in `design/YYYY-MM-topic/` with an index in `design/README.md`. Keep them, and never edit an earlier iteration; a new round of design work adds a sibling folder. The deploy strips `design/`, and production must request nothing from it.

## Verification

After a change:

1. Serve the repository locally.
2. Load the home page and check the browser console for errors.
3. Verify the edited page at desktop and mobile widths when layout or navigation changed.
4. For home navigation changes, hover and click the laptop, book, portrait, and camera, and at phone width tap the overview doors and the panel links, confirming all four destination URLs.
5. Confirm edited asset and page requests return HTTP 200.
6. Run the headless suites in `scripts/verify/` that cover the change:
   - `vt-*` for transitions and the nav;
   - `pen-*` for pen states and spacing, on `pen-harness.html`;
   - `home-*` for home, plus `flash-audit.py` and `home-diff.py`;
   - `writing-*`, `building-*`, `gallery-*`, `about-*` and `reading-*` for their pages.
   - `evidence.mjs` for the Building sub-sites' evidence images and their bytes.

   Each script's header lists what it checks and its environment variables. They run in the isolated Chromium runner from `design/2026-09-motion/tools/shot-runner.mjs`:

   ```sh
   mkdir -p /tmp/fyshot && cd /tmp/fyshot && npm init -y >/dev/null && npm i playwright-core
   cp <repo>/design/2026-09-motion/tools/shot-runner.mjs /tmp/fyshot/run.mjs
   node /tmp/fyshot/run.mjs scripts/verify/vt-nav.mjs
   ```

7. After a content change, run `python3 .agents/skills/add-website-content/scripts/audit_content.py`.
