/* lib/gallery/viewer.js — "unclip to view", with the peg (design/2026-09-motion/r2-06-viewer.js). The peg is what you
   hold the print by, so it travels: a 75 ms squeeze opens its jaws on the rope, the print lifts off (the rope springs
   up where the weight left), the jaws close on the print's top edge and the peg flies in with it, growing with the
   print at a slight hand-held angle. ← / → clips this print back on its rope and takes the next one down by its own
   peg. Esc / click / tap flies it home; the jaws open just before the rope and snap shut on it, the line sags again,
   and focus returns to the print. The flight resizes one element per frame instead of scaling it, so the 2px frame
   and the peg's pen never thin out. Once the 2560px file decodes, the window unfolds to the photo's true aspect.
   Springs are Motion.Spring (four substeps per frame); reduced motion opens and closes without flight. */
import { Sim, pegSVG, clamp } from './rope.js';
const M = window.Motion, lerp = M.lerp, SQUEEZE = 0.075, PULL = 0.14, GRAB = 0.06;
function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
function spring(x, f, z) { return M.Spring({ x: x, f: f, zeta: z }); }
function tune(s, f, z) { s.setK({ f: f, zeta: z }); }

export function Viewer(opt) {
  this.o = opt || {}; this.flyers = []; this.cur = null; this.isOpen = false; this.always = true;
  const root = this.root = document.createElement('div');
  root.className = 'vw'; root.hidden = true; root.tabIndex = -1;
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Photo viewer · 看照片');
  root.innerHTML = '<div class="vw-veil"></div><p class="vw-hint"><span class="k">← → clip it back, take the next · 换一张</span><span class="k">esc clips it back on the line · 夹回去</span>' +
    '<span class="t">swipe for the next print · 滑动换一张</span><span class="t">tap to clip it back · 点一下夹回去</span></p>';
  document.body.appendChild(root);
  this.veilEl = root.querySelector('.vw-veil'); this.hintEl = root.querySelector('.vw-hint');
  this.veil = spring(0, 1.9, 1);
  const self = this;
  this.veilEl.addEventListener('click', function () { self.close(); });
  root.addEventListener('wheel', function (e) { e.preventDefault(); }, { passive: false });
  root.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
  this.onKey = function (e) {
    if (e.key === 'Escape') { e.preventDefault(); self.close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); self.go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); self.go(-1); }
    else if (e.key === 'Tab' || e.key === ' ') { e.preventDefault(); root.focus({ preventScroll: true }); }
  };
  window.addEventListener('resize', function () { if (!root.hidden) { self.place(); Sim.wake(self); } });
  // ← / → may scroll the page behind the veil to bring the next print's line into view; the flight tracks it.
  window.addEventListener('scroll', function () { if (!root.hidden) Sim.wake(self); }, { passive: true });
}

// Final geometry of the enlarged print (and its peg) for aspect `ar`. The peg is sized from the print, and the print
// leaves room above itself for the peg to stand up.
Viewer.prototype.fit = function (ar) {
  const Bw = innerWidth, Bh = innerHeight, sm = Bw < 640;
  const F = sm ? { pad: 10, cap: 20, meta: 11, gap: 8, mgap: 4, bot: 10, mx: 14, mb: 70, air: 14, min: 42 } : { pad: 14, cap: 24, meta: 12, gap: 10, mgap: 4, bot: 12, mx: 64, mb: 66, air: 22, min: 60 };
  const lip = F.gap + F.cap * 1.4 + F.mgap + F.meta * 1.5 + F.bot, maxW = Bw - 2 * F.mx - 2 * F.pad - 4;
  let pegL = clamp(0.1 * (maxW + 2 * F.pad), F.min, 100);
  for (let pass = 0; pass < 2; pass++) {
    F.pegL = pegL; F.pegOv = F.pad + 2 + 0.08 * pegL; F.mt = pegL - F.pegOv + F.air;
    const maxH = Bh - F.mt - F.mb - F.pad - lip - 4;
    F.ww = Math.max(40, Math.min(maxW, maxH * ar));
    pegL = clamp(0.1 * (F.ww + 2 * F.pad + 4), F.min, 100);
  }
  F.cx = Bw / 2; F.cy = F.mt + (Bh - F.mt - F.mb) / 2;
  return F;
};
Viewer.prototype.place = function () {
  this.hintEl.style.top = (innerHeight - this.hintEl.offsetHeight - 18) + 'px';
};

