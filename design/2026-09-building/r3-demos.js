/* design/2026-09-building · round 3 · Demos: the enlargement laid over the capture, the recording, the pen on links.
   Each capture has numbered regions (the markers on the print) and a typed legend, one entry per region. Noticing a
   marker or an entry (a fine pointer, or keyboard focus) has the pen loop the region in coral. Choosing one (click, tap,
   Enter or Space) opens the enlargement over the capture's own frame: a paper print, the region at size in a window that
   pans, its note typed under it, ← n / N → to step through the capture's regions (wrapping), "put it back · 放回".
   Nothing in the page's flow moves: the enlargement is laid on top, and on a phone it spans the screen and lies over
   whatever follows the capture instead of pushing it down.
   Motion, physics clock, transform and opacity only:
     open    the enlargement grows out of the region's own place on the capture, on a spring with one small overshoot
     step    the window pans across the capture to the next region; to a region on another print, the next print grows
             into the window from its own place on the contact sheet
     close   it tucks back into the region it shows, and is gone
   The region's wheat loop is drawn once each landing, on the pen's clock. Reduced motion: every state lands at once.
   Keyboard: the legend entries are the controls (the markers are for pointers and touch, hidden from assistive tech).
   Opening moves focus into the enlargement; ← → step, ↑ ↓ pan, Esc or "put it back" closes and returns focus to the
   entry. Touch: tap a marker or an entry, swipe left or right to step (inside a window that pans sideways, once it's
   at its edge), tap outside to close; every control is 44 px.
   The port serves the window from the zoom tier (a full-width q90 JPEG, fetched here when the enlargement opens);
   the mock uses the live PNG. */
const reduced = () => Motion.reduced();
const mouse = (e) => e.pointerType === 'mouse';
const phone = () => innerWidth <= 760;
const OPEN = [220, 22], STEP = [240, 24];
const spring = (p) => ({ duration: Motion.springEase.duration(p[0], p[1]), easing: Motion.springEase(p[0], p[1]) });
const T = (x, y, k) => 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';

function wirePen() {
  document.querySelectorAll('.ex-index a, .ex-play').forEach((a) => Tier.wire(a, { target: '.pen-t', focus: { on: 'host', gap: 4, gy: 3 } }));
}

function video() {
  document.querySelectorAll('.print--video').forEach((p) => {
    const v = p.querySelector('video'), b = p.querySelector('.ex-play');
    b.addEventListener('click', () => { v.controls = true; p.classList.add('playing'); v.play().catch(() => {}); v.focus({ preventScroll: true }); });
  });
}

// the region's box in its image's own pixels
function boxOf(rg, W, H) {
  const v = (k) => parseFloat(rg.style.getPropertyValue(k)) / 100;
  return { cx: v('--x') * W, cy: v('--y') * H, w: v('--w') * W, h: v('--h') * H };
}

