/* lib/writing/case.js — the Writing bookcase: posts from content/posts-index.js as paper books under one fixed
   camera (design/2026-09-motion boards r2-04 A, r3-03, r4-03).
     - Books: five paper faces each (spine, page-block top, both boards, fore-edge), flat tones and ink edges,
       no light source. Grazing faces get their far edge re-inked so every edge reads as one pen line.
     - Planks: books fill them in reading order from the top (newest first, after the つづく ghost) and a plank
       is added whenever one is full (board r4-03, rule a). A filter gathers its books at the top of the case,
       planks not in use fade out, and the case shortens once the books have settled. At phone width the
       planks become one swipe strip (r2-04 M).
     - Each plank's lip carries a printed label with the years standing on it now ("2026 — 2022").
     - The eye travels down with the reader, so a lower plank is seen at the same angle as the first.
   An ES module (no globals): app.js imports it. */
var f1 = function (n) { return (+n).toFixed(2); };
function T3(x, y, z) { return 'translate3d(' + f1(x) + 'px,' + f1(y) + 'px,' + f1(z) + 'px)'; }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var ZERO = { x: 0, y: 0, r: 0, o: 1, fx: 0.5 };

/* ---- the posts (same ordering and id arithmetic as the old Writing page, so spines keep their sizes) ---- */
var TAG_ZH = { 'stories we live': '我们生活的故事', 'everyday chronicles': '日常记趣', 'travel log': '游记', 'commentary': '杂文', 'poem': '诗' };
var PRIMARY = Object.keys(TAG_ZH);
function posts(src) {
  return (src || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (p, i) {
    var tags = [];
    (p.tags || []).concat(p.tagsZh || []).forEach(function (t) {
      var n = PRIMARY.find(function (k) { return t === k || t === TAG_ZH[k]; });
      if (n && tags.indexOf(n) < 0) tags.push(n);
    });
    var sm = p.title.match(/Stories We Live\s+(\d+)/i) || p.titleZh.match(/故事\s*0?(\d+)/), id = i + 1, series = sm ? Number(sm[1]) : null;
    return {
      key: p.id, id: id, zh: p.titleZh, en: p.title, date: p.date, year: p.date.slice(0, 4), ym: p.date.slice(0, 7).replace('-', '·'),
      tags: tags, tagZh: tags.map(function (t) { return TAG_ZH[t]; }), series: series, min: p.readingMin,
      cover: p.cover, coverSrcset: p.coverSrcset, href: 'Reading.dc.html?post=' + encodeURIComponent(p.id),
      w: series ? 30 : 22 + (id % 4) * 4, hPct: series ? 96 : 58 + ((id * 29) % 38), tone: series ? 's' : String(id % 4)
    };
  });
}
function tagLine(p) { return p.ym + (p.tags.length ? ' · ' + p.tags[0] + ' · ' + p.tagZh[0] : '') + (p.min ? ' · ~' + p.min + ' min' : ''); }
// One dry hand-written aside per essay, pencilled on its obi; it notices length, not quality.
function aside(p) {
  if (p.series) return ['no.' + p.series + ' of the series', '系列第' + p.series + '篇'];
  if (p.min >= 15) return ['a long one', '长文'];
  if (p.min <= 4) return ['a quick one', '短篇'];
  return ["one coffee's worth", '一杯咖啡'];
}
function spineHTML(p) {
  var fs = Math.max(8.5, +(11 - Math.max(0, p.zh.length - 11) * 0.12).toFixed(2));
  return '<span class="bk-spine" style="--fs:' + fs + 'px"><i class="bk-band b1"></i><i class="bk-band b2"></i><i class="bk-band b3"></i>' +
    '<span class="bk-title">' + esc(p.zh) + '</span>' + (p.series ? '<span class="bk-badge">0' + p.series + '</span>' : '') + '</span>';
}

/* ---- how the planks fill (rule a): upright, wrap at the plank's end, a new plank when one is full ---- */
function geo(k, width, padX, strip) { return { x0: padX, cap: width - padX * 2, gW: Math.round(40 * k), GAP: Math.round(5 * k), strip: !!strip }; }
function fill(items, g) {
  var row = 0, x = g.x0 + g.gW + g.GAP, slots = [];
  items.forEach(function (it, i) {
    if (!g.strip && x + it.w > g.x0 + g.cap) { row++; x = g.x0; }
    slots.push({ i: i, row: row, x: x }); x += it.w + g.GAP;
  });
  return { rows: row + 1, slots: slots };
}

