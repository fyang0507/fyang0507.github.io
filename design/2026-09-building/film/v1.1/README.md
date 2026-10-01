# The film · v1.1

v1 (`../v1/`, kept as it was) with the coordinator's v1.1 list, on a take re-recorded on main at 321ee2c (Demos, #37, merged).

| File | What | Length |
|---|---|---|
| `film-v1.1.mp4` | the film, 1920×1080, 60 fps, H.264 yuv420p, AAC 48 kHz | 1:35.9 |
| `film-30s-16x9.mp4`, `film-30s-9x16.mp4` | the 30 s cuts, re-rendered with the new hand (Demos stays out of them) | 0:29.7 |
| `TIMING.md`, `TIMING-30s.md` | every shot, lift, replay, note and cue on the film's clock | |

## What changed from v1

1. **Demos, in the Building chapter**, after Principles and before the way back (`cap/scenarios/take-v11.mjs`):
   - **The move.** The rail and the loop run down the chapter, then the fore-edge's **05 demos**: #35's chapter move, with the sheet in front pulled aside.
   - **The region.** On Fig. 02 (Trash Patrol) the capture's own token for region 1 is noticed, and the pen marks its four corners in coral. It is chosen, and the enlargement grows out of the region's own place over the capture, with its note beside it.
   - **The step and the put-back.** **N →** pans to region 2, whose note slides in. **put it back · 放回** reverses the opening and lands on the capture pixel for pixel.
   - **Timing and framing.** About 4.5 s of the viewer, with the camera close on the enlargement from before it opens until after it has landed.
   - **The way back.** Back up to the nav and its building tab: from a project's page any link to the board is the way back, because `transitions.js` hands it to FYProject. Since #36 the chapter's own "← Building board" sits at the sheet's end.
   - **The cost.** The take is 7.7 s longer from the way back on, and the rest of the cut is v1's, moved with it (`edl.js` derives it from `../v1/edl.js`).
2. **The hand.**
   - **The film draws it.** The page shows no cursor (the take is recorded with `CURSOR=0`). The recorder writes the pointer's position and state beside every frame, plus every press. `hand.js` draws a small ink cursor at the pen's weight, about 22 px tall on a 1080 frame at every zoom, with the site's three impact ticks for 180 ms after each press.
   - **Whose hand.** While the page is lifted, the hand is the before's own, from its own take.
   - **What it fixes.** In v1 the in-page arrow was magnified with the page, and in the footnote close-up it covered the footnote.
3. **True DPR 2, and DPR 3 close-ups.**
   - **Erratum for v1.** v1's footage turned out to be 1280 × 1000. `Page.captureScreenshot` returns CSS pixels unless its clip asks for a scale, whatever the context's deviceScaleFactor.
   - **The fix.** The recorder now clips the viewport at the scroll position with `scale: DPR`, so every frame of v1.1 is 2560 × 2000.
   - **The close-ups.** The seal and the footnote are also shot as a region at scale 3, for example a 2520 × 1440 crop of the footnote's 840 × 480 CSS px. `hand.js` lays each crop exactly over its own place on the sheet, so those close-ups magnify true pixels. The crop is off during a lift, because it can't curl with the page.
4. **Depth on the card leaving the board: not built.** Why:
   - **Time.** v1.1's time went first to the three items above and to re-recording the whole take on main.
   - **The move isn't one element.** The unpin moves the card into your hand while the dossier slides out from under it, and #35's rule is that whatever sits over a tab at rest sits over it in every frame. A clean two-pass split (the page without the card, and the card alone on transparent ground) needs per-element hiding for the card, its pin, the paperclip and the dossier's sheet. Then the composite has to be checked against the single pass frame by frame.
   - **The risk.** A z-lift that gets that layering wrong wouldn't read as the same paper world, and the virtual clock would make the error reproducible, not absent. The method is ready for it: the take is deterministic, so a second pass of the same window matches frame for frame.

Everything else is v1's: the one take, the one camera with its match cut, the seven lifts before the action, the three ⅓× replays from 180 fps frames, the pen's names and notes, the end card with verified facts, and the score's arc (with Demos' sounds added: the chapter move, the pen's corners, the enlargement, the step, the put-back).

## Numbers

| | runtime | size | loudness (integrated) | LRA | true peak | 1–2 frame luma glitches | zero-diff frames in the motion windows |
|---|---|---|---|---|---|---|---|
| `film-v1.1.mp4` | 1:35.9 | 28.1 MB | −17.0 LUFS | 10.1 LU | −2.4 dBTP | none | 0 / 0 / 1 in the three ⅓× replays |
| `film-30s-16x9.mp4` | 0:29.7 | 7.4 MB | −16.3 LUFS | 8.1 LU | −2.8 dBTP | none | 0 / 0 / 1 |
| `film-30s-9x16.mp4` | 0:29.7 | 6.9 MB | −16.3 LUFS | 8.1 LU | −2.8 dBTP | none | 0 / 0 / 1 |

- **The one zero-diff frame** in each file is the gravity return replay's first frame, before its motion starts.
- **The footage itself** (`cap/diffs.py` on the after take) has no zero-diff frame inside the real motion:
  - the desk → nav flight, 7.50–8.05 s;
  - #35's tabs, 31.62–31.90;
  - Demos' enlargement, 41.12–41.35;
  - its step, 42.42–42.65;
  - its put-back, 43.62–43.85;
  - the gravity return, 67.46–68.30.
- **The long film's mux** asks loudnorm for −3.9 dBTP (`TP=-3.9 python3 kit/mux.py …`). At the default −3.2 it landed at −1.0 dBTP after AAC.

**One race the virtual clock doesn't remove.** In 2 of 4 runs of the after take, the site skipped the view transition from the dossier in your hand into Principles, and #35's flight became a hard cut. Chrome reports it as `Transition was skipped`. The clock fixes every animation's time, but whether Chrome keeps a cross-document transition still depends on real-time work between the pages. The recorder now treats that error as a failed take: it warns and exits non-zero. v1.1 uses a clean run (`take11-after`); the skipped one is kept aside as `take11-skipped`.

## Regenerate

```sh
# the sites on :4219 (main = origin/main at 321ee2c, r0 = 6237120), this checkout on :4218
cd design/2026-09-building/film
CURSOR=0 node cap/rec.mjs cap/scenarios/take-v11.mjs after  /tmp/fyfilm/cap/take11-after
CURSOR=0 node cap/rec.mjs cap/scenarios/take-v11.mjs before /tmp/fyfilm/cap/take11-before
node kit/render.mjs v1.1 --w 1920 --page "index.html?w=1920" --cues --out picture.mp4 && cp v1.1/cues.json v1.1/cues-v1.1.json
node kit/render.mjs v1.1 --w 1920 --page "index.html?w=1920&cut=30s" --cues --out picture-30s-16x9.mp4 && cp v1.1/cues.json v1.1/cues-30s-16x9.json
node kit/render.mjs v1.1 --w 1080 --ar 9x16 --page "index.html?w=1080&ar=9x16&cut=30s" --cues --out picture-30s-9x16.mp4 && cp v1.1/cues.json v1.1/cues-30s-9x16.json
python3 v1.1/finish.py      # then, for the long film: TP=-3.9 python3 kit/mux.py /tmp/fyfilm/film-v1.1.mp4.enc.mp4 /tmp/fyfilm/film-v1.1.mp4.wav v1.1/film-v1.1.mp4
```
