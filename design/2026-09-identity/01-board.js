/* 01-board.js — the round-1 identity board. Every lockup is live: 01-frame.html for page headers, still states and the
   lockups alone, and the real home page (../../index.html) with the candidate put into its header.
   · .fr[data-src] or .fr[data-home]: a frame of data-w × data-h CSS px (its own viewport, so the phone rules apply),
     drawn at data-scale. data-c names the lockup it shows.
   · [data-play=X] replays X's arrival in its frames marked data-replay; [data-op=X] plays the real opener on X's
     home frame (1440), which ends in the arrival, exactly as a first visit would.
   · ?rm=1 previews reduced motion: arrivals land at once, the opener doesn't play. */
(function () {
  'use strict';
  var q = new URLSearchParams(location.search), RM = q.get('rm') === '1';
  var HOME = '../../index.html?opx=1&opener=none';   // LIVE: the real home page
  var FILES = ['01-kit.js', '01-glyphs.js', '01-a-sign.js', '01-b-seal.js', '01-c-grid.js', '01-identity.js'];

  function frame(box) {
    var w = +box.dataset.w, h = +box.dataset.h, s = +(box.dataset.scale || 1), f = document.createElement('iframe');
    box.style.width = Math.round(w * s) + 'px'; box.style.height = Math.round(h * s) + 'px';
    f.width = w; f.height = h; f.style.width = w + 'px'; f.style.height = h + 'px';
    if (s !== 1) f.style.transform = 'scale(' + s + ')';
    f.loading = box.hasAttribute('data-eager') ? 'eager' : 'lazy';
    f.title = box.dataset.title || 'identity frame';
    if (box.dataset.home) {
      f.addEventListener('load', function () { inject(f, box.dataset.home); });
      f.src = HOME;
    } else {
      f.src = box.dataset.src + (RM ? '&rm=1' : '');
    }
    box.appendChild(f);
    box.frame = f;
  }

  // The real home, with the candidate put into its header the way a port would: same link, new contents.
  function inject(f, c) {
    var w = f.contentWindow, d = w.document;
    d.addEventListener('click', function (e) { if (e.target.closest('a')) e.preventDefault(); }, true);   // stay on the board
    if (RM && w.Motion) w.Motion.reduced = function () { return true; };
    if (c === 'now') return;
    var css = d.createElement('link'); css.rel = 'stylesheet'; css.href = 'design/2026-09-identity/01-identity.css'; d.head.appendChild(css);
    FILES.reduce(function (p, name) {
      return p.then(function () {
        return new Promise(function (res) { var s = d.createElement('script'); s.src = 'design/2026-09-identity/' + name; s.onload = s.onerror = res; d.head.appendChild(s); });
      });
    }, Promise.resolve()).then(function () {
      var old = d.querySelector('.home-head .site-identity'), link = old.cloneNode(false);
      old.replaceWith(link);
      f.idc = w.IDC.mount(link, c, { home: true });
    });
  }

  function framesOf(c, sel) { return [].slice.call(document.querySelectorAll('.fr[data-c="' + c + '"]' + (sel || ''))); }
  function arrive(box) {
    var f = box.frame; if (!f) return;
    var api = f.idc || (f.contentWindow && f.contentWindow.FRAME);
    if (api && api.arrive) api.arrive();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.play) framesOf(b.dataset.play, '[data-replay]').forEach(arrive);
    if (b.dataset.op) {
      var box = framesOf(b.dataset.op, '[data-home][data-w="1440"]')[0], w = box && box.frame && box.frame.contentWindow;
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
