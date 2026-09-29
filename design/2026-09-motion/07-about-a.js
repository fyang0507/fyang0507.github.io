/* 07 · A — Hold the card. A mounted specimen card with real thickness.
   Physics clock: pointer tilt (≤7°, no glare), grab-lift, drag-and-throw flip on a spring that picks the
   nearest face from angle + release velocity, a halftone contact shadow that answers the tilt and the turn.
   Hand's clock: the radar draws itself on arrival at night; the bird swaps pose when the card moves. */
(function () {
  var root = document.getElementById('cand-a'); if (!root) return;
  var hold = root.querySelector('.a-hold'), card = root.querySelector('.a-card'), day = root.querySelector('.a-day'),
    night = root.querySelector('.a-night'), shadow = root.querySelector('.a-shadow'), bird = root.querySelector('.a-bird');
  day.innerHTML = SC.dayFace();
  night.innerHTML = SC.nightFace('a-rd');
  var radar = SC.Radar(night.querySelector('.sc-radar'));

  // Stock: 9 plies across 12px between the faces (which sit at ±6px). The middle ply is the glue line.
  var T = 12, PLIES = 9;
  for (var i = 0; i < PLIES; i++) {
    var e = document.createElement('div'), z = -T / 2 + .6 + i * (T - 1.2) / (PLIES - 1);
    e.className = 'a-edge' + (i === 4 ? ' core' : (i === 0 || i === PLIES - 1 ? ' outer' : ''));
    e.setAttribute('aria-hidden', 'true');
    e.style.transform = 'translateZ(' + z.toFixed(2) + 'px)';
    card.insertBefore(e, day);
  }

  var flip = SC.flipButton('a-card');
  root.querySelector('.flip-slot').appendChild(flip);
  var flipIco = flip.querySelector('.flip-ico');
  root.querySelector('.soc-slot').appendChild(SC.socialRow('a'));

  var MAX_TILT = 7;
  var th = new SC.Spring(0, 150, .74),  // flip angle, degrees
    rx = new SC.Spring(0, 170, .82), ry = new SC.Spring(0, 170, .82),
    lift = new SC.Spring(0, 260, .9);   // 0 resting on the page → 1 held
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var drag = null, face = 0, seen = 0, W = card.offsetWidth || 520, birdTimer = 0;

  function faceOf(a) { return ((Math.round(a / 180) % 2) + 2) % 2; }
  function setFace(n) {
    if (n === face) return;
    face = n; flip.setState(n === 1);
    day.setAttribute('aria-hidden', n ? 'true' : 'false');
    night.setAttribute('aria-hidden', n ? 'false' : 'true');
    card.setAttribute('aria-label', n ? '标本卡，夜间形态。左右拖动或按回车翻面。Specimen card, night form. Drag sideways or press Enter to flip.'
      : '标本卡，日间形态。左右拖动或按回车翻面。Specimen card, day form. Drag sideways or press Enter to flip.');
  }
  // The bird on the corner holds a pose; when the card moves under it, it straightens up for a beat.
  function startle(hold) {
    if (Pen.reduced()) return;
    bird.classList.add('up'); clearTimeout(birdTimer);
    if (!hold) birdTimer = setTimeout(function () { bird.classList.remove('up'); }, 700);
  }

  function render() {
    var t = th.x, tv = t + ry.x, L = lift.x, s = Math.sin(t * Math.PI / 180);
    card.style.transform = 'translateZ(' + (L * 10).toFixed(2) + 'px) rotateX(' + rx.x.toFixed(2) + 'deg) rotateY(' + tv.toFixed(2) + 'deg)';
    // The shadow is the card's silhouette on the page: it narrows with the turn, slides opposite the tilt,
    // and drifts further and lighter when the card is lifted off the page.
    // Narrowed with an inset rather than scaleX, so the halftone dots stay round.
    var w = Math.min(1, Math.abs(Math.cos(tv * Math.PI / 180)) + Math.abs(s) * T / W), inset = (W * (1 - w) / 2).toFixed(1);
    var sx = -ry.x * 1.8 * (1 + L * .7), sy = 10 + L * 12 + rx.x * .8;
    shadow.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)';
    shadow.style.clipPath = 'inset(0 ' + inset + 'px round 16px)';
    shadow.style.opacity = (1 - L * .4).toFixed(2);
    flipIco.style.transform = 'rotate(' + t.toFixed(1) + 'deg)';
    // Which printed side is toward the viewer right now.
    var vis = Math.cos(tv * Math.PI / 180) >= 0 ? 0 : 1;
    if (vis !== seen) { seen = vis; if (vis === 0) radar.reset(); }
    // Arrival at night: the witness starts taking notes (once per arrival).
    if (face === 1 && vis === 1 && radar.state === 'empty' && Math.abs(th.x - th.to) < 18) radar.draw();
  }

  var loop = SC.Loop(function (dt) {
    if (!drag) th.step(dt);
    rx.step(dt); ry.step(dt); lift.step(dt);
    render();
    var busy = !!drag || !(th.rest(.05) && rx.rest(.02) && ry.rest(.02) && lift.rest(.002));
    if (!busy && Math.abs(th.to) >= 360) { th.snap(th.to % 360); render(); }  // keep the angle bounded
    return busy;
  });

  function settleNow() { th.snap(th.to); rx.snap(0); ry.snap(0); lift.snap(0); render(); }

  function turn(dir) {
    var base = Math.round(th.to / 180) * 180, target = base + 180 * dir;
    th.to = target; setFace(faceOf(target)); startle();
    if (Pen.reduced()) return settleNow();
    th.v += dir * 140;   // leaves with intent
    lift.v += 5;         // a flick lifts it a little off the page
    loop.kick();
  }

  /* ---- tilt: the side you press on dips away. No light, so no glare. ---- */
  hold.addEventListener('pointermove', function (e) {
    if (drag || !fine || e.pointerType !== 'mouse' || Pen.reduced()) return;
    var r = hold.getBoundingClientRect(),
      x = SC.clamp((e.clientX - r.left) / r.width, 0, 1), y = SC.clamp((e.clientY - r.top) / r.height, 0, 1);
    rx.to = (.5 - y) * 2 * MAX_TILT; ry.to = (x - .5) * 2 * MAX_TILT;
    loop.kick();
  });
  hold.addEventListener('pointerleave', function () { if (drag) return; rx.to = 0; ry.to = 0; loop.kick(); });

  /* ---- grab, drag, throw ---- */
  card.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    W = card.offsetWidth || W;
    var now = performance.now();
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, th0: th.x, base: Math.round(th.to / 180) * 180, t0: now, moved: false, hist: [[now, th.x]] };
    try { card.setPointerCapture(e.pointerId); } catch (_) {}
    th.to = th.x; th.v = 0;            // catching it stops it where it is
    if (!Pen.reduced()) { lift.to = 1; startle(true); }
    loop.kick();
  });
  card.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.abs(dx) > 6) drag.moved = true;
    if (!drag.moved || Pen.reduced()) return;
    var a = drag.th0 + dx * 180 / (W * .9), lo = drag.base - 180, hi = drag.base + 180;
    if (a > hi) a = hi + (a - hi) * .2; else if (a < lo) a = lo + (a - lo) * .2;   // one face each way, then resistance
    th.x = th.to = a; th.v = 0;
    rx.to = SC.clamp(-dy * .05, -MAX_TILT, MAX_TILT); ry.to = 0;
    var now = performance.now(); drag.hist.push([now, a]);
    while (drag.hist.length > 2 && now - drag.hist[0][0] > 90) drag.hist.shift();
    loop.kick();
  });
  function release(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag, now = performance.now(); drag = null; lift.to = 0; rx.to = 0;
    try { card.releasePointerCapture(e.pointerId); } catch (_) {}
    if (!d.moved) { if (!cancelled && now - d.t0 < 450) turn(1); else { startle(); loop.kick(); } return; }
    if (Pen.reduced()) { if (Math.abs(e.clientX - d.x0) > 40) turn(e.clientX > d.x0 ? 1 : -1); return; }
    var h = d.hist, a = h[0], b = h[h.length - 1], span = (b[0] - a[0]) / 1000;
    var w = (span > .008 && now - b[0] < 70) ? SC.clamp((b[1] - a[1]) / span, -2400, 2400) : 0;   // deg/s at release
    var target = Math.abs(w) > 420
      ? (w > 0 ? Math.floor(th.x / 180 + 1e-6) * 180 + 180 : Math.ceil(th.x / 180 - 1e-6) * 180 - 180)   // a throw goes to the next face
      : Math.round((th.x + w * .16) / 180) * 180;                                                      // a drop goes to the nearest
    target = SC.clamp(target, d.base - 180, d.base + 180);
    var cap = Math.min(1000, Math.max(200, 1.3 * Math.sqrt(th.k) * Math.abs(target - th.x)));   // a late hard throw still lands with one small overshoot
    th.to = target; th.v = SC.clamp(w, -cap, cap);
    setFace(faceOf(target));
    startle();
    loop.kick();
  }
  card.addEventListener('pointerup', function (e) { release(e, false); });
  card.addEventListener('pointercancel', function (e) { release(e, true); });
  card.addEventListener('lostpointercapture', function (e) { if (drag) release(e, true); });
  card.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
  });
  flip.addEventListener('click', function () { turn(1); });

  document.addEventListener('mock:rm', function () { if (Pen.reduced()) { settleNow(); if (face === 1) radar.show(); } });

  // Replay: back to the day face, then a flick to night so the throw + radar can be watched.
  window.replayA = function () {
    th.snap(0); rx.snap(0); ry.snap(0); lift.snap(0); setFace(0); radar.reset(); render();
    setTimeout(function () {
      th.to = 180; setFace(1); startle();
      if (Pen.reduced()) return settleNow();
      th.v = 760; lift.v = 6; loop.kick();
    }, 380);
  };
  render();
})();
