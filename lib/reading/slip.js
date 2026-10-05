/* lib/reading/slip.js — the narrow-screen note (margin notes are hidden below 1164px). Not a sheet: the pen cuts a slot
   near the bottom of the window and the note is the same paper slip as in the margin (eyelet, number, citation in
   upright serif with utility-mono dates, links live), pulled up out of the slot. Its tail stays tucked in the slot
   (the page's lip covers it and casts a thin contact shadow); it comes out leaning and straightens as it rises
   (the pivot sits in the slot); a swipe down, Esc or the grip pushes it back in. Physics clock.
   It never hides its own ref: when the ref's line would end up under it, the page first glides up just enough that
   the line rests 14 px above the slip's top edge (design/2026-10-essays, notes round 1).
   Keyboard: while it is open, Tab cycles inside it and Esc (from anywhere) closes it and returns focus to the ref.
   "All references ↓" goes to the reference and moves focus there.
   Slip(ctx) → { open(note), close(v), note() }. Ported from design/2026-09-motion r3-08b-slip.js. */
import { row } from './notes.js';

const TUCK = 16, CLEAR = 14;   // how far the open slip stays in the slot · room kept between its top edge and the ref

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
  const slip = root.querySelector('.fs-slip'), cut = root.querySelector('.fs-cut'), well = root.querySelector('.fs-well');
  const no = root.querySelector('.fs-no'), body = root.querySelector('.fs-body');
  const S = Motion.Spring({ k: 260, c: 21, x: 400 });   // S.x = how far the slip still sits down in the slot
  let H = 300, cur = null, refLoop = null, drag = null;

  function pose() {
    // it leans while it is still coming out and straightens as it is pulled clear
    const k = Math.max(-.2, Math.min(1, (S.x - TUCK) / Math.max(1, H)));
    slip.style.transform = 'translateY(' + S.x.toFixed(1) + 'px) rotate(' + (-.5 - 3.2 * k).toFixed(2) + 'deg)';
  }
  const loop = Motion.Loop((dt) => {
    S.step(Math.min(dt, .032)); pose();
    if (!cur && S.x >= H) { hideAll(); return false; }                   // back inside the slot: done
    if (Math.abs(S.v) < 6 && Math.abs(S.x - S.to) < .5) { S.snap(); pose(); if (!cur) hideAll(); return false; }
    return true;
  });
  function spring(k, c) { S.setK(k, c); loop.kick(); }
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
      H = slip.offsetHeight + 12; S.snap(H); pose();
      const d = Pen.draw(cut, { duration: 160 });
      if (Motion.reduced()) { S.snap(TUCK); pose(); }
      else setTimeout(() => { if (cur === note) { S.to = TUCK; spring(260, 21); } }, d ? 110 : 0);
    } else if (!Motion.reduced() && (swap || S.to > TUCK)) {
      // another note while one is out: tucked a little and pulled again; or a tap made while the last one was still
      // going back in (it is never hidden until it is all the way in): caught on its way and pulled out again
      H = slip.offsetHeight + 12; if (swap) S.v = 520; S.to = TUCK; spring(swap ? 420 : 260, swap ? 30 : 21);
    }
    // once out, the slip's top edge sits above the well's foot (the lip) by its height less the part still in the slot;
    // what must clear it is the line the ref's number sits on
    const over = row(note.sup, note.a).bottom - (well.getBoundingClientRect().bottom - slip.offsetHeight + TUCK - CLEAR);
    if (over > 0) ctx.scrollTo(ctx.y() + over);
    slip.focus({ preventScroll: true });
  }
  function close(v) {
    if (!cur) return;
    const a = cur.a; cur = null; loopRef(null);
    S.to = H + 10; S.v = v || 0;
    if (Motion.reduced()) { loop.stop(); S.snap(); pose(); hideAll(); } else spring(300, 26);
    if (root.contains(document.activeElement)) a.focus({ preventScroll: true });
  }

  document.addEventListener('click', (e) => { if (cur && !e.target.closest('.fnref a[data-ref], .fs-root')) close(0); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && cur) { const a = cur.a; close(0); a.focus({ preventScroll: true }); } });
  // a small dialog keeps the keyboard with it: Tab and Shift+Tab cycle through its controls
  slip.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [].slice.call(slip.querySelectorAll('a[href], button')), i = f.indexOf(document.activeElement);
    if (!f.length) return;
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
  });
  root.querySelector('.fs-grip').addEventListener('click', () => close(0));
  root.querySelector('.fs-all').addEventListener('click', (e) => {
    e.preventDefault();
    const el = document.getElementById(e.currentTarget.getAttribute('href').slice(1));
    close(0);
    if (el) ctx.jump(el, ctx.top(el) - ctx.g.n1 - 24);
  });

  // swipe down: the slip follows the finger (upward pulls resist), release keeps the finger's velocity
  slip.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    drag = { y: e.clientY, y0: S.x, t: performance.now(), v: 0 };
    loop.stop(); slip.setPointerCapture(e.pointerId);
  });
  slip.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const now = performance.now(), dy = e.clientY - drag.y, ny = dy < 0 ? drag.y0 + dy * .25 : drag.y0 + dy;
    drag.v = (ny - S.x) / Math.max(1, now - drag.t) * 1000; drag.t = now; S.x = ny; pose();
  });
  function release() {
    if (!drag) return;
    const d = drag; drag = null;
    if (S.x - TUCK > 64 || d.v > 520) close(Math.max(d.v, 300)); else { S.to = TUCK; S.v = d.v; spring(260, 21); }
  }
  slip.addEventListener('pointerup', release);
  slip.addEventListener('pointercancel', release);
  ctx.onLayout(() => { if (cur) { slot(); H = slip.offsetHeight + 12; } });
  return { open: open, close: close, note: () => cur };
}
