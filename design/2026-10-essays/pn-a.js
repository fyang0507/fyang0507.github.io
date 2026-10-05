/* design/2026-10-essays/pn-a.js — candidate A, the shelf: a short stretch of Writing's shelf at the end of the essay.
   The book you are reading is out (in your hand), so its slot is empty and its neighbours lean into the gap, as
   Writing's do when a book is pulled. Each neighbour is the same book as on the shelf (its spine's width, height
   and tone come from its place in the order, lib/writing/case.js), with its name on a label beside it. Where there
   is no newer essay, Writing's つづく ghost stands in its place; where there is no older one, the shelf just ends.
   Time runs left to right here (older | gap | newer), as previous / next do; Writing's own shelf runs newest first.
   Hover: the book is lifted out of its lean on the physics clock and the pen underlines its name; focus: 「 」. */
import { esc, bi, href, book, minutes, pen, keep } from './pn-util.js';

const html = document.documentElement;

function spine(b, side) {
  return '<span class="pa-book pa-' + side + '" aria-hidden="true" style="--w:' + b.w + ';--h:' + b.h + '" data-tone="' + b.tone + '">' +
    '<i class="pa-side"></i><i class="pa-top"></i>' +
    '<span class="pa-spine"><i class="pa-band b1"></i><i class="pa-band b2"></i><i class="pa-band b3"></i>' +
    '<span class="pa-st" data-en="' + esc(b.en) + '" data-zh="' + esc(b.zh) + '"></span>' +
    (b.series ? '<span class="pa-badge">' + String(b.series).padStart(2, '0') + '</span>' : '') + '</span></span>';
}
function label(b, k) {
  return '<span class="pa-lab"><span class="pa-k">' + k + '</span><span class="pa-t">' + bi(b.en, b.zh) + '</span>' +
    '<span class="pa-m">' + b.ym + ' · ' + minutes(b) + '</span></span>';
}
const K_PREV = bi('previous', '上一篇'), K_NEXT = bi('next', '下一篇');

export function buildA(pn, n) {
  const self = book(n.self), prev = n.prev && book(n.prev), next = n.next && book(n.next);
  const left = prev
    ? '<a class="pa-item pa-prev" href="' + href(n.prev) + '">' + label(prev, K_PREV) + spine(prev, 'l') + '</a>'
    : '<span class="pa-item pa-prev pa-quiet"><span class="pa-lab"><span class="pa-k">' + K_PREV + '</span><span class="pa-q">' + bi('this is the first one', '这是最早的一篇') + '</span></span></span>';
  const right = next
    ? '<a class="pa-item pa-next" href="' + href(n.next) + '">' + spine(next, 'r') + label(next, K_NEXT) + '</a>'
    : '<span class="pa-item pa-next pa-quiet"><span class="pa-ghost"><i class="pa-gtop"></i><span class="pa-gfront"><span lang="ja">つづく</span></span></span>' +
      '<span class="pa-lab"><span class="pa-k">' + K_NEXT + '</span><span class="pa-q">' + bi('still being written', '还在写') + '</span></span></span>';
  pn.innerHTML = '<div class="pa">' +
    '<div class="pa-row">' + left +
      '<span class="pa-gap" style="--w:' + self.w + '"></span>' +
      right + '</div>' +
    '<div class="pa-plank"><svg class="pa-wood" aria-hidden="true"><path class="pa-ptop"/><path class="pa-lip"/><g class="pa-stip pa-stip-l"></g><g class="pa-stip pa-stip-r"></g></svg>' +
      '<span class="pa-here" aria-hidden="true">' + bi('↑ in your hand', '↑ 在你手里') + '</span>' +
      '<a class="pa-slip" href="Writing.dc.html"><span class="pa-slip-t">' + bi('← the shelf', '← 书架') + '</span></a></div>' +
    '</div>';

  pn.querySelectorAll('a.pa-item').forEach((a) => pen(a, a.querySelector('.pa-t')));
  const slip = pn.querySelector('.pa-slip');
  pen(slip, slip.querySelector('.pa-slip-t'), { focus: { gap: 3, gy: 2 } });

  // the spine titles, in the page's language, fitted the way Writing fits a spine; refitted when the language flips
  const fit = () => pn.querySelectorAll('.pa-book').forEach((bk) => fitSpine(bk));
  const wood = pn.querySelector('.pa-wood');
  const plank = () => drawPlank(wood, pn.querySelector('.pa-row'));
  const mo = new MutationObserver(fit); mo.observe(html, { attributes: true, attributeFilter: ['class'] });
  const ro = new ResizeObserver(() => { plank(); fit(); }); ro.observe(pn.querySelector('.pa'));
  keep(() => { mo.disconnect(); ro.disconnect(); });
  if (document.fonts) document.fonts.ready.then(fit);
  plank(); fit();
}

