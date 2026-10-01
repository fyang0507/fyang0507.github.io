/* v1.5/sbs.js — the side-by-side: the site before #17 on the left, the promo on the right, the same route. With
   ?layout=stacked, the same film stacked for a vertical feed (3:4, before on top), its last sheet framed for the tall frame.
   · After (right): the promo exactly as it is (cut.js, after.js): its edit, camera, ramps and jumps, its picture at
     the promo's own proportions (1920 × 944) scaled into the panel, with no caption band and no captions.
   · Before (left): take15-before on a still camera that holds the whole page for the whole film. It is timed by
     sbs-sync.json (sbs_sync.py), so every click lands on the same frame as the promo's; between clicks it plays its own
     take in real time, holding or leaving out a moment in its dead time. Where the promo jumps, it jumps at the same
     instant with the same sheet pull (both its sheets held); while the promo ramps, it plays on in real time.
   · The two panels are the same size on the dossier's kraft, with a gutter between them. Under each is a small label
     in the film's own register (the ink band's, in miniature): 「#17 之前 · BEFORE」 and 「之后 · AFTER」.
   · The end: the before panel is pulled aside to the left as the promo's own last pull begins, the after panel opens
     out to the full frame, and the film ends on v1.5's last sheet, full frame, with the same credits and hold. */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { sheet, folder, frameInto, COL } from '../v1/world.js';
import { hand } from '../v1.1/hand.js';
import { EDL, WORDS, FADE } from './edl.js';
import { endCard } from './end.js';
import { cut, frameAt, place, P } from './cut.js';
import { afterWorld, SRC } from './after.js';

const F = window.FILM, FOV = 30;
// two layouts: side by side (16:9, before left) and stacked (?layout=stacked, 3:4 at 1080 × 1440, before on top). The
// panels keep the promo's picture proportions (1920 × 944) in both; a label sits off each picture (lab: 1 under, -1 over)
const LAYOUTS = {
  side() {
    const W = 1920, H = 1080, PW = 920, PH = Math.round(PW * 944 / 1920), GUT = 40, X0 = (W - 2 * PW - GUT) / 2, LAB = 46, Y0 = Math.round((H - PH - 22 - LAB) / 2);
    return { W, H, LAB, gap: 22, zs: 26, es: 22, sep: 14, dot: 4, pad: 18, BEFORE: { x: X0, y: Y0, w: PW, h: PH, lab: 1 }, AFTER: { x: X0 + PW + GUT, y: Y0, w: PW, h: PH, lab: 1 } };
  },
  stacked() {
    const W = 1080, H = 1440, PW = 1032, PH = Math.round(PW * 944 / 1920), GUT = 48, LAB = 66, gap = 16, X0 = (W - PW) / 2;
    const Y0 = Math.round((H - (LAB + gap + PH + GUT + PH + gap + LAB)) / 2) + LAB + gap;
    // the last sheet, framed for the tall frame: the lockup's width and the stamps under it, with margins all round
    return { W, H, LAB, gap, zs: 40, es: 34, sep: 20, dot: 6, pad: 26, BEFORE: { x: X0, y: Y0, w: PW, h: PH, lab: -1 }, AFTER: { x: X0, y: Y0 + PH + GUT, w: PW, h: PH, lab: 1 },
      column: [330, 1070], endCam: { x: 0, y: 0.06, h: 11.9 } };
  }
};
const LAY = (LAYOUTS[new URLSearchParams(location.search).get('layout')] || LAYOUTS.side)();
const W = LAY.W, H = LAY.H, LEFT = LAY.BEFORE, RIGHT = LAY.AFTER, FULL = { x: 0, y: 0, w: W, h: H }, LAB = LAY.LAB;
const BEFORE_TAKE = 'take15-before', WHOLE = [640, 520, 1160];   // the promo's whole-page framing
const INK = '#33302B', PAPER = '#FBF6EC', KRAFT = '#C9AE83';
let renderer, sA, sB, camA, camB, C, WORLD, SYNC, BF, BMETA, S, N2, handB, ui, ux;
const META = {}, FR = {};

// the before's footage second at film time t, for the sheet in front and (in a jump) the one under it
function beforeAt(t) {
  const st = C.state(t), seg = (x) => { for (const sh of SYNC.shots) for (const g of sh.segments) if (x >= g[0] - 1e-9 && x < g[1] + 1e-9) return g[2] + (x - g[0]) * g[3]; return null; };
  if (st.s.k === 'play') return { u: seg(t) };
  const i = C.shots.indexOf(st.s), prev = C.shots[i - 1], next = C.shots[i + 1];
  const held = seg(prev.t1 - 1e-6);
  if (st.s.k === 'end') return { u: held };
  return { u: held, next: seg(next.t0), jump: st.jump };
}
const lerpRect = (a, b, k) => ({ x: F.lerp(a.x, b.x, k), y: F.lerp(a.y, b.y, k), w: F.lerp(a.w, b.w, k), h: F.lerp(a.h, b.h, k) });