Viewer.prototype.open = function (line, i, dir) {
  const h = line.hangs[i];
  if (!this.isOpen) {
    this.isOpen = true; this.root.hidden = false; this.place();
    window.addEventListener('keydown', this.onKey);
    this.root.focus({ preventScroll: true });
  }
  this.root.setAttribute('aria-label', 'Photo viewer · 看照片: ' + h.p.loc + ', ' + h.p.date + '. Arrow keys for the next print, Escape to clip it back.');
  this.root.setAttribute('data-id', h.p.id);
  // Grabbing a print that is still on its way home takes it back mid-air.
  let f = null;
  this.flyers.forEach(function (x) { if (x.line === line && x.i === i && !x.done) f = x; });
  if (f) f.unhome(dir || 0);
  else { f = new Flyer(this, line, i, dir || 0); this.flyers.push(f); }
  this.cur = f;
  if (f.phase === 'fly') this.veil.to = 1;                        // a fresh print raises the veil once it is off the rope
  if (M.reduced()) { f.snap(); this.veil.snap(1); }
  Sim.wake(this); this.render();
};
Viewer.prototype.close = function () {
  if (!this.cur) return;
  const f = this.cur; this.cur = null; this.isOpen = false; this.veil.to = 0;
  window.removeEventListener('keydown', this.onKey);
  f.home(0, true);
  if (M.reduced()) { this.veil.snap(); f.snap(); }
  Sim.wake(this); this.render();
};
Viewer.prototype.go = function (dir) {
  if (!this.cur || !this.o.seq) return;
  const seq = this.o.seq(), c = this.cur, n = seq.length;
  let at = 0;
  if (n < 2) return;
  for (let k = 0; k < n; k++) if (seq[k][0] === c.line && seq[k][1] === c.i) at = k;
  const nx = seq[(at + dir + n) % n];
  c.home(dir);
  if (M.reduced()) c.snap();
  if (this.o.onGo) this.o.onGo(nx[0], nx[1]);
  this.open(nx[0], nx[1], dir);
};
// Instant teardown (a rebuild or a restring): every print back on its peg, no flight.
Viewer.prototype.clearAll = function () {
  this.flyers.forEach(function (f) { f.el.remove(); f.h.el.style.visibility = ''; });
  this.flyers = []; this.cur = null; this.isOpen = false; this.veil.snap(0);
  window.removeEventListener('keydown', this.onKey); this.root.hidden = true; Sim.bodies.delete(this);
};

Viewer.prototype.step = function (dt) {
  this.flyers.forEach(function (f) { f.frame(dt); });
  if (M.reduced()) this.veil.snap(); else this.veil.step(dt);
  this.flyers.forEach(function (f) { f.step(dt); });
  const still = this.veil.rest(0.004) && !this.flyers.some(function (f) { return f.moving(); });
  if (still) this.veil.snap();
  if (!this.isOpen && !this.flyers.length && this.veil.x < 0.01) this.root.hidden = true;
  return !still;
};
Viewer.prototype.render = function () {
  this.veilEl.style.opacity = clamp01(this.veil.x).toFixed(3);
  this.hintEl.style.opacity = clamp01(this.veil.x * 1.4 - 0.4).toFixed(3);
  this.flyers.forEach(function (f) { f.render(); });
  this.flyers = this.flyers.filter(function (f) { return !f.finished(); });
  if (!this.isOpen && !this.flyers.length && this.veil.x < 0.01) this.root.hidden = true;
};

