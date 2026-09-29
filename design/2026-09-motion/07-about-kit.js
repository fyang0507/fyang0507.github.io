/* 07 · shared kit for the specimen-card board: the two faces (real copy from About.dc.html),
   the self-drawing radar, a spring integrator, the FLIP control and the social row.
   Candidates A/B/C (07-about-{a,b,c}.js) only add the mechanism around these parts. */
(function () {
  var A = '../../assets/';

  /* ---------- faces ---------- */
  function row(zh, en, czh, cen) {
    return '<div class="sc-row"><dt class="sc-label"><span lang="zh">' + zh + '</span> ' + en + '</dt>' +
      '<dd class="sc-copy"><span class="sc-zh" lang="zh">' + czh + '</span><span class="sc-en" lang="en">' + cen + '</span></dd></div>';
  }
  function dayFace() {
    return '<div class="sc-meta"><span>NO. 001-D</span><span>RUNTIME 01 · EXECUTE</span></div>' +
      '<h3 class="sc-title"><span lang="zh">架桥者</span> <span class="sc-title-en" lang="en">· BUILDER</span></h3>' +
      '<div class="sc-form"><span lang="zh">日间形态</span> · DAY FORM</div>' +
      '<section class="sc-range" aria-label="活动范围 Range"><span class="sc-label"><span lang="zh">活动范围</span> RANGE</span>' +
      '<div class="sc-copy"><span class="sc-zh" lang="zh">模型与现实之间</span><span class="sc-en" lang="en">BETWEEN MODELS AND REAL LIFE</span></div></section>' +
      '<div class="sc-front"><section class="sc-figpanel" aria-label="日间形态人物插画 · Day-form figure">' +
      '<div class="sc-figure"><img src="' + A + 'taku-sit-light.png" alt="Seated figure holding a cup" draggable="false"></div>' +
      '<aside class="sc-note"><span class="sc-zh" lang="zh">“别让Agent 困在对话框里。”</span><span class="sc-en" lang="en">“DON’T TRAP THE AGENT IN A CHATBOX.”</span></aside></section>' +
      '<dl class="sc-fields">' +
      row('任务', 'MISSION', '让技术越过对话框', 'MOVE TECHNOLOGY BEYOND THE CHATBOX') +
      row('处理', 'PROCESS', '拆解 · 接线 · 验证', 'DECOMPOSE · CONNECT · VERIFY') +
      row('输出', 'OUTPUT', 'AI和人类共存的世界', 'AGENTS THAT WORK IN THE HUMAN WORLD') +
      row('异常', 'EXCEPTION', '"凑合用吧。"', '"WE\'LL HAVE TO MAKE DO."') +
      row('唤醒词', 'WAKE WORD', '"先给我看日志。"', '"SHOW ME THE LOGS FIRST."') +
      '</dl></div>';
  }
  function nightFace(uid) {
    return '<div class="sc-meta"><span>NO. 001-N</span><span>RUNTIME 02 · MEMORIZE</span></div>' +
      '<h3 class="sc-title"><span lang="zh">见证者</span> <span class="sc-title-en" lang="en">· WITNESS</span></h3>' +
      '<div class="sc-form"><span lang="zh">夜间形态</span> · NIGHT FORM</div>' +
      '<div class="sc-ability"><figure class="sc-radar-panel">' + radarSVG(uid) + '</figure>' +
      '<figure class="sc-stand"><figcaption class="sc-stand-name"><span class="sc-stand-k"><span lang="zh">替身</span> STAND</span>' +
      '<strong><span lang="zh">第二声部</span> · <span lang="en">SECOND VOICE</span></strong></figcaption>' +
      '<img src="' + A + 'second-voice-original.png" alt="第二声部（Second Voice），见证者的替身形象" draggable="false"></figure></div>' +
      '<section class="sc-special" aria-label="特殊技能 Special"><span class="sc-label"><span lang="zh">特殊技能</span> GUARD SKILL</span>' +
      '<div class="sc-special-name"><span class="sc-zh" lang="zh">遗声回响 HEAR THE UNHEARD</span></div></section>';
  }

  /* ---------- radar: same geometry as About.dc.html:268–304, but every mark is a pen stroke ---------- */
  var CX = 260, CY = 240, AX = [-90, -30, 30, 90, 150, 210], GRADE = [5, 4, 4, 5, 1, 3]; // A B B A E C
  function f(n) { return Math.round(n * 10) / 10; }
  function pt(deg, r) { var a = deg * Math.PI / 180; return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]; }
  // A hand-drawn ring: starts upper-left, a little more than one lap, slow wobble. Seeded by radius only,
  // so every copy of the card gets the same circles — one person drew them once.
  function ring(r) {
    var rnd = Pen.rng('radar-ring-' + r), a0 = -2.5 + rnd() * .7, laps = 1.05 + rnd() * .04, ph = rnd() * 6, n = Math.max(16, Math.round(r / 4)), pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = a0 + t * laps * Math.PI * 2, rr = r * (1 + Math.sin(t * 4.3 + ph) * .012) + (t - .5) * 1.4;
      pts.push([CX + Math.cos(a) * rr, CY + Math.sin(a) * rr]);
    }
    return Pen.smooth(pts);
  }
  function spoke(deg, i) {
    var rnd = Pen.rng('radar-spoke-' + i), e = pt(deg, 121), m = pt(deg + (rnd() - .5) * 1.4, 62);
    return 'M' + CX + ' ' + CY + ' Q' + f(m[0]) + ' ' + f(m[1]) + ' ' + f(e[0]) + ' ' + f(e[1]);
  }
  function dataPts() { return AX.map(function (d, i) { return pt(d, GRADE[i] * 24); }); }
  // The polygon keeps sharp corners (it is data), but each edge bows a hair and the pen runs past the start.
  function polyPath() {
    var p = dataPts(), rnd = Pen.rng('radar-poly'), d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
    for (var i = 1; i <= 6; i++) {
      var a = p[i - 1], b = p[i % 6], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, bow = (rnd() - .5) * 3.2;
      d += ' Q' + f(mx - dy / L * bow) + ' ' + f(my + dx / L * bow) + ' ' + f(b[0]) + ' ' + f(b[1]);
    }
    var o = [p[0][0] + (p[1][0] - p[0][0]) * .12, p[0][1] + (p[1][1] - p[0][1]) * .12];
    return d + ' L' + f(o[0]) + ' ' + f(o[1]);
  }
  function radarSVG(uid) {
    var s = '<svg class="sc-radar" viewBox="0 0 520 500" role="img" aria-labelledby="' + uid + '-t ' + uid + '-d">' +
      '<title id="' + uid + '-t">Night-form ability radar · 夜间六维能力雷达图</title>' +
      '<desc id="' + uid + '-d">Six abilities rated from A to E: observation A, doublethinking B, omission detection B, self-audit A, coffee endurance E, and social battery C. 六项能力从 A 到 E：观察入微 A，双重思考 B，遗忘侦测 B，自审回路 A，咖啡耐性 E，社交电量 C。</desc>' +
      '<defs><pattern id="' + uid + '-hatch" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(-34)"><path d="M2 -1 V11" stroke="#EE8E72" stroke-width="2.2" stroke-linecap="round"/></pattern></defs>' +
      '<g class="rd-grid" aria-hidden="true">';
    [24, 48, 72, 96, 120].forEach(function (r) { s += '<path class="rd-ring" d="' + ring(r) + '"/>'; });
    AX.forEach(function (d, i) { s += '<path class="rd-spoke" d="' + spoke(d, i) + '"/>'; });
    var p = dataPts();
    s += '</g><path class="rd-fill" aria-hidden="true" fill="url(#' + uid + '-hatch)" d="M' + p.map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join(' L') + ' Z"/>' +
      '<path class="rd-poly" aria-hidden="true" d="' + polyPath() + '"/><g class="rd-pts" aria-hidden="true">';
    p.forEach(function (q) { s += '<circle cx="' + f(q[0]) + '" cy="' + f(q[1]) + '" r="5"/>'; });
    s += '</g><g class="rd-level" aria-hidden="true"><text x="270" y="126">A</text><text x="270" y="150">B</text><text x="270" y="174">C</text><text x="270" y="198">D</text><text x="270" y="222">E</text></g>' +
      '<g class="rd-label">' +
      '<text x="260" y="62" text-anchor="middle"><tspan x="260" lang="zh">观察入微</tspan><tspan class="rd-en" x="260" dy="21">OBSERVATION</tspan></text>' +
      '<text x="370" y="107" text-anchor="start"><tspan x="370" lang="zh">双重思考</tspan><tspan class="rd-en" x="370" dy="21">DOUBLETHINKING</tspan></text>' +
      '<text x="370" y="337" text-anchor="start"><tspan x="370" lang="zh">遗忘侦测</tspan><tspan class="rd-en" x="370" dy="21">OMISSION</tspan><tspan class="rd-en" x="370" dy="18">DETECTION</tspan></text>' +
      '<text x="260" y="398" text-anchor="middle"><tspan x="260" lang="zh">自审回路</tspan><tspan class="rd-en" x="260" dy="21">SELF-AUDIT</tspan></text>' +
      '<text x="150" y="337" text-anchor="end"><tspan x="150" lang="zh">咖啡耐性</tspan><tspan class="rd-en" x="150" dy="21">COFFEE</tspan><tspan class="rd-en" x="150" dy="18">ENDURANCE</tspan></text>' +
      '<text x="150" y="107" text-anchor="end"><tspan x="150" lang="zh">社交电量</tspan><tspan class="rd-en" x="150" dy="21">SOCIAL</tspan><tspan class="rd-en" x="150" dy="18">BATTERY</tspan></text>' +
      '</g></svg>';
    return s;
  }

  // The witness takes notes: rings (inner → outer) and spokes in single passes, the polygon in one
  // pass, then the six grades stamped on held beats — hand's clock, ~8 fps, no easing on the dots.
  function Radar(svg) {
    var strokes = [].slice.call(svg.querySelectorAll('.rd-ring, .rd-spoke, .rd-poly')),
      rings = [].slice.call(svg.querySelectorAll('.rd-ring')), spokes = [].slice.call(svg.querySelectorAll('.rd-spoke')),
      poly = svg.querySelector('.rd-poly'), fill = svg.querySelector('.rd-fill'), dots = [].slice.call(svg.querySelectorAll('.rd-pts circle')),
      timers = [], state = 'empty';
    function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function stop() { timers.forEach(clearTimeout); timers = []; strokes.forEach(function (p) { p.getAnimations().forEach(function (a) { a.cancel(); }); }); }
    function set(p, on) { var L = p.getTotalLength(); p.style.strokeDasharray = L + ' ' + (L + 2); p.style.strokeDashoffset = on ? 0 : L; }
    function reset() { stop(); strokes.forEach(function (p) { set(p, false); }); fill.style.opacity = 0; dots.forEach(function (c) { c.style.opacity = 0; }); state = 'empty'; }
    function show() { stop(); strokes.forEach(function (p) { set(p, true); }); fill.style.opacity = 1; dots.forEach(function (c) { c.style.opacity = 1; c.setAttribute('r', 5); }); state = 'drawn'; }
    function draw() {
      if (Pen.reduced()) return show();
      reset(); state = 'drawing';
      rings.forEach(function (p, i) { Pen.draw(p, { delay: i * 95, duration: 190 + i * 45 }); });
      spokes.forEach(function (p, i) { Pen.draw(p, { delay: 470 + i * 45, duration: 130 }); });
      Pen.draw(poly, { delay: 800, duration: 760 });
      var t0 = 1600;
      later(t0, function () { fill.style.opacity = .45; });
      later(t0 + 125, function () { fill.style.opacity = 1; });
      dots.forEach(function (c, i) {
        later(t0 + i * 125, function () { c.setAttribute('r', 8); c.style.opacity = 1; });
        later(t0 + i * 125 + 85, function () { c.setAttribute('r', 5); });
      });
      later(t0 + 6 * 125 + 90, function () { state = 'drawn'; });
    }
    reset();
    return { draw: draw, reset: reset, show: show, get state() { return state; } };
  }

  /* ---------- physics clock ---------- */
  // Damped spring on one number. k = stiffness, z = damping ratio (≈.7 → one small overshoot).
  function Spring(x, k, z) { this.x = x; this.to = x; this.v = 0; this.k = k; this.c = 2 * z * Math.sqrt(k); }
  Spring.prototype.step = function (dt) {
    for (var i = 0; i < 4; i++) { var h = dt / 4, a = -this.k * (this.x - this.to) - this.c * this.v; this.v += a * h; this.x += this.v * h; }
  };
  Spring.prototype.rest = function (eps) { return Math.abs(this.x - this.to) < eps && Math.abs(this.v) < eps * 8; };
  Spring.prototype.snap = function (x) { this.x = this.to = x; this.v = 0; };
  // One rAF loop that sleeps when tick() returns false and wakes on kick().
  function Loop(tick) {
    var id = 0, last = 0;
    function frame(t) { var dt = Math.min(.034, (t - last) / 1000 || .016); last = t; id = tick(dt) ? requestAnimationFrame(frame) : 0; }
    return { kick: function () { if (!id) { last = performance.now(); id = requestAnimationFrame(frame); } }, get running() { return !!id; } };
  }

  /* ---------- controls ---------- */
  var ICON = {
    flip: '<path d="M5.4 9.6C6.7 6.4 9.5 4.7 12.6 4.8c3.8.2 6.5 3.3 6.4 7.1"/><path d="M16.7 10.3l2.3 1.9 2-2.5"/><path d="M18.6 14.4c-1.3 3.2-4.1 4.9-7.2 4.8-3.8-.2-6.5-3.3-6.4-7.1"/><path d="M7.3 13.7L5 11.8l-2 2.5"/>',
    github: '<path d="M5.1 9.6c0-2 .5-3.7 1.1-4.9l2.5 1.6c2.2-.7 4.4-.7 6.6 0l2.5-1.6c.6 1.2 1.1 2.9 1.1 4.9 0 4.3-3 6.6-6.9 6.6S5.1 13.9 5.1 9.6z"/><path d="M9.4 16.1c-.3 1.5-.3 2.9-.1 4.5"/><path d="M14.6 16.2c.3 1.5.3 2.9.1 4.4"/><path d="M9.3 18.5c-2.1.6-3.6-.2-4.4-1.8"/>',
    linkedin: '<path d="M5.3 10.3c.1 3 .1 6.1 0 9.1"/><path d="M5.2 6.5h.1"/><path d="M9.7 19.4c.1-3 .1-6 0-9"/><path d="M9.8 13.4c.9-2.3 5.8-3.6 6.6-.3.4 1.6.2 4.3.3 6.3"/>',
    instagram: '<path d="M7.4 3.6c3-.3 6.4-.3 9.4.1 2.2.3 3.4 1.5 3.6 3.7.3 3 .3 6.4-.1 9.4-.3 2.2-1.5 3.4-3.7 3.6-3 .3-6.4.3-9.4-.1-2.2-.3-3.4-1.5-3.6-3.7-.3-3-.3-6.4.1-9.4.3-2.2 1.6-3.4 3.7-3.6z"/><path d="M12.3 8.3c2.1 0 3.5 1.7 3.4 3.8-.1 2.1-1.7 3.7-3.8 3.6-2.1-.1-3.7-1.7-3.6-3.8.1-2 1.8-3.6 4.1-3.5"/><path d="M17.2 6.8h.1"/>',
    email: '<path d="M3.6 6.4c5.4-.4 11.4-.4 16.8.1.3 3.7.2 7.5-.1 11.2-5.3.4-11.3.4-16.6-.1-.4-3.6-.4-7.6-.1-11.2z"/><path d="M3.9 6.8c2.7 2.6 5.4 4.8 8.1 6.4 2.7-1.6 5.4-3.8 8.1-6.3"/>',
    wechat: '<path d="M9.4 4.8c-3.8 0-6.6 2.4-6.6 5.4 0 1.7.9 3.1 2.3 4.1l-.6 2.3 2.7-1.3c.7.2 1.4.3 2.2.3 3.8 0 6.6-2.4 6.6-5.4S13.2 4.8 9.4 4.8z"/><path d="M16.3 9.6c2.9.4 5 2.3 5 4.7 0 1.3-.7 2.5-1.8 3.3l.4 1.8-2.1-1c-.5.1-1 .2-1.6.2-2.6 0-4.7-1.4-5.3-3.2"/>'
  };
  function svgIcon(name, cls) { return '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' + ICON[name] + '</svg>'; }
  // Pen underline on the label; the control's own hover/focus drives it (board 02 grammar: underline = "this one?").
  function penHover(trigger, label, seed) {
    var pen = Pen.annotate(label, 'underline', { manual: true, width: 2, seed: seed, gap: 2 });
    trigger.addEventListener('pointerenter', pen.show); trigger.addEventListener('pointerleave', function () { if (document.activeElement !== trigger) pen.hide(); });
    trigger.addEventListener('focus', function () { if (trigger.matches(':focus-visible')) pen.show(); }); trigger.addEventListener('blur', pen.hide);
    return pen;
  }
  // 翻面 / FLIP — no pill, no shimmer. A turn glyph (two arcs: it looks the same after half a turn) and a pen underline on hover.
  function flipButton(controls) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'flip'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-controls', controls);
    b.setAttribute('aria-label', '切换到夜间形态。Show night form.');
    b.innerHTML = svgIcon('flip', 'flip-ico') + '<span class="flip-t"><span lang="zh">翻面</span> / FLIP</span>';
    penHover(b, b.querySelector('.flip-t'), 'flip-' + controls);
    b.setState = function (night) {
      b.setAttribute('aria-pressed', night ? 'true' : 'false');
      b.setAttribute('aria-label', night ? '切换到日间形态。Show day form.' : '切换到夜间形态。Show night form.');
    };
    return b;
  }
  // Social row: line icons drawn like the card's own pen, bilingual text labels, pen underline on hover.
  function socialRow(uid) {
    var L = [['https://github.com/fyang0507', 'github', 'GitHub', '代码'], ['https://www.linkedin.com/in/fyang0507/', 'linkedin', 'LinkedIn', '履历'],
      ['https://www.instagram.com/yangruntong/', 'instagram', 'Instagram', '照片'], ['mailto:fredyang0507@gmail.com', 'email', 'Email', '写信']];
    var nav = document.createElement('nav');
    nav.className = 'soc-row'; nav.setAttribute('aria-label', 'Contact · 联系');
    nav.innerHTML = L.map(function (l) {
      var ext = l[0].indexOf('http') === 0 ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a class="soc" href="' + l[0] + '"' + ext + '>' + svgIcon(l[1], 'soc-ico') + '<span class="soc-t"><span class="soc-en">' + l[2] + '</span> <span class="soc-zh" lang="zh">' + l[3] + '</span></span></a>';
    }).join('') +
      '<span class="soc-wx"><button type="button" class="soc" aria-expanded="false" aria-controls="' + uid + '-qr">' + svgIcon('wechat', 'soc-ico') +
      '<span class="soc-t"><span class="soc-en">WeChat</span> <span class="soc-zh" lang="zh">公众号</span></span></button>' +
      '<span class="qr-slip" id="' + uid + '-qr" role="dialog" aria-label="WeChat QR code · 微信公众号二维码"><img src="../../images/profile/wechat-qr.jpg" alt="WeChat QR code" width="126" height="126">' +
      '<span class="qr-cap">微信公众号 · Scan with WeChat</span></span></span>';
    [].forEach.call(nav.querySelectorAll('.soc'), function (a) { penHover(a, a.querySelector('.soc-t'), 'soc-' + a.textContent); });
    var btn = nav.querySelector('.soc-wx .soc'), slip = nav.querySelector('.qr-slip');
    function open(on) { btn.setAttribute('aria-expanded', on ? 'true' : 'false'); slip.classList.toggle('on', on); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); open(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('click', function (e) { if (!slip.contains(e.target)) open(false); });
    nav.addEventListener('keydown', function (e) { if (e.key === 'Escape') { open(false); btn.focus(); } });
    return nav;
  }

  window.SC = { dayFace: dayFace, nightFace: nightFace, Radar: Radar, Spring: Spring, Loop: Loop, flipButton: flipButton, socialRow: socialRow,
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); } };
})();
