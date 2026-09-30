/* design/2026-09-building · the principles' table of contents is Reading's pencil margin (lib/reading/rail.js), with the
   same vocabulary: a graphite line in the left margin that inks as you read, a tick per principle with its mono number,
   the one you are in circled by the pen's loop in wheat (chosen, never coral), a paper slip previewing a principle's
   title and first line on hover or focus, and a click that goes there. Phone: the ticks sit on the edge of the page's
   sticky strip (each candidate's chapter strip) and a "03 / 11" counter rides at its end.
   The landmarks come from the page (section.pj-pr[id] with its .pr-no / .pr-t) instead of Reading's build-time
   landmarks; in production this is rail.js with a second, smaller ctx, not a copy (README.md, costs). */
const NS = 'http://www.w3.org/2000/svg', W = 150, LX = 130;
const esc = (v) => String(v).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]);

export function initRail(root, o) {
  const col = root.querySelector('.rail-col'), prose = root.querySelector('.pj-prose'), strip = o.strip();
  if (!col || !prose) return null;
  col.innerHTML = '<nav class="rail" aria-label="Where you are in the principles · 读到哪儿"><svg class="rail-svg" width="' + W + '" aria-hidden="true"><path class="rail-guide"/><path class="rail-ink"/><g class="rail-ticks"></g><path class="rail-end"/></svg>' +
    '<ol class="rail-list"></ol><div class="rail-peek" aria-hidden="true"><span class="rail-peek-k"></span><span class="rail-peek-t"></span></div></nav>';
  const rail = col.firstChild, svg = rail.querySelector('svg'), guide = svg.querySelector('.rail-guide'), ink = svg.querySelector('.rail-ink');
  const tickG = svg.querySelector('.rail-ticks'), endMark = svg.querySelector('.rail-end'), list = rail.querySelector('.rail-list'), peek = rail.querySelector('.rail-peek');
  const bar = document.createElementNS(NS, 'svg');
  bar.setAttribute('class', 'rail-strip'); bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<g class="strip-ticks"></g><path class="strip-ink"/>';
  const count = document.createElement('span');
  count.className = 'rail-count'; count.setAttribute('aria-live', 'polite');
  count.innerHTML = '<span class="rc-no"></span><span class="rc-of"></span>';
  if (strip) { strip.appendChild(bar); strip.appendChild(count); }
  const countNo = count.firstChild, countOf = count.lastChild, stripInk = bar.querySelector('.strip-ink'), stripTicks = bar.querySelector('.strip-ticks');
  const flag = document.documentElement;   // the mode classes: the phone strip lives outside the essay's column
  const S = { marks: [], top: 0, end: 1, H: 0, L: 0, sL: 0, cur: -2, done: false, mode: '', on: false, loop: null, head: 0 };
  const top = (el) => el.getBoundingClientRect().top + scrollY;

  function wobble(len, seed, vertical, x0) {
    const r = Pen.rng(seed), pts = [], n = Math.max(2, Math.round(len / 46));
    for (let i = 0; i <= n; i++) { const t = i / n, off = (r() - .5) * 1.6 + Math.sin(t * 7 + r()) * .45; pts.push(vertical ? [x0 + off, t * len] : [t * len, 3 + off * .5]); }
    return Pen.smooth(pts);
  }
  function dash(p) { const L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 8); return L; }

  function layout() {
    S.mode = prose.getBoundingClientRect().left >= 190 ? 'rail' : 'strip';
    flag.classList.toggle('rail-mode', S.mode === 'rail'); flag.classList.toggle('strip-mode', S.mode === 'strip');
    S.head = o.head();
    S.top = top(prose); S.end = S.top + prose.offsetHeight;
    const colH = Math.max(40, S.end - S.top);
    col.style.height = colH + 'px';
    S.H = Math.round(Math.min(colH, innerHeight - S.head - 64));
    rail.style.top = S.head + 24 + 'px';
    rail.style.height = S.H + 'px';
    svg.setAttribute('height', S.H + 24);
    const d = wobble(S.H, 'rail-' + location.pathname, true, LX);
    guide.setAttribute('d', d); ink.setAttribute('d', d);
    S.L = dash(ink); ink.style.strokeDashoffset = S.L;
    endMark.setAttribute('d', 'M' + (LX - 6) + ' ' + (S.H + 5) + ' q 3 4 6 6 q 3 -5 10 -13');
    const eL = dash(endMark); endMark.style.strokeDashoffset = S.done ? 0 : eL + 4;
    S.marks = [...prose.querySelectorAll('.pj-pr[id]')].map((el) => {
      const y = top(el), no = el.querySelector('.pr-no'), t = el.querySelector('.pr-t'), p = el.querySelector('p');
      return { id: el.id, el, y, ry: Math.round((y - S.top) / colH * S.H), label: no ? no.textContent.trim() : '·', title: t ? t.textContent.trim() : '', peek: p ? p.textContent.trim() : '' };
    });
    tickG.innerHTML = ''; list.innerHTML = ''; stripTicks.innerHTML = '';
    let lastY = -99;
    S.marks.forEach((s) => {
      const r = Pen.rng('tick-' + s.id), w = 7;
      const t = Pen.path(Pen.smooth([[LX - w, s.ry + (r() - .5)], [LX, s.ry + (r() - .5) * .8], [LX + w, s.ry - .5 - r() * .8]]), { color: 'currentColor', width: 1.5 });
      t.setAttribute('class', 'rail-tick'); tickG.appendChild(t); s.tick = t;
      const ly = Math.max(s.ry, lastY + 20); lastY = ly;
      const li = document.createElement('li');
      li.innerHTML = '<a class="rail-lab" href="#' + s.id + '" style="top:' + (ly - 11) + 'px"><span class="rail-lab-t">' + esc(s.label) + '</span></a>';
      li.firstChild.setAttribute('aria-label', s.label + ' — ' + s.title);
      list.appendChild(li); s.lab = li.firstChild;
    });
    const sw = strip ? strip.getBoundingClientRect().width : innerWidth;
    bar.setAttribute('width', sw); bar.setAttribute('height', 10);
    stripInk.setAttribute('d', wobble(sw, 'strip-' + location.pathname, false));
    S.sL = dash(stripInk); stripInk.style.strokeDashoffset = S.sL;
    S.marks.forEach((s) => {
      const x = Math.round(s.ry / Math.max(1, S.H) * sw);
      const p = Pen.path('M' + x + ' 0 L' + (x + .4) + ' 6', { color: 'currentColor', width: 1.3 });
      p.setAttribute('class', 'strip-tick'); stripTicks.appendChild(p); s.stick = p;
    });
    countOf.textContent = ' / ' + S.marks.length;
    if (S.loop) { S.loop.destroy(); S.loop = null; }
    S.cur = -2; rail.dataset.cur = '-1';
    update();
  }

  // the reading line: 30% down the reading area, sweeping to the window's bottom over the last screen (Reading's rule)
  function readingLine(y) {
    const m = document.documentElement.scrollHeight - innerHeight, R = Math.min(m, innerHeight * .8), t = R > 0 ? Math.min(1, Math.max(0, (y - (m - R)) / R)) : 1, e = t * t * (3 - 2 * t);
    return y + S.head + (innerHeight - S.head) * (.3 + .7 * e);
  }
  function update() {
    const y = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight)), line = readingLine(y);
    let cur = -1;
    for (let i = 0; i < S.marks.length; i++) if (S.marks[i].y <= line + 1) cur = i;
    let p = Math.min(1, Math.max(0, (line - S.top) / (S.end - S.top)));
    if (Motion.reduced()) p = p >= 1 ? 1 : cur >= 0 ? S.marks[cur].ry / S.H : 0;
    ink.style.strokeDashoffset = (S.L * (1 - p)).toFixed(1);
    stripInk.style.strokeDashoffset = (S.sL * (1 - p)).toFixed(1);
    S.marks.forEach((s, j) => { const read = s.ry <= p * S.H + .5; s.tick.classList.toggle('read', read); s.stick.classList.toggle('read', read); s.lab.classList.toggle('read', j < cur); });
    if (cur !== S.cur) setCurrent(cur);
    const on = line >= S.top - 40;
    if (on !== S.on) show(on);
    const done = p >= 1;
    if (done !== S.done) { S.done = done; rail.dataset.done = String(done); done ? Pen.draw(endMark, { duration: 280 }) : Pen.erase(endMark, { duration: 140 }); }
  }
  function setCurrent(i) {
    const prev = S.cur; S.cur = i; rail.dataset.cur = String(i);
    if (prev >= 0 && S.marks[prev]) { S.marks[prev].lab.classList.remove('cur'); S.marks[prev].lab.removeAttribute('aria-current'); }
    if (S.loop) { const old = S.loop; old.hide(); setTimeout(() => old.destroy(), 260); S.loop = null; }
    const s = S.marks[i];
    countNo.textContent = s ? s.label : '—';
    if (!s) return;
    let target = S.mode === 'rail' ? s.lab : countNo;
    if (S.mode === 'rail') { target.classList.add('cur'); target.setAttribute('aria-current', 'location'); target = target.querySelector('.rail-lab-t'); }
    S.loop = Pen.annotate(target, 'loop', { manual: true, seed: 'loop-' + s.id, pad: S.mode === 'rail' ? 5 : 4, width: 1.7, duration: 360, color: 'var(--hl-ink)' });
    if (S.on) S.loop.show();
  }
  // the rail arrives when the reading does: the pen draws the margin line down, and the ticks as it passes them
  function show(on) {
    S.on = on;
    rail.classList.toggle('on', on); flag.classList.toggle('strip-on', on);
    if (on && S.loop) S.loop.show();
    if (!on || Motion.reduced() || S.mode !== 'rail' || S.drawn) return;
    S.drawn = true;
    const L = guide.getTotalLength();
    guide.style.strokeDasharray = L + ' ' + (L + 8);
    guide.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 640, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'backwards' });
    S.marks.forEach((s) => { const dl = s.ry / S.H * 560; Pen.draw(s.tick, { duration: 110, delay: dl }); s.lab.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: dl + 60, fill: 'backwards', easing: 'steps(1,end)' }); });
  }
  function showPeek(a) {
    const s = S.marks.find((x) => x.lab === a); if (!s) return;
    peek.querySelector('.rail-peek-k').textContent = s.label + ' · ' + s.title;
    peek.querySelector('.rail-peek-t').textContent = s.peek;
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
    scrollTo({ top: s.y - S.head - 28, behavior: Motion.reduced() ? 'auto' : 'smooth' });
    history.replaceState(history.state, '', '#' + s.id);
  });
  list.addEventListener('keydown', (e) => {
    const labs = [...list.querySelectorAll('.rail-lab')], i = labs.indexOf(document.activeElement);
    if (i < 0) return;
    const j = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? labs.length - 1 : -9;
    if (j === -9) return;
    e.preventDefault(); labs[Math.max(0, Math.min(labs.length - 1, j))].focus();
  });
  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', layout);
  document.fonts.ready.then(layout);
  layout();
  return { layout, destroy() { removeEventListener('scroll', onScroll); removeEventListener('resize', layout); bar.remove(); count.remove(); col.innerHTML = ''; } };
}
