/* r4-07 · the rig: the r3 card (7:12, same faces, same A in the hand) taken out of the sleeve from the SIDE.
   Fred, on round 3: "take it out from the side (right side) — more realistic with a long card."
   · 'long' (the pick): the sleeve lies on its side, mouth on the right, the card inside along its long axis with
     its top deepest, so its bottom comes out first and the name clears the lip last. You pull it right; friction
     eases as less card is inside; the edge catches on the lip, the lip bows, it pops free — then it is lifted into
     the hand and turned upright: a quarter turn on the physics clock with one small overshoot.
   · 'short' (the alternative): the sleeve stands upright with its mouth on the long right edge; the card slides
     out sideways along its short axis and needs no turn.
   While you pull, the sleeve gives a little the other way — the hand that holds it — which is also what keeps a
   phone's pull inside the screen. Putting it back reverses the order: drag the card left toward the mouth and it
   is set down on the desk (turned back to landscape), then pushed in with the same friction. In the hand a drag
   to the RIGHT throws it over (A), a drag to the LEFT is toward the sleeve and puts it back; vertical swipes scroll.
   Geometry, springs, phases and render live here; r4-07-about-hands.js maps pointer, touch and keys onto R4A. */
(function () {
  var root = document.getElementById('cand-a'); if (!root) return;
  var stage = root.querySelector('.stage'), rig = root.querySelector('.rig'), pos = rig.querySelector('.card-pos'), card = pos.querySelector('.a-card'),
    day = card.querySelector('.a-day'), night = card.querySelector('.a-night'), shadow = rig.querySelector('.a-shadow'),
    fig = pos.querySelector('.sc-fig'), grip = rig.querySelector('.grip'), cue = rig.querySelector('.cue'),
    hit = rig.querySelector('.sl-hit'), hint = root.querySelector('.hs-hint'), bar = document.querySelector('.mock-top');
  day.innerHTML = SC.dayFace();
  night.innerHTML = SC.nightFace('r4-rd');
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

  var slot = root.querySelector('.ctl-slot'), pullBtn = SC.pullButton('r4-card'), flipBtn = SC.flipButton('r4-card');
  slot.appendChild(pullBtn); slot.appendChild(flipBtn);
  var flipIco = flipBtn.querySelector('.flip-ico');
  root.querySelector('.soc-slot').appendChild(SC.socialRow('r4a'));

  /* ---- marks: focus 「 」 on the sliver, the card and the empty sleeve (coral, transient) ---- */
  var gripFocus = SC.Focus(rig, 'r4-grip', { gap: 4, arm: 12 }), cardFocus = SC.Focus(rig, 'r4-card', { gap: 10, arm: 22 });
  SC.focusMark(hit, 'r4-hit', { gap: 6, arm: 16 });
  grip.addEventListener('focus', function () { if (grip.matches(':focus-visible') && st === 'tucked') gripFocus.show(); });
  grip.addEventListener('blur', gripFocus.hide);
  card.addEventListener('focus', function () { if (card.matches(':focus-visible') && st === 'free') cardFocus.show(); });
  card.addEventListener('blur', cardFocus.hide);

  /* ---- the cue: the view's one point. r3-02's arrow glyph (short, nearly straight, landing square), coral,
     drawn once when the sleeve is first seen and retired for the session by the first pull ---- */
  var CUE_KEY = 'r4-07-pulled', cueSvg = cue.querySelector('.cue-arrow'), cueShaft = null, cueHead = null;
  function buildCue() {
    var gl = ArrowFit.glyph([36, 0], 4, 34, 'r4-cue');
    cueSvg.innerHTML = '';
    cueShaft = Pen.path(gl.shaft, { color: 'var(--mark)', width: 2.2 }); cueHead = Pen.path(gl.head, { color: 'var(--mark)', width: 2.2 });
    cueSvg.appendChild(cueShaft); cueSvg.appendChild(cueHead);
    [cueShaft, cueHead].forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = cueOn && cueSeen ? 0 : Pen.hiddenAt(p, L); });
  }
  var cueOn = false, cueSeen = false;
  function cueAllowed() { try { return sessionStorage.getItem(CUE_KEY) !== '1'; } catch (_) { return true; } }
  function cueShow(on) {
    on = on && cueAllowed();
    if (on === cueOn) return; cueOn = on; cue.classList.toggle('on', on);
    if (!cueSeen || !cueShaft) return;
    if (on) { Pen.draw(cueShaft, { delay: 120, duration: 240 }); Pen.draw(cueHead, { delay: 360, duration: 120 }); }
    else { Pen.erase(cueShaft, { duration: 130 }); Pen.erase(cueHead, { duration: 90 }); }
  }
  function cueArrive() { if (cueSeen) return; cueSeen = true; if (cueOn) { cueOn = false; cueShow(true); } }
  function cueRetire() { try { sessionStorage.setItem(CUE_KEY, '1'); } catch (_) {} cueShow(false); }

  /* ---- springs ---- */
  var SR0 = -1.2;   // the sleeve lies a little askew, as a hand put it down
  var e = new SC.Spring(0, 120, 1),         // extraction along the pull (px, desk scale)
    L = new SC.Spring(0, 118, .72),         // 0 on the desk / in the sleeve → 1 in the hand
    qt = new SC.Spring(0, 150, .66),        // the quarter turn, deg: landscape (-90) → upright (0), one small overshoot
    sd = new SC.Spring(0, 420, .42),        // the sleeve along the pull axis (+ = toward the pull)
    sr = new SC.Spring(SR0, 260, .4),       // the sleeve's rotation, deg
    bw = new SC.Spring(0, 900, .3),         // the lip's bow, px
    hx = new SC.Spring(0, 300, .9),         // the held card leaning toward the sleeve before it is set down
    th = new SC.Spring(0, 172, .73),        // A: flip angle
    rx = new SC.Spring(0, 170, .82), ry = new SC.Spring(0, 170, .82),
    hl = new SC.Spring(0, 260, .9);         // A: held off the page (shadow drifts further, lighter)
  function setK(s, k, z) { s.k = k; s.c = 2 * z * Math.sqrt(k); }

  var st = 'tucked', face = 0, seen = 0, t0 = 0, G = {}, want = null, drag = null, caught = false, base = 0, lastH = -1;
  var cSd = 0, cSr = SR0, armed = false, landed = false, upLand = 0, lastUp = 0, turned = false;
  var TILT_X = 5.5, TILT_Y = 8, STICK = 8, ZONE_R = .22, SNAP_PX = 30, ARM = 26;
  var R0 = .72, FB = 1 - R0;   // friction ∝ card still inside: R0 of the finger at first, 1:1 at the lip
  var AR = 12 / 7, ORIENT = 'long';

  /* ---- geometry ---- */
  // Sleeve-local coordinates: origin at the centre of the mouth, x toward the pull (right). → rig coordinates.
  function l2r(lx, ly, d, a) {
    var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), dx = lx + G.ws / 2;
    return [G.sx + G.ws / 2 + dx * c - ly * s + d, G.sy + G.hs / 2 + dx * s + ly * c];
  }
  function eOf(f) { return R0 / FB * G.E * (Math.exp(FB * f / G.E) - 1); }
  function fOf(x) { return G.E / FB * Math.log(1 + FB * Math.max(0, x) / (R0 * G.E)); }

  function measure(hdr) {
    // Stacked (sleeve on top) whenever the stage is too narrow to put the sleeve beside the card — not only on phones.
    var rw = rig.clientWidth, n = rw < 720, vh = window.innerHeight || 900, long = ORIENT === 'long';
    var above = rig.getBoundingClientRect().top - stage.getBoundingClientRect().top;
    var room = Math.max(n ? 600 : 620, vh - (bar ? bar.offsetHeight : 0) - above - 10);
    var s = n ? 20 : 26, g = 10, padT = 14;
    // In the hand: on a desk-width screen the sleeve sits beside the card, so the card can use the full height;
    // on a phone it uses the full width (the page scrolls anyway; a height-fitted card would set 9px English).
    var W, H;
    if (n) { W = Math.min(rw, 400); H = W * AR; }
    else { H = SC.clamp(room - padT - 14, 576, 740); W = H / AR; if (W > rw * .42) { W = rw * .42; H = W * AR; } }
    // On the desk. A phone needs the card, lying fully out of the mouth, to fit beside the sleeve: sleeve + card
    // length ≤ the width. A desk screen has room, so the card lies at half size (the lift doubles it).
    var ext0 = long ? H : W, k = n ? SC.clamp((rw - 6 + s - g) / 2 / ext0, .26, .56) : .5;
    var kW = k * W, kH = k * H, ext = long ? kH : kW, across = long ? kW : kH;
    var ws = Math.round(ext - s + g), hs = Math.round(across + 14), gx = 22, G1 = { rw: rw, n: n, room: room, W: W, H: H, k: k, s: s, kW: kW, kH: kH,
      ext: ext, ws: ws, hs: hs, nr: n ? 14 : 18, E: ext - s, SN: n ? 16 : 20, hdr: hdr, rot0: long ? -90 : 0,
      beta: n ? .25 : .1, fs: long ? ws / 31 : ws / 20.5 };
    G1.amp = 1 / (1 - G1.beta);
    if (!n) {   // sleeve top left of centre; lifting brings the card toward you (down) and to its right, beside the sleeve
      G1.sx = Math.round((rw - (ws + gx + W)) / 2); G1.hx = G1.sx + ws + gx + W / 2; G1.hy = padT + H / 2;
      G1.sy = 38; G1.hT = Math.round(G1.sy + hs + 40); G1.hF = Math.round(padT + H + 14);
    } else {    // sleeve at the top left; the card drawn out right, then turned upright into the centre below it
      G1.sx = 4; G1.sy = 34; G1.hx = rw / 2;
      var top = Math.max(G1.sy + hdr, Math.min(G1.sy + hs + 10, room - H - 24));
      G1.hy = top + H / 2; G1.hT = Math.round(G1.sy + hs + 26); G1.hF = Math.round(G1.hy + H / 2 + 30);
    }
    G1.M = G1.sx + ws; G1.cy = G1.sy + hs / 2;
    return G1;
  }
  function layout() {
    if (!rig.clientWidth) return;
    G = measure(G.hdr || 56); sleeve.layout(G);
    var h = sleeve.header();
    if (Math.abs(h - G.hdr) > 1) { G = measure(h); sleeve.layout(G); }
    var u = G.H / 576;
    pos.style.width = G.W.toFixed(2) + 'px'; card.style.height = G.H.toFixed(2) + 'px'; card.style.setProperty('--u', u.toFixed(4) + 'px');
    shadow.style.width = G.W.toFixed(2) + 'px'; shadow.style.height = G.H.toFixed(2) + 'px';
    shadow.style.borderRadius = card.style.borderRadius = (14 * u).toFixed(1) + 'px';
    [].forEach.call(card.querySelectorAll('.a-edge'), function (p) { p.style.borderRadius = (14 * u).toFixed(1) + 'px'; });
    var across = ORIENT === 'long' ? G.kW : G.kH;
    grip.style.left = Math.round(G.M - G.nr - 10) + 'px'; grip.style.top = Math.round(G.cy - across / 2 - 12) + 'px';
    grip.style.width = Math.round(G.nr + G.s + 26) + 'px'; grip.style.height = Math.round(across + 24) + 'px';
    gripFocus.place({ x: G.M - G.nr - 8, y: G.cy - across / 2 - 6, w: G.nr + G.s + 16, h: across + 12 });
    cardFocus.place({ x: G.hx - G.W / 2, y: G.hy - G.H / 2, w: G.W, h: G.H });
    cue.style.left = Math.round(G.M + G.s + 14) + 'px'; cue.style.top = Math.round(G.cy - 12) + 'px';
    buildCue();
    rig.classList.toggle('is-short', ORIENT === 'short');
    rig.classList.toggle('stacked', G.n);
    if (st === 'free' || st === 'tucked') { e.snap(st === 'free' ? G.E : Math.min(e.to, 5)); L.snap(st === 'free' ? 1 : 0); qt.snap(st === 'free' ? 0 : G.rot0); }
    render();
  }

  /* ---- render ---- */
  function attached() { return st !== 'pop' && st !== 'lift' && st !== 'free'; }
  function pose() {
    var l = Math.max(0, L.x), lc = Math.min(1, l), a = attached(), d0 = a ? sd.x : cSd, r0 = a ? sr.x : cSr;
    var d = l2r(G.s + e.x - G.ext / 2, 0, d0, r0);
    return { cx: d[0] + (G.hx - d[0]) * l + hx.x * lc, cy: d[1] + (G.hy - d[1]) * l, sc: G.k + (1 - G.k) * l, rz: qt.x + r0 * (1 - lc) };
  }
  function render() {
    if (!G.W) return;
    var p = pose(), lc = SC.clamp(L.x, 0, 1), rest = st === 'free' && Math.abs(p.sc - 1) < 1e-3 && Math.abs(p.rz) < .01;
    var tx = p.cx - G.W / 2, ty = p.cy - G.H / 2;
    if (rest) { tx = Math.round(tx); ty = Math.round(ty); }
    pos.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) rotate(' + p.rz.toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
    pos.style.zIndex = L.x > .001 ? 6 : 2;   // in the sleeve: between its panels. Out: above it.
    sleeve.pose(sd.x, sr.x); sleeve.bow(bw.x);
    var t = th.x, tv = t + ry.x, hh = hl.x;
    card.style.transform = 'translateZ(' + (hh * 10).toFixed(2) + 'px) rotateX(' + rx.x.toFixed(2) + 'deg) rotateY(' + tv.toFixed(2) + 'deg)';
    // A's halftone contact shadow: the card's silhouette on the page, turning with it, narrowing with the flip.
    if (lc > 0) {
      var w = Math.min(1, Math.abs(Math.cos(tv * Math.PI / 180)) + Math.abs(Math.sin(t * Math.PI / 180)) * TH / G.W);
      var sx = -ry.x * 1.8 * (1 + hh * .7) * p.sc, sy = (10 + hh * 12 + rx.x * .8) * p.sc;
      shadow.style.transform = 'translate(' + (tx + sx).toFixed(1) + 'px,' + (ty + sy).toFixed(1) + 'px) rotate(' + p.rz.toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
      shadow.style.clipPath = 'inset(0 ' + (G.W * (1 - w) / 2).toFixed(1) + 'px round ' + (14 * G.H / 576).toFixed(1) + 'px)';
      shadow.style.opacity = (lc * (1 - hh * .4)).toFixed(3);
    } else shadow.style.opacity = 0;
    fig.style.opacity = (lc * lc * (1 - Math.min(1, Math.abs(qt.x) / 30))).toFixed(3);
    var h = Math.round(G.hT + Math.max(0, G.hF - G.hT) * lc);
    if (h !== lastH) { lastH = h; rig.style.height = h + 'px'; }
    flipIco.style.transform = 'rotate(' + t.toFixed(1) + 'deg)';
    var vis = Math.cos(tv * Math.PI / 180) >= 0 ? 0 : 1;
    if (vis !== seen) { seen = vis; if (vis === 0) radar.reset(); }
    if (st === 'free' && face === 1 && vis === 1 && radar.state === 'empty' && Math.abs(th.x - th.to) < 18) { radar.draw(); sleeve.tick(1); }
    if (st === 'free' && face === 0 && vis === 0 && Math.abs(th.x - th.to) < 18) sleeve.tick(0);
  }

  /* ---- phases (physics clock) ---- */
  function slideOut(v) { st = 'slide'; e.to = G.E + 40; setK(e, 58, .92); e.v = v; bw.to = 0; }
  function phase(dt) {
    var now = performance.now();
    if (st === 'stick') { if (now - t0 > 110) { e.x = Math.max(e.x, 4); slideOut(250); } }
    else if (st === 'slide') { e.step(dt); sd.to = -G.beta * e.x; if (e.x >= G.E - G.SN) catchLip(); }
    else if (st === 'catch') { e.step(dt); if (now - t0 > 170) snap(); }
    else if (st === 'pop') { e.step(dt); if (now - t0 > 120) lift(); }
    else if (st === 'lift' || st === 'handback') {
      L.step(dt); e.step(dt); qt.step(dt); hx.step(dt);
      // The hand picks it up, then turns it. On a narrow stage the card is as wide as the page, so it is turned while
      // still small and only then brought up to size — a full-size card turning would sweep its corners off the page.
      if (!turned && now - t0 > (G.n ? 0 : 60)) { turned = true; qt.to = 0; }
      if (G.n && L.to === 0 && Math.abs(qt.x) < 28) { L.to = 1; L.v = 1.1; }
      if (L.rest(.002) && qt.rest(.3)) { L.snap(1); qt.snap(0); arrive(); }
    }
    else if (st === 'return' || st === 'tucked') { e.step(dt); if (st === 'return' && e.rest(1)) { e.snap(0); st = 'tucked'; } }
    else if (st === 'carry') {
      L.step(dt); qt.step(dt); hx.step(dt);
      if (armed && !landed && L.x < .02 && Math.abs(qt.x - G.rot0) < 3) { landed = true; L.snap(0); upLand = lastUp; }
    }
    else if (st === 'lower') { L.step(dt); qt.step(dt); hx.step(dt); if (L.x <= .004 && Math.abs(qt.x - G.rot0) < 2) { L.snap(0); qt.snap(G.rot0); slideIn(-60); } }
    else if (st === 'slidein') { e.step(dt); if (e.rest(1.2)) { e.snap(0); tucked(); } }
  }
  function catchLip() {
    st = 'catch'; t0 = performance.now();
    e.to = G.E - G.SN + 6; setK(e, 500, 1); sd.to = -G.beta * (G.E - G.SN) + 10; bw.to = 6; sleeve.startle(900);
  }
  // The friction lets go: the card jumps clear and skids a hair past the lip, the sleeve jerks back past rest and
  // twists (one corner lets go first), the lip flutters once, two frames of impact ticks, the bird starts.
  function snap() {
    st = 'pop'; caught = false; t0 = performance.now(); cSd = sd.x; cSr = sr.x;
    e.to = G.E; setK(e, 520, .55); e.v = 520;
    sd.to = 0; sd.v = -300; sr.v -= 52; bw.to = 0; bw.v = -120;
    sleeve.impact(); sleeve.startle(760); cueRetire(); setHint(); loop.kick();
  }
  // Picked up: it comes to full size, tips toward you, and is turned upright a beat later.
  function lift() {
    st = 'lift'; t0 = performance.now(); turned = G.rot0 === 0;
    L.to = G.n && G.rot0 ? 0 : 1; setK(L, 118, .72); L.v = G.n && G.rot0 ? .25 : 1.3; rx.v += 70; hl.v += 8; qt.to = G.rot0;
  }
  function slideIn(v) { st = 'slidein'; e.to = 0; setK(e, 80, 1); e.v = v; sd.to = 0; bw.v -= 50; }
  function arrive() {
    st = 'free';
    pullBtn.hidden = true; flipBtn.hidden = false; grip.hidden = true;
    card.tabIndex = 0; hit.tabIndex = 0; hit.removeAttribute('aria-hidden');
    focusWant(); setHint(); render();
  }
  function tucked() {
    st = 'tucked'; radar.reset();
    pullBtn.hidden = false; flipBtn.hidden = true; grip.hidden = false;
    card.tabIndex = -1; hit.tabIndex = -1; hit.setAttribute('aria-hidden', 'true'); cardFocus.hide();
    cueShow(true); focusWant(); setHint(); render();
  }
  function focusWant() {
    var el = { card: card, grip: grip, flip: flipBtn, pull: pullBtn }[want]; want = null;
    if (el) el.focus({ preventScroll: true });
  }
  function setHint() {
    hint.innerHTML = st === 'free' || st === 'lift' || st === 'pop'
      ? '<span class="hand-cn">往右甩，翻面</span> · throw it → &nbsp; <span class="hand-cn">往左推回去</span> · push it back ←'
      : '<span class="hand-cn">往右拉，或点一下</span> · drag it out →, or just click';
  }

  var loop = SC.Loop(function (dt) {
    phase(dt);
    if (!drag) th.step(dt);
    rx.step(dt); ry.step(dt); hl.step(dt); sd.step(dt); sr.step(dt); bw.step(dt);
    if (st === 'free' || st === 'tucked') hx.step(dt);
    render();
    var calm = e.rest(.2) && sd.rest(.05) && sr.rest(.02) && bw.rest(.05) && th.rest(.05) && rx.rest(.02) && ry.rest(.02) && hl.rest(.002) && hx.rest(.1);
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
    card.setAttribute('aria-label', (n ? '标本卡，夜间形态。' : '标本卡，日间形态。') + '按回车或右箭头翻面，按左箭头或 Esc 放回卡套。' +
      (n ? 'Specimen card, night form.' : 'Specimen card, day form.') + ' Enter or Arrow Right turns it over; Arrow Left or Escape puts it back in the sleeve.');
  }

  /* ---- API: the pull (f = finger travel to the right, px) ---- */
  function pullStart() { if (st !== 'tucked') return false; st = 'pull'; gripFocus.hide(); base = e.x; caught = false; cueShow(false); loop.kick(); return true; }
  // Stick, slip, friction that eases as the card comes out, the sleeve giving the other way, then the catch.
  function pullTo(f) {
    if (st !== 'pull') return false;
    f = Math.max(0, f);
    if (f < STICK) { e.x = e.to = base; sd.to = f * .4; bw.to = f * .45; }
    else {
      var zone = G.E - G.SN, f0 = base + 4, ff = (f - STICK) * G.amp, fz = fOf(zone - f0);
      if (ff < fz) { e.x = e.to = f0 + eOf(ff); sd.to = -G.beta * e.x; bw.to = 0; }
      else {
        var over = (ff - fz) / G.amp;
        e.x = e.to = zone + over * ZONE_R; sd.to = -G.beta * zone + Math.min(14, over * .42); bw.to = Math.min(7, over * .26);
        if (!caught) { caught = true; sleeve.startle(1000); }
        if (over > SNAP_PX) { snap(); return true; }
      }
    }
    e.v = 0; loop.kick(); return false;
  }
  function pullEnd(v) {
    if (st !== 'pull') return;
    if (e.x >= G.E * .3 || v > 520) slideOut(Math.max(v * .9, 280));
    else { st = 'return'; e.to = 0; setK(e, 130, 1); e.v = 0; sd.to = 0; bw.to = 0; caught = false; cueShow(true); }
    loop.kick();
  }
  function autoPull(focus) {
    if (st !== 'tucked') return;
    want = focus || null; cueShow(false); gripFocus.hide();
    if (Pen.reduced()) { cueRetire(); e.snap(G.E); L.snap(1); qt.snap(0); arrive(); return; }
    st = 'stick'; t0 = performance.now(); sd.to = 3; bw.to = 3; sleeve.startle(500); loop.kick();
  }
  function nudge(on) { if (st !== 'tucked' || Pen.reduced()) return; e.to = on ? 5 : 0; setK(e, 180, .8); loop.kick(); }

  /* ---- API: back into the sleeve (up = finger travel to the LEFT, toward the mouth) ---- */
  function carryStart() { if (st !== 'free') return false; st = 'carry'; drag = null; armed = landed = false; lastUp = 0; hl.to = 0; rx.to = ry.to = 0; loop.kick(); return true; }
  // The card leans toward the sleeve with your hand; past ARM px it is set down on the desk by the mouth (turned
  // back to landscape) and from there the same drag pushes it in, the sleeve easing toward it.
  function carryTo(up) {
    if (st !== 'carry') return;
    up = Math.max(0, up); lastUp = up;
    if (!armed) {
      hx.to = -Math.min(up, ARM) * .6;
      if (up > ARM) { armed = true; hx.to = 0; L.to = 0; setK(L, 230, 1); qt.to = G.rot0; e.snap(G.E); }
    } else if (landed) {
      e.x = e.to = Math.max(0, G.E - (up - upLand) * .85); e.v = 0; sd.to = G.beta * .5 * (G.E - e.x) * .2;
    }
    loop.kick();
  }
  function carryEnd(v) {
    if (st !== 'carry') return;
    if (landed && (G.E - e.x > 22 || v > 420)) slideIn(-Math.min(900, Math.max(0, v) * .8));
    else if (armed && v > 600) { st = 'lower'; L.to = 0; setK(L, 200, 1); qt.to = G.rot0; }
    else handBack();
    loop.kick();
  }
  function handBack() { st = 'handback'; t0 = performance.now(); turned = true; e.snap(G.E); L.to = 1; setK(L, 150, .74); qt.to = 0; hx.to = 0; sd.to = 0; }
  function tuck(focus) {
    if (st !== 'free') return;
    want = focus || null; drag = null; rx.to = ry.to = hl.to = 0; cardFocus.hide();
    if (Pen.reduced()) { L.snap(0); e.snap(0); qt.snap(G.rot0); rx.snap(0); ry.snap(0); hl.snap(0); tucked(); return; }
    st = 'lower'; L.to = 0; setK(L, 170, 1); qt.to = G.rot0; loop.kick();
  }

  /* ---- API: A in the hand — tilt, grab, drag right to throw ---- */
  function tiltAt(x, y) {
    if (st !== 'free' || drag || Pen.reduced()) return;
    var r = rig.getBoundingClientRect(), u = (x - (r.left + G.hx - G.W / 2)) / G.W, v = (y - (r.top + G.hy - G.H / 2)) / G.H;
    if (u < -.04 || u > 1.04 || v < -.04 || v > 1.04) return tiltReset();
    rx.to = (.5 - SC.clamp(v, 0, 1)) * 2 * TILT_X; ry.to = (SC.clamp(u, 0, 1) - .5) * 2 * TILT_Y; loop.kick();
  }
  function tiltReset() { if (drag || st !== 'free') return; rx.to = 0; ry.to = 0; loop.kick(); }
  function grab() {
    if (st !== 'free') return false;
    var now = performance.now();
    drag = { th0: th.x, base: Math.round(th.to / 180) * 180, t0: now, hist: [[now, th.x]] };
    th.to = th.x; th.v = 0;
    if (!Pen.reduced()) hl.to = 1;
    loop.kick(); return true;
  }
  function turnTo(dx, dy) {
    if (!drag || Pen.reduced()) return;
    var a = drag.th0 + dx * 180 / (G.W * .9), lo = drag.base - 180, hi = drag.base + 180;
    if (a > hi) a = hi + (a - hi) * .2; else if (a < lo) a = lo + (a - lo) * .2;
    th.x = th.to = a; th.v = 0;
    rx.to = SC.clamp(-dy * .04, -TILT_X, TILT_X); ry.to = 0;
    var now = performance.now(); drag.hist.push([now, a]);
    while (drag.hist.length > 2 && now - drag.hist[0][0] > 90) drag.hist.shift();
    loop.kick();
  }
  function holdTilt(dy) { if (drag && !Pen.reduced()) { rx.to = SC.clamp(-dy * .04, -TILT_X, TILT_X); loop.kick(); } }
  function letGo() { drag = null; hl.to = 0; rx.to = 0; loop.kick(); }   // a grab that became a carry
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
      ? (w > 0 ? Math.floor(th.x / 180 + 1e-6) * 180 + 180 : Math.ceil(th.x / 180 - 1e-6) * 180 - 180)
      : Math.round((th.x + w * .16) / 180) * 180;
    target = SC.clamp(target, d.base - 180, d.base + 180);
    var cap = Math.min(1000, Math.max(200, 1.3 * Math.sqrt(th.k) * Math.abs(target - th.x)));
    th.to = target; th.v = SC.clamp(w, -cap, cap); setFace(faceOf(target)); loop.kick();
  }

  /* ---- reset: replay, orientation switch, reduced motion (the card is simply presented upright, out of its sleeve) ---- */
  function reset(free) {
    drag = null; want = null; caught = false; armed = landed = false;
    [th, rx, ry, hl, sd, bw, hx].forEach(function (s) { s.snap(0); }); sr.snap(SR0);
    setFace(0); radar.reset(); sleeve.clearTicks(); seen = 0; cSd = 0; cSr = SR0;
    if (free) { e.snap(G.E); L.snap(1); qt.snap(0); cueShow(false); arrive(); } else { e.snap(0); L.snap(0); qt.snap(G.rot0); tucked(); }
    render();
  }
  function orient(o) { if (!o) return ORIENT; ORIENT = o; st = 'tucked'; layout(); reset(Pen.reduced()); return ORIENT; }

  window.R4A = {
    root: root, rig: rig, card: card, pos: pos, grip: grip, front: sleeve.front, hit: hit, pullBtn: pullBtn, flipBtn: flipBtn,
    state: function () { return st; }, geo: function () { return G; }, layout: layout, reset: reset, orient: orient, cueArrive: cueArrive,
    rearmCue: function () { try { sessionStorage.removeItem(CUE_KEY); } catch (_) {} },
    pullStart: pullStart, pullTo: pullTo, pullEnd: pullEnd, autoPull: autoPull, nudge: nudge,
    carryStart: carryStart, carryTo: carryTo, carryEnd: carryEnd, tuck: tuck, letGo: letGo,
    tiltAt: tiltAt, tiltReset: tiltReset, grab: grab, turnTo: turnTo, holdTilt: holdTilt, turn: turn, release: release
  };
  layout(); tucked();
  var lastW = rig.clientWidth, lastVH = window.innerHeight;
  function relayout() { if (rig.clientWidth !== lastW || window.innerHeight !== lastVH) { lastW = rig.clientWidth; lastVH = window.innerHeight; layout(); } }
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(rig);
  window.addEventListener('resize', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  setHint();
})();
