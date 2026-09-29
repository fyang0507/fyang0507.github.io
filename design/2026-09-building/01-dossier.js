/* design/2026-09-building · C · 档案, the dossier. A project with pages keeps a dossier pinned behind its card: at rest
   only its index tabs show, peeking past the card's right edge (one per chapter, so the board already says how much is
   inside). Unpin is unchanged; in your hand the dossier slides out from behind the card (physics clock, one small
   overshoot) and opens at its contents sheet: the chapters with a line each, the one figure, status and dates, what's
   WIP, the links, and the index tabs down its fore-edge. A tab is the way in: it travels to the project page's
   fore-edge (00-vt.js), and on the way back it tucks behind the card again. A slip without pages gets one sheet.
   decorate(k) adds the peeking tabs; hand is Unpin's hook. */
import { esc, github } from '../../lib/building/cards.js';

const D = () => window.BD_PREVIEW || {};
const SPRING = () => Motion.springEase(190, 19), MS = () => Motion.springEase.duration(190, 19);

export function decorate(k) {
  k.slots.forEach((s) => {
    const d = D()[s.project.id];
    if (!d || !d.chapters) return;
    const peek = document.createElement('div');
    peek.className = 'dos-peek';
    peek.setAttribute('aria-hidden', 'true');
    peek.innerHTML = d.chapters.map((c) => '<i class="dos-edge"><span>' + c.n + '</span></i>').join('');
    s.swing.insertBefore(peek, s.swing.querySelector('.paper'));
    s.peek = peek;
  });
}

const tabs = (d) => '<nav class="dos-tabs" aria-label="Chapters">' + d.chapters.map((c) => '<a class="dos-tab" href="' + esc(c.href) + '"' + (c.live ? ' data-live' : '') + '>' +
  '<span class="dt-n">' + c.n + '</span><span class="dt-t"><span class="pen-t">' + esc(c.t.toLowerCase()) + '</span></span></a>').join('') + '</nav>';
function fig(f) {
  return '<figure class="dos-fig"><figcaption>' + esc(f.cap) + '</figcaption><ol class="fig-line">' +
    f.steps.map((s, i) => '<li class="fig-step"><span>' + esc(s) + '</span></li>' + (i < f.steps.length - 1 ? '<li class="fig-arrow" aria-hidden="true">→</li>' : '')).join('') + '</ol>' +
    (f.exit ? '<p class="fig-exit"><span aria-hidden="true">↳</span> ' + esc(f.exit) + '</p>' : '') + '</figure>';
}
const meta = (list) => '<div class="project-meta">' + list.map((m) => '<span>' + esc(m) + '</span>').join('') + '</div>';

function sheet(p, kind, closeBtn) {
  const d = D()[p.id];
  const head = (label) => '<div class="dos-head"><span class="dos-label">' + label + '</span>' + closeBtn(p) + '</div>';
  if (d && d.chapters) {
    return '<div class="dos" data-paper="cream">' + head('dossier · ' + esc(p.title) + ' · ' + esc(d.count)) +
      '<ol class="dos-list">' + d.chapters.map((c) => '<li><a href="' + esc(c.href) + '"><span class="dl-n">' + c.n + '</span><span class="dl-t"><span class="pen-t">' + esc(c.h) + '</span>' +
        (c.state ? ' <em>' + esc(c.state) + '</em>' : '') + '</span><span class="dl-l">' + esc(c.line) + (c.live ? ' · live ↗' : '') + '</span></a>' +
        (c.wip ? '<span class="dos-wip"><span class="dw-p" aria-hidden="true"></span><b>WIP</b> ' + esc(c.wip) + '</span>' : '') + '</li>').join('') + '</ol>' +
      fig(d.figure) + '<div class="dos-foot">' + meta(d.status.concat(d.source ? [d.source] : [])) +
      (p.repo ? '<a class="github-link" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer">' + github + '<span class="pen-t">repository ↗</span></a>' : '') + '</div>' + tabs(d) + '</div>';
  }
  const lines = d && d.lines ? d.lines : [p.note], st = d ? d.status : [p.lifecycle, p.period, 'updated ' + p.updated];
  return '<div class="dos dos--one" data-paper="cream">' + head('one sheet · ' + esc(d ? d.count : 'repository only')) + (d ? fig(d.figure) : '') +
    lines.map((l) => '<p class="dos-p">' + esc(l) + '</p>').join('') + '<div class="dos-foot">' + meta(st) + '</div>' +
    (p.repo ? '<nav class="dos-tabs dos-tabs--one" aria-label="Where it lives"><a class="dos-tab" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer"><span class="dt-n">' + github + '</span><span class="dt-t"><span class="pen-t">repository ↗</span></span></a></nav>' : '') + '</div>';
}

export const hand = (closeBtn) => ({
  scale: { featured: 1.08, instrument: 1.2, standard: 1.3 },
  panel: (p, kind) => sheet(p, kind, closeBtn),
  arrive(st) {
    const el = st.panel;
    el.classList.add('open');
    if (st.s.peek) st.s.peek.classList.add('out');
    if (Motion.reduced()) return;
    el.animate([{ transform: 'translateY(-72%)' }, { transform: 'none' }], { duration: MS(), easing: SPRING() });
  },
  depart(st) {
    const el = st.panel;
    if (st.s.peek) st.s.peek.classList.remove('out');
    if (Motion.reduced()) { el.style.visibility = 'hidden'; return 0; }
    el.animate([{ transform: 'none' }, { transform: 'translateY(-72%)', opacity: 1, offset: .86 }, { transform: 'translateY(-72%)', opacity: 0 }], { duration: 240, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' });
    return 150;
  }
});
