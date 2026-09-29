/* r3-03-app.js — mounts the Writing page in every .wr: the intro (copied from the live page), the bookcase
   (r3-03-case + r3-03-pull + r3-03-reflow) and the index. The bookcase is handed to r2-03's filter controller
   (r2-03-filter.js, loaded unchanged) as its "collection":
     { kind, cats, years, items, noun, host, index: { tabs, years, orient }, apply(pred, o), hint(pred) }
   Layout is chosen from the instance's width: ≥ 760 px = bookcase with the index at its side, planks enough
   for all 27 books; narrower = the phone: the index as one strip above r2-04 A's swipe shelf.
   Also: the replay demo (the same code paths a hand uses) and window.R3 for the verification runner. */
(function () {
  var K = window.ShelfKit, POSTS = K.ALL;
  var INTRO = '<header class="wx-intro"><div><div class="wx-kicker"><span class="wx-no">01</span><span class="wx-en" lang="en">writing</span></div>' +
    '<div class="wx-title" lang="zh" role="heading" aria-level="3">在<span class="wx-mark">写</span>。</div></div>' +
    '<div class="wx-note"><span lang="zh">不得中行而与之，必也<span class="beat">狂狷</span>乎。</span>' +
    '<span lang="en"><span class="beat">Action</span>, not understanding, changes the world.</span></div></header>';
  // Desk: spines ×1.62 wide, 280 px planks (live: ×1, 221 px). Phone: r2-04 M's strip at ×1.2.
  var DESK = { k: 1.62, rowH: 280, P: 4400, eye: 430, head: 20, gapR: 14, top: 16, bottom: 18, padX: 14, sk: 1.45, coverW: 200, faceH: 420, overlap: 34 };
  var PHONE = { strip: true, k: 1.2, rowH: 232, P: 3400, eye: 470, bottom: 40, sk: 1.12, coverW: 158, faceH: 300, overlap: 70, minTop: 58, tap: true, height: 346 };

  var counts = {};
  POSTS.forEach(function (p) { p.tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
  var CATS = [{ id: 'all', en: 'all', zh: '全部' }].concat(Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })
    .map(function (t) { return { id: t, en: t, zh: K.TAG_ZH[t] }; }));
  var YEARS = [];
  for (var y = +POSTS[0].year; y >= +POSTS[POSTS.length - 1].year; y--) YEARS.push(String(y));

  function mount(wr) {
    var phone = wr.clientWidth < 760;
    wr.classList.toggle('is-phone', phone);
    wr.innerHTML = (wr.dataset.intro === '0' ? '' : INTRO) + '<div class="wr-body"><div class="wr-case"></div><aside class="wr-index" aria-label="Index · 索引">' +
      '<div class="ix-head"></div><div class="ix-tabs"></div><div class="ix-years"></div></aside></div>';
    var caseHost = wr.querySelector('.wr-case'), cfg = Object.assign({}, phone ? PHONE : DESK);
    if (phone) caseHost.style.height = cfg.height + 'px';
    else cfg.rows = window.Case3.rowsFor(POSTS, cfg.k, caseHost.clientWidth, cfg.padX);
    var sh = window.Case3(caseHost, POSTS, cfg);
    if (phone) {
      var cue = document.createElement('div');
      cue.className = 'case-cue'; cue.innerHTML = 'tap a spine ↓<span>点一下书脊</span>'; caseHost.appendChild(cue);
      cfg.onConsider = function (i) { cue.classList.toggle('off', i >= 0); };
    }
    var pull = window.Pull3(wr, sh, cfg);
    var engine = window.Reflow3.create({
      relayout: function (items) { sh.slots(items.map(function (it) { return it.ref; })); },
      paint: function (it) { sh.place(it.ref, it.ref.st); },
      show: function (it, mode) { sh.show(it.ref, mode); },
      pos: sh.pos,
      drop: function (it) { return Math.max(12, Math.min(50 * cfg.k, sh.clear(it.ref) - 6)); },
      onFrame: function () { pull.bird.tick(); },
      onSettle: function () { sh.settle(); }
    });
    sh.books.forEach(function (b) { engine.add(b.post.key, b, true); });
    sh.layout();
    pull.bird.home(); pull.roving();

    var items = POSTS.map(function (p, i) { return { key: p.key, cats: p.tags, year: p.year, post: p, b: sh.books[i] }; });
    var byBook = new Map(items.map(function (it) { return [it.b, it]; }));
    var col = {
      kind: 'shelf', cats: CATS, years: YEARS, items: items, host: wr,
      noun: { one: 'essay', many: 'essays', zh: '篇' },
      index: { tabs: wr.querySelector('.ix-tabs'), years: wr.querySelector('.ix-years'), orient: phone ? 'strip' : 'side' },
      apply: function (pred, o) {
        o = o || {};
        var keep = items.filter(pred), want = new Set(keep.map(function (it) { return it.key; }));
        pull.rest();
        pull.bird.evict(function (i) { return !want.has(sh.books[i].post.key); });
        var res = engine.set(keep.map(function (it) { return it.key; }), { instant: o.instant });
        if (res.changed) {
          setTimeout(function () { pull.bird.jolt(); }, 280 * K.SLOW());
          if (sh.strip && sh.view.scrollLeft > 0) sh.view.scrollTo({ left: 0, behavior: Pen.reduced() ? 'auto' : 'smooth' });
        }
        var note = o.emptyNote || 'Nothing on this stretch of shelf · 这一段书架是空的', parts = note.split(' · ');
        sh.showEmpty(keep.length ? '' : parts[0] + '<span lang="zh">' + (parts[1] || '') + '</span>');
        pull.roving();
        return keep;
      },
      hint: function (pred) { pull.hint(pred ? function (b) { return pred(byBook.get(b)); } : null); }
    };
    var f = window.Filter.create(col, { mode: 'range', readoutHost: wr.querySelector('.ix-head') });
    var hint = wr.parentNode.querySelector('.hint');
    if (hint) hint.textContent = phone ? 'tap a tab · drag across the years · tap a spine ↗' : 'pick a tab · drag down the years · point at a spine ↗';
    return { wr: wr, phone: phone, rows: cfg.rows || 1, sh: sh, pull: pull, engine: engine, f: f, col: col };
  }

  var R3 = {};
  document.querySelectorAll('.wr').forEach(function (wr) { R3[wr.dataset.inst] = mount(wr); });
  window.R3 = R3;
  // The board's reduced-motion switch, flipped mid-reflow: land every book now.
  document.addEventListener('mock:rm', function () { if (Pen.reduced()) Object.keys(R3).forEach(function (id) { R3[id].engine.snap(); }); });

  // Re-mount only when the layout itself changes (phone ↔ side, or a different number of planks);
  // otherwise re-place the same books at the new width.
  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      Object.keys(R3).forEach(function (id) {
        var m = R3[id], wr = m.wr, phone = wr.clientWidth < 760;
        var rows = phone ? 1 : window.Case3.rowsFor(POSTS, DESK.k, wr.querySelector('.wr-case').clientWidth, DESK.padX);
        if (m.pull.read.open || m.pull.busy) return;
        if (phone !== m.phone || rows !== m.rows) { R3[id] = mount(wr); return; }
        m.pull.rest(); m.engine.snap(); m.sh.layout(); m.pull.render(); m.pull.bird.home();
      });
    }, 160);
  });

  // ---- replay: tag, then drag a span, then pull a book, then a sunk tab (the years give way), 2020, clear ----
  var runs = [];
  function run(steps) { runs.forEach(clearTimeout); var t = 0; runs = steps.map(function (s) { t += s[0]; return setTimeout(s[1], t); }); }
  function bookOf(m, zh) { return m.sh.books.findIndex(function (b) { return b.post.zh === zh; }); }
  window.replayA = function () {
    var m = R3.d; if (!m || m.pull.read.open) return;
    var st = m.wr.closest('.stage');
    if (st.getBoundingClientRect().top < 0 || st.getBoundingClientRect().top > 120) st.scrollIntoView({ behavior: Pen.reduced() ? 'auto' : 'smooth', block: 'start' });
    m.f.clear();
    run([[500, function () { m.f.pickCat('travel log'); }], [1700, function () { m.f.dragYears('2019', '2015', 1200); }],
      [2400, function () { m.pull.consider(bookOf(m, '纽约层积')); }], [2600, function () { m.pull.consider(-1); }],
      [1200, function () { m.f.pickCat('commentary'); }], [2300, function () { m.f.clickYear('2020'); }],
      [2100, function () { m.f.clear(); }]]);
  };
})();
