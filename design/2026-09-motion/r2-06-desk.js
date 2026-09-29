/* r2-06-desk.js — the desktop gallery as it would ship: live Gallery's intro and count, three lines of six
   real prints (18, the live page's first batch), each developing the first time it is seen (A), hung on
   loaded rope with pendulum prints that answer a genuine flick (B), unclipped by their pegs into the
   viewer (C). Scrolling to the end strings the next line instead of a Load more button. */
(function () {
  var KEY = 'fy-r2-06-desk', PER = 6, FIRST = 3, MAX = 6;

  function Desk(stage) {
    this.stage = stage; this.rack = stage.querySelector('.d-rack'); this.end = stage.querySelector('.d-end'); this.slow = stage.querySelector('.d-slow input');
    this.photos = G06.shuffled('fy-r2-desk'); this.lines = []; this.hung = 0; this.busy = false; this.near = false;
    var self = this;
    this.viewer = new G06.Viewer({ seq: function () { return self.seq(); }, onGo: function (l) { self.bring(l); } });
    this.flick = new G06.Flick(stage, function () { return self.lines; }, function () { return self.viewer.isOpen; });
    // Stringing is caused by scrolling toward the end, never by a replay, a resize or the viewer.
    this.io = new IntersectionObserver(function (es) {
      self.near = es[es.length - 1].isIntersecting; if (self.near) self.more();
    }, { rootMargin: '0px 0px -40px 0px' });
    this.io.observe(this.end);
    this.slow.addEventListener('change', function () { self.reset(true); });
  }

  Desk.prototype.reset = function (forget) {
    this.viewer.clearAll();
    this.lines.forEach(function (l) { l.destroy(); }); this.rack.innerHTML = ''; this.lines = []; this.hung = 0; this.busy = false;
    if (this.dev) this.dev.drop();
    if (forget) try { sessionStorage.removeItem(KEY); } catch (e) { /* private mode */ }
    var slow = this.slow;
    this.dev = new G06.Develop(KEY, { slow: function (id) { return slow.checked ? 250 + Math.round(Pen.rng('slow' + id)() * 2400) : 0; } });
    if (!this.rack.clientWidth) { this.update(); return; }        // stage hidden (phone-width board)
    this.per = Math.max(2, Math.min(PER, Math.floor((this.rack.clientWidth - 60) / 172)));
    for (var i = 0; i < FIRST; i++) this.addLine(false);
    this.update();
  };

  Desk.prototype.addLine = function (animated, done) {
    var chunk = this.photos.slice(this.hung, this.hung + this.per), self = this;
    if (!chunk.length) return null;
    this.hung += chunk.length;
    var host = document.createElement('section');
    host.className = 'line-host'; host.setAttribute('aria-label', 'Line ' + (this.lines.length + 1) + ' · 第 ' + (this.lines.length + 1) + ' 根绳');
    this.rack.appendChild(host);
    var line = new G06.Line(host, chunk, { cardW: 148, pad: 6, cap: 15, meta: 10, margin: 30, weight: 52, seed: 'd' + this.lines.length,
      hidden: animated, autoload: false, sizes: '148px', onOpen: function (l, i) { self.flick.cancel(); self.viewer.open(l, i); } });
    line.hangs.forEach(function (g) { self.dev.add(g); });
    this.lines.push(line);
    if (animated) line.string(done); else if (done) done();
    return line;
  };

  Desk.prototype.more = function () {
    if (this.busy || this.viewer.isOpen || this.lines.length >= MAX || this.hung >= this.photos.length || !this.lines.length) return;
    var self = this; this.busy = true;
    this.addLine(true, function () { self.busy = false; self.update(); if (self.near) self.more(); });
    this.update();
  };

  Desk.prototype.update = function () {
    var n = this.hung, tot = this.photos.length;
    this.stage.querySelector('.d-count').textContent = 'Showing ' + n + ' / ' + tot + ' · 显示 ' + n + ' / ' + tot + ' 张 · ' + tot + ' frames total';
    this.end.classList.toggle('full', this.lines.length >= MAX);
  };

  Desk.prototype.seq = function () {
    var out = [];
    this.lines.forEach(function (l) { l.hangs.forEach(function (g, i) { if (!g.el.classList.contains('unpegged')) out.push([l, i]); }); });
    return out;
  };
  // ← / → reached a print on a line that is out of view: bring that line into view behind the veil, so
  // the print is taken from, and later returned to, a place you can see. The flight tracks the scroll.
  Desk.prototype.bring = function (line) {
    var r = line.host.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight - 30) window.scrollBy({ top: r.top - Math.max(80, (innerHeight - r.height) / 2), behavior: Pen.reduced() ? 'auto' : 'smooth' });
  };

  // Scripted pass for the board: a real flick along line 1 (fed through the same detector), then unclip, → next, Esc.
  Desk.prototype.demo = function () {
    if (this.viewer.isOpen || this.demoing || !this.lines.length) return;
    var self = this, l0 = this.lines[0]; this.demoing = true;
    l0.host.scrollIntoView({ block: 'center' });
    setTimeout(function () {
      var r = l0.host.getBoundingClientRect(), t0 = performance.now(), D = 900;
      (function f(now) {
        var k = Math.min(1, (now - t0) / D);
        self.flick.feed(r.left + 20 + (r.width - 40) * k, r.top + 110 + Math.sin(k * Math.PI * 3.2) * 80, now);
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    }, 250);
    setTimeout(function () { self.viewer.open(l0, 2); }, 2300);
    setTimeout(function () { self.viewer.go(1); }, 4300);
    setTimeout(function () { self.viewer.close(); self.demoing = false; }, 6400);
  };

  G06.Desk = Desk;
})();
