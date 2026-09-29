/* r2-06-line.js — the rope, the pegs and the prints. Physics clock only.
   New in round 2: every print is a weight on the rope. The rope's rest shape is its own shallow sag
   plus a kink under each peg (a taut string under point loads). Each weight is a damped spring (2.3 Hz,
   one ~35% overshoot), so taking a print off makes the rope spring up where the weight left, carrying
   its neighbours; hanging it back makes the line sag again. A small twang also runs along the wave.
   Each print is a damped pendulum pivoting on its peg. Every line shares one rAF loop that sleeps. */
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
  function shuffled(seed) {
    var a = ALL.slice(), r = Pen.rng(seed);
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function reduced() { return Pen.reduced(); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  // Deflection of a taut string at t under a unit load at ti (both 0..1 along the span).
  function G(t, ti) { return t < ti ? t * (1 - ti) : ti * (1 - t); }

  /* ---- the one loop ---- */
  var Sim = { bodies: new Set(), raf: 0, last: 0, subs: [] };
  Sim.wake = function (b) {
    if (reduced() && !b.always) { b.render(); return; }
    Sim.bodies.add(b);
    if (!Sim.raf) { Sim.last = performance.now(); Sim.raf = requestAnimationFrame(Sim.tick); Sim.emit(); }
  };
  Sim.tick = function () {
    var now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - Sim.last) / 1000)); Sim.last = now;
    Sim.bodies.forEach(function (b) { var alive = b.step(dt); b.render(); if (!alive) Sim.bodies.delete(b); });
    Sim.raf = Sim.bodies.size ? requestAnimationFrame(Sim.tick) : 0;
    if (!Sim.raf) Sim.emit();
  };
  Sim.emit = function () { var on = !!Sim.raf; Sim.subs.forEach(function (f) { f(on); }); };
  Sim.on = function (f) { Sim.subs.push(f); };

  // One pen at every size: the stroke never scales (non-scaling-stroke), so at 10px wide the peg reads as
  // a solid ink clip, and in the viewer the same drawing opens up into a wooden peg with its spring.
  function pegSVG(extra) {
    return '<svg class="peg' + (extra ? ' ' + extra : '') + '" viewBox="0 0 20 44" aria-hidden="true">' +
      '<g class="jaw jaw-l"><path d="M3 2Q3 .8 4.2 .8H9.3V43.2H5.3Q4.2 43.2 4.1 42Q2.7 21 3 2Z"/><path class="spring" d="M10 15L6.4 5.2"/></g>' +
      '<g class="jaw jaw-r"><path d="M10.7 .8H15.8Q17 .8 17 2Q17.4 22 15.9 42Q15.8 43.2 14.7 43.2H10.7Z"/><path class="spring" d="M10 15L13.6 5.2"/></g>' +
      '<circle class="coil" cx="10" cy="15" r="2.7"/></svg>';
  }

  var penOn = null, lastMv = null, kbd = false;
  // Focus marks follow the keyboard, not the browser's guess: a tap that lands focus never draws one.
  document.addEventListener('keydown', function () { kbd = true; }, true);
  document.addEventListener('pointerdown', function () { kbd = false; }, true);
  var SUB = 1 / 240, WAVE = 2600, ROPE_DAMP = 2.6, LOAD_K = Math.pow(2 * Math.PI * 2.3, 2), LOAD_C = 2 * 0.28 * 2 * Math.PI * 2.3, PEG_FRICTION = 12, W0 = 2 * Math.PI * 0.95, ZETA = 0.2;

  function Line(host, photos, opt) {
    this.host = host; this.photos = photos; this.hangs = []; this.visible = true;
    this.o = Object.assign({ cardW: 148, pad: 6, cap: 15, meta: 10, margin: 30, ropeTop: 26, base: null, weight: 34,
      pack: false, gap: 18, lead: null, seed: 'line', hidden: false, autoload: true, sizes: null, onOpen: null, onFocus: null }, opt || {});
    this.build();
    var self = this;
    this.io = new IntersectionObserver(function (es) {
      self.visible = es[es.length - 1].isIntersecting; if (!self.visible) self.rest();
    }, { rootMargin: '120px' });
    this.io.observe(host);
  }

  Line.prototype.build = function () {
    var o = this.o, host = this.host, n = this.photos.length, r = Pen.rng(o.seed), cw = o.cardW, xs = [], W, i, k;
    host.classList.add('g-line'); host.innerHTML = '';
    host.style.setProperty('--pad', o.pad + 'px'); host.style.setProperty('--cap', o.cap + 'px'); host.style.setProperty('--meta', o.meta + 'px');
    if (o.pack) {
      var lead = o.lead != null ? o.lead : o.margin + 30;
      W = lead * 2 + n * cw + (n - 1) * o.gap;
      for (i = 0; i < n; i++) xs.push(lead + i * (cw + o.gap) + cw / 2);
      host.style.width = W + 'px';
    } else {
      W = host.clientWidth;
      var slot = (W - 2 * o.margin) / Math.max(n, 6), off = o.margin + (W - 2 * o.margin - slot * n) / 2, jit = Math.max(0, Math.min(10, (slot - cw) / 3));
      for (i = 0; i < n; i++) xs.push(off + slot * (i + 0.5) + (r() - 0.5) * 2 * jit);
    }
    this.W = W; this.m = o.margin; this.span = W - 2 * o.margin;
    var N = this.N = Math.max(20, Math.round(this.span / 16));
    this.dx = this.span / N; this.cs2 = (WAVE / this.dx) * (WAVE / this.dx);
    this.u = new Float32Array(N + 1); this.v = new Float32Array(N + 1);
    this.base = new Float32Array(N + 1); this.load = new Float32Array(N + 1); this.wob = new Float32Array(N + 1);
    var sag0 = o.base != null ? o.base : Math.min(10, this.span * 0.008), deep = 0;
    for (k = 0; k <= N; k++) {
      var t = k / N, s = sag0 * 4 * t * (1 - t);
      this.base[k] = s; this.wob[k] = k === 0 || k === N ? 0 : (r() - 0.5) * 1.1;
      for (i = 0; i < n; i++) s += o.weight * G(t, (xs[i] - this.m) / this.span);
      deep = Math.max(deep, s);
    }
    this.deep = deep; this.slack = o.hidden ? 0 : 1; this.slackV = 0;
    var winW = cw - 4 - 2 * o.pad;
    this.printH = 4 + o.pad + winW * 0.75 + 5 + o.cap * 1.4 + o.meta * 1.5 + 5;

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'rope'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', W);
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
    var self0 = this;
    this.hangs.forEach(function (g) {
      g.Gk = new Float32Array(N + 1); g.lw = 0; g.lv = 0;
      for (var q = 1; q < N; q++) g.Gk[q] = o.weight * G(q / N, g.ti);
    });
    if (!o.hidden) for (i = 0; i < n; i++) this.addLoad(i, 1, true);
    this.measure();
    var self = this;
    if (document.fonts) document.fonts.ready.then(function () { if (self.svg) self.measure(); });
  };

  // Long place names wrap onto a second line, as on the live page, so size the line from real prints.
  Line.prototype.measure = function () {
    var tall = 0;
    this.hangs.forEach(function (g) { tall = Math.max(tall, g.print.offsetHeight); });
    if (tall) this.printH = tall;
    this.H = Math.round(this.o.ropeTop + this.deep + 6 + this.printH + 30);
    this.host.style.height = this.H + 'px'; this.svg.setAttribute('height', this.H);
    this.render();
  };

  Line.prototype.makeHang = function (p, x, i) {
    var o = this.o, self = this, el = document.createElement('div');
    el.className = 'hang' + (o.hidden ? ' unpegged' : ''); el.style.width = o.cardW + 'px';
    el.innerHTML = pegSVG() + '<button type="button" class="print" aria-label="Unclip photo · 取下来看: ' + esc(p.loc) + ', ' + p.dateLabel + '">' +
      '<span class="win"><img alt="" width="400" height="300" decoding="async"><span class="chem"></span></span>' +
      '<span class="cap">' + esc(p.loc) + '</span><span class="meta">' + p.dateLabel + ' · ' + p.catLabel + '</span></button>';
    this.host.appendChild(el);
    var h = { el: el, i: i, p: p, x: x, ti: (x - this.m) / this.span, th: p.rot, w: 0, rest: p.rot, drop: 0, dv: 0,
      empty: !!o.hidden, loaded: false, peg: el.querySelector('.peg'), print: el.querySelector('.print'), img: el.querySelector('img'), chem: el.querySelector('.chem') };
    h.img.sizes = o.sizes || o.cardW + 'px';
    if (o.autoload) { h.img.loading = 'lazy'; h.img.srcset = p.srcset; h.img.src = p.src; }
    var pen = Pen.annotate(el.querySelector('.cap'), 'underline', { manual: true, width: 2, gap: -1, seed: 'cap' + p.id });
    // Hover intent: a pointer sweeping across the line should not leave a trail of coral marks.
    // Coral is spent once per view: showing one caption mark retracts whichever one was showing.
    var tm = 0, show = function () { if (penOn && penOn !== pen) penOn.hide(); penOn = pen; pen.rebuild(); pen.show(); },
      hide = function () { clearTimeout(tm); tm = 0; pen.hide(); if (penOn === pen) penOn = null; };
    // Intent = the pointer has slowed down over this print (a flick passing through never marks anything).
    h.print.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var t = e.timeStamp, sp = lastMv && t > lastMv.t ? Math.hypot(e.clientX - lastMv.x, e.clientY - lastMv.y) / (t - lastMv.t) * 1000 : 0;
      lastMv = { x: e.clientX, y: e.clientY, t: t };
      if (sp > 240) { clearTimeout(tm); tm = 0; } else if (!tm && penOn !== pen) tm = setTimeout(show, 90);
    });
    h.print.addEventListener('pointerleave', hide);
    h.print.addEventListener('focus', function () { if (kbd) { show(); if (o.onFocus) o.onFocus(self, i); } });
    h.print.addEventListener('blur', hide);
    // Fetch the 2560px file on pointerdown so it is usually decoded by the time the print lands.
    h.print.addEventListener('pointerdown', function () { if (!h.pre) { h.pre = new Image(); h.pre.src = p.display; } });
    h.print.addEventListener('click', function (e) { hide(); if (o.onOpen && !h.empty) o.onOpen(self, i, e); });
    return h;
  };

  Line.prototype.yk = function (k) { return this.o.ropeTop + this.slack * this.base[k] + this.load[k] + this.u[k]; };
  Line.prototype.ropeAt = function (x) {
    var t = clamp((x - this.m) / this.span, 0, 1), f = t * this.N, k = Math.min(this.N - 1, Math.floor(f)), a = f - k;
    var y0 = this.yk(k), y1 = this.yk(k + 1);
    return { y: y0 * (1 - a) + y1 * a, slope: (y1 - y0) / this.dx };
  };
  Line.prototype.tilt = function (g) { return g.rest + 0.5 * Math.atan(this.ropeAt(g.x).slope) * 57.3; };
  // Where a print hangs, in viewport coordinates (the viewer flies home to this, tracking scroll and rope).
  Line.prototype.pivot = function (i) {
    var g = this.hangs[i], r = this.host.getBoundingClientRect();
    return { x: r.left + g.x, y: r.top + this.ropeAt(g.x).y, tilt: this.tilt(g), h: g.print.offsetHeight || this.printH };
  };

  // Put a print's weight on the rope (sign 1) or take it off (-1). The weight arrives or leaves through a
  // damped spring, never in one frame: that spring is the rope springing up, and sagging back.
  Line.prototype.addLoad = function (j, sign, silent) {
    var g = this.hangs[j]; if (!g || g.loaded === (sign > 0)) return;
    g.loaded = sign > 0;
    if (silent || reduced()) { g.lw = g.loaded ? 1 : 0; g.lv = 0; this.sumLoad(); if (!silent) this.render(); return; }
    Sim.wake(this);
  };
  Line.prototype.sumLoad = function () {
    var L = this.load, N = this.N, hs = this.hangs; L.fill(0);
    for (var j = 0; j < hs.length; j++) { var g = hs[j]; if (!g.lw) continue; for (var k = 1; k < N; k++) L[k] += g.lw * g.Gk[k]; }
  };

  Line.prototype.step = function (dt) {
    if (!this.visible) { this.rest(); return false; }
    var N = this.N, u = this.u, v = this.v, hs = this.hangs, n = Math.max(1, Math.round(dt / SUB)), h = dt / n, k, j, g, c2 = this.cs2;
    for (var s = 0; s < n; s++) {
      if (this.slack !== 1 || this.slackV) { this.slackV += (60 * (1 - this.slack) - 7 * this.slackV) * h; this.slack += this.slackV * h; }
      var moved = false;
      for (j = 0; j < hs.length; j++) {
        g = hs[j]; var lt = g.loaded ? 1 : 0;
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
        var tgt = this.tilt(g);
        // Viscous air drag plus a little peg friction, which is what stops the last small swings.
        var fr = Math.sign(g.w) * Math.min(PEG_FRICTION, Math.abs(g.w) / h);
        g.w += (-W0 * W0 * (g.th - tgt) - 2 * ZETA * W0 * g.w - fr) * h; g.th += g.w * h;
        if (Math.abs(g.th - g.rest) > 26) { g.th = g.rest + 26 * Math.sign(g.th - g.rest); g.w *= -0.3; }
      }
    }
    var busy = Math.abs(1 - this.slack) > 0.002 || Math.abs(this.slackV) > 0.05;
    for (k = 1; k < N && !busy; k++) busy = Math.abs(u[k]) > 0.08 || Math.abs(v[k]) > 3;
    for (j = 0; j < hs.length && !busy; j++) { g = hs[j]; busy = Math.abs((g.loaded ? 1 : 0) - g.lw) > 0.003 || Math.abs(g.lv) > 0.03 || (!g.empty && (Math.abs(g.th - this.tilt(g)) > 0.4 || Math.abs(g.w) > 1.5)) || Math.abs(g.drop) > 0.1 || Math.abs(g.dv) > 1.5; }
    if (!busy) this.rest();
    return busy;
  };

  Line.prototype.rest = function () {
    this.u.fill(0); this.v.fill(0); this.slack = 1; this.slackV = 0;
    var self = this;
    this.hangs.forEach(function (g) { g.lw = g.loaded ? 1 : 0; g.lv = 0; });
    this.sumLoad();
    this.hangs.forEach(function (g) { g.w = 0; g.drop = 0; g.dv = 0; g.th = self.tilt(g); });
    this.render();
  };

  Line.prototype.render = function () {
    if (!this.svg) return;
    var pts = [], N = this.N, half = this.o.cardW / 2, calm = Math.min(1, this.slack);
    for (var k = 0; k <= N; k++) pts.push([this.m + k * this.dx, this.yk(k) + this.wob[k] * calm]);
    this.ropeEl.setAttribute('d', Pen.smooth(pts));
    for (var j = 0; j < this.hangs.length; j++) {
      var g = this.hangs[j], y = this.ropeAt(g.x).y + g.drop;
      g.el.style.transform = 'translate(' + (g.x - half).toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + g.th.toFixed(2) + 'deg)';
    }
  };

  /* ---- causes ---- */
  Line.prototype.kick = function (i, dw) {
    var g = this.hangs[i]; if (!g || g.empty || reduced()) return;
    g.w = clamp(g.w + dw, -140, 140); Sim.wake(this);
  };
  Line.prototype.kickAll = function (dw) { for (var i = 0; i < this.hangs.length; i++) this.kick(i, dw); };
  Line.prototype.pluck = function (x, amp, sigma) {
    if (reduced()) return; sigma = sigma || 40; amp = clamp(amp, -320, 320);
    for (var k = 1; k < this.N; k++) { var d = (this.m + k * this.dx - x) / sigma; this.v[k] += amp * Math.exp(-d * d); }
    Sim.wake(this);
  };
  // What a fast pointer pass would do to this line. Nothing fires yet: the flick detector decides later,
  // from the pointer's exit speed, whether this was a flick or an approach to click.
  Line.prototype.crossings = function (x0, y0, x1, y1, vx, vy) {
    var out = [], self = this;
    if (reduced() || !this.visible) return out;
    if (x1 > this.m && x1 < this.W - this.m && Math.abs(vy) > 320) {
      var ry = this.ropeAt(x1).y;
      if ((y0 - ry) * (y1 - ry) < 0) out.push({ exit: 420, fire: function () {
        self.pluck(x1, vy * 0.22, 42);
        self.hangs.forEach(function (g, i) { var d = Math.abs(g.x - x1); if (d < 120) self.kick(i, vx * 0.02 * (1 - d / 120)); });
      } });
    }
    this.hangs.forEach(function (g, j) {
      if (g.empty) return;
      var top = self.ropeAt(g.x).y + 6;
      if ((x0 - g.x) * (x1 - g.x) < 0 && y1 > top && y1 < top + self.printH) {
        var lever = clamp((y1 - top) / self.printH, 0.25, 1);          // hit it low and it swings more
        out.push({ exit: 220, fire: function () { self.kick(j, vx * 0.045 * lever); } });
      }
    });
    return out;
  };

  Line.prototype.peg = function (i, open) { this.hangs[i].peg.classList.toggle('open', !!open); };
  // The peg closes on the rope: jaws shut past closed and settle, plus two stepped frames of snap marks.
  Line.prototype.snap = function (i, marks) {
    var g = this.hangs[i]; g.peg.classList.remove('open');
    if (reduced()) return;
    g.peg.querySelectorAll('.jaw').forEach(function (jw, q) {
      var s = q ? -1 : 1;
      jw.animate([{ transform: 'rotate(' + 15 * s + 'deg)' }, { transform: 'rotate(' + -3.5 * s + 'deg)', offset: 0.6 }, { transform: 'rotate(0deg)' }],
        { duration: 140, easing: 'cubic-bezier(.5,0,.7,1)' });
    });
    if (!marks) return;
    var y = this.ropeAt(g.x).y + g.drop, sv = document.createElementNS(NS, 'svg');
    sv.setAttribute('class', 'snapmark'); sv.setAttribute('width', '64'); sv.setAttribute('height', '40');
    sv.style.left = (g.x - 32) + 'px'; sv.style.top = (y - 24) + 'px';
    var f = function (o) {
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
    var g = this.hangs[i]; g.empty = true; g.w = 0;
    this.addLoad(i, -1); this.pluck(g.x, -110, 26); this.kick(i - 1, -10); this.kick(i + 1, 10);
    Sim.wake(this);
  };
  // Weight comes back: the peg snaps shut on the rope, the line sags again, and the print keeps the
  // swing it arrived with (angle and angular velocity handed over from the flight).
  Line.prototype.land = function (i, th, w) {
    var g = this.hangs[i]; g.empty = false; g.th = th; g.w = clamp(w, -110, 110);
    this.addLoad(i, 1); this.pluck(g.x, 90, 26); this.snap(i, true);
    Sim.wake(this);
  };

  // A new line is strung: drawn nail to nail taut, it relaxes into its sag, then a hand pegs the prints
  // on left to right. Each one lands with a small drop and swing, and the rope dips under its weight.
  Line.prototype.string = function (done) {
    var self = this, r = Pen.rng(this.o.seed + 'peg');
    if (reduced()) {
      this.hangs.forEach(function (g, j) { g.empty = false; self.addLoad(j, 1, true); g.el.classList.remove('unpegged'); if (g.onPeg) g.onPeg(); });
      this.rest(); if (done) done(); return;
    }
    this.slack = 0; this.slackV = 0; this.render();
    var L = this.ropeEl.getTotalLength();
    this.ropeEl.style.strokeDasharray = L + ' ' + (L + 4);
    var a = this.ropeEl.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 460, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'both' });
    this.svg.querySelectorAll('.nail-g').forEach(function (n, q) { n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: q * 380, fill: 'both' }); });
    a.onfinish = function () { self.ropeEl.style.strokeDasharray = ''; a.cancel(); self.slackV = 0; Sim.wake(self); };
    this.hangs.forEach(function (g, i) {
      setTimeout(function () {
        if (!self.svg) return;
        g.el.classList.remove('unpegged'); g.empty = false;
        g.drop = -18; g.dv = 0; g.th = self.tilt(g) + (r() - 0.5) * 8; g.w = (r() - 0.5) * 60;
        self.addLoad(i, 1); self.snap(i, false); Sim.wake(self);
        if (g.onPeg) g.onPeg();
        if (i === self.hangs.length - 1 && done) setTimeout(done, 320);
      }, 560 + i * 130);
    });
  };
  Line.prototype.destroy = function () { this.io.disconnect(); Sim.bodies.delete(this); this.host.innerHTML = ''; this.svg = null; };

  window.G06 = { Line: Line, Sim: Sim, shuffled: shuffled, all: ALL, esc: esc, pegSVG: pegSVG, clamp: clamp };
})();
