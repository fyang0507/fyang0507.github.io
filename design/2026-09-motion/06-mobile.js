/* 06-mobile.js — D: at 390px every clothesline becomes its own horizontal swipe.
   scroll-snap centres one print and the next one peeks; swiping accelerates the rope, so the prints
   lag and swing (inertia), then settle when the snap lands. Near the bottom another line is strung
   (replacing "Load more"), pegged left to right, and each print develops the first time it is seen. */
(function () {
  var PER = 6;

  function Mobile(stage) {
    this.stage = stage; this.phone = stage.querySelector('.m-phone'); this.screen = stage.querySelector('.m-screen'); this.box = stage.querySelector('.m-lines');
    this.sentinel = stage.querySelector('.m-sentinel'); this.endNote = stage.querySelector('.m-end');
    this.photos = G06.shuffled('fy-gallery-mobile'); this.lines = []; this.hung = 0; this.busy = false;
    var self = this;
    this.narrow = matchMedia('(max-width:760px)');
    this.dev = new G06.Develop('fy06-dev-D');
    this.viewer = new G06.Viewer({ bounds: function () {
      if (self.narrow.matches) return null;
      var r = self.phone.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height, radius: 38 };
    } });
    this.io = new IntersectionObserver(function (es) { if (es[es.length - 1].isIntersecting) self.more(); }, { rootMargin: '0px 0px 60px 0px' });
    this.io.observe(this.sentinel);
    this.reset();
  }

  Mobile.prototype.reset = function () {
    this.lines.forEach(function (l) { l.line.destroy(); l.sec.remove(); });
    this.lines = []; this.hung = 0; this.busy = false;
    this.dev.drop(); this.dev = new G06.Develop('fy06-dev-D');
    try { sessionStorage.removeItem('fy06-dev-D'); } catch (e) { /* ignore */ }
    this.dev.done.clear();
    this.viewer.clear();
    this.screen.scrollTop = 0;
    for (var i = 0; i < 3; i++) this.addLine(false);
    this.update();
  };

  Mobile.prototype.addLine = function (animated, done) {
    var chunk = this.photos.slice(this.hung, this.hung + PER), no = this.lines.length + 1, self = this;
    if (!chunk.length) return null;
    this.hung += chunk.length;
    var sec = document.createElement('section');
    sec.className = 'mline'; sec.setAttribute('aria-label', 'Line ' + no + ' · ' + chunk.length + ' prints');
    var lab = String(no).padStart(2, '0');
    sec.innerHTML = '<div class="mline-head"><span>line ' + lab + ' · 第 ' + no + ' 根绳</span><span class="mline-count">01 / ' +
      String(chunk.length).padStart(2, '0') + ' · swipe →</span></div><div class="mscroll"><div class="mtrack"></div></div>';
    this.box.appendChild(sec);
    var sc = sec.querySelector('.mscroll'), track = sec.querySelector('.mtrack'), count = sec.querySelector('.mline-count');
    var sw = sc.clientWidth, cw = Math.round(Math.min(240, sw * 0.62)), gap = 18;
    var line = new G06.Line(track, chunk, { pack: true, cardW: cw, pad: 8, cap: 16, meta: 10.5, gap: gap, lead: (sw - cw) / 2,
      margin: 14, ropeTop: 22, maxSag: 16, sag: 0.012, seed: 'm' + no, hidden: animated, load: false, sizes: cw + 'px',
      onOpen: function (l, i) { self.viewer.open(l, i); } });
    // Snap targets: plain boxes where each print hangs (the hangs themselves move with physics).
    line.hangs.forEach(function (g) {
      var s = document.createElement('span'); s.className = 'msnap';
      s.style.left = (g.x - cw / 2) + 'px'; s.style.width = cw + 'px'; track.appendChild(s);
    });
    line.hangs.forEach(function (g) { self.dev.add(g); });
    this.viewer.add(line);
    // Inertia: when the rope accelerates sideways the prints lag behind it.
    var last = { x: 0, t: performance.now(), v: 0 };
    sc.addEventListener('scroll', function () {
      var now = performance.now(), x = sc.scrollLeft, dt = now - last.t;
      if (dt > 120) last.v = 0;
      var v = (x - last.x) / Math.max(8, dt) * 1000, dv = v - last.v;
      line.kickAll(Math.max(-26, Math.min(26, -dv * 0.012)));
      last = { x: x, t: now, v: v };
      var idx = Math.min(chunk.length, Math.round(x / (cw + gap)) + 1);
      count.textContent = String(idx).padStart(2, '0') + ' / ' + String(chunk.length).padStart(2, '0') + ' · swipe →';
    }, { passive: true });
    this.lines.push({ sec: sec, line: line });
    if (animated) line.string(done); else if (done) done();
    return line;
  };

  // The end of the line is near: string another one instead of asking for a "Load more" click.
  Mobile.prototype.more = function () {
    if (this.busy || this.hung >= this.photos.length || !this.lines.length) return;
    var self = this; this.busy = true;
    this.addLine(true, function () {
      self.busy = false; self.update();
      var r = self.sentinel.getBoundingClientRect(), root = self.narrow.matches ? { top: 0, bottom: innerHeight } : self.screen.getBoundingClientRect();
      if (r.top < root.bottom + 60) self.more();
    });
    this.update();
  };

  Mobile.prototype.update = function () {
    var total = this.photos.length, self = this, st = this.stage;
    st.querySelectorAll('[data-m="shown"]').forEach(function (e) { e.textContent = String(self.hung); });
    st.querySelectorAll('[data-m="total"]').forEach(function (e) { e.textContent = String(total); });
    requestAnimationFrame(function () {
      // Today's garland measures 6,575px for 18 prints, i.e. ~365px per print.
      var hh = self.narrow.matches ? self.screen.offsetHeight : self.screen.scrollHeight, today = Math.round(self.hung * 6575 / 18);
      st.querySelectorAll('[data-m="height"]').forEach(function (e) { e.textContent = hh.toLocaleString('en-US'); });
      st.querySelectorAll('[data-m="today"]').forEach(function (e) { e.textContent = today.toLocaleString('en-US'); });
      st.querySelectorAll('[data-m="lines"]').forEach(function (e) { e.textContent = String(self.lines.length); });
      var bar = st.querySelector('.m-bar-now');
      if (bar) bar.style.height = Math.max(2, hh / today * 100) + '%';
    });
    this.endNote.hidden = this.hung < total;
  };

  G06.Mobile = Mobile;
})();
