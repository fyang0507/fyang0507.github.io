/* 06-gallery.js — board wiring: builds the four stages from real FY_PHOTOS and hooks up replays. */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var pick = G06.pick;
  var POOL = {
    A: [94, 5, 82, 102, 29, 97, 9, 70, 26, 99, 46, 105, 1, 66, 33, 86, 61, 100, 13, 55, 88, 24, 76, 95],
    B: [14, 34, 11, 63, 85, 7, 31, 58, 25, 104, 42, 17],
    C: [81, 96, 54, 89, 45, 30, 73, 6, 20, 53, 107, 50]
  };
  function narrow() { return innerWidth < 760; }
  function opts(seed, extra) {
    var n = narrow();
    return Object.assign({ cardW: n ? 124 : 148, pad: n ? 5 : 6, cap: n ? 13.5 : 15, meta: n ? 9 : 10, margin: n ? 16 : 30, seed: seed }, extra);
  }
  function perLine(rack) { var cw = narrow() ? 124 : 148; return Math.max(1, Math.min(6, Math.floor((rack.clientWidth - 40) / (cw + 22)))); }
  function lineHost(rack) { var d = document.createElement('div'); d.className = 'line-host'; rack.appendChild(d); return d; }

  /* ---- A · develop, plus the next line strung on approach ---- */
  var A = { rack: $('#rack-a'), end: $('#end-a'), slow: $('#slow-a'), lines: [], busy: false, max: 4 };
  function buildA(forget) {
    A.lines.forEach(function (l) { l.destroy(); }); A.rack.innerHTML = ''; A.lines = []; A.busy = false;
    if (A.dev) A.dev.drop();
    if (forget) try { sessionStorage.removeItem('fy06-dev-A'); } catch (e) { /* ignore */ }
    A.dev = new G06.Develop('fy06-dev-A', { slow: function (id) { return A.slow.checked ? 250 + Math.round(Pen.rng('slow' + id)() * 2400) : 0; } });
    A.pool = pick(POOL.A); A.per = perLine(A.rack); A.used = 0;
    addA(false); addA(false);
  }
  function addA(animated, done) {
    var chunk = A.pool.slice(A.used, A.used + A.per);
    if (!chunk.length || A.lines.length >= A.max) return false;
    A.used += chunk.length;
    var line = new G06.Line(lineHost(A.rack), chunk, opts('a' + A.lines.length, { load: false, hidden: animated }));
    line.hangs.forEach(function (h) { A.dev.add(h); });
    A.lines.push(line);
    if (animated) line.string(done); else if (done) done();
    A.end.classList.toggle('full', A.lines.length >= A.max);
    return true;
  }
  // Stringing is caused by scrolling toward the end, never by a replay or a resize.
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (A.busy || A.end.getBoundingClientRect().top > innerHeight - 40) return;
      A.busy = true;
      if (!addA(true, function () { A.busy = false; })) A.busy = false;
    });
  }, { passive: true });
  A.slow.addEventListener('change', function () { buildA(true); });
  window.replayA = function () { buildA(true); };

  /* ---- B · rope and pendulums, moved by pointer velocity ---- */
  var B = { stage: $('#stage-b'), rack: $('#rack-b'), lines: [], last: null };
  function buildB() {
    B.lines.forEach(function (l) { l.destroy(); }); B.rack.innerHTML = ''; B.lines = [];
    var pool = pick(POOL.B), per = perLine(B.rack);
    for (var i = 0; i < 2; i++) B.lines.push(new G06.Line(lineHost(B.rack), pool.slice(i * per, i * per + per), opts('b' + i, { sizes: '148px' })));
  }
  function feed(x, y, t) {
    var p = B.last;
    if (p && t > p.t && t - p.t < 100) {
      var dt = (t - p.t) / 1000, vx = (x - p.x) / dt, vy = (y - p.y) / dt;
      B.lines.forEach(function (l) {
        var r = l.host.getBoundingClientRect();
        l.pointer(p.x - r.left, p.y - r.top, x - r.left, y - r.top, vx, vy);
      });
    }
    B.last = { x: x, y: y, t: t };
  }
  B.stage.addEventListener('pointermove', function (e) { feed(e.clientX, e.clientY, e.timeStamp); });
  B.stage.addEventListener('pointerleave', function () { B.last = null; });
  // Replay: a scripted flick that zig-zags across both ropes.
  window.replayB = function () {
    var r = B.rack.getBoundingClientRect(), t0 = performance.now(), T = 1100;
    B.last = null;
    (function f(now) {
      var k = Math.min(1, (now - t0) / T);
      feed(r.left + 30 + (r.width - 60) * k, r.top + r.height * (0.12 + 0.76 * k) + Math.sin(k * Math.PI * 5) * 70, now);
      if (k < 1) requestAnimationFrame(f); else B.last = null;
    })(t0);
  };
  var loopEl = $('#loop-b');
  G06.Sim.on(function (on) { loopEl.textContent = on ? 'rAF loop · running' : 'rAF loop · asleep'; loopEl.classList.toggle('on', on); });

  /* ---- C · unclip to view ---- */
  var C = { rack: $('#rack-c'), lines: [], viewer: new G06.Viewer() };
  function buildC() {
    C.lines.forEach(function (l) { l.destroy(); }); C.rack.innerHTML = ''; C.lines = []; C.viewer.clear();
    var pool = pick(POOL.C), per = perLine(C.rack);
    for (var i = 0; i < 2; i++) {
      var line = new G06.Line(lineHost(C.rack), pool.slice(i * per, i * per + per), opts('c' + i, {
        sizes: '148px', onOpen: function (l, j) { C.viewer.open(l, j); } }));
      C.lines.push(line); C.viewer.add(line);
    }
  }
  window.replayC = function () {
    if (C.viewer.isOpen) return;
    C.viewer.open(C.lines[0], 1);
    setTimeout(function () { C.viewer.go(1); }, 1900);
    setTimeout(function () { C.viewer.close(); }, 3800);
  };

  /* ---- D · the 390px proposal ---- */
  var D = new G06.Mobile($('#stage-d'));
  window.replayD = function () { D.reset(); };

  buildA(false); buildB(); buildC();

  var lastW = innerWidth, lastN = narrow(), tm = 0;
  window.addEventListener('resize', function () {
    clearTimeout(tm);
    tm = setTimeout(function () {
      if (innerWidth === lastW) return;
      lastW = innerWidth; buildA(false); buildB(); buildC();
      if (narrow() !== lastN) { lastN = narrow(); D.reset(); }
    }, 220);
  });
  document.addEventListener('mock:rm', function () { buildA(false); buildB(); buildC(); D.reset(); });
})();
