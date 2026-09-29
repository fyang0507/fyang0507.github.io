/* r2-01 · the desk, taken apart. Home is the real scene (index.html hotspot geometry), but split into the
   layers that have to move separately when the desk turns into the nav (cutouts from tools/r2-01-cut.py):
   the table (with its front edge redrawn as a vector), the three props that are not doors (mug, plant,
   bird), and the four door objects, which live in the overlay as twins (see fly) at rest as well as in
   flight. All geometry is in scene-image pixels (1448 × 1086). */
(function () {
  var SW = 1448, SH = 1086;

  // frame = the element box; drawn = the ink bbox the carry is anchored on (bottom-centre).
  // hole/canvas = candidate B's window: the surface that shows the destination.
  var OBJ = {
    building: { kind: 'cut', src: 'r2-01-cut-laptop.png', hole: 'r2-01-hole-laptop.png', frame: [284, 261, 456, 336], drawn: [284, 261, 456, 336], hot: [20, 23, 31, 32],
      canvas: [[341, 278], [699, 278], [699, 483], [341, 483]] },
    writing: { kind: 'book', frame: [521.9, 667.9, 309, 237.4], drawn: [527.3, 740.8, 298.3, 159.2], hot: [36, 62, 21, 22],
      canvas: [[560.7, 756.8], [677.1, 752.8], [794.8, 758.9], [806.2, 879.2], [677.1, 891.3], [548.7, 880.6]] },
    about: { kind: 'frame', frame: [799.7, 358.7, 225, 210.8], drawn: [827.5, 362.4, 169.8, 188.5], hot: [56.5, 33, 12.5, 19],
      canvas: [[855.2, 377], [969.9, 381.4], [960.4, 531.1], [844.3, 525.6]] },
    shooting: { kind: 'cut', src: 'r2-01-cut-camera.png', hole: 'r2-01-hole-camera.png', frame: [992, 691, 252, 177], drawn: [992, 691, 252, 177], hot: [68.5, 63, 18, 18],
      circle: [1120, 811, 30] }
  };
  // the props: not doors, so they have nowhere to go when the table leaves
  var PROPS = {
    mug: { src: 'r2-01-cut-mug.png', frame: [355, 610, 153, 146], spin: -38 },
    plant: { src: 'r2-01-cut-plant.png', frame: [1073, 252, 293, 314], spin: 16 },
    bird: { frame: [202.7, 733.1, 101.4, 104.3], spin: 0 }
  };
  var TABLE = { src: 'r2-01-cut-table.png', frame: [0, 466, 1448, 620] };
  // the tabletop's front edge, traced from the raster (tools/r2-01-cut.py), as [x, y] in scene px
  var EDGE = [[0, 910.2], [144, 911.2], [288, 912.0], [432, 912.5], [720, 913.1], [912, 913.5], [1152, 913.8], [1447, 913.9]];
  var EDGE_W = 2.05, EDGE_RGB = [96, 87, 78];      // stroke weight (scene px) and ink of the drawn edge
  // the same object's ink bbox inside its 60px nav sprite (site-nav.css --nav-art-x/y included)
  var NAV = { writing: [5, 17.5, 51, 35], building: [7, 12, 46, 40.5], shooting: [6.5, 13, 47, 40], about: [11, 13.5, 37.5, 39.5] };
  // mass: the laptop is heavy, the frame is light. The carry is a spring chasing an eased target (arc-progress
  // units): heavier = a longer haul (dur), a stiffer-damped landing; lighter = quicker, one livelier overshoot.
  var MASS = {
    building: { dur: 440, k: 230, c: 30, m: 1.4, lift: 70, e: 0.12 },
    shooting: { dur: 400, k: 250, c: 24, m: 1.1, lift: 110, e: 0.2 },
    writing: { dur: 400, k: 260, c: 22.5, m: 1, lift: 104, e: 0.18 },
    about: { dur: 370, k: 300, c: 21, m: 0.9, lift: 118, e: 0.3 }
  };

  function pct(v, of) { return (v / of * 100).toFixed(3) + '%'; }
  function box(f) { return 'left:' + pct(f[0], SW) + ';top:' + pct(f[1], SH) + ';width:' + pct(f[2], SW) + ';height:' + pct(f[3], SH); }
  function drawing(k, holed) {
    var o = OBJ[k];
    if (o.kind === 'cut') return '<img src="' + (holed ? o.hole : o.src) + '" alt="">';
    if (o.kind === 'book') return '<i class="face face-book' + (holed ? ' holed' : '') + '"></i>';
    return '<i class="face face-frame' + (holed ? ' holed' : '') + '"></i>';
  }
  function home(P) {
    var notes = [['writing', 27, 96, -1.5], ['building', 23.5, 5, -2], ['about', 66.5, 3.6, -2], ['shooting', 60, 96, -1]];
    var h = '<section class="ms-home" aria-label="home (mockup)"><header class="ms-head"><div>' + P.IDENTITY + '</div></header><div class="ms-scene">' +
      '<div class="r2-table" role="img" aria-label="A hand-drawn desk: laptop, a mug, a plant, a film camera, an open book and a framed portrait"><img src="' + TABLE.src + '" alt="" style="' + box(TABLE.frame) + '"><img src="r2-01-frame-rest.png" alt="" style="' + box(OBJ.about.frame) + '"></div>';
    Object.keys(PROPS).forEach(function (k) {
      var p = PROPS[k];
      h += '<span class="r2-prop r2-prop--' + k + '" data-prop="' + k + '" style="' + box(p.frame) + '">' + (p.src ? '<img src="' + p.src + '" alt="">' : '<i class="face face-bird"></i>') +
        (k === 'mug' ? '<svg class="r2-steam" viewBox="0 0 100 110" aria-hidden="true"><path d="M25 92 q9 -11 0 -22 q-9 -11 0 -22"/><path d="M52 100 q10 -12 0 -24 q-10 -12 0 -24 q7 -9 3 -16"/><path d="M79 92 q9 -11 0 -22 q-9 -11 0 -22"/></svg>' : '') + '</span>';
    });
    h += '<svg class="ms-arrows" viewBox="0 0 1448 1086" aria-hidden="true">' +
      ['M500 1035 Q620 1010 640 935', 'M623 957 l17 -22 5 26', 'M430 110 Q480 140 498 240', 'M483 219 l15 21 7 -25',
        'M1042 108 Q1035 225 952 342', 'M942 320 l10 24 18 -14', 'M960 1035 Q1030 1000 1040 903', 'M1026 925 l14 -22 9 25'].map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</svg>';
    notes.forEach(function (n) {
      var d = P.DEST[n[0]];
      h += '<a class="ms-note" data-go="' + n[0] + '" href="../../' + d.href + '" style="left:' + n[1] + '%;top:' + n[2] + '%"><span style="transform:rotate(' + n[3] + 'deg)">' + d.zh + ' ' + d.en + '</span></a>';
    });
    Object.keys(OBJ).forEach(function (k) {
      var o = OBJ[k].hot, d = P.DEST[k];
      h += '<a class="ms-hot" data-go="' + k + '" href="../../' + d.href + '" aria-label="' + d.label + '" style="left:' + o[0] + '%;top:' + o[1] + '%;width:' + o[2] + '%;height:' + o[3] + '%"></a>';
    });
    h += '</div><nav class="ms-mnav" aria-label="site (mockup)">' + P.ORDER.map(function (k) {
      var d = P.DEST[k]; return '<a data-go="' + k + '" href="../../' + d.href + '">' + d.zh + ' ' + d.en + '</a>';
    }).join('') + '</nav><div class="ms-fig">fig.01</div></section>';
    return h;
  }
  // the flying twin of a door object: the desk drawing and the nav drawing, each laid out at its own native
  // size around one anchor (the bottom-centre of the ink box, the point the object stands on). The twin is
  // translated to the anchor; each drawing is scaled relative to its own rest, so at either end the drawing
  // on screen is scale(1) of exactly what the page draws: the handoff has no resampling seam.
  function fly(k, sprite, holed, sceneK) {
    var o = OBJ[k], n = NAV[k], d = o.drawn, f = o.frame, ax = d[0] + d[2] / 2, ay = d[1] + d[3];
    var L = (f[0] - ax) * sceneK, T = (f[1] - ay) * sceneK, nx = n[0] + n[2] / 2, ny = n[1] + n[3];
    var el = document.createElement('div');
    el.className = 'r2-fly'; el.dataset.obj = k;
    el.innerHTML = '<div class="r2-fly-desk ms-obj--' + o.kind + '" style="left:' + L + 'px;top:' + T + 'px;width:' + (f[2] * sceneK) + 'px;height:' + (f[3] * sceneK) + 'px;transform-origin:' + (-L) + 'px ' + (-T) + 'px">' + drawing(k, holed) + '</div>' +
      '<span class="site-nav-object site-nav-' + sprite + '" style="left:' + (-nx) + 'px;top:' + (-ny) + 'px;transform-origin:' + nx + 'px ' + ny + 'px"></span>';
    return { el: el, desk: el.firstChild, nav: el.lastChild };
  }

  window.R2Desk = { OBJ: OBJ, PROPS: PROPS, TABLE: TABLE, EDGE: EDGE, EDGE_W: EDGE_W, EDGE_RGB: EDGE_RGB, NAV: NAV, MASS: MASS, SW: SW, SH: SH, home: home, fly: fly, drawing: drawing };
})();
