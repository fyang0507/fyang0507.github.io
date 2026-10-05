/* lib/writing/lang.js — the language the shelf reads in ('zh' | 'en'); the sign over the shelf (sign.js) switches it.
   Resolved as Reading.dc.html resolves it: ?lang=, else localStorage fy-lang, else 'zh'; anything but 'zh' is
   English. A choice made here is written to fy-lang, so the essay opens in it (the book links carry &lang= as
   well), and a choice made on Reading is the one this page shows next time, a bfcache restore included. It also
   deletes ?lang= from this page's address (in place): a reload then follows the choice, and Writing's history
   entries carry no language of their own to outvote one made later on Reading. Subscribers hear every change. */
var KEY = 'fy-lang', subs = [];
function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
function resolve() { return (new URLSearchParams(location.search).get('lang') || stored() || 'zh') === 'zh' ? 'zh' : 'en'; }
var cur = resolve();
function tell(how) { subs.slice().forEach(function (fn) { fn(cur, how); }); }

export var lang = {
  get: function () { return cur; },
  set: function (l, how) {
    if (l === cur) return;
    cur = l;
    try { localStorage.setItem(KEY, l); } catch (e) { /* storage off: this visit only */ }
    var u = new URL(location.href);
    if (u.searchParams.has('lang')) { u.searchParams.delete('lang'); history.replaceState(history.state, '', u); }
    tell(how);
  },
  on: function (fn) { subs.push(fn); return function () { var i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }; }
};
// Back from Reading through the bfcache: the page shows what was chosen there.
window.addEventListener('pageshow', function (e) { if (!e.persisted) return; var l = resolve(); if (l !== cur) { cur = l; tell('instant'); } });
