/* 01-b-seal.js — B · 印 the seals. The one red on an ink drawing is where the maker stamps it: a white-text name
   seal (白文) with 弗雷德 in the classic 2 + 1 layout (弗 雷 down the right column, 德 the whole left), and a red-text
   seal (朱文) with FRED YANG, the pair a scholar stamps under his inscription. The inscription (款) is the motto,
   written in two columns right to left: 继续写， then 继续造, and 造 ends beside the seals it made.
   The seals are carved, not written: straight cuts, square ends, one nick in the stone's edge. Flat coral, no grain. */
(function () {
  'use strict';
  var K = window.IDK, G = window.GLYPHS;

  // ---- the stones (100-unit boxes). Cuts are listed per character; w = the knife's width in units ----
  var BODY = 'M4 5 Q30 3.4 60 4.2 Q80 4.6 96 3.8 Q97.2 30 96.4 61.5 L94.9 63.6 L96.7 65.4 Q97 84 96.6 96.2 Q60 97.4 30 96.6 Q14 96.4 3.6 96.8 Q2.8 70 3.4 40 Q3.2 20 4 5 Z';
  var BAIWEN = [
    { w: 3.6, d: [   // 弗, top right
      'M55 12 L89 12 L89 22', 'M55 22 L89 22', 'M55 22 L55 32 L89 32 L89 44 L84 44', 'M66 8.5 L66 38 L58.5 46', 'M78 8.5 L78 47'] },
    { w: 3.1, d: [   // 雷, bottom right: 雨 with its four dots as four short cuts, then 田
      'M60 54 L84 54', 'M55.5 65.5 L55.5 59.5 L88.5 59.5 L88.5 65.5', 'M72 54 L72 68.5',
      'M61 63.5 L61 67.5', 'M65.5 63.5 L65.5 67.5', 'M78.5 63.5 L78.5 67.5', 'M83 63.5 L83 67.5',
      'M56.5 72 L88 72 L88 91 L56.5 91 Z', 'M56.5 81.5 L88 81.5', 'M72.2 72 L72.2 91'] },
    { w: 3.4, d: [   // 德, the whole left column: 彳, then 十 罒 一 心 stacked tall
      'M20.5 10.5 L12 21', 'M21.5 25.5 L11 38', 'M16.3 31.5 L16.3 91',
      'M25 14 L46.5 14', 'M35.8 9 L35.8 19.5',
      'M26 24.5 L45.5 24.5 L45.5 36 L26 36 Z', 'M32.5 24.5 L32.5 36', 'M39 24.5 L39 36',
      'M24 44 L47.5 44',
      'M25.6 55 L28.6 62.5', 'M31.8 50.5 L31.8 82 Q31.8 86.5 36.3 86.5 L46 86.5 L46 77.5', 'M36.6 52.5 L39.6 59.5', 'M43 51.5 L46.4 58.5'] }
  ];
  var FRAME = 'M6 5.6 L94.5 6.1 L94 94.6 L5.6 94 Z';
  var ZHUWEN = { w: 4.4, d: [
    'M14 16 L14 44', 'M14 16 L29 16', 'M14 29.5 L26 29.5',                                   // F
    'M35 44 L35 16 L44 16 Q51 16 51 23 Q51 30 44 30 L35 30', 'M44 30 L51.5 44',               // R
    'M57 16 L57 44', 'M57 16 L71 16', 'M57 30 L68 30', 'M57 44 L71 44',                        // E
    'M77 16 L77 44', 'M77 16 L81.5 16 Q88.5 16 88.5 30 Q88.5 44 81.5 44 L77 44',              // D
    'M12.5 56 L21 70.5', 'M29.5 56 L21 70.5 L21 84',                                          // Y
    'M33 84 L41 56 L49 84', 'M36.2 74.5 L45.8 74.5',                                          // A
    'M55 84 L55 56 L69 84 L69 56',                                                            // N
    'M88.5 61 Q85.5 56 80.5 56 Q73.5 56 73.5 70 Q73.5 84 80.5 84 Q88.5 84 88.5 74.5 L81 74.5' // G
  ] };

  // px per tier: big / small seal sides, the gap between them, the inscription's box and column pitch
  var TIER = {
    wide: { A: 66, Bs: 46, gap: 8, T: 16, pitch: 19.5, vadv: 17.5, gapIns: 12 },
    phone: { A: 58, Bs: 40, gap: 7, T: 14, pitch: 17, vadv: 15.3, gapIns: 10 }
  };

  function stone(svg, x, y, size, rot, draw) {
    var g = K.el('g', { transform: 'translate(' + x + ' ' + y + ') rotate(' + rot + ' ' + size / 2 + ' ' + size / 2 + ') scale(' + (size / 100) + ')', 'class': 'seal' }, svg);
    draw(g);
    return g;
  }
  function cuts(g, list, cls) {
    list.forEach(function (c) { c.d.forEach(function (d) { K.el('path', { d: d, 'class': cls, 'stroke-width': c.w }, g); }); });
  }
  // two frames of impact ticks round a seal, as the corkboard's pin and flower press use (held frames)
  function ticks(svg, cx, cy, r) {
    var g = K.el('g', { 'class': 'seal-ticks', opacity: 0 }, svg), a = [-2.7, -2.2, -1.7, .5, 1.05];
    a.forEach(function (t, i) {
      var r0 = r + 3 + (i % 2), r1 = r0 + 5 - (i % 2);
      K.el('path', { d: 'M' + (cx + Math.cos(t) * r0).toFixed(1) + ' ' + (cy + Math.sin(t) * r0).toFixed(1) + ' L' + (cx + Math.cos(t) * r1).toFixed(1) + ' ' + (cy + Math.sin(t) * r1).toFixed(1) }, g);
    });
    return g;
  }

  function build(link, tierName) {
    var P = TIER[tierName], A = P.A, Bs = P.Bs;
    link.classList.add('id', 'id-b');
    var xb = A + P.gap, yb = A - Bs + 1, xi = xb + Bs + P.gapIns, W = Math.ceil(xi + P.pitch + P.T), H = A + 1;
    var el = document.createElement('span'); el.className = 'id-part id-b-art'; el.setAttribute('aria-hidden', 'true'); link.appendChild(el);
    var svg = K.el('svg', { width: W, height: H, 'aria-hidden': 'true', focusable: 'false' }, el);
    // the inscription first (the pen writes, then the maker stamps): right column 继续写， then left 继续造
    var ins = [], colR = xi + P.pitch, colL = xi;
    ['继', '续', '写', '︐'].forEach(function (ch, i) { ins = ins.concat(K.place(G.k[ch], colR, 1 + i * P.vadv, P.T)); });
    ['继', '续', '造'].forEach(function (ch, i) { ins = ins.concat(K.place(G.k[ch], colL, 1 + i * P.vadv, P.T, i < 2 ? { m: K.M.chain(K.M.t(50, 50), K.M.r(1.2), K.M.t(-50, -50)) } : null)); });
    var paths = K.ink(svg, ins);
    var big = stone(svg, 0, 1, A, -1.1, function (g) { K.el('path', { d: BODY, 'class': 'seal-body' }, g); cuts(g, BAIWEN, 'seal-cut'); });
    var small = stone(svg, xb, yb, Bs, .9, function (g) { K.el('path', { d: FRAME, 'class': 'seal-line', 'stroke-width': 4.6 }, g); cuts(g, [ZHUWEN], 'seal-line'); });
    var tk = [ticks(svg, A / 2, A / 2 + 1, A * .62), ticks(svg, xb + Bs / 2, yb + Bs / 2, Bs * .64)];
    // Held frames on the hand's clock (12 fps, Motion.held): one empty tick, then the impression is there with its
    // ticks, the ticks' second frame a hair further out, then only the impression.
    function stamp(g, t, at) {
      g.animate(Motion.held([{ opacity: 0 }, { opacity: 1 }]), { duration: 84, delay: at, fill: 'backwards' });
      t.style.transformBox = 'fill-box'; t.style.transformOrigin = 'center';
      t.animate(Motion.held([{ opacity: 0, offset: 0 }, { opacity: 1, transform: 'scale(1)', offset: .25 }, { opacity: 1, transform: 'scale(1.08)', offset: .5 },
        { opacity: 0, offset: .75 }, { opacity: 0, offset: 1 }]), { duration: 334, delay: at, fill: 'both' });
    }
    return {
      target: el, paths: paths,
      arrive: function () {
        if (K.reduced()) { K.show(paths); return 0; }
        var t = K.write(paths, { total: 900, lift: 8, min: 18 });
        stamp(big, tk[0], t + 140); stamp(small, tk[1], t + 400);
        return t + 400 + 334;
      }
    };
  }

  (window.IDC = window.IDC || {}).B = { key: 'B', name: '印 · the seals', build: build };
})();
