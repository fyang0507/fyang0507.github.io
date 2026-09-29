/* r3-10 · the sequencer (from r2-10-cd.js). One clock (R.t, ms) runs the whole piece:
     first visit  OP      1.5 s of manic OP on a held-pose clock (12 fps hard cuts): name beat a (弗 · 雷 · 德 ·
                          FRED), Fred caught mid-OP, the laptop, the camera, the book, the bird in close-up, "…".
                  desk    hard cut to silence: the empty cream desk, the same bird on it. The objects fall
                          (r3-10-fall.js) as soon as every byte is decoded; until then the desk holds, quietly.
                  card    hard cut to the bird alone on cream over 日常 · ep.NN; it blinks once.
                  live    hard cut back: the live desk (swapped in pixel-identical underneath), the chrome rises.
     returning    desk → live: no OP, no card; the objects fall into the page's own layout, then it is live.
   The opener is over by 6.5 s on the run's clock, whatever the network does (r3-10-fall.js decides the score).
   "Returning" is this browser session only (sessionStorage fy-opener-r3, like today's live fy-opener); nothing
   is written to localStorage. ep.NN is content, not memory: the number of essays on the shelf.
   window.OPX: play / skip / seek (a manual clock that renders any instant deterministically, for contact sheets
   and the flash audit) / info. */
