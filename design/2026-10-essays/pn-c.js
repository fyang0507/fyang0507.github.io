/* design/2026-10-essays/pn-c.js — candidate C, the pencil line goes on: under the essay, a three-line contents in
   the order the essays were written, 上一篇 the line above and 下一篇 the line below. Reading's own pencil, the margin
   rail that closes the essay with its ✓, carries on down the margin at the rail's x on the desk and ticks each line;
   this essay's line carries the wheat band, the current mark. With no newer essay the pencil goes on dashed to つづく;
   with no older one it starts at this essay. Nothing here is a card: type, one pencil line and the pen.
   Hover: the pen underlines the title; focus: 「 」. */
import { bi, href, book, minutes, pen, still, keep } from './pn-util.js';

const NS = 'http://www.w3.org/2000/svg';

function row(b, cls, k, link) {
  const inner = '<span class="pc-d">' + b.ymd + '</span>' +
    '<span class="pc-b"><span class="pc-t">' + bi(b.en, b.zh) + '</span><span class="pc-m">' + minutes(b) + (b.tag ? ' · ' + bi(b.tag, b.tagZh) : '') + '</span></span>' +
    '<span class="pc-k">' + k + '</span>';
  return '<li class="pc-row ' + cls + '"' + (link ? '' : ' aria-current="page"') + '>' + (link ? '<a class="pc-a" href="' + href(b.p) + '">' + inner + '</a>' : '<span class="pc-a">' + inner + '</span>') + '</li>';
}

export function buildC(pn, n) {
  const self = book(n.self), prev = n.prev && book(n.prev), next = n.next && book(n.next);
  const top = prev ? row(prev, 'pc-prev', bi('previous', '上一篇'), true)
    : '<li class="pc-row pc-prev pc-quiet"><span class="pc-a"><span class="pc-d"></span><span class="pc-b"><span class="pc-q">' + bi('this is the first one', '这是最早的一篇') + '</span></span><span class="pc-k">' + bi('previous', '上一篇') + '</span></span></li>';
  const bottom = next ? row(next, 'pc-next', bi('next', '下一篇'), true)
    : '<li class="pc-row pc-next pc-quiet"><span class="pc-a"><span class="pc-d"></span><span class="pc-b"><span class="pc-g" lang="ja">つづく</span><span class="pc-q">' + bi('still being written', '还在写') + '</span></span><span class="pc-k">' + bi('next', '下一篇') + '</span></span></li>';
  pn.innerHTML = '<div class="pc"><svg class="pc-ink" aria-hidden="true" width="1" height="1"><path class="pc-line"/><path class="pc-dash"/><g class="pc-ticks"></g></svg>' +
    '<ol class="pc-list">' + top + row(self, 'pc-cur', bi('this one', '这一篇'), false) + bottom + '</ol></div>';

  pn.querySelectorAll('a.pc-a').forEach((a) => pen(a, a.querySelector('.pc-t')));
  const cur = pn.querySelector('.pc-cur');
  still(cur.querySelector('.pc-a'), cur.querySelector('.pc-t'));

  const box = pn.querySelector('.pc'), svg = box.querySelector('svg');
  const draw = () => ink(box, svg, self.p.id, !!prev, !!next);
  const ro = new ResizeObserver(draw); ro.observe(box);
  const mo = new MutationObserver(draw); mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  keep(() => { ro.disconnect(); mo.disconnect(); });
  draw();
}

/* The pencil: one graphite line down the margin through a tick at each title, the rail's hand (rail.js wobble): a
   slow wobble seeded by the essay, so the same essay always gets the same line. */
function ink(box, svg, seed, hasPrev, hasNext) {
  const rows = [...box.querySelectorAll('.pc-row')], bt = box.getBoundingClientRect().top;
  const x = parseFloat(getComputedStyle(box).getPropertyValue('--pc-x')) || 0;
  const ys = rows.map((r) => { const t = r.querySelector('.pc-t, .pc-q').getBoundingClientRect(); return t.top - bt + Math.min(t.height, 30) / 2; });
  const y0 = hasPrev ? ys[0] : ys[1], y1 = hasNext ? ys[2] : ys[1];
  const r = Pen.rng(seed + '|pc'), wob = (a, b) => {
    const n = Math.max(2, Math.round((b - a) / 40)), pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x + (r() - .5) * 1.5 + Math.sin(t * 6 + r()) * .4, a + t * (b - a)]); }
    return Pen.smooth(pts);
  };
  svg.querySelector('.pc-line').setAttribute('d', wob(y0, y1));
  svg.querySelector('.pc-dash').setAttribute('d', hasNext ? '' : wob(ys[1], ys[2]));
  const g = svg.querySelector('.pc-ticks'); g.textContent = '';
  ys.forEach((y, i) => {
    if (i === 0 && !hasPrev) return;
    const p = document.createElementNS(NS, 'path'), w = i === 1 ? 7 : 5, tilt = (r() - .5) * 1.4;
    p.setAttribute('d', 'M' + (x - w) + ' ' + (y + tilt) + ' L' + (x + w) + ' ' + (y - tilt));
    p.setAttribute('class', 'pc-tick' + (i === 1 ? ' pc-here' : '') + (i === 2 && !hasNext ? ' pc-open' : ''));
    g.appendChild(p);
  });
}
