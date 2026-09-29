/* transitions-tab.js — page → page (tab to tab), the third of transitions.js's moves. Loaded `defer
   blocking="render"` just before transitions.js, which calls FYTab.prepare(to) at pagereveal (before the
   pseudo-tree is built) and FYTab.run(V, A, from) once it exists, with V its toolkit (matrices, the browser's boxes,
   the pseudo-element animator) and A the browser's own animations, by pseudo-element.
   The folder tab slides on a spring while a hop is passed along the row, and the page arrives the way its object
   moves on the desk (design/2026-09-tab-moves): the book turns a page, the laptop prints it, the camera fires and
   the page opens out of its lens, the specimen card turns over.
   Everything that moves here is transform or opacity on the pseudo-elements, which the compositor runs on its own:
   a page busy mounting (tens of ms at a time) never stalls the tab or the page. Clips stay still (a clip-path that
   changes, width and height, additive composition and per-frame DOM drawing would all tie the move to the main
   thread; Chrome's trace says which it composited: compositeFailed 0). */
(function () {
  'use strict';
  // held poses at 12 fps (the hand's clock): lift px, lean deg × the direction the tab is going
  var HOP = [[0, 0], [-4, 2], [-8, 3], [-5, 1], [0, 0]], HOP_BIG = [[0, 0], [-6, -2], [-13, 2], [-8, 3], [0, 0]], F = 83;
  var MARKS = { building: ['edge', 'caret'], shooting: ['flash', 'kacha'] };

  // pagereveal, before the capture: the few small marks this page answers with, each its own group, placed in the
  // new page's own layout (the header is static, so it is laid out already)
  function prepare(to) {
    var tab = { writing: 'writing', reading: 'writing', building: 'building', shooting: 'shooting', about: 'about' }[to];
    (MARKS[tab] || []).forEach(function (m) {
      var e = document.createElement('i'), at = place(m);
      e.className = 'fy-tab-' + m + ' fy-live'; e.setAttribute('aria-hidden', 'true');
      if (m === 'kacha') e.innerHTML = '<span lang="zh">咔嚓</span> click!';
      if (at) e.style.transform = 'translate(' + at[0].toFixed(1) + 'px,' + at[1].toFixed(1) + 'px)';
      document.body.appendChild(e);
    });
  }
  function rule() { var r = document.querySelector('.site-rule'); return r ? r.getBoundingClientRect().top + r.offsetHeight / 2 : 0; }
  function lens() {   // the nav camera's lens, a little right of and below the sprite's centre
    var c = document.querySelector('.site-index .site-nav-camera'), b = c && c.getBoundingClientRect();
    return b ? [b.left + b.width * .52, b.top + b.height * .56] : [innerWidth - 80, rule()];
  }
  function place(m) {
    var l = lens();
    if (m === 'caret') return [Math.max(18, innerWidth * .04), rule() + 5];
    if (m === 'edge') return [0, rule()];
    if (m === 'flash') return [l[0] - 46, l[1] - 46];
    if (m === 'kacha') return [l[0] - 70, l[1] + 34];
  }

  function run(V, A, from) {
    var M = V.M, K = 150, C = 21, dur = M.springEase.duration(K, C), ease = M.springEase(K, C), h = V.ends(A, 'site-head');
    var moved = h && Math.abs(h.m1[5] - h.m0[5]) > 0.5;
    var a = V.ORDER.indexOf(V.TAB[from]), b = V.ORDER.indexOf(V.TAB[V.here]), dir = b > a ? 1 : -1, relay = {};
    for (var i = a, n = 0; ; i += dir, n++) { relay[V.OBJ[V.ORDER[i]]] = { t0: n * 65, big: i === b }; if (i === b) break; }
    // Left from a scrolled page, the header starts higher than it lands: then the whole strip rides the tab's spring
    // down together (left to the browser, each part would slide on its own curve and the hops would jump)
    var ride = function (name) {
      var g = V.ends(A, name);
      if (!g) return;
      V.kill(A, name, ['group']);
      V.pa('group', name, [frame(V, g, 0), frame(V, g, 1)], { duration: dur, delay: 40, easing: ease });
    };
    if (moved) ['site-head', 'identity', 'site-rule'].concat(V.ORDER.map(function (k) { return V.OBJ[k]; }).filter(function (o) { return !relay[o]; }).map(function (o) { return 'obj-' + o; })).forEach(ride);
    ride('tabmark');
    setTimeout(function () { V.land(true); }, 40 + dur);
    Object.keys(relay).forEach(function (o) { hop(V, A, o, relay[o], dir, moved ? spring(M, K, C, 40) : null); });
    var r = V.ends(A, 'site-rule');
    V.kill(A, 'root', ['old', 'new']);
    ANSWER[V.TAB[V.here]](V, A, { dir: dir, y0: r ? r.z0[5] + r.h0 * r.z0[3] / 2 : 0, y1: r ? r.z1[5] + r.h1 * r.z1[3] / 2 : 0 });
  }
  // a group's own box as one keyframe: width and height only when it changes size (then it cannot be composited)
  function frame(V, g, k) {
    var f = { transform: V.css(g['m' + k]) };
    if (g.w0 !== g.w1 || g.h0 !== g.h1) { f.width = g['w' + k] + 'px'; f.height = g['h' + k] + 'px'; }
    return f;
  }
  // the spring's progress at t ms (its own linear() samples, one per 60 Hz frame), after a delay
  function spring(M, k, c, delay) {
    var s = M.springEase(k, c).slice(7, -1).split(',').map(Number), n = s.length - 1;
    var p = function (t) { var i = Math.max(0, (t - delay) / 1000 * 60); if (i >= n) return 1; var j = Math.floor(i); return s[j] + (s[j + 1] - s[j]) * (i - j); };
    p.end = delay + n * 1000 / 60;   // when it has landed
    return p;
  }
  // the relay: each object hops on held frames at 12 fps, leaning the way the tab is going. The keyframes are whole
  // poses (the group's box times the hop, about the drawing's foot, measured from the group's own origin, its centre),
  // so the compositor can run them. A header still riding down carries its hops with it: sampled every frame then.
  function hop(V, A, o, r, dir, p) {
    var name = 'obj-' + o, g = V.ends(A, name);
    if (!g) return;
    var P = r.big ? HOP_BIG : HOP, D = Math.max(r.t0 + F * P.length, p ? p.end : 0), ay = g.h1 / 2;
    var pose = function (t) { var k = Math.floor((t - r.t0) / F), q = t < r.t0 || k >= P.length ? [0, 0] : P[k]; return V.mul(V.tr(0, ay + q[0]), V.mul(V.rot(q[1] * dir), V.tr(0, -ay))); };
    var at = function (t) { var m = g.m1; if (p) { var u = p(t); m = g.m0.map(function (v, i) { return v + (g.m1[i] - v) * u; }); } return V.css(V.mul(m, pose(t))); };
    var kf = [];
    if (p) { for (var t = 0; t <= D; t += 1000 / 60) kf.push({ offset: t / D, transform: at(t) }); kf.push({ offset: 1, transform: at(D) }); }
    else { kf.push({ offset: 0, transform: at(0) }); P.forEach(function (q, i) { kf.push({ offset: (r.t0 + i * F) / D, transform: at(r.t0 + i * F) }); }); kf.push({ offset: 1, transform: at(D) }); kf = V.M.held(kf); }
    V.kill(A, name, ['group']);
    V.pa('group', name, kf, { duration: D, easing: 'linear' });
  }

  var INK = '#33302B', below = function (y) { return 'inset(' + y.toFixed(1) + 'px 0 0 0)'; };
  var deep = function () { return 'perspective(' + Math.round(Math.max(innerWidth, innerHeight) * 1.6) + 'px) '; };
  var ANSWER = {
    // the book turns a page: the one you leave lifts at its outer edge and turns over about the spine (its left
    // edge), inked like a sheet, and the next page is the one beneath it
    writing: function (V, A, o) {
      var P = deep(), spine = '0px ' + ((o.y0 + innerHeight) / 2).toFixed(1) + 'px', sheet = { transformOrigin: spine, clipPath: below(o.y0), outline: '1.5px solid ' + INK, outlineOffset: '-1.5px', zIndex: 1 };
      V.pa('old', 'root', [Object.assign({ transform: P + 'rotateY(0deg)', opacity: 1 }, sheet), Object.assign({ offset: .8, opacity: 1 }, sheet), Object.assign({ transform: P + 'rotateY(-104deg)', opacity: 0 }, sheet)], { duration: 520, easing: 'cubic-bezier(.42,.02,.32,1)' });
    },
    // the laptop prints the page: it feeds down out of the rule (the slot) over the one you leave, its leading edge
    // an inked line, while the caret blinks at the slot on held frames (the hand's clock). The page moves, under a
    // clip that holds still at the rule
    building: function (V, A, o) {
      var H = innerHeight, d = 560, ez = 'cubic-bezier(.33,.1,.22,1)', lift = 'translateY(' + -(H - o.y1).toFixed(1) + 'px)', slot = below(o.y1);
      V.pa('image-pair', 'root', [{ clipPath: slot }, { clipPath: slot }], { duration: d });
      V.pa('new', 'root', [{ transform: lift, zIndex: 1 }, { transform: 'none', zIndex: 1 }], { duration: d, easing: ez });
      V.kill(A, 'tab-edge', ['new']); V.kill(A, 'tab-caret', ['new']);
      V.pa('group', 'tab-edge', [{ transform: 'translateY(' + o.y1.toFixed(1) + 'px)', opacity: 1 }, { offset: .9, opacity: 1 }, { transform: 'translateY(' + H + 'px)', opacity: 0 }], { duration: d, easing: ez });
      V.pa('group', 'tab-caret', V.M.held([{ opacity: 1 }, { opacity: .2 }, { opacity: 1 }, { opacity: .2 }, { opacity: 1 }, { opacity: 0 }]), { duration: d + 60 });
    },
    // the camera fires: one flash at the lens in the nav, 咔嚓 on held frames, and the page opens out of the lens
    shooting: function (V, A, o) {
      var l = lens(), W = innerWidth, H = innerHeight, R = Math.max(Math.hypot(l[0], H - l[1]), Math.hypot(W - l[0], H - l[1]), Math.hypot(l[0], l[1] - o.y1), Math.hypot(W - l[0], l[1] - o.y1));
      var c = ' at ' + l[0].toFixed(1) + 'px ' + l[1].toFixed(1) + 'px)', f = 'translate(' + (l[0] - 46).toFixed(1) + 'px,' + (l[1] - 46).toFixed(1) + 'px) ', k = 'translate(' + (l[0] - 70).toFixed(1) + 'px,' + (l[1] + 34).toFixed(1) + 'px) ';
      // the page grows out of the lens: it scales up from the lens inside a round clip that scales with it
      var lensAt = l[0].toFixed(1) + 'px ' + l[1].toFixed(1) + 'px', round = 'circle(' + R.toFixed(1) + 'px' + c;
      V.pa('new', 'root', [{ transform: 'scale(.04)', transformOrigin: lensAt, clipPath: round }, { transform: 'scale(1)', transformOrigin: lensAt, clipPath: round }], { duration: 560, delay: 70, easing: 'cubic-bezier(.2,.6,.2,1)' });
      V.kill(A, 'tab-flash', ['new']); V.kill(A, 'tab-kacha', ['new']);
      V.pa('group', 'tab-flash', [{ transform: f + 'scale(.12)', opacity: 1 }, { offset: .3, transform: f + 'scale(1)', opacity: 1 }, { transform: f + 'scale(1.18)', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.3,1)' });
      V.pa('group', 'tab-kacha', V.M.held([{ transform: k + 'rotate(-4deg)', opacity: 0 }, { transform: k + 'rotate(-4deg)', opacity: 1 }, { transform: k + 'translate(0,-4px) rotate(-4deg)', opacity: 1 }, { transform: k + 'translate(0,-8px) rotate(-3deg)', opacity: 1 }, { transform: k + 'translate(0,-10px) rotate(-3deg)', opacity: 0 }]), { duration: 470 });
    },
    // the portrait: the specimen card turns over where it is, and the next page is its other face
    about: function (V, A, o) {
      var P = deep(), mid = '50% ' + ((o.y0 + innerHeight) / 2).toFixed(1) + 'px';
      V.pa('old', 'root', [{ transform: P + 'rotateY(0deg)', transformOrigin: mid, clipPath: below(o.y0) }, { transform: P + 'rotateY(' + -90 * o.dir + 'deg)', transformOrigin: mid, clipPath: below(o.y0) }], { duration: 210, easing: 'cubic-bezier(.5,0,1,.6)' });
      V.pa('new', 'root', [{ transform: P + 'rotateY(' + 90 * o.dir + 'deg)', transformOrigin: mid, clipPath: below(o.y1), opacity: 0 }, { offset: .01, opacity: 1 }, { transform: P + 'rotateY(0deg)', transformOrigin: mid, clipPath: below(o.y1), opacity: 1 }], { duration: V.M.springEase.duration(210, 20), delay: 210, easing: V.M.springEase(210, 20) });
    }
  };

  window.FYTab = { prepare: prepare, run: run };
})();
