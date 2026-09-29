/* r3-07 · the kraft sleeve, copied from r2-07-about-sleeve.js and re-proportioned with the card: it is now a
   tall, slim envelope (≈1:1.5, r2's was 1:1.05) with a 7px seam allowance each side instead of 15px.
   Drawn, not rendered: ink edge, flat kraft, countable fibres, a dashed glue seam on the three closed sides, a
   thumb notch at the mouth. Two panels so the card can sit between them: the back (darker, a 4px lip past the
   mouth, seen only through the notch or when the sleeve is empty) and the front (a compact printed header —
   title and the forms checklist on one line, so it stays visible above the card in your hand — the bird on
   its corner, and the small DO NOT BEND print moved down by the mouth, where the long sleeve needs an anchor).
   The front's mouth edge is live: it sags toward the pull when the card's top edge catches on it. */
(function () {
  var NS = 'http://www.w3.org/2000/svg', INK = '#33302B', KRAFT = '#D5BB8F', KRAFT_BACK = '#C4A677';
  function f(n) { return Math.round(n * 10) / 10; }

  window.Sleeve = function (rig) {
    var back = rig.querySelector('.sl-back'), front = rig.querySelector('.sl-front'),
      bsvg = back.querySelector('svg'), fsvg = front.querySelector('.sl-kraft'), imp = front.querySelector('.sl-impact'),
      print = front.querySelector('.sl-print'), warn = front.querySelector('.sl-warn'), forms = front.querySelector('.sl-forms'), bird = front.querySelector('.bird'),
      boxes = [].slice.call(front.querySelectorAll('.sl-box'));
    var G = null, panel = null, lastBow = null, birdT = 0, impT = [];

    /* ---- checklist ticks (board 02 grammar: tick = observed) ---- */
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

    /* ---- the mouth: a parabola sagging b px toward the pull, cut by the thumb notch ---- */
    // Exact quadratic segments: for a parabola, the tangents at both ends meet above the segment's midpoint.
    function lip(w, h, nr, b) {
      var hw = w / 2;
      function y(x) { var u = (x - hw) / hw; return h + b * (1 - u * u); }
      function seg(x1, x2) {
        var u1 = (x1 - hw) / hw, slope = -2 * b * u1 / hw, xc = (x1 + x2) / 2;
        return ' Q' + f(xc) + ' ' + f(y(x1) + slope * (xc - x1)) + ' ' + f(x2) + ' ' + f(y(x2));
      }
      return seg(w, hw + nr) + ' A' + nr + ' ' + nr + ' 0 0 0 ' + f(hw - nr) + ' ' + f(y(hw - nr)) + seg(hw - nr, 0);
    }
    function panelPath(w, h, nr, b) {
      var r = 7;
      return 'M' + r + ' 0H' + (w - r) + 'Q' + w + ' 0 ' + w + ' ' + r + 'V' + h + lip(w, h, nr, b) + 'V' + r + 'Q0 0 ' + r + ' 0Z';
    }
    function size(svg, w, h) { svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); }

    function layout(g) {
      G = g;
      var w = g.ws, h = g.hs, nr = g.nr, r = 7;
      [back, front].forEach(function (el) {
        el.style.width = w + 'px'; el.style.height = h + 'px';
        el.style.left = f(g.rw / 2 - w / 2) + 'px'; el.style.top = g.T + 'px';
        el.style.transformOrigin = f(w / 2) + 'px ' + f(h / 2) + 'px';
      });
      size(bsvg, w, h + 6); size(fsvg, w, h + 12); size(imp, w, h);
      bsvg.innerHTML = '<path d="M' + r + ' 0H' + (w - r) + 'Q' + w + ' 0 ' + w + ' ' + r + 'V' + (h + 4) + 'H0V' + r + 'Q0 0 ' + r + ' 0Z" fill="' + KRAFT_BACK +
        '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>';
      // Fibres: short countable strokes, seeded so the sleeve is the same sleeve on every visit. None inside the notch.
      var rnd = Pen.rng('r2-kraft'), fib = '', n = Math.round(w * h / 1500);
      for (var i = 0; i < n; i++) {
        var x = 8 + rnd() * (w - 16), yy = 8 + rnd() * (h - 16), a = rnd() * Math.PI, l = 2.5 + rnd() * 4.5;
        if (Math.hypot(x - w / 2, yy - h) < nr + 8) continue;
        fib += 'M' + f(x) + ' ' + f(yy) + 'l' + f(Math.cos(a) * l) + ' ' + f(Math.sin(a) * l);
      }
      var seam = 'M9 ' + (h - 6) + 'V9H' + (w - 9) + 'V' + (h - 6);
      fsvg.innerHTML = '<path class="sl-panel" fill="' + KRAFT + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="' + fib + '" stroke="#9E8158" stroke-width="1" stroke-linecap="round" opacity=".5" fill="none"/>' +
        '<path d="' + seam + '" fill="none" stroke="#8F7550" stroke-width="1.1" stroke-dasharray="5 5" opacity=".75"/>';
      panel = fsvg.querySelector('.sl-panel'); lastBow = null; bow(0);
      var fs = f(Math.max(7.6, Math.min(10.6, w / 21.5)));
      print.style.fontSize = fs + 'px'; warn.style.fontSize = fs + 'px';
    }
    // How much of the sleeve must stay uncovered above the card in the hand: the printed header down to the checklist.
    function header() { return Math.ceil(forms.offsetTop + forms.offsetHeight + 8); }

    function bow(b) {
      if (!G) return;
      b = Math.round(b * 4) / 4;
      if (b === lastBow) return;
      lastBow = b; panel.setAttribute('d', panelPath(G.ws, G.hs, G.nr, b));
    }
    function pose(d, a) {
      var t = 'translateY(' + d.toFixed(2) + 'px) rotate(' + a.toFixed(3) + 'deg)';
      back.style.transform = t; front.style.transform = t;
    }

    /* ---- the register break: two held frames of impact ticks at the lip corners (hand's clock, no easing) ---- */
    function impact() {
      if (Pen.reduced() || !G) return;
      var w = G.ws, h = G.hs, fr = [[6, 15], [13, 20]];
      function frame(i) {
        var d = '';
        [[0, h, [196, 148, 108]], [w, h, [-16, 32, 72]]].forEach(function (c) {
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

    // The bird on the corner holds a pose; when the sleeve jolts under it, it straightens up for a beat.
    function startle(ms) {
      if (Pen.reduced()) return;
      bird.classList.add('up'); clearTimeout(birdT);
      birdT = setTimeout(function () { bird.classList.remove('up'); }, ms || 700);
    }

    return { layout: layout, header: header, bow: bow, pose: pose, impact: impact, startle: startle, tick: tick, clearTicks: clearTicks, front: front, back: back };
  };
})();
