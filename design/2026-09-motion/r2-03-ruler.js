/* r2-03-ruler.js — the year dimension: an explicit, labelled ruler (年份 · years) under the collection.
   Every calendar year gets an equal cell, newest on the left like the books; each cell carries a 正
   tally of what the current tag holds that year (r2-03-tally.js). Years with nothing for the tag dim
   but stay pressable.
   mode 'range' (candidate A): click a year; click it again for every year; shift-click, shift-arrow
     or drag across the ruler for a span. While you drag, the pen brackets hop cell to cell on a
     spring (physics clock) with a paper flag naming the span over your pointer or thumb, and the
     collection reflows live (at most one reflow per 90 ms). Drag from a bracketed end to resize.
   mode 'set' (candidate B): click years to circle or uncircle them; any combination.
   The controller owns the state: onChange(sel, {commit}) out, sync(sel, counts) back in. */
(function () {
  var NS = 'http://www.w3.org/2000/svg', K = 520, C = 36, THROTTLE = 90;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function create(col, opt) {
    var Y = col.years, N = Y.length, mode = opt.mode || 'range';
    var root = document.createElement('div');
    root.className = 'yr yr-' + mode;
    root.innerHTML = '<div class="yr-head"><div class="ctl-label" aria-hidden="true"><span lang="zh">年份</span><span>years</span></div>' +
      '<button type="button" class="yr-all"><span class="yr-all-t">all · 全部</span></button></div>' +
      '<div class="yr-track" role="listbox" aria-label="Years · 年份" aria-multiselectable="true" aria-orientation="horizontal">' +
      '<svg class="yr-ink" aria-hidden="true"><g class="yr-grid"></g><g class="yr-tallies">' +
      Y.map(function (y, i) { return '<g class="tl" data-i="' + i + '"></g>'; }).join('') + '</g><path class="yr-win" d=""/></svg>' +
      Y.map(function (y, i) {
        return '<div class="yr-cell" role="option" data-i="' + i + '" aria-selected="false" tabindex="-1"><span class="yr-y"><span class="yr-full">' + y +
          '</span><span class="yr-short">’' + y.slice(2) + '</span></span></div>';
      }).join('') +
      (mode === 'range' ? '<div class="yr-br" data-side="a" aria-hidden="true"><svg></svg></div><div class="yr-br" data-side="b" aria-hidden="true"><svg></svg></div>' : '') +
      '<div class="yr-flag" aria-hidden="true"></div></div>';
    col.main.appendChild(root);
    var track = root.querySelector('.yr-track'), ink = root.querySelector('.yr-ink'), grid = root.querySelector('.yr-grid');
    var win = root.querySelector('.yr-win'), flagEl = root.querySelector('.yr-flag'), allBtn = root.querySelector('.yr-all');
    var cells = Array.prototype.slice.call(root.querySelectorAll('.yr-cell')), tls = Array.prototype.slice.call(root.querySelectorAll('.tl'));
    var labels = cells.map(function (c) { return c.querySelector('.yr-y'); });
    var br = mode === 'range' ? { a: { el: root.querySelector('[data-side="a"]'), x: 0, v: 0 }, b: { el: root.querySelector('[data-side="b"]'), x: 0, v: 0 } } : null;
    var hov = labels.map(function (l, i) { return Pen.annotate(l, 'underline', { manual: true, color: 'var(--pencil)', width: 1.3, gap: 1, seed: 'yh' + col.kind + Y[i] }); });
    var allMark = Pen.annotate(allBtn.firstChild, 'underline', { manual: true, color: 'var(--pencil)', width: 1.6, gap: 1, seed: 'yr-all' });

    var sel = null, set = new Set(), counts = Y.map(function () { return 0; }), anchorRef = null, focusI = 0;
    cells[0].tabIndex = 0;   // roving tab stop: the ruler is one Tab away, arrows move within it
    var W = 0, cw = 0, th = 0, base = 0, s = 10, marksOn = false;

    function narrowed() { return mode === 'range' ? !!sel : set.size > 0; }
    function inSel(i) { return mode === 'range' ? (!sel || (i >= sel.a && i < sel.b)) : (!set.size || set.has(i)); }
    function current() { return mode === 'range' ? (sel ? { a: sel.a, b: sel.b } : null) : (set.size ? new Set(set) : null); }

    // ---- geometry and ink ----
    function geom() {
      W = track.clientWidth; cw = W / N; s = cw < 44 ? 8.5 : 11;
      var gap = Math.max(2, s * .3), rows = Math.max(1, Tally.rows(opt.maxCount || 5, cw, s));
      th = rows * (s + gap) + 4; base = th + 6;
      track.style.setProperty('--th', th + 'px');
      ink.setAttribute('width', W); ink.setAttribute('height', base + 30);
      var g = '<line x1="0" y1="' + base + '" x2="' + W + '" y2="' + base + '" class="yr-base"/>';
      for (var i = 0; i <= N; i++) g += '<line x1="' + (i * cw).toFixed(1) + '" y1="' + (base - 5) + '" x2="' + (i * cw).toFixed(1) + '" y2="' + (base + 1.5) + '" class="yr-tick"/>';
      grid.innerHTML = g;
      if (br) ['a', 'b'].forEach(function (k) {
        var svg = br[k].el.querySelector('svg'), p = Pen.path(Pen.bracket(base + 22, 'yr-' + col.kind + k, k === 'a' ? 'left' : 'right'), { width: 2 });
        svg.innerHTML = ''; svg.appendChild(p);
        if (!marksOn) hidePath(p);
        if (sel) br[k].x = edge(k); br[k].v = 0;
      });
    }
    function hidePath(p) { var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L); }
    function showPath(p) { p.getAnimations().forEach(function (a) { a.cancel(); }); p.style.strokeDasharray = 'none'; p.style.strokeDashoffset = 0; }
    function edge(k) { return k === 'a' ? sel.a * cw + 3 : sel.b * cw - 3; }
    function tallies(animate) {
      tls.forEach(function (g, i) { Tally.render(g, counts[i], { x: i * cw, cw: cw, base: base - 4, s: s }, { animate: animate, delay: i * 26, seed: col.kind + Y[i] }); });
    }
    function shade() {
      var nar = narrowed();
      root.classList.toggle('narrowed', nar);
      cells.forEach(function (c, i) {
        var on = nar && inSel(i), n = counts[i];
        c.setAttribute('aria-selected', String(on));
        c.classList.toggle('is-in', inSel(i)); c.classList.toggle('is-sel', on); c.classList.toggle('is-dim', !n);
        var t = Y[i] + ' · ' + n + ' ' + (n === 1 ? col.noun.one : col.noun.many) + ' · ' + n + ' ' + col.noun.zh;
        c.setAttribute('aria-label', t); c.title = t;
        tls[i].classList.toggle('in', inSel(i));
      });
      if (nar) Tally.unmark(allMark); else allMark.show();
      allBtn.setAttribute('aria-pressed', String(!nar));
    }

    // ---- marks: range → two brackets + a window stroke on the baseline; set → a loop per year ----
    function paintMarks() {
      if (!br) return;
      br.a.el.style.transform = 'translateX(' + br.a.x.toFixed(2) + 'px)';
      br.b.el.style.transform = 'translateX(' + br.b.x.toFixed(2) + 'px)';
      var x1 = br.a.x + 1, x2 = br.b.x - 1, y = base, bow = Pen.rng('yw' + col.kind)() * 1.2 + .4;
      win.setAttribute('d', x2 > x1 ? Pen.smooth([[x1, y], [(x1 + x2) / 2, y + bow], [x2, y - .6]]) : '');
      // The window changes length as the brackets move; a dash sized for the old length would cut
      // it short, so once it is on the ruler it is drawn solid (an unfinished draw-in just completes).
      if (marksOn) { win.getAnimations().forEach(function (a) { a.finish(); }); win.style.strokeDasharray = 'none'; }
    }
    function marks(animate) {
      if (!br) return;
      var on = !!sel, paths = [br.a.el.querySelector('path'), br.b.el.querySelector('path')];
      if (on && !marksOn) {
        marksOn = true; br.a.x = edge('a'); br.b.x = edge('b'); br.a.v = br.b.v = 0; paintMarks();
        if (animate && !Pen.reduced()) { Pen.draw(paths[0], { duration: 200 }); Pen.draw(paths[1], { duration: 200, delay: 70 }); Pen.draw(win, { duration: 240, delay: 150 }); }
        else { paths.forEach(showPath); showPath(win); }
      } else if (!on && marksOn) {
        marksOn = false;
        paths.concat(win).forEach(function (p) { if (Pen.reduced()) { p.getAnimations().forEach(function (a) { a.cancel(); }); hidePath(p); } else Pen.erase(p, { duration: 150 }); });
      } else if (on) kick();
    }
    function loops(animate) {
      if (mode !== 'set') return;
      cells.forEach(function (c, i) {
        var svg = c.querySelector('.yr-loop'), on = set.has(i);
        if (on && !svg) {
          svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'yr-loop'); svg.setAttribute('aria-hidden', 'true');
          var l = labels[i], lr = l.getBoundingClientRect(), cr = c.getBoundingClientRect();   // the label is centred by transform
          svg.style.left = (lr.left - cr.left).toFixed(1) + 'px'; svg.style.top = (lr.top - cr.top).toFixed(1) + 'px'; c.appendChild(svg);
          var p = Pen.path(Pen.loop(l.offsetWidth, l.offsetHeight, 'yl' + col.kind + Y[i], { pad: cw < 44 ? 2 : 4 }), { width: 1.9 });
          svg.appendChild(p);
          if (animate) Pen.draw(p, { duration: 360 }); else showPath(p);
        } else if (!on && svg) {
          var q = svg.querySelector('path'), a = Pen.reduced() ? null : Tally.unpen(q, { duration: 150 });
          if (a) a.onfinish = function () { svg.remove(); }; else svg.remove();
        }
      });
    }

    // ---- bracket springs (they chase the year boundaries; one small overshoot) ----
    var raf = 0, last = 0;
    function frame(now) {
      var dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60; last = now;
      var moving = false, n = Math.ceil(dt / (1 / 240)), h = dt / n;
      if (sel) ['a', 'b'].forEach(function (k) {
        var o = br[k], tg = edge(k);
        for (var i = 0; i < n; i++) { o.v += (-K * (o.x - tg) - C * o.v) * h; o.x += o.v * h; }
        if (Math.abs(o.x - tg) < 0.1 && Math.abs(o.v) < 2) { o.x = tg; o.v = 0; } else moving = true;
      });
      paintMarks();
      raf = moving ? requestAnimationFrame(frame) : 0; if (!raf) last = 0;
    }
    function kick() {
      if (!br || !sel) return;
      if (Pen.reduced()) { br.a.x = edge('a'); br.b.x = edge('b'); paintMarks(); return; }
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function setSel(next, animate) {
      if (mode === 'range') sel = next ? { a: next.a, b: next.b } : null;
      else set = next ? new Set(next) : new Set();
      shade(); marks(animate); loops(animate);
    }

    // ---- output: throttled while dragging, immediate on commit ----
    var lastEmit = 0, pendingT = 0;
    function emit(commit) {
      clearTimeout(pendingT);
      var wait = THROTTLE - (performance.now() - lastEmit);
      if (!commit && wait > 0) { pendingT = setTimeout(function () { emit(false); }, wait); return; }
      lastEmit = performance.now();
      opt.onChange(current(), { commit: commit });
    }
    function focusCell(i, quiet) {
      focusI = i; cells.forEach(function (c, j) { c.tabIndex = j === i ? 0 : -1; });
      if (!quiet) cells[i].focus({ preventScroll: true });
    }
    function clickCell(i, shift) {
      if (mode === 'set') { if (set.has(i)) set.delete(i); else set.add(i); setSel(set, true); emit(true); return; }
      var next;
      if (shift && anchorRef != null) next = { a: Math.min(anchorRef, i), b: Math.max(anchorRef, i) + 1 };
      else if (sel && sel.a === i && sel.b === i + 1) { next = null; anchorRef = null; }
      else { next = { a: i, b: i + 1 }; anchorRef = i; }
      setSel(next, true); emit(true);
    }

    // ---- pointer: press = click; press + move = drag a span ----
    var drag = null;
    function cellAt(x) { return clamp(Math.floor((x - track.getBoundingClientRect().left) / cw), 0, N - 1); }
    function flag(x, touch) {
      var fx = clamp(x - track.getBoundingClientRect().left, 34, W - 34);
      flagEl.textContent = opt.flagText(current());
      flagEl.style.transform = 'translate(' + fx.toFixed(1) + 'px,' + (touch ? -54 : -32) + 'px) translateX(-50%)';
      root.classList.add('flag-on');
    }
    function dragTo(x, touch) {
      var j = cellAt(x), a = Math.min(drag.anchor, j), b = Math.max(drag.anchor, j) + 1;
      if (!sel || sel.a !== a || sel.b !== b) { setSel({ a: a, b: b }, false); emit(false); }
      flag(x, touch);
    }
    track.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      var i = cellAt(e.clientX), anchor = i;
      if (sel && sel.b - sel.a > 1) { if (i === sel.a) anchor = sel.b - 1; else if (i === sel.b - 1) anchor = sel.a; }
      drag = { id: e.pointerId, i0: i, anchor: anchor, x0: e.clientX, moved: false, touch: e.pointerType !== 'mouse' };
      if (mode === 'range') try { track.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
      focusCell(i, true);
    });
    track.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id || mode !== 'range') return;
      if (!drag.moved) { if (Math.abs(e.clientX - drag.x0) < 6) return; drag.moved = true; root.classList.add('is-drag'); opt.onHint(null); hov.forEach(function (h) { Tally.unmark(h); }); }
      dragTo(e.clientX, drag.touch);
    });
    function end(e, cancel) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null; root.classList.remove('is-drag', 'flag-on');
      if (d.moved) { anchorRef = d.anchor; emit(true); }
      else if (!cancel) clickCell(d.i0, e.shiftKey);
    }
    track.addEventListener('pointerup', function (e) { end(e, false); });
    track.addEventListener('pointercancel', function (e) { end(e, true); });
    cells.forEach(function (c, i) {
      c.addEventListener('pointerenter', function (e) { if (drag || e.pointerType === 'touch') return; hov[i].show(); opt.onHint(Y[i]); });
      c.addEventListener('pointerleave', function () { Tally.unmark(hov[i]); });
      c.addEventListener('focus', function () { if (!drag) opt.onHint(Y[i]); });
      c.addEventListener('blur', function () { opt.onHint(null); });
    });
    track.addEventListener('pointerleave', function () { if (!drag) opt.onHint(null); });

    // ---- keyboard: roving focus; Enter/Space picks, Shift+arrows extend a span, Esc = every year ----
    track.addEventListener('keydown', function (e) {
      var c = e.target.closest('.yr-cell'); if (!c) return;
      var i = +c.dataset.i, k = e.key, j = k === 'ArrowRight' || k === 'ArrowDown' ? i + 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? N - 1 : null;
      if (j != null) {
        e.preventDefault(); j = clamp(j, 0, N - 1); focusCell(j);
        if (e.shiftKey && mode === 'range') { if (anchorRef == null) anchorRef = i; setSel({ a: Math.min(anchorRef, j), b: Math.max(anchorRef, j) + 1 }, true); emit(true); }
      } else if (k === 'Enter' || k === ' ') { e.preventDefault(); clickCell(i, e.shiftKey); }
      else if (k === 'Escape' && narrowed()) { e.preventDefault(); anchorRef = null; setSel(null, true); emit(true); }
    });
    allBtn.addEventListener('click', function () { if (!narrowed()) return; anchorRef = null; setSel(null, true); emit(true); });
    allBtn.addEventListener('pointerenter', function () { if (narrowed()) allMark.show(); });
    allBtn.addEventListener('pointerleave', function () { if (narrowed()) Tally.unmark(allMark); });

    // ---- input from the controller ----
    function same(a, b) {
      if (!a || !b) return !a && !b;
      if (mode === 'range') return a.a === b.a && a.b === b.b;
      return a.size === b.size && Array.from(a).every(function (x) { return b.has(x); });
    }
    function sync(next, nextCounts, o) {
      o = o || {};
      var changed = nextCounts.some(function (n, i) { return n !== counts[i]; });
      counts = nextCounts.slice();
      if (!same(next, current())) { if (!next) anchorRef = null; setSel(next, o.animate !== false); } else shade();
      if (changed) tallies(o.animate !== false && o.recount);
    }
    // A scripted drag for the replay button and the verification runner: same code path as a hand.
    function glide(fromI, toI, ms, done) {
      var r = track.getBoundingClientRect(), x0 = r.left + (fromI + .5) * cw, x1 = r.left + (toI + .5) * cw, t0 = performance.now();
      drag = { id: -1, i0: fromI, anchor: fromI, x0: x0, moved: true, touch: false }; root.classList.add('is-drag');
      (function step(now) {
        if (!drag || drag.id !== -1) return;
        var t = Math.min(1, (now - t0) / ms), ease = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        dragTo(x0 + (x1 - x0) * ease, false);
        if (t < 1) requestAnimationFrame(step); else { end({ pointerId: -1, shiftKey: false }, false); if (done) done(); }
      })(t0);
    }

    function build() { geom(); tallies(false); shade(); paintMarks(); if (mode === 'set') { cells.forEach(function (c) { var l = c.querySelector('.yr-loop'); if (l) l.remove(); }); loops(false); } }
    build();
    if (document.fonts) document.fonts.ready.then(build);
    if (window.ResizeObserver) new ResizeObserver(function () { if (Math.abs(track.clientWidth - W) > 1) build(); }).observe(track);
    return { el: root, sync: sync, glide: glide, click: function (i, shift) { clickCell(i, shift); }, index: function (y) { return Y.indexOf(y); } };
  }

  window.Ruler = { create: create };
})();
