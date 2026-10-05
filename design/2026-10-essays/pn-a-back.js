/* design/2026-10-essays/pn-a-back.js — round 2 of candidate A (Fred picked the shelf): the way back to all writing,
   three ways, each something a shelf carries, quiet beside the two books, in the page's language, with the pen's
   states (penIn: the marks drawn on the paper that moves, the link carrying the listeners).
     tag    吊牌: a paper tag on a thread from the plank's underside; pointed at, it swings once and settles
     tab    「全部」签: Writing's own "all 全部" index tab, pulled out from under the lip; pointed at, it comes out a little
     print  印在板边: printed straight on the lip, like a library shelf's range, nothing else
     slip   round 1's printed slip on the lip, kept to compare
   html[data-pn-back] picks one (pn-play.html's bar); the tab by default. */
import { bi, pen, penIn } from './pn-util.js';

const LABEL = () => bi('← all writing', '← 全部文章');

export function backHTML(kind, count) {
  if (kind === 'tag') return '<a class="pa-back pa-back--tag" href="Writing.dc.html"><i class="pa-thread"></i>' +
    '<span class="pa-tag"><i class="pa-hole"></i><span class="pa-back-t">' + LABEL() + '</span></span></a>';
  if (kind === 'tab') return '<a class="pa-back pa-back--tab" href="Writing.dc.html"><span class="pa-tab">' +
    '<span class="pa-back-t">' + LABEL() + '</span><span class="pa-back-n">' + count + '</span></span></a>';
  if (kind === 'print') return '<a class="pa-back pa-back--print" data-paper="wheat" href="Writing.dc.html"><span class="pa-back-t">' + LABEL() + '</span></a>';
  return '<a class="pa-slip" href="Writing.dc.html"><span class="pa-slip-t">' + bi('← the shelf', '← 书架') + '</span></a>';
}

export function wireBack(root, kind) {
  const a = root.querySelector('.pa-back, .pa-slip');
  if (kind === 'tag') penIn(a, a.querySelector('.pa-tag'), a.querySelector('.pa-back-t'));
  else if (kind === 'tab') penIn(a, a.querySelector('.pa-tab'), a.querySelector('.pa-back-t'));
  else pen(a, a.querySelector('.pa-back-t, .pa-slip-t'), { focus: { gap: 3, gy: 2 } });
}
