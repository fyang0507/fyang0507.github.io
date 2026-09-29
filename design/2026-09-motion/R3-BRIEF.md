# Round 3 brief — close out what Fred triaged

Read `BRIEF.md`, then `R2-BRIEF.md`; both still apply (motion thesis, constraints, the isolated runner, verification, report format). This addendum overrides them where they differ. `HANDOFF.md` §3 "Round-2 triage" is the record of Fred's calls.

## Where we are

Fred reviewed the round-2 boards. 01 (A), 04 (A) and 06 are settled. The boards below get one more controlled iteration: **change exactly what Fred asked, keep everything he accepted**, and push quality. This is not a new search; one recommended build per board, with at most one alternative where Fred's note leaves a real choice.

## Rules for round-3 files

- New files use the prefix `r3-NN-` (e.g. `r3-07-about.html`, `r3-07-about.css`). **Never modify round-1 or round-2 files**, `shared/`, or any brief — Fred compares against them. You may read them, copy code from them into your own `r3-` files, or load an `r2-` script unchanged via `<script src>` when that is cleaner than copying.
- Each file ≤ 500 lines. Plain HTML/CSS/JS, no dependencies.
- Board format: `shared/mock.css` board chrome, as before. Directly under the board header, a **"What changed from round 2"** strip: Fred's note quoted → what you did. The recommended build is `cand pick`.
- `shared/mock.js` already lists every r3 board for the top bar's prev/next (file names are fixed below; use them exactly).
- Pages must work at 1440×900 and 390×844, with reduced motion, keyboard and touch. No console errors, no horizontal overflow.
- Memory: never `localStorage` for visitor state. `sessionStorage` is fine for once-per-session behaviour.
- Coral is spent once per view. The pen is the only highlighter. Underlines are level with a blunt end — never a rising tail.

## Verification

Same isolated runner: `node /tmp/fyshot/run.mjs <steps.mjs>` (never the MCP browser tools). If `/tmp/fyshot` is missing, recreate it per `HANDOFF.md` §9. Use your own screenshot prefix (`/tmp/fyshot/r3-NN-…`). The local server is already running on `http://127.0.0.1:4173/` (repo root); do not start another. Capture mid-motion frames, look at them, iterate until it would genuinely satisfy Fred's note.

Report back: files, what changed vs round 2 (per Fred's note), known limitations, 2–3 best screenshot paths.
