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
   FYProject: root, the site root (the home link's directory) · id(url), the project a URL on this site belongs to ·
   move(from, to, rec) → 'in' | 'out' | 'chapter' | null · swap(rec, url) adds rec.pj (this page's project id and
   chapter n, where you are going: to and m) · prepare(kind, vt) · run(V, A, kind, rec). transitions.js resolves every
   page with root and id. ---- */
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

  window.FYProject = { root: ROOT, id: id, move: move, swap: swap, prepare: prepare, run: run };
})();

/* ---- FYBook: Writing ↔ Reading, the book in your hand and its essay (design/2026-10-essays, candidate B: the cover becomes the plate).
   The obi slips off the book's foot and the cover opens out into the essay's plate (the frame grows from the board to the
   plate's band, the photo inside it staying one photo), then the frame lifts off the essay. The board does not swing open
   (pull.js): the page goes once the book is square to you. Back (and "← all writing", which is Back when you came from the
   shelf) is the same move reversed, onto the book still in your hand, and then the shelf puts the book back. Anywhere
   else Writing ↔ Reading is the paper swap. What keeps it from flashing: the page you arrive at comes up over the one you
   leave, which stays whole under it (no frame is bare paper); the header strip is whole from its first frame; the
   browser's own animations are held at their first frame (transitions.css) until these replace them.
   FYBook: move(from, to, rec) → 'book' | null · swap(rec) adds rec.bk at pageswap and names the book (or the plate's
   copy) · prepare(vt) at pagereveal, before the capture: the essay's intro laid out where React will put it, and the
   cover where the plate shows it · run(V, A, rec) · reset() lets the shelf put the book back · warm(key), opens(key) for
   pull.js. Names go on with classes (.fy-book-*) only for the move they travel in. ---- */
