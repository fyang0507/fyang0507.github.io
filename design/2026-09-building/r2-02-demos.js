/* design/2026-09-building · round 2 · Demos: the evidence viewers, the recording, and the pen on the page's links.
   One core for every viewer: each capture has numbered regions (the pen's marks on the print) and a typed legend
   under it, one entry per region. Noticing an entry or a mark (a fine pointer, or keyboard focus) has the pen loop the
   region in coral; choosing it (click, tap, Enter or Space) makes it the one in focus, in the wheat band; Esc, choosing
   it again, or the "put back" control clears it. What choosing shows is the treatment (html[data-f], r2-kit.js):
     F1 · the pen marks it     the loop stays, cooled to the wheat edge; the legend entry is banded. Nothing else moves.
     F2 · tracing paper        a sheet of tracing paper is laid over the print (it dims the capture under paper, never
                               blurs it); every region is a window cut out of the sheet, outlined, with its title
                               typed beside it; the chosen window is drawn in the wheat edge. Click the sheet to lift it.
     F3 · the enlargement      an enlargement print slides out from under the capture: the region at size, its note
                               typed under it, ‹ › to step through the regions, "put back" to return it.
   Keyboard: the legend entries are the controls (one tab stop per region; the marks on the print are for pointers and
   touch, hidden from assistive tech); ←/→ or ↑/↓ move between entries, and while an enlargement is out they take it
   along. Touch: tap a mark or an entry; tap again to clear. Reduced motion: every state lands at once. */
const html = document.documentElement, F = html.dataset.f || '3';
const reduced = () => Motion.reduced();
const mouse = (e) => e.pointerType === 'mouse';

function wirePen() {
  document.querySelectorAll('.ex-index a, .ex-play').forEach((a) => Tier.wire(a, { target: '.pen-t', focus: { on: 'host', gap: 4, gy: 3 } }));
}

function video() {
  document.querySelectorAll('.print--video').forEach((p) => {
    const v = p.querySelector('video'), b = p.querySelector('.ex-play');
    b.addEventListener('click', () => { v.controls = true; p.classList.add('playing'); v.play().catch(() => {}); v.focus({ preventScroll: true }); });
  });
}

// the region's box, in the image's own pixels, padded for context and held to a readable shape
function cropOf(rg, img) {
  const W = img.naturalWidth || +img.getAttribute('width'), H = img.naturalHeight || +img.getAttribute('height');
  const cs = getComputedStyle(rg), pc = (k) => parseFloat(cs.getPropertyValue(k)) / 100;
  const cx = pc('--x') * W, cy = pc('--y') * H;
  let bw = pc('--w') * W * 1.3 + 50, bh = pc('--h') * H * 1.3 + 50;
  if (bw / bh > 2.6) bh = bw / 2.6; else if (bw / bh < 0.9) bw = bh * 0.9;
  bw = Math.min(bw, W); bh = Math.min(bh, H);
  const x0 = Math.max(0, Math.min(W - bw, cx - bw / 2)), y0 = Math.max(0, Math.min(H - bh, cy - bh / 2));
  return { W, H, x0, y0, bw, bh };
}

