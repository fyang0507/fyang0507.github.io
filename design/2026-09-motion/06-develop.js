/* 06-develop.js — instant-film development, first view only.
   A print starts as a flat grey-green chemical square. It develops only when BOTH are true:
   its bytes have decoded (img.decode()) and at least 40% of it is in view. Development is
   opacity (the chemical layer clearing) + filter (from flat, warm, desaturated to full) — no blur,
   no sweep. Developed ids are remembered in sessionStorage, so a second visit is calm. */
(function () {
  function F(se, sa, co, br, hu) {
    return 'sepia(' + se + ') saturate(' + sa + ') contrast(' + co + ') brightness(' + br + ') hue-rotate(' + hu + 'deg)';
  }
  // Shadows arrive first (contrast lifts from a milky base), then colour warms, then it neutralises.
  var IMG = [
    { offset: 0, filter: F(0.5, 0.2, 0.26, 1.34, 38) },
    { offset: 0.3, filter: F(0.55, 0.32, 0.5, 1.2, 22) },
    { offset: 0.64, filter: F(0.4, 0.72, 0.8, 1.07, -5) },
    { offset: 1, filter: F(0, 1, 1, 1, 0) }
  ];
  var CHEM = [
    { offset: 0, opacity: 1 }, { offset: 0.2, opacity: 0.8 }, { offset: 0.48, opacity: 0.32 },
    { offset: 0.8, opacity: 0.06 }, { offset: 1, opacity: 0 }
  ];

  function Develop(key, opt) {
    this.key = key; this.opt = opt || {}; this.items = [];
    try { this.done = new Set(JSON.parse(sessionStorage.getItem(key) || '[]')); } catch (e) { this.done = new Set(); }
    var self = this;
    // Fetch a little ahead of the viewport; develop only once it is actually seen.
    this.near = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) self.load(e.target._dev); });
    }, { rootMargin: '300px 0px' });
    this.seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.intersectionRatio >= 0.4) { var s = e.target._dev; s.seen = true; self.maybe(s); } });
    }, { threshold: [0.4] });
  }

  Develop.prototype.add = function (h) {
    var s = { h: h, id: h.p.id, seen: false, decoded: false, loading: false, started: false };
    h.el._dev = s; this.items.push(s);
    h.print.classList.toggle('undev', !this.done.has(s.id) && !Pen.reduced());
    this.near.observe(h.el); this.seen.observe(h.el);
  };

  Develop.prototype.load = function (s) {
    if (s.loading) return; s.loading = true; this.near.unobserve(s.h.el);
    var self = this, img = s.h.img, delay = this.opt.slow ? this.opt.slow(s.id) : 0;
    s.timer = setTimeout(function () {
      img.srcset = s.h.p.srcset; img.src = s.h.p.src;
      var ok = function () { if (img.getAttribute('src')) { s.decoded = true; self.maybe(s); } };
      img.decode().then(ok, ok);
    }, delay);
  };

  Develop.prototype.maybe = function (s) {
    if (!s.seen || !s.decoded || s.started) return;
    s.started = true; this.seen.unobserve(s.h.el);
    var pr = s.h.print;
    if (this.done.has(s.id) || Pen.reduced()) { pr.classList.remove('undev'); return; }
    this.done.add(s.id);
    try { sessionStorage.setItem(this.key, JSON.stringify(Array.from(this.done))); } catch (e) { /* private mode */ }
    // Each print's chemistry runs a little differently: a stable per-photo duration, not a choreographed stagger.
    var dur = 2350 + Math.round(Pen.rng('dev' + s.id)() * 500);
    s.anims = [s.h.img.animate(IMG, { duration: dur, easing: 'linear' }),
      s.h.chem.animate(CHEM, { duration: dur, easing: 'linear', fill: 'backwards' })];
    pr.classList.remove('undev');
    if (this.opt.onStart) this.opt.onStart(s);
  };

  // Forget everything: back to undeveloped squares, bytes reloaded (so "slow network" can be felt again).
  Develop.prototype.reset = function (reload) {
    try { sessionStorage.removeItem(this.key); } catch (e) { /* ignore */ }
    this.done.clear();
    var self = this;
    this.items.forEach(function (s) {
      clearTimeout(s.timer);
      (s.anims || []).forEach(function (a) { a.cancel(); });
      s.started = false; s.seen = false;
      s.h.print.classList.toggle('undev', !Pen.reduced());
      if (reload) {
        s.loading = false; s.decoded = false;
        s.h.img.removeAttribute('src'); s.h.img.removeAttribute('srcset');
        self.near.unobserve(s.h.el); self.near.observe(s.h.el);
      }
      self.seen.unobserve(s.h.el); self.seen.observe(s.h.el);
    });
  };

  Develop.prototype.drop = function () {
    this.items.forEach(function (s) { clearTimeout(s.timer); });
    this.near.disconnect(); this.seen.disconnect(); this.items = [];
  };

  window.G06.Develop = Develop;
})();
