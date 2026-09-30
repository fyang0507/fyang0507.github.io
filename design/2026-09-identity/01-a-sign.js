/* 01-a-sign.js — A · 签 the signature. The site's one pen signs every sheet: "Fred Yang" in the signing hand, 弗雷德
   in the same hand written quickly, and the motto under it. 造 is the one stroke that shows off: its 平捺 (the long
   flat sweep of 辶) doesn't stop, and runs on under the whole name as the signature's paraph, level, blunt-ended.
   Everything is ink; the coral is only the pen's live attention (hover, focus). */
(function () {
  'use strict';
  var K = window.IDK, G = window.GLYPHS;
  // px per tier. E: the Latin em · S: the name's CJK box · T: the motto's box · gap: Latin → CJK · adv: CJK advance
  // (× box) · indent: the motto's start · rowGap: baseline → motto top (≥ underline + 10 px, pen-spacing rule).
  var TIER = {
    wide: { E: 50, S: 32, T: 17.5, gap: 12, adv: 1.02, indent: 18, rowGap: 19 },
    phone: { E: 43, S: 27.5, T: 15.5, gap: 10, adv: 1.02, indent: 14, rowGap: 18 }
  };
  var LEAN = K.M.chain(K.M.t(50, 50), K.M.r(-2.5), K.M.s(.95, 1), K.M.t(-50, -50));   // written fast: rises, narrows
  var TWICE = K.M.chain(K.M.t(50, 50), K.M.r(1.4), K.M.s(.97), K.M.t(-50, -50));       // the second 继续 sits differently

  function build(link, tierName) {
    var P = TIER[tierName], E = P.E, S = P.S, T = P.T;
    link.classList.add('id', 'id-a');
    // the name row: its box ends on the Latin baseline, so the pen's underline hangs from the right line
    var H1 = Math.round(2 + .6 * E), emTop = H1 - .72 * E;
    var name = K.word('Fred Yang', 1, emTop, E, { set: 'sig', slant: 9, track: 0, space: 16 });
    var cx = 1 + name.w + P.gap, cjk = [], hand = function (ch) { return G.x[ch] || G.k[ch]; };
    ['弗', '雷', '德'].forEach(function (ch, i) {
      cjk = cjk.concat(K.place(hand(ch), cx + i * S * P.adv, H1 + .08 * S - S, S, { m: LEAN }));
    });
    var W = Math.ceil(cx + 3 * S * P.adv);
    // the motto: 继续写，继续造
    var tag = [], x = P.indent, x0 = 0;
    ['继', '续', '写', '，', '继', '续', '造'].forEach(function (ch, i) {
      var comma = ch === '，', m = i >= 4 && i <= 5 ? TWICE : null;
      if (i === 6) x0 = x;
      tag = tag.concat(K.place(hand(ch), x - (comma ? T * .12 : 0), 0, T, m ? { m: m } : null));
      x += T * (comma ? .5 : P.adv);
    });
    // 造's 平捺 is redrawn as one sweep: it leaves 辶 as the character's own stroke and doesn't stop. It runs on under
    // the name as the calligrapher's 一波三折 (one wave, three turns): down into a trough well below the motto's baseline
    // (so it reads as a flourish, not a blank to fill in), a slow rise, then it settles, level, blunt. Never a rising tail.
    var s = T / 100, X = W - 2, f = function (n) { return n.toFixed(1); }, yb = 99 * s, xa = x0 + 96 * s, span = X - xa;
    tag[tag.length - 1] = 'M' + f(x0 + 21 * s) + ' ' + f(85 * s) + ' C' + f(x0 + 30 * s) + ' ' + f(100 * s) + ' ' + f(x0 + 72 * s) + ' ' + f(yb + .6) + ' ' + f(xa) + ' ' + f(yb + 1.6) +
      ' C' + f(xa + span * .22) + ' ' + f(yb + 4.6) + ' ' + f(xa + span * .42) + ' ' + f(yb + 7.2) + ' ' + f(xa + span * .62) + ' ' + f(yb + 5.4) +
      ' C' + f(xa + span * .78) + ' ' + f(yb + 4) + ' ' + f(X - 10) + ' ' + f(yb + 4.3) + ' ' + X + ' ' + f(yb + 4.5);

    var nameEl = part(link, 'id-a-name'), tagEl = part(link, 'id-a-tag');
    tagEl.style.marginTop = P.rowGap + 'px';
    tagEl.setAttribute('data-pen-rule', '');   // drawn ink that follows the name's underline: pen-spacing.mjs measures it
    var s1 = K.el('svg', { width: W, height: H1, 'aria-hidden': 'true', focusable: 'false' }, nameEl);
    var s2 = K.el('svg', { width: W, height: Math.ceil(yb + 9), 'aria-hidden': 'true', focusable: 'false' }, tagEl);
    var named = K.ink(s1, name.strokes.concat(cjk)), motto = K.ink(s2, tag), paths = named.concat(motto);
    return {
      target: nameEl, paths: paths,
      // three phrases, the way a name is signed: the name in one go, a breath, the motto quicker, then the sweep
      arrive: function () {
        var t = K.write(named, { total: 1050, lift: 12, min: 30 });
        t = K.write(motto.slice(0, -1), { total: 640, lift: 6, min: 14, delay: t + 110 });
        return K.write(motto.slice(-1), { total: 360, delay: t + 30 });
      }
    };
  }
  function part(link, cls) { var s = document.createElement('span'); s.className = 'id-part ' + cls; s.setAttribute('aria-hidden', 'true'); link.appendChild(s); return s; }

  (window.IDC = window.IDC || {}).A = { key: 'A', name: '签 · the signature', build: build };
})();
