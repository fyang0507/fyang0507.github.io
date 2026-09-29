/* lib/gallery/rope.js — the rope, the pegs and the prints (design/2026-09-motion/r2-06-line.js). Physics clock only.
   Every print is a weight on the rope. The rope's rest shape is its own shallow sag plus a kink under each peg (a
   taut string under point loads). Each weight is a damped spring (2.3 Hz, one ~35% overshoot), so taking a print off
   makes the rope spring up where the weight left, carrying its neighbours; hanging it back makes the line sag again.
   A small twang also runs along the wave. Each print is a damped pendulum pivoting on its peg. Every line shares one
   sleeping loop (Motion.Loop): nothing moves without a cause. Needs motion.js, pen.js and pen-tier.js. */
const M = window.Motion, NS = 'http://www.w3.org/2000/svg';
const clamp = M.clamp;
export function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
const reduced = () => M.reduced();
// Seeded randomness for the layout (jitter, wobble, the pegging hand) lives here, so the prints still hang if pen.js
// fails to load; the pen only adds the drawn knot, the smoothed rope and the marks.
export function rng(seed) {
  let a = 2166136261; seed = String(seed);
  for (let i = 0; i < seed.length; i++) a = Math.imul(a ^ seed.charCodeAt(i), 16777619);
  return function () { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const pen = () => !!(window.Pen && window.TierMark);
// Deflection of a taut string at t under a unit load at ti (both 0..1 along the span).
function G(t, ti) { return t < ti ? t * (1 - ti) : ti * (1 - t); }

/* ---- the one loop ---- */
const bodies = new Set();
const loop = M.Loop(function (dt) {
  bodies.forEach(function (b) { const alive = b.step(dt); b.render(); if (!alive) bodies.delete(b); });
  return bodies.size > 0;
});
export const Sim = {
  bodies,
  wake(b) {
    if (reduced() && !b.always) { b.render(); return; }
    bodies.add(b); loop.kick();
  }
};

// One pen at every size: the stroke never scales (non-scaling-stroke), so at 10px wide the peg reads as a solid ink
// clip, and in the viewer the same drawing opens up into a wooden peg with its spring.
export function pegSVG(extra) {
  return '<svg class="peg' + (extra ? ' ' + extra : '') + '" viewBox="0 0 20 44" aria-hidden="true">' +
    '<g class="jaw jaw-l"><path d="M3 2Q3 .8 4.2 .8H9.3V43.2H5.3Q4.2 43.2 4.1 42Q2.7 21 3 2Z"/><path class="spring" d="M10 15L6.4 5.2"/></g>' +
    '<g class="jaw jaw-r"><path d="M10.7 .8H15.8Q17 .8 17 2Q17.4 22 15.9 42Q15.8 43.2 14.7 43.2H10.7Z"/><path class="spring" d="M10 15L13.6 5.2"/></g>' +
    '<circle class="coil" cx="10" cy="15" r="2.7"/></svg>';
}

// Coral is the pen's live attention: showing one caption mark retracts whichever one was showing.
let penOn = null, lastMv = null;
const SUB = 1 / 240, WAVE = 2600, ROPE_DAMP = 2.6, LOAD_K = Math.pow(2 * Math.PI * 2.3, 2), LOAD_C = 2 * 0.28 * 2 * Math.PI * 2.3,
  PEG_FRICTION = 12, W0 = 2 * Math.PI * 0.95, ZETA = 0.2;

export function Line(host, photos, opt) {
  this.host = host; this.photos = photos; this.hangs = []; this.gone = []; this.timers = []; this.visible = true;
  this.o = Object.assign({ cardW: 148, pad: 6, cap: 15, meta: 10, margin: 30, ropeTop: 26, base: null, weight: 34, slots: 6,
    pack: false, gap: 18, lead: null, seed: 'line', hidden: false, sizes: null, onOpen: null, onFocus: null, onIntent: null }, opt || {});
  this.build();
  const self = this;
  this.io = new IntersectionObserver(function (es) {
    self.visible = es[es.length - 1].isIntersecting; if (!self.visible) self.rest();
  }, { rootMargin: '120px' });
  this.io.observe(host);
}

// Where n prints hang. Packed (the phone): a fixed pitch, and the rope is as long as its prints. Spread (desktop):
// the prints share the host's width, never closer than `slots` to a rope, with a little hand-hung jitter.
Line.prototype.layout = function (n) {
  const o = this.o, cw = o.cardW, xs = [], r = rng(o.seed + '|x' + n);
  let W, i;
  if (o.pack) {
    const lead = o.lead != null ? o.lead : o.margin + 30;
    W = lead * 2 + n * cw + Math.max(0, n - 1) * o.gap;
    for (i = 0; i < n; i++) xs.push(lead + i * (cw + o.gap) + cw / 2);
  } else {
    W = this.host.clientWidth;
    const slot = (W - 2 * o.margin) / Math.max(n, o.slots), off = o.margin + (W - 2 * o.margin - slot * n) / 2, jit = Math.max(0, Math.min(10, (slot - cw) / 3));
    for (i = 0; i < n; i++) xs.push(off + slot * (i + 0.5) + (r() - 0.5) * 2 * jit);
  }
  return { W: Math.round(W), xs: xs };
};

Line.prototype.build = function () {
  const o = this.o, host = this.host, r = rng(o.seed), L = this.layout(this.photos.length), W = L.W;
  host.classList.add('g-line'); host.innerHTML = '';
  host.style.setProperty('--pad', o.pad + 'px'); host.style.setProperty('--cap', o.cap + 'px'); host.style.setProperty('--meta', o.meta + 'px');
  if (o.pack) host.style.width = W + 'px';
  this.W = W; this.m = o.margin; this.span = W - 2 * o.margin;
  const N = this.N = Math.max(20, Math.round(this.span / 16));
  this.dx = this.span / N; this.cs2 = (WAVE / this.dx) * (WAVE / this.dx);
  this.u = new Float32Array(N + 1); this.v = new Float32Array(N + 1);
  this.base = new Float32Array(N + 1); this.load = new Float32Array(N + 1); this.wob = new Float32Array(N + 1);
  const sag0 = o.base != null ? o.base : Math.min(10, this.span * 0.008);
  for (let k = 0; k <= N; k++) { const t = k / N; this.base[k] = sag0 * 4 * t * (1 - t); this.wob[k] = k === 0 || k === N ? 0 : (r() - 0.5) * 1.1; }
  this.slack = o.hidden ? 0 : 1; this.slackV = 0; this.gone = [];
  const winW = o.cardW - 4 - 2 * o.pad;
  this.printH = 4 + o.pad + winW * 0.75 + 5 + o.cap * 1.4 + o.meta * 1.5 + 5;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'rope'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', W);
  let marks = '';
  [this.m, W - this.m].forEach(function (x, q) {
    const y = o.ropeTop;
    marks += '<g class="nail-g"><circle class="nail" cx="' + x + '" cy="' + (y - 1) + '" r="2.3"/>' + (window.Pen ?
      '<path class="knot" transform="translate(' + (x - 4) + ' ' + (y - 4.5) + ')" d="' + Pen.loop(8, 6, o.seed + 'k' + q, { pad: 1.2 }) + '"/>' : '') + '</g>';
  });
  svg.innerHTML = marks + '<path class="rope-line"/>';
  host.appendChild(svg);
  this.svg = svg; this.ropeEl = svg.querySelector('.rope-line');
  this.hangAll(L.xs, o.hidden);
  const self = this;
  if (document.fonts) document.fonts.ready.then(function () { if (self.svg) self.measure(); });
};

// Hang this.photos at xs: build the prints, their load shapes and the rope's deepest sag under all of them.
Line.prototype.hangAll = function (xs, hidden) {
  const o = this.o, N = this.N, self = this;
  this.hangs = xs.map(function (x, i) { return self.makeHang(self.photos[i], x, i, hidden); });
  let deep = 0;
  this.hangs.forEach(function (g) { g.Gk = new Float32Array(N + 1); for (let q = 1; q < N; q++) g.Gk[q] = o.weight * G(q / N, g.ti); });
  for (let k = 0; k <= N; k++) { let s = this.base[k]; this.hangs.forEach(function (g) { s += g.Gk[k]; }); deep = Math.max(deep, s); }
  this.deep = deep;
  if (!hidden) this.hangs.forEach(function (g, i) { self.addLoad(i, 1, true); });
  this.measure();
};

// Long place names wrap onto a second line, so size the line from real prints.
Line.prototype.measure = function () {
  let tall = 0;
  this.hangs.forEach(function (g) { tall = Math.max(tall, g.print.offsetHeight); });
  if (tall) this.printH = tall;
  this.H = Math.round(this.o.ropeTop + this.deep + 6 + this.printH + 30);
  this.host.style.height = this.H + 'px'; this.svg.setAttribute('height', this.H);
  this.render();
};

Line.prototype.makeHang = function (p, x, i, hidden) {
  const o = this.o, self = this, el = document.createElement('div');
  el.className = 'hang' + (hidden ? ' unpegged' : ''); el.style.width = o.cardW + 'px'; el.setAttribute('data-id', p.id); el.inert = !!hidden;
  el.innerHTML = pegSVG() + '<button type="button" class="print" data-pen-tier="0" aria-label="Unclip photo: ' + esc(p.loc) + ', ' + p.dateLabel + '">' +
    '<span class="win"><img alt="" width="400" height="300" decoding="async"><span class="chem"></span></span>' +
    '<span class="cap">' + esc(p.loc) + '</span><span class="meta">' + p.dateLabel + ' · ' + p.catLabel + '</span></button>';
  this.host.appendChild(el);
  const h = { el: el, i: i, p: p, x: x, ti: (x - this.m) / this.span, th: p.rot, w: 0, rest: p.rot, drop: 0, dv: 0,
    empty: !!hidden, loaded: false, lw: 0, lv: 0, peg: el.querySelector('.peg'), print: el.querySelector('.print'), img: el.querySelector('img'),
    chem: el.querySelector('.chem'), cap: el.querySelector('.cap'), tm: 0 };
  h.img.sizes = o.sizes || o.cardW + 'px';
  // Hover intent: the pointer has slowed down over this print. A flick passing through never marks anything.
  const show = function () {
    if (!pen()) return;                                            // the pen is optional; the prints are not
    if (penOn && penOn !== h) unmark(penOn); penOn = h; h.tm = 0;
    (h.mark || (h.mark = new TierMark(h.cap, h.cap))).to(1, 'hover'); h.print.setAttribute('data-pen-tier', '1');
  };
  const intent = function () { if (o.onIntent) o.onIntent(self, h.i); };
  h.print.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    const t = e.timeStamp, sp = lastMv && t > lastMv.t ? Math.hypot(e.clientX - lastMv.x, e.clientY - lastMv.y) / (t - lastMv.t) * 1000 : 0;
    lastMv = { x: e.clientX, y: e.clientY, t: t };
    if (sp > 240) { clearTimeout(h.tm); h.tm = 0; } else if (!h.tm && penOn !== h) h.tm = setTimeout(function () { show(); intent(); }, 90);
  });
  h.print.addEventListener('pointerleave', function () { unmark(h); });
  // Keyboard focus is the coral 「 」 around the print, never a guess from a tap.
  h.print.addEventListener('focus', function () {
    if (!h.print.matches(':focus-visible') || !pen()) return;
    (h.focus || (h.focus = new FocusMark(h.print, h.print, { gap: 6, gy: 6 }))).set(true);
    if (o.onFocus) o.onFocus(self, h.i);
  });
  h.print.addEventListener('blur', function () { if (h.focus) h.focus.set(false); unmark(h); });
  // A mouse or pen that slows over a print (the same intent that draws the mark), or presses it, fetches the sharp file
  // early. A touch may be the start of a scroll, so touch waits for the tap (the viewer fetches it then).
  h.print.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'touch') intent(); });
  h.print.addEventListener('click', function (e) { unmark(h); if (o.onOpen && !h.empty) o.onOpen(self, h.i, e); });
  return h;
};
function unmark(h) {
  clearTimeout(h.tm); h.tm = 0;
  if (h.mark) h.mark.to(0, 'hover');
  h.print.setAttribute('data-pen-tier', '0');
  if (penOn === h) penOn = null;
}
function dropMarks(h) {
  clearTimeout(h.tm); if (penOn === h) penOn = null;
  if (h.mark) h.mark.destroy(); if (h.focus) h.focus.destroy(); h.mark = h.focus = null;
}

