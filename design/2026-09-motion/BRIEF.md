# Redesign brief — motion & interaction ("the hand that moves")

Shared brief for every mockup board in `design/2026-09-motion/`. Read it fully before building.

## Context

fyang0507.github.io is Fred Yang's dependency-free static personal site (bilingual CN/EN). Read the repo's `AGENTS.md` for conventions. The visual identity is strong and coherent: hand-drawn line art on warm cream paper, one coral accent, a desk scene on the home page whose objects are the doors (laptop → Building, book → Writing, portrait → About, camera → Gallery), a Nichijou-style "日常 ep.01" opener with hopping birds, a bookshelf of essay spines (Writing), a corkboard of pinned project cards (Building), polaroids clipped to clotheslines (Gallery), a flip-able specimen card (About), and a long-form bilingual reading page (Reading).

What's missing is the layer of *detail* that makes a site feel alive and sleek: continuity between pages, state changes that feel authored, physical behaviour for the paper objects, and small moments of noticing. Right now every page shares a generic "fade + rise 14px" entrance, every navigation is a hard cut, hover states are colour swaps, and a few effects contradict Fred's taste (glossy glare on the About card, a shimmer sweep on the FLIP button, an orbiting three-hue gradient on the "Fred Agent" title).

Fred's taste lives in `.claude/skills/fred-visual-design-guide/references/aesthetic.md`. Read it. Thesis: **hand-annotated humanity in a machine age**. Warm, observant, dry, made by a visible hand, with one sharp edge. 萌 not 媚.

## The motion thesis (hold every candidate to this)

1. **Two clocks.** Drawings (characters, sprite objects, anything *illustrated*) move on the **hand's clock**: held key poses, stepped frames (`steps()` or manual frame swaps at ~8–12 fps), anticipation holds, Nichijou limited animation. Paper and chrome (cards, polaroids, sheets, panels, tabs) move on the **physics clock**: springs with mass, momentum, one small overshoot, then settle. A generic 300 ms ease-in-out fade is never the main event.
2. **The pen is the only highlighter.** Hover / focus / selected / current states are expressed with hand-drawn marks from `shared/pen.js` (`loop`, `underline`, `scribble`, `bracket`, `tick`, `strike`, `arrow`) drawn in one confident pass and retracted faster. Not background fills, not glows, not colour swaps alone. Wobble is seeded per element (stable), never re-rolled per frame (jitter reads as nobody).
3. **What you touch is what arrives.** Objects keep identity across states and pages (shared-element continuity, FLIP, View Transitions).
4. **Every motion has a cause.** Map each animation to a physical or narrative cause — pin pivot, wind, pointer velocity, photographic development, page weight, a character noticing you. Unmapped motion is decoration. No ambient loops without a subject.
5. **Lean away from:** gradients, glossy glare/specular highlights, shimmer sweeps, glassmorphism/backdrop blur, blur-to-focus reveals, parallax for its own sake, rotating/animated gradient text, cursor trails, confetti, scroll-jacking, generic staggered "fade-up" reveals, bouncy-cartoon overshoot on everything, SaaS pill chips.
6. **The accent is spent once per view.** Coral `--mark` is the single sharp edge.
7. **Economy.** One dense event against a large quiet remainder. Restraint makes the one moment land.
8. **Bilingual.** Chinese and English together; never Chinese-only interface text. `hand` fonts (Caveat / MuyaoPleased) only for brief annotations; `utility` mono (IBM Plex Mono / Noto Sans SC) for machine-side facts; `display` Fraunces / DingTalk JinBuTi; `text` Fraunces / Noto Serif SC.

## Board format (use `shared/mock.css` classes)

