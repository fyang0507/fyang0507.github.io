/* v1.3/v13.js — part 2 of v1.3: the site before #17, one camera.
   Part 1 is v1.1's 30 s cut, unchanged, and ends on the last sheet (继续写，继续造, the seals, the credit). This page
   starts on that same frame. The join: the last sheet is pulled aside to the left (the film's jump, #35's chapter move),
   and under it the site before #17 is already loading; 「#17 之前 · BEFORE」 is stamped once in its top margin. Then
   one take (cap/scenarios/before-v13.mjs), in real time, framed shot by shot as part 1 framed the same beats: home and
   its lockup, the book, the board's lead card, the tabs, the print, home again. No replays, no notes, no lifts. The
   end: the last sheet is put back from the left (a chapter before this one), landing on part 1's last frame.
   ?w=1280 renders a 720p draft; ?ar=9x16&w=1080 the tall one (1080 × 1920). */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { sheet, folder, frameInto, canvasTex, COL, OFF } from '../v1/world.js';
import { endCard } from '../v1/end.js';
import { hand as cursor } from '../v1.1/hand.js';

const F = window.FILM, q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), AR = q.get('ar') === '9x16' ? 9 / 16 : 16 / 9, H = Math.round(W / AR), FOV = 30, TALL = AR < 1;
const SRC = 'footage/take13-before';
// film seconds: the take starts under the last sheet as it's pulled aside, and holds its last frame under the put-back
const J = 0.3, PULL = [0.08, 1.18], STAMP_T = 0.8, END_D = 2.6;
// the put-back is on the physics clock: a spring with one small overshoot, from just outside the frame's left edge
const BACK = { freq: .8, zeta: .78 }, LAND = (Math.PI - Math.acos(BACK.zeta)) / (2 * Math.PI * BACK.freq * Math.sqrt(1 - BACK.zeta ** 2));
const X0 = TALL ? -11.1 : -17.6;   // the whole framing's half width, the sheet's half width, and a little
let renderer, scene, camera, fold, S, ENDG, endTex, META, BF, TAKE, E0, DUR, KEYS;

