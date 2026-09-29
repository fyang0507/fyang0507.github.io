/* 10c · shots — the OP's shot list. Each shot is one full-bleed poster on its own colour field: one giant thing,
   one bilingual label, one kind of mark. Layout lives in 10-opener-c-shots.css (landscape + portrait); this file
   builds the DOM and draws the marks once layout exists, aimed at where the hero actually landed. */
(function () {
  var C = { yolk: '#FFC629', pool: '#22B8E6', gum: '#FF78B4', coral: '#D9695A', ink: '#1F1B17', cream: '#FBF6EC' };
  var A = OCArt;

  // Label halves are separate elements so portrait can put 中文 above the object and English below it.
  function label(cn, en) { return '<b class="p lb-cn">' + cn + '</b><i class="p lb-en">' + en + '</i>'; }

  var SHOTS = {
    // 弗 · 雷 · 德 — the name one syllable per cut, each paired with the Latin letters it stands for.
    fu: { f: 'yolk', html: '<b class="p gl">弗</b><i class="p lt">F</i>',
      marks: function (c) {
        var g = c.rect('.gl'), m = c.min;
        A.stroke(c.front, A.ticks(g.r - g.w * .1, g.t + g.h * .14, -.8, m * .085, { seed: 'fu', n: 3, spread: 1.05 }), C.ink, c.pen * 1.5);
      } },
    lei: { f: 'pool', html: '<b class="p gl">雷</b><i class="p lt">RE</i>',
      marks: function (c) {
        var g = c.rect('.gl'), m = c.min;
        A.stroke(c.back, A.zig(g.l + g.w * .02, g.t - m * .02, m * .2, -.35, { seed: 'lei1' }), C.cream, c.pen * 1.7);
        A.stroke(c.back, A.zig(g.r - g.w * .06, g.b - g.h * .42, m * .16, .3, { seed: 'lei2' }), C.cream, c.pen * 1.7);
      } },
    de: { f: 'gum', html: '<b class="p gl">德</b><i class="p lt">D</i>',
      marks: function (c) {
        var g = c.rect('.gl'), fl = A.focus(c.W, c.H, g.cx, g.cy, { seed: 'de', rx: g.w * .64, ry: g.h * .62, n: 64 });
        A.stroke(c.back, fl.thin, C.yolk, c.pen); A.stroke(c.back, fl.thick, C.yolk, c.pen * 1.9);
      } },
    fred: { f: 'ink', html: '<i class="p word">FRED</i><b class="p cn">弗雷德</b>',
      marks: function (c) {
        var w = c.rect('.word'), m = c.min;
        if (c.port) A.stroke(c.front, A.ticks(w.r + m * .02, w.t + m * .06, -.6, m * .09, { seed: 'fred', n: 3 }), C.yolk, c.pen * 1.5);
        else A.stroke(c.front, A.ticks(w.l + w.w * .05, w.t + w.h * .16, -2.35, m * .08, { seed: 'fred', n: 3 }), C.yolk, c.pen * 1.5);
      } },
    // The laptop whips in: one smear frame (its own silhouette in its own paper colour, stretched along the
    // travel — smears carry the object's dominant colour), then it lands.
    lap0: { f: 'pool', html: '<img class="p ob sil" src="assets-gen/10c-laptop.webp" alt="">',
      marks: function (c) {
        var s = c.rect('.sil');
        // streaks ride over the trailing half of the smear and spill into the field around it
        var d = c.port ? A.streaks([s.l - s.w * .04, -10, s.w * 1.08, s.t + s.h * .5 + 10], { seed: 'lap0', dir: 'y', n: 18 })
          : A.streaks([-10, s.t - s.h * .06, s.l + s.w * .55 + 10, s.h * 1.12], { seed: 'lap0', dir: 'x', n: 20 });
        A.stroke(c.front, d, C.ink, c.pen * 1.2);
      } },
    lap: { f: 'pool', html: '<img class="p ob" src="assets-gen/10c-laptop.webp" alt="">' + label('在造', 'building!'),
      marks: function (c) {
        var o = c.rect('.ob'), m = c.min;
        var skip = c.port ? [[-2.2, -.95], [.92, 2.2]] : [[-.9, .75]];
        var fl = A.focus(c.W, c.H, o.cx, o.cy, { seed: 'lap', rx: o.w * (c.port ? .5 : .62), ry: o.h * (c.port ? .8 : .64), n: 60, skip: skip, spread: .4 });
        A.stroke(c.back, fl.thin, C.ink, c.pen * .85); A.stroke(c.back, fl.thick, C.ink, c.pen * 1.6);
        A.stroke(c.front, A.ticks(o.l + o.w * .1, o.t + o.h * .1, -2.4, m * .075, { seed: 'lapT' }), C.ink, c.pen * 1.5);
      } },
    // The book turns its own page on the hand's clock: sprite frames 1 → 2 → 3, one per tick.
    book: { f: 'yolk', html: '<div class="p ob book"></div>' + label('在写', 'writing!'),
      marks: function (c) {
        var o = c.rect('.ob'), m = c.min;
        A.stroke(c.front, A.ticks(o.cx + o.w * .2, o.t + o.h * .02, -1.2, m * .075, { seed: 'bookT', n: 3, spread: 1.1 }), C.ink, c.pen * 1.5);
        if (!c.port) A.stroke(c.front, A.ticks(o.l + o.w * .04, o.b - o.h * .12, 2.75, m * .06, { seed: 'bookB', n: 2, spread: .6 }), C.ink, c.pen * 1.5);
      } },
    // 咔嚓: the flash is a drawn burst behind the camera on the second tick — never a white-out. Yolk, not white:
    // it pops by hue at almost no luminance change, and it hands the frame to the book's yolk field.
    cam: { f: 'gum', html: '<img class="p ob" src="assets-gen/10c-camera.webp" alt="">' + label('在拍', 'shooting!') + '<b class="p sfx from1">咔嚓 <i>click!</i></b>',
      marks: function (c) {
        var o = c.rect('.ob');
        A.fill(c.back, A.burst(o.l + o.w * .33, o.t + o.h * .5, Math.max(o.w, o.h) * .58, { seed: 'cam', n: 12 }), C.yolk, 'from1');
      } },
    // 关于: Fred's portrait owns the one coral beat. Neutral, then the "surprised" frame — the OP caught him.
    me: { f: 'coral', html: '<div class="p ob me"></div>' + label('关于', 'about!'),
      marks: function (c) {
        var o = c.rect('.ob'), m = c.min;
        A.stroke(c.front, A.ticks(o.r - o.w * .06, o.t + o.h * .08, -.85, m * .07, { seed: 'meT', n: 3, spread: 1 }), C.ink, c.pen * 1.5, 'from1');
      } },
    // The deadpan: the OP gives the bird the full hero treatment (focus lines, ticks)… and it does nothing.
    bird: { f: 'pool', html: '',
      marks: function (c) {
        var W = c.W, H = c.H, B = A.BIRD, k, ex, ey;
        if (c.port) { k = W / 74; ex = W * .7; ey = H * .4; } else { k = H / 68; ex = W * .57; ey = H * .47; }
        var ox = ex - B.eye.x * k, oy = ey - B.eye.y * k, pen = Math.max(9, k * 1.9);
        var fl = A.focus(W, H, ox + 150 * k, oy + 160 * k, { seed: 'bird', rx: k * 44, ry: k * 40, n: 64, spread: .3 });
        A.stroke(c.back, fl.thin, C.ink, c.pen, 'only0'); A.stroke(c.back, fl.thick, C.ink, c.pen * 1.8, 'only0');
        A.bird(c.front, k, ox, oy, pen);
        A.stroke(c.front, A.ticks(ox + 117 * k, oy + 127 * k, -2.35, k * 8, { seed: 'birdT', n: 3, spread: 1 }), C.ink, c.pen * 1.5, 'only0');
        var s = c.port ? k * 3.3 : k * 2.3, bx = c.port ? W * .16 : W * .065, by = c.port ? H * .13 : H * .72;
        A.dots(bx, by, s, { seed: 'birdD' }).forEach(function (d) { A.circle(c.front, d, C.ink, 'from2'); });
      } }
  };

  // Shot list: [id, ticks, first frame]. 12 fps; a tick is 83⅓ ms.
  // Luminance plan (WCAG 2.3.1): the title falls yolk → pool → gum → ink, then the objects rise coral → pool →
  // gum → yolk toward the cream eyecatch, so most cuts change hue, not brightness. Narrative: the name, the man
  // (caught mid-OP), what he does, then the one who doesn't care.
  var FIRST = [['fu', 2], ['lei', 2], ['de', 2], ['fred', 2], ['me', 2], ['lap0', 1], ['lap', 2], ['cam', 2], ['book', 3], ['bird', 4]];
  var RETURNING = [['fred', 1], ['bird', 1, 2]];

  function build(stage, list) {
    stage.innerHTML = '';
    var W = stage.clientWidth, H = stage.clientHeight, port = W / H < 5 / 6, min = Math.min(W, H);
    var pen = Math.max(3.4, Math.min(7, min * .0062));
    var sr = stage.getBoundingClientRect();
    var out = list.map(function (s) {
      var def = SHOTS[s[0]], el = document.createElement('section');
      el.className = 'sh sh-' + s[0];
      el.style.setProperty('--f', C[def.f]);
      el.innerHTML = def.html;
      stage.appendChild(el);
      return { id: s[0], el: el, ticks: s[1], from: s[2] || 0 };
    });
    out.forEach(function (o) {                       // second pass: marks need the heroes laid out
      var back = A.svg(W, H, 'fx back'), front = A.svg(W, H, 'fx front');
      o.el.insertBefore(back, o.el.firstChild); o.el.appendChild(front);
      SHOTS[o.id].marks({ W: W, H: H, port: port, min: min, pen: pen, back: back, front: front,
        rect: function (sel) {
          var b = o.el.querySelector(sel).getBoundingClientRect(), x = b.left - sr.left, y = b.top - sr.top;
          return { l: x, t: y, r: x + b.width, b: y + b.height, w: b.width, h: b.height, cx: x + b.width / 2, cy: y + b.height / 2 };
        } });
    });
    return out;
  }

  window.OCShots = { build: build, FIRST: FIRST, RETURNING: RETURNING, C: C };
})();
