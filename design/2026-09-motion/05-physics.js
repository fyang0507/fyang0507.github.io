/* 05 · A — pinned paper physics. One rAF loop per board, asleep whenever everything is at rest.
   Board: drag/swipe with momentum, soft edge resistance, horizontal wheel/trackpad, ←/→ card steps.
   Cards: each hangs from its pin as a damped pendulum driven by the board's motion.
     φ'' = −ω²(φ − φ₀) − 2ζω φ' + F,   F = (KD·V + KA·A) / L        (soft-limited)
   V, A = board velocity/acceleration on screen. KD is air drag on light paper (the card trails while
   the board moves); KA is inertia (it lags on the start, swings past on the stop). ω = √(G/L) with L
   ≈ ⅔ of the card's height, so tall cards swing slower. Taped cards are stiff and barely flex. */
(function () {
  var G = 8600;          // px/s² — a 240px slip swings with a ~0.85s period, a 156px slip ~0.69s
  var KD = 0.28, KA = 0.05;
  var MAX_SWING = 0.15;  // rad (~8.6°): paper on a pin never flips, however hard the flick
  var TAU = 0.33;        // s — momentum decay, like a heavy board on rails
  var EDGE_K = 170;      // edge spring (critically damped: the board itself never bounces)

  window.FYPhysics = function (cork, opt) {
    opt = opt || {};
    var root = cork.root, vp = cork.viewport, track = cork.track;
    var btns = root.querySelectorAll('[data-step]');
    var cards = cork.slots.map(function (s) {
      return { s: s, slot: s.el, swing: s.swing, taped: s.kind === 'lead' || s.kind === 'featured', phi: 0, w: 0, rest: 0, target: 0, sc: 1, sv: 0, sTarget: 1, hover: false, focus: false, written: '' };
    });
    var x = 0, v = 0, max = 0, mode = 'idle', tween = null, chaseTarget = 0, wheelTimer = 0;
    var raf = 0, last = 0, visible = true, xPrev = 0, Vf = 0, VfPrev = 0, Af = 0;
    var drag = null, suppressUntil = 0;
    var reduced = function () { return window.Pen && Pen.reduced(); };

    function measure() {
      var cs = getComputedStyle(vp);
      max = Math.max(0, track.offsetWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) - vp.clientWidth);
      cards.forEach(function (c) {
        var g = FYCork.geometry(c.slot);
        c.rest = g.tilt * Math.PI / 180;
        c.L = Math.max(90, c.slot.offsetHeight * 0.66);
        c.omega = Math.sqrt(G / c.L) * (c.taped ? 2.1 : 1);
        c.zeta = c.taped ? 0.72 : 0.46;   // paper: one overshoot of ~10%, the next is invisible
        c.gain = c.taped ? 0.1 : 1;
        c.target = c.hover || c.focus ? c.rest * 0.3 : c.rest;
        if (!raf) { c.phi = c.target; c.w = 0; write(c); }
      });
      if (!raf) { x = clamp(x); render(); }
    }
    var clamp = function (n) { return Math.min(max, Math.max(0, n)); };
    function rubber(raw) {
      var D = vp.clientWidth * 0.45;
      if (raw < 0) return -D * (1 - 1 / (1 + -raw * 0.55 / D));
      if (raw > max) return max + D * (1 - 1 / (1 + (raw - max) * 0.55 / D));
      return raw;
    }
    function write(c) {
      var t = 'rotate(' + (c.phi * 180 / Math.PI).toFixed(3) + 'deg)' + (Math.abs(c.sc - 1) > 0.0002 ? ' scale(' + c.sc.toFixed(4) + ')' : '');
      if (t !== c.written) { c.swing.style.transform = t; c.written = t; }
    }
    var lastBtn = '';
    function render() {
      track.style.transform = 'translate3d(' + (-x).toFixed(2) + 'px,0,0)';
      var state = (x <= 1 ? 'a' : '') + (x >= max - 1 ? 'b' : '');
      if (state !== lastBtn) { lastBtn = state; btns.forEach(function (b) { b.disabled = b.dataset.step < 0 ? x <= 1 : x >= max - 1; }); }
    }

    function wake() {
      if (reduced()) { settleNow(); return; }
      if (!raf && visible) { last = performance.now(); xPrev = x; raf = requestAnimationFrame(frame); }
    }
    function settleNow() {
      if (mode !== 'drag' && mode !== 'wheel') { if (mode === 'tween') x = tween.x0 + tween.dx; x = clamp(x); v = 0; mode = 'idle'; }
      cards.forEach(function (c) { c.phi = c.target; c.w = 0; c.sc = reduced() ? 1 : c.sTarget; c.sv = 0; write(c); });
      Vf = VfPrev = Af = 0; render();
    }

    function frame(now) {
      raf = 0;
      var dt = Math.min(0.034, Math.max(0.001, (now - last) / 1000)); last = now;
      if (mode === 'tween') {
        var p = Math.min(1, (now - tween.t0) / tween.T), e = p * p * p * (10 - 15 * p + 6 * p * p);  // minimum-jerk
        x = tween.x0 + tween.dx * e;
        if (p >= 1) { mode = 'idle'; v = 0; }
      } else if (mode === 'chase') {
        var k = 520, a = k * (chaseTarget - x) - 2 * Math.sqrt(k) * v;
        v += a * dt; x += v * dt;
        if (Math.abs(chaseTarget - x) < 0.3 && Math.abs(v) < 6) { x = chaseTarget; v = 0; mode = (x < 0 || x > max) ? 'fling' : 'idle'; }
      } else if (mode === 'fling') {
        var edge = x < 0 ? 0 : x > max ? max : null;
        if (edge !== null) {
          var a2 = EDGE_K * (edge - x) - 2 * Math.sqrt(EDGE_K) * v;
          v += a2 * dt; x += v * dt;
          if (Math.abs(x - edge) < 0.3 && Math.abs(v) < 8) { x = edge; v = 0; mode = 'idle'; }
        } else {
          v *= Math.exp(-dt / TAU); x += v * dt;
          if (Math.abs(v) < 12) { v = 0; mode = 'idle'; }
        }
      }
      render();

      // Board motion on screen, lightly smoothed so pointer jitter doesn't become card jitter.
      var V = -(x - xPrev) / dt; xPrev = x;
      Vf += (V - Vf) * (1 - Math.exp(-dt / 0.035));
      var Araw = (Vf - VfPrev) / dt; VfPrev = Vf;
      Af += (Araw - Af) * (1 - Math.exp(-dt / 0.05));

      var busy = mode !== 'idle' || Math.abs(Vf) > 1 || Math.abs(Af) > 15;
      cards.forEach(function (c) {
        var w2 = c.omega * c.omega, Fmax = MAX_SWING * w2;
        var F = (KD * Vf + KA * Af) / c.L * c.gain;
        F = Fmax * Math.tanh(F / Fmax);
        for (var i = 0, h = dt / 3; i < 3; i++) {
          var acc = -w2 * (c.phi - c.target) - 2 * c.zeta * c.omega * c.w + F;
          c.w += acc * h; c.phi += c.w * h;
        }
        var sk = 300, sa = sk * (c.sTarget - c.sc) - 2 * 0.62 * Math.sqrt(sk) * c.sv;
        c.sv += sa * dt; c.sc += c.sv * dt;
        if (Math.abs(c.phi - c.target) > 0.0012 || Math.abs(c.w) > 0.01 || Math.abs(c.sc - c.sTarget) > 0.0004 || Math.abs(c.sv) > 0.004) busy = true;
        else if (!busy || Math.abs(F) < 1e-4) { c.phi = c.target; c.w = 0; c.sc = c.sTarget; c.sv = 0; }
        write(c);
      });
      if (busy && visible) raf = requestAnimationFrame(frame);
      else { Vf = VfPrev = Af = 0; if (!visible) settleNow(); }
    }

    /* ---- panning ---- */
    function go(target, instant) {
      target = clamp(target);
      if (instant || reduced()) { mode = 'idle'; x = target; v = 0; settleNow(); return; }
      tween = { x0: x, dx: target - x, t0: performance.now(), T: Math.min(1100, Math.max(640, 560 + Math.abs(target - x) * 0.45)) };
      mode = 'tween'; wake();
    }
    function stops() { return cards.map(function (c) { return clamp(c.slot.offsetLeft); }); }
    function step(dir) {
      var cur = mode === 'tween' ? tween.x0 + tween.dx : x, list = stops(), next = null;
      if (dir > 0) { for (var i = 0; i < list.length; i++) if (list[i] > cur + 8) { next = list[i]; break; } }
      else { for (var j = list.length - 1; j >= 0; j--) if (list[j] < cur - 8) { next = list[j]; break; } }
      go(next == null ? (dir > 0 ? max : 0) : next);
    }
    function fling(vel) { if (reduced()) return; v = vel; mode = 'fling'; wake(); }
    btns.forEach(function (b) { b.addEventListener('click', function () { step(Number(b.dataset.step)); }); });
    vp.addEventListener('keydown', function (e) {
      if (e.target !== vp) return;
      var k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowLeft') { e.preventDefault(); step(k === 'ArrowRight' ? 1 : -1); }
      else if (k === 'Home' || k === 'End') { e.preventDefault(); go(k === 'Home' ? 0 : max); }
    });
    // Tabbing into a card brings it into view (overflow: clip means the browser can't scroll for us).
    vp.addEventListener('focusin', function (e) {
      var slot = e.target.closest('.slot');
      if (!slot) return;
      var left = slot.offsetLeft, right = left + slot.offsetWidth, span = vp.clientWidth - 60;
      if (left < x || right > x + span) go(left);
    });

    vp.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || e.target.closest('.note-pop')) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, start: x, on: false, samples: [[e.timeStamp, e.clientX]] };
      if (mode === 'fling' || mode === 'tween' || mode === 'chase') { drag.on = true; begin(e); }  // catch a moving board
    });
    function begin(e) {
      drag.on = true; drag.start = x + (e.clientX - drag.x0);   // no jump when the drag threshold is crossed
      mode = 'drag'; v = 0;
      try { vp.setPointerCapture(drag.id); } catch (err) { /* pointer already gone */ }
      root.classList.add('grabbing');
      cards.forEach(function (c) { if (c.hover) unhover(c); });
      wake();
    }
    vp.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.on) {
        if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) begin(e);
        else if (Math.abs(dy) > 10) { drag = null; return; }   // a vertical gesture belongs to the page
        else return;
      }
      x = rubber(drag.start - dx);
      drag.samples.push([e.timeStamp, e.clientX]);
      if (drag.samples.length > 8) drag.samples.shift();
      if (reduced()) render(); else wake();
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var was = drag.on, s = drag.samples, now = e.timeStamp;
      drag = null;
      if (!was) return;
      root.classList.remove('grabbing');
      if (e.type === 'pointerup') suppressUntil = performance.now() + 60;
      // Release velocity from the last ~100ms of pointer samples.
      var i = s.length - 1; while (i > 0 && now - s[i - 1][0] < 100) i--;
      var dtS = (now - s[i][0]) / 1000, vel = dtS > 0.008 ? -(s[s.length - 1][1] - s[i][1]) / dtS : 0;
      if (now - s[s.length - 1][0] > 90) vel = 0;       // held still before letting go
      vel = Math.max(-5200, Math.min(5200, vel));
      if (reduced()) { x = clamp(x); settleNow(); return; }
      v = vel; mode = 'fling'; wake();
    }
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    vp.addEventListener('click', function (e) { if (performance.now() < suppressUntil) { e.preventDefault(); e.stopPropagation(); } }, true);

    // Horizontal wheel / trackpad only: a vertical wheel keeps scrolling the page (no scroll-jacking).
    vp.addEventListener('wheel', function (e) {
      var unit = e.deltaMode === 1 ? 16 : 1;
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (!d) return;
      e.preventDefault();
      d *= unit;
      if (reduced()) { x = clamp(x + d); render(); return; }
      if (mode !== 'chase') { chaseTarget = x; v = mode === 'fling' ? v : 0; }
      var out = chaseTarget < 0 || chaseTarget > max;
      chaseTarget = Math.max(-70, Math.min(max + 70, chaseTarget + d * (out ? 0.3 : 1)));
      mode = 'chase'; wake();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () { if (mode === 'chase' && (chaseTarget < 0 || chaseTarget > max)) { chaseTarget = clamp(chaseTarget); wake(); } }, 140);
    }, { passive: false });

    /* ---- hover / focus: lift toward the viewer, pivoting on the pin ---- */
    function retarget(c) {
      var up = c.hover || c.focus;
      c.target = up ? c.rest * 0.3 : c.rest;
      c.sTarget = up ? (c.taped ? 1.012 : 1.03) : 1;
      c.slot.classList.toggle('lifted', up);
      wake();
    }
    function unhover(c) { c.hover = false; retarget(c); }
    cards.forEach(function (c) {
      c.swing.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' && !drag) { c.hover = true; retarget(c); } });
      c.swing.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && c.hover) unhover(c); });
      c.slot.addEventListener('focusin', function () { c.focus = true; retarget(c); });
      c.slot.addEventListener('focusout', function (e) { if (!c.slot.contains(e.relatedTarget)) { c.focus = false; retarget(c); } });
    });

    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) wake(); }).observe(root);
    new ResizeObserver(function () { measure(); }).observe(root);
    document.addEventListener('mock:rm', function () { settleNow(); });
    measure();

    return {
      go: go, step: step, fling: fling, measure: measure,
      state: function () { return { x: x, v: v, max: max, mode: mode, sleeping: !raf, cards: cards.map(function (c) { return +(c.phi * 180 / Math.PI).toFixed(3); }) }; }
    };
  };
})();
