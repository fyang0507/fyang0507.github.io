/* Home · the fall (from r3-10-fall.js and r2-10-gag-fx.js). The OP's hard cut finds the bird standing on the empty
   desk; it never moves. The desk's own objects fall around it in a drum fill (160 → 120 → 100 → 80 → 70 ms), each
   landing firing only its own reaction; the portrait, which landed face-down, rights itself a beat after the last
   landing, surprised. Nothing on the desk causes anything else.
   Honest loading: "go" is the cut or the moment every byte is decoded, whichever is later. Until then the empty desk
   holds, still; after 1.5 s it offers "tap to skip · 点按跳过", nothing else. The opener is over by 6.5 s, always: a
   desk too late for the full score gets the short one, and one too late even for that comes in as a plain page.
   Returning (a later landing in the session): no OP, no card, the objects already falling into the page's layout.
   Everything runs on the opener's clock (R.t, ms, from opener.js); every reaction is a cue or an age function, so
   the whole piece is deterministic and seekable frame by frame (the flash audit renders it that way). */
import * as P from './fall-stage.js';
import { desk } from './desk.js';
import { phone } from './mobile.js';

const G_SCREEN = 5600, CAP_MS = 6500, HINT_MS = 1500;
// Landings, ms after go. Returning is tighter: back row first (laptop, plant, frame), then the front row 130 ms behind
// each, so six bodies never tumble through one column together; it keeps only the reactions that end before the desk
// is live (the steam puff and the 咔嚓 would outlive it, and the live desk's own take over).
const LAND = { first: { laptop: 400, mug: 560, book: 680, frame: 780, camera: 860, plant: 930 },
  returning: { laptop: 200, plant: 240, frame: 280, mug: 330, camera: 370, book: 410 } };
const POP = { first: 1110, returning: 390 }, CALM = { first: 0, returning: 600 }, END = { first: 1350, returning: 660 };
const ABOVE = { first: null, returning: 340 };   // released this far (px) above the top edge; null = 1.3 × its fall into view
// Mass is felt in restitution, squash and how the rock settles; gravity is the same for all.
const FEEL = {
  laptop: { e: .1, sqGain: .000026, ks: 7, zs: .5, kr: 3.4, zr: .7, th: -3.5, w: 12, dust: [288, 738, 594, 1.35], shake: 3 },
  mug: { e: .14, sqGain: .000042, ks: 9, zs: .32, kr: 3.2, zr: .3, th: 9, w: -40, dust: [360, 470, 753, .8] },
  book: { e: .03, sqGain: .00009, ks: 11, zs: .45, kr: 5, zr: .8, th: -6, w: 20, dust: [528, 828, 899, 1.1], flat: true },
  camera: { e: .13, sqGain: .000036, ks: 8, zs: .4, kr: 3.6, zr: .5, th: 6, w: -25, dust: [996, 1242, 867, 1.05], shake: 1.5 },
  frame: { e: .15, sqGain: .00003, ks: 10, zs: .4, kr: 4, zr: .6, th: -14, w: 160, airDamp: .2, dust: [826, 985, 612, .75] },
  plant: { e: .12, sqGain: .000045, ks: 8, zs: .38, kr: 3, zr: .4, th: -5, w: 18, dust: [1150, 1256, 566, 1], shake: 1 }
};
const KEYS = Object.keys(FEEL);

