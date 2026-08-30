# AGENTS.md

## Repository overview

This is a dependency-free static personal website exported as standalone `.dc.html` pages. There is no package manager, build step, or framework source in this repository.

- Entry page: `index.html`
- Shared browser runtime: `support.js`
- Gallery image-slot runtime: `image-slot.js`
- Local fonts: `fonts/`
- Illustrations and decorative images: `assets/`
- Imported essays and gallery metadata: `content/`
- Imported photography, covers, and profile images: `images/`
- Dependency-free content manifest generator: `scripts/generate-content.py`
- Web-sized image generator: `scripts/generate-derivatives.py`
- Full-resolution originals (archive, never served): `images/gallery/`, `images/blog/covers/`
- Generated images that pages actually load: `images/derived/`

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

When changing a home destination, keep the desktop annotation, object hotspot, and mobile navigation link in sync.

## Editing conventions

- Edit page content and page-specific CSS/logic in the relevant `.dc.html` file.
- Edit imported essay bodies in `content/posts/*.md` and gallery metadata in `content/photos-source.ts`. When media changed, run `python3 scripts/generate-derivatives.py` first, then `python3 scripts/generate-content.py`; commit the generated `content/posts.js`, `content/photos.js`, `content/image-dimensions.json`, and `images/derived/` files.
- Add photos and covers at full resolution and never hand-resize them. Pages load only `images/derived/`; serving the originals cost 51 MB and a 54-second load on the gallery before this split existed. Size ladders live in `scripts/generate-content.py`; changing one requires `generate-derivatives.py --force --prune`. Because `.github/workflows/deploy-pages.yml` deletes `scripts/` before deploying, derivatives are built locally and committed, never in CI.
- Do not hand-edit `support.js`; it is generated runtime code. Treat `image-slot.js` as vendored runtime code unless the image-slot behavior itself is the task.
- Preserve relative URLs so the site works from a simple local server and static hosting.
- Gateway pages present Chinese and English together where both are available; English-only interface text is acceptable, but Chinese-only interface text is not. `Reading.dc.html` is the only page with a CN/EN switch, using `.en` / `.zh` variants and the `fy-lang` preference in `localStorage`.
- Treat newlines in `content/posts/*.md` literally: one source newline becomes one rendered line break and repeated newlines remain repeated line breaks. Do not use Markdown trailing spaces as a separate hard-break convention.
- Gateway pages are light-only. `Reading.dc.html` is the only page with dark mode and may use paired light/dark navigation artwork; do not add theme switching or dark artwork to other pages.
- Keep interactive illustration hotspots as semantic anchors with an `href` and an accessible `aria-label`. Their position is controlled by inline percentage geometry.
- Keep `index.html` as the root entry point. If that convention changes, update every inbound home link in the same change.
- When a request says to “set section X to WIP,” “mark section X as WIP,” or otherwise apply the site's WIP treatment, use `.agents/skills/set-section-wip/SKILL.md`. “WIP” means the complete reusable treatment—peelable sticker, pusher nudge motif, faded and disabled evidence surface, static fallback, accessibility, and responsive behavior—not merely a label or badge.
- `Building.dc.html`'s project cards are pinned to the corkboard; their `--tilt` rotation must pivot on the pin's real anchor point (`transform-origin: var(--pin-left) 14px` on `.project-card` and `.card-slot`), not a generic origin like `50% 10%` — otherwise the pin visibly slides across the board whenever `--tilt` changes (e.g. on hover). See the comments above those two rules before changing pin geometry or tilt values.

## Verification

After a change:

1. Serve the repository locally.
2. Load the home page and check the browser console for errors.
3. Verify the edited page at desktop and mobile widths when layout or navigation changed.
4. For home navigation changes, hover and click the laptop, book, portrait, and camera, confirming all four destination URLs.
5. Confirm edited asset and page requests return HTTP 200.
