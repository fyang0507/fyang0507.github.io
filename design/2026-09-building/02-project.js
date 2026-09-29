/* design/2026-09-building · the project pages (Fred Agent chapters, the NJJoe casebook). Render-blocking, like the board:
   · the cover card is the board's own card (production cards.js builds it), laid out at its board size and scaled
     down, so the card that travels between the board and the page is one card at one size (A lands it here; B pins it
     on the cork strip; C clips it to the dossier)
   · the chapter nav, the back links and the page's links get the pen's states (Tier.wire): hover coral underline,
     focus coral 「 」, the current chapter the wheat band
   · A keeps the in-place chapter swap (fred-agent.js's, rebuilt small): the card and the chapter strip stay, the next
     chapter is fetched, swapped in and printed under the strip in a same-document view transition. B and C navigate. */
import { build } from '../../lib/building/cards.js';
import { mountFlower } from '../../lib/building/flower.js';
import { initRail } from './03-rail.js';
import { initMap } from './04-map.js';

const html = document.documentElement, c = html.dataset.c, id = html.dataset.project;
const SCALE = { a: [0.5, 0.46], b: [0.3, 0.34], c: [0.3, 0.3] };

function cover() {
  const host = document.querySelector('.pj-cover'), p = (window.BUILDING_PROJECTS || []).find((x) => x.id === id);
  if (!host || !p) return;
  const tmp = document.createElement('div'), frame = document.createElement('div');
  frame.className = 'pj-cover-frame';
  host.appendChild(frame);
  frame.appendChild(tmp);
  const k = build(tmp, [p]), slot = k.slots[0];
  frame.appendChild(slot.el);
  tmp.remove();
  slot.swing.classList.add('pj-cover-card');
  slot.swing.querySelectorAll('a,button').forEach((n) => { n.tabIndex = -1; });
  slot.swing.inert = true;
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', p.title + ': the card from the Building board');
  const paper = slot.swing.querySelector('.paper--lead');
  if (paper) mountFlower(paper, { phys: { press() {} }, index: 0, hidden: false });
  const fit = () => {
    const s = SCALE[c][innerWidth <= 640 ? 1 : 0], w = slot.el.offsetWidth, h = slot.swing.offsetHeight;
    frame.style.transform = 'scale(' + s + ')';
    host.style.width = Math.round(w * s) + 'px'; host.style.height = Math.round(h * s) + 'px';
  };
  fit();
  new ResizeObserver(fit).observe(slot.swing);
  addEventListener('resize', fit);
}

function pen(root) {
  root.querySelectorAll('.pj-strip a').forEach((a) => {
    if (a.hasAttribute('data-pen-tier')) return;
    Tier.wire(a, { target: '.pen-t', chosen: () => a.getAttribute('aria-current') === 'page', focus: { on: 'host', gap: 4, gy: 3 } });
  });
  root.querySelectorAll('.pj-back, .pj-pagenav a, .pj-go, .pj-route, .pj-link').forEach((a) => {
    if (a.hasAttribute('data-pen-tier') || a.closest('.pj-strip')) return;
    const t = a.querySelector('.pen-t');
    if (t) Tier.wire(a, { target: t, focus: { on: 'host', gap: 4, gy: 3 } });
  });
}

/* ---- A · the in-place chapter swap ---- */
const cache = new Map();
function swapTo(url, push) {
  const key = url.pathname + url.search;
  const get = cache.has(key) ? Promise.resolve(cache.get(key)) : fetch(url.href).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); }).then((t) => { cache.set(key, t); return t; });
  return get.then((text) => {
    const doc = new DOMParser().parseFromString(text, 'text/html'), next = doc.querySelector('.pj-main'), head = doc.querySelector('.pj-sheethead');
    if (!next || !head) throw new Error('no chapter');
    const strip = document.querySelector('.pj-strip'), stuck = strip.getBoundingClientRect().top <= 1 && scrollY > 0;
    const top = strip.offsetTop;
    const run = () => {
      document.querySelector('.pj-main').replaceWith(document.importNode(next, true));
      document.querySelector('.pj-sheethead').replaceWith(document.importNode(head, true));
      document.title = doc.title;
      html.dataset.chapter = doc.documentElement.dataset.chapter;
      const file = url.pathname.split('/').pop();
      strip.querySelectorAll('a').forEach((a) => { const on = a.getAttribute('href').split('?')[0].replace('./', '') === file; if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      strip.querySelectorAll('a[data-pen-tier]').forEach((a) => a.dispatchEvent(new Event('blur')));
      if (push) history.pushState({ bd: 1 }, '', url.href);
      scrollTo(0, stuck ? top : 0);
      if (window.BD) BD.carry();
      pen(document);
      document.dispatchEvent(new CustomEvent('bd:chapter'));
    };
    if (!document.startViewTransition || (window.BD && BD.reduced())) { run(); refreshBands(); return; }
    html.classList.add('bd-swap');
    const vt = document.startViewTransition(run);
    vt.ready.then(() => { const b = strip.getBoundingClientRect().bottom; window.BDVT.printUnder(b); }, () => {});
    vt.finished.finally(() => { html.classList.remove('bd-swap'); refreshBands(); });
  });
}
function refreshBands() { document.querySelectorAll('.pj-strip a[data-pen-tier]').forEach((a) => { a.dispatchEvent(new PointerEvent('pointerleave')); }); }
if (c === 'a') {
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('.pj-strip a, .pj-route, .pj-pagenav a');
    if (!a || a.hasAttribute('data-live') || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const url = new URL(a.href, location.href), f = url.pathname.split('/').pop();
    if (!/^0[2-5]-/.test(f) || url.pathname === location.pathname) return;
    const here = document.documentElement.dataset.project;
    if (!(f === '05-njjoe.html' ? here === 'njjoe' : here === 'fred-agent')) return;
    e.preventDefault();
    swapTo(url, true).catch(() => { location.href = url.href; });
  });
  addEventListener('popstate', () => { swapTo(new URL(location.href), false).catch(() => location.reload()); });
}

cover();
// the pen's coral is drawn as each paper shows it: A's strip is the card's wash
const strip = document.querySelector('.pj-strip');
if (strip) strip.dataset.paper = c === 'a' && id === 'fred-agent' ? 'wheat' : 'cream';
window.BD_PAGE = { role: 'project', swap(rec) { rec.id = id; } };
const maps = () => document.querySelectorAll('[data-system-map]').forEach((m) => initMap(m, c));
const wirePen = () => { maps(); pen(document); };
if (window.Tier) wirePen(); else document.addEventListener('DOMContentLoaded', wirePen);

// the principles' margin: stuck under whatever of the page sticks to the top (A's strip; B's and C's on phones)
let rail = null;
const railHead = () => { const s = document.querySelector('.pj-strip'); return s && getComputedStyle(s).position === 'sticky' && (c === 'a' || innerWidth <= 760) ? s.offsetHeight : 0; };
function mountRail() {
  if (rail) { rail.destroy(); rail = null; }
  if (document.querySelector('.rail-col')) rail = initRail(document.querySelector('.pj-main'), { strip: () => document.querySelector('.pj-strip'), head: railHead });
  if (!rail) document.documentElement.classList.remove('rail-mode', 'strip-mode', 'strip-on');
}
mountRail();
document.addEventListener('bd:chapter', () => { mountRail(); maps(); });
