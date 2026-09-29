/* r3-08b-note.js — C's annotator's pen, arriving at A's slip. Hand's clock for the ink, physics clock for the paper.
   At rest every margin note is A's slip: a lighter sheet with hand-cut edges, a seeded tilt and a punched eyelet.
   Pointing at a ref plays C's one gesture: a corner ⌜ where the claim starts, then without lifting a ⌟ where it ends,
   a loop round the number, and an arrow flung level through the leading into the margin. The arrow replaces A's thread:
   its tip is the spot where the slip's eyelet will rest, and as the tip lands the slip is pulled there. It pivots on its
   eyelet (transform-origin), its trailing edge lags the pull, and it squares up to the text on A's spring with one
   small overshoot. Let go: the ink lifts faster than it went down and the slip drifts home to its tilt.
   First reveal: pen touches down, lifts, one stroke, the slip arrives by ~650 ms and settles by ~950. Every reveal after:
   one quick stroke and a stiffer spring, done by ~500 ms. Phone: the slip from the slot (r3-08b-slip.js).
   Reduced motion: the marks are simply there and the slip is already at the arrow's tip. Nothing travels. */
(function () {
  var ctx = RD.mount(document.getElementById('stage-n'), 'n');
  var rd = ctx.rd, model = FN.prepare(ctx), slip = FN.Slip(ctx, model), NS = FN.NS;
  rd.classList.add('ta', 'pa');                   // ta: A's slip (r2-08b-a.css) · pa: this build (r3-08b-note.css)
  var EYE = { x: 11.5, y: 14.5 }, GUT = 26;       // eyelet centre in the slip's box (its pivot) · slip lands 26px clear of the text

  ['zh', 'en'].forEach(function (l) {
    Object.keys(model[l]).forEach(function (n) {
      var note = model[l][n], r = Pen.rng('ta-tilt-' + note.key);   // A's seed, so every slip rests at A's tilt
      note.r0 = (r() - .5) * 4;
      note.inr = note.mn.querySelector('.mn-in');
      note.inr.style.transform = 'rotate(' + note.r0.toFixed(2) + 'deg)';
    });
  });

  /* ---- C's gesture, with the arrow's tip at the eyelet's resting place ---- */
  function geom(note) {
    var body = note.body, B = body.getBoundingClientRect(), m = FN.metrics(body), gh = m.fs;
    var range = FN.phrase(note.sup), rects = range ? Array.prototype.filter.call(range.getClientRects(), function (r) { return r.width > 1; }) : [];
    var ra = FN.rel(note.a.getBoundingClientRect(), B), rw = FN.rel(FN.row(note.sup), B), mr = FN.rel(note.mn.getBoundingClientRect(), B);
    var f = rects.length ? FN.rel(rects[0], B) : rw, l = rects.length ? FN.rel(rects[rects.length - 1], B) : rw;
    var r = Pen.rng('pa-g-' + note.key), jit = function (a) { return (r() - .5) * a; };
    var colR = body.clientWidth, yRun = rw.cy - gh * .5 - Math.min(6, (m.lh - m.fs) * .36);
    // the slip is pulled out across the gutter and up (or down) to the ref's leading; its eyelet ends at E
    var eye0 = { x: mr.left + EYE.x, y: mr.top + EYE.y };
    var tx = colR + GUT - mr.left, ty = Math.max(-320, Math.min(320, yRun - eye0.y)), E = { x: eye0.x + tx, y: eye0.y + ty };
    var fTop = f.cy - gh * .56, x0 = f.left - 3;
    var open = [[x0 + 10, fTop - 1.5 + jit(1)], [x0 + jit(.6), fTop], [x0 - .8, fTop + gh * .78]];
    var lBot = l.cy + gh * .5, xe = l.right + 1;
    var close = [[xe - 9, lBot + 2 + jit(1)], [xe, lBot + 1.5], [xe + 1.5, lBot - gh * .3]];
    var cx = ra.cx, cy = ra.cy, rx = ra.width / 2 + 5, ry = ra.height / 2 + 4, loop = [], a0 = 150, a1 = 655;
    for (var i = 0; i <= 24; i++) {
      var t = i / 24, a = (a0 + (a1 - a0) * t) * Math.PI / 180, grow = 1 + (t - .5) * .08;
      loop.push([cx + Math.cos(a) * rx * grow, cy + Math.sin(a) * ry * grow]);
    }
    var T = [E.x - 5.5, E.y], xs = loop[loop.length - 1][0];               // the point touches the eyelet's rim
    var shaft = [[xs + 9, yRun + 1], [xs + (colR - xs) * .5, yRun + jit(1.6)], [colR + 6, yRun + (T[1] - yRun) * .12]];
    if (Math.abs(T[1] - yRun) > 30) shaft.push([colR + 14, yRun + (T[1] - yRun) * .6]);   // only when the slip could not reach the line
    shaft.push(T);
    var pts = close.concat(loop, shaft), n1 = close.length, n2 = n1 + loop.length;
    var len = function (p) { var s = 0; for (var k = 1; k < p.length; k++) s += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]); return s; };
    var pa = shaft[shaft.length - 2], ang = Math.atan2(T[1] - pa[1], T[0] - pa[0]), hl = 9;
    var head = 'M' + (T[0] - Math.cos(ang - .5) * hl).toFixed(1) + ' ' + (T[1] - Math.sin(ang - .5) * hl).toFixed(1) + ' L' + T[0].toFixed(1) + ' ' + T[1].toFixed(1) +
      ' L' + (T[0] - Math.cos(ang + .5) * hl * .85).toFixed(1) + ' ' + (T[1] - Math.sin(ang + .5) * hl * .85).toFixed(1);
    return { tx: tx, ty: ty, open: Pen.smooth(open), main: Pen.smooth(pts), head: head,
      split: [len(pts.slice(0, n1 + 1)), len(pts.slice(n1, n2 + 1)), len(pts.slice(n2))] };
  }
  function drawMain(p, split, dur, delay) {
    var L = p.getTotalLength(), H = Pen.hiddenAt(p, L), tot = split[0] + split[1] + split[2], f1 = split[0] / tot, f2 = (split[0] + split[1]) / tot;
    p.style.strokeDasharray = Pen.dashes(p, L);
    if (Pen.reduced()) { p.style.strokeDashoffset = 0; return; }
    // the ⌟ and the loop are careful, the arrow is flung: the last part of the ink goes down in ~40% of the time
    p.animate([{ strokeDashoffset: H, offset: 0, easing: 'cubic-bezier(.5,0,.8,.6)' }, { strokeDashoffset: H * (1 - f1), offset: .15, easing: 'linear' },
      { strokeDashoffset: H * (1 - f2), offset: .6, easing: 'cubic-bezier(.25,.0,.15,1)' }, { strokeDashoffset: 0, offset: 1 }],
      { duration: dur, delay: delay, fill: 'both' });
  }

  /* ---- A's slip on the physics clock, anchored to the arrow's tip ---- */
  var live = [], raf = 0, last = 0, TS = 1;       // TS: test hook to slow the physics clock for frame captures
  function stateOf(note) { return live.filter(function (s) { return s.note === note; })[0]; }
  function start(note) {
    var full = FN.first('pa'); FN.seen('pa');
    var st = stateOf(note);
    if (!st) { st = { note: note, x: 0, vx: 0, y: 0, vy: 0, r: 0, vr: 0, z: 1, vz: 0 }; live.push(st); }
    clearInk(st);
    var g = st.g = geom(note), grp = document.createElementNS(NS, 'g');
    grp.setAttribute('class', 'pa-g'); note.body.querySelector('.fn-wire').appendChild(grp);
    var pOpen = Pen.path(g.open, { width: 1.7 }), pMain = Pen.path(g.main, { width: 1.7 }), pHead = Pen.path(g.head, { width: 1.7 });
    [pOpen, pMain, pHead].forEach(function (p) { grp.appendChild(p); var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L); });
    st.grp = grp; st.paths = [pHead, pMain, pOpen];
    var T = full ? { main: 100, dur: 430, head: 510, go: 510 } : { main: 0, dur: 250, head: 235, go: 215 };   // go: as the point lands
    Pen.draw(pOpen, { duration: full ? 90 : 110 });
    drawMain(pMain, g.split, T.dur, T.main);
    Pen.draw(pHead, { duration: full ? 70 : 50, delay: T.head });
    note.mn.classList.add('on');
    st.full = full; st.phase = 'wait'; st.goAt = performance.now() + T.go / TS;
    if (Pen.reduced()) { st.x = g.tx; st.y = g.ty; st.r = -note.r0; st.z = 1; st.phase = 'held'; render(st); return; }
    kick();
  }
  function stop(note) {
    var st = stateOf(note); if (!st) return;
    note.mn.classList.remove('on');
    var grp = st.grp; st.grp = null;
    if (grp) { st.paths.forEach(function (p) { Pen.erase(p, { duration: 140 }); }); setTimeout(function () { grp.remove(); }, Pen.reduced() ? 0 : 170); }
    if (Pen.reduced()) { finish(st); return; }
    st.phase = 'out'; kick();
  }
  function clearInk(st) { if (st.grp) { st.grp.remove(); st.grp = null; } }
  function finish(st) {
    clearInk(st);
    st.note.inr.style.transform = 'rotate(' + st.note.r0.toFixed(2) + 'deg)';
    live.splice(live.indexOf(st), 1);
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function sp(s, key, vkey, target, k, c, dt) { s[vkey] += (-k * (s[key] - target) - c * s[vkey]) * dt; s[key] += s[vkey] * dt; }
  function still(s, key, vkey, target, e) { return Math.abs(s[key] - target) < e && Math.abs(s[vkey]) < e * 8; }

  function step(st, now, dt) {
    var g = st.g, n = st.note;
    if (st.phase === 'wait') {
      if (now < st.goAt) { if (!still(st, 'x', 'vx', 0, .3) || !still(st, 'r', 'vr', 0, .05)) home(st, dt); return true; }   // re-pointed while going home
      st.phase = 'in';                            // the tip lands: the slip is jerked by its eyelet and swings about it
      st.vr += st.full ? -120 : -60; st.vz += st.full ? 1.1 : .5;
    }
    if (st.phase === 'in') {
      var kx = st.full ? [240, 22] : [520, 38], kr = st.full ? [300, 16] : [420, 30];
      for (var i = 0; i < 4; i++) {
        var d = dt / 4;
        sp(st, 'x', 'vx', g.tx, kx[0], kx[1], d);
        sp(st, 'y', 'vy', g.ty, kx[0], kx[1], d);
        var lag = Math.max(-7, Math.min(7, -st.vy * .016 + st.vx * .004));   // the trailing edge lags the pull
        sp(st, 'r', 'vr', -n.r0 + lag, kr[0], kr[1], d);                        // and squares up to the text
        sp(st, 'z', 'vz', 1.035, 260, 22, d);                                    // held off the page while the arrow holds it
      }
      render(st);
      return !(still(st, 'x', 'vx', g.tx, .3) && still(st, 'y', 'vy', g.ty, .3) && still(st, 'r', 'vr', -n.r0, .05) && still(st, 'z', 'vz', 1.035, .002));
    }
    if (st.phase === 'out') {                     // released: it drifts home to its tilt
      home(st, dt);
      if (still(st, 'x', 'vx', 0, .3) && still(st, 'y', 'vy', 0, .3) && still(st, 'r', 'vr', 0, .05)) { finish(st); return false; }
      return true;
    }
    return false;
  }
  function home(st, dt) {
    for (var j = 0; j < 4; j++) {
      var e = dt / 4;
      sp(st, 'x', 'vx', 0, 150, 17, e); sp(st, 'y', 'vy', 0, 150, 17, e);
      sp(st, 'r', 'vr', Math.max(-5, Math.min(5, st.vy * .01)), 200, 20, e); sp(st, 'z', 'vz', 1, 200, 24, e);
    }
    render(st);
  }
  function render(st) {
    var n = st.note;
    n.inr.style.transform = 'translate(' + st.x.toFixed(2) + 'px,' + st.y.toFixed(2) + 'px) rotate(' + (n.r0 + st.r).toFixed(2) + 'deg) scale(' + st.z.toFixed(4) + ')';
  }
  function frame() {
    raf = 0;
    var now = performance.now();                  // the same clock as goAt (a rAF timestamp can run on a scaled animation clock)
    var dt = Math.min(.032, (now - last) / 1000) * TS; last = now;
    var busy = false;
    live.slice().forEach(function (st) { if (step(st, now, dt)) busy = true; });
    if (busy) raf = requestAnimationFrame(frame);
  }

  var hov = FN.hover(ctx, model, { on: start, off: stop, tap: slip.open });
  ctx.onLayout(function () { live.slice().forEach(finish); });
  document.addEventListener('mock:rm', function () { hov.off(true); live.slice().forEach(finish); });

  function show(n, first) {
    FN.seen('pa', !first);
    hov.off(true);
    var note = model.get(n);
    ctx.stage.scrollIntoView({ block: 'center', behavior: Pen.reduced() ? 'auto' : 'smooth' });   // the replay button sits under the stage
    ctx.scrollTo(ctx.top(note.a) - rd.clientHeight * .42);
    setTimeout(function () { if (FN.marginShown(note)) hov.on(note); else slip.open(note); }, Pen.reduced() ? 60 : 650);
  }
  window.replayN = function () { show('3', true); };
  window.repeatN = function () { show('4', false); };
  window.__N = { ctx: ctx, model: model, hov: hov, slip: slip, live: live, timeScale: function (k) { TS = k; } };
})();
