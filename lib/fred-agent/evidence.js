/* Fred Agent · Demos' evidence (building/fred-agent/demos.html; design/2026-09-building, the round-4 Demos board, with
   Fred's corners). Styles in demos.css; the pen's corners in corners.js. Nothing measures before FY.styled.
   · The recording downloads nothing until it's played (preload="none"). The play control at the centre of its poster,
     or the poster itself, starts it in place, with the player's own controls from then on.
   · Each capture's regions carry B's paper tokens, and the legend under it (beside it, Fig. 03) has one entry per
     region: the entries are the controls. Noticing a token or an entry (a fine pointer, or keyboard focus on the entry)
     has the pen mark the region's four corners in coral. Choosing one (click, tap, Enter or Space) lays the enlargement
     over the capture's own frame (the print, the contact sheet, or a phone capture and its legend; the screen's width
     on a phone), so nothing on the page moves. It shows the region with enough of the capture round it to be known,
     its corners in ink marking where it ends, and its note: in a column beside it (desktop), in a band under it (where
     some region would read under 11 px beside its note: Fig. 04's skill file), or under it (phones). ← n / N → step
     both together, wrapping, as do the arrow keys and a swipe; Esc, "put it back · 放回" or a click outside puts it
     back, and focus returns to the entry.
   · Its scale comes from each capture's body text height (data-text, image px): on a phone the smallest at which that
     text renders at 11 CSS px, the window panning where the region is wider; at desktop widths about 13 px, less if
     the region needs it to fit with its surroundings, never under 10; and always at least 1.35 × the print's own size.
   · The window shows the zoom tier (the img's data-zoom-src, a full-width q90 JPEG), fetched only once an enlargement
     opens; until it arrives, the file the print already shows stands in underneath, in the same place.
   · Motion, transform and opacity only. Paper on the physics clock: the enlargement grows out of the region's own place
     on a spring with one small overshoot; a step pans the capture under the window (to another print, that print grows
     out of its place on the contact sheet) while the note slides in from that side; it tucks back into its region to
     close. The corners on the hand's clock: the pen lifts them from the region it leaves and draws them on the one it
     reaches. Reduced motion lands every state at once. */
import { corners } from './corners.js';

const reduced = () => Motion.reduced();
const mouse = (e) => e.pointerType === 'mouse';
const phones = matchMedia('(max-width: 760px)'), phone = () => phones.matches;
const OPEN = [220, 22], STEP = [240, 24];
const READ = { phone: 11, desk: 13, side: 11, floor: 10 };   // CSS px a capture's body text renders at, enlarged
const spring = (p) => ({ duration: Motion.springEase.duration(p[0], p[1]), easing: Motion.springEase(p[0], p[1]) });
const fade = (ms) => ({ duration: ms, easing: 'cubic-bezier(.2,.7,.2,1)' });
const T = (x, y, k) => 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) scale(' + k.toFixed(4) + ')';

function recording(p) {
  const v = p.querySelector('video'), b = p.querySelector('.ex-play');
  Tier.wire(b, { target: '.pen-t', focus: { on: 'host', gap: 6, gy: 6 } });
  const play = () => { if (p.classList.contains('playing')) return; v.controls = true; p.classList.add('playing'); v.play().catch(() => {}); v.focus({ preventScroll: true }); };
  b.addEventListener('click', play);
  v.addEventListener('click', () => { if (!v.controls) play(); });
}

// the region's box in its capture's own pixels; the capture's size and body text height
function boxOf(rg, W, H) {
  const v = (k) => parseFloat(rg.style.getPropertyValue(k)) / 100;
  return { cx: v('--x') * W, cy: v('--y') * H, w: v('--w') * W, h: v('--h') * H };
}
const dims = (print) => { const im = print.querySelector('img'); return { im, W: +im.getAttribute('width'), H: +im.getAttribute('height'), t: +print.dataset.text || 14 }; };
const fitOf = (b, ww, wh) => Math.min(ww / (b.w * 1.1 + 32), wh / (b.h * 1.1 + 32));
const limOf = (rg) => ({ l: -rg.offsetLeft, t: -rg.offsetTop, r: rg.offsetParent.clientWidth - rg.offsetLeft, b: rg.offsetParent.clientHeight - rg.offsetTop });

