/* b-machine/machine.js — style test B, 「纸机器 · Paper machine」. 12 s at 100 BPM (a beat is 0.6 s).

   Round one's pages go through the machine one by one. Each is closed into an accordion, turned end over end and
   opened again, and it comes out as round two's page, because that page was printed on its back. The machine stamps
   what changed beside it, in outline, then the camera pulls back over the three new pages, the music stops for a beat
   and the seals are stamped on the kraft.

   Everything lands on the grid: a crease closes, a fan lands, a sheet opens on a beat (FILM.spring's first arrival is
   placed on it). Paper is on the physics clock; the stamps arrive on the hand's clock (held frames). */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Sheet, SHEET_W, SHEET_H, printTexture, labelTexture, sealTexture } from './paper.js';
import { boardPanels } from './board.js';

const F = window.FILM, B = 60 / 100, beat = (k) => k * B;
// Time from a spring's start to its first arrival at 1 (FILM.spring's step response), so arrivals sit on beats.
const lead = (f, z = 0.6) => (Math.PI - Math.atan(Math.sqrt(1 - z * z) / z)) / (2 * Math.PI * f * Math.sqrt(1 - z * z));
const GMAX = 1.4, REST = 0.035;
const FC = 1.9, FT = 1.6, FO = 1.25, FD = .7;   // spring frequencies: close, turn, open, the first drop

export const SHEETS = [
  { a: 'r1-building', b: 'main-building', x: 0, capA: ['BUILDING · ROUND ONE · #17', '5983c8b'], capB: ['BUILDING · ROUND TWO · #23 #28 #33', '5c13009'],
    feed: beat(1), close: beat(3), turn: beat(4), open: beat(5),
    labels: [[beat(6), '#23 · a static board · LCP 932 → 868 ms at 1440'], [beat(7), '#33 · the board set in Fraunces']] },
  { a: 'r1-principles', b: 'main-principles-read', x: 22, capA: ['FRED AGENT · PRINCIPLES · ROUND ONE', '5983c8b'], capB: ['FRED AGENT · PRINCIPLES · ROUND TWO · #32', '5c13009'],
    close: beat(9), turn: beat(9.5), open: beat(10.5), labels: [[beat(11), "#32 · Reading's margin rail is the table of contents"]] },
  { a: 'r0-building', b: 'main-dossier', x: 44, capA: ['BUILDING · BEFORE ROUND ONE', '6237120'], capB: ['BUILDING · ROUND TWO · #28', '5c13009'],
    close: beat(13), turn: beat(13.5), open: beat(14.5), labels: [[beat(15), '#28 · every card gets its dossier']] }
];
const HUSH = beat(17), STAMP = beat(18), COLOPHON = beat(19);

// The shots: [start, hit, target x, target y, distance scale], each move a heavy spring (zeta .8), arriving on its hit.
const MOVES = [[beat(8) - lead(1.1, .8), beat(8), 22, 0, 0], [beat(12) - lead(1.1, .8), beat(12), 22, 0, 0], [beat(16) - lead(.8, .8), beat(16), -22, -0.9, 1.85]];

export function sheetPose(s, t) {
  const p = { gamma: 0, psi: 0, at: [s.x, 0], lift: 0, creases: 0 };
  // the first sheet falls onto the bed from near the lens, and lands on the beat
  if (s.feed != null) { const k = F.spring(t - (s.feed - lead(FD, .5)), FD, .5); p.lift = 5 * Math.abs(1 - k); p.rot = .09 * (1 - k); p.at[1] = 1.6 * (1 - k); }
  const c0 = s.close - lead(FC), t0 = s.turn - lead(FT), o0 = s.open - lead(FO);
  if (t >= c0) { p.gamma = GMAX * F.spring(t - c0, FC); p.creases = 1; }
  if (t >= t0) { p.psi = Math.PI * F.spring(t - t0, FT); p.lift += 0.7 * Math.sin(Math.PI * F.seg(t, t0, s.turn + .25)); }
  if (t >= o0) {
    const k = F.spring(t - o0, FO), g = GMAX * (1 - k);
    p.gamma = (g < 0 ? -g * 0.7 : g) + REST * F.clamp(k);
  }
  return p;
}

export function cues() {
  const L = [{ t: 0, type: 'grid', bpm: 100 }];
  SHEETS.forEach((s, i) => {
    if (s.feed != null) L.push({ t: 0, type: 'feed', hit: s.feed, i });
    L.push({ t: s.close - lead(FC), type: 'close', hit: s.close, i }, { t: s.turn - lead(FT), type: 'turn', hit: s.turn, i }, { t: s.open - lead(FO), type: 'open', hit: s.open, i });
    s.labels.forEach(([t], k) => L.push({ t, type: 'label', i, k }));
  });
  MOVES.forEach(([t0, hit], k) => L.push({ t: t0, type: k < 2 ? 'pan' : 'pull', hit }));
  L.push({ t: HUSH, type: 'hush', dur: STAMP - HUSH }, { t: STAMP, type: 'stamp' }, { t: COLOPHON, type: 'label', small: true });
  return L.sort((a, b) => a.t - b.t);
}

