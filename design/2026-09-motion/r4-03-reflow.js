/* r4-03-reflow.js — r3-03-reflow.js (r2-03's FLIP engine on the 3D bookcase) with two additions for scale:
     - Re-shelving. Books now fill the planks in reading order from the top, so a filter gathers its books at
       the top of the case instead of scattering them down a tall one. A book whose slot moves to another
       plank, or between standing and lying flat, is not flown across the case (round 3 tried carrying and nine
       books at once read as a swarm): it fades out where it stands, then drops into its new slot like any
       arriving book. Books that stay on their plank slide as before.
     - A flat book (lying in a stack) that leaves does not tip about a foot corner; it fades off the stack and
       the books above settle onto the one below.
   Everything else — springs, staggers, retargeting mid-flight, the drop and its one bounce — is round 3's.
   opt.moved(it) says whether a book changed plank or orientation; opt.teleport(it) is called at the moment
   it is invisible, so the pull can snap it to its new resting orientation. */
(function () {
  var SUB = 1 / 240;
  var P = {
    k: 240, c: 25, kr: 380, cr: 30, g: 2600, rest: 0.24, drop: 50, tip: 190, tip0: 0.07,
    fadeDelay: 0.03, fade: 0.17, hopFade: 0.13, stagger: 0.00032, staggerMax: 0.16, slideBase: 0.04, enterBase: 0.09, enterMax: 0.22,
  };
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seedSign(key) { return (Pen.hash(key) & 1) ? 1 : -1; }

  // opt: { relayout(items), paint(it, rest), show(it, mode), pos(x, it) (reading order), drop(it), moved(it), teleport(it), flat(it), onFrame(), onSettle() }
  function Engine(opt) { this.opt = opt; this.items = []; this.byKey = new Map(); this.raf = 0; this.t = 0; this.frame = this.frame.bind(this); }

  Engine.prototype.add = function (key, ref, on) {
    var it = { key: key, ref: ref, w: ref.w, h: ref.h, mode: on ? 'in' : 'out', x: 0, y: 0, r: 0, o: 1, vx: 0, vy: 0, vr: 0,
      wait: 0, fall: 0, age: 0, dir: 0, lx: 0, ly: 0, fx: 0.5, fy: 1, live: false, hop: 0 };
    ref.rf = it; this.items.push(it); this.byKey.set(key, it);
    this.opt.show(it, it.mode);
    return it;
  };
  Engine.prototype.inItems = function () { return this.items.filter(function (it) { return it.mode === 'in'; }); };

  // Change the rotation pivot without moving the drawn book: t' = t + (I − R)(O − O').
  function setOrigin(it, fx, fy) {
    var dx = (it.fx - fx) * it.w, dy = (it.fy - fy) * it.h, a = it.r * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    it.x += dx - (c * dx - s * dy); it.y += dy - (s * dx + c * dy);
    it.fx = fx; it.fy = fy;
  }
  function moving(it) { return it.live && it.wait <= 0 && (it.fall || Math.abs(it.vx) + Math.abs(it.vy) > 8 || Math.abs(it.vr) > 4); }

  Engine.prototype.set = function (keys, opt) {
    opt = opt || {};
    var o = this.opt, want = new Set(keys), items = this.items;
    var prevIn = this.inItems();
    prevIn.forEach(function (it) { it.lx = it.ref.sx; it.ly = it.ref.sy; });                 // First
    var stay = [], enter = [], leave = [], revive = [];
    items.forEach(function (it) {
      var on = want.has(it.key);
      if (it.mode === 'in') (on ? stay : leave).push(it);
      else if (on) (it.mode === 'leaving' ? revive : enter).push(it);
    });
    if (!enter.length && !leave.length && !revive.length) return { changed: false };

    // One direction per run of leavers: pushed toward the start by the books closing in from the right,
    // or into the empty end when nothing stays to its right (r2-03).
    leave.forEach(function (it) {
      var i = prevIn.indexOf(it), j = i + 1;
      while (j < prevIn.length && !want.has(prevIn[j].key)) j++;
      it.dir = o.flat && o.flat(it) ? 0 : j < prevIn.length ? -1 : 1;           // a flat book fades off its stack
    });
    var wasMoving = new Map();
    stay.forEach(function (it) { wasMoving.set(it, moving(it)); });
    var pts = leave.map(function (it) { return o.pos(it.lx + it.x + it.w / 2, it); });

    // Last: modes, then the bookcase assigns slots to everything that is in.
    leave.forEach(function (it) {
      it.mode = 'leaving'; it.wait = 0; it.live = true; it.hop = 0;
      it.age = it.o < 1 ? P.fadeDelay + (1 - it.o) * P.fade : 0;
      o.show(it, 'leaving');
    });
    revive.forEach(function (it) { it.mode = 'in'; o.show(it, 'in'); });
    enter.forEach(function (it) { it.mode = 'in'; o.show(it, 'in'); });
    o.relayout(this.inItems());

    // Invert: remaining and revived items keep their drawn position as an offset from the new slot.
    stay.concat(revive).forEach(function (it) {
      var sx = it.ref.sx, sy = it.ref.sy;
      it.x += it.lx - sx; it.y += it.ly - sy; it.lx = sx; it.ly = sy;
      if (o.moved && o.moved(it)) it.hop = 1;                  // another plank or orientation: re-shelve it
    });
    leave.forEach(function (it) { setOrigin(it, it.dir > 0 ? 1 : 0, 1); it.vr += it.dir * 20; });
    revive.forEach(function (it) { setOrigin(it, 0.5, 1); it.live = true; it.wait = 0; it.fall = it.y < -0.5 && !it.hop ? 2 : 0; pts.push(o.pos(it.lx + it.w / 2, it)); });
    enter.forEach(function (it) {
      it.lx = it.ref.sx; it.ly = it.ref.sy;
      it.x = 0; it.y = -o.drop(it); it.vx = it.vy = it.vr = 0; it.r = 0; it.o = 0; it.fall = 1; it.live = true; it.hop = 0;
      it.fx = 0.5; it.fy = 1;
      pts.push(o.pos(it.lx + it.w / 2, it));
    });

    // Play: stagger by distance (in reading order) from the change, never by index.
    var origin = opt.origin != null ? opt.origin : Math.min.apply(null, pts);
    stay.forEach(function (it) {
      if (Math.abs(it.x) < 0.5 && Math.abs(it.y) < 0.5 && !it.live) return;
      it.live = true;
      if (wasMoving.get(it)) { it.wait = 0; return; }
      var c = o.pos(it.lx + it.x + it.w / 2, it), d = Infinity;
      pts.forEach(function (p) { d = Math.min(d, Math.abs(c - p)); });
      it.wait = (leave.length ? P.slideBase : 0) + Math.min(P.staggerMax, d * P.stagger);
    });
    enter.forEach(function (it) {
      it.wait = (leave.length ? P.enterBase : 0) + Math.min(P.enterMax, Math.abs(o.pos(it.lx + it.w / 2, it) - origin) * P.stagger * 0.8);
    });

    if (Pen.reduced() || opt.instant) { this.snap(); return { changed: true, entering: enter.length, leaving: leave.length }; }
    items.forEach(function (it) { if (it.live) o.paint(it, false); });                          // same frame: no flash
    this.kick();
    return { changed: true, entering: enter.length, leaving: leave.length };
  };

  Engine.prototype.finishOut = function (it) {
    it.mode = 'out'; it.live = false; this.opt.show(it, 'out');
    it.x = it.y = it.r = it.vx = it.vy = it.vr = 0; it.o = 1; it.fx = 0.5; it.fy = 1; it.fall = 0; it.hop = 0;
    this.opt.paint(it, true);
  };
  Engine.prototype.finishIn = function (it) {
    if (it.hop && this.opt.teleport) this.opt.teleport(it);
    it.live = false; it.x = it.y = it.r = it.vx = it.vy = it.vr = 0; it.o = 1; it.fall = 0; it.wait = 0; it.hop = 0;
    this.opt.paint(it, true);
  };

  function spring(it, h) {
    it.vx += (-P.k * it.x - P.c * it.vx) * h; it.x += it.vx * h;
    it.vr += (-P.kr * it.r - P.cr * it.vr) * h; it.r += it.vr * h;
  }
  function step(it, h, eng) {
    if (it.wait > 0) { it.wait -= h; return; }
    if (it.hop) {                                              // fade out where it stands, then drop in anew
      it.o -= h / P.hopFade;
      if (it.o > 0) return;
      if (eng.opt.teleport) eng.opt.teleport(it);
      it.hop = 0; it.o = 0; it.x = 0; it.y = -eng.opt.drop(it); it.vx = it.vy = it.vr = 0; it.r = 0; it.fall = 1; it.fx = 0.5;
      return;
    }
    if (it.mode === 'leaving') {
      it.age += h;
      var a = Math.abs(it.r) * Math.PI / 180;
      it.vr += it.dir * P.tip * Math.sin(a + P.tip0) * (180 / Math.PI) * h; it.r += it.vr * h;
      it.vx *= Math.exp(-8 * h); it.x += it.vx * h;
      if (it.y < 0) { it.vy += P.g * h; it.y = Math.min(0, it.y + it.vy * h); } else it.vy = 0;
      it.o = Math.min(it.o, 1 - clamp01((it.age - P.fadeDelay) / P.fade));
      return;
    }
    if (it.fall) {
      it.vy += P.g * h; it.y += it.vy * h; it.o = Math.min(1, it.o + h / 0.09);
      if (it.y >= 0) {
        it.y = 0;
        if (it.fall === 1) { it.vy = -it.vy * P.rest; it.fall = 2; it.vr += seedSign(it.key + 'w') * 34; }
        else { it.vy = 0; it.fall = 0; }
      }
      spring(it, h);
      return;
    }
    spring(it, h);
    it.vy += (-P.k * it.y - P.c * it.vy) * h; it.y += it.vy * h;
    it.o += (1 - it.o) * Math.min(1, h * 16);
  }
  function settled(it) {
    return !it.fall && !it.hop && it.wait <= 0 && Math.abs(it.x) < 0.25 && Math.abs(it.vx) < 4 && Math.abs(it.y) < 0.25 &&
      Math.abs(it.vy) < 4 && Math.abs(it.r) < 0.03 && Math.abs(it.vr) < 0.6 && it.o > 0.995;
  }

  Engine.prototype.frame = function (now) {
    var dt = this.t ? Math.min(1 / 30, (now - this.t) / 1000) : 1 / 60; this.t = now;
    var n = Math.max(1, Math.round(dt / SUB)), h = dt / n, any = false;
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i]; if (!it.live) continue;
      for (var s = 0; s < n; s++) step(it, h, this);
      if (it.mode === 'leaving' && it.o <= 0.002) { this.finishOut(it); continue; }
      if (it.mode === 'in' && settled(it)) { this.finishIn(it); continue; }
      any = true; this.opt.paint(it, false);
    }
    if (this.opt.onFrame) this.opt.onFrame();
    if (any) this.raf = requestAnimationFrame(this.frame);
    else { this.raf = 0; this.t = 0; if (this.opt.onSettle) this.opt.onSettle(); }
  };
  Engine.prototype.kick = function () { if (!this.raf) { this.t = 0; this.raf = requestAnimationFrame(this.frame); } };
  Engine.prototype.snap = function () {
    if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; this.t = 0;
    var self = this;
    this.items.forEach(function (it) { if (it.mode === 'leaving') self.finishOut(it); else if (it.mode === 'in') self.finishIn(it); });
    if (this.opt.onFrame) this.opt.onFrame();
    if (this.opt.onSettle) this.opt.onSettle();
  };
  Engine.prototype.busy = function () { return !!this.raf; };

  window.Reflow4 = { create: function (opt) { return new Engine(opt); }, params: P };
})();
