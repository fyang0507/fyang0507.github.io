# The round-two film · stage 1: three style tests

Fred's brief: "Can we be more creative in this promo video? This is a case for you to really showcase your capability." The film has two jobs: show the elevation (the site before and after, what changed and why it's better), and be a piece of code-rendered film craft in itself, not a screen-recording montage with captions (the drafts in `../video/` and `../../2026-09-motion/video/` are that).

Execution mode: **multi-stage** (the visual guide's workflow). This is stage 1: three genuinely different directions, each as a finished 12-second style test, a treatment of the whole film and a storyboard. Stage 2 (the full film in one direction) waits for Fred's pick.

**v1.1 is in [`v1.1/`](v1.1/README.md)**: v1 with Demos (#37), the film's own hand, and footage re-recorded on main (321ee2c) at a true DPR 2, with DPR 3 close-ups. Erratum for v1: its footage is 1280 × 1000 (1×), not DPR 2 as v1's README says. `Page.captureScreenshot` returns CSS pixels unless its clip asks for a scale, whatever the context's deviceScaleFactor. The recorder now asks for one.

**Stage 2b, v1, is in [`v1/`](v1/README.md)**: the film at 1:28, 1080p60, and its 30 s cuts at 16:9 and 9:16. It's one real take of the site recorded on a virtual clock (`cap/`, deterministic, 60 fps and 180 fps for the ⅓× replays, DPR 2), one camera with one match cut, and the site before #17 under the page before seven clicks. It follows the critic's notes on the rough cut ([`rough/CRITIQUE.md`](rough/CRITIQUE.md)).

**Stage 2a, the rough cut, is in [`rough/`](rough/README.md)**: the whole film (2:07) as one dossier and one camera, every live-footage placement, the before as the page underneath, draft sound and a timing sheet. Fred's notes on stage 1 moved the scope to everything from #17, with the site's own motion recorded live as the star.

Board: <http://127.0.0.1:4218/design/2026-09-building/film/> (serve the repository root; the three tests side by side, their storyboards and the records).

| | Direction | Test | Storyboard |
|---|---|---|---|
| A | 一夜 · One night, many hands | [`a-night/test.mp4`](a-night/test.mp4) | [`a-night/storyboard.png`](a-night/storyboard.png) |
| B | 纸机器 · Paper machine | [`b-machine/test.mp4`](b-machine/test.mp4) | [`b-machine/storyboard.png`](b-machine/storyboard.png) |
| C | 一镜到底 · One continuous shot | [`c-shot/test.mp4`](c-shot/test.mp4) | [`c-shot/storyboard.png`](c-shot/storyboard.png) |

Every test is 1920×1080, 60 fps, H.264 yuv420p with AAC 48 kHz, loudness-normalised to −16 LUFS integrated, true peak under −1.5 dBTP.

## What the bar taught (and what was left)

From [awesome-opus-5-5-videos](https://github.com/athemeroy/awesome-opus-5-5-videos) and the guides of two of its standouts ([lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar)'s DIRECTOR.md and TECHNIQUE.md, [Papermotion](https://github.com/francozanardi/papermotion)):

- **Took.** A film is a pure function of time: `window.render(t)`, no wall clock, no unseeded random, so any frame renders alone and the picture is identical on every run. One cue list drives both picture and sound, so every visible action has its sound and nothing drifts. Offline frame capture, piped to ffmpeg, so a heavy frame costs time, never smoothness. Contact sheets and 0.2 s strips to review motion; a spectrogram and loudness numbers to review sound. Near-silences before the peaks; transitions made in the medium (a peg, a fold, a camera move) rather than fades.
- **Left.** Their looks: boiling torn edges, rim light and light shafts, film grain, lens and glow effects, TTS narration, stock or model-generated audio. Fred's language has no light source and no gradient; tone is countable marks, and the one sanctioned register break is the seal's coral.

## Facts the film may use

Only these, from the brief and the repository; nothing invented. Merge times are GitHub's (`gh pr list --state merged`), in Fred's EDT.

- Round one, #17 (the desk became the nav), merged 29 Sep 12:59. Round two, #18–#34: #18 and #19 at 16:04; #20, #21, #22 at 21:46; #23 22:35; #24 22:37; #25 23:19; #26 23:29; #27 00:39 (30 Sep); #28 01:09; #29 02:05; #30 03:10; #31 03:27; #32 04:20; #33 04:36; #34 09:31. PR 3 (the tab that flies to the chapter's fore-edge, the way back, the chapter move) merged as #35 at 10:21, after these tests were cut.
- The fixes, the Writing, Building, Fred Agent, NJJoe, evidence, fonts, phone and identity changes, their numbers (LCP 932 → 868 ms, Overview 944 → 820, Demos 1040 → 908, CLS 0.061–0.074 → 0.000–0.001, Demos 14 MB → 1.1 MB before scroll, faces 1.02–1.05× instead of up to 1.57×, zero Google requests, home ~300 ms faster over HTTP/2) as the brief lists them.
- One orchestrator and a team of agents, each change reviewed independently before merging; the agents' names in this session (building-1a, building-1b, building-2, building-3, building-4, building-t, pen-fixes, writing-sharp, cls-races, evidence-ladder, rail-extract, demos-port, demos-r3, click-options, promo-clips). A tag names an agent only where its PR is certain from `HANDOFF.md` and `PORT-PLAN.md` (1b → #28, PR 2 → #32).
- Fred's picks (seals B, dossier C) and his words: "not hand-made enough", "let it be consistent", "There shouldn't be any WIP sticker in the live website".
- Credits: made with Claude Opus 5.5; round one's "before" was Claude Design (Fable 5) + GPT-5.6-sol.

Footage is stills of the real site (`captures/`, 1440×900 at 2×): `r1-*` is round one as merged (5983c8b), `main-*` is main at #34 (5c13009), `r0-*` the site before round one (6237120).

---

## A · 一夜 · One night, many hands

**Pitch.** The round told as the night it happened: every merged PR is pegged over the round-one print it replaced, at its real merge time, tagged with the agent that made it, and develops the way the Gallery's prints develop.

**The test** (`a-night/test.mp4`, 12.0 s, 8.6 MB, −15.8 LUFS). A clothesline already hung with round one's prints (#17, 12:59). #22 slides down into an open peg in front of its round-one print, the peg bites (click, the line thrums and dips), the print swings on its pendulum while the grey-green chemical clears, its caption is written in and the pen ticks REVIEWED; the clock in the corner rolls from 21:40 to 21:46. The camera trucks to #28 (01:09, tagged building-1b) and #32 (04:20, building-2), the clock rolling through the night between them, then pulls back on the whole line; in a near-silence the pen writes 继续写，继续造 with the lockup's own strokes, and the two seals are stamped on the tonic.

**Treatment (the whole film, ~90 s).** It opens on paper: the pen draws the line, and Fred's own notes are pegged first, in his hand ("not hand-made enough.", "let it be consistent."). The orchestrator ties the agents' tags along the line, one per job. Round one's prints already hang there. Then the night runs on its real clock, 16:04 to 09:31: the five fixes land one per beat as quick clips (#18–#22); each larger change gets its own peg and its own time to develop, with its number written in the margin by the pen (#23's 932 → 868 ms, the loupe over #27's sharp book, #28's dossier, #29's zero Google requests, #30's steady phone). #31 is the register break: the print is the header itself, and the pen writes the motto on it before the stamps. Morning brings #32–#34. At dawn the camera pulls back on the night's seventeen prints, each over the one it replaced, and the last peg opens in daylight for #35 (10:21), the way in and the way back. The last shot is the lockup written and stamped, the credits typed, and the last note left to ring. The music is a felt piano at 72 BPM in D, one figure per print, each a step higher as the night goes on.

**Storyboard** (`a-night/storyboard.png`): 00–07 the brief · 07–14 many hands · 14–20 round one · 20–30 the fixes, one per beat · 30–37 #23 · 37–44 #25–#27 · 44–52 #28 · 52–58 #29, #30 · 58–66 #31, the seals · 66–75 #32–#34 · 75–83 dawn, the whole line, #35 in daylight · 83–90 the seal and the credits.

**The record.**

| | |
|---|---|
| source | the round's facts (17 PRs, their merge times, agents, reviews, Fred's picks) and stills of the site at round one and at #34; destination a 60–90 s film, 16:9 |
| facts | 17 merges between 16:04 and 09:31, most of them 21:46–04:36; each by a named agent and reviewed on its own before merging; each replaced something round one shipped; the Gallery already has a grammar for a picture arriving (a print pegged to a rope, developing from a grey-green chemical) |
| took / left | took the Gallery's line, pegs and develop (its own keyframes from `lib/gallery/develop.js`), the wheat band for the latest, the pen's tick for reviewed, the lockup's written strokes and seals; left the split screen, captions over footage, and any screen-recording |
| mapping | many hands through one night → a line filled print by print at the real times → a new print pegged in front of the old one, the clock rolling between them, the maker's tag |
| source-form distance | low: the line, pegs, prints and tags are recognisable objects; the captures are shown as themselves; the composition is new |
| primary carrier | line-led: the rope, the pegs, the tick, the threads and the written motto carry the structure; colour belongs to the captures (content) and to three named roles |
| rendering resolution | moderate: one line, three pegged pairs and their captions, a large quiet field under the line |
| expression anchor | the peg's bite: held poses (open, half, shut) on the hand's clock against the paper's spring and pendulum on the physics clock; the develop |
| line plan | one pen, 2.6 px on screen at every zoom (the rope, the pegs, the tick, the tag threads, 3.1 px for the motto); hierarchy by value: ink for rope and pegs, pencil for round one's captions, `--line-strong` for print edges; no independent tone except countable contact dots where a print lies over the one behind |
| colour plan | paper field dominant; the captures' own muted palette as content; the chemical `#C2C5AB` transient while a print develops; the wheat band (`--hl`, `--hl-ink` edge) on the latest merge time; coral owned once, by the seal, in the last 1.2 s (the highest chroma) |
| marks | one line family; subordinate: the dot runs of contact tone, the typed captions (Fraunces italic, IBM Plex Mono) |
| source-image role | source evidence: the captures are undistorted footage |

**中文说明.** 这一轮最真实的故事是那一夜：十七个 PR，从下午四点到早上九点半，大多在 21:46 到 04:36 之间合并，每个都有做它的代理，每个都单独审过。A 用画廊里现成的语法来讲：晾衣绳、夹子、显影。新照片被夹在它替换掉的第一轮照片前面，时间是 GitHub 上真实的合并时刻，挂着代理的小吊牌，笔在边上打勾写"已审"。线条是主角，同一支笔画绳子、夹子、勾和最后的格言；颜色只有照片自己、显影液的灰绿、最新一张的麦色高亮，以及结尾唯一一次珊瑚红的印章。夹子咬合用手绘的定格姿势，纸的摆动用弹簧和单摆，两种时钟在同一个画面里。

**What the technique demonstrates.** Canvas 2D rendered deterministically: the paper's physics is analytic (a spring's step response, a damped pendulum after a knock), so any frame is a pure function of t; the two clocks in one frame (the peg's jaws, the pen and the clock's digits held at 12 poses a second; paper and camera at 60); the site's own `pen.js` for every stroke, seeded by its text; the header lockup's real stroke paths written in order, and its seals; the Gallery's develop keyframes reproduced as canvas filters; a score placed from the same cue list, down to one pen scratch per stroke of the motto, timed from the path lengths.

---

## B · 纸机器 · Paper machine

**Pitch.** Round one's pages go through a paper machine: each is folded into an accordion, turned end over end, and unfolds as round two's page, because the new page was printed on its back. It is cut to a 100 BPM beat made of the site's own sounds.

**The test** (`b-machine/test.mp4`, 12.0 s, 14.9 MB, −16.3 LUFS). Three pages go through the machine on a kraft table with a wheat band as its bed. First, round one's Building board (5983c8b) closes into a fan, stands, turns end over end and opens as main's board. The machine stamps "#23 · a static board · LCP 932 → 868 ms at 1440" and "#33 · the board set in Fraunces" beside it in ink outline and IBM Plex Mono. Round one's Principles comes out as the chapter with the rail (#32). The board from before round one, the one with the gradient wordmark (6237120), comes out as the card with its dossier (#28). These two go at double time. The camera pulls back over the new pages, and after one beat of hush the coral seals are stamped on the kraft, followed by a slow push onto them. The foley is the rhythm section: the landing and the crease snap are the kick and snare, the fan's turn is a whoosh, the labels are stamps and the pen ticks are the hats. Under it runs a D minor pentatonic bass and marimba.

**Treatment (the whole film, ~84 s at 100 BPM).** The machine runs the site's pages through in order: home and the seals (#31); Writing's 中文 · EN and the sharp book (#22, #27); the Building board (#23, #28, #33); the dossier; Fred Agent's chapters and the rail (#32, Overview 944 → 820 ms); NJJoe (#34, CLS 0.061–0.074 → 0.000–0.001). Each page closes, turns and opens as its new self, and the creases stay behind as hairlines. The machine stamps the fact beside it. Then the small fixes go through at double time, one crease each. "How it was made" is Fred choosing among the design boards: A and B fold away, and the dossier (C) gets the wheat band. The camera pulls back over the new pages, the beat drops out, the seals are stamped in a near-silence, and the credits are stamped the same way.

**Storyboard** (`b-machine/storyboard.png`, 11 panels drawn by the test's engine): 0:00–0:06 cold open, one round-one page on the bed · 0:06–0:14 home, the seals come out · 0:14–0:22 Writing · 0:22–0:32 Building (the test) · 0:32–0:38 the dossier from the old gradient wordmark · 0:38–0:46 Fred Agent, the rail · 0:46–0:52 NJJoe · 0:52–1:02 the fixes at double time · 1:02–1:10 Fred picks among boards A, B, C · 1:10–1:16 near-silence, the seals · 1:16–1:24 the credits, stamped.

**The record.**

| | |
|---|---|
| source | the same facts and captures as A; destination a 60–90 s film, 16:9 |
| mapping | "the same site, made again" → the same sheet, folded and turned over → the new page was always on the back |
| source-form distance | medium: the real captures are printed on the sheets, but the composition is the machine's (a table, a bed, a fan), not the site's layout |
| primary carrier | colour-led: flat masses carry it, kraft ground (dominant field), cream sheets (dominant masses), the wheat band (structural), ink (neutral), coral once |
| rendering resolution | moderate |
| expression anchor | the crease: once made it stays as a hairline, and a flat sheet keeps about 2° of crease memory; a flap bounces once off the base; a stamp lands in two held frames |
| line plan | independent line has two subordinate jobs only: crease hairlines at about 32 % ink, and the stamped outline labels at 3 px. No contour drawing |
| colour plan | kraft `#C9AE83`, cream `#FEFAEE`, wheat `#DCCF98` with its `#AD9650` edge, ink `#33302B`; coral `#D9695A` on the seals only (the highest chroma). Colour management is pass-through, so every hex renders exactly |
| tone | countable ink dots printed in the sheet's own uv, so they travel with the paper, only on a tilted panel or near a closing crease, capped under a third; flat, settled paper carries none |
| source-image role | source evidence, printed on paper |

**中文说明.** 旧页面进纸机：收成手风琴、立成一扇、翻个跟头、再打开，出来的就是新页面，因为新页面本来就印在它的背面。所以这不是"替换"，而是同一张纸被重新折过、翻过来。颜色是主角：牛皮纸、奶油纸、麦色带子，珊瑚色只留给最后那一枚印。调子只用数得清的网点，只在纸倾斜或折痕合拢的地方出现，纸放平就干干净净；折过的痕迹则一直留着，是机器（也是手）的证据。节奏全部来自网站自己的声音：落纸、合折、翻转、盖章，同一条 100 BPM 的时间线。

**What the technique demonstrates.** Three.js rendered deterministically inside `render(t)`. The fold is physically valid: a zigzag is symmetric, so a fan turned end over end and reopened is the sheet turned over, and it never passes through the table. One shader draws both faces (the front is before, the back is after with u mirrored) and adds the halftone tone and the crease hairlines. Folds, turns, landings and pans start one spring-lead early, so each first arrival sits on a beat. The foley is the rhythm section of a score placed from the same cue list.

**With more time.** The standing fans of sheets 2 and 3 come close to the top of the frame. The seal just appears; a glimpse of the stone lifting away would give it a visible cause. The tilted fans still read dense at thumbnail size.

---

## C · 一镜到底 · One continuous shot

**Pitch.** One unbroken camera move through Fred's world. It goes from the desk into the laptop and onto the corkboard. A card comes out of the screen into your hand and its dossier slides out, a tab flies to the chapter's fore-edge, and the pen draws the margin rail. The film then pulls out through the carved seal.

**The test** (`c-shot/test.mp4`, 15.0 s, 13.7 MB, −15.9 LUFS). One shot, no cuts:
- It opens on the home page's desk drawing, standing in layers at staged depths, so the first frame is exactly the drawing. The laptop's screen shows the real Building page, as paper, not light.
- The camera pushes into the screen until the Fred Agent card fills the frame. The pin pops in held poses. The card lifts off the board by its pin and comes out of the screen into your hand, straightening.
- The dossier slides out from behind it and the peeking tabs tuck.
- The 03 tab is pulled and flies to the chapter page's fore-edge, landing in the wheat band. The chapter is laid over the dossier from the right.
- The pen draws the rail: the guide, the ticks and numbers stepping in, the graphite, the wheat loop around 01.
- The camera rises to the header, the motto is written with the lockup's own strokes, and the two seals are stamped.

The score is a felt piano and one low plucked string in D at 80 BPM. The bed stops before the pin, so the pin is the first sound out of the silence. The chapter page is heard before it enters the frame (a J-cut), and the dossier's slide runs on under the tab pull (an L-cut).

**Treatment (the whole film, ~90 s).** One camera move, told only with Fred's objects:
- It opens on the desk at rest and pushes into the laptop, onto the Building board.
- A pin pops, the Fred Agent card comes out of the screen into your hand, and the dossier slides out with its five tabs.
- One tab flies to its chapter's fore-edge, and the chapter is laid over the dossier. The pen draws Reading's margin rail, then the next tab's system map: handles → protocols → outcomes.
- The way back (#35, now live): the tabs tuck under the card, and the pin is pressed back into the cork with the ripple.
- The camera rises to the header, where the motto is written and the seals stamped. It passes into the white cut of 弗 in the seal and comes out on the whole desk for the credits.

Paper moves on springs and the pen on the hand's clock. The camera never cuts.

**Storyboard** (`c-shot/storyboard.png`, 11 panels rendered by the shot's own engine):
- 0:00–0:08 the desk at rest
- 0:08–0:16 into the screen: the static board, the tabs peeking
- 0:16–0:24 the pin pops; the card comes out into your hand
- 0:24–0:30 the dossier slides out
- 0:30–0:36 a tab flies to the fore-edge
- 0:36–0:46 the margin rail drawn
- 0:46–0:54 the system map drawn
- 0:54–1:02 the way back (#35)
- 1:02–1:10 the motto and the seals
- 1:10–1:18 through the white cut of 弗
- 1:18–1:30 out to the whole desk; credits

**The record.**

| | |
|---|---|
| source | the home desk's real layers (`assets/derived/desk/`) and real pieces of main's pages (5c13009), each cut at its measured page box (`c-shot/parts/`); destination a 60–90 s film, 16:9 |
| mapping | "what you touch is what arrives" (the motion thesis) → one camera that never cuts → the card comes out of the screen into the room, and each next sheet is laid over the last |
| source-form distance | low: the desk, the board, the card, the dossier and the chapter are recognisable at once, at their real positions |
| primary carrier | hybrid: colour masses (paper, cork, kraft, wheat, the coral seal) build the world; line (the desk's ink, the pen's rail, loop and motto) carries every action; remove either and the shot fails |
| rendering resolution | rich: many local events in one coherent world; unlit paper only, no gradient, gloss, blur, fog or glow |
| expression anchor | paper coming out of the screen into the room, then the next sheet laid over the last; depth from paper layers, never from light |
| line plan | the desk's ink at its own weight; the rail's guide in `--line-strong`, ticks and numbers in `--pencil`, a short graphite stretch; the loop in `--hl-ink`; the motto in ink; hierarchy by value, not thickness |
| colour plan | paper and the chapter sheet dominant; kraft tabs and the cork grid structural; ink neutral; the wheat band on the current tab; coral at rest only in the seals (the highest chroma, landing last) and the card's own flower; the only tone is two small contact patches of countable dots, under the lifting card and where it lies on the dossier |
| source-image role | identity reference and source evidence: real layers, reassembled |

**中文说明.** 这一镜全部由弗雷德自己的东西构成：主页那张书桌画按物件的落脚点拆成纸片、分层立起，第一帧与原画严丝合缝；笔记本屏幕里是真实的 Building 页面，卡片被拔掉图钉后从屏幕里"出来"到你手上，档案从卡片背后滑出。纸走物理的钟，弹簧只回弹一次；图钉、刻度和笔走手的钟，定格前进。镜头只有一个，距离在对数空间里插值，从整张书桌到一枚索引签都是同一个连贯的推进。没有光源，没有渐变，景深只靠纸与纸的叠放；珊瑚色留到最后，落在两方印上。

**What the technique demonstrates.** The site's real DOM is taken apart into registered pieces: element screenshots on a transparent ground, laid back at their boxes (`parts.mjs`). The pieces are reassembled as a Three.js paper world. One authored camera follows a Hermite curve with Catmull-Rom tangents, with distance interpolated in log space, so a roughly 10× zoom from the desk to one tab reads as one even move. Screen-edge clipping lets the card come out of the monitor. The pen draws into a canvas texture with the site's own pen functions and the rail's real geometry. Frames render at 2× internal resolution, 900 frames in 79 s.

**With more time.**
- The desk art is 1448 px wide, so the laptop's lines go soft when magnified; it needs 2–4× desk layers.
- Around 4.5 s the lifting card briefly leaves the top of the frame.
- The landing tab swaps to its banded state with a small pop, instead of the pen drawing the band.
- The seal needs to be vector for the pass through 弗.
- The way back (#35) is a held frame in the storyboard; it is live now and can be captured.

---

## The question for Fred

Which one becomes the full film: A, B or C? If you'd combine, name the part. For example: C's one camera move, with A's merge-time clock rolling in the corner.

Since these were made, PR 3 has merged as #35 (10:21 on 30 Sep, "Building: the way in, the way back and the chapter move"). Stage 2 can capture it as real footage. The tests only show merges up to #34.

---

## The shared kit (`kit/`)

- `film.js`: `window.FILM`, the contract with the renderer (`window.render(t)`, `DUR`, `CUES`, `READY`), the two clocks (`spring`, `swing`, `held`), easings (the site's `--ease-pen` and `--ease-out` among them), path lengths and partial strokes over the site's `pen.js`, fonts (the Latin subsets in `fonts/`, the CJK files from the repository's `fonts/`). `?t=4.2` holds a frame and `?play` plays a test in a normal browser.
- `render.mjs`: headless Chromium (Chromium 1234 via `/tmp/fyshot`'s playwright-core), one screenshot per frame at 60 fps piped to ffmpeg (libx264, crf 17, yuv420p, bt709 tags); `--stills` and `--sheet` for review frames, `--page` for a storyboard page. A lock (`/tmp/fyfilm/render.lock`) keeps renders from overlapping.
- `sound.py`: every sound, synthesized with numpy and scipy: the pen on paper (band-limited noise under the paper's tooth, shaped by stroke speed), paper, a crease, a peg's click, a pin into cork, a stamp, a clock tick, a knocked line, a whoosh; Karplus-Strong strings, a felt piano, a marimba, a bass; a mixer with one small room.
- `mux.py`: two-pass EBU R128 loudness (−16 LUFS, −1.5 dBTP) and the mux.
- `capture.mjs`: the stills in `captures/`.

## Regenerate

```sh
# the site at round one, at main and before round one, side by side on :4219
mkdir -p /tmp/fyfilm/main /tmp/fyfilm/r1 /tmp/fyfilm/r0
git archive 5c13009 | tar -x -C /tmp/fyfilm/main
git archive 5983c8b | tar -x -C /tmp/fyfilm/r1
git archive 6237120 | tar -x -C /tmp/fyfilm/r0
python3 -m http.server 4219 --bind 127.0.0.1 --directory /tmp/fyfilm
# this checkout on :4218
python3 -m http.server 4218 --bind 127.0.0.1
# the headless runner (once): mkdir -p /tmp/fyshot && cd /tmp/fyshot && npm init -y && npm i playwright-core
cd design/2026-09-building/film
node kit/capture.mjs                       # only if the captures should change
node kit/render.mjs a-night                # → a-night/picture.mp4 and a-night/cues.json
uv run --with numpy --with scipy python a-night/score.py     # → a-night/mix.wav
python3 kit/mux.py a-night/picture.mp4 a-night/mix.wav a-night/test.mp4
node kit/render.mjs a-night --page board.html --stills 0    # the storyboard → a-night/stills/t-0.00.png
```

The same three steps render `b-machine` and `c-shot`. C first cuts its page pieces (`node c-shot/parts.mjs`, into `c-shot/parts/`); its storyboard and poster are `node c-shot/board.mjs`, and B's are `node b-machine/board-shot.mjs` (`b-machine/index.html?board`). The render is deterministic: the same commit gives the same frames.
