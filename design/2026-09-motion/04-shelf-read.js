/* 04-shelf-read.js — the destination every candidate grows into: a stage-sized mock of Reading.dc.html
   (kicker, title, meta, cover wash, first paragraphs). A plain paper sheet scales up from whatever
   paper the candidate hands it (title page, bookmark slip, open spread) on the physics clock, and the
   title flies from where it was printed to where Reading prints it (FLIP). Back reverses the flight. */
(function () {
  var K = window.ShelfKit;
  function ShelfRead(stage, opt) {
    opt = opt || {};
    var root = K.el('div', 'rd');
    root.hidden = true;
    root.innerHTML =
      '<div class="rd-paper"></div>' +
      '<div class="rd-page" role="dialog" aria-modal="false">' +
      '  <figure class="rd-wash"><img alt="" decoding="async"></figure>' +
      '  <div class="rd-nav rd-fade"><img class="rd-mark" src="../../favicon.png" alt=""><button class="rd-back" type="button">← 全部文章 · all writing</button><span class="rd-lang">中 / EN</span></div>' +
      '  <div class="rd-col">' +
      '    <div class="rd-kicker rd-fade"></div>' +
      '    <h3 class="rd-title"></h3>' +
      '    <div class="rd-en rd-fade"></div>' +
      '    <div class="rd-meta rd-fade"></div>' +
      '    <div class="rd-body rd-fade"></div>' +
      '  </div>' +
      '</div>';
    stage.appendChild(root);
    var paper = root.querySelector('.rd-paper'), page = root.querySelector('.rd-page'), title = root.querySelector('.rd-title');
    var fades = [].slice.call(root.querySelectorAll('.rd-fade, .rd-wash'));
    var back = root.querySelector('.rd-back'), onBack = null, busy = false;
    back.addEventListener('click', function (e) { if (!busy && onBack) onBack(e.detail === 0); });   // detail 0 = keyboard
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !busy && onBack) onBack(true); });

    function fill(p) {
      root.querySelector('.rd-kicker').textContent = (p.tagZh[0] || '') + ' · ' + (p.tags[0] || '');
      title.textContent = p.zh;
      root.querySelector('.rd-en').textContent = p.en;
      var d = p.date.split('-');
      root.querySelector('.rd-meta').textContent = d[0] + '年' + (+d[1]) + '月' + (+d[2]) + '日  ·  约 ' + p.min + ' 分钟  ·  ~' + p.min + ' min read  ·  中 / EN';
      var zh = p.excerptZh.replace(/…$/, ''), en = p.excerpt.replace(/…$/, '');
      root.querySelector('.rd-body').innerHTML = '<p>' + K.esc(zh) + '……</p><p class="rd-body-en">' + K.esc(en) + '…</p>';
      var img = root.querySelector('.rd-wash img');
      img.setAttribute('sizes', '900px'); img.setAttribute('srcset', p.coverSrcset); img.src = p.cover;
    }
    // Reading's title is one line; long titles step the size down instead of wrapping (keeps FLIP honest).
    function fitTitle() {
      title.style.fontSize = '';
      var col = title.parentNode.clientWidth, fs = parseFloat(getComputedStyle(title).fontSize);
      var need = title.scrollWidth;
      if (need > col) title.style.fontSize = Math.max(18, Math.floor(fs * col / need)) + 'px';
    }
    function paperFrom(r) {
      var W = stage.clientWidth, H = stage.clientHeight;
      return 'translate(' + r.x + 'px,' + r.y + 'px) scale(' + (r.w / W).toFixed(4) + ',' + (r.h / H).toFixed(4) + ')';
    }
    // Map the reading title onto the source title's box: align centres, match area (handles wraps).
    function titleFrom(src) {
      var f = K.rel(title, stage);
      var s = Math.sqrt((src.w * src.h) / (f.w * f.h));
      var tx = src.x + src.w / 2 - (f.x + f.w * s / 2), ty = src.y + src.h / 2 - (f.y + f.h * s / 2);
      return 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
    }

    return {
      root: root,
      get open() { return !root.hidden; },
      // from: { paper: rect, title: rect } in stage coordinates. back: called by the back button / Esc.
      show: async function (p, from, back_) {
        busy = true; onBack = back_;
        fill(p); root.hidden = false;
        page.setAttribute('aria-label', p.zh + ' · ' + p.en);
        fitTitle();
        fades.forEach(function (n) { n.style.opacity = 0; });
        var tFrom = titleFrom(from.title);
        var a = K.play(paper, [{ transform: paperFrom(from.paper) }, { transform: 'none' }], { duration: 600, easing: K.curve(0.8) });
        var b = K.play(title, [{ transform: tFrom }, { transform: 'none' }], { duration: 600, easing: K.curve(0.86) });
        await K.wait(380);
        // The sheet has landed: what was already printed on it is simply there.
        fades.forEach(function (n, i) { K.play(n, [{ opacity: 0 }, { opacity: n.classList.contains('rd-wash') ? 0.34 : 1 }], { duration: 200, delay: i * 20, easing: 'linear' }); });
        await Promise.all([a, b]);
        busy = false;
        back.focus({ preventScroll: true });
      },
      hide: async function (to) {
        busy = true;
        fades.forEach(function (n) { K.play(n, [{ opacity: getComputedStyle(n).opacity }, { opacity: 0 }], { duration: 110, easing: 'linear' }); });
        await K.wait(90);
        var tTo = titleFrom(to.title);
        var a = K.play(paper, [{ transform: 'none' }, { transform: paperFrom(to.paper) }], { duration: 460, easing: K.curve(0.95) });
        var b = K.play(title, [{ transform: 'none' }, { transform: tTo }], { duration: 460, easing: K.curve(0.95) });
        await Promise.all([a, b]);
        root.hidden = true; paper.style.transform = ''; title.style.transform = '';
        busy = false; onBack = null;
      }
    };
  }
  window.ShelfRead = ShelfRead;
})();
