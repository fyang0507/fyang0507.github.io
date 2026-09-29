/* 10 · D — the honest loader. Every asset the gag and the landing desk need is streamed with
   fetch() so the pen line can follow real bytes as they arrive, then decoded before anything
   that uses it is shown. Nothing is padded: a warm cache fills the line as fast as the pen can
   draw it; a cold 4G visit makes the bird wait, visibly, for as long as the bytes take.
   Weights are the files' real sizes (fonts: the production subset sizes), so progress is honest
   even when a server omits Content-Length. */
(function () {
  var A = '../../assets/', G = 'assets-gen/';
  // group 1 = the empty desk + the bird (the first act); group 2 = the rest of the cast.
  var ASSETS = [
    { url: G + '10d-mask-plate.png', bytes: 11806, g: 1 },
    { url: G + '10d-mask-obj.png', bytes: 6939, g: 1 },
    { url: G + '10d-mask-aux.png', bytes: 8633, g: 1 },
    { url: G + '10d-edge.png', bytes: 6504, g: 1 },
    { url: A + 'desk-scene2-light.png', bytes: 862981, g: 1 },
    { url: A + 'bird-strip6-light.png', bytes: 170460, g: 1 },
    { url: A + 'book-flip2-light.png', bytes: 1067514, g: 2 },
    { url: A + 'frame-exp3-light.png', bytes: 1784390, g: 2 }
  ];
  var FONTS = [
    ['12px "IBM Plex Mono"', 'loading 0123456789%', 24000], ['12px "Noto Sans SC"', '加载中已', 30000],
    ['20px "DingTalk JinBuTi"', '日常弗雷德', 53508], ['italic 500 17px "Fraunces"', 'ep.0123456789', 30000],
    ['500 25px "Fraunces"', 'Fred Yang', 30000], ['24px "Caveat"', 'writing building', 26000],
    ['24px "MuyaoPleased"', '在写在造关于在拍咔嚓', 222660]
  ];
  var kept = [];                                   // decoded images stay referenced (decode cache)

  function start(onProgress) {
    var total = 0, got = {};
    ASSETS.forEach(function (a) { total += a.bytes; });
    FONTS.forEach(function (f) { total += f[2]; });
    function report() { var n = 0; for (var k in got) n += got[k]; onProgress(Math.min(1, n / total)); }

    // The first act (empty desk + bird) is fetched alone, so on a slow line the scene is there in a
    // second and the bird does the waiting; the rest of the cast and the fonts follow.
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
    var g1 = Promise.all(ASSETS.filter(function (a) { return a.g === 1; }).map(get));
    var after = g1.catch(function () {});
    var g2 = after.then(function () { return Promise.all(ASSETS.filter(function (a) { return a.g === 2; }).map(get)); });
    var fonts = after.then(function () {
      return Promise.all(FONTS.map(function (f) {    // a font that fails still counts as settled
        return document.fonts.load(f[0], f[1]).then(function () { got[f[0]] = f[2]; report(); }, function () {});
      }));
    });
    return { g1: g1, g2: g2, fonts: fonts };
  }

  window.D10Load = { start: start };
})();
