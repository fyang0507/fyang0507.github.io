/* 08-reading-d.js — D · Hero settles / 题图落定.
   The nav is always opaque, but it paints the exact slice of the wash that is behind it (a clipped copy on the
   same timeline), so it reads as transparent at the top while text can never pass through it — the overlap bug
   is gone structurally. Reading pulls paper up over the cover as halftone dots (no gradient); when the wash is
   gone the nav has paper and a hairline, and the title has tucked into it. At the end the previous essay's
   cover develops out of the same dots.
   Engine: CSS scroll timelines (animation-timeline: scroll(), px ranges from layout) where supported;
   otherwise a rAF fallback applies the same keyframes. Reduced motion: static wash, discrete nav state. */
(function () {
  var ctx = RD.mount(document.getElementById('stage-d'), 'd');
  RD.progressBar(ctx);
  RD.hint(ctx, 'scroll slowly ↓ 慢慢往下');
  var stage = ctx.stage, rd = ctx.rd, NS = 'http://www.w3.org/2000/svg';
  var forceJS = /[?&]sda=0/.test(location.search);
  var SDA = !forceJS && window.CSS && CSS.supports('animation-timeline: scroll()') && CSS.supports('animation-range: 0px 100px');
  var engine = document.getElementById('d-engine');
  rd.classList.add('d-on');

  var nav = ctx.nav(), fig = rd.querySelector('.post-wash'), mid = rd.querySelector('.rnav-mid');
  var title = rd.querySelector('.article-intro .title'), backT = rd.querySelector('.back-t');

  // halftone front: paper with round holes that shrink toward the solid edge, so the cover survives as
  // shrinking dots of ink on paper (a print dissolve), never a gradient. Seeded jitter: stippled, not screened.
  var uid = 0;
  function band(w, seed, cell, rows) {
    cell = cell || 9; rows = rows || 13;
    var r = Pen.rng(seed), holes = '', id = 'd-ht-' + (++uid);
    for (var y = 0; y < rows; y++) {
      var k = Math.pow(1 - y / rows, 1.15), rad = cell * .74 * k;
      for (var x = -cell; x < w + cell; x += cell) {
        var cx = x + (y % 2 ? cell / 2 : 0) + (r() - .5) * cell * .14, cy = y * cell + cell / 2 + (r() - .5) * cell * .12;
        var rr = rad * (.84 + r() * .3);
        if (rr > .3) holes += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + rr.toFixed(2) + '"/>';
      }
    }
    return '<svg class="d-dots" width="' + w + '" height="' + rows * cell + '" aria-hidden="true"><defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="0" y="0" width="' + w + '" height="' + rows * cell + '">' +
      '<rect width="' + w + '" height="' + rows * cell + '" fill="#fff"/><g fill="#000">' + holes + '</g></mask></defs>' +
      '<rect class="d-paper" width="' + w + '" height="' + rows * cell + '" mask="url(#' + id + ')"/></svg>';
  }
  function front(cls) { var f = document.createElement('div'); f.className = 'd-front ' + (cls || ''); return f; }

  var pageFront = front(); fig.appendChild(pageFront);
  var navWash = document.createElement('div');
  navWash.className = 'd-navwash'; navWash.setAttribute('aria-hidden', 'true');
  navWash.innerHTML = '<img alt="" decoding="async">';
  var navFront = front(); navWash.appendChild(navFront);
  nav.insertBefore(navWash, nav.firstChild);
  var navImg = navWash.querySelector('img'), figImg = fig.querySelector('img');
  navImg.src = figImg.getAttribute('src'); navImg.srcset = figImg.getAttribute('srcset'); navImg.sizes = '100vw';
  var navTitle = document.createElement('div');
  navTitle.className = 'd-navtitle';
  navTitle.innerHTML = title.innerHTML;
  mid.appendChild(navTitle);

  // ending: the previous essay's cover develops out of the same dots
  var pn = rd.querySelector('.pn a'), dev = null, devFront = null;
  if (pn && pn.dataset.cover) {
    dev = document.createElement('div');
    dev.className = 'd-dev'; dev.setAttribute('aria-hidden', 'true');
    dev.innerHTML = '<img alt="" src="' + pn.dataset.cover + '" decoding="async">';
    devFront = front('d-front-dev'); dev.appendChild(devFront);
    pn.appendChild(dev); pn.classList.add('d-pn');
  }

  var G = { W: 1, E: 1, t0: 0, t1: 1, h0: 0, h1: 1, e0: 0, e1: 1, devT: 1, scale: 1.18 };
  function layout() {
    var W = fig.offsetHeight, navH = ctx.navH(), vh = rd.clientHeight, w = rd.clientWidth;
    G.W = W; G.E = W;                                   // paper rises one wash-height over one wash-height of scroll
    // front screen y = W − s(W/E + 1): reaches the nav's bottom edge, then the top of the window
    G.h1 = W / (W / G.E + 1); G.h0 = Math.max(0, (W - navH) / (W / G.E + 1));
    var tt = ctx.top(title);
    G.t0 = tt - navH; G.t1 = tt + title.offsetHeight - navH;
    if (pn) {                                           // develop while the card rises into view; finish before the scroll ends
      var pt = ctx.top(pn), max = rd.scrollHeight - vh;
      G.e1 = Math.min(pt - vh * .45, max - 24); G.e0 = Math.min(pt - vh + 30, G.e1 - 160);
    }
    var s = rd.style;
    // narrow: the tucked title takes the back label's place ("← 谷歌只想躺赢"), since the middle is too small
    var narrow = w <= 640, navR = nav.getBoundingClientRect();
    rd.classList.toggle('d-narrow', narrow);
    if (narrow) {
      var ar = rd.querySelector('.back-arrow').getBoundingClientRect(), rt = rd.querySelector('.rnav .right').getBoundingClientRect();
      s.setProperty('--d-tl', Math.round(ar.right - navR.left + 2) + 'px');
      s.setProperty('--d-tr', Math.round(navR.right - rt.left + 10) + 'px');
    }
    s.setProperty('--d-w', W + 'px'); s.setProperty('--d-e', G.E + 'px');
    s.setProperty('--d-h0', G.h0 + 'px'); s.setProperty('--d-h1', G.h1 + 'px');
    s.setProperty('--d-t0', G.t0 + 'px'); s.setProperty('--d-t1', G.t1 + 'px');
    s.setProperty('--d-e0', G.e0 + 'px'); s.setProperty('--d-e1', G.e1 + 'px');
    [pageFront, navFront].forEach(function (f) { f.innerHTML = band(w, 'd-hero-' + w); });
    if (devFront) { devFront.innerHTML = band(Math.ceil(dev.offsetWidth) + 10, 'd-dev', 7, 9); G.devT = dev.offsetHeight + 63; s.setProperty('--d-devt', G.devT + 'px'); }
    G.scale = parseFloat(getComputedStyle(fig).getPropertyValue('--d-scale')) || 1.18;
    var rm = Pen.reduced();
    rd.classList.toggle('d-sda', SDA && !rm);
    rd.classList.toggle('d-js', !SDA && !rm);
    rd.classList.toggle('d-rm', rm);
    if (engine) engine.textContent = rm ? '· now: reduced motion (static)' : SDA ? '· now: CSS scroll timeline' : '· now: rAF fallback';
    if (!SDA || rm) clearInline();
  }
  function clearInline() { [figImg, navImg, pageFront, navFront, navWash, navTitle, devFront, backT].forEach(function (el) { if (el) { el.style.transform = ''; el.style.opacity = ''; } }); nav.style.removeProperty('--d-hair'); }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function update(s) {
    if (rd.classList.contains('d-rm')) {
      // discrete states only: paper the moment anything scrolls under the nav; title shown once the heading is gone
      rd.classList.toggle('nav-solid', s > 6);
      rd.classList.toggle('d-tucked', s > G.t1);
      if (dev) dev.classList.add('d-developed');
      return;
    }
    if (!rd.classList.contains('d-js')) return;           // CSS scroll timelines are doing the work
    var pw = clamp(s / G.W), pe = clamp(s / G.E), H = G.W;
    var drift = 'translateY(' + (.22 * H * pw).toFixed(1) + 'px) scale(' + G.scale + ')';
    figImg.style.transform = drift; navImg.style.transform = drift;
    pageFront.style.transform = navFront.style.transform = 'translateY(' + (-H * pe).toFixed(1) + 'px)';
    navWash.style.transform = 'translateY(' + (-H * pw).toFixed(1) + 'px)';
    nav.style.setProperty('--d-hair', clamp((s - G.h0) / (G.h1 - G.h0)).toFixed(3));
    var q = clamp((s - G.t0) / (G.t1 - G.t0));
    navTitle.style.opacity = q.toFixed(3); navTitle.style.transform = 'translateY(' + (110 * (1 - q)).toFixed(1) + '%)';
    backT.style.opacity = rd.classList.contains('d-narrow') ? (1 - q).toFixed(3) : '';
    if (devFront) devFront.style.transform = 'translateY(' + (clamp((s - G.e0) / (G.e1 - G.e0)) * G.devT).toFixed(1) + 'px)';
  }

  ctx.onLayout(layout);
  ctx.onScroll(update);
  ctx.layout();
  window.replayD = function () { ctx.scrollTo(0); };
  window.__D = { ctx: ctx, G: G, SDA: SDA };
})();
