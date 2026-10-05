/* lib/reading/shelf.js — the end of an essay: a short stretch of Writing's shelf (design/2026-10-essays, A).
   The essay you have just read is the book in your hand, so its slot is empty and its two neighbours lean into the
   gap, as Writing's do when a book is pulled: previous (the older essay) on the left, next (the newer) on the right.
   Each is the same book as on Writing's shelf (its spine's width, height and tone come from its place in the
   newest-first order, as lib/writing/case.js posts() sets them), named on a label beside it. With no newer essay,
   Writing's つづく ghost stands where it will go; before the oldest, the shelf just ends. A paper tag hangs from the
   plank on its thread: the way back to all writing.
   The pen: every link is Tier.wire's (hover draws the coral line under its name, never on touch; a press draws the
   wheat band; keyboard focus 「 」). The physics clock: a book pointed at comes up out of its lean (shelf.css), and the
   tag swings square on a spring with one small overshoot, and back when let go. Under reduced motion neither moves.
   shelf.css comes with this module: inserted when the shelf is built, for an essay that has one (script-inserted, so never render-blocking: the shelf
   is never in the first screen), and the shelf is built once it applies. initShelf(ctx): ctx is bus.js's. */
const html = document.documentElement;
const NS = 'http://www.w3.org/2000/svg';
const sheet = () => new Promise((done) => {
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = new URL('./shelf.css', import.meta.url).href;
  l.onload = l.onerror = done;
  document.head.appendChild(l);
});

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const bi = (en, zh) => '<span class="en">' + esc(en) + '</span><span class="zh" lang="zh">' + esc(zh) + '</span>';

/* An essay as Writing's shelf has it (case.js posts(): series books are 30 wide, 96% tall, in the dark cloth; the
   rest step through four widths, a spread of heights and four tans by their place, id = index + 1). */
function book(list, p) {
  const id = list.indexOf(p) + 1, en = p.title || p.titleZh || '', zh = p.titleZh || p.title || '';
  const m = en.match(/Stories We Live\s+(\d+)/i) || zh.match(/故事\s*0?(\d+)/), series = m ? Number(m[1]) : null;
  return {
    p, en, zh, series, min: p.readingMin || 1, ym: (p.date || '').slice(0, 7).replace('-', '·'),
    w: series ? 30 : 22 + (id % 4) * 4, h: (series ? 96 : 58 + ((id * 29) % 38)) / 100, tone: series ? 's' : String(id % 4)
  };
}
function spine(b, side) {
  return '<span class="pn-book pn-' + side + '" aria-hidden="true" data-tone="' + b.tone + '" style="--w:' + b.w + ';--h:' + b.h + '">' +
    '<i class="pn-board"></i><i class="pn-pages"></i><span class="pn-spine"><i class="pn-band b1"></i><i class="pn-band b2"></i><i class="pn-band b3"></i>' +
    '<span class="pn-st" data-en="' + esc(b.en) + '" data-zh="' + esc(b.zh) + '"></span>' +
    (b.series ? '<span class="pn-badge">' + String(b.series).padStart(2, '0') + '</span>' : '') + '</span></span>';
}
const kicker = (en, zh) => '<span class="pn-k">' + bi(en, zh) + '</span>';
function label(b, k) {
  return '<span class="pn-lab">' + k + '<span class="pn-t">' + bi(b.en, b.zh) + '</span>' +
    '<span class="pn-m">' + b.ym + ' · ' + bi('~' + b.min + ' min', '约 ' + b.min + ' 分钟') + '</span></span>';
}
const link = (b, side, inner) => '<a class="pn-item pn-' + side + '" href="Reading.dc.html?post=' + encodeURIComponent(b.p.id) + '">' + inner + '</a>';

function markup(list, i) {
  const prev = list[i + 1] && book(list, list[i + 1]), next = i > 0 && book(list, list[i - 1]), self = book(list, list[i]);
  const PREV = kicker('previous', '上一篇'), NEXT = kicker('next', '下一篇');
  const left = prev ? link(prev, 'prev', label(prev, PREV) + spine(prev, 'l'))
    : '<span class="pn-item pn-prev pn-quiet"><span class="pn-lab">' + PREV + '<span class="pn-q">' + bi('this is the first one', '这是最早的一篇') + '</span></span></span>';
  const right = next ? link(next, 'next', spine(next, 'r') + label(next, NEXT))
    : '<span class="pn-item pn-next pn-quiet"><span class="pn-ghost" aria-hidden="true"><i class="pn-gtop"></i><span class="pn-gfront"><span lang="ja">つづく</span></span></span>' +
      '<span class="pn-lab">' + NEXT + '<span class="pn-q">' + bi('still being written', '还在写') + '</span></span></span>';
  return '<div class="pn-shelf"><div class="pn-row">' + left + '<span class="pn-gap" style="--w:' + self.w + '"></span>' + right + '</div>' +
    '<div class="pn-plank"><svg class="pn-wood" aria-hidden="true"><path class="pn-face"/><path class="pn-lip"/><g class="pn-stip"></g></svg>' +
    '<span class="pn-here" aria-hidden="true">' + bi('↑ in your hand', '↑ 在你手里') + '</span>' +
    '<a class="pn-tag" href="Writing.dc.html"><i class="pn-hole"></i><span class="pn-tag-t"><span class="pn-arrow" aria-hidden="true">← </span>' + bi('all writing', '全部文章') + '</span></a>' +
    '</div></div>';
}

