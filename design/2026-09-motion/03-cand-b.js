/* 03-cand-b.js — B · Index tabs + shelf ruler / 书签与书架尺.
   Categories are paper index dividers standing behind the books: their lower half hides behind the
   shelf's top edge, the chosen one rises clear of it, empty ones sink out of reach (spring per tab).
   Years need no row at all: the shelf already prints its year ticks, so they become the control.
   Circling a year keeps its books; other years collapse to a narrow empty slot that still carries
   its tick, so the ruler never loses a year you might want to circle next. */
(function () {
  var S = Shelf, FX = window.FX = window.FX || {};
  var Y_ON = 1, Y_HOVER = 8, Y_REST = 13, Y_OFF = 34, K = 330, C = 25;
  // A divider: slanted sides, rounded shoulders. Stretched per tab; the stroke stays 1.5px.
  var SHAPE = '<svg class="ix-shape" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true"><path d="M1 81 L5.5 9 Q6.5 1.5 13 1.5 L87 1.5 Q93.5 1.5 94.5 9 L99 81" vector-effect="non-scaling-stroke"/></svg>';

  FX.b = function (wx, ctx) {
    var st = { cat: 'all', years: new Set() };
    var shelf = S.create(ctx.shelfHost, { ticks: 'button', slots: true });
    var band = document.createElement('div');
    band.className = 'ix-band';
    band.innerHTML = '<div class="ix-track" role="radiogroup" aria-label="Category · 类别">' + S.CATS.map(function (c) {
      return '<button type="button" class="ix" role="radio" data-cat="' + c.id + '" aria-checked="false" tabindex="-1">' + SHAPE + '<span class="ix-l1"><span class="ix-en">' + c.en +
        '</span><span class="ix-n"></span></span><span class="ix-zh" lang="zh">' + c.zh + '</span><svg class="ix-ul" aria-hidden="true"></svg></button>';
    }).join('') + '</div>';
    shelf.main.insertBefore(band, shelf.scroll);
    shelf.host.classList.add('with-band');
    var reset = document.createElement('button');
    reset.type = 'button'; reset.className = 'yr-reset'; reset.hidden = true;
    reset.innerHTML = '<span>every year · 全部年份</span>';
    shelf.main.appendChild(reset);
    var tabs = Array.prototype.slice.call(band.querySelectorAll('.ix'));
    var ts = tabs.map(function (t) { return { el: t, y: Y_REST, v: 0, hover: false, off: false }; });

    function yearOk(y) { return !st.years.size || st.years.has(y); }
    function count(cat) { return S.POSTS.filter(function (p) { return S.inCat(p, cat) && yearOk(p.year); }).length; }
    function catYears(cat) { return S.YEARS.filter(function (y) { return S.POSTS.some(function (p) { return p.year === y && S.inCat(p, cat); }); }); }

    // ---- divider physics ----
    var raf = 0, last = 0;
    function target(s) { return s.off ? Y_OFF : s.el.dataset.cat === st.cat ? Y_ON : s.hover ? Y_HOVER : Y_REST; }
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
    tabs.forEach(function (t, i) {
      t.addEventListener('pointerenter', function () { ts[i].hover = true; kick(); });
      t.addEventListener('pointerleave', function () { ts[i].hover = false; kick(); });
      t.addEventListener('click', function () { if (!ts[i].off) pickCat(t.dataset.cat); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (e.key === 'Home' || e.key === 'End') { d = e.key === 'Home' ? 1 : -1; i = e.key === 'Home' ? -1 : tabs.length; }
        if (!d) return; e.preventDefault();
        var j = i;
        for (var k = 0; k < tabs.length; k++) { j = (j + d + tabs.length) % tabs.length; if (!ts[j].off) break; }
        pickCat(tabs[j].dataset.cat); tabs[j].focus();
      });
    });
    function penTab(s, draw) {
      var svg = s.el.querySelector('.ix-ul'), en = s.el.querySelector('.ix-en');
      if (!draw) { var old = svg.querySelector('path'); if (old) Pen.erase(old, { duration: 140 }); return; }
      svg.style.left = en.offsetLeft + 'px'; svg.style.top = en.offsetTop + 'px'; svg.innerHTML = '';
      var p = Pen.path(Pen.underline(en.offsetWidth, 'ix-' + s.el.dataset.cat, { y: en.offsetHeight + 2 }), { width: 2 });
      svg.appendChild(p); Pen.draw(p, { delay: 150, duration: 260 });
    }

    // ---- the ruler: year ticks as toggles, a seeded pen loop around each circled year ----
    function tickButtons() { return Array.prototype.slice.call(shelf.row.querySelectorAll('.book.first-y:not(.is-leaving) .tick-y')); }
    function syncTicks(animate) {
      var btns = tickButtons();
      shelf.row.querySelectorAll('.tick-y').forEach(function (b) {
        var on = st.years.has(b.dataset.year), live = btns.indexOf(b) >= 0;
        b.setAttribute('aria-pressed', String(on));
        b.setAttribute('aria-label', 'Year ' + b.dataset.year + ' · ' + b.dataset.year + ' 年' + (on ? ' (circled · 已圈选)' : ''));
        var svg = b.querySelector('.yr-loop');
        if (on && live) {
          if (svg) return;
          svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'yr-loop'); svg.setAttribute('aria-hidden', 'true');
          b.appendChild(svg);
          var p = Pen.path(Pen.loop(b.offsetWidth, b.offsetHeight, 'yr' + b.dataset.year, { pad: 3 }), { width: 1.9 });
          svg.appendChild(p); Pen.draw(p, { delay: animate ? 260 : 0, duration: 380 });
        } else if (svg) {
          var q = svg.querySelector('path');
          if (on || Pen.reduced()) svg.remove();   // its book left; the tick fades with it
          else Pen.erase(q, { duration: 160 }).onfinish = function () { svg.remove(); };
        }
      });
      var focusable = btns.find(function (b) { return st.years.has(b.dataset.year); }) || btns[0];
      shelf.row.querySelectorAll('.tick-y').forEach(function (b) { b.tabIndex = b === focusable ? 0 : -1; });
      reset.hidden = !st.years.size;
    }
    shelf.row.addEventListener('click', function (e) {
      var b = e.target.closest('.tick-y'); if (!b) return;
      var y = b.dataset.year;
      if (st.years.has(y)) st.years.delete(y); else st.years.add(y);
      update(b.closest('.book').offsetLeft, y);
    });
    shelf.row.addEventListener('keydown', function (e) {
      var b = e.target.closest('.tick-y'); if (!b) return;
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      e.preventDefault();
      var btns = tickButtons(), i = btns.indexOf(b), n = btns[i + d];
      if (n) { btns.forEach(function (x) { x.tabIndex = -1; }); n.tabIndex = 0; n.focus(); }
    });
    reset.addEventListener('click', function () { st.years.clear(); update(null); });
    shelf.row.querySelectorAll('.tick-y').forEach(function (b) { Pen.annotate(b, 'underline', { color: 'var(--pencil)', width: 1.4, gap: 0, seed: 'yh' + b.dataset.year }); });

    function pickCat(cat) {
      if (cat === st.cat) return;
      var prev = ts.find(function (s) { return s.el.dataset.cat === st.cat; });
      st.cat = cat;
      var avail = catYears(cat);
      st.years.forEach(function (y) { if (avail.indexOf(y) < 0) st.years.delete(y); });
      if (prev) penTab(prev, false);
      penTab(ts.find(function (s) { return s.el.dataset.cat === cat; }), true);
      update(null);
    }
    function update(origin, focusYear) {
      var avail = catYears(st.cat), slots = null;
      if (st.years.size) { slots = new Set(avail.filter(function (y) { return !st.years.has(y); })); }
      shelf.apply(function (p) { return S.inCat(p, st.cat) && yearOk(p.year); }, { slotYears: slots, origin: origin });
      ts.forEach(function (s) {
        var c = count(s.el.dataset.cat), on = s.el.dataset.cat === st.cat;
        s.off = !c && !on;
        s.el.querySelector('.ix-n').textContent = c;
        s.el.setAttribute('aria-checked', String(on)); s.el.tabIndex = on ? 0 : -1;
        s.el.setAttribute('aria-disabled', String(s.off)); s.el.classList.toggle('is-off', s.off);
        var cat = S.CATS.find(function (x) { return x.id === s.el.dataset.cat; });
        s.el.setAttribute('aria-label', cat.en + ' · ' + cat.zh + ', ' + c + ' essays · 篇');
      });
      kick(); syncTicks(true);
      if (focusYear) {   // keep keyboard focus on the year you just toggled, wherever its tick now lives
        var b = tickButtons().find(function (x) { return x.dataset.year === focusYear; });
        if (b && document.activeElement && document.activeElement.classList.contains('tick-y')) { b.tabIndex = 0; b.focus({ preventScroll: true }); }
      }
    }
    update(null);
    requestAnimationFrame(function () { penTab(ts[0], true); });
    if (document.fonts) document.fonts.ready.then(function () { var s = ts.find(function (x) { return x.el.dataset.cat === st.cat; }); if (s) { var svg = s.el.querySelector('.ix-ul'); svg.innerHTML = ''; penTab(s, true); } });

    function clickYear(y) { var b = tickButtons().find(function (x) { return x.dataset.year === y; }); if (b) b.click(); }
    function demo() {
      return FX.run([
        [300, function () { pickCat('stories we live'); }], [1500, function () { clickYear('2024'); }],
        [1500, function () { clickYear('2022'); }], [1500, function () { pickCat('all'); }],
        [1500, function () { st.years.clear(); update(null); }]
      ]);
    }
    return { demo: demo, shelf: shelf, pickCat: pickCat, clickYear: clickYear };
  };
})();
