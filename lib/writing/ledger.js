/* lib/writing/ledger.js — the year dimension as a ledger page, directly under the tabs. One ruled line per
   calendar year, newest first, 2020 included; each line keeps its 正
   tally from the margin (one stroke per essay, five make 正, recounted stroke by stroke on the hand's clock).
   Click a year; click it again for every year; drag down or up the ledger for a span (the books reflow while
   you drag, at most once per 90 ms); drag from a chosen end to resize; shift-click or Shift+↑↓ to extend;
   Esc for every year. A paper flag names the span beside the pointer while you drag.
   On a phone the same ledger is turned on its side: twelve columns, tallies stacked, drag across.
   Pen: hover = coral line under the year, chosen years = the wheat band, keyboard focus = coral 「 」. Rows are
   tall enough (--rh, 30 px) that a year's underline sits ≥ 10 px above the next year (scripts/verify/
   pen-spacing.mjs). */
var NS = 'http://www.w3.org/2000/svg';

/* ---- 正 tallies ---- */
var STROKES = [[.1, .08, .9, .08], [.5, .08, .5, .94], [.5, .5, .86, .5], [.17, .44, .17, .94], [0, .94, 1, .94]];
// geo: { x, y, s, line: true } writes left to right from the margin; { x, cw, base, s } stacks 正 centred in a cell.
function layout(n, geo) {
  var s = geo.s, gap = Math.max(2, s * .3), chars = Math.ceil(n / 5), out = [], c;
  if (geo.line) { for (c = 0; c < chars; c++) out.push([geo.x + c * (s + gap), geo.y]); return out; }
  var per = Math.max(1, Math.floor((geo.cw - 6 + gap) / (s + gap)));
  for (c = 0; c < chars; c++) {
    var row = Math.floor(c / per), inRow = Math.min(per, chars - row * per), col = c % per;
    out.push([geo.x + geo.cw / 2 - (inRow * (s + gap) - gap) / 2 + col * (s + gap), geo.base - (row + 1) * (s + gap)]);
  }
  return out;
}
function strokeD(k, pos, s, seed) {
  var c = pos[Math.floor(k / 5)], st = STROKES[k % 5], r = Pen.rng(seed + ':' + k);
  var x1 = c[0] + st[0] * s + (r() - .5) * .8, y1 = c[1] + st[1] * s + (r() - .5) * .8, x2 = c[0] + st[2] * s + (r() - .5) * .8, y2 = c[1] + st[3] * s + (r() - .5) * .8;
  var bow = (r() - .5) * .9, vert = Math.abs(st[3] - st[1]) > Math.abs(st[2] - st[0]);
  return Pen.smooth([[x1, y1], [(x1 + x2) / 2 + (vert ? bow : 0), (y1 + y2) / 2 + (vert ? 0 : bow)], [x2, y2]]);
}
function tally(g, n, geo, o) {
  o = o || {};
  var have = Array.prototype.slice.call(g.querySelectorAll('path:not(.going)')), pos = layout(n, geo), k;
  var anim = o.animate && !Motion.reduced(), step = Math.min(60, 420 / Math.max(1, n - have.length));
  for (k = 0; k < Math.min(n, have.length); k++) {
    have[k].setAttribute('d', strokeD(k, pos, geo.s, o.seed));
    have[k].getAnimations().forEach(function (a) { a.finish(); });
    have[k].style.strokeDasharray = 'none'; have[k].style.strokeDashoffset = 0;
  }
  for (k = have.length; k < n; k++) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', strokeD(k, pos, geo.s, o.seed)); g.appendChild(p);
    if (anim) Pen.draw(p, { delay: (o.delay || 0) + (k - have.length) * step, duration: 90 });
  }
  for (k = have.length - 1; k >= n; k--) {                    // the last strokes written lift off first
    var q = have[k];
    if (!anim) { q.remove(); continue; }
    q.classList.add('going');
    var a = Pen.erase(q, { duration: 110 });
    if (a) a.onfinish = function () { this.remove(); }.bind(q); else q.remove();
  }
}

