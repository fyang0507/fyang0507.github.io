/* c-shot/marks.js — the shot's timeline, its cues for the score, and the marks the pen draws into canvases:
   the margin rail (Reading's pencil margin, from the chapter's own geometry) and the written motto (the lockup's own
   stroke paths, in writing order). Strokes on the pen's easing; ticks and numbers step in on the hand's clock. */
const F = window.FILM;

export const T = {
  pin: 4.0, lift: 4.2, dossier: 5.75, tab: 7.2, chapter: 7.35, land: 8.45,
  rail: [9.25, 10.95], ink: [10.95, 11.2], loop: [11.2, 11.62],
  motto: [13.15, 13.95], seal: [14.12, 14.42]
};

const yOf = (d) => +d.split(/[\s,C]+/)[1];
const GUIDE_LEN = 828;

// The score's cue list: every visible action, on the picture's clock.
export const CUES = (() => {
  const c = [
    { t: 0, type: 'bed' },
    { t: 2.2, type: 'screen' },                 // the camera meets the laptop's screen
    { t: T.pin, type: 'pin' },
    { t: T.lift, type: 'lift', dur: 1.3 },
    { t: T.dossier, type: 'slide', dur: 1.1 },
    { t: T.tab, type: 'pull' },
    { t: T.tab + .1, type: 'whoosh', dur: 1.0 },
    { t: T.chapter, type: 'sheet', dur: 1.05 },
    { t: T.land, type: 'land' },
    { t: T.rail[0], type: 'pen', dur: T.rail[1] - T.rail[0], ease: 'pen' },
    { t: T.ink[0], type: 'pen', dur: T.ink[1] - T.ink[0], soft: 1 },
    { t: T.loop[0], type: 'pen', dur: T.loop[1] - T.loop[0], loop: 1 },
    { t: T.motto[0], type: 'pen', dur: T.motto[1] - T.motto[0], motto: 1 },
    { t: T.seal[0], type: 'stamp', k: 1 },
    { t: T.seal[1], type: 'stamp', k: .6 }
  ];
  return c;
})();
// Ticks land when the pen passes them; added once the rail's geometry is known.
export function tickCues(rail) {
  for (const d of rail.ticks) {
    const p = yOf(d) / GUIDE_LEN, t = T.rail[0] + inversePen(p) * (T.rail[1] - T.rail[0]);
    CUES.push({ t: +t.toFixed(3), type: 'tick' });
  }
}
function inversePen(p) { let lo = 0, hi = 1; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (F.ease.pen(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; }

export function drawRail(cv, t, R, box) {
  const ctx = cv.getContext('2d'), k = box.k;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  if (t < T.rail[0]) return;
  ctx.setTransform(k, 0, 0, k, k * (R.svg[0] - box.x), k * (R.svg[1] - box.y));
  const p = F.ease.pen(F.seg(t, T.rail[0], T.rail[1])), reach = p * GUIDE_LEN;
  F.stroke(ctx, R.guide[0], p, { w: 1.5, color: '#CFC1A9' });
  // each tick and its number step in as the pen passes (two held frames), numbers set in the utility face
  R.ticks.forEach((d, i) => {
    const y = yOf(d); if (reach < y) return;
    const tp = T.rail[0] + inversePen(y / GUIDE_LEN) * (T.rail[1] - T.rail[0]);
    const h = F.held(t - tp, 12);
    F.stroke(ctx, d, F.clamp(h / (2 / 12)), { w: 1.3, color: '#736A5D' });
    const lab = R.labs[i];
    if (lab && h >= 1 / 12) F.text(ctx, lab[0], lab[1] - R.svg[0] + lab[3], lab[2] - R.svg[1] + 11.5, '400 11px "IBM Plex Mono"', i === 0 ? '#33302B' : '#736A5D', { align: 'right' });
  });
  if (p >= 1) F.stroke(ctx, R.end[0], F.held(F.seg(t, T.rail[1], T.rail[1] + .25), 12), { w: 1.3, color: '#736A5D' });
  // the graphite: where the reader is (the top of the chapter, at 01)
  const ik = F.ease.pen(F.seg(t, T.ink[0], T.ink[1]));
  if (ik > 0) { ctx.save(); ctx.beginPath(); ctx.rect(120, -2, 20, yOf(R.ticks[0]) * ik + 2); ctx.clip(); F.stroke(ctx, R.guide[0], 1, { w: 2, color: '#6D6559' }); ctx.restore(); }
  // the pen's wheat loop around the current number
  const lk = F.ease.pen(F.seg(t, T.loop[0], T.loop[1]));
  if (lk > 0) {
    const L = R.labs[0], x = L[1] - R.svg[0], y = L[2] - R.svg[1];
    ctx.save(); ctx.translate(x, y); F.stroke(ctx, window.Pen.loop(L[3], L[4], 'rail 01', { pad: 5 }), lk, { w: 1.8, color: '#AD9650' }); ctx.restore();
  }
}

export function drawTag(cv, t, paths) {
  const ctx = cv.getContext('2d'), k = cv.width / 168;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
  if (t < T.motto[0]) return;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  F.strokes(ctx, paths, F.seg(t, T.motto[0], T.motto[1]), { w: 1.45, color: '#33302B', gap: 4 });
}

// Contact tone: countable dots, one size, where a sheet lies on another. Never a gradient.
export function dots(w, h) {
  const cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2;
  const ctx = cv.getContext('2d'); ctx.fillStyle = '#6D6559';
  const pitch = 12, r = 2.1;
  for (let y = pitch / 2, j = 0; y < cv.height; y += pitch * .866, j++) {
    for (let x = (j % 2 ? pitch / 2 : 0) + pitch / 2; x < cv.width; x += pitch) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  return cv;
}