/* Writing's spine fit (case.js fitTitle), simplified: one line at the spine's size or a little smaller, else two
   balanced lines, else one line down to the floor, clipped past it. Chinese stands upright in a column, Latin turns
   to read top to bottom. */
function fitSpine(bk) {
  const t = bk.querySelector('.pa-st'), sp = bk.querySelector('.pa-spine'), zh = !html.classList.contains('lang-en');
  t.textContent = zh ? t.dataset.zh : t.dataset.en; t.lang = zh ? 'zh' : 'en';
  const series = !!bk.querySelector('.pa-badge'), H = sp.clientHeight, W = sp.clientWidth;
  const len = Math.floor(H * (series ? 0.66 : 0.84)) - 4, wide = W - 6, s = t.style, base = zh ? 12.5 : 11.5, FLOOR = 8.2;
  const one = (f) => { s.whiteSpace = 'nowrap'; s.maxHeight = ''; s.fontSize = f + 'px'; return t.scrollHeight <= len && t.offsetWidth <= wide; };
  const two = (f) => { s.whiteSpace = 'normal'; s.maxHeight = len + 'px'; s.fontSize = f + 'px'; return t.scrollHeight <= len && t.offsetWidth <= wide; };
  for (let f = base; f >= base * 0.76; f -= 0.25) if (one(f)) return;
  for (let f = Math.min(base, wide / 2.6); f >= FLOOR; f -= 0.25) if (two(f)) return;
  for (let f = base * 0.76; f >= FLOOR; f -= 0.25) if (one(f)) return;
  one(FLOOR);
}

// The plank under the row: its top face (the ends turn in as it goes back) and its lip, in Writing's plank colours,
// and Writing's contact under each book: three rows of countable dots, big at the foot, smaller forward (case.js
// stipple()). Measured from layout boxes, so a book's lean never moves its contact.
const NS = 'http://www.w3.org/2000/svg', D = 14, LIP = 20, FOOT = 9;
function drawPlank(svg, row) {
  const W = svg.clientWidth, inset = 10, o = 0.75;
  if (!W) return;
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (D + LIP + 2));
  svg.querySelector('.pa-ptop').setAttribute('d', 'M' + (inset + o) + ' ' + o + ' L' + (W - inset - o) + ' ' + o + ' L' + (W - o) + ' ' + D + ' L' + o + ' ' + D + ' Z');
  svg.querySelector('.pa-lip').setAttribute('d', 'M' + o + ' ' + D + ' L' + (W - o) + ' ' + D + ' L' + (W - o) + ' ' + (D + LIP) + ' L' + o + ' ' + (D + LIP) + ' Z');
  const sx = svg.getBoundingClientRect().left;
  [['l', '.pa-l'], ['r', '.pa-r']].forEach(([k, sel]) => {
    const g = svg.querySelector('.pa-stip-' + k), bk = row.querySelector(sel);
    g.textContent = '';
    if (!bk) return;
    const it = bk.parentElement.getBoundingClientRect(), x0 = it.left - sx + bk.offsetLeft - 3, x1 = x0 + bk.offsetWidth + 6;
    [[0.95, 1.1, 0], [0.7, 2.7, 1.5], [0.45, 4.2, 0.4]].forEach(([r, dy, off]) => {
      for (let x = x0 + 1.2 + off; x < x1; x += 3.2) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', (FOOT + dy).toFixed(1)); c.setAttribute('r', r);
        g.appendChild(c);
      }
    });
  });
}
