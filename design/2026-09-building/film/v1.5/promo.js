/* v1.5/promo.js — part 1, the promo (from ../v1.4/promo.js): v1.4's cut to #35's tabs on take11, then take15 from
   the Building board on, joined by the sheet pull: the shooting tab's move with the prints developing on their lines,
   a print out with its peg and back onto its rope, the about tab's move, the specimen card out of its sleeve and
   turned over, and home (ramped). Each shot names its take; a jump's leaving sheet plays on in the take before it,
   the sheet under it in the take after it. Captions are v1.4's ink band (../v1.4/caption.js), the last sheet v1.5's
   (end.js). 16:9 only. ?w=1280 renders a 720p draft; ?cap= a caption treatment; ?end= an end-card treatment. */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { sheet, folder, frameInto, canvasTex, COL, OFF } from '../v1/world.js';
import { hand as cursor, overlays } from '../v1.1/hand.js';
import { ramp, shotLen, uAt, ltOf, speedAt } from '../v1.4/ramp.js';
import { layout, pick } from '../v1.4/caption.js';
import { EDL, WORDS, FADE } from './edl.js';
import { endCard } from './end.js';

const F = window.FILM, q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), H = Math.round(W * 9 / 16), FOV = 30;
const SRC = 'footage/', REGIONS = 'take11-after';   // the seal's DPR 3 close-up is take11's
let renderer, scene, camera, A, N, T, CAP, PULL, endTex;
const META = {}, FR = {};

function timeline() {
  let t = 0; const out = [];
  for (const s0 of EDL) {
    const s = Object.assign({}, s0); if (s.ramp) s.R = ramp(s.ramp);
    const d = s.k === 'play' ? shotLen(s) : s.d;
    Object.assign(s, { t0: t, t1: t + d, d }); out.push(s); t += d;
  }
  return { shots: out, dur: t };
}
function shotAt(t) { const S = T.shots; let i = 0; while (i < S.length - 1 && S[i].t1 <= t) i++; return S[i]; }
const plays = () => T.shots.filter((s) => s.k === 'play');
function filmOf(take, u) { const s = plays().find((x) => x.take === take && u >= x.u0 && u < x.u1); return s ? s.t0 + ltOf(s, u) : null; }
// what each sheet shows at film time t: the sheet in front (take, u), and during a jump the one under it
function state(t) {
  const s = shotAt(t), lt = t - s.t0, st = { s, lt, take: s.take, u: 0, next: null };
  if (s.k === 'play') st.u = uAt(s, lt);
  else if (s.k === 'end') { const p = plays(), l = p[p.length - 1]; st.take = l.take; st.u = l.u1 + lt; }
  else if (s.k === 'jump') {
    const i = T.shots.indexOf(s), prev = T.shots[i - 1], next = T.shots[i + 1];
    Object.assign(st, { take: prev.take, u: prev.u1 + lt, nextTake: next.take, next: next.u0 - (s.d - lt), jump: F.ease.inOut(F.seg(lt, 0, s.d)) });
  }
  return st;
}
function frameAt(list, u) {
  let lo = 0, hi = list.length - 1;
  if (u <= list[0][0]) return list[0];
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (list[m][0] <= u + 1e-4) lo = m; else hi = m - 1; }
  return list[lo];
}
// ---- the camera: keys in film time, eased between, zoom in log space
let KEYS = [];
const P = (x, y) => [(x - 640) / 100, (500 - y) / 100];
function buildCam() {
  const K = [];
  for (const s of plays()) for (const [u, x, y, h] of s.cam) { const [wx, wy] = P(x, y); K.push([s.t0 + ltOf(s, u), wx, wy, h / 100]); }
  const e = T.shots[T.shots.length - 1];
  K.push([e.t0 + 1.3, 0.2, 0.0, 12.2], [e.t0 + 2.2, 0.2, 0.2, 9.4], [T.dur, 0.2, 0.15, 9.1]);   // v1.1's end framing
  KEYS = K.sort((a, b) => a[0] - b[0]);
}
function cam(t) {
  let i = 1; while (i < KEYS.length - 1 && KEYS[i][0] <= t) i++;
  const a = KEYS[i - 1], b = KEYS[i];
  if (t <= a[0]) return { x: a[1], y: a[2], h: a[3] };
  if (t >= b[0]) return { x: b[1], y: b[2], h: b[3] };
  const k = F.ease.inOut(F.seg(t, a[0], b[0]));
  return { x: F.lerp(a[1], b[1], k), y: F.lerp(a[2], b[2], k), h: Math.exp(F.lerp(Math.log(a[3]), Math.log(b[3]), k)) };
}
function place(c) {
  const dist = c.h / 2 / Math.tan(FOV * Math.PI / 360), tilt = 5 * Math.PI / 180;
  camera.position.set(c.x, c.y - dist * Math.sin(tilt), dist * Math.cos(tilt) + 0.3);
  camera.up.set(0, 1, 0); camera.lookAt(c.x, c.y, 0.3); camera.updateMatrixWorld();
}
// ---- the captions: film time of a shot's footage second, extended into its neighbours at real time
function capTime(s, u) { return u < s.u0 ? s.t0 - (s.u0 - u) : u > s.u1 ? s.t1 + (u - s.u1) : s.t0 + ltOf(s, u); }
let CAPS = [];
function buildCaps() {
  CAPS = plays().flatMap((s) => (s.caps || []).map((c) => ({ id: c.id, shot: s.name, take: s.take, in: capTime(s, c.in), out: capTime(s, c.out),
    umotion: c.boxu || c.motion, motion: c.motion.map((u) => s.t0 + ltOf(s, u)) })));
}
function captionAt(t) {
  for (const c of CAPS) if (t >= c.in && t < c.out) return [WORDS[c.id], Math.min(F.seg(t, c.in, c.in + FADE), 1 - F.seg(t, c.out - FADE, c.out))];
  return [null, 0];
}

