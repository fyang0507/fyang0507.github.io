/* 04-shelf-m.js — M: candidate B on a 390px phone. The shelf stays a shelf: all 27 spines as one
   horizontal strip with native swipe and soft snap. First tap tips the book and raises its slip (the
   strip recentres so the slip has room); a second tap on the book or the slip opens it. */
(function () {
  var K = window.ShelfKit;
  var screen = document.getElementById('phone-screen');
  var scroll = screen.querySelector('.m-scroll');
  var cue = screen.querySelector('.m-cue');
  var M = window.SlipShelf(screen, {
    posts: K.ALL, rowH: 250, scale: 1.28, tap: true, host: scroll, slipW: 214, tip: 14,
    onConsider: function (i) {
      cue.classList.toggle('off', i >= 0);
    }
  });
  window.__M = M;
  window.replayM = function () { M.replay(6); };
})();
