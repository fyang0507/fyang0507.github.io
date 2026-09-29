/* r3-05 · the featured marks, as geometry. Each icon is drawn in a −12…12 box, seeded so every visit
   gets the same cut. Stickers are one piece of paper with one flap — the part that didn't take the glue:
   the art is drawn twice, once clipped to the body and once clipped to the flap, and the flap folds
   up about its crease. No line at the crease: a lifted corner shows only as a shorter flap and the
   contact shadow under it (tone marks contact, not light). The seal is ink in the paper, so it has no flap and no thickness.
     flower  — 小红花: the teacher's little red paper flower, cut on a cream sticker
     star    — the teacher's gold star, in coral: a gummed paper star, one point lifted
     seal    — 荐: a hand-pressed 白文 seal, uneven ink, stamped rather than stuck
     rosette — the prize rosette: pleated coral disc, two tails, the left tail's end lifted */
(function () {
  var D = Math.PI / 180;
  var f = function (n) { return Math.round(n * 100) / 100; };
  var P = function (p) { return f(p[0]) + ' ' + f(p[1]); };

  function closed(pts) {   // closed Catmull-Rom
    var n = pts.length, d = 'M' + P(pts[0]);
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += 'C' + P([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]) + ' ' + P([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]) + ' ' + P(p2);
    }
    return d + 'Z';
  }
  function poly(pts) { return 'M' + pts.map(P).join('L') + 'Z'; }
  // Straight edges, rounded corners (scissors cut straight; paper corners soften).
  function rounded(v, radii) {
    var n = v.length, d = '';
    for (var i = 0; i < n; i++) {
      var a = v[(i - 1 + n) % n], b = v[i], c = v[(i + 1) % n], r = radii[i % radii.length];
      var la = Math.hypot(a[0] - b[0], a[1] - b[1]), lc = Math.hypot(c[0] - b[0], c[1] - b[1]);
      var p = [b[0] + (a[0] - b[0]) * r / la, b[1] + (a[1] - b[1]) * r / la], q = [b[0] + (c[0] - b[0]) * r / lc, b[1] + (c[1] - b[1]) * r / lc];
      d += (i ? 'L' : 'M') + P(p) + 'Q' + P(b) + ' ' + P(q);
    }
    return d + 'Z';
  }
  // Outline of a union of circles (a star-shaped region round the origin), sampled by angle.
  function union(cs, N) {
    var pts = [];
    for (var i = 0; i < N; i++) {
      var th = i / N * Math.PI * 2, ux = Math.cos(th), uy = Math.sin(th), best = 1;
      cs.forEach(function (c) {
        var along = c.x * ux + c.y * uy, disc = c.r * c.r - (c.x * c.x + c.y * c.y - along * along);
        if (disc >= 0) best = Math.max(best, along + Math.sqrt(disc));
      });
      pts.push([ux * best, uy * best]);
    }
    return pts;
  }
  function notch(a, b) {   // the outer crossing of two circles
    var dx = b.x - a.x, dy = b.y - a.y, s = Math.hypot(dx, dy), k = (a.r * a.r - b.r * b.r + s * s) / (2 * s), h = Math.sqrt(Math.max(0, a.r * a.r - k * k));
    var mx = a.x + dx * k / s, my = a.y + dy * k / s, p = [mx - dy * h / s, my + dx * h / s], q = [mx + dy * h / s, my - dx * h / s];
    return Math.hypot(p[0], p[1]) > Math.hypot(q[0], q[1]) ? p : q;
  }
  var far = function (p, k) { return [p[0] * k, p[1] * k]; };

  var INK = 'var(--ink)', CORAL = 'var(--mark)', PAPER = 'var(--paper)';
  var fill = function (d, c, w) { return '<path d="' + d + '" fill="' + c + '"' + (w ? ' stroke="' + INK + '" stroke-width="' + w + '" stroke-linejoin="round"' : '') + '/>'; };

  var icons = {
    flower: function (r) {
      var a0 = -126 + (r() - .5) * 10, petals = [], cuts = [], k;
      for (k = 0; k < 5; k++) {
        var a = (a0 + k * 72 + (r() - .5) * 7) * D, d = 5.6 + (r() - .5) * .4, pr = 3.6 + (r() - .5) * .4;
        petals.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: pr });
        cuts.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: pr + 1.1 });
      }
      var cut = closed(union(cuts, 150)), coral = closed(union(petals, 150));
      var L = 3, A = notch(cuts[L], cuts[L - 1]), B = notch(cuts[L], cuts[L + 1]);   // the bottom petal lifts: it faces the board's light, so its shadow shows
      return {
        rest: -8, dx: .005, dy: -.02, scale: 1.1, flap: { A: A, B: B, region: [A, far(A, 3), far(B, 3), B] }, shadow: cut,
        art: fill(cut, PAPER, 1.1) + fill(coral, CORAL) + '<circle r="2.05" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1"/>'
      };
    },
    star: function (r) {
      var a0 = -90 + (r() - .5) * 6, v = [], k;
      for (k = 0; k < 5; k++) {
        var ao = (a0 + k * 72 + (r() - .5) * 5) * D, ai = (a0 + 36 + k * 72 + (r() - .5) * 5) * D, Ro = 11.1 + (r() - .5) * .9, Ri = 5 + (r() - .5) * .45;
        v.push([Math.cos(ao) * Ro, Math.sin(ao) * Ro], [Math.cos(ai) * Ri, Math.sin(ai) * Ri]);
      }
      var d = rounded(v, [1.5, .55]), A = v[5], B = v[7];   // the lower-left point lifts: its crease joins the inner corners either side
      return { rest: -10, dx: .01, dy: -.03, scale: 1.06, flap: { A: A, B: B, region: [A, far(A, 3.4), far(B, 3.4), B] }, shadow: d, art: fill(d, CORAL, 1.1) };
    },
    rosette: function (r) {
      var cy = -2.6, n = 12, N = 144, pts = [], i;
      for (i = 0; i < N; i++) {
        var th = i / N * Math.PI * 2, u = Math.abs(Math.sin(th * n / 2)), rr = 6.3 + 1.35 * Math.pow(u, .7) + Math.sin(th * 2 + 1) * .12;
        pts.push([Math.cos(th) * rr, cy + Math.sin(th) * rr]);
      }
      function tail(deg, len, w) {
        var a = deg * D, dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx, o = [0, cy];
        var at = function (t, s) { return [o[0] + dx * t + px * s, o[1] + dy * t + py * s]; };
        return { pts: [at(0, -w / 2), at(len, -w / 2), at(len - 1.7, 0), at(len, w / 2), at(0, w / 2)], at: at };
      }
      var tl = tail(113 + (r() - .5) * 4, 12.2, 3.9), tr = tail(71 + (r() - .5) * 4, 12.6, 3.9);
      var A = tl.at(8.2, -1.95), B = tl.at(8.2, 1.95);   // the left tail's end curls off the card
      var ends = rounded(tl.pts, [.45]) + rounded(tr.pts, [.45]);
      return {
        rest: 6, dx: .02, dy: -.06, scale: 1.14, flap: { A: A, B: B, region: [tl.at(8.2, -3), tl.at(16, -3), tl.at(16, 3), tl.at(8.2, 3)] }, shadow: rounded(tl.pts, [.45]),
        art: fill(ends, CORAL, 1.05) + fill(closed(pts), CORAL, 1.05) + '<circle cy="' + cy + '" r="3.35" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1"/>'
      };
    },
    seal: function (r) {
      // A square carved by hand: straight sides that wander a little, two chips out of the edge.
      var h = 9.1, v = [], chips = [1 + Math.floor(r() * 3), 9 + Math.floor(r() * 3)], k = 0;
      [[-h, -h, 1, 0, 0, 1], [h, -h, 0, 1, -1, 0], [h, h, -1, 0, 0, -1], [-h, h, 0, -1, 1, 0]].forEach(function (s) {   // start, direction, inward normal
        for (var i = 0; i < 4; i++, k++) {
          var t = i / 4, j = i ? (r() - .5) * .34 + (chips.indexOf(k) >= 0 ? .7 : 0) : 0;
          v.push([s[0] + s[2] * 2 * h * t + s[4] * j, s[1] + s[3] * 2 * h * t + s[5] * j]);
        }
      });
      var spk = '', n;
      for (n = 0; n < 20; n++) {   // light pressure at the top right: the paper shows through there
        var sx = h * (1 - Math.pow(r(), 1.6) * 1.9), sy = -h * (1 - Math.pow(r(), 1.6) * 1.9);
        spk += '<circle cx="' + f(sx * .92) + '" cy="' + f(sy * .92) + '" r="' + f(.2 + r() * .42) + '"/>';
      }
      return {
        rest: -6, dx: -.03, dy: .05, scale: .98, stamp: true,
        art: fill(rounded(v, [1.2, .3, .3, .3]), CORAL) +
          '<text x="0" y=".4" text-anchor="middle" dominant-baseline="central" font-size="15.2" font-weight="600" fill="#fff" font-family="\'Noto Serif SC\',serif">荐</text>' +
          '<g class="stk-spk" fill="#fff">' + spk + '</g>'
      };
    }
  };

  /* svg(name, seed, uid) → { html, icon }. Flap framing: the flap's group is placed at the crease with
     its x axis along the outward normal, so a CSS scaleX on .stk-flap (origin 0 0 = the crease) folds it up.
     The viewBox starts at 0 0 (content shifted by 12) because an SVG element's CSS transform origin is
     measured from the viewBox corner, not from the local origin. */
  // The contact shadow of a flap raised about its crease: a point x out from the crease stands x·sinθ
  // high, so its shadow slides along the light (the board's: falling down-left) by a length ∝ x —
  // nothing at the crease, most at the tip. Returned as the SVG matrix in the crease frame.
  var LIFT = 0.7, LIGHT = [-0.54, 0.84], KZ = 0.55;
  function shadowOf(angDeg) {
    var a = -angDeg * D, lx = LIGHT[0] * Math.cos(a) - LIGHT[1] * Math.sin(a), ly = LIGHT[0] * Math.sin(a) + LIGHT[1] * Math.cos(a), z = Math.sqrt(1 - LIFT * LIFT) * KZ;
    return [f(LIFT + z * lx), f(z * ly), 0, 1, 0, 0].join(' ');
  }
  function svg(name, seed, uid) {
    var ic = icons[name](Pen.rng(seed)), s = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g transform="translate(12 12)">';
    if (!ic.flap) return { icon: ic, html: s + ic.art + '</g></svg>' };
    var A = ic.flap.A, B = ic.flap.B, M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    var tx = B[0] - A[0], ty = B[1] - A[1], nx = ty, ny = -tx;                    // a normal to the crease…
    if (nx * M[0] + ny * M[1] < 0) { nx = -nx; ny = -ny; }                     // …pointing away from the middle
    if (ic.flap.out) { nx = ic.flap.out[0]; ny = ic.flap.out[1]; }
    var ang = Math.atan2(ny, nx) / D, reg = poly(ic.flap.region);
    var back = '<g transform="rotate(' + f(-ang) + ') translate(' + f(-M[0]) + ' ' + f(-M[1]) + ')"><g clip-path="url(#' + uid + '-f)">';
    s += '<defs><clipPath id="' + uid + '-b"><path clip-rule="evenodd" d="M-40 -40H40V40H-40Z' + reg + '"/></clipPath>' +
      '<clipPath id="' + uid + '-f"><path d="' + reg + '"/></clipPath></defs>' +
      '<g clip-path="url(#' + uid + '-b)">' + ic.art + '</g>' +
      '<g transform="translate(' + P(M) + ') rotate(' + f(ang) + ')">' +
      '<g class="stk-shadow" transform="matrix(' + shadowOf(ang) + ')">' + back + '<path d="' + ic.shadow + '" fill="rgba(60,50,35,.36)"/></g></g></g>' +
      '<g class="stk-flap">' + back + ic.art + '</g></g></g></g>';
    return { icon: ic, html: s + '</g></svg>' };
  }

  window.FYFeaturedIcons = { svg: svg, lift: LIFT, names: ['flower', 'star', 'seal', 'rosette'] };
})();
