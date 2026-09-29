/* 04-shelf-a.js — Candidate A "Pull the book / 抽书".
   Hover/focus: a finger hooks the head of the spine; it rides up and toward you, and its neighbours lose
   support and lean into the gap, wobble, settle (live springs). Click/Enter: the book comes fully out,
   turns in your hand to show its real cover, the cover swings open, and the title page grows into the
   reading page (WAAPI with spring-baked easings). Back reverses and the book drops into its slot. */
(function () {
  var K = window.ShelfKit;
  var stage = document.getElementById('stage-a');
  var posts = K.pick(K.SET18);
  var shelf = K.buildShelf(stage, posts, { rowH: 230 });
  shelf.wrap.style.bottom = '58px';
  var read = window.ShelfRead(stage);
  var S = shelf.books.map(function () {
    return { lift: new K.Spring(0, 320, 0.6), fwd: new K.Spring(0, 320, 0.72), lean: new K.Spring(0, 140, 0.4) };
  });
  var cur = -1, openI = -1, busy = false, leanTimer = null;
  var bird = K.Bird(shelf, { mode: 'tops', ride: function (i) { return -S[i].lift.x; } });
  var loop = K.Loop(render);

  // ---- hover physics -------------------------------------------------------------------------
  function apply(b, s) {
    var a = s.lean.x, px = a > 0 ? b.w : 0, sc = 1 + 0.05 * s.fwd.x;   // lean pivots on the corner it tips over
    b.body.style.transform = 'translate(' + px + 'px,' + b.h + 'px) rotate(' + a.toFixed(3) + 'deg) translate(' + (-px) + 'px,' + (-b.h) + 'px) ' +
      'translate(0,' + (-s.lift.x).toFixed(2) + 'px) translate(' + b.w / 2 + 'px,' + b.h + 'px) scale(' + sc.toFixed(4) + ') translate(' + (-b.w / 2) + 'px,' + (-b.h) + 'px)';
  }
  function render(dt) {
    var busyAny = false;
    shelf.books.forEach(function (b, i) {
      var s = S[i], m = s.lift.step(dt); m = s.fwd.step(dt) || m; m = s.lean.step(dt) || m;
      if (m) { busyAny = true; apply(b, s); }
    });
    bird.place();
    return busyAny;
  }
  function setLean(i, big) {
    shelf.books.forEach(function (b, j) {
      var d = j - i, t = 0;
      if (i >= 0 && Math.abs(d) === 1) t = (d < 0 ? 1 : -1) * (big ? 3.6 : 2.3);
      if (i >= 0 && Math.abs(d) === 2) t = (d < 0 ? 1 : -1) * (big ? 1.4 : 0.8);
      S[j].lean.t = t;
    });
    loop.kick();
  }
  function consider(i) {
    if (openI >= 0 || busy || i === cur) return;
    cur = i;
    shelf.books.forEach(function (b, j) {
      var on = j === i;
      S[j].lift.t = on ? 16 : 0; S[j].fwd.t = on ? 1 : 0;
      b.el.classList.toggle('lifted', on);
    });
    clearTimeout(leanTimer);
    // The gap opens first; the neighbours only notice it a beat later.
    leanTimer = setTimeout(function () { setLean(cur, false); }, Pen.reduced() ? 0 : 70);
    if (i < 0) setLean(-1);
    caption(i);
    if (i >= 0) bird.consider(i); else bird.cancel();          // leave before it noticed: it stays put
    loop.kick();
  }

  // ---- caption on the shelf edge (the only coral: the pen under the title) ------------------------
  var cap = K.el('div', 'a-cap', '<span class="c-zh"><span></span></span><span class="c-en"></span><span class="c-meta"></span>');
  cap.hidden = true; stage.appendChild(cap);
  var capZh = cap.querySelector('.c-zh'), pen = Pen.annotate(capZh, 'underline', { manual: true, gap: 2, width: 2 });
  function caption(i) {
    if (i < 0) { pen.hide(); cap.hidden = true; return; }
    var p = posts[i], b = shelf.books[i];
    capZh.firstChild.textContent = p.zh; cap.querySelector('.c-en').textContent = p.en; cap.querySelector('.c-meta').textContent = K.tagLine(p);
    cap.hidden = false;
    var bx = K.rel(b.el, stage).x, W = stage.clientWidth;
    cap.style.left = Math.max(16, Math.min(W - cap.offsetWidth - 16, bx - 6)) + 'px';
    pen.rebuild(); pen.show();
  }

  // ---- the book in your hand (3D) -----------------------------------------------------------------
  var scene = K.el('div', 'a-scene'); stage.appendChild(scene);
  var box = null, leaf = null, page1 = null, p1title = null, G = null;
  function build(b, p) {
    var W = stage.clientWidth, Hs = stage.clientHeight;
    // Presented above the row, in the empty air the shelf leaves: the book never covers its neighbours.
    var room = shelf.row.getBoundingClientRect().top - stage.getBoundingClientRect().top + (shelf.rowH - Math.max.apply(null, shelf.books.map(function (o) { return o.h; })));
    var H = Math.round(Math.min(280, room - 44, (W - 48) / 1.44)), D = Math.round(H * 0.72), k = H / b.h, T = b.w * k;
    G = { H: H, D: D, T: T, X0: W / 2, Y0: Math.round(room / 2) + 2 };
    scene.innerHTML = '';
    box = K.el('div', 'b3d');
    box.innerHTML =
      '<div class="f f-spine' + (p.series ? ' series' : '') + '">' + K.spineHTML(p) + '</div>' +
      '<div class="f f-top"></div>' +
      '<div class="f f-r">' +
      '  <div class="p1" style="font-size:' + (H / 300 * 16).toFixed(2) + 'px"><div class="p1-head">FRED YANG · 弗雷德</div><div class="p1-zh">' + K.esc(p.zh) + '</div>' +
      '    <div class="p1-en">' + K.esc(p.en) + '</div><i class="p1-rule"></i><div class="p1-foot">' + p.year + ' · ' + (p.tagZh[0] || '') + ' ' + (p.tags[0] || '') + '</div></div>' +
      '  <div class="leaf"><div class="leaf-front"><div class="lf-img warm"><img alt="" decoding="async"></div>' +
      '    <div class="lf-label">' + K.esc(p.zh) + '</div></div>' +
      '    <div class="leaf-back"><div class="exlib">EX LIBRIS<b>fred yang</b>弗雷德藏书</div></div></div>' +
      '</div>';
    var q = function (s) { return box.querySelector(s); };
    var sp = q('.f-spine'), top = q('.f-top'), fr = q('.f-r');
    sp.style.cssText = 'width:' + T + 'px;height:' + H + 'px;left:' + (-T / 2) + 'px;top:' + (-H / 2) + 'px;transform:translateZ(' + D / 2 + 'px);--tone:' + (p.series ? '#3d362a' : p.tone);
    var inner = sp.firstChild; inner.style.cssText += ';width:' + b.w + 'px;height:' + b.h + 'px;transform:scale(' + k + ');transform-origin:0 0;inset:auto;left:0;top:0';
    top.style.cssText = 'width:' + T + 'px;height:' + D + 'px;left:' + (-T / 2) + 'px;top:' + (-D / 2) + 'px;transform:rotateX(90deg) translateZ(' + H / 2 + 'px)';
    fr.style.cssText = 'width:' + D + 'px;height:' + H + 'px;left:' + (-D / 2) + 'px;top:' + (-H / 2) + 'px;transform:rotateY(90deg) translateZ(' + T / 2 + 'px)';
    var img = q('.lf-img img'); img.setAttribute('sizes', D + 'px'); img.setAttribute('srcset', p.coverSrcset); img.src = p.cover;
    leaf = q('.leaf'); page1 = q('.p1'); p1title = q('.p1-zh');
    scene.appendChild(box);
    var fs = 1.5; while (p1title.offsetWidth > page1.clientWidth * 0.78 && fs > 0.8) { fs -= 0.05; p1title.style.fontSize = fs + 'em'; }
    if (p1title.offsetWidth > page1.clientWidth * 0.78) p1title.style.whiteSpace = 'normal';
  }
  function T(st) {
    return 'translate3d(' + st.x.toFixed(1) + 'px,' + st.y.toFixed(1) + 'px,0) rotateX(' + st.rx + 'deg) rotateY(' + st.ry + 'deg) scale3d(' + st.s.toFixed(4) + ',' + st.s.toFixed(4) + ',' + st.s.toFixed(4) + ') translateZ(' + (-G.D / 2) + 'px)';
  }
  function poses(b) {
    var r = K.rel(b.body, stage), s0 = r.h / G.H, rest = K.rel(b.el, stage);
    var slot = { x: rest.x + rest.w / 2, y: rest.y + rest.h / 2, rx: 0, ry: 0, s: b.h / G.H };
    return {
      start: { x: r.x + r.w / 2, y: r.y + r.h / 2, rx: 0, ry: 0, s: s0 },
      slot: slot,
      // Out of the row: head first (a finger on the top pulls it toward you), up and a little larger.
      pulled: { x: r.x + r.w / 2 + (G.X0 - r.x) * 0.12, y: r.y + r.h / 2 - Math.min(90, b.h * 0.42), rx: -14, ry: 0, s: s0 * 1.22 },
      turned: { x: G.X0 - G.D / 2, y: G.Y0, rx: -9, ry: -90, s: 1 },
      opened: { x: G.X0, y: G.Y0, rx: -3, ry: -90, s: 1 }
    };
  }

  async function open(i) {
    if (busy || openI >= 0) return;
    busy = true; openI = i;
    var b = shelf.books[i], p = posts[i];
    pen.hide(); cap.hidden = true;
    if (bird.perch === i) { bird.consider(i + 1 < posts.length ? i + 1 : i - 1, 0); await K.wait(130); }
    build(b, p);
    var P = poses(b);
    box.style.transform = T(P.start);
    b.el.style.visibility = 'hidden';
    S[i].lift.x = S[i].lift.t = 0; S[i].fwd.x = S[i].fwd.t = 0; S[i].lift.v = S[i].fwd.v = 0; apply(b, S[i]);
    setLean(i, true);                                          // the gap is real now: neighbours lean further
    // Pull · turn · open: three held beats of one gesture, each segment carrying its own spring.
    await Promise.all([
      K.play(box, [
        { transform: T(P.start), easing: K.curve(0.9) },
        { transform: T(P.pulled), offset: 0.22, easing: K.curve(0.72) },
        { transform: T(P.turned), offset: 0.6, easing: K.curve(0.8) },
        { transform: T(P.opened) }], { duration: 1100, easing: 'linear' }),
      K.play(leaf, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-172deg)' }], { duration: 500, delay: 600, easing: K.curve(0.74) })
    ]);
    var from = { paper: K.rel(page1, stage), title: K.rel(p1title, stage) };
    p1title.style.visibility = 'hidden';
    await read.show(p, from, function (viaKey) { close(i, viaKey); });
    scene.style.visibility = 'hidden';
    busy = false;
  }
  async function close(i, viaKey) {
    if (busy) return;
    busy = true;
    var b = shelf.books[i];
    scene.style.visibility = '';
    await read.hide({ paper: K.rel(page1, stage), title: K.rel(p1title, stage) });
    p1title.style.visibility = '';
    var P = poses(b);
    var above = { x: P.slot.x, y: P.slot.y - Math.min(90, b.h * 0.42), rx: -8, ry: 0, s: P.slot.s * 1.1 };
    // Close · turn back · drop: the last segment falls under gravity, then the flat spine takes the landing.
    await Promise.all([
      K.play(leaf, [{ transform: 'rotateY(-172deg)' }, { transform: 'rotateY(0deg)' }], { duration: 360, easing: K.curve(0.92) }),
      K.play(box, [
        { transform: T(P.opened), easing: K.curve(0.95) },
        { transform: T(P.turned), offset: 0.32, easing: K.curve(0.88) },
        { transform: T(above), offset: 0.8, easing: 'cubic-bezier(.5,0,.9,.55)' },
        { transform: T(P.slot) }], { duration: 1050, easing: 'linear' })
    ]);
    // Hand back to the flat spine: it lands with weight, the neighbours are shoved upright and wobble.
    b.el.style.visibility = ''; scene.innerHTML = ''; box = null;
    S[i].lift.x = 3; S[i].lift.v = -90; S[i].lift.t = 0;
    [i - 1, i + 1].forEach(function (j) { if (S[j]) { S[j].lean.t = 0; S[j].lean.v += (j < i ? -1 : 1) * 40; } });
    [i - 2, i + 2].forEach(function (j) { if (S[j]) S[j].lean.t = 0; });
    b.el.classList.remove('lifted');
    loop.kick();
    openI = -1; cur = -1; busy = false;
    if (viaKey) b.el.focus({ preventScroll: true }); else if (document.activeElement) document.activeElement.blur();
  }

  // ---- wiring -------------------------------------------------------------------------------------
  shelf.books.forEach(function (b, i) {
    b.el.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') consider(i); });
    b.el.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;        // real link still works in a new tab
      e.preventDefault();
      if (cur !== i) { consider(i); if (e.pointerType === 'touch') return; } // first tap previews
      open(i);
    });
  });
  shelf.wrap.addEventListener('pointerleave', function () { if (!shelf.row.contains(document.activeElement)) consider(-1); });
  K.rove(shelf, consider, function () { consider(-1); });
  function init() { K.measure(shelf); bird.home(); }
  init();
  window.addEventListener('resize', function () { if (openI < 0) { K.measure(shelf); bird.home(); } });
  document.addEventListener('mock:rm', function () { shelf.books.forEach(function (b, j) { S[j].lift.snap(); S[j].fwd.snap(); S[j].lean.snap(); apply(b, S[j]); }); });

  window.replayA = async function () {
    if (busy) return;
    if (read.open) { close(openI); return; }
    consider(-1); await K.wait(300);
    consider(7); await K.wait(1100);
    await open(7); await K.wait(1800);
    await close(7);
  };
  window.__A = { consider: consider, open: open, close: close, get busy() { return busy; } };
})();
