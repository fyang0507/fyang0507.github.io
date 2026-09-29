/* design/2026-09-building · A · 翻面, the back of the card. Unpin is unchanged: the pin pops, the card comes to your hand
   on its spring. Then, instead of a note hinging open under it, the card turns over in your hand (physics clock: a
   spring with one small overshoot) and its back is what the face doesn't say — the chapters inside, the one figure,
   status and dates, what's live and what's WIP, the links. Nothing on the board changes at rest.
   decorate(k) gives every card a back (the chapters for the two projects with pages, the working diagram for the
   instruments, the note for the small slips); hand is Unpin's hook; flatten(slot) lays the back flat just before a
   view transition captures it (00-vt.js turns it the rest of the way over, into the project page's cover card). */
import { esc, github } from '../../lib/building/cards.js';

const D = () => window.BD_PREVIEW || {};
const SPRING = () => Motion.springEase(210, 21), FLIP_MS = () => Motion.springEase.duration(210, 21);

function figure(f, small) {
  if (!f) return '';
  const steps = f.steps.map((s, i) => '<li class="fig-step"><span>' + esc(s) + '</span></li>' + (i < f.steps.length - 1 ? '<li class="fig-arrow" aria-hidden="true">→</li>' : '')).join('');
  return '<figure class="bk-fig' + (small ? ' bk-fig--small' : '') + '"><figcaption>' + esc(f.cap) + '</figcaption><ol class="fig-line" aria-label="' + esc(f.steps.join(' then ')) + '">' + steps + '</ol>' +
    (f.exit ? '<p class="fig-exit"><span aria-hidden="true">↳</span> ' + esc(f.exit) + '</p>' : '') + '</figure>';
}
const meta = (list) => '<div class="project-meta">' + list.map((m) => '<span>' + esc(m) + '</span>').join('') + '</div>';
const repo = (p, label) => p.repo ? '<a class="github-link bk-repo" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer">' + github + '<span class="pen-t">' + (label || 'repository ↗') + '</span></a>' : '';

function chapters(list) {
  return '<ol class="bk-ch">' + list.map((c) => '<li><a class="bk-row" href="' + esc(c.href) + '"' + (c.live ? ' data-live' : '') + '>' +
    '<span class="bk-n">' + c.n + '</span><span class="bk-t"><span class="pen-t">' + esc(c.t) + '</span>' + (c.state ? ' <em class="bk-state">' + esc(c.state) + '</em>' : '') + '</span>' +
    '<span class="bk-l">' + esc(c.wip ? c.line : c.line) + (c.live ? ' <span class="bk-live" title="not mocked this round: the live page">live ↗</span>' : '') + '</span></a>' +
    (c.wip ? '<span class="bk-wip" aria-label="Work in progress: ' + esc(c.wip) + '"><span class="bk-wip-p" aria-hidden="true"></span><b>WIP</b><small>' + esc(c.wip) + '</small></span>' : '') + '</li>').join('') + '</ol>';
}

export function backHTML(p, kind, closeBtn) {
  const d = D()[p.id], head = (k) => '<div class="bk-head"><span>' + k + '</span>' + closeBtn(p) + '</div>';
  if (d && d.chapters) {
    return head(esc(d.what) + ' · ' + esc(d.count) + ' <span lang="zh">背面</span>') + chapters(d.chapters) + figure(d.figure, kind !== 'lead') +
      '<div class="bk-foot">' + meta(d.status.concat(d.source ? [d.source] : [])) +
      '<div class="bk-go"><a class="project-cta bk-enter" href="' + esc(d.enter.href) + '"><span class="pen-t">' + esc(d.enter.label) + '</span></a>' + repo(p) + '</div></div>';
  }
  if (d && d.figure) {
    return head(esc(d.what) + ' · ' + esc(d.count)) + figure(d.figure, true) + d.lines.map((l) => '<p class="bk-p">' + esc(l) + '</p>').join('') +
      '<div class="bk-foot">' + meta(d.status) + '<div class="bk-last"><p class="bk-none">' + esc(d.none) + '</p>' + repo(p, 'Open repository ↗') + '</div></div>';
  }
  return head('the back') + '<p class="bk-p">' + esc(p.note) + '</p><div class="bk-foot">' + meta([p.lifecycle, p.period, 'updated ' + p.updated]) + repo(p, 'Open repository ↗') + '</div>';
}

// every card gets two faces: the paper as it is, and its back, stacked in one .flip that turns over in the hand
export function decorate(k, closeBtn) {
  k.slots.forEach((s) => {
    const paper = s.swing.querySelector('.paper'), flip = document.createElement('div'), back = document.createElement('div');
    flip.className = 'flip';
    back.className = 'pj-back pj-back--' + s.kind;
    back.dataset.paper = s.kind === 'lead' ? 'wheat' : 'cream';
    back.innerHTML = '<div class="bk-in">' + backHTML(s.project, s.kind, closeBtn) + '</div>';
    back.inert = true;
    paper.replaceWith(flip);
    flip.append(paper, back);
    s.flip = flip; s.back = back;
  });
}

function turn(s, over, instant) {
  const f = s.flip, to = over ? 180 : 0;
  s.back.inert = !over;
  s.swing.querySelector('.paper').inert = over;
  f.getAnimations().forEach((a) => a.cancel());
  s.swing.classList.toggle('turned', over);
  if (instant || Motion.reduced()) { f.style.transform = 'rotateY(' + to + 'deg)'; return 0; }
  const from = over ? 0 : 180;
  f.animate([{ transform: 'rotateY(' + from + 'deg)' }, { transform: 'rotateY(' + to + 'deg)' }], { duration: FLIP_MS(), easing: SPRING() });
  f.style.transform = 'rotateY(' + to + 'deg)';
  return Math.round(FLIP_MS() * 0.55);
}

export const hand = (closeBtn) => ({
  scale: { lead: 1, featured: 1.34, instrument: 1.62, standard: 1.9 },
  panel: () => null,
  arrive(st) {
    turn(st.s, true);
    const c = st.card.querySelector('.pj-back .unpin-close');
    setTimeout(() => { if (c && st.card.isConnected) c.focus({ preventScroll: true }); }, 120);
  },
  depart(st) { return turn(st.s, false); }
});

// just before a view transition captures the card in hand: the back laid flat, facing you, with no 3D in the way
export function flatten(s) {
  s.flip.getAnimations().forEach((a) => a.cancel());
  s.flip.style.transform = 'none';
  s.swing.classList.add('flat-back');
}
