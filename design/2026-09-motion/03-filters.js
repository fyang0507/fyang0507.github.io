/* 03-filters.js — board bootstrap: build the Writing-page excerpt in every .wx, mount its candidate,
   wire the replay buttons to each candidate's scripted demo (desktop instance only). */
(function () {
  var FX = window.FX = window.FX || {};
  var INTRO = '<header class="wx-intro"><div><div class="wx-kicker"><span class="wx-no">01</span><span class="wx-en" lang="en">writing</span></div>' +
    '<div class="wx-title" lang="zh" role="heading" aria-level="3">在<span class="wx-mark">写</span>。</div></div>' +
    '<div class="wx-note"><span lang="zh">不得中行而与之，必也<span class="beat">狂狷</span>乎。</span>' +
    '<span lang="en"><span class="beat">Action</span>, not understanding, changes the world.</span></div></header>';

  // Timed demo steps [[delayMs, fn], …]; starting a new run cancels the previous one.
  var runs = {};
  FX.run = function (steps, id) {
    id = id || 'x';
    (runs[id] || []).forEach(clearTimeout);
    var t = 0; runs[id] = steps.map(function (s) { t += s[0]; return setTimeout(s[1], t); });
  };

  var apis = {};
  document.querySelectorAll('.wx').forEach(function (wx) {
    wx.innerHTML = INTRO + '<div class="wx-filter"></div><div class="wx-shelf"></div>';
    apis[wx.dataset.inst] = FX[wx.dataset.cand](wx, { filter: wx.querySelector('.wx-filter'), shelfHost: wx.querySelector('.wx-shelf') });
  });
  ['a', 'b', 'c'].forEach(function (c) {
    window['replay' + c.toUpperCase()] = function () {
      var api = apis[c + '-d']; if (!api) return;
      var el = document.getElementById('cand-' + c);
      if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: Pen.reduced() ? 'auto' : 'smooth' });
      api.demo();
    };
  });
  window.FX_APIS = apis;   // for the verification runner
})();
