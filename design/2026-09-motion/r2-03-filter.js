/* r2-03-filter.js — one filter, two dimensions, any collection (bookshelf or clothesline).
   State is { cat, ys } where ys is null (every year), a span {a, b} of ruler cells (mode 'range')
   or a Set of cells (mode 'set'). Both controls are views of this state; the readout says it aloud.
   The one rule that keeps both dimensions operable without ever stranding you on an empty shelf:
     the dimension you touch wins, and the other one gives way.
   Pick a sunk tab (nothing in the chosen years) and the years release to "every year"; pick a dim
   year (nothing for the chosen tag) and the tag releases to "all". The readout keeps the released
   value on the line, struck through in pencil, so the cause of the change stays readable.
   A span that is empty for every tag (2020 — nothing written, nothing shot) stays honestly empty. */
(function () {
  function create(col, opt) {
    var Y = col.years, mode = opt.mode || 'range', st = { cat: 'all', ys: null };
    function yIdx(y) { return Y.indexOf(y); }
    function inCat(p, cat) { return cat === 'all' || p.cats.indexOf(cat) >= 0; }
    function yearOk(p, ys) {
      if (!ys) return true;
      var i = yIdx(p.year);
      return mode === 'range' ? i >= ys.a && i < ys.b : ys.has(i);
    }
    function count(cat, ys) { var n = 0; col.items.forEach(function (p) { if (inCat(p, cat) && yearOk(p, ys)) n++; }); return n; }
    function yearCounts(cat) { var c = Y.map(function () { return 0; }); col.items.forEach(function (p) { if (inCat(p, cat)) c[yIdx(p.year)]++; }); return c; }
    function catCounts(ys) { var o = {}; col.cats.forEach(function (c) { o[c.id] = count(c.id, ys); }); return o; }

    // ---- words ----
    function catText(cat) {
      var c = col.cats.find(function (x) { return x.id === cat; });
      return cat === 'all' ? { zh: '全部', en: 'all', all: true } : { zh: c.zh, en: c.en };
    }
    function runs(ys) {   // {a,b} or Set of cells → [[newestYear, oldestYear], …] in ruler order
      var idx = mode === 'range' ? [] : Array.from(ys).sort(function (a, b) { return a - b; }), out = [];
      if (mode === 'range') for (var i = ys.a; i < ys.b; i++) idx.push(i);
      idx.forEach(function (i) { var r = out[out.length - 1]; if (r && r[2] === i - 1) { r[1] = Y[i]; r[2] = i; } else out.push([Y[i], Y[i], i]); });
      return out;
    }
    function yearsText(ys) {
      if (!ys) return { zh: '所有年份', en: 'every year', all: true };
      return { en: runs(ys).map(function (r) { return r[0] === r[1] ? r[0] : r[1] + '–' + r[0]; }).join(', ') };
    }
    function flagText(ys) { return ys ? yearsText(ys).en + ' · ' + count(st.cat, ys) + ' ' + col.noun.zh : ''; }

    var readout = Readout.create(opt.readoutHost, { onClear: clear });
    var tabs = Tabs.create(col, { onPick: pickCat, onHint: hintCat });
    var ruler = Ruler.create(col, { mode: mode, onChange: onYears, onHint: hintYear, flagText: flagText, maxCount: Math.max.apply(null, yearCounts('all')) });

    function update(o) {
      o = o || {};
      var n = count(st.cat, st.ys), quiet = st.ys && !count('all', st.ys);
      col.apply(function (p) { return inCat(p, st.cat) && yearOk(p, st.ys); }, {
        instant: o.instant,
        emptyNote: quiet ? 'Nothing at all in ' + yearsText(st.ys).en + ' · 那段时间一片空白' : ''
      });
      tabs.sync(st.cat, catCounts(st.ys), { animate: !o.instant });
      ruler.sync(st.ys, yearCounts(st.cat), { animate: !o.instant, recount: o.recount });
      readout.render({ cat: catText(st.cat), years: yearsText(st.ys), n: n, noun: col.noun, narrowed: st.cat !== 'all' || !!st.ys, was: o.was || null, live: o.live });
      if (opt.onUpdate) opt.onUpdate(st, n);
    }
    function pickCat(cat) {
      if (cat === st.cat) return;
      var was = null;
      if (st.ys && !count(cat, st.ys)) { was = { which: 'years', text: yearsText(st.ys) }; st.ys = null; }   // the years give way
      st.cat = cat;
      update({ recount: true, was: was });
    }
    function onYears(ys, o) {
      st.ys = ys;
      var was = null;
      if (o.commit && ys && st.cat !== 'all' && !count(st.cat, ys) && count('all', ys)) { was = { which: 'cat', text: catText(st.cat) }; st.cat = 'all'; }   // the tag gives way
      update({ was: was, recount: !!was, live: !o.commit });
    }
    function clear() { st.cat = 'all'; st.ys = null; update({ recount: true }); }
    function hintCat(cat) { col.hint(cat ? function (p) { return inCat(p, cat) && yearOk(p, st.ys); } : null); }
    function hintYear(y) { col.hint(y ? function (p) { return p.year === y && inCat(p, st.cat); } : null); }

    update({ instant: true });
    return {
      st: st, col: col, ruler: ruler, tabs: tabs, pickCat: pickCat, clear: clear, count: count,
      clickYear: function (y, shift) { ruler.click(ruler.index(y), shift); },
      dragYears: function (from, to, ms, done) { ruler.glide(ruler.index(from), ruler.index(to), ms || 900, done); }
    };
  }

  window.Filter = { create: create };
})();
