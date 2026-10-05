/* design/2026-10-essays · book-vt.js — the book in your hand → its essay, as a cross-document View Transition between the
   board's copies of Writing and Reading (book-writing.dc.html → book-reading.dc.html), and the way back. What a
   production FYBook in lib/shared/transitions-tab.js would add (book-index.html, the port). Loaded `defer
   blocking="render"` after motion.js, in place of transitions-tab.js and transitions.js, so pagereveal is heard.
   The candidate is sessionStorage book-c (book-board.js):
     a  扉页铺开 the title page opens out: its paper grows from the book to the window on a spring, the print on it goes,
        the title flies to where the essay prints it; once the sheet fills the window the essay prints through it
     b  封面成题图 the cover becomes the plate: the obi slips off, and the cover opens out into the plate at the top of
        the essay, its frame growing from the board to the plate's band while the photo inside stays the same photo
     c  翻过扉页 turn the title page: it turns over on the spine, and its other side, the essay, comes round to fill the window
     now  the hard cut the site has today
   Way back (Back, through the back/forward cache, with the book still in your hand): each move in reverse, onto the
   book; then the book is put back (book-board.js). By the "all writing" link (a fresh shelf, not drawn yet): the paper
   swap the tab moves use. The header strip rides from one page's place to the other's on the tab moves' spring.
   Everything that moves is transform or opacity on the pseudo-elements; a clip is set but holds still. Names go on with
   classes (.fy-book-*, book-vt.css) only for the move they travel in. Reduced motion: no transition (the inline opt-in). */
