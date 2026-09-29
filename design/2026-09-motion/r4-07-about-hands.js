/* r4-07 · hands: pointer, touch and keys → the rig (window.R4A). Copied from r3-07-about-hands.js; the pull and the
   put-back are now horizontal, so every gesture that touches the card is a sideways drag and every vertical swipe
   is left to the browser.
   In the sleeve — mouse / pen: drag RIGHT anywhere on the sleeve or the sliver to pull (a vertical or leftward
     drag does nothing); a click pulls it out for you. Touch: the sliver's grip zone is `touch-action: pan-y`, so a
     vertical swipe there still scrolls the page and only a sideways drag becomes the pull; the sleeve body always
     scrolls, and a tap on it pulls the card out for you.
   In the hand — a drag to the RIGHT throws the card over (A); a drag to the LEFT is toward the sleeve and puts it
     back (set down, then pushed in). Vertical: mouse tilts, touch scrolls. A tap flips; a tap on the sleeve puts it back.
   Keys: on the sliver Enter / Space / → pull; on the card Enter / Space / → turn it over, ← / Esc put it back. */
(function () {
  var R = window.R4A; if (!R) return;
  var rig = R.rig, card = R.card, pos = R.pos, grip = R.grip, front = R.front, hit = R.hit;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  grip.style.touchAction = 'pan-y';
  var g = null;

  function trim(h, now) { while (h.length > 2 && now - h[0][0] > 90) h.shift(); }
  function speed(h, now) {   // px/s along the gesture's axis at release
    var a = h[0], b = h[h.length - 1], span = (b[0] - a[0]) / 1000;
    return (span > .008 && now - b[0] < 80) ? (b[1] - a[1]) / span : 0;
  }
  function capture(ev) { try { rig.setPointerCapture(ev.pointerId); } catch (_) {} }
  function uncapture(id) { try { rig.releasePointerCapture(id); } catch (_) {} }

  rig.addEventListener('pointerdown', function (ev) {
    if (ev.button !== 0 || g) return;
    var st = R.state(), t = ev.target, now = performance.now();
    var base = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, t0: now, moved: false, hist: [[now, 0]], touch: ev.pointerType === 'touch' };
    if (st === 'tucked' && (grip.contains(t) || front.contains(t) || pos.contains(t))) {
      base.kind = base.touch && !grip.contains(t) ? 'tap-pull' : 'pull';
      g = base; if (g.kind === 'pull') capture(ev);
    } else if (st === 'free' && pos.contains(t)) {
      if (!R.grab()) return;
      base.kind = 'card'; base.mode = null; g = base; capture(ev);
    } else if (st === 'free' && front.contains(t)) {
      base.kind = 'tap-tuck'; g = base;
    }
  });

  rig.addEventListener('pointermove', function (ev) {
    if (!g) { if (fine && ev.pointerType === 'mouse') R.tiltAt(ev.clientX, ev.clientY); return; }
    if (ev.pointerId !== g.id) return;
    var dx = ev.clientX - g.x0, dy = ev.clientY - g.y0, now = performance.now();
    if (g.kind === 'pull') {
      if (!g.moved) {
        if (Math.hypot(dx, dy) < 5) return;
        if (Math.abs(dy) > Math.abs(dx) || dx < 0) { g.moved = true; g.kind = 'void'; return; }   // not a pull: let it be
        g.moved = true; if (!R.pullStart()) { g = null; return; }
      }
      g.hist.push([now, dx]); trim(g.hist, now);
      if (R.pullTo(dx)) { uncapture(g.id); g = null; }   // it came free: the gesture is over, the card is in your hand
      return;
    }
    if (g.kind !== 'card') { if (Math.hypot(dx, dy) > 8) g.moved = true; return; }
    if (!g.mode && Math.hypot(dx, dy) > 6) {
      g.moved = true;
      if (Math.abs(dx) >= Math.abs(dy)) g.mode = dx > 0 ? 'turn' : 'carry';
      else g.mode = 'hold';
      if (g.mode === 'carry') { R.letGo(); if (!R.carryStart()) g.mode = 'hold'; }
    }
    if (g.mode === 'turn') R.turnTo(dx, dy);
    else if (g.mode === 'carry') { g.hist.push([now, -dx]); trim(g.hist, now); R.carryTo(-dx); }
    else if (g.mode === 'hold') R.holdTilt(dy);
  });

  function end(ev, cancelled) {
    if (!g || ev.pointerId !== g.id) return;
    var d = g, now = performance.now(); g = null; uncapture(d.id);
    if (d.kind === 'pull') {
      if (d.moved) R.pullEnd(cancelled ? 0 : speed(d.hist, now));
      else if (!cancelled) R.autoPull(null);                       // a click on the sleeve: it pulls the card out for you
    } else if (d.kind === 'tap-pull') { if (!cancelled && !d.moved) R.autoPull(null); }
    else if (d.kind === 'tap-tuck') { if (!cancelled && !d.moved) R.tuck(null); }
    else if (d.kind === 'void') { /* a vertical or leftward drag on the sleeve: nothing to do */ }
    else if (d.mode === 'carry') R.carryEnd(cancelled ? 0 : speed(d.hist, now));
    else R.release(!!d.mode, cancelled, ev.clientX - d.x0);
  }
  rig.addEventListener('pointerup', function (ev) { end(ev, false); });
  rig.addEventListener('pointercancel', function (ev) { end(ev, true); });   // the browser took the swipe: it was a scroll
  rig.addEventListener('lostpointercapture', function (ev) { if (g && g.id === ev.pointerId && g.kind !== 'tap-pull' && g.kind !== 'tap-tuck') end(ev, true); });
  rig.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') R.tiltReset(); });

  // Fingertip on the sleeve: the card gives a little in it.
  [front, grip].forEach(function (el) {
    el.addEventListener('pointerenter', function (ev) { if (ev.pointerType === 'mouse') R.nudge(true); });
    el.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') R.nudge(false); });
  });

  // Keyboard activations arrive as clicks with detail 0; pointer taps were already handled on pointerup.
  grip.addEventListener('click', function (ev) { if (ev.detail === 0) R.autoPull('card'); });
  hit.addEventListener('click', function (ev) { if (ev.detail === 0) R.tuck('grip'); });
  grip.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowRight') { ev.preventDefault(); R.autoPull('card'); } });
  card.addEventListener('keydown', function (ev) {
    if (R.state() !== 'free') return;
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight') { ev.preventDefault(); R.turn(1); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'Escape') { ev.preventDefault(); R.tuck('grip'); }
  });
  R.pullBtn.addEventListener('click', function (ev) { R.autoPull(ev.detail === 0 ? 'flip' : null); });
  R.flipBtn.addEventListener('click', function () { R.turn(1); });

  // The cue is drawn once, when the sleeve first comes into view.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es, ob) { es.forEach(function (x) { if (x.isIntersecting) { ob.disconnect(); setTimeout(R.cueArrive, 300); } }); }, { threshold: .4 }).observe(front);
  } else R.cueArrive();

  // Orientation study: the sleeve on its side (the pick) or standing, mouth right. Chosen = the wheat band.
  var orBtns = [].slice.call(document.querySelectorAll('.or-b'));
  orBtns.forEach(function (b, i) {
    b._band = SC.Band(b.querySelector('.or-t'), 'r4-or-' + i);
    SC.focusMark(b, 'r4-or-f-' + i, { gap: 4, arm: 10 });
    if (b.getAttribute('aria-pressed') === 'true') b._band.set(true);
    b.addEventListener('click', function () {
      if (b.getAttribute('aria-pressed') === 'true') return;
      orBtns.forEach(function (o) { var on = o === b; o.setAttribute('aria-pressed', String(on)); o._band.set(on); });
      R.orient(b.dataset.or);
    });
  });

  document.addEventListener('mock:rm', function () { if (Pen.reduced()) R.reset(true); });
  // Replay: back in the sleeve (the cue re-armed for the demo), then pulled out for you so the catch and the turn can be watched.
  window.replayR4 = function () {
    R.rearmCue(); R.reset(Pen.reduced());
    if (!Pen.reduced()) setTimeout(function () { R.autoPull(null); }, 650);
  };
  if (Pen.reduced()) R.reset(true);
})();
