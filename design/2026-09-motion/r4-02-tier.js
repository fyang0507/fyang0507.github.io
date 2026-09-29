/* r4-02-tier.js — the pen's two tiers, round 4: the notice line is coral, and it cools into the band.

   The physical cause is still one chisel-tip highlighter, now inked coral on its thin edge — the
   pen's live attention. Hover draws the coral line (notice). To choose, the hand turns the tip
   broad-side down and comes back right → left; behind the tip the line thickens upward into the
   wheat band, and the coral line is absorbed as the band passes over it, cooling into the band's
   darker wheat bottom edge. At rest nothing chosen carries coral: current page, selected tag and
   open card stay wheat. When a choice is closed under the pointer the band sinks and the line
   warms back to coral; when the choice moves elsewhere the wheat line simply lifts.

   Round 4 also hangs the line from the text's baseline, measured in the host's own frame:
   baseline + max(3 px, 0.18 em). Round 3 measured boxes with getBoundingClientRect(), which inside
   a tilted card returns the rotated box's bounds and put the lead card's line ~6 px too low —
   onto the body text below it (Fred's "too close to the body content").

   State (all tweened by R2Anim, so every reversal starts from the current frame):
     S, E   visible stretch of the underline      sw    how far the return stroke has swept
     lift   band height (the drain sinks it)       warm  opacity of the coral line (1 = coral)
     hot    1: the coral may show along the whole line; 0: only where the band hasn't reached yet */
