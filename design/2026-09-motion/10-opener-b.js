/* 10 · B — Ink bloom 墨晕: choreography. A blank sheet; four drops land (laptop, camera, book,
   portrait) in an accelerating rhythm; their blooms carry the desk drawing through the paper and
   the ink wicks out along the drawn lines; the sheet dries rim-first; four pigment events colour
   the bird, the cat, the ghost and the ✦; the hand annotates; the DOM desk takes over and lives.
   One clock (t, seconds) drives the shader and every DOM animation, so ?t=1.2 or OB.seek(1.2)
   renders an exact frame. Honest loading: the clock only slows (never pads) if the drawing has
   not decoded by the time the sheet should start drying, and gives up to the plain desk after a cap. */
(function () {
  'use strict';
  var Q = new URLSearchParams(location.search);
  var html = document.documentElement;
  var IW = 1448, IH = 1086, MARGIN = 160;
  var A = '../../assets/';
  // The opener's own two assets (~215 KB); the landing desk's images load in parallel for the hand-off.
  var SRC = { map: 'assets-gen/10b-arrival.webp', art: 'assets-gen/10b-desk.webp',
    dom: [A + 'desk-scene2-light.png', A + 'book-flip2-light.png', A + 'frame-exp3-light.png', A + 'bird-strip6-light.png'] };
  // drops [x, y (image px), landing t, blot radius] must match tools/10b-arrival.py SEEDS.
  var TL = {
    first: {
      drops: [[508, 452, .14, 22], [1122, 772, .52, 19], [676, 792, .74, 19], [968, 546, .90, 20]],
      cols: [[253, 786, 1.82, 72], [432, 703, 1.95, 40], [1034, 803, 2.08, 40]],
      rgb: [[.96, .86, .4], [.9, .44, .37], [.4, .72, .6], [.87, .42, .36]],
      starT: 2.22, dry: [1.46, .62, 2.72], gate: 1.4, handoff: 2.76, settle: -1,
      chrome: { head: [1.65, .6], arrows: [2.02, .07, .42], labels: [2.1, .06, .45], mnav: [2.2, .45], fig: [2.35, .35], star: .3 },
      // Portrait: the sheet is played large, the colour lands while it is still large, then the whole
      // desk settles into the page on a spring while the chrome arrives around it.
      portrait: { colT: [1.75, 1.87, 1.99], starT: 2.1, settle: 2.24, handoff: 2.88,
        chrome: { head: [2.36, .5], arrows: [2.02, .07, .42], labels: [2.1, .06, .45], mnav: [2.52, .4], fig: [2.64, .22], star: .3 } }
    },
    returning: {
      drops: [[724, 560, .03, 24]], cols: [], rgb: [],
      starT: .3, dry: [.2, .26, .52], gate: .1, handoff: .56, settle: -1,
      chrome: { head: null, arrows: [.2, .04, .26], labels: [.24, .04, .26], mnav: null, fig: null, star: .2 }
    }
  };
  var SKIP_MS = 250;

  var desk = HomeDesk.build(document.getElementById('ob-scene'));
  var D = desk.el;
  D.classList.remove('drawn');
  var img = {}, ready = { map: false, dom: false }, run = null;
  var freezeT = Q.has('t') ? parseFloat(Q.get('t')) : null;
  var mode = Q.get('mode') === 'returning' ? 'returning' : 'first';

  function load(src) {            // resolves with the decoded image, or null if it failed (never hangs)
    return new Promise(function (res) {
      var i = new Image();
      i.onload = function () { (i.decode ? i.decode() : Promise.resolve()).then(function () { res(i); }, function () { res(i); }); };
      i.onerror = function () { res(null); };
      i.src = src;
    });
  }
  var loaded = {
    map: load(SRC.map).then(function (i) { img.map = i; ready.map = !!i; return i; }),
    art: load(SRC.art).then(function (i) { img.art = i; return !!i; }),
    dom: Promise.all(SRC.dom.map(load)).then(function () { ready.dom = true; })
  };

  function reduced() { return Pen.reduced(); }
  function portraitComp() { return innerWidth <= 760 && innerHeight > innerWidth * 1.2; }
  function config(m) {
    var c = Object.assign({}, TL[m]);
    if (c.portrait && portraitComp()) {
      var p = c.portrait;
      c.cols = c.cols.map(function (v, i) { return [v[0], v[1], p.colT[i], v[3]]; });
      c.starT = p.starT; c.settle = p.settle; c.chrome = p.chrome; c.handoff = p.handoff;
    }
    return c;
  }
  function rel(el, base) { var r = el.getBoundingClientRect(); return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }; }

  // The desk as the landing page will show it, rasterised at the size the shader will draw it.
  function composite(scale) {
    var sr = D.querySelector('.scene-img').getBoundingClientRect(), k = scale * Math.min(devicePixelRatio || 1, 2);
    var cv = document.createElement('canvas');
    cv.width = Math.round(sr.width * k); cv.height = Math.round(sr.height * k);
    var g = cv.getContext('2d');
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(img.art, 0, 0, cv.width, cv.height);
    return cv;
  }

  // Damped spring (ζ 0.72): the sheet settles with one ~4% overshoot — physics clock.
  function spring(tau) {
    if (tau <= 0) return 0;
    var z = .72, w = 12.5, wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + z * w / wd * Math.sin(wd * tau));
  }

  // Geometry in desk-local px. In the portrait composition the whole .desk (drawing, canvas, ✦) is
  // one sheet: scaled up and centred on its objects, then sprung back to its place in the page.
  function geometry(cfg) {
    var L = D.querySelector('.scene-img').getBoundingClientRect();
    var vw = innerWidth, vh = innerHeight, g = { L: L, zoom: 1, tx: 0, ty: 0 };
    var views = [{ x: -L.left, y: -L.top, w: vw, h: vh }];
    if (cfg.settle > 0) {
      var Z = Math.min(1.6, (vw - 22) / (0.742 * L.width)), w = L.width * Z, h = L.height * Z;
      g.zoom = Z; g.tx = vw / 2 - 0.568 * w - L.left; g.ty = vh * 0.49 - 0.545 * h - L.top;
      views.push({ x: (-L.left - g.tx) / Z, y: (-L.top - g.ty) / Z, w: vw / Z, h: vh / Z });
    }
    var m = MARGIN / IW * L.width;
    var x0 = Math.max(-m, Math.min.apply(null, views.map(function (v) { return v.x; })));
    var y0 = Math.max(-m, Math.min.apply(null, views.map(function (v) { return v.y; })));
    var x1 = Math.min(L.width + m, Math.max.apply(null, views.map(function (v) { return v.x + v.w; })));
    var y1 = Math.min(L.height + m, Math.max.apply(null, views.map(function (v) { return v.y + v.h; })));
    g.box = { x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1) - Math.floor(x0), h: Math.ceil(y1) - Math.floor(y0) };
    return g;
  }

  function sheet(r, t) {
    var g = r.g; if (g.zoom === 1) return;
    var p = spring(t - r.cfg.settle), s = g.zoom + (1 - g.zoom) * p, still = t - r.cfg.settle > .6;
    D.style.transform = still ? '' : 'translate(' + (g.tx * (1 - p)).toFixed(2) + 'px,' + (g.ty * (1 - p)).toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
    if (still && r.dpr !== r.dpr1 && r.texAt) {      // landed: re-rasterise at 1:1 so the hand-off is exact
      var b = g.box; r.dpr = r.dpr1;
      r.cv.width = Math.round(b.w * r.dpr); r.cv.height = Math.round(b.h * r.dpr);
      r.rect = [-b.x * r.dpr, -b.y * r.dpr, g.L.width * r.dpr, g.L.height * r.dpr];
      r.gl.setDesk(composite(1));
    }
  }

  // DOM chrome, driven by the same clock (paused WAAPI animations whose currentTime we set).
  function chrome(cfg) {
    var list = [], c = cfg.chrome, E = 'cubic-bezier(.2,.7,.2,1)';
    function add(el, kf, start, dur, ease) {
      if (!el) return;
      var a = el.animate(kf, { duration: dur * 1000, delay: start * 1000, fill: 'both', easing: ease || E });
      a.pause(); list.push(a);
    }
    var rise = [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }];
    if (c.head) add(document.querySelector('.ob-head'), rise, c.head[0], c.head[1]);
    if (c.mnav) add(document.querySelector('.ob-mnav'), rise, c.mnav[0], c.mnav[1]);
    if (c.fig) add(document.querySelector('.ob-fig'), [{ opacity: 0 }, { opacity: 1 }], c.fig[0], c.fig[1]);
    D.querySelectorAll('.arrows g').forEach(function (grp, i) {
      grp.querySelectorAll('path').forEach(function (p) {
        var len = 1200; try { len = p.getTotalLength() || 1200; } catch (e) {}
        p.style.strokeDasharray = len + ' ' + len;
        add(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], c.arrows[0] + c.arrows[1] * i, c.arrows[2], 'cubic-bezier(.55,.1,.25,1)');
      });
    });
    D.querySelectorAll('.navnote').forEach(function (n, i) {
      add(n, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], c.labels[0] + c.labels[1] * i, c.labels[2]);
    });
    add(D.querySelector('.spark'), [{ opacity: 0, transform: 'scale(.3) rotate(-30deg)' }, { opacity: 1, transform: 'scale(1.12)', offset: .6 }, { opacity: 1, transform: 'none' }], cfg.starT + .04, c.star);
    return list;
  }

  function start(m) {
    stop();
    mode = m || mode;
    syncStrip();
    html.classList.remove('ob-pre');
    if (reduced()) { settleStatic(); return; }
    var cfg = config(mode);
    html.classList.add('ob-playing');
    desk.bird.held = true; desk.frameHeld = true; desk.setFrame(0);
    var g = geometry(cfg);
    var cv = document.createElement('canvas');
    cv.className = 'ob-canvas';
    cv.setAttribute('aria-hidden', 'true');
    var dpr = Math.min(devicePixelRatio || 1, 2) * g.zoom, b = g.box;
    cv.width = Math.round(b.w * dpr); cv.height = Math.round(b.h * dpr);
    cv.style.cssText = 'left:' + b.x + 'px;top:' + b.y + 'px;width:' + b.w + 'px;height:' + b.h + 'px';
    D.appendChild(cv);
    D.style.transformOrigin = '0 0';
    var r = run = { cfg: cfg, g: g, cv: cv, dpr: dpr, dpr1: dpr / g.zoom, rect: [-b.x * dpr, -b.y * dpr, g.L.width * dpr, g.L.height * dpr], t: 0, t0: performance.now(), last: performance.now(), tex: 0, skip: 0, skipAt: 0, anims: chrome(cfg), alive: true };
    r.gl = Q.get('gl') === '0' ? null : OBGL.create(cv);
    if (!r.gl) {                                   // no WebGL (or no usable shader): Canvas2D ink wipe
      var c2 = cv.cloneNode(); cv.replaceWith(c2); r.cv = cv = c2;
      r.gl = OBFallback.create(cv);
    }
    r.kind = r.gl.kind || 'webgl';
    var star = rel(D.querySelector('.spark'), g.L), sx = (star.x + star.w / 2) / g.L.width * IW, sy = (star.y + star.h * .55) / g.L.height * IH;
    r.cols = cfg.cols.concat(mode === 'first' ? [[sx, sy, cfg.starT, 26]] : []);
    loaded.map.then(function (i) {       // no arrival map: the single-drop version needs none
      if (run !== r) return;
      if (i) r.gl.setMap(i); else if (mode === 'first') start('returning');
    });
    loaded.art.then(function (ok) {
      if (run !== r || !ok) return;
      r.gl.setDesk(composite(g.zoom)); r.texAt = performance.now();
    });
    if (freezeT != null) { Promise.all([loaded.map, loaded.art]).then(function () { requestAnimationFrame(function () { seek(freezeT); }); }); return; }
    requestAnimationFrame(frame);
  }

  function frame(now) {
    var r = run;
    if (!r || !r.alive || r.frozen) return;
    var dt = Math.min(.05, (now - r.last) / 1000); r.last = now;
    var noMap = mode === 'first' && !ready.map;   // the first-visit fronts live in the map; nothing can bloom yet
    var rate = noMap ? 0 : (!r.texAt && r.t >= r.cfg.gate ? .08 : 1);   // honest: creep, never pad
    if (!r.held) r.t += dt * rate;
    if ((!r.texAt || noMap) && now - r.t0 > (r.cfg.handoff + 2.5) * 1000) { finish(true); return; }
    if (r.skipAt) r.skip = Math.min(1, (now - r.skipAt) / SKIP_MS);
    var done = r.skip >= 1 || (r.t >= r.cfg.handoff && r.texAt);
    if (done && ready.dom) { finish(); return; }
    // At the end state but the landing's own images are still decoding: hold the (identical) last frame.
    if (!done || !r.held) { if (done) { r.held = true; r.t = Math.min(r.t, r.cfg.handoff); } paint(r, r.t, now); }
    requestAnimationFrame(frame);
  }

  function paint(r, t, now) {
    var cfg = r.cfg, e = 1 - Math.pow(1 - r.skip, 2);
    r.tex = r.texAt ? (freezeT != null || r.frozen ? 1 : Math.min(1, (now - r.texAt) / 300)) : 0;
    var tDom = t + (cfg.handoff - t) * e;
    r.anims.forEach(function (a) { a.currentTime = tDom * 1000; });
    sheet(r, tDom);
    r.gl.draw({ t: t, rect: r.rect, mode: mode === 'first' ? 0 : 1, tex: r.tex, skip: e,
      dry: cfg.dry, drops: cfg.drops, cols: r.cols, rgb: cfg.rgb });
  }

  function seek(t) {
    var r = run; if (!r) return;
    r.frozen = true; r.t = t;
    paint(r, t, performance.now());
  }

  var swallowUntil = 0;
  function skip() {
    var r = run;
    if (!r || r.skipAt || r.frozen) return;
    r.skipAt = performance.now(); swallowUntil = r.skipAt + 700;
  }
  // A long press that began as a skip must not finish as a click on a door.
  addEventListener('click', function (e) { if (performance.now() < swallowUntil && !e.target.closest('.ob-strip')) { e.preventDefault(); e.stopPropagation(); } }, true);

  // Hand-off: the DOM desk is identical to the last GL frame; show it, let the canvas go, free GL.
  function finish(giveUp) {
    var r = run; if (!r) return;
    r.alive = false; run = null;
    r.anims.forEach(function (a) { a.finish(); a.cancel(); });
    D.querySelectorAll('.arrows path').forEach(function (p) { p.style.strokeDasharray = ''; });
    D.style.transform = '';
    html.classList.remove('ob-playing');
    var cv = r.cv, gl = r.gl;
    var fade = cv.animate([{ opacity: 1 }, { opacity: 0 }], { duration: giveUp ? 300 : 140, easing: 'linear', fill: 'forwards' });
    fade.onfinish = function () { gl.destroy(); cv.remove(); };
    alive();
  }

  // The page comes alive on the hand's clock: steam starts, the portrait blinks, the bird hops once.
  function alive() {
    D.querySelectorAll('.steam path').forEach(function (p) { p.style.animation = 'none'; void p.getBoundingClientRect(); p.style.animation = ''; });
    setTimeout(function () { desk.setFrame(1); setTimeout(function () { desk.setFrame(0); desk.frameHeld = false; }, 170); }, 90);
    setTimeout(function () {
      desk.bird.face(1);
      desk.bird.hop(1, 1.1).then(function () { setTimeout(function () { desk.bird.held = false; }, 900); });
    }, 160);
  }

  function stop() {
    var r = run; if (!r) return;
    r.alive = false; run = null;
    r.anims.forEach(function (a) { a.cancel(); });
    D.querySelectorAll('.arrows path').forEach(function (p) { p.style.strokeDasharray = ''; });
    D.style.transform = '';
    r.gl.destroy(); r.cv.remove();
  }

  function settleStatic() {
    html.classList.remove('ob-playing', 'ob-pre');
    desk.bird.held = false; desk.frameHeld = false;
  }

  // Skip: click / tap / any key / wheel fast-forwards to the end state in ~250 ms.
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
    addEventListener(ev, function (e) { if (!e.target.closest || !e.target.closest('.ob-strip')) skip(); }, { passive: true });
  });
  var lastW = innerWidth;   // phones fire height-only resizes as the URL bar moves; only a new width re-lays the page
  addEventListener('resize', function () { if (innerWidth !== lastW) { lastW = innerWidth; if (run && !run.frozen) finish(); } });

  // Mockup-only control strip.
  var strip = document.querySelector('.ob-strip');
  function syncStrip() {
    strip.querySelector('[data-ob=first]').setAttribute('aria-pressed', mode === 'first');
    strip.querySelector('[data-ob=returning]').setAttribute('aria-pressed', mode === 'returning');
    strip.querySelector('[data-ob=rm]').checked = html.classList.contains('rm');
  }
  strip.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ob]'); if (!b) return;
    var k = b.dataset.ob;
    if (k === 'replay') start();
    else if (k === 'skip') skip();
    else if (k === 'first' || k === 'returning') start(k);
    else if (k === 'rm') { html.classList.toggle('rm', b.checked); if (b.checked) { stop(); settleStatic(); } else start(); }
  });
  addEventListener('message', function (e) { if (e.data === 'replay' || (e.data && e.data.type === 'replay')) start(); });

  window.OB = { start: start, seek: seek, skip: skip, get run() { return run; }, ready: function () { return Promise.all([loaded.map, loaded.art]); } };

  if (Q.get('autoplay') === '0') { syncStrip(); settleStatic(); }
  else start(mode);
})();
