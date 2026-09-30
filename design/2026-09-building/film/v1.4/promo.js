/* v1.4/promo.js — part 1, the promo (from ../v1.1/v11.js): the complete "after", on v1.1's take and v1.1's route.
   What v1.4 changed:
   · no ⅓× replays: three motions slow down inside the running take instead (ramp.js), from its true 180 fps frames;
   · no pen in the margins: no chapter names, no ⅓× mark, no slips. The film speaks only in its caption strip
     (caption.js), outside the picture, never on the page;
   · the print is reframed so its peg stays in frame from the click until the print lands in the viewer;
   · the jumps keep both sheets playing (the one leaving and the one under it), so no footage is ever held;
   · the last sheet credits the baseline (end.js).
   16:9 only. ?w=1280 renders a 720p draft; ?cap= picks a caption treatment (caption.js). */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { sheet, folder, frameInto, canvasTex, COL, OFF } from '../v1/world.js';
import { hand as cursor, overlays } from '../v1.1/hand.js';
import { EDL, WORDS, FADE } from './edl.js';
import { ramp, shotLen, uAt, ltOf, speedAt } from './ramp.js';
import { layout, pick } from './caption.js';
import { endCard } from './end.js';

const F = window.FILM, q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), H = Math.round(W * 9 / 16), FOV = 30;
const SRC = 'footage/take11-after';
let renderer, scene, camera, fold, A, N, END, T, AF, endTex, CAP, PULL, META;

// ---- the timeline: film time for each shot
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
// film time of footage u inside a play shot (or null)
function filmOf(u) { const s = plays().find((x) => u >= x.u0 && u < x.u1); return s ? s.t0 + ltOf(s, u) : null; }
function state(t) {
  const s = shotAt(t), lt = t - s.t0, st = { s, lt, u: 0, next: null };
  if (s.k === 'play') st.u = uAt(s, lt);
  else if (s.k === 'end') { const p = plays(); st.u = p[p.length - 1].u1 + lt; }   // the take goes on as it is pulled aside
  else if (s.k === 'jump') {
    const i = T.shots.indexOf(s), prev = T.shots[i - 1], next = T.shots[i + 1];
    st.u = prev.u1 + lt; st.next = next.u0 - (s.d - lt); st.jump = F.ease.inOut(F.seg(lt, 0, s.d));
  }
  return st;
}
// ---- footage: the frame on screen at footage time u
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
  CAPS = plays().filter((s) => s.cap).map((s) => ({ id: s.cap.id, name: s.name, in: capTime(s, s.cap.in), out: capTime(s, s.cap.out), umotion: s.boxu || s.motion, motion: s.motion.map((u) => s.t0 + ltOf(s, u)) }));
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
  META = await fetch(`${SRC}/meta.json`).then((r) => r.json());
  AF = META.frames.map((f) => [f[1], f[0], f[3], f[4], f[5]]);
  T = timeline();
  fold = folder(scene); fold.hinge.rotation.y = -Math.PI * .93;   // open, as in v1.1's short cut
  END = sheet({}); END.position.set(0, -OFF, 0.2); END.userData.u.uHasMap.value = 0; END.userData.u.uPaper.value.set(0.996, 0.98, 0.933); scene.add(END);
  endTex = canvasTex(1400, 1100, () => {});
  const endPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshBasicMaterial({ map: endTex, transparent: true }));
  endPlane.position.set(0, 0, 0.205); scene.add(endPlane);
  PULL = new THREE.Group(); scene.add(PULL);
  A = sheet({}); A.position.z = 0.3; PULL.add(A);
  N = sheet({}); N.position.z = 0.285; N.visible = false; PULL.add(N);   // the next moment, under the page, for a jump
  cursor.build(scene);
  overlays.build(A, META.regions || {}, SRC + '/r/');
  await endCard.load();
  buildCam(); buildCaps();
  window.CUES = cues(); window.DUR = T.dur; window.FPS = 60;
  window.TIMELINE = T.shots.map((s) => {
    const o = { k: s.k, name: s.name || '', t0: +s.t0.toFixed(4), t1: +s.t1.toFixed(4), u0: s.u0, u1: s.u1 };
    if (s.R) Object.assign(o, { ramp: { a: s.R.a, b: s.R.b, c: s.R.c, d: s.R.d, smin: s.R.smin, Ti: s.R.Ti, Th: s.R.Th, To: s.R.To },
      map: [...Array(Math.ceil(s.d * 240) + 1)].map((_, i) => [+(s.t0 + i / 240).toFixed(5), +uAt(s, i / 240).toFixed(6)]) });
    return o;
  });
  window.CAPTIONS = CAPS.map((c) => ({ ...c, words: WORDS[c.id], full: [c.in + FADE, c.out - FADE] }));
  window.LAYOUT = { treatment: CAP.name, pic: CAP.pic, strip: CAP.strip };
  window.END_T0 = T.shots[T.shots.length - 1].t0;
}

