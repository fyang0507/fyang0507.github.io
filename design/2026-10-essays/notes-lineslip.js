/* design/2026-10-essays/notes-lineslip.js — candidate B on the phone: the note comes out of the ref's own line, not
   out of a slot at the foot of the window. The pen cuts the slot along the bottom of the line that holds the ref,
   and the same paper slip (eyelet, number, citation in upright serif, live links) slides down out of it over the
   lines below, leaning while it is still coming out; the ref stays in view just above it, banded wheat (chosen:
   TierMark tier 2) while its note is out. If the slip would run past the window's foot, the page first glides up
   just enough (never pushing the line under the nav), and a slip taller than the room scrolls inside.
   Tap the ref again, tap elsewhere, Esc or "收起 · close" pushes it back into the line. Physics clock.
   LineSlip(ctx) → { open(note), close(), note() }. */
import { row } from '../../lib/reading/notes.js';

const GAP = 4, FOOT = 14;   // the slot sits 4 px under the line's glyph box · room kept above the window's foot

export function LineSlip(ctx) {
  const root = document.createElement('div');
  root.className = 'ls-root';
  root.innerHTML =
    '<svg class="ls-slot" aria-hidden="true"><path class="ls-cut"/></svg>' +
    '<div class="ls-well"><aside class="ls-slip" role="dialog" aria-label="Note · 注释" tabindex="-1">' +
      '<div class="fs-head"><span class="fs-eye" aria-hidden="true"></span><span class="fs-no"></span><span class="fs-lab">参考 · reference</span>' +
        '<button class="ls-x" type="button">收起 · close</button></div>' +
      '<div class="fs-body"></div>' +
      '<div class="fs-foot"><a class="fs-all" href="#">全部参考 · all references ↓</a></div>' +
    '</aside></div>';
  const slip = root.querySelector('.ls-slip'), cut = root.querySelector('.ls-cut'), svg = root.querySelector('.ls-slot');
  const no = root.querySelector('.fs-no'), body = root.querySelector('.fs-body');
  const S = Motion.Spring({ k: 260, c: 21, x: -400 });   // S.x: how far the slip still sits up inside the line (0 = out)
  const marks = new Map();
  let H = 300, cur = null;

  function pose() {
    const k = Math.max(0, Math.min(1, -S.x / Math.max(1, H)));   // 1 = still in the slot, 0 = all the way out
    slip.style.transform = 'translateY(' + S.x.toFixed(1) + 'px) rotate(' + (-2.4 * k).toFixed(2) + 'deg)';
  }
  const loop = Motion.Loop((dt) => {
    S.step(Math.min(dt, .032)); pose();
    if (!cur && S.x <= -H) { hide(); return false; }
    if (Math.abs(S.v) < 6 && Math.abs(S.x - S.to) < .5) { S.snap(); pose(); if (!cur) hide(); return false; }
    return true;
  });
  function hide() { root.classList.remove('open'); root.remove(); }
  function slot(w) {
    const r = Pen.rng('ls-slot'), pts = [];
    for (let i = 0; i <= 8; i++) pts.push([6 + (w - 12) * i / 8, 3 + (r() - .5) * 1.2]);
    svg.setAttribute('width', w); cut.setAttribute('d', Pen.smooth(pts));
  }
  function band(note, on) {
    if (!marks.has(note)) marks.set(note, new TierMark(note.a, note.a));
    marks.get(note).to(on ? 2 : 0, on ? 'tap' : 'hover');
  }

  function open(note) {
    if (cur === note) { close(); return; }                       // tap the ref again: back into the line
    if (cur) { band(cur, false); S.snap(-H); pose(); cur = null; }
    cur = note;
    no.textContent = note.n;
    body.innerHTML = '<span class="fs-cite">' + note.html + '</span>';
    body.querySelectorAll('[tabindex]').forEach((el) => el.removeAttribute('tabindex'));
    root.querySelector('.fs-all').setAttribute('href', '#' + note.ref);
    // hang it under the ref's line, in the essay's own column
    const B = note.body.getBoundingClientRect(), r = row(note.sup);
    note.body.appendChild(root);
    root.style.top = (r.bottom - B.top + GAP) + 'px';
    root.classList.add('open'); slot(root.clientWidth);
    body.style.maxHeight = '';
    const room = innerHeight - FOOT - ctx.g.n1 - 16 - (r.bottom - r.top) - GAP;
    if (slip.offsetHeight > room) body.style.maxHeight = Math.max(120, room - (slip.offsetHeight - body.offsetHeight)) + 'px';
    H = slip.offsetHeight + 8;
    // the page makes room below the line if it has to, but never pushes the line under the nav
    const over = r.bottom + GAP + slip.offsetHeight - (innerHeight - FOOT), lift = Math.min(over, r.top - ctx.g.n1 - 16);
    if (lift > 0) ctx.scrollTo(ctx.y() + lift);
    band(note, true);
    S.snap(-H); pose();
    const d = Pen.draw(cut, { duration: 160 });
    if (Motion.reduced()) { S.snap(0); pose(); }
    else setTimeout(() => { if (cur === note) { S.to = 0; S.setK(260, 21); loop.kick(); } }, d ? 110 : 0);
    slip.focus({ preventScroll: true });
  }
  function close() {
    if (!cur) return;
    const a = cur.a; band(cur, false); cur = null;
    Pen.erase(cut, { duration: 140 });
    S.to = -H - 10;
    if (Motion.reduced()) { S.snap(); pose(); hide(); } else { S.setK(300, 26); loop.kick(); }
    if (root.contains(document.activeElement)) a.focus({ preventScroll: true });
  }

  document.addEventListener('click', (e) => { if (cur && !e.target.closest('.fnref a[data-ref], .ls-root')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && cur) { const a = cur.a; close(); a.focus({ preventScroll: true }); } });
  root.querySelector('.ls-x').addEventListener('click', () => close());
  root.querySelector('.fs-all').addEventListener('click', (e) => {
    e.preventDefault();
    const el = document.getElementById(e.currentTarget.getAttribute('href').slice(1));
    close();
    if (el) ctx.jump(el, ctx.top(el) - ctx.g.n1 - 24);
  });
  // a resize (a phone's address bar, a rotation) keeps the slip on its line; a language switch hides its body: gone
  ctx.onLayout(() => {
    if (!cur) return;
    if (!cur.body.offsetParent) { band(cur, false); cur = null; loop.stop(); hide(); return; }
    root.style.top = (row(cur.sup).bottom - cur.body.getBoundingClientRect().top + GAP) + 'px'; slot(root.clientWidth);
  });
  return { open: open, close: close, note: () => cur };
}
