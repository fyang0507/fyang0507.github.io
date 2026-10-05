/* design/2026-10-essays/notes-align.js — candidate B on the desktop margin: nothing is drawn on the words or across
   the text. Point at a ref (or at its slip) and the ref's number takes the pen's hover line (TierMark tier 1: coral,
   level, hung at baseline + max(3 px, 0.18 em)); keyboard focus gives it the pen's 「 」 instead. Then its slip comes level with the ref's
   line, its eyelet and number on the line's centre, 26 px clear of the text, and squares up on production's spring.
   The tie is the line itself: the number you point at and the note that answers it sit on one line. Let go: the line
   lifts and the slip drifts home to its tilt. (No mark on the slip's own number: an underline there would hang ~5 px
   over the citation's next line, against the pen's 10 px spacing rule.) Narrow screens: notes-lineslip.js. */
import { row, rel, hover, first, seen } from '../../lib/reading/notes.js';
import { Pull } from './notes-pull.js';

const EYE = { x: 11.5, y: 14.5 }, GUT = 26;   // eyelet centre in the slip's box · the slip lands 26 px clear of the text

export function initAlign(ctx, model, slip) {
  const pull = Pull(), marks = new Map();
  model.notes().forEach((note) => pull.tilt(note));
  const mark = (note) => { if (!marks.has(note)) marks.set(note, new TierMark(note.a, note.a)); return marks.get(note); };
  function level(note) {
    const B = note.body.getBoundingClientRect(), rw = rel(row(note.sup), B), mr = rel(note.mn.getBoundingClientRect(), B);
    const eye0 = { x: mr.left + EYE.x, y: mr.top + EYE.y };
    return { tx: note.body.clientWidth + GUT - mr.left, ty: Math.max(-320, Math.min(320, rw.cy - eye0.y)) };
  }
  function start(note) {
    const full = first('pen');
    seen('pen');
    if (!note.a.matches(':focus-visible')) mark(note).to(1, 'hover');   // keyboard focus is the 「 」 alone (states.js)
    note.mn.classList.add('on');
    // the number is noticed, then its note comes over to the line
    pull.hold(note, level(note), performance.now() + (Motion.reduced() ? 0 : full ? 200 : 90), full);
  }
  function stop(note) {
    note.mn.classList.remove('on');
    if (marks.has(note)) marks.get(note).to(0, 'hover');
    pull.drop(note);
  }

  const hov = hover(ctx, model, { on: start, off: stop, tap: slip.open });
  ctx.onLayout(() => pull.finishAll());
  Motion.onReduced(() => { hov.off(true); pull.finishAll(); });
}
