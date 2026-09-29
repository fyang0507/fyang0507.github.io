/* r2-01 · the believable slice of each destination page (intro + first strip), copied from round 1's
   01-transitions-pages.js. The header (identity, status, object-tab nav) is built once and kept, so the
   nav can be animated into while the main content is swapped underneath it. */
(function () {
  var A = '../../assets/';

  var DEST = {
    writing:  { no: '01', en: 'writing',  zh: '在写', mark: '写', sprite: 'book',   status: '27 essays · 2015–2025', href: 'Writing.dc.html',  label: 'Writing — 在写' },
    building: { no: '02', en: 'building', zh: '在造', mark: '造', sprite: 'laptop', status: 'on the board · 7 件',   href: 'Building.dc.html', label: 'Building — 在造' },
    shooting: { no: '03', en: 'shooting', zh: '在拍', mark: '拍', sprite: 'camera', status: '107 frames · 2015–2025', href: 'Gallery.dc.html', label: 'Shooting — 在拍' },
    about:    { no: '04', en: 'about',    zh: '关于', mark: '于', sprite: 'frame',  status: 'field guide · vol. 01', href: 'About.dc.html',    label: 'About — 关于' }
  };
  var ORDER = ['writing', 'building', 'shooting', 'about'];

  var IDENTITY = '<a class="site-identity" href="../../index.html" data-go="home" aria-label="Fred Yang，弗雷德。继续写，继续造。首页">' +
    '<span class="site-identity-copy"><span class="site-identity-names"><span class="site-identity-name site-identity-name--en">Fred Yang</span>' +
    '<span class="site-identity-name site-identity-name--zh" lang="zh">弗雷德</span></span><span class="site-identity-tag" lang="zh">继续写，继续造</span>' +
    '<span class="site-identity-stickers" aria-hidden="true"><img class="site-identity-sticker site-identity-sticker--ghost" src="' + A + 'identity-sticker-ghost.png" srcset="' + A + 'identity-sticker-ghost@2x.png 2x" alt="">' +
    '<img class="site-identity-sticker site-identity-sticker--blob" src="' + A + 'identity-sticker-blob.png" srcset="' + A + 'identity-sticker-blob@2x.png 2x" alt=""></span></span></a>';

  function nav(active) {
    var h = '<nav class="site-index" aria-label="Primary navigation (mockup)">' +
      '<a class="site-home" href="../../index.html" data-go="home" aria-label="Home — 首页"><img class="site-home-object" src="' + A + 'sticker-peek.png" alt="" aria-hidden="true"><span class="site-nav-label"><span class="en">home</span></span></a>';
    ORDER.forEach(function (k) {
      var d = DEST[k];
      h += '<a class="site-tab site-tab--' + k + '" href="../../' + d.href + '" data-go="' + k + '" aria-label="' + d.label + '"' + (k === active ? ' aria-current="page"' : '') + '>' +
        '<span class="site-nav-object site-nav-' + d.sprite + '"></span><span class="site-nav-label"><span class="en">' + d.en + '</span></span></a>';
    });
    return h + '<span class="ms-tabmark" aria-hidden="true"><svg><path/></svg><i class="ms-dot"></i></span></nav>';
  }

  function title(d) {
    return '<div class="subpage-title-group ms-land"><div class="subpage-title-kicker"><span class="subpage-title-number">' + d.no + '</span><span class="subpage-title-en" lang="en">' + d.en + '</span></div>' +
      '<h1 class="subpage-title" lang="zh">' + d.zh.charAt(0) + '<span class="subpage-title-mark">' + d.mark + '</span>。</h1></div>';
  }
  function note(zh, en) {
    return '<div class="subpage-note ms-note-hand"><span lang="zh">' + zh + '</span><span lang="en">' + en + '</span></div>';
  }

  // ---- building: the corkboard, first cards pinned (real project data) ----
  var PIN = function (c) { return '<svg class="ms-pin" viewBox="0 0 20 42" aria-hidden="true" style="--pin:' + c + '"><ellipse cx="10" cy="39" rx="5.5" ry="2.2" fill="rgba(60,50,35,.3)"/><path d="M10 37 L10 9" stroke="#898989" stroke-width="2.6" stroke-linecap="round"/><circle cx="10" cy="8" r="8" fill="var(--pin)"/><circle cx="7.3" cy="5.3" r="2.3" fill="rgba(255,255,255,.58)"/></svg>'; };
  function project(id) { return (window.BUILDING_PROJECTS || []).find(function (p) { return p.id === id; }) || { title: id, note: '', capabilities: [], period: '' }; }
  function instrument(id, cls, hue) {
    var p = project(id);
    return '<div class="ms-card-in ' + cls + '" style="--hue:' + hue + '">' + PIN(hue) + '<div class="paper"><div class="inner">' +
      '<div class="ms-plabel"><i></i><b>agent-native</b> instrument</div><h3>' + p.title + '</h3><ul>' +
      (p.capabilities || []).map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul><div class="ms-period">' + p.period + ' · ' + p.lifecycle + '</div></div></div></div>';
  }
  function building() {
    var fa = project('fred-agent');
    return '<div class="ms-board"><div class="ms-board-bar"><span>projects · scroll →</span><span><i>←</i><i>→</i></span></div><div class="ms-cards">' +
      '<div class="ms-card-hl">' + PIN('#A5453A') + '<div class="paper"><div class="ms-plabel"><i></i><b>highlighted</b> system</div>' +
      '<div class="ms-hl-title">' + fa.title + '</div><p>' + fa.note + '</p><div class="ms-meta">' + fa.lifecycle + ' <em>/</em> ' + fa.period + ' <em>/</em> updated ' + fa.updated + '</div>' +
      '<span class="ms-cta">Enter the field notes <em>→</em></span></div></div>' +
      instrument('audio-processing-cli', 'ms-in1', '#3E6274') + instrument('publish-cli', 'ms-in2', '#7A4A63') + '</div></div>';
  }

  // ---- writing: the shelf (real essay titles, the live page's spine formulas) ----
  var POSTS = [['谷歌只想躺赢', 2026, 34], ['“我不受欢迎，怎么想都是你们的错！”', 2026, 44], ['被剪辑的神', 2026, 19], ['我们生活的故事05', 2025, 22, 5], ['萨克拉门托的缺席者', 2025, 18],
    ['职场食腐鸟', 2025, 18], ['夏威夷没有愤怒', 2025, 20], ['我们生活的故事04', 2024, 22, 4], ['那些看似无辜的', 2024, 22], ['香港森林', 2024, 17], ['我们生活的故事03', 2023, 22, 3],
    ['三城记', 2023, 22], ['我们生活的故事02', 2022, 22, 2], ['我们生活的故事01', 2021, 22, 1], ['救赎山', 2019, 18], ['被许诺和被荒芜的', 2019, 29], ['他和他的猫', 2019, 14],
    ['加州打卡', 2018, 25], ['纽约层积', 2018, 22], ['流与逆流', 2018, 19], ['社会人', 2017, 19], ['巡礼之年 - 瑞士', 2017, 32], ['片道东瀛', 2016, 18], ['为什么是阿赫兰', 2015, 10],
    ['巴黎的呼吸', 2015, 19], ['到南方去 到南方去', 2015, 18], ['复活随笔：关于流动和叠加的时间和生命', 2015, 62]];
  var TONES = ['#c9bda3', '#d8cbb0', '#b7ab8f', '#e4dac7'];
  function writing() {
    var books = '<span class="ms-book ms-book--tbc"><span>つづく</span></span>', years = '<span style="width:40px"></span>', last = null;
    POSTS.forEach(function (p, i) {
      var id = i + 1, s = p[3], w = s ? 30 : 22 + (id % 4) * 4, h = s ? 96 : 58 + ((id * 29) % 38), len = Math.max(p[0].length, p[2]);
      var fs = len > 11 ? Math.max(8.5, 11 - (len - 11) * 0.12) : 11;
      books += '<span class="ms-book' + (s ? ' ms-book--s' : '') + '" style="width:' + w + 'px;height:' + h + '%;background:' + (s ? '#3d362a' : TONES[id % 4]) + '">' +
        '<span style="font-size:' + fs.toFixed(1) + 'px;max-height:' + (s ? 68 : 84) + '%">' + p[0] + '</span>' + (s ? '<b>0' + s + '</b>' : '') + '</span>';
      years += '<span style="width:' + (w + 5) + 'px">' + (p[1] !== last ? '<i>' + p[1] + '</i>' : '') + '</span>';
      last = p[1];
    });
    var cover = '../../images/derived/covers/2026-08-29_谷歌只想躺赢-560.jpg';
    return '<div class="ms-shelfwrap"><div class="ms-shelf"><div class="ms-shelf-row">' + books + '<span class="ms-shelf-bird"></span></div><div class="ms-years">' + years + '</div></div>' +
      '<div class="ms-shelf-panel"><img src="' + cover + '" alt=""><div><div class="t">谷歌只想躺赢</div><div class="e">Google Just Wants to Coast to a Win</div><div class="m">2026·08 · commentary · ~8 min</div></div></div></div>' +
      '<div class="ms-deck"><span class="b2"></span><span class="b1"></span><div class="top"><img src="' + cover + '" alt=""><div class="t">谷歌只想躺赢</div><div class="e">Google Just Wants to Coast to a Win</div><div class="m">2026·08 · commentary · ~8 min</div></div></div>';
  }

  // ---- shooting: polaroids on the line (real photos, derived 400w) ----
  var PHOTOS = [['New York, NY', '2023·03', 'Architecture', '2023-03-lv', -2], ['Schloss Drachenburg, Germany', '2024·10', 'Street', '2024-10-schloss', 2.6], ['London, UK', '2023·12', 'Architecture', '2023-12-barbican-2', -1.4],
    ['New York, NY', '2022·06', 'People', '2022-06-parade', 1.2], ['Stanford, CA', '2018·12', 'Architecture', '2018-12-stanford', 2.2], ['New York, NY', '2023·08', 'Cityscape', '2023-08-nyc', -1]];
  function shooting() {
    return '<div class="ms-rack">' + PHOTOS.map(function (p) {
      return '<div class="ms-hang" style="--r:' + p[4] + 'deg"><div class="ms-peg"></div><div class="ms-pcard"><img src="../../images/derived/gallery/' + p[3] + '-400.jpg" alt="" loading="lazy">' +
        '<div class="loc">' + p[0] + '</div><div class="meta">' + p[1] + ' · ' + p[2] + '</div></div></div>';
    }).join('') + '</div>';
  }

  // ---- about: the specimen card, top half ----
  function about() {
    return '<div class="ms-spec ms-land"><div class="ms-spec-meta"><span>NO. 001-D</span><span>RUNTIME 01 · EXECUTE</span></div>' +
      '<div class="ms-spec-title">架桥者 <em>· BUILDER</em></div><div class="ms-spec-sub">日间形态 · DAY FORM</div><hr>' +
      '<div class="ms-spec-k">活动范围 RANGE</div><div class="ms-spec-v">模型与现实之间</div><div class="ms-spec-e">BETWEEN MODELS AND REAL LIFE</div>' +
      '<div class="ms-spec-grid"><img src="' + A + 'taku-sit-light.png" alt=""><dl>' +
      '<dt>任务 MISSION</dt><dd>让技术越过对话框<small>MOVE TECHNOLOGY BEYOND THE CHATBOX</small></dd>' +
      '<dt>处理 PROCESS</dt><dd>拆解 · 接线 · 验证<small>DECOMPOSE · CONNECT · VERIFY</small></dd>' +
      '<dt>输出 OUTPUT</dt><dd>AI和人类共存的世界<small>AGENTS THAT WORK IN THE HUMAN WORLD</small></dd></dl></div></div>';
  }

  function intro(k) {
    var d = DEST[k];
    if (k === 'about') return '<div class="ms-intro ms-intro--about"><div class="ms-about-kicker">field guide · set 01 · specimen 001</div><span class="ms-flip">翻面 / FLIP</span></div>';
    var n = k === 'writing' ? note('不得中行而与之，必也<em>狂狷</em>乎。', '<em>Action</em>, not understanding, changes the world.') :
      k === 'shooting' ? note('人，岁月，生活。', 'People, Years, Life.') : '';
    return '<div class="ms-intro"><header class="subpage-intro' + (n ? '' : ' subpage-intro--solo') + '">' + title(d) + n + '</header></div>';
  }
  var STRIPS = { building: building, writing: writing, shooting: shooting, about: about };

  function header(k) {
    return '<header class="site-shell-header"><div class="site-header-row">' + IDENTITY + '<div class="site-header-status">' + DEST[k].status + '</div></div>' + nav(k) + '</header>';
  }
  function main(k) { return intro(k) + '<div class="ms-strip ms-strip--' + k + '">' + STRIPS[k]() + '</div>'; }

  window.MSPages = { DEST: DEST, ORDER: ORDER, IDENTITY: IDENTITY, header: header, main: main };
})();
