# The film · v1

The whole film, from #17 on, as one real take of the site, one camera and one dossier:

| File | What | Length |
|---|---|---|
| `film-v1.mp4` | the film, 1920×1080, 60 fps, H.264 yuv420p, AAC 48 kHz (26.0 MB) | 1:28.2 |
| `film-30s-16x9.mp4` | the 30 s cut, 16:9 (7.4 MB) | 0:29.7 |
| `film-30s-9x16.mp4` | the 30 s cut, 9:16, 1080×1920 (6.8 MB) | 0:29.7 |
| `TIMING.md`, `TIMING-30s.md` | every shot, lift, replay, pen note and sound cue on the film's clock | |

Board: <http://127.0.0.1:4218/design/2026-09-building/film/>. It follows the critic's notes (`../rough/CRITIQUE.md`) and the coordinator's decisions on them. Where I judged differently, it's listed at the end.

## The capture: the site on a virtual clock (`../cap/`)

The rough cut's footage was a CDP screencast with wall-clock timestamps, resampled to 30 fps, and about one frame in six was a duplicate during motion. v1's footage is deterministic.

- **The clock.** `cap/vclock.js` is injected into every document before the site's own scripts.
  - `performance.now`, `Date`, `event.timeStamp`, timers, `requestIdleCallback` and `requestAnimationFrame` all run on a virtual clock. `Date` counts from a fixed epoch, so a hand-off stamped on one page reads the same on the next.
  - Every animation in `document.getAnimations()` is paused on sight and set to its virtual time. That covers CSS animations and transitions, WAAPI, and a view transition's pseudo-elements. One that appeared between two frames (a hover, a view transition) starts at the earlier frame, and its real `currentTime` is ignored.
  - At its end an animation is `finish()`ed, so its promises and events fire.
- **The recorder.** `cap/rec.mjs` sends real input: CDP mouse and wheel events at exact frame times. It moves the clock on by one frame, then screenshots at DPR 2.
  - A navigation holds the clock until the next document has committed, its fonts are in, its images above the fold are decoded and its view transition is ready. The network is effectively instant, so an arrival lands on the same frame on every run.
- **Frame rates.** Recorded at 60 fps, and at 180 fps inside the three replay windows, so ⅓× shows true frames.
- **Acceptance** (`cap/scenarios/t-flight.mjs`, `cap/diffs.py`, `cap/same.py`):
  - The desk → nav flight has 46 frames with no zero-diff frame (4.00–4.75 s).
  - Two runs are identical: 0 frames differ, the worst being 0.30 mean luma, which is JPEG noise.
  - The before side's hard cut and fade-and-rise are captured the same way.
- **Speed.** The whole take is 4,194 frames and took 86 s of wall time. begin-frame control (`HeadlessExperimental.beginFrame`) would have been the other route, but Chrome refuses it on macOS ("not supported on MacOS yet").
- **The take** (`cap/scenarios/take.mjs`) is one session and one visit, with real input throughout:
  - **Home:** the first visit's OP, then the book (the desk becomes the nav).
  - **Writing:** EN, and the latest essay pulled out.
  - **Reading:** the hero, a footnote, then back up to the nav.
  - **Building:** the tab move and the flower, one fling and back, the card into your hand, the dossier.
  - **Principles:** 03 and #35's tabs, the rail, down the chapter.
  - **The way back.**
  - **Shooting:** the develop, the fast pass, the print unclipped, peg and all, and back.
  - **About:** the sleeve with its lip catch, the tilt.
  - **Home:** the gravity return.
- **The before side.** It runs the same scenario on 6237120 at the same beats, and shoots only its seven lift windows.

## Structure: one take, one camera, one cut

| film | what |
|---|---|
| 0:00–0:01 | the closed dossier, 「改版 · The redesign」; the cover opens and the OP starts as it lands |
| 0:01–0:09 | the OP full-sheet (the one saturated moment); **lift 1**, the typeset lockup with its stickers under the page, at the lockup's zoom; the motto written and the seals stamped |
| 0:09–0:14 | the full desk held; **lift 2**, the old site's click and its hard cut (the one note 「以前：硬切」 before: a hard cut); the flight in real time, framed on the nav, then **×⅓** (「桌子变成了导航」) |
| 0:14–0:19 | Writing: the spines and the switch in one framing, EN retitles them; the latest essay pulled, its cover |
| 0:19 | **the match cut**: the cover's illustration and Reading's hero at the same place and scale (template-matched: 2.3×) |
| 0:19–0:29 | Reading: the hero dissolves, the title flies; a footnote's pen gesture and slip in close-up; back up to the nav |
| 0:29–0:36 | **lift 3**, the old Building tab's hard cut; the tab move with the board arriving; the flower pressed in close-up; the fling |
| 0:36–0:42 | **lift 4**, the old card's hard cut into the field notes; the pin pops, the card comes to your hand, the dossier slides out; 03: #35's tabs fly to the fore-edge, framed at full height, then **×⅓** (「标签跟着你走」) |
| 0:42–0:49 | the rail drawn, the loop down the rail through the chapter |
| 0:49–0:59 | **lift 5**, the old way back; the card brought into view, the tabs tucked, the pin pressed; the tab move to Gallery, the first line of prints developing; the fast pass |
| 0:59–1:13 | **lift 6**, the old dark lightbox; the print unclipped, peg and all (「连夹子一起取下」), and back on the rope; the tab move to About, the sleeve's lip catch in close-up, the tilt |
| 1:13–1:20 | **lift 7**, the old About's hard cut home; the nav falls back into a desk, then **×⅓** (「导航落回桌上」) |
| 1:20–1:28 | the take pulled aside to the left; the last sheet: 继续写，继续造 written with the lockup's own strokes, the seals stamped on cream, the credits by line, every line in `--ink` |

