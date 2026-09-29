/* pen.js — one hand for every annotation on the site.
   Wobble is seeded by the element it marks, so the same word always gets the same circle:
   a person drew it once. Re-rolling per frame is jitter, which is evidence of nobody.
   Every stroke lands in one confident pass (stroke-dashoffset), and retracts faster than it drew. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    var a = typeof seed === 'number' ? seed >>> 0 : hash(seed);
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function f(n) { return Math.round(n * 10) / 10; }

  // Catmull-Rom through points → cubic Bézier path. Open unless closed=true.
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

  // A pen circling a word: an ellipse that starts upper-left, runs a little more than one lap and
  // overshoots its own start. Box is w×h; pad pushes the loop outside the box.
  function loop(w, h, seed, opt) {
    opt = opt || {}; var r = rng(seed), pad = opt.pad == null ? 6 : opt.pad;
    var cx = w / 2, cy = h / 2, rx = w / 2 + pad, ry = h / 2 + pad * .8;
    var start = Math.PI * (1.05 + r() * .15), laps = 1.12 + r() * .1, n = 26, pts = [];
    var tilt = (r() - .5) * .06;
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = start + t * laps * Math.PI * 2;
      var grow = 1 + (t - .5) * (.05 + r() * .02);           // the second lap drifts outward
      var wob = 1 + Math.sin(t * 5.3 + r() * 6) * .018;       // slow wobble, not noise
      var x = cx + Math.cos(a) * rx * grow * wob, y = cy + Math.sin(a) * ry * grow * wob;
      pts.push([x + (y - cy) * tilt, y - (x - cx) * tilt]);
    }
    return smooth(pts);
  }

  // A nearly level underline: a faint sag and a blunt end that settles a hair lower than it started.
  // Never a rising tail: an upturned end under a word reads as Amazon's smile-arrow.
  function underline(w, seed, opt) {
    opt = opt || {}; var r = rng(seed), y = opt.y || 0, n = 6, pts = [];
    var sag = 0.5 + r() * 0.8, drop = 0.4 + r() * 0.9;
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      pts.push([-2 + t * (w + 4), y + Math.sin(t * Math.PI) * sag + t * drop]);
    }
    return smooth(pts);
  }

  // Emphatic back-and-forth scribble under a word: three passes, each a little shorter.
  function scribble(w, seed, opt) {
    opt = opt || {}; var r = rng(seed), y = opt.y || 0, pts = [], passes = opt.passes || 3;
    for (var p = 0; p < passes; p++) {
      var inset = p * w * .07, yy = y + p * 3.4;
      if (p % 2 === 0) { pts.push([inset - 1 + r() * 2, yy]); pts.push([w - inset + r() * 3, yy + (r() - .5) * 1.5]); }
      else { pts.push([w - inset, yy]); pts.push([inset + r() * 3, yy + (r() - .5) * 1.5]); }
    }
    return smooth(pts);
  }

  // A square bracket drawn beside a block. side: 'left' | 'right'.
  function bracket(h, seed, side) {
    var r = rng(seed), k = side === 'right' ? -1 : 1, arm = 6 + r() * 3;
    return smooth([[arm * k, -1], [r() * 1.2, 1.5], [(r() - .5) * 1.4, h / 2], [r() * 1.2, h - 1.5], [arm * k + (r() - .5), h + 1]]);
  }

  function tick(s, seed) { var r = rng(seed); return smooth([[0, s * .55], [s * .32, s * (.92 + r() * .06)], [s * (.95 + r() * .08), s * .02]]); }

  function strike(w, seed) { var r = rng(seed); return smooth([[-3, 1.5 + r()], [w * .5, -r() * 1.2], [w + 3, -1 - r()]]); }

  // A curved annotation arrow from a to b; returns {shaft, head}.
  function arrow(a, b, seed, opt) {
    opt = opt || {}; var r = rng(seed), bend = opt.bend == null ? .22 : opt.bend;
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    var c = [mx - dy * bend * (r() < .5 ? 1 : -1), my + dx * bend];
    var shaft = 'M' + f(a[0]) + ' ' + f(a[1]) + ' Q' + f(c[0]) + ' ' + f(c[1]) + ' ' + f(b[0]) + ' ' + f(b[1]);
    var ang = Math.atan2(b[1] - c[1], b[0] - c[0]), L = opt.head || 10;
    var h1 = [b[0] - Math.cos(ang - .5) * L, b[1] - Math.sin(ang - .5) * L], h2 = [b[0] - Math.cos(ang + .5) * L * .9, b[1] - Math.sin(ang + .5) * L * .9];
    return { shaft: shaft, head: 'M' + f(h1[0]) + ' ' + f(h1[1]) + ' L' + f(b[0]) + ' ' + f(b[1]) + ' L' + f(h2[0]) + ' ' + f(h2[1]) };
  }

  function reduced() {
    return document.documentElement.classList.contains('rm') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function path(d, opt) {
    opt = opt || {};
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', opt.color || 'var(--mark)');
    p.setAttribute('stroke-width', opt.width || 2.2);
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    return p;
  }

  // A dash that is fully off the path still paints its round cap where it ends, so "hidden" sits
  // one cap-width past either end, and the gap is long enough that the next dash never shows.
  function capW(p) { return parseFloat(p.getAttribute('stroke-width')) || 2.2; }
  function hiddenAt(p, L) { return L + capW(p) + 1; }
  function dashes(p, L) { return L + ' ' + (L + 2 * capW(p) + 4); }

  // One confident pass. Duration scales gently with length so long loops don't feel rushed.
  function draw(p, opt) {
    opt = opt || {};
    var L = p.getTotalLength(), H = hiddenAt(p, L);
    p.style.strokeDasharray = dashes(p, L);
    if (reduced()) { p.getAnimations().forEach(function (a) { a.cancel(); }); p.style.strokeDashoffset = 0; return null; }
    var dur = opt.duration || Math.min(620, 200 + L * 1.1);
    p.getAnimations().forEach(function (a) { a.cancel(); });
    return p.animate([{ strokeDashoffset: H }, { strokeDashoffset: 0 }],
      { duration: dur, delay: opt.delay || 0, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'both' });
  }
  function erase(p, opt) {
    opt = opt || {};
    var L = p.getTotalLength(), H = hiddenAt(p, L);
    p.style.strokeDasharray = dashes(p, L);
    if (reduced()) { p.getAnimations().forEach(function (a) { a.cancel(); }); p.style.strokeDashoffset = H; return null; }
    var cur = parseFloat(getComputedStyle(p).strokeDashoffset) || 0;
    p.getAnimations().forEach(function (a) { a.cancel(); });
    return p.animate([{ strokeDashoffset: cur }, { strokeDashoffset: -H }],
      { duration: opt.duration || 200, easing: 'cubic-bezier(.4,0,.8,.4)', fill: 'both' });
  }

  // Attach a hover/focus annotation to an element. kind: loop | underline | scribble | bracket | strike | tick.
  // Seed defaults to the element's text so the mark is stable across visits.
  function annotate(el, kind, opt) {
    opt = opt || {};
    var cs = getComputedStyle(el); if (cs.position === 'static') el.style.position = 'relative';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:' + (opt.z || 0);
    el.appendChild(svg);
    var p = null;
    function build() {
      var w = el.offsetWidth, h = el.offsetHeight, seed = opt.seed || (el.textContent || '').trim() || kind, d;
      if (kind === 'loop') d = loop(w, h, seed, opt);
      else if (kind === 'underline') d = underline(w, seed, { y: h + (opt.gap == null ? 3 : opt.gap) });
      else if (kind === 'scribble') d = scribble(w, seed, { y: h + (opt.gap == null ? 2 : opt.gap) });
      else if (kind === 'bracket') { d = bracket(h, seed, opt.side); svg.style.left = (opt.side === 'right' ? w + 6 : -10) + 'px'; }
      else if (kind === 'strike') d = strike(w, seed);
      else d = tick(opt.size || 14, seed);
      svg.innerHTML = ''; p = path(d, opt); if (kind === 'strike') p.setAttribute('transform', 'translate(0 ' + h / 2 + ')');
      svg.appendChild(p); var L = p.getTotalLength(); p.style.strokeDasharray = dashes(p, L); p.style.strokeDashoffset = hiddenAt(p, L);
    }
    build();
    var shown = false, lastW = el.offsetWidth, lastH = el.offsetHeight;
    var api = { el: el, svg: svg, rebuild: build,
      show: function () { shown = true; if (p) draw(p, opt); },
      hide: function () { shown = false; if (p) erase(p, opt); } };
    // Re-fit when the element's box changes (reflow, font swap, viewport resize); a mark already on stays on.
    if (window.ResizeObserver) new ResizeObserver(function () {
      if (el.offsetWidth === lastW && el.offsetHeight === lastH) return;
      lastW = el.offsetWidth; lastH = el.offsetHeight; build();
      if (shown && p) p.style.strokeDashoffset = 0;
    }).observe(el);
    if (!opt.manual) {
      el.addEventListener('pointerenter', api.show); el.addEventListener('pointerleave', api.hide);
      el.addEventListener('focus', api.show); el.addEventListener('blur', api.hide);
    }
    if (opt.on) { requestAnimationFrame(function () { api.show(); }); }
    return api;
  }

  window.Pen = { rng: rng, hash: hash, smooth: smooth, loop: loop, underline: underline, scribble: scribble, bracket: bracket, tick: tick, strike: strike, arrow: arrow, path: path, draw: draw, erase: erase, annotate: annotate, reduced: reduced, hiddenAt: hiddenAt, dashes: dashes };
})();
