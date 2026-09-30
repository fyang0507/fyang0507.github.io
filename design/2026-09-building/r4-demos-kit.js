/* design/2026-09-building · round 4 board chrome for Demos, parser-blocking in <head>. Fred picked B for the marker, so
   the page is always B, tuned (html[data-m="b"]). What varies is how the pen points at a region when you notice its
   marker or its note: ?h=a|b|c (A the pen's 「 」 at the region's four corners, recommended; B a thin rounded outline; C a smooth
   single-pass stroke), set as html[data-h] before first paint. The URL is the only memory. The reduced-motion preview
   is round 1's (fy-bd-rm, a design-only session key). */
(function () {
  'use strict';
  var html = document.documentElement, q = new URLSearchParams(location.search), H = { a: 1, b: 1, c: 1 };
  var h = q.get('h');
  if (!H[h]) h = 'a';
  html.classList.add('c-c'); html.dataset.c = 'c'; html.dataset.m = 'b'; html.dataset.h = h;
  var rm = false;
  try { rm = sessionStorage.getItem('fy-bd-rm') === '1'; } catch (e) { /* storage off */ }
  if (rm) html.classList.add('bd-rm');
  var mq = matchMedia('(prefers-reduced-motion: reduce)');
  window.BD = { c: 'c', h: h, reduced: function () { return mq.matches || html.classList.contains('bd-rm'); } };
  var Mo;
  Object.defineProperty(window, 'Motion', {
    configurable: true,
    get: function () { return Mo; },
    set: function (v) { Mo = v; if (v && v.reduced) { var base = v.reduced; v.reduced = function () { return base() || html.classList.contains('bd-rm'); }; } }
  });
  // links to the round-1 pages keep C
  function carry(a) {
    var href = a.getAttribute('href');
    if (!href || !/^(?:\.\/)?0\d-[\w-]+\.html/.test(href) || /[?&]c=/.test(href)) return;
    var i = href.indexOf('#'), base = i < 0 ? href : href.slice(0, i), hash = i < 0 ? '' : href.slice(i);
    a.setAttribute('href', base + (base.indexOf('?') < 0 ? '?' : '&') + 'c=c' + hash);
  }
  window.BD.carry = function (root) { (root || document).querySelectorAll('a[href]').forEach(carry); };
  var NAMES = { a: 'A · corner marks', b: 'B · thin outline', c: 'C · smooth stroke' };
  function chrome() {
    window.BD.carry();
    var bar = document.createElement('aside'), here = location.pathname.split('/').pop(), now = html.getAttribute('data-now');
    bar.className = 'bd-bar';
    bar.setAttribute('aria-label', 'Design board controls');
    bar.innerHTML = '<a class="bd-i" href="./r4-demos-board.html" title="Round 4 board">☰</a>' +
      ['a', 'b', 'c'].map(function (k) { return '<a class="bd-c' + (k === h ? ' on' : '') + '" href="./' + here + '?h=' + k + location.hash + '" title="' + NAMES[k] + '"' + (k === h ? ' aria-current="true"' : '') + '>' + k.toUpperCase() + '</a>'; }).join('') +
      '<span class="bd-n">' + NAMES[h].slice(4) + '</span>' + (now ? '<a class="bd-now" href="' + now + '">now ↗</a>' : '') +
      '<label class="bd-rm-t"><input type="checkbox"' + (rm ? ' checked' : '') + '> reduced</label>';
    bar.querySelector('input').addEventListener('change', function (e) { try { sessionStorage.setItem('fy-bd-rm', e.target.checked ? '1' : '0'); } catch (x) { /* storage off */ } location.reload(); });
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chrome); else chrome();
})();
