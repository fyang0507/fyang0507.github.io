/* Home · the opener's OP: 1.5 s of posters on a 12 fps held-pose clock. Each shot is one full-bleed poster on its own
   flat field: one giant thing, one bilingual label, one mark family, drawn once per play from a seed (a person drew it
   once; re-rolling per play would be jitter). The name beat is 一字一切: 弗 · 雷 · 德, one character per cut, then FRED
   lands as the payoff. Then Fred caught mid-OP, the laptop, the camera, the book, and the bird's hero close-up, which
   does nothing: "…". Layout lives in opener.css (landscape, and a recomposed portrait); colours are its --op-* names. */
const NS = 'http://www.w3.org/2000/svg';
// The palette, by name (opener.css :root): coral is spent once, on Fred.
const C = { yolk: 'var(--op-yolk)', pool: 'var(--op-pool)', gum: 'var(--op-gum)', coral: 'var(--op-coral)', ink: 'var(--op-ink)', cream: 'var(--op-cream)', bird: 'var(--op-bird)', birdLine: 'var(--op-bird-line)' };
const f1 = (n) => Math.round(n * 10) / 10;
const R = (seed) => Pen.rng('10c·' + seed);               // the '10c·' prefix keeps each mark identical to the approved design
const seg = (x0, y0, x1, y1) => 'M' + f1(x0) + ' ' + f1(y0) + 'L' + f1(x1) + ' ' + f1(y1);

// ---- marks ----
// 集中線 focus lines: strokes aimed at (cx,cy) from beyond the frame, stopping on an irregular ellipse. o.skip leaves
// angular gaps so the lines never cross a label. Two groups (thin, thick): the weight varies as a hand's pressure does.
function focus(w, h, cx, cy, o) {
  const r = R(o.seed), n = o.n || 70, far = Math.hypot(w, h) * 1.2;
  let a = r() * 6.28, thin = '', thick = '';
  for (let i = 0; i < n; i++) {
    a += 6.2832 / n * (.45 + r() * 1.1);
    const k = 1 + r() * (o.spread == null ? .55 : o.spread), c = Math.cos(a), s = Math.sin(a), big = r() < .38, aa = Math.atan2(s, c);
    if (o.skip && o.skip.some((g) => aa > g[0] && aa < g[1])) continue;
    const d = seg(cx + c * far, cy + s * far, cx + c * o.rx * k, cy + s * o.ry * k);
    if (big) thick += d; else thin += d;
  }
  return { thin, thick };
}
// Speed streaks behind a smear: parallel strokes of unequal length; dir 'x' or 'y'; box = [x, y, w, h].
function streaks(box, o) {
  const r = R(o.seed), n = o.n || 16, vert = o.dir === 'y';
  let d = '';
  for (let i = 0; i < n; i++) {
    const across = box[vert ? 0 : 1] + r() * box[vert ? 2 : 3], len = box[vert ? 3 : 2] * (.25 + r() * .7), start = box[vert ? 1 : 0] + r() * (box[vert ? 3 : 2] - len);
    d += vert ? seg(across, start, across, start + len) : seg(start, across, start + len, across);
  }
  return d;
}
// Impact / "noticed" ticks: short strokes fanning out from a point (Fred's sticker-peek motif, scaled up).
function ticks(x, y, ang, len, o = {}) {
  const r = R(o.seed || 't'), n = o.n || 3, spread = o.spread || .9, gap = o.gap || len * .45;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = ang + (n === 1 ? 0 : (i / (n - 1) - .5) * spread) + (r() - .5) * .12, l = len * (.72 + r() * .4), g = gap * (.85 + r() * .3);
    d += seg(x + Math.cos(a) * g, y + Math.sin(a) * g, x + Math.cos(a) * (g + l), y + Math.sin(a) * (g + l));
  }
  return d;
}
// A blunt starburst: the camera's flash, drawn, never a white-out.
function burst(cx, cy, rad, o) {
  const r = R(o.seed), n = o.n || 13, pts = [], a0 = r() * 6.28;
  for (let i = 0; i < n * 2; i++) {
    const a = a0 + i / (n * 2) * 6.2832 + (r() - .5) * .12, k = i % 2 ? (.52 + r() * .1) : (.86 + r() * .3);
    pts.push(f1(cx + Math.cos(a) * rad * k) + ' ' + f1(cy + Math.sin(a) * rad * k));
  }
  return 'M' + pts.join('L') + 'Z';
}
// A small zigzag for 雷 (thunder): a drawn stroke, not an icon.
function zig(x, y, s, ang, o) {
  const r = R(o.seed), c = Math.cos(ang), sn = Math.sin(ang);
  let d = '';
  [[0, 0], [.42, .22], [.12, .46], [.6, .64], [.3, .86], [.8, 1.06]].forEach((p, i) => {
    const px = (p[0] + (r() - .5) * .06) * s * .5, py = (p[1] + (r() - .5) * .04) * s;
    d += (i ? 'L' : 'M') + f1(x + px * c - py * sn) + ' ' + f1(y + px * sn + py * c);
  });
  return d;
}
// Hand ellipsis: three dots of slightly unequal size.
function dots(x, y, s, o) {
  const r = R(o.seed), out = [];
  for (let i = 0; i < 3; i++) out.push({ x: x + i * s * 2.4 + (r() - .5) * s * .3, y: y + (r() - .5) * s * .35, r: s * (.44 + r() * .12) });
  return out;
}
function svg(w, h, cls) {
  const e = document.createElementNS(NS, 'svg');
  e.setAttribute('viewBox', '0 0 ' + f1(w) + ' ' + f1(h)); e.setAttribute('width', w); e.setAttribute('height', h);
  e.setAttribute('aria-hidden', 'true'); e.setAttribute('class', cls);
  return e;
}
// Colours go in as styles: they are var(--op-*) names, which presentation attributes can't resolve.
function node(parent, tag, attrs, style, cls) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  Object.assign(e.style, style);
  if (cls) e.setAttribute('class', cls);
  parent.appendChild(e); return e;
}
const stroke = (p, d, color, width, cls) => node(p, 'path', { d }, { fill: 'none', stroke: color, strokeWidth: f1(width), strokeLinecap: 'round', strokeLinejoin: 'round' }, cls);
const fill = (p, d, color, cls) => node(p, 'path', { d }, { fill: color }, cls);
const circle = (p, c, color, cls) => node(p, 'circle', { cx: f1(c.x), cy: f1(c.y), r: f1(c.r) }, { fill: color }, cls);

