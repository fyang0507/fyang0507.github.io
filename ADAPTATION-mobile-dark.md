# Adaptation Notes — Mobile & Dark Mode

_Audit companion doc. The site was audited and fixed for **light / desktop** only.
This is the checklist of what still needs building for **mobile** and **dark mode**
to reach the four-way parity (zh/en × light/dark) that `DESIGN.md` calls a
non-negotiable. Nothing below has been changed in the pages — it is a to-do map._

**Legend:** ✅ already handled · ⚠️ partial · ❌ missing.
Priority: **P0** = broken/unusable · **P1** = parity gap · **P2** = polish.

---

## 0. Reference implementations (copy from these)

Two pages already do it right — lift their mechanics rather than reinventing:

- **`index.html`** — full `html.dark` palette block, `.im-l/.im-d` asset
  swapping (light vs dark PNGs), `@media (hover:none)` fallbacks that auto-play the
  hover animations on touch, a `<760px` breakpoint that swaps the interactive desk
  for a plain text nav (`.mnav`), and an inline boot script that reads the saved
  language before first paint.
- **`Reading.dc.html`** — full `html.dark` palette, a boot script that reads BOTH
  `fy-theme` and `fy-lang` from `localStorage`, live `中/EN` + `◐` toggle buttons,
  and `@media(max-width:1080px / 640px)` rules that collapse the desktop margin-
  notes into inline callout boxes and tighten prose. This is the responsive/theming
  gold standard for the project.

### The dark palette (the one to paste)
```css
html.dark{
  --paper:#1E1913; --paper2:#282018; --ink:#EFE5D3; --soft:#b0a591;
  --pencil:#8f8471; --mark:#EE8E72; --line:#37301f;
  --card-shadow:0 1px 2px rgba(0,0,0,.3),0 14px 30px rgba(0,0,0,.35);
}
html.dark body::before{mix-blend-mode:screen;opacity:.03}
```
### The boot script (read saved prefs before first paint — add to every page)
```html
<script>(function(){var r=document.documentElement;
  var t=localStorage.getItem('fy-theme'); var l=localStorage.getItem('fy-lang')||'zh';
  if(t==='dark')r.classList.add('dark');
  r.classList.add(l==='zh'?'lang-zh':'lang-en'); r.setAttribute('lang',l);})();</script>
```

---

## 1. Global gaps (apply to all four index pages)

**Dark mode — ❌ `About`, `Writing`, `Gallery`, `Building`.**
These four define **only** the light `:root` palette — there is no `html.dark`
block, no theme toggle, and no boot script. A visitor who flips to dark on Home or
Reading will see those two pages go dark and then **snap back to light** on any of
these four. To fix each page:
1. Paste the `html.dark` block + `body::before` override above.
2. Paste the boot script so the saved theme applies before paint.
3. Replace hard-coded hex literals with `var(--…)` tokens wherever the value should
   theme (these pages inline a lot of raw `#FBF6EC` / `#33302B` / `#E4DAC7`).
4. Swap `-light.png` art for `-dark.png` via the `.im-l/.im-d` twin-image pattern
   (all needed dark variants exist — see per-page notes; they are in
   `archive/unused-assets/`, move them back to the active `assets/` folder).
5. Add the live `中/EN` + `◐` toggle buttons (lift the `.btn` markup + handlers
   from `Reading.dc.html`) so dark/lang are reachable from these pages too.

**CN/EN language parity — ⚠️ `About`, `Writing`, `Gallery`, `Building`.**
`Home v2` and `Reading` split every string into `<span class="en">…</span><span
class="zh">…</span>` and toggle them. The four index pages are **zh-primary** — most
strings are Chinese with English baked into the same run (e.g. `back to the desk`),
so there is nothing to toggle. Reaching true parity means restructuring their copy
into `.en/.zh` pairs. This is a content task, not a CSS one — scope it separately.

**Paper-grain overlay.** The `body::before` noise texture uses
`mix-blend-mode:multiply` (correct for light). In dark it must become `screen` at
lower opacity (in the block above) or it muddies the charcoal.

---

## 2. Per-page — DARK MODE

### About — ❌
- Card **front** hard-codes `#FBF6EC / #33302B / #E4DAC7 / #938979` and won't theme.
  The card **back** ("night form") is intentionally dark (`#1c1712`) — that's the
  day/night *concept*, independent of site theme. Decision needed: in dark mode,
  does the front also darken, or does the flip concept override the theme? Suggest
  theming the page chrome (header, bg, captions) but leaving the day/night card art
  as-is so the concept survives.
- Art: `taku-sit-light.png`, `camera-light.png` are light-only. Dark variants
  **exist** (`taku-sit-dark.png`, `camera-dark.png`) — wire them via `.im-l/.im-d`.

### Writing — ❌
- Book-spine colours are a hard-coded cream palette (`TONES` array in the logic +
  series `#3d362a`); preview stripes (`.ph`) and preview-card `#fff` are literals.
  All need dark tunings.
