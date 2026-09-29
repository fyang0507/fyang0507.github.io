/* r2-02-tier.js — tiers 1 and 2 as one mark that changes, not two marks that swap.

   The physical cause is a chisel-tip highlighter. Its thin edge draws the tier-1 underline.
   To choose, the hand does not lift: it turns the tip broad-side down and comes back over the word,
   right → left, on the same line. Behind the tip the line thickens upward into the wash; where the
   stroke ends — at the left, where a checkbox would be — the pen flicks a tick. The old line is
   never removed: it stays as the band's denser bottom edge, the way a second pass reads on paper.

   State (all 0..1, tweened by R2Anim so every reversal starts from the current frame):
     S, E   visible stretch of the underline (draw: E 0→1; retract: S chases E off the end)
     sw     how far the return stroke has swept, right → left
     lift   band height as a fraction of full (the drain sinks it back into the line)
     tS, tE visible stretch of the tick                                                     */
(function () {
  var A = R2Anim, EASE = A.EASE;
  function f1(n) { return Math.round(n * 10) / 10; }
  function smooth01(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  function sweepDur(w) { return Math.min(400, 190 + w * .9); }

  // opt: tick (bool) · gap (px under the text box) · top (band top as a fraction of text height)
  //      over (px the band overhangs each end) · morph: 'return' (default) | 'rise' (press harder)
  function TierMark(host, target, opt) {
    this.host = host; this.target = target || host; this.opt = opt || {}; this.tier = 0;
    var cs = getComputedStyle(host);
    if (cs.position === 'static') host.style.position = 'relative';
    host.style.isolation = 'isolate';      // the band sits behind the words, inside the host
    this.svg = A.node('svg', { 'aria-hidden': 'true', width: 1, height: 1, 'class': 'tm' });
    this.svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:-1';
    this.g = A.node('g', {});
    this.band = A.node('path', { 'class': 'tm-band' });
    this.line = A.node('path', { 'class': 'tm-line' });
    this.tk = A.node('path', { 'class': 'tm-tick' });
    // Where the chisel sat still — put down at the right, lifted at the left — the ink pools a little.
    this.poolR = A.node('path', { 'class': 'tm-pool' }); this.poolL = A.node('path', { 'class': 'tm-pool' });
    [this.band, this.poolR, this.poolL, this.line, this.tk].forEach(function (n) { this.g.appendChild(n); }, this);
    this.svg.appendChild(this.g); host.appendChild(this.svg);
    this.a = new A.Anim({ S: 0, E: 0, sw: 0, lift: 1, tS: 0, tE: 0 }, this.render.bind(this));
    this.build();
  }

  TierMark.prototype.build = function () {
    var o = this.opt, b = A.box(this.host, this.target);
    var seed = o.seed || ((this.target.textContent || '').replace(/\s+/g, ' ').trim() + '|tier');
    this.w = b.w; this.h = b.h;
    this.g.setAttribute('transform', 'translate(' + f1(b.x) + ' ' + f1(b.y) + ')');
    // The underline: round 1's seeded stroke — bowed, lifting at the end like a wrist finishing.
    this.line.setAttribute('d', Pen.underline(b.w, seed, { y: b.h + (o.gap == null ? 2 : o.gap) }));
    this.L = this.line.getTotalLength();
    var N = 28, xs = [], ys = [];
    for (var i = 0; i <= N; i++) { var p = this.line.getPointAtLength(this.L * i / N); xs.push(p.x); ys.push(p.y); }
    this.xs = xs; this.ys = ys;
    // The band's top edge: level-ish, a slow wobble and a slight climb, seeded like the line.
    var r = Pen.rng(seed + '|band');
    this.top0 = b.h * (o.top == null ? .08 : o.top) + (r() - .5) * 1.2;
    this.topPh = r() * 6; this.topSlope = (r() - .5) * .022;
    this.over = o.over == null ? 4 : o.over;
    var H = this.bottomAt(b.w / 2) - this.top0;
    this.slantEnd = Math.max(5, Math.min(11, H * .42));   // the chisel's cut at each end: parallel "/"
    this.slantSweep = Math.max(16, H * 1.6);                // the rising wedge behind the moving tip
    // The tick sits where a checkbox belongs: before the word, centred on its x-height.
    var z = o.tickSize || 12;
    this.tk.setAttribute('d', Pen.tick(z, seed + '|tick'));
    this.tk.setAttribute('transform', 'translate(' + f1(-z - 7) + ' ' + f1(b.h / 2 - z * .62) + ')');
    this.Lt = this.tk.getTotalLength();
    this.render();
  };

  TierMark.prototype.bottomAt = function (x) {
    var xs = this.xs, ys = this.ys, n = xs.length - 1;
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n]) return ys[n];
    for (var i = 1; i <= n; i++) if (xs[i] >= x) { var t = (x - xs[i - 1]) / ((xs[i] - xs[i - 1]) || 1); return ys[i - 1] + (ys[i] - ys[i - 1]) * t; }
    return ys[n];
  };
  TierMark.prototype.topAt = function (x) { return this.top0 + Math.sin(x * .085 + this.topPh) * .7 + (x - this.w / 2) * this.topSlope; };

  // The band as it stands at sweep sw and height lift. A parallelogram-ish strip whose leading edge
  // is a long wedge while the tip is moving (the line visibly thickening upward behind it) and which
  // settles into the short chisel cut when the stroke lands.
  TierMark.prototype.bandPath = function (sw, lift) {
    var self = this, xL = -this.over, xR = this.w + this.over, se = this.slantEnd;
    var ss = se + (this.slantSweep - se) * (1 - smooth01((sw - .7) / .3));
    var xRb = xR - se, xb = xRb - sw * (xRb - xL), xt = xb + ss, pts = [], x;
    function y(x, f) { var B = self.bottomAt(x); return B - (B - self.topAt(x)) * f * lift; }
    function seg(x0, f0, x1, fz) { return 'M' + f1(x0) + ' ' + f1(y(x0, f0) - .6) + ' L' + f1(x1) + ' ' + f1(y(x1, fz) + .6); }
    var apex = 1;
    if (xt <= xR) {
      pts.push([xR, y(xR, 1)]);
      for (x = xR - 6; x > xt; x -= 6) pts.push([x, y(x, 1)]);
      pts.push([xt, y(xt, 1)]);
    } else {                                   // still a sliver: the wedge meets the right cut
      apex = (xRb - xb) / (ss - se);
      var ax = xb + apex * ss;
      pts.push([ax, y(ax, apex)]);
    }
    pts.push([xb, y(xb, 0)]);
    for (x = xb + 6; x < xRb; x += 6) pts.push([x, y(x, 0)]);
    pts.push([xRb, y(xRb, 0)]);
    return {
      d: 'M' + pts.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join(' L') + 'Z',
      poolR: seg(xRb + apex * se, apex, xRb, 0),
      poolL: sw > .985 ? seg(xL + se, 1, xL, 0) : ''
    };
  };

  TierMark.prototype.render = function () {
    var v = this.a.v;
    A.dash(this.line, this.L, v.S, v.E);
    A.dash(this.tk, this.Lt, v.tS, v.tE);
    var on = v.sw > .001 && v.lift > .004, bp = on ? this.bandPath(v.sw, v.lift) : null;
    this.band.style.visibility = this.poolR.style.visibility = this.poolL.style.visibility = on ? 'visible' : 'hidden';
    if (on) { this.band.setAttribute('d', bp.d); this.poolR.setAttribute('d', bp.poolR); this.poolL.setAttribute('d', bp.poolL); }
  };

  // Freeze an exact pose (the key-pose sheet uses this).
  TierMark.prototype.pose = function (p) {
    this.a.stop();
    var v = this.a.v; v.S = 0; v.E = 0; v.sw = 0; v.lift = 1; v.tS = 0; v.tE = 0;
    for (var k in p) v[k] = p[k];
    this.render();
  };

  // Move to tier 0 | 1 | 2. how: 'hover' | 'press' | 'tap' | 'key' | 'instant'.
  // Returns how long the gesture takes (ms at 1×), so a tap can hold tier 2 until it has landed.
  TierMark.prototype.to = function (tier, how) {
    var a = this.a, v = a.v, o = this.opt, self = this;
    this.tier = tier;
    a.stop();
    if (how === 'instant' || Pen.reduced()) {
      v.S = 0; v.E = tier ? 1 : 0; v.sw = tier === 2 ? 1 : 0; v.lift = 1; v.tS = 0; v.tE = tier === 2 && o.tick ? 1 : 0;
      this.render(); return 0;
    }
    var bandOn = v.sw > .001 && v.lift > .004, end = 0;
    if (tier < 2) {
      var drain = 0;
      if (bandOn) drain = a.go('lift', 0, Math.max(70, 210 * v.lift), 0, EASE.sink, function () { v.sw = 0; v.lift = 1; self.render(); });
      else { v.sw = 0; v.lift = 1; }
      if (v.tE > v.tS) a.go('tS', v.tE, 130, 0, EASE.lift, function () { v.tS = 0; v.tE = 0; });
      if (tier === 1) {
        if (v.S > 0) end = Math.max(end, a.go('S', 0, 160 * v.S, 0, EASE.pen));
        if (v.E < 1) end = Math.max(end, a.go('E', 1, A.drawDur(this.L) * (1 - v.E), 0, EASE.pen));
      } else if (v.E > v.S) {
        // Band → line → gone: the line starts to lift just before the wash has fully drained.
        end = a.go('S', v.E, Math.max(90, 200 * (v.E - v.S)), drain * .72, EASE.lift, function () { v.S = 0; v.E = 0; self.render(); });
      }
      return Math.max(end, drain);
    }
    // tier 2 — finish the line if it isn't there, then the return stroke, then the tick.
    var t = 0;
    if (v.S > 0) a.go('S', 0, 120 * v.S, 0, EASE.pen);
    if (v.E < 1) {
      var dl = (how === 'tap' || how === 'key' ? 170 : Math.min(260, A.drawDur(this.L) * .6)) * (1 - v.E);
      a.go('E', 1, dl, 0, EASE.pen); t = dl * .82;          // the tip turns as it reaches the end
    }
    if (!bandOn) v.lift = 1;
    if (o.morph === 'rise' && !bandOn) {                     // alternative: press harder, rise in place
      v.sw = 1; v.lift = 0; t = a.go('lift', 1, 260, t, EASE.turn);
    } else {
      if (bandOn && v.lift < 1) t = Math.max(t, a.go('lift', 1, 170 * (1 - v.lift), 0, EASE.turn));
      if (v.sw < 1) t = a.go('sw', 1, sweepDur(this.w) * (1 - v.sw), t, EASE.turn);
    }
    if (o.tick && v.tE < 1) { v.tS = 0; t = a.go('tE', 1, 150 * (1 - v.tE), Math.max(0, t - 40), EASE.pen); }
    return t;
  };

  TierMark.sweepDur = sweepDur;
  window.TierMark = TierMark;
})();
