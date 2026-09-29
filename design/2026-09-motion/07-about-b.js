/* 07 · B — Peel day to night. The day form is a paper label stuck on the night card.
   The pulled corner C goes wherever the pointer P is; the fold is the perpendicular bisector of C→P.
   The adhered part is the label clipped to the far side of the fold; the lifted part is the same region
   reflected across the fold, showing the label's reverse (print ghosting through). Physics clock only. */
(function () {
  var root = document.getElementById('cand-b'); if (!root) return;
  var card = root.querySelector('.b-card'), base = root.querySelector('.b-base'), label = root.querySelector('.b-label'),
    lface = root.querySelector('.b-lface'), flap = root.querySelector('.b-flap'), ghost = root.querySelector('.b-ghost'), tab = root.querySelector('.b-tab');
  base.innerHTML = SC.nightFace('b-rd');
  lface.innerHTML = SC.dayFace();
  ghost.innerHTML = SC.dayFace();
  [].forEach.call(ghost.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
  var radar = SC.Radar(base.querySelector('.sc-radar'));
  var flip = SC.flipButton('b-card');
  root.querySelector('.flip-slot').appendChild(flip);
  base.setAttribute('aria-hidden', 'true');

  var W = 1, H = 1, REST = 24, LIFT = 42;
  var px = new SC.Spring(0, 170, .6), py = new SC.Spring(0, 170, .6), q = new SC.Spring(0, 110, .66);
  var mode = 'on', drag = null, way = null, narrow = matchMedia('(max-width:680px)');

  function measure() {
    W = label.offsetWidth; H = label.offsetHeight;
    flap.style.width = W + 'px'; flap.style.height = H + 'px';
  }
  function rest() { return [W - REST, H - REST]; }
  function endP() { return [-W - 4, H]; }   // fold lands on the label's left edge: the whole label is lifted

  /* ---- geometry ---- */
  function clipHalf(poly, M, n, lifted) {
    var out = [];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length],
        da = (a[0] - M[0]) * n[0] + (a[1] - M[1]) * n[1], db = (b[0] - M[0]) * n[0] + (b[1] - M[1]) * n[1];
      if (!lifted) { da = -da; db = -db; }
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) { var t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function area(p) { var s = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; }
  function poly(p) { return p.length < 3 ? 'polygon(0 0,0 0,0 0)' : 'polygon(' + p.map(function (v) { return v[0].toFixed(1) + 'px ' + v[1].toFixed(1) + 'px'; }).join(',') + ')'; }
  function mtx(a, b, c, d, e, f) { return 'matrix(' + [a, b, c, d, e, f].map(function (v) { return v.toFixed(4); }).join(',') + ')'; }

  var frac = 0;
  function renderPeel(P) {
    var dx = W - P[0], dy = H - P[1], L = Math.hypot(dx, dy);
    if (L < .5) { label.style.clipPath = 'none'; flap.style.visibility = 'hidden'; frac = 0; return; }
    var n = [dx / L, dy / L], M = [(W + P[0]) / 2, (H + P[1]) / 2], rect = [[0, 0], [W, 0], [W, H], [0, H]];
    var keep = clipHalf(rect, M, n, false), lifted = clipHalf(rect, M, n, true), k = 2 * (M[0] * n[0] + M[1] * n[1]);
    label.style.visibility = keep.length < 3 ? 'hidden' : 'visible';
    label.style.clipPath = poly(keep);
    flap.style.visibility = 'visible';
    flap.style.clipPath = poly(lifted);
    flap.style.setProperty('--curl', '0px');
    flap.style.transform = mtx(1 - 2 * n[0] * n[0], -2 * n[0] * n[1], -2 * n[0] * n[1], 1 - 2 * n[1] * n[1], k * n[0], k * n[1]);
    frac = area(lifted) / (W * H);
  }
  // Hanging: interpolate from "folded over the left edge" (mirror, s=1) to a smaller, drooping label
  // stuck by one corner to the card's side. Matrix = T(e,f)·R(α)·diag(−s, s), so the reverse stays up.
  function hangParams() {
    return narrow.matches ? { a: .05, s: .34, e: W * .5 + W * .17, f: H - 10 } : { a: -.055, s: .56, e: -4, f: 34 };
  }
  function renderHang(t) {
    var h = hangParams(), a = h.a * t, s = 1 + (h.s - 1) * t, e = -4 + (h.e + 4) * t, f = h.f * t, c = Math.max(0, Math.min(1, t)) * 92;
    label.style.visibility = 'hidden';
    flap.style.visibility = 'visible';
    flap.style.clipPath = c > 1 ? poly([[0, 0], [W, 0], [W, H - c], [W - c, H], [0, H]]) : 'none';
    flap.style.setProperty('--curl', c.toFixed(1) + 'px');
    flap.style.transform = mtx(-s * Math.cos(a), -s * Math.sin(a), -s * Math.sin(a), s * Math.cos(a), e, f);
  }
  function render() {
    if (mode === 'hang' || mode === 'hung' || mode === 'unhang') renderHang(q.x);
    else renderPeel([px.x, py.x]);
  }

  function setHung(on) {
    card.classList.toggle('off', on);
    flap.classList.toggle('hung', on);
    if (on) {
      flap.setAttribute('role', 'button'); flap.setAttribute('tabindex', '0'); flap.removeAttribute('aria-hidden');
      flap.setAttribute('aria-label', '把日间标签贴回去。Smooth the day label back on.');
    } else {
      flap.removeAttribute('role'); flap.removeAttribute('tabindex'); flap.setAttribute('aria-hidden', 'true'); flap.removeAttribute('aria-label');
    }
    if (on && document.activeElement === tab) flap.focus();
    if (!on && document.activeElement === flap) tab.focus();
    base.setAttribute('aria-hidden', on ? 'false' : 'true');
    label.setAttribute('aria-hidden', on ? 'true' : 'false');
    flip.setState(on);
  }

  var loop = SC.Loop(function (dt) {
    if (!drag) { px.step(dt); py.step(dt); }
    q.step(dt);
    if (mode === 'away' && way && Math.hypot(px.x - way[0], py.x - way[1]) < 60) { var ep = endP(); px.to = ep[0]; py.to = ep[1]; way = null; }
    if (mode === 'away' && !way && Math.hypot(px.x - px.to, py.x - py.to) < 6) { mode = 'hang'; q.snap(0); q.to = 1; }
    if (mode === 'hang' && q.rest(.004)) { mode = 'hung'; setHung(true); radar.draw(); }
    if (mode === 'unhang' && q.x < .02) { mode = 'return'; q.snap(0); var p = endP(); px.snap(p[0]); py.snap(p[1]); var r = rest(); px.to = r[0]; py.to = r[1]; }
    if (mode === 'return' && px.rest(.3) && py.rest(.3)) { mode = 'on'; card.classList.remove('peeling'); }
    render();
    return !!drag || mode === 'away' || mode === 'hang' || mode === 'unhang' || mode === 'return' || !(px.rest(.2) && py.rest(.2));
  });

  function stiff(k, z) { px.k = py.k = k; px.c = py.c = 2 * z * Math.sqrt(k); }
  function peelAway(auto) {
    var p = endP(); mode = 'away'; card.classList.add('peeling');
    // An automated peel lifts the corner diagonally first, then carries the fold to the left edge.
    if (auto) { stiff(46, .9); way = [W * .32, H * .3]; px.to = way[0]; py.to = way[1]; }
    else { stiff(95, .95); way = null; px.to = p[0]; py.to = p[1]; }
    if (Pen.reduced()) { way = null; mode = 'hung'; q.snap(1); setHung(true); radar.show(); render(); return; }
    loop.kick();
  }
  function smoothBack() {
    if (mode !== 'hung') return;
    setHung(false); radar.reset(); stiff(120, .74);
    if (Pen.reduced()) { mode = 'on'; card.classList.remove('peeling'); q.snap(0); var r = rest(); px.snap(r[0]); py.snap(r[1]); render(); return; }
    mode = 'unhang'; q.to = 0; loop.kick();
  }
  function toggle() { if (mode === 'on') peelAway(true); else if (mode === 'hung') smoothBack(); }

  /* ---- the dog-ear: hover lifts it, drag peels it ---- */
  tab.addEventListener('pointerenter', function (e) { if (mode !== 'on' || drag || e.pointerType !== 'mouse' || Pen.reduced()) return; stiff(170, .6); px.to = W - LIFT; py.to = H - LIFT; loop.kick(); });
  tab.addEventListener('pointerleave', function () { if (mode !== 'on' || drag) return; var r = rest(); px.to = r[0]; py.to = r[1]; loop.kick(); });
  tab.addEventListener('pointerdown', function (e) {
    if (mode !== 'on' || e.button !== 0) return;
    var r = label.getBoundingClientRect();
    drag = { id: e.pointerId, ox: px.x - (e.clientX - r.left), oy: py.x - (e.clientY - r.top), x0: e.clientX, y0: e.clientY, moved: false };
    try { tab.setPointerCapture(e.pointerId); } catch (_) {}
    card.classList.add('peeling');
    loop.kick();
  });
  tab.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 5) drag.moved = true;
    if (!drag.moved || Pen.reduced()) return;
    var r = label.getBoundingClientRect();
    px.snap(SC.clamp(e.clientX - r.left + drag.ox, -W * .95, W - 2));
    py.snap(SC.clamp(e.clientY - r.top + drag.oy, -H * .95, H - 2));
    loop.kick();
  });
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    if (!d.moved) { peelAway(true); return; }
    if (frac > .09) peelAway(false);
    else { stiff(170, .55); var r = rest(); px.to = r[0]; py.to = r[1]; card.classList.remove('peeling'); loop.kick(); }
  }
  tab.addEventListener('pointerup', up);
  tab.addEventListener('pointercancel', up);
  tab.addEventListener('click', function (e) { if (e.detail === 0) toggle(); });   // keyboard Enter/Space
  flap.addEventListener('click', smoothBack);
  flap.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); smoothBack(); } });
  flip.addEventListener('click', toggle);

  function relayout() {
    measure();
    if (mode === 'on') { var r = rest(); px.snap(r[0]); py.snap(r[1]); }
    render();
  }
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(label); else relayout();
  window.addEventListener('load', relayout);
  document.addEventListener('mock:rm', function () { if (Pen.reduced() && mode === 'hung') radar.show(); });

  window.replayB = function () {
    drag = null; way = null; mode = 'on'; setHung(false); card.classList.remove('peeling'); radar.reset(); q.snap(0);
    var r = rest(); px.snap(r[0]); py.snap(r[1]); render();
    setTimeout(function () { peelAway(true); }, 450);
  };
  relayout();
})();
