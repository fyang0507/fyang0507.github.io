/* r3-10 · the fall (replaces r2-10-gag.js). Fred: "remove the chain reaction … just let the objects fall after the
   opening." So there is no loading line, no peck, no snap, and nothing on the desk causes anything else.
   The hard cut from the OP finds the same bird it just gave the close-up, standing on the empty desk. It never moves.
   The desk's objects fall around it in a drum fill (intervals 160 → 120 → 100 → 80 → 70 ms), each landing
   firing only its own reaction. Then the portrait, which landed face-down, pops itself upright, surprised
   (its own delayed take, 180 ms after the last landing). The bird doesn't flinch.
   Honest loading: "go" is the cut or the moment every byte is decoded, whichever is later. Until then the empty
   desk holds, still and quiet; "tap to skip" appears after 1.5 s of holding. The opener is over by 6.5 s, always:
   a desk that arrives too late for the full score gets the short one (a hard cut to the page's framing, the
   returning fill, no card), and one too late even for that fades in as a plain page.
   Returning (same session): no OP, no card. The empty desk, the bird on it, and the objects already falling as
   the page appears, tighter, in the page's own layout.
   Everything runs on the master's clock (R.t, ms), built by r3-10-seq.js. */
(function () {
  var P = R10Phys, St = R10Stage, Fx = R10Fx;
  var box = document.querySelector('.deskbox'), host = document.getElementById('desk-host');
  var G_SCREEN = 5600;           // gravity, CSS px/s², converted per viewport into desk-image px
  var CAP_MS = 6500;             // on the run's clock: the opener is over by now, whatever the bytes are doing
  var HINT_MS = 1500;            // this long holding on the empty desk, and it offers the skip
  // Landings, ms after go. Returning is tighter, so it goes back row first (laptop, plant, frame), then front row (mug,
  // camera, book): in each column the front object lands 130 ms after the one behind it, so six bodies 40 ms apart
  // never tumble through the same column together. Its reactions are only the ones that end before the hand-off (no card
  // hides that swap): dust, shake, caret, page, pop, the local flash, the leaf. The steam puff and the 咔嚓 would
  // outlive it; the live desk's own steam and 咔嚓 take over from there.
  var LAND = { first: { laptop: 400, mug: 560, book: 680, frame: 780, camera: 860, plant: 930 },
    returning: { laptop: 200, plant: 240, frame: 280, mug: 330, camera: 370, book: 410 } };
  var POP = { first: 1110, returning: 390 };     // the portrait rights itself
  var CALM = { first: null, returning: 600 };    // …and its face settles back to neutral
  var END = { first: 1350, returning: 660 };     // first: cut to the eyecatch · returning: the desk is live
  var ABOVE = { first: null, returning: 340 };   // released this far (px) above the top edge; null = r2's 1.3 × its fall into view
  var WIDE_AT = 150;             // portrait, first visit: the mid shot on the bird cuts wide just before the laptop shows
  var BIRD_X = 15;               // the bird's mark (desk %), facing right: where the live desk's bird starts
  var live = null;

  // ---- the live desk (board 09's faithful copy), built only once its images are decoded ----
  function ensureLive() {
    if (live) return live;
    live = HomeDesk.build(host, {});
    // The live desk's own fade-ins would keep its layers composited on a different pixel grid from the fall
    // layer's: cancel the fades whose resting style is visible, finish the draw-ins (restarted at reveal).
    live.el.querySelectorAll('.scene-img, .bookhold, .frameface, .bird, .screen').forEach(function (e) { e.getAnimations().forEach(function (a) { if (a.effect.getTiming().iterations !== Infinity) a.cancel(); }); });
    live.el.getAnimations({ subtree: true }).forEach(function (a) { if (a.effect.getTiming().iterations !== Infinity && a.playState !== 'idle') a.finish(); });
    hold();
    return live;
  }
  // Every run takes the live desk's bird and portrait back from their idle loops (a replay reuses the live desk) and
  // parks the bird on its mark now, under the fall layer, so the hand-off never catches it mid-hop or mid-slide.
  function hold() {
    live.bird.held = true; live.frameHeld = true;
    live.bird.x = BIRD_X; live.bird.dir = 1; live.bird.apply(); live.bird.setF(0);
  }
  function restartIntro() {                       // arrows draw, labels rise, the spark lands, as on index.html
    live.el.querySelectorAll('.arrows .stroke, .navnote .lbl, .spark').forEach(function (e) {
      e.getAnimations().forEach(function (a) { a.currentTime = 0; a.play(); });
    });
  }

  // ---- the camera (first visit only; the eyecatch's cut hides its return to the page layout) ----
  // Landscape: one wide framing of the whole desk (×≤1.5). Portrait: a mid shot on the bird for the silence,
  // then a hard cut to the wide (the desk low and large, a long drop above) as the fall comes into view.
  function cameras(R) {
    box.style.transform = '';
    var r = box.getBoundingClientRect(), W = innerWidth, H = innerHeight;
    function cam(tx, ty, s) { return { tx: tx, ty: ty, s: s, css: 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')' }; }
    R.r0 = { left: r.left, top: r.top, width: r.width, height: r.height };
    R.camPage = cam(0, 0, 1);
    if (W / H > .8) {
      var s = Math.min(1.5, W * .94 / (r.width * .946), H * .92 / (r.height * .718));
      R.camWide = R.camMid = cam(W / 2 - (r.left + s * r.width * .5), H * .5 - (r.top + s * r.height * .58), s);
    } else {
      var sw = Math.min(1.6, (W - 16) / (r.width * .815)), sm = Math.min(3.4, W * .19 / (.07 * r.width));
      R.camWide = cam(W / 2 - (r.left + sw * r.width * .5475), H * .57 - (r.top + sw * r.height * .54), sw);
      R.camMid = cam(W * .1 - (r.left + sm * r.width * .15), H * .6 - (r.top + sm * r.height * .756), sm);
    }
    if (R.mode !== 'first') R.camWide = R.camMid = R.camPage;
  }
  function setCam(R, c) { R.cam = c === R.camPage ? '' : c.css; box.style.transform = R.cam; }

  // Built at run start, under the OP: the layer, the bird on its mark. The objects stay out of frame until they fall.
  function prepare(R) {
    var S = R.S = St.build(box);
    S.under.remove(); S.lbl.remove();             // round 2's loading line and its label: gone
    if (live) hold();
    R.bodies = {};
    cameras(R);
    setCam(R, R.camMid);
    var b = S.bird;
    b.el.classList.add('in'); b.el.style.left = BIRD_X + '%'; b.el.style.transform = 'scaleX(-1)';
    St.birdFrame(S, 0);
    R.hint = document.createElement('div');
    R.hint.className = 'skip-hint'; R.hint.setAttribute('aria-hidden', 'true');
    R.hint.textContent = 'tap to skip · 点按跳过';
    document.body.appendChild(R.hint);
    var r = R;
    function g1() { if (r.alive) onG1(r); }
    if (R.L.g1.done) g1(); else R.L.g1.then(g1);
    if (R.L.g2.done) S.op.classList.add('g2'); else R.L.g2.then(function () { if (r.alive) S.op.classList.add('g2'); });
    function all() { if (r.alive) { ensureLive(); r.ready = true; } }
    if (R.L.all.done) all(); else R.L.all.then(all, all);   // a failed asset still lets the page load as a page
  }
  var CUT = ['../../assets/desk-scene2-light.png', 'assets-gen/10d-mask-plate.png', 'assets-gen/10d-mask-obj.png', 'assets-gen/10d-mask-aux.png'];
  function onG1(R) {
    var im = CUT.map(function (u) { var i = new Image(); i.src = u; return i; });   // already decoded: cache hits
    Promise.all(im.map(function (i) { return i.decode(); })).then(function () {
      if (R.alive && R.S) St.premask(R.S, im[0], { plate: im[1], obj: im[2], aux: im[3] }).then(function () { if (R.alive && R.S) deskSet(R); });
    });
  }
  function deskSet(R) {
    var S = R.S;
    S.op.classList.add('g1');
    Object.keys(S.edge).forEach(function (k) { S.edge[k].src = 'assets-gen/10d-edge.png'; });
    R.k = box.offsetWidth / St.W;                 // layout px per desk px (inside the camera)
    S.op.classList.add('set');
  }

  // The hard cut from the OP lands here (returning: the run starts here).
  function cut(R) { R.cutAt = R.t; }

  function frame(R, dt) {
    Object.keys(R.bodies).forEach(function (k) {
      var b = R.bodies[k]; if (b.manual) return;
      P.step(b, dt); R.S.body[k].style.transform = P.transform(b, R.k);
      if (b.settled && !b.rest) { b.rest = true; if (R.S.edge[k]) R.S.edge[k].classList.add('gone'); }
    });
    if (R.leafT != null) {
      var a = P.ring(9, 5, .2, (R.t - R.leafT) / 1000);
      R.S.leaf.style.transform = a ? 'rotate(' + a.toFixed(2) + 'deg)' : '';
    }
    if (R.phase !== 'desk' || R.goAt != null) return;
    var score = fits(R);
    if (!score) { R.goAt = -1; return R.onCapped(); }
    if (R.ready && R.k) return go(R, score);
    if (R.t - R.cutAt >= HINT_MS) R.hint.classList.add('on');   // still holding: offer the skip, say nothing else
  }
  // The fullest score that still ends by the cap (first adds the eyecatch's R.cardMs); null = none does.
  function fits(R) {
    var room = CAP_MS - R.t;
    if (R.mode === 'first' && END.first + R.cardMs <= room) return 'first';
    return END.returning <= room ? 'returning' : null;
  }

  // ---- the fall: a fixed score from go ----
  function go(R, score) {
    var T = R.goAt = R.t, m = R.score = score, land = LAND[m];
    R.hint.classList.remove('on');
    if (m !== R.mode) { R.camWide = R.camMid = R.camPage; setCam(R, R.camPage); }   // late: cut to the page's framing
    if (R.camMid !== R.camWide) Fx.at(R, T + WIDE_AT, function () { setCam(R, R.camWide); });
    Object.keys(land).forEach(function (k) { schedule(R, k, T + land[k]); });
    Fx.at(R, T + END[m], function end() {             // never ahead of the portrait's own take
      if (R.popAt == null || R.t < R.popAt + 110) return Fx.later(R, 17, end);
      R.onEnd();
    });
  }
  // The portrait's take: it rights itself on the score's beat, and never sooner than 100 ms after its own landing.
  function take(R) {
    var m = R.score, t = Math.max(R.t + 100, R.goAt + POP[m]);
    Fx.at(R, t, function () { R.popAt = R.t; Fx.popUp(R); });
    if (CALM[m]) Fx.at(R, t + CALM[m] - POP[m], function () { St.faceFrame(R.S, 0); });
  }

  // Mass is felt in restitution, squash and how the rock settles; gravity is the same for all (from r2).
  var FEEL = {
    laptop: { e: .1, sqGain: .000026, ks: 7, zs: .5, kr: 3.4, zr: .7, th: -3.5, w: 12, dust: [288, 738, 594, 1.35], shake: 3 },
    mug: { e: .14, sqGain: .000042, ks: 9, zs: .32, kr: 3.2, zr: .3, th: 9, w: -40, dust: [360, 470, 753, .8] },
    book: { e: .03, sqGain: .00009, ks: 11, zs: .45, kr: 5, zr: .8, th: -6, w: 20, dust: [528, 828, 899, 1.1], flat: true },
    camera: { e: .13, sqGain: .000036, ks: 8, zs: .4, kr: 3.6, zr: .5, th: 6, w: -25, dust: [996, 1242, 867, 1.05], shake: 1.5 },
    frame: { e: .15, sqGain: .00003, ks: 10, zs: .4, kr: 4, zr: .6, th: -14, w: 160, airDamp: .2, dust: [826, 985, 612, .75] },
    plant: { e: .12, sqGain: .000045, ks: 8, zs: .38, kr: 3, zr: .4, th: -5, w: 18, dust: [1150, 1256, 566, 1], shake: 1 }
  };
  // Dropped from above the top edge so that it lands at tLand. A release that is already past starts mid-fall,
  // exactly where a body dropped that long ago would be, but never so late that it would appear inside the frame:
  // if the score asks for that, the landing slips instead.
  function schedule(R, k, tLand) {
    var f = FEEL[k], geo = R.S.GEO[k], c = R.camWide;               // measured in the framing it falls in
    var sc = R.r0.width * c.s / St.W, footY = R.r0.top + c.ty + geo.foot * R.r0.height * c.s / St.H;
    var b = R.bodies[k] = P.body({ e: f.e, sqGain: f.sqGain, ks: f.ks, zs: f.zs, kr: f.kr, zr: f.zr, airDamp: f.airDamp || .6, g: G_SCREEN / sc });
    var above = ABOVE[R.score] == null ? footY * .3 + 50 : ABOVE[R.score], h = (footY + above) / sc;
    var T = P.fallTime(b, h) * 1000, enter = P.fallTime(b, above / sc) * 1000;
    var rel = Math.max(tLand - T, R.t - enter);
    b.onImpact = function (b, v, n) { if (n === 0) land(R, k, f); };
    Fx.at(R, Math.max(R.t, rel), function () {
      P.drop(b, h, f.th - f.w * T / 1000, f.w);
      if (R.t > rel) P.step(b, (R.t - rel) / 1000);
      R.S.body[k].classList.add('in');
    });
  }
  function land(R, k, f) {
    var S = R.S, first = R.score === 'first';
    Fx.dust(R, [f.dust[0], f.dust[1], f.dust[2]], f.dust[3], f.flat);
    if (f.shake) Fx.shake(R, f.shake);
    if (S.tone[k]) S.tone[k].classList.add('in');
    if (k === 'laptop') Fx.later(R, 90, function () { Fx.caret(R); });
    if (k === 'mug' && first) Fx.steam(R);
    if (k === 'book') Fx.pages(R);
    if (k === 'camera') { if (first) Fx.flash(R); else flashOnly(R); }
    if (k === 'frame') { S.body.frame.classList.add('flat'); R.bodies.frame.th = 0; R.bodies.frame.w = 0; take(R); }
    if (k === 'plant') R.leafT = R.t;
  }
  // The camera's local flash without the 咔嚓 and star (returning: they would outlive the hand-off). One flash.
  function flashOnly(R) {
    var el = R.S.flash;
    Fx.run(R, 260, function (age) { el.style.opacity = Fx.kf([[0, 0], [.07, .95], [.3, .3], [1, 0]], age / 260).toFixed(3); }, function () { el.style.opacity = 0; });
  }

  // ---- hand-off: the live desk, synced underneath the fall layer ----
  // Under a cut (the eyecatch) the fall layer simply goes. Returning has no cut, and the fall layer's pre-masked
  // pieces sit on a sub-pixel different grid from the live <img> (outlines differ by ~3/255 on average), so there it
  // dissolves into the live desk over 120 ms instead: a blend of two near-identical frames, never a visible tick.
  function swapToLive(R, dissolve) {
    ensureLive();
    if (R) R.cam = '';
    live.bird.x = BIRD_X; live.bird.dir = 1; live.bird.apply(); live.bird.setF(0);
    live.setFrame(0);
    live.el.querySelectorAll('.steam path, .caret').forEach(function (p) { p.getAnimations().forEach(function (a) { a.currentTime = 0; }); });
    box.style.transform = '';
    if (!R || !R.S) return;
    var op = R.S.op;
    if (!dissolve) { op.style.visibility = 'hidden'; return; }
    R.S = null;                                   // teardown leaves it to the dissolve
    op.style.pointerEvents = 'none';
    op.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'linear', fill: 'forwards' }).onfinish = function () { op.remove(); };
  }
  function release() { if (live) { live.bird.held = false; live.frameHeld = false; } }
  function reveal() { ensureLive(); restartIntro(); }
  function staticDesk() { ensureLive(); box.style.transform = ''; live.bird.x = BIRD_X; live.bird.dir = 1; live.bird.apply(); release(); }
  function teardown(R) {
    if (R && R.hint) { R.hint.remove(); R.hint = null; }
    if (R && R.S) { R.S.op.remove(); R.S = null; }
  }

  window.R10Fall = { prepare: prepare, cut: cut, frame: frame, swapToLive: swapToLive, release: release, reveal: reveal,
    staticDesk: staticDesk, teardown: teardown, ensureLive: ensureLive, CAP_MS: CAP_MS };
})();
