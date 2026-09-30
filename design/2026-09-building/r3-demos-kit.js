/* design/2026-09-building · round 3 board chrome for Demos, parser-blocking in <head>. Round 3 keeps C and round 2's
   pick of an enlargement, now laid over the capture itself. What varies is the region marker: ?m=a|b|c (A the ink seal,
   recommended; B the paper token; C the index flag), set as html[data-m] before first paint. The URL is the only memory:
   no storage key for the marker. The reduced-motion preview is round 1's (fy-bd-rm, a design-only session key). */
(function () {
  'use strict';
  var html = document.documentElement, q = new URLSearchParams(location.search), M = { a: 1, b: 1, c: 1 };
  var m = q.get('m');
  if (!M[m]) m = 'a';
  html.classList.add('c-c'); html.dataset.c = 'c'; html.dataset.m = m;
  var rm = false;
  try { rm = sessionStorage.getItem('fy-bd-rm') === '1'; } catch (e) { /* storage off */ }
  if (rm) html.classList.add('bd-rm');
  var mq = matchMedia('(prefers-reduced-motion: reduce)');
  window.BD = { c: 'c', m: m, reduced: function () { return mq.matches || html.classList.contains('bd-rm'); } };
  var Mo;
  Object.defineProperty(window, 'Motion', {
    configurable: true,
    get: function () { return Mo; },
    set: function (v) { Mo = v; if (v && v.reduced) { var base = v.reduced; v.reduced = function () { return base() || html.classList.contains('bd-rm'); }; } }
  });
  // links to the round-1 pages keep C
  function carry(a) {
    var h = a.getAttribute('href');
    if (!h || !/^(?:\.\/)?0\d-[\w-]+\.html/.test(h) || /[?&]c=/.test(h)) return;
    var i = h.indexOf('#'), base = i < 0 ? h : h.slice(0, i), hash = i < 0 ? '' : h.slice(i);
    a.setAttribute('href', base + (base.indexOf('?') < 0 ? '?' : '&') + 'c=c' + hash);
  }
  window.BD.carry = function (root) { (root || document).querySelectorAll('a[href]').forEach(carry); };
  var NAMES = { a: 'A · the ink seal', b: 'B · the paper token', c: 'C · the index flag' };
  function chrome() {
    window.BD.carry();
    var bar = document.createElement('aside'), here = location.pathname.split('/').pop(), now = html.getAttribute('data-now');
    bar.className = 'bd-bar';
    bar.setAttribute('aria-label', 'Design board controls');
    bar.innerHTML = '<a class="bd-i" href="./r3-demos-board.html" title="Round 3 board">☰</a>' +
      ['a', 'b', 'c'].map(function (k) { return '<a class="bd-c' + (k === m ? ' on' : '') + '" href="./' + here + '?m=' + k + location.hash + '" title="' + NAMES[k] + '"' + (k === m ? ' aria-current="true"' : '') + '>' + k.toUpperCase() + '</a>'; }).join('') +
      '<span class="bd-n">' + NAMES[m].slice(4) + '</span>' + (now ? '<a class="bd-now" href="' + now + '">now ↗</a>' : '') +
      '<label class="bd-rm-t"><input type="checkbox"' + (rm ? ' checked' : '') + '> reduced</label>';
    bar.querySelector('input').addEventListener('change', function (e) { try { sessionStorage.setItem('fy-bd-rm', e.target.checked ? '1' : '0'); } catch (x) { /* storage off */ } location.reload(); });
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chrome); else chrome();
})();
