/* r2-08b-render.js — renders the real latest essay (window.FY_POSTS[0]) as a faithful Reading page inside each
   candidate's scroller (.rd), so every footnote experience is judged on Fred's actual prose and citations.
   Copied from 08-reading-render.js; round 2 is light-only, so the theme button and dark tokens are gone.
   Each scroller stands in for the browser window. It sits in a .rd-frame so a stage can preview a 390px phone.
   Exposes window.RD.mount(stage, key) → ctx { rd, frame, stage, key, body(), navH(), top(el), onLayout(fn) }. */
(function () {
  var POSTS = window.FY_POSTS || [];
  var POST = POSTS[0] || {};
  var PREV = POSTS[1] || null;
  var ROOT = '../../';

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function asset(u) { return String(u || '').replace(/^\.\//, ROOT).replace(/, \.\//g, ', ' + ROOT); }

  // The imported essays are one <p> with <br> breaks and <strong>1.0</strong> markers; split at the markers.
  function sectionize(html, pre) {
    var cut = html.indexOf('<section class="appendix"');
    var body = cut < 0 ? html : html.slice(0, cut), appendix = cut < 0 ? '' : html.slice(cut);
    body = body.replace(/^\s*<p>/, '').replace(/<\/p>\s*$/, '');
    var re = /(?:<br>\s*)*<strong>(\d+(?:\.\d+)?)<\/strong>(?:<br>\s*)*/g, parts = [], m, last = 0, lead = '';
    while ((m = re.exec(body))) {
      if (!parts.length) lead = body.slice(0, m.index); else parts[parts.length - 1].html = body.slice(last, m.index);
      parts.push({ no: m[1], html: '' }); last = re.lastIndex;
    }
    if (!parts.length) return '<p>' + body + '</p>' + appendix;
    parts[parts.length - 1].html = body.slice(last);
    var out = lead.trim() ? '<p>' + lead + '</p>' : '';
    parts.forEach(function (s, i) {
      out += '<section class="sec" id="' + pre + 's' + (i + 1) + '"><h2 class="sec-no">' + s.no + '</h2><p>' + s.html.replace(/(?:<br>\s*)+$/, '') + '</p></section>';
    });
    return out + appendix;
  }
  function namespace(root, pre) {
    root.querySelectorAll('[id^="fn-"],[id^="ref-"]').forEach(function (n) { n.id = pre + n.id; });
    root.querySelectorAll('a[href^="#fn-"],a[href^="#ref-"]').forEach(function (a) { a.setAttribute('href', '#' + pre + a.getAttribute('href').slice(1)); });
  }
  function dateLabel(lang) {
    var d = new Date(POST.date + 'T00:00:00');
    if (isNaN(d)) return '';
    return lang === 'zh' ? d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function template(key) {
    var tabs = '<nav class="site-index site-index--reading" aria-label="Primary navigation">' +
      '<a class="site-home" href="' + ROOT + 'index.html" aria-label="Home — 首页"><img class="site-home-object" src="' + ROOT + 'assets/sticker-peek.png" alt="" aria-hidden="true"><span class="site-nav-label"><span class="en">home</span></span></a>' +
      '<a class="site-tab site-tab--writing" href="' + ROOT + 'Writing.dc.html" aria-label="Writing — 在写" aria-current="page"><span class="site-nav-object site-nav-book"></span><span class="site-nav-label"><span class="en">writing</span></span></a>' +
      '<a class="site-tab site-tab--building" href="' + ROOT + 'Building.dc.html" aria-label="Building — 在造"><span class="site-nav-object site-nav-laptop"></span><span class="site-nav-label"><span class="en">building</span></span></a>' +
      '<a class="site-tab site-tab--shooting" href="' + ROOT + 'Gallery.dc.html" aria-label="Shooting — 在拍"><span class="site-nav-object site-nav-camera"></span><span class="site-nav-label"><span class="en">shooting</span></span></a>' +
      '<a class="site-tab site-tab--about" href="' + ROOT + 'About.dc.html" aria-label="About — 关于"><span class="site-nav-object site-nav-frame"></span><span class="site-nav-label"><span class="en">about</span></span></a></nav>';
    var wash = POST.cover ? '<figure class="post-wash"><img src="' + asset(POST.cover) + '" srcset="' + asset(POST.coverSrcset) + '" sizes="100vw" alt="' + esc((POST.titleZh || '') + '题图 · opening image') + '" decoding="async"></figure>' : '';
    var prev = PREV ? '<div class="pn"><a href="' + ROOT + 'Reading.dc.html?post=' + encodeURIComponent(PREV.id) + '">' +
      '<div class="lab"><span class="en">← previous</span><span class="zh">← 上一篇</span></div>' +
      '<div class="t"><span class="en">' + esc(PREV.title) + '</span><span class="zh">' + esc(PREV.titleZh) + '</span></div></a></div>' : '';
    return '<div class="rd-page">' +
      '<nav class="rnav" aria-label="article">' +
        '<div class="brand"><img class="brand-mark" src="' + ROOT + 'favicon.png" width="34" height="34" alt="Fred Yang">' +
        '<a class="back" href="' + ROOT + 'Writing.dc.html"><span aria-hidden="true">← </span><span class="en">all writing</span><span class="zh">全部文章</span></a></div>' +
        '<div class="rnav-mid" aria-hidden="true"></div>' +
        '<div class="right"><button class="btn" type="button" data-act="lang" aria-label="Switch language · 切换语言"><span class="en">中</span><span class="zh">EN</span></button></div>' +
      '</nav>' + tabs +
      '<main><article>' +
        '<header class="article-intro' + (wash ? ' has-wash' : '') + '"><div class="article-intro-copy">' +
          '<span class="kicker"><span class="en">' + esc((POST.tags || []).join(' · ') || 'essay') + '</span><span class="zh">' + esc((POST.tagsZh || []).join(' · ') || '文章') + '</span></span>' +
          '<h1 class="title"><span class="en">' + esc(POST.title) + '</span><span class="zh">' + esc(POST.titleZh || POST.title) + '</span></h1>' +
          '<div class="meta"><time datetime="' + esc(POST.date) + '"><span class="en">' + dateLabel('en') + '</span><span class="zh">' + dateLabel('zh') + '</span></time><span class="dot">·</span>' +
          '<span><span class="en">' + (POST.readingMin || 1) + ' min read</span><span class="zh">约 ' + (POST.readingMin || 1) + ' 分钟</span></span><span class="dot">·</span><span>中 / EN</span></div>' +
        '</div>' + wash + '</header>' +
        '<div class="post-body zh" lang="zh">' + sectionize(POST.htmlZh || '', key + '-zh-') + '</div>' +
        '<div class="post-body en" lang="en">' + sectionize(POST.htmlEn || '', key + '-en-') + '</div>' +
      '</article>' + prev + '</main>' +
      '<footer><div class="row"><span>© 2026 Fred Yang · 杨</span><span><a href="mailto:fredyang0507@gmail.com">email</a> · <a href="https://github.com/fyang0507">GitHub</a></span></div></footer>' +
    '</div>';
  }

  function mount(stage, key) {
    var frame = stage.querySelector('.rd-frame'), rd = frame.querySelector('.rd');
    rd.classList.add('lang-zh');
    rd.innerHTML = template(key);
    rd.querySelectorAll('.post-body').forEach(function (b) { namespace(b, key + '-' + (b.classList.contains('zh') ? 'zh' : 'en') + '-'); });

    var layoutFns = [], lraf = 0;
    var ctx = {
      rd: rd, frame: frame, stage: stage, key: key, post: POST,
      lang: function () { return rd.classList.contains('lang-en') ? 'en' : 'zh'; },
      body: function () { return rd.querySelector('.post-body.' + ctx.lang()); },
      navH: function () { return rd.querySelector('.rnav').offsetHeight; },
      top: function (el) { return el.getBoundingClientRect().top - rd.getBoundingClientRect().top + rd.scrollTop; },
      onLayout: function (fn) { layoutFns.push(fn); },
      layout: function () { cancelAnimationFrame(lraf); lraf = requestAnimationFrame(runLayout); },
      scrollTo: function (y) { rd.scrollTo({ top: y, behavior: Pen.reduced() ? 'auto' : 'smooth' }); }
    };
    function runLayout() {
      var intro = rd.querySelector('.article-intro');
      if (intro) rd.style.setProperty('--hero-nav-overlap', Math.round(ctx.top(intro)) + 'px');
      for (var i = 0; i < layoutFns.length; i++) layoutFns[i](ctx);
    }
    // The live page's cover-post nav is transparent and the essay scrolls through it; here it turns to paper
    // (the hero/nav fix is another board's job, so this is only the baseline).
    var bar = document.createElement('div');
    bar.className = 'rd-prog'; bar.setAttribute('aria-hidden', 'true');
    frame.appendChild(bar);
    var sraf = 0;
    rd.addEventListener('scroll', function () {
      stage.classList.add('scrolled');
      if (sraf) return;
      sraf = requestAnimationFrame(function () {
        sraf = 0;
        var max = rd.scrollHeight - rd.clientHeight;
        rd.classList.toggle('nav-solid', rd.scrollTop > 6);
        bar.style.transform = 'scaleX(' + (max > 0 ? rd.scrollTop / max : 0).toFixed(4) + ')';
      });
    }, { passive: true });

    rd.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act="lang"]');
      if (!b) return;
      var en = !rd.classList.contains('lang-en');
      var anchor = rd.scrollTop > 400 ? rd.scrollTop / Math.max(1, rd.scrollHeight) : 0;
      rd.classList.toggle('lang-en', en); rd.classList.toggle('lang-zh', !en);
      rd.setAttribute('lang', en ? 'en' : 'zh'); stage.classList.toggle('is-en', en);
      runLayout(); if (anchor) rd.scrollTop = anchor * rd.scrollHeight;
    });
    if (window.ResizeObserver) new ResizeObserver(ctx.layout).observe(rd);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ctx.layout);
    rd.querySelectorAll('img').forEach(function (img) { if (!img.complete) img.addEventListener('load', ctx.layout, { once: true }); });
    document.addEventListener('mock:rm', ctx.layout);

    var h = document.createElement('span');
    h.className = 'hint rd-hint'; h.textContent = stage.dataset.hint || '';
    stage.appendChild(h);
    return ctx;
  }

  // Desktop ↔ 390px phone preview for one stage. The reader answers with container queries, so the phone
  // layout (no margin, slip from the slot) is the real narrow-screen code path, not a picture of it.
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-phone]');
    if (!b) return;
    var stage = document.getElementById(b.dataset.phone), on = !stage.classList.contains('phone');
    stage.classList.toggle('phone', on);
    b.setAttribute('aria-pressed', String(on));
    b.querySelector('.ph-t').textContent = on ? 'desktop · 桌面' : 'phone 390 · 手机';
  });

  window.RD = { mount: mount, post: POST };
})();
