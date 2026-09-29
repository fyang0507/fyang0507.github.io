/* r2-04-pull.js — "Pull it, read the band / 抽书看腰封". One book, one continuous gesture:
   point → a finger hooks the head of the spine (the book tips on its front edge; you see more page block);
   pause → it slides out along the plank, is lifted clear of the row, and turns in the hand until its front
   board faces you: the real cover, wrapped in a paper obi that carries the preview. The neighbours lose their
   support only once it is clear, lean into the gap, wobble, settle. Leave → it turns back, slides home and
   shoves them upright. Click / Enter → from wherever it is, it comes square to you, the board swings open and
   the title page grows into the reading page. Back / Esc reverses all of it and re-shelves the book.
   Physics clock throughout (live springs for the hover, spring-baked WAAPI for the open). */
(function () {
  var K = window.ShelfKit;
  var NAMES = ['dx', 'dy', 'dz', 's', 'rx', 'ry', 'rz', 'lean', 'tip', 'lf'];
  var RX = 4, RZ = -1.5, HOOK = 6, DWELL = 110, LEAF = -100;

  function PullShelf(stage, cfg) {
    var posts = cfg.posts, tap = !!cfg.tap, host = cfg.host || stage;
    var sh = window.Shelf3D(host, posts, cfg.shelf), view = sh.view, k = sh.k, CW = cfg.coverW || 190;
    // band: turned 58°, the cover faces you under its obi. peek: turned past square to 130° with the board opened
    // 100°, a V that opens toward you, hinge at the back: the board's reverse on the left, the title page on the
    // right, each 40° off-axis. It is the spread the click then opens flat.
    var MODE = cfg.mode || 'band', RY = MODE === 'peek' ? -130 : -58;
    var read = window.ShelfRead(stage), books = sh.books;
    books.forEach(function (b) {
      b.st = Object.assign({}, sh.REST); b.sp = {}; b.phase = 'rest';
      NAMES.forEach(function (n) { b.sp[n] = new K.Spring(n === 's' ? 1 : 0, 200, 0.7); });
    });
    var bird = window.ShelfBird(sh, { size: Math.round(52 * k), notice: 420 });
    var loop = K.Loop(render), cur = -1, busy = false, dwell = null, leaveT = null, quiet = false;
    var rm = function () { return window.Pen && Pen.reduced(); };

    // ---- the pose in your hand ----------------------------------------------------------------------------
    // Sized so the board lands at CW px on screen whatever the book; lifted so its foot clears the row's heads
    // (the gap and the leaning neighbours stay visible under it); kept inside the view.
    function heldPose(b) {
      var P = sh.P, dz = b.D + Math.round(40 * k), zc = dz - b.D / 2, pk = P / (P - zc);
      var s = CW / (b.D * pk), Hs = b.h * s * pk, Ws = (0.87 * b.D + 0.5 * b.w) * s * pk;
      var rowTop = sh.plankY - sh.rowH * 0.96, bottom = rowTop + (cfg.overlap || 30);
      if (bottom - Hs < 14) bottom = 14 + Hs;
      var cyS = bottom - Hs / 2, cy = sh.oy + (cyS - sh.oy) / pk;
      var vw = view.clientWidth, sl = scrollFor(b), ox = sl + vw / 2;
      if (MODE === 'peek') Ws = 1.56 * b.D * s * pk;
      var cxS = Math.max(sl + 12 + Ws / 2, Math.min(sl + vw - 12 - Ws / 2, b.cx)), cx = ox + (cxS - ox) / pk;
      if (MODE === 'peek') cx += (0.38 * b.D + 0.32 * b.w) * s;          // centre the V on its hinge, not the book
      return { dx: cx - b.cx, dy: cy - (sh.plankY - b.h / 2), dz: dz, s: s, rx: RX, ry: RY, rz: RZ, lean: 0, tip: 0 };
    }
    // Square to you, board centred so that when it opens the spread is centred.
    function facePose(b) {
      var P = sh.P, dz = b.D + Math.round(60 * k), zc = dz - b.D / 2, pk = P / (P - zc);
      var rowTop = sh.plankY - sh.rowH * 0.96, H = Math.min(cfg.faceH || 300, rowTop - 40);
      var s = H / (b.h * pk), cov = b.D * s * pk;
      var vw = view.clientWidth, sl = view.scrollLeft, ox = sl + vw / 2, cxS = ox + cov / 2 - b.w * s * pk * 0.25;
      var cyS = Math.max(16 + H / 2, (rowTop - 18) / 2 + 8);
      return { dx: ox + (cxS - ox) / pk - b.cx, dy: sh.oy + (cyS - sh.oy) / pk - (sh.plankY - b.h / 2), dz: dz, s: s, rx: 0, ry: -90, rz: 0, lean: 0, tip: 0 };
    }
    function scrollFor(b) { return cfg.shelf.strip ? Math.max(0, Math.min(view.scrollWidth - view.clientWidth, b.cx - view.clientWidth / 2)) : view.scrollLeft; }
    function aim(b, pose, stiff) { NAMES.forEach(function (n) { if (pose[n] != null) b.sp[n].t = pose[n]; }); if (stiff) NAMES.forEach(function (n) { b.sp[n].tune(stiff[0], stiff[1]); }); }

    // ---- neighbours: they lose support only when the book is clear of the row ------------------------------
    function setLean(i, amt) {
      var g = books[i].w + Math.round(5 * k);           // the gap the book leaves
      books.forEach(function (o, j) {
        var d = j - i, t = 0;
        if (Math.abs(d) === 1) t = Math.asin(Math.min(0.5, 0.32 * g * amt / o.h)) * 180 / Math.PI;
        if (Math.abs(d) === 2) t = Math.asin(Math.min(0.5, 0.11 * g * amt / o.h)) * 180 / Math.PI;
        if (t && (o.phase === 'rest' || o.phase === 'hook')) { o.sp.lean.tune(150, 0.36).t = d < 0 ? t : -t; }
      });
      loop.kick();
    }
    function shove(i) {                                  // the returning book pushes them upright: overshoot, settle
      [i - 2, i - 1, i + 1, i + 2].forEach(function (j) {
        var o = books[j]; if (!o || o.phase === 'out') return;
        o.sp.lean.tune(260, 0.4); o.sp.lean.t = 0;
        if (Math.abs(j - i) === 1) o.sp.lean.v += (j < i ? -1 : 1) * 26;
      });
    }

    // ---- the gesture ------------------------------------------------------------------------------------
    function hook(i) { var b = books[i]; b.phase = 'hook'; b.sp.tip.tune(380, 0.55).t = HOOK; b.sp.dz.tune(300, 0.8).t = 3; }
    function pull(i) {
      var b = books[i]; buildCover(b);
      b.phase = 'out'; b.lifted = b.turned = b.penOn = b.cracked = false; b.box.classList.add('held');
      b.pose = heldPose(b);
      b.sp.dz.tune(230, 0.9).t = b.pose.dz; b.sp.tip.tune(260, 0.7).t = 2;
      if (cfg.shelf.strip) view.scrollTo({ left: scrollFor(b), behavior: rm() ? 'auto' : 'smooth' });
    }
    function release(i) {
      var b = books[i];
      b.box.classList.remove('held');
      if (b.pen) b.pen.hide();
      if (b.phase === 'hook') { b.phase = 'back'; b.slid = b.shoved = true; b.sp.tip.tune(420, 0.8).t = 0; b.sp.dz.t = 0; return; }
      if (b.phase !== 'out') return;
      b.phase = 'back'; b.slid = b.shoved = false;
      // paper retracts faster than it rose (like the pen): stiffer, fully damped
      aim(b, { dx: 0, dy: -5, s: 1, rx: 0, ry: 0, rz: 0, lf: 0 }, [340, 0.92]);
      if (!b.lifted) { b.slid = true; b.sp.dz.tune(340, 0.95).t = 0; b.sp.tip.t = 0; b.sp.dy.t = 0; }
    }
    function phaseTick(b, i) {
      var sp = b.sp;
      if (b.phase === 'out') {
        if (!b.lifted && sp.dz.x > b.D * 0.42) { b.lifted = true; sp.dy.tune(150, 0.8).t = b.pose.dy; sp.dx.tune(150, 0.82).t = b.pose.dx; }
        if (!b.turned && sp.dz.x > b.D * 0.72) {
          b.turned = true; setLean(i, 1);
          sp.ry.tune(MODE === 'peek' ? 150 : 125, 0.62).t = RY; sp.rx.tune(125, 0.7).t = RX; sp.rz.tune(100, 0.6).t = RZ; sp.s.tune(140, 0.74).t = b.pose.s; sp.tip.t = 0;
        }
        // peek: the cover faces you on the way round, then the board opens
        if (MODE === 'peek' && b.turned && !b.cracked && sp.ry.x < -78) { b.cracked = true; sp.lf.tune(130, 0.62).t = LEAF; }
        if (b.turned && !b.penOn && Math.abs(sp.ry.x - RY) < 4 && Math.abs(sp.ry.v) < 30 && (MODE !== 'peek' || sp.lf.x < LEAF + 8)) {
          b.penOn = true; b.pen.show(); bird.consider(i);
        }
      } else if (b.phase === 'back') {
        if (!b.slid && sp.ry.x > -16) { b.slid = true; sp.dz.tune(300, 0.92).t = 0; sp.tip.t = 0; }
        if (b.slid && !b.shoved && sp.dz.x < b.D + 4) { b.shoved = true; shove(i); }
        if (b.slid && sp.dz.x < 14) sp.dy.t = 0;
      }
    }
    function render(dt) {
      var moving = false;
      books.forEach(function (b, i) {
        if (b.frozen) return;
        var m = false;
        NAMES.forEach(function (n) { if (b.sp[n].step(dt)) m = true; });
        if (b.sp.dy.x > 0) { b.sp.dy.x = 0; b.sp.dy.v = -b.sp.dy.v * 0.25; }     // the plank is solid: a small bounce
        phaseTick(b, i);
        if (b.phase === 'back' && !m && b.sp.dz.x === 0) { b.phase = 'rest'; if (b.hookAfter) { b.hookAfter = false; if (cur === i) { hook(i); m = true; } } }
        if (m || b.dirty) { NAMES.forEach(function (n) { b.st[n] = b.sp[n].x; }); sh.place(b, b.st); b.dirty = false; }
        moving = moving || m;
      });
      bird.tick();
      return moving;
    }
    function consider(i) {
      if (busy || read.open || i === cur) return;
      var prev = cur; cur = i;
      clearTimeout(dwell);
      if (prev >= 0) release(prev);
      if (i >= 0) {
        hook(i);
        // sweeping across the spines ripples the hooks; only the one you pause on comes out
        if (rm()) pull(i); else dwell = setTimeout(function () { if (cur === i) { pull(i); loop.kick(); } }, DWELL * K.SLOW());
      } else bird.cancel();
      cfg.onConsider && cfg.onConsider(i);
      loop.kick();
    }

    function buildCover(b) { if (!b.built) { b.built = true; window.ShelfCover.build(b, CW, MODE); } }

    // ---- open / close (WAAPI, spring-baked) ------------------------------------------------------------------
    function frames(b, list) { return list.map(function (q) { var f = { transform: sh.css(sh.ops(b, q[0])) }; if (q[1] != null) f.offset = q[1]; if (q[2]) f.easing = q[2]; return f; }); }
    async function open(i) {
      if (busy || read.open) return;
      busy = true;
      clearTimeout(dwell); clearTimeout(leaveT);
      if (cur !== i) { if (cur >= 0) release(cur); cur = i; }
      var b = books[i]; buildCover(b);
      if (b.pen) b.pen.hide();
      b.frozen = true; b.phase = 'open'; b.box.classList.remove('held');
      // the bird is startled off the book as it is taken (or gives up on it mid-journey); it gets a head start
      if (bird.perch === i) { bird.hopOff(i); await K.wait(70); } else if (bird.want === i) bird.hopOff(i);
      var from = Object.assign({}, b.st), face = facePose(b);
      var clear = Object.assign({}, from, { dz: Math.max(from.dz, b.D + 40 * k), tip: 0 });
      setLean(i, 1.5);                                      // the gap is real now: they lean further
      var needClear = from.dz < b.D * 0.8;
      await Promise.all([
        K.play(b.box, frames(b, needClear ? [[from, 0, K.curve(0.9)], [clear, 0.24, K.curve(0.8)], [face]] : [[from, 0, K.curve(0.82)], [face]]),
          { duration: needClear ? 900 : 640, easing: 'linear' }),
        K.play(b.F.leaf, [{ transform: 'rotateY(' + from.lf.toFixed(2) + 'deg)' }, { transform: 'rotateY(-172deg)' }], { duration: 520, delay: needClear ? 620 : 380, easing: K.curve(0.74) })
      ]);
      face.lf = -172; b.st = face; sh.place(b, face);
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
      var face = b.st, above = Object.assign({}, sh.REST, { dy: -Math.min(80, b.h * 0.4), dz: b.D + 30 * k });
      var home = Object.assign({}, sh.REST, { dy: -3 });
      await Promise.all([
        K.play(b.F.leaf, [{ transform: 'rotateY(-172deg)' }, { transform: 'rotateY(0deg)' }], { duration: 380, easing: K.curve(0.92) }),
        K.play(b.box, frames(b, [[face, 0, K.curve(0.95)], [Object.assign({}, face, { ry: -60, rx: 2 }), 0.3, K.curve(0.9)], [above, 0.66, 'cubic-bezier(.45,0,.8,.6)'], [home]]),
          { duration: 1080, easing: 'linear', delay: 120 })
      ]);
      // hand back to the springs: it lands with weight, the neighbours are shoved upright and wobble
      NAMES.forEach(function (n) { b.sp[n].x = b.sp[n].t = home[n]; b.sp[n].v = 0; });
      b.sp.dy.t = 0; b.sp.dy.v = 60; b.st = Object.assign({}, home);
      b.frozen = false; b.phase = 'back'; b.slid = b.shoved = true; cur = -1; shove(i); loop.kick();
      busy = false;
      if (viaKey) { quiet = true; b.hit.focus({ preventScroll: true }); quiet = false; cur = i; b.hookAfter = true; }
      else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    }

    // ---- wiring: pointer, touch, keyboard ----------------------------------------------------------------------
    function leaveSoon() { clearTimeout(leaveT); leaveT = setTimeout(function () { var f = document.activeElement; if (!(cur >= 0 && f === books[cur].hit && f.matches(':focus-visible'))) consider(-1); }, 180 * K.SLOW()); }
    host.addEventListener('pointerover', function (e) {
      if (tap || e.pointerType === 'touch') return;
      var a = e.target.closest('.bk-hit');
      if (a) { clearTimeout(leaveT); consider(+a.dataset.i); return; }
      if (e.target.closest('.book.held')) { clearTimeout(leaveT); return; }
      leaveSoon();
    });
    view.addEventListener('pointerleave', function (e) { if (!tap && e.pointerType !== 'touch') leaveSoon(); });
    host.addEventListener('click', function (e) {
      var a = e.target.closest('.bk-hit');
      if (a) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;                  // the real link still opens a tab
        e.preventDefault();
        var i = +a.dataset.i;
        if (cur !== i || books[i].phase !== 'out') { if (tap || e.pointerType === 'touch') { consider(i); if (cur === i && books[i].phase === 'hook') { clearTimeout(dwell); pull(i); loop.kick(); } return; } }
        open(i); return;
      }
      if (e.target.closest('.book.held') && cur >= 0) { open(cur); return; }
      if (tap && !e.target.closest('.rd')) consider(-1);
    });
    books.forEach(function (b, i) {
      b.hit.tabIndex = i === 0 ? 0 : -1;
      b.hit.addEventListener('keydown', function (e) {
        var j = null, kk = e.key;
        if (kk === 'ArrowRight' || kk === 'ArrowDown') j = i + 1; else if (kk === 'ArrowLeft' || kk === 'ArrowUp') j = i - 1;
        else if (kk === 'Home') j = 0; else if (kk === 'End') j = books.length - 1;
        // Esc puts the book back; it stays under your finger (hooked) so keyboard focus stays visible
        else if (kk === 'Escape') { if (cur === i && books[i].phase === 'out') { e.preventDefault(); clearTimeout(dwell); release(i); books[i].hookAfter = true; loop.kick(); } return; }
        else if (kk === ' ') { e.preventDefault(); open(i); return; }
        if (j == null) return;
        e.preventDefault(); books[Math.max(0, Math.min(books.length - 1, j))].hit.focus({ preventScroll: true });
      });
      b.hit.addEventListener('focus', function () {
        books.forEach(function (o) { o.hit.tabIndex = -1; }); b.hit.tabIndex = 0;
        if (!quiet && b.hit.matches(':focus-visible')) consider(i);          // keyboard focus = hover; a click's focus is not
      });
      b.hit.addEventListener('blur', function (e) { if (!e.relatedTarget || !sh.world.contains(e.relatedTarget)) { if (!tap) consider(-1); } });
    });
    bird.home();
    window.addEventListener('resize', function () { if (!busy && !read.open) { consider(-1); sh.layout(); bird.home(); } });
    document.addEventListener('mock:rm', function () { books.forEach(function (b) { NAMES.forEach(function (n) { b.sp[n].snap(); }); b.dirty = true; }); loop.kick(); });

    return {
      sh: sh, read: read, consider: consider, open: open, close: close, bird: bird,
      get busy() { return busy; }, get cur() { return cur; },
      replay: async function (i) {
        if (busy) return;
        if (read.open) { close(cur); return; }
        consider(-1); await K.wait(500);
        consider(i); await K.wait(2600);
        await open(i); await K.wait(1800);
        await close(i);
      }
    };
  }
  window.PullShelf = PullShelf;
})();
