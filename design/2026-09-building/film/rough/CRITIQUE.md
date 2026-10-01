# Critique of the rough cut (2:07)

The film critic's notes on `rough-cut.mp4`, relayed by the orchestrator on 2026-09-30. Timestamps are film time.

Method: contact sheets at 2 fps, full-rate strips of every hero motion, frame-to-frame luma diffs of the film and of the raw footage in /tmp/fyfilm/footage, ebur128, silencedetect, spectrograms, and onset checks against cues.json.

## Verdict

The foundation is honest and strong: both sites were recorded live with the same real input, synced by beat, inside the site's own dossier. But the current cut reads as a well-mounted screen recording rather than code-rendered film craft. The camera is a flat 2D pan and zoom over flat footage, and it shoots the site's motion too wide and too fast to thrill. The before device compares rest states, which on this site look alike, instead of the thing that actually changed: motion. Several lifts even cover the motion they are meant to set off. Fix the before device, the scale of the motion and the capture method, then cut to about 95 s as one take, and it can reach the bar.

## Top 10, ranked

### 1. The before device compares stills, not motion. Lift before the action, not after it.

- The problem: all 17 lifts come about 1 s after the action and show the old site at rest. The pre-#17 site already had the same header, the nav icons, the Writing page, a cork board, the Fred Agent card and the About specimen card, so at rest the two look alike: 0:15.05 Writing, 0:45.27 and 0:52.67 the board, 1:02.67 Principles, 1:35.17 About.
- 1:46.07 shows no difference at all: the old About card flips to the same dark 见证者 WITNESS face.
- Two lifts hide the new motion:
  - 0:45.27 covers the board's arrival and the flower's first press (the flower is already on at 0:46.5).
  - 1:20.17 lands on the prints developing (the develop runs 1:19.4–1:20.2 while the camera is still up on the nav). Fred picked the clotheslines as a key moment, and the develop is never seen.
- 0:30.2 and 0:38.2 show the old Reading in Chinese against an English "after", so they read as a language change. At 0:38.2 the camera is so close that no flap and no label are in frame: it reads as a jump cut to Chinese text.
- The fix: at the click beat, freeze the after (it is under the flap anyway). Lift the page (a 0.3 s spring). Play the old site's same click with its real hard cut (0.8–1.0 s). Drop the page (0.3 s). Then play the after's click with its motion. The comparison becomes "click → cut" against "click → flight", which is exactly what Fred said the tests lacked.
- Keep 7 lifts:
  - the seals (the typeset lockup simply there, then the motto written and stamped);
  - the desk → nav flight;
  - the Building tab;
  - the card (before: a hard cut into the old field notes; after: the pin pops and the dossier slides out);
  - the way back;
  - the print (the dark lightbox against the peg);
  - home (the gravity return).
- Cut the other 10. Switch the before to EN on the same beat as the after.

### 2. The motion is too small and too fast. The camera frames pages, not motions.

- The desk → nav flight (0:14.0–14.6) lasts 0.6 s with the whole desk in frame, and the tabs it lands in are about 40 px wide at 720p.
- The #35 tabs (1:00.2–1:00.6) fly in about 0.4 s. They are about 15 px tall on the right edge, and the camera starts zooming out at 1:00.4, mid-flight.
- The Building tab move (0:44.4–45.1) is framed on the nav, so the board arrives cropped.
- The footnote's pen bracket and loop (0:36) are about 20 px, under a large OS cursor. The pin press (1:12.3) is shot at full page. The gravity return (1:51.7–1:52.3) lasts 0.6 s at full-sheet framing.
- At the wide framings that dominate the film, the site shows at about 0.63× its real size (the sheet is about 815 of 1280 px), and kraft takes a third of the frame.
- The fix: for every hero motion, the camera arrives at least 0.3 s early and holds still while the site moves. The moving element fills a quarter to a third of the frame height.
- Replay three moments, once in real time and once at ⅓× with a pencilled "×⅓" in the margin. Use true frames from a 120 fps capture, never interpolation:
  - the desk → nav flight;
  - the #35 tabs;
  - the gravity return.
