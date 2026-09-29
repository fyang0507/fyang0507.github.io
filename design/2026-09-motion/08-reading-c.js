/* 08-reading-c.js — C · Marker / 荧光笔.
   Selecting text lays a flat marker band behind those lines (Selection → Range.getClientRects → SVG layer
   at z-index:-1 inside the body, so the wash is always under the ink). Ends are hand-cut, seeded per mark.
   A small tag offers 引用 quote (with a text-fragment deep link) / 复制 copy; marks persist per post + language. */
(function () {
  var ctx = RD.mount(document.getElementById('stage-c'), 'c');
  RD.solidNav(ctx);
  RD.progressBar(ctx);
  RD.hint(ctx, 'select a sentence ✎ 划一句');
  var stage = ctx.stage, rd = ctx.rd, NS = 'http://www.w3.org/2000/svg';
  rd.classList.add('c-mark');
  var SAMPLE = { zh: '云基础和AI训练其实是有自残性的', en: 'Cloud infrastructure and AI training are actually self-cannibalizing' };

  rd.querySelectorAll('.post-body').forEach(function (b) {
    var layer = document.createElementNS(NS, 'svg');
    layer.setAttribute('class', 'c-layer'); layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = '<g class="c-kept"></g><g class="c-pending"></g>';
    b.insertBefore(layer, b.firstChild);
    var tools = document.createElement('div');
    tools.className = 'c-tools'; tools.setAttribute('role', 'toolbar'); tools.setAttribute('aria-label', 'Marked passage · 划线');
    tools.innerHTML = '<button type="button" data-do="quote">引用 quote</button><button type="button" data-do="copy">复制 copy</button><button type="button" data-do="erase">擦掉 erase</button><span class="c-said" aria-live="polite"></span>';
    b.appendChild(tools);
    tools.querySelectorAll('button').forEach(function (btn) { Pen.annotate(btn, 'underline', { seed: 'c-' + btn.dataset.do, gap: -10, width: 1.5 }); });
  });

  // ---- text offsets that ignore the margin notes and our own layers, so marks survive relayout ----
  function nodes(body) {
    var out = [], w = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      return n.parentNode.closest('.mn,.c-layer,.c-tools') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  }
  function toOffset(body, container, offset) {
    var list = nodes(body), total = 0, probe = document.createRange();
    probe.setStart(container, offset); probe.collapse(true);
    for (var i = 0; i < list.length; i++) {
      var t = list[i];
      if (t === container) return total + offset;
      if (probe.comparePoint(t, t.length) <= 0) total += t.length; else break;
    }
    return total;
  }
  function rangeOf(body, s, e) {
    var list = nodes(body), total = 0, r = document.createRange(), started = false;
    for (var i = 0; i < list.length; i++) {
      var t = list[i], L = t.length;
      if (!started && total + L >= s) { r.setStart(t, s - total); started = true; }
      if (started && total + L >= e) { r.setEnd(t, e - total); return r; }
      total += L;
    }
    return null;
  }
  function textOf(body, s, e) { return nodes(body).map(function (t) { return t.textContent; }).join('').slice(s, e); }

  // ---- one band per line: flat wash, lower two-thirds of the glyphs, scissor-cut ends ----
  function bands(body, s, e, seed) {
    var r = rangeOf(body, s, e); if (!r) return [];
    var B = body.getBoundingClientRect(), W = body.clientWidth, lines = [];
    Array.prototype.forEach.call(r.getClientRects(), function (q) {
      if (q.width < 2 || q.right < B.left + 2 || q.left > B.left + W - 2) return;
      var cy = q.top + q.height / 2, g = lines.find(function (l) { return Math.abs(l.cy - cy) < 9; });
      if (!g) lines.push(g = { cy: cy, l: q.left, r: q.right, t: q.top, b: q.bottom, h: q.height });
      g.l = Math.min(g.l, q.left); g.r = Math.max(g.r, q.right);
      if (q.height > g.h) { g.t = q.top; g.b = q.bottom; g.h = q.height; g.cy = cy; }
    });
    lines.sort(function (a, b) { return a.t - b.t; });
    return lines.map(function (g, i) {
      var rnd = Pen.rng(seed + ':' + i), x0 = g.l - B.left - 2, x1 = Math.min(W + 2, g.r - B.left + 2);
      var y0 = g.t - B.top + g.h * .34, y1 = g.b - B.top - g.h * .1, h = y1 - y0, j = function (a) { return (rnd() - .5) * a; };
      var d = 'M' + (x0 + 1.5 + j(2)) + ' ' + (y0 + j(1.2)) +
        ' L' + ((x0 + x1) / 2) + ' ' + (y0 - .4 + j(.8)) + ' L' + (x1 - 1 + j(2)) + ' ' + (y0 + .3 + j(1)) +
        ' L' + (x1 + 1.5 + j(1.5)) + ' ' + (y0 + h * .38) + ' L' + (x1 - .5 + j(1.5)) + ' ' + (y0 + h * .66) + ' L' + (x1 + 1 + j(2)) + ' ' + (y1 + j(1)) +
        ' L' + ((x0 + x1) / 2) + ' ' + (y1 + .5 + j(.8)) + ' L' + (x0 + j(2)) + ' ' + (y1 + j(1)) +
        ' L' + (x0 - 1.5 + j(1.5)) + ' ' + (y0 + h * .62) + ' L' + (x0 + 1 + j(1.5)) + ' ' + (y0 + h * .3) + ' Z';
      return { d: d, x1: x1, y0: y0, y1: y1, x0: x0 };
    });
  }

  // ---- storage ----
  function key() { return 'fy-marks:' + ctx.post.id + ':' + ctx.lang(); }
  var marks = {};
  function load(lang) {
    if (marks[lang]) return marks[lang];
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem('fy-marks:' + ctx.post.id + ':' + lang) || 'null'); } catch (e) { raw = null; }
    if (!raw) {                                  // first visit: one sample mark so the idea is visible
      var body = rd.querySelector('.post-body.' + lang), all = nodes(body).map(function (t) { return t.textContent; }).join('');
      var at = all.indexOf(SAMPLE[lang]);
      raw = at >= 0 ? [{ s: at, e: at + SAMPLE[lang].length }] : [];
    }
    return (marks[lang] = raw);
  }
  function save() { try { localStorage.setItem(key(), JSON.stringify(marks[ctx.lang()])); } catch (e) {} }
  function add(s, e) {
    var list = load(ctx.lang()).concat([{ s: s, e: e }]).sort(function (a, b) { return a.s - b.s; }), out = [];
    list.forEach(function (m) { var last = out[out.length - 1]; if (last && m.s <= last.e) last.e = Math.max(last.e, m.e); else out.push({ s: m.s, e: m.e }); });
    marks[ctx.lang()] = out; save();
    return out.find(function (m) { return m.s <= s && m.e >= e; });
  }

  function paint(g, list, cls) {
    var body = ctx.body(), html = '';
    list.forEach(function (m) { bands(body, m.s, m.e, 'c' + m.s).forEach(function (b) { html += '<path class="c-band ' + cls + '" d="' + b.d + '"/>'; }); });
    g.innerHTML = html;
  }
  function render() { var body = ctx.body(); paint(body.querySelector('.c-kept'), load(ctx.lang()), ''); body.querySelector('.c-pending').innerHTML = ''; hideTools(); }

  // ---- live selection → pending band; release → kept ----
  var pending = null, down = false, commitT = 0, lastKey = false;
  function current() {
    var sel = getSelection(), body = ctx.body();
    if (!sel.rangeCount || sel.isCollapsed) return null;
    var r = sel.getRangeAt(0);
    if (!body.contains(r.commonAncestorContainer)) return null;
    var s = toOffset(body, r.startContainer, r.startOffset), e = toOffset(body, r.endContainer, r.endOffset);
    return e - s > 0 && textOf(body, s, e).trim() ? { s: s, e: e } : null;
  }
  document.addEventListener('selectionchange', function () {
    var c = current();
    var g = ctx.body().querySelector('.c-pending');
    if (!c) { if (pending) { g.innerHTML = ''; pending = null; } return; }
    pending = c; paint(g, [c], 'pending'); hideTools();
    clearTimeout(commitT);
    if (!down) commitT = setTimeout(commit, 650);   // touch handles never send pointerup to the page
  });
  rd.addEventListener('pointerdown', function (e) { if (!e.target.closest('.c-tools')) down = true; lastKey = false; });
  document.addEventListener('pointerup', function (e) {
    if (!down) return; down = false;
    if (pending) { clearTimeout(commitT); commit(); return; }
    if (e.target.closest && e.target.closest('.c-tools')) return;
    var body = ctx.body(); if (!body.contains(e.target)) { hideTools(); return; }
    var cr = document.caretRangeFromPoint && document.caretRangeFromPoint(e.clientX, e.clientY);
    if (!cr || !body.contains(cr.startContainer)) { hideTools(); return; }
    var o = toOffset(body, cr.startContainer, cr.startOffset);
    var hit = load(ctx.lang()).find(function (m) { return o >= m.s && o <= m.e; });
    hit ? showTools(hit, true) : hideTools();
  });
  rd.addEventListener('keyup', function (e) { if (e.shiftKey || e.key === 'Shift') { lastKey = true; if (pending) { clearTimeout(commitT); commitT = setTimeout(commit, 250); } } });
  function commit() {
    if (!pending) return;
    var m = add(pending.s, pending.e); pending = null;
    render(); showTools(m, false, lastKey);
  }

  // ---- the tag ----
  var active = null;
  function showTools(m, existing, focus) {
    var body = ctx.body(), tools = body.querySelector('.c-tools'), bs = bands(body, m.s, m.e, 'c' + m.s);
    if (!bs.length) return;
    active = m;
    tools.classList.toggle('existing', !!existing);
    tools.querySelector('.c-said').textContent = '';
    var last = bs[bs.length - 1], below = matchMedia('(pointer:coarse)').matches || last.y0 < 60;
    tools.classList.add('on');
    var w = tools.offsetWidth, ax = below ? last.x1 - w + 8 : bs[0].x0 - 4;
    tools.style.left = Math.max(0, Math.min(body.clientWidth - w, ax)) + 'px';
    tools.style.top = (below ? last.y1 + 12 : bs[0].y0 - tools.offsetHeight - 16) + 'px';
    tools.classList.toggle('below', below);
    if (focus) tools.querySelector('button').focus({ preventScroll: true });
  }
  function hideTools() { rd.querySelectorAll('.c-tools.on').forEach(function (t) { t.classList.remove('on'); }); active = null; }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(fallback);
    fallback(); return Promise.resolve();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove();
    }
  }
  function fragment(text) {
    var t = text.replace(/\s+/g, ' ').trim(), cjk = /[㐀-鿿]/.test(t);
    if (t.length <= 40) return encodeURIComponent(t);
    var a = cjk ? t.slice(0, 10) : t.split(' ').slice(0, 4).join(' '), b = cjk ? t.slice(-10) : t.split(' ').slice(-4).join(' ');
    return encodeURIComponent(a) + ',' + encodeURIComponent(b);
  }
  rd.addEventListener('click', function (e) {
    var btn = e.target.closest('.c-tools button'); if (!btn || !active) return;
    var body = ctx.body(), tools = body.querySelector('.c-tools'), said = tools.querySelector('.c-said');
    var text = textOf(body, active.s, active.e).replace(/\s+/g, ' ').trim();
    var zh = ctx.lang() === 'zh', title = zh ? ctx.post.titleZh : ctx.post.title;
    if (btn.dataset.do === 'erase') {
      var m = active; marks[ctx.lang()] = load(ctx.lang()).filter(function (x) { return x !== m; }); save(); render(); return;
    }
    var url = 'https://fyang0507.github.io/Reading.dc.html?post=' + encodeURIComponent(ctx.post.id) + '#:~:text=' + fragment(text);
    var out = btn.dataset.do === 'quote' ? (zh ? '「' + text + '」\n—— 杨 Fred Yang《' + title + '》\n' : '“' + text + '”\n— Fred Yang, “' + title + '”\n') + url : text;
    copy(out);
    said.textContent = btn.dataset.do === 'quote' ? '✓ 链接已复制 link copied' : '✓ 已复制 copied';
    tools.classList.add('said');
    setTimeout(function () { tools.classList.remove('said'); }, 1600);
  });
  rd.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTools(); });

  ctx.onLayout(render);
  ctx.layout();
  window.replayC = function () {
    ['zh', 'en'].forEach(function (l) { marks[l] = []; try { localStorage.setItem('fy-marks:' + ctx.post.id + ':' + l, '[]'); } catch (e) {} });
    render();
  };
  window.__C = { ctx: ctx, add: add, render: render, showTools: showTools, nodes: nodes, marks: marks };
})();
