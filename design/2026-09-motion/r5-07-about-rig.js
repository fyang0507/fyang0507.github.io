/* r5-07 · the rig: r4's short-axis build as the only one — the sleeve stands upright with its mouth on the long right
   edge, the card slides out sideways (no turn), catches on the lip, pops free and is lifted into the hand beside it.
   Round 5 separates the two things you do with the card in your hand, so direction never decides between them:
   · FLIP lives on the card. A tap flips it; a quick, short flick flips it in the flick's direction, either way.
   · PUT BACK is a place, not a direction: carry the card onto the sleeve. As it nears, the sleeve answers — the lip
     bows toward it, a coral 「 」 marks the mouth, the card dips toward the desk — and once its centre is over the
     sleeve the sleeve takes it: the card docks, half into the mouth at desk size (push further, it goes deeper; pull
     away, it comes back out into your hand). Let go while it is docked and it slides the rest of the way in.
   · Anything else settles back into the hand, on the face it was showing.
   The release rule and its thresholds live in holdEnd(); r5-07-about-hands.js only measures pointer, touch and keys. */
(function () {
  var root = document.getElementById('cand-a'); if (!root) return;
  var stage = root.querySelector('.stage'), rig = root.querySelector('.rig'), pos = rig.querySelector('.card-pos'), card = pos.querySelector('.a-card'),
    day = card.querySelector('.a-day'), night = card.querySelector('.a-night'), shadow = rig.querySelector('.a-shadow'),
    fig = pos.querySelector('.sc-fig'), grip = rig.querySelector('.grip'), cue = rig.querySelector('.cue'),
    hit = rig.querySelector('.sl-hit'), putT = hit.querySelector('.put'), note = rig.querySelector('.hold-note'),
    hint = root.querySelector('.hs-hint'), bar = document.querySelector('.mock-top');
  day.innerHTML = SC.dayFace();
  night.innerHTML = SC.nightFace('r5-rd');
  var radar = SC.Radar(night.querySelector('.sc-radar'));
  var sleeve = Sleeve(rig);

  var TH = 12, PLIES = 9;   // A's stock: 9 flat plies across 12px; the middle ply is the glue line
  for (var i = 0; i < PLIES; i++) {
    var ply = document.createElement('div'), z = -TH / 2 + .6 + i * (TH - 1.2) / (PLIES - 1);
    ply.className = 'a-edge' + (i === 4 ? ' core' : (i === 0 || i === PLIES - 1 ? ' outer' : ''));
    ply.setAttribute('aria-hidden', 'true'); ply.style.transform = 'translateZ(' + z.toFixed(2) + 'px)';
    card.insertBefore(ply, day);
  }
  var slot = root.querySelector('.ctl-slot'), pullBtn = SC.pullButton('r5-card'), flipBtn = SC.flipButton('r5-card');
  slot.appendChild(pullBtn); slot.appendChild(flipBtn);
  var flipIco = flipBtn.querySelector('.flip-ico');
  root.querySelector('.soc-slot').appendChild(SC.socialRow('r5a'));

  /* ---- marks: coral 「 」 on focus (sliver, card, sleeve) and at the mouth while a carried card nears it ---- */
  var gripFocus = SC.Focus(rig, 'r5-grip', { gap: 4, arm: 12 }), cardFocus = SC.Focus(rig, 'r5-card', { gap: 10, arm: 22 }),
    mouthMark = SC.Focus(rig, 'r5-mouth', { gap: 0, arm: 16, z: 9 }), mouthOn = false;
  SC.focusMark(hit, 'r5-hit', { gap: 6, arm: 16 });
  var putPen = Pen.annotate(putT.querySelector('.put-t'), 'underline', { manual: true, width: 2.2, seed: 'r5-put', gap: 4 });
  hit.addEventListener('pointerenter', function () { if (st === 'free') putPen.show(); });
  hit.addEventListener('pointerleave', putPen.hide);
  grip.addEventListener('focus', function () { if (grip.matches(':focus-visible') && st === 'tucked') gripFocus.show(); });
  grip.addEventListener('blur', gripFocus.hide);
  card.addEventListener('focus', function () { if (card.matches(':focus-visible') && st === 'free') cardFocus.show(); });
  card.addEventListener('blur', cardFocus.hide);
  function mouth(on) { if (on === mouthOn) return; mouthOn = on; if (on) mouthMark.show(); else mouthMark.hide(); }

  /* ---- the cue (r4): r3-02's arrow glyph, coral, the view's one point; retired for the session by the first pull ---- */
  var CUE_KEY = 'r4-07-pulled', cueSvg = cue.querySelector('.cue-arrow'), cueShaft = null, cueHead = null, cueOn = false, cueSeen = false;
  function buildCue() {
    var gl = ArrowFit.glyph([36, 0], 4, 34, 'r4-cue');
    cueSvg.innerHTML = '';
    cueShaft = Pen.path(gl.shaft, { color: 'var(--mark)', width: 2.2 }); cueHead = Pen.path(gl.head, { color: 'var(--mark)', width: 2.2 });
    cueSvg.appendChild(cueShaft); cueSvg.appendChild(cueHead);
    [cueShaft, cueHead].forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = cueOn && cueSeen ? 0 : Pen.hiddenAt(p, L); });
  }
  function seenKey(k) { try { return sessionStorage.getItem(k) === '1'; } catch (_) { return false; } }
  function setKey(k, v) { try { if (v) sessionStorage.setItem(k, '1'); else sessionStorage.removeItem(k); } catch (_) {} }
  function cueShow(on) {
    on = on && !seenKey(CUE_KEY);
    if (on === cueOn) return; cueOn = on; cue.classList.toggle('on', on);
    if (!cueSeen || !cueShaft) return;
    if (on) { Pen.draw(cueShaft, { delay: 120, duration: 240 }); Pen.draw(cueHead, { delay: 360, duration: 120 }); }
    else { Pen.erase(cueShaft, { duration: 130 }); Pen.erase(cueHead, { duration: 90 }); }
  }
  function cueArrive() { if (cueSeen) return; cueSeen = true; if (cueOn) { cueOn = false; cueShow(true); } }

  /* ---- the hand-note under the card's first lift: how to flip, how to put back; each line greys once it has been
     done, and the note retires for the session when both have ---- */
  var FLIP_KEY = 'r5-07-flipped', BACK_KEY = 'r5-07-putback';
  function noteSync(show) {
    var f = seenKey(FLIP_KEY), b = seenKey(BACK_KEY);
    note.querySelector('.hn-flip').classList.toggle('done', f); note.querySelector('.hn-back').classList.toggle('done', b);
    note.classList.toggle('on', !!show && !(f && b));
  }
  function used(k) { setKey(k, true); noteSync(note.classList.contains('on')); }

  /* ---- springs ---- */
  var SR0 = -1.2;
  var e = new SC.Spring(0, 120, 1),         // extraction along the pull (px, desk scale)
    L = new SC.Spring(0, 118, .72),         // 0 on the desk / in the sleeve → 1 in the hand
    sd = new SC.Spring(0, 420, .42), sr = new SC.Spring(SR0, 260, .4), bw = new SC.Spring(0, 900, .3),
    ox = new SC.Spring(0, 900, 1), oy = new SC.Spring(0, 900, 1),   // the carried card's offset from its place in the hand
    dk = new SC.Spring(0, 420, .86),        // docked: 0 carried in the hand … 1 taken by the sleeve, half into the mouth
    pr = new SC.Spring(0, 400, 1),          // how near the sleeve the carried card is (0 in the hand … 1 over the sleeve)
    th = new SC.Spring(0, 172, .73), rx = new SC.Spring(0, 170, .82), ry = new SC.Spring(0, 170, .82), hl = new SC.Spring(0, 260, .9);
  function setK(s, k, z) { s.k = k; s.c = 2 * z * Math.sqrt(k); }

  var st = 'tucked', face = 0, seen = 0, t0 = 0, G = {}, want = null, drag = null, caught = false, base = 0, lastH = -1, cSd = 0, cSr = SR0;
  var TILT_X = 5.5, TILT_Y = 8, STICK = 8, ZONE_R = .22, SNAP_PX = 30, AR = 12 / 7;
  var R0 = .72, FB = 1 - R0;
  // The release rule (round 5), tuned on real 125 Hz pointer paths. Velocities are over the last 80 ms before release.
  // A sleeve only catches a card that arrives: over it and slowed (catchV) or lingering (dwell). A flick is sideways
  // and fast after a short travel (flickD, per layout), or very fast at any length (flingV).
  // Lingering counts only time over the sleeve spent slower than catchV: a fling crossing it never accumulates any.
  var RULE = { tapMove: 6, tapMs: 450, flickV: 600, flickAxis: 1.2, flingV: 1400, catchV: 900, dwell: 100 }, zoneAcc = 0, lastMv = 0, eDock = 0;

  /* ---- geometry ---- */
  function l2r(lx, ly, d, a) {   // sleeve-local (origin: the mouth's centre, x toward the pull) → rig
    var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), dx = lx + G.ws / 2;
    return [G.sx + G.ws / 2 + dx * c - ly * s + d, G.sy + G.hs / 2 + dx * s + ly * c];
  }
  function eOf(f) { return R0 / FB * G.E * (Math.exp(FB * f / G.E) - 1); }
  function fOf(x) { return G.E / FB * Math.log(1 + FB * Math.max(0, x) / (R0 * G.E)); }
  function zoneDist(x, y) {   // 0 inside the sleeve zone, else the distance to it
    var Z = G.zone, dx = Math.max(Z.x0 - x, 0, x - Z.x1), dy = Math.max(Z.y0 - y, 0, y - Z.y1);
    return Math.hypot(dx, dy);
  }
  function measure(hdr) {
    var rw = rig.clientWidth, n = rw < 720, vh = window.innerHeight || 900;
    var above = rig.getBoundingClientRect().top - stage.getBoundingClientRect().top;
    var room = Math.max(n ? 600 : 620, vh - (bar ? bar.offsetHeight : 0) - above - 10);
    var s = n ? 20 : 26, g = 10, padT = 14, W, H;
    if (n) { W = Math.min(rw, 400); H = W * AR; }
    else { H = SC.clamp(room - padT - 14, 576, 740); W = H / AR; if (W > rw * .42) { W = rw * .42; H = W * AR; } }
    // On the desk the card lies upright; a desk-width screen can afford 0.6 (a longer sideways pull), a phone needs the
    // card, lying fully out of the mouth, to fit beside the sleeve.
    var k = n ? SC.clamp((rw - 6 + s - g) / 2 / W, .3, .56) : .6, kW = k * W, kH = k * H;
    var G1 = { rw: rw, n: n, room: room, W: W, H: H, k: k, s: s, kW: kW, kH: kH, ws: Math.round(kW - s + g), hs: Math.round(kH + 14), nr: n ? 14 : 18,
      SN: n ? 16 : 20, hdr: hdr, beta: n ? .25 : .1, dip: n ? .3 : .16 };
    G1.E = kW - s; G1.amp = 1 / (1 - G1.beta); G1.fs = G1.ws / 20.5; G1.gx = 24;
    if (!n) {   // the sleeve top left of centre; lifting brings the card toward you, to its right
      G1.sx = Math.round((rw - (G1.ws + G1.gx + W)) / 2); G1.sy = 38; G1.hx = G1.sx + G1.ws + G1.gx + W / 2; G1.hy = padT + H / 2;
      G1.hT = Math.round(G1.sy + G1.hs + 40); G1.hF = Math.round(padT + H + 14);
    } else {    // the sleeve top left; the card drawn out to its right, then brought into the centre below its header
      G1.sx = 4; G1.sy = 34; G1.hx = rw / 2;
      var top = Math.max(G1.sy + hdr + 30, Math.min(G1.sy + G1.hs + 10, room - H - 24));
      G1.hy = top + H / 2; G1.hT = Math.round(G1.sy + G1.hs + 26); G1.hF = Math.round(G1.hy + H / 2 + 30);
    }
    G1.M = G1.sx + G1.ws; G1.cy = G1.sy + G1.hs / 2;
    // The sleeve zone: where a carried card's centre counts as "over the sleeve". Beside the card (desktop) it reaches
    // 60px out from the mouth toward the card; above it (phone) the centre must be over the sleeve's body.
    G1.zone = n ? { x0: G1.sx - 30, x1: G1.M + 30, y0: G1.sy - 30, y1: G1.sy + G1.hs - 20 }
      : { x0: G1.sx - 40, x1: G1.M + 60, y0: G1.sy - 40, y1: G1.sy + G1.hs + 60 };
    G = G1; G1.zRest = Math.max(40, zoneDist(G1.hx, G1.hy));
    G1.flickD = n ? 170 : Math.min(200, G1.zRest - 10);   // a flick is short: it never travels as far as the sleeve
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
    grip.style.left = Math.round(G.M - G.nr - 10) + 'px'; grip.style.top = Math.round(G.cy - G.kH / 2 - 12) + 'px';
    grip.style.width = Math.round(G.nr + G.s + 26) + 'px'; grip.style.height = Math.round(G.kH + 24) + 'px';
    gripFocus.place({ x: G.M - G.nr - 8, y: G.cy - G.kH / 2 - 6, w: G.nr + G.s + 16, h: G.kH + 12 });
    cardFocus.place({ x: G.hx - G.W / 2, y: G.hy - G.H / 2, w: G.W, h: G.H });
    mouthMark.place({ x: G.M - 30, y: G.sy + G.hs * .14, w: 42, h: G.hs * .72 });
    cue.style.left = Math.round(G.M + G.s + 14) + 'px'; cue.style.top = Math.round(G.cy - 12) + 'px';
    // "put back" sits on the sleeve: by the mouth on a desk screen, under the header where the card covers the rest on a phone
    putT.style.cssText = G.n ? 'left:14px;top:' + (G.hdr - 4) + 'px' : 'right:' + (G.nr + 14) + 'px;top:' + Math.round(G.hs / 2 + G.nr + 18) + 'px';
    note.style.cssText = G.n ? 'left:' + Math.round(G.M + 12) + 'px;top:' + Math.round(G.sy + 2) + 'px;width:' + Math.round(G.rw - G.M - 16) + 'px'
      : 'left:' + Math.round(G.hx + G.W / 2 + 20) + 'px;top:' + Math.round(G.hy - G.H / 2 + 56) + 'px;width:' + Math.round(Math.min(210, G.rw - G.hx - G.W / 2 - 24)) + 'px';
    buildCue();
    rig.classList.toggle('stacked', G.n);
    if (st === 'free' || st === 'tucked') { e.snap(st === 'free' ? G.E : Math.min(e.to, 5)); L.snap(st === 'free' ? 1 : 0); }
    render();
  }

  /* ---- render ---- */
  function attached() { return st !== 'pop' && st !== 'lift' && st !== 'free' && st !== 'hold' && st !== 'settle'; }
  function pose() {
    var l = Math.max(0, L.x), lc = Math.min(1, l), a = attached(), d0 = a ? sd.x : cSd, r0 = a ? sr.x : cSr;
    var d = l2r(G.s + e.x - G.kW / 2, 0, d0, r0), hs_ = 1 - G.dip * SC.clamp(pr.x, 0, 1);
    var p = { cx: d[0] + (G.hx + ox.x - d[0]) * l, cy: d[1] + (G.hy + oy.x - d[1]) * l, sc: G.k + (hs_ - G.k) * l, rz: r0 * (1 - lc) };
    var k = SC.clamp(dk.x, 0, 1.1);
    if (k > 1e-3) {   // taken by the sleeve: the attached pose at eDock, riding the sleeve as it gives
      var q = l2r(G.s + eDock - G.kW / 2, 0, sd.x, sr.x);
      p = { cx: p.cx + (q[0] - p.cx) * k, cy: p.cy + (q[1] - p.cy) * k, sc: p.sc + (G.k - p.sc) * k, rz: p.rz + (sr.x - p.rz) * k };
    }
    return p;
  }
  function dockE(dx) { return SC.clamp(G.hx + dx - l2r(G.s - G.kW / 2, 0, 0, SR0)[0] - 40, G.E * .3, G.E * .72); }
  function render() {
    if (!G.W) return;
    var p = pose(), lc = SC.clamp(L.x, 0, 1), rest = st === 'free' && Math.abs(p.sc - 1) < 1e-3;
    var tx = p.cx - G.W / 2, ty = p.cy - G.H / 2;
    if (rest) { tx = Math.round(tx); ty = Math.round(ty); }
    pos.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) rotate(' + p.rz.toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
    pos.style.zIndex = L.x > .001 ? 6 : 2;
    // Caught: as the card comes down into the mouth, the part past the lip goes under it (then the front panel takes over).
    // Docked, the same: everything left of the lip is inside the sleeve, so it is clipped at the lip (the lip's bow included).
    var clip = 0, cutAt = (G.M + sd.x + bw.x * .8 - p.cx) / p.sc + G.W / 2;
    if (st === 'drop' && L.x < .45) { var t = SC.clamp((.45 - L.x) / .45, 0, 1); clip = Math.max(0, cutAt) * t * t * (3 - 2 * t); }
    else if (dk.x > .01) { var t3 = SC.clamp(dk.x, 0, 1); clip = Math.max(0, cutAt) * t3 * t3 * (3 - 2 * t3); }
    pos.style.clipPath = clip > .5 ? 'inset(-40px -40px -40px ' + clip.toFixed(1) + 'px)' : '';
    sleeve.pose(sd.x, sr.x); sleeve.bow(bw.x);
    var t2 = th.x, tv = t2 + ry.x, hh = hl.x;
    card.style.transform = 'translateZ(' + (hh * 10).toFixed(2) + 'px) rotateX(' + rx.x.toFixed(2) + 'deg) rotateY(' + tv.toFixed(2) + 'deg)';
    if (lc > 0) {
      var w = Math.min(1, Math.abs(Math.cos(tv * Math.PI / 180)) + Math.abs(Math.sin(t2 * Math.PI / 180)) * TH / G.W);
      var sx = -ry.x * 1.8 * (1 + hh * .7) * p.sc, sy = (10 + hh * 12 + rx.x * .8) * p.sc;
      shadow.style.transform = 'translate(' + (tx + sx).toFixed(1) + 'px,' + (ty + sy).toFixed(1) + 'px) rotate(' + p.rz.toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
      shadow.style.clipPath = 'inset(0 ' + (G.W * (1 - w) / 2).toFixed(1) + 'px round ' + (14 * G.H / 576).toFixed(1) + 'px)';
      shadow.style.opacity = (lc * (1 - hh * .4) * (1 - SC.clamp(dk.x, 0, 1))).toFixed(3);
    } else shadow.style.opacity = 0;
    fig.style.opacity = (lc * lc * (1 - Math.min(1, Math.abs(ox.x) / 40))).toFixed(3);
    var h = Math.round(G.hT + Math.max(0, G.hF - G.hT) * lc);
    if (h !== lastH) { lastH = h; rig.style.height = h + 'px'; }
    flipIco.style.transform = 'rotate(' + t2.toFixed(1) + 'deg)';
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
    else if (st === 'lift') { L.step(dt); e.step(dt); if (L.rest(.002)) { L.snap(1); arrive(); } }
    else if (st === 'return' || st === 'tucked') { e.step(dt); if (st === 'return' && e.rest(1)) { e.snap(0); st = 'tucked'; } }
    else if (st === 'hold') { ox.step(dt); oy.step(dt); pr.step(dt); dk.step(dt); }
    else if (st === 'settle') { ox.step(dt); oy.step(dt); pr.step(dt); dk.step(dt); if (ox.rest(.3) && oy.rest(.3) && pr.rest(.01) && dk.rest(.01)) { ox.snap(0); oy.snap(0); pr.snap(0); dk.snap(0); arrive(); } }
    else if (st === 'drop') { L.step(dt); pr.step(dt); if (L.x <= .004) { L.snap(0); ox.snap(0); oy.snap(0); pr.snap(0); mouth(false); slideIn(-40); } }
    else if (st === 'lower') { L.step(dt); ox.step(dt); oy.step(dt); pr.step(dt); if (L.x <= .004) { L.snap(0); slideIn(-60); } }
    else if (st === 'slidein') { e.step(dt); if (e.rest(1.2)) { e.snap(0); tucked(); } }
  }
  function catchLip() {
    st = 'catch'; t0 = performance.now();
    e.to = G.E - G.SN + 6; setK(e, 500, 1); sd.to = -G.beta * (G.E - G.SN) + 10; bw.to = 6; sleeve.startle(900);
  }
  function snap() {
    st = 'pop'; caught = false; t0 = performance.now(); cSd = sd.x; cSr = sr.x;
    e.to = G.E; setK(e, 520, .55); e.v = 520;
    sd.to = 0; sd.v = -300; sr.v -= 52; bw.to = 0; bw.v = -120;
    sleeve.impact(); sleeve.startle(760); setKey(CUE_KEY, true); cueShow(false); setHint(); loop.kick();
  }
  function lift() { st = 'lift'; L.to = 1; setK(L, 118, .72); L.v = 1.3; rx.v += 70; hl.v += 8; }
  function slideIn(v) { st = 'slidein'; e.to = 0; setK(e, 80, 1); e.v = v; sd.to = 0; bw.to = 0; bw.v -= 50; }
  function arrive() {
    st = 'free';
    pullBtn.hidden = true; flipBtn.hidden = false; grip.hidden = true; rig.classList.add('held');
    card.tabIndex = 0; hit.tabIndex = 0; hit.removeAttribute('aria-hidden');
    noteSync(true);
    focusWant(); setHint(); render();
  }
  function tucked() {
    st = 'tucked'; radar.reset(); rig.classList.remove('held'); mouth(false); noteSync(false);
    pullBtn.hidden = false; flipBtn.hidden = true; grip.hidden = false;
    card.tabIndex = -1; hit.tabIndex = -1; hit.setAttribute('aria-hidden', 'true'); cardFocus.hide(); putPen.hide();
    cueShow(true); focusWant(); setHint(); render();
  }
  function focusWant() {
    var el = { card: card, grip: grip, flip: flipBtn, pull: pullBtn }[want]; want = null;
    if (el) el.focus({ preventScroll: true });
  }
  function setHint() {
    hint.innerHTML = st === 'tucked' || st === 'pull' || st === 'stick' || st === 'slide'
      ? '<span class="hand-cn">往右拉，或点一下</span> · drag it out →, or just click'
      : '<span class="hand-cn">点击或轻拨翻面</span> · tap or flick to flip &nbsp; <span class="hand-cn">拖回套里</span> · drag onto the sleeve to put back';
  }

  var loop = SC.Loop(function (dt) {
    phase(dt);
    if (!drag || st === 'settle') th.step(dt);
    rx.step(dt); ry.step(dt); hl.step(dt); sd.step(dt); sr.step(dt); bw.step(dt);
    render();
    var calm = e.rest(.2) && sd.rest(.05) && sr.rest(.02) && bw.rest(.05) && th.rest(.05) && rx.rest(.02) && ry.rest(.02) && hl.rest(.002);
    var busy = !!drag || (st !== 'tucked' && st !== 'free') || !calm;
    if (!busy && Math.abs(th.to) >= 360) { th.snap(th.to % 360); render(); }
    return busy;
  });

  /* ---- A's faces ---- */
  function faceOf(a) { return ((Math.round(a / 180) % 2) + 2) % 2; }
  function setFace(n) {
    if (n === face) return;
    face = n; flipBtn.setState(n === 1);
    day.setAttribute('aria-hidden', n ? 'true' : 'false'); night.setAttribute('aria-hidden', n ? 'false' : 'true');
    card.setAttribute('aria-label', (n ? '标本卡，夜间形态。' : '标本卡，日间形态。') + '按回车或空格翻面，按 Esc 放回卡套。' +
      (n ? 'Specimen card, night form.' : 'Specimen card, day form.') + ' Enter or Space turns it over; Escape puts it back in the sleeve.');
  }

  /* ---- API: the pull (f = finger travel to the right) ---- */
  function pullStart() { if (st !== 'tucked') return false; st = 'pull'; gripFocus.hide(); base = e.x; caught = false; cueShow(false); loop.kick(); return true; }
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
    if (Pen.reduced()) { setKey(CUE_KEY, true); e.snap(G.E); L.snap(1); arrive(); return; }
    st = 'stick'; t0 = performance.now(); sd.to = 3; bw.to = 3; sleeve.startle(500); loop.kick();
  }
  function nudge(on) { if (st !== 'tucked' || Pen.reduced()) return; e.to = on ? 5 : 0; setK(e, 180, .8); loop.kick(); }

  /* ---- API: in the hand ---- */
  function tiltAt(x, y) {
    if (st !== 'free' || drag || Pen.reduced()) return;
    var r = rig.getBoundingClientRect(), u = (x - (r.left + G.hx - G.W / 2)) / G.W, v = (y - (r.top + G.hy - G.H / 2)) / G.H;
    if (u < -.04 || u > 1.04 || v < -.04 || v > 1.04) return tiltReset();
    rx.to = (.5 - SC.clamp(v, 0, 1)) * 2 * TILT_X; ry.to = (SC.clamp(u, 0, 1) - .5) * 2 * TILT_Y; loop.kick();
  }
  function tiltReset() { if (drag || st !== 'free') return; rx.to = 0; ry.to = 0; loop.kick(); }
  // Pointer down on the card: catching a spinning card stops it where it is; it rises a hair off the page.
  function grab() {
    if (st !== 'free' && st !== 'settle') return false;
    if (st === 'settle') { st = 'free'; ox.to = ox.x; oy.to = oy.x; }
    drag = { t0: performance.now() }; th.to = th.x; th.v = 0;
    if (!Pen.reduced()) hl.to = 1;
    loop.kick(); return true;
  }
  // The card follows the hand and leans into its speed; nearing the sleeve it dips toward the desk and the sleeve answers.
  function holdMove(dx, dy, vx, vy) {
    if (!drag) return;
    if (st === 'free') { st = 'hold'; cardFocus.hide(); note.classList.remove('on'); setK(ox, 900, 1); setK(oy, 900, 1); }   // the note steps aside while you carry
    ox.to = dx; oy.to = dy;
    if (Pen.reduced()) { ox.snap(dx); oy.snap(dy); }
    else { ry.to = SC.clamp(vx * .012, -14, 14); rx.to = SC.clamp(-vy * .004, -TILT_X, TILT_X); }
    var p = SC.clamp(1 - zoneDist(G.hx + dx, G.hy + dy) / G.zRest, 0, 1); pr.to = p;
    var inZ = p >= 1, now = performance.now(), sp = Math.hypot(vx, vy), slow = sp < RULE.catchV;
    zoneAcc = inZ ? zoneAcc + (slow && lastMv ? Math.min(50, now - lastMv) : 0) : 0; lastMv = now;
    mouth(p > .12); bw.to = p > .12 ? 2 + 5 * p + (inZ ? 3 : 0) : 0;
    // The sleeve takes a card that arrives (slow over it); once docked it holds on through small jerks.
    dk.to = inZ && (slow || (dk.to === 1 && sp < RULE.flingV)) ? 1 : 0;
    if (dk.to) { eDock = dockE(dx); ry.to = rx.to = 0; sd.to = 4; } else sd.to = 0;
    if (Pen.reduced()) dk.snap(dk.to);
    loop.kick();
  }
  // Release. The rule: over the sleeve → put back; a quick short flick → flip that way; anything else → back in the hand.
  function holdEnd(vx, vy, dist, cancelled) {
    var d = drag; drag = null; if (!d) return 'none';
    if (st !== 'hold') {   // it never moved: a tap flips it; a long press does nothing
      hl.to = 0; rx.to = 0;
      if (!cancelled && performance.now() - d.t0 < RULE.tapMs) { turn(1); return 'tap'; }
      loop.kick(); return 'none';
    }
    var over = zoneDist(G.hx + ox.to, G.hy + oy.to) === 0, sp = Math.hypot(vx, vy), dwell = zoneAcc; zoneAcc = 0; lastMv = 0;
    if (!cancelled && over && (sp < RULE.catchV || dwell >= RULE.dwell)) { drop(); return 'drop'; }
    var side = Math.abs(vx) >= RULE.flickV && Math.abs(vx) >= RULE.flickAxis * Math.abs(vy);
    var flick = !cancelled && side && (dist <= G.flickD || Math.abs(vx) >= RULE.flingV);
    settle(flick ? (vx > 0 ? 1 : -1) : 0, vx);
    return flick ? 'flick' : 'settle';
  }
  function settle(dir, vx) {
    st = 'settle'; ox.to = oy.to = 0; setK(ox, 170, .72); setK(oy, 170, .72); pr.to = 0; dk.to = 0; sd.to = 0; ry.to = rx.to = hl.to = 0; mouth(false); bw.to = 0;
    var target;
    if (dir) {
      // The next face that way: from (near) a face, the one beyond it; mid-turn, the next one the card reaches.
      var near = Math.round(th.x / 180) * 180;
      target = Math.abs(th.x - near) < 25 ? near + dir * 180 : (dir > 0 ? Math.ceil(th.x / 180) : Math.floor(th.x / 180)) * 180;
      var w = Math.abs(vx) * 180 / (G.W * .9), cap = Math.min(1000, Math.max(260, 1.3 * Math.sqrt(th.k) * Math.abs(target - th.x)));
      th.to = target; th.v = dir * SC.clamp(Math.max(w, 300), 0, cap); used(FLIP_KEY);
    } else th.to = target = Math.round(th.x / 180) * 180;
    setFace(faceOf(target));
    if (Pen.reduced()) { ox.snap(0); oy.snap(0); pr.snap(0); dk.snap(0); th.snap(th.to); ry.snap(0); rx.snap(0); hl.snap(0); arrive(); return; }
    loop.kick();
  }
  // Caught by the sleeve: set down into the mouth where it was dropped (partly in if it was dropped over the sleeve),
  // then slid the rest of the way in with friction.
  function drop() {
    used(BACK_KEY); noteSync(false);
    th.to = Math.round(th.x / 180) * 180; setFace(faceOf(th.to));
    if (!Pen.reduced() && dk.x > .5) {   // already taken by the sleeve: it simply continues in
      e.snap(eDock); L.snap(0); dk.snap(0); ox.snap(0); oy.snap(0); pr.snap(0); th.snap(th.to); ry.snap(0); rx.snap(0); hl.to = 0;
      mouth(false); slideIn(-90); loop.kick(); return;
    }
    var p = pose(), x0 = l2r(G.s - G.kW / 2, 0, 0, SR0)[0];
    e.snap(SC.clamp(p.cx - x0, 0, G.E));
    th.to = Math.round(th.x / 180) * 180; setFace(faceOf(th.to)); ry.to = rx.to = hl.to = 0;
    ox.to = ox.x; oy.to = oy.x; bw.to = 7;
    if (Pen.reduced()) { L.snap(0); e.snap(0); ox.snap(0); oy.snap(0); pr.snap(0); dk.snap(0); th.snap(th.to); ry.snap(0); rx.snap(0); hl.snap(0); tucked(); return; }
    st = 'drop'; L.to = 0; setK(L, 240, 1); dk.snap(0); loop.kick();
  }
  function holdCancel() { holdEnd(0, 0, 0, true); }
  function turn(dir) {
    if (st !== 'free' && st !== 'settle') return;
    var b = Math.round(th.to / 180) * 180, target = b + 180 * dir;
    th.to = target; setFace(faceOf(target)); used(FLIP_KEY);
    if (Pen.reduced()) { th.snap(th.to); rx.snap(0); ry.snap(0); hl.snap(0); render(); return; }
    th.v += dir * 150; hl.v += 5; loop.kick();
  }
  // Tap the sleeve, 放回, or Esc: set down by the mouth, then slid in.
  function tuck(focus) {
    if (st !== 'free' && st !== 'settle') return;
    want = focus || null; drag = null; rx.to = ry.to = hl.to = 0; cardFocus.hide(); used(BACK_KEY); noteSync(false); putPen.hide();
    th.to = Math.round(th.x / 180) * 180;
    if (Pen.reduced()) { L.snap(0); e.snap(0); ox.snap(0); oy.snap(0); pr.snap(0); th.snap(th.to); rx.snap(0); ry.snap(0); hl.snap(0); tucked(); return; }
    e.snap(G.E); ox.to = oy.to = 0; pr.to = 0; st = 'lower'; L.to = 0; setK(L, 170, 1); loop.kick();
  }

  /* ---- reset: replay and reduced motion (the card is simply presented, out of its sleeve) ---- */
  function reset(free) {
    drag = null; want = null; caught = false;
    [th, rx, ry, hl, sd, bw, ox, oy, pr, dk].forEach(function (s) { s.snap(0); }); sr.snap(SR0);
    setFace(0); radar.reset(); sleeve.clearTicks(); seen = 0; cSd = 0; cSr = SR0; mouth(false);
    if (free) { e.snap(G.E); L.snap(1); cueShow(false); arrive(); } else { e.snap(0); L.snap(0); tucked(); }
    render();
  }

  window.R5A = {
    root: root, rig: rig, card: card, pos: pos, grip: grip, front: sleeve.front, hit: hit, pullBtn: pullBtn, flipBtn: flipBtn, RULE: RULE,
    state: function () { return st; }, idle: function () { return !loop.running; }, geo: function () { return G; }, layout: layout, reset: reset, cueArrive: cueArrive,
    rearm: function () { [CUE_KEY, FLIP_KEY, BACK_KEY].forEach(function (k) { setKey(k, false); }); },
    pullStart: pullStart, pullTo: pullTo, pullEnd: pullEnd, autoPull: autoPull, nudge: nudge,
    tiltAt: tiltAt, tiltReset: tiltReset, grab: grab, holdMove: holdMove, holdEnd: holdEnd, holdCancel: holdCancel, turn: turn, tuck: tuck
  };
  layout(); tucked();
  var lastW = rig.clientWidth, lastVH = window.innerHeight;
  function relayout() { if (rig.clientWidth !== lastW || window.innerHeight !== lastVH) { lastW = rig.clientWidth; lastVH = window.innerHeight; layout(); } }
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(rig);
  window.addEventListener('resize', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  setHint();
})();
