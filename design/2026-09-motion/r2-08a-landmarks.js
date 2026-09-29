/* r2-08a-landmarks.js — find the landmarks an essay actually has, and mark them up so the pencil margin can use them.
   Tiers, in order of trust:
     1  explicit section markers on a line of their own: <strong>1.0</strong>, plain "1.0", "（一）非建制", "I. Unincorporated",
        "(3)", 序 / Preface / Prologue / 后记 / Postscript, or an <h2>/<h3> whose whole text is such a number
     2  headings: real <h2>/<h3> (outside the reference appendix) and whole-line bold titles ("广州惯性", "Guangzhou: Inertia")
     3  figures and pull quotes (only when there is no tier-1/2 structure)
     fill  minute ticks at paragraph starts, labelled "3 min", for essays with no structure, or inside a stretch of an
        essay that structure leaves unmarked (> 40% of the reading time, or > 4 min)
   Pure string work: build(html, readingMin, idPrefix) → { html, marks[], kind, total }. The imported essays are one <p> per
   block with <br> line breaks, so a "line" is the text between <br>s and a paragraph starts after a blank line. */
(function () {
  var NUM_EXACT = /^(?:\d+\.\d+|[（(][一二三四五六七八九十百\d]{1,4}[）)]|[IVXLC]{1,6}\.?|序|跋|后记|尾声|引子|楔子|preface|prologue(?: [IVX]+)?|epilogue|postscript|coda)$/i;
  var NUM_PLAIN = /^(?:\d+\.\d+|[（(][一二三四五六七八九十百\d]{1,4}[）)]|[IVXLC]{1,6}\.)$/;          // a bare number is enough without bold
  var NUM_LEAD = /^(\d+\.\d+|[（(][一二三四五六七八九十百\d]{1,4}[）)]|[IVXLC]{1,6}\.)\s*(\S.{0,52})$/; // number + short title
  var WORDS = /^(?:序|跋|后记|尾声|引子|楔子|preface|prologue(?: [IVX]+)?|epilogue|postscript|coda)$/i;

  function text(h) {
    return String(h || '').replace(/<span class="mn[\s\S]*?<\/span>\s*<\/span>/g, '').replace(/<sup[\s\S]*?<\/sup>/g, '')
      .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cjk(s) { return /[㐀-鿿]/.test(s); }
  function clip(s, n) { return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; }
  // A heading's rail label has ~12 mono cells: 6 CJK characters, or the part before a colon, or a clipped phrase.
  function shortLabel(s) {
    if (cjk(s)) return clip(s, 7);
    var head = s.split(/[:：—–]/)[0].trim();
    return clip(head.length >= 3 ? head : s, 13);
  }

  // Classify a line that starts a paragraph. Numbered markers only need the blank line before them (poems write
  // "（一）<br>first line"); a bold title must also stand alone. Returns null or { kind, label, title }.
  function classify(h, alone) {
    var t = text(h); if (!t || t.length > 60) return null;
    var bold = /^<strong>[\s\S]*<\/strong>$/.test(h.trim()) || /^<b>[\s\S]*<\/b>$/.test(h.trim());
    if (bold && NUM_EXACT.test(t)) return { kind: 'sec', label: t.replace(/\.$/, ''), title: '' };
    if (!bold && NUM_PLAIN.test(t)) return { kind: 'sec', label: t.replace(/\.$/, ''), title: '' };
    var m = t.match(NUM_LEAD);
    if (m && !/[。，；,;]$/.test(m[2])) return { kind: 'sec', label: m[1].replace(/\.$/, ''), title: m[2] };
    if (alone && bold && !WORDS.test(t) && t.length <= 32 && !/[。，；,;.!?！？]$/.test(t)) return { kind: 'head', label: shortLabel(t), title: t };
    return null;
  }

  // Tokenise the essay body (appendix removed) into blocks; <p> blocks become lines.
  function tokenize(html) {
    var out = [], re = /<(p|h[1-6]|figure|blockquote|ul|ol|pre|div|table)\b([^>]*)>([\s\S]*?)<\/\1>/gi, m, last = 0;
    function para(inner) { out.push({ k: 'p', lines: inner.split(/<br\s*\/?>/i) }); }
    while ((m = re.exec(html))) {
      var gap = html.slice(last, m.index).trim(); if (gap) para(gap);
      if (m[1].toLowerCase() === 'p') para(m[3]);
      else out.push({ k: 'block', tag: m[1].toLowerCase(), attrs: m[2], inner: m[3], raw: m[0] });
      last = re.lastIndex;
    }
    var tail = html.slice(last).trim(); if (tail) para(tail);
    return out;
  }

  function build(html, readingMin, pre) {
    html = String(html || '');
    var cut = html.indexOf('<section class="appendix"');
    var body = cut < 0 ? html : html.slice(0, cut), appendix = cut < 0 ? '' : html.slice(cut);
    var blocks = tokenize(body), chars = 0, starts = [], found = [], figs = [];

    // pass 1 — character offsets, paragraph starts, structural candidates
    blocks.forEach(function (b, bi) {
      if (b.k === 'block') {
        var t = text(b.inner);
        if (/^h[23]$/.test(b.tag)) {
          var lead = t.match(NUM_LEAD);
          b.mark = NUM_EXACT.test(t) ? { kind: 'sec', label: t.replace(/\.$/, ''), title: '' }
            : lead ? { kind: 'sec', label: lead[1].replace(/\.$/, ''), title: lead[2] }
            : { kind: 'head', label: shortLabel(t), title: t };
          b.mark.at = chars; found.push(b.mark);
        } else if (b.tag === 'figure' || b.tag === 'blockquote' || /class="(?:fig|pull)/.test(b.attrs)) {
          b.mark = { kind: 'fig', label: b.tag === 'figure' || /fig/.test(b.attrs) ? 'fig. 图' : '“ ”', title: clip(t, 60), at: chars };
          figs.push(b.mark);
        }
        chars += t.length; return;
      }
      b.flags = [];
      var L = b.lines, blankBefore = true;
      for (var i = 0; i < L.length; i++) {
        var t2 = text(L[i]);
        if (!t2) { blankBefore = true; continue; }
        var blankAfter = i === L.length - 1 || !text(L[i + 1]);
        var c = blankBefore ? classify(L[i], blankAfter) : null;
        if (c) { c.at = chars; c.block = bi; c.line = i; found.push(c); b.flags[i] = c; }
        else if (blankBefore) starts.push({ at: chars, block: bi, line: i, text: t2 });
        chars += t2.length; blankBefore = false;
      }
    });
    var total = Math.max(1, chars), M = Math.max(1, readingMin || Math.round(total / 400));
    // tier 1 needs two markers; a lone "后记" or "序" is a heading-level mark. Tier 3 only when there is no structure.
    var secs = found.filter(function (f) { return f.kind === 'sec'; });
    if (secs.length < 2) found.forEach(function (f) { f.kind = 'head'; });
    var marks = found.length ? found.slice() : figs.slice();
    var kind = secs.length >= 2 ? 'sections' : found.length ? 'headings' : figs.length ? 'figures' : 'minutes';

    // fill — minute ticks inside long unmarked stretches (or everywhere, for essays with no structure)
    var step = M <= 6 ? 1 : M <= 14 ? 2 : M <= 24 ? 3 : 5, minAt = function (c) { return c / total * M; };
    var bounds = [0].concat(marks.map(function (f) { return minAt(f.at); }), [M]);
    var fillAny = !marks.length, minutes = [];
    for (var g = 0; g < bounds.length - 1; g++) {
      var a = bounds[g], z = bounds[g + 1], span = z - a;
      if (!fillAny && span <= Math.max(4, M * .4)) continue;
      for (var m = step; m < M - step * .4; m += step) {
        if (m <= a + (fillAny ? 0 : step * .5) || m >= z - (fillAny ? 0 : step * .5)) continue;
        var target = total * m / M, best = null;
        starts.forEach(function (s) { if (!best || Math.abs(s.at - target) < Math.abs(best.at - target)) best = s; });
        if (best && !best.used && minutes.every(function (x) { return Math.abs(x.at - best.at) > total * step / M * .45; })) {
          best.used = true; minutes.push({ kind: 'min', label: m + ' min', title: clip(best.text, 64), at: best.at, block: best.block, line: best.line, minute: m });
        }
      }
    }
    marks = marks.concat(minutes).sort(function (x, y) { return x.at - y.at; });
    if (kind !== 'minutes' && minutes.length) kind += '+minutes';
    marks.forEach(function (f, i) { f.id = pre + 'lm' + (i + 1); f.i = i; f.minute = f.minute || Math.max(0, Math.round(minAt(f.at) * 10) / 10); });

    // first readable line after a section marker becomes its peek text
    function firstLineAfter(bi, li) {
      for (var b = bi; b < blocks.length; b++) {
        var B = blocks[b]; if (B.k !== 'p') continue;
        for (var i = b === bi ? li + 1 : 0; i < B.lines.length; i++) { var t = text(B.lines[i]); if (t) return clip(t, 64); }
      }
      return '';
    }

    // pass 2 — emit. Marker lines become headings; the blank lines around them become the heading's margins.
    var outHtml = '';
    blocks.forEach(function (b, bi) {
      if (b.k === 'block') {
        if (b.mark && marks.indexOf(b.mark) >= 0) {
          var cls = b.mark.kind === 'sec' ? 'lm lm-sec' : b.mark.kind === 'fig' ? 'lm-fig' : 'lm lm-head';
          outHtml += b.raw.replace(/^<([a-z0-9]+)\b([^>]*)>/i, function (all, tag, attrs) {
            var old = /\sclass="([^"]*)"/.exec(attrs);
            return '<' + tag + attrs.replace(/\sclass="[^"]*"/, '') + ' class="' + cls + (old ? ' ' + old[1] : '') + '" id="' + b.mark.id + '">';
          });
          if (b.mark.kind === 'sec' && !b.mark.title) b.mark.peek = firstLineAfter(bi, -1);
        } else outHtml += b.raw;
        return;
      }
      var L = b.lines, buf = [];
      function flush() {
        while (buf.length && !text(buf[0]) && !/lm-anchor/.test(buf[0])) buf.shift();
        while (buf.length && !text(buf[buf.length - 1])) buf.pop();
        if (buf.length) outHtml += '<p>' + buf.join('<br>') + '</p>';
        buf = [];
      }
      for (var i = 0; i < L.length; i++) {
        var f = b.flags[i];
        if (f && marks.indexOf(f) >= 0) {
          flush();
          var inner = f.kind === 'sec'
            ? '<span class="lm-no">' + esc(f.label) + '</span>' + (f.title ? '<span class="lm-t">' + esc(f.title) + '</span>' : '')
            : L[i].trim().replace(/^<(strong|b)>([\s\S]*)<\/\1>$/, '$2');
          outHtml += '<h2 class="lm ' + (f.kind === 'sec' ? 'lm-sec' : 'lm-head') + '" id="' + f.id + '">' + inner + '</h2>';
          f.peek = f.title || firstLineAfter(bi, i);
          continue;
        }
        var mk = null;
        for (var k = 0; k < minutes.length; k++) if (minutes[k].block === bi && minutes[k].line === i) mk = minutes[k];
        buf.push(mk ? '<span class="lm-anchor" id="' + mk.id + '" aria-hidden="true"></span>' + L[i] : L[i]);
      }
      flush();
    });
    marks.forEach(function (f) { f.peek = f.peek || f.title || ''; });
    return { html: outHtml + appendix, marks: marks, kind: kind, total: total, minutes: M };
  }

  window.Landmarks = { build: build, text: text };
})();
