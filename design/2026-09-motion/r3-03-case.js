/* r3-03-case.js — the bookcase: r2-04 A's paper-craft 3D shelf (r2-04-shelf3d.js), grown to planks and made
   filterable. Same camera (eye above the top plank, shifted lens, so every front face at z = 0 is drawn at its
   flat size), same paper boxes (spine, page-block top, both boards, fore-edge), same re-inking of grazing faces,
   same contact stipple. What is new:
     - planks: 'case' mode wraps the visible books over R planks within the view (newest top-left, the つづく
       ghost first); 'strip' mode (phone) is r2-04 M's single plank in a native swipe scroller;
     - slots: layout is JS, not flow, so the reflow engine reads slot positions (sx, sy) from here; every
       book keeps a home plank, so the case stays chronological top to bottom and nothing changes planks;
     - one pose: sh.place() composes the reflow offsets (b.rf) and the pull pose (b.st) into one transform.
   Each plank's front lip carries a small printed shelf label with the years it holds ("2026 — 2022"), so a
   plank a year filter has emptied reads as "none from these years", not a broken layout. It dims a step
   when nothing on it matches. The phone strip has one plank and no label. */
(function () {
  var K = window.ShelfKit, el = K.el;
  var f1 = function (n) { return (+n).toFixed(2); };
  function T3(x, y, z) { return 'translate3d(' + f1(x) + 'px,' + f1(y) + 'px,' + f1(z) + 'px)'; }
  var ZERO = { x: 0, y: 0, r: 0, o: 1, fx: 0.5 };

  // opt: { strip, k, rowH, rows, P, eye, head, gapR, top, bottom, padX, sk }
  function Case(host, posts, opt) {
    var k = opt.k, rowH = opt.rowH, P = opt.P, GAP = Math.round(5 * k), LIP = Math.round(11 * k), S = Math.round(44 * k);
    var R = opt.strip ? 1 : opt.rows, HEAD = opt.head || 24, GAPR = opt.gapR || 20, TOP = opt.top || 20;
    var view = el('div', 'sh-view' + (opt.strip ? ' strip' : '')), world = el('div', 'sh-world');
    view.style.perspective = P + 'px'; view.style.setProperty('--sk', opt.sk || 1);
    view.appendChild(world); host.appendChild(view);
    var sh = { view: view, world: world, P: P, rowH: rowH, k: k, S: S, LIP: LIP, R: R, HEAD: HEAD, books: [], posts: posts, strip: !!opt.strip };

    var gW = Math.round(40 * k), gH = Math.round(rowH * 0.7), gD = Math.round(gH * 0.62);
    var ghost = el('div', 'b3 ghost');
    ghost.innerHTML = '<div class="f g-top"></div><div class="f g-front"><span>つづく</span></div>';
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
    hits.setAttribute('role', 'group'); hits.setAttribute('aria-label', 'Bookshelf · 书架 — arrow keys walk the shelf');
    posts.forEach(function (p, i) {
      var T = Math.round(p.w * k), h = Math.round(p.hPct / 100 * rowH), D = Math.round(h * 0.64);
      var box = el('div', 'b3 book' + (p.series ? ' series' : ''));
      box.style.cssText = '--tone:' + p.tone;
      box.innerHTML = '<div class="f f-back"></div><div class="f f-fore"></div><div class="f f-top"></div>' +
        '<div class="f f-cov"><div class="leaf"><div class="leaf-front"></div><div class="leaf-back"></div></div></div>' +
        '<div class="f f-spine">' + K.spineHTML(p) + '</div>';
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
      a.setAttribute('aria-label', 'Read ' + p.en + ' — 阅读 ' + p.zh + ' · ' + K.tagLine(p));
      a.style.width = T + 'px'; a.style.height = h + 'px';
      world.appendChild(box); world.appendChild(stip); hits.appendChild(a);
      sh.books.push({ post: p, i: i, w: T, h: h, D: D, box: box, F: F, local: local, stip: stip, hit: a, sx: 0, sy: 0, row: 0, vis: true });
    });
    world.appendChild(hits);

    // ---- geometry ------------------------------------------------------------------------------------------
    var x0 = 0, cap = 0, padL = 0, span = 1, Dmax = 0;
    sh.books.forEach(function (b) { Dmax = Math.max(Dmax, b.D); });
    sh.plankY = function (r) { return opt.strip ? view.clientHeight - (opt.bottom || 60) : TOP + HEAD + rowH + r * (LIP + GAPR + HEAD + rowH); };
    sh.height = function () { return sh.plankY(R - 1) + LIP + (opt.bottom || 30); };
    function rowOf(y) { var best = 0; for (var r = 1; r < R; r++) if (Math.abs(y - sh.plankY(r)) < Math.abs(y - sh.plankY(best))) best = r; return best; }
    sh.rowOf = rowOf;
    sh.pos = function (x, y) { return rowOf(y) * span * 4 + x; };               // planks are far apart: each closes up alone
    // Clearance under the plank above a book's head: an arriving book never drops through a board.
    sh.clear = function (b) { return b.row === 0 ? 60 : GAPR + HEAD + rowH - b.h; };

    function measure() {
      var vw = view.clientWidth;
      if (!opt.strip) host.style.height = sh.height() + 'px';
      padL = opt.strip ? Math.round(18 * k) : (opt.padX || 16);
      x0 = padL; cap = vw - padL * 2; span = cap + 200;
      sh.oy = sh.plankY(0) - (opt.eye || 440);
      view.style.perspectiveOrigin = '50% ' + sh.oy + 'px';
      var gy = sh.plankY(0);
      sh.ghost = { x: x0, cx: x0 + gW / 2, h: gH, D: gD, w: gW, y: gy };
      ghost.style.transform = T3(x0 + gW / 2, gy, 0);
      var gt = ghost.firstChild, gf = ghost.lastChild;
      gf.style.cssText = 'width:' + gW + 'px;height:' + gH + 'px;transform:' + T3(-gW / 2, -gH, 0);
      gt.style.cssText = 'width:' + gW + 'px;height:' + gD + 'px;transform:' + T3(-gW / 2, -gH, -gD) + ' rotateX(90deg)';
      sh.floorK = (sh.plankY(R - 1) - sh.oy) / (P + 20);
    }
    // The planks span the view (case) or the visible row (strip). Their front lip is nearer than z = 0.
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
    // Every book has a home plank: where it stands when all 27 are out, newest first after the ghost. A filter
    // never moves a book to another plank; the books left on each plank close up toward its start.
    function homes() {
      var x = x0 + gW + GAP, row = 0;
      sh.books.forEach(function (b) { if (!opt.strip && row < R - 1 && x + b.w > x0 + cap) { row++; x = x0; } b.home = row; x += b.w + GAP; });
      planks.forEach(function (pk, r) {                                           // the shelf label: the years it holds
        if (!pk.lab) return;
        var ys = sh.books.filter(function (b) { return b.home === r; }).map(function (b) { return b.post.year; });
        pk.lab.textContent = ys.length ? (ys[0] === ys[ys.length - 1] ? ys[0] : ys[0] + ' — ' + ys[ys.length - 1]) : '';
      });
    }
    sh.slots = function (list) {
      var xs = [];
      for (var r = 0; r < R; r++) xs.push(r === 0 ? x0 + gW + GAP : x0);
      list.forEach(function (b) {
        var row = b.home || 0;
        b.sx = xs[row]; b.row = row; b.sy = sh.plankY(row); xs[row] += b.w + GAP;
        b.hit.style.left = b.sx + 'px'; b.hit.style.top = (b.sy - b.h) + 'px';
      });
      sh.rowW = xs[0] - x0 - GAP;
      planks.forEach(function (pk, r) { if (pk.lab) pk.lab.classList.toggle('is-none', !list.some(function (b) { return (b.home || 0) === r; })); });
      if (opt.strip) { var cur = parseFloat(world.style.width) || 0, want = Math.max(view.clientWidth, sh.rowW + padL + Math.round(70 * k)); if (want > cur) drawPlanks(sh.rowW); }
    };
    sh.settle = function () { if (opt.strip) drawPlanks(sh.rowW); };          // a shorter plank waits for the fallers
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

    // ---- projection / pose ---------------------------------------------------------------------------------
    sh.ox = function () { return view.scrollLeft + view.clientWidth / 2; };
    sh.project = function (x, y, z) { var ox = sh.ox(), kk = P / (P - z); return { x: ox + (x - ox) * kk - view.scrollLeft, y: sh.oy + (y - sh.oy) * kk, k: kk }; };
    // Reflow first (the whole book about a foot corner on its plank), then r2-04's pose: about the centre the
    // scale, the turn in your hand, a roll and a tilt; the lean about the bottom corner; the finger's tip.
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
      // contact: the stipple slides with the foot and is gone the moment the book leaves the plank
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
      measure(); homes();
      sh.slots(list || sh.books.filter(function (b) { return b.vis && (!b.rf || b.rf.mode === 'in'); }));
      drawPlanks(sh.rowW);
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
  // Planks needed for every book at a given view width, with the same wrap rule as sh.slots().
  Case.rowsFor = function (posts, k, width, padX) {
    var GAP = Math.round(5 * k), cap = width - padX * 2, x = padX + Math.round(40 * k) + GAP, row = 0;
    posts.forEach(function (p) { var w = Math.round(p.w * k); if (x + w > padX + cap) { row++; x = padX; } x += w + GAP; });
    return row + 1;
  };
  window.Case3 = Case;
})();