// The bird, frame 0 of its strip traced to a centre-line, redrawn at the close-up's register (a size change is a
// redraw, not a zoom). dir = -1 mirrors it to face right, the way it faces on the desk the next cut lands on.
const BIRD = { pts: [[207, 252], [126, 252], [123.6, 250], [118, 240], [115, 226], [116, 210], [121, 184], [120.9, 164], [118.9, 156], [116, 151.4], [111, 147.5], [104, 145], [110, 142.5], [121, 133.9], [133, 128], [144, 125], [157, 125], [168, 128], [178.2, 134], [184.4, 140], [190, 149], [193, 157], [195, 166], [195, 190], [193, 201], [193.1, 222], [198.5, 241], [201, 245.6], [207.4, 251]],
  eye: { x: 152.2, y: 152.1, r: 5.3 } };
function bird(parent, k, ox, oy, pen, dir) {
  const P = BIRD.pts.map((p) => [ox + dir * p[0] * k, oy + p[1] * k]), d = Pen.smooth(P.slice(11).concat(P.slice(0, 12))) + 'Z';
  fill(parent, d, C.bird); stroke(parent, d, C.birdLine, pen);
  circle(parent, { x: ox + dir * BIRD.eye.x * k, y: oy + BIRD.eye.y * k, r: BIRD.eye.r * k * 1.1 }, C.birdLine);
}

