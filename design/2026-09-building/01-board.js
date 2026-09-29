/* design/2026-09-building · the Building board with each candidate's preview. The cards, the physics and the flower are
   production modules (lib/building/, imported as they are); the pen wiring is production board.js's. What changes per
   candidate is the preview step (01-back.js A, 01-zoom.js B, 01-dossier.js C) and the hand-off for 00-vt.js.
   Unlike production the board is built before first paint (this module is render-blocking and the page has no
   support.js), because a card can only fly back into its slot if the slot exists when the view transition captures
   the page. That is one of the production costs README.md lists. */
import { build, sortProjects } from '../../lib/building/cards.js';
import { Physics } from '../../lib/building/physics.js';
import { mountFlower, flowerCues } from '../../lib/building/flower.js';
import { Unpin } from './01-unpin.js';
import * as A from './01-back.js';
import * as B from './01-zoom.js';
import * as C from './01-dossier.js';

const html = document.documentElement, c = html.dataset.c;
const mouse = (e) => e.pointerType === 'mouse' && !e.buttons;

// ---- the pen (production board.js) ----
function wireLink(el, focus) {
  const t = el.querySelector('.pen-t, .glyph');
  return Tier.wire(el, { target: t || el, over: t && t.classList.contains('glyph') ? 2 : undefined, focus: focus || { on: 'host', gap: 4, gy: 3 } });
}
function focusOnly(el, o) {
  const fm = new FocusMark(el, el, o);
  el.addEventListener('focus', () => fm.set(el.matches(':focus-visible')));
  el.addEventListener('blur', () => fm.set(false));
  return fm;
}
function wirePen(k) {
  k.root.querySelectorAll('.cork-btn').forEach((b) => wireLink(b, { on: 'host', gap: 5, gy: 5 }));
  focusOnly(k.viewport, { big: true, gap: -10, gy: -10 });
  const notices = [];
  k.slots.forEach((s) => {
    const big = s.kind === 'lead' || s.kind === 'featured';
    if (s.trigger) focusOnly(s.trigger, big ? { big: true, gap: 7, gy: 7 } : { gap: 4, gy: 4 });
    const t = s.swing.querySelector('h2 .pen-t, .ch-t .pen-t');
    if (s.kind !== 'lead' && t) {
      const m = new TierMark(t, t);
      s.swing.addEventListener('pointerenter', (e) => { if (mouse(e) && !s.el.classList.contains('unpinned')) m.to(1, 'hover'); });
      s.swing.addEventListener('pointerleave', () => m.to(0, 'hover'));
      notices.push(m);
    }
    s.swing.querySelectorAll('.project-cta, .featured-cta, .github-link, .bk-row, .bk-enter').forEach((a) => wireLink(a));
  });
  new MutationObserver(() => { if (k.root.classList.contains('grabbing')) notices.forEach((m) => m.to(0, 'hover')); })
    .observe(k.root, { attributes: true, attributeFilter: ['class'] });
}
const wireNote = (panel) => [...panel.querySelectorAll('.unpin-close, .unpin-cta, .github-link, .dos-tab, .dos-list a')].map((a) => wireLink(a, a.matches('.unpin-close') ? { on: 'host', gap: 5, gy: 4 } : null));