- **Continuity.** The camera never cuts but once, on the site's own same-tab move from Writing into Reading, and the film makes that a match cut. The replays rewind the take, marked by the pencilled ×⅓. The page lift is the sanctioned break, and the one end pull-aside quotes #35's chapter move.
- **The before.** Each lift comes just before the click, while the take waits under the page. The old site does the same click from its own take and shows its real hard cut. Then the page falls and the new site does it.
- **The page's underside.** It carries 「#17 之前 · BEFORE #17」, so the label is in frame whenever the before is. Tone is one short run of dots where the page leaves the one below. There's no dot field on the curl.
- **The film's chrome.** No film tabs and no hash labels. The pen writes each section's number and bilingual name once in the sheet's top margin: 01 家 home … 07 回家 home again. The five notes are in the hand (Muyao and Caveat) at the pen's weight, in ink, each on a small slip beside the motion, written on in 0.7 s on the hand's clock and lifted off by the next beat.
- **The end card's facts**, all from `gh pr list --state merged`: #17 merged 29 Sep 12:59; #18–#35 are 18 PRs, merged 29 Sep 16:04 → 30 Sep 10:21 (EDT). The CLS figure was checked against #34's body (0.061 → 0.001 and 0.074 → 0.000, NJJoe's pages at 1440). It was left off the card: the film doesn't show NJJoe.

## Sound

`score.py`, on the same cue list (`cues-v1.json`):
- **The arc.** A felt piano alone through home, Writing and Reading; a low string joins at Building; fullest through the Gallery and About; the piano again for the way home; the pen alone under the last sheet.
- **The bed.** Chords are held over two bars with changing voicings. Near-silences come before the OP's first cut, the flight, #35's tabs and the stamps.
- **The foley.** The site's own sounds come first. The lift's paper sits 8–10 dB under them, in four variants. The old site's hard cut ducks the bed 6 dB.
- **The end.** One clack per credit line, and the last note decays to −60 dB inside the last frame.

## QA

- **Glitches.** `kit/qa.py` flags one- or two-frame luma glitches: a frame, or two, unlike both neighbours while the neighbours agree. It found none in any of the three files. The rough cut's end-card glitch was a depth fight between the folder's layers; they are now separated, and the near plane moved out.
- **Replays.** Zero-diff frames inside the three ⅓× replays: 0, 0 and 1. The one is the gravity return's first frame, before its motion starts. The real-time flight has none.
- **Loudness** (EBU R128, after AAC):
  - `film-v1.mp4`: −17.0 LUFS integrated, LRA 10.2 LU (the rough cut was 2.3), true peak −2.0 dBTP;
  - the 30 s cuts: −16.6 LUFS, LRA 8.0 LU, −2.8 dBTP.
- **Near-silences** (the mix before normalising): the momentary loudness in the 0.7 s before the OP's first cut reaches −48 LUFS, and before the flight −71 LUFS. Before the stamps, 0.65 s of quiet follows the pen. The last note decays to −60 dB at the last frame.
- **The capture:** 0 frames differ between two runs of the flight, and none of its frames is a zero-diff.

## Differences from the critic

- **Depth layers (#4)** are not built. They were the stretch, and v1 came first.
- **DPR 3 close-ups** aren't there: everything is DPR 2. The seal close-up magnifies about 1.6× and the footnote about 1.1×. A region pass at `clip.scale` 1.5 is the next step if they read soft.
- **The lift is a 90 % curl, not a full flip**, so the flap and its underside label stay in frame.
- **The pen notes sit on small slips**, so the hand never writes over the page's own text.
- **Reading:** the take scrolls back to the page's head before the building tab, because Reading's compact header has no nav. That's 0.9 s the critic's route didn't count.
- **The before in EN:** no lift shows the old Reading, so the language question doesn't arise.
- **About:** the flip is dropped, per the coordinator, and the lip catch is framed close.
- **Seven chapter names**, one per section of the site, where the critic's example grouped them.

## Regenerate

```sh
# the sites on :4219 (main = origin/main, r0 = 6237120, see ../README.md), this checkout on :4218
cd design/2026-09-building/film
node cap/rec.mjs cap/scenarios/take.mjs after  /tmp/fyfilm/cap/take-after
node cap/rec.mjs cap/scenarios/take.mjs before /tmp/fyfilm/cap/take-before     # v1/footage → /tmp/fyfilm/cap
node kit/render.mjs v1 --w 1920 --page "index.html?w=1920" --cues --out picture.mp4
cp v1/cues.json v1/cues-v1.json && uv run --with numpy --with scipy python v1/score.py v1/cues-v1.json v1/mix.wav
python3 kit/mux.py v1/picture.mp4 v1/mix.wav v1/film-v1.mp4 && python3 v1/timing.py v1/cues-v1.json v1/TIMING.md
# the 30 s cuts: the same with ?cut=30s (and &ar=9x16 --w 1080 for the tall one)
```