Line.prototype.yk = function (k) { return this.o.ropeTop + this.slack * this.base[k] + this.load[k] + this.u[k]; };
Line.prototype.ropeAt = function (x) {
  const t = clamp((x - this.m) / this.span, 0, 1), f = t * this.N, k = Math.min(this.N - 1, Math.floor(f)), a = f - k;
  const y0 = this.yk(k), y1 = this.yk(k + 1);
  return { y: y0 * (1 - a) + y1 * a, slope: (y1 - y0) / this.dx };
};
Line.prototype.tilt = function (g) { return g.rest + 0.5 * Math.atan(this.ropeAt(g.x).slope) * 57.3; };
// Where a print hangs, in viewport coordinates (the viewer flies home to this, tracking scroll and rope).
Line.prototype.pivot = function (i) {
  const g = this.hangs[i], r = this.host.getBoundingClientRect();
  return { x: r.left + g.x, y: r.top + this.ropeAt(g.x).y, tilt: this.tilt(g), h: g.print.offsetHeight || this.printH };
};

// Put a print's weight on the rope (sign 1) or take it off (-1). The weight arrives or leaves through a damped
// spring, never in one frame: that spring is the rope springing up, and sagging back.
Line.prototype.addLoad = function (j, sign, silent) {
  const g = this.hangs[j]; if (!g || g.loaded === (sign > 0)) return;
  g.loaded = sign > 0;
  if (silent || reduced()) { g.lw = g.loaded ? 1 : 0; g.lv = 0; this.sumLoad(); if (!silent) this.render(); return; }
  Sim.wake(this);
};
Line.prototype.sumLoad = function () {
  const L = this.load, N = this.N, hs = this.hangs.concat(this.gone); L.fill(0);
  for (let j = 0; j < hs.length; j++) { const g = hs[j]; if (!g.lw) continue; for (let k = 1; k < N; k++) L[k] += g.lw * g.Gk[k]; }
};

