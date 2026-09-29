/* 06-line.js — the rope, the pegs and the prints. Physics clock only.
   A rope is a damped 1-D wave strung between two nails with a parabolic sag; each print is a damped
   pendulum pivoting on its peg, riding the rope and leaning with its local slope.
   Every line on the board shares one rAF loop (Sim) that sleeps as soon as nothing is moving. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var CAT = { landscape: 'Landscape', cityscape: 'Cityscape', people: 'People', architecture: 'Architecture', street: 'Street', creature: 'Creature', 'black and white': 'B & W', abstract: 'Abstract' };
  var fix = function (s) { return String(s).replace(/\.\/images\//g, '../../images/'); };
  var BY = {}, ALL = [];
  (window.FY_PHOTOS || []).forEach(function (p) {
    var q = Object.assign({}, p, {
      src: fix(p.src), srcset: fix(p.srcset), display: fix(p.display),
      rot: ((p.id * 53) % 9) - 4,                                  // same hand-hung tilt as the live page
      dateLabel: p.date.slice(0, 7).replace('-', '·'), catLabel: CAT[p.cat] || p.cat
    });
    BY[p.id] = q; ALL.push(q);
  });
  function pick(ids) { return ids.map(function (id) { return BY[id]; }).filter(Boolean); }
  function shuffled(seed) {
    var a = ALL.slice(), r = Pen.rng(seed);
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function reduced() { return Pen.reduced(); }

  /* ---- the one loop ---- */
  var Sim = { bodies: new Set(), raf: 0, last: 0, subs: [] };
  Sim.wake = function (b) {
    if (reduced() && !b.always) return;
    Sim.bodies.add(b);
    if (!Sim.raf) { Sim.last = performance.now(); Sim.raf = requestAnimationFrame(Sim.tick); Sim.emit(); }
  };
  Sim.tick = function (now) {
    var dt = Math.min(0.05, Math.max(0.001, (now - Sim.last) / 1000)); Sim.last = now;
    Sim.bodies.forEach(function (b) { var alive = b.step(dt); b.render(); if (!alive) Sim.bodies.delete(b); });
    Sim.raf = Sim.bodies.size ? requestAnimationFrame(Sim.tick) : 0;
    if (!Sim.raf) Sim.emit();
  };
  Sim.emit = function () { Sim.subs.forEach(function (f) { f(!!Sim.raf); }); };
  Sim.on = function (f) { Sim.subs.push(f); };
  document.addEventListener('mock:rm', function () { Sim.bodies.forEach(function (b) { if (b.rest) b.rest(); }); });

  var PEG = '<svg class="peg" viewBox="0 0 10 22" aria-hidden="true">' +
    '<path class="jaw jaw-l" d="M1.3 1.2Q1.3 .3 2.3 .3H4.6V21.7H2.6Q1.7 21.7 1.7 20.6Z"/>' +
    '<path class="jaw jaw-r" d="M5.4 .3H7.7Q8.7 .3 8.7 1.2L8.3 20.6Q8.3 21.7 7.4 21.7H5.4Z"/>' +
    '<circle class="coil" cx="5" cy="8" r="1.5"/></svg>';

  var SUB = 1 / 240, CS2 = 70 * 70, ROPE_DAMP = 4.5, PEG_FRICTION = 12, W0 = 2 * Math.PI * 0.95, ZETA = 0.2;   // paper on a peg: two visible swings, then still

  function Line(host, photos, opt) {
    this.host = host; this.photos = photos; this.hangs = []; this.visible = true;
    this.o = Object.assign({ cardW: 148, pad: 6, cap: 15, meta: 10, margin: 26, ropeTop: 24, sag: 0.02, maxSag: 22,
      pack: false, gap: 18, lead: null, seed: 'line', hidden: false, load: true, sizes: null, onOpen: null }, opt || {});
    this.build();
    var self = this;
    this.io = new IntersectionObserver(function (es) {
      self.visible = es[es.length - 1].isIntersecting; if (!self.visible) self.rest();
    }, { rootMargin: '120px' });
    this.io.observe(host);
  }

  Line.prototype.build = function () {
    var o = this.o, host = this.host, n = this.photos.length, r = Pen.rng(o.seed), cw = o.cardW, xs = [], W, i;
    host.classList.add('g06-line'); host.innerHTML = '';
    host.style.setProperty('--pad', o.pad + 'px'); host.style.setProperty('--cap', o.cap + 'px'); host.style.setProperty('--meta', o.meta + 'px');
    if (o.pack) {
      var lead = o.lead != null ? o.lead : o.margin + 30;
      W = lead * 2 + n * cw + (n - 1) * o.gap;
      for (i = 0; i < n; i++) xs.push(lead + i * (cw + o.gap) + cw / 2);
      host.style.width = W + 'px';
    } else {
      W = host.clientWidth;
      var slot = (W - 2 * o.margin) / n, jit = Math.max(0, Math.min(10, (slot - cw) / 3));
      for (i = 0; i < n; i++) xs.push(o.margin + slot * (i + 0.5) + (r() - 0.5) * 2 * jit);
    }
    this.W = W; this.m = o.margin; this.span = W - 2 * o.margin;
    this.sagT = Math.min(o.maxSag, this.span * o.sag); this.sag = o.hidden ? 0 : this.sagT; this.sagV = 0;
    var N = this.N = Math.max(16, Math.round(this.span / 24));
    this.dx = this.span / N; this.u = new Float32Array(N + 1); this.v = new Float32Array(N + 1); this.wob = [];
    for (var k = 0; k <= N; k++) this.wob.push(k === 0 || k === N ? 0 : (r() - 0.5) * 1.1);
    var winW = cw - 4 - 2 * o.pad;
    this.printH = 4 + o.pad + winW * 0.75 + 5 + o.cap * 1.4 + o.meta * 1.5 + 5;
    this.H = Math.round(o.ropeTop + this.sagT + 6 + this.printH + 24);
    host.style.height = this.H + 'px';

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'rope'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', W); svg.setAttribute('height', this.H);
    var marks = '';
    [this.m, W - this.m].forEach(function (x, q) {
      var y = o.ropeTop;
      marks += '<g class="nail-g"><circle class="nail" cx="' + x + '" cy="' + (y - 1) + '" r="2.3"/>' +
        '<path class="knot" transform="translate(' + (x - 4) + ' ' + (y - 4.5) + ')" d="' + Pen.loop(8, 6, o.seed + 'k' + q, { pad: 1.2 }) + '"/></g>';
    });
    svg.innerHTML = marks + '<path class="rope-line"/>';
    host.appendChild(svg);
    this.svg = svg; this.ropeEl = svg.querySelector('.rope-line');
    for (i = 0; i < n; i++) this.hangs.push(this.makeHang(this.photos[i], xs[i], i));
    this.measure();
    var self = this;
    if (document.fonts) document.fonts.ready.then(function () { self.measure(); });
  };

  // Long place names wrap onto a second line, as on the live page, so size the line from real prints.
  Line.prototype.measure = function () {
    var o = this.o, tall = 0;
    this.hangs.forEach(function (g) { tall = Math.max(tall, g.print.offsetHeight); });
    if (tall) this.printH = tall;
    this.H = Math.round(o.ropeTop + this.sagT + 6 + this.printH + 24);
    this.host.style.height = this.H + 'px'; this.svg.setAttribute('height', this.H);
    this.render();
  };

  Line.prototype.makeHang = function (p, x, i) {
    var o = this.o, self = this, el = document.createElement('div');
    el.className = 'hang'; el.style.width = o.cardW + 'px';
    el.innerHTML = PEG + '<button type="button" class="print" aria-label="View photo · 放大照片: ' + esc(p.loc) + '">' +
      '<span class="win"><img alt="" width="400" height="300" decoding="async"><span class="chem"></span></span>' +
      '<span class="cap">' + esc(p.loc) + '</span><span class="meta">' + p.dateLabel + ' · ' + p.catLabel + '</span></button>';
    this.host.appendChild(el);
    var h = { el: el, i: i, p: p, x: x, th: p.rot, w: 0, rest: p.rot, drop: 0, dv: 0, empty: false,
      peg: el.querySelector('.peg'), print: el.querySelector('.print'), img: el.querySelector('img'), chem: el.querySelector('.chem') };
    h.img.sizes = o.sizes || o.cardW + 'px';
    if (o.load) { h.img.loading = 'lazy'; h.img.srcset = p.srcset; h.img.src = p.src; }
    var cap = el.querySelector('.cap');
    var pen = Pen.annotate(cap, 'underline', { manual: true, width: 2, gap: -1, seed: 'cap' + p.id });
    // Hover intent: a pointer sweeping across the line should not leave a trail of coral marks.
    var tm = 0, show = function () { pen.rebuild(); pen.show(); }, hide = function () { clearTimeout(tm); pen.hide(); };
    h.print.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') tm = setTimeout(show, 120); });
    h.print.addEventListener('pointerleave', hide);
    h.print.addEventListener('focus', function () { if (h.print.matches(':focus-visible')) show(); });
    h.print.addEventListener('blur', hide);
    // Fetch the 2560px file on pointerdown so it is usually decoded by the time the print lands.
    h.print.addEventListener('pointerdown', function () { if (o.onOpen && !h.pre) { h.pre = new Image(); h.pre.src = p.display; } });
    h.print.addEventListener('click', function () { hide(); if (o.onOpen) o.onOpen(self, i); });
    return h;
  };

  Line.prototype.ropeAt = function (x) {
    var t = Math.max(0, Math.min(1, (x - this.m) / this.span)), f = t * this.N, k = Math.min(this.N - 1, Math.floor(f)), a = f - k;
    return { y: this.o.ropeTop + this.sag * 4 * t * (1 - t) + this.u[k] * (1 - a) + this.u[k + 1] * a,
      slope: (this.u[k + 1] - this.u[k]) / this.dx };
  };

  Line.prototype.step = function (dt) {
    if (!this.visible) { this.rest(); return false; }
    var N = this.N, u = this.u, v = this.v, hs = this.hangs, n = Math.max(1, Math.round(dt / SUB)), h = dt / n, k, j, g;
    for (var s = 0; s < n; s++) {
      this.sagV += (60 * (this.sagT - this.sag) - 7 * this.sagV) * h; this.sag += this.sagV * h;
      for (k = 1; k < N; k++) v[k] += (CS2 * (u[k - 1] + u[k + 1] - 2 * u[k]) - ROPE_DAMP * v[k]) * h;
      for (k = 1; k < N; k++) u[k] += v[k] * h;
      for (j = 0; j < hs.length; j++) {
        g = hs[j];
        g.dv += (520 * -g.drop - 22 * g.dv) * h; g.drop += g.dv * h;
        if (g.empty) continue;
        var tgt = g.rest + 0.5 * Math.atan(this.ropeAt(g.x).slope) * 57.3;
        // Viscous air drag plus a little peg friction, which is what stops the last small swings.
        var fr = Math.sign(g.w) * Math.min(PEG_FRICTION, Math.abs(g.w) / h);
        g.w += (-W0 * W0 * (g.th - tgt) - 2 * ZETA * W0 * g.w - fr) * h; g.th += g.w * h;
        if (Math.abs(g.th - g.rest) > 24) { g.th = g.rest + 24 * Math.sign(g.th - g.rest); g.w *= -0.3; }
      }
    }
    var busy = Math.abs(this.sagT - this.sag) > 0.05 || Math.abs(this.sagV) > 0.5;
    for (k = 1; k < N && !busy; k++) busy = Math.abs(u[k]) > 0.08 || Math.abs(v[k]) > 3;
    for (j = 0; j < hs.length && !busy; j++) { g = hs[j]; busy = Math.abs(g.th - g.rest) > 0.45 || Math.abs(g.w) > 1.5 || Math.abs(g.drop) > 0.1 || Math.abs(g.dv) > 1.5; }
    if (!busy) this.rest();
    return busy;
  };

  Line.prototype.rest = function () {
    this.u.fill(0); this.v.fill(0); this.sag = this.sagT; this.sagV = 0;
    this.hangs.forEach(function (g) { g.th = g.rest; g.w = 0; g.drop = 0; g.dv = 0; });
    this.render();
  };

  Line.prototype.render = function () {
    var pts = [], N = this.N, top = this.o.ropeTop, taut = this.sagT ? Math.max(0, this.sag / this.sagT) : 1, half = this.o.cardW / 2;
    for (var k = 0; k <= N; k++) {
      var t = k / N;
      pts.push([this.m + k * this.dx, top + this.sag * 4 * t * (1 - t) + this.u[k] + this.wob[k] * Math.min(1, taut)]);
    }
    this.ropeEl.setAttribute('d', Pen.smooth(pts));
    for (var j = 0; j < this.hangs.length; j++) {
      var g = this.hangs[j], y = this.ropeAt(g.x).y + g.drop;
      g.el.style.transform = 'translate(' + (g.x - half).toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + g.th.toFixed(2) + 'deg)';
    }
  };

  /* ---- causes ---- */
  Line.prototype.kick = function (i, dw) {
    var g = this.hangs[i]; if (!g || g.empty || reduced()) return;
    g.w = Math.max(-140, Math.min(140, g.w + dw)); Sim.wake(this);
  };
  Line.prototype.kickAll = function (dw) { for (var i = 0; i < this.hangs.length; i++) this.kick(i, dw); };
  Line.prototype.pluck = function (x, amp, sigma) {
    if (reduced()) return; sigma = sigma || 40; amp = Math.max(-320, Math.min(320, amp));
    for (var k = 1; k < this.N; k++) { var d = (this.m + k * this.dx - x) / sigma; this.v[k] += amp * Math.exp(-d * d); }
    Sim.wake(this);
  };
  // Pointer crossing: only a flick counts (slow, deliberate travel leaves the line alone).
  // Crossing the rope plucks it in proportion to vertical speed; entering a print pushes it in
  // proportion to horizontal speed, with more torque the lower on the print you hit.
  Line.prototype.pointer = function (x0, y0, x1, y1, vx, vy) {
    if (reduced() || Math.hypot(vx, vy) < 260) return;
    if (x1 > this.m && x1 < this.W - this.m) {
      var ry = this.ropeAt(x1).y;
      if ((y0 - ry) * (y1 - ry) < 0) {
        this.pluck(x1, vy * 0.28, 42);
        for (var i = 0; i < this.hangs.length; i++) {
          var d = Math.abs(this.hangs[i].x - x1); if (d < 120) this.kick(i, vx * 0.02 * (1 - d / 120));
        }
      }
    }
    var half = this.o.cardW / 2, self = this;
    this.hangs.forEach(function (g, j) {
      var top = self.ropeAt(g.x).y + 6, inside = function (x, y) { return x > g.x - half && x < g.x + half && y > top && y < top + self.printH; };
      if (inside(x1, y1) && !inside(x0, y0)) self.kick(j, vx * 0.045 * Math.max(0.25, Math.min(1, (y1 - top) / self.printH)));
    });
  };
  Line.prototype.peg = function (i, open) { this.hangs[i].peg.classList.toggle('open', !!open); };
  Line.prototype.release = function (i) {        // weight leaves the rope: it springs up, neighbours swing
    var g = this.hangs[i]; g.empty = true; g.th = g.rest; g.w = 0;
    this.pluck(g.x, -170, 55); this.kick(i - 1, -26); this.kick(i + 1, 26); this.kick(i - 2, -10); this.kick(i + 2, 10);
  };
  Line.prototype.land = function (i, dir) {      // weight comes back: the rope dips, the print swings once
    var g = this.hangs[i]; g.empty = false; g.th = g.rest; g.w = 0;
    this.pluck(g.x, 150, 55); this.kick(i, (dir || 1) * 34);
  };

  // A new line is strung: the rope is pulled taut nail to nail, relaxes into its sag, then a hand
  // pegs the prints on left to right; each lands with a small drop and swing.
  Line.prototype.string = function (done) {
    var self = this, r = Pen.rng(this.o.seed + 'peg');
    if (reduced()) { this.rest(); if (done) done(); return; }
    this.hangs.forEach(function (g) { g.el.classList.add('unpegged'); });
    this.sag = 0; this.sagV = 0; this.render();
    var L = this.ropeEl.getTotalLength();
    this.ropeEl.style.strokeDasharray = L + ' ' + (L + 4);
    var a = this.ropeEl.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 460, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'both' });
    this.svg.querySelectorAll('.nail-g').forEach(function (n, q) { n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: q * 380, fill: 'both' }); });
    a.onfinish = function () { self.ropeEl.style.strokeDasharray = ''; a.cancel(); self.sagV = 0; Sim.wake(self); };
    this.hangs.forEach(function (g, i) {
      setTimeout(function () {
        g.drop = -20; g.dv = 0; g.el.classList.remove('unpegged');
        g.w = (r() - 0.5) * 70; Sim.wake(self);
        if (i === self.hangs.length - 1 && done) setTimeout(done, 300);
      }, 560 + i * 120);
    });
  };
  Line.prototype.destroy = function () { this.io.disconnect(); Sim.bodies.delete(this); this.host.innerHTML = ''; };

  window.G06 = { Line: Line, Sim: Sim, pick: pick, shuffled: shuffled, all: ALL, esc: esc };
})();
