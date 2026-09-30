/* v1.4/before.js — part 2: the site before #17, one camera (from ../v1.3/v13.js, 16:9 only).
   It starts on the frame part 1 ends on: v1.4's last sheet, with both credit lines. The join: that sheet is pulled
   aside to the left (the film's jump), and under it the site before #17 is already loading. 「#17 之前 · BEFORE」 is now
   a caption in the film's strip (caption.js), in as the pull uncovers the take and out as the last sheet comes back.
   Then v1.3's one take (take13-before), in real time, with v1.3's framings for the same beats. The end: the last sheet
   is put back from the left on a spring, landing on part 1's last frame.
   ?w=1280 renders a 720p draft; ?cap= picks a caption treatment. */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { sheet, folder, frameInto, canvasTex, COL, OFF } from '../v1/world.js';
import { hand as cursor } from '../v1.1/hand.js';
import { endCard } from './end.js';
import { EDL, WORDS, FADE } from './edl.js';
import { layout, pick } from './caption.js';

const F = window.FILM, q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), H = Math.round(W * 9 / 16), FOV = 30;
const SRC = 'footage/take13-before';
// v1.3's clock: the take starts under the last sheet as it's pulled aside, and holds its last frame under the put-back
const J = 0.3, PULL = [0.08, 1.18], LABEL = 0.8, END_D = 2.6;
const BACK = { freq: .8, zeta: .78 }, LAND = (Math.PI - Math.acos(BACK.zeta)) / (2 * Math.PI * BACK.freq * Math.sqrt(1 - BACK.zeta ** 2));
const X0 = -17.6;
const P1_END = EDL[EDL.length - 1].d;   // part 1's last sheet, finished, as its last frame shows it
let renderer, scene, camera, S, ENDG, endTex, META, BF, TAKE, E0, DUR, KEYS, CAP;

const SY = -OFF;
const P = (x, y) => [(x - 640) / 100, (500 - y) / 100 + SY];
// v1.3's 16:9 framings for the same beats ([x, y, h] in page px)
const FR = { whole: [640, 490, 1200], lock: [205, 88, 330], nav: [860, 385, 760], card: [560, 580, 900], notes: [600, 560, 960],
  tabs: [1030, 520, 900], print: [580, 560, 780], homeLink: [640, 490, 1200] };
