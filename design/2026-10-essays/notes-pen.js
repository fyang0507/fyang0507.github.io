/* design/2026-10-essays/notes-pen.js — candidates A and C on the desktop margin. Production's gesture
   (lib/reading/pen-note.js) without the inferred phrase: notes.js's phrase() is never called.
   · A, corners 'none': the pen loops the number and, without lifting, flings the arrow level through the leading
     into the gutter; as its point lands the slip is pulled there by its eyelet. Nothing is drawn on the words.
   · C, corners 'proven': the same, and only where the author's own quotation or title marks close right before
     the ref (notes-proven.js) the pen first sets ⌜ at the opening mark and ⌟ at the closing one, as production
     does on its inferred phrase. Everywhere else C is A.
   The slip's physics (notes-pull.js), the first-reveal / repeat timing and reduced motion are production's. */
import { NS, metrics, row, rel, hover, first, seen } from '../../lib/reading/notes.js';
import { proven } from './notes-proven.js';
import { Pull } from './notes-pull.js';

const EYE = { x: 11.5, y: 14.5 }, GUT = 26;   // eyelet centre in the slip's box · the slip lands 26 px clear of the text

export function initPen(ctx, model, slip, opt) {
  const ink = new Map();                        // note → its <g> of strokes while drawn
  const pull = Pull({ onFinish: (note) => { const g = ink.get(note); if (g) { g.remove(); ink.delete(note); } } });
  model.notes().forEach((note) => { pull.tilt(note); note.proof = opt.corners === 'proven' ? proven(note.sup) : null; });

  function geom(note) {
    const body = note.body, B = body.getBoundingClientRect(), m = metrics(body), gh = m.fs;
    const ra = rel(note.a.getBoundingClientRect(), B), rw = rel(row(note.sup), B), mr = rel(note.mn.getBoundingClientRect(), B);
    const r = Pen.rng('pa-g-' + note.key), jit = (a) => (r() - .5) * a;
    const colR = body.clientWidth, yRun = rw.cy - gh * .5 - Math.min(6, (m.lh - m.fs) * .36);
    const eye0 = { x: mr.left + EYE.x, y: mr.top + EYE.y };
    const tx = colR + GUT - mr.left, ty = Math.max(-320, Math.min(320, yRun - eye0.y)), E = { x: eye0.x + tx, y: eye0.y + ty };
    // C only: ⌜ ⌟ on the proven quotation, drawn exactly as production draws them on its phrase
    const rects = note.proof ? [].filter.call(note.proof.range.getClientRects(), (q) => q.width > 1) : [];
    let open = null, close = [];
    if (rects.length) {
      const f = rel(rects[0], B), l = rel(rects[rects.length - 1], B), fTop = f.cy - gh * .56, x0 = f.left - 3;
      open = [[x0 + 10, fTop - 1.5 + jit(1)], [x0 + jit(.6), fTop], [x0 - .8, fTop + gh * .78]];
      const lBot = l.cy + gh * .5, xe = l.right + 1;
      close = [[xe - 9, lBot + 2 + jit(1)], [xe, lBot + 1.5], [xe + 1.5, lBot - gh * .3]];
    }
    const cx = ra.cx, cy = ra.cy, rx = ra.width / 2 + 5, ry = ra.height / 2 + 4, loop = [], a0 = 150, a1 = 655;
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, a = (a0 + (a1 - a0) * t) * Math.PI / 180, grow = 1 + (t - .5) * .08;
      loop.push([cx + Math.cos(a) * rx * grow, cy + Math.sin(a) * ry * grow]);
    }
    const T = [E.x - 5.5, E.y], xs = loop[loop.length - 1][0];              // the point touches the eyelet's rim
    const shaft = [[xs + 9, yRun + 1], [xs + (colR - xs) * .5, yRun + jit(1.6)], [colR + 6, yRun + (T[1] - yRun) * .12]];
    if (Math.abs(T[1] - yRun) > 30) shaft.push([colR + 14, yRun + (T[1] - yRun) * .6]);
    shaft.push(T);
    const pts = close.concat(loop, shaft), n1 = close.length, n2 = n1 + loop.length;
    const len = (p) => { let s = 0; for (let k = 1; k < p.length; k++) s += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]); return s; };
    const pa = shaft[shaft.length - 2], ang = Math.atan2(T[1] - pa[1], T[0] - pa[0]), hl = 9;
    const head = 'M' + (T[0] - Math.cos(ang - .5) * hl).toFixed(1) + ' ' + (T[1] - Math.sin(ang - .5) * hl).toFixed(1) + ' L' + T[0].toFixed(1) + ' ' + T[1].toFixed(1) +
      ' L' + (T[0] - Math.cos(ang + .5) * hl * .85).toFixed(1) + ' ' + (T[1] - Math.sin(ang + .5) * hl * .85).toFixed(1);
    return { tx: tx, ty: ty, open: open && Pen.smooth(open), main: Pen.smooth(pts), head: head,
      split: [n1 ? len(pts.slice(0, n1 + 1)) : 0, len(pts.slice(n1, n2 + 1)), len(pts.slice(n2))] };
  }
  // the loop is careful, the arrow is flung (the last part of the ink goes down in ~45% of the time);
  // with corners the ⌟ comes first, as in production
  function drawMain(p, split, dur, delay) {
    const L = p.getTotalLength(), H = Pen.hiddenAt(p, L), tot = split[0] + split[1] + split[2], f1 = split[0] / tot, f2 = (split[0] + split[1]) / tot;
    p.style.strokeDasharray = Pen.dashes(p, L);
    if (Motion.reduced()) { p.style.strokeDashoffset = 0; return; }
    const k = split[0] ? [{ strokeDashoffset: H, offset: 0, easing: 'cubic-bezier(.5,0,.8,.6)' }, { strokeDashoffset: H * (1 - f1), offset: .15, easing: 'linear' }]
      : [{ strokeDashoffset: H, offset: 0, easing: 'linear' }];
    k.push({ strokeDashoffset: H * (1 - f2), offset: split[0] ? .6 : .55, easing: 'cubic-bezier(.25,.0,.15,1)' }, { strokeDashoffset: 0, offset: 1 });
    p.animate(k, { duration: dur, delay: delay, fill: 'both' });
  }

  function start(note) {
    const full = first('pen'); seen('pen');
    const old = ink.get(note); if (old) old.remove();
    const g = geom(note), grp = document.createElementNS(NS, 'g');
    grp.setAttribute('class', 'pa-g'); note.body.querySelector('.fn-wire').appendChild(grp); ink.set(note, grp);
    const pMain = Pen.path(g.main, { width: 1.7 }), pHead = Pen.path(g.head, { width: 1.7 }), pOpen = g.open ? Pen.path(g.open, { width: 1.7 }) : null;
    grp.paths = [pHead, pMain].concat(pOpen ? [pOpen] : []);
    grp.paths.forEach((p) => { grp.appendChild(p); const L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L); });
    // with corners: production's timing (pen down on ⌜, lift, one stroke); without: one stroke from the loop
    const T = pOpen ? (full ? { main: 100, dur: 430, head: 510, go: 510 } : { main: 0, dur: 250, head: 235, go: 215 })
      : (full ? { main: 0, dur: 360, head: 345, go: 345 } : { main: 0, dur: 210, head: 195, go: 180 });
    if (pOpen) Pen.draw(pOpen, { duration: full ? 90 : 110 });
    drawMain(pMain, g.split, T.dur, T.main);
    Pen.draw(pHead, { duration: full ? 70 : 50, delay: T.head });
    note.mn.classList.add('on');
    pull.hold(note, g, performance.now() + T.go, full);
  }
  function stop(note) {
    note.mn.classList.remove('on');
    const grp = ink.get(note);
    if (grp) { ink.delete(note); grp.paths.forEach((p) => Pen.erase(p, { duration: 140 })); setTimeout(() => grp.remove(), Motion.reduced() ? 0 : 170); }
    pull.drop(note);
  }

  const hov = hover(ctx, model, { on: start, off: stop, tap: slip.open });
  ctx.onLayout(() => pull.finishAll());
  Motion.onReduced(() => { hov.off(true); pull.finishAll(); });
}
