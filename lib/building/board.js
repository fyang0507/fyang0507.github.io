/* Building · the corkboard (design/2026-09-motion, boards r2-05 → r4-05): pinned paper in one physics
   loop — drag, pendulum cards, unpin to read its dossier (design/2026-09-building), re-pin ripples the
   cork — with the 小红花 on the lead card and board 02's pen for every state. Built into the page's
   static .board-host as this module evaluates: the page loads it blocking="render", so the board is
   there at first render and at pagereveal, where a view transition captures the page. Its side of the
   moves to and from a project's pages is at the end (moves()).

   The pen here: hover draws the coral notice line under a card's title (not the lead: its flower is its
   notice) and under a link's words, tracing the link's printed pencil rule; keyboard focus draws coral
   「 」. Nothing on a corkboard is "chosen" — a card in your hand is a dialog, not a state — so the wheat
   band never appears. Coral per surface comes from data-paper (cork / wheat / cream / kraft). */
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

let P = null, U = null, x0 = 0;   // the physics and the unpin, once wired; where the board starts
const then = [], wired = (fn) => { if (U) fn(); else then.push(fn); };

// Physics, unpin, the flower and the pen: none of them changes a pixel at rest, so they load and wire up
// after the cards' first paint rather than in front of it (the cards need only cards.js).
async function wire(k) {
  const [{ Physics }, { Unpin }, { mountFlower, flowerCues }] = await Promise.all([import('./physics.js'), import('./unpin.js'), import('./flower.js')]);
  let cues = null;
  P = Physics(k, { x: x0, onEnter: (i) => U.openIndex(i) });
  U = Unpin(k, P, {
    onOpen: (i, panel) => {
      // A tab's edge is tucked under the sheet, so its 「 」 goes round its label, where it can be seen.
      const wires = [...panel.querySelectorAll('.unpin-close, .dos-list a, .github-link, .dos-tab')].map((a) => wireLink(a, a.matches('.unpin-close') ? { on: 'host', gap: 5, gy: 4 } : a.matches('.dos-tab') ? { gap: 4, gy: 3 } : null));
      const f = document.activeElement;   // focus arrived before the pen was wired: hand it over again so 「 」 is drawn
      if (f && panel.contains(f)) { f.blur(); f.focus({ preventScroll: true }); }
      return () => wires.forEach((w) => w.destroy());   // the dossier is removed on landing; its marks go with it
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
  then.splice(0).forEach((fn) => fn());
}

/* ---- to and from a project's pages (FYProject in lib/shared/transitions-tab.js runs the moves; transitions.css names) ----
   The way in, at pageswap: the tabs you touched take .fy-vt-tabs and their card .fy-vt-card: the dossier's in your
   hand and the card above it, or, from a card's own link (Q8), the tabs peeking behind it and the card, pin and all.
   The way back, at pagereveal, where every engine has applied the sheets: the card of the project you came from
   (navigation.activation.from, else, on a fresh load, document.referrer; no storage) is brought into view. While a view transition
   carries the page's tabs back (html[data-vt=out]) its peek and the card are named, so the tabs tuck under it from
   the first frame, and its pin is out, pushed in once the move has landed; without one the card is simply pinned.
   A board back from the back/forward cache with its dossier out pins that card back at once first
   (FYProject has already taken off the names this page's pageswap put on). */
function moves(k) {
  let link = null, restored = false;   // restored: back from the back/forward cache (pageshow comes before pagereveal then)
  document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[href]'); if (a) link = a; }, true);
  addEventListener('pageshow', (e) => { restored = e.persisted; });
  addEventListener('pageswap', (e) => {
    const url = e.activation && e.activation.entry ? e.activation.entry.url : link && link.href;
    if (!link || link.href !== url || !window.FYProject || !FYProject.id(url)) return;
    const hand = link.closest('.unpin-layer'), slot = !hand && link.closest('.slot');
    const tabs = hand ? hand.querySelector('.dos-tabs') : slot && slot.querySelector('.dos-peek'), card = hand ? hand.querySelector('.unpin-card') : slot;
    if (!tabs || !card) return;
    tabs.classList.add('fy-vt-tabs'); card.classList.add('fy-vt-card');
    if (hand) { hand.querySelector('.dos').classList.add('fy-vt-sheet'); return; }   // the sheet over its tabs' tucked edges
    // a snapshot ignores the cork's clip, so the card takes it along: cut where the cork cuts it, across only
    const v = k.viewport.getBoundingClientRect(), r = slot.getBoundingClientRect(), cut = (d) => (d > 0 ? d.toFixed(1) : -200) + 'px';
    slot.style.clipPath = 'inset(-200px ' + cut(r.right - v.right) + ' -200px ' + cut(v.left - r.left) + ')';
  });
  // the card inside the cork: the board moves only if it isn't, to centre it, held to the track's ends
  function inView(s) {
    const vp = k.viewport, v = vp.getBoundingClientRect(), cs = getComputedStyle(vp), pad = parseFloat(cs.paddingLeft);
    const r = [s.el, s.peek].filter(Boolean).map((n) => n.getBoundingClientRect()), l = Math.min(...r.map((b) => b.left)) - v.left, e = Math.max(...r.map((b) => b.right)) - v.left;
    if (l >= 0 && e <= v.width) return;
    const x = v.left + pad - k.track.getBoundingClientRect().left, max = Math.max(0, k.track.offsetWidth + pad + parseFloat(cs.paddingRight) - vp.clientWidth);
    const to = Math.min(max, Math.max(0, x + (l + e - v.width) / 2));
    if (P) P.go(to, true); else { x0 = to; k.track.style.transform = 'translate3d(' + (-to).toFixed(2) + 'px,0,0)'; }
  }
  function back(e) {
    k.slots.forEach((s) => { s.el.style.clipPath = ''; });   // a board back from the back/forward cache: the cut goes
    // a restored board's referrer is the one it first loaded with, so without the Navigation API it says nothing
    const a = window.navigation && navigation.activation, id = window.FYProject && FYProject.id((a && a.from && a.from.url) || (restored ? '' : document.referrer));
    const i = k.slots.findIndex((s) => s.project.id === id), s = k.slots[i];
    if (!s) return;
    if (U) U.close(true);
    inView(s);
    if (!e || !e.viewTransition || document.documentElement.getAttribute('data-vt') !== 'out') return;
    if (s.peek) s.peek.classList.add('fy-vt-tabs');
    s.el.classList.add('fy-vt-card', 'unpinned');   // its pin is out, as while a card flies home: the pin hole shows
    s.pin.style.visibility = 'hidden';
    const landed = () => { s.el.classList.remove('fy-vt-card'); if (s.peek) s.peek.classList.remove('fy-vt-tabs'); wired(() => U.press(i)); };
    e.viewTransition.finished.then(landed, landed);
  }
  if ('onpagereveal' in window) addEventListener('pagereveal', back);
  return back;
}

// Building the board measures nothing, so it runs at once. What measures waits for the page's stylesheets
// (FY.styled): WebKit may run this module before they apply. The pen and site.js come after this module in the
// head, so first render never waits for their downloads; they have all run by DOMContentLoaded.
const projects = sortProjects(window.BUILDING_PROJECTS || []);
if (projects.length) {
  const k = build(document.querySelector('.board-host'), projects), back = moves(k);
  // The header ships the count as static text so it doesn't reflow at first paint; this keeps it true.
  document.querySelectorAll('[data-project-count]').forEach((n) => { n.textContent = 'on the board · ' + projects.length + ' 件'; });
  document.addEventListener('DOMContentLoaded', () => FY.styled(() => {
    if (!('onpagereveal' in window)) back(null);   // no pagereveal (Firefox): the card into view once the sheets are in
    requestAnimationFrame(() => setTimeout(() => wire(k)));
  }));
} else console.error('Building project index is missing or empty.');
