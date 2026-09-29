/* 10a · the phone's camera. A 4:3 desk in a 390x844 portrait frame is a thin strip, so on narrow
   screens the drawing is shot like a short film: an establishing shot while the table is drawn,
   a dolly in to the laptop as the hand moves to it, a pan that follows the hand across the desk,
   then a pull back that lands exactly on the home layout. Cause: the viewer's eye follows the pen.
   Position and zoom ride a critically damped spring (mass, no overshoot), precomputed from the
   stroke schedule so any playhead time t renders the same frame. */
(function () {
  var STEP = 5;

  // shots: [start time, zoom (x landing scale), centre x, centre y in desk image px]
  function shots(art) {
    var o = art.objs, s0 = function (id) { return o[id].strokes.length ? o[id].strokes[0].t : 0; };
    return [
      [0, 1.04, 724, 680],                       // establishing: the whole table, floating mid-frame
      [s0('laptop') - 40, 2.25, 512, 640],       // dolly in: laptop, mug, book
      [s0('portrait') - 30, 2.25, 900, 640],     // follow the hand: portrait
      [s0('plant') - 30, 2.25, 1100, 660]        // plant and camera (clamped to the desk's edge)
    ];
  }

  function make(host, art, pull) {
    host.style.transform = '';
    var r = host.getBoundingClientRect(), s0 = r.width / 1448, W = innerWidth, H = innerHeight;
    var list = shots(art);
    function target(t) {
      var k = list[0];
      for (var i = 0; i < list.length; i++) if (t >= list[i][0]) k = list[i];
      var z = k[1], half = W / 2 / (s0 * z);
      return [z, half * 2 >= 1448 ? 724 : Math.max(half, Math.min(1448 - half, k[2])), k[3]];
    }
    // critically damped spring toward the current shot, integrated in fixed steps
    var w = 9, st = target(0).slice(), vel = [0, 0, 0], track = [];
    for (var t = 0; t <= pull[0]; t += STEP) {
      var g = target(t), dt = STEP / 1000;
      for (var j = 0; j < 3; j++) {
        var a = w * w * (g[j] - st[j]) - 2 * w * vel[j];
        vel[j] += a * dt; st[j] += vel[j] * dt;
      }
      track.push(st.slice());
    }
    function xf(z, cx, cy) {
      return { z: z, x: W / 2 - r.left - z * cx * s0, y: H * .45 - r.top - z * cy * s0 };
    }
    var end = track[track.length - 1], from = xf(end[0], end[1], end[2]);
    return {
      // returns { z, x, y } (translate px, scale) or null at the landing
      at: function (t) {
        if (t >= pull[1]) return null;
        if (t <= pull[0]) { var p = track[Math.max(0, Math.min(track.length - 1, Math.round(t / STEP)))]; return xf(p[0], p[1], p[2]); }
        var u = (t - pull[0]) / (pull[1] - pull[0]);
        u = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;   // the pull back: ease in, ease out
        return { z: from.z + (1 - from.z) * u, x: from.x * (1 - u), y: from.y * (1 - u) };
      },
      landingWidth: r.width
    };
  }

  window.Cam10a = { make: make };
})();
