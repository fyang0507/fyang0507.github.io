/* r3-02-spec.js — the pointer's anatomy: the glyph at 3× with its dimensions, the eight approaches in
   the order they are tried, six seeds of the same rules, and the arrow's key poses. Every drawing is
   the real ArrowFit glyph / PointMark, frozen — nothing here is a picture of the rules. */
(function () {
  var A = R2Anim;
  function f1(n) { return Math.round(n * 10) / 10; }
  function el(tag, attrs, parent, text) { var n = A.node(tag, attrs); if (text != null) n.textContent = text; if (parent) parent.appendChild(n); return n; }
  function P(p) { return f1(p[0]) + ' ' + f1(p[1]); }
  function svgIn(box) { box.innerHTML = ''; var s = el('svg', { 'aria-hidden': 'true', width: box.clientWidth, height: box.clientHeight }, box); s.style.overflow = 'visible'; return s; }
  function glyphG(parent, g, cls, tf) {
    var G = el('g', { transform: tf || '' }, parent);
    el('path', { d: g.shaft, 'class': cls }, G); el('path', { d: g.head, 'class': cls }, G);
    return G;
  }

  /* ---- the glyph at 3× ---- */
  function anatomy(box) {
    var s = svgIn(box), W = box.clientWidth, H = box.clientHeight, k = W >= 400 ? 3 : 2.3;
    var g = ArrowFit.glyph([0, 0], 4, 34, 'anatomy|glyph'), gap = 5.2, ox = Math.round(30 + 34 * k), oy = Math.round(H * .5);
    function X(p) { return [ox + p[0] * k, oy + p[1] * k]; }
    // the target's box: the tip aims at 55% of its height, as tipFor() does
    var bh = 28 * k, bx = ox + gap * k, by = oy - bh * .55;
    el('rect', { x: f1(bx), y: f1(by), width: W, height: f1(bh), 'class': 'an-box' }, s);
    el('text', { x: f1(bx + 6 * k), y: f1(by + bh * .62), 'class': 'an-word', style: 'font-size:' + 18 * k + 'px' }, s, 'Load more');
    var t0 = X(g.tail), t1 = X(g.tip);
    el('path', { d: 'M' + P(t0) + ' L' + P(t1), 'class': 'an-chord' }, s);
    glyphG(s, g, 'pt-s', 'translate(' + ox + ' ' + oy + ') scale(' + k + ')');
    var rowA = by - 28, rowB = by - 10;
    // the bow, at its widest (a third of the way in; the last third runs straight) — row A
    var M = X(g.peak), MF = X(g.foot);
    el('path', { d: 'M' + P(MF) + ' L' + P(M) + ' L' + P([M[0], rowA + 5]), 'class': 'an-dim' }, s);
    el('text', { x: f1(M[0] - 14), y: f1(rowA), 'class': 'an-t' }, s, 'bow ' + f1(g.sag) + ' px · ≤ 1.8 · 弧度');
    // the barbs, measured from the line the head lands on — row B
    var b1 = X(g.b1);
    el('path', { d: 'M' + P(b1) + ' L' + P([b1[0], rowB + 5]), 'class': 'an-lead' }, s);
    el('text', { x: f1(b1[0] - 4), y: f1(rowB), 'class': 'an-t' }, s, 'barbs ' + f1(g.barbs[0]) + ' / ' + f1(g.barbs[1]) + ' px · ' + Math.round(g.spread[0]) + '° / ' + Math.round(g.spread[1]) + '°');
    // the gap, low in the box's height; its label sits in the box
    var gy = by + bh - 9;
    el('path', { d: 'M' + P([t1[0], gy]) + ' L' + P([bx, gy]) + ' M' + P([t1[0], gy - 4]) + ' L' + P([t1[0], gy + 4]), 'class': 'an-dim' }, s);
    el('text', { x: f1(bx + 5), y: f1(by + bh - 5), 'class': 'an-t' }, s, gap + ' px short · 留白');
    // the shaft's length, parallel under the chord, well below the box
    var dy = bh * .45 + 14, y0 = t0[1] + dy, y1 = t1[1] + dy, mx = (t0[0] + t1[0]) / 2, my = (y0 + y1) / 2;
    el('path', { d: 'M' + P([t0[0], y0]) + ' L' + P([t1[0], y1]) + ' M' + P([t0[0], y0 - 5]) + ' L' + P([t0[0], y0 + 5]) + ' M' + P([t1[0], y1 - 5]) + ' L' + P([t1[0], y1 + 5]), 'class': 'an-dim' }, s);
    el('text', { x: f1(mx), y: f1(my + 17), 'class': 'an-t', 'text-anchor': 'middle' }, s, 'shaft ' + g.L + ' px');
    el('text', { x: f1(mx), y: f1(my + 31), 'class': 'an-t', 'text-anchor': 'middle' }, s, '26–40 · 杆长');
  }

  /* ---- the eight approaches ---- */
  function rose(box) {
    var s = svgIn(box), W = box.clientWidth, H = box.clientHeight, k = W >= 330 ? 1.5 : 1.25;
    var G = el('g', {}, s), t = el('text', { x: 0, y: 0, 'class': 'an-lab' }, G, 'Load more · 再晾一批');
    var bb = t.getBBox(), bw = bb.width + 8, bh = 24;
    G.setAttribute('transform', 'translate(' + f1(W / 2 - bw * k / 2) + ' ' + f1(H / 2 - bh * k / 2) + ') scale(' + k + ')');
    t.setAttribute('x', 4); t.setAttribute('y', 17);
    var line = { x: 0, y: 0, w: bw, h: bh };
    el('rect', { x: 0, y: 0, width: f1(bw), height: bh, 'class': 'an-box' }, G);
    ArrowFit.ORDER.forEach(function (key, i) {
      var ap = ArrowFit.APPROACH[key], tip = ArrowFit.tipFor(key, line, .5, ap.deg, 5), g = ArrowFit.glyph(tip, ap.deg, 30, 'rose|' + key);
      glyphG(G, g, i ? 'an-ghost' : 'an-first');
      var nx = g.tail[0] - g.ux * 8, ny = g.tail[1] - g.uy * 8 + 3.5;
      el('text', { x: f1(nx), y: f1(ny), 'class': 'an-n' + (i ? '' : ' first'), 'text-anchor': 'middle' }, G, String(i + 1));
    });
  }

  /* ---- six targets, six seeds ---- */
  var SEEDS = ['Load more', 'poem · 诗', 'Fred Agent', 'all hung', 'subscribe', 'next · 下一篇'];
  function seeds(box) {
    var s = svgIn(box), W = box.clientWidth, H = box.clientHeight, cols = 2, rows = 3, k = W >= 300 ? 1.3 : 1.15, cw = W / cols, ch = H / rows;
    SEEDS.forEach(function (label, i) {
      var G = el('g', { transform: 'translate(' + f1((i % cols) * cw + 8) + ' ' + f1(Math.floor(i / cols) * ch + 6) + ') scale(' + k + ')' }, s);
      var t = el('text', { x: 34, y: 20, 'class': 'an-lab' }, G, label), bb = t.getBBox();
      var line = { x: bb.x, y: bb.y - 2, w: bb.width, h: bb.height + 4 };
      var fit = ArrowFit.solve({ target: line, bounds: { x: -400, y: -400, w: 2000, h: 2000 }, obstacles: [], seed: label + '|seed' });
      if (!fit) return;
      glyphG(G, fit.g, 'pt-s');
      el('text', { x: 0, y: 44, 'class': 'an-s' }, G, fit.g.L.toFixed(0) + ' px · bow ' + f1(fit.g.sag) + ' ' + (fit.g.peak[1] < fit.g.foot[1] ? 'up' : 'down'));
    });
  }

  /* ---- the arrow, frame by frame ---- */
  var POSES = [
    ['the note, written', '旁注', { n: .5 }, function (d) { return '0 → 420 ms'; }],
    ['the shaft, one pass', '一笔箭杆', { n: 1, sE: .55 }, function (d) { return '480 + ' + Math.round(d * .55) + ' ms'; }],
    ['the head', '箭头', { n: 1, sE: 1, hE: .6 }, function (d) { return Math.round(480 + d * .84 + 80) + ' ms'; }],
    ['one settle, 2 px in', '轻压', { n: 1, sE: 1, hE: 1, st: 1 }, function (d) { return Math.round(480 + d * .84 + 130 + 70) + ' ms · one frame'; }],
    ['at rest, 1 px in', '静止', { n: 1, sE: 1, hE: 1, st: 2 }, function (d) { return Math.round(480 + d * .84 + 130 + 130) + ' ms → still'; }],
    ['used: it lifts', '用过即收', { n: .3, sS: .7, sE: 1, hS: .1, hE: 1, st: 2 }, function () { return 'press + 120 ms · gone this session'; }]
  ];
  var poseHost = document.querySelector('[data-poses]'), poses = [];
  if (poseHost) POSES.forEach(function (p, i) {
    var fr = document.createElement('div'); fr.className = 'pf';
    fr.innerHTML = '<div class="pf-s"><span class="sx-k" style="right:14px;top:30px">system · 2026—now</span><span class="sx-h" style="right:14px;top:48px">Fred Agent</span></div>' +
      '<div class="pf-t util"><span class="pf-n">' + String(i + 1).padStart(2, '0') + '</span><b>' + p[0] + ' · ' + p[1] + '</b><span data-ms></span></div>';
    poseHost.appendChild(fr);
    var sc = fr.querySelector('.pf-s'), m = new PointMark(sc, sc.querySelector('.sx-h'), { seed: 'fred agent|poses', note: '<span class="en">start here</span><span class="zh">从这里开始</span>',
      bounds: function () { return { x: 4, y: 4, w: sc.clientWidth - 8, h: sc.clientHeight - 8 }; } });
    poses.push({ m: m, v: p[2], ms: fr.querySelector('[data-ms]'), t: p[3] });
  });
  function drawPoses() {
    poses.forEach(function (q) {
      q.m.refit(); q.m.a.stop();
      var v = q.m.a.v; v.sS = v.sE = v.hS = v.hE = v.n = v.st = 0;
      for (var key in q.v) v[key] = q.v[key];
      q.m.render(); q.ms.textContent = q.m.fit ? q.t(A.drawDur(q.m.L)) : '';
    });
  }

  function drawAll() {
    var a = document.querySelector('[data-anatomy]'), r = document.querySelector('[data-rose]'), s = document.querySelector('[data-seeds]');
    if (a) anatomy(a); if (r) rose(r); if (s) seeds(s);
    drawPoses();
  }
  drawAll();
  if (document.fonts) document.fonts.ready.then(drawAll);
  var rw = innerWidth;
  window.addEventListener('resize', function () { if (innerWidth !== rw) { rw = innerWidth; requestAnimationFrame(drawAll); } });
  window.R3Spec = { redraw: drawAll, poses: poses };
})();
