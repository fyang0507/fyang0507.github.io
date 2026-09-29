/* r4-05 · wiring: the shipped board (desktop + phone), its flower and the five causes that press it,
   board 02's pen on the cork, the key-pose strip, replays. */
(function () {
  var $ = function (id) { return document.getElementById(id); };

  function board(host, o, key) {
    var k = FYCork.build(host, o), U = null, cues = null, pen = null;
    var P = FYPhysics(k, { onEnter: function (i) { U.openIndex(i); } });
    var layerOf = function () { return o.overlayHost ? o.overlayHost.querySelector(':scope > .unpin-layer') : document.querySelector('body > .unpin-layer--fixed'); };
    U = FYUnpin(k, P, { host: o.overlayHost,
      onOpen: function () { var p = layerOf().querySelector('.unpin-panel'); if (p && pen) pen.panel(p); },
      onLand: function (i) { if (cues) cues.repin(i); } });
    var sk = 'r4-05-applied-' + key, applied = !!sessionStorage.getItem(sk);
    var fl = FYFlower.mount(k.slots[0].swing.querySelector('.paper--lead'), { phys: P, index: 0, hidden: !applied && !Pen.reduced() });
    cues = FYFlowerCues({ k: k, P: P, fl: fl }, { key: sk, log: function (cause) { var n = $('cue-' + key); if (n) n.textContent = cause; } });
    pen = FYCorkPen(k);
    return { k: k, P: P, U: U, fl: fl, cues: cues };
  }
  var main = board($('board-main'), { order: 'projects · drag →' }, 'main');
  var phone = board($('board-phone'), { order: 'projects · swipe →', overlayHost: $('phone'), viewportLabel: 'Project board on a phone. Swipe sideways; tap a card to unpin it' }, 'phone');

  /* Key poses: the real lead card at the real container widths, cropped round the end of "Agent";
     the three motion tiles are the hover pop paused at their times. Specimens are inert. */
  var WIDTH = { d: 1169, m: 358.8 }, specs = [];
  [].forEach.call(document.querySelectorAll('.r4-strip .r3-tile'), function (t) {
    var sz = t.dataset.pose === 'rest-m' ? 'm' : 'd', crop = t.querySelector('.r3-crop');
    var k = FYCork.build(crop, { only: 'fred-agent', label: 'Lead card specimen' });
    k.wrap.inert = true; k.wrap.style.width = WIDTH[sz] + 'px';
    var fl = FYFlower.mount(k.slots[0].swing.querySelector('.paper--lead'), {});
    specs.push({ t: t, sz: sz, crop: crop, wrap: k.wrap, mark: fl.mark, fl: fl, at: Number(t.dataset.t) || 0 });
  });
  function frame(sp) {   // word end at 60% across; phone: start at the top of the "Agent" line (the title wraps)
    var cr = sp.crop.getBoundingClientRect(), wr = sp.wrap.getBoundingClientRect(), mr = sp.mark.getBoundingClientRect();
    if (!cr.width) return;
    var ex = mr.right - wr.left, ty = sp.sz === 'm' ? 14 - (mr.top - wr.top) : cr.height * 0.56 - (mr.top + mr.height * 0.4 - wr.top);
    sp.wrap.style.transform = 'translate(' + (cr.width * 0.6 - ex).toFixed(1) + 'px,' + ty.toFixed(1) + 'px)';
  }
  function freeze() {
    specs.forEach(function (sp) {
      if (!sp.at || !sp.fl.press('pop')) return;
      sp.fl.el.getAnimations({ subtree: true }).forEach(function (a) { a.pause(); a.currentTime = sp.at; });
    });
  }
  function frameAll() {
    specs.forEach(frame);
    specs.forEach(function (sp) { if (!sp.at) { var z = sp.fl.size(); sp.t.querySelector('.r3-size').textContent = z.title + 'px title · ' + z.mark + 'px flower'; } });
    var ps = phone.fl.size();
    document.querySelectorAll('[data-size="phone-title"]').forEach(function (n) { n.textContent = ps.title; });
    document.querySelectorAll('[data-size="phone-mark"]').forEach(function (n) { n.textContent = ps.mark; });
  }
  new ResizeObserver(function () { frameAll(); freeze(); }).observe(document.querySelector('.r4-strip'));
  document.fonts.ready.then(function () { requestAnimationFrame(function () { frameAll(); freeze(); }); });

  document.addEventListener('mock:rm', function () {
    document.querySelectorAll('.stk').forEach(function (el) { el.classList.remove('stk--unapplied'); el.getAnimations({ subtree: true }).forEach(function (a) { a.finish(); }); });
    if (!Pen.reduced()) freeze();
  });

  function toLead(fn, instant) {
    main.k.root.scrollIntoView({ block: 'center' });
    main.P.go(0, instant !== false);
    setTimeout(fn, 320);
  }
  window.replayPop = function () { toLead(function () { main.cues.press('pop', 'replay'); }); };
  // Fling the board past the lead card, then back: the flower is pressed once it has come to rest.
  window.replayReturn = function () {
    toLead(function () {
      main.P.go(main.k.slots[3].el.offsetLeft);
      setTimeout(function () { main.P.fling(-4200); }, 1200);
    });
  };
  window.replayRepin = function () {
    if (main.U.isOpen()) return;
    toLead(function () { main.U.open('fred-agent'); setTimeout(function () { main.U.close(); }, 1500); });
  };
  window.replayPoses = function () { freeze(); };
  window.__r4_05 = { main: main, phone: phone, specs: specs, freeze: freeze };
})();