// ---- build, before first paint ----
const host = document.getElementById('board');
const k = build(host, sortProjects(window.BUILDING_PROJECTS || []));
let U = null, P = null, cam = null, wired = false;
const queue = [];
const whenWired = (fn) => { if (wired) fn(); else queue.push(fn); };
const closeBtn = (p) => '<button class="unpin-close" type="button" aria-label="Pin ' + p.title.replace(/"/g, '&quot;') + ' back on the board"><span class="pen-t">pin it back · <span lang="zh">钉回去</span></span> <span aria-hidden="true">×</span></button>';

if (c === 'a') A.decorate(k, closeBtn);
if (c === 'b') { B.decorate(k); cam = B.Camera(k, { get: () => P }); }
if (c === 'c') C.decorate(k);

const slotOf = (id) => k.slots.findIndex((s) => s.project.id === id && s.kind !== 'chapter' && s.kind !== 'figure');
const trackX = () => { const m = /translate3d\((-?[\d.]+)px/.exec(k.track.style.transform || ''); return m ? -parseFloat(m[1]) : 0; };

// back from a project page: the board where it was, and the card ready to be pinned (or the camera still in)
const back = window.BDVT && BDVT.peek('board');
if (back && back.id) {
  const i = slotOf(back.id), s = k.slots[i];
  if (back.x) k.track.style.transform = 'translate3d(' + (-back.x).toFixed(2) + 'px,0,0)';
  if (s && (c === 'a' || c === 'c')) {
    s.pin.style.visibility = 'hidden';
    if (c === 'a') s.swing.classList.add('vt-card');
    if (c === 'c' && s.peek) s.peek.classList.add('vt-tabs');
  }
  if (s && c === 'b') cam.leanOn(back.id, true);
}

// ---- what 00-vt.js asks of this page ----
window.BD_PAGE = {
  role: 'board',
  swap(rec, to) {
    rec.x = trackX();
    if (!to || to.role !== 'project') return;
    rec.id = to.project;
    if (c === 'a' && U && U.current()) { const st = U.current(); A.flatten(st.s); st.card.classList.add('vt-card'); }
    if (c === 'b') {   // the camera goes on into what was clicked: a chapter slip, or the card itself
      const l = window.BDVT && BDVT.link(), a = (l && (l.closest('.paper--chapter') || l.closest('.swing'))) || document.querySelector('.paper--chapter[href^="' + to.file + '"]');
      if (a) { const r = a.getBoundingClientRect(); rec.rect = { x: r.left, y: r.top, w: r.width, h: r.height }; }
    }
    if (c === 'c' && U && U.current() && U.current().panel) { const t = U.current().panel.querySelector('.dos-tabs'); if (t) t.classList.add('vt-tabs'); }
  },
  rect(id) {   // B, on the way back: where the chapter's slip is on the board, in the camera's frame
    const a = document.querySelector('.paper--chapter[href^="' + id + '"]');
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  },
  landed(rec) {
    if (!rec || !rec.id) return;
    const i = slotOf(rec.id), s = k.slots[i];
    if (!s) return;
    if (c === 'b') { setTimeout(() => cam.step(), 260); return; }
    s.swing.classList.remove('vt-card');
    if (s.peek) s.peek.classList.remove('vt-tabs');
    whenWired(() => U.repin(i));
  }
};

// ---- the rest after first paint, as production does ----
async function wire() {
  P = Physics(k, { onEnter: (i) => { if (cam) cam.focusIndex(i); else U.openIndex(i); } });
  if (back && back.x) P.go(back.x, true);
  let cues = null;
  if (c !== 'b') {
    const hand = c === 'a' ? A.hand(closeBtn) : C.hand(closeBtn);
    U = Unpin(k, P, Object.assign({}, hand, {
      onOpen: (i, panel) => {
        const w = wireNote(panel), f = document.activeElement;
        if (f && panel.contains(f)) { f.blur(); f.focus({ preventScroll: true }); }
        return () => w.forEach((x) => x.destroy());
      },
      onLand: (i) => { if (cues && i === 0) cues.repin(); }
    }));
  }
  const lead = k.slots[0];
  if (lead.kind === 'lead') {
    const key = 'fy-flower-' + lead.project.id;
    let applied = false;
    try { applied = sessionStorage.getItem(key) === '1'; } catch (e) { /* private mode */ }
    const fl = mountFlower(lead.swing.querySelector('.paper--lead'), { phys: P, index: 0, hidden: !applied && !Motion.reduced() });
    cues = flowerCues({ slot: lead, P, fl }, key);
  }
  wirePen(k);
  if (window.BD) BD.carry(k.root);
  wired = true;
  queue.splice(0).forEach((fn) => fn());
}
document.querySelectorAll('[data-project-count]').forEach((n) => { n.textContent = 'on the board · ' + (window.BUILDING_PROJECTS || []).length + ' 件'; });
requestAnimationFrame(() => setTimeout(wire));
