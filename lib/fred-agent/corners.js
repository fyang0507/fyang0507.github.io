/* Fred Agent · Demos: the pen's marks at a region's four corners, like crop marks on a print (design/2026-09-building,
   round 4's A, with Fred's amendment: "thicken the lines + make that visible in the zoomed-in view as well ... the
   zoomed-in view also includes surroundings and we need the boundary").
   Four strokes, arm → corner → arm, GAP px outside the region, so they mark its edge and never cross its inside. They
   are the pen's 「 」 (pen-tier.js's FocusMark) at a region's size: the same seeded jitter, drawn corner by corner on
   the pen's easing and lifted the same way, on the hand's clock. Two states show: noticed, the pen's coral (a mouse
   over the region's token or note, or keyboard focus on the note); chosen, ink in a paper casing, which reads on a
   dark capture as on a white one and is what the enlargement shows round its current region, where coral may not rest.
   Hidden strokes are visibility:hidden (a zero-length dash still paints its round cap). The svg is 1 × 1 and draws
   through its overflow, so it never widens the page or a window's scroll. Styles in demos.css (.cn).
     corners(host) → { build(lim, seed), set(state, how) }
     lim: the box, in host px, the marks stay round: the print on a capture, the image in the enlargement, where they
     also keep lim.inset px inside it, so the window's edge never cuts them. state 0 hidden · 1 noticed · 2 chosen.
     how: 'instant', or a delay in ms before the pen starts. */
const NS = 'http://www.w3.org/2000/svg', GAP = 6, K = [0, 1, 2, 3];

function node(tag, cls) { const n = document.createElementNS(NS, tag); if (cls) n.setAttribute('class', cls); return n; }
function dash(p, L, s, e) {
  const len = (e - s) * L;
  if (len < 0.4) { p.style.visibility = 'hidden'; return; }
  p.style.visibility = 'visible';
  p.style.strokeDasharray = len.toFixed(2) + ' ' + (L * 2 + 40).toFixed(1);
  p.style.strokeDashoffset = (-s * L).toFixed(2);
}

export function corners(host) {
  const svg = node('svg', 'cn'), E = Motion.EASE, tween = Motion.tween;
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', 1); svg.setAttribute('height', 1);
  const marks = K.map(() => { const g = node('g'), c = node('path', 'cn-case'), p = node('path', 'cn-ink'); g.append(c, p); svg.appendChild(g); return { c, p, L: 0 }; });
  host.appendChild(svg);
  const v = { render() { marks.forEach((m, i) => { dash(m.c, m.L, v['s' + i], v['e' + i]); dash(m.p, m.L, v['s' + i], v['e' + i]); }); } };
  K.forEach((i) => { v['s' + i] = 0; v['e' + i] = 0; });
  let on = false;

  function build(lim, seed) {
    const w = host.offsetWidth, h = host.offsetHeight, r = Pen.rng(seed + '|corners'), j = () => (r() - 0.5) * 1.1, f = (n) => n.toFixed(1);
    const b = { l: -Infinity, t: -Infinity, r: Infinity, b: Infinity, ...lim };
    // the region as far as its capture goes, the gap outside it, and inside lim.inset where one is given
    let x0 = Math.max(0, b.l) - GAP, x1 = Math.min(w, b.r) + GAP, y0 = Math.max(0, b.t) - GAP, y1 = Math.min(h, b.b) + GAP;
    if (b.inset != null) { x0 = Math.max(x0, b.l + b.inset); x1 = Math.min(x1, b.r - b.inset); y0 = Math.max(y0, b.t + b.inset); y1 = Math.min(y1, b.b - b.inset); }
    const arm = Math.min(26, Math.max(12, (x1 - x0) * 0.18), (x1 - x0) / 2 - 3), vv = Math.min(20, Math.max(10, (y1 - y0) * 0.22), (y1 - y0) / 2 - 3);
    // clockwise from the top-left, each corner one stroke: down its side, into the corner, along its edge
    const corner = (x, y, dx, dy) => 'M' + f(x + j()) + ' ' + f(y + dy * vv) + ' L' + f(x) + ' ' + f(y) + ' L' + f(x + dx * arm) + ' ' + f(y + j());
    [corner(x0, y0, 1, 1), corner(x1, y0, -1, 1), corner(x1, y1, -1, -1), corner(x0, y1, 1, -1)].forEach((d, i) => {
      const m = marks[i];
      m.c.setAttribute('d', d); m.p.setAttribute('d', d);
      m.L = m.p.getTotalLength();
    });
    v.render();
  }

  // 1 or 2 over one already shown only changes its ink; 0 lifts it, and it keeps its ink while it lifts
  function set(state, how) {
    if (state) svg.dataset.state = state;
    if (!!state === on) return;
    on = !!state;
    tween.stop(v);
    if (how === 'instant') { K.forEach((i) => { v['s' + i] = 0; v['e' + i] = on ? 1 : 0; }); v.render(); return; }
    const delay = typeof how === 'number' ? how : 0;
    K.forEach((i) => {
      if (on) { v['s' + i] = 0; tween(v, 'e' + i, 1, 150, delay + i * 50, E.pen); }
      else tween(v, 's' + i, v['e' + i], 120, 0, E.lift, () => { v['s' + i] = 0; v['e' + i] = 0; v.render(); });
    });
  }

  return { build, set };
}
