# Round two: promo clips and cuts (drafts)

Drafts for Fred's review. They show this round's Building redesign beside the site as the motion round's videos left it, with the motion round's pipeline (`design/2026-09-motion/video/`, copied here and adjusted; nothing there is edited).

- **Before** is `5983c8b`, the #17 merge: the site the motion round's videos show as "after". **After** is `origin/main` at `e96efe9` (#23, #28, #31, #32, #33, and #22, #27 for Writing).
- Same framing as the existing videos: desk 1280×1000, phone 390×844, 60 fps, real input on both sides at the same moments.
- The labels say BEFORE · round one and AFTER · round two.

## The drafts

| File | What | Length | Size |
|---|---|---|---|
| `fyang0507-round2-30s-16x9.mp4`, `-9x16.mp4` | (a) The 30 s round-two cut: one spec (`spec-30.json`), two layouts. Eight beats on hard cuts, then the end card: the seals stamped, the tabs peeking behind the cards, the dossier sliding out, a tab opening its chapter, the rail on Principles, the system map, then on a phone the strip with its counter and the dossier. | 28.2 s | 5.7 / 5.6 MB |
| `fyang0507-redesign-before-after-r2-draft.mp4` | (b) The proposal for the long video: the existing `fyang0507-redesign-before-after.mp4`, untouched, with a round-two chapter spliced in after its segment 04 "Building · the corkboard" (at 66.9 s, a paper frame). The chapter is a title card and six segments, 04b–04g (`spec-insert.json`): the dossier, into a chapter, reading the principles, the system map, and on a phone the dossier and a chapter. | 4:10 (the old 2:44 + 1:26) | 25.7 MB |
| `fyang0507-round2-extras.mp4` | The two optional clips, as a short long-style cut (`spec-extras.json`): the identity's arrival after a first visit's opener, with a slowed close-up of the seals, and Writing's 中文 · EN switch, with a close-up of the sharper book in your hand. | 34.6 s | 3.9 MB |
| `poster.png` | A frame of 04b, the dossier open, from the long draft. | | |

The long draft is encoded at crf 24 to stay near the size budget; at the old cut's crf 22 it is 30.4 MB.

## Waiting on PR 3 and PR 4

- **PR 3 (the moves).** Re-record `13-chapter` (the dossier's tab flies to the page's fore-edge instead of the hard cut) and `16a-phone-chapter` (the tap on 04 becomes the chapter move: the sheet pulled aside). Add a way-back scenario: a chapter's "← Building board" to the board, which brings the card into view, tucks the tabs behind it and presses the pin. Then re-render all three cuts; the 30 s beat 4 ("A tab opens its chapter") gets the flight.
- **PR 4 (NJJoe).** Add a scenario for NJJoe's dossier and a restyled chapter, and decide whether it earns a beat.

## Regenerate

Needs both servers, the headless runner (`/tmp/fyshot` with `playwright-core`, Chromium `chromium-1234`) and ffmpeg:

```sh
mkdir -p /tmp/fybv/before /tmp/fybv/after
git archive 5983c8b | tar -x -C /tmp/fybv/before   # then: python3 -m http.server 4314 --bind 127.0.0.1 (from there)
git archive origin/main | tar -x -C /tmp/fybv/after # then: python3 -m http.server 4214 --bind 127.0.0.1
cd design/2026-09-building/video
./record.sh                                  # every scenario, before then after (~6 min) → /tmp/fybv/rec
uv run --with pillow python check.py spec-30.json      # and spec-insert.json, spec-extras.json
node montage.mjs spec-30.json fyang0507-round2-30s
node compose.mjs spec-insert.json /tmp/fybv/insert.mp4
CRF=24 node splice.mjs ../../2026-09-motion/video/fyang0507-redesign-before-after.mp4 66.9 /tmp/fybv/insert.mp4 fyang0507-redesign-before-after-r2-draft.mp4
node compose.mjs spec-extras.json fyang0507-round2-extras.mp4
ffmpeg -ss 78.1 -i fyang0507-redesign-before-after-r2-draft.mp4 -frames:v 1 poster.png
```

`./record.sh 13 16a` re-records only those scenarios; `SIDES=after ./record.sh 13` only one side. Record when no other browser suite is running: two browsers at once drop animation frames. `check.py` names any side to retake.

## Scenarios

| Scenario | Before (round one) | After (round two) |
|---|---|---|
| `11-board` | the corkboard at rest, flung and brought back | the same, with the dossiers' tabs peeking and swinging with the paper (Fred Agent's five, NJJoe's three) |
| `12-dossier` | Fred Agent unpinned: the field note; pinned back | the dossier slides out: contents, figure, fore-edge tabs; pinned back, the tabs spring out |
| `13-chapter` | the note's "Enter the field notes", then the old pill nav's Principles (fetch-and-swap) | the dossier's 03 tab opens the chapter page (a hard cut until PR 3) |
| `14-principles` | the old chapter from its load, scrolled; its "On this page" list | the rail as the table of contents: graphite, the current principle's loop, the preview slip |
| `15-system` | the old map: hover, lock, clear | the pen-drawn map, handles → protocols → outcomes: hover draws, lock cools into the band's edge, clear |
| `16a-phone-chapter` | Principles at 390, the sticky pill nav | the tab strip and the counter; a tap on 04 |
| `16b-phone-dossier` | Fred Agent unpinned at 390 | the dossier with its tabs on its top edge, scrolled, pinned back |
| `17-identity` | a first visit: the OP, then the lockup, already there | the OP, then the motto written and the two seals stamped |
| `18-writing-lang` | a pulled book (soft), no switch | a pulled book (sharp), 中文 → EN → 中文 |

## What changed from the motion round's pipeline

- Ports 4314 (before) and 4214 (after); scratch in `/tmp/fybv/`; `chrome.html` and `montage.html` load the pen and fonts from the after server's `lib/shared/`.
- `rec.mjs`: `ctx.wheelTo(y, ms)`, the eased wheel scroll `08-reading` had in-file.
- `compose.mjs` and `chrome.html`: `spec.labels` names the sides. `montage.mjs`: a beat can `crop` both sides (the seals).
- `check.py` reads either kind of spec, and allows the before site's one known error: every old Fred Agent chapter requests `assets/fred-agent/fonts/DingTalkJinBuTi.woff2`, a 404 that PR 2 removed.
- `splice.mjs` (new) puts a composed insert into an existing cut at a paper frame, frame-exact.
- No `seed.mjs`: nothing here shuffles.

## Questions for Fred

1. The 30 s cut or the long insert first? Or both, the insert as the long version's round two?
2. The 30 s cut opens on the seals (a zoom on the header), which isn't Building. Keep it as the opener, or start on the board?
3. The credits. Round one's videos credited the old site to Claude Design (Fable 5) + GPT-5.6-sol; here both sides are Claude Opus 5.5, so the labels say round one / round two and the end card says "Round one, before it, was Claude Opus 5.5 too". Is that the line you want?
4. The long insert adds 1:26. Should it drop a segment (the phone chapter, or the system map) to stay near 3:30?
5. Writing's switch and the sharper book are in the extras only. Should either get a beat in the 30 s cut?
