# Redesign handoff — motion & interaction

Last updated 2026-09-28. Read this first after a context compaction or in a new session. It records what was decided, where everything lives and what comes next. The live mockups are the source of truth for *how* each idea looks and moves; this doc is the source of truth for *what Fred chose*.

## 1. Status in one paragraph

A full FE design audit of the site was done, then live mockup boards in seven rounds (01–11, then `r2-*` … `r7-*`); Fred triaged each round (§3). On 2026-09-28 he accepted r7-07, closing every board, and asked for the port: pin down every decision, revamp the site and end with one PR (branch `redesign/motion-revamp`). He also asked to **keep the boards** as a documented design lineage (they now live in `design/2026-09-motion/`, excluded from the Pages deploy; `design/README.md` indexes iterations) and for a **before/after marketing video** of the added motion, graphics, transitions and polish.

## 2. How to look at it

```sh
python3 -m http.server 4173 --bind 127.0.0.1   # from the repo root
```

- Audit + index of every board: <http://127.0.0.1:4173/design/2026-09-motion/>
- Round 2 section: <http://127.0.0.1:4173/design/2026-09-motion/#round2> · Round 3: <http://127.0.0.1:4173/design/2026-09-motion/#round3> · Round 4: <http://127.0.0.1:4173/design/2026-09-motion/#round4> · Round 5: <http://127.0.0.1:4173/design/2026-09-motion/#round5> · Round 6: <http://127.0.0.1:4173/design/2026-09-motion/#round6> · Round 7: <http://127.0.0.1:4173/design/2026-09-motion/#round7>
- Every board has a top bar: ☰ audit index, prev/next board, and a "reduced motion" preview switch.
- `python -m http.server` sends no cache headers. If a board looks stale or blank, use a private window or hard reload (this bit Fred once).

## 3. Decisions (Fred's calls)

### Global rules

