/* pen.js — one hand for every annotation on the site (window.Pen).
   Wobble is seeded by the element it marks (its text, or data-pen-seed), so the same word always gets
   the same stroke: a person drew it once. Re-rolling per frame is jitter, which is evidence of nobody.
   Every stroke lands in one confident pass (stroke-dashoffset) and retracts faster than it drew.

   Underlines hang from the text's baseline, measured in the element's own untransformed frame:
   baseline + max(3 px, 0.18 em). Measuring on-screen boxes instead puts the line several px low
   inside any rotated card (design/2026-09-motion, board r4-02).

   The pointing arrow is a fixed glyph (glyph()): a 26–40 px shaft whatever the distance, a bow under
   2 px that straightens before it lands, two ~7 px barbs at 25–30°. It is spent once per session per
   key (pointOnce / spend). Needs motion.js. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', RAD = Math.PI / 180;

  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = typeof seed === 'number' ? seed >>> 0 : hash(seed);
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function pt(p) { return p[0].toFixed(2) + ' ' + p[1].toFixed(2); }
  function reduced() { return Motion.reduced(); }
  // The seed a mark uses: data-pen-seed on the element, else its text.
  function seedOf(el, fallback) { return (el && el.getAttribute && el.getAttribute('data-pen-seed')) || ((el && el.textContent) || '').replace(/\s+/g, ' ').trim() || fallback || 'pen'; }

  // Catmull-Rom through points → cubic Bézier path.
  function smooth(pts) {
    if (pts.length < 2) return '';
    var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ' C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
        f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
    }
    return d;
  }

  // A pen circling a word: a little more than one lap, overshooting its own start. Box w×h.
  function loop(w, h, seed, opt) {
    opt = opt || {}; var r = rng(seed), pad = opt.pad == null ? 6 : opt.pad;
    var cx = w / 2, cy = h / 2, rx = w / 2 + pad, ry = h / 2 + pad * .8;
    var start = Math.PI * (1.05 + r() * .15), laps = 1.12 + r() * .1, n = 26, pts = [], tilt = (r() - .5) * .06;
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = start + t * laps * Math.PI * 2;
      var grow = 1 + (t - .5) * (.05 + r() * .02), wob = 1 + Math.sin(t * 5.3 + r() * 6) * .018;
      var x = cx + Math.cos(a) * rx * grow * wob, y = cy + Math.sin(a) * ry * grow * wob;
      pts.push([x + (y - cy) * tilt, y - (x - cx) * tilt]);
    }
    return smooth(pts);
  }

  // A nearly level underline at y: a faint sag and a blunt end that settles a hair lower than it
  // started. Never a rising tail: an upturned end under a word reads as Amazon's smile-arrow.
  function underline(w, seed, opt) {
    opt = opt || {}; var r = rng(seed), y = opt.y || 0, n = 6, pts = [];
    var sag = 0.5 + r() * 0.8, drop = 0.4 + r() * 0.9;
    for (var i = 0; i <= n; i++) { var t = i / n; pts.push([-2 + t * (w + 4), y + Math.sin(t * Math.PI) * sag + t * drop]); }
    return smooth(pts);
  }

  // A square bracket beside a block. side: 'left' | 'right'.
  function bracket(h, seed, side) {
    var r = rng(seed), k = side === 'right' ? -1 : 1, arm = 6 + r() * 3;
    return smooth([[arm * k, -1], [r() * 1.2, 1.5], [(r() - .5) * 1.4, h / 2], [r() * 1.2, h - 1.5], [arm * k + (r() - .5), h + 1]]);
  }
  // Illustration only (a checklist on the sleeve), never a state mark.
  function tick(s, seed) { var r = rng(seed); return smooth([[0, s * .55], [s * .32, s * (.92 + r() * .06)], [s * (.95 + r() * .08), s * .02]]); }
  function strike(w, seed) { var r = rng(seed); return smooth([[-3, 1.5 + r()], [w * .5, -r() * 1.2], [w + 3, -1 - r()]]); }

  // The pointing arrow: tip, direction of travel (degrees, y down) and shaft length in; strokes out.
  // The bow is a cubic whose bend lives in the first third and whose last third runs straight down
  // the chord, so the head sits square on the line it points along (widest departure = sag).
  function glyph(tip, deg, L, seed) {
    var r = rng(seed + '|glyph'), a = deg * RAD, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    var tail = [tip[0] - ux * L, tip[1] - uy * L];
    var sag = (.7 + r() * 1.05) * (r() < .5 ? -1 : 1), k = .26 + r() * .1;
    var c1 = [tail[0] + ux * L * k + nx * sag * 2.25, tail[1] + uy * L * k + ny * sag * 2.25];
    var c2 = [tip[0] - ux * L * .34, tip[1] - uy * L * .34];
    function at(t) {
      var m = 1 - t, a0 = m * m * m, a1 = 3 * m * m * t, a2 = 3 * m * t * t, a3 = t * t * t;
      return [a0 * tail[0] + a1 * c1[0] + a2 * c2[0] + a3 * tip[0], a0 * tail[1] + a1 * c1[1] + a2 * c2[1] + a3 * tip[1]];
    }
    var l1 = 6.6 + r() * 1, l2 = l1 * (.9 + r() * .1), s1 = (25 + r() * 5) * RAD, s2 = (25 + r() * 5) * RAD;
    var b1 = [tip[0] - Math.cos(a - s1) * l1, tip[1] - Math.sin(a - s1) * l1];
    var b2 = [tip[0] - Math.cos(a + s2) * l2, tip[1] - Math.sin(a + s2) * l2];
    var peak = at(1 / 3), along = (peak[0] - tail[0]) * ux + (peak[1] - tail[1]) * uy;
    return {
      tail: tail, tip: tip, b1: b1, b2: b2, ux: ux, uy: uy, L: L, deg: deg, sag: Math.abs(sag), barbs: [l1, l2], spread: [s1 / RAD, s2 / RAD],
      peak: peak, foot: [tail[0] + ux * along, tail[1] + uy * along],
      shaft: 'M' + pt(tail) + ' C' + pt(c1) + ' ' + pt(c2) + ' ' + pt(tip),
      head: 'M' + pt(b1) + ' L' + pt(tip) + ' L' + pt(b2)
    };
  }
  // The pointer is spent once per browser session per key (sessionStorage fy-point-<key>).
  function pointOnce(key) { try { return sessionStorage.getItem('fy-point-' + key) !== '1'; } catch (e) { return true; } }
  function spend(key) { try { sessionStorage.setItem('fy-point-' + key, '1'); } catch (e) { /* private mode */ } }

  /* ---- measuring in the untransformed frame ---- */
  // Where el sits inside host, from offsets, which ignore CSS transforms.
  function frame(host, el) {
    var x = 0, y = 0, n = el;
    while (n && n !== host) {
      x += n.offsetLeft; y += n.offsetTop;
      var p = n.offsetParent; if (p && p !== host) { x += p.clientLeft; y += p.clientTop; }
      n = p;
    }
    if (n !== host) {   // el isn't in host's offset chain: fall back to on-screen boxes
      var a = el.getBoundingClientRect(), b = host.getBoundingClientRect();
      return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
    }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
  }
  // host's screen → local map, exact under any CSS transforms on host or its ancestors: three
  // zero-size probes at (0,0), (100,0), (0,100) of host's padding box show where its axes land.
  function localMap(host) {
    var r = [[0, 0], [100, 0], [0, 100]].map(function (q) {
      var p = document.createElement('span');
      p.style.cssText = 'position:absolute;left:' + q[0] + 'px;top:' + q[1] + 'px;width:0;height:0;margin:0;padding:0;border:0';
      host.appendChild(p); var b = p.getBoundingClientRect(); p.remove(); return b;
    });
    var ox = r[0].left, oy = r[0].top, ax = (r[1].left - ox) / 100, ay = (r[1].top - oy) / 100, bx = (r[2].left - ox) / 100, by = (r[2].top - oy) / 100, det = ax * by - ay * bx || 1;
    return function (x, y) { var dx = x - ox, dy = y - oy; return [(dx * by - dy * bx) / det, (ax * dy - ay * dx) / det]; };
  }
  // A line's baseline in host's frame, to the sub-pixel: a zero-size inline-block probe sits on it.
  // Appended for the last line (where an underline goes), prepended for the first (where a band starts).
  // Pass a localMap(host) to reuse it across several measurements of one build.
  function baseline(host, el, first, map) {
    var p = document.createElement('span');
    p.style.cssText = 'display:inline-block;width:0;height:0;margin:0;padding:0;border:0;vertical-align:baseline';
    if (first) el.insertBefore(p, el.firstChild); else el.appendChild(p);
    var b = p.getBoundingClientRect(); el.removeChild(p);
    if (!map && getComputedStyle(host).position === 'static') host.style.position = 'relative';
    return (map || localMap(host))(b.left, b.top)[1];
  }
  // How far an underline hangs below the baseline: max(3 px, 0.18 em).
  function drop(el) { return Math.max(3, (parseFloat(getComputedStyle(el).fontSize) || 16) * 0.18); }

  /* ---- strokes ---- */
  function path(d, opt) {
    opt = opt || {};
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('fill', 'none');
    p.setAttribute('stroke', opt.color || 'var(--pen)'); p.setAttribute('stroke-width', opt.width || 2.2);
    p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    return p;
  }
  // A dash fully off the path still paints its round cap where it ends, so "hidden" sits one cap-width
  // past either end, and the gap is long enough that the next dash never shows.
  function capW(p) { return parseFloat(p.getAttribute('stroke-width')) || 2.2; }
  function hiddenAt(p, L) { return L + capW(p) + 1; }
  function dashes(p, L) { return L + ' ' + (L + 2 * capW(p) + 4); }
  function draw(p, opt) {
    opt = opt || {};
    var L = p.getTotalLength(), H = hiddenAt(p, L);
    p.style.strokeDasharray = dashes(p, L);
    p.getAnimations().forEach(function (a) { a.cancel(); });
    if (reduced()) { p.style.strokeDashoffset = 0; return null; }
    return p.animate([{ strokeDashoffset: H }, { strokeDashoffset: 0 }],
      { duration: opt.duration || Math.min(620, 200 + L * 1.1), delay: opt.delay || 0, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'both' });
  }
  function erase(p, opt) {
    opt = opt || {};
    var L = p.getTotalLength(), H = hiddenAt(p, L), cur = parseFloat(getComputedStyle(p).strokeDashoffset) || 0;
    p.style.strokeDasharray = dashes(p, L);
    p.getAnimations().forEach(function (a) { a.cancel(); });
    if (reduced()) { p.style.strokeDashoffset = H; return null; }
    return p.animate([{ strokeDashoffset: cur }, { strokeDashoffset: -H }], { duration: opt.duration || 200, easing: 'cubic-bezier(.4,0,.8,.4)', fill: 'both' });
  }

  // A hover/focus annotation on an element. kind: loop | underline | bracket | strike | tick.
  // opt: seed · side (bracket) · size (tick) · color · width · z · manual (no listeners) · on (show now).
  function annotate(el, kind, opt) {
    opt = opt || {};
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var svg = document.createElementNS(NS, 'svg'), p = null, shown = false;
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:' + (opt.z || 0);
    el.appendChild(svg);
    function build() {
      var w = el.offsetWidth, h = el.offsetHeight, seed = opt.seed || seedOf(el, kind), d;
      if (kind === 'loop') d = loop(w, h, seed, opt);
      else if (kind === 'underline') d = underline(w, seed, { y: baseline(el, el) + drop(el) });
      else if (kind === 'bracket') { d = bracket(h, seed, opt.side); svg.style.left = (opt.side === 'right' ? w + 6 : -10) + 'px'; }
      else if (kind === 'strike') d = strike(w, seed);
      else d = tick(opt.size || 14, seed);
      svg.textContent = ''; p = path(d, opt);
      if (kind === 'strike') p.setAttribute('transform', 'translate(0 ' + h / 2 + ')');
      svg.appendChild(p);
      var L = p.getTotalLength(); p.style.strokeDasharray = dashes(p, L); p.style.strokeDashoffset = shown ? 0 : hiddenAt(p, L);
    }
    build();
    var ro = new ResizeObserver(function () { build(); }), fonts = function () { build(); };
    ro.observe(el);
    // ResizeObserver never fires for an inline element, so a font swap that moves the baseline rebuilds here.
    document.fonts.addEventListener('loadingdone', fonts);
    var api = {
      el: el, svg: svg, rebuild: build,
      show: function () { shown = true; if (p) draw(p, opt); },
      hide: function () { shown = false; if (p) erase(p, opt); },
      destroy: function () {
        ro.disconnect();
        document.fonts.removeEventListener('loadingdone', fonts);
        el.removeEventListener('pointerenter', api.show); el.removeEventListener('pointerleave', api.hide);
        el.removeEventListener('focus', api.show); el.removeEventListener('blur', api.hide);
        svg.remove();
      }
    };
    if (!opt.manual) {
      el.addEventListener('pointerenter', api.show); el.addEventListener('pointerleave', api.hide);
      el.addEventListener('focus', api.show); el.addEventListener('blur', api.hide);
    }
    if (opt.on) requestAnimationFrame(api.show);
    return api;
  }

  window.Pen = {
    rng: rng, hash: hash, smooth: smooth, loop: loop, underline: underline, bracket: bracket, tick: tick, strike: strike,
    glyph: glyph, pointOnce: pointOnce, spend: spend, path: path, draw: draw, erase: erase, annotate: annotate,
    dashes: dashes, hiddenAt: hiddenAt, reduced: reduced, seedOf: seedOf, frame: frame, baseline: baseline, localMap: localMap, drop: drop
  };
})();
