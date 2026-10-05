/* design/2026-10-essays/switch-cands.js — loads the candidate the address asks for (?c=a | b | c; now = today's
   switch, untouched) into switch-writing.html. lang.js is imported by the same URL app.js imports it by, so this is
   the page's own language state: a candidate's switch retitles the spines and the book in your hand, writes fy-lang
   and drops ?lang= (keeping ?c=) exactly as today's does. Under a candidate, today's row (.wr-lang) is hidden by
   switch-cands.css. The board's bar (bottom left, ?bar=0 hides it) moves between candidates in the same language. */
import { lang } from '../../lib/writing/lang.js';

var q = new URLSearchParams(location.search), C = document.documentElement.getAttribute('data-c');
var MODS = { a: './switch-a.js', b: './switch-b.js', c: './switch-c.js' };
if (MODS[C]) import(MODS[C]).then(function (m) { m.start(lang); });

if (q.get('bar') !== '0') {
  var NAMES = [['now', 'now · 现在'], ['a', 'A 题头'], ['b', 'B 挂牌'], ['c', 'C 拨片']];
  var bar = document.createElement('nav');
  bar.className = 'sw-bar'; bar.setAttribute('aria-label', 'Design candidates');
  bar.innerHTML = '<a class="sw-bar-home" href="design/2026-10-essays/switch-index.html">CN/EN switch · 中英切换</a>' + NAMES.map(function (n) {
    return '<a href="design/2026-10-essays/switch-writing.html?c=' + n[0] + '"' + (n[0] === C ? ' aria-current="page"' : '') + '>' + n[1] + '</a>';
  }).join('');
  document.body.appendChild(bar);
}
