/* design/2026-10-essays/pn-inject.js — the board's side: puts pn-kit (and the candidates' sheets) into a real Reading
   page in a same-origin iframe and asks it for a candidate. The page in the frame is production's, unchanged. */
const DIR = 'design/2026-10-essays/';   // from Reading.dc.html, at the site root

export function inject(frame, c, back) {
  const w = frame.contentWindow, d = frame.contentDocument;
  if (!d || !d.head || !/\/Reading\.dc\.html$/.test(w.location.pathname)) return false;
  if (back) d.documentElement.dataset.pnBack = back;
  if (w.PN) { w.PN.show(c); return true; }
  d.documentElement.dataset.pnWant = c;
  if (d.querySelector('[data-pn-kit]')) return true;
  ['pn-kit.css', 'pn-a.css', 'pn-a-back.css', 'pn-b.css', 'pn-c.css'].forEach((f) => {
    const l = d.createElement('link'); l.rel = 'stylesheet'; l.href = DIR + f; l.setAttribute('data-pn-kit', ''); d.head.appendChild(l);
  });
  const s = d.createElement('script'); s.type = 'module'; s.src = DIR + 'pn-kit.js'; s.setAttribute('data-pn-kit', ''); d.head.appendChild(s);
  return true;
}

export function ready(frame) {
  return new Promise((resolve) => {
    const t = () => { const d = frame.contentDocument; if (d && d.documentElement.dataset.pnReady === '1') resolve(); else setTimeout(t, 60); };
    t();
  });
}
