/* design/2026-09-building · B · 推近, go in close. This candidate changes the preview step: nothing is taken off the
   board. A project with pages has its chapters pinned beside it on the cork, one slip each, plus the one figure, so the
   board itself says what is inside; every slip carries its small print. A click leans the camera in (physics clock: a
   spring on the camera, one small overshoot) until the project's cluster fills the frame and its small print reads;
   a chapter slip goes the rest of the way in, into that chapter's page (00-vt.js carries the push across the
   navigation). Esc, "step back" or the empty cork pulls the camera back. Drag, pins, swing and the flower are as they
   are; the pin geometry of the new slips is the board's one-point rule.
   decorate(k) pins the slips (before the physics is built, so they swing like every card); Camera(k, P) is the lens. */
import { esc } from '../../lib/building/cards.js';

const D = () => window.BD_PREVIEW || {};
const pin = '<svg class="board-pin" viewBox="0 0 20 42" aria-hidden="true" focusable="false">' +
  '<ellipse class="pin-shadow" cx="10" cy="39" rx="5.5" ry="2.2"></ellipse><path class="pin-stem" d="M10 37 L10 9"></path>' +
  '<path class="pin-stem-glint" d="M9.2 37 L9.2 9"></path><circle class="pin-head" cx="10" cy="8" r="8"></circle>' +
  '<circle class="pin-glint" cx="7.3" cy="5.3" r="2.3"></circle></svg>';
// the slips' rest poses: tilt, drop, pin-left, pin-tilt (seeded by hand, never the same twice in a row)
const POSE = [[-2.2, 6, 40, -12], [1.6, 22, 58, 9], [-1.1, 0, 46, -8], [2.4, 14, 36, 13], [-2.8, 30, 62, -10], [1.2, 4, 50, 7]];

function slip(p, c, i) {
  const el = document.createElement('div'), q = POSE[i % POSE.length];
  el.className = 'slot slot--chapter';
  el.dataset.id = p.id + '-' + c.n;
  el.style.cssText = '--tilt:' + q[0] + 'deg;--drop:' + q[1] + 'px;--pin-left:' + q[2] + '%;--pin-tilt:' + q[3] + 'deg';
  el.innerHTML = '<div class="ghost" aria-hidden="true"></div><span class="pin-hole" aria-hidden="true"></span><div class="swing"><div class="lift" aria-hidden="true"><div class="lift-shape"></div></div>' +
    '<a class="paper paper--chapter" data-paper="cream" href="' + esc(c.href) + '" draggable="false" data-chapter="' + c.n + '"' + (c.live ? ' data-live' : '') + '><span class="ch-in">' +
    '<span class="ch-n">' + c.n + (c.state ? ' · ' + esc(c.state) : '') + '</span><span class="ch-t"><span class="pen-t">' + esc(c.t) + '</span></span>' +
    '<span class="ch-h">' + esc(c.h) + '</span><span class="ch-l fine">' + esc(c.line) + '</span>' +
    (c.wip ? '<span class="ch-wip"><b>WIP</b> ' + esc(c.wip) + '</span>' : '') + (c.live ? '<span class="ch-live">live page ↗</span>' : '') + '</span></a></div>' + pin;
  return { el, swing: el.querySelector('.swing'), pin: el.querySelector('.board-pin'), ghost: el.querySelector('.ghost'), trigger: el.querySelector('.paper'), project: p, kind: 'chapter', chapter: c };
}
function figSheet(p, f) {
  const el = document.createElement('div');
  el.className = 'slot slot--figure';
  el.dataset.id = p.id + '-figure';
  el.style.cssText = '--tilt:-.7deg;--drop:0px;--pin-left:50%;--pin-tilt:-6deg';
  el.innerHTML = '<div class="ghost" aria-hidden="true"></div><span class="pin-hole" aria-hidden="true"></span><div class="swing"><div class="lift" aria-hidden="true"><div class="lift-shape"></div></div>' +
    '<figure class="paper paper--figure" data-paper="cream"><figcaption class="fine">' + esc(f.cap) + '</figcaption><ol class="fig-line">' +
    f.steps.map((s, i) => '<li class="fig-step"><span>' + esc(s) + '</span></li>' + (i < f.steps.length - 1 ? '<li class="fig-arrow" aria-hidden="true">→</li>' : '')).join('') + '</ol></figure></div>' + pin;
  return { el, swing: el.querySelector('.swing'), pin: el.querySelector('.board-pin'), ghost: el.querySelector('.ghost'), trigger: null, project: p, kind: 'figure' };
}

// the small print every card carries (legible up close; at rest it reads as the texture of a real card)
function fine(s) {
  const d = D()[s.project.id], inner = s.swing.querySelector('.paper-inner, .paper-body');
  if (!inner || s.kind === 'lead' || s.kind === 'featured') return;
  const txt = d && d.lines ? d.lines.join(' ') : s.project.note;
  inner.querySelector('.project-actions').insertAdjacentHTML('beforebegin', '<p class="fine slip-fine">' + esc(txt) + '</p>');
}

export function decorate(k) {
  const added = [];
  k.slots.slice().forEach((s) => {
    fine(s);
    const d = D()[s.project.id];
    if (!d || !d.chapters) return;
    const box = document.createElement('div');
    box.className = 'cluster cluster--' + d.chapters.length;
    box.dataset.for = s.project.id;
    const fs = figSheet(s.project, d.figure), list = [fs].concat(d.chapters.map((c, i) => slip(s.project, c, i)));
    list.forEach((x) => box.appendChild(x.el));
    s.el.after(box);
    s.cluster = list;
    added.push([s, list]);
  });
  // chapter slips join the board's slots (after their project, in reading order), so the physics swings them
  added.forEach(([s, list]) => { const at = k.slots.indexOf(s) + 1; k.slots.splice(at, 0, ...list); });
}

