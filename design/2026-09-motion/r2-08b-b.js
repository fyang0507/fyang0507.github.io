/* r2-08b-b.js — B · Unfolds between the lines / 行间展开. Paper on the physics clock, the fold line on the hand's.
   The margin goes quiet: notes live inside the text. Pointing at a ref draws a dashed coral fold line in the
   leading right under its row — "it opens here". Clicking (Enter / Space / tap) parts the text exactly there: the
   visual line ends, a folded paper packet drops in, and its flaps unroll one after another from behind the tab,
   each on its own spring. The gap is the paper's projected height every frame, so the text below is pushed by
   the paper rather than by a tween. Click again, “fold ↑” or Esc folds it back and the lines close over it.
   First open: flaps unroll in sequence (~650 ms). Every open after: all flaps at once, stiffer (~300 ms).
   It is the same on a phone (the column is the room), so B needs no bottom slip. Reduced motion: open / shut. */
(function () {
  var ctx = RD.mount(document.getElementById('stage-b'), 'b');
  var rd = ctx.rd, model = FN.prepare(ctx), NS = FN.NS;
  rd.classList.add('uf-mode');
  var open = [], raf = 0, last = 0, HEAD = 34, FOLD = 176;

  ['zh', 'en'].forEach(function (l) {
    Object.keys(model[l]).forEach(function (n) {
      var note = model[l][n];
      note.ufId = 'uf-' + note.key;
      note.a.setAttribute('aria-expanded', 'false'); note.a.setAttribute('aria-controls', note.ufId);
    });
  });

  /* ---- the fold line: dashes revealed by one pen pass (a solid mask stroke) ---- */
  var perf = null;
  function showPerf(note) {
    hidePerf(true);
    if (stateOf(note)) return;
    var wire = note.body.querySelector('.fn-wire'), B = note.body.getBoundingClientRect(), m = FN.metrics(note.body), rw = FN.row(note.sup);
    var y = (rw.top + rw.bottom) / 2 - B.top + m.fs * .5 + (m.lh - m.fs) * .5, w = note.body.clientWidth, r = Pen.rng('uf-perf-' + note.key), pts = [];
    for (var i = 0; i <= 6; i++) pts.push([-6 + (w + 12) * i / 6, y + (r() - .5) * 1.4]);
    var id = 'ufm-' + note.key, d = Pen.smooth(pts), g = document.createElementNS(NS, 'g');
    g.innerHTML = '<defs><mask id="' + id + '" maskUnits="userSpaceOnUse" x="-40" y="' + (y - 20) + '" width="' + (w + 80) + '" height="40"></mask></defs>';
    var reveal = Pen.path(d, { color: '#fff', width: 6 }), dash = Pen.path(d, { width: 1.6 });
    dash.setAttribute('class', 'uf-perf'); dash.setAttribute('mask', 'url(#' + id + ')');
    g.querySelector('mask').appendChild(reveal); g.appendChild(dash); wire.appendChild(g);
    Pen.draw(reveal, { duration: FN.first('b') ? 260 : 170 });
    perf = { note: note, g: g, reveal: reveal };
  }
  function hidePerf(now) {
    if (!perf) return;
    var p = perf; perf = null;
    Pen.erase(p.reveal, { duration: now ? 90 : 150 });
    setTimeout(function () { p.g.remove(); }, now ? 100 : 170);
  }

  /* ---- the packet ---- */
  function stateOf(note) { return open.filter(function (s) { return s.note === note; })[0]; }
  function build(note) {
    var el = document.createElement('span'), lang = note.lang;
    el.className = 'uf'; el.id = note.ufId; el.setAttribute('role', 'note');
    el.setAttribute('aria-label', (lang === 'zh' ? '注释 ' : 'Note ') + note.n + ' · ' + (lang === 'zh' ? 'note ' : '注释 ') + note.n);
    var hosts = note.entries.map(function (e) { return e.href ? '<a class="uf-src" href="' + FN.esc(e.href) + '" target="_blank" rel="noopener noreferrer">' + FN.esc(e.host) + ' ↗</a>' : ''; }).join('');
    el.innerHTML = '<span class="uf-gap"><span class="uf-paper"><span class="uf-head"><span class="uf-no">' + note.n + '</span>' +
      '<span class="uf-lab">参考 · reference</span><span class="uf-hosts">' + hosts + '</span>' +
      '<button class="uf-fold" type="button" aria-label="Fold the note · 收起注释">收起 · fold ↑</button></span></span></span>';
    // insert where the ref's visual line ends, so the line above never re-wraps
    var at = FN.lineEnd(note.sup);
    if (at.after) at.after.parentNode.insertBefore(el, at.after.nextSibling);
    else if (at.node) at.node.parentNode.insertBefore(el, at.node.splitText(at.offset));
    else at.end.appendChild(el);

    // measure the note in a probe flap, i.e. in exactly the box it will be read in, so no title re-wraps
    var head = el.querySelector('.uf-head'), probe = document.createElement('span');
    probe.className = 'uf-hinge'; probe.style.visibility = 'hidden';
    probe.innerHTML = '<span class="uf-flap"><span class="uf-slice">' + FN.fields(note, false) + '</span></span>';
    head.appendChild(probe);
    var slice = probe.querySelector('.uf-slice'), lh = parseFloat(getComputedStyle(slice).lineHeight);
    var lines = Math.max(1, Math.round(slice.offsetHeight / lh)), per = Math.max(2, Math.ceil(lines / 4)), N = Math.ceil(lines / per);
    var padT = 8, padB = 12, bounds = [0];
    for (var k = 1; k < N; k++) bounds.push(padT + k * per * lh);
    bounds.push(padT + lines * lh + padB);
    var html = slice.innerHTML, parent = head, flaps = [];
    probe.remove();
    for (var j = 0; j < N; j++) {
      var h = bounds[j + 1] - bounds[j], hinge = document.createElement('span');
      hinge.className = 'uf-hinge'; hinge.style.top = (j ? bounds[j] - bounds[j - 1] : HEAD) + 'px';
      hinge.innerHTML = '<span class="uf-flap" aria-hidden="true" style="height:' + h + 'px"><span class="uf-slice" style="margin-top:' + (padT - bounds[j]) + 'px">' + html + '</span></span>';
      parent.appendChild(hinge); parent = hinge;
      flaps.push({ hinge: hinge, h: h });
    }
    return { el: el, gap: el.querySelector('.uf-gap'), head: el.querySelector('.uf-head'), flaps: flaps };
  }

  function openNote(note) {
    var st = stateOf(note), full = FN.first('b');
    FN.seen('b');
    hidePerf(true);
    if (!st) {
      var parts = build(note);
      st = { note: note, el: parts.el, gap: parts.gap, head: parts.head, flaps: parts.flaps, a: [-88], v: [0] };
      parts.flaps.forEach(function () { st.a.push(FOLD); st.v.push(0); });
      open.push(st); st.w = parts.el.offsetWidth;
      st.loop = Pen.annotate(note.a, 'loop', { manual: true, seed: 'uf-ref-' + note.key, pad: 3, width: 1.6, duration: 200 });
    }
    st.phase = 'in'; st.full = full; st.t0 = performance.now();
    st.loop.show();
    note.a.setAttribute('aria-expanded', 'true');
    if (Pen.reduced()) { st.a = st.a.map(function () { return 0; }); render(st); return; }
    kick();
  }
  function closeNote(note, now) {
    var st = stateOf(note);
    if (!st) return;
    st.phase = 'out'; st.t0 = performance.now();
    note.a.setAttribute('aria-expanded', 'false');
    st.loop.hide();
    if (st.el.contains(document.activeElement)) note.a.focus({ preventScroll: true });
    if (now || Pen.reduced()) { remove(st); return; }
    kick();
  }
  function remove(st) {
    var p = st.el.parentNode;
    st.el.remove(); if (p) p.normalize();
    var l = st.loop; setTimeout(function () { l.svg.remove(); }, 220);
    open.splice(open.indexOf(st), 1);
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  // Angles are relative to the tab: 0 = flat on the page, FOLD = rolled up behind the tab (its back faces you and
  // is culled), −88 = the tab still standing up on the ref's line. A flap is nested in the one above it, so its
  // CSS rotateX is its angle minus its parent's: a folded flap stays folded while the flap above it swings.
  function step(st, now, dt) {
    var t = now - st.t0, n = st.a.length, busy = false, k, c;
    for (var i = 0; i < n; i++) {
      var target, delay;
      if (st.phase === 'in') { target = 0; delay = i === 0 ? 0 : st.full ? 150 + (i - 1) * 115 : 40; k = st.full ? 300 : 620; c = st.full ? 24 : 46; }
      else { target = i === 0 ? -100 : FOLD; delay = i === 0 ? 70 : 0; k = 700; c = 50; }
      if (t < delay) { busy = true; continue; }
      for (var s = 0; s < 4; s++) { st.v[i] += (-k * (st.a[i] - target) - c * st.v[i]) * dt / 4; st.a[i] += st.v[i] * dt / 4; }
      if (Math.abs(st.a[i] - target) > .15 || Math.abs(st.v[i]) > 2) busy = true; else { st.a[i] = target; st.v[i] = 0; }
    }
    render(st);
    if (st.phase === 'out' && (st.a[0] < -90 || !busy)) { remove(st); return false; }   // tab past edge-on: culled, gone
    return busy;
  }
  function render(st) {
    var a = st.a, rad = Math.PI / 180, y = HEAD * Math.max(0, Math.cos(a[0] * rad)), gapH = y;
    st.head.style.transform = 'rotateX(' + (-a[0]).toFixed(2) + 'deg)';
    st.flaps.forEach(function (f, i) {
      var rel = a[i + 1] - (i ? a[i] : 0);
      f.hinge.style.transform = 'rotateX(' + (-rel).toFixed(2) + 'deg)';
      y += f.h * Math.cos((a[0] + a[i + 1]) * rad);
      gapH = Math.max(gapH, y);
    });
    st.gap.style.height = gapH.toFixed(1) + 'px';
  }
  function frame(now) {
    raf = 0;
    var dt = Math.min(.032, (now - last) / 1000), busy = false; last = now;
    open.slice().forEach(function (st) { if (step(st, now, dt)) busy = true; });
    if (busy) raf = requestAnimationFrame(frame);
  }

  function toggle(note) { if (stateOf(note) && stateOf(note).phase === 'in') closeNote(note); else openNote(note); }

  /* ---- input ---- */
  rd.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch') return;
    var a = e.target.closest('.fnref a[data-n]'); if (a) showPerf(model.of(a));
  });
  rd.addEventListener('pointerout', function (e) { var a = e.target.closest('.fnref a[data-n]'); if (a && !(e.relatedTarget && a.contains(e.relatedTarget))) hidePerf(false); });
  rd.addEventListener('focusin', function (e) { if (e.target.matches('.fnref a[data-n]')) showPerf(model.of(e.target)); });
  rd.addEventListener('focusout', function (e) { if (e.target.matches('.fnref a[data-n]')) hidePerf(false); });
  rd.addEventListener('click', function (e) {
    var a = e.target.closest('.fnref a[data-n]');
    if (a) { e.preventDefault(); toggle(model.of(a)); return; }
    var fold = e.target.closest('.uf-fold');
    if (fold) { var st = open.filter(function (s) { return s.el.contains(fold); })[0]; if (st) closeNote(st.note); }
  });
  rd.addEventListener('keydown', function (e) {
    var a = e.target.closest('.fnref a[data-n]'), host = e.target.closest('.uf');
    if (a && e.key === ' ') { e.preventDefault(); toggle(model.of(a)); }
    if (e.key === 'Escape') {
      var st = host ? open.filter(function (s) { return s.el === host; })[0] : a && stateOf(model.of(a));
      if (st) closeNote(st.note);
    }
  });
  ctx.onLayout(function () {   // a re-wrap moves every line end: shut instantly rather than leave a strip mid-sentence
    open.slice().forEach(function (st) { if (st.el.offsetWidth !== st.w) { st.note.a.setAttribute('aria-expanded', 'false'); st.loop.hide(); remove(st); } });
    open.forEach(function (st) { st.w = st.el.offsetWidth; });
  });
  document.addEventListener('mock:rm', function () { open.slice().forEach(function (st) { st.a = st.a.map(function () { return 0; }); render(st); }); });

  function show(n, first) {
    FN.seen('b', !first);
    open.slice().forEach(function (st) { closeNote(st.note, true); });
    var note = model.get(n);
    ctx.stage.scrollIntoView({ block: 'center', behavior: Pen.reduced() ? 'auto' : 'smooth' });   // the replay button sits under the stage
    ctx.scrollTo(ctx.top(note.a) - rd.clientHeight * .3);
    setTimeout(function () { showPerf(note); setTimeout(function () { openNote(note); }, Pen.reduced() ? 0 : 380); }, Pen.reduced() ? 60 : 650);
  }
  window.replayB = function () { show('3', true); };
  window.repeatB = function () { show('4', false); };
  window.__B = { ctx: ctx, model: model, open: open, openNote: openNote, closeNote: closeNote };
})();
