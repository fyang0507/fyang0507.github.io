# The film · v1.3

Fred's call on v1.2's 30 s cut, which interleaved the comparison: "maybe we do this: 30s promo as 1.1 (show complete 'after'), then append another one camera for before. Depends on viewer whether they want to see the comparison, or just watch the promo video itself."

So v1.3 is two parts:
- **Part 1** is v1.1's 30 s cut, unchanged: the complete "after", with no lifts or stamps in it. It stands alone as the promo, and a viewer can stop at its end card.
- **Part 2** is appended after it: the site before #17 (6237120), as one camera, walking part 1's route.

v1 to v1.2 are kept as they were. The long film stays v1.2.

| File | What | Length |
|---|---|---|
| `film-v1.3-16x9.mp4` | part 1 + part 2 | 0:53.6 (29.67 + 23.90) |
| `film-v1.3-9x16.mp4` | the same, with part 2 reframed shot by shot for 9:16 (1080×1920), not cropped | 0:53.6 |
| `film-v1.3-part1-16x9.mp4` | part 1 alone: v1.1's `film-30s-16x9.mp4`, byte for byte | 0:29.7 |
| `film-v1.3-part1-9x16.mp4` | part 1 alone: v1.1's `film-30s-9x16.mp4`, byte for byte | 0:29.7 |

## Part 2: the before, one camera

- **One take.** It is one continuous session on 6237120, in real time (`cap/scenarios/before-v13.mjs`). The route: home on a first visit, the book, Writing, the building tab, the board's lead card, the field notes and their Principles, the shooting tab, a print into the lightbox and out, and home again. There are no replays, pen notes or lifts.
- **The capture.** It was shot on the virtual clock at true DPR 2 (2560×2000 frames) with `CURSOR=0`, so the page shows no cursor. The film draws its own ink hand from the pointer track, as in part 1, with the three impact ticks on every press.
- **The same framings.** Part 2 uses part 1's framings for the same beats (`v13.js`, `FR`):
  - the whole page;
  - close on the lockup, where part 1's seals are stamped;
  - the nav, where part 1's desk lands;
  - the lead card;
  - the dossier's place;
  - the chapter links, where #35's tabs fly;
  - the print;
  - home.
  Anyone who keeps watching sees the same clicks land as hard cuts. Where the old page puts a target elsewhere, the framing moves to keep it in view. In the tall frame, the home link sits at x 122, outside part 1's framing.
- **The route sets the length.** Part 2 runs 23.9 s rather than 20. The old home's own loading screen and iris take 3.5 s of it, and the extra hard cut at Principles is where part 1 has #35's tabs.
- **The shot list** is in `TIMING-part2.md`.

## The join (1.3 s) and the label

- **The same frame.** Part 2 opens on the same frame part 1 ends on: the last sheet, the seals and the credit. Across the join, frames 1779 → 1780 differ by a mean absolute 0.015 (16:9) and 0.03 (9:16) on a 0–255 scale, which is codec noise.
- **The turn.** The last sheet is pulled aside to the left, the film's jump (#35's chapter move). Under it, the site before #17 is already loading on its own sheet. The camera travels to the whole page by 1.3 s.
- **The label.** 「#17 之前 · BEFORE」 is stamped once in the take's top margin at 0.8 s, when the pull uncovers it. It is ink in an ink outline, with the paper pressed for two frames. It stays in the margin for the whole of part 2.
  - It reads at about 31 px on a 1080 frame and about 44 px on the 9:16 frame's 1920.
  - In 16:9 it is in every whole framing. In 9:16 it is in nearly every framing.
  - Every close framing keeps it either whole or out of frame, never cut.
- **No hashes or PR numbers.** The label is the only text the film adds in part 2, and nothing in part 2's frames shows a commit hash or a PR number. The folder's cover label, which does, faces away the whole time.

## The end

