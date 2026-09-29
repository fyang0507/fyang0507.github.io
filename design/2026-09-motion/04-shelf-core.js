/* 04-shelf-core.js — board 04 shared kit: real post data, the shelf builder (spines copied from
   Writing.dc.html), the physics clock (live springs + spring-derived WAAPI easings), roving keyboard
   focus, and the bird on the hand's clock. Candidates A/B/C/M build on this. */
(function () {
  var TONES = ['#c9bda3', '#d8cbb0', '#b7ab8f', '#e4dac7'];                // Writing.dc.html:257
  var TAG_ZH = { 'stories we live': '我们生活的故事', 'everyday chronicles': '日常记趣', 'travel log': '游记', 'commentary': '杂文', 'poem': '诗' };
  var PRIMARY = Object.keys(TAG_ZH);
  var fix = function (s) { return (s || '').replace(/\.\/images\//g, '../../images/'); };

  // Same ordering and id arithmetic as the live page, so heights and tones match spine for spine.
  var ALL = (window.FY_POSTS || []).slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).map(function (p, i) {
    var tags = [];
    (p.tags || []).concat(p.tagsZh || []).forEach(function (t) {
      var n = PRIMARY.find(function (k) { return t === k || t === TAG_ZH[k]; });
      if (n && tags.indexOf(n) < 0) tags.push(n);
    });
    var sm = p.title.match(/Stories We Live\s+(\d+)/i) || p.titleZh.match(/故事\s*0?(\d+)/);
    var id = i + 1, series = sm ? Number(sm[1]) : null;
    return {
      key: p.id, id: id, zh: p.titleZh, en: p.title, date: p.date, year: p.date.slice(0, 4),
      ym: p.date.slice(0, 7).replace('-', '·'), tags: tags, tagZh: tags.map(function (t) { return TAG_ZH[t]; }),
      series: series, min: p.readingMin, cover: fix(p.cover), coverSrcset: fix(p.coverSrcset),
      excerpt: p.excerpt || '', excerptZh: p.excerptZh || '',
      href: '../../Reading.dc.html?post=' + encodeURIComponent(p.id) + '&lang=zh',
      w: series ? 30 : 22 + (id % 4) * 4, hPct: series ? 96 : 58 + ((id * 29) % 38), tone: TONES[id % 4]
    };
  });
  function pick(keys) { return keys.map(function (k) { return ALL.find(function (p) { return p.key.indexOf(k) === 0; }); }).filter(Boolean); }
  function tagLine(p) { return p.ym + (p.tags.length ? ' · ' + p.tags[0] + ' · ' + p.tagZh[0] : '') + (p.min ? ' · ~' + p.min + ' min' : ''); }
  // One dry hand-written aside per essay; it notices length, not quality.
  function aside(p) {
    if (p.series) return ['no.' + p.series + ' of the series', '系列第' + p.series + '篇'];
    if (p.min >= 15) return ['a long one', '长文'];
    if (p.min <= 4) return ['a quick one', '短篇'];
    return ["one coffee's worth", '一杯咖啡'];
  }

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---- the shelf -------------------------------------------------------------------------
  function spineHTML(p) {
    var fs = Math.max(8.5, +(11 - Math.max(0, p.zh.length - 11) * 0.12).toFixed(2));
    return '<span class="bk-spine" style="--fs:' + fs + 'px"><i class="bk-band b1"></i><i class="bk-band b2"></i><i class="bk-band b3"></i>' +
      '<span class="bk-title">' + esc(p.zh) + '</span>' + (p.series ? '<span class="bk-badge">0' + p.series + '</span>' : '') + '</span>';
  }
  function buildShelf(host, posts, opt) {
    opt = opt || {};
    var rowH = opt.rowH || 230, k = opt.scale || 1;
    var wrap = el('div', 'shelf-wrap'), row = el('div', 'shelf-row'), years = el('div', 'year-row');
    row.style.height = rowH + 'px';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', 'Bookshelf · 书架 — arrow keys walk the shelf');
    var tsu = el('div', 'tsu', '<span>つづく</span>');
    tsu.style.width = Math.round(40 * k) + 'px'; tsu.style.height = Math.round(rowH * 0.7) + 'px';
    tsu.setAttribute('role', 'img'); tsu.setAttribute('aria-label', 'Still writing · 还在写');
    row.appendChild(tsu);
    var ty = el('div', 'yr'); ty.style.width = Math.round(40 * k) + 'px'; years.appendChild(ty);
    var books = posts.map(function (p, i) {
      var a = el('a', 'bk' + (p.series ? ' series' : ''));
      var w = Math.round(p.w * k), h = Math.round(p.hPct / 100 * rowH);
      a.href = p.href; a.dataset.i = i;
      a.setAttribute('aria-label', 'Read ' + p.en + ' — 阅读 ' + p.zh + ' · ' + tagLine(p));
      a.style.cssText = '--w:' + w + 'px;--h:' + h + 'px;--tone:' + (p.series ? '#3d362a' : p.tone);
      a.innerHTML = '<span class="bk-body"><span class="bk-top"></span>' + spineHTML(p) + '</span>';
      row.appendChild(a);
      var yr = el('div', 'yr'); yr.style.width = w + 'px';
      if (i === 0 || posts[i - 1].year !== p.year) yr.innerHTML = '<i></i><span>' + p.year + '</span>';
      years.appendChild(yr);
      return { el: a, body: a.firstChild, post: p, i: i, w: w, h: h };
    });
    wrap.appendChild(row); wrap.appendChild(years);
    host.appendChild(wrap);
    return { wrap: wrap, row: row, tsu: tsu, books: books, rowH: rowH };
  }
  // Geometry in row coordinates, from layout (not transforms): left, centre, top of each spine.
  function measure(shelf) {
    shelf.books.forEach(function (b) { b.x = b.el.offsetLeft; b.cx = b.x + b.w / 2; b.top = shelf.rowH - b.h; });
    shelf.tsuX = shelf.tsu.offsetLeft + shelf.tsu.offsetWidth / 2; shelf.tsuTop = shelf.rowH - shelf.tsu.offsetHeight;
  }

  // Roving tabindex: the shelf is one tab stop; arrows walk it.
  function rove(shelf, onFocus, onBlur) {
    var n = shelf.books.length;
    shelf.books.forEach(function (b, i) {
      b.el.tabIndex = i === 0 ? 0 : -1;
      b.el.addEventListener('keydown', function (e) {
        var j = null, k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = i + 1; else if (k === 'ArrowLeft' || k === 'ArrowUp') j = i - 1;
        else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1;
        if (j == null) return;
        e.preventDefault(); j = Math.max(0, Math.min(n - 1, j));
        shelf.books[j].el.focus();
      });
      b.el.addEventListener('focus', function () {
        shelf.books.forEach(function (o) { o.el.tabIndex = -1; }); b.el.tabIndex = 0;
        if (b.el.matches(':focus-visible')) onFocus(i);        // keyboard focus = hover; a click's focus is not a preview
      });
      b.el.addEventListener('blur', function (e) { if (!e.relatedTarget || !shelf.row.contains(e.relatedTarget)) onBlur && onBlur(); });
    });
  }

  // ---- physics clock -------------------------------------------------------------------------
  // Mass-1 spring; z is the damping ratio (≈.6 → one small overshoot, then settle).
  function Spring(x, k, z) { this.x = x; this.t = x; this.v = 0; this.k = k; this.c = 2 * z * Math.sqrt(k); }
  Spring.prototype.step = function (dt) {
    if (dt < 0) { var moved = this.x !== this.t; this.x = this.t; this.v = 0; return moved; }   // reduced motion: arrive
    var a = -this.k * (this.x - this.t) - this.c * this.v; this.v += a * dt; this.x += this.v * dt;
    if (Math.abs(this.v) < 0.015 && Math.abs(this.x - this.t) < 0.015) { this.x = this.t; this.v = 0; return false; }
    return true;
  };
  Spring.prototype.snap = function () { this.x = this.t; this.v = 0; };
  // rAF loop that runs only while render(dt) reports motion; idle shelves cost nothing.
  function Loop(render) {
    var on = false, last = 0;
    function tick(now) {
      var dt = Math.min(0.032, (now - last) / 1000); last = now;
      var busy = render(dt / 2) | render(dt / 2);
      if (busy) requestAnimationFrame(tick); else on = false;
    }
    return { kick: function () { if (window.Pen && Pen.reduced()) { render(-1); return; } if (on) return; on = true; last = performance.now(); requestAnimationFrame(tick); } };
  }
  // A real spring simulated once and baked into a CSS linear() easing, so choreographed WAAPI
  // sequences carry mass and one overshoot instead of a stock ease-in-out.
  var easeCache = {};
  function springEase(z, hz) {
    var key = z + ':' + hz; if (easeCache[key]) return easeCache[key];
    var w = 2 * Math.PI * hz, x = 0, v = 0, dt = 1 / 600, t = 0, next = 1 / 60, out = [0];
    for (var i = 0; i < 9000; i++) {
      v += (w * w * (1 - x) - 2 * z * w * v) * dt; x += v * dt; t += dt;
      if (t >= next) { out.push(+x.toFixed(4)); next += 1 / 60; if (Math.abs(1 - x) < 0.006 && Math.abs(v) < 0.12) break; }
    }
    out[out.length - 1] = 1;
    return (easeCache[key] = { easing: 'linear(' + out.join(',') + ')', duration: Math.round(t * 1000) });
  }
  // A spring's shape only (tail trimmed), for choreography where the duration is set explicitly.
  function curve(z) { var e = springEase(z, 1.6); return e.easing; }
  // WAAPI helper: spring:[zeta,hz] or duration/easing. Commits the end state so animations never stack.
  function play(node, frames, o) {
    o = o || {};
    var rm = window.Pen && Pen.reduced();
    var sp = o.spring ? springEase(o.spring[0], o.spring[1]) : null;
    var a = node.animate(frames, {
      duration: rm ? 1 : (o.duration || (sp && sp.duration) || 400), delay: rm ? 0 : (o.delay || 0),
      easing: sp ? sp.easing : (o.easing || 'cubic-bezier(.2,.7,.2,1)'), fill: 'both'
    });
    return a.finished.then(function () { try { a.commitStyles(); } catch (e) {} a.cancel(); }, function () {});
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, window.Pen && Pen.reduced() ? 0 : ms); }); }
  function rel(node, host) { var a = node.getBoundingClientRect(), b = host.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }

  // ---- the bird, on the hand's clock ---------------------------------------------------------
  // 6-frame strip: 0 stand · 1 crouch · 2 take-off · 3 air · 4 land · 5 settle. Positions only change
  // on frame swaps (~10 fps). It notices after a pause, finishes the hop it is in, never chases.
  // mode 'tops': hops along spine tops and perches on the book. mode 'lip': walks the plank's front lip.
  function Bird(shelf, opt) {
    opt = opt || {};
    var W = opt.size || 56, H = W * 317 / 308, FEET = H * 0.82, mode = opt.mode || 'tops';
    var node = el('div', 'bird'), fr = el('div', 'bird-f');
    node.style.width = W + 'px'; node.style.height = H + 'px'; node.appendChild(fr); shelf.row.appendChild(node);
    node.setAttribute('aria-hidden', 'true');
    var st = { x: 0, y: 0, dir: -1, perch: -1, busy: false, want: -1, gen: 0 }, timer = null;
    function spot(i) {
      if (i < 0) return mode === 'tops' ? { x: shelf.tsuX, y: shelf.tsuTop } : { x: shelf.tsuX + 24, y: shelf.rowH };
      var b = shelf.books[i];
      if (mode === 'tops') return { x: b.cx, y: b.top };
      var side = st.x <= b.cx ? -1 : 1;                       // stand at the foot, on the side it came from
      return { x: b.cx + side * (b.w / 2 + W * 0.2), y: shelf.rowH };
    }
    function ride(i) { return i >= 0 && opt.ride ? opt.ride(i) : 0; }
    function place() {
      node.style.transform = 'translate(' + (st.x - W / 2).toFixed(1) + 'px,' + (st.y + ride(st.perch) - FEET).toFixed(1) + 'px) scaleX(' + (st.dir > 0 ? -1 : 1) + ')';
    }
    function frame(i) { fr.style.backgroundPosition = (i * 20) + '% 0'; }
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function nextStop(target) {
      var dx = target.x - st.x;
      if (Math.abs(dx) <= 96) return { s: target, i: st.want };
      if (mode === 'lip') return { s: { x: st.x + Math.sign(dx) * Math.min(88, Math.abs(dx) / Math.ceil(Math.abs(dx) / 88)), y: shelf.rowH }, i: -2 };
      var best = null;                                         // the farthest spine top within one hop
      shelf.books.forEach(function (b, i) {
        var d = (b.cx - st.x) * Math.sign(dx);
        if (d > 18 && d <= 96 && (!best || d > best.d)) best = { d: d, s: { x: b.cx, y: b.top }, i: i };
      });
      return best || { s: target, i: st.want };
    }
    async function hop(stop) {
      var x0 = st.x, y0 = st.y + ride(st.perch), x1 = stop.s.x, y1 = stop.s.y + ride(stop.i), dx = x1 - x0;
      var dir = dx > 0 ? 1 : -1;
      st.perch = -1; st.y = y0;
      if (dir !== st.dir) { st.dir = dir; place(); await sleep(150); }  // turn, then a held beat
      frame(1); await sleep(100);
      frame(2); st.x = x0 + dx * 0.22; st.y = y0 + (y1 - y0) * 0.2 - 7; place(); await sleep(80);
      frame(3); st.x = x0 + dx * 0.66; st.y = Math.min(y0, y1) - 14 - Math.abs(y1 - y0) * 0.12; place(); await sleep(100);
      frame(4); st.x = x1; st.y = stop.s.y; st.perch = stop.i >= 0 ? stop.i : -1; if (st.perch < 0) st.y = y1; place(); await sleep(80);
      frame(5); await sleep(90);
      frame(0);
    }
    async function go() {
      if (st.busy) return;
      st.busy = true;
      var g = st.gen;
      while (g === st.gen) {
        var tgt = spot(st.want);
        if (Math.abs(tgt.x - st.x) < 2 && Math.abs(tgt.y - st.y) < 2) break;
        await hop(nextStop(tgt));
        await sleep(90);
      }
      st.busy = false;
      if (g !== st.gen) go();
    }
    var api = {
      node: node, get perch() { return st.perch; },
      home: function () { var s = spot(-1); st.x = s.x; st.y = s.y; st.perch = -1; st.want = -1; st.dir = -1; frame(0); place(); },
      // Consider a book: wait (it notices late), then hop. delay 0 = go now (e.g. the book is leaving).
      consider: function (i, delay) {
        clearTimeout(timer);
        if (i === st.want && !st.busy) { var s0 = spot(i); if (Math.abs(s0.x - st.x) < 2) return; }
        timer = setTimeout(function () {
          st.want = i;
          if (window.Pen && Pen.reduced()) { var s = spot(i); st.x = s.x; st.y = s.y; st.perch = mode === 'tops' ? i : -1; frame(0); place(); return; }
          st.gen++; go();
        }, delay == null ? (opt.notice || 420) : delay);
      },
      cancel: function () { clearTimeout(timer); },
      place: place
    };
    return api;
  }

  // Representative subsets: all five series spines, every tag, 2026 back to 2015.
  var SET18 = ['2026-08-29', '2026-06-21', '2026-05-02', '2025-12-06', '2025-11-01', '2025-03-23', '2024-12-18', '2024-10-23', '2024-04-23',
    '2023-12-28', '2023-05-27', '2022-11-27', '2021-11-28', '2019-12-29', '2019-01-09', '2018-03-15', '2016-08-10', '2015-05-17'];
  var SET14 = ['2026-08-29', '2026-06-21', '2025-12-06', '2025-11-01', '2024-12-18', '2024-10-23', '2024-04-23', '2023-12-28', '2023-05-27',
    '2022-11-27', '2021-11-28', '2019-12-29', '2018-03-15', '2016-08-10'];

  window.ShelfKit = { SET18: SET18, SET14: SET14, ALL: ALL, pick: pick, tagLine: tagLine, aside: aside, TAG_ZH: TAG_ZH, el: el, esc: esc, spineHTML: spineHTML,
    buildShelf: buildShelf, measure: measure, rove: rove, Spring: Spring, Loop: Loop, springEase: springEase, curve: curve, play: play, wait: wait, rel: rel, Bird: Bird };
})();
