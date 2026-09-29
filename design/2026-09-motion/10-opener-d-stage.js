/* 10 · D — the opener layer, built in the desk drawing's coordinate space (1448 × 1086 px).
   Cut objects are the same desk-scene2-light.png through binary masks (tools/10d-cut.py). Each
   is a full-desk <img> with the live desk image's exact geometry, clipped to its own box, so at
   rest it rasterises on the same pixel grid and the layer recomposes the live desk exactly. Book, portrait and bird are the live desk's own sprites, placed with
   the live desk's own percentages. */
(function () {
  var W = 1448, H = 1086;
  // From tools/10d-cut.py. box = [x, y, w, h]; foot = the contact line; cx = where it rocks.
  var GEO = {
    laptop: { box: [280, 257, 464, 342], foot: 594, cx: 512 },
    mug: { box: [351, 606, 161, 152], foot: 753, cx: 413 },
    camera: { box: [988, 687, 260, 185], foot: 867, cx: 1118 },
    plant: { box: [1069, 271, 300, 300], foot: 566, cx: 1202 },
    book: { box: [521.9, 667.9, 309, 237.4], foot: 899, cx: 676 },      // index.html .bookhold
    frame: { box: [799.7, 358.7, 225, 210.8], foot: 545, cx: 901 }      // index.html .frameface
  };
  var TONE = { laptop: [241, 491, 539, 142], mug: [315, 706, 227, 89], camera: [950, 790, 335, 109], plant: [1101, 478, 202, 127] };
  var LEAF = { box: [1163, 248, 48, 90], pivot: [1204, 336] };
  var LINE = { x0: 58, x1: 1402, y: 821 };                                // the bird's ground stroke
  var Z = { frame: 3, plant: 4, laptop: 5, mug: 6, camera: 8, book: 9 };  // back to front by foot

  function el(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e); return e;
  }
  function pc(n) { return (+n.toFixed(4)) + '%'; }
  // The desk drawing through one of the masks, clipped to `box` (null = unclipped).
  function cut(parent, box, kind) {
    var c = el('img', 'op-cut ' + kind, parent);
    c.alt = ''; c.draggable = false;
    if (box) c.style.clipPath = clip(box);
    return c;
  }
  function clip(box) { return 'inset(' + pc(box[1] / H * 100) + ' ' + pc(100 - (box[0] + box[2]) / W * 100) + ' ' + pc(100 - (box[1] + box[3]) / H * 100) + ' ' + pc(box[0] / W * 100) + ')'; }
  function spriteOrigin(e, g) {                   // sprite boxes: origin in % of their own box
    e.style.transformOrigin = pc((g.cx - g.box[0]) / g.box[2] * 100) + ' ' + pc((g.foot - g.box[1]) / g.box[3] * 100);
  }
  function origin(e, x, y) { e.style.transformOrigin = pc(x / W * 100) + ' ' + pc(y / H * 100); }

  function build(host) {
    var op = el('div', 'op', host);
    op.setAttribute('aria-hidden', 'true');
    var s = el('div', 'op-shake', op), S = { op: op, shake: s, body: {}, tone: {}, GEO: GEO, LINE: LINE };

    cut(s, null, 'plate');
    // the restored back edge: one segment behind the laptop screen, one behind the plant pot
    S.edge = {};
    [['laptop', 'inset(42% 48% 55% 18%)'], ['plant', 'inset(42% 10% 55% 76%)']].forEach(function (e) {
      var i = el('img', 'op-edge', s); i.alt = ''; i.style.clipPath = e[1]; S.edge[e[0]] = i;
    });
    Object.keys(TONE).forEach(function (k) { S.tone[k] = cut(s, TONE[k], 'aux op-tone'); });

    // loading line + snapped halves live under the bird
    S.under = svgEl('svg', { class: 'op-svg', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none' }, s);
    S.line = svgEl('path', { class: 'ln' }, S.under);
    S.halves = [svgEl('path', { class: 'ln' }, S.under), svgEl('path', { class: 'ln' }, S.under)];
    S.lbl = el('div', 'op-lbl', s);

    ['laptop', 'mug', 'camera', 'plant'].forEach(function (k) {
      var g = GEO[k], b = el('div', 'op-body full', s);
      origin(b, g.cx, g.foot); b.style.zIndex = Z[k];
      b.classList.add('op-' + k); cut(b, g.box, 'obj'); S.body[k] = b;
    });
    // a paper leaf-shape under the moving leaf: it hides whatever static leaf is beneath
    el('div', 'op-leafpatch', S.body.plant).style.clipPath = clip(LEAF.box);
    var leaf = S.leaf = el('div', 'op-leaf', S.body.plant);
    cut(leaf, LEAF.box, 'aux'); origin(leaf, LEAF.pivot[0], LEAF.pivot[1]);

    var book = el('div', 'op-body op-book', s); book.style.zIndex = Z.book; spriteOrigin(book, GEO.book);
    S.bookface = el('div', 'op-bookface', book); S.body.book = book;
    var fr = el('div', 'op-body op-frame air', s); fr.style.zIndex = Z.frame; spriteOrigin(fr, GEO.frame);
    S.fframe = el('div', 'op-fframe', fr); S.body.frame = fr;
    // Face-down: the back of the frame lying flat, tipped toward us from its bottom edge (sprite px).
    var slab = svgEl('svg', { class: 'op-slab', viewBox: '0 0 616 577', preserveAspectRatio: 'none' }, fr);
    svgEl('path', { d: 'M84 497 C200 504 350 514 474 522 L497 700 C360 694 200 684 66 676 Z' }, slab);
    svgEl('path', { d: 'M66 676 L66 690 C200 698 360 708 497 714 L497 700' }, slab);
    svgEl('path', { class: 'kick', d: 'M250 540 L262 640 L318 644 L310 544' }, slab);

    var bird = el('div', 'op-bird', s); bird.style.zIndex = 7;
    S.bird = birdParts(bird);

    var scr = el('div', 'op-screen', s); scr.style.zIndex = 10;
    el('span', '', scr); S.caret = el('span', 'op-caret', scr);
    S.steam = svgEl('svg', { class: 'op-steam', viewBox: '0 0 100 110' }, s); S.steam.style.zIndex = 10;
    ['M25 92 q9 -11 0 -22 q-9 -11 0 -22', 'M52 100 q10 -12 0 -24 q-10 -12 0 -24 q7 -9 3 -16', 'M79 92 q9 -11 0 -22 q-9 -11 0 -22'].forEach(function (d) { svgEl('path', { d: d }, S.steam); });
    S.flash = el('div', 'op-flash', s); S.flash.style.zIndex = 11;
    S.cstar = svgEl('svg', { class: 'op-cstar', viewBox: '0 0 40 40' }, s); S.cstar.style.zIndex = 12;
    var cg = svgEl('g', { fill: 'none', stroke: 'var(--mark)', 'stroke-width': 3, 'stroke-linecap': 'round' }, S.cstar);
    ['M20 2 V12', 'M20 28 V38', 'M2 20 H12', 'M28 20 H38', 'M8.5 8.5 L14 14', 'M26 26 L31.5 31.5', 'M31.5 8.5 L26 14', 'M14 26 L8.5 31.5'].forEach(function (d) { svgEl('path', { d: d }, cg); });
    S.kacha = el('div', 'op-kacha', s); S.kacha.style.zIndex = 12; S.kacha.textContent = '咔嚓 click! ✦';
    S.fx = svgEl('svg', { class: 'op-svg', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none' }, s);
    S.fx.style.zIndex = 13;

    S.svgEl = svgEl;
    return S;
  }

  // The bird sprite plus a closed-eye overlay for frame 0 (the eye dot, sprite px 148–156 × 148–157).
  function birdParts(bird) {
    var pose = el('div', 'op-bpose', bird), bf = el('div', 'op-bframe', pose);
    var blink = svgEl('svg', { class: 'op-blink', viewBox: '0 0 308 317' }, pose);
    svgEl('circle', { cx: 152, cy: 152.5, r: 7.5, fill: '#FEEFA6' }, blink);
    svgEl('path', { d: 'M144 154.5 Q152 155.6 160 154.5', fill: 'none', stroke: '#6f5a3c', 'stroke-width': 4.2, 'stroke-linecap': 'round' }, blink);
    return { el: bird, pose: pose, frame: bf };
  }
  // The eyecatch: the same bird, alone and large on cream, over the episode card.
  function eyecatch(card) {
    var e = el('div', 'eye', document.body), b = el('div', 'eye-bird', e);
    e.setAttribute('aria-hidden', 'true');
    var parts = birdParts(b);
    e.appendChild(card.cloneNode(true));
    return { el: e, bird: b, parts: parts };
  }

  // Sprite frame setters (same background-position math as the live desk).
  function birdFrame(S, i) { S.bird.frame.style.backgroundPosition = (i * 20) + '% 0'; }
  function bookFrame(S, i) { S.bookface.style.backgroundPosition = (i * 20) + '% 0'; }
  function faceFrame(S, i) { S.fframe.style.backgroundPosition = (i * 100 / 3) + '% 0'; }

  window.D10Stage = { build: build, eyecatch: eyecatch, birdFrame: birdFrame, bookFrame: bookFrame, faceFrame: faceFrame, W: W, H: H };
})();
