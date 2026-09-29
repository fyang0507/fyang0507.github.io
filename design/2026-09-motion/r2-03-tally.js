/* r2-03-tally.js — per-year counts written the way people in China count votes on a blackboard:
   one stroke per item, five strokes make 正 (一 丨 一 丨 一, in stroke order). It reads as a tally
   to anyone (three strokes = three essays) and as 正-counting to a Chinese reader, and it is the
   aesthetic's "tone is countable marks" taken literally: a person putting marks down one at a time.
   When the tag changes the ruler recounts on the hand's clock — surplus strokes lift off, missing
   ones are written stroke by stroke, left to right across the years. Wobble is seeded per stroke. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  // 正 in stroke order, in a unit box: [x1, y1, x2, y2].
  var STROKES = [[.1, .08, .9, .08], [.5, .08, .5, .94], [.5, .5, .86, .5], [.17, .44, .17, .94], [0, .94, 1, .94]];

  // Where each 正 sits: rows of up to `per` characters, centred in the cell, stacked up from the base.
  function layout(n, cellX, cw, base, s) {
    var gap = Math.max(2, s * .3), per = Math.max(1, Math.floor((cw - 6 + gap) / (s + gap))), chars = Math.ceil(n / 5), out = [];
    for (var c = 0; c < chars; c++) {
      var row = Math.floor(c / per), inRow = Math.min(per, chars - row * per), col = c % per;
      var x0 = cellX + cw / 2 - (inRow * (s + gap) - gap) / 2 + col * (s + gap);
      out.push([x0, base - (row + 1) * (s + gap)]);
    }
    return out;
  }
  function rows(n, cw, s) {
    var gap = Math.max(2, s * .3), per = Math.max(1, Math.floor((cw - 6 + gap) / (s + gap)));
    return Math.ceil(Math.ceil(n / 5) / per);
  }
  function strokeD(k, pos, s, seed) {
    var c = pos[Math.floor(k / 5)], st = STROKES[k % 5], r = Pen.rng(seed + ':' + k);
    var x1 = c[0] + st[0] * s + (r() - .5) * .8, y1 = c[1] + st[1] * s + (r() - .5) * .8;
    var x2 = c[0] + st[2] * s + (r() - .5) * .8, y2 = c[1] + st[3] * s + (r() - .5) * .8;
    var bow = (r() - .5) * .9, vert = Math.abs(st[3] - st[1]) > Math.abs(st[2] - st[0]);
    var mx = (x1 + x2) / 2 + (vert ? bow : 0), my = (y1 + y2) / 2 + (vert ? 0 : bow);
    return Pen.smooth([[x1, y1], [mx, my], [x2, y2]]);
  }

  // Bring group g to n strokes. geo: { x, cw, base, s }; o: { animate, delay, seed }.
  function render(g, n, geo, o) {
    o = o || {};
    var have = Array.prototype.slice.call(g.querySelectorAll('path:not(.going)')), pos = layout(n, geo.x, geo.cw, geo.base, geo.s);
    var anim = o.animate && !Pen.reduced(), step = Math.min(60, 420 / Math.max(1, n - have.length));
    for (var k = 0; k < Math.min(n, have.length); k++) {
      have[k].setAttribute('d', strokeD(k, pos, geo.s, o.seed));
      have[k].getAnimations().forEach(function (a) { a.finish(); });
      have[k].style.strokeDasharray = 'none'; have[k].style.strokeDashoffset = 0;
    }
    for (k = have.length; k < n; k++) {
      var p = document.createElementNS(NS, 'path');
      p.setAttribute('d', strokeD(k, pos, geo.s, o.seed));
      g.appendChild(p);
      if (anim) Pen.draw(p, { delay: (o.delay || 0) + (k - have.length) * step, duration: 90 });
    }
    for (k = have.length - 1; k >= n; k--) {   // the last strokes written are the first to lift off
      var q = have[k];
      if (!anim) { q.remove(); continue; }
      q.classList.add('going');
      var a = unpen(q, { duration: 110 });
      if (a) { a.onfinish = function () { this.remove(); }.bind(q); } else q.remove();
    }
  }

  // shared/pen.js erase() under reduced motion sets the hidden offset inline but leaves an earlier
  // fill:'both' draw animation holding the stroke visible (seen when the board's reduced-motion
  // switch is flipped mid-session). Cancel it first; with motion on, erase() handles it itself.
  function unpen(p, opt) { if (Pen.reduced()) p.getAnimations().forEach(function (a) { a.cancel(); }); return Pen.erase(p, opt); }
  function unmark(api) { var p = api.svg.querySelector('path'); if (p && Pen.reduced()) p.getAnimations().forEach(function (a) { a.cancel(); }); api.hide(); }

  window.Tally = { render: render, rows: rows, unpen: unpen, unmark: unmark };
})();
