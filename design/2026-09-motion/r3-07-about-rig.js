/* r3-07 · the rig, copied from r2-07-about-rig.js: one specimen card, one kraft sleeve, one continuous gesture.
   The interaction is r2's, unchanged: pull the card down out of the sleeve (a stick, then friction), its top edge
   catches on the lip for a beat, the lip sags and the sleeve comes along, it lets go — the sleeve slaps back, two
   frames of impact ticks — and the card lifts into your hand at full size and becomes round-1 A: tilt with real
   thickness, throw to flip, the radar drawn on arrival at night. Push it back up and it goes back into the sleeve.
   What round 3 changes is proportion, and the physics that follows from it:
   · the card is 7:12 (tarot) instead of 1:1.31, and is sized to the screen: in the hand the whole card fits one
     view with the sleeve's printed header still showing above it; the faces scale as one printed object (--u);
   · the desk scale is chosen so the whole pull, catch included, fits the same view — so the pull is longer
     (1.6 card widths, r2's was 1.1) without running below the fold on a phone;
   · friction is proportional to how much card is still inside: it moves at 72% of your finger at first, 1:1
     by the lip (r2 was a flat 80%); lifting into the hand raises it a little toward you instead of lowering it;
   · a slimmer card has less inertia about its long axis: the flip spring is a little stiffer, and the tilt
     leans more on the short axis than the long one.
   Geometry, springs, phases and render live here; r3-07-about-hands.js maps pointer, touch and keys onto R3A. */
