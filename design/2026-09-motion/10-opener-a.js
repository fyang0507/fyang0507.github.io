/* 10 · A — 一笔画 / The desk draws itself. The loading is the drawing: the desk is drawn stroke by
   stroke (10-opener-a-draw.js), the accents land, the pen writes the four doors, and the traced
   lines hand over to the real raster desk (09-home-desk.js) the moment each image has decoded.
   One playhead drives every beat, so skip is a 250 ms fast-forward rather than a cut. */
(function () {
  var P = window.Pen10a, qs = new URLSearchParams(location.search);
  var root = document.documentElement;
  var mode = qs.get('mode') === 'returning' ? 'returning' : 'first';
  var host = document.getElementById('deskhost');
  var api = HomeDesk.build(host, {});
  var desk = api.el, q = function (s) { return desk.querySelector(s); };
  var art = P.build(desk);
  var R = { scene: q('.scene-img'), book: q('.bookhold'), frame: q('.frameface') };
  var chrome = [document.querySelector('.hd'), document.querySelector('.fig')];
  var extras = [q('.screen'), q('.spark')];
  // the four doors, clockwise from the laptop: label + its arrow (shaft, head)
  var NOTES = [['.nav-build', '.d3'], ['.nav-about', '.d4'], ['.nav-shoot', '.d5'], ['.nav-write', '.d2']].map(function (p) {
    var ps = [].slice.call(q('.arrows ' + p[1]).querySelectorAll('path'));
    return { lbl: q(p[0] + ' .lbl'), arrows: ps.map(function (e) { var L = e.getTotalLength() + 2; e.style.strokeDasharray = L + ' ' + (L + 4); return { el: e, L: L }; }) };
  });
  var MNAV = [].slice.call(document.querySelectorAll('.mnav a')).map(function (a) { return { t: a.querySelector('.t'), ul: a.querySelector('.ul') }; });
  var catcher = document.getElementById('catch');
  var bird = api.bird;

  // ---- honest loading: each raster layer may replace its traced lines only once it has decoded ----
  var decoded = {}, pending = {};
  function whenDecoded(key, img) {
    (img.decode ? img.decode() : Promise.resolve()).catch(function () {}).then(function () {
      decoded[key] = true;
      if (pending[key]) lateReveal(key);
    });
  }
  // Small renders (phones): the book and portrait sprites use a pre-sized Lanczos derivative
  // (tools/10a-sprites.py) instead of letting the browser alias a 7–11x downscale into smudges.
  var SPR = {
    book: { el: q('.bookface'), box: R.book, src: '../../assets/book-flip2-light.png', lad: [96, 192, 288] },
    frame: { el: q('.fframe'), box: R.frame, src: '../../assets/frame-exp3-light.png', lad: [64, 128, 192] }
  };
  function spriteUrl(k) {
    var sp = SPR[k];
    sp.el.style.backgroundImage = 'none';                  // measure without fetching the full strip
    var w = sp.box.offsetWidth;
    if (w >= 120) { sp.el.style.backgroundImage = ''; return sp.src; }
    var need = w * (window.devicePixelRatio || 1), pick = sp.lad.filter(function (x) { return x >= need; })[0] || sp.lad[sp.lad.length - 1];
    var url = 'assets-gen/10a-' + k + '-' + pick + '.png';
    sp.el.style.backgroundImage = 'url("' + url + '")';
    return url;
  }
  whenDecoded('scene', R.scene);
  [['book', spriteUrl('book')], ['frame', spriteUrl('frame')], ['bird', '../../assets/bird-strip6-light.png']].forEach(function (p) {
    var im = new Image(); im.src = p[1]; whenDecoded(p[0], im);
  });
  var resizeT;
  addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(function () { spriteUrl('book'); spriteUrl('frame'); }, 150); });

  // ---- timelines (ms) ----
  var T = {
    first: { draw: P.FIRST, xf: 2440, xfDur: 420, chrome: [2450, 2750], notes: 2280, noteGap: 118, lbl: 240, shaft: [205, 350], head: [340, 410],
      mnav: 2520, mnavGap: 95, mt: 200, mu: [170, 300], cam: [2330, 2830], bird: 2190, steam: 2760, blink: 2990, end: 3180 },
    returning: { draw: P.RETURNING, xf: 430, xfDur: 170, chrome: null, notes: 30, noteGap: 75, lbl: 190, shaft: [160, 270], head: [262, 312],
      mnav: 30, mnavGap: 80, mt: 180, mu: [150, 260], cam: null, bird: null, steam: 0, blink: null, end: 600 }
  };
  var S = null, raf = 0, t0 = 0, skip = null, landed = false;

  function reduced() { return window.Pen ? Pen.reduced() : false; }
  function clip(e, u) { e.style.clipPath = u >= 1 ? 'none' : 'inset(-35% ' + (100 - 100 * u).toFixed(2) + '% -35% -6%)'; }
  function mobile() { return innerWidth <= 760; }

  // Handover a in [0,1]: the raster comes up first, then the traced layer fades out over it,
  // so weight and value change as one continuous fade, never a cut.
  function setRaster(key, a) {
    R[key].style.opacity = Math.min(1, a * 1.6);
    var v = 1 - P.clamp((a - .35) / .65), ly = art.layers[key];
    ly.style.opacity = v >= 1 ? '' : v.toFixed(3);
    ly.classList.toggle('gone', v <= 0);
  }
  var lateAnims = [];
  function lateReveal(key) {
    pending[key] = false;
    if (reduced() || art.svg.style.display === 'none') { setRaster(key, 1); return; }
    var t0 = performance.now();
    (function step(now) {                                   // the same handover curve, on its own clock
      var a = P.clamp((now - t0) / 420);
      setRaster(key, a);
      if (a < 1) lateAnims.push(requestAnimationFrame(step));
    })(t0);
  }

  // ---- render every beat at playhead t ----
  function render(t) {
    P.render(art, t);
    var raster = ['scene', 'book', 'frame'];
    raster.forEach(function (k) {
      if (mode === 'returning') {
        if (k !== 'scene') { if (decoded[k]) setRaster(k, 1); else pending[k] = true; }
        return;
      }
      var a = P.clamp((t - S.xf) / S.xfDur);
      if (t < S.xf || decoded[k]) { if (!pending[k]) setRaster(k, a); }
      else pending[k] = true;
    });
    if (mode === 'returning') returningScene(t); else patch.style.opacity = 0;
    var c = S.chrome ? P.clamp((t - S.chrome[0]) / (S.chrome[1] - S.chrome[0])) : 1;
    chrome.forEach(function (e) { e.style.opacity = c; });
    extras.forEach(function (e) { e.style.opacity = t >= S.xf + S.xfDur ? 1 : 0; });
    NOTES.forEach(function (n, i) {
      var s = S.notes + i * S.noteGap;
      clip(n.lbl, P.mj((t - s) / S.lbl));
      n.lbl.style.opacity = t > s ? 1 : 0;
      var seg = [S.shaft, S.head];
      n.arrows.forEach(function (a, j) {
        var u = P.mj((t - s - seg[j][0]) / (seg[j][1] - seg[j][0]));
        a.el.style.strokeDashoffset = a.L * (1 - u);
        a.el.style.visibility = u > 0 ? 'visible' : 'hidden';
      });
    });
    MNAV.forEach(function (m, i) {
      var s = S.mnav + i * S.mnavGap;
      clip(m.t, P.mj((t - s) / S.mt));
      clip(m.ul, P.mj((t - s - S.mu[0]) / (S.mu[1] - S.mu[0])));
      m.t.style.opacity = t > s ? 1 : 0; m.ul.style.opacity = t > s + S.mu[0] ? 1 : 0;
    });
    if (S.camera) {
      var c = S.camera.at(t);
      host.style.transform = c ? 'translate(' + c.x.toFixed(2) + 'px,' + c.y.toFixed(2) + 'px) scale(' + c.z.toFixed(4) + ')' : '';
      var relax = 1 - .45 * P.clamp((t - S.cam[0]) / (S.cam[1] - S.cam[0]));   // floor .85 px -> ~.47 px at landing
      art.svg.style.setProperty('--u', (relax * 1448 / (S.camera.landingWidth * (c ? c.z : 1))).toFixed(3) + 'px');
    }
    birdAt(t);
    desk.classList.toggle('steam-on', t >= S.steam);
    if (S.blink != null) api.setFrame(t >= S.blink && t < S.blink + 170 && decoded.frame ? 1 : 0);
  }

  // The bird hops in from the left on the hand's clock: two quick hops, then it turns to face you.
  var HOP = [[1, 56, 0], [2, 60, .3], [3, 64, .4], [4, 56, .3], [5, 44, 0], [0, 56, 0]], HOP_MS = 336;
  function birdAt(t) {
    if (S.bird == null) return;
    var u = t - S.bird, from = -8, dist = 11;
    if (u < 0 || !decoded.bird) { bird.el.style.opacity = u < 0 || !decoded.bird ? 0 : 1; return; }
    bird.el.style.opacity = 1;
    var hop = Math.floor(u / (HOP_MS + 30)), in_ = u - hop * (HOP_MS + 30);
    var x = from + Math.min(hop, 2) * dist, f = 0;
    if (hop < 2) {
      var acc = 0;
      for (var i = 0; i < HOP.length; i++) {
        if (in_ < acc + HOP[i][1]) { f = HOP[i][0]; x += dist * (sumTo(i) + HOP[i][2] * (in_ - acc) / HOP[i][1]); break; }
        acc += HOP[i][1];
      }
      if (in_ >= HOP_MS) x = from + (hop + 1) * dist;
    }
    bird.x = x; bird.dir = u > 2 * (HOP_MS + 30) + 110 ? -1 : 1; bird.apply(); bird.setF(f);
    // it enters from the wings: clipped at the drawing's left edge until it is on the table
    var cut = Math.max(0, -x / 7 * 100);
    bird.el.style.clipPath = cut ? (bird.dir > 0 ? 'inset(-60% ' + cut.toFixed(1) + '% -10% -60%)' : 'inset(-60% -60% -10% ' + cut.toFixed(1) + '%)') : 'none';
  }
  function sumTo(i) { var s = 0; for (var k = 0; k < i; k++) s += HOP[k][2]; return s; }

  // Returning visit: the desk is present with its camera papered over; the pen draws the camera back
  // in, then the paper patch lifts and the raster camera takes over.
  var patch = document.createElement('div');
  patch.className = 'cam-patch'; patch.setAttribute('aria-hidden', 'true');
  desk.appendChild(patch);
  function returningScene(t) {
    var a = P.clamp((t - S.xf) / S.xfDur);
    if (decoded.scene && !pending.scene) {
      R.scene.style.opacity = 1;
      var v = 1 - P.clamp((a - .35) / .65);
      art.layers.scene.style.opacity = v >= 1 ? '' : v.toFixed(3);
      art.layers.scene.classList.toggle('gone', v <= 0);
      patch.style.opacity = 1 - Math.min(1, a * 1.6);
    } else { R.scene.style.opacity = 0; patch.style.opacity = 0; pending.scene = true; }
  }

  // ---- player ----
  function frame(now) {
    var t = now - t0;
    if (skip) {
      var u = P.clamp((now - skip.w) / 250);
      t = skip.t + (S.end - skip.t) * (1 - Math.pow(1 - u, 2));
      if (u >= 1) t = S.end;
    }
    render(t);
    if (t < S.end) raf = requestAnimationFrame(frame);
    else land();
  }
  function prepare() {
    stop();
    lateAnims.forEach(cancelAnimationFrame); lateAnims = [];
    art.svg.style.display = '';
    landed = false; skip = null;
    root.classList.add('a10-op');
    S = Object.assign({}, T[mode]);
    pending = {};
    if (mode === 'returning' && !decoded.scene) {        // desk not decoded yet: show it traced, draw the camera
      S.draw = Object.assign({}, S.draw, { off: ['cat'], done: ['table', 'laptop', 'mug', 'book', 'portrait', 'plant'] });
    }
    P.plan(art, S.draw);
    S.camera = S.cam && mobile() ? Cam10a.make(host, art, S.cam) : null;
    host.style.transform = '';
    art.svg.style.setProperty('--u', (1448 / host.getBoundingClientRect().width).toFixed(3) + 'px');
    api.frameHeld = true; bird.held = true;
    if (S.bird == null) { bird.x = 14; bird.dir = -1; bird.apply(); bird.setF(0); bird.el.style.opacity = 1; }
    desk.classList.remove('steam-on');
    catcher.hidden = false;
  }
  function start() {
    prepare();
    t0 = performance.now();
    render(0);
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  function land() {
    stop();
    if (!S) S = Object.assign({}, T.first);
    if (!S.draw || !art.P) P.plan(art, S.draw);
    render(S.end);
    P.finish(art);
    patch.style.opacity = 0;
    host.style.transform = '';
    root.classList.remove('a10-op');
    catcher.hidden = true;
    api.frameHeld = false; api.setFrame(0);
    bird.held = false; bird.x = 14; bird.dir = -1; bird.apply(); bird.setF(0); bird.el.style.opacity = 1; bird.el.style.clipPath = 'none';
    desk.classList.add('steam-on');
    landed = true;
  }
  function doSkip() {
    if (!raf || skip) return;
    var t = performance.now() - t0;
    skip = { w: performance.now(), t: Math.min(t, S.end) };
  }
  // Reduced motion: no opener at all. The desk simply appears (the raster shows as soon as it loads).
  function still() {
    stop(); S = Object.assign({}, T.first); P.plan(art, S.draw);
    ['scene', 'book', 'frame'].forEach(function (k) { setRaster(k, 1); pending[k] = false; });
    art.svg.style.display = 'none';
    land();
    art.svg.style.display = 'none';
  }
  function run() { if (reduced()) still(); else start(); }

  // skip: click / tap / any key / wheel fast-forward to the end state
  ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(function (ev) {
    addEventListener(ev, function (e) {
      var inCtl = e.target.closest && e.target.closest('.ctl');        // the mockup strip keeps its own clicks and keys
      if (inCtl && (ev !== 'keydown' || /^(Enter| |Tab)$/.test(e.key))) return;
      doSkip();
    }, { passive: true });
  });
  addEventListener('resize', function () { if (raf && S.camera) doSkip(); });

  // ---- mockup control strip ----
  var ctl = document.getElementById('ctl'), rmBox = document.getElementById('rm');
  rmBox.checked = sessionStorage.getItem('mock-rm') === '1';
  root.classList.toggle('rm', rmBox.checked);
  function syncCtl() { ctl.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mode === mode); }); }
  ctl.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.act === 'replay') run();
    if (b.dataset.act === 'skip') doSkip();
    if (b.dataset.mode) { mode = b.dataset.mode; syncCtl(); run(); }
  });
  rmBox.addEventListener('change', function () {
    sessionStorage.setItem('mock-rm', rmBox.checked ? '1' : '0');
    root.classList.toggle('rm', rmBox.checked);
    run();
  });
  syncCtl();

  window.op10a = { art: art, run: run, skip: doSkip, seek: function (t, m) { if (m) { mode = m; syncCtl(); } prepare(); render(t); }, land: land, state: function () { return { mode: mode, landed: landed, decoded: decoded }; } };
  if (qs.get('autoplay') === '0') still(); else run();
})();
