/* r2-01 · B — "…and the window stays / 窗留下".
   Everything in A, plus round 1's B folded in: the clicked object's surface (the laptop's blank screen,
   the book's open spread, the portrait's picture, the camera's lens) is a window onto the destination.
   When the object is lifted away, its window stays where it was and grows into the page, about one fixed
   point (the dolly, reversed: the page comes out of the object instead of the camera pushing in). Home runs
   it backwards: the page drains back into the surface the object is falling onto.
   The destination is the real .ms-main, zoomed and clipped; the object's surface is cut out of its drawing
   (tools/r2-01-cut.py r2-01-hole-*) only while it is a window. */
(function () {
  var X = Phys, D = R2Desk;

  function holed(site, k, on) {
    var f = site.st.flies[k], o = D.OBJ[k], face = f.desk.firstChild;
    if (o.kind === 'cut') face.src = on ? o.hole : o.src; else face.classList.toggle('holed', on);
  }
  // the surface in vp px (polygon or circle), and the untransformed main box it opens into
  function geo(site, k) {
    var o = D.OBJ[k], sc = site.sceneBox(), m = site.main;
    var t = m.style.transform, c = m.style.clipPath; m.style.transform = 'none'; m.style.clipPath = 'none';
    var M = site.rel(m); m.style.transform = t; m.style.clipPath = c;
    var g = { M: M }, pts;
    if (o.circle) {
      g.c = { x: sc.x + o.circle[0] * sc.k, y: sc.y + o.circle[1] * sc.k }; g.r = o.circle[2] * sc.k;
      pts = [{ x: g.c.x - g.r, y: g.c.y - g.r }, { x: g.c.x + g.r, y: g.c.y + g.r }];
    } else pts = g.pts = o.canvas.map(function (p) { return { x: sc.x + p[0] * sc.k, y: sc.y + p[1] * sc.k }; });
    var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
    var S = { x: Math.min.apply(0, xs), y: Math.min.apply(0, ys) }; S.w = Math.max.apply(0, xs) - S.x; S.h = Math.max.apply(0, ys) - S.y;
    g.m0 = Math.max(S.w / M.w, S.h / M.h);                        // the page, small enough to fill the surface
    var cS = { x: S.x + S.w / 2, y: S.y + S.h / 2 }, cM = { x: M.x + M.w / 2, y: M.y + M.h / 2 };
    g.F = { x: (g.m0 * cM.x - cS.x) / (g.m0 - 1), y: (g.m0 * cM.y - cS.y) / (g.m0 - 1) };   // the one fixed point
    // the rectangle's matching vertices for the surface outline to open into (local px of the main)
    var W = M.w, H = M.h;
    g.full = g.pts && g.pts.length === 6 ? [[0, 0], [W / 2, 0], [W, 0], [W, H], [W / 2, H], [0, H]] : [[0, 0], [W, 0], [W, H], [0, H]];
    return g;
  }
  function window_(site) {
    var st = site.st, g = st.win && st.winG, m = site.main;
    if (!g) return;
    var w = X.clamp(st.win.x, -0.05, 1.02), s = Math.pow(g.m0, 1 - w), M = g.M;
    if (w >= 1 && st.win.idle) { m.style.transform = 'none'; m.style.clipPath = 'none'; m.style.background = ''; m.style.opacity = ''; return; }
    // p_vp = F + (p_local_abs − F)·s  ⇒  translate so the main zooms about F
    var tx = (g.F.x - M.x) * (1 - s), ty = (g.F.y - M.y) * (1 - s);
    m.style.transformOrigin = '0 0';
    m.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + s.toFixed(5) + ')';
    var loc = function (p) { return { x: g.F.x - M.x + (p.x - g.F.x) / s, y: g.F.y - M.y + (p.y - g.F.y) / s }; };
    var e = X.smooth(0, 0.55, w);                                  // the outline opens to the full page early
    if (g.pts) {
      m.style.clipPath = 'polygon(' + g.pts.map(function (p, i) {
        var a = loc(p), b = g.full[i];
        return X.lerp(a.x, b[0], e).toFixed(1) + 'px ' + X.lerp(a.y, b[1], e).toFixed(1) + 'px';
      }).join(',') + ')';
    } else {
      var c = loc(g.c), r0 = g.r / s, r1 = Math.hypot(M.w, M.h) / 2 + 4;
      m.style.clipPath = 'circle(' + X.lerp(r0, r1, e).toFixed(1) + 'px at ' + X.lerp(c.x, M.w / 2, e).toFixed(1) + 'px ' + X.lerp(c.y, M.h / 2, e).toFixed(1) + 'px)';
    }
    m.style.background = 'var(--paper)';                           // a window is opaque: it hides the desk it covers
    m.style.opacity = st.view === 'page' ? '1' : X.smooth(0, 0.12, w).toFixed(3);   // going home, the last sliver drains out inside the surface
  }

  window.R2B = R2Director({
    portal: false,
    init: function (site) { site.st.win = new X.Chan(0); site.st.winG = null; },
    snap: function (site, v) { site.st.win.set(v === 'page' ? 1 : 0); },
    toPage: function (site, k) {
      var st = site.st;
      if (!st.winG || st.winK !== k || st.win.x <= 0.001) { st.winK = k; st.winG = geo(site, k); st.win.set(0); holed(site, k, true); }
      st.win.go(1, 'chase', { k: 190, c: 25, dur: 400 }, 70);
      st.title.set(1); st.note.set(1); st.strip.set(1);           // the whole page is in the window already
    },
    toHome: function (site) {
      var st = site.st, k = site.dest;
      if (!st.winG || st.winK !== k) { st.winK = k; st.winG = geo(site, k); st.win.set(1); }
      holed(site, k, true);
      st.win.go(0, 'chase', { k: 170, c: 24, dur: 440 }, 40);
      st.title.set(1); st.note.set(1); st.strip.set(1);
    },
    tick: function (site, dt) { var w = site.st.win; w.step(dt); return !w.idle; },
    extra: window_,
    rest: function (site) {
      var st = site.st;
      Object.keys(st.flies).forEach(function (k) { holed(site, k, false); });
      if (st.win.x <= 0 || st.win.x >= 1) { st.winG = null; ['transform', 'clipPath', 'background', 'opacity'].forEach(function (p) { site.main.style[p] = ''; }); }
    }
  });
})();