Line.prototype.step = function (dt) {
  if (!this.visible) { this.rest(); return false; }
  const N = this.N, u = this.u, v = this.v, hs = this.hangs, ws = hs.concat(this.gone), n = Math.max(1, Math.round(dt / SUB)), h = dt / n, c2 = this.cs2;
  let k, j, g;
  for (let s = 0; s < n; s++) {
    if (this.slack !== 1 || this.slackV) { this.slackV += (60 * (1 - this.slack) - 7 * this.slackV) * h; this.slack += this.slackV * h; }
    let moved = false;
    for (j = 0; j < ws.length; j++) {
      g = ws[j]; const lt = g.loaded ? 1 : 0;
      if (g.lw === lt && !g.lv) continue;
      g.lv += (LOAD_K * (lt - g.lw) - LOAD_C * g.lv) * h; g.lw += g.lv * h; moved = true;
    }
    if (moved) this.sumLoad();
    for (k = 1; k < N; k++) v[k] += (c2 * (u[k - 1] + u[k + 1] - 2 * u[k]) - ROPE_DAMP * v[k]) * h;
    for (k = 1; k < N; k++) u[k] += v[k] * h;
    for (j = 0; j < hs.length; j++) {
      g = hs[j];
      g.dv += (520 * -g.drop - 22 * g.dv) * h; g.drop += g.dv * h;
      if (g.empty) continue;
      const tgt = this.tilt(g);
      // Viscous air drag plus a little peg friction, which is what stops the last small swings.
      const fr = Math.sign(g.w) * Math.min(PEG_FRICTION, Math.abs(g.w) / h);
      g.w += (-W0 * W0 * (g.th - tgt) - 2 * ZETA * W0 * g.w - fr) * h; g.th += g.w * h;
      if (Math.abs(g.th - g.rest) > 26) { g.th = g.rest + 26 * Math.sign(g.th - g.rest); g.w *= -0.3; }
    }
  }
  let busy = Math.abs(1 - this.slack) > 0.002 || Math.abs(this.slackV) > 0.05;
  for (k = 1; k < N && !busy; k++) busy = Math.abs(u[k]) > 0.08 || Math.abs(v[k]) > 3;
  for (j = 0; j < ws.length && !busy; j++) { g = ws[j]; busy = Math.abs((g.loaded ? 1 : 0) - g.lw) > 0.003 || Math.abs(g.lv) > 0.03; }
  for (j = 0; j < hs.length && !busy; j++) { g = hs[j]; busy = (!g.empty && (Math.abs(g.th - this.tilt(g)) > 0.4 || Math.abs(g.w) > 1.5)) || Math.abs(g.drop) > 0.1 || Math.abs(g.dv) > 1.5; }
  if (!busy) this.rest();
  return busy;
};

