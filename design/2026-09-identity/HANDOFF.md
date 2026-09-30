# Identity: handoff

Round 1 (`index.html`, `README.md`): three candidates. **Fred picked B 印, the seals**, with one change: "let 弗 be on one col and 雷德 on the other."

## Round 2 (`r2-board.html`)

- **The re-carve** (`r2-seal.js`, screenshot `r2-seal.png`): seal order, right column first: 弗 alone fills the right column (narrow, 30.5 of 100 units, knife 4.5), 雷 over 德 the left (51.3 units, knife 3.2). About 3.5 units of red to the stone's edge and between the columns. The FRED YANG seal, the written motto, the tilt of each impression, the pen states, the arrival and the accessible name are unchanged. At 66 px, 雷 and 德 read at 1×; 弗 reads fully at 2×, as texture at 1×.
- **(a) Reading's compact header: recommend the seal** (`r2-reading.png`: 390 light and dark, portrait then seal). Every other header carries it; the portrait is a 512 px drawing shrunk to 34 px and stays as the favicon. It is not ported yet: its own commit would swap Reading's `.brand-mark` `<img>` for `R2.mark('brand-mark', 'Fred Yang')` (one element in `Reading.dc.html`; `lib/reading/reading.css` already sizes `.brand-mark`).
- **(b) The status line on phones: recommend letting it sit beside the identity wherever it fits.** The header row's flex-wrap already does it, so no rule is needed: beside from 344 px on Writing and About, 328 on Building, 352 on Gallery; it wraps at 320 as today.
- Production is baked from `R2.link()` (`r2-seal.js`); `r2-identity.css` is the same block as the production rules.

## Fred's reversal (after round 2, live)

Fred saw round 2's 弗 | 雷德 live and went back to round 1's carving: "I like the original 弗雷德 layout better after seeing it live." **The port ships round 1's white-text seal**, the classic 2 + 1 layout: 弗雷 down the right column, 德 the whole left (`01-b-seal.js`'s cuts). Everything else is as round 2 built it: the FRED YANG seal, the vertical motto, the sizes and spacing, the pen states, the arrival, the accessible name. The markup is `R2.link()` with only the white-text seal's cuts swapped for round 1's (`r2-seal.js` carries them verbatim as `ROUND1`, for `round1Mark()`). The r2 files stay as they are, as lineage of what was tried.

## The port (branch `design/identity`): verified

Rebased on main at 9bda459 (after #20–#26), and verified against it.

What ships:
- The lockup in all 13 header copies (`index.html`, the four gateway pages, the eight `building/` pages) and the six `scripts/verify/vt-harness/` pages. 404.html has no header.
- Reading's compact header: the white-text seal replaces the 34 px portrait (Fred, on (a): "for the seal: yes we can use that to replace"). It is `R2.mark('brand-mark', 'Fred Yang')` with round 1's cuts, baked into `Reading.dc.html`: a named image (`role="img"`, "Fred Yang"), not a link, as the portrait was not. The shared `.site-identity-seal` rules colour it, so in dark mode the cuts show the dark page (`#1E1913`) and the stone takes the dark palette's coral. Same box as the portrait (34 px, 30 px on phones); the nav row is unchanged (76 px at 1440, 62 px at 390 and 320). `favicon.png` stays the favicon; the portrait's `object-fit` is gone from `reading.css`. Screenshots: `reading-seal-{light,dark}-{1440,390}.png`.
- `lib/shared/site-nav.css`: the identity rules replaced. `lib/shared/site.js`: one `Tier.wire` line. `lib/home/desk.js`: wires home's identity with `Tier.wire`.
- `lib/home/identity.js`: the arrival after a first visit's OP (`FY_ID.seek` with `?opx=1`). `lib/home/opener.js` imports it dynamically, and only on a first visit or with `?opx=1`. Imported statically it was one more request in front of the OP's first frame: home's LCP (the OP's FRED) came 850 ms late at 1440 on the local server, and 136 ms late even with a modulepreload. The header is hidden for the whole opener, so the module can land at any time before the OP ends; landing after (a very slow link), it leaves the identity at rest.
- `assets/identity-sticker-*.png` deleted.
- No comment names CJK the pages don't render: 印 and 款 in two comments had put two unrendered glyphs into four font subsets. The subsets are byte-identical to main's.
- Checks: `vt-nav.mjs` measures the drawn motto's height; `home-seq.mjs` poses the arrival on the OP's clock from `opx:done` (it starts while the OP's tail is still settling) until its last frame, so the flash audit sees one timeline; `home-rest.mjs` takes BEFORE/BASE and finds `#desk`; `home-net.mjs`'s comment.
- (b) above ships as the header's flex-wrap gives it: on phones the status line sits beside the narrower lockup wherever it fits.

Checks, main (9bda459) → branch:

| suite | main | branch |
|---|---|---|
| flash-audit, first visit (the arrival included on the branch) | 1440 2.5 / 390 2.0 flashes/s, pass | the same maxima, pass |
| home-seq, home-basic, home-geo, home-keys, home-live, home-nav, home-webkit, home-fail, home-slow | pass | pass, the same results |
| home-net at 1440 | 53 requests, 951 KB of images | 52 requests, 944 KB |
| home-rest + home-diff | | 0.000 % of the desk differs |
| vt-lcp | | 12/12 (home 1276 → 1268 ms at 1440, 1260 → 1316 at 390) |
| vt-nav | 250/250 | 250/250 (motto 12.6 px at 1440, 11.02 px on phones) |
| vt-moves, vt-webkit, vt-webkit-mount | 63/63, 13/13, 23/23 | 63/63, 13/13, 23/23 |
| pen-api, pen-spacing | 18/18; 221 underlines, 0 violations | 18/18; 231 underlines, 0 violations |
| writing-lang | pass | pass |
| reading-matrix, reading-webkit, reading-hero, reading-rail (with Reading's seal) | 122, 12, 37, 79 pass | 122, 12, 37, 79 pass |

On main, the old header's 弗雷德 made the fred-agent pages request a DingTalk file their stylesheet names but was never shipped (15 of vt-nav's 18 404s); the drawn lockup no longer does.

Known, fixed elsewhere: on phones (390, vt-lcp's Fast 4G and 4× CPU) the new header changes when things land, and two races that already exist in the pages now fire more often. Gallery's chips re-wrap a row when Fraunces arrives after they mount: max CLS 0.002 → 0.070, in 4 of 9 loads (main hits it too, about 1 load in 10). Writing's shelf mount pushes "fig.01" below the fold, and when a font swap lands in the same frame the shift scores 0.108 instead of 0.018: 1 load in 9 on the final run, up to 3 in 7 on others. Writing's LCP at 390 is 788 → 828 ms, the edge of vt-lcp's 40 ms noise. Every variant of the new identity measured (without its SVG paths, without its pen wiring, wired at idle, with its status wrapped, with the old header's faces warmed) keeps the races; only the old header or no identity at all avoids them, and the old stickers were what made Writing paint ~35 ms sooner. The fix belongs to the pages (reserve Writing's shelf before it mounts, keep Gallery's chips from re-wrapping on the font swap), and a separate PR on main makes it; this branch rebases onto it.

