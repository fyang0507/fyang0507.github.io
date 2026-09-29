# Round 2 brief — refine what Fred picked

Read `BRIEF.md` first; everything there still applies (motion thesis, constraints, the isolated runner, verification, report format). This addendum overrides it where they differ.

## Where we are

Round 1 produced boards 01–11 (live mockups in this folder). Fred reviewed them and picked directions. Round 2 refines those picks into **controlled siblings** — keep the chosen concept and carrier stable, change what Fred asked to change, and push quality. Do not reopen the whole search.

## Fred's global notes

- Round 1 was judged **"sleek but ordinary"** in places. He wants **surprise / WOW** — moments people remember and replay — as long as they stay inside the thesis (hand-annotated humanity, one sharp edge, 萌 not 媚, every motion has a cause). Be bold. A WOW that's a generic tech effect (glow, glass, particles for their own sake) is a fail; a WOW that's a physical or narrative surprise built from Fred's own objects is the goal.
- The site stays **light theme** (paper). No dark mode work.
- Nothing is tracked server-side (GitHub Pages); per-visitor memory, if any, is `localStorage` only.

## Rules for round-2 files

- New files use the prefix `r2-NN-` (e.g. `r2-04-shelf.html`, `r2-04-shelf.css`, `r2-04-shelf-core.js`). **Never modify round-1 files** (`01-…` to `11-…`), `shared/`, `BRIEF.md` or this file — Fred compares against them. You may read and copy code from round-1 files into your own `r2-` files.
- Each file ≤ 500 lines. Plain HTML/CSS/JS, no dependencies.
- Board format: same `shared/mock.css` board chrome as round 1. Put a short "What changed from round 1" strip right under the board header (Fred's quoted note → what you did). Candidates are now refinements; 1–3 per board, recommended one marked `cand pick`.
- Pages must still work at 1440×900 and 390×844, with reduced motion, keyboard and touch.

## Verification

Same isolated runner (`node /tmp/fyshot/run.mjs <steps.mjs>`, never the MCP browser tools), with your own prefix for screenshots (`/tmp/fyshot/r2-NN-…`). Capture mid-motion frames, look at them, iterate until it would genuinely surprise Fred. Report: files, what changed vs round 1, what each candidate does, known limitations, 2–3 best screenshot paths.