// the take sits where the last sheet sits (its page centred on the sheet's centre), so the stack is square
const SY = -OFF;
const P = (x, y) => [(x - 640) / 100, (500 - y) / 100 + SY];
// part 1's framings for the same beats ([x, y, h] in page px), 16:9 and 9:16; each close framing keeps the label
// either whole or out of frame (the tall frame has the room to keep it in most of them)
const FR = TALL ? {
  whole: [640, 480, 1500], lock: [205, 95, 620], nav: [800, 420, 1250], card: [520, 560, 1300], notes: [640, 560, 1300],
  tabs: [1080, 580, 1100], print: [600, 505, 1170], homeLink: [470, 480, 1500]
} : {
  whole: [640, 490, 1200], lock: [205, 88, 330], nav: [860, 385, 760], card: [560, 580, 900], notes: [600, 560, 960],
  tabs: [1030, 520, 900], print: [580, 560, 780], homeLink: [640, 490, 1200]
};
// part 1's last camera (v1.1/v11.js: the end card's last key), world units
const ENDCAM = TALL ? [0.2, 0.25, 14.8] : [0.2, 0.15, 9.1];
// [footage s, framing]: the camera arrives at each key and holds between them
const SHOTS = [
  [3.9, 'whole'], [4.45, 'lock'], [5.05, 'lock'],             // the desk arrives; the lockup, typeset
  [5.85, 'nav'], [8.75, 'nav'],                               // the book, the hard cut to Writing, the building tab
  [9.45, 'card'], [10.75, 'card'],                            // the board's lead card, the hard cut into the field notes
  [11.2, 'notes'], [11.6, 'notes'], [12.2, 'tabs'], [14.45, 'tabs'],   // Principles, the shooting tab
  [15.1, 'print'], [18.2, 'print'],                           // a print into the lightbox, and out
  [18.9, 'homeLink'], [19.8, 'homeLink'], [20.5, 'whole']     // home: the hard cut, the desk fades in
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

// the label: stamped once in the take's top margin, in ink (coral is the seals'), pressed for two frames
const KL = 1.8, LX = (x) => (30 + x) * KL, LY = (y) => (78 + y) * KL;
let lastKey = '';
function drawLabel(t) {
  const on = t >= STAMP_T, press = on && t - STAMP_T < 2 / 60 ? 1.04 : 1, key = on + '|' + press;
  if (key === lastKey) return; lastKey = key;
  const tex = S.userData.label, c = tex.userData.canvas, x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  if (on) {
    // 「#17 之前 · BEFORE」: the Chinese, a centred dot with equal room either side, the English in small caps' place
    const zh = '#17 之前', en = 'BEFORE', s = 34 * KL, ls = s * .08, g = s * .3, dot = s * .11;
    x.save(); x.translate(LX(700), LY(-39)); x.rotate(-0.012); x.scale(press, press);
    x.font = `600 ${s}px "Noto Serif SC"`; const w1 = x.measureText(zh).width;
    x.font = `500 ${s * .72}px "IBM Plex Mono"`; x.letterSpacing = ls + 'px'; const w2 = x.measureText(en).width - ls;
    const pad = s * .45, w = pad + w1 + g + dot + g + w2 + pad, h = s * 1.62, x0 = -w / 2 + pad;
    x.strokeStyle = COL.ink; x.lineWidth = 2.4 * KL; x.strokeRect(-w / 2, -h / 2, w, h);
    x.fillStyle = COL.ink; x.textBaseline = 'middle';
    x.font = `600 ${s}px "Noto Serif SC"`; x.letterSpacing = '0px'; x.fillText(zh, x0, s * .04);
    x.beginPath(); x.arc(x0 + w1 + g + dot / 2, s * .02, dot / 2, 0, Math.PI * 2); x.fill();
    x.font = `500 ${s * .72}px "IBM Plex Mono"`; x.letterSpacing = ls + 'px'; x.fillText(en, x0 + w1 + g + dot + g, s * .06);
    x.restore();
  }
  tex.needsUpdate = true;
}

async function setup() {
  await F.siteFonts('../');
  THREE.ColorManagement.enabled = false;
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.setClearColor(COL.desk); document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(FOV, W / H, 1.0, 120);
  META = await fetch(`${SRC}/meta.json`).then((r) => r.json());
  BF = META.frames.map((f) => [f[1], f[0], f[3], f[4], f[5]]);
  TAKE = META.dur; E0 = J + TAKE; DUR = E0 + END_D;
  fold = folder(scene); fold.hinge.rotation.y = -Math.PI * .93;   // open, as through part 1
  // the take, on the folder under the last sheet
  S = sheet({}); S.position.set(0, SY, 0.1); scene.add(S);
  // the last sheet, exactly as part 1 leaves it (v1.1/v11.js), in one group so it can be pulled aside and put back
  ENDG = new THREE.Group(); scene.add(ENDG);
  const END = sheet({}); END.position.set(0, -OFF, 0.2); END.userData.u.uHasMap.value = 0; END.userData.u.uPaper.value.set(0.996, 0.98, 0.933); ENDG.add(END);
  endTex = canvasTex(1400, 1100, () => {});
  const endPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshBasicMaterial({ map: endTex, transparent: true }));
  endPlane.position.set(0, 0, 0.205); ENDG.add(endPlane);
  cursor.build(scene);
  await endCard.load();
  endCard.draw(endTex, 6.4, true);   // part 1's end card, finished: the motto, the seals, the credit
  buildCam();
  window.DUR = DUR; window.FPS = 60; window.CUES = cues();
  window.TIMELINE = [{ k: 'join', t0: 0, t1: PULL[1] + 0.12 }, { k: 'play', t0: J, t1: +E0.toFixed(3), u0: 0, u1: TAKE }, { k: 'end', t0: +E0.toFixed(3), t1: +DUR.toFixed(3) }];
}

function cues() {
  const c = [{ t: PULL[0], type: 'pull', dur: PULL[1] - PULL[0] }, { t: STAMP_T, type: 'label' }];
  for (const b of META.beats) c.push({ t: J + b.t, type: 'site', kind: b.kind, name: b.name, what: b.what, u: b.t });
  for (const p of META.presses) c.push({ t: J + p, type: 'press' });
  for (const [u, k] of SHOTS) c.push({ t: +(J + u).toFixed(3), type: 'frame', name: k });   // the camera's keys, for the shot list
  c.push({ t: E0, type: 'putback', dur: +LAND.toFixed(3) }, { t: +(E0 + LAND).toFixed(3), type: 'land' });
  return c.sort((a, b) => a.t - b.t);
}

async function render(t) {
  // the last sheet: pulled aside to the left at the join, put back from the left at the end
  let k, x;
  if (t < E0) { k = F.ease.inOut(F.seg(t, PULL[0], PULL[1])); x = -19 * k; }
  else { x = X0 * (1 - F.spring(t - E0, BACK.freq, BACK.zeta)); k = x / X0; }
  const arc = Math.sin(Math.PI * F.clamp(k));
  ENDG.position.set(x, 0.4 * arc, 0.9 * arc); ENDG.rotation.z = 2.5 * Math.PI / 180 * k;
  ENDG.visible = t >= E0 || k < 1;
  const u = F.clamp(t - J, 0, TAKE), f = frameAt(BF, u);
  await frameInto(S, `${SRC}/f/${f[1]}`, f[1]);
  drawLabel(t);
  const c = cam(t); place(c);
  // the hand only while the take is uncovered
  cursor.frame(t >= PULL[1] && t < E0 ? f : null, META.presses, u, S, c, H);
  renderer.render(scene, camera);
}

F.film({ dur: 1, fps: 60, cues: [], setup, render });
