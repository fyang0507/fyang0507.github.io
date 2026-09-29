/* r3-02-arrow.js — the pointing arrow as a glyph with rules, not a free curve.

   Round 2 (shared/pen.js arrow()) drew a quadratic from wherever the note happened to be to wherever
   the target happened to be, bent by a fixed fraction of that distance. So the layout decided the
   arrow: far note → long arrow, and the bend grows with the length — the long curved "start here".
   Here the arrow is one fixed glyph and only its placement is decided per target:

     shaft   26–40 px whatever the distance to anything; one faint hand bow (≤ 1.75 px) that
             straightens before it lands, so the head always sits square on the line it points along
     head    two barbs of ~7 px at 25–30°, one stroke barb → tip → barb, the same pen as the shaft
     tip     stops 4.5–6 px short of the target's box
     from    a small fixed set of approaches, tried in order; the first with free space wins
     never   crosses text or marked objects, leaves the view, or runs long — if nothing fits, no arrow

   Every random choice is seeded by the target, so a target always gets the same arrow: wobble, not
   jitter. Pure geometry plus one DOM helper (collect); rendering lives in r3-02-point.js. */
(function () {
  var RAD = Math.PI / 180, MIN = 26, MAX = 40;

  // Direction of travel (screen degrees, y down). A hand never draws a horizontal quite level, so
  // "from the left" falls 4° and "from above" leans 8°; the mirrored approaches keep the same lean.
  var APPROACH = {
    W: { deg: 4, en: 'from the left', zh: '从左' },
    NW: { deg: 35, en: 'from the upper left', zh: '从左上' },
    N: { deg: 82, en: 'from above', zh: '从上' },
    NE: { deg: 145, en: 'from the upper right', zh: '从右上' },
    E: { deg: 176, en: 'from the right', zh: '从右' },
    SW: { deg: -35, en: 'from the lower left', zh: '从左下' },
    SE: { deg: -145, en: 'from the lower right', zh: '从右下' },
    S: { deg: -98, en: 'from below', zh: '从下' }
  };
  // Reading order first: an arrow from the left or above is read before the thing it points at.
  var ORDER = ['W', 'NW', 'N', 'NE', 'E', 'SW', 'SE', 'S'];

  // Where the note touches the tail, per approach: [ax, ay] is the point of the note box (fractions
  // of its w, h) that sits at tail + [dx, dy]. The first entry continues the arrow's line backwards.
  var NOTE = {
    W: [[1, .5, -5, 1]], E: [[0, .5, 5, 1]],
    NW: [[1, 1, -2, 5], [.85, 1, 0, -3]], NE: [[0, 1, 2, 5], [.15, 1, 0, -3]],
    SW: [[1, 0, -2, -5], [.85, 0, 0, 3]], SE: [[0, 0, 2, -5], [.15, 0, 0, 3]],
    N: [[.5, 1, 0, -3], [.2, 1, 0, -3], [.8, 1, 0, -3]], S: [[.5, 0, 0, 3], [.2, 0, 0, 3], [.8, 0, 0, 3]]
  };

  function f1(n) { return Math.round(n * 10) / 10; }
  function pt(p) { return p[0].toFixed(2) + ' ' + p[1].toFixed(2); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function union(rs) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    rs.forEach(function (r) { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function inRect(p, R, pad) { return p[0] > R.x - pad && p[0] < R.x + R.w + pad && p[1] > R.y - pad && p[1] < R.y + R.h + pad; }
  function hit(a, b, pad) { return a.x < b.x + b.w + pad && a.x + a.w > b.x - pad && a.y < b.y + b.h + pad && a.y + a.h > b.y - pad; }
  function within(R, B, pad) { return R.x >= B.x + pad && R.y >= B.y + pad && R.x + R.w <= B.x + B.w - pad && R.y + R.h <= B.y + B.h - pad; }

  // The glyph itself: a tip, a direction and a length in; the two strokes and their samples out.
  function glyph(tip, deg, L, seed) {
    var r = Pen.rng(seed + '|glyph'), a = deg * RAD, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    var tail = [tip[0] - ux * L, tip[1] - uy * L];
    // The bow: a cubic whose bend lives in the first part of the stroke and whose last third runs
    // straight down the chord — the hand bows a little leaving the tail and lands aimed. Its widest
    // departure from straight (at t = 1/3) is 4/9 of the first control's offset, i.e. exactly sag.
    var sag = (.7 + r() * 1.05) * (r() < .5 ? -1 : 1), k = .26 + r() * .1;
    var c1 = [tail[0] + ux * L * k + nx * sag * 2.25, tail[1] + uy * L * k + ny * sag * 2.25];
    var c2 = [tip[0] - ux * L * .34, tip[1] - uy * L * .34];
    function at(t) { var m = 1 - t, a0 = m * m * m, a1 = 3 * m * m * t, a2 = 3 * m * t * t, a3 = t * t * t;
      return [a0 * tail[0] + a1 * c1[0] + a2 * c2[0] + a3 * tip[0], a0 * tail[1] + a1 * c1[1] + a2 * c2[1] + a3 * tip[1]]; }
    // Landing straight means the head sits square on the chord: both barbs are measured from it.
    var l1 = 6.6 + r() * 1, l2 = l1 * (.9 + r() * .1), s1 = (25 + r() * 5) * RAD, s2 = (25 + r() * 5) * RAD;
    var b1 = [tip[0] - Math.cos(a - s1) * l1, tip[1] - Math.sin(a - s1) * l1];
    var b2 = [tip[0] - Math.cos(a + s2) * l2, tip[1] - Math.sin(a + s2) * l2];
    var pts = [];
    for (var i = 0; i <= 14; i++) pts.push(at(i / 14));
    pts.push(b1, b2, [(b1[0] + tip[0]) / 2, (b1[1] + tip[1]) / 2], [(b2[0] + tip[0]) / 2, (b2[1] + tip[1]) / 2]);
    var peak = at(1 / 3), along = (peak[0] - tail[0]) * ux + (peak[1] - tail[1]) * uy, foot = [tail[0] + ux * along, tail[1] + uy * along];
    return {
      tail: tail, tip: tip, c1: c1, c2: c2, peak: peak, foot: foot, b1: b1, b2: b2, ux: ux, uy: uy, L: L, deg: deg, sag: Math.abs(sag),
      barbs: [l1, l2], spread: [s1 / RAD, s2 / RAD], pts: pts,
      shaft: 'M' + pt(tail) + ' C' + pt(c1) + ' ' + pt(c2) + ' ' + pt(tip),
      head: 'M' + pt(b1) + ' L' + pt(tip) + ' L' + pt(b2)
    };
  }

  // Aim at the target's edge on the approach side; the tip is where the ray back from the aim
  // leaves the target's box grown by the gap. frac slides the aim along a top or bottom edge.
  function tipFor(k, line, frac, deg, gap) {
    var x0 = line.x, y0 = line.y, x1 = x0 + line.w, y1 = y0 + line.h, dy = Math.min(line.h * .3, 8), aim;
    var ax = x0 + clamp(line.w * frac, Math.min(10, line.w / 2), line.w - Math.min(10, line.w / 2));
    if (k === 'W') aim = [x0, y0 + line.h * .55];
    else if (k === 'E') aim = [x1, y0 + line.h * .55];
    else if (k === 'N') aim = [ax, y0];
    else if (k === 'S') aim = [ax, y1];
    else if (k === 'NW') aim = [x0, y0 + dy];
    else if (k === 'NE') aim = [x1, y0 + dy];
    else if (k === 'SW') aim = [x0, y1 - dy];
    else aim = [x1, y1 - dy];
    var vx = -Math.cos(deg * RAD), vy = -Math.sin(deg * RAD), tx = Infinity, ty = Infinity;
    if (vx < -1e-6) tx = (aim[0] - (x0 - gap)) / -vx; else if (vx > 1e-6) tx = (x1 + gap - aim[0]) / vx;
    if (vy < -1e-6) ty = (aim[1] - (y0 - gap)) / -vy; else if (vy > 1e-6) ty = (y1 + gap - aim[1]) / vy;
    var t = Math.min(tx, ty);
    return [aim[0] + vx * t, aim[1] + vy * t];
  }

  // Stroke radius (1.1) + 3 px of air around text and objects; the stroke stays inside the view.
  function clearPath(g, B, obs, box) {
    for (var i = 0; i < g.pts.length; i++) {
      var p = g.pts[i];
      if (!inRect(p, { x: B.x + 2.2, y: B.y + 2.2, w: B.w - 4.4, h: B.h - 4.4 }, 0)) return false;
      if (inRect(p, box, 2)) return false;
      for (var j = 0; j < obs.length; j++) if (inRect(p, obs[j], 4)) return false;
    }
    return true;
  }

  function fitNote(k, g, note, B, obs, box, prefer) {
    var layouts = prefer === 'row' || k === 'N' || k === 'S' ? ['row', 'stack'] : ['stack', 'row'];
    for (var li = 0; li < layouts.length; li++) {
      var sz = note[layouts[li]]; if (!sz) continue;
      for (var ai = 0; ai < NOTE[k].length; ai++) {
        var n = NOTE[k][ai], R = { x: g.tail[0] + n[2] - n[0] * sz.w, y: g.tail[1] + n[3] - n[1] * sz.h, w: sz.w, h: sz.h };
        if (!within(R, B, 4) || hit(R, box, 6)) continue;
        var ok = true;
        for (var j = 0; j < obs.length && ok; j++) if (hit(R, obs[j], 4)) ok = false;
        for (j = 0; j < g.pts.length - 4 && ok; j++) if (inRect(g.pts[j], R, 1.5)) ok = false;
        if (ok) return { x: R.x, y: R.y, w: R.w, h: R.h, layout: layouts[li], ax: n[0], ay: n[1], align: n[0] > .7 ? 'r' : n[0] < .3 ? 'l' : 'c' };
      }
    }
    return null;
  }

  // o: { target: rect | [line rects], bounds, obstacles, note: { row, stack } | null, seed, order, prefer }
  // → { k, g, note, tries } or null. Rects are { x, y, w, h } in one frame.
  function solve(o) {
    var lines = Array.isArray(o.target) ? o.target : [o.target];
    if (!lines.length) return null;
    var box = union(lines), first = lines[0], last = lines[lines.length - 1];
    var B = o.bounds, obs = o.obstacles || [], r = Pen.rng(o.seed + '|fit'), order = o.order || ORDER;
    var gap = 4.5 + r() * 1.5, jit = (r() - .5) * 5;
    var Lnom = clamp(clamp(26 + first.h * .3, 30, 38) + (r() - .5) * 3, MIN, MAX), lens = Lnom - MIN > 1 ? [Lnom, MIN] : [MIN];
    var withNote = o.note ? [true, false] : [false], tries = 0;
    for (var wn = 0; wn < withNote.length; wn++) {
      for (var i = 0; i < order.length; i++) {
        var k = order[i], deg = APPROACH[k].deg + jit, line = /S/.test(k) ? last : first;
        var fracs = k === 'N' || k === 'S' ? [.5, .3, .7] : [.5];
        for (var fi = 0; fi < fracs.length; fi++) {
          var tip = tipFor(k, line, fracs[fi], deg, gap);
          for (var li = 0; li < lens.length; li++) {
            tries++;
            var g = glyph(tip, deg, lens[li], o.seed);
            if (!clearPath(g, B, obs, box)) continue;
            if (!withNote[wn]) return { k: k, g: g, note: null, dropped: !!o.note, tries: tries };
            var n = fitNote(k, g, o.note, B, obs, box, o.prefer);
            if (n) return { k: k, g: g, note: n, dropped: false, tries: tries };
          }
        }
      }
    }
    return null;
  }

  function rel(c, F) { return { x: c.left - F.left, y: c.top - F.top, w: c.width, h: c.height }; }

  // Every line of visible text under root, plus anything marked [data-ob] (icons, pins, other
  // paper), as rects in frame's coordinates. Text inside `skip` elements is ignored.
  function collect(root, frame, skip) {
    var F = frame.getBoundingClientRect(), out = [], rg = document.createRange(), vis = new Map();
    skip = (skip || []).filter(Boolean);
    function skipped(el) { for (var i = 0; i < skip.length; i++) if (skip[i].contains(el)) return true; return false; }
    function shown(el) {
      if (!vis.has(el)) vis.set(el, getComputedStyle(el).visibility !== 'hidden' && !el.closest('[data-ob-ignore]'));
      return vis.get(el);
    }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (var n = w.nextNode(); n; n = w.nextNode()) {
      var el = n.parentElement;
      if (!n.nodeValue.trim() || !el || skipped(el) || !shown(el)) continue;
      rg.selectNodeContents(n);
      [].forEach.call(rg.getClientRects(), function (c) { if (c.width > .5 && c.height > .5) out.push(rel(c, F)); });
    }
    root.querySelectorAll('[data-ob]').forEach(function (e) {
      if (skipped(e)) return;
      var c = e.getBoundingClientRect(); if (c.width && c.height) out.push(rel(c, F));
    });
    return out;
  }

  window.ArrowFit = { APPROACH: APPROACH, ORDER: ORDER, MIN: MIN, MAX: MAX, glyph: glyph, tipFor: tipFor, solve: solve, collect: collect, rel: rel, union: union, hit: hit, inRect: inRect };
})();
