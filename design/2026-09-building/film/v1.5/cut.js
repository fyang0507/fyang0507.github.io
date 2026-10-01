/* v1.5/cut.js — the promo's cut as a pure function of film time, shared by the promo (promo.js) and the side-by-side
   (sbs.js): the shots on the film's clock, what each sheet shows (take, footage second; during a jump the sheet under
   it too), the camera, and the captions. Nothing here draws. */
import { ramp, shotLen, uAt, ltOf } from '../v1.4/ramp.js';

const F = window.FILM;
export const P = (x, y) => [(x - 640) / 100, (500 - y) / 100];   // page px → sheet units, the page centred on the origin
export function frameAt(list, u) {
  let lo = 0, hi = list.length - 1;
  if (u <= list[0][0]) return list[0];
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (list[m][0] <= u + 1e-4) lo = m; else hi = m - 1; }
  return list[lo];
}
// the camera at c = {x, y, h}: h is how much of the world (sheet units) the picture's height shows, tilted 5°
export function place(camera, c, FOV = 30) {
  const dist = c.h / 2 / Math.tan(FOV * Math.PI / 360), tilt = 5 * Math.PI / 180;
  camera.position.set(c.x, c.y - dist * Math.sin(tilt), dist * Math.cos(tilt) + 0.3);
  camera.up.set(0, 1, 0); camera.lookAt(c.x, c.y, 0.3); camera.updateMatrixWorld();
}

export function cut(EDL, WORDS, FADE) {
  let t = 0; const shots = [];
  for (const s0 of EDL) {
    const s = Object.assign({}, s0); if (s.ramp) s.R = ramp(s.ramp);
    const d = s.k === 'play' ? shotLen(s) : s.d;
    Object.assign(s, { t0: t, t1: t + d, d }); shots.push(s); t += d;
  }
  const T = { shots, dur: t };
  const plays = shots.filter((s) => s.k === 'play');
  const shotAt = (t) => { let i = 0; while (i < shots.length - 1 && shots[i].t1 <= t) i++; return shots[i]; };
  const filmOf = (take, u) => { const s = plays.find((x) => x.take === take && u >= x.u0 && u < x.u1); return s ? s.t0 + ltOf(s, u) : null; };
  // what each sheet shows at film time t: the sheet in front (take, u), and during a jump the one under it
  function state(t) {
    const s = shotAt(t), lt = t - s.t0, st = { s, lt, take: s.take, u: 0, next: null };
    if (s.k === 'play') st.u = uAt(s, lt);
    else if (s.k === 'end') { const l = plays[plays.length - 1]; st.take = l.take; st.u = l.u1 + lt; }
    else if (s.k === 'jump') {
      const i = shots.indexOf(s), prev = shots[i - 1], next = shots[i + 1];
      Object.assign(st, { take: prev.take, u: prev.u1 + lt, nextTake: next.take, next: next.u0 - (s.d - lt), jump: F.ease.inOut(F.seg(lt, 0, s.d)) });
    }
    return st;
  }
  // the camera: keys in film time, eased between, zoom in log space; the last sheet's framing is v1.1's
  const K = [];
  for (const s of plays) for (const [u, x, y, h] of s.cam) { const [wx, wy] = P(x, y); K.push([s.t0 + ltOf(s, u), wx, wy, h / 100]); }
  const e = shots[shots.length - 1];
  K.push([e.t0 + 1.3, 0.2, 0.0, 12.2], [e.t0 + 2.2, 0.2, 0.2, 9.4], [T.dur, 0.2, 0.15, 9.1]);
  const KEYS = K.sort((a, b) => a[0] - b[0]);
  function cam(t) {
    let i = 1; while (i < KEYS.length - 1 && KEYS[i][0] <= t) i++;
    const a = KEYS[i - 1], b = KEYS[i];
    if (t <= a[0]) return { x: a[1], y: a[2], h: a[3] };
    if (t >= b[0]) return { x: b[1], y: b[2], h: b[3] };
    const k = F.ease.inOut(F.seg(t, a[0], b[0]));
    return { x: F.lerp(a[1], b[1], k), y: F.lerp(a[2], b[2], k), h: Math.exp(F.lerp(Math.log(a[3]), Math.log(b[3]), k)) };
  }
  // the captions: film time of a shot's footage second, extended into its neighbours at real time
  const capTime = (s, u) => u < s.u0 ? s.t0 - (s.u0 - u) : u > s.u1 ? s.t1 + (u - s.u1) : s.t0 + ltOf(s, u);
  const CAPS = plays.flatMap((s) => (s.caps || []).map((c) => ({ id: c.id, shot: s.name, take: s.take, in: capTime(s, c.in), out: capTime(s, c.out),
    umotion: c.boxu || c.motion, motion: c.motion.map((u) => s.t0 + ltOf(s, u)) })));
  function captionAt(t) {
    for (const c of CAPS) if (t >= c.in && t < c.out) return [WORDS[c.id], Math.min(F.seg(t, c.in, c.in + FADE), 1 - F.seg(t, c.out - FADE, c.out))];
    return [null, 0];
  }
  return { T, shots, plays, end: e, filmOf, state, cam, CAPS, captionAt };
}
