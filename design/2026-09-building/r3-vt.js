/* design/2026-09-building · round 3 · C's board ↔ project moves between the r3 pages: 00-vt.js's C branch (in, out,
   chapter), keyed to the r3 files, plus the two things round 3 lets Fred choose:
   · Q8, the card's direct link ("Enter the field notes →"): (a) the tabs peeking behind the card travel, as a dossier
     tab's do (r3-board.js names them); (b) a plain cut, no transition.
   · Q2 is the board's (r3-board.js): this file only tells it, at landing, whether a transition ran, so a pin is
     never hidden or pressed without one (PORT-PLAN R17).
   Everything that moves is transform or opacity; a clip may be set but holds still. Reduced motion gets none. */
(function () {
  'use strict';
  var M = window.Motion, html = document.documentElement, KEY = 'fy-r3-vt', FRESH = 10000;
  if (!M) return;
  var reduced = function () { return window.BD ? BD.reduced() : M.reduced(); };
  var PAGES = {
    'r3-board.html': { role: 'board' },
    'r3-overview.html': { role: 'project', project: 'fred-agent', n: 1 },
    'r3-system.html': { role: 'project', project: 'fred-agent', n: 2 },
    'r3-principles.html': { role: 'project', project: 'fred-agent', n: 3 },
    'r3-components.html': { role: 'project', project: 'fred-agent', n: 4 },
    'r3-njjoe.html': { role: 'project', project: 'njjoe', n: 1 }
  };
  function roleOf(href) {
    var u; try { u = new URL(href, location.href); } catch (e) { return null; }
    if (u.origin !== location.origin || u.pathname.indexOf('/design/2026-09-building/') < 0) return null;
    var f = u.pathname.split('/').pop(), p = PAGES[f];
    return p ? { role: p.role, project: p.project, n: p.n, file: f } : null;
  }
  var HERE = roleOf(location.href);
  function read() { try { var r = JSON.parse(sessionStorage.getItem(KEY)); return r && Date.now() - r.t < FRESH ? r : null; } catch (e) { return null; } }
  var lastLink = null, clickT = 0;
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) { lastLink = a; clickT = Date.now(); } }, true);
  window.BDVT = { roleOf: roleOf, link: function () { return Date.now() - clickT < 3000 ? lastLink : null; } };
  function kind(from, to) {
    if (!from || !to) return null;
    if (from.role === 'board' && to.role === 'project') return 'in';
    if (from.role === 'project' && to.role === 'board') return 'out';
    if (from.role === 'project' && to.role === 'project' && from.project === to.project && from.file !== to.file) return 'chapter';
    return null;
  }

  /* ---- the pseudo-tree (00-vt.js, as transitions.js reads it) ---- */
  function uaAnims() {
    var A = {};
    document.getAnimations().forEach(function (a) { var ef = a.effect, pe = ef && ef.target === html && ef.pseudoElement; if (pe) (A[pe] = A[pe] || []).push(a); });
    return A;
  }
  function kill(A, name, parts) { parts.forEach(function (p) { (A['::view-transition-' + p + '(' + name + ')'] || []).forEach(function (a) { a.cancel(); }); }); }
  function pa(part, name, kf, o) { o.fill = 'both'; o.pseudoElement = '::view-transition-' + part + '(' + name + ')'; return html.animate(kf, o); }
  function ends(A, name) {
    var g = (A['::view-transition-group(' + name + ')'] || [])[0];
    if (!g) return null;
    var k = g.effect.getKeyframes(), a = k[0], b = k[k.length - 1];
    return { t0: a.transform, t1: b.transform, w0: parseFloat(a.width), h0: parseFloat(a.height), w1: parseFloat(b.width), h1: parseFloat(b.height) };
  }
  function ruleY() { var r = document.querySelector('.site-rule'); return r ? r.getBoundingClientRect().top + r.offsetHeight / 2 : 0; }
  var f2 = function (v) { return +v.toFixed(2); };
  function mat(s) {
    if (!s || s === 'none') return [1, 0, 0, 1, 0, 0];
    var n = s.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number);
    return s.indexOf('matrix3d') === 0 ? [n[0], n[1], n[4], n[5], n[12], n[13]] : n.slice(0, 6);
  }
  function z(m, w, h) { var ox = w / 2, oy = h / 2; return [m[0], m[1], m[2], m[3], m[4] + ox - m[0] * ox - m[2] * oy, m[5] + oy - m[1] * ox - m[3] * oy]; }
  function mul(A, B) { return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]]; }
  function css(A) { return 'matrix(' + A.map(function (v) { return +v.toFixed(5); }).join(',') + ')'; }
  // a group re-timed on a spring: it keeps the new size and is scaled from the old one, never sized
  function carry(A, name, k, cc, delay) {
    var g = ends(A, name);
    if (!g) return null;
    kill(A, name, ['group']);
    var m0 = mul(z(mat(g.t0), g.w0, g.h0), [g.w0 / g.w1, 0, 0, g.h0 / g.h1, 0, 0]), m1 = z(mat(g.t1), g.w1, g.h1);
    var box = { width: g.w1 + 'px', height: g.h1 + 'px', transformOrigin: '0 0' };
    pa('group', name, [Object.assign({ transform: css(m0) }, box), Object.assign({ transform: css(m1) }, box)], { duration: M.springEase.duration(k, cc), delay: delay || 0, easing: M.springEase(k, cc) });
    return g;
  }
  function paperSwap(A) {
    kill(A, 'root', ['old', 'new']);
    pa('old', 'root', [{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'cubic-bezier(.4,0,1,1)' });
    pa('new', 'root', [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 70, easing: 'cubic-bezier(0,0,.2,1)' });
  }
  function tabs(A, spring, relay) { for (var n = 1; n <= 5; n++) carry(A, 'pj-tab-' + n, spring[0], spring[1], relay * (n - 1)); }
  var MOVES = {
    in: function (A) { paperSwap(A); tabs(A, [170, 20], 26); },
    out: function (A) { paperSwap(A); tabs(A, [190, 22], 18); },
    chapter: function (A, rec) {
      var later = HERE.n > rec.from.n, y = ruleY(), slot = 'inset(' + f2(y) + 'px 0 0 0)', W = innerWidth;
      kill(A, 'root', ['old', 'new']);
      tabs(A, [260, 22], 0);
      pa('image-pair', 'root', [{ clipPath: slot }, { clipPath: slot }], { duration: 560 });
      if (later) pa('old', 'root', [{ transform: 'none', zIndex: 1 }, { transform: 'translateX(' + f2(-W * 1.04) + 'px) rotate(-2deg)', zIndex: 1 }], { duration: 440, easing: 'cubic-bezier(.5,0,.75,.4)' });
      else pa('new', 'root', [{ transform: 'translateX(' + f2(-W * 1.04) + 'px) rotate(-2deg)', zIndex: 1 }, { transform: 'none', zIndex: 1 }], { duration: M.springEase.duration(150, 21), easing: M.springEase(150, 21) });
    }
  };

  /* ---- the pen's folder tab round the current nav tab (transitions.js ink(), one hand, fixed seed) ---- */
  function rng(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h += 0x6D2B79F5; var t = Math.imul(h ^ h >>> 15, h | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function ink() {
    var m = document.querySelector('.site-tabmark'), w = m && m.offsetWidth, h = m && m.offsetHeight;
    if (!w || (m.fyW === w && m.fyH === h)) return;
    m.fyW = w; m.fyH = h;
    var r = h > 70 ? 6 : 5, rnd = rng('folder-tab'), j = function () { return (rnd() - 0.5) * 0.9; };
    var d = 'M0.35 ' + h + ' L' + f2(0.3 + j()) + ' ' + f2(h * 0.5) + ' L0.6 ' + r + ' Q0.8 0.6 ' + r + ' 0.5 L' + f2(w * 0.5) + ' ' + f2(0.2 + j()) +
      ' L' + (w - r) + ' 0.7 Q' + f2(w - 0.6) + ' 0.8 ' + f2(w - 0.5) + ' ' + r + ' L' + f2(w - 0.4 + j()) + ' ' + f2(h * 0.55) + ' L' + f2(w - 0.35) + ' ' + h;
    m.innerHTML = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><path d="' + d + '"/></svg>';
    m.classList.add('is-inked');
    if (!m.fyRO && window.ResizeObserver) { m.fyRO = new ResizeObserver(function () { ink(); }); m.fyRO.observe(m); }
  }

  /* ---- the events ---- */
  addEventListener('pageswap', function (e) {
    var act = e.activation, url = act && act.entry ? act.entry.url : (BDVT.link() ? BDVT.link().href : null), to = url ? roleOf(url) : null;
    var rec = { t: Date.now(), from: HERE, to: to };
    try { if (window.BD_PAGE && BD_PAGE.swap) BD_PAGE.swap(rec, to); } catch (err) { setTimeout(function () { throw err; }); }
    try { sessionStorage.setItem(KEY, JSON.stringify(rec)); } catch (x) { /* storage off */ }
    var cut = rec.direct && BD.r3.q8 === 'b';   // Q8 (b): the direct link is a plain cut
    if (e.viewTransition && (reduced() || cut || !kind(HERE, to))) { e.viewTransition.ready.catch(function () {}); e.viewTransition.skipTransition(); }
  });
  function landed(rec, k, vt) { if (window.BD_PAGE && BD_PAGE.landed) try { BD_PAGE.landed(rec, k, vt); } catch (err) { setTimeout(function () { throw err; }); } }
  function reveal(e) {
    ink();
    var vt = e && e.viewTransition, rec = read(), k = rec ? kind(rec.from, HERE) : null;
    try { sessionStorage.removeItem(KEY); } catch (x) { /* storage off */ }
    if (vt) { vt.ready.catch(function () {}); vt.finished.catch(function () {}); }
    if (!vt || !k || reduced()) { if (vt) vt.skipTransition(); landed(rec, k, false); return; }
    html.setAttribute('data-bdvt', 'c-' + k);
    var done = function () { html.removeAttribute('data-bdvt'); landed(rec, k, true); };
    vt.finished.then(done, done);
    vt.ready.then(function () {
      try { (MOVES[k] || paperSwap)(uaAnims(), rec); } catch (err) { vt.skipTransition(); setTimeout(function () { throw err; }); }
    }, function () { /* skipped */ });
  }
  addEventListener('pagereveal', reveal);
  if (!('onpagereveal' in window)) document.addEventListener('DOMContentLoaded', function () { reveal(null); });
  else if (performance.getEntriesByType('paint').length) reveal(null);
})();
