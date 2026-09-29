/* pen-tier.js — the pen's states: TierMark (notice / choose), FocusMark (「 」) and Tier.wire, the rule
   that drives them. Needs motion.js and pen.js; styles in pen.css.

   One chisel-tip highlighter, its thin edge inked coral: the pen's live attention. Hover draws the coral
   line (tier 1, notice). To choose (tier 2), the hand turns the tip broad-side down and comes back
   right → left: behind the tip the line thickens upward into the wheat band, and the coral is absorbed
   as the band passes over it, cooling into the band's darker wheat edge. At rest nothing chosen is
   coral. Closed under the pointer, the band sinks and the line warms back to coral; when the choice
   moves elsewhere the wheat line simply lifts. Keyboard focus is coral 「 」, apart from the tiers.

   The line hangs from the baseline in the host's untransformed frame (baseline + max(3 px, 0.18 em)),
   so it stays put on rotated cards. Coral is var(--pen), which [data-paper] sets per surface. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', M = window.Motion, E = M.EASE, tween = M.tween;
  function f1(n) { return Math.round(n * 10) / 10; }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function node(tag, attrs) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function layer(cls, z) {
    var s = node('svg', { 'aria-hidden': 'true', width: 1, height: 1, 'class': cls });
    s.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:' + z;
    return s;
  }
  function drawDur(L) { return Math.min(620, 200 + L * 1.1); }
  function sweepDur(w) { return Math.min(400, 190 + w * .9); }
  // Show the stretch [s, e] (fractions of length L) of a stroked path. Hidden strokes are also
  // visibility:hidden: a zero-length dash with a round cap still paints a stray dot of ink.
  function dash(p, L, s, e) {
    var len = (e - s) * L;
    if (len < .4) { p.style.visibility = 'hidden'; return; }
    p.style.visibility = 'visible';
    p.style.strokeDasharray = len.toFixed(2) + ' ' + (L * 2 + 40).toFixed(1);
    p.style.strokeDashoffset = (-s * L).toFixed(2);
  }
  // Re-fit when the host or target changes size, and whenever web fonts land: a font swap moves the
  // baseline, and ResizeObserver never fires for an inline host. Returns an unwatch function.
  function watch(self, els) {
    var ro = new ResizeObserver(function () { if (self.host.isConnected) self.build(); });
    var fonts = function () { if (!self.dead && self.host.isConnected) self.build(); };
    els.forEach(function (e) { ro.observe(e); });
    document.fonts.addEventListener('loadingdone', fonts);
    return function () { ro.disconnect(); document.fonts.removeEventListener('loadingdone', fonts); };
  }

  /* ---- TierMark: tier 1 notice → tier 2 choose, as one stroke ---- */
  // State (tweened, so every reversal starts from the current frame): S, E visible stretch of the line ·
  // sw how far the return stroke has swept · lift band height · warm coral opacity · hot 1 = the coral
  // may run the whole line, 0 = only where the band hasn't reached yet.
  function TierMark(host, target, opt) {
    if (!(this instanceof TierMark)) return new TierMark(host, target, opt);
    this.host = host; this.target = target || host; this.opt = opt || {}; this.tier = 0;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.style.isolation = 'isolate';    // the band sits behind the words, inside the host
    this.svg = layer('tm', -1); this.svgH = layer('tm-h', -1);
    this.g = node('g', {}); this.gh = node('g', {});
    this.band = node('path', { 'class': 'tm-band' }); this.line = node('path', { 'class': 'tm-line' }); this.hot = node('path', { 'class': 'tm-hot' });
    this.poolR = node('path', { 'class': 'tm-pool' }); this.poolL = node('path', { 'class': 'tm-pool' });
    [this.band, this.poolR, this.poolL, this.line].forEach(function (n) { this.g.appendChild(n); }, this);
    this.gh.appendChild(this.hot); this.svg.appendChild(this.g); this.svgH.appendChild(this.gh);
    host.appendChild(this.svg); host.appendChild(this.svgH);
    this.target.setAttribute('data-pen-t', '');   // what the underline belongs to (scripts/verify/pen-spacing.mjs)
    this.v = { S: 0, E: 0, sw: 0, lift: 1, warm: 1, hot: 0, render: this.render.bind(this) };
    this.build();
    this.unwatch = watch(this, this.target === host ? [host] : [host, this.target]);
  }
  TierMark.prototype.build = function () {
    var host = this.host, t = this.target, b = Pen.frame(host, t), fs = parseFloat(getComputedStyle(t).fontSize) || 16;
    var seed = this.opt.seed || Pen.seedOf(t, 'tier') + '|tier', map = Pen.localMap(host), base = Pen.baseline(host, t, false, map) - b.y;
    this.w = b.w; this.drop = Pen.drop(t);
    var tf = 'translate(' + f1(b.x) + ' ' + f1(b.y) + ')', d = Pen.underline(b.w, seed, { y: base + this.drop });
    this.g.setAttribute('transform', tf); this.gh.setAttribute('transform', tf);
    this.line.setAttribute('d', d); this.hot.setAttribute('d', d);
    this.svg.setAttribute('data-drop', this.drop.toFixed(2));
    this.L = this.line.getTotalLength();
    var N = 28, xs = [], ys = [];
    for (var i = 0; i <= N; i++) { var p = this.line.getPointAtLength(this.L * i / N); xs.push(p.x); ys.push(p.y); }
    this.xs = xs; this.ys = ys;
    // The band's top: just above the first line's cap height, a slow wobble and a slight climb.
    var r = Pen.rng(seed + '|band');
    this.top0 = Math.max(-2, Pen.baseline(host, t, true, map) - b.y - fs * .92) + (r() - .5) * 1.2;
    this.topPh = r() * 6; this.topSlope = (r() - .5) * .022;
    this.over = this.opt.over == null ? 4 : this.opt.over;
    var H = this.bottomAt(b.w / 2) - this.top0;
    this.slantEnd = Math.max(5, Math.min(11, H * .42));    // the chisel's cut at each end: parallel "/"
    this.slantSweep = Math.max(16, H * 1.6);                 // the rising wedge behind the moving tip
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
    var ss = se + (this.slantSweep - se) * (1 - M.smooth(.7, 1, sw));
    var xRb = xR - se, xb = this.sweepX(sw), xt = xb + ss, pts = [], x, apex = 1;
    function y(x, fr) { var B = self.bottomAt(x); return B - (B - self.topAt(x)) * fr * lift; }
    function seg(x0, f0, x1, fz) { return 'M' + f1(x0) + ' ' + f1(y(x0, f0) - .6) + ' L' + f1(x1) + ' ' + f1(y(x1, fz) + .6); }
    if (xt <= xR) {
      pts.push([xR, y(xR, 1)]);
      for (x = xR - 6; x > xt; x -= 6) pts.push([x, y(x, 1)]);
      pts.push([xt, y(xt, 1)]);
    } else {                               // still a sliver: the wedge meets the right cut
      apex = (xRb - xb) / (ss - se);
      pts.push([xb + apex * ss, y(xb + apex * ss, apex)]);
    }
    pts.push([xb, y(xb, 0)]);
    for (x = xb + 6; x < xRb; x += 6) pts.push([x, y(x, 0)]);
    pts.push([xRb, y(xRb, 0)]);
    return {
      d: 'M' + pts.map(function (p) { return f1(p[0]) + ' ' + f1(p[1]); }).join(' L') + 'Z',
      poolR: seg(xRb + apex * se, apex, xRb, 0), poolL: sw > .985 ? seg(xL + se, 1, xL, 0) : ''
    };
  };
  TierMark.prototype.render = function () {
    var v = this.v, on = v.sw > .001 && v.lift > .004, bp = on ? this.bandPath(v.sw, v.lift) : null;
    dash(this.line, this.L, v.S, v.E);
    var fb = on && !v.hot ? clamp01((this.sweepX(v.sw) + 2) / (this.w + 4)) : 1;
    dash(this.hot, this.L, v.S, Math.max(v.S, Math.min(v.E, fb)));
    this.hot.style.opacity = v.warm.toFixed(3);
    this.band.style.visibility = this.poolR.style.visibility = this.poolL.style.visibility = on ? 'visible' : 'hidden';
    if (on) { this.band.setAttribute('d', bp.d); this.poolR.setAttribute('d', bp.poolR); this.poolL.setAttribute('d', bp.poolL); }
  };
  // Move to tier 0 | 1 | 2. how: 'hover' | 'press' | 'tap' | 'key' | 'instant'. Returns how long the
  // gesture takes (ms), so a press can hold tier 2 until it has landed.
  TierMark.prototype.to = function (tier, how) {
    var v = this.v, self = this, bandOn = v.sw > .001 && v.lift > .004, end = 0, t = 0;
    this.tier = tier;
    tween.stop(v);
    if (how === 'instant' || M.reduced()) {
      v.S = 0; v.E = tier ? 1 : 0; v.sw = tier === 2 ? 1 : 0; v.lift = 1; v.hot = tier === 2 ? 0 : 1; v.warm = tier === 1 ? 1 : 0;
      this.render(); return 0;
    }
    if (tier < 2) {
      var drain = 0;
      v.hot = 1;
      if (bandOn) {
        var dd = Math.max(70, 210 * v.lift);
        drain = tween(v, 'lift', 0, dd, 0, E.sink, function () { v.sw = 0; v.lift = 1; self.render(); });
        v.warm = 0; if (tier === 1) tween(v, 'warm', 1, dd, 0, E.sink);   // warms back only under the pointer
      } else { v.sw = 0; v.lift = 1; if (tier === 1 && v.warm < 1) tween(v, 'warm', 1, 140, 0, E.pen); }
      if (tier === 1) {
        if (v.S > 0) end = Math.max(end, tween(v, 'S', 0, 160 * v.S, 0, E.pen));
        if (v.E < 1) end = Math.max(end, tween(v, 'E', 1, drawDur(this.L) * (1 - v.E), 0, E.pen));
      } else if (v.E > v.S) {
        // Band → line → gone: the line starts to lift just before the band has fully drained.
        end = tween(v, 'S', v.E, Math.max(90, 200 * (v.E - v.S)), drain * .72, E.lift, function () { v.S = 0; v.E = 0; self.render(); });
      }
      return Math.max(end, drain);
    }
    // tier 2: finish the coral line if it isn't there, then the return stroke absorbs it.
    v.hot = 0; if (!bandOn) { v.warm = 1; v.lift = 1; }
    if (v.S > 0) tween(v, 'S', 0, 120 * v.S, 0, E.pen);
    if (v.E < 1) {
      var dl = (how === 'tap' || how === 'key' ? 170 : Math.min(260, drawDur(this.L) * .6)) * (1 - v.E);
      tween(v, 'E', 1, dl, 0, E.pen); t = dl * .82;          // the tip turns as it reaches the end
    }
    if (bandOn && v.lift < 1) t = Math.max(t, tween(v, 'lift', 1, 170 * (1 - v.lift), 0, E.turn));
    if (v.sw < 1) t = tween(v, 'sw', 1, sweepDur(this.w) * (1 - v.sw), t, E.turn);
    return t;
  };
  TierMark.prototype.destroy = function () {
    this.dead = true; tween.stop(this.v); this.unwatch();
    this.svg.remove(); this.svgH.remove(); this.target.removeAttribute('data-pen-t');
  };

  /* ---- FocusMark: coral 「 」 for keyboard focus ---- */
  function FocusMark(host, target, opt) {
    if (!(this instanceof FocusMark)) return new FocusMark(host, target, opt);
    this.host = host; this.target = target || host; this.opt = opt || {}; this.on = false;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    this.svg = layer('fm', 3);
    this.p1 = node('path', { 'class': 'fm-c' }); this.p2 = node('path', { 'class': 'fm-c' });
    this.svg.appendChild(this.p1); this.svg.appendChild(this.p2); host.appendChild(this.svg);
    host.setAttribute('data-pen-focus', '');   // pen.css drops the browser's ring here: the 「 」 replace it
    this.v = { S1: 0, E1: 0, S2: 0, E2: 0, render: this.render.bind(this) };
    this.build();
    this.unwatch = watch(this, this.target === host ? [host] : [host, this.target]);
  }
  FocusMark.prototype.build = function () {
    var o = this.opt, b = Pen.frame(this.host, this.target), r = Pen.rng(Pen.seedOf(this.target, 'f') + '|focus');
    var g = o.gap == null ? 4 : o.gap, gy = o.gy == null ? 3 : o.gy, big = o.big;
    var arm = big ? 22 : Math.min(12, b.w * .32), vv = big ? 16 : Math.min(7, b.h * .3);
    var j = function () { return (r() - .5) * 1.1; };
    var x0 = b.x - (o.gl == null ? g : o.gl), x1 = b.x + b.w + g, y0 = b.y - gy, y1 = b.y + b.h + gy;
    this.p1.setAttribute('d', 'M' + f1(x0 + arm) + ' ' + f1(y0 + j()) + ' L' + f1(x0) + ' ' + f1(y0) + ' L' + f1(x0 + j()) + ' ' + f1(y0 + vv));
    this.p2.setAttribute('d', 'M' + f1(x1 + j()) + ' ' + f1(y1 - vv) + ' L' + f1(x1) + ' ' + f1(y1) + ' L' + f1(x1 - arm) + ' ' + f1(y1 + j()));
    this.L1 = this.p1.getTotalLength(); this.L2 = this.p2.getTotalLength();
    this.render();
  };
  FocusMark.prototype.render = function () { var v = this.v; dash(this.p1, this.L1, v.S1, v.E1); dash(this.p2, this.L2, v.S2, v.E2); };
  FocusMark.prototype.set = function (on, instant) {
    var v = this.v;
    if (on === this.on && !instant) return;
    this.on = on; tween.stop(v);
    if (instant || M.reduced()) { v.S1 = v.S2 = 0; v.E1 = v.E2 = on ? 1 : 0; this.render(); return; }
    if (on) { v.S1 = v.S2 = 0; tween(v, 'E1', 1, 140, 0, E.pen); tween(v, 'E2', 1, 140, 70, E.pen); }
    else { tween(v, 'S1', v.E1, 120, 0, E.lift); tween(v, 'S2', v.E2, 120, 0, E.lift, function () { v.S1 = v.S2 = v.E1 = v.E2 = 0; }); }
  };
  FocusMark.prototype.destroy = function () { this.dead = true; tween.stop(this.v); this.unwatch(); this.svg.remove(); this.host.removeAttribute('data-pen-focus'); };

  /* ---- Tier.wire: the rule every consumer repeats ---- */
  // tier = disabled ? 0 : (chosen || pressed) ? 2 : hovered ? 1 : 0. Hover only for pointers that
  // hover (never touch); 「 」 only for :focus-visible; a press holds tier 2 until its gesture has
  // landed, so a quick tap still reads whole. o: target (element or selector, default host) · chosen
  // (boolean, or a function read on every refresh) · onChange(tier) · over · seed · focus: false |
  // {on:'host'|'target', gap, gl, gy, big}. The host carries data-pen-tier for styling.
  function wire(host, o) {
    o = o || {};
    var target = typeof o.target === 'string' ? host.querySelector(o.target) : (o.target || host), fo = o.focus || {};
    var mark = new TierMark(host, target, { over: o.over, seed: o.seed });
    var focus = o.focus === false ? null : new FocusMark(host, fo.on === 'host' ? host : target, fo);
    var st = { hovered: false, pressed: false, focused: false, on: !!(typeof o.chosen === 'function' ? false : o.chosen), until: 0, rel: 0, tier: -1 };
    function chosen() { return typeof o.chosen === 'function' ? !!o.chosen() : st.on; }
    function refresh(how) {
      var t = host.disabled || host.getAttribute('aria-disabled') === 'true' ? 0 : (chosen() || st.pressed) ? 2 : st.hovered ? 1 : 0;
      if (t !== mark.tier || how === 'instant') { var d = mark.to(t, how || 'hover'); if (t === 2) st.until = performance.now() + d; }
      if (focus) focus.set(st.focused, how === 'instant');
      if (t !== st.tier) { st.tier = t; host.setAttribute('data-pen-tier', t); if (o.onChange) o.onChange(t); }
    }
    function release() {
      clearTimeout(st.rel);
      st.rel = setTimeout(function () { st.pressed = false; refresh('hover'); }, Math.max(0, st.until - performance.now()));
    }
    var on = {
      pointerenter: function (e) { if (e.pointerType === 'touch') return; st.hovered = true; refresh('hover'); },
      pointerleave: function () { st.hovered = false; refresh('hover'); if (st.pressed) release(); },
      pointerdown: function (e) { if (e.button > 0 || host.disabled) return; st.pressed = true; refresh(e.pointerType === 'touch' ? 'tap' : 'press'); },
      pointerup: function () { if (st.pressed) release(); },
      pointercancel: function () { if (st.pressed) release(); },
      focus: function () { st.focused = host.matches(':focus-visible'); refresh(); },
      blur: function () { st.focused = false; refresh(); },
      click: function (e) { if (e.detail === 0) { st.pressed = true; refresh('key'); release(); } }   // Enter / Space
    };
    Object.keys(on).forEach(function (k) { host.addEventListener(k, on[k]); });
    refresh('instant');
    return {
      mark: mark, focus: focus,
      get tier() { return st.tier; },
      set: function (chosenNow, how) { st.on = !!chosenNow; refresh(how || 'hover'); },
      refresh: refresh,
      destroy: function () {
        Object.keys(on).forEach(function (k) { host.removeEventListener(k, on[k]); });
        clearTimeout(st.rel); mark.destroy(); if (focus) focus.destroy(); host.removeAttribute('data-pen-tier');
      }
    };
  }

  window.TierMark = TierMark;
  window.FocusMark = FocusMark;
  window.Tier = { wire: wire };
})();
