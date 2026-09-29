/* r2-01 · per-frame rendering: channel values (r2-01-a.js) → transforms, opacities, SVG paths.
   Only transform, opacity, clip-path and stroke-dashoffset change per frame, plus the one rule path. */
(function () {
  var X = Phys, D = R2Desk, INK = [51, 48, 43];
  function px(v) { return v.toFixed(2) + 'px'; }
  function steps(v, n) { return Math.floor(X.clamp(v, 0, 1) * n + 1e-6) / n; }

  // geometry for this layout: desk anchors, nav anchors, the edge and the rule, the tabs
  function measure(site) {
    var g = { desk: {}, nav: {}, tabs: {} }, sc = site.sceneBox(), ix = site.indexBox();
    g.scene = sc;
    Object.keys(D.OBJ).forEach(function (k) {
      var db = site.drawnBox(k), nb = site.navBox(k), n = D.NAV[k];
      g.desk[k] = { x: db.x + db.w / 2, y: db.y + db.h, s: db.w / n[2] };
      g.nav[k] = { x: nb.x + nb.w / 2, y: nb.y + nb.h, s: nb.u };
      var t = site.tabBox(k); g.tabs[k] = { x: t.x, y: t.y, w: t.w, h: t.h, lx: t.x - ix.x };
    });
    g.edge = D.EDGE.map(function (p) { return { u: p[0] / D.SW, y: sc.y + p[1] * sc.k }; });
    g.e0 = sc.x; g.e1 = sc.x + sc.w; g.ew = D.EDGE_W * sc.k;
    g.rule = { x0: ix.x, x1: ix.x + ix.w, y: ix.y + ix.h - 0.75 };
    g.edgeYL = 913.1 * sc.k;                    // the edge in scene-local px: the table folds into it
    g.ix = ix;
    return g;
  }
  function edgeY(g, u) {
    var e = g.edge;
    for (var i = 1; i < e.length; i++) if (u <= e[i].u) return X.lerp(e[i - 1].y, e[i].y, (u - e[i - 1].u) / (e[i].u - e[i - 1].u));
    return e[e.length - 1].y;
  }
  // the line where it is now: ends, the drawn wobble fading as it straightens, and a sag from its own speed
  function lineAt(site) {
    var st = site.st, g = st.g, r = st.line.x, rr = X.clamp(r, 0, 1);
    var x0 = X.lerp(g.e0, g.rule.x0, rr), x1 = X.lerp(g.e1, g.rule.x1, rr), rise = edgeY(g, 0.5) - g.rule.y;
    // the middle lags its ends (a line pulled up by both ends), but only once the table has let go of it
    var sag = X.clamp(st.line.v * rise * 0.02, -rise * 0.09, rise * 0.09) * X.smooth(0.55, 1, st.fold.x);
    var base = function (u) { return X.lerp(edgeY(g, u), g.rule.y, r); };
    return { x0: x0, x1: x1, r: r, rr: rr, sag: sag, base: base, y: function (u) { return base(u) + sag * 4 * u * (1 - u); } };
  }

  function flies(site) {
    var st = site.st;
    Object.keys(st.bodies).forEach(function (k) {
      var b = st.bodies[k], f = st.flies[k], P = b.pos(), s = b.scale(), gd = st.g.desk[k], gn = st.g.nav[k];
      var hop = st.hopY[k] || [0, 0];
      var th = b.idle() ? 0 : X.clamp(b.vx / 240, -7, 7) * (st.view === 'page' ? 1 : 0.6);
      th += hop[1];
      f.el.style.transform = 'translate(' + px(P.x) + ',' + px(P.y + hop[0]) + ')' + (th ? ' rotate(' + th.toFixed(2) + 'deg)' : '');
      f.desk.style.transform = 'scale(' + (s / gd.s).toFixed(5) + ')';
      f.nav.style.transform = 'scale(' + s.toFixed(5) + ')';
      var x = gd.s === gn.s ? 1 : X.clamp((gd.s - s) / (gd.s - gn.s), 0, 1), n = X.smooth(0.48, 0.64, x);
      f.nav.style.opacity = n.toFixed(3); f.desk.style.opacity = (1 - n).toFixed(3);
    });
  }

  function rule(site) {
    var st = site.st, L = lineAt(site), svg = site.over.querySelector('.r2-rule'), g = st.g;
    var pa = svg.querySelector('.a'), pb = svg.querySelector('.b');
    var gap = st.gap.x, tabW = g.tabs[site.dest].w, cx = st.tabx.x + g.ix.x + tabW / 2;
    var gl = cx - gap * tabW / 2, gr = cx + gap * tabW / 2, N = 28, A = [], B = [];
    for (var i = 0; i <= N; i++) {
      var u = i / N, x = X.lerp(L.x0, L.x1, u), y = L.y(u);
      if (gap <= 0.001 || x <= gl) A.push([x, y]); else if (x >= gr) B.push([x, y]);
    }
    if (gap > 0.001) {                           // cut exactly at the tab's edges
      var yl = L.y((gl - L.x0) / (L.x1 - L.x0)), yr = L.y((gr - L.x0) / (L.x1 - L.x0));
      if (gl > L.x0 && gl < L.x1) A.push([gl, yl]);
      if (gr > L.x0 && gr < L.x1) B.unshift([gr, yr]);
    }
    var d = function (pts) { return pts.length > 1 ? (Math.abs(L.sag) < 0.05 && L.rr > 0.999 ? 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2) + ' L' + pts[pts.length - 1][0].toFixed(2) + ' ' + pts[pts.length - 1][1].toFixed(2) : Pen.smooth(pts)) : ''; };
    pa.setAttribute('d', d(A)); pb.setAttribute('d', d(B));
    var c = INK.map(function (v, i) { return Math.round(X.lerp(D.EDGE_RGB[i], v, L.rr)); });
    svg.style.stroke = 'rgb(' + c.join(',') + ')';
    svg.style.strokeWidth = X.lerp(g.ew, 1.5, L.rr).toFixed(3);
  }

  // the table hangs from its front edge: it follows the line, stretches with it and folds up into it
  function table(site) {
    var st = site.st, g = st.g, L = lineAt(site), f = st.fold.x, el = site.qh('.r2-table');
    var yL = L.base(0.5) - g.scene.y, sx = (L.x1 - L.x0) / g.scene.w;
    el.style.transform = 'translate(' + px(L.x0 - g.scene.x) + ',' + px(yL + st.thud.x) + ') scale(' + sx.toFixed(4) + ',' + (1 - f).toFixed(4) + ') translateY(' + px(-g.edgeYL) + ')';
    el.style.opacity = (1 - X.smooth(0.5, 0.94, f)).toFixed(3);
  }
  function props(site) {
    var st = site.st;
    Object.keys(st.props).forEach(function (k) {
      var p = st.props[k];
      p.el.style.transform = 'translateY(' + px(p.dy.x + (p.dy.idle && p.dy.x === 0 ? st.thud.x : 0)) + ') rotate(' + p.rot.x.toFixed(2) + 'deg)';
      p.el.style.opacity = X.clamp(p.al.x, 0, 1).toFixed(3);
      if (p.face) { p.face.style.backgroundPosition = (p.frame * 20) + '% 0'; p.face.style.clipPath = p.frame ? 'inset(0 0 19% 0)' : ''; }  // airborne: no ground line
    });
  }
  function home(site) {
    var st = site.st, v = st.arrows.x;
    st.arrowEls.forEach(function (a, i) {
      var gi = Math.floor(i / 2), w = X.clamp(v * 1.6 - gi * 0.2, 0, 1);  // the four arrows land one after another
      a.el.style.strokeDashoffset = (st.arrowDir > 0 ? (1 - w) * a.L : -(1 - w) * a.L).toFixed(1);
    });
    site.homeEl.querySelectorAll('.ms-note').forEach(function (n) { n.style.opacity = st.notes.x.toFixed(3); });
    ['.ms-mnav', '.ms-fig'].forEach(function (s) { var e = site.qh(s); if (e) e.style.opacity = st.chrome.x.toFixed(3); });
  }

  function page(site) {
    var st = site.st, g = st.g;
    if (site.mobile) site.q('.site-identity').style.translate = '0 ' + px((1 - X.clamp(st.line.x, 0, 1)) * 6);
    site.q('.site-header-status').style.opacity = st.status.x.toFixed(3);
    Object.keys(st.labels).forEach(function (k) { site.q('.site-tab--' + k + ' .site-nav-label').style.opacity = (0.62 * st.labels[k].x).toFixed(3); });
    // "home" peeks up from behind the rule on held frames (hand's clock), and ducks the same way
    var pk = site.q('.site-home-object'), dd = (1 - steps(st.peek.x, 3)) * 60, sc = site.mobile ? 0.72 : 1;
    pk.style.translate = '0 ' + (dd * sc).toFixed(1) + 'px';
    pk.style.clipPath = 'inset(0 0 ' + dd.toFixed(1) + 'px 0)';
    site.q('.site-home .site-nav-label').style.opacity = (0.76 * steps(st.peek.x, 3)).toFixed(3);
    // the pen's folder tab: drawn in one pass, dot popped after, slid along on tab→tab
    var mark = site.q('.ms-tabmark'), path = mark.querySelector('path');
    if (st.markL) {
      var pv = st.pen.x;
      path.style.strokeDashoffset = (st.penDir > 0 ? (1 - pv) * st.markL : -(1 - pv) * st.markL).toFixed(2);
      mark.style.transform = 'translateX(' + px(st.tabx.x) + ')';
      mark.querySelector('.ms-dot').style.transform = 'scale(' + Math.max(0, st.dot.x).toFixed(3) + ')';
    }
    var intro = site.q('.ms-intro'), land = site.q('.ms-land') || intro, kick = site.q('.subpage-title-kicker'), note = site.q('.subpage-note');
    var tv = st.title.x;
    if (land) { land.style.transform = 'translateY(' + px((1 - tv) * -18) + ')'; land.style.opacity = X.smooth(0, 0.3, tv).toFixed(3); }
    if (kick) kick.style.opacity = X.smooth(0, 0.5, tv).toFixed(3);
    if (site.dest === 'about' && intro) intro.style.opacity = X.smooth(0, 0.5, tv).toFixed(3);
    if (note) note.style.clipPath = 'inset(0 ' + ((1 - steps(st.note.x, 7)) * 100).toFixed(1) + '% 0 0)';
    var strip = site.q('.ms-strip');
    if (strip && site.dest !== 'about') strip.style.opacity = st.strip.x.toFixed(3);
    if (strip && site.dest === 'about') { strip.style.opacity = st.strip.x.toFixed(3); }
    st.ghosts.forEach(function (gh) { gh.el.style.opacity = gh.c.x.toFixed(3); });
  }

  function all(site) {
    flies(site); rule(site); table(site); props(site); home(site); page(site);
    if (site.cfg.director.extra) site.cfg.director.extra(site);
  }
  // once still, hand the only hover-driven property back to CSS. Resting transforms stay on purpose: in the
  // scaled stage an element with an identity transform rasterises differently from one without, so
  // clearing them would be exactly the seam this board exists to avoid.
  function clear(site) {
    site.page.querySelectorAll('.site-tab .site-nav-label').forEach(function (e) { e.style.opacity = ''; });
  }

  window.R2Render = { measure: measure, all: all, clear: clear, lineAt: lineAt, steps: steps };
})();
