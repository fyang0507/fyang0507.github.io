/* 10 · D — a tiny integrator. Units are desk-image pixels (1448 × 1086) and seconds, so the same
   numbers hold at every viewport; gravity is converted from screen px/s² by the director.
   Body: falls under g, bounces with restitution e, squashes on a damped spring excited by impact
   speed, and — once resting on its flat bottom — rocks level on a damped angular spring.
   Mass is felt through those constants, not through g (everything falls alike). */
(function () {
  var TAU = Math.PI * 2, H = 1 / 240;

  function body(o) {
    var b = { y: 0, vy: 0, th: 0, w: 0, sq: 0, sv: 0, state: 'idle', bounces: 0,
      e: .2, sqGain: .00004, ks: 8, zs: .35, kr: 3.2, zr: .45, airDamp: .6, rockKick: 9, vRest: 180, g: 9000 };
    for (var k in o) b[k] = o[k];
    return b;
  }

  // Released from rest `h` px above its resting place, tilted th0 (deg) and spinning w0 (deg/s).
  function drop(b, h, th0, w0) {
    b.y = -h; b.vy = 0; b.th = th0; b.w = w0; b.sq = 0; b.sv = 0; b.state = 'air'; b.bounces = 0;
  }
  function fallTime(b, h) { return Math.sqrt(2 * h / b.g); }

  function step(b, dt) {
    if (b.state === 'idle') return;
    var n = Math.max(1, Math.ceil(dt / H)), h = dt / n;
    for (var i = 0; i < n; i++) {
      if (b.state === 'air') {
        b.vy += b.g * h; b.y += b.vy * h;
        b.th += b.w * h; b.w *= Math.exp(-b.airDamp * h);
        if (b.y >= 0) {
          var v = b.vy; b.y = 0;
          b.sv += v * b.sqGain;                    // squash rings with the impact speed
          b.w = b.w * .25 - b.th * b.rockKick;     // the low corner hits first: tilt becomes rock
          b.vy = -v * b.e;
          if (b.onImpact) b.onImpact(b, v, b.bounces);
          b.bounces++;
          if (-b.vy < b.vRest) { b.vy = 0; b.state = 'rest'; }
        }
      } else if (b.state === 'rest') {
        var wr = TAU * b.kr;
        b.w += (-wr * wr * b.th - 2 * b.zr * wr * b.w) * h; b.th += b.w * h;
      }
      var ws = TAU * b.ks;
      b.sv += (-ws * ws * b.sq - 2 * b.zs * ws * b.sv) * h; b.sq += b.sv * h;
    }
    b.settled = b.state === 'rest' && Math.abs(b.th) < .04 && Math.abs(b.w) < 1.5 && Math.abs(b.sq) < .0015 && Math.abs(b.sv) < .03;
  }

  // Squash keeps the foot on the table: wider and shorter, pivoting on the contact line.
  function transform(b, k) {
    if (b.settled) return '';
    var sx = 1 + b.sq * .7, sy = 1 - b.sq;
    return 'translate3d(0,' + (b.y * k).toFixed(2) + 'px,0) rotate(' + b.th.toFixed(2) + 'deg) scale(' + sx.toFixed(4) + ',' + sy.toFixed(4) + ')';
  }

  // A taut elastic string, pinned at pts[0]. Cut at the far end, it contracts toward its pin
  // (rest length far shorter than the stretched length) and the free end whips and curls.
  function rope(pts, kick) {
    var p = pts.map(function (q) { return { x: q[0], y: q[1], px: q[0], py: q[1] }; });
    var L = 0;
    for (var i = 1; i < p.length; i++) L += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
    var r = { p: p, rest: L / (p.length - 1) * .34, damp: .976 };
    var e = p[p.length - 1], sub = 1 / 120;       // the free end's first velocity: the peck's flick
    e.px = e.x - kick[0] * sub; e.py = e.y - kick[1] * sub;
    return r;
  }
  function ropeStep(r, dt) {
    var n = Math.max(1, Math.round(dt * 120)), p = r.p;
    for (var s = 0; s < n; s++) {
      for (var i = 1; i < p.length; i++) {
        var q = p[i], vx = (q.x - q.px) * r.damp, vy = (q.y - q.py) * r.damp;
        q.px = q.x; q.py = q.y; q.x += vx; q.y += vy;
      }
      for (var it = 0; it < 4; it++) {
        for (var j = 1; j < p.length; j++) {
          var a = p[j - 1], b = p[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-6;
          var f = (d - r.rest) / d * .5 * .45;     // elastic, not rigid: a string, not a chain
          if (j - 1 === 0) { b.x -= dx * f * 2; b.y -= dy * f * 2; }
          else { a.x += dx * f; a.y += dy * f; b.x -= dx * f; b.y -= dy * f; }
        }
      }
    }
  }

  // Damped oscillation for the leaf: amplitude A (deg), f Hz, damping ratio z, t seconds.
  function ring(A, f, z, t) { var w = TAU * f; return A * Math.exp(-z * w * t) * Math.sin(w * Math.sqrt(1 - z * z) * t); }

  window.D10Phys = { body: body, drop: drop, fallTime: fallTime, step: step, transform: transform, rope: rope, ropeStep: ropeStep, ring: ring };
})();
