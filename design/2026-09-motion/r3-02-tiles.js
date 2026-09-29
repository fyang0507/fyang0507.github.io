/* r3-02-tiles.js — the specimen sheet: the arrow against placements chosen to break it, plus round 2's
   arrow on the same board for comparison. Each tile is a small view with its own edge; the arrow is
   solved live from the tile's real text, exactly as on a page.

   ArrowAudit re-measures what was actually drawn with the browser's own path geometry (not the
   solver's samples): length, bow, barbs, and whether any ink touches text or leaves the view. */
(function () {
  var A = R2Anim, AP = ArrowFit.APPROACH;
  var LAB = '<span class="en">Load more</span> <span class="sep">·</span> <span class="zh">再晾一批</span>';
  var P1 = 'Twelve more photographs from the same trip, hung in the order they were taken.';
  var P2 = '说起牛来，两三周前出现了一个代号 Ox Alpha 的模型：量大管饱，智能在线。';
  var NOTE = '<span class="en">start here</span><span class="zh">从这里开始</span>';
  function tag(t, n, target) { return '<span class="sx-tag"' + (target ? ' data-target' : '') + '>' + t + (n ? '<sup>' + n + '</sup>' : '') + '</span>'; }
  var CLOUD = [['all · 全部', 27], ['travel log · 游记', 15], ['commentary · 杂文', 3], ['poem · 诗', 2], ['essays · 随笔', 4], ['stories we live · 我们生活的故事', 5, 1], ['letters · 信', 2], ['notes · 札记', 6], ['film · 胶片', 8]];
  var ROWS = [[['all · 全部', 27], ['film · 胶片', 8], ['notes · 札记', 6]], [['essays · 随笔', 4], ['poem · 诗', 2, 1], ['letters · 信', 2]], [['travel · 游记', 15], ['commentary · 杂文', 3]]];
  var BOARD = function (w) {
    return '<div class="sx-board">' +
      '<div class="sx-card sx-lead"' + (w ? ' data-target' : '') + '><span class="sx-kind">system · 2026—now</span><span class="sx-ct"><span data-title>Fred Agent</span></span><span class="sx-cn">An operating environment that gives swappable general-purpose agents durable handles into time.</span></div>' +
      '<i class="sx-pin" data-ob></i>' +
      '<div class="sx-card sx-two" data-ob><span class="sx-kind">instrument · 2026—now</span><span class="sx-ct sm">Audio Processing CLI</span><span class="sx-cn">A local-first utility layer for agents.</span></div>' +
      '<i class="sx-pin sx-pin2" data-ob></i></div>';
  };

  var TILES = [
    { n: 'r2', en: 'round 2 · pen.js arrow()', zh: '第二轮', cls: 'tile-vs tile-r2', h: 250, r2: true, html: BOARD(false) },
    { n: 'r3', en: 'round 3 · the glyph, same board', zh: '第三轮', cls: 'tile-vs', h: 250, note: NOTE, html: BOARD(true) },
    { n: '01', en: 'open space', zh: '空处', html: '<p class="sx-p" style="left:14px;top:14px;right:14px">' + P1 + '</p><span class="sx-lab" data-target style="left:70px;top:106px">' + LAB + '</span>' },
    { n: '02', en: 'flush with the left edge', zh: '贴左边', html: '<p class="sx-p" style="left:0;top:10px;right:10px">' + P1 + '</p><span class="sx-lab" data-target style="left:0;top:104px">' + LAB + '</span>' },
    { n: '03', en: 'a small icon button', zh: '小图标按钮', html: '<span class="sx-k" style="left:14px;top:84px">projects 项目 · scroll →</span><span class="sx-ic" data-ob style="right:62px;top:72px">←</span><span class="sx-ic" data-target style="right:14px;top:72px">→</span>' },
    { n: '04', en: 'a long label that wraps', zh: '会折行的长标签', html: tag('travel log · 游记', 15).replace('<span', '<span style="left:56px;top:16px"') + '<span class="sx-tag sx-wrap" style="left:56px;top:66px;width:150px"><span data-target>stories we live · 我们生活的故事</span></span>' },
    { n: '05', en: 'crowded by other words', zh: '挤在字里', html: '<div class="sx-rows">' + ROWS.map(function (row) { return '<div>' + row.map(function (c) { return tag(c[0], c[1], c[2]); }).join('') + '</div>'; }).join('') + '</div>' },
    { n: '06', en: 'top-right corner', zh: '右上角', html: '<span class="sx-lab" data-target style="right:0;top:0">' + LAB + '</span><p class="sx-p" style="left:14px;bottom:12px;width:82%">' + P1 + '</p>' },
    { n: '07', en: 'top-left corner, icon', zh: '左上角图标', html: '<span class="sx-ic" data-target style="left:0;top:0">←</span><span class="sx-k" style="left:50px;top:12px">projects 项目 · scroll →</span><p class="sx-p" style="left:14px;bottom:12px;width:60%">' + P1 + '</p>' },
    { n: '08', en: 'on the bottom edge', zh: '贴底边', html: '<p class="sx-p" style="left:14px;top:14px;right:14px">' + P1 + '</p><span class="sx-lab sx-mid" data-target style="bottom:0">' + LAB + '</span>' },
    { n: '09', en: 'a heading that needs a note', zh: '标题加旁注', note: NOTE, html: '<span class="sx-k" style="right:14px;top:52px">system · 2026—now</span><span class="sx-h" data-target style="right:14px;top:72px">Fred Agent</span><p class="sx-p" style="right:14px;top:112px;width:52%">An operating environment for agents.</p>' },
    { n: '10', en: 'no room for the note', zh: '旁注放不下', note: NOTE, html: '<p class="sx-p" style="left:0;right:0;top:4px">' + P1 + '</p><span class="sx-k" style="left:8px;top:70px">lead</span><span class="sx-h" data-target style="left:52px;top:62px">Fred Agent</span><span class="sx-k" style="left:218px;top:70px">2026—now</span><p class="sx-p" style="left:0;right:0;top:106px">' + P1 + '</p>' },
    { n: '11', en: 'no clean path anywhere', zh: '无处下笔', html: '<p class="sx-p sx-dense" style="left:10px;right:10px;top:10px">' + P2 + '<span class="sx-in" data-target>Load more · 再晾一批</span>' + P2 + P2 + '</p>' },
    { n: '12', en: 'at 390 px', zh: '手机宽度', cls: 'tile-phone', h: 330, phone: true,
      html: '<div class="sx-phone"><span class="sx-k" style="left:16px;top:18px">filter · 筛选</span><div class="sx-cloud sx-pc">' + CLOUD.slice(0, 4).map(function (c, i) { return tag(i === 2 ? 'stories we live · 我们生活的故事' : c[0], c[1]); }).join('') + '</div><span class="sx-lab" data-target style="left:16px;top:226px">' + LAB + '</span><span class="sx-k" style="left:16px;top:258px">12 remaining · 还剩 12 张</span></div>' }
  ];

  /* ---- audit: measure the ink that was drawn ---- */
  var scratch = null;
  function pathOf(d) {
    if (!scratch) { scratch = A.node('svg', { width: 0, height: 0, 'aria-hidden': 'true' }); scratch.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; document.body.appendChild(scratch); }
    var p = A.node('path', { d: d }); scratch.appendChild(p); return p;
  }
  function near(q, R, r) { var dx = Math.max(R.x - q.x, 0, q.x - R.x - R.w), dy = Math.max(R.y - q.y, 0, q.y - R.y - R.h); return dx * dx + dy * dy < r * r; }
  function audit(dShaft, dHead, obs, B) {
    var p = pathOf(dShaft), L = p.getTotalLength(), s0 = p.getPointAtLength(0), s1 = p.getPointAtLength(L);
    var cx = s1.x - s0.x, cy = s1.y - s0.y, cl = Math.hypot(cx, cy) || 1, bow = 0, cross = 0, off = 0, q, d;
    function test(q) {
      if (q.x < B.x || q.y < B.y || q.x > B.x + B.w || q.y > B.y + B.h) off++;
      for (var j = 0; j < obs.length; j++) if (near(q, obs[j], 1.2)) { cross++; break; }
    }
    for (d = 0; d <= L; d += 1) { q = p.getPointAtLength(d); bow = Math.max(bow, Math.abs((q.x - s0.x) * cy - (q.y - s0.y) * cx) / cl); test(q); }
    var h = pathOf(dHead), Lh = h.getTotalLength();
    for (d = 0; d <= Lh; d += 1) test(h.getPointAtLength(d));
    var n = dHead.match(/-?[\d.]+/g).map(Number), tip = [n[2], n[3]], ang = Math.atan2(cy, cx), barbs = [], spread = [];
    [[n[0], n[1]], [n[4], n[5]]].forEach(function (b) {
      barbs.push(Math.hypot(tip[0] - b[0], tip[1] - b[1]));
      var a = Math.atan2(tip[1] - b[1], tip[0] - b[0]) - ang; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
      spread.push(Math.abs(a) * 180 / Math.PI);
    });
    p.remove(); h.remove();
    return { L: L, chord: cl, bow: bow, cross: cross, off: off, barbs: barbs, spread: spread };
  }
  window.ArrowAudit = audit;

  /* ---- tiles ---- */
  var host = document.querySelector('[data-tiles]'), tiles = [];
  function frameBox(el, ins) { var b = ArrowFit.rel(el.getBoundingClientRect(), el.getBoundingClientRect()); return { x: ins, y: ins, w: b.w - 2 * ins, h: b.h - 2 * ins }; }
  function r(n) { return Math.round(n * 10) / 10; }

  function build(t) {
    var el = document.createElement('figure');
    el.className = 'tile' + (t.cls ? ' ' + t.cls : '');
    el.innerHTML = '<div class="tile-f" style="--th:' + (t.h || 172) + 'px">' + t.html + '</div>' +
      '<figcaption class="tile-c"><span class="tile-n util">' + t.n + '</span><span class="tile-t"><b>' + t.en + '</b> <span class="zh">' + t.zh + '</span></span><span class="tile-r util" data-r></span></figcaption>';
    host.appendChild(el);
    t.el = el; t.f = el.querySelector('.tile-f'); t.box = el.querySelector('.sx-phone') || t.f; t.out = el.querySelector('[data-r]');
    if (t.r2) return r2Arrow(t);
    var target = el.querySelector('[data-target]');
    t.m = new PointMark(t.box, target, { seed: target.textContent.trim() + '|' + t.n, note: t.note, bounds: function () { return frameBox(t.box, 6); } });
  }

  // Round 2, reproduced: pen.js arrow() from a note parked at the next card to 12 px right of the title.
  function r2Arrow(t) {
    t.svg = A.node('svg', { 'class': 'pt', width: 1, height: 1, 'aria-hidden': 'true' });
    t.svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:7';
    t.shaft = A.node('path', { 'class': 'pt-s' }); t.head = A.node('path', { 'class': 'pt-s' });
    t.svg.appendChild(t.shaft); t.svg.appendChild(t.head); t.f.appendChild(t.svg);
    t.note = document.createElement('span'); t.note.className = 'pt-note row r2-note';
    t.note.innerHTML = '<span class="en">start here</span><span class="zh">从这开始</span>'; t.f.appendChild(t.note);
    t.place = function () {
      var F = t.f.getBoundingClientRect(), tb = ArrowFit.rel(t.f.querySelector('[data-title]').getBoundingClientRect(), F);
      var two = ArrowFit.rel(t.f.querySelector('.sx-two').getBoundingClientRect(), F), g, s = t.note.style;
      if (t.f.clientWidth >= 480) {          // r2-02-cards.js geo(), wide branch
        var nx = two.x + 4, ny = two.y - 78;
        g = { a: [nx - 8, ny + 10], b: [tb.x + tb.w + 12, tb.y + tb.h * .42], bend: .3, head: 10 };
        s.left = nx + 'px'; s.top = ny + 'px'; s.transform = 'translate(0,-50%) rotate(-4deg)';
      } else {                                // narrow branch
        var cx = tb.x + tb.w + 40, cy = tb.y - 58;
        g = { a: [cx - 6, cy + 22], b: [tb.x + tb.w + 8, tb.y + tb.h * .3], bend: .34, head: 9 };
        s.left = cx + 'px'; s.top = cy + 'px'; s.transform = 'translate(-50%,-50%) rotate(-4deg)';
      }
      var ar = Pen.arrow(g.a, g.b, 'fred agent|point', { bend: g.bend, head: g.head });
      t.shaft.setAttribute('d', ar.shaft); t.head.setAttribute('d', ar.head);
      var au = audit(ar.shaft, ar.head, ArrowFit.collect(t.f, t.f, [t.note]), frameBox(t.f, 0)), full = fullBoard();
      t.out.textContent = 'here ' + r(au.L) + ' px, bow ' + r(au.bow) + ' px' + (full ? ' · on the full corkboard above ' + r(full.L) + ' px, bow ' + r(full.bow) + ' px' : '') + ' — the layout decides';
    };
    t.show = function (instant) {
      t.note.style.visibility = 'visible';
      [t.shaft, t.head].forEach(function (p, i) { var L = p.getTotalLength(); if (instant || Pen.reduced()) A.dash(p, L, 0, 1); else Pen.draw(p, { delay: i ? 560 : 0 }); });
    };
    t.place();
  }

  function fullBoard() {
    var stage = document.querySelector('[data-slice="build"]'), track = stage && stage.querySelector('[data-track]'), lead = track && track.querySelector('.bd-card--lead .pen-t');
    if (!lead) return null;
    var g = BuildSlice.geo(stage, track)(A.box(track, lead)), ar = Pen.arrow(g.a, g.b, 'fred agent|point', { bend: g.bend, head: g.head });
    return audit(ar.shaft, ar.head, [], { x: -1e4, y: -1e4, w: 2e4, h: 2e4 });
  }

  function report(t) {
    if (t.r2) return t.place();
    var f = t.m.fit;
    if (!f) { t.out.textContent = 'no clean path → no arrow · 不画'; t.el.classList.add('is-none'); return; }
    t.el.classList.remove('is-none');
    var au = audit(f.g.shaft, f.g.head, ArrowFit.collect(t.box, t.box, [t.m.target, t.m.note, t.m.svg]), frameBox(t.box, 0));
    t.out.textContent = AP[f.k].en + ' · ' + AP[f.k].zh + ' · ' + r(au.L) + ' px · bow ' + r(au.bow) + (f.dropped ? ' · note dropped' : '') +
      (au.cross || au.off ? ' · TOUCHES TEXT' : ' · clear of text');
  }

  TILES.forEach(build);
  function refit() { tiles.forEach(function (t) { if (t.m) t.m.refit(); report(t); }); }
  tiles = TILES;
  refit();

  // Each tile's arrow is drawn when that tile comes into view; tiles arriving together go in turn,
  // the way a hand works down a sheet.
  var queue = 0, qT = 0;
  function hideR2(t) { t.note.style.visibility = 'hidden'; [t.shaft, t.head].forEach(function (p) { p.style.visibility = 'hidden'; }); }
  function drawTile(t, delay) {
    if (t.m) { t.m.reset(); t.m.build(); } else hideR2(t);
    clearTimeout(t.timer);
    t.timer = setTimeout(function () { if (t.m) t.m.show(); else { t.shaft.style.visibility = t.head.style.visibility = ''; t.show(); } }, (Pen.reduced() ? 0 : delay) / A.speed);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = tiles.filter(function (x) { return x.el === e.target; })[0];
      io.unobserve(e.target); drawTile(t, 160 + 140 * queue++);
      clearTimeout(qT); qT = setTimeout(function () { queue = 0; }, 300);
    });
  }, { threshold: .6 });
  tiles.forEach(function (t) { if (t.m) t.m.reset(); else hideR2(t); io.observe(t.el); });
  window.replayTiles = function () { tiles.forEach(function (t, i) { drawTile(t, 160 + i * 110); }); };

  var rw = innerWidth;
  window.addEventListener('resize', function () { if (innerWidth !== rw) { rw = innerWidth; requestAnimationFrame(refit); } });
  if (document.fonts) document.fonts.ready.then(refit);
  document.addEventListener('mock:rm', function () { tiles.forEach(function (t) { if (t.m && t.m.shown) t.m.show(true); }); });

  window.R3Tiles = { tiles: tiles, refit: refit, audit: audit };
})();
