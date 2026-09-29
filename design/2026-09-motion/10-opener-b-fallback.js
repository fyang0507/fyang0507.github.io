/* 10 · B — Canvas2D fallback when WebGL is unavailable. Same interface as OBGL and the same
   precomputed arrival map, so the fronts, rhythm and wicking are identical; what it drops is the
   per-pixel paper physics (fibres, granulation, wet rim, colour halos). Each frame it writes two
   map-resolution masks (reveal, wash) and lets drawImage upscale them bilinearly. ~2 ms / frame. */
(function () {
  function ss(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  function create(cv) {
    var g = cv.getContext('2d');
    var api = { kind: 'canvas2d', setMap: noop, setDesk: noop, draw: noop, destroy: noop };
    if (!g) return api;
    var mw = 0, mh = 0, T = null, G = null, desk = null;
    var mask = document.createElement('canvas'), wash = document.createElement('canvas');
    var layer = document.createElement('canvas');
    var mi, wi;
    api.setMap = function (img) {
      mw = img.naturalWidth; mh = img.naturalHeight;
      var c = document.createElement('canvas'); c.width = mw; c.height = mh;
      var x = c.getContext('2d'); x.drawImage(img, 0, 0);
      var d = x.getImageData(0, 0, mw, mh).data;
      T = new Float32Array(mw * mh); G = new Float32Array(mw * mh);
      for (var i = 0; i < mw * mh; i++) {
        var v = d[i * 4] * 256 + d[i * 4 + 1];
        T[i] = v >= 65535 ? 6 : v / 65504 * 2.4;
        G[i] = d[i * 4 + 2] ? (d[i * 4 + 2] - 1) / 254 : -1;
      }
      mask.width = wash.width = mw; mask.height = wash.height = mh;
      mi = mask.getContext('2d').createImageData(mw, mh);
      wi = wash.getContext('2d').createImageData(mw, mh);
    };
    api.setDesk = function (c) { desk = c; };
    api.draw = function (u) {
      g.clearRect(0, 0, cv.width, cv.height);
      var t = u.t, E = Math.max(ss(u.dry[2] - .28, u.dry[2], t), u.skip), R = u.rect;
      var k = R[2] / 1448, mx = R[0] - 160 * k, my = R[1] - 160 * k, W = mw * 4 * k, H = mh * 4 * k;
      if (T) {
        var m = mi.data, w = wi.data, ret = u.mode > .5, d0 = u.drops[0];
        for (var i = 0; i < mw * mh; i++) {
          var Ti = T[i], Gi = G[i];
          if (ret) {                                  // returning: one centred drop, radial
            var px = (i % mw) * 4 - 160 - d0[0], py = Math.floor(i / mw) * 4 - 160 - d0[1];
            var dn = Math.hypot(px / 820, py / 650); Ti = d0[2] + .2 * dn * dn; Gi = dn < .95 ? 1 - dn / .95 : -1;
          }
          var rv = ss(0, .06, t - Ti);
          m[i * 4 + 3] = Math.max(rv, E) * 255;
          var a = 0;
          if (Gi >= 0 && rv > 0) {
            var dryT = u.dry[0] + u.dry[1] * Math.pow(Gi, .75), wet = rv * (1 - ss(dryT, dryT + .2, t));
            a = wet * (.08 + .16 * Math.pow(Gi, 1.4) + (Gi < .05 ? .25 : 0)) * (1 - E);
          }
          w[i * 4] = 51; w[i * 4 + 1] = 45; w[i * 4 + 2] = 39; w[i * 4 + 3] = a * 255;
        }
        mask.getContext('2d').putImageData(mi, 0, 0);
        wash.getContext('2d').putImageData(wi, 0, 0);
      }
      if (desk && u.tex > 0) {
        if (layer.width !== cv.width || layer.height !== cv.height) { layer.width = cv.width; layer.height = cv.height; }
        var l = layer.getContext('2d');
        l.globalCompositeOperation = 'source-over'; l.clearRect(0, 0, layer.width, layer.height);
        l.globalAlpha = u.tex; l.drawImage(desk, R[0], R[1], R[2], R[3]); l.globalAlpha = 1;
        if (T && E < 1) { l.globalCompositeOperation = 'destination-in'; l.drawImage(mask, mx, my, W, H); }
        g.drawImage(layer, 0, 0);
      }
      if (T) g.drawImage(wash, mx, my, W, H);
      g.fillStyle = 'rgb(51,45,39)';
      u.drops.forEach(function (dr) {                 // impact blots, fading as the bloom takes over
        var s = t - dr[2]; if (s < 0 || s > 1.2) return;
        g.globalAlpha = .9 * Math.exp(-s / .3) * (1 - E);
        g.beginPath(); g.arc(R[0] + dr[0] * k, R[1] + dr[1] * R[3] / 1086, dr[3] * k * (1.2 + .9 * Math.sqrt(s)), 0, 6.2832); g.fill();
      });
      g.globalAlpha = 1;
    };
    api.destroy = function () { cv.width = cv.height = 0; };
    return api;
  }
  function noop() {}

  window.OBFallback = { create: create };
})();
