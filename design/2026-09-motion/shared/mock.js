/* Mockup board chrome: top bar with board navigation and a reduced-motion preview switch.
   Replay buttons: <button class="replay" data-replay="fnName"> calls window[fnName](). */
(function () {
  var BOARDS = [
    ['01-transitions.html', '01 · transitions'], ['02-pen.html', '02 · the pen'], ['03-filters.html', '03 · filters'],
    ['04-shelf.html', '04 · shelf'], ['05-board.html', '05 · corkboard'], ['06-gallery.html', '06 · gallery'],
    ['07-about.html', '07 · about'], ['08-reading.html', '08 · reading'], ['09-home.html', '09 · home'], ['10-opener.html', '10 · opener'], ['11-themes.html', '11 · themes'],
    ['r2-01-transitions.html', 'R2 · 01 transitions'], ['r2-02-pen.html', 'R2 · 02 pen'], ['r2-03-filters.html', 'R2 · 03 filters'],
    ['r2-04-shelf.html', 'R2 · 04 shelf'], ['r2-05-board.html', 'R2 · 05 corkboard'], ['r2-06-gallery.html', 'R2 · 06 gallery'],
    ['r2-07-about.html', 'R2 · 07 about'], ['r2-08a-reading.html', 'R2 · 08 reading'], ['r2-08b-footnotes.html', 'R2 · 08 footnotes'],
    ['r2-10-opener.html', 'R2 · 10 opener'],
    ['r3-02-pen.html', 'R3 · 02 pen'], ['r3-03-writing.html', 'R3 · 03 writing'], ['r3-05-board.html', 'R3 · 05 corkboard'],
    ['r3-07-about.html', 'R3 · 07 about'], ['r3-08a-reading.html', 'R3 · 08 reading'], ['r3-08b-footnotes.html', 'R3 · 08 footnotes'],
    ['r3-10-opener.html', 'R3 · 10 opener'],
    ['r4-02-pen.html', 'R4 · 02 pen'], ['r4-03-writing.html', 'R4 · 03 writing'], ['r4-05-board.html', 'R4 · 05 corkboard'],
    ['r4-07-about.html', 'R4 · 07 about'], ['r5-07-about.html', 'R5 · 07 about'], ['r6-07-about.html', 'R6 · 07 about'], ['r7-07-about.html', 'R7 · 07 about']
  ];
  var here = location.pathname.split('/').pop();
  var i = BOARDS.findIndex(function (b) { return b[0] === here; });
  var bar = document.createElement('div');
  bar.className = 'mock-top';
  var prev = i > 0 ? '<a class="mt-prev" href="' + BOARDS[i - 1][0] + '">← ' + BOARDS[i - 1][1] + '</a>' : '';
  var next = i >= 0 && i < BOARDS.length - 1 ? '<a class="mt-next" href="' + BOARDS[i + 1][0] + '"><span>' + BOARDS[i + 1][1] + ' </span>→</a>' : '';
  bar.innerHTML = '<div class="mt-nav"><a href="index.html">☰ audit index</a>' + prev + '</div>' +
    '<div class="mt-nav">' + next + '<label><input type="checkbox" id="mock-rm"> reduced motion</label></div>';
  document.body.prepend(bar);
  var rm = bar.querySelector('#mock-rm');
  rm.checked = sessionStorage.getItem('mock-rm') === '1';
  document.documentElement.classList.toggle('rm', rm.checked);
  rm.addEventListener('change', function () {
    sessionStorage.setItem('mock-rm', rm.checked ? '1' : '0');
    document.documentElement.classList.toggle('rm', rm.checked);
    document.dispatchEvent(new CustomEvent('mock:rm', { detail: rm.checked }));
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-replay]');
    if (b && typeof window[b.dataset.replay] === 'function') window[b.dataset.replay]();
  });
})();
