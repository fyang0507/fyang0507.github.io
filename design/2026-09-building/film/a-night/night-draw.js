/* a-night/night-draw.js — the things on the line, drawn: the rope, a peg, a print, its tag, the clock, the lockup.
   Everything is drawn in world px through the camera (NIGHT.cam), except the pen's width, which stays the same on
   screen whatever the zoom: one pen for the whole sheet (the guide's "the stroke does not scale with subject size"). */
(function () {
  'use strict';
  var F = FILM, C = F.C;
  var N = window.NIGHT = { cam: { x: 0, y: 0, s: 1 }, PEN: 2.6 };

  N.toScreen = function (x, y) { var c = N.cam; return [(x - c.x) * c.s + 960, (y - c.y) * c.s + 540]; };
  N.world = function (ctx) { var c = N.cam; ctx.setTransform(c.s, 0, 0, c.s, 960 - c.x * c.s, 540 - c.y * c.s); };
  N.screen = function (ctx) { ctx.setTransform(1, 0, 0, 1, 0, 0); };
  N.penW = function (k) { return (k || 1) * N.PEN / N.cam.s; };

  // ---- the rope: a resting sag between far posts, dipped at each peg by what it carries
  N.ropeY = function (x, dips) {
    var y = 210 + 0.000012 * Math.pow(x - 1900, 2);
    for (var i = 0; i < dips.length; i++) { var u = (x - dips[i][0]) / 330; y += dips[i][1] / (1 + u * u); }
    return y;
  };
  N.rope = function (ctx, dips, x0, x1, seed) {
    var r = F.rng(seed || 'rope'), pts = [];
    for (var x = x0; x <= x1; x += 40) pts.push([x, N.ropeY(x, dips) + (r() - .5) * .8]);
    ctx.save(); ctx.lineWidth = N.penW(); ctx.strokeStyle = C.ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(new Path2D(Pen.smooth(pts))); ctx.restore();
  };

  // ---- a clothes peg, side on: two levers and the coil. pose 0 closed, 1 half, 2 open (held poses, never tweened)
  N.peg = function (ctx, x, y, pose, seed) {
    var r = F.rng(seed), open = [0, 5, 11][pose] * Math.PI / 180, L = 92, top = y - 34;
    ctx.save(); ctx.translate(x, top); ctx.lineWidth = N.penW(); ctx.strokeStyle = C.ink; ctx.fillStyle = C.page; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    function lever(side) {
      ctx.save(); ctx.translate(0, 40); ctx.rotate(side * open); ctx.translate(0, -40);
      var w = 9, x0 = side < 0 ? -w - .6 : .6, x1 = x0 + w, j = (r() - .5) * .6;
      var d = 'M' + (x0 + j) + ' 2 Q' + (x0 + w / 2) + ' -1.5 ' + (x1 + j) + ' 2 L' + (x1 - side * 1.2) + ' ' + (L - 6) + ' Q' + (x0 + w / 2) + ' ' + (L + 1.5) + ' ' + (x0 + side * 1.2) + ' ' + (L - 6) + ' Z';
      var p = new Path2D(d); ctx.fill(p); ctx.stroke(p);
      ctx.beginPath(); ctx.moveTo(x0 + w / 2, 58); ctx.lineTo(x0 + w / 2 + side * .8, 70); ctx.stroke(); // the jaw's groove
      ctx.restore();
    }
    lever(-1); lever(1);
    // the coil, one loop across both levers
    ctx.beginPath(); ctx.ellipse(0, 40, 13.5, 6.5, 0, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-13, 40); ctx.quadraticCurveTo(0, 45, 13, 40); ctx.stroke();
    ctx.restore();
  };

  // ---- the site's develop, as its CSS keyframes (lib/gallery/develop.js): the chemical clears, the image warms to full
  var IMG = [[0, .5, .2, .26, 1.34, 38], [.3, .55, .32, .5, 1.2, 22], [.64, .4, .72, .8, 1.07, -5], [1, 0, 1, 1, 1, 0]];
  var CHEM = [[0, 1], [.2, .8], [.48, .32], [.8, .06], [1, 0]];
  function key(tab, p) {
    for (var i = 1; i < tab.length; i++) if (p <= tab[i][0]) { var a = tab[i - 1], b = tab[i], k = (p - a[0]) / (b[0] - a[0]); return a.map(function (v, j) { return v + (b[j] - v) * k; }); }
    return tab[tab.length - 1];
  }
  N.develop = function (p) {
    p = F.clamp(p); var f = key(IMG, p), c = key(CHEM, p)[1];
    return { filter: 'sepia(' + f[1] + ') saturate(' + f[2] + ') contrast(' + f[3] + ') brightness(' + f[4] + ') hue-rotate(' + f[5] + 'deg)', chem: c };
  };

  // ---- a print: border, the capture, the margin with its caption. Drawn with its top-centre at the origin.
  N.PW = 640; N.PI = 400; N.PB = 18; N.PM = 70;
  N.PH = N.PB + N.PI + N.PM;
  N.print = function (ctx, o) {
    var w = N.PW + 2 * N.PB, h = N.PH, x = -w / 2;
    ctx.save();
    // contact tone: where this print lies on the one behind, a short run of countable dots, never a shadow
    if (o.contact) {
      ctx.fillStyle = C.ink; ctx.globalAlpha = .5 * o.contact;
      for (var yy = 14; yy < h - 6; yy += 9) for (var k = 0; k < 3; k++) { var rr = (1.5 - k * .45); if (rr > .2) { ctx.beginPath(); ctx.arc(x - 5 - k * 7, yy + (k % 2) * 4.5, rr, 0, 7); ctx.fill(); } }
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = o.old ? '#F6F0E2' : C.slip; ctx.fillRect(x, 0, w, h);
    ctx.lineWidth = N.penW(.55); ctx.strokeStyle = C.lineStrong; ctx.strokeRect(x, 0, w, h);
    var ix = x + N.PB, iy = N.PB;
    if (o.img) {
      var d = o.dev == null ? { filter: 'none', chem: 0 } : N.develop(o.dev);
      if (d.chem < 1) { ctx.filter = d.filter; ctx.drawImage(o.img, ix, iy, N.PW, N.PI); ctx.filter = 'none'; }
      if (d.chem > 0) { ctx.globalAlpha = d.chem; ctx.fillStyle = C.chem; ctx.fillRect(ix, iy, N.PW, N.PI); ctx.globalAlpha = 1; }
      if (o.old) { ctx.globalAlpha = .1; ctx.fillStyle = '#E9DFC5'; ctx.fillRect(ix, iy, N.PW, N.PI); ctx.globalAlpha = 1; }
    }
    ctx.lineWidth = N.penW(.4); ctx.strokeStyle = C.line; ctx.strokeRect(ix, iy, N.PW, N.PI);
    // the caption, written in on the hand's clock: the number and title, then under it "reviewed" and the merge time
    var by = iy + N.PI + 33, by2 = by + 27, col = o.old ? C.pencil : C.ink;
    if (o.capP > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(ix - 2, iy + N.PI + 4, (N.PW + 4) * F.clamp(o.capP), N.PM); ctx.clip();
      F.text(ctx, o.no, ix, by, '500 16px "IBM Plex Mono"', col);
      F.text(ctx, o.title, ix + 56, by, 'italic 400 21px Fraunces, "Noto Serif SC"', col);
      if (!o.old) F.text(ctx, 'REVIEWED', ix + 56, by2, '500 13px "IBM Plex Mono"', C.pencil, { spacing: 1.4 });
      ctx.font = '500 16px "IBM Plex Mono"'; var tw = ctx.measureText(o.time).width, ty = o.old ? by : by2;
      if (o.band > 0) { // the wheat band: the latest merge
        ctx.fillStyle = C.hl; ctx.globalAlpha = o.band; ctx.fillRect(ix + N.PW - tw - 6, ty - 16, (tw + 10), 22); ctx.globalAlpha = 1;
        ctx.fillStyle = C.hlInk; ctx.fillRect(ix + N.PW - tw - 6, ty + 5, (tw + 10) * o.band, 1.6);
      }
      F.text(ctx, o.time, ix + N.PW + 2, ty, '500 16px "IBM Plex Mono"', col, { align: 'right' });
      ctx.restore();
    }
    if (o.tick > 0) { // reviewed: the pen's tick after the word
      ctx.save(); ctx.translate(ix + 56 + 84, by2 - 15); F.stroke(ctx, Pen.tick(15, o.no + 'tick'), o.tick, { w: N.penW(.85), color: C.ink }); ctx.restore();
    }
    ctx.restore();
  };

  // ---- a laundry tag on a thread: the agent that made it
  N.tag = function (ctx, name, ang, seed) {
    ctx.save(); ctx.rotate(ang);
    ctx.lineWidth = N.penW(.6); ctx.strokeStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(2, 22, 0, 40); ctx.stroke();
    ctx.font = '500 16px "IBM Plex Mono"'; var w = ctx.measureText(name).width + 30, h = 34;
    ctx.translate(0, 40); ctx.rotate(-.04);
    var p = new Path2D('M' + (-w / 2) + ' 8 L-8 0 L8 0 L' + (w / 2) + ' 8 L' + (w / 2) + ' ' + h + ' L' + (-w / 2) + ' ' + h + ' Z');
    ctx.fillStyle = '#EAD9B8'; ctx.fill(p); ctx.lineWidth = N.penW(.55); ctx.strokeStyle = C.kraftDeep; ctx.stroke(p);
    ctx.beginPath(); ctx.arc(0, 6, 2.6, 0, 7); ctx.fillStyle = C.paper; ctx.fill(); ctx.stroke();
    F.text(ctx, name, 0, 27, '500 16px "IBM Plex Mono"', C.ink, { align: 'center' });
    ctx.restore();
  };

  // ---- the lockup: the written motto (the site's own stroke paths, in writing order) and the two seals
  N.lockup = null;
  N.loadLockup = function (svgText) {
    var doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    var tag = [].map.call(doc.querySelectorAll('.site-identity-tag > g'), function (g) { return [].map.call(g.querySelectorAll('path'), function (p) { return p.getAttribute('d'); }); });
    var seals = [].map.call(doc.querySelectorAll('.site-identity-seal'), function (g) {
      var s = new XMLSerializer().serializeToString(g).replace(/class="seal-body"/g, 'fill="' + C.mark + '"')
        .replace(/class="seal-cut"/g, 'fill="none" stroke="' + C.paper + '" stroke-linecap="square" stroke-linejoin="miter"')
        .replace(/class="seal-line"/g, 'fill="none" stroke="' + C.mark + '" stroke-linecap="square" stroke-linejoin="miter"');
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 68" width="1680" height="680">' + s + '</svg>';
    });
    return Promise.all(seals.map(function (s) { return F.img('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s)); })).then(function (imgs) { N.lockup = { tag: tag, seals: imgs }; });
  };
  // p: how much of the motto is written (0..1); stamps: [0|1, 0|1]; at x,y, scale k (lockup units → px)
  N.drawLockup = function (ctx, x, y, k, p, stamps) {
    var L = N.lockup; if (!L) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    var all = []; L.tag.forEach(function (g) { all = all.concat(g); });
    F.strokes(ctx, all, p, { w: 3.1 / k, color: C.ink, gap: 3 });
    // a stamp is there at once; for two frames the paper is still pressed under it (held poses)
    stamps.forEach(function (age, i) {
      if (age < 0) return; var c = [[33, 34], [97, 44]][i], s = age < 2 / 60 ? 1.035 : 1;
      ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(s, s); ctx.translate(-c[0], -c[1]); ctx.drawImage(L.seals[i], 0, 0, 168, 68); ctx.restore();
    });
    ctx.restore();
  };
})();
