/* r3-03-tally.js — 正-counting (r2-03-tally.js), with one addition: a ledger line writes its 正 left to right
   from the margin, like a person keeping a tally in a book, instead of stacking them centred in a ruler cell.
   One stroke per essay, five strokes make 正 (一 丨 一 丨 一, in stroke order). When the tag changes the index
   recounts on the hand's clock: surplus strokes lift off (last written first), missing ones are written one at a
   time. Wobble is seeded per stroke, so the same count is always the same marks. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var STROKES = [[.1, .08, .9, .08], [.5, .08, .5, .94], [.5, .5, .86, .5], [.17, .44, .17, .94], [0, .94, 1, .94]];

  // geo: { x, y, s } and either { line: true } (left to right from x; y = the line's top) or
  // { cw, base } (r2-03: rows centred in a cell of width cw, stacked up from base).
  function layout(n, geo) {
    var s = geo.s, gap = Math.max(2, s * .3), chars = Math.ceil(n / 5), out = [];
    if (geo.line) { for (var c = 0; c < chars; c++) out.push([geo.x + c * (s + gap), geo.y]); return out; }
    var per = Math.max(1, Math.floor((geo.cw - 6 + gap) / (s + gap)));
    for (c = 0; c < chars; c++) {
      var row = Math.floor(c / per), inRow = Math.min(per, chars - row * per), col = c % per;
      out.push([geo.x + geo.cw / 2 - (inRow * (s + gap) - gap) / 2 + col * (s + gap), geo.base - (row + 1) * (s + gap)]);
    }
    return out;
  }
  function strokeD(k, pos, s, seed) {
    var c = pos[Math.floor(k / 5)], st = STROKES[k % 5], r = Pen.rng(seed + ':' + k);
    var x1 = c[0] + st[0] * s + (r() - .5) * .8, y1 = c[1] + st[1] * s + (r() - .5) * .8;
    var x2 = c[0] + st[2] * s + (r() - .5) * .8, y2 = c[1] + st[3] * s + (r() - .5) * .8;
    var bow = (r() - .5) * .9, vert = Math.abs(st[3] - st[1]) > Math.abs(st[2] - st[0]);
    return Pen.smooth([[x1, y1], [(x1 + x2) / 2 + (vert ? bow : 0), (y1 + y2) / 2 + (vert ? 0 : bow)], [x2, y2]]);
  }
  function unpen(p, opt) { if (Pen.reduced()) p.getAnimations().forEach(function (a) { a.cancel(); }); return Pen.erase(p, opt); }

  // Bring group g to n strokes. o: { animate, delay, seed }.
  function render(g, n, geo, o) {
    o = o || {};
    var have = Array.prototype.slice.call(g.querySelectorAll('path:not(.going)')), pos = layout(n, geo);
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
    for (k = have.length - 1; k >= n; k--) {
      var q = have[k];
      if (!anim) { q.remove(); continue; }
      q.classList.add('going');
      var a = unpen(q, { duration: 110 });
      if (a) a.onfinish = function () { this.remove(); }.bind(q); else q.remove();
    }
  }
  window.Tally3 = { render: render, unpen: unpen };
})();
