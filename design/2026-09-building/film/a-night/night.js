/* a-night/night.js — style test A, 「一夜 · 众手」 One night, many hands. 12 s.

   The line already holds round one's prints (#17, merged 12:59). Through the night each merged PR is pegged over the
   print it replaced, at its real merge time (EDT, from GitHub), tagged with the agent that made it, ticked when its
   review passed, and it develops the way the Gallery's prints develop. Then the camera pulls back, the pen writes the
   motto and the seals are stamped.

   Beat grid: 72 BPM (b = 0.8333 s). Bites land on beats 2, 5 and 8; the pull-out on 10; the pen on 11; the stamps on 13.
   The paper (prints, rope, camera) is on the physics clock; the peg's jaws, the pen and the clock's digits on the
   hand's clock (held poses). */
(function () {
  'use strict';
  var F = FILM, N = NIGHT, C = F.C, B = 60 / 72;
  var img = {};
  // The night, as it happened (merge times from `gh pr list`, in Fred's EDT).
  var PEGS = [
    { x: 700, old: 'r1-writing', neu: 'main-writing', no: '#22', title: 'Writing: a CN/EN switch, and the English titles are back', time: '21:46', day: '29 SEP', bite: 2 * B },
    { x: 1650, old: 'r1-building', neu: 'main-dossier', no: '#28', title: 'Building: every card gets its dossier', time: '01:09', day: '30 SEP', agent: 'building-1b', bite: 5 * B },
    { x: 2600, old: 'r1-principles', neu: 'main-principles-read', no: '#32', title: 'Fred Agent: the five chapters, in the dossier', time: '04:20', day: '30 SEP', agent: 'building-2', bite: 8 * B },
    { x: 3550, old: 'r1-system', no: '#17', title: 'round one', time: '12:59' },
    { x: 4500, old: 'r1-home', no: '#17', title: 'round one', time: '12:59' },
    { x: -250, old: 'r1-home', no: '#17', title: 'round one', time: '12:59' }
  ];
  PEGS.forEach(function (p) { if (!p.neu) return; p.drop = p.bite - B * .9; p.dev = p.bite + .12; });

  // ---- camera keys: [t, x, y, s], eased between (a camera has mass: no overshoot)
  var Z = 1.2, CY = 500;
  var CAM = [[0, 640, CY, Z * 1.04], [3.1, 700, CY, Z], [4.35, 1650, CY, Z], [5.6, 1650, CY, Z], [6.85, 2600, CY, Z], [8.25, 2600, CY, Z], [9.7, 1760, 850, .56], [12, 1745, 850, .555]];
  function cam(t) {
    for (var i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) {
      var a = CAM[i - 1], b = CAM[i], k = F.ease.inOut(F.seg(t, a[0], b[0]));
      if (i === CAM.length - 1) k = F.seg(t, a[0], b[0]);
      // zoom in log space, so the pull-out reads as one even move
      return { x: F.lerp(a[1], b[1], k), y: F.lerp(a[2], b[2], k), s: Math.exp(F.lerp(Math.log(a[3]), Math.log(b[3]), k)) };
    }
    var l = CAM[CAM.length - 1]; return { x: l[1], y: l[2], s: l[3] };
  }

  // ---- the clock: rolls through the minutes between merges on the hand's clock, one tick per held step
  var ROLL = [[0, 21 * 60 + 40], [2 * B - .05, 21 * 60 + 40], [2 * B + .05, 21 * 60 + 46], [3.3, 21 * 60 + 46], [4.4, 25 * 60 + 9], [5.8, 25 * 60 + 9], [6.9, 28 * 60 + 20]];
  var ROLL_STEPS = 11;
  function clockMin(t) {
    for (var i = 1; i < ROLL.length; i++) if (t <= ROLL[i][0]) {
      var a = ROLL[i - 1], b = ROLL[i];
      if (b[1] === a[1]) return a[1];
      var k = F.seg(t, a[0], b[0]), steps = b[1] - a[1] < 10 ? 1 : ROLL_STEPS; k = Math.floor(F.ease.inOut(k) * steps + 1e-6) / steps;
      return Math.round(F.lerp(a[1], b[1], k));
    }
    return ROLL[ROLL.length - 1][1];
  }
  function hhmm(m) { var h = Math.floor(m / 60) % 24, mm = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; }

  // ---- cues for the score: every visible action, on the same clock as the picture
  var cues = [];
  PEGS.forEach(function (p, i) {
    if (!p.neu) return;
    cues.push({ t: p.drop, type: 'slide', dur: p.bite - p.drop, i: i }, { t: p.bite - .26, type: 'open', i: i }, { t: p.bite, type: 'bite', i: i },
      { t: p.bite + .5, type: 'tick', i: i }, { t: p.dev, type: 'develop', dur: 1.7, i: i });
  });
  (function () { // one tick per clock step
    var last = clockMin(0);
    for (var f = 1; f < 12 * 60; f++) { var t = f / 60, m = clockMin(t); if (m !== last) { cues.push({ t: t, type: 'digit' }); last = m; } }
  })();
  var PEN0 = 11.5 * B, PEN1 = 12.6 * B + .25, STAMP = [13 * B, 13 * B + .42];
  cues.push({ t: 8.25, type: 'pullout', dur: 1.45 }, { t: PEN0, type: 'motto', dur: PEN1 - PEN0 }, { t: STAMP[0], type: 'stamp', k: 1 }, { t: STAMP[1], type: 'stamp', k: .6 });

  var cv = document.getElementById('c'), ctx = cv.getContext('2d');

  function dips(t) {
    return PEGS.map(function (p) {
      var w = p.neu ? 14 + 16 * F.spring(t - p.bite, 1.5, .42) : 14;
      return [p.x, w];
    });
  }

  function drawPeg(t, p, D) {
    var y = N.ropeY(p.x, D), hy = y + 30;
    // the old print: hangs still; a knock when the new one is pushed in beside it
    var knock = p.neu ? F.swing(t - p.bite, 1.4, 1.05, .16) : 0;
    ctx.save(); ctx.translate(p.x - 26, hy); ctx.rotate((-2.4 + knock) * Math.PI / 180);
    N.print(ctx, { img: img[p.old], old: true, no: p.no && p.neu ? '#17' : p.no, title: 'round one', time: '12:59', capP: 1 });
    ctx.restore();
    // the new print: slides down into the open peg, then swings once it's bitten
    if (p.neu && t > p.drop) {
      var k = F.ease.site(F.seg(t, p.drop, p.bite)), dy = (1 - k) * -760;
      var sw = F.swing(t - p.bite, 3.2, .95, .17), ang = (1.1 + sw) * Math.PI / 180;
      ctx.save(); ctx.translate(p.x + 6, hy + dy); ctx.rotate(ang);
      var latest = PEGS.filter(function (q) { return q.neu && t >= q.bite; }).pop();
      N.print(ctx, { img: img[p.neu], no: p.no, title: p.title, time: p.time, dev: (t - p.dev) / 1.7, capP: F.held(F.seg(t, p.bite + .15, p.bite + .75), 12) / 1 * 1,
        tick: F.held(F.seg(t, p.bite + .5, p.bite + .72), 12), band: latest === p ? F.ease.out(F.seg(t, p.bite + .8, p.bite + 1.1)) : 0, contact: 1 });
      // the agent's tag, tied through the print's corner; it hangs plumb and swings a little faster than the paper
      if (p.agent) {
        var ta = F.swing(t - p.bite, 7, 1.5, .18) * Math.PI / 180;
        ctx.save(); ctx.translate(N.PW / 2 + N.PB - 34, N.PH - 8); N.tag(ctx, p.agent, ta - ang, p.agent); ctx.restore();
      }
      ctx.restore();
    }
    // the peg: open before the bite, half, then shut (held poses)
    var pose = 0;
    if (p.neu) { if (t >= p.bite - .26 && t < p.bite) pose = 2; else if (t >= p.bite && t < p.bite + 1 / 12) pose = 1; }
    N.peg(ctx, p.x, y, pose, 'peg' + p.x);
  }

  function render(t) {
    var c = cam(t), shake = 0;
    STAMP.forEach(function (s, i) { var d = t - s; if (d >= 0 && d < 3 / 60) shake = [2.2, 1.1, .4][Math.floor(d * 60)] * (i ? .6 : 1); });
    N.cam.x = c.x; N.cam.y = c.y - shake / c.s; N.cam.s = c.s;
    N.screen(ctx); ctx.fillStyle = C.paper; ctx.fillRect(0, 0, 1920, 1080);
    N.world(ctx);
    var D = dips(t);
    N.rope(ctx, D, -1500, 5400, 'the line');
    PEGS.slice().sort(function (a, b) { return a.x - b.x; }).forEach(function (p) { drawPeg(t, p, D); });

    N.screen(ctx);
    // the slug and the clock, on the frame, not the paper
    var ui = 1 - F.ease.inOut(F.seg(t, 8.3, 9.2));
    ctx.save(); ctx.globalAlpha = ui;
    F.text(ctx, 'ROUND TWO · THE NIGHT OF 29 → 30 SEP 2026', 72, 74, '500 15px "IBM Plex Mono"', C.pencil, { spacing: 1.2 });
    var m = clockMin(t);
    F.text(ctx, 'MERGED · 合并', 1848, 58, '500 14px "IBM Plex Mono", "Noto Serif SC"', C.pencil, { align: 'right', spacing: 1.2 });
    F.text(ctx, hhmm(m), 1848, 112, '500 50px "IBM Plex Mono"', C.ink, { align: 'right' });
    F.text(ctx, m >= 24 * 60 ? '30 SEP' : '29 SEP', 1848, 140, '500 14px "IBM Plex Mono"', C.pencil, { align: 'right', spacing: 1.2 });
    ctx.restore();

    // the end: the motto written by the pen, the two seals stamped, the line of the night above it
    if (t > PEN0 - .01) {
      var p = F.clamp((t - PEN0) / (PEN1 - PEN0));
      N.drawLockup(ctx, 960 - 3.9 * 84, 668, 3.9, p, [t - STAMP[0], t - STAMP[1]]);
      var cap = F.ease.out(F.seg(t, STAMP[1] + .25, STAMP[1] + .6));
      if (cap > 0) F.text(ctx, '17 PRs · one night · many hands · reviewed one by one', 960, 1000, '500 15px "IBM Plex Mono"', C.pencil, { align: 'center', spacing: 1.2, alpha: cap });
    }
  }

  F.film({
    dur: 12, cues: cues,
    setup: function () {
      var names = {}; PEGS.forEach(function (p) { names[p.old] = 1; if (p.neu) names[p.neu] = 1; });
      var lock = fetch('lockup.svg').then(function (r) { return r.text(); }).then(N.loadLockup).then(function () {
        // one pen cue per stroke of the motto, timed exactly as F.strokes writes them
        var all = []; N.lockup.tag.forEach(function (g) { all = all.concat(g); });
        var L = all.map(F.len), total = L.reduce(function (a, b) { return a + b + 3; }, 0), at = 0;
        all.forEach(function (d, i) { cues.push({ t: PEN0 + at / total * (PEN1 - PEN0), type: 'stroke', dur: L[i] / total * (PEN1 - PEN0), len: L[i] }); at += L[i] + 3; });
      });
      return Promise.all([F.siteFonts('../'), lock]
        .concat(Object.keys(names).map(function (n) { return F.img('../captures/' + n + '.jpg').then(function (i) { img[n] = i; }); })));
    },
    render: render
  });
})();
