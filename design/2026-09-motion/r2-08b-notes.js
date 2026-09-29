/* r2-08b-notes.js — the footnote model every candidate shares.
   · prepare(ctx): each margin note gets the full reference (the imported ones are truncated) with dates in utility
     mono, and every citation is parsed into fields (who · title · date · host) for the slip, the strip and the card.
   · geometry: the glyph row a ref sits on, the phrase a ref is about, where the visual line ends after a ref.
   · hover(ctx, model, h): pointer / focus / touch / Esc wiring for the margin candidates (A and C).
   · first(key) / seen(key): the first reveal plays the full choreography; every later one plays the quick repeat. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // Dates are machine-side facts → utility mono. Only text nodes are touched (URLs contain dates too).
  function withDates(html) {
    var t = document.createElement('span'), w, list = [];
    t.innerHTML = html; w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(function (n) {
      var parts = n.textContent.split(/(\d{4}-\d{2}-\d{2})/); if (parts.length < 2) return;
      var f = document.createDocumentFragment();
      parts.forEach(function (p, i) {
        if (i % 2) { var d = document.createElement('span'); d.className = 'd'; d.textContent = p; f.appendChild(d); }
        else if (p) f.appendChild(document.createTextNode(p));
      });
      n.parentNode.replaceChild(f, n);
    });
    return t.innerHTML;
  }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } }
  // One reference item can hold several citations, always separated right after a date ("…, 2026-08-22; Z.ai, …").
  function parse(span) {
    return span.innerHTML.replace(/(\d{4}-\d{2}-\d{2})\s*[;；]\s*/g, '$1\u0001').split('\u0001').map(function (h) {
      var t = document.createElement('span'); t.innerHTML = h;
      var a = t.querySelector('a'), full = t.textContent.replace(/\s+/g, ' '), date = (full.match(/\d{4}-\d{2}-\d{2}/) || [''])[0];
      var at = a ? full.indexOf(a.textContent) : -1, after = at < 0 ? '' : full.slice(at + a.textContent.length, date ? full.indexOf(date) : undefined);
      return {
        who: at > 0 ? full.slice(0, at).replace(/[\s,，“"「]+$/, '').trim() : '',
        title: a ? a.textContent.trim() : full.replace(/\d{4}-\d{2}-\d{2}.*/, '').trim(),
        extra: after.replace(/^[\s,，”"」]+|[\s,，]+$/g, ''),
        href: a ? a.href : '', host: a ? host(a.href) : '', date: date
      };
    });
  }
  // Structured citation for the slip / strip / card: who in ink, title in text serif, date · host in utility mono.
  function fields(note, tab) {
    return note.entries.map(function (e) {
      return '<span class="fe">' + (e.who ? '<span class="fe-who">' + esc(e.who) + '</span>' : '') +
        '<a class="fe-title" href="' + esc(e.href) + '" target="_blank" rel="noopener noreferrer"' + (tab ? '' : ' tabindex="-1"') + '>' + esc(e.title) + '</a>' +
        (e.extra ? '<span class="fe-extra">' + esc(e.extra) + '</span>' : '') +
        '<span class="fe-meta"><span class="d">' + e.date + '</span>' + (e.host ? '<span class="fe-dot"> · </span><span class="d">' + esc(e.host) + '</span>' : '') + '</span></span>';
    }).join('');
  }

  function prepare(ctx) {
    var model = { zh: {}, en: {} };
    ctx.rd.querySelectorAll('.post-body').forEach(function (body) {
      var lang = body.classList.contains('zh') ? 'zh' : 'en';
      body.querySelectorAll('.mn').forEach(function (mn) {
        var sup = mn.previousElementSibling, a = sup && sup.querySelector('a');
        var item = a && body.querySelector(a.getAttribute('href'));
        if (!item) return;
        var n = a.textContent.trim(), span = item.lastElementChild;
        var note = { n: n, key: lang + n, lang: lang, body: body, a: a, sup: sup, mn: mn, item: item, html: withDates(span.innerHTML), entries: parse(span) };
        mn.innerHTML = '<span class="mn-in"><span class="num">' + n + '</span><span class="mn-t">' + note.html + '</span></span>';
        mn.querySelectorAll('a').forEach(function (x) { x.tabIndex = -1; });
        mn.dataset.n = n; a.dataset.n = n;
        model[lang][n] = note;
      });
      var wire = document.createElementNS(NS, 'svg');
      wire.setAttribute('class', 'fn-wire'); wire.setAttribute('aria-hidden', 'true');
      body.appendChild(wire);
    });
    model.of = function (el) {
      var body = el.closest('.post-body'), n = el.dataset.n || (el.closest('[data-n]') || {}).dataset.n;
      return body && n ? model[body.classList.contains('zh') ? 'zh' : 'en'][n] : null;
    };
    model.get = function (n) { return model[ctx.lang()][n]; };
    return model;
  }

  /* ---- geometry ---- */
  function metrics(body) {
    var p = body.querySelector('.sec p') || body.querySelector('p'), cs = getComputedStyle(p), fs = parseFloat(cs.fontSize);
    return { fs: fs, lh: parseFloat(cs.lineHeight) || fs * 1.8 };
  }
  // Text + <br> walker over the ref's paragraph that never enters notes, refs or inserted strips.
  function walker(p) {
    return document.createTreeWalker(p, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: function (n) {
      if (n.nodeType === 3) return NodeFilter.FILTER_ACCEPT;
      if (n.matches('.mn, .fnref, .uf')) return NodeFilter.FILTER_REJECT;
      return n.tagName === 'BR' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    } });
  }
  function charRect(node, i) { var r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1); return r.getClientRects()[0] || null; }
  // The glyph row a ref sits on: measured on the character just before the superscript (client coords).
  function row(sup) {
    var w = walker(sup.closest('p')), n; w.currentNode = sup;
    while ((n = w.previousNode())) {
      if (n.nodeType !== 3) break;
      var t = n.textContent, i = t.length - 1;
      while (i >= 0 && /\s/.test(t[i])) i--;
      if (i >= 0) { var r = charRect(n, i); if (r) return r; }
    }
    return sup.getBoundingClientRect();
  }
  // The phrase the note is about: back from the ref to the previous clause stop (，。；：! ? , ; :), never past a
  // line break or another note, at least a few words long, at most ~34 CJK characters or ~70 Latin ones.
  function phrase(sup) {
    var w = walker(sup.closest('p')), n, endN = null, endO = 0, sN = null, sO = 0, count = 0, cjk = null, done = false;
    w.currentNode = sup;
    while (!done && (n = w.previousNode())) {
      if (n.nodeType !== 3) break;
      var t = n.textContent, i = t.length;
      if (!endN) { while (i > 0 && /\s/.test(t[i - 1])) i--; if (!i) continue; endN = n; endO = i; cjk = /[㐀-鿿]/.test(t.slice(Math.max(0, i - 6), i)); }
      var min = cjk ? 6 : 16, max = cjk ? 34 : 70;
      sN = n; sO = 0;
      for (var k = i - 1; k >= 0; k--) {
        var c = t[k], stop = /[，。；：！？,;:!?]/.test(c) || (c === '.' && /\s/.test(t[k + 1] || ''));
        if (stop && count >= min) { sO = k + 1; done = true; break; }
        if (++count >= max) { sO = k; done = true; if (!cjk) { var sp = t.indexOf(' ', k); if (sp > 0 && sp < i) sO = sp + 1; } break; }
      }
    }
    if (!endN) return null;
    while (sN && sO < sN.textContent.length && /[\s“"]/.test(sN.textContent[sO])) sO++;
    var r = document.createRange(); r.setStart(sN, sO); r.setEnd(endN, endO);
    return r;
  }
  // Where the visual line that holds the ref ends: a <br>, the first character that wraps to the next row, or the
  // paragraph's end. B inserts its strip there, so the line above never re-wraps.
  function lineEnd(sup) {
    var p = sup.closest('p'), w = walker(p), ref = row(sup), n; w.currentNode = sup;
    while ((n = w.nextNode())) {
      if (n.nodeType !== 3) return { after: n };
      var t = n.textContent;
      for (var i = 0; i < t.length; i++) {
        if (/\s/.test(t[i])) continue;
        var r = charRect(n, i);
        if (r && r.top > ref.top + ref.height * .6) return { node: n, offset: i };
      }
    }
    return { end: p };
  }
  function rel(r, B) { return { left: r.left - B.left, right: r.right - B.left, top: r.top - B.top, bottom: r.bottom - B.top, width: r.width, height: r.height, cx: (r.left + r.right) / 2 - B.left, cy: (r.top + r.bottom) / 2 - B.top }; }
  function marginShown(note) { return getComputedStyle(note.mn).display !== 'none'; }

  /* ---- first reveal vs repeat ---- */
  var seenMap = {};
  function first(key) { return !seenMap[key]; }
  function seen(key, v) { seenMap[key] = v !== false; }

  /* ---- pointer / focus / touch / Esc wiring for the margin candidates ---- */
  function hover(ctx, model, h) {
    var rd = ctx.rd, cur = null, t = 0, lastType = 'mouse';
    function on(note) { clearTimeout(t); if (cur === note) return; if (cur) h.off(cur); cur = note; h.on(note); }
    function off(now) { clearTimeout(t); var c = cur; if (!c) return; if (now) { cur = null; h.off(c); } else t = setTimeout(function () { if (cur === c) { cur = null; h.off(c); } }, 120); }
    rd.addEventListener('pointerdown', function (e) { lastType = e.pointerType; }, true);
    rd.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'touch') return;
      var hit = e.target.closest('.fnref a[data-n], .mn[data-n]'), note = hit && model.of(hit);
      if (note && marginShown(note)) on(note);
    });
    rd.addEventListener('pointerout', function (e) {
      if (e.pointerType === 'touch') return;
      var hit = e.target.closest('.fnref a[data-n], .mn[data-n]');
      if (hit && !(e.relatedTarget && hit.contains(e.relatedTarget))) off(false);
    });
    rd.addEventListener('focusin', function (e) {
      var note = e.target.matches('.fnref a[data-n]') && model.of(e.target);
      if (note && marginShown(note)) on(note);
    });
    rd.addEventListener('focusout', function (e) { if (e.target.matches('.fnref a[data-n]')) off(false); });
    rd.addEventListener('click', function (e) {
      var a = e.target.closest('.fnref a[data-n]'), note = a && model.of(a);
      if (!note) { if (cur && lastType === 'touch' && !e.target.closest('.mn')) off(true); return; }
      if (!marginShown(note)) { e.preventDefault(); h.tap(note); return; }
      if (lastType === 'touch') { e.preventDefault(); if (cur === note) off(true); else on(note); }   // wide touch: tap to pull, tap again to let go
    });
    rd.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cur) off(true); });
    ctx.onLayout(function () { off(true); });
    return { on: on, off: off, current: function () { return cur; } };
  }

  window.FN = { esc: esc, withDates: withDates, fields: fields, prepare: prepare, metrics: metrics, row: row, phrase: phrase, lineEnd: lineEnd, rel: rel, marginShown: marginShown, hover: hover, first: first, seen: seen, NS: NS };
})();
