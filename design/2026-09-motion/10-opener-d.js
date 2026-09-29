/* 10 · D — 连锁反应 / the chain-reaction gag. The director.
   Act 1 (honest, open-ended): a coral pen line fills with the real bytes; the bird hops in and
   looks at it, and keeps looking for exactly as long as loading takes. Act 2 (a fixed score from
   the peck): the line snaps, a beat of nothing, then the desk's objects fall in a drum fill —
   intervals 210 → 170 → 120 → 110 → 90 ms — each landing firing its own reaction; the last one
   jolts the portrait upright. Hard cut to the eyecatch: the bird alone on cream blinks once over
   日常 · ep.NN. Hard cut back: the live desk (swapped in underneath, pixel-identical), page live. */
(function () {
  var P = D10Phys, St = D10Stage, Fx = D10Fx;
  var root = document.documentElement, box = document.querySelector('.deskbox'), host = document.getElementById('desk-host');
  var card = document.querySelector('.ep'), qs = new URLSearchParams(location.search);
  var mode = qs.get('mode') === 'returning' ? 'returning' : 'first';
  var G_SCREEN = 5600;           // gravity, CSS px/s² — converted per viewport into desk-image px
  var LINE_MS = 520;             // the pen's top speed: a full line in 0.52 s, never ahead of the bytes
  var CAP_MS = 6000;             // after this nobody waits: the bird pecks (if it is there) and the page loads as a page
  var LAND = { laptop: 790, mug: 1000, book: 1170, frame: 1290, camera: 1400, plant: 1490 };   // ms after the peck
  var BIRD_X = 15;               // where the bird stops (desk %), facing right, just short of the mug
  var live = null, R = null, loads = null, loaded = { all: false };

  // ---- the visit count: 日常 · ep.NN is true ----
  var visits = +(localStorage.getItem('fy-visits') || 0);
  if (!sessionStorage.getItem('fy-visit-counted')) { visits++; localStorage.setItem('fy-visits', visits); sessionStorage.setItem('fy-visit-counted', '1'); }
  function setCard() {
    var n = mode === 'first' ? 1 : Math.max(2, visits), two = (n < 10 ? '0' : '') + n;
    card.querySelector('.ep-no').textContent = 'ep.' + two;
    card.querySelector('.ep-sub').textContent = 'visit ' + n + ' · 第 ' + n + ' 次来';
    card.setAttribute('aria-label', '日常 everyday, episode ' + n + ' — your visit number ' + n);
  }

  // ---- the board's reduced-motion switch reaches into the iframe ----
  function syncRM() {
    var on = sessionStorage.getItem('mock-rm') === '1';
    try { if (parent !== window) on = parent.document.documentElement.classList.contains('rm'); } catch (e) {}
    root.classList.toggle('rm', on);
  }
  syncRM();
  try { if (parent !== window) parent.document.addEventListener('mock:rm', function () { syncRM(); play(); }); } catch (e) {}

  function loadAll(onP) {
    if (!loads) {
      loads = D10Load.start(function (p) { if (R && R.onP) R.onP(p); });
      loads.all = Promise.all([loads.g1, loads.g2, loads.fonts]);
      loads.all.then(function () { loaded.all = true; });
    }
    if (loaded.all) onP(1);                       // replays: everything is already here
    return loads;
  }

  // ---- the live desk (board 09's faithful copy), built only once its images are in cache ----
  function ensureLive() {
    if (live) return live;
    live = HomeDesk.build(host, {});
    // The live desk's own fade-ins would keep its layers composited (a different pixel grid from the
    // opener's): cancel the fades whose resting style is visible, finish the draw-ins (restarted at reveal).
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

  // ---- mobile: a portrait framing — the desk low and large, a long drop above it ----
  function cameraFor() {
    if (innerWidth / innerHeight > .8) return '';
    box.style.transform = '';
    // frame the bird's stop (x 14%) through the plant's leaves (95.5%); the desk sits low, the sky is the drop
    var r = box.getBoundingClientRect(), s = Math.min(1.6, (innerWidth - 16) / (r.width * .815));
    var tx = innerWidth / 2 - (r.left + s * r.width * .5475), ty = innerHeight * .57 - (r.top + s * r.height * .54);
    return 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
  }

  // ---- run lifecycle ----
  function teardown() {
    if (!R) return;
    R.alive = false; cancelAnimationFrame(R.raf); R.timers.forEach(clearTimeout);
    if (R.S) R.S.op.remove();
    if (R.eye) R.eye.el.remove();
    R = null;
  }
  function showStatic(quick) {
    teardown(); ensureLive();
    root.classList.remove('opening'); box.style.transform = '';
    live.bird.x = BIRD_X; live.bird.dir = 1; live.bird.apply(); live.bird.held = false; live.frameHeld = false;
    card.classList.add('on');
    if (quick) restartIntro();
  }

  function play() {
    teardown(); setCard(); card.classList.remove('on');
    if (Pen.reduced()) return showStatic(false);
    root.classList.add('opening');
    if (live) { live.bird.held = true; live.frameHeld = true; }
    var S = St.build(box);
    R = { S: S, alive: true, timers: [], cues: [], bodies: {}, t0: performance.now(), t: 0, tip: 0, target: 0,
      bx: -3, bdir: 1, brot: 0, phase: 'load', mode: mode };
    var cam = mode === 'first' ? cameraFor() : '';   // the callback plays in the final layout: no camera to undo
    box.style.transform = cam; R.cam = cam; S.op.classList.toggle('portrait', !!cam);
    initLine(R);
    R.onP = function (p) { R.target = p; };
    var L = loadAll(R.onP);
    var r = R;
    L.g1.then(function () { if (r.alive) onG1(r); });
    L.g2.then(function () { if (r.alive) S.op.classList.add('g2'); });
    L.all.then(function () { if (r.alive) { ensureLive(); r.ready = true; } });
    S.op.addEventListener('pointerdown', skip);
    R.raf = requestAnimationFrame(tick);
  }

  function at(R, t, fn) { R.cues.push({ t: t, fn: fn }); R.cues.sort(function (a, b) { return a.t - b.t; }); }

  function tick(now) {
    var r = R; if (!r || !r.alive) return;
    var dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; r.t = now - r.t0;
    while (r.cues.length && r.cues[0].t <= r.t) { var c = r.cues.shift(); c.fn(r.t); if (!r.alive) return; }
    lineFrame(r, dt);
    Object.keys(r.bodies).forEach(function (k) {
      var b = r.bodies[k]; if (b.manual) return;
      P.step(b, dt); r.S.body[k].style.transform = P.transform(b, r.k);
      if (b.settled && !b.rest) rest(r.S, k, b);
    });
    if (r.leafT != null) {
      var a = P.ring(r.leafA, r.leafF, r.leafZ, (r.t - r.leafT) / 1000);
      if (r.t - r.leafT > 300 && Math.abs(r.leafA) * Math.exp(-r.leafZ * 6.283 * r.leafF * (r.t - r.leafT) / 1000) < .08) { r.leafT = null; a = 0; if (r.onLeafRest) r.onLeafRest(); }
      r.S.leaf.style.transform = a ? 'rotate(' + a.toFixed(2) + 'deg)' : '';
    }
    if (r.phase === 'wait') waitFrame(r);
    else if (r.phase === 'load' && r.t > CAP_MS) { r.phase = 'capped'; handoff(250); return; }   // not even the desk yet: just the page
    r.raf = requestAnimationFrame(tick);
  }

  // A settled object covers its restored table edge.
  function rest(S, k, b) {
    if (b) b.rest = true;
    if (S.edge[k]) S.edge[k].classList.add('gone');
  }

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
    if (R.mode === 'returning') R.S.under.style.opacity = R.S.lbl.style.opacity = 0;   // shown only if the cache is cold
  }
  function lineFrame(R, dt) {
    if (R.snapped) return ropeFrame(R, dt);
    if (R.tip >= 1 && R.ready) return;
    R.tip = Math.min(R.target, R.tip + dt * 1000 / LINE_MS);
    R.S.line.style.strokeDashoffset = (R.lineLen * (1 - R.tip)).toFixed(1);
    var pct = Math.round(R.tip * 100);
    R.S.lbl.textContent = R.tip >= 1 && R.ready ? 'loaded 已加载 · 100%' :
      'loading 加载中 · ' + pct + '%' + (R.t > 1500 ? ' · tap to skip 点按跳过' : '');   // a slow line: nobody has to wait
    if (R.mode === 'returning' && R.t > 220 && !R.set) R.S.under.style.opacity = R.S.lbl.style.opacity = 1;
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
      at(R, t, function () { St.birdFrame(R.S, s[1]); R.bx += s[2]; R.brot = s[3]; applyBird(R); });
      t += s[0];
    });
    return t;
  }
  function hop(d) { return [[45, 1, 0, 0], [50, 2, d * .3, 0], [70, 3, d * .4, 0], [50, 4, d * .3, 0], [35, 5, 0, 0], [30, 0, 0, 0]]; }

  function onG1(R) {
    var S = R.S;
    S.op.classList.add('g1');
    Object.keys(S.edge).forEach(function (k) { S.edge[k].src = 'assets-gen/10d-edge.png'; });
    S.op.querySelectorAll('img.op-cut').forEach(function (i) { i.src = '../../assets/desk-scene2-light.png'; });
    R.k = box.offsetWidth / St.W;                             // layout px per desk px (inside the camera)
    requestAnimationFrame(function () { S.op.classList.add('set'); });
    R.set = true;
    if (R.mode === 'returning') return returning(R);
    S.bird.el.classList.add('in'); applyBird(R); St.birdFrame(S, 0);
    var t = birdSeq(R, R.t + 20, hop(9).concat(hop(9)));
    // stops… then looks down at the line: two held poses, the second one is the take
    at(R, t + 70, function () { R.brot = -13; applyBird(R); R.phase = 'wait'; R.waitFrom = R.t; R.nextIdle = R.t + 1500; });
  }
  // The bird keeps looking at the line until the bytes are in (min 200 ms: the take before the peck).
  function waitFrame(R) {
    var ready = R.ready && R.tip >= 1;
    if ((ready && R.t - R.waitFrom >= 200) || R.t > CAP_MS) { R.phase = 'peck'; return peck(R, !ready); }
    if (R.t > R.nextIdle) {                      // a long load: one small impatient hop in place
      R.nextIdle = R.t + 1500;
      var t = birdSeq(R, R.t, hop(0));
      at(R, t, function () { R.brot = -13; applyBird(R); });
    }
  }

  // ---- Act 2: the score, relative to the peck (Tp) ----
  function peck(R, capped) {
    var Tp = R.t + 70;
    // head back (anticipation) → PECK (contact = the snap) → recoil → upright, looking at the gap
    birdSeq(R, R.t, [[70, 0, 0, 9], [90, 5, 0, -30], [80, 1, 0, -10], [0, 0, 0, 0]]);
    at(R, Tp, function () { snap(R); });
    if (capped) { at(R, Tp + 400, function () { handoff(250); }); return; }
    Object.keys(LAND).forEach(function (k) { schedule(R, k, Tp + LAND[k]); });
    at(R, Tp + 1770, function () { cutIn(R); });
  }

  // ---- the eyecatch: cut in, the bird blinks once, cut back to the page ----
  function cutIn(R) {
    swapToLive(R, false);
    box.style.transform = ''; R.cam = '';        // the cut hides the camera's return to the page layout
    R.S.op.style.visibility = 'hidden';
    var E = R.eye = St.eyecatch(card);
    St.birdFrame({ bird: E.parts }, 0);
    R.phase = 'eye';
    Fx.later(R, 140, function () { E.bird.classList.add('blink'); });
    Fx.later(R, 240, function () { E.bird.classList.remove('blink'); });
    Fx.later(R, 400, function () { cutBack(R); });
  }
  function cutBack(R) {
    if (R.eye) R.eye.el.remove();
    reveal(R, 'static');
    live.bird.held = false; live.frameHeld = false;
    teardown();
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
    R.S.lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' });
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
  function schedule(R, k, tLand, pre) {           // pre: how far above the viewport it starts (× its fall into view)
    var f = FEEL[k], geo = R.S.GEO[k], rect = box.getBoundingClientRect();
    var sc = rect.width / St.W, footY = rect.top + geo.foot * rect.height / St.H;
    var b = R.bodies[k] = P.body({ e: f.e, sqGain: f.sqGain, ks: f.ks, zs: f.zs, kr: f.kr, zr: f.zr, airDamp: f.airDamp || .6, g: G_SCREEN / sc });
    b.state = 'idle';
    var h = (footY * (pre || 1.3) + 50) / sc, T = P.fallTime(b, h);
    b.onImpact = function (b, v, n) { if (n === 0) land(R, k, f); };
    at(R, tLand - T * 1000, function () {
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
      if (R.mode !== 'returning') Fx.later(R, 40, function () { Fx.popUp(R, function () { Fx.later(R, 260, function () { St.faceFrame(S, 0); }); }); });
    }
  }

  // ---- the returning visit: the desk is already set; only the plant drops in (≤ 0.6 s) ----
  function returning(R) {
    var S = R.S;
    ['laptop', 'mug', 'camera', 'book', 'frame'].forEach(function (k) { S.body[k].classList.add('in'); if (S.tone[k]) S.tone[k].classList.add('in'); rest(S, k); });
    S.body.frame.classList.remove('air');
    S.caret.classList.add('on');
    R.bx = BIRD_X; R.brot = 0; applyBird(R); S.bird.el.classList.add('in');
    var go = function () {
      var T0 = R.t;
      schedule(R, 'plant', T0 + 250, 1.08);
      at(R, T0 + 350, function () { handoff(0); });
    };
    var r = R;                                    // the plant needs only the images; the hand-off waits for fonts
    Promise.all([loads.g1, loads.g2]).then(function () { if (r.alive) { S.op.classList.add('g2'); go(); } });
  }

  // ---- hand-off: the live desk, synced underneath the opener layer, then revealed ----
  function swapToLive(r, skipping) {
    r.phase = 'done'; ensureLive();
    live.bird.x = skipping ? BIRD_X : r.bx; live.bird.dir = 1; live.bird.apply(); live.bird.setF(0);
    live.setFrame(0);
    var lc = live.q('.caret').getAnimations()[0];
    if (lc) lc.currentTime = r.caretAnim && r.caretAnim.effect.getTiming().duration === 1150 ? r.caretAnim.currentTime : 0;
    live.el.querySelectorAll('.steam path').forEach(function (p) { p.getAnimations().forEach(function (a) { a.currentTime = 0; }); });
  }
  function reveal(r, cardHow) {                  // the page chrome rises; arrows draw; the card is there
    root.classList.remove('opening');
    restartIntro();
    if (cardHow === 'static') card.classList.add('on'); else Fx.stamp(card, cardHow === 'quick');
  }
  // Never waits: the natural paths only get here loaded; a skip or the cap means "the page, now" —
  // whatever is still in flight arrives in the live desk as it would on any page.
  function handoff(ms, skipping) {
    var r = R; if (!r || r.phase === 'done') return;
    (function () {
      swapToLive(r, skipping);
      reveal(r, skipping ? 'quick' : 'stamp');
      if (r.cam) box.animate([{ transform: r.cam }, { transform: 'none' }], { duration: 250, easing: 'ease-out' });
      box.style.transform = '';
      r.S.op.style.pointerEvents = 'none';
      var done = function () { live.bird.held = false; live.frameHeld = false; if (R === r) teardown(); };
      if (ms) { r.S.op.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: 'linear', fill: 'forwards' }).onfinish = done; return; }
      // Instant swap (identical at rest). Only a still-moving plant lingers over the live desk, its
      // paper leaf-patch hiding the live leaf, until the wobble dies; then it goes too.
      r.S.op.classList.add('swapped');
      if (r.leafT == null) return done();
      r.onLeafRest = done;
    })();
  }

  function skip(e) {
    if (!R || (e && e.target && e.target.closest && e.target.closest('.ctl'))) return;
    if (R.phase === 'eye') return cutBack(R);
    if (R.phase === 'done') return;
    R.cues = []; R.phase = 'skipping';
    handoff(250, true);
  }
  addEventListener('keydown', function (e) { if (!e.target.closest('.ctl')) skip(e); });
  addEventListener('wheel', skip, { passive: true });

  // ---- mockup control strip ----
  var ctl = document.querySelector('.ctl');
  function syncCtl() {
    ctl.querySelector('[data-act="first"]').setAttribute('aria-pressed', mode === 'first');
    ctl.querySelector('[data-act="returning"]').setAttribute('aria-pressed', mode === 'returning');
    ctl.querySelector('[data-act="rm"]').setAttribute('aria-pressed', root.classList.contains('rm'));
  }
  ctl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var a = b.dataset.act;
    if (a === 'replay') play();
    if (a === 'skip') skip();
    if (a === 'first' || a === 'returning') { mode = a; play(); }
    if (a === 'rm') { var on = !root.classList.contains('rm'); root.classList.toggle('rm', on); sessionStorage.setItem('mock-rm', on ? '1' : '0'); play(); }
    syncCtl();
  });
  syncCtl();
  window.replay = play; window.skip = skip;
  window.D10Debug = function () { return R ? { t0: performance.timeOrigin + R.t0, t: R.t, phase: R.phase } : null; };   // for the frame recorder

  if (qs.get('autoplay') === '0') { setCard(); loadAll(function () {}).all.then(function () { showStatic(true); }); }
  else play();
})();
