/* lib/gallery/develop.js — instant-film development on first view, and flick vs click
   (design/2026-09-motion/r2-06-develop.js, r2-06-flick.js).

   A print starts as a flat grey-green chemical square. It develops only when its bytes have decoded (img.decode()),
   at least 40% of it is in view, and its peg is on. Development is opacity (the chemical layer clearing) plus filter
   (from flat, warm, desaturated to full): no blur, no sweep. Brightness only ever falls and the chemical only ever
   clears, so no print flashes. Developed ids are kept for the session in sessionStorage (one key, fy-gallery-dev):
   a print develops once, and a reload is calm. Reduced motion shows every print developed. */
const M = window.Motion;
export const KEY = 'fy-gallery-dev';

function F(se, sa, co, br, hu) {
  return 'sepia(' + se + ') saturate(' + sa + ') contrast(' + co + ') brightness(' + br + ') hue-rotate(' + hu + 'deg)';
}
// Shadows arrive first (contrast lifts from a milky base), then colour warms, then it neutralises.
const IMG = [
  { offset: 0, filter: F(0.5, 0.2, 0.26, 1.34, 38) },
  { offset: 0.3, filter: F(0.55, 0.32, 0.5, 1.2, 22) },
  { offset: 0.64, filter: F(0.4, 0.72, 0.8, 1.07, -5) },
  { offset: 1, filter: F(0, 1, 1, 1, 0) }
];
const CHEM = [
  { offset: 0, opacity: 1 }, { offset: 0.2, opacity: 0.8 }, { offset: 0.48, opacity: 0.32 },
  { offset: 0.8, opacity: 0.06 }, { offset: 1, opacity: 0 }
];

export function Develop() {
  this.items = new Set();
  try { this.done = new Set(JSON.parse(sessionStorage.getItem(KEY) || '[]')); } catch (e) { this.done = new Set(); }
  const self = this;
  // Fetch a little ahead of the viewport; develop only once it is actually seen.
  this.near = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) self.load(e.target._dev); });
  }, { rootMargin: '300px 0px' });
  this.seen = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.intersectionRatio >= 0.4) { const s = e.target._dev; s.seen = true; self.maybe(s); } });
  }, { threshold: [0.4] });
  M.onReduced(function (on) { if (on) self.items.forEach(function (s) { s.h.print.classList.remove('undev'); }); });
}

Develop.prototype.add = function (h) {
  const s = { h: h, id: h.p.id, seen: false, decoded: false, loading: false, started: false }, self = this;
  h.el._dev = s; this.items.add(s);
  h.onPeg = function () { self.maybe(s); };   // a print strung but not yet pegged waits
  h.print.classList.toggle('undev', !this.done.has(s.id) && !M.reduced());
  this.near.observe(h.el); this.seen.observe(h.el);
};
// A print left the page (a filter restrung its rope): stop watching it.
Develop.prototype.remove = function (h) {
  const s = h.el._dev; if (!s) return;
  this.near.unobserve(h.el); this.seen.unobserve(h.el); this.items.delete(s);
};

// Opening a print counts as seeing it: behind the viewer the page can't scroll it into view, so it develops in the hand.
Develop.prototype.see = function (h) {
  const s = h.el._dev; if (!s || s.started) return;
  s.seen = true; this.load(s); this.maybe(s);
};

// Bytes are fetched and decoded ahead of the viewport, but off the page: an undeveloped print only paints its photo
// once it starts developing, so a print peeking in at the fold is never the page's largest paint ahead of the h1.
// A print already developed this session shows its photo as soon as it is near.
Develop.prototype.load = function (s) {
  if (s.loading) return; s.loading = true; this.near.unobserve(s.h.el);
  if (!this.items.has(s)) return;
  const self = this, p = s.h.p, im = this.done.has(s.id) ? s.h.img : new Image();
  im.sizes = s.h.img.sizes; im.srcset = p.srcset; im.src = p.src;
  const ok = function () { s.decoded = true; self.maybe(s); };
  im.decode().then(ok, ok);
};
function show(s) { const img = s.h.img; if (!img.getAttribute('src')) { img.srcset = s.h.p.srcset; img.src = s.h.p.src; } }

