/* r4-03-app.js — mounts the Writing page in every .wr at a chosen size (27 real / 60 / 120 with synthetic
   essays, r4-03-data.js) and growth rule ('grow' = add planks, 'cap' = today's planks, then flat stacks).
   As in round 3, the bookcase is handed to r2-03's filter controller (r2-03-filter.js, unchanged) as its
   collection, with r3-03's tabs / ledger / readout (unchanged) drawing on r4-02's pen (r4-02-tier.js).
   Round 4 wiring: the side index sticks beside a tall case and sizes its ledger to the viewport; when a
   filter runs and the top of the case is scrolled away, the page returns to it (the books gather there);
   engine frame times are kept for the verification runner (window.R4.<id>.stats). */
(function () {
  var K = window.ShelfKit, D = window.R4Data;
  var INTRO = '<header class="wx-intro"><div><div class="wx-kicker"><span class="wx-no">01</span><span class="wx-en" lang="en">writing</span></div>' +
    '<div class="wx-title" lang="zh" role="heading" aria-level="3">在<span class="wx-mark">写</span>。</div></div>' +
    '<div class="wx-note"><span lang="zh">不得中行而与之，必也<span class="beat">狂狷</span>乎。</span>' +
    '<span lang="en"><span class="beat">Action</span>, not understanding, changes the world.</span></div></header>';
  var DESK = { k: 1.62, rowH: 280, P: 4400, eye: 430, head: 20, gapR: 14, top: 16, bottom: 18, padX: 14, sk: 1.45, coverW: 200, faceH: 420, overlap: 34 };
  var PHONE = { strip: true, k: 1.2, rowH: 232, P: 3400, eye: 470, bottom: 40, sk: 1.12, coverW: 158, faceH: 300, overlap: 70, minTop: 58, tap: true, height: 346 };

  function catsOf(posts) {
    var c = {};
    posts.forEach(function (p) { p.tags.forEach(function (t) { c[t] = (c[t] || 0) + 1; }); });
    return [{ id: 'all', en: 'all', zh: '全部' }].concat(Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).map(function (t) { return { id: t, en: t, zh: K.TAG_ZH[t] }; }));
  }
  function yearsOf(posts) {
    var ys = posts.map(function (p) { return +p.year; }), out = [];
    for (var y = Math.max.apply(null, ys); y >= Math.min.apply(null, ys); y--) out.push(String(y));
    return out;
  }
  // The capped case (b) keeps the planks today's 27 essays need at this width.
  function capFor(width) { return window.Case4.rowsFor(K.ALL, Object.assign({}, DESK, { rule: 'grow' }), width).rows; }

  function mount(wr, n, rule) {
    var posts = D.build(n), phone = wr.clientWidth < 760, CATS = catsOf(posts), YEARS = yearsOf(posts);
    wr.classList.toggle('is-phone', phone); wr.classList.toggle('dense-years', phone && YEARS.length > 14);
    wr.innerHTML = (wr.dataset.intro === '0' ? '' : INTRO) + '<div class="wr-body"><div class="wr-case"></div><aside class="wr-index" aria-label="Index · 索引">' +
      '<div class="ix-head"></div><div class="ix-tabs"></div><div class="ix-years"></div></aside></div>';
    var caseHost = wr.querySelector('.wr-case'), cfg = Object.assign({}, phone ? PHONE : DESK, { rule: rule }), sh = null;
    // The part of this page you can see (the board's phone frame scrolls on its own): the open and the reading
    // page happen there, whatever the height of the case.
    var frame = document.createElement('div'); frame.className = 'rd-frame'; wr.appendChild(frame);
    function region() { var sc = wr.closest('.phone-screen'); return sc ? sc.getBoundingClientRect() : { top: stickOf(wr), bottom: window.innerHeight }; }
    cfg.frame = frame;
    cfg.fitFrame = function () {
      var c = region(), w = wr.getBoundingClientRect(), top = Math.max(0, c.top - w.top), bot = Math.min(w.height, c.bottom - w.top);
      frame.style.top = top + 'px'; frame.style.height = Math.max(240, bot - top) + 'px';
    };
    cfg.visible = function () { var c = region(), v = sh.view.getBoundingClientRect(); return { top: Math.max(0, c.top - v.top), bottom: Math.min(sh.view.clientHeight, c.bottom - v.top) }; };
    if (phone) caseHost.style.height = cfg.height + 'px';
    else { cfg.cap = capFor(caseHost.clientWidth); cfg.rows = window.Case4.rowsFor(posts, cfg, caseHost.clientWidth).rows; }
    sh = window.Case4(caseHost, posts, cfg);
    if (phone) {
      var cue = document.createElement('div');
      cue.className = 'case-cue'; cue.innerHTML = 'tap a spine ↓<span>点一下书脊</span>'; caseHost.appendChild(cue);
      cfg.onConsider = function (i) { cue.classList.toggle('off', i >= 0); };
    }
    var pull = window.Pull4(wr, sh, cfg), stats = [];
    var engine = window.Reflow4.create({
      relayout: function (items) { sh.slots(items.map(function (it) { return it.ref; })); },
      paint: function (it) { sh.place(it.ref, it.ref.st); },
      show: function (it, mode) { sh.show(it.ref, mode); },
      pos: sh.pos,
      drop: function (it) { return Math.max(12, Math.min(50 * cfg.k, sh.clear(it.ref) - 6)); },
      moved: function (it) { return sh.moved(it.ref); },
      teleport: function (it) { pull.settle(it.ref); },
      flat: function (it) { return it.ref.flat; },
      onFrame: function () { pull.bird.tick(); },
      onSettle: function () { sh.settle(); }
    });
    var frame0 = engine.frame;                                            // frame cost, for the runner
    engine.frame = function (now) { var t = performance.now(); frame0(now); stats.push(performance.now() - t); if (stats.length > 600) stats.shift(); };
    sh.books.forEach(function (b) { engine.add(b.post.key, b, true); });
    sh.layout(); pull.settleAll();
    pull.bird.home(); pull.roving();

    var items = posts.map(function (p, i) { return { key: p.key, cats: p.tags, year: p.year, post: p, b: sh.books[i] }; });
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
        var perch = pull.bird.perch;
        if (perch >= 0 && sh.books[perch].flat) pull.bird.consider(-1, 0);
        if (res.changed) {
          setTimeout(function () { pull.bird.jolt(); }, 280 * K.SLOW());
          if (sh.strip && sh.view.scrollLeft > 0) sh.view.scrollTo({ left: 0, behavior: Pen.reduced() ? 'auto' : 'smooth' });
          // The books gather at the top of the case: if that is scrolled away, go back to it.
          var top = caseHost.getBoundingClientRect().top, stick = stickOf(wr);
          if (!sh.strip && !o.instant && top < stick - 4) window.scrollTo({ top: window.scrollY + top - stick - 8, behavior: Pen.reduced() ? 'auto' : 'smooth' });
        }
        var note = o.emptyNote || 'Nothing on this stretch of shelf · 这一段书架是空的', parts = note.split(' · ');
        sh.showEmpty(keep.length ? '' : parts[0] + '<span lang="zh">' + (parts[1] || '') + '</span>');
        pull.roving();
        return keep;
      },
      hint: function (pred) { pull.hint(pred ? function (b) { return pred(byBook.get(b)); } : null); }
    };
    var f = window.Filter.create(col, { mode: 'range', readoutHost: wr.querySelector('.ix-head') });
    fitLedger(wr, YEARS.length, phone);
    var hint = wr.parentNode.querySelector('.hint');
    if (hint) hint.textContent = phone ? 'tap a spine, then tap the book · drag across the years ↗' : 'point at a spine, click the book that comes out · drag down the years ↗';
    return { wr: wr, n: n, rule: rule, phone: phone, rows: cfg.rows || 1, cap: cfg.cap, sh: sh, pull: pull, engine: engine, f: f, col: col, stats: stats, posts: posts };
  }
  function stickOf(wr) { return parseFloat(getComputedStyle(wr).getPropertyValue('--stick')) || 12; }
  // The sticky index must fit the viewport: the ledger's rows share whatever height the tabs leave.
  function fitLedger(wr, N, phone) {
    wr.style.setProperty('--ny', N);
    if (phone) return;
    var ix = wr.querySelector('.wr-index'), tr = wr.querySelector('.lg-track'), stick = stickOf(wr);
    var rest = ix.offsetHeight - tr.offsetHeight, room = window.innerHeight - stick - 14 - rest;
    wr.style.setProperty('--rh', Math.max(16, Math.min(21.5, room / N)).toFixed(2) + 'px');
  }

  var P = new URLSearchParams(location.search), R4 = {}, state = { n: +P.get('n') || 27, rule: P.get('rule') === 'cap' ? 'cap' : 'grow' };
  if (D.COUNTS.indexOf(state.n) < 0) state.n = 27;
  function mountAll() { document.querySelectorAll('.wr').forEach(function (wr) { R4[wr.dataset.inst] = mount(wr, state.n, state.rule); }); }
  mountAll();
  window.R4 = R4; window.R4state = state;
  document.addEventListener('mock:rm', function () { if (Pen.reduced()) Object.keys(R4).forEach(function (id) { R4[id].engine.snap(); }); });
  // The eye travels with the reader down a tall case (r4-03-case.js sh.follow).
  var fr = 0;
  function follow() {
    fr = 0;
    Object.keys(R4).forEach(function (id) {
      var m = R4[id]; if (m.phone || m.wr.closest('.phone-screen')) return;
      var c = m.wr.querySelector('.wr-case').getBoundingClientRect(), off = Math.max(0, stickOf(m.wr) - c.top);
      m.sh.follow(off, -c.top, -c.top + window.innerHeight); m.pull.bird.tick();
    });
  }
  window.addEventListener('scroll', function () { if (!fr) fr = requestAnimationFrame(follow); }, { passive: true });

  // ---- the stress switch (board only) ----
  function syncBar() {
    document.querySelectorAll('.sx-b').forEach(function (b) {
      var on = b.dataset.n ? +b.dataset.n === state.n : b.dataset.rule === state.rule;
      b.setAttribute('aria-pressed', String(on));
    });
    var note = document.querySelector('.sx-note');
    if (note) {
      var d = R4.d, syn = state.n - K.ALL.length;
      note.textContent = (syn > 0 ? syn + ' synthetic · 模拟 · ' : 'all real · ') + (d.phone ? 'one swipe strip' : d.sh.used + ' planks' + (state.rule === 'cap' ? ' (cap ' + d.cap + ')' : ''));
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.sx-b'); if (!b) return;
    if (b.dataset.n) state.n = +b.dataset.n; else state.rule = b.dataset.rule;
    mountAll(); syncBar(); follow();
  });
  syncBar();

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      Object.keys(R4).forEach(function (id) {
        var m = R4[id], wr = m.wr, phone = wr.clientWidth < 760;
        if (m.pull.read.open || m.pull.busy) return;
        var w = wr.querySelector('.wr-case').clientWidth, cap = phone ? 0 : capFor(w);
        var rows = phone ? 1 : window.Case4.rowsFor(m.posts, Object.assign({}, DESK, { rule: m.rule, cap: cap }), w).rows;
        if (phone !== m.phone || rows !== m.rows || cap !== m.cap) { R4[id] = mount(wr, m.n, m.rule); return; }
        m.pull.rest(); m.engine.snap(); m.sh.layout(); m.pull.settleAll(); m.pull.bird.home(); fitLedger(wr, m.col.years.length, phone);
      });
      syncBar();
    }, 160);
  });

  // ---- replay: a tag, a span of years, pull a book, clear ----
  var runs = [];
  function run(steps) { runs.forEach(clearTimeout); var t = 0; runs = steps.map(function (s) { t += s[0]; return setTimeout(s[1], t); }); }
  window.replayA = function () {
    var m = R4.d; if (!m || m.pull.read.open) return;
    var st = m.wr.closest('.stage');
    st.scrollIntoView({ behavior: Pen.reduced() ? 'auto' : 'smooth', block: 'start' });
    m.f.clear();
    var ys = m.col.years;
    run([[600, function () { m.f.pickCat('travel log'); }], [1800, function () { m.f.dragYears(ys[Math.floor(ys.length * .55)], ys[ys.length - 1], 1200); }],
      [2600, function () { var o = m.sh.books.filter(function (b) { return b.vis && b.rf.mode === 'in'; }); if (o[2]) m.pull.consider(o[2].i); }],
      [2600, function () { m.pull.consider(-1); }], [1200, function () { m.f.clear(); }]]);
  };
})();
