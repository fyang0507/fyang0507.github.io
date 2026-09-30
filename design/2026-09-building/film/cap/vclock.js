/* cap/vclock.js — injected into every document before the site's own scripts: the page's clock becomes the film's.
   Nothing on the page moves unless the recorder calls window.__vtick(ms), with ms the film's global time:
   - performance.now(), Date.now(), new Date(), event.timeStamp: virtual (Date from a fixed epoch, so a hand-off
     stamped on one page and read on the next agrees; performance.now from this document's start, as a real one would);
   - setTimeout / setInterval / requestIdleCallback: fired by __vtick in time order;
   - requestAnimationFrame: fired once per __vtick, with the virtual timestamp;
   - every animation in document.getAnimations() (CSS animations and transitions, WAAPI, a view transition's pseudo-
     elements): paused on sight and set to the time it would have reached, then finished (events, promises) at its end.
   The browser still paints for real; the recorder screenshots after each tick, so each frame is a pure function of the
   input and the tick times. */
(() => {
  if (window.__vtick) return;
  const EPOCH = 1790712000000; // 2026-09-30, fixed
  let g = 0; // global virtual ms
  try { g = +sessionStorage.getItem('fy-film-vt') || 0; } catch (e) {}
  const start = g;
  const RealDate = Date, RealSetTimeout = window.setTimeout.bind(window);
  const perfNow = () => g - start;
  Object.defineProperty(performance, 'now', { value: perfNow, configurable: true });
  class VDate extends RealDate { constructor(...a) { if (a.length === 0) super(EPOCH + g); else super(...a); } static now() { return EPOCH + g; } }
  window.Date = VDate;
  Object.defineProperty(Event.prototype, 'timeStamp', { get() { return perfNow(); }, configurable: true });

  const timers = new Map(); let tid = 1; let seq = 0;
  window.setTimeout = function (fn, ms, ...a) { const id = tid++; timers.set(id, { at: perfNow() + Math.max(0, +ms || 0), fn, a, iv: 0, s: seq++ }); return id; };
  window.setInterval = function (fn, ms, ...a) { const id = tid++; const iv = Math.max(1, +ms || 0); timers.set(id, { at: perfNow() + iv, fn, a, iv, s: seq++ }); return id; };
  window.clearTimeout = window.clearInterval = function (id) { timers.delete(id); };
  window.requestIdleCallback = function (fn) { return window.setTimeout(() => fn({ didTimeout: false, timeRemaining: () => 8 }), 1); };
  window.cancelIdleCallback = window.clearTimeout;
  const rafs = new Map(); let rid = 1;
  window.requestAnimationFrame = function (fn) { const id = rid++; rafs.set(id, fn); return id; };
  window.cancelAnimationFrame = function (id) { rafs.delete(id); };

  const seen = new WeakMap();
  let last = 0; // the previous tick's time (this document's clock)
  // Animations that appeared between ticks (a hover's transition, a view transition's pseudo-elements, anything an
  // input started) began at the last tick, whatever real time has passed since; ones started by this tick's own
  // timers and frame callbacks begin now. Their real currentTime is ignored: real time is not the film's.
  function adopt(at) {
    let list = [];
    try { list = document.getAnimations(); } catch (e) {}
    for (const a of list) if (!seen.has(a)) seen.set(a, { v0: at, done: false });
    return list;
  }
  function drive() {
    const now = perfNow();
    const list = adopt(now);
    for (const a of list) {
      const s = seen.get(a);
      if (s.done || a.playState === 'finished' || a.playState === 'idle') continue;
      if (a.playState === 'paused' && !s.ours) continue; // the site paused it on purpose
      const rate = a.playbackRate || 1;
      const timing = a.effect ? a.effect.getComputedTiming() : null;
      const end = timing ? timing.endTime : Infinity;
      let t = (now - s.v0) * rate;
      if (rate < 0) t = end + (now - s.v0) * rate;
      if ((rate > 0 && t >= end) || (rate < 0 && t <= 0)) { s.done = true; try { a.finish(); } catch (e) {} continue; }
      try { if (a.playState !== 'paused') { a.pause(); } s.ours = true; a.currentTime = t; } catch (e) {}
    }
  }
  // the site restarting an animation it owns (play, reverse, a new currentTime) re-anchors it on the virtual clock
  const P = Animation.prototype, play = P.play, reverse = P.reverse, pause = P.pause, upd = P.updatePlaybackRate;
  P.play = function () { const s = seen.get(this); const r = play.call(this); if (s) { s.ours = false; s.done = false; s.v0 = perfNow() - (this.currentTime || 0) / (this.playbackRate || 1); } return r; };
  P.reverse = function () { const r = reverse.call(this); const s = seen.get(this); if (s) { s.done = false; s.ours = false; const ct = this.currentTime || 0, rate = this.playbackRate || -1; const end = this.effect ? this.effect.getComputedTiming().endTime : 0; s.v0 = perfNow() - (rate < 0 ? (end - ct) / -rate : ct / rate); } return r; };
  P.pause = function () { const s = seen.get(this); if (s && !s.driving) s.ours = false; return pause.call(this); };
  if (upd) P.updatePlaybackRate = function (r) { this.playbackRate = r; };

  window.__vtick = function (to) {
    const target = to;
    adopt(last);
    // timers due before this frame, in order
    for (;;) {
      let best = null;
      for (const [id, t] of timers) if (t.at + start <= target && (!best || t.at < best[1].at || (t.at === best[1].at && t.s < best[1].s))) best = [id, t];
      if (!best) break;
      const [id, t] = best; g = Math.max(g, t.at + start);
      if (t.iv) t.at += t.iv; else timers.delete(id);
      try { typeof t.fn === 'function' ? t.fn(...t.a) : (0, eval)(t.fn); } catch (e) { console.error('vclock timer', e); }
    }
    g = target;
    try { sessionStorage.setItem('fy-film-vt', String(g)); } catch (e) {}
    const cbs = [...rafs.values()]; rafs.clear();
    for (const fn of cbs) { try { fn(perfNow()); } catch (e) { console.error('vclock raf', e); } }
    drive();
    last = perfNow();
    return g;
  };
  // a document that arrives by a view transition is ready to be ticked once its pseudo-elements exist
  window.__vtReady = new Promise((ok) => {
    addEventListener('pagereveal', (e) => { if (e.viewTransition) e.viewTransition.ready.then(() => ok('vt'), () => ok('skipped')); else ok('none'); }, { once: true });
    addEventListener('load', () => RealSetTimeout(() => ok('late'), 1500), { once: true });
  });
  window.__vclock = { get g() { return g; }, start, timers, rafs };
})();
