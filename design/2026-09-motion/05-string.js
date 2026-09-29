/* 05 · B — red string. A coral thread runs pin to pin along the timeline, sagging as a catenary,
   drawing itself segment by segment as cards come into view. Hovering a card pulls its two strings
   taut (a spring on the sag) and quietly dims every card it isn't tied to. A dated ruler runs along
   the bottom edge. The string is the view's one accent, so pins and label dots go ink here. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var SAG = 0.17, TAUT = 0.26;  // sag as a fraction of span; hover pulls it to 26% of that

  function month(d) { var p = String(d).split('-'); return p[0] + '·' + p[1]; }

  window.FYString = function (cork) {
    var root = cork.root, vp = cork.viewport, track = cork.track, slots = cork.slots;
    var reduced = function () { return window.Pen && Pen.reduced(); };
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'string-layer'); svg.setAttribute('aria-hidden', 'true');
    track.appendChild(svg);
    var ruler = document.createElement('div');
    ruler.className = 'date-ruler'; ruler.setAttribute('aria-hidden', 'true');
    track.appendChild(ruler);

    var pts = [], segs = [], drawn = [], queue = [], drawing = false, seen = [], raf = 0;
    slots.forEach(function (s, i) {
      if (i < slots.length - 1) {
        var p = Pen.path('', { color: 'var(--mark)', width: 1.7 });
        p.classList.add('string-seg');
        svg.appendChild(p);
        segs.push({ el: p, f: 1, fv: 0, fT: 1 });
      }
    });

    function anchor(s) {
      var g = FYCork.geometry(s), el = s.el, a = (g.tilt + g.pinTilt) * Math.PI / 180, r = 25;
      var tx = el.offsetLeft + el.offsetWidth * g.pinLeft, ty = el.offsetTop + 13.8;
      return [tx + Math.sin(a) * r, ty - Math.cos(a) * r];   // where the thread wraps the shaft, under the head
    }
    // Catenary through two pins: s(t) = (cosh k − cosh k(2t−1)) / (cosh k − 1), plus a seeded wrist wobble.
    function catenary(p, q, f, seed) {
      var span = Math.hypot(q[0] - p[0], q[1] - p[1]), sag = span * SAG * f, k = 1.35, ck = Math.cosh(k), out = [];
      var r = Pen.rng(seed), ph = r() * 6, amp = 0.5 + r() * 0.5;
      for (var i = 0; i <= 22; i++) {
        var t = i / 22, s = (ck - Math.cosh(k * (2 * t - 1))) / (ck - 1);
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t + sag * s + Math.sin(t * 7 + ph) * amp * Math.sin(t * Math.PI)]);
      }
      return Pen.smooth(out);
    }
    function shape(i) { segs[i].el.setAttribute('d', catenary(pts[i], pts[i + 1], segs[i].f, 'string-' + i)); }

    function layout() {
      pts = slots.map(anchor);
      svg.setAttribute('width', track.scrollWidth); svg.setAttribute('height', track.offsetHeight);
      segs.forEach(function (s, i) { shape(i); if (!drawn[i]) hideSeg(i); });
      buildRuler();
    }
    function hideSeg(i) { var p = segs[i].el, L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 6); p.style.strokeDashoffset = L + 3; }   // +3: keep the round cap out of sight

    function buildRuler() {
      var xs = pts.map(function (p, i) { var s = slots[i]; return s.el.offsetLeft + s.el.offsetWidth * FYCork.geometry(s).pinLeft; });
      var x0 = xs[0] - 30, x1 = xs[xs.length - 1] + 30, r = Pen.rng('ruler');
      var line = [], n = 14;
      for (var i = 0; i <= n; i++) line.push([x0 + (x1 - x0) * i / n, 6 + Math.sin(i * 1.3 + r() * 3) * 0.5]);
      var html = '<svg class="ruler-line" width="' + track.scrollWidth + '" height="18"><path d="' + Pen.smooth(line) + '"/>';
      xs.forEach(function (x, j) { html += '<path class="ruler-tick" data-i="' + j + '" d="M' + x.toFixed(1) + ' 1 L' + (x + (r() - .5)).toFixed(1) + ' 12"/>'; });
      html += '</svg>';
      xs.forEach(function (x, j) {
        var p = slots[j].project;
        html += '<span class="ruler-label" data-i="' + j + '" style="left:' + x.toFixed(1) + 'px">' + month(p.sortDate) + (p.boardLead ? ' · pinned first 置顶' : '') + '</span>';
      });
      html += '<span class="ruler-cap" style="left:' + x0.toFixed(1) + 'px">started · 开始</span>';
      ruler.innerHTML = html;
    }

    /* ---- draw-in: one pen pass per segment, in order, as the far card comes into view ---- */
    function pump() {
      if (drawing || !queue.length) return;
      var i = queue.shift();
      if (drawn[i]) { pump(); return; }
      drawn[i] = true;
      var p = segs[i].el;
      if (reduced()) { p.style.strokeDasharray = 'none'; pump(); return; }
      drawing = true;
      var L = p.getTotalLength(), a = Pen.draw(p, { duration: Math.min(820, 320 + L * 0.9) });
      a.onfinish = function () { a.cancel(); p.style.strokeDasharray = 'none'; p.style.strokeDashoffset = 0; drawing = false; pump(); };
    }
    function want(i) { if (i >= 0 && i < segs.length && !drawn[i] && queue.indexOf(i) < 0) { queue.push(i); queue.sort(function (a, b) { return a - b; }); } }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = slots.findIndex(function (s) { return s.el === en.target; });
        seen[i] = true;
        if (seen[i - 1]) want(i - 1);
        if (seen[i + 1]) want(i);
      });
      pump();
    }, { root: vp, threshold: 0.5 });

    /* ---- hover: tighten its strings, dim the unrelated cards ---- */
    function tick() {
      raf = 0;
      var busy = false;
      segs.forEach(function (s, i) {
        if (Math.abs(s.f - s.fT) < 0.002 && Math.abs(s.fv) < 0.01) { if (s.f !== s.fT) { s.f = s.fT; s.fv = 0; shape(i); } return; }
        var k = s.fT < 1 ? 240 : 120, z = s.fT < 1 ? 0.5 : 0.62;    // snaps taut; slack returns heavier
        s.fv += (k * (s.fT - s.f) - 2 * z * Math.sqrt(k) * s.fv) / 60; s.f += s.fv / 60;
        shape(i); busy = true;
      });
      if (busy) raf = requestAnimationFrame(tick);
    }
    function focusCard(i) {
      root.classList.toggle('stringing', i != null);
      slots.forEach(function (s, j) { s.el.classList.toggle('dim', i != null && Math.abs(j - i) > 1); s.el.classList.toggle('tied', i === j); });
      ruler.querySelectorAll('[data-i]').forEach(function (n) { n.classList.toggle('on', Number(n.dataset.i) === i); });
      segs.forEach(function (s, j) {
        s.fT = i != null && (j === i || j === i - 1) && drawn[j] ? TAUT : 1;
        if (reduced()) { s.f = s.fT; s.fv = 0; shape(j); }
      });
      if (!reduced() && !raf) raf = requestAnimationFrame(tick);
    }
    var current = null;
    slots.forEach(function (s, i) {
      s.swing.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { current = i; focusCard(i); } });
      s.swing.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && current === i) { current = null; focusCard(null); } });
      s.el.addEventListener('focusin', function () { current = i; focusCard(i); });
      s.el.addEventListener('focusout', function (e) { if (!s.el.contains(e.relatedTarget) && current === i) { current = null; focusCard(null); } });
    });

    /* ---- native scrolling, as the live page does ---- */
    var btns = root.querySelectorAll('[data-step]');
    function updateBtns() {
      var max = vp.scrollWidth - vp.clientWidth;
      btns.forEach(function (b) { b.disabled = b.dataset.step < 0 ? vp.scrollLeft <= 2 : vp.scrollLeft >= max - 2; });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { vp.scrollBy({ left: b.dataset.step * Math.max(280, vp.clientWidth * .78), behavior: reduced() ? 'auto' : 'smooth' }); });
    });
    vp.addEventListener('scroll', updateBtns, { passive: true });

    new ResizeObserver(function () { layout(); updateBtns(); }).observe(track);
    document.addEventListener('mock:rm', function () { segs.forEach(function (s, i) { if (drawn[i]) s.el.style.strokeDasharray = 'none'; }); });
    layout();
    slots.forEach(function (s) { io.observe(s.el); });

    return {
      replay: function () {
        drawn = []; queue = []; seen = []; drawing = false;
        segs.forEach(function (s, i) { s.el.getAnimations().forEach(function (a) { a.cancel(); }); hideSeg(i); });
        vp.scrollTo({ left: 0, behavior: 'auto' });
        slots.forEach(function (s) { io.unobserve(s.el); });
        requestAnimationFrame(function () { slots.forEach(function (s) { io.observe(s.el); }); });
      },
      focus: focusCard
    };
  };
})();
