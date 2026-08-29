---
name: set-section-wip
description: Apply or remove this website's complete reusable work-in-progress treatment on an existing page section. Use when a request says “set section X to WIP,” “mark section X as WIP,” or asks for the peelable WIP sticker, pusher nudge motif, faded evidence background, or the same unfinished-state design used by the NJJoe casebook.
---

# Set Section to WIP

Treat “set section X to WIP” as a request for the whole established visual and interaction system, not for a text badge.

## Read the canonical implementation

Before editing, read `references/wip-sticker-standalone.html` completely. It is the portable, working reference and records the fixed behavior, customizable fields, CSS, markup, runtime, sharpness tuning, accessibility, fallback, and asset paths.

For a page already using the NJJoe casebook shell, also inspect these shared files rather than copying their code into the page:

- `assets/njjoe/casebook.css`: `.section--wip`, `.wip-evidence`, and the full `.wip-sticker-*` / `.wip-nudge` block.
- `assets/njjoe/casebook.js`: `initWipSticker()` and its helper functions.
- `assets/njjoe/vendor/sticker-forge/SOURCE.md`: vendored engine provenance and license notes. Do not edit the vendored bundle for a page treatment.
- `assets/wip-pusher-mask.png`: the shared pusher motif used inside the fallback sticker and beside the live sticker.

## Apply the complete treatment

Preserve the target section's existing content and evidence. WIP dims and blocks the evidence surface; it does not delete it, convert it into a claim, or imply that unfinished work succeeded.

1. Add `section--wip` to the target `.section`. This supplies the dashed unfinished-state boundary.
2. Wrap the section's evidence cards or equivalent visual proof in `.wip-evidence`. Keep the evidence container's native class inside it (for example, `.facts`). The shared NJJoe CSS applies its faded, desaturated, softened, and pointer-disabled state specifically to `.facts` / `.fact`. When the target uses another component, add equally scoped rules for that component instead of renaming it or assuming the fade is automatic.
3. Insert the canonical `.wip-sticker-shell` markup from the standalone reference as a sibling of the evidence container inside `.wip-evidence`. Keep all of these parts:
   - `<sticker-forge id="wip-sticker" class="wip-sticker-engine"></sticker-forge>`
   - the `aria-hidden` CSS fallback with `.wip-pusher`, `.wip-sticker-copy`, and permanent `WIP` label
   - the separate `.wip-nudge` pusher motif
   - `role="group"`, a truthful interaction `aria-label`, `data-wip-sticker-shell`, and optional `data-wip-status`
4. If a short status is useful, make it factual and present-tense, then use the same wording in `data-wip-status`, the shell's `aria-label`, and the fallback `<small>`. Omit both the data value and `<small>` for a plain WIP sticker. Never invent progress, results, an ETA, ownership, or launch state.
5. Ensure the page loads the shared stylesheet and `casebook.js`. Add the engine's `<link rel="modulepreload">` and the canonical `<noscript>` fallback override to the page `<head>` exactly as shown in the standalone reference. The fallback must remain hidden during ordinary loading; it appears only for no-JavaScript or engine failure. On a casebook page, use the shared absolute overlay layout in `casebook.css`; do not replace it with the standalone demo's relative, in-flow shell.

Do not simplify away the peel/reset interaction, pusher nudge, faded and pointer-disabled evidence surface, high-resolution SVG dimensions, interaction-hint recoloring, render-scale and texture-filter tuning, keyboard-only focus ring, reduced-motion behavior, or static fallback. Together they are the WIP design.

The current shared runtime supports one WIP sticker per page because it selects one shell and `#wip-sticker`. For multiple WIP sections on one page, first refactor the runtime to initialize every shell with unique element IDs; do not duplicate `id="wip-sticker"` or leave later stickers inert.

## Remove a WIP section or treatment

If the user asks to remove the whole section, remove that section's visible content and sticker markup. Preserve shared CSS, JavaScript, vendored code, the pusher asset, and `references/wip-sticker-standalone.html`; they are the reusable implementation.

Move page-level navigation or footer elements outside the removed section when they still belong to the page. Remove the page's module preload and `<noscript>` override only when no WIP sticker remains on that page. Do not remove the shared casebook stylesheet or runtime when the rest of the page still uses them.

## Verify

Serve the repository over HTTP and check the edited page at desktop and mobile widths.

For an applied WIP treatment, confirm that:

- the evidence is visibly faded and non-interactive while remaining legible in the DOM;
- the live sticker appears without a fallback flash, the pusher nudge sits against its left edge, and peeling resets on release;
- the static fallback works when the engine is unavailable, and reduced motion suppresses the repeating nudge;
- the status copy and accessible name match; and
- the console has no errors and all page, engine, and motif requests return HTTP 200.

For removal, confirm that the section heading, evidence, sticker, and status copy are absent; page navigation and footer still render; the engine is no longer requested when no WIP sticker remains; and the console has no errors.