// ---- the shots ----
const label = (cn, en) => '<b class="p lb-cn" lang="zh">' + cn + '</b><i class="p lb-en">' + en + '</i>';
const SHOTS = {
  'a-fu': { f: 'yolk', html: '<b class="p gl" lang="zh">弗</b>', marks(c) {
    const g = c.rect('.gl'), m = c.min;
    stroke(c.front, ticks(g.r - g.w * .06, g.t + g.h * .1, -.8, m * .1, { seed: 'fu', n: 3, spread: 1.05 }), C.ink, c.pen * 1.6);
    stroke(c.front, ticks(g.l + g.w * .05, g.b - g.h * .08, 2.4, m * .07, { seed: 'fuB', n: 2, spread: .7 }), C.ink, c.pen * 1.6);
  } },
  'a-lei': { f: 'pool', html: '<b class="p gl" lang="zh">雷</b>', marks(c) {
    const g = c.rect('.gl'), m = c.min;
    stroke(c.back, zig(c.port ? c.W * .12 : g.l - m * .1, c.port ? g.t - m * .34 : g.t + g.h * .08, m * .26, -.35, { seed: 'lei1' }), C.cream, c.pen * 1.8);
    stroke(c.back, zig(c.port ? c.W * .72 : g.r + m * .04, c.port ? g.b + m * .06 : g.b - g.h * .5, m * .22, .3, { seed: 'lei2' }), C.cream, c.pen * 1.8);
  } },
  'a-de': { f: 'gum', html: '<b class="p gl" lang="zh">德</b>', marks(c) {
    const g = c.rect('.gl'), fl = focus(c.W, c.H, g.cx, g.cy, { seed: 'de', rx: g.w * .6, ry: g.h * .6, n: 64 });
    stroke(c.back, fl.thin, C.yolk, c.pen); stroke(c.back, fl.thick, C.yolk, c.pen * 1.9);
  } },
  'a-fred': { f: 'ink', html: '<i class="p word">FRED</i>', marks(c) {
    const w = c.rect('.word'), m = c.min;
    if (c.port) stroke(c.front, ticks(w.r + m * .02, w.t + m * .04, -.6, m * .1, { seed: 'fred', n: 3 }), C.yolk, c.pen * 1.6, 'from1');
    else stroke(c.front, ticks(w.l + w.w * .03, w.t + w.h * .12, -2.35, m * .09, { seed: 'fred', n: 3 }), C.yolk, c.pen * 1.6, 'from1');
  } },
  // 关于: Fred's portrait owns the one coral beat. Neutral, then the "surprised" frame: the OP caught him.
  me: { f: 'coral', html: '<div class="p ob me" data-op-bg="me"></div>' + label('关于', 'about!'), marks(c) {
    const o = c.rect('.ob'), m = c.min;
    stroke(c.front, ticks(o.r - o.w * .06, o.t + o.h * .08, -.85, m * .07, { seed: 'meT', n: 3, spread: 1 }), C.ink, c.pen * 1.5, 'from1');
  } },
  // The laptop whips in: one smear frame (its own silhouette stretched along the travel), then it lands.
  lap0: { f: 'pool', html: '<img class="p ob sil" data-op="laptop" alt="">', marks(c) {
    const s = c.rect('.sil');
    const d = c.port ? streaks([s.l - s.w * .02, -10, s.w * 1.04, s.t + s.h * .45 + 10], { seed: 'lap0', dir: 'y', n: 22 })
      : streaks([-10, s.t + s.h * .02, s.l + s.w * .5 + 10, s.h * .96], { seed: 'lap0', dir: 'x', n: 26 });
    stroke(c.front, d, C.ink, c.pen * 1.2);
  } },
  lap: { f: 'pool', html: '<img class="p ob" data-op="laptop" alt="">' + label('在造', 'building!'), marks(c) {
    const o = c.rect('.ob'), m = c.min, skip = c.port ? [[-2.2, -.95], [.92, 2.2]] : [[-.9, .75]];
    const fl = focus(c.W, c.H, o.cx, o.cy, { seed: 'lap', rx: o.w * (c.port ? .5 : .62), ry: o.h * (c.port ? .8 : .64), n: 60, skip, spread: .4 });
    stroke(c.back, fl.thin, C.ink, c.pen * .85); stroke(c.back, fl.thick, C.ink, c.pen * 1.6);
    stroke(c.front, ticks(o.l + o.w * .1, o.t + o.h * .1, -2.4, m * .075, { seed: 'lapT' }), C.ink, c.pen * 1.5);
  } },
  // 咔嚓: the flash is a drawn burst behind the camera on the second tick.
  cam: { f: 'gum', html: '<img class="p ob" data-op="camera" alt="">' + label('在拍', 'shooting!') + '<b class="p sfx from1"><span lang="zh">咔嚓</span> <i>click!</i></b>', marks(c) {
    const o = c.rect('.ob');
    fill(c.back, burst(o.l + o.w * .33, o.t + o.h * .5, Math.max(o.w, o.h) * .58, { seed: 'cam', n: 12 }), C.yolk, 'from1');
  } },
  // The book turns its own page on the hand's clock: one sprite frame per tick.
  book: { f: 'yolk', html: '<div class="p ob book" data-op-bg="book"></div>' + label('在写', 'writing!'), marks(c) {
    const o = c.rect('.ob'), m = c.min;
    stroke(c.front, ticks(o.cx + o.w * .2, o.t + o.h * .02, -1.2, m * .075, { seed: 'bookT', n: 3, spread: 1.1 }), C.ink, c.pen * 1.5);
    if (!c.port) stroke(c.front, ticks(o.l + o.w * .04, o.b - o.h * .12, 2.75, m * .06, { seed: 'bookB', n: 2, spread: .6 }), C.ink, c.pen * 1.5);
  } },
  // The deadpan: the full hero treatment for the bird (focus lines, ticks)… and it does nothing.
  bird: { f: 'pool', html: '', marks(c) {
    const W = c.W, H = c.H, B = BIRD;
    let k, ex, ey;
    if (c.port) { k = W / 74; ex = W * .3; ey = H * .4; } else { k = H / 68; ex = W * .43; ey = H * .47; }
    const ox = ex + B.eye.x * k, oy = ey - B.eye.y * k, pen = Math.max(9, k * 1.9);
    const fl = focus(W, H, ox - 150 * k, oy + 160 * k, { seed: 'bird', rx: k * 44, ry: k * 40, n: 64, spread: .3 });
    stroke(c.back, fl.thin, C.ink, c.pen, 'only0'); stroke(c.back, fl.thick, C.ink, c.pen * 1.8, 'only0');
    bird(c.front, k, ox, oy, pen, -1);
    stroke(c.front, ticks(ox - 117 * k, oy + 127 * k, -.79, k * 8, { seed: 'birdT', n: 3, spread: 1 }), C.ink, c.pen * 1.5, 'only0');
    const s = c.port ? k * 3.3 : k * 2.3, bx = c.port ? W * .84 - s * 4.8 : W * .935 - s * 4.8, by = c.port ? H * .13 : H * .72;
    dots(bx, by, s, { seed: 'birdD' }).forEach((d) => circle(c.front, d, C.ink, 'from1'));
  } }
};
// [shot, ticks]: an accelerating drum (弗 — 雷 德 — FRED), then the man, what he does, and the one who doesn't care.
// 18 ticks at 12 fps = 1.5 s. The mean luminance climbs one way through the objects (WCAG 2.3.1 plan).
export const LIST = [['a-fu', 2], ['a-lei', 1], ['a-de', 1], ['a-fred', 2], ['me', 2], ['lap0', 1], ['lap', 2], ['cam', 2], ['book', 2], ['bird', 3]];