/* ---- the camera: the whole board scales about the cluster you chose, under the site header ---- */
export function Camera(k, phys) {
  const wrap = k.wrap, html = document.documentElement, cam = { u: 0, v: 0, to: 0, T: null, on: null };
  const P = () => phys && phys.get && phys.get();
  const back = document.createElement('button');
  back.type = 'button'; back.className = 'cam-back'; back.hidden = true;
  back.innerHTML = '<span class="pen-t">← step back · <span lang="zh">退一步</span></span>';
  document.body.appendChild(back);
  const loop = new Motion.Loop((dt) => {
    const k2 = 150, c2 = 2 * 0.74 * Math.sqrt(k2);
    cam.v += (k2 * (cam.to - cam.u) - c2 * cam.v) * dt; cam.u += cam.v * dt;
    const done = Math.abs(cam.to - cam.u) < 0.0006 && Math.abs(cam.v) < 0.004;
    if (done) { cam.u = cam.to; cam.v = 0; }
    paint();
    if (done && cam.to === 0) off();
    return !done;
  });
  function rectOf(list) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    list.forEach((el) => [el].concat([...el.querySelectorAll('.board-pin')]).forEach((n) => { const r = n.getBoundingClientRect(); x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }));
    return { x: x0 - 12, y: y0 - 8, w: x1 - x0 + 24, h: y1 - y0 + 16 };   // pins included, a hand's breadth of cork round it
  }
  // the camera that frames `els`: fit them into the window below the header's visible edge
  function aim(els) {
    const prev = wrap.style.transform; wrap.style.transform = 'none';
    const b = wrap.getBoundingClientRect(), r = rectOf(els), head = document.querySelector('.site-shell-header').getBoundingClientRect();
    wrap.style.transform = prev;
    const top = Math.max(16, head.bottom + 10), W = innerWidth - 32, H = innerHeight - top - 16;
    const S = Math.max(1, Math.min(W / r.w, H / r.h, 2.4)), T = { x: innerWidth / 2, y: top + H / 2 };
    const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    return { S, tx: T.x - b.left - S * (c.x - b.left), ty: T.y - b.top - S * (c.y - b.top) };
  }
  function paint() {
    if (!cam.T) return;
    const u = cam.u, s = 1 + (cam.T.S - 1) * u;
    wrap.style.transform = 'translate(' + (cam.T.tx * u).toFixed(2) + 'px,' + (cam.T.ty * u).toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
  }
  function off() { wrap.style.transform = ''; html.classList.remove('cam-on'); cam.T = null; cam.on = null; }
  // a cluster the cork's frame cuts off is panned into view first (the board's own tween), then the camera leans in
  function lean(s, instant) {
    const els = s.cluster ? s.cluster.map((x) => x.el) : [s.el], ph = P();
    if (!instant && ph && !cam.on) {
      const r = rectOf(els), v = k.viewport.getBoundingClientRect(), m = /translate3d\((-?[\d.]+)px/.exec(k.track.style.transform || ''), x = m ? -parseFloat(m[1]) : 0;
      const dx = r.x < v.left + 24 ? r.x - v.left - 30 : r.x + r.w > v.right - 24 ? Math.min(r.x - v.left - 30, r.x + r.w - v.right + 30) : 0;
      if (Math.abs(dx) > 2) {
        ph.go(x + dx);
        const t0 = performance.now();
        (function wait() { if (ph.idle() || performance.now() - t0 > 1300) go(s, els, instant); else requestAnimationFrame(wait); })();
        return;
      }
    }
    go(s, els, instant);
  }
  function go(s, els, instant) {
    cam.T = aim(els); cam.on = s; cam.to = 1;
    html.classList.add('cam-on'); back.hidden = false;
    k.slots.forEach((x) => x.el.classList.toggle('in-frame', els.indexOf(x.el) >= 0));
    if (instant || Motion.reduced()) { cam.u = 1; cam.v = 0; paint(); return; }
    loop.kick();
  }
  function step() {
    if (!cam.on) return;
    back.hidden = true; cam.to = 0;
    k.slots.forEach((x) => x.el.classList.remove('in-frame'));
    if (Motion.reduced()) { cam.u = 0; paint(); off(); return; }
    loop.kick();
  }
  const owner = (s) => s.kind === 'chapter' || s.kind === 'figure' ? k.slots.find((x) => x.cluster && x.cluster.indexOf(s) >= 0) || s : s;
  k.slots.forEach((s) => {
    if (s.kind === 'chapter') return;   // a chapter slip is a link: it goes in
    s.swing.addEventListener('click', (e) => { if (e.target.closest('a:not(.paper--chapter),button')) return; e.preventDefault(); if (cam.on !== owner(s)) lean(owner(s)); });
    const t = s.trigger;
    if (t) t.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (cam.on !== owner(s)) lean(owner(s)); else step(); });
  });
  // while the camera is in, the board is not dragged; a press on empty cork steps back
  wrap.addEventListener('pointerdown', (e) => {
    if (!cam.on) return;
    e.stopPropagation();
    if (!e.target.closest('.slot')) step();
  }, true);
  back.addEventListener('click', step);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && cam.on) { e.preventDefault(); step(); } });
  addEventListener('resize', () => { if (cam.on) { cam.T = aim(cam.on.cluster ? cam.on.cluster.map((x) => x.el) : [cam.on.el]); paint(); } });
  return {
    lean, step, owner,
    focusIndex: (i) => lean(owner(k.slots[i])),
    on: () => cam.on,
    leanOn: (id, instant) => { const s = k.slots.find((x) => x.project.id === id && x.kind !== 'chapter' && x.kind !== 'figure'); if (s) lean(s, instant); return s; }
  };
}
