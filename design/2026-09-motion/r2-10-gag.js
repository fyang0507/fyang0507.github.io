/* r2-10 · the gag (10-opener-d's chain reaction), cut to fit behind the OP. No walk-in: the OP's last shot is
   the bird in close-up saying "…", and the hard cut finds that same bird already on the empty desk, head
   down, staring at a coral pen line that fills with the real bytes. Act 1 (honest, open-ended): the bird
   keeps staring for exactly as long as loading takes. Act 2 (a fixed score from the peck, Tp): the line
   snaps, a beat of nothing, then the desk's objects fall in a drum fill — intervals 160 → 120 → 100 → 80 → 70
   ms — each landing firing its own reaction; the last one jolts the portrait upright. Then the master cuts to
   the eyecatch card. Returning: the desk is already set and only the plant drops in.
   Everything runs on the master's clock (R.t, ms), built by r2-10-cd.js. */
(function () {
  var P = R10Phys, St = R10Stage, Fx = R10Fx;
  var box = document.querySelector('.deskbox'), host = document.getElementById('desk-host');
  var G_SCREEN = 5600;           // gravity, CSS px/s² — converted per viewport into desk-image px
  var LINE_MS = 300;             // the pen's top speed: a full line in 0.3 s, never ahead of the bytes
  var TAKE = 120;                // the bird's take once the line is full, before it pecks
  var CAP_MS = 6500;             // after this nobody waits: the bird pecks and the page loads as a page
  var HINT_MS = 1500;            // this long on the desk and the label offers the skip
  var LAND = { laptop: 500, mug: 660, book: 780, frame: 880, camera: 960, plant: 1030 };   // ms after the peck
  var CARD_AFTER = 250;          // the plant lands, the portrait pops … cut
  var RET_LAND = 120, RET_FALL = 300;   // returning: the plant is mid-air at the cut and lands 120 ms later
  var WIDE_AT = 280;             // portrait: ms after the peck, the cut from the mid shot to the wide
  var BIRD_X = 15;               // where the bird stands (desk %), facing right, just short of the mug
  var live = null;

  // ---- the live desk (board 09's faithful copy), built only once its images are in cache ----
  function ensureLive() {
    if (live) return live;
    live = HomeDesk.build(host, {});
    // The live desk's own fade-ins would keep its layers composited on a different pixel grid from the
    // gag layer's: cancel the fades whose resting style is visible, finish the draw-ins (restarted at reveal).
    live.el.querySelectorAll('.scene-img, .bookhold, .frameface, .bird, .screen').forEach(function (e) { e.getAnimations().forEach(function (a) { if (a.effect.getTiming().iterations !== Infinity) a.cancel(); }); });
    live.el.getAnimations({ subtree: true }).forEach(function (a) { if (a.effect.getTiming().iterations !== Infinity && a.playState !== 'idle') a.finish(); });
    live.bird.held = true; live.frameHeld = true;
    return live;
  }
  function restartIntro() {                       // arrows draw, labels rise, the spark lands — as on index.html
    live.el.querySelectorAll('.arrows .stroke, .navnote .lbl, .spark').forEach(function (e) {
      e.getAnimations().forEach(function (a) { a.currentTime = 0; a.play(); });
    });
  }

  // ---- the camera: the gag plays larger than the page layout, and the card's cut hides the return ----
  // Landscape: one wide framing of the whole desk (×≤1.5). Portrait: a mid shot on the bird and its line for
  // act 1, then — on the snap — a hard cut to D's portrait wide (the desk low and large, a long drop above).
  function cameras(R) {
    box.style.transform = '';
    var r = box.getBoundingClientRect(), W = innerWidth, H = innerHeight;
    function cam(tx, ty, s) { return { tx: tx, ty: ty, s: s, css: 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')' }; }
    R.r0 = { left: r.left, top: r.top, width: r.width, height: r.height };
    if (W / H > .8) {
      var s = Math.min(1.5, W * .94 / (r.width * .946), H * .92 / (r.height * .718));
      R.camWide = R.camMid = cam(W / 2 - (r.left + s * r.width * .5), H * .5 - (r.top + s * r.height * .58), s);
    } else {
      var sw = Math.min(1.6, (W - 16) / (r.width * .815)), sm = Math.min(3.4, W * .19 / (.07 * r.width));
      R.camWide = cam(W / 2 - (r.left + sw * r.width * .5475), H * .57 - (r.top + sw * r.height * .54), sw);
      R.camMid = cam(W * .1 - (r.left + sm * r.width * .15), H * .6 - (r.top + sm * r.height * .756), sm);
    }
  }
  function setCam(R, c) { R.cam = c ? c.css : ''; box.style.transform = R.cam; }

  // Built at run start, hidden under the OP: the layer, the bird on its mark, the (undrawn) line.
  function prepare(R) {
    var S = R.S = St.build(box);
    R.bodies = {}; R.tip = 0; R.bx = BIRD_X; R.bdir = 1; R.brot = R.mode === 'first' ? -13 : 0;
    cameras(R);
    setCam(R, R.mode === 'first' ? R.camMid : null);   // the callback plays in the final layout
    S.op.classList.toggle('portrait', innerWidth / innerHeight <= .8);
    initLine(R);
    S.lbl.style.visibility = 'hidden';
    S.lbl.style.fontSize = (12 / (R.mode === 'first' ? R.camMid.s : 1)).toFixed(2) + 'px';   // 12 px on screen
    S.bird.el.classList.add('in'); applyBird(R); St.birdFrame(S, 0);   // drawn once its strip is here (.g1)
    var r = R;
    function g1() { if (r.alive) onG1(r); }
    if (R.L.g1.done) g1(); else R.L.g1.then(g1);
    if (R.L.g2.done) S.op.classList.add('g2'); else R.L.g2.then(function () { if (r.alive) S.op.classList.add('g2'); });
    if (R.L.all.done) { ensureLive(); R.ready = true; } else R.L.all.then(function () { if (r.alive) { ensureLive(); r.ready = true; } });
  }
  var CUT = ['../../assets/desk-scene2-light.png', 'assets-gen/10d-mask-plate.png', 'assets-gen/10d-mask-obj.png', 'assets-gen/10d-mask-aux.png'];
  function onG1(R) {
    var im = CUT.map(function (u) { var i = new Image(); i.src = u; return i; });   // already streamed + decoded: cache hits
    Promise.all(im.map(function (i) { return i.decode(); })).then(function () { if (R.alive && R.S) setDesk(R, im); });
  }
  function setDesk(R, im) {
    St.premask(R.S, im[0], { plate: im[1], obj: im[2], aux: im[3] }).then(function () { if (R.alive && R.S) deskSet(R); });
  }
  function deskSet(R) {
    var S = R.S;
    S.op.classList.add('g1');
    Object.keys(S.edge).forEach(function (k) { S.edge[k].src = 'assets-gen/10d-edge.png'; });
    R.k = box.offsetWidth / St.W;                             // layout px per desk px (inside the camera)
    S.op.classList.add('set');
    if (R.mode === 'returning') {                             // the desk is already set; the plant is missing
      ['laptop', 'mug', 'camera', 'book', 'frame'].forEach(function (k) { S.body[k].classList.add('in'); if (S.tone[k]) S.tone[k].classList.add('in'); rest(S, k); });
      S.body.frame.classList.remove('air');
      S.caret.classList.add('on');
    }
  }

  // The hard cut from the OP lands here.
  function cut(R) {
    R.cutAt = R.t;
    if (R.mode === 'first') { R.lineOn = true; R.S.lbl.style.visibility = ''; R.nextIdle = R.t + 1500; }
  }

  function frame(R, dt) {
    lineFrame(R, dt);
    Object.keys(R.bodies).forEach(function (k) {
      var b = R.bodies[k]; if (b.manual) return;
      P.step(b, dt); R.S.body[k].style.transform = P.transform(b, R.k);
      if (b.settled && !b.rest) rest(R.S, k, b);
    });
    if (R.leafT != null) {
      var a = P.ring(R.leafA, R.leafF, R.leafZ, (R.t - R.leafT) / 1000);
      R.S.leaf.style.transform = a ? 'rotate(' + a.toFixed(2) + 'deg)' : '';
    }
    if (R.mode === 'returning' && R.ready && R.k && !R.plantAt) returning(R);
    if (R.phase === 'desk' && !R.pecked) {
      if (R.mode === 'first') waitFrame(R);
      else if (!R.ready && R.t - R.cutAt > 220) { R.lineOn = true; R.S.lbl.style.visibility = ''; }   // a cold cache: be honest
      if (!R.pecked && R.t > CAP_MS && !R.ready) { R.pecked = true; R.onCapped(); }
    }
  }
  function rest(S, k, b) { if (b) b.rest = true; if (S.edge[k]) S.edge[k].classList.add('gone'); }

  // ---- Act 1: the line and the bird ----
  function initLine(R) {
    var L = R.S.LINE, rnd = Pen.rng('10d-line'), a = rnd() * 6, b = rnd() * 6, pts = [];
    for (var i = 0; i <= 90; i++) {
      var x = L.x0 + (L.x1 - L.x0) * i / 90;
      pts.push([x, L.y + Math.sin(x * .0042 + a) * 1.3 + Math.sin(x * .0115 + b) * .6]);
    }
    R.pts = pts;
    R.S.line.setAttribute('d', Pen.smooth(pts));
    R.lineLen = R.S.line.getTotalLength();
    R.S.line.style.strokeDasharray = R.lineLen + ' ' + (R.lineLen + 10);
    R.S.line.style.strokeDashoffset = R.lineLen;
  }
  // The pen chases the real byte count at its top speed; the label states the real number, not the pen's.
  function lineFrame(R, dt) {
    if (R.snapped) return ropeFrame(R, dt);
    if (!R.lineOn) return;
    R.tip = Math.min(R.L.p, R.tip + dt * 1000 / LINE_MS);
    R.S.line.style.strokeDashoffset = (R.lineLen * (1 - R.tip)).toFixed(1);
    var pct = Math.round(R.L.p * 100);
    R.S.lbl.textContent = R.ready ? 'loaded 已加载 · 100%' :
      'loading 加载中 · ' + Math.min(99, pct) + '%' + (R.t - R.cutAt > HINT_MS ? ' · tap to skip 点按跳过' : '');
  }
  function applyBird(R) {
    var b = R.S.bird;
    b.el.style.left = R.bx + '%';
    b.el.style.transform = R.bdir > 0 ? 'scaleX(-1)' : '';
    b.pose.style.transform = R.brot ? 'rotate(' + R.brot + 'deg)' : '';
    b.el.classList.toggle('lean', R.brot < -3);
  }
  // Held drawings: [ms, frame, dx (desk %), lean (deg, negative = head down toward the beak)]
  function birdSeq(R, t0, steps) {
    var t = t0;
    steps.forEach(function (s) {
      Fx.at(R, t, function () { St.birdFrame(R.S, s[1]); R.bx += s[2]; R.brot = s[3]; applyBird(R); });
      t += s[0];
    });
    return t;
  }
  function hop() { return [[45, 1, 0, 0], [50, 2, 0, 0], [70, 3, 0, 0], [50, 4, 0, 0], [35, 5, 0, 0], [30, 0, 0, 0]]; }
  function waitFrame(R) {
    var full = R.ready && R.tip >= 1;
    if (full && R.fullAt == null) R.fullAt = R.t;
    if (full && R.t - R.fullAt >= TAKE) return peck(R, false);
    if (R.t > CAP_MS && R.k) return peck(R, true);
    if (R.t > R.nextIdle && R.k) {                  // a long load: one small impatient hop in place
      R.nextIdle = R.t + 1500;
      Fx.at(R, birdSeq(R, R.t, hop()), function () { R.brot = -13; applyBird(R); });
    }
  }

  // ---- Act 2: the score, relative to the peck (Tp) ----
  function peck(R, capped) {
    R.pecked = true;
    var Tp = R.Tp = R.t + 70;
    // head back (anticipation) → PECK (contact = the snap) → recoil → upright, looking at the gap
    birdSeq(R, R.t, [[70, 0, 0, 9], [90, 5, 0, -30], [80, 1, 0, -10], [0, 0, 0, 0]]);
    Fx.at(R, Tp, function () { snap(R); });
    if (R.camMid !== R.camWide) Fx.at(R, Tp + WIDE_AT, function () { setCam(R, R.camWide); });   // cut wide for the fall
    if (capped) { Fx.at(R, Tp + 400, function () { R.onCapped(); }); return; }
    Object.keys(LAND).forEach(function (k) { schedule(R, k, Tp + LAND[k]); });
    Fx.at(R, Tp + LAND.plant + CARD_AFTER, function () { R.onCard(); });
  }
  function snap(R) {
    var L = R.S.LINE, xs = (R.bx + 7 * .8 + .9) / 100 * St.W, pts = R.pts, i = 0;
    while (i < pts.length && pts[i][0] < xs) i++;
    var left = pts.slice(0, i), right = pts.slice(i).reverse();
    left.push([xs - 2, L.y]); right.push([xs + 2, L.y]);
    R.ropes = [P.rope(left, [-1300, -2700]), P.rope(right, [1500, -2500])];
    R.S.line.style.display = 'none';
    R.snapped = true; R.snapT = R.t;
    Fx.ping(R, xs, L.y);
    Fx.run(R, 180, function (age) { R.S.lbl.style.opacity = (1 - age / 180).toFixed(3); }, function () { R.S.lbl.style.opacity = 0; });
  }
  function ropeFrame(R, dt) {
    var age = R.t - R.snapT;
    R.ropes.forEach(function (r, i) {
      var el = R.S.halves[i];
      if (age > 330) { el.style.display = 'none'; return; }
      P.ropeStep(r, dt);
      el.setAttribute('d', Pen.smooth(r.p.map(function (q) { return [q.x, q.y]; })));
      if (age > 220) {                            // the pen takes the halves back toward their pins
        var len = el.getTotalLength();
        el.style.strokeDasharray = len + ' ' + (len + 10);
        el.style.strokeDashoffset = (len * Math.min(1, (age - 220) / 110)).toFixed(1);
      }
    });
  }

  // Mass is felt in restitution, squash and how the rock settles; gravity is the same for all.
  var FEEL = {
    laptop: { e: .1, sqGain: .000026, ks: 7, zs: .5, kr: 3.4, zr: .7, th: -3.5, w: 12, dust: [288, 738, 594, 1.35], shake: 3 },
    mug: { e: .14, sqGain: .000042, ks: 9, zs: .32, kr: 3.2, zr: .3, th: 9, w: -40, dust: [360, 470, 753, .8] },
    book: { e: .03, sqGain: .00009, ks: 11, zs: .45, kr: 5, zr: .8, th: -6, w: 20, dust: [528, 828, 899, 1.1], flat: true },
    camera: { e: .13, sqGain: .000036, ks: 8, zs: .4, kr: 3.6, zr: .5, th: 6, w: -25, dust: [996, 1242, 867, 1.05], shake: 1.5 },
    frame: { e: .15, sqGain: .00003, ks: 10, zs: .4, kr: 4, zr: .6, th: -14, w: 160, airDamp: .2, dust: [826, 985, 612, .75] },
    plant: { e: .12, sqGain: .000045, ks: 8, zs: .38, kr: 3, zr: .4, th: -5, w: 18, dust: [1150, 1256, 566, 1], shake: 1 }
  };
  // Released so that it lands at tLand: from `pre` × its fall into view above the viewport, or — when fallMs
  // is given — from whatever height a fall of that long needs.
  function schedule(R, k, tLand, pre, fallMs) {
    var f = FEEL[k], geo = R.S.GEO[k], c = R.mode === 'first' ? R.camWide : { tx: 0, ty: 0, s: 1 };   // measured in the framing it falls in
    var sc = R.r0.width * c.s / St.W, footY = R.r0.top + c.ty + geo.foot * R.r0.height * c.s / St.H;
    var b = R.bodies[k] = P.body({ e: f.e, sqGain: f.sqGain, ks: f.ks, zs: f.zs, kr: f.kr, zr: f.zr, airDamp: f.airDamp || .6, g: G_SCREEN / sc });
    var T = fallMs ? fallMs / 1000 : null, h = T ? b.g * T * T / 2 : (footY * (pre || 1.3) + 50) / sc;
    if (!T) T = P.fallTime(b, h);
    b.onImpact = function (b, v, n) { if (n === 0) land(R, k, f); };
    Fx.at(R, tLand - T * 1000, function () {
      P.drop(b, h, f.th - f.w * T, f.w);
      R.S.body[k].classList.add('in');
    });
  }
  function land(R, k, f) {
    var S = R.S;
    Fx.dust(R, [f.dust[0], f.dust[1], f.dust[2]], f.dust[3], f.flat);
    if (f.shake) Fx.shake(R, f.shake);
    if (S.tone[k]) S.tone[k].classList.add('in');
    if (k === 'laptop') Fx.later(R, 90, function () { Fx.caret(R); });
    if (k === 'mug') Fx.steam(R);
    if (k === 'book') Fx.pages(R);
    if (k === 'camera') Fx.flash(R);
    if (k === 'frame') { S.body.frame.classList.add('flat'); R.bodies.frame.th = 0; R.bodies.frame.w = 0; }
    if (k === 'plant') {
      var ret = R.mode === 'returning';           // the callback gets the bigger, slower wobble: it is the whole joke there
      R.leafT = R.t; R.leafA = ret ? 11 : 9; R.leafF = ret ? 4.2 : 5; R.leafZ = ret ? .16 : .2;
      if (!ret) Fx.later(R, 40, function () { Fx.popUp(R, function () { Fx.later(R, 260, function () { St.faceFrame(S, 0); }); }); });
    }
  }

  // ---- the returning visit: only the plant drops in, landing just after the cut, then the card ----
  function returning(R) {
    var land = Math.max(R.cutPlan + RET_LAND, R.t + 150);
    R.plantAt = land;
    schedule(R, 'plant', land, 0, Math.min(RET_FALL, land - R.t));
    Fx.at(R, land + 130, function () { R.onCard(); });
  }

  // ---- hand-off: the live desk, synced underneath the gag layer ----
  function swapToLive(R) {
    ensureLive();
    if (R) R.cam = '';
    live.bird.x = BIRD_X; live.bird.dir = 1; live.bird.apply(); live.bird.setF(0);
    live.setFrame(0);
    live.el.querySelectorAll('.steam path').forEach(function (p) { p.getAnimations().forEach(function (a) { a.currentTime = 0; }); });
    box.style.transform = '';
    if (R && R.S) R.S.op.style.visibility = 'hidden';
  }
  function release() { if (live) { live.bird.held = false; live.frameHeld = false; } }
  function reveal() { ensureLive(); restartIntro(); }
  function staticDesk() { ensureLive(); box.style.transform = ''; live.bird.x = BIRD_X; live.bird.dir = 1; live.bird.apply(); release(); }
  function teardown(R) { if (R && R.S) { R.S.op.remove(); R.S = null; } }

  window.R10Gag = { prepare: prepare, cut: cut, frame: frame, swapToLive: swapToLive, release: release, reveal: reveal,
    staticDesk: staticDesk, teardown: teardown, ensureLive: ensureLive };
})();
