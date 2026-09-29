/* r5-07 · hands: pointer, touch and keys → the rig (window.R5A). Copied from r4-07-about-hands.js; the pull is the same,
   the hand is new. Nothing here decides between flip and put back — it only measures the gesture (displacement,
   the velocity over its last 80 ms, the time since pointer-down) and hands it to R5A.holdEnd(), which applies the rule.
   In the sleeve — mouse / pen: drag RIGHT on the sleeve or the sliver to pull; a click pulls it out for you. Touch:
     the sliver's grip is `touch-action: pan-y`, so vertical swipes scroll and a sideways drag pulls; a tap pulls.
   In the hand — any drag carries the card (mouse: any direction; touch: a drag that starts sideways, since the card is
     `pan-y` too and vertical swipes belong to the page). A tap flips it. Tap the sleeve or its 放回 label to put it back.
   Keys: on the sliver Enter / Space / → pull; on the card Enter / Space / → turn it over (← turns it the other way),
     Esc puts it back; the sleeve's 放回 is a button in the tab order. */
(function () {
  var R = window.R5A; if (!R) return;
  var rig = R.rig, card = R.card, pos = R.pos, grip = R.grip, front = R.front, hit = R.hit;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  grip.style.touchAction = 'pan-y';
  var g = null;

  function trim(h, now) { while (h.length > 2 && now - h[0][0] > 80) h.shift(); }
  function vel(h, now) {   // px/s over the last 80 ms; zero if the pointer had stopped before letting go
    var a = h[0], b = h[h.length - 1], span = (b[0] - a[0]) / 1000;
    return (span > .008 && now - b[0] < 80) ? [(b[1] - a[1]) / span, (b[2] - a[2]) / span] : [0, 0];
  }
  function capture(ev) { try { rig.setPointerCapture(ev.pointerId); } catch (_) {} }
  function uncapture(id) { try { rig.releasePointerCapture(id); } catch (_) {} }

  rig.addEventListener('pointerdown', function (ev) {
    if (ev.button !== 0 || g) return;
    var st = R.state(), t = ev.target, now = performance.now();
    var base = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, t0: now, moved: false, hist: [[now, 0, 0]], touch: ev.pointerType === 'touch' };
    if (st === 'tucked' && (grip.contains(t) || front.contains(t) || pos.contains(t))) {
      base.kind = base.touch && !grip.contains(t) ? 'tap-pull' : 'pull';
      g = base; if (g.kind === 'pull') capture(ev);
    } else if ((st === 'free' || st === 'settle') && pos.contains(t)) {
      if (!R.grab()) return;
      base.kind = 'card'; g = base; capture(ev);
    } else if ((st === 'free' || st === 'settle') && front.contains(t)) {
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
        if (Math.abs(dy) > Math.abs(dx) || dx < 0) { g.moved = true; g.kind = 'void'; return; }
        g.moved = true; if (!R.pullStart()) { g = null; return; }
      }
      g.hist.push([now, dx, 0]); trim(g.hist, now);
      if (R.pullTo(dx)) { uncapture(g.id); g = null; }
      return;
    }
    if (g.kind !== 'card') { if (Math.hypot(dx, dy) > 8) g.moved = true; return; }
    g.hist.push([now, dx, dy]); trim(g.hist, now);
    if (!g.moved && Math.hypot(dx, dy) < R.RULE.tapMove) return;
    g.moved = true;
    var v = vel(g.hist, now + 1);
    R.holdMove(dx, dy, v[0], v[1]);
  });

  function end(ev, cancelled) {
    if (!g || ev.pointerId !== g.id) return;
    var d = g, now = performance.now(); g = null; uncapture(d.id);
    if (d.kind === 'pull') {
      if (d.moved) R.pullEnd(cancelled ? 0 : vel(d.hist, now)[0]);
      else if (!cancelled) R.autoPull(null);
    } else if (d.kind === 'tap-pull') { if (!cancelled && !d.moved) R.autoPull(null); }
    else if (d.kind === 'tap-tuck') { if (!cancelled && !d.moved) R.tuck(null); }
    else if (d.kind === 'card') {
      var v = vel(d.hist, now), last = d.hist[d.hist.length - 1];
      var out = R.holdEnd(v[0], v[1], Math.hypot(last[1], last[2]), cancelled);
      rig.dataset.lastRelease = out + ' ' + Math.round(v[0]) + ',' + Math.round(v[1]) + ' ' + Math.round(Math.hypot(last[1], last[2]));   // for the board's tests
    }
  }
  rig.addEventListener('pointerup', function (ev) { end(ev, false); });
  rig.addEventListener('pointercancel', function (ev) { end(ev, true); });   // the browser took the swipe: it was a scroll
  rig.addEventListener('lostpointercapture', function (ev) { if (g && g.id === ev.pointerId && g.kind !== 'tap-pull' && g.kind !== 'tap-tuck') end(ev, true); });
  rig.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') R.tiltReset(); });

  [front, grip].forEach(function (el) {
    el.addEventListener('pointerenter', function (ev) { if (ev.pointerType === 'mouse') R.nudge(true); });
    el.addEventListener('pointerleave', function (ev) { if (ev.pointerType === 'mouse') R.nudge(false); });
  });

  grip.addEventListener('click', function (ev) { if (ev.detail === 0) R.autoPull('card'); });
  hit.addEventListener('click', function (ev) { if (ev.detail === 0) R.tuck('grip'); });
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

  document.addEventListener('mock:rm', function () { if (Pen.reduced()) R.reset(true); });
  // Replay: the cue and the hand-note re-armed for the demo, back in the sleeve, then pulled out for you.
  window.replayR5 = function () {
    R.rearm(); R.reset(Pen.reduced());
    if (!Pen.reduced()) setTimeout(function () { R.autoPull(null); }, 650);
  };
  // The rule under the stage quotes the numbers the rig actually uses at this screen size.
  function ruleText() {
    var G = R.geo(), Z = G.zone, set = function (k, v) { [].forEach.call(document.querySelectorAll('[data-rule="' + k + '"]'), function (el) { el.textContent = v; }); };
    set('zr', Math.round(Z.x1 - G.M)); set('v', R.RULE.flickV); set('axis', R.RULE.flickAxis); set('d', Math.round(G.flickD)); set('tap', R.RULE.tapMove); set('ms', R.RULE.tapMs); set('cv', R.RULE.catchV); set('dw', R.RULE.dwell); set('fv', R.RULE.flingV);
  }
  ruleText(); window.addEventListener('resize', ruleText);
  if (Pen.reduced()) R.reset(true);
})();
