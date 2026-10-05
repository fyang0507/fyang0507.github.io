/* design/2026-10-essays/pn-kit.js — the end of an essay, round 2026-10 (this agent's files are pn-*). It runs inside
   the real Reading page, put there by pn-inject.js, and rebuilds nav.pn as one candidate:
     a  the shelf: a short stretch of Writing's shelf, the neighbours leaning into the gap this essay left
     b  in hand: the neighbours' front boards, the cover under the obi, as Writing holds a book
     c  the pencil line goes on: Reading's margin line carries on past its ✓ to the essays either side
   or puts production's back ("now"). Production is untouched: the page, its modules and the pen are the live ones;
   this only swaps the children of .pn once bus.js has written the essay in. window.PN.show('now' | 'a' | 'b' | 'c').
   The neighbours are production's: previous = the older essay, next = the newer (posts-index is newest first). */
import { clear } from './pn-util.js';
import { buildA } from './pn-a.js';
import { buildB } from './pn-b.js';
import { buildC } from './pn-c.js';

const html = document.documentElement;
const LIST = window.FY_POST_INDEX || [];
const WANT = new URLSearchParams(location.search).get('post');
const BUILD = { a: buildA, b: buildB, c: buildC };
let pn = null, original = null, cur = '';

function show(c) {
  if (!pn) { html.dataset.pnWant = c; return; }
  if (c === cur) return;
  clear();
  cur = c;
  html.dataset.pn = c;
  pn.className = 'pn' + (c === 'now' ? '' : ' pn-' + c);
  pn.innerHTML = '';
  if (c === 'now' || !BUILD[c]) { original.forEach((n) => pn.appendChild(n.cloneNode(true))); return; }
  const i = Math.max(0, LIST.findIndex((p) => p.id === WANT));
  BUILD[c](pn, { self: LIST[i], prev: LIST[i + 1] || null, next: i > 0 ? LIST[i - 1] : null, count: LIST.length });
}

// A's way back to all writing (pn-a-back.js): set it and rebuild A in place
function back(kind) { html.dataset.pnBack = kind; if (cur === 'a') { cur = ''; show('a'); } }

window.PN = { show, back, get current() { return cur; } };

(function wait() {
  const root = document.querySelector('[data-mount="reading"][data-ready]');
  if (!root || !window.Tier) { setTimeout(wait, 40); return; }
  pn = root.querySelector('.pn');
  original = [...pn.childNodes].map((n) => n.cloneNode(true));
  show(html.dataset.pnWant || 'now');
  html.dataset.pnReady = '1';
})();
