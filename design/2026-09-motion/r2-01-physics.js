/* r2-01 · the physics clock, integrated by hand so every transition can be interrupted and retargeted.
   Everything that moves is a Chan (one number heading for a target) or a Body (a drawing carried along a
   quadratic arc by a Chan). Nothing here knows about the desk; r2-01-a.js decides what moves where.
   Kinds of Chan:
     spring {k, c, m}   mass on a spring: one small overshoot, then settle (paper, chrome, carried objects)
     fall   {g, e}      constant pull toward the target that bounces off it with restitution e (gravity onto a floor)
     chase  {k, c, m, dur} a spring chasing a target that eases from→to over dur (carried objects)
     tween  {dur, ease} time-based, for the pen: one confident pass, retracted faster than it drew
   A Chan keeps its value and velocity when retargeted, so a reversal mid-flight has no seam. */
(function () {
  var DT = 1 / 240;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  // CSS cubic-bezier(x1, y1, x2, y2) as a function of t
  function cubic(x1, y1, x2, y2) {
    function b(a1, a2, t) { var u = 1 - t; return 3 * u * u * t * a1 + 3 * u * t * t * a2 + t * t * t; }
    return function (x) {
      var lo = 0, hi = 1, t = x;
      for (var i = 0; i < 22; i++) { var bx = b(x1, x2, t); if (Math.abs(bx - x) < 1e-5) break; if (bx < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      return b(y1, y2, t);
    };
  }
  var EASE = {
    pen: cubic(0.55, 0.1, 0.25, 1),               // a stroke: quick start, decelerating landing (shared/mock.css --ease-pen)
    retract: cubic(0.4, 0, 0.8, 0.4),
    inout: cubic(0.45, 0, 0.55, 1),
    pick: cubic(0.25, 0.1, 0.25, 1),               // the object your hand took: it answers the click at once
    out: function (t) { return 1 - Math.pow(1 - t, 3); },
    in: function (t) { return t * t; },
    lin: function (t) { return t; }
  };
  // quadratic Bézier; past t=1 it continues along the landing tangent, so an overshoot keeps its direction
  function bez(p0, p1, p2, t) {
    if (t > 1) { var e = bez(p0, p1, p2, 1), d = { x: 2 * (p2.x - p1.x), y: 2 * (p2.y - p1.y) }; return { x: e.x + d.x * (t - 1), y: e.y + d.y * (t - 1) }; }
    var u = 1 - t;
    return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
  }

  function Chan(x) { this.x = x; this.v = 0; this.to = x; this.wait = 0; this.kind = null; this.o = null; this.t = 0; this.from = x; this.idle = true; }
  Chan.prototype.go = function (to, kind, o, wait, v0) {
    var moving = !this.idle && this.wait <= 0 && Math.abs(this.v) > 1e-3;
    this.to = to; this.kind = kind; this.o = o || {}; this.wait = moving ? 0 : (wait || 0) / 1000;   // never freeze what is moving
    this.t = 0; this.from = this.x; this.idle = false; this.landed = false; this.dir = 0;
    if (v0 != null) this.v0 = v0; else this.v0 = null;
    return this;
  };
  Chan.prototype.set = function (x) { this.x = this.to = this.from = x; this.v = 0; this.idle = true; this.kind = null; return this; };
  Chan.prototype.step = function (dt) {
    if (this.idle) return;
    if (this.wait > 0) { this.wait -= dt; if (this.wait > 0) return; dt = -this.wait; this.wait = 0; }
    if (this.v0 != null) { this.v = this.v0; this.v0 = null; }
    var o = this.o, d = this.to - this.x;
    if (this.kind === 'tween') {
      this.t += dt;
      var p = clamp(this.t / (o.dur / 1000), 0, 1), prev = this.x;
      this.x = lerp(this.from, this.to, (EASE[o.ease] || EASE.out)(p));
      this.v = (this.x - prev) / dt;
      if (p >= 1) { this.x = this.to; this.v = 0; this.idle = true; this.landed = true; }
      return;
    }
    if (this.kind === 'fall') {
      var dir = this.dir || (this.dir = d >= 0 ? 1 : -1);
      this.v += (o.g || 10) * dir * dt; this.x += this.v * dt;
      if ((this.x - this.to) * dir >= 0) {            // contact
        this.landed = true;
        this.x = this.to;
        if (Math.abs(this.v) * (o.e || 0) < (o.vmin || 0.35)) { this.v = 0; this.idle = true; this.dir = 0; }
        else this.v = -this.v * o.e;
      }
      return;
    }
    // spring (sub-stepped for stability). 'chase' springs after a target that itself travels from→to over
    // dur on an ease-in-out: a gentle pick-up, a fast middle, and the spring's one overshoot on landing
    var k = o.k || 170, c = o.c || 22, m = o.m || 1, n = Math.max(1, Math.ceil(dt / DT)), h = dt / n, goal = this.to, moving = false;
    if (this.kind === 'chase') {
      this.t += dt;
      var q = clamp(this.t / (o.dur / 1000), 0, 1);
      goal = lerp(this.from, this.to, (EASE[o.ease] || EASE.inout)(q)); moving = q < 1;
    }
    for (var i = 0; i < n; i++) { var a = (-k * (this.x - goal) - c * this.v) / m; this.v += a * h; this.x += this.v * h; }
    if (!this.landed && (this.to - this.from) * (this.x - this.to) >= 0) this.landed = true;
    if (!moving && Math.abs(this.x - this.to) < (o.eps || 0.0008) && Math.abs(this.v) < (o.veps || 0.01)) { this.x = this.to; this.v = 0; this.idle = true; }
  };

  // A drawing carried from A to B: position along an arc (p) and its scale (q, 0 = s0, 1 = s1), each its own Chan.
  // bo is a bounce offset (px) that only a thrown body uses once it hits the floor.
  function Body() { this.p = new Chan(1); this.q = new Chan(1); this.bo = new Chan(0); this.P0 = this.P1 = this.P2 = { x: 0, y: 0 }; this.s0 = this.s1 = 1; this.vx = this.vy = 0; this.last = null; }
  Body.prototype.moving = function () { return Math.abs(this.vx) + Math.abs(this.vy) > 40; };
  Body.prototype.pos = function () { var P = bez(this.P0, this.P1, this.P2, Math.max(this.p.x, -0.2)); return { x: P.x, y: P.y + this.bo.x }; };
  Body.prototype.scale = function () { return lerp(this.s0, this.s1, this.q.x); };
  Body.prototype.place = function (P, s) { this.P0 = this.P1 = this.P2 = P; this.s0 = this.s1 = s; this.p.set(1); this.q.set(1); this.bo.set(0); this.thrown = null; this.vx = this.vy = 0; this.last = P; };
  // start a new carry from wherever the body is now; apex is the arc's control point
  // a body already in flight keeps its momentum: its velocity, projected on the new arc, seeds the progress
  Body.prototype.carry = function (P2, s1, apex, pk, po, qk, qo, wait) {
    var P0 = this.pos(), s0 = this.scale(), P1 = apex(P0), dx = P1.x - P0.x, dy = P1.y - P0.y, mv = this.moving();
    var v0 = mv ? (this.vx * dx + this.vy * dy) / Math.max(1, 2 * (dx * dx + dy * dy)) : 0;
    this.P0 = P0; this.P1 = P1; this.P2 = P2; this.s0 = s0; this.s1 = s1;
    this.p.set(0); this.q.set(0); this.bo.set(0); this.thrown = null;
    this.p.go(1, pk, po, mv ? 0 : wait, v0); this.q.go(1, qk, qo, mv ? 0 : wait);
    return this;
  };
  // a real throw under gravity g (px/s²): hop h px up out of where it is, land on P2, bounce with restitution e.
  // A quadratic Bézier walked at constant rate is exactly a parabola, so p is linear in time.
  // room: how far it may rise before leaving the frame (a thrown object never exits the top of the page)
  Body.prototype.throwTo = function (P2, s1, g, h, e, wait, room) {
    var P0 = this.pos(), s0 = this.scale(), dy = P2.y - P0.y, mv = this.moving();
    var vy0 = Math.min(-Math.sqrt(2 * g * Math.max(h, 0)), mv ? this.vy : 0);   // still rising? it keeps rising first
    if (room != null) vy0 = Math.max(vy0, -Math.sqrt(2 * g * Math.max(h, room)));
    if (mv) wait = 0;
    var T = (-vy0 + Math.sqrt(vy0 * vy0 + 2 * g * Math.max(dy, 1))) / g;
    this.P0 = P0; this.P1 = { x: (P0.x + P2.x) / 2, y: P0.y + vy0 * T / 2 }; this.P2 = P2; this.s0 = s0; this.s1 = s1;
    this.p.set(0); this.q.set(0); this.bo.set(0);
    this.p.go(1, 'tween', { dur: T * 1000, ease: 'lin' }, wait); this.q.go(1, 'tween', { dur: T * 900, ease: 'inout' }, wait);
    this.thrown = { g: g, e: e, v: vy0 + g * T };
    return T;
  };
  Body.prototype.step = function (dt) {
    this.p.step(dt); this.q.step(dt); this.bo.step(dt);
    if (this.thrown && this.p.idle) {                 // floor contact: bounce off it, a little less each time
      this.bo.set(0); this.bo.go(0, 'fall', { g: this.thrown.g, e: this.thrown.e, vmin: 40 }, 0, -this.thrown.v * this.thrown.e);
      this.thrown = null;
    }
    var P = this.pos();
    if (this.last && dt > 0) { this.vx = lerp(this.vx, (P.x - this.last.x) / dt, 0.35); this.vy = lerp(this.vy, (P.y - this.last.y) / dt, 0.35); }
    this.last = P;
  };
  Body.prototype.idle = function () { return this.p.idle && this.q.idle && this.bo.idle && !this.thrown; };

  // A clock that can run on rAF or be stepped by hand (the verifier seeks to exact milliseconds).
  function Clock(tick) { this.tick = tick; this.on = false; this.manual = false; this.speed = 1; this.raf = 0; this.last = 0; }
  Clock.prototype.start = function () {
    if (this.on || this.manual) { this.on = true; return; }
    this.on = true; this.last = performance.now();
    var self = this;
    var loop = function (now) {
      if (!self.on || self.manual) { self.raf = 0; return; }
      var dt = Math.min(0.05, (now - self.last) / 1000) * self.speed; self.last = now;
      if (self.tick(dt) === false) { self.on = false; self.raf = 0; return; }
      self.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  };
  Clock.prototype.advance = function (ms) {       // manual stepping in 1/60 s frames
    var n = Math.round(ms / (1000 / 60));
    for (var i = 0; i < n && this.on; i++) if (this.tick(1 / 60) === false) this.on = false;
  };

  window.Phys = { Chan: Chan, Body: Body, Clock: Clock, bez: bez, clamp: clamp, lerp: lerp, smooth: smooth, cubic: cubic, EASE: EASE };
})();
