/* Building · the corkboard's cards (design/2026-09-motion, boards r2-05 → r4-05).
   Renders window.BUILDING_PROJECTS as pinned paper, sorted as the page always sorted them (the board
   lead first, then newest). Each card is split into a rotating .swing (paper + tape) and a sibling
   .board-pin that never rotates: the paper pivots on the pin's anchor (var(--pin-left) 14px), so the
   pin stays put in the cork however the paper swings. Every card has exactly one unpin trigger (the
   title on lead / featured, the "+" on slips); real links (field notes, repos) stay links. A .ghost
   behind each card is the cork under the paper, which hasn't faded; it shows when the card is down. */

export const esc = (v) => String(v).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]);

export const kindOf = (p) => ({ highlighted: 'lead', featured: 'featured', 'agent-native': 'instrument' })[p.prominence] || 'standard';

export const github = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .7a11.6 11.6 0 0 0-3.67 22.6c.58.1.8-.25.8-.56v-2.25c-3.24.71-3.92-1.38-3.92-1.38-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.09 1.79 1.21 1.79 1.21 1.04 1.8 2.73 1.28 3.4.98.1-.76.4-1.28.74-1.57-2.59-.3-5.31-1.3-5.31-5.78 0-1.28.45-2.32 1.2-3.14-.12-.3-.52-1.49.12-3.1 0 0 .98-.32 3.2 1.2a11 11 0 0 1 5.83 0c2.22-1.52 3.2-1.2 3.2-1.2.64 1.61.24 2.8.12 3.1.75.82 1.2 1.86 1.2 3.14 0 4.5-2.73 5.47-5.33 5.77.42.37.79 1.09.79 2.2v3.26c0 .31.21.67.8.56A11.6 11.6 0 0 0 12 .7Z"/></svg>';

const pin = '<svg class="board-pin" viewBox="0 0 20 42" aria-hidden="true" focusable="false">' +
  '<ellipse class="pin-shadow" cx="10" cy="39" rx="5.5" ry="2.2"></ellipse><path class="pin-stem" d="M10 37 L10 9"></path>' +
  '<path class="pin-stem-glint" d="M9.2 37 L9.2 9"></path><circle class="pin-head" cx="10" cy="8" r="8"></circle>' +
  '<circle class="pin-glint" cx="7.3" cy="5.3" r="2.3"></circle></svg>';

/* One motif per instrument, never the same one twice: a repeated mark would read as branding rather
   than as something a person stuck on that particular card. */
const motifs = {
  'audio-processing-cli': '<svg class="instrument-motif" viewBox="0 0 34 34" aria-hidden="true" focusable="false"><polyline points="3 17 7 17 10 8 14 25 17.5 12 21 20 24 17 31 17"></polyline></svg>',
  'publish-cli': '<svg class="instrument-motif" viewBox="0 0 34 34" aria-hidden="true" focusable="false"><path d="M12 5.5 L28.5 7 L27 24.5"></path><path d="M4.5 11 L21 12.5 L19.5 30 L3 28.5 Z"></path></svg>'
};

const label = (p) => p.prominence ? '<div class="project-label"><span class="project-label-dot" aria-hidden="true"></span><strong>' + esc(p.prominence) + '</strong><span>' + esc(p.kind) + '</span></div>' : '';
// The words of a link sit in .pen-t, which carries its printed pencil rule; the pen's hover line traces it.
const repoLink = (p) => '<a class="github-link github-link--card" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer" draggable="false" aria-label="Open ' + esc(p.title) + ' on GitHub">' + github + '<span class="pen-t">repo ↗</span></a>';
const trigger = (p, inner, cls) => '<button class="unpin-trigger ' + (cls || '') + '" type="button" aria-haspopup="dialog" aria-label="' + esc(p.title) + ' — unpin to read">' + inner + '</button>';
// The lead title keeps its last word in its own box: the flower is stuck on at the end of it.
function wordmark(title) {
  const words = esc(title).split(' '), last = words.pop();
  return (words.length ? '<span class="wm-word">' + words.join(' ') + '</span> ' : '') + '<span class="wm-mark">' + last + '</span>';
}

