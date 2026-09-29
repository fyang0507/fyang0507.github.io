/* Home · the fall's physics and stage. The desk's own layers fall: the stage is a handle on the live desk DOM plus the
   few things only the fall draws (the face-down portrait, the dust ticks). Units are desk-image px (1448 × 1086) and
   seconds, so the same numbers hold at every viewport; gravity is converted from screen px/s² by the caller.
   Body: falls under g, bounces with restitution e, squashes on a damped spring excited by impact speed, and, once
   resting on its flat bottom, rocks level on a damped angular spring. Mass is felt through those constants, not g. */
const TAU = Math.PI * 2, H = 1 / 240;
export const W = 1448, HGT = 1086;

export function body(o) {
  const b = { y: 0, vy: 0, th: 0, w: 0, sq: 0, sv: 0, state: 'idle', bounces: 0, e: .2, sqGain: .00004, ks: 8, zs: .35, kr: 3.2, zr: .45, airDamp: .6, rockKick: 9, vRest: 180, g: 9000 };
  return Object.assign(b, o);
}
// Released from rest `h` px above its resting place, tilted th0 (deg) and spinning w0 (deg/s).
export function drop(b, h, th0, w0) { Object.assign(b, { y: -h, vy: 0, th: th0, w: w0, sq: 0, sv: 0, state: 'air', bounces: 0 }); }
export const fallTime = (b, h) => Math.sqrt(2 * h / b.g);
export function step(b, dt) {
  if (b.state === 'idle') return;
  const n = Math.max(1, Math.ceil(dt / H)), h = dt / n;
  for (let i = 0; i < n; i++) {
    if (b.state === 'air') {
      b.vy += b.g * h; b.y += b.vy * h;
      b.th += b.w * h; b.w *= Math.exp(-b.airDamp * h);
      if (b.y >= 0) {
        const v = b.vy; b.y = 0;
        b.sv += v * b.sqGain;                          // squash rings with the impact speed
        b.w = b.w * .25 - b.th * b.rockKick;           // the low corner hits first: tilt becomes rock
        b.vy = -v * b.e;
        if (b.onImpact) b.onImpact(b, v, b.bounces);
        b.bounces++;
        if (-b.vy < b.vRest) { b.vy = 0; b.state = 'rest'; }
      }
    } else if (b.state === 'rest') {
      const wr = TAU * b.kr;
      b.w += (-wr * wr * b.th - 2 * b.zr * wr * b.w) * h; b.th += b.w * h;
    }
    const ws = TAU * b.ks;
    b.sv += (-ws * ws * b.sq - 2 * b.zs * ws * b.sv) * h; b.sq += b.sv * h;
  }
  b.settled = b.state === 'rest' && Math.abs(b.th) < .04 && Math.abs(b.w) < 1.5 && Math.abs(b.sq) < .0015 && Math.abs(b.sv) < .03;
}
// Squash keeps the foot on the table: wider and shorter, pivoting on the contact line. The bodies live in the drawing's
// own plane, so y is already in the right px. 2D on purpose: a 3D transform would promote a layer, and the plane with it.
export function transform(b) {
  if (b.settled) return '';
  return 'translate(0,' + b.y.toFixed(2) + 'px) rotate(' + b.th.toFixed(2) + 'deg) scale(' + (1 + b.sq * .7).toFixed(4) + ',' + (1 - b.sq).toFixed(4) + ')';
}
// Damped oscillation for the leaf: amplitude A (deg), f Hz, damping ratio z, t seconds.
export const ring = (A, f, z, t) => { const w = TAU * f; return A * Math.exp(-z * w * t) * Math.sin(w * Math.sqrt(1 - z * z) * t); };

// ---- the stage: the live desk, handled ----
const NSV = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) { const e = document.createElementNS(NSV, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
const KEYS = ['laptop', 'mug', 'camera', 'plant', 'book', 'frame'];

// Each body rocks about its contact point: foot (desk px, from FY_DESK) at its rock pivot cx.
export function stage(deskEl, geo) {
  const q = (s) => deskEl.querySelector(s), S = { shake: q('.desk-in'), body: {}, tone: {}, backedge: {} };
  KEYS.forEach((k) => {
    const el = S.body[k] = q('[data-body="' + k + '"]'), g = geo[k], b = g.box;
    el.style.transformOrigin = ((g.cx - b[0]) / b[2] * 100).toFixed(3) + '% ' + ((g.foot - b[1]) / b[3] * 100).toFixed(3) + '%';
    S.tone[k] = q('[data-tone="' + k + '"]');
  });
  ['laptop', 'plant'].forEach((k) => { S.backedge[k] = q('.desk-backedge--' + k); });
  S.leaf = q('.desk-leaf');
  S.caret = q('.desk-caret'); S.steam = q('.desk-steam'); S.flash = q('.desk-flash'); S.cstar = q('.desk-cstar'); S.kacha = q('.desk-kacha');
  // Face-down: the back of the frame lying flat, tipped toward us from its bottom edge (sprite px).
  const slab = S.slab = svgEl('svg', { class: 'desk-slab', viewBox: '0 0 616 577', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, S.body.frame);
  svgEl('path', { d: 'M84 497 C200 504 350 514 474 522 L497 700 C360 694 200 684 66 676 Z' }, slab);
  svgEl('path', { d: 'M66 676 L66 690 C200 698 360 708 497 714 L497 700' }, slab);
  svgEl('path', { class: 'kick', d: 'M250 540 L262 640 L318 644 L310 544' }, slab);
  S.fx = svgEl('svg', { class: 'desk-fx', viewBox: '0 0 ' + W + ' ' + HGT, preserveAspectRatio: 'none', 'aria-hidden': 'true' }, S.shake);
  S.svgEl = svgEl;
  S.remove = () => { slab.remove(); S.fx.remove(); KEYS.forEach((k) => { S.body[k].style.transform = ''; }); };
  return S;
}
