/* r2-10 · C → D, the sequencer. One clock (R.t, ms) runs the whole piece:
     OP      1.5 s of manic OP on a held-pose clock (12 fps hard cuts): the name beat (variant a | b | c),
             Fred caught mid-OP, the laptop, the camera, the book, the bird in close-up — "…".
     cut     hard cut to silence: the empty cream desk, the same bird already on it, staring at the line.
     gag     r2-10-gag.js — the honest line, the peck, the snap, the drum fill.
     card    hard cut to the bird alone on cream over 日常 · ep.NN; it blinks once.
     live    hard cut back: the live desk (swapped in underneath, pixel-identical), the page chrome rises.
   Returning (same browser session): the variant's payoff frame, the bird's "…", the plant drops in, card.
   ep.NN is content, not memory: the number of essays on the shelf. Nothing is written to localStorage;
   "returning" is sessionStorage only, exactly like today's live opener (fy-opener; here fy-opener-r2).
   Window.OPX: play / skip / seek (manual clock: renders any instant deterministically, for contact sheets). */
(function () {
  var TICK = 1000 / 12, SKIP = 250, CARD = { first: 400, returning: 167 }, BOOT_CAP = 600;
  var html = document.documentElement, q = new URLSearchParams(location.search), Fx = R10Fx, Gag = R10Gag, St = R10Stage;
  var stage = document.getElementById('oc-stage'), card = document.querySelector('.ep'), ctl = document.querySelector('.ctl');
  var SESSION = 'fy-opener-r2';
  var mode = /^(first|returning)$/.test(q.get('mode')) ? q.get('mode') : (seen() ? 'returning' : 'first');
  var name = /^[abc]$/.test(q.get('name')) ? q.get('name') : 'a';
  var L = R10Load.start(), R = null, raf = 0;
  function seen() { try { return sessionStorage.getItem(SESSION) === '1'; } catch (e) { return false; } }

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
    html.classList.add('opening');
    html.classList.remove('landed');
    card.classList.remove('on');
    window.scrollTo(0, 0);
    var list = R10OP.lists(name)[m];
    R = { m: m, mode: m, name: name, L: L, alive: true, frozen: !!frozen, t: 0, cues: [], fx: [], phase: 'boot', cur: -1, on: null, list: list };
    stage.classList.remove('off'); stage.style.opacity = '';
    stage.style.setProperty('--f0', R10OP.C[({ a: ['yolk', 'ink'], b: ['pool', 'yolk'], c: ['gum', 'gum'] })[name][m === 'first' ? 0 : 1]]);
    Gag.prepare(R);
    R.onCard = function () { toCard(R); };
    R.onCapped = function () { skip(true); };
    listen(true);
    if (!frozen) { R.boot = performance.now(); raf = requestAnimationFrame(loop); }
  }
  // The clock starts once the page has painted and the OP's two display faces are in (a cold load can hold
  // first paint behind render-blocking CSS while rAF already runs), so page-load work never eats a shot.
  function boot(r) {
    if (r.shots) return;
    r.shots = R10OP.build(stage, r.list, L.url);
    var ticks = 0;
    r.shots.forEach(function (s) { s.at = ticks; ticks += s.ticks; });
    r.opEnd = r.cutPlan = ticks * TICK;
    if (L.g0.done) stage.classList.add('g0'); else L.g0.then(function () { stage.classList.add('g0'); });
    r.phase = 'op';
  }
  function loop(now) {
    var r = R; if (!r || !r.alive) return;
    if (r.phase === 'boot') {
      if (!(painted() && L.opFonts.done) && now - r.boot < BOOT_CAP) { raf = requestAnimationFrame(loop); return; }
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
    if (r.S) Gag.frame(r, dt);
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
    Gag.cut(r);
  }
  function toCard(r) {
    r.phase = 'card';
    Gag.swapToLive(r);                              // the cut hides the camera's return to the page layout
    var E = r.eye = St.eyecatch(card);
    St.birdFrame({ bird: E.parts }, 0);
    if (r.m === 'first') {
      Fx.later(r, 140, function () { E.bird.classList.add('blink'); });
      Fx.later(r, 240, function () { E.bird.classList.remove('blink'); });
    }
    Fx.later(r, CARD[r.m], function () { finish(r); });
  }

  // Skip: any click / tap / key / wheel. Not a jump cut — whatever is on top fades off the live page in 250 ms.
  function skip(capped) {
    var r = R;
    if (!r || r.skipped || r.phase === 'done') return;
    if (r.phase === 'boot') boot(r);
    r.skipped = !capped; r.capped = !!capped;
    r.cues = [];
    Gag.ensureLive();
    html.classList.remove('opening');
    Gag.reveal();
    Fx.stamp(card, true);
    var top = r.phase === 'op' ? stage : r.phase === 'card' ? r.eye.el : r.S.op;
    if (r.phase === 'op') { stage.classList.add('fading'); Gag.swapToLive(r); }
    else if (r.phase === 'desk' && r.cam) {         // the phone camera eases back to the page layout under the fade
      var m = r.cam.match(/-?[\d.]+/g).map(Number);
      Fx.run(r, SKIP, function (age) {
        var k = 1 - Math.pow(1 - age / SKIP, 3);
        document.querySelector('.deskbox').style.transform = 'translate(' + (m[0] * (1 - k)).toFixed(1) + 'px,' + (m[1] * (1 - k)).toFixed(1) + 'px) scale(' + (m[2] + (1 - m[2]) * k).toFixed(4) + ')';
      });
    }
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
    Gag.swapToLive(r);
    if (r.eye) r.eye.el.remove();
    if (!skipped) { html.classList.remove('opening'); Gag.reveal(); card.classList.add('on'); }
    html.classList.add('landed');
    stage.classList.add('off'); stage.classList.remove('fading'); stage.innerHTML = ''; stage.style.opacity = '';
    Gag.teardown(r); Gag.release();
    stop();
    if (!r.frozen) try { sessionStorage.setItem(SESSION, '1'); } catch (e) {}
    document.dispatchEvent(new CustomEvent('opx:done', { detail: { mode: r.m, name: r.name, ms: t, cut: Math.round(r.opEnd || 0), peck: r.Tp ? Math.round(r.Tp) : null, skipped: !!skipped, capped: !!r.capped } }));
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
    document.querySelectorAll('.op, .eye').forEach(function (e) { e.remove(); });
    card.classList.add('on');
    if (L.all.done) Gag.staticDesk(); else L.all.then(function () { if (!R) Gag.staticDesk(); });
  }

  // ---- mockup controls ----
  function syncCtl() {
    ctl.querySelectorAll('[data-m]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === mode); });
    ctl.querySelectorAll('[data-n]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.n === name); });
    ctl.querySelector('[data-a="rm"]').setAttribute('aria-pressed', html.classList.contains('rm'));
  }
  function play() { if (Pen.reduced()) return showStatic(); start(mode); }
  ctl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'replay') play();
    else if (b.dataset.a === 'skip') skip();
    else if (b.dataset.a === 'rm') { var on = !html.classList.contains('rm'); html.classList.toggle('rm', on); try { sessionStorage.setItem('mock-rm', on ? '1' : '0'); } catch (x) {} play(); }
    else if (b.dataset.m) { mode = b.dataset.m; play(); }
    else if (b.dataset.n) { name = b.dataset.n; play(); }
    syncCtl();
  });
  syncCtl();

  addEventListener('resize', function () {           // re-lay the OP's posters for the new frame
    var r = R; if (!r || !r.shots || r.phase !== 'op') return;
    var fresh = R10OP.build(stage, r.list, L.url);
    fresh.forEach(function (s, i) { s.at = r.shots[i].at; });
    r.shots = fresh; r.on = null; r.cur = -1;
  });

  window.OPX = {
    play: function (o) { o = o || {}; if (o.mode) mode = o.mode; if (o.name) name = o.name; syncCtl(); play(); },
    skip: function () { skip(); },
    loaded: function () { return L.all.then(function () { return document.fonts.ready; }); },
    // Manual clock: render mode m / variant n at time t (ms), everything loaded. Seeking backwards restarts.
    seek: function (m, n, t) {
      if (!R || !R.frozen || R.m !== m || R.name !== n || t < R.t) { mode = m; name = n; start(m, true); boot(R); }
      var r = R;
      if (t === 0 && r.cur < 0) frame(r, 0);
      while (r.alive && r.t < t) frame(r, Math.min(t, r.t + 1000 / 60));
      return { phase: r.phase, t: Math.round(r.t), cut: Math.round(r.opEnd), peck: r.Tp ? Math.round(r.Tp) : null };
    },
    info: function () { return R && { m: R.m, name: R.name, t: R.t, phase: R.phase, cut: R.opEnd, peck: R.Tp }; }
  };

  if (q.get('autoplay') === '0' || !html.classList.contains('opening') || Pen.reduced()) showStatic();
  else start(mode);
})();
