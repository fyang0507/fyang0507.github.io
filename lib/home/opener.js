/* Home's entry module, and the opener's sequencer. One clock (R.t, ms) runs the whole piece:
     first      OP (1.5 s, 12 fps hard cuts) → hard cut to the empty desk, the bird on it → the fall → on a wide screen
                the camera eases back from the fall's wide framing into the page's own → the live desk.
     returning  the fall only, in the page's own layout; the desk is live where it lands.
   The <head> decides the mode before first paint (html[data-opener]); "none" (an internal arrival, reduced motion)
   means the static desk, with any view transition owned by transitions.js. This module takes over by setting
   html[data-opener-live] (until then the head's failsafe owns the page). Honest loading: the OP starts at once,
   the fall waits for the real bytes (fall.js), and nothing is padded to look like loading. Any click, tap, key or
   wheel fast-forwards to the live desk in 250 ms. `OPX` (seek / play / skip / info) exists only with ?opx=1, for
   the flash audit and contact sheets; tests otherwise read the `opx:done` event. */
import { desk } from './desk.js';
import { phone } from './mobile.js';
import * as F from './fall.js';
import * as OP from './opener-op.js';

const TICK = 1000 / 12, SKIP = 250, BACK = 400, BOOT_CAP = 600, FACE_CAP = 600;
const html = document.documentElement, q = new URLSearchParams(location.search);
const stage = document.getElementById('oc-stage');
const D = window.FY_DESK, KEYS = ['laptop', 'mug', 'camera', 'plant', 'book', 'frame'];
const url = (p) => D.base + p;
let mode = html.dataset.opener || 'none', R = null, raf = 0, L = null, played = false;

// ---- the honest loader: the desk's own images, the faces the opener sets, and (first visits) the OP's heroes ----
const settleP = (p) => p.then(() => {}, () => {});
const track = (p) => { p.done = false; p.then(() => { p.done = true; }); return p; };
function load() {
  if (L) return L;
  const decode = (im) => settleP(im.decode()), font = (spec, text) => settleP(document.fonts.load(spec, text));
  const imgs = [...desk.el.querySelectorAll('img')];
  L = {};
  L.jin = track(font('20px "DingTalk JinBuTi"', '弗雷德在造写拍关于咔嚓'));   // the first shots' face; FRED's Fraunces is waited for at its cut
  L.opFonts = track(Promise.all([L.jin, font('italic 500 40px "Fraunces"', 'FRED building!')]));
  L.all = track(Promise.all([L.opFonts, ...imgs.map(decode),
    font('24px "MuyaoPleased"', '在写在造关于在拍咔嚓'), font('12px "IBM Plex Mono"', 'tap to skip'), font('12px "Noto Sans SC"', '点按跳过篇')]));
  return L;
}
// The OP's four heroes: fetched first (they are needed first), and only for a first visit.
function firstAssets() {
  if (L.first) return L.first;
  const pre = (src) => { const im = new Image(); im.fetchPriority = 'high'; im.src = src; return settleP(im.decode()); };
  return (L.first = track(Promise.all(['me', 'laptop', 'camera', 'book'].map((k) => pre(url(D.op[k].src))))));
}
function geo() {
  const g = {};
  KEYS.forEach((k) => { g[k] = D.obj[k]; });   // box, foot, cx (desk px)
  return g;
}
const painted = () => !performance.getEntriesByType || performance.getEntriesByType('paint').length > 0;

