/* design/2026-09-building · round 3 · the Building board in C, for trying HANDOFF §4's questions live. The cards,
   physics and flower are production modules; the unpin and the dossier are round 1's (01-unpin.js, 01-dossier.js) and
   the pen wiring is 01-board.js's. What round 3 changes:
   · Q2, coming back from a project page (round 1's mock always came back at 0, PLAN-REVIEW finding 1):
       (a) the card you came back from is brought into view, worked out from the page you came from
           (navigation.activation.from, else document.referrer): no storage;
       (b) the board is exactly where you left it: sessionStorage fy-r3-board {x}, written as you leave.
     Both run in the pagereveal handler, where the sheets have applied in every engine (PORT-PLAN §8).
   · Q8, the card's direct link: its peeking tabs are named for the flight (a), or r3-vt.js cuts (b).
   · The dossier and chapter links point at the r3 pages, so a way in and a way back stay in round 3.
   · The pin is hidden and pressed only when a transition runs (R17).
   · The layering (Fred, on Q2: "the order of layer should be correct at the first place"). The tabs are named
     view-transition groups, and every group paints above the page's own snapshot, so on the way back they were drawn
     over the card for the whole move and slid under it only when it ended. The card in play now gets its own group
     too: its swing, so the paper and its tape travel as one (.r3-card, pj-board-card in r3.css), ordered above the tabs and faded with the page by r3-vt.js, so whatever
     sits under the card at rest is under it in every frame: the way back, the way in from the dossier, and the direct
     link's flight. One card carries the name at a time; stale names from a page restored from the back/forward cache
     are cleared before anything is named. */
import { build, sortProjects } from '../../lib/building/cards.js';
import { Physics } from '../../lib/building/physics.js';
import { mountFlower, flowerCues } from '../../lib/building/flower.js';
import { Unpin } from './01-unpin.js';
import * as C from './01-dossier.js';

const R3 = { '02-overview.html': 'r3-overview.html', '04-system.html': 'r3-system.html', '03-principles.html': 'r3-principles.html',
  '05-njjoe.html': 'r3-njjoe.html', '../../building/fred-agent/components.html': 'r3-components.html', '../../building/fred-agent/demos.html': 'r2-02-demos.html' };
const ENTER = { 'fred-agent': 'r3-overview.html', njjoe: 'r3-njjoe.html' };
// the preview data, pointed at round 3's pages
const src = window.BD_PREVIEW || {}, prev = {};
Object.keys(src).forEach((id) => {
  const d = Object.assign({}, src[id]);
  if (d.chapters) d.chapters = d.chapters.map((c) => (R3[c.href] ? Object.assign({}, c, { href: R3[c.href], live: false, wip: null }) : Object.assign({}, c, { wip: null })));
  prev[id] = d;
});
window.BD_PREVIEW = prev;

const mouse = (e) => e.pointerType === 'mouse' && !e.buttons;
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
    const t = s.swing.querySelector('h2 .pen-t');
    if (s.kind !== 'lead' && t) {
      const m = new TierMark(t, t);
      s.swing.addEventListener('pointerenter', (e) => { if (mouse(e) && !s.el.classList.contains('unpinned')) m.to(1, 'hover'); });
      s.swing.addEventListener('pointerleave', () => m.to(0, 'hover'));
      notices.push(m);
    }
    s.swing.querySelectorAll('.project-cta, .featured-cta, .github-link').forEach((a) => wireLink(a));
  });
  new MutationObserver(() => { if (k.root.classList.contains('grabbing')) notices.forEach((m) => m.to(0, 'hover')); })
    .observe(k.root, { attributes: true, attributeFilter: ['class'] });
}
const wireNote = (panel) => [...panel.querySelectorAll('.unpin-close, .github-link, .dos-tab, .dos-list a')].map((a) => wireLink(a, a.matches('.unpin-close') ? { on: 'host', gap: 5, gy: 4 } : null));

