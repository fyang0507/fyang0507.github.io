/* r2-03-tabs.js — the tag dimension: paper index dividers standing behind the collection's top edge
   (round-1 board 03, candidate B), now labelled 类别 · tags, with bilingual names and live counts.
   Physics clock: every divider rides its own spring — the chosen one rises clear of the edge, a
   hovered one lifts a little, one with nothing in the chosen years sinks. Sunk dividers stay
   clickable: choosing one makes the years give way (the controller decides; see r2-03-filter.js).
   The pen underlines the chosen name: pencil while it says "all", coral once it narrows. */
(function () {
  var Y_ON = 1, Y_HOVER = 8, Y_REST = 13, Y_OFF = 30, K = 330, C = 25;
  var SHAPE = '<svg class="ix-shape" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true"><path d="M1 81 L5.5 9 Q6.5 1.5 13 1.5 L87 1.5 Q93.5 1.5 94.5 9 L99 81" vector-effect="non-scaling-stroke"/></svg>';

  function create(col, opt) {
    var band = document.createElement('div');
    band.className = 'ix-band' + (col.kind === 'rack' ? ' on-line' : '');
    band.innerHTML = '<div class="ix-track"><div class="ctl-label ix-label" aria-hidden="true"><span lang="zh">类别</span><span>tags</span></div>' +
      '<div class="ix-group" role="radiogroup" aria-label="Tags · 类别">' + col.cats.map(function (c) {
        return '<button type="button" class="ix" role="radio" data-cat="' + c.id + '" aria-checked="false" tabindex="-1">' + SHAPE +
          '<span class="ix-l1"><span class="ix-en">' + c.en + '</span><span class="ix-n"></span></span><span class="ix-zh" lang="zh">' + c.zh +
          '</span><svg class="ix-ul" aria-hidden="true"></svg></button>';
      }).join('') + '</div></div>';
    col.main.insertBefore(band, col.main.firstChild);
    col.host.classList.add('with-band');
    // The dividers overhang the band on purpose (they stand behind the edge), which makes the band
    // vertically scrollable; focusing a divider would scroll it. Only the horizontal strip may move.
    band.addEventListener('scroll', function () { if (band.scrollTop) band.scrollTop = 0; });
    var tabs = Array.prototype.slice.call(band.querySelectorAll('.ix'));
    var ts = tabs.map(function (t) { return { el: t, cat: t.dataset.cat, y: Y_REST, v: 0, hover: false, off: false, mark: null }; });
    var sel = 'all';

    // ---- divider physics ----
    var raf = 0, last = 0;
    function target(s) { return s.cat === sel ? Y_ON : s.off ? Y_OFF : s.hover ? Y_HOVER : Y_REST; }
    function frame(now) {
      var dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60; last = now;
      var moving = false, n = Math.ceil(dt / (1 / 240)), h = dt / n;
      ts.forEach(function (s) {
        var tg = target(s);
        for (var i = 0; i < n; i++) { s.v += (-K * (s.y - tg) - C * s.v) * h; s.y += s.v * h; }
        if (Math.abs(s.y - tg) < 0.1 && Math.abs(s.v) < 2) { s.y = tg; s.v = 0; } else moving = true;
        s.el.style.transform = 'translateY(' + s.y.toFixed(2) + 'px)';
      });
      raf = moving ? requestAnimationFrame(frame) : 0; if (!raf) last = 0;
    }
    function kick() {
      if (Pen.reduced()) { ts.forEach(function (s) { s.y = target(s); s.v = 0; s.el.style.transform = 'translateY(' + s.y + 'px)'; }); return; }
      if (!raf) raf = requestAnimationFrame(frame);
    }

    // ---- the pen: one underline under the chosen name ----
    function penTab(s, draw, animate) {
      var svg = s.el.querySelector('.ix-ul'), en = s.el.querySelector('.ix-en');
      if (!draw) { var old = svg.querySelector('path'); if (old) Tally.unpen(old, { duration: 140 }); s.mark = null; return; }
      var color = s.cat === 'all' ? 'var(--pencil)' : 'var(--mark)';
      if (s.mark === color && svg.querySelector('path')) return;
      svg.style.left = en.offsetLeft + 'px'; svg.style.top = en.offsetTop + 'px'; svg.innerHTML = '';
      var p = Pen.path(Pen.underline(en.offsetWidth, 'ix-' + s.cat, { y: en.offsetHeight + 2 }), { width: 2, color: color });
      svg.appendChild(p); s.mark = color;
      if (animate === false) { p.style.strokeDasharray = Pen.dashes(p, p.getTotalLength()); p.style.strokeDashoffset = 0; }
      else Pen.draw(p, { delay: 140, duration: 260 });
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('pointerenter', function () { ts[i].hover = true; kick(); opt.onHint(ts[i].cat); });
      t.addEventListener('pointerleave', function () { ts[i].hover = false; kick(); opt.onHint(null); });
      t.addEventListener('focus', function () { opt.onHint(ts[i].cat); });
      t.addEventListener('blur', function () { opt.onHint(null); });
      t.addEventListener('click', function () { opt.onPick(ts[i].cat); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, j = k === 'ArrowRight' || k === 'ArrowDown' ? i + 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : null;
        if (j == null) return;
        e.preventDefault(); j = (j + tabs.length) % tabs.length;
        opt.onPick(ts[j].cat); tabs[j].focus({ preventScroll: true });
      });
    });

    function reveal(s) {   // on a phone the band is a swipe strip: keep the chosen divider in view
      var l = s.el.offsetLeft, r = l + s.el.offsetWidth, vw = band.clientWidth, x = band.scrollLeft;
      if (l < x + 40 || r > x + vw - 10) band.scrollTo({ left: Math.max(0, l - 60), behavior: Pen.reduced() ? 'auto' : 'smooth' });
    }

    // counts: { catId: n in the chosen years }; noun: the collection's noun.
    function sync(nextSel, counts, o) {
      o = o || {};
      var prev = sel; sel = nextSel;
      ts.forEach(function (s) {
        var c = counts[s.cat] || 0, on = s.cat === sel, cat = col.cats.find(function (x) { return x.id === s.cat; });
        s.off = !c && !on;
        s.el.querySelector('.ix-n').textContent = c;
        s.el.setAttribute('aria-checked', String(on)); s.el.tabIndex = on ? 0 : -1;
        s.el.classList.toggle('is-off', s.off); s.el.classList.toggle('is-on', on);
        s.el.setAttribute('aria-label', cat.en + ' · ' + cat.zh + ', ' + c + ' ' + (c === 1 ? col.noun.one : col.noun.many) + ' · ' + c + ' ' + col.noun.zh +
          (s.off ? ' (none in these years — choosing it releases the years · 选它会放开年份)' : ''));
      });
      var cur = ts.find(function (s) { return s.cat === sel; });
      if (prev !== sel) { var ps = ts.find(function (s) { return s.cat === prev; }); if (ps) penTab(ps, false); reveal(cur); }
      penTab(cur, true, o.animate);
      kick();
    }
    if (document.fonts) document.fonts.ready.then(function () { var s = ts.find(function (x) { return x.cat === sel; }); s.mark = null; penTab(s, true, false); });
    return { el: band, sync: sync, tabs: tabs };
  }

  window.Tabs = { create: create };
})();
