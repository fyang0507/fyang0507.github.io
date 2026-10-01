/* c-shot/shot.js — style test C, 「一镜到底 · One continuous shot」. 15 s, no cuts.

   One camera, one move: the desk (the home page's drawing, a paper theatre) → into the laptop's screen, where the
   Building board is → the pin pops and the Fred Agent card comes out of the screen into your hand → its dossier
   slides out from behind it → the 03 tab flies to the chapter's fore-edge as the chapter is laid over the dossier →
   the margin rail is drawn by the pen → up the page to the header, where the motto is written and the seals stamped.

   Paper moves on the physics clock (FILM.spring: one small overshoot, then settle). The pen, the pin's pop and the
   rail's ticks move on the hand's clock (FILM.held). The camera is a mass on authored keys: target, distance (in log
   space, so the zoom from the desk to one tab reads as one even move), yaw, pitch; a cubic Hermite through them with
   Catmull-Rom tangents, so it never stops between keys and never jerks. */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { build, RAIL } from './world.js';
import { drawRail, drawTag, dots, tickCues, CUES, T } from './marks.js';

const F = window.FILM, DUR = 15;
const R = '../../../../assets/derived/';
const SRC = {
  plate: R + 'desk/plate.webp', edge: R + 'desk/edge.webp', leaf: R + 'desk/leaf.webp', laptop: R + 'desk/laptop.webp', mug: R + 'desk/mug.webp',
  plant: R + 'desk/plant.webp', camera: R + 'desk/camera.webp', 'tone-plant': R + 'desk/tone-plant.webp', 'tone-laptop': R + 'desk/tone-laptop.webp',
  'tone-mug': R + 'desk/tone-mug.webp', 'tone-camera': R + 'desk/tone-camera.webp', 'strip-frame': R + 'strip/frame-616.webp',
  'strip-book': R + 'strip/book-462.webp', 'strip-bird': R + 'strip/bird6-308.webp',
  'b-clean': 'parts/b-clean.jpg', 'b-card': 'parts/b-card.png', 'b-peek': 'parts/b-peek.png', 'b-pin': 'parts/b-pin.png', 'd-sheet': 'parts/d-sheet.png',
  'd-tab1': 'parts/d-tab1.png', 'd-tab2': 'parts/d-tab2.png', 'd-tab3': 'parts/d-tab3.png', 'd-tab4': 'parts/d-tab4.png', 'd-tab5': 'parts/d-tab5.png',
  'p-page': 'parts/p-page.jpg', 'p-tab3': 'parts/p-tab3.png', 'p-seal': 'parts/p-seal.png'
};
let renderer, camera, W, railCv, tagCv, railTex, tagTex;
const texs = {};

async function setup() {
  const [geo] = await Promise.all([fetch('parts/geo.json').then((r) => r.json()), F.siteFonts('../')]);
  window.PARTS = geo; tickCues(geo['p-rail']);
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(+(new URLSearchParams(location.search).get('px') || 2));
  renderer.setSize(1920, 1080); renderer.setClearColor(0xFBF6EC, 1); renderer.localClippingEnabled = true;
  document.body.appendChild(renderer.domElement);
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const imgs = await Promise.all(Object.keys(SRC).map((k) => F.img(SRC[k]).then((i) => [k, i])));
  for (const [k, i] of imgs) { const t = new THREE.Texture(i); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; t.needsUpdate = true; texs[k] = t; }
  railCv = document.createElement('canvas'); railCv.width = RAIL.w * RAIL.k; railCv.height = RAIL.h * RAIL.k;
  tagCv = document.createElement('canvas'); tagCv.width = 168 * 6; tagCv.height = 68 * 6;
  railTex = new THREE.CanvasTexture(railCv); tagTex = new THREE.CanvasTexture(tagCv);
  [railTex, tagTex].forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; });
  const dt = new THREE.CanvasTexture(dots(713, 490)); dt.colorSpace = THREE.SRGBColorSpace;
  const tex = (k) => (k === 'rail' ? railTex : k === 'tag' ? tagTex : k === 'dots' ? dt : texs[k]);
  W = build(THREE, tex);
  if (Q.get('chap')) { const i = await F.img('../captures/' + Q.get('chap') + '.jpg'); const t = new THREE.Texture(i); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; t.needsUpdate = true; W.chapPaper.material.map = t; W.rail.material.opacity = 0; W.chapPaper.scale.set(1, 900 / 1600, 1); W.chapPaper.position.y = -450; }
  camera = new THREE.PerspectiveCamera(28, 16 / 9, 1, 20000);
  // The card is clipped at the screen's bottom edge until it comes out of the screen.
  W.clip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  [W.paper, W.peek].forEach((m) => { m.material.clippingPlanes = [W.clip]; });
  W.scene.updateMatrixWorld(true);
  W.screenBottom = W.page.localToWorld(new THREE.Vector3(0, -831, 0)).y;
}

