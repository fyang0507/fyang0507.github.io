/* 01-kit.js — the identity boards' small toolkit (design/2026-09-identity, round 1).
   · Stroke paths are hand-authored in absolute M / L / Q / C commands on a 100-unit box, in writing order and
     writing direction (01-glyphs.js). place() bakes a glyph's box into screen px, so stroke width and dash lengths
     are real pixels: one pen for the whole lockup, whatever size each part is drawn at.
   · write() is the pen writing: each stroke lands in one pass (stroke-dashoffset), in order, with a short lift
     between strokes. Reduced motion lands everything at once. It is the same mechanism as pen.js's draw(). */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var f1 = function (n) { return Math.round(n * 100) / 100; };

  // ---- affine matrices [a, b, c, d, e, f]: x' = a x + c y + e, y' = b x + d y + f ----
  var M = {
    id: function () { return [1, 0, 0, 1, 0, 0]; },
    mul: function (p, q) {   // p after q
      return [p[0] * q[0] + p[2] * q[1], p[1] * q[0] + p[3] * q[1], p[0] * q[2] + p[2] * q[3], p[1] * q[2] + p[3] * q[3],
        p[0] * q[4] + p[2] * q[5] + p[4], p[1] * q[4] + p[3] * q[5] + p[5]];
    },
    t: function (x, y) { return [1, 0, 0, 1, x, y]; },
    s: function (x, y) { return [x, 0, 0, y == null ? x : y, 0, 0]; },
    r: function (deg, cx, cy) {
      var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); cx = cx || 0; cy = cy || 0;
      return [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy];
    },
    k: function (deg) { return [1, 0, Math.tan(deg * Math.PI / 180), 1, 0, 0]; },   // skewX
    chain: function () { var m = M.id(); for (var i = 0; i < arguments.length; i++) m = M.mul(m, arguments[i]); return m; }
  };

  function tokens(d) { return d.match(/[MLQC]|-?\d*\.?\d+(?:e-?\d+)?/gi) || []; }
  // Apply matrix m to every point of an absolute M/L/Q/C path.
  function xform(d, m) {
    var tk = tokens(d), out = [], i = 0, cmd = 'M';
    while (i < tk.length) {
      if (/[MLQC]/i.test(tk[i])) { cmd = tk[i].toUpperCase(); out.push(cmd); i++; continue; }
      var x = +tk[i], y = +tk[i + 1]; i += 2;
      out.push(f1(m[0] * x + m[2] * y + m[4]) + ' ' + f1(m[1] * x + m[3] * y + m[5]));
    }
    return out.join(' ').replace(/([MLQC]) /g, '$1');
  }
  function points(d) {
    var tk = tokens(d), pts = [];
    for (var i = 0; i < tk.length;) { if (/[MLQC]/i.test(tk[i])) { i++; continue; } pts.push([+tk[i], +tk[i + 1]]); i += 2; }
    return pts;
  }

  // A glyph's strokes placed in a box: x, y = its top-left, size = the box's side in px. o.m: an extra matrix in the
  // glyph's own 100-unit space (a lean, a lift), applied before placing.
  function place(strokes, x, y, size, o) {
    o = o || {};
    var k = size / 100, m = M.chain(M.t(x, y), M.s(k), o.m || M.id());
    return strokes.map(function (d) { return xform(d, m); });
  }

  // A Latin word from GLYPHS.lat: letters side by side on one baseline. x, y = the em box's top-left, size = the em in
  // px. o: set ('lat' | 'sig'), track (em units between letters), slant (degrees, leaning about the baseline), kern
  // ({index: units}), space (em units for ' '). Returns { strokes, w } with w the advance in px.
  function word(str, x, y, size, o) {
    o = o || {};
    var L = window.GLYPHS[o.set || 'lat'], t = Math.tan((o.slant || 0) * Math.PI / 180), k = size / 100, pen = 0, out = [];
    var lean = [1, 0, -t, 1, 72 * t, 0];
    str.split('').forEach(function (ch, i) {
      if (ch === ' ') { pen += o.space == null ? 18 : o.space; return; }
      var g = L[ch]; if (!g) return;
      pen += (o.kern && o.kern[i]) || 0;
      var m = M.chain(M.t(x, y), M.s(k), lean, M.t(pen, 0));
      g.s.forEach(function (d) { out.push(xform(d, m)); });
      pen += g.w + (o.track == null ? 4 : o.track);
    });
    return { strokes: out, w: pen * k };
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var a in attrs) e.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(e);
    return e;
  }
  // One <path> per stroke, in order, inside g. Returns the paths.
  function ink(g, ds, cls) {
    return ds.map(function (d) { return el('path', { d: d, 'class': cls || 'st' }, g); });
  }

  function reduced() { return window.Motion ? Motion.reduced() : matchMedia('(prefers-reduced-motion: reduce)').matches; }
  // Hide every stroke (ready to be written).
  function blank(paths) {
    paths.forEach(function (p) {
      var L = p.getTotalLength(), w = parseFloat(getComputedStyle(p).strokeWidth) || 2;
      p.getAnimations().forEach(function (a) { a.cancel(); });
      p.style.strokeDasharray = L + ' ' + (L + 2 * w + 8);
      p.style.strokeDashoffset = L + w + 1;
    });
  }
  function show(paths) { paths.forEach(function (p) { p.getAnimations().forEach(function (a) { a.cancel(); }); p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); }
  // The pen writing paths in order. o: speed (px per ms along the stroke), lift (ms between strokes), min / max (ms per
  // stroke), delay, slow (a map index → factor, for a stroke that takes its time), lifts (index → ms after it), total
  // (ms for the whole run: durations keep their proportions and scale to fit, so a fast hand is fast). Returns the
  // ms at which the last stroke lands.
  function write(paths, o) {
    o = o || {};
    if (reduced()) { show(paths); return 0; }
    blank(paths);
    var speed = o.speed || .42, lift = o.lift == null ? 34 : o.lift, lo = o.min || 70, hi = o.max || 420;
    var gap = function (i) { return o.lifts && o.lifts[i] != null ? o.lifts[i] : lift; };
    var L = paths.map(function (p) { return p.getTotalLength(); });
    var d = L.map(function (l, i) { return Math.max(lo, Math.min(hi, l / speed)) * ((o.slow && o.slow[i]) || 1); });
    if (o.total) {
      var lifts = 0, sum = 0;
      d.forEach(function (x, i) { sum += x; if (i < d.length - 1) lifts += gap(i); });
      var k = Math.max(.15, (o.total - lifts) / sum);
      d = d.map(function (x) { return x * k; });
    }
    var t = o.delay || 0;
    paths.forEach(function (p, i) {
      var w = parseFloat(getComputedStyle(p).strokeWidth) || 2;
      p.animate([{ strokeDashoffset: L[i] + w + 1 }, { strokeDashoffset: 0 }],
        { duration: d[i], delay: t, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'both' });
      t += d[i] + (i < paths.length - 1 ? gap(i) : 0);
    });
    return t;
  }

  window.IDK = { M: M, xform: xform, points: points, place: place, word: word, el: el, ink: ink, write: write, blank: blank, show: show, reduced: reduced, NS: NS };
})();
