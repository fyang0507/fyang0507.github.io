/* 01 · A — "Object becomes tab / 物归其位".
   The object you click is picked up (a 6px lift), carried on an arc by a spring (mass, one small
   overshoot, settle) and set down in its slot in the arriving page's object-tab nav. The desk recedes
   underneath it; the pen draws the folder tab once the object has landed; the title lands last.
   Back reverses the trip. Tab→tab is a real same-document View Transition: the pen outline and its
   coral dot are one named element that slides on a spring while the content swaps.
   Production: cross-document VT gives the morph for free (view-transition-name on desk object + nav
   sprite); the arc/overshoot below is what the ~40 lines of `pagereveal` JS would re-key the group with. */
(function () {
  var M = window.Motion, OBJ = MiniSite.OBJ, NAV = MiniSite.NAV, SW = MiniSite.SW;

  // the flying element: the desk drawing and the nav drawing, bottom-aligned in one box
  function makeFly(site, k) {
    var o = OBJ[k], n = NAV[k], d = o.drawn, f = o.frame;
    var bw = n[2], bh = n[3], m = bw / d[2];
    var fly = document.createElement('div');
    fly.className = 'ms-fly';
    fly.style.width = bw + 'px'; fly.style.height = bh + 'px';
    var desk = document.createElement('div');
    desk.className = 'ms-fly-desk';
    desk.style.cssText = 'left:' + ((f[0] - d[0]) * m) + 'px;top:' + (bh - (d[1] + d[3] - f[1]) * m) + 'px;width:' + (f[2] * m) + 'px;height:' + (f[3] * m) + 'px';
    desk.innerHTML = o.kind === 'cut' ? '<img src="' + o.src + '" alt="">' : '<i class="face face-' + o.kind + '"></i>';
    var nav = document.createElement('span');
    nav.className = 'site-nav-object site-nav-' + MSPages.DEST[k].sprite;
    nav.style.left = (-n[0]) + 'px'; nav.style.top = (-n[1]) + 'px';
    fly.appendChild(desk); fly.appendChild(nav);
    site.vp.appendChild(fly);
    return { el: fly, desk: desk, nav: nav, bw: bw, bh: bh };
  }

  // sampled keyframes for the carry. dir 'in' = desk → tab, 'out' = tab → desk.
  function carry(site, k, fly, dir) {
    var db = site.drawnBox(k), nb = site.navBox(k);
    var deskA = { x: db.x + db.w / 2, y: db.y + db.h }, navA = { x: nb.x + nb.w / 2, y: nb.y + nb.h };
    var sDesk = db.w / fly.bw, sNav = nb.u;
    var P0 = dir === 'in' ? deskA : navA, P2 = dir === 'in' ? navA : deskA;
    var s0 = dir === 'in' ? sDesk : sNav, s1 = dir === 'in' ? sNav : sDesk;
    var top = Math.min(P0.y, P2.y), lift = site.mobile ? 70 : 105;
    // control point sits above the high end: out of the desk, up, and *down* into the slot (or up out of it)
    var P1 = dir === 'in' ? { x: M.lerp(P0.x, P2.x, 0.62), y: top - lift } : { x: M.lerp(P0.x, P2.x, 0.3), y: top - lift };
    var sp = M.spring({ k: 95, c: 15.5 }), ss = M.spring({ k: 150, c: 23 });
    var PRE = 80, T = PRE + Math.max(sp.dur, ss.dur), N = Math.ceil(T / (1000 / 60));
    var kf = [], kd = [], kn = [], prevX = P0.x;
    for (var i = 0; i <= N; i++) {
      var t = T * i / N, tt = t - PRE;
      var p = M.at(sp, tt), q = M.at(ss, tt);
      var pre = t < PRE ? 1 - Math.pow(1 - t / PRE, 2) : Math.max(0, 1 - p * 1.6);
      var B = M.bez(P0, P1, P2, p);
      var vx = (B.x - prevX) * 60; prevX = B.x;                      // px/s → a tilt with the carry
      var th = Math.max(-7, Math.min(7, vx / 260)) * (dir === 'in' ? 1 : 0.8);
      var s = M.lerp(s0, s1, q) * (1 + 0.035 * pre);
      kf.push({ offset: i / N, transform: 'translate(' + B.x.toFixed(2) + 'px,' + (B.y - 6 * pre).toFixed(2) + 'px) rotate(' + th.toFixed(2) + 'deg) scale(' + s.toFixed(4) + ') translate(' + (-fly.bw / 2) + 'px,' + (-fly.bh) + 'px)' });
      var x = dir === 'in' ? M.smooth(0.3, 0.75, p) : 1 - M.smooth(0.25, 0.7, p);
      kd.push({ offset: i / N, opacity: +(1 - x).toFixed(3) }); kn.push({ offset: i / N, opacity: +x.toFixed(3) });
    }
    var a = fly.el.animate(kf, { duration: T, fill: 'both' });
    fly.desk.animate(kd, { duration: T, fill: 'both' }); fly.nav.animate(kn, { duration: T, fill: 'both' });
    return { anim: a, land: PRE + M.reach(sp, 0.985), T: T };
  }

  function drawTab(site, delay) {
    var p = site.placeMark(false), mark = site.q('.ms-tabmark');
    mark.classList.remove('open');
    var dot = mark.querySelector('.ms-dot'), cover = mark.querySelector('.ms-cover');
    var L = p.getTotalLength();
    var a = M.play(p, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { delay: delay, duration: 300, easing: 'cubic-bezier(.55,.1,.25,1)' });
    M.play(cover, [{ opacity: 0 }, { opacity: 1 }], { delay: delay + 250, duration: 60 });
    var pop = M.ease({ k: 320, c: 17 });
    M.play(dot, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { delay: delay + 270, duration: pop.duration, easing: pop.easing });
    return a;
  }
  // the title lands like a sheet of paper set down: from above, a small overshoot, settle
  function landTitle(site, delay) {
    var land = site.q('.ms-land'), kick = site.q('.subpage-title-kicker'), note = site.q('.subpage-note'), ab = site.q('.ms-intro--about');
    var e = M.ease({ k: 210, c: 19 });
    var h1 = site.q('.subpage-title') || land;
    if (kick) M.fadeIn(kick, delay, 160);
    if (ab) M.fadeIn(ab, delay, 160);
    M.play(h1, [{ opacity: 0, transform: 'translateY(-18px)' }, { opacity: 1, transform: 'none' }], { delay: delay + 40, duration: e.duration, easing: e.easing });
    // the hand note is written, not faded: a stepped left-to-right reveal on the hand's clock
    if (note) M.play(note, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { delay: delay + 200, duration: 420, easing: 'steps(7, end)' });
  }
  function commit(site, els) {
    els.forEach(function (el) { if (el) el.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); }); });
  }

  async function toPage(site, k) {
    site.renderPage(k);
    site.setView('both');
    var obj = site.obj(k), patch = site.patch(k), sprite = site.sprite(k), home = site.homeEl;
    var navEl = site.q('.site-index'), status = site.q('.site-header-status'), intro = site.q('.ms-intro'), strip = site.q('.ms-strip');
    sprite.style.visibility = 'hidden';
    var fly = makeFly(site, k);
    var c = carry(site, k, fly, 'in');
    obj.style.visibility = 'hidden'; if (patch) patch.style.visibility = 'visible';
    // the desk recedes (falls back a little and away) while the object is carried out of it
    // the identity lockup is identical on both pages, so only the desk itself moves
    var db = site.drawnBox(k), sb = site.rel(site.scene), deskOnly = [site.scene, site.q2('.ms-fig'), site.q2('.ms-mnav')];
    site.scene.style.transformOrigin = (db.x + db.w / 2 - sb.x) + 'px ' + (db.y + db.h / 2 - sb.y) + 'px';
    M.play(site.scene, [{ transform: 'none' }, { transform: 'translateY(10px) scale(.97)' }], { duration: 220, easing: 'cubic-bezier(.2,.6,.4,1)' });
    deskOnly.forEach(function (el) { M.play(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 190, easing: 'cubic-bezier(.2,.6,.4,1)' }); });
    M.play(navEl, [{ opacity: 0 }, { opacity: 1 }], { delay: 90, duration: 200 });
    M.fadeIn(status, 120, 200);
    M.fadeIn(strip, 190, 260);
    drawTab(site, c.land - 60);
    landTitle(site, c.land - 60);
    // control returns once the object has visibly landed; the last pixel of settle finishes on its own
    await M.sleep(c.land + 300);
    site.setView('page');
    obj.style.visibility = ''; if (patch) patch.style.visibility = '';
    site.scene.style.transformOrigin = '';
    commit(site, [home]);
    later(site, c.anim, function () { sprite.style.visibility = ''; fly.el.remove(); });
  }
  function later(site, anim, fn) {
    var done = false, finish = function () { if (!done) { done = true; fn(); } if (site.pending === finish) site.pending = null; };
    site.pending = finish;
    M.done(anim).then(finish);
  }

  async function toHome(site) {
    var k = site.dest, obj = site.obj(k), patch = site.patch(k), sprite = site.sprite(k), home = site.homeEl;
    var mark = site.q('.ms-tabmark'), path = mark.querySelector('path');
    site.setView('both');
    obj.style.visibility = 'hidden'; if (patch) patch.style.visibility = 'visible';
    var fly = makeFly(site, k);
    sprite.style.visibility = 'hidden';
    // the pen retracts faster than it drew; the dot lifts off with it
    M.play(mark.querySelector('.ms-dot'), [{ transform: 'scale(1)' }, { transform: 'scale(0)' }], { duration: 110, easing: 'ease-in' });
    M.play(mark.querySelector('.ms-cover'), [{ opacity: 1 }, { opacity: 0 }], { duration: 40 });
    var L = path.getTotalLength();
    M.play(path, [{ strokeDashoffset: 0 }, { strokeDashoffset: -L }], { duration: 170, easing: 'cubic-bezier(.4,0,.8,.4)' });
    M.play(site.q('.ms-intro'), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 150, easing: 'ease-in' });
    M.play(site.q('.ms-strip'), [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in' });
    M.play(site.q('.site-index'), [{ opacity: 1 }, { opacity: 0 }], { delay: 120, duration: 180 });
    M.fadeOut(site.q('.site-header-status'), 60, 160);
    var db = site.drawnBox(k), sb = site.rel(site.scene);
    site.scene.style.transformOrigin = (db.x + db.w / 2 - sb.x) + 'px ' + (db.y + db.h / 2 - sb.y) + 'px';
    var c = carry(site, k, fly, 'out');
    M.play(site.scene, [{ transform: 'translateY(8px) scale(.975)' }, { transform: 'none' }], { delay: 170, duration: 340, easing: 'cubic-bezier(.2,.7,.2,1)' });
    [site.scene, site.q2('.ms-fig'), site.q2('.ms-mnav')].forEach(function (el) { M.play(el, [{ opacity: 0 }, { opacity: 1 }], { delay: 170, duration: 300, easing: 'ease-out' }); });
    await M.sleep(c.land + 120);
    site.setView('home');
    later(site, c.anim, function () {
      obj.style.visibility = ''; if (patch) patch.style.visibility = '';
      fly.el.remove(); site.scene.style.transformOrigin = '';
      commit(site, [home, site.page]);
    });
  }

  // tab → tab: one named outline slides on a spring; title/strip swap underneath (pure CSS in production)
  async function tab(site, to) {
    if (!document.startViewTransition) { site.renderPage(to); return; }
    var root = document.documentElement, slide = M.ease({ k: 150, c: 17.5 }), land = M.ease({ k: 210, c: 19 });
    root.style.setProperty('--a-spring', slide.easing); root.style.setProperty('--a-dur', slide.duration + 'ms');
    root.style.setProperty('--a-land', land.easing); root.style.setProperty('--a-land-dur', land.duration + 'ms');
    var names = function (on) {
      [['.ms-tabmark', 'a-tabmark'], ['.ms-intro', 'a-title'], ['.ms-strip', 'a-strip']].forEach(function (n) {
        var el = site.q(n[0]); if (el) el.style.viewTransitionName = on ? n[1] : '';
      });
    };
    names(true);
    root.classList.add('vt-a');
    var t = document.startViewTransition(function () { site.renderPage(to); names(true); });
    try { await t.finished; } finally { root.classList.remove('vt-a'); names(false); }
  }

  window.T01A = { toPage: toPage, toHome: toHome, tab: tab };
})();
