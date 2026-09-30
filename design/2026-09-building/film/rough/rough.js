/* rough/rough.js — stage 2a, the rough cut: the whole film as one camera move over one dossier.

   Structure: the closed dossier on the desk → the cover opens → one sheet per session of real footage (the site
   today, with the site before #17 underneath it, lifted into view at the moments that compare) → each finished sheet
   pulled aside to the left, and the next is already there → the empty folder: the motto written, the seals stamped,
   the credits typed. The camera never cuts; the only jumps are the site's own (a hard cut on the old site, Writing's
   same-tab move to Reading) and the sheets changing, which the film shows as paper being moved by hand.

   ?src=footage-ph uses the placeholder footage (the #17 video's recordings) while the real sessions are recorded. */
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { sheet, folder, tab, drawTab, frameInto, canvasTex, COL, SW, SH, PW, PH, CURL_MAX } from './world.js';
import { DIRECTION, SESSIONS, endCard } from './direction.js';

const F = window.FILM, q = new URLSearchParams(location.search);
const SRC = q.get('src') || 'footage', W = +(q.get('w') || 1280), H = Math.round(W * 9 / 16);
const COVER = 4.2, PULL = 1.5, END = 11, FOV = 30;
let renderer, scene, camera, fold, S = [], T = { sessions: [] }, endMesh, endTex, lockImg;

const px = (x, y) => [(x - 640) / 100, (500 - y) / 100];  // page px (top-left origin) → sheet units

function timeline(metas) {
  let t = COVER; const out = [];
  metas.forEach((m, i) => { out.push({ i, m, t0: t, t1: t + m.dur }); t += m.dur + (i < metas.length - 1 ? PULL : 0); });
  return { sessions: out, end0: t + PULL * .2, dur: t + END };
}
function beatT(s, name) {
  if (typeof name === 'number') return name;
  const [n, off] = String(name).split('@'); const b = s.m.beats.find((x) => x.name === n);
  return b ? b.t + (+off || 0) : null;
}

// ---- the camera: keys { t (global), x, y (world), h (view height), tilt (deg) }, eased piecewise, zoom in log space
let KEYS = [];
function buildCamera() {
  const K = [[0, 0.35, -0.2, 13.2, 0], [1.2, 0.35, -0.2, 13.2, 0], [COVER - .2, 0, 0, 11.6, 6]];
  T.sessions.forEach((s) => {
    const d = DIRECTION[s.m.name] || {};
    (d.cam || [[0, 640, 500, 1160, 6]]).forEach(([b, x, y, h, tilt]) => {
      const t = beatT(s, b); if (t == null) return; const [wx, wy] = px(x, y);
      K.push([s.t0 + t, wx, wy, h / 100, tilt == null ? 6 : tilt]);
    });
    if (s.i < T.sessions.length - 1) K.push([s.t1 + PULL * .5, 0, 0, 11.8, 5]);
  });
  K.push([T.end0 + 1.2, 0.35, 0.2, 9.0, 3], [T.dur, 0.35, 0.1, 8.4, 2]);
  KEYS = K.sort((a, b) => a[0] - b[0]);
}
function cam(t) {
  let i = 1; while (i < KEYS.length - 1 && KEYS[i][0] < t) i++;
  const a = KEYS[i - 1], b = KEYS[i]; const k = F.ease.inOut(F.seg(t, a[0], b[0]));
  const h = Math.exp(F.lerp(Math.log(a[3]), Math.log(b[3]), k));
  return { x: F.lerp(a[1], b[1], k), y: F.lerp(a[2], b[2], k), h, tilt: F.lerp(a[4], b[4], k) };
}
function place(c) {
  const dist = c.h / 2 / Math.tan(FOV * Math.PI / 360), a = c.tilt * Math.PI / 180;
  camera.position.set(c.x, c.y - dist * Math.sin(a), dist * Math.cos(a) + 0.2);
  camera.up.set(0, 1, 0); camera.lookAt(c.x, c.y, 0.2);
}

// ---- the page lift: [beat, lead, hold, amount] → curl position; up and down on springs (one small overshoot)
function lift(s, t) {
  const d = DIRECTION[s.m.name] || {}; let amt = 0;
  (d.lifts || []).forEach(([b, lead, hold, a]) => {
    const bt = beatT(s, b); if (bt == null) return; const u = t - s.t0, up = bt + lead, down = up + hold;
    if (u < up) return;
    amt = Math.max(amt, a * (u < down ? F.spring(u - up, 1.6, .62) : 1 - F.spring(u - down, 1.8, .58)));
  });
  return F.clamp(amt, 0, 1);
}

