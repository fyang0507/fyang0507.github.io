/* r4-02-check.js — measures, live, the spacing rule the board states for every notice underline:
   the line hangs max(3 px, 0.18 em) under its baseline, and whatever follows it — the next line of
   text, or a drawn rule such as the nav's — is at least MIN px below the stroke and at least RATIO×
   the line's own drop, so the line always belongs to the word above it. It reads real text boxes
   (Range rects), the same way the arrow's solver does. */
(function () {
  var MIN = 10, RATIO = 2;
  var out = document.querySelector('[data-gapcheck]');
  function rules(root) {
    return [].map.call(root.querySelectorAll('.pn-nav'), function (n) { var r = n.getBoundingClientRect(); return { x: r.left, y: r.bottom - 1.5, w: r.width, h: 1.5 }; });
  }
  function name(m) { return (m.target.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28); }

  // Tilted cards rotate rigidly, so distances inside them are the designed ones; screen boxes of a
  // rotated line are not. Measure with the tilt taken off for the instant of the measurement.
  function untilted(fn) {
    var slots = [].slice.call(document.querySelectorAll('.bd-slot')), keep = slots.map(function (s) { return [s.style.transform, s.style.transition]; });
    slots.forEach(function (s) { s.style.transition = 'none'; s.style.transform = 'none'; });
    try { return fn(); } finally { slots.forEach(function (s, i) { s.style.transform = keep[i][0]; s.style.transition = keep[i][1]; }); }
  }
  // Running prose: a link's next line in the same paragraph is its own leading, not "what follows".
  function sameProse(m, o) { return o.p && o.p === m.target.closest('p'); }
  function textBelow(root, m) {
    var rg = document.createRange(), w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), out = [];
    for (var n = w.nextNode(); n; n = w.nextNode()) {
      var el = n.parentElement;
      if (!n.nodeValue.trim() || !el || m.target.contains(el) || getComputedStyle(el).visibility === 'hidden' || el.closest('[aria-hidden="true"]')) continue;
      rg.selectNodeContents(n); var p = el.closest('p');
      [].forEach.call(rg.getClientRects(), function (c) { if (c.width > .5) out.push({ x: c.left, y: c.top, w: c.width, h: c.height, p: p }); });
    }
    return out;
  }

  function run() { return untilted(measure); }
  function measure() {
    var res = [];
    TierMark.all.forEach(function (m) {
      if (!m.host.isConnected || !m.host.getClientRects().length) return;
      var lr = m.line.getBoundingClientRect(), bottom = lr.bottom + 1.1;     // the stroke's lower edge
      var root = m.host.closest('.stage, .lab-card, .kf, .cmp, .play, .lg') || document.body;
      var below = Infinity;
      textBelow(root, m).concat(rules(root)).forEach(function (o) {
        if (o.x < lr.right - 1 && o.x + o.w > lr.left + 1 && o.y > lr.top && !sameProse(m, o)) below = Math.min(below, o.y - bottom);
      });
      res.push({ m: m, name: name(m), drop: m.drop, below: below, ok: below === Infinity || (below >= MIN && below >= RATIO * m.drop) });
    });
    var finite = res.filter(function (r) { return r.below < Infinity; });
    var tight = finite.slice().sort(function (a, b) { return a.below - b.below; })[0];
    var worstRatio = finite.reduce(function (a, r) { return Math.min(a, r.below / r.drop); }, Infinity);
    var bad = res.filter(function (r) { return !r.ok; });
    if (out) out.innerHTML = 'Measured live on this board at this width: <b>' + res.length + '</b> underlines · <b>' + bad.length + '</b> break the rule' +
      (tight ? ' · tightest: <b>' + tight.below.toFixed(1) + ' px</b> below “' + tight.name + '” (' + (tight.below / tight.drop).toFixed(1) + '× its drop) · every line ≥ ' + worstRatio.toFixed(1) + '× its drop from what follows' : '') +
      (bad.length ? '<br>breaking: ' + bad.map(function (r) { return '“' + r.name + '” ' + r.below.toFixed(1) + ' px'; }).join(', ') : '');
    return { n: res.length, bad: bad.map(function (r) { return [r.name, +r.below.toFixed(1), +r.drop.toFixed(1)]; }), tight: tight && [tight.name, +tight.below.toFixed(1)], ratio: +worstRatio.toFixed(2),
      all: res.map(function (r) { return [r.name, r.below === Infinity ? null : +r.below.toFixed(1), +r.drop.toFixed(1)]; }) };
  }

  function later() { requestAnimationFrame(function () { setTimeout(run, 60); }); }
  if (document.fonts) document.fonts.ready.then(later); else later();
  var rw = innerWidth;
  window.addEventListener('resize', function () { if (innerWidth !== rw) { rw = innerWidth; setTimeout(run, 700); } });
  window.R4Check = { run: run, MIN: MIN, RATIO: RATIO };
})();
