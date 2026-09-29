/* r2-06-phone.js — D at 390px: every clothesline is its own horizontal swipe (scroll-snap: one print
   centred, the next peeking). Swiping accelerates the rope, so the prints lag and swing, then settle when
   the snap lands. Tap unclips (C) inside the phone, peg and all. Near the bottom the next line is strung
   (no Load more), and each print develops the first time it is seen (A).
   Swipe vs tap: the browser decides pan vs tap; on top of that, a tap that lands while a line is still
   coasting or snapping (moved in the last 140 ms) only stops it. The next tap opens. */
(function () {
  var PER = 6, KEY = 'fy-r2-06-phone', GUARD = 140;

  function Phone(stage) {
    this.stage = stage; this.phone = stage.querySelector('.m-phone'); this.screen = stage.querySelector('.m-screen'); this.box = stage.querySelector('.m-lines');
    this.sentinel = stage.querySelector('.m-sentinel'); this.endNote = stage.querySelector('.m-end');
    this.photos = G06.shuffled('fy-r2-phone'); this.lines = []; this.hung = 0; this.busy = false;
    var self = this;
    this.narrow = matchMedia('(max-width:760px)');
    this.viewer = new G06.Viewer({ touch: true,
      bounds: function () {
        if (self.narrow.matches) return null;
        var r = self.phone.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height, radius: 38 };
      },
      seq: function () { return self.seq(); },
      onGo: function (l, i) { self.bring(l, i); }
    });
    this.io = new IntersectionObserver(function (es) { if (es[es.length - 1].isIntersecting) self.more(); }, { rootMargin: '0px 0px 60px 0px' });
    this.io.observe(this.sentinel);
  }

  Phone.prototype.reset = function (forget) {
    this.viewer.clearAll();
    this.lines.forEach(function (r) { r.line.destroy(); r.sec.remove(); });
    this.lines = []; this.hung = 0; this.busy = false;
    if (this.dev) this.dev.drop();
    if (forget) try { sessionStorage.removeItem(KEY); } catch (e) { /* private mode */ }
    this.dev = new G06.Develop(KEY);
    this.screen.scrollTop = 0;
    for (var i = 0; i < 3; i++) this.addLine(false);
    this.update();
  };

  Phone.prototype.addLine = function (animated, done) {
    var chunk = this.photos.slice(this.hung, this.hung + PER), no = this.lines.length + 1, self = this;
    if (!chunk.length) return null;
    this.hung += chunk.length;
    var sec = document.createElement('section'), lab = String(no).padStart(2, '0'), tot = String(chunk.length).padStart(2, '0');
    sec.className = 'mline'; sec.setAttribute('aria-label', 'Line ' + no + ' · 第 ' + no + ' 根绳 · ' + chunk.length + ' prints');
    sec.innerHTML = '<div class="mline-head"><span>line ' + lab + ' · 第 ' + no + ' 根绳</span><span class="mline-count">01 / ' + tot + ' · swipe →</span></div>' +
      '<div class="mscroll"><div class="mtrack"></div></div>';
    this.box.appendChild(sec);
    var sc = sec.querySelector('.mscroll'), track = sec.querySelector('.mtrack'), count = sec.querySelector('.mline-count');
    var sw = sc.clientWidth, cw = Math.round(Math.min(240, sw * 0.62)), gap = 18;
    var rec = { sec: sec, sc: sc, cw: cw, gap: gap, moved: 0 };
    var line = rec.line = new G06.Line(track, chunk, { pack: true, cardW: cw, pad: 8, cap: 16, meta: 10.5, gap: gap, lead: (sw - cw) / 2,
      margin: 14, ropeTop: 24, base: 6, weight: 36, seed: 'm' + no, hidden: animated, autoload: false, sizes: cw + 'px',
      onOpen: function (l, i, e) { if (e.detail === 0 || performance.now() - rec.moved > GUARD) self.viewer.open(l, i); },   // keyboard clicks (detail 0) are never guarded
      onFocus: function (l, i) { self.center(rec, i); } });
    // Snap targets: plain boxes where each print hangs (the hangs themselves move with physics).
    line.hangs.forEach(function (g) {
      var s = document.createElement('span'); s.className = 'msnap';
      s.style.left = (g.x - cw / 2) + 'px'; s.style.width = cw + 'px'; track.appendChild(s);
    });
    line.hangs.forEach(function (g) { self.dev.add(g); });
    // Inertia: when the rope accelerates sideways the prints lag behind it.
    var last = { x: 0, t: performance.now(), v: 0 };
    sc.addEventListener('scroll', function () {
      var now = performance.now(), x = sc.scrollLeft, dt = now - last.t;
      if (dt > 120) last.v = 0;
      var v = (x - last.x) / Math.max(8, dt) * 1000, dv = v - last.v;
      line.kickAll(Math.max(-26, Math.min(26, -dv * 0.012)));
      last = { x: x, t: now, v: v }; rec.moved = now;
      var idx = Math.min(chunk.length, Math.round(x / (cw + gap)) + 1);
      count.textContent = String(idx).padStart(2, '0') + ' / ' + tot + ' · swipe →';
    }, { passive: true });
    // Keyboard: ← / → walk along the line; focusing a print swipes the line to it.
    sc.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var i = line.hangs.findIndex(function (g) { return g.print === document.activeElement; });
      var j = i + (e.key === 'ArrowRight' ? 1 : -1);
      if (i < 0 || j < 0 || j >= line.hangs.length) return;
      e.preventDefault(); line.hangs[j].print.focus({ preventScroll: true }); self.center(rec, j);
    });
    this.lines.push(rec);
    if (animated) line.string(done); else if (done) done();
    return line;
  };

  Phone.prototype.center = function (rec, i) {
    var g = rec.line.hangs[i];
    rec.sc.scrollTo({ left: g.x - rec.sc.clientWidth / 2, behavior: Pen.reduced() ? 'auto' : 'smooth' });
  };
  // ← / → or a swipe in the viewer reached another print: swipe its line to it and bring that line into
  // view behind the veil, so it comes off (and later goes back) where you can see it.
  Phone.prototype.bring = function (line, i) {
    var rec = this.lines.find(function (r) { return r.line === line; }); if (!rec) return;
    this.center(rec, i);
    var sr = rec.sec.getBoundingClientRect(), sm = this.narrow.matches, box = sm ? { top: 0, bottom: innerHeight } : this.screen.getBoundingClientRect();
    if (sr.top < box.top + 8 || sr.bottom > box.bottom - 8) {
      var dy = sr.top - box.top - 40, beh = Pen.reduced() ? 'auto' : 'smooth';
      if (sm) window.scrollBy({ top: dy, behavior: beh }); else this.screen.scrollBy({ top: dy, behavior: beh });
    }
  };

  Phone.prototype.seq = function () {
    var out = [];
    this.lines.forEach(function (r) { r.line.hangs.forEach(function (g, i) { if (!g.el.classList.contains('unpegged')) out.push([r.line, i]); }); });
    return out;
  };

  // The end of the line is near: string another one instead of asking for a "Load more" tap.
  Phone.prototype.more = function () {
    if (this.busy || this.viewer.isOpen || this.hung >= this.photos.length || !this.lines.length) return;
    var self = this; this.busy = true;
    this.addLine(true, function () {
      self.busy = false; self.update();
      var r = self.sentinel.getBoundingClientRect(), root = self.narrow.matches ? { bottom: innerHeight } : self.screen.getBoundingClientRect();
      if (r.top < root.bottom + 60) self.more();
    });
    this.update();
  };

  Phone.prototype.update = function () {
    var total = this.photos.length, self = this, st = this.stage;
    st.querySelectorAll('[data-m="shown"]').forEach(function (e) { e.textContent = String(self.hung); });
    st.querySelectorAll('[data-m="total"]').forEach(function (e) { e.textContent = String(total); });
    requestAnimationFrame(function () {
      // Today's one-column garland measures 6,575px for 18 prints, i.e. ~365px per print.
      var hh = self.narrow.matches ? self.screen.offsetHeight : self.screen.scrollHeight, today = Math.round(self.hung * 6575 / 18);
      st.querySelectorAll('[data-m="height"]').forEach(function (e) { e.textContent = hh.toLocaleString('en-US'); });
      st.querySelectorAll('[data-m="today"]').forEach(function (e) { e.textContent = today.toLocaleString('en-US'); });
      st.querySelectorAll('[data-m="lines"]').forEach(function (e) { e.textContent = String(self.lines.length); });
    });
    this.endNote.hidden = this.hung < total;
  };

  G06.Phone = Phone;
})();