/* ---- one print (and its peg) in flight ---- */
function Flyer(vw, line, i, dir) {
  this.vw = vw; this.line = line; this.i = i; const h = this.h = line.hangs[i], o = line.o;
  this.p = h.p; this.ar = h.p.dw / h.p.dh; this.homing = false; this.done = false; this.dir = dir; this.t = 0; this.phase = 'squeeze';
  const capEl = h.print.querySelector('.cap'), metaEl = h.print.querySelector('.meta');
  this.o0 = { W: o.cardW, pad: o.pad, cap: o.cap, meta: o.meta, mgap: parseFloat(getComputedStyle(metaEl).marginTop) || 0 };
  this.capH0 = Math.max(1, Math.round(capEl.offsetHeight / (o.cap * 1.4))) * o.cap * 1.4;
  this.tilt = (h.p.id % 2 ? -1 : 1) * (4 + (h.p.id % 4));        // the hand holds the peg a little off plumb
  this.offX = ((h.p.id * 37) % 7 - 3) / 100;                     // ...and never quite at the centre
  const el = this.el = document.createElement('figure');
  el.className = 'fly';
  el.innerHTML = '<div class="fly-card"><div class="fly-win"><img class="fly-lo" alt=""><span class="fly-chem"></span><img class="fly-hi" alt=""></div>' +
    '<figcaption><span class="fly-cap"></span><span class="fly-meta"></span></figcaption></div>' + pegSVG('fly-peg');
  this.card = el.querySelector('.fly-card'); this.win = el.querySelector('.fly-win'); this.lo = el.querySelector('.fly-lo'); this.hi = el.querySelector('.fly-hi');
  this.chem = el.querySelector('.fly-chem'); this.peg = el.querySelector('.fly-peg');
  this.capEl = el.querySelector('.fly-cap'); this.metaEl = el.querySelector('.fly-meta');
  this.capEl.textContent = h.p.loc; this.metaEl.textContent = h.p.dateLabel + ' · ' + h.p.catLabel;
  this.lo.src = h.img.currentSrc || h.p.src; this.hi.alt = h.p.loc + ', ' + h.p.date;
  vw.root.appendChild(el);
  // Start exactly where the print hangs: centre of its rotated box, its current angle and swing.
  const c = this.slot();
  h.el.style.visibility = 'hidden';
  this.sx = spring(c.x, 1.45, 0.8); this.sy = spring(c.y, 1.45, 0.8);
  this.ss = spring(0, 1.5, 0.74); this.sa = spring(0, 1.7, 0.92); this.sr = spring(h.th, 1.2, 0.42);
  this.developing = true; this.hiReady = false;
  const self = this;
  this.hi.decoding = 'async'; this.hi.src = h.p.display;
  this.hi.decode().then(function () { self.hiReady = true; Sim.wake(vw); }, function () { /* keep the thumbnail */ });
  this.drag();
  if (M.reduced()) { this.lift(); this.fly(); }
}
Flyer.prototype.slot = function () { const r = this.h.print.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
// The squeeze is over: the print (with its peg) is pulled down off the rope, still at its own size.
Flyer.prototype.lift = function () {
  this.phase = 'pull'; this.line.release(this.i); this.pullUntil = this.t + PULL;
  tune(this.sx, 4, 0.9); tune(this.sy, 4, 0.9); tune(this.sr, 3, 0.7);
  this.sx.to = this.sx.x; this.sy.to = this.sy.x + 26; this.sr.to = this.sr.x + (this.dir ? -this.dir * 3 : 2);
  this.grabAt = this.t + GRAB;
  if (M.reduced()) this.pegOpen(false);
};
// Off the rope: bring it to you.
Flyer.prototype.fly = function () {
  this.phase = 'fly';
  tune(this.sx, 1.45, 0.8); tune(this.sy, 1.45, 0.8); tune(this.sr, 1.2, 0.42);
  this.ss.to = 1; this.sr.to = 0; this.aim();
  this.sr.v += clamp((this.sx.to - this.sx.x) * 0.08, -60, 60) + (this.dir ? -this.dir * 20 : 0);
  if (this.vw.cur === this) this.vw.veil.to = 1;
};
Flyer.prototype.pegOpen = function (on) { this.peg.classList.toggle('open', on); };
Flyer.prototype.aim = function () { const F = this.vw.fit(lerp(4 / 3, this.ar, clamp01(this.sa.to))); this.sx.to = F.cx; this.sy.to = F.cy; };
// Home is the print's resting pose: pivot on the rope, centre hanging below it at its own tilt. It is re-read every
// frame, so the target follows the rope's motion and any scroll behind the veil.
Flyer.prototype.retarget = function () {
  const pv = this.line.pivot(this.i), rad = pv.tilt * Math.PI / 180, d = 6 + pv.h / 2;
  this.sx.to = pv.x - Math.sin(rad) * d; this.sy.to = pv.y + Math.cos(rad) * d; this.sr.to = pv.tilt;
};
Flyer.prototype.home = function (dir, focusBack) {
  this.homing = true; this.focusBack = focusBack; this.el.classList.add('homing'); this.pegOpened = false;
  if (this.phase === 'squeeze') this.line.release(this.i);
  this.phase = 'fly';
  tune(this.sx, 1.9, 0.9); tune(this.sy, 1.9, 0.9); tune(this.ss, 1.9, 0.92); tune(this.sa, 2.4, 1); tune(this.sr, 1.6, 0.62);
  this.ss.to = 0; this.sa.to = 0; this.retarget();
  if (dir) this.sr.v += dir * 30;
};
Flyer.prototype.unhome = function (dir) {
  this.homing = false; this.el.classList.remove('homing'); this.pegOpen(false);
  tune(this.sx, 1.45, 0.8); tune(this.sy, 1.45, 0.8); tune(this.ss, 1.5, 0.74); tune(this.sa, 1.7, 0.92); tune(this.sr, 1.2, 0.42);
  this.ss.to = 1; this.sr.to = 0; this.sa.to = this.hiAt != null ? 1 : 0; this.aim();
  if (dir) this.sr.v -= dir * 20;
};
Flyer.prototype.snap = function () { [this.sx, this.sy, this.ss, this.sa, this.sr].forEach(function (s) { s.snap(); }); };
Flyer.prototype.frame = function (dt) {
  this.t += dt;
  if (this.phase === 'squeeze') {
    if (!this.squeezed) { this.squeezed = true; this.pegOpen(true); }                 // fingers squeeze: jaws open on the rope
    const c = this.slot(); this.sx.x = this.sx.to = c.x; this.sy.x = this.sy.to = c.y;   // a line scrolling under it carries it
    if (this.t >= SQUEEZE) this.lift();
    return;
  }
  if (this.phase === 'pull' && this.t >= this.pullUntil) this.fly();
  if (this.grabAt && this.t >= this.grabAt && !this.homing) { this.grabAt = 0; this.pegOpen(false); }   // jaws close on the print
  if (this.homing) {
    this.retarget();
    const dx = this.sx.x - this.sx.to, dy = this.sy.x - this.sy.to;
    if (!this.pegOpened && dx * dx + dy * dy < 90 * 90 && this.ss.x < 0.3) { this.pegOpened = true; this.pegOpen(true); }   // squeeze to clip on
  }
  // The print keeps developing in your hand; the sharp file waits for the chemistry to finish.
  const h = this.h;
  this.developing = h.print.classList.contains('undev') || h.img.getAnimations().length > 0;
  if (this.developing) { this.lo.style.filter = getComputedStyle(h.img).filter; this.chem.style.opacity = getComputedStyle(h.chem).opacity; }
  else if (this.lo.style.filter) { this.lo.style.filter = ''; this.chem.style.opacity = 0; }
  // The thumbnail is a 4:3 crop: cross-fade to the sharp file inside the same 4:3 window first, and only then unfold
  // the window to the photo's real aspect (unfolding mid-fade shows two crops at once).
  if (this.hiReady && !this.developing && !this.homing && !this.hi.classList.contains('on')) { this.hi.classList.add('on'); this.hiAt = this.t; }
  if (this.hiAt != null && !this.homing && this.sa.to !== 1 && (this.t - this.hiAt > 0.18 || M.reduced())) {
    this.sa.to = 1; if (M.reduced()) this.sa.snap();
  }
};
Flyer.prototype.step = function (dt) {
  if (this.phase === 'squeeze') return;
  if (M.reduced() && !this.dragging) { this.snap(); return; }        // no flight: every target is reached at once
  if (this.dragging) { this.ss.step(dt); this.sa.step(dt); this.sy.step(dt); return; }
  this.sx.step(dt); this.sy.step(dt); this.ss.step(dt); this.sa.step(dt); this.sr.step(dt);
};
Flyer.prototype.moving = function () {
  return this.phase !== 'fly' || this.dragging || this.developing || this.homing || (this.hiReady && this.sa.to !== 1) ||
    !(this.sx.rest(0.3) && this.sy.rest(0.3) && this.ss.rest(0.002) && this.sa.rest(0.002) && this.sr.rest(0.05));
};
// Landing: close enough that the swap is invisible. The flight's angle and spin become the pendulum's.
Flyer.prototype.finished = function () {
  if (this.done) return true;
  if (!this.homing) return false;
  const dx = this.sx.x - this.sx.to, dy = this.sy.x - this.sy.to;
  if (this.ss.x > 0.02 || this.sa.x > 0.03 || dx * dx + dy * dy > 6.5 || Math.abs(this.sr.x - this.sr.to) > 3) return false;
  this.done = true; this.el.remove();
  const h = this.h, line = this.line;
  h.el.style.visibility = ''; line.peg(this.i, true);
  line.land(this.i, this.sr.x, this.sr.v + this.sx.v * 0.05);
  if (this.focusBack && !this.vw.isOpen) h.print.focus({ preventScroll: true });
  return true;
};
Flyer.prototype.render = function () {
  if (this.done) return;
  const s = this.ss.x, a = clamp01(this.sa.x), ar = lerp(4 / 3, this.ar, a), F = this.vw.fit(ar), o = this.o0, st = this.el.style;
  if (!this.homing && this.phase === 'fly' && !this.dragging) { this.sx.to = F.cx; this.sy.to = F.cy; }
  const ww = lerp(o.W - 4 - 2 * o.pad, F.ww, s), pad = lerp(o.pad, F.pad, s), cap = lerp(o.cap, F.cap, s), meta = lerp(o.meta, F.meta, s);
  const gap = lerp(5, F.gap, s), mgap = lerp(o.mgap, F.mgap, s), bot = lerp(5, F.bot, s), wh = ww / ar, capH = lerp(this.capH0, F.cap * 1.4, clamp01(s));
  const W = ww + 2 * pad + 4, H = 4 + pad + wh + gap + capH + mgap + meta * 1.5 + bot;
  st.width = W.toFixed(1) + 'px'; st.height = H.toFixed(1) + 'px';
  st.transform = 'translate(' + (this.sx.x - W / 2).toFixed(1) + 'px,' + (this.sy.x - H / 2).toFixed(1) + 'px) rotate(' + this.sr.x.toFixed(2) + 'deg)';
  const w = this.win.style; w.left = w.top = pad.toFixed(1) + 'px'; w.width = ww.toFixed(1) + 'px'; w.height = wh.toFixed(1) + 'px';
  const c = this.capEl.style; c.left = (pad + 1).toFixed(1) + 'px'; c.top = (pad + wh + gap).toFixed(1) + 'px'; c.width = (ww - 2).toFixed(1) + 'px'; c.fontSize = cap.toFixed(2) + 'px';
  const m = this.metaEl.style; m.left = (pad + 1).toFixed(1) + 'px'; m.top = (pad + wh + gap + capH + mgap).toFixed(1) + 'px'; m.fontSize = meta.toFixed(2) + 'px';
  this.card.style.boxShadow = '0 ' + lerp(6, 26, s).toFixed(1) + 'px ' + lerp(14, 60, s).toFixed(1) + 'px color-mix(in srgb,var(--ink) ' + lerp(10, 32, clamp01(s)).toFixed(1) + '%,transparent)';
  // The peg: same drawing, sized with the print; its ink fill opens to paper once it is big enough to draw.
  const L = lerp(22, F.pegL, s), pw = L * 20 / 44, ov = lerp(8, F.pegOv, s), pg = this.peg.style;
  pg.width = pw.toFixed(1) + 'px'; pg.height = L.toFixed(1) + 'px';
  pg.left = (W / 2 - pw / 2 + this.offX * W * clamp01(s)).toFixed(1) + 'px'; pg.top = (ov - L).toFixed(1) + 'px';
  pg.transformOrigin = '50% ' + (L - ov).toFixed(1) + 'px'; pg.transform = 'rotate(' + (this.tilt * clamp01(s)).toFixed(2) + 'deg)';
  pg.setProperty('--pf', 'color-mix(in srgb, var(--ink) ' + Math.round(100 - 100 * clamp01((L - 24) / 26)) + '%, var(--paper2))');
};
// Swipe: the print follows the finger (tilting with the drag); let go past a threshold for the next print.
Flyer.prototype.drag = function () {
  const self = this, vw = this.vw;
  let d = null;
  this.el.addEventListener('pointerdown', function (e) {
    if (vw.cur !== self || e.button > 0) return;
    d = { x0: e.clientX, sx: self.sx.x, lx: e.clientX, lt: e.timeStamp, vx: 0, moved: false };
    self.el.setPointerCapture(e.pointerId);
  });
  this.el.addEventListener('pointermove', function (e) {
    if (!d) return;
    const dx = e.clientX - d.x0, dt = Math.max(1, e.timeStamp - d.lt);
    d.vx = 0.7 * d.vx + 0.3 * ((e.clientX - d.lx) / dt * 1000); d.lx = e.clientX; d.lt = e.timeStamp;
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; self.dragging = true; }
    if (!d.moved) return;
    self.sx.x = d.sx + dx; self.sx.v = d.vx; self.sr.x = dx * 0.03; self.sr.v = 0;
    Sim.wake(vw); vw.render();
  });
  const up = function () {
    if (!d) return;
    const dx = self.sx.x - d.sx, moved = d.moved, vx = d.vx; d = null; self.dragging = false; self.swiped = moved;
    if (!moved) return;
    self.sx.v = vx;
    if (Math.abs(dx) > 80 || Math.abs(vx) > 650) vw.go(dx < 0 ? 1 : -1);
    Sim.wake(vw);
  };
  this.el.addEventListener('pointerup', up);
  this.el.addEventListener('pointercancel', up);
  // A tap puts it back on its click, not on pointerup: with no flight (reduced motion) the print would already be
  // back on its line, and the tap's click would land on it and unclip it again.
  this.el.addEventListener('click', function () { if (vw.cur === self && !self.swiped) vw.close(); });
};
