/* r2-seal.js — round 2: B · 印, re-carved as Fred asked ("let 弗 be on one col and 雷德 on the other").
   Seal reading order is right column first, top to bottom: 弗 alone fills the right column, 雷 over 德 the left.
   The carving follows 疏密: 弗 (5 strokes) is the sparse column, so it is cut a knife wider (4.5 units against 3.2)
   and stretched the full height, its two verticals running on under the 弓; 雷 and 德 (28 strokes between them) share
   the dense column, which is cut wider (49.5 units against 34) so their strokes keep at least ~1.2 px of red between
   them at 66 px. One margin all round (~3 units of red to the stone's edge), the same red between the columns.
   Everything else in B stands: the FRED YANG seal, the written inscription, the tilt of each impression.
   R2.art() is the lockup's SVG, R2.link(href) the whole .site-identity link, R2.mark() the white-text seal alone.
   Production bakes R2.link()'s output into every static header; this file keeps the design that produced it. */
(function () {
  'use strict';
  var K = window.IDK, G = window.GLYPHS;
  // ---- the white-text seal (白文), 100-unit box ----
  var BODY = 'M4 5 Q30 3.4 60 4.2 Q80 4.6 96 3.8 Q97.2 30 96.4 61.5 L94.9 63.6 L96.7 65.4 Q97 84 96.6 96.2 Q60 97.4 30 96.6 Q14 96.4 3.6 96.8 Q2.8 70 3.4 40 Q3.2 20 4 5 Z';
  // Proportions (100 units): ~3.5 units of red between the stone's edge and any cut, and the same between the columns;
  // 弗's column 30.5 wide, 雷德's 51.3; 弗's four verticals ~4 units of red apart, as 雷德's densest strokes are.
  var BAIWEN = [
    { w: 4.5, d: [   // 弗, the right column alone: 横折, 横, 竖折折钩 (the 弓), then 撇 and 竖 running the full height
      'M64.5 12.5 L90.5 12.5 L90.5 33.5', 'M64.5 33.5 L90.5 33.5', 'M64.5 33.5 L64.5 54.5 L90.5 54.5 L90.5 75.5 L85 75.5',
      'M73 9.3 L73 80 L66.5 90.5', 'M81.5 9.3 L81.5 91'] },
    { w: 3.2, d: [   // 雷, the left column's top: 雨 (its four dots as four short cuts), then 田
      'M20 9.3 L45.6 9.3', 'M9.2 21 L9.2 14.2 L56.5 14.2 L56.5 21', 'M32.8 9.3 L32.8 24',
      'M18.5 19.3 L18.5 23.7', 'M24.8 19.3 L24.8 23.7', 'M40.9 19.3 L40.9 23.7', 'M47.2 19.3 L47.2 23.7',
      'M11.5 28.8 L54.2 28.8 L54.2 46 L11.5 46 Z', 'M11.5 37.4 L54.2 37.4', 'M32.8 28.8 L32.8 46'] },
    { w: 3.2, d: [   // 德, the left column's bottom: 彳, then 十 罒 一 心
      'M19.8 54 L11.2 62.8', 'M20.8 65.8 L10.2 76', 'M15.2 70.2 L15.2 91.2',
      'M24.8 55.6 L56.9 55.6', 'M40.9 52.6 L40.9 59.6',
      'M26.6 62.6 L55.3 62.6 L55.3 70.6 L26.6 70.6 Z', 'M36.2 62.6 L36.2 70.6', 'M45.8 62.6 L45.8 70.6',
      'M23.8 75.6 L57.6 75.6',
      'M26.3 81.6 L28.9 88.6', 'M32.6 79.6 L32.6 87.2 Q32.6 91.2 36.8 91.2 L55.2 91.2 L55.2 85.6', 'M40.6 80.2 L42.7 86.2', 'M48.3 79.6 L51 85.6'] }
  ];
  // ---- the red-text seal (朱文), unchanged from round 1 ----
  var FRAME = 'M6 5.6 L94.5 6.1 L94 94.6 L5.6 94 Z';
  var ZHUWEN = { w: 4.4, d: [
    'M14 16 L14 44', 'M14 16 L29 16', 'M14 29.5 L26 29.5',
    'M35 44 L35 16 L44 16 Q51 16 51 23 Q51 30 44 30 L35 30', 'M44 30 L51.5 44',
    'M57 16 L57 44', 'M57 16 L71 16', 'M57 30 L68 30', 'M57 44 L71 44',
    'M77 16 L77 44', 'M77 16 L81.5 16 Q88.5 16 88.5 30 Q88.5 44 81.5 44 L77 44',
    'M12.5 56 L21 70.5', 'M29.5 56 L21 70.5 L21 84',
    'M33 84 L41 56 L49 84', 'M36.2 74.5 L45.8 74.5',
    'M55 84 L55 56 L69 84 L69 56',
    'M88.5 61 Q85.5 56 80.5 56 Q73.5 56 73.5 70 Q73.5 84 80.5 84 Q88.5 84 88.5 74.5 L81 74.5'] };

  // ---- the lockup, in px (the wide size; phones scale the whole drawing by CSS) ----
  var A = 66, Bs = 46, GAP = 8, T = 16, PITCH = 19.5, VADV = 17.5, GAPI = 12;
  var XB = A + GAP, YB = A - Bs + 1, XI = XB + Bs + GAPI, W = Math.ceil(XI + PITCH + T), H = A + 2;
  var TILT_A = -1.1, TILT_B = .9;
  var f = function (n) { return String(Math.round(n * 10) / 10); };
  var r1 = function (d) { return d.replace(/-?\d+\.\d+/g, function (n) { return f(+n); }); };

  function stone(x, y, size, rot, inner) {
    return '<g class="site-identity-seal" transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + rot + ' ' + f(size / 2) + ' ' + f(size / 2) + ') scale(' + Math.round(size * 10) / 1000 + ')">' + inner + '</g>';
  }
  function cuts(list, cls) {
    return list.map(function (c) { return '<g class="' + cls + '" stroke-width="' + c.w + '">' + c.d.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</g>'; }).join('');
  }
  function baiwen() { return '<path class="seal-body" d="' + BODY + '"/>' + cuts(BAIWEN, 'seal-cut'); }
  function zhuwen() { return '<path class="seal-line" stroke-width="4.6" d="' + FRAME + '"/>' + cuts([ZHUWEN], 'seal-line'); }
  // the inscription (款), one <g> per character in writing order: right column 继续写， then left 继续造
  function inscription() {
    var out = [], colR = XI + PITCH, colL = XI, lean = K.M.chain(K.M.t(50, 50), K.M.r(1.2), K.M.t(-50, -50));
    ['继', '续', '写', '︐'].forEach(function (ch, i) { out.push([ch, K.place(G.k[ch], colR, 1 + i * VADV, T)]); });
    ['继', '续', '造'].forEach(function (ch, i) { out.push([ch, K.place(G.k[ch], colL, 1 + i * VADV, T, i < 2 ? { m: lean } : null)]); });
    return out.map(function (c) {
      return '<g' + (c[0] === '︐' ? ' class="punct"' : '') + '>' + c[1].map(function (d) { return '<path d="' + r1(d) + '"/>'; }).join('') + '</g>';
    }).join('');
  }
  function art() {
    return '<svg class="site-identity-art" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true" focusable="false">' +
      '<g class="site-identity-tag">' + inscription() + '</g>' +
      stone(0, 1, A, TILT_A, baiwen()) + stone(XB, YB, Bs, TILT_B, zhuwen()) + '</svg>';
  }
  var NAME = 'Fred Yang, <span lang="zh">弗雷德</span>. <span lang="zh">继续写，继续造</span>: keep writing, keep making. Home';
  function link(href) {
    return '<a class="site-identity" href="' + (href || 'index.html') + '"><span class="site-identity-name">' + NAME + '</span>' +
      '<span class="site-identity-mark" data-pen-seed="Fred Yang">' + art() + '</span></a>';
  }
  // the white-text seal alone, as a compact mark (Reading's header, round 2's question a)
  function mark(cls, label) {
    return '<svg class="' + (cls || 'site-identity-art') + '" viewBox="0 0 100 100" role="img" aria-label="' + (label || 'Fred Yang') + '"><g class="site-identity-seal">' + baiwen() + '</g></svg>';
  }
  // round 1's carving (弗 雷 down the right, 德 the whole left), copied from 01-b-seal.js for the side-by-side only
  var ROUND1 = [
    { w: 3.6, d: ['M55 12 L89 12 L89 22', 'M55 22 L89 22', 'M55 22 L55 32 L89 32 L89 44 L84 44', 'M66 8.5 L66 38 L58.5 46', 'M78 8.5 L78 47'] },
    { w: 3.1, d: ['M60 54 L84 54', 'M55.5 65.5 L55.5 59.5 L88.5 59.5 L88.5 65.5', 'M72 54 L72 68.5', 'M61 63.5 L61 67.5', 'M65.5 63.5 L65.5 67.5', 'M78.5 63.5 L78.5 67.5', 'M83 63.5 L83 67.5',
      'M56.5 72 L88 72 L88 91 L56.5 91 Z', 'M56.5 81.5 L88 81.5', 'M72.2 72 L72.2 91'] },
    { w: 3.4, d: ['M20.5 10.5 L12 21', 'M21.5 25.5 L11 38', 'M16.3 31.5 L16.3 91', 'M25 14 L46.5 14', 'M35.8 9 L35.8 19.5', 'M26 24.5 L45.5 24.5 L45.5 36 L26 36 Z', 'M32.5 24.5 L32.5 36', 'M39 24.5 L39 36',
      'M24 44 L47.5 44', 'M25.6 55 L28.6 62.5', 'M31.8 50.5 L31.8 82 Q31.8 86.5 36.3 86.5 L46 86.5 L46 77.5', 'M36.6 52.5 L39.6 59.5', 'M43 51.5 L46.4 58.5'] }
  ];
  function round1Mark() {
    return '<svg class="site-identity-art" viewBox="0 0 100 100" aria-hidden="true"><g class="site-identity-seal"><path class="seal-body" d="' + BODY + '"/>' + cuts(ROUND1, 'seal-cut') + '</g></svg>';
  }

  window.R2 = { art: art, link: link, mark: mark, round1Mark: round1Mark, W: W, H: H, SEAL: { A: A, Bs: Bs, XB: XB, YB: YB } };
})();
