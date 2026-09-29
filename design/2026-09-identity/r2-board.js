/* r2-board.js — round 2's board: the re-carved seal (B · 印) in context, and the two questions round 1 left open.
   · .fr[data-src]: an r2-frame.html (or r1 01-frame.html) context of data-w × data-h CSS px, drawn at data-scale.
   · .fr[data-home]: the real home page. Production carries round 2's lockup, so nothing is put into it; its own
     lib/home/identity.js answers the real opener ([data-op]) exactly as a first visit would.
   · .fr[data-reading=portrait|seal]: the real Reading page with its compact header's mark set to one or the other
     (question a), so the comparison holds whichever Fred keeps. data-theme picks light or dark.
   · [data-play] replays the arrival in every frame marked data-replay; ?rm=1 previews reduced motion. */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search), RM = q.get('rm') === '1';
  var HOME = '../../index.html?opx=1&opener=none';                                    // LIVE: the real home
  var READING = '../../Reading.dc.html?post=2025-12-06_the-stories-we-live-05&theme=';  // LIVE: a real essay
  var PORTRAIT = '<img class="brand-mark" src="favicon.png" width="34" height="34" alt="Fred Yang">';

  function frame(box) {
    var w = +box.dataset.w, h = +box.dataset.h, s = +(box.dataset.scale || 1), f = document.createElement('iframe');
    // data-crop: a real viewport of data-h, shown only down to data-crop (Reading's header over its cover)
    box.style.width = Math.round(w * s) + 'px'; box.style.height = Math.round((+box.dataset.crop || h) * s) + 'px';
    f.width = w; f.height = h; f.style.width = w + 'px'; f.style.height = h + 'px';
    if (s !== 1) f.style.transform = 'scale(' + s + ')';
    f.loading = box.hasAttribute('data-eager') ? 'eager' : 'lazy';
    f.title = box.dataset.title || 'identity frame';
    if (box.dataset.home) { f.src = HOME; f.addEventListener('load', function () { quiet(f); }); }
    else if (box.dataset.reading) { f.src = READING + (box.dataset.theme || 'light'); f.addEventListener('load', function () { reading(f, box.dataset.reading); }); }
    else f.src = box.dataset.src + (RM ? (box.dataset.src.indexOf('?') < 0 ? '?' : '&') + 'rm=1' : '');
    box.appendChild(f);
    box.frame = f;
  }
  // a live page inside the board: its links stay put, and the reduced-motion preview reaches it
  function quiet(f) {
    var w = f.contentWindow;
    w.document.addEventListener('click', function (e) { if (e.target.closest('a')) e.preventDefault(); }, true);
    if (RM && w.Motion) w.Motion.reduced = function () { return true; };
  }
  function reading(f, which) {
    quiet(f);
    var d = f.contentWindow.document, m = d.querySelector('.brand-mark');
    if (!m) return;
    if (which === 'portrait') { m.insertAdjacentHTML('afterend', PORTRAIT); m.remove(); }
    else { m.insertAdjacentHTML('afterend', window.R2.mark('brand-mark', 'Fred Yang')); m.remove(); }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.play) document.querySelectorAll('.fr[data-replay]').forEach(function (box) {
      var w = box.frame && box.frame.contentWindow;
      if (w && w.FRAME) w.FRAME.arrive();
    });
    if (b.dataset.op) {
      var box = document.querySelector('.fr[data-home][data-w="' + b.dataset.op + '"]'), w = box && box.frame && box.frame.contentWindow;
      if (w && w.OPX) { box.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(function () { w.OPX.play('first'); }, 350); }
    }
  });

  var rm = document.getElementById('rm');
  if (rm) {
    rm.checked = RM;
    rm.addEventListener('change', function () { var u = new URL(location.href); if (rm.checked) u.searchParams.set('rm', '1'); else u.searchParams.delete('rm'); location.href = u; });
  }
  if (RM) document.querySelectorAll('[data-op]').forEach(function (b) { b.disabled = true; b.title = 'reduced motion never plays the opener'; });
  document.querySelectorAll('.fr').forEach(frame);
})();
