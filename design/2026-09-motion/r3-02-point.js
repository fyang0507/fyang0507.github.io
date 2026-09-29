/* r3-02-point.js — the two marks that sit outside the tiers' stroke.
   FocusMark  ink corner brackets 「 」 for keyboard focus, independent of tiers (unchanged from r2).
   PointMark  the pointer: a separate mark, not tier 3. A short coral arrow (the ArrowFit glyph) at the
              one thing a view asks of you. It is written once when the view is first seen — the note
              first if the target's label doesn't say why, then one confident pass, then one small
              settle toward the target — and acting on its target lifts it for the rest of the session. */
(function () {
  var A = R2Anim, EASE = A.EASE;
  function f1(n) { return Math.round(n * 10) / 10; }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }

  /* ---- focus: 「 」 ---- */
  function FocusMark(host, target, opt) {
    this.host = host; this.target = target || host; this.opt = opt || {}; this.on = false;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    this.svg = A.node('svg', { 'aria-hidden': 'true', width: 1, height: 1, 'class': 'fm' });
    this.svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:3';
    this.p1 = A.node('path', { 'class': 'fm-c' }); this.p2 = A.node('path', { 'class': 'fm-c' });
    this.svg.appendChild(this.p1); this.svg.appendChild(this.p2); host.appendChild(this.svg);
    this.a = new A.Anim({ S1: 0, E1: 0, S2: 0, E2: 0 }, this.render.bind(this));
    this.build();
  }
  FocusMark.prototype.build = function () {
    var o = this.opt, b = A.box(this.host, this.target), r = Pen.rng(((this.target.textContent || '').trim() || 'f') + '|focus');
    var g = o.gap == null ? 4 : o.gap, big = o.big, arm = big ? 22 : Math.min(12, b.w * .32), v = big ? 16 : Math.min(7, b.h * .3);
    var j = function () { return (r() - .5) * 1.1; }, x0 = b.x - (o.gl == null ? g : o.gl), x1 = b.x + b.w + g, y0 = b.y - (o.gy == null ? 3 : o.gy), y1 = b.y + b.h + (o.gy == null ? 3 : o.gy);
    this.p1.setAttribute('d', 'M' + f1(x0 + arm) + ' ' + f1(y0 + j()) + ' L' + f1(x0) + ' ' + f1(y0) + ' L' + f1(x0 + j()) + ' ' + f1(y0 + v));
    this.p2.setAttribute('d', 'M' + f1(x1 + j()) + ' ' + f1(y1 - v) + ' L' + f1(x1) + ' ' + f1(y1) + ' L' + f1(x1 - arm) + ' ' + f1(y1 + j()));
    this.L1 = this.p1.getTotalLength(); this.L2 = this.p2.getTotalLength();
    this.render();
  };
  FocusMark.prototype.render = function () {
    var v = this.a.v; A.dash(this.p1, this.L1, v.S1, v.E1); A.dash(this.p2, this.L2, v.S2, v.E2);
  };
  FocusMark.prototype.set = function (on, instant) {
    if (on === this.on && !instant) return;
    var a = this.a, v = a.v; this.on = on; a.stop();
    if (instant || Pen.reduced()) { v.S1 = v.S2 = 0; v.E1 = v.E2 = on ? 1 : 0; this.render(); return; }
    if (on) { v.S1 = v.S2 = 0; a.go('E1', 1, 140, 0, EASE.pen); a.go('E2', 1, 140, 70, EASE.pen); }
    else {
      var reset = function () { v.S1 = v.S2 = v.E1 = v.E2 = 0; };
      a.go('S1', v.E1, 120, 0, EASE.lift); a.go('S2', v.E2, 120, 0, EASE.lift, reset);
    }
  };

  /* ---- the pointer ---- */
  // container: the positioned box the arrow lives in (it scrolls with it). opt: seed · key
  // (sessionStorage) · note (html) · bounds() → the view, in the container's frame · scan (root to
  // collect obstacles from) · skip · obstacles() (override) · order · prefer ('row' | 'stack').
  var SETTLE = [0, 2.2, 1.2];   // px toward the target, one held frame each: a small push, then rest

  function PointMark(container, target, opt) {
    this.c = container; this.target = target; this.opt = opt; this.shown = false; this.fit = null;
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    this.svg = A.node('svg', { 'aria-hidden': 'true', width: 1, height: 1, 'class': 'pt' });
    this.svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:7';
    this.g = A.node('g', {});
    this.shaft = A.node('path', { 'class': 'pt-s' }); this.head = A.node('path', { 'class': 'pt-s' });
    this.g.appendChild(this.shaft); this.g.appendChild(this.head); this.svg.appendChild(this.g);
    container.appendChild(this.svg);
    if (opt.note) {
      this.note = document.createElement('span');
      this.note.className = 'pt-note'; this.note.setAttribute('aria-hidden', 'true');
      this.note.innerHTML = opt.note; container.appendChild(this.note);
      this.nEn = this.note.querySelector('.en'); this.nZh = this.note.querySelector('.zh');
    }
    this.a = new A.Anim({ sS: 0, sE: 0, hS: 0, hE: 0, n: 0, st: 0 }, this.render.bind(this));
    this.build();
  }
  PointMark.prototype.measure = function (layout) {
    var n = this.note; n.className = 'pt-note ' + layout; n.style.transform = 'none';
    return { w: n.offsetWidth, h: n.offsetHeight };
  };
  PointMark.prototype.solve = function () {
    var o = this.opt, F = this.c.getBoundingClientRect();
    var lines = [].map.call(this.target.getClientRects(), function (r) { return ArrowFit.rel(r, F); }).filter(function (r) { return r.w > 0; });
    var sizes = this.note ? { row: this.measure('row'), stack: this.measure('stack') } : null;
    var obs = o.obstacles ? o.obstacles() : ArrowFit.collect(o.scan || this.c, this.c, [this.target, this.note, this.svg].concat(o.skip || []));
    return ArrowFit.solve({ target: lines, bounds: o.bounds(), obstacles: obs, note: sizes, seed: o.seed, order: o.order, prefer: o.prefer });
  };
  PointMark.prototype.build = function () { this.apply(this.solve()); };
  PointMark.prototype.apply = function (fit) {
    this.fit = fit;
    if (fit) {
      var g = fit.g;
      this.shaft.setAttribute('d', g.shaft); this.head.setAttribute('d', g.head);
      this.L = this.shaft.getTotalLength(); this.Lh = this.head.getTotalLength();
      if (this.note && fit.note) {
        var n = fit.note, s = this.note.style, rot = -1.5 - Pen.rng(this.opt.seed + '|note')() * 2;
        this.note.className = 'pt-note ' + n.layout + ' al-' + n.align;
        s.left = f1(n.x) + 'px'; s.top = f1(n.y) + 'px';
        s.transformOrigin = n.ax * 100 + '% ' + n.ay * 100 + '%';   // turn about the corner at the tail
        s.transform = 'rotate(' + f1(rot) + 'deg)';
      }
    }
    this.render();
  };
  PointMark.prototype.render = function () {
    var v = this.a.v, fit = this.fit;
    this.svg.style.visibility = fit ? 'visible' : 'hidden';
    if (this.note) this.note.style.visibility = fit && fit.note && v.n > .01 ? 'visible' : 'hidden';
    if (!fit) return;
    A.dash(this.shaft, this.L, v.sS, v.sE); A.dash(this.head, this.Lh, v.hS, v.hE);
    var k = SETTLE[Math.min(2, Math.floor(v.st))];
    this.g.setAttribute('transform', k ? 'translate(' + f1(fit.g.ux * k) + ' ' + f1(fit.g.uy * k) + ')' : '');
    if (this.note && fit.note) {   // written left → right, the English first, then the Chinese
      var e = clamp01(v.n / .55), z = clamp01((v.n - .45) / .55);
      this.nEn.style.clipPath = 'inset(-30% ' + ((1 - e) * 100).toFixed(1) + '% -30% -6%)';
      this.nZh.style.clipPath = 'inset(-30% ' + ((1 - z) * 100).toFixed(1) + '% -30% -6%)';
    }
  };
  // The note (if any), a 60 ms lift back to the tail, the shaft in one pass, the head, one settle, still.
  PointMark.prototype.show = function (instant) {
    var a = this.a, v = a.v; a.stop(); this.shown = true;
    if (!this.fit) return 0;
    if (instant || Pen.reduced()) { v.sS = v.hS = 0; v.sE = v.hE = v.n = 1; v.st = 2.999; this.render(); return 0; }
    v.sS = v.hS = v.sE = v.hE = v.n = v.st = 0;
    var t = 0;
    if (this.fit.note) { a.go('n', 1, 420, 0, EASE.lin); t = 480; }   // then the pen lifts back to the tail
    var ds = A.drawDur(this.L);
    a.go('sE', 1, ds, t, EASE.pen);
    var th = t + ds * .84;
    a.go('hE', 1, 130, th, EASE.pen);
    return a.go('st', 2.999, 180, th + 200, EASE.lin);
  };
  // Acted on: the pen lifts off toward the target — tail chases head — and the note goes with it.
  PointMark.prototype.lift = function (instant) {
    if (!this.shown) return;
    var a = this.a, v = a.v, self = this; this.shown = false; a.stop();
    if (this.opt.key) try { sessionStorage.setItem(this.opt.key, '1'); } catch (e) { /* private mode */ }
    if (instant || Pen.reduced()) { v.sE = v.hE = v.n = v.sS = v.hS = 0; this.render(); return; }
    a.go('sS', v.sE, 180, 0, EASE.lift);
    a.go('hS', v.hE, 130, 120, EASE.lift, function () { v.sS = v.sE = v.hS = v.hE = 0; self.render(); });
    if (this.note) a.go('n', 0, 180, 0, EASE.lift);
  };
  PointMark.prototype.done = function () { try { return sessionStorage.getItem(this.opt.key) === '1'; } catch (e) { return false; } };
  PointMark.prototype.reset = function () {
    try { if (this.opt.key) sessionStorage.removeItem(this.opt.key); } catch (e) { /* private mode */ }
    var v = this.a.v; this.a.stop(); this.shown = false; v.sS = v.sE = v.hS = v.hE = v.n = v.st = 0; this.render();
  };
  // Re-fit after a layout change. The same answer changes nothing (a draw in progress carries on);
  // a new one is applied at rest if the mark is showing.
  function sig(f) { return f ? f.g.shaft + f.g.head + (f.note ? f.note.layout + f.note.x.toFixed(1) + f.note.y.toFixed(1) : '') : ''; }
  PointMark.prototype.refit = function () {
    var next = this.solve();
    if (sig(next) === sig(this.fit)) { if (this.fit && this.fit.note) this.apply(this.fit); return; }
    this.a.stop(); this.apply(next);
    if (this.shown) this.show(true);
  };

  window.FocusMark = FocusMark;
  window.PointMark = PointMark;
})();
