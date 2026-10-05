/* design/2026-10-essays/notes-main.js — the board's entry module for notes-reading.dc.html, in place of
   lib/reading/main.js. Production's modules run unchanged except the footnotes, which follow ?cand=:
   · today — production (lib/reading/pen-note.js + slip.js): ⌜ ⌟ on the inferred phrase, loop, arrow; phone slot slip
   · a — 只圈注号: loop + arrow, no ⌜ ⌟ (notes-pen.js); phone slot slip that never hides its ref (notes-slip.js)
   · b — 对行: no ink on the text; the slip comes level, one hover line under both numbers (notes-align.js); phone slip
         pulled out from under the ref's own line (notes-lineslip.js)
   · c — 有据才圈: A, plus ⌜ ⌟ only where quotation / title marks prove the span (notes-pen.js); phone as A, with the
         proven quotation as the slip's lemma (notes-slip.js)
   A small switch at the foot of the window flips candidates, keeping the essay, language and scroll. */
import { start } from '../../lib/reading/bus.js';
import { initHero } from '../../lib/reading/hero.js';
import { initRail } from '../../lib/reading/rail.js';
import { prepare } from '../../lib/reading/notes.js';
import { initPenNote } from '../../lib/reading/pen-note.js';
import { Slip } from '../../lib/reading/slip.js';
import { initStates } from '../../lib/reading/states.js';
import { initPen } from './notes-pen.js';
import { initAlign } from './notes-align.js';
import { ClearSlip } from './notes-slip.js';
import { LineSlip } from './notes-lineslip.js';

const CANDS = { today: 'today · 现状', a: 'A 只圈注号', b: 'B 对行', c: 'C 有据才圈' };
const q = new URLSearchParams(location.search), cand = CANDS[q.get('cand')] ? q.get('cand') : 'a';
document.documentElement.dataset.cand = cand;

start((ctx) => {
  initRail(ctx);
  initHero(ctx);
  const model = prepare(ctx);
  if (cand === 'today') initPenNote(ctx, model, Slip(ctx));
  else if (cand === 'b') initAlign(ctx, model, LineSlip(ctx));
  else initPen(ctx, model, ClearSlip(ctx, Slip(ctx), { lemma: cand === 'c' }), { corners: cand === 'c' ? 'proven' : 'none' });
  initStates();
  switcher();
  const y = parseFloat(q.get('y'));                    // a switch keeps the reader where they were
  if (y > 0) requestAnimationFrame(() => window.scrollTo(0, y));
});

function switcher() {
  const nav = document.createElement('nav');
  nav.className = 'nc-switch'; nav.setAttribute('aria-label', 'Design candidates · 方案');
  nav.innerHTML = '<span class="nc-k">notes 注释</span>' + Object.keys(CANDS).map((k) =>
    '<a href="#" data-c="' + k + '"' + (k === cand ? ' aria-current="true"' : '') + '>' + CANDS[k] + '</a>').join('');
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-c]'); if (!a) return;
    e.preventDefault();
    const u = new URL(location.href);
    u.searchParams.set('cand', a.dataset.c); u.searchParams.set('y', String(Math.round(scrollY)));
    location.href = u.toString();
  });
  document.body.appendChild(nav);
}