/* Writing's spine fit (case.js fitTitle), shortened: one line at the spine's size or a little smaller, else two
   balanced lines, else one line down to the floor, clipped past it. Chinese stands upright, Latin reads top to bottom. */
function fitSpine(bk) {
  const t = bk.querySelector('.pn-st'), sp = bk.querySelector('.pn-spine'), zh = !html.classList.contains('lang-en'), s = t.style;
  t.textContent = zh ? t.dataset.zh : t.dataset.en; t.lang = zh ? 'zh' : 'en';
  const len = Math.floor(sp.clientHeight * (bk.querySelector('.pn-badge') ? 0.66 : 0.84)) - 4, wide = sp.clientWidth - 6, base = zh ? 12.5 : 11.5, FLOOR = 8.2;
  const one = (f) => { s.whiteSpace = 'nowrap'; s.maxHeight = ''; s.fontSize = f + 'px'; return t.scrollHeight <= len && t.offsetWidth <= wide; };
  const two = (f) => { s.whiteSpace = 'normal'; s.maxHeight = len + 'px'; s.fontSize = f + 'px'; return t.scrollHeight <= len && t.offsetWidth <= wide; };
  for (let f = base; f >= base * 0.76; f -= 0.25) if (one(f)) return;
  for (let f = Math.min(base, wide / 2.6); f >= FLOOR; f -= 0.25) if (two(f)) return;
  for (let f = base * 0.76; f >= FLOOR; f -= 0.25) if (one(f)) return;
  one(FLOOR);
}

/* The plank: its top face (the ends turn in as it goes back) and its lip, and Writing's contact under each book,
   three rows of countable dots, big at the foot, smaller forward (case.js stipple()). From layout boxes, so a book's
   lean never moves its contact. The books stand FOOT px into the top face (shelf.css .pn-row's negative margin). */
const FACE = 14, LIP = 20, FOOT = 9;
function plank(root) {
  const svg = root.querySelector('.pn-wood'), W = svg.clientWidth, o = 0.75, x0 = svg.getBoundingClientRect().left, stip = svg.querySelector('.pn-stip');
  if (!W) return;
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (FACE + LIP + 2));
  svg.querySelector('.pn-face').setAttribute('d', 'M' + (10 + o) + ' ' + o + 'H' + (W - 10 - o) + 'L' + (W - o) + ' ' + FACE + 'H' + o + 'Z');
  svg.querySelector('.pn-lip').setAttribute('d', 'M' + o + ' ' + FACE + 'H' + (W - o) + 'V' + (FACE + LIP) + 'H' + o + 'Z');
  stip.textContent = '';
  root.querySelectorAll('.pn-book').forEach((bk) => {
    const a = bk.parentElement, l = a.getBoundingClientRect().left - x0 + bk.offsetLeft - 3, r = l + bk.offsetWidth + 6;
    [[0.95, 1.1, 0], [0.7, 2.7, 1.5], [0.45, 4.2, 0.4]].forEach(([rad, dy, off]) => {
      for (let x = l + 1.2 + off; x < r; x += 3.2) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', (FOOT + dy).toFixed(1)); c.setAttribute('r', rad);
        c.setAttribute('class', a.classList.contains('pn-prev') ? 'pn-c-l' : 'pn-c-r');
        stip.appendChild(c);
      }
    });
  });
}

/* The tag on its thread, pointed at or focused: it swings square on a spring with one small overshoot (ζ ≈ 0.6), and
   back when let go, from wherever it is. Touch has no hover: there it hangs, and a press is the pen's. */
const K = 170, C = 16;
function hang(tag) {
  let hovered = false, focused = false;
  const swing = () => {
    const up = hovered || focused;
    if (Motion.reduced() || up === tag.classList.contains('up')) return;
    const from = getComputedStyle(tag).transform;
    tag.getAnimations().forEach((a) => a.cancel());
    tag.classList.toggle('up', up);
    tag.animate([{ transform: from }, { transform: getComputedStyle(tag).transform }], { duration: Motion.springEase.duration(K, C), easing: Motion.springEase(K, C) });
  };
  tag.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') { hovered = true; swing(); } });
  tag.addEventListener('pointerleave', () => { hovered = false; swing(); });
  tag.addEventListener('focus', () => { focused = tag.matches(':focus-visible'); swing(); });
  tag.addEventListener('blur', () => { focused = false; swing(); });
  Motion.onReduced((on) => { if (on) { tag.getAnimations().forEach((a) => a.cancel()); tag.classList.remove('up'); } });
}

export function initShelf(ctx) {
  const list = window.FY_POST_INDEX || [], i = list.findIndex((p) => p.id === ctx.post.id), pn = ctx.root.querySelector('.pn');
  if (i < 0 || !pn) return;
  sheet().then(() => FY.styled(() => {
    pn.innerHTML = markup(list, i);
    pn.querySelectorAll('a.pn-item').forEach((a) => Tier.wire(a, { target: a.querySelector('.pn-t') }));
    const tag = pn.querySelector('.pn-tag');
    Tier.wire(tag, { target: tag.querySelector('.pn-tag-t'), focus: { gap: 3, gy: 2 } });
    hang(tag);
    const lay = () => { pn.querySelectorAll('.pn-book').forEach(fitSpine); plank(pn); };
    ctx.onLayout(lay);
    lay();
  }));
}
