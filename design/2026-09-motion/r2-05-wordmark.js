/* r2-05 · W — the "Fred Agent" wordmark study. Five treatments that spend the card's one coral without
   a curve that rises at one end (round 1's pen underline bowed and lifted like a wrist finishing —
   read by Fred as Amazon's smile-arrow). Each is mounted on the real lead card and drawn once on
   arrival, seeded so every visit gets the same stroke.
     stop  — a coral full stop, typed in the same face: no stroke, no direction
     rule  — a level pen rule under "Agent": zero bow, never higher at the end than the start, blunt
     loop  — a pen loop round "Agent": closed, so no terminal; it ends back at the upper left
     star  — a die-cut sticker carrying a coral pen asterisk, footnote-high, at the end of the word
     pin   — ink-only wordmark; the coral moves to the lead card's pin head
     smile — round 1, kept only as the reference tile */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var ctx2d = document.createElement('canvas').getContext('2d');
  var f1 = function (n) { return Math.round(n * 10) / 10; };

  // Glyph metrics of "Agent" inside its inline-block (height = one line box).
  function metrics(mark) {
    var cs = getComputedStyle(mark), fs = parseFloat(cs.fontSize), lh = mark.offsetHeight;
    ctx2d.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
    var mA = ctx2d.measureText('A'), mg = ctx2d.measureText('g');
    var fA = mA.fontBoundingBoxAscent || fs * 0.98, fD = mA.fontBoundingBoxDescent || fs * 0.26;
    var base = (lh - (fA + fD)) / 2 + fA;
    return { fs: fs, w: mark.offsetWidth, h: lh, base: base, cap: base - (mA.actualBoundingBoxAscent || fs * 0.7), desc: base + (mg.actualBoundingBoxDescent || fs * 0.24) };
  }
  function svgIn(el) {
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'wm-fx'); svg.setAttribute('aria-hidden', 'true');
    el.appendChild(svg);
    return svg;
  }
  function hide(p) { var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L); }
  function inked(p) { var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = 0; }

  // A pen loop round a word: like pen.js loop (starts upper-left, a little over one lap, second lap
  // drifts out) but squarer (superellipse n≈2.6), so it clears the neighbouring word instead of cutting it.
  function ring(a, b, seed) {
    var r = Pen.rng(seed), start = Math.PI * (1.08 + r() * .1), laps = 1.13 + r() * .06, N = 34, pts = [], e = 2 / 2.6;
    for (var i = 0; i <= N; i++) {
      var t = i / N, th = start + t * laps * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      var grow = 1 + (t - .5) * .045, wob = 1 + Math.sin(t * 5.1 + 1.7) * .012;
      pts.push([Math.sign(c) * Math.pow(Math.abs(c), e) * a * grow * wob, Math.sign(s) * Math.pow(Math.abs(s), e) * b * grow * wob - t * b * .05]);
    }
    return Pen.smooth(pts);
  }

  var build = {
    stop: function (h) {   // hung past the last letter (hanging punctuation), so it never re-wraps the title
      var s = document.createElement('span');
      s.className = 'wm-fx-el wm-stop'; s.setAttribute('aria-hidden', 'true'); s.textContent = '.';
      h.mark.appendChild(s);
      return { els: [s], play: function () {   // a pen tap: the nib lands, the dot sits (two held frames)
        s.animate([{ transform: 'scale(.55)', opacity: 1 }, { transform: 'scale(1)', offset: .5 }, { transform: 'scale(1)' }], { duration: 170, easing: 'steps(1,end)' });
      } };
    },
    rule: function (h) {
      var m = metrics(h.mark), r = Pen.rng('fred-agent-rule'), y = m.desc + m.fs * 0.075, x0 = -m.fs * 0.02, x1 = m.w + m.fs * 0.01, pts = [];
      for (var i = 0; i <= 5; i++) pts.push([x0 + (x1 - x0) * i / 5, y + (i && i < 5 ? (r() - 0.5) * m.fs * 0.006 : 0)]);
      pts[5][1] = y + m.fs * 0.004;   // the end sits a hair lower than the start, never higher
      var p = Pen.path(Pen.smooth(pts), { width: Math.max(2.2, m.fs * 0.032), color: 'var(--mark)' });
      svgIn(h.mark).appendChild(p); hide(p);
      return { paths: [p], play: function () { Pen.draw(p, { duration: 300 }); } };
    },
    loop: function (h) {
      var m = metrics(h.mark), cx = m.w / 2 + m.fs * 0.04, cy = (m.cap + m.desc) / 2;   // nudged right: clear of the d in Fred
      var p = Pen.path(ring(m.w / 2 + m.fs * 0.02, (m.desc - m.cap) / 2 + m.fs * 0.16, 'fred-agent-loop'), { width: Math.max(1.9, m.fs * 0.026), color: 'var(--mark)' });
      p.setAttribute('transform', 'translate(' + f1(cx) + ' ' + f1(cy) + ')');
      svgIn(h.mark).appendChild(p); hide(p);
      return { paths: [p], play: function () { Pen.draw(p, { duration: 640 }); } };
    },
    star: function (h) {
      var m = metrics(h.mark), R = Math.max(13, m.fs * 0.21), r = Pen.rng('fred-agent-star');
      var st = document.createElement('span');
      st.className = 'wm-fx-el wm-sticker'; st.setAttribute('aria-hidden', 'true');
      st.style.cssText = 'width:' + f1(R * 2) + 'px;height:' + f1(R * 2) + 'px;left:' + f1(m.w + m.fs * 0.06 - R) + 'px;top:' + f1(m.cap - m.fs * 0.1 - R) + 'px';
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '-12 -12 24 24');
      // die-cut edge: cut by hand round the drawing, so a lumpy disc, not a circle (a circle reads as ®)
      var edge = [], n = 9, k;
      for (k = 0; k < n; k++) { var a = k / n * Math.PI * 2, rr = 10.2 + (r() - 0.5) * 1.8; edge.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
      edge.push(edge[0], edge[1], edge[2]);
      var cut = Pen.path(Pen.smooth(edge), { width: 1.3, color: 'var(--ink)' });
      cut.setAttribute('fill', 'var(--paper)'); cut.setAttribute('class', 'wm-cut');
      svg.appendChild(cut);
      st.appendChild(svg); h.mark.appendChild(st);
      var paths = [96, 30, 154].map(function (deg) {   // three strokes through the centre, one pen
        var a = (deg + (r() - 0.5) * 12) * Math.PI / 180, L = 5.4 + r() * 0.7, c = Math.cos(a), s = Math.sin(a);
        var p = Pen.path('M' + f1(-c * L) + ' ' + f1(-s * L) + ' L' + f1(c * L) + ' ' + f1(s * L), { width: 2, color: 'var(--mark)' });
        svg.appendChild(p); hide(p); return p;
      });
      return { els: [st], paths: paths, play: function () {   // hand's clock: stuck on (held frame), then one stroke per frame
        st.animate([{ transform: 'rotate(-4deg) scale(1.12)' }, { transform: 'rotate(-9deg) scale(1)', offset: .5 }, { transform: 'rotate(-9deg) scale(1)' }], { duration: 160, easing: 'steps(1,end)' });
        paths.forEach(function (p, i) { Pen.draw(p, { duration: 60, delay: 180 + i * 100 }); });
      } };
    },
    pin: function (h) {
      if (h.slot) h.slot.classList.add('wm-pin-coral');
      return { play: function () {
        var pin = h.slot && h.slot.querySelector('.board-pin');
        if (!pin || h.slot.classList.contains('unpinned')) return;
        var g = FYCork.geometry(h.slot), pose = 'translateX(-50%) rotate(' + (g.pinTilt + g.tilt) + 'deg)';
        pin.animate([{ transform: pose + ' translateY(-14px) rotate(10deg)' }, { transform: pose + ' scale(1.12,.78)', offset: .34 }, { transform: pose + ' scale(.97,1.04)', offset: .67 }, { transform: pose }], { duration: 210, easing: 'steps(1,end)' });
      } };
    },
    smile: function (h) {   // round 1, verbatim: pen.js underline (bowed, lifts at the end), seed 'fred-agent-wordmark'
      var m = metrics(h.mark), y = m.h - 2, p = Pen.path(Pen.underline(m.w, 'fred-agent-wordmark', { y: y }), { width: 3, color: 'var(--mark)' });
      svgIn(h.mark).appendChild(p); hide(p);
      return { paths: [p], play: function () { Pen.draw(p); } };
    }
  };

  /* mount(paper, { slot, variant }) → handle. handle.set(v, animate) swaps the treatment;
     handle.replay() redraws it; a resize rebuilds at the new size without replaying. */
  function mount(paper, o) {
    var h = { paper: paper, mark: paper.querySelector('.wm-mark'), slot: o.slot || null, variant: null, fx: null, drawn: false };
    function clear() {
      paper.querySelectorAll('.wm-fx, .wm-fx-el').forEach(function (n) { n.remove(); });
      paper.classList.remove('wm--' + h.variant);
      if (h.slot) h.slot.classList.remove('wm-pin-coral');
    }
    function render() {
      h.bw = h.mark.offsetWidth; h.bh = h.mark.offsetHeight;   // the size this treatment was built at
      paper.classList.add('wm--' + h.variant);
      h.fx = build[h.variant](h);
      if (h.drawn || Pen.reduced()) (h.fx.paths || []).forEach(inked);
    }
    h.set = function (v, animate) {
      clear(); h.variant = v; render();
      if (animate) h.play();
    };
    h.play = function () {
      h.drawn = true;
      if (Pen.reduced()) { (h.fx.paths || []).forEach(inked); return; }
      (h.fx.paths || []).forEach(hide);
      h.fx.play();
    };
    h.replay = function () { h.set(h.variant, true); };
    // Rebuild whenever the word's box differs from the one the mark was built for (font swap, reflow,
    // a stage that was display:none); a drawn mark stays drawn, without replaying.
    new ResizeObserver(function () {
      var w = h.mark.offsetWidth, hh = h.mark.offsetHeight;
      if (!w || (w === h.bw && hh === h.bh)) return;
      clear(); render();
    }).observe(h.mark);
    // Drawn once, when the card is actually seen.
    new IntersectionObserver(function (en, io) {
      if (en[0].isIntersecting) { io.disconnect(); setTimeout(function () { if (!h.drawn) h.play(); }, 280); }
    }, { threshold: 0.6 }).observe(h.mark);
    h.set(o.variant || 'rule', false);
    return h;
  }

  window.FYWordmark = { mount: mount, variants: ['stop', 'rule', 'loop', 'star', 'pin'] };
})();
