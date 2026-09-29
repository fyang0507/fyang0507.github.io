/* r4-05 · when the lead card's 小红花 is pressed. Every press has a cause, and there are only five:
     first view   once per session (sessionStorage): until then the flower isn't on the card at all
     hover        a fine pointer arrives on the card — once per entry; resting on it never repeats it
     focus        keyboard focus arrives on the card from outside it (Tab), not moving within it
     return       the card comes back into view after the board was dragged, or the page scrolled,
                  far enough to take it away (<5% visible) — pressed once the board has come to rest
     re-pin       the card is pinned back: the pin's thump presses it (from the unpin's onLand hook)
   One cooldown across all of them (COOL), so sweeping across the card or wobbling at the edge of the
   view can't strobe it. Touch has no hover: return and re-pin carry it there. Reduced motion: none. */
(function () {
  var COOL = 1400, SEEN = 0.6, GONE = 0.05;

  // B: { k (FYCork build), P (physics), fl (FYFlower handle) } · o: { key (sessionStorage), log(cause) }
  window.FYFlowerCues = function (B, o) {
    var s = B.k.slots[0], last = -1e9, away = false;
    var applied = !!sessionStorage.getItem(o.key), intro = applied;
    function press(kind, cause) {
      if (Pen.reduced()) { B.fl.show(); return false; }
      var now = performance.now();
      if (kind !== 'apply' && (!intro || now - last < COOL || B.fl.busy())) return false;
      if (!B.fl.press(kind)) return false;
      last = now;
      if (o.log) o.log(cause);
      return true;
    }
    // Wait for the board itself to stop (a fling back ends on the edge spring), then press. Not for
    // every slip to stop swinging: the lead is taped and barely swings, and a late press loses its cause.
    function whenStill(fn) {
      var t0 = performance.now();
      (function check() {
        if (B.P.state().mode === 'idle' || performance.now() - t0 > 1200) setTimeout(fn, 120);
        else requestAnimationFrame(check);
      })();
    }

    s.swing.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || e.buttons || s.el.classList.contains('unpinned')) return;
      press('pop', 'hover');
    });
    s.el.addEventListener('focusin', function (e) {
      if (s.el.contains(e.relatedTarget) || !e.target.matches(':focus-visible')) return;
      press('pop', 'focus');
    });
    new IntersectionObserver(function (en) {
      var r = en[0].intersectionRatio;
      if (!intro) {
        if (r < SEEN) return;
        intro = true;
        if (Pen.reduced()) { B.fl.show(); return; }
        setTimeout(function () { if (press('apply', 'first view')) sessionStorage.setItem(o.key, '1'); }, 320);
        return;
      }
      if (r < GONE) { if (!s.el.classList.contains('unpinned')) away = true; return; }
      if (r >= SEEN && away) { away = false; whenStill(function () { press('pop', 'return'); }); }
    }, { threshold: [0, GONE, SEEN, 1] }).observe(B.fl.mark);

    return { repin: function (i) { if (i === 0) press('repin', 're-pin'); }, press: press, applied: function () { return applied; } };
  };
})();
