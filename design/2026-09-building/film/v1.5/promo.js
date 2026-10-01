/* v1.5/promo.js — part 1, the promo (from ../v1.4/promo.js): v1.4's cut to #35's tabs on take11, then take15 from
   the Building board on, joined by the sheet pull: the shooting tab's move with the prints developing on their lines,
   a print out with its peg and back onto its rope, the about tab's move, the specimen card out of its sleeve and
   turned over, and home (ramped). Each shot names its take; a jump's leaving sheet plays on in the take before it,
   the sheet under it in the take after it. Captions are v1.4's ink band (../v1.4/caption.js), the last sheet v1.5's
   (end.js). The cut is cut.js and the world after.js, which the side-by-side (sbs.js) shares.
   16:9 only. ?w=1280 renders a 720p draft; ?cap= a caption treatment; ?end= an end-card treatment. */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { COL } from '../v1/world.js';
import { uAt, ltOf, speedAt } from '../v1.4/ramp.js';
import { layout, pick } from '../v1.4/caption.js';
import { EDL, WORDS, FADE } from './edl.js';
import { endCard } from './end.js';
import { cut, frameAt, place } from './cut.js';
import { afterWorld, SRC } from './after.js';

const F = window.FILM, q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), H = Math.round(W * 9 / 16), FOV = 30;
let renderer, scene, camera, C, T, CAP, WORLD;
const META = {}, FR = {};

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
  C = cut(EDL, WORDS, FADE); T = C.T;
  WORLD = await afterWorld(scene, C, META, FR, endCard);
  window.CUES = cues(); window.DUR = T.dur; window.FPS = 60;
  window.TIMELINE = T.shots.map((s) => {
    const o = { k: s.k, name: s.name || '', take: s.take || '', t0: +s.t0.toFixed(4), t1: +s.t1.toFixed(4), u0: s.u0, u1: s.u1 };
    if (s.R) Object.assign(o, { ramp: { a: s.R.a, b: s.R.b, c: s.R.c, d: s.R.d, smin: s.R.smin, Ti: s.R.Ti, Th: s.R.Th, To: s.R.To },
      map: [...Array(Math.ceil(s.d * 240) + 1)].map((_, i) => [+(s.t0 + i / 240).toFixed(5), +uAt(s, i / 240).toFixed(6)]) });
    return o;
  });
  window.CAPTIONS = C.CAPS.map((c) => ({ ...c, name: c.id, words: WORDS[c.id], full: [c.in + FADE, c.out - FADE] }));
  window.LAYOUT = { treatment: CAP.name, pic: CAP.pic, strip: CAP.strip, end: endCard.name };
}

function cues() {
  const c = [];
  for (const [take, m] of Object.entries(META)) {
    for (const b of m.beats) { const ft = C.filmOf(take, b.t); if (ft != null) c.push({ t: ft, type: 'site', take, kind: b.kind, name: b.name, what: b.what, u: b.t }); }
    for (const p of m.presses) { const ft = C.filmOf(take, p); if (ft != null) c.push({ t: ft, type: 'press', take, u: p }); }
  }
  for (const s of T.shots) {
    if (s.k === 'jump') c.push({ t: s.t0, type: 'pull', dur: s.d });
    if (s.R) c.push({ t: s.t0 + ltOf(s, s.R.a), type: 'ramp', name: s.name, take: s.take, dur: s.R.film, slow: [s.t0 + ltOf(s, s.R.b), s.t0 + ltOf(s, s.R.c)] });
    if (s.k === 'end') for (const x of endCard.cues(s.t0)) c.push(x);
  }
  for (const k of C.CAPS) c.push({ t: k.in, type: 'caption', name: k.id, shot: k.shot, dur: k.out - k.in, motion: k.motion });
  return c.sort((a, b) => a.t - b.t);
}

// for the checks: the footage frame on each sheet at film time t, the speed, and the camera's view-projection
window.probe = (t) => {
  const st = C.state(t), s = st.s, L = FR[st.take];
  const fa = frameAt(L, Math.min(st.u, L[L.length - 1][0])), fn = st.next != null ? frameAt(FR[st.nextTake], st.next) : null;
  return { k: s.k, name: s.name || '', take: st.take, u: st.u, next: st.next, nextTake: st.nextTake || null, fa: fa[1], fn: fn && fn[1], speed: s.k === 'play' ? speedAt(s, st.lt) : 1 };
};
window.camMatrix = (t) => { place(camera, C.cam(t), FOV); return new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).elements; };

async function render(t) {
  const c = C.cam(t);
  await WORLD.frame(t, c, CAP.pic.h);
  place(camera, c, FOV);
  const [words, a] = C.captionAt(t); CAP.draw(words, a);
  renderer.render(scene, camera);
}

F.film({ dur: 1, fps: 60, cues: [], setup, render });
