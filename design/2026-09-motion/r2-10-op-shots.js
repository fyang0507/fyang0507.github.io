/* r2-10 · the OP's shot list (objects + the bird, from 10-opener-c-shots.js; the name beat is in
   r2-10-op-names.js). Each shot is one full-bleed poster on its own colour field: one giant thing, one
   bilingual label, one kind of mark. Layout lives in r2-10-op.css / r2-10-op-names.css; this file builds the
   DOM and draws the marks once layout exists, aimed at where the hero actually landed.
   Round 2 cuts the OP to 18 ticks (1.5 s) and turns the bird close-up to face right: it is the same bird the
   next cut finds on the desk, staring at the loading line. */
(function () {
  var A = R10Art, C = R10Art.C, G = 'assets-gen/';

  // Label halves are separate elements so portrait can put 中文 above the object and English below it.
  function label(cn, en) { return '<b class="p lb-cn">' + cn + '</b><i class="p lb-en">' + en + '</i>'; }

  var SHOTS = {
    // 关于: Fred's portrait owns the one coral beat. Neutral, then the "surprised" frame — the OP caught him.
    me: { f: 'coral', html: '<div class="p ob me"></div>' + label('关于', 'about!'),
      marks: function (c) {
        var o = c.rect('.ob'), m = c.min;
        A.stroke(c.front, A.ticks(o.r - o.w * .06, o.t + o.h * .08, -.85, m * .07, { seed: 'meT', n: 3, spread: 1 }), C.ink, c.pen * 1.5, 'from1');
      } },
    // The laptop whips in: one smear frame (its own silhouette stretched along the travel), then it lands.
    lap0: { f: 'pool', html: '<img class="p ob sil" data-src="' + G + '10c-laptop.webp" alt="">',
      marks: function (c) {
        var s = c.rect('.sil');
        // the travel: streaks from the frame edge it came through, over the trailing half of the smear
        var d = c.port ? A.streaks([s.l - s.w * .02, -10, s.w * 1.04, s.t + s.h * .45 + 10], { seed: 'lap0', dir: 'y', n: 22 })
          : A.streaks([-10, s.t + s.h * .02, s.l + s.w * .5 + 10, s.h * .96], { seed: 'lap0', dir: 'x', n: 26 });
        A.stroke(c.front, d, C.ink, c.pen * 1.2);
      } },
    lap: { f: 'pool', html: '<img class="p ob" data-src="' + G + '10c-laptop.webp" alt="">' + label('在造', 'building!'),
      marks: function (c) {
        var o = c.rect('.ob'), m = c.min;
        var skip = c.port ? [[-2.2, -.95], [.92, 2.2]] : [[-.9, .75]];
        var fl = A.focus(c.W, c.H, o.cx, o.cy, { seed: 'lap', rx: o.w * (c.port ? .5 : .62), ry: o.h * (c.port ? .8 : .64), n: 60, skip: skip, spread: .4 });
        A.stroke(c.back, fl.thin, C.ink, c.pen * .85); A.stroke(c.back, fl.thick, C.ink, c.pen * 1.6);
        A.stroke(c.front, A.ticks(o.l + o.w * .1, o.t + o.h * .1, -2.4, m * .075, { seed: 'lapT' }), C.ink, c.pen * 1.5);
      } },
    // 咔嚓: the flash is a drawn burst behind the camera on the second tick — never a white-out.
    cam: { f: 'gum', html: '<img class="p ob" data-src="' + G + '10c-camera.webp" alt="">' + label('在拍', 'shooting!') + '<b class="p sfx from1">咔嚓 <i>click!</i></b>',
      marks: function (c) {
        var o = c.rect('.ob');
        A.fill(c.back, A.burst(o.l + o.w * .33, o.t + o.h * .5, Math.max(o.w, o.h) * .58, { seed: 'cam', n: 12 }), C.yolk, 'from1');
      } },
    // The book turns its own page on the hand's clock: sprite frame 0 → 1, one per tick.
    book: { f: 'yolk', html: '<div class="p ob book"></div>' + label('在写', 'writing!'),
      marks: function (c) {
        var o = c.rect('.ob'), m = c.min;
        A.stroke(c.front, A.ticks(o.cx + o.w * .2, o.t + o.h * .02, -1.2, m * .075, { seed: 'bookT', n: 3, spread: 1.1 }), C.ink, c.pen * 1.5);
        if (!c.port) A.stroke(c.front, A.ticks(o.l + o.w * .04, o.b - o.h * .12, 2.75, m * .06, { seed: 'bookB', n: 2, spread: .6 }), C.ink, c.pen * 1.5);
      } },
    // The deadpan: the OP gives the bird the full hero treatment (focus lines, ticks)… and it does nothing.
    // It faces right, the way it faces on the desk the next cut lands on.
    bird: { f: 'pool', html: '',
      marks: function (c) {
        var W = c.W, H = c.H, B = A.BIRD, k, ex, ey;
        if (c.port) { k = W / 74; ex = W * .3; ey = H * .4; } else { k = H / 68; ex = W * .43; ey = H * .47; }
        var ox = ex + B.eye.x * k, oy = ey - B.eye.y * k, pen = Math.max(9, k * 1.9);
        var fl = A.focus(W, H, ox - 150 * k, oy + 160 * k, { seed: 'bird', rx: k * 44, ry: k * 40, n: 64, spread: .3 });
        A.stroke(c.back, fl.thin, C.ink, c.pen, 'only0'); A.stroke(c.back, fl.thick, C.ink, c.pen * 1.8, 'only0');
        A.bird(c.front, k, ox, oy, pen, -1);
        A.stroke(c.front, A.ticks(ox - 117 * k, oy + 127 * k, -.79, k * 8, { seed: 'birdT', n: 3, spread: 1 }), C.ink, c.pen * 1.5, 'only0');
        var s = c.port ? k * 3.3 : k * 2.3, bx = c.port ? W * .84 - s * 4.8 : W * .935 - s * 4.8, by = c.port ? H * .13 : H * .72;
        A.dots(bx, by, s, { seed: 'birdD' }).forEach(function (d) { A.circle(c.front, d, C.ink, 'from1'); });
      } }
  };

  // The objects after the name: [id, ticks, first frame]. 12 fps; a tick is 83⅓ ms.
  // Luminance plan (WCAG 2.3.1, measured per quadrant): after the name the mean luminance climbs
  // me 0.34 → lap 0.44 → cam 0.44 → book 0.63 → bird 0.62 → the cream desk 0.90, one way, so the run of
  // cuts reads as one rising transition instead of a flash per cut. Narrative: the name, the man (caught
  // mid-OP), what he does, then the one who doesn't care.
  var OBJ = [['me', 2], ['lap0', 1], ['lap', 2], ['cam', 2], ['book', 2], ['bird', 3]];

  function lists(name) {
    var N = R10Names[name];
    // returning: the variant's payoff frame, then the bird's "…" — two cuts, 250 ms
    return { first: N.first.concat(OBJ), returning: [N.payoff, ['bird', 2, 1]] };
  }
  function def(id) {
    if (SHOTS[id]) return SHOTS[id];
    for (var k in R10Names) if (R10Names[k].shots[id]) return R10Names[k].shots[id];
  }

  // Builds every shot of the list as a hidden full-bleed <section>; img sources arrive through `src(url)`
  // (the loader's streamed copy) so nothing is downloaded twice.
  function build(stage, list, src) {
    stage.innerHTML = '';
    var W = stage.clientWidth, H = stage.clientHeight, port = W / H < 5 / 6, min = Math.min(W, H);
    var pen = Math.max(3.4, Math.min(7, min * .0062));
    var sr = stage.getBoundingClientRect();
    var out = list.map(function (s) {
      var d = def(s[0]), el = document.createElement('section');
      el.className = 'sh sh-' + s[0];
      el.style.setProperty('--f', C[d.f]);
      el.innerHTML = d.html;
      stage.appendChild(el);
      el.querySelectorAll('img[data-src]').forEach(function (im) { src(im.dataset.src).then(function () { im.src = im.dataset.src; }); });
      return { id: s[0], el: el, ticks: s[1], from: s[2] || 0 };
    });
    out.forEach(function (o) {                       // second pass: marks need the heroes laid out
      var back = A.svg(W, H, 'fx back'), front = A.svg(W, H, 'fx front');
      o.el.insertBefore(back, o.el.firstChild); o.el.appendChild(front);
      def(o.id).marks({ W: W, H: H, port: port, min: min, pen: pen, back: back, front: front, el: o.el,
        rect: function (sel) {
          var b = o.el.querySelector(sel).getBoundingClientRect(), x = b.left - sr.left, y = b.top - sr.top;
          return { l: x, t: y, r: x + b.width, b: y + b.height, w: b.width, h: b.height, cx: x + b.width / 2, cy: y + b.height / 2 };
        } });
    });
    return out;
  }

  window.R10OP = { build: build, lists: lists, C: C };
})();
