/* r3-03-readout.js — the combined filter stated in words, at the head of the index. Same interface and the
   same behaviour as r2-03-readout.js (Readout.create(host, { onClear }) → { render(s), el }); it is laid out for
   a column instead of a full-width line (the count is the kicker, the sentence the heading):
       11 essays · 11 篇                                   clear · 清除
       游记 travel log · 2015–2019
   Values that still mean "everything" sit in soft ink, narrowed ones in full ink. When one dimension gave way
   to the other, its old value stays on the line with a pencil strike until the next change. The clear button
   uses board 02's pen (hover underline, keyboard 「 」). aria-live="polite" announces the sentence. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function esc(s) { return window.ShelfKit.esc(s); }
  function val(v) { return (v.zh ? '<span class="zh" lang="zh">' + esc(v.zh) + '</span> ' : '') + '<span lang="en">' + esc(v.en) + '</span>'; }

  function create(host, opt) {
    host.innerHTML = '<div class="ro" aria-live="polite">' +
      '<p class="ro-foot"><span class="ro-n"></span><button type="button" class="ro-clear" aria-label="Clear both filters · 清除全部筛选"><span>clear · 清除</span></button></p>' +
      '<p class="ro-line"><span class="ro-v ro-cat"><span class="ro-was"></span><span class="ro-t"></span></span><span class="ro-sep" aria-hidden="true">·</span>' +
      '<span class="ro-v ro-yr"><span class="ro-was"></span><span class="ro-t"></span></span></p></div>';
    var box = host.firstChild, line = box.querySelector('.ro-line'), cat = box.querySelector('.ro-cat'), yr = box.querySelector('.ro-yr');
    var n = box.querySelector('.ro-n'), clear = box.querySelector('.ro-clear');
    var mark = new TierMark(clear, clear.firstChild, { tick: false, gap: 1, over: 2, seed: 'ro-clear' }), foc = new FocusMark(clear, clear.firstChild, { gap: 5, gy: 3 });
    clear.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') mark.to(1, 'hover'); });
    clear.addEventListener('pointerleave', function () { mark.to(0, 'hover'); });
    clear.addEventListener('focus', function () { if (clear.matches(':focus-visible')) foc.set(true); });
    clear.addEventListener('blur', function () { foc.set(false); });
    clear.addEventListener('click', function () { mark.to(0, 'instant'); opt.onClear(); });

    function setWas(slot, v) {
      var w = slot.querySelector('.ro-was');
      if (!v) { w.innerHTML = ''; w.hidden = true; return; }
      w.hidden = false; w.innerHTML = '<span class="ro-was-t">' + val(v) + '</span>';
      var t = w.firstChild, svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'ro-strike'); w.appendChild(svg);
      var p = Pen.path(Pen.strike(t.offsetWidth, 'ro-was' + v.en), { color: 'var(--soft)', width: 1.7 });
      p.setAttribute('transform', 'translate(0 ' + (t.offsetHeight * .56).toFixed(1) + ')');
      svg.appendChild(p); Pen.draw(p, { duration: 240, delay: 120 });
    }
    // s: { cat:{zh,en,all}, years:{zh,en,all}, n, noun, narrowed, was:{which,text}|null, live }
    function render(s) {
      cat.querySelector('.ro-t').innerHTML = val(s.cat); cat.classList.toggle('is-all', !!s.cat.all);
      yr.querySelector('.ro-t').innerHTML = val(s.years); yr.classList.toggle('is-all', !!s.years.all);
      n.textContent = s.n + ' ' + (s.n === 1 ? s.noun.one : s.noun.many) + ' · ' + s.n + ' ' + s.noun.zh;
      setWas(cat, s.was && s.was.which === 'cat' ? s.was.text : null);
      setWas(yr, s.was && s.was.which === 'years' ? s.was.text : null);
      box.classList.toggle('narrowed', s.narrowed);
      clear.tabIndex = s.narrowed ? 0 : -1; clear.setAttribute('aria-hidden', String(!s.narrowed));
      box.setAttribute('aria-busy', String(!!s.live));
    }
    return { render: render, el: box };
  }

  window.Readout = { create: create };
})();
