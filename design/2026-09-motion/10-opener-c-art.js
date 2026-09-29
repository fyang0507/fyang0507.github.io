/* 10c · art — the OP's own marks. Everything here is drawn per shot from a seed, so a frame gets the same
   lines every time it plays (a person drew it once; re-rolling per play would be jitter). One pen per frame:
   round caps, near-single weight, lengths and spacing deliberately unequal. Needs shared/pen.js. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function f(n) { return Math.round(n * 10) / 10; }
  function R(seed) { return Pen.rng('10c·' + seed); }
  function seg(x0, y0, x1, y1) { return 'M' + f(x0) + ' ' + f(y0) + 'L' + f(x1) + ' ' + f(y1); }

  // 集中線 focus lines: strokes aimed at (cx,cy) from beyond the frame edge, stopping on an irregular ellipse.
  // o.skip = [[a0, a1], …] leaves angular gaps (radians, screen coords) so the lines never cross a label.
  // Returns two stroke groups (thin, thick) so the weight varies the way a hand's pressure does.
  function focus(w, h, cx, cy, o) {
    var r = R(o.seed), n = o.n || 70, far = Math.hypot(w, h) * 1.2, a = r() * 6.28, thin = '', thick = '';
    for (var i = 0; i < n; i++) {
      a += 6.2832 / n * (.45 + r() * 1.1);
      var k = 1 + r() * (o.spread == null ? .55 : o.spread), c = Math.cos(a), s = Math.sin(a), big = r() < .38;
      var aa = Math.atan2(s, c);
      if (o.skip && o.skip.some(function (g) { return aa > g[0] && aa < g[1]; })) continue;
      var d = seg(cx + c * far, cy + s * far, cx + c * o.rx * k, cy + s * o.ry * k);
      if (big) thick += d; else thin += d;
    }
    return { thin: thin, thick: thick };
  }

  // Speed streaks behind a smear: parallel strokes of unequal length. dir 'x' = horizontal travel,
  // 'y' = vertical. box = [x, y, w, h] where the streaks live.
  function streaks(box, o) {
    var r = R(o.seed), n = o.n || 16, d = '', vert = o.dir === 'y';
    for (var i = 0; i < n; i++) {
      var across = box[vert ? 0 : 1] + r() * box[vert ? 2 : 3];
      var len = box[vert ? 3 : 2] * (.25 + r() * .7), start = box[vert ? 1 : 0] + r() * (box[vert ? 3 : 2] - len);
      d += vert ? seg(across, start, across, start + len) : seg(start, across, start + len, across);
    }
    return d;
  }

  // Impact / "noticed" ticks: short strokes fanning out from a point (Fred's sticker-peek motif, scaled up).
  function ticks(x, y, ang, len, o) {
    o = o || {};
    var r = R(o.seed || 't'), n = o.n || 3, spread = o.spread || .9, gap = o.gap || len * .45, d = '';
    for (var i = 0; i < n; i++) {
      var a = ang + (n === 1 ? 0 : (i / (n - 1) - .5) * spread) + (r() - .5) * .12;
      var l = len * (.72 + r() * .4), g = gap * (.85 + r() * .3);
      d += seg(x + Math.cos(a) * g, y + Math.sin(a) * g, x + Math.cos(a) * (g + l), y + Math.sin(a) * (g + l));
    }
    return d;
  }

  // A blunt starburst (the camera's flash, drawn — not a white-out). Straight edges: simplify toward blunt.
  function burst(cx, cy, rad, o) {
    var r = R(o.seed), n = o.n || 13, pts = [], a0 = r() * 6.28;
    for (var i = 0; i < n * 2; i++) {
      var a = a0 + i / (n * 2) * 6.2832 + (r() - .5) * .12;
      var k = i % 2 ? (.52 + r() * .1) : (.86 + r() * .3);
      pts.push(f(cx + Math.cos(a) * rad * k) + ' ' + f(cy + Math.sin(a) * rad * k));
    }
    return 'M' + pts.join('L') + 'Z';
  }

  // A small zigzag for 雷 (thunder): a drawn stroke, not an icon.
  function zig(x, y, s, ang, o) {
    var r = R(o.seed), pts = [[0, 0], [.42, .22], [.12, .46], [.6, .64], [.3, .86], [.8, 1.06]], c = Math.cos(ang), sn = Math.sin(ang), d = '';
    pts.forEach(function (p, i) {
      var px = (p[0] + (r() - .5) * .06) * s * .5, py = (p[1] + (r() - .5) * .04) * s;
      d += (i ? 'L' : 'M') + f(x + px * c - py * sn) + ' ' + f(y + px * sn + py * c);
    });
    return d;
  }

  // Hand ellipsis: three dots of slightly unequal size.
  function dots(x, y, s, o) {
    var r = R(o.seed), out = [];
    for (var i = 0; i < 3; i++) out.push({ x: x + i * s * 2.4 + (r() - .5) * s * .3, y: y + (r() - .5) * s * .35, r: s * (.44 + r() * .12) });
    return out;
  }

  function svg(w, h, cls) {
    var el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', '0 0 ' + f(w) + ' ' + f(h));
    el.setAttribute('width', w); el.setAttribute('height', h);
    el.setAttribute('aria-hidden', 'true');
    if (cls) el.setAttribute('class', cls);
    return el;
  }
  function stroke(parent, d, color, width, cls) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', color);
    p.setAttribute('stroke-width', f(width)); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    if (cls) p.setAttribute('class', cls);
    parent.appendChild(p); return p;
  }
  function fill(parent, d, color, cls) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('fill', color);
    if (cls) p.setAttribute('class', cls);
    parent.appendChild(p); return p;
  }
  function circle(parent, c, color, cls) {
    var e = document.createElementNS(NS, 'circle');
    e.setAttribute('cx', f(c.x)); e.setAttribute('cy', f(c.y)); e.setAttribute('r', f(c.r)); e.setAttribute('fill', color);
    if (cls) e.setAttribute('class', cls);
    parent.appendChild(e); return e;
  }

  // The bird, frame 0 of bird-strip6-light, traced by tools/10c-cut.py (centre-line of the ink, sprite px).
  // Redrawn at the close-up's register: silhouette and dot eye are the sprite's; the pen is chosen for the new
  // size (a straight rescale would give a ~110 px outline — a size change is a redraw, not a zoom).
  var BIRD = { pts: [[207, 252], [126, 252], [123.6, 250], [118, 240], [115, 226], [116, 210], [121, 184], [120.9, 164], [118.9, 156], [116, 151.4], [111, 147.5], [104, 145], [110, 142.5], [121, 133.9], [133, 128], [144, 125], [157, 125], [168, 128], [178.2, 134], [184.4, 140], [190, 149], [193, 157], [195, 166], [195, 190], [193, 201], [193.1, 222], [198.5, 241], [201, 245.6], [207.4, 251]],
    eye: { x: 152.2, y: 152.1, r: 5.3 }, fill: '#FDEFA8', line: '#866E4C' };
  // Closed curve that starts and ends on the beak tip (index 11), so the beak keeps its point.
  function birdPath(k, ox, oy) {
    var P = BIRD.pts.map(function (p) { return [ox + p[0] * k, oy + p[1] * k]; });
    return Pen.smooth(P.slice(11).concat(P.slice(0, 12))) + 'Z';
  }
  function bird(parent, k, ox, oy, pen) {
    var d = birdPath(k, ox, oy);
    fill(parent, d, BIRD.fill);
    stroke(parent, d, BIRD.line, pen);
    circle(parent, { x: ox + BIRD.eye.x * k, y: oy + BIRD.eye.y * k, r: BIRD.eye.r * k * 1.1 }, BIRD.line);
  }

  window.OCArt = { focus: focus, streaks: streaks, ticks: ticks, burst: burst, zig: zig, dots: dots,
    svg: svg, stroke: stroke, fill: fill, circle: circle, bird: bird, BIRD: BIRD };
})();
