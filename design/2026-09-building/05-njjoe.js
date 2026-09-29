/* design/2026-09-building · the WIP pusher's nudge, given a cause. The shared treatment loops it forever (a 3.4 s CSS
   animation); the site's motion rule is that every motion has a cause and loops sleep. So the pusher shoves three times
   when the sticker comes into view, and again when a pointer comes near it after resting a while; otherwise it stands.
   The sticker itself (peel, reset, fallback) is the shared casebook.js, unchanged. */
(function () {
  'use strict';
  var shell = document.querySelector('[data-wip-sticker-shell]'), nudge = shell && shell.querySelector('.wip-nudge');
  if (!shell || !nudge) return;
  var last = 0;
  function push() {
    if (performance.now() - last < 4000) return;
    last = performance.now();
    nudge.classList.remove('nudging');
    void nudge.offsetWidth;
    nudge.classList.add('nudging');
  }
  nudge.addEventListener('animationend', function () { nudge.classList.remove('nudging'); });
  new IntersectionObserver(function (en) { if (en[en.length - 1].intersectionRatio >= 0.6) push(); }, { threshold: [0, 0.6, 1] }).observe(shell);
  shell.parentNode.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') push(); });
})();
