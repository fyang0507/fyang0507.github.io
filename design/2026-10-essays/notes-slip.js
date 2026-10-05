/* design/2026-10-essays/notes-slip.js — the phone slip for candidates A and C: production's slip (lib/reading/slip.js:
   pulled up out of a slot cut near the foot of the window, the pen's loop on the ref) with two additions.
   · Both: a slip must never hide its own ref. When the ref's line would end up under the slip, the page first glides
     up just enough that the line rests 14 px above the slip's top edge. (Today a ref in the lower ~40% of the window
     disappears under its note, loop and all.)
   · C (lemma): when punctuation proves the span (notes-proven.js), the slip opens with that quotation above the
     citation, the way a critical edition keys a note to its lemma. Otherwise the slip is production's.
   ClearSlip(ctx, slip, { lemma }) → { open(note), close(v), note() }. */
import { row, esc } from '../../lib/reading/notes.js';
import { proven } from './notes-proven.js';

const LIP = 26, TUCK = 16, GAP = 14;   // the page's lip under the slot · how far the open slip stays tucked · clearance

export function ClearSlip(ctx, slip, opt) {
  const el = document.querySelector('.fs-slip'), views = new Map();
  // the note as the slip shows it: C prefixes the proven quotation (one object per note, so the slip's own
  // "same note again / another note" tests still hold)
  function view(note) {
    if (!opt.lemma) return note;
    if (!views.has(note)) {
      const p = proven(note.sup);
      views.set(note, p ? Object.assign(Object.create(note), { html: '<span class="fs-lemma">' + esc(p.text) + '</span>' + note.html }) : note);
    }
    return views.get(note);
  }
  function open(note) {
    slip.open(view(note));
    const top = innerHeight - LIP - el.offsetHeight + TUCK, over = row(note.sup).bottom - (top - GAP);
    if (over > 0) ctx.scrollTo(ctx.y() + over);
  }
  return { open: open, close: slip.close, note: slip.note };
}