async function setup() {
  await F.siteFonts('../');
  THREE.ColorManagement.enabled = false;
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.setClearColor(COL.desk); document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 200);
  const metas = await Promise.all(SESSIONS.map((n) => fetch(`${SRC}/${n}/meta.json`).then((r) => r.json())));
  T = timeline(metas);
  fold = folder(scene);
  // the stack, top first: each session's after, then its before
  T.sessions.forEach((s, i) => {
    const g = new THREE.Group(); scene.add(g);
    const zTop = 0.3 - i * 0.05, d = DIRECTION[s.m.name] || {};
    const after = sheet({ label: (x, w, h) => { x.fillStyle = COL.pencil; x.font = '500 17px "IBM Plex Mono"'; x.letterSpacing = '2px'; x.fillText('AFTER · 9b1cb9e · MAIN AT #35 · ' + (d.label || ''), 34, 22); } });
    after.position.z = zTop; g.add(after);
    const before = sheet({ label: (x, w, h) => { x.fillStyle = COL.pencil; x.font = '500 17px "IBM Plex Mono"'; x.letterSpacing = '2px'; x.textAlign = 'right'; x.fillText('BEFORE · 6237120 · MAIN BEFORE #17', w - 40, h - 8); } });
    before.userData.u.uPaper.value.set(0.965, 0.945, 0.9);
    before.position.set(-0.1, -0.07, zTop - 0.025); before.rotation.z = -1.1 * Math.PI / 180; g.add(before);
    const tb = tab(d.tab ? d.tab[0] : s.m.name, d.tab ? d.tab[1] : ''); tb.position.set(SW / 2 + tb.userData.w / 2 - 0.25, SH / 2 - 1.0 - i * 0.95, zTop - 0.012); g.add(tb);
    S.push({ g, after, before, tab: tb, s });
  });
  // the end: the folder's back, where the motto is written and the seals stamped
  endTex = canvasTex(1400, 1000, () => {});
  endMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshBasicMaterial({ map: endTex, transparent: true }));
  endMesh.position.set(0.35, -0.2, 0.003); scene.add(endMesh);
  lockImg = await endCard.load();
  window.CUES = cues(); window.DUR = T.dur; window.TIMELINE = T.sessions.map((s) => ({ name: s.m.name, t0: s.t0, t1: s.t1 }));
}

function cues() {
  const c = [{ t: 1.4, type: 'cover-open' }];
  T.sessions.forEach((s) => {
    s.m.beats.forEach((b) => c.push({ t: s.t0 + b.t, type: 'site', kind: b.kind, name: b.name, what: b.what || '', session: s.m.name, u: b.t }));
    const d = DIRECTION[s.m.name] || {};
    (d.lifts || []).forEach(([b, lead, hold]) => { const bt = beatT(s, b); if (bt != null) c.push({ t: s.t0 + bt + lead, type: 'lift', at: b, session: s.m.name }, { t: s.t0 + bt + lead + hold, type: 'drop', session: s.m.name }); });
    if (s.i < T.sessions.length - 1) c.push({ t: s.t1, type: 'pull', dur: PULL });
    c.push({ t: s.t0, type: 'chapter', name: s.m.name });
  });
  c.push({ t: T.sessions[T.sessions.length - 1].t1, type: 'pull', dur: PULL });
  endCard.cues(T.end0).forEach((x) => c.push(x));
  return c.sort((a, b) => a.t - b.t);
}

async function render(t) {
  // the cover, on its hinge
  const open = F.spring(t - 1.4, 0.9, .78) * Math.PI * .93;
  fold.hinge.rotation.y = -open;
  const loads = [];
  S.forEach((o, i) => {
    const s = o.s, last = i === S.length - 1;
    // pulled aside to the left once its session is done
    const pullAt = s.t1, k = F.ease.inOut(F.seg(t, pullAt, pullAt + PULL));
    o.g.position.set(-19 * k, 1.2 * Math.sin(Math.PI * k) * .3, 0.9 * Math.sin(Math.PI * k));
    o.g.rotation.z = 2.5 * Math.PI / 180 * k;
    o.g.visible = k < 1;
    // footage: the frame at this moment of the session (held at its first frame before, last frame after)
    const u = F.clamp(t - s.t0, 0, s.m.dur - 1 / 30), idx = Math.min(s.m.frames - 1, Math.floor(u * 30 + 1e-6));   // frames are 000000 …
    const current = t >= s.t0 - PULL - 0.1 && t <= s.t1 + PULL + 0.1, first = i === 0 && t < s.t0;
    if (o.g.visible && (current || first || o.after.userData.frame < 0)) {
      const f = String(idx).padStart(6, '0');
      loads.push(frameInto(o.after, `${SRC}/${s.m.name}/after/${f}.jpg`, idx));
      if (current || o.before.userData.frame < 0) loads.push(frameInto(o.before, `${SRC}/${s.m.name}/before/${f}.jpg`, idx));
    }
    // the page lifted to show the one under it
    const a = lift(s, t), p = F.lerp(CURL_MAX, -CURL_MAX - 0.3, a);
    o.after.userData.u.uP.value = p; o.after.userData.u.uR.value = 0.75;
    o.before.userData.u.uCP.value = p; o.before.userData.u.uCAmt.value = a;
    // the current tab carries the wheat band
    drawTab(o.tab, t >= s.t0 && t < s.t1 + .2 ? F.ease.out(F.seg(t, s.t0 + .2, s.t0 + .7)) : 0);
  });
  await Promise.all(loads);
  endCard.draw(endTex, lockImg, t - T.end0);
  place(cam(t));
  renderer.render(scene, camera);
}

F.film({ dur: 1, fps: 30, cues: [], setup: async () => { await setup(); buildCamera(); window.DUR = T.dur; }, render });
