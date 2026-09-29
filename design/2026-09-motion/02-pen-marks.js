/* 02-pen-marks.js — one mark object per (element, state) for board 02, built on shared/pen.js.
   A mark lives in an SVG layer inside its host (the link / button) and is measured from a
   target box (the part the pen actually annotates: a label, a word, a nav object).
   Geometry is seeded by the target's text, so the same word always gets the same stroke. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  function node(tag, attrs) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function f(n) { return Math.round(n * 10) / 10; }
  function dur(L) { return Math.min(620, 200 + L * 1.1); }   // same curve as Pen.draw

  // Pen.loop is a true ellipse, which cuts through the corners of a wide phrase. This lap uses the
  // same seeded wobble and overshoot, but a superellipse that flattens as the target gets wider,
  // the way a hand circles a long phrase as a sausage rather than an egg.
  function hugLoop(w, h, seed, opt) {
    opt = opt || {}; var r = Pen.rng(seed), pad = opt.pad == null ? 6 : opt.pad;
    var cx = w / 2, cy = h / 2, rx = w / 2 + pad, ry = h / 2 + pad * .8;
    var e = 2 / (2 + Math.min(1.8, Math.max(0, (w / h - 1.5) * .35)));
    var start = Math.PI * (1.05 + r() * .15), laps = 1.12 + r() * .1, n = 34, pts = [], tilt = (r() - .5) * .06;
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = start + t * laps * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
      var grow = 1 + (t - .5) * (.05 + r() * .02), wob = 1 + Math.sin(t * 5.3 + r() * 6) * .018;
      var x = cx + (c < 0 ? -1 : 1) * Math.pow(Math.abs(c), e) * rx * grow * wob;
      var y = cy + (sn < 0 ? -1 : 1) * Math.pow(Math.abs(sn), e) * ry * grow * wob;
      pts.push([x + (y - cy) * tilt, y - (x - cx) * tilt]);
    }
    return Pen.smooth(pts);
  }

  function box(host, target) {
    var h = host.getBoundingClientRect(), t = (target || host).getBoundingClientRect();
    return { x: t.left - h.left, y: t.top - h.top, w: t.width, h: t.height };
  }

  function stroke(d, s, x, y) {
    var p = Pen.path(d, { color: s.color, width: s.width || 2 });
    if (x || y) p.setAttribute('transform', 'translate(' + f(x) + ' ' + f(y) + ')');
    return p;
  }

  // A flat marker band with scissor-cut ends, slightly off-level like a wrist pulling right.
  function bandShape(b, seed, s) {
    var r = Pen.rng(seed), top = b.y + b.h * (s.top == null ? .16 : s.top), bot = b.y + b.h * (s.bot == null ? .96 : s.bot);
    var x0 = b.x - (s.over == null ? 4 : s.over), x1 = b.x + b.w + (s.over == null ? 4 : s.over), H = bot - top, slope = (r() - .5) * .028;
    var pts = [
      [x0 + r() * 2.5, top + r() * 1.2], [(x0 + x1) / 2, top - .8 + r() * 1.4], [x1 - r() * 2, top + r() * 1.6],
      [x1 + 1.5 + r() * 2.5, top + H * .34], [x1 - 1 - r() * 2.5, top + H * .63], [x1 + r() * 2.5, bot - r() * 1.2],
      [(x0 + x1) / 2, bot + .8 - r() * 1.4], [x0 + r() * 2, bot],
      [x0 - 1.5 - r() * 2.5, top + H * .66], [x0 + 1 + r() * 2.5, top + H * .35]
    ].map(function (p) { return [p[0], p[1] + (p[0] - x0) * slope]; });
    return { d: 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join(' L') + 'Z', x0: x0, x1: x1, mid: (top + bot) / 2 + (x1 - x0) * slope / 2, H: H };
  }

  function Mark(host, target, spec) {
    this.host = host; this.target = target || host; this.spec = spec; this.on = false; this.paths = [];
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    if (spec.kind === 'band') host.style.isolation = 'isolate';
    this.svg = node('svg', { 'aria-hidden': 'true', width: 1, height: 1, 'class': 'pm pm-' + spec.kind });
    this.svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none;z-index:' + (spec.kind === 'band' ? -1 : 3);
    host.appendChild(this.svg);
    this.build();
  }

  Mark.prototype.build = function () {
    var s = this.spec, b = box(this.host, this.target), svg = this.svg, paths = [];
    var seed = s.seed || (((this.target.textContent || '').trim() || s.kind) + '|' + s.kind + (s.tag ? '|' + s.tag : ''));
    svg.innerHTML = '';
    if (s.kind === 'loop') {
      paths.push(stroke(hugLoop(b.w, b.h, seed, { pad: s.pad == null ? 5 : s.pad }), s, b.x, b.y));
    } else if (s.kind === 'underline') {
      paths.push(stroke(Pen.underline(b.w, seed, { y: b.h + (s.gap == null ? 3 : s.gap) }), s, b.x, b.y));
    } else if (s.kind === 'scribble') {
      paths.push(stroke(Pen.scribble(b.w, seed, { y: b.h + (s.gap == null ? 3 : s.gap), passes: s.passes || 3 }), s, b.x, b.y));
    } else if (s.kind === 'tick') {
      var z = s.size || 12;
      paths.push(stroke(Pen.tick(z, seed), s, b.x - z - (s.gap == null ? 5 : s.gap), b.y + b.h / 2 - z * .62));
    } else if (s.kind === 'brackets') {
      var bh = b.h + 4, g = s.gap == null ? 8 : s.gap;
      paths.push(stroke(Pen.bracket(bh, seed, 'left'), s, b.x - g, b.y - 2));
      var right = stroke(Pen.bracket(bh, seed + 'r', 'right'), s, b.x + b.w + g, b.y - 2);
      right._delay = 70; paths.push(right);
    } else if (s.kind === 'corners') {
      // Hanging corner brackets 「 」 — also a viewfinder's focus marks. Short arms that sit above
      // and below the text box, in the line gap, so they never crowd neighbouring words or punctuation.
      var r = Pen.rng(seed), g2 = s.gap == null ? 4 : s.gap, arm = Math.min(12, b.w * .32), v = Math.min(7, b.h * .3), j = function () { return (r() - .5) * 1.1; };
      var x0 = b.x - g2, x1 = b.x + b.w + g2, y0 = b.y - 3, y1 = b.y + b.h + 3;
      paths.push(stroke('M' + f(x0 + arm) + ' ' + f(y0 + j()) + ' L' + f(x0) + ' ' + f(y0) + ' L' + f(x0 + j()) + ' ' + f(y0 + v), s));
      var close = stroke('M' + f(x1 + j()) + ' ' + f(y1 - v) + ' L' + f(x1) + ' ' + f(y1) + ' L' + f(x1 - arm) + ' ' + f(y1 + j()), s);
      close._delay = 70; paths.push(close);
    } else if (s.kind === 'arrow') {
      var geo = s.from(b), ar = Pen.arrow(geo.a, geo.b, seed, { bend: geo.bend, head: geo.head || 8 });
      var shaft = stroke(ar.shaft, s), head = stroke(ar.head, s);
      svg.appendChild(shaft);                                  // measure before scheduling the head
      head._delay = dur(shaft.getTotalLength()) * .82;
      paths.push(shaft, head);
    } else if (s.kind === 'band') {
      var id = 'pm-mask-' + (++uid), sh = bandShape(b, seed, s);
      var mask = node('mask', { id: id, maskUnits: 'userSpaceOnUse', x: -4000, y: -4000, width: 8000, height: 8000 });
      var sweep = node('path', { d: 'M' + f(sh.x0 - 10) + ' ' + f(sh.mid) + ' L' + f(sh.x1 + 10) + ' ' + f(sh.mid), fill: 'none', stroke: '#fff', 'stroke-width': f(sh.H + 12), 'stroke-linecap': 'butt' });
      mask.appendChild(sweep);
      var fill = node('path', { d: sh.d, fill: s.fill, opacity: s.opacity == null ? .8 : s.opacity, mask: 'url(#' + id + ')' });
      svg.appendChild(mask); svg.appendChild(fill);
      paths.push(sweep);                                       // the sweep is what the hand draws
    }
    // Hidden strokes are also visibility:hidden — a dash parked at offset ±L still paints a
    // round-cap dot at the path's end, which reads as a stray fleck of ink.
    paths.forEach(function (p) {
      if (!p.parentNode) svg.appendChild(p);
      var L = p.getTotalLength(); p._L = L;
      p.style.strokeDasharray = L + ' ' + (L + 2);
      p.style.strokeDashoffset = this.on ? 0 : L;
      p.style.visibility = this.on ? 'visible' : 'hidden';
    }, this);
    this.paths = paths;
  };

  Mark.prototype.show = function (instant) {
    this.on = true;
    this.paths.forEach(function (p) {
      p.style.visibility = 'visible';
      if (instant) { p.getAnimations().forEach(function (a) { a.cancel(); }); p.style.strokeDashoffset = 0; return; }
      Pen.draw(p, { delay: p._delay || 0 });
    });
  };

  Mark.prototype.hide = function (instant) {
    var self = this;
    this.on = false;
    this.paths.forEach(function (p) {
      var park = function () { if (!self.on) p.style.visibility = 'hidden'; };
      if (instant) { p.getAnimations().forEach(function (a) { a.cancel(); }); p.style.strokeDashoffset = p._L; park(); return; }
      var a = Pen.erase(p, { duration: 200 });
      if (a) a.addEventListener('finish', park); else park();
    });
  };

  Mark.prototype.set = function (on, instant) {
    if (on && !this.on) this.show(instant);
    else if (!on && this.on) this.hide(instant);
  };

  // Total time the mark takes to land — used for timing notes.
  Mark.prototype.duration = function () {
    return this.paths.reduce(function (m, p) { return Math.max(m, (p._delay || 0) + dur(p._L)); }, 0);
  };

  window.PenMarks = { Mark: Mark, box: box, dur: dur, loop: hugLoop };
})();