```html
<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>NN · Board name — redesign mockups</title>
<link rel="icon" href="../../favicon.png"><link rel="stylesheet" href="shared/mock.css"> <!-- + your NN-name.css if needed -->
</head><body>
<main class="board">
  <header class="board-head">
    <div><div class="board-no">BOARD NN</div><h1 class="board-title">English title <span class="display-cn">中文标题</span></h1></div>
    <div><p class="board-why">What is wrong today and why it matters (2–4 sentences, specific).</p>
      <p class="evidence">evidence: <code>File.dc.html:123</code> …</p></div>
  </header>
  <section class="cands">  <!-- add class "wide" when each stage needs full width -->
    <article class="cand" id="cand-a">
      <div class="cand-head"><span class="cand-letter">A</span><span class="cand-name">Name <span class="display-cn">中文名</span></span><span class="cand-mech">mechanism · clock</span></div>
      <div class="stage">…live, interactive demo…<span class="hint">hover the laptop ↗</span></div>
      <div class="cand-foot"><div>One or two sentences on what it does and why it fits.<div class="tradeoff"><b>cost</b> … · <b>a11y</b> … · <b>support</b> …</div></div><button class="replay" data-replay="replayA">↻ replay</button></div>
    </article>
    …B, C, (D)…
  </section>
  <section class="verdict"><div class="verdict-k">RECOMMENDATION</div><div><p>Which candidate and why.</p><p>What to combine or watch out for.</p>
    <div class="record">执行模式：多阶段（候选 → 等待 Fred 选择）
表达锚点：…
动作时钟：手的时钟 / 物理时钟 …
映射：原因 → 可见行为 …
线条计划：… / 色彩计划：…（珊瑚色唯一持有者）</div></div></section>
</main>
<script src="shared/pen.js"></script><script src="shared/mock.js"></script><script src="NN-name.js"></script>
</body></html>
```

Mark your recommended candidate with `class="cand pick"`. Each candidate must be a **live, working demo** at believable fidelity, not a picture of an idea — use the real assets and real data so Fred can judge it as his site.

## Real material you can use (paths relative to `design/2026-09-motion/`)

- Illustrations and sprites: `../../assets/` — `desk-scene2-light.png` (1448×1086 home scene), `book-flip2-light.png` (6-frame strip), `frame-exp3-light.png` (4-frame portrait expressions: neutral, blink, smile, surprised), `bird-strip6-light.png` / `bird-strip6-dark.png` (6-frame hop), `nav-{book,laptop,camera,frame}-light.png` (+@2x) tab objects, `identity-sticker-*.png`, `sticker-peek.png`, `sticker-happy.png`, `taku-sit-light.png`, `camera-light.png`.
- Data: `../../content/posts.js` (`window.FY_POSTS`, essays with titles, covers, tags, dates, html), `../../content/photos.js` (`window.FY_PHOTOS`, derived srcsets), `../../content/building-projects.js` (`window.BUILDING_PROJECTS`).
- Images: `../../images/derived/` (never the originals).
- Read the live page you are redesigning (`../../Writing.dc.html` etc.) to copy exact geometry, colours, and copy text. Note: the live pages use a small DC runtime (`support.js`, `<x-dc>`, `{{ }}` templates); mockups must be plain HTML/CSS/JS instead.

## Technical constraints

- Plain HTML/CSS/JS, no dependencies, no build. Only write files inside `design/2026-09-motion/` using your assigned `NN-` prefix. Never modify existing site files, `shared/`, or `BRIEF.md`.
- Every file ≤ 500 lines. Split into `NN-name.html` + `NN-name.css` + `NN-name.js` (or more) by responsibility.
- Animate transform/opacity (and SVG stroke-dashoffset) per frame. rAF loops must stop when idle or offscreen. Target 60 fps on a laptop.
- Honour reduced motion: check `Pen.reduced()` in JS (covers both the media query and the board's "preview reduced motion" switch, which toggles `html.rm` and fires a `mock:rm` event). Every candidate needs a sensible static end state.
- Interactions must work with pointer, touch, and keyboard where applicable (focus-visible, Enter/Space, arrow keys where natural).
- Candidates must be genuinely different mechanisms, not variations of one idea in different colours.
- Chinese copy you add is fine in mockups (they load complete font masters / Google Noto), but keep the site's rule: never Chinese-only UI text.

## Verification (required before you report)

The site is served at `http://127.0.0.1:4173/` (already running). Use the isolated runner — **do not use the Playwright/Chrome MCP browser tools** (other agents share them):

```sh
node /tmp/fyshot/run.mjs /tmp/fyshot/<your-prefix>-steps.mjs
```

where the steps file is `export default async (page, ctx) => { await page.goto(url); …; await ctx.shot('/tmp/fyshot/<prefix>-x.png'); }` (`page` is a Playwright page; `page.setViewportSize`, `page.hover`, `page.mouse`, `page.keyboard`, `page.evaluate` all work). The runner prints console/page errors. Then **look at your screenshots with the Read tool** and critique them honestly against the motion thesis and aesthetic.md. Capture mid-animation frames (use `page.waitForTimeout`) to check motion states, not just end states. Check 1440×900 and 390×844. Iterate until it is genuinely good — fix clipping, overlap, broken layout, ugly frames. The one expected console error is none; include a favicon link to avoid a 404.

## Report back

Keep it short: the file list, one line per candidate (what it is + whether it fully works), your recommendation, known limitations, and the paths of 2–3 screenshots that best show the board.
