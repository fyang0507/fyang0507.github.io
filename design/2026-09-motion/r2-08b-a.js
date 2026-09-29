/* r2-08b-a.js — A · Tugged slip / 拽纸条. Physics clock.
   Each margin note is a paper slip with a punched eyelet. Pointing at a ref knots a coral thread round the number,
   throws it slack across the leading to the eyelet, and the moment it catches the thread goes taut: it twangs
   once, the number is tugged a hair, and the slip lurches out of the margin toward the sentence, rising to the
   ref's line and squaring up to face the text (it pivots on the eyelet, trailing edge lagging while it moves).
   Let go and the thread slackens and reels back into the knot while the slip drifts home to its tilt.
   First pull: the full throw (~650 ms). Every pull after: no throw, a stiffer spring (~300 ms).
   Phone: the slip from the slot (r2-08b-slip.js). Reduced motion: the thread is simply there, nothing travels. */
(function () {
  var ctx = RD.mount(document.getElementById('stage-a'), 'a');
  var rd = ctx.rd, model = FN.prepare(ctx), slip = FN.Slip(ctx, model);
  rd.classList.add('ta');
  ['zh', 'en'].forEach(function (l) {
    Object.keys(model[l]).forEach(function (n) {
      var note = model[l][n], r = Pen.rng('ta-tilt-' + note.key);
      note.r0 = (r() - .5) * 4;          // resting tilt, ±2°, stable per note
      note.inr = note.mn.querySelector('.mn-in');
      note.inr.style.transform = 'rotate(' + note.r0.toFixed(2) + 'deg)';
    });
  });

  var live = [], raf = 0, last = 0;
  var EYE = { x: 11.5, y: 14.5 };   // eyelet centre in the slip's own box = its rotation pivot (see .mn-in)

  function geom(note) {
    var B = note.body.getBoundingClientRect(), m = FN.metrics(note.body);
    var mr = note.mn.getBoundingClientRect(), ra = note.a.getBoundingClientRect(), rw = FN.row(note.sup);
    var glyphTop = (rw.top + rw.bottom) / 2 - m.fs * .52 - B.top;
    var yRun = glyphTop - Math.min(6, (m.lh - m.fs) * .36);
    var eye = { x: mr.left - B.left + EYE.x, y: mr.top - B.top + EYE.y };
    return {
      A: { x: ra.right - B.left + 1.5, y: Math.max(yRun, ra.top - B.top + 1) }, eye: eye,
      tx: Math.min(0, note.body.clientWidth + 14 - (mr.left - B.left)),          // out across the gutter, clear of the text
      ty: Math.max(-320, Math.min(320, yRun - eye.y))                              // rise or drop to the ref's leading, even past a long neighbour
    };
  }

  function start(note) {
    var st = live.filter(function (s) { return s.note === note; })[0], full = FN.first('a');
    FN.seen('a');
    if (!st) {
      var wire = note.body.querySelector('.fn-wire'), path = Pen.path('', { width: 1.5 });
      path.setAttribute('class', 'ta-thread'); wire.appendChild(path);
      st = { note: note, path: path, x: 0, vx: 0, y: 0, vy: 0, r: 0, vr: 0, z: 1, vz: 0, amp: 0, vamp: 0, amp2: 0, vamp2: 0, reach: 0, sx: 0, vsx: 0 };
      live.push(st);
    }
    st.g = geom(note); st.full = full; st.phase = 'in'; st.t0 = performance.now(); st.caught = false; st.reach0 = st.reach;
    if (st.knot) st.knot.svg.remove();
    st.knot = Pen.annotate(note.a, 'loop', { manual: true, seed: 'ta-knot-' + note.key, pad: 3, width: 1.5, duration: full ? 150 : 100, z: 2 });
    st.knot.show();
    note.mn.classList.add('on'); note.a.classList.add('on');
    if (Pen.reduced()) { st.reach = 1; st.caught = true; st.x = st.y = st.r = st.amp = st.amp2 = 0; render(st); return; }
    kick();
  }
  function stop(note) {
    var st = live.filter(function (s) { return s.note === note; })[0];
    if (!st) return;
    note.mn.classList.remove('on'); note.a.classList.remove('on');
    st.phase = 'out'; st.t0 = performance.now(); st.reach0 = st.reach; st.erased = false;
    if (Pen.reduced()) { finish(st); return; }
    kick();
  }
  function finish(st) {
    st.path.remove(); if (st.knot) { var k = st.knot; k.hide(); setTimeout(function () { k.svg.remove(); }, 200); }
    st.note.inr.style.transform = 'rotate(' + st.note.r0.toFixed(2) + 'deg)'; st.note.a.style.transform = '';
    live.splice(live.indexOf(st), 1);
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  function sp(s, key, vkey, target, k, c, dt) { s[vkey] += (-k * (s[key] - target) - c * s[vkey]) * dt; s[key] += s[vkey] * dt; }
  function still(s, key, vkey, target, e) { return Math.abs(s[key] - target) < e && Math.abs(s[vkey]) < e * 8; }
  function easeOut(t) { t = Math.max(0, Math.min(1, t)); return 1 - Math.pow(1 - t, 2.4); }

  function step(st, now, dt) {
    var t = now - st.t0, g = st.g, stiff = st.full ? [210, 16] : [520, 38];
    if (st.phase === 'in') {
      if (!st.caught) {                                   // the throw: slack thread flying out to the eyelet
        var ts = st.full ? 50 : 0, td = st.full ? 170 : 90;
        st.reach = st.reach0 + (1 - st.reach0) * easeOut((t - ts) / td);
        st.amp2 = (st.full ? 10 : 2.5) * (1 - st.reach * .5);
        if (st.reach >= 1) {                              // caught: tension arrives all at once
          st.caught = true; st.vamp = st.full ? -300 : -130; st.vamp2 = 0;
          st.vx = Math.min(st.vx, st.full ? -640 : -220); st.vsx = st.full ? 70 : 34;
          st.vr += st.full ? -110 : -55; st.vz += st.full ? 1.1 : .5;   // torque at the eyelet swings it; the jerk lifts it off the page
        }
      }
      if (st.caught) {
        for (var i = 0; i < 4; i++) {
          var d = dt / 4;
          sp(st, 'x', 'vx', g.tx, stiff[0], stiff[1], d);
          sp(st, 'y', 'vy', g.ty, stiff[0], stiff[1], d);
          var lag = Math.max(-7, Math.min(7, -st.vy * .016 + st.vx * .004));   // trailing edge lags the pull
          sp(st, 'r', 'vr', -st.note.r0 + lag, 380, 26, d);                      // squares up to the text
          sp(st, 'amp', 'vamp', 0, 1700, 16, d);                                 // the twang
          sp(st, 'amp2', 'vamp2', 0, 900, 40, d);
          sp(st, 'sx', 'vsx', 0, 900, 30, d);                                    // the number, tugged a hair
          sp(st, 'z', 'vz', 1.035, 260, 22, d);                                   // held up while taut
        }
      }
      render(st);
      return !(st.caught && still(st, 'x', 'vx', g.tx, .3) && still(st, 'y', 'vy', g.ty, .3) && still(st, 'amp', 'vamp', 0, .15) && still(st, 'r', 'vr', -st.note.r0, .05));
    }
    // out: slack, reel in, drift home
    for (var j = 0; j < 4; j++) {
      var e = dt / 4;
      sp(st, 'x', 'vx', 0, 150, 17, e); sp(st, 'y', 'vy', 0, 150, 17, e);
      sp(st, 'r', 'vr', Math.max(-5, Math.min(5, st.vy * .01)), 200, 20, e);
      sp(st, 'amp', 'vamp', 5, 220, 20, e); sp(st, 'amp2', 'vamp2', 0, 400, 30, e); sp(st, 'sx', 'vsx', 0, 900, 30, e); sp(st, 'z', 'vz', 1, 200, 24, e);
    }
    st.reach = st.reach0 * (1 - easeOut((t - 30) / 190));
    if (st.reach < .35 && !st.erased) { st.erased = true; st.knot.hide(); }
    render(st);
    if (st.reach <= 0 && still(st, 'x', 'vx', 0, .3) && still(st, 'y', 'vy', 0, .3) && still(st, 'r', 'vr', 0, .05)) { finish(st); return false; }
    return true;
  }

  function render(st) {
    var g = st.g, n = st.note;
    n.inr.style.transform = 'translate(' + st.x.toFixed(2) + 'px,' + st.y.toFixed(2) + 'px) rotate(' + (n.r0 + st.r).toFixed(2) + 'deg) scale(' + st.z.toFixed(4) + ')';
    n.a.style.transform = st.sx ? 'translateX(' + st.sx.toFixed(2) + 'px)' : '';
    var A = { x: g.A.x + st.sx, y: g.A.y }, E = { x: g.eye.x + st.x, y: g.eye.y + st.y };
    var dx = E.x - A.x, dy = E.y - A.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, pts = [];
    for (var i = 0; i <= 18; i++) {
      var u = i / 18, off = st.amp * Math.sin(Math.PI * u) + st.amp2 * Math.sin(2 * Math.PI * u);
      pts.push([A.x + dx * u + nx * off, A.y + dy * u + ny * off]);
    }
    st.path.setAttribute('d', Pen.smooth(pts));
    var L = st.path.getTotalLength(), shown = Math.max(0, Math.min(1, st.reach)) * L;
    st.path.style.strokeDasharray = shown < .5 ? '0 ' + (L + 10) : shown.toFixed(1) + ' ' + (L + 10);
  }

  function frame(now) {
    raf = 0;
    var dt = Math.min(.032, (now - last) / 1000); last = now;
    var busy = false;
    live.slice().forEach(function (st) { if (step(st, now, dt)) busy = true; });
    if (busy) raf = requestAnimationFrame(frame);
  }

  var hov = FN.hover(ctx, model, { on: start, off: stop, tap: slip.open });
  ctx.onLayout(function () { live.slice().forEach(finish); });
  document.addEventListener('mock:rm', function () { live.slice().forEach(finish); });

  function show(n, first) {
    FN.seen('a', !first);
    hov.off(true);
    var note = model.get(n);
    ctx.stage.scrollIntoView({ block: 'center', behavior: Pen.reduced() ? 'auto' : 'smooth' });   // the replay button sits under the stage
    ctx.scrollTo(ctx.top(note.a) - rd.clientHeight * .42);
    setTimeout(function () { if (FN.marginShown(note)) hov.on(note); else slip.open(note); }, Pen.reduced() ? 60 : 650);
  }
  window.replayA = function () { show('3', true); };
  window.repeatA = function () { show('4', false); };
  window.__A = { ctx: ctx, model: model, hov: hov, slip: slip, live: live };
})();
