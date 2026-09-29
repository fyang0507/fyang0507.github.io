/* r3-10 · the honest loader. Round 2 streamed every byte with fetch() so a pen line could follow them; the line is
   gone, so this only preloads and decodes. Nothing is padded: the falling objects are the "ready" signal, and
   they wait exactly as long as the bytes take. Decoded images stay referenced, so every later <img> / CSS
   background of the same URL is a memory-cache hit (nothing downloads twice).
   Groups: 0 = the OP's cut-outs (needed from 0.5 s), 1 = the empty desk + the bird + the masks (needed at the
   cut), 2 = the book and portrait sprites (needed when they fall). */
(function () {
  var A = '../../assets/', G = 'assets-gen/';
  var ASSETS = [
    [G + '10c-me.webp', 0], [G + '10c-laptop.webp', 0], [G + '10c-camera.webp', 0], [G + '10c-book.webp', 0],
    [G + '10d-mask-plate.png', 1], [G + '10d-mask-obj.png', 1], [G + '10d-mask-aux.png', 1], [G + '10d-edge.png', 1],
    [A + 'desk-scene2-light.png', 1], [A + 'bird-strip6-light.png', 1],
    [A + 'book-flip2-light.png', 2], [A + 'frame-exp3-light.png', 2]
  ];
  // [font spec, sample]. The OP's two display faces first; then the live desk's faces (labels, header, hint).
  var OP_FONTS = [['20px "OP JinBuTi"', '弗雷德在造写拍关于咔嚓日常'], ['italic 500 40px "Fraunces"', 'FRED building! shooting!']];
  var FONTS = [['12px "IBM Plex Mono"', 'tap to skip 27 essays'], ['12px "Noto Sans SC"', '点按跳过篇'],
    ['500 25px "Fraunces"', 'Fred Yang'], ['24px "Caveat"', 'writing building'], ['24px "R10 Muyao"', '在写在造关于在拍咔嚓']];
  var kept = [], L = null;

  function track(p) { p.done = false; p.then(function () { p.done = true; }, function () {}); return p; }
  function image(u) { var im = new Image(); im.src = u; kept.push(im); return im.decode(); }
  function font(f) { return document.fonts.load(f[0], f[1]).catch(function () {}); }   // a failed face still settles
  function group(g) { return Promise.all(ASSETS.filter(function (a) { return a[1] === g; }).map(function (a) { return image(a[0]); })); }

  function start() {
    if (L) return L;
    L = {};
    L.opFonts = track(Promise.all(OP_FONTS.map(font)));
    L.g0 = track(group(0));
    L.g1 = track(group(1));                          // the desk is needed at 1.5 s: it starts at once too
    var after = L.g1.catch(function () {});
    L.g2 = track(after.then(function () { return group(2); }));
    L.fonts = track(after.then(function () { return Promise.all(FONTS.map(font)); }));
    L.all = track(Promise.all([L.opFonts, L.g0, L.g1, L.g2, L.fonts]));
    L.url = function () { return L.g0; };            // the OP's <img>s take their src once group 0 is decoded
    return L;
  }

  window.R10Load = { start: start };
})();
