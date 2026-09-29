/* r2-01 · a miniature of the real site inside a candidate stage. Home = the desk (taken apart by
   r2-01-desk.js); page = the real object-tab nav from ../../site-nav.css plus a slice of the destination.
   Laid out at the real viewport (1440 × 900 desktop, 390 × 844 phone) and scaled to fit, so every
   coordinate is the one a visitor would get, measured from the DOM, never guessed.
   The site owns layout, measurement, input and the clock; a director (r2-01-a.js) owns the motion.
   Input is never blocked: a click mid-transition retargets whatever is in flight. */
(function () {
  var P = window.MSPages, D = window.R2Desk;

  function MiniSite(stage, cfg) {
    this.stage = stage; this.cfg = cfg; this.view = 'home'; this.dest = 'building';
    this.hint = stage.querySelector('.hint');
    this.clock = new Phys.Clock(this.tick.bind(this));
    this.waiters = [];
    this.build();
    var self = this;
    if (window.ResizeObserver) new ResizeObserver(function () { self.fit(); }).observe(stage);
    stage.addEventListener('click', function (e) { self.onClick(e); });
  }

  MiniSite.prototype.build = function () {
    this.mobile = matchMedia('(max-width:640px)').matches;
    this.W = this.mobile ? 390 : 1440; this.H = this.mobile ? 844 : 900;
    if (this.vp) this.vp.remove();
    var vp = this.vp = document.createElement('div');
    vp.className = 'ms-vp ms' + (this.mobile ? ' m' : '');
    vp.innerHTML = D.home(P) + '<section class="ms-page" aria-label="destination page (mockup)">' + P.header(this.dest) + '<main class="ms-main"></main></section>' +
      '<div class="r2-over" aria-hidden="true"><svg class="r2-rule"><path class="a"/><path class="b"/></svg></div>';
    this.stage.prepend(vp);
    this.homeEl = vp.querySelector('.ms-home'); this.page = vp.querySelector('.ms-page'); this.scene = vp.querySelector('.ms-scene');
    this.main = vp.querySelector('.ms-main'); this.over = vp.querySelector('.r2-over');
    this.renderMain(this.dest);
    this.fit();
    this.cfg.director.init(this);
    this.setView(this.view);
  };
  MiniSite.prototype.fit = function () {
    var m = matchMedia('(max-width:640px)').matches;
    if (m !== this.mobile && !this.clock.on) { this.build(); return; }
    this.s = this.stage.clientWidth / this.W;
    this.vp.style.transform = 'scale(' + this.s + ')';
    this.stage.style.height = Math.floor(this.H * this.s) + 'px';
  };

  // ---- measurement, all in virtual-viewport px ----
  MiniSite.prototype.rel = function (el) {
    var r = el.getBoundingClientRect(), v = this.vp.getBoundingClientRect(), s = v.width / this.W;
    return { x: (r.left - v.left) / s, y: (r.top - v.top) / s, w: r.width / s, h: r.height / s };
  };
  // (the scene, the index and the tabs are never transformed themselves, so their boxes are layout truth)
  MiniSite.prototype.sceneBox = function () { var b = this.rel(this.scene); b.k = b.w / D.SW; return b; };
  MiniSite.prototype.drawnBox = function (k) {
    var d = D.OBJ[k].drawn, b = this.sceneBox();
    return { x: b.x + d[0] * b.k, y: b.y + d[1] * b.k, w: d[2] * b.k, h: d[3] * b.k };
  };
  // the nav sprite's ink box, from its tab: site-nav.css centres the 60px sprite (left:50% + translateX(-50%)),
  // stands it 22px above the tab bottom (label 8 + 10 + gap 4) and scales it about bottom centre (0.72 on phones)
  MiniSite.prototype.navBox = function (k) {
    var t = this.tabBox(k), u = this.mobile ? 0.72 : 1, n = D.NAV[k];
    var x = t.x + t.w / 2 - 30 * u, y = t.y + t.h - 22 - 60 * u;
    return { x: x + n[0] * u, y: y + n[1] * u, w: n[2] * u, h: n[3] * u, u: u };
  };
  MiniSite.prototype.indexBox = function () { return this.rel(this.q('.site-index')); };
  MiniSite.prototype.tabBox = function (k) { return this.rel(this.tab(k)); };
  MiniSite.prototype.tab = function (k) { return this.page.querySelector('.site-tab--' + k); };
  MiniSite.prototype.sprite = function (k) { return this.page.querySelector('.site-tab--' + k + ' .site-nav-object'); };
  MiniSite.prototype.q = function (sel) { return this.page.querySelector(sel); };
  MiniSite.prototype.qh = function (sel) { return this.homeEl.querySelector(sel); };

  // ---- the page: header stays, main is swapped ----
  MiniSite.prototype.renderMain = function (k) {
    this.dest = k;
    this.main.innerHTML = P.main(k);
    this.page.dataset.dest = k;
    this.q('.site-header-status').textContent = P.DEST[k].status;
    var self = this;
    P.ORDER.forEach(function (j) { var t = self.tab(j); if (j === k) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
  };
  MiniSite.prototype.setView = function (v) {
    this.view = v; this.vp.dataset.view = v;
    if (this.hint) this.hint.textContent = v === 'home' ? (this.mobile ? 'tap an object or a link' : 'click any object on the desk ↗') : (this.mobile ? 'try a tab · home returns' : '↑ another tab · or “home” to return');
  };

  // ---- input: always accepted; the director retargets whatever is in flight ----
  MiniSite.prototype.onClick = function (e) {
    var a = e.target.closest('[data-go]');
    if (!a || !this.vp.contains(a)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; // let the real page open
    e.preventDefault();
    this.hadFocus = this.hadFocus || this.stage.contains(document.activeElement);
    // the focus ring must not hang in mid-air over a desk that is leaving; it lands on the destination
    if (this.hadFocus && !Pen.reduced()) document.activeElement.blur();
    this.go(a.dataset.go);
  };
  MiniSite.prototype.go = function (to) {
    var d = this.cfg.director, st = this.st;
    if (to === 'home') { if (st.view === 'home') return; d.toHome(this); }
    else if (st.view === 'home') d.toPage(this, to);
    else if (to !== this.dest) d.tab(this, to);
    else return;
    if (Pen.reduced()) { d.finish(this); this.settled(); return; }
    this.clock.start();
  };
  MiniSite.prototype.tick = function (dt) {
    var alive = this.cfg.director.tick(this, dt);
    if (!alive) this.settled();
    return alive;
  };
  MiniSite.prototype.settled = function () {
    this.cfg.director.rest(this);
    var f = this.st.view === 'home' ? this.vp.querySelector('.ms-hot[data-go="' + this.dest + '"]') : this.tab(this.dest);
    if (f && this.hadFocus) f.focus({ preventScroll: true });
    this.hadFocus = false;
    var w = this.waiters; this.waiters = [];
    w.forEach(function (r) { r(); });
  };
  MiniSite.prototype.relayout = function () {
    if (this.clock.on) return;
    this.cfg.director.finish(this); this.cfg.director.rest(this);
  };
  MiniSite.prototype.whenRest = function () {
    var self = this;
    return this.clock.on ? new Promise(function (r) { self.waiters.push(r); }) : Promise.resolve();
  };
  // replay: back to the desk, then a small tour — home → dest, a tab hop, and back home
  MiniSite.prototype.tour = async function (seq) {
    this.clock.on = false; this.view = 'home'; this.build();
    for (var i = 0; i < seq.length; i++) {
      await new Promise(function (r) { setTimeout(r, i ? 900 : 450); });
      this.go(seq[i]);
      await this.whenRest();
    }
  };

  window.MiniSite = MiniSite;
})();
