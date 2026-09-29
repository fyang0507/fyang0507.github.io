/* r3-05 · wiring: the r2-05 board (desktop + phone) with the featured mark, the mark + pin switch,
   once-per-session apply, the real-size comparison strip, replays. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var PICK = 'flower', state = { icon: PICK, coral: false };
  var NAMES = { flower: 'F1 flower <span class="cn">小红花</span>', star: 'F2 star', seal: 'F3 seal <span class="cn">荐</span>', rosette: 'F4 rosette' };

  function board(host, o, key) {
    var k = FYCork.build(host, o), U = null;
    var P = FYPhysics(k, { onEnter: function (i) { U.openIndex(i); } });
    U = FYUnpin(k, P, { host: o.overlayHost });
    var lead = k.slots[0];
    var fm = FYFeatured.mount(lead.swing.querySelector('.paper--lead'), { slot: lead.el, icon: state.icon, pin: state.coral, phys: P, index: 0 });
    // Applied once per session, the first time the word is actually on screen.
    var sk = 'r3-05-applied-' + key;
    if (sessionStorage.getItem(sk)) fm.applied = true;
    new IntersectionObserver(function (en, io) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      if (fm.applied) return;
      setTimeout(function () { fm.apply(); sessionStorage.setItem(sk, '1'); }, 320);
    }, { threshold: 0.6 }).observe(fm.mark);
    return { k: k, P: P, U: U, fm: fm };
  }
  var main = board($('board-main'), { order: 'projects · drag →' }, 'main');
  var phone = board($('board-phone'), { order: 'projects · swipe →', overlayHost: $('phone'), viewportLabel: 'Project board on a phone. Swipe sideways; tap a card to unpin it' }, 'phone');
  var boards = [main, phone];

  /* The switch: selected state is an ink pen loop (the coral stays on the card). */
  function group(name, items, current, onPick) {
    var g = document.querySelector('.wm-switch[data-group="' + name + '"]'), opts = [];
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button'; b.dataset.v = it[0]; b.setAttribute('aria-pressed', String(it[0] === current));
      b.innerHTML = it[1] + (it[2] ? '<span class="pk">pick</span>' : '');
      g.appendChild(b);
      opts.push({ v: it[0], b: b, mark: Pen.annotate(b, 'loop', { manual: true, color: 'var(--ink)', width: 1.3, pad: 3, seed: 'r3-05-' + name + '-' + it[0] }) });
    });
    g.addEventListener('click', function (e) { var b = e.target.closest('button[data-v]'); if (b) onPick(b.dataset.v); });
    requestAnimationFrame(function () { opts.forEach(function (o) { if (o.v === current) o.mark.show(); }); });
    return function (v) { opts.forEach(function (o) { var on = o.v === v; o.b.setAttribute('aria-pressed', String(on)); if (on) o.mark.show(); else o.mark.hide(); }); };
  }
  var showIcon = group('icon', FYFeaturedIcons.names.map(function (n) { return [n, NAMES[n], n === PICK]; }), state.icon, function (v) { choose(v, true); });
  var showPin = group('pin', [['ink', 'ink', true], ['coral', 'coral']], 'ink', function (v) { pin(v === 'coral'); });
  function choose(v, animate) {
    state.icon = v; showIcon(v);
    boards.forEach(function (B) { B.fm.set(v, animate); });
  }
  function pin(coral) {
    state.coral = coral; showPin(coral ? 'coral' : 'ink');
    boards.forEach(function (B) { B.fm.pin(coral); });
  }

  /* The strip: the real lead card at the two real container widths, cropped round the end of "Agent".
     Specimens are inert (no unpin, no tab stops). */
  var WIDTH = { d: 1169, m: 358.8 };   // the board's container on a 1440 screen · inside a 390 phone
  var specs = [];
  [].forEach.call(document.querySelectorAll('.r3-tile'), function (t) {
    var icon = t.dataset.icon, row = [];
    ['d', 'm'].forEach(function (sz) {
      var crop = t.querySelector('.r3-crop--' + sz), k = FYCork.build(crop, { only: 'fred-agent', label: 'Lead card specimen' });
      k.wrap.inert = true; k.wrap.style.width = WIDTH[sz] + 'px';
      var s = k.slots[0], paper = s.swing.querySelector('.paper--lead'), h;
      if (icon === 'asterisk') {
        h = FYWordmark.mount(paper, { slot: s.el, variant: 'star' });
        h.play();
        h.apply = h.replay;
        h.size = function () { var fs = parseFloat(getComputedStyle(paper.querySelector('.wm-mark')).fontSize); return { title: Math.round(fs), mark: Math.round(Math.max(26, fs * 0.42)) }; };
      } else {
        h = FYFeatured.mount(paper, { slot: s.el, icon: icon });
      }
      var sp = { crop: crop, wrap: k.wrap, mark: paper.querySelector('.wm-mark'), h: h, sz: sz };
      row.push(sp); specs.push(sp);
    });
    t.querySelector('.r3-redo').addEventListener('click', function () { row.forEach(function (sp) { sp.h.apply(); }); });
    var tryB = t.querySelector('.r3-try');
    if (tryB) tryB.addEventListener('click', function () {
      choose(icon, false);
      main.k.root.scrollIntoView({ block: 'center', behavior: Pen.reduced() ? 'auto' : 'smooth' });
      main.P.go(0);
      setTimeout(function () { main.fm.apply(); }, 650);
    });
    t._row = row;
  });
  // Frame each crop on the end of the word, 60% across. Desktop: the word's upper half centred. Phone:
  // the title wraps ("Fred" / "Agent"), so the crop starts at the top of the "Agent" line.
  function frame(sp) {
    var cr = sp.crop.getBoundingClientRect(), wr = sp.wrap.getBoundingClientRect(), mr = sp.mark.getBoundingClientRect();
    if (!cr.width) return;
    var ex = mr.right - wr.left, ty = sp.sz === 'm' ? 14 - (mr.top - wr.top) : cr.height * 0.5 - (mr.top + mr.height * 0.4 - wr.top);
    sp.wrap.style.transform = 'translate(' + (cr.width * 0.6 - ex).toFixed(1) + 'px,' + ty.toFixed(1) + 'px)';
  }
  function frameAll() {
    specs.forEach(frame);
    [].forEach.call(document.querySelectorAll('.r3-tile'), function (t) {
      var d = t._row[0].h.size(), m = t._row[1].h.size();
      t.querySelector('.r3-size').textContent = '1440 · ' + d.title + 'px title · ' + d.mark + 'px mark / 390 · ' + m.title + 'px · ' + m.mark + 'px';
    });
    var ps = phone.fm.size();
    document.querySelectorAll('[data-size="phone-title"]').forEach(function (n) { n.textContent = ps.title; });
    document.querySelectorAll('[data-size="phone-mark"]').forEach(function (n) { n.textContent = ps.mark; });
  }
  new ResizeObserver(frameAll).observe(document.querySelector('.r3-strip'));
  document.fonts.ready.then(function () { requestAnimationFrame(frameAll); });

  document.addEventListener('mock:rm', function () {
    document.querySelectorAll('.stk').forEach(function (el) { el.getAnimations({ subtree: true }).forEach(function (a) { a.finish(); }); });
  });

  window.replayApply = function () {
    main.k.root.scrollIntoView({ block: 'center' });
    main.P.go(0, true);
    setTimeout(function () { boards.forEach(function (B) { B.fm.apply(); }); }, 300);
  };
  window.replayUnpin = function () {
    if (main.U.isOpen()) return;
    main.k.root.scrollIntoView({ block: 'center' });
    main.P.go(0, true);
    setTimeout(function () { main.U.open('fred-agent'); }, 300);
  };
  window.replayStrip = function () { specs.forEach(function (sp, i) { setTimeout(sp.h.apply, i * 90); }); };
  window.__r3_05 = { main: main, phone: phone, specs: specs, choose: choose, pin: pin, state: state };
})();