- Art: `book-flip2-light.png`, `bird-strip6-light.png` → dark variants exist.
  `sticker-happy.png` has **no** dark variant (mono motif; likely reads OK on
  charcoal, verify).

### Gallery — ❌
- Cards/pegs mostly use `var(--ink)/var(--paper)` (themeable ✅) but the whole page
  lacks the dark block, so it never triggers.
- Art: `camera-light.png`, `bird-strip-light.png` → dark variants exist;
  `sticker-happy.png`, `sticker-peek.png` are mono (verify on dark).
- `image-slot` (drop-in photo component) renders user photos — confirm its own
  empty-state chrome reads on a dark page.

### Building — ❌ (heaviest lift)
- Almost nothing uses tokens: board surface `#EFE7D4` + grid `#e4dac7`, card paper
  `#FBF6EC`, torn edge `#E4DAC7`, pin colours (`#a5453a` repo · `#3d5c52` tool ·
  `#33302B` talk · `#a5822c` misc), flagship `#D9695A` are all literal. A full dark
  pass must retint the corkboard, grid, card papers and pin highlights.
- Props (`prop-pencil/ruler/scissors/eraser/tape/paperclip.png`) have **no** dark
  variants — they're neutral stationery; test whether they read on charcoal or need
  a subtle drop-shadow/outline.
- `bird-strip-light.png` → `bird-strip-dark.png` exists.

---

## 3. Per-page — MOBILE

### Reading — ✅ (reference)
Fully responsive: `1080px` collapses right-margin notes into inline callout boxes;
`640px` tightens padding and prose size. No work needed.

### Home v2 — ✅ / ⚠️
`<760px` hides the desk annotations + arrows and shows the `.mnav` text menu; the
scene stays full-width and hover animations auto-loop via `@media (hover:none)`.
Works. ⚠️ Verify the iris-in opener animation performs on low-end phones (it runs a
JS flock + SVG mask); consider defaulting `opener` to `off`/`session` on small
screens.

### Writing — ⚠️
`<760px` hides the shelf (`.shelf-wrap`) and shows a swipe card-stack
(`.mobile-list`). The signature shelf viz is desktop-only — acceptable, but note the
mobile experience is a different metaphor. **A residual helper line
(`← 滑走看下一篇 · 滑回看上一篇 →`) is still in the mobile view** — it was left in
because it is the only affordance for the swipe deck; remove it if/when the deck
gets a visible arrow/dot affordance instead.

### Gallery — ⚠️
`<640px` swaps the three depth-lines for a vertical zig-zag garland
(`.mobile-garland`). Works. Gap: the **641–1023px** band (tablet portrait) still
gets the full-width desktop three-line layout, which overflows into horizontal
scroll. Add an intermediate breakpoint or let the garland start earlier (~900px).

### Building — ❌ **P0**
Only rule is `@media(max-width:1120px){.board-scroll{overflow-x:auto}}` — i.e. below
1120px you just horizontally scroll a fixed **1060px** corkboard. On a ~375px phone
that's a tiny slice of a huge board — effectively unusable. Needs a real mobile
treatment: either scale the whole board down to viewport width
(`transform:scale()` on a wrapper), or reflow the six pinned cards into a single
vertical list (keep the pin + torn-paper styling, drop the absolute positioning).

### About — ❌ **P0 (interaction) + ⚠️ (layout)**
- **P0:** the card flip is **hover-only** (`onMouseEnter`/`onMouseLeave`). On touch
  there is no way to flip to the night form (a tap fires `mouseenter` once with no
  toggle-back). Add a tap/click handler that toggles `revealed` for touch devices.
- **Layout:** the page has **no** media queries. The field-guide card is a fixed
  `360px` — fits most phones but is tight at 320px, and the surrounding padding/
  captions aren't tuned for small screens. Add a `<640px` pass (scale the card to
  `min(360px, 88vw)`, relax the header).

---

## 4. Suggested order of work

1. **P0 · Building mobile reflow** — the only page that is unusable on a phone.
2. **P0 · About flip on touch** — the night form is unreachable on mobile.
3. **P1 · Dark mode** for About → Gallery → Writing → Building (Building last; most
   literals). Paste the palette + boot script + toggle, then token-ise hex + swap
   art. Move the needed `-dark.png` assets back from `archive/unused-assets/`.
4. **P1 · Theme/lang toggle controls** on the four index pages (lift from Reading).
5. **P2 · CN/EN content parity** on the four index pages (restructure to `.en/.zh`).
6. **P2 · Gallery tablet breakpoint** + remove the residual Writing swipe hint.

**Done-when:** each page screenshots cleanly in all four combinations
(zh-light, zh-dark, en-light, en-dark) at desktop, tablet and phone widths, with
coral remaining the only saturated accent and `--soft`/`--pencil` text clearing
WCAG AA on both papers.
