# 2026-10 essays: Writing and Reading, eight points

On 2026-10-05 Fred raised eight points about Writing and Reading. Four got design candidates, each built and compared on its own branch (one board per topic, files prefixed by topic); the other four shipped without boards. This folder holds the four boards; the decisions are below.

## Fred's eight points

1. Writing's CN/EN switch: it should be easier to find and read as part of the page. Board: switch.
2. The previous/next nav at the end of an essay: it should feel like the site's shelf, not a generic pair of links, and the back-to-shelf link should survive, redesigned. Board: pn.
3. How a footnote points back to the text: the quoted span was a guess. Board: notes.
4. The move from the book in your hand on Writing to the essay. Board: book.
5. Dark mode: the hero halftone and the covers. Shipped without a board (#43).
6. Section markers, the references in the rail, the references headings, and a typo. Shipped without a board (#44).
7. The footer's "Email" label. Fixed directly (c2b99b4).
8. The Surge AI typo. Fixed with point 6 (#44).

## The four boards

Each board loads the site's real files through `../../`. See "Viewing the boards" before opening one.

### switch: Writing's CN/EN switch (PR #47)

Files: `switch-index.html` (start here), `switch-writing.html`, `switch-a.js`, `switch-b.js`, `switch-c.js`, `switch-pair.js`, `switch-cands.js`, `switch-cands.css`, `switch-contact.jpg`, `switch-detail.jpg`.

- A 题头 (the headline): the switch sits in the page's heading.
- B 挂牌 (the hanging sign): a small sign hung on the shelf.
- C 拨片 (the pick): a physical toggle you flick.

Fred picked B 挂牌, with the other language in small print on the sign, and not sticky. Shipped as #47.

### pn: the previous/next nav at the end of an essay (PR #46)

Files: `pn-index.html` (start here), `pn-play.html`, `pn-a.css`, `pn-a.js`, `pn-b.css`, `pn-b.js`, `pn-c.css`, `pn-c.js`, `pn-a-back.css`, `pn-a-back.js`, `pn-kit.css`, `pn-kit.js`, `pn-inject.js`, `pn-util.js`, `pn-contact.jpg`, `pn-shots/` (screenshots of each candidate at 1440 and 390, light and dark, zh and en, on a middle, the newest and the oldest essay; `ship-*` are the port's before and after).

- A 书架 (the shelf): the nav ends the essay on a stretch of Writing's shelf.
- B 拿在手里 (in the hand): the neighbouring books held in your hand.
- C 铅笔线接着走 (the pencil line goes on): the margin's pencil line continues to the neighbours.

Fred picked A 书架, kept 上一篇 (older) on the left, and wanted the back-to-shelf link kept but redesigned. Round 2 (`pn-a-back.*`, the `back-*` shots) offered three ways back: 吊牌 (a hang tag), 「全部」签 (an "all" tab) and 印在板边 (printed on the shelf's edge). Fred picked 吊牌. Shipped as #46.

### notes: how a footnote points back to the text (PR #45)

Files: `notes-board.html` (start here), `notes-catalogue.html` with its generators `notes-catalogue.py` and `notes-catalogue.mjs`, `notes-reading.dc.html`, `notes-board.css`, `notes-cands.css`, `notes-main.js`, `notes-slip.js`, `notes-lineslip.js`, `notes-pen.js`, `notes-pull.js`, `notes-align.js`, `notes-proven.js`, `notes-shots/` (each candidate on desktop and phone, `today-*` for the site then, `port-compare-*` for the port).

A catalogue of all 268 notes found the guessed quote span right only 37% of the time, so the question became how much to draw when the span is a guess.

- A 只圈注号 (circle only the ref): ring the note's number, mark no span.
- B 对行 (line up): draw the line the note belongs to.
- C 有据才圈 (circle only with proof): mark a span only where the source proves it.

Fred picked A, with the phone slip still rising from the bottom and the page gliding so the slip never covers its ref, no back-links from the references list, and no hand-authored spans. Shipped as #45.

### book: the move from the book in your hand to the essay (PR pending)

Files: `book-index.html` (start here), `book-writing.dc.html`, `book-reading.dc.html`, `book-board.css`, `book-board.js`, `book-vt.css`, `book-vt.js`.

- A 扉页铺开 (the flyleaf spreads): the title page opens out into the essay.
- B 封面成题图 (the cover becomes the header image): the cover travels to the essay's hero.
- C 翻过扉页 (turn the flyleaf): the page turns past the flyleaf.

Fred preferred B and was fine with the board no longer swinging open. "← 全部文章" acts like Back when you came from the shelf, and the timing stays at about 1.5 s. He saw a flash mid-move. 8f21b8b fixed it on the board: the old-out/new-in crossfade showed bare paper. A one-frame flash remained in Arc incognito; 4c1b9b1 holds the browser's own animations at their first frame, but that could not be confirmed. Fred said to ship it and check in production. The port is in progress on `writing/book-move`; its PR is pending.

## Shipped

- #43: dark mode prints the hero halftone, then a brighter dark cover, a paper outline on the cover text in both themes, and a ceiling for very light covers. No board.
- #44: section markers on one line with their titles, references in the rail, unified 参考资料 / References headings, and the Surge AI typo fix. No board.
- c2b99b4: the footer "Email" fix, committed directly.
- #45: footnotes, candidate A (notes board).
- #46: the previous/next shelf with the 吊牌 way back (pn board).
- #47: Writing's 挂牌 switch (switch board).
- The book move, candidate B (book board): pending, on `writing/book-move`.

## Open

- The one-frame flash in Arc incognito on the book move: 4c1b9b1 should have removed it, unconfirmed. Check in production.
- Chromium, Back to Writing after the book move: one frame of a stale shelf. Check in production.

## Viewing the boards

The boards load the site's real files through `../../`, and production has since changed: the switch, the `.pn` cards and the notes' corners are gone, replaced by the shipped versions. A board therefore works only on the commit its branch was cut from, and its "today" frames show that commit's site. Each board's working commit is its branch tip:

| Board | Branch | Working commit | Open |
|---|---|---|---|
| switch | `design/essays-switch` | `1e17a49` | `design/2026-10-essays/switch-index.html` |
| pn | `design/essays-pn` | `dee98ea` | `design/2026-10-essays/pn-index.html` |
| notes | `design/essays-notes` | `a650cc5` | `design/2026-10-essays/notes-board.html` |
| book | `design/essays-book-move` | `4c1b9b1` | `design/2026-10-essays/book-index.html` |

To view one as it was drawn:

```sh
git worktree add /tmp/x <commit>
cd /tmp/x && python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/` plus the path in the last column. The branches are in git history after they are deleted, so keep the commits above. The screenshots and contact sheets (`*-contact.jpg`, `pn-shots/`, `notes-shots/`) need no server.
