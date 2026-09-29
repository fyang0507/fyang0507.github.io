/* r3-03-pull.js — r2-04 A, "Pull it, read the band / 抽书看腰封" (r2-04-pull.js), ported to the bookcase.
   The gesture is unchanged: point → the finger hooks the head of the spine (tip on its front edge); pause → it
   slides out, clears the row, turns in your hand to show the real cover under a paper obi; the neighbours lose
   their support and lean into the gap; leave → it turns back, slides home, shoves them upright; click / Enter →
   square to you, the board swings open, the title page grows into the reading page. Physics clock throughout.
   What the bookcase changes:
     - where the book is held: a book from the lower plank rises in front of the row above; a book from an
       upper plank comes down in front of the row below. Either way the gap it left stays in view;
     - it only rises or drops once it is clear of the plank in front of it (dz > D + lip overhang), so a book
       never passes through a board;
     - neighbours, arrow keys and the bird only count books that are on the shelf (the filter may hide some);
     - a hover hint spring (hy): the index lifts a book a finger's width without touching its pull. */
(function () {
  var K = window.ShelfKit;
  var NAMES = ['dx', 'dy', 'dz', 's', 'rx', 'ry', 'rz', 'lean', 'tip', 'lf', 'hy'];
  var RX = 4, RZ = -1.5, RY = -58, HOOK = 6, DWELL = 110;

  function Pull(stage, sh, cfg) {
    var tap = !!cfg.tap, view = sh.view, k = sh.k, CW = cfg.coverW || 190, books = sh.books, CLR = sh.S + Math.round(8 * k);
    var read = window.ShelfRead(stage);
    books.forEach(function (b) {
      b.st = Object.assign({}, sh.REST); b.sp = {}; b.phase = 'rest';
      NAMES.forEach(function (n) { b.sp[n] = new K.Spring(n === 's' ? 1 : 0, 200, 0.7); });
      b.sp.hy.tune(260, 0.62);
    });
    var bird = window.Bird3(sh, { size: cfg.bird || Math.round(56 * sh.rowH / 221), notice: 420 });
    var loop = K.Loop(render), cur = -1, busy = false, dwell = null, leaveT = null, quiet = false;
    var rm = function () { return window.Pen && Pen.reduced(); };
    function on(b) { return b.vis && b.rf && b.rf.mode === 'in'; }
    function order() { return books.filter(on); }
    function neighbour(b, d) { var o = order(), j = o.indexOf(b) + d, n = o[j]; return n && n.row === b.row ? n : null; }
    function clearZ(b) { return b.D + CLR; }

    // ---- the pose in your hand --------------------------------------------------------------------------
    function heldPose(b) {
      var P = sh.P, dz = clearZ(b) + Math.round(24 * k), zc = dz - b.D / 2, pk = P / (P - zc);
      var s = CW / (b.D * pk), Hs = b.h * s * pk, Ws = (0.87 * b.D + 0.5 * b.w) * s * pk, vh = view.clientHeight;
      var rowTop = b.sy - sh.rowH * 0.96, cyS;
      if (sh.R > 1 && b.row < sh.R - 1) {                                  // an upper plank: bring it down
        var top = b.sy + sh.LIP + Math.round(16 * k);
        cyS = Math.min(top + Hs / 2, vh - 10 - Hs / 2);
      } else {                                                           // the lower plank / the strip: lift it
        var bottom = rowTop + (cfg.overlap || 30), minTop = cfg.minTop || 12;   // room above for the bird
        if (bottom - Hs < minTop) bottom = minTop + Hs;
        cyS = bottom - Hs / 2;
      }
      var cy = sh.oy + (cyS - sh.oy) / pk, vw = view.clientWidth, sl = scrollFor(b), ox = sl + vw / 2, bx = b.sx + b.w / 2;
      var cxS = Math.max(sl + 12 + Ws / 2, Math.min(sl + vw - 12 - Ws / 2, bx)), cx = ox + (cxS - ox) / pk;
      return { dx: cx - bx, dy: cy - (b.sy - b.h / 2), dz: dz, s: s, rx: RX, ry: RY, rz: RZ, lean: 0, tip: 0 };
    }
    // Square to you, centred in the case, the board to the left of centre so the opened spread is centred.
    function facePose(b) {
      var P = sh.P, dz = clearZ(b) + Math.round(40 * k), zc = dz - b.D / 2, pk = P / (P - zc);
      var vh = view.clientHeight, H = Math.min(cfg.faceH || 380, vh - 60), s = H / (b.h * pk), cov = b.D * s * pk;
      var vw = view.clientWidth, sl = view.scrollLeft, ox = sl + vw / 2, cxS = ox + cov / 2 - b.w * s * pk * 0.25, cyS = vh / 2;
      return { dx: ox + (cxS - ox) / pk - (b.sx + b.w / 2), dy: sh.oy + (cyS - sh.oy) / pk - (b.sy - b.h / 2), dz: dz, s: s, rx: 0, ry: -90, rz: 0, lean: 0, tip: 0 };
    }
    function scrollFor(b) { return sh.strip ? Math.max(0, Math.min(view.scrollWidth - view.clientWidth, b.sx + b.w / 2 - view.clientWidth / 2)) : view.scrollLeft; }
    function aim(b, pose, stiff) { NAMES.forEach(function (n) { if (pose[n] != null) b.sp[n].t = pose[n]; }); if (stiff) NAMES.forEach(function (n) { if (n !== 'hy') b.sp[n].tune(stiff[0], stiff[1]); }); }

    // ---- neighbours: they lose support only when the book is clear of the row --------------------------
    function setLean(b, amt) {
      var g = b.w + Math.round(5 * k);
      [-2, -1, 1, 2].forEach(function (d) {
        var o = neighbour(b, d); if (!o) return;
        var t = Math.asin(Math.min(0.5, (Math.abs(d) === 1 ? 0.32 : 0.11) * g * amt / o.h)) * 180 / Math.PI;
        if (o.phase === 'rest' || o.phase === 'hook') o.sp.lean.tune(150, 0.36).t = d < 0 ? t : -t;
      });
      loop.kick();
    }
    function shove(b) {
      [-2, -1, 1, 2].forEach(function (d) {
        var o = neighbour(b, d); if (!o || o.phase === 'out') return;
        o.sp.lean.tune(260, 0.4); o.sp.lean.t = 0;
        if (Math.abs(d) === 1) o.sp.lean.v += (d < 0 ? -1 : 1) * 26;
      });
    }
    function unlean() { books.forEach(function (o) { if (o.phase === 'rest' || o.phase === 'hook') o.sp.lean.t = 0; }); }

    // ---- the gesture --------------------------------------------------------------------------------------
    function hook(i) { var b = books[i]; b.phase = 'hook'; b.sp.tip.tune(380, 0.55).t = HOOK; b.sp.dz.tune(300, 0.8).t = 3; }
    function pull(i) {
      var b = books[i]; buildCover(b);
      b.phase = 'out'; b.lifted = b.turned = b.penOn = false; b.box.classList.add('held');
      b.pose = heldPose(b);
      b.sp.dz.tune(230, 0.9).t = b.pose.dz; b.sp.tip.tune(260, 0.7).t = 2;
      if (sh.strip) view.scrollTo({ left: scrollFor(b), behavior: rm() ? 'auto' : 'smooth' });
    }
    function release(i) {
      var b = books[i];
      b.box.classList.remove('held');
      if (b.pen) b.pen.hide();
      if (b.phase === 'hook') { b.phase = 'back'; b.slid = b.shoved = true; b.sp.tip.tune(420, 0.8).t = 0; b.sp.dz.t = 0; return; }
      if (b.phase !== 'out') return;
      b.phase = 'back'; b.slid = b.shoved = false;
      aim(b, { dx: 0, dy: -5, s: 1, rx: 0, ry: 0, rz: 0, lf: 0 }, [340, 0.92]);        // paper retracts faster than it rose
      if (!b.lifted) { b.slid = true; b.sp.dz.tune(340, 0.95).t = 0; b.sp.tip.t = 0; b.sp.dy.t = 0; }
    }
    function phaseTick(b) {
      var sp = b.sp;
      if (b.phase === 'out') {
        // clear of the plank in front first; only then up / down and round
        if (!b.lifted && sp.dz.x > clearZ(b) - 2) {
          b.lifted = b.turned = true; setLean(b, 1);
          sp.dy.tune(150, 0.8).t = b.pose.dy; sp.dx.tune(150, 0.82).t = b.pose.dx;
          sp.ry.tune(125, 0.62).t = RY; sp.rx.tune(125, 0.7).t = RX; sp.rz.tune(100, 0.6).t = RZ; sp.s.tune(140, 0.74).t = b.pose.s; sp.tip.t = 0;
        }
        if (b.turned && !b.penOn && Math.abs(sp.ry.x - RY) < 4 && Math.abs(sp.ry.v) < 30) { b.penOn = true; b.pen.show(); bird.consider(b.i); }
      } else if (b.phase === 'back') {
        // back in front of its own slot (level with it) before it slides in
        if (!b.slid && sp.ry.x > -16 && Math.abs(sp.dy.x - sp.dy.t) < 6) { b.slid = true; sp.dz.tune(300, 0.92).t = 0; sp.tip.t = 0; }
        if (b.slid && !b.shoved && sp.dz.x < b.D + 4) { b.shoved = true; shove(b); }
        if (b.slid && sp.dz.x < 14) sp.dy.t = 0;
      }
    }
    function render(dt) {
      var moving = false;
      books.forEach(function (b) {
        if (b.frozen || !b.vis) return;
        var m = false;
        NAMES.forEach(function (n) { if (b.sp[n].step(dt)) m = true; });
        // the plank is solid (a small bounce) — but only while the book stands over it, not once it is clear
        if (b.sp.dy.x > 0 && b.sp.dz.x < clearZ(b) - 4) { b.sp.dy.x = 0; b.sp.dy.v = -b.sp.dy.v * 0.25; }
        phaseTick(b);
        if (b.phase === 'back' && !m && b.sp.dz.x === 0) { b.phase = 'rest'; if (b.hookAfter) { b.hookAfter = false; if (cur === b.i) { hook(b.i); m = true; } } }
        if (m || b.dirty) { NAMES.forEach(function (n) { b.st[n] = b.sp[n].x; }); sh.place(b, b.st); b.dirty = false; }
        moving = moving || m;
      });
      bird.tick();
      return moving;
    }
    function consider(i) {
      if (busy || read.open || i === cur) return;
      if (i >= 0 && !on(books[i])) return;
      var prev = cur; cur = i;
      clearTimeout(dwell);
      if (prev >= 0) release(prev);
      if (i >= 0) {
        hook(i);
        if (rm()) pull(i); else dwell = setTimeout(function () { if (cur === i) { pull(i); loop.kick(); } }, DWELL * K.SLOW());
      } else bird.cancel();
      cfg.onConsider && cfg.onConsider(i);
      loop.kick();
    }
    function buildCover(b) { if (!b.built) { b.built = true; window.ShelfCover.build(b, CW, 'band'); } }

    // ---- open / close (WAAPI, spring-baked) ----------------------------------------------------------------
    function frames(b, list) { return list.map(function (q) { var f = { transform: sh.css(sh.ops(b, q[0])) }; if (q[1] != null) f.offset = q[1]; if (q[2]) f.easing = q[2]; return f; }); }
    async function open(i) {
      if (busy || read.open || !on(books[i])) return;
      busy = true;
      clearTimeout(dwell); clearTimeout(leaveT);
      if (cur !== i) { if (cur >= 0) release(cur); cur = i; }
      var b = books[i]; buildCover(b);
      if (b.pen) b.pen.hide();
      b.frozen = true; b.phase = 'open'; b.box.classList.remove('held');
      if (bird.perch === i) { bird.hopOff(i); await K.wait(70); } else if (bird.want === i) bird.hopOff(i);
      var from = Object.assign({}, b.st), face = facePose(b);
      var clear = Object.assign({}, from, { dz: Math.max(from.dz, clearZ(b) + 30 * k), tip: 0 });
      setLean(b, 1.5);
      var needClear = from.dz < clearZ(b);
      await Promise.all([
        K.play(b.box, frames(b, needClear ? [[from, 0, K.curve(0.9)], [clear, 0.26, K.curve(0.8)], [face]] : [[from, 0, K.curve(0.82)], [face]]),
          { duration: needClear ? 940 : 660, easing: 'linear' }),
        K.play(b.F.leaf, [{ transform: 'rotateY(' + (+from.lf || 0).toFixed(2) + 'deg)' }, { transform: 'rotateY(-172deg)' }], { duration: 520, delay: needClear ? 640 : 400, easing: K.curve(0.74) })
      ]);
      face.lf = -172; face.hy = 0; b.st = face; sh.place(b, face);
      // A page is read from its top: on a phone the page's head is above the fold, so bring it in first.
      if (stage.getBoundingClientRect().top < 0) { stage.scrollIntoView({ block: 'start', behavior: rm() ? 'auto' : 'smooth' }); await K.wait(420); }
      var from2 = { paper: K.rel(b.p1, stage), title: K.rel(b.p1zh, stage) };
      b.p1zh.style.visibility = 'hidden';
      await read.show(b.post, from2, function (viaKey) { close(i, viaKey); });
      busy = false;
    }
    async function close(i, viaKey) {
      if (busy) return;
      busy = true;
      var b = books[i];
      await read.hide({ paper: K.rel(b.p1, stage), title: K.rel(b.p1zh, stage) });
      b.p1zh.style.visibility = '';
      var face = b.st, lift = Math.max(0, Math.min(80, b.h * 0.4, sh.clear(b) - 6));
      var above = Object.assign({}, sh.REST, { dy: -lift, dz: clearZ(b) + 16 * k }), home = Object.assign({}, sh.REST, { dy: -3 });
      await Promise.all([
        K.play(b.F.leaf, [{ transform: 'rotateY(-172deg)' }, { transform: 'rotateY(0deg)' }], { duration: 380, easing: K.curve(0.92) }),
        K.play(b.box, frames(b, [[face, 0, K.curve(0.95)], [Object.assign({}, face, { ry: -60, rx: 2 }), 0.3, K.curve(0.9)], [above, 0.66, 'cubic-bezier(.45,0,.8,.6)'], [home]]),
          { duration: 1080, easing: 'linear', delay: 120 })
      ]);
      NAMES.forEach(function (n) { b.sp[n].x = b.sp[n].t = home[n]; b.sp[n].v = 0; });
      b.sp.dy.t = 0; b.sp.dy.v = 60; b.st = Object.assign({}, home);
      b.frozen = false; b.phase = 'back'; b.slid = b.shoved = true; cur = -1; shove(b); loop.kick();
      busy = false;
      if (viaKey) { quiet = true; b.hit.focus({ preventScroll: true }); quiet = false; cur = i; b.hookAfter = true; }
      else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    }

    // ---- wiring: pointer, touch, keyboard -------------------------------------------------------------------
    var host = sh.view;
    function leaveSoon() { clearTimeout(leaveT); leaveT = setTimeout(function () { var f = document.activeElement; if (!(cur >= 0 && f === books[cur].hit && f.matches(':focus-visible'))) consider(-1); }, 180 * K.SLOW()); }
    host.addEventListener('pointerover', function (e) {
      if (tap || e.pointerType === 'touch') return;
      var a = e.target.closest('.bk-hit');
      if (a) { clearTimeout(leaveT); consider(+a.dataset.i); return; }
      if (e.target.closest('.book.held')) { clearTimeout(leaveT); return; }
      leaveSoon();
    });
    host.addEventListener('pointerleave', function (e) { if (!tap && e.pointerType !== 'touch') leaveSoon(); });
    host.addEventListener('click', function (e) {
      var a = e.target.closest('.bk-hit');
      if (a) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        var i = +a.dataset.i;
        if (cur !== i || books[i].phase !== 'out') { if (tap || e.pointerType === 'touch') { consider(i); if (cur === i && books[i].phase === 'hook') { clearTimeout(dwell); pull(i); loop.kick(); } return; } }
        open(i); return;
      }
      if (e.target.closest('.book.held') && cur >= 0) { open(cur); return; }
      if (tap) consider(-1);
    });
    function walk(b, d) { var o = order(), j = Math.max(0, Math.min(o.length - 1, o.indexOf(b) + d)); return o[j]; }
    books.forEach(function (b, i) {
      b.hit.addEventListener('keydown', function (e) {
        var kk = e.key, n = null, o = order();
        if (kk === 'ArrowRight' || kk === 'ArrowDown') n = walk(b, 1); else if (kk === 'ArrowLeft' || kk === 'ArrowUp') n = walk(b, -1);
        else if (kk === 'Home') n = o[0]; else if (kk === 'End') n = o[o.length - 1];
        else if (kk === 'Escape') { if (cur === i && b.phase === 'out') { e.preventDefault(); clearTimeout(dwell); release(i); b.hookAfter = true; loop.kick(); } return; }
        else if (kk === ' ') { e.preventDefault(); open(i); return; }
        if (!n) return;
        e.preventDefault(); n.hit.focus({ preventScroll: true });
      });
      b.hit.addEventListener('focus', function () {
        roving(b);
        if (!quiet && b.hit.matches(':focus-visible')) consider(i);
      });
      b.hit.addEventListener('blur', function (e) { if (!e.relatedTarget || !sh.world.contains(e.relatedTarget)) { if (!tap) consider(-1); } });
    });
    function roving(b) { books.forEach(function (o) { o.hit.tabIndex = -1; }); if (b) b.hit.tabIndex = 0; }
    document.addEventListener('mock:rm', function () { books.forEach(function (b) { NAMES.forEach(function (n) { b.sp[n].snap(); }); b.dirty = true; }); loop.kick(); });

    return {
      read: read, bird: bird, consider: consider, open: open, close: close, loop: loop,
      get busy() { return busy; }, get cur() { return cur; }, get held() { return cur >= 0 && books[cur].phase === 'out'; },
      // A filter is about to move books: put the one in your hand back (it still reflows from wherever it is).
      rest: function () { if (read.open || busy) return false; consider(-1); unlean(); return true; },
      // Hover hints from the index: the kept books lift a finger's width off the plank.
      hint: function (pred) { var up = -Math.round(8 * k); books.forEach(function (b) { b.sp.hy.t = pred && on(b) && pred(b) ? up : 0; }); loop.kick(); },
      roving: function () { var o = order(), f = o.find(function (b) { return b.hit.tabIndex === 0; }); roving(f || o[0]); },
      render: function () { books.forEach(function (b) { b.dirty = true; }); loop.kick(); }
    };
  }
  window.Pull3 = Pull;
})();
