/* motion.js — the site's two clocks, shared by every page. Loaded parser-blocking in each <head>
   (transitions.js needs it before pagereveal), so loading it only defines window.Motion.

   Drawings move on the hand's clock: held key poses and stepped keyframes (held()). Paper and chrome
   move on the physics clock: springs with mass, one small overshoot, then settle (Spring, pendulum,
   springEase). Every loop sleeps when nothing moves (Loop), and reduced motion is one media query
   (reduced / onReduced): turning it on finishes every running tween and play() at once.

   Contract (PORT-PLAN §1): reduced onReduced clamp lerp smooth cubic EASE Spring Loop tween
   springEase play held Velocity pendulum. */
(function () {
  'use strict';

  /* ---- reduced motion ---- */
  var mq = matchMedia('(prefers-reduced-motion: reduce)'), rmFns = [];
  function reduced() { return mq.matches; }
  function onReduced(fn) {
    rmFns.push(fn);
    return function () { var i = rmFns.indexOf(fn); if (i > -1) rmFns.splice(i, 1); };
  }
  function rmChanged() {
    var on = reduced();
    if (on) { tween.finish(); live.forEach(function (a) { try { a.finish(); } catch (e) { /* already gone */ } }); }
    rmFns.slice().forEach(function (fn) { try { fn(on); } catch (e) { setTimeout(function () { throw e; }); } });
  }
  mq.addEventListener('change', rmChanged);

  /* ---- numbers ---- */
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  // smooth(t): smoothstep on 0..1. smooth(a, b, t): 0 before a, 1 after b, smoothstep between.
  function smooth(a, b, t) {
    if (b === undefined) { t = a; a = 0; b = 1; }
    t = clamp((t - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  // cubic-bezier(x1, y1, x2, y2) as a function of progress, solved like the CSS curve.
  function cubic(x1, y1, x2, y2) {
    function c(t, a, b) { return ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t; }
    function d(t, a, b) { return 3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a; }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var t = x, i, s;
      for (i = 0; i < 6; i++) { s = d(t, x1, x2); if (Math.abs(s) < 1e-6) break; t -= (c(t, x1, x2) - x) / s; }
      if (!(t >= 0 && t <= 1) || Math.abs(c(t, x1, x2) - x) > 1e-3) {
        var lo = 0, hi = 1; t = x;
        for (i = 0; i < 24; i++) { if (c(t, x1, x2) < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      }
      return c(t, y1, y2);
    };
  }
  var CSS = {
    pen: 'cubic-bezier(.55,.1,.25,1)',     // a stroke: quick start, decelerating landing
    turn: 'cubic-bezier(.3,.25,.2,1)',     // the return stroke: the wrist is already moving
    lift: 'cubic-bezier(.4,0,.8,.4)',      // retract: the tail chasing the head off the end
    sink: 'cubic-bezier(.55,0,.8,.55)',    // a wash draining back into its line
    out: 'cubic-bezier(.2,.7,.2,1)',
    settle: 'cubic-bezier(.34,1.36,.5,1)'  // paper landing with one small overshoot
  };
  var EASE = { lin: function (t) { return t; }, css: CSS };
  Object.keys(CSS).forEach(function (k) { var n = CSS[k].slice(13, -1).split(',').map(Number); EASE[k] = cubic(n[0], n[1], n[2], n[3]); });

  /* ---- physics clock ---- */
  // A damped spring on one number: x (position), v (velocity), to (target). Spring({k,c}) or
  // Spring({f,zeta}) (Hz and damping ratio); {k,zeta} works too. Four semi-implicit substeps per step.
  function Spring(o) {
    if (!(this instanceof Spring)) return new Spring(o);
    o = o || {};
    this.x = o.x || 0; this.to = o.to == null ? this.x : o.to; this.v = o.v || 0; this.k = 100; this.c = 20;
    this.setK(o);
  }
  Spring.prototype.setK = function (k, c) {
    var o = typeof k === 'object' ? k : { k: k, c: c };
    if (o.f != null) { var w = 2 * Math.PI * o.f; this.k = w * w; this.c = 2 * (o.zeta == null ? 1 : o.zeta) * w; return this; }
    if (o.k != null) this.k = o.k;
    if (o.c != null) this.c = o.c; else if (o.zeta != null || o.k != null) this.c = 2 * (o.zeta == null ? 1 : o.zeta) * Math.sqrt(this.k);
    return this;
  };
  Spring.prototype.step = function (dt) {
    for (var i = 0, h = dt / 4; i < 4; i++) { this.v += (-this.k * (this.x - this.to) - this.c * this.v) * h; this.x += this.v * h; }
    return this;
  };
  Spring.prototype.rest = function (eps) { eps = eps || 0.001; return Math.abs(this.x - this.to) < eps && Math.abs(this.v) < eps * 8; };
  Spring.prototype.snap = function (x) { if (x != null) this.to = x; this.x = this.to; this.v = 0; return this; };

  // A damped pendulum, as the corkboard's cards hang: s = {phi, w, target}; o = {omega, zeta, F, sub}.
  // Returns whether it is still moving.
  function pendulum(s, dt, o) {
    var w = o.omega, z = o.zeta, F = o.F || 0, n = o.sub || 3, h = dt / n, to = s.target || 0;
    for (var i = 0; i < n; i++) { s.w += (-w * w * (s.phi - to) - 2 * z * w * s.w + F) * h; s.phi += s.w * h; }
    return Math.abs(s.phi - to) > (o.eps || 0.0012) || Math.abs(s.w) > (o.epsW || 0.01);
  }

  // Pointer velocity over the last ms of samples, zero if the pointer had stopped before letting go.
  // About uses Velocity(80); the corkboard Velocity(100, 90).
  function Velocity(ms, stale) {
    if (!(this instanceof Velocity)) return new Velocity(ms, stale);
    this.ms = ms || 80; this.stale = stale == null ? this.ms : stale; this.h = [];
  }
  Velocity.prototype.add = function (t, x, y) {
    this.h.push([t, x, y || 0]);
    while (this.h.length > 2 && t - this.h[0][0] > this.ms) this.h.shift();
    return this;
  };
  Velocity.prototype.get = function (now) {
    var h = this.h; if (h.length < 2) return [0, 0];
    var a = h[0], b = h[h.length - 1], span = (b[0] - a[0]) / 1000;
    if (span <= 0.008 || (now != null && now - b[0] >= this.stale)) return [0, 0];
    return [(b[1] - a[1]) / span, (b[2] - a[2]) / span];
  };
  Velocity.prototype.reset = function () { this.h = []; return this; };

  /* ---- the sleeping loop ---- */
  // tick(dt) returns true while something is still moving; the loop stops itself otherwise and costs
  // nothing until kick(). dt is in seconds, capped at .05 so a background tab can't fling anything.
  function Loop(tick) {
    if (!(this instanceof Loop)) return new Loop(tick);
    var self = this;
    this.id = 0; this.last = 0; this.want = false; this.parked = false;
    this.frame = function (t) {
      var dt = clamp((t - self.last) / 1000, 0.001, 0.05);
      self.last = t; self.id = 0;
      var go = tick(dt);
      if (go && !self.id && !self.parked) self.id = requestAnimationFrame(self.frame);
      else if (!go && !self.id) self.want = false;
    };
  }
  Loop.prototype.kick = function () {
    this.want = true;
    if (!this.id && !this.parked) { this.last = performance.now(); this.id = requestAnimationFrame(this.frame); }
    return this;
  };
  Loop.prototype.stop = function () { this.want = false; if (this.id) cancelAnimationFrame(this.id); this.id = 0; return this; };
  Object.defineProperty(Loop.prototype, 'running', { get: function () { return !!this.id; } });
  // Park the loop while el is off screen; a kick that arrives meanwhile runs when it comes back.
  // Returns a function that stops watching.
  Loop.visible = function (el, loop) {
    var io = new IntersectionObserver(function (es) {
      var on = es[es.length - 1].isIntersecting;
      loop.parked = !on;
      if (!on && loop.id) { cancelAnimationFrame(loop.id); loop.id = 0; }
      else if (on && loop.want) loop.kick();
    });
    io.observe(el);
    return function () { io.disconnect(); loop.parked = false; if (loop.want) loop.kick(); };
  };

  /* ---- tweens on the one shared loop ---- */
  // tween(obj, key, to, dur, delay, ease, done): obj[key] runs from wherever it is when the delay
  // ends to `to`. A new tween on the same key replaces the old one, so every reversal starts from the
  // current frame. If obj has a render() method it is called once per frame after its keys move.
  // Returns delay + dur (ms), for chaining by delay; 0 under reduced motion, which lands at once.
  var tw = [], tLoop = null;
  function paint(o) { if (typeof o.render === 'function') o.render(); }
  function tween(obj, key, to, dur, delay, ease, done) {
    tween.stop(obj, key);
    delay = delay || 0; dur = Math.max(1, dur || 0);
    if (reduced()) { obj[key] = to; paint(obj); if (done) done(); return 0; }
    tw.push({ o: obj, k: key, from: null, to: to, t0: performance.now() + delay, dur: dur, ease: ease || EASE.pen, done: done });
    (tLoop || (tLoop = new Loop(tickTweens))).kick();
    return delay + dur;
  }
  function tickTweens() {
    var now = performance.now(), touched = [], ended = [];
    tw.forEach(function (w) {
      if (now < w.t0) return;
      if (w.from === null) w.from = w.o[w.k];
      var p = (now - w.t0) / w.dur;
      if (p >= 1) { w.o[w.k] = w.to; ended.push(w); } else w.o[w.k] = w.from + (w.to - w.from) * w.ease(p);
      if (touched.indexOf(w.o) < 0) touched.push(w.o);
    });
    tw = tw.filter(function (w) { return ended.indexOf(w) < 0; });
    touched.forEach(paint);
    ended.forEach(function (w) { if (w.done) w.done(); });
    return tw.length > 0;
  }
  tween.stop = function (obj, key) { tw = tw.filter(function (w) { return !(w.o === obj && (key == null || w.k === key)); }); };
  tween.busy = function (obj) { return tw.some(function (w) { return w.o === obj; }); };
  // Jump running tweens (of obj, or all) to their ends, running their done callbacks in order.
  tween.finish = function (obj) {
    for (var guard = 0; guard < 8; guard++) {
      var mine = tw.filter(function (w) { return obj == null || w.o === obj; });
      if (!mine.length) break;
      tw = tw.filter(function (w) { return mine.indexOf(w) < 0; });
      mine.forEach(function (w) { w.o[w.k] = w.to; });
      mine.forEach(function (w) { paint(w.o); if (w.done) w.done(); });
    }
  };

  /* ---- WAAPI ---- */
  // A real spring (stiffness k, damping c, mass m) simulated once and baked into a CSS linear()
  // easing, so choreographed keyframes carry mass and one overshoot. springEase.duration() is how
  // long that spring takes to settle, in ms.
  var seCache = {};
  function springSim(k, c, m) {
    m = m || 1;
    var key = k + ',' + c + ',' + m;
    if (seCache[key]) return seCache[key];
    var x = 0, v = 0, dt = 1 / 1000, t = 0, next = 1 / 60, out = [0];
    for (var i = 0; i < 6000; i++) {
      v += ((k * (1 - x) - c * v) / m) * dt; x += v * dt; t += dt;
      if (t >= next - 1e-9) { out.push(+x.toFixed(4)); next += 1 / 60; if (Math.abs(1 - x) < 0.003 && Math.abs(v) < 0.05) break; }
    }
    out[out.length - 1] = 1;
    return (seCache[key] = { easing: 'linear(' + out.join(', ') + ')', duration: Math.round(t * 1000) });
  }
  function springEase(k, c, m) { return springSim(k, c, m).easing; }
  springEase.duration = function (k, c, m) { return springSim(k, c, m).duration; };

  // play(el, keyframes, {duration, delay, easing, spring:{k,c,m}, commit}): one WAAPI animation whose
  // end state is committed to inline style, so animations never stack. Returns a promise (with
  // .animation) that resolves when it has landed; reduced motion lands it at once.
  var live = new Set();
  function play(el, kf, o) {
    o = o || {};
    var sp = o.spring ? springSim(o.spring.k, o.spring.c, o.spring.m) : null, rm = reduced();
    var a = el.animate(kf, {
      duration: rm ? 1 : (o.duration || (sp && sp.duration) || 400), delay: rm ? 0 : (o.delay || 0),
      easing: sp ? sp.easing : (o.easing || CSS.out), fill: 'both'
    });
    live.add(a);
    var p = a.finished.then(function () {
      live.delete(a);
      if (o.commit !== false) { try { a.commitStyles(); } catch (e) { /* not rendered */ } a.cancel(); }
      return a;
    }, function () { live.delete(a); return a; });
    p.animation = a;
    return p;
  }
  // Keyframes on the hand's clock: each frame is held until the next (steps(1,end) per keyframe).
  // On the whole effect it would hold the first frame for the entire duration (the r4-05 fix).
  function held(frames) {
    return frames.map(function (f, i) {
      var o = {}; for (var k in f) o[k] = f[k];
      if (i < frames.length - 1) o.easing = 'steps(1, end)';
      return o;
    });
  }

  window.Motion = {
    reduced: reduced, onReduced: onReduced, clamp: clamp, lerp: lerp, smooth: smooth, cubic: cubic, EASE: EASE,
    Spring: Spring, Loop: Loop, tween: tween, springEase: springEase, play: play, held: held,
    Velocity: Velocity, pendulum: pendulum
  };
})();
