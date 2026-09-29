/* r2-02-point.js — the two marks that sit outside the tiers' stroke:
   FocusMark  ink corner brackets 「 」 for keyboard focus, independent of tiers (round 1's B).
   PointMark  tier 3: a coral pen arrow that comes in from the margin toward the one thing a view asks
              of you, taps twice on the hand's clock ("here, here"), then holds still. It is drawn
              once per view; acting on its target lifts it for the rest of the session (sessionStorage). */
(function () {
  var A = R2Anim, EASE = A.EASE;
  function f1(n) { return Math.round(n * 10) / 10; }

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

  /* ---- tier 3: point ---- */
  // container: the positioned box the arrow lives in (it scrolls with it). geo(tb, cw) returns
  // { a, b, bend, head, note: { x, y, align } } in the container's frame, from the target box tb.
  function PointMark(container, target, opt) {
    this.c = container; this.target = target; this.opt = opt; this.shown = false;
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
    }
    this.a = new A.Anim({ sS: 0, sE: 0, hS: 0, hE: 0, n: 0, tap: 0 }, this.render.bind(this));
    this.build();
  }
  PointMark.prototype.build = function () {
    var tb = A.box(this.c, this.target), geo = this.opt.geo(tb, this.c.clientWidth);
    var ar = Pen.arrow(geo.a, geo.b, this.opt.seed || 'point', { bend: geo.bend, head: geo.head || 9 });
    this.shaft.setAttribute('d', ar.shaft); this.head.setAttribute('d', ar.head);
    this.L = this.shaft.getTotalLength(); this.Lh = this.head.getTotalLength();
    var p = this.shaft.getPointAtLength(Math.max(0, this.L - 6)), dx = geo.b[0] - p.x, dy = geo.b[1] - p.y, m = Math.hypot(dx, dy) || 1;
    this.ux = dx / m; this.uy = dy / m;                      // the tap goes along the arrow's last direction
    if (this.note && geo.note) {
      var n = geo.note, s = this.note.style;
      s.left = f1(n.x) + 'px'; s.top = f1(n.y) + 'px';
      s.transform = 'translate(' + (n.align === 'right' ? '-100%' : n.align === 'center' ? '-50%' : '0') + ',-50%) rotate(' + (n.rot || -3) + 'deg)';
    }
    this.render();
  };
  PointMark.prototype.render = function () {
    var v = this.a.v, taps = [0, 2.6, 0, 2.6, 0], k = taps[Math.min(4, Math.floor(v.tap))];
    A.dash(this.shaft, this.L, v.sS, v.sE); A.dash(this.head, this.Lh, v.hS, v.hE);
    this.g.setAttribute('transform', k ? 'translate(' + f1(this.ux * k) + ' ' + f1(this.uy * k) + ')' : '');
    if (this.note) {
      this.note.style.visibility = v.n > .01 ? 'visible' : 'hidden';
      this.note.style.clipPath = 'inset(-20% ' + ((1 - v.n) * 100).toFixed(1) + '% -20% -4%)';
    }
  };
  // Write the note (if any), draw the arrow from it, land the head, tap-tap, hold.
  PointMark.prototype.show = function (instant) {
    var a = this.a, v = a.v; this.shown = true; a.stop();
    if (instant || Pen.reduced()) { v.sS = v.hS = 0; v.sE = v.hE = 1; v.n = 1; v.tap = 0; this.render(); return 0; }
    v.sS = v.hS = 0; v.sE = v.hE = 0; v.n = 0; v.tap = 0;
    var t = 0;
    if (this.note) { a.go('n', 1, 380, 0, EASE.lin); t = 300; }
    var ds = A.drawDur(this.L);
    a.go('sE', 1, ds, t, EASE.pen);
    var th = t + ds * .82;
    a.go('hE', 1, 140, th, EASE.pen);
    // Two taps on the hand's clock: 5 held frames at ~11 fps, not a tween.
    var end = a.go('tap', 4.999, 450, th + 200, EASE.lin, function () { v.tap = 0; });
    return end;
  };
  // Acted on: the pen lifts off toward the target — tail chases head — and the note goes with it.
  PointMark.prototype.lift = function (instant) {
    if (!this.shown) return;
    var a = this.a, v = a.v, self = this; this.shown = false; a.stop(); v.tap = 0;
    if (this.opt.key) try { sessionStorage.setItem(this.opt.key, '1'); } catch (e) { /* private mode */ }
    if (instant || Pen.reduced()) { v.sE = v.hE = v.n = 0; v.sS = v.hS = 0; this.render(); return; }
    a.go('sS', v.sE, 240, 0, EASE.lift);
    a.go('hS', v.hE, 150, 170, EASE.lift, function () { v.sS = v.sE = v.hS = v.hE = 0; self.render(); });
    if (this.note) a.go('n', 0, 180, 0, EASE.lift);
  };
  PointMark.prototype.done = function () { try { return sessionStorage.getItem(this.opt.key) === '1'; } catch (e) { return false; } };
  PointMark.prototype.reset = function () {
    try { sessionStorage.removeItem(this.opt.key); } catch (e) { /* private mode */ }
    var v = this.a.v; this.a.stop(); this.shown = false; v.sS = v.sE = v.hS = v.hE = v.n = v.tap = 0; this.render();
  };

  window.FocusMark = FocusMark;
  window.PointMark = PointMark;
})();
