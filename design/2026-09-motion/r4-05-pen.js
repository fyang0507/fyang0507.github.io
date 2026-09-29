/* r4-05 · the pen on the corkboard, in board 02's round-4 colours (Fred's call: notice, focus and
   point all in the point arrow's coral; chosen stays the wheat band).
     notice  a level coral pen underline under a link's words or a card's title, drawn in one pass on
             mouse hover, retracted faster on leave. A link's printed pencil rule is traced over, not
             doubled. The lead card's title gets none: its 小红花 is its notice (it pops).
     focus   coral 「 」 at two corners of what has keyboard focus; replaces every ink outline ring.
     chosen  nothing on a corkboard is chosen — a card in your hand is a dialog, not a state — so the
             wheat band has no place here.
   Marks are sized from layout boxes (offsetWidth/Height), so a tilted or lifted card doesn't skew them. */
(function () {
  var CORAL = 'var(--mark)', NS = 'http://www.w3.org/2000/svg';
  var f1 = function (n) { return Math.round(n * 10) / 10; };

  function svgIn(el, z) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('width', '1'); svg.setAttribute('height', '1');
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:' + (z || 4);
    el.appendChild(svg);
    return svg;
  }
  function hide(p) { var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = Pen.hiddenAt(p, L); }

  // 「 」: two corners of el's box, seeded by its text. o: pad · arm · v (vertical arm) · big
  function corners(el, o) {
    o = o || {};
    var svg = svgIn(el, 6), p1 = null, p2 = null, on = false;
    function build() {
      var w = el.offsetWidth, h = el.offsetHeight, r = Pen.rng(((el.textContent || '').trim() || 'f') + '|focus');
      var g = o.pad == null ? 4 : o.pad, arm = o.arm || Math.min(12, w * .32), v = o.v || Math.min(7, h * .3), j = function () { return (r() - .5) * 1.1; };
      var x0 = -g, y0 = -g * .8, x1 = w + g, y1 = h + g * .8;
      svg.innerHTML = '';
      p1 = Pen.path('M' + f1(x0 + arm) + ' ' + f1(y0 + j()) + ' L' + f1(x0) + ' ' + f1(y0) + ' L' + f1(x0 + j()) + ' ' + f1(y0 + v), { color: CORAL, width: 1.9 });
      p2 = Pen.path('M' + f1(x1 + j()) + ' ' + f1(y1 - v) + ' L' + f1(x1) + ' ' + f1(y1) + ' L' + f1(x1 - arm) + ' ' + f1(y1 + j()), { color: CORAL, width: 1.9 });
      svg.appendChild(p1); svg.appendChild(p2);
      [p1, p2].forEach(function (p) { if (on) { var L = p.getTotalLength(); p.style.strokeDasharray = Pen.dashes(p, L); p.style.strokeDashoffset = 0; } else hide(p); });
    }
    build();
    new ResizeObserver(function () { build(); }).observe(el);
    return { set: function (v) {
      if (v === on) return;
      on = v;
      if (v) { Pen.draw(p1, { duration: 140 }); Pen.draw(p2, { duration: 140, delay: 70 }); }
      else { Pen.erase(p1, { duration: 120 }); Pen.erase(p2, { duration: 120 }); }
    } };
  }
  function notice(el, gap) { return Pen.annotate(el, 'underline', { manual: true, color: CORAL, width: 2, gap: gap == null ? 2 : gap, z: 4 }); }
  function textSpan(el) {   // the words of a button or pill, so the line sits under them, not under its border
    var t = el.querySelector(':scope > .pen-t');
    if (!t) { t = document.createElement('span'); t.className = 'pen-t'; while (el.firstChild) t.appendChild(el.firstChild); el.appendChild(t); }
    return t;
  }
  var mouse = function (e) { return e.pointerType === 'mouse' && !e.buttons; };
  function onHover(src, mark) {
    src.addEventListener('pointerenter', function (e) { if (mouse(e)) mark.show(); });
    src.addEventListener('pointerleave', function () { mark.hide(); });
    return mark;
  }
  function onFocus(el, fm) {
    el.addEventListener('focus', function () { fm.set(el.matches(':focus-visible')); });
    el.addEventListener('blur', function () { fm.set(false); });
    if (document.activeElement === el) fm.set(el.matches(':focus-visible'));
  }
  // A link: the notice under its words, or over its printed pencil rule (gap −.5 = the rule's centre), and 「 」 round its box.
  function link(el, o) {
    o = o || {};
    var t = o.words ? textSpan(el) : el;
    onHover(el, notice(t, o.gap));
    onFocus(el, corners(el, o.corners || { pad: 4, arm: 10, v: 7 }));
  }

  /* wire(cork) → { panel(el) } — call panel() with each field note as it opens. */
  window.FYCorkPen = function (k) {
    var titles = [];
    k.root.querySelectorAll('.cork-btn').forEach(function (b) { onHover(b, notice(textSpan(b), 0)); onFocus(b, corners(b, { pad: 3, arm: 9, v: 7 })); });
    onFocus(k.viewport, corners(k.viewport, { pad: -10, arm: 22, v: 16 }));
    k.slots.forEach(function (s) {
      var sw = s.swing, paper = sw.querySelector('.paper');
      // The card's title: notice on card hover (not the lead — its flower answers); 「 」 on the trigger.
      var trig = s.trigger;
      if (s.kind !== 'lead') {
        var head = s.kind === 'featured' ? trig : textSpan(paper.querySelector('h2'));
        var m = notice(head, s.kind === 'featured' ? 3 : 2);
        sw.addEventListener('pointerenter', function (e) { if (mouse(e) && !s.el.classList.contains('unpinned')) m.show(); });
        sw.addEventListener('pointerleave', function () { m.hide(); });
        titles.push(m);
      }
      var big = s.kind === 'lead' || s.kind === 'featured';
      onFocus(trig, corners(trig, big ? { pad: 7, arm: 22, v: 16 } : { pad: 4, arm: 8, v: 6 }));
      sw.querySelectorAll('.project-cta').forEach(function (a) { link(a, { words: true, gap: 1 }); });
      sw.querySelectorAll('.featured-cta, .github-link').forEach(function (a) { link(a, { gap: -.5 }); });
    });
    // A drag is not a hover: the board takes the pointer, and every notice retracts.
    new MutationObserver(function () { if (k.root.classList.contains('grabbing')) titles.forEach(function (m) { m.hide(); }); })
      .observe(k.root, { attributes: true, attributeFilter: ['class'] });
    return { panel: function (el) {
      el.querySelectorAll('.unpin-cta').forEach(function (a) { link(a, { words: true, gap: 1 }); });
      el.querySelectorAll('.github-link').forEach(function (a) { link(a, { gap: -.5 }); });
      el.querySelectorAll('.unpin-close').forEach(function (a) { link(a, { gap: -.5, corners: { pad: 5, arm: 10, v: 7 } }); });
    } };
  };
})();