function drawUI(rL, rR, la) {
  ux.clearRect(0, 0, W, H);
  if (!rL && rR.w >= W - 0.5) return;   // the after has the whole frame
  ux.fillStyle = KRAFT; ux.fillRect(0, 0, W, H);
  for (const r of [rL, rR]) if (r) { ux.fillStyle = INK; ux.fillRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4); ux.clearRect(r.x, r.y, r.w, r.h); }
  if (la <= 0) return;
  ux.save(); ux.globalAlpha = la;
  [[rL, WORDS.before], [rR, ['之后', 'AFTER']]].forEach(([r, [zh, en]]) => {
    if (!r) return;
    const zs = LAY.zs, es = LAY.es, gap = LAY.sep, dot = LAY.dot;
    ux.font = `600 ${zs}px "Noto Serif SC"`; const w1 = ux.measureText(zh).width;
    ux.font = `italic 500 ${es}px Fraunces`; const w2 = ux.measureText(en).width;
    const pad = LAY.pad, w = w1 + gap + dot + gap + w2 + 2 * pad, cx = r.x + r.w / 2, y = r.lab > 0 ? r.y + r.h + LAY.gap : r.y - LAY.gap - LAB;
    ux.fillStyle = INK; ux.fillRect(cx - w / 2, y, w, LAB);
    let x = cx - w / 2 + pad; const base = y + LAB / 2 + zs * 0.36;
    ux.fillStyle = PAPER; ux.font = `600 ${zs}px "Noto Serif SC"`; ux.fillText(zh, x, base); x += w1 + gap;
    ux.fillStyle = '#9C9282'; ux.beginPath(); ux.arc(x + dot / 2, base - zs * .33, dot / 2, 0, Math.PI * 2); ux.fill(); x += dot + gap;
    ux.fillStyle = '#EAE1CE'; ux.font = `italic 500 ${es}px Fraunces`; ux.fillText(en, x, base);
  });
  ux.restore();
}

async function setup() {
  await F.siteFonts('../');
  THREE.ColorManagement.enabled = false;
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.setClearColor(COL.desk); renderer.setScissorTest(true);
  renderer.domElement.style.cssText = 'position:absolute;left:0;top:0'; document.body.appendChild(renderer.domElement);
  ui = document.createElement('canvas'); ui.width = W; ui.height = H; ui.style.cssText = 'position:absolute;left:0;top:0'; document.body.appendChild(ui); ux = ui.getContext('2d');
  for (const take of new Set(EDL.filter((s) => s.take).map((s) => s.take))) {
    META[take] = await fetch(`${SRC}${take}/meta.json`).then((r) => r.json());
    FR[take] = META[take].frames.map((f) => [f[1], f[0], f[3], f[4], f[5]]);
  }
  BMETA = await fetch(`${SRC}${BEFORE_TAKE}/meta.json`).then((r) => r.json());
  BF = BMETA.frames.map((f) => [f[1], f[0], f[3], f[4], f[5]]);
  SYNC = await fetch('sbs-sync.json').then((r) => r.json());
  C = cut(EDL, WORDS, FADE);
  if (LAY.column) endCard.column(...LAY.column);
  // the after: the promo's world
  sA = new THREE.Scene(); camA = new THREE.PerspectiveCamera(FOV, RIGHT.w / RIGHT.h, 1.0, 120);
  WORLD = await afterWorld(sA, C, META, FR, endCard);
  // the before: the dossier open, the take on its sheet, the next moment under it for a jump, its own hand
  sB = new THREE.Scene(); camB = new THREE.PerspectiveCamera(FOV, LEFT.w / LEFT.h, 1.0, 120);
  const fold = folder(sB); fold.hinge.rotation.y = -Math.PI * .93;
  S = sheet({}); S.position.z = 0.3; sB.add(S);
  N2 = sheet({}); N2.position.z = 0.285; N2.visible = false; sB.add(N2);
  handB = Object.create(hand); handB.build(sB);
  const [wx, wy] = P(WHOLE[0], WHOLE[1]); place(camB, { x: wx, y: wy, h: WHOLE[2] / 100 }, FOV);
  window.DUR = C.T.dur; window.FPS = 60;
  window.CUES = SYNC.pairs.map((p) => ({ t: p.after_t, type: 'click', name: p.name, before: p.before_u }));
  window.LAYOUT = { left: LEFT, right: RIGHT, W, H }; window.CAPTIONS = [];
  window.TIMELINE = C.shots.map((x) => ({ k: x.k, name: x.name || '', take: x.take || '', t0: x.t0, t1: x.t1 }));
}

