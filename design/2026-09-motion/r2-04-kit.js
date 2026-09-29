/* r2-04-kit.js — board r2-04 shared kit: real post data (same ordering / id arithmetic as Writing.dc.html,
   so spine heights and tones match), the physics clock (live springs + spring-baked WAAPI easings), and
   small DOM helpers. Copied from round 1's 04-shelf-core.js, minus the flat shelf and the flat bird. */
(function () {
  var TONES = ['#c9bda3', '#d8cbb0', '#b7ab8f', '#e4dac7'];                // Writing.dc.html:257
  var TAG_ZH = { 'stories we live': '我们生活的故事', 'everyday chronicles': '日常记趣', 'travel log': '游记', 'commentary': '杂文', 'poem': '诗' };
  var PRIMARY = Object.keys(TAG_ZH);
  var fix = function (s) { return (s || '').replace(/\.\/images\//g, '../../images/'); };

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
      w: series ? 30 : 22 + (id % 4) * 4, hPct: series ? 96 : 58 + ((id * 29) % 38), tone: series ? '#3d362a' : TONES[id % 4]
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
  function spineHTML(p) {
    var fs = Math.max(8.5, +(11 - Math.max(0, p.zh.length - 11) * 0.12).toFixed(2));
    return '<span class="bk-spine" style="--fs:' + fs + 'px"><i class="bk-band b1"></i><i class="bk-band b2"></i><i class="bk-band b3"></i>' +
      '<span class="bk-title">' + esc(p.zh) + '</span>' + (p.series ? '<span class="bk-badge">0' + p.series + '</span>' : '') + '</span>';
  }

  // ---- physics clock -------------------------------------------------------------------------
  // Mass-1 spring; z is the damping ratio (≈.6 → one small overshoot, then settle).
  function Spring(x, k, z) { this.x = x; this.t = x; this.v = 0; this.k = k; this.c = 2 * z * Math.sqrt(k); }
  Spring.prototype.step = function (dt) {
    if (dt < 0) { var moved = this.x !== this.t; this.x = this.t; this.v = 0; return moved; }   // reduced motion: arrive
    var a = -this.k * (this.x - this.t) - this.c * this.v; this.v += a * dt; this.x += this.v * dt;
    if (Math.abs(this.v) < 0.012 && Math.abs(this.x - this.t) < 0.012) { this.x = this.t; this.v = 0; return false; }
    return true;
  };
  Spring.prototype.tune = function (k, z) { this.k = k; this.c = 2 * z * Math.sqrt(k); return this; };
  Spring.prototype.snap = function () { this.x = this.t; this.v = 0; };
  // rAF loop that runs only while render(dt) reports motion; an idle shelf costs nothing.
  function Loop(render) {
    var on = false, last = 0;
    function tick(now) {
      // rAF's timestamp can precede the kick's performance.now(): clamp, or a negative dt reads as "arrive"
      var dt = Math.max(0, Math.min(0.032, (now - last) / 1000)) / SLOW(); last = now;
      var busy = render(dt / 2) | render(dt / 2);
      if (busy) requestAnimationFrame(tick); else on = false;
    }
    return { kick: function () { if (window.Pen && Pen.reduced()) { render(-1); render(-1); render(-1); return; } if (on) return; on = true; last = performance.now(); requestAnimationFrame(tick); } };
  }
  // Verification only: ?slow=4 runs every clock on this board four times slower, to inspect mid-motion frames.
  var SLOWV = +(new URLSearchParams(location.search).get('slow') || 1);
  function SLOW() { return SLOWV; }
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
  function curve(z) { return springEase(z, 1.6).easing; }
  // WAAPI helper: spring:[zeta,hz] or duration/easing. Commits the end state so animations never stack.
  function play(node, frames, o) {
    o = o || {};
    var rm = window.Pen && Pen.reduced();
    var sp = o.spring ? springEase(o.spring[0], o.spring[1]) : null;
    var a = node.animate(frames, {
      duration: rm ? 1 : (o.duration || (sp && sp.duration) || 400) * SLOWV, delay: rm ? 0 : (o.delay || 0) * SLOWV,
      easing: sp ? sp.easing : (o.easing || 'cubic-bezier(.2,.7,.2,1)'), fill: 'both'
    });
    return a.finished.then(function () { try { a.commitStyles(); } catch (e) {} a.cancel(); }, function () {});
  }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, window.Pen && Pen.reduced() ? 0 : ms * SLOWV); }); }
  function rel(node, host) { var a = node.getBoundingClientRect(), b = host.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }

  // Representative subset: all five series spines, every tag, 2026 back to 2015.
  var SET18 = ['2026-08-29', '2026-06-21', '2026-05-02', '2025-12-06', '2025-11-01', '2025-03-23', '2024-12-18', '2024-10-23', '2024-04-23',
    '2023-12-28', '2023-05-27', '2022-11-27', '2021-11-28', '2019-12-29', '2019-01-09', '2018-03-15', '2016-08-10', '2015-05-17'];

  window.ShelfKit = { SET18: SET18, ALL: ALL, pick: pick, tagLine: tagLine, aside: aside, TAG_ZH: TAG_ZH, el: el, esc: esc, spineHTML: spineHTML,
    SLOW: SLOW, Spring: Spring, Loop: Loop, springEase: springEase, curve: curve, play: play, wait: wait, rel: rel };
})();