// ---- run lifecycle ----
function start(m, frozen) {
  stop();
  mode = m; html.dataset.opener = m; html.setAttribute('data-opener-live', '');
  html.classList.add('opening'); html.classList.toggle('ret', m === 'returning');
  scrollTo(0, 0);
  if (phone.on()) phone.shot0();
  R = { m, mode: m, alive: true, frozen: !!frozen, t: 0, cues: [], fx: [], phase: 'boot', cur: -1, on: null, geo: geo(), backMs: BACK,
    origin: frozen || played ? performance.now() : 0 };            // a page-load run counts from navigation start
  played = true;
  stage.classList.toggle('off', m === 'returning'); stage.style.opacity = ''; stage.innerHTML = '';
  F.prepare(R);
  const r = R;
  r.onEnd = () => (r.score === 'first' && r.cam ? back(r) : finish(r));
  r.onCapped = () => skip(true);
  const ready = m === 'first' ? track(Promise.all([L.all, firstAssets()])) : L.all;
  if (ready.done) r.ready = true; else ready.then(() => { r.ready = true; });
  listen(true);
  if (!frozen) { R.boot = performance.now(); raf = requestAnimationFrame(loop); }
}
// The clock starts once the page has painted (and, for the OP, once JinBuTi, the face of its first shots, is in), so
// page-load work never eats a shot. FRED's Fraunces is waited for at FRED's own cut (loop), not here.
function boot(r) {
  if (r.booted) return;
  r.booted = true;
  const noOP = () => { F.demote(r); html.classList.add('ret'); stage.classList.add('off'); stage.innerHTML = ''; };
  if (r.m === 'first' && (!window.Pen || F.tooLateForOP(r, OP.LIST.reduce((a, s) => a + s[1], 0) * TICK))) noOP();
  if (r.mode === 'first') { try { r.shots = OP.build(stage, (k) => url(D.op[k].src)); } catch (e) { noOP(); } }   // no posters: only the fall
  if (r.mode === 'returning') { r.opEnd = 0; r.phase = 'desk'; F.cut(r); return; }
  let ticks = 0;
  r.shots.forEach((s) => { s.at = ticks; ticks += s.ticks; });
  r.opEnd = ticks * TICK;
  r.faceAt = r.shots.find((s) => s.id === 'a-fred').at * TICK;   // the first shot set in Fraunces
  r.phase = 'op';
}
function loop(now) {
  const r = R; if (!r || !r.alive) return;
  if (r.phase === 'boot') {
    const ok = painted() && (r.m === 'returning' || L.jin.done);
    if (!ok && now - r.boot < BOOT_CAP) { raf = requestAnimationFrame(loop); return; }
    boot(r); r.t0 = r.opAt = now; r.last = now;
  }
  // During the OP any frame longer than a tick slips the clock: a held-pose clock may run late, never skip a pose.
  if (r.phase === 'op' && now - r.last > TICK) r.t0 += now - r.last - TICK;
  // FRED is set in Fraunces: until that face is in, the pose before it holds (for FACE_CAP at most).
  if (r.phase === 'op' && !L.opFonts.done && now - r.t0 >= r.faceAt && now - r.opAt < r.faceAt + FACE_CAP) r.t0 = now - r.faceAt + 1;
  r.last = now;
  try { frame(r, now - r.t0); } catch (e) { bail(r); return; }
  if (R === r && r.alive) raf = requestAnimationFrame(loop);
}
function frame(r, T) {
  const dt = Math.min(.05, Math.max(0, (T - r.t) / 1000));
  r.t = T;
  F.step(r); if (!r.alive) return;
  if (r.phase === 'op') { if (r.t < r.opEnd) shot(r); else { r.phase = 'desk'; stage.classList.add('off'); F.cut(r); } }
  if (r.S) F.frame(r, dt);
  if (r.phase === 'tail' && (F.quiet(r) || r.t - r.tailAt > 900)) settle(r);
}
function shot(r) {
  const tick = Math.floor(r.t / TICK);
  if (tick === r.cur) return;
  r.cur = tick;
  let i = r.shots.length - 1;
  while (i > 0 && r.shots[i].at > tick) i--;
  const s = r.shots[i];
  s.el.dataset.f = tick - s.at;
  if (r.on !== s) { if (r.on) r.on.el.classList.remove('on'); s.el.classList.add('on'); r.on = s; }
}
// A wide first visit ends in the fall's wide framing: the camera eases back into the page's own, on the opener's clock
// (so a seek renders it too), and the desk is live where it lands. The bodies finish settling under the move.
function back(r) {
  r.phase = 'back';
  const c = r.camV, ez = Motion.cubic(.3, 0, .2, 1), el = desk.el;
  F.run(r, BACK, (age) => {
    const k = 1 - ez(age / BACK);
    el.style.transform = 'translate(' + (c.x * k).toFixed(1) + 'px,' + (c.y * k).toFixed(1) + 'px) scale(' + (1 + (c.s - 1) * k).toFixed(4) + ')';
  }, () => { el.style.transform = ''; finish(r); });
}

