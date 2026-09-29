/* r3-03-ledger.js — the year dimension as a ledger page, directly under the tabs. Same interface as
   r2-03-ruler.js (Ruler.create(col, opt) → { el, sync, glide, click, index }), so r2-03's controller drives it
   unchanged, in 'range' mode (round-2 A: click a year, drag for a span).
   rows (wide layouts): one ruled line per calendar year, newest first, 2020 included; each line keeps its 正
     tally from the margin (r3-03-tally.js). Click a year; click it again for every year; drag down or up the
     ledger for a span (the books reflow while you drag, at most once per 90 ms); drag from a chosen end to
     resize; shift-click or Shift+↑↓ to extend.
   cols (phone): the same ledger turned on its side — twelve columns, tallies stacked, drag across.
   Pen (board 02): hover = level underline under the year; chosen years = highlighter band; no brackets, no
   coral. A paper flag names the span beside the pointer while you drag (above the thumb on a phone). */
(function () {
  var NS = 'http://www.w3.org/2000/svg', THROTTLE = 90;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function create(col, opt) {
    var Y = col.years, N = Y.length, orient = col.index.orient === 'side' ? 'rows' : 'cols', rows = orient === 'rows';
    var root = col.index.years;
    root.className += ' lg lg-' + orient;
    root.innerHTML = '<div class="lg-head"><div class="ctl-label" aria-hidden="true"><span lang="zh">年份</span><span>years</span></div>' +
      '<button type="button" class="lg-all"><span class="lg-all-t">' + (rows ? 'every year · 所有年份' : 'all · 全部') + '</span></button></div>' +
      '<div class="lg-track" role="listbox" aria-label="Years · 年份" aria-multiselectable="true" aria-orientation="' + (rows ? 'vertical' : 'horizontal') + '">' +
      '<svg class="lg-ink" aria-hidden="true"><g class="lg-rules"></g><g class="lg-tallies">' + Y.map(function (y, i) { return '<g class="tl" data-i="' + i + '"></g>'; }).join('') + '</g></svg>' +
      Y.map(function (y, i) {
        return '<div class="lg-row" role="option" data-i="' + i + '" aria-selected="false" tabindex="-1"><span class="lg-y">' + (rows ? y : '’' + y.slice(2)) + '</span></div>';
      }).join('') + '<div class="lg-flag" aria-hidden="true"></div></div>';
    var track = root.querySelector('.lg-track'), ink = root.querySelector('.lg-ink'), rules = root.querySelector('.lg-rules');
    var flagEl = root.querySelector('.lg-flag'), allBtn = root.querySelector('.lg-all');
    var cells = Array.prototype.slice.call(root.querySelectorAll('.lg-row')), tls = Array.prototype.slice.call(root.querySelectorAll('.tl'));
    var marks = cells.map(function (c, i) { return new TierMark(c, c.firstChild, { tick: false, gap: 1, over: 3, seed: 'yr|' + Y[i] }); });
    var focs = cells.map(function (c) { return new FocusMark(c, c.firstChild, { gap: 5, gy: 3 }); });
    var allMark = new TierMark(allBtn, allBtn.firstChild, { tick: false, gap: 1, over: 3, seed: 'yr|all' });
    var allFoc = new FocusMark(allBtn, allBtn.firstChild, { gap: 5, gy: 3 });
    var tiers = cells.map(function () { return -1; }), allTier = -1, hovI = -1, allHov = false;

    var sel = null, counts = Y.map(function () { return 0; }), anchorRef = null;
    cells[0].tabIndex = 0;
    var W = 0, H = 0, cs = 0, s = 12, TX = 0;

    function narrowed() { return !!sel; }
    function inSel(i) { return !sel || (i >= sel.a && i < sel.b); }
    function current() { return sel ? { a: sel.a, b: sel.b } : null; }

    // ---- geometry and ruling ----
    function geom() {
      W = track.clientWidth; H = track.clientHeight;
      cs = rows ? H / N : W / N; s = rows ? Math.min(13, cs * .56) : Math.min(11, cs * .36);
      TX = rows ? cells[0].firstChild.offsetLeft + cells[0].firstChild.offsetWidth + 18 : 0;
      ink.setAttribute('width', W); ink.setAttribute('height', H);
      var g = '';
      if (rows) {
        for (var i = 1; i < N; i++) g += '<line x1="0" y1="' + (i * cs).toFixed(1) + '" x2="' + W + '" y2="' + (i * cs).toFixed(1) + '" class="lg-rule"/>';
        g += '<line x1="' + (TX - 9) + '" y1="-4" x2="' + (TX - 9) + '" y2="' + (H + 2) + '" class="lg-margin"/>';
      } else {
        var base = H - 22;
        g += '<line x1="0" y1="' + base + '" x2="' + W + '" y2="' + base + '" class="lg-margin"/>';
        for (i = 0; i <= N; i++) g += '<line x1="' + (i * cs).toFixed(1) + '" y1="' + (base - 4) + '" x2="' + (i * cs).toFixed(1) + '" y2="' + (base + 1.5) + '" class="lg-tick"/>';
      }
      rules.innerHTML = g;
    }
    function geo(i) { return rows ? { line: true, x: TX, y: i * cs + (cs - s) / 2, s: s } : { x: i * cs, cw: cs, base: H - 26, s: s }; }
    function tallies(animate) {
      tls.forEach(function (g, i) { Tally3.render(g, counts[i], geo(i), { animate: animate, delay: i * 26, seed: 'lg' + Y[i] }); });
    }
    function shade(how) {
      var nar = narrowed();
      root.classList.toggle('narrowed', nar);
      cells.forEach(function (c, i) {
        var on = nar && inSel(i), n = counts[i];
        c.setAttribute('aria-selected', String(on));
        c.classList.toggle('is-in', inSel(i)); c.classList.toggle('is-sel', on); c.classList.toggle('is-dim', !n);
        var t = Y[i] + ' · ' + n + ' ' + (n === 1 ? col.noun.one : col.noun.many) + ' · ' + n + ' ' + col.noun.zh;
        c.setAttribute('aria-label', t); c.title = t;
        tls[i].classList.toggle('in', inSel(i));
        var tr = on ? 2 : hovI === i && !drag ? 1 : 0;
        if (tr !== tiers[i] || how === 'instant') { tiers[i] = tr; marks[i].to(tr, how); }
      });
      var at = !nar ? 2 : allHov ? 1 : 0;
      if (at !== allTier || how === 'instant') { allTier = at; allMark.to(at, how); }
      allBtn.setAttribute('aria-pressed', String(!nar));
    }
    function setSel(next, how) { sel = next ? { a: next.a, b: next.b } : null; shade(how); }

    var lastEmit = 0, pendingT = 0;
    function emit(commit) {
      clearTimeout(pendingT);
      var wait = THROTTLE - (performance.now() - lastEmit);
      if (!commit && wait > 0) { pendingT = setTimeout(function () { emit(false); }, wait); return; }
      lastEmit = performance.now();
      opt.onChange(current(), { commit: commit });
    }
    function focusCell(i, quiet) {
      cells.forEach(function (c, j) { c.tabIndex = j === i ? 0 : -1; });
      if (!quiet) cells[i].focus({ preventScroll: true });
    }
    function clickCell(i, shift) {
      var next;
      if (shift && anchorRef != null) next = { a: Math.min(anchorRef, i), b: Math.max(anchorRef, i) + 1 };
      else if (sel && sel.a === i && sel.b === i + 1) { next = null; anchorRef = null; }
      else { next = { a: i, b: i + 1 }; anchorRef = i; }
      setSel(next, 'press'); emit(true);
    }

    // ---- pointer: press = click; press + move along the ledger = drag a span ----
    var drag = null;
    function along(e) { return rows ? e.clientY : e.clientX; }
    function cellAt(v) { var r = track.getBoundingClientRect(); return clamp(Math.floor((v - (rows ? r.top : r.left)) / cs), 0, N - 1); }
    function flag(v, touch) {
      var r = track.getBoundingClientRect();
      flagEl.textContent = opt.flagText(current());
      if (rows) flagEl.style.transform = 'translate(-100%,' + (clamp(v - r.top, 6, H - 6) - 13).toFixed(1) + 'px) translateX(-14px)';
      else { var fw = flagEl.offsetWidth / 2 + 2; flagEl.style.transform = 'translate(' + clamp(v - r.left, fw, W - fw).toFixed(1) + 'px,' + (touch ? -58 : -34) + 'px) translateX(-50%)'; }
      root.classList.add('flag-on');
    }
    function dragTo(v, touch) {
      var j = cellAt(v), a = Math.min(drag.anchor, j), b = Math.max(drag.anchor, j) + 1;
      if (!sel || sel.a !== a || sel.b !== b) { setSel({ a: a, b: b }, 'tap'); emit(false); }
      flag(v, touch);
    }
    track.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      var i = cellAt(along(e)), anchor = i;
      if (sel && sel.b - sel.a > 1) { if (i === sel.a) anchor = sel.b - 1; else if (i === sel.b - 1) anchor = sel.a; }
      drag = { id: e.pointerId, i0: i, anchor: anchor, v0: along(e), moved: false, touch: e.pointerType !== 'mouse' };
      try { track.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
      focusCell(i, true);
    });
    track.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) { if (Math.abs(along(e) - drag.v0) < 6) return; drag.moved = true; root.classList.add('is-drag'); opt.onHint(null); hovI = -1; }
      dragTo(along(e), drag.touch);
    });
    function end(e, cancel) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null; root.classList.remove('is-drag', 'flag-on');
      if (d.moved) { anchorRef = d.anchor; emit(true); shade('hover'); }
      else if (!cancel) clickCell(d.i0, e.shiftKey);
    }
    track.addEventListener('pointerup', function (e) { end(e, false); });
    track.addEventListener('pointercancel', function (e) { end(e, true); });
    cells.forEach(function (c, i) {
      c.addEventListener('pointerenter', function (e) { if (drag || e.pointerType === 'touch') return; hovI = i; shade('hover'); opt.onHint(Y[i]); });
      c.addEventListener('pointerleave', function () { if (hovI === i) { hovI = -1; shade('hover'); } });
      c.addEventListener('focus', function () { if (c.matches(':focus-visible')) focs[i].set(true); if (!drag) opt.onHint(Y[i]); });
      c.addEventListener('blur', function () { focs[i].set(false); opt.onHint(null); });
    });
    track.addEventListener('pointerleave', function () { if (!drag) opt.onHint(null); });

    track.addEventListener('keydown', function (e) {
      var c = e.target.closest('.lg-row'); if (!c) return;
      var i = +c.dataset.i, k = e.key, j = k === 'ArrowRight' || k === 'ArrowDown' ? i + 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? N - 1 : null;
      if (j != null) {
        e.preventDefault(); j = clamp(j, 0, N - 1); focusCell(j);
        if (e.shiftKey) { if (anchorRef == null) anchorRef = i; setSel({ a: Math.min(anchorRef, j), b: Math.max(anchorRef, j) + 1 }, 'key'); emit(true); }
      } else if (k === 'Enter' || k === ' ') { e.preventDefault(); clickCell(i, e.shiftKey); }
      else if (k === 'Escape' && narrowed()) { e.preventDefault(); anchorRef = null; setSel(null, 'key'); emit(true); }
    });
    allBtn.addEventListener('click', function () { if (!narrowed()) return; anchorRef = null; setSel(null, 'press'); emit(true); });
    allBtn.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; allHov = true; shade('hover'); });
    allBtn.addEventListener('pointerleave', function () { allHov = false; shade('hover'); });
    allBtn.addEventListener('focus', function () { if (allBtn.matches(':focus-visible')) allFoc.set(true); });
    allBtn.addEventListener('blur', function () { allFoc.set(false); });

    function same(a, b) { if (!a || !b) return !a && !b; return a.a === b.a && a.b === b.b; }
    function sync(next, nextCounts, o) {
      o = o || {};
      var changed = nextCounts.some(function (n, i) { return n !== counts[i]; });
      counts = nextCounts.slice();
      if (!same(next, current())) { if (!next) anchorRef = null; setSel(next, o.animate === false ? 'instant' : 'press'); } else shade(o.animate === false ? 'instant' : 'hover');
      if (changed) tallies(o.animate !== false && o.recount);
    }
    // A scripted drag for the replay button and the verification runner: the same code path as a hand.
    function glide(fromI, toI, ms, done) {
      var r = track.getBoundingClientRect(), o = rows ? r.top : r.left, v0 = o + (fromI + .5) * cs, v1 = o + (toI + .5) * cs, t0 = performance.now();
      drag = { id: -1, i0: fromI, anchor: fromI, v0: v0, moved: true, touch: false }; root.classList.add('is-drag');
      (function step(now) {
        if (!drag || drag.id !== -1) return;
        var t = Math.min(1, (now - t0) / ms), ease = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        dragTo(v0 + (v1 - v0) * ease, false);
        if (t < 1) requestAnimationFrame(step); else { end({ pointerId: -1, shiftKey: false }, false); if (done) done(); }
      })(t0);
    }

    function build() {
      geom(); tallies(false);
      marks.forEach(function (m) { m.build(); }); focs.forEach(function (f) { f.build(); }); allMark.build(); allFoc.build();
      shade('instant');
    }
    build();
    if (document.fonts) document.fonts.ready.then(build);
    if (window.ResizeObserver) new ResizeObserver(function () { if (Math.abs(track.clientWidth - W) > 1 || Math.abs(track.clientHeight - H) > 1) build(); }).observe(track);
    return { el: root, sync: sync, glide: glide, click: function (i, shift) { clickCell(i, shift); }, index: function (y) { return Y.indexOf(y); } };
  }

  window.Ruler = { create: create };
})();
