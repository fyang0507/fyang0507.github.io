/* 04-shelf-c.js — Candidate C "Open on the desk / 摊开在桌上".
   The side preview becomes the site's own drawn open book (assets/book-flip2-light.png) lying beside the
   shelf. Considering a spine flips its pages on the hand's clock — the strip's stepped frames, ~11 fps,
   with an anticipation hold — and it settles on a spread printed in perspective onto the drawing: the
   real cover on the left page, title and excerpt typeset on the right. Click grows the right page into
   the reading page. Pages are mapped onto the drawn quads with a homography (matrix3d). */
(function () {
  var K = window.ShelfKit;
  var stage = document.getElementById('stage-c');
  var posts = K.pick(K.SET14);
  var shelf = K.buildShelf(stage, posts, { rowH: 230 });
  shelf.wrap.classList.add('c-shelf');
  var read = window.ShelfRead(stage);
  var bird = K.Bird(shelf, { mode: 'tops', notice: 380 });
  var FW = 462, FH = 355;                                      // one frame of the strip, in px
  // Printable areas of the two drawn pages (frame px), inset from the ink so the drawing stays intact.
  var QL = [[73, 138], [223, 138], [223, 302], [45, 302]], QR = [[239, 138], [391, 138], [418, 302], [239, 302]];
  var PW = 200, PH = 212;                                      // logical page box before mapping

  var desk = K.el('div', 'c-desk'), bookEl = K.el('div', 'c-book');
  bookEl.setAttribute('role', 'img');
  var L = K.el('div', 'c-pg c-left'), R = K.el('div', 'c-pg c-right');
  bookEl.appendChild(L); bookEl.appendChild(R); desk.appendChild(bookEl); stage.appendChild(desk);
  var S = 1, shown = -1, want = -1, flipping = false, busy = false, pen = null;

  // ---- homography: map the logical page rectangle onto a drawn quadrilateral ----------------------
  function solve(A, b) {
    var n = b.length, i, j, k;
    for (i = 0; i < n; i++) {
      var p = i; for (j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[p][i])) p = j;
      var t = A[i]; A[i] = A[p]; A[p] = t; t = b[i]; b[i] = b[p]; b[p] = t;
      for (j = i + 1; j < n; j++) { var f = A[j][i] / A[i][i]; b[j] -= f * b[i]; for (k = i; k < n; k++) A[j][k] -= f * A[i][k]; }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
    return x;
  }
  function matrix(w, h, q) {
    var src = [[0, 0], [w, 0], [w, h], [0, h]], A = [], b = [];
    for (var i = 0; i < 4; i++) {
      var x = src[i][0], y = src[i][1], u = q[i][0], v = q[i][1];
      A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
      A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
    }
    var m = solve(A, b);
    return 'matrix3d(' + [m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, 1].map(function (n) { return +n.toFixed(8); }).join(',') + ')';
  }

  function layout() {
    K.measure(shelf);
    var W = stage.clientWidth, narrow = W < 760, shelfW = shelf.wrap.offsetWidth;
    S = narrow ? Math.min(1.1, (W - 24) / FW) : Math.min(1.34, (W - shelfW - 28 - 36 - 40) / FW);
    bookEl.style.width = FW * S + 'px'; bookEl.style.height = FH * S + 'px';
    var sq = function (q) { return q.map(function (p) { return [p[0] * S, p[1] * S]; }); };
    L.style.width = R.style.width = PW + 'px'; L.style.height = R.style.height = PH + 'px';
    L.style.transform = matrix(PW, PH, sq(QL)); R.style.transform = matrix(PW, PH, sq(QR));
    bird.home();
  }

  // ---- page content --------------------------------------------------------------------------------
  function fillL(p) {
    L.innerHTML = p
      ? '<div class="pl-img warm"><img alt="" decoding="async" sizes="320px" srcset="' + p.coverSrcset + '" src="' + p.cover + '"></div><div class="pl-cap">plate · ' + p.ym + ' · ' + (p.tagZh[0] || '') + '</div>'
      : '<div class="pl-motif"><img src="../../assets/sticker-happy.png" alt=""></div>';
  }
  function fillR(p) {
    if (!p) {
      R.innerHTML = '<div class="pr-head">弗雷德 · fred yang</div><div class="pr-zh pr-tsu">つづく</div><div class="pr-en">Still writing · 还在写</div><i class="pr-rule"></i>' +
        '<div class="pr-text pr-soft">Point at a spine and this book turns to it. 指向一本书，这本就翻到那一页。</div>';
      pen = null; return;
    }
    var ex = p.excerptZh.replace(/…$/, '');
    R.innerHTML = '<div class="pr-head">弗雷德 · fred yang — ' + (p.tagZh[0] || '') + '</div><div class="pr-zh"><span>' + K.esc(p.zh) + '</span></div>' +
      '<div class="pr-en">' + K.esc(p.en) + '</div><i class="pr-rule"></i><div class="pr-text">' + K.esc(ex) + '……</div>' +
      '<div class="pr-foot"><span>' + p.ym + ' · ~' + p.min + ' min</span><span>— 1 —</span></div>';
    var zh = R.querySelector('.pr-zh span'), fs = 21;
    while (zh.offsetWidth > PW - 4 && fs > 11) { fs -= 1; zh.style.fontSize = fs + 'px'; }
    pen = Pen.annotate(zh, 'underline', { manual: true, gap: 1, width: 1.8 });
  }
  function frame(i) { bookEl.style.backgroundPosition = (i * 20) + '% 0'; }
  function vis(l, r) { L.style.visibility = l ? '' : 'hidden'; R.style.visibility = r ? '' : 'hidden'; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // One page turn, forward (right page over to the left) or back (the strip played in reverse).
  // Printed content shows only where the drawing has a flat, uncovered page in that frame.
  async function flip(fwd, p) {
    if (pen) pen.hide();
    if (Pen.reduced()) { fillL(p); fillR(p); frame(0); vis(1, 1); return; }
    await sleep(70);                                            // anticipation: the hand finds the corner
    if (fwd) {
      frame(1); vis(1, 0); await sleep(90);
      frame(2); await sleep(90);
      frame(3); fillR(p); vis(0, 1); await sleep(100);
      frame(4); fillL(p); vis(1, 1); await sleep(90);
    } else {
      frame(3); vis(0, 1); await sleep(90);
      frame(2); fillL(p); vis(1, 0); await sleep(90);
      frame(1); await sleep(100);
      frame(4); fillR(p); vis(1, 1); await sleep(90);
    }
    frame(0);
  }
  async function turnTo() {
    if (flipping) return;
    flipping = true;
    while (want !== shown) {
      var tgt = want, fwd = shown < 0 || tgt > shown;
      await flip(fwd, posts[tgt]);
      shown = tgt;
      bookEl.setAttribute('aria-label', 'Open book showing ' + posts[tgt].en + ' · ' + posts[tgt].zh);
      await sleep(60);
    }
    flipping = false;
    if (pen && !busy) setTimeout(function () { if (!flipping && pen) pen.show(); }, 80);
  }
  function consider(i) {
    if (i < 0 || busy || read.open) { if (i < 0) bird.cancel(); return; }   // the book stays open where you left it
    want = i; bird.consider(i); turnTo();
  }

  async function open(i) {
    if (busy || read.open) return;
    consider(i);
    while (flipping || shown !== i) await sleep(40);
    busy = true;
    var zh = R.querySelector('.pr-zh span');
    var from = { paper: K.rel(R, stage), title: K.rel(zh, stage) };
    zh.style.visibility = 'hidden';
    await read.show(posts[i], from, function (viaKey) { close(i, viaKey); });
    busy = false;
  }
  async function close(i, viaKey) {
    if (busy) return;
    busy = true;
    var zh = R.querySelector('.pr-zh span');
    await read.hide({ paper: K.rel(R, stage), title: K.rel(zh, stage) });
    zh.style.visibility = '';
    busy = false;
    if (viaKey) shelf.books[i].el.focus({ preventScroll: true }); else if (document.activeElement) document.activeElement.blur();
    if (pen) pen.show();
  }

  shelf.books.forEach(function (b, i) {
    b.el.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') consider(i); });
    b.el.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      if (shown !== i && e.pointerType === 'touch') { consider(i); return; }
      open(i);
    });
  });
  K.rove(shelf, consider);
  fillL(null); fillR(null); frame(0);
  bookEl.setAttribute('aria-label', 'Open book on the desk · 摊开的书');
  layout();
  window.addEventListener('resize', function () { if (!read.open) layout(); });

  window.replayC = async function () {
    if (busy) return;
    if (read.open) { close(shown); return; }
    consider(3); await sleep(1300);
    consider(5); await sleep(1300);
    await open(5); await sleep(1800);
    await close(5);
  };
  window.__C = { consider: consider, open: open, close: close };
})();
