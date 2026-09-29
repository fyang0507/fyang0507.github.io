/* 10c · sequencer — 日常 OP → 过场. A held-pose clock (12 fps, hard cuts, no tweens) plays the manic OP; then a
   hard cut to the eyecatch (cream, one mug, a lockup whose ep. number is the visitor's real visit count) that
   holds still; then the camera pulls back from the mug and the desk arrives around it. The pull-back is the
   only continuous motion in the piece (physics clock: a camera with mass), and it waits for the desk to decode.
   Window.OC exposes play / skip / seek (seek renders any instant deterministically, for contact sheets). */
(function () {
  var TICK = 1000 / 12, SKIP = 250;
  // hold = eyecatch stillness; pull = camera move; cap = latest start of the pull, decoded or not (keeps
  // the whole thing ≤ 3.5 s first visit, ≤ 0.9 s returning even on a cold cache).
  var MODES = {
    first: { list: OCShots.FIRST, hold: 520, pull: 760, cap: 2700 },
    returning: { list: OCShots.RETURNING, hold: 190, pull: 240, cap: 640 }
  };
  var GEO = { x: 330, y: 606, w: 200, h: 158 }, DW = 1448;          // the mug in desk-image px (tools/10c-cut.py)
  var html = document.documentElement, q = new URLSearchParams(location.search);
  var stage = document.getElementById('oc-stage'), eye = document.getElementById('oc-eye');
  var mug = eye.querySelector('.oc-mug'), lock = eye.querySelector('.oc-lock'), epEl = eye.querySelector('.t-ep');
  var home = document.getElementById('home'), ctl = document.getElementById('oc-ctl'), rmBox = document.getElementById('oc-rm');
  var desk = HomeDesk.build(document.getElementById('deskbox'), {});
  var run = null, raf = 0;
  function now() { return performance.now(); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // A real visit count: one per page load, never per replay.
  var visits = 1;
  try { visits = (parseInt(localStorage.getItem('fy-visits'), 10) || 0) + 1; localStorage.setItem('fy-visits', visits); } catch (e) {}
  var mode = /^(first|returning)$/.test(q.get('mode')) ? q.get('mode') : (visits > 1 ? 'returning' : 'first');

  // Honest wait: the pull-back reveals the desk, so it waits for the desk's own pixels (the scene and the two
  // sprites drawn over it). The OP's cut-outs decode ahead too, so no cut ever lands on a half-decoded frame.
  var decoded = false;
  function decode(u) { var im = new Image(); im.src = u; return im.decode().catch(function () {}); }
  var deskReady = Promise.all(['../../assets/desk-scene2-light.png', '../../assets/book-flip2-light.png', '../../assets/frame-exp3-light.png'].map(decode))
    .then(function () { decoded = true; if (run && run.decodedAt == null) run.decodedAt = now() - run.t0; });
  ['assets-gen/10c-laptop.webp', 'assets-gen/10c-camera.webp', 'assets-gen/10c-me.webp', 'assets-gen/10c-book.webp', 'assets-gen/10c-mug.webp'].forEach(decode);

  function bez(x1, y1, x2, y2) {
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      for (var t = x, i = 0; i < 8; i++) {
        var e = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x;
        var d = 3 * x1 * (1 - t) * (1 - t) + 6 * (x2 - x1) * t * (1 - t) + 3 * (1 - x2) * t * t;
        if (Math.abs(d) < 1e-6) break;
        t = Math.min(1, Math.max(0, t - e / d));
      }
      return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
    };
  }
  var DOLLY = bez(.52, 0, .1, 1), IRIS = bez(.3, 0, .25, 1), SNAP = bez(.2, .6, .2, 1);

  // Camera: the eyecatch is the live page, scaled about its mug. Measured on the untransformed layout.
  function measure() {
    var t = home.style.transform, c = home.style.clipPath;
    home.style.transform = ''; home.style.clipPath = '';
    var W = innerWidth, H = innerHeight, port = W / H < 5 / 6;
    var hb = home.getBoundingClientRect(), db = desk.el.getBoundingClientRect(), sc = db.width / DW;
    var mw = GEO.w * sc, mh = GEO.h * sc, ml = db.left - hb.left + GEO.x * sc, mt = db.top - hb.top + GEO.y * sc;
    var S = (port ? W * .5 : Math.min(W * .19, H * .3)) / mw, cx = W / 2, cy = port ? H * .41 : H * .42;
    var mx = ml + mw / 2, my = mt + mh / 2;
    run.cam = { hx: hb.left, hy: hb.top, ml: ml, mt: mt, mw: mw, mh: mh, mx: mx, my: my, S: S,
      tx: cx - hb.left - S * mx, ty: cy - hb.top - S * my, r0: Math.hypot(mw, mh) * .3,
      R: Math.max(Math.hypot(mx, my), Math.hypot(hb.width - mx, my), Math.hypot(mx, hb.height - my), Math.hypot(hb.width - mx, hb.height - my)) + 20 };
    mug.style.width = mw + 'px'; mug.style.height = mh + 'px';
    lock.style.top = (cy + S * mh / 2 + (port ? 34 : 40)) + 'px';
    home.style.transform = t; home.style.clipPath = c;
  }
  function camera(e, ce) {
    var c = run.cam, S = c.S + (1 - c.S) * e, tx = c.tx * (1 - e), ty = c.ty * (1 - e);
    home.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + S.toFixed(4) + ')';
    home.style.clipPath = 'circle(' + (ce == null ? 0 : c.r0 + (c.R - c.r0) * ce).toFixed(1) + 'px at ' + c.mx.toFixed(1) + 'px ' + c.my.toFixed(1) + 'px)';
    mug.style.transform = 'translate(' + (c.hx + tx + S * c.ml).toFixed(2) + 'px,' + (c.hy + ty + S * c.mt).toFixed(2) + 'px) scale(' + S.toFixed(4) + ')';
  }

  function start(m, frozen) {
    if (run) finish(true);
    var M = MODES[m];
    html.classList.add('oc-on');
    window.scrollTo(0, 0);
    desk.bird.held = true;
    var shots = OCShots.build(stage, M.list), ticks = 0;
    shots.forEach(function (s) { s.at = ticks; ticks += s.ticks; });
    run = { m: m, M: M, shots: shots, opEnd: ticks * TICK, t0: now(), decodedAt: decoded ? 0 : null, pullAt: null,
      seg: null, cur: -1, on: null, phase: 'op', drew: false, frozen: !!frozen, e: 0, ce: 0 };
    epEl.textContent = 'ep.' + pad(m === 'first' ? 1 : Math.max(2, visits));
    stage.classList.remove('off'); eye.classList.remove('on', 'pulling');
    measure();
    listen(true);
    if (!frozen) raf = requestAnimationFrame(step);
    render(0);
  }
  // The clock starts once the page has actually painted (a cold load can hold the first paint ~200 ms behind
  // render-blocking CSS while rAF already runs), so page-load work never eats a shot; 600 ms fallback. During
  // the OP a stall slips the clock instead of dropping poses: a held-pose clock may run late, never skip a beat.
  function painted() { return !performance.getEntriesByType || performance.getEntriesByType('paint').length > 0; }
  function step() {
    if (!run) return;
    var r = run, t = now();
    if (!r.started) {
      if (!painted() && t - r.t0 < 600) { raf = requestAnimationFrame(step); return; }
      r.started = true; r.t0 = t;
    }
    else if (r.phase === 'op' && t - r.last > TICK * 1.5) r.t0 += t - r.last - TICK;
    r.last = t;
    render(t - r.t0);
    if (run) raf = requestAnimationFrame(step);
  }

  function shot(t) {
    var r = run, tick = Math.floor(t / TICK);
    if (tick === r.cur) return;
    r.cur = tick;
    for (var i = r.shots.length - 1; i > 0 && r.shots[i].at > tick; i--);
    var s = r.shots[i];
    s.el.dataset.f = s.from + tick - s.at;
    if (r.on !== s) { if (r.on) r.on.el.classList.remove('on'); s.el.classList.add('on'); r.on = s; }
  }
  function toEye() {
    run.phase = 'eye';
    stage.classList.add('off');
    eye.classList.add('on');
    camera(0, null);
  }

  function render(t) {
    var r = run;
    if (r.phase === 'op') { if (t < r.opEnd) { shot(t); return; } toEye(); }
    if (!r.seg) {
      if (r.pullAt == null) {
        var at = Math.min(r.decodedAt == null ? Infinity : Math.max(r.opEnd + r.M.hold, r.decodedAt), r.M.cap);
        if (t < at) return;                                  // the eyecatch: nothing happens
        r.pullAt = at;
      }
      r.seg = { t0: r.pullAt, dur: r.M.pull, e0: 0, ce0: 0, ease: DOLLY };
      eye.classList.add('pulling');
    }
    var g = r.seg, k = Math.min(1, (t - g.t0) / g.dur);
    r.e = g.e0 + (1 - g.e0) * g.ease(k);
    r.ce = g.ce0 + (1 - g.ce0) * IRIS(Math.min(1, k / .8));
    camera(r.e, r.ce);
    if (k >= .7 && !r.drew) { r.drew = true; desk.replayDraw(); }  // the pen annotates the desk as it settles
    if (k >= 1) finish();
  }

  // Skip: any click / tap / key / wheel. Not a jump cut — the camera snaps back from wherever it is in 250 ms.
  function skip() {
    var r = run;
    if (!r || r.skipped || r.frozen) return;
    r.skipped = true;
    var t = now() - r.t0;
    if (r.phase === 'op') toEye();
    eye.classList.add('pulling');
    r.seg = { t0: t, dur: SKIP, e0: r.e, ce0: r.ce, ease: SNAP };
    r.pullAt = t;
  }
  function onInput(e) {
    if (e.target && e.target.closest && e.target.closest('#oc-ctl')) return;
    skip();
  }
  function listen(on) {
    var f = on ? addEventListener : removeEventListener;
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { f(ev, onInput, { passive: true }); });
  }

  function finish(silent) {
    var r = run;
    run = null;
    cancelAnimationFrame(raf);
    listen(false);
    home.style.transform = ''; home.style.clipPath = '';
    eye.classList.remove('on', 'pulling');
    stage.innerHTML = ''; stage.classList.remove('off');
    html.classList.remove('oc-on');
    desk.bird.held = false;
    if (!silent && r && !r.drew) desk.replayDraw();
    if (!decoded && !desk.el.querySelector('.oc-standin')) {       // capped before the scene decoded: the mug
      var m = mug.cloneNode(); m.className = 'oc-standin'; m.removeAttribute('style');   // stays until it does
      m.style.cssText = 'left:' + GEO.x / DW * 100 + '%;top:' + GEO.y / 1086 * 100 + '%;width:' + GEO.w / DW * 100 + '%';
      desk.el.appendChild(m);
      deskReady.then(function () { m.remove(); });
    }
    if (r && !r.frozen) document.dispatchEvent(new CustomEvent('oc:done', { detail: { mode: r.m, ms: Math.round(now() - r.t0),
      eyecatch: Math.round(r.opEnd), pull: r.pullAt == null ? null : Math.round(r.pullAt), decoded: r.decodedAt == null ? null : Math.round(r.decodedAt), skipped: !!r.skipped, silent: !!silent } }));
  }

  addEventListener('resize', function () {
    if (!run) return;
    run.shots.forEach(function (s, i) { s.el.remove(); });
    var fresh = OCShots.build(stage, run.M.list);
    fresh.forEach(function (s, i) { s.at = run.shots[i].at; });
    run.shots = fresh; run.on = null; run.cur = -1;
    measure();
    if (run.phase !== 'op') camera(run.e, run.seg ? run.ce : null);
  });

  // ---- mockup controls ----
  function syncCtl() {
    ctl.querySelectorAll('[data-m]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === mode); });
    rmBox.checked = html.classList.contains('rm');
  }
  function play() { if (Pen.reduced()) { if (run) finish(); return; } start(mode); }
  ctl.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.a === 'replay') play();
    else if (b.dataset.a === 'skip') skip();
    else if (b.dataset.m) { mode = b.dataset.m; syncCtl(); play(); }
  });
  rmBox.addEventListener('change', function () {
    html.classList.toggle('rm', rmBox.checked);
    try { sessionStorage.setItem('mock-rm', rmBox.checked ? '1' : '0'); } catch (e) {}
    if (rmBox.checked && run) finish();
  });
  syncCtl();

  window.OC = {
    play: function (m) { if (m) mode = m; syncCtl(); play(); },
    skip: skip,
    // Render mode m at time t (ms) without the clock, the desk treated as decoded. Seeking backwards restarts.
    seek: function (m, t) {
      if (!run || !run.frozen || run.m !== m || t < run.lastSeek) start(m, true);
      run.decodedAt = 0; run.lastSeek = t;
      render(t);
      return run ? { phase: run.phase, pullAt: run.pullAt, e: run.e } : { phase: 'done' };
    },
    info: function () { return run && { m: run.m, opEnd: run.opEnd, pullAt: run.pullAt, phase: run.phase }; }
  };
  if (html.classList.contains('oc-on')) start(mode);
})();