Line.prototype.rest = function () {
  this.u.fill(0); this.v.fill(0); this.slack = 1; this.slackV = 0; this.gone = [];
  const self = this;
  this.hangs.forEach(function (g) { g.lw = g.loaded ? 1 : 0; g.lv = 0; });
  this.sumLoad();
  this.hangs.forEach(function (g) { g.w = 0; g.drop = 0; g.dv = 0; g.th = self.tilt(g); });
  this.render();
};

Line.prototype.render = function () {
  if (!this.svg) return;
  const pts = [], N = this.N, half = this.o.cardW / 2, calm = Math.min(1, this.slack);
  for (let k = 0; k <= N; k++) pts.push([this.m + k * this.dx, this.yk(k) + this.wob[k] * calm]);
  this.ropeEl.setAttribute('d', window.Pen ? Pen.smooth(pts) : 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L'));
  for (let j = 0; j < this.hangs.length; j++) {
    const g = this.hangs[j], y = this.ropeAt(g.x).y + g.drop;
    g.el.style.transform = 'translate(' + (g.x - half).toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + g.th.toFixed(2) + 'deg)';
  }
};

/* ---- causes ---- */
Line.prototype.kick = function (i, dw) {
  const g = this.hangs[i]; if (!g || g.empty || reduced()) return;
  g.w = clamp(g.w + dw, -140, 140); Sim.wake(this);
};
Line.prototype.kickAll = function (dw) { for (let i = 0; i < this.hangs.length; i++) this.kick(i, dw); };
Line.prototype.pluck = function (x, amp, sigma) {
  if (reduced()) return; sigma = sigma || 40; amp = clamp(amp, -320, 320);
  for (let k = 1; k < this.N; k++) { const d = (this.m + k * this.dx - x) / sigma; this.v[k] += amp * Math.exp(-d * d); }
  Sim.wake(this);
};
// What a fast pointer pass would do to this line. Nothing fires yet: the flick detector decides later, from the
// pointer's exit speed, whether this was a flick or an approach to click.
Line.prototype.crossings = function (x0, y0, x1, y1, vx, vy) {
  const out = [], self = this;
  if (reduced() || !this.visible) return out;
  if (x1 > this.m && x1 < this.W - this.m && Math.abs(vy) > 320) {
    const ry = this.ropeAt(x1).y;
    if ((y0 - ry) * (y1 - ry) < 0) out.push({ exit: 420, fire: function () {
      self.pluck(x1, vy * 0.22, 42);
      self.hangs.forEach(function (g, i) { const d = Math.abs(g.x - x1); if (d < 120) self.kick(i, vx * 0.02 * (1 - d / 120)); });
    } });
  }
  this.hangs.forEach(function (g, j) {
    if (g.empty) return;
    const top = self.ropeAt(g.x).y + 6;
    if ((x0 - g.x) * (x1 - g.x) < 0 && y1 > top && y1 < top + self.printH) {
      const lever = clamp((y1 - top) / self.printH, 0.25, 1);          // hit it low and it swings more
      out.push({ exit: 220, fire: function () { self.kick(j, vx * 0.045 * lever); } });
    }
  });
  return out;
};

Line.prototype.peg = function (i, open) { this.hangs[i].peg.classList.toggle('open', !!open); };
// The peg closes on the rope: jaws shut past closed and settle, plus two stepped frames of snap marks.
Line.prototype.snap = function (i, marks) {
  const g = this.hangs[i]; g.peg.classList.remove('open');
  if (reduced()) return;
  g.peg.querySelectorAll('.jaw').forEach(function (jw, q) {
    const s = q ? -1 : 1;
    jw.animate([{ transform: 'rotate(' + 15 * s + 'deg)' }, { transform: 'rotate(' + -3.5 * s + 'deg)', offset: 0.6 }, { transform: 'rotate(0deg)' }],
      { duration: 140, easing: 'cubic-bezier(.5,0,.7,1)' });
  });
  if (!marks) return;
  const y = this.ropeAt(g.x).y + g.drop, sv = document.createElementNS(NS, 'svg');
  sv.setAttribute('class', 'snapmark'); sv.setAttribute('width', '64'); sv.setAttribute('height', '40');
  sv.style.left = (g.x - 32) + 'px'; sv.style.top = (y - 24) + 'px';
  const f = function (o) {
    return 'M' + (22 - o) + ' ' + (14 - o * 0.5) + 'l-5 -3.6M' + (21 - o) + ' ' + (24 + o * 0.2) + 'h-6' +
      'M' + (42 + o) + ' ' + (14 - o * 0.5) + 'l5 -3.6M' + (43 + o) + ' ' + (24 + o * 0.2) + 'h6';
  };
  sv.innerHTML = '<path d="' + f(0) + '"/>';
  this.host.appendChild(sv);
  setTimeout(function () { sv.firstChild.setAttribute('d', f(4)); }, 80);   // hand's clock: two held frames
  setTimeout(function () { sv.remove(); }, 180);
};
// Weight leaves the rope: it springs up where the print was, and the neighbours ride the wave.
Line.prototype.release = function (i) {
  const g = this.hangs[i]; g.empty = true; g.w = 0;
  this.addLoad(i, -1); this.pluck(g.x, -110, 26); this.kick(i - 1, -10); this.kick(i + 1, 10);
  Sim.wake(this);
};
// Weight comes back: the peg snaps shut on the rope, the line sags again, and the print keeps the swing it arrived
// with (angle and angular velocity handed over from the flight).
Line.prototype.land = function (i, th, w) {
  const g = this.hangs[i]; g.empty = false; g.th = th; g.w = clamp(w, -110, 110);
  this.addLoad(i, 1); this.pluck(g.x, 90, 26); this.snap(i, true);
  Sim.wake(this);
};

// A hand pegs the prints on, left to right: each lands with a small drop and swing, and the rope dips under it.
Line.prototype.pegOn = function (delay, done) {
  const self = this, r = rng(this.o.seed + 'peg'), last = this.hangs.length - 1;
  this.timers.forEach(clearTimeout); this.timers = [];
  if (reduced()) {
    this.hangs.forEach(function (g, j) { g.empty = false; self.addLoad(j, 1, true); g.el.classList.remove('unpegged'); g.el.inert = false; if (g.onPeg) g.onPeg(); });
    this.rest(); if (done) done(); return;
  }
  if (last < 0) { if (done) done(); return; }
  this.hangs.forEach(function (g, i) {
    self.timers.push(setTimeout(function () {
      if (!self.svg) return;
      g.el.classList.remove('unpegged'); g.el.inert = false; g.empty = false;
      g.drop = -18; g.dv = 0; g.th = self.tilt(g) + (r() - 0.5) * 8; g.w = (r() - 0.5) * 60;
      self.addLoad(i, 1); self.snap(i, false); Sim.wake(self);
      if (g.onPeg) g.onPeg();
      if (i === last && done) self.timers.push(setTimeout(done, 320));
    }, delay + i * 130));
  });
};

// A new line is strung: drawn nail to nail taut, it relaxes into its sag, then the prints are pegged on.
Line.prototype.string = function (done) {
  const self = this;
  if (reduced()) { this.pegOn(0, done); return; }
  this.slack = 0; this.slackV = 0; this.render();
  const L = this.ropeEl.getTotalLength();
  this.ropeEl.style.strokeDasharray = L + ' ' + (L + 4);
  const a = this.ropeEl.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 460, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'both' });
  this.svg.querySelectorAll('.nail-g').forEach(function (n, q) { n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: q * 380, fill: 'both' }); });
  a.onfinish = function () { self.ropeEl.style.strokeDasharray = ''; a.cancel(); self.slackV = 0; Sim.wake(self); };
  this.pegOn(560, done);
};

