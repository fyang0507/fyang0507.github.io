# The film · v1.5

v1.4 (`../v1.4/`, kept as it was) with Fred's two notes on it: "Other than these 2, all good." 16:9 only.

| File | What | Length |
|---|---|---|
| `film-v1.5-promo.mp4` | part 1, the promo, alone: 1920×1080, 60 fps, H.264 yuv420p, AAC 48 kHz | 0:37.6 |
| `film-v1.5.mp4` | part 1 + part 2 (the before, one camera) | 1:03.8 (37.65 + 26.10) |
| `film-v1.5-side-by-side.mp4` | the site before #17 on the left, the promo on the right, the same route, clicks on the same frames | 0:37.6 |
| `endcard/index.html` | the three end-card treatments, at full size and at 390 px wide | |
| `TIMING.md` | every shot, ramp and caption on the film's clock, and part 2's shot list | |

## Note 1: "the gallery didn't show the gradual appearing effect; the card page didn't show the flip and taking card out … no transitions between these two tabs. We can go beyond 30s a bit"

- **A second take.**
  - **Why.** take11-after has the develop, the print, the About tab and the pull, but not the flip.
  - **The take.** `take15-after` (`cap/scenarios/take-v15.mjs`), one session on origin/main at 75e9790 (#39), from the Building board on. The route: the shooting tab, the print out and back, the about tab, the card out of its sleeve and turned over, and home, with home at 180 fps.
  - **The recorder.** `cap/rec.mjs` takes `SITE=main75` to record on that snapshot.
  - **No skipped transitions.** None was skipped, and none was logged as an error.
- **The cut** (`edl.js`, `promo.js`). It is v1.4's to #35's tabs (take11), then the sheet pull, then take15 from 2.15 s to 16.95 s in one shot, with no jump. The shot plays:
  - the shooting tab's real move (frames 903–945) and the prints developing on their lines (945–1068);
  - the print unclipped with its peg and clipped back;
  - the real Shooting → About tab move (frames 1299–1347);
  - the card pulled out of its sleeve (1389–1446: the stick, the lip, the pop) and turned over to its night face (1545–1596);
  - home, with the nav falling back into a desk, ramped like v1.4's.
- **The framing.** One framing (h 1040) holds the gallery, the print and its peg, About and the card. Every motion's box is whole in the picture.
- **Captions.** Four captions in the same ink band, under the same rules:
  - 照片在绳上慢慢显影 · the prints develop on their lines;
  - 连夹子一起取下 · unclipped, peg and all (over the print going out and coming back);
  - 从封套里抽出，再翻过来 · out of its sleeve, then turned over;
  - 导航落回桌上 · the nav falls back into a desk.

  The About tab move itself has no caption: it runs between the print's caption and the card's.
- **Sound** (`score.py`). Take15's foley is read off its frames: the tab moves, the develop, the peg's bite and the rope, the sleeve, the lip and the pop, a flip of card, the pen for the radar the night face draws, and the gravity return through its ramp.
- **Length.** The promo runs 37.6 s, under the 38 s cap. It has no jump inside the second take, and the one framing means no camera moves to wait for.
- **Part 2** (`before.js`, `take15-before`, `cap/scenarios/before-v15.mjs`).
  - **The route.** 6237120 has an About page, reached the same way from its gallery's nav. The before take now goes from the print to the about tab (a hard cut to the old About, 19.6 s), then home, so the routes match.
  - **The take.** It is v1.3's take frame for frame up to the print (mean difference 0.0 at every frame checked), and runs 2.2 s longer.
  - **The sound.** Its bed's slow walk is spread over the longer take (`score2.py`).

## Note 2: "the last scene of tribute uses a very out-of-character font and size … Please change."

- **The site's register** (`end.js`, compared in `endcard/index.html`). The dossier's rule for writing on a sheet is "line-led: ruled entries, typed labels at the side, no boxes and no washes" (`lib/building/dossier.css`). About's specimen card sets its facts as ruled rows: an ink rule over the first row, hairlines between the rest, and a Chinese line over IBM Plex Mono.
- **Stamped facts** (Fred's pick from the board, and what v1.5 renders with). The dossier stamps a project's facts onto its sheet: thin boxes in IBM Plex Mono, the first in ink and tipped a degree, the rest in `--soft`. Each credit becomes one stamp under the lockup:
  - left-aligned and at regular weight;
  - the Chinese in Noto Serif SC, the English in Plex Mono, both in the stamp's colour;
  - at 390 px wide, the Chinese is about 9.4 px and the English about 7.6 px.

  Long lines break where the phrase does. On the last frame, both stamps are whole, 42 px under the seals and 91 px above the bottom of the picture.
- **The other two** are on the board: specimen fields (About's ruled rows, which I had recommended) and ruled entries (a line down each credit's left, the English in Fraunces).
- **Switching.** Set `ENDCARD` in `end.js` (now `'stamps'`), or add `?end=fields` / `?end=entries` to both pages, then re-render.
- **Unchanged.** The words, their order, the seals, 继续写，继续造 and the hold: the last line lands at 34.91 s and the card holds 2.73 s.

## The side-by-side (Fred's addition: "pairing it up with the prev version … no need to do the camera motion")

- **After** (right): the promo exactly as it is, with the same edit, camera, ramps and jumps (`cut.js` and `after.js`, the code the promo itself now runs on).
  - Its picture keeps the promo's own proportions (1920 × 944) scaled into a 920 × 452 panel, with no caption band and no captions.
  - **The refactor.** I moved the promo's cut and world out of `promo.js` into those two modules. The promo then re-rendered byte for byte identical: the same md5 for its master, `24b7fba3…`.
- **Before** (left): `take15-before` (6237120) on a still camera holding the whole page for the whole film (the promo's whole-page framing).
  - **Sync.** `sbs_sync.py` writes `sbs-sync.json`. Every click lands on the same frame as the promo's, and between clicks the before plays its own take in real time.
  - **Holds and the trim.** Where its gap is shorter it holds a frame: 0.9 s on the old field notes, 1.5 s on the old gallery, 0.2 s in the lightbox, and 3.95 s on the old About while the promo's card comes out and turns over. Where its gap is longer, 0.1 s is left out after the lightbox closes. Each falls at the last still moment before its hand starts for the next click.
  - **Jumps.** Where the promo jumps, the before jumps at the same instant with the same sheet pull, both its sheets held.
  - **Ramps.** While the promo ramps, the before plays on in real time.
- **The old About** is in it: the before reaches it on the about click and holds there.
  - The promo's card pull and flip have no partner, because the old About has nothing to pull or turn. That difference is the comparison.
- **Layout.**
  - Two panels of the same size on the dossier's kraft, each in an ink keyline, with a 40 px gutter between them.
  - Under each, off both pictures, a small label in the ink band's register: 「#17 之前 · BEFORE」 left, 「之后 · AFTER」 right.
  - Nothing else is written on either side.
- **The end.** As the promo's own last pull begins, the before panel is pulled aside to the left and the after panel opens out to the full frame. The film ends on v1.5's last sheet, full frame, with the same credits and hold.
- **Sound.** The promo's own mix, its AAC stream copied as it is. Nothing is added: the before's old site makes no sound.

| click | promo frame | before frame |
|---|---|---|
| the book | 416 | 416 |
| the lead card | 568 | 568 |
| Principles | 736 | 736 |
| the shooting tab | 900 | 900 |
| the print | 1110 | 1110 |
| the print closed | 1218 | 1218 |
| the about tab | 1296 | 1296 |
| the card pulled | 1386 | (the old About: held) |
| the card turned | 1530 | (the old About: held) |
| home | 1671 | 1671 |

- **No cropping.** The before page's corners stay inside its panel on all 1,815 frames before the end, never nearer than 28 px to the panel's edge. The after panel is the promo's whole picture, scaled.
- **Stills:** `/tmp/fyfilm/v15-check/sbs-book.png`, `sbs-print.png`, `sbs-about.png`, `sbs-end.png`.

## Numbers

| | runtime | size | loudness (integrated) | LRA | true peak | 1–2 frame luma glitches | zero-diff frames inside the ramps |
|---|---|---|---|---|---|---|---|
| `film-v1.5-promo.mp4` | 0:37.6 (2,259 frames) | 7.5 MB | −16.1 LUFS | 6.0 LU | −2.6 dBTP | none | 0 / 0 / 0 |
| `film-v1.5.mp4` | 1:03.8 (2,259 + 1,566 frames) | 11.7 MB | −17.5 LUFS (part 1 −16.1 · part 2 −21.1) | 9.3 LU | −2.6 dBTP (part 2 −2.8) | none | 0 / 0 / 0 · 0 / 0 in part 2's pull and put-back |
| `film-v1.5-side-by-side.mp4` | 0:37.6 (2,259 frames) | 4.2 MB | −16.1 LUFS (the promo's mix) | 6.0 LU | −2.6 dBTP | none | (the promo's ramps, on the right) |

| ramp | footage (s) | on screen | slowest | ease in | at ⅓ | ease out | largest speed change between frames |
|---|---|---|---|---|---|---|---|
| the desk → nav flight (take11) | 7.500–8.080 | frames 422–497, 1.27 s | ⅓ (47 frames) | 0.24 s | 0.78 s | 0.24 s | 0.072 |
| #35's tabs (take11) | 31.555–31.975 | frames 742–796, 0.92 s | ⅓ (34 frames) | 0.15 s | 0.56 s | 0.20 s | 0.116 |
| the nav falls back into a desk (take15) | 15.780–16.620 | frames 1679–1794, 1.93 s | ⅓ (81 frames) | 0.26 s | 1.35 s | 0.33 s | 0.068 |

- **Loudness.** loudnorm's dynamic mode lands part 1's wide-range mix under what it is asked for, by an amount that depends on the mix. `finish.py` therefore asks again with the shortfall added back, until the mix measures −16.0. The file then measures −16.1 after AAC. Part 2 is 5.0 LU under part 1.

## Checks

From `design/2026-09-building/film`:

```sh
node v1.5/checks/probe.mjs index.html /tmp/fyfilm/v15-check/probe-promo.json
python3 v1.5/checks/framemap.py /tmp/fyfilm/v15-check/probe-promo.json
uv run --with numpy --with pillow python v1.5/checks/space.py /tmp/fyfilm/v15-check/probe-promo.json
uv run --with numpy --with pillow python v1.5/checks/sheets.py /tmp/fyfilm/v15-check/probe-promo.json
```

1. **Footage time.** Footage never repeats or goes back on any sheet, within each take: 0 of 2,259 frames. Each ramp uses 1–3 capture frames per output frame and has no zero-diff frame.
   - **One exception:** take15 ends at 17.6 s while the last pull is under way, so its last frame stays on the leaving sheet for its final 44 frames (0.73 s) in view.
2. **Captions.** On every frame a caption is visible, the strip never meets its motion's box (all six), and each box is whole in the picture through its motion.
   - **Fully visible:** 3.08, 2.84, 3.60, 3.30, 3.50 and 3.50 s.
   - **In before the motion:** 0.25–1.36 s.
   - **Still in after it:** 0.05–0.61 s.
   - **Part 2's label:** fully visible from 0.8 s to the put-back.
3. **The peg.** It is inside the picture on every frame from the click to the landing (frames 1110–1181), never nearer than 76 px to the edge (`peg.png`, `peg-crops.png`: 1112 on the rope, 1140 in flight, 1181 landed).
4. **The develop** (`develop.png`). Antwerp, Hong Kong and Garden of the Gods, cropped from the film at frames 945, 966, 990, 1014, 1038 and 1068, go from the pale chemical green to full colour.
5. **The tab moves** (`tabmoves.png`). Building → Shooting (frames 903–945) and Shooting → About (1299–1347) both run: 29 and 21 frames in a row each change the picture, and the largest single step (4.3 and 8.4) sits between neighbours of 4.0 / 4.3 and 8.0 / 7.2. That is a curve, not a cut.
6. **The card** (`card.png`). In its sleeve 1389, the stick 1422, the lip and the pop 1446, in the hand 1488, turning 1545, the night face 1596.
7. **The end card** holds 2.73 s after the last line. The stamps are whole and clear of the seals (`endcard-stamps-full.png`, `endcard-stamps-390.png`, `endcard-stamps-landed.png`).
8. **The join.** Frames 2258 → 2259 differ by 0.031 (0–255), and the last frame differs from the promo's by 0.93: codec noise (`join.png`).

## How it's made

From `design/2026-09-building/film`, with the board's server on 4218 and `python3 -m http.server 4219 --bind 127.0.0.1 --directory /tmp/fyfilm` serving the snapshots (`main75` is `git archive 75e9790`, `r0` is 6237120):

```sh
SITE=main75 CURSOR=0 node cap/rec.mjs cap/scenarios/take-v15.mjs after /tmp/fyfilm/cap/take15-after
CURSOR=0 node cap/rec.mjs cap/scenarios/before-v15.mjs before /tmp/fyfilm/cap/take15-before
node kit/render.mjs v1.5 --page "index.html" --cues --out pictures/p1.mp4 && mv v1.5/cues.json v1.5/cues-promo.json
node kit/render.mjs v1.5 --page "part2.html" --cues --out pictures/p2.mp4 && mv v1.5/cues.json v1.5/cues-part2.json
uv run --with numpy python v1.5/finish.py
```

- **The side-by-side**, after the promo's render and finish:
  ```sh
  uv run --with numpy --with pillow python v1.5/sbs_sync.py
  node kit/render.mjs v1.5 --page "sbs.html" --out pictures/sbs.mp4
  uv run --with numpy python v1.5/sbs_finish.py
  node v1.5/checks/probe.mjs sbs.html /tmp/fyfilm/v15-check/probe-sbs.json && uv run --with numpy --with pillow python v1.5/checks/sbs.py /tmp/fyfilm/v15-check/probe-sbs.json
  ```
- **The end-card board's frames** are `node kit/render.mjs v1.5 --page "index.html?end=<treatment>" --stills 37.6`, saved in `endcard/` as JPEG and as 390 px PNG.
- **What's not committed.** `pictures/`, `stills/` and `footage` (a link to `/tmp/fyfilm/cap`) are ignored.
