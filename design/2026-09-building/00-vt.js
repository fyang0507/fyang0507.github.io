/* design/2026-09-building · the board ↔ project moves, as cross-document View Transitions between the board mock and the
   project mocks (what a production transitions-project.js would add beside transitions.js / transitions-tab.js).
   Loaded `defer blocking="render"` after motion.js, like transitions.js, so pagereveal is heard.
   · pageswap (the page you leave) writes sessionStorage fy-bd-vt {c, from, to, …}; the page's own hook (BD_PAGE.swap)
     names what travels (a class; the names live in 00-vt.css) and adds what the next page can't measure.
   · pagereveal (the page you land on) reads the browser's own boxes and replaces its animations:
       A in    the card in your hand turns the rest of the way over and lands, face up, taped to the page; the page
               feeds down out of the rule under it (Building's own answer: the laptop prints it)
       A out   the card flies home to its slot; the page feeds back up into the rule; the board then pins it
       B in    the camera keeps going in: the board scales through the slip you chose and the page grows out of it
       B out   the camera pulls back out of the page into its slip, then (on the board) out to the whole wall
       C in    the index tabs you touched travel to the page's fore-edge; the paper swaps under them
       C out   the tabs tuck back behind the card; the board then pins it
       C tab   a tab on the fore-edge: the tabs settle on a spring, the sheet in front is pulled aside (or put back)
   Everything that moves is transform or opacity; a clip may be set but holds still. Reduced motion (or the board's
   preview switch) gets no transition. Other moves between these pages keep the production paper swap. */