// ---- build, before first paint ----
const k = build(document.getElementById('board'), sortProjects(window.BUILDING_PROJECTS || []));
C.decorate(k);
k.slots.forEach((s) => s.swing.querySelectorAll('.project-cta, .featured-cta').forEach((a) => { if (ENTER[s.project.id]) a.setAttribute('href', ENTER[s.project.id]); }));
let U = null, P = null, wired = false, startX = 0;
const queue = [];
const whenWired = (fn) => { if (wired) fn(); else queue.push(fn); };
const closeBtn = (p) => '<button class="unpin-close" type="button" aria-label="Pin ' + p.title.replace(/"/g, '&quot;') + ' back on the board"><span class="pen-t">pin it back · <span lang="zh">钉回去</span></span> <span aria-hidden="true">×</span></button>';
const slotOf = (id) => k.slots.findIndex((s) => s.project.id === id);
const trackX = () => { const m = /translate3d\((-?[\d.]+)px/.exec(k.track.style.transform || ''); return m ? -parseFloat(m[1]) : 0; };
const setX = (x) => { startX = x; k.track.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)'; };
const q2 = () => (window.BD && BD.r3.q2) || 'a';
const remember = () => { try { sessionStorage.setItem('fy-r3-board', JSON.stringify({ x: trackX(), t: Date.now() })); } catch (e) { /* storage off */ } };

// ---- Q2: coming back from a project page ----
function cameFrom() {
  const a = window.navigation && navigation.activation, url = (a && a.from && a.from.url) || document.referrer || '';
  const r = url && window.BDVT ? BDVT.roleOf(url) : null;
  return r && r.role === 'project' ? r : null;
}
function maxX() {
  const cs = getComputedStyle(k.viewport);
  return Math.max(0, k.track.offsetWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) - k.viewport.clientWidth);
}
function clearNames() { document.querySelectorAll('.r3-card, .vt-tabs').forEach((n) => n.classList.remove('r3-card', 'vt-tabs')); }
function arrive(e) {
  clearNames();
  const from = cameFrom();
  if (!from) return;
  const i = slotOf(from.project), s = k.slots[i];
  if (q2() === 'b') {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem('fy-r3-board')); } catch (x) { saved = null; }
    if (saved && typeof saved.x === 'number') setX(Math.min(saved.x, maxX()));
  } else if (s) {   // (a): the card's slot, centred in the cork, held to the track's ends
    const vw = k.viewport.clientWidth, left = s.el.offsetLeft, w = s.el.offsetWidth, pad = parseFloat(getComputedStyle(k.viewport).paddingLeft);
    setX(Math.max(0, Math.min(maxX(), left + pad + w / 2 - vw / 2)));
  }
  if (s && e && e.viewTransition && !(window.BD && BD.reduced())) {   // the way back: the tabs tuck behind this card, then its pin goes in
    s.pin.style.visibility = 'hidden';
    if (s.peek) s.peek.classList.add('vt-tabs');
    s.swing.classList.add('r3-card');
    s.r3Back = true;
  }
}
if ('onpagereveal' in window) addEventListener('pagereveal', arrive); else arrive(null);

// ---- what r3-vt.js asks of this page ----
window.BD_PAGE = {
  role: 'board',
  swap(rec, to) {
    remember();
    if (!to || to.role !== 'project') return;
    rec.id = to.project;
    const st = U && U.current();
    if (st && st.panel) {   // the way in from the dossier in your hand: its tabs, under the card in your hand
      const t = st.panel.querySelector('.dos-tabs');
      if (t) t.classList.add('vt-tabs');
      st.s.swing.classList.add('r3-card');
      return;
    }
    const l = window.BDVT && BDVT.link(), sw = l && l.closest('.swing');   // the card's own direct link (Q8)
    if (!sw) return;
    rec.direct = true;
    const s = k.slots.find((x) => x.swing === sw);
    if (s && s.peek && BD.r3.q8 === 'a') { s.peek.classList.add('vt-tabs'); s.swing.classList.add('r3-card'); }
  },
  landed(rec, kind, vt) {
    const i = k.slots.findIndex((s) => s.r3Back), s = k.slots[i];
    if (!s) return;
    s.r3Back = false;
    clearNames();
    if (vt) whenWired(() => U.repin(i)); else s.pin.style.visibility = '';
  }
};
addEventListener('pagehide', remember);

// ---- the rest after first paint ----
function wire() {
  P = Physics(k, { onEnter: (i) => U.openIndex(i) });
  if (startX) P.go(startX, true);
  let cues = null;
  U = Unpin(k, P, Object.assign({}, C.hand(closeBtn), {
    onOpen: (i, panel) => {
      const w = wireNote(panel), f = document.activeElement;
      if (f && panel.contains(f)) { f.blur(); f.focus({ preventScroll: true }); }
      return () => w.forEach((x) => x.destroy());
    },
    onLand: (i) => { if (cues && i === 0) cues.repin(); }
  }));
  const lead = k.slots[0];
  if (lead.kind === 'lead') {
    const key = 'fy-flower-' + lead.project.id;
    let applied = false;
    try { applied = sessionStorage.getItem(key) === '1'; } catch (e) { /* private mode */ }
    const fl = mountFlower(lead.swing.querySelector('.paper--lead'), { phys: P, index: 0, hidden: !applied && !Motion.reduced() });
    cues = flowerCues({ slot: lead, P, fl }, key);
  }
  wirePen(k);
  wired = true;
  queue.splice(0).forEach((fn) => fn());
}
document.querySelectorAll('[data-project-count]').forEach((n) => { n.textContent = 'on the board · ' + (window.BUILDING_PROJECTS || []).length + ' 件'; });
requestAnimationFrame(() => setTimeout(wire));
