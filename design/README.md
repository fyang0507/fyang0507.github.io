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

## Conventions

- One folder per iteration, named `YYYY-MM-topic`, at depth two (`design/<iteration>/`). Boards reach the live site's shared assets through `../../` paths, so keep that depth.
- Boards are named by round: `NN-*` for round 1 and `rN-NN-*` for later rounds. A later round never edits an earlier round's files, so every comparison Fred made stays reproducible.
- `HANDOFF.md` is the record of decisions; the boards are the record of how each idea looks and moves.
- Boards load some production files (`site-nav.css`, `content/`, `assets/`). As the live site changes, an old board's "current site" frames show the site as it is now, not as it was then.
