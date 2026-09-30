/* transitions-tab.js — page → page, the moves transitions.js hands on. Loaded `defer blocking="render"` first of the
   transition scripts; transitions.js calls prepare() at pagereveal (before the pseudo-tree is built) and run() once it
   exists, with V its toolkit (matrices, the browser's boxes, the pseudo-element animator, and ride below) and A the
   browser's own animations, by pseudo-element. Two parts:
   · FYTab, tab to tab: the folder tab slides on a spring while a hop is passed along the row, and the page arrives
     the way its object moves on the desk (design/2026-09-tab-moves): the book turns a page, the laptop prints it, the
     camera fires and the page opens out of its lens, the specimen card turns over.
   · FYProject, the Building board ↔ a project's pages, and a project's chapters (design/2026-09-building): below.
     It shares this file rather than a script of its own: on the local gate (vt-lcp.mjs, over HTTP/1.1) one more
     render-blocking request cost the chapters up to 56 ms of LCP, and these 8.5 KB cost Writing none.
   Everything that moves here is transform or opacity on the pseudo-elements, which the compositor runs on its own:
   a page busy mounting (tens of ms at a time) never stalls the tab or the page. Clips stay still (a clip-path that
   changes, width and height, additive composition and per-frame DOM drawing would all tie the move to the main
   thread; Chrome's trace says which it composited: compositeFailed 0). */
