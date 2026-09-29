/* r3-02-lab.js — the legend, the marks in the rule table, the stroke's key-pose sheet, and the scrub.
   All of it is the same TierMark / FocusMark / PointMark code the slices use, frozen at chosen poses. */
(function () {
  var A = R2Anim, E = A.EASE;

  /* ---- legend (slice 1) and rule-table marks: each shows its state at rest; click replays it ---- */
  var legend = [];
  function legendMark(el, kind) {
    var m = { el: el, kind: kind };
    if (kind === '1' || kind === '2') { m.t = new TierMark(el, el, { gap: 2 }); m.t.to(+kind, 'instant'); }
    else if (kind === 'p') {
      var set = el.closest('.lg-set'), host = el.parentNode;
      m.p = new PointMark(host, el, { seed: 'point|legend', scan: set,
        bounds: function () { var b = ArrowFit.rel(set.getBoundingClientRect(), host.getBoundingClientRect()); return { x: b.x + 2, y: b.y, w: b.w - 4, h: b.h }; } });
      m.p.show(true);
    } else { m.f = new FocusMark(el, el, {}); m.f.set(true, true); }
    m.replay = function () {
      if (m.t) { m.t.to(0, 'instant'); var d = m.t.to(1, 'hover'); if (kind === '2') setTimeout(function () { m.t.to(2, 'press'); }, (d + 220) / A.speed); }
      if (m.p) m.p.show();
      if (m.f) { m.f.set(false, true); requestAnimationFrame(function () { m.f.set(true); }); }
    };
    m.build = function () { if (m.p) m.p.refit(); else (m.t || m.f).build(); };
    legend.push(m);
    return m;
  }
  document.querySelectorAll('.pn-legend [data-lg]').forEach(function (b) {
    var m = legendMark(b, b.dataset.lg);
    b.addEventListener('click', m.replay);
  });
  document.querySelectorAll('[data-lgm]').forEach(function (s) { legendMark(s, s.dataset.lgm); });

  /* ---- key poses: the stroke, frame by frame, with real timings ---- */
  var sheet = document.querySelector('[data-sheet]'), frames = [];
  var WORD = '<span class="en">travel log</span> <span class="sep">·</span> <span class="zh">游记</span>';
  var POSES = [
    ['rest', '静止', 'rest'], ['notice, drawing', '划线中', 'draw'], ['notice', '留意', 'drawn'], ['click: the tip turns', '转笔', 'turn'],
    ['return stroke', '回笔', 'sweep'], ['the chisel lands', '落笔', 'land'], ['chosen', '选定', 'chosen'], ['another tag chosen', '退回', 'drain']
  ];
  function poseAt(key, m) {
    var dD = A.drawDur(m.L), dS = TierMark.sweepDur(m.w);
    switch (key) {
      case 'rest': return { v: {}, ms: '0 ms' };
      case 'draw': return { v: { E: E.pen(.42) }, ms: Math.round(dD * .42) + ' ms' };
      case 'drawn': return { v: { E: 1 }, ms: Math.round(dD) + ' ms' };
      case 'turn': return { v: { E: 1, sw: E.turn(.16) }, ms: 'click + ' + Math.round(dS * .16) };
      case 'sweep': return { v: { E: 1, sw: E.turn(.5) }, ms: 'click + ' + Math.round(dS * .5) };
      case 'land': return { v: { E: 1, sw: E.turn(.8) }, ms: 'click + ' + Math.round(dS * .8) };
      case 'chosen': return { v: { E: 1, sw: 1 }, ms: 'click + ' + Math.round(dS) };
      default: return { v: { E: 1, sw: 1, lift: 1 - E.sink(165 / 210) }, ms: 'next + 165' };
    }
  }
  if (sheet) {
    POSES.forEach(function (p, i) {
      var kf = document.createElement('div');
      kf.className = 'kf';
      kf.innerHTML = '<span class="kf-n">' + String(i + 1).padStart(2, '0') + '</span><span class="kf-w' + (i ? ' ink' : '') + '">' + WORD + '</span><div class="kf-t"><b>' + p[0] + ' · ' + p[1] + '</b><span data-ms></span></div>';
      sheet.appendChild(kf);
      var w = kf.querySelector('.kf-w'), m = new TierMark(w, w, { gap: 2, seed: 'travel log · 游记|tier' });
      frames.push({ m: m, key: p[2], ms: kf.querySelector('[data-ms]') });
    });
  }
  function drawSheet() {
    frames.forEach(function (f) { f.m.build(); var p = poseAt(f.key, f.m); f.m.pose(p.v); f.ms.textContent = p.ms; });
  }

  /* ---- the scrub: return stroke, the whole choreography ---- */
  var cmps = [];
  document.querySelectorAll('[data-cmp]').forEach(function (b) {
    var c = { el: b, m: new TierMark(b, b, { gap: 2, seed: 'stories we live|cmp' }), f: new FocusMark(b, b, {}), timers: [] };
    c.m.to(2, 'instant');
    c.play = function () {
      c.timers.forEach(clearTimeout); c.timers = [];
      c.m.to(0, 'instant');
      var d = c.m.to(1, 'hover');
      c.timers.push(setTimeout(function () { c.m.to(2, 'press'); }, (d + 320) / A.speed));
    };
    b.addEventListener('click', c.play);
    b.addEventListener('focus', function () { c.f.set(b.matches(':focus-visible')); });
    b.addEventListener('blur', function () { c.f.set(false); });
    cmps.push(c);
  });

  // 0 → 1 → 2 → 0 at the real timings: draw, pause, return stroke, hold, drain + lift.
  var scrub = document.querySelector('[data-scrub]'), pick = cmps[0];
  function scrubPose(p, m) {
    var dD = A.drawDur(m.L), dS = TierMark.sweepDur(m.w), seg = [dD, 260, dS, 420, 210 * .72 + 200], total = seg.reduce(function (a, b) { return a + b; }, 0);
    var t = p * total, v = { E: 0, S: 0, sw: 0, lift: 1 };
    function clamp(x) { return Math.max(0, Math.min(1, x)); }
    v.E = E.pen(clamp(t / dD)); t -= dD + seg[1];
    if (t > 0) v.sw = E.turn(clamp(t / dS));
    t -= seg[2] + seg[3];
    if (t > 0) {
      v.lift = 1 - E.sink(clamp(t / 210));
      v.S = E.lift(clamp((t - 151) / 200));
      if (v.lift <= .004) { v.sw = 0; v.lift = 1; }
    }
    return v;
  }
  if (scrub && pick) scrub.addEventListener('input', function () {
    pick.timers.forEach(clearTimeout); pick.timers = [];
    pick.m.pose(scrubPose(scrub.value / 1000, pick.m));
  });

  function rebuildAll() {
    legend.forEach(function (m) { m.build(); });
    drawSheet();
    cmps.forEach(function (c) { c.m.build(); c.f.build(); });
  }
  drawSheet();
  if (document.fonts) document.fonts.ready.then(rebuildAll);
  var rw = innerWidth;
  window.addEventListener('resize', function () { if (innerWidth !== rw) { rw = innerWidth; requestAnimationFrame(rebuildAll); } });

  window.R3Lab = { frames: frames, cmps: cmps, legend: legend, scrubPose: scrubPose };
})();
