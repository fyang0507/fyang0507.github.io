/* r2-03-shelf.js — the Writing bookshelf rebuilt from real data (window.FY_POSTS), copied from round 1
   (03-shelf.js) minus the year ticks: the years now live on their own labelled ruler under the plank.
   It exposes the same small "collection" interface as the Gallery rack (r2-03-rack.js), which is the
   whole point of the board: one filter component, two pages.
     collection = { kind, cats, years, items, noun, host, main, apply(pred, o), hint(pred|null) }
   Geometry, tones and series badges copy Writing.dc.html's decorate() (:410–449). */
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
      id: id, key: 'p' + id, zh: p.titleZh, en: p.title, date: p.date, year: p.date.slice(0, 4), cats: tags, series: series,
      readingMin: p.readingMin, cover: up(p.cover), coverSrcset: up(p.coverSrcset),
      href: '../../Reading.dc.html?post=' + encodeURIComponent(p.id) + '&lang=zh',
      w: series ? 30 : 22 + (id % 4) * 4,
      h: series ? 0.96 : (58 + (id * 29) % 38) / 100,
      tone: series ? '#3d362a' : TONES[id % 4],
      fs: len > 11 ? Math.max(8.5, +(11 - (len - 11) * 0.12).toFixed(2)) : 11,
      dateLabel: p.date.slice(0, 7).replace('-', '·')
    };
  });
  // Every calendar year from newest to oldest, including the quiet ones (2020 has no essays):
  // a ruler that skips a year is lying about time.
  var YEARS = [];
  for (var y = +POSTS[0].year; y >= +POSTS[POSTS.length - 1].year; y--) YEARS.push(String(y));
  var counts = {};
  POSTS.forEach(function (p) { p.cats.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
  var CATS = [{ id: 'all', en: 'all', zh: '全部' }].concat(Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })
    .map(function (t) { return { id: t, en: t, zh: TAG_ZH[t] }; }));

  function tagLine(p) { return p.dateLabel + (p.cats.length ? ' · ' + p.cats.join(' · ') : '') + (p.readingMin ? ' · ~' + p.readingMin + ' min' : ''); }

  function bookEl(p) {
    var d = document.createElement('div');
    d.className = 'book' + (p.series ? ' is-series' : '');
    d.dataset.key = p.key; d.dataset.year = p.year;
    d.style.cssText = '--w:' + p.w + 'px;--h:' + p.h + ';--tone:' + p.tone;
    d.innerHTML = '<a class="spine" href="' + p.href + '" title="' + esc(p.en + ' · ' + p.zh + ' · ' + p.dateLabel) + '" aria-label="' +
      esc('Read ' + p.en + ' — 阅读 ' + p.zh) + '"><span class="spine-title" style="font-size:' + p.fs + 'px">' + esc(p.zh) + '</span>' +
      (p.series ? '<span class="spine-num">0' + p.series + '</span>' : '') + '</a>';
    return d;
  }

  var BIRD_SEQ = [[1, 90, 0], [2, 95, .3], [3, 105, .4], [4, 90, .3], [5, 70, 0], [0, 90, 0]];

  function create(host) {
    host.classList.add('shelf');
    host.innerHTML = '<div class="shelf-main"><div class="shelf-scroll"><div class="shelf-row"></div></div></div>' +
      '<aside class="shelf-panel" aria-label="Preview · 预览"></aside>';
    var main = host.querySelector('.shelf-main'), scroll = host.querySelector('.shelf-scroll'), row = host.querySelector('.shelf-row');
    var panel = host.querySelector('.shelf-panel');
    row.insertAdjacentHTML('beforeend', '<div class="tsuzuku" title="つづく · still writing"><span>つづく</span></div>');

    var engine = Reflow.create(row), els = new Map(), byKey = {}, visible = POSTS.slice();
    POSTS.forEach(function (p) { var b = bookEl(p); row.appendChild(b); els.set(p.key, b); byKey[p.key] = p; engine.add(p.key, b, true); });
    var bird = document.createElement('div');
    bird.className = 'shelf-bird'; bird.setAttribute('role', 'img'); bird.setAttribute('aria-label', 'a small bird on the shelf');
    bird.innerHTML = '<div class="bframe"></div>';
    row.appendChild(bird);
    var bframe = bird.firstChild, birdX = 52, birdDir = 1, hopping = false;

    // The bird hops once when the first books land (hand's clock: six held frames).
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

    var shown, emptyNote = '';
    function preview(p) {
      if (shown === (p || null)) return;
      shown = p || null;
      panel.innerHTML = p
        ? '<a class="prev" href="' + p.href + '" tabindex="-1" aria-hidden="true"><div class="warm-cover"><img src="' + p.cover + '" srcset="' + p.coverSrcset +
          '" sizes="236px" alt="" decoding="async"></div><div class="prev-body"><div class="prev-zh">' + esc(p.zh) + '</div><div class="prev-en" lang="en">' +
          esc(p.en) + '</div><div class="prev-meta">' + esc(tagLine(p)) + '</div></div></a>'
        : '<div class="prev prev-empty"><div class="prev-tz">つづく</div><div class="prev-meta">' + (emptyNote || 'Nothing on this stretch of shelf · 这一段书架是空的') + '</div></div>';
      if (!Pen.reduced()) panel.firstChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' });
    }
    function bookOf(t) { var b = t.closest && t.closest('.book'); return b && !b.classList.contains('is-leaving') ? byKey[b.dataset.key] : null; }
    row.addEventListener('pointerover', function (e) { var p = bookOf(e.target); if (p) preview(p); });
    row.addEventListener('focusin', function (e) { var p = bookOf(e.target); if (p) preview(p); });
    row.addEventListener('pointerleave', function () { preview(visible[0]); });

    function apply(pred, o) {
      o = o || {};
      var keys = [];
      visible = POSTS.filter(pred);
      visible.forEach(function (p) { keys.push(p.key); });
      emptyNote = o.emptyNote || '';
      var res = engine.set(keys, { origin: o.origin, instant: o.instant });
      if (res.changed) {
        setTimeout(hop, 170);   // the plank jolts when the first books land
        if (scroll.scrollLeft > 0) scroll.scrollTo({ left: 0, behavior: Pen.reduced() ? 'auto' : 'smooth' });
      }
      if (!visible.length) shown = undefined;   // the empty note may have changed
      preview(visible[0]);
      host.classList.toggle('is-empty', !visible.length);
      return visible;
    }
    // Hovering a tab or a year lifts the books it would keep: the control points at the shelf.
    function hint(pred) {
      els.forEach(function (el, k) { el.classList.toggle('is-hint', !!pred && pred(byKey[k])); });
      host.classList.toggle('hinting', !!pred);
    }
    preview(visible[0]);
    return {
      kind: 'shelf', cats: CATS, years: YEARS, items: POSTS, host: host, main: main, scroll: scroll, row: row, engine: engine,
      noun: { one: 'essay', many: 'essays', zh: '篇' }, apply: apply, hint: hint, visible: function () { return visible; }
    };
  }

  window.Shelf = { POSTS: POSTS, YEARS: YEARS, CATS: CATS, TAG_ZH: TAG_ZH, create: create, esc: esc };
})();
