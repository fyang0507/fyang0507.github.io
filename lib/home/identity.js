/* Home · the identity's arrival (design/2026-09-identity, candidate B: the written inscription and two seals).
   One cause: the end of a first visit's OP (opx:done, mode first, not skipped). The OP covers the page, so before it
   ends the inscription is taken off the paper and the seals lifted; then the site's pen writes the inscription in
   stroke order, and the two seals land on held frames (Motion.held, 12 fps) with two frames of impact ticks, the way
   the corkboard's pin is pressed. A skipped OP, a returning visit, an arrival through a view transition and reduced
   motion all get the identity at rest; reduced motion turning on mid-arrival lands it. The drawing is the static SVG
   in the header: this module only moves it. arrive(link) is exported for the design board. With ?opx=1, FY_ID.seek(ms)
   poses the arrival on a clock, so scripts/verify/home-seq.mjs can hand it to the flash audit. */
const NS = 'http://www.w3.org/2000/svg', TICK = 1000 / 12, PEN = 1.45;
const html = document.documentElement;
let live = [];

const strokes = (a) => [...a.querySelectorAll('.site-identity-tag path')];
const seals = (a) => [...a.querySelectorAll('.site-identity-seal')];
function clear(a) {
  live.forEach((x) => x.cancel()); live = [];
  strokes(a).forEach((p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
  seals(a).forEach((g) => { g.style.opacity = ''; });
  a.querySelectorAll('.site-identity-ticks').forEach((t) => t.remove());
}
function cover(a) {
  clear(a);
  strokes(a).forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 2 * PEN + 8); p.style.strokeDashoffset = L + PEN + 1; });
  seals(a).forEach((g) => { g.style.opacity = '0'; });
}
// Five short strokes fanned round a seal, drawn fresh for the arrival and removed after it.
function ticks(art, g) {
  const m = /translate\(([\d.-]+) ([\d.-]+)\).*scale\(([\d.]+)\)/.exec(g.getAttribute('transform')) || [0, 0, 0, 1];
  const s = +m[3] * 100, cx = +m[1] + s / 2, cy = +m[2] + s / 2, r = s * .62, t = document.createElementNS(NS, 'g');
  t.setAttribute('class', 'site-identity-ticks');
  [-2.7, -2.2, -1.7, .5, 1.05].forEach((a, i) => {
    const r0 = r + 3 + (i % 2), r1 = r0 + 5 - (i % 2), p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M' + (cx + Math.cos(a) * r0).toFixed(1) + ' ' + (cy + Math.sin(a) * r0).toFixed(1) + ' L' + (cx + Math.cos(a) * r1).toFixed(1) + ' ' + (cy + Math.sin(a) * r1).toFixed(1));
    t.appendChild(p);
  });
  t.style.transformBox = 'fill-box'; t.style.transformOrigin = 'center';
  art.appendChild(t);
  return t;
}
// The pen writes, then the maker stamps. Returns when the last frame lands (ms).
export function arrive(a) {
  clear(a);
  if (Motion.reduced()) return 0;
  const ps = strokes(a), L = ps.map((p) => p.getTotalLength()), lift = 8, raw = L.map((l) => Math.max(18, l / .42));
  const k = (900 - lift * (ps.length - 1)) / raw.reduce((s, d) => s + d, 0);   // the whole inscription in 0.9 s
  let t = 0;
  ps.forEach((p, i) => {
    const d = raw[i] * k;
    p.style.strokeDasharray = L[i] + ' ' + (L[i] + 2 * PEN + 8);
    live.push(p.animate([{ strokeDashoffset: L[i] + PEN + 1 }, { strokeDashoffset: 0 }], { duration: d, delay: t, easing: 'cubic-bezier(.55,.1,.25,1)', fill: 'both' }));
    t += d + lift;
  });
  const art = a.querySelector('.site-identity-art');
  seals(a).forEach((g, i) => {
    const at = t + 140 + i * 260, tk = ticks(art, g);
    live.push(g.animate(Motion.held([{ opacity: 0 }, { opacity: 1 }]), { duration: TICK, delay: at, fill: 'backwards' }));
    live.push(tk.animate(Motion.held([{ opacity: 0, offset: 0 }, { opacity: 1, transform: 'scale(1)', offset: .25 }, { opacity: 1, transform: 'scale(1.08)', offset: .5 },
      { opacity: 0, offset: .75 }, { opacity: 0, offset: 1 }]), { duration: 4 * TICK, delay: at, fill: 'both' }));
  });
  const end = t + 140 + 260 + 4 * TICK, mine = live.slice();
  Promise.all(mine.map((x) => x.finished)).then(() => { if (live[0] === mine[0]) clear(a); }, () => {});
  return end;
}

// ---- home: covered under a first visit's OP, written when it ends ----
const link = document.querySelector('.home-head .site-identity');
if (link) {
  let covered = false;
  const watch = () => {
    if (!covered && html.matches('.opening:not(.ret)')) { covered = true; cover(link); }
    // the head's failsafe ended the wait without the opener (no opx:done): the identity is simply there
    else if (covered && !html.classList.contains('opening')) { covered = false; clear(link); }
  };
  watch();
  new MutationObserver(watch).observe(html, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('opx:done', (e) => {
    if (!covered) return;
    covered = false;
    const d = e.detail || {};
    if (d.mode === 'first' && !d.skipped) { const ms = arrive(link); if (window.FY_ID) window.FY_ID.ms = ms; } else clear(link);
  });
  Motion.onReduced((on) => { if (on) clear(link); });
  if (new URLSearchParams(location.search).get('opx') === '1') {
    window.FY_ID = { ms: 0, seek: (ms) => live.forEach((x) => { x.pause(); x.currentTime = ms; }), rest: () => { clear(link); window.FY_ID.ms = 0; } };
  }
}