// Skip: any click / tap / key / wheel. Whatever is on top fades off the live desk in 250 ms; bodies still falling
// fast-forward to where they rest.
function skip(capped) {
  const r = R;
  if (!r || r.skipped || r.capped || r.phase === 'done' || r.phase === 'tail' || r.phase === 'skipping' || r.phase === 'back') return;
  if (r.phase === 'boot') boot(r);
  r.skipped = !capped; r.capped = !!capped;
  r.cues = []; r.fx = r.fx.filter((f) => f.dur > 1e8);
  html.classList.remove('opening');
  const top = r.phase === 'op' ? stage : null;
  if (r.S) {
    if (r.cam && !top) desk.el.animate([{ transform: r.cam }, { transform: 'none' }], { duration: SKIP, easing: 'cubic-bezier(.2,.7,.2,1)' });
    F.toRest(r, top ? 0 : SKIP); F.release(r);
  }
  if (r.phase === 'op') stage.classList.add('fading');
  r.phase = 'skipping';
  if (top) { top.style.pointerEvents = 'none'; F.run(r, SKIP, (age) => { top.style.opacity = (1 - age / SKIP).toFixed(3); }, () => finish(r, true)); }
  else F.later(r, SKIP, () => finish(r, true));
}
function onInput() { skip(); }
function listen(on) {
  const f = on ? addEventListener : removeEventListener;
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => f(ev, onInput, { passive: true }));
}

// The desk is live. Returning ends in place: its last settling frames finish under the live page (a short tail).
function finish(r, skipped) {
  if (!r || r.phase === 'done' || r.phase === 'tail') return;
  const t = Math.round(r.t);
  html.classList.remove('opening');
  stage.classList.add('off'); stage.classList.remove('fading'); stage.innerHTML = ''; stage.style.opacity = '';
  listen(false);
  document.dispatchEvent(new CustomEvent('opx:done', { detail: { mode: r.m, score: r.score || null, ms: t, wall: Math.round(performance.now() - r.origin), cut: Math.round(r.opEnd || 0), go: r.goAt >= 0 ? Math.round(r.goAt) : null, skipped: !!skipped, capped: !!r.capped } }));
  if (r.S && !F.quiet(r)) { r.phase = 'tail'; r.tailAt = r.t; return; }
  settle(r);
}
function settle(r) { if (r.S) { F.toRest(r, 0); F.release(r); } r.phase = 'done'; stop(); }
// Anything thrown on the clock ends the opener at once: the live desk, never a stuck screen.
function bail(r) { try { if (r.S) { F.toRest(r, 0); F.release(r); } } catch (e) {} finish(r, true); settle(r); }
function stop() { cancelAnimationFrame(raf); listen(false); if (R) R.alive = false; R = null; }

// ---- entry ----
if (!D || !D.op || !D.obj) mode = 'none';        // no geometry: the page loads as a page
if (mode === 'none') html.classList.remove('opening', 'ret');
else { load(); if (mode === 'first') firstAssets(); start(mode); }
Motion.onReduced(() => { const r = R; if (r && Motion.reduced()) { if (r.S) { F.toRest(r, 0); F.release(r); } finish(r, true); } });

if (q.get('opx') === '1') {
  window.OPX = {
    play: (m) => { load(); start(m || 'first'); },
    skip: () => skip(),
    loaded: () => { load(); return Promise.all([L.all, firstAssets()]).then(() => document.fonts.ready); },
    // Manual clock: render mode m at time t (ms), everything loaded. Seeking backwards restarts.
    seek: (m, t) => {
      load();
      if (!R || !R.frozen || R.m !== m || t < R.t) { start(m, true); boot(R); }
      const r = R;
      if (t === 0 && r.cur < 0) frame(r, 0);
      while (r.alive && r.t < t) frame(r, Math.min(t, r.t + 1000 / 60));
      return { phase: r.alive ? r.phase : 'done', t: Math.round(r.t), cut: Math.round(r.opEnd || 0), go: r.goAt >= 0 ? Math.round(r.goAt) : null };
    },
    info: () => R && { m: R.m, t: R.t, phase: R.phase, go: R.goAt, score: R.score }
  };
}