function paperHTML(p, kind) {
  if (kind === 'lead') {
    return '<article class="paper paper--lead" data-paper="wheat"><div class="paper-body">' + label(p) +
      '<h2 class="highlighted-title">' + trigger(p, wordmark(p.title), 'unpin-trigger--title') + '</h2><p class="highlighted-note">' + esc(p.note) + '</p>' +
      '<div class="project-meta"><span>' + esc(p.lifecycle) + '</span><span>' + esc(p.period) + '</span><span>updated ' + esc(p.updated) + '</span></div>' +
      '<div class="highlighted-footer"><a class="project-cta" href="' + esc(p.href) + '" draggable="false"><span class="pen-t">Enter the field notes</span></a></div></div></article>';
  }
  if (kind === 'featured') {
    return '<article class="paper paper--featured" data-paper="cream"><div class="paper-body">' + label(p) +
      '<h2>' + trigger(p, '<span class="pen-t">' + esc(p.title) + '</span>', 'unpin-trigger--title') + '</h2><p>' + esc(p.note) + '</p><div class="featured-actions">' +
      '<div class="project-meta"><span>' + esc(p.lifecycle) + '</span><span>' + esc(p.period) + '</span></div>' +
      '<a class="featured-cta" href="' + esc(p.href) + '" draggable="false"><span class="pen-t">Open field studies</span> →</a></div></div></article>';
  }
  const caps = kind === 'instrument' ? '<ul class="instrument-capabilities">' + (p.capabilities || []).map((c) => '<li>' + esc(c) + '</li>').join('') + '</ul>' : '';
  return '<article class="paper paper--' + kind + '" data-paper="cream"><div class="paper-edge"><div class="paper-inner">' +
    (kind === 'instrument' ? (motifs[p.id] || '') + label(p) : '') +
    '<h2><span class="pen-t">' + esc(p.title) + '</span></h2>' + caps +
    '<p class="standard-period">' + esc(p.period) + ' · ' + esc(p.lifecycle) + '</p>' +
    '<div class="project-actions">' + (p.repo ? repoLink(p) : '<span></span>') +
    trigger(p, '<span class="morph-icon" aria-hidden="true"></span>', 'morph-toggle') + '</div></div></div></article>';
}

export function sortProjects(list) {
  return list.slice().sort((a, b) => (Number(Boolean(b.boardLead)) - Number(Boolean(a.boardLead))) || String(b.sortDate).localeCompare(String(a.sortDate)) || a.order - b.order);
}

/* build(host, projects) → { root, viewport, track, slots: [{ el, swing, pin, ghost, trigger, project, kind }] } */
export function build(host, projects) {
  host.innerHTML = '<div class="cork-wrap"><section class="cork" data-paper="cork" aria-labelledby="project-board-title">' +
    '<h2 id="project-board-title" class="sr-only">Projects on the building board</h2>' +
    '<div class="cork-toolbar"><span class="cork-order">projects <span lang="zh">项目</span> · drag →</span>' +
    '<div class="cork-actions" role="group" aria-label="Board controls"><button class="cork-btn" type="button" data-step="-1" aria-label="Toward the start of the board"><span class="glyph">←</span></button>' +
    '<button class="cork-btn" type="button" data-step="1" aria-label="Toward the end of the board"><span class="glyph">→</span></button></div></div>' +
    '<div class="cork-viewport" tabindex="0" aria-label="Project board, Fred Agent first. Drag, or use the arrow keys; Enter takes the card in view down to read"><div class="cork-track"></div></div></section></div>';
  const wrap = host.firstChild, root = wrap.firstChild, viewport = root.querySelector('.cork-viewport'), track = root.querySelector('.cork-track');
  const slots = projects.map((p) => {
    const kind = kindOf(p), el = document.createElement('div');
    el.className = 'slot slot--' + kind;
    el.dataset.id = p.id;
    el.innerHTML = '<div class="ghost" aria-hidden="true"></div><span class="pin-hole" aria-hidden="true"></span>' +
      '<div class="swing"><div class="lift" aria-hidden="true"><div class="lift-shape"></div></div>' + paperHTML(p, kind) + '</div>' + pin;
    track.appendChild(el);
    return { el, swing: el.querySelector('.swing'), pin: el.querySelector('.board-pin'), ghost: el.querySelector('.ghost'), trigger: el.querySelector('.unpin-trigger'), project: p, kind };
  });
  wrap.addEventListener('dragstart', (e) => e.preventDefault());
  return { wrap, root, viewport, track, slots };
}

/* A slot's live geometry (after container queries resolve). Angles in degrees. */
export function geometry(slot) {
  const cs = getComputedStyle(slot.el || slot);
  return {
    tilt: parseFloat(cs.getPropertyValue('--tilt')) || 0,
    pinTilt: parseFloat(cs.getPropertyValue('--pin-tilt')) || 0,
    pinLeft: (parseFloat(cs.getPropertyValue('--pin-left')) || 50) / 100
  };
}
