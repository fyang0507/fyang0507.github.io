/* lib/reading/pen-note.js — the annotator's pen, arriving at the slip. Hand's clock for the ink, physics for the paper.
   At rest every margin note is a slip with a punched eyelet. Pointing at a ref plays one gesture: a loop round the
   number and, without lifting, an arrow flung level through the leading into the margin. Nothing is drawn on the
   words: the source never says whether a note is about a word, a quotation or the whole sentence, so the pen marks
   only what is certain, the ref itself. The arrow does the work of a thread: its point stops at the rim of the spot
   where the slip's eyelet will rest, and as the point lands the slip is pulled there. It pivots on its eyelet
   (transform-origin), its trailing edge lags the pull, and it squares up to the text with one small overshoot.
   Let go: the ink lifts faster than it went down and the slip drifts home to its tilt. Keyboard focus adds the pen's
   「 」 around the number. First reveal: one stroke (~0.36 s), slip still by ~1 s; every later one: one quick stroke
   and a stiffer spring, still by ~0.6 s. Narrow screens get the slip from the slot (slip.js).
   Reduced motion: the marks are simply there and the slip is already at the arrow's tip. The arrowhead is drawn
   here, not with Pen.glyph. Ported from design/2026-09-motion r3-08b-note.js; the ⌜ ⌟ it drew on a guessed phrase
   were dropped in design/2026-10-essays (notes round 1, candidate A). */
import { NS, metrics, row, rel, hover, first, seen } from './notes.js';

const EYE = { x: 11.5, y: 14.5 }, GUT = 26;   // eyelet centre in the slip's box (its pivot) · the slip lands 26px clear of the text

