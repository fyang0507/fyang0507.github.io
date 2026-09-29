/* r2-04-boot.js — mounts the candidates. A (band) and B (peek) on desktop stages; each becomes the phone
   strip by itself when its stage is narrow. M is A inside a 390 px phone, for desktop viewers. */
(function () {
  var K = window.ShelfKit;
  var DESK = { rowH: 230, bottom: 110, eye: 660, P: 4400 }, STRIP = { rowH: 250, scale: 1.2, strip: true, bottom: 96, eye: 600, P: 3400 };
  function mount(stage, mode, extra) {
    var narrow = stage.clientWidth < 700;
    if (narrow) stage.querySelector('.hint').textContent = 'tap a spine, tap it again to open ↗';
    return window.PullShelf(stage, Object.assign({
      mode: mode, posts: narrow ? K.ALL : K.pick(K.SET18), tap: narrow, coverW: narrow ? 176 : 190, faceH: narrow ? 250 : 300,
      overlap: narrow ? 40 : 30, shelf: narrow ? STRIP : DESK
    }, extra || {}));
  }
  var A = mount(document.getElementById('stage-a'), 'band');
  var B = mount(document.getElementById('stage-b'), 'peek');
  var cue = document.getElementById('m-cue');
  var M = window.PullShelf(document.getElementById('phone-screen'), {
    host: document.getElementById('m-host'), mode: 'band', posts: K.ALL, tap: true, coverW: 176, faceH: 250, overlap: 40,
    shelf: Object.assign({}, STRIP, { bottom: 86 }), onConsider: function (i) { cue.classList.toggle('off', i >= 0); }
  });
  window.__A = A; window.__B = B; window.__M = M;
  window.replayA = function () { A.replay(A.sh.books.length > 20 ? 4 : 7); };
  window.replayB = function () { B.replay(4); };
  window.replayM = function () { M.replay(5); };
})();
