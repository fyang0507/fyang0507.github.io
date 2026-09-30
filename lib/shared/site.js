/* site.js — shared page glue, deferred on every gateway page after pen.js and pen-tier.js.
   · FY.mount(sel, fn): calls fn(host) once for each element matching sel, as soon as it exists and the page's
     stylesheets are in. Page content inside <x-dc> only appears after support.js has React, so page modules
     mount through this. The <x-dc> element itself is support.js's unrendered template (thrown away after
     render), so matches inside it never count. The watch stays on for the page's life, checking only added
     subtrees: a host that appears later, or a re-render that replaces it, is mounted once too.
   · FY.styled(fn): calls fn once the page's stylesheets are in, the gate FY.mount waits on. A page without a
     template (Building) builds its markup at once, before first render, and measures only through this.
     A stylesheet is in once its link has a sheet, which it gets when it loads or fails. Chromium runs deferred
     scripts only after the head's stylesheets, so they are always in by then. WebKit runs them straight away,
     and may hold back even the sheets that have loaded until the last one (usually Google Fonts') is in, so a
     mount on React's arrival could measure an unstyled page: Writing's books past the case, About's sleeve off
     its card.
   · The nav's pen marks: every nav link gets the pen's tiers (Tier.wire): a coral underline under its label on
     hover and coral 「 」 on keyboard focus. The current tab's label is chosen, drawn as the wheat band. This
     script runs before pagereveal, so where transitions.js is on (html[data-vt-on]) the band waits for its
     fy:landed: at once and instant on a plain load, drawn by the pen once the folder tab has landed after a
     view transition (the pen marks the tab first and the label second). html[data-vt-landed] means it's past. */
(function () {
  'use strict';
  var html = document.documentElement, FY = window.FY = window.FY || {};

  function styled(go) {
    var l = [].find.call(document.querySelectorAll('link[rel=stylesheet]'), function (s) { return !s.sheet; });
    if (!l) return go();
    function next() { l.removeEventListener('load', next); l.removeEventListener('error', next); styled(go); }
    l.addEventListener('load', next); l.addEventListener('error', next);
  }
  FY.styled = styled;

  FY.mount = function (sel, fn) {
    function run(el) {
      if (el.closest('x-dc')) return;
      var done = el.fyMount || (el.fyMount = {});
      if (done[sel]) return;
      done[sel] = true;
      styled(function () { try { fn(el); } catch (e) { setTimeout(function () { throw e; }); } });
    }
    document.querySelectorAll(sel).forEach(run);
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.matches(sel)) run(n);
          n.querySelectorAll(sel).forEach(run);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  };

  function wireNav() {
    if (!window.Tier || !window.Pen) return;
    document.querySelectorAll('.site-index .site-home, .site-index .site-tab').forEach(function (a) {
      if (a.hasAttribute('data-pen-tier') || !a.querySelector('.site-nav-label .en')) return;
      var current = a.getAttribute('aria-current') === 'page', wait = current && html.hasAttribute('data-vt-on') && !html.hasAttribute('data-vt-landed');
      var mark = Tier.wire(a, { target: '.site-nav-label .en', chosen: current && !wait });
      if (wait) document.addEventListener('fy:landed', function (e) { mark.set(true, e.detail && e.detail.vt ? 'hover' : 'instant'); }, { once: true });
    });
    document.querySelectorAll('.site-identity > .site-identity-mark').forEach(function (m) { if (!m.parentNode.hasAttribute('data-pen-tier')) Tier.wire(m.parentNode, { target: m, focus: { on: 'host', gap: 1, gy: 1 } }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireNav); else wireNav();
})();
