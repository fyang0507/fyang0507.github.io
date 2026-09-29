/* r4-03-case.js — the bookcase at any size: r3-03-case.js (r2-04 A's paper boxes under one fixed camera) with
   the round-4 changes for scale:
     - slots come from r4-03-fill.js: books fill the planks in reading order from the top, so a filter gathers
       its books at the top of the case; planks follow the books ('grow' adds them, 'cap' lays the oldest
       years flat in stacks first);
     - the case is only as tall as the planks in use: it grows at once when books arrive and shortens once
       they have settled; planks not in use fade out;
     - each plank's lip carries a printed label with the years standing on it now ("2026 — 2022"), and in a
       capped case each year's stack has its own year slip;
     - a flat book is the same paper box turned onto its side (a -90° roll about its centre, which the pull
       springs own, so pulling it stands it up); its title is set sideways so it reads horizontally;
     - synthetic books (r4-03-data.js) carry a dashed spine and a 拟 label.
   Everything about the camera, the faces, the re-inking and the contact stipple is round 3's. */
(function () {
  var K = window.ShelfKit, el = K.el;
  var f1 = function (n) { return (+n).toFixed(2); };
  function T3(x, y, z) { return 'translate3d(' + f1(x) + 'px,' + f1(y) + 'px,' + f1(z) + 'px)'; }
  var ZERO = { x: 0, y: 0, r: 0, o: 1, fx: 0.5 };
  function geo(k, rowH, head, width, padX, strip) {
    var GAP = Math.round(5 * k);
    return { x0: padX, cap: width - padX * 2, gW: Math.round(40 * k), GAP: GAP, SH: head + rowH * 0.96 - 4, strip: !!strip };
  }
  function itemsOf(posts, k, rowH) { return posts.map(function (p) { return { w: Math.round(p.w * k), h: Math.round(p.hPct / 100 * rowH), year: p.year }; }); }

  // opt: { strip, k, rowH, rows, P, eye, head, gapR, top, bottom, padX, sk, rule, cap }
  function Case(host, posts, opt) {
    var k = opt.k, rowH = opt.rowH, P = opt.P, GAP = Math.round(5 * k), LIP = Math.round(11 * k), S = Math.round(44 * k);
    var R = opt.strip ? 1 : opt.rows, HEAD = opt.head || 24, GAPR = opt.gapR || 20, TOP = opt.top || 20;
    var view = el('div', 'sh-view' + (opt.strip ? ' strip' : '')), world = el('div', 'sh-world');
    view.style.perspective = P + 'px'; view.style.setProperty('--sk', opt.sk || 1);
    view.appendChild(world); host.appendChild(view);
    var sh = { view: view, world: world, P: P, rowH: rowH, k: k, S: S, LIP: LIP, R: R, HEAD: HEAD, books: [], posts: posts, strip: !!opt.strip, used: R };

    var gW = Math.round(40 * k), gH = Math.round(rowH * 0.7), gD = Math.round(gH * 0.62);
    var ghost = el('div', 'b3 ghost');
    ghost.innerHTML = '<div class="f g-top"></div><div class="f g-front"><span>つづく</span></div>';
    ghost.setAttribute('role', 'img'); ghost.setAttribute('aria-label', 'Still writing · 还在写');
    world.appendChild(ghost);
    var planks = [];
    for (var r = 0; r < R; r++) {
      var pt = el('div', 'f pl-top'), pl = el('div', 'f pl-lip'), lab = opt.strip ? null : el('span', 'pl-lab');
      if (lab) { lab.setAttribute('aria-hidden', 'true'); pl.appendChild(lab); }
      world.appendChild(pt); world.appendChild(pl); planks.push({ top: pt, lip: pl, lab: lab, slips: [] });
    }
    var empty = el('div', 'case-empty'); empty.setAttribute('aria-live', 'polite'); world.appendChild(empty);

    var hits = el('div', 'hits');
    hits.setAttribute('role', 'group'); hits.setAttribute('aria-label', 'Bookshelf · 书架 — arrow keys walk the shelf');
    posts.forEach(function (p, i) {
      var T = Math.round(p.w * k), h = Math.round(p.hPct / 100 * rowH), D = Math.round(h * 0.64);
      var box = el('div', 'b3 book' + (p.series ? ' series' : '') + (p.syn ? ' syn' : ''));
      box.style.cssText = '--tone:' + p.tone;
      box.innerHTML = '<div class="f f-back"></div><div class="f f-fore"></div><div class="f f-top"></div>' +
        '<div class="f f-cov"><div class="leaf"><div class="leaf-front"></div><div class="leaf-back"></div></div></div>' +
        '<div class="f f-spine">' + K.spineHTML(p) + '</div>';
      if (p.syn) box.querySelector('.bk-spine').insertAdjacentHTML('beforeend', '<span class="bk-syn" title="synthetic · 模拟">拟</span>');
      var q = function (s) { return box.querySelector(s); };
      var F = { spine: q('.f-spine'), top: q('.f-top'), cov: q('.f-cov'), back: q('.f-back'), fore: q('.f-fore') };
      F.front = q('.leaf-front'); F.leaf = q('.leaf'); F.leafBack = q('.leaf-back');
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
      a.href = p.href; a.dataset.i = i; a.tabIndex = -1;
      a.setAttribute('aria-label', 'Read ' + p.en + ' — 阅读 ' + p.zh + ' · ' + K.tagLine(p) + (p.syn ? ' (synthetic · 模拟)' : ''));
      world.appendChild(box); world.appendChild(stip); hits.appendChild(a);
      sh.books.push({ post: p, i: i, w: T, h: h, D: D, box: box, F: F, local: local, stip: stip, hit: a, sx: 0, sy: 0, row: 0, flat: false, restRz: 0, vis: true });
    });
    world.appendChild(hits);

    // ---- geometry ------------------------------------------------------------------------------------------
    var x0 = 0, cap = 0, padL = 0, span = 1, Dmax = 0, G = null, eye0 = 0, eyeOff = 0;
    sh.books.forEach(function (b) { Dmax = Math.max(Dmax, b.D); });
    sh.plankY = function (r) { return opt.strip ? view.clientHeight - (opt.bottom || 60) : TOP + HEAD + rowH + r * (LIP + GAPR + HEAD + rowH); };
    sh.height = function (n) { return sh.plankY((n || R) - 1) + LIP + (opt.bottom || 30); };
    sh.pos = function (x, it) { return it.ref.row * span + x; };                // reading order runs on across planks
    // Clearance under the plank above a book's head: an arriving book never drops through a board.
    sh.clear = function (b) { return b.row === 0 ? 60 : GAPR + HEAD + rowH - (b.flat ? b.base + b.w : b.h); };

    function measure() {
      var vw = view.clientWidth;
      padL = opt.strip ? Math.round(18 * k) : (opt.padX || 16);
      x0 = padL; cap = vw - padL * 2; span = cap + 200;
      G = geo(k, rowH, HEAD, vw, padL, opt.strip);
      eye0 = sh.plankY(0) - (opt.eye || 440); sh.oy = eye0 + eyeOff;
      view.style.perspectiveOrigin = '50% ' + sh.oy + 'px';
      var gy = sh.plankY(0);
      sh.ghost = { x: x0, cx: x0 + gW / 2, h: gH, D: gD, w: gW, y: gy };
      ghost.style.transform = T3(x0 + gW / 2, gy, 0);
      var gt = ghost.firstChild, gf = ghost.lastChild;
      gf.style.cssText = 'width:' + gW + 'px;height:' + gH + 'px;transform:' + T3(-gW / 2, -gH, 0);
      gt.style.cssText = 'width:' + gW + 'px;height:' + gD + 'px;transform:' + T3(-gW / 2, -gH, -gD) + ' rotateX(90deg)';
      sh.floorK = (sh.plankY(0) - eye0) / (P + 20);
    }
    function drawPlanks(rowW) {
      var over = Math.round(14 * k), back = -(Dmax + Math.round(14 * k));
      var pW = opt.strip ? Math.max(rowW, view.clientWidth - padL * 2) + over * 2 : cap + over * 2 - 2, px0 = x0 - over + (opt.strip ? 0 : 1);
      if (opt.strip) world.style.width = Math.max(view.clientWidth, rowW + padL + Math.round(70 * k)) + 'px';
      else world.style.width = view.clientWidth + 'px';
      sh.plank = { x0: px0, w: pW, back: back };
      planks.forEach(function (pk, r) {
        var y = sh.plankY(r);
        pk.top.style.cssText = 'width:' + pW + 'px;height:' + (S - back) + 'px;transform:' + T3(px0, y, back) + ' rotateX(90deg)';
        pk.lip.style.cssText = 'width:' + pW + 'px;height:' + LIP + 'px;transform:' + T3(px0, y, S);
        pk.top.style.borderTopWidth = edge(new DOMMatrix(pk.top.style.transform), pW, S - back, 'top') + 'px';
      });
      var gt = ghost.firstChild;
      gt.style.borderTopWidth = edge(new DOMMatrix(ghost.style.transform).multiply(new DOMMatrix(gt.style.transform)), gW, gD, 'top') + 'px';
    }
    // The case is as tall as the planks in use: taller at once, shorter only once the books have settled.
    function useRows(n, now) {
      sh.used = n;
      planks.forEach(function (pk, r) { pk.top.classList.toggle('is-off', r >= n); pk.lip.classList.toggle('is-off', r >= n); });
      if (opt.strip) return;
      var hNow = parseFloat(host.style.height) || 0, want = sh.height(n);
      if (want > hNow || now) host.style.height = want + 'px';
    }
    // Plank labels (the years standing on it now) and, in a capped case, one year slip per stack.
    function labels(list, stacks) {
      planks.forEach(function (pk, r) {
        if (!pk.lab) return;
        var on = list.filter(function (b) { return b.row === r; }), startsFlat = on.length && on[0].flat && !on.some(function (b) { return !b.flat; });
        var a = on.length ? on[0].post.year : '', z = on.length ? on[on.length - 1].post.year : '';
        pk.lab.textContent = a === z ? a : a + ' — ' + z;
        pk.lab.classList.toggle('is-none', !on.length || startsFlat);
        var mine = stacks.filter(function (s) { return s.row === r && s.lead; });
        while (pk.slips.length < mine.length) { var sp = el('span', 'pl-slip'); sp.setAttribute('aria-hidden', 'true'); pk.lip.appendChild(sp); pk.slips.push(sp); }
        pk.slips.forEach(function (sp, j) {
          var s = mine[j]; sp.hidden = !s;
          if (s) { sp.textContent = s.year; sp.style.left = (s.cx - sh.plank.x0).toFixed(1) + 'px'; }
        });
      });
    }
    sh.slots = function (list) {
      list.forEach(function (b) { b.prow = b.row; b.pflat = b.flat; });
      var res = window.Fill4.fill(list.map(function (b) { return { w: b.w, h: b.h, year: b.post.year }; }), G, opt.rule, opt.cap || 2);
      res.slots.forEach(function (s) {
        var b = list[s.i], y = sh.plankY(s.row);
        b.row = s.row; b.flat = s.flat; b.base = s.base; b.restRz = s.flat ? -90 : 0;
        if (!s.flat) { b.sx = s.x; b.sy = y; b.hit.style.cssText = 'left:' + b.sx + 'px;top:' + (y - b.h) + 'px;width:' + b.w + 'px;height:' + b.h + 'px'; }
        else {
          b.sx = s.x - b.w / 2; b.sy = y - s.base - b.w / 2 + b.h / 2;
          b.hit.style.cssText = 'left:' + (s.x - b.h / 2) + 'px;top:' + (y - s.base - b.w) + 'px;width:' + b.h + 'px;height:' + b.w + 'px';
        }
        b.box.classList.toggle('flat', s.flat);
      });
      sh.rowW = 0;
      list.forEach(function (b) { if (b.row === 0) sh.rowW = Math.max(sh.rowW, b.sx + b.w - x0); });
      sh.stacks = res.stacks;
      if (sh.plank) labels(list, res.stacks);
      useRows(Math.max(1, list.length ? res.rows : 1));
      if (opt.strip) { var cur = parseFloat(world.style.width) || 0, want = Math.max(view.clientWidth, sh.rowW + padL + Math.round(70 * k)); if (want > cur) drawPlanks(sh.rowW); }
    };
    sh.moved = function (b) { return b.prow !== b.row || b.pflat !== b.flat; };
    // The eye travels down with the reader (r2-04's phone strip does this sideways): off = how far the page
    // has scrolled past the top of the case. Without it the ninth plank of a 120-book case is seen from 3000 px
    // above, and its page-block tops grow to ~100 px. Only the planks and books near the viewport are re-inked.
    sh.follow = function (off, top, bottom) {
      if (opt.strip || Math.abs(off - eyeOff) < 0.5) return;
      eyeOff = off; sh.oy = eye0 + off; view.style.perspectiveOrigin = '50% ' + sh.oy + 'px';
      drawPlanks(sh.rowW);
      sh.books.forEach(function (b) { var y = sh.plankY(b.row); if (b.vis && y > top - 60 && y - rowH < bottom + 60) sh.place(b, b.st || sh.REST); });
    };
    sh.settle = function () { if (opt.strip) drawPlanks(sh.rowW); else useRows(sh.used, true); };
    sh.showEmpty = function (text) {
      empty.innerHTML = text || '';
      empty.classList.toggle('on', !!text);
      if (text) empty.style.transform = T3(x0 + gW + Math.round(26 * k), sh.plankY(0) - 16, -24) + ' translateY(-100%)';
    };

    function stipple(fy) {
      var sy = 1 / fy, rows = [[0.95, 1.2, 0], [0.7, 3.6, 1.5], [0.45, 6.2, 0.4]], d = '';
      rows.forEach(function (r) { d += "<ellipse cx='" + (1.2 + r[2]) + "' cy='" + (r[1] * sy).toFixed(1) + "' rx='" + r[0] + "' ry='" + (r[0] * sy).toFixed(1) + "' fill='%2333302B' fill-opacity='.62'/>"; });
      return 'url("data:image/svg+xml,' + "%3Csvg xmlns='http://www.w3.org/2000/svg' width='3.2' height='" + (9 * sy).toFixed(1) + "'%3E" + d.replace(/</g, '%3C').replace(/>/g, '%3E') + '%3C/svg%3E")';
    }

    // ---- projection / pose (round 3, unchanged) ------------------------------------------------------------
    sh.ox = function () { return view.scrollLeft + view.clientWidth / 2; };
    sh.project = function (x, y, z) { var ox = sh.ox(), kk = P / (P - z); return { x: ox + (x - ox) * kk - view.scrollLeft, y: sh.oy + (y - sh.oy) * kk, k: kk }; };
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
      var on = !b.flat && rf.y + st.dy + (st.hy || 0) > -1.5 && Math.abs(st.ry) < 3 && st.tip < 4 && Math.abs(rf.r) < 3 && st.dz < 30;
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
  // Planks needed for every book at a given view width, under a rule (the app sizes the case from it).
  Case.rowsFor = function (posts, o, width) {
    var r = window.Fill4.fill(itemsOf(posts, o.k, o.rowH), geo(o.k, o.rowH, o.head || 24, width, o.padX || 16, false), o.rule, o.cap || 2);
    return { rows: r.rows, flat: r.slots.filter(function (s) { return s.flat; }).length, stacks: r.stacks.length };
  };
  window.Case4 = Case;
})();