function Viewer(el) {
  const regs = [...el.querySelectorAll('.rg')], notes = [...el.querySelectorAll('.ex-note')], marks = [...el.querySelectorAll('.rg-m')];
  const prints = el.querySelector('.prints'), tall = el.classList.contains('viewer--tall');
  const byN = (n, list) => list.find((x) => x.dataset.n === String(n));
  const order = notes.map((b) => +b.dataset.n), N = order.length;
  const S = { open: null, noticed: null, floor: 300, vw: innerWidth };
  const seed = (n) => el.id + '-' + n;
  const cns = regs.map((rg) => corners(rg));
  const wires = notes.map((b) => Tier.wire(b, { target: '.pen-t', chosen: () => S.open === +b.dataset.n, focus: { on: 'host', gap: 5, gy: 4 } }));

  const zm = document.createElement('div');
  zm.className = 'zm'; zm.id = el.id.replace(/-viewer$/, '') + '-zm'; zm.hidden = true; zm.tabIndex = -1;
  zm.setAttribute('role', 'group'); zm.setAttribute('aria-roledescription', 'enlargement');
  zm.innerHTML = '<div class="zm-win"><div class="zm-size"><div class="zm-img"><img alt=""></div></div></div>' +
    '<div class="zm-note"><div class="zm-txt"><p class="zm-k"><span class="mk on" aria-hidden="true"><span></span></span><span class="zm-kt"></span></p>' +
    '<p class="zm-t"></p><p class="zm-p"></p></div>' +
    '<div class="zm-bar"><span class="zm-steps"><button type="button" class="zm-prev" aria-label="Previous region">←</button><span class="zm-n" aria-hidden="true"></span>' +
    '<button type="button" class="zm-next" aria-label="Next region">→</button></span>' +
    '<button type="button" class="zm-x"><span class="pen-t">put it back · <span lang="zh">放回</span></span></button></div>' +
    '<span class="sr-only" aria-live="polite"></span></div>';
  el.appendChild(zm);
  const q = (s) => zm.querySelector(s);
  const Z = { win: q('.zm-win'), size: q('.zm-size'), layer: q('.zm-img'), img: q('.zm-img img'), note: q('.zm-note'), txt: q('.zm-txt'),
    kn: q('.zm-k .mk span'), k: q('.zm-kt'), t: q('.zm-t'), p: q('.zm-p'), n: q('.zm-n'), live: q('.sr-only') };
  // the region in the window, twice over: a step lifts the corners from the one it leaves while drawing the next
  Z.boxes = [0, 1].map(() => {
    const b = document.createElement('div');
    b.className = 'zm-rg'; b.hidden = true;
    b.innerHTML = '<span class="mk on" aria-hidden="true"><span></span></span>';
    Z.layer.appendChild(b);
    return { el: b, mk: b.firstChild, cn: corners(b) };
  });
  Z.bi = 0;
  Z.win.tabIndex = -1;   // not a tab stop of its own: ↑ ↓ pan it from anywhere in the enlargement
  zm.querySelectorAll('.zm-bar button').forEach((b) => Tier.wire(b, { target: b.querySelector('.pen-t') || b, focus: { on: 'host', gap: 4, gy: 3 } }));
  let cur = null;

  // the capture's corners: coral while a region is noticed and nothing is open; the open region's are chosen, in ink
  function paint() {
    regs.forEach((rg, i) => { const n = +rg.dataset.n; cns[i].set(S.open != null ? (S.open === n ? 2 : 0) : S.noticed === n ? 1 : 0, S.open === n ? 'instant' : undefined); });
    notes.forEach((b) => b.setAttribute('aria-expanded', String(S.open === +b.dataset.n)));
    wires.forEach((w) => w.refresh('hover'));
  }
  const build = () => regs.forEach((rg, i) => cns[i].build(limOf(rg), seed(rg.dataset.n)));

  function fill(n) {
    const note = byN(n, notes), t = note.querySelector('.en-t').textContent, i = order.indexOf(n) + 1;
    Z.kn.textContent = n;
    Z.k.textContent = note.querySelector('.en-k').textContent;
    Z.t.textContent = t;
    Z.p.textContent = note.querySelector('.en-p').textContent;
    Z.n.textContent = i + ' / ' + N;
    zm.setAttribute('aria-label', 'Enlargement ' + i + ' of ' + N + ': ' + t);
    return i + ' of ' + N + ': ' + t;
  }

  // Side by side at desktop widths when every region fits beside its note with its text at 11 px or more; otherwise a
  // band under the window (Fig. 04: the skill file's step 5 would read at 10 px beside its note, 13 px over it).
  function sideFits(w, h, m) {
    const nw = Math.round(Math.min(380, Math.max(300, (w - 2 * m) * 0.38))), ww = w - 2 * m - nw, wh = h - 2 * m;
    zm.style.setProperty('--nw', nw + 'px');
    return regs.every((rg) => { const d = dims(rg.closest('.print')); return fitOf(boxOf(rg, d.W, d.H), ww, wh) >= READ.side / d.t; });
  }

  // over the capture's frame: the print, or the contact sheet; a lone phone capture and the legend beside it at desktop
  // widths (its print alone is already at size); the screen's width on a phone. The note keeps the height of the
  // longest note, so stepping never moves the window's edges. With the note under it, the window keeps a floor, and
  // where the frame is too short for that (a phone; the contact sheet at a tablet's width) the enlargement lies over
  // what follows the capture instead.
  function place() {
    const vr = el.getBoundingClientRect(), pr = prints.getBoundingClientRect(), ph = phone();
    let x = pr.left - vr.left, w = pr.width, y = pr.top - vr.top, h = pr.height;
    if (tall && !ph) { x = 0; w = vr.width; }
    const m = ph ? 6 : 8;   // its paper margin covers the prints' photo corners, so the window sits where the capture was
    x -= m; y -= m; w += 2 * m; h += 2 * m;
    if (ph) { x = 8 - vr.left; w = document.documentElement.clientWidth - 16; }
    zm.style.left = x + 'px'; zm.style.top = y + 'px'; zm.style.width = w + 'px';
    const layout = ph || w < 700 ? 'stack' : sideFits(w, h, m) ? 'side' : 'band';
    zm.dataset.layout = layout;
    Z.note.style.minHeight = ''; Z.win.style.height = '';
    if (layout === 'side') { zm.style.height = h + 'px'; return; }
    const noteH = Math.max(...order.map((n) => { fill(n); return Z.note.offsetHeight; }));
    Z.note.style.minHeight = noteH + 'px';
    Z.win.style.height = Math.round(Math.max(h - (layout === 'stack' ? m : 2 * m) - noteH, S.floor)) + 'px';
    zm.style.height = 'auto';
  }

  // n into the window; a step (how: 'step') moves on to the other region box, the pen lifting the corners of this one
  function frame(n, how) {
    const rg = byN(n, regs), print = rg.closest('.print'), { im, W, H, t } = dims(print);
    const b = boxOf(rg, W, H), ww = Z.win.clientWidth, wh = Z.win.clientHeight, grow = print.offsetWidth / W * 1.35;
    let s = phone() ? Math.max(READ.phone / t, grow) : Math.max(Math.min(READ.desk / t, fitOf(b, ww, wh)), READ.floor / t, grow);
    if (W * s > ww && W * s <= ww * 1.12) s = ww / W;   // not a pan for a few pixels
    // the zoom tier, one image per print, over the file the print already shows
    const zi = print.fyZoom || (print.fyZoom = Object.assign(document.createElement('img'), { alt: '', decoding: 'async', draggable: false, src: im.dataset.zoomSrc }));
    if (Z.img !== zi) { Z.img.replaceWith(zi); Z.img = zi; Z.layer.style.backgroundImage = im.currentSrc ? 'url("' + im.currentSrc + '")' : 'none'; }
    const sw = W * s, sh = H * s, x0 = (b.cx - b.w / 2) * s, y0 = (b.cy - b.h / 2) * s;
    Z.size.style.width = sw + 'px'; Z.size.style.height = sh + 'px';
    let box = Z.boxes[Z.bi];
    if (how === 'step') { box.cn.set(0); box.mk.hidden = true; Z.bi ^= 1; box = Z.boxes[Z.bi]; }
    box.el.setAttribute('style', rg.getAttribute('style'));
    box.el.hidden = false; box.mk.hidden = false; box.mk.firstChild.textContent = n;
    // a region at the capture's edge keeps its token inside the window
    const mk = box.mk.offsetWidth / 2 + 6;
    box.el.style.setProperty('--zx', Math.max(0, mk - x0) + 'px');
    box.el.style.setProperty('--zy', Math.max(0, mk - y0) + 'px');
    box.cn.build({ l: -x0, t: -y0, r: sw - x0, b: sh - y0, inset: 4 }, seed(n));
    box.cn.set(2, how === 'step' ? 90 : 'instant');
    // centred on the region; one wider or taller than the window starts at its token's corner, where its text starts
    const fx = b.w * s + 2 * mk > ww ? x0 - mk : b.cx * s - ww / 2;
    const fy = b.h * s + 2 * mk > wh ? y0 - mk : b.cy * s - wh / 2;
    Z.win.scrollLeft = Math.max(0, Math.min(sw - ww, fx));
    Z.win.scrollTop = Math.max(0, Math.min(sh - wh, fy));
    Z.win.classList.toggle('pan', sw > ww + 1 || sh > wh + 1);
    zm.dataset.scale = s.toFixed(3);
    cur = { n, rg, print, W, s, box };
  }

  // the transform that lays the enlargement's region exactly over the region on the capture
  function restT() {
    const R = cur.rg.getBoundingClientRect(), r = cur.box.el.getBoundingClientRect(), z = zm.getBoundingClientRect(), k = R.width / r.width;
    return T(R.left - z.left - k * (r.left - z.left), R.top - z.top - k * (r.top - z.top), k);
  }

  // the entries under the enlargement can't be reached while it's open
  function cover(on) {
    const z = on && zm.getBoundingClientRect();
    notes.forEach((b) => { const li = b.parentElement, r = on && li.getBoundingClientRect(); li.inert = !!on && r.top < z.bottom && r.bottom > z.top && r.left < z.right && r.right > z.left; });
  }

  // the capture may be half off the screen: bring the whole enlargement into view, under the chapter strip if it sticks
  function reveal() {
    const z = zm.getBoundingClientRect(), strip = document.querySelector('.pj-tabs');
    const top = (strip && getComputedStyle(strip).flexDirection === 'row' ? Math.max(0, strip.getBoundingClientRect().bottom) : 0) + 10, bottom = innerHeight - 10;
    let dy = 0;
    if (z.top < top) dy = z.top - top; else if (z.bottom > bottom) dy = Math.min(z.bottom - bottom, z.top - top);
    if (Math.abs(dy) > 1) scrollBy({ top: dy, behavior: reduced() ? 'instant' : 'smooth' });
  }

  function open(n) {
    const running = zm.getAnimations().length > 0, cs = getComputedStyle(zm);
    const from = running ? { transform: cs.transform, opacity: +cs.opacity } : null;
    zm.getAnimations().forEach((a) => a.cancel());
    S.open = n; S.floor = Math.min(340, Math.max(260, innerHeight * 0.4)); S.vw = innerWidth;
    zm.hidden = false; el.classList.add('zoomed');
    Z.boxes[Z.bi ^ 1].el.hidden = true;
    place(); fill(n); frame(n); paint(); cover(true);
    const f = from || { transform: restT(), opacity: 0 };
    reveal();   // measured before the spring moves it
    if (!reduced()) {
      zm.animate([{ transform: f.transform }, { transform: 'none' }], spring(OPEN));
      zm.animate([{ opacity: f.opacity }, { opacity: 1 }], fade(150));
    }
    zm.focus({ preventScroll: true });
  }

  function stepTo(n) {
    if (S.open == null || n === S.open) return;
    const prev = cur, lr = Z.layer.getBoundingClientRect();   // where the capture shows now, mid-step included
    const same = byN(n, regs).closest('.print') === prev.print, dir = order.indexOf(n) > order.indexOf(prev.n) ? 1 : -1;
    Z.layer.getAnimations().forEach((a) => a.cancel()); Z.txt.getAnimations().forEach((a) => a.cancel());
    S.open = n;
    Z.live.textContent = fill(n);
    frame(n, 'step'); paint();
    if (reduced()) return;
    const o = Z.size.getBoundingClientRect(), sp = spring(STEP);
    let k, x, y;
    if (same) {                                            // pan: the capture slides under the window
      k = lr.width / prev.W / cur.s; x = lr.left - o.left; y = lr.top - o.top;
    } else {                                               // another print: it grows out of its own place
      const R = cur.rg.getBoundingClientRect(), r = cur.box.el.getBoundingClientRect();
      k = R.width / r.width; x = R.left - o.left - k * (r.left - o.left); y = R.top - o.top - k * (r.top - o.top);
      Z.layer.animate([{ opacity: 0 }, { opacity: 1 }], fade(140));
    }
    Z.layer.animate([{ transform: T(x, y, k) }, { transform: 'none' }], sp);
    Z.txt.animate([{ transform: 'translateX(' + dir * 16 + 'px)' }, { transform: 'none' }], sp);
    Z.txt.animate([{ opacity: 0 }, { opacity: 1 }], fade(160));
  }
  const step = (d) => { if (S.open != null) stepTo(order[(order.indexOf(S.open) + d + N) % N]); };

  // how: 'key' returns focus to the entry and scrolls it into view; 'pointer' returns focus only if it was inside
  function close(how) {
    if (S.open == null) return;
    const n = S.open, inside = zm.contains(document.activeElement) || document.activeElement === document.body;
    Z.layer.getAnimations().forEach((a) => a.finish()); Z.txt.getAnimations().forEach((a) => a.finish());
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

  // the tokens on the capture and the legend's entries
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
    if (el.contains(e.target) && e.target.closest('.ex-note, .rg-m')) return;   // its own entries and tokens choose
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

  // tokens that would overlap step right along their region's top edge, a token and a gap at a time
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
  // a resize or a font swap lays it out again where it is, at once
  const finish = () => [zm, Z.layer, Z.txt].forEach((x) => x.getAnimations().forEach((a) => a.finish()));
  const relay = () => {
    nudge(); build();
    if (S.open == null) return;
    finish();
    place(); fill(S.open); frame(S.open); cover(true);
  };
  new ResizeObserver(relay).observe(el);
  addEventListener('resize', () => { if (innerWidth !== S.vw) { S.vw = innerWidth; relay(); } });   // not a phone's URL bar
  Motion.onReduced((on) => { if (on) finish(); });
  nudge(); build(); paint();
}

FY.styled(() => {
  document.querySelectorAll('.print--video').forEach(recording);
  document.querySelectorAll('.viewer').forEach(Viewer);
});