(function () {
  'use strict';
  var M = window.Motion, html = document.documentElement, ESSAY = /Reading\.dc\.html$/.test(location.pathname), EIO = 'cubic-bezier(.4,0,.6,1)';
  var V, AR = {}, X = {}, made = [], mode = null, again = null;   // V: the toolkit · AR: each cover's aspect · X: the essay's intro, laid out · again: the shelf's reset, held back
  var mix = function (a, b, t) { return a.map(function (v, i) { return v + (b[i] - v) * t; }); };
  var un = function (E, w, h) { return V.css(V.mul(V.tr(-w / 2, -h / 2), V.mul(E, V.tr(w / 2, h / 2)))); };   // a box's matrix for its own origin, its centre
  var rect = function (E, w, h) { return [E[4], E[5], w * Math.hypot(E[0], E[1]), h * Math.hypot(E[2], E[3])]; };
  var has = function (A, part, n) { return !!A['::view-transition-' + part + '(' + n + ')']; };
  // a spring as its own linear() samples, one per 60 Hz frame: at(ms) → progress, first(v) → when it first reaches v
  function spring(k, c) {
    var s = M.springEase(k, c).slice(7, -1).split(',').map(Number), n = s.length - 1;
    return { ease: M.springEase(k, c), dur: n * 1000 / 60,
      at: function (t) { var i = Math.max(0, t * 0.06); if (i >= n) return 1; var j = Math.floor(i); return s[j] + (s[j + 1] - s[j]) * (i - j); },
      first: function (v) { for (var i = 0; i <= n; i++) if (s[i] >= v) return i * 1000 / 60; return n * 1000 / 60; } };
  }
  function frames(dur, fn) { var kf = [], n = Math.max(2, Math.ceil(dur * 0.06)); for (var i = 0; i <= n; i++) { var f = fn(i / n * dur); f.offset = i / n; kf.push(f); } return kf; }
  function fade(a, b, t0, t1, dur, ease) {   // opacity a → b between t0 and t1 ms of a move dur long
    var o0 = M.clamp(t0 / dur, 0, 1), o1 = M.clamp(t1 / dur, o0, 1);
    return [{ opacity: a, offset: 0 }, { opacity: a, offset: o0, easing: ease || 'linear' }, { opacity: b, offset: o1 }, { opacity: b, offset: 1 }];
  }

  /* ---- the header strip rides from one page's place to the other's on the tab moves' spring ---- */
  function header(A) {
    var sp = spring(150, 21), h = V.ends(A, 'site-head'), a0 = h && [h.z0[4] + h.w0, h.z0[5] + h.h0], a1 = h && [h.z1[4] + h.w1, h.z1[5] + h.h1], d = h ? [a1[0] - a0[0], a1[1] - a0[1]] : [0, 0];
    ['site-head', 'identity', 'site-rule', 'tabmark', 'obj-book', 'obj-laptop', 'obj-camera', 'obj-frame'].forEach(function (n) {
      var g = V.ends(A, n), b;
      if (g && n === 'site-head') {   // keeps its bottom-right corner; the new strip is whole from the first frame, the old one fades off it
        V.kill(A, n, ['group', 'old', 'new']);
        var own = un(V.mul(V.tr(g.w1 - g.w0, g.h1 - g.h0), V.sc(g.w0 / g.w1)), g.w1, g.w1 * g.h0 / g.w0);
        V.pa('group', n, [{ transform: un(V.tr(a0[0] - g.w1, a0[1] - g.h1), g.w1, g.h1) }, { transform: un(V.tr(a1[0] - g.w1, a1[1] - g.h1), g.w1, g.h1) }], { duration: sp.dur, easing: sp.ease });
        V.pa('old', n, fade(1, 0, 0, 120, 120, EIO).map(function (f) { f.transform = own; return f; }), { duration: 120 });
      } else if (g) {
        V.kill(A, n, ['group']);
        V.pa('group', n, [{ transform: un(V.mul(g.z0, V.sc(g.w0 / g.w1, g.h0 / g.h1)), g.w1, g.h1) }, { transform: un(g.z1, g.w1, g.h1) }], { duration: sp.dur, easing: sp.ease });
      } else if ((b = V.box(n))) {   // one side only (the identity): it rides with the strip and goes with its page
        var out = has(A, 'old', n);
        V.kill(A, n, ['group', 'old', 'new']);
        V.pa('group', n, [{ transform: un(out ? b.m : V.mul(V.tr(-d[0], -d[1]), b.m), b.w, b.h) }, { transform: un(out ? V.mul(V.tr(d[0], d[1]), b.m) : b.m, b.w, b.h) }], { duration: sp.dur, easing: sp.ease });
        V.pa(out ? 'old' : 'new', n, out ? fade(1, 0, 0, 140, 140) : fade(0, 1, 120, 320, 320), { duration: out ? 140 : 320 });
      }
    });
  }
  // nothing travels: the page you arrive at comes up over the one you leave, which stays whole under it
  function paper(A) {
    V.kill(A, 'root', ['old', 'new']);
    V.pa('new', 'root', [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: EIO });
    ['book-cover', 'book-obi'].forEach(function (n) {
      if (!has(A, 'group', n) && !V.box(n)) return;
      V.kill(A, n, ['group', 'old', 'new']);
      V.pa('group', n, [{ opacity: has(A, 'old', n) ? 1 : 0 }, { opacity: 0 }], { duration: 120 });
    });
    header(A);
  }

  /* ---- the photo: the plate's object-fit and the board's crop, as maps from the cover (x, y in 0..1) to the screen ---- */
  function plateMap(W, B, a) {   // cover, 50% 42%, then scale(1.14) about its centre (reading.css .plate-img) → [ox, oy, Sx, Sy]
    var c = Math.max(W / a, B), l = (W - a * c) * 0.5, t = (B - c) * 0.42;
    return [W / 2 + (l - W / 2) * 1.14, B / 2 + (t - B / 2) * 1.14, 1.14 * a * c, 1.14 * c];
  }
  function boardCrop(a) {   // a 16:25 centre crop of the cover (generate-derivatives.py), shown zoomed 1.12 (writing.css .cv-img)
    var cw = a >= 0.64 ? 0.64 / a : 1, ch = a >= 0.64 ? 1 : a / 0.64, z = 2.24;
    return [0.5 - cw / z, 0.5 - ch / z, 0.5 + cw / z, 0.5 + ch / z];
  }
  function cropMap(R, k) { var Sx = R[2] / (k[2] - k[0]), Sy = R[3] / (k[3] - k[1]); return [R[0] - k[0] * Sx, R[1] - k[1] * Sy, Sx, Sy]; }
  function onto(G, r, w, h) { return V.mul(V.inv(G), V.mul(V.tr(r[0], r[1]), V.sc(r[2] / w, r[3] / h))); }   // a w × h box onto rect r, inside group G
  function cover(R, a) { var w = Math.max(R[2], R[3] * a), h = w / a; return [R[0] + (R[2] - w) / 2, R[1] + (R[3] - h) / 2, w, h]; }   // a box of aspect a covering R
  // where the plate's paper begins at the top of the essay (hero.js: B0 − pad, its hand-cut edge up to J above that)
  function cut(b0) { var v = function (n) { return parseFloat(getComputedStyle(html).getPropertyValue(n)) || 0; }; return b0 - v('--pad') - scrollY - Math.round(v('--cell') * 1.6) / 2; }

  /* ---- the essay's intro, laid out unseen where React will put it (where the plate ends), and the whole cover where the plate shows it ---- */
  function entry() { var I = window.FY_POST_INDEX || [], id = new URLSearchParams(location.search).get('post'); return I.find(function (p) { return p.id === id; }) || I[0] || null; }
  function both(en, zh) { var e = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }; return '<span class="en">' + e(en) + '</span><span class="zh">' + e(zh) + '</span>'; }
  function intro(p) {
    var top = document.querySelector('.rd-top'), d = new Date(p.date + 'T00:00:00'), b = window.FY_BODY && FY_BODY.id === p.id ? FY_BODY : {}, min = p.readingMin || 1, el = document.createElement('main');
    el.className = 'wrap rd-main fy-book-intro'; el.setAttribute('data-ready', ''); el.setAttribute('aria-hidden', 'true');
    el.style.top = (top ? top.getBoundingClientRect().bottom + scrollY : 0) + 'px';
    el.innerHTML = '<article><header class="article-intro"><div class="kick-row"><span class="kicker">' + both((p.tags || []).join(' · ') || 'essay', (p.tagsZh || []).join(' · ') || '文章') + '</span>' +
      '<span class="meta"><time>' + both(d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })) + '</time><span class="dot">·</span><span>' + both(min + ' min read', '约 ' + min + ' 分钟') + '</span><span class="dot">·</span><span>中 / EN</span></span></div>' +
      '<h1 class="title">' + both(p.title || p.titleZh || '', p.titleZh || p.title || '') + '</h1>' +
      (b.subtitle || b.subtitleZh ? '<div class="eyebrow">' + both(b.subtitle || b.subtitleZh, b.subtitleZh || b.subtitle) + '</div>' : '') + '</header><div class="body-col"></div></article>';
    document.body.appendChild(el);
    return { el: el, b0: Math.round(el.querySelector('.body-col').getBoundingClientRect().top + scrollY) };
  }
  function at(el, P) { el.style.cssText = 'left:' + P[0].toFixed(1) + 'px;top:' + P[1].toFixed(1) + 'px;width:' + P[2].toFixed(1) + 'px;height:' + P[3].toFixed(1) + 'px'; }
  function photo(p, P) {   // the cover, looking as the plate does (opaque: paper under 50%), as the new side of the frame
    var el = document.createElement('div'), img = new Image();
    el.className = 'fy-book-photo fy-book-cover'; el.setAttribute('aria-hidden', 'true'); at(el, P);
    img.alt = ''; img.decoding = 'sync'; img.sizes = '100vw'; img.srcset = p.coverSrcset || ''; img.src = p.cover;
    el.appendChild(img); document.body.appendChild(el);
    return el;
  }
  // the same, drawn now from the plate's own image (a canvas paints at once, a new img might not before the snapshot that
  // follows pageswap), as the old side of the frame on the way back: the plate itself is half transparent
  function shot(img, P) {
    var c = document.createElement('canvas'), k = Math.min(2, devicePixelRatio || 1), g = c.getContext('2d');
    c.className = 'fy-book-shot fy-book-cover'; c.setAttribute('aria-hidden', 'true'); c.width = Math.round(P[2] * k); c.height = Math.round(P[3] * k); at(c, P);
    g.fillStyle = getComputedStyle(html).getPropertyValue('--paper').trim() || '#FBF6EC'; g.fillRect(0, 0, c.width, c.height);
    g.globalAlpha = 0.5; g.drawImage(img, 0, 0, c.width, c.height);
    document.body.appendChild(c);
  }

  /* ---- the move: the frame (the front board) grows from the board to the plate's band while the photo inside stays one photo ---- */
  function frame(A, g, Rb, Pb, Pp, y, back, D, lift, hold) {
    var W = innerWidth, sp = spring(130, 20), gw = g.w1, gh = g.h1, hOld = gw * g.h0 / g.w0, R1 = [0, 0, W, y], h = hold || 0, T = h + sp.dur;
    var R0 = back ? R1 : Rb, R2 = back ? Rb : R1, F0 = back ? Pp : Pb, F1 = back ? Pb : Pp;
    var pose = function (t) { var p = sp.at(Math.max(0, t - h)), R = mix(R0, R2, p), F = mix(F0, F1, p); return { G: [R[2] / gw, 0, 0, R[3] / gh, R[0], R[1]], F: F, R: R }; };
    // the whole cover (the replica: in, the new side; back, the old) is held to one scale and place, so it always fills the frame
    var Gk = frames(T, function (t) { return { transform: un(pose(t).G, gw, gh) }; });
    var Ok = frames(T, function (t) { var s = pose(t); return { transform: un(onto(s.G, back ? s.F : cover(s.R, g.w0 / g.h0), gw, hOld), gw, hOld) }; });
    var Nk = frames(T, function (t) { var s = pose(t); return { transform: un(onto(s.G, back ? cover(s.R, g.w1 / g.h1) : s.F, gw, gh), gw, gh) }; });
    var x0 = h + sp.dur * (back ? 0.16 : 0.03), x1 = h + sp.dur * (back ? 0.42 : 0.22);
    V.kill(A, 'book-cover', ['group', 'old', 'new']);
    V.pa('group', 'book-cover', Gk, { duration: T, easing: 'linear' });
    V.pa('old', 'book-cover', Ok, { duration: T, easing: 'linear' });
    V.pa('new', 'book-cover', Nk, { duration: T, easing: 'linear' });
    V.pa('new', 'book-cover', fade(0, 1, x0, x1, T), { duration: T });   // the photo you arrive at fades in over the one you leave: never see-through
    // in, the frame has become the plate and lifts off the essay; back, it comes on over the plate first, so the essay's intro and nav go under the photo
    if (!back) V.pa('group', 'book-cover', fade(1, 0, lift, D, D, EIO), { duration: D }); else V.pa('group', 'book-cover', fade(0, 1, 0, h, T, EIO), { duration: T });
    return T;
  }
  function obi(A, back, wait) {   // the obi slips off the foot of the board (in), or slides back up onto it (back)
    var b = V.box('book-obi'), dur = 300, g = 2600;
    if (!b) return;
    V.kill(A, 'book-obi', ['group', 'old', 'new']);
    V.pa('group', 'book-obi', frames(dur, function (t) {
      var s = (back ? dur - t : t) / 1000, y = 0.5 * g * s * s, r = 5 * M.smooth(0, 0.25, s);
      return { transform: un(V.mul(b.m, V.mul(V.tr(0, y), V.mul(V.tr(b.w / 2, b.h / 2), V.mul(V.rot(r), V.tr(-b.w / 2, -b.h / 2))))), b.w, b.h) };
    }), { duration: dur, delay: wait || 0, easing: 'linear' });
    V.pa(back ? 'new' : 'old', 'book-obi', back ? fade(0, 1, 0, 120, dur) : fade(1, 0, 110, 260, dur), { duration: dur, delay: wait || 0 });
  }
  function run(v, A, rec) {
    var g, bk = rec.bk, sp = spring(130, 20), D = sp.dur + 220, Rb, d;
    V = v; g = V.ends(A, 'book-cover');
    if (mode === 'in' && g && X.P) {   // the shelf stays while the cover grows; once it has taken most of the band it dissolves off the essay, and then the frame lifts off
      var cv = sp.first(0.85);
      Rb = rect(g.z0, g.w0, g.h0);
      frame(A, g, Rb, cropMap(Rb, boardCrop(X.ar)), X.P, X.cut, false, D, Math.max(sp.first(0.97), cv + 200));
      obi(A, false); V.kill(A, 'root', ['old', 'new']); V.pa('new', 'root', fade(0, 1, cv, cv + 200, D, EIO), { duration: D }); header(A);
    } else if (mode === 'back' && g && bk.ar && bk.b0) {   // the frame comes on over the plate while the shelf fades in over the essay, then shrinks into the cover
      Rb = rect(g.z1, g.w1, g.h1);
      d = frame(A, g, Rb, cropMap(Rb, boardCrop(bk.ar)), plateMap(innerWidth, bk.b0, bk.ar), bk.cut, true, 0, 0, 150);
      obi(A, true, d - 300); V.kill(A, 'root', ['old', 'new']); V.pa('new', 'root', fade(0, 1, 20, 190, d, EIO), { duration: d }); header(A);
    } else paper(A);
    html.setAttribute('data-vt-go', '');   // the rest is the browser's own (transitions.css held it at its first frame)
  }

  /* ---- names, and the events ---- */
  function name(el, n) { if (el) el.classList.add('fy-book-' + n); }
  function unname() { [].forEach.call(document.querySelectorAll('.fy-book-cover, .fy-book-obi, .fy-book-lifted'), function (n) { n.classList.remove('fy-book-cover', 'fy-book-obi', 'fy-book-lifted'); }); }
  function opening() {
    var h = document.querySelector('.wr[data-mount=writing]'), key = h && h.getAttribute('data-opening'), hit = key && document.querySelector('.bk-hit[data-post="' + key + '"]');
    return hit ? { key: key, box: document.querySelectorAll('.sh-world > .book')[+hit.dataset.i] } : null;
  }
  function nameBook(o) { name(o.box.querySelector('.leaf-front'), 'cover'); name(o.box.querySelector('.obi'), 'obi'); o.box.classList.add('fy-book-lifted'); }   // the pages behind the board are hidden while it travels
  function opens(key) {
    var p = (window.FY_POST_INDEX || []).find(function (x) { return x.id === key; });
    return !!(p && p.cover && 'onpagereveal' in window && !M.reduced());
  }
  // the cover Reading will show, fetched as the book opens (the plate's own srcset and sizes, so the same file): it is in the cache when the essay arrives, and its aspect is known
  function warm(key) {
    var p = (window.FY_POST_INDEX || []).find(function (x) { return x.id === key; }), img;
    if (!p || !p.cover || AR[key]) return;
    img = new Image(); img.onload = function () { AR[key] = img.naturalWidth / img.naturalHeight; };
    img.sizes = '100vw'; img.srcset = p.coverSrcset || ''; img.src = p.cover;
  }
  function move(from, to, rec) { return rec && rec.bk && (from === 'writing' || from === 'reading') && (to === 'writing' || to === 'reading') && from !== to ? 'book' : null; }
  function swap(rec) {
    var bk = { top: scrollY < 40 }, o, pl, img;
    if (rec.from === 'writing' && rec.to === 'reading') { o = opening(); if (!o) return; nameBook(o); bk.post = o.key; bk.ar = AR[o.key]; }
    else if (rec.from === 'reading' && rec.to === 'writing') {
      pl = document.querySelector('.plate'); img = pl && pl.querySelector('img');
      if (bk.top && img && img.naturalWidth) { bk.ar = img.naturalWidth / img.naturalHeight; bk.b0 = pl.offsetHeight; bk.cut = cut(bk.b0); shot(img, plateMap(html.clientWidth, bk.b0, bk.ar)); }
    } else return;
    rec.bk = bk;
  }
  function end() {
    html.removeAttribute('data-vt-go'); unname();
    var I = made.filter(function (n) { return n.classList.contains('fy-book-intro'); })[0], real = function () { return document.querySelector('.rd-main[data-ready]:not(.fy-book-intro)'); };
    made.forEach(function (n) { if (n !== I) n.remove(); });
    made = [];
    // the replica stays until React has printed the real intro (usually long before)
    if (!I || real()) { if (I) I.remove(); } else new MutationObserver(function (l, ob) { if (real()) { ob.disconnect(); I.remove(); } }).observe(document.body, { subtree: true, attributes: true, childList: true });
    reset();
  }
  function reset() { var f = again; again = null; if (f) f(); }
  function prepare(vt, rec) {
    var bk = rec.bk, o, p, I;
    mode = 'paper'; X = {};
    if (!ESSAY) { o = again && bk.top && opening(); if (o) { nameBook(o); mode = 'back'; } }
    else if ((p = entry()) && p.cover) {
      I = intro(p); made.push(I.el);
      X.ar = bk.ar || 1.5; X.P = plateMap(html.clientWidth, I.b0, X.ar); X.cut = cut(I.b0); made.push(photo(p, X.P)); mode = 'in';
    }
    vt.finished.then(end, end);
  }
  // pagereveal, first: a page back from the back/forward cache has its stale names and replicas taken off
  addEventListener('pagereveal', function () { unname(); [].forEach.call(document.querySelectorAll('.fy-book-intro, .fy-book-photo, .fy-book-shot'), function (n) { n.remove(); }); });
  // Back to the shelf through the back/forward cache: the book is still open in your hand; the shelf's own reset (app.js) waits until the move has landed the essay in it
  addEventListener('pageshow', function (e) {
    var r = null;
    if (!e.persisted || e.fyBook || ESSAY || M.reduced() || !('onpagereveal' in window)) return;
    try { r = JSON.parse(sessionStorage.getItem('fy-vt')); } catch (x) { r = null; }
    if (!r || !r.bk || r.from !== 'reading' || Date.now() - r.t > 10000 || !opening()) return;
    e.stopImmediatePropagation();
    again = function () { var ev = new PageTransitionEvent('pageshow', { persisted: true }); ev.fyBook = true; dispatchEvent(ev); };
  });
  // "← all writing" is Back when you came from the shelf (the shelf as you left it, the move played back); from anywhere else it stays a plain link
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.back'), n = window.navigation, prev = n && n.entries()[n.currentEntry.index - 1];
    if (!ESSAY || !a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !prev || !/Writing\.dc\.html$/.test(new URL(prev.url).pathname)) return;
    e.preventDefault(); history.back();
  });

  window.FYBook = { move: move, swap: swap, prepare: prepare, run: run, reset: reset, warm: warm, opens: opens };
})();
