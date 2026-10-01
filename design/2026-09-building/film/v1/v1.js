/* v1/v1.js — the film, v1: one real take of the site, one camera, the old site under the page.
   The take (cap/rec.mjs on the virtual clock) is printed on a sheet in the kraft dossier. The camera never cuts but
   once, on the site's own same-tab cut from Writing into Reading, which the film matches on the essay's cover. The
   page is lifted, before the seven clicks that changed most, to show the site before #17 doing the same click from its
   own take; the take waits under the page. Three motions are replayed at ⅓× from true 180 fps frames.
   ?w=1280 renders a 720p draft; ?cut=30s&ar=9x16 are the short cuts (see cuts.js). */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { sheet, folder, frameInto, canvasTex, COL, SW, SH, PW, PH, M, MT, OFF, CURL_MAX } from './world.js';
import { EDL, EDL30, CHAPTERS, NOTES, NOTES9, TIMED_NOTES } from './edl.js';
import { endCard } from './end.js';

const F = window.FILM, q = new URLSearchParams(location.search);
const W = +(q.get('w') || 1920), AR = q.get('ar') === '9x16' ? 9 / 16 : 16 / 9, H = Math.round(W / AR), FOV = 30;
const SRC = 'footage', CUT = q.get('cut') === '30s', TALL = AR < 1;
let renderer, scene, camera, fold, A, B, N, END, T, AF, BF, endTex, lock;

// ---- the timeline: film time for each shot
function timeline(edl) {
  let t = 0; const out = [];
  for (const s of edl) {
    const d = s.k === 'play' ? s.u1 - s.u0 : s.k === 'replay' ? (s.u1 - s.u0) / s.rate : s.d;
    out.push(Object.assign({}, s, TALL && s.cam9 ? { cam: s.cam9 } : {}, { t0: t, t1: t + d, d })); t += d;
  }
  return { shots: out, dur: t };
}
function shotAt(t) { const S = T.shots; let i = 0; while (i < S.length - 1 && S[i].t1 <= t) i++; return S[i]; }
const lastU = () => { const p = T.shots.filter((s) => s.k === 'play'); return p[p.length - 1].u1; };
function state(t) {
  const s = shotAt(t), lt = t - s.t0;
  const st = { s, lt, u: 0, b: null, lift: 0, replay: false };
  if (s.k === 'cover') st.u = 0;
  else if (s.k === 'play') st.u = s.u0 + lt;
  else if (s.k === 'replay') { st.u = s.u0 + lt * s.rate; st.replay = true; }
  else if (s.k === 'lift') {
    st.u = s.at; st.b = s.at + Math.max(0, lt - 0.25);
    const up = F.spring(lt, 2.3, .7), down = lt > s.d - 0.42 ? F.spring(lt - (s.d - 0.42), 2.5, .64) : 0;
    st.lift = F.clamp(up - down, 0, 1.04) * 0.9;
  } else if (s.k === 'end') st.u = lastU();
  else if (s.k === 'jump') {
    const S = T.shots, i = S.indexOf(s), prev = S[i - 1], next = S[i + 1];
    st.u = prev.u1; st.next = next.u0; st.jump = F.ease.inOut(F.seg(lt, 0, s.d));
  }
  return st;
}
// ---- footage: the frame on screen at footage time u
function index(meta) { return meta.frames.map((f) => [f[1], f[0]]); }
function frameAt(list, u) {
  let lo = 0, hi = list.length - 1;
  if (u <= list[0][0]) return list[0];
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (list[m][0] <= u + 1e-4) lo = m; else hi = m - 1; }
  return list[lo];
}
// ---- the camera: keys in film time, eased between, zoom in log space; a 'cut' key jumps
let KEYS = [];
const P = (x, y) => [(x - 640) / 100, (500 - y) / 100];
function buildCam() {
  const K = CUT ? [] : [[0, 0.35, -0.1, 13.4, 0], [0.45, 0.35, -0.1, 13.4, 0]];
  for (const s of T.shots) {
    if (!s.cam) continue;
    for (const [k, x, y, h, cut] of s.cam) {
      const ft = s.k === 'play' ? s.t0 + (k - s.u0) : s.t0 + k;
      const [wx, wy] = P(x, y); K.push([ft, wx, wy, h / 100, cut === 'cut']);
    }
  }
  const e = T.shots[T.shots.length - 1];
  if (TALL) K.push([e.t0 + 1.3, 0.2, 0.0, 17.5], [e.t0 + 2.2, 0.2, 0.3, 15.2], [T.dur, 0.2, 0.25, 14.8]);   // the lockup's width, in a tall frame
  else K.push([e.t0 + 1.3, 0.2, 0.0, 12.2], [e.t0 + 2.2, 0.2, 0.2, 9.4], [T.dur, 0.2, 0.15, 9.1]);
  KEYS = K.sort((a, b) => a[0] - b[0]);
}
function cam(t) {
  let i = 1; while (i < KEYS.length - 1 && KEYS[i][0] <= t) i++;
  const a = KEYS[i - 1], b = KEYS[i];
  if (b[4] && t < b[0]) return { x: a[1], y: a[2], h: a[3] };
  if (t >= b[0]) return { x: b[1], y: b[2], h: b[3] };
  const k = F.ease.inOut(F.seg(t, a[0], b[0]));
  return { x: F.lerp(a[1], b[1], k), y: F.lerp(a[2], b[2], k), h: Math.exp(F.lerp(Math.log(a[3]), Math.log(b[3]), k)) };
}
function place(c) {
  const hh = c.h;
  const dist = hh / 2 / Math.tan(FOV * Math.PI / 360), tilt = 5 * Math.PI / 180;
  camera.position.set(c.x, c.y - dist * Math.sin(tilt), dist * Math.cos(tilt) + 0.3);
  camera.up.set(0, 1, 0); camera.lookAt(c.x, c.y, 0.3);
}