(function () {
  'use strict';
  var M = window.Motion, html = document.documentElement, KEY = 'fy-bd-vt', FRESH = 10000;
  if (!M) return;
  var c = html.dataset.c || 'a';
  var reduced = function () { return window.BD ? BD.reduced() : M.reduced(); };
  var PAGES = {
    '01-board.html': { role: 'board' },
    '02-overview.html': { role: 'project', project: 'fred-agent', n: 1 },
    '04-system.html': { role: 'project', project: 'fred-agent', n: 2 },
    '03-principles.html': { role: 'project', project: 'fred-agent', n: 3 },
    '05-njjoe.html': { role: 'project', project: 'njjoe', n: 1 }
  };
  function roleOf(href) {
    var u; try { u = new URL(href, location.href); } catch (e) { return null; }
    if (u.origin !== location.origin) return null;
    var f = u.pathname.split('/').pop(), p = PAGES[f];
    return p && u.pathname.indexOf('/design/2026-09-building/') >= 0 ? { role: p.role, project: p.project, n: p.n, file: f } : null;
  }
  var HERE = roleOf(location.href);
  function read() { try { var r = JSON.parse(sessionStorage.getItem(KEY)); return r && Date.now() - r.t < FRESH && r.c === c ? r : null; } catch (e) { return null; } }
  var lastLink = null, clickT = 0;
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) { lastLink = a; clickT = Date.now(); } }, true);
  window.BDVT = {
    peek: function (role) { var r = read(); return r && r.to && r.to.role === role && HERE && r.to.file === HERE.file ? r : null; },
    link: function () { return Date.now() - clickT < 3000 ? lastLink : null; }
  };
  function kind(from, to) {
    if (!from || !to) return null;
    if (from.role === 'board' && to.role === 'project') return 'in';
    if (from.role === 'project' && to.role === 'board') return 'out';
    if (from.role === 'project' && to.role === 'project' && from.project === to.project && from.file !== to.file) return 'chapter';
    return null;
  }

  /* ---- the pseudo-tree (as transitions.js reads it) ---- */
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

  /* ---- the answers every move is made of ---- */
  function paperSwap(A) {
    kill(A, 'root', ['old', 'new']);
    pa('old', 'root', [{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'cubic-bezier(.4,0,1,1)' });
    pa('new', 'root', [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 70, easing: 'cubic-bezier(0,0,.2,1)' });
  }
  // the page feeds down out of the rule (or a strip's edge), under a clip that holds still
  function printIn(A, y, delay) {
    var H = innerHeight, slot = 'inset(' + f2(y) + 'px 0 0 0)', d = 560;
    kill(A, 'root', ['old', 'new']);
    pa('image-pair', 'root', [{ clipPath: slot }, { clipPath: slot }], { duration: d + delay });
    pa('old', 'root', [{ opacity: 1 }, { opacity: 0 }], { duration: Math.max(140, delay), easing: 'cubic-bezier(.4,0,1,1)' });
    pa('new', 'root', [{ transform: 'translateY(' + f2(-(H - y)) + 'px)' }, { transform: 'none' }], { duration: d, delay: delay, easing: 'cubic-bezier(.33,.1,.22,1)' });
  }
  function printOut(A, y) {
    var H = innerHeight, slot = 'inset(' + f2(y) + 'px 0 0 0)';
    kill(A, 'root', ['old', 'new']);
    pa('image-pair', 'root', [{ clipPath: slot }, { clipPath: slot }], { duration: 640 });
    pa('old', 'root', [{ transform: 'none', zIndex: 1 }, { transform: 'translateY(' + f2(-(H - y)) + 'px)', zIndex: 1 }], { duration: 440, easing: 'cubic-bezier(.55,0,.8,.45)' });
    pa('new', 'root', [{ opacity: 0 }, { opacity: 1 }], { duration: 320, delay: 160, easing: 'cubic-bezier(0,0,.2,1)' });
  }
  // 2-D matrices as transitions.js keeps them; z() folds the group's own origin (its centre) into the matrix
  function mat(s) {
    if (!s || s === 'none') return [1, 0, 0, 1, 0, 0];
    var n = s.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number);
    return s.indexOf('matrix3d') === 0 ? [n[0], n[1], n[4], n[5], n[12], n[13]] : n.slice(0, 6);
  }
  function z(m, w, h) { var ox = w / 2, oy = h / 2; return [m[0], m[1], m[2], m[3], m[4] + ox - m[0] * ox - m[2] * oy, m[5] + oy - m[1] * ox - m[3] * oy]; }
  function mul(A, B) { return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]]; }
  function css(A) { return 'matrix(' + A.map(function (v) { return +v.toFixed(5); }).join(',') + ')'; }
  // a group re-timed on a spring. Where its size changes, the group keeps the new size and is scaled from the old one,
  // never sized, so the compositor runs it (the images stretch to the group; 00-vt.css)
  function carry(A, name, k, cc, delay) {
    var g = ends(A, name);
    if (!g) return null;
    kill(A, name, ['group']);
    var m0 = mul(z(mat(g.t0), g.w0, g.h0), [g.w0 / g.w1, 0, 0, g.h0 / g.h1, 0, 0]), m1 = z(mat(g.t1), g.w1, g.h1);
    var box = { width: g.w1 + 'px', height: g.h1 + 'px', transformOrigin: '0 0' };
    pa('group', name, [Object.assign({ transform: css(m0) }, box), Object.assign({ transform: css(m1) }, box)], { duration: M.springEase.duration(k, cc), delay: delay || 0, easing: M.springEase(k, cc) });
    return g;
  }
  // the camera: the image that holds the slip at rc (scale 1) and the one that holds the sheet at sc, zoom K apart;
  // u runs 0 → 1 going in (1 → 0 coming out); scale is exponential in u, so the push reads at an even speed
  function zoom(A, rc, sc, K, dir) {
    kill(A, 'root', ['old', 'new']);
    var N = 36, D = 780, ez = M.cubic(.6, .03, .22, 1), board = [], page = [];
    for (var i = 0; i <= N; i++) {
      var t = i / N, u = dir > 0 ? ez(t) : 1 - ez(t), s = Math.pow(K, u), cx = rc.x + (sc.x - rc.x) * u, cy = rc.y + (sc.y - rc.y) * u, sp = s / K;
      board.push({ offset: t, transformOrigin: '0 0', transform: 'translate(' + f2(cx - s * rc.x) + 'px,' + f2(cy - s * rc.y) + 'px) scale(' + +s.toFixed(4) + ')', opacity: f2(1 - M.smooth(.45, .85, u)) });
      page.push({ offset: t, transformOrigin: '0 0', transform: 'translate(' + f2(cx - sp * sc.x) + 'px,' + f2(cy - sp * sc.y) + 'px) scale(' + +sp.toFixed(5) + ')', opacity: f2(M.smooth(.08, .42, u)), zIndex: dir > 0 ? 0 : 1 });
    }
    pa(dir > 0 ? 'old' : 'new', 'root', board, { duration: D, easing: 'linear' });
    pa(dir > 0 ? 'new' : 'old', 'root', page, { duration: D, easing: 'linear' });
  }
  var ctr = function (r) { return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; };
  function sheetRect() { var s = document.querySelector('.pj-sheethead'); if (!s) return null; var r = s.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }
  function tabs(A, spring, relay) {
    for (var n = 1; n <= 5; n++) carry(A, 'pj-tab-' + n, spring[0], spring[1], relay * (n - 1));
  }

  var MOVES = {
    a: {
      in: function (A) {
        printIn(A, ruleY(), 260);
        if (!carry(A, 'pj-card', 150, 20)) return;
        kill(A, 'pj-card', ['old', 'new']);
        var P = 'perspective(1900px) ';
        pa('old', 'pj-card', [{ transform: P + 'rotateY(0deg)' }, { transform: P + 'rotateY(90deg)' }], { duration: 250, easing: 'cubic-bezier(.45,0,.75,.45)' });
        pa('new', 'pj-card', [{ transform: P + 'rotateY(-90deg)' }, { transform: P + 'rotateY(0deg)' }], { duration: M.springEase.duration(200, 18), delay: 250, easing: M.springEase(200, 18) });
      },
      out: function (A) { printOut(A, ruleY()); carry(A, 'pj-card', 150, 21, 40); },
      chapter: paperSwap
    },
    b: {
      in: function (A, rec) { var s = sheetRect(); if (!rec.rect || !s) return paperSwap(A); zoom(A, ctr(rec.rect), ctr(s), s.w / rec.rect.w, 1); },
      out: function (A, rec) { var r = window.BD_PAGE && BD_PAGE.rect ? BD_PAGE.rect(rec.from.file) : null; if (!r || !rec.sheet) return paperSwap(A); zoom(A, ctr(r), ctr(rec.sheet), rec.sheet.w / r.w, -1); },
      chapter: paperSwap
    },
    c: {
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
    }
  };
  // A keeps the in-place chapter swap: the router (02-project.js) runs a same-document transition and asks for this
  window.BDVT.printUnder = function (y) { printIn(uaAnims(), y, 90); };

  /* ---- the pen's folder tab round the current tab (transitions.js ink(), one hand, fixed seed) ---- */
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
    var rec = { t: Date.now(), c: c, from: HERE, to: to };
    if (HERE && HERE.role === 'project' && c === 'b') rec.sheet = sheetRect();
    try { if (window.BD_PAGE && BD_PAGE.swap) BD_PAGE.swap(rec, to); } catch (err) { setTimeout(function () { throw err; }); }
    try { sessionStorage.setItem(KEY, JSON.stringify(rec)); } catch (x) { /* storage off */ }
    if (e.viewTransition && (reduced() || !kind(HERE, to))) { e.viewTransition.ready.catch(function () {}); e.viewTransition.skipTransition(); }
  });
  function landed(rec, k) { if (k && window.BD_PAGE && BD_PAGE.landed) try { BD_PAGE.landed(rec, k); } catch (err) { setTimeout(function () { throw err; }); } }
  function reveal(e) {
    ink();
    var vt = e && e.viewTransition, rec = read(), k = rec ? kind(rec.from, HERE) : null;
    try { sessionStorage.removeItem(KEY); } catch (x) { /* storage off */ }
    if (vt) { vt.ready.catch(function () {}); vt.finished.catch(function () {}); }
    if (!vt || !k || reduced()) { if (vt) vt.skipTransition(); landed(rec, k); return; }
    html.setAttribute('data-bdvt', c + '-' + k);
    var done = function () { html.removeAttribute('data-bdvt'); landed(rec, k); };
    vt.finished.then(done, done);
    vt.ready.then(function () {
      try { (MOVES[c][k] || paperSwap)(uaAnims(), rec); } catch (err) { vt.skipTransition(); setTimeout(function () { throw err; }); }
    }, function () { /* skipped */ });
  }
  addEventListener('pagereveal', reveal);
  if (!('onpagereveal' in window)) document.addEventListener('DOMContentLoaded', function () { reveal(null); });
  else if (performance.getEntriesByType('paint').length) reveal(null);
})();