(function () {
  'use strict';
  var M = window.Motion, html = document.documentElement;
  if (!M) return;
  var KEY = 'fy-book-vt', FRESH = 10000, FPS = 60, lerp = M.lerp;
  var HERE = /book-writing\.dc\.html$/.test(location.pathname) ? 'shelf' : /book-reading\.dc\.html$/.test(location.pathname) ? 'essay' : null;
  var get = function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  var set = function (k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* storage off */ } };
  var cand = function () { return get('book-c') || 'a'; };

  /* ---- 2-D affine [a, b, c, d, e, f]; a book face is screen-parallel, so its matrix3d divides out by w ---- */
  function mat(s) {
    if (!s || s === 'none') return [1, 0, 0, 1, 0, 0];
    var n = s.slice(s.indexOf('(') + 1, s.lastIndexOf(')')).split(',').map(parseFloat);
    if (s.indexOf('matrix3d') !== 0) return n.slice(0, 6);
    var w = n[15] || 1;
    return [n[0] / w, n[1] / w, n[4] / w, n[5] / w, n[12] / w, n[13] / w];
  }
  function mul(A, B) { return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]]; }
  function inv(A) { var d = A[0] * A[3] - A[1] * A[2]; return [A[3] / d, -A[1] / d, -A[2] / d, A[0] / d, (A[2] * A[5] - A[3] * A[4]) / d, (A[1] * A[4] - A[0] * A[5]) / d]; }
  function tr(x, y) { return [1, 0, 0, 1, x, y]; }
  function sc(x, y) { return [x, 0, 0, y == null ? x : y, 0, 0]; }
  function mix(A, B, t) { return A.map(function (v, i) { return v + (B[i] - v) * t; }); }
  function css(A) { return 'matrix(' + A.map(function (v) { return +v.toFixed(5); }).join(',') + ')'; }
  // The browser writes a pseudo-element's matrix for its own transform-origin, its centre. fold() turns that into the
  // map from the box's (0, 0)-based coordinates to the viewport; unfold() is the way back, for keyframes.
  function fold(m, w, h) { var ox = w / 2, oy = h / 2; return [m[0], m[1], m[2], m[3], m[4] + ox - m[0] * ox - m[2] * oy, m[5] + oy - m[1] * ox - m[3] * oy]; }
  function unfold(E, w, h) { return css(mul(tr(-w / 2, -h / 2), mul(E, tr(w / 2, h / 2)))); }
  function rect(E, w, h) { return [E[4], E[5], w * Math.hypot(E[0], E[1]), h * Math.hypot(E[2], E[3])]; }

  /* ---- the pseudo-tree ---- */
  function uaAnims() {
    var A = {};
    document.getAnimations().forEach(function (a) { var ef = a.effect, pe = ef && ef.target === html && ef.pseudoElement; if (pe) (A[pe] = A[pe] || []).push(a); });
    return A;
  }
  function has(A, part, name) { return !!A['::view-transition-' + part + '(' + name + ')']; }
  function kill(A, name, parts) { parts.forEach(function (p) { (A['::view-transition-' + p + '(' + name + ')'] || []).forEach(function (a) { a.cancel(); }); }); }
  function pa(part, name, kf, o) {
    o.fill = 'both'; o.pseudoElement = '::view-transition-' + part + '(' + name + ')';
    if (window.BOOK_DEBUG) kf.forEach(function (f, i) { if (/NaN/.test(JSON.stringify(f))) console.warn('NaN', o.pseudoElement, i, JSON.stringify(f)); });
    return html.animate(kf, o);
  }
  // a shared part's old and new box, from the browser's own group keyframes (both sides), folded
  function ends(A, name) {
    var g = (A['::view-transition-group(' + name + ')'] || [])[0];
    if (!g) return null;
    var k = g.effect.getKeyframes(), a = k[0], b = k[k.length - 1], w0 = parseFloat(a.width), h0 = parseFloat(a.height), w1 = parseFloat(b.width), h1 = parseFloat(b.height);
    return { m0: fold(mat(a.transform), w0, h0), w0: w0, h0: h0, m1: fold(mat(b.transform), w1, h1), w1: w1, h1: h1 };
  }
  // a one-sided part's box, from its group's style
  function box(name) {
    var cs = getComputedStyle(html, '::view-transition-group(' + name + ')'), w = parseFloat(cs.width), h = parseFloat(cs.height);
    return w > 0 ? { m: fold(mat(cs.transform), w, h), w: w, h: h } : null;
  }
  // a spring (k, c) as its own linear() samples, one per 60 Hz frame: at(ms) → progress; first(v) → when it first reaches
  // v. With lead (ms) it chases a target that eases from 0 to 1 over lead (a hand's pick-up, then the spring's landing)
  function spring(k, c, lead) {
    var s;
    if (!lead) s = M.springEase(k, c).slice(7, -1).split(',').map(Number);
    else {
      var E = M.cubic(0.45, 0, 0.55, 1), x = 0, v = 0, t = 0, dt = 1 / 1000, next = 1 / FPS;
      s = [0];
      for (var i = 0; i < 6000; i++) {
        v += (k * (E(Math.min(1, t * 1000 / lead)) - x) - c * v) * dt; x += v * dt; t += dt;
        if (t >= next - 1e-9) { s.push(+x.toFixed(4)); next += 1 / FPS; if (t * 1000 > lead && Math.abs(1 - x) < 0.003 && Math.abs(v) < 0.05) break; }
      }
      s[s.length - 1] = 1;
    }
    var ease = 'linear(' + s.join(', ') + ')', n = s.length - 1;
    return { ease: ease, dur: n * 1000 / FPS,
      at: function (t) { var i = Math.max(0, t / 1000 * FPS); if (i >= n) return 1; var j = Math.floor(i); return s[j] + (s[j + 1] - s[j]) * (i - j); },
      first: function (v) { for (var i = 0; i <= n; i++) if (s[i] >= v) return i * 1000 / FPS; return n * 1000 / FPS; } };
  }
  function frames(dur, fn) { var kf = [], n = Math.max(2, Math.ceil(dur / 1000 * FPS)); for (var i = 0; i <= n; i++) { var f = fn(i / n * dur); f.offset = i / n; kf.push(f); } return kf; }
  // opacity a → b between t0 and t1 (ms) of a move dur long; step: a until t, then b
  function fade(a, b, t0, t1, dur, ease) {
    var o0 = M.clamp(t0 / dur, 0, 1), o1 = M.clamp(t1 / dur, o0, 1);
    return [{ opacity: a, offset: 0 }, { opacity: a, offset: o0, easing: ease || 'linear' }, { opacity: b, offset: o1 }, { opacity: b, offset: 1 }];
  }
  var EIO = 'cubic-bezier(.4,0,.6,1)';
  function step(a, b, t, dur) { return M.held([{ opacity: a }, { opacity: b, offset: M.clamp(t / dur, 0, 1) }, { opacity: b }]); }

  /* ---- the header strip: from one page's place to the other's, every part on the tab moves' spring ---- */
  var HEAD = ['site-head', 'identity', 'site-rule', 'tabmark', 'obj-book', 'obj-laptop', 'obj-camera', 'obj-frame'];
  function header(A) {
    var sp = spring(150, 21), h = ends(A, 'site-head');
    // the strip keeps its bottom-right corner (the rule and the four tabs, which sit the same way from that end)
    var a0 = h && [h.m0[4] + h.w0, h.m0[5] + h.h0], a1 = h && [h.m1[4] + h.w1, h.m1[5] + h.h1], d = h ? [a1[0] - a0[0], a1[1] - a0[1]] : [0, 0];
    HEAD.forEach(function (n) {
      var g = ends(A, n);
      if (g && n === 'site-head') {
        kill(A, n, ['group', 'old', 'new']);
        var hOld = g.w1 * g.h0 / g.w0;   // the browser draws the old strip as wide as the new one
        pa('group', n, [{ transform: unfold(tr(a0[0] - g.w1, a0[1] - g.h1), g.w1, g.h1) }, { transform: unfold(tr(a1[0] - g.w1, a1[1] - g.h1), g.w1, g.h1) }], { duration: sp.dur, easing: sp.ease });
        var own = unfold(mul(tr(g.w1 - g.w0, g.h1 - g.h0), sc(g.w0 / g.w1)), g.w1, hOld);
        // the new strip is whole from the first frame and the old one fades off it (book-vt.css lays it on top): the
        // labels both strips share never dim, and no frame shows neither
        pa('old', n, fade(1, 0, 0, 120, 120, EIO).map(function (f) { f.transform = own; return f; }), { duration: 120 });
      } else if (g) {
        kill(A, n, ['group']);
        pa('group', n, [{ transform: unfold(mul(g.m0, sc(g.w0 / g.w1, g.h0 / g.h1)), g.w1, g.h1) }, { transform: unfold(g.m1, g.w1, g.h1) }], { duration: sp.dur, easing: sp.ease });
      } else {
        var b = box(n), out = has(A, 'old', n);
        if (!b) return;                                // one side only (the identity): it rides with the strip and goes with its page
        kill(A, n, ['group', 'old', 'new']);
        var from = out ? b.m : mul(tr(-d[0], -d[1]), b.m), to = out ? mul(tr(d[0], d[1]), b.m) : b.m;
        pa('group', n, [{ transform: unfold(from, b.w, b.h) }, { transform: unfold(to, b.w, b.h) }], { duration: sp.dur, easing: sp.ease });
        pa(out ? 'old' : 'new', n, out ? fade(1, 0, 0, 140, 140) : fade(0, 1, 120, 320, 320), { duration: out ? 140 : 320 });
      }
    });
  }
  // the root, where nothing travels: the page you arrive at comes up over the one you leave, which stays whole under it.
  // (The tab moves' paper swap, the old nearly gone before the new comes up, bottoms out at bare paper, and that read as the
  // page reloading: in WebKit's Back, which has no back/forward cache here, one frame in four was blank.)
  function paper(A) {
    kill(A, 'root', ['old', 'new']);
    pa('new', 'root', [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: EIO });
    ['book-page', 'book-title', 'book-cover', 'book-obi'].forEach(function (n) {
      if (!has(A, 'group', n) && !box(n)) return;
      kill(A, n, ['group', 'old', 'new']);
      pa('group', n, [{ opacity: has(A, 'old', n) ? 1 : 0 }, { opacity: 0 }], { duration: 120 });
    });
    header(A);
  }

  /* ---- the photo: the plate's object-fit and the board's crop, as maps from the cover (x, y in 0..1) to the screen ---- */
  // the plate: cover, 50% 42%, then scale(1.14) about its centre (reading.css .plate-img) → [ox, oy, Sx, Sy]
  function plateMap(W, B, a) {
    var c = Math.max(W / a, B), l = (W - a * c) * 0.5, t = (B - c) * 0.42;
    return [W / 2 + (l - W / 2) * 1.14, B / 2 + (t - B / 2) * 1.14, 1.14 * a * c, 1.14 * c];
  }
  // the board: a 16:25 centre crop of the cover (generate-derivatives.py), shown zoomed 1.12 (writing.css .cv-img)
  function boardCrop(a) {
    var cw = a >= 0.64 ? 0.64 / a : 1, ch = a >= 0.64 ? 1 : a / 0.64, z = 2.24;
    return [0.5 - cw / z, 0.5 - ch / z, 0.5 + cw / z, 0.5 + ch / z];
  }
  function cropMap(R, k) { var Sx = R[2] / (k[2] - k[0]), Sy = R[3] / (k[3] - k[1]); return [R[0] - k[0] * Sx, R[1] - k[1] * Sy, Sx, Sy]; }
  function onto(G, r, w, h) { return mul(inv(G), mul(tr(r[0], r[1]), sc(r[2] / w, r[3] / h))); }   // a w × h box onto rect r, inside group G
  function cover(R, a) { var w = Math.max(R[2], R[3] * a), h = w / a; return [R[0] + (R[2] - w) / 2, R[1] + (R[3] - h) / 2, w, h]; }   // a box of aspect a covering R

  /* ---- the essay's intro, laid out unseen where React will put it: where its title sits and where the plate ends ---- */
  var X = {};
  function entry() { var I = window.FY_POST_INDEX || [], id = new URLSearchParams(location.search).get('post'); return I.find(function (p) { return p.id === id; }) || I[0] || null; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function both(en, zh) { return '<span class="en">' + esc(en) + '</span><span class="zh">' + esc(zh) + '</span>'; }
  function intro(p) {
    var top = document.querySelector('.rd-top'), d = new Date(p.date + 'T00:00:00'), b = window.FY_BODY && FY_BODY.id === p.id ? FY_BODY : {}, min = p.readingMin || 1;
    var el = document.createElement('main');
    el.className = 'wrap rd-main fy-book-intro'; el.setAttribute('data-ready', ''); el.setAttribute('aria-hidden', 'true');
    el.style.top = (top ? top.getBoundingClientRect().bottom + scrollY : 0) + 'px';
    el.innerHTML = '<article><header class="article-intro"><div class="kick-row"><span class="kicker">' + both((p.tags || []).join(' · ') || 'essay', (p.tagsZh || []).join(' · ') || '文章') + '</span>' +
      '<span class="meta"><time>' + both(d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })) + '</time><span class="dot">·</span><span>' + both(min + ' min read', '约 ' + min + ' 分钟') + '</span><span class="dot">·</span><span>中 / EN</span></span></div>' +
      '<h1 class="title">' + both(p.title || p.titleZh || '', p.titleZh || p.title || '') + '</h1>' +
      (b.subtitle || b.subtitleZh ? '<div class="eyebrow">' + both(b.subtitle || b.subtitleZh, b.subtitleZh || b.subtitle) + '</div>' : '') +
      '</header><div class="body-col"></div></article>';
    document.body.appendChild(el);
    return { el: el, h1: el.querySelector('.title'), b0: Math.round(el.querySelector('.body-col').getBoundingClientRect().top + scrollY) };
  }
  function photo(p, P) {   // the whole cover, where the plate shows it, looking as the plate does (opaque: paper under 50%)
    var el = document.createElement('div'), img = new Image();
    el.className = 'fy-book-photo fy-book-cover'; el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'left:' + P[0].toFixed(1) + 'px;top:' + P[1].toFixed(1) + 'px;width:' + P[2].toFixed(1) + 'px;height:' + P[3].toFixed(1) + 'px';
    img.alt = ''; img.decoding = 'sync'; img.sizes = '100vw'; img.srcset = p.coverSrcset || ''; img.src = p.cover;
    el.appendChild(img); document.body.appendChild(el);
    return el;
  }

  // the same, drawn now from the plate's own image (a canvas paints at once; a new img might not, before the snapshot that
  // follows pageswap), for the way back: the plate itself is half transparent, and the essay would show through it
  function shot(img, P) {
    var c = document.createElement('canvas'), k = Math.min(2, devicePixelRatio || 1), g;
    c.className = 'fy-book-shot fy-book-cover'; c.setAttribute('aria-hidden', 'true');
    c.width = Math.round(P[2] * k); c.height = Math.round(P[3] * k);
    c.style.cssText = 'left:' + P[0].toFixed(1) + 'px;top:' + P[1].toFixed(1) + 'px;width:' + P[2].toFixed(1) + 'px;height:' + P[3].toFixed(1) + 'px';
    g = c.getContext('2d');
    g.fillStyle = getComputedStyle(html).getPropertyValue('--paper').trim() || '#FBF6EC'; g.fillRect(0, 0, c.width, c.height);
    g.globalAlpha = 0.5; g.drawImage(img, 0, 0, c.width, c.height);
    document.body.appendChild(c);
    return c;
  }
  // where the plate's paper begins at the top of the essay (hero.js: B0 − pad, its hand-cut edge up to J above that)
  function cut(b0) { var v = function (n) { return parseFloat(getComputedStyle(html).getPropertyValue(n)) || 0; }; return b0 - v('--pad') - scrollY - Math.round(v('--cell') * 1.6) / 2; }

  /* ---- the moves in ---- */
  // A · the title page opens out into the page
  function sheet(A, pg, back) {
    var W = innerWidth, H = innerHeight, sp = spring(170, 22), E0 = pg.m, E1 = sc(W / pg.w, H / pg.h), part = back ? 'new' : 'old';
    var g0 = back ? E1 : E0, g1 = back ? E0 : E1, t0 = back ? 0 : sp.first(0.7), tr0 = sp.first(0.35), D = Math.max(sp.dur, t0 + 260);
    kill(A, 'book-page', ['group', 'old', 'new']);
    pa('group', 'book-page', [{ transform: unfold(g0, pg.w, pg.h) }, { transform: unfold(g1, pg.w, pg.h) }], { duration: sp.dur, easing: sp.ease });
    // in: paper until the sheet has covered most of the window, then the essay prints through it while it lands; back:
    // the essay goes to paper while the sheet folds back toward the book. The window is never one blank sheet
    pa('group', 'book-page', back ? fade(0, 1, 0, 140, D, EIO) : fade(1, 0, t0, t0 + 260, D, EIO), { duration: D });
    // the print on the page (head, subtitle, foot) keeps its proportions while the paper stretches, and goes (or comes)
    var p0 = sp.dur - 140;
    pa(part, 'book-page', frames(D, function (t) {
      var p = sp.at(t), m = mix(g0, g1, p), u = Math.min(m[0], m[3]);
      return { transform: unfold(sc(u / m[0], u / m[3]), pg.w, pg.h), opacity: back ? M.clamp((t - p0) / 140, 0, 1) : 1 - M.clamp(t / 120, 0, 1) };
    }), { duration: D, easing: 'linear' });
    // around the sheet the page you arrive at fades in over the one you leave, which stays whole under it until covered:
    // no frame shows neither. In, that is done while the sheet is still paper, so the essay is all that prints through it
    kill(A, 'root', ['old', 'new']);
    pa('new', 'root', back ? fade(0, 1, 40, 260, D, EIO) : fade(0, 1, tr0, tr0 + 160, D, EIO), { duration: D });
    return D;
  }
  function title(A, g, fs0, fs1, delay) {
    var sp = spring(150, 21), s0 = Math.hypot(g.m0[0], g.m0[1]), s1 = Math.hypot(g.m1[0], g.m1[1]), k = (fs0 * s0) / (fs1 * s1);
    var hOld = g.w1 * g.h0 / g.w0, u = (g.w0 * s0) / (k * s1 * g.w1), own = unfold(sc(u), g.w1, hOld), D = sp.dur + delay;
    kill(A, 'book-title', ['group', 'old', 'new']);
    pa('group', 'book-title', [{ transform: unfold([k * s1, 0, 0, k * s1, g.m0[4], g.m0[5]], g.w1, g.h1) }, { transform: unfold([s1, 0, 0, s1, g.m1[4], g.m1[5]], g.w1, g.h1) }], { duration: sp.dur, delay: delay, easing: sp.ease });
    pa('old', 'book-title', fade(1, 0, delay + sp.dur * 0.04, delay + sp.dur * 0.28, D).map(function (f) { f.transform = own; return f; }), { duration: D });
    pa('new', 'book-title', fade(0, 1, delay + sp.dur * 0.04, delay + sp.dur * 0.28, D), { duration: D });
  }
  // B · the cover opens out into the plate: the group is the frame (a clip that holds still in its own box), its
  // transform carries that box from the board to the plate, down to where the plate's paper begins (y)
  // Back, the frame first holds as the plate for `hold` ms and comes on over it, then shrinks: the way in run backwards
  function frameMove(A, g, Rb, Pb, Pp, y, back, D, lift, hold) {
    var W = innerWidth, sp = spring(130, 20), gw = g.w1, gh = g.h1, hOld = gw * g.h0 / g.w0, R1 = [0, 0, W, y], h = hold || 0, T = h + sp.dur;
    var R0 = back ? R1 : Rb, R2 = back ? Rb : R1, F0 = back ? Pp : Pb, F1 = back ? Pb : Pp;
    var at = function (t) { var p = sp.at(Math.max(0, t - h)), R = mix(R0, R2, p), F = mix(F0, F1, p); return { G: [R[2] / gw, 0, 0, R[3] / gh, R[0], R[1]], F: F, R: R }; };
    var Gk = frames(T, function (t) { return { transform: unfold(at(t).G, gw, gh) }; });
    // the whole cover (the replica: in, the new image; back, the old) is held to one scale and place, so it always fills
    // the frame; the board, which comes and goes, fills the frame too while it does: never a picture inside a picture
    var Ok = frames(T, function (t) { var s = at(t); return { transform: unfold(onto(s.G, back ? s.F : cover(s.R, g.w0 / g.h0), gw, hOld), gw, hOld) }; });
    var Nk = frames(T, function (t) { var s = at(t); return { transform: unfold(onto(s.G, back ? cover(s.R, g.w1 / g.h1) : s.F, gw, gh), gw, gh) }; });
    kill(A, 'book-cover', ['group', 'old', 'new']);
    pa('group', 'book-cover', Gk, { duration: T, easing: 'linear' });
    // the photo you arrive at fades in over the one you leave, which stays whole under it: both fill the frame, so it is
    // never see-through, in any engine
    var x0 = h + sp.dur * (back ? 0.16 : 0.03), x1 = h + sp.dur * (back ? 0.42 : 0.22);
    pa('old', 'book-cover', Ok, { duration: T, easing: 'linear' });
    pa('new', 'book-cover', Nk, { duration: T, easing: 'linear' });
    pa('new', 'book-cover', fade(0, 1, x0, x1, T), { duration: T });
    // in: the frame has become the plate; it lifts off and the essay's own plate, intro and nav are there under it.
    // Back: it comes on over the plate first, so the essay's intro and nav go under the photo, not out in one frame
    if (!back) pa('group', 'book-cover', fade(1, 0, lift, D, D, EIO), { duration: D });
    else pa('group', 'book-cover', fade(0, 1, 0, h, T, EIO), { duration: T });
    return T;
  }
  function obi(A, back, wait) {   // the obi slips off the foot of the board (in), or slides back up onto it (back)
    var b = box('book-obi');
    if (!b) return;
    var dur = 300, g = 2600;
    kill(A, 'book-obi', ['group', 'old', 'new']);
    pa('group', 'book-obi', frames(dur, function (t) {
      var s = (back ? dur - t : t) / 1000, y = 0.5 * g * s * s, r = 5 * M.smooth(0, 0.25, s);
      return { transform: unfold(mul(b.m, mul(tr(0, y), mul(tr(b.w / 2, b.h / 2), mul([Math.cos(r * Math.PI / 180), Math.sin(r * Math.PI / 180), -Math.sin(r * Math.PI / 180), Math.cos(r * Math.PI / 180), 0, 0], tr(-b.w / 2, -b.h / 2))))), b.w, b.h) };
    }), { duration: dur, delay: wait || 0, easing: 'linear' });
    pa(back ? 'new' : 'old', 'book-obi', back ? fade(0, 1, 0, 120, dur) : fade(1, 0, 110, 260, dur), { duration: dur, delay: wait || 0 });
  }
  // C · turn the title page: about the spine, toward you; its other side is the essay, coming round to fill the window
  function turn(A, pg, back) {
    var W = innerWidth, H = innerHeight, sp = spring(260, 24, 380), s0 = Math.hypot(pg.m[0], pg.m[1]);
    var x0 = pg.m[4], y0 = pg.m[5], h0 = pg.h * s0, cx = W / 2, cy = H / 2, dp = Math.round(Math.max(W, H) * 2.4);
    var P = 'translate(' + cx + 'px,' + cy + 'px) perspective(' + dp + 'px) translate(' + -cx + 'px,' + -cy + 'px) ';
    var leaf = function (p) { return { x: lerp(x0, W, p), y: lerp(y0, 0, p), L: lerp(h0, H, p), th: -180 * p }; };
    var front = function (p) { var l = leaf(p); return 'translate(' + -pg.w / 2 + 'px,' + -pg.h / 2 + 'px) ' + P + 'translate(' + l.x + 'px,' + l.y + 'px) rotateY(' + l.th + 'deg) scale(' + l.L / pg.h + ') translate(' + pg.w / 2 + 'px,' + pg.h / 2 + 'px)'; };
    var rear = function (p) { var l = leaf(p), s = l.L / H; return 'translate(' + -W / 2 + 'px,' + -H / 2 + 'px) ' + P + 'translate(' + l.x + 'px,' + l.y + 'px) rotateY(' + l.th + 'deg) translate(' + W * s + 'px,0) scale(' + -s + ',' + s + ') translate(' + W / 2 + 'px,' + H / 2 + 'px)'; };
    var half = sp.first(0.5), land = sp.first(0.999), a = back ? 1 : 0, b = back ? 0 : 1, face = back ? 'new' : 'old', page = back ? 'old' : 'new';
    kill(A, 'book-page', ['group', 'old', 'new']);
    kill(A, 'root', ['old', 'new']);
    pa('group', 'book-page', [{ transform: front(a) }, { transform: front(b) }], { duration: sp.dur, easing: sp.ease });
    pa('group', 'book-page', step(back ? 0 : 1, back ? 1 : 0, half, sp.dur), { duration: sp.dur });
    pa(page, 'root', [{ transform: rear(a) }, { transform: rear(b) }], { duration: sp.dur, easing: sp.ease });
    pa(page, 'root', step(back ? 1 : 0, back ? 0 : 1, half, sp.dur), { duration: sp.dur });
    // the page under the leaf: the shelf until the essay has landed over it (in); the shelf from the start (back)
    if (!back) pa('old', 'root', step(1, 0, land, sp.dur), { duration: sp.dur });
  }

  var IN = {
    a: function (A, rec) {
      var pg = box('book-page'), t = ends(A, 'book-title');
      if (!pg) return paper(A);
      sheet(A, pg, false);
      if (t) title(A, t, rec.fs || 22, X.fs || 52, 0);
      header(A);
    },
    b: function (A, rec) {
      var g = ends(A, 'book-cover');
      if (!g || !X.P) return paper(A);
      // the shelf stays while the cover grows; once it has taken most of the band, the shelf dissolves off the essay,
      // which lies whole under it (book-vt.css), and then the frame lifts off the essay's own plate
      var sp = spring(130, 20), D = sp.dur + 220, cover = sp.first(0.85), Rb = rect(g.m0, g.w0, g.h0), crop = boardCrop(X.ar);
      frameMove(A, g, Rb, cropMap(Rb, crop), X.P, X.cut, false, D, Math.max(sp.first(0.97), cover + 200));
      obi(A, false);
      kill(A, 'root', ['old', 'new']);
      pa('new', 'root', fade(0, 1, cover, cover + 200, D, EIO), { duration: D });
      header(A);
    },
    c: function (A) {
      var pg = box('book-page');
      if (!pg) return paper(A);
      turn(A, pg, false);
      header(A);
    }
  };
  var BACK = {
    a: function (A, rec) {
      var pg = box('book-page'), t = ends(A, 'book-title');
      if (!pg) return paper(A);
      sheet(A, pg, true);
      if (t) title(A, t, rec.fs || 52, parseFloat(getComputedStyle(document.querySelector('.fy-book-title')).fontSize) || 22, 40);
      header(A);
    },
    b: function (A, rec) {
      var g = ends(A, 'book-cover');
      if (!g || !rec.ar || !rec.b0) return paper(A);
      // the frame comes on over the plate while the shelf fades in over the essay (hold), then it shrinks into the cover
      var hold = 150, Rb = rect(g.m1, g.w1, g.h1), Pp = plateMap(innerWidth, rec.b0, rec.ar), d = frameMove(A, g, Rb, cropMap(Rb, boardCrop(rec.ar)), Pp, rec.cut, true, 0, 0, hold);
      obi(A, true, d - 300);
      kill(A, 'root', ['old', 'new']);
      pa('new', 'root', fade(0, 1, 20, hold + 40, d, EIO), { duration: d });
      header(A);
    },
    c: function (A) {
      var pg = box('book-page');
      if (!pg) return paper(A);
      turn(A, pg, true);
      header(A);
    }
  };

  /* ---- names: classes, only for the move they travel in ---- */
  function name(el, n) { if (el) el.classList.add('fy-book-' + n); }
  function unname() {
    [].forEach.call(document.querySelectorAll('.fy-book-page, .fy-book-title, .fy-book-cover, .fy-book-obi, .fy-book-lifted'), function (n) {
      if (!n.classList.contains('fy-book-photo') && !n.closest('.fy-book-intro')) n.classList.remove('fy-book-page', 'fy-book-title', 'fy-book-cover', 'fy-book-obi', 'fy-book-lifted');
    });
  }
  function opening() {
    var h = document.querySelector('.wr[data-mount=writing]'), key = h && h.getAttribute('data-opening'), hit = key && document.querySelector('.bk-hit[data-post="' + key + '"]');
    return hit ? { key: key, box: document.querySelectorAll('.sh-world > .book')[+hit.dataset.i] } : null;
  }
  function nameBook(o, c) {
    var q = function (s) { return o.box.querySelector(s); };
    if (c === 'a') { name(q('.p1'), 'page'); name(q('.p1-t'), 'title'); }
    // B: the whole front board travels (photo and edge); the pages behind it are hidden while it does, so where the book
    // was the shelf simply shows (named alone, the photo left the board's dark cloth behind in the shelf's picture)
    if (c === 'b') { name(q('.leaf-front'), 'cover'); name(q('.obi'), 'obi'); o.box.classList.add('fy-book-lifted'); }
    if (c === 'c') name(q('.p1'), 'page');
  }

  /* ---- the events ---- */
  var lastHref = null, clickT = 0;
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) { lastHref = a.href; clickT = Date.now(); } }, true);
  function roleOf(url) { var p = url ? new URL(url, location.href).pathname : ''; return /book-writing\.dc\.html$/.test(p) ? 'shelf' : /book-reading\.dc\.html$/.test(p) ? 'essay' : null; }
  addEventListener('pageswap', function (e) {
    var vt = e.viewTransition, act = e.activation, url = act && act.entry ? act.entry.url : Date.now() - clickT < 2000 ? lastHref : null, to = roleOf(url), c = cand();
    if (vt) vt.ready.catch(function () {});
    unname();
    var rec = { from: HERE, to: to, c: c, t: Date.now() }, go = !!(vt && HERE && to && to !== HERE && c !== 'now' && !M.reduced());
    if (go && HERE === 'shelf') {
      var o = opening(), ar = (get('book-ar') || '').split(' ');
      if (o) { nameBook(o, c); rec.post = o.key; var t1 = o.box.querySelector('.p1-t'); rec.fs = t1 ? parseFloat(getComputedStyle(t1).fontSize) : 22; if (ar[0] === o.key) rec.ar = +ar[1]; } else go = false;
    } else if (go && HERE === 'essay') {
      // A and B start the way back from the hero, so from further down the essay theirs is the paper swap; C turns any page
      var h1 = document.querySelector('.rd-main:not(.fy-book-intro) .article-intro .title'), pl = document.querySelector('.plate'), img = pl && pl.querySelector('img');
      rec.top = c === 'c' || scrollY < 40;
      if (rec.top && c === 'a' && h1) { name(h1, 'title'); rec.fs = parseFloat(getComputedStyle(h1).fontSize); }
      if (rec.top && c === 'b' && img && img.naturalWidth) {
        rec.ar = img.naturalWidth / img.naturalHeight; rec.b0 = pl.offsetHeight; rec.cut = cut(rec.b0);
        shot(img, plateMap(html.clientWidth, rec.b0, rec.ar));
      }
    }
    set(KEY, JSON.stringify(rec));
    if (vt && !go) vt.skipTransition();
  });

  function slow() { if (get('book-slow') === '1') document.getAnimations().forEach(function (a) { if (a.effect && a.effect.target === html && a.effect.pseudoElement) a.playbackRate = 0.25; }); }
  function take() { var r = null; try { r = JSON.parse(get(KEY)); set(KEY, null); } catch (e) { r = null; } return r && Date.now() - r.t < FRESH ? r : null; }
  addEventListener('pagereveal', function (e) {
    var vt = e.viewTransition, rec = take(), c = cand(), back = HERE === 'shelf';
    html.setAttribute('data-book-c', c);
    unname();
    [].forEach.call(document.querySelectorAll('.fy-book-intro, .fy-book-photo, .fy-book-shot'), function (n) { n.remove(); });
    var reset = function () { if (back && window.BOOK_RESET) { var f = window.BOOK_RESET; window.BOOK_RESET = null; f(); } };
    var ok = vt && rec && rec.c === c && c !== 'now' && !M.reduced() && rec.to === HERE && rec.from !== HERE;
    if (!ok) { if (vt) { vt.ready.catch(function () {}); vt.skipTransition(); } reset(); return; }
    var kind = 'paper', made = [];
    if (!back) {
      var p = entry();
      if (p && (c === 'a' || c === 'b')) {
        var I = intro(p);
        made.push(I.el); X.B = I.b0;
        if (c === 'a') { I.h1.classList.add('fy-book-title'); X.fs = parseFloat(getComputedStyle(I.h1).fontSize); kind = 'in'; }
        if (c === 'b' && p.cover) { X.ar = rec.ar || 1.5; X.P = plateMap(html.clientWidth, I.b0, X.ar); X.cut = cut(I.b0); made.push(photo(p, X.P)); kind = 'in'; }
      } else if (c === 'c') kind = 'in';
    } else if (window.BOOK_RESET && rec.top) {
      var o = opening();
      if (o) { nameBook(o, c); kind = 'back'; }
    }
    html.setAttribute('data-book', kind === 'paper' ? 'paper' : c);
    if (kind === 'back') html.setAttribute('data-book-back', c);
    var done = function () {
      html.removeAttribute('data-book-back'); unname();
      made.forEach(function (n) { if (!n.classList.contains('fy-book-intro')) n.remove(); });
      var I = made.filter(function (n) { return n.classList.contains('fy-book-intro'); })[0];
      // the replica title stays until React has printed the real one (usually long before)
      var real = function () { return document.querySelector('.rd-main[data-ready]:not(.fy-book-intro)'); };
      var end = function () { html.removeAttribute('data-book'); html.removeAttribute('data-book-go'); if (I) I.remove(); };
      if (!I || real()) end(); else new MutationObserver(function (l, ob) { if (real()) { ob.disconnect(); end(); } }).observe(document.body, { subtree: true, attributes: true, childList: true });
      reset();
    };
    vt.finished.then(done, done);
    vt.ready.then(function () {
      try { var A = uaAnims(); if (kind === 'in') IN[c](A, rec); else if (kind === 'back') BACK[c](A, rec); else paper(A); slow(); html.setAttribute('data-book-go', ''); }
      catch (err) { html.setAttribute('data-book-go', ''); vt.skipTransition(); setTimeout(function () { throw err; }); }
    }, done);
  });

  /* ---- the pen's folder tab around the current tab (transitions.js ink(), which the board does not load) ---- */
  function rng(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h += 0x6D2B79F5; var t = Math.imul(h ^ h >>> 15, h | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function f2(v) { return +v.toFixed(2); }
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
  addEventListener('pagereveal', ink);
  if (!('onpagereveal' in window)) document.addEventListener('DOMContentLoaded', ink);
})();
