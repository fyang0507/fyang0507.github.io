# 2026-10 essays: Writing and Reading, eight points

On 2026-10-05 Fred raised eight points about Writing and Reading. Four got design candidates, each built and compared on its own branch (one board per topic, files prefixed by topic); the other four shipped without boards. This folder holds the four boards; the decisions are below.

## Fred's eight points

In Fred's order and words, each with where it went.

1. 「essay hero image没有往下滑动的transition」. He first said the English version, then corrected it to dark mode: the hero's halftone print on scroll was missing in dark mode. Shipped as #43, with a brighter dark cover, a paper outline on the cover text in both themes, and a ceiling for very light covers. No board.
2. 「书架页的中英切换有点不太明显」. Board `switch-*`, B 挂牌. Shipped as #47.
3. 「书架页点击选中的书到文章页之间没有transition」. Board `book-*`, B 封面成题图. Production PR pending.
4. 「章节标识不够大（1.0，2.0…），接在章节标识后的章节标题被放在了第二行（如生活故事2中的“小诗三首”和“一些短剧”）」. Shipped as #44. No board.
5. 「footer email没有capitalize E」. Fixed directly in c2b99b4.
6. 「参考资料/reference没有列到左侧的nav里面」. Shipped as #44, which also unified the 参考资料 / References headings and fixed the Surge AI typo.
7. 「文章页的底部的导航需要重做（返回上一篇、去下一篇）…到了最后一篇文章后返回上一篇占掉了整个底部空间」. Board `pn-*`, A 书架 with the 吊牌 way back. Shipped as #46.
8. Added during the round: 「右侧的reference note高亮后连接回原文：但是原文的quote总是会错……这种高亮后给出quote范围的design实际是有问题的」. Board `notes-*`, A 只圈注号. Shipped as #45.

## The four boards

Each board loads the site's real files through `../../`. See "Viewing the boards" before opening one.

### switch: Writing's CN/EN switch (PR #47)

Files: `switch-index.html` (start here), `switch-writing.html`, `switch-a.js`, `switch-b.js`, `switch-c.js`, `switch-pair.js`, `switch-cands.js`, `switch-cands.css`, `switch-contact.jpg`, `switch-detail.jpg`.

- A 题头 (by the title): 「把书架的语言写进页面标题：「在写。」旁边并排「中文 / English」，用书脊上同样的字体……不添任何新物件。」 The pair stands on the title's baseline, set in the faces the spines use.
- B 挂牌 (on the bookcase): 「书架头上钉一颗钉子，挂一块双面牌，像小店门口的「营业中 / OPEN」：露在外面的那一面就是书架现在的语言，牌脚用另一种语言自己的文字写着怎么翻过去。」 A two-sided sign on a nail; tap it and it turns over on its string and swings on its nail, the spines turn as it passes edge-on.
- C 拨片 (by the index): 「凹下去的纸槽分成两半，写全「中文」和「English」，一块纸片垫在选中的那一半下面，按索引标签同样的弹簧滑过去，笔再给字上色。」 A recessed paper slot with two halves and a paper slide under the chosen one, in today's place above the index.

The board's recommendation was B: it is the only one that puts the language on the shelf itself, at the largest size, in the site's own terms; the cost is an object and a row of space, and the other language is small print on the sign's foot. Fred picked B 挂牌, with the other language in small print on the sign, and not sticky. Shipped as #47.

### pn: the previous/next nav at the end of an essay (PR #46)

