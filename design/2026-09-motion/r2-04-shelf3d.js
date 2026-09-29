/* r2-04-shelf3d.js — the shelf, built 3D from the first frame.
   One fixed camera: the eye sits above the plank, centred on the view, with a shifted lens — verticals stay
   vertical and every front face at z = 0 is drawn at exactly its flat size. So the spines at rest are Fred's
   spines, pixel for pixel; what the camera adds is depth: each book is a paper box (spine, page-block top,
   both boards, fore-edge), the plank has a top and a front lip, and each book sits on a little contact stipple.
   Paper-craft, not rendering: flat tones, ink edges, no light source. Faces seen at a grazing angle get their
   far edge re-inked (border widened by 1/foreshortening) so the edge reads as one pen line, not a hairline. */
(function () {
  var K = window.ShelfKit, el = K.el;
  var f1 = function (n) { return (+n).toFixed(2); };
  function T3(x, y, z) { return 'translate3d(' + f1(x) + 'px,' + f1(y) + 'px,' + f1(z) + 'px)'; }

  function Shelf3D(host, posts, opt) {
    var k = opt.scale || 1, rowH = opt.rowH || 230, P = opt.P || 2000, GAP = Math.round(5 * k), LIP = Math.round(11 * k), S = Math.round(44 * k);
    var view = el('div', 'sh-view' + (opt.strip ? ' strip' : '')), world = el('div', 'sh-world');
    view.style.perspective = P + 'px';
    view.appendChild(world); host.appendChild(view);
    var sh = { view: view, world: world, P: P, rowH: rowH, k: k, S: S, LIP: LIP, books: [], posts: posts };

    // ---- the ghost of the next essay (dashed paper box) --------------------------------------------
    var gW = Math.round(40 * k), gH = Math.round(rowH * 0.7), gD = Math.round(gH * 0.62);
    var ghost = el('div', 'b3 ghost');
    ghost.innerHTML = '<div class="f g-top"></div><div class="f g-front"><span>つづく</span></div>';
    ghost.setAttribute('role', 'img'); ghost.setAttribute('aria-label', 'Still writing · 还在写');
    world.appendChild(ghost);

    // ---- plank ----------------------------------------------------------------------------------------
    var plTop = el('div', 'f pl-top'), plLip = el('div', 'f pl-lip'), years = el('div', 'years');
    world.appendChild(plTop); world.appendChild(plLip); world.appendChild(years);

    // ---- books ----------------------------------------------------------------------------------------
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
      // Face placement in book space: origin = bottom-front-centre of the book, y up is negative, z toward you.
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
      var stip = el('div', 'f stip');
      var a = el('a', 'bk-hit');
      a.href = p.href; a.dataset.i = i;
      a.setAttribute('aria-label', 'Read ' + p.en + ' — 阅读 ' + p.zh + ' · ' + K.tagLine(p));
      a.style.width = T + 'px'; a.style.height = h + 'px';
      world.appendChild(box); world.appendChild(stip); hits.appendChild(a);
      sh.books.push({ post: p, i: i, w: T, h: h, D: D, box: box, F: F, local: local, stip: stip, hit: a });
    });
    world.appendChild(hits);

    // ---- layout -----------------------------------------------------------------------------------------
    function layout() {
      var vw = view.clientWidth, vh = view.clientHeight;
      var rowW = gW + GAP + sh.books.reduce(function (s, b) { return s + b.w + GAP; }, 0) - GAP;
      var padL = opt.strip ? Math.round(26 * k) : 0, padR = opt.strip ? Math.round(90 * k) : 0;
      var ww = opt.strip ? rowW + padL + padR : vw;
      var x0 = opt.strip ? padL : Math.round((vw - rowW) / 2);
      sh.plankY = Math.round(vh - (opt.bottom || 96));
      sh.oy = sh.plankY - (opt.eye || 440);
      view.style.perspectiveOrigin = '50% ' + sh.oy + 'px';
      world.style.width = ww + 'px';
      // ghost
      sh.ghost = { x: x0, cx: x0 + gW / 2, h: gH, D: gD, w: gW };
      ghost.style.transform = T3(x0 + gW / 2, sh.plankY, 0);
      var gt = ghost.firstChild, gf = ghost.lastChild;
      gf.style.cssText = 'width:' + gW + 'px;height:' + gH + 'px;transform:' + T3(-gW / 2, -gH, 0);
      gt.style.cssText = 'width:' + gW + 'px;height:' + gD + 'px;transform:' + T3(-gW / 2, -gH, -gD) + ' rotateX(90deg)';
      var x = x0 + gW + GAP, Dmax = 0, yrs = '';
      sh.books.forEach(function (b, i) {
        b.x = x; b.cx = x + b.w / 2; x += b.w + GAP; Dmax = Math.max(Dmax, b.D);
        b.hit.style.left = b.x + 'px'; b.hit.style.top = (sh.plankY - b.h) + 'px';
        // contact stipple: lies on the plank in front of the spine, dots pre-stretched against foreshortening
        b.stipW = b.w + 6;
        if (i === 0 || sh.posts[i - 1].year !== b.post.year) yrs += '<span class="yr" style="left:' + b.x + 'px"><i></i><b>' + b.post.year + '</b></span>';
      });
      years.innerHTML = yrs;
      unclash();
      var lipBottom = sh.oy + (sh.plankY + LIP - sh.oy) * P / (P - S);   // the lip is nearer than z = 0: sits lower
      years.style.transform = T3(0, Math.round(lipBottom + 6 * k), 0);
      var over = Math.round(14 * k), px0 = x0 - over, pW = rowW + over * 2, back = -(Dmax + Math.round(14 * k));
      sh.plank = { x0: px0, w: pW, back: back };
      plTop.style.cssText = 'width:' + pW + 'px;height:' + (S - back) + 'px;transform:' + T3(px0, sh.plankY, back) + ' rotateX(90deg)';
      plLip.style.cssText = 'width:' + pW + 'px;height:' + LIP + 'px;transform:' + T3(px0, sh.plankY, S);
      // floor foreshortening at the plank (same for every book: the plank line is level)
      var fy = (sh.plankY - sh.oy) / (P + 20);
      sh.floorK = fy;
      var stipSVG = stipple(fy);
      sh.books.forEach(function (b) { b.stip.style.width = b.stipW + 'px'; b.stip.style.height = Math.round(9 / fy) + 'px'; b.stip.style.backgroundImage = stipSVG; });
      plTop.style.borderTopWidth = edge(new DOMMatrix(plTop.style.transform), pW, S - back, 'top') + 'px';
      gt.style.borderTopWidth = edge(new DOMMatrix(ghost.style.transform).multiply(new DOMMatrix(gt.style.transform)), gW, gD, 'top') + 'px';
    }
    // Year labels never overlap: every boundary keeps its tick; a label that would hit the newer one on its left
    // drops a line on a longer tick, and if it would hit there too it is left as a bare tick.
    function unclash() {
      var lastR = [-1e9, -1e9];
      [].forEach.call(years.children, function (s) {
        s.classList.remove('low', 'mute');
        var L = s.offsetLeft + s.lastChild.offsetLeft, R = L + s.lastChild.offsetWidth;
        var row = L >= lastR[0] + 5 ? 0 : L >= lastR[1] + 5 ? 1 : -1;
        if (row === 1) s.classList.add('low'); else if (row < 0) s.classList.add('mute');
        if (row >= 0) lastR[row] = R;
      });
    }
    if (document.fonts) document.fonts.ready.then(unclash);
    // Halftone contact: three rows of dots, big at the book's foot, smaller forward. Countable, never a blur.
    function stipple(fy) {
      var sy = 1 / fy, rows = [[0.95, 1.2, 0], [0.7, 3.6, 1.5], [0.45, 6.2, 0.4]], d = '';
      rows.forEach(function (r) { d += "<ellipse cx='" + (1.2 + r[2]) + "' cy='" + (r[1] * sy).toFixed(1) + "' rx='" + r[0] + "' ry='" + (r[0] * sy).toFixed(1) + "' fill='%2333302B' fill-opacity='.62'/>"; });
      return 'url("data:image/svg+xml,' + "%3Csvg xmlns='http://www.w3.org/2000/svg' width='3.2' height='" + (9 * sy).toFixed(1) + "'%3E" + d.replace(/</g, '%3C').replace(/>/g, '%3E') + '%3C/svg%3E")';
    }

    // ---- projection / pose math ----------------------------------------------------------------------------
    sh.ox = function () { return view.scrollLeft + view.clientWidth / 2; };
    // world point → view-viewport point
    sh.project = function (x, y, z) { var ox = sh.ox(), kk = P / (P - z); return { x: ox + (x - ox) * kk - view.scrollLeft, y: sh.oy + (y - sh.oy) * kk, k: kk }; };
    // A book's pose: position offsets from its slot; about its centre: scale, then (applied first) the turn in
    // your hand, a slight roll and a tilt back toward the eye; lean about the bottom corner on the gap side;
    // and the finger's tip about the bottom-front edge.
    sh.ops = function (b, st) {
      var L = st.lean > 0 ? b.w / 2 : -b.w / 2;
      return [['t', b.cx + st.dx, sh.plankY + st.dy, st.dz], ['t', 0, -b.h / 2, -b.D / 2], ['s', st.s], ['x', st.rx], ['z', st.rz], ['y', st.ry],
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
    // Write a pose; re-ink the grazing faces and keep one pen width however close the book comes.
    sh.place = function (b, st) {
      var o = sh.ops(b, st);
      b.box.style.transform = sh.css(o);
      var M = sh.mat(o);
      b.M = M;
      var c = M.transformPoint(new DOMPoint(0, -b.h / 2, -b.D / 2)), kk = st.s * P / (P - c.z);
      var bw = Math.max(0.8, Math.min(1.5, 1.5 / kk));
      b.box.style.setProperty('--bw', f1(bw) + 'px');
      b.F.top.style.borderTopWidth = f1(edge(M.multiply(b.local.top), b.w, b.D, 'top') * bw / 1.5) + 'px';
      b.F.front.style.borderRightWidth = f1(edge(M.multiply(b.local.cov), b.D, b.h, 'right') * bw / 1.5) + 'px';
      b.F.back.style.borderLeftWidth = f1(edge(M.multiply(b.local.back), b.D, b.h, 'left') * bw / 1.5) + 'px';
      // contact: the stipple slides with the book's foot and is gone the moment the book leaves the plank
      if (b._lf !== st.lf) { b._lf = st.lf; b.F.leaf.style.transform = 'rotateY(' + (+st.lf || 0).toFixed(2) + 'deg)'; }   // the front board's hinge
      var on = st.dy > -1.5 && Math.abs(st.ry) < 3 && st.tip < 4;
      b.stip.style.transform = T3(b.cx + st.dx - b.stipW / 2, sh.plankY - 0.4, st.dz) + ' rotateX(90deg)';
      b.stip.style.opacity = on ? 1 : 0;
    };
    // A point in a book's own space (e.g. its top) → world space, under its current pose.
    // While WAAPI owns a book (open / close) its live matrix is only in computed style.
    sh.worldPoint = function (b, x, y, z) {
      var M = b.frozen ? new DOMMatrix(getComputedStyle(b.box).transform) : (b.M || sh.mat(sh.ops(b, sh.REST)));
      var q = M.transformPoint(new DOMPoint(x, y, z)); return { x: q.x, y: q.y, z: q.z };
    };
    sh.REST = { dx: 0, dy: 0, dz: 0, s: 1, rx: 0, ry: 0, rz: 0, lean: 0, tip: 0, lf: 0 };
    sh.layout = function () { layout(); sh.books.forEach(function (b) { sh.place(b, b.st || sh.REST); }); };
    sh.layout();
    // In the phone strip the eye stays put while the shelf slides past, so the grazing sides change: re-ink.
    if (opt.strip) {
      requestAnimationFrame(function () { view.scrollLeft = 0; view.classList.add('snap'); });
      var raf = 0;
      view.addEventListener('scroll', function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; sh.books.forEach(function (b) { sh.place(b, b.st || sh.REST); }); }); }, { passive: true });
    }
    return sh;
  }
  window.Shelf3D = Shelf3D;
})();
