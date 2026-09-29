/* r2-08a-render.js — renders one real essay (?post=<id>&lang=zh|en) as the Reading page, in the real window,
   and runs the one scroll/layout bus that the hero (D) and the pencil margin (A) share.
   The page is a real document scroller, so position:sticky, the fixed nav, 100vh and overscroll behave as in production.
   Exposes window.RP = ctx: { post, prev, g (geometry), lang(), body(), marks(), kind(), y(), max(), top(el),
   onScroll(fn(y, raw)), onLayout(fn), layout() }. Every scroll value handed out is clamped to [0, max], so rubber-band
   overscroll at either end (Safari reports scrollY < 0 or > max) reads exactly as the nearest end. */
(function () {
  var POSTS = window.FY_POSTS || [], Q = new URLSearchParams(location.search);
  var idx = Math.max(0, POSTS.findIndex(function (p) { return p.id === Q.get('post'); }));
  var POST = POSTS[idx] || {}, PREV = POSTS[idx + 1] || null, ROOT = '../../';
  var html = document.documentElement;

  if (Q.get('rm') === '1' || sessionStorage.getItem('mock-rm') === '1') html.classList.add('rm');
  html.classList.add(Q.get('lang') === 'en' ? 'lang-en' : 'lang-zh');
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'rm') return;
    html.classList.toggle('rm', !!e.data.on);
    document.dispatchEvent(new CustomEvent('mock:rm', { detail: !!e.data.on }));
  });

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function asset(u) { return String(u || '').replace(/^\.\//, ROOT).replace(/, \.\//g, ', ' + ROOT); }
  function dateLabel(lang) {
    var d = new Date(POST.date + 'T00:00:00'); if (isNaN(d)) return '';
    return lang === 'zh' ? d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function bi(en, zh) { return '<span class="en">' + en + '</span><span class="zh">' + zh + '</span>'; }

  var LM = { zh: Landmarks.build(POST.htmlZh, POST.readingMin, 'zh-'), en: Landmarks.build(POST.htmlEn, POST.readingMin, 'en-') };

  function template() {
    var title = bi(esc(POST.title), esc(POST.titleZh || POST.title));
    var sub = POST.subtitle || POST.subtitleZh ? '<div class="eyebrow">' + bi(esc(POST.subtitle || POST.subtitleZh), esc(POST.subtitleZh || POST.subtitle)) + '</div>' : '';
    var img = POST.cover ? '<img class="plate-img" src="' + asset(POST.cover) + '" srcset="' + asset(POST.coverSrcset) + '" sizes="100vw" alt="" decoding="async">' : '';
    var tabs = '<nav class="site-index site-index--reading" aria-label="Primary navigation">' +
      '<a class="site-home" href="' + ROOT + 'index.html" aria-label="Home — 首页"><img class="site-home-object" src="' + ROOT + 'assets/sticker-peek.png" alt="" aria-hidden="true"><span class="site-nav-label"><span class="en">home</span></span></a>' +
      '<a class="site-tab site-tab--writing" href="' + ROOT + 'Writing.dc.html" aria-label="Writing — 在写" aria-current="page"><span class="site-nav-object site-nav-book"></span><span class="site-nav-label"><span class="en">writing</span></span></a>' +
      '<a class="site-tab site-tab--building" href="' + ROOT + 'Building.dc.html" aria-label="Building — 在造"><span class="site-nav-object site-nav-laptop"></span><span class="site-nav-label"><span class="en">building</span></span></a>' +
      '<a class="site-tab site-tab--shooting" href="' + ROOT + 'Gallery.dc.html" aria-label="Shooting — 在拍"><span class="site-nav-object site-nav-camera"></span><span class="site-nav-label"><span class="en">shooting</span></span></a>' +
      '<a class="site-tab site-tab--about" href="' + ROOT + 'About.dc.html" aria-label="About — 关于"><span class="site-nav-object site-nav-frame"></span><span class="site-nav-label"><span class="en">about</span></span></a></nav>';
    var prev = PREV ? '<div class="pn"><a href="r2-08a-page.html?post=' + encodeURIComponent(PREV.id) + '">' +
      '<div class="lab">' + bi('← previous', '← 上一篇') + '</div><div class="t">' + bi(esc(PREV.title), esc(PREV.titleZh)) + '</div></a></div>' : '';
    return '<nav class="rnav" aria-label="article">' +
        '<div class="nav-plate" aria-hidden="true"><div class="nav-plate-in"><div class="plate-art">' + img + '</div><canvas class="plate-cv nav-cv"></canvas></div></div>' +
        '<div class="nav-title" aria-hidden="true"><span class="nav-title-t">' + title + '</span></div>' +
        '<div class="nav-row">' +
          '<div class="brand"><img class="brand-mark" src="' + ROOT + 'favicon.png" width="34" height="34" alt="Fred Yang">' +
          '<a class="back" href="' + ROOT + 'Writing.dc.html"><span class="back-arrow" aria-hidden="true">←&nbsp;</span><span class="back-t">' + bi('all writing', '全部文章') + '</span></a></div>' +
          '<div class="right"><button class="btn" type="button" data-act="lang" aria-label="Switch language · 切换语言">' + bi('中', 'EN') + '</button></div>' +
        '</div>' +
      '</nav>' +
      '<div class="plate" aria-hidden="true"><div class="plate-art">' + img + '</div><canvas class="plate-cv main-cv"></canvas></div>' +
      '<div class="fly" aria-hidden="true"></div>' +
      '<div class="wrap"><div class="nav-space"></div>' + tabs +
        '<main><article>' +
          '<header class="article-intro">' +
            '<div class="kick-row"><span class="kicker">' + bi(esc((POST.tags || []).join(' · ') || 'essay'), esc((POST.tagsZh || []).join(' · ') || '文章')) + '</span>' +
            '<span class="meta"><time datetime="' + esc(POST.date) + '">' + bi(dateLabel('en'), dateLabel('zh')) + '</time><span class="dot">·</span>' +
            bi((POST.readingMin || 1) + ' min read', '约 ' + (POST.readingMin || 1) + ' 分钟') + '<span class="dot">·</span><span>中 / EN</span></span></div>' +
            '<h1 class="title">' + title + '</h1>' + sub +
          '</header>' +
          '<div class="body-col"><div class="rail-col"></div>' +
            '<div class="post-body zh" lang="zh">' + LM.zh.html + '</div>' +
            '<div class="post-body en" lang="en">' + LM.en.html + '</div>' +
          '</div>' +
        '</article>' + prev + '</main>' +
        '<footer><div class="row"><span>© 2026 Fred Yang · 杨</span><span><a href="mailto:fredyang0507@gmail.com">email</a> · <a href="https://github.com/fyang0507">GitHub</a></span></div></footer>' +
      '</div>';
  }

  var root = document.getElementById('rp');
  root.innerHTML = template();
  root.querySelectorAll('.post-body').forEach(function (b) {
    var pre = b.classList.contains('zh') ? 'zh-' : 'en-';
    b.querySelectorAll('[id^="fn-"],[id^="ref-"]').forEach(function (n) { n.id = pre + n.id; });
    b.querySelectorAll('a[href^="#fn-"],a[href^="#ref-"]').forEach(function (a) { a.setAttribute('href', '#' + pre + a.getAttribute('href').slice(1)); });
  });
  document.title = (POST.titleZh || POST.title) + ' · r2-08a reading';

  var scrollFns = [], layoutFns = [], raf = 0, lraf = 0, cs = getComputedStyle(html);
  function px(name) { return parseFloat(cs.getPropertyValue(name)) || 0; }
  var ctx = {
    post: POST, prev: PREV, root: root, g: {},
    lang: function () { return html.classList.contains('lang-en') ? 'en' : 'zh'; },
    body: function () { return root.querySelector('.post-body.' + ctx.lang()); },
    marks: function () { return LM[ctx.lang()].marks; },
    kind: function () { return LM[ctx.lang()].kind; },
    max: function () { return Math.max(0, html.scrollHeight - innerHeight); },
    y: function () { return Math.min(ctx.max(), Math.max(0, scrollY)); },
    top: function (el) { return el.getBoundingClientRect().top + scrollY; },
    onScroll: function (fn) { scrollFns.push(fn); },
    onLayout: function (fn) { layoutFns.push(fn); },
    layout: function () { cancelAnimationFrame(lraf); lraf = requestAnimationFrame(runLayout); },
    scrollTo: function (y) { window.scrollTo({ top: y, behavior: Pen.reduced() ? 'auto' : 'smooth' }); }
  };
  function runScroll(raw) {
    raf = 0; if (raw == null) raw = scrollY;
    var y = Math.min(ctx.max(), Math.max(0, raw));
    for (var i = 0; i < scrollFns.length; i++) scrollFns[i](y, raw);
  }
  // The one geometry plan (documented on the board): hero height, body top pad and nav heights come from the same numbers.
  function runLayout() {
    var g = ctx.g, bodyCol = root.querySelector('.body-col');
    g.vw = document.documentElement.clientWidth; g.vh = innerHeight;
    g.n0 = px('--n0'); g.n1 = px('--n1'); g.pad = px('--pad'); g.z = px('--z'); g.cell = px('--cell'); g.gap = px('--gap');
    g.narrow = g.vw <= 640; g.rm = Pen.reduced();
    g.b0 = Math.round(ctx.top(bodyCol));             // hero band = everything above the body (nav, tabs, intro, cover tail)
    g.sL = Math.max(1, g.b0 - g.pad);                // landing scroll: paper front reaches y=0, body top sits at pad
    g.max = ctx.max();
    html.style.setProperty('--b0', g.b0 + 'px');
    html.classList.toggle('narrow', g.narrow);
    for (var i = 0; i < layoutFns.length; i++) layoutFns[i](ctx);
    runScroll();
  }
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { runScroll(); }); }, { passive: true });
  addEventListener('resize', ctx.layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ctx.layout);
  root.querySelectorAll('img').forEach(function (img) { if (!img.complete) img.addEventListener('load', ctx.layout, { once: true }); });
  document.addEventListener('mock:rm', ctx.layout);

  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act="lang"]'); if (!b) return;
    var en = !html.classList.contains('lang-en'), y = ctx.y(), m = ctx.max();
    var frac = y > ctx.g.sL ? y / Math.max(1, m) : 0;
    html.classList.toggle('lang-en', en); html.classList.toggle('lang-zh', !en);
    var u = new URL(location.href); u.searchParams.set('lang', en ? 'en' : 'zh'); history.replaceState(null, '', u);
    runLayout(); if (frac) window.scrollTo(0, frac * ctx.max());
    if (parent !== window) parent.postMessage({ type: 'lang', lang: en ? 'en' : 'zh' }, '*');
  });

  window.RP = ctx;
  // test hook: run every scroll handler as if the browser reported this raw scrollY (e.g. max + 90 during a bounce)
  window.__rp = { ctx: ctx, force: runScroll, relayout: runLayout, LM: LM };
  ctx.layout();
})();