(function () {
  var TICK = 1000 / 12, SKIP = 250, CARD = 400, BOOT_CAP = 600, SESSION = 'fy-opener-r3';
  var html = document.documentElement, q = new URLSearchParams(location.search), Fx = R10Fx, Fall = R10Fall, St = R10Stage;
  var stage = document.getElementById('oc-stage'), card = document.querySelector('.ep'), ctl = document.querySelector('.ctl');
  var mode = html.dataset.mode || 'first';          // decided before first paint (the page's <head>)
  var L = R10Load.start(), R = null, raf = 0;

  // ---- 日常 · ep.NN = essays on the shelf (production would read a tiny generated count, not posts.js) ----
  function setCard() {
    var n = window.FY_POSTS ? window.FY_POSTS.length : null;
    card.querySelector('.ep-no').textContent = n == null ? 'ep.' : 'ep.' + (n < 10 ? '0' : '') + n;
    card.querySelector('.ep-sub').textContent = n == null ? '' : n + ' essays · ' + n + ' 篇';
    card.setAttribute('aria-label', '日常 everyday' + (n == null ? '' : ', episode ' + n + ' — ' + n + ' essays so far'));
  }
  setCard();
  addEventListener('load', setCard);

  // ---- the board's reduced-motion switch reaches into the iframe ----
  function syncRM() {
    var on = false;
    try { on = sessionStorage.getItem('mock-rm') === '1'; } catch (e) {}
    try { if (parent !== window) on = parent.document.documentElement.classList.contains('rm'); } catch (e) {}
    html.classList.toggle('rm', on);
  }
  syncRM();
  try { if (parent !== window) parent.document.addEventListener('mock:rm', function () { syncRM(); play(); }); } catch (e) {}

  function painted() { return !performance.getEntriesByType || performance.getEntriesByType('paint').length > 0; }

  // ---- run lifecycle ----
  function start(m, frozen) {
    stop();
    mode = m; html.dataset.mode = m;
    html.classList.add('opening'); html.classList.toggle('ret', m === 'returning'); html.classList.remove('landed');
    card.classList.remove('on');
    window.scrollTo(0, 0);
    R = { m: m, mode: m, L: L, alive: true, frozen: !!frozen, t: 0, cues: [], fx: [], phase: 'boot', cur: -1, on: null };
    stage.classList.toggle('off', m === 'returning'); stage.style.opacity = ''; stage.innerHTML = '';
    R.cardMs = CARD;
    Fall.prepare(R);
    R.onEnd = function () { if (R.score === 'first') toCard(R); else finish(R); };
    R.onCapped = function () { skip(true); };
    listen(true);
    if (!frozen) { R.boot = performance.now(); raf = requestAnimationFrame(loop); }
  }
  // The clock starts once the page has painted (and, for the OP, once its two display faces are in: a cold load can
  // hold first paint behind render-blocking CSS while rAF already runs), so page-load work never eats a shot.
  function boot(r) {
    if (r.booted) return;
    r.booted = true;
    if (r.m === 'returning') { r.opEnd = 0; r.phase = 'desk'; Fall.cut(r); return; }
    r.shots = R10OP.build(stage, R10OP.lists('a').first, L.url);
    var ticks = 0;
    r.shots.forEach(function (s) { s.at = ticks; ticks += s.ticks; });
    r.opEnd = ticks * TICK;
    if (L.g0.done) stage.classList.add('g0'); else L.g0.then(function () { stage.classList.add('g0'); });
    r.phase = 'op';
  }
  function loop(now) {
    var r = R; if (!r || !r.alive) return;
    if (r.phase === 'boot') {
      var ok = painted() && (r.m === 'returning' || L.opFonts.done);
      if (!ok && now - r.boot < BOOT_CAP) { raf = requestAnimationFrame(loop); return; }
      boot(r); r.t0 = now; r.last = now;
    }
    // During the OP a stall slips the clock instead of dropping poses: a held-pose clock may run late, never skip.
    if (r.phase === 'op' && now - r.last > TICK * 1.5) r.t0 += now - r.last - TICK;
    r.last = now;
    frame(r, now - r.t0);
    if (R === r && r.alive) raf = requestAnimationFrame(loop);
  }
  function frame(r, T) {
    var dt = Math.min(.05, Math.max(0, (T - r.t) / 1000));
    r.t = T;
    Fx.step(r); if (!r.alive) return;
    if (r.phase === 'op') { if (r.t < r.opEnd) shot(r); else toDesk(r); }
    if (r.S) Fall.frame(r, dt);
  }
  function shot(r) {
    var tick = Math.floor(r.t / TICK);
    if (tick === r.cur) return;
    r.cur = tick;
    for (var i = r.shots.length - 1; i > 0 && r.shots[i].at > tick; i--);
    var s = r.shots[i];
    s.el.dataset.f = s.from + tick - s.at;
    if (r.on !== s) { if (r.on) r.on.el.classList.remove('on'); s.el.classList.add('on'); r.on = s; }
  }
  function toDesk(r) {
    r.phase = 'desk';
    stage.classList.add('off');
    Fall.cut(r);
  }
  function toCard(r) {
    r.phase = 'card';
    Fall.swapToLive(r);                              // the cut hides the camera's return to the page layout
    var E = r.eye = St.eyecatch(card);
    St.birdFrame({ bird: E.parts }, 0);
    Fx.later(r, 140, function () { E.bird.classList.add('blink'); });
    Fx.later(r, 240, function () { E.bird.classList.remove('blink'); });
    Fx.later(r, CARD, function () { finish(r); });
  }

  // Skip: any click / tap / key / wheel. Not a jump cut: whatever is on top fades off the live page in 250 ms.
  function skip(capped) {
    var r = R;
    if (!r || r.skipped || r.phase === 'done') return;
    if (r.phase === 'boot') boot(r);
    r.skipped = !capped; r.capped = !!capped;
    r.cues = [];
    Fall.ensureLive();
    html.classList.remove('opening');
    Fall.reveal();
    Fx.stamp(card, true);
    var top = r.phase === 'op' ? stage : r.phase === 'card' ? r.eye.el : r.S.op;
    if (r.phase === 'op') { stage.classList.add('fading'); Fall.swapToLive(r); }
    else if (r.phase === 'desk' && r.cam) {         // the camera eases back to the page layout under the fade
      var m = r.cam.match(/-?[\d.]+/g).map(Number);
      Fx.run(r, SKIP, function (age) {
        var k = 1 - Math.pow(1 - age / SKIP, 3);
        document.querySelector('.deskbox').style.transform = 'translate(' + (m[0] * (1 - k)).toFixed(1) + 'px,' + (m[1] * (1 - k)).toFixed(1) + 'px) scale(' + (m[2] + (1 - m[2]) * k).toFixed(4) + ')';
      });
    }
    if (r.hint) r.hint.classList.remove('on');
    r.phase = 'skipping';
    top.style.pointerEvents = 'none';
    Fx.run(r, SKIP, function (age) { top.style.opacity = (1 - age / SKIP).toFixed(3); }, function () { finish(r, true); });
  }
  function onInput(e) {
    if (e.target && e.target.closest && e.target.closest('.ctl')) return;
    skip();
  }
  function listen(on) {
    var f = on ? addEventListener : removeEventListener;
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { f(ev, onInput, { passive: true }); });
  }

  function finish(r, skipped) {
    if (!r || r.phase === 'done') return;
    var t = Math.round(r.t);
    r.phase = 'done';
    Fall.swapToLive(r, !skipped && !r.eye);          // no card over this hand-off: dissolve, don't tick
    if (r.eye) r.eye.el.remove();
    if (!skipped) { html.classList.remove('opening'); Fall.reveal(); card.classList.add('on'); }
    html.classList.add('landed');
    stage.classList.add('off'); stage.classList.remove('fading'); stage.innerHTML = ''; stage.style.opacity = '';
    Fall.teardown(r); Fall.release();
    stop();
    if (!r.frozen) try { sessionStorage.setItem(SESSION, '1'); } catch (e) {}
    document.dispatchEvent(new CustomEvent('opx:done', { detail: { mode: r.m, ms: t, cut: Math.round(r.opEnd || 0), go: r.goAt >= 0 ? Math.round(r.goAt) : null, skipped: !!skipped, capped: !!r.capped } }));
  }
  function stop() {
    cancelAnimationFrame(raf);
    listen(false);
    if (R) R.alive = false;
    R = null;
  }
  function showStatic() {
    stop();
    html.classList.remove('opening'); html.classList.add('landed');
    stage.classList.add('off'); stage.innerHTML = '';
    document.querySelectorAll('.op, .eye, .skip-hint').forEach(function (e) { e.remove(); });
    card.classList.add('on');
    if (L.all.done) Fall.staticDesk(); else L.all.then(function () { if (!R) Fall.staticDesk(); }, function () { if (!R) Fall.staticDesk(); });
  }

  // ---- mockup controls ----
  function syncCtl() {
    ctl.querySelectorAll('[data-m]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === mode); });
    ctl.querySelector('[data-a="rm"]').setAttribute('aria-pressed', html.classList.contains('rm'));
  }
  function play() { if (Pen.reduced()) return showStatic(); start(mode); }
  ctl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'replay') play();
    else if (b.dataset.a === 'skip') skip();
    else if (b.dataset.a === 'rm') { var on = !html.classList.contains('rm'); html.classList.toggle('rm', on); try { sessionStorage.setItem('mock-rm', on ? '1' : '0'); } catch (x) {} play(); }
    else if (b.dataset.m) { mode = b.dataset.m; play(); }
    syncCtl();
  });
  syncCtl();

  addEventListener('resize', function () {           // re-lay the OP's posters for the new frame
    var r = R; if (!r || !r.shots || r.phase !== 'op') return;
    var fresh = R10OP.build(stage, R10OP.lists('a').first, L.url);
    fresh.forEach(function (s, i) { s.at = r.shots[i].at; });
    r.shots = fresh; r.on = null; r.cur = -1;
  });

  window.OPX = {
    play: function (o) { o = o || {}; if (o.mode) mode = o.mode; syncCtl(); play(); },
    skip: function () { skip(); },
    loaded: function () { return L.all.then(function () { return document.fonts.ready; }); },
    // Manual clock: render mode m at time t (ms), everything loaded. Seeking backwards restarts.
    seek: function (m, t) {
      if (!R || !R.frozen || R.m !== m || t < R.t) { start(m, true); boot(R); }
      var r = R;
      if (t === 0 && r.cur < 0) frame(r, 0);
      while (r.alive && r.t < t) frame(r, Math.min(t, r.t + 1000 / 60));
      return { phase: r.phase, t: Math.round(r.t), cut: Math.round(r.opEnd), go: r.goAt >= 0 ? Math.round(r.goAt) : null };
    },
    info: function () { return R && { m: R.m, t: R.t, phase: R.phase, cut: R.opEnd, go: R.goAt }; }
  };

  if (q.get('autoplay') === '0' || !html.classList.contains('opening') || Pen.reduced()) showStatic();
  else start(mode);
})();