// ---- the pen in the margins: the chapter names, the ⅓× mark, the five notes
const KL = 1.8; // label canvas px per page px
const LX = (x) => (M * 100 + x) * KL, LY = (y) => (MT * 100 + y) * KL;
// a note on its own slip, beside the motion (a slip keeps the hand off the page's own text)
function slip(x, zh, en, px, py, p, size) {
  if (p <= 0) return;
  x.save(); x.font = `600 ${size}px Muyao`; const w1 = x.measureText(zh).width; x.font = `600 ${size * .82}px Caveat`; const w2 = x.measureText(en).width;
  const w = Math.max(w1, w2) + size * 1.1, h = size * 2.55, r = F.rng(zh);
  x.translate(px, py); x.rotate((r() - .5) * 0.05);
  x.fillStyle = '#FCF8EF'; x.fillRect(-size * .55, -size * 1.25, w, h);
  x.lineWidth = 2; x.strokeStyle = '#CFC1A9'; x.strokeRect(-size * .55, -size * 1.25, w, h);
  x.restore();
  hand(x, zh, en, px, py, p, COL.ink, size);
}
function hand(x, zh, en, px, py, p, col, size) {
  // written on left to right on the hand's clock: 12 held steps a second
  if (p <= 0) return;
  x.save();
  x.font = `600 ${size}px Muyao`; const w1 = x.measureText(zh).width;
  x.font = `600 ${size * .82}px Caveat`; const w2 = x.measureText(en).width;
  const w = Math.max(w1, w2);
  x.beginPath(); x.rect(px - 10, py - size * 1.2, (w + 20) * F.clamp(p), size * 2.6); x.clip();
  x.fillStyle = col;
  x.font = `600 ${size}px Muyao`; x.fillText(zh, px, py);
  x.font = `600 ${size * .82}px Caveat`; x.fillText(en, px, py + size * 1.05);
  x.restore();
}
function chapterAt(u) { let c = null; for (const ch of CHAPTERS) if (u >= ch[0]) c = ch; return c; }
function noteFor(st, t) {
  // [id, progress]: a shot's note is written on over 0.7 s, held, and lifted off in its last 0.25 s
  const s = st.s;
  if (s.note && s.note !== 'hardcut' && (s.k === 'replay')) return [s.note, F.held(F.seg(st.lt, 0.15, 0.85)), F.seg(st.lt, s.d - 0.25, s.d)];
  if (s.k === 'play') for (const [a, b, id] of TIMED_NOTES) if (st.u >= a && st.u < b) return [id, F.held(F.seg(st.u, a, a + 0.7)), F.seg(st.u, b - 0.25, b)];
  return null;
}
let lastKeyA = '', lastKeyB = '';
function drawAfterLabel(st, t) {
  const ch = chapterAt(st.u), chP = ch ? F.held(F.seg(st.u, ch[0], ch[0] + 0.75)) : 0;
  const n = noteFor(st, t), third = st.replay ? F.held(F.seg(st.lt, 0, 0.5)) : 0;
  const key = [ch && ch[1], chP.toFixed(3), n && n[0], n && n[1].toFixed(3), n && n[2].toFixed(2), third.toFixed(3)].join('|');
  if (key === lastKeyA) return; lastKeyA = key;
  const tex = A.userData.label, c = tex.userData.canvas, x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  if (ch) hand(x, ch[1] + '  ' + ch[2], ch[3], LX(0), MT * 100 * KL * 0.5, chP, COL.ink, 50);
  if (third > 0) hand(x, '×⅓', 'at a third', LX(1120), MT * 100 * KL * 0.5, third, COL.pencil, 46);
  if (n && n[2] < 1) { const N = NOTES[n[0]], at = (TALL && NOTES9[n[0]]) || N; x.save(); x.globalAlpha = 1 - n[2]; slip(x, N[2], N[3], LX(at[0]), LY(at[1]), n[1] > 0 ? Math.max(n[1], .001) : 0, 58); x.restore(); }
  tex.needsUpdate = true;
}
function drawBeforeLabel(st) {
  const on = st.s.k === 'lift' && st.s.note === 'hardcut';
  const p = on ? F.held(F.seg(st.lt, 0.55, 1.2)) : 0;
  const key = p.toFixed(3); if (key === lastKeyB) return; lastKeyB = key;
  const tex = B.userData.label, c = tex.userData.canvas, x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  if (p > 0) { const N = NOTES.hardcut; slip(x, N[2], N[3], LX(N[0]), LY(N[1]), p, 58); }
  tex.needsUpdate = true;
}

