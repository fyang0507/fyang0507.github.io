/* Building · the corkboard (design/2026-09-motion, boards r2-05 → r4-05): pinned paper in one physics
   loop — drag, pendulum cards, unpin to read, re-pin ripples the cork — with the 小红花 on the lead
   card and board 02's pen for every state. Built into the page's static .board-host as this module
   evaluates: the page loads it blocking="render", so the board is there at first render and at pagereveal,
   where a view transition captures the page.

   The pen here: hover draws the coral notice line under a card's title (not the lead: its flower is its
   notice) and under a link's words, tracing the link's printed pencil rule; keyboard focus draws coral
   「 」. Nothing on a corkboard is "chosen" — a card in your hand is a dialog, not a state — so the wheat
   band never appears. Coral per surface comes from data-paper (cork / wheat / cream). */
import { build, sortProjects } from './cards.js';

const mouse = (e) => e.pointerType === 'mouse' && !e.buttons;

// A link or small button: the notice under its words (.pen-t, or its glyph), 「 」 round the whole.
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
    focusOnly(s.trigger, big ? { big: true, gap: 7, gy: 7 } : { gap: 4, gy: 4 });
    if (s.kind !== 'lead') {
      const t = s.swing.querySelector('h2 .pen-t'), m = new TierMark(t, t);
      s.swing.addEventListener('pointerenter', (e) => { if (mouse(e) && !s.el.classList.contains('unpinned')) m.to(1, 'hover'); });
      s.swing.addEventListener('pointerleave', () => m.to(0, 'hover'));
      notices.push(m);
    }
    s.swing.querySelectorAll('.project-cta, .featured-cta, .github-link').forEach((a) => wireLink(a));
  });
  // A drag is not a hover: the board takes the pointer, and every title's notice retracts.
  new MutationObserver(() => { if (k.root.classList.contains('grabbing')) notices.forEach((m) => m.to(0, 'hover')); })
    .observe(k.root, { attributes: true, attributeFilter: ['class'] });
}

// Physics, unpin, the flower and the pen: none of them changes a pixel at rest, so they load and wire up
// after the cards' first paint rather than in front of it (the cards need only cards.js).
async function wire(k) {
  const [{ Physics }, { Unpin }, { mountFlower, flowerCues }] = await Promise.all([import('./physics.js'), import('./unpin.js'), import('./flower.js')]);
  let U = null, cues = null;
  const P = Physics(k, { onEnter: (i) => U.openIndex(i) });
  U = Unpin(k, P, {
    onOpen: (i, panel) => {
      const wires = [...panel.querySelectorAll('.unpin-close, .unpin-cta, .github-link')].map((a) => wireLink(a, a.matches('.unpin-close') ? { on: 'host', gap: 5, gy: 4 } : null));
      const f = document.activeElement;   // focus arrived before the pen was wired: hand it over again so 「 」 is drawn
      if (f && panel.contains(f)) { f.blur(); f.focus({ preventScroll: true }); }
      return () => wires.forEach((w) => w.destroy());   // the note is removed on landing; its marks go with it
    },
    onLand: (i) => { if (cues && i === 0) cues.repin(); }
  });
  const lead = k.slots[0];
  if (lead.kind === 'lead') {
    const key = 'fy-flower-' + lead.project.id;
    let applied = false;
    try { applied = sessionStorage.getItem(key) === '1'; } catch (e) { /* private mode */ }
    const fl = mountFlower(lead.swing.querySelector('.paper--lead'), { phys: P, index: 0, hidden: !applied && !Motion.reduced() });
    cues = flowerCues({ slot: lead, P, fl }, key);
  }
  wirePen(k);
}

// Building the board measures nothing, so it runs at once. What measures waits for the page's stylesheets
// (FY.styled): WebKit may run this module before they apply.
const projects = sortProjects(window.BUILDING_PROJECTS || []);
if (projects.length) {
  const k = build(document.querySelector('.board-host'), projects);
  // The header ships the count as static text so it doesn't reflow at first paint; this keeps it true.
  document.querySelectorAll('[data-project-count]').forEach((n) => { n.textContent = 'on the board · ' + projects.length + ' 件'; });
  FY.styled(() => requestAnimationFrame(() => setTimeout(() => wire(k))));
} else console.error('Building project index is missing or empty.');
