/* 03-shelf.js — the Writing bookshelf rebuilt from real data (window.FY_POSTS), shared by every
   candidate on board 03. Geometry, tones, series badges and the year ticks copy Writing.dc.html
   (see its decorate() at :410–449) so Fred judges filters against his own shelf, not a sketch.
   One deliberate change: the plank keeps its full length when books leave (min-width:100%), because
   a shelf does not get shorter when you take books off it. */
(function () {
  var TAG_ZH = { 'stories we live': '我们生活的故事', 'everyday chronicles': '日常记趣', 'travel log': '游记', 'commentary': '杂文', 'poem': '诗' };
  var TONES = ['#c9bda3', '#d8cbb0', '#b7ab8f', '#e4dac7'];
  var PRIMARY = Object.keys(TAG_ZH);
  function up(u) { return String(u || '').replace(/(^|,\s*)\.\//g, '$1../../'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var POSTS = (window.FY_POSTS || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (p, i) {
    var tags = [];
    (p.tags || []).concat(p.tagsZh || []).forEach(function (t) {
      var n = PRIMARY.find(function (k) { return t === k || t === TAG_ZH[k]; });
      if (n && tags.indexOf(n) < 0) tags.push(n);
    });
    var sm = p.title.match(/Our Stories\s+(\d+)/i) || p.titleZh.match(/故事\s*0?(\d+)/);
    var id = i + 1, series = sm ? Number(sm[1]) : null, len = Math.max(p.titleZh.length, p.title.length);
    return {
      id: id, key: 'p' + id, zh: p.titleZh, en: p.title, date: p.date, year: p.date.slice(0, 4), tags: tags, series: series,
      readingMin: p.readingMin, cover: up(p.cover), coverSrcset: up(p.coverSrcset),
      href: '../../Reading.dc.html?post=' + encodeURIComponent(p.id) + '&lang=zh',
      w: series ? 30 : 22 + (id % 4) * 4,
      h: series ? 0.96 : (58 + (id * 29) % 38) / 100,
      tone: series ? '#3d362a' : TONES[id % 4],
      fs: len > 11 ? Math.max(8.5, +(11 - (len - 11) * 0.12).toFixed(2)) : 11,
      dateLabel: p.date.slice(0, 7).replace('-', '·')
    };
  });
  var YEARS = [];
  POSTS.forEach(function (p) { if (YEARS.indexOf(p.year) < 0) YEARS.push(p.year); });
  var counts = {};
  POSTS.forEach(function (p) { p.tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
  var CATS = [{ id: 'all', en: 'all', zh: '全部' }].concat(Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })
    .map(function (t) { return { id: t, en: t, zh: TAG_ZH[t] }; }));

  function inCat(p, cat) { return cat === 'all' || p.tags.indexOf(cat) >= 0; }
  function tagLine(p) { return p.dateLabel + (p.tags.length ? ' · ' + p.tags.join(' · ') : '') + (p.readingMin ? ' · ~' + p.readingMin + ' min' : ''); }

  function bookEl(p, tickTag) {
    var d = document.createElement('div');
    d.className = 'book' + (p.series ? ' is-series' : '');
    d.dataset.key = p.key; d.dataset.year = p.year;
    d.style.cssText = '--w:' + p.w + 'px;--h:' + p.h + ';--tone:' + p.tone;
    d.innerHTML = '<a class="spine" href="' + p.href + '" title="' + esc(p.en + ' · ' + p.zh + ' · ' + p.dateLabel) + '" aria-label="' +
      esc('Read ' + p.en + ' — 阅读 ' + p.zh) + '"><span class="spine-title" style="font-size:' + p.fs + 'px">' + esc(p.zh) + '</span>' +
      (p.series ? '<span class="spine-num">0' + p.series + '</span>' : '') + '</a>' + tickHTML(p.year, tickTag);
    return d;
  }
  function tickHTML(year, tag) {
    return tag === 'button'
      ? '<div class="tick"><button type="button" class="tick-y" data-year="' + year + '" aria-pressed="false" tabindex="-1">' + year + '</button></div>'
      : '<div class="tick" aria-hidden="true"><span class="tick-y">' + year + '</span></div>';
  }
  function slotEl(year, tickTag) {
    var d = document.createElement('div');
    d.className = 'book slot'; d.dataset.key = 'y' + year; d.dataset.year = year;
    d.style.cssText = '--w:30px;--h:.001';
    d.innerHTML = tickHTML(year, tickTag);
    return d;
  }

  var BIRD_SEQ = [[1, 90, 0], [2, 95, .3], [3, 105, .4], [4, 90, .3], [5, 70, 0], [0, 90, 0]];

  // opts: { panel: bool, ticks: 'span' | 'button' | 'none', slots: bool }
  function create(host, opts) {
    opts = opts || {};
    host.classList.add('shelf');
    if (opts.ticks === 'none') host.classList.add('no-ticks');
    host.innerHTML = '<div class="shelf-main"><div class="shelf-scroll"><div class="shelf-row"></div></div></div>' +
      (opts.panel === false ? '' : '<aside class="shelf-panel" aria-label="Preview · 预览"></aside>');
    var main = host.querySelector('.shelf-main'), scroll = host.querySelector('.shelf-scroll'), row = host.querySelector('.shelf-row');
    var panel = host.querySelector('.shelf-panel');
    row.insertAdjacentHTML('beforeend', '<div class="tsuzuku" title="つづく · still writing"><span>つづく</span></div>');

    var engine = Reflow.create(row), els = new Map(), byKey = {}, visible = POSTS.slice();
    YEARS.forEach(function (y) {
      if (opts.slots) { var s = slotEl(y, opts.ticks); row.appendChild(s); els.set(s.dataset.key, s); engine.add(s.dataset.key, s, false); }
      POSTS.forEach(function (p) {
        if (p.year !== y) return;
        var b = bookEl(p, opts.ticks); row.appendChild(b); els.set(p.key, b); byKey[p.key] = p; engine.add(p.key, b, true);
      });
    });
    var bird = document.createElement('div');
    bird.className = 'shelf-bird'; bird.setAttribute('role', 'img'); bird.setAttribute('aria-label', 'a small bird on the shelf');
    bird.innerHTML = '<div class="bframe"></div>';
    row.appendChild(bird);
    var bframe = bird.firstChild, birdX = 52, birdDir = 1, hopping = false;

    function hop() {
      if (hopping || Pen.reduced()) return;
      hopping = true;
      if (birdX >= 96) birdDir = -1; else if (birdX <= 52) birdDir = 1;
      bird.style.transform = birdDir > 0 ? 'scaleX(-1)' : '';
      var i = 0;
      (function next() {
        if (i >= BIRD_SEQ.length) { hopping = false; return; }
        var f = BIRD_SEQ[i++];
        bframe.style.backgroundPosition = (f[0] * 20) + '% 0';
        birdX += f[2] * 7 * birdDir; bird.style.left = birdX + 'px';
        setTimeout(next, f[1]);
      })();
    }

    // Preview panel: the hovered/focused spine, else the first book on the shelf (as on the live page).
    var shown;
    function preview(p) {
      if (!panel || shown === (p || null)) return;
      shown = p || null;
      panel.innerHTML = p
        ? '<a class="prev" href="' + p.href + '" tabindex="-1" aria-hidden="true"><div class="warm-cover"><img src="' + p.cover + '" srcset="' + p.coverSrcset +
          '" sizes="236px" alt="" decoding="async"></div><div class="prev-body"><div class="prev-zh">' + esc(p.zh) + '</div><div class="prev-en" lang="en">' +
          esc(p.en) + '</div><div class="prev-meta">' + esc(tagLine(p)) + '</div></div></a>'
        : '<div class="prev prev-empty"><div class="prev-tz">つづく</div><div class="prev-meta">No matching essays · 没有符合条件的文章</div></div>';
      if (!Pen.reduced()) panel.firstChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' });
    }
    function bookOf(t) { var b = t.closest && t.closest('.book'); return b && !b.classList.contains('slot') && !b.classList.contains('is-leaving') ? byKey[b.dataset.key] : null; }
    row.addEventListener('pointerover', function (e) { var p = bookOf(e.target); if (p) preview(p); });
    row.addEventListener('focusin', function (e) { var p = bookOf(e.target); if (p) preview(p); });
    row.addEventListener('pointerleave', function () { preview(visible[0]); });

    // Apply a filter. pred(post) → bool. o.slotYears: Set of years that keep an empty slot (candidate B).
    function apply(pred, o) {
      o = o || {};
      var keys = [], seen = {};
      visible = [];
      YEARS.forEach(function (y) {
        if (o.slotYears && o.slotYears.has(y)) keys.push('y' + y);
        POSTS.forEach(function (p) { if (p.year === y && pred(p)) { keys.push(p.key); visible.push(p); } });
      });
      els.forEach(function (el) { el.classList.remove('first-y'); });
      keys.forEach(function (k) { var el = els.get(k), y = el.dataset.year; if (!seen[y]) { el.classList.add('first-y'); seen[y] = 1; } });
      var res = engine.set(keys, { origin: o.origin });
      if (res.changed) {
        setTimeout(hop, 170);   // the plank jolts when the first books land
        if (scroll.scrollLeft > 0) scroll.scrollTo({ left: 0, behavior: Pen.reduced() ? 'auto' : 'smooth' });
      }
      preview(visible[0]);
      host.classList.toggle('is-empty', !visible.length);
      return visible;
    }
    preview(visible[0]);
    host.querySelectorAll('.book:not(.slot)').forEach(function (b) {
      if (!host.querySelector('.book.first-y[data-year="' + b.dataset.year + '"]')) b.classList.add('first-y');
    });
    return { host: host, main: main, scroll: scroll, row: row, engine: engine, els: els, apply: apply, visible: function () { return visible; } };
  }

  window.Shelf = { POSTS: POSTS, YEARS: YEARS, CATS: CATS, TAG_ZH: TAG_ZH, inCat: inCat, create: create, esc: esc };
})();