function Viewer(el) {
  const regs = [...el.querySelectorAll('.rg')], notes = [...el.querySelectorAll('.ex-note')], marks = [...el.querySelectorAll('.rg-m')];
  const prints = el.querySelector('.prints'), tall = el.classList.contains('viewer--tall');
  const byN = (n, list) => list.find((x) => x.dataset.n === String(n));
  const order = notes.map((b) => +b.dataset.n), N = order.length;
  const S = { open: null, noticed: null, floor: 300, vw: innerWidth };
  const loops = regs.map((rg) => Pen.annotate(rg, 'loop', { manual: true, color: 'currentColor', width: 2.2, pad: 7, duration: 380, seed: el.id + '-' + rg.dataset.n }));
  const wires = notes.map((b) => Tier.wire(b, { target: '.pen-t', chosen: () => S.open === +b.dataset.n, focus: { on: 'host', gap: 5, gy: 4 } }));

  const zm = document.createElement('div');
  zm.className = 'zm'; zm.id = el.id.replace(/-viewer$/, '') + '-zm'; zm.hidden = true; zm.tabIndex = -1;
  zm.setAttribute('role', 'group'); zm.setAttribute('aria-roledescription', 'enlargement');
  zm.innerHTML = '<div class="zm-win"><div class="zm-size"><div class="zm-img"><img alt="" draggable="false" decoding="async">' +
    '<div class="zm-rg"><span class="mk on" aria-hidden="true"><span></span></span></div></div></div></div>' +
    '<div class="zm-note"><p class="zm-k"></p><p class="zm-t"></p><p class="zm-p"></p>' +
    '<div class="zm-bar"><button type="button" class="zm-prev" aria-label="Previous region">←</button><span class="zm-n" aria-hidden="true"></span>' +
    '<button type="button" class="zm-next" aria-label="Next region">→</button>' +
    '<button type="button" class="zm-x"><span class="pen-t">put it back · <span lang="zh">放回</span></span></button></div>' +
    '<span class="sr-only" aria-live="polite"></span></div>';
  el.appendChild(zm);
  const q = (s) => zm.querySelector(s);
  const Z = { win: q('.zm-win'), size: q('.zm-size'), layer: q('.zm-img'), img: q('img'), rg: q('.zm-rg'), mk: q('.zm-rg .mk span'),
    note: q('.zm-note'), k: q('.zm-k'), t: q('.zm-t'), p: q('.zm-p'), n: q('.zm-n'), live: q('.sr-only') };
  Z.win.tabIndex = -1;   // not a tab stop of its own: ↑ ↓ pan it from anywhere in the enlargement
  zm.querySelectorAll('.zm-bar button').forEach((b) => Tier.wire(b, { target: b.querySelector('.pen-t') || b, focus: { on: 'host', gap: 4, gy: 3 } }));
  let cur = null, loop = null, drawT = 0;

  // a loop is only ever hidden after it was shown: erasing one that never drew sweeps it through visible
  const seen = regs.map(() => false);
  function paint() {
    regs.forEach((rg, i) => {
      const on = S.open == null && S.noticed === +rg.dataset.n;
      if (on !== seen[i]) { seen[i] = on; if (on) loops[i].show(); else loops[i].hide(); }
    });
    notes.forEach((b) => b.setAttribute('aria-expanded', String(S.open === +b.dataset.n)));
    wires.forEach((w) => w.refresh('hover'));
  }

  function fill(n) {
    const note = byN(n, notes), t = note.querySelector('.en-t').textContent, i = order.indexOf(n) + 1;
    Z.k.textContent = note.querySelector('.en-k').textContent;
    Z.t.textContent = t;
    Z.p.textContent = note.querySelector('.en-p').textContent;
    Z.n.textContent = i + ' / ' + N;
    zm.setAttribute('aria-label', 'Enlargement ' + i + ' of ' + N + ': ' + t);
    return i + ' of ' + N + ': ' + t;
  }

  // over the capture's frame: the print, or the contact sheet; a lone phone capture and the legend beside it at desktop
  // widths (its print alone is already at size); the screen's width on a phone. The note keeps the height of the
  // longest note, so stepping never moves the window's edges.
  function place() {
    const vr = el.getBoundingClientRect(), pr = prints.getBoundingClientRect(), ph = phone();
    let x = pr.left - vr.left, w = pr.width, y = pr.top - vr.top, h = pr.height;
    if (tall && !ph) { x = 0; w = vr.width; }
    // its paper margin covers the prints' photo corners, so the window sits where the capture was
    const m = ph ? 6 : 8;
    x -= m; y -= m; w += 2 * m; h += 2 * m;
    if (ph) { x = 8 - vr.left; w = document.documentElement.clientWidth - 16; }
    zm.style.left = x + 'px'; zm.style.top = y + 'px'; zm.style.width = w + 'px';
    Z.note.style.minHeight = '';
    const noteH = Math.max(...order.map((n) => { fill(n); return Z.note.offsetHeight; }));
    Z.note.style.minHeight = noteH + 'px';
    if (ph) {
      const pad = parseFloat(getComputedStyle(zm).paddingTop);
      Z.win.style.height = Math.round(Math.max(h - pad - noteH, S.floor)) + 'px';
      zm.style.height = 'auto';
    } else { Z.win.style.height = ''; zm.style.height = h + 'px'; }
  }

  // the region at size: as large as fits the window, no smaller than the capture's small text reads (data-zoom "lo hi",
  // CSS px per image px) and no larger than it holds up. On a phone lo is a floor and the window pans; at desktop widths
  // the capture's whole width always fits.
  function frame(n) {
    const rg = byN(n, regs), print = rg.closest('.print'), im = print.querySelector('img');
    const W = im.naturalWidth || +im.getAttribute('width'), H = im.naturalHeight || +im.getAttribute('height');
    const [lo, hi] = (print.dataset.zoom || '0.5 1').split(' ').map(Number);
    const b = boxOf(rg, W, H), ww = Z.win.clientWidth, wh = Z.win.clientHeight;
    const fit = Math.min(ww / (b.w * 1.2 + 60), wh / (b.h * 1.2 + 60));
    let s = Math.min(hi, Math.max(fit, phone() ? lo : Math.min(lo, ww / W)));
    if (W * s > ww && W * s <= ww * 1.12) s = ww / W;   // not a pan for a few pixels
    if (Z.img.getAttribute('src') !== print.dataset.src) Z.img.src = print.dataset.src;
    const sw = W * s, sh = H * s;
    Z.size.style.width = sw + 'px'; Z.size.style.height = sh + 'px';
    Z.rg.setAttribute('style', rg.getAttribute('style'));
    Z.mk.textContent = n;
    // a region at the capture's edge keeps its number inside the window
    const mk = Z.mk.parentElement.offsetWidth / 2 + 6;
    Z.rg.style.setProperty('--zx', Math.max(0, mk - (b.cx - b.w / 2) * s) + 'px');
    Z.rg.style.setProperty('--zy', Math.max(0, mk - (b.cy - b.h / 2) * s) + 'px');
    Z.win.scrollLeft = Math.max(0, Math.min(sw - ww, b.cx * s - ww / 2));
    Z.win.scrollTop = Math.max(0, Math.min(sh - wh, b.cy * s - wh / 2));
    Z.win.classList.toggle('pan', sw > ww + 1 || sh > wh + 1);
    cur = { n, rg, print, W, s };
  }

  // the transform that lays the enlargement's region exactly over the region on the capture
  function restT() {
    const R = cur.rg.getBoundingClientRect(), r = Z.rg.getBoundingClientRect(), z = zm.getBoundingClientRect(), k = R.width / r.width;
    return T(R.left - z.left - k * (r.left - z.left), R.top - z.top - k * (r.top - z.top), k);
  }

  // the entries under the enlargement can't be reached while it's open
  function cover(on) {
    const z = on && zm.getBoundingClientRect();
    notes.forEach((b) => { const li = b.parentElement, r = on && li.getBoundingClientRect(); li.inert = !!on && r.top < z.bottom && r.bottom > z.top && r.left < z.right && r.right > z.left; });
  }

  // a phone may have the capture half off the screen: bring the whole enlargement into view, under the tab strip
  function reveal() {
    const z = zm.getBoundingClientRect(), strip = document.querySelector('.pj-tabs');
    const top = (phone() && strip ? Math.max(0, strip.getBoundingClientRect().bottom) : 0) + 10, bottom = innerHeight - 10;
    let dy = 0;
    if (z.top < top) dy = z.top - top; else if (z.bottom > bottom) dy = Math.min(z.bottom - bottom, z.top - top);
    if (Math.abs(dy) > 1) scrollBy({ top: dy, behavior: reduced() ? 'instant' : 'smooth' });
  }

  function drawLoop(delay) {
    if (loop) loop.destroy();
    clearTimeout(drawT);
    const n = S.open;
    loop = Pen.annotate(Z.rg, 'loop', { manual: true, color: 'currentColor', width: 2.4, pad: 10, duration: 420, seed: el.id + '-zm-' + n });
    drawT = setTimeout(() => { if (S.open === n && loop) loop.show(); }, reduced() ? 0 : delay);
  }

  function open(n) {
    const running = zm.getAnimations().length > 0, cs = getComputedStyle(zm);
    const from = running ? { transform: cs.transform, opacity: +cs.opacity } : null;
    zm.getAnimations().forEach((a) => a.cancel());
    S.open = n; S.floor = Math.min(420, Math.max(300, innerHeight * 0.5)); S.vw = innerWidth;
    zm.hidden = false; el.classList.add('zoomed');
    place(); fill(n); frame(n); paint(); cover(true);
    const f = from || { transform: restT(), opacity: 0 };
    reveal();   // measured before the spring moves it
    if (!reduced()) {
      const sp = spring(OPEN);
      zm.animate([{ transform: f.transform }, { transform: 'none' }], sp);
      zm.animate([{ opacity: f.opacity }, { opacity: 1 }], { duration: 150, easing: 'cubic-bezier(.2,.7,.2,1)' });
      drawLoop(sp.duration * 0.6);
    } else drawLoop(0);
    zm.focus({ preventScroll: true });
  }

  function stepTo(n) {
    if (S.open == null || n === S.open) return;
    const prev = cur, lr = Z.layer.getBoundingClientRect();   // where the capture shows now, mid-step included
    const same = byN(n, regs).closest('.print') === prev.print;
    Z.layer.getAnimations().forEach((a) => a.cancel());
    S.open = n;
    Z.live.textContent = fill(n);
    frame(n); paint();
    if (reduced()) { drawLoop(0); return; }
    const o = Z.size.getBoundingClientRect(), sp = spring(STEP);
    let k, x, y;
    if (same) {                                            // pan: the capture slides under the window
      k = lr.width / prev.W / cur.s; x = lr.left - o.left; y = lr.top - o.top;
    } else {                                               // another print: it grows out of its own place
      const R = cur.rg.getBoundingClientRect(), r = Z.rg.getBoundingClientRect();
      k = R.width / r.width; x = R.left - o.left - k * (r.left - o.left); y = R.top - o.top - k * (r.top - o.top);
      Z.layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
    Z.layer.animate([{ transform: T(x, y, k) }, { transform: 'none' }], sp);
    drawLoop(sp.duration * 0.55);
  }
  const step = (d) => { if (S.open != null) stepTo(order[(order.indexOf(S.open) + d + N) % N]); };

  // how: 'key' returns focus to the entry and scrolls it into view; 'pointer' returns focus only if it was inside
  function close(how) {
    if (S.open == null) return;
    const n = S.open, inside = zm.contains(document.activeElement) || document.activeElement === document.body;
    if (loop) { loop.destroy(); loop = null; }
    clearTimeout(drawT);
    Z.layer.getAnimations().forEach((a) => a.finish());
    S.open = null; paint(); cover(false); el.classList.remove('zoomed');
    if (reduced()) zm.hidden = true;
    else {
      const cs = getComputedStyle(zm), from = { transform: cs.transform, opacity: +cs.opacity };
      zm.getAnimations().forEach((a) => a.cancel());
      const to = restT();
      const a = zm.animate([{ transform: from.transform, opacity: from.opacity }, { transform: to, opacity: 1, offset: 0.72 }, { transform: to, opacity: 0 }],
        { duration: 250, easing: 'cubic-bezier(.45,0,.75,.35)', fill: 'forwards' });
      a.finished.then(() => { if (S.open == null) { zm.hidden = true; a.cancel(); } }, () => {});
    }
    const b = byN(n, notes);
    if (how === 'key' || inside) b.focus({ preventScroll: true });
    if (how === 'key') { const r = b.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) b.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'instant' : 'smooth' }); }
  }

  const choose = (n, how) => { if (S.open === n) close(how); else if (S.open != null) stepTo(n); else open(n); };
  const notice = (n) => { S.noticed = n; paint(); };

  // markers and legend entries
  [...marks, ...notes].forEach((x) => {
    const n = +x.dataset.n;
    x.addEventListener('pointerenter', (e) => { if (mouse(e)) notice(n); });
    x.addEventListener('pointerleave', (e) => { if (mouse(e) && S.noticed === n) notice(null); });
    x.addEventListener('click', (e) => choose(n, e.detail === 0 ? 'key' : 'pointer'));
  });
  notes.forEach((b, i) => {
    b.addEventListener('focus', () => { if (b.matches(':focus-visible')) notice(+b.dataset.n); });
    b.addEventListener('blur', () => { if (S.noticed === +b.dataset.n) notice(null); });
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (d) { e.preventDefault(); notes[(i + d + N) % N].focus(); }
    });
  });

  // the enlargement's own controls
  q('.zm-prev').addEventListener('click', () => step(-1));
  q('.zm-next').addEventListener('click', () => step(1));
  q('.zm-x').addEventListener('click', (e) => close(e.detail === 0 ? 'key' : 'pointer'));
  zm.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
    else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && Z.win.classList.contains('pan')) { e.preventDefault(); Z.win.scrollBy({ top: e.key === 'ArrowDown' ? 64 : -64, behavior: reduced() ? 'instant' : 'smooth' }); }
  });
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.open != null) { e.preventDefault(); close('key'); } });
  // a click or tap anywhere outside the enlargement puts it back; a drag that ends outside it doesn't
  let dragged = 0;
  document.addEventListener('click', (e) => {
    if (S.open == null || zm.contains(e.target) || performance.now() - dragged < 60) return;
    if (el.contains(e.target) && e.target.closest('.ex-note, .rg-m')) return;   // its own entries and markers choose
    close('pointer');
  });

  // a mouse drags the window to pan it
  Z.win.addEventListener('pointerdown', (e) => {
    if (!mouse(e) || e.button !== 0 || !Z.win.classList.contains('pan')) return;
    e.preventDefault();
    const x0 = e.clientX, y0 = e.clientY, l0 = Z.win.scrollLeft, t0 = Z.win.scrollTop;
    let moved = false;
    Z.win.setPointerCapture(e.pointerId); Z.win.classList.add('grab');
    const mv = (ev) => { const dx = ev.clientX - x0, dy = ev.clientY - y0; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; Z.win.scrollLeft = l0 - dx; Z.win.scrollTop = t0 - dy; };
    const up = () => { Z.win.classList.remove('grab'); if (moved) dragged = performance.now(); Z.win.removeEventListener('pointermove', mv); Z.win.removeEventListener('pointerup', up); Z.win.removeEventListener('pointercancel', up); };
    Z.win.addEventListener('pointermove', mv); Z.win.addEventListener('pointerup', up); Z.win.addEventListener('pointercancel', up);
  });
  // a finger swipes to step: anywhere on the note, and in the window once it can't pan further that way
  let sw = null;
  zm.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { sw = null; return; }
    const t = e.touches[0], w = Z.win;
    sw = { x: t.clientX, y: t.clientY, win: w.contains(e.target), l: w.scrollLeft, max: w.scrollWidth - w.clientWidth };
  }, { passive: true });
  zm.addEventListener('touchend', (e) => {
    if (!sw || S.open == null) return;
    const t = e.changedTouches[0], dx = t.clientX - sw.x, dy = t.clientY - sw.y, g = sw;
    sw = null;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (g.win && ((dx < 0 && g.l < g.max - 2) || (dx > 0 && g.l > 2))) return;
    step(dx < 0 ? 1 : -1);
  }, { passive: true });

  // marks that would overlap step right along their region's top edge, a mark and a gap at a time
  function nudge() {
    el.querySelectorAll('.print').forEach((pr) => {
      const placed = [];
      [...pr.querySelectorAll('.rg-m')].forEach((m) => {
        m.style.removeProperty('--nx');
        const r0 = m.getBoundingClientRect(), stepX = r0.width + 10, room = m.parentElement.getBoundingClientRect().width;
        let nx = 0;
        const hit = () => placed.some((p) => r0.left + nx < p.right + 6 && r0.right + nx > p.left - 6 && r0.top < p.bottom + 6 && r0.bottom > p.top - 6);
        while (hit() && nx + stepX < room) nx += stepX;
        if (nx) m.style.setProperty('--nx', nx + 'px');
        placed.push({ left: r0.left + nx, right: r0.right + nx, top: r0.top, bottom: r0.bottom });
      });
    });
  }
  nudge();
  // a resize or a font swap re-lays it where it is, at once
  const relay = () => {
    nudge();
    if (S.open == null) return;
    zm.getAnimations().forEach((a) => a.finish()); Z.layer.getAnimations().forEach((a) => a.finish());
    place(); fill(S.open); frame(S.open); cover(true);
    if (loop) loop.rebuild();
  };
  new ResizeObserver(relay).observe(el);
  addEventListener('resize', () => { if (innerWidth !== S.vw) { S.vw = innerWidth; relay(); } });   // not a phone's URL bar
  paint();
}

wirePen();
video();
document.querySelectorAll('[data-viewer]').forEach((v) => Viewer(v));
