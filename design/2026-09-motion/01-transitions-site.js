/* 01 · transitions — a miniature of the real site inside each candidate stage.
   Home = the real desk scene with the index.html hotspot geometry; page = the real object-tab nav
   (site-nav.css) plus a slice of the destination. The whole thing is laid out at a virtual viewport
   (1240×720 desktop, 390×760 phone) and scaled to fit the stage, so geometry is measured, never guessed.
   Each candidate supplies { toPage, toHome, tab } transitions; reduced motion swaps instantly. */
(function () {
  var P = window.MSPages, A = '../../assets/';
  var SW = 1448, SH = 1086;

  // Desk objects in scene-image pixels. frame = the element box on the desk; drawn = the object's ink bbox;
  // canvas = the surface the destination can appear on (candidate B).
  var OBJ = {
    building: { kind: 'cut', src: '01-cut-laptop.png', frame: [282, 261, 458, 334], drawn: [282, 261, 458, 334], hot: [20, 23, 31, 32],
      canvas: { pts: [[341, 278], [699, 278], [699, 483], [341, 483]] } },
    writing: { kind: 'book', frame: [521.9, 667.9, 309, 237.4], drawn: [527.3, 740.8, 298.3, 159.2], hot: [36, 62, 21, 22],
      canvas: { pts: [[560.7, 756.8], [677.1, 752.8], [794.8, 758.9], [806.2, 879.2], [677.1, 891.3], [548.7, 880.6]] } },
    about: { kind: 'frame', frame: [799.7, 358.7, 225, 210.8], drawn: [830.4, 363.1, 160.7, 185.6], hot: [56.5, 33, 12.5, 19],
      canvas: { pts: [[855.2, 377], [969.9, 381.4], [960.4, 531.1], [844.3, 525.6]] } },
    shooting: { kind: 'cut', src: '01-cut-camera.png', frame: [991, 691, 255, 177], drawn: [991, 691, 255, 177], hot: [68.5, 63, 18, 18],
      canvas: { circle: [1120, 811, 30] } }
  };
  // The same object's ink bbox inside its 60px nav sprite (site-nav.css art offsets included).
  var NAV = { writing: [5, 17.5, 51, 35], building: [7, 12, 46, 40.5], shooting: [6.5, 13, 47, 40], about: [11, 13.5, 37.5, 39.5] };

  function pct(v, of) { return (v / of * 100).toFixed(3) + '%'; }
  function objLayer(k) {
    var o = OBJ[k], f = o.frame;
    var box = 'left:' + pct(f[0], SW) + ';top:' + pct(f[1], SH) + ';width:' + pct(f[2], SW) + ';height:' + pct(f[3], SH);
    if (o.kind === 'cut') return '<i class="ms-patch" data-obj="' + k + '" style="' + box + ';-webkit-mask-image:url(' + o.src + ');mask-image:url(' + o.src + ')"></i><img class="ms-obj" data-obj="' + k + '" src="' + o.src + '" alt="" style="' + box + '">';
    return '<span class="ms-obj ms-obj--' + o.kind + '" data-obj="' + k + '" style="' + box + '"><i class="face"></i></span>';
  }
  function home() {
    var notes = [['writing', 27, 96, -1.5], ['building', 23.5, 5, -2], ['about', 66.5, 3.6, -2], ['shooting', 60, 96, -1]];
    var h = '<section class="ms-home" aria-label="home (mockup)"><header class="ms-head">' + P.IDENTITY + '</header><div class="ms-scene">' +
      '<img class="ms-desk" src="' + A + 'desk-scene2-light.png" alt="A hand-drawn desk: laptop, a mug, a plant, a film camera">' +
      ['building', 'shooting', 'writing', 'about'].map(objLayer).join('') + '<i class="ms-bird"></i>' +
      '<svg class="ms-arrows" viewBox="0 0 1448 1086" aria-hidden="true"><path d="M500 1035 Q620 1010 640 935"/><path d="M623 957 l17 -22 5 26"/><path d="M430 110 Q480 140 498 240"/><path d="M483 219 l15 21 7 -25"/>' +
      '<path d="M1042 108 Q1035 225 952 342"/><path d="M942 320 l10 24 18 -14"/><path d="M960 1035 Q1030 1000 1040 903"/><path d="M1026 925 l14 -22 9 25"/></svg>';
    notes.forEach(function (n) {
      var d = P.DEST[n[0]];
      h += '<a class="ms-note" data-go="' + n[0] + '" href="../../' + d.href + '" style="left:' + n[1] + '%;top:' + n[2] + '%"><span style="transform:rotate(' + n[3] + 'deg)">' + d.zh + ' ' + d.en + '</span></a>';
    });
    Object.keys(OBJ).forEach(function (k) {
      var o = OBJ[k].hot, d = P.DEST[k];
      h += '<a class="ms-hot" data-go="' + k + '" href="../../' + d.href + '" aria-label="' + d.label + '" style="left:' + o[0] + '%;top:' + o[1] + '%;width:' + o[2] + '%;height:' + o[3] + '%"></a>';
    });
    h += '</div><nav class="ms-mnav" aria-label="site (mockup)">' + P.ORDER.map(function (k) {
      var d = P.DEST[k]; return '<a data-go="' + k + '" href="../../' + d.href + '">' + d.zh + ' ' + d.en + '</a>';
    }).join('') + '</nav><div class="ms-fig">fig.01</div></section>';
    return h;
  }

  function MiniSite(stage, cfg) {
    this.stage = stage; this.cfg = cfg; this.view = 'home'; this.dest = 'building'; this.busy = false;
    this.hint = stage.querySelector('.hint');
    this.build();
    var self = this;
    if (window.ResizeObserver) new ResizeObserver(function () { self.fit(); }).observe(stage);
    stage.addEventListener('click', function (e) { self.onClick(e); });
  }
  MiniSite.OBJ = OBJ; MiniSite.NAV = NAV; MiniSite.SW = SW; MiniSite.SH = SH;

  MiniSite.prototype.build = function () {
    this.mobile = matchMedia('(max-width:640px)').matches;
    this.W = this.mobile ? 390 : 1240; this.H = this.mobile ? 760 : 720;
    if (this.vp) this.vp.remove();
    var vp = this.vp = document.createElement('div');
    vp.className = 'ms-vp ms' + (this.mobile ? ' m' : '') + (this.cfg.pen ? ' ms-pen' : '');
    vp.innerHTML = home() + '<section class="ms-page" aria-label="destination page (mockup)"></section>' + (this.cfg.extra ? this.cfg.extra(this) : '');
    this.stage.prepend(vp);
    this.homeEl = vp.querySelector('.ms-home'); this.page = vp.querySelector('.ms-page'); this.scene = vp.querySelector('.ms-scene');
    this.renderPage(this.dest);
    this.setView(this.view);
    this.fit();
  };
  MiniSite.prototype.fit = function () {
    var m = matchMedia('(max-width:640px)').matches;
    if (m !== this.mobile && !this.busy) return this.build();
    this.s = this.stage.clientWidth / this.W;
    this.vp.style.transform = 'scale(' + this.s + ')';
    this.stage.style.height = Math.floor(this.H * this.s) + 'px';
  };
  // rect of an element in virtual-viewport pixels
  MiniSite.prototype.rel = function (el) {
    var r = el.getBoundingClientRect(), v = this.vp.getBoundingClientRect(), s = v.width / this.W;
    return { x: (r.left - v.left) / s, y: (r.top - v.top) / s, w: r.width / s, h: r.height / s };
  };
  // scene-image pixels → virtual-viewport pixels
  MiniSite.prototype.scenePt = function (x, y) {
    var b = this.rel(this.scene), k = b.w / SW;
    return { x: b.x + x * k, y: b.y + y * k, k: k };
  };
  MiniSite.prototype.drawnBox = function (k) {
    var d = OBJ[k].drawn, p = this.scenePt(d[0], d[1]);
    return { x: p.x, y: p.y, w: d[2] * p.k, h: d[3] * p.k };
  };
  MiniSite.prototype.navBox = function (k) {
    var sp = this.rel(this.sprite(k)), u = sp.w / 60, n = NAV[k];
    return { x: sp.x + n[0] * u, y: sp.y + n[1] * u, w: n[2] * u, h: n[3] * u, u: u };
  };
  MiniSite.prototype.obj = function (k) { return this.vp.querySelector('.ms-obj[data-obj="' + k + '"]'); };
  MiniSite.prototype.patch = function (k) { return this.vp.querySelector('.ms-patch[data-obj="' + k + '"]'); };
  MiniSite.prototype.tab = function (k) { return this.page.querySelector('.site-tab--' + k); };
  MiniSite.prototype.sprite = function (k) { return this.page.querySelector('.site-tab--' + k + ' .site-nav-object'); };
  MiniSite.prototype.q = function (sel) { return this.page.querySelector(sel); };
  MiniSite.prototype.q2 = function (sel) { return this.homeEl.querySelector(sel); };

  MiniSite.prototype.renderPage = function (k) {
    this.page.innerHTML = P.page(k);
    this.page.dataset.dest = k;
    this.dest = k;
    if (this.cfg.pen) this.placeMark(true);
  };
  // candidate A's pen-drawn folder tab: sized to the live aria-current tab, seeded by one hand for every tab
  MiniSite.prototype.placeMark = function (drawn) {
    var mark = this.q('.ms-tabmark'), tab = this.tab(this.dest), navEl = this.q('.site-index');
    if (!mark || !tab) return null;
    var w = tab.offsetWidth, h = tab.offsetHeight, r = this.mobile ? 5 : 6, rnd = Pen.rng('folder-tab');
    var j = function () { return (rnd() - 0.5) * 0.9; };
    var d = 'M' + (0.5 + j()) + ' ' + h + ' L' + (0.3 + j()) + ' ' + (h * 0.5) + ' L' + (0.6) + ' ' + r + ' Q0.8 0.6 ' + r + ' 0.5' +
      ' L' + (w * 0.5) + ' ' + (0.2 + j()) + ' L' + (w - r) + ' ' + (0.7) + ' Q' + (w - 0.6) + ' 0.8 ' + (w - 0.5) + ' ' + r +
      ' L' + (w - 0.4 + j()) + ' ' + (h * 0.55) + ' L' + (w - 0.5) + ' ' + h;
    mark.style.left = tab.offsetLeft + 'px'; mark.style.top = (tab.offsetTop) + 'px';
    mark.style.width = w + 'px'; mark.style.height = h + 'px';
    var svg = mark.querySelector('svg'), p = mark.querySelector('path');
    svg.setAttribute('width', w); svg.setAttribute('height', h); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    p.setAttribute('d', d);
    var L = p.getTotalLength();
    p.style.strokeDasharray = L + ' ' + (L + 2);
    p.style.strokeDashoffset = drawn ? 0 : L;
    mark.classList.toggle('open', !!drawn);
    return p;
  };

  MiniSite.prototype.setView = function (v) {
    this.view = v; this.vp.dataset.view = v;
    if (v !== 'both') this.hintFor(v);
  };
  MiniSite.prototype.hintFor = function (v) {
    if (this.hint) this.hint.textContent = v === 'home' ? (this.mobile ? 'tap an object or a link' : 'click any object on the desk ↗') : (this.mobile ? 'try a tab · home returns' : '↑ another tab · or “home” to return');
  };
  MiniSite.prototype.onClick = function (e) {
    var a = e.target.closest('[data-go]');
    if (!a || !this.vp.contains(a)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; // let the real page open
    e.preventDefault();
    this.go(a.dataset.go);
  };
  MiniSite.prototype.go = function (to) {
    if (this.busy) return null;
    if (this.view === 'home') return to === 'home' ? null : this.run('toPage', to);
    if (to === 'home') return this.run('toHome', to);
    return to === this.dest ? null : this.run('tab', to);
  };
  MiniSite.prototype.run = function (kind, to) {
    var self = this, hadFocus = this.stage.contains(document.activeElement);
    if (this.pending) this.pending();   // finish the previous transition's settle before starting anew
    this.busy = true; this.vp.classList.add('busy');
    var p = Pen.reduced() ? this.instant(kind, to) : this.cfg[kind](this, to);
    return Promise.resolve(p).catch(function (err) { console.error(err); self.instant(kind, to); }).then(function () {
      self.busy = false; self.vp.classList.remove('busy');
      var f = self.view === 'home' ? self.vp.querySelector('.ms-hot[data-go="' + (kind === 'toHome' ? self.dest : to) + '"]') : self.tab(self.dest);
      if (f && hadFocus) f.focus({ preventScroll: true });
    });
  };
  MiniSite.prototype.instant = function (kind, to) {
    if (this.pending) this.pending();
    this.vp.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); });
    if (kind === 'toHome') this.setView('home');
    else { this.renderPage(to); this.setView('page'); }
  };
  // replay: back to the desk, then a small tour — home → dest, a tab hop, and back home
  MiniSite.prototype.tour = async function (seq) {
    if (this.busy) return;
    if (this.pending) this.pending();
    this.view = 'home'; this.build();
    for (var i = 0; i < seq.length; i++) {
      await Motion.sleep(i ? 900 : 450);
      var p = this.go(seq[i]);
      if (p) await p;
    }
  };

  window.MiniSite = MiniSite;
})();