(function () {
  var root = document.getElementById('cand-a'); if (!root) return;
  var stage = root.querySelector('.stage'), rig = root.querySelector('.rig'), pos = rig.querySelector('.card-pos'), card = pos.querySelector('.a-card'),
    day = card.querySelector('.a-day'), night = card.querySelector('.a-night'), shadow = rig.querySelector('.a-shadow'),
    fig = pos.querySelector('.sc-fig'), grip = rig.querySelector('.grip'), cue = rig.querySelector('.cue'),
    hit = rig.querySelector('.sl-hit'), hint = root.querySelector('.hs-hint'), bar = document.querySelector('.mock-top');
  day.innerHTML = SC.dayFace();
  night.innerHTML = SC.nightFace('r3-rd');
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

  var slot = root.querySelector('.ctl-slot'), pullBtn = SC.pullButton('r3-card'), flipBtn = SC.flipButton('r3-card');
  slot.appendChild(pullBtn); slot.appendChild(flipBtn);
  var flipIco = flipBtn.querySelector('.flip-ico');
  root.querySelector('.soc-slot').appendChild(SC.socialRow('r3a'));

  /* ---- the cue: a short, nearly straight pencil arrow and a hand note, drawn once when the stage arrives ---- */
  var cueSvg = cue.querySelector('.cue-arrow'), ar = Pen.arrow([12, 4], [14, 46], 'r3-cue', { bend: .05, head: 8 });
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
    if (on) { Pen.draw(cueShaft, { delay: 120, duration: 260 }); Pen.draw(cueHead, { delay: 370, duration: 130 }); }
    else { Pen.erase(cueShaft, { duration: 130 }); Pen.erase(cueHead, { duration: 90 }); }
  }
  function cueArrive() { if (cueSeen) return; cueSeen = true; if (cueOn) { cueOn = false; cueShow(true); } }

  /* ---- springs ---- */
  var SR0 = -1.4;   // the sleeve lies a little askew, as a hand put it down
  var e = new SC.Spring(0, 120, 1),         // extraction: how far the card has come out of the sleeve (px, desk scale)
    L = new SC.Spring(0, 118, .72),         // 0 on the desk / in the sleeve → 1 in the hand (one small overshoot)
    sd = new SC.Spring(0, 420, .42),        // the sleeve dragged along the pull axis
    sr = new SC.Spring(SR0, 260, .4),       // the sleeve's rotation, deg (narrower: it twists a little more easily)
    bw = new SC.Spring(0, 900, .3),         // the lip's sag, px
    th = new SC.Spring(0, 172, .73),        // A: flip angle (a slimmer card turns over a little quicker)
    rx = new SC.Spring(0, 170, .82), ry = new SC.Spring(0, 170, .82),
    hl = new SC.Spring(0, 260, .9);         // A: held off the page (shadow drifts further, lighter)
  function setK(s, k, z) { s.k = k; s.c = 2 * z * Math.sqrt(k); }

  var st = 'tucked', face = 0, seen = 0, t0 = 0, G = {}, want = null, drag = null, caught = false, base = 0, lastH = -1;
  var narrow = matchMedia('(max-width:680px)'), TILT_X = 5.5, TILT_Y = 8, STICK = 8, ZONE_R = .22, SNAP_PX = 30;
  var R0 = .72, FB = 1 - R0;   // friction ∝ card still inside: the card moves at R0 of the finger at first, 1:1 at the lip
  var AR = 12 / 7, DMAX = 72;  // 7:12 (tarot) in the hand; the lift may raise the card at most DMAX px toward the header

  /* ---- geometry ---- */
  // Sleeve-local coordinates: origin at the centre of the mouth, y toward the visitor. → rig coordinates (x from centre).
  function l2r(lx, ly, d, a) {
    var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), py = -G.hs / 2, dy = ly - py;
    return [lx * c - dy * s, py + lx * s + dy * c + G.M + d];
  }
  // finger travel (past the stick) → extraction, and back, under friction that falls as the card comes out
  function eOf(f) { return R0 / FB * G.E * (Math.exp(FB * f / G.E) - 1); }
  function fOf(x) { return G.E / FB * Math.log(1 + FB * Math.max(0, x) / (R0 * G.E)); }

  function measure(hdr) {
    var rw = rig.clientWidth, n = narrow.matches, vh = window.innerHeight || 900;
    // The room one screen gives the rig when the stage is scrolled to the top, under the board's sticky bar.
    var above = rig.getBoundingClientRect().top - stage.getBoundingClientRect().top;
    var room = Math.max(n ? 600 : 620, vh - (bar ? bar.offsetHeight : 0) - above - 10);
    var T = n ? 35 : 36, s = n ? 22 : 26, g = 10, figR = n ? 22 : 0;
    // In the hand: as large as the width allows and short enough to fit the room under the sleeve's header — but never
    // below the reference size (1u = 1px), where the type is still comfortable. Phones always use the full width: there
    // the page scrolls anyway, and a card fitted to a short phone's height would set its English lines at 9px.
    var W = Math.min(n ? rw : 420, rw - (n ? 0 : 24)), H = W * AR;
    if (!n) H = SC.clamp(room - T - hdr - figR, Math.min(H, 576), Math.min(H, 740));
    W = H / AR;
    // On the desk: the longest sleeve for which (a) the whole pull — the card's bottom at the catch and the finger's
    // over-pull — fits the room, and (b) lifting into the hand raises the card no more than DMAX.
    var kPull = (room - 6 - T + 1.6 * s - g - 38 + 22) / 2.1, kLift = (hdr + H / 2 + s - g + DMAX) / 1.5;
    var kH = SC.clamp(Math.min(kPull, kLift), .44 * H, .58 * H), k = kH / H, kW = k * W;
    var ws = Math.round(kW + 14), hs = Math.round(kH - s + g);
    return { rw: rw, n: n, room: room, W: W, H: H, k: k, s: s, kW: kW, kH: kH, ws: ws, hs: hs, nr: n ? 15 : 18, T: T, hdr: hdr,
      M: T + hs, E: kH - s, SN: n ? 18 : 20, fy: T + hdr + H / 2 };
  }
  function layout() {
    if (!rig.clientWidth) return;
    // The header's height depends on the sleeve's print size, which depends on its width: settle it in two passes.
    var g0 = measure(G.hdr || (narrow.matches ? 62 : 74));
    G = g0; sleeve.layout(G);
    var h = sleeve.header();
    if (Math.abs(h - G.hdr) > 1) { G = measure(h); sleeve.layout(G); }
    var u = G.H / 576;
    pos.style.width = G.W.toFixed(2) + 'px'; card.style.height = G.H.toFixed(2) + 'px'; card.style.setProperty('--u', u.toFixed(4) + 'px');
    shadow.style.width = G.W.toFixed(2) + 'px'; shadow.style.height = G.H.toFixed(2) + 'px';
    shadow.style.borderRadius = card.style.borderRadius = (14 * u).toFixed(1) + 'px';
    [].forEach.call(card.querySelectorAll('.a-edge'), function (p) { p.style.borderRadius = (14 * u).toFixed(1) + 'px'; });
    G.DS = 100;
    G.hT = Math.round(G.M + G.s + 34); G.hF = Math.round(G.fy + G.H / 2 + (G.n ? 30 : 14));
    grip.style.left = Math.round(G.rw / 2 - G.kW / 2 - 14) + 'px'; grip.style.top = Math.round(G.M - G.nr - 8) + 'px';
    grip.style.width = Math.round(G.kW + 28) + 'px'; grip.style.height = Math.round(G.s + G.nr + 30) + 'px';
    cue.style.left = Math.round(G.rw / 2 + G.ws / 2 + (G.n ? 2 : 8)) + 'px'; cue.style.top = Math.round(G.M + G.s * .1) + 'px';
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
      shadow.style.clipPath = 'inset(0 ' + (G.W * (1 - w) / 2).toFixed(1) + 'px round ' + (14 * G.H / 576).toFixed(1) + 'px)';
      shadow.style.opacity = (lc * (1 - hh * .4)).toFixed(3);
    } else shadow.style.opacity = 0;
    fig.style.opacity = (lc * lc).toFixed(3);
    var h = Math.round(G.hT + Math.max(0, G.hF - G.hT) * lc);
    if (h !== lastH) { lastH = h; rig.style.height = h + 'px'; }   // the page makes room as the card comes up to full size
    flipIco.style.transform = 'rotate(' + t.toFixed(1) + 'deg)';
    var vis = Math.cos(tv * Math.PI / 180) >= 0 ? 0 : 1;
    if (vis !== seen) { seen = vis; if (vis === 0) radar.reset(); }
    // Arrival at night in the hand: the witness starts taking notes, and the sleeve's checklist gets its second tick.
    if (st === 'free' && face === 1 && vis === 1 && radar.state === 'empty' && Math.abs(th.x - th.to) < 18) { radar.draw(); sleeve.tick(1); }
    if (st === 'free' && face === 0 && vis === 0 && Math.abs(th.x - th.to) < 18) sleeve.tick(0);
  }

  /* ---- phases (physics clock) ---- */
  function slideOut(v) { st = 'slide'; e.to = G.E + 40; setK(e, 58, .92); e.v = v; sd.to = 0; bw.to = 0; }
  function phase(dt) {
    var now = performance.now();
    if (st === 'stick') { if (now - t0 > 110) { e.x = Math.max(e.x, 4); slideOut(250); } }
    else if (st === 'slide') { e.step(dt); if (e.x >= G.E - G.SN) catchLip(); }
    else if (st === 'catch') { e.step(dt); if (now - t0 > 170) snap(); }
    else if (st === 'pop') { e.step(dt); if (now - t0 > 120) lift(); }
    else if (st === 'lift' || st === 'handback') { L.step(dt); e.step(dt); if (L.rest(.002)) { L.snap(1); arrive(); } }
    else if (st === 'return' || st === 'tucked') { e.step(dt); if (st === 'return' && e.rest(1)) { e.snap(0); st = 'tucked'; } }
    else if (st === 'lower') { L.step(dt); if (L.x <= .004) { L.snap(0); st = 'slidein'; e.to = 0; setK(e, 80, 1); e.v = -60; bw.v -= 50; } }
    else if (st === 'slidein') { e.step(dt); if (e.rest(1.2)) { e.snap(0); tucked(); } }
  }
  function catchLip() {
    st = 'catch'; t0 = performance.now();
    e.to = G.E - G.SN + 6; setK(e, 500, 1); sd.to = 10; bw.to = 6; sleeve.startle(900);
  }
  // The friction lets go: the card jumps clear and skids a hair past the lip, the sleeve slaps back past rest and twists
  // (one corner lets go first), the lip flutters once, two frames of impact ticks, the bird starts. A held beat on the
  // desk — then the card is picked up into the hand.
  function snap() {
    st = 'pop'; caught = false; t0 = performance.now();
    e.to = G.E; setK(e, 520, .55); e.v = 520;
    sd.to = 0; sd.v = -300; sr.v -= 52; bw.to = 0; bw.v = -120;
    sleeve.impact(); sleeve.startle(760);
    cueShow(false); setHint(); loop.kick();
  }
  // Picked up: it comes to full size and a little toward you, and a longer card tips further as it leaves the desk.
  function lift() {
    st = 'lift';
    L.to = 1; setK(L, 118, .72); L.v = 1.3; rx.v += 105; hl.v += 8;
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
  // f: finger travel toward the visitor, px. Stick, slip, friction that eases as the card comes out, then the catch.
  function pullTo(f) {
    if (st !== 'pull') return false;
    f = Math.max(0, f);
    if (f < STICK) { e.x = e.to = base; sd.to = f * .4; bw.to = f * .45; }
    else {
      var zone = G.E - G.SN, f0 = base + 4, fz = fOf(zone - f0), ff = f - STICK;
      if (ff < fz) { e.x = e.to = f0 + eOf(ff); sd.to = 0; bw.to = 0; }
      else {
        var over = ff - fz;
        e.x = e.to = zone + over * ZONE_R; sd.to = Math.min(14, over * .42); bw.to = Math.min(7, over * .26);
        if (!caught) { caught = true; sleeve.startle(1000); }
        if (over > SNAP_PX) { snap(); return true; }
      }
    }
    e.v = 0; loop.kick(); return false;
  }
  // Let go mid-pull: far enough (or flicked) and it carries on out through the catch; otherwise the sleeve takes it back.
  function pullEnd(v) {
    if (st !== 'pull') return;
    if (e.x >= G.E * .3 || v > 520) slideOut(Math.max(v * .9, 280));
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
    else { L.x = L.to = 0; e.x = e.to = Math.max(0, G.E - (up - G.DS) * .85); }
    L.v = e.v = 0; loop.kick();
  }
  function carryEnd(v) {
    if (st !== 'carry') return;
    if (L.x <= 0 && (G.E - e.x > 22 || v > 420)) { st = 'slidein'; e.to = 0; setK(e, 80, 1); e.v = -Math.min(900, Math.max(0, v) * .8); }
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
    rx.to = (.5 - SC.clamp(v, 0, 1)) * 2 * TILT_X; ry.to = (SC.clamp(u, 0, 1) - .5) * 2 * TILT_Y; loop.kick();
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
    rx.to = SC.clamp(-dy * .04, -TILT_X, TILT_X); ry.to = 0;
    var now = performance.now(); drag.hist.push([now, a]);
    while (drag.hist.length > 2 && now - drag.hist[0][0] > 90) drag.hist.shift();
    loop.kick();
  }
  function holdTilt(dy) { if (drag && !Pen.reduced()) { rx.to = SC.clamp(-dy * .04, -TILT_X, TILT_X); loop.kick(); } }
  function turn(dir) {
    if (st !== 'free') return;
    var b = Math.round(th.to / 180) * 180, target = b + 180 * dir;
    th.to = target; setFace(faceOf(target));
    if (Pen.reduced()) { th.snap(th.to); rx.snap(0); ry.snap(0); hl.snap(0); render(); return; }
    th.v += dir * 150; hl.v += 5; loop.kick();
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

  window.R3A = {
    root: root, rig: rig, card: card, pos: pos, grip: grip, front: sleeve.front, hit: hit, pullBtn: pullBtn, flipBtn: flipBtn,
    state: function () { return st; }, geo: function () { return G; }, layout: layout, reset: reset, cueArrive: cueArrive,
    aspect: function (r) { if (r) { AR = r; layout(); } return AR; },
    pullStart: pullStart, pullTo: pullTo, pullEnd: pullEnd, autoPull: autoPull, nudge: nudge,
    carryStart: carryStart, carryTo: carryTo, carryEnd: carryEnd, tuck: tuck,
    tiltAt: tiltAt, tiltReset: tiltReset, grab: grab, turnTo: turnTo, holdTilt: holdTilt, turn: turn, release: release
  };
  layout(); tucked();
  var lastW = rig.clientWidth, lastVH = window.innerHeight;
  function relayout() { if (rig.clientWidth !== lastW || window.innerHeight !== lastVH) { lastW = rig.clientWidth; lastVH = window.innerHeight; layout(); } }
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(rig);
  window.addEventListener('resize', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);   // the sleeve's header height depends on its fonts
  setHint();
})();