function cues() {
  const c = [];
  for (const b of META.beats) { const ft = filmOf(b.t); if (ft != null) c.push({ t: ft, type: 'site', kind: b.kind, name: b.name, what: b.what, u: b.t }); }
  for (const p of META.presses) { const ft = filmOf(p); if (ft != null) c.push({ t: ft, type: 'press', u: p }); }
  for (const s of T.shots) {
    if (s.k === 'jump') c.push({ t: s.t0, type: 'pull', dur: s.d });
    if (s.R) c.push({ t: s.t0 + ltOf(s, s.R.a), type: 'ramp', name: s.name, dur: s.R.film, slow: [s.t0 + ltOf(s, s.R.b), s.t0 + ltOf(s, s.R.c)] });
    if (s.k === 'end') for (const x of endCard.cues(s.t0)) c.push(x);
  }
  for (const k of CAPS) c.push({ t: k.in, type: 'caption', name: k.id, dur: k.out - k.in, motion: k.motion });
  return c.sort((a, b) => a.t - b.t);
}

// for the checks: the footage frame on each sheet at film time t, the speed, and a page point on screen
window.probe = (t) => {
  const st = state(t), s = st.s;
  const fa = frameAt(AF, Math.min(st.u, AF[AF.length - 1][0])), fn = st.next != null ? frameAt(AF, st.next) : null;
  return { k: s.k, name: s.name || '', u: st.u, next: st.next, fa: fa[1], fn: fn && fn[1], speed: s.k === 'play' ? speedAt(s, st.lt) : 1 };
};
// the camera's view-projection at film time t (a play shot's page is at z 0.3), for checks/peg.py and checks/boxes.py
window.camMatrix = (t) => { place(cam(t)); return new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).elements; };

async function render(t) {
  const st = state(t);
  // the finished sheet pulled aside at the end, and the last sheet is there
  const e = T.shots[T.shots.length - 1], k = F.ease.inOut(F.seg(t, e.t0, e.t0 + 1.4));
  PULL.position.set(-19 * k, 0.4 * Math.sin(Math.PI * k), 0.9 * Math.sin(Math.PI * k)); PULL.rotation.z = 2.5 * Math.PI / 180 * k; PULL.visible = k < 1;
  const loads = [];
  if (PULL.visible) {
    const fa = frameAt(AF, st.u); loads.push(frameInto(A, `${SRC}/f/${fa[1]}`, fa[1]));
    if (st.next != null) { const fn = frameAt(AF, st.next); loads.push(frameInto(N, `${SRC}/f/${fn[1]}`, fn[1])); }
  }
  // a jump: the sheet in front pulled aside to the left, the next moment already there under it
  N.visible = st.next != null; A.position.x = st.next != null ? -19 * st.jump : 0; A.position.z = 0.3 + (st.next != null ? 0.6 * Math.sin(Math.PI * st.jump) : 0);
  overlays.frame(PULL.visible ? st.u : null, loads);
  await Promise.all(loads);
  endCard.draw(endTex, t - e.t0);
  const c = cam(t); place(c);
  cursor.frame(PULL.visible && st.next == null ? frameAt(AF, st.u) : null, META.presses, st.u, A, c, CAP.pic.h);
  const [words, a] = captionAt(t); CAP.draw(words, a);
  renderer.render(scene, camera);
}

F.film({ dur: 1, fps: 60, cues: [], setup, render });
