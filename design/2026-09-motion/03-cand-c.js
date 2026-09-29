/* 03-cand-c.js — C · Timeline scrub / 时间尺.
   The shelf stands on a ruler of every year 2026→2015 (same direction as the books). Each essay is
   one countable dot above its year. Two pen brackets window the years; drag them (pointer, touch)
   or step them (arrow keys) and books outside the window leave while you are still dragging —
   the filter only re-applies when a bracket crosses a year boundary, at most every 90 ms.
   Categories are a single line of plain words; the pen circles the chosen one. */
(function () {
  var S = Shelf, FX = window.FX = window.FX || {};
  var Y0 = +S.YEARS[0], Y1 = +S.YEARS[S.YEARS.length - 1], CELLS = [];
  for (var y = Y0; y >= Y1; y--) CELLS.push(String(y));
  var N = CELLS.length, K = 420, C = 34, THROTTLE = 90;
  var NS = 'http://www.w3.org/2000/svg';

  FX.c = function (wx, ctx) {
    var st = { cat: 'all', a: 0, b: N };   // window = cells a … b-1 (bracket boundaries)
    var shelf = S.create(ctx.shelfHost, { ticks: 'none' });
    ctx.filter.innerHTML = '<div class="cw-row"><div class="cw" role="radiogroup" aria-label="Category · 类别">' + S.CATS.map(function (c) {
      return '<button type="button" class="cw-w" role="radio" data-cat="' + c.id + '" aria-checked="false" tabindex="-1"><span class="cw-en">' + c.en +
        '</span><span class="cw-zh" lang="zh">' + c.zh + '</span><span class="cw-n"></span></button>';
    }).join('') + '</div><span class="cw-read" aria-live="polite"></span></div>';
    var words = Array.prototype.slice.call(ctx.filter.querySelectorAll('.cw-w')), read = ctx.filter.querySelector('.cw-read');

    var tr = document.createElement('div');
    tr.className = 'tr'; tr.setAttribute('role', 'group'); tr.setAttribute('aria-label', 'Year window · 年份范围');
    tr.innerHTML = '<svg class="tr-ink" aria-hidden="true"></svg><div class="tr-labels">' + CELLS.map(function (y, i) {
      return '<button type="button" class="tr-y" data-i="' + i + '" aria-label="Only ' + y + ' · 只看 ' + y + ' 年"><span class="tr-full">' + y + '</span><span class="tr-short">’' + y.slice(2) + '</span></button>';
    }).join('') + '</div>' +
      '<div class="tr-br" data-side="a" role="slider" tabindex="0" aria-label="Newest year in window · 最近年份"><svg aria-hidden="true"></svg></div>' +
      '<div class="tr-br" data-side="b" role="slider" tabindex="0" aria-label="Oldest year in window · 最早年份"><svg aria-hidden="true"></svg></div>';
    shelf.main.appendChild(tr);
    var ink = tr.querySelector('.tr-ink'), labels = Array.prototype.slice.call(tr.querySelectorAll('.tr-y'));
    var br = { a: { el: tr.querySelector('[data-side="a"]'), x: 0, v: 0, drag: false }, b: { el: tr.querySelector('[data-side="b"]'), x: 0, v: 0, drag: false } };
    var cw = 0, W = 0, winLine, dots = [];

    function inWin(y) { var i = CELLS.indexOf(y); return i >= st.a && i < st.b; }
    function count(cat) { return S.POSTS.filter(function (p) { return S.inCat(p, cat) && inWin(p.year); }).length; }

    // ---- ruler ink: pencil baseline, an ink segment between the brackets, boundary ticks, count dots ----
    function build() {
      W = tr.clientWidth; cw = W / N;
      var h = 44, base = 20, out = '<line x1="0" y1="' + base + '" x2="' + W + '" y2="' + base + '" stroke="var(--pencil)" stroke-width="1" stroke-dasharray="2 3"/>';
      for (var i = 0; i <= N; i++) out += '<line x1="' + (i * cw).toFixed(1) + '" y1="' + (base - 5) + '" x2="' + (i * cw).toFixed(1) + '" y2="' + (base + 1) + '" stroke="var(--pencil)" stroke-width="1.2" stroke-linecap="round"/>';
      out += '<path class="tr-win" d="" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round" fill="none"/><g class="tr-dots"></g>';
      ink.setAttribute('width', W); ink.setAttribute('height', h); ink.setAttribute('viewBox', '0 0 ' + W + ' ' + h); ink.innerHTML = out;
      winLine = ink.querySelector('.tr-win');
      ['a', 'b'].forEach(function (s) {
        var svg = br[s].el.querySelector('svg'), p = Pen.path(Pen.bracket(34, 'tr-' + s, s === 'a' ? 'left' : 'right'), { width: 2.3 });
        svg.innerHTML = ''; svg.appendChild(p); var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 2);
        if (!br[s].drag) br[s].x = (s === 'a' ? st.a : st.b) * cw;
      });
      dotsDraw(); paint();
    }
    function dotsDraw() {
      var g = ink.querySelector('.tr-dots'), out = '';
      CELLS.forEach(function (y, i) {
        var n = S.POSTS.filter(function (p) { return p.year === y && S.inCat(p, st.cat); }).length, sp = Math.min(5.5, (cw - 6) / Math.max(n, 1));
        for (var k = 0; k < n; k++) out += '<circle data-i="' + i + '" cx="' + ((i + 0.5) * cw + (k - (n - 1) / 2) * sp).toFixed(1) + '" cy="11" r="1.9"/>';
      });
      g.innerHTML = out; dots = Array.prototype.slice.call(g.querySelectorAll('circle'));
      shade();
    }
    function shade() {
      dots.forEach(function (d) { var i = +d.getAttribute('data-i'); d.setAttribute('fill', i >= st.a && i < st.b ? 'var(--ink)' : 'var(--line)'); });
      labels.forEach(function (l, i) { l.classList.toggle('is-in', i >= st.a && i < st.b); });
      var ya = CELLS[st.a], yb = CELLS[st.b - 1];
      br.a.el.setAttribute('aria-valuemin', CELLS[N - 1]); br.a.el.setAttribute('aria-valuemax', CELLS[0]); br.a.el.setAttribute('aria-valuenow', ya);
      br.a.el.setAttribute('aria-valuetext', 'up to ' + ya + ' · 至 ' + ya + ' 年');
      br.b.el.setAttribute('aria-valuemin', CELLS[N - 1]); br.b.el.setAttribute('aria-valuemax', CELLS[0]); br.b.el.setAttribute('aria-valuenow', yb);
      br.b.el.setAttribute('aria-valuetext', 'from ' + yb + ' · 自 ' + yb + ' 年');
    }
    function paint() {
      br.a.el.style.transform = 'translateX(' + br.a.x.toFixed(2) + 'px)';
      br.b.el.style.transform = 'translateX(' + br.b.x.toFixed(2) + 'px)';
      var x1 = br.a.x + 3, x2 = br.b.x - 3;
      winLine.setAttribute('d', x2 > x1 ? 'M' + x1.toFixed(1) + ' 20 L' + x2.toFixed(1) + ' 20' : '');
    }

    // ---- bracket physics: direct manipulation while held, spring to the year boundary when let go ----
    var raf = 0, last = 0;
    function frame(now) {
      var dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60; last = now;
      var moving = false, n = Math.ceil(dt / (1 / 240)), h = dt / n;
      ['a', 'b'].forEach(function (s) {
        var o = br[s]; if (o.drag) return;
        var tg = (s === 'a' ? st.a : st.b) * cw;
        for (var i = 0; i < n; i++) { o.v += (-K * (o.x - tg) - C * o.v) * h; o.x += o.v * h; }
        if (Math.abs(o.x - tg) < 0.1 && Math.abs(o.v) < 2) { o.x = tg; o.v = 0; } else moving = true;
      });
      paint();
      raf = moving ? requestAnimationFrame(frame) : 0; if (!raf) last = 0;
    }
    function kick() {
      if (Pen.reduced()) { br.a.x = st.a * cw; br.b.x = st.b * cw; br.a.v = br.b.v = 0; paint(); return; }
      if (!raf) raf = requestAnimationFrame(frame);
    }

    var lastApply = 0, pending = 0, applied = '';
    function update(force) {
      var sig = st.cat + st.a + '-' + st.b;
      if (sig === applied && !force) return;
      var wait = THROTTLE - (performance.now() - lastApply);
      if (wait > 0 && !force) { if (!pending) pending = setTimeout(function () { pending = 0; update(); }, wait); return; }
      clearTimeout(pending); pending = 0; lastApply = performance.now(); applied = sig;
      shelf.apply(function (p) { return S.inCat(p, st.cat) && inWin(p.year); });
      var c = count(st.cat), span = st.b - st.a === N ? 'every year · 所有年份' : CELLS[st.b - 1] === CELLS[st.a] ? CELLS[st.a] : CELLS[st.b - 1] + '–' + CELLS[st.a];
      read.textContent = c + (c === 1 ? ' essay' : ' essays') + ' · ' + c + ' 篇';
      tr.setAttribute('aria-label', 'Year window · 年份范围: ' + span);
      words.forEach(function (w) { var n = count(w.dataset.cat); w.querySelector('.cw-n').textContent = n; w.classList.toggle('is-off', !n && w.dataset.cat !== st.cat); });
    }
    function setWin(a, b) {
      a = Math.max(0, Math.min(a, N - 1)); b = Math.max(a + 1, Math.min(b, N));
      if (a === st.a && b === st.b) return false;
      st.a = a; st.b = b; shade(); update(); return true;
    }
    Object.keys(br).forEach(function (s) {
      var o = br[s], el = o.el;
      el.addEventListener('pointerdown', function (e) {
        e.preventDefault(); el.setPointerCapture(e.pointerId); o.drag = true; o.v = 0; el.classList.add('is-drag');
        o.off = e.clientX - (tr.getBoundingClientRect().left + o.x);
      });
      el.addEventListener('pointermove', function (e) {
        if (!o.drag) return;
        var x = e.clientX - tr.getBoundingClientRect().left - o.off;
        x = s === 'a' ? Math.max(0, Math.min(x, (st.b - 1) * cw)) : Math.max((st.a + 1) * cw, Math.min(x, W));
        o.x = x; paint();
        var i = Math.round(x / cw);
        if (s === 'a') setWin(i, st.b); else setWin(st.a, i);
      });
      function up() { if (!o.drag) return; o.drag = false; el.classList.remove('is-drag'); update(true); kick(); }
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      el.addEventListener('keydown', function (e) {
        var d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 }[e.key], home = e.key === 'Home', end = e.key === 'End';
        if (!d && !home && !end) return; e.preventDefault();
        if (s === 'a') setWin(home ? 0 : end ? st.b - 1 : st.a + d, st.b); else setWin(st.a, home ? st.a + 1 : end ? N : st.b + d);
        kick();
      });
    });
    labels.forEach(function (l, i) {
      l.addEventListener('click', function () { if (st.a === i && st.b === i + 1) setWin(0, N); else setWin(i, i + 1); kick(); });
    });

    // ---- category words ----
    function pickCat(cat) {
      var prev = words.find(function (w) { return w.dataset.cat === st.cat; });
      st.cat = cat;
      words.forEach(function (w) { var on = w.dataset.cat === cat; w.setAttribute('aria-checked', String(on)); w.tabIndex = on ? 0 : -1; });
      if (prev) { var op = prev.querySelector('.cw-loop path'); if (op) Pen.erase(op, { duration: 150 }); }
      loopWord(words.find(function (w) { return w.dataset.cat === cat; }), true);
      dotsDraw(); update();
    }
    function loopWord(w, animate) {
      var old = w.querySelector('.cw-loop'); if (old) old.remove();
      var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'cw-loop'); svg.setAttribute('aria-hidden', 'true'); w.appendChild(svg);
      var p = Pen.path(Pen.loop(w.offsetWidth, w.offsetHeight, 'cw-' + w.dataset.cat, { pad: 5 }), { width: 2 });
      svg.appendChild(p); Pen.draw(p, { duration: animate ? 420 : 1 });
    }
    words.forEach(function (w, i) {
      Pen.annotate(w.querySelector('.cw-en'), 'underline', { color: 'var(--pencil)', width: 1.4, gap: 1 });
      w.addEventListener('click', function () { if (!w.classList.contains('is-off') && w.dataset.cat !== st.cat) pickCat(w.dataset.cat); });
      w.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0; if (!d) return;
        e.preventDefault(); var j = i;
        for (var k = 0; k < words.length; k++) { j = (j + d + words.length) % words.length; if (!words[j].classList.contains('is-off')) break; }
        pickCat(words[j].dataset.cat); words[j].focus();
      });
    });

    words[0].setAttribute('aria-checked', 'true'); words[0].tabIndex = 0;
    build(); update(true);
    requestAnimationFrame(function () { loopWord(words[0], true); });
    if (document.fonts) document.fonts.ready.then(function () { loopWord(words.find(function (w) { return w.dataset.cat === st.cat; }), false); build(); });
    var ro = new ResizeObserver(function () { if (Math.abs(tr.clientWidth - W) > 1) build(); }); ro.observe(tr);

    // Demo: drag the newest bracket down to 2021 by hand, then the oldest one up to 2018, then a category.
    function glide(s, toCell, ms) {
      var o = br[s], from = o.x, t0 = performance.now();
      o.drag = true;
      (function step(now) {
        var t = Math.min(1, (now - t0) / ms), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        o.x = from + (toCell * cw - from) * e; paint();
        var i = Math.round(o.x / cw); if (s === 'a') setWin(i, st.b); else setWin(st.a, i);
        if (t < 1) requestAnimationFrame(step); else { o.drag = false; update(true); kick(); }
      })(t0);
    }
    function demo() {
      return FX.run([
        [300, function () { glide('a', 5, 1100); }], [1900, function () { glide('b', 9, 900); }],
        [1700, function () { pickCat('travel log'); }], [1600, function () { pickCat('all'); setWin(0, N); kick(); }]
      ]);
    }
    return { demo: demo, shelf: shelf, setWin: function (a, b) { setWin(a, b); kick(); }, pickCat: pickCat, glide: glide };
  };
})();