(function () {
  'use strict';
  // held poses at 12 fps (the hand's clock): lift px, lean deg × the direction the tab is going
  var HOP = [[0, 0], [-4, 2], [-8, 3], [-5, 1], [0, 0]], HOP_BIG = [[0, 0], [-6, -2], [-13, 2], [-8, 3], [0, 0]], F = 83;
  var MARKS = { building: ['edge', 'caret'], shooting: ['flash', 'kacha'] };

  // pagereveal, before the capture: the few small marks this page's tab answers with, each its own group, placed in
  // the new page's own layout (the header is static, so it is laid out already)
  function prepare(tab) {
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
    var go = function (name) { ride(V, A, name, dur, ease); };
    if (moved) ['site-head', 'identity', 'site-rule'].concat(V.ORDER.map(function (k) { return V.OBJ[k]; }).filter(function (o) { return !relay[o]; }).map(function (o) { return 'obj-' + o; })).forEach(go);
    go('tabmark');
    setTimeout(function () { V.land(true); }, 40 + dur);
    Object.keys(relay).forEach(function (o) { hop(V, A, o, relay[o], dir, moved ? spring(M, K, C, 40) : null); });
    var r = V.ends(A, 'site-rule');
    V.kill(A, 'root', ['old', 'new']);
    ANSWER[V.TAB[V.here]](V, A, { dir: dir, y0: r ? r.z0[5] + r.h0 * r.z0[3] / 2 : 0, y1: r ? r.z1[5] + r.h1 * r.z1[3] / 2 : 0 });
  }
  // one part of the header carried from its old box to its new one on a spring (dur, ease), 40 ms in
  function ride(V, A, name, dur, ease) {
    var g = V.ends(A, name);
    if (!g) return;
    V.kill(A, name, ['group']);
    V.pa('group', name, [frame(V, g, 0), frame(V, g, 1)], { duration: dur, delay: 40, easing: ease });
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

  window.FYTab = { prepare: prepare, run: run, ride: ride };
})();

/* ---- FYProject: the Building board ↔ a project's pages (building/<id>/), and a project's chapters
   (design/2026-09-building, candidate C, PORT-PLAN §8). transitions.js hands it every move between the board and a
   project's page, or between two of its pages:
     in       board → page: the index tabs you touched (the dossier's in your hand, or the ones peeking behind the card
              whose own link you took) travel to the page's fore-edge, out from under the card on springs 26 ms apart,
              and the paper swaps under them
     out      page → board: the page's tabs tuck back behind the card the board has brought into view, under it from
              the first frame; the board then pushes its pin in (board.js)
     chapter  page → page: the tabs settle on a spring, and the sheet in front is pulled aside to the left (a later
              chapter) or put back from the left (an earlier one)
   From a scrolled page the header rides down on the tab moves' spring (V.ride). The card in play is its own group,
   pj-card, above the tabs' (transitions.css), and so is the dossier's sheet in your hand, pj-sheet, so a tab under
   either at rest is under it in every frame; they hold still and cross with the page they belong to, on the paper
   swap's timing. A chapter move needs no card: nothing covers a tab at rest on a project page. A tab travels at its
   own size, never stretched (carry()). Everything that moves is transform or opacity; a clip is set but holds still.
   Names go on with classes, only for the move they travel in: .fy-vt-tabs on the tabs in play, on the board
   .fy-vt-card on their card and .fy-vt-sheet on the dossier's sheet in your hand (board.js), on a project page
   .fy-vt-tabs on its fore-edge (swap() and prepare() here); a page back from the back/forward cache has its stale
   ones taken off at pagereveal, before anything else runs.
   FYProject: move(from, to, rec) → 'in' | 'out' | 'chapter' | null · swap(rec, url) adds rec.pj (this page's project
   id and chapter n, where you are going: to and m) · prepare(kind, vt) · run(V, A, kind, rec) · id(url), the project
   a URL on this site belongs to. ---- */
(function () {
  'use strict';
  var hl = document.querySelector('.site-home'), ROOT = (hl ? new URL(hl.href) : location).pathname.replace(/[^/]*$/, '');
  // the project a URL belongs to: building/<id>/… under the site root (the home link's directory)
  function id(url) {
    var u;
    try { u = new URL(url, location.href); } catch (e) { return null; }
    var m = u.origin === location.origin && u.pathname.indexOf(ROOT) === 0 && /^building\/([^/]+)\//.exec(u.pathname.slice(ROOT.length));
    return m ? m[1] : null;
  }
  var ID = id(location.href);
  // this page's chapters, its fore-edge tabs in order: which one a URL is (a folder is its index.html), which is this
  function tabs() { return [].slice.call(document.querySelectorAll('.pj-tabs > .dos-tab')); }
  function path(url) { return new URL(url, location.href).pathname.replace(/index\.html$/, ''); }
  function chapter(url) { var p = path(url); return tabs().findIndex(function (a) { return path(a.href) === p; }); }
  function name(on) { var t = document.querySelector('.pj-tabs'); if (t) t.classList.toggle('fy-vt-tabs', on); }

  function move(from, to, rec) {
    if (from === 'building' && to === 'project') return 'in';
    if (from === 'project' && to === 'building') return 'out';
    var p = rec && rec.pj;   // two chapters of one project
    return from === 'project' && to === 'project' && p && p.id === p.to && p.n >= 0 && p.m >= 0 && p.n !== p.m ? 'chapter' : null;
  }
  // pageswap, on a project page: the chapter you leave and the one you go to, and the fore-edge named if it travels
  function swap(rec, url) {
    if (!ID || !url) return;
    rec.pj = { id: ID, n: tabs().findIndex(function (a) { return a.getAttribute('aria-current') === 'page'; }), to: id(url), m: chapter(url) };
    if (move(rec.from, rec.to, rec)) name(true);
  }
  // pagereveal, before the capture: the page you land on names its fore-edge (on the board, board.js names the card)
  function prepare(kind, vt) {
    if (kind === 'out') return;
    name(true);
    vt.finished.then(function () { name(false); }, function () { name(false); });
  }
  addEventListener('pagereveal', function () {
    [].forEach.call(document.querySelectorAll('.fy-vt-tabs, .fy-vt-card, .fy-vt-sheet'), function (n) { n.classList.remove('fy-vt-tabs', 'fy-vt-card', 'fy-vt-sheet'); });
  });

  /* ---- the moves ---- */
  var OUT = function () { return { duration: 120, easing: 'cubic-bezier(.4,0,1,1)' }; }, IN = function () { return { duration: 200, delay: 70, easing: 'cubic-bezier(0,0,.2,1)' }; };
  var TABS = { in: [170, 20, 26], out: [190, 22, 18], chapter: [260, 22, 0] };   // the tabs' spring (k, c) and relay (ms)
  // a matrix about the origin (0, 0) written for a box's own transform-origin, its centre (V.ends's z, undone)
  function centred(V, m, w, h) { return V.mul(V.tr(-w / 2, -h / 2), V.mul(m, V.tr(w / 2, h / 2))); }
  // A tab is paper: it travels at its own size and never stretches. Its group keeps the new box and is carried from
  // the old tab's place, the two lined up on their attached (left) edge and their middle; the old image, which
  // transitions.css stretches to the group, is scaled back to its own box, still. Only transforms (and the browser's
  // own crossfade) move, so the compositor runs it all.
  function carry(V, A, name, k, c, delay) {
    var g = V.ends(A, name);
    if (!g) return;
    var dy = (g.h1 - g.h0) / 2, dur = V.M.springEase.duration(k, c), own = centred(V, [g.w0 / g.w1, 0, 0, g.h0 / g.h1, 0, dy], g.w1, g.h1);
    V.kill(A, name, ['group']);
    V.pa('group', name, [{ transform: V.css(centred(V, V.mul(g.z0, V.tr(0, -dy)), g.w1, g.h1)) }, { transform: V.css(g.m1) }], { duration: dur, delay: delay, easing: V.M.springEase(k, c) });
    V.pa('old', name, [{ transform: V.css(own) }, { transform: V.css(own) }], { duration: dur + delay });
  }
  // the page you leave is nearly gone before the next comes up; the card in play (and the dossier's sheet, in your
  // hand) holds still and crosses with its own page, part: 'old' leaving the board, 'new' coming back to it
  function paper(V, A, part) {
    ['root', 'pj-card', 'pj-sheet'].forEach(function (name) {
      if (name !== 'root' && !A['::view-transition-' + part + '(' + name + ')']) return;
      V.kill(A, name, ['old', 'new']);
      if (name === 'root' || part === 'old') V.pa('old', name, [{ opacity: 1 }, { opacity: 0 }], OUT());
      if (name === 'root' || part === 'new') V.pa('new', name, [{ opacity: 0 }, { opacity: 1 }], IN());
    });
  }
  // the sheet in front, below the rule (a clip that holds still): pulled aside to a later chapter, put back to an earlier
  function pull(V, A, later) {
    var r = document.querySelector('.site-rule'), y = r ? r.getBoundingClientRect().top + r.offsetHeight / 2 : 0;
    var slot = 'inset(' + y.toFixed(1) + 'px 0 0 0)', aside = 'translateX(' + (-innerWidth * 1.04).toFixed(1) + 'px) rotate(-2deg)';
    V.kill(A, 'root', ['old', 'new']);
    V.pa('image-pair', 'root', [{ clipPath: slot }, { clipPath: slot }], { duration: 560 });
    if (later) V.pa('old', 'root', [{ transform: 'none', zIndex: 1 }, { transform: aside, zIndex: 1 }], { duration: 440, easing: 'cubic-bezier(.5,0,.75,.4)' });
    else V.pa('new', 'root', [{ transform: aside, zIndex: 1 }, { transform: 'none', zIndex: 1 }], { duration: V.M.springEase.duration(150, 21), easing: V.M.springEase(150, 21) });
  }
  function run(V, A, kind, rec) {
    var M = V.M, h = V.ends(A, 'site-head'), t = TABS[kind];
    // left from a scrolled page the header starts higher than it lands: the whole strip rides the tab moves' spring
    if (h && Math.abs(h.m1[5] - h.m0[5]) > 0.5) ['site-head', 'identity', 'site-rule', 'tabmark'].concat(V.ORDER.map(function (o) { return 'obj-' + V.OBJ[o]; }))
      .forEach(function (n) { V.ride(V, A, n, M.springEase.duration(150, 21), M.springEase(150, 21)); });
    for (var n = 1; n <= 5; n++) carry(V, A, 'pj-tab-' + n, t[0], t[1], t[2] * (n - 1));
    if (kind === 'chapter') pull(V, A, rec.pj.m > rec.pj.n); else paper(V, A, kind === 'in' ? 'old' : 'new');
  }

  window.FYProject = { id: id, move: move, swap: swap, prepare: prepare, run: run };
})();
