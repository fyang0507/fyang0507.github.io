/* lib/about/card.js — what the specimen card and the page around it do, apart from the hand
   (design/2026-09-motion/r4-07-about-kit.js). The copy, images, radar labels and contacts are markup in
   About.dc.html; this module only draws and wires them:
   · radar(svg): the night face's radar, every mark a pen stroke. Its rings, spokes and polygon are drawn
     once when the card first shows its night face in your hand — the witness taking notes — then kept.
   · controls(root): the pen's states on FLIP / PULL / PUT BACK (coral line on hover, 「 」 on focus).
   · contacts(root): the same marks on the five contacts, and the WeChat QR slip (aria-expanded/-controls).
   Needs motion.js, pen.js and pen-tier.js. */

/* ---------- the radar: same geometry as the old page's (six axes, grades A B B A E C) ---------- */
var CX = 260, CY = 240, AX = [-90, -30, 30, 90, 150, 210], GRADE = [5, 4, 4, 5, 1, 3];
function f(n) { return Math.round(n * 10) / 10; }
function pt(deg, r) { var a = deg * Math.PI / 180; return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]; }
// A hand-drawn ring: starts upper-left, a little more than one lap, slow wobble. Seeded by radius only,
// so every copy of the card gets the same circles — one person drew them once.
function ring(r) {
  var rnd = Pen.rng('radar-ring-' + r), a0 = -2.5 + rnd() * .7, laps = 1.05 + rnd() * .04, ph = rnd() * 6, n = Math.max(16, Math.round(r / 4)), pts = [];
  for (var i = 0; i <= n; i++) {
    var t = i / n, a = a0 + t * laps * Math.PI * 2, rr = r * (1 + Math.sin(t * 4.3 + ph) * .012) + (t - .5) * 1.4;
    pts.push([CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]);
  }
  return Pen.smooth(pts);
}
function spoke(deg, i) {
  var rnd = Pen.rng('radar-spoke-' + i), e = pt(deg, 121), m = pt(deg + (rnd() - .5) * 1.4, 62);
  return 'M' + CX + ' ' + CY + ' Q' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(e[0]) + ' ' + f(e[1]);
}
function dataPts() { return AX.map(function (d, i) { return pt(d, GRADE[i] * 24); }); }
// The polygon keeps sharp corners (it is data), but each edge bows a hair and the pen runs past the start.
function polyPath() {
  var p = dataPts(), rnd = Pen.rng('radar-poly'), d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
  for (var i = 1; i <= 6; i++) {
    var a = p[i - 1], b = p[i % 6], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, bow = (rnd() - .5) * 3.2;
    d += ' Q' + f(mx - dy / L * bow) + ' ' + f(my + dx / L * bow) + ' ' + f(b[0]) + ' ' + f(b[1]);
  }
  var o = [p[0][0] + (p[1][0] - p[0][0]) * .12, p[0][1] + (p[1][1] - p[0][1]) * .12];
  return d + ' L' + f(o[0]) + ' ' + f(o[1]);
}

// Fills the markup's empty marks, then: rings (inner → outer) and spokes in single passes, the polygon in one
// pass, then the six grades stamped on held beats — hand's clock, ~8 fps, no easing on the dots.
export function radar(svg) {
  var rings = [].slice.call(svg.querySelectorAll('.rd-ring')), spokes = [].slice.call(svg.querySelectorAll('.rd-spoke')),
    poly = svg.querySelector('.rd-poly'), fill = svg.querySelector('.rd-fill'), dots = [].slice.call(svg.querySelectorAll('.rd-pts circle')),
    p = dataPts(), timers = [], state = 'empty';
  rings.forEach(function (el, i) { el.setAttribute('d', ring(24 * (i + 1))); });
  spokes.forEach(function (el, i) { el.setAttribute('d', spoke(AX[i], i)); });
  poly.setAttribute('d', polyPath());
  fill.setAttribute('d', 'M' + p.map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join(' L') + ' Z');
  dots.forEach(function (c, i) { c.setAttribute('cx', f(p[i][0])); c.setAttribute('cy', f(p[i][1])); c.setAttribute('r', 5); });
  var strokes = rings.concat(spokes, [poly]);
  function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function stop() { timers.forEach(clearTimeout); timers = []; strokes.forEach(function (el) { el.getAnimations().forEach(function (a) { a.cancel(); }); }); }
  function set(el, on) { var L = el.getTotalLength(); el.style.strokeDasharray = L + ' ' + (L + 2); el.style.strokeDashoffset = on ? 0 : L; }
  function reset() { stop(); strokes.forEach(function (el) { set(el, false); }); fill.style.opacity = 0; dots.forEach(function (c) { c.style.opacity = 0; }); state = 'empty'; }
  function show() { stop(); strokes.forEach(function (el) { set(el, true); }); fill.style.opacity = 1; dots.forEach(function (c) { c.style.opacity = 1; c.setAttribute('r', 5); }); state = 'drawn'; }
  function draw() {
    if (Motion.reduced()) return show();
    reset(); state = 'drawing';
    rings.forEach(function (el, i) { Pen.draw(el, { delay: i * 95, duration: 190 + i * 45 }); });
    spokes.forEach(function (el, i) { Pen.draw(el, { delay: 470 + i * 45, duration: 130 }); });
    Pen.draw(poly, { delay: 800, duration: 760 });
    var t0 = 1600;
    later(t0, function () { fill.style.opacity = .45; });
    later(t0 + 125, function () { fill.style.opacity = 1; });
    dots.forEach(function (c, i) {
      later(t0 + i * 125, function () { c.setAttribute('r', 8); c.style.opacity = 1; });
      later(t0 + i * 125 + 85, function () { c.setAttribute('r', 5); });
    });
    later(t0 + 6 * 125 + 90, function () { state = 'drawn'; });
  }
  reset();
  return { draw: draw, reset: reset, show: show, get state() { return state; } };
}

/* ---------- controls ---------- */
// FLIP / PULL / PUT BACK: the pen's live attention on each (coral line on hover, 「 」 on keyboard focus).
// PUT BACK is shown only while it has keyboard focus (about.css); FLIP carries aria-pressed for the night face.
export function controls(root) {
  var pull = root.querySelector('.ctl-pull'), flip = root.querySelector('.ctl-flip'), put = root.querySelector('.ctl-put');
  [pull, flip, put].forEach(function (b) { Tier.wire(b, { target: '.flip-t', focus: { on: 'host', gap: 4 } }); });
  return {
    pull: pull, flip: flip, put: put, flipIco: flip.querySelector('.flip-ico'),
    night: function (on) {
      flip.setAttribute('aria-pressed', on ? 'true' : 'false');
      flip.setAttribute('aria-label', on ? '切换到日间形态。Show day form.' : '切换到夜间形态。Show night form.');
    }
  };
}

/* ---------- contacts ---------- */
export function contacts(root) {
  [].forEach.call(root.querySelectorAll('.soc'), function (a) { Tier.wire(a, { target: '.soc-t', focus: { on: 'host', gap: 4 } }); });
  var btn = root.querySelector('.soc-wx .soc'), slip = root.querySelector('.qr-slip');
  if (!btn || !slip) return;
  function open(on) { btn.setAttribute('aria-expanded', on ? 'true' : 'false'); slip.classList.toggle('on', on); }
  btn.addEventListener('click', function (e) { e.stopPropagation(); open(btn.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', function (e) { if (!slip.contains(e.target)) open(false); });
  root.querySelector('.soc-row').addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { open(false); btn.focus(); } });
}