const ENDCAM = [0.2, 0.15, 9.1];   // part 1's last camera (promo.js: the end card's last key)
const SHOTS = [
  [3.9, 'whole'], [4.45, 'lock'], [5.05, 'lock'], [5.85, 'nav'], [8.75, 'nav'], [9.45, 'card'], [10.75, 'card'],
  [11.2, 'notes'], [11.6, 'notes'], [12.2, 'tabs'], [14.45, 'tabs'], [15.1, 'print'], [18.2, 'print'],
  [18.9, 'homeLink'], [19.8, 'homeLink'], [20.5, 'whole']
];
function buildCam() {
  const w = (t, [x, y, h]) => { const [wx, wy] = P(x, y); return [t, wx, wy, h / 100]; };
  KEYS = [[0, ...ENDCAM], [0.15, ...ENDCAM], w(1.3, FR.whole)];
  for (const [u, k] of SHOTS) KEYS.push(w(J + u, FR[k]));
  KEYS.push(w(E0, FR.whole), [E0 + 1.25, ...ENDCAM], [DUR, ...ENDCAM]);
  KEYS.sort((a, b) => a[0] - b[0]);
}
function cam(t) {
  let i = 1; while (i < KEYS.length - 1 && KEYS[i][0] <= t) i++;
  const a = KEYS[i - 1], b = KEYS[i];
  if (t >= b[0]) return { x: b[1], y: b[2], h: b[3] };
  const k = F.ease.inOut(F.seg(t, a[0], b[0]));
  return { x: F.lerp(a[1], b[1], k), y: F.lerp(a[2], b[2], k), h: Math.exp(F.lerp(Math.log(a[3]), Math.log(b[3]), k)) };
}
function place(c) {
  const dist = c.h / 2 / Math.tan(FOV * Math.PI / 360), tilt = 5 * Math.PI / 180;
  camera.position.set(c.x, c.y - dist * Math.sin(tilt), dist * Math.cos(tilt) + 0.3);
  camera.up.set(0, 1, 0); camera.lookAt(c.x, c.y, 0.3);
}
function frameAt(list, u) {
  let lo = 0, hi = list.length - 1;
  if (u <= list[0][0]) return list[0];
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (list[m][0] <= u + 1e-4) lo = m; else hi = m - 1; }
  return list[lo];
}
// the label: fully in as the pull uncovers the take, out as the last sheet starts back
const labelAlpha = (t) => Math.min(F.seg(t, LABEL - FADE, LABEL), 1 - F.seg(t, E0 - FADE / 2, E0 + FADE / 2));

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
  BF = META.frames.map((f) => [f[1], f[0], f[3], f[4], f[5]]);
  TAKE = META.dur; E0 = J + TAKE; DUR = E0 + END_D;
  const fold = folder(scene); fold.hinge.rotation.y = -Math.PI * .93;
  S = sheet({}); S.position.set(0, SY, 0.1); scene.add(S);
  ENDG = new THREE.Group(); scene.add(ENDG);
  const END = sheet({}); END.position.set(0, -OFF, 0.2); END.userData.u.uHasMap.value = 0; END.userData.u.uPaper.value.set(0.996, 0.98, 0.933); ENDG.add(END);
  endTex = canvasTex(1400, 1100, () => {});
  const endPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshBasicMaterial({ map: endTex, transparent: true }));
  endPlane.position.set(0, 0, 0.205); ENDG.add(endPlane);
  cursor.build(scene);
  await endCard.load();
  endCard.draw(endTex, P1_END);
  buildCam();
  window.DUR = DUR; window.FPS = 60; window.CUES = cues();
  window.TIMELINE = [{ k: 'join', t0: 0, t1: PULL[1] + 0.12 }, { k: 'play', t0: J, t1: +E0.toFixed(3), u0: 0, u1: TAKE }, { k: 'end', t0: +E0.toFixed(3), t1: +DUR.toFixed(3) }];
  window.CAPTIONS = [{ id: 'before', words: WORDS.before, in: LABEL - FADE, out: E0 + FADE / 2, full: [LABEL, E0 - FADE / 2] }];
  window.LAYOUT = { treatment: CAP.name, pic: CAP.pic, strip: CAP.strip };
}

function cues() {
  const c = [{ t: PULL[0], type: 'pull', dur: PULL[1] - PULL[0] }, { t: LABEL, type: 'label' }];
  for (const b of META.beats) c.push({ t: J + b.t, type: 'site', kind: b.kind, name: b.name, what: b.what, u: b.t });
  for (const p of META.presses) c.push({ t: J + p, type: 'press' });
  for (const [u, k] of SHOTS) c.push({ t: +(J + u).toFixed(3), type: 'frame', name: k });
  c.push({ t: E0, type: 'putback', dur: +LAND.toFixed(3) }, { t: +(E0 + LAND).toFixed(3), type: 'land' });
  return c.sort((a, b) => a.t - b.t);
}
window.probe = (t) => ({ u: F.clamp(t - J, 0, TAKE), f: frameAt(BF, F.clamp(t - J, 0, TAKE))[1] });

async function render(t) {
  let k, x;
  if (t < E0) { k = F.ease.inOut(F.seg(t, PULL[0], PULL[1])); x = -19 * k; }
  else { x = X0 * (1 - F.spring(t - E0, BACK.freq, BACK.zeta)); k = x / X0; }
  const arc = Math.sin(Math.PI * F.clamp(k));
  ENDG.position.set(x, 0.4 * arc, 0.9 * arc); ENDG.rotation.z = 2.5 * Math.PI / 180 * k;
  ENDG.visible = t >= E0 || k < 1;
  const u = F.clamp(t - J, 0, TAKE), f = frameAt(BF, u);
  await frameInto(S, `${SRC}/f/${f[1]}`, f[1]);
  const c = cam(t); place(c);
  cursor.frame(t >= PULL[1] && t < E0 ? f : null, META.presses, u, S, c, CAP.pic.h);
  CAP.draw(WORDS.before, labelAlpha(t));
  renderer.render(scene, camera);
}

F.film({ dur: 1, fps: 60, cues: [], setup, render });
