/* 01 · transitions — boot: one miniature site per candidate, each with its own transition set. */
(function () {
  var sites = {};
  function mount(id, cfg) {
    var stage = document.querySelector('#' + id + ' .stage');
    if (stage) sites[id] = new MiniSite(stage, cfg);
  }
  function start() {
    mount('cand-a', Object.assign({ pen: true }, window.T01A));
    mount('cand-b', window.T01B);
    mount('cand-c', Object.assign({ extra: window.T01C.overlay }, window.T01C));
  }
  // replay = a small tour: desk → destination, one tab hop, back to the desk
  window.replayA = function () { sites['cand-a'] && sites['cand-a'].tour(['building', 'writing', 'home']); };
  window.replayB = function () { sites['cand-b'] && sites['cand-b'].tour(['writing', 'shooting', 'home']); };
  window.replayC = function () { sites['cand-c'] && sites['cand-c'].tour(['shooting', 'about', 'home']); };
  window.T01 = sites;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