- Close-ups: the objects landing in their tabs; the flower press; the pin pop; the dossier sliding out; the #35 fore-edge column at full height; the pin pressed with its ticks; the first line of prints developing; the peg unclipping; the sleeve's lip catching; the hand-lettered "咔嚓 click!" on the camera tab at 1:20.0, which is a delight and invisible now.

### 3. Capture judder: the footage breaks the film's own "pure function of time" rule.

- rec.mjs records a CDP screencast with wall-clock timestamps, and cut.mjs resamples it with fps=30. During motion, about every 6th frame is a duplicate (roughly 25 fps in a 30 fps grid).
- Measured in the raw footage:
  - s1 24.5–31.1 s: film 0:28.7–0:35.3, the hero dissolve;
  - s2 7.9–9.3 s: film 0:50.4–0:51.8, the fling;
  - s2 21.3–27.1 s: film 1:03.8–1:09.6;
  - s3 10.3–11.1 s: film 1:27.7–1:28.5, the print unclip.
- The film's camera moves smoothly over this, which makes the stutter inside the frame more visible. It also blurs the two clocks, the site's core motion idea: the springs must be smooth so that the pen's held poses read as deliberate.
- The fix: capture deterministically on a virtual clock.
  - Either chrome-headless-shell with `--enable-begin-frame-control --run-all-compositor-stages-before-draw` and `HeadlessExperimental.beginFrame({frameTimeTicks, interval, screenshot})` per frame, or a paused `Emulation.setVirtualTimePolicy` plus an injected performance.now/rAF clock.
  - Check that view transitions and WAAPI advance on it.
  - Record at 60 fps, 120 for the replays, at DPR 2.
- Acceptance: no zero-diff frame inside any motion window, on both sides.

### 4. It reads as a framed screen recording. Bring back test C's depth where it counts.

- The world is a flat folder of flat sheets rotated 1–2°, under a 2D camera. The page curl is the only 3D. Test C put the desk in layers at depth, pushed into the laptop and brought the card out of the screen into the room.
- The fix: extract layers for three hero moments with a two-pass deterministic capture:
  - pass A is the page with the moving element hidden;
  - pass B is the element alone on a transparent ground (`Emulation.setDefaultBackgroundColorOverride` with alpha 0, and the rest `visibility:hidden`; for view-transition moves, hide `::view-transition-group(*)` except the named groups).
- In the film, the element rises off the sheet in z (at most about 40 px of parallax). The sheet tilts at most 12° around it, and countable contact dots sit where it nears the paper.
- The three moments: the Fred Agent card leaving the board into your hand (0:56.2); the #35 tabs flying to the fore-edge (1:00.2); the print coming off the line with its peg (1:27.5). Optional fourth: the desk objects flying into the nav (0:14.0).
- This is what a screen recorder can't do. If it proves too costly, notes 2 and 3 alone still lift the film a long way.

### 5. Continuity: both sheet changes open on Writing again.

- Sheets 2 and 3 start on Writing (0:42.5–0:44.4 and 1:17.4–1:19.3), so the bookcase appears three times, and no sheet continues from where the last one ended.
- The pull-asides (0:41.0–0:42.5 and 1:15.9–1:17.4) are the only moments when the film stops being about the site.
- The fix: one session, recorded as chained deterministic segments. Each segment starts from the previous one's URL, scroll position and sessionStorage (`fy-opener`, `fy-flower-*`, `fy-point-*`, `fy-lang`), and they join on a rest frame, so the joins are invisible.
- Writing → Reading becomes a match cut. At 0:22.6 the latest essay is pulled with its cover turned out, which is the G wreath illustration. Push in on it and hold the same scale and position across the cut into Reading's hero, which is the same illustration. The film's only non-site cut then looks designed.
- If three sheets stay, start sheet 2 on Reading and sheet 3 on the board.

### 6. Pacing: 2:07 down to about 95 s.

