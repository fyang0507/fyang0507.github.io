/* film/kit/film.js — window.FILM, the clock and the hand shared by the three style tests.

   A test is a page that calls FILM.film({ dur, cues, setup, render }). The renderer (kit/render.mjs) waits for
   window.READY, reads window.DUR and window.CUES, and calls window.render(t) once per frame with t in seconds,
   in any order. So nothing here reads the wall clock or an unseeded random: every frame is a pure function of t.

   Motion follows the site's two clocks (AGENTS.md): drawings on the hand's clock (FILM.held, stepped poses), paper on
   the physics clock (FILM.spring, one small overshoot, then settle; FILM.swing for a pendulum after a knock).
   Strokes come from the site's own pen (lib/shared/pen.js), seeded by their text, so the film's hand is the site's. */
(function () {
  'use strict';
  var F = {};
  F.W = 1920; F.H = 1080;
  F.C = { paper: '#FBF6EC', paper2: '#F3ECDD', page: '#FEFAEE', slip: '#FCF8EF', ink: '#33302B', soft: '#6D6559', pencil: '#736A5D',
    line: '#E4DAC7', lineStrong: '#CFC1A9', mark: '#D9695A', markDeep: '#A5453A', hl: '#DCCF98', hlInk: '#AD9650',
    board: '#EEE4CE', plank: '#EFE6D4', kraft: '#C9AE83', kraftDeep: '#B39468', cork: '#CDB58C', chem: '#C2C5AB' };

  F.clamp = function (x, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return Math.min(b, Math.max(a, x)); };
  F.lerp = function (a, b, t) { return a + (b - a) * t; };
  F.seg = function (t, a, b) { return F.clamp((t - a) / (b - a)); };

  function bezier(x1, y1, x2, y2) {
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) {
        var cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x;
        var dx = 3 * x1 * (1 - t) * (1 - 3 * t) + 3 * x2 * t * (2 - 3 * t) + 3 * t * t;
        if (Math.abs(cx) < 1e-6) break; t -= cx / (dx || 1e-6); t = F.clamp(t);
      }
      return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
    };
  }
  F.bezier = bezier;
  F.ease = {
    inOut: function (t) { t = F.clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    out: function (t) { t = F.clamp(t); return 1 - Math.pow(1 - t, 3); },
    in: function (t) { t = F.clamp(t); return t * t * t; },
    pen: bezier(.55, .1, .25, 1),      // the site's --ease-pen
    site: bezier(.2, .7, .2, 1),       // the site's --ease-out
    sine: function (t) { t = F.clamp(t); return .5 - Math.cos(Math.PI * t) / 2; }
  };

  // The physics clock: the step response of a damped spring, 0 → 1. zeta .6 overshoots once by ~9 %, then settles.
  F.spring = function (t, freq, zeta) {
    if (t <= 0) return 0; freq = freq || 2; zeta = zeta == null ? .6 : zeta;
    var w = 2 * Math.PI * freq, wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + zeta * w / wd * Math.sin(wd * t));
  };
  // A pendulum knocked at t = 0: an angle that swings out to about amp and dies away.
  F.swing = function (t, amp, freq, zeta) {
    if (t <= 0) return 0; freq = freq || 1; zeta = zeta == null ? .14 : zeta;
    var w = 2 * Math.PI * freq, wd = w * Math.sqrt(1 - zeta * zeta);
    return amp * Math.exp(-zeta * w * t) * Math.sin(wd * t);
  };
  // The hand's clock: time held in poses, 12 a second (animation on fives at 60 fps).
  F.held = function (t, fps) { fps = fps || 12; return Math.floor(t * fps + 1e-6) / fps; };

  F.rng = function (s) { return window.Pen.rng(s); };
  F.hash = function (s) { return window.Pen.hash(s); };

  // Fonts and images, loaded before READY.
  F.face = function (family, file, desc) { var f = new FontFace(family, 'url(' + file + ')', desc || {}); document.fonts.add(f); return f.load(); };
  F.img = function (src) { return new Promise(function (ok, no) { var i = new Image(); i.onload = function () { i.decode().then(function () { ok(i); }, function () { ok(i); }); }; i.onerror = function () { no(new Error('image ' + src)); }; i.src = src; }); };
  F.siteFonts = function (root) {
    // root: the path from the test's page to design/2026-09-building/film/
    var r = root, repo = root + '../../../';
    return Promise.all([
      F.face('Fraunces', r + 'fonts/Fraunces-latin.woff2', { weight: '400 600' }),
      F.face('Fraunces', r + 'fonts/Fraunces-Italic-latin.woff2', { weight: '400 600', style: 'italic' }),
      F.face('Caveat', r + 'fonts/Caveat-latin.woff2', { weight: '500 600' }),
      F.face('IBM Plex Mono', r + 'fonts/IBMPlexMono-Regular-latin.woff2', { weight: '400' }),
      F.face('IBM Plex Mono', r + 'fonts/IBMPlexMono-Medium-latin.woff2', { weight: '500' }),
      F.face('Noto Serif SC', repo + 'fonts/derived/NotoSerifSC-text.woff2', { weight: '400 900' }),
      F.face('DingTalk JinBuTi', repo + 'fonts/DingTalkJinBuTi.woff2'),
      F.face('Muyao', repo + 'fonts/MuyaoSuixin.woff2')
    ]);
  };

  // Path lengths from the browser's own geometry, cached by d.
  var svg = null, lens = {};
  F.len = function (d) {
    if (lens[d] != null) return lens[d];
    if (!svg) { svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.style.cssText = 'position:absolute;width:0;height:0'; document.body.appendChild(svg); }
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); svg.appendChild(p);
    lens[d] = p.getTotalLength(); svg.removeChild(p); return lens[d];
  };
  var p2d = {};
  F.path = function (d) { return p2d[d] || (p2d[d] = new Path2D(d)); };
  // Stroke the first p (0..1) of a path, as the pen draws it. opt: { w, color, cap }
  F.stroke = function (ctx, d, p, opt) {
    opt = opt || {}; if (p <= 0) return;
    var L = F.len(d);
    ctx.save();
    ctx.lineWidth = opt.w || 2.2; ctx.strokeStyle = opt.color || F.C.ink; ctx.lineCap = opt.cap || 'round'; ctx.lineJoin = 'round';
    if (p < 1) ctx.setLineDash([L * p, L + 10]);
    ctx.stroke(F.path(d));
    ctx.restore();
  };
  // Several strokes written one after another (a word, a glyph set), p over the whole set by length.
  F.strokes = function (ctx, ds, p, opt) {
    var total = 0, i; for (i = 0; i < ds.length; i++) total += F.len(ds[i]) + (opt && opt.gap || 0);
    var at = p * total;
    for (i = 0; i < ds.length && at > 0; i++) { var L = F.len(ds[i]); F.stroke(ctx, ds[i], F.clamp(at / L), opt); at -= L + (opt && opt.gap || 0); }
  };

  // Text helpers (canvas). Spacing in px; returns the width drawn.
  F.text = function (ctx, s, x, y, font, color, opt) {
    opt = opt || {};
    ctx.save(); ctx.font = font; ctx.fillStyle = color || F.C.ink; ctx.textBaseline = opt.base || 'alphabetic'; ctx.textAlign = opt.align || 'left';
    if (opt.spacing) ctx.letterSpacing = opt.spacing + 'px';
    if (opt.alpha != null) ctx.globalAlpha *= opt.alpha;
    ctx.fillText(s, x, y); var w = ctx.measureText(s).width; ctx.restore(); return w;
  };

  // The contract with the renderer.
  F.film = function (o) {
    window.DUR = o.dur; window.FPS = o.fps || 60; window.CUES = o.cues || [];
    var ready = Promise.resolve(o.setup ? o.setup() : null);
    window.render = function (t) { o.render(t); return t; };
    ready.then(function () { o.render(0); window.READY = true; }, function (e) { window.READY = 'error: ' + e.message; console.error(e); });
    // Preview in a normal browser: ?play plays it in real time; ?t=4.2 holds one frame.
    var q = new URLSearchParams(location.search);
    ready.then(function () {
      if (q.has('t')) o.render(parseFloat(q.get('t')));
      else if (q.has('play')) { var t0 = performance.now(); (function tick() { var t = (performance.now() - t0) / 1000 % o.dur; o.render(t); requestAnimationFrame(tick); })(); }
    });
  };
  window.FILM = F;
})();
