/* r2-05 · wiring: the integrated board (desktop + phone), the wordmark switch, the study tiles, replays. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var PICK = 'rule';
  var NAMES = { stop: 'W1 full stop', rule: 'W2 level rule', loop: 'W3 loop', star: 'W4 asterisk', pin: 'W5 coral pin' };

  function board(host, o) {
    var k = FYCork.build(host, o), U = null;
    var P = FYPhysics(k, { onEnter: function (i) { U.openIndex(i); } });
    U = FYUnpin(k, P, { host: o.overlayHost });
    var lead = k.slots[0];
    var wm = FYWordmark.mount(lead.swing.querySelector('.paper--lead'), { slot: lead.el, variant: PICK });
    return { k: k, P: P, U: U, wm: wm };
  }
  var main = board($('board-main'), { order: 'projects · drag →' });
  var phone = board($('board-phone'), { order: 'projects · swipe →', overlayHost: $('phone'), viewportLabel: 'Project board on a phone. Swipe sideways; tap a card to unpin it' });

  /* The wordmark switch: selected state is a pen loop in ink (the coral stays on the wordmark). */
  var sw = document.querySelector('.wm-switch'), opts = [];
  FYWordmark.variants.forEach(function (v) {
    var b = document.createElement('button');
    b.type = 'button'; b.dataset.wm = v; b.setAttribute('aria-pressed', String(v === PICK));
    b.innerHTML = NAMES[v] + (v === PICK ? '<span class="pk">pick</span>' : '');
    sw.appendChild(b);
    opts.push({ v: v, b: b, mark: Pen.annotate(b, 'loop', { manual: true, color: 'var(--ink)', width: 1.3, pad: 3, seed: 'wm-switch-' + v }) });
  });
  function choose(v, animate) {
    opts.forEach(function (o) { var on = o.v === v; o.b.setAttribute('aria-pressed', String(on)); if (on) o.mark.show(); else o.mark.hide(); });
    [main, phone].forEach(function (B) { B.wm.set(v, animate); });
  }
  sw.addEventListener('click', function (e) { var b = e.target.closest('button[data-wm]'); if (b) choose(b.dataset.wm, true); });
  requestAnimationFrame(function () { opts.forEach(function (o) { if (o.v === PICK) o.mark.show(); }); });

  /* Study tiles: the real lead card, one per treatment. Specimens, so they are inert (no unpin, no tab stops). */
  var tiles = [].map.call(document.querySelectorAll('.wm-tile'), function (t) {
    var v = t.dataset.variant, k = FYCork.build(t.querySelector('.wm-card'), { only: 'fred-agent', label: 'Lead card specimen' });
    k.wrap.inert = true;
    var s = k.slots[0], wm = FYWordmark.mount(s.swing.querySelector('.paper--lead'), { slot: s.el, variant: v });
    t.querySelector('.wm-redraw').addEventListener('click', function () { wm.replay(); });
    var tryB = t.querySelector('.wm-try');
    if (tryB) tryB.addEventListener('click', function () {
      choose(v, false);
      main.k.root.scrollIntoView({ block: 'center', behavior: Pen.reduced() ? 'auto' : 'smooth' });
      main.P.go(0);
      setTimeout(function () { main.wm.replay(); phone.wm.replay(); }, 650);
    });
    return wm;
  });

  window.replayFling = function () {
    main.k.root.scrollIntoView({ block: 'center' });
    main.P.go(0, true);
    setTimeout(function () { main.P.fling(2600); }, 350);
  };
  // Fling, and take a slip down while the paper is still swinging from the stop.
  window.replayUnpin = function () {
    if (main.U.isOpen()) return;
    main.k.root.scrollIntoView({ block: 'center' });
    main.P.go(0, true);
    setTimeout(function () { main.P.fling(1500); }, 300);
    setTimeout(function () { main.U.open('audio-processing-cli'); }, 1050);
  };
  window.replayW = function () {
    tiles.forEach(function (wm, i) { setTimeout(wm.replay, i * 140); });
    main.wm.replay(); phone.wm.replay();
  };
  window.__r2_05 = { main: main, phone: phone, tiles: tiles, choose: choose };
})();