async function setup() {
  await F.siteFonts('../');
  THREE.ColorManagement.enabled = false;
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.setClearColor(COL.desk); document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(FOV, W / H, 1.0, 120);   // a near plane far enough out that the folder's layers never fight
  const [am, bm] = await Promise.all(['take-after', 'take-before'].map((n) => fetch(`${SRC}/${n}/meta.json`).then((r) => r.json())));
  AF = index(am); BF = index(bm);
  window.META = { after: am, before: bm };
  T = timeline(CUT ? EDL30 : EDL);
  fold = folder(scene);
  // the stack: the take on top, the site before #17 under it, the last sheet under both
  END = sheet({}); END.position.set(0, -OFF, 0.2); END.userData.u.uHasMap.value = 0; END.userData.u.uPaper.value.set(0.996, 0.98, 0.933); scene.add(END);
  endTex = canvasTex(1400, 1100, () => {});
  const endPlane = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshBasicMaterial({ map: endTex, transparent: true }));
  endPlane.position.set(0, 0, 0.205); scene.add(endPlane);
  const g = new THREE.Group(); g.userData.pull = true; scene.add(g);
  A = sheet({ back: (x, w, h) => {
    x.fillStyle = COL.pencil; x.font = '500 30px "IBM Plex Mono", "Noto Serif SC"'; x.letterSpacing = '4px'; x.textAlign = 'center';
    for (let k = 0; k < 5; k++) x.fillText('#17 之前 · BEFORE #17', w / 2, h * (0.1 + k * 0.2));
  } });
  A.position.z = 0.3; g.add(A);
  N = sheet({}); N.position.z = 0.285; N.visible = false; g.add(N);   // the next moment, under the page, for a jump
  B = sheet({}); B.userData.u.uPaper.value.set(0.965, 0.945, 0.9);
  B.position.set(-0.08, -0.06, 0.27); B.rotation.z = -0.9 * Math.PI / 180; g.add(B);
  window.PULL = g;
  lock = await endCard.load();
  window.CUES = cues(); window.DUR = T.dur; window.FPS = 60;
  window.TIMELINE = T.shots.map((s) => ({ k: s.k, name: s.name || '', t0: +s.t0.toFixed(3), t1: +s.t1.toFixed(3), u0: s.u0, u1: s.u1, at: s.at }));
  buildCam();
}

