# Opener brief — board 10

Read `BRIEF.md` first (constraints, runner, verification). This addendum overrides it where they differ.

## Why

The home page opens with a black screen, a row of five hopping birds, "日常 · ep.01", a fake 3.4 s "loading…", then an iris. It was meant as a Nichijou tribute; it now reads dull. Fred wants something drastically better — "on another level" — and explicitly allows overriding the site's design principles for this one moment.

Nichijou has two registers, and the comedy lives in the jump between them: the **manic OP** (rapid hard cuts, flat saturated colour, giant type, smear frames) and the **deadpan eyecatch** (one ordinary object floating in cream space, drawn with affection, nothing happening). The current opener is neither. Fred's guide also says register breaks are rare and expensive — the opener is precisely the one unit that earns one.

## What may break, what must hold

May break (say which, and why, in your report): one-accent colour economy, "no gradients / washes / rendered volume", "no flashes", the physics-vs-hand clock split, the light-only palette, duration of chrome animation.

Must hold:
- Character identity: the bird, the portrait, the desk objects stay recognisably Fred's (see `.claude/skills/fred-visual-design-guide/assets/masters/` and `references/canon/settei.md` if you depict characters). Never reproduce Nichijou's own frames, characters or the 日常/nichijou title lockup; use Fred's own type and art.
- Bilingual: never Chinese-only text.
- Honest loading: choreography starts immediately; the final reveal waits for the desk image to decode (cap the wait), and nothing is padded to look like loading.
- Budget: full version ≤ 3.2 s (hard cap 3.5 s) on a first visit; a **returning-visit** version ≤ 0.6 s that is recognisably the same idea.
- Skippable: click / tap / any key / wheel fast-forwards to the end state in ~250 ms (not a jump cut).
- Photosensitivity (WCAG 2.3.1): never more than 3 flashes per second; no full-screen saturated-red flashes.
- Reduced motion: no opener at all; the desk simply appears.
- Works at 1440×900 and 390×844 (portrait needs its own composition, not a squashed desktop one).
- Performance: 60 fps on a laptop; free everything (rAF, GL contexts, timers) when done.

## Deliverable

A standalone full-viewport page `design/2026-09-motion/10-opener-<x>.html` (+ your css/js, each ≤ 500 lines) that plays the opener and lands on the real home desk. For the landing state, reuse the faithful desk copy the board-09 agent built — `09-home-desk.js` / `09-home-desk.css` (read-only; don't modify) — or reproduce it from `index.html`. Add a small mockup-only control strip (bottom-left, utility mono, low contrast): `↻ replay · skip · first visit / returning · reduced motion`. Support `?mode=returning` and `?autoplay=0` query params (the board will embed you in an iframe).

You may add tools under `design/2026-09-motion/tools/` (e.g. Python via `uv run --with pillow --with numpy …`, ephemeral envs only; no global installs). Generated assets go in `design/2026-09-motion/assets-gen/` with your `10<x>-` prefix.

## Verification

Use the runner (`node /tmp/fyshot/run.mjs …`). Capture a frame sequence of the full version (e.g. every 150–250 ms) at 1440×900 and 390×844, and of the returning version; compose each sequence into one contact-sheet PNG (`uv run --with pillow python …`) and look at it with the Read tool. Critique ruthlessly: is every frame composed, or are some mush? Would Fred want to replay it? Iterate. Report: files, what it does beat-by-beat with timings, principles broken and why, trade-offs (weight in KB, GPU, support), and contact-sheet paths.
