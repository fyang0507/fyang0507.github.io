/* transitions-book.js — Writing ↔ Reading, loaded `defer blocking="render"` after transitions-tab.js on those two pages only (the
   other pages' transition files stay as small as they were: Building's LCP is sensitive to every byte it must fetch before
   first render). transitions.js hands it the move (window.FYBook). */
/* ---- FYBook: Writing ↔ Reading, the book in your hand and its essay (design/2026-10-essays, candidate B: the cover becomes the plate).
   The obi slips off the book's foot and the cover opens out into the essay's plate (the frame grows from the board to the
   plate's band, the photo inside it staying one photo), then the frame lifts off the essay. The board does not swing open
   (pull.js): the page goes once the book is square to you. Back (and "← all writing", which is Back when you came from the
   shelf) is the same move reversed, onto the book still in your hand, and then the shelf puts the book back. Anywhere
   else Writing ↔ Reading is the paper swap. What keeps it from flashing: the page you arrive at comes up over the one you
   leave, which stays whole under it (no frame is bare paper); the header strip is whole from its first frame; the
   browser's own animations are held at their first frame (transitions.css) until these replace them.
   FYBook: move(from, to, rec) → 'book' | null · swap(rec) adds rec.bk at pageswap and names the book (or the plate's
   copy) · prepare(vt) at pagereveal, before the capture: the essay's intro laid out where React will put it, and the
   cover where the plate shows it · run(V, A, rec) · reset() lets the shelf put the book back · warm(key), opens(key) for
   pull.js. Names go on with classes (.fy-book-*) only for the move they travel in. ---- */