function cues() {
  const c = [{ t: 0.45, type: 'cover-open' }];
  const toFilm = (u) => { const s = T.shots.find((x) => x.k === 'play' && u >= x.u0 && u < x.u1); return s ? s.t0 + (u - s.u0) : null; };
  for (const b of window.META.after.beats) { const ft = toFilm(b.t); if (ft != null) c.push({ t: ft, type: 'site', kind: b.kind, name: b.name, what: b.what, u: b.t }); }
  const mot = window.META.after.motionWindows || [];
  for (const s of T.shots) {
    if (s.k === 'lift') {
      c.push({ t: s.t0, type: 'lift', name: s.name }, { t: s.t1 - 0.42, type: 'drop', name: s.name });
      for (const b of window.META.before.beats) if (b.kind !== 'lift' && b.t >= s.at && b.t < s.at + s.d) c.push({ t: s.t0 + 0.25 + (b.t - s.at), type: 'before', kind: b.kind, name: b.name });
    }
    if (s.k === 'replay') c.push({ t: s.t0, type: 'replay', name: s.note, dur: s.d });
    if (s.k === 'end') for (const x of endCard.cues(s.t0, s.short)) c.push(x);
    if (s.k === 'jump') c.push({ t: s.t0, type: 'pull', dur: s.d });
  }
  for (const ch of CHAPTERS) { const ft = toFilm(ch[0]); if (ft != null) c.push({ t: ft, type: 'chapter', name: ch[3], dur: 0.75 }); }
  return c.sort((a, b) => a.t - b.t);
}

async function render(t) {
  const st = state(t);
  fold.hinge.rotation.y = CUT ? -Math.PI * .93 : -F.spring(t - 0.45, 0.95, .78) * Math.PI * .93;
  // the finished sheet pulled aside at the end, and the last sheet is there
  const e = T.shots[T.shots.length - 1], k = F.ease.inOut(F.seg(t, e.t0, e.t0 + 1.4));
  PULL.position.set(-19 * k, 0.4 * Math.sin(Math.PI * k), 0.9 * Math.sin(Math.PI * k)); PULL.rotation.z = 2.5 * Math.PI / 180 * k; PULL.visible = k < 1;
  const loads = [];
  if (PULL.visible) {
    const fa = frameAt(AF, st.u); loads.push(frameInto(A, `${SRC}/take-after/f/${fa[1]}`, fa[1]));
    if (st.b != null) { const fb = frameAt(BF, st.b); loads.push(frameInto(B, `${SRC}/take-before/f/${fb[1]}`, fb[1])); }
    if (st.next != null) { const fn = frameAt(AF, st.next); loads.push(frameInto(N, `${SRC}/take-after/f/${fn[1]}`, fn[1])); }
  }
  // a jump: the sheet in front pulled aside to the left, the next moment already there under it
  N.visible = st.next != null; A.position.x = st.next != null ? -19 * st.jump : 0; A.position.z = 0.3 + (st.next != null ? 0.6 * Math.sin(Math.PI * st.jump) : 0);
  const a = st.lift, p = F.lerp(CURL_MAX, -CURL_MAX + 0.4, a);
  A.userData.u.uP.value = p; A.userData.u.uR.value = 0.7;
  B.userData.u.uCP.value = p; B.userData.u.uCAmt.value = a > 0.02 ? 1 : 0;
  drawAfterLabel(st, t); drawBeforeLabel(st);
  await Promise.all(loads);
  endCard.draw(endTex, t - e.t0, e.short);
  place(cam(t));
  renderer.render(scene, camera);
}

F.film({ dur: 1, fps: 60, cues: [], setup, render });
