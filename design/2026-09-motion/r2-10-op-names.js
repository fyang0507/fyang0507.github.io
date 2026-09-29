/* r2-10 · the name beat — three ways to say 弗雷德 = FRED without cutting FRED into phonetic pieces
   (round 1 paired 弗/F, 雷/RE, 德/D, and Fred called it weird). Each variant is a list of shots on the OP's
   12 fps held-pose clock; layout lives in r2-10-op-names.css (landscape + portrait).
   a · 一字一切  弗 · 雷 · 德 one per cut, each alone and full-bleed, then FRED lands as the payoff.
                 Bilingual across the sequence, not per frame.
   b · 对撞      弗雷德 enters from one side, FRED from the other; one smear frame, one impact frame, then
                 both hold side by side, jolted.
   c · 书脊      one poster: 弗雷德 set vertically beside FRED set on its side, a book-spine title standing
                 on a shelf (the bird is the publisher's colophon). Held for the whole beat. */
(function () {
  var A = R10Art, C = R10Art.C;

  var V = {
    a: {
      shots: {
        // 弗 — the ticks of something landing hard (Fred's sticker-peek motif, scaled up)
        'a-fu': { f: 'yolk', html: '<b class="p gl">弗</b>',
          marks: function (c) {
            var g = c.rect('.gl'), m = c.min;
            A.stroke(c.front, A.ticks(g.r - g.w * .06, g.t + g.h * .1, -.8, m * .1, { seed: 'fu', n: 3, spread: 1.05 }), C.ink, c.pen * 1.6);
            A.stroke(c.front, A.ticks(g.l + g.w * .05, g.b - g.h * .08, 2.4, m * .07, { seed: 'fuB', n: 2, spread: .7 }), C.ink, c.pen * 1.6);
          } },
        // 雷 — thunder, so a drawn zigzag on each side
        'a-lei': { f: 'pool', html: '<b class="p gl">雷</b>',
          marks: function (c) {
            var g = c.rect('.gl'), m = c.min;
            A.stroke(c.back, A.zig(c.port ? c.W * .12 : g.l - m * .1, c.port ? g.t - m * .34 : g.t + g.h * .08, m * .26, -.35, { seed: 'lei1' }), C.cream, c.pen * 1.8);
            A.stroke(c.back, A.zig(c.port ? c.W * .72 : g.r + m * .04, c.port ? g.b + m * .06 : g.b - g.h * .5, m * .22, .3, { seed: 'lei2' }), C.cream, c.pen * 1.8);
          } },
        // 德 — the hero shot: focus lines
        'a-de': { f: 'gum', html: '<b class="p gl">德</b>',
          marks: function (c) {
            var g = c.rect('.gl'), fl = A.focus(c.W, c.H, g.cx, g.cy, { seed: 'de', rx: g.w * .6, ry: g.h * .6, n: 64 });
            A.stroke(c.back, fl.thin, C.yolk, c.pen); A.stroke(c.back, fl.thick, C.yolk, c.pen * 1.9);
          } },
        // FRED — the payoff, alone on ink; the yolk ticks arrive on the second tick
        'a-fred': { f: 'ink', html: '<i class="p word">FRED</i>',
          marks: function (c) {
            var w = c.rect('.word'), m = c.min;
            if (c.port) A.stroke(c.front, A.ticks(w.r + m * .02, w.t + m * .04, -.6, m * .1, { seed: 'fred', n: 3 }), C.yolk, c.pen * 1.6, 'from1');
            else A.stroke(c.front, A.ticks(w.l + w.w * .03, w.t + w.h * .12, -2.35, m * .09, { seed: 'fred', n: 3 }), C.yolk, c.pen * 1.6, 'from1');
          } }
      },
      // an accelerating drum: 弗 — 雷 德 — FRED
      first: [['a-fu', 2], ['a-lei', 1], ['a-de', 1], ['a-fred', 2]],
      payoff: ['a-fred', 1, 1]
    },

    b: {
      shots: {
        // tick 0: both enter from the frame edges over horizontal speed lines; tick 1: the one smear
        'b-in': { f: 'pool', html: '<b class="p cn">弗雷德</b><i class="p word">FRED</i>',
          marks: function (c) {
            var W = c.W, H = c.H;
            var d0 = c.port ? A.streaks([W * .08, -10, W * .84, H + 20], { seed: 'bin0', dir: 'y', n: 22 }) : A.streaks([-10, H * .2, W + 20, H * .6], { seed: 'bin0', dir: 'x', n: 22 });
            A.stroke(c.back, d0, C.ink, c.pen * .9, 'only0');
            var d1 = c.port ? A.streaks([W * .14, H * .06, W * .72, H * .88], { seed: 'bin1', dir: 'y', n: 30 }) : A.streaks([W * .05, H * .28, W * .9, H * .46], { seed: 'bin1', dir: 'x', n: 30 });
            A.stroke(c.back, d1, C.ink, c.pen * 1.3, 'from1');
          } },
        // tick 0: IMPACT — both squash into each other over a paper-white burst; ticks 1+: they hold, jolted
        'b-hit': { f: 'yolk', html: '<b class="p cn">弗雷德</b><i class="p word">FRED</i>',
          marks: function (c) {
            var a = c.rect('.cn'), b = c.rect('.word'), m = c.min;
            var sx = c.port ? c.W * .5 : (a.r + b.l) / 2, sy = c.port ? (a.b + b.t) / 2 : (a.cy + b.cy) / 2;
            // the burst is the impact frame; it doesn't vanish on the next tick (a flash) but settles to a
            // smaller second pose behind the lockup — the dent the hit left
            var R0 = m * (c.port ? .62 : .5), b0 = A.burst(sx, sy, R0, { seed: 'bhit', n: 11 }), b1 = A.burst(sx, sy, R0 * .72, { seed: 'bhit', n: 11 });
            A.fill(c.back, b0, C.cream, 'only0'); A.stroke(c.back, b0, C.ink, c.pen * 1.3, 'only0');
            A.fill(c.back, b1, C.cream, 'from1'); A.stroke(c.back, b1, C.ink, c.pen * 1.1, 'from1');
          } }
      },
      first: [['b-in', 2], ['b-hit', 4]],
      payoff: ['b-hit', 1, 2]
    },

    c: {
      shots: {
        // one poster: the spine drops onto a shelf (tick 0 mid-drop, tick 1 lands, then it stands)
        'c-spine': { f: 'gum', html: '<div class="p spine"><b class="sp-cn">弗雷德</b><i class="sp-en">FRED</i><span class="sp-band t"></span><span class="sp-band b"></span></div>',
          marks: function (c) {
            var s = c.rect('.spine'), m = c.min, W = c.W, H = c.H, shelf = c.port ? H * .9 : H * .9;
            // the shelf: one confident pen line with a little honest wobble
            var r = Pen.rng('r2-10-shelf'), pts = [];
            for (var i = 0; i <= 8; i++) pts.push([-20 + (W + 40) * i / 8, shelf + (r() - .5) * m * .006]);
            A.stroke(c.back, Pen.smooth(pts), C.ink, c.pen * 1.5);
            // tick 0, mid-drop: fall streaks down both sides of it
            var sw0 = Math.min(s.l, W - s.r) * .5;
            A.stroke(c.back, A.streaks([s.l - sw0 - m * .02, -10, sw0, H * .72], { seed: 'spD1', dir: 'y', n: 7 }), C.ink, c.pen * 1.1, 'only0');
            A.stroke(c.back, A.streaks([s.r + m * .02, -10, sw0, H * .72], { seed: 'spD2', dir: 'y', n: 7 }), C.ink, c.pen * 1.1, 'only0');
            // it lands: focus lines aimed at the spine (the OP's hero treatment), stopping short of it
            var fl = A.focus(W, H, s.cx, s.cy, { seed: 'spine', rx: s.w * (c.port ? .62 : .72), ry: H * .58, n: c.port ? 40 : 56, spread: .35 });
            A.stroke(c.back, fl.thin, C.ink, c.pen * .8, 'from1'); A.stroke(c.back, fl.thick, C.ink, c.pen * 1.5, 'from1');
            // …and throws dust ticks out from both bottom corners
            A.stroke(c.front, A.ticks(s.l - m * .012, shelf - m * .012, -2.9, m * .06, { seed: 'spL', n: 2, spread: .5 }), C.ink, c.pen * 1.5, 'from1');
            A.stroke(c.front, A.ticks(s.r + m * .012, shelf - m * .012, -.24, m * .06, { seed: 'spR', n: 2, spread: .5 }), C.ink, c.pen * 1.5, 'from1');
            // the colophon: the bird, printed small at the foot of the spine, under the double rule
            var sp = c.el.querySelector('.spine'), band = sp.querySelector('.sp-band.b'), sw = sp.offsetWidth, sh = sp.offsetHeight;
            var y0 = band.offsetTop + band.offsetHeight, room = sh - y0, hb = room * .5, k = hb / 127, svg = A.svg(sw, sh, 'colo');
            A.birdMark(svg, k, sw / 2 + 155.5 * k, y0 + (room - hb) * .5 - 125 * k, Math.max(2, hb / 22), C.cream, -1);
            sp.appendChild(svg);
          } }
      },
      first: [['c-spine', 6]],
      payoff: ['c-spine', 1, 1]
    }
  };

  window.R10Names = V;
})();
