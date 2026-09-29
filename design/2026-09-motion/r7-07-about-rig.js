/* r7-07 · the rig, copied from r6-07-about-rig.js. The pull and the release rule's two outcomes are r6's; what round 7
   changes is where the card goes, per Fred: "The card got moved away from the original position *and* flipped, can we
   eliminate that unnecessary movement?"
   · The card never leaves its place during a drag unless it is going into the sleeve. A drag turns it IN PLACE — a
     rotateY about its own centre, r6's preview curve (10° at once, up to 40° after ~⅓ card width) toward the drag's
     net sideways direction — and a release completes that flip where it is, one overshoot, no trip.
   · The put-back target is the POINTER, not the card: when the pointer enters the sleeve zone (the sleeve and a margin
     past its mouth), the sleeve takes the card half in — the card's only travel, a quick glide to the mouth; the turn
     relaxes to 0. Pointer out of the zone: the card glides back to its place and the turn resumes. Release with the
     pointer in the zone → it slides fully in; anywhere else → it flips in place. A tap flips; a cancel does nothing.
   · Before the pointer gets there the sleeve shows it is the target without the card moving: its lip bows toward the
     pointer, in proportion to how near it is (ink; the coral 「 」 only once the pointer is in).
   r7-07-about-hands.js only measures pointer, touch and keys. */