// ---- the camera: keys are [t, space, x, y, z, distance, yaw°, pitch°]; space 'd' desk px (y down), 'p' page px
const KEYS = [
  [0.0, 'd', 724, 600, 0, 1720, 0, 0],
  [2.2, 'd', 522, 390, 30, 760, 7, 3],
  [3.7, 'p', 530, 590, 0, 262, 1, 0],
  [4.25, 'p', 540, 560, 10, 250, 0, 0],
  [5.4, 'p', 705, 250, 200, 310, -4, 2],
  [7.1, 'p', 745, 460, 198, 345, -6, 1],
  [8.35, 'p', 1070, 440, 215, 215, -7, 1],
  [9.1, 'p', 1010, 520, 215, 225, -3, 1],
  [10.0, 'p', 640, 760, 215, 235, 5, 2],
  [11.4, 'p', 650, 1180, 215, 240, 4, 1],
  [12.4, 'p', 700, 760, 215, 380, 1, 2],
  [13.6, 'p', 332, 180, 215, 165, -2, 2],
  [15.0, 'p', 326, 176, 215, 150, -3, 2]
];
let KW = null;
function keyWorld() {
  const v = new THREE.Vector3();
  return KEYS.map(([t, sp, x, y, z, d, yaw, pitch]) => {
    if (sp === 'd') v.set(x, -y, z); else v.copy(W.page.localToWorld(new THREE.Vector3(x, -y, z)));
    return { t, v: [v.x, v.y, v.z, Math.log(d), yaw, pitch] };
  });
}
function hermite(t) {
  const K = KW, n = K.length;
  if (t <= K[0].t) return K[0].v; if (t >= K[n - 1].t) return K[n - 1].v;
  let i = 0; while (K[i + 1].t < t) i++;
  const a = K[i], b = K[i + 1], h = b.t - a.t, u = (t - a.t) / h;
  const tan = (j) => (j <= 0 || j >= n - 1 ? a.v.map(() => 0) : K[j + 1].v.map((x, c) => (x - K[j - 1].v[c]) / (K[j + 1].t - K[j - 1].t)));
  const ma = tan(i), mb = tan(i + 1);
  const h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
  return a.v.map((x, c) => h00 * x + h10 * h * ma[c] + h01 * b.v[c] + h11 * h * mb[c]);
}
// The storyboard's stills: ?cam=x,y,z,d,yaw,pitch (page px) holds the camera; ?chap=<capture> lays another chapter.
const Q = new URLSearchParams(location.search), CAM = Q.get('cam') && Q.get('cam').split(',').map(Number);
function placeCamera(t) {
  if (CAM) {
    const v = W.page.localToWorld(new THREE.Vector3(CAM[0], -CAM[1], CAM[2])), ya = CAM[4] * Math.PI / 180, pi = CAM[5] * Math.PI / 180;
    camera.position.set(v.x + CAM[3] * Math.sin(ya) * Math.cos(pi), v.y + CAM[3] * Math.sin(pi), v.z + CAM[3] * Math.cos(ya) * Math.cos(pi));
    camera.lookAt(v); camera.near = Math.max(.5, CAM[3] * .05); camera.far = CAM[3] * 40; camera.updateProjectionMatrix(); return;
  }
  // ease the whole move's clock a little at both ends: the shot starts from rest and comes to rest
  const s = t < 1 ? t - (1 - t) * t * .35 : t;
  const [x, y, z, ld, yaw, pitch] = hermite(Math.max(0, s));
  const d = Math.exp(ld), ya = yaw * Math.PI / 180, pi = pitch * Math.PI / 180;
  camera.position.set(x + d * Math.sin(ya) * Math.cos(pi), y + d * Math.sin(pi), z + d * Math.cos(ya) * Math.cos(pi));
  camera.lookAt(x, y, z);
  camera.near = Math.max(.5, d * .05); camera.far = d * 20; camera.updateProjectionMatrix();
}

