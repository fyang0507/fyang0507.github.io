/* Building · the board's own card, clipped to a project page's dossier (design/2026-09-building, candidate C).
   cards.js builds it at its size on the board (the lead card 700 px wide in a board-wide container), and the container
   is scaled into the box dossier.css holds for it, so it is the board's card, and nothing moves when it arrives after
   first paint. Its links and its peek are stripped (the page's own tabs are its chapters, and its link would resolve
   against this page), it is inert and read as one image, and one pen line, a paperclip, holds it to the sheet.
   cover(host, id): host is the page's .pj-cover, id the project's id in content/building-projects.js. */
import { build } from './cards.js';
import { mountFlower } from './flower.js';

const CLIP = 'M6 26V8a3 3 0 0 1 6 0v24a5 5 0 0 1-10 0V12';   // one wire: the inner loop up, over, down and round the outer

export function cover(host, id) {
  const p = (window.BUILDING_PROJECTS || []).find((x) => x.id === id);
  if (!host || !p) return;
  const frame = document.createElement('div'), board = document.createElement('div'), tmp = document.createElement('div');
  frame.className = 'pj-cover-frame'; board.className = 'pj-cover-board';
  board.appendChild(tmp); frame.appendChild(board); host.appendChild(frame);
  const slot = build(tmp, [p]).slots[0];
  board.replaceChild(slot.el, tmp);
  slot.el.querySelectorAll('a, .dos-peek, .board-pin, .ghost, .pin-hole, .lift').forEach((n) => n.remove());
  slot.swing.inert = true;
  host.setAttribute('role', 'img');
  host.setAttribute('aria-label', p.title + ': its card on the Building board');
  const paper = slot.swing.querySelector('.paper--lead');
  if (paper) mountFlower(paper, { phys: { press() {} }, index: 0, hidden: false });
  const fit = () => { board.style.transform = 'scale(' + (host.clientWidth / slot.el.offsetWidth).toFixed(4) + ')'; };
  fit();
  new ResizeObserver(fit).observe(host);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'pj-cover-clip'); svg.setAttribute('viewBox', '0 0 16 38'); svg.setAttribute('aria-hidden', 'true');
  svg.appendChild(Pen.path(CLIP, { color: 'var(--pencil)', width: 1.6 }));
  host.appendChild(svg);
}