(function () {
  'use strict';
  var M = window.Motion, html = document.documentElement, ESSAY = /Reading\.dc\.html$/.test(location.pathname), EIO = 'cubic-bezier(.4,0,.6,1)';
  var V, AR = {}, X = {}, made = [], mode = null, again = null;   // V: the toolkit · AR: each cover's aspect · X: the essay's intro, laid out · again: the shelf's reset, held back
  var mix = function (a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); };
  var un = function (E, w, h) { return V.css(V.mul(V.tr(-w / 2, -h / 2), V.mul(E, V.tr(w / 2, h / 2)))); };   // a box's matrix for its own origin, its centre
  var rect = function (E, w, h) { return [E[4], E[5], w * Math.hypot(E[0], E[1]), h * Math.hypot(E[2], E[3])]; };
  var has = function (A, part, n) { return !!A['::view-transition-' + part + '(' + n + ')']; };
  // a spring as its own linear() samples, one per 60 Hz frame: at(ms) → progress, first(v) → when it first reaches v
  function spring(k, c) {
    var s = M.springEase(k, c).slice(7, -1).split(',').map(Number), n = s.length - 1;
    return { ease: M.springEase(k, c), dur: n * 1000 / 60,
      at: function (t) { var i = Math.max(0, t * 0.06); if (i >= n) return 1; var j = Math.floor(i); return s[j] + (s[j + 1] - s[j]) * (i - j); },
      first: function (v) { for (var i = 0; i <= n; i++) if (s[i] >= v) return i * 1000 / 60; return n * 1000 / 60; } };
  }
  function frames(dur, fn) { var kf = [], n = Math.max(2, Math.ceil(dur * 0.06)); for (var i = 0; i <= n; i++) { var f = fn(i / n * dur); f.offset = i / n; kf.push(f); } return kf; }
  function fade(a, b, t0, t1, dur, ease) {   // opacity a → b between t0 and t1 ms of a move dur long
    var o0 = M.clamp(t0 / dur, 0, 1), o1 = M.clamp(t1 / dur, o0, 1);
    return [{ opacity: a, offset: 0 }, { opacity: a, offset: o0, easing: ease || 'linear' }, { opacity: b, offset: o1 }, { opacity: b, offset: 1 }];
  }

  /* ---- the header strip rides from one page's place to the other's on the tab moves' spring ---- */
  function header(A) {
    var sp = spring(150, 21), h = V.ends(A, 'site-head'), a0 = h && [h.z0[4] + h.w0, h.z0[5] + h.h0], a1 = h && [h.z1[4] + h.w1, h.z1[5] + h.h1], d = h ? [a1[0] - a0[0], a1[1] - a0[1]] : [0, 0];
    ['site-head', 'identity', 'site-rule', 'tabmark', 'obj-book', 'obj-laptop', 'obj-camera', 'obj-frame'].forEach(function (n) {
      var g = V.ends(A, n), b;
      if (g && n === 'site-head') {   // keeps its bottom-right corner; the new strip is whole from the first frame, the old one fades off it
        V.kill(A, n, ['group', 'old', 'new']);
        var own = un(V.mul(V.tr(g.w1 - g.w0, g.h1 - g.h0), V.sc(g.w0 / g.w1)), g.w1, g.w1 * g.h0 / g.w0);
        V.pa('group', n, [{ transform: un(V.tr(a0[0] - g.w1, a0[1] - g.h1), g.w1, g.h1) }, { transform: un(V.tr(a1[0] - g.w1, a1[1] - g.h1), g.w1, g.h1) }], { duration: sp.dur, easing: sp.ease });
        V.pa('old', n, fade(1, 0, 0, 120, 120, EIO).map(function (f) { f.transform = own; return f; }), { duration: 120 });
      } else if (g) {
        V.kill(A, n, ['group']);
        V.pa('group', n, [{ transform: un(V.mul(g.z0, V.sc(g.w0 / g.w1, g.h0 / g.h1)), g.w1, g.h1) }, { transform: un(g.z1, g.w1, g.h1) }], { duration: sp.dur, easing: sp.ease });
      } else if ((b = V.box(n))) {   // one side only (the identity): it rides with the strip and goes with its page
        var out = has(A, 'old', n);
        V.kill(A, n, ['group', 'old', 'new']);
        V.pa('group', n, [{ transform: un(out ? b.m : V.mul(V.tr(-d[0], -d[1]), b.m), b.w, b.h) }, { transform: un(out ? V.mul(V.tr(d[0], d[1]), b.m) : b.m, b.w, b.h) }], { duration: sp.dur, easing: sp.ease });
        V.pa(out ? 'old' : 'new', n, out ? fade(1, 0, 0, 140, 140) : fade(0, 1, 120, 320, 320), { duration: out ? 140 : 320 });
      }
    });
  }
  // nothing travels: the page you arrive at comes up over the one you leave, which stays whole under it
  function paper(A) {
    V.kill(A, 'root', ['old', 'new']);
    V.pa('new', 'root', [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: EIO });
    ['book-cover', 'book-obi'].forEach(function (n) {
      if (!has(A, 'group', n) && !V.box(n)) return;
      V.kill(A, n, ['group', 'old', 'new']);
      V.pa('group', n, [{ opacity: has(A, 'old', n) ? 1 : 0 }, { opacity: 0 }], { duration: 120 });
    });
    header(A);
  }

  /* ---- the photo: the plate's object-fit and the board's crop, as maps from the cover (x, y in 0..1) to the screen ---- */
  function plateMap(W, B, a) {   // cover, 50% 42%, then scale(1.14) about its centre (reading.css .plate-img) → [ox, oy, Sx, Sy]
    var c = Math.max(W / a, B), l = (W - a * c) * 0.5, t = (B - c) * 0.42;
    return [W / 2 + (l - W / 2) * 1.14, B / 2 + (t - B / 2) * 1.14, 1.14 * a * c, 1.14 * c];
  }
  function boardCrop(a) {   // a 16:25 centre crop of the cover (generate-derivatives.py), shown zoomed 1.12 (writing.css .cv-img)
    var cw = a >= 0.64 ? 0.64 / a : 1, ch = a >= 0.64 ? 1 : a / 0.64, z = 2.24;
    return [0.5 - cw / z, 0.5 - ch / z, 0.5 + cw / z, 0.5 + ch / z];
  }
  function cropMap(R, k) { var Sx = R[2] / (k[2] - k[0]), Sy = R[3] / (k[3] - k[1]); return [R[0] - k[0] * Sx, R[1] - k[1] * Sy, Sx, Sy]; }
  function onto(G, r, w, h) { return V.mul(V.inv(G), V.mul(V.tr(r[0], r[1]), V.sc(r[2] / w, r[3] / h))); }   // a w × h box onto rect r, inside group G
  function cover(R, a) { var w = Math.max(R[2], R[3] * a), h = w / a; return [R[0] + (R[2] - w) / 2, R[1] + (R[3] - h) / 2, w, h]; }   // a box of aspect a covering R
  // where the plate's paper begins at the top of the essay (hero.js: B0 − pad, its hand-cut edge up to J above that)
  function cut(b0) { var v = function (n) { return parseFloat(getComputedStyle(html).getPropertyValue(n)) || 0; }; return b0 - v('--pad') - scrollY - Math.round(v('--cell') * 1.6) / 2; }

  /* ---- the essay's intro, laid out unseen where React will put it (where the plate ends), and the whole cover where the plate shows it ---- */
  function entry() { var I = window.FY_POST_INDEX || [], id = new URLSearchParams(location.search).get('post'); return I.find(function (p) { return p.id === id; }) || I[0] || null; }
  function both(en, zh) { var e = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }; return '<span class="en">' + e(en) + '</span><span class="zh">' + e(zh) + '</span>'; }
  function intro(p) {
    var top = document.querySelector('.rd-top'), d = new Date(p.date + 'T00:00:00'), b = window.FY_BODY && FY_BODY.id === p.id ? FY_BODY : {}, min = p.readingMin || 1, el = document.createElement('main');
    el.className = 'wrap rd-main fy-book-intro'; el.setAttribute('data-ready', ''); el.setAttribute('aria-hidden', 'true');
    el.style.top = (top ? top.getBoundingClientRect().bottom + scrollY : 0) + 'px';
    el.innerHTML = '<article><header class="article-intro"><div class="kick-row"><span class="kicker">' + both((p.tags || []).join(' · ') || 'essay', (p.tagsZh || []).join(' · ') || '文章') + '</span>' +
      '<span class="meta"><time>' + both(d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })) + '</time><span class="dot">·</span><span>' + both(min + ' min read', '约 ' + min + ' 分钟') + '</span><span class="dot">·</span><span>中 / EN</span></span></div>' +
      '<h1 class="title">' + both(p.title || p.titleZh || '', p.titleZh || p.title || '') + '</h1>' +
      (b.subtitle || b.subtitleZh ? '<div class="eyebrow">' + both(b.subtitle || b.subtitleZh, b.subtitleZh || b.subtitle) + '</div>' : '') + '</header><div class="body-col"></div></article>';
    document.body.appendChild(el);
    return { el: el, b0: Math.round(el.querySelector('.body-col').getBoundingClientRect().top + scrollY) };
  }
  function at(el, P) { el.style.cssText = 'left:' + P[0].toFixed(1) + 'px;top:' + P[1].toFixed(1) + 'px;width:' + P[2].toFixed(1) + 'px;height:' + P[3].toFixed(1) + 'px'; }
  function photo(p, P) {   // the cover, looking as the plate does (opaque: paper under 50%), as the new side of the frame
    var el = document.createElement('div'), img = new Image();
    el.className = 'fy-book-photo fy-book-cover'; el.setAttribute('aria-hidden', 'true'); at(el, P);
    img.alt = ''; img.decoding = 'sync'; img.sizes = '100vw'; img.srcset = p.coverSrcset || ''; img.src = p.cover;
    el.appendChild(img); document.body.appendChild(el);
    return el;
  }
  // the same, drawn now from the plate's own image (a canvas paints at once, a new img might not before the snapshot that
  // follows pageswap), as the old side of the frame on the way back: the plate itself is half transparent
  function shot(img, P) {
    var c = document.createElement('canvas'), k = Math.min(2, devicePixelRatio || 1), g = c.getContext('2d');
    c.className = 'fy-book-shot fy-book-cover'; c.setAttribute('aria-hidden', 'true'); c.width = Math.round(P[2] * k); c.height = Math.round(P[3] * k); at(c, P);
    var cs = getComputedStyle(html), dark = html.classList.contains('dark');   // dark: the plate's own dimming and its ceiling (reading.css)
    g.fillStyle = cs.getPropertyValue('--paper').trim() || '#FBF6EC'; g.fillRect(0, 0, c.width, c.height);
    g.globalAlpha = dark ? 0.45 : 0.5; if (dark) g.filter = 'saturate(.6) brightness(.92)'; g.drawImage(img, 0, 0, c.width, c.height);
    if (dark) { g.filter = 'none'; g.globalAlpha = parseFloat(cs.getPropertyValue('--cap-a')) || 0; g.globalCompositeOperation = 'darken'; g.fillStyle = cs.getPropertyValue('--cap').trim(); g.fillRect(0, 0, c.width, c.height); }
    document.body.appendChild(c);
  }

  /* ---- the move: the frame (the front board) grows from the board to the plate's band while the photo inside stays one photo ---- */
  function frame(A, g, Rb, Pb, Pp, y, back, D, lift, hold) {
    var W = innerWidth, sp = spring(130, 20), gw = g.w1, gh = g.h1, hOld = gw * g.h0 / g.w0, R1 = [0, 0, W, y], h = hold || 0, T = h + sp.dur;
    var R0 = back ? R1 : Rb, R2 = back ? Rb : R1, F0 = back ? Pp : Pb, F1 = back ? Pb : Pp;
    var pose = function (t) { var p = sp.at(Math.max(0, t - h)), R = mix(R0, R2, p), F = mix(F0, F1, p); return { G: [R[2] / gw, 0, 0, R[3] / gh, R[0], R[1]], F: F, R: R }; };
    // the whole cover (the replica: in, the new side; back, the old) is held to one scale and place, so it always fills the frame
    var Gk = frames(T, function (t) { return { transform: un(pose(t).G, gw, gh) }; });
    var Ok = frames(T, function (t) { var s = pose(t); return { transform: un(onto(s.G, back ? s.F : cover(s.R, g.w0 / g.h0), gw, hOld), gw, hOld) }; });
    var Nk = frames(T, function (t) { var s = pose(t); return { transform: un(onto(s.G, back ? cover(s.R, g.w1 / g.h1) : s.F, gw, gh), gw, gh) }; });
    var x0 = h + sp.dur * (back ? 0.16 : 0.03), x1 = h + sp.dur * (back ? 0.42 : 0.22);
    V.kill(A, 'book-cover', ['group', 'old', 'new']);
    V.pa('group', 'book-cover', Gk, { duration: T, easing: 'linear' });
    V.pa('old', 'book-cover', Ok, { duration: T, easing: 'linear' });
    V.pa('new', 'book-cover', Nk, { duration: T, easing: 'linear' });
    V.pa('new', 'book-cover', fade(0, 1, x0, x1, T), { duration: T });   // the photo you arrive at fades in over the one you leave: never see-through
    // in, the frame has become the plate and lifts off the essay; back, it comes on over the plate first, so the essay's intro and nav go under the photo
    if (!back) V.pa('group', 'book-cover', fade(1, 0, lift, D, D, EIO), { duration: D }); else V.pa('group', 'book-cover', fade(0, 1, 0, h, T, EIO), { duration: T });
    return T;
  }
  function obi(A, back, wait) {   // the obi slips off the foot of the board (in), or slides back up onto it (back)
    var b = V.box('book-obi'), dur = 300, g = 2600;
    if (!b) return;
    V.kill(A, 'book-obi', ['group', 'old', 'new']);
    V.pa('group', 'book-obi', frames(dur, function (t) {
      var s = (back ? dur - t : t) / 1000, y = 0.5 * g * s * s, r = 5 * M.smooth(0, 0.25, s);
      return { transform: un(V.mul(b.m, V.mul(V.tr(0, y), V.mul(V.tr(b.w / 2, b.h / 2), V.mul(V.rot(r), V.tr(-b.w / 2, -b.h / 2))))), b.w, b.h) };
    }), { duration: dur, delay: wait || 0, easing: 'linear' });
    V.pa(back ? 'new' : 'old', 'book-obi', back ? fade(0, 1, 0, 120, dur) : fade(1, 0, 110, 260, dur), { duration: dur, delay: wait || 0 });
  }
  function run(v, A, rec) {
    var g, bk = rec.bk, sp = spring(130, 20), D = sp.dur + 220, Rb, d;
    V = v; g = V.ends(A, 'book-cover');
    if (mode === 'in' && g && X.P) {   // the shelf stays while the cover grows; once it has taken most of the band it dissolves off the essay, and then the frame lifts off
      var cv = sp.first(0.85);
      Rb = rect(g.z0, g.w0, g.h0);
      frame(A, g, Rb, cropMap(Rb, boardCrop(X.ar)), X.P, X.cut, false, D, Math.max(sp.first(0.97), cv + 200));
      obi(A, false); V.kill(A, 'root', ['old', 'new']); V.pa('new', 'root', fade(0, 1, cv, cv + 200, D, EIO), { duration: D }); header(A);
    } else if (mode === 'back' && g && bk.ar && bk.b0) {   // the frame comes on over the plate while the shelf fades in over the essay, then shrinks into the cover
      Rb = rect(g.z1, g.w1, g.h1);
      d = frame(A, g, Rb, cropMap(Rb, boardCrop(bk.ar)), plateMap(innerWidth, bk.b0, bk.ar), bk.cut, true, 0, 0, 150);
      obi(A, true, d - 300); V.kill(A, 'root', ['old', 'new']); V.pa('new', 'root', fade(0, 1, 20, 190, d, EIO), { duration: d }); header(A);
    } else paper(A);
    html.setAttribute('data-vt-go', '');   // the rest is the browser's own (transitions.css held it at its first frame)
  }

  /* ---- names, and the events ---- */
  function name(el, n) { if (el) el.classList.add('fy-book-' + n); }
  function unname() { [].forEach.call(document.querySelectorAll('.fy-book-cover, .fy-book-obi, .fy-book-lifted'), function (n) { n.classList.remove('fy-book-cover', 'fy-book-obi', 'fy-book-lifted'); }); }
  function opening() {
    var h = document.querySelector('.wr[data-mount=writing]'), key = h && h.getAttribute('data-opening'), hit = key && document.querySelector('.bk-hit[data-post="' + key + '"]');
    return hit ? { key: key, box: document.querySelectorAll('.sh-world > .book')[+hit.dataset.i] } : null;
  }
  function nameBook(o) { name(o.box.querySelector('.leaf-front'), 'cover'); name(o.box.querySelector('.obi'), 'obi'); o.box.classList.add('fy-book-lifted'); }   // the pages behind the board are hidden while it travels
  function opens(key) {
    var p = (window.FY_POST_INDEX || []).find(function (x) { return x.id === key; });
    return !!(p && p.cover && 'onpagereveal' in window && !M.reduced());
  }
  // the cover Reading will show, fetched as the book opens (the plate's own srcset and sizes, so the same file): it is in the cache when the essay arrives, and its aspect is known
  function warm(key) {
    var p = (window.FY_POST_INDEX || []).find(function (x) { return x.id === key; }), img;
    if (!p || !p.cover || AR[key]) return;
    img = new Image(); img.onload = function () { AR[key] = img.naturalWidth / img.naturalHeight; };
    img.sizes = '100vw'; img.srcset = p.coverSrcset || ''; img.src = p.cover;
  }
  function move(from, to, rec) { return rec && rec.bk && (from === 'writing' || from === 'reading') && (to === 'writing' || to === 'reading') && from !== to ? 'book' : null; }
  function swap(rec) {
    var bk = { top: scrollY < 40 }, o, pl, img;
    if (rec.from === 'writing' && rec.to === 'reading') { o = opening(); if (!o) return; nameBook(o); bk.post = o.key; bk.ar = AR[o.key]; }
    else if (rec.from === 'reading' && rec.to === 'writing') {
      pl = document.querySelector('.plate'); img = pl && pl.querySelector('img');
      if (bk.top && img && img.naturalWidth) { bk.ar = img.naturalWidth / img.naturalHeight; bk.b0 = pl.offsetHeight; bk.cut = cut(bk.b0); shot(img, plateMap(html.clientWidth, bk.b0, bk.ar)); }
    } else return;
    rec.bk = bk;
  }
  function end() {
    html.removeAttribute('data-vt-go'); unname();
    var I = made.filter(function (n) { return n.classList.contains('fy-book-intro'); })[0], real = function () { return document.querySelector('.rd-main[data-ready]:not(.fy-book-intro)'); };
    made.forEach(function (n) { if (n !== I) n.remove(); });
    made = [];
    // the replica stays until React has printed the real intro (usually long before)
    if (!I || real()) { if (I) I.remove(); } else new MutationObserver(function (l, ob) { if (real()) { ob.disconnect(); I.remove(); } }).observe(document.body, { subtree: true, attributes: true, childList: true });
    reset();
  }
  function reset() { var f = again; again = null; if (f) f(); }
  function prepare(vt, rec) {
    var bk = rec.bk, o, p, I;
    mode = 'paper'; X = {};
    if (!ESSAY) { o = again && bk.top && opening(); if (o) { nameBook(o); mode = 'back'; } }
    else if ((p = entry()) && p.cover) {
      I = intro(p); made.push(I.el);
      X.ar = bk.ar || 1.5; X.P = plateMap(html.clientWidth, I.b0, X.ar); X.cut = cut(I.b0); made.push(photo(p, X.P)); mode = 'in';
    }
    vt.finished.then(end, end);
  }
  // pagereveal, first: a page back from the back/forward cache has its stale names and replicas taken off
  addEventListener('pagereveal', function () { unname(); [].forEach.call(document.querySelectorAll('.fy-book-intro, .fy-book-photo, .fy-book-shot'), function (n) { n.remove(); }); });
  // Back to the shelf through the back/forward cache: the book is still open in your hand, and the shelf's own reset (app.js, on
  // pageshow) asks first: it is held back, returning true, until the move has landed the essay in the book. Nothing else on
  // pageshow is held (the language chosen on Reading is resolved by lang.js, so the move's last frame already reads it).
  function hold(f) {
    var r = null;
    if (ESSAY || M.reduced() || !('onpagereveal' in window)) return false;
    try { r = JSON.parse(sessionStorage.getItem('fy-vt')); } catch (x) { r = null; }
    if (!r || !r.bk || r.from !== 'reading' || Date.now() - r.t > 10000 || !opening()) return false;
    again = f; return true;
  }
  // "← all writing", on the top bar and on the tag hanging from the end-of-essay shelf, is Back when you came from the shelf (the
  // shelf as you left it, the move played back); from anywhere else it stays a plain link
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.back, a.pn-tag'), n = window.navigation, prev = n && n.entries()[n.currentEntry.index - 1];
    if (!ESSAY || !a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !prev || !/Writing\.dc\.html$/.test(new URL(prev.url).pathname)) return;
    e.preventDefault(); history.back();
  });

  window.FYBook = { move: move, swap: swap, prepare: prepare, run: run, reset: reset, hold: hold, warm: warm, opens: opens };
})();
