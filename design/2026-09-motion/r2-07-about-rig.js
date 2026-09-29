/* r2-07 · the rig: one specimen card, one kraft sleeve, one continuous gesture.
   The sleeve lies on the desk, small, its mouth toward you. You pull the card out toward yourself (friction, a stick
   before the first slip); its top edge catches on the lip for a beat, the lip sags and the sleeve comes along; then it
   lets go — the sleeve slaps back, two frames of impact ticks — and the card lifts into your hand at full size and
   becomes round-1 A: tilt with real thickness, throw to flip, the radar drawn on arrival at night. Push it back up
   and it goes back into the sleeve. Geometry, springs, phases and render live here; r2-07-about-hands.js maps
   pointer, touch and keys onto window.R2A. */
(function () {
  var root = document.getElementById('cand-a'); if (!root) return;
  var rig = root.querySelector('.rig'), pos = rig.querySelector('.card-pos'), card = pos.querySelector('.a-card'),
    day = card.querySelector('.a-day'), night = card.querySelector('.a-night'), shadow = rig.querySelector('.a-shadow'),
    fig = pos.querySelector('.sc-fig'), grip = rig.querySelector('.grip'), cue = rig.querySelector('.cue'),
    hit = rig.querySelector('.sl-hit'), hint = root.querySelector('.hs-hint');
  day.innerHTML = SC.dayFace();
  night.innerHTML = SC.nightFace('r2-rd');
  var radar = SC.Radar(night.querySelector('.sc-radar'));
  var sleeve = Sleeve(rig);

  // A's stock: 9 flat plies across 12px between the printed faces (±6px); the middle ply is the glue line.
  var TH = 12, PLIES = 9;
  for (var i = 0; i < PLIES; i++) {
    var ply = document.createElement('div'), z = -TH / 2 + .6 + i * (TH - 1.2) / (PLIES - 1);
    ply.className = 'a-edge' + (i === 4 ? ' core' : (i === 0 || i === PLIES - 1 ? ' outer' : ''));
    ply.setAttribute('aria-hidden', 'true'); ply.style.transform = 'translateZ(' + z.toFixed(2) + 'px)';
    card.insertBefore(ply, day);
  }

  var slot = root.querySelector('.ctl-slot'), pullBtn = SC.pullButton('r2-card'), flipBtn = SC.flipButton('r2-card');
  slot.appendChild(pullBtn); slot.appendChild(flipBtn);
  var flipIco = flipBtn.querySelector('.flip-ico');
  root.querySelector('.soc-slot').appendChild(SC.socialRow('r2a'));

  /* ---- the cue: one pencil arrow and a hand note, drawn in one pass when the stage arrives ---- */
  var cueSvg = cue.querySelector('.cue-arrow'), ar = Pen.arrow([10, 4], [18, 64], 'r2-cue', { bend: .28, head: 9 });
  cueSvg.innerHTML = '';
  var cueShaft = Pen.path(ar.shaft, { color: 'var(--soft)', width: 1.7 }), cueHead = Pen.path(ar.head, { color: 'var(--soft)', width: 1.7 });
  cueSvg.appendChild(cueShaft); cueSvg.appendChild(cueHead);
  [cueShaft, cueHead].forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L); });
  // Focus on the sliver is a pencil loop around it (the pen is the only highlighter); it lifts off as soon as the pull starts.
  var gripPen = Pen.annotate(grip, 'loop', { manual: true, color: 'var(--pencil)', width: 1.6, pad: 2, seed: 'r2-grip' });
  grip.addEventListener('focus', function () { if (grip.matches(':focus-visible') && st === 'tucked') gripPen.show(); });
  grip.addEventListener('blur', function () { gripPen.hide(); });
  var cueOn = false, cueSeen = false;
  function cueShow(on) {
    if (on === cueOn) return; cueOn = on; cue.classList.toggle('on', on);
    if (!cueSeen) return;
    if (on) { Pen.draw(cueShaft, { delay: 120, duration: 360 }); Pen.draw(cueHead, { delay: 470, duration: 140 }); }
    else { Pen.erase(cueShaft, { duration: 150 }); Pen.erase(cueHead, { duration: 100 }); }
  }
  function cueArrive() { if (cueSeen) return; cueSeen = true; if (cueOn) { cueOn = false; cueShow(true); } }

  /* ---- springs ---- */
  var SR0 = -1.4;   // the sleeve lies a little askew, as a hand put it down
  var e = new SC.Spring(0, 120, 1),         // extraction: how far the card has come out of the sleeve (px, desk scale)
    L = new SC.Spring(0, 130, .7),          // 0 on the desk / in the sleeve → 1 in the hand (one small overshoot)
    sd = new SC.Spring(0, 420, .42),        // the sleeve dragged along the pull axis
    sr = new SC.Spring(SR0, 240, .4),       // the sleeve's rotation, deg
    bw = new SC.Spring(0, 900, .3),         // the lip's sag, px
    th = new SC.Spring(0, 150, .74),        // A: flip angle
    rx = new SC.Spring(0, 170, .82), ry = new SC.Spring(0, 170, .82),
    hl = new SC.Spring(0, 260, .9);         // A: held off the page (shadow drifts further, lighter)
  function setK(s, k, z) { s.k = k; s.c = 2 * z * Math.sqrt(k); }

  var st = 'tucked', face = 0, seen = 0, t0 = 0, G = {}, want = null, drag = null, caught = false, base = 0, lastH = -1;
  var narrow = matchMedia('(max-width:680px)'), MAX_TILT = 7, STICK = 6, RATIO = .8, ZONE_R = .22, SNAP_PX = 30;

  /* ---- geometry ---- */
  // Sleeve-local coordinates: origin at the centre of the mouth, y toward the visitor. → rig coordinates (x from centre).
  function l2r(lx, ly, d, a) {
    var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), py = -G.hs / 2, dy = ly - py;
    return [lx * c - dy * s, py + lx * s + dy * c + G.M + d];
  }
  function layout() {
    var rw = rig.clientWidth; if (!rw) return;
    var n = narrow.matches, W = Math.min(520, rw - (n ? 0 : 24));
    pos.style.width = W + 'px'; shadow.style.width = W + 'px';
    var H = pos.offsetHeight; shadow.style.height = H + 'px';
    var k = n ? .44 : .48, s = n ? 40 : 46, kW = k * W, kH = k * H;
    G = { rw: rw, W: W, H: H, k: k, s: s, kW: kW, kH: kH, ws: Math.round(kW + 30), hs: Math.round(kH - s + 14), nr: n ? 17 : 21, T: 46 };
    G.M = G.T + G.hs; G.E = kH - s; G.SN = n ? 18 : 22;
    // In the hand the card is centred a little nearer to you than where it cleared the sleeve: lifting brings it toward you.
    G.dl = n ? 64 : 30; G.fy = l2r(0, kH / 2, 0, SR0)[1] + G.dl; G.DS = G.dl + 80;
    // Tucked, the rig only holds the sleeve and its sliver: while it is pulled, the small card slides out over the printed
    // statement below (a card lying on the page covers print). Only the lift into the hand makes the page give it room.
    G.hT = Math.round(G.M + s + 34); G.hF = Math.round(G.fy + H / 2 + 44);
    sleeve.layout(G);
    grip.style.left = Math.round(rw / 2 - kW / 2 - 14) + 'px'; grip.style.top = Math.round(G.M - G.nr - 8) + 'px';
    grip.style.width = Math.round(kW + 28) + 'px'; grip.style.height = Math.round(s + G.nr + 30) + 'px';
    cue.style.left = Math.round(rw / 2 + kW / 2 + (n ? 4 : 10)) + 'px'; cue.style.top = Math.round(G.M + s * .35) + 'px';
    if (st === 'free' || st === 'tucked') { e.snap(st === 'free' ? G.E : Math.min(e.to, 5)); L.snap(st === 'free' ? 1 : 0); }
    render();
  }

  /* ---- render ---- */
  function pose() {
    var l = Math.max(0, L.x), lc = Math.min(1, l), d = l2r(0, G.s + e.x - G.kH / 2, sd.x, sr.x);
    return { cx: d[0] * (1 - l), cy: d[1] + (G.fy - d[1]) * l, sc: G.k + (1 - G.k) * l, rz: sr.x * (1 - lc) };
  }
  function render() {
    if (!G.W) return;
    var p = pose(), lc = SC.clamp(L.x, 0, 1), rest = st === 'free' && Math.abs(p.sc - 1) < 1e-3;
    var tx = G.rw / 2 + p.cx - G.W / 2, ty = p.cy - G.H / 2;
    if (rest) { tx = Math.round(tx); ty = Math.round(ty); }
    pos.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) rotate(' + p.rz.toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
    pos.style.zIndex = L.x > .001 ? 6 : 2;   // in the sleeve: between its panels. Out: above it.
    sleeve.pose(sd.x, sr.x); sleeve.bow(bw.x);
    var t = th.x, tv = t + ry.x, hh = hl.x;
    card.style.transform = 'translateZ(' + (hh * 10).toFixed(2) + 'px) rotateX(' + rx.x.toFixed(2) + 'deg) rotateY(' + tv.toFixed(2) + 'deg)';
    // A's halftone contact shadow: the card's silhouette on the page. It narrows with the turn, slides opposite the
    // tilt, drifts further and lighter when held — and only exists once the card is off the desk.
    if (lc > 0) {
      var w = Math.min(1, Math.abs(Math.cos(tv * Math.PI / 180)) + Math.abs(Math.sin(t * Math.PI / 180)) * TH / G.W);
      var sx = -ry.x * 1.8 * (1 + hh * .7) * p.sc, sy = (10 + hh * 12 + rx.x * .8) * p.sc;
      shadow.style.transform = 'translate(' + (tx + sx).toFixed(1) + 'px,' + (ty + sy).toFixed(1) + 'px) rotate(' + p.rz.toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
      shadow.style.clipPath = 'inset(0 ' + (G.W * (1 - w) / 2).toFixed(1) + 'px round 16px)';
      shadow.style.opacity = (lc * (1 - hh * .4)).toFixed(3);
    } else shadow.style.opacity = 0;
    fig.style.opacity = (lc * lc).toFixed(3);
    var h = Math.round(G.hT + (G.hF - G.hT) * lc);
    if (h !== lastH) { lastH = h; rig.style.height = h + 'px'; }   // the page makes room as the card comes up to full size
    flipIco.style.transform = 'rotate(' + t.toFixed(1) + 'deg)';
    var vis = Math.cos(tv * Math.PI / 180) >= 0 ? 0 : 1;
    if (vis !== seen) { seen = vis; if (vis === 0) radar.reset(); }
    // Arrival at night in the hand: the witness starts taking notes, and the sleeve's checklist gets its second tick.
    if (st === 'free' && face === 1 && vis === 1 && radar.state === 'empty' && Math.abs(th.x - th.to) < 18) { radar.draw(); sleeve.tick(1); }
    if (st === 'free' && face === 0 && vis === 0 && Math.abs(th.x - th.to) < 18) sleeve.tick(0);
  }

  /* ---- phases (physics clock) ---- */
  function phase(dt) {
    var now = performance.now();
    if (st === 'stick') { if (now - t0 > 90) { st = 'slide'; e.x = Math.max(e.x, 4); e.to = G.E + 40; setK(e, 70, .92); e.v = 260; sd.to = 0; bw.to = 0; } }
    else if (st === 'slide') { e.step(dt); if (e.x >= G.E - G.SN) catchLip(); }
    else if (st === 'catch') { e.step(dt); if (now - t0 > 170) snap(); }
    else if (st === 'pop') { e.step(dt); if (now - t0 > 120) lift(); }
    else if (st === 'lift' || st === 'handback') { L.step(dt); e.step(dt); if (L.rest(.002)) { L.snap(1); arrive(); } }
    else if (st === 'return' || st === 'tucked') { e.step(dt); if (st === 'return' && e.rest(1)) { e.snap(0); st = 'tucked'; } }
    else if (st === 'lower') { L.step(dt); if (L.x <= .004) { L.snap(0); st = 'slidein'; e.to = 0; setK(e, 85, 1); e.v = -60; bw.v -= 50; } }
    else if (st === 'slidein') { e.step(dt); if (e.rest(1.2)) { e.snap(0); tucked(); } }
  }
  function catchLip() {
    st = 'catch'; t0 = performance.now();
    e.to = G.E - G.SN + 6; setK(e, 500, 1); sd.to = 10; bw.to = 7; sleeve.startle(900);
  }
  // The friction lets go: the card jumps clear and skids a hair past the lip, the sleeve slaps back past rest and twists
  // (one corner lets go first), the lip flutters once, two frames of impact ticks, the bird starts. A held beat on the
  // desk — then the card is picked up into the hand.
  function snap() {
    st = 'pop'; caught = false; t0 = performance.now();
    e.to = G.E; setK(e, 520, .55); e.v = 520;
    sd.to = 0; sd.v = -300; sr.v -= 46; bw.to = 0; bw.v = -120;
    sleeve.impact(); sleeve.startle(760);
    cueShow(false); setHint(); loop.kick();
  }
  function lift() {
    st = 'lift';
    L.to = 1; setK(L, 130, .7); L.v = 1.4; rx.v += 90; hl.v += 8;
  }
  function arrive() {
    st = 'free';
    pullBtn.hidden = true; flipBtn.hidden = false; grip.hidden = true;
    card.tabIndex = 0; hit.tabIndex = 0; hit.removeAttribute('aria-hidden');
    focusWant(); setHint(); render();
  }
  function tucked() {
    st = 'tucked'; radar.reset();
    pullBtn.hidden = false; flipBtn.hidden = true; grip.hidden = false;
    card.tabIndex = -1; hit.tabIndex = -1; hit.setAttribute('aria-hidden', 'true');
    cueShow(true); focusWant(); setHint(); render();
  }
  function focusWant() {
    var el = { card: card, grip: grip, flip: flipBtn, pull: pullBtn }[want]; want = null;
    if (el) el.focus({ preventScroll: true });
  }
  function setHint() {
    hint.innerHTML = st === 'free' || st === 'lift' || st === 'pop'
      ? '<span class="hand-cn">拖住，甩一下</span> · throw it ↔ &nbsp; <span class="hand-cn">往上推回去</span> · push it back up ↑'
      : '<span class="hand-cn">往下拖，或点一下</span> · drag it down, or just click';
  }

  var loop = SC.Loop(function (dt) {
    phase(dt);
    if (!drag) th.step(dt);
    rx.step(dt); ry.step(dt); hl.step(dt); sd.step(dt); sr.step(dt); bw.step(dt);
    render();
    var calm = e.rest(.2) && sd.rest(.05) && sr.rest(.02) && bw.rest(.05) && th.rest(.05) && rx.rest(.02) && ry.rest(.02) && hl.rest(.002);
    var busy = !!drag || (st !== 'tucked' && st !== 'free') || !calm;
    if (!busy && Math.abs(th.to) >= 360) { th.snap(th.to % 360); render(); }   // keep the angle bounded
    return busy;
  });

  /* ---- A's faces ---- */
  function faceOf(a) { return ((Math.round(a / 180) % 2) + 2) % 2; }
  function setFace(n) {
    if (n === face) return;
    face = n; flipBtn.setState(n === 1);
    day.setAttribute('aria-hidden', n ? 'true' : 'false'); night.setAttribute('aria-hidden', n ? 'false' : 'true');
    card.setAttribute('aria-label', (n ? '标本卡，夜间形态。' : '标本卡，日间形态。') + '左右拖动或按回车翻面，按上箭头收回卡套。' +
      (n ? 'Specimen card, night form.' : 'Specimen card, day form.') + ' Drag sideways or press Enter to flip; Arrow Up puts it back in the sleeve.');
  }

  /* ---- API: the pull ---- */
  function pullStart() { if (st !== 'tucked') return false; st = 'pull'; gripPen.hide(); base = e.x; caught = false; cueShow(false); loop.kick(); return true; }
  // f: finger travel toward the visitor, px. Stick, slip, friction, then the catch at the lip.
  function pullTo(f) {
    if (st !== 'pull') return false;
    f = Math.max(0, f);
    if (f < STICK) { e.x = e.to = base; sd.to = f * .4; bw.to = f * .45; }
    else {
      var lin = base + 4 + (f - STICK) * RATIO, zone = G.E - G.SN;
      if (lin < zone) { e.x = e.to = lin; sd.to = 0; bw.to = 0; }
      else {
        var over = (lin - zone) / RATIO;
        e.x = e.to = zone + over * ZONE_R; sd.to = Math.min(14, over * .42); bw.to = Math.min(8, over * .3);
        if (!caught) { caught = true; sleeve.startle(1000); }
        if (over > SNAP_PX) { snap(); return true; }
      }
    }
    e.v = 0; loop.kick(); return false;
  }
  // Let go mid-pull: far enough (or flicked) and it carries on out through the catch; otherwise the sleeve takes it back.
  function pullEnd(v) {
    if (st !== 'pull') return;
    if (e.x >= G.E * .32 || v > 520) { st = 'slide'; e.to = G.E + 40; setK(e, 70, .92); e.v = Math.max(v * .9, 300); sd.to = 0; bw.to = 0; }
    else { st = 'return'; e.to = 0; setK(e, 130, 1); e.v = 0; sd.to = 0; bw.to = 0; caught = false; cueShow(true); }
    loop.kick();
  }
  function autoPull(focus) {
    if (st !== 'tucked') return;
    want = focus || null; cueShow(false); gripPen.hide();
    if (Pen.reduced()) { e.snap(G.E); L.snap(1); arrive(); return; }
    st = 'stick'; t0 = performance.now(); sd.to = 3; bw.to = 3; sleeve.startle(500); loop.kick();
  }
  function nudge(on) { if (st !== 'tucked' || Pen.reduced()) return; e.to = on ? 5 : 0; setK(e, 180, .8); loop.kick(); }

  /* ---- API: back into the sleeve ---- */
  function carryStart() { if (st !== 'free') return false; st = 'carry'; drag = null; hl.to = 0; rx.to = 0; ry.to = 0; loop.kick(); return true; }
  // up: finger travel away from the visitor. First the card is lowered to the desk at the mouth, then pushed in.
  function carryTo(up) {
    if (st !== 'carry') return;
    up = Math.max(0, up);
    if (up < G.DS) { L.x = L.to = 1 - up / G.DS; e.x = e.to = G.E; }
    else { L.x = L.to = 0; e.x = e.to = Math.max(0, G.E - (up - G.DS) * .8); }
    L.v = e.v = 0; loop.kick();
  }
  function carryEnd(v) {
    if (st !== 'carry') return;
    if (L.x <= 0 && (G.E - e.x > 22 || v > 420)) { st = 'slidein'; e.to = 0; setK(e, 85, 1); e.v = -Math.min(900, Math.max(0, v) * .8); }
    else if (L.x < .45 && v > 700) { st = 'lower'; L.to = 0; setK(L, 170, 1); }
    else { st = 'handback'; e.snap(G.E); L.to = 1; setK(L, 150, .74); }
    loop.kick();
  }
  function tuck(focus) {
    if (st !== 'free') return;
    want = focus || null; drag = null; rx.to = ry.to = hl.to = 0;
    if (Pen.reduced()) { L.snap(0); e.snap(0); rx.snap(0); ry.snap(0); hl.snap(0); tucked(); return; }
    st = 'lower'; L.to = 0; setK(L, 170, 1); loop.kick();
  }

  /* ---- API: A in the hand — tilt, grab, drag, throw ---- */
  function tiltAt(x, y) {
    if (st !== 'free' || drag || Pen.reduced()) return;
    var r = rig.getBoundingClientRect(), u = (x - (r.left + G.rw / 2 - G.W / 2)) / G.W, v = (y - (r.top + G.fy - G.H / 2)) / G.H;
    if (u < -.04 || u > 1.04 || v < -.04 || v > 1.04) return tiltReset();
    rx.to = (.5 - SC.clamp(v, 0, 1)) * 2 * MAX_TILT; ry.to = (SC.clamp(u, 0, 1) - .5) * 2 * MAX_TILT; loop.kick();
  }
  function tiltReset() { if (drag || st !== 'free') return; rx.to = 0; ry.to = 0; loop.kick(); }
  function grab() {
    if (st !== 'free') return false;
    var now = performance.now();
    drag = { th0: th.x, base: Math.round(th.to / 180) * 180, t0: now, hist: [[now, th.x]] };
    th.to = th.x; th.v = 0;              // catching it stops it where it is
    if (!Pen.reduced()) hl.to = 1;
    loop.kick(); return true;
  }
  function turnTo(dx, dy) {
    if (!drag || Pen.reduced()) return;
    var a = drag.th0 + dx * 180 / (G.W * .9), lo = drag.base - 180, hi = drag.base + 180;
    if (a > hi) a = hi + (a - hi) * .2; else if (a < lo) a = lo + (a - lo) * .2;   // one face each way, then resistance
    th.x = th.to = a; th.v = 0;
    rx.to = SC.clamp(-dy * .05, -MAX_TILT, MAX_TILT); ry.to = 0;
    var now = performance.now(); drag.hist.push([now, a]);
    while (drag.hist.length > 2 && now - drag.hist[0][0] > 90) drag.hist.shift();
    loop.kick();
  }
  function holdTilt(dy) { if (drag && !Pen.reduced()) { rx.to = SC.clamp(-dy * .05, -MAX_TILT, MAX_TILT); loop.kick(); } }
  function turn(dir) {
    if (st !== 'free') return;
    var b = Math.round(th.to / 180) * 180, target = b + 180 * dir;
    th.to = target; setFace(faceOf(target));
    if (Pen.reduced()) { th.snap(th.to); rx.snap(0); ry.snap(0); hl.snap(0); render(); return; }
    th.v += dir * 140; hl.v += 5; loop.kick();
  }
  function release(moved, cancelled, dx) {
    var d = drag; drag = null; if (!d) return;
    hl.to = 0; rx.to = 0;
    var now = performance.now();
    if (!moved) { if (!cancelled && now - d.t0 < 450) turn(1); else loop.kick(); return; }
    if (Pen.reduced()) { if (Math.abs(dx) > 40) turn(dx > 0 ? 1 : -1); return; }
    var h = d.hist, a = h[0], b = h[h.length - 1], span = (b[0] - a[0]) / 1000;
    var w = (span > .008 && now - b[0] < 70) ? SC.clamp((b[1] - a[1]) / span, -2400, 2400) : 0;   // deg/s at release
    var target = Math.abs(w) > 420
      ? (w > 0 ? Math.floor(th.x / 180 + 1e-6) * 180 + 180 : Math.ceil(th.x / 180 - 1e-6) * 180 - 180)   // a throw goes to the next face
      : Math.round((th.x + w * .16) / 180) * 180;                                                      // a drop goes to the nearest
    target = SC.clamp(target, d.base - 180, d.base + 180);
    var cap = Math.min(1000, Math.max(200, 1.3 * Math.sqrt(th.k) * Math.abs(target - th.x)));   // a late hard throw still lands with one small overshoot
    th.to = target; th.v = SC.clamp(w, -cap, cap); setFace(faceOf(target)); loop.kick();
  }

  /* ---- reset: replay, and reduced motion (the card is simply presented, out of its sleeve) ---- */
  function reset(free) {
    drag = null; want = null; caught = false;
    [th, rx, ry, hl, sd, bw].forEach(function (s) { s.snap(0); }); sr.snap(SR0);
    setFace(0); radar.reset(); sleeve.clearTicks(); seen = 0;
    if (free) { e.snap(G.E); L.snap(1); cueShow(false); arrive(); } else { e.snap(0); L.snap(0); tucked(); }
    render();
  }

  window.R2A = {
    root: root, rig: rig, card: card, pos: pos, grip: grip, front: sleeve.front, hit: hit, pullBtn: pullBtn, flipBtn: flipBtn,
    state: function () { return st; }, layout: layout, reset: reset, cueArrive: cueArrive,
    pullStart: pullStart, pullTo: pullTo, pullEnd: pullEnd, autoPull: autoPull, nudge: nudge,
    carryStart: carryStart, carryTo: carryTo, carryEnd: carryEnd, tuck: tuck,
    tiltAt: tiltAt, tiltReset: tiltReset, grab: grab, turnTo: turnTo, holdTilt: holdTilt, turn: turn, release: release
  };
  layout(); tucked();
  if (window.ResizeObserver) new ResizeObserver(function () { if (pos.offsetHeight !== G.H || rig.clientWidth !== G.rw) layout(); }).observe(card);
  window.addEventListener('resize', layout);
  setHint();
})();
