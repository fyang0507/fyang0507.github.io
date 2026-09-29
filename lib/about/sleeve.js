/* lib/about/sleeve.js — the kraft sleeve (design/2026-09-motion/r6-07-about-sleeve.js, drawing unchanged).
   Upright, mouth on its long right edge. Drawn, not rendered: ink edge, flat kraft, countable fibres, a dashed
   glue seam on the three closed sides, a thumb notch in the middle of the mouth. Two panels so the card can sit
   between them: the back (darker, a 4px lip past the mouth) and the front (printed header, the forms checklist,
   DO NOT BEND, the bird on its top edge). The front's mouth edge is live: it bows toward the pointer as it nears and
   toward the card when the card catches it. pose() takes a vertical offset too, so on a phone the other hand can
   set the sleeve aside at the page's left edge. Needs motion.js and pen.js. */
var NS = 'http://www.w3.org/2000/svg', INK = '#33302B', KRAFT = '#D5BB8F', KRAFT_BACK = '#C4A677';
function f(n) { return Math.round(n * 10) / 10; }

export function Sleeve(rig) {
  var back = rig.querySelector('.sl-back'), front = rig.querySelector('.sl-front'),
    bsvg = back.querySelector('svg'), fsvg = front.querySelector('.sl-kraft'), imp = front.querySelector('.sl-impact'),
    print = front.querySelector('.sl-print'), warn = front.querySelector('.sl-warn'), forms = front.querySelector('.sl-forms'), bird = front.querySelector('.bird'),
    boxes = [].slice.call(front.querySelectorAll('.sl-box'));
  var G = null, panel = null, lastBow = null, birdT = 0, impT = [];

  /* ---- checklist ticks: a printed checkbox, ticked the first time you hold each face ---- */
  var ticked = [false, false];
  var ticks = boxes.map(function (box, i) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', 20); svg.setAttribute('height', 20); svg.setAttribute('aria-hidden', 'true');
    var p = Pen.path(Pen.tick(14, 'r2-sleeve-tick-' + i), { color: INK, width: 1.8 });
    svg.appendChild(p); box.appendChild(svg);
    hideTick(p);
    return p;
  });
  function hideTick(p) { var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L); }
  function tick(i) { if (ticked[i]) return; ticked[i] = true; Pen.draw(ticks[i], { delay: 80, duration: 240 }); }
  function clearTicks() {
    ticked = [false, false];
    ticks.forEach(function (p) { p.getAnimations().forEach(function (a) { a.cancel(); }); hideTick(p); });
  }

  /* ---- the mouth: the right edge, a parabola bowing b px toward the pull, cut by the thumb notch ---- */
  // Exact quadratic segments: for a parabola, the tangents at both ends meet above the segment's midpoint.
  function lip(w, h, nr, b) {
    var hh = h / 2;
    function x(y) { var u = (y - hh) / hh; return w + b * (1 - u * u); }
    function seg(y1, y2) {
      var u1 = (y1 - hh) / hh, slope = -2 * b * u1 / hh, yc = (y1 + y2) / 2;
      return ' Q' + f(x(y1) + slope * (yc - y1)) + ' ' + f(yc) + ' ' + f(x(y2)) + ' ' + f(y2);
    }
    return seg(0, hh - nr) + ' A' + nr + ' ' + nr + ' 0 0 0 ' + f(x(hh + nr)) + ' ' + f(hh + nr) + seg(hh + nr, h);
  }
  // Closed end on the left: its two corners are rounded; the mouth's corners are square.
  function panelPath(w, h, nr, b) {
    var r = 7;
    return 'M' + r + ' 0H' + w + lip(w, h, nr, b) + 'H' + r + 'Q0 ' + h + ' 0 ' + (h - r) + 'V' + r + 'Q0 0 ' + r + ' 0Z';
  }
  function size(svg, w, h) { svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); }

  function layout(g) {
    G = g;
    var w = g.ws, h = g.hs, nr = g.nr, r = 7;
    [back, front].forEach(function (el) {
      el.style.width = w + 'px'; el.style.height = h + 'px';
      el.style.left = f(g.sx) + 'px'; el.style.top = f(g.sy) + 'px';
      el.style.transformOrigin = f(w / 2) + 'px ' + f(h / 2) + 'px';
    });
    size(bsvg, w + 6, h); size(fsvg, w + 12, h); size(imp, w, h);
    bsvg.innerHTML = '<path d="M' + r + ' 0H' + (w + 4) + 'V' + h + 'H' + r + 'Q0 ' + h + ' 0 ' + (h - r) + 'V' + r + 'Q0 0 ' + r + ' 0Z" fill="' + KRAFT_BACK +
      '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
    // Fibres: short countable strokes, seeded so the sleeve is the same sleeve on every visit. None inside the notch.
    var rnd = Pen.rng('r2-kraft'), fib = '', n = Math.round(w * h / 1500);
    for (var i = 0; i < n; i++) {
      var x = 8 + rnd() * (w - 16), yy = 8 + rnd() * (h - 16), a = rnd() * Math.PI, l = 2.5 + rnd() * 4.5;
      if (Math.hypot(x - w, yy - h / 2) < nr + 8) continue;
      fib += 'M' + f(x) + ' ' + f(yy) + 'l' + f(Math.cos(a) * l) + ' ' + f(Math.sin(a) * l);
    }
    var seam = 'M' + (w - 6) + ' 9H9V' + (h - 9) + 'H' + (w - 6);
    fsvg.innerHTML = '<path class="sl-panel" fill="' + KRAFT + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="' + fib + '" stroke="#9E8158" stroke-width="1" stroke-linecap="round" opacity=".5" fill="none"/>' +
      '<path d="' + seam + '" fill="none" stroke="#8F7550" stroke-width="1.1" stroke-dasharray="5 5" opacity=".75"/>';
    panel = fsvg.querySelector('.sl-panel'); lastBow = null; bow(0);
    var fs = f(Math.max(7.2, Math.min(10.6, g.fs)));
    print.style.fontSize = fs + 'px'; warn.style.fontSize = fs + 'px';
    print.style.right = (nr + 14) + 'px';   // the print keeps clear of the notch
  }
  // How much of the sleeve stays uncovered above the card when the card is held in front of it (phone).
  function header() { return Math.ceil(forms.offsetTop + forms.offsetHeight + 8); }

  function bow(b) {
    if (!G) return;
    b = Math.round(b * 4) / 4;
    if (b === lastBow) return;
    lastBow = b; panel.setAttribute('d', panelPath(G.ws, G.hs, G.nr, b));
  }
  function pose(d, a, dy) {
    var t = 'translate(' + d.toFixed(2) + 'px,' + (dy || 0).toFixed(2) + 'px) rotate(' + a.toFixed(3) + 'deg)';
    back.style.transform = t; front.style.transform = t;
  }

  /* ---- the register break: two held frames of impact ticks at the mouth's corners (hand's clock, no easing) ---- */
  function impact() {
    if (Motion.reduced() || !G) return;
    var w = G.ws, h = G.hs, fr = [[6, 15], [13, 20]];
    function frame(i) {
      var d = '';
      [[w, 0, [-106, -58, -18]], [w, h, [18, 58, 106]]].forEach(function (c) {
        c[2].forEach(function (deg) {
          var a = deg * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
          d += 'M' + f(c[0] + co * fr[i][0]) + ' ' + f(c[1] + si * fr[i][0]) + 'L' + f(c[0] + co * fr[i][1]) + ' ' + f(c[1] + si * fr[i][1]);
        });
      });
      imp.innerHTML = '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>';
    }
    impT.forEach(clearTimeout);
    frame(0); imp.style.visibility = 'visible';
    impT = [setTimeout(function () { frame(1); }, 84), setTimeout(function () { imp.style.visibility = 'hidden'; }, 168)];
  }

  // The bird on the top edge holds a pose; when the sleeve jolts under it, it straightens up for a beat.
  function startle(ms) {
    if (Motion.reduced()) return;
    bird.classList.add('up'); clearTimeout(birdT);
    birdT = setTimeout(function () { bird.classList.remove('up'); }, ms || 700);
  }

  return { layout: layout, header: header, bow: bow, pose: pose, impact: impact, startle: startle, tick: tick, clearTicks: clearTicks, front: front, back: back };
}
