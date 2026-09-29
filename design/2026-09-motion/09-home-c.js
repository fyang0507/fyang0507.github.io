/* 09 · C — "A note for returning visitors". localStorage remembers the last visit; on return a
   torn notepad sheet flutters down, sticks to the desk's front edge near the object that changed,
   and a pen arrow points at it. Paper is on the physics clock: a falling-leaf flutter (sway with
   rotation leading it, decaying), contact, one small spring overshoot. Drag it and it peels —
   stiff while the adhesive holds, then free; flick it away and it's gone for this visit. */
(function () {
  var KEY = 'fy09-visit', DAY = 864e5, NS = 'http://www.w3.org/2000/svg';
  // note box (desk %, rotation) + arrow tip (image px, 1448×1086 space) per object
  var SPOT = {
    book: { box: [6.5, 82.6, 17.5, -3], from: [.93, .06], tip: [548, 868], hot: '.bookwrap' },
    mug: { box: [6.5, 82.6, 17.5, -2.5], from: [.9, .02], tip: [488, 762], hot: '.bookwrap' },
    camera: { box: [81, 82.6, 16.5, 2.5], from: [.3, 0], tip: [1172, 872], hot: '.camwrap' },
    laptop: { box: [10, 24, 15, 3], from: [.96, .55], tip: [452, 392], hot: '.lap' }
  };
  function iso(t) { return new Date(t).toISOString().slice(0, 10); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function span(days) {
    if (days < 2) return ['a day', '一天'];
    if (days < 14) return [days + ' days', days + ' 天'];
    if (days < 60) { var w = Math.round(days / 7); return [w + ' weeks', ['', '一', '两', '三', '四', '五', '六', '七', '八'][w] + '周']; }
    var m = Math.round(days / 30); return [m + ' months', m + ' 个月'];
  }
  // Pick the one thing worth saying. Essays first, then photos, then projects; else say so honestly.
  function compose(prev, now) {
    if (!prev) return { spot: 'book', en: 'start with the book', zh: '先翻翻这本', since: '', visit: 1 };
    var since = iso(prev.t), days = Math.round((now - prev.t) / DAY), meta = { since: since, visit: prev.n + 1 };
    var posts = FY_POSTS.filter(function (p) { return p.date > since; });
    var photos = FY_PHOTOS.filter(function (p) { return p.date > since; });
    var projs = BUILDING_PROJECTS.filter(function (p) { return (p.updated || '') > since; });
    if (posts.length) return Object.assign({ spot: 'book', en: (posts.length === 1 ? 'a new essay' : posts.length + ' new essays') + ' since you last came', zh: '你走后又写了 ' + posts.length + '\u00a0篇' }, meta);
    if (photos.length) return Object.assign({ spot: 'camera', en: photos.length + ' new frames since you last came', zh: '你走后又洗了 ' + photos.length + '\u00a0张' }, meta);
    if (projs.length) return Object.assign({ spot: 'laptop', en: projs.length + ' projects moved on', zh: '电脑上更新了 ' + projs.length + '\u00a0个项目' }, meta);
    var s = span(days);
    return Object.assign({ spot: 'mug', en: 'nothing new in ' + s[0] + '. just more tea.', zh: s[1] + '没更新，茶倒是续了。' }, meta);
  }
  function torn(seed) {                                   // a torn top edge, the same tear every time
    var r = Pen.rng(seed), pts = ['0% ' + (3 + r() * 4).toFixed(1) + '%'];
    for (var x = 5; x < 100; x += 4 + r() * 5) pts.push(x.toFixed(1) + '% ' + (r() * 7).toFixed(1) + '%');
    pts.push('100% ' + (2 + r() * 4).toFixed(1) + '%', '100% 100%', '0% 100%');
    return 'polygon(' + pts.join(',') + ')';
  }
  function spring(state, target, k, c, dt) { var a = -k * (state.p - target) - c * state.v; state.v += a * dt; state.p += state.v * dt; }

  window.HomeC = function (host, panel) {
    var desk = HomeDesk.build(host), d = desk.el, note = null, arrowSvg = document.createElementNS(NS, 'svg');
    arrowSvg.setAttribute('class', 'note-arrow'); arrowSvg.setAttribute('viewBox', '0 0 1448 1086'); arrowSvg.setAttribute('aria-hidden', 'true');
    d.appendChild(arrowSvg);
    var arrowPaths = [];

    function drawArrow(spec, instant) {
      arrowSvg.innerHTML = ''; var S = SPOT[spec.spot], b = S.box;
      var a = [(b[0] + b[2] * S.from[0]) / 100 * 1448, b[1] / 100 * 1086 + S.from[1] * b[2] / 100 * 1448];
      var ar = Pen.arrow(a, S.tip, spec.en, { bend: .28, head: 17 });
      arrowPaths = [ar.shaft, ar.head].map(function (dd) {
        var p = Pen.path(dd, { width: 2 }); p.setAttribute('vector-effect', 'non-scaling-stroke'); arrowSvg.appendChild(p); return p;
      });
      Pen.draw(arrowPaths[0], { duration: instant ? 1 : 420 });
      Pen.draw(arrowPaths[1], { duration: instant ? 1 : 160, delay: instant ? 0 : 380 });
    }
    function eraseArrow() { arrowPaths.forEach(function (p) { Pen.erase(p, { duration: 160 }); }); arrowPaths = []; }

    function show(spec) {
      if (note) note.remove(); eraseArrow(); cancelAnimationFrame(show.raf);
      var S = SPOT[spec.spot], b = S.box;
      note = document.createElement('div'); note.className = 'note'; note.setAttribute('role', 'note');
      note.style.cssText = 'left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + 'cqw';
      note.innerHTML = '<div class="note-shadow"></div><div class="note-paper" style="clip-path:' + torn(spec.en) + '">' +
        '<p class="n-en">' + spec.en + '</p><p class="n-zh" lang="zh">' + spec.zh + '</p>' +
        (spec.since ? '<div class="n-meta n-since">last here ' + spec.since + '</div>' : '') +
        '<div class="n-meta"><span>visit ' + pad(spec.visit) + '</span><button class="n-peel" type="button">peel off · 撕掉</button></div></div>';
      d.appendChild(note);
      var n = note, paper = n.querySelector('.note-paper'), shadow = n.querySelector('.note-shadow'), rest = b[3];
      var W = d.getBoundingClientRect().width, H = W * .75;
      function pose(x, y, r, sy, sc, lift) {
        paper.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + r.toFixed(2) + 'deg) scale(' + (sc || 1) + ',' + ((sy || 1) * (sc || 1)).toFixed(3) + ')';
        shadow.style.transform = 'translate(' + (x + lift * .25).toFixed(1) + 'px,' + (y + 2 + lift * .55).toFixed(1) + 'px) rotate(' + r.toFixed(2) + 'deg) scale(' + (1 + lift * .006).toFixed(3) + ')';
        shadow.style.opacity = Math.max(.2, .75 - lift * .02).toFixed(2);
      }
      n.pose = pose;
      if (Pen.reduced()) { pose(0, 0, rest, 1, 1, 0); drawArrow(spec, true); bindPeel(n, spec, pose, rest); return; }

      // Flutter: falls from above the stage, swaying ~1.5 times, rotation leading the sway.
      var T = 1650, t0 = performance.now(), fromY = -(b[1] / 100 * H + H * .2), dx0 = W * .05, A = W * .07, B = 22, ph = .7, last = null;
      pose(dx0, fromY, rest, 1, 1, 30);
      (function fall(now) {
        if (n !== note) return;
        var t = Math.min(1, (now - t0) / T), f = t < .18 ? t * t / .36 : .09 + (t - .18); f /= .91;
        var a = 2 * Math.PI * 1.55 * t + ph, amp = 1 - .8 * t;
        var x = dx0 * (1 - t) + A * amp * Math.sin(a), r = rest + B * amp * Math.cos(a), y = fromY * (1 - f);
        pose(x, y, r, 1 - .16 * amp * Math.abs(Math.sin(a)), 1, 30 * (1 - t));
        if (t < 1) { last = { x: x, r: r, now: now }; show.raf = requestAnimationFrame(fall); return; }
        var vx = (x - last.x) / ((now - last.now) / 1000 || .016), vr = (r - last.r) / ((now - last.now) / 1000 || .016);
        settle(n, { p: x, v: vx * .35 }, { p: r, v: vr * .35 }, { p: 0, v: 0 }, rest, pose, function () {
          setTimeout(function () { if (n === note) drawArrow(spec); }, 180);
          lookUp(n);
        });
      })(t0);
      bindPeel(n, spec, pose, rest);
    }

    // Contact → one small overshoot → still. Also used to re-stick a note you let go of.
    function settle(n, X, R, Y, rest, pose, done) {
      var lastT = performance.now();
      (function step(now) {
        if (n !== note || n.dragging) return;
        var dt = Math.min(.032, (now - lastT) / 1000); lastT = now;
        spring(X, 0, 260, 17, dt); spring(R, rest, 260, 17, dt); spring(Y, 0, 260, 17, dt);
        pose(X.p, Y.p, R.p, 1, 1, 0);
        if (Math.abs(X.p) + Math.abs(Y.p) + Math.abs(R.p - rest) < .08 && Math.abs(X.v) + Math.abs(R.v) + Math.abs(Y.v) < 2) { pose(0, 0, rest, 1, 1, 0); if (done) done(); return; }
        show.raf = requestAnimationFrame(step);
      })(lastT);
    }
    function lookUp(n) {                                   // the bird notices something land nearby
      var bird = desk.bird; if (Pen.reduced() || bird.held) return;
      bird.held = true;
      (async function () {
        await bird.settle(); var r = n.getBoundingClientRect(), c = bird.center();
        bird.setF(5); await HomeDesk.sleep(90); bird.face(r.left + r.width / 2 < c.x ? -1 : 1); bird.setF(0);
        await HomeDesk.sleep(1300); bird.held = false;
      })();
    }

    function bindPeel(n, spec, pose, rest) {
      var g = null;
      n.addEventListener('pointerdown', function (e) {
        if (e.target.closest('.n-peel') || n.gone) return;
        n.setPointerCapture(e.pointerId); n.dragging = true; cancelAnimationFrame(show.raf);
        g = { sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, t: performance.now(), vx: 0, vy: 0, free: false, r: rest };
        n.classList.add('held');
      });
      n.addEventListener('pointermove', function (e) {
        if (!g) return;
        var now = performance.now(), dt = Math.max(8, now - g.t), dx = e.clientX - g.sx, dy = e.clientY - g.sy;
        g.vx = g.vx * .5 + (dx - g.dx) / dt * .5; g.vy = g.vy * .5 + (dy - g.dy) / dt * .5; g.dx = dx; g.dy = dy; g.t = now;
        var dist = Math.hypot(dx, dy);
        if (!g.free && dist > 30) { g.free = true; n.classList.add('free'); eraseArrow(); }
        if (!g.free) {                                     // adhesive holds: the bottom lifts, the top stays put
          var k = dist / 30; pose(dx * .12, dy * .12, rest + Math.max(-7, Math.min(7, dx * .22)), 1 - .07 * k, 1, 6 * k);
        } else {
          g.r += ((rest + Math.max(-24, Math.min(24, g.vx * 16))) - g.r) * .25;
          pose(dx, dy, g.r, 1, 1.03, 16);
        }
      });
      function up() {
        if (!g) return; var G = g; g = null; n.dragging = false; n.classList.remove('held');
        if (G.free && (Math.hypot(G.dx, G.dy) > 90 || Math.hypot(G.vx, G.vy) > .8)) return flyOff(n, G.dx, G.dy, G.r, G.vx, G.vy, pose);
        n.classList.remove('free');
        settle(n, { p: G.free ? G.dx : G.dx * .12, v: 0 }, { p: G.free ? G.r : rest, v: 0 }, { p: G.free ? G.dy : G.dy * .12, v: 0 }, rest, pose, function () { if (!arrowPaths.length) drawArrow(spec); });
      }
      n.addEventListener('pointerup', up); n.addEventListener('pointercancel', up);
      function peelByKey() {                               // keyboard / button: a short peel, then away
        if (n.gone) return;
        if (Pen.reduced()) return dismiss(n);
        eraseArrow(); n.classList.add('free');
        var t0 = performance.now();
        (function lift(now) {
          var k = Math.min(1, (now - t0) / 140); pose(0, -2 * k, rest + 6 * k, 1 - .06 * k, 1, 8 * k);
          if (k < 1) requestAnimationFrame(lift); else flyOff(n, 0, -2, rest + 6, .9, -.55, pose);
        })(t0);
      }
      n.querySelector('.n-peel').addEventListener('click', peelByKey);
      n.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Delete') peelByKey(); });
    }
    function flyOff(n, x, y, r, vx, vy, pose) {            // momentum + gravity + spin, then gone
      n.gone = true; eraseArrow();
      var t0 = performance.now(), last = t0; vx *= 1000; vy *= 1000; var spin = vx * .04;
      (function fly(now) {
        var dt = Math.min(.032, (now - last) / 1000); last = now;
        vy += 1400 * dt; x += vx * dt; y += vy * dt; r += spin * dt;
        pose(x, y, r, 1, 1.03, 20); n.style.opacity = Math.max(0, 1 - (now - t0) / 520);
        if (now - t0 < 540) requestAnimationFrame(fly); else dismiss(n);
      })(t0);
    }
    function dismiss(n) {
      var hot = d.querySelector(SPOT[n.spot || 'book'].hot);
      n.remove(); if (n === note) note = null; eraseArrow();
      try { sessionStorage.setItem(KEY + '-peeled', '1'); } catch (e) {}
      if (document.activeElement === document.body && hot) hot.focus({ preventScroll: true });
    }

    // Real visit memory, then the demo simulator.
    var status = panel.querySelector('.c-status');
    function real() {
      var prev = null, now = Date.now();
      try { prev = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
      try { localStorage.setItem(KEY, JSON.stringify({ t: now, n: (prev ? prev.n : 0) + 1 })); } catch (e) {}
      var peeled = false; try { peeled = sessionStorage.getItem(KEY + '-peeled') === '1'; } catch (e) {}
      if (prev && now - prev.t < 6 * 36e5) { status.textContent = 'your real visit: here ' + Math.max(1, Math.round((now - prev.t) / 6e4)) + ' min ago → no note (you were just here) · 刚来过，不留言'; return; }
      status.textContent = prev ? 'your real visit: last here ' + iso(prev.t) : 'your real visit: first time on this board';
      if (!peeled && !simulated) play(compose(prev, now));
    }
    var simulated = false;
    function play(spec) { show(spec); if (note) note.spot = spec.spot; }
    function sim(kind) {
      var now = Date.now(); simulated = true;
      if (kind === 'first') return play(compose(null, now));
      var days = kind === 'weeks' ? 21 : 122;
      play(compose({ t: now - days * DAY, n: kind === 'weeks' ? 5 : 2 }, now));
    }
    panel.addEventListener('click', function (e) { var b = e.target.closest('[data-sim]'); if (b) { desk.replayDraw(); sim(b.dataset.sim); } });
    window.replayC = function () { desk.replayDraw(); sim('months'); };
    window.HomeC.compose = compose;
    setTimeout(real, 900);
    return desk;
  };
})();
