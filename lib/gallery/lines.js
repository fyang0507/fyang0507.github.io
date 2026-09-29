/* lib/gallery/lines.js — the clotheslines (design/2026-09-motion/r2-06-desk.js + r2-06-phone.js).
   Desktop: ropes of up to six prints across the page, developing the first time each is seen, swinging only for a
   genuine flick, unclipped by their pegs into the viewer. Phone (≤760px): every clothesline is its own horizontal
   swipe (scroll-snap, one print centred, the next peeking); swiping accelerates the rope, so the prints lag and swing,
   then settle when the snap lands. A tap that lands while a line is still gliding (it moved in the last 140 ms) only
   stops it. Either way, reaching the end strings the next line instead of a Load more button, until every print is
   up. A filter re-pegs prints onto the same ropes (restring). */
import { Line } from './rope.js';
import { Develop, Flick } from './develop.js';
import { Viewer } from './viewer.js';
const M = window.Motion, FIRST = 3, PER_PHONE = 6, GUARD = 140, NARROW = '(max-width:760px)';
const pad2 = (n) => String(n).padStart(2, '0');

export function Lines(root, onCount) {
  this.root = root; this.rack = root.querySelector('.g-rack'); this.end = root.querySelector('.g-end'); this.onCount = onCount;
  this.photos = []; this.recs = []; this.hung = 0; this.busy = false; this.near = false;
  this.narrow = matchMedia(NARROW); this.dev = new Develop();
  const self = this;
  this.viewer = new Viewer({ seq: function () { return self.seq(); }, onGo: function (l, i) { self.bring(l, i); } });
  this.flick = new Flick(this.rack, function () { return self.phone ? [] : self.recs.map(function (r) { return r.line; }); }, function () { return self.viewer.isOpen; });
  // Stringing is caused by scrolling toward the end, never by a resize or while the viewer is open.
  this.io = new IntersectionObserver(function (es) {
    self.near = es[es.length - 1].isIntersecting; if (self.near) self.more();
  }, { rootMargin: '0px 0px 40px 0px' });
  this.io.observe(this.end);
  let lastW = innerWidth, tm = 0;
  window.addEventListener('resize', function () {
    clearTimeout(tm);
    tm = setTimeout(function () { if (innerWidth !== lastW) { lastW = innerWidth; self.reset(self.hung); } }, 220);
  });
  M.onReduced(function () { self.recs.forEach(function (r) { r.line.rest(); }); });
}

// Lay out the current photos from scratch, without motion: `count` prints (at least three lines' worth) go up at once.
Lines.prototype.reset = function (count) {
  const self = this;
  this.viewer.clearAll();
  this.recs.forEach(function (r) { self.forget(r.line.hangs); r.line.destroy(); r.sec.remove(); });
  this.recs = []; this.hung = 0; this.busy = false;
  this.phone = this.narrow.matches; this.root.setAttribute('data-mode', this.phone ? 'phone' : 'desk');
  this.per = this.phone ? PER_PHONE : Math.max(2, Math.min(6, Math.floor((this.rack.clientWidth - 60) / 172)));
  const lines = Math.max(FIRST, Math.ceil((count || 0) / this.per));
  for (let i = 0; i < lines && this.hung < this.photos.length; i++) this.addLine(false);
  this.update();
};

Lines.prototype.show = function (photos) { this.photos = photos; this.reset(0); };

// A filter changed: the prints come off, and the filtered set is pegged onto the same ropes. Ropes the new set
// doesn't need are taken down; ones it needs (up to three) are strung.
Lines.prototype.restring = function (photos) {
  const self = this;
  this.viewer.clearAll(); this.busy = false; this.photos = photos; this.hung = 0;
  const need = Math.ceil(photos.length / this.per), keep = Math.min(Math.max(FIRST, this.recs.length), need);
  this.recs.splice(keep).forEach(function (r) {
    self.forget(r.line.hangs); r.line.destroy();
    M.play(r.sec, [{ opacity: 1 }, { opacity: 0 }], { duration: 180, commit: false }).then(function () { r.sec.remove(); });
  });
  this.recs.forEach(function (r) {
    const chunk = photos.slice(self.hung, self.hung + self.per);
    self.hung += chunk.length;
    self.forget(r.line.repeg(chunk));
    r.line.hangs.forEach(function (g) { self.dev.add(g); });
    if (r.snaps) { r.sc.scrollLeft = 0; self.snaps(r); }
  });
  while (this.recs.length < keep) this.addLine(true);
  this.update();
  if (this.near) this.more();
};
Lines.prototype.forget = function (hangs) { const dev = this.dev; hangs.forEach(function (g) { dev.remove(g); }); };

