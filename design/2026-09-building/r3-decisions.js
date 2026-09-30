/* design/2026-09-building · round 3 · the decisions board's switches. Each .q[data-q] has options (.opt[data-v]) and
   frames (.frame[data-page]) that show the r3 page with every current pick in its address, so the frames agree with
   each other and with the session (r3-kit.js keeps the picks in fy-r3). Picking an option rewrites this page's address
   in place (?q2=a&q3=c…, shareable) and reloads only that question's frames. Q3 maps a|b|c to round 2's ?f=1|2|3. */
(function () {
  'use strict';
  var Q = ['q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'], DEF = { q2: 'a', q3: 'c', q4: 'a', q5: 'a', q6: 'a', q7: 'a', q8: 'a' };
  var url = new URLSearchParams(location.search), pick = {};
  Q.forEach(function (k) { var v = (url.get(k) || '').toLowerCase(); pick[k] = /^[abc]$/.test(v) ? v : DEF[k]; });
  var F = { a: '1', b: '2', c: '3' };

  function src(frame) {
    var page = frame.getAttribute('data-page');
    if (page.indexOf('r2-') === 0) return './' + page + '?f=' + F[pick.q3];
    return './' + page + '?' + Q.filter(function (k) { return k !== 'q3'; }).map(function (k) { return k + '=' + pick[k]; }).join('&');
  }
  function fit(frame) {
    var box = frame.querySelector('.box'), f = frame.querySelector('iframe'), W = +frame.getAttribute('data-w'), H = +frame.getAttribute('data-h');
    var s = Math.min(1, box.clientWidth / W);
    f.style.width = W + 'px'; f.style.height = H + 'px'; f.style.transform = s < 1 ? 'scale(' + s.toFixed(4) + ')' : '';
    box.style.height = Math.round(H * s) + 'px';
  }
  // a fragment in a frame's address would scroll this page too, so a frame is scrolled to its data-hash once loaded;
  // round 2's own switcher is removed there, since this page's options rule
  function settle(fr) {
    var f = fr.querySelector('iframe'), h = fr.getAttribute('data-hash'), d;
    try { d = f.contentDocument; } catch (e) { return; }
    if (!d || !d.body) return;
    var bar = d.querySelector('.bd-bar'); if (bar) bar.remove();
    var el = h && d.getElementById(h.slice(1));
    if (el) f.contentWindow.scrollTo(0, el.getBoundingClientRect().top + f.contentWindow.scrollY - 20);
  }
  function load(sec) {
    sec.querySelectorAll('.frame').forEach(function (fr) {
      var s = src(fr), f = fr.querySelector('iframe');
      if (!f.fySettle) { f.fySettle = true; f.addEventListener('load', function () { setTimeout(function () { settle(fr); }, 400); }); }
      f.src = s;
      fr.querySelector('[data-open]').href = s + (fr.getAttribute('data-hash') || '');
    });
  }
  function mark(sec) {
    var k = sec.getAttribute('data-q');
    sec.querySelectorAll('.opt').forEach(function (o) {
      var on = o.getAttribute('data-v') === pick[k];
      o.setAttribute('aria-checked', String(on));
      o.tabIndex = on ? 0 : -1;
      o.href = '?' + k + '=' + o.getAttribute('data-v') + '#' + sec.id;
    });
  }
  function tally() {
    var t = document.querySelector('[data-picks]');
    if (t) t.innerHTML = '<b>1a</b> · ' + Q.map(function (k) { return '<b>' + k.slice(1) + pick[k] + '</b>'; }).join(' · ') + ' · 9 ?';
    var p = new URLSearchParams(location.search);
    Q.forEach(function (k) { p.set(k, pick[k]); });
    history.replaceState(null, '', '?' + p.toString() + location.hash);
  }
  function choose(sec, v) {
    var k = sec.getAttribute('data-q');
    if (pick[k] === v) return;
    pick[k] = v;
    mark(sec);
    tally();
    load(sec);   // only this question's frames: the others keep whatever you are doing in them, and pick the change up
                 // from the session on their next page
  }
  function init() {
    var secs = document.querySelectorAll('.q[data-q]');
    secs.forEach(function (sec) {
      mark(sec);
      sec.querySelectorAll('.opt').forEach(function (o) {
        o.addEventListener('click', function (e) { e.preventDefault(); choose(sec, o.getAttribute('data-v')); });
        o.addEventListener('keydown', function (e) {
          var all = [].slice.call(sec.querySelectorAll('.opt')), i = all.indexOf(o), d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
          if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); choose(sec, o.getAttribute('data-v')); return; }
          if (!d) return;
          e.preventDefault();
          var n = all[(i + d + all.length) % all.length];
          choose(sec, n.getAttribute('data-v')); n.focus();
        });
      });
      sec.querySelectorAll('.frame').forEach(fit);
      load(sec);
    });
    tally();
    addEventListener('resize', function () { document.querySelectorAll('.frame').forEach(fit); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
