/* r2-04-bird.js — the yellow bird, now living in the shelf's 3D world (so a book in your hand correctly
   passes in front of it). Hand's clock, as in round 1: a 6-frame strip (0 stand · 1 crouch · 2 take-off ·
   3 air · 4 land · 5 settle), positions change only on frame swaps (~10 fps). It notices a book late, finishes
   the hop it is in, never chases. It hops along the page-block tops and perches on the top of the book you are
   holding; if you put that book back it rides it home and stays sitting on it in the row. */
(function () {
  var K = window.ShelfKit;
  function ShelfBird(sh, opt) {
    opt = opt || {};
    var W = opt.size || 52, H = W * 317 / 308, FEET = H * 0.82;
    var node = K.el('div', 'bird'), fr = K.el('div', 'bird-f');
    node.style.width = W + 'px'; node.style.height = H + 'px'; node.style.transformOrigin = (W / 2) + 'px ' + FEET + 'px';
    node.appendChild(fr); sh.world.appendChild(node);
    node.setAttribute('aria-hidden', 'true');
    var st = { x: 0, y: 0, z: 0, k: 1, dir: -1, perch: -1, busy: false, want: -1, gen: 0, hopping: false }, timer = null;

    // Where the bird stands on book i right now: the middle of its page-block top, under the book's live pose.
    function spot(i) {
      if (i < 0) { var g = sh.ghost; return { x: g.cx, y: sh.plankY - g.h, z: -g.D * 0.45, k: 1 }; }
      var b = sh.books[i], p = sh.worldPoint(b, 0, -b.h, -b.D * 0.42);
      return { x: p.x, y: p.y, z: p.z, k: b.st ? b.st.s : 1 };
    }
    function place() {
      node.style.transform = 'translate3d(' + (st.x - W / 2).toFixed(1) + 'px,' + (st.y - FEET).toFixed(1) + 'px,' + st.z.toFixed(1) + 'px) scale(' +
        (st.k * (st.dir > 0 ? -1 : 1)).toFixed(3) + ',' + st.k.toFixed(3) + ')';
    }
    function frame(i) { fr.style.backgroundPosition = (i * 20) + '% 0'; }
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms * K.SLOW()); }); }
    function resting(i) { var b = sh.books[i]; return !b.frozen && (!b.phase || b.phase === 'rest' || b.phase === 'hook'); }
    // One hop at most ~100px along the row: pick the farthest resting book top within reach.
    function nextStop(tgtI) {
      var tgt = spot(tgtI), dx = tgt.x - st.x;
      if (Math.abs(dx) <= 100) return tgtI;
      var best = null;
      sh.books.forEach(function (b, i) {
        if (!resting(i) || i === st.perch) return;
        var d = (b.cx - st.x) * Math.sign(dx);
        if (d > 18 && d <= 100 && (!best || d > best.d)) best = { d: d, i: i };
      });
      return best ? best.i : tgtI;
    }
    // startled = the thing under its feet is being taken away: no turn beat, no crouch, straight off.
    async function hop(i, startled) {
      var a = { x: st.x, y: st.y, z: st.z, k: st.k }, b = spot(i), dir = b.x > a.x ? 1 : -1;
      st.hopping = true; st.perch = -2;
      if (dir !== st.dir) { st.dir = dir; place(); if (!startled) await sleep(150); }    // turn, then a held beat
      if (!startled) { frame(1); await sleep(100); }
      b = spot(i);
      var lift = 12 + Math.max(0, a.y - b.y) * 0.25;                       // a higher perch is a bigger flutter
      var mix = function (t, up) { st.x = a.x + (b.x - a.x) * t; st.y = a.y + (b.y - a.y) * t - up; st.z = a.z + (b.z - a.z) * t; st.k = a.k + (b.k - a.k) * t; place(); };
      frame(2); mix(0.22, 7); await sleep(80);
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
    return {
      node: node, get perch() { return st.perch; }, get want() { return st.want; },
      home: function () { var s = spot(-1); st.x = s.x; st.y = s.y; st.z = s.z; st.k = 1; st.perch = -1; st.want = -1; st.dir = -1; frame(0); place(); },
      // Riding: called every physics frame; a perched bird goes wherever its book goes.
      tick: function () { if (st.hopping || st.perch === -2) return; var s = spot(st.perch); st.x = s.x; st.y = s.y; st.z = s.z; st.k = s.k; place(); },
      // Consider a book: wait (it notices late), then hop. delay 0 = go now (the book is leaving).
      consider: function (i, delay) {
        clearTimeout(timer);
        timer = setTimeout(function () {
          st.want = i;
          if (window.Pen && Pen.reduced()) { var s = spot(i); st.x = s.x; st.y = s.y; st.z = s.z; st.k = s.k; st.perch = i; frame(0); place(); return; }
          st.gen++; go();
        }, (delay == null ? (opt.notice || 420) : delay) * K.SLOW());
      },
      // The book it sits on is about to be taken away: step off onto the nearest resting neighbour.
      hopOff: function (i) {
        var n = [i - 1, i + 1, i - 2, i + 2].find(function (j) { return j >= 0 && j < sh.books.length && resting(j); });
        this.consider(n == null ? -1 : n, 0);
      },
      cancel: function () { clearTimeout(timer); },
      place: place
    };
  }
  window.ShelfBird = ShelfBird;
})();
