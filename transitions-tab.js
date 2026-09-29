/* transitions-tab.js — page → page (tab to tab), the third of transitions.js's moves. Loaded `defer
   blocking="render"` just before transitions.js; transitions.js calls FYTab.run(V, A, from) at pagereveal, once the
   pseudo-tree exists, with V its toolkit (matrices, the browser's boxes, the pseudo-element animator) and A the
   browser's own animations, by pseudo-element.
   The folder tab slides on a spring while a hop is passed along the row; left from a scrolled page, the whole
   header strip rides that spring down together. */
(function () {
  'use strict';
  // held poses at 12 fps (the hand's clock): lift px, lean deg × the direction the tab is going
  var HOP = [[0, 0], [-4, 2], [-8, 3], [-5, 1], [0, 0]], HOP_BIG = [[0, 0], [-6, -2], [-13, 2], [-8, 3], [0, 0]];

  function run(V, A, from) {
    var M = V.M, dur = M.springEase.duration(150, 21), ease = M.springEase(150, 21), h = V.ends(A, 'site-head');
    var ride = function (name) {
      var g = V.ends(A, name);
      if (!g) return;
      V.kill(A, name, ['group']);
      V.pa('group', name, [{ transform: V.css(g.m0), width: g.w0 + 'px', height: g.h0 + 'px' }, { transform: V.css(g.m1), width: g.w1 + 'px', height: g.h1 + 'px' }], { duration: dur, delay: 40, easing: ease });
    };
    // Left from a scrolled page, the header starts higher than it lands: then the whole strip rides the tab's
    // spring down together (left to the browser, each part would slide on its own curve and the hops would jump)
    if (h && Math.abs(h.m1[5] - h.m0[5]) > 0.5) ['site-head', 'identity', 'site-rule'].concat(V.ORDER.map(function (k) { return 'obj-' + V.OBJ[k]; })).forEach(ride);
    ride('tabmark');
    setTimeout(function () { V.land(true); }, 40 + dur);
    var a = V.ORDER.indexOf(V.TAB[from]), b = V.ORDER.indexOf(V.TAB[V.here]), dir = b > a ? 1 : -1;
    for (var i = a, n = 0; ; i += dir, n++) { hop(V, A, V.OBJ[V.ORDER[i]], n * 65, i === b, dir); if (i === b) break; }
  }

  // the relay: each object hops on held frames at 12 fps, leaning the way the tab is going. The poses are added
  // to wherever the group is (composite add), so an object still riding the header down carries its hop with it.
  // That base keeps the group's own origin, its centre, so the pivot (the drawing's foot) is measured from there.
  function hop(V, A, o, t0, big, dir) {
    var name = 'obj-' + o, g = V.ends(A, name);
    if (!g) return;
    var K = big ? HOP_BIG : HOP, F = 83, D = t0 + F * K.length, ax = 0, ay = g.h1 / 2;
    var kf = [{ offset: 0, transform: 'none' }];
    K.forEach(function (p, i) { kf.push({ offset: (t0 + i * F) / D, transform: V.css(V.mul(V.tr(ax, ay + p[0]), V.mul(V.rot(p[1] * dir), V.tr(-ax, -ay)))) }); });
    kf.push({ offset: 1, transform: 'none' });
    V.pa('group', name, V.M.held(kf), { duration: D, composite: 'add' });
  }

  window.FYTab = { run: run };
})();
