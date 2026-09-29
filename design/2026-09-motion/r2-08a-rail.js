/* r2-08a-rail.js — A · Pencil margin, generalised to whatever structure an essay has (r2-08a-landmarks.js).
   Desktop: a graphite line in the left margin draws as you read; each landmark is a tick with a utility-mono label
   (1.0 · （一） · IV · 广州惯性 · 3 min); the one you are in carries the coral pen loop. Hover/focus previews its first
   line on a paper slip; click goes there. Phone: the nav's landing hairline doubles as the line, with ticks on it and
   a "3.0 / 10" counter.
   End-of-scroll fixes (round-1 bugs): the rail is position:sticky inside a column that ends with the post body, so it
   leaves with the essay instead of lying over the "previous" card and footer; the reading line sweeps from 30% of the
   window to its bottom over the last screen, so at 100% the last landmark is reached and the line completes even on
   short essays; and every value is computed from the clamped scroll, so bounce/overscroll cannot un-draw or flicker. */
(function () {
  var ctx = RP, root = ctx.root, NS = 'http://www.w3.org/2000/svg', html = document.documentElement;
  var col = root.querySelector('.rail-col'), nav = root.querySelector('.rnav'), right = nav.querySelector('.right');
  var W = 150, LX = 130;                                       // rail width; the line sits 56px left of the text column

  col.innerHTML = '<nav class="rail" aria-label="Where you are in this essay · 读到哪儿">' +
    '<svg class="rail-svg" width="' + W + '" aria-hidden="true"><path class="rail-guide"/><path class="rail-ink"/><g class="rail-ticks"></g><path class="rail-end"/></svg>' +
    '<ol class="rail-list"></ol><div class="rail-peek" aria-hidden="true"><span class="rail-peek-k"></span><span class="rail-peek-t"></span></div></nav>';
  var rail = col.firstChild, svg = rail.querySelector('svg'), guide = svg.querySelector('.rail-guide'), ink = svg.querySelector('.rail-ink');
  var tickG = svg.querySelector('.rail-ticks'), endMark = svg.querySelector('.rail-end'), list = rail.querySelector('.rail-list');
  var peek = rail.querySelector('.rail-peek');

  var strip = document.createElementNS(NS, 'svg');           // phone: ticks + ink on the nav's hairline
  strip.setAttribute('class', 'rail-strip'); strip.setAttribute('aria-hidden', 'true');
  strip.innerHTML = '<g class="strip-ticks"></g><path class="strip-ink"/>';
  nav.appendChild(strip);
  var stripInk = strip.querySelector('.strip-ink'), stripTicks = strip.querySelector('.strip-ticks');
  var count = document.createElement('span');
  count.className = 'rail-count'; count.setAttribute('aria-live', 'polite');
  count.innerHTML = '<span class="rc-no"></span><span class="rc-of"></span>';
  right.insertBefore(count, right.firstChild);
  var countNo = count.firstChild, countOf = count.lastChild;

  var S = { marks: [], top: 0, end: 1, H: 0, L: 0, sL: 0, cur: -2, done: false, mode: '', on: false, drawn: false, loop: null };

  function wobble(len, seed, vertical, x0) {
    var r = Pen.rng(seed), pts = [], n = Math.max(2, Math.round(len / 46));
    for (var i = 0; i <= n; i++) {
      var t = i / n, off = (r() - .5) * 1.6 + Math.sin(t * 7 + r()) * .45;
      pts.push(vertical ? [x0 + off, t * len] : [t * len, 3 + off * .5]);
    }
    return Pen.smooth(pts);
  }
  function dash(p) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 8); return L; }

  function layout() {
    var g = ctx.g, body = ctx.body(), app = body.querySelector('.appendix'), marks = ctx.marks();
    var art = root.querySelector('article').getBoundingClientRect();
    S.mode = art.left >= 180 ? 'rail' : 'strip';
    html.classList.toggle('rail-mode', S.mode === 'rail'); html.classList.toggle('strip-mode', S.mode === 'strip');
    S.top = g.b0;
    S.end = app ? ctx.top(app) - 30 : ctx.top(body) + body.offsetHeight;
    // the column runs to the end of the post body (references included) so the finished rail is still in view at 100%;
    // the pencil itself maps only the essay text [top, end]
    var colH = Math.max(40, S.end - S.top), boxH = Math.max(colH, ctx.top(body) + body.offsetHeight - S.top);
    col.style.height = boxH + 'px';
    S.H = Math.round(Math.min(colH, g.vh - (g.n1 + 28) - 44));
    rail.style.height = S.H + 'px';
    svg.setAttribute('height', S.H + 24);
    var d = wobble(S.H, 'rail-' + ctx.post.id + ctx.lang(), true, LX);
    guide.setAttribute('d', d); ink.setAttribute('d', d);
    S.L = dash(ink); ink.style.strokeDashoffset = S.L;
    guide.style.strokeDasharray = ''; guide.style.strokeDashoffset = '';
    endMark.setAttribute('d', 'M' + (LX - 6) + ' ' + (S.H + 5) + ' q 3 4 6 6 q 3 -5 10 -13');
    var eL = dash(endMark); endMark.style.strokeDashoffset = S.done ? 0 : eL + 4;

    // ticks at true positions; labels nudged apart (a minute label that would collide with a structural one is dropped)
    S.marks = marks.map(function (m) {
      var el = document.getElementById(m.id);
      var y = el ? ctx.top(el) : S.top;
      return { m: m, el: el, y: y, ry: Math.round((y - S.top) / colH * S.H) };
    });
    tickG.innerHTML = ''; list.innerHTML = ''; stripTicks.innerHTML = '';
    var lastY = -99;
    S.marks.forEach(function (s, i) {
      var r = Pen.rng('tick-' + s.m.id), minor = s.m.kind === 'min', w = minor ? 4 : 7;
      var t = Pen.path(Pen.smooth([[LX - w, s.ry + (r() - .5)], [LX, s.ry + (r() - .5) * .8], [LX + w, s.ry - .5 - r() * .8]]), { color: 'currentColor', width: minor ? 1.2 : 1.5 });
      t.setAttribute('class', 'rail-tick' + (minor ? ' minor' : '')); tickG.appendChild(t); s.tick = t;
      var ly = Math.max(s.ry, lastY + 20);
      if (minor && ly - s.ry > 6) { s.lab = null; return; }
      lastY = ly;
      var li = document.createElement('li');
      li.innerHTML = '<a class="rail-lab rl-' + s.m.kind + '" href="#' + s.m.id + '" style="top:' + (ly - 11) + 'px">' +
        '<span class="rail-lab-t">' + s.m.label.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></a>';
      li.firstChild.setAttribute('aria-label', s.m.label + (s.m.peek ? ' — ' + s.m.peek : ''));
      list.appendChild(li); s.lab = li.firstChild;
    });
    // phone strip: the same landmarks as ticks along the nav hairline
    strip.setAttribute('width', g.vw); strip.setAttribute('height', 10);
    stripInk.setAttribute('d', wobble(g.vw, 'strip-' + ctx.post.id, false));
    S.sL = dash(stripInk); stripInk.style.strokeDashoffset = S.sL;
    S.marks.forEach(function (s) {
      var x = Math.round(s.ry / Math.max(1, S.H) * g.vw);
      var p = Pen.path('M' + x + ' ' + (s.m.kind === 'min' ? 1.5 : 0) + ' L' + (x + .4) + ' 6', { color: 'currentColor', width: 1.3 });
      p.setAttribute('class', 'strip-tick'); stripTicks.appendChild(p); s.stick = p;
    });
    if (S.loop) { S.loop.svg.remove(); S.loop = null; }
    S.cur = -2;
    S.on = g.rm || ctx.y() >= g.sL - .5;                   // reduced motion: no landing event, the rail is simply there
    rail.classList.toggle('on', S.on); nav.classList.toggle('strip-on', S.on);
  }

  // the reading line: 30% down the reading area, sweeping to the window's bottom over the last screen of scroll
  function readingLine(y) {
    var g = ctx.g, m = ctx.max(), vh = g.vh, n1 = g.n1, R = Math.min(m, vh * .8);
    var t = R > 0 ? Math.min(1, Math.max(0, (y - (m - R)) / R)) : 1, e = t * t * (3 - 2 * t);
    return y + n1 + (vh - n1) * (.3 + .7 * e);
  }

  function update(y) {
    if (!S.marks.length) return;
    var line = readingLine(y), rm = ctx.g.rm, cur = -1;
    for (var i = 0; i < S.marks.length; i++) if (S.marks[i].y <= line + 1) cur = i;
    var p = Math.min(1, Math.max(0, (line - S.top) / (S.end - S.top)));
    if (rm) p = p >= 1 ? 1 : cur >= 0 ? S.marks[cur].ry / S.H : 0;         // reduced motion: the line steps per landmark
    ink.style.strokeDashoffset = (S.L * (1 - p)).toFixed(1);
    stripInk.style.strokeDashoffset = (S.sL * (1 - p)).toFixed(1);
    S.marks.forEach(function (s, j) {
      var read = s.ry <= p * S.H + .5;
      s.tick.classList.toggle('read', read); s.stick.classList.toggle('read', read);
      if (s.lab) s.lab.classList.toggle('read', j < cur);
    });
    if (cur !== S.cur) setCurrent(cur);
    var done = p >= 1;
    if (done !== S.done) { S.done = done; done ? Pen.draw(endMark, { duration: 280 }) : Pen.erase(endMark, { duration: 140 }); }
  }

  function setCurrent(i) {
    var prev = S.cur; S.cur = i;
    if (prev >= 0 && S.marks[prev] && S.marks[prev].lab) { S.marks[prev].lab.classList.remove('cur'); S.marks[prev].lab.removeAttribute('aria-current'); }
    if (S.loop) { var old = S.loop; old.hide(); setTimeout(function () { old.svg.remove(); }, 260); S.loop = null; }
    var s = S.marks[i], c = countText(i);
    countNo.textContent = c[0]; countOf.textContent = c[1];
    if (!s) return;
    var target = S.mode === 'rail' ? (s.lab || nearestLab(i)) : countNo;
    if (!target) return;
    if (S.mode === 'rail') { target.classList.add('cur'); target.setAttribute('aria-current', 'location'); target = target.querySelector('.rail-lab-t'); }
    S.loop = Pen.annotate(target, 'loop', { manual: true, seed: 'loop-' + s.m.id, pad: S.mode === 'rail' ? 5 : 4, width: 1.7, duration: 360 });
    if (S.on) S.loop.show();
  }
  // phone counter: "3.0 / 10" for sections, "2 / 3" for headings, "3 / 6 min" for minute ticks
  function countText(i) {
    var k = ctx.kind(), s = S.marks[i], n = S.marks.length, M = (ctx.post.readingMin || 1) + ' min';
    if (k === 'minutes') return [s ? String(s.m.minute) : '0', ' / ' + M];
    if (k === 'headings') return [s ? String(i + 1) : '—', ' / ' + n];
    if (k === 'sections') return [s ? s.m.label : '—', ' / ' + n];
    return s ? (s.m.kind === 'min' ? [String(s.m.minute), ' / ' + M] : [s.m.label, '']) : ['0', ' / ' + M];
  }
  function nearestLab(i) { for (var j = i; j >= 0; j--) if (S.marks[j].lab) return S.marks[j].lab; return null; }

  // the rail arrives with the landing: the pen that drew the nav hairline goes on down the margin
  function show(on, instant) {
    if (on === S.on && !instant) return;
    S.on = on;
    rail.classList.toggle('on', on); nav.classList.toggle('strip-on', on);
    if (on && S.loop) S.loop.show();
    if (!on || instant || ctx.g.rm || S.mode !== 'rail') return;
    var L = guide.getTotalLength();
    guide.style.strokeDasharray = L + ' ' + (L + 8);
    guide.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 640, delay: 260, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'backwards' });
    S.marks.forEach(function (s) {
      var dl = 260 + s.ry / S.H * 560;
      Pen.draw(s.tick, { duration: 110, delay: dl });
      if (s.lab) s.lab.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: dl + 60, fill: 'backwards', easing: 'steps(1,end)' });
    });
  }
  document.addEventListener('rp:land', function (e) { show(e.detail); });

  // ---- peek: a paper slip with the landmark's first line (physics clock: one small overshoot, then settle) ----
  function showPeek(a) {
    var s = S.marks.find(function (x) { return x.lab === a; }); if (!s) return;
    peek.querySelector('.rail-peek-k').textContent = s.m.label + (s.m.kind === 'min' ? ' · 大约读到这里 about here' : s.m.kind === 'head' ? ' · 小标题 heading' : s.m.title ? ' · 本节 section' : ' · 本节首句 first line');
    peek.querySelector('.rail-peek-t').textContent = s.m.peek || s.m.title || '';
    peek.style.top = Math.min(S.H - 70, Math.max(-6, s.ry - 24)) + 'px';
    peek.classList.add('on');
  }
  function hidePeek() { peek.classList.remove('on'); }
  list.addEventListener('pointerover', function (e) { var a = e.target.closest('.rail-lab'); if (a) showPeek(a); });
  list.addEventListener('pointerout', function (e) { if (!e.relatedTarget || !list.contains(e.relatedTarget)) hidePeek(); });
  list.addEventListener('focusin', function (e) { showPeek(e.target); });
  list.addEventListener('focusout', hidePeek);
  list.addEventListener('click', function (e) {
    var a = e.target.closest('.rail-lab'); if (!a) return;
    e.preventDefault();
    var s = S.marks.find(function (x) { return x.lab === a; });
    ctx.scrollTo(s.y - ctx.g.n1 - 28);
  });
  list.addEventListener('keydown', function (e) {
    var labs = Array.prototype.slice.call(list.querySelectorAll('.rail-lab')), i = labs.indexOf(document.activeElement);
    if (i < 0) return;
    var j = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? labs.length - 1 : -9;
    if (j === -9) return;
    e.preventDefault(); labs[Math.max(0, Math.min(labs.length - 1, j))].focus();
  });

  ctx.onLayout(layout);
  ctx.onScroll(update);
  window.__rail = S;
})();