Develop.prototype.maybe = function (s) {
  if (!s.seen || !s.decoded || s.started || s.h.el.classList.contains('unpegged') || !this.items.has(s)) return;
  s.started = true; this.seen.unobserve(s.h.el); show(s);
  const pr = s.h.print;
  if (this.done.has(s.id) || M.reduced()) { pr.classList.remove('undev'); return; }
  this.done.add(s.id);
  try { sessionStorage.setItem(KEY, JSON.stringify(Array.from(this.done))); } catch (e) { /* private mode */ }
  // Each print's chemistry runs a little differently: a stable per-photo duration, not a choreographed stagger.
  const dur = 2350 + Math.round(Pen.rng('dev' + s.id)() * 500);
  // Once developed the print is plain CSS again (no identity filter left behind).
  [[s.h.img, IMG], [s.h.chem, CHEM]].forEach(function (x) { M.play(x[0], x[1], { duration: dur, easing: 'linear', commit: false }).then(function (a) { a.cancel(); }); });
  pr.classList.remove('undev');
};

/* ---- flick vs click ----
   A mouse or pen crossing a rope or a print fast enough is only recorded; the swing fires 50 ms later, and only if the
   pointer is still travelling by then. Reaching for a photo brakes before it arrives (that is what aiming is), so the
   print you are about to click never starts swinging under the cursor; a pass straight through keeps its speed and
   swings everything it brushed. A press cancels anything pending. Touch never flicks (no hover); on touch the rope
   answers the swipe instead. */
const WAIT = 50, CROSS = 300;

export function Flick(stage, lines, blocked) {
  const self = this, pend = [];
  let last = null, speed = 0, quiet = 0;
  this.feed = function (x, y, t) {
    if (blocked()) { last = null; pend.length = 0; return; }
    if (last && t > last.t && t - last.t < 100) {
      const dt = (t - last.t) / 1000, vx = (x - last.x) / dt, vy = (y - last.y) / dt;
      speed = Math.hypot(vx, vy);
      for (let i = pend.length - 1; i >= 0; i--) {
        const p = pend[i];
        if (t - p.t < WAIT) continue;
        if (speed >= p.exit) p.fire();
        pend.splice(i, 1);
      }
      if (speed >= CROSS) lines().forEach(function (l) {
        const r = l.host.getBoundingClientRect();
        if ((y < r.top - 20 && last.y < r.top - 20) || (y > r.bottom && last.y > r.bottom)) return;
        l.crossings(last.x - r.left, last.y - r.top, x - r.left, y - r.top, vx, vy).forEach(function (c) { c.t = t; pend.push(c); });
      });
      // If the pointer goes quiet (it left the window, or stopped dead), judge by the last speed seen: a flick is
      // still fast on its final event, an approach has already braked.
      clearTimeout(quiet);
      if (pend.length) quiet = setTimeout(function () {
        pend.forEach(function (p) { if (speed >= p.exit) p.fire(); }); pend.length = 0;
      }, WAIT + 30);
    }
    last = { x: x, y: y, t: t };
  };
  this.cancel = function () { pend.length = 0; clearTimeout(quiet); };
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    if (e.buttons) { pend.length = 0; last = null; return; }
    self.feed(e.clientX, e.clientY, e.timeStamp);
  });
  stage.addEventListener('pointerdown', function () { self.cancel(); });
  // Leaving the stage at speed is the clearest flick of all.
  stage.addEventListener('pointerleave', function () {
    if (speed >= 220) pend.forEach(function (p) { p.fire(); });
    pend.length = 0; last = null; speed = 0;
  });
}
