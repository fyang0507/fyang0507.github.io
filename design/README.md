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
| [`2026-09-building/`](2026-09-building/) | Building: an audit of the board's preview and the Fred Agent and NJJoe sub-sites, then three complete candidates from board to project (A the back of the card, B go in close, C the dossier): the preview, the way in and back as cross-document view transitions, and the sub-sites restyled on the site's system, with Reading's margin rail on principles. Fred picked C, and no WIP on the live site; the port is planned as eight PRs, revised after an adversarial review (`PLAN-REVIEW.md`). Round 3 (`r3-decisions.html`) made the port's nine open questions live; Fred answered them all (`HANDOFF.md` §4). Round 2 draws Demos in C with three blur-free focus treatments for the evidence viewers (`r2-02-demos-board.html`). | `HANDOFF.md` (every decision), then `PORT-PLAN.md`; the boards at <http://127.0.0.1:4173/design/2026-09-building/> |

## Conventions

- One folder per iteration, named `YYYY-MM-topic`, at depth two (`design/<iteration>/`). Boards reach the live site's shared assets through `../../` paths, so keep that depth.
- Boards are named by round: `NN-*` for round 1 and `rN-NN-*` for later rounds. A later round never edits an earlier round's files, so every comparison Fred made stays reproducible.
- `HANDOFF.md` is the record of decisions; the boards are the record of how each idea looks and moves.
- Boards load some production files (`site-nav.css`, `content/`, `assets/`). As the live site changes, an old board's "current site" frames show the site as it is now, not as it was then.
- The shared code moved from the root to `lib/shared/` after `5983c8b`, so boards from before then load it from paths that no longer exist, such as `../../site-nav.css`. To view one as it was, check out that commit and serve it: `git worktree add ../fy-lineage 5983c8b`.