// ---------------------------------------------------------------- the world

let renderer, scene, camera, sheets = [], labels = [], seal, colophon, imgs = {};
const flat = (tex, w, h, z = 0.003) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.position.z = z; return m;
};

async function setup() {
  THREE.ColorManagement.enabled = false;
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(1); renderer.setSize(1920, 1080);
  document.body.appendChild(renderer.domElement);
  const names = new Set(); SHEETS.forEach((s) => { names.add(s.a); names.add(s.b); });
  boardPanels.extraImages.forEach((n) => names.add(n));
  await Promise.all([F.siteFonts('../'), ...[...names].map((n) => F.img(n.includes('/') ? n : '../captures/' + n + '.jpg').then((i) => { imgs[n] = i; }))]);
  const svg = await (await fetch('seals.svg')).text();

  scene = new THREE.Scene(); scene.background = new THREE.Color('#C9AE83');
  camera = new THREE.PerspectiveCamera(28, 16 / 9, 0.5, 400); camera.up.set(0, 1, 0);
  // the machine's bed: the wheat band across the kraft, with its darker edge
  const band = new THREE.Mesh(new THREE.PlaneGeometry(220, 6.2), new THREE.MeshBasicMaterial({ color: '#DCCF98' }));
  band.position.set(30, 0, 0); scene.add(band);
  [-3.1, 3.1].forEach((y) => { const e = new THREE.Mesh(new THREE.PlaneGeometry(220, .06), new THREE.MeshBasicMaterial({ color: '#AD9650' })); e.position.set(30, y, .001); scene.add(e); });

  SHEETS.forEach((s, i) => {
    const sh = new Sheet(printTexture(imgs[s.a], ...s.capA, renderer), printTexture(imgs[s.b], ...s.capB, renderer), 4);
    scene.add(sh.turn); sheets.push(sh);
    s.labels.forEach(([t, text], k) => {
      const L = labelTexture(text), h = 0.82, m = flat(L.tex, h * L.aspect, h);
      m.position.set(s.x - SHEET_W / 2 + h * L.aspect / 2, -6.6 - k * 1.15, .003);
      m.rotation.z = (F.rng(text)() - .5) * .014;
      scene.add(m); labels.push({ m, t, s0: m.scale.clone() });
    });
  });
  const S = await sealTexture(svg, '#D9695A');
  seal = flat(S.tex, 8.6, 8.6 / S.aspect, .004); seal.position.set(22, -11.6, .004); seal.rotation.z = -.012; scene.add(seal);
  const C = labelTexture('fyang0507.github.io · round two · #18–#34', { size: 34, box: false, color: '#33302B' });
  colophon = flat(C.tex, 1.0 * C.aspect, 1.0); colophon.position.set(22, -15.4, .003); scene.add(colophon);
  return { THREE, renderer, scene, camera, sheets, imgs, svg, labels, seal, colophon };
}

function cam(t) {
  let x = 0, y = 0, s = 1.16 - 0.14 * F.ease.sine(F.seg(t, 0, beat(8)));
  MOVES.forEach(([t0, , dx, dy, ds]) => { const k = F.spring(t - t0, t0 > 9 ? .8 : 1.1, .8); x += dx * k; y += dy * k; s += ds * k; });
  // the last move: from the whole table down onto the seal
  const e = F.ease.inOut(F.seg(t, STAMP + .15, 12.4));
  y += -8.5 * e; s -= 1.9 * e;
  let shake = 0; const d = t - STAMP; if (d >= 0 && d < 4 / 60) shake = [.09, -.05, .025, 0][Math.floor(d * 60)];
  return { tx: x, ty: y - 1.6, s, shake };
}

export function place(c) {
  const off = new THREE.Vector3(-2.2, -12.4, 19.6).multiplyScalar(c.s);
  camera.position.set(c.tx + off.x, c.ty + off.y + c.shake, off.z);
  camera.lookAt(c.tx, c.ty + c.shake * .5, 0.4);
}

// A stamped mark arrives in two held frames (a hair large, then down), on the hand's clock.
function stamped(m, t, t0) {
  m.visible = t >= t0;
  const k = F.held(t - t0, 12) < 1 / 12 ? 1.05 : 1;
  m.scale.set(k, k, 1);
}

function render(t) {
  SHEETS.forEach((s, i) => sheets[i].pose(sheetPose(s, t)));
  labels.forEach((l) => stamped(l.m, t, l.t));
  stamped(seal, t, STAMP); stamped(colophon, t, COLOPHON);
  place(cam(t));
  renderer.render(scene, camera);
}

const q = new URLSearchParams(location.search);
if (q.has('board')) {
  setup().then((w) => boardPanels.draw(w, { sheetPose, place, SHEETS, Sheet, printTexture, labelTexture }));
} else {
  F.film({ dur: 12, cues: cues(), setup, render });
}