Files: `pn-index.html` (start here), `pn-play.html`, `pn-a.css`, `pn-a.js`, `pn-b.css`, `pn-b.js`, `pn-c.css`, `pn-c.js`, `pn-a-back.css`, `pn-a-back.js`, `pn-kit.css`, `pn-kit.js`, `pn-inject.js`, `pn-util.js`, `pn-contact.jpg`, `pn-shots/` (screenshots of each candidate at 1440 and 390, light and dark, zh and en, on a middle, the newest and the oldest essay; `ship-*` are the port's before and after).

- A 书架 (the shelf): 「文末接上 Writing 的书架：这一本在你手里，架上留个空位，左右两本向空位歪着，书名写在旁边，伸手就能抽下一本。没有下一篇时站着书架上那个虚线的「つづく」，没有上一篇时书架就到头了。」 Line-led, the same books as on Writing; no images.
- B 拿在手里 (in hand): 「把前后两篇像 Writing 里抽出来的书一样拿在手里：真封面，腰封上写书名、月份、篇幅和一句铅笔旁注，一手一本，大小固定。」 The neighbours as Writing holds a pulled book; the covers carry the colour, the obi the words.
- C 铅笔线接着走 (the pencil line goes on): 「Reading 左边那条铅笔线读完打了 ✓ 之后接着往下走，串起三行目录：上一篇在上、这一篇（麦色高亮）居中、下一篇在下。没有卡片，只有字、一条铅笔线和笔的状态。」 Reading's own margin rail carried on into a three-line contents.

Fred's note on today's nav: 「文章页的底部的导航需要重做（返回上一篇、去下一篇），我觉得现在的设计不好看；而且比如到了最后一篇文章后返回上一篇占掉了整个底部空间。」 Fred picked A 书架, kept 上一篇 (older) on the left, and wanted the back-to-shelf link kept but redesigned. Round 2 (`pn-a-back.*`, the `back-*` shots) offered three ways back: 吊牌 (a hanging tag: 「一张纸吊牌用细线挂在板子下面，写着「← 全部文章」，略歪；指上去它荡一下回正」), 「全部」签 (Writing's own "all 全部 27" index tab, out from under the plank's lip; the board's own pick) and 印在板边 (printed on the lip, as a library shelf carries its range). Fred picked 吊牌. Shipped as #46.

### notes: how a footnote points back to the text (PR #45)

Files: `notes-board.html` (start here), `notes-catalogue.html` with its generators `notes-catalogue.py` and `notes-catalogue.mjs`, `notes-reading.dc.html`, `notes-board.css`, `notes-cands.css`, `notes-main.js`, `notes-slip.js`, `notes-lineslip.js`, `notes-pen.js`, `notes-pull.js`, `notes-align.js`, `notes-proven.js`, `notes-shots/` (each candidate on desktop and phone, `today-*` for the site then, `port-compare-*` for the port).

A catalogue of all 268 notes found the guessed quote span right only 37% of the time, so the question became how much to draw when the span is a guess.

- A 只圈注号 (loop the number, nothing else): 「只圈注号，不划原文：笔在注号上绕一圈，不抬笔把箭头甩进页边，纸条被拉到箭尖。数据只能证明“注在这里”，那就只标这里；手机上纸条若会挡住注号，页面先让一让。」
- B 对行 (the line, not the words): 「正文上一笔不画：电脑上注号下出现悬停线，纸条滑到注号所在的那一行；手机上纸条直接从注号那一行下面抽出来。」
- C 有据才圈 (bracket only what punctuation proves): 「只有作者自己写了引号或书名号、注号紧跟其后时，笔才描出 ⌜ ⌟——引号就是证据；其余与 A 相同，只圈注号。」

The board recommended A. Fred picked A, with the phone slip still rising from the bottom and the page gliding so the slip never covers its ref, no back-links from the references list, and no hand-authored spans. Shipped as #45.

### book: the move from the book in your hand to the essay (PR pending)

Files: `book-index.html` (start here), `book-writing.dc.html`, `book-reading.dc.html`, `book-board.css`, `book-board.js`, `book-vt.css`, `book-vt.js`.

- A 扉页铺开 (the title page opens out): 「扉页的纸铺开成整页，书名从扉页飞到文章标题的位置：书上读到的，就是页上读到的。保留现在的翻开动作，只把最后的硬切换成连续。」
- B 封面成题图 (the cover becomes the plate): 「取下腰封，封面的照片展开成文章顶部的题图：手里那本书的封面，就是文章的头图。省掉“翻开”那一下，书架早 0.25 秒交出页面。」 The cost the board names: the board no longer swings open to the title page.
- C 翻过扉页 (turn the title page): 「像读书一样翻过扉页：扉页绕书脊翻过来，它的背面就是文章，翻到底时铺满整个窗口。」 The loudest of the three, a full-window 3-D turn.

The board recommended A. Fred's note: 「书架页点击选中的书到文章页之间没有 transition。」 Fred preferred B and was fine with the board no longer swinging open. "← 全部文章" acts like Back when you came from the shelf, and the timing stays at about 1.5 s. He saw a flash mid-move. 8f21b8b fixed it on the board: the old-out/new-in crossfade showed bare paper. A one-frame flash remained in Arc incognito; 4c1b9b1 holds the browser's own animations at their first frame, but that could not be confirmed. Fred said to ship it and check in production. The port is in progress on `writing/book-move`; its PR is pending.

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
