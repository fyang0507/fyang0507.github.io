/* 06-unclip.js — "unclip to view". The peg opens, the print you touched leaves the rope and flies to
   the centre on springs (physics clock: it drops a hair as it is released, tilts into the move, and
   settles to 0° with one small overshoot), growing into the enlarged view while keeping its paper
   frame and handwritten caption. The window unfolds from the 4:3 thumbnail crop to the full frame
   only once the display bytes have decoded. Esc / click / backdrop fly it back onto its peg.
   The flight resizes one isolated fixed element (contain: strict) instead of scaling it, so the
   2px pen border and the caption never thin out mid-flight. */
(function () {
  var TAU = 2 * Math.PI, SUB = 1 / 240;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  function Spring(x, f, z) { this.x = x; this.t = x; this.v = 0; this.tune(f, z); }
  Spring.prototype.tune = function (f, z) { this.k = TAU * f * TAU * f; this.c = 2 * z * TAU * f; return this; };
  Spring.prototype.step = function (h) { this.v += (this.k * (this.t - this.x) - this.c * this.v) * h; this.x += this.v * h; };
  Spring.prototype.still = function (e) { return Math.abs(this.t - this.x) < e && Math.abs(this.v) < e * 10; };
  Spring.prototype.snap = function () { this.x = this.t; this.v = 0; };

  function Viewer(opt) {
    this.o = opt || {}; this.seq = []; this.flyers = []; this.cur = null; this.isOpen = false; this.always = true;
    var root = this.root = document.createElement('div');
    root.className = 'vw'; root.hidden = true; root.tabIndex = -1;
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Photo viewer · 看照片');
    root.innerHTML = '<div class="vw-veil"></div><p class="vw-hint"><span class="k">← → next print · 下一张</span><span class="k">esc puts it back · 放回去</span>' +
      '<span class="t">swipe for the next print · 滑动换张</span><span class="t">tap to put it back · 点一下放回去</span></p>';
    document.body.appendChild(root);
    this.veilEl = root.querySelector('.vw-veil'); this.hintEl = root.querySelector('.vw-hint');
    this.veil = new Spring(0, 2.2, 1);
    var self = this;
    this.veilEl.addEventListener('click', function () { self.close(); });
    root.addEventListener('wheel', function (e) { e.preventDefault(); }, { passive: false });
    root.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    this.onKey = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); self.close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); self.go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); self.go(-1); }
      else if (e.key === 'Tab') { e.preventDefault(); root.focus({ preventScroll: true }); }
    };
    window.addEventListener('resize', function () { if (self.isOpen) self.place(); });
  }

  Viewer.prototype.add = function (line) { var s = this.seq; line.hangs.forEach(function (h, i) { s.push([line, i]); }); };
  Viewer.prototype.clear = function () { this.seq = []; };
  Viewer.prototype.bounds = function () {
    var b = this.o.bounds && this.o.bounds();
    return b || { left: 0, top: 0, width: innerWidth, height: innerHeight };
  };
  // Final geometry of the enlarged print for aspect `ar` inside bounds B.
  Viewer.prototype.fit = function (ar) {
    var B = this.bounds(), sm = B.width < 640;
    var F = sm ? { pad: 10, cap: 20, meta: 11, gap: 8, bot: 10, mx: 12, mt: 20, mb: 58 } : { pad: 14, cap: 24, meta: 12, gap: 10, bot: 12, mx: 64, mt: 34, mb: 64 };
    var lip = F.gap + F.cap * 1.4 + F.meta * 1.5 + F.bot;
    var maxW = B.width - 2 * F.mx - 2 * F.pad - 4, maxH = B.height - F.mt - F.mb - F.pad - lip - 4;
    F.ww = Math.max(40, Math.min(maxW, maxH * ar));
    F.cx = B.left + B.width / 2; F.cy = B.top + F.mt + (B.height - F.mt - F.mb) / 2;
    return F;
  };
  Viewer.prototype.place = function () {
    var B = this.bounds(), v = this.veilEl.style, hs = this.hintEl.style;
    v.left = B.left + 'px'; v.top = B.top + 'px'; v.width = B.width + 'px'; v.height = B.height + 'px'; v.borderRadius = (B.radius || 0) + 'px';
    hs.left = B.left + 'px'; hs.width = B.width + 'px'; hs.top = (B.top + B.height - this.hintEl.offsetHeight - 18) + 'px';
    this.flyers.forEach(function (f) { if (!f.homing) f.aim(); });
  };

  Viewer.prototype.open = function (line, i, dir) {
    var h = line.hangs[i];
    if (!this.isOpen) {
      this.isOpen = true; this.root.hidden = false; this.back = h.print; this.place();
      window.addEventListener('keydown', this.onKey);
      this.root.focus({ preventScroll: true });
    }
    this.root.setAttribute('aria-label', 'Photo viewer · 看照片: ' + h.p.loc + ', ' + h.p.date);
    line.peg(i, true);
    var f = new Flyer(this, line, i, dir || 0);
    line.release(i);
    this.cur = f; this.flyers.push(f); this.veil.t = 1;
    if (Pen.reduced()) { f.snap(); this.veil.snap(); }
    G06.Sim.wake(this); this.render();
  };
  Viewer.prototype.close = function () {
    if (!this.cur) return;
    var f = this.cur; this.cur = null; this.isOpen = false; this.veil.t = 0;
    window.removeEventListener('keydown', this.onKey);
    f.home(0, true);
    if (Pen.reduced()) { this.veil.snap(); f.snap(); }
    G06.Sim.wake(this); this.render();
  };
  Viewer.prototype.go = function (dir) {
    if (!this.cur || !this.seq.length) return;
    var c = this.cur, n = this.seq.length, at = 0;
    for (var k = 0; k < n; k++) if (this.seq[k][0] === c.line && this.seq[k][1] === c.i) at = k;
    var nx = this.seq[(at + dir + n) % n];
    c.home(dir);
    if (Pen.reduced()) c.snap();
    this.open(nx[0], nx[1], dir);
  };

  Viewer.prototype.step = function (dt) {
    var n = Math.max(1, Math.round(dt / SUB)), h = dt / n;
    for (var s = 0; s < n; s++) { this.veil.step(h); this.flyers.forEach(function (f) { f.step(h); }); }
    this.flyers = this.flyers.filter(function (f) { return !f.finished(); });
    var still = this.veil.still(0.004) && !this.flyers.some(function (f) { return f.moving(); });
    if (still) this.veil.snap();
    if (!this.isOpen && !this.flyers.length && this.veil.x < 0.01) this.root.hidden = true;
    return !still;
  };
  Viewer.prototype.render = function () {
    this.veilEl.style.opacity = clamp01(this.veil.x).toFixed(3);
    this.hintEl.style.opacity = clamp01(this.veil.x * 1.4 - 0.4).toFixed(3);
    this.flyers.forEach(function (f) { f.render(); });
    this.flyers = this.flyers.filter(function (f) { return !f.finished(); });
  };

  /* ---- one print in flight ---- */
  function Flyer(vw, line, i, dir) {
    this.vw = vw; this.line = line; this.i = i; var h = this.h = line.hangs[i], o = line.o;
    this.p = h.p; this.ar = h.p.dw / h.p.dh; this.homing = false; this.done = false;
    this.o0 = { W: o.cardW, pad: o.pad, cap: o.cap, meta: o.meta };
    var el = this.el = document.createElement('figure');
    el.className = 'fly';
    el.innerHTML = '<div class="fly-win"><img class="fly-lo" alt=""><img class="fly-hi" alt=""></div>' +
      '<figcaption><span class="fly-cap"></span><span class="fly-meta"></span></figcaption>';
    this.win = el.querySelector('.fly-win'); this.lo = el.querySelector('.fly-lo'); this.hi = el.querySelector('.fly-hi');
    this.capEl = el.querySelector('.fly-cap'); this.metaEl = el.querySelector('.fly-meta');
    this.capEl.textContent = h.p.loc; this.metaEl.textContent = h.p.dateLabel + ' · ' + h.p.catLabel;
    this.lo.src = h.img.currentSrc || h.p.src;
    this.hi.alt = h.p.loc;
    vw.root.appendChild(el);
    // Start exactly where the print hangs: centre of its rotated box, its current angle.
    var r = h.print.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    h.print.style.visibility = 'hidden';
    this.sx = new Spring(cx, 1.45, 0.8); this.sy = new Spring(cy, 1.45, 0.8);
    this.ss = new Spring(0, 1.5, 0.74); this.sa = new Spring(0, 1.7, 0.92); this.sr = new Spring(h.th, 1.2, 0.42);
    this.sy.v = dir ? 0 : 240;                                   // released from the peg: it drops a hair first
    this.ss.t = 1; this.sr.t = 0;
    this.aim();
    this.sr.v = Math.max(-60, Math.min(60, (this.sx.t - cx) * 0.08)) + (dir ? -dir * 20 : 0);
    var self = this;
    this.hi.decoding = 'async'; this.hi.src = h.p.display;
    this.hi.decode().then(function () {
      if (self.homing) return;
      self.hi.classList.add('on'); self.sa.t = 1;
      if (Pen.reduced()) self.sa.snap();
      G06.Sim.wake(vw); vw.render();
    }, function () { /* keep the thumbnail */ });
    this.drag();
  }
  Flyer.prototype.aim = function () {
    var F = this.vw.fit(lerp(4 / 3, this.ar, clamp01(this.sa.t)));
    this.sx.t = F.cx; this.sy.t = F.cy;
  };
  Flyer.prototype.home = function (dir, focusBack) {
    this.homing = true; this.focusBack = focusBack; this.el.classList.add('homing');
    // Aim for the print's resting pose: pivot on the rope, centre hanging below it at its own tilt.
    var g = this.h, host = this.line.host.getBoundingClientRect(), rad = g.rest * Math.PI / 180;
    var d = 6 + (g.print.offsetHeight || this.line.printH) / 2, py = host.top + this.line.ropeAt(g.x).y;
    this.sx.t = host.left + g.x - Math.sin(rad) * d; this.sy.t = py + Math.cos(rad) * d;
    this.sx.tune(1.9, 0.9); this.sy.tune(1.9, 0.9); this.ss.tune(1.9, 0.92); this.sa.tune(2.4, 1); this.sr.tune(1.6, 0.62);
    this.ss.t = 0; this.sa.t = 0; this.sr.t = g.rest;
    if (dir) this.sr.v += dir * 30;
  };
  Flyer.prototype.snap = function () { [this.sx, this.sy, this.ss, this.sa, this.sr].forEach(function (s) { s.snap(); }); };
  Flyer.prototype.step = function (h) {
    if (this.dragging) { this.ss.step(h); this.sa.step(h); this.sy.step(h); return; }
    this.sx.step(h); this.sy.step(h); this.ss.step(h); this.sa.step(h); this.sr.step(h);
  };
  Flyer.prototype.moving = function () {
    return this.dragging || !(this.sx.still(0.3) && this.sy.still(0.3) && this.ss.still(0.002) && this.sa.still(0.002) && this.sr.still(0.05));
  };
  Flyer.prototype.finished = function () {
    if (this.done) return true;
    if (!this.homing || this.moving()) return false;
    this.done = true; this.el.remove();
    var h = this.h, line = this.line;
    h.print.style.visibility = ''; line.peg(this.i, false); line.land(this.i, this.sr.v >= 0 ? 1 : -1);
    if (this.focusBack && !this.vw.isOpen) h.print.focus({ preventScroll: true });
    return true;
  };
  Flyer.prototype.render = function () {
    if (this.done) return;
    var s = this.ss.x, a = clamp01(this.sa.x), ar = lerp(4 / 3, this.ar, a), F = this.vw.fit(ar), o = this.o0, st = this.el.style;
    if (!this.homing) { this.sx.t = F.cx; this.sy.t = F.cy; }
    var ww = lerp(o.W - 4 - 2 * o.pad, F.ww, s), pad = lerp(o.pad, F.pad, s), cap = lerp(o.cap, F.cap, s), meta = lerp(o.meta, F.meta, s);
    var gap = lerp(5, F.gap, s), bot = lerp(5, F.bot, s), wh = ww / ar;
    var W = ww + 2 * pad + 4, H = 4 + pad + wh + gap + cap * 1.4 + meta * 1.5 + bot;
    st.width = W.toFixed(1) + 'px'; st.height = H.toFixed(1) + 'px';
    st.transform = 'translate(' + (this.sx.x - W / 2).toFixed(1) + 'px,' + (this.sy.x - H / 2).toFixed(1) + 'px) rotate(' + this.sr.x.toFixed(2) + 'deg)';
    var w = this.win.style; w.left = w.top = pad.toFixed(1) + 'px'; w.width = ww.toFixed(1) + 'px'; w.height = wh.toFixed(1) + 'px';
    var c = this.capEl.style; c.left = (pad + 1).toFixed(1) + 'px'; c.top = (pad + wh + gap).toFixed(1) + 'px'; c.fontSize = cap.toFixed(2) + 'px';
    var m = this.metaEl.style; m.left = (pad + 1).toFixed(1) + 'px'; m.top = (pad + wh + gap + cap * 1.4).toFixed(1) + 'px'; m.fontSize = meta.toFixed(2) + 'px';
    st.boxShadow = '0 ' + lerp(6, 26, s).toFixed(1) + 'px ' + lerp(14, 60, s).toFixed(1) + 'px rgba(40,32,22,' + lerp(0.1, 0.32, clamp01(s)).toFixed(3) + ')';
  };
  // Swipe: the print follows the finger (tilting with the drag); let go past a threshold for the next print.
  Flyer.prototype.drag = function () {
    var self = this, vw = this.vw, d = null;
    this.el.addEventListener('pointerdown', function (e) {
      if (vw.cur !== self || e.button > 0) return;
      d = { x0: e.clientX, sx: self.sx.x, lx: e.clientX, lt: e.timeStamp, vx: 0, moved: false };
      self.el.setPointerCapture(e.pointerId);
    });
    this.el.addEventListener('pointermove', function (e) {
      if (!d) return;
      var dx = e.clientX - d.x0, dt = Math.max(1, e.timeStamp - d.lt);
      d.vx = 0.7 * d.vx + 0.3 * ((e.clientX - d.lx) / dt * 1000); d.lx = e.clientX; d.lt = e.timeStamp;
      if (!d.moved && Math.abs(dx) > 6) { d.moved = true; self.dragging = true; }
      if (!d.moved) return;
      self.sx.x = d.sx + dx; self.sx.v = d.vx; self.sr.x = dx * 0.03; self.sr.v = 0;
      G06.Sim.wake(vw); vw.render();
    });
    var up = function () {
      if (!d) return;
      var dx = self.sx.x - d.sx, moved = d.moved, vx = d.vx; d = null; self.dragging = false;
      if (!moved) { vw.close(); return; }
      self.sx.v = vx;
      if (Math.abs(dx) > 80 || Math.abs(vx) > 650) vw.go(dx < 0 ? 1 : -1);
      G06.Sim.wake(vw);
    };
    this.el.addEventListener('pointerup', up);
    this.el.addEventListener('pointercancel', up);
  };

  G06.Viewer = Viewer;
})();
