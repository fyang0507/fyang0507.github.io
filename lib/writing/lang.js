/* lib/writing/lang.js — the language the shelf reads in ('zh' | 'en') and its switch, 中文 · EN.
   Resolved as Reading.dc.html resolves it: ?lang=, else localStorage fy-lang, else 'zh'; anything but 'zh' is
   English. A choice made here is written to fy-lang, so the essay opens in it (the book links carry &lang= as
   well), and a choice made on Reading is the one this page shows next time, a bfcache restore included.
   The switch is a head row over the index, set like the ledger's (label left, choices right): two buttons with
   aria-pressed, both on the Tab path, Enter / Space choose. Pen: Tier.wire (hover = coral line, the chosen
   language = the wheat band, keyboard focus = coral 「 」, no coral at rest). A change swaps text at once. */
var KEY = 'fy-lang', subs = [];
function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
function resolve() { return (new URLSearchParams(location.search).get('lang') || stored() || 'zh') === 'zh' ? 'zh' : 'en'; }
var cur = resolve();
function tell(how) { subs.slice().forEach(function (fn) { fn(cur, how); }); }

export var lang = {
  get: function () { return cur; },
  set: function (l, how) { if (l === cur) return; cur = l; try { localStorage.setItem(KEY, l); } catch (e) { /* storage off: this visit only */ } tell(how); },
  on: function (fn) { subs.push(fn); return function () { var i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }; }
};
// Back from Reading through the bfcache: the page shows what was chosen there.
window.addEventListener('pageshow', function (e) { if (!e.persisted) return; var l = resolve(); if (l !== cur) { cur = l; tell('instant'); } });

var CHOICES = [['zh', '中文', 'Chinese'], ['en', 'EN', 'English']];
export function Switch(host) {
  host.innerHTML = '<div class="ctl-label" aria-hidden="true"><span lang="zh">语言</span><span>language</span></div>' +
    '<div class="lang-sw" role="group" aria-label="Language · 语言">' + CHOICES.map(function (c) {
      return '<button type="button" class="lang-b" data-lang="' + c[0] + '" aria-pressed="false"><span class="lang-t" lang="' + c[0] + '">' + c[1] + '</span>' +
        '<span class="sr-only" lang="en"> · ' + c[2] + '</span></button>';
    }).join('<span class="lang-dot" aria-hidden="true">·</span>') + '</div>';
  var bs = Array.prototype.map.call(host.querySelectorAll('.lang-b'), function (b) {
    var l = b.dataset.lang;
    b.addEventListener('click', function () { lang.set(l, 'press'); });
    return { el: b, w: Tier.wire(b, { target: '.lang-t', seed: 'lang|' + l, over: 3, chosen: function () { return cur === l; }, focus: { gap: 5, gy: 3 } }) };
  });
  function sync(l, how) { bs.forEach(function (s) { s.el.setAttribute('aria-pressed', String(s.el.dataset.lang === l)); s.w.refresh(how); }); }
  sync(cur, 'instant');
  var off = lang.on(sync);
  return { destroy: function () { off(); bs.forEach(function (s) { s.w.destroy(); }); } };
}
