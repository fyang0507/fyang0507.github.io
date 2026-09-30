/* Building · the corkboard's one physics loop. One rAF, asleep at rest.
   Board: drag / swipe with momentum, soft edge resistance, horizontal wheel / trackpad, ←/→ card steps.
   Cards: each hangs from its pin as a damped pendulum driven by the board's motion:
     φ'' = −ω²(φ − φ₀) − 2ζω φ' + F,   F = (KD·V + KA·A) / L   (soft-limited)   — Motion.pendulum
   In the same loop:
     · impulses — angular kicks scheduled for a future time, so a ripple travels across the cork
       (a card's pin is jolted away from the source; its paper lags toward it);
     · bodies — anything else on the physics clock (the unpinned card in flight) registers a
       step(dt, now) and keeps the loop awake while it moves;
     · detach / attach — a card taken off its pin leaves the pendulum set and rejoins it with the
       angle and angular velocity it arrives with.
   opt.x: where the board starts (the card you came back from, brought into view at pagereveal: board.js). */
import { geometry } from './cards.js';

const G = 8600;          // px/s² — a 240px slip swings with a ~0.85s period, a 156px slip ~0.69s
const KD = 0.28, KA = 0.05;
const MAX_SWING = 0.15;  // rad (~8.6°): paper on a pin never flips, however hard the flick
const TAU = 0.33;        // s — momentum decay, like a heavy board on rails
const EDGE_K = 170;      // edge spring (critically damped: the board itself never bounces)
const D2R = Math.PI / 180;