// ---- the clock's primitives ----
export function at(R, t, fn) { R.cues.push({ t, fn }); R.cues.sort((a, b) => a.t - b.t); }
export const later = (R, ms, fn) => at(R, R.t + ms, fn);
export function run(R, dur, draw, end, delay) { R.fx.push({ t0: R.t + (delay || 0), dur, draw, end }); }   // draw(age) each frame
export function step(R) {
  while (R.cues.length && R.cues[0].t <= R.t) { R.cues.shift().fn(R.t); if (!R.alive) return; }
  R.fx = R.fx.filter((f) => {
    if (!R.alive) return false;
    const age = R.t - f.t0;
    if (age < 0) return true;
    if (age >= f.dur) { if (f.end) f.end(); return false; }
    f.draw(age); return true;
  });
}
const lerp = (a, b, k) => a + (b - a) * k, easeOut = (p) => 1 - Math.pow(1 - p, 3);
export function kf(K, p) { for (let i = 1; i < K.length; i++) if (p <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (p - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return K[K.length - 1][1]; }

// ---- landing reactions: held key poses on the hand's clock ----
// Pen ticks thrown sideways from each end of the contact line: three held frames, gone in 190 ms.
function dust(R, spec, size, flat) {
  const S = R.S, g = S.svgEl('g', {}, S.fx), paths = [], angs = flat ? [0, 9] : [14, 42], len = 15 * size, r0 = 7 * size;
  [-1, 1].forEach((side) => angs.forEach((a, i) => {
    const rad = a * Math.PI / 180;
    paths.push({ p: S.svgEl('path', { class: 'tk' }, g), x: side < 0 ? spec[0] : spec[1], y: spec[2] - (flat ? 12 + i * 22 : 2), dx: Math.cos(rad) * side, dy: -Math.sin(rad), l: len * (1 - i * .18) });
  }));
  let last = -1;
  run(R, 190, (age) => {
    const f = age < 60 ? 0 : age < 125 ? 1 : 2;
    if (f === last) return; last = f;
    const a = [0, .35, 1][f], b = [.55, 1.25, 1.45][f];
    paths.forEach((q) => q.p.setAttribute('d', 'M' + (q.x + q.dx * (r0 + q.l * a)).toFixed(1) + ' ' + (q.y + q.dy * (r0 + q.l * a)).toFixed(1) + ' L' + (q.x + q.dx * (r0 + q.l * b)).toFixed(1) + ' ' + (q.y + q.dy * (r0 + q.l * b)).toFixed(1)));
  }, () => g.remove());
}
// The table takes the weight: the drawing drops a few px and comes back, three held poses.
function shake(R, px) { run(R, 150, (age) => { R.S.shake.style.translate = '0 ' + (age < 50 ? px : (-px * .35).toFixed(2)) + 'px'; }, () => { R.S.shake.style.translate = ''; }); }
function steam(R) {                               // the jolt pushes one puff up out of the mug
  R.S.steam.querySelectorAll('path').forEach((p, i) => run(R, 640, (age) => {
    const q = easeOut(age / 640);
    p.style.strokeOpacity = kf([[0, 0], [.25, .5], [1, 0]], q).toFixed(3);
    p.style.strokeDasharray = 'none';
    p.style.transform = 'translateY(' + lerp(16, -34, q).toFixed(1) + 'px) scaleY(' + lerp(.7, 1.1, q).toFixed(3) + ')';
  }, () => { p.style.strokeOpacity = 0; }, i * 70));
}
function caret(R) {                               // two quick blinks, then the live desk's 1.15 s rhythm
  const c = R.S.caret;
  run(R, 1e9, (age) => { c.style.visibility = (age < 240 ? (age < 80 || age >= 160) : ((age - 240) % 1150) < 575) ? 'visible' : 'hidden'; });
}
// One flash only, local to the lens (far under WCAG's 3/s); the first visit adds the star and the 咔嚓.
function flash(R, full) {
  const S = R.S;
  run(R, 260, (age) => { S.flash.style.opacity = kf([[0, 0], [.07, .95], [.3, .3], [1, 0]], age / 260).toFixed(3); }, () => { S.flash.style.opacity = 0; });
  if (!full) return;
  run(R, 620, (age) => {
    const p = easeOut(age / 620);
    S.cstar.style.opacity = kf([[0, 0], [.18, 1], [1, 0]], p).toFixed(3);
    S.cstar.style.transform = 'scale(' + (p < .18 ? lerp(.3, .5, p / .18) : lerp(.5, 1.5, (p - .18) / .82)).toFixed(3) + ')';
  }, () => { S.cstar.style.opacity = 0; });
  run(R, 760, (age) => {
    const p = easeOut(age / 760);
    S.kacha.style.opacity = kf([[0, 0], [.14, 1], [.62, 1], [1, 0]], p).toFixed(3);
    S.kacha.style.transform = 'translateY(' + kf([[0, 8], [.14, 0], [.62, 0], [1, -16]], p).toFixed(1) + 'px) scale(' + kf([[0, .55], [.14, 1.08], [.3, 1], [1, 1]], p).toFixed(3) + ') rotate(' + kf([[0, -5], [.14, -2], [1, -2]], p).toFixed(1) + 'deg)';
  }, () => { S.kacha.style.opacity = 0; });
}
// The book slaps flat and the air under it lifts one page over: frames 1–4, then rest.
function pages(R) { [[1, 0], [2, 55], [3, 110], [4, 170], [0, 235]].forEach(([f, ms]) => later(R, ms, () => desk.setBook(f))); }
// Face-down → mid → upright-and-surprised (overshoot) → settled: held drawings, not a tween.
function popUp(R) {
  const fr = R.S.body.frame;
  R.bodies.frame.manual = true; R.popAt = R.t;
  desk.setFrame(3); fr.classList.remove('flat');
  fr.style.transform = 'scaleY(.42)';
  later(R, 45, () => { fr.style.transform = 'scaleY(1.07)'; });
  later(R, 95, () => { fr.style.transform = ''; });
}

// ---- the run ----
// Built at run start, under the OP: the stage, the bird on its mark, the camera. The objects wait out of frame.
export function prepare(R) {
  const S = R.S = P.stage(desk.el, R.geo);
  R.bodies = {}; R.cardMs = R.cardMs || 400;
  desk.bird.held = true; desk.frameHeld = true; desk.stopType();
  desk.bird.place(phone.on() ? 18 : 14, 1);     // facing right, like its close-up
  desk.setFrame(0); desk.setBook(0);
  desk.el.classList.add('fall');
  const hint = R.hint = document.createElement('div');
  hint.className = 'skip-hint'; hint.setAttribute('aria-hidden', 'true'); hint.textContent = 'tap to skip · 点按跳过';
  document.body.appendChild(hint);
  camera(R);
  S.shake.style.translate = '';
}
// The first visit on a wide screen plays through one wide framing (×≤1.5) and the eyecatch's cut hides its return;
// phones play in shot 0 of their own camera, and returning runs in the page's own layout.
function camera(R) {
  const el = desk.el;
  if (!phone.on()) el.style.transform = '';
  const r = el.getBoundingClientRect(), Wv = innerWidth, Hv = innerHeight;
  R.cam = '';
  if (R.mode === 'first' && !phone.on()) {
    const s = Math.min(1.5, Wv * .94 / (r.width * .946), Hv * .92 / (r.height * .718));
    R.cam = 'translate(' + (Wv / 2 - (r.left + s * r.width * .5)).toFixed(1) + 'px,' + (Hv * .5 - (r.top + s * r.height * .58)).toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    el.style.transformOrigin = '0 0'; el.style.transform = R.cam;
  }
  frameOf(R);
}
function frameOf(R) {                             // where the desk is on screen, in the framing the fall plays in
  const r = desk.el.getBoundingClientRect();
  R.fr = { sc: r.width / P.W, top: r.top };
  R.k = 1;                                        // the bodies live in the drawing's own plane (desk px)
}
export function set(R) { desk.el.classList.add('set'); }   // the empty desk and the bird are decoded: show them
// A page that painted so late that even the OP would run past the cap skips it: only the fall, in the page's framing.
export const tooLateForOP = (R, opMs) => !R.frozen && performance.now() - R.origin > CAP_MS - opMs - END.returning;
export function demote(R) { R.mode = 'returning'; if (R.cam) { R.cam = ''; desk.el.style.transform = ''; frameOf(R); } }
export function cut(R) { R.cutAt = R.t; }

export function frame(R, dt) {
  KEYS.forEach((k) => {
    const b = R.bodies[k]; if (!b || b.manual) return;
    P.step(b, dt); R.S.body[k].style.transform = P.transform(b, R.k);
    if (b.settled && !b.rest) { b.rest = true; if (R.S.backedge[k]) R.S.backedge[k].classList.add('gone'); }
  });
  if (R.leafT != null) { const a = P.ring(9, 5, .2, (R.t - R.leafT) / 1000); R.S.leaf.style.transform = Math.abs(a) > .01 ? 'rotate(' + a.toFixed(2) + 'deg)' : ''; }
  if (R.phase !== 'desk' || R.goAt != null) return;
  const score = fits(R);
  if (!score) { R.goAt = -1; return R.onCapped(); }
  if (R.ready) return go(R, score);
  if (R.t - R.cutAt >= HINT_MS) R.hint.classList.add('on');   // still holding: offer the skip, say nothing else
}
// The fullest score that still ends by the cap (the first adds the eyecatch); null = none does.
function fits(R) {
  const room = CAP_MS - (R.frozen ? R.t : Math.max(R.t, performance.now() - R.origin));   // a slow first paint eats the budget too
  if (R.mode === 'first' && END.first + R.cardMs <= room) return 'first';
  return END.returning <= room ? 'returning' : null;
}
function go(R, score) {
  const T = R.goAt = R.t, land = LAND[score];
  R.score = score; R.hint.classList.remove('on');
  if (score !== R.mode && R.cam) { R.cam = ''; desk.el.style.transform = ''; frameOf(R); }   // late: cut to the page's framing
  KEYS.forEach((k) => schedule(R, k, T + land[k]));
  at(R, T + END[score], function end() {           // never ahead of the portrait's own take
    if (R.popAt == null || R.t < R.popAt + 110) return later(R, 17, end);
    R.onEnd();
  });
}
// Dropped from above the top edge so that it lands at tLand. A release already past starts mid-fall, where a body
// dropped that long ago would be, but never so late that it would appear inside the frame (the landing slips).
function schedule(R, k, tLand) {
  const f = FEEL[k], g = R.geo[k], sc = R.fr.sc, footY = R.fr.top + g.foot * sc;
  const b = R.bodies[k] = P.body({ e: f.e, sqGain: f.sqGain, ks: f.ks, zs: f.zs, kr: f.kr, zr: f.zr, airDamp: f.airDamp || .6, g: G_SCREEN / sc });
  const above = ABOVE[R.score] == null ? footY * .3 + 50 : ABOVE[R.score], h = (footY + above) / sc;
  const T = P.fallTime(b, h) * 1000, enter = P.fallTime(b, above / sc) * 1000, rel = Math.max(tLand - T, R.t - enter);
  b.onImpact = (b2, v, n) => { if (n === 0) land(R, k, f); };
  at(R, Math.max(R.t, rel), () => {
    P.drop(b, h, f.th - f.w * T / 1000, f.w);
    if (R.t > rel) P.step(b, (R.t - rel) / 1000);
    R.S.body[k].style.transform = P.transform(b, R.k);
    R.S.body[k].classList.add('in');
  });
}
function land(R, k, f) {
  const S = R.S, first = R.score === 'first';
  dust(R, f.dust, f.dust[3], f.flat);
  if (f.shake) shake(R, f.shake);
  if (S.tone[k]) S.tone[k].classList.add('in');
  if (k === 'laptop') later(R, 90, () => caret(R));
  if (k === 'mug' && first) steam(R);
  if (k === 'book') pages(R);
  if (k === 'camera') flash(R, first);
  if (k === 'frame') { S.body.frame.classList.add('flat'); R.bodies.frame.th = 0; R.bodies.frame.w = 0; take(R); }
  if (k === 'plant') R.leafT = R.t;
}
// The portrait's take: on the score's beat, and never sooner than 100 ms after its own landing.
function take(R) {
  const t = Math.max(R.t + 100, R.goAt + POP[R.score]);
  at(R, t, () => popUp(R));
  if (CALM[R.score]) at(R, t + CALM[R.score] - POP[R.score], () => desk.setFrame(0));
}

// Is anything still moving? (returning ends in place, so its last frames finish before the loop stops)
export function quiet(R) {
  return R.fx.every((f) => f.dur > 1e8) && KEYS.every((k) => !R.bodies[k] || R.bodies[k].manual || R.bodies[k].settled) &&
    (R.leafT == null || R.t - R.leafT > 900);
}
// Skip / cap: everything to its resting place in `ms` (a fast-forward, not a jump cut): bodies in flight ease down,
// bodies not yet dropped fade in where they rest, tones follow, the portrait stands.
export function toRest(R, ms) {
  const S = R.S; if (!S) return;
  KEYS.forEach((k) => {
    const el = S.body[k], b = R.bodies[k], was = el.style.transform;
    if (b) b.manual = true;
    el.style.transform = '';
    if (!ms) return;
    if (el.classList.contains('in') && was) el.animate([{ transform: was }, { transform: 'none' }], { duration: ms, easing: 'cubic-bezier(.2,.7,.2,1)' });
    else if (!el.classList.contains('in')) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms });
  });
  Object.values(S.tone).forEach((t) => { if (t && !t.classList.contains('in') && ms) t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms }); });
  S.body.frame.classList.remove('flat'); desk.setFrame(0); desk.setBook(0);
}
// The desk is live: the fall's own drawings go, its classes come off, the bird and the portrait go back to living.
export function release(R) {
  const S = R.S;
  if (R.hint) { R.hint.remove(); R.hint = null; }
  if (S) {
    S.remove(); S.shake.style.translate = ''; S.leaf.style.transform = '';
    [S.caret, S.flash, S.cstar, S.kacha].forEach((e) => { e.style.visibility = ''; e.style.opacity = ''; e.style.transform = ''; });
    S.steam.querySelectorAll('path').forEach((p) => { p.style.strokeOpacity = ''; p.style.strokeDasharray = ''; p.style.transform = ''; });
    Object.values(S.backedge).forEach((e) => e && e.classList.remove('gone'));
    R.S = null;
  }
  desk.el.classList.remove('fall', 'set');
  desk.el.querySelectorAll('.in').forEach((e) => e.classList.remove('in'));
  if (!phone.on()) { desk.el.style.transform = ''; desk.el.style.transformOrigin = ''; }
  desk.frameHeld = false; desk.bird.held = false;
}
