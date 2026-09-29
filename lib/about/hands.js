/* lib/about/hands.js — pointer, touch and keys → the rig (design/2026-09-motion/r7-07-about-hands.js:1–97).
   Nothing here decides between flip and put back: the rig's holdEnd() asks only whether the pointer is in the zone.
   In the sleeve — mouse / pen: drag RIGHT on the sleeve or the sliver to pull; a click pulls it out for you. Touch:
     the sliver's grip is `touch-action: pan-y`, so vertical swipes scroll and a sideways drag pulls; a tap pulls.
   In the hand — a drag turns the card in place (mouse: any direction; touch: a drag that starts sideways, since the
     card is `pan-y` too and vertical swipes belong to the page). A tap flips it. A tap on the sleeve does nothing.
   Keys: on the sliver Enter / Space / → pull; on the card Enter / Space / → turn it over (← the other way), Esc puts it
     back; a 放回 / PUT BACK button after FLIP appears while it has keyboard focus. */
export function Hands(R, root) {
  var rig = R.rig, card = R.card, pos = R.pos, grip = R.grip, front = R.front;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  grip.style.touchAction = 'pan-y';
  var g = null;

  function capture(ev) { try { rig.setPointerCapture(ev.pointerId); } catch (_) {} }
  function uncapture(id) { try { rig.releasePointerCapture(id); } catch (_) {} }

  rig.addEventListener('pointerdown', function (ev) {
    if (ev.button !== 0 || g) return;
    var st = R.state(), t = ev.target, now = performance.now();
    var base = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, t0: now, moved: false, vel: new Motion.Velocity(80).add(now, 0, 0), touch: ev.pointerType === 'touch' };
    if (st === 'tucked' && (grip.contains(t) || front.contains(t) || pos.contains(t))) {
      base.kind = base.touch && !grip.contains(t) ? 'tap-pull' : 'pull';
      g = base; if (g.kind === 'pull') capture(ev);
    } else if ((st === 'free' || st === 'settle') && pos.contains(t)) {
      if (!R.grab()) return;
      base.kind = 'card'; base.a0 = R.angle(); g = base; capture(ev);
    }
  });

  rig.addEventListener('pointermove', function (ev) {
    if (!g) { if (fine && ev.pointerType === 'mouse') R.tiltAt(ev.clientX, ev.clientY); return; }
    if (ev.pointerId !== g.id) return;
    var dx = ev.clientX - g.x0, dy = ev.clientY - g.y0, now = performance.now();
    if (g.kind === 'pull') {
      if (!g.moved) {
        if (Math.hypot(dx, dy) < 5) return;
        if (Math.abs(dy) > Math.abs(dx) || dx < 0) { g.moved = true; g.kind = 'void'; return; }
        g.moved = true; if (!R.pullStart()) { g = null; return; }
      }
      g.vel.add(now, dx, 0);
      if (R.pullTo(dx)) { uncapture(g.id); g = null; }
      return;
    }
    if (g.kind !== 'card') { if (Math.hypot(dx, dy) > 8) g.moved = true; return; }
    if (!g.moved && Math.hypot(dx, dy) < R.RULE.tapMove) return;
    // A finger that starts vertical is scrolling the page (the card is pan-y): let go of the card at once, no preview.
    if (!g.moved && g.touch && Math.abs(dy) > Math.abs(dx)) { g.kind = 'void'; R.holdCancel(); return; }
    g.moved = true; g.dx = dx; g.dy = dy;
    var r = rig.getBoundingClientRect();
    R.holdMove(dx, dy, ev.clientX - r.left, ev.clientY - r.top);
  });

  function end(ev, cancelled) {
    if (!g || ev.pointerId !== g.id) return;
    var d = g, now = performance.now(); g = null; uncapture(d.id);
    if (d.kind === 'pull') {
      if (d.moved) R.pullEnd(cancelled ? 0 : d.vel.get(now)[0]);
      else if (!cancelled) R.autoPull(null);
    } else if (d.kind === 'tap-pull') { if (!cancelled && !d.moved) R.autoPull(null); }
    else if (d.kind === 'card') {
      var out = R.holdEnd(cancelled), turn = Math.round(R.angle() - Math.round(d.a0 / 180) * 180);
      root.dataset.release = out + ' ' + (turn > 0 ? '+' : '') + turn;   // the last release and its turn (scripts/verify/about-*.mjs)
    }
  }
  rig.addEventListener('pointerup', function (ev) { end(ev, false); });
  rig.addEventListener('pointercancel', function (ev) { end(ev, true); });   // the browser took the swipe: it was a scroll
  rig.addEventListener('lostpointercapture', function (ev) { if (g && g.id === ev.pointerId && g.kind !== 'tap-pull') end(ev, true); });
  rig.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') R.tiltReset(); });

  [front, grip].forEach(function (el) {
    el.addEventListener('pointerenter', function (ev) { if (ev.pointerType === 'mouse') R.nudge(true); });
    el.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') R.nudge(false); });
  });

  grip.addEventListener('click', function (ev) { if (ev.detail === 0) R.autoPull('card'); });
  R.putBtn.addEventListener('click', function () { R.tuck('grip'); });
  grip.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowRight') { ev.preventDefault(); R.autoPull('card'); } });
  card.addEventListener('keydown', function (ev) {
    var st = R.state(); if (st !== 'free' && st !== 'settle') return;
    if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight') { ev.preventDefault(); R.turn(1); }
    else if (ev.key === 'ArrowLeft') { ev.preventDefault(); R.turn(-1); }
    else if (ev.key === 'Escape') { ev.preventDefault(); R.tuck('grip'); }
  });
  R.pullBtn.addEventListener('click', function (ev) { R.autoPull(ev.detail === 0 ? 'flip' : null); });
  R.flipBtn.addEventListener('click', function () { R.turn(1); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es, ob) { es.forEach(function (x) { if (x.isIntersecting) { ob.disconnect(); setTimeout(R.cueArrive, 300); } }); }, { threshold: .4 }).observe(front);
  } else R.cueArrive();
}
