/* r2-02-anim.js — one ticker for every mark on board r2-02.
   Marks keep continuous state (how much of a line is drawn, how far a band has swept, how high it
   stands) and tween it. Any new instruction starts from the current frame, so a half-grown band
   sinks from half height rather than snapping. The loop runs only while something is moving. */
(function () {
  // cubic-bezier(x1,y1,x2,y2) solved numerically, same curves as the CSS in shared/mock.css.
  function bez(x1, y1, x2, y2) {
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

  var EASE = {
    pen: bez(.55, .1, .25, 1),     // a stroke: quick start, decelerating landing (Pen.draw)
    turn: bez(.3, .25, .2, 1),     // the return stroke: the wrist is already moving
    lift: bez(.4, 0, .8, .4),      // retract: the tail chasing the head off the end (Pen.erase)
    sink: bez(.55, 0, .8, .55),    // the wash draining back into the line
    lin: function (t) { return t; }
  };

  var live = [], raf = 0, speed = 1;
  function frame(t) {
    raf = 0;
    for (var i = live.length - 1; i >= 0; i--) if (!live[i].step(t)) live.splice(i, 1);
    if (live.length) raf = requestAnimationFrame(frame);
  }
  function wake(a) { if (live.indexOf(a) < 0) live.push(a); if (!raf) raf = requestAnimationFrame(frame); }

  // v: the state object (plain numbers). render: paints v. Durations are ms at 1× speed.
  function Anim(v, render) { this.v = v; this.render = render; this.tw = {}; }

  // Tween v[k] → to. Returns when it ends (delay + dur, in 1× ms) so callers can chain by delay.
  Anim.prototype.go = function (k, to, dur, delay, ease, done) {
    delete this.tw[k];
    delay = delay || 0;
    if (Pen.reduced()) { this.v[k] = to; this.render(); if (done) done(); return 0; }
    this.tw[k] = { from: null, to: to, t0: performance.now() + delay / speed, dur: Math.max(1, dur) / speed, ease: ease || EASE.pen, done: done };
    wake(this);
    return delay + dur;
  };
  Anim.prototype.busy = function () { for (var k in this.tw) return true; return false; };
  Anim.prototype.stop = function () { this.tw = {}; };
  // Jump every running tween to its end (reduced-motion switch flipped mid-gesture).
  Anim.prototype.finish = function () {
    var guard = 0;
    while (this.busy() && guard++ < 8) {
      var tw = this.tw; this.tw = {};
      for (var k in tw) { this.v[k] = tw[k].to; if (tw[k].done) tw[k].done(); }
    }
    this.render();
  };
  Anim.prototype.step = function (t) {
    var keys = Object.keys(this.tw);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], w = this.tw[k];
      if (!w || t < w.t0) continue;
      if (w.from === null) w.from = this.v[k];
      var p = (t - w.t0) / w.dur;
      if (p >= 1) { this.v[k] = w.to; delete this.tw[k]; if (w.done) w.done(); }
      else this.v[k] = w.from + (w.to - w.from) * w.ease(p);
    }
    this.render();
    return this.busy();
  };

  // Show the stretch [s, e] (fractions of length L) of a stroked path. Hidden strokes are also
  // visibility:hidden: a zero-length dash with a round cap still paints a stray dot of ink.
  function dash(p, L, s, e) {
    var len = (e - s) * L;
    if (len < .4) { p.style.visibility = 'hidden'; return; }
    p.style.visibility = 'visible';
    p.style.strokeDasharray = len.toFixed(2) + ' ' + (L * 2 + 40).toFixed(1);
    p.style.strokeDashoffset = (-s * L).toFixed(2);
  }

  var NS = 'http://www.w3.org/2000/svg';
  function node(tag, attrs) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function box(host, target) {
    var h = host.getBoundingClientRect(), t = (target || host).getBoundingClientRect();
    return { x: t.left - h.left, y: t.top - h.top, w: t.width, h: t.height };
  }
  function drawDur(L) { return Math.min(620, 200 + L * 1.1); }   // round-1 curve, unchanged

  window.R2Anim = {
    Anim: Anim, EASE: EASE, bez: bez, dash: dash, node: node, box: box, drawDur: drawDur,
    get speed() { return speed; },
    set speed(s) { speed = s; },
    all: function (fn) { live.slice().forEach(fn); }
  };
})();
