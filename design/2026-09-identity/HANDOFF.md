# Identity: handoff

Round 1 (`index.html`, `README.md`): three candidates. **Fred picked B 印, the seals**, with one change: "let 弗 be on one col and 雷德 on the other."

## Round 2 (`r2-board.html`)

- **The re-carve** (`r2-seal.js`, screenshot `r2-seal.png`): seal order, right column first: 弗 alone fills the right column (narrow, 30.5 of 100 units, knife 4.5), 雷 over 德 the left (51.3 units, knife 3.2). About 3.5 units of red to the stone's edge and between the columns. The FRED YANG seal, the written motto, the tilt of each impression, the pen states, the arrival and the accessible name are unchanged. At 66 px, 雷 and 德 read at 1×; 弗 reads fully at 2×, as texture at 1×.
- **(a) Reading's compact header: recommend the seal** (`r2-reading.png`: 390 light and dark, portrait then seal). Every other header carries it; the portrait is a 512 px drawing shrunk to 34 px and stays as the favicon. It is not ported yet: its own commit would swap Reading's `.brand-mark` `<img>` for `R2.mark('brand-mark', 'Fred Yang')` (one element in `Reading.dc.html`; `lib/reading/reading.css` already sizes `.brand-mark`).
- **(b) The status line on phones: recommend letting it sit beside the identity wherever it fits.** The header row's flex-wrap already does it, so no rule is needed: beside from 344 px on Writing and About, 328 on Building, 352 on Gallery; it wraps at 320 as today.
- Production is baked from `R2.link()` (`r2-seal.js`); `r2-identity.css` is the same block as the production rules.

## The port (branch `design/identity`, WIP commit)

Done:
- The lockup is in all 13 header copies (`index.html`, the four gateway pages, the eight `building/` pages) and the six `scripts/verify/vt-harness/` pages. 404.html has no header, so there was nothing to port there.
- `lib/shared/site-nav.css` identity rules replaced; `lib/shared/site.js` one `Tier.wire` line; `lib/home/desk.js` wires the identity with `Tier.wire`.
- `lib/home/identity.js` is new (the arrival after a first visit's OP; `FY_ID.seek` with `?opx=1`), imported from `lib/home/opener.js`.
- `assets/identity-sticker-*.png` deleted.
- Check scripts: `vt-nav.mjs` measures the drawn motto's height; `home-seq.mjs` runs on through the arrival; `home-rest.mjs` takes BEFORE/BASE and finds `#desk`; `home-net.mjs` comment.

Checks passed (branch served at `/after`, origin/main at `/before` on one port):
- vt-nav 250/250 (identity tag 11.02 px at 320)
- vt-moves 63/63
- vt-webkit 13/13
- pen-api 15/15
- pen-spacing: 351 underlines, 0 violations
- the identity's view-transition group changes transform and opacity only
- home-basic: no overflow, no /design/ requests
- home-rest + home-diff: 0.000 % desk difference
- no overflow at 320; the accessible name reads "Fred Yang, 弗雷德. 继续写，继续造: keep writing, keep making. Home"

Still to run, in order:
1. home-seq, then flash-audit on `seq-first-1440` and `seq-first-390` (the arrival is in the sequence now).
2. home-fail, home-geo, home-keys, home-live, home-nav, home-net, home-slow, home-webkit.
3. vt-lcp against origin/main.
4. Reading's seal, in its own commit, if Fred agrees with (a).
5. Remove "WIP" once all of that passes.

Open question for Fred: the seal on Reading, yes or no?
