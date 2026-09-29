/* r3-10 · the name beat: a · 一字一切, the one Fred picked (from r2-10-op-names.js, unchanged; b and c are gone).
   弗 · 雷 · 德 one per cut, each alone and full-bleed, then FRED lands as the payoff: an accelerating drum on the
   OP's 12 fps held-pose clock, bilingual across the sequence and never inside a frame. r2-10-op-shots.js reads
   this as R10Names.a; layout lives in r3-10-page.css. */
(function () {
  var A = R10Art, C = R10Art.C;
  window.R10Names = {
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
      first: [['a-fu', 2], ['a-lei', 1], ['a-de', 1], ['a-fred', 2]]
    }
  };
})();