// A filter changed: these prints come off and `photos` go on the same rope. The rope springs up as the old weights
// leave and dips again under each new print. A packed rope that must change length is restrung instead.
// Returns the old prints, so their owner can forget them.
Line.prototype.repeg = function (photos, done) {
  const self = this, old = this.hangs, L = this.layout(photos.length);
  this.photos = photos;
  old.forEach(dropMarks);
  if (L.W !== this.W) {
    this.timers.forEach(clearTimeout); this.timers = []; Sim.bodies.delete(this);
    this.o.hidden = true; this.build(); this.string(done);
    return old;
  }
  old.forEach(function (g) {
    g.empty = true; g.loaded = false; g.el.classList.add('unpegged'); g.el.inert = true;
    if (reduced()) { g.lw = 0; g.el.remove(); return; }
    self.pluck(g.x, -40, 26);
    setTimeout(function () { g.el.remove(); }, 180);
  });
  this.gone = this.gone.concat(old);
  this.hangAll(L.xs, true);
  Sim.wake(this);
  this.pegOn(reduced() ? 0 : 260, done);
  return old;
};

Line.prototype.destroy = function () {
  this.timers.forEach(clearTimeout); this.io.disconnect(); Sim.bodies.delete(this);
  this.hangs.forEach(dropMarks); this.host.innerHTML = ''; this.svg = null;
};
