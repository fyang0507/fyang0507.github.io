/* r2-03-reflow.js — the round-1 FLIP reflow engine (03-reflow.js), copied unchanged except for one
   option: { hang: true } for things that hang from a line instead of standing on a plank (Gallery).
   A hanging leaver loses one peg, swings about the other, then drops; an entering print is hung
   onto the line and swings from its peg when it lands.
   Original notes:
   First:  read each item's layout box (offsetLeft/Top) plus the offset it is drawn at right now.
   Last:   apply the new visible set and read the new layout boxes.
   Invert: carry the difference (and whatever velocity the item already had) as its offset.
   Play:   integrate on the physics clock back to rest.
   Because First always starts from where an item is *drawn*, a second filter mid-flight simply
   retargets every book from its current position and velocity: nothing jumps, nothing restarts.
   - remaining items slide on a spring (ζ≈0.8, one small overshoot), staggered by their distance
     from the nearest change, so the gap closes like a row of books with a little slack in it;
   - leaving items pivot on a bottom corner and fall toward whichever side has free room, fading;
   - entering items drop from above the shelf and land with one small bounce.
   Layout-agnostic: it only reads offsetLeft/offsetTop, so wrapped rows (Gallery racks) work too. */
(function () {
  var SUB = 1 / 240;
  var P = {
    k: 240, c: 25,             // slide spring
    kr: 380, cr: 30,           // uprighting spring for rotation (deg)
    g: 2600, rest: 0.24,       // entering: gravity, one bounce
    drop: 50,                  // px above the shelf an entering book starts from
    tip: 190, tip0: 0.07,      // leaving: angular gravity about the pivot corner (rad/s²)
    fadeDelay: 0.03, fade: 0.17,
    stagger: 0.00032, staggerMax: 0.16,   // seconds per px of distance from the nearest change
    slideBase: 0.04,           // a gap has to open before the neighbours close it
    enterBase: 0.09, enterMax: 0.22,
    swing: 70, swingC: 5, dropAfter: 0.09, hangDrop: 34   // hang: pendulum toward rest angle, then let go
  };
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function seedSign(key) { return (Pen.hash(key) & 1) ? 1 : -1; }

  function Engine(row, opt) {
    this.row = row; this.opt = opt || {}; this.items = []; this.byKey = new Map();
    this.raf = 0; this.t = 0; this.frame = this.frame.bind(this);
  }

  Engine.prototype.add = function (key, el, on) {
    var it = { key: key, el: el, mode: on ? 'in' : 'out', x: 0, y: 0, r: 0, o: 1, vx: 0, vy: 0, vr: 0,
      wait: 0, fall: 0, age: 0, dir: 0, lx: 0, ly: 0, fx: 0.5, fy: 1, live: false };
    if (!on) el.classList.add('is-out');
    this.items.push(it); this.byKey.set(key, it);
    return it;
  };

  // Change the rotation pivot without moving the drawn element: t' = t + (I − R)(O − O').
  function setOrigin(it, fx, fy) {
    var w = it.el.offsetWidth, h = it.el.offsetHeight;
    var dx = (it.fx - fx) * w, dy = (it.fy - fy) * h, a = it.r * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    it.x += dx - (c * dx - s * dy); it.y += dy - (s * dx + c * dy);
    it.fx = fx; it.fy = fy;
    it.el.style.transformOrigin = (fx * 100) + '% ' + (fy * 100) + '%';
  }

  function moving(it) { return it.live && it.wait <= 0 && (it.fall || Math.abs(it.vx) + Math.abs(it.vy) > 8 || Math.abs(it.vr) > 4); }

  Engine.prototype.set = function (keys, opt) {
    opt = opt || {};
    var want = new Set(keys), items = this.items;
    var prevIn = items.filter(function (it) { return it.mode === 'in'; });
    prevIn.forEach(function (it) { it.lx = it.el.offsetLeft; it.ly = it.el.offsetTop; });   // First
    var stay = [], enter = [], leave = [], revive = [];
    items.forEach(function (it) {
      var on = want.has(it.key);
      if (it.mode === 'in') (on ? stay : leave).push(it);
      else if (on) (it.mode === 'leaving' ? revive : enter).push(it);
    });
    if (!enter.length && !leave.length && !revive.length) return { changed: false };

    // A leaving book is pushed over by the books closing the gap from its right, so it falls toward
    // the start of the shelf; a run of leavers with nothing staying to its right falls into the empty
    // end instead. One direction per run: mixed directions cross like dropped chopsticks.
    leave.forEach(function (it) {
      var i = prevIn.indexOf(it), j = i + 1;
      while (j < prevIn.length && !want.has(prevIn[j].key)) j++;
      it.dir = j < prevIn.length ? -1 : 1;
    });
    var wasMoving = new Map();
    stay.forEach(function (it) { wasMoving.set(it, moving(it)); });
    var pts = leave.map(function (it) { return it.lx + it.x + it.el.offsetWidth / 2; });

    // Last: apply modes to the DOM.
    leave.forEach(function (it) {
      it.mode = 'leaving'; it.wait = 0; it.live = true;
      it.age = it.o < 1 ? P.fadeDelay + (1 - it.o) * P.fade : 0;   // keep fading from wherever it was
      it.el.style.left = it.lx + 'px'; it.el.style.top = it.ly + 'px';
      it.el.classList.add('is-leaving'); it.el.classList.remove('is-entering');
    });
    revive.forEach(function (it) {
      it.mode = 'in'; it.el.classList.remove('is-leaving'); it.el.style.left = ''; it.el.style.top = '';
    });
    enter.forEach(function (it) { it.mode = 'in'; it.el.classList.remove('is-out'); });

    // Invert: remaining and revived items keep their drawn position as an offset from the new box.
    stay.concat(revive).forEach(function (it) {
      var nx = it.el.offsetLeft, ny = it.el.offsetTop;
      it.x += it.lx - nx; it.y += it.ly - ny; it.lx = nx; it.ly = ny;
    });
    var hang = !!this.opt.hang;
    leave.forEach(function (it) {
      it.hang = hang;
      if (hang) { setOrigin(it, it.dir > 0 ? 0 : 1, 0); it.vr += it.dir * 40; }   // one peg lets go
      else { setOrigin(it, it.dir > 0 ? 1 : 0, 1); it.vr += it.dir * 20; }
    });
    revive.forEach(function (it) { setOrigin(it, 0.5, hang ? 0 : 1); it.live = true; it.wait = 0; it.fall = it.y < -0.5 ? 2 : 0; pts.push(it.lx + it.el.offsetWidth / 2); });
    enter.forEach(function (it) {
      it.lx = it.el.offsetLeft; it.ly = it.el.offsetTop;
      it.x = 0; it.y = -(hang ? P.hangDrop : P.drop); it.vx = it.vy = it.vr = 0; it.r = 0; it.o = 0; it.fall = 1; it.live = true;
      it.fx = 0.5; it.fy = hang ? 0 : 1; it.el.style.transformOrigin = hang ? '50% 0%' : '';
      it.el.classList.add('is-entering');
      pts.push(it.lx + it.el.offsetWidth / 2);
    });

    // Play: stagger by distance from the change, never by index. Anything already moving retargets now.
    var origin = opt.origin != null ? opt.origin : Math.min.apply(null, pts);
    stay.forEach(function (it) {
      if (Math.abs(it.x) < 0.5 && Math.abs(it.y) < 0.5 && !it.live) return;
      it.live = true;
      if (wasMoving.get(it)) { it.wait = 0; return; }
      var c = it.lx + it.x + it.el.offsetWidth / 2, d = Infinity;
      pts.forEach(function (p) { d = Math.min(d, Math.abs(c - p)); });
      it.wait = (leave.length ? P.slideBase : 0) + Math.min(P.staggerMax, d * P.stagger);
    });
    enter.forEach(function (it) {
      var c = it.lx + it.el.offsetWidth / 2;
      it.wait = (leave.length ? P.enterBase : 0) + Math.min(P.enterMax, Math.abs(c - origin) * P.stagger * 0.8);
    });

    if (Pen.reduced() || opt.instant) { this.snap(); return { changed: true, entering: enter.length, leaving: leave.length }; }
    items.forEach(function (it) { if (it.live) paint(it, false); });   // same frame as the layout change: no flash
    this.kick();
    return { changed: true, entering: enter.length, leaving: leave.length };
  };

  function finishOut(it) {
    it.mode = 'out'; it.live = false;
    it.el.classList.add('is-out'); it.el.classList.remove('is-leaving', 'is-entering');
    it.el.style.left = ''; it.el.style.top = ''; it.el.style.transformOrigin = '';
    it.x = it.y = it.r = it.vx = it.vy = it.vr = 0; it.o = 1; it.fx = 0.5; it.fy = 1; it.fall = 0; it.hang = false;
    paint(it, true);
  }
  function finishIn(it) {
    it.live = false; it.x = it.y = it.r = it.vx = it.vy = it.vr = 0; it.o = 1; it.fall = 0; it.wait = 0;
    it.el.classList.remove('is-entering'); paint(it, true);
  }
  function paint(it, rest) {
    var s = it.el.style;
    if (rest) { s.transform = ''; s.opacity = ''; return; }
    s.transform = 'translate3d(' + it.x.toFixed(2) + 'px,' + it.y.toFixed(2) + 'px,0) rotate(' + it.r.toFixed(3) + 'deg)';
    s.opacity = it.o < 0.999 ? it.o.toFixed(3) : '';
  }

  function spring(it, h) {
    it.vx += (-P.k * it.x - P.c * it.vx) * h; it.x += it.vx * h;
    it.vr += (-P.kr * it.r - P.cr * it.vr) * h; it.r += it.vr * h;
  }
  function step(it, h) {
    if (it.wait > 0) { it.wait -= h; return; }
    if (it.mode === 'leaving' && it.hang) {   // pendulum about the remaining peg, then the drop
      it.age += h;
      var rest = it.dir * 48;
      it.vr += (P.swing * (rest - it.r) - P.swingC * it.vr) * h; it.r += it.vr * h;
      if (it.age > P.dropAfter) { it.vy += P.g * 0.55 * h; it.y += it.vy * h; }
      it.o = Math.min(it.o, 1 - clamp01((it.age - P.dropAfter) / (P.fade * 1.3)));
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
        if (it.fall === 1) { it.vy = -it.vy * P.rest; it.fall = 2; it.vr += seedSign(it.key + 'w') * 34; it.el.classList.remove('is-entering'); }
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
    return !it.fall && it.wait <= 0 && Math.abs(it.x) < 0.25 && Math.abs(it.vx) < 4 && Math.abs(it.y) < 0.25 &&
      Math.abs(it.vy) < 4 && Math.abs(it.r) < 0.03 && Math.abs(it.vr) < 0.6 && it.o > 0.995;
  }

  Engine.prototype.frame = function (now) {
    var dt = this.t ? Math.min(1 / 30, (now - this.t) / 1000) : 1 / 60; this.t = now;
    var n = Math.max(1, Math.round(dt / SUB)), h = dt / n, any = false;
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i]; if (!it.live) continue;
      for (var s = 0; s < n; s++) step(it, h);
      if (it.mode === 'leaving' && it.o <= 0.002) { finishOut(it); continue; }
      if (it.mode === 'in' && settled(it)) { finishIn(it); continue; }
      any = true; paint(it, false);
    }
    if (any) this.raf = requestAnimationFrame(this.frame);
    else { this.raf = 0; this.t = 0; if (this.opt.onSettle) this.opt.onSettle(); }
  };
  Engine.prototype.kick = function () { if (!this.raf) { this.t = 0; this.raf = requestAnimationFrame(this.frame); } };
  Engine.prototype.snap = function () {
    if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; this.t = 0;
    this.items.forEach(function (it) { if (it.mode === 'leaving') finishOut(it); else if (it.mode === 'in') finishIn(it); });
    if (this.opt.onSettle) this.opt.onSettle();
  };
  Engine.prototype.busy = function () { return !!this.raf; };

  window.Reflow = { create: function (row, opt) { return new Engine(row, opt); }, params: P };
})();
