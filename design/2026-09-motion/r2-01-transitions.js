/* r2-01 · boot: one miniature site per candidate; replay tours, a ¼-speed switch for studying the motion. */
(function () {
  var sites = {};
  function mount(id, director) {
    var stage = document.querySelector('#' + id + ' .stage');
    if (stage) sites[id] = new MiniSite(stage, { director: director });
  }
  function start() {
    mount('cand-a', window.R2A);
    if (window.R2B) mount('cand-b', window.R2B);
    // the identity lockup's fonts set the header height; re-measure the resting desk once they are in
    if (document.fonts) document.fonts.ready.then(function () { Object.keys(sites).forEach(function (k) { sites[k].relayout(); }); });
    document.addEventListener('mock:rm', function () { Object.keys(sites).forEach(function (k) { sites[k].relayout(); }); });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-slow]'), s = b && sites[b.dataset.slow];
      if (!s) return;
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      s.clock.speed = on ? 0.25 : 1;
    });
  }
  // replay = a small tour: desk → destination, one tab hop, back to the desk
  window.replayA = function () { sites['cand-a'] && sites['cand-a'].tour(['building', 'writing', 'home']); };
  window.replayB = function () { sites['cand-b'] && sites['cand-b'].tour(['writing', 'shooting', 'home']); };
  window.R2 = sites;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