// Builds every shot as a hidden full-bleed <section>; the marks are drawn once layout exists, aimed at where each
// hero actually landed. `src(key)` gives an OP hero's URL.
export function build(stage, src) {
  stage.innerHTML = '';
  const W = stage.clientWidth, H = stage.clientHeight, port = W / H < 5 / 6, min = Math.min(W, H), sr = stage.getBoundingClientRect();
  const pen = Math.max(3.4, Math.min(7, min * .0062));
  const out = LIST.map(([id, ticks]) => {
    const d = SHOTS[id], el = document.createElement('section');
    el.className = 'sh sh-' + id;
    el.style.setProperty('--f', C[d.f]);
    el.innerHTML = d.html;
    el.querySelectorAll('img[data-op]').forEach((im) => { im.src = src(im.dataset.op); });
    el.querySelectorAll('[data-op-bg]').forEach((e) => { e.style.backgroundImage = 'url("' + src(e.dataset.opBg) + '")'; });
    stage.appendChild(el);
    return { id, el, ticks };
  });
  out.forEach((o) => {
    const back = svg(W, H, 'fx back'), front = svg(W, H, 'fx front');
    o.el.insertBefore(back, o.el.firstChild); o.el.appendChild(front);
    SHOTS[o.id].marks({ W, H, port, min, pen, back, front, el: o.el, rect(sel) {
      const b = o.el.querySelector(sel).getBoundingClientRect(), x = b.left - sr.left, y = b.top - sr.top;
      return { l: x, t: y, r: x + b.width, b: y + b.height, w: b.width, h: b.height, cx: x + b.width / 2, cy: y + b.height / 2 };
    } });
  });
  return out;
}
