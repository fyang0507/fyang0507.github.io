/* r2-03-board.js — board bootstrap: build the Writing or Gallery page excerpt in every .wx, mount a
   collection (shelf or rack) plus the filter in the requested mode, and wire the replay buttons to
   scripted demos that drive the same code paths a hand does (ruler drags included). */
(function () {
  var INTRO = {
    writing: '<header class="wx-intro"><div><div class="wx-kicker"><span class="wx-no">01</span><span class="wx-en" lang="en">writing</span></div>' +
      '<div class="wx-title" lang="zh" role="heading" aria-level="3">在<span class="wx-mark">写</span>。</div></div>' +
      '<div class="wx-note"><span lang="zh">不得中行而与之，必也<span class="beat">狂狷</span>乎。</span>' +
      '<span lang="en"><span class="beat">Action</span>, not understanding, changes the world.</span></div></header>',
    gallery: '<header class="wx-intro"><div><div class="wx-kicker"><span class="wx-no">03</span><span class="wx-en" lang="en">shooting</span></div>' +
      '<div class="wx-title" lang="zh" role="heading" aria-level="3">在<span class="wx-mark">拍</span>。</div></div>' +
      '<div class="wx-note"><span lang="zh">人，岁月，生活。</span><span lang="en">People, Years, Life.</span></div></header>'
  };

  // Timed demo steps [[delayMs, fn], …]; starting a run cancels the previous one on that instance.
  var runs = {};
  function run(id, steps) {
    (runs[id] || []).forEach(clearTimeout);
    var t = 0; runs[id] = steps.map(function (s) { t += s[0]; return setTimeout(s[1], t); });
  }

  var F = {};
  document.querySelectorAll('.wx').forEach(function (wx) {
    var page = wx.dataset.page;
    wx.innerHTML = INTRO[page] + '<div class="wx-filter"></div><div class="wx-coll"></div>';
    var col = (page === 'gallery' ? Rack : Shelf).create(wx.querySelector('.wx-coll'));
    F[wx.dataset.inst] = Filter.create(col, { mode: wx.dataset.mode, readoutHost: wx.querySelector('.wx-filter') });
  });

  var DEMOS = {
    // Tag, then drag a span, then a sunk tab (the years give way), then a quiet year, then clear.
    a: function (f) {
      return [[300, function () { f.pickCat('travel log'); }], [1500, function () { f.dragYears('2019', '2015', 1100); }],
        [2300, function () { f.pickCat('commentary'); }], [2200, function () { f.clickYear('2017'); }],
        [2100, function () { f.clickYear('2020'); }], [1900, function () { f.clear(); }]];
    },
    g: function (f) {
      return [[300, function () { f.pickCat('people'); }], [1500, function () { f.dragYears('2025', '2023', 900); }],
        [2100, function () { f.pickCat('black and white'); }], [2100, function () { f.clear(); }]];
    },
    b: function (f) {
      return [[300, function () { f.pickCat('travel log'); }], [1400, function () { f.clickYear('2019'); }], [1100, function () { f.clickYear('2015'); }],
        [1300, function () { f.clickYear('2024'); }], [1500, function () { f.pickCat('poem'); }], [2000, function () { f.clear(); }]];
    }
  };
  ['a', 'g', 'b'].forEach(function (c) {
    window['replay' + c.toUpperCase()] = function () {
      var f = F[c + '-d']; if (!f) return;
      var el = f.col.host.closest('.fx-stage');
      if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: Pen.reduced() ? 'auto' : 'smooth' });
      f.clear(); run(c, DEMOS[c](f));
    };
  });
  window.R2F = F;   // for the verification runner
})();
