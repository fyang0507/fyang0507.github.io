/* 08-reading-b.js — B · Footnotes that point / 会指的脚注.
   Notes are reset as readable text (not hand). Hover/focus a ref → one pencil line from the ref, through the
   leading (never across glyphs), down the gutter to its note, then a loop around the note number.
   Narrow screens: tapping a ref slides the note up as a paper slip on a spring; swipe or tap to dismiss. */
(function () {
  var ctx = RD.mount(document.getElementById('stage-b'), 'b');
  RD.solidNav(ctx);
  RD.progressBar(ctx);
  RD.hint(ctx, 'hover a footnote number ↗ 指一下注释号');
  var stage = ctx.stage, rd = ctx.rd, NS = 'http://www.w3.org/2000/svg';
  rd.classList.add('b-notes');

  // Dates are machine-side facts → utility mono. Wrap them in text nodes only (URLs contain dates too).
  function withDates(html) {
    var t = document.createElement('span'), w, list = [];
    t.innerHTML = html; w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(function (n) {
      var parts = n.textContent.split(/(\d{4}-\d{2}-\d{2})/); if (parts.length < 2) return;
      var f = document.createDocumentFragment();
      parts.forEach(function (p, i) {
        if (i % 2) { var d = document.createElement('span'); d.className = 'd'; d.textContent = p; f.appendChild(d); }
        else if (p) f.appendChild(document.createTextNode(p));
      });
      n.parentNode.replaceChild(f, n);
    });
    return t.innerHTML;
  }

  // ---- 1 · the notes get the full reference (the imported ones are truncated) and machine-side dates ----
  rd.querySelectorAll('.post-body').forEach(function (body) {
    body.querySelectorAll('.mn').forEach(function (mn) {
      var sup = mn.previousElementSibling, a = sup && sup.querySelector('a');
      var item = a && body.querySelector(a.getAttribute('href'));
      if (!item) return;
      var n = mn.querySelector('.num').textContent;
      var txt = withDates(item.lastElementChild.innerHTML);
      mn.innerHTML = '<span class="num">' + n + '</span><span class="mn-t">' + txt + '</span>';
      mn.querySelectorAll('a').forEach(function (x) { x.tabIndex = -1; });
      mn.dataset.n = n; a.dataset.n = n;
    });
    var wire = document.createElementNS(NS, 'svg');
    wire.setAttribute('class', 'b-wire'); wire.setAttribute('aria-hidden', 'true');
    body.appendChild(wire);
  });

  function lineBoxAbove(sup) {
    // The glyph row the ref sits on: measure the character just before the superscript.
    var prev = sup.previousSibling;
    while (prev && (prev.nodeType !== 3 || !prev.textContent.trim())) prev = prev.previousSibling;
    if (!prev) return sup.getBoundingClientRect();
    var r = document.createRange(), len = prev.textContent.length;
    r.setStart(prev, Math.max(0, len - 1)); r.setEnd(prev, len);
    var rects = r.getClientRects();
    return rects.length ? rects[rects.length - 1] : sup.getBoundingClientRect();
  }

  // ---- 2 · the pointing line ----
  var active = null, leaveT = 0;
  function activate(n, body) {
    clearTimeout(leaveT);
    if (active && active.n === n && active.body === body) return;
    deactivate(true);
    var a = body.querySelector('.fnref a[data-n="' + n + '"]'), mn = body.querySelector('.mn[data-n="' + n + '"]');
    if (!a || !mn || getComputedStyle(mn).display === 'none') return;
    var wire = body.querySelector('.b-wire'), B = body.getBoundingClientRect();
    var p = body.querySelector('p'), cs = getComputedStyle(p), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.8;
    var ra = a.getBoundingClientRect(), row = lineBoxAbove(a.parentNode);
    var num = mn.querySelector('.num'), rn = num.getBoundingClientRect();
    var glyphTop = row.top + (row.height - fs) / 2;
    // run just above the ref's own glyph row (level with the superscript's top), so it reads as leaving the
    // ref rather than underlining the row above
    var yRun = glyphTop - Math.min(6.5, (lh - fs) * .38) - B.top;
    var x0 = ra.right - B.left + 1, y0 = ra.top - B.top + ra.height * .35;
    var xG = body.clientWidth + 22, xN = rn.left - B.left - 7, yN = rn.top - B.top + rn.height / 2;
    // across the text: a dotted leader in the leading (reads as "leads to", never as an underline);
    // in the empty gutter: one solid pen curve down to the note
    var r = Pen.rng('b-wire-' + n + ctx.lang()), run = [[x0, y0], [x0 + 7, yRun + .5]];
    var runEnd = body.clientWidth + 6, span = runEnd - (x0 + 7), k = Math.max(1, Math.round(span / 90));
    for (var i = 1; i <= k; i++) run.push([x0 + 7 + span * i / k, yRun + (r() - .5) * 1.4]);
    var tail = [[runEnd, yRun]], dir = yN >= yRun ? 1 : -1, dy = Math.abs(yN - yRun);
    if (dy > 40) { tail.push([xG, yRun + dir * 14]); tail.push([xG + (r() - .5) * 2, yN - dir * 16]); }
    else tail.push([xG, (yRun + yN) / 2]);
    tail.push([xN, yN]);
    var id = 'b-m-' + n + '-' + ctx.lang(), W = body.clientWidth + 400, Hh = body.offsetHeight + 80;
    wire.innerHTML = '<defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="-40" y="-40" width="' + W + '" height="' + Hh + '"></mask></defs>';
    var mask = wire.querySelector('mask'), dRun = Pen.smooth(run);
    var reveal = Pen.path(dRun, { color: '#fff', width: 7 }); mask.appendChild(reveal);
    var dots = Pen.path(dRun, { width: 1.9 }); dots.setAttribute('class', 'b-dots'); dots.setAttribute('mask', 'url(#' + id + ')');
    var path = Pen.path(Pen.smooth(tail), { width: 1.6 });
    wire.appendChild(dots); wire.appendChild(path);
    var L1 = reveal.getTotalLength(), d1 = Math.min(360, 140 + L1 * .3), d2 = 200;
    Pen.draw(reveal, { duration: d1 });
    Pen.draw(path, { duration: d2, delay: d1 * .92 });
    var dur = d1 + d2;
    var loop = Pen.annotate(num, 'loop', { manual: true, seed: 'b-num-' + n, pad: 4, width: 1.6, duration: 240 });
    var t = setTimeout(function () { loop.show(); }, Pen.reduced() ? 0 : dur * .82);
    mn.classList.add('on'); a.classList.add('on');
    active = { n: n, body: body, path: path, reveal: reveal, loop: loop, mn: mn, a: a, t: t };
  }
  function deactivate(now) {
    if (!active) return;
    var s = active; active = null;
    clearTimeout(s.t);
    s.mn.classList.remove('on'); s.a.classList.remove('on');
    Pen.erase(s.path, { duration: now ? 100 : 160 }); Pen.erase(s.reveal, { duration: now ? 120 : 200 });
    s.loop.hide();
    setTimeout(function () { s.loop.svg.remove(); if (!active || active.body !== s.body) s.body.querySelector('.b-wire').innerHTML = ''; }, 240);
  }
  function soon() { clearTimeout(leaveT); leaveT = setTimeout(function () { deactivate(false); }, 90); }

  rd.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch') return;
    var hit = e.target.closest('.fnref a[data-n], .mn[data-n]');
    if (hit) activate(hit.dataset.n, hit.closest('.post-body'));
  });
  rd.addEventListener('pointerout', function (e) {
    var hit = e.target.closest('.fnref a[data-n], .mn[data-n]');
    if (hit && !(e.relatedTarget && hit.contains(e.relatedTarget))) soon();
  });
  rd.addEventListener('focusin', function (e) { if (e.target.matches('.fnref a[data-n]')) activate(e.target.dataset.n, e.target.closest('.post-body')); });
  rd.addEventListener('focusout', function (e) { if (e.target.matches('.fnref a[data-n]')) soon(); });
  ctx.onLayout(function () { deactivate(true); });

  // ---- 3 · narrow screens: the paper slip ----
  var slip = document.createElement('aside');
  slip.className = 'b-slip';
  slip.setAttribute('role', 'dialog'); slip.setAttribute('aria-label', 'Reference · 参考'); slip.tabIndex = -1;
  slip.innerHTML = '<button class="b-grip" type="button" aria-label="Close · 收起"><svg width="44" height="8" aria-hidden="true"><path d="M3 4.5 C 14 3, 28 5.5, 41 3.6"/></svg></button>' +
    '<div class="b-slip-row"><span class="b-slip-num"></span><div class="b-slip-t"></div></div>' +
    '<div class="b-slip-foot"><a class="b-slip-all" href="#"><span class="en">all references ↓</span><span class="zh">全部参考 · references ↓</span></a><span>swipe down · 下滑收起</span></div>';
  stage.appendChild(slip);
  var slipNum = slip.querySelector('.b-slip-num'), slipT = slip.querySelector('.b-slip-t');
  var Y = 0, V = 0, target = 0, raf = 0, openRef = null, refLoop = null, H = 240;

  // Spring with mass: one small overshoot, then settle (physics clock). Stops when at rest.
  function spring() {
    cancelAnimationFrame(raf);
    var last = performance.now();
    (function step(now) {
      var dt = Math.min(32, now - last) / 1000; last = now;
      var k = 420, c = 30;                       // ζ ≈ .73 → one visible overshoot
      V += (-k * (Y - target) - c * V) * dt; Y += V * dt;
      slip.style.transform = 'translateY(' + Y.toFixed(1) + 'px) rotate(-.4deg)';
      if (Math.abs(V) < 4 && Math.abs(Y - target) < .5) {
        Y = target; slip.style.transform = 'translateY(' + Y + 'px) rotate(-.4deg)';
        if (target > 0) { slip.classList.remove('open'); slip.style.visibility = 'hidden'; }
        return;
      }
      raf = requestAnimationFrame(step);
    })(last);
  }
  function openSlip(a) {
    var body = a.closest('.post-body'), item = body.querySelector(a.getAttribute('href'));
    if (!item) return;
    var n = a.dataset.n;
    slipNum.textContent = n;
    slipT.innerHTML = withDates(item.lastElementChild.innerHTML);
    slip.querySelector('.b-slip-all').setAttribute('href', a.getAttribute('href'));
    slip.style.visibility = 'visible'; slip.classList.add('open');
    H = slip.offsetHeight + 30;
    if (openRef !== a) {
      if (refLoop) { refLoop.hide(); var o = refLoop; setTimeout(function () { o.svg.remove(); }, 220); }
      refLoop = Pen.annotate(a, 'loop', { manual: true, seed: 'b-ref-' + n, pad: 3, width: 1.6, duration: 220 });
      refLoop.show();
    }
    if (!openRef) { Y = H; V = 0; }
    openRef = a; target = 0;
    if (Pen.reduced()) { Y = 0; slip.style.transform = 'rotate(-.4deg)'; } else spring();
    slip.focus({ preventScroll: true });
  }
  function closeSlip(v) {
    if (!openRef) return;
    var a = openRef; openRef = null;
    if (refLoop) { refLoop.hide(); var o = refLoop; refLoop = null; setTimeout(function () { o.svg.remove(); }, 220); }
    target = H; V = v || 0;
    if (Pen.reduced()) { Y = H; slip.classList.remove('open'); slip.style.visibility = 'hidden'; } else spring();
    if (slip.contains(document.activeElement)) a.focus({ preventScroll: true });
  }
  rd.addEventListener('click', function (e) {
    var a = e.target.closest('.fnref a[data-n]');
    if (a) {
      var mn = a.closest('.post-body').querySelector('.mn[data-n="' + a.dataset.n + '"]');
      if (mn && getComputedStyle(mn).display !== 'none') return;  // wide: the note is already beside you; the link still jumps
      e.preventDefault(); openSlip(a); return;
    }
    if (openRef) closeSlip(0);
  });
  slip.querySelector('.b-grip').addEventListener('click', function () { closeSlip(0); });
  slip.querySelector('.b-slip-all').addEventListener('click', function (e) {
    e.preventDefault(); var id = this.getAttribute('href'); closeSlip(0);
    var el = rd.querySelector(id); if (el) ctx.scrollTo(ctx.top(el) - ctx.navH() - 24);
  });
  slip.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSlip(0); });

  // swipe down to dismiss: follow the finger, release with its velocity
  var drag = null;
  slip.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a')) return;
    drag = { y: e.clientY, y0: Y, t: performance.now(), v: 0 };
    cancelAnimationFrame(raf); slip.setPointerCapture(e.pointerId);
  });
  slip.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var now = performance.now(), dy = e.clientY - drag.y;
    var ny = dy < 0 ? drag.y0 + dy * .25 : drag.y0 + dy;       // resist upward pulls
    drag.v = (ny - Y) / Math.max(1, now - drag.t) * 1000; drag.t = now;
    Y = ny; slip.style.transform = 'translateY(' + Y.toFixed(1) + 'px) rotate(-.4deg)';
  });
  function release() {
    if (!drag) return;
    var d = drag; drag = null;
    if (Y > 70 || d.v > 600) closeSlip(d.v); else { target = 0; V = d.v; spring(); }
  }
  slip.addEventListener('pointerup', release);
  slip.addEventListener('pointercancel', release);

  window.replayB = function () {
    var body = ctx.body(), a = body.querySelector('.fnref a[data-n="3"]');
    ctx.scrollTo(ctx.top(a) - rd.clientHeight * .4);
    setTimeout(function () {
      var mn = body.querySelector('.mn[data-n="3"]');
      if (mn && getComputedStyle(mn).display !== 'none') { deactivate(true); activate('3', body); }
      else openSlip(a);
    }, Pen.reduced() ? 50 : 650);
  };
  window.__B = { ctx: ctx, activate: activate, openSlip: openSlip, closeSlip: closeSlip };
})();
