# Design lineage

Each design iteration of the site lives here as one dated folder: the audit, the briefs, the live mockup boards Fred compared round by round, and the handoff that records his calls. Together they document why the site looks and moves the way it does. Keep them. Later iterations add a sibling folder instead of editing an earlier one.

`design/` is kept out of the published site (`.github/workflows/deploy-pages.yml` strips it before deploying). To browse it, serve the repository locally and open the folder:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

## Iterations

| Folder | What it covers | Start here |
|---|---|---|
| [`2026-09-motion/`](2026-09-motion/) | FE design audit and motion/interaction redesign: transitions, pen states, the Writing bookcase, the Building corkboard, the Gallery clotheslines, the About specimen card, the Reading hero and footnotes, the home opener. Seven rounds of boards, shipped in the `redesign/motion-revamp` PR. | <http://127.0.0.1:4173/design/2026-09-motion/> (audit and board index), then `HANDOFF.md` (every decision) |
| [`2026-09-tab-moves/`](2026-09-tab-moves/) | Page → page moves: three candidates compared on the real pages, Fred's pick (each page arrives the way its object moves), and the compositor-only rule that made it smooth. | `README.md` |
| [`2026-09-identity/`](2026-09-identity/) | The top-left identity lockup, made by hand: an audit of today's, and three live candidates (A 签 the pen signs, B 印 carved seals, C 稿 the manuscript grid) in real headers, on home, in the pen's states and in their arrival after the OP. Fred picked B; round 2's re-carve (弗 \| 雷德) was tried live, and the port ships round 1's carving (弗雷 \| 德). | `HANDOFF.md`, then <http://127.0.0.1:4173/design/2026-09-identity/r2-board.html> (round 1: `index.html`, `README.md`) |
| [`2026-09-building/`](2026-09-building/) | Building: an audit of the board's preview and the Fred Agent and NJJoe sub-sites, then three complete candidates from board to project (A the back of the card, B go in close, C the dossier): the preview, the way in and back as cross-document view transitions, and the sub-sites restyled on the site's system, with Reading's margin rail on principles. Fred picked C, with no WIP on the live site. An adversarial review (`PLAN-REVIEW.md`) reshaped the port into eight PRs; round 3 (`r3-decisions.html`) made its nine open questions live, and Fred answered them all. Demos took rounds 2 to 4 of its own (`r2-02-demos-board.html`, `r3-demos-board.html`, `r4-demos-board.html`). Shipped 2026-09-30 as #23, #24, #26, #28, #32–#35 and #37 (Demos' viewer). The round's promo film is in `film/` (v1.5 is final, posted 2026-10-01 on X, LinkedIn and 小红书; every earlier version kept as its source and posters; of the renders, only v1.5's promo, side-by-side and stacked stay committed), and the earlier screen-recording drafts in `video/`. Every other render, here and in `2026-09-motion/video/`, was removed on 2026-10-01 and is in git history at `deb66a6`. | `HANDOFF.md` (every decision; §8 what shipped, §9 what is open), then `PORT-PLAN.md`; the boards at <http://127.0.0.1:4173/design/2026-09-building/> (to see them as drawn, `HANDOFF.md` §2); the film at <http://127.0.0.1:4173/design/2026-09-building/film/>, then `film/README.md` |
| [`2026-10-essays/`](2026-10-essays/) | Writing and Reading: eight points from Fred on 2026-10-05, four of them with boards. Writing's CN/EN switch (A 题头, B 挂牌, C 拨片; picked B, #47), the end-of-essay previous/next nav (A 书架, B 拿在手里, C 铅笔线接着走; picked A, with a 吊牌 way back, #46), how a footnote points back (A 只圈注号, B 对行, C 有据才圈; picked A, #45), and the book-to-essay move (A 扉页铺开, B 封面成题图, C 翻过扉页; picked B, #49). The other points shipped without boards (#43, #44, c2b99b4). Most boards only work on the commit their branch was cut from. | `README.md` (decisions, what shipped, what is open, and each board's working commit) |

## Conventions

- One folder per iteration, named `YYYY-MM-topic`, at depth two (`design/<iteration>/`). Boards reach the live site's shared assets through `../../` paths, so keep that depth.
- Boards are named by round: `NN-*` for round 1 and `rN-NN-*` for later rounds. A later round never edits an earlier round's files, so every comparison Fred made stays reproducible.
- `HANDOFF.md` is the record of decisions; the boards are the record of how each idea looks and moves.
- Boards load some production files (`site-nav.css`, `content/`, `assets/`). As the live site changes, an old board's "current site" frames show the site as it is now, not as it was then.
- The shared code moved from the root to `lib/shared/` after `5983c8b`, so boards from before then load it from paths that no longer exist, such as `../../site-nav.css`. To view one as it was, check out that commit and serve it: `git worktree add ../fy-lineage 5983c8b`.
