/* r2-10 · the honest loader (from 10-opener-d-load.js, plus the OP's own cut-outs). Every asset the OP,
   the gag and the landing desk need is streamed with fetch() so the pen line can follow real bytes as they
   arrive, then decoded before anything that uses it is shown. Nothing is padded: a warm cache fills the line
   as fast as the pen can draw it; a cold visit makes the bird wait, visibly, for as long as the bytes take.
   Weights are the files' real sizes (fonts: the production subset sizes), so progress is honest even when a
   server omits Content-Length. Groups: 0 = the OP's cut-outs (needed first, from 0.5 s), 1 = the empty desk
   + the bird (needed at the cut), 2 = the rest of the cast. */
(function () {
  var A = '../../assets/', G = 'assets-gen/';
  var ASSETS = [
    { url: G + '10c-me.webp', bytes: 62322, g: 0 },
    { url: G + '10c-laptop.webp', bytes: 16130, g: 0 },
    { url: G + '10c-camera.webp', bytes: 41554, g: 0 },
    { url: G + '10c-book.webp', bytes: 39848, g: 0 },
    { url: G + '10d-mask-plate.png', bytes: 11806, g: 1 },
    { url: G + '10d-mask-obj.png', bytes: 6939, g: 1 },
    { url: G + '10d-mask-aux.png', bytes: 8633, g: 1 },
    { url: G + '10d-edge.png', bytes: 6504, g: 1 },
    { url: A + 'desk-scene2-light.png', bytes: 862981, g: 1 },
    { url: A + 'bird-strip6-light.png', bytes: 170460, g: 1 },
    { url: A + 'book-flip2-light.png', bytes: 1067514, g: 2 },
    { url: A + 'frame-exp3-light.png', bytes: 1784390, g: 2 }
  ];
  // [font spec, sample text, production subset bytes]. The OP's two display faces load first.
  var OP_FONTS = [['20px "OP JinBuTi"', '弗雷德在造写拍关于咔嚓日常', 53508], ['italic 500 40px "Fraunces"', 'FRED building! shooting!', 30000]];
  var FONTS = [
    ['12px "IBM Plex Mono"', 'loading 0123456789%', 24000], ['12px "Noto Sans SC"', '加载中已篇', 30000],
    ['500 25px "Fraunces"', 'Fred Yang', 30000], ['24px "Caveat"', 'writing building', 26000],
    ['24px "R10 Muyao"', '在写在造关于在拍咔嚓', 222660]
  ];
  var kept = [], L = null;                          // decoded images stay referenced (decode cache)

  function start() {
    if (L) return L;
    var total = 0, got = {}, subs = [], each = {};
    ASSETS.forEach(function (a) { total += a.bytes; });
    OP_FONTS.concat(FONTS).forEach(function (f) { total += f[2]; });
    function report() {
      var n = 0; for (var k in got) n += got[k];
      L.p = Math.min(1, n / total);
      subs.forEach(function (f) { f(L.p); });
    }
    function get(a) {
      return fetch(a.url).then(function (res) {
        if (!res.ok) throw new Error(res.status + ' ' + a.url);
        var reader = res.body.getReader(), n = 0;
        return (function pump() {
          return reader.read().then(function (r) {
            if (r.done) return;
            n += r.value.length; got[a.url] = Math.min(n, a.bytes); report();
            return pump();
          });
        })();
      }).then(function () {
        got[a.url] = a.bytes; report();
        var im = new Image(); im.src = a.url; kept.push(im);
        return im.decode();
      });
    }
    function font(f) {                              // a font that fails still counts as settled
      return document.fonts.load(f[0], f[1]).then(function () { got[f[0]] = f[2]; report(); }, function () { got[f[0]] = f[2]; report(); });
    }
    function group(g) { return Promise.all(ASSETS.filter(function (a) { return a.g === g; }).map(function (a) { return (each[a.url] = get(a)); })); }
    L = { p: 0, on: function (f) { subs.push(f); f(L.p); } };
    L.opFonts = Promise.all(OP_FONTS.map(font));
    L.g0 = group(0);
    L.g1 = group(1);                                // the desk is needed at ~1.5 s: it starts at once too
    var after = L.g1.catch(function () {});
    L.g2 = after.then(function () { return group(2); });
    L.fonts = after.then(function () { return Promise.all(FONTS.map(font)); });
    L.all = Promise.all([L.opFonts, L.g0, L.g1, L.g2, L.fonts]);
    L.url = function (u) { return each[u] || Promise.resolve(); };
    [L.opFonts, L.g0, L.g1, L.g2, L.fonts, L.all].forEach(function (p) { p.done = false; p.then(function () { p.done = true; }, function () {}); });
    return L;
  }

  window.R10Load = { start: start };
})();
