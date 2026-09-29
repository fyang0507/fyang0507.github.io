/* 05 · corkboard — wiring: builds the four boards, the wordmark underlines, and the replay buttons. */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  var a = FYCork.build($('board-a'), { mode: 'physics', order: 'projects · drag →', notes: true, viewportLabel: 'Project board, Fred Agent first. Drag, or use the arrow keys to step card to card' });
  var A = FYPhysics(a);
  var p = FYCork.build($('board-phone'), { mode: 'physics', order: 'projects · swipe →', notes: true, viewportLabel: 'Project board on a phone. Swipe sideways' });
  var AP = FYPhysics(p);
  var b = FYCork.build($('board-b'), { mode: 'string', order: 'projects · scroll →', notes: true });
  var B = FYString(b);
  var c = FYCork.build($('board-c'), { mode: 'unpin', order: 'projects · scroll →', leadTag: 'article', viewportLabel: 'Project board. Choose a card to unpin it and read its field note' });
  var C = FYUnpin(c);

  /* The recommended wordmark: flat ink, one coral pen pass under "Agent", drawn once on arrival.
     Seeded by the project, so every board and every visit gets the same stroke. */
  var marks = [];
  // At dashoffset = L the round cap of the hidden dash still paints a dot at the stroke's start; nudge it off.
  function hideCap(api) { var p = api.svg.firstChild, L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 6); p.style.strokeDashoffset = L + 3; }
  function underline(el) {
    if (!el) return;
    var api = Pen.annotate(el, 'underline', { manual: true, seed: 'fred-agent-wordmark', width: 3, gap: -2, color: 'var(--mark)' });
    hideCap(api);
    var m = { api: api, shown: false, show: function () { m.shown = true; api.show(); }, hide: function () { m.shown = false; api.hide(); } };
    marks.push(m);
    new IntersectionObserver(function (en, io) {
      if (en[0].isIntersecting) { io.disconnect(); setTimeout(m.show, 260); }
    }, { threshold: 0.6 }).observe(el);
  }
  [a, p, c].forEach(function (k) { underline(k.root.querySelector('.wm-mark')); });
  underline($('wm-demo'));
  // Relayout rebuilds the stroke at the new size; an already-drawn stroke stays drawn, without replaying.
  new ResizeObserver(function () {
    marks.forEach(function (m) { m.api.rebuild(); if (m.shown) m.api.svg.firstChild.style.strokeDashoffset = 0; else hideCap(m.api); });
  }).observe(document.body);

  // The fling button sits below the phone stage; bring the board into view first (offscreen boards sleep).
  window.replayA = function () {
    a.root.scrollIntoView({ block: 'center' });
    A.go(0, true);
    setTimeout(function () { A.fling(2600); }, 350);
  };
  window.replayB = function () { B.replay(); };
  window.replayC = function () { if (!C.isOpen()) C.open('audio-processing-cli'); };
  window.replayW = function () { var m = marks[marks.length - 1]; m.hide(); setTimeout(function () { hideCap(m.api); m.show(); }, 260); };
  window.__05 = { A: A, AP: AP, B: B, C: C };
})();