- **The put-back.** The last sheet is put back from the left, over the take: a chapter before this one, as the site puts back an earlier chapter. It moves on a spring with one small overshoot, from just outside the frame's left edge.
- **The landing.** The camera returns to part 1's end framing, and the film ends on part 1's last frame (mean difference 0.8 from v1.1's last frame, which is codec noise).
- **The hand.** The film's hand leaves when the sheet starts back.

## Sound

- **The bed** (`score.py`). Part 2 has a quieter, sparser bed in part 1's key. It is a felt piano alone, one note or one open fifth at a time, 2.8 s apart, walking down part 1's four chords. There is no string, no marimba and no chord stack, and no near-silences, because nothing in part 2 builds.
- **The clicks.** The old site made no sound of its own, so the only sounds over it are the input:
  - a dry click under every press;
  - the same plain snap at every hard cut and at the lightbox.
- **The film's paper.** The pull and the stamp at the join, and the put-back at the end, with the tonic left to ring out inside the film.
- **Loudness, per part.** Each part is set on its own with `kit/mux.py`'s two-pass loudnorm, then the two are joined and encoded once:
  - Part 1 is set exactly as v1.1 set it: −16.3 LUFS, −2.8 dBTP, measured in the file. Its sound is v1.1's.
  - Part 2 is set 5 LU under part 1, so the difference is felt: −21.5 LUFS, −2.4 dBTP.
  - The whole file therefore measures −18.1 LUFS integrated.
  - Normalizing the whole file to −16 would have meant raising part 1 by about 2 dB and limiting its peaks, which would no longer be v1.1's part 1.

## Numbers

| | runtime | size | loudness (integrated) | LRA | true peak | 1–2 frame luma glitches | zero-diff frames in the motion windows |
|---|---|---|---|---|---|---|---|
| `film-v1.3-16x9.mp4` | 0:53.6 | 11.6 MB | −18.1 LUFS (part 1 −16.3 · part 2 −21.5) | 9.8 LU | −2.3 dBTP | none | 0 / 0 / 1 in part 1's three ⅓× replays · 0 / 0 in part 2's pull and put-back |
| `film-v1.3-9x16.mp4` | 0:53.6 | 10.7 MB | −18.1 LUFS (part 1 −16.3 · part 2 −21.5) | 9.8 LU | −2.3 dBTP | none | 0 / 0 / 0 · 0 / 0 |
| `film-v1.3-part1-16x9.mp4` | 0:29.7 | 7.4 MB | −16.3 LUFS | 8.1 LU | −2.8 dBTP | none | 0 / 0 / 1 (v1.1's) |
| `film-v1.3-part1-9x16.mp4` | 0:29.7 | 6.9 MB | −16.3 LUFS | 8.1 LU | −2.8 dBTP | none | 0 / 0 / 1 (v1.1's) |

- **The one zero-diff frame** is the gravity return replay's first frame, before its motion starts, as in v1.1.
- **Part 2's take.** 1,260 frames at DPR 2, with no skipped transitions (the old site has none to skip).
- **The one error the page logged** is a 404 for `assets/fred-agent/fonts/DingTalkJinBuTi.woff2`. The old field notes' stylesheet asks for that file, which did not exist at 6237120, so the old page fell back to another font then too.

## How it's made

From `design/2026-09-building/film`, with `python3 -m http.server 4219 --bind 127.0.0.1 --directory /tmp/fyfilm` serving the snapshots (`/tmp/fyfilm/r0` is 6237120) and the board's server on 4218:

```sh
CURSOR=0 node cap/rec.mjs cap/scenarios/before-v13.mjs before /tmp/fyfilm/cap/take13-before
node kit/render.mjs v1.3 --page "index.html" --cues --out pictures/p2-16x9.mp4 && mv v1.3/cues.json v1.3/cues-part2.json
node kit/render.mjs v1.3 --page "index.html?ar=9x16&w=1080" --w 1080 --ar 9x16 --out pictures/p2-9x16.mp4
node kit/render.mjs v1.3 --page "part1.html?cut=30s" --out pictures/p1-16x9.mp4
node kit/render.mjs v1.3 --page "part1.html?cut=30s&ar=9x16&w=1080" --w 1080 --ar 9x16 --out pictures/p1-9x16.mp4
uv run --with numpy python v1.3/finish.py
python3 v1.3/shots.py
```

- **Part 1's picture in the combined file.** `part1.html` is v1.1's own page (`../v1.1/v11.js`), rendered again from v1.1's take. It matches v1.1's file to codec noise (mean difference 0.3–1.2 per frame). The combined picture is encoded once, at v1.1's settings.
- **What's not committed.** `pictures/` (the crf 17 masters) and `footage` (a link to `/tmp/fyfilm/cap`) are ignored.
