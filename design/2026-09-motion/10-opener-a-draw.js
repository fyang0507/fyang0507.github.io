/* 10a · the pen. Builds the traced desk (assets-gen/10a-strokes.js, made by tools/10a-trace.py)
   as one SVG in the desk image's own 1448x1086 space, schedules every stroke on the hand's clock,
   and renders any playhead time t (ms) deterministically — so skip is just a faster playhead.
   Each stroke lands in one pass (stroke-dashoffset, minimum-jerk velocity). An object is traced
   thin and light first, then "inked": its weight swells to the true line and its paper floods in. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var D = window.FY10A;

  // A timelapse of one hand. The table leads: its first stroke lands at once and takes a deliberate
  // quarter second, the next edges join with growing overlap, so the table reads as a table by
  // ~0.5 s. Then the rest follows cumulative ink L(t) = total * ((t - t0) / T)^alpha: the hand keeps
  // accelerating, each stroke outlives its slot by a growing factor (over), and the last objects
  // arrive in a rush. eps = pen-lift cost per stroke (px).
  var FIRST = {
    lead: { id: 'table', t0: 20, first: 230 },
    order: ['laptop', 'mug', 'book', 'portrait', 'plant', 'camera'],
    t0: 520, T: 1680, alpha: 1.6, eps: 14, over: 3.2, dmin: 55, ink: 230,
    cat: { t0: 2120, T: 190 }, ghost: { t: 2290 }
  };
  // Returning visit: the desk is already there; only its last object is drawn again, in a rush.
  var RETURNING = {
    order: ['camera'], off: ['table', 'laptop', 'mug', 'book', 'portrait', 'plant', 'cat'],
    t0: 0, T: 300, alpha: 1.25, eps: 14, over: 2.2, dmin: 45, ink: 150,
    ghost: { t: 320 }
  };
  var INK_DELAY = 30, GHOST_DUR = 220;
  var LAYER = { book: 'book', portrait: 'frame' };

  function mj(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * x * (10 - 15 * x + 6 * x * x); } // minimum jerk
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function outCubic(x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); }
  function r1(n) { return Math.round(n * 10) / 10; }

  function dec(f) {
    var x = f[2] / 2, y = f[3] / 2, pts = [[x, y]];
    for (var i = 4; i < f.length; i += 2) { x += f[i] / 2; y += f[i + 1] / 2; pts.push([x, y]); }
    return { w: f[0] / 4, v: f[1], pts: pts };
  }
  function decPoly(f) {
    var x = f[0] / 2, y = f[1] / 2, pts = [[x, y]];
    for (var i = 2; i < f.length; i += 2) { x += f[i] / 2; y += f[i + 1] / 2; pts.push([x, y]); }
    return pts;
  }
  // Quadratic smoothing through segment midpoints: the curve never exceeds the polyline's length.
  function pathD(p) {
    var d = 'M' + r1(p[0][0]) + ' ' + r1(p[0][1]);
    if (p.length === 1) return d + 'l0 0';
    if (p.length === 2) return d + 'L' + r1(p[1][0]) + ' ' + r1(p[1][1]);
    for (var i = 1; i < p.length - 1; i++) {
      d += 'Q' + r1(p[i][0]) + ' ' + r1(p[i][1]) + ' ' + r1((p[i][0] + p[i + 1][0]) / 2) + ' ' + r1((p[i][1] + p[i + 1][1]) / 2);
    }
    var l = p[p.length - 1];
    return d + 'L' + r1(l[0]) + ' ' + r1(l[1]);
  }
  function polyD(p) { return pathD(p) + 'Z'; }
  function plen(p) { var L = 0; for (var i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function strokeEl(g, s, colour, lenPad) {
    var L = plen(s.pts) + (lenPad || 1.5);
    var p = el('path', { d: pathD(s.pts), stroke: colour }, g);
    p.style.setProperty('--c', colour);           // true value; the page's CSS mixes in the wet trace colour
    // never finer than ~0.85 screen px (--u = user units per CSS px, set by the page on layout)
    p.style.strokeWidth = 'max(calc(var(--k) * ' + r1(Math.max(s.w, .8)) + 'px), calc(var(--u, 1px) * .85))';
    p.style.strokeDasharray = L + ' ' + (L + 4);
    p.style.strokeDashoffset = L;
    p.style.visibility = 'hidden';
    return { el: p, L: L, pts: s.pts, st: 0 };
  }

  // The lead object: explicit stagger. Long edges get a readable 140–250 ms each; each next stroke
  // starts sooner into the previous one, so the overlap grows from the second stroke on.
  function leadSequence(strokes, L) {
    var s = L.t0;
    strokes.forEach(function (st, i) {
      var d = i === 0 ? L.first : Math.max(60, Math.min(250, 95 + .11 * st.L));
      st.t = s; st.d = d;
      s += d * Math.max(.1, .56 - .075 * i);
    });
  }

  function sequence(strokes, P) {
    var total = 0;
    strokes.forEach(function (s) { total += s.L + P.eps; });
    var at = function (cum) { return P.t0 + P.T * Math.pow(Math.min(1, cum / total), 1 / P.alpha); };
    var cum = 0;
    strokes.forEach(function (s) {
      var a = at(cum + P.eps), b = at(cum + P.eps + s.L);
      cum += P.eps + s.L;
      var over = 1 + P.over * Math.pow(clamp((a - P.t0) / P.T), 1.5);
      s.t = a; s.d = Math.max(P.dmin, (b - a) * over);
      if (s.t + s.d > P.t0 + P.T + 60) s.d = Math.max(P.dmin, P.t0 + P.T + 60 - s.t);
    });
  }

  function build(desk) {
    var svg = el('svg', { class: 'ink10', viewBox: '0 0 ' + D.w + ' ' + D.h, 'aria-hidden': 'true' });
    var pal = D.pal.slice();
    var objs = {};
    // one wrapper per raster layer that will replace it (the traced layer fades out over its raster)
    var layers = { scene: el('g', { class: 'layer' }, svg), book: el('g', { class: 'layer' }, svg), frame: el('g', { class: 'layer' }, svg) };
    D.objects.forEach(function (o) {
      var g = el('g', { class: 'obj obj-' + o.id }, layers[LAYER[o.id] || 'scene']);
      var rec = { id: o.id, g: g, strokes: [], fills: [], blobs: [] };
      (o.f || []).forEach(function (f) { var e = el('path', { d: polyD(decPoly(f)), class: 'fill' }, g); rec.fills.push(e); });
      o.s.forEach(function (f) { var s = dec(f); rec.strokes.push(strokeEl(g, s, pal[s.v])); });
      (o.b || []).forEach(function (f) { var e = el('path', { d: polyD(decPoly(f)), class: 'blob' }, g); e.style.fill = pal[0]; rec.blobs.push(e); });
      objs[o.id] = rec;
    });
    // accents: the coral cat (drawn), the teal ghost (stamped)
    var cat = { id: 'cat', g: el('g', { class: 'obj obj-cat' }, layers.scene), strokes: [], fills: [], blobs: [], solid: true };
    D.cat.forEach(function (f) { var s = dec(f); cat.strokes.push(strokeEl(cat.g, s, D.coral)); });
    objs.cat = cat;
    var gp = decPoly(D.ghost.poly), cx = 0, cy = 0;
    gp.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= gp.length; cy /= gp.length;
    var ghost = el('g', { class: 'obj obj-ghost' }, layers.scene);
    ghost.style.setProperty('--k', 1);
    ghost.style.transformOrigin = cx + 'px ' + (cy + 8) + 'px';
    el('path', { d: polyD(gp), class: 'blob' }, ghost).style.fill = D.teal;
    D.ghost.feat.forEach(function (f) { var s = dec(f); var p = el('path', { d: pathD(s.pts), stroke: pal[0] }, ghost); p.style.setProperty('--c', pal[0]); p.style.strokeWidth = r1(Math.max(s.w, 1.2)) + 'px'; });
    ghost.style.opacity = 0;
    desk.insertBefore(svg, desk.firstChild);
    return { svg: svg, objs: objs, ghost: ghost, layers: layers };
  }

  // Schedule every stroke for this mode. off = hidden (the raster already shows it);
  // done = drawn and inked from the start (returning visit before the raster has decoded).
  function plan(art, P) {
    art.P = P; art.gq = null;
    var off = P.off || [], done = P.done || [], seq = [];
    for (var id in art.objs) {
      var o = art.objs[id];
      o.q = null;
      o.off = off.indexOf(id) >= 0;
      o.g.style.display = o.off ? 'none' : '';
      o.strokes.forEach(function (s) { s.st = -1; s.t = -1e9; s.d = 1; });
      o.inkAt = -1e9;
      o.end = -1e9;
    }
    P.order.forEach(function (id) { if (done.indexOf(id) < 0) seq = seq.concat(art.objs[id].strokes); });
    sequence(seq, P);
    if (P.lead) leadSequence(art.objs[P.lead.id].strokes, P.lead);
    (P.lead ? [P.lead.id] : []).concat(P.order).forEach(function (id) {
      var o = art.objs[id];
      if (done.indexOf(id) >= 0) return;
      o.strokes.forEach(function (s) { o.end = Math.max(o.end, s.t + s.d); });
      o.inkAt = o.end + INK_DELAY;
    });
    if (P.cat && !art.objs.cat.off) {
      sequence(art.objs.cat.strokes, { t0: P.cat.t0, T: P.cat.T, alpha: 1, eps: 6, over: 1.4, dmin: 60 });
      art.objs.cat.strokes.forEach(function (s) { art.objs.cat.end = Math.max(art.objs.cat.end, s.t + s.d); });
    }
    art.ghost.style.display = P.ghost ? '' : 'none';
    for (var ly in art.layers) { art.layers[ly].style.opacity = ''; art.layers[ly].classList.remove('gone'); }
    art.drawEnd = 0;
    for (var k in art.objs) if (!art.objs[k].off) art.drawEnd = Math.max(art.drawEnd, art.objs[k].end, art.objs[k].solid ? 0 : art.objs[k].inkAt + P.ink);
  }

  function drawStroke(s, t) {
    var u = (t - s.t) / s.d;
    var st = u <= 0 ? 0 : u >= 1 ? 2 : 1;
    if (st === 0) { if (s.st !== 0) { s.el.style.visibility = 'hidden'; s.el.style.strokeDashoffset = s.L; s.st = 0; } return; }
    if (s.st <= 0) s.el.style.visibility = 'visible';
    if (st === 2) { if (s.st !== 2) s.el.style.strokeDashoffset = 0; s.st = 2; return; }
    s.st = 1;
    s.el.style.strokeDashoffset = s.L * (1 - mj(u));
  }

  // Render the drawing at playhead t. Returns true while anything is still changing.
  function render(art, t) {
    var busy = false, P = art.P;
    for (var id in art.objs) {
      var o = art.objs[id];
      if (o.off) continue;
      for (var i = 0; i < o.strokes.length; i++) drawStroke(o.strokes[i], t);
      var q = outCubic((t - o.inkAt) / P.ink);
      if (q !== o.q) {
        o.q = q;
        // trace: a finer, wet, dark line (darkness carries it, not a vanishing hairline);
        // ink: it dries to its true value and swells to its true weight
        o.g.style.setProperty('--k', .62 + .38 * q);
        o.g.style.setProperty('--wet', (1 - q).toFixed(3));
        o.fills.forEach(function (f) { f.style.opacity = q; });
        o.blobs.forEach(function (b) { b.style.opacity = q; });
      }
      if (t < o.inkAt + P.ink || t < o.end) busy = true;
    }
    if (P.ghost) {
      var gq = (t - P.ghost.t) / GHOST_DUR;
      if (gq !== art.gq) {
        art.gq = gq;
        // a sticker slapped on: arrives a touch large, lands with one small overshoot, settles
        var sc = gq <= 0 ? 1.18 : gq >= 1 ? 1 : gq < .55 ? 1.18 - .24 * outCubic(gq / .55) : .94 + .06 * outCubic((gq - .55) / .45);
        art.ghost.style.opacity = gq <= 0 ? 0 : Math.min(1, gq * 4);
        art.ghost.style.transform = 'scale(' + sc.toFixed(3) + ') rotate(' + (gq >= 1 ? 0 : (-4 * (1 - clamp(gq))).toFixed(2)) + 'deg)';
      }
      if (gq < 1) busy = true;
    }
    return busy;
  }

  // Everything drawn and inked, no animation (reduced motion, late fallbacks, end of skip).
  function finish(art) { render(art, 1e9); }

  window.Pen10a = {
    build: build, plan: plan, render: render, finish: finish, FIRST: FIRST, RETURNING: RETURNING,
    mj: mj, outCubic: outCubic, clamp: clamp
  };
})();
