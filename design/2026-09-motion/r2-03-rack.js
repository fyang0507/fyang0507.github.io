/* r2-03-rack.js — the Gallery as a second "collection" for the same filter: real photos
   (window.FY_PHOTOS, derived 200/400w only) as small polaroids pegged along clotheslines that wrap
   into rows. Same interface as the shelf (r2-03-shelf.js), and the same reflow engine in hang mode:
   leavers lose a peg and drop, arrivals are hung on the line and swing from their peg.
   Like the live page (Gallery.dc.html:239 visibleCount), the rack shows a few lines and a tag
   for the rest, so a 107-frame archive does not become a 900px wall. */
(function () {
  var CAT_EN = { landscape: 'landscape', cityscape: 'cityscape', people: 'people', architecture: 'architecture', street: 'street', creature: 'creature', 'black and white': 'b & w', abstract: 'abstract' };
  var CAT_ZH = { landscape: '风景', cityscape: '城市', people: '人像', architecture: '建筑', street: '街头', creature: '生灵', 'black and white': '黑白', abstract: '抽象' };
  var esc = Shelf.esc;
  function up(u) { return String(u || '').replace(/(^|,\s*)\.\//g, '$1../../'); }

  var PHOTOS = (window.FY_PHOTOS || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date) || a.id - b.id; }).map(function (p) {
    return { key: 'f' + p.id, id: p.id, loc: p.loc, year: p.date.slice(0, 4), cats: [p.cat], cat: p.cat, src: up(p.src), srcset: up(p.srcset),
      dateLabel: p.date.slice(2, 7).replace('-', '·'), rot: ((p.id * 53) % 9 - 4) * 0.6 };
  });
  var YEARS = [];
  for (var y = +PHOTOS[0].year; y >= +PHOTOS[PHOTOS.length - 1].year; y--) YEARS.push(String(y));
  var counts = {};
  PHOTOS.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
  var CATS = [{ id: 'all', en: 'all', zh: '全部' }].concat(Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })
    .map(function (c) { return { id: c, en: CAT_EN[c] || c, zh: CAT_ZH[c] || c }; }));
  var ROWS = 3;

  function polEl(p) {
    var d = document.createElement('div');
    d.className = 'pol'; d.dataset.key = p.key; d.dataset.year = p.year;
    d.style.setProperty('--rot', p.rot.toFixed(2) + 'deg');
    d.innerHTML = '<div class="pol-in"><span class="pol-peg" aria-hidden="true"></span><button type="button" class="pol-card" title="' + esc(p.loc + ' · ' + p.dateLabel) +
      '" aria-label="' + esc('View photo · 放大照片: ' + p.loc + ', ' + p.year) + '"><span class="pol-win"><img src="' + p.src + '" srcset="' + p.srcset +
      '" sizes="84px" width="400" height="300" alt="' + esc(p.loc) + '" loading="lazy" decoding="async"></span><span class="pol-date">' + p.dateLabel + '</span></button></div>';
    return d;
  }

  function create(host) {
    host.classList.add('rack');
    host.innerHTML = '<div class="rack-main"><div class="rack-clip"><div class="rack-row"></div></div></div>';
    var main = host.querySelector('.rack-main'), row = host.querySelector('.rack-row');
    var engine = Reflow.create(row, { hang: true }), els = new Map(), byKey = {}, visible = PHOTOS.slice(), lastPred = null;
    PHOTOS.forEach(function (p) { var el = polEl(p); row.appendChild(el); els.set(p.key, el); byKey[p.key] = p; engine.add(p.key, el, false); });
    var more = document.createElement('div');
    more.className = 'pol pol-more'; more.dataset.key = 'more';
    more.innerHTML = '<div class="pol-in"><span class="pol-peg" aria-hidden="true"></span><div class="pol-tag"><span class="pm-n"></span><span class="pm-en">more on the line</span><span class="pm-zh" lang="zh"></span></div></div>';
    row.appendChild(more); engine.add('more', more, false);

    // Prints stretch so each line is filled edge to edge; ROWS lines are shown and the "more" tag
    // takes the last peg when the rest does not fit.
    var per = 1;
    function fit() {
      var cs = getComputedStyle(host), rs = getComputedStyle(row), w = row.clientWidth - parseFloat(rs.paddingLeft) - parseFloat(rs.paddingRight);
      var min = parseFloat(cs.getPropertyValue('--pmin')) || 84, gx = parseFloat(rs.columnGap) || 12;
      per = Math.max(1, Math.floor((w + gx) / (min + gx)));
      host.style.setProperty('--pw', ((w - (per - 1) * gx) / per - 0.5).toFixed(2) + 'px');
    }
    function cap(n) { fit(); var max = per * ROWS; return n > max ? max - 1 : n; }
    function apply(pred, o) {
      o = o || {}; lastPred = pred;
      var all = PHOTOS.filter(pred), k = cap(all.length), keys = [];
      visible = all;
      all.slice(0, k).forEach(function (p) { keys.push(p.key); });
      if (k < all.length) {
        keys.push('more');
        more.querySelector('.pm-n').textContent = '+' + (all.length - k);
        more.querySelector('.pm-zh').textContent = '还有 ' + (all.length - k) + ' 张';
      }
      engine.set(keys, { origin: o.origin, instant: o.instant });
      host.classList.toggle('is-empty', !all.length);
      host.querySelector('.rack-clip').dataset.empty = o.emptyNote || 'Nothing on the line for this stretch · 这段时间没拍';
      return visible;
    }
    function hint(pred) {
      els.forEach(function (el, k) { el.classList.toggle('is-hint', !!pred && pred(byKey[k])); });
    }
    if (window.ResizeObserver) {
      var lw = 0;
      new ResizeObserver(function () { var w = row.clientWidth; if (lastPred && Math.abs(w - lw) > 1) { lw = w; apply(lastPred); } lw = w; }).observe(row);
    }
    return {
      kind: 'rack', cats: CATS, years: YEARS, items: PHOTOS, host: host, main: main, row: row, engine: engine,
      noun: { one: 'frame', many: 'frames', zh: '张' }, apply: apply, hint: hint, visible: function () { return visible; }
    };
  }

  window.Rack = { PHOTOS: PHOTOS, YEARS: YEARS, CATS: CATS, create: create };
})();
