/* 10 · D — landing reactions. Drawn reactions (dust ticks, the snap's ping, the bird's peck, the
   portrait's pop, the page flip) are held key poses swapped on the hand's clock (~12–20 fps);
   only the falls themselves run on the physics clock. Every reaction has a cause: an impact. */
(function () {
  var St = window.D10Stage;
  function later(R, ms, fn) { R.timers.push(setTimeout(function () { if (R.alive) fn(); }, ms)); }

  // Pen ticks thrown out sideways from each end of the contact line: drawn short, pushed out,
  // then only their tails remain — three held frames, gone in ~190 ms.
  // spec: [x0, x1, y] of the contact line; size 1 = mug-sized; flat = the book's slap (air, not dust).
  function dust(R, spec, size, flat) {
    var fx = R.S.fx, g = R.S.svgEl('g', {}, fx), paths = [];
    var angs = flat ? [0, 9] : [14, 42], len = 15 * size, r0 = 7 * size;
    [-1, 1].forEach(function (side) {
      var cx = side < 0 ? spec[0] : spec[1];
      angs.forEach(function (a, i) {
        var rad = a * Math.PI / 180, dx = Math.cos(rad) * side, dy = -Math.sin(rad), l = len * (1 - i * .18);
        paths.push({ p: R.S.svgEl('path', { class: 'tk' }, g), x: cx, y: spec[2] - (flat ? 12 + i * 22 : 2), dx: dx, dy: dy, l: l });
      });
    });
    function pose(a, b) {
      paths.forEach(function (q) {
        q.p.setAttribute('d', 'M' + (q.x + q.dx * (r0 + q.l * a)).toFixed(1) + ' ' + (q.y + q.dy * (r0 + q.l * a)).toFixed(1) +
          ' L' + (q.x + q.dx * (r0 + q.l * b)).toFixed(1) + ' ' + (q.y + q.dy * (r0 + q.l * b)).toFixed(1));
      });
    }
    pose(0, .55);
    later(R, 60, function () { pose(.35, 1.25); });
    later(R, 125, function () { pose(1, 1.45); });
    later(R, 190, function () { g.remove(); });
  }

  // The snapped string's ping: three short strokes fanning up from the break.
  function ping(R, x, y) {
    var g = R.S.svgEl('g', {}, R.S.fx), ps = [-128, -90, -52].map(function () { return R.S.svgEl('path', { class: 'tk' }, g); });
    function pose(a, b) {
      [-128, -90, -52].forEach(function (deg, i) {
        var r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
        ps[i].setAttribute('d', 'M' + (x + c * a).toFixed(1) + ' ' + (y + s * a).toFixed(1) + ' L' + (x + c * b).toFixed(1) + ' ' + (y + s * b).toFixed(1));
      });
    }
    pose(8, 20);
    later(R, 55, function () { pose(16, 34); });
    later(R, 115, function () { g.remove(); });
  }

  // The table takes the weight: the whole drawing drops a few px and comes back, stepped.
  function shake(R, px) {
    R.S.shake.animate([{ transform: 'translateY(' + px + 'px)' }, { transform: 'translateY(' + (-px * .35) + 'px)' }, { transform: 'none' }],
      { duration: 150, easing: 'steps(3, jump-none)' });
  }

  function steam(R) {                              // the jolt pushes one puff up out of the mug
    [].forEach.call(R.S.steam.querySelectorAll('path'), function (p, i) {
      p.animate([{ opacity: 0, transform: 'translateY(16px) scaleY(.7)' }, { opacity: .5, offset: .25 }, { opacity: 0, transform: 'translateY(-34px) scaleY(1.1)' }],
        { duration: 640, delay: i * 70, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' });
    });
  }

  // Caret blinks on (two quick blinks), then keeps the live desk's 1.15 s rhythm so the hand-off can sync it.
  function caret(R) {
    var c = R.S.caret;
    c.classList.add('on');
    R.caretAnim = c.animate([{ opacity: 1 }, { opacity: 0, offset: .34 }, { opacity: 1, offset: .67 }, { opacity: 0 }], { duration: 240, easing: 'steps(1, jump-end)' });
    R.caretAnim.onfinish = function () {
      if (!R.alive) return;
      R.caretAnim = c.animate([{ opacity: 1, offset: 0 }, { opacity: 1, offset: .45 }, { opacity: 0, offset: .5 }, { opacity: 0, offset: .95 }, { opacity: 1, offset: 1 }], { duration: 1150, iterations: Infinity, easing: 'ease' });
    };
  }

  // One flash only (WCAG 2.3.1: far under 3/s), local to the lens, plus the live desk's 咔嚓 and star.
  function flash(R) {
    R.S.flash.animate([{ opacity: 0 }, { opacity: .95, offset: .07 }, { opacity: .3, offset: .3 }, { opacity: 0 }], { duration: 260 });
    R.S.cstar.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, offset: .18 }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 620, easing: 'ease-out' });
    R.S.kacha.animate([
      { opacity: 0, transform: 'translateY(8px) scale(.55) rotate(-5deg)' },
      { opacity: 1, transform: 'translateY(0) scale(1.08) rotate(-2deg)', offset: .14 },
      { transform: 'scale(1) rotate(-2deg)', offset: .3 }, { opacity: 1, offset: .62 },
      { opacity: 0, transform: 'translateY(-16px) rotate(-2deg)' }], { duration: 760, easing: 'cubic-bezier(.2,.7,.2,1)' });
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

  // 日常 · ep.NN is set by a hand stamp: slapped down slightly large, a hair small, then still.
  function stamp(card, quick) {
    card.classList.add('on');
    if (quick) { card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 }); return; }
    card.animate([
      { transform: 'rotate(-4deg) scale(1.22)', opacity: .0, easing: 'step-end' },
      { transform: 'rotate(-4deg) scale(1.22)', opacity: 1, offset: .02, easing: 'step-end' },
      { transform: 'rotate(-1.5deg) scale(.96)', offset: .4, easing: 'step-end' },
      { transform: 'rotate(-2deg) scale(1)', offset: .75 }], { duration: 170, fill: 'backwards' });
  }

  window.D10Fx = { later: later, dust: dust, ping: ping, shake: shake, steam: steam, caret: caret, flash: flash, pages: pages, popUp: popUp, stamp: stamp };
})();
