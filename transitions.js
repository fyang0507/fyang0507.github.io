/* transitions.js — the desk becomes the nav (board r2-01 A), as cross-document View Transitions between home
   and the four gateway pages. Loaded `defer blocking="render"` right after motion.js (same attributes): it runs
   after parsing, in order, but before first render, so pagereveal is heard, and it never holds up the parser
   (support.js, and so React, start at once).
   · pageswap (the page you leave) writes sessionStorage fy-vt {from, to, t}. Home also writes its desk edge and
     each object's ink box, because the page you land on can't measure the page you left.
   · pagereveal (the page you land on) inks the folder tab, then, once the pseudo-tree exists, reads the
     browser's own group keyframes (every shared part's old and new box) and replaces them with keyframes
     sampled from the physics clock below (the r2-01-physics.js integrator, trimmed to three moves):
       enter  home → page: every door object is carried on its own arc by a spring tuned to its mass; the table
              folds into its front edge and that edge rises, sagging, into the nav rule; the props fall.
       leave  page → home: the rule drops, the table springs open from it, the objects are thrown back on gravity.
       tab    page → page: transitions-tab.js (the folder tab slides on a spring, a hop is passed along the row).
   Same-tab moves (Writing ↔ Reading), other pages and reduced motion get no transition. A click mid-flight
   skips the running transition to its end; engines without cross-document transitions keep a hard cut. */
