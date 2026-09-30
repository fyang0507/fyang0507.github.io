/* design/2026-09-building · board chrome, loaded parser-blocking in every board page's <head> (before first paint).
   · The candidate: ?c=a|b|c (A the back of the card, B go in close, C the dossier), kept for the session in
     sessionStorage fy-bd-c (a design-only key), set as html.c-a|c-b|c-c before anything paints. Links between the
     board pages carry it.
   · A reduced-motion preview (html.bd-rm, fy-bd-rm): Motion.reduced() answers true, and no view transition runs.
   · A small switcher in the corner: board index, A / B / C, the same page on the live site, reduced motion. */
(function () {
  'use strict';
  var html = document.documentElement, q = new URLSearchParams(location.search), C = { a: 1, b: 1, c: 1 };
  var c = (q.get('c') || '').toLowerCase();
  try { if (!C[c]) c = sessionStorage.getItem('fy-bd-c') || 'a'; sessionStorage.setItem('fy-bd-c', c); } catch (e) { if (!C[c]) c = 'a'; }
  if (!C[c]) c = 'a';
  html.classList.add('c-' + c); html.dataset.c = c;
  var rm = false;
  try { rm = sessionStorage.getItem('fy-bd-rm') === '1'; } catch (e) { /* storage off */ }
  if (rm) html.classList.add('bd-rm');
  var mq = matchMedia('(prefers-reduced-motion: reduce)');
  var BD = window.BD = { c: c, reduced: function () { return mq.matches || html.classList.contains('bd-rm'); } };

  // motion.js assigns window.Motion when it runs (deferred): catch the assignment and route reduced() through the preview
  var M;
  Object.defineProperty(window, 'Motion', {
    configurable: true,
    get: function () { return M; },
    set: function (v) { M = v; if (v && v.reduced) { var base = v.reduced; v.reduced = function () { return base() || html.classList.contains('bd-rm'); }; } }
  });

  // links between board pages carry the candidate
  var OURS = /^(?:\.\/)?0\d-[\w-]+\.html/;
  function carry(a) {
    var h = a.getAttribute('href');
    if (!h || !OURS.test(h) || /[?&]c=/.test(h)) return;
    var i = h.indexOf('#'), base = i < 0 ? h : h.slice(0, i), hash = i < 0 ? '' : h.slice(i);
    a.setAttribute('href', base + (base.indexOf('?') < 0 ? '?' : '&') + 'c=' + c + hash);
  }
  BD.carry = function (root) { (root || document).querySelectorAll('a[href]').forEach(carry); };
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[href]'); if (a) carry(a); }, true);

  var NAMES = { a: 'A · 翻面 the back of the card', b: 'B · 推近 go in close', c: 'C · 档案 the dossier' };
  BD.name = NAMES[c];
  function chrome() {
    BD.carry();
    var now = html.getAttribute('data-now'), bar = document.createElement('aside');
    bar.className = 'bd-bar';
    bar.setAttribute('aria-label', 'Design board controls');
    var here = location.pathname.split('/').pop();
    bar.innerHTML = '<a class="bd-i" href="./index.html" title="Board index">☰</a>' +
      ['a', 'b', 'c'].map(function (k) { return '<a class="bd-c' + (k === c ? ' on' : '') + '" href="./' + here + '?c=' + k + location.hash + '" title="' + NAMES[k] + '"' + (k === c ? ' aria-current="true"' : '') + '>' + k.toUpperCase() + '</a>'; }).join('') +
      '<span class="bd-n">' + NAMES[c].slice(4) + '</span>' +
      (now ? '<a class="bd-now" href="' + now + '" title="The same page on the live site">now ↗</a>' : '') +
      '<label class="bd-rm-t" title="Preview reduced motion"><input type="checkbox"' + (rm ? ' checked' : '') + '> reduced</label>';
    bar.querySelector('input').addEventListener('change', function (e) {
      try { sessionStorage.setItem('fy-bd-rm', e.target.checked ? '1' : '0'); } catch (x) { /* storage off */ }
      location.reload();
    });
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chrome); else chrome();
})();
