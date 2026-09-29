/* r2-08b-slip.js — the narrow-screen note, shared by A and C (B unfolds in place instead).
   Not a sheet: the pen cuts a slot near the bottom of the page and the note is a paper slip pulled up out of it.
   Its tail stays tucked in the slot (the page's lip covers it and casts a thin contact shadow), it comes out
   leaning and straightens as it rises (pivot in the slot), and a swipe down pushes it back in. Physics clock.
   FN.Slip(ctx, model) → { open(note), close(v), note() }. */
(function () {
  var LIP = 26, TUCK = 16;

  FN.Slip = function (ctx, model, opt) {
    var rd = ctx.rd, root = document.createElement('div');
    root.className = 'fs-root' + (opt && opt.card ? ' fs-card' : '');   // C pulls a catalogue card out of the slot
    root.innerHTML =
      '<div class="fs-well"><aside class="fs-slip" role="dialog" aria-label="Note · 注释" tabindex="-1">' +
        '<button class="fs-grip" type="button" aria-label="Close · 收起"><svg width="46" height="8" aria-hidden="true"><path d="M3 4.6 C 14 3.1, 29 5.6, 43 3.7"/></svg></button>' +
        '<div class="fs-head"><span class="fs-no"></span><span class="fs-lab">参考 · reference</span></div>' +
        '<div class="fs-body"></div>' +
        '<div class="fs-foot"><a class="fs-all" href="#">全部参考 · all references ↓</a><span>下滑收起 · swipe down</span></div><span class="fs-hole" aria-hidden="true"></span>' +
      '</aside></div>' +
      '<div class="fs-lip" aria-hidden="true"><svg class="fs-slot"><path class="fs-cut"/></svg></div>';
    ctx.frame.appendChild(root);
    var slip = root.querySelector('.fs-slip'), lip = root.querySelector('.fs-lip'), cut = root.querySelector('.fs-cut');
    var no = root.querySelector('.fs-no'), body = root.querySelector('.fs-body');
    var Y = 400, V = 0, target = 400, H = 300, raf = 0, cur = null, refLoop = null, drag = null;

    function pose() {
      // it leans while it is still coming out and straightens as it is pulled clear (pivot sits in the slot)
      var k = Math.max(-.2, Math.min(1, (Y - TUCK) / Math.max(1, H)));
      slip.style.transform = 'translateY(' + Y.toFixed(1) + 'px) rotate(' + (-.5 - 3.2 * k).toFixed(2) + 'deg)';
    }
    function spring(k, c) {
      cancelAnimationFrame(raf);
      var last = performance.now();
      (function step(now) {
        var dt = Math.min(32, now - last) / 1000; last = now;
        for (var s = 0; s < 4; s++) { V += (-k * (Y - target) - c * V) * dt / 4; Y += V * dt / 4; }
        pose();
        if (!cur && Y >= H) { hideAll(); return; }                          // back inside the slot: done
        if (Math.abs(V) < 6 && Math.abs(Y - target) < .5) { Y = target; pose(); if (!cur) hideAll(); return; }
        raf = requestAnimationFrame(step);
      })(last);
    }
    function slot() {
      var w = root.clientWidth, r = Pen.rng('fs-slot-' + ctx.key), pts = [];
      for (var i = 0; i <= 8; i++) pts.push([10 + (w - 20) * i / 8, 3 + (r() - .5) * 1.2 + (i === 0 || i === 8 ? 1 : 0)]);
      root.querySelector('.fs-slot').setAttribute('width', w);
      cut.setAttribute('d', Pen.smooth(pts));
    }
    function hideAll() { root.classList.remove('open'); Pen.erase(cut, { duration: 140 }); }
    function loopRef(a) {
      if (refLoop) { var o = refLoop; o.hide(); setTimeout(function () { o.svg.remove(); }, 220); refLoop = null; }
      if (a) { refLoop = Pen.annotate(a, 'loop', { manual: true, seed: 'fs-ref-' + a.dataset.n, pad: 3, width: 1.6, duration: 200 }); refLoop.show(); }
    }

    function open(note) {
      var swap = !!cur && cur !== note, again = cur === note;
      cur = note;
      no.textContent = (opt && opt.card ? 'No. ' : '') + note.n;
      root.querySelector('.fs-lab').textContent = opt && opt.card ? note.entries[0].host : '参考 · reference';
      body.innerHTML = FN.fields(note, true);
      root.querySelector('.fs-all').setAttribute('href', note.a.getAttribute('href'));
      if (!again) loopRef(note.a);
      if (!root.classList.contains('open')) {
        root.classList.add('open'); slot();
        H = slip.offsetHeight + 12; Y = H; V = 0; pose();
        var d = Pen.draw(cut, { duration: 160 });
        if (Pen.reduced()) { Y = target = TUCK; pose(); }
        else setTimeout(function () { if (cur === note) { target = TUCK; spring(260, 21); } }, d ? 110 : 0);
      } else if (swap && !Pen.reduced()) {
        H = slip.offsetHeight + 12; V = 520; target = TUCK; spring(420, 30);   // tucked a little and pulled again
      }
      slip.focus({ preventScroll: true });
    }
    function close(v) {
      if (!cur) return;
      var a = cur.a; cur = null; loopRef(null);
      target = H + 10; V = v || 0;
      if (Pen.reduced()) { Y = target; pose(); hideAll(); } else spring(300, 26);
      if (root.contains(document.activeElement)) a.focus({ preventScroll: true });
    }

    rd.addEventListener('click', function (e) { if (cur && !e.target.closest('.fnref a[data-n]')) close(0); });
    root.querySelector('.fs-grip').addEventListener('click', function () { close(0); });
    root.querySelector('.fs-all').addEventListener('click', function (e) {
      e.preventDefault(); var id = this.getAttribute('href'); close(0);
      var el = rd.querySelector(id); if (el) ctx.scrollTo(ctx.top(el) - ctx.navH() - 24);
    });
    slip.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(0); });

    // swipe down: the slip follows the finger (upward pulls resist), release keeps the finger's velocity
    slip.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button')) return;
      drag = { y: e.clientY, y0: Y, t: performance.now(), v: 0 };
      cancelAnimationFrame(raf); slip.setPointerCapture(e.pointerId);
    });
    slip.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var now = performance.now(), dy = e.clientY - drag.y, ny = dy < 0 ? drag.y0 + dy * .25 : drag.y0 + dy;
      drag.v = (ny - Y) / Math.max(1, now - drag.t) * 1000; drag.t = now; Y = ny; pose();
    });
    function release() {
      if (!drag) return;
      var d = drag; drag = null;
      if (Y - TUCK > 64 || d.v > 520) close(Math.max(d.v, 300)); else { target = TUCK; V = d.v; spring(260, 21); }
    }
    slip.addEventListener('pointerup', release);
    slip.addEventListener('pointercancel', release);
    ctx.onLayout(function () { if (cur) { slot(); H = slip.offsetHeight + 12; } });
    return { open: open, close: close, note: function () { return cur; } };
  };
})();
