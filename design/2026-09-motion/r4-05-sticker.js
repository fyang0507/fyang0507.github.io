/* r4-05 · the lead card's 小红花, shipped (F1 from r3-05, geometry unchanged in r3-05-icons.js).
   Round 4: the press Fred liked is the flower's behaviour, not only its arrival. One motion, three
   entries into it — all on the hand's clock for the lift, the physics clock for the press:
     apply  first view per session: it arrives already in the fingers (held frame) → pressed down
     pop    from rest: it pops up toward you (one quick rise, one held frame) → pressed back down
     repin  the card lands home: jolted up, then pressed down by the pin's own thump (contact on the
            pin's impact frame, 72 ms after landing)
   Every press: the card gives a hair into the cork (its own scale spring), one small rotational
   settle as the glue takes, and the petal that never takes the glue is flattened, then lifts again.
   Reduced motion: never moves; the flower is simply there. */
(function () {
  var ctx2d = document.createElement('canvas').getContext('2d');
  var f1 = function (n) { return Math.round(n * 10) / 10; };
  var uid = 0, LIFT = FYFeaturedIcons.lift;
  var OUT = 'cubic-bezier(.2,.7,.3,1)', DOWN = 'cubic-bezier(.55,0,.9,.45)';
  // ms: rise (0 = appears already lifted) · hold (the held frame) · down (to contact) · lifted pose scale
  var KIND = {
    apply: { rise: 0, hold: 92, down: 92, up: [.1, .3, 9, 1.16], flatFirst: true, dv: .12 },
    pop: { rise: 80, hold: 70, down: 60, up: [.06, .2, 6, 1.12], dv: .1 },
    repin: { rise: 0, hold: 30, down: 42, up: [.05, .16, 5, 1.1], dv: .06 }
  };

  function metrics(mark) {   // from r2-05-wordmark.js
    var cs = getComputedStyle(mark), fs = parseFloat(cs.fontSize), lh = mark.offsetHeight;
    ctx2d.font = cs.fontWeight + ' ' + fs + 'px ' + cs.fontFamily;
    var mA = ctx2d.measureText('A');
    var fA = mA.fontBoundingBoxAscent || fs * 0.98, fD = mA.fontBoundingBoxDescent || fs * 0.26;
    var base = (lh - (fA + fD)) / 2 + fA;
    return { fs: fs, w: mark.offsetWidth, h: lh, base: base, cap: base - (mA.actualBoundingBoxAscent || fs * 0.7) };
  }

  /* mount(paper, { slot, phys, index, hidden }) → handle
       press(kind) → true if it moved · show() · size() → { title, mark } px · busy() */
  function mount(paper, o) {
    var h = { paper: paper, mark: paper.querySelector('.wm-mark'), el: null, bw: 0, bh: 0, until: 0 };
    function render() {
      if (h.el) h.el.remove();
      var m = metrics(h.mark), made = FYFeaturedIcons.svg('flower', 'fred-agent-flower', 'fl' + (++uid)), ic = made.icon;
      var S = Math.max(26, m.fs * 0.42) * ic.scale, cx = m.w + m.fs * ic.dx, cy = m.cap + m.fs * ic.dy;
      var el = document.createElement('span');
      el.className = 'stk stk--flower' + (o.hidden ? ' stk--unapplied' : '');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'width:' + f1(S) + 'px;height:' + f1(S) + 'px;left:' + f1(cx - S / 2) + 'px;top:' + f1(cy - S / 2) + 'px;--rot:' + ic.rest + 'deg';
      el.innerHTML = made.html;
      h.mark.appendChild(el);
      h.el = el; h.spec = ic; h.S = S; h.fs = m.fs; h.bw = h.mark.offsetWidth; h.bh = h.mark.offsetHeight;
    }
    h.size = function () { return { title: Math.round(h.fs), mark: Math.round(h.S) }; };
    h.show = function () { o.hidden = false; if (h.el) h.el.classList.remove('stk--unapplied'); };
    h.busy = function () { return performance.now() < h.until; };

    function give(dv) {   // the thumb presses the card into the cork: a kick to its existing scale spring
      if (!o.phys || o.index == null) return;
      var c = o.phys.cards[o.index];
      if (c && !c.off) { c.sv -= dv; o.phys.wake(); }
    }
    h.press = function (kind) {
      var k = KIND[kind], el = h.el;
      h.show();
      if (!el || Pen.reduced()) return false;
      el.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
      var S = h.S, rot = h.spec.rest, c = k.rise + k.hold + k.down, T = c + 270;
      var rest = 'rotate(' + rot + 'deg)', up = 'translate(' + f1(-S * k.up[0]) + 'px,' + f1(-S * k.up[1]) + 'px) rotate(' + (rot - k.up[2]) + 'deg) scale(' + k.up[3] + ')';
      var air = 'drop-shadow(-3px 7px 3px rgba(60,50,35,.26))', flat = 'drop-shadow(-.5px .8px 0 rgba(60,50,35,.2))';
      var kf = [];
      if (k.rise) kf.push({ transform: rest, filter: flat, offset: 0, easing: OUT });                 // it pops up toward you
      kf.push({ transform: up, filter: air, offset: k.rise / T, easing: 'linear' },                      // held in the fingers, one frame
        { transform: up, filter: air, offset: (k.rise + k.hold) / T, easing: DOWN },                     // then down, fast
        { transform: 'rotate(' + (rot + 1.6) + 'deg)', filter: flat, offset: c / T, easing: OUT },       // contact
        { transform: 'rotate(' + (rot - .45) + 'deg)', filter: flat, offset: (c + 120) / T, easing: 'ease-in-out' },   // the glue takes
        { transform: rest, filter: flat, offset: 1 });
      el.animate(kf, { duration: T });
      // The petal that never takes the glue: flat under the thumb at contact, then up again.
      var f0 = k.flatFirst ? 'scaleX(1)' : 'scaleX(' + LIFT + ')', s0 = k.flatFirst ? 0 : 1;
      var flap = el.querySelector('.stk-flap'), sh = el.querySelector('.stk-shadow'), a = Math.max(0, (c - 12) / T);
      if (flap) flap.animate([{ transform: f0, offset: 0 }, { transform: f0, offset: a }, { transform: 'scaleX(1)', offset: c / T }, { transform: 'scaleX(1)', offset: (c + 50) / T, easing: 'cubic-bezier(.2,.8,.3,1)' },
        { transform: 'scaleX(' + (LIFT - .08) + ')', offset: (c + 180) / T, easing: 'ease-in-out' }, { transform: 'scaleX(' + LIFT + ')', offset: 1 }], { duration: T });
      if (sh) sh.animate([{ opacity: s0, offset: 0 }, { opacity: s0, offset: a }, { opacity: 0, offset: c / T }, { opacity: 0, offset: (c + 50) / T }, { opacity: 1, offset: (c + 180) / T }, { opacity: 1, offset: 1 }], { duration: T });
      setTimeout(function () { give(k.dv); }, c);
      h.until = performance.now() + T;
      return true;
    };

    // Rebuild at the new size when the word's box changes (font swap, reflow); nothing replays.
    new ResizeObserver(function () {
      var w = h.mark.offsetWidth, hh = h.mark.offsetHeight;
      if (!w || (w === h.bw && hh === h.bh)) return;
      render();
    }).observe(h.mark);
    render();
    return h;
  }

  window.FYFlower = { mount: mount, kinds: KIND };
})();