(function () {
  var root = document.getElementById('cand-a'); if (!root) return;
  var stage = root.querySelector('.stage'), rig = root.querySelector('.rig'), pos = rig.querySelector('.card-pos'), card = pos.querySelector('.a-card'),
    day = card.querySelector('.a-day'), night = card.querySelector('.a-night'), shadow = rig.querySelector('.a-shadow'),
    fig = pos.querySelector('.sc-fig'), grip = rig.querySelector('.grip'), cue = rig.querySelector('.cue'), note = rig.querySelector('.hold-note'),
    hint = root.querySelector('.hs-hint'), bar = document.querySelector('.mock-top');
  day.innerHTML = SC.dayFace();
  night.innerHTML = SC.nightFace('r7-rd');
  var radar = SC.Radar(night.querySelector('.sc-radar'));
  var sleeve = Sleeve(rig);

  var TH = 12, PLIES = 9;   // A's stock: 9 flat plies across 12px; the middle ply is the glue line
  for (var i = 0; i < PLIES; i++) {
    var ply = document.createElement('div'), z = -TH / 2 + .6 + i * (TH - 1.2) / (PLIES - 1);
    ply.className = 'a-edge' + (i === 4 ? ' core' : (i === 0 || i === PLIES - 1 ? ' outer' : ''));
    ply.setAttribute('aria-hidden', 'true'); ply.style.transform = 'translateZ(' + z.toFixed(2) + 'px)';
    card.insertBefore(ply, day);
  }
  var slot = root.querySelector('.ctl-slot'), pullBtn = SC.pullButton('r7-card'), flipBtn = SC.flipButton('r7-card');
  // Put back, for the keyboard: a real button after FLIP that is shown only while it has keyboard focus.
  var putBtn = document.createElement('button');
  putBtn.type = 'button'; putBtn.className = 'flip put-k'; putBtn.setAttribute('aria-controls', 'r7-card');
  putBtn.setAttribute('aria-label', '把标本卡放回卡套。Put the specimen card back in its sleeve.');
  putBtn.innerHTML = '<svg class="flip-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.2 5.2c-.3 4.5-.3 9.1 0 13.6 2.6.2 5.1.2 7.7 0"/><path d="M4.2 5.2c2.6-.2 5.1-.2 7.7 0"/><path d="M11.9 3.4c-.2 5.8-.2 11.4 0 17.2"/><path d="M20 12c-3.9-.1-7.8-.1-11.6.1"/><path d="M11.3 8.9l-3 3 3.1 3.2"/></svg>' +
    '<span class="flip-t"><span lang="zh">放回</span> / PUT BACK</span>';
  slot.appendChild(pullBtn); slot.appendChild(flipBtn); slot.appendChild(putBtn);
  putBtn.style.position = 'relative'; SC.focusMark(putBtn, 'r7-put', { gap: 4, arm: 10 });   // after it is in the page, so the 「 」 measure it
  var flipIco = flipBtn.querySelector('.flip-ico');
  root.querySelector('.soc-slot').appendChild(SC.socialRow('r7a'));

  /* ---- marks: coral 「 」 on focus (sliver, card) and at the mouth while the pointer is in the sleeve zone ---- */
  var gripFocus = SC.Focus(rig, 'r6-grip', { gap: 4, arm: 12 }), cardFocus = SC.Focus(rig, 'r6-card', { gap: 10, arm: 22 }),
    mouthMark = SC.Focus(sleeve.front, 'r6-mouth', { gap: 0, arm: 16, z: 9 }), mouthOn = false;
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

  /* ---- the hand-note: each line greys once done; retired for the session when both have been ---- */
  var FLIP_KEY = 'r7-07-flipped', BACK_KEY = 'r7-07-putback';
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
    as = new SC.Spring(0, 110, .82),        // the sleeve set aside (narrow stages only): 0 on its desk spot → 1 beside the card
    pr = new SC.Spring(0, 400, 1),          // how near the pointer is to the sleeve zone (0 … 1 at its edge): the lip answers
    dk = new SC.Spring(0, 420, .86),        // docked: 0 in the hand … 1 taken by the sleeve, half into the mouth
    th = new SC.Spring(0, 172, .73), rx = new SC.Spring(0, 170, .82), ry = new SC.Spring(0, 170, .82), hl = new SC.Spring(0, 260, .9);
  function setK(s, k, z) { s.k = k; s.c = 2 * z * Math.sqrt(k); }

  var st = 'tucked', face = 0, seen = 0, t0 = 0, G = {}, want = null, drag = null, caught = false, base = 0, lastH = -1, cSd = 0, cSr = SR0, eDock = 0;
  var TILT_X = 5.5, TILT_Y = 8, STICK = 8, ZONE_R = .22, SNAP_PX = 30, AR = 12 / 7;
  var R0 = .72, FB = 1 - R0;
  // The drag preview (r6's curve, now in place): the turn grows with sideways travel, PREV_MIN from the first move so every
  // drag outside the zone shows it will flip, PREV_MAX at PREV_AT card widths. Sideways when |dx| ≥ max(SIDE_PX, SIDE_K·|dy|).
  var RULE = { tapMove: 6, tapMs: 450, PREV_MIN: 10, PREV_MAX: 40, PREV_AT: .3, SIDE_PX: 12, SIDE_K: .35, DEFAULT_DIR: 1 };

  /* ---- geometry ---- */
  function aside() { var a = SC.clamp(as.x, -.2, 1.2); return [G.ax * a, G.ay * a]; }
  function l2r(lx, ly, d, a) {   // sleeve-local (origin: the mouth's centre, x toward the pull) → rig, following the sleeve aside
    var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), dx = lx + G.ws / 2, o = aside();
    return [G.sx + G.ws / 2 + dx * c - ly * s + d + o[0], G.sy + G.hs / 2 + dx * s + ly * c + o[1]];
  }
  function eOf(f) { return R0 / FB * G.E * (Math.exp(FB * f / G.E) - 1); }
  function fOf(x) { return G.E / FB * Math.log(1 + FB * Math.max(0, x) / (R0 * G.E)); }
  function zoneDist(x, y) { var Z = G.zone, dx = Math.max(Z.x0 - x, 0, x - Z.x1), dy = Math.max(Z.y0 - y, 0, y - Z.y1); return Math.hypot(dx, dy); }
  function measure(hdr) {
    var rw = rig.clientWidth, n = rw < 720, vh = window.innerHeight || 900;
    var above = rig.getBoundingClientRect().top - stage.getBoundingClientRect().top;
    var room = Math.max(n ? 600 : 620, vh - (bar ? bar.offsetHeight : 0) - above - 10);
    var s = n ? 20 : 26, g = 10, padT = 14, SW = 30, W, H;
    // Narrow: the card leaves a SW strip at the left for the sleeve set aside there. Wide: as tall as the screen allows.
    if (n) { W = Math.min(400, rw - SW - 6); H = W * AR; }
    else { H = SC.clamp(room - padT - 14, 576, 740); W = H / AR; if (W > rw * .42) { W = rw * .42; H = W * AR; } }
    var k = n ? SC.clamp((rw - 6 + s - g) / 2 / W, .3, .56) : .6, kW = k * W, kH = k * H;
    var G1 = { rw: rw, n: n, room: room, W: W, H: H, k: k, s: s, kW: kW, kH: kH, ws: Math.round(kW - s + g), hs: Math.round(kH + 14), nr: n ? 14 : 18,
      SN: n ? 16 : 20, hdr: hdr, beta: n ? .25 : .1, ax: 0, ay: 0 };
    G1.E = kW - s; G1.amp = 1 / (1 - G1.beta); G1.fs = G1.ws / 20.5; G1.gx = 24;
    if (!n) {   // the sleeve top left of centre; lifting brings the card toward you, to its right
      G1.sx = Math.round((rw - (G1.ws + G1.gx + W)) / 2); G1.sy = 38; G1.hx = G1.sx + G1.ws + G1.gx + W / 2; G1.hy = padT + H / 2;
      G1.hT = Math.round(G1.sy + G1.hs + 40); G1.hF = Math.round(padT + H + 14);
    } else {    // the sleeve top left; lifted, the card takes the page right of a SW strip, and the sleeve is set aside into it
      G1.sx = 4; G1.sy = 34; G1.hx = rw - 2 - W / 2; G1.hy = 10 + H / 2;
      G1.ax = SW - (G1.sx + G1.ws); G1.ay = G1.hy - (G1.sy + G1.hs / 2);
      G1.hT = Math.round(G1.sy + G1.hs + 26); G1.hF = Math.round(G1.hy + H / 2 + 86);
    }
    G1.M = G1.sx + G1.ws; G1.cy = G1.sy + G1.hs / 2;
    // The sleeve zone, for the POINTER: the sleeve where it lies while the card is held, plus a margin past its mouth that
    // stops short of the card (so a finger on the card is never already in it). Wide: beside the card, the sleeve and 12 px
    // of the 24 px gap. Narrow: the strip at the page edge and everything left of it (the page margin too — a captured
    // pointer is still ours there), as tall as the card: ≥ 44 px wide for a thumb. The lip starts answering at G.near.
    var M1 = G1.M + G1.ax, top = G1.sy + G1.ay, cardL = G1.hx - W / 2;
    G1.zone = n ? { x0: -80, x1: cardL - 2, y0: Math.min(top - 30, G1.hy - H / 2), y1: Math.max(top + G1.hs + 30, G1.hy + H / 2) }
      : { x0: M1 - G1.ws - 30, x1: Math.min(M1 + 12, cardL - 6), y0: top - 30, y1: top + G1.hs + 30 };
    G = G1; G1.zRest = Math.max(40, zoneDist(G1.hx, G1.hy)); G1.near = Math.max(60, G1.zRest * .55);
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
    mouthMark.place({ x: G.ws - 30, y: G.hs * .14, w: 42, h: G.hs * .72 });
    cue.style.left = Math.round(G.M + G.s + 14) + 'px'; cue.style.top = Math.round(G.cy - 12) + 'px';
    note.style.cssText = G.n ? 'left:' + Math.round(G.hx - G.W / 2) + 'px;top:' + Math.round(G.hy + G.H / 2 + 30) + 'px;width:' + Math.round(G.W) + 'px'
      : 'left:' + Math.round(G.hx + G.W / 2 + 20) + 'px;top:' + Math.round(G.hy - G.H / 2 + 56) + 'px;width:' + Math.round(Math.min(210, G.rw - G.hx - G.W / 2 - 24)) + 'px';
    buildCue();
    rig.classList.toggle('stacked', G.n);
    if (st === 'free' || st === 'tucked') { e.snap(st === 'free' ? G.E : Math.min(e.to, 5)); L.snap(st === 'free' ? 1 : 0); as.snap(st === 'free' ? 1 : 0); }
    render();
  }

  /* ---- render ---- */
  function attached() { return st !== 'pop' && st !== 'lift' && st !== 'free' && st !== 'hold' && st !== 'settle'; }
  function pose() {
    var l = Math.max(0, L.x), lc = Math.min(1, l), a = attached(), d0 = a ? sd.x : cSd, r0 = a ? sr.x : cSr;
    var d = l2r(G.s + e.x - G.kW / 2, 0, d0, r0);
    var p = { cx: d[0] + (G.hx - d[0]) * l, cy: d[1] + (G.hy - d[1]) * l, sc: G.k + (1 - G.k) * l, rz: r0 * (1 - lc) };
    var k = SC.clamp(dk.x, 0, 1.1);
    if (k > 1e-3) {   // taken by the sleeve: the attached pose at eDock, riding the sleeve as it gives
      var q = l2r(G.s + eDock - G.kW / 2, 0, sd.x, sr.x);
      p = { cx: p.cx + (q[0] - p.cx) * k, cy: p.cy + (q[1] - p.cy) * k, sc: p.sc + (G.k - p.sc) * k, rz: p.rz + (sr.x - p.rz) * k };
    }
    return p;
  }
  // How deep the sleeve takes it: just in at the zone's mouth side, deeper as the pointer goes further in.
  function dockE(px) { var Z = G.zone, f = SC.clamp((Z.x1 - px) / Math.max(40, Math.min(G.ws, Z.x1 - Z.x0)), 0, 1); return G.E * (.72 - .42 * f); }
  function render() {
    if (!G.W) return;
    var p = pose(), lc = SC.clamp(L.x, 0, 1), rest = st === 'free' && Math.abs(p.sc - 1) < 1e-3;
    var tx = p.cx - G.W / 2, ty = p.cy - G.H / 2;
    if (rest) { tx = Math.round(tx); ty = Math.round(ty); }
    pos.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) rotate(' + p.rz.toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
    pos.style.zIndex = L.x > .001 ? 6 : 2;
    // Going into the mouth (docked, or dropped), everything left of the lip is inside the sleeve: clipped at the lip.
    var o = aside(), clip = 0, cutAt = (G.M + o[0] + sd.x + bw.x * .8 - p.cx) / p.sc + G.W / 2;
    if (st === 'drop' && L.x < .45) { var t = SC.clamp((.45 - L.x) / .45, 0, 1); clip = Math.max(0, cutAt) * t * t * (3 - 2 * t); }
    else if (dk.x > .01) { var t3 = SC.clamp(dk.x, 0, 1); clip = Math.max(0, cutAt) * t3 * t3 * (3 - 2 * t3); }
    pos.style.clipPath = clip > .5 ? 'inset(-40px -40px -40px ' + clip.toFixed(1) + 'px)' : '';
    sleeve.pose(sd.x + o[0], sr.x, o[1]); sleeve.bow(bw.x);
    var t2 = th.x, tv = t2 + ry.x, hh = hl.x;
    card.style.transform = 'translateZ(' + (hh * 10).toFixed(2) + 'px) rotateX(' + rx.x.toFixed(2) + 'deg) rotateY(' + tv.toFixed(2) + 'deg)';
    if (lc > 0) {
      var w = Math.min(1, Math.abs(Math.cos(tv * Math.PI / 180)) + Math.abs(Math.sin(t2 * Math.PI / 180)) * TH / G.W);
      var sx = -ry.x * 1.8 * (1 + hh * .7) * p.sc, sy = (10 + hh * 12 + rx.x * .8) * p.sc;
      shadow.style.transform = 'translate(' + (tx + sx).toFixed(1) + 'px,' + (ty + sy).toFixed(1) + 'px) rotate(' + p.rz.toFixed(3) + 'deg) scale(' + p.sc.toFixed(4) + ')';
      shadow.style.clipPath = 'inset(0 ' + (G.W * (1 - w) / 2).toFixed(1) + 'px round ' + (14 * G.H / 576).toFixed(1) + 'px)';
      shadow.style.opacity = (lc * (1 - hh * .4) * (1 - SC.clamp(dk.x, 0, 1))).toFixed(3);
    } else shadow.style.opacity = 0;
    fig.style.opacity = (lc * lc * (1 - SC.clamp(dk.x, 0, 1))).toFixed(3);
    var h = Math.round(G.hT + Math.max(0, G.hF - G.hT) * Math.max(lc, SC.clamp(as.x, 0, 1)));
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
    else if (st === 'lift') { L.step(dt); e.step(dt); if (L.rest(.002) && as.rest(.004)) { L.snap(1); as.snap(as.to); arrive(); } }
    else if (st === 'return' || st === 'tucked') { e.step(dt); if (st === 'return' && e.rest(1)) { e.snap(0); st = 'tucked'; } }
    else if (st === 'hold') { pr.step(dt); dk.step(dt); }
    else if (st === 'settle') { pr.step(dt); dk.step(dt); if (pr.rest(.01) && dk.rest(.004)) { pr.snap(0); dk.snap(0); arrive(); } }
    else if (st === 'drop') { L.step(dt); pr.step(dt); if (L.x <= .004) { L.snap(0); pr.snap(0); mouth(false); slideIn(-40); } }
    else if (st === 'lower') { L.step(dt); pr.step(dt); if (L.x <= .004) { L.snap(0); slideIn(-60); } }
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
  // Lifted into the hand; on a narrow stage the other hand sets the sleeve aside at the same time, mouth toward the card.
  function lift() { st = 'lift'; L.to = 1; setK(L, 118, .72); L.v = 1.3; rx.v += 70; hl.v += 8; as.to = G.n ? 1 : 0; }
  function slideIn(v) { st = 'slidein'; e.to = 0; setK(e, 80, 1); e.v = v; sd.to = 0; bw.to = 0; bw.v -= 50; }
  function arrive() {
    st = 'free';
    pullBtn.hidden = true; flipBtn.hidden = false; putBtn.hidden = false; grip.hidden = true; rig.classList.add('held');
    card.tabIndex = 0;
    noteSync(true); focusWant(); setHint(); render();
  }
  // Back in: the sleeve (with the card) is put back on its desk spot.
  function tucked() {
    st = 'tucked'; radar.reset(); rig.classList.remove('held'); mouth(false); noteSync(false); as.to = 0;
    pullBtn.hidden = false; flipBtn.hidden = true; putBtn.hidden = true; grip.hidden = false;
    card.tabIndex = -1; cardFocus.hide();
    cueShow(true); focusWant(); setHint(); render(); loop.kick();
  }
  function focusWant() {
    var el = { card: card, grip: grip, flip: flipBtn, pull: pullBtn }[want]; want = null;
    if (el) el.focus({ preventScroll: true });
  }
  function setHint() {
    hint.innerHTML = st === 'tucked' || st === 'pull' || st === 'stick' || st === 'slide'
      ? '<span class="hand-cn">往右拉，或点一下</span> · drag it out →, or just click'
      : '<span class="hand-cn">点击或拖动翻面</span> · tap or drag to flip &nbsp; <span class="hand-cn">拖进卡套放回</span> · drag it into the sleeve to put back';
  }

  var loop = SC.Loop(function (dt) {
    phase(dt);
    th.step(dt); rx.step(dt); ry.step(dt); hl.step(dt); sd.step(dt); sr.step(dt); bw.step(dt); as.step(dt);
    render();
    var calm = e.rest(.2) && sd.rest(.05) && sr.rest(.02) && bw.rest(.05) && th.rest(.05) && rx.rest(.02) && ry.rest(.02) && hl.rest(.002) && as.rest(.003);
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

  /* ---- API: the pull (f = finger travel to the right) — unchanged from r5 ---- */
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
    if (Pen.reduced()) { setKey(CUE_KEY, true); e.snap(G.E); L.snap(1); as.snap(G.n ? 1 : 0); as.to = as.x; arrive(); return; }
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
  // Pointer down on the card: a spinning card is caught where it is; it rises a hair off the page (a lift, not a move).
  function grab() {
    if (st !== 'free' && st !== 'settle') return false;
    if (st === 'settle') st = 'free';
    th.to = th.x; th.v = 0;
    drag = { t0: performance.now(), base: Math.round(th.x / 180) * 180, dir: RULE.DEFAULT_DIR, inZ: false };
    if (!Pen.reduced()) hl.to = 1;
    loop.kick(); return true;
  }
  function dirOf(dx, dy) { return Math.abs(dx) >= Math.max(RULE.SIDE_PX, RULE.SIDE_K * Math.abs(dy)) ? (dx > 0 ? 1 : -1) : RULE.DEFAULT_DIR; }
  // dx, dy: the drag so far; px, py: the pointer, in the rig's coordinates. The card stays where it is and turns toward the
  // drag; the lip bows toward the nearing pointer; with the pointer in the zone the sleeve takes the card half in.
  function holdMove(dx, dy, px, py) {
    if (!drag) return;
    if (st === 'free') { st = 'hold'; cardFocus.hide(); note.classList.remove('on'); setK(th, 520, 1); ry.to = 0; }
    var zd = zoneDist(px, py), inZ = zd === 0, p = SC.clamp(1 - zd / G.near, 0, 1);
    drag.dir = dirOf(dx, dy); drag.inZ = inZ; pr.to = p;
    // (Reduced motion: no turn while dragging — the card stays flat; the dock still shows, as a change of place.)
    var ang = inZ || Pen.reduced() ? 0 : drag.dir * SC.clamp(Math.max(RULE.PREV_MIN, Math.abs(dx) / (RULE.PREV_AT * G.W) * RULE.PREV_MAX), 0, RULE.PREV_MAX);
    th.to = drag.base + ang; rx.to = inZ ? 0 : SC.clamp(-dy * .02, -TILT_X, TILT_X);
    bw.to = inZ ? 10 : p * 8; mouth(inZ);   // the early cue: the lip bows toward the nearing pointer (ink), up to 8 px at the zone's edge
    dk.to = inZ ? 1 : 0;
    if (inZ) { eDock = dockE(px); sd.to = 4; } else sd.to = 0;
    if (Pen.reduced()) { dk.snap(dk.to); th.snap(th.to); }
    loop.kick();
  }
  // Release. Pointer in the zone → back in. Anywhere else → flip where it is. A tap flips. A cancelled gesture settles.
  function holdEnd(cancelled) {
    var d = drag; drag = null; if (!d) return 'none';
    setK(th, 172, .73);
    if (st !== 'hold') {   // it never moved
      hl.to = 0; rx.to = 0;
      if (!cancelled && performance.now() - d.t0 < RULE.tapMs) { turn(1); return 'tap'; }
      loop.kick(); return 'none';
    }
    if (cancelled) { home(); th.to = d.base; setFace(faceOf(d.base)); loop.kick(); return 'cancel'; }
    if (d.inZ) { drop(d); return 'drop'; }
    home();
    var target = d.base + d.dir * 180;
    th.to = target; th.v += d.dir * 120; setFace(faceOf(target)); used(FLIP_KEY);
    if (Pen.reduced()) { th.snap(target); pr.snap(0); dk.snap(0); rx.snap(0); hl.snap(0); arrive(); }
    loop.kick(); return 'flip';
  }
  // The sleeve lets go (if it had the card), the lip relaxes; the card is where it always was.
  function home() { st = 'settle'; pr.to = 0; dk.to = 0; sd.to = 0; rx.to = ry.to = hl.to = 0; mouth(false); bw.to = 0; }
  function drop(d) {
    used(BACK_KEY); noteSync(false);
    th.to = d.base; setFace(faceOf(d.base));
    if (!Pen.reduced() && dk.x > .5) {   // already taken by the sleeve: it simply continues in
      e.snap(eDock); L.snap(0); dk.snap(0); pr.snap(0); th.snap(d.base); ry.snap(0); rx.snap(0); hl.to = 0;
      mouth(false); slideIn(-90); loop.kick(); return;
    }
    // Released the moment the pointer got there: the card goes from its place into the mouth in one move.
    e.snap(G.E * .72); ry.to = rx.to = hl.to = 0; bw.to = 7;
    if (Pen.reduced()) { L.snap(0); e.snap(0); pr.snap(0); dk.snap(0); th.snap(d.base); ry.snap(0); rx.snap(0); hl.snap(0); tucked(); as.snap(0); return; }
    st = 'drop'; L.to = 0; setK(L, 240, 1); dk.snap(0); loop.kick();
  }
  function holdCancel() { holdEnd(true); }
  function turn(dir) {
    if (st !== 'free' && st !== 'settle') return;
    var b = Math.round(th.to / 180) * 180, target = b + 180 * dir;
    th.to = target; setFace(faceOf(target)); used(FLIP_KEY);
    if (Pen.reduced()) { th.snap(th.to); rx.snap(0); ry.snap(0); hl.snap(0); render(); return; }
    th.v += dir * 150; hl.v += 5; loop.kick();
  }
  // Esc or the keyboard's 放回: set down by the mouth, then slid in.
  function tuck(focus) {
    if (st !== 'free' && st !== 'settle') return;
    want = focus || null; drag = null; rx.to = ry.to = hl.to = 0; cardFocus.hide(); used(BACK_KEY); noteSync(false);
    th.to = Math.round(th.x / 180) * 180;
    if (Pen.reduced()) { L.snap(0); e.snap(0); pr.snap(0); th.snap(th.to); rx.snap(0); ry.snap(0); hl.snap(0); tucked(); as.snap(0); return; }
    e.snap(G.E); pr.to = 0; st = 'lower'; L.to = 0; setK(L, 170, 1); loop.kick();
  }

  /* ---- reset: replay and reduced motion (the card is simply presented, out of its sleeve) ---- */
  function reset(free) {
    drag = null; want = null; caught = false;
    [th, rx, ry, hl, sd, bw, pr, dk].forEach(function (s) { s.snap(0); }); sr.snap(SR0); setK(th, 172, .73);
    setFace(0); radar.reset(); sleeve.clearTicks(); seen = 0; cSd = 0; cSr = SR0; mouth(false);
    if (free) { e.snap(G.E); L.snap(1); as.snap(G.n ? 1 : 0); cueShow(false); arrive(); } else { e.snap(0); L.snap(0); as.snap(0); tucked(); }
    render();
  }

  window.R7A = {
    root: root, rig: rig, card: card, pos: pos, grip: grip, front: sleeve.front, pullBtn: pullBtn, flipBtn: flipBtn, putBtn: putBtn, RULE: RULE,
    state: function () { return st; }, angle: function () { return th.to; }, idle: function () { return !loop.running; }, geo: function () { return G; }, layout: layout, reset: reset, cueArrive: cueArrive,
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
