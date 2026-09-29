/* 01 · B — "Dolly into the object / 推镜入物".
   One camera, one fixed point. The scene scales by K about F while the destination page — already
   playing inside the object's canvas (the laptop's blank screen, the book's open spread, the frame's
   picture, the camera's lens) — scales by 1/K → 1 about the same F. Because both share F, the page stays
   glued inside the canvas for the whole push. F is solved so the canvas lands centred. Then the canvas
   opens to the full page (clip-path). Back pulls out along the same line; tab→tab trucks the camera. */
(function () {
  var M = window.Motion, OBJ = MiniSite.OBJ, ORDER = MSPages.ORDER;

  function geometry(site, k) {
    var c = OBJ[k].canvas, W = site.W, H = site.H, g = { W: W, H: H };
    if (c.circle) {
      var p = site.scenePt(c.circle[0], c.circle[1]);
      g.c0 = { x: p.x, y: p.y }; g.r = c.circle[2] * p.k;
      g.K = (Math.min(W, H) * 0.46) / g.r;
    } else {
      g.pts = c.pts.map(function (q) { var p = site.scenePt(q[0], q[1]); return { x: p.x, y: p.y }; });
      var xs = g.pts.map(function (p) { return p.x; }), ys = g.pts.map(function (p) { return p.y; });
      var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
      g.c0 = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
      g.K = Math.min(W / (x1 - x0), H / (y1 - y0));
    }
    // fixed point of the zoom: canvas centre c0 must land on the viewport centre at scale K
    g.F = { x: (g.K * g.c0.x - W / 2) / (g.K - 1), y: (g.K * g.c0.y - H / 2) / (g.K - 1) };
    var loc = function (p) { return { x: g.F.x + (p.x - g.F.x) * g.K, y: g.F.y + (p.y - g.F.y) * g.K }; };
    if (g.pts) {
      var n = g.pts.length;
      g.clipFrom = poly(g.pts.map(loc));
      var full = n === 4 ? [[0, 0], [W, 0], [W, H], [0, H]] : [[0, 0], [W / 2, 0], [W, 0], [W, H], [W / 2, H], [0, H]];
      g.clipTo = poly(full.map(function (p) { return { x: p[0], y: p[1] }; }));
    } else {
      var cc = loc(g.c0);
      g.clipFrom = 'circle(' + (g.r * g.K).toFixed(1) + 'px at ' + cc.x.toFixed(1) + 'px ' + cc.y.toFixed(1) + 'px)';
      g.clipTo = 'circle(' + (Math.hypot(W, H) / 2 + 4).toFixed(1) + 'px at ' + (W / 2) + 'px ' + (H / 2) + 'px)';
    }
    return g;
  }
  function poly(pts) { return 'polygon(' + pts.map(function (p) { return p.x.toFixed(1) + 'px ' + p.y.toFixed(1) + 'px'; }).join(',') + ')'; }

  // the push: log-space scale so the camera moves at a constant perceived speed
  function push(site, g, out) {
    var sp = out ? M.spring({ k: 150, c: 25 }) : M.spring({ k: 200, c: 25 });
    var T = sp.dur, N = Math.ceil(T / (1000 / 60)), kh = [], kp = [];
    for (var i = 0; i <= N; i++) {
      var t = T * i / N, e = M.at(sp, t);
      if (out) e = 1 - e;
      var s = Math.pow(g.K, e), off = i / N;
      kh.push({ offset: off, transform: 'scale(' + s.toFixed(4) + ')', opacity: +(1 - M.smooth(0.68, 1, e)).toFixed(3) });
      kp.push({ offset: off, transform: 'scale(' + (s / g.K).toFixed(5) + ')', opacity: +(out ? M.smooth(0.02, 0.28, e) : M.smooth(0, 0.14, e)).toFixed(3) });
    }
    var origin = g.F.x.toFixed(1) + 'px ' + g.F.y.toFixed(1) + 'px';
    site.homeEl.style.transformOrigin = origin; site.page.style.transformOrigin = origin;
    var a = site.homeEl.animate(kh, { duration: T, fill: 'both' });
    site.page.animate(kp, { duration: T, fill: 'both' });
    return { anim: a, T: T, sp: sp };
  }
  function openCanvas(site, g, delay, reverse) {
    var e = reverse ? { easing: 'cubic-bezier(.5,0,.8,.3)', duration: 220 } : M.ease({ k: 170, c: 24 });
    var kf = reverse ? [{ clipPath: g.clipTo }, { clipPath: g.clipFrom }] : [{ clipPath: g.clipFrom }, { clipPath: g.clipTo }];
    return site.page.animate(kf, { delay: delay, duration: e.duration, easing: e.easing, fill: 'both' });
  }
  function reset(site) {
    [site.homeEl, site.page].forEach(function (el) {
      el.getAnimations().forEach(function (a) { a.cancel(); });
      el.style.transformOrigin = ''; el.style.clipPath = '';
    });
    site.vp.classList.remove('b-top');
  }

  async function toPage(site, k) {
    site.renderPage(k);
    site.setView('both'); site.vp.classList.add('b-top');
    var g = geometry(site, k);
    site.page.style.clipPath = g.clipFrom;
    var p = push(site, g, false);
    var o = openCanvas(site, g, Math.round(p.T * 0.62), false);
    await M.done(p.anim); await M.done(o);
    site.setView('page'); reset(site);
  }
  async function toHome(site) {
    var k = site.dest;
    site.setView('both'); site.vp.classList.add('b-top');
    var g = geometry(site, k);
    // start exactly where the push ended: page full, scene at K behind it
    site.homeEl.animate([{ transform: 'scale(' + g.K + ')', opacity: 0 }], { duration: 1, fill: 'forwards' });
    var o = openCanvas(site, g, 0, true);
    await M.done(o);
    site.homeEl.getAnimations().forEach(function (a) { a.cancel(); });
    var p = push(site, g, true);
    await M.done(p.anim);
    site.setView('home'); reset(site);
  }
  // tab → tab: the camera trucks sideways in tab order. Old and new content sit side by side on one
  // rigid strip and move together, so there is never a double exposure — the viewport edge does the cut.
  async function tab(site, to) {
    var from = site.dest, dir = ORDER.indexOf(to) > ORDER.indexOf(from) ? 1 : -1;
    var old = site.q('.ms-main'), r = site.rel(old), ghost = old.cloneNode(true);
    ghost.style.cssText = 'position:absolute;margin:0;left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px;z-index:5';
    site.renderPage(to);
    site.vp.appendChild(ghost);
    var fresh = site.q('.ms-main'), D = site.W, e = M.ease({ k: 120, c: 20 });
    var o = { duration: e.duration, easing: e.easing, fill: 'both' };
    var g = ghost.animate([{ transform: 'none' }, { transform: 'translateX(' + (-dir * D) + 'px)' }], o);
    var f = fresh.animate([{ transform: 'translateX(' + (dir * D) + 'px)' }, { transform: 'none' }], o);
    await M.done(f); await M.done(g);
    ghost.remove(); fresh.getAnimations().forEach(function (a) { a.cancel(); });
  }

  window.T01B = { toPage: toPage, toHome: toHome, tab: tab };
})();
