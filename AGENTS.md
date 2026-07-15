# AGENTS.md

## Repository overview

This is a dependency-free static personal website exported as standalone `.dc.html` pages. There is no package manager, build step, or framework source in this repository.

- Entry page: `index.html`
- Shared browser runtime: `support.js`
- Gallery image-slot runtime: `image-slot.js`
- Local fonts: `fonts/`
- Illustrations and decorative images: `assets/`

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
- Do not hand-edit `support.js`; it is generated runtime code. Treat `image-slot.js` as vendored runtime code unless the image-slot behavior itself is the task.
- Preserve relative URLs so the site works from a simple local server and static hosting.
- Preserve bilingual markup: English and Chinese variants use `.en` and `.zh`. The default language is Chinese and is stored under `fy-lang` in `localStorage`.
- Preserve paired light/dark artwork classes (`.im-l` and `.im-d`) when changing illustrated elements.
- Keep interactive illustration hotspots as semantic anchors with an `href` and an accessible `aria-label`. Their position is controlled by inline percentage geometry.
- Keep `index.html` as the root entry point. If that convention changes, update every inbound home link in the same change.

## Verification

After a change:

1. Serve the repository locally.
2. Load the home page and check the browser console for errors.
3. Verify the edited page at desktop and mobile widths when layout or navigation changed.
4. For home navigation changes, hover and click the laptop, book, portrait, and camera, confirming all four destination URLs.
5. Confirm edited asset and page requests return HTTP 200.