- **Light theme only.** No dark mode on gateway pages. Fred also likes the **riso** theme (blue ink on warm paper, a light theme) — possible later via the role-layer work (§6).
- **No per-visitor memory across visits.** No `localStorage` tracking; the site isn't updated often and people don't visit daily. **Session memory stays**: e.g. the full opener plays once per browser session; later home loads in the same session get the short version (`sessionStorage`, like today's live opener).
- **"ep.NN" is content-derived**: the number of essays on the shelf (27 today). In production read a tiny generated count, not `posts.js`.
- **Wants WOW, not "sleek but ordinary"** — physical/narrative surprises built from Fred's own objects, inside the thesis (§5). Generic tech effects (glow, glass, particles) are a fail.

### Per board

| Board | Fred's call | Round-2 recommendation | Still open for Fred |
|---|---|---|---|
| 01 transitions | A, but WOW | **Desk becomes the nav**: table folds into its front edge → rises into the header rule; all 4 objects fly on weighted arcs into tab slots; pen draws folder tab; reverse on home by gravity; tab→tab passes a hop | A vs B (B adds the "portal window" on the clicked object) |
| 02 pen / states | B+C+D blended as tiers | **Tier 1 hover** underline → **tier 2 chosen** grows into highlighter band (one return stroke, tick where a checkbox belongs) → **tier 3 point**: coral arrow, one per view, once per session; focus = ink 「 」 | — |
| 03 filters | B, show tag + year together | **Labelled index tabs over the shelf + labelled year ruler** with 正 tallies; drag for a range; one-line bilingual readout + clear; reflow engine (books tip out / slide / drop in); same component on Gallery | A drag-a-span vs B circle-any-years |
| 04 bookshelf | B, but 3D abrupt; hover lacked physics; wants A's opening | **Paper-craft 3D from the first frame; hover pulls the book and turns its real cover to you under a paper obi (腰封) with the preview; click continues into A's open** | A obi vs B crack-it-open (V spread) |
| 05 corkboard | A+C+W; W looked like the Amazon smile | **A+C in one physics loop** (drag, pendulum cards, unpin to read, re-pin ripples the cork); wordmark study | Which wordmark (rec: **W2 level pen rule under "Agent"**, no rising tail) |
| 06 gallery | All apply; keep the clip in the zoom | **One integrated prototype**: develop on first view (session), rope physics only with a cause, unclip keeps the peg in the viewer, rope springs up/sags, phone = one swipe line per clothesline, strung line replaces Load more | — |
| 07 about | C (sleeve) then A (hold/flip) | **Pull the card down out of the kraft sleeve** (top edge catches the lip, pops free), then A: tilt with card thickness + halftone shadow, throw to flip, radar pen-draws; no glare, no shimmer; drag up to re-sleeve | — |
| 08 reading | All apply; A must work without 1.0 sections + end bug; B dull; D not salient | **08a**: hero dissolves as big colour halftone, title flies into header, pen continues into margin rail; landmarks from any structure (sections → headings → figures → minute ticks); end bug fixed; layout numbers planned. **08b**: footnote = one pen gesture (bracket claim, loop number, arrow) + note flips up as a library catalogue card; quick repeat | 08b: C catalogue card vs B unfold-between-lines (better on phones) |
| 09 home | Ship D; no returning-visitor note | Round-1 **D mobile desk** (camera pans the drawing object by object) ships as built. Truthful laptop (B) / desk notices (A) not chosen yet | Whether to add B/A later |
| 10 opener | C + D; the 弗F/雷RE/德D split was weird; "most WOW" | **C's manic OP → hard cut to D's gag** (bird pecks the honest loading line, objects drum-fill in) → 日常 · ep.NN card → desk. 3.68 s first visit, 0.68 s returning, flash-audited ≤ 2.5/s | Name beat: **a one character per cut (rec)** / b 弗雷德×FRED collision / c book-spine poster |
| 11 themes | Can't leave light; likes riso | Role-layer split works for line art; dark-mode portrait unsolved → **parked in issue #16** | — |

### Round-2 triage (2026-09-28) — supersedes the "still open" column above

| Board | Fred's call on round 2 | Round 3 does |
|---|---|---|
| 01 transitions | **A** (desk → nav, no portal window). Settled. | — |
| 02 pen | Agree, but **no tick** on choose: tier 2 is the highlighter band only. Pointing is a different thing from the tiers: an arrow can be drawn arbitrarily badly depending on relative position, and the "start here" arrow was badly drawn (unnecessarily long and curved). | Remove the tick everywhere; make the arrow short, nearly straight, rule-based and robust to any target position, with a specimen sheet proving it |
| 03 filters | Loves the 正 tallies (cultural heritage). Tags on top + years under the shelf is unintuitive; in the physical world index tabs sit on the **side** (the fore-edge of a closed book), so put them on the side on wide layouts. Also **enlarge + lengthen the books**: the live Writing shelf fills only half the screen. | Both filters in one side index (tabs + year tally), a bigger shelf that fills the page, built on 04 A's paper-craft shelf. Range = A (drag a span) by default |
| 04 shelf | **A** (pull the book, obi preview, then open). Settled. | Carried into r3-03's shelf |
| 05 corkboard | Likes **W4** (sticker), but an asterisk means "see the sidenote", not "featured". Try an icon that means highlight/featured. The pin can change colour too (W5), a nuance. | New featured-sticker icons on the lead card, with and without the coral pin |
| 06 gallery | Agree. Settled. | — |
| 07 about | Good, but **lengthen the card and sleeve**; it looks "fat". | Taller, slimmer card + sleeve proportions |
| 08a reading | The halftone dissolve must **not** show at load; it should only appear as you scroll (a bug in the page). | Fix the initial state |
| 08b footnotes | **C** (annotator's pen gesture), but the note's sticker design should be **A**'s (the tugged slip). | C's gesture with A's slip as the note |
| 09 home | (no new note) Ship D; no B/A. | — |
| 10 opener | Loves name beat **a**. Remove the chain reaction (bird pecks the line, things fall): after the OP just let the objects fall. Returning visitors in the same session: only the objects falling, no OP. | OP (name a) → objects fall → card → desk; returning = objects fall only |

### Round-3 results (2026-09-28) — awaiting Fred's review

| Board | What round 3 built | Recommended / open |
|---|---|---|
| r3-02 pen | Tick removed (choose = band only); "point" is a separate mark. New arrow glyph `r3-02-arrow.js` (replaces pen.js `arrow()` in production): 26–40 px shaft, bow ≤ 1.75 px, straight last third, 7 px barbs at 25–30°, 8 fixed approaches tried in reading order, clears text and `data-ob` obstacles, falls back to shorter → no note → no arrow. Specimen sheet, drag playground, 400-placement audit (0 text hits). | On the corkboard it points at the lead card's corner from the upper right (not the title) |
| r3-03 writing | Two-plank bookcase ≈ 2.5× the live shelf (27 books, 13 + 14; three planks at 1024), books keep a home plank (chronological), each plank labelled with its years in pencil (dims when a filter empties it). Side index: closed index book with 6 fore-edge tabs + 正 year ledger (drag a span). r2-04 A pull/obi/open on the shelf. Phone: one strip (tabs + year columns) above the shelf. `r3-03-page.html` = under the real site header. | Lower plank ends ~150 px below the fold at 1440×900 |
| r3-05 corkboard | W4 form kept; icons F1 小红花 / F2 coral star / F3 荐 seal / F4 rosette; ink/coral pin toggle | **F1 小红花, pin stays ink** (alt F3 荐 seal; needs 荐 in the font subset) |
| r3-07 about | Card 7:12 (was 1:1.31), sleeve 1:1.52 (was 1:1.05); faces re-laid; pull 1.58 card widths; whole card fits at 1440×900 | **7:12** (5:8 on a toggle) |
| r3-08a reading | Root cause: the halftone wedge had fixed depth, printed at load. Depth now grows from 0 with scroll | fixed |
| r3-08b footnotes | C's gesture → A's slip, jerked by its eyelet and swinging; arrow replaces the thread; pen = only coral | one build |
| r3-10 opener | Name a → hard cut → objects fall (no line/peck), bird already standing on the desk → 日常 · ep.27 → desk, 3.26 s. Returning: fall only, 0.68 s. Cold load: desk holds, "tap to skip" after 1.5 s, cap 6.5 s. Flash ≤ 2.5/s | eyecatch kept (removable) |

### Round-3 triage (2026-09-28) — supersedes the round-3 "recommended / open" column

| Board | Fred's call on round 3 | Round 4 does (`r4-NN-` files, same agents) |
|---|---|---|
| 02 pen | **Notice, focus and point all in the point arrow's coral.** The corkboard slice's "projects 项目" notice underline sits too close to the content below. | Coral hover underline + coral 「 」; choose stays the wheat band (the coral line cools into the band's edge, so nothing chosen is coral at rest); fix underline spacing |
| 03 writing | Will the multi-plank design hold with many more articles? Hover pulls the book away from the cursor, so clicking hits the empty slot, not the book (unintuitive). | Stress switch 27 / 60 / 120 essays; growth rule (a) add planks vs (b) capped case with the oldest books laid flat in stacks; pulled book stays under the pointer and is the click target |
| 05 corkboard | **Ship it** (F1 小红花, ink pin). Keep the pop-up apply motion as a hover effect "or more", not only on first view. | Flower pops on hover / focus of the lead card, when it returns into view, and when re-pinned; fix the steps(1,end) held-frame bug in the r4 copy |
| 07 about | Take the card out from the **right side**, not the bottom; more realistic for a long card. | Landscape sleeve, mouth on the right, card pulled out along its long axis, then turns upright into the hand (alt: upright sleeve, right-side mouth) |
| 08a / 08b | **Ship them all.** | — |

**Round-4 results.** r4-05 corkboard (ships): the flower presses on first view (session), hover (once per entry), keyboard focus, return into view, and re-pin (on the pin's impact frame), sharing a 1.4 s cooldown; touch relies on return + re-pin. steps(1,end) fixed in `r4-05-unpin.js`. Port-time call: **no "start here" arrow on Building** — the flower already says "this one".
r4-02 pen: coral notice + coral 「 」 on the same 2.2 px pen; on the return stroke the coral line is absorbed into the wheat band's edge (2 → 1 warms it back). Coral on tinted papers is the multiplied value per paper (`--pen`: #D9695A cream, #CB5E49 cork, #C85E47 wheat) because `mix-blend-mode` can't cross the cards' stacking contexts. The crowding was a bug: underlines were placed from rotated bounding boxes; they now hang from the measured baseline (baseline + max(3 px, .18 em)) in the untransformed frame. Spacing rule: whatever follows an underline stays ≥ 10 px below it and ≥ 2× its drop (`r4-02-check.js` measures all 40 live: 0 violations).
r4-07 about: landscape sleeve, mouth on the right; the 7:12 card lies inside top-deepest so 架桥者 · BUILDER clears the lip last; drag right (friction, lip catch, pop), then lift + quarter-turn spring upright (~6° overshoot), then r3's hold/tilt/flip. Right throw flips, left drag re-sleeves (turns back to landscape, pushed in). Sleeve counter-tugs (10% desktop, 25% phone) so the phone pull stays on screen. Alt toggle: short axis (upright sleeve, side mouth); recommended **long axis**.
r4-03 writing: stress switch 27/60/120 (synthetic essays marked 拟). **Growth rule (a): add a plank per ~13–14 books** — 2/5/9 planks, 1,014/2,010/3,338 px at 1440. (b) capped + flat year stacks needs MORE planks (6/10) because a year stack is ~250 px wide, so rejected. Books now fill planks in reading order from the top (round 3's home planks dropped) so a filter gathers its books at the top; a book changing plank fades and drops in; index is sticky; camera follows scroll. Past ~200 essays add a decade jump. Hover→click fix: held pose anchored so the pointer lands 74% down the cover (on the obi); every face of the held book is the hit target; the slot still opens it during the slide-out; tested with real pointer paths (4/4 desktop, 4/4 phone taps). Also fixed a stale-blur bug that re-shelved the clicked book.

**Round-4 triage (2026-09-28).** Fred accepted r4-02, r4-03 (rule a) and r4-05. On r4-07: the flip / put-back regions were unintuitive (a flip attempt re-sleeved the card), and the sleeve can stay **upright** with the card taken out of its side **without rotation**. Round 5 (`r5-07-about`): short-axis only (upright sleeve, mouth on the long right edge, no quarter turn); flip lives on the card (tap, or a flick in either direction); put back is positional (drag the card onto the sleeve, which answers before release; tap the sleeve; Esc / a "put back · 放回" control); a slow drag released elsewhere settles back without flipping.

**Round-5 results.** r5-07 about: upright kraft sleeve, mouth on the long right edge; the card slides out sideways (stick-slip friction, lip catch, pop) and is lifted into the hand beside the sleeve with no turn. Landscape build and toggle removed. Release rule, measured over the last 80 ms: ① card centre over the sleeve (or within 60 px of its mouth) and it *arrived* (< 900 px/s, or lingered ≥ 100 ms) → put back; ② else sideways ≥ 600 px/s (≥ 1.2× vertical) within 170 px of travel, or ≥ 1,400 px/s at any length → flick, flips toward the flick either way; ③ else settles, same face. A tap (< 6 px, < 450 ms) flips; tapping the sleeve or its printed 放回 re-sleeves; Enter/Space flips, Esc puts back. As the card nears, the sleeve answers: the lip bows, a coral 「 」 marks the mouth, the card dips; over the sleeve it half-inserts before release. A card flung fast through the sleeve does not put back (flips if sideways, settles if vertical). Hand-note caption shown on first lift, retired for the session once both acts are used (sessionStorage); fits the stage from 360 to 1440. Phone: the sleeve sits above the card, so put-back is an upward drag that must start sideways (a vertical swipe scrolls the page); tapping the sleeve is the easy path. Verified: 114/114 real-pointer, CDP-touch and keyboard/reduced-motion cases (3 desktop and 2 phone passes of the pointer suite), no console errors, no overflow at 1440 and 390.

**Round-5 triage (2026-09-28).** Fred: a flick is still hard to trigger (only a click reliably flips), which is unintuitive. Separate the two acts further: dragging the card onto the sleeve is the only put-back. Round 6 (`r6-07-about`): the release position alone decides. If the card's centre is over the sleeve zone at release, it goes back in; any other release, of any speed or length, flips it toward the drag's horizontal direction. A tap flips. The "settle" outcome and the flick velocity thresholds are gone, and so are tapping the sleeve and the printed 放回 as pointer put-backs. During a drag the two outcomes preview differently: off the sleeve, the card turns partway in the drag direction; over the sleeve, the turn relaxes and the sleeve answers (lip bows, coral 「 」, half-insert). A pointercancel (the browser took the gesture to scroll) does nothing. Keyboard keeps Enter/Space to flip and Esc plus a focus-only put-back control, because keyboard users cannot drag.

**Round-6 results.** r6-07 about: the release position alone decides. Card centre over the sleeve → back in; anywhere else → flip toward the net horizontal drag (right if purely vertical), at any speed or length; tap flips; tapping the sleeve does nothing while the card is held (tapping the tucked sleeve still pulls the card out). In-drag previews: off the sleeve the card turns 10° as soon as it moves, up to 40° after a third of a card width, and the flip completes from there on release; over the sleeve the turn relaxes and the sleeve takes the card half in (lip bowed, coral 「 」). Phone: on lift the sleeve steps aside to the left edge (a ~34 px strip with the bird), so put-back is a sideways drag left (114 px at 390, 103 px at 360); vertical swipes on the card scroll the page. Keyboard: Enter/Space flip, Esc puts back, and a put-back control appears on focus only. Caveat: a long drag toward the sleeve puts the card back, by design; the half-insert shows it before release. Verified: 82/82 cases (18 pointer cases each at 1440/390/360, 14 CDP-touch at 390 and 360, keyboard and reduced motion), no console errors, no overflow.

**Round-6 triage (2026-09-28).** Fred: on a flip the card moved away from its place *and* flipped; remove the unnecessary movement. Round 7 (`r7-07-about`): the card never translates except into the sleeve. A drag turns it in place (rotateY about its own centre, preview 10°→40°), and on release it completes the flip where it is. The put-back target becomes the pointer: when the pointer enters the sleeve zone, the sleeve takes the card half in (the card's only travel); leave the zone and it returns to its place and resumes the turn preview. Release with the pointer in the zone → back in; anywhere else → flip in place. Tap flips.

**Round-7 results.** r7-07 about: the card's place never moves on a flip. A drag turns it in place (rotateY about its centre, 10°→40° preview), and release completes the flip there. The pointer, not the card, is the put-back target: the sleeve zone is 285 px wide at 1440, 228 px of pointer travel from the card centre; at 390/360 it is the 51 px left-edge strip (160/145 px of travel). In the zone the sleeve takes the card half in, which is its only travel. Measured independently, a 260 px drag: r6 visual centre drifted 247 px; r7 stays inside its footprint, where the only apparent shift (≤ 45 px of bounding-box centre mid-turn) is the turn's perspective, back to 0 px at rest. Agent suite 78/78 (16 pointer cases × 3 widths, 15 touch × 2, keyboard, reduced motion) with the card's place measured every frame (0.0 px), no console errors, no overflow.

**Coral rule, revised by Fred's 02 call:** coral = the pen's live attention (notice underline, focus 「 」 — transient) + point (once per view, retires for the session) + fixed identity (the title's coral character). At rest only point and identity are coral; chosen/current states are the wheat band. This replaces "coral once per view" for interactive marks and applies to every board at port time (r3-08b set hover/focus to ink; switch them to coral when porting).

## 4. Audit findings to fix regardless (the "L0 hygiene" PR)

- `Building.dc.html:141` — animated three-hue gradient on "Fred Agent" → flat ink wordmark (board 05 W2).
- `About.dc.html:53` — glossy tilt glare; `About.dc.html:107–111` — shimmer sweep on FLIP → remove.
- `Writing.dc.html:46,51,180` — pure `#fff` surfaces → paper tokens.
- `Reading.dc.html` `.rnav` — transparent sticky nav on hero posts lets text scroll under it (bug) → board 08a fix.
- `Reading.dc.html` `.mn` — citations set in hand fonts → readable serif/mono (boards 08a/08b).
- `site-nav.css` — nav labels 8.5px at .62 opacity; many 8.5–10px labels → legible sizes.
- `--pencil #938979` on paper is 3.2:1 → `#7A7063` (4.5:1); coral only for marks, not small text.
- Home and About have no `h1`; Writing/Gallery/About have empty `lang`; home forces `lang="zh"`.
- fig numbers don't match section numbers (home fig.01, Gallery fig.02, Writing fig.03, About fig.04) → fig = section number, home = fig.00.
- Mobile portrait/book sprites alias (2464px strip through `background-size`) → size-appropriate derivatives or vector line art.
- Every page uses the same generic fade-and-rise entrance (`fyRise/wRise/gRise/bRise/aRise`) → replaced by the transition system.

## 5. The motion thesis (holds every change)

1. **Two clocks.** Drawings move on the hand's clock (held poses, stepped frames, Nichijou limited animation); paper and chrome move on the physics clock (mass, momentum, one small overshoot, settle).
2. **The pen is the only highlighter.** States are hand-drawn marks (`shared/pen.js`), seeded per element (wobble, not jitter), one confident pass, retract faster. Underlines are level with a blunt end — never a rising tail.
3. **What you touch is what arrives** (shared-element continuity).
4. **Every motion has a cause.** No ambient loops without a subject.
5. **Coral at rest is spent once per view** (the point arrow or fixed identity). Transient pen attention (hover underline, focus 「 」) is also coral, per Fred's round-3 call (§3 "Coral rule"); chosen states are wheat. Several boards moved small accents (pins, label dots, series badges, progress bar) to ink/pencil for this.
6. **Lean away from** gradients, gloss, shimmer, glass blur, blur-to-focus, parallax for its own sake, cursor trails, scroll-jacking, staggered fade-ups.
7. **The opener is the one sanctioned register break** (loud flat colour, hard cuts, 1.5 s), per the design guide's "register breaks are rare and expensive".

Design guide: `.claude/skills/fred-visual-design-guide/references/aesthetic.md`.

## 6. Parked: themes and dark mode

**Issue #16** (<https://github.com/fyang0507/fyang0507.github.io/issues/16>) is the standalone record: role-layer split (ink / fill / tint masks, day parity 1.5/255), print-region and pupil detection, five dark-mode portrait treatments with images, the full generator script, and a research question ("how do you display an animated, tone-rendered portrait in dark mode?"). Its images live on the image-only branch **`issue-16-assets`** — **do not delete that branch** or the issue's images break. The issue references no local files, so `design/2026-09-motion/` can be removed without losing it.

Worth doing even without dark mode: one `site-tokens.css` (role names from `themes.json`) + a lint against literal colours (237 today across 9 files, 8 `:root` blocks). That also enables riso.

## 7. Shipping plan (after triage)

Per the global rules: plan → implement → verify + code review → live test → PR (stacked for dependent work).

- **L0 · hygiene** (one PR): §4 list. Small, safe, immediate.
- **L1 · system** (stacked PRs): production `pen.js` (tiered states, board r2-02) + one shared `motion.js` (spring, damped pendulum, FLIP, sleeping rAF loop — five boards each wrote their own; consolidate) + cross-document View Transitions with the desk→nav continuity (r2-01). Firefox keeps a hard cut.
- **L2 · objects** (one PR per page): shelf + filters (r2-04, r2-03), corkboard (r2-05), gallery (r2-06), about (r2-07), reading (r2-08a, r2-08b).
- **L3 · home**: opener (r2-10) + mobile desk (09 D).

Production prerequisites already identified:
- Generated data: a tiny `latest`/`count` manifest from `scripts/generate-content.py` so home never loads the 775 KB `posts.js`; section headings split at build time (08a currently splits in JS).
- Fonts: regenerate subsets for new Chinese strings (opener needs 载, 已; also 在造写拍关于的日常咔嚓 in JinBuTi) — `uv run scripts/generate-fonts.py`.
- Assets: exported desk-object sprites (boards 01/10 cut them from `desk-scene2-light.png` as mockup-only layers); size-appropriate sprite derivatives; eventually vector line art.
- Transitions: rule must become a real `.site-rule` element (not `::after`); named elements `obj-laptop/book/frame/camera`, `identity`; ~150 lines of `pageswap`/`pagereveal` JS. Mid-flight reversal exists only on the board; across real navigations a click skips to the end.
- Opener: honest loading means a longer wait on cold connections; hard stop 6.5 s. Needs a real device check.
- Not tested on real phones (touch was simulated), real Safari, or Firefox.
- Stepped "held frame" animations: `r2-05-unpin.js` (pin pop, press ticks) and `r2-05-wordmark.js` put `steps(1,end)` on the whole animation instead of per keyframe, so they show one frame only. Use per-keyframe easing when porting (r3-05's seal does).
- Reading hero: keep "no halftone dots at scroll 0" as a tested invariant (r3-08a fix: wedge depth grows from 0 with scroll).
- AGENTS.md and the design guide need updating when rules change (light-only wording, coral budget, pen states).

## 8. File map (`design/2026-09-motion/`)

- `index.html` — the audit (gaps, thesis, findings, cross-board calls, shipping layers) and index of all boards incl. Round 2.
- `BRIEF.md` (round-1 team brief), `OPENER-BRIEF.md`, `R2-BRIEF.md`, `R3-BRIEF.md`, `HANDOFF.md` (this).
- `shared/` — `mock.css` (board chrome), `mock.js` (top bar, board nav list, reduced-motion switch), `pen.js` (seeded hand strokes: loop, underline, scribble, bracket, tick, strike, arrow; draw/erase; annotate).
- Round 1 boards: `01-transitions`, `02-pen`, `03-filters`, `04-shelf`, `05-board`, `06-gallery`, `07-about`, `08-reading`, `09-home` (+ `09-home-mobile`), `10-opener` (board) + `10-opener-a|b|c|d` (desk draws itself / ink bloom / OP→eyecatch / chain-reaction gag), `11-themes`. Each is `NN-name.html` + its css/js.
- Round 5 board: `r5-07-about`. Round 6 board: `r6-07-about`. Round 7 board: `r7-07-about`.
- Round 4 boards: `r4-02-pen`, `r4-03-writing` (+ `r4-03-page.html`), `r4-05-board`, `r4-07-about`.
- Round 3 boards (`R3-BRIEF.md`): `r3-02-pen`, `r3-03-writing` (+ `r3-03-page.html`), `r3-05-board`, `r3-07-about`, `r3-08a-reading` (+ `r3-08a-page.html`), `r3-08b-footnotes`, `r3-10-opener` (+ `r3-10-opener-page.html`).
- Round 2 boards: `r2-01-transitions`, `r2-02-pen`, `r2-03-filters`, `r2-04-shelf`, `r2-05-board`, `r2-06-gallery`, `r2-07-about`, `r2-08a-reading` (+ `r2-08a-page.html` in an iframe), `r2-08b-footnotes`, `r2-10-opener` (board) + `r2-10-opener-cd.html` (`?mode=first|returning`, `?name=a|b|c`, `?autoplay=0`, `?ctl=0`).
- `tools/` — asset generators and verification scripts (tracers, cutters, flash audits, contact sheets, `split_roles.py`) and **`shot-runner.mjs`** (the screenshot runner, see §9).
- `assets-gen/` — generated mockup assets (`10a-*` traced strokes and sprites, `10b-*` ink maps, `10c-*` OP cutouts, `10d-*` masks, `r2-10-*` strips, `roles/` role layers).
- `r2-01-cut-*.png`, `01-cut-*.png` etc. — mockup-only object cutouts.

## 9. Verification tooling

Isolated headless runner (each run gets its own Chromium, so parallel agents never collide). `/tmp` doesn't survive reboots; recreate with:

```sh
mkdir -p /tmp/fyshot && cd /tmp/fyshot && npm init -y >/dev/null && npm i playwright-core
cp <repo>/design/2026-09-motion/tools/shot-runner.mjs /tmp/fyshot/run.mjs
node /tmp/fyshot/run.mjs my-steps.mjs   # steps: export default async (page, ctx) => { … ctx.shot(path) … }
```

It uses the Chromium at `~/Library/Caches/ms-playwright/chromium-1234/`; WebKit (`webkit-2359`) is also installed for Safari-engine checks. Image work: `uv run --with pillow --with numpy [--with scipy] python …` (ephemeral envs, no global installs).

## 10. Git state and lineage

- Branch `redesign/motion-revamp` carries the port and this folder. `design/` is committed but stripped from the Pages artifact by `.github/workflows/deploy-pages.yml`, so the boards never go live.
- Keep the boards (Fred, 2026-09-28): they are the lineage for future iterations, which get sibling folders under `design/`.
- Remote branch `issue-16-assets` — keep (issue #16 images).
- `.playwright-mcp/` at the repo root is Playwright MCP logs; never commit it.

## 11. Next actions

1. Port (branch `redesign/motion-revamp`): plan → L0 hygiene + L1 system → L2 pages + L3 home in parallel → verify + code review → marketing video → PR.
