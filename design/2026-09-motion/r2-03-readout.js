/* r2-03-readout.js — the combined filter stated in words, one line (two on a phone):
     游记 travel log · 2015–2019 · 11 essays · 11 篇              clear · 清除
   Values that still say "everything" sit in the soft ink; narrowed ones in full ink. When one
   dimension had to give way to the other, its old value stays on the line with a pencil strike
   through it until the next change — a person correcting their note, so the cause stays visible.
   aria-live="polite" announces the same sentence. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function esc(s) { return Shelf.esc(s); }
  function val(v) { return (v.zh ? '<span class="zh" lang="zh">' + esc(v.zh) + '</span> ' : '') + '<span lang="en">' + esc(v.en) + '</span>'; }

  function create(host, opt) {
    host.innerHTML = '<p class="ro" aria-live="polite">' +
      '<span class="ro-v ro-cat"><span class="ro-was"></span><span class="ro-t"></span></span><span class="ro-sep" aria-hidden="true">·</span>' +
      '<span class="ro-v ro-yr"><span class="ro-was"></span><span class="ro-t"></span></span><span class="ro-sep ro-sep2" aria-hidden="true">·</span>' +
      '<span class="ro-n"></span>' +
      '<button type="button" class="ro-clear" aria-label="Clear both filters · 清除全部筛选"><span>clear · 清除</span></button></p>';
    var line = host.firstChild, cat = line.querySelector('.ro-cat'), yr = line.querySelector('.ro-yr');
    var n = line.querySelector('.ro-n'), clear = line.querySelector('.ro-clear');
    var clearMark = Pen.annotate(clear.firstChild, 'underline', { color: 'var(--pencil)', width: 1.4, gap: 1, seed: 'ro-clear' });
    clear.addEventListener('click', function () { Tally.unmark(clearMark); opt.onClear(); });

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
      setWas(cat, s.was && s.was.which === 'cat' ? s.was.text : null);   // a new action retires the last correction
      setWas(yr, s.was && s.was.which === 'years' ? s.was.text : null);
      line.classList.toggle('narrowed', s.narrowed);
      clear.tabIndex = s.narrowed ? 0 : -1; clear.setAttribute('aria-hidden', String(!s.narrowed));
      line.setAttribute('aria-busy', String(!!s.live));
    }
    return { render: render, el: line };
  }

  window.Readout = { create: create };
})();
