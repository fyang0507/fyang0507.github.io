/* 08-reading-a.js — A · Pencil margin / 铅笔页边.
   A graphite line in the left margin draws as you read (scroll → stroke-dashoffset); each section is a tick.
   The current section's label gets the coral pen loop (the page's one accent). Mobile: pencil hairline + counter. */
(function () {
  var ctx = RD.mount(document.getElementById('stage-a'), 'a');
  RD.solidNav(ctx);
  RD.hint(ctx, 'scroll the essay ↓ 往下读');
  var stage = ctx.stage, rd = ctx.rd, NS = 'http://www.w3.org/2000/svg';
  var LINE_X = 70, RAIL_W = 92;

  // ---- desktop rail (overlay on the stage, the mock's stand-in for position:fixed) ----
  var rail = document.createElement('nav');
  rail.className = 'a-rail';
  rail.setAttribute('aria-label', 'Sections · 章节');
  rail.innerHTML = '<svg class="a-svg" aria-hidden="true"><path class="a-guide"/><path class="a-ink"/><g class="a-ticks"></g><path class="a-end"/></svg>' +
    '<ol class="a-list"></ol>' +
    '<div class="a-peek" aria-hidden="true"><span class="a-peek-no"></span><span class="a-peek-t"></span></div>';
  stage.appendChild(rail);
  var svg = rail.querySelector('svg'), guide = svg.querySelector('.a-guide'), ink = svg.querySelector('.a-ink');
  var tickG = svg.querySelector('.a-ticks'), endMark = svg.querySelector('.a-end');
  var list = rail.querySelector('.a-list'), peek = rail.querySelector('.a-peek');

  // ---- mobile: pencil hairline along the nav's bottom edge + "3.0 / 10" counter in the nav ----
  var hair = document.createElementNS(NS, 'svg');
  hair.setAttribute('class', 'a-hair'); hair.setAttribute('aria-hidden', 'true');
  hair.innerHTML = '<path class="a-hair-ink"/>';
  stage.appendChild(hair);
  var hairInk = hair.querySelector('path');
  var count = document.createElement('span');
  count.className = 'a-count';
  count.setAttribute('aria-live', 'polite');
  count.innerHTML = '<span class="a-count-no"></span><span class="a-count-of"></span>';
  var countNo = count.firstChild, countOf = count.lastChild;
  rd.querySelector('.rnav-mid').appendChild(count);

  var S = { secs: [], top: 0, end: 1, H: 0, L: 0, hairL: 0, cur: -2, shown: false, drawn: false, mode: '', done: false };
  var loopApi = null, countLoop = null;

  function firstLine(sec) {
    var p = sec.querySelector('p').cloneNode(true);
    p.querySelectorAll('.mn,.fnref').forEach(function (n) { n.remove(); });
    var t = '';
    for (var n = p.firstChild; n; n = n.nextSibling) { if (n.nodeName === 'BR') { if (t.trim()) break; continue; } t += n.textContent; }
    t = t.trim();
    return t.length > 64 ? t.slice(0, 62) + '…' : t;
  }
  function wobbleLine(len, seed, vertical) {
    var r = Pen.rng(seed), pts = [], step = 46, n = Math.max(2, Math.round(len / step));
    for (var i = 0; i <= n; i++) {
      var t = i / n, off = (r() - .5) * 1.8 + Math.sin(t * 7 + r()) * .5;
      pts.push(vertical ? [LINE_X + off, t * len] : [t * len, 1.5 + off * .6]);
    }
    return Pen.smooth(pts);
  }

  function layout() {
    var body = ctx.body(), secs = ctx.sections();
    var app = body.querySelector('.appendix');
    var art = rd.querySelector('article').getBoundingClientRect(), st = stage.getBoundingClientRect();
    var margin = art.left - st.left;
    S.mode = margin > 170 ? 'rail' : 'strip';
    stage.classList.toggle('a-mode-rail', S.mode === 'rail');
    stage.classList.toggle('a-mode-strip', S.mode === 'strip');
    S.top = ctx.top(secs[0]);
    S.end = app ? ctx.top(app) - 40 : ctx.top(body) + body.offsetHeight;
    var navH = ctx.navH();
    S.secs = secs.map(function (s) { return { el: s, no: s.dataset.no, y: ctx.top(s), line: firstLine(s) }; });

    // rail geometry
    var railTop = navH + 34, H = Math.max(200, rd.clientHeight - railTop - 44);
    S.H = H;
    rail.style.cssText = 'left:' + Math.round(margin - 64 - LINE_X) + 'px;top:' + railTop + 'px;width:' + RAIL_W + 'px;height:' + H + 'px';
    svg.setAttribute('width', RAIL_W); svg.setAttribute('height', H + 20);
    var d = wobbleLine(H, 'a-rail-' + ctx.lang(), true);
    guide.setAttribute('d', d); ink.setAttribute('d', d);
    S.L = ink.getTotalLength();
    ink.style.strokeDasharray = S.L + ' ' + (S.L + 4);
    endMark.setAttribute('d', 'M' + (LINE_X - 6) + ' ' + (H + 2) + ' q 4 5 7 5 q 3 -4 9 -12');
    var eL = endMark.getTotalLength(); endMark.style.strokeDasharray = eL; endMark.style.strokeDashoffset = S.done ? 0 : eL;

    tickG.innerHTML = ''; list.innerHTML = '';
    S.secs.forEach(function (s, i) {
      s.ry = Math.round((s.y - S.top) / (S.end - S.top) * H);
      var r = Pen.rng('a-tick-' + s.no);
      var t = Pen.path(Pen.smooth([[LINE_X - 6, s.ry + (r() - .5)], [LINE_X, s.ry + (r() - .5) * .8], [LINE_X + 7, s.ry - .6 - r()]]), { color: 'currentColor', width: 1.5 });
      t.setAttribute('class', 'a-tick'); tickG.appendChild(t); s.tick = t;
      var li = document.createElement('li');
      li.innerHTML = '<a class="a-lab" href="#' + s.el.id + '" style="top:' + (s.ry - 12) + 'px" aria-label="Section ' + s.no + ' · 第 ' + s.no + ' 节: ' + s.line.replace(/"/g, '') + '"><span class="a-lab-t">' + s.no + '</span></a>';
      list.appendChild(li); s.lab = li.firstChild;
    });
    // one small pen loop, re-seeded per label so each section always gets the same circle
    S.cur = -2; loopApi = null;

    // mobile strip geometry: along the nav's bottom edge
    var w = rd.clientWidth;
    hair.setAttribute('width', w); hair.setAttribute('height', 6);
    hair.style.top = (navH - 3) + 'px';
    hairInk.setAttribute('d', wobbleLine(w, 'a-hair', false));
    S.hairL = hairInk.getTotalLength();
    hairInk.style.strokeDasharray = S.hairL + ' ' + (S.hairL + 4);
    countOf.textContent = ' / ' + S.secs.length;
    if (!S.drawn) rail.classList.remove('drawn');
  }

  function readingLine(y) { return y + ctx.navH() + (rd.clientHeight - ctx.navH()) * .3; }

  function update(y) {
    if (!S.secs.length) return;
    var line = readingLine(y), rm = Pen.reduced();
    var cur = -1;
    for (var i = 0; i < S.secs.length; i++) if (S.secs[i].y <= line) cur = i;
    // ink is interpolated inside the current section, so it can never pass the next tick while the loop
    // is still on this one; reduced motion steps it to the next tick instead of following every pixel
    var drawP = 0;
    if (cur >= 0) {
      var a = S.secs[cur], nxt = S.secs[cur + 1], y1 = nxt ? nxt.y : S.end, r1 = nxt ? nxt.ry : S.H;
      var k = rm ? 1 : Math.max(0, Math.min(1, (line - a.y) / (y1 - a.y)));
      drawP = (a.ry + (r1 - a.ry) * k) / S.H;
    }
    ink.style.strokeDashoffset = (S.L * (1 - drawP)).toFixed(1);
    hairInk.style.strokeDashoffset = (S.hairL * (1 - drawP)).toFixed(1);

    // show the rail once reading reaches the body; its first appearance is drawn in one pass
    var show = line > S.top - 160;
    if (show !== S.shown) {
      S.shown = show;
      stage.classList.toggle('a-reading', show);
      if (show && !S.drawn) { S.drawn = true; drawIn(); }
    }
    S.secs.forEach(function (s, i) { s.lab.classList.toggle('read', i < cur); s.tick.classList.toggle('read', s.ry <= drawP * S.H + .5); });
    if (cur !== S.cur) setCurrent(cur);
    var done = line >= S.end;
    if (done !== S.done) { S.done = done; done ? Pen.draw(endMark, { duration: 260 }) : Pen.erase(endMark, { duration: 140 }); }
  }

  function drawIn() {
    rail.classList.add('drawn');
    if (Pen.reduced()) return;
    var L = guide.getTotalLength();
    guide.style.strokeDasharray = L + ' ' + (L + 4);
    guide.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], { duration: 620, easing: 'cubic-bezier(.55,.1,.25,1)' });
    S.secs.forEach(function (s, i) {
      Pen.draw(s.tick, { duration: 120, delay: 80 + (s.ry / S.H) * 520 });
      s.lab.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: 80 + (s.ry / S.H) * 520, fill: 'backwards', easing: 'steps(1,end)' });
    });
  }

  function setCurrent(i) {
    var prev = S.cur; S.cur = i;
    if (prev >= 0 && S.secs[prev]) S.secs[prev].lab.classList.remove('cur');
    if (loopApi) { var old = loopApi; old.hide(); setTimeout(function () { old.svg.remove(); }, 260); loopApi = null; }
    if (countLoop) { var oc = countLoop; oc.hide(); setTimeout(function () { oc.svg.remove(); }, 260); countLoop = null; }
    if (i < 0) { count.classList.remove('on'); return; }
    var s = S.secs[i];
    s.lab.classList.add('cur');
    s.lab.setAttribute('aria-current', 'location');
    if (prev >= 0 && S.secs[prev] && prev !== i) S.secs[prev].lab.removeAttribute('aria-current');
    countNo.textContent = s.no;
    count.classList.add('on');
    var span = s.lab.querySelector('.a-lab-t');
    if (S.mode === 'rail') {
      loopApi = Pen.annotate(span, 'loop', { manual: true, seed: 'a-loop-' + s.no, pad: 5, width: 1.7, duration: 360 });
      loopApi.show();
    } else {
      countLoop = Pen.annotate(countNo, 'loop', { manual: true, seed: 'a-count-' + s.no, pad: 4, width: 1.6, duration: 320 });
      countLoop.show();
    }
  }

  // ---- peek: a paper slip with the section's first line (physics clock: small overshoot, then settle) ----
  function showPeek(a) {
    var s = S.secs.find(function (x) { return x.lab === a; }); if (!s) return;
    peek.querySelector('.a-peek-no').textContent = s.no;
    peek.querySelector('.a-peek-t').textContent = s.line;
    peek.style.top = (s.ry - 22) + 'px';
    peek.classList.add('on');
  }
  function hidePeek() { peek.classList.remove('on'); }
  list.addEventListener('pointerover', function (e) { var a = e.target.closest('.a-lab'); if (a) showPeek(a); });
  list.addEventListener('pointerout', function (e) { if (!e.relatedTarget || !list.contains(e.relatedTarget)) hidePeek(); });
  list.addEventListener('focusin', function (e) { showPeek(e.target); });
  list.addEventListener('focusout', hidePeek);
  list.addEventListener('click', function (e) {
    var a = e.target.closest('.a-lab'); if (!a) return;
    e.preventDefault();
    var s = S.secs.find(function (x) { return x.lab === a; });
    ctx.scrollTo(s.y - ctx.navH() - 18);
  });
  list.addEventListener('keydown', function (e) {
    var labs = Array.prototype.slice.call(list.querySelectorAll('.a-lab')), i = labs.indexOf(document.activeElement);
    if (i < 0) return;
    var j = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? labs.length - 1 : -9;
    if (j === -9) return;
    e.preventDefault(); labs[Math.max(0, Math.min(labs.length - 1, j))].focus();
  });

  ctx.onLayout(layout);
  ctx.onScroll(update);
  ctx.layout();
  window.replayA = function () { ctx.scrollTo(0); };
  window.__A = { ctx: ctx, S: S };
})();
