/* design/2026-10-essays/pn-b.js — candidate B, in hand: the two neighbours as Writing shows a book it has pulled off
   the shelf, the front board with the real cover under a paper obi (both titles, the page's language first; month,
   length and tag; the dry pencilled aside), one in each hand: the older left, the newer right. A board keeps its
   size whatever is beside it. With no newer essay, Writing's つづく ghost holds the right hand; with no older one,
   the left holds the library's bookplate, the inside of the front cover, where the collection starts.
   Hover: the board comes square and up on the physics clock, and the pen underlines its title; focus: 「 」. */
import { esc, bi, href, book, minutes, penIn } from './pn-util.js';

// the other language's title, under the first: in English the Chinese title, in Chinese the English one
const other = (b) => '<span class="en" lang="zh">' + esc(b.zh) + '</span><span class="zh" lang="en">' + esc(b.en) + '</span>';

// a long title keeps the obi to one title, so the cover still shows above it (Writing steps a long title down instead)
const long = (b) => (b.en.length > 30 ? ' data-long-en' : '') + ([...b.zh].length > 12 ? ' data-long-zh' : '');

function board(b, k, side) {
  const two = b.en !== b.zh;
  return '<a class="pb-item pb-' + side + '" href="' + href(b.p) + '"><span class="pb-k">' + k + '</span>' +
    '<span class="pb-board"' + long(b) + '><span class="pb-img"><img alt="" decoding="async"></span>' +
    '<span class="pb-obi"><span class="pb-t">' + bi(b.en, b.zh) + '</span>' + (two ? '<span class="pb-s">' + other(b) + '</span>' : '') +
    '<span class="pb-m"><span class="pb-ml"><b>' + b.ym + '</b> · <b>' + minutes(b) + '</b></span>' +
    (b.tag ? '<span class="pb-ml"><b>' + esc(b.tag) + '</b> · <b lang="zh">' + esc(b.tagZh) + '</b></span>' : '') + '</span>' +
    '<span class="pb-note"><b>' + esc(b.aside[0]) + '</b><b lang="zh">' + esc(b.aside[1]) + '</b></span></span></span></a>';
}
const K_PREV = bi('← previous', '← 上一篇'), K_NEXT = bi('next →', '下一篇 →');

export function buildB(pn, n) {
  const prev = n.prev && book(n.prev), next = n.next && book(n.next), first = (n.prev ? null : book(n.self));
  const left = prev ? board(prev, K_PREV, 'prev')
    : '<span class="pb-item pb-prev pb-quiet"><span class="pb-k">' + K_PREV + '</span><span class="pb-plate">' +
      '<span class="pb-exlib">EX LIBRIS<b>fred yang</b><span lang="zh">弗雷德藏书</span></span>' +
      '<span class="pb-from">' + bi('it starts here', '从这里开始') + '<i>' + first.p.date.slice(0, 4) + '</i></span></span></span>';
  const right = next ? board(next, K_NEXT, 'next')
    : '<span class="pb-item pb-next pb-quiet"><span class="pb-k">' + K_NEXT + '</span><span class="pb-ghost"><span lang="ja">つづく</span>' +
      '<span class="pb-from">' + bi('still being written', '还在写') + '</span></span></span>';
  pn.innerHTML = '<div class="pb">' + left + right + '</div>';
  [[n.prev, 'prev'], [n.next, 'next']].forEach(([p, side]) => {
    const img = p && pn.querySelector('.pb-' + side + ' img');
    if (!img) return;
    img.loading = 'lazy';                                   // before the source, so it waits until the end is near
    img.sizes = '(max-width:640px) 170px, 192px';
    img.srcset = p.boardSrcset || ''; img.src = p.board || p.cover;
  });
  pn.querySelectorAll('a.pb-item').forEach((a) => penIn(a, a.querySelector('.pb-obi'), a.querySelector('.pb-t')));
}
