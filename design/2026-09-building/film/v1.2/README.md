# The film · v1.2

Fred's two notes on v1.1:
- "I didn't see any comparison in the 30s video, which is the one I'm going to use in the social media."
- On the footnote close-up: "You can change an essay."

v1 and v1.1 are kept as they were.

| File | What | Length |
|---|---|---|
| `film-30s-16x9.mp4` | the 30 s cut, rebuilt around four comparisons | 0:26.9 |
| `film-30s-9x16.mp4` | the same, reframed shot by shot for 9:16 (1080×1920), not cropped | 0:26.9 |
| `film-v1.2.mp4` | the long film, with another essay in Reading, and the BEFORE / AFTER stamps at its seven lifts | see the numbers |

## The comparison, made legible

The long film's device is kept: at each hero click the page lifts, the site before #17 makes the same click with its real hard cut, the page falls, and the new motion plays. What v1.2 adds is two stamps (`v12.js`):
- **「#17 之前 · BEFORE #17 · 6237120」** is stamped on the old page as soon as it is seen. It sits at the frame's top-left, below the rolled flap.
- **「之后 · AFTER · #17 → #35」** is stamped on the new page as it falls back. It sits where the frame will be once the new motion is playing, and stays for 1.9 s.
- **How they look.** Both are stamped at once, with the paper pressed for two frames, and each has its own sound. They are ink on cream in an ink outline: the dossier's "facts as stamped outlines". The Chinese line is about 56 px on a 1080 frame and about 80 px on the 9:16 frame's 1920, so they read on a phone, muted, in a feed.
- **What makes room for them.** In the 30 s cuts the pen's chapter names are off, so one message shows at a time. There is at most one pen note per comparison.

## The 30 s cut, shot by shot

| film | shot | 9:16 |
|---|---|---|
| 0:00.0–0:01.3 | the hook: the OP's first saturated cuts (弗, 在造 building) | the same, framed taller |
| 0:01.3–0:01.8 | the sheet pulled aside (#35's chapter move) onto the desk | |
| 0:01.8–0:02.2 | the desk, the hand on the book | |
| 0:02.2–0:03.8 | **before**: the page lifts, BEFORE is stamped; the old home's click and its hard cut into the old Writing (at 2.7 s) | |
| 0:03.8–0:04.7 | **after**: the page falls, AFTER is stamped; the desk becomes the nav, in real time | the desk framed narrower, from the laptop to the camera |
| 0:04.7–0:06.6 | the flight again at ⅓× from true 180 fps frames, close on the nav, with the one note 「桌子变成了导航」 | framed on the nav and the tabs |
| 0:06.6–0:07.1 | pulled aside onto the board | |
| 0:07.1–0:07.4 | the lead card, the hand on it | |
| 0:07.4–0:09.0 | **before**: the old card's click and its hard cut into the old field notes | |
| 0:09.0–0:10.6 | **after**: the pin pops, the card comes to your hand, the dossier slides out | the card and dossier column |
| 0:10.6–0:11.1 | pulled aside onto the clotheslines | |
| 0:11.1–0:11.5 | the print on its line, the hand on it | |
| 0:11.5–0:13.1 | **before**: the old grid's click and its dark lightbox | |
| 0:13.1–0:14.9 | **after**: unclipped into the viewer, peg and all (「连夹子一起取下」) | |
| 0:14.9–0:15.4 | pulled aside onto About | |
| 0:15.4–0:15.7 | the hand on home | |
| 0:15.7–0:17.3 | **before**: the old About's hard cut home | |
| 0:17.3–0:18.6 | **after**: the nav falls back into a desk | |
| 0:18.6–0:21.5 | the same at ⅓× (「导航落回桌上」) | |
| 0:21.5–0:26.9 | the take pulled aside; 继续写，继续造 written with the lockup's strokes, the two seals stamped, "用 Claude Opus 5.5 制作 · Made with Claude Opus 5.5" | the lockup framed for the tall frame |

The cuts use v1.1's take (`take11`, recorded on main at 321ee2c). None of their moments involve Reading, and the new take keeps every time.

## Numbers

| | runtime | size | loudness | LRA | true peak | 1–2 frame luma glitches | zero-diff frames in the ⅓× replays |
|---|---|---|---|---|---|---|---|
| `film-30s-16x9.mp4` | 0:26.9 | 6.2 MB | −16.7 LUFS | 5.6 LU | −2.8 dBTP | none | 0 / 1 |
| `film-30s-9x16.mp4` | 0:26.9 | 6.0 MB | −16.7 LUFS | 5.6 LU | −2.8 dBTP | none | 0 / 1 |
| `film-v1.2.mp4` | 1:35.9 | 28.0 MB | −17.0 LUFS | 7.4 LU | −2.1 dBTP | none | 0 / 0 / 1 |

The one zero-diff frame is the gravity return replay's first frame, before its motion starts. The long film's mux asks loudnorm for −3.9 dBTP (`TP=-3.9 python3 v1.2/finish.py film-v1.2`).

## The long film: another essay in Reading

**The God in the Edit (被剪辑的神, 2 May 2026, commentary, "A Short History of the GOAT Narrative")**, recorded as `take12` on main at 321ee2c (`cap/scenarios/take-v12.mjs`). Every beat keeps v1.1's time, so the rest of the cut is v1.1's. The before side's windows are unchanged, and `take12-before` is `take11-before`.

Why this essay:
- **The match cut.** The pulled book's board is the cover's middle 16:25, and Reading's hero is the whole cover at the page's width. The board's picture maps onto the hero at 2.67×, its centre (292, 509) landing on (640, 216), so the cut lands on the same illustration at the same place and scale.
- **The footnote.** Its first footnote comes 161 words in: Anderson's line about number 45, and the slip "1 Mark Heisler, 'It's Err Jordan—No Bull,' Los Angeles Times, 1995-05-08." It's a clean, pretty close-up, framed with its slip, at DPR 3.

Every line on screen in the Writing → Reading segment, checked:
- **The pulled book:** "The God in the Edit / 被剪辑的神 / 2026-05 · ~15 min / commentary · 杂文 / a long one 长文".
- **The hero:** "COMMENTARY · May 2, 2026 · 15 min read · 中 / EN", the title, and "A Short History of the GOAT Narrative".
- **The text as it scrolls:** "In May 1995, Michael Jordan stood in Orlando.", then the paragraphs on the 1995 Jordan, Game 1 against the Magic and Nick Anderson's remark, down to "a losing ticket stub pressed inside a Bible" and "It was a crack."
- **The slip:** the citation above.

Nothing in them is unfit for a public promo.

The ones I passed over:
- **Hawaiʻi Has No Anger:** it has an early clean footnote, but its opening quotes a wartime slur.
- **Salvation Mountain:** its first footnote is 745 words in, past the take's scroll.
- **The rest:** no footnotes, or none early.

**One call for Fred.** The cover art, and so Reading's hero, draws the Jumpman silhouette and LeBron's logo in the essay's own illustration. It's editorial, on his own site. If he'd rather a promo showed no brand marks, the take can be re-shot on another essay with the same beats.