export function Physics(cork, opt = {}) {
  const { root, viewport: vp, track } = cork;
  const btns = root.querySelectorAll('[data-step]');
  const reduced = () => Motion.reduced();
  const cards = cork.slots.map((s, i) => ({ i, s, slot: s.el, swing: s.swing, taped: s.kind === 'lead' || s.kind === 'featured', phi: 0, w: 0, rest: 0, target: 0,
    sc: 1, sv: 0, sTarget: 1, hover: false, focus: false, written: '', off: false, L: 150, omega: 7, zeta: .46, gain: 1, pinLeft: .5 }));
  let x = opt.x || 0, v = 0, max = 0, mode = 'idle', tween = null, chaseTarget = 0, wheelTimer = 0;
  let raf = 0, last = 0, visible = true, xPrev = 0, Vf = 0, VfPrev = 0, Af = 0;
  let drag = null, suppressUntil = 0;
  const kicks = [], bodies = [];

  function measure() {
    const cs = getComputedStyle(vp);
    max = Math.max(0, track.offsetWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) - vp.clientWidth);
    cards.forEach((c) => {
      const g = geometry(c.slot);
      c.rest = g.tilt * D2R; c.pinLeft = g.pinLeft;
      if (c.off) return;   // its paper is in the reader's hand; keep the last measurements
      c.L = Math.max(90, c.swing.offsetHeight * 0.66);
      c.s.ghost.style.setProperty('--ghost-h', c.swing.offsetHeight + 'px');
      c.omega = Math.sqrt(G / c.L) * (c.taped ? 2.1 : 1);
      c.zeta = c.taped ? 0.72 : 0.46;   // paper: one overshoot of ~10%, the next is invisible
      c.gain = c.taped ? 0.1 : 1;
      c.target = c.hover || c.focus ? c.rest * 0.3 : c.rest;
      if (!raf) { c.phi = c.target; c.w = 0; write(c); }
    });
    if (!raf) { x = clamp(x); render(); }
  }
  const clamp = (n) => Math.min(max, Math.max(0, n));
  function rubber(raw) {
    const D = vp.clientWidth * 0.45;
    if (raw < 0) return -D * (1 - 1 / (1 + -raw * 0.55 / D));
    if (raw > max) return max + D * (1 - 1 / (1 + (raw - max) * 0.55 / D));
    return raw;
  }
  function write(c) {
    if (c.off) return;
    const t = 'rotate(' + (c.phi / D2R).toFixed(3) + 'deg)' + (Math.abs(c.sc - 1) > 0.0002 ? ' scale(' + c.sc.toFixed(4) + ')' : '');
    if (t !== c.written) { c.swing.style.transform = t; c.written = t; }
  }
  let lastBtn = '';
  function render() {
    track.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)';
    const state = (x <= 1 ? 'a' : '') + (x >= max - 1 ? 'b' : '');
    if (state !== lastBtn) { lastBtn = state; btns.forEach((b) => { b.disabled = b.dataset.step < 0 ? x <= 1 : x >= max - 1; }); }
  }

  function wake() {
    if (reduced() && !bodies.length) { settleNow(); return; }
    if (!raf && (visible || bodies.length)) { last = performance.now(); xPrev = x; raf = requestAnimationFrame(frame); }
  }
  function settleNow() {
    if (mode !== 'drag' && mode !== 'wheel') { if (mode === 'tween') x = tween.x0 + tween.dx; x = clamp(x); v = 0; mode = 'idle'; }
    kicks.length = 0;
    cards.forEach((c) => { c.phi = c.target; c.w = 0; c.sc = reduced() ? 1 : c.sTarget; c.sv = 0; write(c); });
    Vf = VfPrev = Af = 0; render();
  }

  function frame(now) {
    raf = 0;
    const dt = Math.min(0.034, Math.max(0.001, (now - last) / 1000)); last = now;
    if (mode === 'tween') {
      const p = Math.min(1, (now - tween.t0) / tween.T), e = p * p * p * (10 - 15 * p + 6 * p * p);  // minimum-jerk
      x = tween.x0 + tween.dx * e;
      if (p >= 1) { mode = 'idle'; v = 0; }
    } else if (mode === 'chase') {
      const k = 520, a = k * (chaseTarget - x) - 2 * Math.sqrt(k) * v;
      v += a * dt; x += v * dt;
      if (Math.abs(chaseTarget - x) < 0.3 && Math.abs(v) < 6) { x = chaseTarget; v = 0; mode = (x < 0 || x > max) ? 'fling' : 'idle'; }
    } else if (mode === 'fling') {
      const edge = x < 0 ? 0 : x > max ? max : null;
      if (edge !== null) {
        const a2 = EDGE_K * (edge - x) - 2 * Math.sqrt(EDGE_K) * v;
        v += a2 * dt; x += v * dt;
        if (Math.abs(x - edge) < 0.3 && Math.abs(v) < 8) { x = edge; v = 0; mode = 'idle'; }
      } else {
        v *= Math.exp(-dt / TAU); x += v * dt;
        if (Math.abs(v) < 12) { v = 0; mode = 'idle'; }
      }
    }
    render();

    // Board motion on screen, lightly smoothed so pointer jitter doesn't become card jitter.
    const V = -(x - xPrev) / dt; xPrev = x;
    Vf += (V - Vf) * (1 - Math.exp(-dt / 0.035));
    const Araw = (Vf - VfPrev) / dt; VfPrev = Vf;
    Af += (Araw - Af) * (1 - Math.exp(-dt / 0.05));

    // Scheduled impulses land when their wave front reaches the card.
    for (let q = kicks.length - 1; q >= 0; q--) {
      if (now >= kicks[q].at) { if (!kicks[q].c.off) kicks[q].c.w += kicks[q].dw; kicks.splice(q, 1); }
    }

    let busy = mode !== 'idle' || Math.abs(Vf) > 1 || Math.abs(Af) > 15 || kicks.length > 0;
    cards.forEach((c) => {
      if (c.off) return;
      const w2 = c.omega * c.omega, Fmax = MAX_SWING * w2;
      let F = (KD * Vf + KA * Af) / c.L * c.gain;
      F = Fmax * Math.tanh(F / Fmax);
      const swinging = Motion.pendulum(c, dt, { omega: c.omega, zeta: c.zeta, F });
      const sk = 300, sa = sk * (c.sTarget - c.sc) - 2 * 0.62 * Math.sqrt(sk) * c.sv;
      c.sv += sa * dt; c.sc += c.sv * dt;
      if (swinging || Math.abs(c.sc - c.sTarget) > 0.0004 || Math.abs(c.sv) > 0.004) busy = true;
      else if (!busy || Math.abs(F) < 1e-4) { c.phi = c.target; c.w = 0; c.sc = c.sTarget; c.sv = 0; }
      write(c);
    });
    for (let b = bodies.length - 1; b >= 0; b--) if (bodies[b].step(dt, now)) busy = true;
    if (busy && (visible || bodies.length)) raf = requestAnimationFrame(frame);
    else { Vf = VfPrev = Af = 0; if (!visible) settleNow(); }
  }

  /* ---- panning ---- */
  function go(target, instant) {
    target = clamp(target);
    if (instant || reduced()) { mode = 'idle'; x = target; v = 0; settleNow(); return; }
    tween = { x0: x, dx: target - x, t0: performance.now(), T: Math.min(1100, Math.max(640, 560 + Math.abs(target - x) * 0.45)) };
    mode = 'tween'; wake();
  }
  const stops = () => cards.map((c) => clamp(c.slot.offsetLeft));
  function step(dir) {
    const cur = mode === 'tween' ? tween.x0 + tween.dx : x, list = stops();
    let next = null;
    if (dir > 0) { for (let i = 0; i < list.length; i++) if (list[i] > cur + 8) { next = list[i]; break; } }
    else { for (let j = list.length - 1; j >= 0; j--) if (list[j] < cur - 8) { next = list[j]; break; } }
    go(next == null ? (dir > 0 ? max : 0) : next);
  }
  // The card the board is "on": the one whose left edge is nearest the viewport's left edge.
  function current() {
    const cur = mode === 'tween' ? tween.x0 + tween.dx : x;
    let best = 0, bd = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(clamp(c.slot.offsetLeft) - cur); if (d < bd - 1) { bd = d; best = i; } });
    return best;
  }
  function fling(vel) { if (reduced()) return; v = vel; mode = 'fling'; wake(); }
  btns.forEach((b) => b.addEventListener('click', () => step(Number(b.dataset.step))));
  vp.addEventListener('keydown', (e) => {
    if (e.target !== vp) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); step(k === 'ArrowRight' ? 1 : -1); }
    else if (k === 'Home' || k === 'End') { e.preventDefault(); go(k === 'Home' ? 0 : max); }
    else if ((k === 'Enter' || k === ' ') && opt.onEnter) { e.preventDefault(); opt.onEnter(current()); }
  });
  // Tabbing into a card brings it into view (overflow: clip means the browser can't scroll for us).
  let quiet = false;   // focus handed back by the unpin must not pan the board under the landing card
  vp.addEventListener('focusin', (e) => {
    const slot = e.target.closest('.slot');
    if (!slot || quiet) return;
    const left = slot.offsetLeft, right = left + slot.offsetWidth, span = vp.clientWidth - 60;
    if (left < x || right > x + span) go(left);
  });

  /* ---- drag vs click: a press only becomes a drag after 6px of mostly-horizontal travel. A press
     that catches a moving board is a catch, never a click. A drag never follows a link or unpins. ---- */
  const vel = Motion.Velocity(100, 90);
  vp.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !e.isPrimary) return;   // a second finger never takes over (or strands) the first finger's drag
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, start: x, on: false };
    vel.reset().add(e.timeStamp, e.clientX);
    if (mode === 'fling' || mode === 'tween' || mode === 'chase') begin(e);
  });
  function begin(e) {
    drag.on = true; drag.start = x + (e.clientX - drag.x0);   // no jump when the drag threshold is crossed
    mode = 'drag'; v = 0;
    try { vp.setPointerCapture(drag.id); } catch (err) { /* pointer already gone */ }
    root.classList.add('grabbing');
    cards.forEach((c) => { if (c.hover) unhover(c); });
    wake();
  }
  vp.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.on) {
      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) begin(e);
      else if (Math.abs(dy) > 10) { drag = null; return; }   // a vertical gesture belongs to the page
      else return;
    }
    x = rubber(drag.start - dx);
    vel.add(e.timeStamp, e.clientX);
    if (reduced()) render(); else wake();
  });
  function end(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const was = drag.on;
    drag = null;
    if (!was) return;
    root.classList.remove('grabbing');
    if (e.type === 'pointerup') suppressUntil = performance.now() + 80;
    const flick = Math.max(-5200, Math.min(5200, -vel.get(e.timeStamp)[0]));   // 0 if held still before letting go
    if (reduced()) { x = clamp(x); settleNow(); return; }
    v = flick; mode = 'fling'; wake();
  }
  vp.addEventListener('pointerup', end);
  vp.addEventListener('pointercancel', end);
  vp.addEventListener('click', (e) => { if (performance.now() < suppressUntil) { e.preventDefault(); e.stopPropagation(); } }, true);

  // Horizontal wheel / trackpad only: a vertical wheel keeps scrolling the page (no scroll-jacking).
  vp.addEventListener('wheel', (e) => {
    const unit = e.deltaMode === 1 ? 16 : 1;
    let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!d) return;
    e.preventDefault();
    d *= unit;
    if (reduced()) { x = clamp(x + d); render(); return; }
    if (mode !== 'chase') { chaseTarget = x; v = mode === 'fling' ? v : 0; }
    const out = chaseTarget < 0 || chaseTarget > max;
    chaseTarget = Math.max(-70, Math.min(max + 70, chaseTarget + d * (out ? 0.3 : 1)));
    mode = 'chase'; wake();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { if (mode === 'chase' && (chaseTarget < 0 || chaseTarget > max)) { chaseTarget = clamp(chaseTarget); wake(); } }, 140);
  }, { passive: false });

  /* ---- hover / focus: lift toward the viewer, pivoting on the pin ---- */
  function retarget(c) {
    const up = (c.hover || c.focus) && !c.off;
    c.target = up ? c.rest * 0.3 : c.rest;
    c.sTarget = up ? (c.taped ? 1.012 : 1.03) : 1;
    c.slot.classList.toggle('lifted', up);
    wake();
  }
  function unhover(c) { c.hover = false; retarget(c); }
  cards.forEach((c) => {
    c.swing.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !drag && !c.off) { c.hover = true; retarget(c); } });
    c.swing.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse' && c.hover) unhover(c); });
    // Keyboard focus lifts the card; focus handed back after a pointer close does not (it would look stuck).
    c.slot.addEventListener('focusin', (e) => { c.focus = e.target.matches(':focus-visible'); retarget(c); });
    c.slot.addEventListener('focusout', (e) => { if (!c.slot.contains(e.relatedTarget)) { c.focus = false; retarget(c); } });
  });

  /* ---- impulses, detach / attach, external bodies ---- */
  function pinPoint(i) {
    const c = cards[i], r = c.slot.getBoundingClientRect();
    return { x: r.left + r.width * c.pinLeft, y: r.top + 14 };
  }
  // A wave from (px, py): each card's pin is jolted away from the source, so its paper swings back
  // toward it. ampDeg = peak swing at the source; falls off with distance; arrives at `speed` px/ms.
  function ripple(px, py, o) {
    if (reduced()) return;
    const now = performance.now();
    cards.forEach((c, i) => {
      if (c.off || i === o.skip) return;
      const p = pinPoint(i), dx = p.x - px, d = Math.hypot(dx, p.y - py);
      if (d > o.reach * 3.2) return;
      const ang = o.ampDeg * D2R * Math.exp(-d / o.reach) * (c.taped ? 0.3 : 1);
      kicks.push({ c, dw: (dx >= 0 ? 1 : -1) * ang * c.omega, at: now + d / o.speed });
    });
    wake();
  }
  function kick(i, dwDeg) { if (reduced()) return; cards[i].w += dwDeg * D2R; wake(); }
  // A thumb pressing the paper into the cork: a kick to the card's own scale spring.
  function press(i, dv) { const c = cards[i]; if (!c || c.off || reduced()) return; c.sv -= dv; wake(); }
  function detach(i) {
    const c = cards[i], st = { phi: c.phi / D2R, w: c.w / D2R, sc: c.sc, sv: c.sv };
    c.slot.style.height = c.slot.offsetHeight + 'px';   // the slot keeps its footprint on the cork
    c.hover = c.focus = false; c.slot.classList.remove('lifted');
    c.off = true;
    return st;
  }
  function attach(i, phiDeg, wDeg) {
    const c = cards[i];
    c.slot.style.height = '';
    c.off = false; c.written = '';
    c.phi = phiDeg * D2R; c.w = reduced() ? 0 : wDeg * D2R; c.sc = 1; c.sv = 0;
    c.target = c.rest; c.sTarget = 1;
    if (reduced()) c.phi = c.rest;
    write(c); wake();
  }
  function addBody(b) { if (bodies.indexOf(b) < 0) bodies.push(b); wake(); }
  function removeBody(b) { const k = bodies.indexOf(b); if (k >= 0) bodies.splice(k, 1); }

  new IntersectionObserver((en) => { visible = en[en.length - 1].isIntersecting; if (visible) wake(); }).observe(root);
  new ResizeObserver(() => measure()).observe(root);
  Motion.onReduced(() => settleNow());
  measure();

  return {
    go, step, fling, measure, wake, ripple, kick, press, detach, attach, addBody, removeBody, pinPoint, current, cards,
    focusQuietly(el) { quiet = true; el.focus({ preventScroll: true }); quiet = false; },
    boardV: () => Vf,
    idle: () => mode === 'idle'
  };
}