// ---- the paper: every piece's pose at t
const lerp = F.lerp, spring = F.spring, held = F.held, seg = F.seg;
function pose(t) {
  const P = W.P;
  // the pin: three held poses up out of its hole, then it tumbles away toward you
  const tp = t - T.pin;
  W.pin.visible = tp < .9;
  if (tp > 0) {
    const h = held(tp, 12), k = Math.min(h, .25) / .25, fly = Math.max(0, tp - .25);
    W.pin.position.set(513.5 + 30 * fly * 2, -(483.5 - 22 * k - 520 * fly + 900 * fly * fly), .3 + 60 * k + 700 * fly);
    W.pin.rotation.z = -(.35 * k + 4 * fly);
  } else { W.pin.position.set(513.5, -483.5, .3); W.pin.rotation.z = 0; }
  // the card: lifted by its pin's tip off the board and out of the screen into the hand, straightened, a little smaller
  const tl = t - T.lift, kxy = spring(tl, .82, .62), kz = spring(tl, 1.3, .7), kr = spring(tl, .8, .6);
  const from = [516.5, 499.5, .2], to = [715.7, 36.5, 200];
  W.card.position.copy(P(lerp(from[0], to[0], kxy), lerp(from[1], to[1], kxy), lerp(from[2], to[2], kz)));
  W.card.rotation.z = lerp(0, 1.65, kr) * Math.PI / 180;
  W.card.rotation.x = tl > 0 ? -Math.sin(Math.PI * Math.min(1, tl / 1.3)) * .32 : 0;
  W.card.scale.setScalar(lerp(1, .72, kxy));
  W.clip.constant = -(W.screenBottom - 2600 * F.ease.in(seg(tl, .05, .7)));
  W.contact.material.opacity = tl > 0 ? .3 * Math.sin(Math.PI * seg(tl, 0, .45)) : 0;
  // the dossier: out from behind the card on its spring; the card's peeking tabs tuck behind it as it comes
  const td = t - T.dossier, kd = spring(td, 1.15, .6);
  W.dos.visible = td > -.05;
  W.dos.position.set(0, 330 * (1 - kd), 196);
  W.peek.position.x = (844 + 22 - 516.5) - 52 * F.ease.inOut(seg(td, 0, .5));
  W.dosTone.material.opacity = .5 * F.ease.out(seg(td, .3, .7));
  // the 03 tab: pulled, then flown to the chapter's fore-edge while the chapter is laid over the dossier
  const tt = t - T.tab, kt = spring(tt - .12, 1.1, .62);
  W.tabs[2].visible = tt < 0;
  const a = [1119, 497.5 - 330 * (1 - kd), 196.2], b = [1244.5, 382.5, 215.4];
  W.flyer.visible = tt >= 0 && t < T.land + .02;
  if (W.flyer.visible) {
    const pull = F.ease.out(seg(tt, 0, .12)) * 14;
    W.flyer.position.copy(P(lerp(a[0] + pull, b[0], kt), lerp(a[1], b[1], kt), lerp(a[2], b[2], kt) + 70 * Math.sin(Math.PI * F.clamp(kt))));
    W.flyer.rotation.z = Math.sin(Math.PI * F.clamp(kt)) * -.12;
  }
  const kc = spring(t - T.chapter, .95, .66);
  W.chap.visible = t > T.chapter;
  W.chap.position.copy(P(1850 * (1 - kc), 0, 215));
  W.chap.rotation.z = (1 - kc) * -.04;
  const tland = t - T.land;
  W.slot.material.opacity = tland >= 0 ? 1 : 0;
  W.slot.scale.setScalar(tland >= 0 ? 1 + .06 * Math.exp(-tland * 9) * Math.cos(tland * 30) : 1);
  // the rail and the motto, drawn by the pen into their canvases; the seals pressed down
  drawRail(railCv, t, window.PARTS['p-rail'], RAIL); railTex.needsUpdate = true;
  drawTag(tagCv, t, window.PARTS['p-tag']); tagTex.needsUpdate = true;
  W.seals.forEach((m, i) => {
    const ts = t - T.seal[i];
    m.visible = ts > -.14;
    const down = F.ease.in(seg(ts, -.14, 0)), settle = ts > 0 ? .05 * Math.exp(-ts * 12) * Math.cos(ts * 40) : 0;
    m.position.z = .3 + i * .01 + 40 * (1 - down);
    m.scale.setScalar(1 + .12 * (1 - down) - settle);
  });
}

F.film({
  dur: DUR, cues: CUES,
  setup,
  render(t) {
    if (!KW) KW = keyWorld();
    pose(t); W.scene.updateMatrixWorld(true);
    placeCamera(t);
    renderer.render(W.scene, camera);
  }
});
