/* lib/reading/rail.js — the pencil margin, drawn from whatever structure the essay has (the build splits it:
   post.landmarksZh/En = {kind, marks}). Desktop: a graphite line in the left margin draws as you read; each landmark
   is a tick with a utility-mono label (1.0 · （一） · IV · 广州惯性 · 3 min), and the one you are in carries the pen's
   loop in wheat (the chosen colour; coral is kept for the pen's live attention). Hover or focus a label to preview its
   first line on a paper slip; click goes there. Phone: the strip host's hairline doubles as the line, with ticks on
   it and a "3.0 / 10" counter.
   End of scroll: the rail is sticky inside a column that ends with the essay, so it leaves with it; the reading line
   sweeps from 30% of the window to its bottom over the last screen, so at 100% the last landmark is reached and the
   line closes with its end tick; every value comes from the clamped scroll, so overscroll cannot un-draw it.
   Styles in rail.css; needs pen.js (window.Pen). The labels' 「 」 is the page's to draw: on Reading, states.js puts
   a FocusMark (pen-tier.js) around a focused label's .rail-lab-t, on :focus-visible only, and drops it on blur.
   The context: Reading's comes from bus.js, and any other page that carries the rail supplies the same shape.
     root          holds the text column, an <article> (the rail sits in its margin once the article's left edge is
                   180px or more into the window, else the strip shows), and in the article's positioned column an
                   empty .rail-col for the rail
     strip         a positioned host for the phone strip, which is appended at its left edge, g.vw wide (the page
                   sets .rail-strip's top)
     count         the host for the phone counter, which goes in as its first child
     g             the layout, fresh before each onLayout: b0 (the document y of .rail-col's top), n1 (the height of
                   whatever sticks at the top, the same as --n1), vw, vh, sL (the scroll from which a layout shows the
                   rail at once, with no arrival), rm (reduced motion: the rail is always shown, and its line steps
                   from landmark to landmark)
     post          {id, readingMin}: the id seeds the strokes, readingMin is the minute count
     lang()        'zh' | 'en', also a seed
     body()        the text; an .appendix inside it ends the line 30px above itself
     marks()       [{id, kind: 'sec' | 'head' | 'fig' | 'min', label, title, peek, minute}]; id names an element
     kind()        'sections' | 'headings' | 'figures' | 'minutes', possibly with '+minutes'
     top(el)       el's document y
     y(), max()    the scroll clamped to [0, max], and max
     jump(el, y)   scroll to y and take the focus to el; scrollTo(y) for a mark whose element is missing
     onLayout(fn)  fn after every layout, before the scroll pass that follows it
     onScroll(fn)  fn(y), y clamped
     onLand(fn)    fn(true) when the rail arrives (Reading: the hero's landing), fn(false) when it leaves
   Test hooks: .rail[data-cur] (index of the current landmark), .rail[data-done]. Ported from design/2026-09-motion r2-08a-rail.js. */
import { esc } from './notes.js';

const NS = 'http://www.w3.org/2000/svg', W = 150, LX = 130;   // rail width; the line sits 56px left of the text column

