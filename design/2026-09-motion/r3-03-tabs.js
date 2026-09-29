/* r3-03-tabs.js — the category dimension as index tabs on a closed book's fore-edge. Same interface as
   r2-03-tabs.js (Tabs.create(col, { onPick, onHint }) → { el, sync(sel, counts, o), tabs }), so r2-03's
   filter controller drives it unchanged; the look and the place are new.
   side (wide layouts): the index is a closed book, cover toward you, with a title slip (题签 · 类别 tags).
     The tabs come out from between its pages at the fore-edge in a vertical stack, all one size, each a
     paper flap with a glued lip where it enters the pages and a pencil contact line along the page beneath. Physics clock: every tab rides its own spring — the chosen one springs out,
     a hovered one eases out a little, one with nothing in the chosen years sinks back into the block.
   strip (phone): the same tabs stand on a horizontal page block and spring up; the strip swipes.
   Pen (board 02's tiers, r2-02-tier.js unchanged): hover = level underline, chosen = highlighter band, no
   tick; keyboard focus = ink 「 」 (r2-02-point.js FocusMark). Coral is not a filter colour. */
(function () {
  var K = 330, C = 20, LIPW = 16;
  var POS = { side: { on: 16, hover: 5, rest: 0, off: -8 }, strip: { on: -11, hover: -4, rest: 0, off: 8 } };
  var NS = 'http://www.w3.org/2000/svg';

  function create(col, opt) {
    var ix = col.index, orient = ix.orient, host = ix.tabs, G = POS[orient];
    // side: the index is a closed book — its cover carries a title slip (题签) and hides the tabs' roots
    var book = orient === 'side' ? '<div class="tb-book" aria-hidden="true"><span class="tb-slip"><b lang="zh">类别</b><i>tags</i></span></div>' : '';
    host.innerHTML = (orient === 'side' ? '' : '<div class="ctl-label tb-label" aria-hidden="true"><span lang="zh">类别</span><span>tags</span></div>') +
      '<div class="tb-block tb-' + orient + '"><div class="tb-scroll"><div class="tb-inner">' + book + '<div class="tb-group" role="radiogroup" aria-label="Tags · 类别">' +
      col.cats.map(function (c) {
        return '<button type="button" class="tb" role="radio" data-cat="' + c.id + '" aria-checked="false" tabindex="-1">' +
          '<svg class="tb-paper" aria-hidden="true"><path class="tb-lip"/><path class="tb-crease"/><path class="tb-out"/><path class="tb-contact"/></svg>' +
          '<span class="tb-lab"><span class="tb-en">' + c.en + '</span><span class="tb-zh" lang="zh">' + c.zh + '</span></span><span class="tb-n"></span></button>';
      }).join('') + '</div><div class="tb-edge" aria-hidden="true"></div></div></div></div>';
    var block = host.querySelector('.tb-block'), scroller = host.querySelector('.tb-scroll');
    var tabs = Array.prototype.slice.call(host.querySelectorAll('.tb'));
    var ts = tabs.map(function (t) {
      return { el: t, cat: t.dataset.cat, p: 0, v: 0, hover: false, off: false, tier: -1,
        mark: new TierMark(t, t.querySelector('.tb-en'), { tick: false, gap: 1, over: 3, seed: 'tab|' + t.dataset.cat }),
        focus: new FocusMark(t, t.querySelector('.tb-lab'), { gap: 6, gy: 4 }) };
    });
    var sel = 'all';

    // ---- the paper: drawn to each tab's size, root under the page block ----
    function shape(s) {
      var w = s.el.offsetWidth, h = s.el.offsetHeight, svg = s.el.querySelector('.tb-paper'), q = function (c) { return svg.querySelector(c); }, d;
      svg.setAttribute('width', w); svg.setAttribute('height', h + 4);
      if (orient === 'side') {
        d = 'M0 .75 H' + (w - 8) + ' Q' + (w - .75) + ' .75 ' + (w - .75) + ' 8 V' + (h - 8) + ' Q' + (w - .75) + ' ' + (h - .75) + ' ' + (w - 8) + ' ' + (h - .75) + ' H0';
        q('.tb-out').setAttribute('d', d + ' Z');
        q('.tb-lip').setAttribute('d', 'M0 1 H' + LIPW + ' V' + (h - 1) + ' H0 Z');
        q('.tb-crease').setAttribute('d', 'M' + LIPW + ' 3 V' + (h - 3));
        q('.tb-contact').setAttribute('d', 'M' + (LIPW + 3) + ' ' + (h + 2.2) + ' H' + (w - 5));
      } else {
        d = 'M.75 ' + h + ' V6 Q.75 .75 6 .75 H' + (w - 6) + ' Q' + (w - .75) + ' .75 ' + (w - .75) + ' 6 V' + h;
        q('.tb-out').setAttribute('d', d + ' Z');
        q('.tb-lip').setAttribute('d', 'M1 ' + (h - LIPW) + ' H' + (w - 1) + ' V' + h + ' H1 Z');
        q('.tb-crease').setAttribute('d', 'M3 ' + (h - LIPW) + ' H' + (w - 3));
        q('.tb-contact').setAttribute('d', 'M' + (w + 2.2) + ' 7 V' + (h - LIPW - 3));
      }
    }
    function build() { ts.forEach(function (s) { shape(s); s.mark.build(); s.focus.build(); }); }

    // ---- tab physics ----
    var raf = 0, last = 0;
    function target(s) { return s.cat === sel ? G.on : s.off ? G.off : s.hover ? G.hover : G.rest; }
    function paint(s) { s.el.style.transform = (orient === 'side' ? 'translateX(' : 'translateY(') + s.p.toFixed(2) + 'px)'; }
    function frame(now) {
      var dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60; last = now;
      var moving = false, n = Math.ceil(dt / (1 / 240)), h = dt / n;
      ts.forEach(function (s) {
        var tg = target(s);
        for (var i = 0; i < n; i++) { s.v += (-K * (s.p - tg) - C * s.v) * h; s.p += s.v * h; }
        if (Math.abs(s.p - tg) < 0.08 && Math.abs(s.v) < 2) { s.p = tg; s.v = 0; } else moving = true;
        paint(s);
      });
      raf = moving ? requestAnimationFrame(frame) : 0; if (!raf) last = 0;
    }
    function kick() {
      if (Pen.reduced()) { ts.forEach(function (s) { s.p = target(s); s.v = 0; paint(s); }); return; }
      if (!raf) raf = requestAnimationFrame(frame);
    }
    // ---- the pen ----
    function tier(s, how) {
      var t = s.cat === sel ? 2 : s.hover ? 1 : 0;
      if (t === s.tier && how !== 'instant') return;
      s.tier = t; s.mark.to(t, how);
    }

    tabs.forEach(function (t, i) {
      var s = ts[i];
      t.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; s.hover = true; kick(); tier(s, 'hover'); opt.onHint(s.cat); });
      t.addEventListener('pointerleave', function () { if (!s.hover) return; s.hover = false; kick(); tier(s, 'hover'); opt.onHint(null); });
      t.addEventListener('focus', function () { if (t.matches(':focus-visible')) { s.focus.set(true); opt.onHint(s.cat); } });
      t.addEventListener('blur', function () { s.focus.set(false); opt.onHint(null); });
      t.addEventListener('click', function () { opt.onPick(s.cat); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, j = k === 'ArrowRight' || k === 'ArrowDown' ? i + 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? tabs.length - 1 : null;
        if (j == null) return;
        e.preventDefault(); j = (j + tabs.length) % tabs.length;
        opt.onPick(ts[j].cat); tabs[j].focus({ preventScroll: true });
      });
    });
    // On a phone the strip swipes: keep the chosen tab in view.
    function reveal(s) {
      if (orient !== 'strip') return;
      var l = s.el.offsetLeft, r = l + s.el.offsetWidth, vw = scroller.clientWidth, x = scroller.scrollLeft;
      if (l < x + 30 || r > x + vw - 10) scroller.scrollTo({ left: Math.max(0, l - 40), behavior: Pen.reduced() ? 'auto' : 'smooth' });
    }

    function sync(nextSel, counts, o) {
      o = o || {};
      var prev = sel, how = o.animate === false ? 'instant' : 'press';
      sel = nextSel;
      ts.forEach(function (s) {
        var c = counts[s.cat] || 0, on = s.cat === sel, cat = col.cats.find(function (x) { return x.id === s.cat; });
        s.off = !c && !on;
        s.el.querySelector('.tb-n').textContent = c;
        s.el.setAttribute('aria-checked', String(on)); s.el.tabIndex = on ? 0 : -1;
        s.el.classList.toggle('is-off', s.off); s.el.classList.toggle('is-on', on);
        s.el.setAttribute('aria-label', cat.en + ' · ' + cat.zh + ', ' + c + ' ' + (c === 1 ? col.noun.one : col.noun.many) + ' · ' + c + ' ' + col.noun.zh +
          (s.off ? ' (none in these years — choosing it releases the years · 选它会放开年份)' : ''));
        tier(s, how);
      });
      if (prev !== sel) reveal(ts.find(function (s) { return s.cat === sel; }));
      kick();
    }
    build();
    document.addEventListener('mock:rm', kick);
    if (document.fonts) document.fonts.ready.then(function () { build(); ts.forEach(function (s) { s.mark.to(s.tier, 'instant'); }); });
    if (window.ResizeObserver) { var lw = 0; new ResizeObserver(function () { if (Math.abs(block.clientWidth - lw) > 1) { lw = block.clientWidth; build(); ts.forEach(function (s) { s.mark.to(s.tier, 'instant'); }); } }).observe(block); }
    return { el: host, sync: sync, tabs: tabs };
  }

  window.Tabs = { create: create };
})();
