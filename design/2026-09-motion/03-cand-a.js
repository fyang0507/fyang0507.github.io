/* 03-cand-a.js — A · Sentence filter / 一句话筛选.
   Two chip rows and a "Showing 27 / 27" line collapse into the sentence that line was trying to be.
   The words that can change carry a pen underline; pressing one drops a paper slip listing the
   alternatives (listbox: arrows move, Enter picks, Esc closes). */
(function () {
  var S = Shelf, FX = window.FX = window.FX || {};
  var NOUN = { 'travel log': ['travel log', 'travel logs'], 'stories we live': ['story we live', 'stories we live'],
    'everyday chronicles': ['everyday chronicle', 'everyday chronicles'], 'commentary': ['commentary', 'commentaries'], 'poem': ['poem', 'poems'] };
  var YEAR_OPTS = [{ id: 'all', en: 'every year', zh: '所有年份' }]
    .concat(S.YEARS.filter(function (y) { return y >= '2020'; }).map(function (y) { return { id: y, en: y, zh: y + ' 年' }; }))
    .concat([{ id: 'before-2020', en: 'before 2020', zh: '2020 年以前' }]);
  function yearOk(yid, y) { return yid === 'all' || (yid === 'before-2020' ? y < '2020' : y === yid); }
  var uid = 0;

  FX.a = function (wx, ctx) {
    var st = { cat: 'all', year: 'all' }, n = ++uid;
    var shelf = S.create(ctx.shelfHost, { ticks: 'span' });
    ctx.filter.innerHTML =
      '<div class="sf" role="group" aria-label="Filter essays · 筛选文章">' +
      '<p class="sf-line sf-en" lang="en">Showing <button type="button" class="sf-tok" data-pick="cat"></button> from <button type="button" class="sf-tok" data-pick="year"></button></p>' +
      '<span class="sf-sep" aria-hidden="true">/</span>' +
      '<p class="sf-line sf-zh" lang="zh">显示<button type="button" class="sf-tok" data-pick="cat"></button>，<button type="button" class="sf-tok" data-pick="year"></button></p>' +
      '<div class="slip" role="listbox" id="slip-a' + n + '" tabindex="-1" hidden></div></div>';
    var sf = ctx.filter.querySelector('.sf'), slip = sf.querySelector('.slip');
    var toks = Array.prototype.slice.call(sf.querySelectorAll('.sf-tok'));

    function count(cat, year) { return S.POSTS.filter(function (p) { return S.inCat(p, cat) && yearOk(year, p.year); }).length; }
    function tokText(tok) {
      var zh = tok.closest('.sf-zh'), c = count(st.cat, st.year);
      if (tok.dataset.pick === 'cat') {
        if (st.cat === 'all') return zh ? '全部 ' + c + ' 篇' : 'all ' + c + ' essays';
        return zh ? S.TAG_ZH[st.cat] + ' ' + c + ' 篇' : c + ' ' + NOUN[st.cat][c === 1 ? 0 : 1];
      }
      var o = YEAR_OPTS.find(function (y) { return y.id === st.year; });
      return zh ? o.zh : o.en;
    }

    // Each token owns one seeded underline. Pencil at rest, coral once the sentence says something
    // other than "everything", ink while the hand hovers it.
    toks.forEach(function (tok) {
      tok.setAttribute('aria-haspopup', 'listbox'); tok.setAttribute('aria-expanded', 'false'); tok.setAttribute('aria-controls', slip.id);
      tok.innerHTML = '<span class="sf-txt"></span><svg class="sf-ul" aria-hidden="true"></svg>';
      tok.addEventListener('pointerenter', function () { ink(tok, true); });
      tok.addEventListener('pointerleave', function () { ink(tok, false); });
      tok.addEventListener('focus', function () { ink(tok, true); });
      tok.addEventListener('blur', function () { ink(tok, false); });
      tok.addEventListener('click', function () { if (openTok === tok) close(true); else open(tok); });
      tok.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(tok); } });
    });
    function restColor(tok) { return (tok.dataset.pick === 'cat' ? st.cat : st.year) === 'all' ? 'var(--pencil)' : 'var(--mark)'; }
    function mark(tok, animate) {
      var txt = tok.querySelector('.sf-txt'), svg = tok.querySelector('.sf-ul'), label = tokText(tok);
      txt.textContent = label;
      tok.setAttribute('aria-label', (tok.dataset.pick === 'cat' ? 'Which essays · 哪些文章: ' : 'Which years · 哪些年份: ') + label);
      var w = txt.offsetWidth, h = txt.offsetHeight;
      svg.innerHTML = ''; var p = Pen.path(Pen.underline(w, 'a-' + tok.dataset.pick + label, { y: h + 1 }), { color: restColor(tok), width: 1.7 });
      svg.appendChild(p);
      if (animate) Pen.draw(p, { duration: 280 }); else { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 2); p.style.strokeDashoffset = 0; }
    }
    function ink(tok, on) {
      var p = tok.querySelector('.sf-ul path'); if (!p) return;
      p.setAttribute('stroke', on ? 'var(--ink)' : restColor(tok));
      if (on) Pen.draw(p, { duration: 240 });
    }

    // ---- the paper slip ----
    var openTok = null, opts = [], active = -1, outside;
    function options(pick) {
      if (pick === 'cat') return S.CATS.map(function (c) {
        return { id: c.id, en: c.id === 'all' ? 'all essays' : c.en, zh: c.zh, n: count(c.id, st.year) };
      });
      return YEAR_OPTS.map(function (y) { return { id: y.id, en: y.en, zh: y.id.length === 4 ? '' : y.zh, n: count(st.cat, y.id) }; });
    }
    function open(tok) {
      if (openTok) close(false);
      openTok = tok; var pick = tok.dataset.pick, cur = st[pick];
      opts = options(pick);
      slip.setAttribute('aria-label', pick === 'cat' ? 'Category · 类别' : 'Year · 年份');
      slip.innerHTML = opts.map(function (o, i) {
        return '<div class="slip-opt' + (o.n ? '' : ' is-off') + '" role="option" id="' + slip.id + '-' + i + '" data-i="' + i + '" aria-selected="' + (o.id === cur) + '"' +
          (o.n ? '' : ' aria-disabled="true"') + '><svg class="so-tick" aria-hidden="true"></svg><span class="so-en">' + S.esc(o.en) + '</span>' +
          (o.zh ? '<span class="so-zh" lang="zh">' + o.zh + '</span>' : '') + '<span class="so-n">' + o.n + '</span><svg class="so-ul" aria-hidden="true"></svg></div>';
      }).join('');
      slip.hidden = false; slip.dataset.pick = pick;
      var left = tok.offsetLeft - 14, max = sf.clientWidth - slip.offsetWidth;
      slip.style.left = Math.max(0, Math.min(left, max)) + 'px';
      slip.style.top = (tok.offsetTop + tok.offsetHeight + 10) + 'px';
      var rot = pick === 'cat' ? -0.8 : 0.7;
      slip.style.transform = 'rotate(' + rot + 'deg)';
      if (!Pen.reduced()) slip.animate([
        { opacity: 0, transform: 'translateY(-12px) rotate(' + (rot - 3) + 'deg) scaleY(.9)' },
        { opacity: 1, transform: 'translateY(0) rotate(' + rot + 'deg) scaleY(1)' }
      ], { duration: 380, easing: 'cubic-bezier(.34,1.36,.5,1)' });
      tok.setAttribute('aria-expanded', 'true');
      var sel = opts.findIndex(function (o) { return o.id === cur; });
      var tick = slip.querySelector('[data-i="' + sel + '"] .so-tick');
      if (tick) { var tp = Pen.path(Pen.tick(12, 'a-tick' + pick + cur), { width: 2 }); tick.appendChild(tp); Pen.draw(tp, { delay: 140, duration: 220 }); }
      setActive(sel, true);
      slip.focus({ preventScroll: true });
      outside = function (e) { if (!sf.contains(e.target)) close(false); };
      document.addEventListener('pointerdown', outside, true);
    }
    function close(refocus) {
      if (!openTok) return;
      var tok = openTok; openTok = null; active = -1;
      tok.setAttribute('aria-expanded', 'false');
      document.removeEventListener('pointerdown', outside, true);
      slip.removeAttribute('aria-activedescendant');
      if (Pen.reduced()) slip.hidden = true;
      else {
        var r = slip.style.transform;
        slip.animate([{ opacity: 1, transform: r }, { opacity: 0, transform: 'translateY(-6px) ' + r }], { duration: 130, easing: 'cubic-bezier(.4,0,.8,.4)' })
          .onfinish = function () { if (!openTok) slip.hidden = true; };
      }
      if (refocus) tok.focus({ preventScroll: true });
    }
    function setActive(i, quiet) {
      var prev = slip.querySelector('.slip-opt.is-active');
      if (prev) { prev.classList.remove('is-active'); var pp = prev.querySelector('.so-ul path'); if (pp) Pen.erase(pp, { duration: 120 }); }
      active = i; var el = slip.querySelector('[data-i="' + i + '"]'); if (!el) return;
      el.classList.add('is-active'); slip.setAttribute('aria-activedescendant', el.id);
      var en = el.querySelector('.so-en'), svg = el.querySelector('.so-ul');
      svg.style.left = en.offsetLeft + 'px'; svg.style.top = en.offsetTop + 'px';
      svg.innerHTML = ''; var p = Pen.path(Pen.underline(en.offsetWidth, 'a-opt' + el.textContent, { y: en.offsetHeight + 1 }), { color: 'var(--ink)', width: 1.6 });
      svg.appendChild(p); Pen.draw(p, { duration: quiet ? 1 : 200 });
    }
    function move(d) {
      var i = active;
      for (var k = 0; k < opts.length; k++) { i = (i + d + opts.length) % opts.length; if (opts[i].n) break; }
      setActive(i);
    }
    function choose(i) {
      var o = opts[i]; if (!o || !o.n || !openTok) return;
      var pick = openTok.dataset.pick; st[pick] = o.id;
      close(true); update(pick);
    }
    slip.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowDown') move(1); else if (k === 'ArrowUp') move(-1);
      else if (k === 'Home') { active = -1; move(1); } else if (k === 'End') { active = opts.length; move(-1); }
      else if (k === 'Enter' || k === ' ') choose(active);
      else if (k === 'Escape') close(true);
      else if (k === 'Tab') { close(false); return; }
      else return;
      e.preventDefault();
    });
    slip.addEventListener('pointermove', function (e) { var o = e.target.closest('.slip-opt'); if (o && !o.classList.contains('is-off') && +o.dataset.i !== active) setActive(+o.dataset.i); });
    slip.addEventListener('click', function (e) { var o = e.target.closest('.slip-opt'); if (o) choose(+o.dataset.i); });

    function update(changed) {
      shelf.apply(function (p) { return S.inCat(p, st.cat) && yearOk(st.year, p.year); });
      toks.forEach(function (t) { mark(t, t.dataset.pick === changed || (changed && t.dataset.pick === 'cat')); });
    }
    toks.forEach(function (t) { mark(t, false); });
    if (document.fonts) document.fonts.ready.then(function () { toks.forEach(function (t) { mark(t, false); }); });

    function demo() {
      return FX.run([
        [300, function () { open(toks[0]); }], [420, function () { move(1); }],
        [520, function () { choose(active); }], [1300, function () { open(toks[1]); }],
        [380, function () { move(-1); }], [520, function () { choose(active); }],
        [1500, function () { open(toks[0]); }], [380, function () { move(1); }], [300, function () { move(1); }],
        [480, function () { choose(active); }], [1500, function () { st.cat = 'all'; st.year = 'all'; close(false); update('cat'); }]
      ]);
    }
    return { demo: demo, shelf: shelf, set: function (c, y) { st.cat = c; st.year = y; update('cat'); } };
  };
})();