export function initPenNote(ctx, model, slip) {
  model.notes().forEach((note) => {
    const r = Pen.rng('ta-tilt-' + note.key);        // each slip rests at its own seeded tilt, ±2°
    note.r0 = (r() - .5) * 4;
    note.inr = note.mn.querySelector('.mn-in');
    note.inr.style.transform = 'rotate(' + note.r0.toFixed(2) + 'deg)';
  });

  /* ---- the gesture, with the arrow's point at the eyelet's resting place ---- */
  function geom(note) {
    const body = note.body, B = body.getBoundingClientRect(), m = metrics(body), gh = m.fs;
    const ra = rel(note.a.getBoundingClientRect(), B), rw = rel(row(note.sup, note.a), B), mr = rel(note.mn.getBoundingClientRect(), B);
    const r = Pen.rng('pa-g-' + note.key), jit = (a) => (r() - .5) * a;
    const colR = body.clientWidth, yRun = rw.cy - gh * .5 - Math.min(6, (m.lh - m.fs) * .36);
    // the slip is pulled out across the gutter and up (or down) to the ref's leading; its eyelet ends at E
    const eye0 = { x: mr.left + EYE.x, y: mr.top + EYE.y };
    const tx = colR + GUT - mr.left, ty = Math.max(-320, Math.min(320, yRun - eye0.y)), E = { x: eye0.x + tx, y: eye0.y + ty };
    const cx = ra.cx, cy = ra.cy, rx = ra.width / 2 + 5, ry = ra.height / 2 + 4, loop = [], a0 = 150, a1 = 655;
    for (let i = 0; i <= 24; i++) {
      const t = i / 24, a = (a0 + (a1 - a0) * t) * Math.PI / 180, grow = 1 + (t - .5) * .08;
      loop.push([cx + Math.cos(a) * rx * grow, cy + Math.sin(a) * ry * grow]);
    }
    const T = [E.x - 5.5, E.y], xs = loop[loop.length - 1][0];              // the point touches the eyelet's rim
    const shaft = [[xs + 9, yRun + 1], [xs + (colR - xs) * .5, yRun + jit(1.6)], [colR + 6, yRun + (T[1] - yRun) * .12]];
    if (Math.abs(T[1] - yRun) > 30) shaft.push([colR + 14, yRun + (T[1] - yRun) * .6]);   // only when the slip could not reach the line
    shaft.push(T);
    const pts = loop.concat(shaft), n = loop.length;
    const len = (p) => { let s = 0; for (let k = 1; k < p.length; k++) s += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]); return s; };
    const pa = shaft[shaft.length - 2], ang = Math.atan2(T[1] - pa[1], T[0] - pa[0]), hl = 9;
    const head = 'M' + (T[0] - Math.cos(ang - .5) * hl).toFixed(1) + ' ' + (T[1] - Math.sin(ang - .5) * hl).toFixed(1) + ' L' + T[0].toFixed(1) + ' ' + T[1].toFixed(1) +
      ' L' + (T[0] - Math.cos(ang + .5) * hl * .85).toFixed(1) + ' ' + (T[1] - Math.sin(ang + .5) * hl * .85).toFixed(1);
    return { tx: tx, ty: ty, main: Pen.smooth(pts), head: head, split: [len(pts.slice(0, n)), len(pts.slice(n - 1))] };
  }
  function drawMain(p, split, dur) {
    const L = p.getTotalLength(), H = Pen.hiddenAt(p, L), f = split[0] / (split[0] + split[1]);
    p.style.strokeDasharray = Pen.dashes(p, L);
    if (Motion.reduced()) { p.style.strokeDashoffset = 0; return; }
    // the loop is careful, the arrow is flung: the last part of the ink goes down in ~45% of the time
    p.animate([{ strokeDashoffset: H, offset: 0, easing: 'linear' }, { strokeDashoffset: H * (1 - f), offset: .55, easing: 'cubic-bezier(.25,.0,.15,1)' },
      { strokeDashoffset: 0, offset: 1 }], { duration: dur, fill: 'both' });
  }

  /* ---- the slip on the physics clock, anchored to the arrow's point ---- */
  const live = [];
  const loop = Motion.Loop(tick);
  const stateOf = (note) => live.filter((s) => s.note === note)[0];
  function start(note) {
    const full = first('pen'); seen('pen');
    let st = stateOf(note);
    if (!st) { st = { note: note, x: 0, vx: 0, y: 0, vy: 0, r: 0, vr: 0, z: 1, vz: 0 }; live.push(st); }
    clearInk(st);
    const g = st.g = geom(note), grp = document.createElementNS(NS, 'g');
    grp.setAttribute('class', 'pa-g'); note.body.querySelector('.fn-wire').appendChild(grp);
    const pMain = Pen.path(g.main, { width: 1.7 }), pHead = Pen.path(g.head, { width: 1.7 });
    [pMain, pHead].forEach((p) => { grp.appendChild(p); const L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L); });
    st.grp = grp; st.paths = [pHead, pMain];
    const T = full ? { dur: 360, head: 345, go: 345 } : { dur: 210, head: 195, go: 180 };   // go: as the point lands
    drawMain(pMain, g.split, T.dur);
    Pen.draw(pHead, { duration: full ? 70 : 50, delay: T.head });
    note.mn.classList.add('on');
    st.full = full; st.phase = 'wait'; st.goAt = performance.now() + T.go;
    if (Motion.reduced()) { st.x = g.tx; st.y = g.ty; st.r = -note.r0; st.z = 1; st.phase = 'held'; render(st); return; }
    loop.kick();
  }
  function stop(note) {
    const st = stateOf(note); if (!st) return;
    note.mn.classList.remove('on');
    const grp = st.grp; st.grp = null;
    if (grp) { st.paths.forEach((p) => Pen.erase(p, { duration: 140 })); setTimeout(() => grp.remove(), Motion.reduced() ? 0 : 170); }
    if (Motion.reduced()) { finish(st); return; }
    st.phase = 'out'; loop.kick();
  }
  function clearInk(st) { if (st.grp) { st.grp.remove(); st.grp = null; } }
  function finish(st) {
    clearInk(st);
    st.note.inr.style.transform = 'rotate(' + st.note.r0.toFixed(2) + 'deg)';
    live.splice(live.indexOf(st), 1);
  }
  function sp(s, key, vkey, target, k, c, dt) { s[vkey] += (-k * (s[key] - target) - c * s[vkey]) * dt; s[key] += s[vkey] * dt; }
  function still(s, key, vkey, target, e) { return Math.abs(s[key] - target) < e && Math.abs(s[vkey]) < e * 8; }
  function home(st, dt) {
    for (let j = 0; j < 4; j++) {
      const e = dt / 4;
      sp(st, 'x', 'vx', 0, 150, 17, e); sp(st, 'y', 'vy', 0, 150, 17, e);
      sp(st, 'r', 'vr', Math.max(-5, Math.min(5, st.vy * .01)), 200, 20, e); sp(st, 'z', 'vz', 1, 200, 24, e);
    }
    render(st);
  }
  function step(st, now, dt) {
    const g = st.g, n = st.note;
    if (st.phase === 'wait') {
      if (now < st.goAt) { if (!still(st, 'x', 'vx', 0, .3) || !still(st, 'r', 'vr', 0, .05)) home(st, dt); return true; }   // re-pointed while going home
      st.phase = 'in';                            // the point lands: the slip is jerked by its eyelet and swings about it
      st.vr += st.full ? -120 : -60; st.vz += st.full ? 1.1 : .5;
    }
    if (st.phase === 'in') {
      const kx = st.full ? [240, 22] : [520, 38], kr = st.full ? [300, 16] : [420, 30];
      for (let i = 0; i < 4; i++) {
        const d = dt / 4;
        sp(st, 'x', 'vx', g.tx, kx[0], kx[1], d);
        sp(st, 'y', 'vy', g.ty, kx[0], kx[1], d);
        const lag = Math.max(-7, Math.min(7, -st.vy * .016 + st.vx * .004));   // the trailing edge lags the pull
        sp(st, 'r', 'vr', -n.r0 + lag, kr[0], kr[1], d);                        // and squares up to the text
        sp(st, 'z', 'vz', 1.035, 260, 22, d);                                    // held off the page while the arrow holds it
      }
      render(st);
      return !(still(st, 'x', 'vx', g.tx, .3) && still(st, 'y', 'vy', g.ty, .3) && still(st, 'r', 'vr', -n.r0, .05) && still(st, 'z', 'vz', 1.035, .002));
    }
    if (st.phase === 'out') {                     // released: it drifts home to its tilt
      home(st, dt);
      if (still(st, 'x', 'vx', 0, .3) && still(st, 'y', 'vy', 0, .3) && still(st, 'r', 'vr', 0, .05)) { finish(st); return false; }
      return true;
    }
    return false;
  }
  function render(st) {
    const n = st.note;
    n.inr.style.transform = 'translate(' + st.x.toFixed(2) + 'px,' + st.y.toFixed(2) + 'px) rotate(' + (n.r0 + st.r).toFixed(2) + 'deg) scale(' + st.z.toFixed(4) + ')';
  }
  function tick(dt) {
    const now = performance.now();
    let busy = false;
    live.slice().forEach((st) => { if (step(st, now, Math.min(dt, .032))) busy = true; });
    return busy;
  }

  const hov = hover(ctx, model, { on: start, off: stop, tap: slip.open });
  ctx.onLayout(() => live.slice().forEach(finish));
  Motion.onReduced(() => { hov.off(true); live.slice().forEach(finish); });
}
