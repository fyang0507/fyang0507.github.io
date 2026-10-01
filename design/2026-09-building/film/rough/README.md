# Stage 2a · the rough cut

The whole film at full length, for Fred's notes on structure: `rough-cut.mp4` (1280×720, 30 fps, draft sound), its timing sheet `TIMING.md`, and the board at <http://127.0.0.1:4218/design/2026-09-building/film/>. The final render (1080p60, then a 30 s cut in 16:9 and 9:16) waits for his approval.

Scope: everything from #17 on. Round one is #17 (the motion and interaction redesign; the desk becomes the nav). Round two is #18–#35, 18 PRs across a day and a night (29 Sep 16:04 → 30 Sep 10:21). "Before" is 6237120, main before #17, for the whole film; "after" is origin/main at 9b1cb9e (#35).

## Structure: one dossier, one camera

The film is the site's own dossier grammar at film scale: a kraft folder on the desk, and in it a stack of live sheets with index tabs down the fore-edge.

| | film time | what | continuity |
|---|---|---|---|
| 1 | 0:00–0:04 | The closed dossier ("FIELD NOTES · FYANG0507.GITHUB.IO · The redesign · #17 → #35"). The cover opens on its hinge. | continuous |
| 2 | 0:04–0:41 | **Sheet 1, home · writing · reading** (one real session): the first visit's OP, the objects falling, the motto written and the seals stamped; the book → the desk becomes the nav → Writing; a book pulled toward you (the cover under the obi); 中文 → EN retitles the spines; the book in your hand → Reading; the hero dissolves and the title flies into the header; a footnote's pen gesture and slip. | continuous inside the sheet, carried by the site itself (the desk → nav flight). Writing → Reading is a same-tab cut on the real site, which has no transition for it by design; the film keeps it and holds a wide framing across it |
| 3 | 0:41–0:42 | Sheet 1 is pulled aside to the left, the way a Fred Agent chapter gives way to the next (#35's chapter move); sheet 2 is already there. | a sheet change: the footage jumps (a new session), the camera doesn't |
| 4 | 0:42–1:16 | **Sheet 2, building · the dossier** (one real session): the nav's building tab (the tab move); the flower pressed again; the board flung, the cards swinging on their pins; the Fred Agent card unpinned into your hand, the dossier sliding out; its 03 tab → the tabs fly to the chapter's fore-edge (#35), the rail drawn on Principles; down the chapter; ← Building board → the way back, the card brought into view, the tabs tucked, the pin pressed in. | continuous inside the sheet (the tab move, #35's flight, the way back) |
| 5 | 1:16–1:17 | Sheet 2 pulled aside; sheet 3. | a sheet change |
| 6 | 1:17–1:56 | **Sheet 3, shooting · about · home** (one real session): the tab move to Gallery, the prints developing on their lines, one unclipped into the viewer with its peg and clipped back; the tab move to About, the specimen card pulled out of its sleeve, tilted, flipped and turned back; home, the nav falling back into a desk. | continuous inside the sheet (two tab moves, the gravity return) |
| 7 | 1:56–2:07 | Sheet 3 pulled aside; the folder's back: 继续写，继续造 written with the lockup's own strokes, the two seals stamped, the credits typed. | continuous |

The camera never cuts: one move from the cover to the credits, eased between authored framings (zoom in log space). The only jumps are the site's own (the before site's hard cuts, and Writing → Reading on both) and the two sheet changes, which are shown as paper moved by hand.

**Why three sessions and not one.** The site could carry one visit end to end (Reading's back link to Writing, then the nav), which would remove both sheet changes. I recorded three for robustness in this pass: one failed beat in a two-minute session means re-recording all of it, on both sites. The seams sit where the film wants a chapter anyway. If Fred wants the whole film literally continuous, stage 2b can record one session and drop the pull-asides.

## The before: the page underneath

Every sheet has the site before #17 lying underneath it. It is recorded in the same session shape, with the same real input at the same moments (`rec/`, both sides driven by one scenario, synchronised by beat). It is never shown beside the after. At the moments that compare, the top page is flipped up from its bottom edge like a pad's top page. The before is seen playing underneath at that same moment, then the page falls back on a spring with one small overshoot. As the page rolls, countable dots mark the curl and the contact on the page below, never a shadow. The before's sheet is a hair off-square under the after's, with its label "BEFORE · 6237120 · MAIN BEFORE #17" on the margin the roll uncovers.

The lifts (see `TIMING.md` for exact times). Each comes just after the new site's own motion has played out, so the flight, the tab move or the stamp is never hidden, and the old site is seen at that same moment:
- **Sheet 1:** under the seals, just stamped, the typeset lockup with its stickers, at the same zoom. After the desk → nav flight, the old Writing page the hard cut landed on. The old Reading as the hero dissolves, and the old footnote.
- **Sheet 2:** the old Building page after the tab move, its board as the new one is flung, its chapter as #35's tabs land, and its way back.
- **Sheet 3:** the old Gallery grid after the tab move, its dark lightbox, the old About after the tab move, and its card as the new one flips.

## Draft and rough (to change in the final)

- The footage is at 1× (1280×1000, DPR 1), so close-ups are soft (the seals at ~3.5× magnification). The final re-records at DPR 2 on a quiet machine.
- Sound is a draft on the shared cue list (`score.py`). Each site event gets its foley: clicks, the flights as whooshes, the stamp, the flip. Each page lift and fall, pull-aside, pen stroke, stamp and typed character in the film gets its own. Under it runs a felt piano and a low string in D at 84 BPM, one figure per sheet, the opener answered by a bright chord, and a near-silence under the pen at the end.
- Length is 2:07. Trim candidates: the second pulled book and the scroll to the chapter's end (sheet 2), the flip back (sheet 3), and the footnote hold (sheet 1). That gets it to about 1:50.
- Not yet: the pen's hand annotations (rationed: one per sheet at most), the Demos viewer (in review), and chapter numbers drawn instead of typed.

## Files and how to regenerate

- `index.html`, `rough.js` (timeline, camera, the lifts, the pull-asides), `world.js` (the folder, the sheets and their curl shader, tabs, frame loading), `direction.js` (per session: its tab, the camera's framings and the lifts, keyed to the footage's beats; the end card), `score.py`, `timing.py` → `TIMING.md`, `cues.json` (the film's cues and every footage beat on the film's clock).
- `rec/` (one level up): the recorder and the three scenarios, both sides. Footage goes to `/tmp/fyfilm/footage/<session>/{after,before}/%06d.jpg` at 30 fps with a `meta.json` of beats; `rough/footage` is a symlink to it (gitignored, not committed).

```sh
# the two sites on :4219 (after = origin/main, before = 6237120), this checkout on :4218, see ../README.md
cd design/2026-09-building/film
# record (sequential, a quiet machine): see rec/README or rec/record.sh
node kit/render.mjs rough --w 1280 --page "index.html?w=1280" --cues --crf 20 --out picture.mp4
uv run --with numpy --with scipy python rough/score.py && python3 kit/mux.py rough/picture.mp4 rough/mix.wav rough/rough-cut.mp4
python3 rough/timing.py
```
