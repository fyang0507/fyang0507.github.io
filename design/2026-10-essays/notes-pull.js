/* design/2026-10-essays/notes-pull.js — the margin slip on the physics clock, shared by candidates A, B and C:
   production's spring (lib/reading/pen-note.js) lifted out unchanged. The slip pivots on its eyelet, its trailing
   edge lags the pull, it squares up to the text with one small overshoot and is held a hair off the page; let go,
   it drifts home to its seeded tilt.
   Pull({ onFinish }) → { tilt(note), hold(note, g, goAt, full), drop(note), finishAll() }: hold pulls the slip
   by (g.tx, g.ty) once performance.now() passes goAt; onFinish(note) runs when a released slip is home. */
export function Pull(o) {
  const live = [], loop = Motion.Loop(tick);
  const stateOf = (note) => live.filter((s) => s.note === note)[0];
  function tilt(note) {
    const r = Pen.rng('ta-tilt-' + note.key);        // each slip rests at its own seeded tilt, ±2°
    note.r0 = (r() - .5) * 4;
    note.inr = note.mn.querySelector('.mn-in');
    note.inr.style.transform = 'rotate(' + note.r0.toFixed(2) + 'deg)';
  }
  function hold(note, g, goAt, full) {
    let st = stateOf(note);
    if (!st) { st = { note: note, x: 0, vx: 0, y: 0, vy: 0, r: 0, vr: 0, z: 1, vz: 0 }; live.push(st); }
    st.g = g; st.full = full; st.phase = 'wait'; st.goAt = goAt;
    if (Motion.reduced()) { st.x = g.tx; st.y = g.ty; st.r = -note.r0; st.z = 1; st.phase = 'held'; render(st); return; }
    loop.kick();
  }
  function drop(note) {
    const st = stateOf(note); if (!st) return;
    if (Motion.reduced()) { finish(st); return; }
    st.phase = 'out'; loop.kick();
  }
  function finish(st) {
    st.note.inr.style.transform = 'rotate(' + st.note.r0.toFixed(2) + 'deg)';
    live.splice(live.indexOf(st), 1);
    if (o && o.onFinish) o.onFinish(st.note);
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
      if (now < st.goAt) { if (!still(st, 'x', 'vx', 0, .3) || !still(st, 'r', 'vr', 0, .05)) home(st, dt); return true; }
      st.phase = 'in';                              // jerked by its eyelet, it swings about it
      st.vr += st.full ? -120 : -60; st.vz += st.full ? 1.1 : .5;
    }
    if (st.phase === 'in') {
      const kx = st.full ? [240, 22] : [520, 38], kr = st.full ? [300, 16] : [420, 30];
      for (let i = 0; i < 4; i++) {
        const d = dt / 4;
        sp(st, 'x', 'vx', g.tx, kx[0], kx[1], d);
        sp(st, 'y', 'vy', g.ty, kx[0], kx[1], d);
        const lag = Math.max(-7, Math.min(7, -st.vy * .016 + st.vx * .004));
        sp(st, 'r', 'vr', -n.r0 + lag, kr[0], kr[1], d);
        sp(st, 'z', 'vz', 1.035, 260, 22, d);
      }
      render(st);
      return !(still(st, 'x', 'vx', g.tx, .3) && still(st, 'y', 'vy', g.ty, .3) && still(st, 'r', 'vr', -n.r0, .05) && still(st, 'z', 'vz', 1.035, .002));
    }
    if (st.phase === 'out') {
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
  return { tilt: tilt, hold: hold, drop: drop, finishAll: () => live.slice().forEach(finish) };
}
