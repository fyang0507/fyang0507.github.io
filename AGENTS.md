# AGENTS.md

## Repository overview

This is a dependency-free static personal website exported as standalone `.dc.html` pages. There is no package manager, build step, or framework source in this repository.

- Entry page: `index.html` (static markup; no `<x-dc>` and no `support.js`)
- Shared browser runtime: `support.js` (renders each `.dc.html` page's `<x-dc>` template)
- Shared tokens and first-paint base: `site-tokens.css` (the one `:root`, the shared `@font-face` rules, the `.site-top` header frame)
- Shared header and object-tab nav: `site-nav.css` (the `building/` sub-sites load it too)
- Shared motion and pen modules: `motion.js` (`window.Motion`: the two clocks, springs, sleeping loops, reduced motion), `pen.js` (`window.Pen`: seeded hand strokes and the point arrow), `pen-tier.js` (`TierMark`, `FocusMark`, `Tier.wire`: the pen's states), `pen.css`
- Shared page glue: `site.js` (`FY.mount`, the nav's pen marks)
- Cross-document view transitions: `transitions.js` (home ↔ page, and the shared plumbing), `transitions-tab.js` (page → page), `transitions.css`
- Page code: `lib/<page>/` (`home`, `writing`, `building`, `gallery`, `about`, `reading`), each with its own `<page>.css`
- Vendored `<image-slot>` component that no page currently loads: `image-slot.js`
- Local fonts: `fonts/`
- Illustrations and decorative images: `assets/`
- Imported essays and gallery metadata: `content/`
- Imported photography, covers, and profile images: `images/`
- Dependency-free content manifest generator: `scripts/generate-content.py` (with `scripts/content_markdown.py` and `scripts/landmarks.py`)
- Web-sized image generator: `scripts/generate-derivatives.py`
- Desk sprite generator: `scripts/generate-sprites.py`
- CJK font subset generator: `scripts/generate-fonts.py`
- Headless checks: `scripts/verify/`
- Design lineage (never served): `design/`
- Full-resolution originals (archive, never served): `images/gallery/`, `images/blog/covers/`
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

- Every `.dc.html` page has three layers:
  - a static header before `<x-dc>`: `<div class="site-top"><header class="site-shell-header" id="site-nav">`;
  - the `<x-dc>` template, which holds only static template text;
  - interactive surfaces from `lib/<page>/*.js`, which mount into an empty template host through `FY.mount('[data-mount=<name>]', fn)`.
- The header must stay static, outside `<x-dc>`. support.js hides `<x-dc>` and renders it only after React arrives from unpkg, but a view transition snapshots the new page at `pagereveal`, before first paint. `<link rel="expect" href="#site-nav" blocking="render">` holds first paint until the header is parsed.
  - Keep the header's class names.
  - `.site-rule` and `.site-tabmark` stay the last two children of `.site-index`.
  - Put no inline styles, animation classes or `view-transition-name` on header parts.
- Head order on every `.dc.html` page:
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
- support.js takes the page template from the first literal `<x-dc>` in the raw page text. Never write that string anywhere before the real element: not in a head comment, a script or the static header.
- Keep mount hosts out of any `sc-if` that can flip. A re-render replaces the host, and the module mounts again from scratch.
- `transitions.css` assigns every view-transition name. Set `view-transition-name` nowhere else, and render one element per name per document:
  - `identity` → `.site-identity`
  - `site-head` → `.site-shell-header`, the header strip, so its labels, status line and home link travel with the named parts in it
  - `obj-laptop|book|frame|camera` → `.site-nav-*` in the nav, `.desk-*` on home
  - `site-rule` and `tabmark`
  - home's old/new-only groups: `desk-table` (`.desk-plate`), `desk-edge`, `desk-mug`, `desk-plant`, `desk-bird`, `desk-notes`
  - `rule-live`, the transient line transitions.js draws
- These moves get no view transition: same-tab moves (Writing ↔ Reading), other pages, and reduced motion. Engines without cross-document view transitions keep a hard cut.

## Motion, pen and colour

- **Two clocks.** Drawings move on the hand's clock: held poses and per-keyframe stepped timing (`Motion.held`). Paper and chrome move on the physics clock: springs with one small overshoot, then settle.
  - Every motion has a cause, and loops sleep when nothing moves (`Motion.Loop`).
  - Do not add ambient loops, gradients, gloss, shimmer, glass blur, parallax or fade-and-rise entrances.
  - The home opener is the one sanctioned register break.
- **Reduced motion** goes through `Motion.reduced()` / `Motion.onReduced()`. Turning it on finishes running tweens, and `transitions.css` switches view transitions off.
- **The pen is the only highlighter.** Wire states with `Tier.wire`:
  - hover: a coral underline hung from the text's baseline (baseline + max(3 px, 0.18 em)), level, with a blunt end;
  - keyboard focus: coral 「 」;
  - chosen or current: the wheat band (`--hl` with its `--hl-ink` edge), with no coral at rest;
  - point: one short coral arrow per view, spent for the session (`Pen.pointOnce` / `Pen.spend`).
- **Pen spacing.** Whatever follows an underline sits at least 10 px below it and at least twice its drop (`scripts/verify/pen-spacing.mjs`).
- **Seeds.** Strokes are seeded by their text, or by `data-pen-seed`, so the same word always gets the same stroke.
- **Coral at rest** is only the point arrow and fixed identity. Never set small text in coral; use `--pencil` (4.5:1 on paper and paper2; on plank, board or wheat use `--soft`). On tinted paper, mark the surface `data-paper="cork"` (or `wheat`, `cream`), so `--pen` becomes the coral multiplied by that paper.
- **Tokens.** Shared tokens live only in `site-tokens.css`. Page-only tokens live in the page's own CSS; do not redeclare shared ones there. The one exception is Reading's `html.dark` palette in `lib/reading/reading.css`.
- **Storage.** The site keeps session memory only. sessionStorage keys:
  - `fy-opener`: the full opener plays once per session;
  - `fy-vt`: the transition hand-off between pages;
  - `fy-point-<key>`: a spent point arrow;
  - `fy-flower-<id>`: Building's flower has been applied;
  - `fy-gallery-dev`: developed prints;
  - `fy-about-flipped`, `fy-about-putback`: retire About's hand note.
  - localStorage holds only Reading's `fy-lang` and `fy-theme`. Add no other per-visitor memory across visits.

## Editing conventions

- Edit static template text in the page's `.dc.html`, page CSS in `lib/<page>/<page>.css`, and page behaviour in `lib/<page>/*.js`. When a module replaces old page logic, delete the old logic instead of keeping both.
- Keep runtime code at the root or in `lib/`. `.github/workflows/deploy-pages.yml` deletes `scripts/`, `design/`, `.agents/` and `.claude/` before deploying, so nothing a page loads may live there. `scripts/verify/` holds headless checks only.
- Edit imported essay bodies in `content/posts/*.md` and gallery metadata in `content/photos-source.ts`, then regenerate in this order and commit every generated file:

  ```sh
  python3 scripts/generate-derivatives.py   # only when media changed
  uv run scripts/generate-sprites.py        # only when the desk art changed
  python3 scripts/generate-content.py
  uv run scripts/generate-fonts.py          # only when Chinese text changed
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
- Noto Serif SC and Noto Sans SC are self-hosted subsets too, not Google Fonts requests. Only Fraunces, Caveat and IBM Plex Mono still come from Google. Noto Serif SC ships in two sizes and **the split is the one thing to keep straight**: `lib/reading/reading.css` references `NotoSerifSC-text.woff2` (every essay body, ~1,087 KB; one subset shared by all essays even though Reading loads one body file at a time) and every other page's CSS references `NotoSerifSC-ui.woff2` (interface Chinese only, ~148 KB). A new page should use the `-ui` tier unless it renders essay bodies. Collapsing to one file would put 1,196 KB on every gateway page, a 3× regression against the ~391 KB they used to fetch from Google.
- Add photos and covers at full resolution and never hand-resize them. Pages load only `images/derived/`; serving the originals cost 51 MB and a 54-second load on the gallery before this split existed. Size ladders live in `scripts/generate-content.py`; changing one requires `generate-derivatives.py --force --prune`. Because the deploy deletes `scripts/`, derivatives and sprites are built locally and committed, never in CI.
- Load generated manifests, stylesheets and modules unversioned (`./content/posts-index.js`, `./site-nav.css`). Do not add a `?v=` cache-buster: GitHub Pages already serves everything with `max-age=600` and an ETag, so a manual stamp buys nothing and goes stale when someone forgets to bump it.
- Do not hand-edit `support.js`; it is generated runtime code. Treat `image-slot.js` as vendored runtime code unless the image-slot behavior itself is the task.
- Preserve relative URLs so the site works from a simple local server and static hosting.
- Gateway pages present Chinese and English together where both are available; English-only interface text is acceptable, but Chinese-only interface text is not. `Reading.dc.html` is the only page with a CN/EN switch, using `.en` / `.zh` variants and the `fy-lang` preference in `localStorage`.
- Treat newlines in `content/posts/*.md` literally: one source newline becomes one rendered line break and repeated newlines remain repeated line breaks. Do not use Markdown trailing spaces as a separate hard-break convention.
- Gateway pages are light-only. `Reading.dc.html` is the only page with dark mode, which drops its hero's halftone, and it may use paired light/dark navigation artwork; do not add theme switching or dark artwork to other pages.
- Keep interactive illustration hotspots as semantic anchors with an `href` and an accessible `aria-label`. Their position is controlled by inline percentage geometry.
- Keep `index.html` as the root entry point. If that convention changes, update every inbound home link in the same change.
- When a request says to “set section X to WIP,” “mark section X as WIP,” or otherwise apply the site's WIP treatment, use `.agents/skills/set-section-wip/SKILL.md`. “WIP” means the complete reusable treatment—peelable sticker, pusher nudge motif, faded and disabled evidence surface, static fallback, accessibility, and responsive behavior—not merely a label or badge.
- Building's corkboard cards are pinned by one point, the pin's tip.
  - Each card is a `.slot` holding a rotating `.swing` (the paper) and a `.board-pin` sibling. The pin is never inside the paper.
  - The paper rotates about `var(--pin-left) 14px`, the pin's tip (`top:-24px` plus 90% of its 42px height), and the pin rotates about its own tip.
  - Everything else uses the same point: the cork patch behind the card (`.ghost`), the pin hole (`top:13.8px`), and the physics (`pinPoint`, the unpin's `P.y = 14`).
  - Changing the pin artwork, its `top` or `--pin-left` means updating all of them together. Otherwise the pin slides across the cork whenever the paper swings. See the comment at the top of `lib/building/building.css`.
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

   Each script's header lists what it checks and its environment variables. They run in the isolated Chromium runner from `design/2026-09-motion/tools/shot-runner.mjs`:

   ```sh
   mkdir -p /tmp/fyshot && cd /tmp/fyshot && npm init -y >/dev/null && npm i playwright-core
   cp <repo>/design/2026-09-motion/tools/shot-runner.mjs /tmp/fyshot/run.mjs
   node /tmp/fyshot/run.mjs scripts/verify/vt-nav.mjs
   ```

7. After a content change, run `python3 .agents/skills/add-website-content/scripts/audit_content.py`.