async function setup() {
  await F.siteFonts('../');
  THREE.ColorManagement.enabled = false;
  CAP = layout(pick(), W, H);
  const pic = CAP.pic;
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.setPixelRatio(1); renderer.setSize(pic.w, pic.h);
  renderer.domElement.style.cssText = `position:absolute;left:${pic.x}px;top:${pic.y}px`;
  renderer.setClearColor(COL.desk); document.body.insertBefore(renderer.domElement, CAP.canvas);
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(FOV, pic.w / pic.h, 1.0, 120);
  for (const take of new Set(EDL.filter((s) => s.take).map((s) => s.take))) {
    META[take] = await fetch(`${SRC}${take}/meta.json`).then((r) => r.json());
    FR[take] = META[take].frames.map((f) => [f[1], f[0], f[3], f[4], f[5]]);
  }
  T = timeline();
  const fold = folder(scene); fold.hinge.rotation.y = -Math.PI * .93;
  const END = sheet({}); END.position.set(0, -OFF, 0.2); END.userData.u.uHasMap.value = 0; END.userData.u.uPaper.value.set(0.996, 0.98, 0.933); scene.add(END);
  endTex = canvasTex(1400, 1100, () => {});
  const endPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshBasicMaterial({ map: endTex, transparent: true }));
  endPlane.position.set(0, 0, 0.205); scene.add(endPlane);
  PULL = new THREE.Group(); scene.add(PULL);
  A = sheet({}); A.position.z = 0.3; PULL.add(A);
  N = sheet({}); N.position.z = 0.285; N.visible = false; PULL.add(N);
  cursor.build(scene);
  overlays.build(A, META[REGIONS].regions || {}, SRC + REGIONS + '/r/');
  await endCard.load();
  buildCam(); buildCaps();
  window.CUES = cues(); window.DUR = T.dur; window.FPS = 60;
  window.TIMELINE = T.shots.map((s) => {
    const o = { k: s.k, name: s.name || '', take: s.take || '', t0: +s.t0.toFixed(4), t1: +s.t1.toFixed(4), u0: s.u0, u1: s.u1 };
    if (s.R) Object.assign(o, { ramp: { a: s.R.a, b: s.R.b, c: s.R.c, d: s.R.d, smin: s.R.smin, Ti: s.R.Ti, Th: s.R.Th, To: s.R.To },
      map: [...Array(Math.ceil(s.d * 240) + 1)].map((_, i) => [+(s.t0 + i / 240).toFixed(5), +uAt(s, i / 240).toFixed(6)]) });
    return o;
  });
  window.CAPTIONS = CAPS.map((c) => ({ ...c, name: c.id, words: WORDS[c.id], full: [c.in + FADE, c.out - FADE] }));
  window.LAYOUT = { treatment: CAP.name, pic: CAP.pic, strip: CAP.strip, end: endCard.name };
}