var THROTTLE = 90;
var clamp = Motion.clamp;

function Ledger(col, opt) {
  var Y = col.years, N = Y.length, orient = col.index.orient === 'side' ? 'rows' : 'cols', rows = orient === 'rows';
  var root = col.index.years;
  root.className += ' lg lg-' + orient;
  root.innerHTML = '<div class="lg-head"><div class="ctl-label" aria-hidden="true"><span lang="zh">年份</span><span>years</span></div>' +
    '<button type="button" class="lg-all"><span class="lg-all-t">' + (rows ? 'every year · <span lang="zh">所有年份</span>' : 'all · <span lang="zh">全部</span>') + '</span></button></div>' +
    '<div class="lg-track" role="listbox" aria-label="Years" aria-multiselectable="true" aria-orientation="' + (rows ? 'vertical' : 'horizontal') + '">' +
    '<svg class="lg-ink" aria-hidden="true"><g class="lg-rules"></g><g class="lg-tallies">' + Y.map(function (y, i) { return '<g class="tl" data-i="' + i + '"></g>'; }).join('') + '</g></svg>' +
    Y.map(function (y, i) {
      // a column shows ’26; what it reads out is the whole year and its count (the sr-only line, set by shade)
      return '<div class="lg-row" role="option" data-i="' + i + '" aria-selected="false" tabindex="-1"><span class="lg-y"' + (rows ? '>' + y : ' aria-hidden="true">’' + y.slice(2)) +
        '</span><span class="sr-only lg-sr"></span></div>';
    }).join('') + '<div class="lg-flag" aria-hidden="true"></div></div>';
  var track = root.querySelector('.lg-track'), ink = root.querySelector('.lg-ink'), rules = root.querySelector('.lg-rules');
  var flagEl = root.querySelector('.lg-flag'), allBtn = root.querySelector('.lg-all');
  var cells = Array.prototype.slice.call(root.querySelectorAll('.lg-row')), tls = Array.prototype.slice.call(root.querySelectorAll('.tl'));
  var marks = cells.map(function (c, i) { return new TierMark(c, c.firstChild, { over: 3, seed: 'yr|' + Y[i] }); });
  var focs = cells.map(function (c) { return new FocusMark(c, c.firstChild, { gap: 5, gy: 3 }); });
  var allMark = new TierMark(allBtn, allBtn.firstChild, { over: 3, seed: 'yr|all' });
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
    tls.forEach(function (g, i) { tally(g, counts[i], geo(i), { animate: animate, delay: i * 26, seed: 'lg' + Y[i] }); });
  }
  function shade(how) {
    var nar = narrowed();
    root.classList.toggle('narrowed', nar);
    cells.forEach(function (c, i) {
      var on = nar && inSel(i), n = counts[i];
      c.setAttribute('aria-selected', String(on));
      c.classList.toggle('is-in', inSel(i)); c.classList.toggle('is-sel', on); c.classList.toggle('is-dim', !n);
      c.querySelector('.lg-sr').textContent = (rows ? '' : Y[i]) + ' · ' + n + ' ' + (n === 1 ? col.noun.one : col.noun.many);
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
  function build() {
    geom(); tallies(false);
    marks.forEach(function (m) { m.build(); }); focs.forEach(function (f) { f.build(); }); allMark.build(); allFoc.build();
    shade('instant');
  }
  build();
  document.fonts.ready.then(function () { if (track.isConnected) build(); });
  var ro = new ResizeObserver(function () { if (Math.abs(track.clientWidth - W) > 1 || Math.abs(track.clientHeight - H) > 1) build(); });
  ro.observe(track);
  return {
    sync: sync,
    destroy: function () {
      ro.disconnect(); clearTimeout(pendingT);
      marks.concat(focs, [allMark, allFoc]).forEach(function (m) { m.destroy(); });
    }
  };
}

export { Ledger };
