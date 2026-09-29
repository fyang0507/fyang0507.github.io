/* lib/reading/slip.js — the narrow-screen note (margin notes are hidden at ≤1080px). Not a sheet: the pen cuts a slot
   near the bottom of the window and the note is the same paper slip as in the margin (eyelet, number, citation in
   upright serif with utility-mono dates, links live), pulled up out of the slot. Its tail stays tucked in the slot
   (the page's lip covers it and casts a thin contact shadow); it comes out leaning and straightens as it rises
   (the pivot sits in the slot); a swipe down, Esc or the grip pushes it back in. Physics clock.
   Slip(ctx, model) → { open(note), close(v), note() }. Ported from design/2026-09-motion r3-08b-slip.js. */
const TUCK = 16;

export function Slip(ctx) {
  const root = document.createElement('div');
  root.className = 'fs-root';
  root.innerHTML =
    '<div class="fs-well"><aside class="fs-slip" role="dialog" aria-label="Note · 注释" tabindex="-1">' +
      '<button class="fs-grip" type="button" aria-label="Close · 收起"><svg width="46" height="8" aria-hidden="true"><path d="M3 4.6 C 14 3.1, 29 5.6, 43 3.7"/></svg></button>' +
      '<div class="fs-head"><span class="fs-eye" aria-hidden="true"></span><span class="fs-no"></span><span class="fs-lab">参考 · reference</span></div>' +
      '<div class="fs-body"></div>' +
      '<div class="fs-foot"><a class="fs-all" href="#">全部参考 · all references ↓</a><span>下滑收起 · swipe down</span></div>' +
    '</aside></div>' +
    '<div class="fs-lip" aria-hidden="true"><svg class="fs-slot"><path class="fs-cut"/></svg></div>';
  document.body.appendChild(root);
  const slip = root.querySelector('.fs-slip'), cut = root.querySelector('.fs-cut');
  const no = root.querySelector('.fs-no'), body = root.querySelector('.fs-body');
  let Y = 400, V = 0, target = 400, H = 300, K = [260, 21], cur = null, refLoop = null, drag = null;

  function pose() {
    // it leans while it is still coming out and straightens as it is pulled clear
    const k = Math.max(-.2, Math.min(1, (Y - TUCK) / Math.max(1, H)));
    slip.style.transform = 'translateY(' + Y.toFixed(1) + 'px) rotate(' + (-.5 - 3.2 * k).toFixed(2) + 'deg)';
  }
  const loop = Motion.Loop((dt) => {
    dt = Math.min(dt, .032);
    for (let s = 0; s < 4; s++) { V += (-K[0] * (Y - target) - K[1] * V) * dt / 4; Y += V * dt / 4; }
    pose();
    if (!cur && Y >= H) { hideAll(); return false; }                     // back inside the slot: done
    if (Math.abs(V) < 6 && Math.abs(Y - target) < .5) { Y = target; pose(); if (!cur) hideAll(); return false; }
    return true;
  });
  function spring(k, c) { K = [k, c]; loop.kick(); }
  function slot() {
    const w = root.clientWidth, r = Pen.rng('fs-slot'), pts = [];
    for (let i = 0; i <= 8; i++) pts.push([10 + (w - 20) * i / 8, 3 + (r() - .5) * 1.2 + (i === 0 || i === 8 ? 1 : 0)]);
    root.querySelector('.fs-slot').setAttribute('width', w);
    cut.setAttribute('d', Pen.smooth(pts));
  }
  function hideAll() { root.classList.remove('open'); Pen.erase(cut, { duration: 140 }); }
  function loopRef(a) {
    if (refLoop) { const o = refLoop; o.hide(); setTimeout(() => o.destroy(), 220); refLoop = null; }
    if (a) { refLoop = Pen.annotate(a, 'loop', { manual: true, seed: 'fs-ref-' + a.dataset.ref, pad: 3, width: 1.6, duration: 200 }); refLoop.show(); }
  }

  function open(note) {
    const swap = !!cur && cur !== note, again = cur === note;
    cur = note;
    no.textContent = note.n;
    body.innerHTML = '<span class="fs-cite">' + note.html + '</span>';
    body.querySelectorAll('[tabindex]').forEach((el) => el.removeAttribute('tabindex'));   // live links in the dialog
    root.querySelector('.fs-all').setAttribute('href', '#' + note.ref);
    if (!again) loopRef(note.a);
    if (!root.classList.contains('open')) {
      root.classList.add('open'); slot();
      H = slip.offsetHeight + 12; Y = H; V = 0; pose();
      const d = Pen.draw(cut, { duration: 160 });
      if (Motion.reduced()) { Y = target = TUCK; pose(); }
      else setTimeout(() => { if (cur === note) { target = TUCK; spring(260, 21); } }, d ? 110 : 0);
    } else if (swap && !Motion.reduced()) {
      H = slip.offsetHeight + 12; V = 520; target = TUCK; spring(420, 30);   // tucked a little and pulled again
    }
    slip.focus({ preventScroll: true });
  }
  function close(v) {
    if (!cur) return;
    const a = cur.a; cur = null; loopRef(null);
    target = H + 10; V = v || 0;
    if (Motion.reduced()) { loop.stop(); Y = target; pose(); hideAll(); } else spring(300, 26);
    if (root.contains(document.activeElement)) a.focus({ preventScroll: true });
  }

  document.addEventListener('click', (e) => { if (cur && !e.target.closest('.fnref a[data-ref], .fs-root')) close(0); });
  root.querySelector('.fs-grip').addEventListener('click', () => close(0));
  root.querySelector('.fs-all').addEventListener('click', (e) => {
    e.preventDefault();
    const el = document.getElementById(e.currentTarget.getAttribute('href').slice(1));
    close(0);
    if (el) ctx.scrollTo(ctx.top(el) - ctx.g.n1 - 24);
  });
  slip.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(0); });

  // swipe down: the slip follows the finger (upward pulls resist), release keeps the finger's velocity
  slip.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    drag = { y: e.clientY, y0: Y, t: performance.now(), v: 0 };
    loop.stop(); slip.setPointerCapture(e.pointerId);
  });
  slip.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const now = performance.now(), dy = e.clientY - drag.y, ny = dy < 0 ? drag.y0 + dy * .25 : drag.y0 + dy;
    drag.v = (ny - Y) / Math.max(1, now - drag.t) * 1000; drag.t = now; Y = ny; pose();
  });
  function release() {
    if (!drag) return;
    const d = drag; drag = null;
    if (Y - TUCK > 64 || d.v > 520) close(Math.max(d.v, 300)); else { target = TUCK; V = d.v; spring(260, 21); }
  }
  slip.addEventListener('pointerup', release);
  slip.addEventListener('pointercancel', release);
  ctx.onLayout(() => { if (cur) { slot(); H = slip.offsetHeight + 12; } });
  return { open: open, close: close, note: () => cur };
}
