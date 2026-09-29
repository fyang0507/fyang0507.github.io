/* r3-05 · the featured mark on the lead card's wordmark. W4's form from round 2 — a small thing
   someone stuck on at the end of "Agent", scaled with the title — with a mark that means "the pick"
   instead of "see the footnote". Applied once, when the card is first seen:
     sticker (flower, star, rosette) — hand's clock, then physics: one held frame in the fingers above
       its place → pressed down, the card gives a hair into the cork → a small rotational settle as the
       glue takes → the flap that didn't take lifts off and stays up. At rest nothing moves.
     seal — hand's clock only: the stamp lands on its left edge (one frame), rocks flat, wet and solid
       (one frame), lifts — the ink has gone into the paper, uneven, and stays that way.
   Reduced motion: already applied. */
(function () {
  var ctx2d = document.createElement('canvas').getContext('2d');
  var f1 = function (n) { return Math.round(n * 10) / 10; };
  var uid = 0;

  // Glyph metrics of "Agent" inside its inline-block (height = one line box). From r2-05-wordmark.js.
  function metrics(mark) {
    var cs = getComputedStyle(mark), fs = parseFloat(cs.fontSize), lh = mark.offsetHeight;
    ctx2d.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
    var mA = ctx2d.measureText('A');
    var fA = mA.fontBoundingBoxAscent || fs * 0.98, fD = mA.fontBoundingBoxDescent || fs * 0.26;
    var base = (lh - (fA + fD)) / 2 + fA;
    return { fs: fs, w: mark.offsetWidth, h: lh, base: base, cap: base - (mA.actualBoundingBoxAscent || fs * 0.7) };
  }

  /* mount(paper, { slot, icon, pin, phys, index }) → handle
       set(icon, animate) · pin(coral) · apply() · size() → { title, mark } in px */
  function mount(paper, o) {
    var h = { paper: paper, mark: paper.querySelector('.wm-mark'), slot: o.slot || null, icon: null, el: null, spec: null, applied: false, bw: 0, bh: 0 };
    function clear() { if (h.el) h.el.remove(); h.el = null; paper.classList.remove('stk-on--' + h.icon); }
    function render() {
      var m = metrics(h.mark), id = 'stk' + (++uid), made = FYFeaturedIcons.svg(h.icon, 'fred-agent-' + h.icon, id), ic = made.icon;
      var S = Math.max(26, m.fs * 0.42) * ic.scale, cx = m.w + m.fs * ic.dx, cy = m.cap + m.fs * ic.dy;
      var el = document.createElement('span');
      el.className = 'stk stk--' + h.icon + (ic.stamp ? ' stk--stamp' : '');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'width:' + f1(S) + 'px;height:' + f1(S) + 'px;left:' + f1(cx - S / 2) + 'px;top:' + f1(cy - S / 2) + 'px;--rot:' + ic.rest + 'deg';
      el.innerHTML = made.html;
      h.mark.appendChild(el);
      paper.classList.add('stk-on--' + h.icon);
      h.el = el; h.spec = ic; h.S = S; h.fs = m.fs;
      h.bw = h.mark.offsetWidth; h.bh = h.mark.offsetHeight;
    }
    h.set = function (icon, animate) { clear(); h.icon = icon; render(); if (animate) h.apply(); };
    h.pin = function (coral) { if (h.slot) h.slot.classList.toggle('r3-pin-coral', !!coral); };
    h.size = function () { return { title: Math.round(h.fs), mark: Math.round(h.S) }; };

    // The card gives a hair where the thumb presses it into the cork (the pendulum's own scale spring).
    function press(dv) {
      if (!o.phys || o.index == null) return;
      var c = o.phys.cards[o.index];
      if (c && !c.off) { c.sv -= dv; o.phys.wake(); }
    }
    h.apply = function () {
      h.applied = true;
      var el = h.el, ic = h.spec, S = h.S, rot = ic.rest;
      if (!el || Pen.reduced()) return;
      el.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
      if (ic.stamp) {
        // Held frames: the easing sits on each keyframe (an effect-level steps() would hold frame one throughout).
        var pose = 'rotate(' + rot + 'deg)', all = 'polygon(-10% -10%, 110% -10%, 110% 110%, -10% 110%)', H = 'steps(1,end)';
        el.animate([
          { transform: pose + ' scale(1.035)', clipPath: 'polygon(-10% -10%, 64% -10%, 40% 110%, -10% 110%)', easing: H },   // lands on its left edge
          { transform: pose + ' scale(1.035)', clipPath: all, offset: .34, easing: H },   // rocked flat, wet
          { transform: pose, clipPath: all, offset: .67, easing: H },                      // lifted: the ink has gone in
          { transform: pose, clipPath: all }], { duration: 230 });
        var spk = el.querySelector('.stk-spk');
        if (spk) spk.animate([{ opacity: 0, easing: H }, { opacity: 1, offset: .67 }, { opacity: 1 }], { duration: 230 });
        press(0.14);
        return;
      }
      var up = 'translate(' + f1(-S * .1) + 'px,' + f1(-S * .3) + 'px) rotate(' + (rot - 9) + 'deg) scale(1.16)';
      var air = 'drop-shadow(-3px 7px 3px rgba(60,50,35,.26))', flat = 'drop-shadow(-.5px .8px 0 rgba(60,50,35,.2))';
      el.animate([
        { transform: up, filter: air, easing: 'steps(1,end)' },                                          // held in the fingers, one frame
        { transform: up, filter: air, offset: .2, easing: 'cubic-bezier(.55,0,.9,.45)' },                 // then down, fast
        { transform: 'rotate(' + (rot + 1.6) + 'deg)', filter: flat, offset: .4, easing: 'cubic-bezier(.2,.7,.3,1)' },   // contact
        { transform: 'rotate(' + (rot - .45) + 'deg)', filter: flat, offset: .66, easing: 'ease-in-out' },  // the glue takes: one small overshoot
        { transform: 'rotate(' + rot + 'deg)', filter: flat }], { duration: 460 });
      var flap = el.querySelector('.stk-flap'), sh = el.querySelector('.stk-shadow');
      if (flap) flap.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(1)', offset: .5, easing: 'cubic-bezier(.2,.8,.3,1)' }, { transform: 'scaleX(.62)', offset: .78, easing: 'ease-in-out' }, { transform: 'scaleX(.7)' }], { duration: 460 });
      if (sh) sh.animate([{ opacity: 0 }, { opacity: 0, offset: .5 }, { opacity: 1, offset: .78 }, { opacity: 1 }], { duration: 460 });
      setTimeout(function () { press(0.12); }, 184);
    };

    // Rebuild at the new size when the word's box changes (font swap, reflow); an applied mark stays applied.
    new ResizeObserver(function () {
      var w = h.mark.offsetWidth, hh = h.mark.offsetHeight;
      if (!w || (w === h.bw && hh === h.bh)) return;
      clear(); render();
    }).observe(h.mark);
    h.set(o.icon || 'flower', false);
    h.pin(o.pin);
    return h;
  }

  window.FYFeatured = { mount: mount };
})();