function cues() {
  const c = [];
  for (const [take, m] of Object.entries(META)) {
    for (const b of m.beats) { const ft = filmOf(take, b.t); if (ft != null) c.push({ t: ft, type: 'site', take, kind: b.kind, name: b.name, what: b.what, u: b.t }); }
    for (const p of m.presses) { const ft = filmOf(take, p); if (ft != null) c.push({ t: ft, type: 'press', take, u: p }); }
  }
  for (const s of T.shots) {
    if (s.k === 'jump') c.push({ t: s.t0, type: 'pull', dur: s.d });
    if (s.R) c.push({ t: s.t0 + ltOf(s, s.R.a), type: 'ramp', name: s.name, take: s.take, dur: s.R.film, slow: [s.t0 + ltOf(s, s.R.b), s.t0 + ltOf(s, s.R.c)] });
    if (s.k === 'end') for (const x of endCard.cues(s.t0)) c.push(x);
  }
  for (const k of CAPS) c.push({ t: k.in, type: 'caption', name: k.id, shot: k.shot, dur: k.out - k.in, motion: k.motion });
  return c.sort((a, b) => a.t - b.t);
}

// for the checks: the footage frame on each sheet at film time t, the speed, and the camera's view-projection
window.probe = (t) => {
  const st = state(t), s = st.s, L = FR[st.take];
  const fa = frameAt(L, Math.min(st.u, L[L.length - 1][0])), fn = st.next != null ? frameAt(FR[st.nextTake], st.next) : null;
  return { k: s.k, name: s.name || '', take: st.take, u: st.u, next: st.next, nextTake: st.nextTake || null, fa: fa[1], fn: fn && fn[1], speed: s.k === 'play' ? speedAt(s, st.lt) : 1 };
};
window.camMatrix = (t) => { place(cam(t)); return new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).elements; };

async function render(t) {
  const st = state(t);
  const e = T.shots[T.shots.length - 1], k = F.ease.inOut(F.seg(t, e.t0, e.t0 + 1.4));
  PULL.position.set(-19 * k, 0.4 * Math.sin(Math.PI * k), 0.9 * Math.sin(Math.PI * k)); PULL.rotation.z = 2.5 * Math.PI / 180 * k; PULL.visible = k < 1;
  const loads = [];
  if (PULL.visible) {
    const fa = frameAt(FR[st.take], st.u); loads.push(frameInto(A, `${SRC}${st.take}/f/${fa[1]}`, st.take + fa[1]));
    if (st.next != null) { const fn = frameAt(FR[st.nextTake], st.next); loads.push(frameInto(N, `${SRC}${st.nextTake}/f/${fn[1]}`, st.nextTake + fn[1])); }
  }
  N.visible = st.next != null; A.position.x = st.next != null ? -19 * st.jump : 0; A.position.z = 0.3 + (st.next != null ? 0.6 * Math.sin(Math.PI * st.jump) : 0);
  overlays.frame(PULL.visible && st.take === REGIONS ? st.u : null, loads);
  await Promise.all(loads);
  endCard.draw(endTex, t - e.t0);
  const c = cam(t); place(c);
  cursor.frame(PULL.visible && st.next == null ? frameAt(FR[st.take], st.u) : null, META[st.take].presses, st.u, A, c, CAP.pic.h);
  const [words, a] = captionAt(t); CAP.draw(words, a);
  renderer.render(scene, camera);
}

F.film({ dur: 1, fps: 60, cues: [], setup, render });