- 0:00–0:04.2 → 1.5 s: hold the closed folder for 0.5 s and start the OP as the cover lands. Right now there are 1.8 s of blank sheet with a cursor (0:02.4–0:04.2).
- 0:07.6–0:12.2: the camera zooms in, lifts and zooms out, and never rests on the desk before the flight. Hold the full desk for 1 s so the flight has a start state.
- 0:16.6–0:25.2 Writing → 5 s: cut the second book's hover and make it the match cut. Keep the EN retitle as a close-up on the spines.
- Remove the 0.4 s whip pans at 0:19.6 and 0:22.4 (to the switch and back): frame the spines and the switch together.
- 0:33.2–0:36 into the text → 1 s. Cut the footnote lift at 0:38.2–0:39.5.
- Cut 0:41.0–0:44.4 (the pull-aside and Writing again).
- 0:49.9–0:54.1, the fling, the fling-back and its lift → 2.5 s: one fling, with the cards swinging in close-up.
- 1:02.7–1:10.1, the Principles lift and the scroll to the chapter's end → 2 s on the rail's loop moving down.
- Cut 1:15.9–1:19.3 (the pull-aside and Writing again).
- Cut the About tab lift (1:35.2–1:36.3), and the flip lift and flip back (1:46.1–1:50.2).
- The end card, 11 s → 7 s: set the credits by line, not by character.
- The result is about 92–98 s, including about 4 s of slow-motion replays.

### 7. The film's own chrome competes with the site.

- The folder's kraft index tabs ("01 home · writing · reading / #17 · #22 #27 #31") sit beside the site's own kraft dossier tabs from 0:56 to 1:15. At 1:00.5, "02 building · the dossier" sits next to "01 overview … 05 demos", in the same material, shape and type, at the one moment the site's tabs are the star.
- "AFTER · 9b1cb9e · MAIN AT #35 · …" tops every wide frame. Hashes and PR lists mean nothing to a viewer.
- The BEFORE label sits under the top sheet and is out of frame during most lifts (0:10.3, 0:38.8).
- The fix: remove the film's tabs. At each chapter the pen writes the numeral and a bilingual name in the margin once ("01 家·写·读 / home · writing · reading"), and the camera leaves it.
- Drop the hash label. Type 「#17 之前 · BEFORE #17」 on the flap's underside, so it is in frame whenever the before is. PR numbers move to the end card.

### 8. Meaning without narration: at most five pen notes, and a facts end card.

