/* design/2026-09-building · round 2 board chrome, parser-blocking in <head>. Round 2 refines C only, so the page is
   always html.c-c. What varies is the evidence viewer's focus: ?f=1|2|3 (F1 the pen marks the region, F2 a sheet of
   tracing paper over the print, F3 an enlargement pulled out from under it), kept for the session in fy-bd-f (a
   design-only key) and set as html[data-f] before first paint. The reduced-motion preview is round 1's (fy-bd-rm). */
(function () {
  'use strict';
  var html = document.documentElement, q = new URLSearchParams(location.search), F = { 1: 1, 2: 1, 3: 1 };
  var f = q.get('f');
  try { if (!F[f]) f = sessionStorage.getItem('fy-bd-f') || '3'; sessionStorage.setItem('fy-bd-f', f); } catch (e) { if (!F[f]) f = '3'; }
  if (!F[f]) f = '3';
  html.classList.add('c-c'); html.dataset.c = 'c'; html.dataset.f = f;
  var rm = false;
  try { rm = sessionStorage.getItem('fy-bd-rm') === '1'; } catch (e) { /* storage off */ }
  if (rm) html.classList.add('bd-rm');
  var mq = matchMedia('(prefers-reduced-motion: reduce)');
  window.BD = { c: 'c', f: f, reduced: function () { return mq.matches || html.classList.contains('bd-rm'); } };
  var M;
  Object.defineProperty(window, 'Motion', {
    configurable: true,
    get: function () { return M; },
    set: function (v) { M = v; if (v && v.reduced) { var base = v.reduced; v.reduced = function () { return base() || html.classList.contains('bd-rm'); }; } }
  });
  // links to the round-1 pages keep C
  function carry(a) {
    var h = a.getAttribute('href');
    if (!h || !/^(?:\.\/)?0\d-[\w-]+\.html/.test(h) || /[?&]c=/.test(h)) return;
    var i = h.indexOf('#'), base = i < 0 ? h : h.slice(0, i), hash = i < 0 ? '' : h.slice(i);
    a.setAttribute('href', base + (base.indexOf('?') < 0 ? '?' : '&') + 'c=c' + hash);
  }
  window.BD.carry = function (root) { (root || document).querySelectorAll('a[href]').forEach(carry); };
  var NAMES = { 1: 'F1 · the pen marks it', 2: 'F2 · tracing paper', 3: 'F3 · the enlargement' };
  function chrome() {
    window.BD.carry();
    var bar = document.createElement('aside'), here = location.pathname.split('/').pop(), now = html.getAttribute('data-now');
    bar.className = 'bd-bar';
    bar.setAttribute('aria-label', 'Design board controls');
    bar.innerHTML = '<a class="bd-i" href="./r2-02-demos-board.html" title="Round 2 board">☰</a>' +
      ['1', '2', '3'].map(function (k) { return '<a class="bd-c' + (k === f ? ' on' : '') + '" href="./' + here + '?f=' + k + location.hash + '" title="' + NAMES[k] + '"' + (k === f ? ' aria-current="true"' : '') + '>F' + k + '</a>'; }).join('') +
      '<span class="bd-n">' + NAMES[f].slice(5) + '</span>' + (now ? '<a class="bd-now" href="' + now + '">now ↗</a>' : '') +
      '<label class="bd-rm-t"><input type="checkbox"' + (rm ? ' checked' : '') + '> reduced</label>';
    bar.querySelector('input').addEventListener('change', function (e) { try { sessionStorage.setItem('fy-bd-rm', e.target.checked ? '1' : '0'); } catch (x) { /* storage off */ } location.reload(); });
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chrome); else chrome();
})();
