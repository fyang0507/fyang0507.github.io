/* r4-03-data.js — the essays the bookcase is stress-tested with. 27 = the real shelf (r2-04-kit's ShelfKit.ALL,
   unchanged). 60 and 120 add SYNTHETIC essays so the growth rule can be judged before the writing exists:
   each one clones a real essay's titles, cover and excerpt (so spines and obis look like Fred's), and gets a
   plausible date and tag. The story they stand for: Fred keeps writing, and imports an older archive, so the
   ledger runs 2009–2026 (18 years; 2020 stays empty, as it really is).
   Every synthetic book is marked: dashed spine, a 拟 label where a series number would sit, "模拟 · synthetic"
   on its tag (so on its obi and its reading page), and the switch says how many are synthetic. */
(function () {
  var K = window.ShelfKit, REAL = K.ALL;
  var TONES = ['#c9bda3', '#d8cbb0', '#b7ab8f', '#e4dac7'];
  // roughly the real mix: mostly travel, then everyday, commentary, poems; the series stays real-only
  var TAGS = ['travel log', 'travel log', 'travel log', 'travel log', 'everyday chronicles', 'everyday chronicles', 'commentary', 'commentary', 'poem', 'stories we live'];
  var YEARS = [];
  for (var y = 2026; y >= 2009; y--) if (y !== 2020) YEARS.push(y);

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function build(n) {
    var out = REAL.slice(), m = Math.max(0, n - REAL.length), r = Pen.rng('r4-03-syn-' + n);
    for (var i = 0; i < m; i++) {
      var base = REAL[Math.floor(r() * REAL.length)], tag = TAGS[Math.floor(r() * TAGS.length)], seed = 101 + i;
      var yr = YEARS[Math.min(YEARS.length - 1, Math.floor((i + r() * 0.95) * YEARS.length / m))];
      var date = yr + '-' + pad(1 + Math.floor(r() * 12)) + '-' + pad(1 + Math.floor(r() * 27));
      out.push(Object.assign({}, base, {
        key: 'syn-' + n + '-' + i, id: 1000 + i, syn: true, date: date, year: String(yr), ym: date.slice(0, 7).replace('-', '·'),
        tags: [tag], tagZh: [K.TAG_ZH[tag] + ' · 模拟'], series: null, min: 3 + Math.floor(r() * 18),
        w: 22 + (seed % 4) * 4, hPct: 58 + ((seed * 29) % 38), tone: TONES[seed % 4]
      }));
    }
    return out.sort(function (a, b) { return b.date.localeCompare(a.date) || (a.syn ? 1 : 0) - (b.syn ? 1 : 0); });
  }
  window.R4Data = { build: build, COUNTS: [27, 60, 120] };
})();