- As it stands, only the before flashes tell anyone what changed.
- Use the hand role (the site's Caveat and its Chinese hand face) at the site's 2.6 px pen, in `--pencil` or ink, never small coral. Each note is written on in 0.8 s or less on the hand's clock, sits beside the motion, and is gone by the next beat.
- Wording, each one describing what's on screen:
  1. at the ⅓× replay: 「桌子变成了导航」 "the desk becomes the nav";
  2. at the first before lift only: 「以前：硬切」 "before: a hard cut";
  3. at the #35 tabs: 「标签跟着你走」 "the tabs travel with you";
  4. at the print: 「连夹子一起取下」 "unclipped, peg and all";
  5. at home: 「导航落回桌上」 "the nav falls back into a desk".
- End card, bilingual, every line in `--ink`:
  - Round one #17 · the motion and interaction redesign · 29 Sep 12:59
  - Round two #18–#35 · 18 PRs · 29 Sep 16:04 → 30 Sep 10:21
  - 每一页都是真实录制、真实操作 / Every page recorded live, with real input
  - optionally one fact from the brief: CLS 0.061–0.074 → 0.000–0.001 · zero Google requests
  - the before's credit
  - 用 Claude Opus 5.5 制作 / Made with Claude Opus 5.5

### 9. Sound: flat, looping, no silence.

- Integrated loudness is −16.0 LUFS, but the true peak is −1.4 dBFS, over the kit's own −1.5 dBTP target.
- LRA is 2.3 LU, and short-term loudness stays between −14.6 and −17.9 LUFS from 0:02 to 2:01. The OP, the flights and the scroll through Principles are equally loud.
- The spectrogram shows the same broadband low attack (20–340 Hz) every ~2.86 s, one bar at 84 BPM, about 44 times: the bed reads as a loop, with no development from sheet to sheet.
- Paper foley makes 36 broadband bursts of 0.3–0.5 s (17 lifts, each with a paper-up and a slap, plus 2 whooshes). They are the loudest recurring events in the mix.
- There is no near-silence before 2:02 (silencedetect at −45 dB finds only the final second).
- The credits' typing (1:59–2:05) carries a steady ~2.4 kHz tone: a whine.
- The last second is hard digital silence rather than a decay.
- Sync is good: the stamps land frame-exact at 0:08.77 and 0:09.03, and the click at 0:13.80.
- The fix:
  - Build an arc: piano only through Home, Writing and Reading; add the low string at Building; fullest through Gallery and About; back to piano for the home return; the pen alone under the end card.
  - Put 0.5–0.8 s near-silences (momentary loudness at or below −40 LUFS) before the OP's first cut, the flight, the #35 tabs and the final stamps. Use test C's J-cut.
  - Stop re-attacking the bed every bar: hold chords over two bars and vary the voicing.
  - Only 7 lifts, their foley 8–10 dB under the site's own, in 3–4 variants. During the before's hard cut, duck the bed 6 dB so the cut sounds like a cut.
  - Make the typing unpitched and varied, or one clack per line.
  - Bring the true peak to −1.5 dBTP or below, and let the last note decay to −60 dB.

### 10. Finish.

- The 1× footage magnified 2.5–3.5× is soft: the seals at 0:09.2, the Principles title at 1:00.5, the footnote at 0:37.0, About at 1:35.7. Record at DPR 2, and DPR 3 for the seal and footnote close-ups.
- One-frame glitch at 2:03.23: dark horizontal bands across the end card. Add a QA pass that flags any one- or two-frame luma-diff spike that returns to baseline.
- End-card contrast: the first three credit lines are grey on kraft, where the site's own rule is `--ink`. Coral on kraft is the site's one failing pair, and the seals look muddy (2:06.5). End on the cream sheet with `--ink` credits, or keep kraft with every line in `--ink`.

## Smaller notes

- The OS arrow cursor is large in close-ups and covers the footnote at 0:38.8. Replace it with a small ink cursor at the pen's weight, with the site's three impact ticks on each click, so the real input reads.
- The curl's underside is a full dot field (0:10.3, 0:15.6, 0:52.9), which reads as shading on a lit curl. Tone should mark contact only: a plain paper2 underside, with one short run of dots where the flap meets the page below.
- The Building tab move should frame the board arriving under the tabs, not the nav.
- The rail being drawn (1:00.9) is invisible. Either close in on its first ticks or drop the claim.
- About: the sleeve pull is what's new (the old card had a flip button). Frame the lip catch close (1:38.6–1:39.5), and let the flip go, since the old site had it too.
- The cover label is English-only: 「改版 · The redesign」.
- A 30 s cut: the OP → the desk → nav flight's ⅓× replay → the #35 tabs → the print unclipped → the gravity return → the stamps.

## Already excellent, keep

- Real input with one scenario on both sites, synced by beat. It is honest, and it is what makes "lift before the action" possible.
- The dossier at film scale, and the pull-aside that quotes #35's chapter move. Keep the pull-aside as an idea, even if it leaves the film.
- The seal lift (0:09.5–0:11.0): the typeset lockup with its stickers against the carved seals, at the same zoom, lands at a glance. Make it the template, moved before the motto.
- The Gallery lightbox lift (1:28.8): the dark lightbox against paper and a peg. Keep it, moved before the click.
- One cue list for picture and sound, frame-exact stamps, loudness normalised to −16 LUFS.
- The OP at full-sheet framing as the one saturated moment.
- Palette discipline: no gloss, glow or gradient in the film's own world, apart from the dot underside.
- The log-space zoom, and the page's spring with one overshoot.

## Single take or three sheets

One real single take. The seams are the film's own, not the site's, and the site's thesis is continuity: what you touch is what arrives. The sheet changes cost about 7 s and repeat Writing twice. The robustness argument goes away with deterministic capture: a virtual-clock segment can't flake, re-runs identically, and chains invisibly on rest frames. The only non-site cut, Writing → Reading, becomes a match cut on the same illustration. Keep the lift as the one sanctioned break: it's paper, it's the medium's own move, and it now shows the old site's hard cuts on purpose.

The route:

1. The OP, then the book: the desk → nav flight.
2. Writing: the latest essay pulled, EN, then the match cut into its cover.
3. Reading: the hero, the footnote.
4. The nav's building tab (from Reading).
5. Building: the flower, the fling, the card, the dossier, 03, Principles and the rail, then ← board (the way back).
6. The shooting tab: the develop, the fast pass, the print and back.
7. The about tab: the sleeve, the tilt, the flip.
8. Home: the gravity return.
9. The folder's back.
