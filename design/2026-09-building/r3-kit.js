/* design/2026-09-building · round 3 chrome, parser-blocking in every r3 page's <head>. Round 3 lets Fred try each open
   question of HANDOFF.md §4 live. The pages are always C (html.c-c); what varies is each question's option:
   ?q2=a|b ?q4=a|b ?q5=a|b ?q6=a|b ?q7=a|b ?q8=a|b, kept for the session in sessionStorage fy-r3 (a design-only key),
   so a way in and a way back keep them. Set as html[data-q2] … before first paint. The reduced-motion preview is
   round 1's (fy-bd-rm). The corner bar switches the options this page shows (data-r3-qs on <html>). */
(function () {
  'use strict';
  var html = document.documentElement, q = new URLSearchParams(location.search);
  // the defaults are Fred's answers (2026-09-29)
  var DEF = { q2: 'a', q4: 'b', q5: 'b', q6: 'b', q7: 'a', q8: 'a' }, OK = { a: 1, b: 1 }, S = {};
  try { S = JSON.parse(sessionStorage.getItem('fy-r3')) || {}; } catch (e) { S = {}; }
  Object.keys(DEF).forEach(function (k) { var v = (q.get(k) || '').toLowerCase(); if (OK[v]) S[k] = v; if (!OK[S[k]]) S[k] = DEF[k]; html.setAttribute('data-' + k, S[k]); });
  try { sessionStorage.setItem('fy-r3', JSON.stringify(S)); } catch (e) { /* storage off */ }
  html.classList.add('c-c'); html.dataset.c = 'c';
  var rm = false;
  try { rm = sessionStorage.getItem('fy-bd-rm') === '1'; } catch (e) { /* storage off */ }
  if (rm) html.classList.add('bd-rm');
  var mq = matchMedia('(prefers-reduced-motion: reduce)');
  window.BD = { c: 'c', r3: S, reduced: function () { return mq.matches || html.classList.contains('bd-rm'); }, carry: function () {} };
  var M;
  Object.defineProperty(window, 'Motion', {
    configurable: true,
    get: function () { return M; },
    set: function (v) { M = v; if (v && v.reduced) { var base = v.reduced; v.reduced = function () { return base() || html.classList.contains('bd-rm'); }; } }
  });
  var LABEL = { q2: 'Q2 back', q4: 'Q4 components', q5: 'Q5 type', q6: 'Q6 tab', q7: 'Q7 phone', q8: 'Q8 link' };
  function chrome() {
    if (window.self !== window.top) return;   // inside the decisions board, its own switches rule
    var qs = (html.getAttribute('data-r3-qs') || '').split(/\s+/).filter(Boolean), here = location.pathname.split('/').pop();
    var bar = document.createElement('aside');
    bar.className = 'bd-bar r3-bar';
    bar.setAttribute('aria-label', 'Design board controls');
    bar.innerHTML = '<a class="bd-i" href="./r3-decisions.html" title="Round 3: the decisions board" target="_top">☰</a>' +
      qs.map(function (k) {
        return '<span class="bd-n">' + LABEL[k] + '</span>' + ['a', 'b'].map(function (v) {
          return '<a class="bd-c' + (S[k] === v ? ' on' : '') + '" href="./' + here + '?' + k + '=' + v + '"' + (S[k] === v ? ' aria-current="true"' : '') + '>' + v + '</a>';
        }).join('');
      }).join('') +
      '<label class="bd-rm-t"><input type="checkbox"' + (rm ? ' checked' : '') + '> reduced</label>';
    bar.querySelector('input').addEventListener('change', function (e) { try { sessionStorage.setItem('fy-bd-rm', e.target.checked ? '1' : '0'); } catch (x) { /* storage off */ } location.reload(); });
    document.body.appendChild(bar);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chrome); else chrome();
})();