// for the checks: the before page's four corners on screen (it is never cropped), and both sides' footage
window.probe = (t) => {
  const b = beforeAt(t), st = C.state(t);
  const corners = [[0, 0], [1280, 0], [0, 1000], [1280, 1000]].map(([x, y]) => { const [px, py] = P(x, y); const v = new THREE.Vector3(px, py, 0.3).project(camB); return [LEFT.x + (v.x + 1) / 2 * LEFT.w, LEFT.y + (1 - v.y) / 2 * LEFT.h]; });
  return { before: b.u, beforeNext: b.next ?? null, after: st.u, take: st.take, k: st.s.k, corners, end: t >= C.end.t0 + 1.55 ? window.endBox(t) : null };
};

// for the checks: the last sheet's motto, seals and stamps (canvas px 320–1085 × 140–960) on screen at film time t
window.endBox = (t) => {
  const lt = t - C.end.t0, grow = F.ease.inOut(F.seg(lt, 0.15, 1.3)), r = lerpRect(RIGHT, FULL, grow);
  let c = C.cam(t);
  if (LAY.endCam && lt > 0) { const k = F.ease.inOut(F.seg(lt, 0.15, 1.6)), v = LAY.endCam; c = { x: F.lerp(c.x, v.x, k), y: F.lerp(c.y, v.y, k), h: Math.exp(F.lerp(Math.log(c.h), Math.log(v.h), k)) }; }
  camA.aspect = r.w / r.h; camA.updateProjectionMatrix(); place(camA, c, FOV);
  return { rect: r, corners: [[320, 140], [1085, 140], [320, 960], [1085, 960]].map(([x, y]) => { const v = new THREE.Vector3((x - 700) / 100, 5.5 - y / 100, 0.205).project(camA); return [r.x + (v.x + 1) / 2 * r.w, r.y + (1 - v.y) / 2 * r.h]; }) };
};

function setView(r, cam) {
  const gy = H - r.y - r.h;
  renderer.setViewport(r.x, gy, r.w, r.h); renderer.setScissor(r.x, gy, r.w, r.h);
  cam.aspect = r.w / r.h; cam.updateProjectionMatrix();
}

async function render(t) {
  const e = C.end, lt = t - e.t0;
  // the end: the before pulled aside to the left, the after opened out to the full frame
  const out = F.ease.inOut(F.seg(lt, 0, 1.0)), grow = F.ease.inOut(F.seg(lt, 0.15, 1.3));
  const rL = out < 1 ? { ...LEFT, x: LEFT.x - (LEFT.x + LEFT.w + 40) * out } : null, rR = { ...lerpRect(RIGHT, FULL, grow), lab: RIGHT.lab };
  // the before
  const b = beforeAt(t), loads = [];
  if (rL) {
    const fb = frameAt(BF, Math.min(b.u, BF[BF.length - 1][0])); loads.push(frameInto(S, `${SRC}${BEFORE_TAKE}/f/${fb[1]}`, fb[1]));
    if (b.next != null) { const fn = frameAt(BF, b.next); loads.push(frameInto(N2, `${SRC}${BEFORE_TAKE}/f/${fn[1]}`, fn[1])); }
    N2.visible = b.next != null; S.position.x = b.next != null ? -19 * b.jump : 0; S.position.z = 0.3 + (b.next != null ? 0.6 * Math.sin(Math.PI * b.jump) : 0);
  }
  // the after
  let c = C.cam(t);
  if (LAY.endCam && lt > 0) {   // the tall frame's own framing of the last sheet, eased in as the after opens out
    const k = F.ease.inOut(F.seg(lt, 0.15, 1.6)), v = LAY.endCam;
    c = { x: F.lerp(c.x, v.x, k), y: F.lerp(c.y, v.y, k), h: Math.exp(F.lerp(Math.log(c.h), Math.log(v.h), k)) };
  }
  await Promise.all([WORLD.frame(t, c, rR.h), ...loads]);   // the hand at the promo's size, scaled with its picture
  place(camA, c, FOV);
  handB.frame(rL && b.next == null && lt < 0 ? frameAt(BF, b.u) : null, BMETA.presses, b.u, S, { h: WHOLE[2] / 100 }, LEFT.h);
  drawUI(rL, rR, 1 - F.seg(lt, 0, 0.3));
  renderer.setScissor(0, 0, W, H); renderer.setViewport(0, 0, W, H); renderer.clear();
  if (rL) { setView(rL, camB); renderer.render(sB, camB); }
  setView(rR, camA); renderer.render(sA, camA);
}

F.film({ dur: 1, fps: 60, cues: [], setup, render });
