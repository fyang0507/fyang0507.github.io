# Before/after video

> **Renders removed 2026-10-01.** All three are gone: `fyang0507-redesign-before-after.mp4`, `fyang0507-redesign-30s-16x9.mp4` and `fyang0507-redesign-30s-9x16.mp4`. They are in git history at `deb66a6`. `poster.png`, the specs and the pipeline stay.

`fyang0507-redesign-before-after.mp4` puts the site as it was (commit `6237120`, `main` before the redesign) beside the motion redesign (`redesign/motion-revamp`): same viewport, same input, same moment on both sides. `poster.png` is a frame from it for the PR.

Every interaction is real input, driven headless: eased `page.mouse` paths on desk, CDP touch on phones. Both sides are recorded through a CDP screencast with real frame timestamps. Text is rendered as HTML (`chrome.html`) because the system ffmpeg has no `drawtext`.

## The 30 s cut

`fyang0507-redesign-30s-16x9.mp4` and `fyang0507-redesign-30s-9x16.mp4` are one montage from one spec (`spec-30.json`) in two layouts: wide puts the sides next to each other, tall puts one above the other with the headline between them (phones stay side by side in both). Nine beats on hard cuts, then the end card: the first six are one visit (home → Writing → Shooting → home), then Reading, About and the phone. Each beat's headline has one phrase underlined by the site's own pen (`pen.js`, seeded by its text, drawn on the pen's easing); slowed pieces say their speed. The labels credit both sides: before, Claude Design (Fable 5) + GPT-5.6-sol; after, Claude Opus 5.5.

## Regenerate

Needs both servers (the redesign on :4173, and on :4174 a read-only copy of the site before it: `git archive 6237120 | tar -x -C /tmp/fymain`, served from there), the headless runner from `HANDOFF.md` §9 (`/tmp/fyshot` with `playwright-core`, Chromium `chromium-1234`), and ffmpeg.

```sh
cd design/2026-09-motion/video
./record.sh                     # every scenario, before then after, one at a time (~10 min) → /tmp/fyvideo/rec
uv run --with pillow python check.py spec.json    # marks, late beats, errors, equal sides, old opener timing
node compose.mjs spec.json fyang0507-redesign-before-after.mp4    # scratch in /tmp/fyvideo/work
ffmpeg -ss 29.8 -i fyang0507-redesign-before-after.mp4 -frames:v 1 poster.png
node montage.mjs spec-30.json fyang0507-redesign-30s      # both layouts from the same recordings; LAYS=wide for one
```

`./record.sh 04 07` re-records only the scenarios whose names start with those prefixes. `ONLY=3,5 node compose.mjs …` rebuilds only those spec segments and reuses the rest from the work dir. Recordings run sequentially on purpose: two browsers recording at once compete for CPU and drop animation frames.

To check a segment before composing: `uv run --with pillow python sheet.py /tmp/fyvideo/rec/04-writing out.png 0.5` samples both sides at the same offsets from `start`.

## Files

| File | Role |
|---|---|
| `scenarios/NN-*.mjs` | One per segment. `export default async (page, ctx) => …`; `ctx.after` switches selectors where the two sites differ |
| `rec.mjs` | Records one scenario against one base URL. Adds `ctx.mark/at/move/drag/click/tap/swipe/box` |
| `overlay.js` | Recording-only pointer: an ink arrow on desk, a dot under each touch on phones. Injected by `rec.mjs`, never part of the site |
| `record.sh` | Runs every scenario on both sites |
| `compose.mjs` | Renders the chrome, cuts each side from `start` to `end`, lays them side by side at 1920×1080 60 fps, adds the replays, dips each segment through paper, joins them |
| `chrome.html` | Title cards, headers, BEFORE/AFTER labels, pane frames, bilingual captions, in the site's fonts and colours |
| `spec.json` | The cut: segment order, titles, per-beat captions, replays |
| `check.py` | Validates the recordings a spec uses; names any side to re-record |
| `sheet.py` | Contact sheet of both sides of a segment, for checking sync |
| `cut.mjs` | Shared by both composers: ffmpeg, colour tags, and cutting windows of a screencast to constant fps |
| `montage.mjs` | The 30 s cut: pieces `[t0, t1, rate]` per beat, both layouts, the pen's layers, the end card |
| `montage.html` | The 30 s cut's chrome (brand row, labels, headlines with the pen, speed tags, end card) |
| `spec-30.json` | The 30 s cut: beats, headlines, pieces, credits |
| `seed.mjs` | Recording-only seeded `Math.random`, so both Gallery pages hang the same prints and open the same one |

## Scenario conventions

- A fresh browser per recording, so sessionStorage starts empty: the opener plays in `02-arrive`. Scenarios that shouldn't show it set `fy-opener` in an init script.
- Settle, then `ctx.mark('start')`, then `await ctx.at(t)` before every beat with the same `t` on both sides, then `ctx.mark('end')`. The spec's beat times are the same `t`s, so captions change when the action does. `marks.json` records any beat that ran late.
- Pace for a person: eased moves, roughly 0.6–1 s after each effect lands.
- A spec `replay` repeats a window slowed down (optionally zoomed with `crop`) right after its segment, for moments that are too quick at full speed.
- Both Gallery pages shuffle their prints on every load. `06-gallery` and `09-between` seed `Math.random` (`seed.mjs`), so both sides hang the same prints in the same order, open the same one, and the Gallery `09-between` leaves from is the one `06-gallery` shows.
