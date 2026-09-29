/* r2-04-cover.js — dresses a book the first time it is taken off the shelf. Everything is typeset at
   "in the hand" size inside a .cv box and scaled down onto the board, so it lands crisp when held.
   band (A): the front board shows the real cover wrapped in a paper obi / 腰封 that carries the preview.
   peek (B): the front board is the cover alone; the preview is typeset on the title page underneath and the
   hand-written aside is pencilled inside the board, under the ex libris, like a flyleaf note. */
(function () {
  var K = window.ShelfKit;
  function build(b, CW, mode) {
    var p = b.post, ch = Math.round(CW * b.h / b.D), note = K.aside(p);
    var cv = '<div class="cv" style="width:' + CW + 'px;height:' + ch + 'px;transform:scale(' + (b.D / CW).toFixed(4) + ')">';
    var meta = '<span class="ml"><b>' + p.ym + '</b> · <b>~' + p.min + ' min</b></span><span class="ml"><b>' + K.esc(p.tags[0] || '') + '</b> · <b lang="zh">' + K.esc(p.tagZh[0] || '') + '</b></span>';
    var hand = K.esc(note[0]) + '<span>' + note[1] + '</span>';
    var obi = mode === 'band' ? '<div class="obi"><div class="obi-zh">' + K.esc(p.zh) + '</div><div class="obi-en">' + K.esc(p.en) + '</div>' +
      '<div class="obi-meta">' + meta + '</div><div class="obi-note">' + hand + '</div></div>' : '';
    b.F.front.innerHTML = cv + '<div class="cv-img"><img alt="" decoding="async" sizes="' + CW + 'px"></div>' + obi + '</div>';
    var img = b.F.front.querySelector('img'); img.setAttribute('srcset', p.coverSrcset); img.src = p.cover;
    b.F.leafBack.innerHTML = cv + '<div class="exlib">EX LIBRIS<b>fred yang</b>弗雷德藏书</div>' + (mode === 'peek' ? '<div class="fly-note">' + hand + '</div>' : '') + '</div>';
    var p1 = K.el('div', 'p1' + (mode === 'peek' ? ' peek' : ''), cv + '<div class="p1-head">FRED YANG · 弗雷德</div><div class="p1-zh">' + K.esc(p.zh) + '</div>' +
      '<div class="p1-en">' + K.esc(p.en) + '</div><i class="p1-rule"></i>' +
      (mode === 'peek' ? '<div class="p1-meta">' + meta + '</div>' : '') +
      '<div class="p1-foot">' + p.year + ' · ' + K.esc(p.tagZh[0] || '') + ' ' + K.esc(p.tags[0] || '') + '</div></div>');
    b.F.cov.insertBefore(p1, b.F.leaf);
    b.p1 = p1; b.p1zh = p1.querySelector('.p1-zh');
    // Titles: one line if a slightly smaller size fits; otherwise wrap to two lines, stepping down only if needed.
    function fit(node, fs, oneMin, min, maxW) {
      node.style.maxWidth = 'none'; node.style.whiteSpace = 'nowrap';
      var f = fs; node.style.fontSize = f + 'px';
      while (node.offsetWidth > maxW && f > oneMin) { f -= 0.5; node.style.fontSize = f + 'px'; }
      if (node.offsetWidth <= maxW) return;
      node.style.whiteSpace = 'normal'; node.style.maxWidth = maxW + 'px'; f = fs; node.style.fontSize = f + 'px';
      while (node.offsetHeight > f * 1.28 * 2 + 1 && f > min) { f -= 0.5; node.style.fontSize = f + 'px'; }
    }
    if (mode === 'band') fit(b.F.front.querySelector('.obi-zh'), 17, 15, 12, CW - 27);
    fit(b.p1zh, 22, 16, 13, Math.round(CW * 0.78));
    var target = mode === 'band' ? b.F.front.querySelector('.obi-zh') : b.p1zh;
    b.pen = Pen.annotate(target, 'underline', { manual: true, gap: 1, width: 2 });
  }
  window.ShelfCover = { build: build };
})();