Lines.prototype.addLine = function (animated, done) {
  const chunk = this.photos.slice(this.hung, this.hung + this.per), no = this.recs.length + 1, self = this;
  if (!chunk.length) return null;
  this.hung += chunk.length;
  const sec = document.createElement('section'), rec = { sec: sec, no: no, moved: 0 };
  sec.setAttribute('aria-label', 'Line ' + no + ' · 第 ' + no + ' 根绳');
  const onOpen = function (l, i, e) {
    if (!self.phone) { self.flick.cancel(); self.viewer.open(l, i); return; }
    if (e.detail === 0 || performance.now() - rec.moved > GUARD) self.viewer.open(l, i);   // keyboard clicks (detail 0) are never guarded
  };
  let line;
  if (!this.phone) {
    sec.className = 'line-host'; this.rack.appendChild(sec);
    line = new Line(sec, chunk, { cardW: 148, pad: 6, cap: 15, meta: 10, margin: 30, weight: 52, slots: this.per,
      seed: 'd' + no, hidden: animated, sizes: '148px', onOpen: onOpen });
  } else {
    sec.className = 'mline';
    sec.innerHTML = '<div class="mline-head"><span>line ' + pad2(no) + ' · 第 ' + no + ' 根绳</span><span class="mline-count"></span></div>' +
      '<div class="mscroll"><div class="mtrack"></div></div>';
    this.rack.appendChild(sec);
    const sc = rec.sc = sec.querySelector('.mscroll'), track = rec.track = sec.querySelector('.mtrack'), sw = sc.clientWidth;
    const cw = rec.cw = Math.round(Math.min(240, sw * 0.62)), gap = rec.gap = 18;
    rec.count = sec.querySelector('.mline-count');
    line = new Line(track, chunk, { pack: true, cardW: cw, pad: 8, cap: 16, meta: 10.5, gap: gap, lead: (sw - cw) / 2,
      margin: 14, ropeTop: 24, base: 6, weight: 36, seed: 'm' + no, hidden: animated, sizes: cw + 'px', onOpen: onOpen,
      onFocus: function (l, i) { self.center(rec, i); } });
    this.phoneLine(rec);
  }
  rec.line = line;
  line.hangs.forEach(function (g) { self.dev.add(g); });
  if (rec.snaps) this.snaps(rec);
  this.recs.push(rec);
  if (animated) line.string(done); else if (done) done();
  return line;
};

// Phone: snap targets, the swipe's inertia on the prints, the "03 / 06" readout and ← / → along the line.
Lines.prototype.phoneLine = function (rec) {
  const sc = rec.sc, self = this;
  rec.snaps = [];
  let last = { x: 0, t: performance.now(), v: 0 };
  sc.addEventListener('scroll', function () {
    const now = performance.now(), x = sc.scrollLeft, dt = now - last.t;
    if (dt > 120) last.v = 0;
    const v = (x - last.x) / Math.max(8, dt) * 1000, dv = v - last.v;
    rec.line.kickAll(Math.max(-26, Math.min(26, -dv * 0.012)));   // the rope accelerates; the prints lag behind it
    last = { x: x, t: now, v: v }; rec.moved = now;
    self.readout(rec);
  }, { passive: true });
  sc.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const hs = rec.line.hangs, i = hs.findIndex(function (g) { return g.print === document.activeElement; }), j = i + (e.key === 'ArrowRight' ? 1 : -1);
    if (i < 0 || j < 0 || j >= hs.length) return;
    e.preventDefault(); hs[j].print.focus({ preventScroll: true }); self.center(rec, j);
  });
};
// Snap targets are plain boxes where each print hangs (the hangs themselves move with physics).
Lines.prototype.snaps = function (rec) {
  rec.snaps.forEach(function (s) { s.remove(); });
  rec.snaps = rec.line.hangs.map(function (g) {
    const s = document.createElement('span'); s.className = 'msnap';
    s.style.left = (g.x - rec.cw / 2) + 'px'; s.style.width = rec.cw + 'px'; rec.track.appendChild(s);
    return s;
  });
  this.readout(rec);
};
Lines.prototype.readout = function (rec) {
  const n = rec.line.hangs.length, idx = Math.min(n, Math.round(rec.sc.scrollLeft / (rec.cw + rec.gap)) + 1);
  rec.count.textContent = pad2(idx) + ' / ' + pad2(n) + (n > 1 ? ' · swipe →' : '');
};
Lines.prototype.center = function (rec, i) {
  const g = rec.line.hangs[i];
  rec.sc.scrollTo({ left: g.x - rec.sc.clientWidth / 2, behavior: M.reduced() ? 'auto' : 'smooth' });
};

// The end of the lines is near: string another one.
Lines.prototype.more = function () {
  if (this.busy || this.viewer.isOpen || this.hung >= this.photos.length || !this.recs.length) return;
  const self = this; this.busy = true;
  this.addLine(true, function () { self.busy = false; self.update(); if (self.near) self.more(); });
  this.update();
};

Lines.prototype.update = function () {
  const n = this.hung, tot = this.photos.length;
  this.root.setAttribute('data-shown', n); this.root.setAttribute('data-lines', this.recs.length);
  this.end.classList.toggle('full', n >= tot);
  this.end.querySelector('.done').textContent = (tot === 1 ? 'the one print is up' : 'all ' + tot + ' prints are up') + ' · 全部晾好了';
  if (this.onCount) this.onCount(n, tot);
};

Lines.prototype.seq = function () {
  const out = [];
  this.recs.forEach(function (r) { r.line.hangs.forEach(function (g, i) { if (!g.el.classList.contains('unpegged')) out.push([r.line, i]); }); });
  return out;
};
// ← / → in the viewer reached a print on another line: bring that line into view behind the veil (and on the phone
// swipe it to the print), so the print comes off, and later goes back, where you can see it.
Lines.prototype.bring = function (line, i) {
  const rec = this.recs.find(function (r) { return r.line === line; }); if (!rec) return;
  if (rec.sc) this.center(rec, i);
  const r = rec.sec.getBoundingClientRect(), beh = M.reduced() ? 'auto' : 'smooth';
  if (r.top < 70 || r.bottom > innerHeight - 30) window.scrollBy({ top: r.top - Math.max(this.phone ? 40 : 80, (innerHeight - r.height) / 2), behavior: beh });
};

