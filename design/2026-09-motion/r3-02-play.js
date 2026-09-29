/* r3-02-play.js — "try to break it": drag the target anywhere in a crowded frame and watch the arrow
   re-solve; then an audit drops it at 400 random free spots and re-measures every arrow it drew.
   The kind switch (label / icon / heading + note) is itself wired to the pen's two tiers. */
(function () {
  var A = R2Anim, AP = ArrowFit.APPROACH, audit = window.ArrowAudit;
  var root = document.querySelector('[data-play]'); if (!root) return;
  var frame = root.querySelector('[data-play-frame]'), out = root.querySelector('[data-audit-out]'), pickOut = root.querySelector('[data-play-pick]');
  var NOTE = '<span class="en">start here</span><span class="zh">从这里开始</span>';
  var KIND = {
    label: '<span class="sx-lab"><span class="en">Load more</span> <span class="sep">·</span> <span class="zh">再晾一批</span></span>',
    icon: '<span class="sx-ic">→</span>',
    heading: '<span class="sx-h">Fred Agent</span>'
  };
  frame.innerHTML =
    '<p class="sx-p pl-p">Twelve more photographs from the same trip, hung in the order they were taken.</p>' +
    '<span class="sx-h sm pl-h">Publish CLI</span><span class="sx-k pl-k">instrument · 2026—now</span>' +
    '<span class="sx-ic pl-i1" data-ob>←</span><span class="sx-ic pl-i2" data-ob>→</span><i class="sx-pin pl-pin" data-ob></i>' +
    '<div class="sx-cloud pl-c"><span class="sx-tag">all · 全部<sup>27</sup></span><span class="sx-tag">travel log · 游记<sup>15</sup></span><span class="sx-tag">poem · 诗<sup>2</sup></span><span class="sx-tag">commentary · 杂文<sup>3</sup></span></div>' +
    '<p class="sx-p zh pl-z">说起牛来，两三周前出现了一个代号 Ox Alpha 的模型：量大管饱，智能在线，编程牛逼。</p>' +
    '<span class="sx-k pl-n">12 remaining · 还剩 12 张</span>' +
    '<button type="button" class="play-t" data-play-target aria-label="Drag target — move with the arrow keys · 拖动目标"></button>';
  var btn = frame.querySelector('[data-play-target]'), kind = 'label', m = null, cache = null, pos = { x: 0, y: 0 }, moved = false;

  function bounds() { return { x: 6, y: 6, w: frame.clientWidth - 12, h: frame.clientHeight - 12 }; }
  function obstacles() { return cache || ArrowFit.collect(frame, frame, [btn, m && m.note, m && m.svg]); }
  function place(x, y) {
    pos.x = Math.max(0, Math.min(frame.clientWidth - btn.offsetWidth, x));
    pos.y = Math.max(0, Math.min(frame.clientHeight - btn.offsetHeight, y));
    btn.style.left = Math.round(pos.x) + 'px'; btn.style.top = Math.round(pos.y) + 'px';
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function readout() {
    var f = m.fit;
    pickOut.textContent = f ? 'picked: ' + AP[f.k].en + ' · ' + AP[f.k].zh + ' · ' + r1(f.g.L) + ' px · bow ' + r1(f.g.sag) + ' px' + (f.dropped ? ' · note dropped' : '') + ' · ' + f.tries + (f.tries > 1 ? ' tries' : ' try')
      : 'no clean path here → no arrow · 这里不画';
  }
  function solveNow(animate) {
    m.a.stop(); m.apply(m.solve());
    if (animate) m.show(); else m.show(true);
    readout();
  }
  function setKind(k) {
    kind = k; btn.innerHTML = KIND[k];
    if (m) { m.svg.remove(); if (m.note) m.note.remove(); }
    m = new PointMark(frame, btn.firstElementChild, { seed: 'play|' + k, note: k === 'heading' ? NOTE : null, bounds: bounds, obstacles: obstacles });
    m.shown = true; solveNow(true);
  }

  // Drag: obstacles are measured once per drag; the arrow is re-solved at rest on every move.
  var drag = null;
  btn.addEventListener('pointerdown', function (e) {
    if (e.button > 0) return;
    btn.setPointerCapture(e.pointerId); cache = null; cache = obstacles();
    drag = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }; moved = true; btn.classList.add('is-drag');
  });
  btn.addEventListener('pointermove', function (e) { if (!drag) return; place(e.clientX - drag.dx, e.clientY - drag.dy); solveNow(false); });
  function end() { if (!drag) return; drag = null; cache = null; btn.classList.remove('is-drag'); solveNow(true); }
  btn.addEventListener('pointerup', end); btn.addEventListener('pointercancel', end);
  var keyT = 0;
  btn.addEventListener('keydown', function (e) {
    var d = e.shiftKey ? 40 : 8, k = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
    if (!k) return;
    e.preventDefault(); moved = true; place(pos.x + k[0], pos.y + k[1]); solveNow(false);
    clearTimeout(keyT); keyT = setTimeout(function () { solveNow(true); }, 420);
  });
  var fm = new FocusMark(btn, btn, { gap: 6, gy: 6 });
  btn.addEventListener('focus', function () { fm.build(); fm.set(btn.matches(':focus-visible')); });
  btn.addEventListener('blur', function () { fm.set(false); });

  /* ---- the kind switch: the pen's own two tiers ---- */
  var opts = [].map.call(root.querySelectorAll('.po'), function (b) {
    var o = { b: b, t: new TierMark(b, b, { gap: 2 }), f: new FocusMark(b, b, {}), hov: false };
    o.on = function () { return b.getAttribute('aria-pressed') === 'true'; };
    o.sync = function (how) { var t = o.on() ? 2 : o.hov ? 1 : 0; if (t !== o.t.tier || how === 'instant') o.t.to(t, how || 'hover'); };
    b.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') { o.hov = true; o.sync(); } });
    b.addEventListener('pointerleave', function () { o.hov = false; o.sync(); });
    b.addEventListener('focus', function () { o.f.set(b.matches(':focus-visible')); });
    b.addEventListener('blur', function () { o.f.set(false); });
    b.addEventListener('click', function (e) {
      if (o.on()) return;
      opts.forEach(function (p) { p.b.setAttribute('aria-pressed', p === o ? 'true' : 'false'); p.sync(p === o ? (e.detail === 0 ? 'key' : 'press') : 'hover'); });
      setKind(b.dataset.kind);
    });
    return o;
  });

  /* ---- the audit ---- */
  var run = 0;
  function tally() {
    var W = frame.clientWidth, H = frame.clientHeight, B = bounds(), obs = ArrowFit.collect(frame, frame, [btn, m.note, m.svg]);
    var tb = ArrowFit.rel(m.target.getBoundingClientRect(), frame.getBoundingClientRect()), sizes = m.note ? { row: m.measure('row'), stack: m.measure('stack') } : null;
    var r = Pen.rng('audit|' + kind + '|' + run++), N = 400, drawn = 0, none = 0, dropped = 0, bad = 0, off = 0, noteBad = 0;
    var Lr = [99, 0], bow = 0, barb = [99, 0], spr = [99, 0], by = {};
    for (var i = 0, guard = 0; i < N && guard < 8000; guard++) {
      var t = { x: r() * (W - tb.w), y: r() * (H - tb.h), w: tb.w, h: tb.h };
      if (obs.some(function (o) { return ArrowFit.hit(t, o, 2); })) continue;       // a free spot, not on top of text
      i++;
      var fit = ArrowFit.solve({ target: t, bounds: B, obstacles: obs, note: sizes, seed: 'audit|' + i });
      if (!fit) { none++; continue; }
      drawn++; if (fit.dropped) dropped++;
      by[fit.k] = (by[fit.k] || 0) + 1;
      var au = audit(fit.g.shaft, fit.g.head, obs.concat([t]), B);
      if (au.cross) bad++; if (au.off) off++;
      if (fit.note) { var n = fit.note; if (obs.some(function (o) { return ArrowFit.hit(n, o, 0); }) || ArrowFit.hit(n, t, 0) || n.x < B.x || n.y < B.y || n.x + n.w > B.x + B.w || n.y + n.h > B.y + B.h) noteBad++; }
      Lr = [Math.min(Lr[0], au.chord), Math.max(Lr[1], au.chord)]; bow = Math.max(bow, au.bow);
      barb = [Math.min(barb[0], au.barbs[0], au.barbs[1]), Math.max(barb[1], au.barbs[0], au.barbs[1])];
      spr = [Math.min(spr[0], au.spread[0], au.spread[1]), Math.max(spr[1], au.spread[0], au.spread[1])];
    }
    m.apply(m.fit);
    var from = ArrowFit.ORDER.filter(function (k) { return by[k]; }).map(function (k) { return AP[k].en.replace('from the ', '').replace('from ', '') + ' ' + by[k]; }).join(', ');
    out.innerHTML = '<b>' + i + ' placements (' + kind + ')</b> · ' + drawn + ' arrows · ' + none + ' no clean path → no arrow' + (sizes ? ' · ' + dropped + ' notes dropped' : '') +
      '<br><b>' + bad + '</b> touch text · <b>' + off + '</b> leave the view' + (sizes ? ' · <b>' + noteBad + '</b> notes overlapping' : '') +
      ' · shaft ' + r1(Lr[0]) + '–' + r1(Lr[1]) + ' px · bow ≤ ' + r1(bow) + ' px · barbs ' + r1(barb[0]) + '–' + r1(barb[1]) + ' px at ' + Math.round(spr[0]) + '–' + Math.round(spr[1]) + '°' +
      '<br>from: ' + from;
    return { placements: i, drawn: drawn, none: none, dropped: dropped, cross: bad, off: off, noteBad: noteBad, L: Lr, bow: bow, barbs: barb, spread: spr, by: by };
  }
  root.querySelector('[data-audit]').addEventListener('click', function () { out.textContent = 'measuring…'; requestAnimationFrame(function () { setTimeout(tally, 0); }); });

  // Start on the free spot nearest the frame's middle, whatever the layout.
  function start() {
    btn.innerHTML = KIND[kind];
    var obs = ArrowFit.collect(frame, frame, [btn]), w = btn.offsetWidth, h = btn.offsetHeight, W = frame.clientWidth, H = frame.clientHeight, best = null, bd = Infinity;
    for (var y = 8; y < H - h - 8; y += 6) for (var x = 8; x < W - w - 8; x += 6) {
      var t = { x: x, y: y, w: w, h: h };
      if (obs.some(function (o) { return ArrowFit.hit(t, o, 14); })) continue;
      var d = Math.hypot(x + w / 2 - W * .56, y + h / 2 - H * .36); if (d < bd) { bd = d; best = t; }
    }
    place(best ? best.x : W * .5, best ? best.y : H * .34); setKind(kind);
  }
  function refit() { place(pos.x, pos.y); if (m) solveNow(false); }
  start();
  opts.forEach(function (o) { o.sync('instant'); });
  if (document.fonts) document.fonts.ready.then(function () { opts.forEach(function (o) { o.t.build(); }); if (moved) refit(); else start(); });
  var rw = innerWidth;
  window.addEventListener('resize', function () { if (innerWidth !== rw) { rw = innerWidth; requestAnimationFrame(moved ? refit : start); } });
  window.R3Play = { tally: tally, place: function (x, y) { place(x, y); solveNow(false); }, setKind: setKind, get m() { return m; } };
})();
