/* 01-c-grid.js — C · 稿 the manuscript. A strip of 稿纸, the writer's squared paper, printed in the identity's coral,
   filled in the careful hand, one character to a square: Fr|ed|Ya|ng|弗|雷|德 over 继|续|写|，|继|续|造. Seven and
   seven, the way the paper's own rules set them: Latin letters two to a square, the comma in its own square, low on
   the left. The ruling is the machine; the writing is the person. One character won't be ruled: 造 is written a size
   too big and leaning, over its square's walls, the provocation in 造 (造作, 造反) in a sheet that is otherwise good. */
(function () {
  'use strict';
  var K = window.IDK, G = window.GLYPHS;
  // px per tier. Q: the square · gap: the strip between the two rows · N/M: the name's and the motto's CJK box ·
  // L/base: the Latin em and its baseline in the square · Z: 造's box (too big for its square)
  var TIER = {
    wide: { Q: 30, gap: 6, N: 23, M: 20, L: 36, base: 25, Z: 37 },
    phone: { Q: 26, gap: 5, N: 20, M: 17.5, L: 31, base: 21.7, Z: 32 }
  };
  var ROW1 = ['Fr', 'ed', 'Ya', 'ng', '弗', '雷', '德'], ROW2 = ['继', '续', '写', '，', '继', '续', '造'];
  var TWICE = K.M.chain(K.M.t(50, 50), K.M.r(1.3), K.M.s(.97), K.M.t(-50, -50));
  var DEFY = K.M.chain(K.M.t(50, 50), K.M.r(-8), K.M.t(-50, -50));

  function rules(svg, P) {
    var g = K.el('g', { 'class': 'rules' }, svg), W = 7 * P.Q, d = '';
    [0, P.Q + P.gap].forEach(function (y0) {
      d += 'M0 ' + (y0 + .5) + ' H' + W + ' M0 ' + (y0 + P.Q - .5) + ' H' + W;
      for (var c = 0; c <= 7; c++) { var x = Math.min(W - .5, c * P.Q + .5); d += ' M' + x + ' ' + y0 + ' V' + (y0 + P.Q); }
    });
    K.el('path', { d: d, 'class': 'rule' }, g);
  }
  function cell(txt, c, y0, P, box, m) {
    var x0 = c * P.Q;
    if (/[A-Za-z]/.test(txt)) {   // two letters to a square, on one baseline across the row (a g may dip past it)
      var k = P.L / 100, w = K.word(txt, 0, 0, P.L, { track: 5 }).w - 5 * k;
      return K.word(txt, x0 + (P.Q - w) / 2, y0 + P.base - .72 * P.L, P.L, { track: 5 }).strokes;
    }
    if (txt === '，') return K.place(G.k[txt], x0 + 1, y0 + P.Q - box - 1, box);
    var off = (P.Q - box) / 2;
    return K.place(G.k[txt], x0 + off, y0 + off, box, m ? { m: m } : null);
  }

  function build(link, tierName) {
    var P = TIER[tierName], y2 = P.Q + P.gap, Wg = 7 * P.Q, over = (P.Z - P.Q) / 2, W = Math.ceil(Wg + over + 3), H = 2 * P.Q + P.gap;
    link.classList.add('id', 'id-c');
    var el = document.createElement('span'); el.className = 'id-part id-c-art'; el.setAttribute('aria-hidden', 'true'); link.appendChild(el);
    var svg = K.el('svg', { width: W, height: H, 'aria-hidden': 'true', focusable: 'false' }, el);
    rules(svg, P);
    var ds = [];
    ROW1.forEach(function (t, c) { ds = ds.concat(cell(t, c, 0, P, P.N)); });
    ROW2.slice(0, 6).forEach(function (t, c) { ds = ds.concat(cell(t, c, y2, P, P.M, c === 4 || c === 5 ? TWICE : null)); });
    // 造, too big for its square: centred a little high and right, leaning back, over the walls
    var zx = 6 * P.Q + (P.Q - P.Z) / 2 + 1.5, zy = y2 + (P.Q - P.Z) / 2 - 2.2, n0 = ds.length;
    ds = ds.concat(K.place(G.k['造'], zx, zy, P.Z, { m: DEFY }));
    var paths = K.ink(svg, ds);
    return {
      target: el, paths: paths,
      // square by square in the careful hand, then a breath, and 造 is written slower, and bigger than it should be
      arrive: function () {
        var t = K.write(paths.slice(0, n0), { total: 1450, lift: 8, min: 16 });
        return K.write(paths.slice(n0), { total: 420, lift: 10, min: 20, delay: t + 170 });
      }
    };
  }

  (window.IDC = window.IDC || {}).C = { key: 'C', name: '稿 · the manuscript', build: build };
})();