// opt: { strip, k, rowH, rows, P, eye, head, gapR, top, bottom, padX, sk }
function Case(host, list, opt) {
  var k = opt.k, rowH = opt.rowH, P = opt.P, GAP = Math.round(5 * k), LIP = Math.round(11 * k), S = Math.round(44 * k);
  var R = opt.strip ? 1 : opt.rows, HEAD = opt.head || 24, GAPR = opt.gapR || 20, TOP = opt.top || 20;
  var view = el('div', 'sh-view' + (opt.strip ? ' strip' : '')), world = el('div', 'sh-world');
  view.style.perspective = P + 'px'; view.style.setProperty('--sk', opt.sk || 1);
  view.appendChild(world); host.appendChild(view);
  var sh = { view: view, world: world, P: P, rowH: rowH, k: k, S: S, LIP: LIP, R: R, books: [], strip: !!opt.strip, used: R };

  var gW = Math.round(40 * k), gH = Math.round(rowH * 0.7), gD = Math.round(gH * 0.62);
  var ghost = el('div', 'b3 ghost', '<div class="f g-top"></div><div class="f g-front"><span>つづく</span></div>');
  ghost.setAttribute('role', 'img'); ghost.setAttribute('aria-label', 'Still writing · 还在写');
  world.appendChild(ghost);
  var planks = [];
  for (var r = 0; r < R; r++) {
    var pt = el('div', 'f pl-top'), pl = el('div', 'f pl-lip'), lab = opt.strip ? null : el('span', 'pl-lab');
    if (lab) { lab.setAttribute('aria-hidden', 'true'); pl.appendChild(lab); }
    world.appendChild(pt); world.appendChild(pl); planks.push({ top: pt, lip: pl, lab: lab });
  }
  var empty = el('div', 'case-empty'); empty.setAttribute('aria-live', 'polite'); world.appendChild(empty);

  var hits = el('div', 'hits');
  hits.setAttribute('role', 'group'); hits.setAttribute('aria-label', 'Bookshelf · 书架 — arrow keys walk the shelf, Enter opens');
  list.forEach(function (p, i) {
    var T = Math.round(p.w * k), h = Math.round(p.hPct / 100 * rowH), D = Math.round(h * 0.64);
    var box = el('div', 'b3 book' + (p.series ? ' series' : ''));
    box.style.setProperty('--tone', 'var(--tone-' + p.tone + ')');
    box.innerHTML = '<div class="f f-back"></div><div class="f f-fore"></div><div class="f f-top"></div>' +
      '<div class="f f-cov"><div class="leaf"><div class="leaf-front"></div><div class="leaf-back"></div></div></div>' +
      '<div class="f f-spine">' + spineHTML(p) + '</div>';
    var q = function (s) { return box.querySelector(s); };
    var F = { spine: q('.f-spine'), top: q('.f-top'), cov: q('.f-cov'), back: q('.f-back'), fore: q('.f-fore'), front: q('.leaf-front'), leaf: q('.leaf'), leafBack: q('.leaf-back') };
    var FT = {
      spine: [T3(-T / 2, -h, 0), T, h], top: [T3(-T / 2, -h, -D) + ' rotateX(90deg)', T, D],
      fore: [T3(T / 2, -h, -D) + ' rotateY(180deg)', T, h], cov: [T3(T / 2, -h, 0) + ' rotateY(90deg)', D, h],
      back: [T3(-T / 2, -h, -D) + ' rotateY(-90deg)', D, h]
    };
    var local = {};
    Object.keys(FT).forEach(function (n) {
      F[n].style.cssText = 'width:' + FT[n][1] + 'px;height:' + FT[n][2] + 'px;transform:' + FT[n][0];
      local[n] = new DOMMatrix(FT[n][0]);
    });
    var stip = el('div', 'f stip'), a = el('a', 'bk-hit');
    a.href = p.href; a.dataset.i = i; a.dataset.post = p.key; a.tabIndex = -1;
    a.setAttribute('aria-label', 'Read ' + p.en + ' — 阅读 ' + p.zh + ' · ' + tagLine(p));
    world.appendChild(box); world.appendChild(stip); hits.appendChild(a);
    sh.books.push({ post: p, i: i, w: T, h: h, D: D, box: box, F: F, local: local, stip: stip, hit: a, sx: 0, sy: 0, row: 0, vis: true });
  });
  world.appendChild(hits);

  // ---- geometry ----
  var x0 = 0, cap = 0, padL = 0, span = 1, Dmax = 0, G = null, eye0 = 0, eyeOff = 0;
  sh.books.forEach(function (b) { Dmax = Math.max(Dmax, b.D); });
  sh.plankY = function (r) { return opt.strip ? view.clientHeight - (opt.bottom || 60) : TOP + HEAD + rowH + r * (LIP + GAPR + HEAD + rowH); };
  sh.height = function (n) { return sh.plankY((n || R) - 1) + LIP + (opt.bottom || 30); };
  sh.pos = function (x, it) { return it.ref.row * span + x; };                   // reading order runs on across planks
  // Clearance under the plank above a book's head: an arriving book never drops through a board.
  sh.clear = function (b) { return b.row === 0 ? 60 : GAPR + HEAD + rowH - b.h; };

  function measure() {
    var vw = view.clientWidth;
    padL = opt.strip ? Math.round(18 * k) : (opt.padX || 16);
    x0 = padL; cap = vw - padL * 2; span = cap + 200;
    G = geo(k, vw, padL, opt.strip);
    eye0 = sh.plankY(0) - (opt.eye || 440); sh.oy = eye0 + eyeOff;
    view.style.perspectiveOrigin = '50% ' + sh.oy + 'px';
    var gy = sh.plankY(0);
    sh.ghost = { x: x0, cx: x0 + gW / 2, h: gH, D: gD, w: gW, y: gy };
    ghost.style.transform = T3(x0 + gW / 2, gy, 0);
    ghost.lastChild.style.cssText = 'width:' + gW + 'px;height:' + gH + 'px;transform:' + T3(-gW / 2, -gH, 0);
    ghost.firstChild.style.cssText = 'width:' + gW + 'px;height:' + gD + 'px;transform:' + T3(-gW / 2, -gH, -gD) + ' rotateX(90deg)';
    sh.floorK = (sh.plankY(0) - eye0) / (P + 20);
  }
  function drawPlanks(rowW) {
    var over = Math.round(14 * k), back = -(Dmax + Math.round(14 * k));
    var pW = opt.strip ? Math.max(rowW, view.clientWidth - padL * 2) + over * 2 : cap + over * 2 - 2, px0 = x0 - over + (opt.strip ? 0 : 1);
    world.style.width = (opt.strip ? Math.max(view.clientWidth, rowW + padL + Math.round(70 * k)) : view.clientWidth) + 'px';
    sh.plank = { x0: px0, w: pW, back: back };
    planks.forEach(function (pk, r) {
      var y = sh.plankY(r);
      pk.top.style.cssText = 'width:' + pW + 'px;height:' + (S - back) + 'px;transform:' + T3(px0, y, back) + ' rotateX(90deg)';
      pk.lip.style.cssText = 'width:' + pW + 'px;height:' + LIP + 'px;transform:' + T3(px0, y, S);
      pk.top.style.borderTopWidth = edge(new DOMMatrix(pk.top.style.transform), pW, S - back, 'top') + 'px';
    });
    ghost.firstChild.style.borderTopWidth = edge(new DOMMatrix(ghost.style.transform).multiply(new DOMMatrix(ghost.firstChild.style.transform)), gW, gD, 'top') + 'px';
  }
  // As tall as the planks in use: taller at once, shorter only once the books have settled.
  function useRows(n, now) {
    sh.used = n;
    planks.forEach(function (pk, r) { pk.top.classList.toggle('is-off', r >= n); pk.lip.classList.toggle('is-off', r >= n); });
    host.setAttribute('data-planks', opt.strip ? 1 : n);
    if (opt.strip) return;
    var hNow = parseFloat(host.style.height) || 0, want = sh.height(n);
    if (want > hNow || now) host.style.height = want + 'px';
  }
  function labels(list) {
    planks.forEach(function (pk, r) {
      if (!pk.lab) return;
      var on = list.filter(function (b) { return b.row === r; });
      var a = on.length ? on[0].post.year : '', z = on.length ? on[on.length - 1].post.year : '';
      pk.lab.textContent = a === z ? a : a + ' — ' + z;
      pk.lab.hidden = !on.length;
    });
  }
  sh.slots = function (list) {
    list.forEach(function (b) { b.prow = b.row; });
    var res = fill(list.map(function (b) { return { w: b.w }; }), G);
    res.slots.forEach(function (s) {
      var b = list[s.i], y = sh.plankY(s.row);
      b.row = s.row; b.sx = s.x; b.sy = y;
      b.hit.style.cssText = 'left:' + b.sx + 'px;top:' + (y - b.h) + 'px;width:' + b.w + 'px;height:' + b.h + 'px';
    });
    sh.rowW = 0;
    list.forEach(function (b) { if (b.row === 0) sh.rowW = Math.max(sh.rowW, b.sx + b.w - x0); });
    if (sh.plank) labels(list);
    useRows(Math.max(1, list.length ? res.rows : 1));
    if (opt.strip) { var cur = parseFloat(world.style.width) || 0, want = Math.max(view.clientWidth, sh.rowW + padL + Math.round(70 * k)); if (want > cur) drawPlanks(sh.rowW); }
  };
  sh.moved = function (b) { return b.prow !== b.row; };
  sh.settle = function () { if (opt.strip) drawPlanks(sh.rowW); else useRows(sh.used, true); };
  sh.showEmpty = function (html) {
    empty.innerHTML = html || '';
    empty.classList.toggle('on', !!html);
    if (html) empty.style.transform = T3(x0 + gW + Math.round(26 * k), sh.plankY(0) - 16, -24) + ' translateY(-100%)';
  };
  // The eye travels down with the reader (off = how far the page has scrolled past the case top); only the
  // planks and books near the viewport are re-inked.
  sh.follow = function (off, top, bottom) {
    if (opt.strip || Math.abs(off - eyeOff) < 0.5) return;
    eyeOff = off; sh.oy = eye0 + off; view.style.perspectiveOrigin = '50% ' + sh.oy + 'px';
    drawPlanks(sh.rowW);
    sh.books.forEach(function (b) { var y = sh.plankY(b.row); if (b.vis && y > top - 60 && y - rowH < bottom + 60) sh.place(b, b.st || sh.REST); });
  };
  // Contact: three rows of countable dots, big at the foot, smaller forward — never a blur. The ink colour
  // is read from the tokens (no literal here) and baked into a small SVG pre-stretched against foreshortening.
  function stipple(fy) {
    var sy = 1 / fy, ink = encodeURIComponent(getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || 'black'), d = '';
    [[0.95, 1.2, 0], [0.7, 3.6, 1.5], [0.45, 6.2, 0.4]].forEach(function (r) { d += "<ellipse cx='" + (1.2 + r[2]) + "' cy='" + (r[1] * sy).toFixed(1) + "' rx='" + r[0] + "' ry='" + (r[0] * sy).toFixed(1) + "' fill='" + ink + "' fill-opacity='.62'/>"; });
    return 'url("data:image/svg+xml,' + "%3Csvg xmlns='http://www.w3.org/2000/svg' width='3.2' height='" + (9 * sy).toFixed(1) + "'%3E" + d.replace(/</g, '%3C').replace(/>/g, '%3E') + '%3C/svg%3E")';
  }

  // ---- projection / pose ----
  sh.ox = function () { return view.scrollLeft + view.clientWidth / 2; };
  sh.project = function (x, y, z) { var ox = sh.ox(), kk = P / (P - z); return { x: ox + (x - ox) * kk - view.scrollLeft, y: sh.oy + (y - sh.oy) * kk, k: kk }; };
  // The reflow first (the whole book about a foot corner on its plank), then the pull: about the centre the
  // scale, the turn in the hand, a roll and a tilt; the lean about a bottom corner; the finger's tip.
  sh.ops = function (b, st) {
    var rf = b.rf || ZERO, L = st.lean > 0 ? b.w / 2 : -b.w / 2, px = (rf.fx - 0.5) * b.w;
    return [['t', b.sx + b.w / 2 + rf.x + st.dx, b.sy + rf.y + st.dy + (st.hy || 0), st.dz], ['t', px, 0, 0], ['z', rf.r], ['t', -px, 0, 0],
      ['t', 0, -b.h / 2, -b.D / 2], ['s', st.s], ['x', st.rx], ['z', st.rz], ['y', st.ry],
      ['t', 0, b.h / 2, b.D / 2], ['t', L, 0, 0], ['z', st.lean], ['t', -L, 0, 0], ['x', -st.tip]];
  };
  sh.css = function (o) {
    return o.map(function (q) {
      if (q[0] === 't') return T3(q[1], q[2], q[3]);
      if (q[0] === 's') return 'scale3d(' + f1(q[1]) + ',' + f1(q[1]) + ',' + f1(q[1]) + ')';
      return 'rotate' + q[0].toUpperCase() + '(' + (+q[1]).toFixed(3) + 'deg)';
    }).join(' ');
  };
  sh.mat = function (o) {
    var m = new DOMMatrix();
    o.forEach(function (q) {
      if (q[0] === 't') m = m.translate(q[1], q[2], q[3]);
      else if (q[0] === 's') m = m.scale(q[1], q[1], q[1]);
      else m = m.rotateAxisAngle(q[0] === 'x' ? 1 : 0, q[0] === 'y' ? 1 : 0, q[0] === 'z' ? 1 : 0, q[1]);
    });
    return m;
  };
  // Screen thickness of a 1px border on a face edge → the border width that draws one pen line there.
  function edge(M, w, h, side) {
    var pts = side === 'top' ? [[0, 0], [w, 0], [0, h], h] : side === 'right' ? [[w, 0], [w, h], [0, 0], w] : [[0, 0], [0, h], [w, 0], w];
    var pr = pts.slice(0, 3).map(function (pt) { var q = M.transformPoint(new DOMPoint(pt[0], pt[1], 0)); return sh.project(q.x, q.y, q.z); });
    var ex = pr[1].x - pr[0].x, ey = pr[1].y - pr[0].y, dx = pr[2].x - pr[0].x, dy = pr[2].y - pr[0].y;
    var perp = Math.abs(ex * dy - ey * dx) / (Math.hypot(ex, ey) || 1), ratio = perp / pts[3];
    return +(1.5 / Math.max(0.1, Math.min(1, ratio))).toFixed(2);
  }
  sh.place = function (b, st) {
    st = st || b.st || sh.REST;
    var o = sh.ops(b, st), rf = b.rf || ZERO;
    b.box.style.transform = sh.css(o);
    var M = sh.mat(o); b.M = M;
    var c = M.transformPoint(new DOMPoint(0, -b.h / 2, -b.D / 2)), kk = st.s * P / (P - c.z);
    var bw = Math.max(0.8, Math.min(1.5, 1.5 / kk));
    b.box.style.setProperty('--bw', f1(bw) + 'px');
    b.box.style.setProperty('--o', rf.o < 0.999 ? rf.o.toFixed(3) : 1);
    b.F.top.style.borderTopWidth = f1(edge(M.multiply(b.local.top), b.w, b.D, 'top') * bw / 1.5) + 'px';
    b.F.front.style.borderRightWidth = f1(edge(M.multiply(b.local.cov), b.D, b.h, 'right') * bw / 1.5) + 'px';
    b.F.back.style.borderLeftWidth = f1(edge(M.multiply(b.local.back), b.D, b.h, 'left') * bw / 1.5) + 'px';
    if (b._lf !== st.lf) { b._lf = st.lf; b.F.leaf.style.transform = 'rotateY(' + (+st.lf || 0).toFixed(2) + 'deg)'; }
    var on = rf.y + st.dy + (st.hy || 0) > -1.5 && Math.abs(st.ry) < 3 && st.tip < 4 && Math.abs(rf.r) < 3 && st.dz < 30;
    b.stip.style.transform = T3(b.sx + b.w / 2 + rf.x + st.dx - b.stipW / 2, b.sy - 0.4, st.dz) + ' rotateX(90deg)';
    b.stip.style.opacity = on ? rf.o : 0;
  };
  sh.worldPoint = function (b, x, y, z) {
    var M = b.frozen ? new DOMMatrix(getComputedStyle(b.box).transform) : (b.M || sh.mat(sh.ops(b, sh.REST)));
    var q = M.transformPoint(new DOMPoint(x, y, z)); return { x: q.x, y: q.y, z: q.z };
  };
  sh.show = function (b, mode) {
    b.vis = mode !== 'out';
    b.box.classList.toggle('is-out', mode === 'out'); b.stip.classList.toggle('is-out', mode === 'out');
    b.hit.classList.toggle('is-out', mode !== 'in');
  };
  sh.REST = { dx: 0, dy: 0, dz: 0, s: 1, rx: 0, ry: 0, rz: 0, lean: 0, tip: 0, lf: 0, hy: 0 };
  sh.layout = function (list) {
    measure(); drawPlanks(0);
    sh.slots(list || sh.books.filter(function (b) { return b.vis && (!b.rf || b.rf.mode === 'in'); }));
    drawPlanks(sh.rowW); useRows(sh.used, true);
    var fy = sh.floorK, img = stipple(fy);
    sh.books.forEach(function (b) {
      b.stipW = b.w + 6; b.stip.style.width = b.stipW + 'px'; b.stip.style.height = Math.round(9 / fy) + 'px'; b.stip.style.backgroundImage = img;
      sh.place(b, b.st || sh.REST);
    });
  };
  if (opt.strip) {
    var raf = 0;
    view.addEventListener('scroll', function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; sh.books.forEach(function (b) { if (b.vis) sh.place(b, b.st || sh.REST); }); }); }, { passive: true });
  }
  return sh;
}
// Planks needed for every book at a given view width.
Case.rowsFor = function (list, o, width) { return fill(list.map(function (p) { return { w: Math.round(p.w * o.k) }; }), geo(o.k, width, o.padX || 16, false)).rows; };

export { posts, tagLine, aside, esc, el, TAG_ZH, Case };
