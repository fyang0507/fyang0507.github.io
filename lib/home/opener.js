/* Home's entry module, and the opener's sequencer. One clock (R.t, ms) runs the whole piece:
     first      OP (1.5 s, 12 fps hard cuts) → hard cut to the empty desk, the bird on it → the fall → hard cut to the
                eyecatch, 日常 · ep.NN (NN = essays on the shelf) → hard cut to the live desk.
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

const TICK = 1000 / 12, SKIP = 250, CARD = 400, BOOT_CAP = 600;
const html = document.documentElement, q = new URLSearchParams(location.search);
const stage = document.getElementById('oc-stage'), card = document.querySelector('.ep');
const D = window.FY_DESK, KEYS = ['laptop', 'mug', 'camera', 'plant', 'book', 'frame'];
const url = (p) => D.base + p, BIRD = () => D.strips.bird6.files[0].src;   // the eyecatch's bird: the master rung
let mode = html.dataset.opener || 'none', R = null, raf = 0, L = null, played = false;

// ---- 日常 · ep.NN is content, not memory ----
function setCard() {
  const n = window.FY_HOME ? FY_HOME.essays : null;
  card.querySelector('.ep-no').textContent = n == null ? 'ep.' : 'ep.' + (n < 10 ? '0' : '') + n;
  card.querySelector('.ep-sub').textContent = n == null ? '' : n + ' essays · ' + n + ' 篇';
  card.setAttribute('aria-label', '日常 everyday' + (n == null ? '' : ', episode ' + n + ': ' + n + ' essays so far'));
}

// ---- the honest loader: the desk's own images, the faces the opener sets, and (first visits) the OP's heroes ----
const settleP = (p) => p.then(() => {}, () => {});
const track = (p) => { p.done = false; p.then(() => { p.done = true; }); return p; };
function load() {
  if (L) return L;
  const decode = (im) => settleP(im.decode()), font = (spec, text) => settleP(document.fonts.load(spec, text));
  const imgs = [...desk.el.querySelectorAll('img')];
  L = {};
  L.opFonts = track(Promise.all([font('20px "DingTalk JinBuTi"', '弗雷德在造写拍关于咔嚓日常'), font('italic 500 40px "Fraunces"', 'FRED building!')]));
  L.all = track(Promise.all([L.opFonts, ...imgs.map(decode),
    font('24px "MuyaoPleased"', '在写在造关于在拍咔嚓'), font('12px "IBM Plex Mono"', 'tap to skip'), font('12px "Noto Sans SC"', '点按跳过篇')]));
  return L;
}
// The OP's four heroes and the eyecatch's large bird: fetched first (they are needed first), and only for a first visit.
function firstAssets() {
  if (L.first) return L.first;
  const pre = (src) => { const im = new Image(); im.fetchPriority = 'high'; im.src = src; return settleP(im.decode()); };
  return (L.first = track(Promise.all(['me', 'laptop', 'camera', 'book'].map((k) => pre(url(D.op[k].src))).concat(pre(url(BIRD()))))));
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
  card.classList.remove('on');
  scrollTo(0, 0);
  if (phone.on()) phone.shot0();
  R = { m, mode: m, alive: true, frozen: !!frozen, t: 0, cues: [], fx: [], phase: 'boot', cur: -1, on: null, geo: geo(), cardMs: CARD,
    origin: frozen || played ? performance.now() : 0 };            // a page-load run counts from navigation start
  played = true;
  stage.classList.toggle('off', m === 'returning'); stage.style.opacity = ''; stage.innerHTML = '';
  F.prepare(R);
  const r = R;
  r.onEnd = () => (r.score === 'first' ? toCard(r) : finish(r));
  r.onCapped = () => skip(true);
  const ready = m === 'first' ? track(Promise.all([L.all, firstAssets()])) : L.all;
  if (ready.done) r.ready = true; else ready.then(() => { r.ready = true; });
  listen(true);
  if (!frozen) { R.boot = performance.now(); raf = requestAnimationFrame(loop); }
}
// The clock starts once the page has painted (and, for the OP, once its display faces are in), so page-load work
// never eats a shot.
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
  r.phase = 'op';
}
function loop(now) {
  const r = R; if (!r || !r.alive) return;
  if (r.phase === 'boot') {
    const ok = painted() && (r.m === 'returning' || L.opFonts.done);
    if (!ok && now - r.boot < BOOT_CAP) { raf = requestAnimationFrame(loop); return; }
    boot(r); r.t0 = now; r.last = now;
  }
  // During the OP any frame longer than a tick slips the clock: a held-pose clock may run late, never skip a pose.
  if (r.phase === 'op' && now - r.last > TICK) r.t0 += now - r.last - TICK;
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
// The eyecatch: the bird alone on cream over the episode card; it blinks once. Its cut hides the camera going home.
function toCard(r) {
  r.phase = 'card';
  F.toRest(r, 0); F.release(r);
  const e = r.eye = document.createElement('div');
  e.className = 'eye'; e.setAttribute('aria-hidden', 'true');
  e.innerHTML = '<div class="eye-bird"><div class="desk-strip"><img src="' + url(BIRD()) + '" alt=""></div>' +
    '<svg class="eye-blink" viewBox="0 0 308 317"><circle cx="152" cy="152.5" r="7.5"/><path d="M144 154.5 Q152 155.6 160 154.5"/></svg></div>';   // colours: opener.css
  e.appendChild(card.cloneNode(true));
  document.body.appendChild(e);
  const b = e.querySelector('.eye-bird');
  F.later(r, 140, () => b.classList.add('blink'));
  F.later(r, 240, () => b.classList.remove('blink'));
  F.later(r, CARD, () => finish(r));
}

// Skip: any click / tap / key / wheel. Whatever is on top fades off the live desk in 250 ms; bodies still falling
// fast-forward to where they rest.
function skip(capped) {
  const r = R;
  if (!r || r.skipped || r.capped || r.phase === 'done' || r.phase === 'tail' || r.phase === 'skipping') return;
  if (r.phase === 'boot') boot(r);
  r.skipped = !capped; r.capped = !!capped;
  r.cues = []; r.fx = r.fx.filter((f) => f.dur > 1e8);
  html.classList.remove('opening');
  const top = r.phase === 'op' ? stage : r.phase === 'card' ? r.eye : null;
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
  if (r.eye) { r.eye.remove(); r.eye = null; }
  html.classList.remove('opening');
  card.classList.add('on');
  stage.classList.add('off'); stage.classList.remove('fading'); stage.innerHTML = ''; stage.style.opacity = '';
  listen(false);
  document.dispatchEvent(new CustomEvent('opx:done', { detail: { mode: r.m, score: r.score || null, ms: t, wall: Math.round(performance.now() - r.origin), cut: Math.round(r.opEnd || 0), go: r.goAt >= 0 ? Math.round(r.goAt) : null, skipped: !!skipped, capped: !!r.capped } }));
  if (r.S && !F.quiet(r)) { r.phase = 'tail'; r.tailAt = r.t; return; }
  settle(r);
}
function settle(r) { if (r.S) { F.toRest(r, 0); F.release(r); } r.phase = 'done'; stop(); }
// Anything thrown on the clock ends the opener at once: the live desk, never a stuck screen.
function bail(r) { try { if (r.S) { F.toRest(r, 0); F.release(r); } } catch (e) {} if (r.eye) r.eye.remove(); finish(r, true); settle(r); }
function stop() { cancelAnimationFrame(raf); listen(false); if (R) R.alive = false; R = null; }

// ---- entry ----
setCard();
if (!D || !D.op || !D.obj) mode = 'none';        // no geometry: the page loads as a page
if (mode === 'none') { html.classList.remove('opening', 'ret'); card.classList.add('on'); }
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
