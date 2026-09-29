/* r2-10 · landing reactions (from 10-opener-d-fx.js), re-timed onto the opener's one clock. Round 1 used
   setTimeout and WAAPI; here every reaction is either a cue (a held pose swapped at a time) or an age
   function drawn each frame, so the whole piece is deterministic and seekable frame by frame (contact
   sheets, flash audit) and a stalled frame can never desync a reaction from its impact.
   Drawn reactions (dust ticks, the snap's ping, the peck, the portrait's pop, the page flip) are held key
   poses on the hand's clock; only the falls run on the physics clock. Every reaction has a cause. */
(function () {
  var St = window.R10Stage;

  // ---- the clock's two primitives ----
  function at(R, t, fn) { R.cues.push({ t: t, fn: fn }); R.cues.sort(function (a, b) { return a.t - b.t; }); }
  function later(R, ms, fn) { at(R, R.t + ms, fn); }
  // A continuous effect: draw(age) every frame for dur ms, then end().
  function run(R, dur, draw, end, delay) { R.fx.push({ t0: R.t + (delay || 0), dur: dur, draw: draw, end: end }); }
  function step(R) {
    while (R.cues.length && R.cues[0].t <= R.t) { var c = R.cues.shift(); c.fn(R.t); if (!R.alive) return; }
    R.fx = R.fx.filter(function (f) {
      if (!R.alive) return false;                  // an effect's end() may have finished the run (a skip)
      var age = R.t - f.t0;
      if (age < 0) return true;
      if (age >= f.dur) { if (f.end) f.end(); return false; }
      f.draw(age); return true;
    });
  }
  function lerp(a, b, k) { return a + (b - a) * k; }
  // piecewise-linear keyframes [[offset, value], …] at progress p
  function kf(K, p) {
    for (var i = 1; i < K.length; i++) if (p <= K[i][0]) return lerp(K[i - 1][1], K[i][1], (p - K[i - 1][0]) / (K[i][0] - K[i - 1][0]));
    return K[K.length - 1][1];
  }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

  // Pen ticks thrown out sideways from each end of the contact line: three held frames, gone in 190 ms.
  // spec: [x0, x1, y] of the contact line; size 1 = mug-sized; flat = the book's slap (air, not dust).
  function dust(R, spec, size, flat) {
    var g = R.S.svgEl('g', {}, R.S.fx), paths = [];
    var angs = flat ? [0, 9] : [14, 42], len = 15 * size, r0 = 7 * size;
    [-1, 1].forEach(function (side) {
      var cx = side < 0 ? spec[0] : spec[1];
      angs.forEach(function (a, i) {
        var rad = a * Math.PI / 180, l = len * (1 - i * .18);
        paths.push({ p: R.S.svgEl('path', { class: 'tk' }, g), x: cx, y: spec[2] - (flat ? 12 + i * 22 : 2), dx: Math.cos(rad) * side, dy: -Math.sin(rad), l: l });
      });
    });
    var last = -1;
    run(R, 190, function (age) {
      var f = age < 60 ? 0 : age < 125 ? 1 : 2;
      if (f === last) return; last = f;
      var a = [0, .35, 1][f], b = [.55, 1.25, 1.45][f];
      paths.forEach(function (q) {
        q.p.setAttribute('d', 'M' + (q.x + q.dx * (r0 + q.l * a)).toFixed(1) + ' ' + (q.y + q.dy * (r0 + q.l * a)).toFixed(1) +
          ' L' + (q.x + q.dx * (r0 + q.l * b)).toFixed(1) + ' ' + (q.y + q.dy * (r0 + q.l * b)).toFixed(1));
      });
    }, function () { g.remove(); });
  }

  // The snapped string's ping: three short strokes fanning up from the break, two poses.
  function ping(R, x, y) {
    var g = R.S.svgEl('g', {}, R.S.fx), D = [-128, -90, -52], ps = D.map(function () { return R.S.svgEl('path', { class: 'tk' }, g); }), last = -1;
    run(R, 115, function (age) {
      var f = age < 55 ? 0 : 1; if (f === last) return; last = f;
      var a = f ? 16 : 8, b = f ? 34 : 20;
      D.forEach(function (deg, i) {
        var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
        ps[i].setAttribute('d', 'M' + (x + c * a).toFixed(1) + ' ' + (y + s * a).toFixed(1) + ' L' + (x + c * b).toFixed(1) + ' ' + (y + s * b).toFixed(1));
      });
    }, function () { g.remove(); });
  }

  // The table takes the weight: the whole drawing drops a few px and comes back — three held poses.
  function shake(R, px) {
    run(R, 150, function (age) { R.S.shake.style.transform = age < 50 ? 'translateY(' + px + 'px)' : 'translateY(' + (-px * .35).toFixed(2) + 'px)'; },
      function () { R.S.shake.style.transform = ''; });
  }

  function steam(R) {                              // the jolt pushes one puff up out of the mug
    [].forEach.call(R.S.steam.querySelectorAll('path'), function (p, i) {
      run(R, 640, function (age) {
        var q = easeOut(age / 640);
        p.style.opacity = kf([[0, 0], [.25, .5], [1, 0]], q).toFixed(3);
        p.style.transform = 'translateY(' + lerp(16, -34, q).toFixed(1) + 'px) scaleY(' + lerp(.7, 1.1, q).toFixed(3) + ')';
      }, function () { p.style.opacity = 0; }, i * 70);
    });
  }

  // Caret blinks on (two quick blinks), then keeps the live desk's 1.15 s rhythm.
  function caret(R) {
    var c = R.S.caret, t0 = R.t;
    c.classList.add('on');
    R.caretAt = t0;
    run(R, 1e9, function (age) {
      var on = age < 240 ? (age < 80 || age >= 160) : ((age - 240) % 1150) < 575;
      c.style.visibility = on ? 'visible' : 'hidden';
    });
  }

  // One flash only (WCAG 2.3.1: far under 3/s), local to the lens, plus the live desk's 咔嚓 and star.
  function flash(R) {
    var S = R.S;
    run(R, 260, function (age) { S.flash.style.opacity = kf([[0, 0], [.07, .95], [.3, .3], [1, 0]], age / 260).toFixed(3); }, function () { S.flash.style.opacity = 0; });
    run(R, 620, function (age) {
      var p = easeOut(age / 620);
      S.cstar.style.opacity = kf([[0, 0], [.18, 1], [1, 0]], p).toFixed(3);
      S.cstar.style.transform = 'scale(' + (p < .18 ? lerp(.3, .5, p / .18) : lerp(.5, 1.5, (p - .18) / .82)).toFixed(3) + ')';
    }, function () { S.cstar.style.opacity = 0; });
    run(R, 760, function (age) {
      var p = easeOut(age / 760);
      S.kacha.style.opacity = kf([[0, 0], [.14, 1], [.62, 1], [1, 0]], p).toFixed(3);
      var y = kf([[0, 8], [.14, 0], [.62, 0], [1, -16]], p), s = kf([[0, .55], [.14, 1.08], [.3, 1], [1, 1]], p), r = kf([[0, -5], [.14, -2], [1, -2]], p);
      S.kacha.style.transform = 'translateY(' + y.toFixed(1) + 'px) scale(' + s.toFixed(3) + ') rotate(' + r.toFixed(1) + 'deg)';
    }, function () { S.kacha.style.opacity = 0; });
  }

  // The book slaps flat and the air under it lifts one page over: frames 1–4, then rest.
  function pages(R) {
    [[1, 0], [2, 55], [3, 110], [4, 170], [0, 235]].forEach(function (f) { later(R, f[1], function () { St.bookFrame(R.S, f[0]); }); });
  }

  // Face-down → mid → upright-and-surprised (overshoot) → settled: held drawings, not a tween.
  function popUp(R, done) {
    var fr = R.S.body.frame;
    R.bodies.frame.manual = true;
    St.faceFrame(R.S, 3);
    fr.classList.remove('flat');
    fr.style.transform = 'scaleY(.42)';
    later(R, 45, function () { fr.style.transform = 'scaleY(1.07)'; });
    later(R, 95, function () { fr.style.transform = ''; fr.classList.remove('air'); if (done) done(); });
  }

  // The corner card on the live page, set by a hand stamp (after the opener: the page's own clock).
  function stamp(card, quick) {
    card.classList.add('on');
    if (quick) { card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 }); return; }
    card.animate([
      { transform: 'rotate(-4deg) scale(1.22)', opacity: 0, easing: 'step-end' },
      { transform: 'rotate(-4deg) scale(1.22)', opacity: 1, offset: .02, easing: 'step-end' },
      { transform: 'rotate(-1.5deg) scale(.96)', offset: .4, easing: 'step-end' },
      { transform: 'rotate(-2deg) scale(1)', offset: .75 }], { duration: 170, fill: 'backwards' });
  }

  window.R10Fx = { at: at, later: later, run: run, step: step, kf: kf, dust: dust, ping: ping, shake: shake, steam: steam,
    caret: caret, flash: flash, pages: pages, popUp: popUp, stamp: stamp };
})();
