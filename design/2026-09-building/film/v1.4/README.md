# The film · v1.4

v1.3 (`../v1.3/`, kept as it was) with Fred's six notes on it. From now on the film is 16:9 only.

| File | What | Length |
|---|---|---|
| `film-v1.4-promo.mp4` | part 1, the promo, alone: 1920×1080, 60 fps, H.264 yuv420p, AAC 48 kHz | 0:28.6 |
| `film-v1.4.mp4` | part 1 + part 2 (the before, one camera) | 0:52.5 (28.60 + 23.90) |
| `captions/index.html` | the three caption treatments, each on the same three real frames | |
| `TIMING.md` | every shot, ramp and caption on the film's clock, and part 2's shot list | |

## What changed, note by note

1. **"No replay, just slow down / speed up a transition."**
   - The three ⅓× replays and the ⅓× margin mark are gone.
   - The same three motions now slow down inside the running take (`ramp.js`): the desk → nav flight, #35's tabs, and the nav falling back into a desk. The take plays in real time into the motion, eases down to ⅓ through it, and eases back to real time.
   - **The speed curve.** Speed is continuous, with half-cosine eases, so even its slope has no step. The largest change from one frame to the next is 0.07 (flight), 0.12 (tabs) and 0.06 (home).
   - **True frames only.** The floor is ⅓ because those windows were shot at 180 fps: at ⅓, each 60 fps output frame is the next true frame, and above ⅓ it is a later one. Nothing is held, repeated or interpolated.
   - **Inside the motion.** Each ramp sits inside both the 180 fps window and the motion itself (read off the capture's frame differences), so no slow frame repeats a still page.
   - **The jumps.** The jumps between moments now keep both sheets playing, the one leaving and the one under it, so no footage is held there either.
   - **Sound.** The site's foley follows the ramped picture. Every sound is placed at its footage second's film time through the ramp, and a sound that lasts through a ramp is stretched to its length on screen: the flight's whoosh, the tabs' whoosh, and the gravity return's whoosh with its five landings.
   - **No speed label.** The ramps read as slow motion without one.
   - **Length.** The ramps cost less time than the replays did, so no dead time had to be sped up. The promo is 28.6 s.
2. **The captions, redesigned from scratch** (`caption.js`, compared in `captions/index.html`).
   - **Off the page.** The frame keeps a strip for the film's words, and the picture gets the rest. A caption can't overlap the action, and it never sits on the page. There is no pen, no slip and no coral.
   - **The treatment.** v1.4 uses **the ink band**: a 136 px ink strip under the picture, with the words reversed out of it in paper on one centred line. The Chinese is Noto Serif SC at 60 px, then a dot, then the English in Fraunces italic at 50 px.
   - **Why ink.** The gateway pages are light-only, so ink ground with reversed type is the one register the site never uses. At a 390 px feed width, the Chinese is about 12 px and the English about 10 px.
   - **Timing.** One caption shows at a time. Each is fully in before its motion starts (0.46–1.36 s before), still fully in after it ends (0.55–1.40 s after), and fully visible for 2.80–3.50 s.
   - **The words** are v1's `NOTES`, unchanged.
   - **Switching.** To use another treatment, set `TREATMENT` in `caption.js` (or add `?cap=column` or `?cap=slate` to the render's page), then re-render.
3. **"The 家/home is hard to recognize … not part of the website."**
   - The pen's chapter names (`CHAPTERS`) are gone from the film, and so are the slips and the ⅓× mark.
   - The film adds only its paper (the dossier, the sheets, the jumps), the hand, the caption strip and the last sheet. None of it sits on the page, and none of it is set in the site's handwriting.
4. **16:9 only.** v1.4 is 1920×1080 at 60 fps and has no 9:16 files. The 9:16 files of earlier versions are untouched.
5. **The peg.** The print shot holds one framing: the whole gallery page, its rope, the print's flight and the viewer, peg and all.
   - v1.1's close framing (h 780) cut off the viewer's top, which is where the peg lands (page y 14–73).
   - The peg is in frame on every frame from the click to the landing: frames 888–938, never nearer than 34 px to the picture's edge.
   - The caption is fully visible over all of those frames.
   - The peg's path was read off the capture by hand (`checks/space.py`) and checked on the rendered frames (`/tmp/fyfilm/v14-check/peg.png`).
6. **The baseline, credited** (`end.js`). The last sheet now sets two credit lines, a little larger than v1's single line:
   - 「在 Claude Design (Fable 5) + GPT-5.6-sol 完成的基线上改进」 / "Improved from the baseline built with Claude Design (Fable 5) + GPT-5.6-sol";
   - then 「用 Claude Opus 5.5 制作」 / "Made with Claude Opus 5.5".

   The last line lands 4.67 s into the card, and the card holds for 2.93 s after that. 继续写，继续造 and the seals are v1's, stroke for stroke and at the same times.

## Structure

- **Part 1, the promo** (`index.html` → `promo.js`, cut in `edl.js`). It uses v1.1's take (`take11-after`) and v1.1's route: the OP and the seals, the book and the desk → nav flight (ramped), the card into your hand and #35's tabs (ramped), the print peg and all, and home, where the nav falls back into a desk (ramped). Then the last sheet. It shows only the after.
- **Part 2, the before** (`part2.html` → `before.js`). It is v1.3's one take (`take13-before`), with v1.3's join, framings, put-back and clock.
  - It opens on the frame part 1 ends on, now v1.4's last sheet with both credit lines, and lands back on it.
  - 「#17 之前 · BEFORE」 keeps its words. It is now a caption in the same ink strip, fully in at 0.8 s as the pull uncovers the old site, and out as the last sheet comes back.
  - Its score is v1.3's without the stamp at the join, because the film's captions make no sound (`score2.py`).
- **Part 1's sound** (`score.py`) is v1.1's, with its foley moved through the ramps and a held note under each slow part in place of the replays' notes. Two small changes: the jumps get a quiet paper swish, and v1.1's cover sounds are gone. In v1.1's short cut, those cover sounds played over the OP although the dossier was already open.
- **Loudness.** v1.3's scheme: each part is set on its own with `kit/mux.py`'s two-pass loudnorm, part 1 at −16 LUFS and part 2 5 LU under it, then they are joined and encoded once. The promo alone carries the same normalized part 1 mix.

## Numbers

| | runtime | size | loudness (integrated) | LRA | true peak | 1–2 frame luma glitches | zero-diff frames inside the ramps |
|---|---|---|---|---|---|---|---|
| `film-v1.4-promo.mp4` | 0:28.6 (1,716 frames) | 5.9 MB | −16.0 LUFS | 6.2 LU | −2.2 dBTP | none | 0 / 0 / 0 |
| `film-v1.4.mp4` | 0:52.5 (1,716 + 1,434 frames) | 9.8 MB | −17.7 LUFS (part 1 −16.0 · part 2 −21.1) | 9.8 LU | −2.2 dBTP (part 2 −2.3) | none | 0 / 0 / 0 · 0 / 0 in part 2's pull and put-back |

| ramp | footage (s) | on screen | slowest | ease in | at ⅓ | ease out | largest speed change between frames |
|---|---|---|---|---|---|---|---|
| the desk → nav flight | 7.500–8.080 | frames 422–497, 1.27 s | ⅓ (47 frames) | 0.24 s | 0.78 s | 0.24 s | 0.072 |
| #35's tabs | 31.555–31.975 | frames 742–796, 0.92 s | ⅓ (34 frames) | 0.15 s | 0.56 s | 0.20 s | 0.116 |
| the nav falls back into a desk | 67.470–68.370 | frames 1079–1204, 2.10 s | ⅓ (90 frames) | 0.27 s | 1.50 s | 0.33 s | 0.064 |

- **Loudness.** loudnorm's dynamic mode lands part 1's wide-range mix about 0.5 LU under what it is asked for, so `finish.py` asks for −15.5 and the file measures −16.0. Part 2 is then scaled to exactly 5 LU under part 1 as measured, and reads 5.1 LU under in the file. The promo and part 1 of the combined file share the one normalized mix.
- **The tabs' ramp is the shortest** because the motion is: #35's flight lasts 0.39 s of footage, and all of the slow part has to fall inside it.

## Checks

All of these run on the finished files or on the frame map of the page that rendered them, from `design/2026-09-building/film`:

```sh
node v1.4/checks/probe.mjs index.html /tmp/fyfilm/v14-check/probe-promo.json   # every output frame: its footage frame, speed, camera
python3 v1.4/checks/framemap.py /tmp/fyfilm/v14-check/probe-promo.json          # 1: no footage repeats; each ramp's speeds
uv run --with numpy --with pillow python v1.4/checks/space.py /tmp/fyfilm/v14-check/probe-promo.json   # 2 and 4: captions, action boxes, the peg
uv run --with numpy --with pillow python v1.4/checks/sheets.py                  # 5, 7 and 8: contact sheets, the join, the ending
```

What they found on the files in this folder:

1. **Footage time.** On every sheet, footage time never repeats and never goes back: 0 of 1,716 frames. Each ramp uses 1–3 capture frames per output frame, never 0, and `kit/qa.py` finds no zero-diff frame inside any ramp. The speeds are in the table above.
   - **One exception:** the take ends at footage 70.2 s while the last pull is still under way, so its last frame stays on the leaving sheet for the final 29 frames (0.48 s) before the sheet is gone. v1.1 held the whole 1.4 s pull.
2. **Captions vs the action.** The strip occupies y 944–1080 and the picture y 0–944. Each shot's action box is the union of what changes in the capture over its motion, projected through the camera on every frame (page px):
   - desk: (56, 100)–(1224, 876);
   - tabs: #35's flight, (984, 304)–(1228, 680);
   - print: (280, 16)–(988, 952);
   - home: (52, 44)–(1228, 872).

   On every frame a caption is visible, the strip meets none of those boxes, and each box is whole in the picture on every one of its motion frames. The captions are fully visible for 3.08, 2.84, 2.80 and 3.50 s, and part 2's label for 20.4 s.
3. **No chapter names, no ⅓ mark.** v1.4 imports no `CHAPTERS`, `NOTES` positions or slips. The only text the film draws is in the strip and on the last sheet (`captions.png`, `ramps.png`).
4. **The peg.** It is inside the picture on every frame from the click to the landing, frames 888–938, and never nearer than 34 px to the edge. On the frames themselves: 890 shows it on the rope, 918 mid-flight, 938 landed (`peg.png`, `peg-crops.png`).
5. **The end card.** Both credit lines are on the card from 25.67 s, which is held 2.93 s after the last line lands (`endcard.png`).
6. **Loudness and glitches** are in the numbers above.
7. **The join and the ending.** Across the join, frames 1715 → 1716 differ by a mean absolute 0.020 on a 0–255 scale. `film-v1.4.mp4`'s last frame differs from the promo's by 0.58. Both are codec noise (`join.png`).

## How it's made

From `design/2026-09-building/film`, with the board's server on 4218 (the takes are already shot: `/tmp/fyfilm/cap/take11-after` and `take13-before`):

```sh
node kit/render.mjs v1.4 --page "index.html" --cues --out pictures/p1.mp4 && mv v1.4/cues.json v1.4/cues-promo.json
node kit/render.mjs v1.4 --page "part2.html" --cues --out pictures/p2.mp4 && mv v1.4/cues.json v1.4/cues-part2.json
uv run --with numpy python v1.4/finish.py
```

- **Another caption treatment.** Add `?cap=column` or `?cap=slate` to both pages above, or set `TREATMENT` in `caption.js`, then run the same three commands.
- **The caption board's frames** are `node kit/render.mjs v1.4 --page "index.html?cap=<treatment>" --stills 7.66,12.79,15.30`, saved as JPEG in `captions/`.
- **What's not committed.** `pictures/` (the crf 17 masters), `stills/` and `footage` (a link to `/tmp/fyfilm/cap`) are ignored.