export function initRail(ctx) {
  const html = document.documentElement, col = ctx.root.querySelector('.rail-col');
  col.innerHTML = '<nav class="rail" aria-label="Where you are in this essay · 读到哪儿">' +
    '<svg class="rail-svg" width="' + W + '" aria-hidden="true"><path class="rail-guide"/><path class="rail-ink"/><g class="rail-ticks"></g><path class="rail-end"/></svg>' +
    '<ol class="rail-list"></ol><div class="rail-peek" aria-hidden="true"><span class="rail-peek-k"></span><span class="rail-peek-t"></span></div></nav>';
  const rail = col.firstChild, svg = rail.querySelector('svg'), guide = svg.querySelector('.rail-guide'), ink = svg.querySelector('.rail-ink');
  const tickG = svg.querySelector('.rail-ticks'), endMark = svg.querySelector('.rail-end'), list = rail.querySelector('.rail-list');
  const peek = rail.querySelector('.rail-peek');
  const strip = document.createElementNS(NS, 'svg');          // phone: ticks + ink on the strip host's hairline
  strip.setAttribute('class', 'rail-strip'); strip.setAttribute('aria-hidden', 'true');
  strip.innerHTML = '<g class="strip-ticks"></g><path class="strip-ink"/>';
  ctx.strip.appendChild(strip);
  const stripInk = strip.querySelector('.strip-ink'), stripTicks = strip.querySelector('.strip-ticks');
  const count = document.createElement('span');
  count.className = 'rail-count'; count.setAttribute('aria-live', 'polite');
  count.innerHTML = '<span class="rc-no"></span><span class="rc-of"></span>';
  ctx.count.insertBefore(count, ctx.count.firstChild);
  const countNo = count.firstChild, countOf = count.lastChild;
  const S = { marks: [], top: 0, end: 1, H: 0, L: 0, sL: 0, cur: -2, done: false, mode: '', on: false, loop: null };
  const lit = (on) => [rail, strip, count].forEach((e) => e.classList.toggle('on', on));   // the rail, and on phones its strip and counter

  function wobble(len, seed, vertical, x0) {
    const r = Pen.rng(seed), pts = [], n = Math.max(2, Math.round(len / 46));
    for (let i = 0; i <= n; i++) {
      const t = i / n, off = (r() - .5) * 1.6 + Math.sin(t * 7 + r()) * .45;
      pts.push(vertical ? [x0 + off, t * len] : [t * len, 3 + off * .5]);
    }
    return Pen.smooth(pts);
  }
  function dash(p) { const L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 8); return L; }

  function layout() {
    const g = ctx.g, body = ctx.body(), app = body.querySelector('.appendix'), marks = ctx.marks();
    const art = ctx.root.querySelector('article').getBoundingClientRect();
    S.mode = art.left >= 180 ? 'rail' : 'strip';
    html.classList.toggle('rail-mode', S.mode === 'rail'); html.classList.toggle('strip-mode', S.mode === 'strip');
    S.top = g.b0;
    S.end = app ? ctx.top(app) - 30 : ctx.top(body) + body.offsetHeight;
    // the column runs to the end of the post body (references included), so the finished rail is still in view at 100%;
    // the pencil itself maps only the essay text [top, end]
    const colH = Math.max(40, S.end - S.top), boxH = Math.max(colH, ctx.top(body) + body.offsetHeight - S.top);
    col.style.height = boxH + 'px';
    S.H = Math.round(Math.min(colH, g.vh - (g.n1 + 28) - 44));
    rail.style.height = S.H + 'px';
    svg.setAttribute('height', S.H + 24);
    const d = wobble(S.H, 'rail-' + ctx.post.id + ctx.lang(), true, LX);
    guide.setAttribute('d', d); ink.setAttribute('d', d);
    S.L = dash(ink); ink.style.strokeDashoffset = S.L;
    guide.style.strokeDasharray = ''; guide.style.strokeDashoffset = '';
    endMark.setAttribute('d', 'M' + (LX - 6) + ' ' + (S.H + 5) + ' q 3 4 6 6 q 3 -5 10 -13');
    const eL = dash(endMark); endMark.style.strokeDashoffset = S.done ? 0 : eL + 4;

    // ticks at true positions; labels nudged apart (a minute label that would collide with a structural one is dropped)
    S.marks = marks.map((m) => {
      const el = document.getElementById(m.id), y = el ? ctx.top(el) : S.top;
      return { m: m, el: el, y: y, ry: Math.round((y - S.top) / colH * S.H) };
    });
    tickG.innerHTML = ''; list.innerHTML = ''; stripTicks.innerHTML = '';
    let lastY = -99;
    S.marks.forEach((s) => {
      const r = Pen.rng('tick-' + s.m.id), minor = s.m.kind === 'min', w = minor ? 4 : 7;
      const t = Pen.path(Pen.smooth([[LX - w, s.ry + (r() - .5)], [LX, s.ry + (r() - .5) * .8], [LX + w, s.ry - .5 - r() * .8]]), { color: 'currentColor', width: minor ? 1.2 : 1.5 });
      t.setAttribute('class', 'rail-tick' + (minor ? ' minor' : '')); tickG.appendChild(t); s.tick = t;
      const ly = Math.max(s.ry, lastY + 20);
      if (minor && ly - s.ry > 6) { s.lab = null; return; }
      lastY = ly;
      const li = document.createElement('li');
      li.innerHTML = '<a class="rail-lab rl-' + s.m.kind + '" href="#' + s.m.id + '" style="top:' + (ly - 11) + 'px"><span class="rail-lab-t">' + esc(s.m.label) + '</span></a>';
      li.firstChild.setAttribute('aria-label', s.m.label + (s.m.peek ? ' — ' + s.m.peek : ''));
      list.appendChild(li); s.lab = li.firstChild;
    });
    strip.setAttribute('width', g.vw); strip.setAttribute('height', 10);
    stripInk.setAttribute('d', wobble(g.vw, 'strip-' + ctx.post.id, false));
    S.sL = dash(stripInk); stripInk.style.strokeDashoffset = S.sL;
    S.marks.forEach((s) => {
      const x = Math.round(s.ry / Math.max(1, S.H) * g.vw);
      const p = Pen.path('M' + x + ' ' + (s.m.kind === 'min' ? 1.5 : 0) + ' L' + (x + .4) + ' 6', { color: 'currentColor', width: 1.3 });
      p.setAttribute('class', 'strip-tick'); stripTicks.appendChild(p); s.stick = p;
    });
    // the counter keeps the width of its widest text, so the nav title's slot (hero.js measures it next) never moves
    count.style.minWidth = '';
    if (S.mode === 'strip') {
      let wide = 0;
      for (let i = -1; i < S.marks.length; i++) { const c = countText(i); countNo.textContent = c[0]; countOf.textContent = c[1]; wide = Math.max(wide, count.scrollWidth); }
      count.style.minWidth = Math.ceil(wide) + 'px';
    }
    if (S.loop) { S.loop.destroy(); S.loop = null; }
    S.cur = -2; rail.dataset.cur = '-1';
    S.on = g.rm || ctx.y() >= g.sL - .5;                   // reduced motion: no landing event, the rail is simply there
    lit(S.on);
  }

  // the reading line: 30% down the reading area, sweeping to the window's bottom over the last screen of scroll
  function readingLine(y) {
    const g = ctx.g, m = ctx.max(), R = Math.min(m, g.vh * .8);
    const t = R > 0 ? Math.min(1, Math.max(0, (y - (m - R)) / R)) : 1, e = t * t * (3 - 2 * t);
    return y + g.n1 + (g.vh - g.n1) * (.3 + .7 * e);
  }
  function update(y) {
    const line = readingLine(y);
    let cur = -1;
    for (let i = 0; i < S.marks.length; i++) if (S.marks[i].y <= line + 1) cur = i;
    let p = Math.min(1, Math.max(0, (line - S.top) / (S.end - S.top)));
    if (ctx.g.rm) p = p >= 1 ? 1 : cur >= 0 ? S.marks[cur].ry / S.H : 0;   // reduced motion: the line steps per landmark
    ink.style.strokeDashoffset = (S.L * (1 - p)).toFixed(1);
    stripInk.style.strokeDashoffset = (S.sL * (1 - p)).toFixed(1);
    S.marks.forEach((s, j) => {
      const read = s.ry <= p * S.H + .5;
      s.tick.classList.toggle('read', read); s.stick.classList.toggle('read', read);
      if (s.lab) s.lab.classList.toggle('read', j < cur);
    });
    if (S.marks.length) { if (cur !== S.cur) setCurrent(cur); }
    else { const c = countText(-1, p); countNo.textContent = c[0]; countOf.textContent = c[1]; }   // no landmarks: minutes read
    const done = p >= 1;
    if (done !== S.done) { S.done = done; rail.dataset.done = String(done); done ? Pen.draw(endMark, { duration: 280 }) : Pen.erase(endMark, { duration: 140 }); }
  }
  function setCurrent(i) {
    const prev = S.cur; S.cur = i; rail.dataset.cur = String(i);
    if (prev >= 0 && S.marks[prev] && S.marks[prev].lab) { S.marks[prev].lab.classList.remove('cur'); S.marks[prev].lab.removeAttribute('aria-current'); }
    if (S.loop) { const old = S.loop; old.hide(); setTimeout(() => old.destroy(), 260); S.loop = null; }
    const s = S.marks[i], c = countText(i);
    countNo.textContent = c[0]; countOf.textContent = c[1];
    if (!s) return;
    let target = S.mode === 'rail' ? (s.lab || nearestLab(i)) : countNo;
    if (!target) return;
    if (S.mode === 'rail') { target.classList.add('cur'); target.setAttribute('aria-current', 'location'); target = target.querySelector('.rail-lab-t'); }
    S.loop = Pen.annotate(target, 'loop', { manual: true, seed: 'loop-' + s.m.id, pad: S.mode === 'rail' ? 5 : 4, width: 1.7, duration: 360, color: 'var(--hl-ink)' });
    if (S.on) S.loop.show();
  }
  // phone counter: "3.0 / 10" for sections, "2 / 3" for headings, "3 / 6 min" for minute ticks
  // phone counter: "3.0 / 10" in sections, "2 / 3" in headings or figures, "3 / 6 min" on a minute tick; with no
  // landmarks at all it counts the minutes read (p = progress 0…1)
  function countText(i, p) {
    const base = ctx.kind().replace('+minutes', ''), M = ctx.post.readingMin || 1, s = S.marks[i];
    const struct = S.marks.filter((x) => x.m.kind !== 'min');
    if (!S.marks.length) return [String(Math.round((p == null ? 1 : p) * M)), ' / ' + M + ' min'];
    if (!s) return base === 'minutes' || !struct.length ? ['0', ' / ' + M + ' min'] : ['—', ' / ' + struct.length];
    if (s.m.kind === 'min') return [String(s.m.minute), ' / ' + M + ' min'];
    return [base === 'sections' ? s.m.label : String(struct.indexOf(s) + 1), ' / ' + struct.length];
  }
  function nearestLab(i) { for (let j = i; j >= 0; j--) if (S.marks[j].lab) return S.marks[j].lab; return null; }

  // the rail arrives with the landing: the pen that drew the nav hairline goes on down the margin
  function show(on) {
    if (on === S.on) return;
    S.on = on;
    lit(on);
    if (on && S.loop) S.loop.show();
    if (!on || ctx.g.rm || S.mode !== 'rail') return;
    const L = guide.getTotalLength();
    guide.style.strokeDasharray = L + ' ' + (L + 8);
    guide.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 640, delay: 260, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'backwards' });
    S.marks.forEach((s) => {
      const dl = 260 + s.ry / S.H * 560;
      Pen.draw(s.tick, { duration: 110, delay: dl });
      if (s.lab) s.lab.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: dl + 60, fill: 'backwards', easing: 'steps(1,end)' });
    });
  }
  ctx.onLand(show);

  // peek: a paper slip with the landmark's first line (physics clock: one small overshoot, then settle)
  function showPeek(a) {
    const s = S.marks.find((x) => x.lab === a); if (!s) return;
    peek.querySelector('.rail-peek-k').textContent = s.m.label + (s.m.kind === 'min' ? ' · 大约读到这里 about here' : s.m.kind === 'head' ? ' · 小标题 heading' : s.m.title ? ' · 本节 section' : ' · 本节首句 first line');
    peek.querySelector('.rail-peek-t').textContent = s.m.peek || s.m.title || '';
    peek.style.top = Math.min(S.H - 70, Math.max(-6, s.ry - 24)) + 'px';
    peek.classList.add('on');
  }
  const hidePeek = () => peek.classList.remove('on');
  list.addEventListener('pointerover', (e) => { const a = e.target.closest('.rail-lab'); if (a) showPeek(a); });
  list.addEventListener('pointerout', (e) => { if (!e.relatedTarget || !list.contains(e.relatedTarget)) hidePeek(); });
  list.addEventListener('focusin', (e) => showPeek(e.target));
  list.addEventListener('focusout', hidePeek);
  list.addEventListener('click', (e) => {
    const a = e.target.closest('.rail-lab'); if (!a) return;
    e.preventDefault();
    const s = S.marks.find((x) => x.lab === a);
    if (s.el) ctx.jump(s.el, s.y - ctx.g.n1 - 28); else ctx.scrollTo(s.y - ctx.g.n1 - 28);
  });
  list.addEventListener('keydown', (e) => {
    const labs = [].slice.call(list.querySelectorAll('.rail-lab')), i = labs.indexOf(document.activeElement);
    if (i < 0) return;
    const j = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? labs.length - 1 : -9;
    if (j === -9) return;
    e.preventDefault(); labs[Math.max(0, Math.min(labs.length - 1, j))].focus();
  });

  ctx.onLayout(layout);
  ctx.onScroll(update);
}