function Viewer(el) {
  const regs = [...el.querySelectorAll('.rg')], notes = [...el.querySelectorAll('.ex-note')], marks = [...el.querySelectorAll('.rg-m')];
  const byN = (n, list) => list.find((x) => x.dataset.n === String(n));
  const S = { chosen: null, noticed: null, laid: false };
  const loops = regs.map((rg) => Pen.annotate(rg, 'loop', { manual: true, color: 'currentColor', width: 2.2, pad: 7, duration: 380, seed: el.id + '-' + rg.dataset.n }));
  const loopOf = (n) => loops[regs.indexOf(byN(n, regs))];
  const wires = notes.map((b) => Tier.wire(b, { target: '.pen-t', chosen: () => S.chosen === +b.dataset.n, focus: { on: 'host', gap: 5, gy: 4 } }));

  function paint() {
    regs.forEach((rg, i) => {
      const n = +rg.dataset.n, on = S.chosen === n, seen = on || S.noticed === n;
      rg.classList.toggle('chosen', on);
      if (seen) loops[i].show(); else loops[i].hide();
    });
    notes.forEach((b) => b.setAttribute('aria-expanded', String(S.chosen === +b.dataset.n)));
    wires.forEach((w) => w.refresh('hover'));
    if (F === '2') vellum.paint();
    if (F === '3') enl.paint();
  }
  const notice = (n) => { S.noticed = n; paint(); };
  const choose = (n) => { S.chosen = S.chosen === n ? null : n; if (F === '2') S.laid = S.chosen != null; paint(); };
  const clear = () => { S.chosen = null; S.laid = false; paint(); };

  /* F2 · the tracing paper: one sheet per print, its windows cut where the regions are */
  const vellum = { sheets: [], paint() {} };
  if (F === '2') {
    const lay = document.createElement('button');
    lay.type = 'button'; lay.className = 'ex-lay'; lay.setAttribute('aria-pressed', 'false');
    lay.innerHTML = '<span class="pen-t">lay the tracing paper over it · <span lang="zh">描图纸</span></span>';
    el.appendChild(lay);
    Tier.wire(lay, { target: '.pen-t', focus: { on: 'host', gap: 4, gy: 3 } });
    lay.addEventListener('click', () => { S.laid = !S.laid; if (!S.laid) S.chosen = null; paint(); });
    el.querySelectorAll('.print').forEach((pr) => {
      const own = regs.filter((rg) => pr.contains(rg));
      if (!own.length) return;
      const box = (rg) => { const cs = getComputedStyle(rg), v = (k) => parseFloat(cs.getPropertyValue(k)); return { x: v('--x') - v('--w') / 2, y: v('--y') - v('--h') / 2, w: v('--w'), h: v('--h') }; };
      const rr = (b) => { const r = 1.5; return 'M' + (b.x + r) + ' ' + b.y + 'H' + (b.x + b.w - r) + 'Q' + (b.x + b.w) + ' ' + b.y + ' ' + (b.x + b.w) + ' ' + (b.y + r) + 'V' + (b.y + b.h - r) + 'Q' + (b.x + b.w) + ' ' + (b.y + b.h) + ' ' + (b.x + b.w - r) + ' ' + (b.y + b.h) + 'H' + (b.x + r) + 'Q' + b.x + ' ' + (b.y + b.h) + ' ' + b.x + ' ' + (b.y + b.h - r) + 'V' + (b.y + r) + 'Q' + b.x + ' ' + b.y + ' ' + (b.x + r) + ' ' + b.y + 'Z'; };
      const sheet = document.createElement('div');
      sheet.className = 'vellum'; sheet.setAttribute('aria-hidden', 'true');
      sheet.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path class="vl-sheet" fill-rule="evenodd" d="M0 0H100V100H0Z ' + own.map((rg) => rr(box(rg))).join(' ') + '"/>' +
        own.map((rg) => '<path class="vl-win" data-n="' + rg.dataset.n + '" d="' + rr(box(rg)) + '"/>').join('') + '</svg>' +
        own.map((rg) => { const b = box(rg), right = b.x + b.w < 66, t = byN(rg.dataset.n, notes).querySelector('.en-t').textContent;
          return '<span class="vl-lab" data-n="' + rg.dataset.n + '" style="top:calc(' + b.y + '% + 4px);' + (right ? 'left:calc(' + (b.x + b.w) + '% + 12px)' : 'right:calc(' + (100 - b.x) + '% + 12px)') + '"><b>' + rg.dataset.n + '</b>' + t + '</span>'; }).join('');
      pr.appendChild(sheet);
      sheet.addEventListener('click', () => clear());
      vellum.sheets.push(sheet);
    });
    let was = false;
    vellum.paint = () => {
      lay.setAttribute('aria-pressed', String(S.laid));
      el.classList.toggle('laid', S.laid);
      vellum.sheets.forEach((s) => {
        s.querySelectorAll('[data-n]').forEach((x) => x.classList.toggle('on', +x.dataset.n === S.chosen));
        if (S.laid !== was && !reduced()) s.animate(S.laid ? [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 1 }, { opacity: 0 }],
          S.laid ? { duration: Motion.springEase.duration(200, 20), easing: Motion.springEase(200, 20) } : { duration: 160, easing: 'cubic-bezier(.4,0,.8,.4)' });
      });
      was = S.laid;
    };
  }

  /* F3 · the enlargement: one print, pulled out from under the capture, re-cut for whichever region is chosen */
  const enl = { el: el.querySelector('.enl'), shown: false, paint() {} };
  if (F === '3' && enl.el) {
    const tall = el.classList.contains('viewer--tall');
    enl.el.innerHTML = '<div class="enl-in"><div class="enl-crop"><i class="pc pc-tl"></i><i class="pc pc-tr"></i><i class="pc pc-bl"></i><i class="pc pc-br"></i></div>' +
      '<div class="enl-k"><span class="enl-c"></span><span class="enl-w"></span></div><p class="enl-t"></p><p class="enl-p"></p>' +
      '<div class="enl-bar"><button type="button" class="enl-prev" aria-label="Previous region">‹</button><button type="button" class="enl-next" aria-label="Next region">›</button>' +
      '<button type="button" class="enl-x"><span class="pen-t">put it back · <span lang="zh">放回</span></span></button></div></div>';
    const crop = enl.el.querySelector('.enl-crop');
    enl.el.querySelectorAll('.enl-bar button').forEach((b) => Tier.wire(b, { target: b.querySelector('.pen-t') || b, focus: { on: 'host', gap: 4, gy: 3 } }));
    const step = (d) => { const i = notes.findIndex((b) => +b.dataset.n === S.chosen), j = (i + d + notes.length) % notes.length; S.chosen = +notes[j].dataset.n; paint(); };
    enl.el.querySelector('.enl-prev').addEventListener('click', () => step(-1));
    enl.el.querySelector('.enl-next').addEventListener('click', () => step(1));
    enl.el.querySelector('.enl-x').addEventListener('click', () => { const n = S.chosen; clear(); const b = byN(n, notes); if (b) b.focus({ preventScroll: true }); });
    const from = tall && innerWidth > 760 ? 'translateX(-34%)' : 'translateY(-72%)';
    enl.paint = () => {
      const n = S.chosen;
      if (n == null) {
        if (!enl.shown) return;
        enl.shown = false;
        if (reduced()) { enl.el.hidden = true; return; }
        enl.el.animate([{ transform: 'none' }, { transform: from, opacity: 1, offset: .85 }, { transform: from, opacity: 0 }], { duration: 230, easing: 'cubic-bezier(.5,0,.8,.4)' }).finished.then(() => { if (!enl.shown) enl.el.hidden = true; });
        return;
      }
      const rg = byN(n, regs), img = rg.closest('.print').querySelector('img'), note = byN(n, notes), c = cropOf(rg, img);
      enl.el.hidden = false;
      const D = crop.clientWidth || 560, s = D / c.bw;
      crop.style.setProperty('--car', (c.bw / c.bh).toFixed(3));
      crop.style.backgroundImage = 'url("' + img.currentSrc + '")';
      crop.style.backgroundSize = (c.W * s).toFixed(1) + 'px ' + (c.H * s).toFixed(1) + 'px';
      crop.style.backgroundPosition = (-c.x0 * s).toFixed(1) + 'px ' + (-c.y0 * s).toFixed(1) + 'px';
      enl.el.querySelector('.enl-c').textContent = 'enlargement · ' + n + ' / ' + notes.length;
      enl.el.querySelector('.enl-w').textContent = note.querySelector('.en-k').textContent;
      enl.el.querySelector('.enl-t').textContent = note.querySelector('.en-t').textContent;
      enl.el.querySelector('.enl-p').textContent = note.querySelector('.en-p').textContent;
      enl.el.setAttribute('aria-label', 'Enlargement ' + n + ' of ' + notes.length + ': ' + note.querySelector('.en-t').textContent);
      if (!enl.shown) {
        enl.shown = true;
        if (!reduced()) enl.el.animate([{ transform: from }, { transform: 'none' }], { duration: Motion.springEase.duration(190, 19), easing: Motion.springEase(190, 19) });
      }
      // the re-cut uses the crop's real width once it is laid out
      requestAnimationFrame(() => { const D2 = crop.clientWidth, s2 = D2 / c.bw; if (Math.abs(D2 - D) > 1) { crop.style.backgroundSize = (c.W * s2).toFixed(1) + 'px ' + (c.H * s2).toFixed(1) + 'px'; crop.style.backgroundPosition = (-c.x0 * s2).toFixed(1) + 'px ' + (-c.y0 * s2).toFixed(1) + 'px'; } });
    };
  }

  // pointers and touch: the marks on the print and the legend's entries
  const bind = (x) => {
    const n = +x.dataset.n;
    x.addEventListener('pointerenter', (e) => { if (mouse(e)) notice(n); });
    x.addEventListener('pointerleave', (e) => { if (mouse(e) && S.noticed === n) notice(null); });
    x.addEventListener('click', (e) => { e.stopPropagation(); choose(n); });
  };
  marks.forEach(bind); notes.forEach(bind);
  notes.forEach((b, i) => {
    b.addEventListener('focus', () => { if (b.matches(':focus-visible')) notice(+b.dataset.n); });
    b.addEventListener('blur', () => { if (S.noticed === +b.dataset.n) notice(null); });
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (d) { e.preventDefault(); const nb = notes[(i + d + notes.length) % notes.length]; nb.focus(); if (S.chosen != null && F !== '2') { S.chosen = +nb.dataset.n; paint(); } }
    });
  });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && (S.chosen != null || S.laid)) { e.preventDefault(); const n = S.chosen; clear(); const b = byN(n, notes); if (b) b.focus({ preventScroll: true }); } });
  paint();
  return { clear };
}

wirePen();
video();
document.querySelectorAll('[data-viewer]').forEach((v) => Viewer(v));