(function () {
  var A = R2Anim, EASE = A.EASE, all = [];
  function f1(n) { return Math.round(n * 10) / 10; }
  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function smooth01(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
  function sweepDur(w) { return Math.min(400, 190 + w * .9); }

  // Where el sits inside host, in host's own untransformed frame (offsets ignore CSS transforms).
  function local(host, el) {
    var x = 0, y = 0, n = el;
    while (n && n !== host) {
      x += n.offsetLeft; y += n.offsetTop;
      var p = n.offsetParent; if (p && p !== host) { x += p.clientLeft; y += p.clientTop; }
      n = p;
    }
    if (n !== host) return A.box(host, el);
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
  }
  // A line's baseline: a zero-size inline-block probe sits on it — appended for the last line (where
  // the underline goes), prepended for the first (where a two-line label's band starts).
  function baseline(host, el, first) {
    var p = document.createElement('span');
    p.style.cssText = 'display:inline-block;width:0;height:0;margin:0;padding:0;border:0;vertical-align:baseline';
    if (first) el.insertBefore(p, el.firstChild); else el.appendChild(p);
    var y = local(host, p).y; el.removeChild(p); return y;
  }

  // opt: over (px the band overhangs each end) · seed
  function TierMark(host, target, opt) {
    this.host = host; this.target = target || host; this.opt = opt || {}; this.tier = 0;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.style.isolation = 'isolate';      // the band sits behind the words, inside the host
    function layer(cls) {
      var s = A.node('svg', { 'aria-hidden': 'true', width: 1, height: 1, 'class': cls });
      s.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:-1';
      return s;
    }
    // Wheat multiplies with whatever paper it lands on; the coral is drawn as that paper shows it (CSS --pen).
    this.svg = layer('tm'); this.svgH = layer('tm-h');
    this.g = A.node('g', {}); this.gh = A.node('g', {});
    this.band = A.node('path', { 'class': 'tm-band' });
    this.line = A.node('path', { 'class': 'tm-line' });
    this.hotP = A.node('path', { 'class': 'tm-hot' });
    this.poolR = A.node('path', { 'class': 'tm-pool' }); this.poolL = A.node('path', { 'class': 'tm-pool' });
    [this.band, this.poolR, this.poolL, this.line].forEach(function (n) { this.g.appendChild(n); }, this);
    this.gh.appendChild(this.hotP);
    this.svg.appendChild(this.g); this.svgH.appendChild(this.gh); host.appendChild(this.svg); host.appendChild(this.svgH);
    this.a = new A.Anim({ S: 0, E: 0, sw: 0, lift: 1, warm: 1, hot: 0 }, this.render.bind(this));
    all.push(this);
    this.build();
  }

  TierMark.prototype.build = function () {
    var o = this.opt, b = local(this.host, this.target), fs = parseFloat(getComputedStyle(this.target).fontSize) || 16;
    var seed = o.seed || ((this.target.textContent || '').replace(/\s+/g, ' ').trim() + '|tier');
    this.w = b.w; this.h = b.h; this.fs = fs;
    this.base = baseline(this.host, this.target) - b.y;
    this.drop = Math.max(3, fs * .18);
    var tf = 'translate(' + f1(b.x) + ' ' + f1(b.y) + ')', d = Pen.underline(b.w, seed, { y: this.base + this.drop });
    this.g.setAttribute('transform', tf); this.gh.setAttribute('transform', tf);
    this.line.setAttribute('d', d); this.hotP.setAttribute('d', d);
    this.L = this.line.getTotalLength();
    var N = 28, xs = [], ys = [];
    for (var i = 0; i <= N; i++) { var p = this.line.getPointAtLength(this.L * i / N); xs.push(p.x); ys.push(p.y); }
    this.xs = xs; this.ys = ys;
    // The band's top edge: just above the first line's cap height, a slow wobble and a slight climb.
    var r = Pen.rng(seed + '|band');
    this.top0 = Math.max(-2, baseline(this.host, this.target, true) - b.y - fs * .92) + (r() - .5) * 1.2;
    this.topPh = r() * 6; this.topSlope = (r() - .5) * .022;
    this.over = o.over == null ? 4 : o.over;
    var H = this.bottomAt(b.w / 2) - this.top0;
    this.slantEnd = Math.max(5, Math.min(11, H * .42));   // the chisel's cut at each end: parallel "/"
    this.slantSweep = Math.max(16, H * 1.6);                // the rising wedge behind the moving tip
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
  // Where the moving tip's bottom corner is: everything right of it is under the band.
  TierMark.prototype.sweepX = function (sw) { var xL = -this.over, xRb = this.w + this.over - this.slantEnd; return xRb - sw * (xRb - xL); };

  TierMark.prototype.bandPath = function (sw, lift) {
    var self = this, xL = -this.over, xR = this.w + this.over, se = this.slantEnd;
    var ss = se + (this.slantSweep - se) * (1 - smooth01((sw - .7) / .3));
    var xRb = xR - se, xb = this.sweepX(sw), xt = xb + ss, pts = [], x;
    function y(x, f) { var B = self.bottomAt(x); return B - (B - self.topAt(x)) * f * lift; }
    function seg(x0, f0, x1, fz) { return 'M' + f1(x0) + ' ' + f1(y(x0, f0) - .6) + ' L' + f1(x1) + ' ' + f1(y(x1, fz) + .6); }
    var apex = 1;
    if (xt <= xR) {
      pts.push([xR, y(xR, 1)]);
      for (x = xR - 6; x > xt; x -= 6) pts.push([x, y(x, 1)]);
      pts.push([xt, y(xt, 1)]);
    } else {
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
    var v = this.a.v, on = v.sw > .001 && v.lift > .004, bp = on ? this.bandPath(v.sw, v.lift) : null;
    A.dash(this.line, this.L, v.S, v.E);
    // The coral runs from the line's start to wherever the band hasn't reached yet.
    var fb = on && !v.hot ? clamp01((this.sweepX(v.sw) + 2) / (this.w + 4)) : 1;
    A.dash(this.hotP, this.L, v.S, Math.max(v.S, Math.min(v.E, fb)));
    this.hotP.style.opacity = v.warm.toFixed(3);
    this.band.style.visibility = this.poolR.style.visibility = this.poolL.style.visibility = on ? 'visible' : 'hidden';
    if (on) { this.band.setAttribute('d', bp.d); this.poolR.setAttribute('d', bp.poolR); this.poolL.setAttribute('d', bp.poolL); }
  };

  // Freeze an exact pose (the key-pose sheet and the scrub use this).
  TierMark.prototype.pose = function (p) {
    this.a.stop();
    var v = this.a.v; v.S = 0; v.E = 0; v.sw = 0; v.lift = 1; v.warm = 1; v.hot = 0;
    for (var k in p) v[k] = p[k];
    this.render();
  };

  // Move to tier 0 | 1 | 2. how: 'hover' | 'press' | 'tap' | 'key' | 'instant'.
  // Returns how long the gesture takes (ms at 1×), so a tap can hold tier 2 until it has landed.
  TierMark.prototype.to = function (tier, how) {
    var a = this.a, v = a.v, self = this;
    this.tier = tier;
    a.stop();
    if (how === 'instant' || Pen.reduced()) {
      v.S = 0; v.E = tier ? 1 : 0; v.sw = tier === 2 ? 1 : 0; v.lift = 1; v.hot = tier === 2 ? 0 : 1; v.warm = tier === 1 ? 1 : 0;
      this.render(); return 0;
    }
    var bandOn = v.sw > .001 && v.lift > .004, end = 0;
    if (tier < 2) {
      var drain = 0;
      v.hot = 1;
      if (bandOn) {
        var dd = Math.max(70, 210 * v.lift);
        drain = a.go('lift', 0, dd, 0, EASE.sink, function () { v.sw = 0; v.lift = 1; self.render(); });
        // Closed under the pointer: the line warms back to coral as the band sinks into it.
        // Moved elsewhere: it stays wheat and lifts.
        v.warm = 0; if (tier === 1) a.go('warm', 1, dd, 0, EASE.sink);
      } else { v.sw = 0; v.lift = 1; if (tier === 1 && v.warm < 1) a.go('warm', 1, 140, 0, EASE.pen); }
      if (tier === 1) {
        if (v.S > 0) end = Math.max(end, a.go('S', 0, 160 * v.S, 0, EASE.pen));
        if (v.E < 1) end = Math.max(end, a.go('E', 1, A.drawDur(this.L) * (1 - v.E), 0, EASE.pen));
      } else if (v.E > v.S) {
        end = a.go('S', v.E, Math.max(90, 200 * (v.E - v.S)), drain * .72, EASE.lift, function () { v.S = 0; v.E = 0; self.render(); });
      }
      return Math.max(end, drain);
    }
    // tier 2 — finish the (coral) line if it isn't there, then the return stroke absorbs it.
    var t = 0;
    if (!bandOn) { v.hot = 0; v.warm = 1; } else v.hot = 0;
    if (v.S > 0) a.go('S', 0, 120 * v.S, 0, EASE.pen);
    if (v.E < 1) {
      var dl = (how === 'tap' || how === 'key' ? 170 : Math.min(260, A.drawDur(this.L) * .6)) * (1 - v.E);
      a.go('E', 1, dl, 0, EASE.pen); t = dl * .82;
    }
    if (!bandOn) v.lift = 1;
    if (bandOn && v.lift < 1) t = Math.max(t, a.go('lift', 1, 170 * (1 - v.lift), 0, EASE.turn));
    if (v.sw < 1) t = a.go('sw', 1, sweepDur(this.w) * (1 - v.sw), t, EASE.turn);
    return t;
  };

  TierMark.sweepDur = sweepDur;
  TierMark.all = all;
  TierMark.local = local;
  window.TierMark = TierMark;
})();
