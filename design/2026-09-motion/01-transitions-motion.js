/* 01 · transitions — the physics clock.
   A damped spring (mass, stiffness, damping) is integrated once and then either sampled into WAAPI
   keyframes or flattened into a CSS linear() easing — the same curve production would ship inside
   ::view-transition-group rules. Nothing here runs per frame after an animation is handed to the browser. */
(function () {
  function spring(o) {
    o = o || {};
    var k = o.k || 170, c = o.c || 24, m = o.m || 1, x = 0, v = 0, dt = 1 / 240, t = 0, pts = [0];
    for (var i = 0; i < 2400; i++) {
      var a = (-k * (x - 1) - c * v) / m; v += a * dt; x += v * dt; t += dt; pts.push(x);
      if (t > 0.08 && Math.abs(x - 1) < 0.0015 && Math.abs(v) < 0.02) break;
    }
    return { pts: pts, dt: dt, dur: t * 1000 };
  }
  // value of the spring at ms (clamped to its rest value after it settles)
  function at(s, ms) {
    if (ms <= 0) return 0;
    var i = ms / 1000 / s.dt;
    if (i >= s.pts.length - 1) return 1;
    var i0 = Math.floor(i), f = i - i0;
    return s.pts[i0] + (s.pts[i0 + 1] - s.pts[i0]) * f;
  }
  // first time the spring reaches `level` (the moment of "arrival", before the overshoot settles)
  function reach(s, level) {
    for (var i = 0; i < s.pts.length; i++) if (s.pts[i] >= level) return i * s.dt * 1000;
    return s.dur;
  }
  var HAS_LINEAR = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timing-function', 'linear(0, 1)');
  function ease(o, n) {
    var s = spring(o); n = n || 48;
    if (!HAS_LINEAR) return { easing: 'cubic-bezier(.34,1.36,.5,1)', duration: Math.round(s.dur * 0.8) };
    var out = [];
    for (var i = 0; i <= n; i++) out.push(Math.round(at(s, s.dur * i / n) * 1000) / 1000);
    return { easing: 'linear(' + out.join(', ') + ')', duration: Math.round(s.dur) };
  }

  function smooth(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function done(anim) { return anim ? anim.finished.catch(function () {}) : Promise.resolve(); }
  // animate and keep the end state until someone commits the real state and cancels
  function play(el, kf, o) {
    o = Object.assign({ fill: 'both' }, o || {});
    return el.animate(kf, o);
  }
  function fadeIn(el, delay, dur) { return el ? play(el, [{ opacity: 0 }, { opacity: 1 }], { delay: delay || 0, duration: dur || 220, easing: 'ease-out' }) : null; }
  function fadeOut(el, delay, dur) { return el ? play(el, [{ opacity: 1 }, { opacity: 0 }], { delay: delay || 0, duration: dur || 180, easing: 'ease-in' }) : null; }

  // quadratic Bézier point (extrapolates past t=1, so a spring overshoot continues along the landing direction)
  function bez(p0, p1, p2, t) {
    var u = 1 - t;
    return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
  }

  window.Motion = { spring: spring, at: at, reach: reach, ease: ease, smooth: smooth, lerp: lerp, sleep: sleep, done: done, play: play, fadeIn: fadeIn, fadeOut: fadeOut, bez: bez };
})();
