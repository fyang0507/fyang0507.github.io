/* Building · the dossier (design/2026-09-building, candidate C). A project with pages keeps a dossier pinned
   behind its card; at rest only its index tabs show, peeking past the card's right edge (cards.js). Unpinned, the card
   comes to your hand and the dossier slides out from under its lower edge on the physics clock (one small overshoot,
   then settle), open at its contents sheet: each chapter's own title and one line, the one figure, status and dates,
   the source and the repository, and the index tabs down its fore-edge, each a plain link to its chapter. A slip
   without pages gets one sheet: its lines (or its note), its figure where it has one, and one tab, to its repository.
   Where the window leaves no room beside the sheet, the tabs stand on its top edge instead, numbers only: the
   contents below name them. The peeking tabs tuck behind the card while the dossier is out.
   The panel holds still and clips at the card's lower edge; only the sheet moves, so none of it shows before it has
   slid out, and going back it slides up behind the card with no fade. The tabs are kraft (data-paper="kraft", where
   pen.css draws the pen in --mark-deep). Content: the dossier fields of content/building-projects.js.
   For unpin.js: sheet(p) the panel's HTML · fit(panel, room) · out(st) · back(st) → ms until it is behind the card. */
import { esc, github } from './cards.js';

const K = 190, C = 22;   // ζ ≈ 0.8: it overshoots by ~1.5 % of its height, inside the 8 px it is tucked under the card
const BACK = 240;

const pinBack = (p) => '<button class="unpin-close" type="button" aria-label="Pin ' + esc(p.title) + ' back on the board"><span class="pen-t">pin it back · <span lang="zh">钉回去</span></span> <span aria-hidden="true">×</span></button>';
const meta = (list) => '<div class="project-meta">' + list.map((m) => '<span>' + esc(m) + '</span>').join('') + '</div>';
const repo = (p, cls, words) => '<a class="' + cls + '" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer"' + (cls === 'dos-tab' ? ' data-paper="kraft"' : '') + '>' + github + '<span class="pen-t">' + words + '</span></a>';
function figure(f) {
  return '<figure class="dos-fig"><figcaption>' + esc(f.caption) + '</figcaption><ol class="fig-line">' +
    f.steps.map((s) => '<li class="fig-step"><span>' + esc(s) + '</span></li>').join('<li class="fig-arrow" aria-hidden="true">→</li>') + '</ol>' +
    (f.exit ? '<p class="fig-exit"><span aria-hidden="true">↘</span> ' + esc(f.exit) + '</p>' : '') + '</figure>';
}

export function sheet(p) {
  const head = (label) => '<div class="dos-head"><span>' + label + '</span>' + pinBack(p) + '</div>';
  if (p.chapters) {
    return '<div class="dos"><div class="dos-sheet" data-paper="cream">' + head('dossier · ' + esc(p.title) + ' · ' + esc(p.contents)) +
      '<ol class="dos-list">' + p.chapters.map((c) => '<li><a href="' + esc(c.href) + '"><span class="dl-n">' + esc(c.n) + '</span>' +
        '<span class="dl-t"><span class="pen-t">' + esc(c.title) + '</span></span><span class="dl-l">' + esc(c.line) + '</span></a></li>').join('') + '</ol>' +
      figure(p.figure) + '<div class="dos-foot">' + meta(p.status.concat(p.source || [])) + (p.repo ? repo(p, 'github-link', 'repository ↗') : '') + '</div></div>' +
      '<nav class="dos-tabs" aria-label="' + esc(p.title) + ' chapters">' + p.chapters.map((c) => '<a class="dos-tab" data-paper="kraft" href="' + esc(c.href) + '">' +
        '<span class="pen-t"><span class="dt-n">' + esc(c.n) + '</span> <span class="dt-t">' + esc(c.tab) + '</span></span></a>').join('') + '</nav></div>';
  }
  return '<div class="dos dos--one"><div class="dos-sheet" data-paper="cream">' + head('one sheet · repository only') + (p.figure ? figure(p.figure) : '') +
    (p.lines || [p.note]).map((l) => '<p class="dos-p">' + esc(l) + '</p>').join('') + '<div class="dos-foot">' + meta([p.lifecycle, p.period, 'updated ' + p.updated]) + '</div></div>' +
    (p.repo ? '<nav class="dos-tabs" aria-label="Where it lives">' + repo(p, 'dos-tab', 'repository ↗') + '</nav>' : '') + '</div>';
}

// The tabs stand down the fore-edge where `room` (the window's margin beside the sheet) holds them, else on the top edge.
export function fit(panel, room) {
  const d = panel.firstChild, tabs = d.querySelector('.dos-tabs');
  d.classList.remove('dos--top');
  if (tabs && tabs.offsetWidth + 2 > room) d.classList.add('dos--top');   // the tabs tuck 10 px under the sheet; 12 px spare
}

export function out(st) {
  st.panel.classList.add('open');
  if (st.s.peek) st.s.peek.classList.add('out');
  if (!Motion.reduced()) st.panel.firstChild.animate([{ transform: 'translateY(-100%)' }, { transform: 'none' }], { duration: Motion.springEase.duration(K, C), easing: Motion.springEase(K, C) });
}

export function back(st) {
  const d = st.panel.firstChild;
  if (st.s.peek) st.s.peek.classList.remove('out');
  if (Motion.reduced()) { st.panel.style.visibility = 'hidden'; return 0; }
  const from = getComputedStyle(d).transform;   // from wherever it is: Esc while it is still sliding out turns it round
  d.getAnimations().forEach((a) => a.cancel());
  d.animate([{ transform: from }, { transform: 'translateY(-100%)' }], { duration: BACK, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' });
  return BACK;
}