(function () {
  'use strict';
  var M = window.Motion, html = document.documentElement;
  if (!M) return;
  var clamp = M.clamp, lerp = M.lerp, smooth = M.smooth;
  var KEY = 'fy-vt', FRESH = 10000, DT = 1 / 240, FPS = 60;
  var FILE = { '': 'home', 'index.html': 'home', 'Writing.dc.html': 'writing', 'Reading.dc.html': 'reading', 'Building.dc.html': 'building', 'Gallery.dc.html': 'shooting', 'About.dc.html': 'about' };
  var TAB = { writing: 'writing', reading: 'writing', building: 'building', shooting: 'shooting', about: 'about' };
  var ORDER = ['writing', 'building', 'shooting', 'about'];
  var OBJ = { writing: 'book', building: 'laptop', shooting: 'camera', about: 'frame' };
  // each drawing's ink box inside its 60px nav sprite (site-nav.css, --nav-art-x/y included): x, y, w, h
  var NAV = { book: [5, 17.5, 51, 35], laptop: [7, 12, 46, 40.5], camera: [6.5, 13, 47, 40], frame: [11, 13.5, 37.5, 39.5] };
  // mass: the laptop hauls, the frame flits. dur = how long the eased target takes; k, c, m = the landing
  // spring (heavier = stiffer-damped, lighter = one livelier overshoot); lift = arc height; e = restitution
  var MASS = {
    laptop: { dur: 440, k: 230, c: 30, m: 1.4, lift: 70, e: 0.12 },
    camera: { dur: 400, k: 250, c: 24, m: 1.1, lift: 110, e: 0.2 },
    book: { dur: 400, k: 260, c: 22.5, m: 1, lift: 104, e: 0.18 },
    frame: { dur: 370, k: 300, c: 21, m: 0.9, lift: 118, e: 0.3 }
  };
  var PROPS = { mug: { spin: -38, w: 150 }, plant: { spin: 16, w: 210 }, bird: { spin: 0, w: 270 } };   // drop back in 60 ms apart
  var EDGE_RGB = [96, 87, 78];     // the desk's drawn front edge (FY_DESK.edgeLine.rgb wins); the rule it becomes is --ink
  var EZ = { lin: M.EASE.lin, in: function (t) { return t * t; }, out: function (t) { return 1 - Math.pow(1 - t, 3); },
    inout: M.cubic(0.45, 0, 0.55, 1), pick: M.cubic(0.25, 0.1, 0.25, 1), pen: M.EASE.pen };

  /* ---- the physics clock: a Chan is one number heading for a target; a Body is a drawing carried along a
     quadratic arc by two Chans (progress p, scale q) plus a bounce offset once a thrown body lands ---- */
  function Chan(x) { this.x = this.to = this.from = x; this.v = 0; this.idle = true; }
  Chan.prototype.set = function (x) { this.x = this.to = this.from = x; this.v = 0; this.idle = true; return this; };
  Chan.prototype.go = function (to, kind, o, wait, v0) {
    this.to = to; this.kind = kind; this.o = o || {}; this.wait = (wait || 0) / 1000; this.t = 0; this.from = this.x;
    this.idle = false; this.landed = false; this.dir = 0; this.v0 = v0 == null ? null : v0;
    return this;
  };
  Chan.prototype.step = function (dt) {
    if (this.idle) return;
    if (this.wait > 0) { this.wait -= dt; if (this.wait > 0) return; dt = -this.wait; this.wait = 0; }
    if (this.v0 != null) { this.v = this.v0; this.v0 = null; }
    var o = this.o, p;
    if (this.kind === 'tween') {                       // time-based: the pen's one confident pass
      this.t += dt; p = clamp(this.t / (o.dur / 1000), 0, 1);
      var prev = this.x; this.x = lerp(this.from, this.to, (EZ[o.ease] || EZ.out)(p)); this.v = (this.x - prev) / dt;
      if (p >= 1) { this.x = this.to; this.v = 0; this.idle = this.landed = true; }
      return;
    }
    if (this.kind === 'fall') {                        // constant pull, bounces off the target with restitution e
      var dir = this.dir || (this.dir = this.to - this.x >= 0 ? 1 : -1);
      this.v += o.g * dir * dt; this.x += this.v * dt;
      if ((this.x - this.to) * dir >= 0) {
        this.landed = true; this.x = this.to;
        if (Math.abs(this.v) * (o.e || 0) < (o.vmin || 0.35)) { this.v = 0; this.idle = true; } else this.v = -this.v * o.e;
      }
      return;
    }
    // spring, sub-stepped; 'chase' springs after a target that eases from → to over dur (a gentle pick-up,
    // a fast middle, and the spring's one overshoot on landing)
    var k = o.k, c = o.c, m = o.m || 1, n = Math.max(1, Math.ceil(dt / DT)), h = dt / n, goal = this.to, moving = false;
    if (this.kind === 'chase') {
      this.t += dt; p = clamp(this.t / (o.dur / 1000), 0, 1);
      goal = lerp(this.from, this.to, (EZ[o.ease] || EZ.inout)(p)); moving = p < 1;
    }
    for (var i = 0; i < n; i++) { this.v += (-k * (this.x - goal) - c * this.v) / m * h; this.x += this.v * h; }
    if (!this.landed && (this.to - this.from) * (this.x - this.to) >= 0) this.landed = true;
    if (!moving && Math.abs(this.x - this.to) < 0.0008 && Math.abs(this.v) < 0.01) { this.x = this.to; this.v = 0; this.idle = true; }
  };
  // quadratic Bézier; past t = 1 it continues along the landing tangent, so an overshoot keeps its direction
  function bez(a, b, c, t) {
    if (t > 1) { var e = bez(a, b, c, 1); return { x: e.x + 2 * (c.x - b.x) * (t - 1), y: e.y + 2 * (c.y - b.y) * (t - 1) }; }
    var u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * b.x + t * t * c.x, y: u * u * a.y + 2 * u * t * b.y + t * t * c.y };
  }
  function Body(P, s) { this.p = new Chan(1); this.q = new Chan(1); this.bo = new Chan(0); this.P0 = this.P1 = this.P2 = P; this.s0 = this.s1 = s; this.vx = this.vy = 0; this.last = P; }
  Body.prototype.pos = function () { var P = bez(this.P0, this.P1, this.P2, Math.max(this.p.x, -0.2)); return { x: P.x, y: P.y + this.bo.x }; };
  Body.prototype.scale = function () { return lerp(this.s0, this.s1, this.q.x); };
  Body.prototype.idle = function () { return this.p.idle && this.q.idle && this.bo.idle && !this.thrown; };
  // a carried body whose spring tail is below what the eye sees: within 0.35 px of its slot, nearly still
  Body.prototype.still = function () {
    var P = this.pos(), p = this.p;
    return p.kind === 'chase' && p.t * 1000 >= p.o.dur && this.q.idle && Math.hypot(P.x - this.P2.x, P.y - this.P2.y) < 0.35 && Math.hypot(this.vx, this.vy) < 30;
  };
  Body.prototype.carry = function (P2, s1, apex, po, qo, wait) {
    this.P1 = apex(this.P0); this.P2 = P2; this.s1 = s1;
    this.p.set(0).go(1, 'chase', po, wait); this.q.set(0).go(1, 'tween', qo, wait);
    return this;
  };
  // a real throw under gravity g: hop h px up out of where it is, land on P2, bounce with restitution e.
  // A quadratic Bézier walked at a constant rate is exactly a parabola, so p is linear in time.
  Body.prototype.throwTo = function (P2, s1, g, h, e, wait, room) {
    var P0 = this.P0, vy0 = -Math.sqrt(2 * g * Math.max(h, 0));
    if (room != null) vy0 = Math.max(vy0, -Math.sqrt(2 * g * Math.max(h, room)));   // never out of the top of the page
    var T = (-vy0 + Math.sqrt(vy0 * vy0 + 2 * g * Math.max(P2.y - P0.y, 1))) / g;
    this.P1 = { x: (P0.x + P2.x) / 2, y: P0.y + vy0 * T / 2 }; this.P2 = P2; this.s1 = s1;
    this.p.set(0).go(1, 'tween', { dur: T * 1000, ease: 'lin' }, wait); this.q.set(0).go(1, 'tween', { dur: T * 900, ease: 'inout' }, wait);
    this.thrown = { g: g, e: e, v: vy0 + g * T };
    return this;
  };
  Body.prototype.step = function (dt) {
    this.p.step(dt); this.q.step(dt); this.bo.step(dt);
    if (this.thrown && this.p.idle) {                 // floor contact: bounce off it, a little less each time
      this.bo.set(0).go(0, 'fall', { g: this.thrown.g, e: this.thrown.e, vmin: 40 }, 0, -this.thrown.v * this.thrown.e);
      this.thrown = null;
    }
    var P = this.pos();
    this.vx = lerp(this.vx, (P.x - this.last.x) / dt, 0.35); this.vy = lerp(this.vy, (P.y - this.last.y) / dt, 0.35);
    this.last = P;
  };
  // run a body until it is still, one sample per 60 Hz frame; land = first contact, near / arr = arc 97% / 90% done
  function sample(b, lean) {
    var k = [], land = null, near = null, arr = null;
    for (var i = 0; i < 240; i++) {
      var P = b.pos(), t = i / FPS;
      k.push({ x: P.x, y: P.y, s: b.scale(), th: b.idle() ? 0 : clamp(b.vx / 240, -7, 7) * lean });
      if (land == null && b.p.landed) land = t;
      if (near == null && b.p.x > 0.97) near = t;
      if (arr == null && b.p.x > 0.9) arr = t;
      if (i && (b.idle() || b.still())) break;
      b.step(1 / FPS);
    }
    k[k.length - 1] = { x: b.P2.x, y: b.P2.y, s: b.s1, th: 0 };   // end exactly on the page's own pose
    var end = (k.length - 1) / FPS;
    return { k: k, land: land == null ? end : land, near: near == null ? end : near, arr: arr == null ? end : arr, dur: end };
  }

  /* ---- 2-D affine matrices [a, b, c, d, e, f], as CSS matrix() ---- */
  function mat(s) {
    if (!s || s === 'none') return [1, 0, 0, 1, 0, 0];
    var n = s.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number);
    return s.indexOf('matrix3d') === 0 ? [n[0], n[1], n[4], n[5], n[12], n[13]] : n.slice(0, 6);
  }
  function mul(A, B) { return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]]; }
  function inv(A) { var d = A[0] * A[3] - A[1] * A[2]; return [A[3] / d, -A[1] / d, -A[2] / d, A[0] / d, (A[2] * A[5] - A[3] * A[4]) / d, (A[1] * A[4] - A[0] * A[5]) / d]; }
  function tr(x, y) { return [1, 0, 0, 1, x, y]; }
  function sc(x, y) { return [x, 0, 0, y == null ? x : y, 0, 0]; }
  function rot(deg) { var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [c, s, -s, c, 0, 0]; }
  function lin(A) { return [A[0], A[1], A[2], A[3], 0, 0]; }
  function css(A) { return 'matrix(' + A.map(function (v) { return +v.toFixed(5); }).join(',') + ')'; }
  function f2(v) { return +v.toFixed(2); }

  /* ---- where we are, where we came from ---- */
  var DIR = location.pathname.slice(0, location.pathname.lastIndexOf('/') + 1);
  function kindOf(href) {
    var u;
    try { u = new URL(href, location.href); } catch (e) { return null; }
    var p = u.pathname, i = p.lastIndexOf('/');
    return u.origin === location.origin && p.slice(0, i + 1) === DIR ? FILE[p.slice(i + 1)] || null : null;
  }
  var HERE = kindOf(location.href);
  html.setAttribute('data-vt-on', '');   // site.js holds the current tab's wheat band until land()
  // the opener plays only when home is the session's first page, so any other page marks the session as begun
  if (HERE && HERE !== 'home') try { if (!sessionStorage.getItem('fy-opener')) sessionStorage.setItem('fy-opener', '1'); } catch (e) { /* storage off */ }
  function move(from, to) {
    if (!from || !to) return null;
    if (from === 'home') return TAB[to] ? 'enter' : null;
    if (to === 'home') return TAB[from] ? 'leave' : null;
    return TAB[from] && TAB[to] && TAB[from] !== TAB[to] ? 'tab' : null;
  }
  function take() {
    var r = null;
    try { r = JSON.parse(sessionStorage.getItem(KEY)); sessionStorage.removeItem(KEY); } catch (e) { r = null; }
    return r && Date.now() - r.t < FRESH ? r : null;
  }
  function cameFrom(rec) {
    var a = window.navigation && window.navigation.activation, f = a && a.from && a.from.url ? kindOf(a.from.url) : null;
    return f || (rec && rec.from) || null;
  }

  /* ---- the pen's folder tab around the current tab (one hand, fixed seed) ---- */
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
    // the sides land on the rule just outside the gap it leaves (0.35 px in), so the gap is the tab's inner width
    var d = 'M0.35 ' + h + ' L' + f2(0.3 + j()) + ' ' + f2(h * 0.5) + ' L0.6 ' + r + ' Q0.8 0.6 ' + r + ' 0.5 L' + f2(w * 0.5) + ' ' + f2(0.2 + j()) +
      ' L' + (w - r) + ' 0.7 Q' + f2(w - 0.6) + ' 0.8 ' + f2(w - 0.5) + ' ' + r + ' L' + f2(w - 0.4 + j()) + ' ' + f2(h * 0.55) + ' L' + f2(w - 0.35) + ' ' + h;
    m.innerHTML = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true"><path d="' + d + '"/></svg>';
    m.classList.add('is-inked');
    if (!m.fyRO && window.ResizeObserver) { m.fyRO = new ResizeObserver(function () { ink(); }); m.fyRO.observe(m); }
  }

  /* ---- the pseudo-tree: read the browser's boxes, replace its animations ---- */
  function uaAnims() {
    var A = {};
    document.getAnimations().forEach(function (a) {
      var ef = a.effect, pe = ef && ef.target === html && ef.pseudoElement;
      if (pe) (A[pe] = A[pe] || []).push(a);
    });
    return A;
  }
  function kill(A, name, parts) { parts.forEach(function (p) { (A['::view-transition-' + p + '(' + name + ')'] || []).forEach(function (a) { a.cancel(); }); }); }
  function pa(part, name, kf, o) { o.fill = 'both'; o.pseudoElement = '::view-transition-' + part + '(' + name + ')'; return html.animate(kf, o); }
  // The browser writes each group's matrix for the group's own transform-origin, its centre. z() folds that origin in,
  // so the matrix maps the box's (0, 0)-based coordinates straight to the viewport, which is what every anchor, table
  // and line below is measured in. Unscaled nav sprites never showed the difference; the desk, drawn at ×0.61, was
  // off by (1 − scale) × half its box: the objects jumped as a move began or ended.
  function z(m, w, h) { var ox = w / 2, oy = h / 2; return [m[0], m[1], m[2], m[3], m[4] + ox - m[0] * ox - m[2] * oy, m[5] + oy - m[1] * ox - m[3] * oy]; }
  // a shared part's old and new box, from the browser's own group keyframes (or, for one-sided parts, its style):
  // m as the browser wrote it (for keyframes that keep the group's origin), z with the origin folded in
  function ends(A, name) {
    var g = (A['::view-transition-group(' + name + ')'] || [])[0];
    if (!g) return null;
    var k = g.effect.getKeyframes(), a = k[0], b = k[k.length - 1];
    var r = { m0: mat(a.transform), w0: parseFloat(a.width), h0: parseFloat(a.height), m1: mat(b.transform), w1: parseFloat(b.width), h1: parseFloat(b.height) };
    r.z0 = z(r.m0, r.w0, r.h0); r.z1 = z(r.m1, r.w1, r.h1);
    return r;
  }
  function box(name) {
    var cs = getComputedStyle(html, '::view-transition-group(' + name + ')'), w = parseFloat(cs.width), h = parseFloat(cs.height);
    return w > 0 ? { m: z(mat(cs.transform), w, h), w: w, h: h } : null;
  }
  // the ink box's bottom-centre: the point a drawing stands on. A = element-local, P = viewport, s = ink width on screen
  function anchor(m, ib) {
    var A = { x: ib[0] + ib[2] / 2, y: ib[1] + ib[3] }, P = { x: m[0] * A.x + m[2] * A.y + m[4], y: m[1] * A.x + m[3] * A.y + m[5] }, k = Math.hypot(m[0], m[1]);
    return { A: A, P: P, s: ib[2] * k, hs: ib[3] * k };
  }
  function inkOf(el) { var d = el && el.getAttribute('data-ink'); return d ? d.trim().split(/\s+/).map(Number) : null; }
  // one carried object: the group rides the arc (translate + lean, about its own (0, 0): the anchor, where the
  // drawing stands); each snapshot is laid out around its own ink anchor and scaled relative to its own rest, so at
  // either end it is exactly what that page draws
  function carryKeys(A, name, g, a0, a1, run) {
    var N = run.k.length - 1, L0 = mul(lin(g.m0), tr(-a0.A.x, -a0.A.y)), L1 = mul(lin(g.m1), tr(-a1.A.x, -a1.A.y)), G = [], O = [], W = [];
    run.k.forEach(function (r, i) {
      var off = i / N, x = a0.s === a1.s ? 1 : clamp((a0.s - r.s) / (a0.s - a1.s), 0, 1), n = smooth(0.48, 0.64, x);
      G.push({ offset: off, transform: 'translate(' + f2(r.x) + 'px,' + f2(r.y) + 'px) rotate(' + f2(r.th) + 'deg)', transformOrigin: '0 0', width: g.w1 + 'px', height: g.h1 + 'px' });
      O.push({ offset: off, transform: css(mul(sc(r.s / a0.s), L0)), width: g.w0 + 'px', height: g.h0 + 'px', opacity: f2(1 - n) });
      W.push({ offset: off, transform: css(mul(sc(r.s / a1.s), L1)), width: g.w1 + 'px', height: g.h1 + 'px', opacity: f2(n) });
    });
    kill(A, name, ['group', 'image-pair', 'old', 'new']);
    var o = { duration: run.dur * 1000, easing: 'linear' };
    pa('group', name, G, o); pa('old', name, O, o); pa('new', name, W, o);
  }

  function fade(el, dur, delay) { if (el) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay: delay, fill: 'backwards', easing: 'ease-out' }); }
  function hold(part, name, ms) { return pa(part, name, [{ opacity: 0 }, { opacity: 0, offset: 0.999 }, { opacity: 1 }], { duration: ms }); }

  /* ---- the line: first the desk's front edge, then the nav rule, drawn live by the rule-live SVG ---- */
  // the desk's drawn edge in viewport px: data-edge on .desk-edge, else FY_DESK.edgeLine (desk px) mapped through
  // the element's own layout box; same for each object's ink box (fractions of its element)
  function edgeOf(el) {
    var b = el.getBoundingClientRect(), D = window.FY_DESK && window.FY_DESK.edgeLine, k = b.width / (el.offsetWidth || b.width);
    var n = (el.getAttribute('data-edge') || '').trim().split(/\s+/).map(Number), pts = [];
    if (n.length > 3) for (var i = 0; i + 1 < n.length; i += 2) pts.push([b.left + n[i] * b.width, b.top + n[i + 1] * b.height]);
    else if (D) D.pts.forEach(function (p) { pts.push([b.left + (p[0] - el.offsetLeft) * k, b.top + (p[1] - el.offsetTop) * k]); });
    if (pts.length < 2) pts = [[b.left, b.top + b.height / 2], [b.right, b.top + b.height / 2]];
    return { pts: pts, w: n.length > 3 ? (+el.getAttribute('data-edge-w') || 0.0014) * b.width : D ? D.w * k : 2, rgb: D && D.rgb };
  }
  function deskInk(o) {
    var el = document.querySelector('.desk-' + o), i = inkOf(el), D = window.FY_DESK && window.FY_DESK.obj && window.FY_DESK.obj[o];
    if (i || !D || !D.ink || !el || !el.offsetWidth) return i;
    return [(D.ink[0] - el.offsetLeft) / el.offsetWidth, (D.ink[1] - el.offsetTop) / el.offsetHeight, D.ink[2] / el.offsetWidth, D.ink[3] / el.offsetHeight];
  }
  function rgb(v) { var m = /#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(v || ''); return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [51, 48, 43]; }
  function rel(b) { var k = Math.hypot(b.m[0], b.m[1]); return { x0: b.m[4], x1: b.m[4] + b.w * k, y: b.m[5] + b.h * k / 2, w: b.w * k }; }
  function lineGeo(edge, rule, gap) {
    var p = edge.pts, e0 = p[0][0], e1 = p[p.length - 1][0];
    function ey(u) {
      var x = lerp(e0, e1, u);
      for (var i = 1; i < p.length; i++) if (x <= p[i][0]) return lerp(p[i - 1][1], p[i][1], (x - p[i - 1][0]) / (p[i][0] - p[i - 1][0] || 1));
      return p[p.length - 1][1];
    }
    return { e0: e0, e1: e1, ew: edge.w, rgb: edge.rgb || EDGE_RGB, ey: ey, rule: rule, gap: gap, rise: ey(0.5) - rule.y, ink: rgb(getComputedStyle(html).getPropertyValue('--ink')) };
  }
  // the line at one moment: its ends, the drawn wobble fading as it straightens, and a sag from its own speed
  // (the middle lags ends pulled by both hands, but only once the table has let go of it)
  function lineAt(G, s) {
    var r = s.r, rr = clamp(r, 0, 1), sag = clamp(s.v * G.rise * 0.02, -G.rise * 0.09, G.rise * 0.09) * smooth(0.55, 1, s.f);
    var base = function (u) { return lerp(G.ey(u), G.rule.y, r); };
    return { x0: lerp(G.e0, G.rule.x0, rr), x1: lerp(G.e1, G.rule.x1, rr), rr: rr, base: base, y: function (u) { return base(u) + sag * 4 * u * (1 - u); } };
  }
  function path(p) {                 // smoothed through the midpoints; the ends stay exact
    if (p.length < 2) return '';
    var d = 'M' + f2(p[0][0]) + ' ' + f2(p[0][1]);
    for (var i = 1; i < p.length - 1; i++) d += ' Q' + f2(p[i][0]) + ' ' + f2(p[i][1]) + ' ' + f2((p[i][0] + p[i + 1][0]) / 2) + ' ' + f2((p[i][1] + p[i + 1][1]) / 2);
    return d + ' L' + f2(p[p.length - 1][0]) + ' ' + f2(p[p.length - 1][1]);
  }
  function drawLine(svg, G, s) {
    var L = lineAt(G, s), gw = G.gap ? s.gap * G.gap.w : 0, gl = G.gap ? G.gap.c - gw / 2 : 0, gr = gl + gw, A = [], B = [], y = function (x) { return L.y((x - L.x0) / (L.x1 - L.x0)); };
    for (var i = 0; i <= 40; i++) { var x = lerp(L.x0, L.x1, i / 40); if (gw < 0.5 || x <= gl) A.push([x, y(x)]); else if (x >= gr) B.push([x, y(x)]); }
    if (gw >= 0.5) { if (gl > L.x0 && gl < L.x1) A.push([gl, y(gl)]); if (gr > L.x0 && gr < L.x1) B.unshift([gr, y(gr)]); }
    svg.firstChild.setAttribute('d', path(A)); svg.lastChild.setAttribute('d', path(B));
    svg.style.stroke = 'rgb(' + G.rgb.map(function (v, i) { return Math.round(lerp(v, G.ink[i], L.rr)); }).join(',') + ')';
    svg.style.strokeWidth = f2(lerp(G.ew, 1.5, L.rr));
  }
  // the line's channels, integrated once: enter rises from the edge and opens the gap when the pen is done;
  // leave drops to the edge, the table springs open from it and the laptop's landing thuds it
  function lineRun(kind, at) {
    var enter = kind === 'enter', mob = innerWidth <= 640, k = [], ev = {}, st = 1 / FPS;
    var line = new Chan(enter ? 0 : 1), fold = new Chan(enter ? 0 : 1), gap = new Chan(enter ? 0 : 1), pen = new Chan(0), thud = new Chan(0), all = [line, fold, gap, pen, thud];
    if (enter) { line.go(1, 'spring', { k: 130, c: 19 }, 130); fold.go(1, 'tween', { dur: 250, ease: 'in' }); } else { line.go(0, 'spring', { k: 150, c: 19 }, 70); gap.go(0, 'tween', { dur: 130, ease: 'in' }, 40); }
    for (var i = 0; i < 240; i++) {
      var t = i / FPS;
      if (ev.line == null && line.x >= 0.9) ev.line = t;          // the rule is arriving
      if (enter && ev.pen == null && t >= at) { ev.pen = t; pen.go(1, 'tween', { dur: 260, ease: 'pen' }); }
      if (ev.pen != null && ev.gap == null && pen.x > 0.88) { ev.gap = t; gap.go(1, 'tween', { dur: 110 }); }
      if (!enter && ev.fold == null && line.x < 0.3) { ev.fold = t; fold.go(0, 'spring', { k: 230, c: 19 }); }
      if (!enter && ev.thud == null && t >= at) { ev.thud = t; thud.go(0, 'spring', { k: 900, c: 30 }, 0, mob ? 60 : 130); }
      k.push({ r: line.x, v: line.v, f: fold.x, gap: gap.x, thud: thud.x });
      if (all.every(function (c) { return c.idle; }) && (enter ? ev.gap != null : ev.thud != null)) break;
      all.forEach(function (c) { c.step(st); });
    }
    return { k: k, ev: ev, dur: (k.length - 1) / FPS };
  }
  // the live line follows the transition's own clock (a WAAPI animation's currentTime), frame by frame
  function drive(svg, G, run, clock) {
    (function frame() {
      if (!svg.isConnected) return;
      var t = +clock.currentTime / 1000 || 0, i = clamp(t * FPS, 0, run.k.length - 1), a = run.k[Math.floor(i)], b = run.k[Math.ceil(i)], u = i - Math.floor(i);
      drawLine(svg, G, { r: lerp(a.r, b.r, u), v: lerp(a.v, b.v, u), f: lerp(a.f, b.f, u), gap: lerp(a.gap, b.gap, u) });
      if (t < run.dur) requestAnimationFrame(frame);
    })();
  }
  // the table hangs from its front edge: it follows the line, stretches with it and folds up into it
  function tableKeys(A, part, G, run) {
    var b = box('desk-table');
    if (!b) return;
    var Mi = inv(b.m), ref = lineAt(G, { r: 0, v: 0, f: 0 }), X0 = ref.x0, Y0 = ref.base(0.5), W0 = ref.x1 - ref.x0, N = run.k.length - 1;
    var K = run.k.map(function (s, i) {
      var L = lineAt(G, s), V = mul(tr(L.x0, L.base(0.5) + s.thud), mul(sc((L.x1 - L.x0) / W0, Math.max(1 - s.f, 0.0001)), tr(-X0, -Y0)));
      return { offset: i / N, transform: css(mul(Mi, mul(V, b.m))), transformOrigin: '0 0', width: b.w + 'px', height: b.h + 'px', opacity: f2(1 - smooth(0.5, 0.94, s.f)) };
    });
    kill(A, 'desk-table', [part]);
    pa(part, 'desk-table', K, { duration: run.dur * 1000, easing: 'linear' });
  }
  // "home" peeks up from behind the rule on held frames (the hand's clock)
  function peek(ms) {
    var o = document.querySelector('.site-home-object'), l = document.querySelector('.site-home .site-nav-label'), s = innerWidth <= 640 ? 0.72 : 1;
    if (o) o.animate(M.held([60, 40, 20, 0].map(function (d) { return { translate: '0 ' + f2(d * s) + 'px', clipPath: 'inset(0 0 ' + d + 'px 0)' }; })), { duration: 250, delay: ms, fill: 'backwards' });
    if (l) l.animate(M.held([{ opacity: 0 }, { opacity: 0.33 }, { opacity: 0.67 }, { opacity: 1 }]), { duration: 250, delay: ms, fill: 'backwards' });
  }
  // the props drop back in from above once the table is open again
  function propsIn(A, t0) {
    var mob = innerWidth <= 640;
    Object.keys(PROPS).forEach(function (n) {
      var name = 'desk-' + n, P = PROPS[n], w = t0 * 1000 + P.w, dy = new Chan(mob ? -120 : -230), al = new Chan(0), ro = new Chan(P.spin * 0.3), K = [];
      if (!box(name)) return;
      dy.go(0, 'fall', { g: 4600, e: 0.26, vmin: 60 }, w); al.go(1, 'tween', { dur: 90 }, w); ro.go(0, 'tween', { dur: 260 }, w);
      for (var i = 0; i < 240; i++) {
        K.push({ transform: 'translateY(' + f2(dy.x) + 'px) rotate(' + f2(ro.x) + 'deg)', transformOrigin: '50% 100%', opacity: f2(al.x) });
        if (i && dy.idle && al.idle && ro.idle) break;
        dy.step(1 / FPS); al.step(1 / FPS); ro.step(1 / FPS);
      }
      K.forEach(function (k, i) { k.offset = i / (K.length - 1); });
      kill(A, name, ['new']);
      pa('new', name, K, { duration: (K.length - 1) * 1000 / FPS, easing: 'linear' });
    });
  }

  /* ---- the three moves ---- */
  function objects(A, inkOld, inkNew) {
    var list = [];
    ORDER.forEach(function (t, ti) {
      var o = OBJ[t], g = ends(A, 'obj-' + o);
      if (!g) return;
      var i0 = inkOld(o, g.w0, g.h0), i1 = inkNew(o, g.w1, g.h1);
      list.push({ o: o, ti: ti, g: g, a0: anchor(g.z0, [i0[0] * g.w0, i0[1] * g.h0, i0[2] * g.w0, i0[3] * g.h0]), a1: anchor(g.z1, [i1[0] * g.w1, i1[1] * g.h1, i1[2] * g.w1, i1[3] * g.h1]) });
    });
    return list;
  }
  function navInk(o) { return NAV[o].map(function (v) { return v / 60; }); }   // the sprite is 60 px square
  function enter(A, rec, svg) {
    var mob = innerWidth <= 640, hit = OBJ[TAB[HERE]], ink0 = (rec && rec.ink) || {}, runs = {};
    var list = objects(A, function (o) { return ink0[o] || [0, 0, 1, 1]; }, navInk), c = list.filter(function (it) { return it.o === hit; })[0];
    // the object you touched leaves first; the others follow in a ripple by distance across the desk
    var d = function (it) { return it === c ? -1 : c ? Math.hypot(it.a0.P.x - c.a0.P.x, it.a0.P.y - c.a0.P.y) : it.ti; };
    list.sort(function (a, b) { return d(a) - d(b); }).forEach(function (it, i) {
      var m = MASS[it.o], P2 = it.a1.P, lift = m.lift * (mob ? 0.45 : 1) * (it === c ? 1.3 : 1), top = it.a0.hs / 2 + it.a1.hs / 2 + 4;
      // the apex: the arc's peak (≈ (P0 + 2·P1 + P2) / 4) never lifts the drawing out of the top of the page
      var b = new Body(it.a0.P, it.a0.s).carry(P2, it.a1.s, function (P0) { return { x: lerp(P0.x, P2.x, 0.62), y: Math.max(Math.min(P0.y, P2.y) - lift, 2 * top - (P0.y + P2.y) / 2) }; },
        { k: m.k, c: m.c, m: m.m, dur: m.dur, ease: it === c ? 'pick' : 'inout' }, { dur: m.dur * 0.9, ease: 'inout' }, i ? 4 + i * 16 : 0);
      runs[it.o] = sample(b, 1);
      carryKeys(A, 'obj-' + it.o, it.g, it.a0, it.a1, runs[it.o]);
    });
    var penAt = runs[hit] ? runs[hit].near : 0.45, tm = document.querySelector('.site-tabmark'), p = tm && tm.querySelector('path');
    // each label answers as its object comes in; the status line follows
    ORDER.forEach(function (t) { var r = runs[OBJ[t]]; if (r) fade(document.querySelector('.site-tab--' + t + ' .site-nav-label'), 160, r.arr * 1000); });
    fade(document.querySelector('.site-header-status'), 240, 380);
    // the pen draws the folder tab around the object you touched, as it lands
    kill(A, 'tabmark', ['new']);
    if (p) {
      var Lp = f2(p.getTotalLength() + 3), da = Lp + ' ' + (Lp + 4);
      p.animate([{ strokeDasharray: da, strokeDashoffset: Lp }, { strokeDasharray: da, strokeDashoffset: 0 }], { duration: 260, delay: penAt * 1000, easing: M.EASE.css.pen, fill: 'backwards' });
    }
    setTimeout(function () { land(true); }, (penAt + 0.26) * 1000);
    // the table folds into its front edge and the edge rises into the rule
    var eb = box('desk-edge'), rb = document.querySelector('.site-rule'), tb = tm && tm.getBoundingClientRect();
    if (!svg || !eb || !rb) return;                    // no desk edge to lift: the browser's own crossfade
    var r = rb.getBoundingClientRect(), e = rel(eb), edge = rec && rec.edge ? rec.edge : { pts: [[e.x0, e.y], [e.x1, e.y]], w: 2 };
    var G = lineGeo(edge, { x0: r.left, x1: r.right, y: r.top + r.height / 2 }, tb && tb.width ? { c: tb.left + tb.width / 2, w: tb.width } : null), run = lineRun('enter', penAt);
    tableKeys(A, 'old', G, run);
    kill(A, 'site-rule', ['new']);
    drive(svg, G, run, hold('new', 'site-rule', run.dur * 1000));
    peek(((run.ev.line == null ? run.dur : run.ev.line) + 0.04) * 1000);
  }
  function leave(A, from, svg) {
    var mob = innerWidth <= 640, di = ORDER.indexOf(TAB[from]), runs = {}, last = 0;
    var list = objects(A, navInk, function (o) { return deskInk(o) || [0, 0, 1, 1]; });
    // the rule was holding them up: when it drops they drop, nearest the tab you left first
    list.sort(function (a, b) { return Math.abs(a.ti - di) - Math.abs(b.ti - di); }).forEach(function (it, i) {
      var room = it.a0.P.y - Math.max(it.a0.hs, it.a1.hs) - 14;
      var b = new Body(it.a0.P, it.a0.s).throwTo(it.a1.P, it.a1.s, mob ? 3200 : 7000, mob ? 4 : 9, MASS[it.o].e, 70 + i * 22, room);
      runs[it.o] = sample(b, 0.6); last = Math.max(last, runs[it.o].land);
      carryKeys(A, 'obj-' + it.o, it.g, it.a0, it.a1, runs[it.o]);
    });
    // the pen lifts the folder tab off, from where it began; the notes come back once everything has landed
    kill(A, 'tabmark', ['old']);
    if (box('tabmark')) pa('old', 'tabmark', [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 170, easing: M.EASE.css.lift });
    if (box('desk-notes')) { kill(A, 'desk-notes', ['new']); pa('new', 'desk-notes', [{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: (last + 0.2) * 1000, easing: 'ease-out' }); }
    var rb = box('site-rule'), tb = box('tabmark'), el = document.querySelector('.desk-edge');
    if (!svg || !rb || !el || !box('desk-edge')) return;
    var t = tb && rel(tb), G = lineGeo(edgeOf(el), rel(rb), t ? { c: (t.x0 + t.x1) / 2, w: t.w } : null), run = lineRun('leave', runs.laptop ? runs.laptop.land : last);
    tableKeys(A, 'new', G, run);
    kill(A, 'desk-edge', ['new']);
    drive(svg, G, run, hold('new', 'desk-edge', run.dur * 1000));
    propsIn(A, run.ev.fold == null ? 0.2 : run.ev.fold);
  }
  /* ---- the events ---- */
  // what transitions-tab.js works with: the matrices, the browser's boxes and animations, the row, the landing
  var V = { M: M, ends: ends, kill: kill, pa: pa, css: css, mul: mul, tr: tr, rot: rot, ORDER: ORDER, OBJ: OBJ, TAB: TAB, here: HERE, land: land };
  var cur = null, lastHref = null, clickT = 0;
  // the band may go on: at once when nothing was carried in, else once the tab has landed (data-vt-landed stays)
  function land(vt) { if (!html.hasAttribute('data-vt-landed')) { html.setAttribute('data-vt-landed', ''); document.dispatchEvent(new CustomEvent('fy:landed', { detail: { vt: !!vt } })); } }
  function done() { html.removeAttribute('data-vt'); land(true); [].forEach.call(document.querySelectorAll('.fy-rule-live, .fy-live'), function (s) { s.remove(); }); cur = null; }
  function liveLine() {
    if (!document.body) return null;
    var NS = 'http://www.w3.org/2000/svg', s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', 'fy-rule-live'); s.setAttribute('aria-hidden', 'true');
    s.appendChild(document.createElementNS(NS, 'path')); s.appendChild(document.createElementNS(NS, 'path'));
    return document.body.appendChild(s);
  }
  // home, as it is left: the desk edge and each object's ink box, in viewport px / fractions of its box
  function desk(rec) {
    var el = document.querySelector('.desk-edge');
    rec.ink = {};
    ['laptop', 'book', 'frame', 'camera'].forEach(function (o) { var i = deskInk(o); if (i) rec.ink[o] = i; });
    if (el) rec.edge = edgeOf(el);
  }
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) { lastHref = a.href; clickT = Date.now(); } }, true);
  addEventListener('pageswap', function (e) {
    if (cur) { cur.skipTransition(); done(); }
    var act = e.activation, to = act && act.entry ? kindOf(act.entry.url) : Date.now() - clickT < 2000 ? kindOf(lastHref) : null;
    var rec = { from: HERE, to: to, t: Date.now() };
    if (HERE === 'home') desk(rec);
    try { sessionStorage.setItem(KEY, JSON.stringify(rec)); } catch (x) { /* storage off: pagereveal asks the Navigation API */ }
    if (e.viewTransition && (M.reduced() || (act && act.entry && !move(HERE, to)))) e.viewTransition.skipTransition();
  });
  function reveal(e) {
    var rec = take(), vt = e && e.viewTransition, from = cameFrom(rec), kind = M.reduced() ? null : move(from, HERE);
    ink();
    if (!vt || !kind) { if (vt) vt.skipTransition(); land(false); return; }
    cur = vt; html.setAttribute('data-vt', kind);
    if (kind === 'leave') land(false);
    var svg = kind === 'tab' ? null : liveLine();
    if (kind === 'tab' && window.FYTab) FYTab.prepare(HERE);   // the marks the page answers with, before the capture
    vt.finished.then(done, done);
    vt.ready.then(function () {
      try { var A = uaAnims(); if (kind === 'tab') { if (window.FYTab) FYTab.run(V, A, from); else land(true); } else if (kind === 'enter') enter(A, rec, svg); else leave(A, from, svg); }
      catch (err) { vt.skipTransition(); setTimeout(function () { throw err; }); }
    }, done);
  }
  addEventListener('pagereveal', reveal);
  if (!('onpagereveal' in window)) document.addEventListener('DOMContentLoaded', function () { reveal(null); });
  else if (performance.getEntriesByType('paint').length) reveal(null);   // painted before this ran (no blocking=render)
  M.onReduced(function (on) { if (on && cur) cur.skipTransition(); });
})();
