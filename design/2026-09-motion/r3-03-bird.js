/* r3-03-bird.js — the yellow bird (r2-04-bird.js), ported to the bookcase. Hand's clock, unchanged: a 6-frame
   strip (0 stand · 1 crouch · 2 take-off · 3 air · 4 land · 5 settle), positions change only on frame swaps
   (~10 fps). It notices a pulled book late and perches on the book in your hand (r2-04 A). New here:
     - it only stands on books that are on the shelf (a filtered-out book is not a perch);
     - it hops along one plank at a time; a book on another plank is one bigger flutter;
     - when a filter lands books on its plank it hops once where it stands (r2-03: the plank jolts);
     - if the book it stands on is filtered out, it steps off first. */
(function () {
  var K = window.ShelfKit;
  function Bird(sh, opt) {
    opt = opt || {};
    var W = opt.size || 52, H = W * 317 / 308, FEET = H * 0.82;
    var node = K.el('div', 'bird'), fr = K.el('div', 'bird-f');
    node.style.width = W + 'px'; node.style.height = H + 'px'; node.style.transformOrigin = (W / 2) + 'px ' + FEET + 'px';
    node.appendChild(fr); sh.world.appendChild(node);
    node.setAttribute('aria-hidden', 'true');
    var st = { x: 0, y: 0, z: 0, k: 1, dir: -1, perch: -1, busy: false, want: -1, gen: 0, hopping: false }, timer = null;
    function rm() { return window.Pen && Pen.reduced(); }

    function spot(i) {
      if (i < 0) { var g = sh.ghost; return { x: g.cx, y: g.y - g.h, z: -g.D * 0.45, k: 1, row: 0 }; }
      var b = sh.books[i], p = sh.worldPoint(b, 0, -b.h, -b.D * 0.42);
      return { x: p.x, y: p.y, z: p.z, k: b.st ? b.st.s : 1, row: b.row };
    }
    function place() {
      node.style.transform = 'translate3d(' + (st.x - W / 2).toFixed(1) + 'px,' + (st.y - FEET).toFixed(1) + 'px,' + st.z.toFixed(1) + 'px) scale(' +
        (st.k * (st.dir > 0 ? -1 : 1)).toFixed(3) + ',' + st.k.toFixed(3) + ')';
    }
    function frame(i) { fr.style.backgroundPosition = (i * 20) + '% 0'; }
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms * K.SLOW()); }); }
    function resting(i) {
      var b = sh.books[i];
      return b.vis && b.rf && b.rf.mode === 'in' && !b.rf.live && !b.frozen && (!b.phase || b.phase === 'rest' || b.phase === 'hook');
    }
    function rowNow() { return st.perch >= 0 ? sh.books[st.perch].row : 0; }
    // One hop at most ~100 px along its own plank: the farthest resting book top within reach.
    function nextStop(tgtI) {
      var tgt = spot(tgtI), dx = tgt.x - st.x, row = rowNow();
      if (Math.abs(dx) <= 100 * sh.k || (tgtI >= 0 && sh.books[tgtI].row !== row && sh.books[tgtI].phase !== 'out')) return tgtI;
      var best = null;
      sh.books.forEach(function (b, i) {
        if (!resting(i) || i === st.perch || b.row !== row) return;
        var d = (b.sx + b.w / 2 - st.x) * Math.sign(dx);
        if (d > 18 && d <= 100 * sh.k && (!best || d > best.d)) best = { d: d, i: i };
      });
      return best ? best.i : tgtI;
    }
    async function hop(i, startled) {
      var a = { x: st.x, y: st.y, z: st.z, k: st.k }, b = spot(i), dir = b.x > a.x + 1 ? 1 : b.x < a.x - 1 ? -1 : st.dir;
      st.hopping = true; st.perch = -2;
      if (dir !== st.dir) { st.dir = dir; place(); if (!startled) await sleep(150); }
      if (!startled) { frame(1); await sleep(100); }
      b = spot(i);
      var lift = 12 * sh.k + Math.max(0, a.y - b.y) * 0.25;
      var mix = function (t, up) { st.x = a.x + (b.x - a.x) * t; st.y = a.y + (b.y - a.y) * t - up; st.z = a.z + (b.z - a.z) * t; st.k = a.k + (b.k - a.k) * t; place(); };
      frame(2); mix(0.22, 7 * sh.k); await sleep(80);
      b = spot(i); frame(3); mix(0.66, lift); await sleep(100);
      b = spot(i); frame(4); mix(1, 0); st.perch = i; st.hopping = false; await sleep(80);
      frame(5); await sleep(90);
      frame(0);
    }
    async function go() {
      if (st.busy) return;
      st.busy = true;
      var g = st.gen;
      while (g === st.gen) {
        if (st.perch === st.want) break;
        var under = st.perch >= 0 && sh.books[st.perch].frozen;
        await hop(nextStop(st.want), under);
        await sleep(90);
      }
      st.busy = false;
      if (g !== st.gen) go();
    }
    function teleport(i) { var s = spot(i); st.x = s.x; st.y = s.y; st.z = s.z; st.k = s.k; st.perch = i; st.want = i; frame(0); place(); }
    return {
      node: node, get perch() { return st.perch; }, get want() { return st.want; },
      home: function () { st.dir = -1; teleport(-1); },
      tick: function () { if (st.hopping || st.perch === -2) return; var s = spot(st.perch); st.x = s.x; st.y = s.y; st.z = s.z; st.k = s.k; place(); },
      consider: function (i, delay) {
        clearTimeout(timer);
        timer = setTimeout(function () {
          st.want = i;
          if (rm()) { teleport(i); return; }
          st.gen++; go();
        }, (delay == null ? (opt.notice || 420) : delay) * K.SLOW());
      },
      hopOff: function (i) {
        var b = sh.books[i], n = [i - 1, i + 1, i - 2, i + 2].find(function (j) { return j >= 0 && j < sh.books.length && resting(j) && sh.books[j].row === b.row; });
        this.consider(n == null ? -1 : n, 0);
      },
      // A filter is about to take its book away: it goes home to the ghost, straight away.
      evict: function (gone) { if (st.perch >= 0 && gone(st.perch)) { if (rm()) teleport(-1); else this.consider(-1, 0); } else if (st.want >= 0 && gone(st.want)) this.consider(-1, 0); },
      // Books landed on its plank: one hop on the spot (r2-03's jolt).
      jolt: function () { if (rm() || st.busy || st.hopping) return; var p = st.perch; if (p === -2) return; st.busy = true; hop(p, false).then(function () { st.busy = false; }); },
      cancel: function () { clearTimeout(timer); },
      place: place
    };
  }
  window.Bird3 = Bird;
})();
